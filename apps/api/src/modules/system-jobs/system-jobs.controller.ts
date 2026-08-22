import { Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { RequestWithId } from '../../libs/http/request-id.middleware';
import { HealthCheckJobProducer } from './health-check-job.producer';
import { ApiAcceptedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EnqueueHealthCheckResponseDto } from './dto/enqueue-health-check-response.dto';

@ApiTags('System jobs')
@Controller('system/jobs')
export class SystemJobsController {
  public constructor(
    private readonly healthCheckJobProducer: HealthCheckJobProducer,
  ) {}

  @Post('health-check')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Enqueue a worker health-check job',
  })
  @ApiAcceptedResponse({
    type: EnqueueHealthCheckResponseDto,
  })
  public async enqueueHealthCheck(
    @Req() request: RequestWithId,
  ): Promise<EnqueueHealthCheckResponseDto> {
    const idempotencyKey = createHash('sha256')
      .update(request.requestId)
      .digest('hex');

    const jobId = await this.healthCheckJobProducer.enqueue({
      idempotencyKey,
      context: {
        correlationId: request.requestId,
        organizationId: null,
        plantId: null,
        actorUserId: null,
        requestedAt: new Date().toISOString(),
      },
    });

    return new EnqueueHealthCheckResponseDto(jobId, request.requestId);
  }
}
