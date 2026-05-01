export type EnterpriseRole = "tenant_admin" | "security_lead" | "security_analyst" | "platform_owner" | "auditor" | "automation_service";

const permissionsByRole: Record<EnterpriseRole, string[]> = {
  tenant_admin: ["*"],
  security_lead: ["tenant:read", "asset:read", "asset:write", "finding:read", "finding:write", "simulation:read", "simulation:run", "workflow:read", "workflow:approve", "workflow:comment", "policy:read", "policy:write", "report:read", "audit:read", "automation:run", "connector:read", "connector:run", "evidence:read", "evidence:write", "auth:session", "auth:sso"],
  security_analyst: ["tenant:read", "asset:read", "finding:read", "finding:write", "simulation:read", "simulation:run", "workflow:read", "workflow:comment", "report:read", "connector:read", "evidence:read", "auth:session", "auth:sso"],
  platform_owner: ["tenant:read", "asset:read", "asset:write", "finding:read", "simulation:read", "simulation:run", "workflow:read", "workflow:approve", "automation:run", "connector:read", "connector:run", "evidence:read", "evidence:write", "report:read", "auth:session", "auth:sso"],
  auditor: ["tenant:read", "finding:read", "asset:read", "workflow:read", "evidence:read", "report:read", "audit:read", "connector:read", "policy:read", "auth:session", "auth:sso"],
  automation_service: ["tenant:read", "asset:read", "finding:read", "simulation:read", "simulation:run", "automation:run", "evidence:write", "connector:read", "connector:run", "report:read", "auth:session"]
};

export function can(role: string, permission: string) {
  const permissions = permissionsByRole[(role as EnterpriseRole) || "security_analyst"] ?? permissionsByRole.security_analyst;
  return permissions.includes("*") || permissions.includes(permission);
}

export function permissionsFor(role: string) {
  return permissionsByRole[(role as EnterpriseRole) || "security_analyst"] ?? permissionsByRole.security_analyst;
}

export function roleCatalog() {
  return Object.entries(permissionsByRole).map(([role, permissions]) => ({ role, permissions }));
}
