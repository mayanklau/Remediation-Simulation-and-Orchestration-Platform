import type { CSSProperties } from "react";

type Path = {
  id: string;
  name: string;
  entryAsset: string;
  targetAsset: string;
  hops: string[];
  chain: Array<{ title: string; source: string; technique: string; businessRisk: number }>;
  difficulty: string;
  beforeRemediationRisk: number;
  afterRemediationRisk: number;
  riskDelta: number;
  recommendedBreakers: string[];
};

type GraphNodeModel = { id?: string; label: string; kind: string; group: string; risk: number };

export function AttackPathGraphViews({ paths }: { paths: Path[] }) {
  const nodes = buildNodes(paths);
  const edges = buildEdges(paths, nodes);
  const chains = paths.slice(0, 8);

  return (
    <>
      <section className="panel">
        <div className="stack-head">
          <div>
            <h2>Attack Path Graph</h2>
            <p>Graph view of entry assets, reachable services, exploit preconditions, crown-jewel targets, and remediation breakers.</p>
          </div>
          <span className="badge">{nodes.length} nodes / {edges.length} edges</span>
        </div>
        <div style={styles.board}>
          <div style={styles.column}>
            <span style={styles.columnTitle}>Entry</span>
            {nodes.filter((node) => node.kind === "entry").slice(0, 5).map((node) => <GraphNode key={node.id} node={node} />)}
          </div>
          <div style={styles.column}>
            <span style={styles.columnTitle}>Reachability and exploit edges</span>
            {edges.slice(0, 10).map((edge) => (
              <div key={edge.id} style={styles.edge}>
                <strong>{edge.from}</strong>
                <span style={edge.relation === "breaker" ? styles.breakerPill : styles.edgePill}>{edge.label}</span>
                <strong>{edge.to}</strong>
              </div>
            ))}
          </div>
          <div style={styles.column}>
            <span style={styles.columnTitle}>Targets and breakers</span>
            {nodes.filter((node) => node.kind === "target" || node.kind === "breaker").slice(0, 6).map((node) => <GraphNode key={node.id} node={node} />)}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="stack-head">
          <div>
            <h2>Vulnerability Chaining Graph</h2>
            <p>Ordered exploit chain with scanner source, technique, difficulty, before/after risk, and the control that breaks the path.</p>
          </div>
          <span className="badge">{chains.length} chains</span>
        </div>
        <div style={styles.chainGrid}>
          {chains.map((path) => (
            <article key={path.id} style={styles.chainCard}>
              <div style={styles.chainHead}>
                <div>
                  <strong>{path.name}</strong>
                  <div style={styles.muted}>{path.beforeRemediationRisk}% before / {path.afterRemediationRisk}% after / {path.riskDelta}% reduced</div>
                </div>
                <span className="badge">{path.difficulty}</span>
              </div>
              <div style={styles.rail}>
                <GraphNode node={{ id: `${path.id}-entry`, label: path.entryAsset, kind: "entry", group: "Entry", risk: path.beforeRemediationRisk }} compact />
                {path.chain.map((step, index) => (
                  <div key={`${path.id}-${index}`} style={styles.chainStep}>
                    <span style={styles.arrow}>risk transfer</span>
                    <GraphNode node={{ id: `${path.id}-${index}`, label: step.title, kind: "finding", group: `${step.source} | ${step.technique}`, risk: step.businessRisk }} compact />
                  </div>
                ))}
                <div style={styles.chainStep}>
                  <span style={styles.arrow}>target</span>
                  <GraphNode node={{ id: `${path.id}-target`, label: path.targetAsset, kind: "target", group: "Crown jewel", risk: path.beforeRemediationRisk }} compact />
                </div>
                <div style={styles.chainStep}>
                  <span style={styles.arrow}>breaker</span>
                  <GraphNode node={{ id: `${path.id}-breaker`, label: path.recommendedBreakers[0] ?? "Simulation-backed path breaker", kind: "breaker", group: "Control", risk: path.riskDelta }} compact />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function GraphNode({ node, compact = false }: { node: GraphNodeModel; compact?: boolean }) {
  const border = node.kind === "target" ? "#b42318" : node.kind === "finding" ? "#9a6b00" : node.kind === "breaker" ? "#067647" : "#ffe600";
  return (
    <div style={{ ...styles.node, ...(compact ? styles.compactNode : {}), borderLeftColor: border }}>
      <small style={styles.nodeKind}>{node.kind}</small>
      <strong style={styles.nodeLabel}>{node.label}</strong>
      <span style={styles.muted}>{node.group} | {node.risk}%</span>
    </div>
  );
}

function buildNodes(paths: Path[]) {
  const map = new Map<string, { id: string; label: string; kind: string; group: string; risk: number }>();
  const upsert = (node: { id: string; label: string; kind: string; group: string; risk: number }) => {
    const existing = map.get(node.id);
    map.set(node.id, existing ? { ...existing, risk: Math.max(existing.risk, node.risk) } : node);
  };
  for (const path of paths) {
    upsert({ id: `entry:${path.entryAsset}`, label: path.entryAsset, kind: "entry", group: "Initial access", risk: path.beforeRemediationRisk });
    upsert({ id: `target:${path.targetAsset}`, label: path.targetAsset, kind: "target", group: "Crown jewel", risk: path.beforeRemediationRisk });
    upsert({ id: `breaker:${path.id}`, label: path.recommendedBreakers[0] ?? "Simulation-backed path breaker", kind: "breaker", group: "Breaker", risk: path.riskDelta });
    path.chain.slice(0, 2).forEach((step, index) => upsert({ id: `finding:${path.id}:${index}`, label: step.title, kind: "finding", group: step.source, risk: step.businessRisk }));
  }
  return [...map.values()].sort((left, right) => right.risk - left.risk).slice(0, 60);
}

function buildEdges(paths: Path[], nodes: Array<{ id: string; label: string }>) {
  const labelFor = (id: string) => nodes.find((node) => node.id === id)?.label ?? id;
  return paths.flatMap((path) => [
    { id: `${path.id}:reach`, from: labelFor(`entry:${path.entryAsset}`), to: labelFor(`target:${path.targetAsset}`), label: `${path.difficulty} / ${path.beforeRemediationRisk}%`, relation: "reachability" },
    { id: `${path.id}:breaker`, from: labelFor(`breaker:${path.id}`), to: labelFor(`target:${path.targetAsset}`), label: `${path.riskDelta}% risk reduction`, relation: "breaker" }
  ]);
}

const styles: Record<string, CSSProperties> = {
  board: { display: "grid", gridTemplateColumns: "minmax(180px,.8fr) minmax(360px,1.5fr) minmax(220px,1fr)", gap: 14 },
  column: { display: "grid", gap: 10, alignContent: "start", minHeight: 220, border: "1px solid #d9d9cf", borderRadius: 8, padding: 12, background: "#f3f3ea" },
  columnTitle: { color: "#5f6670", fontSize: 12, fontWeight: 700, textTransform: "uppercase" },
  node: { display: "grid", gap: 5, minHeight: 86, border: "1px solid #d9d9cf", borderLeft: "5px solid #ffe600", borderRadius: 8, padding: 10, background: "#fff" },
  compactNode: { minWidth: 190, maxWidth: 240, minHeight: 104 },
  nodeKind: { color: "#5f6670", fontSize: 11, fontWeight: 700, textTransform: "uppercase" },
  nodeLabel: { fontSize: 13, lineHeight: 1.25, overflowWrap: "anywhere" },
  muted: { color: "#5f6670", fontSize: 12 },
  edge: { display: "grid", gridTemplateColumns: "minmax(120px,1fr) auto minmax(120px,1fr)", gap: 10, alignItems: "center", border: "1px solid #d9d9cf", borderRadius: 8, padding: 10, background: "#fff" },
  edgePill: { borderRadius: 999, padding: "5px 10px", background: "#fff7b8", color: "#554900", fontSize: 12, fontWeight: 700, textAlign: "center" },
  breakerPill: { borderRadius: 999, padding: "5px 10px", background: "#ecece4", color: "#2e2e38", fontSize: 12, fontWeight: 700, textAlign: "center" },
  chainGrid: { display: "grid", gap: 14 },
  chainCard: { border: "1px solid #d9d9cf", borderRadius: 8, padding: 14, background: "#fff" },
  chainHead: { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  rail: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 },
  chainStep: { display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" },
  arrow: { borderRadius: 999, padding: "5px 10px", background: "#fff7b8", color: "#554900", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }
};
