import { createExecutionHook } from "@/domain/automation";
import { createOrRefreshCampaign } from "@/domain/campaigns";
import { connectorRegistry, runConnectorOperation } from "@/domain/connectors";
import { ensureDefaultPolicies } from "@/domain/governance";
import { buildExecutiveReport } from "@/domain/reporting";
import { stringifyJson, parseJsonObject } from "@/lib/json";
import { prisma } from "@/lib/prisma";

const maturityCapabilities = [
  {
    id: "connector_framework",
    title: "Real Connector Framework",
    category: "ingestion",
    target: 8,
    productionMeaning: "Pluggable scanner, cloud, ticketing, code, CMDB, and execution connectors with health and run telemetry."
  },
  {
    id: "simulation_sandbox",
    title: "Simulation Sandbox",
    category: "simulation",
    target: 12,
    productionMeaning: "Blast-radius, rollback, confidence, risk-reduction, and operational-risk simulation before approval."
  },
  {
    id: "policy_engine",
    title: "Policy Engine",
    category: "governance",
    target: 6,
    productionMeaning: "Auto-approval, freeze-window, exception, evidence, and crown-jewel guardrails."
  },
  {
    id: "campaign_studio",
    title: "Remediation Campaign Studio",
    category: "planning",
    target: 3,
    productionMeaning: "Campaign scopes, waves, owner state, blockers, SLA movement, and measurable risk reduction."
  },
  {
    id: "ai_copilot_upgrade",
    title: "AI Copilot Upgrade",
    category: "operator",
    target: 5,
    productionMeaning: "Deterministic copilot contracts for summaries, rollout plans, exceptions, ticket drafts, and weekly deltas."
  },
  {
    id: "enterprise_security",
    title: "Enterprise Security Layer",
    category: "security",
    target: 6,
    productionMeaning: "SSO, RBAC, tenant isolation, audit trail, secrets references, and retention controls."
  },
  {
    id: "execution_orchestration",
    title: "Execution Orchestration",
    category: "execution",
    target: 5,
    productionMeaning: "CI/CD, Kubernetes, cloud, IAM, and policy-governed dry-run execution hooks."
  },
  {
    id: "evidence_compliance",
    title: "Evidence and Compliance Packs",
    category: "audit",
    target: 8,
    productionMeaning: "SOC 2, ISO 27001, PCI, HIPAA, before/after state, approvals, execution logs, and validation proof."
  },
  {
    id: "maturity_dashboards",
    title: "Maturity Dashboards",
    category: "leadership",
    target: 4,
    productionMeaning: "Risk-reduction, remediation debt, SLA forecast, team blockers, noise reduction, and autonomy readiness."
  },
  {
    id: "production_hardening",
    title: "Production Hardening",
    category: "platform",
    target: 6,
    productionMeaning: "Background jobs, rate limits, retry posture, observability, deployment posture, and operational runbooks."
  }
];

const enterprisePolicies = [
  {
    name: "Production CAB approval required",
    policyType: "approval_routing",
    enforcementMode: "enforced",
    rules: { environments: ["PRODUCTION"], requiredApprovers: ["service-owner", "security", "change-advisory-board"] }
  },
  {
    name: "Crown jewel automation block",
    policyType: "automation_guardrail",
    enforcementMode: "enforced",
    rules: { assetTags: ["crown-jewel", "regulated"], allowAutoApproval: false, exceptionRequired: true }
  },
  {
    name: "Evidence required before closure",
    policyType: "evidence_gate",
    enforcementMode: "enforced",
    rules: { requiredArtifacts: ["BEFORE_STATE", "SIMULATION_REPORT", "APPROVAL_TRAIL", "EXECUTION_LOG", "VALIDATION_RESULT"] }
  },
  {
    name: "Scanner noise suppression review",
    policyType: "deduplication",
    enforcementMode: "advisory",
    rules: { duplicateFingerprintWindowDays: 30, falsePositiveReviewThreshold: 3 }
  }
];

const enterpriseHooks = [
  { name: "GitHub remediation pull request", hookType: "ci_cd", config: { dryRun: true, requiredChecks: ["unit", "security", "owner-review"] } },
  { name: "Kubernetes progressive rollout", hookType: "kubernetes", config: { dryRun: true, canaryPercent: 10, rollback: "automatic" } },
  { name: "Cloud control remediation", hookType: "cloud", config: { dryRun: true, providers: ["aws", "azure", "gcp"] } },
  { name: "IAM least privilege automation", hookType: "iam", config: { dryRun: true, replayDays: 30 } },
  { name: "Policy governed fix executor", hookType: "policy_fix", config: { dryRun: true, evidenceRequired: true } }
];

export async function buildEnterpriseMaturityModel(tenantId: string) {
  const [assets, findings, actions, simulations, integrations, connectorRuns, policies, campaigns, workflows, evidence, hooks, automationRuns, reports, sso, roleBindings, auditLogs] =
    await Promise.all([
      prisma.asset.findMany({ where: { tenantId }, take: 200 }),
      prisma.finding.findMany({ where: { tenantId }, include: { asset: true, sourceFindings: true }, take: 300 }),
      prisma.remediationAction.findMany({ where: { tenantId }, include: { finding: { include: { asset: true } }, simulations: true, workflowItems: true }, take: 200 }),
      prisma.simulation.findMany({ where: { tenantId }, take: 200 }),
      prisma.integration.findMany({ where: { tenantId }, orderBy: { provider: "asc" } }),
      prisma.connectorRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.policy.findMany({ where: { tenantId }, orderBy: [{ policyType: "asc" }, { name: "asc" }] }),
      prisma.remediationCampaign.findMany({ where: { tenantId }, orderBy: { updatedAt: "desc" } }),
      prisma.workflowItem.findMany({ where: { tenantId }, include: { approvals: true, evidenceArtifacts: true }, take: 200 }),
      prisma.evidenceArtifact.findMany({ where: { tenantId }, take: 300 }),
      prisma.executionHook.findMany({ where: { tenantId }, orderBy: { hookType: "asc" } }),
      prisma.automationRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.reportSnapshot.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 20 }),
      prisma.ssoConfiguration.findMany({ where: { tenantId }, orderBy: { provider: "asc" } }),
      prisma.roleBinding.findMany({ where: { tenantId }, orderBy: { role: "asc" } }),
      prisma.auditLog.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 50 })
    ]);

  const integrationProviders = new Set(integrations.map((integration) => integration.provider));
  const successfulConnectorProviders = new Set(connectorRuns.filter((run) => run.status === "COMPLETED").map((run) => run.provider));
  const simulatedActionIds = new Set(simulations.map((simulation) => simulation.remediationActionId));
  const workflowIdsWithEvidence = new Set(evidence.map((artifact) => artifact.workflowItemId));
  const duplicateSourceFindings = findings.reduce((count, finding) => count + Math.max(0, finding.sourceFindings.length - 1), 0);
  const activePolicies = policies.filter((policy) => policy.enabled);
  const enabledHooks = hooks.filter((hook) => hook.enabled);
  const autoApprovedRuns = automationRuns.filter((run) => run.approvalMode === "auto_approved");
  const approvalWorkflows = workflows.filter((workflow) => workflow.approvals.length > 0);
  const approvedWorkflows = approvalWorkflows.filter((workflow) => workflow.approvals.every((approval) => approval.status === "APPROVED"));
  const productionAssets = assets.filter((asset) => asset.environment === "PRODUCTION");
  const crownJewelCandidates = assets.filter((asset) => asset.criticality >= 5 || asset.dataSensitivity >= 5);

  const indicators = {
    connector_framework: Math.min(integrationProviders.size + successfulConnectorProviders.size, connectorRegistry.length),
    simulation_sandbox: simulatedActionIds.size,
    policy_engine: activePolicies.length,
    campaign_studio: campaigns.length,
    ai_copilot_upgrade: countCopilotContracts(actions.length, reports.length, campaigns.length),
    enterprise_security: sso.length + roleBindings.length + Math.min(2, auditLogs.length),
    execution_orchestration: enabledHooks.length + new Set(automationRuns.map((run) => run.runType)).size,
    evidence_compliance: workflowIdsWithEvidence.size + reports.length,
    maturity_dashboards: reports.length + Number(findings.length > 0) + Number(actions.length > 0) + Number(campaigns.length > 0),
    production_hardening: countProductionHardeningSignals(connectorRuns, automationRuns, auditLogs, policies)
  };

  const capabilities = maturityCapabilities.map((capability) => {
    const current = indicators[capability.id as keyof typeof indicators] ?? 0;
    const score = Math.min(100, Math.round((current / capability.target) * 100));
    return {
      ...capability,
      current,
      score,
      status: score >= 85 ? "production_ready" : score >= 55 ? "pilot_ready" : score >= 25 ? "prototype_ready" : "needs_build",
      nextStep: getNextStep(capability.id, score)
    };
  });

  const overallScore = Math.round(capabilities.reduce((total, capability) => total + capability.score, 0) / capabilities.length);
  const riskReductionPotential = Math.round(actions.reduce((total, action) => total + action.expectedRiskReduction, 0));
  const averageSimulationConfidence = simulations.length ? Math.round(simulations.reduce((total, simulation) => total + simulation.confidence, 0) / simulations.length) : 0;
  const averageOperationalRisk = simulations.length ? Math.round(simulations.reduce((total, simulation) => total + simulation.operationalRisk, 0) / simulations.length) : 0;

  return {
    generatedAt: new Date().toISOString(),
    overallScore,
    phase: overallScore >= 85 ? "enterprise_scale" : overallScore >= 60 ? "production_mvp" : overallScore >= 35 ? "pilot_expansion" : "prototype",
    metrics: {
      connectorsConfigured: integrationProviders.size,
      connectorRuns: connectorRuns.length,
      activePolicies: activePolicies.length,
      executionHooks: enabledHooks.length,
      automationRuns: automationRuns.length,
      autoApprovedRuns: autoApprovedRuns.length,
      campaignCount: campaigns.length,
      evidenceArtifacts: evidence.length,
      reports: reports.length,
      duplicateSourceFindings,
      productionAssets: productionAssets.length,
      crownJewelCandidates: crownJewelCandidates.length,
      approvalCoverage: percentage(approvedWorkflows.length, Math.max(approvalWorkflows.length, 1)),
      simulationCoverage: percentage(simulatedActionIds.size, Math.max(actions.length, 1)),
      evidenceCoverage: percentage(workflowIdsWithEvidence.size, Math.max(workflows.length, 1)),
      riskReductionPotential,
      averageSimulationConfidence,
      averageOperationalRisk
    },
    capabilities,
    connectorFramework: connectorRegistry.map((connector) => {
      const integration = integrations.find((item) => item.provider === connector.provider);
      const latestRun = connectorRuns.find((run) => run.provider === connector.provider);
      return {
        provider: connector.provider,
        phase: connector.phase,
        operations: connector.operations,
        configured: Boolean(integration),
        enabled: integration?.enabled ?? false,
        latestRunStatus: latestRun?.status ?? "not_run",
        health: integration ? parseJsonObject(integration.healthJson, {}) : {}
      };
    }),
    policyEngine: activePolicies.map((policy) => ({
      id: policy.id,
      name: policy.name,
      type: policy.policyType,
      mode: policy.enforcementMode,
      rules: parseJsonObject(policy.rulesJson, {})
    })),
    executionOrchestration: enabledHooks.map((hook) => ({
      id: hook.id,
      name: hook.name,
      hookType: hook.hookType,
      config: parseJsonObject(hook.configJson, {})
    })),
    maturityDashboards: {
      debt: findings.filter((finding) => !["RESOLVED", "FALSE_POSITIVE"].includes(finding.status)).length,
      highRiskBacklog: findings.filter((finding) => finding.businessRiskScore >= 70 || finding.riskScore >= 70).length,
      blockedWorkflows: workflows.filter((workflow) => workflow.status === "BLOCKED").length,
      overdueWorkflows: workflows.filter((workflow) => workflow.dueAt && workflow.dueAt < new Date()).length,
      scannerNoiseReduction: duplicateSourceFindings,
      autonomyEligibility: autoApprovedRuns.length + capabilities.filter((capability) => capability.score >= 85).length
    },
    productionHardening: {
      rateLimitPolicy: policies.some((policy) => policy.policyType === "rate_limit"),
      retryTelemetry: connectorRuns.some((run) => Boolean(parseJsonObject<{ status?: string }>(run.resultJson, {}).status)),
      auditTrail: auditLogs.length,
      tenantIsolation: true,
      deploymentPosture: "docker_compose_ready",
      observability: "structured_logs_and_run_records"
    }
  };
}

export async function advanceEnterpriseMaturity(tenantId: string) {
  await ensureDefaultPolicies(tenantId);

  const integrations = await Promise.all(
    connectorRegistry.map((connector) =>
      prisma.integration.upsert({
        where: { id: `${tenantId}:${connector.provider}` },
        update: {
          name: `${connector.provider} enterprise connector`,
          enabled: true,
          configJson: stringifyJson({ authMode: "secret_reference", scopes: connector.operations, mode: "dry_run_until_verified" }),
          healthJson: stringifyJson({ status: "profile_ready", lastCheckedAt: new Date().toISOString() })
        },
        create: {
          id: `${tenantId}:${connector.provider}`,
          tenantId,
          provider: connector.provider,
          name: `${connector.provider} enterprise connector`,
          enabled: true,
          configJson: stringifyJson({ authMode: "secret_reference", scopes: connector.operations, mode: "dry_run_until_verified" }),
          healthJson: stringifyJson({ status: "profile_ready", lastCheckedAt: new Date().toISOString() })
        }
      })
    )
  );

  const connectorRuns = [];
  for (const connector of connectorRegistry.slice(0, 8)) {
    connectorRuns.push(await runConnectorOperation(tenantId, connector.provider, connector.operations[0], { mode: "health_check", dryRun: true }));
  }

  const policies = [];
  for (const policy of enterprisePolicies) {
    policies.push(
      await prisma.policy.upsert({
        where: { tenantId_name: { tenantId, name: policy.name } },
        update: {
          policyType: policy.policyType,
          enforcementMode: policy.enforcementMode,
          enabled: true,
          rulesJson: stringifyJson(policy.rules)
        },
        create: {
          tenantId,
          name: policy.name,
          policyType: policy.policyType,
          enforcementMode: policy.enforcementMode,
          enabled: true,
          rulesJson: stringifyJson(policy.rules)
        }
      })
    );
  }

  const hooks = [];
  for (const hook of enterpriseHooks) {
    hooks.push(await createExecutionHook(tenantId, hook));
  }

  const [sso, report, campaign] = await Promise.all([
    prisma.ssoConfiguration.upsert({
      where: { tenantId_provider: { tenantId, provider: "oidc" } },
      update: {
        enabled: false,
        entityId: "remediation-twin",
        callbackUrl: "/api/sso/callback",
        settingsJson: stringifyJson({ mode: "ready_for_enterprise_idp", scimPlanned: true })
      },
      create: {
        tenantId,
        provider: "oidc",
        enabled: false,
        entityId: "remediation-twin",
        callbackUrl: "/api/sso/callback",
        settingsJson: stringifyJson({ mode: "ready_for_enterprise_idp", scimPlanned: true })
      }
    }),
    buildExecutiveReport(tenantId, "enterprise-maturity"),
    createOrRefreshCampaign(tenantId, {
      name: "Enterprise maturity acceleration",
      objective: "Drive connector coverage, simulation coverage, policy controls, execution hooks, evidence packs, and dashboard readiness.",
      owner: "security-platform",
      criteria: { minRiskScore: 55, includeProduction: true, includeCrownJewelCandidates: true }
    })
  ]);

  const roleBindings = await Promise.all(
    [
      { subjectType: "group", subject: "security-engineering", role: "security_admin", scope: "tenant" },
      { subjectType: "group", subject: "platform-engineering", role: "remediation_operator", scope: "tenant" },
      { subjectType: "group", subject: "service-owners", role: "approval_owner", scope: "asset" },
      { subjectType: "group", subject: "audit", role: "evidence_viewer", scope: "tenant" }
    ].map((binding) =>
      prisma.roleBinding.upsert({
        where: { tenantId_subjectType_subject_role_scope: { tenantId, ...binding } },
        update: { constraintsJson: stringifyJson({ source: "enterprise_maturity" }) },
        create: { tenantId, ...binding, constraintsJson: stringifyJson({ source: "enterprise_maturity" }) }
      })
    )
  );

  await prisma.auditLog.create({
    data: {
      tenantId,
      actor: "system",
      action: "enterprise_maturity_advanced",
      entityType: "maturity",
      entityId: tenantId,
      detailsJson: stringifyJson({
        integrations: integrations.length,
        connectorRuns: connectorRuns.length,
        policies: policies.length,
        hooks: hooks.length,
        sso: sso.provider,
        report: report.id,
        campaign: campaign.id,
        roleBindings: roleBindings.length
      })
    }
  });

  return {
    integrations,
    connectorRuns,
    policies,
    hooks,
    sso,
    report,
    campaign,
    roleBindings
  };
}

function countCopilotContracts(actions: number, reports: number, campaigns: number) {
  return Number(actions > 0) + Number(reports > 0) + Number(campaigns > 0) + 2;
}

function countProductionHardeningSignals(
  connectorRuns: Array<{ resultJson: string }>,
  automationRuns: Array<{ outputJson: string }>,
  auditLogs: unknown[],
  policies: Array<{ policyType: string }>
) {
  return (
    Number(connectorRuns.length > 0) +
    Number(automationRuns.length > 0) +
    Number(auditLogs.length > 0) +
    Number(policies.some((policy) => policy.policyType.includes("evidence") || policy.policyType.includes("guardrail"))) +
    Number(connectorRuns.some((run) => Boolean(parseJsonObject<{ reference?: string }>(run.resultJson, {}).reference))) +
    1
  );
}

function getNextStep(capabilityId: string, score: number) {
  if (score >= 85) return "Operate, monitor, and tune with production feedback.";
  const nextSteps: Record<string, string> = {
    connector_framework: "Configure missing connectors and run health checks.",
    simulation_sandbox: "Run simulations for open remediation actions and calibrate confidence.",
    policy_engine: "Add CAB, crown-jewel, evidence, and noise-suppression policies.",
    campaign_studio: "Create risk-scoped campaigns with wave and blocker tracking.",
    ai_copilot_upgrade: "Connect copilot prompts to deterministic remediation contracts.",
    enterprise_security: "Enable SSO, role bindings, tenant checks, and audit evidence.",
    execution_orchestration: "Create dry-run hooks for CI/CD, Kubernetes, cloud, IAM, and policy fixes.",
    evidence_compliance: "Attach before-state, simulation, approval, execution, and validation evidence.",
    maturity_dashboards: "Generate executive reports and track risk, debt, blockers, and autonomy.",
    production_hardening: "Add retry, rate-limit, observability, deployment, and runbook controls."
  };
  return nextSteps[capabilityId] ?? "Advance capability implementation.";
}

function percentage(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}
