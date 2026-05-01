import { ApiButton } from "@/components/ApiButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildVirtualPatchingModel } from "@/domain/virtual-patching";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function VirtualPatchingPage() {
  const tenant = await getOrCreateDefaultTenant();
  const model = await buildVirtualPatchingModel(tenant.id);

  return (
    <>
      <PageHeader
        eyebrow="Compensating controls"
        title="Virtual Patching & Path Breaker"
        description="Deploy temporary compensating controls and break attack paths before touching production systems."
      >
        <ApiButton path="/api/virtual-patching" label="Activate controls" payload={{ action: "activate" }} />
      </PageHeader>

      <section className="grid cols-4">
        <div className="panel metric">
          <span>Patch Candidates</span>
          <strong>{model.summary.virtualPatchCandidates}</strong>
        </div>
        <div className="panel metric">
          <span>Path Breakers</span>
          <strong>{model.summary.pathBreakerCandidates}</strong>
        </div>
        <div className="panel metric">
          <span>Active Policies</span>
          <strong>{model.summary.activePolicies}</strong>
        </div>
        <div className="panel metric">
          <span>Avg Breaker Score</span>
          <strong>{model.summary.averageBreakerScore}</strong>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Virtual Patch Candidates</h2>
        {model.virtualPatches.length === 0 ? (
          <EmptyState title="No virtual patch candidates" description="Candidates appear when findings are internet-exposed, lack patches, or require compensating controls." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Finding</th>
                <th>Asset</th>
                <th>Risk</th>
                <th>Control</th>
                <th>Enforcement</th>
                <th>Simulation</th>
              </tr>
            </thead>
            <tbody>
              {model.virtualPatches.slice(0, 20).map((candidate) => (
                <tr key={candidate.actionId}>
                  <td>{candidate.title}</td>
                  <td>{candidate.asset}</td>
                  <td>{candidate.businessRisk}</td>
                  <td>{candidate.recommendedControl}</td>
                  <td><StatusBadge value={candidate.enforcementPoint} /></td>
                  <td>{candidate.simulationConfidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Attack Path Breakers</h2>
        {model.pathBreakers.length === 0 ? (
          <EmptyState title="No attack paths mapped" description="Path breakers appear when dependency relationships connect exposed assets to high-value targets." />
        ) : (
          <div className="timeline">
            {model.pathBreakers.slice(0, 12).map((path) => (
              <div className="timeline-item" key={path.id}>
                <div>
                  <strong>{path.hops.join(" -> ")}</strong>
                  <p>{path.recommendedBreaker}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <StatusBadge value={path.breakerType} />
                  <span className="badge">Score {path.score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
