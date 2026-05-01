import { can } from "@/domain/rbac";
import { verifySignedSession } from "@/lib/security";
import { resolveTenantId } from "@/lib/tenant";

export type AuthzContext = {
  tenantId: string;
  principal: {
    email: string;
    role: string;
    groups: string[];
  };
  correlationId: string;
};

export async function requirePermission(request: Request, permission: string): Promise<AuthzContext> {
  const tenantId = await resolveTenantId(request);
  const session = verifySignedSession(readCookie(request, "rt_session"));
  const role = session?.role ?? request.headers.get("x-role") ?? "security_analyst";
  if (!can(role, permission)) {
    throw new Response(JSON.stringify({ error: "forbidden", permission }), { status: 403 });
  }
  if (session && session.tenantId !== tenantId) {
    throw new Response(JSON.stringify({ error: "tenant_boundary_violation" }), { status: 403 });
  }
  return {
    tenantId,
    principal: {
      email: session?.email ?? request.headers.get("x-user-email") ?? "local-user@example.com",
      role,
      groups: session?.groups ?? []
    },
    correlationId: request.headers.get("x-correlation-id") ?? crypto.randomUUID()
  };
}

function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}
