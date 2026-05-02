import { describe, expect, it } from "vitest";
import { buildProductionExpansionModel } from "@/domain/production-expansion";

describe("production expansion model", () => {
  it("covers the remaining enterprise product modules", () => {
    const model = buildProductionExpansionModel();
    expect(model.summary.modules).toBeGreaterThanOrEqual(15);
    expect(model.modules.map((item) => item.id)).toContain("connector_marketplace");
    expect(model.modules.map((item) => item.id)).toContain("post_remediation_validation");
    expect(model.modules.map((item) => item.id)).toContain("data_residency");
  });
});
