import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(8888),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  SESSION_COOKIE_NAME: z.string().default('guiasai_session'),
  SESSION_COOKIE_DOMAIN: z.string().optional(),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(168),
  AUTH_BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-3-flash-preview'),
  GEMINI_FALLBACK_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_IMAGE_MODEL: z.string().default('gemini-3.1-flash-image-preview'),
  GEMINI_IMAGE_FALLBACK_MODEL: z
    .string()
    .default('gemini-2.5-flash-image-preview'),
  SENTRY_DSN: z
    .string()
    .transform((v) => (v === '' ? undefined : v))
    .pipe(z.string().url().optional()),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment configuration:\n${parsedEnv.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n')}`,
  );
}

export const env = parsedEnv.data;

export function getRedisConnection() {
  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
  };
}
