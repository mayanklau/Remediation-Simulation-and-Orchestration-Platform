import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";

export const connectorRegistry = [
  { provider: "jira", operations: ["create_issue", "sync_status"], phase: 1 },
  { provider: "github", operations: ["open_pr", "create_issue", "dispatch_workflow"], phase: 1 },
  { provider: "servicenow", operations: ["create_change", "sync_cmdb", "close_change"], phase: 2 },
  { provider: "tenable", operations: ["ingest_findings"], phase: 2 },
  { provider: "qualys", operations: ["ingest_findings"], phase: 2 },
  { provider: "wiz", operations: ["ingest_cloud_findings"], phase: 2 },
  { provider: "snyk", operations: ["ingest_dependency_findings"], phase: 2 },
  { provider: "aws-security-hub", operations: ["ingest_findings", "apply_security_control"], phase: 3 },
  { provider: "kubernetes", operations: ["apply_manifest", "rollout_restart", "validate_policy"], phase: 3 }
];

export async function runConnectorOperation(tenantId: string, provider: string, operation: string, payload: Record<string, unknown>) {
  const startedAt = new Date();
  const run = await prisma.connectorRun.create({
    data: {
      tenantId,
      provider,
      operation,
      status: "RUNNING",
      requestJson: stringifyJson(payload),
      startedAt
    }
  });
  const result = simulateConnectorResult(provider, operation, payload);
  return prisma.connectorRun.update({
    where: { id: run.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      resultJson: stringifyJson(result)
    }
  });
}

function simulateConnectorResult(provider: string, operation: string, payload: Record<string, unknown>) {
  const reference = `${provider.toUpperCase()}-${Math.abs(hash(JSON.stringify(payload))).toString(36).slice(0, 8)}`;
  if (provider === "github" && operation === "open_pr") {
    return { reference, url: `https://github.example/enterprise/remediation/pull/${reference}`, status: "drafted", payload };
  }
  if (provider === "jira") {
    return { reference, url: `https://jira.example/browse/${reference}`, status: "created", payload };
  }
  if (provider === "servicenow") {
    return { reference, url: `https://servicenow.example/change/${reference}`, status: "scheduled", payload };
  }
  return { reference, status: "accepted", payload };
}

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result << 5) - result + value.charCodeAt(index);
    result |= 0;
  }
  return result;
}
