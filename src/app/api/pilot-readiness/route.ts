import { buildPilotReadinessModel, createConnectorProfile, startIngestionJob } from "@/domain/pilot-readiness";
import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const pilotReadiness = await buildPilotReadinessModel(tenantId);
  return Response.json({ pilotReadiness });
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{
    action?: "create_connector" | "start_ingestion";
    provider?: string;
    name?: string;
    authMode?: string;
    scopes?: string[];
    owner?: string;
    environment?: string;
    syncCadence?: string;
    source?: string;
    recordsExpected?: number;
    submittedBy?: string;
  }>(request);

  if (body.action === "start_ingestion") {
    const run = await startIngestionJob(tenantId, body);
    return Response.json({ run }, { status: 201 });
  }

  const integration = await createConnectorProfile(tenantId, {
    provider: body.provider ?? "tenable",
    name: body.name,
    authMode: body.authMode,
    scopes: body.scopes,
    owner: body.owner,
    environment: body.environment,
    syncCadence: body.syncCadence
  });
  return Response.json({ integration }, { status: 201 });
});
