import { buildAttackPathAnalytics, snapshotAttackPathAnalytics } from "@/domain/attack-path-analytics";
import { apiHandler, readJson } from "@/lib/api";
import { requirePermission } from "@/lib/authz";

export const GET = apiHandler(async (request) => {
  const authz = await requirePermission(request, "finding:read");
  const attackPaths = await buildAttackPathAnalytics(authz.tenantId);
  return Response.json({ attackPaths, correlationId: authz.correlationId });
});

export const POST = apiHandler(async (request) => {
  const authz = await requirePermission(request, "report:read");
  const body = await readJson<{ action?: "snapshot" }>(request);
  if (body.action && body.action !== "snapshot") {
    return Response.json({ error: "Unsupported attack path action" }, { status: 400 });
  }
  const result = await snapshotAttackPathAnalytics(authz.tenantId);
  return Response.json({ result, correlationId: authz.correlationId }, { status: 201 });
});
