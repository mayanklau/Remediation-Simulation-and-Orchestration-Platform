import { activateVirtualPatchingAndPathBreakers, buildVirtualPatchingModel } from "@/domain/virtual-patching";
import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const virtualPatching = await buildVirtualPatchingModel(tenantId);
  return Response.json({ virtualPatching });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ action?: "activate" }>(request);
  if (body.action && body.action !== "activate") {
    return Response.json({ error: "Unsupported virtual patching action" }, { status: 400 });
  }
  const result = await activateVirtualPatchingAndPathBreakers(tenantId);
  const virtualPatching = await buildVirtualPatchingModel(tenantId);
  return Response.json({ result, virtualPatching }, { status: 201 });
});
