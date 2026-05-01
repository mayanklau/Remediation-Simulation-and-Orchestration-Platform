import { describe, expect, it } from "vitest";
import { readRuntimeConfig } from "@/lib/config";

describe("runtime config validation", () => {
  it("requires session material in production", () => {
    expect(() => readRuntimeConfig({ APP_ENV: "production", NODE_ENV: "production" })).toThrow(/SESSION_SECRET/);
  });

  it("parses feature flags", () => {
    const config = readRuntimeConfig({ APP_ENV: "staging", NODE_ENV: "production", FEATURE_AUTONOMOUS_REMEDIATION: "true" });
    expect(config.features.autonomousRemediation).toBe(true);
  });
});
