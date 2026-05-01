import { describe, expect, it } from "vitest";
import { scoreRisk, recommendedSlaDays } from "@/domain/risk";

describe("risk engine", () => {
  it("prioritizes exposed exploited production assets", () => {
    const result = scoreRisk({
      severity: "CRITICAL",
      exploitAvailable: true,
      activeExploitation: true,
      patchAvailable: true,
      compensatingControls: "",
      asset: {
        criticality: 5,
        dataSensitivity: 5,
        internetExposure: true,
        environment: "PRODUCTION"
      }
    });
    expect(result.riskScore).toBeGreaterThanOrEqual(95);
    expect(result.businessRiskScore).toBe(100);
    expect(recommendedSlaDays(result.riskScore)).toBe(3);
  });

  it("reduces urgency when compensating controls exist", () => {
    const withControls = scoreRisk({
      severity: "HIGH",
      exploitAvailable: false,
      activeExploitation: false,
      patchAvailable: false,
      compensatingControls: "WAF and private network segmentation",
      asset: {
        criticality: 3,
        dataSensitivity: 3,
        internetExposure: false,
        environment: "STAGING"
      }
    });
    expect(withControls.riskScore).toBeLessThan(70);
  });
});
