# MES V2 Migration Plan

## Purpose

This document defines the staged migration from the current demonstration
schema to the MES V2 schema.

The deployed demonstration must remain available while V2 is developed.

Production migrations use an expand, backfill, switch, and contract strategy.
Destructive schema reset is not a production migration strategy.

## Current-to-Target Mapping

| Current model | V2 destination | Migration note |
|---|---|---|
| `Customer` | `Customer` | Add organization ownership and preserve external code |
| `Order` | `SalesOrder`, `SalesOrderLine`, `WorkOrder` | Split commercial demand from manufacturing execution |
| `Unit` | V2 `Unit` | Reattach to work order and preserve serial number |
| `ProcessStep` | `OperationDefinition`, `RoutingOperation` | Global step becomes reusable definition plus revision-specific operation |
| `ProcessRecord` | `WorkOrderOperation`, `UnitOperation`, `ProductionEvent` | Preserve execution history and derive immutable events |
| `Material` | V2 `Material` | Add organization ownership and control attributes |
| `BomItem` | `BomRevision`, V2 `BomItem` | Replace order-specific BOM with product-revision BOM |
| `InventoryLot` | `MaterialLot`, `InventoryTransaction` | Create opening-balance ledger transactions |
| `MaterialUsage` | `MaterialConsumption`, `InventoryTransaction` | Preserve lot-to-unit genealogy |
| `Inspection` | `InspectionPlan`, `InspectionRecord`, AI models | Separate plan, execution, AI suggestion, and final review |
| `TestRecord` | `InspectionPlanItem`, `MeasurementResult` | Preserve measured values, limits, equipment, and certificate references |
| `Event` | `ProductionEvent`, `AuditLog`, `OutboxEvent` | Classify historical facts separately from delivery events |

## Migration Principles

1. Existing identifiers are preserved where target semantics are equivalent.
2. Backfill scripts are idempotent and restartable.
3. Every backfill records counts, failures, and execution version.
4. New nullable columns are populated before becoming required.
5. Foreign keys and unique constraints are validated after data backfill.
6. Reads switch only after parity checks pass.
7. Dual write is temporary and has an explicit removal milestone.
8. Old tables are retained read-only for at least one verified release.
9. Every deployment has a documented application rollback path.
10. Database backup and restore verification precede production cutover.

## Release M0: Baseline and Safety

- tag the current production release;
- record current migration version;
- create a tested PostgreSQL backup;
- capture row counts and critical business totals;
- add migration-run tracking;
- ensure all current seed and API tests pass;
- prevent unrelated schema changes during migration work.

Required baseline totals include:

- customer count;
- order count and quantity by status;
- unit count by status;
- process-record count by status;
- inventory quantity by material and lot;
- material consumption by order and lot;
- inspection and test counts by result.

## Release M1: Organization and Identity Expansion

Add:

- organizations;
- plants, areas, lines, work centers, and equipment;
- users, roles, permissions, and plant memberships;
- audit logs.

Backfill one default organization and plant for current demonstration data.

During the compatibility window, nullable ownership bridges connect legacy
aggregate roots to the V2 foundation:

- `Customer.organizationId` and `Material.organizationId` reference
  `Organization`;
- `Order.plantId` and `InventoryLot.plantId` reference `Plant`.

All V2 physical table names use PascalCase and columns use camelCase, matching
the existing Prisma schema convention. The naming migration uses atomic
PostgreSQL renames and does not copy or recreate business data. Rolling back to
an application that expects the previous physical names requires applying the
inverse rename migration before deploying that application.

Current APIs continue to operate. New ownership fields remain nullable until
the backfill and application compatibility checks pass.

Rollback: deploy the previous application version. New additive tables remain
unused and do not affect current reads.

## Release M2: Manufacturing Master Data

Add:

- products and product revisions;
- operation definitions;
- BOM and routing revisions;
- routing operations and predecessors.

For each distinct current product/model combination:

1. create a product and initial published product revision;
2. create an initial BOM revision from order BOM data;
3. create an initial routing revision from active process steps;
4. record conflicts where orders with the same product have different BOMs.

Conflicting historical BOMs receive separate migration revisions rather than
being silently merged.

Rollback: old order BOM and process-step reads remain authoritative.

## Release M3: Sales and Production Expansion

Add:

- sales orders and sales-order lines;
- work orders and work-order operations;
- V2 units and unit operations;
- production events.

Backfill:

1. one sales order from each current order;
2. one sales-order line for the current product and quantity;
3. one manufacturing work order linked to the migrated revisions;
4. units with their existing serial numbers and timestamps;
5. work-order operations from the selected routing revision;
6. unit-operation attempts from process records;
7. production events from reliable historical timestamps.

Unknown historical actors are represented as migration/system actors. Actor
identity is never invented.

Run old-versus-new parity queries for order quantity, unit progress, completed
operations, defect quantity, and rework count.

Rollback: application feature flag returns reads and writes to V1 endpoints.

## Release M4: Inventory Ledger Expansion

Add:

- warehouses and storage locations;
- material lots;
- inventory transactions;
- reservations and material consumptions.

For every current inventory lot:

- create a V2 material lot;
- create an `ADJUSTMENT_IN` migration transaction representing received stock;
- create historical issue transactions from material usage;
- create a balancing migration transaction only when required to match the
  verified current quantity;
- record every discrepancy for review.

The following invariant must pass per material lot:

```text
sum(signed inventory transactions) = migrated current quantity
```

No unexplained difference is discarded.

Rollback: V1 inventory remains authoritative until ledger parity passes.

## Release M5: Quality and AI Expansion

Add:

- inspection plans and plan items;
- inspection records and measurement results;
- NCR and CAPA records;
- attachments;
- AI jobs, inference runs, and human reviews.

Historical inspections and tests are migrated as completed records.

Historical mock AI results are marked with their original provider/source and
are not represented as real OpenAI inference runs.

Image URLs are converted to attachment metadata only when the underlying object
can be verified. Broken or missing images are recorded as migration warnings.

Rollback: V1 quality endpoints remain available in read-only mode.

## Release M6: Read and Write Cutover

Cutover order:

1. deploy V2-compatible application with V1 reads still enabled;
2. run final incremental backfill;
3. stop V1 writes;
4. verify parity totals;
5. enable V2 writes;
6. enable V2 reads for internal users;
7. monitor errors, latency, and business totals;
8. enable V2 reads for all users;
9. remove temporary dual-write logic.

The cutover must define a maximum acceptable write-free maintenance window.

Rollback before V2 writes: re-enable V1 application.

Rollback after V2 writes: requires a reverse synchronization procedure and is
not performed by simply deploying old code.

## Release M7: Contract Old Schema

Old tables can be removed only after:

- at least one stable production release on V2;
- business parity is signed off;
- backup restoration has been tested;
- no application query references old models;
- no worker or report references old models;
- rollback retention period has expired;
- final archival export exists.

Contract changes are delivered in a separate migration from V2 cutover.

## Migration Tracking

Each backfill execution records:

- migration name and version;
- started and completed timestamps;
- application commit SHA;
- source and target row counts;
- inserted, updated, skipped, and failed counts;
- checksum or parity result;
- sanitized error summary;
- operator identity.

## Verification Gates

Every migration release requires:

- Prisma schema validation;
- migration on an empty database;
- migration on a restored production-like database;
- idempotent backfill rerun;
- foreign-key and unique-constraint validation;
- parity SQL checks;
- API integration tests;
- critical production E2E workflow;
- backup and application rollback rehearsal;
- migration duration measurement.

## Data That Must Not Be Invented

Migration scripts must not fabricate:

- operator identity;
- inspection approval;
- material supplier or lot;
- exact process timestamps;
- AI provider or model;
- quality disposition;
- equipment identity.

Unknown values remain nullable, use an explicit migration marker where allowed,
or are recorded as migration exceptions for manual resolution.
