import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { corsMiddleware, errorMiddleware } from './middleware/index.js';
import { registerRoutes } from './routes/index.js';
import { config } from './config.js';

const app = new Hono();

app.use('*', corsMiddleware);
app.use('*', errorMiddleware);

registerRoutes(app);

app.notFound((c) => c.json({ ok: false, error: 'Not found' }, 404));

const port = config.PORT;
console.log(`Starting Questara API on port ${port}`);

serve({ fetch: app.fetch, port });

export default app;