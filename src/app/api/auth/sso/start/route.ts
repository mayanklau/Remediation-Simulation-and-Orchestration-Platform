import { buildSamlServiceProviderMetadata } from "@/domain/sso";
import { apiHandler } from "@/lib/api";
import { getOrCreateDefaultTenant } from "@/lib/tenant";

export const GET = apiHandler(async () => {
  const tenant = await getOrCreateDefaultTenant();
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  return Response.json({
    provider: "oidc_or_saml",
    tenant: tenant.slug,
    saml: buildSamlServiceProviderMetadata(baseUrl, tenant.slug),
    oidc: {
      issuer: process.env.OIDC_ISSUER ?? "",
      clientIdConfigured: Boolean(process.env.OIDC_CLIENT_ID),
      callbackUrl: `${baseUrl.replace(/\/$/, "")}/api/auth/sso/callback`
    }
  });
});
