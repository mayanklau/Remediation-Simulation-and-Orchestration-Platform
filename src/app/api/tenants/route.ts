import { apiHandler, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async () => {
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json({ tenants });
});

export const POST = apiHandler(async (request) => {
  const body = await readJson<{ name: string; slug: string }>(request);
  const tenant = await prisma.tenant.create({
    data: {
      name: body.name,
      slug: body.slug
    }
  });
  return Response.json({ tenant }, { status: 201 });
});
