import { runWorkerLane, type WorkerLane } from "@/domain/workers";
import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ lane: WorkerLane; limit?: number }>(request);
  const result = await runWorkerLane(tenantId, body.lane ?? "simulation", body.limit);
  return Response.json({ result }, { status: 201 });
});
