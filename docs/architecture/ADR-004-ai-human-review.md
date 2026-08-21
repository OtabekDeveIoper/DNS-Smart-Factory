# ADR-004: AI-Assisted Inspection with Mandatory Human Review

## Status

Accepted

## Context

DNS Smart Factory MES uses image-based AI assistance to detect potential
wiring and assembly defects.

AI inference is probabilistic. A model can return an incorrect result, miss a
defect, produce an unsupported output, become unavailable, or change behavior
after a model update.

An incorrect automatic quality decision can release a defective unit or block
a valid unit. The AI workflow therefore requires explicit safety, audit,
versioning, privacy, evaluation, and human-approval boundaries.

## Decision

OpenAI is used as an inspection-assistance provider, not as the final quality
authority.

The system uses the OpenAI Responses API with image input and strict Structured
Outputs.

Every AI result is validated against an application-owned JSON schema before it
is stored or shown to an inspector.

A qualified human inspector makes the final `PASS` or `FAIL` decision.

AI failure must never prevent the factory from using the manual inspection
workflow.

## Ownership Boundary

The API is responsible for:

- authenticating and authorizing the inspection request;
- validating the unit and operation state;
- creating the inspection job in PostgreSQL;
- writing an outbox event in the same transaction;
- returning an accepted job response;
- exposing job status and human-review endpoints.

The worker is responsible for:

- loading the authorized image from object storage;
- calling the configured OpenAI model;
- validating and normalizing the structured output;
- recording token usage, latency, cost, and errors;
- creating a review task for a human inspector;
- retrying retryable provider failures.

The worker must not mark the manufacturing inspection as finally approved.

## Workflow

The inspection flow is:

1. an operator uploads an inspection image;
2. the API validates file type, size, checksum, unit, and process context;
3. the image is stored in a private S3-compatible bucket;
4. PostgreSQL records the attachment and `AiInspectionJob`;
5. the same transaction creates an `inspection.ai-requested.v1` outbox event;
6. the outbox dispatcher adds a deterministic BullMQ job;
7. the worker calls the OpenAI Responses API;
8. the response is validated against the configured JSON schema;
9. the inference result is persisted;
10. a quality inspector reviews the image and AI suggestion;
11. the inspector records the final inspection decision;
12. the final decision creates an audit record and domain event.

## Job States

`AiInspectionJob` uses the following states:

- `PENDING`;
- `PROCESSING`;
- `SUCCEEDED`;
- `RETRY_SCHEDULED`;
- `FAILED`;
- `CANCELLED`.

AI recommendation values are:

- `PASS_SUGGESTED`;
- `FAIL_SUGGESTED`;
- `REVIEW_REQUIRED`.

Final inspection values remain separate:

- `PASS`;
- `FAIL`;
- `REWORK_REQUIRED`.

An AI recommendation is never stored as the final inspection value.

## Structured Output Contract

The application owns and versions the output schema.

The initial response contains:

- `recommendation`;
- `summary`;
- `defects`;
- `imageQualityIssues`;
- `requiresHumanReview`.

Each defect contains:

- `type`;
- `location`;
- `description`;
- `severity`;
- optional normalized bounding-box coordinates;
- model-reported confidence.

Unknown defect types are rejected or mapped to `OTHER`; they are never silently
accepted as new domain values.

Model-reported confidence is metadata, not a calibrated probability and not a
business approval threshold by itself.

Malformed, refused, incomplete, or schema-invalid output becomes
`REVIEW_REQUIRED` or a retryable/terminal job failure according to the error
classification.

## Prompt and Model Versioning

Every inference stores:

- provider;
- model identifier or production snapshot;
- prompt version;
- output-schema version;
- application release version;
- input image checksum;
- provider response ID;
- request start and completion timestamps;
- token usage;
- estimated cost;
- normalized output;
- sanitized error details.

The production model is configuration, not a hard-coded domain constant.

Prompt changes create a new prompt version.

Model, prompt, or schema changes must pass the evaluation gate before production
promotion.

## Human Review

The inspector sees:

- the original image;
- AI-highlighted suspected defect locations;
- defect descriptions;
- image-quality warnings;
- the model recommendation;
- previous inspection history for the unit.

The inspector can:

- accept the recommendation;
- override the recommendation;
- request another image;
- mark the result as rework required;
- add notes and defect codes.

Every review stores inspector identity, timestamp, decision, notes, and whether
the AI recommendation was overridden.

An override does not modify the original inference record.

## Evaluation

The project maintains a versioned, human-labeled evaluation dataset containing:

- known-good units;
- known defects;
- difficult lighting and camera angles;
- blurred or partially obstructed images;
- visually similar but acceptable assemblies;
- previously overridden AI results.

The release gate measures at least:

- defect precision;
- defect recall;
- false-negative rate;
- false-positive rate;
- human override rate;
- invalid-output rate;
- p50 and p95 latency;
- average cost per inspection.

False negatives receive the highest operational severity.

Evaluation thresholds are defined per inspection type and defect class rather
than as one global accuracy number.

Production samples are periodically reviewed for data and model drift.

## Idempotency and Retry

The deterministic inference key is derived from:

- inspection job ID;
- image checksum;
- model identifier;
- prompt version;
- output-schema version.

Retryable failures include provider timeouts, rate limits, and temporary network
errors.

Invalid input, unsupported image type, and authorization errors are not retried.

Retry uses bounded attempts with exponential backoff and jitter.

A retry must not create duplicate final inspection records or duplicate human
review tasks.

## Availability and Fallback

OpenAI availability is not required for manual quality inspection.

When the provider is unavailable:

- the AI job remains retryable or becomes failed;
- the unit can be routed to manual inspection;
- the UI clearly distinguishes AI unavailable from inspection failed;
- core production and quality records remain available.

No unit is automatically passed because the AI provider is unavailable.

## Data Protection

Inspection images remain in private object storage.

The worker uses a short-lived authorized URL or another controlled transfer
mechanism when sending an image to the provider.

Requests use the minimum manufacturing context required for the inspection.

Customer names, operator personal data, internal credentials, unrelated
drawings, and secrets are excluded from prompts.

OpenAI request storage and retention behavior is explicitly configured and
reviewed for the deployment environment. Production use must verify current
provider retention, regional-processing, and organizational data-control
settings.

The application stores its own normalized inference and audit history in
PostgreSQL according to MES retention policy.

## Security

The OpenAI API key is available only to the worker through production secret
management.

The key is never exposed to the browser, source repository, logs, job payloads,
or database records.

Text visible inside an uploaded image is treated as untrusted input. It cannot
change system instructions, authorize tool calls, or trigger business actions.

The AI request does not receive tools capable of changing MES, ERP, inventory,
or equipment state.

Uploaded files are validated by content type, size, checksum, and configured
malware-scanning policy.

## Cost Controls

The system enforces:

- configurable model selection;
- maximum image count and file size;
- bounded image detail and output size;
- per-plant rate limits;
- per-job timeout;
- daily and monthly budget alerts;
- usage and cost metrics;
- duplicate-request detection.

Cost optimization must not bypass evaluation or human-review requirements.

## Observability

Metrics include:

- jobs by status;
- provider error and rate-limit count;
- schema-validation failure count;
- inference latency;
- queue wait time;
- token usage and estimated cost;
- recommendation distribution;
- human override rate;
- false-negative findings discovered during review.

Logs include correlation ID, job ID, inference ID, model, prompt version, image
checksum, attempt number, duration, and sanitized result status.

Raw prompts, images, API keys, and sensitive provider responses are not written
to application logs.

## Consequences

### Benefits

- AI improves inspector efficiency without becoming an uncontrolled authority.
- Every recommendation is reproducible and auditable.
- Provider, model, and prompt changes can be evaluated safely.
- Provider outages do not stop manual production quality workflows.
- Human overrides create useful evaluation data.

### Trade-offs

- Human review remains operationally required.
- Evaluation datasets require ongoing maintenance.
- Image storage and provider usage create cost and privacy obligations.
- Prompt, model, and schema versions add implementation complexity.

## Rejected Alternatives

### Automatic Final PASS or FAIL

Rejected because an unverified probabilistic result can release a defective
unit or incorrectly block production.

### Calling OpenAI Directly from the Browser

Rejected because it exposes credentials, bypasses authorization and audit, and
prevents reliable queue processing.

### Unstructured Text Responses

Rejected because free-form output is difficult to validate, version, query,
and use safely in business logic.

### Using Model Confidence as the Only Approval Rule

Rejected because model-reported confidence is not necessarily calibrated to
factory defect risk.

### Hard-Coding One Model Forever

Rejected because model availability, cost, behavior, and quality can change.
Production model changes require configuration and evaluation.

## References

- OpenAI Responses API:
  https://developers.openai.com/api/reference/typescript/resources/beta/subresources/responses/methods/create
- OpenAI data controls:
  https://developers.openai.com/api/docs/guides/your-data#default-usage-policies-by-endpoint
