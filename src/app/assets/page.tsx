import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export default async function AssetsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const assets = await prisma.asset.findMany({
    where: { tenantId: tenant.id },
    include: { _count: { select: { findings: true } }, team: true, technicalOwner: true },
    orderBy: { updatedAt: "desc" },
    take: 200
  });

  return (
    <>
      <PageHeader eyebrow="Enterprise inventory" title="Assets" description="The asset model links findings to owners, environments, business criticality, exposure, and dependencies." />
      <div className="panel">
        {assets.length === 0 ? (
          <EmptyState title="No assets yet" description="Assets are created through ingestion or the assets API. No seeded infrastructure is included." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Environment</th>
                <th>Exposure</th>
                <th>Criticality</th>
                <th>Findings</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.name}</td>
                  <td>{asset.type}</td>
                  <td>{asset.environment}</td>
                  <td>{asset.internetExposure ? "Internet exposed" : "Internal"}</td>
                  <td>{asset.criticality}</td>
                  <td>{asset._count.findings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
