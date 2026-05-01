import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildAssetGraph } from "@/domain/asset-graph";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function AssetGraphPage() {
  const tenant = await getOrCreateDefaultTenant();
  const graph = await buildAssetGraph(tenant.id);

  return (
    <>
      <PageHeader
        eyebrow="Enterprise dependency intelligence"
        title="Asset Graph"
        description="Understand blast radius, risk transfer, internet exposure, business-service concentration, and ownership gaps before approving remediation."
      />

      <div className="grid cols-4">
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
      </div>

      <div className="split" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Dependency Map</h2>
          {graph.edges.length === 0 ? (
            <EmptyState title="No relationships mapped" description="Relationships are created during ingestion and asset enrichment." />
          ) : (
            <div className="graph-list">
              {graph.edges.slice(0, 24).map((edge) => (
                <div className="graph-edge" key={edge.id}>
                  <div>
                    <strong>{edge.fromAssetName}</strong>
                    <span>{edge.relation}</span>
                    <strong>{edge.toAssetName}</strong>
                  </div>
                  <span className="badge">Risk transfer {edge.riskTransfer}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2>Risk Hotspots</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Risk</th>
                <th>Maturity</th>
              </tr>
            </thead>
            <tbody>
              {graph.hotspots.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <strong>{asset.name}</strong>
                    <br />
                    <span className="muted">{asset.environment} / {asset.team}</span>
                  </td>
                  <td>{asset.maxBusinessRisk}</td>
                  <td>{asset.maturityScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h2>Service Concentration</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Owner</th>
              <th>Exposure</th>
              <th>Open Findings</th>
              <th>Concentration</th>
            </tr>
          </thead>
          <tbody>
            {graph.serviceConcentration.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.name}</td>
                <td>{asset.owner}</td>
                <td><StatusBadge value={asset.internetExposure ? "internet exposed" : "internal"} /></td>
                <td>{asset.openFindingCount}</td>
                <td>{asset.concentrationScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
