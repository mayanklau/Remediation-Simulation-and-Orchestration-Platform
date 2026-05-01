import { advanceEnterpriseMaturity, buildEnterpriseMaturityModel } from "@/domain/enterprise-maturity";
import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const maturity = await buildEnterpriseMaturityModel(tenantId);
  return Response.json({ maturity });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ action?: "advance_all" }>(request);
  if (body.action && body.action !== "advance_all") {
    return Response.json({ error: "Unsupported maturity action" }, { status: 400 });
  }
  const result = await advanceEnterpriseMaturity(tenantId);
  const maturity = await buildEnterpriseMaturityModel(tenantId);
  return Response.json({ result, maturity }, { status: 201 });
});
