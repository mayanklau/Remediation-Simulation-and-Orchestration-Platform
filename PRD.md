# Product Requirements Document: Remediation Twin

## 1. Product Summary

**Product name:** Remediation Twin

**Category:** Enterprise remediation operating system

**One-line description:** Remediation Twin ingests security and compliance findings, maps them to enterprise assets, prioritizes business risk, simulates remediation before execution, orchestrates approvals and campaigns, and produces audit-grade evidence.

## 2. Problem

Enterprises have many detection tools but no trusted system of action for remediation. Security teams receive overlapping findings from scanners, cloud platforms, code tools, IAM analyzers, compliance systems, and ticketing workflows. Engineering teams are asked to remediate without clear ownership, blast-radius analysis, rollout guidance, rollback planning, or approval context.

The result is a large remediation backlog, duplicated tickets, missed SLAs, production-risk anxiety, unclear accountability, and scattered audit evidence.

Remediation Twin answers:

- What should we fix first?
- Which assets, services, teams, and business processes are affected?
- What could break if we apply the remediation?
- Which approvals, exceptions, or freeze windows apply?
- What is the safest rollout and rollback plan?
- Can low-risk work be auto-approved under policy?
- How do we prove the remediation happened and reduced risk?

## 3. Target Users

**CISO and security leadership**

- Needs measurable risk reduction, board-ready reporting, and proof that remediation work is actually reducing exposure.

**Vulnerability management team**

- Needs deduplication, prioritization, SLA tracking, scanner ingestion reliability, and campaign-level execution.

**Cloud, infrastructure, and platform engineering**

- Needs safe remediation plans, dependency context, simulation confidence, and controlled execution paths.

**GRC and audit teams**

- Need evidence packs, policy history, exception records, approval traces, and control remediation proof.

**Change managers**

- Need rollout, rollback, freeze-window, and approval information before production remediation is allowed.

## 4. Product Thesis

Detection tells enterprises what is wrong. Remediation Twin tells them what to fix first, what will happen if they fix it, how to roll it out safely, who must approve it, and how to prove it worked.

The product is not a scanner, SIEM, SOAR, or ticketing replacement. It is the operating layer above those systems.

## 5. Core Product Loop

1. Ingest findings from CSV, API, scanners, cloud platforms, code security tools, and compliance systems.
2. Normalize, deduplicate, and correlate source findings.
3. Map findings to assets, owners, business services, exposure, and dependencies.
4. Score technical and business risk.
5. Generate remediation actions.
6. Simulate remediation impact before execution.
7. Generate rollout, validation, rollback, and evidence requirements.
8. Route approvals, exceptions, and freeze-window checks.
9. Execute or dry-run through governed automation hooks.
10. Capture evidence and update remediation campaigns.
11. Learn from outcomes and continuously refresh risk posture.

## 6. Current Implemented Scope

The repository contains a full-stack Next.js and Prisma application with tenant-scoped APIs and production-oriented domain logic.

Implemented capabilities:

- Multi-tenant backend
- JSON and CSV finding ingestion
- Mock ingestion for demonstrations
- Asset inventory and relationship mapping
- Finding deduplication and source correlation
- Risk and business-risk scoring
- Remediation action generation
- Simulation engine for patch, network, IAM, cloud, and compliance remediation
- Remediation plan generation
- Approval workflows
- Evidence capture and evidence readiness
- Connector run framework
- Connector onboarding readiness
- Live ingestion job tracking
- SSO metadata configuration
- Advanced RBAC evaluation
- Reporting snapshots
- CI/CD, Kubernetes, cloud, and IAM dry-run automation hooks
- Policy-governed remediation and risk-based auto-approval
- Risk exceptions and change freeze windows
- Asset graph and audit timeline
- Continuous simulation
- Predictive residual-risk modeling
- Self-updating remediation campaigns
- Campaign operating board
- Autonomous remediation operating-system view
- Ten-track enterprise maturity command center

## 7. Primary Application Surfaces

| Surface | Route | Purpose |
| --- | --- | --- |
| Dashboard | `/` | Executive remediation overview |
| Findings | `/findings` | Finding backlog and detail |
| Assets | `/assets` | Asset inventory |
| Asset Graph | `/asset-graph` | Dependency, exposure, and risk transfer view |
| Remediation Queue | `/remediation` | Generated remediation actions |
| Simulations | `/simulations` | Simulation history and impact contracts |
| Workflows | `/workflows` | Approval workflow management |
| Evidence | `/evidence` | Evidence records and readiness |
| Integrations | `/integrations` | Integration registry |
| Connectors | `/connectors` | Connector onboarding readiness |
| Ingestion Jobs | `/ingestion-jobs` | Scanner/API ingestion job operations |
| Reports | `/reports` | Executive reporting |
| Automation | `/automation` | Execution hook dry runs |
| Policies | `/policies` | Governance policy builder |
| Exceptions | `/exceptions` | Risk exceptions and freeze windows |
| Campaigns | `/campaigns` | Self-updating remediation campaigns |
| Campaign Board | `/campaign-board` | Campaign operating board |
| Maturity | `/enterprise-maturity` | Ten-track enterprise maturity command center |
| Governance | `/governance` | Autonomous remediation governance |
| Control Plane | `/operating-system` | Closed-loop remediation operating system |
| Enterprise | `/enterprise` | SSO, RBAC, and connector readiness |
| Audit | `/audit` | Unified audit timeline |
| Settings | `/settings` | Tenant settings |

## 8. Pilot Readiness Requirements

### 8.1 Connector Onboarding

The platform must allow enterprise teams to onboard connectors safely before production credentials or execution rights are granted.

Requirements:

- Maintain a provider registry for Jira, GitHub, ServiceNow, Tenable, Qualys, Wiz, Snyk, AWS Security Hub, Kubernetes, and future connectors.
- Store connection profiles with provider, name, owner, environment, auth mode, sync cadence, and approved scopes.
- Track health status and latest run status.
- Score readiness per connector.
- Show required connector coverage and total connector coverage.
- Recommend next steps such as create profile, attach credential reference, approve scopes, run health check, or review errors.
- Default execution-capable connectors to dry-run behavior until explicitly configured.

### 8.2 Ingestion Jobs

The platform must treat ingestion as an operational workflow.

Requirements:

- Track provider, source, operation, submitter, status, created time, started time, and completed time.
- Track received, accepted, rejected, and error record counts.
- Support scanner and API ingestion job history.
- Expose ingestion success rate.
- Preserve durable run records for audit and troubleshooting.

### 8.3 Campaign Operations

The platform must turn remediation work into measurable enterprise campaigns.

Requirements:

- Create and refresh campaigns from live findings and remediation actions.
- Track campaign objective, owner, status, criteria, and plan.
- Show action count, blockers, ready-for-approval count, in-approval count, evidence-ready count, and risk in scope.
- Link campaign state to simulations, workflows, and evidence artifacts.
- Support executive operating reviews and weekly remediation governance.

## 9. API Requirements

Core APIs:

- `GET /api/dashboard`
- `POST /api/ingest/json`
- `POST /api/ingest/csv`
- `POST /api/mock-ingest`
- `GET /api/assets`
- `POST /api/assets`
- `GET /api/findings`
- `GET /api/remediation-actions`
- `POST /api/remediation-actions/:id/simulate`
- `POST /api/remediation-actions/:id/plan`
- `POST /api/remediation-actions/:id/workflow`
- `GET /api/workflows`
- `GET /api/reports`
- `POST /api/reports`
- `GET /api/policies`
- `POST /api/policies`
- `GET /api/asset-graph`
- `GET /api/operating-system`
- `POST /api/operating-system`
- `GET /api/pilot-readiness`
- `POST /api/pilot-readiness`
- `GET /api/enterprise-maturity`
- `POST /api/enterprise-maturity`
- `GET /api/evidence/packs`
- `GET /api/audit/timeline`

`POST /api/pilot-readiness` supports:

- `create_connector`
- `start_ingestion`

`POST /api/enterprise-maturity` supports:

- `advance_all`

## 9.1 Enterprise Maturity Requirements

The product must include a command center that operationalizes all ten enterprise advancement tracks from the product roadmap.

Requirements:

- Score real connector framework readiness from integration profiles and connector run history.
- Score simulation sandbox coverage from remediation actions and simulation history.
- Score policy engine maturity from enabled auto-approval, CAB, evidence, exception, and automation guardrail policies.
- Score campaign studio maturity from active remediation campaigns and campaign operating state.
- Score AI copilot upgrade readiness from deterministic copilot contracts, reports, campaigns, and remediation action context.
- Score enterprise security readiness from SSO configuration, RBAC bindings, audit trail, and tenant isolation posture.
- Score execution orchestration readiness from CI/CD, Kubernetes, cloud, IAM, and policy-fix hooks.
- Score evidence and compliance maturity from evidence artifacts, workflow evidence coverage, and executive reports.
- Score maturity dashboard readiness from debt, backlog, blocked work, overdue work, scanner noise, and autonomy signals.
- Score production hardening from audit, retry telemetry, run records, deployment posture, and governance guardrails.
- Provide one action to create the baseline operating layer for all ten tracks while keeping execution in dry-run mode until explicitly configured.

## 10. Functional Requirements

### Finding Ingestion

- Normalize findings from JSON and CSV.
- Preserve source payloads.
- Deduplicate by fingerprint.
- Create or update assets during ingestion.
- Generate remediation actions from findings.

### Risk Scoring

- Combine severity, exploitability, active exploitation, patch availability, asset criticality, data sensitivity, exposure, environment, and compensating controls.
- Generate business-risk score and explanation.

### Simulation

- Simulate remediation type, confidence, risk reduction, operational risk, affected assets, dependencies, approvals, rollout, rollback, and validation.
- Support patch, network, IAM, cloud, and compliance scenarios.

### Workflow and Approval

- Create workflow items from remediation actions.
- Support assignees, comments, approvals, decisions, evidence, and due dates.
- Route high-risk changes through approval gates.

### Governance

- Maintain policies for auto-approval, continuous simulation, change freezes, approval routing, and risk exceptions.
- Support advisory and enforced modes.
- Record audit logs for governed operations.

### Evidence

- Attach evidence artifacts to workflows.
- Score evidence readiness.
- Support evidence-pack export contracts.

## 11. Non-Functional Requirements

- Tenant isolation across all APIs.
- Deterministic connector and automation behavior by default.
- Least-privilege connector configuration.
- Dry-run execution before real production automation.
- Audit-friendly durable records.
- No destructive automation without explicit policy and approval.
- Local SQLite support for development.
- Production database support through Prisma-compatible relational databases.
- TypeScript validation and test coverage for core domain logic.

## 12. Phase Roadmap

### Phase 0: Prototype

Goal: Prove concept with sample data and limited simulation.

Scope:

- Mock ingestion
- Findings dashboard
- Asset mapping
- Basic risk scoring
- One simulation type
- Plan generation

### Phase 1: Production MVP

Goal: Support a real enterprise pilot.

Scope:

- Multi-tenant backend
- CSV and API ingestion
- Ingestion job tracking
- Asset inventory
- Risk scoring
- Remediation queue
- Simulation engine v1
- Approval workflow
- Jira and GitHub integration framework
- Evidence export
- AI copilot v1
- Connector onboarding readiness

### Phase 2: Enterprise Readiness

Goal: Prepare for broader enterprise deployment.

Scope:

- SSO
- Advanced RBAC
- ServiceNow integration
- More scanner integrations
- Advanced reporting
- Audit hardening
- Scale improvements
- More simulation types
- Connector health and scope governance

### Phase 3: Automation Expansion

Goal: Expand execution orchestration.

Scope:

- CI/CD execution hooks
- Kubernetes rollout automation
- Cloud remediation automation
- IAM policy automation
- Risk-based auto-approval policies
- Policy simulation before policy rollout

### Phase 4: Autonomous Remediation Governance

Goal: Enable trusted semi-autonomous remediation.

Scope:

- Policy-governed automated fixes
- Continuous simulation
- Predictive risk modeling
- Self-updating remediation campaigns
- Campaign operating board
- Advanced AI planning and verification

## 13. Success Metrics

- Reduction in duplicate remediation tickets
- Reduction in manual triage time
- Increase in simulated actions before approval
- Increase in SLA adherence
- Reduction in high-risk exposure
- Increase in evidence-pack readiness
- Connector onboarding coverage
- Ingestion job success rate
- Campaign execution readiness
- Time from finding ingestion to approved remediation plan

## 14. Production Notes

For production deployment, replace local SQLite with a managed relational database, configure secret management for connector credentials, add background workers for long-running ingestion and simulation jobs, connect enterprise identity providers, and enforce environment-specific policy controls.

## 15. Final Positioning

Remediation Twin should be positioned as the enterprise remediation operating system. Detection tools identify risk. Remediation Twin decides, simulates, governs, campaigns, executes, and proves remediation.
