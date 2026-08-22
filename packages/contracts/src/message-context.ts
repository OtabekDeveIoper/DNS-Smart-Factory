export interface MessageContext {
  readonly correlationId: string;
  readonly organizationId: string;
  readonly plantId: string | null;
  readonly actorUserId: string | null;
  readonly requestedAt: string;
}
