# Architecture

Remediation Twin is a full-stack Next.js application with Prisma persistence and a domain-first backend.

## Core Runtime

- `src/app`: UI and API routes.
- `src/domain`: business logic for ingestion, risk scoring, simulation, planning, workflows, and evidence.
- `src/lib`: persistence, tenant resolution, JSON helpers, API wrappers, and audit helpers.
- `prisma/schema.prisma`: production data model.
- `middleware.ts`: baseline security headers for application and API routes.

## Core Flow

1. Findings are ingested through JSON or CSV APIs.
2. Assets are upserted from finding payloads.
3. Findings are fingerprinted and deduplicated.
4. Risk score and business risk score are calculated.
5. A remediation action is created for every canonical finding.
6. Users run simulations against remediation actions.
7. Simulation results generate plans, approvals, rollout guidance, rollback steps, and validation steps.
8. Workflow items track execution and approvals.
9. Evidence artifacts preserve audit history.

## Production Envelope

The final production layer now includes:

- `/final-production` readiness center.
- `GET /api/final-production` and `POST /api/final-production`.
- Production policies for execution attestation, evidence retention, tenant boundaries, and observability.
- Worker hooks for ingestion, simulation, evidence, connector sync, and rollback coordination.
- Production Docker compose with Postgres.
- Security headers through middleware.
- Deployment and security documentation.

External setup is still required for live credentials, real identity provider metadata, object storage, and telemetry endpoints. Until those are configured, execution remains dry-run by design.
