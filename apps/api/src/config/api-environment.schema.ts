import { z } from 'zod';

export const apiEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  WEB_URL: z.string().trim().min(1).default('http://localhost:3001'),

  DATABASE_URL: z.string().trim().min(1),

  REDIS_HOST: z.string().trim().min(1).default('127.0.0.1'),

  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),

  ENABLE_SWAGGER: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value !== 'false'),
});

export type ApiEnvironment = z.infer<typeof apiEnvironmentSchema>;
