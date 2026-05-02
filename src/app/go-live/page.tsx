import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildGoLiveModel } from "@/domain/go-live";

export default function GoLivePage() {
  const model = buildGoLiveModel();
  return (
    <>
      <PageHeader eyebrow="Launch kit" title="Go-Live Control Center" description="Everything needed after code completion: production values, identity, secrets, connectors, data residency, workers, observability, security review, release, rollback, and customer acceptance." />
      <section className="grid cols-4">
        <div className="metric"><span>Sections</span><strong>{model.summary.sections}</strong></div>
        <div className="metric"><span>Required Items</span><strong>{model.summary.requiredItems}</strong></div>
        <div className="metric"><span>Verifications</span><strong>{model.summary.verificationItems}</strong></div>
        <div className="metric"><span>Mode</span><strong>{model.summary.launchMode}</strong></div>
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        {model.sections.map((section) => (
          <div className="panel" key={section.id}>
            <div className="stack-head">
              <div>
                <h2>{section.title}</h2>
                <p>{section.owner}</p>
              </div>
              <StatusBadge value="go_live_required" />
            </div>
            <table className="table">
              <tbody>
                <tr><td>Required</td><td>{section.required.join(", ")}</td></tr>
                <tr><td>Verify</td><td>{section.verification.join(", ")}</td></tr>
              </tbody>
            </table>
          </div>
        ))}
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        <div className="panel"><h2>Launch Sequence</h2><ol>{model.launchSequence.map((step) => <li key={step}>{step}</li>)}</ol></div>
        <div className="panel"><h2>Rollback Sequence</h2><ol>{model.rollbackSequence.map((step) => <li key={step}>{step}</li>)}</ol></div>
      </section>
    </>
  );
}
