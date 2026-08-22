import { z } from "zod";

export const workerEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  REDIS_HOST: z.string().trim().min(1).default("127.0.0.1"),

  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),

  WORKER_ID: z.string().trim().min(1).default("worker-local-1"),
});

export type WorkerEnvironment = z.infer<typeof workerEnvironmentSchema>;
