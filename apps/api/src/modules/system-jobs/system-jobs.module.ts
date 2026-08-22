import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HEALTH_CHECK_JOB } from '@dns-smart-factory/contracts';
import { HealthCheckJobProducer } from './health-check-job.producer';
import { SystemJobsController } from './system-jobs.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: HEALTH_CHECK_JOB.queue,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1_000,
        },
        removeOnComplete: {
          age: 3_600,
          count: 1_000,
        },
        removeOnFail: {
          age: 86_400,
          count: 5_000,
        },
      },
    }),
  ],
  controllers: [SystemJobsController],
  providers: [HealthCheckJobProducer],
  exports: [HealthCheckJobProducer],
})
export class SystemJobsModule {}
