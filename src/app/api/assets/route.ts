import { apiHandler, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";
import { stringifyJson } from "@/lib/json";
import { AssetType, Environment } from "@/domain/enums";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const assets = await prisma.asset.findMany({
    where: {
      tenantId,
      ...(query ? { name: { contains: query } } : {})
    },
    include: {
      _count: { select: { findings: true } },
      team: true,
      technicalOwner: true
    },
    orderBy: { updatedAt: "desc" },
    take: 100
  });
  return Response.json({ assets });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{
    externalId?: string;
    name: string;
    type: AssetType;
    environment?: Environment;
    provider?: string;
    region?: string;
    criticality?: number;
    dataSensitivity?: number;
    internetExposure?: boolean;
    metadata?: Record<string, unknown>;
  }>(request);
  const asset = await prisma.asset.create({
    data: {
      tenantId,
      externalId: body.externalId ?? `manual:${body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: body.name,
      type: body.type,
      environment: body.environment ?? "UNKNOWN",
      provider: body.provider,
      region: body.region,
      criticality: body.criticality ?? 3,
      dataSensitivity: body.dataSensitivity ?? 3,
      internetExposure: Boolean(body.internetExposure),
      metadataJson: stringifyJson(body.metadata ?? {})
    }
  });
  return Response.json({ asset }, { status: 201 });
});
