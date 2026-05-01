import { buildOperationalTelemetry, emitOperationalSignal } from "@/lib/observability";
import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  return Response.json({ telemetry: await buildOperationalTelemetry(tenantId) });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ level?: "info" | "warn" | "error"; event: string; entityType?: string; entityId?: string; attributes?: Record<string, unknown> }>(request);
  const signal = await emitOperationalSignal({
    tenantId,
    level: body.level ?? "info",
    event: body.event,
    entityType: body.entityType ?? "system",
    entityId: body.entityId ?? tenantId,
    attributes: body.attributes
  });
  return Response.json({ signal }, { status: 201 });
});
