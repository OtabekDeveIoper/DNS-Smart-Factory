import { Controller, Get, Param } from '@nestjs/common';
import { QualityService } from './quality.service';

@Controller('quality')
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Get('trace/:orderNo')
  public traceOrder(@Param('orderNo') orderNo: string) {
    return this.qualityService.traceOrder(orderNo);
  }
}
