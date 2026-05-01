import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SeverityBadge } from "@/components/SeverityBadge";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export default async function FindingsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const findings = await prisma.finding.findMany({
    where: { tenantId: tenant.id },
    include: { asset: true, remediationActions: true },
    orderBy: [{ businessRiskScore: "desc" }, { updatedAt: "desc" }],
    take: 200
  });

  return (
    <>
      <PageHeader eyebrow="Risk intake" title="Findings" description="Normalized findings from scanners, cloud tools, code analysis, compliance checks, and APIs." />
      <div className="panel">
        {findings.length === 0 ? (
          <EmptyState title="No findings yet" description="POST real findings to /api/ingest/json or /api/ingest/csv. The app starts empty by design." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Finding</th>
                <th>Asset</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((finding) => (
                <tr key={finding.id}>
                  <td>
                    <a href={`/findings/${finding.id}`}>{finding.title}</a>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{finding.riskExplanation}</div>
                  </td>
                  <td>{finding.asset?.name ?? "Unmapped"}</td>
                  <td>
                    <SeverityBadge value={finding.severity} />
                  </td>
                  <td>{finding.status}</td>
                  <td>{Math.round(finding.businessRiskScore)}</td>
                  <td>{finding.remediationActions.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
