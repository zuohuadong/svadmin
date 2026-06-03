/**
 * 浏览器端 OIDC/OAuth2 认证辅助函数。
 *
 * 提供 PKCE 生成、OIDC Discovery 端点解析、重定向校验、
 * 反向代理 origin 恢复等通用工具。
 */

/** 将 Uint8Array 编码为 base64url 格式 (纯 Web API) */
function base64url(array: Uint8Array): string {
  let binary = "";
  for (const byte of array) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 生成随机的 OAuth state 值 */
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64url(array);
}

/** 生成 PKCE code verifier */
export function generateVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64url(array);
}

/** 基于 code verifier 算得 code challenge (S256) */
export async function generateChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64url(new Uint8Array(hash));
}

/**
 * 校验 returnTo 重定向地址，防止开放重定向漏洞。
 * 只允许同源相对路径（必须以 / 开头且非 // 开头）。
 */
export function isValidReturnTo(url: string): boolean {
  if (!url) return false;
  if (url.includes("\\")) return false;
  return /^\/[^/].*/.test(url) || url === "/";
}

/** 从反向代理头恢复公网 origin */
export function getForwardedOrigin(req: Request, fallbackUrl: URL): string {
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.headers.get("host") || fallbackUrl.host;
  const protocol = (forwardedProto || fallbackUrl.protocol.replace(/:$/, "")).replace(/:$/, "");
  return `${protocol}://${host}`;
}

interface OidcDiscoveryDocument {
  authorization_endpoint?: string;
  token_endpoint?: string;
}

/** 通过 OIDC Discovery 解析授权端点 URL */
export async function resolveAuthorizeUrl(
  issuer: string,
  overrideUrl = "",
  fetcher: typeof fetch = fetch,
): Promise<string> {
  const normalizedIssuer = issuer.replace(/\/$/, "");
  const normalizedOverride = overrideUrl.trim();

  if (normalizedOverride) return normalizedOverride;

  if (normalizedIssuer) {
    try {
      const response = await fetcher(`${normalizedIssuer}/.well-known/openid-configuration`);
      if (response.ok) {
        const discovery = await response.json() as OidcDiscoveryDocument;
        if (discovery.authorization_endpoint) return discovery.authorization_endpoint;
      }
    } catch {
      // 忽略 discovery 失败，走 fallback
    }
  }

  if (normalizedIssuer) return `${normalizedIssuer}/oauth/authorize`;

  return "";
}

/** 通过 OIDC Discovery 解析 token 端点 URL */
export async function resolveTokenUrl(
  issuer: string,
  overrideUrlOrFetcher: string | typeof fetch = "",
  fetcherOverride: typeof fetch = fetch,
): Promise<string> {
  const normalizedIssuer = issuer.replace(/\/$/, "");
  const fetcher = typeof overrideUrlOrFetcher === "function" ? overrideUrlOrFetcher : fetcherOverride;
  const overrideUrl = typeof overrideUrlOrFetcher === "string" ? overrideUrlOrFetcher : "";
  const normalizedOverride = overrideUrl.trim();

  if (normalizedOverride) return normalizedOverride;
  if (!normalizedIssuer) return "";

  try {
    const response = await fetcher(`${normalizedIssuer}/.well-known/openid-configuration`);
    if (response.ok) {
      const discovery = await response.json() as OidcDiscoveryDocument;
      if (discovery.token_endpoint) return discovery.token_endpoint;
    }
  } catch {
    // 忽略 discovery 失败
  }

  return `${normalizedIssuer}/oauth/token`;
}
