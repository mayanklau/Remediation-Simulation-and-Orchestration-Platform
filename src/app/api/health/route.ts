import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks = {
    database: false,
    databaseUrl: Boolean(process.env.DATABASE_URL),
    appUrl: Boolean(process.env.APP_URL),
    sessionSecret: Boolean(process.env.SESSION_SECRET),
    secretProvider: Boolean(process.env.SECRET_PROVIDER),
    workerConcurrency: Boolean(process.env.WORKER_CONCURRENCY),
    evidenceStorage: Boolean(process.env.EVIDENCE_STORAGE_URL)
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }

  const ok = checks.database;
  return Response.json({
    ok,
    service: "remediation-twin",
    time: new Date().toISOString(),
    environment: process.env.APP_ENV ?? process.env.NODE_ENV ?? "development",
    checks
  }, { status: ok ? 200 : 503 });
}
