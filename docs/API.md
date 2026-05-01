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
