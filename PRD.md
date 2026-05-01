# Product Requirements Document: Remediation Twin

## Product Summary

**Product name:** Remediation Twin

**Category:** Enterprise remediation operating system

**Description:** Remediation Twin ingests security and compliance findings, maps them to enterprise assets, prioritizes business risk, simulates remediation before execution, orchestrates approvals and campaigns, and produces audit-grade evidence.

## Problem

Enterprises have many detection tools but no trusted system of action for remediation. Security teams receive overlapping findings from scanners, cloud platforms, code tools, IAM analyzers, compliance systems, and ticketing workflows. Engineering teams are asked to remediate without clear ownership, blast-radius analysis, rollout guidance, rollback planning, or approval context.

The result is duplicated tickets, missed SLAs, production-risk anxiety, unclear accountability, and scattered audit evidence.

## Target Users

- CISO and security leadership
- Vulnerability management teams
- Cloud, infrastructure, and platform engineering
- GRC and audit teams
- Change managers and service owners

## Product Loop

1. Ingest findings from CSV, API, scanners, cloud platforms, code tools, and compliance systems.
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

## Implemented Scope

- Multi-tenant backend and tenant-scoped APIs
- JSON and CSV finding ingestion
- Asset inventory and asset graph
- Deduplication and source correlation
- Risk scoring and remediation action generation
- Simulation, planning, workflow, approvals, and evidence
- Connector registry and durable connector runs
- Pilot readiness, connector onboarding, and ingestion jobs
- SSO metadata, RBAC evaluation, reporting, and audit
- Automation hooks for CI/CD, Kubernetes, cloud, IAM, and policy fixes
- Governance policies, risk exceptions, freeze windows, and auto-approval
- Continuous simulation and predictive residual risk
- Remediation campaigns and campaign board
- Closed-loop operating-system view
- Enterprise maturity command center
- Pilot control plane for production-pilot activation
- Final production completion center

## Enterprise Maturity Requirements

The product must operationalize ten advanced maturity tracks:

| Track | Requirement |
| --- | --- |
| Real connector framework | Register scanner, cloud, ticketing, code, CMDB, and execution connectors with health and run telemetry. |
| Simulation sandbox | Score blast radius, rollback feasibility, confidence, risk reduction, and operational risk before approval. |
| Policy engine | Support auto-approval, CAB routing, freeze windows, evidence gates, exceptions, and crown-jewel guardrails. |
| Remediation campaign studio | Group remediation into measurable campaigns with owners, waves, blockers, approvals, evidence, and risk in scope. |
| AI copilot upgrade | Provide deterministic copilot contracts for summaries, rollout plans, exception drafts, tickets, and weekly deltas. |
| Enterprise security layer | Support SSO readiness, RBAC bindings, tenant isolation, audit trail, and secrets-reference posture. |
| Execution orchestration | Provide dry-run hooks for CI/CD, Kubernetes, cloud controls, IAM policy changes, and policy-governed fixes. |
| Evidence and compliance packs | Track before state, simulation, approval, execution logs, validation, and report snapshots. |
| Maturity dashboards | Show debt, high-risk backlog, blocked work, overdue work, scanner noise reduction, and autonomy eligibility. |
| Production hardening | Expose retry telemetry, run records, audit logs, deployment posture, and operational guardrails. |

`POST /api/enterprise-maturity` with `{ "action": "advance_all" }` must create the baseline operating layer for all ten tracks while keeping execution in dry-run mode.

## Production-Pilot Requirements

The product must also support the next ten pilot-grade operating capabilities:

| Capability | Requirement |
| --- | --- |
| Real scanner connectors | Configure Tenable, Qualys, Wiz, Snyk, GitHub Advanced Security, and AWS Security Hub connector profiles with health and dry-run checks. |
| True simulation engine | Run simulations across open remediation actions and calculate confidence, risk reduction, operational risk, affected assets, rollout, rollback, and validation guidance. |
| Remediation playbook library | Map remediation actions to reusable playbooks for patch rollout, container rebuild, IAM least privilege, Kubernetes policy, cloud controls, and exceptions. |
| Policy-as-code | Persist enforceable controls for auto-approval, freeze windows, evidence gates, crown-jewel manual approval, and duplicate suppression. |
| Approval workbench | Create routed workflow items with service-owner, security, risk-owner, and CAB approval trails. |
| Jira, GitHub, and ServiceNow execution | Produce durable connector-run records for external ticket, pull request, and change-management dry runs. |
| Evidence vault | Generate before-state, simulation, execution-log, and validation artifacts and expose evidence-pack readiness. |
| AI remediation planner | Generate deterministic remediation plans and executive summaries from tenant data that can later be backed by an LLM provider. |
| Executive dashboards | Refresh reports and campaign metrics for leadership-level debt, SLA, evidence, automation, and readiness reporting. |
| Production SaaS layer | Prepare SSO/OIDC, RBAC bindings, tenant isolation, audit trail, dry-run workers, and hardening controls. |

`POST /api/pilot-control-plane` with `{ "action": "activate_all_10" }` must activate these capabilities from existing tenant data, avoid raw secret storage, and keep all execution in dry-run mode until live credentials and policy approvals are configured.

## Final Production Requirements

The final completion layer must close the last production readiness controls:

| Control | Requirement |
| --- | --- |
| Database and migrations | Support production database deployment, migration deploy, backup posture, and environment separation. |
| Auth, SSO, and RBAC | Prepare SSO/OIDC, session hardening, RBAC bindings, and access auditability. |
| Connector secret references | Require external secret references and prohibit raw secret storage. |
| Background workers | Represent ingestion, simulation, evidence, connector sync, and rollback worker lanes. |
| Live integration runway | Validate live Jira, GitHub, ServiceNow, scanner, Kubernetes, cloud, and IAM readiness through dry-run records. |
| Executable policy runtime | Enforce execution attestation, evidence retention, tenant boundary, and observability policies. |
| Evidence vault and retention | Track immutable evidence retention controls and evidence storage readiness. |
| Observability and operations | Expose health checks, run records, audit records, metrics readiness, and alert integration posture. |
| Enterprise deployment | Provide production Docker compose, environment contract, and deployment guide. |
| Security hardening | Apply security headers, tenant isolation posture, RBAC catalog, audit history, and dry-run defaults. |

`POST /api/final-production` with `{ "action": "finalize" }` must create the final policies, worker hooks, rollback coordinator, production report, readiness campaign, SSO/RBAC records, connector readiness checks, and audit event.

## Primary Routes

- `/`
- `/findings`
- `/assets`
- `/asset-graph`
- `/remediation`
- `/simulations`
- `/workflows`
- `/evidence`
- `/connectors`
- `/ingestion-jobs`
- `/campaign-board`
- `/operating-system`
- `/pilot-control-plane`
- `/final-production`
- `/enterprise-maturity`
- `/governance`
- `/enterprise`
- `/audit`

## Success Metrics

- Connector coverage
- Ingestion success rate
- Duplicate-source reduction
- Simulation coverage
- Approval coverage
- Evidence coverage
- Campaign execution readiness
- Risk-reduction potential
- Auto-approval eligibility
- Enterprise maturity score
- Pilot readiness score
- Final production completion score

## Non-Goals

- Replace scanners, SIEM, SOAR, ITSM, or CI/CD systems
- Execute production changes without explicit policy and credential configuration
- Store raw secrets directly in application tables

## Production Readiness Notes

Production deployment should use a managed relational database, background workers, queue-backed ingestion and simulation, enterprise secret management, OpenTelemetry tracing, SSO/SCIM integration, immutable audit storage, and environment-specific governance policies.
