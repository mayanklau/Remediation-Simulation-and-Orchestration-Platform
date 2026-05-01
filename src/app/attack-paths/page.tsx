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

