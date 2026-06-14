import { Hono } from 'hono';
import { z } from 'zod';
import { query, queryOne } from '../../db/index.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminMiddleware } from '../../middleware/admin.js';
import type { Submission } from '../../db/types.js';

const adminSubmissions = new Hono();

const ReviewSubmissionSchema = z.object({
  status: z.enum(['approved', 'rejected', 'converted']),
  reviewer_notes: z.string().optional(),
});

// GET /admin/submissions — all submissions paginated
adminSubmissions.get('/', authMiddleware, adminMiddleware, async (c) => {
  const limit = z.coerce.number().int().min(1).max(100).parse(c.req.query('limit') ?? '20');
  const offset = z.coerce.number().int().min(0).parse(c.req.query('offset') ?? '0');
  const status = c.req.query('status');

  let sql = 'SELECT * FROM submissions WHERE 1=1';
  const params: unknown[] = [];
  let idx = 1;
  if (status) { sql += ` AND status = $${idx++}`; params.push(status); }
  sql += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const rows = await query<Submission>(sql, params);
  const count = await queryOne<{ count: string }>('SELECT COUNT(*) AS count FROM submissions');
  return c.json({ ok: true, submissions: rows, total: Number(count?.count ?? 0), limit, offset });
});

// PUT /admin/submissions/:id — review submission
adminSubmissions.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = ReviewSubmissionSchema.safeParse(body);
  if (!parsed.success) return c.json({ ok: false, error: 'Invalid input', details: parsed.error.errors }, 400);

  const { status } = parsed.data;
  const reviewerNotes = parsed.data.reviewer_notes ?? null;

  const row = await queryOne<Submission>(
    `UPDATE submissions SET status = $1, reviewed_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  if (!row) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true, submission: row });
});

export default adminSubmissions;