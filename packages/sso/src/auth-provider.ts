/**
 * @svadmin/sso — OIDC/OAuth2 SSO AuthProvider for svadmin.
 *
 * Supports any OIDC-compliant Identity Provider:
 * - Okta
 * - Azure AD / Entra ID
 * - Amazon Cognito
 * - Keycloak
 * - Google Workspace
 * - Auth0
 * - Any custom OIDC server
 *
 * Uses the Authorization Code Flow with PKCE (no client secret needed in browser).
 *
 * @example
 * ```ts
 * import { createSSOAuthProvider } from '@svadmin/sso';
 * import { setAuthProvider } from '@svadmin/core';
 *
 * const authProvider = createSSOAuthProvider({
 *   issuer: 'https://your-tenant.okta.com',
 *   clientId: 'your-client-id',
 *   redirectUri: window.location.origin + '/callback',
 * });
 *
 * setAuthProvider(authProvider);
 * ```
 */

import type { AuthProvider, Identity } from '@svadmin/core';

// ─── Types ────────────────────────────────────────────────────

export interface SSOConfig {
  /** OIDC Issuer URL (e.g., 'https://your-tenant.okta.com') */
  issuer: string;
  /** OAuth2 Client ID */
  clientId: string;
  /** Redirect URI after login (e.g., '/callback') */
  redirectUri: string;
  /** OAuth2 scopes. Default: ['openid', 'profile', 'email'] */
  scopes?: string[];
  /** Where to redirect after logout */
  postLogoutRedirectUri?: string;
  /** Token storage backend. Default: 'local' (localStorage) */
  storage?: 'local' | 'session' | TokenStorage;
  /** Custom identity mapper — transform OIDC userinfo to svadmin Identity */
  mapIdentity?: (userinfo: Record<string, unknown>) => Identity;
  /** Auto-refresh tokens before expiry. Default: true */
  autoRefresh?: boolean;
  /** Seconds before expiry to trigger refresh. Default: 60 */
  refreshBuffer?: number;
  /**
   * Manual OAuth2 endpoints for providers that don't support OIDC discovery
   * (e.g., GitHub). When provided, OIDC auto-discovery is skipped.
   */
  manualEndpoints?: {
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
    end_session_endpoint?: string;
  };
}

export interface TokenStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

interface OIDCConfig {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint?: string;
}

interface TokenSet {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_at?: number;
  token_type: string;
}

// ─── PKCE Utilities ───────────────────────────────────────────

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => chars[v % chars.length]).join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(plain));
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createPKCEChallenge(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandomString(64);
  const hashed = await sha256(verifier);
  const challenge = base64urlEncode(hashed);
  return { verifier, challenge };
}

// ─── Storage Helper ───────────────────────────────────────────

const STORAGE_PREFIX = 'svadmin_sso_';

function getStorage(config: SSOConfig): TokenStorage {
  if (config.storage && typeof config.storage === 'object') return config.storage;
  const backend = config.storage === 'session' ? sessionStorage : localStorage;
  return {
    getItem: (key) => backend.getItem(key),
    setItem: (key, value) => backend.setItem(key, value),
    removeItem: (key) => backend.removeItem(key),
  };
}

// ─── Provider ─────────────────────────────────────────────────

/**
 * Create an OIDC/OAuth2 SSO AuthProvider.
 */
export function createSSOAuthProvider(config: SSOConfig): AuthProvider {
  const scopes = config.scopes ?? ['openid', 'profile', 'email'];
  const autoRefresh = config.autoRefresh ?? true;
  const refreshBuffer = config.refreshBuffer ?? 60;
  const storage = getStorage(config);

  let oidcConfig: OIDCConfig | null = null;
  let refreshTimer: ReturnType<typeof setTimeout> | null = null;

  // ── OIDC Discovery ───────────────────────────────────────

  async function discover(): Promise<OIDCConfig> {
    if (oidcConfig) return oidcConfig;

    // Use manual endpoints if provided (e.g., GitHub)
    if (config.manualEndpoints) {
      oidcConfig = config.manualEndpoints;
      return oidcConfig;
    }

    const url = `${config.issuer.replace(/\/$/, '')}/.well-known/openid-configuration`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OIDC discovery failed: ${res.status} ${res.statusText}`);
    oidcConfig = await res.json() as OIDCConfig;
    return oidcConfig;
  }

  // ── Token Management ─────────────────────────────────────

  function getTokens(): TokenSet | null {
    const raw = storage.getItem(`${STORAGE_PREFIX}tokens`);
    if (!raw) return null;
    try { return JSON.parse(raw) as TokenSet; }
    catch { return null; }
  }

  function setTokens(tokens: TokenSet): void {
    storage.setItem(`${STORAGE_PREFIX}tokens`, JSON.stringify(tokens));
    if (autoRefresh && tokens.refresh_token && tokens.expires_at) {
      scheduleRefresh(tokens);
    }
  }

  function clearTokens(): void {
    storage.removeItem(`${STORAGE_PREFIX}tokens`);
    storage.removeItem(`${STORAGE_PREFIX}pkce_verifier`);
    storage.removeItem(`${STORAGE_PREFIX}state`);
    if (refreshTimer) clearTimeout(refreshTimer);
  }

  function scheduleRefresh(tokens: TokenSet): void {
    if (refreshTimer) clearTimeout(refreshTimer);
    if (!tokens.expires_at || !tokens.refresh_token) return;
    const now = Math.floor(Date.now() / 1000);
    const delay = Math.max(0, (tokens.expires_at - now - refreshBuffer)) * 1000;
    refreshTimer = setTimeout(() => refreshAccessToken(tokens.refresh_token!), delay);
  }

  async function refreshAccessToken(refreshToken: string): Promise<void> {
    try {
      const cfg = await discover();
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.clientId,
        refresh_token: refreshToken,
      });
      const res = await fetch(cfg.token_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) { clearTokens(); return; }
      const data = await res.json();
      const newTokens: TokenSet = {
        access_token: data.access_token,
        id_token: data.id_token,
        refresh_token: data.refresh_token ?? refreshToken,
        expires_at: data.expires_in ? Math.floor(Date.now() / 1000) + data.expires_in : undefined,
        token_type: data.token_type ?? 'Bearer',
      };
      setTokens(newTokens);
    } catch {
      clearTokens();
    }
  }

  // ── Token Exchange ───────────────────────────────────────

  async function exchangeCode(code: string): Promise<TokenSet> {
    const cfg = await discover();
    const verifier = storage.getItem(`${STORAGE_PREFIX}pkce_verifier`);
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      code,
      redirect_uri: config.redirectUri,
      ...(verifier ? { code_verifier: verifier } : {}),
    });
    const res = await fetch(cfg.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
    const data = await res.json();
    const tokens: TokenSet = {
      access_token: data.access_token,
      id_token: data.id_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in ? Math.floor(Date.now() / 1000) + data.expires_in : undefined,
      token_type: data.token_type ?? 'Bearer',
    };
    setTokens(tokens);
    storage.removeItem(`${STORAGE_PREFIX}pkce_verifier`);
    storage.removeItem(`${STORAGE_PREFIX}state`);
    return tokens;
  }

  // ── Default Identity Mapper ──────────────────────────────

  function defaultMapIdentity(userinfo: Record<string, unknown>): Identity {
    return {
      id: (userinfo.sub as string) ?? '',
      name: (userinfo.name as string) ?? (userinfo.preferred_username as string) ?? '',
      avatar: (userinfo.picture as string) ?? undefined,
      email: (userinfo.email as string) ?? undefined,
    };
  }

  const mapIdentity = config.mapIdentity ?? defaultMapIdentity;

  // ── AuthProvider Implementation ──────────────────────────

  return {
    async login() {
      const cfg = await discover();
      const { verifier, challenge } = await createPKCEChallenge();
      const state = generateRandomString(32);

      storage.setItem(`${STORAGE_PREFIX}pkce_verifier`, verifier);
      storage.setItem(`${STORAGE_PREFIX}state`, state);

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: scopes.join(' '),
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      });

      // Redirect to authorization endpoint
      window.location.href = `${cfg.authorization_endpoint}?${params}`;

      // Won't actually reach here due to redirect
      return { success: true };
    },

    async logout() {
      const cfg = await discover();
      const tokens = getTokens();
      clearTokens();

      if (cfg.end_session_endpoint && tokens?.id_token) {
        const params = new URLSearchParams({
          id_token_hint: tokens.id_token,
          ...(config.postLogoutRedirectUri
            ? { post_logout_redirect_uri: config.postLogoutRedirectUri }
            : {}),
        });
        window.location.href = `${cfg.end_session_endpoint}?${params}`;
        return { success: true };
      }

      return {
        success: true,
        redirectTo: config.postLogoutRedirectUri ?? '/',
      };
    },

    async check() {
      // Handle callback — exchange authorization code for tokens
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (code) {
        const savedState = storage.getItem(`${STORAGE_PREFIX}state`);
        if (state && savedState && state !== savedState) {
          return { authenticated: false, error: { message: 'State mismatch' } };
        }
        try {
          await exchangeCode(code);
          // Clean URL
          url.searchParams.delete('code');
          url.searchParams.delete('state');
          window.history.replaceState({}, '', url.pathname);
          return { authenticated: true };
        } catch (err) {
          return { authenticated: false, error: { message: String(err) } };
        }
      }

      // Check existing tokens
      const tokens = getTokens();
      if (!tokens) {
        return { authenticated: false, logout: true };
      }

      // Check expiry
      if (tokens.expires_at && tokens.expires_at < Math.floor(Date.now() / 1000)) {
        if (tokens.refresh_token) {
          await refreshAccessToken(tokens.refresh_token);
          const refreshed = getTokens();
          if (refreshed) return { authenticated: true };
        }
        clearTokens();
        return { authenticated: false, logout: true };
      }

      // Schedule refresh if not already done
      if (autoRefresh && tokens.refresh_token && tokens.expires_at) {
        scheduleRefresh(tokens);
      }

      return { authenticated: true };
    },

    async getIdentity(): Promise<Identity | null> {
      const tokens = getTokens();
      if (!tokens) return null;

      try {
        const cfg = await discover();
        const res = await fetch(cfg.userinfo_endpoint, {
          headers: { Authorization: `${tokens.token_type} ${tokens.access_token}` },
        });
        if (!res.ok) return null;
        const userinfo = await res.json();
        return mapIdentity(userinfo);
      } catch {
        return null;
      }
    },

    async getPermissions() {
      const tokens = getTokens();
      if (!tokens) return null;

      // Try to extract roles/permissions from the ID token
      if (tokens.id_token) {
        try {
          const payload = JSON.parse(atob(tokens.id_token.split('.')[1]));
          return payload.roles ?? payload.groups ?? payload.permissions ?? null;
        } catch {
          return null;
        }
      }

      return null;
    },

    async onError(error) {
      if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode;
        if (statusCode === 401 || statusCode === 403) {
          return { logout: true, redirectTo: '/login' };
        }
      }
      return {};
    },
  };
}
