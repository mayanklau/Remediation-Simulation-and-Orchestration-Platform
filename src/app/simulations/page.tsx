import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export default async function SimulationsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const simulations = await prisma.simulation.findMany({
    where: { tenantId: tenant.id },
    include: { remediationAction: { include: { finding: { include: { asset: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <>
      <PageHeader eyebrow="Pre-production certainty" title="Simulations" description="Simulation runs estimate blast radius, operational risk, risk reduction, approvals, rollout steps, and rollback steps." />
      <div className="panel">
        {simulations.length === 0 ? (
          <EmptyState title="No simulations run yet" description="Open a finding or remediation action and run the simulation engine against live ingested context." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Finding</th>
                <th>Type</th>
                <th>Status</th>
                <th>Confidence</th>
                <th>Risk Reduction</th>
                <th>Operational Risk</th>
              </tr>
            </thead>
            <tbody>
              {simulations.map((simulation) => (
                <tr key={simulation.id}>
                  <td>{simulation.remediationAction.finding.title}</td>
                  <td>{simulation.type}</td>
                  <td>{simulation.status}</td>
                  <td>{Math.round(simulation.confidence)}%</td>
                  <td>{Math.round(simulation.riskReductionEstimate)}%</td>
                  <td>{Math.round(simulation.operationalRisk)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
