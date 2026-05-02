import { EmptyState } from "@/components/EmptyState";
import { ManualConnectorFlow } from "@/components/ManualConnectorFlow";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export default async function IntegrationsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const integrations = await prisma.integration.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader eyebrow="Connector framework" title="Integrations" description="Register scanners, ticketing systems, code hosts, cloud providers, notification tools, and execution systems." />
      <ManualConnectorFlow compact />
      <div className="split">
        <div className="panel">
          <h2>Configured Integrations</h2>
          {integrations.length === 0 ? (
            <EmptyState title="No integrations configured" description="Use the integrations API to register providers. Secrets should be stored in a real secrets manager for production." />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Provider</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map((integration) => (
                  <tr key={integration.id}>
                    <td>{integration.name}</td>
                    <td>{integration.provider}</td>
                    <td>{integration.enabled ? "Enabled" : "Disabled"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="panel">
          <h2>Available Interfaces</h2>
          <table className="table">
            <tbody>
              <tr>
                <td>JSON ingestion</td>
                <td className="mono">POST /api/ingest/json</td>
              </tr>
              <tr>
                <td>CSV ingestion</td>
                <td className="mono">POST /api/ingest/csv</td>
              </tr>
              <tr>
                <td>Assets</td>
                <td className="mono">GET/POST /api/assets</td>
              </tr>
              <tr>
                <td>Remediation</td>
                <td className="mono">GET /api/remediation-actions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
