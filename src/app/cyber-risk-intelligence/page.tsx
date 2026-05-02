import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildCyberRiskIntelligenceModel } from "@/domain/cyber-risk-intelligence";

export default function CyberRiskIntelligencePage() {
  const model = buildCyberRiskIntelligenceModel();
  return (
    <>
      <PageHeader
        eyebrow="Advanced subject matter"
        title="Cyber Risk Intelligence"
        description="Threat-informed prioritization, business-service risk, exploit intelligence, remediation economics, exception governance, control validation, and executive narratives."
      />
      <section className="grid cols-4">
        <div className="metric"><span>Capabilities</span><strong>{model.summary.capabilities}</strong></div>
        <div className="metric"><span>Economics</span><strong>{model.summary.economicsMetrics}</strong></div>
        <div className="metric"><span>Scenarios</span><strong>{model.summary.scenarioPacks}</strong></div>
        <div className="metric"><span>Score</span><strong>{model.summary.intelligenceScore}%</strong></div>
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        {model.capabilities.map((capability) => (
          <div className="panel" key={capability.id}>
            <div className="stack-head">
              <div>
                <h2>{capability.name}</h2>
                <p>{capability.subjectArea}</p>
              </div>
              <StatusBadge value={capability.status} />
            </div>
            <table className="table">
              <tbody>
                <tr><td>Production use</td><td>{capability.productionUse}</td></tr>
                <tr><td>Inputs</td><td>{capability.inputs.join(", ")}</td></tr>
                <tr><td>Outputs</td><td>{capability.outputs.join(", ")}</td></tr>
                <tr><td>Decision</td><td>{capability.decision}</td></tr>
              </tbody>
            </table>
          </div>
        ))}
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        <div className="panel">
          <h2>Adversary Scenario Packs</h2>
          <table className="table">
            <thead><tr><th>Scenario</th><th>Kill Chain</th><th>Controls</th><th>Status</th></tr></thead>
            <tbody>{model.scenarioPacks.map((scenario) => <tr key={scenario.id}><td>{scenario.name}</td><td>{scenario.killChain.join(" -> ")}</td><td>{scenario.controls.join(", ")}</td><td><StatusBadge value={scenario.status} /></td></tr>)}</tbody>
          </table>
        </div>
        <div className="panel">
          <h2>Governance And Decisioning Matrix</h2>
          <table className="table">
            <thead><tr><th>Control</th><th>Scope</th><th>Output</th><th>Status</th></tr></thead>
            <tbody>{model.governanceMatrix.map((row) => <tr key={row.id}><td>{row.name}</td><td>{row.scope}</td><td>{row.output}</td><td><StatusBadge value={row.status} /></td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        <div className="panel">
          <h2>Risk Economics</h2>
          <table className="table">
            <thead><tr><th>Metric</th><th>Formula</th><th>Business Use</th></tr></thead>
            <tbody>{model.economics.map((metric) => <tr key={metric.id}><td>{metric.name}</td><td>{metric.formula}</td><td>{metric.businessUse}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="panel">
          <h2>Executive Narratives</h2>
          <table className="table">
            <thead><tr><th>Narrative</th><th>Audience</th><th>Message</th></tr></thead>
            <tbody>{model.narratives.map((narrative) => <tr key={narrative.id}><td>{narrative.title}</td><td>{narrative.audience}</td><td>{narrative.message}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <div style={{ height: 18 }} />
      <section className="panel">
        <h2>Operating Rules</h2>
        <ul>{model.operatingRules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
      </section>
    </>
  );
}
