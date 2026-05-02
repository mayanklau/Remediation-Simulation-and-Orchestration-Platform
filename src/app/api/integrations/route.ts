import { apiHandler, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";
import { parseJsonObject, stringifyJson } from "@/lib/json";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const [integrations, runs] = await Promise.all([
    prisma.integration.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } }),
    prisma.connectorRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 30 })
  ]);
  return Response.json({
    integrations: integrations.map((integration) => ({
      ...integration,
      config: parseJsonObject(integration.configJson, {}),
      health: parseJsonObject(integration.healthJson, {})
    })),
    runs
  });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{
    provider: string;
    name?: string;
    enabled?: boolean;
    category?: string;
    authMode?: string;
    endpoint?: string;
    owner?: string;
    scopes?: string[] | string;
    syncCadence?: string;
    environment?: string;
    config?: Record<string, unknown>;
  }>(request);
  const provider = normalizeProvider(body.provider);
  const scopes = Array.isArray(body.scopes) ? body.scopes : String(body.scopes ?? "read").split(",").map((scope) => scope.trim()).filter(Boolean);
  const config = {
    category: body.category ?? "custom",
    authMode: body.authMode ?? "manual_secret_reference",
    endpoint: body.endpoint ?? "",
    owner: body.owner ?? "security-operations",
    scopes,
    syncCadence: body.syncCadence ?? "manual",
    environment: body.environment ?? "pilot",
    mode: "manual_connector",
    ...(body.config ?? {})
  };
  const health = {
    status: "profile_created",
    lastCheckedAt: new Date().toISOString(),
    message: "Manual connector profile created. Run a dry-run health check before live execution."
  };
  const existing = await prisma.integration.findFirst({ where: { tenantId, provider } });
  const integration = existing
    ? await prisma.integration.update({
        where: { id: existing.id },
        data: {
          name: body.name ?? `${provider} manual integration`,
          enabled: body.enabled ?? true,
          configJson: stringifyJson(config),
          healthJson: stringifyJson(health)
        }
      })
    : await prisma.integration.create({
        data: {
          tenantId,
          provider,
          name: body.name ?? `${provider} manual integration`,
          enabled: body.enabled ?? true,
          configJson: stringifyJson(config),
          healthJson: stringifyJson(health)
        }
      });
  return Response.json({ integration }, { status: 201 });
});

function normalizeProvider(provider: string) {
  return provider.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "custom";
}
