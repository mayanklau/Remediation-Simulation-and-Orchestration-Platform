import { buildAgenticModel, runAgenticPlanner, type AgentGoal } from "@/domain/agentic-orchestrator";
import { apiHandler, readJson } from "@/lib/api";
import { type ModelProviderName } from "@/lib/model-providers";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const agentic = await buildAgenticModel(tenantId);
  return Response.json({ agentic });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ goal?: AgentGoal; prompt?: string; provider?: ModelProviderName; dryRun?: boolean }>(request);
  const result = await runAgenticPlanner(tenantId, body);
  const agentic = await buildAgenticModel(tenantId);
  return Response.json({ result, agentic }, { status: 201 });
});
