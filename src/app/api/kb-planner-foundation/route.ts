import { buildKbPlannerFoundation } from "@/domain/kb-planner-foundation";
import { apiHandler } from "@/lib/api";

export const GET = apiHandler(async () => {
  return Response.json({ foundation: buildKbPlannerFoundation() });
});
