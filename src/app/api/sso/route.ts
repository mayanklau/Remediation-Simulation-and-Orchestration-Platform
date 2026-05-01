import { apiHandler, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";
import { buildSamlServiceProviderMetadata, upsertSsoConfiguration, SsoInput } from "@/domain/sso";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  const configurations = await prisma.ssoConfiguration.findMany({ where: { tenantId }, orderBy: { provider: "asc" } });
  const baseUrl = request.headers.get("origin") ?? "http://localhost:3000";
  return Response.json({ configurations, serviceProvider: buildSamlServiceProviderMetadata(baseUrl, tenant.slug) });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<SsoInput>(request);
  const configuration = await upsertSsoConfiguration(tenantId, body);
  return Response.json({ configuration }, { status: 201 });
});
