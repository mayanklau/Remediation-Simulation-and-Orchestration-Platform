# Deployment Guide

## Production Shape

Remediation Twin is packaged as a standalone Next.js application with Prisma persistence. Production should run with:

- Managed PostgreSQL
- External secret manager
- Object storage for evidence exports
- Queue-capable worker runtime
- SSO/OIDC or SAML identity provider
- OpenTelemetry collector
- Alert webhook or incident integration

## Required Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Production database connection string. Use PostgreSQL for enterprise deployment. |
| `APP_URL` | Public application URL. |
| `SESSION_SECRET` | Random session signing secret. |
| `SECRET_PROVIDER` | Secret backend identifier such as `aws-secrets-manager`, `vault`, or `azure-key-vault`. |
| `WORKER_CONCURRENCY` | Worker lane concurrency. |
| `EVIDENCE_STORAGE_URL` | External evidence storage target. |

Optional but recommended:

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `ALERT_WEBHOOK_URL`
- `JIRA_BASE_URL`
- `GITHUB_APP_ID`
- `SERVICENOW_INSTANCE_URL`

## Build

```bash
npm install
npm run typecheck
npm test
DATABASE_URL="file:./dev.db" npm run build
```

## Deploy

```bash
npm run db:deploy
npm run start
```

For container deployment:

```bash
docker compose -f docker-compose.prod.yml up --build
```

## Final Readiness

After deployment, open `/final-production` and click **Finalize readiness**. This creates the final production policies, worker lanes, rollback coordinator, connector readiness checks, SSO/RBAC readiness records, executive report, production campaign, and audit record.

Execution remains in dry-run mode until connector credentials, policy approvals, and production change windows are configured.
