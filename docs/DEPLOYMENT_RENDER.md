# Render Deployment

This repo is ready to run as a live Next.js application on Render with a managed PostgreSQL database.

## 1. Deploy With Render Blueprint

In Render, create a new Blueprint from this GitHub repo. Render reads `render.yaml` and creates:

- `remediation-simulation-platform`
- `remediation-simulation-platform-db`

Set or confirm these environment variables:

```bash
APP_ENV=production
NODE_ENV=production
APP_URL=https://your-app.onrender.com
DATABASE_URL=<provided-by-render-postgres>
SESSION_SECRET=<generated-or-strong-secret>
SECRET_PROVIDER=render-env
DEFAULT_TENANT_SLUG=default
OIDC_ISSUER=<your-idp-issuer-or-demo-placeholder>
OIDC_CLIENT_ID=<your-idp-client-id-or-demo-placeholder>
EVIDENCE_STORAGE_URL=s3://replace-bucket/prefix
```

## 2. Production Start Command

The Dockerfile builds the standalone Next.js server and starts:

```bash
node server.js
```

Render provides `PORT`; Next standalone reads it at runtime.

## 3. Health Check

Render uses:

```bash
/api/health
```

The endpoint validates the application and database connection.

Validate manually:

```bash
APP_URL=https://your-app.onrender.com ./scripts/validate-health.sh
```

## 4. Optional Cloud Demo Data

Only run this when you intentionally want demo records in the cloud database:

```bash
API_BASE=https://your-app.onrender.com/api ./scripts/load-demo-data.sh
```

Do not run the loader against a customer production tenant unless the customer explicitly wants seeded demo data.
