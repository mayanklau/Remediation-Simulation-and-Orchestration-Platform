import { ManualConnectorFlow } from "@/components/ManualConnectorFlow";
import { PageHeader } from "@/components/PageHeader";

export default async function IntegrationsPage() {
  return (
    <>
      <PageHeader eyebrow="Connector framework" title="Integrations" description="Register scanners, ticketing systems, code hosts, cloud providers, notification tools, and execution systems." />
      <ManualConnectorFlow />
      <div className="split">
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
              <tr>
                <td>Connector profiles</td>
                <td className="mono">GET/POST /api/integrations</td>
              </tr>
              <tr>
                <td>Dry-run health check</td>
                <td className="mono">POST /api/connectors/live</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
