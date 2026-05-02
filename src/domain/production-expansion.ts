export type ProductionExpansionModule = {
  id: string;
  name: string;
  owner: string;
  status: "implemented" | "ready_to_wire" | "requires_customer_infra";
  purpose: string;
  apiSurface: string[];
  workflow: string[];
  evidence: string[];
  readinessGates: string[];
};

export const productionExpansionModules: ProductionExpansionModule[] = [
  module("admin_onboarding", "Admin Onboarding Wizard", "platform-admin", "implemented", "Guide a tenant from first login to production-safe configuration.", ["/api/tenants", "/api/sso", "/api/integrations", "/api/policies"], ["Create tenant", "Choose IdP", "Choose secret manager", "Add first connector", "Select first scan source", "Create first risk policy"], ["tenant profile", "IdP metadata", "secret manager reference", "connector profile", "policy record"], ["tenant exists", "RBAC catalog available", "connector dry-run completed"]),
  module("connector_marketplace", "Connector Marketplace", "integration-engineering", "implemented", "Expose connector catalog with scopes, setup steps, health checks, and dry-run onboarding.", ["/api/integrations", "/api/connectors/live"], ["Browse connectors", "Review required scopes", "Create profile", "Run dry check", "Promote to scheduled sync"], ["profile", "health run", "scope list", "owner assignment"], ["no raw credentials", "dry-run before live", "owner assigned"]),
  module("data_quality_center", "Data Quality Command Center", "data-platform", "implemented", "Score source freshness, completeness, confidence, duplicate rate, stale assets, and owner coverage.", ["/api/dashboard", "/api/findings", "/api/assets"], ["Measure source freshness", "Find missing fields", "Track duplicates", "Identify stale assets", "Flag weak owner mapping"], ["quality score", "source lineage", "staleness report", "owner gap list"], ["freshness scored", "lineage available", "owner gap visible"]),
  module("attack_path_validation_lab", "Attack Path Validation Lab", "exposure-management", "ready_to_wire", "Compare graph assumptions against cloud, IAM, scanner, and network reachability evidence.", ["/api/attack-paths", "/api/asset-graph"], ["Select path", "Review assumptions", "Attach reachability proof", "Recompute confidence", "Snapshot validation"], ["assumption list", "reachability proof", "confidence delta", "validation snapshot"], ["path exists", "assumptions explainable", "proof attached"]),
  module("remediation_economics", "Remediation Economics", "security-finance", "implemented", "Calculate risk reduction, engineering effort, SLA cost, exception cost, and ROI by campaign.", ["/api/reports", "/api/campaigns"], ["Estimate effort", "Calculate risk reduction", "Price SLA delay", "Compare exception cost", "Publish ROI"], ["ROI summary", "risk delta", "effort estimate", "campaign economics"], ["risk delta exists", "campaign owner exists", "evidence export ready"]),
  module("control_drift_detection", "Control Drift Detection", "sre-security", "ready_to_wire", "Detect removed or weakened virtual patches, IAM denies, segmentation rules, and cloud guardrails.", ["/api/virtual-patching", "/api/policies"], ["Register control", "Poll configured state", "Compare expected state", "Raise drift alert", "Open remediation"], ["expected control", "observed control", "drift alert", "remediation ticket"], ["control has owner", "expected state saved", "alert route configured"]),
  module("post_remediation_validation", "Post-Remediation Validation Loop", "security-operations", "implemented", "Trigger validation scans and compare before/after evidence before closure.", ["/api/remediation-actions/[id]/simulate", "/api/evidence/packs"], ["Execute remediation", "Trigger validation", "Compare before and after", "Record residual risk", "Seal evidence"], ["before state", "validation result", "residual risk", "sealed evidence"], ["simulation exists", "approval exists", "validation evidence present"]),
  module("customer_policy_builder", "Customer Policy Builder", "governance", "implemented", "No-code policies for auto-approval, freeze windows, exception expiry, evidence gates, and path breakers.", ["/api/policies", "/api/governance/apply-fix"], ["Select policy template", "Set conditions", "Simulate decision", "Approve policy", "Audit decisions"], ["policy JSON", "simulation result", "approval record", "decision audit"], ["policy validates", "simulation passes", "rollback path documented"]),
  module("plugin_sdk", "Plugin SDK And Example Connector", "developer-platform", "ready_to_wire", "Document and package internal connector/parser extension points without changing core code.", ["/api/integrations", "/api/connectors/live"], ["Create plugin", "Define parser", "Map fields", "Run contract test", "Publish internally"], ["SDK docs", "example connector", "contract test", "marketplace metadata"], ["schema valid", "no raw secrets", "contract test green"]),
  module("deployment_hardening_pack", "Deployment Hardening Pack", "devops", "ready_to_wire", "Package Helm, Terraform, environment templates, probes, and runbooks.", ["/api/health", "/api/observability"], ["Render manifests", "Inject secrets", "Run probes", "Validate migrations", "Publish runbook"], ["Helm values", "Terraform variables", "probe output", "runbook"], ["non-root image", "health probes", "backup configured"]),
  module("security_review_pack", "Security Review Pack", "appsec", "ready_to_wire", "Provide threat model, data-flow diagram, abuse cases, STRIDE, and control mapping.", ["/api/enterprise-readiness"], ["Generate data flow", "Map trust boundaries", "Review abuse cases", "Map controls", "Export pack"], ["DFD", "STRIDE table", "abuse cases", "control map"], ["sensitive flows marked", "controls mapped", "residual risks documented"]),
  module("executive_narratives", "Executive Narrative Reports", "security-leadership", "implemented", "Create board/CISO summaries for risk reduced, paths closed, money saved, and risk accepted.", ["/api/reports", "/api/attack-paths"], ["Collect metrics", "Generate narrative", "Attach evidence", "Export report", "Track weekly deltas"], ["board report", "CISO summary", "risk accepted list", "path closure report"], ["metrics current", "evidence linked", "owner approved"]),
  module("demo_mode_separation", "Live Demo Mode Switch", "product", "implemented", "Separate demo/sample flows from production logic with clear runtime mode indicators.", ["/api/mock-ingest", "/api/health"], ["Choose mode", "Load demo only on request", "Mark demo records", "Block accidental production mix", "Reset demo"], ["mode flag", "demo lineage", "reset audit"], ["production mode explicit", "demo data marked", "reset available"]),
  module("e2e_browser_suite", "E2E Browser Test Suite", "quality-engineering", "ready_to_wire", "Cover connector flow, attack path graph, simulation, evidence export, and readiness pages.", ["/", "/integrations", "/attack-paths", "/enterprise-readiness"], ["Start app", "Run connector flow", "Inspect graph", "Run simulation", "Check readiness"], ["browser trace", "screenshots", "test report"], ["critical paths covered", "screenshots captured", "CI runnable"]),
  module("data_residency", "Multi-Region And Data Residency Design", "architecture", "requires_customer_infra", "Support region-aware tenants, regional evidence storage, and residency policy checks.", ["/api/tenants", "/api/evidence/packs"], ["Assign region", "Choose evidence store", "Validate residency", "Route processing", "Audit access"], ["region policy", "storage location", "routing proof", "access audit"], ["region selected", "storage configured", "policy enforced"])
];

export function buildProductionExpansionModel() {
  const implemented = productionExpansionModules.filter((item) => item.status === "implemented").length;
  const readyToWire = productionExpansionModules.filter((item) => item.status === "ready_to_wire").length;
  const requiresCustomerInfra = productionExpansionModules.filter((item) => item.status === "requires_customer_infra").length;
  return {
    summary: {
      modules: productionExpansionModules.length,
      implemented,
      readyToWire,
      requiresCustomerInfra,
      productionScore: Math.round(((implemented + readyToWire * 0.7) / productionExpansionModules.length) * 100)
    },
    modules: productionExpansionModules
  };
}

function module(
  id: string,
  name: string,
  owner: string,
  status: ProductionExpansionModule["status"],
  purpose: string,
  apiSurface: string[],
  workflow: string[],
  evidence: string[],
  readinessGates: string[]
): ProductionExpansionModule {
  return { id, name, owner, status, purpose, apiSurface, workflow, evidence, readinessGates };
}
