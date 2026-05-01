# Remediation Twin

Remediation Twin is an enterprise remediation simulation, orchestration, and agentic governance platform. It turns findings from scanners, cloud security tools, code security, IAM, Kubernetes, ticketing, and compliance sources into prioritized remediation work that can be simulated, approved, virtually patched, executed in dry-run, governed through campaigns, and sealed with audit-grade evidence.

The platform is built for enterprises overwhelmed by remediation volume. It answers which findings matter, what assets are affected, what will break if remediation is applied, whether a virtual patch or path breaker should be used first, who must approve the change, and what evidence proves the work was safe.

## Major Capabilities

- Multi-tenant Next.js and Prisma application with tenant-scoped APIs.
- JSON, CSV, mock, and connector-driven ingestion contracts.
- Asset inventory, ownership, dependency mapping, and blast-radius analysis.
- Risk scoring, business-risk prioritization, deduplication, and remediation action generation.
- Simulation engine for patch, network, IAM, cloud, Kubernetes, application, and compliance remediation.
- Rollout, rollback, validation, approval, and evidence plan generation.
- Governance policies for freeze windows, evidence gates, crown-jewel controls, risk exceptions, and auto-approval.
- Virtual patching and attack-path breaker workflows for compensating controls before permanent remediation.
- Agentic remediation orchestrator that integrates with any LLM, SLM, enterprise model gateway, or deterministic fallback.
- Jira, GitHub, ServiceNow, scanner, cloud, Kubernetes, IAM, and CI/CD connector framework.
- Campaign board, self-updating remediation campaigns, continuous simulation, and predictive residual risk.
- Signed sessions, SSO contracts, RBAC evaluation, security headers, rate-limit hooks, CSRF helpers, and audit trail.
- Worker runner for ingestion, simulation, connector sync, evidence, automation, and rollback coordination.
- Evidence packs, evidence sealing, hash chaining, retention metadata, observability, health checks, and production telemetry.
- Docker, production compose, baseline Prisma migration, and CI workflow for typecheck, tests, and build.

## Agentic Orchestrator

The `/agentic` module makes the platform model-agnostic and agentic while keeping production execution governed.

Supported model modes:

| Provider | Environment |
| --- | --- |
| Deterministic fallback | Always enabled |
| OpenAI-compatible or model gateway | `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` |
| Anthropic-compatible | `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL` |
| Gemini-compatible | `GEMINI_API_KEY`, `GEMINI_BASE_URL`, `GEMINI_MODEL` |
| Local SLM | `LOCAL_SLM_URL`, `LOCAL_SLM_MODEL` |

Agentic behavior:

- Builds tenant-scoped context from findings, assets, actions, simulations, workflows, policies, evidence, reports, automation runs, virtual patch candidates, and path-breaker candidates.
- Selects a configured model provider and falls back to deterministic rules if the requested provider is unavailable or fails.
- Exposes a governed tool registry for ingestion, simulation, plan generation, virtual patching, path breaking, approval routing, connector execution, and evidence sealing.
- Keeps live execution dry-run by default until credentials, approval policies, change windows, rollback plans, and evidence gates are configured.
- Treats model output as advisory. Deterministic policy gates decide execution eligibility.
- Never sends raw connector secrets to model prompts.
- Stores every agent run as an `agentic_plan` report snapshot and writes an audit log.

Run an agentic plan:

```bash
curl -X POST http://localhost:3000/api/agentic \
  -H "content-type: application/json" \
  -d '{"goal":"virtual_patch","prompt":"Plan safest next actions with virtual patching and path breakers.","dryRun":true}'
```

## Key Modules

| Module | Purpose |
| --- | --- |
| Dashboard | Executive overview of risk, findings, actions, evidence, and readiness. |
| Findings | Canonical finding backlog after normalization and deduplication. |
| Assets | Inventory of systems, owners, exposure, criticality, and sensitivity. |
| Asset Graph | Dependency graph with risk transfer, blast radius, and concentration analysis. |
| Remediation Queue | Actions that can be simulated, planned, approved, and verified. |
| Simulations | Historical simulation runs with confidence, risk reduction, and operational risk. |
| Workflows | Approval and execution workflow tracking. |
| Evidence | Evidence readiness and evidence pack exports. |
| Connectors | Enterprise connector onboarding and dry-run execution. |
| Virtual Patching | Compensating controls and attack-path breaker workflow. |
| Agentic Orchestrator | Model-agnostic planning with safety rails, tool registry, and audit persistence. |
| Production Ops | Runtime workers, SSO/session contracts, telemetry, evidence sealing, and live connector dry-runs. |
| Governance | Policies, exceptions, continuous simulation, predictive risk, and governed fixes. |

## Virtual Patching And Path Breakers

The `/virtual-patching` module protects the enterprise before permanent remediation is safe:

- Detects candidates when a finding is internet-exposed, lacks a patch, or affects cloud, IAM, network, app, or container surfaces.
- Recommends WAF, API gateway, service mesh, EDR, admission controller, cloud policy, IAM, and network controls.
- Scores attack paths from exposed assets to high-value targets.
- Proposes deny rules, microsegmentation, route quarantine, conditional IAM denies, and virtual patch controls.
- Runs canary simulations, generates remediation plans, creates dry-run connector records, and writes audit logs.

```bash
curl -X POST http://localhost:3000/api/virtual-patching \
  -H "content-type: application/json" \
  -d '{"action":"activate"}'
```

## Production-Ready Architecture

The app includes the production foundation expected for an enterprise pilot: multi-tenancy, Prisma persistence, tenant-scoped APIs, RBAC, SSO/session contracts, signed sessions, CSRF helpers, security headers, request throttling, secret-reference patterns, durable connector and automation records, worker lane contracts, evidence packs, evidence sealing, hash chaining, audit logs, observability, Docker deployment, production compose, baseline migration, and CI.

Live production execution remains intentionally governed and dry-run by default until enterprise credentials, identity provider metadata, approval policies, change windows, storage targets, telemetry endpoints, and optional model gateway credentials are configured.

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
- `GET /api/assets`
- `GET /api/asset-graph`
- `GET /api/findings`
- `GET /api/remediation-actions`
- `POST /api/remediation-actions/:id/simulate`
- `POST /api/remediation-actions/:id/plan`
- `POST /api/remediation-actions/:id/workflow`
- `GET /api/virtual-patching`
- `POST /api/virtual-patching`
- `GET /api/agentic`
- `POST /api/agentic`
- `POST /api/connectors/live`
- `POST /api/workers/run`
- `POST /api/evidence/seal`
- `GET /api/observability`
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

## Verification

```bash
npm run typecheck
npm test
DATABASE_URL="file:./dev.db" npm run build
```

## Environment

Required and optional variables are listed in `.env.example`, including model-provider variables for LLM gateways and local SLMs.

## Documentation

- [Product Requirements Document](PRD.md)
- [API Reference](docs/API.md)
- [Architecture Notes](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Model](docs/SECURITY.md)
- [Runbook](docs/RUNBOOK.md)
