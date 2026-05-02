# Product Requirements Document: EY Remediation Twin

## Product Summary

**Product name:** EY Remediation Twin

**Category:** Enterprise remediation operating system

**Description:** EY Remediation Twin ingests security and compliance findings, maps them to enterprise assets, prioritizes business risk, simulates remediation before execution, orchestrates approvals and campaigns, and presents the workflow through an EY-inspired executive command center with audit-grade evidence.

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
- SSO/OIDC readiness, signed sessions, tenant isolation checks, and RBAC enforcement helper contracts
- Service/repository/DTO structure for route logic, shared validation, and contract-driven APIs
- Queue-worker contracts for ingestion, simulation, connector sync, evidence generation, and report snapshots
- Environment separation and strict runtime configuration validation for local, dev, staging, and production
- CI/CD quality gates covering typecheck, tests, build, migration validation, dependency audit, and container-scan readiness
- JSON and CSV finding ingestion
- Asset inventory and asset graph
- Graph-native vulnerability chaining and attack-path analytics
- Deduplication and source correlation
- Risk scoring, attack-path difficulty, before/after remediation risk, and remediation action generation
- Simulation, planning, workflow, approvals, and evidence
- Connector registry, manual integration factory, durable connector runs, and dry-run health checks
- Pilot readiness, connector onboarding, and ingestion jobs
- SSO metadata, RBAC evaluation, reporting, and audit
- Automation hooks for CI/CD, Kubernetes, cloud, IAM, and policy fixes
- Governance policies, risk exceptions, freeze windows, and auto-approval
- Continuous simulation and predictive residual risk
- Virtual patching and attack-path breaker control center
- Agentic remediation orchestrator with any LLM, SLM, model gateway, or deterministic fallback
- Remediation campaigns and campaign board
- Closed-loop operating-system view
- Enterprise maturity command center
- Pilot control plane for production-pilot activation
- Final production completion center
- Production operations control room
- Once-and-for-all enterprise readiness control catalog across all enterprise domains

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

## Advanced Vulnerability Analytics Requirements

| Capability | Requirement |
| --- | --- |
| Graph algorithms | Identify shortest exploitable path, k-hop blast radius, centrality-style concentration, choke points, and crown-jewel exposure. |
| Domain chaining | Apply network, IAM, cloud, Kubernetes, application, CI/CD, secrets, and data-store chaining rules. |
| Exploit preconditions | Model required privilege, network access, user interaction, token scope, lateral movement, and control friction. |
| Difficulty explainability | Explain why a path is low, medium, high, or very high difficulty and list assumptions used. |
| Control simulation | Score before/after risk for patching, WAF/API rules, IAM denies, segmentation, container rebuilds, and cloud policies. |
| Path breaker engine | Recommend the edge or control that removes the largest amount of path risk for the least change risk. |
| Scanner adapters | Normalize Tenable, Qualys, Wiz, Prisma Cloud, Snyk, GitHub Advanced Security, AWS Security Hub, Defender, and CrowdStrike. |
| Executive views | Show business services at risk, weekly risk reduced, blocked remediations, and attack paths closed. |

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

## Virtual Patching And Path Breaker Requirements

The product must support compensating controls before permanent remediation:

| Capability | Requirement |
| --- | --- |
| Virtual patch candidate detection | Identify findings that are internet-exposed, lack patches, affect cloud/network/IAM/application surfaces, or require compensating controls. |
| Control recommendation | Recommend WAF, API gateway, service mesh, EDR, admission controller, cloud policy, IAM, or network controls based on asset and finding context. |
| Attack path breaker scoring | Score dependency paths from exposed sources to high-value targets using exposure, criticality, data sensitivity, hop count, and risk transfer. |
| Breaker recommendation | Propose deny rules, microsegmentation, route quarantine, conditional IAM denies, or virtual patch controls. |
| Simulation and planning | Run canary simulations and create remediation plans for top virtual patch candidates. |
| Governed activation | Create enforced policies, dry-run execution hooks, connector-run records, rollback requirements, and audit logs before live enforcement. |

`POST /api/virtual-patching` with `{ "action": "activate" }` must activate the policies, execution hooks, simulations, plans, path-breaker dry runs, and audit trail.

## Vulnerability Chaining And Attack Path Requirements

The product must turn scanner noise into end-to-end vulnerability analytics:

| Capability | Requirement |
| --- | --- |
| Scanner normalization | Accept Tenable, Qualys, Wiz, Snyk, GitHub Advanced Security, AWS Security Hub, Kubernetes, IAM, cloud posture, compliance, CSV, and API scanner inputs through the canonical finding model. |
| Attack graph construction | Build logical attack paths from asset dependencies, exposure, exploit preconditions, identity/control relationships, high-value targets, and vulnerability metadata. |
| Bounded path enumeration | Enumerate bounded simple paths from exposed or initial-access assets to crown-jewel, production, critical, or sensitive targets. |
| Vulnerability chaining | Convert each path into ordered chain steps with source scanner, category, severity, exploit status, patchability, business risk, and mapped attack technique. |
| Attack path graph UI | Render entry assets, reachability edges, exploit-precondition findings, crown-jewel targets, and breaker controls as a React Flow graph workbench with pan, zoom, minimap, filters, node inspector, and export. |
| Vulnerability chain graph UI | Render each ordered vulnerability chain as connected graph nodes with scanner source, mapped technique, difficulty, before/after risk, breaker outcome, and graph-library-ready API contracts. |
| Difficulty scoring | Label every path as `LOW`, `MEDIUM`, `HIGH`, or `VERY_HIGH` using hop count, exposure, exploit availability, active exploitation, patchability, and control friction. |
| Before/after risk | Show customer-facing risk before remediation, estimated residual risk after remediation, and the risk delta expected from patching, virtual patching, path breakers, and policy controls. |
| Breaker recommendation | Recommend microsegmentation, WAF/API gateway controls, service mesh policy, conditional IAM deny, route quarantine, and database access restrictions. |
| Evidence snapshot | Persist attack-path analytics as report snapshots and audit records for governance and executive reporting. |

`GET /api/attack-paths` must return the current attack-path model, attack graph, vulnerability chain graph, graph nodes, graph edges, difficulty scoring, before/after risk, and breaker recommendations. `POST /api/attack-paths` with `{ "action": "snapshot" }` must save the analytics as evidence-ready reporting data.

## Agentic Orchestrator Requirements

The product must support governed agentic planning across any model provider while preserving deterministic safety controls:

| Capability | Requirement |
| --- | --- |
| Model abstraction | Support deterministic fallback, OpenAI-compatible gateways, Anthropic-compatible endpoints, Gemini-compatible endpoints, and local SLM endpoints. |
| Tenant context builder | Build prompts from tenant-scoped findings, assets, remediation actions, simulations, workflows, policies, evidence, reports, automation runs, virtual patch candidates, and path-breaker candidates. |
| Tool registry | Expose governed tools for ingestion, simulation, plan generation, virtual patching, attack-path breaking, approval routing, connector execution, and evidence sealing. |
| Safety rails | Keep execution dry-run by default, require approval and rollback for production, require virtual patch/path-breaker assessment for exposed crown-jewel paths, and prohibit raw secrets in prompts. |
| Persistence | Store every agent run as an `agentic_plan` report snapshot and audit the provider, model, dry-run state, and tool plan. |
| Provider fallback | If the requested model is unavailable or fails, fall back to deterministic rules-engine planning without blocking the workflow. |

`POST /api/agentic` must accept `goal`, `prompt`, `provider`, and `dryRun`, then return the model completion, guarded tool plan, and refreshed agentic model.

## Production Operations Requirements

The product must provide the final operational controls required to run a serious enterprise pilot:

| Area | Requirement |
| --- | --- |
| Auth and session contracts | Issue signed sessions, expose SSO start metadata, and accept IdP callback payloads behind enterprise gateway controls. |
| Secret manager integration | Resolve secret references through environment, Vault, AWS Secrets Manager, Azure Key Vault, or equivalent providers without persisting raw secrets. |
| Live connectors | Provide live Jira, GitHub, and ServiceNow client contracts with dry-run default, endpoint rendering, request shaping, and durable run records. |
| Worker process | Process ingestion, simulation, evidence, connector sync, and automation lanes through a worker endpoint that can move to a queue runtime. |
| Migrations | Include a baseline Prisma migration and CI migration validation. |
| Evidence storage | Seal evidence packs with hash chaining, retention metadata, immutable export markers, and external storage URLs. |
| Test depth | Cover security/session helpers and keep CI running typecheck, tests, and builds. |
| Deployment pipeline | Provide GitHub Actions for install, Prisma generation, typecheck, tests, and production build. |
| Observability | Emit operational signals, track connector and automation failures, expose telemetry, and flag OTEL/alert readiness. |
| Security hardening | Apply security headers, rate limits, CSRF hooks, signed sessions, RBAC permissions, tenant scoping, and audit records. |

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
- `/integrations`
- `/ingestion-jobs`
- `/campaign-board`
- `/operating-system`
- `/pilot-control-plane`
- `/virtual-patching`
- `/agentic`
- `/final-production`
- `/production-ops`
- `/enterprise-maturity`
- `/enterprise-readiness`
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
- Scanner-family graph readiness
- Asset-mapping coverage by scanner family
- Exploit-signal and remediation-signal coverage
- Customer-ready attack paths
- Executive attack-path escalations
- Subject-maturity score
- Development release-confidence score
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

## Production Readiness Notes

Production deployment should use a managed relational database, background workers, queue-backed ingestion and simulation, enterprise secret management, OpenTelemetry tracing, SSO/SCIM integration, immutable audit storage, and environment-specific governance policies.
