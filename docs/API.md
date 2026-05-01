# API Reference

All endpoints are tenant scoped. If `x-tenant-id` is omitted, the local default tenant is created and used.

## Health

`GET /api/health`

Returns service status.

## JSON Ingestion

`POST /api/ingest/json`

Accepts either an array of findings or `{ "findings": [...] }`.

```json
{
  "findings": [
    {
      "source": "tenable",
      "sourceId": "finding-123",
      "title": "OpenSSL vulnerable package",
      "description": "Package version is below fixed version.",
      "severity": "CRITICAL",
      "category": "vulnerability",
      "cve": "CVE-2026-0001",
      "exploitAvailable": true,
      "activeExploitation": false,
      "patchAvailable": true,
      "asset": {
        "externalId": "i-123",
        "name": "payments-api-prod-1",
        "type": "VIRTUAL_MACHINE",
        "environment": "PRODUCTION",
        "criticality": 5,
        "dataSensitivity": 5,
        "internetExposure": true
      }
    }
  ]
}
```

## CSV Ingestion

`POST /api/ingest/csv`

Supported headers include:

- `source`
- `source_id`
- `title`
- `description`
- `severity`
- `category`
- `cve`
- `control_id`
- `asset_name`
- `asset_external_id`
- `asset_type`
- `environment`
- `criticality`
- `data_sensitivity`
- `internet_exposure`
- `exploit_available`
- `active_exploitation`
- `patch_available`

## Assets

- `GET /api/assets`
- `POST /api/assets`
- `GET /api/assets/:id`

## Findings

- `GET /api/findings`
- `GET /api/findings/:id`

## Remediation

- `GET /api/remediation-actions`
- `POST /api/remediation-actions/:id/simulate`
- `POST /api/remediation-actions/:id/plan`
- `POST /api/remediation-actions/:id/workflow`

## Prototype Data

- `POST /api/mock-ingest`

Loads representative enterprise findings and asset relationships for Phase 0 demonstrations.

## Workflows

- `GET /api/workflows`
- `POST /api/workflows/:id/comments`
- `POST /api/workflows/:id/approvals`
- `POST /api/approvals/:id/decision`
- `GET /api/workflows/:id/evidence`
- `POST /api/workflows/:id/evidence`

## Copilot

`POST /api/copilot`

The current implementation is deterministic and tenant-scoped. It is structured so an LLM provider can be added behind the same contract without allowing uncontrolled execution.

## Enterprise Readiness

- `GET /api/sso`
- `POST /api/sso`
- `GET /api/rbac/evaluate`
- `POST /api/rbac/evaluate`
- `GET /api/connectors/run`
- `POST /api/connectors/run`
- `GET /api/pilot-readiness`
- `POST /api/pilot-readiness`
- `GET /api/enterprise-maturity`
- `POST /api/enterprise-maturity`

Connector operations create durable run records for Jira, GitHub, ServiceNow, scanner, cloud, and Kubernetes flows. They are deterministic by default so enterprise pilots can validate orchestration contracts before credentials are connected.

`GET /api/pilot-readiness` returns connector onboarding readiness, ingestion job history, campaign board metrics, duplicate-source reduction, and pilot operating-model guidance.

`POST /api/pilot-readiness` supports two actions:

- `create_connector` creates or updates a connector profile with auth mode, scopes, owner, environment, and sync cadence.
- `start_ingestion` creates a durable dry-run scanner ingestion job with accepted, rejected, and error counts.

`GET /api/enterprise-maturity` returns the ten-track maturity model:

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

`POST /api/enterprise-maturity` with `{ "action": "advance_all" }` creates connector profiles, connector health runs, governance guardrail policies, dry-run execution hooks, OIDC readiness, RBAC bindings, an executive report, a maturity campaign, and an audit entry.

## Reporting

- `GET /api/reports`
- `POST /api/reports`

Creates executive remediation snapshots from live tenant data.

## Automation

- `GET /api/automation/hooks`
- `POST /api/automation/hooks`
- `GET /api/automation/run`
- `POST /api/automation/run`

Supported run types are `ci_cd`, `kubernetes`, `cloud`, `iam`, and `policy_fix`.

## Governance

- `GET /api/policies`
- `POST /api/policies`
- `POST /api/governance/continuous-simulation`
- `GET /api/governance/predictive-risk`
- `POST /api/governance/apply-fix`
- `GET /api/campaigns`
- `POST /api/campaigns`

Governance APIs support risk-based auto-approval policies, continuous simulation, predictive residual risk, policy-governed fixes, and self-refreshing remediation campaigns.
