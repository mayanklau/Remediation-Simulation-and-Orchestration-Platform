import { apiHandler } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { parseCsv } from "@/domain/csv";
import { ingestFindings } from "@/domain/ingestion";

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const text = await request.text();
  const rows = parseCsv(text);
  const findings = rows.map((row, index) => ({
    source: row.source || "csv",
    sourceId: row.source_id || row.id || `csv-row-${index + 1}`,
    title: row.title || row.finding || row.name || "Untitled finding",
    description: row.description || "",
    severity: row.severity || "MEDIUM",
    category: row.category || "general",
    cve: row.cve || undefined,
    controlId: row.control_id || undefined,
    scannerSeverity: row.scanner_severity || undefined,
    exploitAvailable: truthy(row.exploit_available),
    activeExploitation: truthy(row.active_exploitation),
    patchAvailable: truthy(row.patch_available),
    compensatingControls: row.compensating_controls || undefined,
    asset: row.asset_name
      ? {
          externalId: row.asset_external_id || undefined,
          name: row.asset_name,
          type: row.asset_type || "OTHER",
          environment: row.environment || "UNKNOWN",
          provider: row.provider || undefined,
          region: row.region || undefined,
          criticality: numberOrUndefined(row.criticality),
          dataSensitivity: numberOrUndefined(row.data_sensitivity),
          internetExposure: truthy(row.internet_exposure)
        }
      : undefined,
    metadata: row,
    raw: row
  }));
  const result = await ingestFindings(tenantId, findings);
  return Response.json(result, { status: 202 });
});

function truthy(value?: string): boolean {
  return ["true", "yes", "1", "y"].includes((value ?? "").toLowerCase());
}

function numberOrUndefined(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
