import { prisma } from "@/lib/prisma";
import { parseJsonObject, stringifyJson } from "@/lib/json";

type PlanSimulationResult = {
  requiredApprovals?: string[];
  recommendedRollout?: string[];
  validationSteps?: string[];
  rollbackPlan?: string[];
  riskReductionEstimate?: number;
};

export async function generateRemediationPlan(tenantId: string, remediationActionId: string, createdBy?: string) {
  const action = await prisma.remediationAction.findFirstOrThrow({
    where: { id: remediationActionId, tenantId },
    include: {
      finding: { include: { asset: true } },
      simulations: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  const simulationResult = parseJsonObject<PlanSimulationResult>(action.simulations[0]?.resultJson, {});
  const plan = {
    summary: action.summary,
    riskAddressed: {
      finding: action.finding.title,
      severity: action.finding.severity,
      riskScore: action.finding.riskScore,
      businessRiskScore: action.finding.businessRiskScore
    },
    affectedAssets: action.finding.asset ? [action.finding.asset] : [],
    requiredApprovals: simulationResult.requiredApprovals ?? ["security"],
    preChecks: [
      "Confirm ownership and current asset state",
      "Review simulation confidence and missing data",
      "Confirm maintenance window or emergency exception",
      "Capture before-state evidence"
    ],
    executionSteps: simulationResult.recommendedRollout ?? [
      "Apply remediation in the lowest-risk environment",
      "Validate expected behavior",
      "Apply remediation to production in a staged rollout"
    ],
    validationSteps: simulationResult.validationSteps ?? [
      "Confirm finding is no longer detected",
      "Validate service health",
      "Attach evidence"
    ],
    rollbackSteps: simulationResult.rollbackPlan ?? [
      "Stop rollout",
      "Restore previous state",
      "Notify owners",
      "Reopen workflow item"
    ],
    evidenceRequirements: [
      "Before state",
      "Simulation report",
      "Approval trail",
      "Execution log",
      "After state",
      "Validation result"
    ],
    expectedRiskReduction: simulationResult.riskReductionEstimate ?? action.expectedRiskReduction,
    residualRisk: "Residual risk must be reviewed after validation and rescanning."
  };

  const created = await prisma.remediationPlan.create({
    data: {
      tenantId,
      remediationActionId,
      title: `Plan: ${action.title}`,
      summary: `Remediation plan for ${action.finding.title}`,
      planJson: stringifyJson(plan),
      createdBy
    }
  });

  await prisma.remediationAction.update({
    where: { id: remediationActionId },
    data: { status: "PLAN_GENERATED" }
  });

  return { plan: created, content: plan };
}
