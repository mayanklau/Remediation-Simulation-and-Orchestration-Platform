import { EmptyState } from "@/components/EmptyState";
import { GraphCanvas } from "@/components/GraphCanvas";
import { PageHeader } from "@/components/PageHeader";
import { buildAssetGraph } from "@/domain/asset-graph";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export default async function AssetsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const [assets, graph] = await Promise.all([
    prisma.asset.findMany({
      where: { tenantId: tenant.id },
      include: { _count: { select: { findings: true } }, team: true, technicalOwner: true },
      orderBy: { updatedAt: "desc" },
      take: 200
    }),
    buildAssetGraph(tenant.id)
  ]);

  return (
    <>
      <PageHeader eyebrow="Enterprise inventory" title="Assets" description="The asset model links findings to owners, environments, business criticality, exposure, and dependencies." />
      <section className="grid cols-4">
        <div className="panel metric">
          <span>Assets</span>
          <strong>{graph.summary.assetCount}</strong>
        </div>
        <div className="panel metric">
          <span>Relationships</span>
          <strong>{graph.summary.relationshipCount}</strong>
        </div>
        <div className="panel metric">
          <span>Internet Exposed</span>
          <strong>{graph.summary.internetExposedAssets}</strong>
        </div>
        <div className="panel metric">
          <span>Average Maturity</span>
          <strong>{graph.summary.averageMaturity}%</strong>
        </div>
      </section>
      <div style={{ height: 16 }} />
      <GraphCanvas
        title="Asset Inventory Graph"
        description="Graph-library view of the asset inventory with pan, zoom, minimap, exposure filtering, dependency edges, risk-weighted links, and graph JSON export directly inside the asset section."
        mode="asset"
        nodes={graph.libraryGraph.nodes}
        edges={graph.libraryGraph.edges}
      />
      <div style={{ height: 16 }} />
      <div className="panel">
        {assets.length === 0 ? (
          <EmptyState title="No assets yet" description="Assets are created through ingestion or the assets API. No seeded infrastructure is included." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Environment</th>
                <th>Exposure</th>
                <th>Criticality</th>
                <th>Findings</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.name}</td>
                  <td>{asset.type}</td>
                  <td>{asset.environment}</td>
                  <td>{asset.internetExposure ? "Internet exposed" : "Internal"}</td>
                  <td>{asset.criticality}</td>
                  <td>{asset._count.findings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
