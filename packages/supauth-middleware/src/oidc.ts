import type { SupauthConfig, OidcDiscovery } from "./types";
import { AuthError } from "./middleware";

/** 获取 OIDC Discovery 文档 */
export async function fetchOidcDiscovery(issuerUrl: string): Promise<OidcDiscovery> {
  const url = `${issuerUrl.replace(/\/+$/, "")}/.well-known/openid-configuration`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new AuthError(`OIDC discovery failed: ${response.status}`, response.status);
  }
  return response.json();
}

/** 生成 OIDC 授权 URL */
export function buildAuthorizationUrl(
  config: SupauthConfig,
  state: string,
  codeChallenge?: string,
): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    scope: "openid profile email",
    state,
  });
  if (codeChallenge) {
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", "S256");
  }
  return `${config.issuer}/authorize?${params.toString()}`;
}
