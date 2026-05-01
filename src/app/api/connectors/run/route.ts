import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { connectorRegistry, runConnectorOperation } from "@/domain/connectors";

export const GET = apiHandler(async () => Response.json({ connectors: connectorRegistry }));

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ provider: string; operation: string; payload?: Record<string, unknown> }>(request);
  const run = await runConnectorOperation(tenantId, body.provider, body.operation, body.payload ?? {});
  return Response.json({ run }, { status: 201 });
});
