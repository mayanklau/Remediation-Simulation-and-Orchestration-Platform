import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { runSimulation, SimulationInput } from "@/domain/simulation";

export const POST = apiHandler(async (request, context) => {
  const tenantId = await resolveTenantId(request);
  const { id } = (context as { params: { id: string } }).params;
  const input = await readJson<SimulationInput>(request).catch(() => ({}));
  const result = await runSimulation(tenantId, id, input);
  return Response.json(result, { status: 201 });
});
