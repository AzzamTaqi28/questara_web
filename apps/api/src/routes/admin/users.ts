import { Hono } from 'hono';
import { z } from 'zod';
import { query, queryOne } from '../../db/index.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminMiddleware } from '../../middleware/admin.js';
import type { Profile } from '../../db/types.js';

const adminUsers = new Hono();

// GET /admin/users — all users with XP and stamp counts
adminUsers.get('/', authMiddleware, adminMiddleware, async (c) => {
  const limit = z.coerce.number().int().min(1).max(100).parse(c.req.query('limit') ?? '20');
  const offset = z.coerce.number().int().min(0).parse(c.req.query('offset') ?? '0');

  const rows = await query<Profile & { stamp_count: string; check_in_count: string }>(
    `SELECT
       p.*,
       COUNT(DISTINCT us.id) AS stamp_count,
       COUNT(DISTINCT ci.id) AS check_in_count
     FROM profiles p
     LEFT JOIN user_stamps us ON us.user_id = p.id
     LEFT JOIN check_ins ci ON ci.user_id = p.id
     GROUP BY p.id
     ORDER BY p.xp DESC NULLS LAST
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const count = await queryOne<{ count: string }>('SELECT COUNT(*) AS count FROM profiles');

  return c.json({
    ok: true,
    users: rows.map((u) => ({
      ...u,
      stamp_count: Number(u.stamp_count),
      check_in_count: Number(u.check_in_count),
    })),
    total: Number(count?.count ?? 0),
    limit,
    offset,
  });
});

export default adminUsers;