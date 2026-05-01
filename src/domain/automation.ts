import { prisma } from "@/lib/prisma";
import { parseJsonObject, stringifyJson } from "@/lib/json";

export type AutomationInput = {
  remediationActionId?: string;
  runType: "ci_cd" | "kubernetes" | "cloud" | "iam" | "policy_fix";
  hookId?: string;
  policyId?: string;
  approvalMode?: "manual" | "auto_approved" | "requires_change_board";
  payload?: Record<string, unknown>;
};

export async function createExecutionHook(tenantId: string, input: { name: string; hookType: string; enabled?: boolean; config?: Record<string, unknown> }) {
  return prisma.executionHook.upsert({
    where: { tenantId_name: { tenantId, name: input.name } },
    update: { hookType: input.hookType, enabled: input.enabled ?? true, configJson: stringifyJson(input.config ?? {}) },
    create: { tenantId, name: input.name, hookType: input.hookType, enabled: input.enabled ?? true, configJson: stringifyJson(input.config ?? {}) }
  });
}

export async function startAutomationRun(tenantId: string, input: AutomationInput) {
  const action = input.remediationActionId
    ? await prisma.remediationAction.findFirst({ where: { tenantId, id: input.remediationActionId }, include: { finding: { include: { asset: true } } } })
    : null;
  const startedAt = new Date();
  const plan = buildExecutionPlan(input.runType, action, input.payload ?? {});
  const run = await prisma.automationRun.create({
    data: {
      tenantId,
      remediationActionId: input.remediationActionId,
      policyId: input.policyId,
      hookId: input.hookId,
      runType: input.runType,
      status: "RUNNING",
      approvalMode: input.approvalMode ?? "manual",
      inputJson: stringifyJson(input.payload ?? {}),
      outputJson: stringifyJson({ plan }),
      startedAt
    }
  });
  return prisma.automationRun.update({
    where: { id: run.id },
    data: { status: "COMPLETED", completedAt: new Date(), outputJson: stringifyJson({ plan, result: "dry_run_complete" }) }
  });
}

export async function evaluateAutoApproval(tenantId: string, remediationActionId: string) {
  const action = await prisma.remediationAction.findFirstOrThrow({
    where: { tenantId, id: remediationActionId },
    include: { finding: { include: { asset: true } }, simulations: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
  const policies = await prisma.policy.findMany({ where: { tenantId, policyType: "auto_approval", enabled: true } });
  const lastSimulation = action.simulations[0];
  for (const policy of policies) {
    const rules = parseJsonObject<Record<string, unknown>>(policy.rulesJson, {});
    const maxOperationalRisk = numberRule(rules.maxOperationalRisk, 35);
    const minConfidence = numberRule(rules.minConfidence, 85);
    const allowedActionTypes = Array.isArray(rules.allowedActionTypes) ? rules.allowedActionTypes : [];
    const allowedEnvironments = Array.isArray(rules.allowedEnvironments) ? rules.allowedEnvironments : ["DEVELOPMENT", "STAGING"];
    const approved =
      lastSimulation &&
      lastSimulation.operationalRisk <= maxOperationalRisk &&
      lastSimulation.confidence >= minConfidence &&
      allowedActionTypes.includes(action.actionType) &&
      allowedEnvironments.includes(action.finding.asset?.environment ?? "UNKNOWN") &&
      !action.finding.activeExploitation;
    if (approved) {
      return { approved: true, policy, reason: `Auto-approved by ${policy.name}` };
    }
  }
  return { approved: false, policy: null, reason: "No enabled auto-approval policy matched the latest simulation and asset context." };
}

function buildExecutionPlan(runType: AutomationInput["runType"], action: Awaited<ReturnType<typeof prisma.remediationAction.findFirst>> & { finding?: { asset?: unknown } } | null, payload: Record<string, unknown>) {
  if (runType === "kubernetes") {
    return {
      target: "kubernetes",
      manifests: [{ apiVersion: "apps/v1", kind: "Deployment", metadata: { name: action?.title ?? "remediation-target" } }],
      steps: ["Render manifest patch", "Server-side dry run", "Apply during approved window", "Watch rollout status", "Collect evidence"],
      payload
    };
  }
  if (runType === "cloud") {
    return {
      target: "cloud",
      steps: ["Generate infrastructure diff", "Validate least privilege", "Execute provider dry run", "Apply change", "Verify cloud control state"],
      payload
    };
  }
  if (runType === "iam") {
    return {
      target: "iam",
      steps: ["Build policy delta", "Replay recent access patterns", "Attach scoped policy", "Monitor denied events", "Archive before and after policy"],
      payload
    };
  }
  if (runType === "policy_fix") {
    return {
      target: "governance",
      steps: ["Check policy guardrails", "Confirm simulation freshness", "Apply approved fix", "Run verification", "Update campaign metrics"],
      payload
    };
  }
  return {
    target: "ci_cd",
    steps: ["Create remediation branch", "Open pull request", "Run CI checks", "Require owner approval", "Merge after verification"],
    payload
  };
}

function numberRule(value: unknown, fallback: number) {
  return typeof value === "number" ? value : fallback;
}
