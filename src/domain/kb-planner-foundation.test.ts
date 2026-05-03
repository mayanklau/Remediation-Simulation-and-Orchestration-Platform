import { describe, expect, it } from "vitest";
import { buildKbPlannerFoundation } from "./kb-planner-foundation";

describe("kb planner foundation", () => {
  it("keeps MongoDB canonical and all other stores derived", () => {
    const foundation = buildKbPlannerFoundation();
    const canonical = foundation.stores.filter((store) => store.canonical);
    expect(canonical).toHaveLength(1);
    expect(canonical[0].id).toBe("mongodb");
    expect(foundation.stores.filter((store) => !store.canonical).every((store) => store.rebuildSource.includes("MongoDB"))).toBe(true);
    expect(foundation.dataContract.requiredFields).toEqual(expect.arrayContaining(["record_id", "tenant_id", "content_hash", "embedding_model_version"]));
  });

  it("enforces hybrid retrieval and deterministic planner guardrails", () => {
    const foundation = buildKbPlannerFoundation();
    expect(foundation.retrievalFacade.modes).toEqual(expect.arrayContaining(["semantic", "keyword", "graph", "temporal"]));
    expect(foundation.retrievalFacade.mergeKey).toBe("record_id");
    expect(foundation.plannerPipeline.map((stage) => stage.id)).toEqual(expect.arrayContaining(["intent", "policy", "tool_dag", "verification"]));
    expect(foundation.nonNegotiables.join(" ")).toContain("PII scrubbing");
    expect(foundation.nonNegotiables.join(" ")).toContain("Side-effecting tools require human approval");
  });
});
