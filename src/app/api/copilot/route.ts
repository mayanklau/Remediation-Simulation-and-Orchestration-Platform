import { apiHandler, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/tenant";

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ question: string }>(request);
  const [topFindings, openWorkflows, simulations] = await Promise.all([
    prisma.finding.findMany({ where: { tenantId }, include: { asset: true }, orderBy: { businessRiskScore: "desc" }, take: 5 }),
    prisma.workflowItem.findMany({ where: { tenantId }, include: { remediationAction: { include: { finding: true } } }, orderBy: { dueAt: "asc" }, take: 5 }),
    prisma.simulation.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 5 })
  ]);
  const answer = buildDeterministicCopilotAnswer(body.question, topFindings, openWorkflows, simulations);
  return Response.json({ answer, sources: { topFindings, openWorkflows, simulations } });
});

function buildDeterministicCopilotAnswer(
  question: string,
  topFindings: Array<{ title: string; businessRiskScore: number; asset: { name: string } | null }>,
  openWorkflows: Array<{ status: string; remediationAction: { title: string; finding: { title: string } } }>,
  simulations: Array<{ explanation: string; confidence: number }>
) {
  const normalized = question.toLowerCase();
  if (normalized.includes("fix first") || normalized.includes("priority")) {
    if (topFindings.length === 0) return "No findings have been ingested yet, so there is no prioritized remediation queue.";
    return `Start with ${topFindings[0].title} on ${topFindings[0].asset?.name ?? "an unmapped asset"} because it has the highest current business risk score of ${Math.round(
      topFindings[0].businessRiskScore
    )}.`;
  }
  if (normalized.includes("approval")) {
    return openWorkflows.length === 0
      ? "There are no active workflow approvals yet."
      : `${openWorkflows.length} workflow item(s) are active. The nearest item is ${openWorkflows[0].remediationAction.title} with status ${openWorkflows[0].status}.`;
  }
  if (normalized.includes("simulation")) {
    return simulations.length === 0
      ? "No simulations have been run yet."
      : `The latest simulation reports ${Math.round(simulations[0].confidence)}% confidence. ${simulations[0].explanation}`;
  }
  return "I can answer questions about prioritization, approvals, simulations, risk, and remediation state using tenant-scoped data from the platform.";
}
