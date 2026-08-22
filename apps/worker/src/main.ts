import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { WorkerModule } from "./worker.module";

const logger = new Logger("WorkerBootstrap");

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);

  app.enableShutdownHooks();

  logger.log("Worker application started");
}

bootstrap().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.stack : String(error));

  process.exitCode = 1;
});
