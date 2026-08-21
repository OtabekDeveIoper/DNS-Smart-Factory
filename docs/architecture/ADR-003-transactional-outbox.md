# ADR-003: Transactional Outbox

## Status

Accepted

## Context

Core MES commands frequently produce external side effects.

Examples include:

- adding a BullMQ background job;
- sending a WebSocket notification;
- invalidating Redis cache;
- synchronizing production results with ERP;
- sending email or in-app notifications;
- starting an AI inspection job.

Writing PostgreSQL data and publishing a Redis job are two separate operations.

If the database transaction succeeds but publishing to Redis fails, the MES
record is saved while the background operation is lost.

If Redis publishing succeeds but the database transaction fails, the worker can
process a job for business data that does not exist.

A distributed transaction between PostgreSQL, Redis, MQTT, and external APIs
is not practical.

## Decision

The system will use the transactional outbox pattern.

Every business transaction that requires an external side effect writes an
`OutboxEvent` in the same PostgreSQL transaction as the core business change.

An outbox dispatcher running in `apps/worker` reads pending events and delivers
them to the appropriate destination.

## Outbox Event

The outbox record contains:

- `id`;
- `organizationId`;
- `plantId`;
- `aggregateType`;
- `aggregateId`;
- `aggregateVersion`;
- `eventType`;
- `eventVersion`;
- `payload`;
- `status`;
- `attemptCount`;
- `availableAt`;
- `occurredAt`;
- `lockedAt`;
- `lockedBy`;
- `publishedAt`;
- `lastError`;
- `correlationId`;
- `causationId`;
- `idempotencyKey`.

The initial statuses are:

- `PENDING`;
- `PROCESSING`;
- `PUBLISHED`;
- `FAILED`.

The payload contains only the minimum information required by the consumer.

Large files, images, secrets, access tokens, and unnecessary personal
information must not be stored in the outbox payload.

## Transaction Flow

A synchronous MES command follows this flow:

1. authenticate and authorize the user;
2. validate the command and state transition;
3. start a PostgreSQL transaction;
4. update core MES records;
5. create an audit record;
6. create one or more outbox events;
7. commit the PostgreSQL transaction;
8. return the API response;
9. let the worker dispatch the outbox events.

If the transaction rolls back, the business change, audit record, and outbox
events all roll back together.

## Dispatcher

The outbox dispatcher runs inside `apps/worker`.

It periodically claims a bounded batch of available events.

Multiple worker instances can run concurrently.

Events are claimed using PostgreSQL row locking with
`FOR UPDATE SKIP LOCKED` or an equivalent safe claiming strategy.

Claimed events receive:

- `status = PROCESSING`;
- `lockedAt`;
- `lockedBy`.

A processing lease prevents an event from remaining permanently locked after a
worker crash.

Expired processing leases can be returned to `PENDING`.

## Delivery

The dispatcher routes events by event type.

Destinations can include:

- BullMQ queues;
- WebSocket notification publishing;
- Redis cache invalidation;
- ERP adapters;
- email and notification handlers;
- MQTT command publishing.

BullMQ jobs use the outbox event ID or idempotency key as their deterministic
job ID.

## Delivery Guarantee

The system provides at-least-once delivery.

Exactly-once delivery is not claimed.

A worker can crash after publishing an event but before marking it as
`PUBLISHED`. The event can therefore be delivered again.

Every consumer must be idempotent.

Consumers must store or verify an idempotency key before applying an external
side effect that cannot safely be repeated.

## Ordering

Events belonging to the same aggregate include an `aggregateVersion`.

Consumers that require ordering verify that versions are processed in the
expected sequence.

The system does not guarantee global ordering across different aggregates.

Ordering must not depend only on timestamps.

## Retry Policy

Transient failures are retried with exponential backoff.

The retry delay is represented by `availableAt`.

Examples of retryable errors include:

- Redis temporarily unavailable;
- OpenAI rate limit;
- ERP timeout;
- temporary network failure;
- object storage unavailable.

Validation errors, unsupported event versions, and permanently rejected
requests are not retried indefinitely.

After the configured maximum attempt count, the event becomes `FAILED` and
requires operational review or manual replay.

## Event Versioning

Every event has an `eventVersion`.

Consumers must explicitly support the received version.

Breaking payload changes require a new event version.

Event names describe completed business facts, for example:

- `work-order.released.v1`;
- `unit-operation.completed.v1`;
- `material.consumed.v1`;
- `inspection.requested.v1`;
- `non-conformance.created.v1`.

Commands such as `complete-operation` are not used as domain event names.

## Observability

The system records metrics for:

- pending event count;
- oldest pending event age;
- processing latency;
- publish success count;
- retry count;
- failed event count;
- events processed per destination.

Every dispatcher log includes:

- outbox event ID;
- event type and version;
- aggregate type and ID;
- correlation ID;
- attempt count;
- destination;
- duration;
- result.

An alert is raised when the oldest pending event exceeds the configured
threshold or failed events are present.

## Retention

Published events are retained for a configurable period for diagnostics and
audit support.

Retention cleanup runs as a background job.

Failed events are never automatically deleted.

Outbox retention is not a replacement for the permanent MES audit log.

## Security

Outbox payloads are treated as internal application data.

Payloads must not contain passwords, API keys, raw access tokens, or private
binary files.

Worker access to outbox records follows least-privilege database permissions.

Sensitive error responses are sanitized before being stored in `lastError`.

## Consequences

### Benefits

- Database changes and event creation are atomic.
- Redis or external-service outages do not lose business events.
- Failed integrations can be retried or replayed.
- API response time is separated from external-service latency.
- Event delivery becomes observable.

### Trade-offs

- Delivery is at-least-once, so consumers require idempotency.
- The outbox table needs monitoring and retention.
- Dispatcher leasing and retry logic add implementation complexity.
- Event schemas require versioning discipline.

## Rejected Alternatives

### Direct Redis Publishing Inside a Database Transaction

Rejected because Redis publishing cannot participate in the PostgreSQL
transaction and cannot be rolled back atomically.

### Publishing After Transaction Commit Without an Outbox

Rejected because a process crash after the commit can permanently lose the
event.

### Distributed Transactions

Rejected because PostgreSQL, Redis, MQTT, OpenAI, and external ERP systems do
not provide a practical shared transaction protocol for this architecture.

### Exactly-Once Delivery

Rejected because failures between external delivery and local acknowledgement
make exactly-once delivery unrealistic. Idempotent at-least-once processing is
the selected reliability model.