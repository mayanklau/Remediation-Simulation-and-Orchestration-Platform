# Security Model

## Boundaries

- Every API is tenant scoped through `x-tenant-id` or the default local tenant.
- RBAC roles are defined in `src/domain/rbac.ts`.
- Connector configurations store secret references, not raw secrets.
- Automation and execution hooks default to dry-run.
- Audit records are created for maturity, pilot, governance, and final production activation.
- Attack-path analytics are tenant scoped and operate on normalized scanner findings, asset relationships, and secret references only.
- Agentic plans are tenant scoped, audit logged, dry-run by default, and treated as advisory until policy gates approve execution.
- Model prompts use tenant context and secret references only; raw connector secrets are never included.

## Headers

`middleware.ts` applies baseline security headers:

- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy` restricting camera, microphone, and geolocation
- HSTS in production
- Rate-limit headers and request throttling
- CSRF token requirement for authenticated mutating production requests

## Production Requirements

Before live execution:

1. Configure SSO/OIDC or SAML.
2. Bind users and groups to least-privilege RBAC roles.
3. Store connector credentials in an external secret manager.
4. Configure evidence storage with retention and immutability.
5. Enable OpenTelemetry and alert routing.
6. Keep automation in dry-run until policies, approvals, and rollback evidence are verified.
7. Configure `SESSION_SECRET`, `RATE_LIMIT_PER_MINUTE`, and IdP metadata before external access.

## High-Risk Controls

- Crown-jewel assets require manual approval.
- Production execution requires live credential attestation.
- Evidence packs are required before closure.
- Virtual patching can enforce compensating controls before permanent remediation.
- Path breakers can interrupt risky reachability between exposed assets and high-value targets.
- Attack-path before/after risk is presented as decision support for prioritization, approval, compensating controls, and evidence, not as permission to bypass workflow gates.
- Tenant boundary enforcement is represented as an enforced production policy.
- Freeze windows and emergency override requirements are policy controlled.
- Session tokens are signed, scoped to tenant context, and paired with CSRF tokens.
- Evidence exports are hash-chained when sealed through `/api/evidence/seal`.
- External LLM or SLM output cannot bypass deterministic controls for simulation, approval, rollback, evidence, tenant isolation, and credential attestation.
