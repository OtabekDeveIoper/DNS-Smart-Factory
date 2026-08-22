import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { HEALTH_CHECK_JOB } from "@dns-smart-factory/contracts";
import { HealthCheckProcessor } from "./health-check.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: HEALTH_CHECK_JOB.queue,
    }),
  ],
  providers: [HealthCheckProcessor],
})
export class HealthCheckModule {}
