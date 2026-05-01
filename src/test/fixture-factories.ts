import { createHash } from "crypto";

export function assetFactory(overrides: Record<string, unknown> = {}) {
  return {
    id: "asset-test",
    tenantId: "tenant-test",
    name: "payments-api",
    environment: "PRODUCTION",
    criticality: 5,
    dataSensitivity: 4,
    internetExposure: true,
    ...overrides
  };
}

export function findingFactory(overrides: Record<string, unknown> = {}) {
  const base = {
    source: "tenable",
    title: "Remote code execution in payments API",
    severity: "CRITICAL",
    cve: "CVE-2026-0001",
    exploitAvailable: true,
    activeExploitation: true,
    patchAvailable: true,
    assetId: "asset-test"
  };
  return { ...base, fingerprint: createHash("sha256").update(JSON.stringify(base)).digest("hex"), ...overrides };
}
