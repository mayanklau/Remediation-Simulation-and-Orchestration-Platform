import { ingestFindings, IngestFindingInput } from "@/domain/ingestion";
import { prisma } from "@/lib/prisma";

const sampleFindings: IngestFindingInput[] = [
  {
    source: "mock-crowdstrike",
    sourceId: "cs-prod-api-openssl",
    title: "OpenSSL package vulnerable on payments API",
    description: "Runtime image contains an OpenSSL build with a remotely exploitable CVE.",
    severity: "CRITICAL",
    category: "vulnerability",
    cve: "CVE-2026-10412",
    scannerSeverity: "critical",
    exploitAvailable: true,
    activeExploitation: true,
    patchAvailable: true,
    asset: {
      externalId: "svc-payments-api",
      name: "payments-api",
      type: "SERVICE",
      environment: "PRODUCTION",
      provider: "kubernetes",
      region: "us-east-1",
      criticality: 5,
      dataSensitivity: 5,
      internetExposure: true,
      metadata: { namespace: "payments", cluster: "prod-east" }
    }
  },
  {
    source: "mock-wiz",
    sourceId: "wiz-s3-public-logs",
    title: "S3 access logs bucket permits public listing",
    description: "Bucket policy allows unauthenticated ListBucket access.",
    severity: "HIGH",
    category: "cloud_configuration",
    controlId: "AWS.S3.8",
    patchAvailable: true,
    asset: {
      externalId: "arn:aws:s3:::prod-access-logs",
      name: "prod-access-logs",
      type: "STORAGE",
      environment: "PRODUCTION",
      provider: "aws",
      region: "us-east-1",
      criticality: 4,
      dataSensitivity: 4,
      internetExposure: true
    }
  },
  {
    source: "mock-github",
    sourceId: "gh-actions-token-write",
    title: "GitHub Actions workflow uses write-all token permissions",
    description: "Repository workflow grants broad token permissions across pull request events.",
    severity: "HIGH",
    category: "ci_cd",
    controlId: "SCM.GHA.PERMISSIONS",
    patchAvailable: true,
    asset: {
      externalId: "repo:commerce/checkout",
      name: "commerce/checkout",
      type: "REPOSITORY",
      environment: "PRODUCTION",
      provider: "github",
      criticality: 4,
      dataSensitivity: 3,
      internetExposure: false
    }
  },
  {
    source: "mock-okta",
    sourceId: "okta-admin-no-mfa",
    title: "Privileged identity lacks phishing-resistant MFA",
    description: "Admin role is assigned to an identity that is not enrolled in an approved MFA factor.",
    severity: "CRITICAL",
    category: "identity",
    controlId: "IAM.MFA.ADMIN",
    exploitAvailable: true,
    patchAvailable: true,
    asset: {
      externalId: "identity:admin-platform-ops",
      name: "admin-platform-ops",
      type: "IDENTITY",
      environment: "PRODUCTION",
      provider: "okta",
      criticality: 5,
      dataSensitivity: 4,
      internetExposure: true
    }
  },
  {
    source: "mock-qualys",
    sourceId: "qualys-db-tls-legacy",
    title: "Database endpoint accepts TLS 1.0",
    description: "Legacy TLS protocol remains enabled on the customer profile database endpoint.",
    severity: "MEDIUM",
    category: "network_policy",
    controlId: "NET.TLS.MIN_VERSION",
    patchAvailable: true,
    asset: {
      externalId: "db-customer-profile",
      name: "customer-profile-db",
      type: "DATABASE",
      environment: "PRODUCTION",
      provider: "aws-rds",
      region: "us-east-1",
      criticality: 5,
      dataSensitivity: 5,
      internetExposure: false
    }
  }
];

export async function ingestMockEnterprise(tenantId: string) {
  const result = await ingestFindings(tenantId, sampleFindings);
  await linkMockAssets(tenantId);
  return result;
}

async function linkMockAssets(tenantId: string) {
  const assets = await prisma.asset.findMany({ where: { tenantId } });
  const byExternalId = new Map(assets.map((asset) => [asset.externalId, asset]));
  const payments = byExternalId.get("svc-payments-api");
  const database = byExternalId.get("db-customer-profile");
  const repo = byExternalId.get("repo:commerce/checkout");
  if (payments && database) {
    await prisma.assetRelationship.upsert({
      where: { fromAssetId_toAssetId_relation: { fromAssetId: payments.id, toAssetId: database.id, relation: "depends_on_database" } },
      update: { confidence: 0.87, source: "mock-service-map" },
      create: { tenantId, fromAssetId: payments.id, toAssetId: database.id, relation: "depends_on_database", confidence: 0.87, source: "mock-service-map" }
    });
  }
  if (repo && payments) {
    await prisma.assetRelationship.upsert({
      where: { fromAssetId_toAssetId_relation: { fromAssetId: repo.id, toAssetId: payments.id, relation: "deploys_business_service" } },
      update: { confidence: 0.78, source: "mock-scm-map" },
      create: { tenantId, fromAssetId: repo.id, toAssetId: payments.id, relation: "deploys_business_service", confidence: 0.78, source: "mock-scm-map" }
    });
  }
}
