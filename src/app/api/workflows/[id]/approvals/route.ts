import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { requestApprovals } from "@/domain/workflow";

export const POST = apiHandler(async (request, context) => {
  const tenantId = await resolveTenantId(request);
  const { id } = (context as { params: { id: string } }).params;
  const body = await readJson<{ approverEmails: string[] }>(request);
  const approvals = await requestApprovals(tenantId, id, body.approverEmails);
  return Response.json({ approvals }, { status: 201 });
});
