import { Hono } from 'hono';
import { query, queryOne } from '../../db/index.js';
import type { Event } from '../../db/types.js';

const events = new Hono();

// GET /events/:id — event detail
events.get('/:id', async (c) => {
  const id = c.req.param('id');
  const event = await queryOne<Event>(
    'SELECT * FROM events WHERE id = $1',
    [id]
  );
  if (!event) return c.json({ ok: false, error: 'Event not found' }, 404);
  return c.json({ ok: true, event });
});

export default events;