import { apiHandler, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";
import { startAutomationRun, AutomationInput } from "@/domain/automation";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const runs = await prisma.automationRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 50 });
  return Response.json({ runs });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<AutomationInput>(request);
  const run = await startAutomationRun(tenantId, body);
  return Response.json({ run }, { status: 201 });
});
