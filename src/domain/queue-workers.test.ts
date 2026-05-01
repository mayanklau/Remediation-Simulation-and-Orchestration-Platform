import { describe, expect, it } from "vitest";
import { createQueueJob, workerPlanForLane } from "@/domain/queue-workers";

describe("queue worker contracts", () => {
  it("creates correlated jobs for each worker lane", () => {
    const job = createQueueJob({ tenantId: "tenant-test", lane: "simulation", payload: { actionId: "a1" }, priority: "high" });
    expect(job.correlationId).toBeTruthy();
    expect(workerPlanForLane(job.lane)).toContain("compute blast radius");
  });
});
