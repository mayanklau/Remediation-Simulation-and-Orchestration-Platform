import { PageHeader } from "@/components/PageHeader";
import { JsonBlock } from "@/components/JsonBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";
import { roleCatalog } from "@/domain/rbac";
import { buildSamlServiceProviderMetadata } from "@/domain/sso";

export const dynamic = "force-dynamic";

export default async function EnterprisePage() {
  const tenant = await getOrCreateDefaultTenant();
  const [sso, connectorRuns] = await Promise.all([
    prisma.ssoConfiguration.findMany({ where: { tenantId: tenant.id }, orderBy: { provider: "asc" } }),
    prisma.connectorRun.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 6 })
  ]);
  const metadata = buildSamlServiceProviderMetadata(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000", tenant.slug);

  return (
    <>
      <PageHeader
        eyebrow="Phase 2"
        title="Enterprise readiness"
        description="SSO metadata, advanced RBAC catalog, connector operations, and audit-ready integration state."
      />
      <section className="grid cols-2">
        <div className="panel">
          <h2>SSO Service Provider</h2>
          <JsonBlock value={JSON.stringify(metadata)} />
        </div>
        <div className="panel">
          <h2>RBAC Catalog</h2>
          <table className="table">
            <tbody>
              {roleCatalog().map((role) => (
                <tr key={role.role}>
                  <td>{role.role}</td>
                  <td>{role.permissions.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div style={{ height: 18 }} />
      <section className="split">
        <div className="panel">
          <h2>SSO Configurations</h2>
          {sso.length === 0 ? <p>No SSO provider configured yet.</p> : sso.map((item) => <StatusBadge key={item.id} value={`${item.provider}: ${item.enabled ? "enabled" : "disabled"}`} />)}
        </div>
        <div className="panel">
          <h2>Connector Runs</h2>
          {connectorRuns.length === 0 ? <p>No connector run history yet.</p> : connectorRuns.map((run) => <JsonBlock key={run.id} value={run.resultJson} />)}
        </div>
      </section>
    </>
  );
}
