# Go-Live Runbook

This repository is built so developers do not need to design the production path. To go live, replace the values in `.env.production.example`, deploy the image, run migrations, and complete the `/go-live` checks.

## Required Sequence

1. Populate production environment values.
2. Run `npm ci`, `npm test`, and `npm run build`.
3. Run `npm run db:deploy` against the production database.
4. Deploy the app image from `Dockerfile`.
5. Configure identity provider, secret manager, evidence storage, observability, and alert routes.
6. Open `/go-live`, `/enterprise-readiness`, and `/production-expansion`.
7. Run connector dry checks before enabling live schedules.
8. Seal one evidence pack and export one executive report.
9. Capture security, platform, and business go-live approval.

## Rollback

1. Disable connector schedules.
2. Roll back the app image.
3. Roll back database changes only when the migration runbook says it is required.
4. Re-run `/api/health`, `/api/observability`, and critical user flows.
5. Document residual risk and corrective actions.
