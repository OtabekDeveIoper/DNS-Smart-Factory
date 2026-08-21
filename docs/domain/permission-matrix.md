# MES Permission Matrix

## Purpose

This document defines default role permissions and authorization scope for DNS
Smart Factory MES.

Authorization follows deny-by-default and least-privilege principles.

Roles are assigned per plant through `UserPlantRole`. A user can have multiple
roles and different roles in different plants.

## Scope Hierarchy

```text
System → Organization → Plant → Production Line → Work Center
```

A permission grant never automatically expands beyond its assigned scope.

Every query and command must apply the user's organization and plant scope
before accessing business data.

## Permission Levels

- `R`: read;
- `W`: create or update operational data;
- `A`: approve or execute controlled transition;
- `M`: configure or manage;
- `-`: denied.

`M` does not automatically grant regulated operational approval. For example,
a system administrator does not receive final quality approval permission
unless a quality role is separately assigned.

## Default Roles

- `SYSTEM_ADMIN`: platform configuration and operational support;
- `ORG_ADMIN`: organization users, roles, and plants;
- `PLANT_MANAGER`: plant-wide operational visibility and management;
- `PLANNER`: master data, work orders, scheduling, and release;
- `SUPERVISOR`: shop-floor dispatch, holds, blocks, and production oversight;
- `OPERATOR`: assigned production execution;
- `QUALITY_INSPECTOR`: inspection, NCR, disposition, and quality approval;
- `INVENTORY_OPERATOR`: receiving, movement, reservation, issue, and adjustment;
- `MAINTENANCE_TECHNICIAN`: equipment status and downtime maintenance;
- `VIEWER`: read-only dashboards and permitted reports;
- `INTEGRATION_SERVICE`: non-human service account with explicit API permissions.

## Domain Matrix

| Capability | System Admin | Org Admin | Plant Manager | Planner | Supervisor | Operator | Quality | Inventory | Maintenance | Viewer | Integration |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Platform configuration | M | - | - | - | - | - | - | - | - | - | - |
| Organization configuration | R | M | R | - | - | - | - | - | - | - | - |
| User and role assignment | M | M | R | - | - | - | - | - | - | - | - |
| Plant structure | R | M | M | R | R | R | R | R | R | R | R |
| Product/BOM/Routing | R | R | R | M | R | R | R | R | R | R | R |
| Sales orders | R | R | R | W | R | R | R | R | - | R | W |
| Work-order planning | R | R | M | M | R | R | R | R | R | R | W |
| Work-order release | - | - | A | A | - | - | - | - | - | R | - |
| Production execution | R | R | R | R | M | W | R | R | R | R | W |
| Production hold/resume | - | - | A | - | A | - | A | - | - | R | - |
| Material receiving/movement | R | R | R | R | R | R | R | M | - | R | W |
| Material issue/return | R | R | R | R | A | W | R | M | - | R | W |
| Inventory adjustment | - | - | A | - | - | - | R | A | - | R | - |
| Inspection execution | R | R | R | R | R | R | W | R | - | R | W |
| Final quality approval | - | - | - | - | - | - | A | - | - | R | - |
| NCR creation | R | R | R | R | W | W | W | R | W | R | W |
| NCR disposition | - | - | A | - | - | - | A | - | - | R | - |
| CAPA management | - | R | A | - | R | - | M | - | R | R | - |
| AI recommendation review | - | - | R | - | - | - | A | - | - | R | - |
| Equipment configuration | R | R | R | R | R | R | R | R | M | R | W |
| Downtime classification | R | R | R | R | W | W | R | - | W | R | W |
| Reports and dashboards | R | R | R | R | R | R | R | R | R | R | R |
| Audit-log access | M | M | R | - | R | - | R | - | - | - | - |
| ERP/integration config | M | M | R | - | - | - | - | - | - | - | M |
| Failed-job replay | M | - | R | - | - | - | - | - | - | - | M |

## Stable Permission Codes

Permission codes are stored as data and referenced by guards. Initial codes:

```text
platform.config.manage
organization.read
organization.manage
identity.user.read
identity.user.manage
identity.role.manage
plant.read
plant.manage
master-data.read
master-data.manage
sales-order.read
sales-order.write
work-order.read
work-order.write
work-order.release
production.read
production.execute
production.supervise
production.hold
inventory.read
inventory.receive
inventory.move
inventory.reserve
inventory.issue
inventory.adjust
quality.read
quality.inspect
quality.approve
quality.ncr.create
quality.ncr.disposition
quality.capa.manage
ai-inspection.read
ai-inspection.request
ai-inspection.review
equipment.read
equipment.manage
downtime.classify
report.read
audit.read
integration.read
integration.manage
job.failed.read
job.failed.replay
```

Controllers and application services authorize stable permission codes, not
role names. Role contents can change without changing endpoint code.

## Sensitive Actions

The following actions require explicit approval permissions and a reason:

- releasing or cancelling a work order;
- placing or releasing a production hold;
- skipping a routing operation;
- adjusting inventory;
- approving material substitution;
- final quality approval;
- NCR disposition;
- unit scrap;
- failed integration replay;
- changing published master-data revisions.

Sensitive actions always create an audit record.

## Segregation of Duties

By default:

- the operator who executes production cannot grant final quality approval;
- the user who requests an inventory adjustment cannot approve it when a
  configured quantity or value threshold is exceeded;
- AI cannot approve its own recommendation;
- service accounts cannot perform human approval actions;
- platform administrators do not automatically receive production or quality
  approval permissions.

Small deployments can assign multiple human roles to one user, but every action
still records the active permission and actor identity.

## Service Accounts

Service accounts:

- cannot use interactive login;
- use rotated credentials or workload identity;
- receive only explicit integration permissions;
- are scoped to an organization and one or more plants;
- cannot receive `quality.approve`, `inventory.adjust`, or other human approval
  permissions;
- are audited by service-account ID and correlation ID.

## Authorization Enforcement

Authorization is enforced at two levels:

1. controller or transport guard checks authentication and coarse permission;
2. application use case validates entity scope and business authorization.

Database queries always include organization or plant constraints where the
entity is scoped.

Possession of an entity UUID is never treated as authorization.

Background jobs carry organization, plant, actor, and correlation context. A
worker revalidates the job's allowed operation rather than trusting arbitrary
job payload permissions.

## Permission Changes

Role and permission changes:

- invalidate relevant authorization cache entries;
- increment role or membership version;
- revoke or refresh active sessions according to security policy;
- create an audit record;
- never rewrite historical audit records.

## Testing Requirements

Every protected use case includes tests for:

- allowed role and scope;
- denied role;
- correct role but wrong plant;
- inactive user;
- inactive membership;
- revoked permission;
- service account attempting human approval;
- cross-organization entity access.
