import { ApiButton } from "@/components/ApiButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { createOrRefreshCampaign } from "@/domain/campaigns";
import { buildPilotReadinessModel } from "@/domain/pilot-readiness";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function CampaignBoardPage() {
  const tenant = await getOrCreateDefaultTenant();
  if ((await prisma.remediationCampaign.count({ where: { tenantId: tenant.id } })) === 0) {
    await createOrRefreshCampaign(tenant.id, {
      name: "Critical exposure reduction",
      objective: "Reduce critical and internet-exposed risk through simulation-backed remediation waves.",
      owner: "security-lead",
      criteria: { minRiskScore: 70 }
    });
  }
  const model = await buildPilotReadinessModel(tenant.id);

  return (
    <>
      <PageHeader
        eyebrow="Campaign operations"
        title="Remediation campaign board"
        description="Turn the remediation backlog into measurable waves with blockers, approval readiness, evidence readiness, and risk in scope."
      >
        <ApiButton path="/api/campaigns" label="Refresh campaign" payload={{ name: "Critical exposure reduction", objective: "Reduce critical and internet-exposed risk through simulation-backed remediation waves.", owner: "security-lead", criteria: { minRiskScore: 70 } }} />
      </PageHeader>

      <section className="grid cols-4">
        <div className="panel metric">
          <span>Campaign Readiness</span>
          <strong>{model.readiness.campaignExecutionReadiness}%</strong>
        </div>
        <div className="panel metric">
          <span>Unresolved Findings</span>
          <strong>{model.readiness.unresolvedFindings}</strong>
        </div>
        <div className="panel metric">
          <span>Active Campaigns</span>
          <strong>{model.campaignBoard.length}</strong>
        </div>
        <div className="panel metric">
          <span>Blocked Actions</span>
          <strong>{model.campaignBoard.reduce((total, campaign) => total + campaign.blockers, 0)}</strong>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 16 }}>
        {model.campaignBoard.length === 0 ? (
          <EmptyState title="No campaigns available" description="Create or refresh a remediation campaign to populate the operating board." />
        ) : (
          model.campaignBoard.map((campaign) => (
            <div className="panel" key={campaign.id}>
              <div className="stack-head">
                <div>
                  <h2>{campaign.name}</h2>
                  <p>{campaign.objective}</p>
                </div>
                <StatusBadge value={campaign.status} />
              </div>
              <div className="grid cols-4">
                <div className="flow-line">Actions: {campaign.actionCount}</div>
                <div className="flow-line">Ready: {campaign.readyForApproval}</div>
                <div className="flow-line">Approval: {campaign.inApproval}</div>
                <div className="flow-line">Evidence: {campaign.evidenceReady}</div>
              </div>
              <table className="table" style={{ marginTop: 12 }}>
                <tbody>
                  <tr>
                    <td>Owner</td>
                    <td>{campaign.owner}</td>
                  </tr>
                  <tr>
                    <td>Risk in Scope</td>
                    <td>{Math.round(campaign.riskInScope)}</td>
                  </tr>
                  <tr>
                    <td>Blockers</td>
                    <td>{campaign.blockers}</td>
                  </tr>
                  <tr>
                    <td>Updated</td>
                    <td>{new Date(campaign.updatedAt).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
        )}
      </section>
    </>
  );
}
