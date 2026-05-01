import { apiHandler, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";
import { stringifyJson } from "@/lib/json";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const integrations = await prisma.integration.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  return Response.json({ integrations });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ provider: string; name: string; enabled?: boolean; config?: Record<string, unknown> }>(request);
  const integration = await prisma.integration.create({
    data: {
      tenantId,
      provider: body.provider,
      name: body.name,
      enabled: body.enabled ?? true,
      configJson: stringifyJson(body.config ?? {})
    }
  });
  return Response.json({ integration }, { status: 201 });
});
