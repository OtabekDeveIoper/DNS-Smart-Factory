import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import type { WorkerEnvironment } from "../../config/worker-environment.schema";

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
        prefix: "dns-smart-factory",
      }),
    }),
  ],
})
export class QueueInfrastructureModule {}
