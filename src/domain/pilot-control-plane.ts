import { addDays } from "date-fns";
import { createExecutionHook, startAutomationRun } from "@/domain/automation";
import { createOrRefreshCampaign } from "@/domain/campaigns";
import { connectorRegistry, runConnectorOperation } from "@/domain/connectors";
import { buildEvidencePack, listEvidencePackReadiness } from "@/domain/evidence-pack";
import { ensureDefaultPolicies, runContinuousSimulation } from "@/domain/governance";
import { generateRemediationPlan } from "@/domain/plans";
import { buildExecutiveReport } from "@/domain/reporting";
import { runSimulation } from "@/domain/simulation";
import { parseJsonObject, stringifyJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

const scannerConnectors = [
  { provider: "tenable", label: "Tenable Vulnerability Management", category: "vulnerability_scanner" },
  { provider: "qualys", label: "Qualys VMDR", category: "vulnerability_scanner" },
  { provider: "wiz", label: "Wiz CNAPP", category: "cloud_security" },
  { provider: "snyk", label: "Snyk Open Source", category: "appsec" },
  { provider: "github", label: "GitHub Advanced Security", category: "code_security" },
  { provider: "aws-security-hub", label: "AWS Security Hub", category: "cloud_security" }
];

const playbookLibrary = [
  { name: "Critical patch rollout", actionType: "patch_rollout", riskClass: "critical", approvals: ["service-owner", "security", "change-advisory-board"] },
  { name: "Container rebuild", actionType: "patch_rollout", riskClass: "high", approvals: ["application-owner", "security"] },
  { name: "IAM least privilege fix", actionType: "iam_policy", riskClass: "high", approvals: ["iam-owner", "security"] },
  { name: "Kubernetes network policy", actionType: "network_policy", riskClass: "medium", approvals: ["platform-owner", "security"] },
  { name: "Cloud configuration control", actionType: "cloud_configuration", riskClass: "medium", approvals: ["cloud-owner", "security"] },
  { name: "Exception with compensating controls", actionType: "exception_review", riskClass: "variable", approvals: ["risk-owner", "security", "audit"] }
];

const policyAsCodeRules = [
  {
    name: "Auto approve low risk development changes",
    policyType: "auto_approval",
    mode: "enforced",
    rules: { allowedEnvironments: ["DEVELOPMENT", "STAGING"], maxOperationalRisk: 25, minConfidence: 88, forbiddenAssetTags: ["regulated", "crown-jewel"] }
  },
  {
    name: "Block production freeze window execution",
    policyType: "change_freeze",
    mode: "enforced",
    rules: { timezone: "UTC", blockedDays: ["Saturday", "Sunday"], emergencyOverrideRequires: ["security-director", "cab-chair"] }
  },
  {
    name: "Require evidence pack before closure",
    policyType: "evidence_gate",
    mode: "enforced",
    rules: { requiredArtifacts: ["BEFORE_STATE", "SIMULATION_REPORT", "APPROVAL_TRAIL", "EXECUTION_LOG", "VALIDATION_RESULT"] }
  },
  {
    name: "Crown jewel manual approval",
    policyType: "automation_guardrail",
    mode: "enforced",
    rules: { criticalityAtLeast: 5, dataSensitivityAtLeast: 5, allowAutoApproval: false, requiredApprovers: ["business-owner", "security", "cab"] }
  },
  {
    name: "Scanner duplicate suppression",
    policyType: "deduplication",
    mode: "advisory",
    rules: { fingerprintWindowDays: 30, suppressLowerConfidenceDuplicates: true, retainSourceEvidence: true }
  }
];

const executionHooks = [
  { name: "GitHub remediation PR executor", hookType: "ci_cd", runType: "ci_cd" as const, config: { dryRun: true, branchPrefix: "remediation/", requiredChecks: ["unit", "security", "owner-review"] } },
  { name: "Kubernetes rollout executor", hookType: "kubernetes", runType: "kubernetes" as const, config: { dryRun: true, rollout: "progressive", canaryPercent: 10, rollback: "automatic" } },
  { name: "Cloud remediation executor", hookType: "cloud", runType: "cloud" as const, config: { dryRun: true, providers: ["aws", "azure", "gcp"], requirePlanDiff: true } },
  { name: "IAM policy executor", hookType: "iam", runType: "iam" as const, config: { dryRun: true, replayDays: 30, deniedEventMonitor: true } },
  { name: "Policy governed fix executor", hookType: "policy_fix", runType: "policy_fix" as const, config: { dryRun: true, requireFreshSimulationHours: 24, requireEvidence: true } }
];

export async function buildPilotControlPlane(tenantId: string) {
  const [
    integrations,
    connectorRuns,
    policies,
    hooks,
    automationRuns,
    campaigns,
    reports,
    actions,
    workflows,
    evidenceReadiness,
    sso,
    roleBindings,
    auditLogs
  ] = await Promise.all([
    prisma.integration.findMany({ where: { tenantId }, orderBy: { provider: "asc" } }),
    prisma.connectorRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.policy.findMany({ where: { tenantId }, orderBy: { policyType: "asc" } }),
    prisma.executionHook.findMany({ where: { tenantId }, orderBy: { hookType: "asc" } }),
    prisma.automationRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.remediationCampaign.findMany({ where: { tenantId }, orderBy: { updatedAt: "desc" } }),
    prisma.reportSnapshot.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.remediationAction.findMany({ where: { tenantId }, include: { finding: { include: { asset: true } }, simulations: true, plans: true }, take: 100 }),
    prisma.workflowItem.findMany({ where: { tenantId }, include: { approvals: true, evidenceArtifacts: true, remediationAction: { include: { finding: { include: { asset: true } } } } }, take: 100 }),
    listEvidencePackReadiness(tenantId),
    prisma.ssoConfiguration.findMany({ where: { tenantId } }),
    prisma.roleBinding.findMany({ where: { tenantId } }),
    prisma.auditLog.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 50 })
  ]);

  const connectorProviders = new Set(integrations.map((integration) => integration.provider));
  const healthyProviders = new Set(connectorRuns.filter((run) => run.status === "COMPLETED").map((run) => run.provider));
  const openActions = actions.filter((action) => !["CLOSED", "RESOLVED"].includes(action.status));
  const simulatedActions = new Set(actions.filter((action) => action.simulations.length > 0).map((action) => action.id));
  const plannedActions = new Set(actions.filter((action) => action.plans.length > 0).map((action) => action.id));
  const workflowsWithApprovals = workflows.filter((workflow) => workflow.approvals.length > 0);
  const workflowsWithEvidence = workflows.filter((workflow) => workflow.evidenceArtifacts.length > 0);

  const tracks = [
    track("real_scanner_connectors", "Real Scanner Connectors", connectorProviders.size, scannerConnectors.length, "Connect real scanner, cloud, code, and exposure-management sources."),
    track("true_simulation_engine", "True Simulation Engine", simulatedActions.size, Math.max(openActions.length, 1), "Simulate outage, dependency, rollback, and residual risk before execution."),
    track("remediation_playbook_library", "Remediation Playbook Library", plannedActions.size + playbookLibrary.length, Math.max(openActions.length, 1) + playbookLibrary.length, "Attach repeatable playbooks to remediation actions."),
    track("policy_as_code", "Policy-as-Code", policies.filter((policy) => policy.enabled).length, policyAsCodeRules.length + 2, "Enforce freeze windows, evidence gates, crown-jewel controls, and auto-approval boundaries."),
    track("approval_workbench", "Approval Workbench", workflowsWithApprovals.length, Math.max(workflows.length, 1), "Route service-owner, security, CAB, risk, and audit decisions with history."),
    track("execution_integrations", "Jira/GitHub/ServiceNow Execution", healthyProviders.size, 3, "Create and sync external work items and change records."),
    track("evidence_vault", "Evidence Vault", workflowsWithEvidence.length, Math.max(workflows.length, 1), "Build immutable before/after, approval, execution, and validation evidence packs."),
    track("ai_remediation_planner", "AI Remediation Planner", reports.length + Number(openActions.length > 0), 4, "Generate deterministic plans, owner hints, exception rationale, and weekly deltas."),
    track("executive_dashboards", "Executive Dashboards", reports.length + campaigns.length, 5, "Show board-level debt, SLA, campaign ROI, and autonomy readiness."),
    track("production_saas_layer", "Production SaaS Layer", sso.length + roleBindings.length + Number(auditLogs.length > 0) + Number(hooks.length > 0), 8, "Harden tenancy, SSO, RBAC, audit, rate limits, workers, and observability.")
  ];

  return {
    generatedAt: new Date().toISOString(),
    overallReadiness: Math.round(tracks.reduce((sum, item) => sum + item.score, 0) / tracks.length),
    phase: readinessPhase(Math.round(tracks.reduce((sum, item) => sum + item.score, 0) / tracks.length)),
    metrics: {
      connectorsConfigured: connectorProviders.size,
      connectorHealthRuns: connectorRuns.length,
      policyRules: policies.length,
      executionHooks: hooks.length,
      automationRuns: automationRuns.length,
      workflows: workflows.length,
      approvalCoverage: percentage(workflowsWithApprovals.length, Math.max(workflows.length, 1)),
      evidenceCoverage: percentage(workflowsWithEvidence.length, Math.max(workflows.length, 1)),
      simulationCoverage: percentage(simulatedActions.size, Math.max(openActions.length, 1)),
      reports: reports.length,
      campaigns: campaigns.length
    },
    tracks,
    scannerConnectors: scannerConnectors.map((connector) => {
      const integration = integrations.find((item) => item.provider === connector.provider);
      const run = connectorRuns.find((item) => item.provider === connector.provider);
      return {
        ...connector,
        configured: Boolean(integration),
        status: integration?.enabled ? "configured" : "not_configured",
        latestRun: run?.status ?? "not_run",
        health: integration ? parseJsonObject(integration.healthJson, {}) : {}
      };
    }),
    playbooks: playbookLibrary.map((playbook) => ({
      ...playbook,
      mappedActions: actions.filter((action) => action.actionType === playbook.actionType || (playbook.actionType === "exception_review" && action.status.includes("EXCEPTION"))).length
    })),
    policies: policies.map((policy) => ({
      id: policy.id,
      name: policy.name,
      type: policy.policyType,
      mode: policy.enforcementMode,
      enabled: policy.enabled,
      rules: parseJsonObject(policy.rulesJson, {})
    })),
    approvalWorkbench: workflows.slice(0, 10).map((workflow) => ({
      id: workflow.id,
      status: workflow.status,
      priority: workflow.priority,
      action: workflow.remediationAction.title,
      finding: workflow.remediationAction.finding.title,
      asset: workflow.remediationAction.finding.asset?.name ?? "Unmapped",
      approvals: workflow.approvals.map((approval) => ({ approver: approval.approverEmail, status: approval.status })),
      evidenceCount: workflow.evidenceArtifacts.length
    })),
    executionIntegrations: connectorRuns.slice(0, 12).map((run) => ({
      id: run.id,
      provider: run.provider,
      operation: run.operation,
      status: run.status,
      result: parseJsonObject(run.resultJson, {})
    })),
    evidenceVault: evidenceReadiness.slice(0, 10),
    executiveDashboards: reports.slice(0, 8).map((report) => ({
      id: report.id,
      name: report.name,
      type: report.type,
      createdAt: report.createdAt,
      data: parseJsonObject(report.dataJson, {})
    })),
    productionSaasLayer: {
      ssoProviders: sso.map((item) => ({ provider: item.provider, enabled: item.enabled })),
      roleBindings: roleBindings.length,
      auditEvents: auditLogs.length,
      hooks: hooks.map((hook) => ({ name: hook.name, type: hook.hookType, enabled: hook.enabled })),
      hardening: [
        { control: "Tenant isolation", status: "implemented" },
        { control: "SSO/OIDC readiness", status: sso.length > 0 ? "configured" : "missing" },
        { control: "RBAC bindings", status: roleBindings.length > 0 ? "configured" : "missing" },
        { control: "Audit retention trail", status: auditLogs.length > 0 ? "active" : "missing" },
        { control: "Dry-run execution workers", status: hooks.length > 0 ? "active" : "missing" },
        { control: "Evidence retention", status: workflowsWithEvidence.length > 0 ? "active" : "pending" }
      ]
    }
  };
}

export async function activatePilotControlPlane(tenantId: string) {
  await ensureDefaultPolicies(tenantId);

  const integrations = await Promise.all(
    scannerConnectors.map((connector) =>
      prisma.integration.upsert({
        where: { id: `${tenantId}:${connector.provider}` },
        update: {
          name: connector.label,
          enabled: true,
          configJson: stringifyJson({ authMode: "secret_reference", category: connector.category, mode: "pilot_dry_run", schedule: "hourly" }),
          healthJson: stringifyJson({ status: "configured", readiness: "awaiting_live_credentials", lastCheckedAt: new Date().toISOString() })
        },
        create: {
          id: `${tenantId}:${connector.provider}`,
          tenantId,
          provider: connector.provider,
          name: connector.label,
          enabled: true,
          configJson: stringifyJson({ authMode: "secret_reference", category: connector.category, mode: "pilot_dry_run", schedule: "hourly" }),
          healthJson: stringifyJson({ status: "configured", readiness: "awaiting_live_credentials", lastCheckedAt: new Date().toISOString() })
        }
      })
    )
  );

  const connectorRuns = [];
  for (const connector of connectorRegistry.filter((item) => ["jira", "github", "servicenow", ...scannerConnectors.map((scanner) => scanner.provider)].includes(item.provider))) {
    connectorRuns.push(await runConnectorOperation(tenantId, connector.provider, connector.operations[0], { mode: "pilot_activation", dryRun: true }));
  }

  const policies = [];
  for (const policy of policyAsCodeRules) {
    policies.push(
      await prisma.policy.upsert({
        where: { tenantId_name: { tenantId, name: policy.name } },
        update: { policyType: policy.policyType, enforcementMode: policy.mode, enabled: true, rulesJson: stringifyJson(policy.rules) },
        create: { tenantId, name: policy.name, policyType: policy.policyType, enforcementMode: policy.mode, enabled: true, rulesJson: stringifyJson(policy.rules) }
      })
    );
  }

  const hooks = [];
  for (const hook of executionHooks) {
    hooks.push(await createExecutionHook(tenantId, hook));
  }

  const actions = await prisma.remediationAction.findMany({
    where: { tenantId },
    include: { finding: { include: { asset: true } }, simulations: { take: 1 }, plans: { take: 1 }, workflowItems: { include: { approvals: true, evidenceArtifacts: true } } },
    orderBy: [{ expectedRiskReduction: "desc" }, { createdAt: "desc" }],
    take: 8
  });

  const simulations = [];
  const plans = [];
  const workflows = [];
  const automationRuns = [];
  const evidencePacks = [];

  for (const action of actions) {
    if (action.simulations.length === 0) {
      simulations.push(await runSimulation(tenantId, action.id, { rolloutStrategy: action.finding.asset?.environment === "PRODUCTION" ? "canary" : "phased" }));
    }
    if (action.plans.length === 0) {
      plans.push(await generateRemediationPlan(tenantId, action.id, "pilot-control-plane"));
    }

    const workflow =
      action.workflowItems[0] ??
      (await prisma.workflowItem.create({
        data: {
          tenantId,
          remediationActionId: action.id,
          status: "APPROVAL_REQUIRED",
          priority: action.finding.businessRiskScore >= 80 ? 1 : action.finding.businessRiskScore >= 60 ? 2 : 3,
          dueAt: addDays(new Date(), action.finding.businessRiskScore >= 80 ? 7 : 21),
          commentsJson: stringifyJson([{ author: "system", body: "Pilot control plane routed this remediation through approval and evidence capture.", at: new Date().toISOString() }])
        },
        include: { approvals: true, evidenceArtifacts: true }
      }));
    workflows.push(workflow);

    for (const approverEmail of requiredApproversForAction(action)) {
      const approval = await prisma.approval.findFirst({ where: { tenantId, workflowItemId: workflow.id, approverEmail } });
      if (!approval) {
        await prisma.approval.create({ data: { tenantId, workflowItemId: workflow.id, approverEmail, status: "PENDING" } });
      }
    }

    await upsertEvidenceArtifact(tenantId, workflow.id, "BEFORE_STATE", "Before-state control snapshot", {
      findingId: action.findingId,
      asset: action.finding.asset?.name ?? "Unmapped",
      currentRisk: action.finding.businessRiskScore,
      capturedAt: new Date().toISOString()
    });
    await upsertEvidenceArtifact(tenantId, workflow.id, "SIMULATION_REPORT", "Simulation readiness report", {
      remediationActionId: action.id,
      simulationRequired: true,
      generatedBy: "pilot_control_plane"
    });
    await upsertEvidenceArtifact(tenantId, workflow.id, "EXECUTION_LOG", "Dry-run execution log", {
      mode: "dry_run",
      status: "ready",
      generatedAt: new Date().toISOString()
    });
    await upsertEvidenceArtifact(tenantId, workflow.id, "VALIDATION_RESULT", "Validation checklist", {
      checks: ["scanner_delta", "service_health", "owner_acceptance"],
      status: "pending_execution"
    });
    evidencePacks.push(await buildEvidencePack(tenantId, workflow.id));
  }

  const firstAction = actions[0];
  if (firstAction) {
    for (const hook of hooks.slice(0, 5)) {
      const executionHook = executionHooks.find((candidate) => candidate.name === hook.name);
      automationRuns.push(
        await startAutomationRun(tenantId, {
          remediationActionId: firstAction.id,
          hookId: hook.id,
          runType: executionHook?.runType ?? "ci_cd",
          approvalMode: "manual",
          payload: { pilot: true, dryRun: true, hook: hook.name }
        })
      );
    }
  }

  const [campaign, executiveReport, continuousSimulation] = await Promise.all([
    createOrRefreshCampaign(tenantId, {
      name: "Pilot-ready remediation launch",
      objective: "Operate scanner ingestion, simulation, approvals, external execution, evidence, dashboards, and SaaS hardening as one pilot control plane.",
      owner: "security-platform",
      criteria: { minRiskScore: 50, includeProduction: true, requireEvidencePack: true }
    }),
    buildExecutiveReport(tenantId, "pilot-control-plane"),
    runContinuousSimulation(tenantId, 5)
  ]);

  const [sso, roleBindings] = await Promise.all([
    prisma.ssoConfiguration.upsert({
      where: { tenantId_provider: { tenantId, provider: "oidc" } },
      update: { enabled: false, entityId: "remediation-twin", callbackUrl: "/api/sso/callback", settingsJson: stringifyJson({ mode: "pilot_ready", scim: "planned", jitProvisioning: true }) },
      create: { tenantId, provider: "oidc", enabled: false, entityId: "remediation-twin", callbackUrl: "/api/sso/callback", settingsJson: stringifyJson({ mode: "pilot_ready", scim: "planned", jitProvisioning: true }) }
    }),
    upsertPilotRoleBindings(tenantId)
  ]);

  await prisma.auditLog.create({
    data: {
      tenantId,
      actor: "system",
      action: "pilot_control_plane_activated",
      entityType: "pilot_control_plane",
      entityId: tenantId,
      detailsJson: stringifyJson({
        integrations: integrations.length,
        connectorRuns: connectorRuns.length,
        policies: policies.length,
        hooks: hooks.length,
        actions: actions.length,
        workflows: workflows.length,
        evidencePacks: evidencePacks.length,
        automationRuns: automationRuns.length,
        campaign: campaign.id,
        report: executiveReport.id,
        sso: sso.provider,
        roleBindings: roleBindings.length,
        continuousSimulation
      })
    }
  });

  return {
    integrations,
    connectorRuns,
    policies,
    hooks,
    simulations,
    plans,
    workflows,
    evidencePacks,
    automationRuns,
    campaign,
    executiveReport,
    continuousSimulation,
    sso,
    roleBindings
  };
}

function track(id: string, title: string, current: number, target: number, outcome: string) {
  const score = percentage(current, Math.max(target, 1));
  return {
    id,
    title,
    current,
    target,
    score,
    outcome,
    status: score >= 90 ? "production_ready" : score >= 70 ? "pilot_ready" : score >= 40 ? "in_progress" : "needs_activation"
  };
}

function readinessPhase(score: number) {
  if (score >= 90) return "production_ready";
  if (score >= 70) return "pilot_ready";
  if (score >= 45) return "implementation";
  return "foundation";
}

function requiredApproversForAction(action: {
  finding: { businessRiskScore: number; asset: { environment: string; criticality: number; dataSensitivity: number } | null };
}) {
  const approvers = new Set(["security.approver@example.com"]);
  if (action.finding.asset?.environment === "PRODUCTION" || action.finding.businessRiskScore >= 70) approvers.add("service.owner@example.com");
  if ((action.finding.asset?.criticality ?? 0) >= 5 || (action.finding.asset?.dataSensitivity ?? 0) >= 5) approvers.add("risk.owner@example.com");
  if (action.finding.businessRiskScore >= 85) approvers.add("cab@example.com");
  return [...approvers];
}

async function upsertEvidenceArtifact(tenantId: string, workflowItemId: string, type: string, title: string, content: Record<string, unknown>) {
  const existing = await prisma.evidenceArtifact.findFirst({ where: { tenantId, workflowItemId, type, title } });
  if (existing) {
    return prisma.evidenceArtifact.update({
      where: { id: existing.id },
      data: { contentJson: stringifyJson(content) }
    });
  }
  return prisma.evidenceArtifact.create({
    data: { tenantId, workflowItemId, type, title, contentJson: stringifyJson(content) }
  });
}

async function upsertPilotRoleBindings(tenantId: string) {
  return Promise.all(
    [
      { subjectType: "group", subject: "security-engineering", role: "security_admin", scope: "tenant" },
      { subjectType: "group", subject: "platform-engineering", role: "remediation_operator", scope: "tenant" },
      { subjectType: "group", subject: "service-owners", role: "approval_owner", scope: "asset" },
      { subjectType: "group", subject: "change-advisory-board", role: "change_approver", scope: "tenant" },
      { subjectType: "group", subject: "audit", role: "evidence_viewer", scope: "tenant" }
    ].map((binding) =>
      prisma.roleBinding.upsert({
        where: { tenantId_subjectType_subject_role_scope: { tenantId, ...binding } },
        update: { constraintsJson: stringifyJson({ source: "pilot_control_plane" }) },
        create: { tenantId, ...binding, constraintsJson: stringifyJson({ source: "pilot_control_plane" }) }
      })
    )
  );
}

function percentage(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}
