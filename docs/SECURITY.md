# Security Model

## Boundaries

- Every API is tenant scoped through `x-tenant-id` or the default local tenant.
- RBAC roles are defined in `src/domain/rbac.ts`.
- Connector configurations store secret references, not raw secrets.
- Automation and execution hooks default to dry-run.
- Audit records are created for maturity, pilot, governance, and final production activation.

## Headers

`middleware.ts` applies baseline security headers:

- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy` restricting camera, microphone, and geolocation
- HSTS in production

## Production Requirements

Before live execution:

1. Configure SSO/OIDC or SAML.
2. Bind users and groups to least-privilege RBAC roles.
3. Store connector credentials in an external secret manager.
4. Configure evidence storage with retention and immutability.
5. Enable OpenTelemetry and alert routing.
6. Keep automation in dry-run until policies, approvals, and rollback evidence are verified.

## High-Risk Controls

- Crown-jewel assets require manual approval.
- Production execution requires live credential attestation.
- Evidence packs are required before closure.
- Tenant boundary enforcement is represented as an enforced production policy.
- Freeze windows and emergency override requirements are policy controlled.
