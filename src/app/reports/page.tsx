import { PageHeader } from "@/components/PageHeader";
import { ApiButton } from "@/components/ApiButton";
import { JsonBlock } from "@/components/JsonBlock";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";
import { buildExecutiveReport } from "@/domain/reporting";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const existing = await prisma.reportSnapshot.count({ where: { tenantId: tenant.id } });
  if (existing === 0) await buildExecutiveReport(tenant.id, "system");
  const reports = await prisma.reportSnapshot.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 10 });

  return (
    <>
      <PageHeader
        eyebrow="Phase 2"
        title="Advanced reporting"
        description="Executive, audit, and remediation performance snapshots generated directly from tenant data."
      >
        <ApiButton path="/api/reports" label="Generate report" />
      </PageHeader>
      <section className="grid">
        {reports.map((report) => (
          <div className="panel" key={report.id}>
            <h2>{report.name}</h2>
            <p>
              {report.type} report generated {report.createdAt.toLocaleString()} {report.createdBy ? `by ${report.createdBy}` : ""}
            </p>
            <JsonBlock value={report.dataJson} />
          </div>
        ))}
      </section>
    </>
  );
}
