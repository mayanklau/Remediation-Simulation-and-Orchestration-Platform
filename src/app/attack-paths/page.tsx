import { ApiButton } from "@/components/ApiButton";
import { GraphCanvas } from "@/components/GraphCanvas";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildAttackPathAnalytics } from "@/domain/attack-path-analytics";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function AttackPathsPage({ searchParams }: { searchParams?: Promise<{ difficulty?: string; nodeKind?: string; zoom?: string }> }) {
  const filters = await searchParams;
  const difficulty = filters?.difficulty ?? "all";
  const nodeKind = filters?.nodeKind ?? "all";
  const zoom = filters?.zoom ?? "comfortable";
  const tenant = await getOrCreateDefaultTenant();
  const analytics = await buildAttackPathAnalytics(tenant.id);
  const filteredPaths = difficulty === "all" ? analytics.paths : analytics.paths.filter((path) => path.difficulty === difficulty);
  const graphNodes = nodeKind === "all" ? analytics.graph.nodes : analytics.graph.nodes.filter((node) => node.kind === nodeKind);
  const graphNodeIds = new Set(graphNodes.map((node) => node.id));
  const graphEdges = analytics.graph.edges.filter((edge) => nodeKind === "all" || graphNodeIds.has(edge.from) || graphNodeIds.has(edge.to));
  const chains = difficulty === "all" ? analytics.vulnerabilityChainGraph : analytics.vulnerabilityChainGraph.filter((chain) => chain.difficulty === difficulty);

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

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="stack-head">
            <div>
              <h2>Scanner Coverage</h2>
              <p>Readiness by scanner family for asset mapping, exploit signals, remediation signals, and graph construction.</p>
            </div>
            <StatusBadge value={`${analytics.subjectMaturity.score}% subject maturity`} />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Family</th>
                <th>Findings</th>
                <th>Mapping</th>
                <th>Exploit</th>
                <th>Remediation</th>
              </tr>
            </thead>
            <tbody>
              {analytics.scannerCoverage.map((coverage) => (
                <tr key={coverage.family}>
                  <td>
                    <strong>{coverage.family}</strong>
                    <div className="muted">{coverage.readyForAttackGraph ? "graph ready" : "needs more mapping"}</div>
                  </td>
                  <td>{coverage.findings}</td>
                  <td>{coverage.assetMappingCoverage}%</td>
                  <td>{coverage.exploitSignalCoverage}%</td>
                  <td>{coverage.remediationSignalCoverage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="stack-head">
            <div>
              <h2>Decision Readiness</h2>
              <p>Customer-facing evidence that separates theoretical vulnerability volume from actionable path risk.</p>
            </div>
            <StatusBadge value={analytics.decisionReadiness.recommendedDecision} />
          </div>
          <table className="table">
            <tbody>
              <tr><td>Customer Ready Paths</td><td>{analytics.decisionReadiness.customerReadyPaths}</td></tr>
              <tr><td>Executive Escalations</td><td>{analytics.decisionReadiness.immediateExecutiveEscalations}</td></tr>
              <tr><td>Average Difficulty</td><td>{analytics.decisionReadiness.averageDifficultyScore}%</td></tr>
              <tr><td>Average Likelihood</td><td>{analytics.decisionReadiness.averageLikelihood}%</td></tr>
              <tr><td>Business Impact</td><td>{analytics.decisionReadiness.averageBusinessImpact}%</td></tr>
              <tr><td>Release Confidence</td><td>{analytics.developmentMaturity.releaseConfidence}%</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="stack-head">
            <div>
              <h2>Graph Algorithms</h2>
              <p>Shortest exploitable paths, k-hop blast radius, centrality, choke points, and crown-jewel exposure.</p>
            </div>
            <StatusBadge value={`${analytics.graphAlgorithms.chokePoints.length} choke points`} />
          </div>
          <table className="table">
            <thead><tr><th>Signal</th><th>Top Result</th><th>Risk</th></tr></thead>
            <tbody>
              <tr>
                <td>Shortest exploitable path</td>
                <td>{analytics.graphAlgorithms.shortestExploitablePaths[0]?.name ?? "No path"}</td>
                <td>{analytics.graphAlgorithms.shortestExploitablePaths[0]?.risk ?? 0}%</td>
              </tr>
              <tr>
                <td>Highest centrality</td>
                <td>{analytics.graphAlgorithms.centrality[0]?.asset ?? "No asset"}</td>
                <td>{analytics.graphAlgorithms.centrality[0]?.score ?? 0}%</td>
              </tr>
              <tr>
                <td>Crown-jewel exposure</td>
                <td>{analytics.graphAlgorithms.crownJewelExposure[0]?.target ?? "No target"}</td>
                <td>{analytics.graphAlgorithms.crownJewelExposure[0]?.beforeRisk ?? 0}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="stack-head">
            <div>
              <h2>Executive View</h2>
              <p>Business services at risk, risk reduced this week, blocked remediations, and attack paths closed.</p>
            </div>
            <StatusBadge value={`${analytics.executiveViews.attackPathsClosed} closed`} />
          </div>
          <table className="table">
            <tbody>
              <tr><td>Risk Reduced This Week</td><td>{analytics.executiveViews.riskReducedThisWeek}%</td></tr>
              <tr><td>Blocked Remediations</td><td>{analytics.executiveViews.blockedRemediations.length}</td></tr>
              <tr><td>Top Service At Risk</td><td>{analytics.executiveViews.topBusinessServicesAtRisk[0]?.service ?? "No service"}</td></tr>
              <tr><td>Leadership Narrative</td><td>{analytics.executiveViews.narrative}</td></tr>
            </tbody>
          </table>
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
        <form className="graph-toolbar">
          <select name="nodeKind" defaultValue={nodeKind}>
            <option value="all">All nodes</option>
            <option value="entry">Entry</option>
            <option value="finding">Findings</option>
            <option value="crown_jewel">Crown jewels</option>
            <option value="breaker">Path breakers</option>
          </select>
          <select name="difficulty" defaultValue={difficulty}>
            <option value="all">All difficulty</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="VERY_HIGH">VERY_HIGH</option>
          </select>
          <select name="zoom" defaultValue={zoom}>
            <option value="compact">Compact</option>
            <option value="comfortable">Comfortable</option>
            <option value="expanded">Expanded</option>
          </select>
          <button type="submit">Apply</button>
          <a className="button-link" href="/api/attack-paths">Export JSON</a>
        </form>
        <GraphCanvas
          title="Interactive Attack Path Graph"
          description="Real graph-library representation of entry points, exploit preconditions, vulnerable findings, crown jewels, and path breaker controls with pan, zoom, minimap, risk filters, and export."
          mode="attack"
          nodes={analytics.graph.libraryGraph.nodes.filter((node) => nodeKind === "all" || node.kind === nodeKind)}
          edges={analytics.graph.libraryGraph.edges.filter((edge) => nodeKind === "all" || graphNodeIds.has(edge.source) || graphNodeIds.has(edge.target))}
        />
        <div className={`attack-graph-board zoom-${zoom}`}>
          <div className="graph-column">
            <span>Entry</span>
            {graphNodes.filter((node) => node.kind === "entry").slice(0, 5).map((node) => <GraphNode key={node.id} node={node} />)}
            {graphNodes.filter((node) => node.kind === "entry").length === 0 && <div className="empty-state">No matching entry nodes.</div>}
          </div>
          <div className="graph-column wide">
            <span>Reachability and exploit edges</span>
            {graphEdges.slice(0, zoom === "expanded" ? 20 : 10).map((edge) => (
              <div className={`graph-link ${edge.relation}`} key={edge.id}>
                <strong>{labelFor(edge.from, analytics.graph.nodes)}</strong>
                <span>{edge.label}</span>
                <strong>{labelFor(edge.to, analytics.graph.nodes)}</strong>
              </div>
            ))}
            {graphEdges.length === 0 && <div className="empty-state">No matching graph edges.</div>}
          </div>
          <div className="graph-column">
            <span>Targets and breakers</span>
            {graphNodes.filter((node) => node.kind === "crown_jewel" || node.kind === "breaker").slice(0, 6).map((node) => <GraphNode key={node.id} node={node} />)}
            {graphNodes.filter((node) => node.kind === "crown_jewel" || node.kind === "breaker").length === 0 && <div className="empty-state">No matching target or breaker nodes.</div>}
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
          {chains.map((chain) => (
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
          {chains.length === 0 && <div className="empty-state">No attack paths match this filter.</div>}
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
              <th>Breaker</th>
              <th>Evidence</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {filteredPaths.map((path) => (
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
                <td>{path.pathBreakerRecommendations[0]?.control ?? path.recommendedBreakers[0]}</td>
                <td>{path.evidenceRequirements.slice(0, 3).join(", ")}</td>
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
