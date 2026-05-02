import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildProductionEffectivenessModel } from "@/domain/production-effectiveness";

export default function ProductionEffectivenessPage() {
  const model = buildProductionEffectivenessModel();
  return (
    <>
      <PageHeader
        eyebrow="Production effectiveness"
        title="Reliability And Validation Control Room"
        description="Queue contracts, data-quality gates, post-remediation validation, evidence sealing, observability signals, and customer go-live boundaries."
      />
      <section className="grid cols-4">
        <div className="metric"><span>Scheduler Lanes</span><strong>{model.summary.schedulerLanes}</strong></div>
        <div className="metric"><span>Data Gates</span><strong>{model.summary.dataQualityControls}</strong></div>
        <div className="metric"><span>Validation Steps</span><strong>{model.summary.validationSteps}</strong></div>
        <div className="metric"><span>Effectiveness</span><strong>{model.summary.effectivenessScore}%</strong></div>
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        <div className="panel">
          <div className="stack-head">
            <div>
              <h2>Queue And Scheduler Lanes</h2>
              <p>Retry, idempotency, dead-letter, and SLA-ready contracts.</p>
            </div>
            <StatusBadge value={model.summary.productionPosture} />
          </div>
          <table className="table">
            <thead><tr><th>Lane</th><th>Trigger</th><th>Idempotency</th><th>Status</th></tr></thead>
            <tbody>
              {model.schedulerLanes.map((lane) => (
                <tr key={lane.id}><td>{lane.name}</td><td>{lane.trigger}</td><td>{lane.idempotencyKey}</td><td><StatusBadge value={lane.status} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <div className="stack-head">
            <div>
              <h2>Data Quality Gates</h2>
              <p>Controls that stop unsafe automation and weak risk narratives.</p>
            </div>
            <StatusBadge value="quality_guarded" />
          </div>
          <table className="table">
            <thead><tr><th>Control</th><th>Fail Action</th><th>Owner</th><th>Status</th></tr></thead>
            <tbody>
              {model.dataQualityControls.map((control) => (
                <tr key={control.id}><td>{control.name}</td><td>{control.failAction}</td><td>{control.owner}</td><td><StatusBadge value={control.status} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        <div className="panel">
          <h2>Post-Remediation Validation Loop</h2>
          <ol>{model.validationLoop.map((step) => <li key={step.id}><strong>{step.name}</strong>: {step.evidence}</li>)}</ol>
        </div>
        <div className="panel">
          <h2>Observability Signals</h2>
          <table className="table">
            <thead><tr><th>Signal</th><th>Metric</th><th>Runbook</th></tr></thead>
            <tbody>
              {model.observabilitySignals.map((signal) => (
                <tr key={signal.id}><td>{signal.name}</td><td>{signal.metric}</td><td>{signal.runbook}</td></tr>
              ))}
            </tbody>
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
