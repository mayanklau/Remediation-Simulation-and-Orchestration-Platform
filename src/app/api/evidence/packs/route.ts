import { buildEvidencePack, listEvidencePackReadiness } from "@/domain/evidence-pack";
import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const packs = await listEvidencePackReadiness(tenantId);
  return Response.json({ packs });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ workflowItemId: string }>(request);
  const pack = await buildEvidencePack(tenantId, body.workflowItemId);
  return Response.json({ pack });
});
