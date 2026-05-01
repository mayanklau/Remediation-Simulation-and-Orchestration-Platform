import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import { ApiButton } from "@/components/ApiButton";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const tenant = await getOrCreateDefaultTenant();
  const [openFindings, criticalFindings, assets, pendingApprovals, simulations, topFindings, workflowByStatus] = await Promise.all([
    prisma.finding.count({ where: { tenantId: tenant.id, status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } } }),
    prisma.finding.count({ where: { tenantId: tenant.id, severity: "CRITICAL", status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } } }),
    prisma.asset.count({ where: { tenantId: tenant.id } }),
    prisma.approval.count({ where: { tenantId: tenant.id, status: "PENDING" } }),
    prisma.simulation.count({ where: { tenantId: tenant.id } }),
    prisma.finding.findMany({
      where: { tenantId: tenant.id, status: { notIn: ["RESOLVED", "FALSE_POSITIVE"] } },
      include: { asset: true },
      orderBy: [{ businessRiskScore: "desc" }, { riskScore: "desc" }],
      take: 8
    }),
    prisma.workflowItem.groupBy({ by: ["status"], where: { tenantId: tenant.id }, _count: true })
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Enterprise control plane"
        title="Remediation command center"
        description="Prioritize findings, simulate fixes, orchestrate approvals, and preserve audit evidence from live enterprise data."
      >
        <ApiButton path="/api/mock-ingest" label="Load prototype data" />
      </PageHeader>
      <section className="grid cols-4">
        <Metric label="Open findings" value={openFindings} />
        <Metric label="Critical findings" value={criticalFindings} />
        <Metric label="Tracked assets" value={assets} />
        <Metric label="Pending approvals" value={pendingApprovals} />
      </section>
      <div style={{ height: 18 }} />
      <section className="split">
        <div className="panel">
          <h2>Highest Business Risk</h2>
          {topFindings.length === 0 ? (
            <EmptyState title="No findings ingested yet" description="Use the JSON or CSV ingestion API to bring in real scanner, cloud, or compliance findings." />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Finding</th>
                  <th>Asset</th>
                  <th>Severity</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {topFindings.map((finding) => (
                  <tr key={finding.id}>
                    <td>
                      <a href={`/findings/${finding.id}`}>{finding.title}</a>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>{finding.category}</div>
                    </td>
                    <td>{finding.asset?.name ?? "Unmapped"}</td>
                    <td>
                      <SeverityBadge value={finding.severity} />
                    </td>
                    <td>{Math.round(finding.businessRiskScore)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="grid">
          <div className="panel">
            <h2>Workflow Distribution</h2>
            {workflowByStatus.length === 0 ? (
              <p>No workflows opened yet.</p>
            ) : (
              <table className="table">
                <tbody>
                  {workflowByStatus.map((item) => (
                    <tr key={item.status}>
                      <td>{item.status}</td>
                      <td>{item._count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <Metric label="Completed simulations" value={simulations} />
        </div>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel metric">
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </div>
  );
}
