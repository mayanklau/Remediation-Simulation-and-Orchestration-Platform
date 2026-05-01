import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { SeverityBadge } from "@/components/SeverityBadge";
import { ActionButtons } from "@/components/ActionButtons";
import { parseJsonObject } from "@/lib/json";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export default async function FindingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getOrCreateDefaultTenant();
  const finding = await prisma.finding.findFirst({
    where: { tenantId: tenant.id, id },
    include: {
      asset: true,
      sourceFindings: true,
      remediationActions: {
        include: {
          simulations: { orderBy: { createdAt: "desc" } },
          plans: { orderBy: { createdAt: "desc" } },
          workflowItems: { include: { approvals: true, evidenceArtifacts: true } }
        }
      }
    }
  });
  if (!finding) notFound();

  return (
    <>
      <PageHeader eyebrow="Finding detail" title={finding.title} description={finding.riskExplanation}>
        <SeverityBadge value={finding.severity} />
      </PageHeader>
      <section className="split">
        <div className="grid">
          <div className="panel">
            <h2>Context</h2>
            <table className="table">
              <tbody>
                <tr>
                  <td>Status</td>
                  <td>{finding.status}</td>
                </tr>
                <tr>
                  <td>Risk score</td>
                  <td>{Math.round(finding.riskScore)}</td>
                </tr>
                <tr>
                  <td>Business risk</td>
                  <td>{Math.round(finding.businessRiskScore)}</td>
                </tr>
                <tr>
                  <td>Asset</td>
                  <td>{finding.asset?.name ?? "Unmapped"}</td>
                </tr>
                <tr>
                  <td>Due</td>
                  <td>{finding.dueAt?.toDateString() ?? "Not set"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {finding.remediationActions.map((action) => (
            <div className="panel" key={action.id}>
              <h2>{action.title}</h2>
              <p>{action.summary}</p>
              <ActionButtons remediationActionId={action.id} />
              <div style={{ height: 14 }} />
              <table className="table">
                <tbody>
                  <tr>
                    <td>Status</td>
                    <td>{action.status}</td>
                  </tr>
                  <tr>
                    <td>Action type</td>
                    <td>{action.actionType}</td>
                  </tr>
                  <tr>
                    <td>Simulations</td>
                    <td>{action.simulations.length}</td>
                  </tr>
                  <tr>
                    <td>Plans</td>
                    <td>{action.plans.length}</td>
                  </tr>
                </tbody>
              </table>
              {action.simulations[0]?.resultJson ? (
                <pre className="mono">{JSON.stringify(parseJsonObject(action.simulations[0].resultJson, {}), null, 2)}</pre>
              ) : null}
            </div>
          ))}
        </div>
        <div className="grid">
          <div className="panel">
            <h2>Source Evidence</h2>
            <p>{finding.sourceFindings.length} source record(s) linked to this canonical finding.</p>
          </div>
          <div className="panel">
            <h2>Description</h2>
            <p>{finding.description || "No description was supplied by the source system."}</p>
          </div>
        </div>
      </section>
    </>
  );
}
