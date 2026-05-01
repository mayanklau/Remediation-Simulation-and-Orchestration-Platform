export const severities = ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Severity = (typeof severities)[number];

export const environments = ["PRODUCTION", "STAGING", "DEVELOPMENT", "TEST", "SANDBOX", "UNKNOWN"] as const;
export type Environment = (typeof environments)[number];

export const assetTypes = [
  "CLOUD_ACCOUNT",
  "VIRTUAL_MACHINE",
  "CONTAINER",
  "KUBERNETES_CLUSTER",
  "DATABASE",
  "REPOSITORY",
  "APPLICATION",
  "API",
  "IAM_IDENTITY",
  "NETWORK_RESOURCE",
  "SAAS_SYSTEM",
  "BUSINESS_SERVICE",
  "OTHER"
] as const;
export type AssetType = (typeof assetTypes)[number];

export const simulationTypes = [
  "PATCH_ROLLOUT",
  "CLOUD_CONFIGURATION",
  "IAM_POLICY",
  "NETWORK_POLICY",
  "KUBERNETES_ROLLOUT",
  "TERRAFORM_PLAN",
  "COMPLIANCE_CONTROL",
  "APPLICATION_DEPENDENCY"
] as const;
export type SimulationType = (typeof simulationTypes)[number];

export function isOneOf<T extends readonly string[]>(values: T, value: string): value is T[number] {
  return values.includes(value);
}
