import { buildEnterpriseReadinessCatalogModel } from "@/domain/enterprise-readiness-catalog";
import { apiHandler } from "@/lib/api";

export const GET = apiHandler(async () => Response.json({ readiness: buildEnterpriseReadinessCatalogModel() }));
