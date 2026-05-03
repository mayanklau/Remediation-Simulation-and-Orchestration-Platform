import { buildApplicationLogicReadinessModel } from "@/domain/application-logic-readiness";
import { apiHandler } from "@/lib/api";

export const GET = apiHandler(async () => {
  return Response.json({ applicationLogic: buildApplicationLogicReadinessModel() });
});
