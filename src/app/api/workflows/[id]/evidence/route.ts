import { apiHandler, readJson } from "@/lib/api";
import { resolveTenantId } from "@/lib/tenant";
import { attachEvidence, exportEvidencePackage } from "@/domain/evidence";

export const GET = apiHandler(async (request, context) => {
  const tenantId = await resolveTenantId(request);
  const { id } = (context as { params: { id: string } }).params;
  const evidencePackage = await exportEvidencePackage(tenantId, id);
  return Response.json({ evidencePackage });
});

export const POST = apiHandler(async (request, context) => {
  const tenantId = await resolveTenantId(request);
  const { id } = (context as { params: { id: string } }).params;
  const body = await readJson<{
    type: "BEFORE_STATE" | "AFTER_STATE" | "SIMULATION_REPORT" | "APPROVAL_TRAIL" | "EXECUTION_LOG" | "VALIDATION_RESULT" | "AUDIT_EXPORT" | "MANUAL_ATTESTATION";
    title: string;
    content: unknown;
  }>(request);
  const evidence = await attachEvidence({ tenantId, workflowItemId: id, ...body });
  return Response.json({ evidence }, { status: 201 });
});
