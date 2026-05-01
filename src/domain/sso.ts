import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";

export type SsoInput = {
  provider: string;
  enabled?: boolean;
  metadataUrl?: string;
  entityId?: string;
  callbackUrl?: string;
  certificateFingerprint?: string;
  settings?: Record<string, unknown>;
};

export async function upsertSsoConfiguration(tenantId: string, input: SsoInput) {
  return prisma.ssoConfiguration.upsert({
    where: { tenantId_provider: { tenantId, provider: input.provider } },
    update: {
      enabled: Boolean(input.enabled),
      metadataUrl: input.metadataUrl,
      entityId: input.entityId,
      callbackUrl: input.callbackUrl,
      certificateFingerprint: input.certificateFingerprint,
      settingsJson: stringifyJson(input.settings ?? {})
    },
    create: {
      tenantId,
      provider: input.provider,
      enabled: Boolean(input.enabled),
      metadataUrl: input.metadataUrl,
      entityId: input.entityId,
      callbackUrl: input.callbackUrl,
      certificateFingerprint: input.certificateFingerprint,
      settingsJson: stringifyJson(input.settings ?? {})
    }
  });
}

export function buildSamlServiceProviderMetadata(baseUrl: string, tenantSlug: string) {
  const callbackUrl = `${baseUrl.replace(/\/$/, "")}/api/auth/saml/${tenantSlug}/callback`;
  return {
    entityId: `urn:remediation-twin:${tenantSlug}`,
    assertionConsumerService: callbackUrl,
    nameIdFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
    requiredAttributes: ["email", "name", "groups"]
  };
}
