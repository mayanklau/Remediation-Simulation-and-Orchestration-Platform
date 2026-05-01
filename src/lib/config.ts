import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["local", "dev", "staging", "production"]).default("local"),
  DATABASE_URL: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(24).optional(),
  OIDC_ISSUER: z.string().url().optional().or(z.literal("")),
  OIDC_CLIENT_ID: z.string().optional(),
  OIDC_CLIENT_SECRET_REF: z.string().optional(),
  FEATURE_AUTONOMOUS_REMEDIATION: z.enum(["true", "false"]).default("false"),
  FEATURE_MODEL_PLANNING: z.enum(["true", "false"]).default("true"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional().or(z.literal("")),
  ALERT_WEBHOOK_URL: z.string().url().optional().or(z.literal(""))
});

export function readRuntimeConfig(env: NodeJS.ProcessEnv = process.env) {
  const parsed = environmentSchema.parse(env);
  if (parsed.APP_ENV === "production" && !parsed.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required in production");
  }
  if (parsed.APP_ENV === "production" && (!parsed.OIDC_ISSUER || !parsed.OIDC_CLIENT_ID)) {
    throw new Error("OIDC_ISSUER and OIDC_CLIENT_ID are required in production");
  }
  return {
    ...parsed,
    features: {
      autonomousRemediation: parsed.FEATURE_AUTONOMOUS_REMEDIATION === "true",
      modelPlanning: parsed.FEATURE_MODEL_PLANNING === "true"
    }
  };
}
