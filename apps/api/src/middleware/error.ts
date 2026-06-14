import { Context, Next } from 'hono';
import { ZodError } from 'zod';

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    console.error('Unhandled error:', err);

    if (err instanceof ZodError) {
      return c.json(
        { ok: false, error: 'Validation error', details: err.errors },
        400
      );
    }

    if (err instanceof Error) {
      return c.json({ ok: false, error: err.message }, 500);
    }

    return c.json({ ok: false, error: 'Internal server error' }, 500);
  }
}