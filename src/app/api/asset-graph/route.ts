import { buildAssetGraph } from "@/domain/asset-graph";
import { apiHandler } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const graph = await buildAssetGraph(tenantId);
  return Response.json({ graph });
});
