import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export default async function WorkflowsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const workflows = await prisma.workflowItem.findMany({
    where: { tenantId: tenant.id },
    include: {
      remediationAction: { include: { finding: { include: { asset: true } } } },
      approvals: true,
      evidenceArtifacts: true
    },
    orderBy: [{ priority: "asc" }, { dueAt: "asc" }],
    take: 200
  });

  return (
    <>
      <PageHeader eyebrow="Governed execution" title="Approvals and workflows" description="Track remediation state, due dates, approval gates, comments, and evidence obligations." />
      <div className="panel">
        {workflows.length === 0 ? (
          <EmptyState title="No workflows yet" description="Open a workflow from a remediation action after simulation and plan generation." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Remediation</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Approvals</th>
                <th>Evidence</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((workflow) => (
                <tr key={workflow.id}>
                  <td>{workflow.remediationAction.title}</td>
                  <td>{workflow.status}</td>
                  <td>{workflow.priority}</td>
                  <td>{workflow.approvals.length}</td>
                  <td>{workflow.evidenceArtifacts.length}</td>
                  <td>{workflow.dueAt?.toDateString() ?? "Not set"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
