import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { applyPolicyGovernedFix } from "@/domain/governance";

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ remediationActionId: string }>(request);
  const result = await applyPolicyGovernedFix(tenantId, body.remediationActionId);
  return Response.json(result, { status: result.automationRun ? 201 : 200 });
});
