import { apiHandler } from "@/lib/api";
import { notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request, context) => {
  const tenantId = await resolveTenantId(request);
  const { id } = (context as { params: { id: string } }).params;
  const finding = await prisma.finding.findFirst({
    where: { tenantId, id },
    include: {
      asset: true,
      sourceFindings: true,
      remediationActions: {
        include: {
          simulations: { orderBy: { createdAt: "desc" } },
          plans: { orderBy: { createdAt: "desc" } },
          workflowItems: { include: { approvals: true, evidenceArtifacts: true } }
        }
      }
    }
  });
  if (!finding) throw notFound("Finding");
  return Response.json({ finding });
});
