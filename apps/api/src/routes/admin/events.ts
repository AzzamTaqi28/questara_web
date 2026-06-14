import { Hono } from 'hono';
import { z } from 'zod';
import { query, queryOne } from '../../db/index.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminMiddleware } from '../../middleware/admin.js';
import type { Event } from '../../db/types.js';

const adminEvents = new Hono();

const CreateEventSchema = z.object({
  city_id: z.string().uuid(),
  place_id: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  price_min: z.number().int().min(0).optional(),
  price_max: z.number().int().min(0).optional(),
  source_url: z.string().url().optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'expired', 'rejected']).default('draft'),
});

const UpdateEventSchema = CreateEventSchema.partial();

// GET /admin/events
adminEvents.get('/', authMiddleware, adminMiddleware, async (c) => {
  const limit = z.coerce.number().int().min(1).max(100).parse(c.req.query('limit') ?? '20');
  const offset = z.coerce.number().int().min(0).parse(c.req.query('offset') ?? '0');
  const cityId = c.req.query('city_id');
  const status = c.req.query('status');

  let sql = 'SELECT * FROM events WHERE 1=1';
  const params: unknown[] = [];
  let idx = 1;
  if (cityId) { sql += ` AND city_id = $${idx++}`; params.push(cityId); }
  if (status) { sql += ` AND status = $${idx++}`; params.push(status); }
  sql += ` ORDER BY start_time DESC NULLS LAST LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const rows = await query<Event>(sql, params);
  const count = await queryOne<{ count: string }>('SELECT COUNT(*) AS count FROM events');
  return c.json({ ok: true, events: rows, total: Number(count?.count ?? 0), limit, offset });
});

// POST /admin/events
adminEvents.post('/', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = CreateEventSchema.safeParse(body);
  if (!parsed.success) return c.json({ ok: false, error: 'Invalid input', details: parsed.error.errors }, 400);

  const d = parsed.data;
  const row = await queryOne<Event>(
    `INSERT INTO events (city_id, place_id, title, description, start_time, end_time, price_min, price_max, source_url, image_url, tags, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [d.city_id, d.place_id ?? null, d.title, d.description ?? null, d.start_time ?? null, d.end_time ?? null, d.price_min ?? null, d.price_max ?? null, d.source_url || null, d.image_url || null, d.tags, d.status]
  );
  return c.json({ ok: true, event: row }, 201);
});

// PUT /admin/events/:id
adminEvents.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = UpdateEventSchema.safeParse(body);
  if (!parsed.success) return c.json({ ok: false, error: 'Invalid input', details: parsed.error.errors }, 400);

  const fields = parsed.data;
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  for (const [key, val] of Object.entries(fields)) {
    sets.push(`${key} = $${idx++}`);
    values.push(val);
  }
  if (sets.length === 0) return c.json({ ok: false, error: 'No fields to update' }, 400);
  values.push(id);

  const row = await queryOne<Event>(
    `UPDATE events SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );
  if (!row) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true, event: row });
});

// DELETE /admin/events/:id
adminEvents.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const result = await queryOne('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
  if (!result) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default adminEvents;