import { Context, Next } from 'hono';

export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get('user');
  if (!user?.profile || user.profile.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
}