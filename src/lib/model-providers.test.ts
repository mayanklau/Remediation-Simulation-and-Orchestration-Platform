import { describe, expect, it } from "vitest";
import { completeWithModel, configuredModelProviders, selectProvider } from "@/lib/model-providers";

const modelEnvKeys = [
  "LLM_BASE_URL",
  "LLM_API_KEY",
  "ANTHROPIC_API_KEY",
  "GEMINI_API_KEY",
  "LOCAL_SLM_URL"
];

describe("model provider abstraction", () => {
  it("always exposes deterministic fallback", () => {
    expect(configuredModelProviders().some((provider) => provider.provider === "deterministic" && provider.configured)).toBe(true);
  });

  it("falls back to deterministic when requested provider is not configured", () => {
    const original = Object.fromEntries(modelEnvKeys.map((key) => [key, process.env[key]]));
    for (const key of modelEnvKeys) delete process.env[key];
    try {
      expect(selectProvider("openai_compatible")).toBe("deterministic");
    } finally {
      for (const [key, value] of Object.entries(original)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });

  it("returns a governed deterministic plan without external credentials", async () => {
    const result = await completeWithModel({ system: "safe", prompt: "Use virtual patching" }, "deterministic");
    expect(result.usedExternalModel).toBe(false);
    expect(result.output).toContain("virtual patching");
  });
});
