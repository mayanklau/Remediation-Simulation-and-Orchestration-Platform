import { describe, expect, it } from "vitest";
import { buildApplicationLogicReadinessModel, canTransition } from "./application-logic-readiness";

describe("application logic readiness", () => {
  it("defines enforceable lifecycles, gates, and invariants", () => {
    const model = buildApplicationLogicReadinessModel();
    expect(model.summary.lifecycles).toBeGreaterThanOrEqual(20);
    expect(model.summary.transitions).toBeGreaterThanOrEqual(120);
    expect(model.summary.verdict).toBe("app_logic_ready_with_external_infra_gates");
    expect(model.lifecycles.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        "remediation_action",
        "policy_conflict",
        "connector_certification",
        "validation_reopen",
        "customer_pilot",
        "agentic_action",
        "production_operations"
      ])
    );
    expect(model.acceptanceCriteria.join(" ")).toContain("No live remediation");
  });

  it("blocks transitions when required gates are missing", () => {
    expect(canTransition("remediation_action", "PLANNED", "PENDING_APPROVAL", ["rollout_steps"]).allowed).toBe(false);
    expect(canTransition("remediation_action", "PLANNED", "PENDING_APPROVAL", ["rollout_steps", "validation_steps", "evidence_required"]).allowed).toBe(true);
    expect(canTransition("policy_conflict", "PRIORITIZED", "RESOLVED", ["winning_policy", "reason"]).allowed).toBe(false);
    expect(canTransition("policy_conflict", "PRIORITIZED", "RESOLVED", ["winning_policy", "reason", "test_result"]).allowed).toBe(true);
    expect(canTransition("customer_pilot", "SECURITY_REVIEWED", "SIGNED_OFF", ["success_metrics"]).allowed).toBe(false);
    expect(canTransition("customer_pilot", "SECURITY_REVIEWED", "SIGNED_OFF", ["success_metrics", "sponsor_approval"]).allowed).toBe(true);
  });
});
