import { buildProductionExpansionModel } from "@/domain/production-expansion";
import { apiHandler } from "@/lib/api";

export const GET = apiHandler(async () => Response.json({ expansion: buildProductionExpansionModel() }));
