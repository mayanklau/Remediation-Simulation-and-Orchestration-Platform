import { apiHandler } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { ingestMockEnterprise } from "@/domain/mock-ingestion";

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const result = await ingestMockEnterprise(tenantId);
  return Response.json(result, { status: 202 });
});
