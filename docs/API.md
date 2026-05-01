# API Reference

All APIs are tenant scoped. If `x-tenant-id` is omitted, the local default tenant is created and used.

## Core

- `GET /api/health`
- `GET /api/tenants`
- `POST /api/tenants`
- `GET /api/dashboard`
- `GET /api/observability`
- `POST /api/observability`
- `POST /api/workers/run`
- `GET /api/agentic`
- `POST /api/agentic`
- `GET /api/attack-paths`
- `POST /api/attack-paths`

## Agentic Orchestrator

- `GET /api/agentic`
- `POST /api/agentic`

`GET /api/agentic` returns model-provider readiness, tenant context, safety rails, the governed tool registry, readiness scoring, and recent agent plans.

`POST /api/agentic` accepts:

```json
{
  "goal": "virtual_patch",
  "prompt": "Plan safest next actions with model fallback.",
  "provider": "openai_compatible",
  "dryRun": true
}
```

Supported `goal` values are `prioritize`, `plan`, `virtual_patch`, `evidence`, `executive_summary`, and `autonomous_governance`. Supported provider values are `deterministic`, `openai_compatible`, `anthropic_compatible`, `gemini_compatible`, and `local_slm`.

The endpoint writes an `agentic_plan` report snapshot plus an audit log. Model output remains advisory; policy gates decide whether execution is eligible.

## Auth and SSO

- `GET /api/auth/session`
- `POST /api/auth/session`
- `GET /api/auth/sso/start`
- `POST /api/auth/sso/callback`

Session APIs issue signed local sessions for development and enterprise edge integration. SSO start exposes OIDC and SAML service-provider metadata. Production should front these contracts with the enterprise IdP and keep session signing in a managed secret.

## Ingestion

- `POST /api/ingest/json`
- `POST /api/ingest/csv`
- `POST /api/mock-ingest`

CSV headers include `source`, `source_id`, `title`, `description`, `severity`, `category`, `cve`, `control_id`, `asset_name`, `asset_external_id`, `asset_type`, `environment`, `criticality`, `data_sensitivity`, `internet_exposure`, `exploit_available`, `active_exploitation`, and `patch_available`.

## Assets and Findings

- `GET /api/assets`
- `POST /api/assets`
- `GET /api/assets/:id`
- `GET /api/asset-graph`
- `GET /api/attack-paths`
- `POST /api/attack-paths`
- `GET /api/findings`
- `GET /api/findings/:id`

## Attack Path Analytics

- `GET /api/attack-paths`
- `POST /api/attack-paths`

`GET /api/attack-paths` returns scanner-normalized vulnerability chains, bounded attack paths, path difficulty, before-remediation risk, after-remediation residual risk, recommended path breakers, and the research-backed construction method used for the tenant.

`POST /api/attack-paths` accepts:

```json
{ "action": "snapshot" }
```

It stores the current attack-path analytics as an `attack_path_analytics` report snapshot and writes an audit log. The attack-path model is designed for Tenable, Qualys, Wiz, Snyk, GitHub Advanced Security, AWS Security Hub, Kubernetes, IAM, cloud posture, compliance, and custom CSV/API scanner inputs.

## Remediation

- `GET /api/remediation-actions`
- `POST /api/remediation-actions/:id/simulate`
- `POST /api/remediation-actions/:id/plan`
- `POST /api/remediation-actions/:id/workflow`

## Workflows and Evidence

- `GET /api/workflows`
- `POST /api/workflows/:id/comments`
- `POST /api/workflows/:id/approvals`
- `POST /api/approvals/:id/decision`
- `GET /api/workflows/:id/evidence`
- `POST /api/workflows/:id/evidence`
- `GET /api/evidence/packs`
- `POST /api/evidence/seal`

`POST /api/evidence/seal` creates immutable audit-export artifacts with hash chaining, retention metadata, and the configured evidence storage URL.

## Connectors and Pilot Readiness

- `GET /api/integrations`
- `POST /api/integrations`
- `GET /api/connectors/run`
- `POST /api/connectors/run`
- `POST /api/connectors/live`
- `GET /api/pilot-readiness`
- `POST /api/pilot-readiness`
- `GET /api/pilot-control-plane`
- `POST /api/pilot-control-plane`
- `GET /api/virtual-patching`
- `POST /api/virtual-patching`
- `GET /api/final-production`
- `POST /api/final-production`

`POST /api/pilot-readiness` supports:

- `create_connector`
- `start_ingestion`

Connector operations create durable run records for Jira, GitHub, ServiceNow, Tenable, Qualys, Wiz, Snyk, AWS Security Hub, Kubernetes, and related enterprise flows.

`POST /api/connectors/live` accepts `{ "provider": "jira", "operation": "create_issue", "payload": {}, "dryRun": true }`. Dry-run mode records the endpoint, request shape, and secret-reference resolution without sending the external request. Live mode uses configured integration endpoints.

## Virtual Patching And Path Breakers

- `GET /api/virtual-patching`
- `POST /api/virtual-patching`

`GET /api/virtual-patching` returns virtual patch candidates, attack-path breaker candidates, active policies, execution hooks, recommended controls, enforcement points, and breaker scores.

`POST /api/virtual-patching` accepts:

```json
{ "action": "activate" }
```

It creates enforced virtual-patching and path-breaker policies, dry-run execution hooks, canary simulations, remediation plans, path-breaker connector-run records, rollback requirements, and an audit event.

## Pilot Control Plane

- `GET /api/pilot-control-plane`
- `POST /api/pilot-control-plane`

`GET /api/pilot-control-plane` returns production-pilot readiness across:

- Real scanner connectors
- True simulation engine
- Remediation playbook library
- Policy-as-code
- Approval workbench
- Jira, GitHub, and ServiceNow execution
- Evidence vault
- AI remediation planner
- Executive dashboards
- Production SaaS layer

`POST /api/pilot-control-plane` accepts:

```json
{ "action": "activate_all_10" }
```

It configures scanner connector profiles, performs dry-run connector operations, writes policy-as-code rules, creates execution hooks, runs simulations and plan generation for open remediation actions, routes approvals, attaches evidence artifacts, generates evidence packs, starts dry-run automation records, refreshes reports and campaigns, prepares SSO/RBAC readiness, and writes an audit entry.

## Final Production

- `GET /api/final-production`
- `POST /api/final-production`

`GET /api/final-production` returns final deployability scoring for:

- Database and migrations
- Auth, SSO, and RBAC
- Connector secret references
- Background workers
- Live integration runway
- Executable policy runtime
- Evidence vault and retention
- Observability and operations
- Enterprise deployment
- Security hardening

`POST /api/final-production` accepts:

```json
{ "action": "finalize" }
```

It creates production guardrail policies, worker execution lanes, rollback coordination, connector readiness checks, continuous simulation, production report, readiness campaign, SSO/RBAC readiness records, and a final audit event.

## Enterprise Maturity

- `GET /api/enterprise-maturity`
- `POST /api/enterprise-maturity`

`GET /api/enterprise-maturity` returns maturity scoring for:

- Real connector framework
- Simulation sandbox
- Policy engine
- Remediation campaign studio
- AI copilot upgrade
- Enterprise security layer
- Execution orchestration
- Evidence and compliance packs
- Maturity dashboards
- Production hardening

`POST /api/enterprise-maturity` accepts:

```json
{ "action": "advance_all" }
```

It creates connector profiles, connector health runs, governance guardrail policies, dry-run execution hooks, OIDC readiness, RBAC bindings, an executive report, a maturity campaign, and an audit entry.

## Automation and Governance

- `GET /api/automation/hooks`
- `POST /api/automation/hooks`
- `GET /api/automation/run`
- `POST /api/automation/run`
- `GET /api/policies`
- `POST /api/policies`
- `POST /api/governance/continuous-simulation`
- `GET /api/governance/predictive-risk`
- `POST /api/governance/apply-fix`
- `GET /api/campaigns`
- `POST /api/campaigns`

Supported automation run types are `ci_cd`, `kubernetes`, `cloud`, `iam`, and `policy_fix`.

## Enterprise Security

- `GET /api/sso`
- `POST /api/sso`
- `GET /api/rbac/evaluate`
- `POST /api/rbac/evaluate`

## Reporting and Copilot

- `GET /api/reports`
- `POST /api/reports`
- `POST /api/copilot`

The current copilot implementation is deterministic and tenant scoped. An LLM provider can be added behind the same contract without allowing uncontrolled execution.
