# Product Requirements Document: Remediation Twin

## Product Summary

**Product name:** Remediation Twin

**Category:** Enterprise remediation operating system and vulnerability analytics platform

**Description:** Remediation Twin ingests security and compliance findings, maps them to enterprise assets, builds vulnerability chains and attack paths, prioritizes business risk, simulates remediation before execution, orchestrates approvals and campaigns, and produces audit-grade evidence.

## Problem

Enterprises have many detection tools but no trusted system of action for remediation. Security teams receive overlapping findings from scanners, cloud platforms, code tools, IAM analyzers, compliance systems, and ticketing workflows. Engineering teams are asked to remediate without clear ownership, blast-radius analysis, rollout guidance, rollback planning, attack-path context, residual-risk estimates, or approval evidence.

The result is duplicated tickets, missed SLAs, production-risk anxiety, unclear accountability, scattered audit evidence, and poor visibility into how individual vulnerabilities chain into real business risk.

## Target Users

- CISO and security leadership
- Vulnerability management teams
- Cloud, infrastructure, and platform engineering
- AppSec and product security teams
- GRC and audit teams
- Change managers and service owners

## Product Loop

1. Ingest findings from CSV, API, scanners, cloud platforms, code tools, IAM systems, Kubernetes, and compliance systems.
2. Normalize, deduplicate, and correlate source findings.
3. Map findings to assets, owners, services, exposure, dependencies, criticality, and data sensitivity.
4. Build asset, identity, dependency, and reachability graph context.
5. Construct vulnerability chains and attack paths from exposed or initial-access assets to crown-jewel targets.
6. Score technical risk, business risk, path difficulty, before-remediation risk, after-remediation residual risk, and risk delta.
7. Generate remediation, virtual patching, and path breaker actions.
8. Simulate remediation impact before execution.
9. Generate rollout, validation, rollback, and evidence requirements.
10. Route approvals, exceptions, and freeze-window checks.
11. Execute or dry-run through governed automation hooks.
12. Capture evidence and update remediation campaigns.
13. Learn from outcomes and continuously refresh risk posture.

## Implemented Scope

- Multi-tenant backend and tenant-scoped APIs
- JSON and CSV finding ingestion
- Asset inventory and asset graph
- Vulnerability chaining and attack-path analytics
- Scanner-normalized attack graph construction for Tenable, Qualys, Wiz, Snyk, GitHub Advanced Security, AWS Security Hub, Kubernetes, IAM, cloud posture, compliance, CSV, and API inputs
- Bounded path enumeration from exposed assets to crown-jewel targets
- Attack-path difficulty scoring with LOW, MEDIUM, HIGH, and VERY_HIGH bands
- Before-remediation risk, after-remediation risk, and risk-delta calculation
- Virtual patching and path breaker recommendations
- Deduplication and source correlation
- Risk scoring and remediation action generation
- Simulation, planning, workflow, approvals, and evidence
- Connector registry and durable connector runs
- Pilot readiness, connector onboarding, and ingestion jobs
- SSO metadata, RBAC evaluation, reporting, and audit
- Automation hooks for CI/CD, Kubernetes, cloud, IAM, and policy fixes
- Governance policies, risk exceptions, freeze windows, and auto-approval
- Continuous simulation and predictive residual risk
- Agentic remediation orchestrator with any LLM, SLM, model gateway, or deterministic fallback
- Remediation campaigns and campaign board
- Closed-loop operating-system view
- Enterprise maturity command center
- Pilot control plane for production-pilot activation
- Final production completion center
- Production operations control room

## Vulnerability Chaining And Attack Path Requirements

| Capability | Requirement |
| --- | --- |
| Scanner normalization | Accept scanner, cloud, code, IAM, Kubernetes, compliance, CSV, and API inputs through one canonical finding model. |
| Attack graph construction | Build logical attack paths from asset dependencies, exposure, exploit preconditions, identity/control relationships, high-value targets, and vulnerability metadata. |
| Bounded path enumeration | Enumerate bounded simple paths from exposed or initial-access assets to crown-jewel, production, critical, or sensitive targets. |
| Vulnerability chaining | Convert each path into ordered chain steps with source scanner, category, severity, exploit status, patchability, business risk, and mapped attack technique. |
| Difficulty scoring | Label every path as LOW, MEDIUM, HIGH, or VERY_HIGH using hop count, exposure, exploit availability, active exploitation, patchability, and control friction. |
| Before/after risk | Show customer-facing risk before remediation, estimated residual risk after remediation, and the expected risk delta from patching, virtual patching, path breakers, and policy controls. |
| Breaker recommendation | Recommend microsegmentation, WAF/API gateway controls, service mesh policy, conditional IAM deny, route quarantine, and database access restrictions. |
| Evidence snapshot | Persist attack-path analytics as report snapshots and audit records for governance and executive reporting. |

`GET /api/attack-paths` must return the current attack-path model. `POST /api/attack-paths` with `{ "action": "snapshot" }` must save the analytics as evidence-ready reporting data.

## Enterprise Maturity Requirements

| Track | Requirement |
| --- | --- |
| Real connector framework | Register scanner, cloud, ticketing, code, CMDB, and execution connectors with health and run telemetry. |
| Simulation sandbox | Score blast radius, rollback feasibility, confidence, risk reduction, and operational risk before approval. |
| Policy engine | Support auto-approval, CAB routing, freeze windows, evidence gates, exceptions, and crown-jewel guardrails. |
| Remediation campaign studio | Group remediation into measurable campaigns with owners, waves, blockers, approvals, evidence, and risk in scope. |
| Agentic copilot | Provide governed model-agnostic planning with deterministic fallback and dry-run tools. |
| Enterprise security layer | Support SSO readiness, RBAC bindings, tenant isolation, audit trail, and secrets-reference posture. |
| Execution orchestration | Provide dry-run hooks for CI/CD, Kubernetes, cloud controls, IAM policy changes, and policy-governed fixes. |
| Evidence and compliance packs | Track before state, simulation, approval, execution logs, validation, and report snapshots. |
| Maturity dashboards | Show debt, high-risk backlog, blocked work, overdue work, scanner noise reduction, and autonomy eligibility. |
| Production hardening | Expose retry telemetry, run records, audit logs, deployment posture, and operational guardrails. |

## Virtual Patching And Path Breaker Requirements

| Capability | Requirement |
| --- | --- |
| Candidate detection | Identify internet-exposed, unpatchable, cloud, network, IAM, application, Kubernetes, and container risks. |
| Control recommendation | Recommend WAF, API gateway, service mesh, EDR, admission controller, cloud policy, IAM, or network controls. |
| Breaker scoring | Score dependency paths from exposed sources to high-value targets using exposure, criticality, data sensitivity, hop count, and risk transfer. |
| Breaker recommendation | Propose deny rules, microsegmentation, route quarantine, conditional IAM denies, and virtual patch controls. |
| Governed activation | Create simulations, plans, policies, dry-run connector records, rollback requirements, and audit logs before live enforcement. |

## Agentic Orchestrator Requirements

| Capability | Requirement |
| --- | --- |
| Model abstraction | Support deterministic fallback, OpenAI-compatible gateways, Anthropic-compatible endpoints, Gemini-compatible endpoints, and local SLM endpoints. |
| Tenant context builder | Build prompts from tenant-scoped findings, assets, attack paths, actions, simulations, workflows, policies, evidence, reports, automation runs, virtual patch candidates, and path-breaker candidates. |
| Tool registry | Expose governed tools for ingestion, simulation, plan generation, virtual patching, attack-path breaking, approval routing, connector execution, and evidence sealing. |
| Safety rails | Keep execution dry-run by default, require approval and rollback for production, require virtual patch/path-breaker assessment for exposed crown-jewel paths, and prohibit raw secrets in prompts. |
| Persistence | Store every agent run as an `agentic_plan` report snapshot and audit the provider, model, dry-run state, and tool plan. |
| Provider fallback | If the requested model is unavailable or fails, fall back to deterministic rules-engine planning without blocking the workflow. |

## Primary Routes

- `/`
- `/findings`
- `/assets`
- `/asset-graph`
- `/attack-paths`
- `/remediation`
- `/simulations`
- `/workflows`
- `/evidence`
- `/connectors`
- `/ingestion-jobs`
- `/campaign-board`
- `/operating-system`
- `/pilot-control-plane`
- `/virtual-patching`
- `/agentic`
- `/final-production`
- `/production-ops`
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
- Agentic readiness score
- Critical attack-path reduction
- Average before/after path-risk delta

## Non-Goals

- Replace scanners, SIEM, SOAR, ITSM, or CI/CD systems
- Execute production changes without explicit policy and credential configuration
- Store raw secrets directly in application tables
- Treat LLM output as an execution approval

## Production Readiness Notes

Production deployment should use a managed relational database, background workers, queue-backed ingestion and simulation, enterprise secret management, OpenTelemetry tracing, SSO/SCIM integration, immutable audit storage, and environment-specific governance policies.
