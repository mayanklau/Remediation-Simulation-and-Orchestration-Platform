import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";
import { findingFingerprint } from "@/domain/fingerprints";
import { scoreRisk, recommendedSlaDays } from "@/domain/risk";
import { AssetType, assetTypes, Environment, environments, Severity, severities, isOneOf } from "@/domain/enums";

export type IngestFindingInput = {
  source: string;
  sourceId?: string;
  title: string;
  description?: string;
  severity: string;
  category?: string;
  cve?: string;
  controlId?: string;
  scannerSeverity?: string;
  asset?: {
    externalId?: string;
    name: string;
    type?: string;
    environment?: string;
    provider?: string;
    region?: string;
    criticality?: number;
    dataSensitivity?: number;
    internetExposure?: boolean;
    metadata?: Record<string, unknown>;
  };
  exploitAvailable?: boolean;
  activeExploitation?: boolean;
  patchAvailable?: boolean;
  compensatingControls?: string;
  metadata?: Record<string, unknown>;
  raw?: unknown;
};

export async function ingestFindings(tenantId: string, inputs: IngestFindingInput[]) {
  const results = [];
  for (const input of inputs) {
    results.push(await ingestOneFinding(tenantId, input));
  }
  return {
    count: results.length,
    created: results.filter((result) => result.created).length,
    updated: results.filter((result) => !result.created).length,
    findings: results.map((result) => result.finding)
  };
}

async function ingestOneFinding(tenantId: string, input: IngestFindingInput) {
  const asset = input.asset
    ? await prisma.asset.upsert({
        where: {
          tenantId_externalId: {
            tenantId,
            externalId: input.asset.externalId ?? stableAssetExternalId(input.asset.name)
          }
        },
        update: {
          name: input.asset.name,
          type: normalizeAssetType(input.asset.type),
          environment: normalizeEnvironment(input.asset.environment),
          provider: input.asset.provider,
          region: input.asset.region,
          criticality: clampDimension(input.asset.criticality),
          dataSensitivity: clampDimension(input.asset.dataSensitivity),
          internetExposure: Boolean(input.asset.internetExposure),
          metadataJson: stringifyJson(input.asset.metadata ?? {})
        },
        create: {
          tenantId,
          externalId: input.asset.externalId ?? stableAssetExternalId(input.asset.name),
          name: input.asset.name,
          type: normalizeAssetType(input.asset.type),
          environment: normalizeEnvironment(input.asset.environment),
          provider: input.asset.provider,
          region: input.asset.region,
          criticality: clampDimension(input.asset.criticality),
          dataSensitivity: clampDimension(input.asset.dataSensitivity),
          internetExposure: Boolean(input.asset.internetExposure),
          metadataJson: stringifyJson(input.asset.metadata ?? {})
        }
      })
    : null;

  const severity = normalizeSeverity(input.severity);
  const fingerprint = findingFingerprint({
    tenantId,
    source: input.source,
    assetExternalId: asset?.externalId,
    assetId: asset?.id,
    cve: input.cve,
    controlId: input.controlId,
    title: input.title,
    category: input.category
  });
  const risk = scoreRisk({
    severity,
    exploitAvailable: Boolean(input.exploitAvailable),
    activeExploitation: Boolean(input.activeExploitation),
    patchAvailable: Boolean(input.patchAvailable),
    compensatingControls: input.compensatingControls,
    asset
  });
  const dueAt = addDays(new Date(), recommendedSlaDays(risk.riskScore));

  const existing = await prisma.finding.findUnique({
    where: {
      tenantId_fingerprint: {
        tenantId,
        fingerprint
      }
    }
  });

  const finding = await prisma.finding.upsert({
    where: {
      tenantId_fingerprint: {
        tenantId,
        fingerprint
      }
    },
    update: {
      assetId: asset?.id,
      title: input.title,
      description: input.description ?? "",
      severity,
      category: input.category ?? "general",
      source: input.source,
      scannerSeverity: input.scannerSeverity,
      cve: input.cve,
      controlId: input.controlId,
      exploitAvailable: Boolean(input.exploitAvailable),
      activeExploitation: Boolean(input.activeExploitation),
      patchAvailable: Boolean(input.patchAvailable),
      compensatingControls: input.compensatingControls,
      riskScore: risk.riskScore,
      businessRiskScore: risk.businessRiskScore,
      riskExplanation: risk.explanation,
      dueAt,
      lastSeenAt: new Date(),
      metadataJson: stringifyJson(input.metadata ?? {})
    },
    create: {
      tenantId,
      assetId: asset?.id,
      title: input.title,
      description: input.description ?? "",
      severity,
      category: input.category ?? "general",
      source: input.source,
      scannerSeverity: input.scannerSeverity,
      cve: input.cve,
      controlId: input.controlId,
      exploitAvailable: Boolean(input.exploitAvailable),
      activeExploitation: Boolean(input.activeExploitation),
      patchAvailable: Boolean(input.patchAvailable),
      compensatingControls: input.compensatingControls,
      riskScore: risk.riskScore,
      businessRiskScore: risk.businessRiskScore,
      riskExplanation: risk.explanation,
      fingerprint,
      dueAt,
      metadataJson: stringifyJson(input.metadata ?? {})
    }
  });

  await prisma.sourceFinding.upsert({
    where: {
      tenantId_source_sourceId: {
        tenantId,
        source: input.source,
        sourceId: input.sourceId ?? fingerprint
      }
    },
    update: {
      findingId: finding.id,
      rawPayloadJson: stringifyJson(input.raw ?? input),
      ingestedAt: new Date()
    },
    create: {
      tenantId,
      findingId: finding.id,
      source: input.source,
      sourceId: input.sourceId ?? fingerprint,
      rawPayloadJson: stringifyJson(input.raw ?? input)
    }
  });

  await ensureRemediationAction(tenantId, finding.id, input);
  return { created: !existing, finding };
}

async function ensureRemediationAction(tenantId: string, findingId: string, input: IngestFindingInput) {
  const existing = await prisma.remediationAction.findFirst({ where: { tenantId, findingId } });
  if (existing) return existing;
  return prisma.remediationAction.create({
    data: {
      tenantId,
      findingId,
      title: `Remediate: ${input.title}`,
      summary: buildRemediationSummary(input),
      actionType: inferActionType(input),
      proposedChangeJson: stringifyJson(buildProposedChange(input)),
      expectedRiskReduction: input.patchAvailable ? 70 : 45,
      complexity: input.asset?.environment?.toLowerCase() === "production" ? 4 : 3
    }
  });
}

function buildRemediationSummary(input: IngestFindingInput): string {
  if (input.cve) return `Apply vendor-recommended remediation or patched dependency for ${input.cve}.`;
  if (input.controlId) return `Bring the affected asset back into compliance with control ${input.controlId}.`;
  return "Review the finding context, apply the safest validated fix, and verify the after state.";
}

function buildProposedChange(input: IngestFindingInput) {
  return {
    category: input.category ?? "general",
    cve: input.cve,
    controlId: input.controlId,
    patchAvailable: Boolean(input.patchAvailable),
    recommended: input.patchAvailable ? "apply_patch_or_upgrade" : "apply_configuration_or_control_fix"
  };
}

function inferActionType(input: IngestFindingInput): string {
  const category = input.category?.toLowerCase() ?? "";
  if (category.includes("iam")) return "iam_policy";
  if (category.includes("network") || category.includes("security_group")) return "network_policy";
  if (category.includes("cloud")) return "cloud_configuration";
  if (input.patchAvailable || input.cve) return "patch_rollout";
  return "manual_remediation";
}

export function normalizeSeverity(value: string): Severity {
  const normalized = value.trim().toUpperCase();
  if (isOneOf(severities, normalized)) return normalized;
  return "MEDIUM";
}

function normalizeAssetType(value?: string): AssetType {
  const normalized = value?.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_") ?? "OTHER";
  if (isOneOf(assetTypes, normalized)) return normalized;
  return "OTHER";
}

function normalizeEnvironment(value?: string): Environment {
  const normalized = value?.trim().toUpperCase() ?? "UNKNOWN";
  if (isOneOf(environments, normalized)) return normalized;
  return "UNKNOWN";
}

function clampDimension(value?: number): number {
  return Math.max(1, Math.min(5, Number.isFinite(value) ? Number(value) : 3));
}

function stableAssetExternalId(name: string): string {
  return `manual:${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}
