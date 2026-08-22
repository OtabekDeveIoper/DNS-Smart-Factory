import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import type { ApiEnvironment } from './config/api-environment.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService =
    app.get<ConfigService<ApiEnvironment, true>>(ConfigService);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const webUrl = configService.get('WEB_URL', {
    infer: true,
  });

  const allowedOrigins = webUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  app.enableCors({
    origin: allowedOrigins,
  });

  const enableSwagger = configService.get('ENABLE_SWAGGER', {
    infer: true,
  });

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('API Docs')
      .setDescription('NestJS API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get('PORT', {
    infer: true,
  });

  await app.listen(port, '0.0.0.0');

  logger.log(`API running at http://localhost:${port}/api`);
}

void bootstrap();
