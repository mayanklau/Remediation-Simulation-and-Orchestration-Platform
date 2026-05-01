import { buildEvidencePack } from "@/domain/evidence-pack";
import { hashEvidence } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";

export async function sealEvidencePack(tenantId: string, workflowItemId: string) {
  const pack = await buildEvidencePack(tenantId, workflowItemId);
  const previous = await prisma.evidenceArtifact.findFirst({
    where: { tenantId, workflowItemId, type: "AUDIT_EXPORT" },
    orderBy: { createdAt: "desc" }
  });
  const hash = hashEvidence(pack, previous?.contentJson ?? "");
  const storageUrl = process.env.EVIDENCE_STORAGE_URL || "file://./evidence";
  return prisma.evidenceArtifact.create({
    data: {
      tenantId,
      workflowItemId,
      type: "AUDIT_EXPORT",
      title: `Sealed evidence pack ${pack.packId}`,
      contentJson: stringifyJson({
        pack,
        hash,
        previousHash: previous?.contentJson ? hashEvidence(previous.contentJson) : null,
        storageUrl,
        retentionDays: pack.asset?.complianceScope ? 3650 : 2555,
        sealedAt: new Date().toISOString(),
        immutable: true
      })
    }
  });
}

export async function sealOpenEvidencePacks(tenantId: string, limit = 10) {
  const workflows = await prisma.workflowItem.findMany({ where: { tenantId }, take: limit });
  const sealed = [];
  for (const workflow of workflows) {
    sealed.push(await sealEvidencePack(tenantId, workflow.id));
  }
  return { sealed: sealed.length, artifacts: sealed };
}
