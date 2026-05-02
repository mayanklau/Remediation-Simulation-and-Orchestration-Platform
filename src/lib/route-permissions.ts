export type RoutePermission = {
  pattern: RegExp;
  methods: string[];
  permission: string;
};

const allMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const routePermissions: RoutePermission[] = [
  { pattern: /^\/api\/auth\/session$/, methods: allMethods, permission: "auth:session" },
  { pattern: /^\/api\/auth\/sso\/(start|callback)$/, methods: allMethods, permission: "auth:sso" },
  { pattern: /^\/api\/tenants$/, methods: ["GET"], permission: "tenant:read" },
  { pattern: /^\/api\/tenants$/, methods: ["POST"], permission: "tenant:write" },
  { pattern: /^\/api\/assets(\/.+)?$/, methods: ["GET"], permission: "asset:read" },
  { pattern: /^\/api\/assets(\/.+)?$/, methods: ["POST", "PATCH", "PUT", "DELETE"], permission: "asset:write" },
  { pattern: /^\/api\/asset-graph$/, methods: ["GET"], permission: "asset:read" },
  { pattern: /^\/api\/findings(\/.+)?$/, methods: ["GET"], permission: "finding:read" },
  { pattern: /^\/api\/findings(\/.+)?$/, methods: ["POST", "PATCH", "PUT", "DELETE"], permission: "finding:write" },
  { pattern: /^\/api\/ingest\/.+$/, methods: allMethods, permission: "connector:run" },
  { pattern: /^\/api\/mock-ingest$/, methods: allMethods, permission: "connector:run" },
  { pattern: /^\/api\/integrations$/, methods: ["GET"], permission: "connector:read" },
  { pattern: /^\/api\/integrations$/, methods: ["POST"], permission: "connector:run" },
  { pattern: /^\/api\/connectors\/.+$/, methods: ["GET"], permission: "connector:read" },
  { pattern: /^\/api\/connectors\/.+$/, methods: ["POST"], permission: "connector:run" },
  { pattern: /^\/api\/remediation-actions(\/.+)?$/, methods: ["GET"], permission: "finding:read" },
  { pattern: /^\/api\/remediation-actions\/.+\/simulate$/, methods: ["POST"], permission: "simulation:run" },
  { pattern: /^\/api\/remediation-actions\/.+\/plan$/, methods: ["POST"], permission: "simulation:run" },
  { pattern: /^\/api\/remediation-actions\/.+\/workflow$/, methods: ["POST"], permission: "workflow:approve" },
  { pattern: /^\/api\/simulations(\/.+)?$/, methods: allMethods, permission: "simulation:read" },
  { pattern: /^\/api\/workflows(\/.+)?$/, methods: ["GET"], permission: "workflow:read" },
  { pattern: /^\/api\/workflows\/.+\/comments$/, methods: ["POST"], permission: "workflow:comment" },
  { pattern: /^\/api\/workflows\/.+\/approvals$/, methods: ["POST"], permission: "workflow:approve" },
  { pattern: /^\/api\/workflows\/.+\/evidence$/, methods: ["GET"], permission: "evidence:read" },
  { pattern: /^\/api\/workflows\/.+\/evidence$/, methods: ["POST"], permission: "evidence:write" },
  { pattern: /^\/api\/approvals\/.+\/decision$/, methods: ["POST"], permission: "workflow:approve" },
  { pattern: /^\/api\/evidence\/.+$/, methods: ["GET"], permission: "evidence:read" },
  { pattern: /^\/api\/evidence\/.+$/, methods: ["POST"], permission: "evidence:write" },
  { pattern: /^\/api\/reports$/, methods: ["GET", "POST"], permission: "report:read" },
  { pattern: /^\/api\/dashboard$/, methods: ["GET"], permission: "report:read" },
  { pattern: /^\/api\/attack-paths$/, methods: ["GET"], permission: "finding:read" },
  { pattern: /^\/api\/attack-paths$/, methods: ["POST"], permission: "report:read" },
  { pattern: /^\/api\/cyber-risk-intelligence$/, methods: ["GET"], permission: "report:read" },
  { pattern: /^\/api\/virtual-patching$/, methods: ["GET"], permission: "finding:read" },
  { pattern: /^\/api\/virtual-patching$/, methods: ["POST"], permission: "automation:run" },
  { pattern: /^\/api\/policies$/, methods: ["GET"], permission: "policy:read" },
  { pattern: /^\/api\/policies$/, methods: ["POST"], permission: "policy:write" },
  { pattern: /^\/api\/agentic$/, methods: ["GET"], permission: "report:read" },
  { pattern: /^\/api\/agentic$/, methods: ["POST"], permission: "automation:run" },
  { pattern: /^\/api\/automation\/.+$/, methods: allMethods, permission: "automation:run" },
  { pattern: /^\/api\/workers\/.+$/, methods: allMethods, permission: "automation:run" },
  { pattern: /^\/api\/governance\/.+$/, methods: ["GET"], permission: "report:read" },
  { pattern: /^\/api\/governance\/.+$/, methods: ["POST"], permission: "automation:run" },
  { pattern: /^\/api\/observability$/, methods: ["GET", "POST"], permission: "audit:read" },
  { pattern: /^\/api\/rbac\/.+$/, methods: ["GET", "POST"], permission: "tenant:read" },
  { pattern: /^\/api\/sso$/, methods: ["GET"], permission: "tenant:read" },
  { pattern: /^\/api\/sso$/, methods: ["POST"], permission: "tenant:write" },
  { pattern: /^\/api\/enterprise-maturity$/, methods: ["GET", "POST"], permission: "report:read" },
  { pattern: /^\/api\/enterprise-readiness$/, methods: ["GET"], permission: "report:read" },
  { pattern: /^\/api\/pilot-readiness$/, methods: ["GET", "POST"], permission: "report:read" },
  { pattern: /^\/api\/pilot-control-plane$/, methods: ["GET", "POST"], permission: "report:read" },
  { pattern: /^\/api\/operating-system$/, methods: ["GET", "POST"], permission: "report:read" },
  { pattern: /^\/api\/final-production$/, methods: ["GET", "POST"], permission: "report:read" },
  { pattern: /^\/api\/production-expansion$/, methods: ["GET"], permission: "report:read" },
  { pattern: /^\/api\/production-effectiveness$/, methods: ["GET"], permission: "report:read" },
  { pattern: /^\/api\/go-live$/, methods: ["GET"], permission: "report:read" },
  { pattern: /^\/api\/copilot$/, methods: ["POST"], permission: "automation:run" }
];

export function routePermissionFor(pathname: string, method: string) {
  return routePermissions.find((route) => route.pattern.test(pathname) && route.methods.includes(method.toUpperCase()))?.permission ?? "tenant:read";
}
