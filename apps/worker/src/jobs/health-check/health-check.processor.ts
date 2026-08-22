import { Processor, WorkerHost } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";
import {
  HEALTH_CHECK_JOB,
  type HealthCheckJobResult,
  type HealthCheckJobV1,
} from "@dns-smart-factory/contracts";
import type { WorkerEnvironment } from "../../config/worker-environment.schema";

@Processor(HEALTH_CHECK_JOB.queue)
export class HealthCheckProcessor extends WorkerHost {
  public constructor(
    private readonly configService: ConfigService<WorkerEnvironment, true>,
  ) {
    super();
  }

  public async process(
    job: Job<
      HealthCheckJobV1,
      HealthCheckJobResult,
      typeof HEALTH_CHECK_JOB.name
    >,
  ): Promise<HealthCheckJobResult> {
    if (job.name !== HEALTH_CHECK_JOB.name) {
      throw new Error(`Unsupported job: ${job.name}`);
    }

    if (
      job.data.name !== HEALTH_CHECK_JOB.name ||
      job.data.version !== HEALTH_CHECK_JOB.version ||
      job.data.payload.probe !== "ping"
    ) {
      throw new Error("Invalid health-check job payload");
    }

    return {
      status: "ok",
      processedAt: new Date().toISOString(),
      workerId: this.configService.get("WORKER_ID", {
        infer: true,
      }),
    };
  }
}
