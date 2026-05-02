import { describe, expect, it } from "vitest";
import { buildProductionEffectivenessModel } from "./production-effectiveness";

describe("production effectiveness model", () => {
  it("covers schedulers, data gates, validation, and observability", () => {
    const model = buildProductionEffectivenessModel();
    expect(model.summary.schedulerLanes).toBeGreaterThanOrEqual(8);
    expect(model.summary.dataQualityControls).toBeGreaterThanOrEqual(8);
    expect(model.validationLoop.map((step) => step.id)).toContain("after_scan");
    expect(model.observabilitySignals.map((signal) => signal.id)).toContain("dead_letters");
    expect(model.operatingRules.join(" ")).toContain("residual-risk");
  });
});
