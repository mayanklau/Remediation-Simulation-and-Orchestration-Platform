import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { decideApproval } from "@/domain/workflow";

export const POST = apiHandler(async (request, context) => {
  const tenantId = await resolveTenantId(request);
  const { id } = (context as { params: { id: string } }).params;
  const body = await readJson<{ decision: "APPROVED" | "REJECTED"; reason?: string }>(request);
  const approval = await decideApproval(tenantId, id, body.decision, body.reason);
  return Response.json({ approval });
});
