import { describe, expect, it } from "vitest";
import { buildCyberRiskIntelligenceModel } from "./cyber-risk-intelligence";

describe("cyber risk intelligence model", () => {
  it("covers advanced subject-matter production features", () => {
    const model = buildCyberRiskIntelligenceModel();
    const ids = model.capabilities.map((capability) => capability.id);
    expect(ids).toContain("exploit_intel_fusion");
    expect(ids).toContain("business_service_graph");
    expect(ids).toContain("control_effectiveness");
    expect(ids).toContain("exception_governance");
    expect(model.economics.map((metric) => metric.id)).toContain("risk_reduced_per_hour");
    expect(model.summary.capabilities).toBeGreaterThanOrEqual(14);
  });
});
