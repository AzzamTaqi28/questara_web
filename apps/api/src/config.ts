import { z } from 'zod';

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  AI_PROVIDER: z.enum(['mock', 'openai', 'anthropic']).default('mock'),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

function loadConfig() {
  const result = configSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    throw new Error(`Invalid env config:\n${errors.join('\n')}`);
  }
  return result.data;
}

export const config = loadConfig();
export type Config = z.infer<typeof configSchema>;