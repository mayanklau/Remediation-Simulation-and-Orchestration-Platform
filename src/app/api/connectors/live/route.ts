import { executeLiveConnector } from "@/domain/live-connectors";
import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ provider: string; operation: string; payload?: Record<string, unknown>; dryRun?: boolean }>(request);
  const run = await executeLiveConnector(tenantId, body);
  return Response.json({ run }, { status: 201 });
});
