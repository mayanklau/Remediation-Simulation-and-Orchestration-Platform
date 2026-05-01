import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";

export type OperationalSignal = {
  tenantId: string;
  level: "info" | "warn" | "error";
  event: string;
  entityType: string;
  entityId: string;
  attributes?: Record<string, unknown>;
};

export async function emitOperationalSignal(signal: OperationalSignal) {
  const traceId = randomUUID();
  await prisma.auditLog.create({
    data: {
      tenantId: signal.tenantId,
      actor: "observability",
      action: signal.event,
      entityType: signal.entityType,
      entityId: signal.entityId,
      detailsJson: stringifyJson({ level: signal.level, traceId, attributes: signal.attributes ?? {} })
    }
  });
  return { traceId, exported: Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT), alertRouted: signal.level !== "info" && Boolean(process.env.ALERT_WEBHOOK_URL) };
}

export async function buildOperationalTelemetry(tenantId: string) {
  const [connectorRuns, automationRuns, audits] = await Promise.all([
    prisma.connectorRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.automationRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.auditLog.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 50 })
  ]);
  const failedConnectorRuns = connectorRuns.filter((run) => run.status === "FAILED").length;
  const failedAutomationRuns = automationRuns.filter((run) => run.status === "FAILED").length;
  return {
    generatedAt: new Date().toISOString(),
    health: failedConnectorRuns + failedAutomationRuns === 0 ? "healthy" : "degraded",
    metrics: {
      connectorRuns: connectorRuns.length,
      failedConnectorRuns,
      automationRuns: automationRuns.length,
      failedAutomationRuns,
      auditEvents: audits.length
    },
    exporters: {
      otel: Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT),
      alerts: Boolean(process.env.ALERT_WEBHOOK_URL)
    },
    recentSignals: audits.slice(0, 10)
  };
}
