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
- Virtual patching and attack-path breaker controls
- Self-updating remediation campaigns and campaign board
- Enterprise maturity command center for the ten advanced capability tracks
- Pilot control plane for the next ten production-pilot capabilities
- Final production completion center with deploy, security, worker, evidence, observability, and hardening controls
- Production operations control room with sessions, SSO, live connector dry-runs, workers, evidence sealing, telemetry, CI, and migrations

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
| `/virtual-patching` | Virtual patching and attack-path breaker control center |
| `/final-production` | Final production readiness and deployment closure |
| `/production-ops` | Runtime workers, telemetry, evidence sealing, live connector dry-runs, and SSO/session operations |
| `/enterprise-maturity` | Ten-track maturity command center |
| `/governance` | Autonomous remediation governance |
| `/enterprise` | SSO, RBAC, and enterprise readiness |
| `/audit` | Audit timeline |

## Virtual Patching And Path Breakers

The `/virtual-patching` control center adds production protection before permanent remediation:

- identifies findings that need compensating controls when no safe patch is immediately available
- recommends WAF, API gateway, service-mesh, cloud-policy, IAM, network, and admission-control virtual patches
- finds dependency paths from exposed assets to high-value targets
- proposes path breakers such as deny rules, microsegmentation, conditional IAM denies, and route quarantine
- runs canary simulations and generates remediation plans for top candidates
- creates dry-run execution records and auditable policies before live enforcement

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

See [docs/API.md](docs/API.md) for more detail.
