# Production State Machine

## Purpose

This document defines the allowed lifecycle transitions for work orders, units,
and unit operations in DNS Smart Factory MES.

Statuses are changed only through explicit domain commands. Direct arbitrary
status updates are not allowed.

Every successful transition records an audit entry and a domain event in the
same PostgreSQL transaction.

## Work Order Lifecycle

### States

- `DRAFT`: editable work order that is not available to production;
- `PLANNED`: product, BOM, routing, quantity, and planned dates are valid;
- `RELEASED`: approved for material reservation and shop-floor dispatch;
- `IN_PROGRESS`: at least one unit has started production;
- `ON_HOLD`: production is temporarily stopped by an authorized user;
- `COMPLETED`: all required units have reached a terminal accepted state;
- `CANCELLED`: the work order was cancelled before completion.

### Allowed Transitions

| From | Command | To | Required conditions |
|---|---|---|---|
| `DRAFT` | `planWorkOrder` | `PLANNED` | Valid plant, product revision, BOM revision, routing revision, quantity, and dates |
| `PLANNED` | `reviseWorkOrder` | `DRAFT` | No unit has started and no material has been consumed |
| `PLANNED` | `releaseWorkOrder` | `RELEASED` | Required revisions are published and routing contains operations |
| `RELEASED` | `startWorkOrder` | `IN_PROGRESS` | At least one unit is ready to start |
| `RELEASED` | `holdWorkOrder` | `ON_HOLD` | Hold reason is provided |
| `IN_PROGRESS` | `holdWorkOrder` | `ON_HOLD` | Hold reason is provided |
| `ON_HOLD` | `resumeWorkOrder` | previous active state | Hold is resolved and resume authorization is present |
| `IN_PROGRESS` | `completeWorkOrder` | `COMPLETED` | All required units are completed or approved as scrapped; no open quality hold exists |
| `DRAFT` | `cancelWorkOrder` | `CANCELLED` | Cancellation reason is provided |
| `PLANNED` | `cancelWorkOrder` | `CANCELLED` | No production execution exists |
| `RELEASED` | `cancelWorkOrder` | `CANCELLED` | No unit has started and reservations are released |

`COMPLETED` and `CANCELLED` are terminal states. Reopening requires a separate,
audited corrective workflow rather than a direct status change.

## Unit Lifecycle

### States

- `CREATED`: serial number exists but the unit is not dispatched;
- `READY`: prerequisites for the first operation are satisfied;
- `IN_PROGRESS`: at least one operation is active or completed;
- `QUALITY_HOLD`: a quality issue blocks further production or shipment;
- `REWORK`: the unit is following an approved rework route;
- `COMPLETED`: all required operations and final inspection are complete;
- `SCRAPPED`: the unit is permanently rejected and cannot continue production;
- `CANCELLED`: the unit was cancelled before production started.

### Allowed Transitions

| From | Command | To | Required conditions |
|---|---|---|---|
| `CREATED` | `markUnitReady` | `READY` | Work order is released and first operation prerequisites are met |
| `READY` | `startUnitOperation` | `IN_PROGRESS` | First operation can start |
| `IN_PROGRESS` | `placeQualityHold` | `QUALITY_HOLD` | NCR or hold reason is recorded |
| `QUALITY_HOLD` | `releaseQualityHold` | `IN_PROGRESS` | Authorized disposition is approved |
| `QUALITY_HOLD` | `requireRework` | `REWORK` | Rework disposition and route are approved |
| `REWORK` | `completeRework` | `IN_PROGRESS` | Required rework operations and verification are complete |
| `IN_PROGRESS` | `completeUnit` | `COMPLETED` | All required operations, inspections, and tests passed |
| `QUALITY_HOLD` | `scrapUnit` | `SCRAPPED` | Scrap disposition is approved |
| `REWORK` | `scrapUnit` | `SCRAPPED` | Scrap disposition is approved |
| `CREATED` | `cancelUnit` | `CANCELLED` | No operation or material consumption exists |
| `READY` | `cancelUnit` | `CANCELLED` | No operation has started and reservations can be released |

`COMPLETED`, `SCRAPPED`, and `CANCELLED` are terminal states.

## Unit Operation Lifecycle

### States

- `PENDING`: predecessor operations are not complete;
- `READY`: all prerequisites are satisfied;
- `IN_PROGRESS`: an operator is actively executing the operation;
- `PAUSED`: execution is temporarily paused without a blocking defect;
- `BLOCKED`: a material, equipment, process, or quality issue prevents work;
- `COMPLETED`: the operation attempt finished successfully;
- `REWORK_REQUIRED`: the result requires a new rework attempt;
- `SKIPPED`: an authorized deviation allows the operation to be skipped;
- `CANCELLED`: the parent unit or work order was cancelled.

### Allowed Transitions

| From | Command | To | Required conditions |
|---|---|---|---|
| `PENDING` | `evaluateReadiness` | `READY` | All predecessor operations are accepted |
| `READY` | `startOperation` | `IN_PROGRESS` | Operator, work center, equipment, materials, and work order are valid |
| `IN_PROGRESS` | `pauseOperation` | `PAUSED` | Pause reason is recorded |
| `PAUSED` | `resumeOperation` | `IN_PROGRESS` | Same or authorized replacement operator resumes |
| `IN_PROGRESS` | `blockOperation` | `BLOCKED` | Block category and reason are recorded |
| `READY` | `blockOperation` | `BLOCKED` | A prerequisite became unavailable |
| `BLOCKED` | `resolveBlock` | `READY` | Block resolution is recorded and readiness is recalculated |
| `IN_PROGRESS` | `completeOperation` | `COMPLETED` | Required checklist, quantities, measurements, and material records are valid |
| `IN_PROGRESS` | `requestRework` | `REWORK_REQUIRED` | Defect and disposition are recorded |
| `REWORK_REQUIRED` | `createReworkAttempt` | terminal original attempt | A new linked operation attempt is created |
| `PENDING` | `skipOperation` | `SKIPPED` | Deviation approval is recorded |
| `READY` | `skipOperation` | `SKIPPED` | Deviation approval is recorded |

Completed attempts are immutable. Rework creates a new `UnitOperation` attempt
linked through `reworkOfOperationId`; it does not reopen the original attempt.

## Global Invariants

1. A work order uses immutable product, BOM, and routing revision snapshots.
2. Only one active attempt for the same unit and routing operation is allowed.
3. An operation cannot start before all required predecessors are accepted.
4. A held work order or unit cannot start another operation.
5. An operator must have production permission for the operation's plant.
6. Required equipment must be active and assigned to the operation's work center.
7. Required material reservations and available stock are validated before issue.
8. Consumed quantity cannot be negative or exceed available lot quantity.
9. Final unit completion requires all mandatory operations and quality gates.
10. Terminal states cannot be changed through ordinary update endpoints.
11. Every transition includes actor, reason, timestamp, correlation ID, and version.
12. AI recommendations never perform a final quality transition automatically.

## Concurrency

Work orders, units, and unit operations contain an integer `version` field.

Transition updates use optimistic concurrency:

```text
UPDATE ...
SET status = next_status, version = version + 1
WHERE id = entity_id AND version = expected_version
```

If no row is updated, the command fails with a concurrency conflict and the
client reloads the latest state.

Inventory issue uses a PostgreSQL transaction and row-level locking where
optimistic concurrency alone cannot prevent overspending the same material lot.

## Required Domain Events

- `work-order.planned.v1`;
- `work-order.released.v1`;
- `work-order.started.v1`;
- `work-order.held.v1`;
- `work-order.completed.v1`;
- `unit.started.v1`;
- `unit.quality-held.v1`;
- `unit.rework-required.v1`;
- `unit.completed.v1`;
- `unit.scrapped.v1`;
- `unit-operation.started.v1`;
- `unit-operation.blocked.v1`;
- `unit-operation.completed.v1`;
- `unit-operation.rework-required.v1`.

## Error Semantics

- invalid transition: HTTP `409 Conflict`;
- stale version: HTTP `409 Conflict`;
- missing entity: HTTP `404 Not Found`;
- insufficient permission: HTTP `403 Forbidden`;
- invalid command payload: HTTP `400 Bad Request`;
- failed prerequisite: HTTP `422 Unprocessable Entity`.

The response includes a stable application error code, current status where
safe, and correlation ID.
