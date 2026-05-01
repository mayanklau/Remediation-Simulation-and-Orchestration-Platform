import { ApiButton } from "@/components/ApiButton";
import { JsonBlock } from "@/components/JsonBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildAgenticModel } from "@/domain/agentic-orchestrator";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function AgenticPage() {
  const tenant = await getOrCreateDefaultTenant();
  const agentic = await buildAgenticModel(tenant.id);

  return (
    <>
      <PageHeader
        eyebrow="Model-agnostic autonomy"
        title="Agentic Orchestrator"
        description="Plan remediation with any LLM, SLM, local model, or deterministic fallback while keeping execution governed, tenant scoped, and dry-run by default."
      >
        <ApiButton path="/api/agentic" label="Run agent plan" payload={{ goal: "virtual_patch", prompt: "Plan safest next actions with virtual patching and path breakers.", dryRun: true }} />
      </PageHeader>

      <section className="grid cols-4">
        <div className="panel metric">
          <span>Readiness</span>
          <strong>{agentic.readinessScore}%</strong>
        </div>
        <div className="panel metric">
          <span>Status</span>
          <strong>{agentic.status}</strong>
        </div>
        <div className="panel metric">
          <span>Tools</span>
          <strong>{agentic.toolRegistry.length}</strong>
        </div>
        <div className="panel metric">
          <span>Agent Runs</span>
          <strong>{agentic.recentAgentRuns.length}</strong>
        </div>
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Model Providers</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Model</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {agentic.providers.map((provider) => (
                <tr key={provider.provider}>
                  <td>{provider.provider}</td>
                  <td>{provider.model}</td>
                  <td><StatusBadge value={provider.configured ? "configured" : "fallback"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>Safety Rails</h2>
          <div className="timeline">
            {agentic.safetyRails.map((rail) => (
              <div className="timeline-item" key={rail}>
                <div><strong>{rail}</strong></div>
                <StatusBadge value="enforced" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Agent Tool Registry</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Tool</th>
              <th>Mode</th>
              <th>Risk</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {agentic.toolRegistry.map((tool) => (
              <tr key={tool.name}>
                <td>{tool.name}</td>
                <td><StatusBadge value={tool.mode} /></td>
                <td>{tool.risk}</td>
                <td>{tool.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Recent Agent Plans</h2>
        {agentic.recentAgentRuns.length === 0 ? <p>No agent plans have been generated yet.</p> : agentic.recentAgentRuns.map((run) => <JsonBlock key={run.id} value={JSON.stringify(run.data)} />)}
      </section>
    </>
  );
}
