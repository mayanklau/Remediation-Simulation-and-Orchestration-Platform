import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildEnterpriseReadinessCatalogModel } from "@/domain/enterprise-readiness-catalog";

export default function EnterpriseReadinessPage() {
  const model = buildEnterpriseReadinessCatalogModel();
  return (
    <>
      <PageHeader
        eyebrow="Once-and-for-all controls"
        title="Enterprise Readiness Catalog"
        description="Complete enterprise control map across identity, tenancy, secrets, connectors, analytics, remediation, AI governance, evidence, operations, deployment, and commercial packaging."
      />
      <section className="grid cols-4">
        <div className="metric"><span>Categories</span><strong>{model.summary.categories}</strong></div>
        <div className="metric"><span>Controls</span><strong>{model.summary.controls}</strong></div>
        <div className="metric"><span>Implemented</span><strong>{model.summary.implemented}</strong></div>
        <div className="metric"><span>Readiness</span><strong>{model.summary.readinessScore}%</strong></div>
      </section>
      <div style={{ height: 18 }} />
      <section className="panel">
        <h2>Final Bar</h2>
        <div className="pill-row">
          {model.summary.finalBar.map((item) => <StatusBadge key={item} value={item} />)}
        </div>
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        {model.categories.map((category) => (
          <div className="panel" key={category.id}>
            <div className="stack-head">
              <div>
                <h2>{category.name}</h2>
                <p>{category.owner}</p>
              </div>
              <span className="badge">{category.controls.length} controls</span>
            </div>
            <table className="table">
              <thead><tr><th>Control</th><th>Status</th><th>Evidence</th></tr></thead>
              <tbody>
                {category.controls.map((control) => (
                  <tr key={control.id}>
                    <td>{control.name}</td>
                    <td><StatusBadge value={control.status} /></td>
                    <td>{control.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>
    </>
  );
}
