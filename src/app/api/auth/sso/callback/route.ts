import { apiHandler, readJson } from "@/lib/api";
import { createCsrfToken, createSignedSession } from "@/lib/security";
import { resolveTenantId } from "@/lib/tenant";

export const POST = apiHandler(async (request) => {
  const tenantId = await resolveTenantId(request);
  const body = await readJson<{ email: string; name?: string; role?: string; groups?: string[] }>(request);
  const sessionToken = createSignedSession({
    tenantId,
    email: body.email,
    name: body.name ?? body.email,
    role: body.role ?? "security_analyst",
    groups: body.groups ?? []
  });
  return Response.json(
    { authenticated: true, csrf: createCsrfToken(sessionToken), source: "sso_callback" },
    { status: 201, headers: { "set-cookie": `rt_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax` } }
  );
});
