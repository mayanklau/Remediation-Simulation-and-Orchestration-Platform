import { apiHandler } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const [openFindings, criticalFindings, assets, pendingApprovals, simulations, workflows, topFindings] = await Promise.all([
    prisma.finding.count({ where: { tenantId, status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } } }),
    prisma.finding.count({ where: { tenantId, severity: "CRITICAL", status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } } }),
    prisma.asset.count({ where: { tenantId } }),
    prisma.approval.count({ where: { tenantId, status: "PENDING" } }),
    prisma.simulation.count({ where: { tenantId } }),
    prisma.workflowItem.groupBy({ by: ["status"], where: { tenantId }, _count: true }),
    prisma.finding.findMany({
      where: { tenantId, status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } },
      include: { asset: true },
      orderBy: [{ businessRiskScore: "desc" }, { riskScore: "desc" }],
      take: 8
    })
  ]);
  return Response.json({
    metrics: {
      openFindings,
      criticalFindings,
      assets,
      pendingApprovals,
      simulations
    },
    workflowByStatus: workflows,
    topFindings
  });
});
