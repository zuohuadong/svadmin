import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { createSSOAuthProvider, type TokenStorage } from './auth-provider';

const STORAGE_PREFIX = 'svadmin_sso_';

type FetchCall = {
  url: string;
  init?: RequestInit;
};

function createMemoryStorage(): TokenStorage & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  };
}

function installWindow(href = 'http://app.test/'): void {
  const testWindow = {
    location: {
      href,
      origin: new URL(href).origin,
    },
    history: {
      replaceState: (_state: unknown, _title: string, url: string) => {
        testWindow.location.href = new URL(url, testWindow.location.href).href;
      },
    },
  };

  Object.defineProperty(globalThis, 'window', {
    value: testWindow,
    configurable: true,
    writable: true,
  });
}

function uninstallWindow(): void {
  Reflect.deleteProperty(globalThis, 'window');
}

function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function installFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>): FetchCall[] {
  const calls: FetchCall[] = [];
  Object.defineProperty(globalThis, 'fetch', {
    value: async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      return handler(url, init);
    },
    configurable: true,
    writable: true,
  });
  return calls;
}

function uninstallFetch(): void {
  Reflect.deleteProperty(globalThis, 'fetch');
}

function formBody(init?: RequestInit): URLSearchParams {
  expect(init?.body).toBeInstanceOf(URLSearchParams);
  const body = init?.body;
  if (!(body instanceof URLSearchParams)) {
    throw new Error('Expected URLSearchParams body');
  }
  return body;
}

function jwt(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${encoded}.signature`;
}

const manualEndpoints = {
  authorization_endpoint: 'https://idp.test/oauth2/authorize',
  token_endpoint: 'https://idp.test/oauth2/token',
  userinfo_endpoint: 'https://idp.test/oauth2/userinfo',
  end_session_endpoint: 'https://idp.test/oauth2/logout',
};

describe('createSSOAuthProvider', () => {
  beforeEach(() => {
    installWindow();
  });

  afterEach(() => {
    uninstallWindow();
    uninstallFetch();
  });

  test('starts OIDC authorization code flow with PKCE and custom params', async () => {
    const storage = createMemoryStorage();
    const provider = createSSOAuthProvider({
      issuer: 'https://idp.test',
      clientId: 'admin-console',
      redirectUri: 'http://app.test/callback',
      storage,
      autoRefresh: false,
      authorizationParams: {
        audience: 'admin-api',
        prompt: 'login',
      },
      manualEndpoints,
    });

    const result = await provider.login({});
    expect(result.success).toBe(true);

    const redirectUrl = new URL(window.location.href);
    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(manualEndpoints.authorization_endpoint);
    expect(redirectUrl.searchParams.get('response_type')).toBe('code');
    expect(redirectUrl.searchParams.get('client_id')).toBe('admin-console');
    expect(redirectUrl.searchParams.get('redirect_uri')).toBe('http://app.test/callback');
    expect(redirectUrl.searchParams.get('scope')).toBe('openid profile email');
    expect(redirectUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(redirectUrl.searchParams.get('audience')).toBe('admin-api');
    expect(redirectUrl.searchParams.get('prompt')).toBe('login');
    expect(redirectUrl.searchParams.get('state')).toBe(storage.getItem(`${STORAGE_PREFIX}state`));
    expect(storage.getItem(`${STORAGE_PREFIX}pkce_verifier`)).toBeTruthy();
    expect(redirectUrl.searchParams.get('code_challenge')).toBeTruthy();
    expect(redirectUrl.searchParams.get('code_challenge')).not.toBe(storage.getItem(`${STORAGE_PREFIX}pkce_verifier`));
  });

  test('discovers OIDC endpoints before redirecting to the authorization server', async () => {
    const storage = createMemoryStorage();
    const calls = installFetch((url) => {
      expect(url).toBe('https://issuer.test/.well-known/openid-configuration');
      return jsonResponse(manualEndpoints);
    });
    const provider = createSSOAuthProvider({
      issuer: 'https://issuer.test/',
      clientId: 'admin-console',
      redirectUri: 'http://app.test/callback',
      storage,
      autoRefresh: false,
    });

    const result = await provider.login({});

    expect(result.success).toBe(true);
    expect(calls).toHaveLength(1);
    expect(new URL(window.location.href).origin).toBe('https://idp.test');
  });

  test('exchanges callback code, stores tokens, and preserves unrelated URL parts', async () => {
    const storage = createMemoryStorage();
    storage.setItem(`${STORAGE_PREFIX}pkce_verifier`, 'verifier-123');
    storage.setItem(`${STORAGE_PREFIX}state`, 'state-123');
    installWindow('http://app.test/callback?code=code-123&state=state-123&next=%2Fdashboard#top');

    const calls = installFetch((_url, _init) => jsonResponse({
      access_token: 'access-123',
      id_token: jwt({ roles: ['admin'] }),
      refresh_token: 'refresh-123',
      expires_in: 3600,
      token_type: 'Bearer',
    }));
    const provider = createSSOAuthProvider({
      issuer: 'https://idp.test',
      clientId: 'admin-console',
      redirectUri: 'http://app.test/callback',
      storage,
      autoRefresh: false,
      manualEndpoints,
    });

    const result = await provider.check();

    expect(result).toEqual({ authenticated: true });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(manualEndpoints.token_endpoint);
    const body = formBody(calls[0]?.init);
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('client_id')).toBe('admin-console');
    expect(body.get('code')).toBe('code-123');
    expect(body.get('redirect_uri')).toBe('http://app.test/callback');
    expect(body.get('code_verifier')).toBe('verifier-123');
    expect(window.location.href).toBe('http://app.test/callback?next=%2Fdashboard#top');
    expect(storage.getItem(`${STORAGE_PREFIX}pkce_verifier`)).toBeNull();
    expect(storage.getItem(`${STORAGE_PREFIX}state`)).toBeNull();
    expect(await provider.getAccessToken()).toBe('access-123');
    expect(await provider.getPermissions?.()).toEqual(['admin']);
  });

  test('rejects callback codes without matching state', async () => {
    const storage = createMemoryStorage();
    storage.setItem(`${STORAGE_PREFIX}pkce_verifier`, 'verifier-123');
    storage.setItem(`${STORAGE_PREFIX}state`, 'state-123');
    installWindow('http://app.test/callback?code=code-123&state=wrong-state');

    const calls = installFetch(() => jsonResponse({ access_token: 'access-123' }));
    const provider = createSSOAuthProvider({
      issuer: 'https://idp.test',
      clientId: 'admin-console',
      redirectUri: 'http://app.test/callback',
      storage,
      autoRefresh: false,
      manualEndpoints,
    });

    const result = await provider.check();

    expect(result.authenticated).toBe(false);
    expect(result.error?.message).toBe('State mismatch');
    expect(calls).toHaveLength(0);
    expect(storage.getItem(`${STORAGE_PREFIX}pkce_verifier`)).toBeNull();
    expect(storage.getItem(`${STORAGE_PREFIX}state`)).toBeNull();
  });

  test('surfaces OAuth callback errors and clears transient state', async () => {
    const storage = createMemoryStorage();
    storage.setItem(`${STORAGE_PREFIX}pkce_verifier`, 'verifier-123');
    storage.setItem(`${STORAGE_PREFIX}state`, 'state-123');
    installWindow('http://app.test/callback?error=access_denied&error_description=Denied');
    const provider = createSSOAuthProvider({
      issuer: 'https://idp.test',
      clientId: 'admin-console',
      redirectUri: 'http://app.test/callback',
      storage,
      autoRefresh: false,
      manualEndpoints,
    });

    const result = await provider.check();

    expect(result.authenticated).toBe(false);
    expect(result.logout).toBe(true);
    expect(result.error).toEqual({ message: 'Denied', name: 'access_denied' });
    expect(storage.getItem(`${STORAGE_PREFIX}pkce_verifier`)).toBeNull();
    expect(storage.getItem(`${STORAGE_PREFIX}state`)).toBeNull();
  });

  test('refreshes expired tokens during auth checks and access-token reads', async () => {
    const storage = createMemoryStorage();
    storage.setItem(`${STORAGE_PREFIX}tokens`, JSON.stringify({
      access_token: 'expired-access',
      refresh_token: 'refresh-123',
      expires_at: Math.floor(Date.now() / 1000) - 5,
      token_type: 'Bearer',
    }));
    const calls = installFetch((_url, init) => {
      const body = formBody(init);
      expect(body.get('grant_type')).toBe('refresh_token');
      expect(body.get('client_id')).toBe('admin-console');
      expect(body.get('refresh_token')).toBe('refresh-123');
      return jsonResponse({
        access_token: 'fresh-access',
        refresh_token: 'refresh-456',
        expires_in: 3600,
        token_type: 'Bearer',
      });
    });
    const provider = createSSOAuthProvider({
      issuer: 'https://idp.test',
      clientId: 'admin-console',
      redirectUri: 'http://app.test/callback',
      storage,
      autoRefresh: false,
      manualEndpoints,
    });

    const result = await provider.check();

    expect(result).toEqual({ authenticated: true });
    expect(calls).toHaveLength(1);
    expect(await provider.getAccessToken()).toBe('fresh-access');
  });

  test('maps identity from userinfo endpoint', async () => {
    const storage = createMemoryStorage();
    storage.setItem(`${STORAGE_PREFIX}tokens`, JSON.stringify({
      access_token: 'access-123',
      token_type: 'Bearer',
    }));
    const calls = installFetch((url, init) => {
      expect(url).toBe(manualEndpoints.userinfo_endpoint);
      expect(init?.headers).toEqual({ Authorization: 'Bearer access-123' });
      return jsonResponse({
        sub: 'user-123',
        name: 'Admin User',
        email: 'admin@example.com',
        picture: 'https://example.com/avatar.png',
      });
    });
    const provider = createSSOAuthProvider({
      issuer: 'https://idp.test',
      clientId: 'admin-console',
      redirectUri: 'http://app.test/callback',
      storage,
      autoRefresh: false,
      manualEndpoints,
    });

    const identity = await provider.getIdentity();

    expect(calls).toHaveLength(1);
    expect(identity).toEqual({
      id: 'user-123',
      name: 'Admin User',
      email: 'admin@example.com',
      avatar: 'https://example.com/avatar.png',
    });
  });
});
