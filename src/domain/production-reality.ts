export type ProductionRealityStatus = "implemented" | "ready_to_wire" | "external_required";

export type ProductionRealityControl = {
  id: string;
  name: string;
  status: ProductionRealityStatus;
  evidence: string;
  gap: string;
};

export type ProductionRealityLayer = {
  id: string;
  name: string;
  owner: string;
  purpose: string;
  controls: ProductionRealityControl[];
};

export function buildProductionRealityModel() {
  const layers: ProductionRealityLayer[] = [
    layer("runtime", "Runtime And Container Hardening", "platform", "Make API, web, and workers safe to run under production orchestration.", [
      control("non_root_images", "Non-root container images", "ready_to_wire", "Dockerfile contracts and security scan gate", "wire final base images and registry policy"),
      control("health_probes", "Liveness, readiness, and startup probes", "implemented", "health endpoint and go-live probe contracts", "map probes into Helm/Kubernetes manifests"),
      control("graceful_shutdown", "Graceful worker and API shutdown", "ready_to_wire", "worker lane idempotency and retry model", "attach signal handling to deployed process manager"),
      control("resource_limits", "CPU and memory requests/limits", "ready_to_wire", "deployment sizing model", "set per-customer limits after load test")
    ]),
    layer("networking", "Networking, Edge, And Rate Limits", "sre", "Protect public APIs, internal services, web sockets, and connector traffic.", [
      control("rate_limits", "Tenant-aware rate limiting", "ready_to_wire", "route permission map and request IDs", "deploy Redis or gateway-backed counters"),
      control("waf", "WAF and virtual patch policy", "implemented", "virtual patching module and path-breaker controls", "wire customer WAF provider"),
      control("load_balancer", "Load balancer health and timeout policy", "external_required", "go-live checklist", "configure in target cloud"),
      control("egress_allowlist", "Connector egress allowlist", "ready_to_wire", "connector catalog and endpoint fields", "enforce at network boundary")
    ]),
    layer("data", "Database, Storage, Backup, And DR", "data-platform", "Keep tenant data durable, recoverable, indexed, and region-safe.", [
      control("migrations", "Schema migrations and index checks", "implemented", "Prisma migration and Mongo index contracts", "run against customer staging database"),
      control("backup_restore", "Backup and restore runbooks", "ready_to_wire", "go-live rollback sequence", "attach managed database snapshots and restore tests"),
      control("object_storage", "Immutable evidence object storage", "external_required", "evidence pack model", "configure customer bucket, retention, and KMS"),
      control("data_residency", "Data residency policy", "ready_to_wire", "enterprise readiness catalog", "bind tenant to allowed regions")
    ]),
    layer("async", "Queues, Schedulers, And Dead Letters", "platform", "Move long work out of the request path with replayable, correlated jobs.", [
      control("worker_lanes", "Dedicated ingestion, simulation, connector, evidence, and report lanes", "implemented", "production effectiveness worker contracts", "run workers as independent processes"),
      control("dead_letters", "Dead-letter queues with replay policy", "ready_to_wire", "dead-letter operating rule", "wire queue provider and replay admin action"),
      control("idempotency", "Idempotency keys and correlation IDs", "implemented", "lane contracts and audit correlation IDs", "enforce at queue persistence layer"),
      control("backpressure", "Backpressure and burst handling", "ready_to_wire", "queue-depth signal model", "connect queue metrics to autoscaling")
    ]),
    layer("observability", "Logging, Metrics, Traces, And SLOs", "sre", "Make production failures measurable and actionable.", [
      control("structured_logs", "Structured logs with request and audit correlation", "implemented", "observability page and middleware IDs", "ship logs to customer SIEM"),
      control("otel_traces", "OpenTelemetry traces", "ready_to_wire", "OTEL endpoint config flag", "configure collector and sampling"),
      control("slo_burn", "SLO and error-budget burn alerts", "external_required", "production effectiveness signal catalog", "define customer SLO targets and alert routes"),
      control("runbooks", "Incident and rollback runbooks", "implemented", "go-live and production ops runbooks", "customer tabletop exercise")
    ]),
    layer("release", "CI/CD, Security Gates, And Rollback", "devsecops", "Prevent unsafe releases and make rollback boring.", [
      control("quality_gates", "Lint, typecheck, tests, build, dependency and container scans", "implemented", "CI/CD quality gate model", "enable branch protection in GitHub"),
      control("progressive_delivery", "Canary or blue-green rollout", "ready_to_wire", "automation hook catalog", "wire Kubernetes or cloud deployment strategy"),
      control("secret_rotation", "Secret rotation and external secret manager", "external_required", "secret reference-only connector profiles", "connect customer vault"),
      control("release_evidence", "Release evidence and customer acceptance", "implemented", "reports, audit, evidence packs, go-live signoff", "capture final customer signoff")
    ])
  ];

  const controls = layers.flatMap((item) => item.controls);
  const implemented = controls.filter((item) => item.status === "implemented").length;
  const readyToWire = controls.filter((item) => item.status === "ready_to_wire").length;
  const externalRequired = controls.filter((item) => item.status === "external_required").length;

  return {
    summary: {
      layers: layers.length,
      controls: controls.length,
      implemented,
      readyToWire,
      externalRequired,
      productionRealityScore: Math.round(((implemented + readyToWire * 0.65) / controls.length) * 100),
      posture: externalRequired > 0 ? "production_capable_customer_infra_required" : "production_ready",
      belowWaterlineClosed: implemented + readyToWire
    },
    layers,
    launchBlockers: controls.filter((item) => item.status === "external_required").map((item) => item.name),
    nextActions: [
      "Run the full stack in staging with production environment validation enabled.",
      "Attach managed database, queue, cache, object storage, secret manager, telemetry collector, and alert routes.",
      "Run load, soak, backup-restore, failover, and rollback drills before live remediation execution.",
      "Keep live execution dry-run or approval-gated until customer identity, secrets, and change policies are configured."
    ]
  };
}

function layer(id: string, name: string, owner: string, purpose: string, controls: ProductionRealityControl[]): ProductionRealityLayer {
  return { id, name, owner, purpose, controls };
}

function control(id: string, name: string, status: ProductionRealityStatus, evidence: string, gap: string): ProductionRealityControl {
  return { id, name, status, evidence, gap };
}
