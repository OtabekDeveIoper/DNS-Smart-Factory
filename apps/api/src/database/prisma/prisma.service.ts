import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@dns-smart-factory/db';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ApiEnvironment } from '../../config/api-environment.schema';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService<ApiEnvironment, true>) {
    const connectionString = configService.get('DATABASE_URL', {
      infer: true,
    });

    const adapter = new PrismaPg({
      connectionString,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
