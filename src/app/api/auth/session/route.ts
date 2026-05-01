import { apiHandler, readJson } from "@/lib/api";
import { createCsrfToken, createSignedSession, verifySignedSession } from "@/lib/security";
import { resolveTenantId } from "@/lib/tenant";

export const GET = apiHandler(async (request) => {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.match(/rt_session=([^;]+)/)?.[1];
  const session = verifySignedSession(token);
  return Response.json({ authenticated: Boolean(session), session });
});

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
  const csrf = createCsrfToken(sessionToken);
  return Response.json(
    { authenticated: true, csrf },
    {
      status: 201,
      headers: {
        "set-cookie": `rt_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax`
      }
    }
  );
});
