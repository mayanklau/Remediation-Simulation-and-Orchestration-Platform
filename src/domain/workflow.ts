import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { parseJsonArray, stringifyJson } from "@/lib/json";

export async function openWorkflowItem(tenantId: string, remediationActionId: string) {
  const action = await prisma.remediationAction.findFirstOrThrow({
    where: { id: remediationActionId, tenantId },
    include: { finding: true }
  });
  const existing = await prisma.workflowItem.findFirst({ where: { tenantId, remediationActionId } });
  if (existing) return existing;
  const priority = action.finding.riskScore >= 85 ? 1 : action.finding.riskScore >= 65 ? 2 : 3;
  const item = await prisma.workflowItem.create({
    data: {
      tenantId,
      remediationActionId,
      status: "AWAITING_APPROVAL",
      priority,
      dueAt: action.finding.dueAt ?? addDays(new Date(), 30)
    }
  });
  await prisma.remediationAction.update({ where: { id: remediationActionId }, data: { status: "AWAITING_APPROVAL" } });
  return item;
}

export async function addWorkflowComment(tenantId: string, workflowItemId: string, author: string, body: string) {
  const item = await prisma.workflowItem.findFirstOrThrow({ where: { tenantId, id: workflowItemId } });
  const comments = parseJsonArray<{ author: string; body: string; at: string }>(item.commentsJson);
  comments.push({ author, body, at: new Date().toISOString() });
  return prisma.workflowItem.update({
    where: { id: workflowItemId },
    data: { commentsJson: stringifyJson(comments) }
  });
}

export async function requestApprovals(tenantId: string, workflowItemId: string, approverEmails: string[]) {
  const item = await prisma.workflowItem.findFirstOrThrow({ where: { tenantId, id: workflowItemId } });
  const approvals = [];
  for (const approverEmail of approverEmails) {
    approvals.push(
      await prisma.approval.create({
        data: {
          tenantId,
          workflowItemId: item.id,
          approverEmail
        }
      })
    );
  }
  return approvals;
}

export async function decideApproval(tenantId: string, approvalId: string, decision: "APPROVED" | "REJECTED", reason?: string) {
  const approval = await prisma.approval.findFirstOrThrow({ where: { tenantId, id: approvalId } });
  const updated = await prisma.approval.update({
    where: { id: approval.id },
    data: {
      status: decision,
      decisionReason: reason,
      decidedAt: new Date()
    }
  });
  const approvals = await prisma.approval.findMany({ where: { tenantId, workflowItemId: approval.workflowItemId } });
  if (approvals.length > 0 && approvals.every((item) => item.status === "APPROVED")) {
    const workflow = await prisma.workflowItem.update({
      where: { id: approval.workflowItemId },
      data: { status: "APPROVED" }
    });
    await prisma.remediationAction.update({ where: { id: workflow.remediationActionId }, data: { status: "APPROVED" } });
  }
  if (decision === "REJECTED") {
    const workflow = await prisma.workflowItem.update({
      where: { id: approval.workflowItemId },
      data: { status: "REOPENED" }
    });
    await prisma.remediationAction.update({ where: { id: workflow.remediationActionId }, data: { status: "REOPENED" } });
  }
  return updated;
}
