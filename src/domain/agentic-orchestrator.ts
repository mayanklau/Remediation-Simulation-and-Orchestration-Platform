import { buildVirtualPatchingModel } from "@/domain/virtual-patching";
import { completeWithModel, configuredModelProviders, type ModelProviderName } from "@/lib/model-providers";
import { parseJsonObject, stringifyJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

export type AgentGoal = "prioritize" | "plan" | "virtual_patch" | "evidence" | "executive_summary" | "autonomous_governance";

export async function buildAgenticModel(tenantId: string) {
  const [findings, actions, workflows, simulations, policies, evidence, virtualPatching, reports, automationRuns] = await Promise.all([
    prisma.finding.findMany({ where: { tenantId, status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } }, include: { asset: true }, orderBy: { businessRiskScore: "desc" }, take: 20 }),
    prisma.remediationAction.findMany({ where: { tenantId }, include: { finding: { include: { asset: true } }, simulations: { orderBy: { createdAt: "desc" }, take: 1 }, plans: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.workflowItem.findMany({ where: { tenantId }, include: { approvals: true, remediationAction: { include: { finding: true } } }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.simulation.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.policy.findMany({ where: { tenantId }, orderBy: { policyType: "asc" }, take: 50 }),
    prisma.evidenceArtifact.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 50 }),
    buildVirtualPatchingModel(tenantId),
    prisma.reportSnapshot.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.automationRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  const providerStatus = configuredModelProviders();
  const readinessScore = scoreAgenticReadiness({ providerStatus, policies, simulations, workflows, evidence });

  return {
    generatedAt: new Date().toISOString(),
    readinessScore,
    status: readinessScore >= 85 ? "agentic_ready" : readinessScore >= 65 ? "human_supervised_ready" : "needs_model_or_policy_setup",
    providers: providerStatus,
    toolRegistry: agentToolRegistry(),
    safetyRails: safetyRails(),
    context: {
      topFindings: findings.map((finding) => ({
        id: finding.id,
        title: finding.title,
        asset: finding.asset?.name ?? "Unmapped",
        businessRisk: Math.round(finding.businessRiskScore),
        severity: finding.severity,
        internetExposure: Boolean(finding.asset?.internetExposure)
      })),
      actionCount: actions.length,
      workflowCount: workflows.length,
      simulationCount: simulations.length,
      policyCount: policies.length,
      evidenceCount: evidence.length,
      virtualPatchCandidates: virtualPatching.summary.virtualPatchCandidates,
      pathBreakerCandidates: virtualPatching.summary.pathBreakerCandidates,
      reports: reports.length,
      automationRuns: automationRuns.length
    },
    recentAgentRuns: reports
      .filter((report) => report.type === "agentic_plan")
      .map((report) => ({
        id: report.id,
        name: report.name,
        createdAt: report.createdAt,
        data: parseJsonObject(report.dataJson, {})
      }))
  };
}

export async function runAgenticPlanner(
  tenantId: string,
  input: {
    goal?: AgentGoal;
    prompt?: string;
    provider?: ModelProviderName;
    dryRun?: boolean;
  }
) {
  const model = await buildAgenticModel(tenantId);
  const goal = input.goal ?? "prioritize";
  const system = [
    "You are Remediation Twin's governed remediation agent.",
    "You may plan, prioritize, and recommend actions, but live execution must remain dry-run unless explicit policy and credentials are configured.",
    "Always include approval, rollback, validation, and evidence requirements.",
    "Prefer virtual patching and path breakers for exposed or high-criticality assets when permanent remediation is risky."
  ].join("\n");
  const prompt = [
    `Goal: ${goal}`,
    `User request: ${input.prompt ?? "Create the safest next remediation plan."}`,
    `Tenant context: ${JSON.stringify(model.context)}`,
    `Available tools: ${JSON.stringify(model.toolRegistry)}`,
    `Safety rails: ${JSON.stringify(model.safetyRails)}`
  ].join("\n\n");

  const completion = await completeWithModel({ system, prompt, temperature: 0.1, maxTokens: 1600 }, input.provider);
  const plan = buildGuardedToolPlan(goal, model, completion.output);
  const report = await prisma.reportSnapshot.create({
    data: {
      tenantId,
      name: `Agentic remediation plan ${new Date().toISOString().slice(0, 10)}`,
      type: "agentic_plan",
      createdBy: completion.provider,
      dataJson: stringifyJson({ goal, prompt: input.prompt, completion, plan, dryRun: input.dryRun ?? true })
    }
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      actor: "agentic-orchestrator",
      action: "agentic_plan_created",
      entityType: "report",
      entityId: report.id,
      detailsJson: stringifyJson({ goal, provider: completion.provider, model: completion.model, dryRun: input.dryRun ?? true, toolSteps: plan.steps.length })
    }
  });

  return { report, completion, plan };
}

export function agentToolRegistry() {
  return [
    { name: "ingest_findings", mode: "dry_run_or_api", risk: "low", purpose: "Normalize external findings." },
    { name: "run_simulation", mode: "safe", risk: "low", purpose: "Estimate risk reduction and operational risk." },
    { name: "generate_plan", mode: "safe", risk: "low", purpose: "Create rollout, rollback, validation, and evidence plan." },
    { name: "activate_virtual_patch", mode: "dry_run_default", risk: "medium", purpose: "Create compensating controls before permanent remediation." },
    { name: "break_attack_path", mode: "dry_run_default", risk: "medium", purpose: "Propose reachability interruption between exposed source and crown-jewel target." },
    { name: "route_approval", mode: "human_required", risk: "medium", purpose: "Create approval workflow with owners and CAB as needed." },
    { name: "execute_connector", mode: "dry_run_default", risk: "high", purpose: "Call Jira, GitHub, ServiceNow, cloud, IAM, or Kubernetes connector." },
    { name: "seal_evidence", mode: "safe", risk: "low", purpose: "Hash-chain evidence pack after validation." }
  ];
}

export function safetyRails() {
  return [
    "No live execution without explicit connector credentials and policy approval.",
    "Production assets require simulation, rollback plan, evidence plan, and human approval.",
    "Crown-jewel and internet-exposed assets require virtual patch or path-breaker assessment.",
    "All agent plans are tenant scoped and audit logged.",
    "External model output is advisory; deterministic policy gates decide execution eligibility.",
    "Secrets are referenced through configured providers and never included in model prompts."
  ];
}

function buildGuardedToolPlan(goal: AgentGoal, model: Awaited<ReturnType<typeof buildAgenticModel>>, output: string) {
  const steps = [
    { tool: "run_simulation", status: "recommended", reason: "Refresh confidence and operational risk before action." },
    { tool: goal === "virtual_patch" ? "activate_virtual_patch" : "generate_plan", status: "recommended", reason: "Create a safe remediation or compensating-control plan." },
    { tool: "route_approval", status: "required_before_live", reason: "Human approval is required before production execution." },
    { tool: "seal_evidence", status: "after_validation", reason: "Evidence must be hash-chained after validation." }
  ];
  if (model.context.pathBreakerCandidates > 0) {
    steps.splice(1, 0, { tool: "break_attack_path", status: "recommended", reason: "Attack path breaker candidates exist for this tenant." });
  }
  return {
    summary: output,
    autonomyLevel: model.readinessScore >= 85 ? "supervised_agentic" : "advisory_agentic",
    executionMode: "dry_run_default",
    steps
  };
}

function scoreAgenticReadiness(context: {
  providerStatus: ReturnType<typeof configuredModelProviders>;
  policies: unknown[];
  simulations: unknown[];
  workflows: unknown[];
  evidence: unknown[];
}) {
  const externalModel = context.providerStatus.some((provider) => provider.provider !== "deterministic" && provider.configured);
  return Math.min(
    100,
    35 +
      Number(externalModel) * 15 +
      Math.min(15, context.policies.length * 2) +
      Math.min(15, context.simulations.length) +
      Math.min(10, context.workflows.length) +
      Math.min(10, context.evidence.length)
  );
}
