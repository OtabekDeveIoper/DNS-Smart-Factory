import { ApiProperty } from '@nestjs/swagger';

export class EnqueueHealthCheckResponseDto {
  @ApiProperty({
    description: 'BullMQ job identifier',
    example: '0f749a07c4e14333b14c3412806f1c068fa5b10f7507f8edfc52f15e9b88a4f2',
  })
  public readonly jobId: string;

  @ApiProperty({
    description: 'Request correlation identifier',
    example: 'd2752046-630f-4892-98c2-d35fb710234f',
  })
  public readonly correlationId: string;

  @ApiProperty({
    enum: ['accepted'],
    example: 'accepted',
  })
  public readonly status: 'accepted';

  public constructor(jobId: string, correlationId: string) {
    this.jobId = jobId;
    this.correlationId = correlationId;
    this.status = 'accepted';
  }
}
