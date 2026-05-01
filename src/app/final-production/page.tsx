import { ApiButton } from "@/components/ApiButton";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildFinalProductionModel } from "@/domain/final-production";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function FinalProductionPage() {
  const tenant = await getOrCreateDefaultTenant();
  const production = await buildFinalProductionModel(tenant.id);

  return (
    <>
      <PageHeader
        eyebrow="Final closure"
        title="Production Completion Center"
        description="Finalize the deployable enterprise envelope: database, identity, secrets, workers, live integrations, policies, evidence, observability, deployment, and security hardening."
      >
        <ApiButton path="/api/final-production" label="Finalize readiness" payload={{ action: "finalize" }} />
      </PageHeader>

      <section className="grid cols-4">
        <div className="panel metric">
          <span>Completion</span>
          <strong>{production.completionScore}%</strong>
        </div>
        <div className="panel metric">
          <span>Status</span>
          <strong>{production.status}</strong>
        </div>
        <div className="panel metric">
          <span>Environment</span>
          <strong>{production.environment.score}%</strong>
        </div>
        <div className="panel metric">
          <span>Audit Events</span>
          <strong>{production.metrics.auditEvents}</strong>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Final 10 Controls</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Control</th>
              <th>Score</th>
              <th>Status</th>
              <th>Environment</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {production.controls.map((control) => (
              <tr key={control.id}>
                <td>
                  <strong>{control.title}</strong>
                </td>
                <td>{control.score}%</td>
                <td>
                  <StatusBadge value={control.status} />
                </td>
                <td>
                  <StatusBadge value={control.envReady ? "ready" : "external_setup"} />
                </td>
                <td>{control.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Production Metrics</h2>
          <table className="table">
            <tbody>
              <tr><td>Enterprise Maturity</td><td>{production.metrics.enterpriseMaturity}%</td></tr>
              <tr><td>Pilot Readiness</td><td>{production.metrics.pilotReadiness}%</td></tr>
              <tr><td>Policies</td><td>{production.metrics.policies}</td></tr>
              <tr><td>Execution Hooks</td><td>{production.metrics.hooks}</td></tr>
              <tr><td>Integrations</td><td>{production.metrics.integrations}</td></tr>
              <tr><td>Automation Runs</td><td>{production.metrics.automationRuns}</td></tr>
              <tr><td>Evidence Artifacts</td><td>{production.metrics.evidenceArtifacts}</td></tr>
              <tr><td>Role Bindings</td><td>{production.metrics.roleBindings}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>External Setup Remaining</h2>
          {production.externalSetupRemaining.length === 0 ? (
            <div className="empty">All required production environment variables are configured.</div>
          ) : (
            <div className="timeline">
              {production.externalSetupRemaining.map((name) => (
                <div className="timeline-item" key={name}>
                  <div>
                    <strong>{name}</strong>
                    <p>Configure in the production secret manager or deployment environment.</p>
                  </div>
                  <StatusBadge value="required" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Deployment Runbook</h2>
          <div className="timeline">
            {production.deploymentRunbook.map((step, index) => (
              <div className="timeline-item" key={step}>
                <div>
                  <strong>Step {index + 1}</strong>
                  <p>{step}</p>
                </div>
                <StatusBadge value="runbook" />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Production Policies</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Policy</th>
                <th>Type</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {production.policies.slice(0, 12).map((policy) => (
                <tr key={policy.name}>
                  <td>{policy.name}</td>
                  <td>{policy.type}</td>
                  <td>
                    <StatusBadge value={policy.mode} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
