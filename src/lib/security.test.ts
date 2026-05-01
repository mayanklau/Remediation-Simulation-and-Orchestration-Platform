import { describe, expect, it } from "vitest";
import { checkRateLimit, createCsrfToken, createSignedSession, verifyCsrfToken, verifySignedSession } from "@/lib/security";

describe("security helpers", () => {
  it("signs sessions and rejects tampering", () => {
    const token = createSignedSession({ tenantId: "t1", email: "a@example.com", name: "A", role: "tenant_admin", groups: [] }, "secret");
    expect(verifySignedSession(token, "secret")?.email).toBe("a@example.com");
    expect(verifySignedSession(`${token}x`, "secret")).toBeNull();
  });

  it("binds csrf tokens to the session token", () => {
    const token = createSignedSession({ tenantId: "t1", email: "a@example.com", name: "A", role: "tenant_admin", groups: [] }, "secret");
    const csrf = createCsrfToken(token, "secret");
    expect(verifyCsrfToken(token, csrf, "secret")).toBe(true);
    expect(verifyCsrfToken(`${token}x`, csrf, "secret")).toBe(false);
  });

  it("enforces in-memory rate limits", () => {
    const key = `test-${Date.now()}`;
    expect(checkRateLimit(key, 1).allowed).toBe(true);
    expect(checkRateLimit(key, 1).allowed).toBe(false);
  });
});
