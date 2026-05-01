import { apiHandler, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";
import { buildExecutiveReport } from "@/domain/reporting";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const reports = await prisma.reportSnapshot.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 25 });
  return Response.json({ reports });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body: { createdBy?: string } = await readJson<{ createdBy?: string }>(request).catch(() => ({}));
  const report = await buildExecutiveReport(tenantId, body.createdBy);
  return Response.json({ report }, { status: 201 });
});
