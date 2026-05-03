import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildProductionRealityModel } from "@/domain/production-reality";

export default function ProductionRealityPage() {
  const model = buildProductionRealityModel();
  return (
    <>
      <PageHeader
        eyebrow="Below the waterline"
        title="Production Reality Control Plane"
        description="Runtime, networking, storage, queues, observability, release, rollback, and customer-infrastructure gates that separate MVP from production."
      />
      <section className="grid cols-4">
        <div className="metric"><span>Layers</span><strong>{model.summary.layers}</strong></div>
        <div className="metric"><span>Controls</span><strong>{model.summary.controls}</strong></div>
        <div className="metric"><span>Closed</span><strong>{model.summary.belowWaterlineClosed}</strong></div>
        <div className="metric"><span>Reality Score</span><strong>{model.summary.productionRealityScore}%</strong></div>
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        {model.layers.map((layer) => (
          <div className="panel" key={layer.id}>
            <div className="stack-head">
              <div>
                <h2>{layer.name}</h2>
                <p>{layer.purpose}</p>
              </div>
              <StatusBadge value={layer.owner} />
            </div>
            <table className="table">
              <thead><tr><th>Control</th><th>Status</th><th>Evidence</th><th>Gap</th></tr></thead>
              <tbody>
                {layer.controls.map((control) => (
                  <tr key={control.id}>
                    <td>{control.name}</td>
                    <td><StatusBadge value={control.status} /></td>
                    <td>{control.evidence}</td>
                    <td>{control.gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        <div className="panel">
          <h2>Launch Blockers</h2>
          <ul>{model.launchBlockers.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="panel">
          <h2>Next Actions</h2>
          <ol>{model.nextActions.map((item) => <li key={item}>{item}</li>)}</ol>
        </div>
      </section>
    </>
  );
}
