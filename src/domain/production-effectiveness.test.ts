import { describe, expect, it } from "vitest";
import { buildProductionEffectivenessModel } from "./production-effectiveness";
import { buildProductionRealityModel } from "./production-reality";

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

describe("production reality model", () => {
  it("covers below-the-waterline production controls", () => {
    const model = buildProductionRealityModel();
    expect(model.summary.layers).toBeGreaterThanOrEqual(6);
    expect(model.summary.controls).toBeGreaterThanOrEqual(20);
    expect(model.launchBlockers).toContain("Load balancer health and timeout policy");
    expect(model.layers.flatMap((layer) => layer.controls).map((control) => control.id)).toContain("dead_letters");
  });
});
