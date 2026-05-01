# API Reference

All APIs are tenant scoped. If `x-tenant-id` is omitted, the local default tenant is created and used.

## Core

- `GET /api/health`
- `GET /api/tenants`
- `POST /api/tenants`
- `GET /api/dashboard`

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
- `GET /api/findings`
- `GET /api/findings/:id`

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

## Connectors and Pilot Readiness

- `GET /api/integrations`
- `POST /api/integrations`
- `GET /api/connectors/run`
- `POST /api/connectors/run`
- `GET /api/pilot-readiness`
- `POST /api/pilot-readiness`

`POST /api/pilot-readiness` supports:

- `create_connector`
- `start_ingestion`

Connector operations create durable run records for Jira, GitHub, ServiceNow, Tenable, Qualys, Wiz, Snyk, AWS Security Hub, Kubernetes, and related enterprise flows.

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
