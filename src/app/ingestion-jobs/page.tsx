import { ApiButton } from "@/components/ApiButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buildPilotReadinessModel } from "@/domain/pilot-readiness";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function IngestionJobsPage() {
  const tenant = await getOrCreateDefaultTenant();
  const model = await buildPilotReadinessModel(tenant.id);

  return (
    <>
      <PageHeader
        eyebrow="Ingestion operations"
        title="Live ingestion jobs"
        description="Track scanner and API ingestion as durable jobs with source, status, accepted records, rejected records, and retry signals."
      >
        <ApiButton path="/api/pilot-readiness" label="Run Wiz ingestion" payload={{ action: "start_ingestion", provider: "wiz", source: "wiz-cloud-sync", recordsExpected: 320 }} />
      </PageHeader>

      <section className="grid cols-4">
        <div className="panel metric">
          <span>Total Jobs</span>
          <strong>{model.ingestionJobs.length}</strong>
        </div>
        <div className="panel metric">
          <span>Success Rate</span>
          <strong>{model.readiness.ingestionSuccessRate}%</strong>
        </div>
        <div className="panel metric">
          <span>Records Accepted</span>
          <strong>{model.ingestionJobs.reduce((total, job) => total + job.recordsAccepted, 0)}</strong>
        </div>
        <div className="panel metric">
          <span>Errors</span>
          <strong>{model.ingestionJobs.reduce((total, job) => total + job.errorCount, 0)}</strong>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Job History</h2>
        {model.ingestionJobs.length === 0 ? (
          <EmptyState title="No ingestion jobs yet" description="Start a scanner ingestion job to create operational history." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Source</th>
                <th>Status</th>
                <th>Accepted</th>
                <th>Rejected</th>
                <th>Submitted By</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {model.ingestionJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.provider}</td>
                  <td>{job.source}</td>
                  <td>
                    <StatusBadge value={job.status} />
                  </td>
                  <td>{job.recordsAccepted}</td>
                  <td>{job.recordsRejected}</td>
                  <td>{job.submittedBy}</td>
                  <td>{job.completedAt ? new Date(job.completedAt).toLocaleString() : "Pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
