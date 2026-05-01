import { apiHandler } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { openWorkflowItem } from "@/domain/workflow";

export const POST = apiHandler(async (request, context) => {
  const tenantId = await resolveTenantId(request);
  const { id } = (context as { params: { id: string } }).params;
  const workflow = await openWorkflowItem(tenantId, id);
  return Response.json({ workflow }, { status: 201 });
});
