import { prisma } from "@/lib/prisma";

export type FindingQuery = {
  tenantId: string;
  status?: string;
  severity?: string;
  limit?: number;
};

export async function listFindings(query: FindingQuery) {
  return prisma.finding.findMany({
    where: {
      tenantId: query.tenantId,
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.severity ? { severity: query.severity as never } : {})
    },
    include: {
      asset: true,
      remediationActions: {
        include: {
          simulations: { orderBy: { createdAt: "desc" }, take: 1 },
          workflowItems: { orderBy: { createdAt: "desc" }, take: 1 }
        }
      }
    },
    orderBy: [{ businessRiskScore: "desc" }, { riskScore: "desc" }],
    take: query.limit ?? 200
  });
}

export async function assertTenantOwnsFinding(tenantId: string, findingId: string) {
  const finding = await prisma.finding.findFirst({ where: { id: findingId, tenantId }, select: { id: true } });
  if (!finding) throw new Error("Finding not found in tenant boundary");
  return finding;
}
