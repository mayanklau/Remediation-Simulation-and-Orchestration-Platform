import { buildAttackPathAnalytics, snapshotAttackPathAnalytics } from "@/domain/attack-path-analytics";
import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const attackPaths = await buildAttackPathAnalytics(tenantId);
  return Response.json({ attackPaths });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ action?: "snapshot" }>(request);
  if (body.action && body.action !== "snapshot") {
    return Response.json({ error: "Unsupported attack path action" }, { status: 400 });
  }
  const result = await snapshotAttackPathAnalytics(tenantId);
  return Response.json({ result }, { status: 201 });
});
