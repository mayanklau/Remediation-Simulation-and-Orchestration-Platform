import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { addWorkflowComment } from "@/domain/workflow";

export const POST = apiHandler(async (request, context) => {
  const tenantId = await resolveTenantId(request);
  const { id } = (context as { params: { id: string } }).params;
  const body = await readJson<{ author?: string; body: string }>(request);
  const workflow = await addWorkflowComment(tenantId, id, body.author ?? "system", body.body);
  return Response.json({ workflow });
});
