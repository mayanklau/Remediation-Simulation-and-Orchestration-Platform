import { ApiButton } from "@/components/ApiButton";
import { JsonBlock } from "@/components/JsonBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function ExceptionsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const policies = await prisma.policy.findMany({
    where: { tenantId: tenant.id, policyType: { in: ["risk_exception", "change_freeze", "approval_routing"] } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <PageHeader
        eyebrow="Governance guardrails"
        title="Exceptions and Freeze Windows"
        description="Risk exceptions, production change freezes, and approval routing are tracked as policies with audit-ready rationale."
      >
        <ApiButton
          path="/api/operating-system"
          label="Create risk exception"
          payload={{ name: "Temporary compensating-control exception", reason: "Compensating control accepted while vendor patch is pending", scope: "critical findings", riskAcceptedBy: "ciso@example.com" }}
        />
      </PageHeader>

      <div className="grid cols-2">
        {policies.length === 0 ? (
          <div className="panel">
            <p>No exception or freeze-window policies have been created yet.</p>
          </div>
        ) : (
          policies.map((policy) => (
            <div className="panel" key={policy.id}>
              <div className="stack-head">
                <div>
                  <h2>{policy.name}</h2>
                  <p>{policy.policyType}</p>
                </div>
                <StatusBadge value={policy.enforcementMode} />
              </div>
              <JsonBlock value={policy.rulesJson} />
            </div>
          ))
        )}
      </div>
    </>
  );
}
