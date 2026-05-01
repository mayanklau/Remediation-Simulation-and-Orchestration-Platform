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
4. Open `/final-production` and click **Finalize readiness**.
5. Review external setup remaining and configure live identity, secrets, object storage, telemetry, and integration credentials.

The platform keeps live execution disabled until credentials and policy approvals are configured.

## Production Compose

```bash
docker compose -f docker-compose.prod.yml up --build
```

Then run database migrations with:

```bash
npm run db:deploy
```

## Ingest a Finding

```bash
curl -X POST http://localhost:3000/api/ingest/json \
  -H "content-type: application/json" \
  -d '{"findings":[{"source":"scanner","sourceId":"1","title":"Public SSH exposure","severity":"HIGH","category":"network_policy","patchAvailable":false,"asset":{"externalId":"sg-1","name":"prod-admin-sg","type":"NETWORK_RESOURCE","environment":"PRODUCTION","criticality":4,"dataSensitivity":3,"internetExposure":true}}]}'
```

Then open the finding in the UI and run simulation, plan generation, and workflow creation.
