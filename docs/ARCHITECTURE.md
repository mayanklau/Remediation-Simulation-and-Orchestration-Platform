# Architecture

Remediation Twin is a full-stack Next.js application with Prisma persistence and a domain-first backend.

## Core Runtime

- `src/app`: UI and API routes.
- `src/domain`: business logic for ingestion, risk scoring, simulation, planning, workflows, and evidence.
- `src/lib`: persistence, tenant resolution, JSON helpers, API wrappers, and audit helpers.
- `prisma/schema.prisma`: production data model.

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

## Production Hardening Still Expected

The app is built with production boundaries, but a real deployment should add:

- Enterprise SSO with SAML or OIDC.
- External secrets manager.
- PostgreSQL instead of local SQLite.
- Object storage for large evidence artifacts.
- Queue-backed workers for long simulations.
- Vendor-specific connectors.
- Immutable audit log storage.
- Full LLM integration behind the deterministic copilot contract.
