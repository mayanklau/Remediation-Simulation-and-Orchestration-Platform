import { ApiButton } from "@/components/ApiButton";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildAttackPathAnalytics } from "@/domain/attack-path-analytics";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function AttackPathsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const analytics = await buildAttackPathAnalytics(tenant.id);

  return (
    <>
      <PageHeader
        eyebrow="Vulnerability chaining"
        title="Attack Path Analytics"
        description="Construct scanner-agnostic attack paths, score path difficulty, and show customer-facing before and after remediation risk."
      >
        <ApiButton path="/api/attack-paths" label="Snapshot analytics" payload={{ action: "snapshot" }} />
      </PageHeader>

      <section className="grid cols-4">
        <div className="panel metric"><span>Attack Paths</span><strong>{analytics.summary.attackPaths}</strong></div>
        <div className="panel metric"><span>Critical Paths</span><strong>{analytics.summary.criticalPaths}</strong></div>
        <div className="panel metric"><span>Before Risk</span><strong>{analytics.summary.averageBeforeRisk}%</strong></div>
        <div className="panel metric"><span>After Risk</span><strong>{analytics.summary.averageAfterRisk}%</strong></div>
      </section>

      <section className="panel">
        <h2>Construction Method</h2>
        <div className="timeline">
          {analytics.researchBasis.map((item) => (
            <div className="timeline-item" key={item}>
              <strong>{item}</strong>
              <StatusBadge value="applied" />
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="stack-head">
          <div>
            <h2>Attack Path Graph</h2>
            <p>Layered graph of entry assets, reachable services, exploit preconditions, crown-jewel targets, and breaker controls.</p>
          </div>
          <StatusBadge value={`${analytics.summary.graphNodes} nodes`} />
        </div>
        <div className="attack-graph-board">
          <div className="graph-column">
            <span>Entry</span>
            {analytics.graph.nodes.filter((node) => node.kind === "entry").slice(0, 5).map((node) => <GraphNode key={node.id} node={node} />)}
          </div>
          <div className="graph-column wide">
            <span>Reachability and exploit edges</span>
            {analytics.graph.edges.slice(0, 10).map((edge) => (
              <div className={`graph-link ${edge.relation}`} key={edge.id}>
                <strong>{labelFor(edge.from, analytics.graph.nodes)}</strong>
                <span>{edge.label}</span>
                <strong>{labelFor(edge.to, analytics.graph.nodes)}</strong>
              </div>
            ))}
          </div>
          <div className="graph-column">
            <span>Targets and breakers</span>
            {analytics.graph.nodes.filter((node) => node.kind === "crown_jewel" || node.kind === "breaker").slice(0, 6).map((node) => <GraphNode key={node.id} node={node} />)}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="stack-head">
          <div>
            <h2>Vulnerability Chaining Graph</h2>
            <p>Ordered exploit chain view with scanner source, technique, difficulty, residual risk, and the control that breaks the path.</p>
          </div>
          <StatusBadge value={`${analytics.summary.vulnerabilityChains} chains`} />
        </div>
        <div className="chain-grid">
          {analytics.vulnerabilityChainGraph.map((chain) => (
            <article className="chain-card" key={chain.pathId}>
              <div className="chain-head">
                <div>
                  <strong>{chain.pathName}</strong>
                  <span>{chain.beforeRemediationRisk}% before / {chain.afterRemediationRisk}% after</span>
                </div>
                <StatusBadge value={chain.difficulty} />
              </div>
              <div className="chain-rail">
                {chain.nodes.map((node, index) => (
                  <div className="chain-node-wrap" key={`${chain.pathId}-${node.id}-${index}`}>
                    <GraphNode node={node} compact />
                    {index < chain.nodes.length - 1 && <div className="chain-arrow">risk transfer</div>}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Vulnerability Chains</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Path</th>
              <th>Difficulty</th>
              <th>Before</th>
              <th>After</th>
              <th>Delta</th>
              <th>Scanners</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {analytics.paths.map((path) => (
              <tr key={path.id}>
                <td>
                  <strong>{path.name}</strong>
                  <div>{path.hops.join(" -> ")}</div>
                  <div>{path.chain.map((step) => step.technique).join(" -> ")}</div>
                </td>
                <td><StatusBadge value={path.difficulty} /></td>
                <td>{path.beforeRemediationRisk}%</td>
                <td>{path.afterRemediationRisk}%</td>
                <td>{path.riskDelta}%</td>
                <td>{path.scannerInputs.join(", ")}</td>
                <td><StatusBadge value={path.remediationPriority} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function GraphNode({ node, compact = false }: { node: { label: string; kind: string; group: string; risk: number }; compact?: boolean }) {
  return (
    <div className={`graph-node ${node.kind} ${compact ? "compact" : ""}`}>
      <small>{node.kind.replace("_", " ")}</small>
      <strong>{node.label}</strong>
      <span>{node.group} | {node.risk}%</span>
    </div>
  );
}

function labelFor(id: string, nodes: Array<{ id: string; label: string }>) {
  return nodes.find((node) => node.id === id)?.label ?? id.replace(/^(asset|finding|breaker):/, "");
}
