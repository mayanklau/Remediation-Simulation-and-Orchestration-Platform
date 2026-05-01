import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
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

  return (
    <>
      <PageHeader eyebrow="Audit readiness" title="Evidence" description="Evidence artifacts preserve before state, simulation reports, approvals, execution logs, validation, and audit exports." />
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
