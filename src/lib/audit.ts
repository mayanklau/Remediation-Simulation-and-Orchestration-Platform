import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";

export async function auditLog(input: {
  tenantId: string;
  actor?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      tenantId: input.tenantId,
      actor: input.actor || "system",
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      detailsJson: stringifyJson(input.details ?? {})
    }
  });
}
