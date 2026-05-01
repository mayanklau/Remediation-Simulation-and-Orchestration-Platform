# Remediation Simulation and Orchestration Platform

Enterprise remediation control plane for ingesting security findings, normalizing risk, simulating remediation impact, generating rollout plans, managing approvals, and preserving audit evidence.

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

## Core Capabilities

- Phase 0 prototype mode with mock ingestion, sample asset mapping, basic scoring, simulation, and plan generation
- Multi-tenant backend with tenant-scoped APIs and data model
- Finding ingestion through JSON and CSV APIs
- Asset inventory and ownership mapping
- Finding deduplication and risk scoring
- Remediation action generation
- Simulation engine for patch rollout, network policy, IAM policy, cloud configuration, and compliance control changes
- Plan generation with rollout, validation, and rollback steps
- Workflow approvals
- Evidence capture and export
- Jira, GitHub, ServiceNow, scanner, cloud, and Kubernetes connector run framework
- SSO metadata configuration and advanced RBAC permission catalog
- Advanced reporting snapshots
- CI/CD, Kubernetes, cloud, and IAM automation dry-run hooks
- Policy-governed automated fixes, risk-based auto-approval, continuous simulation, predictive risk modeling, and self-updating campaigns
- Dashboard and operational views

## Important

The app starts with an empty database by design. Ingest real findings through:

- `POST /api/ingest/json`
- `POST /api/ingest/csv`

For prototype demonstrations, use the dashboard button or call `POST /api/mock-ingest` to load representative enterprise findings and asset relationships.

## Phase Coverage

| Phase | Implemented surface |
| --- | --- |
| Phase 0 Prototype | Mock ingestion, findings dashboard, asset relationship map, basic risk scoring, simulation, and plan generation |
| Phase 1 Production MVP | Multi-tenant APIs, CSV/API ingestion, inventory, remediation queue, approval workflow, evidence export, Jira/GitHub connector framework, deterministic copilot |
| Phase 2 Enterprise Readiness | SSO metadata, RBAC catalog, ServiceNow and scanner connector registry, reporting snapshots, audit-oriented run records, broader simulation types |
| Phase 3 Automation Expansion | CI/CD, Kubernetes, cloud, and IAM execution hooks with dry-run automation records and risk-aware approval mode |
| Phase 4 Autonomous Governance | Policy-governed fixes, continuous simulation, predictive residual risk model, self-updating campaigns, and AI planning/verification contracts |

See [docs/API.md](docs/API.md) and [docs/RUNBOOK.md](docs/RUNBOOK.md).
