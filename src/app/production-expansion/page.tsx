import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildProductionExpansionModel } from "@/domain/production-expansion";

export default function ProductionExpansionPage() {
  const model = buildProductionExpansionModel();
  return (
    <>
      <PageHeader
        eyebrow="Production expansion"
        title="Enterprise Product Completeness"
        description="Production-grade expansion layer for onboarding, connector marketplace, data quality, validation, economics, drift, policy builder, plugin SDK, deployment, security review, executive narratives, demo separation, E2E coverage, and data residency."
      />
      <section className="grid cols-4">
        <div className="metric"><span>Modules</span><strong>{model.summary.modules}</strong></div>
        <div className="metric"><span>Implemented</span><strong>{model.summary.implemented}</strong></div>
        <div className="metric"><span>Ready To Wire</span><strong>{model.summary.readyToWire}</strong></div>
        <div className="metric"><span>Score</span><strong>{model.summary.productionScore}%</strong></div>
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        {model.modules.map((item) => (
          <div className="panel" key={item.id}>
            <div className="stack-head">
              <div>
                <h2>{item.name}</h2>
                <p>{item.purpose}</p>
              </div>
              <StatusBadge value={item.status} />
            </div>
            <table className="table">
              <tbody>
                <tr><td>Owner</td><td>{item.owner}</td></tr>
                <tr><td>APIs</td><td>{item.apiSurface.join(", ")}</td></tr>
                <tr><td>Workflow</td><td>{item.workflow.join(" -> ")}</td></tr>
                <tr><td>Evidence</td><td>{item.evidence.join(", ")}</td></tr>
                <tr><td>Gates</td><td>{item.readinessGates.join(", ")}</td></tr>
              </tbody>
            </table>
          </div>
        ))}
      </section>
    </>
  );
}
