# Remediation Simulation and Orchestration Platform

Enterprise remediation control plane for ingesting security findings, normalizing risk, simulating remediation impact, generating rollout plans, managing approvals, and preserving audit evidence.

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

## Core Capabilities

- Finding ingestion through JSON and CSV APIs
- Asset inventory and ownership mapping
- Finding deduplication and risk scoring
- Remediation action generation
- Simulation engine for remediation impact
- Plan generation with rollout, validation, and rollback steps
- Workflow approvals
- Evidence capture and export
- Dashboard and operational views

## Important

The app starts with an empty database by design. Ingest real findings through:

- `POST /api/ingest/json`
- `POST /api/ingest/csv`

See [docs/API.md](docs/API.md) and [docs/RUNBOOK.md](docs/RUNBOOK.md).
