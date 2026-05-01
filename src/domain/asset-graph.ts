import { prisma } from "@/lib/prisma";

export type AssetGraphNode = {
  id: string;
  name: string;
  type: string;
  environment: string;
  owner: string;
  team: string;
  internetExposure: boolean;
  criticality: number;
  dataSensitivity: number;
  findingCount: number;
  openFindingCount: number;
  maxBusinessRisk: number;
  maturityScore: number;
};

export type AssetGraphEdge = {
  id: string;
  fromAssetId: string;
  fromAssetName: string;
  toAssetId: string;
  toAssetName: string;
  relation: string;
  confidence: number;
  source: string;
  riskTransfer: number;
};

export async function buildAssetGraph(tenantId: string) {
  const assets = await prisma.asset.findMany({
    where: { tenantId },
    include: {
      findings: true,
      relationshipsFrom: { include: { toAsset: true } },
      team: true,
      technicalOwner: true
    },
    orderBy: [{ environment: "asc" }, { criticality: "desc" }, { name: "asc" }]
  });

  const nodes: AssetGraphNode[] = assets.map((asset) => {
    const openFindings = asset.findings.filter((finding) => !["RESOLVED", "FALSE_POSITIVE"].includes(finding.status));
    const maxBusinessRisk = Math.max(0, ...openFindings.map((finding) => finding.businessRiskScore));
    const exposurePenalty = asset.internetExposure ? 12 : 0;
    const findingPenalty = Math.min(28, openFindings.length * 4);
    const maturityScore = clamp(100 - maxBusinessRisk * 0.55 - exposurePenalty - findingPenalty + asset.criticality * 2, 0, 100);

    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      environment: asset.environment,
      owner: asset.technicalOwner?.name ?? "Unassigned",
      team: asset.team?.name ?? "Unassigned",
      internetExposure: asset.internetExposure,
      criticality: asset.criticality,
      dataSensitivity: asset.dataSensitivity,
      findingCount: asset.findings.length,
      openFindingCount: openFindings.length,
      maxBusinessRisk: Math.round(maxBusinessRisk),
      maturityScore
    };
  });

  const nodeRisk = new Map(nodes.map((node) => [node.id, node.maxBusinessRisk]));
  const edges: AssetGraphEdge[] = assets.flatMap((asset) =>
    asset.relationshipsFrom.map((relationship) => ({
      id: relationship.id,
      fromAssetId: relationship.fromAssetId,
      fromAssetName: asset.name,
      toAssetId: relationship.toAssetId,
      toAssetName: relationship.toAsset.name,
      relation: relationship.relation,
      confidence: relationship.confidence,
      source: relationship.source,
      riskTransfer: Math.round(((nodeRisk.get(asset.id) ?? 0) + (nodeRisk.get(relationship.toAssetId) ?? 0)) * relationship.confidence * 0.35)
    }))
  );

  const hotspots = [...nodes]
    .sort((left, right) => right.maxBusinessRisk + right.openFindingCount * 3 - (left.maxBusinessRisk + left.openFindingCount * 3))
    .slice(0, 8);

  const environments = nodes.reduce<Record<string, number>>((summary, node) => {
    summary[node.environment] = (summary[node.environment] ?? 0) + 1;
    return summary;
  }, {});

  const serviceConcentration = nodes
    .map((node) => {
      const dependencyCount = edges.filter((edge) => edge.fromAssetId === node.id || edge.toAssetId === node.id).length;
      return { ...node, dependencyCount, concentrationScore: Math.round(node.maxBusinessRisk + dependencyCount * 6 + (node.internetExposure ? 12 : 0)) };
    })
    .sort((left, right) => right.concentrationScore - left.concentrationScore)
    .slice(0, 6);

  return {
    generatedAt: new Date().toISOString(),
    nodes,
    edges,
    hotspots,
    serviceConcentration,
    summary: {
      assetCount: nodes.length,
      relationshipCount: edges.length,
      internetExposedAssets: nodes.filter((node) => node.internetExposure).length,
      productionAssets: nodes.filter((node) => node.environment === "PRODUCTION").length,
      averageMaturity: nodes.length ? Math.round(nodes.reduce((sum, node) => sum + node.maturityScore, 0) / nodes.length) : 0,
      environments
    }
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
