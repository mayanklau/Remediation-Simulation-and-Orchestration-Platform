import { sealOpenEvidencePacks } from "@/domain/evidence-vault";
import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ limit?: number }>(request);
  const result = await sealOpenEvidencePacks(tenantId, body.limit);
  return Response.json({ result }, { status: 201 });
});
