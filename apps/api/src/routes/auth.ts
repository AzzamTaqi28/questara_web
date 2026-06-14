import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';

const auth = new Hono();

// GET /auth/me — return current user profile
auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json({
    ok: true,
    user: {
      id: user.id,
      profile: user.profile,
    },
  });
});

// POST /auth/callback — placeholder for Supabase Auth callback handling
// In production, Supabase handles this via redirect URLs; this endpoint
// exists for custom flows if needed.
auth.post('/callback', async (c) => {
  // Supabase Auth handles token issuance; we just confirm the flow
  return c.json({ ok: true, message: 'Auth callback received' });
});

export default auth;