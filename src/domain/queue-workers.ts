export type WorkerLane = "ingestion" | "simulation" | "connector_sync" | "evidence_generation" | "report_snapshot";

export type QueueJob = {
  id: string;
  tenantId: string;
  lane: WorkerLane;
  payload: Record<string, unknown>;
  priority: "low" | "normal" | "high" | "critical";
  correlationId: string;
  createdAt: string;
};

export function createQueueJob(input: Omit<QueueJob, "id" | "createdAt" | "correlationId"> & { correlationId?: string }): QueueJob {
  return {
    ...input,
    id: crypto.randomUUID(),
    correlationId: input.correlationId ?? crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
}

export function workerPlanForLane(lane: WorkerLane) {
  const plans: Record<WorkerLane, string[]> = {
    ingestion: ["validate connector payload", "normalize source findings", "deduplicate", "upsert assets", "emit audit event"],
    simulation: ["load action context", "compute blast radius", "model rollback", "score confidence", "persist result"],
    connector_sync: ["resolve secret reference", "call connector in dry-run unless approved", "record connector run", "emit telemetry"],
    evidence_generation: ["collect before state", "attach simulation", "attach approvals", "hash seal pack"],
    report_snapshot: ["recompute metrics", "freeze analytics", "store snapshot", "route executive export"]
  };
  return plans[lane];
}
