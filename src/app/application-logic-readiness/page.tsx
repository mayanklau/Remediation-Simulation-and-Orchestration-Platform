import { buildApplicationLogicReadinessModel } from "@/domain/application-logic-readiness";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

export default function ApplicationLogicReadinessPage() {
  const model = buildApplicationLogicReadinessModel();
  return (
    <>
      <PageHeader
        eyebrow="App logic readiness"
        title="Application Logic Contracts"
        description="Lifecycle state machines, transition gates, invariants, execution blockers, evidence rules, and acceptance criteria that move the platform beyond screen-level readiness."
      />
      <section className="grid cols-4">
        <div className="metric"><span>Lifecycles</span><strong>{model.summary.lifecycles}</strong></div>
        <div className="metric"><span>Transitions</span><strong>{model.summary.transitions}</strong></div>
        <div className="metric"><span>Invariants</span><strong>{model.summary.invariants}</strong></div>
        <div className="metric"><span>Score</span><strong>{model.summary.appLogicScore}%</strong></div>
      </section>
      <div style={{ height: 18 }} />
      <section className="grid cols-2">
        {model.lifecycles.map((item) => (
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
                <tr><td>States</td><td>{item.states.join(" -> ")}</td></tr>
                <tr><td>Terminal</td><td>{item.terminalStates.join(", ")}</td></tr>
                <tr><td>Invariants</td><td>{item.invariants.join("; ")}</td></tr>
              </tbody>
            </table>
          </div>
        ))}
      </section>
      <div style={{ height: 18 }} />
      <section className="panel">
        <h2>Acceptance Criteria</h2>
        <ul>{model.acceptanceCriteria.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
    </>
  );
}
