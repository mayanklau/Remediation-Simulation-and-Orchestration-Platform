# Runbook

## Local Setup

```bash
cp .env.example .env
npm install
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

The database starts empty. Ingest real data through `/api/ingest/json` or `/api/ingest/csv`.

## Verify

```bash
npm run typecheck
npm test
npm run build
```

## Finalize Production Readiness

1. Configure required variables from `.env.example`.
2. Open `/enterprise-maturity` and click **Build all 10**.
3. Open `/pilot-control-plane` and click **Activate all 10**.
4. Open `/virtual-patching` and click **Activate controls**.
5. Open `/agentic` and click **Run agent plan**.
6. Open `/final-production` and click **Finalize readiness**.
7. Open `/production-ops` and run the simulation worker plus evidence sealing checks.
8. Review external setup remaining and configure live identity, secrets, object storage, telemetry, integration credentials, and optional model gateway credentials.

The platform keeps live execution disabled until credentials and policy approvals are configured.

## Production Compose

```bash
docker compose -f docker-compose.prod.yml up --build
```

Then run database migrations with:

```bash
npm run db:deploy
```

## Operational Checks

```bash
curl http://localhost:3000/api/observability
curl -X POST http://localhost:3000/api/workers/run -H "content-type: application/json" -d '{"lane":"simulation","limit":3}'
curl -X POST http://localhost:3000/api/virtual-patching -H "content-type: application/json" -d '{"action":"activate"}'
curl -X POST http://localhost:3000/api/agentic -H "content-type: application/json" -d '{"goal":"virtual_patch","prompt":"Plan safest next actions with model fallback","dryRun":true}'
curl -X POST http://localhost:3000/api/evidence/seal -H "content-type: application/json" -d '{"limit":5}'
curl -X POST http://localhost:3000/api/connectors/live -H "content-type: application/json" -d '{"provider":"jira","operation":"create_issue","dryRun":true,"payload":{"summary":"Remediation dry run"}}'
```

## Ingest a Finding

```bash
curl -X POST http://localhost:3000/api/ingest/json \
  -H "content-type: application/json" \
  -d '{"findings":[{"source":"scanner","sourceId":"1","title":"Public SSH exposure","severity":"HIGH","category":"network_policy","patchAvailable":false,"asset":{"externalId":"sg-1","name":"prod-admin-sg","type":"NETWORK_RESOURCE","environment":"PRODUCTION","criticality":4,"dataSensitivity":3,"internetExposure":true}}]}'
```

Then open the finding in the UI and run simulation, plan generation, and workflow creation.
