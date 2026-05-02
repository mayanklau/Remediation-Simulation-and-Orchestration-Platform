import { describe, expect, it } from "vitest";
import { createQueueJob, workerPlanForLane } from "@/domain/queue-workers";

describe("queue worker contracts", () => {
  it("creates correlated jobs for each worker lane", () => {
    const job = createQueueJob({ tenantId: "tenant-test", lane: "simulation", payload: { actionId: "a1" }, priority: "high" });
    expect(job.correlationId).toBeTruthy();
    expect(workerPlanForLane(job.lane)).toContain("compute blast radius");
    expect(workerPlanForLane("post_remediation_validation")).toContain("compare before and after risk");
    expect(workerPlanForLane("data_quality_scan")).toContain("score source freshness");
  });
});
