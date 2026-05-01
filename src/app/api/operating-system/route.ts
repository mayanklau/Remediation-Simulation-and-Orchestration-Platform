import { buildOperatingSystemModel, createGovernanceException } from "@/domain/operating-system";
import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const operatingSystem = await buildOperatingSystemModel(tenantId);
  return Response.json({ operatingSystem });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ name: string; reason: string; expiresAt?: string; scope?: string; riskAcceptedBy?: string; freezeWindow?: boolean }>(request);
  const policy = await createGovernanceException(tenantId, body);
  return Response.json({ policy }, { status: 201 });
});
