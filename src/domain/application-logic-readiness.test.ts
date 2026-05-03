import { describe, expect, it } from "vitest";
import { buildApplicationLogicReadinessModel, canTransition } from "./application-logic-readiness";

describe("application logic readiness", () => {
  it("defines enforceable lifecycles, gates, and invariants", () => {
    const model = buildApplicationLogicReadinessModel();
    expect(model.summary.lifecycles).toBeGreaterThanOrEqual(6);
    expect(model.summary.transitions).toBeGreaterThanOrEqual(35);
    expect(model.summary.verdict).toBe("app_logic_ready_with_external_infra_gates");
    expect(model.lifecycles.map((item) => item.id)).toContain("remediation_action");
    expect(model.acceptanceCriteria.join(" ")).toContain("No live remediation");
  });

  it("blocks transitions when required gates are missing", () => {
    expect(canTransition("remediation_action", "PLANNED", "PENDING_APPROVAL", ["rollout_steps"]).allowed).toBe(false);
    expect(canTransition("remediation_action", "PLANNED", "PENDING_APPROVAL", ["rollout_steps", "validation_steps", "evidence_required"]).allowed).toBe(true);
  });
});
