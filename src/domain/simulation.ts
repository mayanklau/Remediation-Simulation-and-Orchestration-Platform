import { addMinutes } from "date-fns";
import { RemediationAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseJsonObject, stringifyJson } from "@/lib/json";
import { SimulationType } from "@/domain/enums";

export type SimulationInput = {
  type?: SimulationType;
  changeWindow?: string;
  rolloutStrategy?: "manual" | "canary" | "blue_green" | "phased";
  proposedChange?: Record<string, unknown>;
};

export type SimulationResult = {
  confidence: number;
  riskReductionEstimate: number;
  operationalRisk: number;
  affectedAssets: Array<{ id: string; name: string; type: string; environment: string }>;
  affectedBusinessServices: string[];
  dependencyImpact: Array<{ assetId: string; name: string; relation: string; confidence: number }>;
  requiredApprovals: string[];
  recommendedRollout: string[];
  rollbackPlan: string[];
  validationSteps: string[];
  explanation: string;
  earliestSafeWindow?: string;
};

export async function runSimulation(tenantId: string, remediationActionId: string, input: SimulationInput = {}) {
  const action = await prisma.remediationAction.findFirstOrThrow({
    where: { id: remediationActionId, tenantId },
    include: {
      finding: {
        include: {
          asset: {
            include: {
              relationshipsFrom: { include: { toAsset: true } },
              relationshipsTo: { include: { fromAsset: true } }
            }
          }
        }
      }
    }
  });

  const type = input.type ?? inferSimulationType(action);
  const simulation = await prisma.simulation.create({
    data: {
      tenantId,
      remediationActionId,
      type,
      status: "RUNNING",
      startedAt: new Date(),
      inputJson: stringifyJson(input)
    }
  });

  const result = calculateSimulation(action, type, input);

  const completed = await prisma.simulation.update({
    where: { id: simulation.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      confidence: result.confidence,
      riskReductionEstimate: result.riskReductionEstimate,
      operationalRisk: result.operationalRisk,
      explanation: result.explanation,
      resultJson: stringifyJson(result)
    }
  });

  await prisma.remediationAction.update({
    where: { id: remediationActionId },
    data: { status: "SIMULATION_COMPLETE", expectedRiskReduction: result.riskReductionEstimate }
  });

  return { simulation: completed, result };
}

function calculateSimulation(
  action: RemediationAction & {
    finding: {
      riskScore: number;
      businessRiskScore: number;
      severity: string;
      asset: null | {
        id: string;
        name: string;
        type: string;
        environment: string;
        criticality: number;
        dataSensitivity: number;
        internetExposure: boolean;
        relationshipsFrom: Array<{ relation: string; confidence: number; toAsset: { id: string; name: string; type: string; environment: string } }>;
        relationshipsTo: Array<{ relation: string; confidence: number; fromAsset: { id: string; name: string; type: string; environment: string } }>;
      };
    };
  },
  type: SimulationType,
  input: SimulationInput
): SimulationResult {
  const asset = action.finding.asset;
  const proposedChange: { patchAvailable?: boolean } & Record<string, unknown> = {
    ...parseJsonObject(action.proposedChangeJson, {}),
    ...(input.proposedChange ?? {})
  };
  const dependencies = asset
    ? [
        ...asset.relationshipsFrom.map((relationship) => ({
          assetId: relationship.toAsset.id,
          name: relationship.toAsset.name,
          relation: relationship.relation,
          confidence: relationship.confidence
        })),
        ...asset.relationshipsTo.map((relationship) => ({
          assetId: relationship.fromAsset.id,
          name: relationship.fromAsset.name,
          relation: relationship.relation,
          confidence: relationship.confidence
        }))
      ]
    : [];

  const dependencyRisk = Math.min(25, dependencies.length * 4);
  const productionRisk = asset?.environment === "PRODUCTION" ? 20 : 5;
  const criticalityRisk = ((asset?.criticality ?? 3) - 1) * 5;
  const exposureReduction = asset?.internetExposure ? 15 : 5;
  const patchBonus = proposedChange.patchAvailable ? 18 : 8;
  const confidence = clamp(82 - dependencyRisk + dependencies.reduce((sum, item) => sum + item.confidence, 0) * 3, 35, 96);
  const operationalRisk = clamp(productionRisk + criticalityRisk + dependencyRisk + action.complexity * 4, 5, 95);
  const riskReductionEstimate = clamp(action.finding.riskScore * 0.45 + exposureReduction + patchBonus - operationalRisk * 0.08, 5, 95);
  const requiredApprovals = approvalsFor(asset?.environment, operationalRisk, action.finding.businessRiskScore);
  const rolloutStrategy = input.rolloutStrategy ?? (operationalRisk > 65 ? "canary" : "phased");

  return {
    confidence,
    riskReductionEstimate,
    operationalRisk,
    affectedAssets: asset ? [{ id: asset.id, name: asset.name, type: asset.type, environment: asset.environment }] : [],
    affectedBusinessServices: dependencies.filter((item) => item.relation.includes("business")).map((item) => item.name),
    dependencyImpact: dependencies,
    requiredApprovals,
    recommendedRollout: rolloutSteps(type, rolloutStrategy),
    rollbackPlan: rollbackSteps(type),
    validationSteps: validationSteps(type),
    earliestSafeWindow: addMinutes(new Date(), operationalRisk > 70 ? 240 : 60).toISOString(),
    explanation: buildExplanation(type, confidence, riskReductionEstimate, operationalRisk, dependencies.length, requiredApprovals)
  };
}

function inferSimulationType(action: RemediationAction): SimulationType {
  if (action.actionType === "iam_policy") return "IAM_POLICY";
  if (action.actionType === "network_policy") return "NETWORK_POLICY";
  if (action.actionType === "cloud_configuration") return "CLOUD_CONFIGURATION";
  if (action.actionType === "patch_rollout") return "PATCH_ROLLOUT";
  return "COMPLIANCE_CONTROL";
}

function approvalsFor(environment?: string, operationalRisk = 0, businessRisk = 0): string[] {
  const approvals = ["security"];
  if (environment === "PRODUCTION" || operationalRisk >= 55) approvals.push("platform-owner");
  if (businessRisk >= 75) approvals.push("business-owner");
  if (operationalRisk >= 70) approvals.push("change-advisory");
  return approvals;
}

function rolloutSteps(type: SimulationType, strategy: string): string[] {
  const common = ["Confirm owner and maintenance window", "Snapshot current state", "Apply change to non-production where available"];
  const strategySteps =
    strategy === "canary"
      ? ["Apply to 5% of targets", "Monitor health and security telemetry", "Expand to 25%, then 50%, then 100%"]
      : strategy === "blue_green"
        ? ["Prepare parallel target state", "Shift a small traffic percentage", "Complete cutover after validation"]
        : ["Apply to the lowest criticality group", "Validate", "Proceed by criticality tier"];
  return [...common, ...strategySteps, `Run ${type.toLowerCase().replace(/_/g, " ")} validation`];
}

function rollbackSteps(type: SimulationType): string[] {
  const base = ["Stop rollout immediately", "Restore recorded before state", "Notify assigned owners", "Re-run validation checks"];
  if (type === "IAM_POLICY") return ["Reattach previous IAM policy version", ...base.slice(2)];
  if (type === "NETWORK_POLICY") return ["Restore previous network rule set", ...base.slice(2)];
  if (type === "PATCH_ROLLOUT") return ["Redeploy previous artifact or package version", ...base.slice(2)];
  return base;
}

function validationSteps(type: SimulationType): string[] {
  const shared = ["Confirm scanner no longer reports the finding", "Check service health indicators", "Attach evidence to the workflow item"];
  if (type === "IAM_POLICY") return ["Replay observed access patterns", "Check authorization failures", ...shared];
  if (type === "NETWORK_POLICY") return ["Validate expected traffic paths", "Review denied flow logs", ...shared];
  if (type === "PATCH_ROLLOUT") return ["Run CI and smoke tests", "Verify package or image version", ...shared];
  return shared;
}

function buildExplanation(type: SimulationType, confidence: number, riskReduction: number, operationalRisk: number, dependencyCount: number, approvals: string[]) {
  return `The ${type.toLowerCase().replace(/_/g, " ")} simulation has ${Math.round(confidence)}% confidence, estimates ${Math.round(
    riskReduction
  )}% risk reduction, and ${Math.round(operationalRisk)}% operational risk. The estimate considers ${dependencyCount} known dependencies and requires ${approvals.join(
    ", "
  )} approval.`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
