import { Hono } from 'hono';
import { query, queryOne } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import type { Profile, UserStamp, Stamp, Place, Quest } from '../db/types.js';

const passport = new Hono();

interface StampWithPlace {
  stamp: Stamp;
  place: Place;
  quest: Quest | null;
  earned_at: string;
}

// GET /passport
passport.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user?.profile) return c.json({ ok: false, error: 'Unauthorized' }, 401);

  const profile = await queryOne<Profile>(
    'SELECT id, display_name, avatar_url, xp FROM profiles WHERE id = $1',
    [user.profile.id]
  );
  if (!profile) return c.json({ ok: false, error: 'Profile not found' }, 404);

  // Fetch user's stamps with place and quest info
  const stamps = await query<StampWithPlace>(
    `SELECT
       row_to_json(s) AS stamp,
       row_to_json(p) AS place,
       row_to_json(q) AS quest,
       us.earned_at
     FROM user_stamps us
     JOIN stamps s ON s.id = us.stamp_id
     JOIN places p ON p.id = us.place_id
     LEFT JOIN quests q ON q.id = us.quest_id
     WHERE us.user_id = $1
     ORDER BY us.earned_at DESC`,
    [user.profile.id]
  );

  // Fetch quest progress
  const questProgress = await query<{
    quest_id: string;
    completed_stops: string;
    total_required_stops: string;
  }>(
    `SELECT
       qs.quest_id,
       COUNT(DISTINCT CASE WHEN ci.is_valid = true THEN qs.id END) AS completed_stops,
       COUNT(DISTINCT qs.id) AS total_required_stops
     FROM quest_stops qs
     LEFT JOIN check_ins ci ON ci.place_id = qs.place_id AND ci.quest_id = qs.quest_id AND ci.user_id = $1 AND ci.is_valid = true
     WHERE qs.required = true
     GROUP BY qs.quest_id`,
    [user.profile.id]
  );

  const progress = questProgress.map((qp) => ({
    quest_id: qp.quest_id,
    completed_stops: Number(qp.completed_stops),
    total_required_stops: Number(qp.total_required_stops),
    is_completed: Number(qp.completed_stops) >= Number(qp.total_required_stops),
  }));

  return c.json({
    ok: true,
    user: {
      id: profile.id,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      xp: profile.xp,
    },
    stamps,
    quest_progress: progress,
  });
});

export default passport;