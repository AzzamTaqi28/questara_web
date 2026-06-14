import { Hono } from 'hono';
import { query, queryOne } from '../../db/index.js';
import type { City, Place, Quest, QuestStop } from '../../db/types.js';

const cities = new Hono();

// GET /cities — list active cities with place count
cities.get('/', async (c) => {
  const rows = await query<{ id: string; name: string; province: string | null; country: string; lat: number | null; lng: number | null; is_active: boolean; created_at: string; place_count: number }>(
    `SELECT c.*, COUNT(p.id) AS place_count
     FROM cities c
     LEFT JOIN places p ON p.city_id = c.id AND p.verification_status = 'verified'
     WHERE c.is_active = true
     GROUP BY c.id
     ORDER BY c.name`
  );
  return c.json({ ok: true, cities: rows });
});

// GET /cities/:id — city detail with places count
cities.get('/:id', async (c) => {
  const id = c.req.param('id');
  const city = await queryOne<City>('SELECT * FROM cities WHERE id = $1', [id]);
  if (!city) return c.json({ ok: false, error: 'City not found' }, 404);

  const placeCount = await queryOne<{ count: string }>(
    "SELECT COUNT(*) AS count FROM places WHERE city_id = $1 AND verification_status = 'verified'",
    [id]
  );

  return c.json({
    ok: true,
    city: { ...city, place_count: Number(placeCount?.count ?? 0) },
  });
});

// GET /cities/:id/quests — published quests for city
cities.get('/:id/quests', async (c) => {
  const id = c.req.param('id');
  const quests = await query<Quest>(
    'SELECT * FROM quests WHERE city_id = $1 AND is_published = true ORDER BY created_at DESC',
    [id]
  );
  return c.json({ ok: true, quests });
});

// GET /cities/:id/places — verified places for city
cities.get('/:id/places', async (c) => {
  const id = c.req.param('id');
  const places = await query<Place>(
    "SELECT * FROM places WHERE city_id = $1 AND verification_status = 'verified' ORDER BY name",
    [id]
  );
  return c.json({ ok: true, places });
});

export default cities;