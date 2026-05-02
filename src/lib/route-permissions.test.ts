import { describe, expect, it } from "vitest";
import { can } from "@/domain/rbac";
import { routePermissionFor } from "@/lib/route-permissions";

describe("route permission contract", () => {
  it("enforces RBAC for core enterprise API surfaces", () => {
    expect(routePermissionFor("/api/findings", "GET")).toBe("finding:read");
    expect(routePermissionFor("/api/remediation-actions/action-1/simulate", "POST")).toBe("simulation:run");
    expect(routePermissionFor("/api/workflows/workflow-1/approvals", "POST")).toBe("workflow:approve");
    expect(routePermissionFor("/api/connectors/live", "POST")).toBe("connector:run");
    expect(routePermissionFor("/api/integrations", "GET")).toBe("connector:read");
    expect(routePermissionFor("/api/integrations", "POST")).toBe("connector:run");
    expect(routePermissionFor("/api/enterprise-readiness", "GET")).toBe("report:read");
    expect(routePermissionFor("/api/observability", "GET")).toBe("audit:read");
  });

  it("separates auditor read access from mutation access", () => {
    expect(can("auditor", routePermissionFor("/api/reports", "GET"))).toBe(true);
    expect(can("auditor", routePermissionFor("/api/policies", "POST"))).toBe(false);
    expect(can("tenant_admin", routePermissionFor("/api/policies", "POST"))).toBe(true);
  });
});
