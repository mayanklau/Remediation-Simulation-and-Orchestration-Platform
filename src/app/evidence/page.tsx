import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { listEvidencePackReadiness } from "@/domain/evidence-pack";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export default async function EvidencePage() {
  const tenant = await getOrCreateDefaultTenant();
  const evidence = await prisma.evidenceArtifact.findMany({
    where: { tenantId: tenant.id },
    include: { workflowItem: { include: { remediationAction: true } } },
    orderBy: { createdAt: "desc" },
    take: 200
  });
  const packs = await listEvidencePackReadiness(tenant.id);

  return (
    <>
      <PageHeader eyebrow="Audit readiness" title="Evidence" description="Evidence artifacts preserve before state, simulation reports, approvals, execution logs, validation, and audit exports." />
      <div className="panel" style={{ marginBottom: 16 }}>
        <h2>Evidence Pack Readiness</h2>
        {packs.length === 0 ? (
          <EmptyState title="No workflow packages yet" description="Create remediation workflows to assemble export-ready evidence packs." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Workflow</th>
                <th>Asset</th>
                <th>Status</th>
                <th>Readiness</th>
                <th>Checklist</th>
              </tr>
            </thead>
            <tbody>
              {packs.map((pack) => (
                <tr key={pack.workflowItemId}>
                  <td>
                    <strong>{pack.title}</strong>
                    <br />
                    <span className="muted">{pack.finding}</span>
                  </td>
                  <td>{pack.asset}</td>
                  <td><StatusBadge value={pack.status} /></td>
                  <td>{pack.score}%</td>
                  <td>
                    {Object.entries(pack.checks)
                      .filter(([, complete]) => complete)
                      .map(([name]) => name)
                      .join(", ") || "none"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="panel">
        {evidence.length === 0 ? (
          <EmptyState title="No evidence captured yet" description="Evidence is attached through workflow evidence APIs and exported as an audit package." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Workflow</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((artifact) => (
                <tr key={artifact.id}>
                  <td>{artifact.title}</td>
                  <td>{artifact.type}</td>
                  <td>{artifact.workflowItem.remediationAction.title}</td>
                  <td>{artifact.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
