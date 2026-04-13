// Simple REST AuthProvider — JWT/Cookie-based, zero dependencies

import type { AuthProvider, Identity, AuthActionResult, CheckResult } from '@svadmin/core';

export interface SimpleRestAuthOptions {
  loginUrl: string;
  logoutUrl?: string;
  identityUrl?: string;
  /** Storage key for JWT token. Set to null for cookie-based auth. */
  tokenKey?: string | null;
}

export function createSimpleRestAuthProvider(opts: SimpleRestAuthOptions): AuthProvider {
  const { tokenKey = 'auth_token' } = opts;

  function getAuthHeader(): Record<string, string> {
    if (!tokenKey || typeof window === 'undefined') return {};
    const token = localStorage.getItem(tokenKey);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  return {
    async login(params: Record<string, unknown>): Promise<AuthActionResult> {
      try {
        const response = await fetch(opts.loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          credentials: 'include',
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Login failed' }));
          return { success: false, error: { message: error.message ?? 'Login failed' } };
        }
        const data = await response.json();
        if (tokenKey && data.token && typeof window !== 'undefined') {
          localStorage.setItem(tokenKey, data.token);
        }
        return { success: true, redirectTo: '/' };
      } catch (e) {
        return { success: false, error: { message: e instanceof Error ? e.message : 'Login failed' } };
      }
    },

    async logout(): Promise<AuthActionResult> {
      if (opts.logoutUrl) {
        await fetch(opts.logoutUrl, {
          method: 'POST',
          headers: getAuthHeader(),
          credentials: 'include',
        }).catch((e) => console.warn('[auth] logout request failed:', e));
      }
      if (tokenKey && typeof window !== 'undefined') localStorage.removeItem(tokenKey);
      return { success: true, redirectTo: '/login' };
    },

    async check(): Promise<CheckResult> {
      if (tokenKey && typeof window !== 'undefined') {
        const token = localStorage.getItem(tokenKey);
        if (!token) return { authenticated: false, redirectTo: '/login', logout: true };
      }

      if (opts.identityUrl) {
        try {
          const response = await fetch(opts.identityUrl, {
            headers: getAuthHeader(),
            credentials: 'include',
          });
          if (response.ok) return { authenticated: true };
        } catch (e) { console.warn('[auth] identity check failed:', e); }
        return { authenticated: false, redirectTo: '/login', logout: true };
      }

      if (!tokenKey) {
        console.warn('[svadmin] Cookie-based auth without identityUrl: cannot verify session. Provide identityUrl for secure auth checking.');
        return { authenticated: false, redirectTo: '/login', logout: true };
      }

      return { authenticated: true };
    },

    async getIdentity(): Promise<Identity | null> {
      if (!opts.identityUrl) return null;
      try {
        const response = await fetch(opts.identityUrl, {
          headers: getAuthHeader(),
          credentials: 'include',
        });
        if (!response.ok) return null;
        return await response.json();
      } catch (e) {
        console.warn('[auth] getIdentity failed:', e);
        return null;
      }
    },
  };
}
