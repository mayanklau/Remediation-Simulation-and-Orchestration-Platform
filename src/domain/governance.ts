import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";
import { runSimulation } from "@/domain/simulation";
import { evaluateAutoApproval, startAutomationRun } from "@/domain/automation";

export async function ensureDefaultPolicies(tenantId: string) {
  const autoApproval = await prisma.policy.upsert({
    where: { tenantId_name: { tenantId, name: "Low-risk non-production auto approval" } },
    update: {},
    create: {
      tenantId,
      name: "Low-risk non-production auto approval",
      policyType: "auto_approval",
      enforcementMode: "enforced",
      rulesJson: stringifyJson({
        maxOperationalRisk: 30,
        minConfidence: 86,
        allowedActionTypes: ["cloud_configuration", "network_policy", "compliance_control"],
        allowedEnvironments: ["DEVELOPMENT", "STAGING"]
      })
    }
  });
  const continuousSimulation = await prisma.policy.upsert({
    where: { tenantId_name: { tenantId, name: "Continuous simulation for top risk" } },
    update: {},
    create: {
      tenantId,
      name: "Continuous simulation for top risk",
      policyType: "continuous_simulation",
      enforcementMode: "advisory",
      rulesJson: stringifyJson({ maxActionsPerRun: 5, minRiskScore: 60 })
    }
  });
  return [autoApproval, continuousSimulation];
}

export async function runContinuousSimulation(tenantId: string, limit = 5) {
  const actions = await prisma.remediationAction.findMany({
    where: { tenantId, finding: { status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } } },
    include: { finding: true, simulations: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: [{ finding: { businessRiskScore: "desc" } }, { createdAt: "desc" }],
    take: limit
  });
  const results = [];
  for (const action of actions) {
    const lastSimulation = action.simulations[0];
    const stale = !lastSimulation || Date.now() - lastSimulation.createdAt.getTime() > 24 * 60 * 60 * 1000;
    if (stale) {
      results.push(await runSimulation(tenantId, action.id, { rolloutStrategy: "phased" }));
    }
  }
  return { scanned: actions.length, simulated: results.length, results };
}

export async function buildPredictiveRiskModel(tenantId: string) {
  const findings = await prisma.finding.findMany({
    where: { tenantId, status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } },
    include: { asset: true, remediationActions: { include: { simulations: { orderBy: { createdAt: "desc" }, take: 1 } } } },
    orderBy: [{ businessRiskScore: "desc" }, { riskScore: "desc" }],
    take: 100
  });
  return findings.map((finding) => {
    const ageDays = Math.max(1, Math.round((Date.now() - finding.firstSeenAt.getTime()) / 86_400_000));
    const simulation = finding.remediationActions[0]?.simulations[0];
    const overduePenalty = finding.dueAt && finding.dueAt < new Date() ? 12 : 0;
    const exposurePenalty = finding.asset?.internetExposure ? 10 : 0;
    const simulationPenalty = simulation ? Math.max(0, simulation.operationalRisk - simulation.confidence / 2) : 8;
    const predictedResidualRisk = Math.max(0, Math.min(100, Math.round(finding.businessRiskScore + ageDays * 0.25 + overduePenalty + exposurePenalty + simulationPenalty)));
    return {
      findingId: finding.id,
      title: finding.title,
      asset: finding.asset?.name ?? "Unmapped",
      currentBusinessRisk: Math.round(finding.businessRiskScore),
      predictedResidualRisk,
      drivers: {
        ageDays,
        overdue: Boolean(finding.dueAt && finding.dueAt < new Date()),
        internetExposure: Boolean(finding.asset?.internetExposure),
        latestSimulationConfidence: simulation?.confidence ?? null
      }
    };
  });
}

export async function applyPolicyGovernedFix(tenantId: string, remediationActionId: string) {
  const decision = await evaluateAutoApproval(tenantId, remediationActionId);
  if (!decision.approved) return { decision, automationRun: null };
  const automationRun = await startAutomationRun(tenantId, {
    remediationActionId,
    policyId: decision.policy?.id,
    runType: "policy_fix",
    approvalMode: "auto_approved",
    payload: { reason: decision.reason }
  });
  return { decision, automationRun };
}
