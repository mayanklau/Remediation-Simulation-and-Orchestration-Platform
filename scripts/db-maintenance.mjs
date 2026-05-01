#!/usr/bin/env node
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const command = process.argv[2] ?? "check-indexes";
const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const sqlitePath = databaseUrl.startsWith("file:") ? resolve(databaseUrl.slice(5)) : "";

if (command === "backup") {
  if (!sqlitePath) throw new Error("backup currently supports sqlite DATABASE_URL=file: paths");
  const backupPath = resolve(process.argv[3] ?? `./backups/remediation-twin-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
  await mkdir(dirname(backupPath), { recursive: true });
  await stat(sqlitePath);
  await copyFile(sqlitePath, backupPath);
  console.log(JSON.stringify({ status: "ok", backupPath }, null, 2));
} else if (command === "restore") {
  if (!sqlitePath) throw new Error("restore currently supports sqlite DATABASE_URL=file: paths");
  const backupPath = resolve(process.argv[3] ?? "");
  if (!backupPath) throw new Error("usage: npm run db:restore -- ./backups/file.db");
  await stat(backupPath);
  await mkdir(dirname(sqlitePath), { recursive: true });
  await copyFile(backupPath, sqlitePath);
  console.log(JSON.stringify({ status: "ok", restoredTo: sqlitePath }, null, 2));
} else if (command === "check-indexes") {
  const schema = await readFile(resolve("./prisma/schema.prisma"), "utf8");
  const required = [
    "@@index([tenantId, severity])",
    "@@index([tenantId, status])",
    "@@index([tenantId, riskScore])",
    "@@unique([tenantId, fingerprint])",
    "@@index([tenantId, environment])"
  ];
  const missing = required.filter((needle) => !schema.includes(needle));
  const report = { status: missing.length ? "failed" : "ok", required, missing };
  await writeFile(resolve("./index-check-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  if (missing.length) {
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(report, null, 2));
} else {
  throw new Error(`unknown db-maintenance command: ${command}`);
}
