import { PageHeader } from "@/components/PageHeader";
import { ApiButton } from "@/components/ApiButton";
import { JsonBlock } from "@/components/JsonBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";
import { buildPredictiveRiskModel, ensureDefaultPolicies } from "@/domain/governance";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const tenant = await getOrCreateDefaultTenant();
  await ensureDefaultPolicies(tenant.id);
  const [policies, predictions, automationRuns] = await Promise.all([
    prisma.policy.findMany({ where: { tenantId: tenant.id }, orderBy: { policyType: "asc" } }),
    buildPredictiveRiskModel(tenant.id),
    prisma.automationRun.findMany({ where: { tenantId: tenant.id, approvalMode: "auto_approved" }, orderBy: { createdAt: "desc" }, take: 5 })
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Phase 4"
        title="Autonomous remediation governance"
        description="Policy governed fixes, continuous simulation, predictive risk modeling, and verification controls."
      >
        <ApiButton path="/api/governance/continuous-simulation" label="Run continuous simulation" payload={{ limit: 5 }} />
      </PageHeader>
      <section className="grid cols-2">
        <div className="panel">
          <h2>Policies</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id}>
                  <td>{policy.name}</td>
                  <td>{policy.policyType}</td>
                  <td>
                    <StatusBadge value={policy.enforcementMode} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2>Predictive Risk</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Finding</th>
                <th>Current</th>
                <th>Predicted</th>
              </tr>
            </thead>
            <tbody>
              {predictions.slice(0, 8).map((prediction) => (
                <tr key={prediction.findingId}>
                  <td>{prediction.title}</td>
                  <td>{prediction.currentBusinessRisk}</td>
                  <td>{prediction.predictedResidualRisk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div style={{ height: 18 }} />
      <section className="panel">
        <h2>Policy Governed Automation Evidence</h2>
        {automationRuns.length === 0 ? <p>No auto-approved policy fix has run yet.</p> : automationRuns.map((run) => <JsonBlock key={run.id} value={run.outputJson} />)}
      </section>
    </>
  );
}
