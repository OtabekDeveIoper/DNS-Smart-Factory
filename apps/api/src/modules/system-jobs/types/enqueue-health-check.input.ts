import type { MessageContext } from '@dns-smart-factory/contracts';

export interface EnqueueHealthCheckInput {
  readonly idempotencyKey: string;
  readonly context: MessageContext;
}
