import { apiHandler, readJson } from "@/lib/api";
import { can, permissionsFor, roleCatalog } from "@/domain/rbac";

export const GET = apiHandler(async () => Response.json({ roles: roleCatalog() }));

export const POST = apiHandler(async (request) => {
  const body = await readJson<{ role: string; permission: string }>(request);
  return Response.json({ allowed: can(body.role, body.permission), permissions: permissionsFor(body.role) });
});
