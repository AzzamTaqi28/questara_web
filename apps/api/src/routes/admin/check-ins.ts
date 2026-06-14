import { Hono } from 'hono';
import { z } from 'zod';
import { query, queryOne } from '../../db/index.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminMiddleware } from '../../middleware/admin.js';
import type { CheckIn } from '../../db/types.js';

const adminCheckIns = new Hono();

// GET /admin/check-ins — all check-ins with metrics
adminCheckIns.get('/', authMiddleware, adminMiddleware, async (c) => {
  const limit = z.coerce.number().int().min(1).max(100).parse(c.req.query('limit') ?? '20');
  const offset = z.coerce.number().int().min(0).parse(c.req.query('offset') ?? '0');
  const userId = c.req.query('user_id');
  const placeId = c.req.query('place_id');
  const validOnly = c.req.query('valid') === 'true';

  let sql = `SELECT ci.*, p.name AS place_name, pr.display_name AS user_name
             FROM check_ins ci
             JOIN places p ON p.id = ci.place_id
             JOIN profiles pr ON pr.id = ci.user_id
             WHERE 1=1`;
  const params: unknown[] = [];
  let idx = 1;
  if (userId) { sql += ` AND ci.user_id = $${idx++}`; params.push(userId); }
  if (placeId) { sql += ` AND ci.place_id = $${idx++}`; params.push(placeId); }
  if (validOnly) { sql += ` AND ci.is_valid = true`; }
  sql += ` ORDER BY ci.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const rows = await query<CheckIn & { place_name: string; user_name: string }>(sql, params);
  const count = await queryOne<{ count: string }>('SELECT COUNT(*) AS count FROM check_ins');

  // Summary metrics
  const metrics = await queryOne<{
    total: string;
    valid_count: string;
    invalid_count: string;
    unique_users: string;
    unique_places: string;
  }>(`SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE is_valid = true) AS valid_count,
        COUNT(*) FILTER (WHERE is_valid = false) AS invalid_count,
        COUNT(DISTINCT user_id) AS unique_users,
        COUNT(DISTINCT place_id) AS unique_places
       FROM check_ins`);

  return c.json({
    ok: true,
    check_ins: rows,
    total: Number(count?.count ?? 0),
    metrics: {
      total: Number(metrics?.total ?? 0),
      valid_count: Number(metrics?.valid_count ?? 0),
      invalid_count: Number(metrics?.invalid_count ?? 0),
      unique_users: Number(metrics?.unique_users ?? 0),
      unique_places: Number(metrics?.unique_places ?? 0),
    },
    limit,
    offset,
  });
});

export default adminCheckIns;