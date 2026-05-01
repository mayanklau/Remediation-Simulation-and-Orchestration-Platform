import { apiHandler } from "@/lib/api";
import { notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request, context) => {
  const tenantId = await resolveTenantId(request);
  const { id } = (context as { params: { id: string } }).params;
  const asset = await prisma.asset.findFirst({
    where: { id, tenantId },
    include: {
      findings: { orderBy: { riskScore: "desc" }, take: 50 },
      relationshipsFrom: { include: { toAsset: true } },
      relationshipsTo: { include: { fromAsset: true } }
    }
  });
  if (!asset) throw notFound("Asset");
  return Response.json({ asset });
});
