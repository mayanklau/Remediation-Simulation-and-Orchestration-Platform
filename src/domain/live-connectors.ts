import { prisma } from "@/lib/prisma";
import { parseJsonObject, stringifyJson } from "@/lib/json";
import { resolveConnectorSecrets } from "@/lib/secrets";

export type LiveConnectorRequest = {
  provider: string;
  operation: string;
  payload?: Record<string, unknown>;
  dryRun?: boolean;
};

type ConnectorClient = {
  provider: string;
  endpoint: (config: Record<string, unknown>, operation: string) => string;
  buildRequest: (operation: string, payload: Record<string, unknown>) => { method: string; body?: unknown };
};

const clients: ConnectorClient[] = [
  {
    provider: "jira",
    endpoint: (config, operation) => `${String(config.baseUrl ?? process.env.JIRA_BASE_URL ?? "").replace(/\/$/, "")}/rest/api/3/${operation === "sync_status" ? "search" : "issue"}`,
    buildRequest: (_operation, payload) => ({ method: "POST", body: { fields: payload } })
  },
  {
    provider: "github",
    endpoint: (config, operation) => `${String(config.apiUrl ?? "https://api.github.com").replace(/\/$/, "")}/repos/${String(config.owner ?? "enterprise")}/${String(config.repo ?? "remediation")}/${operation === "dispatch_workflow" ? "actions/workflows/remediation.yml/dispatches" : "issues"}`,
    buildRequest: (_operation, payload) => ({ method: "POST", body: payload })
  },
  {
    provider: "servicenow",
    endpoint: (config) => `${String(config.instanceUrl ?? process.env.SERVICENOW_INSTANCE_URL ?? "").replace(/\/$/, "")}/api/now/table/change_request`,
    buildRequest: (_operation, payload) => ({ method: "POST", body: payload })
  }
];

export async function executeLiveConnector(tenantId: string, request: LiveConnectorRequest) {
  const integration = await prisma.integration.findFirst({ where: { tenantId, provider: request.provider, enabled: true } });
  const config = parseJsonObject(integration?.configJson, {});
  const secrets = await resolveConnectorSecrets(config);
  const client = clients.find((candidate) => candidate.provider === request.provider);
  const startedAt = new Date();
  const dryRun = request.dryRun ?? true;
  const run = await prisma.connectorRun.create({
    data: {
      tenantId,
      provider: request.provider,
      operation: request.operation,
      status: "RUNNING",
      requestJson: stringifyJson({ ...request.payload, dryRun, secretKeys: Object.keys(secrets) }),
      startedAt
    }
  });

  if (!client || dryRun) {
    return prisma.connectorRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        resultJson: stringifyJson({
          mode: dryRun ? "dry_run" : "unsupported_client",
          provider: request.provider,
          operation: request.operation,
          endpoint: client?.endpoint(config, request.operation),
          request: client?.buildRequest(request.operation, request.payload ?? {}),
          secrets
        })
      }
    });
  }

  const outbound = client.buildRequest(request.operation, request.payload ?? {});
  const response = await fetch(client.endpoint(config, request.operation), {
    method: outbound.method,
    headers: { "content-type": "application/json" },
    body: outbound.body ? JSON.stringify(outbound.body) : undefined
  });
  const text = await response.text();
  return prisma.connectorRun.update({
    where: { id: run.id },
    data: {
      status: response.ok ? "COMPLETED" : "FAILED",
      completedAt: new Date(),
      resultJson: stringifyJson({ status: response.status, body: text.slice(0, 5000) })
    }
  });
}
