import { Hono } from 'hono';
import { query, queryOne } from '../../db/index.js';
import type { Place, Event } from '../../db/types.js';

const places = new Hono();

// GET /places/:id — place detail
places.get('/:id', async (c) => {
  const id = c.req.param('id');
  const place = await queryOne<Place>(
    'SELECT * FROM places WHERE id = $1',
    [id]
  );
  if (!place) return c.json({ ok: false, error: 'Place not found' }, 404);
  return c.json({ ok: true, place });
});

// GET /places/:id/events — published events for place
places.get('/:id/events', async (c) => {
  const id = c.req.param('id');
  const events = await query<Event>(
    "SELECT * FROM events WHERE place_id = $1 AND status = 'published' ORDER BY start_time",
    [id]
  );
  return c.json({ ok: true, events });
});

export default places;