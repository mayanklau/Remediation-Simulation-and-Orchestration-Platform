import { apiHandler, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";
import { createExecutionHook } from "@/domain/automation";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const hooks = await prisma.executionHook.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  return Response.json({ hooks });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ name: string; hookType: string; enabled?: boolean; config?: Record<string, unknown> }>(request);
  const hook = await createExecutionHook(tenantId, body);
  return Response.json({ hook }, { status: 201 });
});
