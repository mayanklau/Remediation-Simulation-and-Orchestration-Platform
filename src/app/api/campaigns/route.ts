import { apiHandler, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";
import { createOrRefreshCampaign } from "@/domain/campaigns";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const campaigns = await prisma.remediationCampaign.findMany({ where: { tenantId }, orderBy: { updatedAt: "desc" } });
  return Response.json({ campaigns });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ name: string; objective: string; owner?: string; criteria?: Record<string, unknown> }>(request);
  const campaign = await createOrRefreshCampaign(tenantId, body);
  return Response.json({ campaign }, { status: 201 });
});
