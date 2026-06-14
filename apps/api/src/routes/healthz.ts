import { Hono } from 'hono';
import { pool } from '../db/index.js';

const healthz = new Hono();

healthz.get('/', async (c) => {
  try {
    // Check DB connectivity
    await pool.query('SELECT 1');
    return c.json({ ok: true, database: 'connected' });
  } catch {
    return c.json({ ok: true, database: 'disconnected' });
  }
});

export default healthz;