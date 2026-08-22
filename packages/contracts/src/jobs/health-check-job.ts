import type { JobEnvelope } from "../job-envelope";
import { HEALTH_CHECK_JOB } from "./health-check.constants";

export interface HealthCheckJobPayload {
  readonly probe: "ping";
}

export interface HealthCheckJobResult {
  readonly status: "ok";
  readonly processedAt: string;
  readonly workerId: string;
}

export type HealthCheckJobV1 = JobEnvelope<
  typeof HEALTH_CHECK_JOB.name,
  typeof HEALTH_CHECK_JOB.version,
  HealthCheckJobPayload
>;
