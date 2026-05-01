import { apiHandler } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const workflows = await prisma.workflowItem.findMany({
    where: { tenantId },
    include: {
      remediationAction: { include: { finding: { include: { asset: true } } } },
      approvals: true,
      evidenceArtifacts: true,
      assignee: true
    },
    orderBy: [{ priority: "asc" }, { dueAt: "asc" }],
    take: 200
  });
  return Response.json({ workflows });
});
