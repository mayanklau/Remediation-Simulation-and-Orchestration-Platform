import { PageHeader } from "@/components/PageHeader";
import { ApiButton } from "@/components/ApiButton";
import { JsonBlock } from "@/components/JsonBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";
import { createOrRefreshCampaign } from "@/domain/campaigns";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const tenant = await getOrCreateDefaultTenant();
  if ((await prisma.remediationCampaign.count({ where: { tenantId: tenant.id } })) === 0) {
    await createOrRefreshCampaign(tenant.id, {
      name: "Critical exposure reduction",
      objective: "Reduce critical and internet-exposed risk through simulation-backed remediation waves.",
      owner: "security-lead",
      criteria: { minRiskScore: 70 }
    });
  }
  const campaigns = await prisma.remediationCampaign.findMany({ where: { tenantId: tenant.id }, orderBy: { updatedAt: "desc" } });

  return (
    <>
      <PageHeader
        eyebrow="Phase 4"
        title="Self-updating remediation campaigns"
        description="Campaigns group high-risk remediation work into governed waves with simulation and execution metrics."
      >
        <ApiButton path="/api/campaigns" label="Refresh campaign" payload={{ name: "Critical exposure reduction", objective: "Reduce critical and internet-exposed risk through simulation-backed remediation waves.", owner: "security-lead", criteria: { minRiskScore: 70 } }} />
      </PageHeader>
      <section className="grid">
        {campaigns.map((campaign) => (
          <div className="panel" key={campaign.id}>
            <div className="actions" style={{ justifyContent: "space-between" }}>
              <h2>{campaign.name}</h2>
              <StatusBadge value={campaign.status} />
            </div>
            <p>{campaign.objective}</p>
            <JsonBlock value={campaign.planJson} />
          </div>
        ))}
      </section>
    </>
  );
}
