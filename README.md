# EY Remediation Twin

EY Remediation Twin is an enterprise remediation simulation and orchestration platform with an EY-inspired command center experience. It turns security findings from scanners, cloud tools, code security, IAM systems, and compliance sources into prioritized remediation work that can be simulated, approved, executed in dry-run, tracked through campaigns, and sealed with audit-grade evidence.

The product is designed for enterprises that are overwhelmed by remediation volume and need a governed way to answer:

- Which findings actually matter to the business?
- Which assets and services are affected?
- What will break if we remediate?
- Can we virtually patch or break the attack path first?
- Who must approve the change?
- What evidence proves the remediation was safe and complete?

## What It Does

EY Remediation Twin provides a full remediation operating loop:

1. Ingest findings through JSON, CSV, mock ingestion, and connector-run contracts.
2. Normalize, deduplicate, and correlate source findings.
3. Map findings to assets, owners, environments, exposure, and dependencies.
4. Construct vulnerability chains and attack paths across asset, identity, cloud, network, and application relationships.
5. Score technical risk, business risk, path difficulty, and before/after remediation risk.
6. Generate remediation actions.
7. Simulate remediation before execution.
8. Build rollout, rollback, validation, and evidence plans.
9. Route approval workflows.
10. Apply policy guardrails, exceptions, freeze windows, and auto-approval checks.
11. Use virtual patching and path breakers when permanent remediation is risky or delayed.
12. Track campaigns, evidence, audit logs, operational telemetry, and production readiness.

## Major Capabilities

- Multi-tenant Next.js and Prisma application
- Tenant-scoped APIs and persistence
- SSO/OIDC production contract, signed sessions, tenant-boundary checks, and RBAC permission gates enforced through API middleware plus route handlers
- Service, repository, DTO, and shared validation contracts for moving route handlers away from direct persistence logic
- Queue-worker contracts for ingestion, simulation, connector sync, evidence generation, and report snapshots
- Real Prisma migration baseline, seed-free fixture factories, database backup/restore commands, and index-check quality gate
- Runtime configuration validation for local, dev, staging, and production with strict production checks
- JSON, CSV, and prototype finding ingestion
- Asset inventory and dependency graph
- Graph-native vulnerability chaining and attack-path analytics for scanner-normalized inputs
- Risk scoring and business-risk prioritization
- Customer-facing before and after remediation risk scoring
- Remediation action generation
- Simulation engine for patch, network, IAM, cloud, and compliance remediation
- Rollout, rollback, validation, and evidence plan generation
- Approval workflow with comments, decisions, and evidence
- Jira, GitHub, ServiceNow, scanner, cloud, Kubernetes, and IAM connector framework
- Manual connector and integration factory for any scanner, CMDB, ticketing, cloud, code, IAM, notification, or custom HTTP provider with profile persistence and dry-run health checks
- Virtual patching and attack-path breaker control center
- Agentic remediation orchestrator for any LLM, SLM, model gateway, or deterministic fallback
- Governance policies, risk exceptions, freeze windows, evidence gates, and auto-approval
- Continuous simulation and predictive residual risk
- Campaign board and self-updating remediation campaigns
- SSO metadata, signed sessions, RBAC, and audit trail
- Worker runner for ingestion, simulation, evidence, connector sync, and automation
- Evidence sealing with hash chaining and retention metadata
- Observability, health checks, run records, and production telemetry
- CI workflow, Docker Compose, production environment contract, baseline Prisma migration, dependency audit, container scan, and quality gates
- React Flow graph-library UI for asset dependencies, attack paths, exploit preconditions, crown jewels, and path breaker controls with pan, zoom, minimap, risk filtering, inspector, JSON export, empty states, and drill-down views
- Once-and-for-all enterprise readiness catalog covering identity, tenancy, secrets, connectors, ingestion, vulnerability analytics, simulation, orchestration, AI governance, evidence, reporting, platform architecture, security, observability, testing, DevOps, product experience, and commercial packaging
- Production expansion layer for admin onboarding, connector marketplace, data quality, attack-path validation, remediation economics, control drift, post-remediation validation, policy builder, plugin SDK, deployment hardening, security review, executive narratives, demo separation, E2E coverage, and data residency

## Key Modules

| Module | Purpose |
| --- | --- |
| Dashboard | Executive overview of risk, findings, actions, evidence, and readiness. |
| Findings | Canonical finding backlog after normalization and deduplication. |
| Assets | Inventory of systems, owners, exposure, criticality, and sensitivity. |
| Asset Graph | Dependency graph with risk transfer, blast radius, and concentration analysis. |
| Attack Path Analytics | Scanner-agnostic vulnerability chains, path difficulty, and before/after remediation risk. |
| Remediation Queue | Generated remediation actions that can be simulated, planned, approved, and verified. |
| Simulations | Historical simulation runs with confidence, risk reduction, and operational risk. |
| Workflows | Approval and execution workflow tracking. |
| Evidence | Evidence readiness and evidence pack exports. |
| Connectors | Enterprise connector onboarding, manual integration profiles, and dry-run execution. |
| Ingestion Jobs | Durable ingestion operation tracking. |
| Campaign Board | Campaign-level ownership, progress, blockers, and risk. |
| Governance | Policies, exceptions, continuous simulation, predictive risk, and governed fixes. |
| Virtual Patching | Compensating controls and attack-path breaker workflow. |
| Agentic Orchestrator | Model-agnostic planning layer with tool registry, safety rails, dry-run execution, and audit persistence. |
| Enterprise Maturity | Ten-track maturity command center. |
| Enterprise Readiness Catalog | Full enterprise control map with implemented, contract-ready, and external-setup-required status. |
| Pilot Control Plane | Production-pilot activation for real enterprise readiness. |
| Final Production | Final deployability and production closure controls. |
| Production Ops | Runtime workers, SSO/session contracts, telemetry, evidence sealing, and live connector dry-runs. |
| Production Expansion | Remaining enterprise product modules with APIs, workflows, evidence, gates, owners, and deployment posture. |

## Attack Path Analytics

The attack-path module now covers deeper vulnerability analytics and remediation governance:

- Shortest exploitable path and bounded k-hop blast-radius modeling.
- Crown-jewel exposure, choke-point/path-breaker scoring, and centrality-style concentration signals.
- Domain chaining rules for network, IAM, cloud, Kubernetes, application, CI/CD, secrets, and data-store findings.
- Exploit precondition modeling for privilege, network access, user interaction, token scope, and lateral movement.
- Control-specific before/after risk for patching, WAF/API controls, IAM deny, segmentation, container rebuild, and cloud policy.
- Evidence packs covering before state, simulation result, approval, execution log, validation, and residual risk.
- Executive views for business services at risk, risk reduced, blocked remediations, and attack paths closed.

The `/attack-paths` module turns raw scanner findings into end-to-end vulnerability analytics. It is designed around established attack-graph research: logical attack graphs, topological vulnerability analysis, bounded simple-path enumeration, exploit-dependency reasoning, and Bayesian-style risk reduction after controls are applied.

What it does:

- normalizes findings from vulnerability scanners, cloud posture tools, code scanners, IAM analyzers, Kubernetes controls, compliance scanners, and ticket sources into a common chain model
- combines asset dependency edges, internet exposure, criticality, sensitivity, finding category, exploit availability, active exploitation, patch availability, and policy controls
- constructs bounded attack paths from exposed or initial-access assets to crown-jewel and production targets
- returns a graph-library-ready contract with entry nodes, reachability edges, finding/precondition nodes, crown-jewel targets, and breaker controls
- renders a dedicated React Flow Attack Path Graph UI that shows how exposure moves through reachable systems into business-critical targets
- renders a separate Vulnerability Chaining Graph UI that shows each ordered exploit chain, scanner source, mapped technique, difficulty, residual risk, and path breaker
- labels each path with difficulty: `LOW`, `MEDIUM`, `HIGH`, or `VERY_HIGH`
- calculates before-remediation path risk, after-remediation residual risk, risk delta, likelihood, and business impact
- recommends path breakers such as WAF/API gateway virtual patches, microsegmentation, conditional IAM denies, route quarantine, and database access restriction
- snapshots attack-path analytics as evidence-ready report records

### Maturity Additions

The attack-path engine now includes production maturity controls that make the module useful beyond a prototype:

- scanner-family coverage across vulnerability scanners, cloud posture, code security, IAM, network/Kubernetes, and compliance sources
- asset-mapping, exploit-signal, and remediation-signal coverage percentages before paths are trusted
- decision-readiness scoring for customer-ready paths, executive escalations, difficulty, likelihood, and business impact
- subject-maturity checks for scanner normalization, reachability, exploit preconditions, before/after residual risk, path difficulty, breaker controls, evidence, and validation
- development-maturity gates for tenant-scoped access, deterministic graph contracts, policy guardrails, simulation evidence, explainability, and audit snapshots
- per-path evidence requirements, validation plans, and customer-facing before/after risk narratives

The construction method is intentionally scanner-agnostic. Tenable, Qualys, Wiz, Snyk, GitHub Advanced Security, AWS Security Hub, Kubernetes, IAM, cloud configuration, and custom CSV/API feeds can all produce chain steps as long as they provide asset, category, severity, exploitability, and remediation signals.

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

## Agentic Orchestrator

The `/agentic` module makes Remediation Twin model-agnostic and agentic without making it reckless. It can use enterprise LLM gateways, OpenAI-compatible APIs, Anthropic-compatible endpoints, Gemini-compatible endpoints, local SLMs, or the built-in deterministic rules engine.

Core behavior:

- selects the preferred configured model provider, then falls back to deterministic planning if the model is unavailable
- never sends raw secrets to the model prompt
- builds prompts from tenant-scoped findings, assets, simulations, workflows, evidence, policies, automation runs, and virtual patching context
- exposes a governed tool registry for simulation, plan generation, virtual patching, path breaking, approvals, connectors, and evidence sealing
- keeps live execution dry-run by default until credentials, approvals, policy gates, and rollback evidence are present
- stores every agent plan as a report snapshot and writes an audit log entry

Supported providers:

| Provider | Environment |
| --- | --- |
| Deterministic fallback | Always enabled |
| OpenAI-compatible or model gateway | `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` |
| Anthropic-compatible | `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL` |
| Gemini-compatible | `GEMINI_API_KEY`, `GEMINI_BASE_URL`, `GEMINI_MODEL` |
| Local SLM | `LOCAL_SLM_URL`, `LOCAL_SLM_MODEL` |

Activation:

```bash
curl -X POST http://localhost:3000/api/agentic \
  -H "content-type: application/json" \
  -d '{"goal":"virtual_patch","prompt":"Plan safest next actions with virtual patching and path breakers.","dryRun":true}'
```

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
| `/attack-paths` | Attack path graph, vulnerability chaining graph, path difficulty, and before/after remediation risk |
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
| `/agentic` | Model-agnostic agentic remediation orchestrator |
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
- `GET /api/attack-paths`
- `POST /api/attack-paths`
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
- `GET /api/agentic`
- `POST /api/agentic`
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
6. Open `/attack-paths` to review vulnerability chains, difficulty, and before/after remediation risk.
7. Open `/enterprise-maturity` and click **Build all 10**.
8. Open `/pilot-control-plane` and click **Activate all 10**.
9. Open `/virtual-patching` and click **Activate controls**.
10. Open `/agentic` and click **Run agent plan**.
11. Open `/final-production` and click **Finalize readiness**.
12. Open `/production-ops` to run workers, seal evidence, and inspect telemetry.
13. Open `/operating-system` and `/governance` to review closed-loop maturity.

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
- `LLM_BASE_URL`
- `LLM_API_KEY`
- `LLM_MODEL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `LOCAL_SLM_URL`
- `LOCAL_SLM_MODEL`

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
