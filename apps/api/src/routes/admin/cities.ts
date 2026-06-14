import { Hono } from 'hono';
import { z } from 'zod';
import { query, queryOne } from '../../db/index.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminMiddleware } from '../../middleware/admin.js';
import type { City } from '../../db/types.js';

const adminCities = new Hono();

const CreateCitySchema = z.object({
  name: z.string().min(1).max(255),
  province: z.string().optional(),
  country: z.string().default('Indonesia'),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  is_active: z.boolean().default(true),
});

const UpdateCitySchema = CreateCitySchema.partial();

// GET /admin/cities — all cities paginated
adminCities.get('/', authMiddleware, adminMiddleware, async (c) => {
  const limit = z.coerce.number().int().min(1).max(100).parse(c.req.query('limit') ?? '20');
  const offset = z.coerce.number().int().min(0).parse(c.req.query('offset') ?? '0');

  const rows = await query<City>(
    'SELECT * FROM cities ORDER BY name LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  const count = await queryOne<{ count: string }>('SELECT COUNT(*) AS count FROM cities');

  return c.json({ ok: true, cities: rows, total: Number(count?.count ?? 0), limit, offset });
});

// POST /admin/cities
adminCities.post('/', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = CreateCitySchema.safeParse(body);
  if (!parsed.success) return c.json({ ok: false, error: 'Invalid input', details: parsed.error.errors }, 400);

  const row = await queryOne<City>(
    `INSERT INTO cities (name, province, country, lat, lng, is_active)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [parsed.data.name, parsed.data.province ?? null, parsed.data.country, parsed.data.lat ?? null, parsed.data.lng ?? null, parsed.data.is_active]
  );
  return c.json({ ok: true, city: row }, 201);
});

// PUT /admin/cities/:id
adminCities.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = UpdateCitySchema.safeParse(body);
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

  const row = await queryOne<City>(
    `UPDATE cities SET ${sets.join(', ')}, created_at = created_at WHERE id = $${idx} RETURNING *`,
    values
  );
  if (!row) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true, city: row });
});

// DELETE /admin/cities/:id
adminCities.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const result = await queryOne('DELETE FROM cities WHERE id = $1 RETURNING id', [id]);
  if (!result) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default adminCities;