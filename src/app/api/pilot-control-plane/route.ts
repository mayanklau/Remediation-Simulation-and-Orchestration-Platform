import { activatePilotControlPlane, buildPilotControlPlane } from "@/domain/pilot-control-plane";
import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const controlPlane = await buildPilotControlPlane(tenantId);
  return Response.json({ controlPlane });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ action?: "activate_all_10" }>(request);
  if (body.action && body.action !== "activate_all_10") {
    return Response.json({ error: "Unsupported pilot control plane action" }, { status: 400 });
  }
  const result = await activatePilotControlPlane(tenantId);
  const controlPlane = await buildPilotControlPlane(tenantId);
  return Response.json({ result, controlPlane }, { status: 201 });
});
