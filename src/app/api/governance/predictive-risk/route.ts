import { apiHandler } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { buildPredictiveRiskModel } from "@/domain/governance";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const predictions = await buildPredictiveRiskModel(tenantId);
  return Response.json({ predictions });
});
