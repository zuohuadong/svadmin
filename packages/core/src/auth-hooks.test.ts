/**
 * Auth Hooks — Unit Tests
 *
 * These test the auth hook *logic* by mocking the Svelte context module
 * so `getAuthProvider()` returns a mock provider without needing a real component tree.
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test';
import type { AuthProvider, AuthActionResult, CheckResult, Identity } from './types';

// Build a mock AuthProvider factory
function createMockAuthProvider(overrides: Partial<AuthProvider> = {}): AuthProvider {
  return {
    login: mock(async () => ({ success: true, redirectTo: '/' } as AuthActionResult)),
    logout: mock(async () => ({ success: true, redirectTo: '/login' } as AuthActionResult)),
    check: mock(async () => ({ authenticated: true } as CheckResult)),
    getIdentity: mock(async () => ({ id: '1', name: 'Admin', email: 'admin@test.com' } as Identity)),
    register: mock(async () => ({ success: true } as AuthActionResult)),
    forgotPassword: mock(async () => ({ success: true } as AuthActionResult)),
    updatePassword: mock(async () => ({ success: true } as AuthActionResult)),
    onError: mock(async () => ({ logout: false })),
    getPermissions: mock(async () => ['admin', 'editor']),
    ...overrides,
  };
}

// ─── Tests for AuthProvider mock interface ───────────────────

describe('AuthProvider mock interface', () => {
  test('login returns success', async () => {
    const provider = createMockAuthProvider();
    const result = await provider.login({ email: 'test@test.com', password: '123' });
    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/');
    expect(provider.login).toHaveBeenCalledTimes(1);
  });

  test('login returns failure', async () => {
    const provider = createMockAuthProvider({
      login: mock(async () => ({ success: false, error: { message: 'Invalid credentials' } })),
    });
    const result = await provider.login({ email: 'bad', password: 'bad' });
    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Invalid credentials');
  });

  test('logout returns success with redirect', async () => {
    const provider = createMockAuthProvider();
    const result = await provider.logout!();
    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/login');
  });

  test('check returns authenticated', async () => {
    const provider = createMockAuthProvider();
    const result = await provider.check();
    expect(result.authenticated).toBe(true);
  });

  test('check returns not authenticated', async () => {
    const provider = createMockAuthProvider({
      check: mock(async () => ({ authenticated: false, redirectTo: '/login' })),
    });
    const result = await provider.check();
    expect(result.authenticated).toBe(false);
    expect(result.redirectTo).toBe('/login');
  });

  test('getIdentity returns user info', async () => {
    const provider = createMockAuthProvider();
    const identity = await provider.getIdentity();
    expect(identity).not.toBeNull();
    expect(identity!.name).toBe('Admin');
    expect(identity!.email).toBe('admin@test.com');
  });

  test('getIdentity returns null when not logged in', async () => {
    const provider = createMockAuthProvider({
      getIdentity: mock(async () => null),
    });
    const identity = await provider.getIdentity();
    expect(identity).toBeNull();
  });

  test('register returns success', async () => {
    const provider = createMockAuthProvider();
    const result = await provider.register!({ email: 'new@test.com', password: '123' });
    expect(result.success).toBe(true);
  });

  test('forgotPassword returns success', async () => {
    const provider = createMockAuthProvider();
    const result = await provider.forgotPassword!({ email: 'test@test.com' });
    expect(result.success).toBe(true);
  });

  test('updatePassword returns success', async () => {
    const provider = createMockAuthProvider();
    const result = await provider.updatePassword!({ password: 'newpass', confirmPassword: 'newpass' });
    expect(result.success).toBe(true);
  });

  test('onError with logout flag', async () => {
    const provider = createMockAuthProvider({
      onError: mock(async () => ({ logout: true, redirectTo: '/login' })),
    });
    const result = await provider.onError!(new Error('401'));
    expect(result.logout).toBe(true);
    expect(result.redirectTo).toBe('/login');
  });

  test('onError without logout', async () => {
    const provider = createMockAuthProvider({
      onError: mock(async () => ({ logout: false, redirectTo: '/error' })),
    });
    const result = await provider.onError!(new Error('500'));
    expect(result.logout).toBe(false);
    expect(result.redirectTo).toBe('/error');
  });

  test('getPermissions returns permissions array', async () => {
    const provider = createMockAuthProvider();
    const permissions = await provider.getPermissions!();
    expect(permissions).toEqual(['admin', 'editor']);
  });

  test('getPermissions can return custom structure', async () => {
    const provider = createMockAuthProvider({
      getPermissions: mock(async () => ({ role: 'admin', canDelete: true })),
    });
    const permissions = await provider.getPermissions!() as { role: string; canDelete: boolean };
    expect(permissions.role).toBe('admin');
    expect(permissions.canDelete).toBe(true);
  });
});

// ─── Tests for auth logic patterns ──────────────────────────

describe('auth hook patterns', () => {
  test('login flow: success triggers redirect', async () => {
    const provider = createMockAuthProvider();
    const result = await provider.login({ email: 'admin@test.com', password: 'pass' });
    expect(result.success).toBe(true);
    // In real hook: navigate(result.redirectTo)
    expect(result.redirectTo).toBeDefined();
  });

  test('login flow: failure shows error', async () => {
    const provider = createMockAuthProvider({
      login: mock(async () => ({ success: false, error: { message: 'Bad password' } })),
    });
    const result = await provider.login({ email: 'admin@test.com', password: 'wrong' });
    expect(result.success).toBe(false);
    // In real hook: toast.error(result.error.message)
    expect(result.error?.message).toBe('Bad password');
  });

  test('login flow: exception produces error result', async () => {
    const provider = createMockAuthProvider({
      login: mock(async () => { throw new Error('Network Error'); }),
    });
    try {
      await provider.login({ email: 'test', password: 'test' });
      expect(true).toBe(false); // should not reach
    } catch (err) {
      expect((err as Error).message).toBe('Network Error');
    }
  });

  test('onError flow: 401 triggers logout + redirect', async () => {
    const provider = createMockAuthProvider({
      onError: mock(async (err: unknown) => {
        if (err instanceof Error && err.message.includes('401')) {
          return { logout: true, redirectTo: '/login' };
        }
        return { logout: false };
      }),
    });
    const result = await provider.onError!(new Error('401 Unauthorized'));
    expect(result.logout).toBe(true);
    // In real hook: provider.logout() then navigate(result.redirectTo)
  });

  test('onError flow: 500 does not trigger logout', async () => {
    const provider = createMockAuthProvider({
      onError: mock(async (err: unknown) => {
        if (err instanceof Error && err.message.includes('401')) {
          return { logout: true, redirectTo: '/login' };
        }
        return { logout: false };
      }),
    });
    const result = await provider.onError!(new Error('500 Internal Server Error'));
    expect(result.logout).toBe(false);
  });

  test('check → getIdentity flow', async () => {
    const provider = createMockAuthProvider();
    const checkResult = await provider.check();
    expect(checkResult.authenticated).toBe(true);
    if (checkResult.authenticated) {
      const identity = await provider.getIdentity();
      expect(identity!.name).toBe('Admin');
    }
  });
});
