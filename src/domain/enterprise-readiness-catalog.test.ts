import { describe, expect, it } from "vitest";
import { buildEnterpriseReadinessCatalogModel } from "@/domain/enterprise-readiness-catalog";

describe("enterprise readiness catalog", () => {
  it("covers the once-and-for-all enterprise bar", () => {
    const model = buildEnterpriseReadinessCatalogModel();
    expect(model.summary.categories).toBeGreaterThanOrEqual(17);
    expect(model.summary.controls).toBeGreaterThanOrEqual(60);
    expect(model.summary.finalBar).toContain("dry-run by default");
  });
});
