import { apiHandler } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { getFindingList } from "@/services/finding-service";

export const GET = apiHandler(async (request) => {
  const authz = await requirePermission(request, "finding:read");
  const { searchParams } = new URL(request.url);
  const findings = await getFindingList({
    tenantId: authz.tenantId,
    status: searchParams.get("status") ?? undefined,
    severity: searchParams.get("severity") ?? undefined
  });
  return Response.json({ findings, correlationId: authz.correlationId });
});
