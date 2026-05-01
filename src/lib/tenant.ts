import { prisma } from "@/lib/prisma";

export async function getOrCreateDefaultTenant() {
  const slug = process.env.DEFAULT_TENANT_SLUG ?? "default";
  return prisma.tenant.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      name: "Default Enterprise"
    }
  });
}

export async function resolveTenantId(request: Request): Promise<string> {
  const headerTenantId = request.headers.get("x-tenant-id");
  if (headerTenantId) return headerTenantId;
  const tenant = await getOrCreateDefaultTenant();
  return tenant.id;
}
