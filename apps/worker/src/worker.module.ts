import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateWorkerEnvironment } from "./config/validate-worker-environment";
import { QueueInfrastructureModule } from "./infrastructure/queue/queue-infrastructure.module";
import { HealthCheckModule } from "./jobs/health-check/health-check.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateWorkerEnvironment,
    }),
    QueueInfrastructureModule,
    HealthCheckModule,
  ],
})
export class WorkerModule {}
