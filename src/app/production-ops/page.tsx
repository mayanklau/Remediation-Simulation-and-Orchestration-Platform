import { ApiButton } from "@/components/ApiButton";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildOperationalTelemetry } from "@/lib/observability";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function ProductionOpsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const telemetry = await buildOperationalTelemetry(tenant.id);

  return (
    <>
      <PageHeader
        eyebrow="Production operations"
        title="Runtime Control Room"
        description="Operate workers, live connector dry-runs, evidence sealing, telemetry, auth sessions, rate limits, and CI readiness."
      >
        <ApiButton path="/api/workers/run" label="Run simulation worker" payload={{ lane: "simulation", limit: 3 }} />
        <ApiButton path="/api/evidence/seal" label="Seal evidence" payload={{ limit: 5 }} />
      </PageHeader>

      <section className="grid cols-4">
        <div className="panel metric">
          <span>Runtime Health</span>
          <strong>{telemetry.health}</strong>
        </div>
        <div className="panel metric">
          <span>Connector Runs</span>
          <strong>{telemetry.metrics.connectorRuns}</strong>
        </div>
        <div className="panel metric">
          <span>Automation Runs</span>
          <strong>{telemetry.metrics.automationRuns}</strong>
        </div>
        <div className="panel metric">
          <span>Audit Events</span>
          <strong>{telemetry.metrics.auditEvents}</strong>
        </div>
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Operational Endpoints</h2>
          <table className="table">
            <tbody>
              <tr><td>Auth session</td><td><code>GET/POST /api/auth/session</code></td></tr>
              <tr><td>SSO start</td><td><code>GET /api/auth/sso/start</code></td></tr>
              <tr><td>SSO callback</td><td><code>POST /api/auth/sso/callback</code></td></tr>
              <tr><td>Live connectors</td><td><code>POST /api/connectors/live</code></td></tr>
              <tr><td>Worker runner</td><td><code>POST /api/workers/run</code></td></tr>
              <tr><td>Evidence seal</td><td><code>POST /api/evidence/seal</code></td></tr>
              <tr><td>Telemetry</td><td><code>GET/POST /api/observability</code></td></tr>
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>Exporter Status</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div>
                <strong>OpenTelemetry</strong>
                <p>Trace and metric export readiness.</p>
              </div>
              <StatusBadge value={telemetry.exporters.otel ? "configured" : "not_configured"} />
            </div>
            <div className="timeline-item">
              <div>
                <strong>Alert Routing</strong>
                <p>Warn and error signal routing readiness.</p>
              </div>
              <StatusBadge value={telemetry.exporters.alerts ? "configured" : "not_configured"} />
            </div>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Recent Signals</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>Actor</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {telemetry.recentSignals.map((signal) => (
              <tr key={signal.id}>
                <td>{signal.action}</td>
                <td>{signal.entityType}</td>
                <td>{signal.actor}</td>
                <td>{signal.createdAt.toISOString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
