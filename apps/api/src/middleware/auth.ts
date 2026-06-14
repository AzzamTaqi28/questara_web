import { Context, Next } from 'hono';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { config } from '../config.js';
import { query } from '../db/index.js';
import type { Profile } from '../db/types.js';

interface JWTPayload {
  sub: string; // Supabase user ID (auth_id)
  email?: string;
  aud: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: { id: string; profile: Profile | null };
  }
}

const JWKS = createRemoteJWKSet(
  new URL(`${config.SUPABASE_URL}/auth/v1/jwt keys`)
);

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${config.SUPABASE_URL}/auth/v1`,
      audience: config.SUPABASE_ANON_KEY,
    });

    const jwtPayload = payload as unknown as JWTPayload;

    // Look up the profile by auth_id (Supabase user id)
    const profiles = await query<Profile>(
      'SELECT * FROM profiles WHERE auth_id = $1 LIMIT 1',
      [jwtPayload.sub]
    );

    c.set('user', {
      id: jwtPayload.sub,
      profile: profiles[0] ?? null,
    });

    await next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}