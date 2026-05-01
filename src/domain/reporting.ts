import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";

export async function buildExecutiveReport(tenantId: string, createdBy?: string) {
  const [findingsBySeverity, findingsByStatus, assetsByEnvironment, simulations, approvals, overdueFindings, topActions] = await Promise.all([
    prisma.finding.groupBy({ by: ["severity"], where: { tenantId }, _count: true, _avg: { riskScore: true, businessRiskScore: true } }),
    prisma.finding.groupBy({ by: ["status"], where: { tenantId }, _count: true }),
    prisma.asset.groupBy({ by: ["environment"], where: { tenantId }, _count: true }),
    prisma.simulation.groupBy({ by: ["status"], where: { tenantId }, _count: true, _avg: { confidence: true, operationalRisk: true, riskReductionEstimate: true } }),
    prisma.approval.groupBy({ by: ["status"], where: { tenantId }, _count: true }),
    prisma.finding.count({ where: { tenantId, dueAt: { lt: new Date() }, status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } } }),
    prisma.remediationAction.findMany({
      where: { tenantId },
      include: { finding: { include: { asset: true } } },
      orderBy: [{ expectedRiskReduction: "desc" }, { createdAt: "desc" }],
      take: 10
    })
  ]);

  const data = {
    generatedAt: new Date().toISOString(),
    findingsBySeverity,
    findingsByStatus,
    assetsByEnvironment,
    simulations,
    approvals,
    overdueFindings,
    topActions: topActions.map((action) => ({
      id: action.id,
      title: action.title,
      status: action.status,
      actionType: action.actionType,
      expectedRiskReduction: action.expectedRiskReduction,
      finding: action.finding.title,
      asset: action.finding.asset?.name ?? "Unmapped"
    }))
  };

  return prisma.reportSnapshot.create({
    data: {
      tenantId,
      name: `Executive remediation report ${new Date().toISOString().slice(0, 10)}`,
      type: "executive",
      periodEnd: new Date(),
      createdBy,
      dataJson: stringifyJson(data)
    }
  });
}
