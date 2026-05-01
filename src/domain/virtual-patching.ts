import { createExecutionHook } from "@/domain/automation";
import { buildAssetGraph } from "@/domain/asset-graph";
import { generateRemediationPlan } from "@/domain/plans";
import { runSimulation } from "@/domain/simulation";
import { parseJsonObject, stringifyJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

export type PathBreakerPath = {
  id: string;
  sourceAssetId: string;
  sourceAssetName: string;
  targetAssetId: string;
  targetAssetName: string;
  hops: string[];
  score: number;
  recommendedBreaker: string;
  breakerType: "network_policy" | "iam_policy" | "virtual_patch" | "segmentation";
};

export function scorePathBreaker(input: {
  sourceExposed: boolean;
  targetCriticality: number;
  targetDataSensitivity: number;
  hopCount: number;
  riskTransfer: number;
}) {
  const exposure = input.sourceExposed ? 24 : 6;
  const criticality = input.targetCriticality * 9;
  const sensitivity = input.targetDataSensitivity * 7;
  const pathLength = Math.max(0, 18 - input.hopCount * 4);
  return clamp(exposure + criticality + sensitivity + pathLength + input.riskTransfer * 0.35, 0, 100);
}

export async function buildVirtualPatchingModel(tenantId: string) {
  const [graph, actions, policies, hooks] = await Promise.all([
    buildAssetGraph(tenantId),
    prisma.remediationAction.findMany({
      where: { tenantId, finding: { status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } } },
      include: { finding: { include: { asset: true } }, simulations: { orderBy: { createdAt: "desc" }, take: 1 }, plans: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: [{ finding: { businessRiskScore: "desc" } }, { updatedAt: "desc" }],
      take: 100
    }),
    prisma.policy.findMany({ where: { tenantId, policyType: { in: ["virtual_patch", "path_breaker"] } } }),
    prisma.executionHook.findMany({ where: { tenantId, hookType: { in: ["virtual_patch", "path_breaker"] } } })
  ]);

  const virtualPatches = actions
    .filter((action) => shouldVirtualPatch(action.finding.category, action.finding.patchAvailable, action.finding.asset?.internetExposure))
    .map((action) => {
      const latestSimulation = action.simulations[0];
      const proposedChange = parseJsonObject(action.proposedChangeJson, {});
      return {
        actionId: action.id,
        findingId: action.findingId,
        title: action.finding.title,
        asset: action.finding.asset?.name ?? "Unmapped",
        category: action.finding.category,
        businessRisk: Math.round(action.finding.businessRiskScore),
        patchAvailable: action.finding.patchAvailable,
        recommendedControl: virtualPatchControl(action.finding.category),
        enforcementPoint: enforcementPoint(action.finding.asset?.type, action.finding.category),
        simulationConfidence: latestSimulation?.confidence ?? 0,
        riskReductionEstimate: latestSimulation?.riskReductionEstimate ?? action.expectedRiskReduction,
        proposedChange
      };
    });

  const pathBreakers = graph.edges
    .map((edge) => {
      const source = graph.nodes.find((node) => node.id === edge.fromAssetId);
      const target = graph.nodes.find((node) => node.id === edge.toAssetId);
      if (!source || !target) return null;
      const score = scorePathBreaker({
        sourceExposed: source.internetExposure,
        targetCriticality: target.criticality,
        targetDataSensitivity: target.dataSensitivity,
        hopCount: 1,
        riskTransfer: edge.riskTransfer
      });
      return {
        id: edge.id,
        sourceAssetId: source.id,
        sourceAssetName: source.name,
        targetAssetId: target.id,
        targetAssetName: target.name,
        hops: [source.name, target.name],
        score,
        recommendedBreaker: breakerRecommendation(edge.relation, target.type),
        breakerType: breakerType(edge.relation, target.type)
      } satisfies PathBreakerPath;
    })
    .filter((path): path is PathBreakerPath => Boolean(path))
    .sort((left, right) => right.score - left.score)
    .slice(0, 20);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      virtualPatchCandidates: virtualPatches.length,
      pathBreakerCandidates: pathBreakers.length,
      activePolicies: policies.filter((policy) => policy.enabled).length,
      executionHooks: hooks.length,
      averageBreakerScore: pathBreakers.length ? Math.round(pathBreakers.reduce((sum, path) => sum + path.score, 0) / pathBreakers.length) : 0
    },
    virtualPatches,
    pathBreakers,
    policies,
    hooks
  };
}

export async function activateVirtualPatchingAndPathBreakers(tenantId: string) {
  const model = await buildVirtualPatchingModel(tenantId);
  const policies = await Promise.all([
    prisma.policy.upsert({
      where: { tenantId_name: { tenantId, name: "Virtual patch before risky production change" } },
      update: {
        enabled: true,
        enforcementMode: "enforced",
        rulesJson: stringifyJson({ requireVirtualPatchForInternetExposed: true, requireSimulationBeforePatch: true, maxOperationalRisk: 45 })
      },
      create: {
        tenantId,
        name: "Virtual patch before risky production change",
        policyType: "virtual_patch",
        enforcementMode: "enforced",
        rulesJson: stringifyJson({ requireVirtualPatchForInternetExposed: true, requireSimulationBeforePatch: true, maxOperationalRisk: 45 })
      }
    }),
    prisma.policy.upsert({
      where: { tenantId_name: { tenantId, name: "Path breaker for crown-jewel reachability" } },
      update: {
        enabled: true,
        enforcementMode: "enforced",
        rulesJson: stringifyJson({ minPathScore: 70, requireSegmentation: true, requireRollback: true })
      },
      create: {
        tenantId,
        name: "Path breaker for crown-jewel reachability",
        policyType: "path_breaker",
        enforcementMode: "enforced",
        rulesJson: stringifyJson({ minPathScore: 70, requireSegmentation: true, requireRollback: true })
      }
    })
  ]);

  const hooks = await Promise.all([
    createExecutionHook(tenantId, {
      name: "Virtual patch deployment hook",
      hookType: "virtual_patch",
      config: { defaultMode: "dry_run", enforcementPoints: ["waf", "api_gateway", "service_mesh", "edr"], requireEvidence: true }
    }),
    createExecutionHook(tenantId, {
      name: "Attack path breaker hook",
      hookType: "path_breaker",
      config: { defaultMode: "dry_run", actions: ["deny_rule", "microsegment", "iam_deny", "route_quarantine"], requireRollback: true }
    })
  ]);

  const simulations = [];
  for (const candidate of model.virtualPatches.slice(0, 5)) {
    simulations.push(await runSimulation(tenantId, candidate.actionId, { rolloutStrategy: "canary", proposedChange: { virtualPatch: candidate.recommendedControl } }));
    await generateRemediationPlan(tenantId, candidate.actionId, "virtual-patching");
  }

  const connectorRuns = [];
  for (const path of model.pathBreakers.slice(0, 5)) {
    connectorRuns.push(
      await prisma.connectorRun.create({
        data: {
          tenantId,
          provider: "path-breaker",
          operation: "dry_run_break_path",
          status: "COMPLETED",
          requestJson: stringifyJson(path),
          resultJson: stringifyJson({
            mode: "dry_run",
            proposedChange: path.recommendedBreaker,
            rollback: `Remove breaker for ${path.sourceAssetName} to ${path.targetAssetName}`,
            evidenceRequired: ["before reachability", "breaker rule", "after reachability", "owner approval"]
          }),
          startedAt: new Date(),
          completedAt: new Date()
        }
      })
    );
  }

  await prisma.auditLog.create({
    data: {
      tenantId,
      actor: "system",
      action: "virtual_patching_path_breakers_activated",
      entityType: "virtual_patching",
      entityId: tenantId,
      detailsJson: stringifyJson({ policies: policies.length, hooks: hooks.length, simulations: simulations.length, connectorRuns: connectorRuns.length })
    }
  });

  return { policies, hooks, simulations, connectorRuns };
}

function shouldVirtualPatch(category: string, patchAvailable: boolean, internetExposed = false) {
  return internetExposed || !patchAvailable || ["network_policy", "cloud_configuration", "container_image", "application_security", "iam_policy"].includes(category);
}

function virtualPatchControl(category: string) {
  if (category === "iam_policy") return "Temporary scoped deny and privilege boundary";
  if (category === "network_policy") return "Compensating deny rule and microsegmentation policy";
  if (category === "cloud_configuration") return "Cloud control guardrail and drift monitor";
  if (category === "container_image") return "Admission-control exception block and runtime detection rule";
  return "WAF/API gateway virtual patch with validation and expiry";
}

function enforcementPoint(assetType = "", category: string) {
  if (category === "iam_policy") return "identity-policy-engine";
  if (assetType.includes("KUBERNETES")) return "admission-controller";
  if (category === "network_policy") return "network-firewall";
  if (category === "cloud_configuration") return "cloud-policy-engine";
  return "waf-or-api-gateway";
}

function breakerRecommendation(relation: string, targetType: string) {
  if (relation.includes("identity") || targetType.includes("IAM")) return "Insert conditional deny and require just-in-time access";
  if (relation.includes("network")) return "Add deny rule between exposed source and high-value target";
  if (targetType.includes("DATABASE")) return "Restrict route to service account and approved subnet only";
  return "Microsegment dependency and require explicit owner-approved flow";
}

function breakerType(relation: string, targetType: string): PathBreakerPath["breakerType"] {
  if (relation.includes("identity") || targetType.includes("IAM")) return "iam_policy";
  if (relation.includes("network")) return "network_policy";
  if (targetType.includes("DATABASE")) return "segmentation";
  return "virtual_patch";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
