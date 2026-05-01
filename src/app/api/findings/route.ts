import { apiHandler } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const severity = searchParams.get("severity") ?? undefined;
  const findings = await prisma.finding.findMany({
    where: {
      tenantId,
      ...(status ? { status: status as never } : {}),
      ...(severity ? { severity: severity as never } : {})
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
    take: 200
  });
  return Response.json({ findings });
});
