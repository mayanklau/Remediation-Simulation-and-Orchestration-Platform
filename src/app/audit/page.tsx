import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

type AuditEvent = {
  id: string;
  at: Date;
  type: string;
  actor: string;
  title: string;
  status: string;
};

export default async function AuditPage() {
  const tenant = await getOrCreateDefaultTenant();
  const [auditLogs, connectorRuns, automationRuns, reportSnapshots] = await Promise.all([
    prisma.auditLog.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.connectorRun.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 25 }),
    prisma.automationRun.findMany({ where: { tenantId: tenant.id }, include: { policy: true }, orderBy: { createdAt: "desc" }, take: 25 }),
    prisma.reportSnapshot.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 25 })
  ]);
  const remediationActions = await prisma.remediationAction.findMany({
    where: { tenantId: tenant.id, id: { in: automationRuns.map((run) => run.remediationActionId).filter(Boolean) as string[] } },
    select: { id: true, title: true }
  });
  const actionTitles = new Map(remediationActions.map((action) => [action.id, action.title]));

  const events: AuditEvent[] = [
    ...auditLogs.map((log) => ({ id: log.id, at: log.createdAt, type: log.entityType, actor: log.actor, title: `${log.action} ${log.entityType}`, status: log.entityId })),
    ...connectorRuns.map((run) => ({ id: run.id, at: run.startedAt ?? run.createdAt, type: "connector", actor: run.provider, title: `${run.operation} ingestion`, status: run.status })),
    ...automationRuns.map((run) => ({
      id: run.id,
      at: run.createdAt,
      type: "automation",
      actor: run.policy?.name ?? run.approvalMode,
      title: run.remediationActionId ? actionTitles.get(run.remediationActionId) ?? run.runType : run.runType,
      status: run.status
    })),
    ...reportSnapshots.map((report) => ({ id: report.id, at: report.createdAt, type: "report", actor: report.createdBy ?? "system", title: report.name, status: report.type }))
  ].sort((left, right) => right.at.getTime() - left.at.getTime());

  return (
    <>
      <PageHeader eyebrow="Control plane evidence" title="Audit Timeline" description="Unified audit history for ingestion, simulation, approval, automation, reporting, and governance events." />

      <div className="panel">
        {events.length === 0 ? (
          <EmptyState title="No audit events yet" description="Run ingestion, simulations, workflows, reports, or automation to populate the enterprise audit timeline." />
        ) : (
          <div className="timeline">
            {events.slice(0, 80).map((event) => (
              <div className="timeline-item" key={`${event.type}-${event.id}`}>
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.actor} / {event.at.toLocaleString()}</p>
                </div>
                <StatusBadge value={event.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
