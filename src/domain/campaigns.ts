import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";

export async function createOrRefreshCampaign(tenantId: string, input: { name: string; objective: string; owner?: string; criteria?: Record<string, unknown> }) {
  const criteria = input.criteria ?? { minRiskScore: 70 };
  const minRiskScore = typeof criteria.minRiskScore === "number" ? criteria.minRiskScore : 70;
  const category = typeof criteria.category === "string" ? criteria.category : undefined;
  const actions = await prisma.remediationAction.findMany({
    where: {
      tenantId,
      finding: {
        riskScore: { gte: minRiskScore },
        category: category ? { equals: category } : undefined,
        status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] }
      }
    },
    include: { finding: { include: { asset: true } }, simulations: { orderBy: { createdAt: "desc" }, take: 1 } },
    take: 50
  });
  const plan = {
    actionCount: actions.length,
    stages: [
      { name: "Triage", count: actions.filter((action) => !action.simulations[0]).length },
      { name: "Simulation", count: actions.filter((action) => action.status.includes("SIMULATION")).length },
      { name: "Execution", count: actions.filter((action) => action.simulations[0]?.confidence >= 80).length }
    ],
    actions: actions.map((action) => ({
      id: action.id,
      title: action.title,
      asset: action.finding.asset?.name ?? "Unmapped",
      riskScore: Math.round(action.finding.riskScore),
      latestSimulationConfidence: action.simulations[0]?.confidence ?? null
    }))
  };
  return prisma.remediationCampaign.upsert({
    where: { tenantId_name: { tenantId, name: input.name } },
    update: {
      objective: input.objective,
      owner: input.owner,
      criteriaJson: stringifyJson(criteria),
      planJson: stringifyJson(plan),
      metricsJson: stringifyJson({ actionCount: actions.length, refreshedAt: new Date().toISOString() })
    },
    create: {
      tenantId,
      name: input.name,
      objective: input.objective,
      owner: input.owner,
      criteriaJson: stringifyJson(criteria),
      planJson: stringifyJson(plan),
      metricsJson: stringifyJson({ actionCount: actions.length, refreshedAt: new Date().toISOString() })
    }
  });
}
