import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_KEY_PREFIX } from '@dns-smart-factory/contracts';
import type { ApiEnvironment } from '../../config/api-environment.schema';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ApiEnvironment, true>) => ({
        connection: {
          host: configService.get('REDIS_HOST', {
            infer: true,
          }),
          port: configService.get('REDIS_PORT', {
            infer: true,
          }),
          maxRetriesPerRequest: 1,
          enableReadyCheck: true,
          connectTimeout: 5_000,
        },
        prefix: QUEUE_KEY_PREFIX,
      }),
    }),
  ],
})
export class QueueInfrastructureModule {}
