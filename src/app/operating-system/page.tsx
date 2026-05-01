import { ApiButton } from "@/components/ApiButton";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildOperatingSystemModel } from "@/domain/operating-system";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function OperatingSystemPage() {
  const tenant = await getOrCreateDefaultTenant();
  const model = await buildOperatingSystemModel(tenant.id);

  return (
    <>
      <PageHeader
        eyebrow="Remediation operating system"
        title="Autonomous Control Plane"
        description="A closed-loop view of finding, asset, simulation, policy, approval, execution, evidence, and learning state."
      >
        <ApiButton
          path="/api/operating-system"
          label="Add freeze window"
          payload={{ name: "Quarter-end production change freeze", reason: "Protect business-critical reporting window", scope: "production", freezeWindow: true }}
        />
      </PageHeader>

      <div className="grid cols-4">
        <div className="panel metric">
          <span>Autonomy Readiness</span>
          <strong>{model.autonomyReadiness.score}%</strong>
        </div>
        <div className="panel metric">
          <span>Simulation Coverage</span>
          <strong>{model.northStar.simulationCoverage}%</strong>
        </div>
        <div className="panel metric">
          <span>Closed Loop Coverage</span>
          <strong>{model.northStar.closedLoopCoverage}%</strong>
        </div>
        <div className="panel metric">
          <span>Observed Accuracy</span>
          <strong>{model.simulationLearning.observedAccuracy}%</strong>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h2>Closed Loop</h2>
        <div className="flow-line">{model.northStar.description}</div>
      </div>

      <section className="split" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Priority Remediation Loops</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Finding</th>
                <th>Risk</th>
                <th>Decision</th>
                <th>Next</th>
              </tr>
            </thead>
            <tbody>
              {model.remediationLoops.map((loop) => (
                <tr key={loop.findingId}>
                  <td>
                    <strong>{loop.finding}</strong>
                    <br />
                    <span className="muted">{loop.asset}</span>
                  </td>
                  <td>{loop.businessRisk}</td>
                  <td><StatusBadge value={loop.decision} /></td>
                  <td>{loop.nextStep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>Simulation Learning</h2>
          <table className="table">
            <tbody>
              <tr><td>Simulations</td><td>{model.simulationLearning.simulationCount}</td></tr>
              <tr><td>Completed executions</td><td>{model.simulationLearning.completedExecutionCount}</td></tr>
              <tr><td>Average confidence</td><td>{model.simulationLearning.averageConfidence}%</td></tr>
              <tr><td>Average operational risk</td><td>{model.simulationLearning.averageOperationalRisk}%</td></tr>
            </tbody>
          </table>
          <ul className="detail-list">
            {model.simulationLearning.calibrationSignals.map((signal) => <li key={signal}>{signal}</li>)}
          </ul>
        </div>
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Enterprise Connector Maturity</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Category</th>
                <th>Readiness</th>
              </tr>
            </thead>
            <tbody>
              {model.connectorMaturity.map((connector) => (
                <tr key={connector.provider}>
                  <td>{connector.provider}</td>
                  <td>{connector.category}</td>
                  <td><StatusBadge value={connector.readiness} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>Execution Playbooks</h2>
          <div className="timeline">
            {model.executionPlaybooks.map((playbook) => (
              <div className="timeline-item" key={playbook.name}>
                <div>
                  <strong>{playbook.name}</strong>
                  <p>{playbook.target} / {playbook.gates.join(", ")}</p>
                </div>
                <StatusBadge value={playbook.trigger} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
