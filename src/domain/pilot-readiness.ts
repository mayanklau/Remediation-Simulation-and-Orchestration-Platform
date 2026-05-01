import { connectorRegistry, runConnectorOperation } from "@/domain/connectors";
import { parseJsonObject, stringifyJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

const criticalProviders = new Set(["jira", "github", "servicenow", "tenable", "qualys", "wiz", "snyk", "aws-security-hub", "kubernetes"]);
const ingestionProviders = new Set(["tenable", "qualys", "wiz", "snyk", "aws-security-hub"]);

type ConnectorConfig = {
  authMode?: string;
  scopes?: string[];
  owner?: string;
  environment?: string;
  syncCadence?: string;
};

type ConnectorHealth = {
  status?: string;
  lastCheckedAt?: string;
  message?: string;
};

export async function buildPilotReadinessModel(tenantId: string) {
  const [integrations, runs, campaigns, actions, workflows, findings] = await Promise.all([
    prisma.integration.findMany({ where: { tenantId }, orderBy: { updatedAt: "desc" } }),
    prisma.connectorRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.remediationCampaign.findMany({ where: { tenantId }, orderBy: { updatedAt: "desc" } }),
    prisma.remediationAction.findMany({
      where: { tenantId },
      include: { finding: { include: { asset: true } }, simulations: { orderBy: { createdAt: "desc" }, take: 1 }, workflowItems: true },
      take: 120
    }),
    prisma.workflowItem.findMany({ where: { tenantId }, include: { approvals: true, evidenceArtifacts: true }, take: 120 }),
    prisma.finding.findMany({ where: { tenantId }, include: { asset: true, sourceFindings: true }, take: 200 })
  ]);

  const configuredProviders = new Set(integrations.map((integration) => integration.provider));
  const onboarding = connectorRegistry.map((definition) => {
    const integration = integrations.find((item) => item.provider === definition.provider);
    const latestRun = runs.find((run) => run.provider === definition.provider);
    const config = parseJsonObject<ConnectorConfig>(integration?.configJson, {});
    const health = parseJsonObject<ConnectorHealth>(integration?.healthJson, {});
    const required = criticalProviders.has(definition.provider);
    const readinessScore =
      (integration ? 35 : 0) +
      (integration?.enabled ? 15 : 0) +
      (config.authMode ? 15 : 0) +
      ((config.scopes?.length ?? 0) > 0 ? 15 : 0) +
      (latestRun?.status === "COMPLETED" ? 20 : latestRun ? 8 : 0);
    return {
      provider: definition.provider,
      phase: definition.phase,
      operations: definition.operations,
      required,
      configured: Boolean(integration),
      enabled: integration?.enabled ?? false,
      authMode: config.authMode ?? "not_configured",
      owner: config.owner ?? "unassigned",
      syncCadence: config.syncCadence ?? "manual",
      healthStatus: health.status ?? latestRun?.status ?? "not_tested",
      latestRunStatus: latestRun?.status ?? "never_run",
      latestRunAt: latestRun?.completedAt?.toISOString() ?? latestRun?.createdAt?.toISOString() ?? null,
      readinessScore: Math.min(100, readinessScore),
      nextStep: getConnectorNextStep(Boolean(integration), integration?.enabled ?? false, config, latestRun?.status)
    };
  });

  const ingestionJobs = runs
    .filter((run) => ingestionProviders.has(run.provider) || run.operation.includes("ingest"))
    .map((run) => {
      const request = parseJsonObject<Record<string, unknown>>(run.requestJson, {});
      const result = parseJsonObject<Record<string, unknown>>(run.resultJson, {});
      const payload = parseJsonObject<Record<string, unknown>>(stringifyJson(result.payload), request);
      return {
        id: run.id,
        provider: run.provider,
        operation: run.operation,
        status: run.status,
        source: typeof request.source === "string" ? request.source : run.provider,
        submittedBy: typeof request.submittedBy === "string" ? request.submittedBy : "system",
        recordsReceived: numberValue(result.recordsReceived, numberValue(payload.recordsReceived, numberValue(request.recordsExpected, 0))),
        recordsAccepted: numberValue(result.recordsAccepted, numberValue(payload.recordsAccepted, 0)),
        recordsRejected: numberValue(result.recordsRejected, numberValue(payload.recordsRejected, 0)),
        errorCount: numberValue(result.errorCount, numberValue(payload.errorCount, run.status === "FAILED" ? 1 : 0)),
        startedAt: run.startedAt?.toISOString() ?? null,
        completedAt: run.completedAt?.toISOString() ?? null,
        createdAt: run.createdAt.toISOString()
      };
    });

  const unresolvedFindings = findings.filter((finding) => !["RESOLVED", "FALSE_POSITIVE"].includes(finding.status));
  const duplicateGroups = new Map<string, number>();
  findings.forEach((finding) => {
    const key = [finding.cve ?? finding.controlId ?? finding.title, finding.asset?.externalId ?? finding.assetId ?? "unmapped"].join(":");
    duplicateGroups.set(key, (duplicateGroups.get(key) ?? 0) + finding.sourceFindings.length);
  });

  const campaignBoard = campaigns.map((campaign) => {
    const plan = parseJsonObject<{
      actions?: Array<{ id: string; title: string; asset?: string; riskScore?: number; latestSimulationConfidence?: number | null }>;
      stages?: Array<{ name: string; count: number }>;
    }>(campaign.planJson, {});
    const metrics = parseJsonObject<Record<string, unknown>>(campaign.metricsJson, {});
    const campaignActions = actions.filter((action) => plan.actions?.some((planned) => planned.id === action.id));
    const blockers = campaignActions.filter((action) => action.workflowItems.some((workflow) => workflow.status === "BLOCKED")).length;
    const readyForApproval = campaignActions.filter((action) => (action.simulations[0]?.confidence ?? 0) >= 75 && action.workflowItems.length === 0).length;
    const inApproval = campaignActions.filter((action) => action.workflowItems.some((workflow) => ["NEW", "PENDING", "IN_REVIEW"].includes(workflow.status))).length;
    const evidenceReady = campaignActions.filter((action) => action.workflowItems.some((workflow) => workflows.some((item) => item.id === workflow.id && item.evidenceArtifacts.length > 0))).length;
    return {
      id: campaign.id,
      name: campaign.name,
      objective: campaign.objective,
      status: campaign.status,
      owner: campaign.owner ?? "unassigned",
      actionCount: plan.actions?.length ?? numberValue(metrics.actionCount, 0),
      stages: plan.stages ?? [],
      blockers,
      readyForApproval,
      inApproval,
      evidenceReady,
      riskInScope: campaignActions.reduce((total, action) => total + action.finding.riskScore, 0),
      updatedAt: campaign.updatedAt.toISOString()
    };
  });

  const readiness = {
    connectorCoverage: percentage(configuredProviders.size, connectorRegistry.length),
    requiredConnectorCoverage: percentage(onboarding.filter((item) => item.required && item.configured).length, onboarding.filter((item) => item.required).length),
    ingestionSuccessRate: percentage(ingestionJobs.filter((job) => job.status === "COMPLETED").length, ingestionJobs.length),
    campaignExecutionReadiness: percentage(campaignBoard.reduce((total, campaign) => total + campaign.readyForApproval + campaign.inApproval + campaign.evidenceReady, 0), Math.max(1, campaignBoard.reduce((total, campaign) => total + campaign.actionCount, 0))),
    unresolvedFindings: unresolvedFindings.length,
    duplicateSourceFindings: Array.from(duplicateGroups.values()).filter((count) => count > 1).reduce((total, count) => total + count - 1, 0)
  };

  return {
    generatedAt: new Date().toISOString(),
    productName: "Remediation Twin",
    readiness,
    onboarding,
    ingestionJobs,
    campaignBoard,
    operatingModel: [
      "Connect enterprise systems with scoped, testable profiles",
      "Run ingestion jobs with durable status and row-level acceptance metrics",
      "Deduplicate findings into risk-ranked remediation work",
      "Group work into campaigns with simulation and approval state",
      "Export evidence and learn from production outcomes"
    ]
  };
}

export async function createConnectorProfile(
  tenantId: string,
  input: { provider: string; name?: string; authMode?: string; scopes?: string[]; owner?: string; environment?: string; syncCadence?: string }
) {
  const definition = connectorRegistry.find((connector) => connector.provider === input.provider);
  const config: ConnectorConfig = {
    authMode: input.authMode ?? "api_token_reference",
    scopes: input.scopes ?? definition?.operations ?? ["read"],
    owner: input.owner ?? "platform-security",
    environment: input.environment ?? "pilot",
    syncCadence: input.syncCadence ?? "daily"
  };
  const health: ConnectorHealth = {
    status: "profile_created",
    lastCheckedAt: new Date().toISOString(),
    message: "Profile registered. Run a connector health check before production execution."
  };
  return prisma.integration.upsert({
    where: { id: await findIntegrationId(tenantId, input.provider) },
    update: {
      name: input.name ?? `${input.provider} pilot connector`,
      enabled: true,
      configJson: stringifyJson(config),
      healthJson: stringifyJson(health)
    },
    create: {
      tenantId,
      provider: input.provider,
      name: input.name ?? `${input.provider} pilot connector`,
      enabled: true,
      configJson: stringifyJson(config),
      healthJson: stringifyJson(health)
    }
  });
}

export async function startIngestionJob(tenantId: string, input: { provider?: string; source?: string; recordsExpected?: number; submittedBy?: string }) {
  const provider = input.provider ?? "tenable";
  const recordsExpected = input.recordsExpected ?? 250;
  const accepted = Math.max(0, Math.floor(recordsExpected * 0.93));
  const rejected = Math.max(0, recordsExpected - accepted);
  return runConnectorOperation(tenantId, provider, "ingest_findings", {
    source: input.source ?? `${provider}-pilot-sync`,
    recordsExpected,
    submittedBy: input.submittedBy ?? "security-operations",
    recordsReceived: recordsExpected,
    recordsAccepted: accepted,
    recordsRejected: rejected,
    errorCount: rejected,
    mode: "dry_run"
  });
}

async function findIntegrationId(tenantId: string, provider: string) {
  const existing = await prisma.integration.findFirst({ where: { tenantId, provider }, select: { id: true } });
  return existing?.id ?? "__new_connector_profile__";
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function percentage(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function getConnectorNextStep(configured: boolean, enabled: boolean, config: ConnectorConfig, latestRunStatus?: string) {
  if (!configured) return "Create connection profile";
  if (!enabled) return "Enable profile";
  if (!config.authMode) return "Attach credential reference";
  if (!config.scopes?.length) return "Approve integration scopes";
  if (!latestRunStatus) return "Run health check";
  if (latestRunStatus === "FAILED") return "Review run errors";
  return "Ready for pilot ingestion";
}
