import { ApiButton } from "@/components/ApiButton";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildPilotReadinessModel } from "@/domain/pilot-readiness";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function ConnectorsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const model = await buildPilotReadinessModel(tenant.id);

  return (
    <>
      <PageHeader
        eyebrow="Enterprise pilot"
        title="Connector onboarding"
        description="Register scanner, ticketing, code, cloud, and execution connectors with readiness scoring before production use."
      >
        <ApiButton
          path="/api/pilot-readiness"
          label="Create Tenable profile"
          payload={{ action: "create_connector", provider: "tenable", name: "Tenable pilot scanner", owner: "security-operations", scopes: ["ingest_findings"], syncCadence: "daily" }}
        />
      </PageHeader>

      <section className="grid cols-4">
        <div className="panel metric">
          <span>Connector Coverage</span>
          <strong>{model.readiness.connectorCoverage}%</strong>
        </div>
        <div className="panel metric">
          <span>Required Coverage</span>
          <strong>{model.readiness.requiredConnectorCoverage}%</strong>
        </div>
        <div className="panel metric">
          <span>Ingestion Success</span>
          <strong>{model.readiness.ingestionSuccessRate}%</strong>
        </div>
        <div className="panel metric">
          <span>Duplicates Collapsed</span>
          <strong>{model.readiness.duplicateSourceFindings}</strong>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Onboarding Matrix</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Phase</th>
              <th>Operations</th>
              <th>Auth</th>
              <th>Owner</th>
              <th>Health</th>
              <th>Readiness</th>
              <th>Next Step</th>
            </tr>
          </thead>
          <tbody>
            {model.onboarding.map((connector) => (
              <tr key={connector.provider}>
                <td>
                  <strong>{connector.provider}</strong>
                  {connector.required ? <div className="muted">Required</div> : null}
                </td>
                <td>Phase {connector.phase}</td>
                <td>{connector.operations.join(", ")}</td>
                <td>{connector.authMode}</td>
                <td>{connector.owner}</td>
                <td>
                  <StatusBadge value={connector.healthStatus} />
                </td>
                <td>{connector.readinessScore}%</td>
                <td>{connector.nextStep}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
