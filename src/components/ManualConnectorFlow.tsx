"use client";

import { useEffect, useMemo, useState } from "react";
import { Cable, PlayCircle, PlusCircle } from "lucide-react";

type Integration = {
  id: string;
  provider: string;
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  health?: Record<string, unknown>;
};

type ConnectorRun = {
  id: string;
  provider: string;
  operation: string;
  status: string;
  createdAt?: string;
  resultJson?: string;
};

const templates = [
  { provider: "tenable", operation: "ingest_findings", category: "scanner", scopes: "read:findings" },
  { provider: "wiz", operation: "ingest_cloud_findings", category: "cloud", scopes: "read:issues,read:assets" },
  { provider: "jira", operation: "create_issue", category: "ticketing", scopes: "write:issues,read:projects" },
  { provider: "github", operation: "create_issue", category: "code", scopes: "repo,workflow" },
  { provider: "servicenow", operation: "create_change", category: "itsm", scopes: "change:write,cmdb:read" },
  { provider: "custom-http", operation: "health_check", category: "custom", scopes: "read" }
];

export function ManualConnectorFlow({ compact = false }: { compact?: boolean }) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [runs, setRuns] = useState<ConnectorRun[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    provider: "custom-http",
    name: "Custom HTTP connector",
    category: "custom",
    authMode: "manual_secret_reference",
    endpoint: "https://example.internal/api",
    owner: "security-operations",
    scopes: "read",
    operation: "health_check",
    payload: '{ "mode": "manual_dry_run" }'
  });

  const selectedTemplate = useMemo(() => templates.find((item) => item.provider === form.provider), [form.provider]);

  useEffect(() => {
    refresh();
  }, []);

  function applyTemplate(provider: string) {
    const template = templates.find((item) => item.provider === provider);
    setForm((current) => ({
      ...current,
      provider,
      name: `${provider} connector`,
      category: template?.category ?? "custom",
      scopes: template?.scopes ?? "read",
      operation: template?.operation ?? "health_check"
    }));
  }

  async function refresh() {
    const response = await fetch("/api/integrations");
    if (!response.ok) return;
    const data = await response.json();
    setIntegrations(data.integrations ?? []);
    setRuns(data.runs ?? []);
  }

  async function createProfile() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/integrations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form)
    });
    setBusy(false);
    setMessage(response.ok ? "Connector profile saved." : "Unable to save connector profile.");
    await refresh();
  }

  async function runDryCheck(provider = form.provider, operation = form.operation) {
    setBusy(true);
    setMessage("");
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(form.payload || "{}");
    } catch {
      setBusy(false);
      setMessage("Payload must be valid JSON.");
      return;
    }
    const response = await fetch("/api/connectors/live", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider, operation, dryRun: true, payload })
    });
    setBusy(false);
    setMessage(response.ok ? "Dry-run connector check recorded." : "Unable to run connector check.");
    await refresh();
  }

  return (
    <section className="panel manual-connector">
      <div className="stack-head">
        <div>
          <h2>Manual Connector Builder</h2>
          <p>Add any scanner, CMDB, ticketing, cloud, code, IAM, notification, or custom HTTP integration without code changes.</p>
        </div>
        <span className="badge">{integrations.length} profiles</span>
      </div>
      <div className="connector-form-grid">
        <label className="field">
          <span>Template</span>
          <select value={form.provider} onChange={(event) => applyTemplate(event.target.value)}>
            {templates.map((template) => <option key={template.provider} value={template.provider}>{template.provider}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Provider key</span>
          <input value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })} />
        </label>
        <label className="field">
          <span>Name</span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label className="field">
          <span>Category</span>
          <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
        </label>
        <label className="field">
          <span>Auth mode</span>
          <select value={form.authMode} onChange={(event) => setForm({ ...form, authMode: event.target.value })}>
            <option value="manual_secret_reference">Manual secret reference</option>
            <option value="oauth2">OAuth2</option>
            <option value="api_token_reference">API token reference</option>
            <option value="none">None / public</option>
          </select>
        </label>
        <label className="field">
          <span>Endpoint</span>
          <input value={form.endpoint} onChange={(event) => setForm({ ...form, endpoint: event.target.value })} />
        </label>
        <label className="field">
          <span>Owner</span>
          <input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} />
        </label>
        <label className="field">
          <span>Scopes</span>
          <input value={form.scopes} onChange={(event) => setForm({ ...form, scopes: event.target.value })} />
        </label>
        <label className="field">
          <span>Operation</span>
          <input value={form.operation} onChange={(event) => setForm({ ...form, operation: event.target.value })} />
        </label>
      </div>
      <label className="field">
        <span>Dry-run payload JSON</span>
        <textarea value={form.payload} onChange={(event) => setForm({ ...form, payload: event.target.value })} />
      </label>
      <div className="actions">
        <button className="button primary" onClick={createProfile} disabled={busy}><PlusCircle size={16} /> Save connector profile</button>
        <button className="button" onClick={() => runDryCheck()} disabled={busy}><PlayCircle size={16} /> Run dry check</button>
        <span className="muted">{message || `Template: ${selectedTemplate?.category ?? "custom"}`}</span>
      </div>
      {!compact && (
        <div className="grid cols-2" style={{ marginTop: 16 }}>
          <div>
            <h2>Profiles</h2>
            <table className="table">
              <thead><tr><th>Name</th><th>Provider</th><th>Auth</th><th>Health</th><th>Run</th></tr></thead>
              <tbody>
                {integrations.length === 0 && <tr><td colSpan={5}>No connector profiles yet.</td></tr>}
                {integrations.map((integration) => (
                  <tr key={integration.id}>
                    <td>{integration.name}</td>
                    <td>{integration.provider}</td>
                    <td>{String(integration.config?.authMode ?? "manual")}</td>
                    <td>{String(integration.health?.status ?? (integration.enabled ? "enabled" : "disabled"))}</td>
                    <td><button className="button" onClick={() => runDryCheck(integration.provider, "health_check")}><Cable size={15} /> Check</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Recent Runs</h2>
            <table className="table">
              <thead><tr><th>Provider</th><th>Operation</th><th>Status</th></tr></thead>
              <tbody>
                {runs.length === 0 && <tr><td colSpan={3}>No connector runs yet.</td></tr>}
                {runs.slice(0, 8).map((run) => (
                  <tr key={run.id}><td>{run.provider}</td><td>{run.operation}</td><td>{run.status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
