import { z } from "zod";
import { apiHandler, readJson } from "@/lib/api";
import { badRequest } from "@/lib/errors";
import { resolveTenantId } from "@/lib/tenant";
import { ingestFindings } from "@/domain/ingestion";

const findingSchema = z.object({
  source: z.string().min(1),
  sourceId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  severity: z.string().min(1),
  category: z.string().optional(),
  cve: z.string().optional(),
  controlId: z.string().optional(),
  scannerSeverity: z.string().optional(),
  asset: z
    .object({
      externalId: z.string().optional(),
      name: z.string().min(1),
      type: z.string().optional(),
      environment: z.string().optional(),
      provider: z.string().optional(),
      region: z.string().optional(),
      criticality: z.number().optional(),
      dataSensitivity: z.number().optional(),
      internetExposure: z.boolean().optional(),
      metadata: z.record(z.string(), z.unknown()).optional()
    })
    .optional(),
  exploitAvailable: z.boolean().optional(),
  activeExploitation: z.boolean().optional(),
  patchAvailable: z.boolean().optional(),
  compensatingControls: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<unknown>(request);
  const payload = Array.isArray(body) ? body : (body as { findings?: unknown[] }).findings;
  if (!Array.isArray(payload)) throw badRequest("Expected an array or an object with a findings array");
  const parsed = z.array(findingSchema).safeParse(payload);
  if (!parsed.success) throw badRequest("Invalid finding payload", parsed.error.flatten());
  const result = await ingestFindings(
    tenantId,
    parsed.data.map((item) => ({ ...item, raw: item }))
  );
  return Response.json(result, { status: 202 });
});
