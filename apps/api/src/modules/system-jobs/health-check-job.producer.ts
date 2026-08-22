import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import {
  HEALTH_CHECK_JOB,
  type HealthCheckJobResult,
  type HealthCheckJobV1,
} from '@dns-smart-factory/contracts';
import type { EnqueueHealthCheckInput } from './types/enqueue-health-check.input';

@Injectable()
export class HealthCheckJobProducer {
  public constructor(
    @InjectQueue(HEALTH_CHECK_JOB.queue)
    private readonly systemQueue: Queue<
      HealthCheckJobV1,
      HealthCheckJobResult,
      typeof HEALTH_CHECK_JOB.name
    >,
  ) {}

  public async enqueue(input: EnqueueHealthCheckInput): Promise<string> {
    const envelope: HealthCheckJobV1 = {
      name: HEALTH_CHECK_JOB.name,
      version: HEALTH_CHECK_JOB.version,
      idempotencyKey: input.idempotencyKey,
      context: input.context,
      payload: {
        probe: 'ping',
      },
    };

    const job = await this.systemQueue.add(HEALTH_CHECK_JOB.name, envelope, {
      jobId: input.idempotencyKey,
    });

    if (!job.id) {
      throw new Error('BullMQ did not return a health-check job ID');
    }

    return job.id;
  }
}
