export async function GET() {
  return Response.json({
    ok: true,
    service: "remediation-twin",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
    checks: {
      databaseUrl: Boolean(process.env.DATABASE_URL),
      appUrl: Boolean(process.env.APP_URL),
      sessionSecret: Boolean(process.env.SESSION_SECRET),
      secretProvider: Boolean(process.env.SECRET_PROVIDER),
      workerConcurrency: Boolean(process.env.WORKER_CONCURRENCY),
      evidenceStorage: Boolean(process.env.EVIDENCE_STORAGE_URL)
    }
  });
}
