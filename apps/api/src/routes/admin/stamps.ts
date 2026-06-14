import { Hono } from 'hono';
import { z } from 'zod';
import { query, queryOne } from '../../db/index.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminMiddleware } from '../../middleware/admin.js';
import type { Stamp } from '../../db/types.js';

const adminStamps = new Hono();

const CreateStampSchema = z.object({
  place_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']).default('common'),
});

const UpdateStampSchema = CreateStampSchema.partial();

// GET /admin/stamps
adminStamps.get('/', authMiddleware, adminMiddleware, async (c) => {
  const limit = z.coerce.number().int().min(1).max(100).parse(c.req.query('limit') ?? '20');
  const offset = z.coerce.number().int().min(0).parse(c.req.query('offset') ?? '0');
  const placeId = c.req.query('place_id');

  let sql = 'SELECT * FROM stamps WHERE 1=1';
  const params: unknown[] = [];
  let idx = 1;
  if (placeId) { sql += ` AND place_id = $${idx++}`; params.push(placeId); }
  sql += ` ORDER BY name LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const rows = await query<Stamp>(sql, params);
  const count = await queryOne<{ count: string }>('SELECT COUNT(*) AS count FROM stamps');
  return c.json({ ok: true, stamps: rows, total: Number(count?.count ?? 0), limit, offset });
});

// POST /admin/stamps
adminStamps.post('/', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = CreateStampSchema.safeParse(body);
  if (!parsed.success) return c.json({ ok: false, error: 'Invalid input', details: parsed.error.errors }, 400);

  const d = parsed.data;
  const row = await queryOne<Stamp>(
    `INSERT INTO stamps (place_id, name, description, image_url, rarity)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [d.place_id, d.name, d.description ?? null, d.image_url || null, d.rarity]
  );
  return c.json({ ok: true, stamp: row }, 201);
});

// PUT /admin/stamps/:id
adminStamps.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = UpdateStampSchema.safeParse(body);
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

  const row = await queryOne<Stamp>(
    `UPDATE stamps SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (!row) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true, stamp: row });
});

// DELETE /admin/stamps/:id
adminStamps.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const result = await queryOne('DELETE FROM stamps WHERE id = $1 RETURNING id', [id]);
  if (!result) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default adminStamps;