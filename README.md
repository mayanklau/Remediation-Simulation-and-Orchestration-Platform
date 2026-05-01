# Remediation Twin

Remediation Twin is an enterprise remediation simulation and orchestration platform. It turns security findings from scanners, cloud tools, code security, IAM systems, and compliance sources into prioritized remediation work that can be simulated, approved, executed in dry-run, tracked through campaigns, and sealed with audit-grade evidence.

The product is designed for enterprises that are overwhelmed by remediation volume and need a governed way to answer:

- Which findings actually matter to the business?
- Which assets and services are affected?
- What will break if we remediate?
- Can we virtually patch or break the attack path first?
- Who must approve the change?
- What evidence proves the remediation was safe and complete?

## What It Does

Remediation Twin provides a full remediation operating loop:

1. Ingest findings through JSON, CSV, mock ingestion, and connector-run contracts.
2. Normalize, deduplicate, and correlate source findings.
3. Map findings to assets, owners, environments, exposure, and dependencies.
4. Score technical risk and business risk.
5. Generate remediation actions.
6. Simulate remediation before execution.
7. Build rollout, rollback, validation, and evidence plans.
8. Route approval workflows.
9. Apply policy guardrails, exceptions, freeze windows, and auto-approval checks.
10. Use virtual patching and path breakers when permanent remediation is risky or delayed.
11. Track campaigns, evidence, audit logs, operational telemetry, and production readiness.

## Major Capabilities

- Multi-tenant Next.js and Prisma application
- Tenant-scoped APIs and persistence
- JSON, CSV, and prototype finding ingestion
- Asset inventory and dependency graph
- Risk scoring and business-risk prioritization
- Remediation action generation
- Simulation engine for patch, network, IAM, cloud, and compliance remediation
- Rollout, rollback, validation, and evidence plan generation
- Approval workflow with comments, decisions, and evidence
- Jira, GitHub, ServiceNow, scanner, cloud, Kubernetes, and IAM connector framework
- Virtual patching and attack-path breaker control center
- Governance policies, risk exceptions, freeze windows, evidence gates, and auto-approval
- Continuous simulation and predictive residual risk
- Campaign board and self-updating remediation campaigns
- SSO metadata, signed sessions, RBAC, and audit trail
- Worker runner for ingestion, simulation, evidence, connector sync, and automation
- Evidence sealing with hash chaining and retention metadata
- Observability, health checks, run records, and production telemetry
- CI workflow, Docker Compose, production environment contract, and baseline Prisma migration

## Key Modules

| Module | Purpose |
| --- | --- |
| Dashboard | Executive overview of risk, findings, actions, evidence, and readiness. |
| Findings | Canonical finding backlog after normalization and deduplication. |
| Assets | Inventory of systems, owners, exposure, criticality, and sensitivity. |
| Asset Graph | Dependency graph with risk transfer, blast radius, and concentration analysis. |
| Remediation Queue | Generated remediation actions that can be simulated, planned, approved, and verified. |
| Simulations | Historical simulation runs with confidence, risk reduction, and operational risk. |
| Workflows | Approval and execution workflow tracking. |
| Evidence | Evidence readiness and evidence pack exports. |
| Connectors | Enterprise connector onboarding and dry-run execution. |
| Ingestion Jobs | Durable ingestion operation tracking. |
| Campaign Board | Campaign-level ownership, progress, blockers, and risk. |
| Governance | Policies, exceptions, continuous simulation, predictive risk, and governed fixes. |
| Virtual Patching | Compensating controls and attack-path breaker workflow. |
| Enterprise Maturity | Ten-track maturity command center. |
| Pilot Control Plane | Production-pilot activation for real enterprise readiness. |
| Final Production | Final deployability and production closure controls. |
| Production Ops | Runtime workers, SSO/session contracts, telemetry, evidence sealing, and live connector dry-runs. |

## Virtual Patching And Path Breakers

The `/virtual-patching` module adds protection before permanent remediation is safe:

- detects virtual patch candidates when a finding is internet-exposed, lacks a patch, or affects cloud, IAM, network, application, or container surfaces
- recommends WAF, API gateway, service mesh, EDR, admission controller, IAM, cloud-policy, and network controls
- scores attack paths from exposed assets to high-value targets
- proposes path breakers such as deny rules, microsegmentation, conditional IAM denies, route quarantine, and virtual patch controls
- runs canary simulations for top candidates
- generates remediation plans for virtual patch actions
- creates enforced policies, execution hooks, dry-run path-breaker records, rollback requirements, and audit logs

Activation:

```bash
curl -X POST http://localhost:3000/api/virtual-patching \
  -H "content-type: application/json" \
  -d '{"action":"activate"}'
```

## Enterprise Maturity

The `/enterprise-maturity` command center operationalizes ten advanced capability tracks:

1. Real connector framework
2. Simulation sandbox
3. Policy engine
4. Remediation campaign studio
5. AI copilot upgrade
6. Enterprise security layer
7. Execution orchestration
8. Evidence and compliance packs
9. Maturity dashboards
10. Production hardening

`POST /api/enterprise-maturity` with `{ "action": "advance_all" }` creates connector profiles, connector health runs, governance policies, dry-run execution hooks, OIDC readiness, RBAC bindings, executive reports, maturity campaigns, and audit records.

## Pilot Control Plane

The `/pilot-control-plane` module moves the platform into enterprise pilot readiness:

1. Real scanner connectors
2. True simulation engine
3. Remediation playbook library
4. Policy-as-code
5. Approval workbench
6. Jira, GitHub, and ServiceNow execution
7. Evidence vault
8. AI remediation planner
9. Executive dashboards
10. Production SaaS layer

`POST /api/pilot-control-plane` with `{ "action": "activate_all_10" }` configures scanner connector profiles, dry-run connector checks, policy-as-code controls, simulation and plan records, approval workflows, evidence artifacts, execution records, dashboards, SSO/RBAC readiness, and an audit event.

## Final Production Readiness

The `/final-production` center closes the final production requirements:

1. Database and migrations
2. Auth, SSO, and RBAC
3. Connector secret references
4. Background worker lanes
5. Live integration runway
6. Executable policy runtime
7. Evidence vault and retention
8. Observability and operations
9. Enterprise deployment
10. Security hardening

`POST /api/final-production` with `{ "action": "finalize" }` creates production guardrail policies, worker execution lanes, rollback coordination, connector readiness checks, production campaign/report records, SSO/RBAC readiness, and an audit event.

## Production Operations

The `/production-ops` control room includes:

- signed session contract
- SSO start and callback contracts
- rate-limit and CSRF middleware hooks
- secret-reference resolution
- live connector dry-run runner
- worker runner for ingestion, simulation, evidence, connector sync, and automation
- immutable evidence sealing with hash chaining
- OpenTelemetry and alert-route readiness signals
- baseline Prisma migration
- GitHub Actions CI workflow

## Production-Ready Architecture

The app is production-ready from an application architecture standpoint because it includes:

- multi-tenant data model
- tenant-scoped APIs
- Prisma persistence
- baseline migration under `prisma/migrations`
- RBAC role catalog and evaluation
- SSO/session contracts
- signed sessions and CSRF token helpers
- security headers and request throttling
- secret-reference pattern instead of raw secret persistence
- durable run records for connectors and automation
- worker lane contracts
- evidence packs and evidence sealing
- audit logs for governance and production activation
- health checks and observability telemetry
- Docker and production Compose configuration
- CI workflow for install, Prisma generation, typecheck, tests, and build

Live production execution remains intentionally governed and dry-run by default until enterprise credentials, identity provider metadata, approval policies, change windows, and storage targets are configured.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Executive dashboard |
| `/findings` | Finding backlog |
| `/assets` | Asset inventory |
| `/asset-graph` | Dependency, blast-radius, and risk-transfer map |
| `/remediation` | Remediation queue |
| `/simulations` | Simulation history |
| `/workflows` | Approval workflow |
| `/evidence` | Evidence readiness |
| `/connectors` | Connector onboarding |
| `/ingestion-jobs` | Durable ingestion operations |
| `/campaign-board` | Campaign operating board |
| `/operating-system` | Closed-loop remediation control plane |
| `/pilot-control-plane` | Enterprise pilot activation |
| `/virtual-patching` | Virtual patching and attack-path breaker controls |
| `/final-production` | Production readiness closure |
| `/production-ops` | Runtime operations |
| `/enterprise-maturity` | Maturity command center |
| `/governance` | Autonomous remediation governance |
| `/enterprise` | SSO, RBAC, and enterprise readiness |
| `/audit` | Audit timeline |

## API Highlights

- `GET /api/dashboard`
- `POST /api/ingest/json`
- `POST /api/ingest/csv`
- `POST /api/mock-ingest`
- `GET /api/assets`
- `GET /api/asset-graph`
- `GET /api/findings`
- `GET /api/remediation-actions`
- `POST /api/remediation-actions/:id/simulate`
- `POST /api/remediation-actions/:id/plan`
- `POST /api/remediation-actions/:id/workflow`
- `GET /api/pilot-readiness`
- `POST /api/pilot-readiness`
- `GET /api/pilot-control-plane`
- `POST /api/pilot-control-plane`
- `GET /api/virtual-patching`
- `POST /api/virtual-patching`
- `GET /api/final-production`
- `POST /api/final-production`
- `GET /api/auth/session`
- `POST /api/auth/session`
- `GET /api/auth/sso/start`
- `POST /api/auth/sso/callback`
- `POST /api/connectors/live`
- `POST /api/workers/run`
- `POST /api/evidence/seal`
- `GET /api/observability`
- `POST /api/observability`
- `GET /api/enterprise-maturity`
- `POST /api/enterprise-maturity`
- `GET /api/operating-system`
- `POST /api/operating-system`
- `GET /api/policies`
- `POST /api/policies`
- `POST /api/governance/continuous-simulation`
- `GET /api/governance/predictive-risk`
- `POST /api/governance/apply-fix`

See [docs/API.md](docs/API.md) for the full API reference.

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

## Demo Flow

1. Open `/` and load prototype data.
2. Review findings, assets, and remediation actions.
3. Run a simulation and generate a remediation plan.
4. Route a workflow and attach evidence.
5. Open `/asset-graph` to inspect blast radius and risk transfer.
6. Open `/enterprise-maturity` and click **Build all 10**.
7. Open `/pilot-control-plane` and click **Activate all 10**.
8. Open `/virtual-patching` and click **Activate controls**.
9. Open `/final-production` and click **Finalize readiness**.
10. Open `/production-ops` to run workers, seal evidence, and inspect telemetry.
11. Open `/operating-system` and `/governance` to review closed-loop maturity.

## Commands

```bash
npm run dev
npm run typecheck
npm test
DATABASE_URL="file:./dev.db" npm run build
npm run db:generate
npm run db:push
npm run db:deploy
```

## Environment

Required or recommended variables are documented in `.env.example`:

- `DATABASE_URL`
- `APP_URL`
- `SESSION_SECRET`
- `SECRET_PROVIDER`
- `WORKER_CONCURRENCY`
- `EVIDENCE_STORAGE_URL`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `ALERT_WEBHOOK_URL`
- `JIRA_BASE_URL`
- `GITHUB_APP_ID`
- `SERVICENOW_INSTANCE_URL`
- `OIDC_ISSUER`
- `OIDC_CLIENT_ID`
- `RATE_LIMIT_PER_MINUTE`

## Deployment

For production, use a managed relational database, external secret manager, object storage for evidence, worker runtime, enterprise identity provider, telemetry collector, and alert routing.

Container deployment:

```bash
docker compose -f docker-compose.prod.yml up --build
```

Migration deployment:

```bash
npm run db:deploy
```

## Documentation

- [Product Requirements Document](PRD.md)
- [API Reference](docs/API.md)
- [Architecture Notes](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Model](docs/SECURITY.md)
- [Runbook](docs/RUNBOOK.md)
