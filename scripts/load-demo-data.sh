#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:3000/api}"

echo "Loading enterprise remediation demo data into ${API_BASE} ..."

node <<'NODE'
const API = process.env.API_BASE || "http://localhost:3000/api";

async function post(path, body = {}) {
  const response = await fetch(`${API}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${path} ${response.status}: ${await response.text()}`);
  return response.json();
}

async function get(path) {
  const response = await fetch(`${API}${path}`);
  if (!response.ok) throw new Error(`${path} ${response.status}: ${await response.text()}`);
  return response.json();
}

console.log("1/5 Loading enterprise mock dataset...");
console.log(await post("/mock-ingest", {}));

console.log("2/5 Appending production-style integrations...");
for (const integration of [
  { provider: "tenable-enterprise", name: "Tenable Enterprise VM", category: "scanner", authMode: "manual_secret_reference", endpoint: "https://tenable.example.internal", owner: "security-operations", scopes: "read:findings,read:assets", operation: "ingest_findings" },
  { provider: "wiz-cloud", name: "Wiz Cloud Security", category: "cloud", authMode: "manual_secret_reference", endpoint: "https://api.wiz.example.internal", owner: "cloud-security", scopes: "read:issues,read:assets,read:iam", operation: "ingest_cloud_findings" },
  { provider: "github-advanced-security", name: "GitHub Advanced Security", category: "code", authMode: "manual_secret_reference", endpoint: "https://api.github.com", owner: "devsecops", scopes: "repo,security_events,workflow", operation: "ingest_code_findings" }
]) {
  await post("/integrations", integration);
  await post("/connectors/live", { provider: integration.provider, operation: integration.operation, dryRun: true, payload: { demo: true } });
}

console.log("3/5 Activating governance and attack-path snapshots...");
await post("/virtual-patching", { action: "activate" });
await post("/agentic", { goal: "reduce production attack paths", prompt: "Plan governed path breakers for exploited production paths.", dryRun: true });
await post("/attack-paths", { action: "snapshot" });

console.log("4/5 Running production readiness activators...");
await post("/pilot-control-plane", { action: "activate_all_10" });
await post("/final-production", { action: "finalize" });

console.log("5/5 Verifying state...");
const dashboard = await get("/dashboard");
const attackPaths = await get("/attack-paths");
console.log(JSON.stringify({
  assets: dashboard.metrics?.assets ?? 0,
  open_findings: dashboard.metrics?.openFindings ?? 0,
  critical_findings: dashboard.metrics?.criticalFindings ?? 0,
  pending_approvals: dashboard.metrics?.pendingApprovals ?? 0,
  simulations: dashboard.metrics?.simulations ?? 0,
  attack_paths: attackPaths.attackPaths?.summary?.totalPaths || attackPaths.attackPaths?.summary?.attackPaths || attackPaths.attackPaths?.paths?.length || 0
}, null, 2));
NODE
