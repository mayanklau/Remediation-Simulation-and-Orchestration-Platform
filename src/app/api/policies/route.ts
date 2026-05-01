import { apiHandler, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";
import { resolveTenantId } from "@/lib/tenant";
import { ensureDefaultPolicies } from "@/domain/governance";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  await ensureDefaultPolicies(tenantId);
  const policies = await prisma.policy.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  return Response.json({ policies });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ name: string; policyType: string; enabled?: boolean; rules?: Record<string, unknown>; enforcementMode?: string }>(request);
  const policy = await prisma.policy.upsert({
    where: { tenantId_name: { tenantId, name: body.name } },
    update: {
      policyType: body.policyType,
      enabled: body.enabled ?? true,
      rulesJson: stringifyJson(body.rules ?? {}),
      enforcementMode: body.enforcementMode ?? "advisory"
    },
    create: {
      tenantId,
      name: body.name,
      policyType: body.policyType,
      enabled: body.enabled ?? true,
      rulesJson: stringifyJson(body.rules ?? {}),
      enforcementMode: body.enforcementMode ?? "advisory"
    }
  });
  return Response.json({ policy }, { status: 201 });
});
