export type SecretResolution = {
  reference: string;
  provider: string;
  available: boolean;
  redacted: string;
  value?: string;
};

export async function resolveSecretReference(reference: string): Promise<SecretResolution> {
  const provider = process.env.SECRET_PROVIDER || "env";
  if (!reference) {
    return { reference, provider, available: false, redacted: "" };
  }
  if (provider === "env") {
    const envName = reference.replace(/^env:/, "");
    const value = process.env[envName];
    return { reference, provider, available: Boolean(value), value, redacted: redact(value) };
  }
  return {
    reference,
    provider,
    available: true,
    redacted: `${provider}:${reference.split(":").pop() ?? "secret"}:resolved-at-runtime`
  };
}

export async function resolveConnectorSecrets(config: Record<string, unknown>) {
  const secretReferences = Object.entries(config).filter(([key, value]) => key.toLowerCase().includes("secret") || key.toLowerCase().includes("token") || String(value).startsWith("env:"));
  const resolved = await Promise.all(secretReferences.map(async ([key, value]) => [key, await resolveSecretReference(String(value))] as const));
  return Object.fromEntries(resolved);
}

export function redact(value: string | undefined) {
  if (!value) return "";
  if (value.length <= 8) return "********";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
