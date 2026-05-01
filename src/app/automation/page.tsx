import { PageHeader } from "@/components/PageHeader";
import { ApiButton } from "@/components/ApiButton";
import { JsonBlock } from "@/components/JsonBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";
import { createExecutionHook } from "@/domain/automation";

export const dynamic = "force-dynamic";

export default async function AutomationPage() {
  const tenant = await getOrCreateDefaultTenant();
  if ((await prisma.executionHook.count({ where: { tenantId: tenant.id } })) === 0) {
    await Promise.all([
      createExecutionHook(tenant.id, { name: "GitHub remediation PR", hookType: "ci_cd", config: { provider: "github", branchPrefix: "remediation/" } }),
      createExecutionHook(tenant.id, { name: "Kubernetes progressive rollout", hookType: "kubernetes", config: { strategy: "canary", maxUnavailable: 1 } }),
      createExecutionHook(tenant.id, { name: "Cloud control remediation", hookType: "cloud", config: { dryRunRequired: true } }),
      createExecutionHook(tenant.id, { name: "IAM least privilege automation", hookType: "iam", config: { replayWindowDays: 30 } })
    ]);
  }
  const [hooks, runs, candidateAction] = await Promise.all([
    prisma.executionHook.findMany({ where: { tenantId: tenant.id }, orderBy: { hookType: "asc" } }),
    prisma.automationRun.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.remediationAction.findFirst({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" } })
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Phase 3"
        title="Execution automation"
        description="CI/CD, Kubernetes, cloud, and IAM execution hooks run in dry-run mode before governed rollout."
      >
        {candidateAction ? <ApiButton path="/api/automation/run" label="Run dry run" payload={{ remediationActionId: candidateAction.id, runType: "ci_cd" }} /> : null}
      </PageHeader>
      <section className="split">
        <div className="panel">
          <h2>Execution Hooks</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {hooks.map((hook) => (
                <tr key={hook.id}>
                  <td>{hook.name}</td>
                  <td>{hook.hookType}</td>
                  <td>
                    <StatusBadge value={hook.enabled ? "ACTIVE" : "DISABLED"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2>Recent Runs</h2>
          {runs.length === 0 ? <p>No automation dry runs have been executed yet.</p> : runs.map((run) => <JsonBlock key={run.id} value={run.outputJson} />)}
        </div>
      </section>
    </>
  );
}
