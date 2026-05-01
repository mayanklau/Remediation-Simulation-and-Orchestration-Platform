import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";

export async function attachEvidence(input: {
  tenantId: string;
  workflowItemId: string;
  type: "BEFORE_STATE" | "AFTER_STATE" | "SIMULATION_REPORT" | "APPROVAL_TRAIL" | "EXECUTION_LOG" | "VALIDATION_RESULT" | "AUDIT_EXPORT" | "MANUAL_ATTESTATION";
  title: string;
  content: unknown;
}) {
  return prisma.evidenceArtifact.create({
    data: {
      tenantId: input.tenantId,
      workflowItemId: input.workflowItemId,
      type: input.type,
      title: input.title,
      contentJson: stringifyJson(input.content)
    }
  });
}

export async function exportEvidencePackage(tenantId: string, workflowItemId: string) {
  const workflow = await prisma.workflowItem.findFirstOrThrow({
    where: { tenantId, id: workflowItemId },
    include: {
      remediationAction: { include: { finding: { include: { asset: true } }, simulations: true, plans: true } },
      approvals: true,
      evidenceArtifacts: true
    }
  });

  return {
    exportedAt: new Date().toISOString(),
    workflow: {
      id: workflow.id,
      status: workflow.status,
      priority: workflow.priority,
      dueAt: workflow.dueAt
    },
    finding: workflow.remediationAction.finding,
    remediationAction: workflow.remediationAction,
    approvals: workflow.approvals,
    evidence: workflow.evidenceArtifacts
  };
}
