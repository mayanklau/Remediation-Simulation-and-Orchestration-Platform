export type GoLiveSection = {
  id: string;
  title: string;
  owner: string;
  required: string[];
  verification: string[];
};

export function buildGoLiveModel() {
  const sections: GoLiveSection[] = [
    section("environment", "Production Environment", "platform", ["APP_ENV=production", "NODE_ENV=production", "APP_URL", "DATABASE_URL", "SESSION_SECRET"], ["Runtime config validates", "Database migration deploy succeeds", "Health endpoint returns ok"]),
    section("identity", "Identity And Access", "security", ["OIDC_ISSUER", "OIDC_CLIENT_ID", "SSO provider metadata", "RBAC role bindings"], ["SSO start works", "Callback is accepted", "Auditor cannot mutate", "Tenant admin can configure"]),
    section("secrets", "Secrets And Keys", "security", ["SECRET_PROVIDER", "Connector secret references", "Evidence storage credential", "Customer managed key where required"], ["No raw secrets in database", "Secret references resolve", "Credential rotation plan exists"]),
    section("connectors", "Enterprise Connectors", "integrations", ["Scanner profiles", "ITSM profile", "Cloud profile", "Code security profile"], ["Dry-run health check completed", "Sync schedule defined", "Failure alert route configured"]),
    section("data", "Data And Residency", "architecture", ["Tenant region", "Retention policy", "Evidence storage URL", "Backup target"], ["Residency policy documented", "Backup/restore tested", "Evidence path isolated"]),
    section("workers", "Workers And Queues", "sre", ["WORKER_CONCURRENCY", "Ingestion lane", "Simulation lane", "Evidence lane", "Connector sync lane"], ["Worker dry-run passes", "Dead-letter handling documented", "Retry policy configured"]),
    section("observability", "Observability", "sre", ["OTEL_EXPORTER_OTLP_ENDPOINT", "ALERT_WEBHOOK_URL", "Request IDs", "Correlation IDs"], ["Traces exported", "Alerts delivered", "Runbook link published"]),
    section("security", "Security Review", "appsec", ["Threat model", "SAST", "DAST", "Container scan", "SBOM", "Pen-test signoff"], ["Critical findings closed", "Residual risk accepted", "Security approval recorded"]),
    section("release", "Release And Rollback", "devops", ["Image tag", "Migration plan", "Rollback image", "Rollback database plan"], ["Blue/green or canary tested", "Rollback tested", "Go/no-go signoff recorded"]),
    section("customer", "Customer Acceptance", "program", ["Pilot tenant", "Owner list", "Approval policy", "Evidence pack", "Executive report"], ["Smoke test passed", "Risk narrative approved", "Customer go-live signoff captured"])
  ];
  const required = sections.reduce((sum, item) => sum + item.required.length, 0);
  const verification = sections.reduce((sum, item) => sum + item.verification.length, 0);
  return {
    summary: {
      sections: sections.length,
      requiredItems: required,
      verificationItems: verification,
      launchMode: "external_values_required",
      developerRemainingWork: "Provide customer-specific environment values and deploy with the included runbook."
    },
    sections,
    launchSequence: [
      "Populate .env.production from the production example",
      "Run tests, build, dependency scan, and container scan",
      "Deploy database migrations",
      "Deploy app and workers",
      "Run connector dry checks",
      "Run smoke tests and E2E critical path checks",
      "Seal first evidence pack",
      "Capture business and security go-live signoff"
    ],
    rollbackSequence: [
      "Disable live connector schedules",
      "Route users to maintenance page or previous release",
      "Rollback app image",
      "Restore database only if migration rollback requires it",
      "Re-run health and smoke tests",
      "Publish incident and residual-risk note"
    ]
  };
}

function section(id: string, title: string, owner: string, required: string[], verification: string[]): GoLiveSection {
  return { id, title, owner, required, verification };
}
