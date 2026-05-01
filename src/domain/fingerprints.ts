import { createHash } from "crypto";

export function findingFingerprint(input: {
  tenantId: string;
  source?: string | null;
  assetExternalId?: string | null;
  assetId?: string | null;
  cve?: string | null;
  controlId?: string | null;
  title: string;
  category?: string | null;
}) {
  const stable = [
    input.tenantId,
    input.source ?? "unknown-source",
    input.assetExternalId ?? input.assetId ?? "unknown-asset",
    input.cve ?? input.controlId ?? input.title.toLowerCase().trim(),
    input.category ?? "general"
  ].join("|");
  return createHash("sha256").update(stable).digest("hex");
}
