import { z } from 'zod';

/**
 * Type-safe environment schema with strict validation.
 * Fails fast at application/server boot if critical secrets or configs are missing or malformed.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  SESSION_SECRET: z.string().min(16).default('cycloneshield_default_session_secret_32chars!'),
  GEMINI_API_KEY: z.string().optional(),
  GEE_SERVICE_ACCOUNT_BASE64: z.string().optional(),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: z.string().default('*'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables against schema and returns typed configuration.
 */
export function getValidatedEnv(customEnv: Record<string, any> = process.env): Env {
  const parsed = envSchema.safeParse(customEnv);

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error(`\x1b[31m[CycloneShield Config Error] Environment validation failed:\n${errorDetails}\x1b[0m`);
    throw new Error(`Invalid environment configuration:\n${errorDetails}`);
  }

  return parsed.data;
}

export const env = getValidatedEnv();
