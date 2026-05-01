import { apiHandler } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { generateRemediationPlan } from "@/domain/plans";

export const POST = apiHandler(async (request, context) => {
  const tenantId = await resolveTenantId(request);
  const { id } = (context as { params: { id: string } }).params;
  const actor = request.headers.get("x-user-email") ?? "system";
  const result = await generateRemediationPlan(tenantId, id, actor);
  return Response.json(result, { status: 201 });
});
