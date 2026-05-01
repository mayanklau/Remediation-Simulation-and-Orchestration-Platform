import { apiHandler } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const actions = await prisma.remediationAction.findMany({
    where: { tenantId },
    include: {
      finding: { include: { asset: true } },
      simulations: { orderBy: { createdAt: "desc" }, take: 1 },
      plans: { orderBy: { createdAt: "desc" }, take: 1 },
      workflowItems: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { updatedAt: "desc" },
    take: 200
  });
  return Response.json({ actions });
});
