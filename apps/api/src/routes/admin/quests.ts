import { Hono } from 'hono';
import { z } from 'zod';
import { query, queryOne } from '../../db/index.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminMiddleware } from '../../middleware/admin.js';
import type { Quest, QuestStop } from '../../db/types.js';

const adminQuests = new Hono();

const CreateQuestSchema = z.object({
  city_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('easy'),
  estimated_duration_minutes: z.number().int().min(1).optional(),
  estimated_budget_min: z.number().int().min(0).optional(),
  estimated_budget_max: z.number().int().min(0).optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  is_published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

const UpdateQuestSchema = CreateQuestSchema.partial();

const CreateStopSchema = z.object({
  place_id: z.string().uuid(),
  position: z.number().int().min(1),
  required: z.boolean().default(true),
  hint: z.string().optional(),
  recommended_duration_minutes: z.number().int().min(1).optional(),
});

const UpdateStopSchema = CreateStopSchema.partial();

const ReorderStopsSchema = z.object({
  stop_ids: z.array(z.string().uuid()),
});

// GET /admin/quests
adminQuests.get('/', authMiddleware, adminMiddleware, async (c) => {
  const limit = z.coerce.number().int().min(1).max(100).parse(c.req.query('limit') ?? '20');
  const offset = z.coerce.number().int().min(0).parse(c.req.query('offset') ?? '0');
  const cityId = c.req.query('city_id');

  let sql = 'SELECT * FROM quests WHERE 1=1';
  const params: unknown[] = [];
  let idx = 1;
  if (cityId) { sql += ` AND city_id = $${idx++}`; params.push(cityId); }
  sql += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const rows = await query<Quest>(sql, params);
  const count = await queryOne<{ count: string }>('SELECT COUNT(*) AS count FROM quests');
  return c.json({ ok: true, quests: rows, total: Number(count?.count ?? 0), limit, offset });
});

// POST /admin/quests
adminQuests.post('/', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = CreateQuestSchema.safeParse(body);
  if (!parsed.success) return c.json({ ok: false, error: 'Invalid input', details: parsed.error.errors }, 400);

  const d = parsed.data;
  const row = await queryOne<Quest>(
    `INSERT INTO quests (city_id, title, description, difficulty, estimated_duration_minutes, estimated_budget_min, estimated_budget_max, cover_image_url, is_published, tags)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [d.city_id, d.title, d.description ?? null, d.difficulty, d.estimated_duration_minutes ?? null, d.estimated_budget_min ?? null, d.estimated_budget_max ?? null, d.cover_image_url || null, d.is_published, d.tags]
  );
  return c.json({ ok: true, quest: row }, 201);
});

// PUT /admin/quests/:id
adminQuests.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = UpdateQuestSchema.safeParse(body);
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

  const row = await queryOne<Quest>(
    `UPDATE quests SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );
  if (!row) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true, quest: row });
});

// DELETE /admin/quests/:id
adminQuests.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const result = await queryOne('DELETE FROM quests WHERE id = $1 RETURNING id', [id]);
  if (!result) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true });
});

// GET /admin/quests/:id/stops
adminQuests.get('/:id/stops', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const rows = await query<QuestStop>(
    'SELECT * FROM quest_stops WHERE quest_id = $1 ORDER BY position',
    [id]
  );
  return c.json({ ok: true, stops: rows });
});

// POST /admin/quests/:id/stops
adminQuests.post('/:id/stops', authMiddleware, adminMiddleware, async (c) => {
  const questId = c.req.param('id');
  const body = await c.req.json();
  const parsed = CreateStopSchema.safeParse(body);
  if (!parsed.success) return c.json({ ok: false, error: 'Invalid input', details: parsed.error.errors }, 400);

  const d = parsed.data;
  const row = await queryOne<QuestStop>(
    `INSERT INTO quest_stops (quest_id, place_id, position, required, hint, recommended_duration_minutes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [questId, d.place_id, d.position, d.required, d.hint ?? null, d.recommended_duration_minutes ?? null]
  );
  return c.json({ ok: true, stop: row }, 201);
});

// PUT /admin/quests/:id/stops/:stopId
adminQuests.put('/:id/stops/:stopId', authMiddleware, adminMiddleware, async (c) => {
  const stopId = c.req.param('stopId');
  const body = await c.req.json();
  const parsed = UpdateStopSchema.safeParse(body);
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
  values.push(stopId);

  const row = await queryOne<QuestStop>(
    `UPDATE quest_stops SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (!row) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true, stop: row });
});

// DELETE /admin/quests/:id/stops/:stopId
adminQuests.delete('/:id/stops/:stopId', authMiddleware, adminMiddleware, async (c) => {
  const stopId = c.req.param('stopId');
  const result = await queryOne('DELETE FROM quest_stops WHERE id = $1 RETURNING id', [stopId]);
  if (!result) return c.json({ ok: false, error: 'Not found' }, 404);
  return c.json({ ok: true });
});

// POST /admin/quests/:id/reorder
adminQuests.post('/:id/reorder', authMiddleware, adminMiddleware, async (c) => {
  const questId = c.req.param('id');
  const body = await c.req.json();
  const parsed = ReorderStopsSchema.safeParse(body);
  if (!parsed.success) return c.json({ ok: false, error: 'Invalid input', details: parsed.error.errors }, 400);

  const { stop_ids } = parsed.data;
  // Update position for each stop in order
  for (let i = 0; i < stop_ids.length; i++) {
    await queryOne(
      'UPDATE quest_stops SET position = $1 WHERE id = $2 AND quest_id = $3 RETURNING id',
      [i + 1, stop_ids[i], questId]
    );
  }

  const rows = await query<QuestStop>(
    'SELECT * FROM quest_stops WHERE quest_id = $1 ORDER BY position',
    [questId]
  );
  return c.json({ ok: true, stops: rows });
});

export default adminQuests;