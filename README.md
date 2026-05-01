# Remediation Twin

Remediation Twin is an enterprise remediation simulation, orchestration, vulnerability analytics, and agentic governance platform. It turns scanner, cloud, code security, IAM, Kubernetes, ticketing, and compliance findings into prioritized remediation work that can be chained into attack paths, simulated before change, virtually patched, routed for approval, executed in dry-run, tracked through campaigns, and sealed with audit-grade evidence.

The platform is built for enterprises overwhelmed by remediation volume. It answers which findings matter, which assets and services are exposed, how vulnerabilities chain together, what risk exists before remediation, what risk remains after remediation, whether a virtual patch or path breaker should be used first, who must approve the change, and what evidence proves the work was safe.

## Major Capabilities

- Multi-tenant Next.js and Prisma application with tenant-scoped APIs.
- JSON, CSV, mock, and connector-driven ingestion contracts.
- Asset inventory, ownership, dependency mapping, and blast-radius analysis.
- Scanner-normalized vulnerability chaining across Tenable, Qualys, Wiz, Snyk, GitHub Advanced Security, AWS Security Hub, Kubernetes, IAM, cloud posture, compliance, CSV, and API inputs.
- Attack-path construction using asset graph reachability, exposure, exploitability, vulnerability metadata, identity/control relationships, and bounded path enumeration.
- Attack-path difficulty scoring: LOW, MEDIUM, HIGH, and VERY_HIGH.
- Customer-facing before-remediation risk, after-remediation residual risk, and expected risk delta.
- Remediation action generation with rollout, rollback, validation, and evidence plans.
- Simulation engine for patch, network, IAM, cloud, Kubernetes, application, and compliance remediation.
- Governance policies for freeze windows, evidence gates, crown-jewel controls, risk exceptions, and auto-approval.
- Virtual patching and path breaker workflows for compensating controls before permanent remediation.
- Agentic remediation orchestrator that integrates with any LLM, SLM, enterprise model gateway, or deterministic fallback.
- Jira, GitHub, ServiceNow, scanner, cloud, Kubernetes, IAM, and CI/CD connector framework.
- Campaign board, self-updating remediation campaigns, continuous simulation, and predictive residual risk.
- Signed sessions, SSO contracts, RBAC evaluation, security headers, rate-limit hooks, CSRF helpers, and audit trail.
- Worker runner for ingestion, simulation, connector sync, evidence, automation, and rollback coordination.
- Evidence packs, evidence sealing, hash chaining, retention metadata, observability, health checks, and production telemetry.
- Docker, production compose, baseline Prisma migration, and CI workflow for typecheck, tests, and build.

## Attack Path Analytics

The `/attack-paths` module turns scanner noise into end-to-end vulnerability analytics.

Construction method:

1. Normalize scanner findings into the canonical finding model.
2. Map findings to assets, owners, environments, criticality, sensitivity, and exposure.
3. Build an asset graph from service dependencies, network reachability, identity/control relationships, and high-value targets.
4. Select initial-access assets using internet exposure and scanner categories.
5. Select crown-jewel targets using production, criticality, and data-sensitivity signals.
6. Enumerate bounded simple paths from exposed or initial-access assets to crown jewels.
7. Convert each path into a vulnerability chain with scanner source, category, severity, exploit availability, active exploitation, patch availability, business risk, and mapped attack technique.
8. Score difficulty using hop count, exposure, exploitability, active exploitation, patchability, and control friction.
9. Score before-remediation risk and after-remediation residual risk using exploitability, business impact, existing simulations, active controls, patching, virtual patching, and path breakers.
10. Recommend compensating controls such as WAF/API gateway virtual patches, service mesh controls, microsegmentation, conditional IAM deny, route quarantine, and database access restrictions.

API:

```bash
curl http://localhost:3000/api/attack-paths
curl -X POST http://localhost:3000/api/attack-paths \
  -H "content-type: application/json" \
  -d '{"action":"snapshot"}'
```

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

- Builds tenant-scoped context from findings, assets, actions, simulations, workflows, policies, evidence, reports, automation runs, virtual patch candidates, path-breaker candidates, and attack paths.
- Selects a configured model provider and falls back to deterministic rules if the requested provider is unavailable or fails.
- Exposes a governed tool registry for ingestion, simulation, plan generation, virtual patching, path breaking, approval routing, connector execution, and evidence sealing.
- Keeps live execution dry-run by default until credentials, approval policies, change windows, rollback plans, and evidence gates are configured.
- Treats model output as advisory. Deterministic policy gates decide execution eligibility.
- Never sends raw connector secrets to model prompts.
- Stores every agent run as an `agentic_plan` report snapshot and writes an audit log.

## Key Modules

| Module | Purpose |
| --- | --- |
| Dashboard | Executive overview of risk, findings, actions, evidence, and readiness. |
| Findings | Canonical finding backlog after normalization and deduplication. |
| Assets | Inventory of systems, owners, exposure, criticality, and sensitivity. |
| Asset Graph | Dependency graph with risk transfer, blast radius, and concentration analysis. |
| Attack Paths | Vulnerability chains, difficulty scoring, before/after risk, and path breaker recommendations. |
| Remediation Queue | Actions that can be simulated, planned, approved, and verified. |
| Simulations | Historical simulation runs with confidence, risk reduction, and operational risk. |
| Workflows | Approval and execution workflow tracking. |
| Evidence | Evidence readiness and evidence pack exports. |
| Connectors | Enterprise connector onboarding and dry-run execution. |
| Virtual Patching | Compensating controls and path breaker workflow. |
| Agentic Orchestrator | Model-agnostic planning with safety rails, tool registry, and audit persistence. |
| Production Ops | Runtime workers, SSO/session contracts, telemetry, evidence sealing, and live connector dry-runs. |
| Governance | Policies, exceptions, continuous simulation, predictive risk, and governed fixes. |

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
| `/attack-paths` | Vulnerability chaining and attack-path analytics |
| `/remediation` | Remediation queue |
| `/simulations` | Simulation history |
| `/workflows` | Approval workflow |
| `/evidence` | Evidence readiness |
| `/connectors` | Connector onboarding |
| `/campaign-board` | Campaign operating board |
| `/operating-system` | Closed-loop remediation control plane |
| `/pilot-control-plane` | Enterprise pilot activation |
| `/virtual-patching` | Virtual patching and path breaker controls |
| `/agentic` | Model-agnostic agentic remediation orchestrator |
| `/final-production` | Production readiness closure |
| `/production-ops` | Runtime operations |
| `/enterprise-maturity` | Maturity command center |
| `/governance` | Autonomous remediation governance |
| `/enterprise` | SSO, RBAC, and enterprise readiness |
| `/audit` | Audit timeline |

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

## Documentation

- [Product Requirements Document](PRD.md)
- [API Reference](docs/API.md)
- [Architecture Notes](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Model](docs/SECURITY.md)
- [Runbook](docs/RUNBOOK.md)
