import { Hono } from 'hono';
import { z } from 'zod';
import { query, queryOne } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { MockAIProvider } from '@questara/ai';
import type { City, Place, Event, Quest, QuestStop, Itinerary } from '../db/types.js';

const itineraries = new Hono();

const GenerateItinerarySchema = z.object({
  city_id: z.string().uuid(),
  quest_id: z.string().uuid().optional(),
  start_location_text: z.string().optional(),
  available_hours: z.number().int().min(1).max(24),
  budget_idr: z.number().int().min(0),
  preferences: z.array(z.string()).default([]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
});

// GET /itineraries — user's saved itineraries
itineraries.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user?.profile) return c.json({ ok: false, error: 'Unauthorized' }, 401);

  const limit = z.coerce.number().int().min(1).max(100).parse(c.req.query('limit') ?? '20');
  const offset = z.coerce.number().int().min(0).parse(c.req.query('offset') ?? '0');

  const rows = await query<Itinerary>(
    `SELECT * FROM itineraries WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [user.profile.id, limit, offset]
  );

  const countResult = await queryOne<{ count: string }>(
    'SELECT COUNT(*) AS count FROM itineraries WHERE user_id = $1',
    [user.profile.id]
  );

  return c.json({
    ok: true,
    itineraries: rows,
    total: Number(countResult?.count ?? 0),
    limit,
    offset,
  });
});

// POST /itineraries — generate and save new itinerary
itineraries.post('/', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user?.profile) return c.json({ ok: false, error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const parsed = GenerateItinerarySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: 'Invalid input', details: parsed.error.errors }, 400);
  }

  const input = parsed.data;

  // Fetch city
  const city = await queryOne<City>('SELECT * FROM cities WHERE id = $1', [input.city_id]);
  if (!city) return c.json({ ok: false, error: 'City not found' }, 404);

  // Fetch verified places for city
  const places = await query<Place>(
    "SELECT * FROM places WHERE city_id = $1 AND verification_status = 'verified' ORDER BY name",
    [input.city_id]
  );

  // Fetch published events
  const events = await query<Event>(
    `SELECT * FROM events
     WHERE city_id = $1 AND status = 'published'
     AND (start_time IS NULL OR start_time > NOW())
     ORDER BY start_time`,
    [input.city_id]
  );

  // Fetch quest stops if quest selected
  let questStops: QuestStop[] = [];
  let quest: Quest | null = null;
  if (input.quest_id) {
    quest = await queryOne<Quest>('SELECT * FROM quests WHERE id = $1', [input.quest_id]);
    if (quest) {
      questStops = await query<QuestStop>(
        `SELECT qs.*, p.name AS place_name
         FROM quest_stops qs
         JOIN places p ON p.id = qs.place_id
         WHERE qs.quest_id = $1
         ORDER BY qs.position`,
        [input.quest_id]
      );
    }
  }

  // Build context for AI
  const aiInput = {
    city_id: input.city_id,
    quest_id: input.quest_id,
    start_location_text: input.start_location_text,
    available_hours: input.available_hours,
    budget_idr: input.budget_idr,
    preferences: input.preferences,
    date: input.date,
  };

  // Call AI provider
  let plan: Record<string, unknown>;
  let aiWarning: string | null = null;

  try {
    const aiProvider = MockAIProvider.getInstance();
    const result = await aiProvider.generateItinerary(aiInput);

    if (!result.ok || !result.plan) {
      throw new Error('AI provider returned invalid result');
    }

    // Validate that all place_ids in the plan exist in our context
    const placeIds = new Set(places.map((p) => p.id));
    const invalidStops = result.plan.stops.filter((s) => !placeIds.has(s.place_id));

    if (invalidStops.length > 0) {
      aiWarning = `AI returned ${invalidStops.length} place(s) not in database. Falling back to rule-based itinerary.`;
      throw new Error(aiWarning);
    }

    plan = {
      title: result.plan.title,
      summary: result.plan.summary,
      total_estimated_budget_idr: result.plan.total_estimated_budget_idr,
      total_estimated_duration_minutes: result.plan.total_estimated_duration_minutes,
      stops: result.plan.stops.map((s) => ({
        order: s.order,
        time: s.time,
        place_id: s.place_id,
        place_name: s.place_name,
        activity: s.activity,
        duration_minutes: s.duration_minutes,
        estimated_budget_idr: s.estimated_budget_idr,
        transport_note: s.transport_note,
        check_in_available: s.check_in_available,
      })),
      warnings: result.plan.warnings,
    };
  } catch (_err) {
    // Fallback to heuristic route
    aiWarning = 'AI generation unavailable. Showing rule-based itinerary.';
    plan = buildHeuristicItinerary(input, places, events, questStops, quest);
  }

  if (aiWarning) {
    (plan as Record<string, unknown>).warnings = [
      ...((plan as { warnings?: string[] }).warnings ?? []),
      aiWarning,
    ];
  }

  // Save itinerary
  const saved = await queryOne<Itinerary>(
    `INSERT INTO itineraries (user_id, quest_id, title, input_preferences, plan)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      user.profile.id,
      input.quest_id ?? null,
      (plan as { title?: string }).title ?? 'Generated Itinerary',
      {
        city_id: input.city_id,
        available_hours: input.available_hours,
        budget_idr: input.budget_idr,
        preferences: input.preferences,
        date: input.date,
      },
      plan,
    ]
  );

  return c.json({
    ok: true,
    itinerary_id: saved?.id,
    plan,
  });
});

/**
 * Build a heuristic/fallback itinerary when AI is unavailable.
 */
function buildHeuristicItinerary(
  input: z.infer<typeof GenerateItinerarySchema>,
  places: Place[],
  events: Event[],
  questStops: QuestStop[],
  quest: Quest | null
): Record<string, unknown> {
  const maxStops = Math.min(
    Math.floor(input.available_hours / 1.5),
    places.length,
    10
  );

  let stops: Array<Record<string, unknown>>;

  if (quest && questStops.length > 0) {
    // Use quest stop order
    stops = questStops.slice(0, maxStops).map((qs, i) => {
      const place = places.find((p) => p.id === qs.place_id);
      return {
        order: i + 1,
        time: `${9 + i * 2}:00`,
        place_id: qs.place_id,
        place_name: place?.name ?? 'Unknown Place',
        activity: qs.hint ?? `Kunjungi ${place?.name ?? 'tempat ini'}`,
        duration_minutes: qs.recommended_duration_minutes ?? 60,
        estimated_budget_idr: place?.ticket_price_min ?? 0,
        transport_note: i > 0 ? 'Lanjutkan ke tempat berikutnya.' : 'Mulai di sini.',
        check_in_available: true,
      };
    });
  } else {
    // Sort by preference match
    const scored = places.map((p) => {
      let score = 0;
      const cat = p.category.toLowerCase();
      for (const pref of input.preferences) {
        if (cat.includes(pref.toLowerCase())) score += 2;
      }
      return { place: p, score };
    });
    scored.sort((a, b) => b.score - a.score);

    stops = scored.slice(0, maxStops).map((s, i) => {
      const p = s.place;
      return {
        order: i + 1,
        time: `${9 + i * 2}:00`,
        place_id: p.id,
        place_name: p.name,
        activity: `Jelajahi ${p.name}`,
        duration_minutes: 60,
        estimated_budget_idr: p.ticket_price_min ?? 0,
        transport_note: null,
        check_in_available: true,
      };
    });
  }

  const totalDuration = stops.reduce(
    (sum: number, s: Record<string, unknown>) => sum + ((s.duration_minutes as number) ?? 0),
    0
  );
  const totalBudget = stops.reduce(
    (sum: number, s: Record<string, unknown>) => sum + ((s.estimated_budget_idr as number) ?? 0),
    0
  );

  return {
    title: quest?.title ?? `${input.available_hours} Jam di ${'Surabaya'}`,
    summary: 'Itinerary dibuat menggunakan pendekatan heuristik karena AI tidak tersedia.',
    total_estimated_budget_idr: totalBudget,
    total_estimated_duration_minutes: totalDuration,
    stops,
    warnings: ['AI generation unavailable. Showing rule-based itinerary.'],
  };
}

export default itineraries;