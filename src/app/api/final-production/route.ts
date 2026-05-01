import { buildFinalProductionModel, finalizeProductionReadiness } from "@/domain/final-production";
import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const production = await buildFinalProductionModel(tenantId);
  return Response.json({ production });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ action?: "finalize" }>(request);
  if (body.action && body.action !== "finalize") {
    return Response.json({ error: "Unsupported final production action" }, { status: 400 });
  }
  const result = await finalizeProductionReadiness(tenantId);
  const production = await buildFinalProductionModel(tenantId);
  return Response.json({ result, production }, { status: 201 });
});
