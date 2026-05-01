import { ApiButton } from "@/components/ApiButton";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildEnterpriseMaturityModel } from "@/domain/enterprise-maturity";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function EnterpriseMaturityPage() {
  const tenant = await getOrCreateDefaultTenant();
  const model = await buildEnterpriseMaturityModel(tenant.id);

  return (
    <>
      <PageHeader
        eyebrow="Enterprise acceleration"
        title="Maturity Command Center"
        description="Advance the ten enterprise capability areas: connectors, simulation, policy, campaigns, copilot, security, execution, evidence, dashboards, and hardening."
      >
        <ApiButton path="/api/enterprise-maturity" label="Build all 10" payload={{ action: "advance_all" }} />
      </PageHeader>

      <section className="grid cols-4">
        <div className="panel metric">
          <span>Overall Maturity</span>
          <strong>{model.overallScore}%</strong>
        </div>
        <div className="panel metric">
          <span>Phase</span>
          <strong>{model.phase}</strong>
        </div>
        <div className="panel metric">
          <span>Simulation Coverage</span>
          <strong>{model.metrics.simulationCoverage}%</strong>
        </div>
        <div className="panel metric">
          <span>Evidence Coverage</span>
          <strong>{model.metrics.evidenceCoverage}%</strong>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>All 10 Capability Tracks</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Capability</th>
              <th>Score</th>
              <th>Status</th>
              <th>Production Meaning</th>
              <th>Next Step</th>
            </tr>
          </thead>
          <tbody>
            {model.capabilities.map((capability) => (
              <tr key={capability.id}>
                <td>
                  <strong>{capability.title}</strong>
                  <div className="muted">{capability.category}</div>
                </td>
                <td>{capability.score}%</td>
                <td>
                  <StatusBadge value={capability.status} />
                </td>
                <td>{capability.productionMeaning}</td>
                <td>{capability.nextStep}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Connector Framework</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Phase</th>
                <th>Configured</th>
                <th>Run</th>
              </tr>
            </thead>
            <tbody>
              {model.connectorFramework.map((connector) => (
                <tr key={connector.provider}>
                  <td>{connector.provider}</td>
                  <td>{connector.phase}</td>
                  <td>
                    <StatusBadge value={connector.configured ? "configured" : "missing"} />
                  </td>
                  <td>
                    <StatusBadge value={connector.latestRunStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>Policy Engine</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Policy</th>
                <th>Type</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {model.policyEngine.map((policy) => (
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
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Execution Orchestration</h2>
          <div className="timeline">
            {model.executionOrchestration.map((hook) => (
              <div className="timeline-item" key={hook.id}>
                <div>
                  <strong>{hook.name}</strong>
                  <p>{hook.hookType}</p>
                </div>
                <StatusBadge value="dry_run_ready" />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Maturity Dashboards</h2>
          <table className="table">
            <tbody>
              <tr><td>Remediation Debt</td><td>{model.maturityDashboards.debt}</td></tr>
              <tr><td>High Risk Backlog</td><td>{model.maturityDashboards.highRiskBacklog}</td></tr>
              <tr><td>Blocked Workflows</td><td>{model.maturityDashboards.blockedWorkflows}</td></tr>
              <tr><td>Overdue Workflows</td><td>{model.maturityDashboards.overdueWorkflows}</td></tr>
              <tr><td>Scanner Noise Reduction</td><td>{model.maturityDashboards.scannerNoiseReduction}</td></tr>
              <tr><td>Autonomy Eligibility</td><td>{model.maturityDashboards.autonomyEligibility}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid cols-4" style={{ marginTop: 16 }}>
        <div className="panel metric">
          <span>Configured Connectors</span>
          <strong>{model.metrics.connectorsConfigured}</strong>
        </div>
        <div className="panel metric">
          <span>Active Policies</span>
          <strong>{model.metrics.activePolicies}</strong>
        </div>
        <div className="panel metric">
          <span>Execution Hooks</span>
          <strong>{model.metrics.executionHooks}</strong>
        </div>
        <div className="panel metric">
          <span>Reports</span>
          <strong>{model.metrics.reports}</strong>
        </div>
      </section>
    </>
  );
}
