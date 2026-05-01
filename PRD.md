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

## Non-Goals

- Replace scanners, SIEM, SOAR, ITSM, or CI/CD systems
- Execute production changes without explicit policy and credential configuration
- Store raw secrets directly in application tables

## Production Readiness Notes

Production deployment should use a managed relational database, background workers, queue-backed ingestion and simulation, enterprise secret management, OpenTelemetry tracing, SSO/SCIM integration, immutable audit storage, and environment-specific governance policies.
