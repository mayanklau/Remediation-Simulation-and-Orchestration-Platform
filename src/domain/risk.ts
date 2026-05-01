import { Finding, Asset } from "@prisma/client";
import { Severity } from "@/domain/enums";

export type RiskInput = Pick<
  Finding,
  "exploitAvailable" | "activeExploitation" | "patchAvailable"
> & {
  severity: Severity;
  compensatingControls?: string | null;
  asset?: Pick<Asset, "criticality" | "dataSensitivity" | "internetExposure" | "environment"> | null;
};

const severityWeights: Record<Severity, number> = {
  INFO: 5,
  LOW: 20,
  MEDIUM: 45,
  HIGH: 70,
  CRITICAL: 90
};

export function scoreRisk(input: RiskInput) {
  const base = severityWeights[input.severity];
  const exposure = input.asset?.internetExposure ? 12 : 0;
  const criticality = ((input.asset?.criticality ?? 3) - 3) * 5;
  const sensitivity = ((input.asset?.dataSensitivity ?? 3) - 3) * 4;
  const production = input.asset?.environment === "PRODUCTION" ? 8 : 0;
  const exploit = input.exploitAvailable ? 9 : 0;
  const active = input.activeExploitation ? 15 : 0;
  const patch = input.patchAvailable ? 2 : -3;
  const controls = input.compensatingControls?.trim() ? -10 : 0;
  const riskScore = clamp(base + exposure + criticality + sensitivity + production + exploit + active + patch + controls, 0, 100);
  const businessRiskScore = clamp(
    riskScore + ((input.asset?.criticality ?? 3) - 3) * 6 + ((input.asset?.dataSensitivity ?? 3) - 3) * 5,
    0,
    100
  );

  return {
    riskScore,
    businessRiskScore,
    explanation: explainRisk(input, riskScore, businessRiskScore)
  };
}

export function recommendedSlaDays(riskScore: number): number {
  if (riskScore >= 90) return 3;
  if (riskScore >= 75) return 7;
  if (riskScore >= 55) return 30;
  if (riskScore >= 30) return 60;
  return 120;
}

function explainRisk(input: RiskInput, riskScore: number, businessRiskScore: number): string {
  const reasons = [`${input.severity.toLowerCase()} technical severity`];
  if (input.activeExploitation) reasons.push("active exploitation is reported");
  if (input.exploitAvailable) reasons.push("public or known exploitability is available");
  if (input.asset?.internetExposure) reasons.push("the affected asset is internet exposed");
  if (input.asset?.environment === "PRODUCTION") reasons.push("the asset is in production");
  if ((input.asset?.criticality ?? 3) >= 4) reasons.push("the asset has high business criticality");
  if ((input.asset?.dataSensitivity ?? 3) >= 4) reasons.push("the asset handles sensitive data");
  if (input.compensatingControls?.trim()) reasons.push("compensating controls reduce the score");
  return `Risk score ${Math.round(riskScore)} and business risk ${Math.round(businessRiskScore)} are based on ${reasons.join(", ")}.`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value * 10) / 10));
}
