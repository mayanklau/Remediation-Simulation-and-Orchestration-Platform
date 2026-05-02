import { describe, expect, it } from "vitest";
import { buildGoLiveModel } from "@/domain/go-live";

describe("go-live model", () => {
  it("captures the production launch path", () => {
    const model = buildGoLiveModel();
    expect(model.summary.sections).toBeGreaterThanOrEqual(10);
    expect(model.launchSequence).toContain("Deploy app and workers");
    expect(model.rollbackSequence).toContain("Rollback app image");
  });
});
