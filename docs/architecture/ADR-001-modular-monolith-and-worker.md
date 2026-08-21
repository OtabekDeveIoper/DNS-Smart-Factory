# ADR-001: Modular Monolith with a Separate Background Worker

## Status

Accepted

## Context

DNS Smart Factory MES must handle synchronous operator commands and
long-running background tasks.

Operator actions such as starting an operation, consuming material, or
recording an inspection require immediate validation and a transactional
response.

AI inference, report generation, notifications, ERP synchronization, and
scheduled calculations can take longer and must not block API requests.

The system needs clear module boundaries without introducing the operational
complexity of microservices at the current stage.

## Decision

The backend will use a NestJS modular monolith with two independently running
applications:

- `apps/api`: REST API and WebSocket gateway
- `apps/worker`: BullMQ background job consumers

Both applications will live in the same npm workspace and use shared packages.

## API Responsibilities

The API is responsible for:

- authentication and authorization;
- request validation;
- synchronous business-rule validation;
- transactional changes to core MES data;
- creating audit records;
- adding background jobs to Redis;
- returning REST responses;
- publishing browser updates through WebSocket.

Core commands such as production status transitions, inventory consumption,
and quality approval remain transactional API operations.

## Worker Responsibilities

The worker is responsible for:

- OpenAI inspection inference;
- PDF and certificate generation;
- email and in-app notification processing;
- ERP synchronization;
- transactional outbox dispatching;
- scheduled KPI and planning calculations;
- file and image processing;
- retrying failed external integrations.

The worker does not expose a public HTTP API.

## Communication

The API sends jobs to Redis through BullMQ.

Job payloads contain identifiers and immutable input parameters instead of
large database snapshots or image binary data.

Images and documents are stored in S3-compatible object storage, and jobs
contain only their object keys.

Queue names and payload types are defined in `packages/contracts`.

## Data Ownership

PostgreSQL remains the source of truth.

Redis is used only for queues, cache, locks, rate limits, and short-lived state.

The API owns synchronous changes to core MES entities.

The worker owns asynchronous execution records and external side effects.

A worker must not directly bypass production, inventory, or quality business
rules. If a background job needs to change core business state, it must use the
same validated domain operation as the API.

## Reliability

Every background job must be:

- idempotent;
- safe to retry;
- identified by a deterministic job ID;
- associated with a correlation ID;
- configured with bounded retry attempts;
- configured with exponential backoff;
- observable through structured logs and metrics.

Permanently failed jobs are moved to a failed-job state for manual review.

External side effects use the transactional outbox pattern when consistency
with a PostgreSQL transaction is required.

## Deployment

The API and worker are built and deployed as separate Docker containers.

They share PostgreSQL, Redis, object storage, configuration conventions, and
observability infrastructure.

The API can be scaled independently from the worker.

## Consequences

### Benefits

- Long-running work does not block API requests.
- Core MES transactions remain consistent.
- Background workload can scale independently.
- Module boundaries can later be extracted into services if required.
- The system remains simpler to operate than a microservice architecture.

### Trade-offs

- API and worker deployments must remain contract-compatible.
- Redis becomes required infrastructure.
- Job retries and idempotency require explicit design.
- Database ownership rules must be enforced during code review.

## Rejected Alternatives

### Single API Process

Rejected because AI inference, report generation, and external integrations
could block requests or consume API resources.

### Microservices

Rejected for the current stage because separate databases, distributed
transactions, service discovery, and operational overhead are not yet
justified.

### Redis as the Source of Truth

Rejected because Redis is not the authoritative store for transactional MES
data.
