import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { QualityController } from './quality.controller';
import { QualityService } from './quality.service';

@Module({
  imports: [DatabaseModule],
  controllers: [QualityController],
  providers: [QualityService],
})
export class QualityModule {}
