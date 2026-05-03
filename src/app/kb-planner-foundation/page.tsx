import { buildKbPlannerFoundation } from "@/domain/kb-planner-foundation";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

export default function KbPlannerFoundationPage() {
  const foundation = buildKbPlannerFoundation();
  return (
    <>
      <PageHeader
        eyebrow="Knowledge foundation"
        title="KB + Planner Agent Foundation"
        description="Canonical knowledge base, derived indexes, hybrid retrieval facade, deterministic planner shell, manifest-bound agents, provenance, budgets, and human approval gates."
      />
      <section className="grid cols-4">
        <div className="metric"><span>Derived Stores</span><strong>{foundation.summary.derivedStores}</strong></div>
        <div className="metric"><span>Retrieval Modes</span><strong>{foundation.summary.retrievalModes}</strong></div>
        <div className="metric"><span>Planner Stages</span><strong>{foundation.summary.plannerStages}</strong></div>
        <div className="metric"><span>Non-Negotiables</span><strong>{foundation.summary.nonNegotiables}</strong></div>
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        <div className="panel">
          <div className="stack-head">
            <div>
              <h2>Canonical Data Contract</h2>
              <p>{foundation.dataContract.rebuildRule}</p>
            </div>
            <StatusBadge value={foundation.summary.status} />
          </div>
          <table className="table">
            <tbody>
              <tr><td>Canonical store</td><td>{foundation.summary.canonicalStore}</td></tr>
              <tr><td>Foreign key</td><td>{foundation.dataContract.foreignKeyRule}</td></tr>
              <tr><td>Idempotency</td><td>{foundation.dataContract.idempotencyKey.join(" + ")}</td></tr>
              <tr><td>Required fields</td><td>{foundation.dataContract.requiredFields.join(", ")}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2>Retrieval Facade</h2>
          <p>{foundation.retrievalFacade.rule}</p>
          <table className="table">
            <tbody>
              <tr><td>Modes</td><td>{foundation.retrievalFacade.modes.join(", ")}</td></tr>
              <tr><td>Merge key</td><td>{foundation.retrievalFacade.mergeKey}</td></tr>
              <tr><td>Flow</td><td>{foundation.retrievalFacade.flow.join(" -> ")}</td></tr>
              <tr><td>Safeguards</td><td>{foundation.retrievalFacade.safeguards.join(", ")}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        {foundation.stores.map((store) => (
          <div className="panel" key={store.id}>
            <div className="stack-head">
              <div>
                <h2>{store.tool}</h2>
                <p>{store.role}</p>
              </div>
              <StatusBadge value={store.canonical ? "canonical" : "derived"} />
            </div>
            <table className="table">
              <tbody>
                <tr><td>Rebuild source</td><td>{store.rebuildSource}</td></tr>
                <tr><td>Tenant isolation</td><td>{store.tenantIsolation}</td></tr>
              </tbody>
            </table>
          </div>
        ))}
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        <div className="panel">
          <h2>Ingestion Pipeline</h2>
          <ul>{foundation.ingestionPipeline.map((stage) => <li key={stage.id}>{stage.name}: {stage.gates.join(", ")}</li>)}</ul>
        </div>
        <div className="panel">
          <h2>Planner Pipeline</h2>
          <ul>{foundation.plannerPipeline.map((stage) => <li key={stage.id}>{stage.name}: {stage.gates.join(", ")}</li>)}</ul>
        </div>
      </section>
      <div style={{ height: 18 }} />
      <section className="panel">
        <h2>Tool Manifest</h2>
        <table className="table">
          <thead><tr><th>Agent</th><th>Scopes</th><th>KB Dependencies</th><th>Approval</th></tr></thead>
          <tbody>
            {foundation.toolManifest.map((capability) => (
              <tr key={capability.agentId}>
                <td>{capability.agentId}</td>
                <td>{capability.requiredScopes.join(", ")}</td>
                <td>{capability.kbDependencies.join(", ")}</td>
                <td>{capability.requiresApproval ? "yes" : "no"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
