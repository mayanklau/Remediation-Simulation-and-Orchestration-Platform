export type EnterpriseReadinessStatus = "implemented" | "contract_ready" | "external_setup_required";

export type EnterpriseReadinessControl = {
  id: string;
  name: string;
  status: EnterpriseReadinessStatus;
  evidence: string;
};

export type EnterpriseReadinessCategory = {
  id: string;
  name: string;
  owner: string;
  controls: EnterpriseReadinessControl[];
};

export const enterpriseReadinessCatalog: EnterpriseReadinessCategory[] = [
  {
    id: "identity_access_tenancy",
    name: "Identity, Access, And Tenancy",
    owner: "security-platform",
    controls: [
      control("oidc_sso", "OIDC, SAML, Azure AD, Okta, Google Workspace, generic IdP contract", "contract_ready"),
      control("scim_lifecycle", "SCIM provisioning, user lifecycle, group-to-role mapping", "contract_ready"),
      control("tenant_isolation", "Tenant isolation on every API query with cross-tenant denial tests", "implemented"),
      control("rbac_everywhere", "RBAC on APIs, routes, navigation, buttons, service accounts, and API keys", "implemented"),
      control("session_governance", "Session expiry, renewal, refresh-token strategy, and break-glass audit", "contract_ready"),
      control("support_access", "Support impersonation controls, customer admin console, and privileged audit", "contract_ready")
    ]
  },
  {
    id: "secrets_credentials",
    name: "Secrets And Credentials",
    owner: "platform-security",
    controls: [
      control("secret_references", "Vault, AWS Secrets Manager, Azure Key Vault, and GCP Secret Manager references", "contract_ready"),
      control("no_raw_secrets", "No raw secret storage; masked display and secret access audit", "implemented"),
      control("credential_validation", "Connector credential validation, rotation, expiry, OAuth refresh, and health checks", "contract_ready"),
      control("customer_managed_keys", "Customer-managed keys, BYOK, field-level encryption, encryption at rest and transit", "external_setup_required")
    ]
  },
  {
    id: "connectors_integrations",
    name: "Connectors And Integrations",
    owner: "integration-engineering",
    controls: [
      control("manual_connector_builder", "Manual/custom HTTP connector builder, dry-run mode, live mode, and run history", "implemented"),
      control("connector_runtime", "Retries, backoff, dead-letter queues, sync scheduler, trust score, data-quality score", "contract_ready"),
      control("scanner_adapters", "Tenable, Qualys, Rapid7, Wiz, Prisma Cloud, Lacework, Snyk, GHAS, GitLab", "contract_ready"),
      control("cloud_edr_adapters", "AWS Security Hub, Inspector, GCP SCC, Azure Defender, Microsoft Defender, CrowdStrike, SentinelOne", "contract_ready"),
      control("work_management", "ServiceNow, Jira, GitHub Issues, Azure DevOps, Slack, Teams, Email, CMDB, CAB calendar", "contract_ready"),
      control("webhook_sdk", "Webhook signatures, field mapping UI, normalization contracts, connector marketplace and parser SDK", "contract_ready")
    ]
  },
  {
    id: "ingestion_normalization_quality",
    name: "Ingestion, Normalization, And Data Quality",
    owner: "data-platform",
    controls: [
      control("ingestion_modes", "JSON, CSV, API, webhook, batch, and streaming ingestion contracts", "implemented"),
      control("mapping_wizards", "CSV/API mapping wizard, source normalization, canonical mapping, and finding lineage", "contract_ready"),
      control("data_quality", "Freshness, missing-field detection, confidence scoring, source quality dashboards", "contract_ready"),
      control("asset_resolution", "Asset identity resolution, merge/conflict workflow, owner disputes, CMDB/cloud/Kubernetes/code/IAM enrichment", "contract_ready"),
      control("business_context", "Business-service mapping, data sensitivity, crown jewels, environment, and exposure tagging", "implemented")
    ]
  },
  {
    id: "vulnerability_attack_paths",
    name: "Vulnerability Analytics And Attack Paths",
    owner: "exposure-management",
    controls: [
      control("chaining_domains", "Network, IAM, cloud, Kubernetes, app, CI/CD, secrets, and data-store chaining", "implemented"),
      control("graph_algorithms", "Attack graph construction, shortest path, k-hop blast radius, reachability, choke points, centrality", "implemented"),
      control("preconditions", "Privilege, network access, user interaction, token scope, lateral movement, exploit availability", "implemented"),
      control("intel_enrichment", "EPSS, CISA KEV, threat intel, and active exploitation enrichment", "contract_ready"),
      control("risk_quantification", "Difficulty, explainability, confidence, before/after risk, residual risk, FAIR-style risk dollars", "contract_ready"),
      control("continuous_recalc", "Business impact, dependency mapping, path regression detection, and continuous recalculation", "contract_ready")
    ]
  },
  {
    id: "simulation_decisioning",
    name: "Simulation And Decisioning",
    owner: "remediation-governance",
    controls: [
      control("control_simulation", "Patch, WAF, API gateway, IAM deny, segmentation, containers, Kubernetes, cloud policy", "implemented"),
      control("execution_risk", "Change, operational, rollback, approval, confidence, assumptions, and evidence scoring", "implemented"),
      control("path_breakers", "Path-breaker recommendation, ROI, virtual patching, compensating controls, and policy simulation", "implemented"),
      control("rollout_simulation", "Auto-approval, risk acceptance, progressive rollout, and canary remediation simulation", "contract_ready")
    ]
  },
  {
    id: "remediation_orchestration",
    name: "Remediation Orchestration",
    owner: "security-operations",
    controls: [
      control("queue_playbooks", "Remediation queue, action generation, playbooks, golden paths, owners, and SLAs", "implemented"),
      control("campaigns", "Campaigns, blockers, waves, SLA breaches, risk reduction, freeze windows, and maintenance windows", "implemented"),
      control("approval_exception", "CAB, service owner, security approvals, risk acceptance, exceptions, expiry, renewal", "implemented"),
      control("execution_hooks", "Dry-run/live execution, CI/CD, Kubernetes, cloud, IAM, Terraform, OPA/Rego, rollback, validation", "contract_ready")
    ]
  },
  {
    id: "ai_agentic_governance",
    name: "AI And Agentic Governance",
    owner: "ai-risk",
    controls: [
      control("model_routing", "LLM, SLM, local model, enterprise gateway, deterministic fallback, provider config", "implemented"),
      control("agent_safety", "Prompt registry, tool registry, dry-run mode, human approval, recommendation audit, confidence", "implemented"),
      control("model_risk", "Reasoning trace, decision record, policy simulator, eval harness, hallucination guardrails", "contract_ready"),
      control("prompt_security", "Prompt injection defenses, sensitive-data redaction, no secrets in prompts, connector-content sanitization", "contract_ready"),
      control("feedback_tuning", "Outcome feedback loop, customer-specific risk calibration, and AI safety tests", "contract_ready")
    ]
  },
  {
    id: "evidence_audit_compliance",
    name: "Evidence, Audit, And Compliance",
    owner: "grc",
    controls: [
      control("audit_evidence", "Full audit trail, immutable option, correlation IDs, evidence packs, chain of custody", "implemented"),
      control("evidence_exports", "Hash sealing, PDF/JSON/ZIP export, notarization, signed attestations", "contract_ready"),
      control("evidence_lifecycle", "Before state, simulation, approval, execution, validation, residual risk, legal hold, retention", "implemented"),
      control("compliance_mapping", "SOC 2, ISO 27001, NIST CSF, PCI DSS, HIPAA, FedRAMP-ready controls, DORA metrics", "contract_ready")
    ]
  },
  {
    id: "reporting_executive",
    name: "Reporting And Executive Views",
    owner: "security-leadership",
    controls: [
      control("dashboards", "Executive, CISO, service-owner, engineering, audit, connector, queue, and production health dashboards", "implemented"),
      control("risk_reports", "Business-service, crown-jewel, attack-path closure, weekly risk reduction, blockers, SLA, exceptions", "implemented"),
      control("exports_telemetry", "Evidence readiness, board export, customer success telemetry, adoption analytics, release notes, mobile view", "contract_ready")
    ]
  },
  {
    id: "platform_architecture",
    name: "Platform Architecture",
    owner: "architecture",
    controls: [
      control("contracts", "Service/repository layers, DTOs, validation, OpenAPI, API versioning, generated clients", "implemented"),
      control("workers_scale", "Background workers, queues, retries, idempotency, transactions, cache, migrations, index checks", "contract_ready"),
      control("resilience", "Backups, restores, fixtures, multi-tenant data strategy, data residency, regional isolation", "contract_ready"),
      control("deployment_modes", "Multi-region, active-active, DR, RPO/RTO, air-gapped, on-prem, and PrivateLink support", "external_setup_required")
    ]
  },
  {
    id: "security_hardening",
    name: "Security Hardening",
    owner: "appsec",
    controls: [
      control("api_security", "Rate limits, payload limits, CORS allowlist, CSRF where needed, headers, validation, encoding", "implemented"),
      control("runtime_security", "SSRF protection, upload validation, webhook signatures, prompt-injection protection", "contract_ready"),
      control("supply_chain", "Dependency, secret, SAST, DAST, container, SBOM, license scans, non-root containers", "contract_ready"),
      control("kubernetes_security", "Least privilege, network policies, security contexts, admission policies, disclosure policy", "external_setup_required")
    ]
  },
  {
    id: "observability_operations",
    name: "Observability And Operations",
    owner: "sre",
    controls: [
      control("telemetry", "Structured logs, request IDs, correlation IDs, metrics, traces, errors, alerts, SLOs, SLIs", "implemented"),
      control("runtime_monitoring", "Synthetic monitoring, queue depth, connector failures, simulation duration, risk latency, worker/database health", "contract_ready"),
      control("operability", "Health/readiness/liveness probes, graceful shutdown, incident/DR runbooks, diagnostics, admin console", "contract_ready"),
      control("release_ops", "Feature flags, dark launches, release rollback, change logs, customer-facing status", "contract_ready")
    ]
  },
  {
    id: "testing_quality",
    name: "Testing And Quality Gates",
    owner: "quality-engineering",
    controls: [
      control("test_pyramid", "Unit, API, integration, database, tenant, RBAC, connector, worker, queue, frontend tests", "implemented"),
      control("advanced_tests", "E2E, accessibility, visual regression, performance, load, chaos, failover, backup/restore", "contract_ready"),
      control("contract_security_tests", "Migration, OpenAPI, security, AI eval, prompt injection, preview/staging/prod checks", "contract_ready"),
      control("ci_gates", "Lint, typecheck, tests, build, dependency, container, and SBOM gates", "implemented")
    ]
  },
  {
    id: "deployment_devops",
    name: "Deployment And DevOps",
    owner: "devops",
    controls: [
      control("packaging", "Docker Compose, production Dockerfiles, Kubernetes manifests, Helm, Terraform, cloud examples", "contract_ready"),
      control("environments", "Local, dev, staging, production, config validation, strict production checks, CI/CD, previews", "implemented"),
      control("deployment_patterns", "Blue/green, canary, rollback, migration pipeline, secret injection, scaling guides, DR guide", "contract_ready")
    ]
  },
  {
    id: "product_experience",
    name: "Product Experience",
    owner: "product-design",
    controls: [
      control("onboarding", "Guided first run, admin/tenant/connector onboarding, empty/loading/error states, disabled reasons", "implemented"),
      control("productivity", "Bulk actions, saved filters, advanced search, graph filters/zoom/minimap/export/drill-down", "implemented"),
      control("exports_notifications", "CSV/PDF/JSON export, email/Slack/Teams/webhooks, preferences, feedback, in-product docs", "contract_ready"),
      control("readiness_guides", "Demo separation, customer pilot, go-live, and production readiness checklists", "implemented")
    ]
  },
  {
    id: "commercial_packaging",
    name: "Commercial And Packaging",
    owner: "product-operations",
    controls: [
      control("editions", "Edition gating, license enforcement, usage metering, tenant/connector/model metrics", "contract_ready"),
      control("marketplace", "Marketplace packaging, plugin packaging, self-service onboarding, support access controls", "contract_ready"),
      control("customer_health", "Secure support bundle, adoption telemetry, customer health score, trial and enterprise modes", "contract_ready")
    ]
  }
];

export function buildEnterpriseReadinessCatalogModel() {
  const controls = enterpriseReadinessCatalog.flatMap((category) => category.controls.map((control) => ({ ...control, category: category.name, owner: category.owner })));
  const implemented = controls.filter((control) => control.status === "implemented").length;
  const contractReady = controls.filter((control) => control.status === "contract_ready").length;
  const externalSetupRequired = controls.filter((control) => control.status === "external_setup_required").length;
  return {
    categories: enterpriseReadinessCatalog,
    summary: {
      categories: enterpriseReadinessCatalog.length,
      controls: controls.length,
      implemented,
      contractReady,
      externalSetupRequired,
      readinessScore: Math.round(((implemented + contractReady * 0.65) / controls.length) * 100),
      finalBar: [
        "secure by default",
        "tenant-safe by default",
        "dry-run by default",
        "evidence-first by default",
        "every action audited",
        "every recommendation explainable",
        "every deployment reproducible"
      ]
    }
  };
}

function control(id: string, name: string, status: EnterpriseReadinessStatus): EnterpriseReadinessControl {
  return {
    id,
    name,
    status,
    evidence: status === "implemented" ? "Implemented in application logic and covered by current tests/builds." : status === "contract_ready" ? "Application contract exists; wire customer-specific external systems and credentials." : "Requires customer infrastructure, cloud account, regional deployment, or security service configuration."
  };
}
