# Architecture

Remediation Twin is a full-stack Next.js application with Prisma persistence and a domain-first backend.

## Core Runtime

- `src/app`: UI and API routes.
- `src/domain`: business logic for ingestion, risk scoring, simulation, planning, workflows, and evidence.
- `src/lib`: persistence, tenant resolution, JSON helpers, API wrappers, and audit helpers.
- `src/lib/security.ts`: signed sessions, CSRF tokens, rate-limit helper, and evidence hashing.
- `src/lib/secrets.ts`: secret-reference resolution.
- `src/lib/observability.ts`: operational telemetry and signal export records.
- `src/lib/model-providers.ts`: model-provider abstraction for deterministic, OpenAI-compatible, Anthropic-compatible, Gemini-compatible, and local SLM completion.
- `src/domain/agentic-orchestrator.ts`: governed agentic planning layer, safety rails, tool registry, model context builder, and audit/report persistence.
- `src/domain/virtual-patching.ts`: virtual patch candidate detection, attack-path breaker scoring, simulations, and governed activation.
- `src/domain/attack-path-analytics.ts`: scanner-normalized vulnerability chaining, bounded attack-path construction, difficulty scoring, and before/after remediation risk.
- `prisma/schema.prisma`: production data model.
- `middleware.ts`: baseline security headers for application and API routes.

## Core Flow

1. Findings are ingested through JSON or CSV APIs.
2. Assets are upserted from finding payloads.
3. Findings are fingerprinted and deduplicated.
4. Risk score and business risk score are calculated.
5. Vulnerability chains and attack paths are constructed from asset relationships, scanner signals, exploitability, and crown-jewel targets.
6. Each attack path receives difficulty, before-remediation risk, after-remediation risk, and path-breaker recommendations.
7. A remediation action is created for every canonical finding.
8. Users run simulations against remediation actions.
9. Simulation results generate plans, approvals, rollout guidance, rollback steps, and validation steps.
10. Workflow items track execution and approvals.
11. Evidence artifacts preserve audit history.

## Production Envelope

The final production layer now includes:

- `/final-production` readiness center.
- `GET /api/final-production` and `POST /api/final-production`.
- Production policies for execution attestation, evidence retention, tenant boundaries, and observability.
- Worker hooks for ingestion, simulation, evidence, connector sync, and rollback coordination.
- Production Docker compose with Postgres.
- Security headers through middleware.
- Deployment and security documentation.
- Production operations center at `/production-ops`.
- Auth/session, SSO callback, live connector, worker-runner, evidence-sealing, and observability APIs.
- Virtual patching and path-breaker control center at `/virtual-patching`.
- Vulnerability chaining and attack-path analytics at `/attack-paths`.
- Model-agnostic agentic orchestrator at `/agentic`.
- Baseline Prisma migration and GitHub Actions CI.

External setup is still required for live credentials, real identity provider metadata, object storage, telemetry endpoints, and optional model gateway credentials. Until those are configured, execution remains dry-run by design and the agentic layer falls back to deterministic planning.
