import type { MessageContext } from "./message-context";

export interface JobEnvelope<
  TName extends string,
  TVersion extends number,
  TPayload,
> {
  readonly name: TName;
  readonly version: TVersion;
  readonly idempotencyKey: string;
  readonly context: MessageContext;
  readonly payload: TPayload;
}
