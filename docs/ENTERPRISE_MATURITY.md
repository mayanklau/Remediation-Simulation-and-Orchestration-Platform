# Enterprise Maturity Additions

This release adds the engineering and product maturity layer requested for Remediation Twin.

## Development Maturity

- SSO/OIDC production contract, signed sessions, tenant isolation checks, and RBAC permission gates.
- Service, repository, DTO, and shared validation contracts for moving routes away from direct persistence logic.
- Queue-worker contracts for ingestion, simulation, connector sync, evidence generation, and report snapshots.
- Runtime configuration validation for local, dev, staging, and production.
- Seed-free fixture factories for contract and integration testing.
- CI/CD gates for install, typecheck, tests, Prisma migration validation, production build, and dependency audit.
- Structured correlation IDs on protected APIs for audit and observability joins.
- Feature flags for autonomous remediation and model-based planning.

## Subject Maturity

- Attack-path graph algorithms for shortest exploitable path, bounded k-hop blast radius, centrality-style concentration, choke points, and crown-jewel exposure.
- Vulnerability chaining rules for network, IAM, cloud, Kubernetes, application, CI/CD, secrets, and data-store findings.
- Exploit precondition modeling for privilege, network access, user interaction, token scope, lateral movement, and control friction.
- Difficulty scoring with explainability and assumptions.
- Before/after risk simulation per control: patch, WAF/API rule, IAM deny, segmentation, container rebuild, and cloud policy.
- Path-breaker recommendation engine that identifies the edge/control that removes the most risk with the least change risk.
- Scanner normalization roadmap for Tenable, Qualys, Wiz, Prisma Cloud, Snyk, GitHub Advanced Security, AWS Security Hub, Defender, and CrowdStrike.
- Evidence packs with before state, simulation, approval, execution log, validation, and residual risk.
- Executive views for business services at risk, weekly risk reduced, blocked remediations, and attack paths closed.
