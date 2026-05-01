import { ApiButton } from "@/components/ApiButton";
import { JsonBlock } from "@/components/JsonBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ensureDefaultPolicies } from "@/domain/governance";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const tenant = await getOrCreateDefaultTenant();
  await ensureDefaultPolicies(tenant.id);
  const policies = await prisma.policy.findMany({ where: { tenantId: tenant.id }, orderBy: [{ enabled: "desc" }, { createdAt: "desc" }] });

  return (
    <>
      <PageHeader
        eyebrow="Governance controls"
        title="Policy Builder"
        description="Define when remediation can be simulated continuously, auto-approved, routed to change boards, or constrained to dry-run automation."
      >
        <ApiButton
          path="/api/policies"
          label="Create production guardrail"
          payload={{
            name: "Production high-risk change board",
            policyType: "approval_routing",
            enforcementMode: "enforced",
            rules: { environments: ["PRODUCTION"], minOperationalRisk: 55, requiredApprovers: ["security", "platform-owner", "change-advisory"] }
          }}
        />
      </PageHeader>

      <div className="grid cols-2">
        {policies.map((policy) => (
          <div className="panel" key={policy.id}>
            <div className="stack-head">
              <div>
                <h2>{policy.name}</h2>
                <p>{policy.policyType}</p>
              </div>
              <StatusBadge value={policy.enabled ? policy.enforcementMode : "disabled"} />
            </div>
            <JsonBlock value={policy.rulesJson} />
          </div>
        ))}
      </div>
    </>
  );
}
