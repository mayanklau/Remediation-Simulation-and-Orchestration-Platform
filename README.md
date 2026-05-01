# Remediation Twin

Remediation Twin is an enterprise remediation operating system for turning chaotic security findings into prioritized, simulated, approved, campaign-managed, and auditable remediation work.

It ingests vulnerability, cloud, identity, infrastructure, application, and compliance findings; maps them to assets and ownership; scores business risk; simulates remediation impact before execution; generates rollout and rollback plans; routes approvals; tracks campaigns; and exports evidence.

## Implemented Product

- Multi-tenant Next.js and Prisma application
- JSON, CSV, and prototype finding ingestion
- Asset inventory and dependency graph
- Finding deduplication and source correlation
- Risk and business-risk scoring
- Remediation action generation
- Simulation engine for patch, network, IAM, cloud, and compliance actions
- Rollout, rollback, validation, and evidence plan generation
- Approval workflow, comments, decisions, and evidence capture
- Jira, GitHub, ServiceNow, scanner, cloud, and Kubernetes connector run framework
- Connector onboarding and ingestion job readiness
- SSO metadata, RBAC evaluation, audit timeline, and reporting
- CI/CD, Kubernetes, cloud, IAM, and policy-fix dry-run automation hooks
- Risk exceptions, freeze windows, auto-approval policies, and evidence gates
- Continuous simulation, predictive residual risk, and policy-governed fixes
- Self-updating remediation campaigns and campaign board
- Enterprise maturity command center for the ten advanced capability tracks
- Pilot control plane for the next ten production-pilot capabilities

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Executive dashboard |
| `/findings` | Finding backlog |
| `/assets` | Asset inventory |
| `/asset-graph` | Asset dependency and risk-transfer map |
| `/remediation` | Remediation queue |
| `/simulations` | Simulation history |
| `/workflows` | Approval workflow |
| `/evidence` | Evidence readiness |
| `/connectors` | Connector onboarding |
| `/ingestion-jobs` | Durable ingestion operations |
| `/campaign-board` | Campaign operating board |
| `/operating-system` | Closed-loop remediation control plane |
| `/pilot-control-plane` | Production-pilot activation for the next ten capabilities |
| `/enterprise-maturity` | Ten-track maturity command center |
| `/governance` | Autonomous remediation governance |
| `/enterprise` | SSO, RBAC, and enterprise readiness |
| `/audit` | Audit timeline |

## Enterprise Maturity Tracks

The `/enterprise-maturity` command center operationalizes all ten advanced roadmap areas:

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

Click **Build all 10** or call `POST /api/enterprise-maturity` with `{ "action": "advance_all" }` to create connector profiles, connector health runs, governance guardrail policies, dry-run execution hooks, OIDC readiness, RBAC bindings, an executive report, a maturity campaign, and an audit record from live tenant data.

## Pilot Control Plane

The `/pilot-control-plane` view moves the product from maturity tracking into pilot execution readiness for another ten concrete enterprise needs:

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

Click **Activate all 10** or call `POST /api/pilot-control-plane` with `{ "action": "activate_all_10" }` to configure scanner connector profiles, run dry-run connector checks, create policy-as-code controls, attach simulation and plan records, route approval workflows, generate evidence artifacts, create dry-run execution records, refresh dashboards, configure SSO/RBAC readiness, and write an audit event.

## API Highlights

- `GET /api/dashboard`
- `POST /api/ingest/json`
- `POST /api/ingest/csv`
- `POST /api/mock-ingest`
- `GET /api/assets`
- `GET /api/findings`
- `GET /api/remediation-actions`
- `POST /api/remediation-actions/:id/simulate`
- `POST /api/remediation-actions/:id/plan`
- `POST /api/remediation-actions/:id/workflow`
- `GET /api/pilot-readiness`
- `POST /api/pilot-readiness`
- `GET /api/pilot-control-plane`
- `POST /api/pilot-control-plane`
- `GET /api/enterprise-maturity`
- `POST /api/enterprise-maturity`
- `GET /api/operating-system`
- `POST /api/operating-system`
- `GET /api/policies`
- `POST /api/policies`
- `POST /api/governance/continuous-simulation`
- `GET /api/governance/predictive-risk`
- `POST /api/governance/apply-fix`

See [docs/API.md](docs/API.md) for more detail.

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

For build verification:

```bash
DATABASE_URL="file:./dev.db" npm run build
```

## Demo Flow

1. Open `/` and load prototype data.
2. Review findings, assets, and remediation actions.
3. Run a simulation and generate a plan.
4. Route a workflow and attach evidence.
5. Open `/connectors`, `/ingestion-jobs`, and `/campaign-board`.
6. Open `/enterprise-maturity` and click **Build all 10**.
7. Open `/pilot-control-plane` and click **Activate all 10**.
8. Open `/operating-system` and `/governance` to review closed-loop maturity.

## Commands

```bash
npm run dev
npm run typecheck
npm test
DATABASE_URL="file:./dev.db" npm run build
npm run db:generate
npm run db:push
```

## Production Notes

For production, replace SQLite with a managed relational database, configure secret references for connector credentials, run ingestion and simulation in background workers, add OpenTelemetry traces, enforce environment-specific policy controls, and connect enterprise identity providers.

## Documentation

- [Product Requirements Document](PRD.md)
- [API Reference](docs/API.md)
- [Architecture Notes](docs/ARCHITECTURE.md)
- [Runbook](docs/RUNBOOK.md)
