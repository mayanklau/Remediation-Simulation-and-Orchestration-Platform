import { prisma } from "@/lib/prisma";
import { parseJsonObject } from "@/lib/json";

export async function buildEvidencePack(tenantId: string, workflowItemId: string) {
  const workflow = await prisma.workflowItem.findFirstOrThrow({
    where: { tenantId, id: workflowItemId },
    include: {
      approvals: { orderBy: { createdAt: "asc" } },
      evidenceArtifacts: { orderBy: { createdAt: "asc" } },
      remediationAction: {
        include: {
          finding: { include: { asset: true } },
          simulations: { orderBy: { createdAt: "desc" }, take: 3 },
          plans: { orderBy: { createdAt: "desc" }, take: 2 }
        }
      }
    }
  });

  const latestSimulation = workflow.remediationAction.simulations[0];
  const latestPlan = workflow.remediationAction.plans[0];
  const approvalsComplete = workflow.approvals.length > 0 && workflow.approvals.every((approval) => approval.status === "APPROVED");
  const hasSimulation = Boolean(latestSimulation);
  const hasPlan = Boolean(latestPlan);
  const hasValidation = workflow.evidenceArtifacts.some((artifact) => artifact.type === "VALIDATION_RESULT");

  return {
    packId: `evidence-pack-${workflow.id}`,
    generatedAt: new Date().toISOString(),
    readiness: {
      score: Math.round([hasSimulation, hasPlan, approvalsComplete, hasValidation].filter(Boolean).length * 25),
      hasSimulation,
      hasPlan,
      approvalsComplete,
      hasValidation
    },
    workflow: {
      id: workflow.id,
      status: workflow.status,
      priority: workflow.priority,
      dueAt: workflow.dueAt,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt
    },
    asset: workflow.remediationAction.finding.asset,
    finding: workflow.remediationAction.finding,
    remediationAction: {
      id: workflow.remediationAction.id,
      title: workflow.remediationAction.title,
      actionType: workflow.remediationAction.actionType,
      status: workflow.remediationAction.status,
      proposedChange: parseJsonObject(workflow.remediationAction.proposedChangeJson, {})
    },
    latestSimulation: latestSimulation
      ? {
          id: latestSimulation.id,
          type: latestSimulation.type,
          confidence: latestSimulation.confidence,
          riskReductionEstimate: latestSimulation.riskReductionEstimate,
          operationalRisk: latestSimulation.operationalRisk,
          result: parseJsonObject(latestSimulation.resultJson, {})
        }
      : null,
    latestPlan: latestPlan
      ? {
          id: latestPlan.id,
          title: latestPlan.title,
          summary: latestPlan.summary,
          plan: parseJsonObject(latestPlan.planJson, {})
        }
      : null,
    approvals: workflow.approvals,
    evidenceArtifacts: workflow.evidenceArtifacts.map((artifact) => ({
      ...artifact,
      content: parseJsonObject(artifact.contentJson, {})
    })),
    auditChecklist: [
      { label: "Before state captured", complete: workflow.evidenceArtifacts.some((artifact) => artifact.type === "BEFORE_STATE") },
      { label: "Simulation report attached", complete: hasSimulation || workflow.evidenceArtifacts.some((artifact) => artifact.type === "SIMULATION_REPORT") },
      { label: "Approval trail complete", complete: approvalsComplete },
      { label: "Execution log attached", complete: workflow.evidenceArtifacts.some((artifact) => artifact.type === "EXECUTION_LOG") },
      { label: "Validation result attached", complete: hasValidation }
    ]
  };
}

export async function listEvidencePackReadiness(tenantId: string) {
  const workflows = await prisma.workflowItem.findMany({
    where: { tenantId },
    include: {
      approvals: true,
      evidenceArtifacts: true,
      remediationAction: { include: { finding: { include: { asset: true } }, simulations: { take: 1 }, plans: { take: 1 } } }
    },
    orderBy: { updatedAt: "desc" },
    take: 100
  });

  return workflows.map((workflow) => {
    const checks = {
      simulation: workflow.remediationAction.simulations.length > 0,
      plan: workflow.remediationAction.plans.length > 0,
      approval: workflow.approvals.length > 0 && workflow.approvals.every((approval) => approval.status === "APPROVED"),
      evidence: workflow.evidenceArtifacts.length > 0,
      validation: workflow.evidenceArtifacts.some((artifact) => artifact.type === "VALIDATION_RESULT")
    };
    const score = Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100);
    return {
      workflowItemId: workflow.id,
      remediationActionId: workflow.remediationActionId,
      title: workflow.remediationAction.title,
      finding: workflow.remediationAction.finding.title,
      asset: workflow.remediationAction.finding.asset?.name ?? "Unmapped",
      status: workflow.status,
      score,
      checks
    };
  });
}
