import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export default async function SettingsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const [users, teams, auditLogs] = await Promise.all([
    prisma.user.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.team.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.auditLog.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 25 })
  ]);

  return (
    <>
      <PageHeader eyebrow="Administration" title="Settings" description="Tenant configuration, ownership, teams, roles, audit logs, and enterprise controls." />
      <div className="grid cols-2">
        <div className="panel">
          <h2>Tenant</h2>
          <table className="table">
            <tbody>
              <tr>
                <td>Name</td>
                <td>{tenant.name}</td>
              </tr>
              <tr>
                <td>Slug</td>
                <td>{tenant.slug}</td>
              </tr>
              <tr>
                <td>ID</td>
                <td className="mono">{tenant.id}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2>Governance</h2>
          <table className="table">
            <tbody>
              <tr>
                <td>Users</td>
                <td>{users.length}</td>
              </tr>
              <tr>
                <td>Teams</td>
                <td>{teams.length}</td>
              </tr>
              <tr>
                <td>Recent audit events</td>
                <td>{auditLogs.length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
