import { Hono } from 'hono';
import { z } from 'zod';
import { query, queryOne } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import type { Submission } from '../db/types.js';

const submissions = new Hono();

const CreateSubmissionSchema = z.object({
  type: z.enum(['event', 'place']),
  title: z.string().min(1).max(255),
  location_text: z.string().optional(),
  date_text: z.string().optional(),
  source_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  city_id: z.string().uuid().optional(),
});

const ReviewSubmissionSchema = z.object({
  status: z.enum(['approved', 'rejected', 'converted']),
  reviewer_notes: z.string().optional(),
});

// POST /submissions — user submits event/place
submissions.post('/', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user?.profile) return c.json({ ok: false, error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const parsed = CreateSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: 'Invalid input', details: parsed.error.errors }, 400);
  }

  const data = parsed.data;

  const row = await queryOne<Submission>(
    `INSERT INTO submissions (user_id, city_id, type, title, location_text, date_text, source_url, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
     RETURNING *`,
    [
      user.profile.id,
      data.city_id ?? null,
      data.type,
      data.title,
      data.location_text ?? null,
      data.date_text ?? null,
      data.source_url || null,
      data.notes ?? null,
    ]
  );

  return c.json({ ok: true, submission: row }, 201);
});

// GET /submissions — user's own submissions (admin sees all via separate admin route)
submissions.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user?.profile) return c.json({ ok: false, error: 'Unauthorized' }, 401);

  const limit = z.coerce.number().int().min(1).max(100).parse(c.req.query('limit') ?? '20');
  const offset = z.coerce.number().int().min(0).parse(c.req.query('offset') ?? '0');

  const isAdmin = user.profile.role === 'admin';
  const userId = isAdmin ? null : user.profile.id; // null signals "all"

  let rows: Submission[] = [];
  let totalCount: number = 0;

  if (isAdmin) {
    // Admin sees all paginated
    rows = await query<Submission>(
      `SELECT * FROM submissions ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const count = await queryOne<{ count: string }>('SELECT COUNT(*) AS count FROM submissions');
    totalCount = Number(count?.count ?? 0);
  } else {
    // User sees their own
    rows = await query<Submission>(
      `SELECT * FROM submissions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [user.profile.id, limit, offset]
    );
    const count = await queryOne<{ count: string }>(
      'SELECT COUNT(*) AS count FROM submissions WHERE user_id = $1',
      [user.profile.id]
    );
    totalCount = Number(count?.count ?? 0);
  }

  return c.json({
    ok: true,
    submissions: rows,
    total: totalCount,
    limit,
    offset,
  });
});

// GET /submissions/:id — single submission (user: own only; admin: any)
submissions.get('/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user?.profile) return c.json({ ok: false, error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const submission = await queryOne<Submission>(
    'SELECT * FROM submissions WHERE id = $1',
    [id]
  );

  if (!submission) return c.json({ ok: false, error: 'Not found' }, 404);

  const isAdmin = user.profile.role === 'admin';
  if (!isAdmin && submission.user_id !== user.profile.id) {
    return c.json({ ok: false, error: 'Not found' }, 404);
  }

  return c.json({ ok: true, submission });
});

export default submissions;