export type EnterpriseRole = "tenant_admin" | "security_lead" | "security_analyst" | "platform_owner" | "auditor" | "automation_service";

const permissionsByRole: Record<EnterpriseRole, string[]> = {
  tenant_admin: ["*"],
  security_lead: ["finding:read", "finding:write", "simulation:run", "workflow:approve", "policy:write", "report:read", "automation:run"],
  security_analyst: ["finding:read", "finding:write", "simulation:run", "workflow:comment", "report:read"],
  platform_owner: ["asset:read", "simulation:read", "workflow:approve", "automation:run", "evidence:write"],
  auditor: ["finding:read", "asset:read", "workflow:read", "evidence:read", "report:read", "audit:read"],
  automation_service: ["simulation:run", "automation:run", "evidence:write", "connector:run"]
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
