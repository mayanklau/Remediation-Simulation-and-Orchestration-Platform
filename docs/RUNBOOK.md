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

## Ingest a Finding

```bash
curl -X POST http://localhost:3000/api/ingest/json \
  -H "content-type: application/json" \
  -d '{"findings":[{"source":"scanner","sourceId":"1","title":"Public SSH exposure","severity":"HIGH","category":"network_policy","patchAvailable":false,"asset":{"externalId":"sg-1","name":"prod-admin-sg","type":"NETWORK_RESOURCE","environment":"PRODUCTION","criticality":4,"dataSensitivity":3,"internetExposure":true}}]}'
```

Then open the finding in the UI and run simulation, plan generation, and workflow creation.
