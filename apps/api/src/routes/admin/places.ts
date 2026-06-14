import { Hono } from 'hono';
import { z } from 'zod';
import { query, queryOne } from '../../db/index.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminMiddleware } from '../../middleware/admin.js';
import type { Place } from '../../db/types.js';

const adminPlaces = new Hono();

const CreatePlaceSchema = z.object({
  city_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().min(1).max(100),
  address: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  opening_hours: z.record(z.string()).optional(),
  ticket_price_min: z.number().int().min(0).optional(),
  ticket_price_max: z.number().int().min(0).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  source_url: z.string().url().optional().or(z.literal('')),
  verification_status: z.enum(['draft', 'verified', 'rejected']).default('draft'),
});

const UpdatePlaceSchema = CreatePlaceSchema.partial();

// GET /admin/places
adminPlaces.get('/', authMiddleware, adminMiddleware, async (c) => {
  const limit = z.coerce.number().int().min(1).max(100).parse(c.req.query('limit') ?? '20');
  const offset = z.coerce.number().int().min(0).parse(c.req.query('offset') ?? '0');
  const cityId = c.req.query('city_id');
  const category = c.req.query('category');

  let sql = 'SELECT * FROM places WHERE 1=1';
  const params: unknown[] = [];
  let idx = 1;
  if (cityId) { sql += ` AND city_id = $${idx++}`; params.push(cityId); }
  if (category) { sql += ` AND category = $${idx++}`; params.push(category); }
  sql += ` ORDER BY name LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const rows = await query<Place>(sql, params);
  const count = await queryOne<{ count: string }>('SELECT COUNT(*) AS count FROM places');
  return c.json({ ok: true, places: rows, total: Number(count?.count ?? 0), limit, offset });
});

// POST /admin/places
adminPlaces.post('/', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = CreatePlaceSchema.safeParse(body);
  if (!parsed.success) return c.json({ ok: false, error: 'Invalid input', details: parsed.error.errors }, 400);

  const d = parsed.data;
  const row = await queryOne<Place>(
    `INSERT INTO places (city_id, name, description, category, address, lat, lng, opening_hours, ticket_price_min, ticket_price_max, image_url, source_url, verification_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [d.city_id, d.name, d.description ?? null, d.category, d.address ?? null, d.lat, d.lng, d.opening_hours ?? null, d.ticket_price_min ?? null, d.ticket_price_max ?? null, d.image_url || null, d.source_url || null, d.verification_status]
  );
  return c.json({ ok: true, place: row }, 201);
});

// PUT /admin/places/:id
adminPlaces.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = UpdatePlaceSchema.safeParse(body);
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

  const row = await queryOne<Place>(
    `UPDATE places SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );
  if (!row) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true, place: row });
});

// DELETE /admin/places/:id
adminPlaces.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const result = await queryOne('DELETE FROM places WHERE id = $1 RETURNING id', [id]);
  if (!result) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default adminPlaces;