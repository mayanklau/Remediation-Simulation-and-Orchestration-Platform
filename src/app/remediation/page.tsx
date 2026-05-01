import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ActionButtons } from "@/components/ActionButtons";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export default async function RemediationPage() {
  const tenant = await getOrCreateDefaultTenant();
  const actions = await prisma.remediationAction.findMany({
    where: { tenantId: tenant.id },
    include: {
      finding: { include: { asset: true } },
      simulations: { orderBy: { createdAt: "desc" }, take: 1 },
      plans: { orderBy: { createdAt: "desc" }, take: 1 },
      workflowItems: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { updatedAt: "desc" },
    take: 200
  });

  return (
    <>
      <PageHeader eyebrow="System of action" title="Remediation queue" description="Every canonical finding receives an actionable remediation object that can be simulated, planned, approved, and verified." />
      <div className="grid">
        {actions.length === 0 ? (
          <EmptyState title="No remediation actions yet" description="Actions are generated automatically when real findings are ingested." />
        ) : (
          actions.map((action) => (
            <div className="panel" key={action.id}>
              <div className="page-head" style={{ marginBottom: 8 }}>
                <div>
                  <h2>{action.title}</h2>
                  <p>{action.summary}</p>
                </div>
                <span className="badge">{action.status}</span>
              </div>
              <table className="table">
                <tbody>
                  <tr>
                    <td>Finding</td>
                    <td>{action.finding.title}</td>
                  </tr>
                  <tr>
                    <td>Asset</td>
                    <td>{action.finding.asset?.name ?? "Unmapped"}</td>
                  </tr>
                  <tr>
                    <td>Business risk</td>
                    <td>{Math.round(action.finding.businessRiskScore)}</td>
                  </tr>
                  <tr>
                    <td>Latest simulation</td>
                    <td>{action.simulations[0]?.status ?? "Not run"}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ height: 12 }} />
              <ActionButtons remediationActionId={action.id} />
            </div>
          ))
        )}
      </div>
    </>
  );
}
