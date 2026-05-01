import { createExecutionHook } from "@/domain/automation";
import { createOrRefreshCampaign } from "@/domain/campaigns";
import { connectorRegistry, runConnectorOperation } from "@/domain/connectors";
import { ensureDefaultPolicies, runContinuousSimulation } from "@/domain/governance";
import { buildPilotControlPlane } from "@/domain/pilot-control-plane";
import { buildExecutiveReport } from "@/domain/reporting";
import { buildEnterpriseMaturityModel } from "@/domain/enterprise-maturity";
import { parseJsonObject, stringifyJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

const completionControls = [
  { id: "database", title: "Database and migrations", target: "Postgres-ready Prisma deployment with migration deploy command.", env: ["DATABASE_URL"] },
  { id: "identity", title: "Auth, SSO, and RBAC", target: "OIDC/SAML readiness, tenant-scoped role bindings, and access audit records.", env: ["APP_URL", "SESSION_SECRET"] },
  { id: "secrets", title: "Connector secret references", target: "No raw secrets in tables; connector profiles reference external secret storage.", env: ["SECRET_PROVIDER"] },
  { id: "workers", title: "Background workers", target: "Ingestion, simulation, evidence, and automation work tracked as durable runs.", env: ["WORKER_CONCURRENCY"] },
  { id: "integrations", title: "Live integration runway", target: "Jira, GitHub, ServiceNow, scanner, Kubernetes, cloud, and IAM dry-run hooks.", env: ["JIRA_BASE_URL", "GITHUB_APP_ID", "SERVICENOW_INSTANCE_URL"] },
  { id: "policy", title: "Executable policy runtime", target: "Auto-approval, freeze windows, evidence gates, and crown-jewel controls.", env: [] },
  { id: "evidence", title: "Evidence vault and retention", target: "Evidence packs, validation records, retention controls, and compliance exports.", env: ["EVIDENCE_STORAGE_URL"] },
  { id: "observability", title: "Observability and operations", target: "Health checks, audit logs, run records, metrics readiness, and alert routing.", env: ["OTEL_EXPORTER_OTLP_ENDPOINT", "ALERT_WEBHOOK_URL"] },
  { id: "deployment", title: "Enterprise deployment", target: "Docker, production compose, environment contract, and runbooks.", env: ["APP_URL"] },
  { id: "security", title: "Security hardening", target: "Security headers, tenant isolation, RBAC catalog, audit trail, and dry-run guardrails.", env: [] }
];

const productionPolicies = [
  {
    name: "Production execution requires live credential attestation",
    policyType: "execution_guardrail",
    enforcementMode: "enforced",
    rules: { requireSecretReference: true, requireDryRunBeforeLive: true, requireOperatorApproval: true }
  },
  {
    name: "Immutable evidence retention policy",
    policyType: "retention",
    enforcementMode: "enforced",
    rules: { defaultRetentionDays: 2555, regulatedRetentionDays: 3650, hashChainRequired: true }
  },
  {
    name: "Tenant boundary enforcement",
    policyType: "tenant_isolation",
    enforcementMode: "enforced",
    rules: { requireTenantScopeOnApi: true, denyCrossTenantLookup: true, auditDeniedAccess: true }
  },
  {
    name: "Production observability minimums",
    policyType: "observability",
    enforcementMode: "advisory",
    rules: { requireTraceId: true, requireJobMetrics: true, alertOnFailedConnectorRuns: true }
  }
];

const finalHooks = [
  { name: "Queue worker ingestion lane", hookType: "worker", config: { queue: "ingestion", concurrencyEnv: "WORKER_CONCURRENCY", retry: { attempts: 3, backoff: "exponential" } } },
  { name: "Queue worker simulation lane", hookType: "worker", config: { queue: "simulation", concurrencyEnv: "WORKER_CONCURRENCY", retry: { attempts: 2, backoff: "linear" } } },
  { name: "Queue worker evidence lane", hookType: "worker", config: { queue: "evidence", storage: "external_object_store", hashChain: true } },
  { name: "Queue worker connector sync lane", hookType: "worker", config: { queue: "connectors", rateLimitAware: true, paginationAware: true } },
  { name: "Production rollback coordinator", hookType: "rollback", config: { requireBeforeState: true, requireOwnerNotify: true, dryRunDefault: true } }
];

export async function buildFinalProductionModel(tenantId: string) {
  const [maturity, pilot, policies, hooks, integrations, connectorRuns, automationRuns, reports, audits, evidence, sso, roleBindings] = await Promise.all([
    buildEnterpriseMaturityModel(tenantId),
    buildPilotControlPlane(tenantId),
    prisma.policy.findMany({ where: { tenantId } }),
    prisma.executionHook.findMany({ where: { tenantId } }),
    prisma.integration.findMany({ where: { tenantId } }),
    prisma.connectorRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.automationRun.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.reportSnapshot.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.auditLog.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.evidenceArtifact.findMany({ where: { tenantId }, take: 300 }),
    prisma.ssoConfiguration.findMany({ where: { tenantId } }),
    prisma.roleBinding.findMany({ where: { tenantId } })
  ]);

  const env = environmentReadiness();
  const activePolicies = policies.filter((policy) => policy.enabled);
  const controls = completionControls.map((control) => {
    const envReady = control.env.length === 0 || control.env.every((name) => env.variables[name]?.configured);
    const score = scoreControl(control.id, {
      maturityScore: maturity.overallScore,
      pilotScore: pilot.overallReadiness,
      activePolicies,
      hooks,
      integrations,
      connectorRuns,
      automationRuns,
      reports,
      audits,
      evidence,
      sso,
      roleBindings,
      envReady
    });
    return {
      ...control,
      score,
      status: score >= 90 ? "complete" : score >= 70 ? "production_ready" : score >= 45 ? "pilot_ready" : "needs_external_setup",
      envReady
    };
  });

  const completionScore = Math.round(controls.reduce((sum, control) => sum + control.score, 0) / controls.length);
  return {
    generatedAt: new Date().toISOString(),
    completionScore,
    status: completionScore >= 90 ? "enterprise_deployable" : completionScore >= 75 ? "production_ready_with_external_setup" : "pilot_ready",
    controls,
    environment: env,
    metrics: {
      enterpriseMaturity: maturity.overallScore,
      pilotReadiness: pilot.overallReadiness,
      policies: activePolicies.length,
      hooks: hooks.length,
      integrations: integrations.length,
      connectorRuns: connectorRuns.length,
      automationRuns: automationRuns.length,
      evidenceArtifacts: evidence.length,
      reports: reports.length,
      auditEvents: audits.length,
      ssoProviders: sso.length,
      roleBindings: roleBindings.length
    },
    deploymentRunbook: [
      "Set production environment variables from .env.example.",
      "Use Postgres for DATABASE_URL and run npm run db:deploy.",
      "Run the app image with NODE_ENV=production and APP_URL set to the public URL.",
      "Configure external secret references for every live connector.",
      "Keep execution hooks in dry-run until policy approvals and credentials are verified.",
      "Turn on worker lanes for ingestion, simulation, evidence, connector sync, and rollback coordination.",
      "Export evidence and audit records to immutable storage for regulated tenants."
    ],
    externalSetupRemaining: Object.entries(env.variables)
      .filter(([, value]) => !value.configured && value.requiredForProduction)
      .map(([name]) => name),
    policies: activePolicies.map((policy) => ({
      name: policy.name,
      type: policy.policyType,
      mode: policy.enforcementMode,
      rules: parseJsonObject(policy.rulesJson, {})
    }))
  };
}

export async function finalizeProductionReadiness(tenantId: string) {
  const policies = [];
  for (const policy of productionPolicies) {
    policies.push(
      await prisma.policy.upsert({
        where: { tenantId_name: { tenantId, name: policy.name } },
        update: {
          policyType: policy.policyType,
          enforcementMode: policy.enforcementMode,
          enabled: true,
          rulesJson: stringifyJson(policy.rules)
        },
        create: {
          tenantId,
          name: policy.name,
          policyType: policy.policyType,
          enforcementMode: policy.enforcementMode,
          enabled: true,
          rulesJson: stringifyJson(policy.rules)
        }
      })
    );
  }

  const hooks = [];
  for (const hook of finalHooks) {
    hooks.push(await createExecutionHook(tenantId, hook));
  }

  const connectorRuns = [];
  for (const connector of connectorRegistry.slice(0, 6)) {
    connectorRuns.push(await runConnectorOperation(tenantId, connector.provider, connector.operations[0], { mode: "production_readiness_check", dryRun: true }));
  }

  const [continuousSimulation, report, campaign, sso, roleBindings] = await Promise.all([
    runContinuousSimulation(tenantId, 10),
    buildExecutiveReport(tenantId, "final-production-readiness"),
    createOrRefreshCampaign(tenantId, {
      name: "Final production readiness closure",
      objective: "Close deployment, security, identity, worker, evidence, policy, and observability readiness for enterprise launch.",
      owner: "security-platform",
      criteria: { requireProductionControls: true, requireDryRunVerification: true }
    }),
    prisma.ssoConfiguration.upsert({
      where: { tenantId_provider: { tenantId, provider: "oidc" } },
      update: {
        enabled: false,
        entityId: "remediation-twin",
        callbackUrl: "/api/sso/callback",
        settingsJson: stringifyJson({ mode: "production_ready", scim: "supported_by_contract", sessionHardening: true })
      },
      create: {
        tenantId,
        provider: "oidc",
        enabled: false,
        entityId: "remediation-twin",
        callbackUrl: "/api/sso/callback",
        settingsJson: stringifyJson({ mode: "production_ready", scim: "supported_by_contract", sessionHardening: true })
      }
    }),
    upsertFinalRoleBindings(tenantId)
  ]);

  await prisma.auditLog.create({
    data: {
      tenantId,
      actor: "system",
      action: "final_production_readiness_completed",
      entityType: "production_readiness",
      entityId: tenantId,
      detailsJson: stringifyJson({
        policies: policies.length,
        hooks: hooks.length,
        connectorRuns: connectorRuns.length,
        report: report.id,
        campaign: campaign.id,
        sso: sso.provider,
        roleBindings: roleBindings.length,
        continuousSimulation
      })
    }
  });

  return { policies, hooks, connectorRuns, continuousSimulation, report, campaign, sso, roleBindings };
}

function environmentReadiness() {
  const required = ["DATABASE_URL", "APP_URL", "SESSION_SECRET", "SECRET_PROVIDER", "WORKER_CONCURRENCY", "EVIDENCE_STORAGE_URL"];
  const optional = ["OTEL_EXPORTER_OTLP_ENDPOINT", "ALERT_WEBHOOK_URL", "JIRA_BASE_URL", "GITHUB_APP_ID", "SERVICENOW_INSTANCE_URL"];
  const variables = Object.fromEntries(
    [...required, ...optional].map((name) => [
      name,
      {
        configured: Boolean(process.env[name]),
        requiredForProduction: required.includes(name)
      }
    ])
  );
  const configuredRequired = required.filter((name) => variables[name].configured).length;
  return {
    mode: process.env.NODE_ENV ?? "development",
    requiredConfigured: configuredRequired,
    requiredTotal: required.length,
    score: Math.round((configuredRequired / required.length) * 100),
    variables
  };
}

function scoreControl(
  id: string,
  context: {
    maturityScore: number;
    pilotScore: number;
    activePolicies: unknown[];
    hooks: unknown[];
    integrations: unknown[];
    connectorRuns: unknown[];
    automationRuns: unknown[];
    reports: unknown[];
    audits: unknown[];
    evidence: unknown[];
    sso: unknown[];
    roleBindings: unknown[];
    envReady: boolean;
  }
) {
  const envBonus = context.envReady ? 20 : 0;
  const scores: Record<string, number> = {
    database: 70 + envBonus,
    identity: Math.min(100, context.sso.length * 25 + context.roleBindings.length * 10 + envBonus),
    secrets: Math.min(100, context.integrations.length * 8 + envBonus),
    workers: Math.min(100, context.hooks.length * 8 + context.automationRuns.length * 2 + envBonus),
    integrations: Math.min(100, context.integrations.length * 8 + context.connectorRuns.length * 2 + envBonus),
    policy: Math.min(100, context.activePolicies.length * 10),
    evidence: Math.min(100, context.evidence.length * 3 + context.reports.length * 5 + envBonus),
    observability: Math.min(100, context.audits.length * 2 + context.connectorRuns.length + envBonus),
    deployment: Math.min(100, 60 + envBonus + Number(context.maturityScore >= 80) * 10 + Number(context.pilotScore >= 80) * 10),
    security: Math.min(100, context.activePolicies.length * 7 + context.roleBindings.length * 7 + Number(context.audits.length > 0) * 20)
  };
  return scores[id] ?? 0;
}

async function upsertFinalRoleBindings(tenantId: string) {
  return Promise.all(
    [
      { subjectType: "group", subject: "tenant-admins", role: "tenant_admin", scope: "tenant" },
      { subjectType: "group", subject: "security-leads", role: "security_lead", scope: "tenant" },
      { subjectType: "group", subject: "platform-owners", role: "platform_owner", scope: "asset" },
      { subjectType: "group", subject: "auditors", role: "auditor", scope: "tenant" },
      { subjectType: "service", subject: "automation-worker", role: "automation_service", scope: "tenant" }
    ].map((binding) =>
      prisma.roleBinding.upsert({
        where: { tenantId_subjectType_subject_role_scope: { tenantId, ...binding } },
        update: { constraintsJson: stringifyJson({ source: "final_production_readiness" }) },
        create: { tenantId, ...binding, constraintsJson: stringifyJson({ source: "final_production_readiness" }) }
      })
    )
  );
}
