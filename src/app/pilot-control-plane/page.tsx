import { ApiButton } from "@/components/ApiButton";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildPilotControlPlane } from "@/domain/pilot-control-plane";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function PilotControlPlanePage() {
  const tenant = await getOrCreateDefaultTenant();
  const controlPlane = await buildPilotControlPlane(tenant.id);

  return (
    <>
      <PageHeader
        eyebrow="Pilot readiness"
        title="Pilot Control Plane"
        description="Activate all ten production-pilot capabilities: real connectors, simulation, playbooks, policy-as-code, approvals, execution integrations, evidence vault, AI planning, executive dashboards, and SaaS hardening."
      >
        <ApiButton path="/api/pilot-control-plane" label="Activate all 10" payload={{ action: "activate_all_10" }} />
      </PageHeader>

      <section className="grid cols-4">
        <div className="panel metric">
          <span>Readiness</span>
          <strong>{controlPlane.overallReadiness}%</strong>
        </div>
        <div className="panel metric">
          <span>Phase</span>
          <strong>{controlPlane.phase}</strong>
        </div>
        <div className="panel metric">
          <span>Approval Coverage</span>
          <strong>{controlPlane.metrics.approvalCoverage}%</strong>
        </div>
        <div className="panel metric">
          <span>Evidence Coverage</span>
          <strong>{controlPlane.metrics.evidenceCoverage}%</strong>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>All 10 Pilot Capabilities</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Capability</th>
              <th>Score</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {controlPlane.tracks.map((track) => (
              <tr key={track.id}>
                <td>
                  <strong>{track.title}</strong>
                </td>
                <td>{track.score}%</td>
                <td>
                  <StatusBadge value={track.status} />
                </td>
                <td>
                  {track.current} / {track.target}
                </td>
                <td>{track.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Real Scanner Connectors</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Connector</th>
                <th>Category</th>
                <th>Status</th>
                <th>Latest Run</th>
              </tr>
            </thead>
            <tbody>
              {controlPlane.scannerConnectors.map((connector) => (
                <tr key={connector.provider}>
                  <td>{connector.label}</td>
                  <td>{connector.category}</td>
                  <td>
                    <StatusBadge value={connector.status} />
                  </td>
                  <td>
                    <StatusBadge value={connector.latestRun} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>Remediation Playbooks</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Playbook</th>
                <th>Risk</th>
                <th>Mapped</th>
              </tr>
            </thead>
            <tbody>
              {controlPlane.playbooks.map((playbook) => (
                <tr key={playbook.name}>
                  <td>{playbook.name}</td>
                  <td>{playbook.riskClass}</td>
                  <td>{playbook.mappedActions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Policy-as-Code</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Policy</th>
                <th>Type</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {controlPlane.policies.slice(0, 10).map((policy) => (
                <tr key={policy.id}>
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

        <div className="panel">
          <h2>Approval Workbench</h2>
          <div className="timeline">
            {controlPlane.approvalWorkbench.map((item) => (
              <div className="timeline-item" key={item.id}>
                <div>
                  <strong>{item.action}</strong>
                  <p>{item.asset} / {item.approvals.length} approval(s) / {item.evidenceCount} evidence item(s)</p>
                </div>
                <StatusBadge value={item.status} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Execution Integrations</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Operation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {controlPlane.executionIntegrations.map((run) => (
                <tr key={run.id}>
                  <td>{run.provider}</td>
                  <td>{run.operation}</td>
                  <td>
                    <StatusBadge value={run.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>Evidence Vault</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Workflow</th>
                <th>Asset</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {controlPlane.evidenceVault.map((pack) => (
                <tr key={pack.workflowItemId}>
                  <td>{pack.title}</td>
                  <td>{pack.asset}</td>
                  <td>{pack.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Executive Dashboards</h2>
          <table className="table">
            <tbody>
              <tr><td>Configured Connectors</td><td>{controlPlane.metrics.connectorsConfigured}</td></tr>
              <tr><td>Simulation Coverage</td><td>{controlPlane.metrics.simulationCoverage}%</td></tr>
              <tr><td>Automation Runs</td><td>{controlPlane.metrics.automationRuns}</td></tr>
              <tr><td>Campaigns</td><td>{controlPlane.metrics.campaigns}</td></tr>
              <tr><td>Reports</td><td>{controlPlane.metrics.reports}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>Production SaaS Layer</h2>
          <div className="timeline">
            {controlPlane.productionSaasLayer.hardening.map((control) => (
              <div className="timeline-item" key={control.control}>
                <div>
                  <strong>{control.control}</strong>
                  <p>Enterprise hardening control</p>
                </div>
                <StatusBadge value={control.status} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
