import { describe, expect, it } from "vitest";
import { scorePathBreaker } from "@/domain/virtual-patching";

describe("virtual patching path breaker scoring", () => {
  it("prioritizes exposed paths to sensitive crown-jewel targets", () => {
    const exposed = scorePathBreaker({ sourceExposed: true, targetCriticality: 5, targetDataSensitivity: 5, hopCount: 1, riskTransfer: 80 });
    const internal = scorePathBreaker({ sourceExposed: false, targetCriticality: 2, targetDataSensitivity: 2, hopCount: 4, riskTransfer: 10 });
    expect(exposed).toBeGreaterThan(internal);
    expect(exposed).toBeLessThanOrEqual(100);
  });
});
