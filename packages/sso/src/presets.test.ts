/**
 * @svadmin/sso — Presets Unit Tests
 */
import { describe, test, expect } from 'bun:test';
import type { TokenStorage } from './auth-provider';

// In-memory storage for tests (localStorage not available in Bun test)
function createMemoryStorage(): TokenStorage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  };
}

describe('SSO presets', () => {
  // Import the module to verify it compiles correctly
  test('presets module exports all factories', async () => {
    const presets = await import('./presets');
    expect(typeof presets.createGoogleAuth).toBe('function');
    expect(typeof presets.createMicrosoftAuth).toBe('function');
    expect(typeof presets.createGitHubAuth).toBe('function');
    expect(typeof presets.createGitLabAuth).toBe('function');
    expect(typeof presets.createKeycloakAuth).toBe('function');
    expect(typeof presets.createAuth0Auth).toBe('function');
  });

  test('createGoogleAuth returns AuthProvider', async () => {
    const { createGoogleAuth } = await import('./presets');
    const provider = createGoogleAuth('test-client-id', {
      redirectUri: 'http://localhost/callback',
      storage: createMemoryStorage(),
    });
    expect(provider).toBeTruthy();
    expect(typeof provider.login).toBe('function');
    expect(typeof provider.logout).toBe('function');
    expect(typeof provider.check).toBe('function');
    expect(typeof provider.getIdentity).toBe('function');
  });

  test('createMicrosoftAuth accepts tenantId', async () => {
    const { createMicrosoftAuth } = await import('./presets');
    const provider = createMicrosoftAuth('test-id', 'my-tenant', {
      redirectUri: 'http://localhost/callback',
      storage: createMemoryStorage(),
    });
    expect(provider).toBeTruthy();
    expect(typeof provider.login).toBe('function');
  });

  test('createGitHubAuth returns AuthProvider', async () => {
    const { createGitHubAuth } = await import('./presets');
    const provider = createGitHubAuth('test-github-id', {
      redirectUri: 'http://localhost/callback',
      storage: createMemoryStorage(),
    });
    expect(provider).toBeTruthy();
    expect(typeof provider.login).toBe('function');
    expect(typeof provider.getIdentity).toBe('function');
  });

  test('createKeycloakAuth returns AuthProvider', async () => {
    const { createKeycloakAuth } = await import('./presets');
    const provider = createKeycloakAuth('https://kc.example.com', 'my-realm', 'client-id', {
      redirectUri: 'http://localhost/callback',
      storage: createMemoryStorage(),
    });
    expect(provider).toBeTruthy();
    expect(typeof provider.login).toBe('function');
  });

  test('createAuth0Auth returns AuthProvider', async () => {
    const { createAuth0Auth } = await import('./presets');
    const provider = createAuth0Auth('my-tenant.auth0.com', 'client-id', {
      redirectUri: 'http://localhost/callback',
      storage: createMemoryStorage(),
    });
    expect(provider).toBeTruthy();
    expect(typeof provider.login).toBe('function');
  });

  test('createGitLabAuth returns AuthProvider', async () => {
    const { createGitLabAuth } = await import('./presets');
    const provider = createGitLabAuth('test-id', 'https://gitlab.example.com', {
      redirectUri: 'http://localhost/callback',
      storage: createMemoryStorage(),
    });
    expect(provider).toBeTruthy();
    expect(typeof provider.login).toBe('function');
  });
});
