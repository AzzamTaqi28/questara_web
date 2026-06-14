import { Hono } from 'hono';
import { z } from 'zod';
import { pool } from '../db/index.js';
import { query, queryOne } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { calculateDistanceMeters } from '@questara/utils';
import type { Place, Stamp, QuestStop } from '../db/types.js';
import { config } from '../config.js';

const checkin = new Hono();

const CheckInSchema = z.object({
  place_id: z.string().uuid(),
  quest_id: z.string().uuid().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  method: z.enum(['gps', 'qr', 'manual_admin']),
});

const CHECK_IN_RADIUS_METERS = 200;

type CheckInInput = z.infer<typeof CheckInSchema>;

// POST /check-in
checkin.post('/', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user?.profile) {
    return c.json({ ok: false, error: 'User not found' }, 401);
  }

  const body = await c.req.json();
  const parsed = CheckInSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: 'Invalid input', details: parsed.error.errors }, 400);
  }

  const input: CheckInInput = parsed.data;
  const allowedRadius = Number(process.env.CHECK_IN_RADIUS_METERS) || CHECK_IN_RADIUS_METERS;

  // Fetch place
  const place = await queryOne<Place>(
    'SELECT * FROM places WHERE id = $1',
    [input.place_id]
  );
  if (!place) {
    return c.json({ ok: false, error: 'Place not found' }, 404);
  }

  // Calculate distance
  const userLocation = { lat: input.lat, lng: input.lng };
  const placeLocation = { lat: place.lat, lng: place.lng };
  const distanceMeters = calculateDistanceMeters(userLocation, placeLocation);
  const isValid = distanceMeters <= allowedRadius && input.method === 'gps'
    ? distanceMeters <= allowedRadius
    : input.method !== 'gps'; // qr and manual_admin bypass distance check

  // Use transaction for all DB writes
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert check-in record
    const checkInResult = await client.query<{ id: string }>(
      `INSERT INTO check_ins (user_id, place_id, quest_id, lat, lng, method, is_valid, distance_meters)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        user.profile.id,
        input.place_id,
        input.quest_id ?? null,
        input.lat,
        input.lng,
        input.method,
        isValid,
        distanceMeters,
      ]
    );

    if (!isValid) {
      await client.query('COMMIT');
      return c.json({
        ok: true,
        valid: false,
        distance_meters: distanceMeters,
        allowed_radius_meters: allowedRadius,
        message: 'You are too far from this place to check in.',
      });
    }

    // Fetch stamp(s) linked to this place
    const stamps = await client.query<Stamp>(
      'SELECT * FROM stamps WHERE place_id = $1',
      [input.place_id]
    );

    let stampAwarded = false;
    let stamp: Stamp | null = null;
    let xpAwarded = 0;
    let questCompleted = false;

    if (stamps.rows.length > 0) {
      // Take the first stamp for this place
      stamp = stamps.rows[0];

      // Check if user already has this stamp for this quest
      const existing = await client.query(
        `SELECT id FROM user_stamps
         WHERE user_id = $1 AND stamp_id = $2 AND (quest_id = $3 OR (quest_id IS NULL AND $3::uuid IS NULL))`,
        [user.profile.id, stamp.id, input.quest_id ?? null]
      );

      if (existing.rows.length === 0) {
        // Award stamp
        await client.query(
          `INSERT INTO user_stamps (user_id, stamp_id, place_id, quest_id)
           VALUES ($1, $2, $3, $4)`,
          [user.profile.id, stamp.id, input.place_id, input.quest_id ?? null]
        );
        stampAwarded = true;
        xpAwarded = 50;

        // Award XP
        await client.query(
          'UPDATE profiles SET xp = xp + $1, updated_at = NOW() WHERE id = $2',
          [xpAwarded, user.profile.id]
        );
      }
    }

    // Check quest completion if quest_id provided
    if (input.quest_id) {
      // Count required stops for this quest
      const requiredStops = await client.query<{ count: string }>(
        'SELECT COUNT(*) AS count FROM quest_stops WHERE quest_id = $1 AND required = true',
        [input.quest_id]
      );
      const totalRequiredStops = Number(requiredStops.rows[0]?.count ?? 0);

      if (totalRequiredStops > 0) {
        // Count distinct required stops where user has valid check-in
        const completedStops = await client.query<{ count: string }>(
          `SELECT COUNT(DISTINCT qs.id) AS count
           FROM quest_stops qs
           JOIN check_ins ci ON ci.place_id = qs.place_id
             AND ci.quest_id = qs.quest_id
             AND ci.user_id = $1
             AND ci.is_valid = true
           WHERE qs.quest_id = $2 AND qs.required = true`,
          [user.profile.id, input.quest_id]
        );
        const completedRequiredStops = Number(completedStops.rows[0]?.count ?? 0);

        if (completedRequiredStops >= totalRequiredStops) {
          // Check if completion XP already awarded (look for user_stamp with quest context)
          // We use the presence of user_stamps for this quest as indicator of completion
          const completionAwarded = await client.query(
            `SELECT id FROM user_stamps
             WHERE user_id = $1 AND quest_id = $2
             LIMIT 1`,
            [user.profile.id, input.quest_id]
          );

          // Award completion XP once — we add +200 on top of any existing XP
          // To avoid double-awarding, we check if a high-xp transaction exists.
          // Simpler: award if stampAwarded (first time completing) OR if we detect new completion
          // The safest approach: check if quest_completion check-in already exists
          // For MVP, just always award when completing if this is the triggering check-in
          // Use the newly inserted check-in as the trigger
          const alreadyCompleted = await client.query(
            `SELECT id FROM check_ins
             WHERE user_id = $1 AND quest_id = $2 AND is_valid = true AND id != $3
             LIMIT 1`,
            [user.profile.id, input.quest_id, checkInResult.rows[0].id]
          );

          if (alreadyCompleted.rows.length > 0) {
            // Already had valid check-ins before this one — completion already processed
            questCompleted = false;
          } else {
            // This is the completing check-in — award XP
            await client.query(
              'UPDATE profiles SET xp = xp + $1, updated_at = NOW() WHERE id = $2',
              [200, user.profile.id]
            );
            xpAwarded += 200;
            questCompleted = true;
          }
        }
      }
    }

    await client.query('COMMIT');

    // Build progress
    let progress: { completed_stops: number; total_required_stops: number } | null = null;
    if (input.quest_id) {
      const total = await queryOne<{ count: string }>(
        'SELECT COUNT(*) AS count FROM quest_stops WHERE quest_id = $1 AND required = true',
        [input.quest_id]
      );
      const completed = await queryOne<{ count: string }>(
        `SELECT COUNT(DISTINCT qs.id) AS count
         FROM quest_stops qs
         JOIN check_ins ci ON ci.place_id = qs.place_id AND ci.quest_id = qs.quest_id AND ci.user_id = $1 AND ci.is_valid = true
         WHERE qs.quest_id = $2 AND qs.required = true`,
        [user.profile.id, input.quest_id]
      );
      progress = {
        completed_stops: Number(completed?.count ?? 0),
        total_required_stops: Number(total?.count ?? 0),
      };
    }

    return c.json({
      ok: true,
      valid: true,
      distance_meters: distanceMeters,
      allowed_radius_meters: allowedRadius,
      stamp_awarded: stampAwarded,
      xp_awarded: xpAwarded,
      quest_completed: questCompleted,
      stamp: stamp ? {
        id: stamp.id,
        name: stamp.name,
        image_url: stamp.image_url,
        rarity: stamp.rarity,
      } : null,
      progress,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

export default checkin;