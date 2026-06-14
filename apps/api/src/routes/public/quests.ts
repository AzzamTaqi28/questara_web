import { Hono } from 'hono';
import { query, queryOne } from '../../db/index.js';
import type { Quest, QuestStop, Place, Stamp } from '../../db/types.js';

const quests = new Hono();

// GET /quests/:id — quest detail with ordered stops and stamps
quests.get('/:id', async (c) => {
  const id = c.req.param('id');

  const quest = await queryOne<Quest>(
    'SELECT * FROM quests WHERE id = $1',
    [id]
  );
  if (!quest) return c.json({ ok: false, error: 'Quest not found' }, 404);

  // Fetch stops with place details
  const stops = await query<(QuestStop & { place: Place })>(
    `SELECT
       qs.*,
       json_build_object(
         'id', p.id,
         'name', p.name,
         'description', p.description,
         'category', p.category,
         'address', p.address,
         'lat', p.lat,
         'lng', p.lng,
         'image_url', p.image_url,
         'opening_hours', p.opening_hours,
         'ticket_price_min', p.ticket_price_min,
         'ticket_price_max', p.ticket_price_max
       ) AS place
     FROM quest_stops qs
     JOIN places p ON p.id = qs.place_id
     WHERE qs.quest_id = $1
     ORDER BY qs.position`,
    [id]
  );

  // Fetch stamps for all places in this quest
  const stamps = await query<Stamp>(
    `SELECT s.*
     FROM stamps s
     JOIN places p ON p.id = s.place_id
     JOIN quest_stops qs ON qs.place_id = p.id
     WHERE qs.quest_id = $1
     ORDER BY s.name`,
    [id]
  );

  return c.json({ ok: true, quest, stops, stamps });
});

export default quests;