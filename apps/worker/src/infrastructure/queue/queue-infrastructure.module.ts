import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import type { WorkerEnvironment } from "../../config/worker-environment.schema";
import { QUEUE_KEY_PREFIX } from "@dns-smart-factory/contracts";

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<WorkerEnvironment, true>) => ({
        connection: {
          host: configService.get("REDIS_HOST", { infer: true }),
          port: configService.get("REDIS_PORT", { infer: true }),
          maxRetriesPerRequest: null,
        },
        prefix: QUEUE_KEY_PREFIX,
      }),
    }),
  ],
})
export class QueueInfrastructureModule {}
