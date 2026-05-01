import { buildAssetGraph } from "@/domain/asset-graph";
import { parseJsonObject, stringifyJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

export type AttackPathDifficulty = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export type VulnerabilityChainStep = {
  findingId: string;
  assetId: string;
  assetName: string;
  title: string;
  source: string;
  category: string;
  severity: string;
  technique: string;
  businessRisk: number;
  exploitAvailable: boolean;
  activeExploitation: boolean;
  patchAvailable: boolean;
};

export type AttackPath = {
  id: string;
  name: string;
  entryAsset: string;
  targetAsset: string;
  hops: string[];
  chain: VulnerabilityChainStep[];
  scannerInputs: string[];
  constructionMethod: string;
  difficulty: AttackPathDifficulty;
  difficultyScore: number;
  beforeRemediationRisk: number;
  afterRemediationRisk: number;
  riskDelta: number;
  likelihood: number;
  businessImpact: number;
  recommendedBreakers: string[];
  remediationPriority: "immediate" | "high" | "scheduled" | "monitor";
};

export type AttackGraphNode = {
  id: string;
  label: string;
  kind: "entry" | "asset" | "crown_jewel" | "finding" | "breaker";
  group: string;
  risk: number;
  difficulty?: AttackPathDifficulty;
};

export type AttackGraphEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
  weight: number;
  pathId: string;
  relation: "reachability" | "exploit_precondition" | "breaker";
};

export type VulnerabilityChainGraph = {
  pathId: string;
  pathName: string;
  difficulty: AttackPathDifficulty;
  beforeRemediationRisk: number;
  afterRemediationRisk: number;
  nodes: AttackGraphNode[];
  edges: AttackGraphEdge[];
};

export async function buildAttackPathAnalytics(tenantId: string) {
  const [graph, findings, simulations, policies] = await Promise.all([
    buildAssetGraph(tenantId),
    prisma.finding.findMany({
      where: { tenantId, status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } },
      include: { asset: true, remediationActions: { include: { simulations: { orderBy: { createdAt: "desc" }, take: 1 } } } },
      orderBy: { businessRiskScore: "desc" },
      take: 300
    }),
    prisma.simulation.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 300 }),
    prisma.policy.findMany({ where: { tenantId, enabled: true } })
  ]);

  const findingsByAsset = new Map<string, typeof findings>();
  for (const finding of findings) {
    if (!finding.assetId) continue;
    findingsByAsset.set(finding.assetId, [...(findingsByAsset.get(finding.assetId) ?? []), finding]);
  }

  const adjacency = new Map<string, typeof graph.edges>();
  for (const edge of graph.edges) {
    adjacency.set(edge.fromAssetId, [...(adjacency.get(edge.fromAssetId) ?? []), edge]);
  }

  const exposedStarts = graph.nodes.filter((node) => node.internetExposure || (findingsByAsset.get(node.id) ?? []).some((finding) => isInitialAccess(finding.category, finding.source)));
  const crownJewels = graph.nodes.filter((node) => node.criticality >= 4 || node.dataSensitivity >= 4 || node.environment === "PRODUCTION");
  const rawPaths = [];
  for (const start of exposedStarts) {
    const paths = enumeratePaths(start.id, adjacency, 4);
    for (const path of paths) {
      const target = graph.nodes.find((node) => node.id === path[path.length - 1]);
      if (!target || !crownJewels.some((node) => node.id === target.id)) continue;
      const chain = path.flatMap((assetId) => (findingsByAsset.get(assetId) ?? []).slice(0, 2).map(toChainStep));
      if (chain.length === 0) continue;
      rawPaths.push({ path, chain, start, target });
    }
  }

  const paths: AttackPath[] = rawPaths
    .map((candidate, index) => {
      const before = scoreBeforeRisk(candidate.chain, candidate.path.length, candidate.target.criticality, candidate.target.dataSensitivity);
      const reduction = estimateReduction(candidate.chain, simulations, policies.length);
      const after = clamp(before - reduction, 0, 100);
      const difficultyScore = scoreDifficulty(candidate.chain, candidate.path.length, candidate.start.internetExposure);
      return {
        id: `attack-path-${index + 1}`,
        name: `${candidate.start.name} to ${candidate.target.name}`,
        entryAsset: candidate.start.name,
        targetAsset: candidate.target.name,
        hops: candidate.path.map((assetId) => graph.nodes.find((node) => node.id === assetId)?.name ?? assetId),
        chain: candidate.chain,
        scannerInputs: [...new Set(candidate.chain.map((step) => step.source))],
        constructionMethod: "Scanner-normalized logical attack graph with bounded path enumeration, asset dependency edges, vulnerability preconditions, exploitability signals, and Bayesian-style before/after risk scoring.",
        difficulty: difficultyBand(difficultyScore),
        difficultyScore,
        beforeRemediationRisk: before,
        afterRemediationRisk: after,
        riskDelta: before - after,
        likelihood: clamp(100 - difficultyScore + candidate.chain.filter((step) => step.activeExploitation || step.exploitAvailable).length * 8, 1, 100),
        businessImpact: clamp(candidate.target.criticality * 12 + candidate.target.dataSensitivity * 10 + before * 0.35, 1, 100),
        recommendedBreakers: recommendBreakers(candidate.chain, candidate.start.internetExposure, candidate.target.type),
        remediationPriority: priority(before, after)
      };
    })
    .sort((left, right) => right.beforeRemediationRisk - left.beforeRemediationRisk)
    .slice(0, 25);
  const graphModel = buildAttackGraph(paths);

  return {
    generatedAt: new Date().toISOString(),
    researchBasis: [
      "Logical attack graphs inspired by MulVAL and topological vulnerability analysis.",
      "Path search uses bounded simple-path enumeration over asset dependency and reachability edges.",
      "Risk uses exploitability, exposure, business impact, active exploitation, patch state, and control effectiveness.",
      "Before/after scoring follows Bayesian attack graph intuition: remediation reduces conditional compromise likelihood rather than only lowering single-CVE severity."
    ],
    summary: {
      attackPaths: paths.length,
      criticalPaths: paths.filter((path) => path.beforeRemediationRisk >= 80).length,
      averageBeforeRisk: average(paths.map((path) => path.beforeRemediationRisk)),
      averageAfterRisk: average(paths.map((path) => path.afterRemediationRisk)),
      averageRiskReduction: average(paths.map((path) => path.riskDelta)),
      scannerInputs: [...new Set(paths.flatMap((path) => path.scannerInputs))],
      graphNodes: graphModel.nodes.length,
      graphEdges: graphModel.edges.length,
      vulnerabilityChains: graphModel.vulnerabilityChains.length
    },
    graph: {
      method: "Layered logical attack graph: entry assets, reachable services, exploit preconditions, crown-jewel targets, and policy-backed breaker controls.",
      nodes: graphModel.nodes,
      edges: graphModel.edges
    },
    vulnerabilityChainGraph: graphModel.vulnerabilityChains,
    paths
  };
}

export async function snapshotAttackPathAnalytics(tenantId: string) {
  const analytics = await buildAttackPathAnalytics(tenantId);
  const report = await prisma.reportSnapshot.create({
    data: {
      tenantId,
      name: `Attack path analytics ${new Date().toISOString().slice(0, 10)}`,
      type: "attack_path_analytics",
      createdBy: "attack-path-engine",
      dataJson: stringifyJson(analytics)
    }
  });
  await prisma.auditLog.create({
    data: {
      tenantId,
      actor: "attack-path-engine",
      action: "attack_path_analytics_generated",
      entityType: "report",
      entityId: report.id,
      detailsJson: stringifyJson(analytics.summary)
    }
  });
  return { report, analytics };
}

function enumeratePaths(start: string, adjacency: Map<string, { toAssetId: string }[]>, maxDepth: number) {
  const paths: string[][] = [];
  const walk = (current: string, path: string[]) => {
    if (path.length > 1) paths.push(path);
    if (path.length >= maxDepth) return;
    for (const edge of adjacency.get(current) ?? []) {
      if (path.includes(edge.toAssetId)) continue;
      walk(edge.toAssetId, [...path, edge.toAssetId]);
    }
  };
  walk(start, [start]);
  return paths;
}

function toChainStep(finding: { id: string; assetId: string | null; asset: { name: string } | null; title: string; source: string; category: string; severity: string; businessRiskScore: number; exploitAvailable: boolean; activeExploitation: boolean; patchAvailable: boolean; metadataJson: string }): VulnerabilityChainStep {
  const metadata = parseJsonObject(finding.metadataJson, {});
  return {
    findingId: finding.id,
    assetId: finding.assetId ?? "unmapped",
    assetName: finding.asset?.name ?? "Unmapped",
    title: finding.title,
    source: finding.source,
    category: finding.category,
    severity: finding.severity,
    technique: mapTechnique(finding.category, metadata),
    businessRisk: Math.round(finding.businessRiskScore),
    exploitAvailable: finding.exploitAvailable,
    activeExploitation: finding.activeExploitation,
    patchAvailable: finding.patchAvailable
  };
}

function mapTechnique(category: string, metadata: Record<string, unknown>) {
  if (typeof metadata.attackTechnique === "string") return metadata.attackTechnique;
  if (category.includes("iam")) return "Valid Accounts / Permission Groups Discovery";
  if (category.includes("network")) return "External Remote Services / Network Service Discovery";
  if (category.includes("cloud")) return "Cloud Service Dashboard / Account Discovery";
  if (category.includes("container") || category.includes("kubernetes")) return "Container and Resource Discovery";
  if (category.includes("application")) return "Exploit Public-Facing Application";
  return "Exploit Vulnerability";
}

function isInitialAccess(category: string, source: string) {
  return ["network_policy", "application_security", "cloud_configuration"].includes(category) || ["tenable", "qualys", "wiz", "securityhub", "snyk"].includes(source.toLowerCase());
}

function scoreBeforeRisk(chain: VulnerabilityChainStep[], hopCount: number, criticality: number, sensitivity: number) {
  const chainRisk = chain.reduce((sum, step) => sum + step.businessRisk, 0) / Math.max(1, chain.length);
  const exploit = chain.filter((step) => step.exploitAvailable).length * 7;
  const active = chain.filter((step) => step.activeExploitation).length * 10;
  const target = criticality * 8 + sensitivity * 6;
  const pathLength = Math.max(0, 18 - hopCount * 3);
  return clamp(chainRisk * 0.55 + exploit + active + target + pathLength, 1, 100);
}

function estimateReduction(chain: VulnerabilityChainStep[], simulations: { remediationActionId: string; riskReductionEstimate: number }[], activePolicyCount: number) {
  const patchable = chain.filter((step) => step.patchAvailable).length * 8;
  const virtualPatchable = chain.filter((step) => !step.patchAvailable || step.category.includes("network") || step.category.includes("iam")).length * 6;
  const simulationSignal = Math.min(18, simulations.reduce((sum, simulation) => sum + simulation.riskReductionEstimate, 0) / Math.max(1, simulations.length) * 0.15);
  return clamp(12 + patchable + virtualPatchable + simulationSignal + Math.min(12, activePolicyCount * 2), 5, 85);
}

function scoreDifficulty(chain: VulnerabilityChainStep[], hopCount: number, exposed: boolean) {
  const exploitEase = chain.filter((step) => step.exploitAvailable || step.activeExploitation).length * -8;
  const noPatchEase = chain.filter((step) => !step.patchAvailable).length * -4;
  const hopDifficulty = hopCount * 12;
  const exposureEase = exposed ? -14 : 8;
  const categoryDifficulty = chain.reduce((sum, step) => sum + (step.category.includes("iam") ? 10 : step.category.includes("network") ? 4 : 7), 0) / Math.max(1, chain.length);
  return clamp(55 + hopDifficulty + categoryDifficulty + exploitEase + noPatchEase + exposureEase, 1, 100);
}

function difficultyBand(score: number): AttackPathDifficulty {
  if (score >= 80) return "VERY_HIGH";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

function recommendBreakers(chain: VulnerabilityChainStep[], exposed: boolean, targetType: string) {
  const breakers = new Set<string>();
  if (exposed) breakers.add("Add WAF/API gateway virtual patch at entry point");
  if (chain.some((step) => step.category.includes("iam"))) breakers.add("Add conditional IAM deny and just-in-time approval");
  if (chain.some((step) => step.category.includes("network"))) breakers.add("Apply microsegmentation deny rule between path hops");
  if (targetType.includes("DATABASE")) breakers.add("Restrict database route to approved service identities");
  breakers.add("Run simulation and compare before/after path risk before remediation");
  return [...breakers];
}

function priority(before: number, after: number): AttackPath["remediationPriority"] {
  if (before >= 85 || before - after >= 45) return "immediate";
  if (before >= 70) return "high";
  if (before >= 45) return "scheduled";
  return "monitor";
}

function buildAttackGraph(paths: AttackPath[]) {
  const nodeMap = new Map<string, AttackGraphNode>();
  const edgeMap = new Map<string, AttackGraphEdge>();
  const vulnerabilityChains: VulnerabilityChainGraph[] = [];

  const upsertNode = (node: AttackGraphNode) => {
    const existing = nodeMap.get(node.id);
    nodeMap.set(node.id, existing ? { ...existing, risk: Math.max(existing.risk, node.risk), group: existing.group || node.group } : node);
  };

  for (const path of paths) {
    const hopIds = path.hops.map((hop) => `asset:${slug(hop)}`);
    path.hops.forEach((hop, index) => {
      upsertNode({
        id: hopIds[index],
        label: hop,
        kind: index === 0 ? "entry" : index === path.hops.length - 1 ? "crown_jewel" : "asset",
        group: index === 0 ? "Entry" : index === path.hops.length - 1 ? "Target" : "Transit",
        risk: index === path.hops.length - 1 ? path.beforeRemediationRisk : Math.max(20, path.beforeRemediationRisk - index * 8),
        difficulty: path.difficulty
      });
      if (index > 0) {
        const edgeId = `reach:${path.id}:${index}`;
        edgeMap.set(edgeId, {
          id: edgeId,
          from: hopIds[index - 1],
          to: hopIds[index],
          label: `${path.difficulty} / ${path.beforeRemediationRisk}%`,
          weight: path.beforeRemediationRisk,
          pathId: path.id,
          relation: "reachability"
        });
      }
    });

    const chainNodes: AttackGraphNode[] = path.chain.map((step, index) => ({
      id: `finding:${path.id}:${index}:${slug(step.findingId)}`,
      label: step.title,
      kind: "finding",
      group: step.source,
      risk: step.businessRisk,
      difficulty: path.difficulty
    }));
    const breakerNode: AttackGraphNode = {
      id: `breaker:${path.id}`,
      label: path.recommendedBreakers[0] ?? "Simulation-backed path breaker",
      kind: "breaker",
      group: path.remediationPriority,
      risk: path.riskDelta,
      difficulty: path.difficulty
    };

    chainNodes.forEach(upsertNode);
    upsertNode(breakerNode);

    const chainEdges: AttackGraphEdge[] = [];
    chainNodes.forEach((node, index) => {
      const source = index === 0 ? hopIds[0] : chainNodes[index - 1].id;
      const edge: AttackGraphEdge = {
        id: `chain:${path.id}:${index}`,
        from: source,
        to: node.id,
        label: path.chain[index].technique,
        weight: path.chain[index].businessRisk,
        pathId: path.id,
        relation: "exploit_precondition"
      };
      edgeMap.set(edge.id, edge);
      chainEdges.push(edge);
    });
    if (chainNodes.length > 0) {
      const targetEdge: AttackGraphEdge = {
        id: `chain:${path.id}:target`,
        from: chainNodes[chainNodes.length - 1].id,
        to: hopIds[hopIds.length - 1],
        label: `${path.targetAsset} compromise`,
        weight: path.beforeRemediationRisk,
        pathId: path.id,
        relation: "exploit_precondition"
      };
      const breakerEdge: AttackGraphEdge = {
        id: `breaker:${path.id}:risk-drop`,
        from: breakerNode.id,
        to: hopIds[hopIds.length - 1],
        label: `${path.riskDelta}% risk reduction`,
        weight: path.riskDelta,
        pathId: path.id,
        relation: "breaker"
      };
      edgeMap.set(targetEdge.id, targetEdge);
      edgeMap.set(breakerEdge.id, breakerEdge);
      chainEdges.push(targetEdge, breakerEdge);
    }

    vulnerabilityChains.push({
      pathId: path.id,
      pathName: path.name,
      difficulty: path.difficulty,
      beforeRemediationRisk: path.beforeRemediationRisk,
      afterRemediationRisk: path.afterRemediationRisk,
      nodes: [
        { id: hopIds[0], label: path.entryAsset, kind: "entry", group: "Entry", risk: path.beforeRemediationRisk, difficulty: path.difficulty },
        ...chainNodes,
        { id: hopIds[hopIds.length - 1], label: path.targetAsset, kind: "crown_jewel", group: "Target", risk: path.beforeRemediationRisk, difficulty: path.difficulty },
        breakerNode
      ],
      edges: chainEdges
    });
  }

  return {
    nodes: [...nodeMap.values()].sort((left, right) => right.risk - left.risk).slice(0, 80),
    edges: [...edgeMap.values()].sort((left, right) => right.weight - left.weight).slice(0, 120),
    vulnerabilityChains: vulnerabilityChains.slice(0, 8)
  };
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "node";
}
