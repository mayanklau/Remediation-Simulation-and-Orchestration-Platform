import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { runContinuousSimulation } from "@/domain/governance";

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body: { limit?: number } = await readJson<{ limit?: number }>(request).catch(() => ({}));
  const result = await runContinuousSimulation(tenantId, body.limit ?? 5);
  return Response.json(result, { status: 201 });
});
