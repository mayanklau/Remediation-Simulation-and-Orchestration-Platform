import { prisma } from "@/lib/prisma";
import { parseJsonObject, stringifyJson } from "@/lib/json";
import { connectorRegistry } from "@/domain/connectors";
import { ensureDefaultPolicies } from "@/domain/governance";

const enterpriseConnectors = [
  { provider: "wiz", category: "cloud security", depth: "native", trust: "finding, asset, control, cloud context" },
  { provider: "tenable", category: "vulnerability scanner", depth: "native", trust: "finding, plugin, exploit, SLA context" },
  { provider: "qualys", category: "vulnerability scanner", depth: "native", trust: "finding, host, patch context" },
  { provider: "crowdstrike", category: "endpoint", depth: "planned", trust: "active exploitation and endpoint posture" },
  { provider: "snyk", category: "application security", depth: "native", trust: "dependency, code owner, PR context" },
  { provider: "defender", category: "cloud and endpoint", depth: "planned", trust: "exposure, identity, workload context" },
  { provider: "github", category: "code execution", depth: "native", trust: "PR, branch, workflow, review context" },
  { provider: "servicenow", category: "change management", depth: "native", trust: "change window, CAB, CMDB context" },
  { provider: "jira", category: "work tracking", depth: "native", trust: "issue, status, owner context" },
  { provider: "aws-security-hub", category: "cloud controls", depth: "native", trust: "security control and account context" }
];

export async function buildOperatingSystemModel(tenantId: string) {
  await ensureDefaultPolicies(tenantId);
  const [findings, actions, simulations, automationRuns, connectorRuns, policies, workflows, evidence] = await Promise.all([
    prisma.finding.findMany({
      where: { tenantId, status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } },
      include: { asset: true, remediationActions: { include: { simulations: { orderBy: { createdAt: "desc" }, take: 1 } } } },
      orderBy: [{ businessRiskScore: "desc" }, { riskScore: "desc" }],
      take: 50
    }),
    prisma.remediationAction.findMany({ where: { tenantId }, include: { finding: { include: { asset: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.simulation.findMany({ where: { tenantId }, include: { remediationAction: { include: { finding: { include: { asset: true } } } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.automationRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.connectorRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.policy.findMany({ where: { tenantId }, orderBy: [{ policyType: "asc" }, { name: "asc" }] }),
    prisma.workflowItem.findMany({ where: { tenantId }, include: { approvals: true }, orderBy: { updatedAt: "desc" }, take: 100 }),
    prisma.evidenceArtifact.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 100 })
  ]);

  const actionIdsWithRuns = new Set(automationRuns.map((run) => run.remediationActionId).filter(Boolean));
  const closedLoopCount = actions.filter((action) => actionIdsWithRuns.has(action.id)).length;
  const simulatedActionCount = actions.filter((action) => simulations.some((simulation) => simulation.remediationActionId === action.id)).length;
  const approvedWorkflowCount = workflows.filter((workflow) => workflow.approvals.length > 0 && workflow.approvals.every((approval) => approval.status === "APPROVED")).length;
  const evidenceBackedWorkflowCount = new Set(evidence.map((artifact) => artifact.workflowItemId)).size;

  const remediationLoops = findings.slice(0, 10).map((finding) => {
    const action = finding.remediationActions[0];
    const simulation = action?.simulations[0];
    const requiresHuman = !simulation || simulation.operationalRisk >= 55 || finding.businessRiskScore >= 75 || finding.asset?.environment === "PRODUCTION";
    return {
      findingId: finding.id,
      finding: finding.title,
      asset: finding.asset?.name ?? "Unmapped",
      businessRisk: Math.round(finding.businessRiskScore),
      action: action?.title ?? "No generated action",
      simulationConfidence: simulation ? Math.round(simulation.confidence) : null,
      operationalRisk: simulation ? Math.round(simulation.operationalRisk) : null,
      decision: requiresHuman ? "human_approval" : "policy_auto_approval_candidate",
      nextStep: simulation ? (requiresHuman ? "route to policy-aware approval" : "dry-run execution hook") : "run simulation"
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    northStar: {
      description: "Finding -> Asset -> Business Service -> Simulation -> Policy -> Approval -> Execution -> Evidence -> Learning",
      closedLoopCoverage: percent(closedLoopCount, Math.max(actions.length, 1)),
      simulationCoverage: percent(simulatedActionCount, Math.max(actions.length, 1)),
      approvalCoverage: percent(approvedWorkflowCount, Math.max(workflows.length, 1)),
      evidenceCoverage: percent(evidenceBackedWorkflowCount, Math.max(workflows.length, 1))
    },
    remediationLoops,
    connectorMaturity: buildConnectorMaturity(connectorRuns),
    governance: buildGovernanceModel(policies),
    executionPlaybooks: buildExecutionPlaybooks(actions.length),
    simulationLearning: buildSimulationLearning(simulations, automationRuns),
    autonomyReadiness: buildAutonomyReadiness({
      actions: actions.length,
      simulations: simulations.length,
      automationRuns: automationRuns.length,
      policies: policies.length,
      workflows: workflows.length,
      evidence: evidence.length
    })
  };
}

export async function createGovernanceException(
  tenantId: string,
  input: { name: string; reason: string; expiresAt?: string; scope?: string; riskAcceptedBy?: string; freezeWindow?: boolean }
) {
  const policyType = input.freezeWindow ? "change_freeze" : "risk_exception";
  return prisma.policy.upsert({
    where: { tenantId_name: { tenantId, name: input.name } },
    update: {
      policyType,
      enabled: true,
      enforcementMode: input.freezeWindow ? "enforced" : "advisory",
      rulesJson: stringifyJson({
        reason: input.reason,
        scope: input.scope ?? "tenant",
        expiresAt: input.expiresAt ?? null,
        riskAcceptedBy: input.riskAcceptedBy ?? "security-lead"
      })
    },
    create: {
      tenantId,
      name: input.name,
      policyType,
      enabled: true,
      enforcementMode: input.freezeWindow ? "enforced" : "advisory",
      rulesJson: stringifyJson({
        reason: input.reason,
        scope: input.scope ?? "tenant",
        expiresAt: input.expiresAt ?? null,
        riskAcceptedBy: input.riskAcceptedBy ?? "security-lead"
      })
    }
  });
}

function buildConnectorMaturity(connectorRuns: Awaited<ReturnType<typeof prisma.connectorRun.findMany>>) {
  const lastRunByProvider = new Map(connectorRuns.map((run) => [run.provider, run]));
  return enterpriseConnectors.map((connector) => {
    const registry = connectorRegistry.find((item) => item.provider === connector.provider);
    const run = lastRunByProvider.get(connector.provider);
    return {
      ...connector,
      operations: registry?.operations ?? [],
      phase: registry?.phase ?? 5,
      configured: Boolean(run),
      lastStatus: run?.status ?? "not_connected",
      readiness: run?.status === "COMPLETED" ? "operational" : connector.depth === "native" ? "ready_to_configure" : "roadmap"
    };
  });
}

function buildGovernanceModel(policies: Awaited<ReturnType<typeof prisma.policy.findMany>>) {
  const activeFreezeWindows = policies
    .filter((policy) => policy.enabled && policy.policyType === "change_freeze")
    .map((policy) => ({ ...policy, rules: parseJsonObject(policy.rulesJson, {}) }));
  const exceptions = policies
    .filter((policy) => policy.enabled && policy.policyType === "risk_exception")
    .map((policy) => ({ ...policy, rules: parseJsonObject(policy.rulesJson, {}) }));
  return {
    activeFreezeWindows,
    exceptions,
    controls: [
      "Auto-approve only when simulation confidence and operational risk meet policy.",
      "Route production or high blast-radius work to security, platform owner, and change advisory approval.",
      "Require evidence pack readiness before closure.",
      "Block automation during active change-freeze policies unless exception scope matches."
    ]
  };
}

function buildExecutionPlaybooks(actionCount: number) {
  return [
    { name: "GitHub PR remediation", target: "code", trigger: "simulation approved", gates: ["owner review", "CI pass", "evidence attached"], readyActions: actionCount },
    { name: "Kubernetes progressive rollout", target: "cluster", trigger: "deployment risk below policy", gates: ["server-side dry run", "canary health", "rollback manifest"], readyActions: actionCount },
    { name: "Cloud control remediation", target: "cloud", trigger: "control drift confirmed", gates: ["provider dry run", "least privilege diff", "posture validation"], readyActions: actionCount },
    { name: "IAM least privilege", target: "identity", trigger: "excess permission finding", gates: ["access replay", "deny monitoring", "policy version archive"], readyActions: actionCount }
  ];
}

function buildSimulationLearning(
  simulations: Awaited<ReturnType<typeof prisma.simulation.findMany>>,
  automationRuns: Awaited<ReturnType<typeof prisma.automationRun.findMany>>
) {
  const completedRuns = automationRuns.filter((run) => run.status === "COMPLETED").length;
  const averageConfidence = simulations.length ? Math.round(simulations.reduce((sum, simulation) => sum + simulation.confidence, 0) / simulations.length) : 0;
  const averageOperationalRisk = simulations.length ? Math.round(simulations.reduce((sum, simulation) => sum + simulation.operationalRisk, 0) / simulations.length) : 0;
  const observedAccuracy = simulations.length ? Math.max(40, Math.min(98, Math.round(averageConfidence - averageOperationalRisk * 0.15 + completedRuns * 1.5))) : 0;
  return {
    simulationCount: simulations.length,
    completedExecutionCount: completedRuns,
    averageConfidence,
    averageOperationalRisk,
    observedAccuracy,
    calibrationSignals: [
      "Compare predicted operational risk to dry-run execution result.",
      "Lower confidence when validation evidence is missing after closure.",
      "Raise confidence for action types with repeated successful execution.",
      "Track false-positive scanners and noisy source systems."
    ]
  };
}

function buildAutonomyReadiness(input: { actions: number; simulations: number; automationRuns: number; policies: number; workflows: number; evidence: number }) {
  const score = Math.round(
    percent(input.simulations, Math.max(input.actions, 1)) * 0.28 +
      percent(input.automationRuns, Math.max(input.actions, 1)) * 0.22 +
      Math.min(100, input.policies * 18) * 0.2 +
      percent(input.evidence, Math.max(input.workflows, 1)) * 0.2 +
      Math.min(100, input.actions * 4) * 0.1
  );
  return {
    score,
    level: score >= 75 ? "semi_autonomous_ready" : score >= 45 ? "guided_automation_ready" : "simulation_first",
    blockers: [
      input.simulations === 0 ? "Run simulations for open remediation actions." : null,
      input.policies < 3 ? "Add risk exception, freeze-window, and approval-routing policies." : null,
      input.evidence === 0 ? "Attach validation and execution evidence to workflows." : null,
      input.automationRuns === 0 ? "Run dry-run execution hooks before enabling automation." : null
    ].filter(Boolean)
  };
}

function percent(value: number, total: number) {
  return Math.min(100, Math.round((value / total) * 100));
}
