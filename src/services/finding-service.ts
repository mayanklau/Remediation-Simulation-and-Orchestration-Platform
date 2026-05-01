import { z } from "zod";
import { listFindings } from "@/repositories/finding-repository";

export const findingListQuerySchema = z.object({
  tenantId: z.string().min(1),
  status: z.string().optional(),
  severity: z.string().optional(),
  limit: z.number().int().min(1).max(500).default(200)
});

export async function getFindingList(input: unknown) {
  const query = findingListQuerySchema.parse(input);
  return listFindings(query);
}
