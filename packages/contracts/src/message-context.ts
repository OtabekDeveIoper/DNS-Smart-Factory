export interface MessageContext {
  readonly correlationId: string;
  readonly organizationId: string | null;
  readonly plantId: string | null;
  readonly actorUserId: string | null;
  readonly requestedAt: string;
}
