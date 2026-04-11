// Auth Hooks — reactive wrappers around AuthProvider methods
// Each hook encapsulates the auth call + loading state + error handling + redirect
// Uses module-level $state — no component init-time constraints.

import { getAuthProvider } from './context.svelte';
import { navigate } from './router';
import { notify } from './notification.svelte';
import { t } from './i18n.svelte';
import type { AuthActionResult, CheckResult, Identity, AuthProvider } from './types';

// ─── Mutate Factory ─────────────────────────────────────────────

interface CreateAuthMutationOptions {
  method: keyof AuthProvider;
  successMessage?: string | null;
  errorMessage?: string;
  onSuccess?: (result: AuthActionResult) => void;
}

function createAuthMutation(options: CreateAuthMutationOptions) {
  const provider = getAuthProvider();
  let isLoading = $state(false);

  async function mutate(params?: Record<string, unknown>): Promise<AuthActionResult> {
    if (!provider) throw new Error('AuthProvider not configured');
    const fn = provider[options.method] as ((params?: Record<string, unknown>) => Promise<AuthActionResult>) | undefined;
    if (!fn) throw new Error(`AuthProvider.${options.method} not implemented`);
    
    isLoading = true;
    try {
      const result = await fn.call(provider, params);
      if (result.success) {
        if (options.successMessage) notify({ type: 'success', message: options.successMessage });
        if (options.onSuccess) options.onSuccess(result);
      } else {
        const msg = result.error?.message ?? options.errorMessage ?? t('common.operationFailed');
        notify({ type: 'error', message: msg });
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : (options.errorMessage ?? t('common.operationFailed'));
      notify({ type: 'error', message: msg });
      return { success: false, error: { message: msg } };
    } finally {
      isLoading = false;
    }
  }

  return {
    mutate,
    get isLoading() { return isLoading; },
  };
}

// ─── useLogin ─────────────────────────────────────────────────

export function useLogin() {
  return createAuthMutation({
    method: 'login',
    successMessage: t('common.operationSuccess'),
    errorMessage: t('common.loginFailed'),
    onSuccess: (result) => { if (result.redirectTo) navigate(result.redirectTo); }
  });
}

// ─── useLogout ────────────────────────────────────────────────

export function useLogout() {
  return createAuthMutation({
    method: 'logout',
    successMessage: null,
    onSuccess: (result) => { navigate(result.redirectTo ?? '/login'); }
  });
}

// ─── useRegister ──────────────────────────────────────────────

export function useRegister() {
  return createAuthMutation({
    method: 'register',
    successMessage: t('auth.registerSuccess'),
    onSuccess: (result) => { if (result.redirectTo) navigate(result.redirectTo); }
  });
}

// ─── useForgotPassword ───────────────────────────────────────

export function useForgotPassword() {
  return createAuthMutation({
    method: 'forgotPassword',
    successMessage: t('auth.resetLinkSent')
  });
}

// ─── useUpdatePassword ───────────────────────────────────────

export function useUpdatePassword() {
  return createAuthMutation({
    method: 'updatePassword',
    successMessage: t('common.operationSuccess'),
    onSuccess: (result) => { if (result.redirectTo) navigate(result.redirectTo); }
  });
}

// ─── useGetIdentity ──────────────────────────────────────────

export function useGetIdentity() {
  const provider = getAuthProvider();
  let data = $state<Identity | null>(null);
  let isLoading = $state(true);
  let error = $state<Error | null>(null);

  function fetch() {
    if (!provider) { isLoading = false; return; }
    isLoading = true;
    provider.getIdentity().then(identity => {
      data = identity;
      isLoading = false;
    }).catch(err => {
      error = err instanceof Error ? err : new Error(String(err));
      isLoading = false;
      console.warn('[svadmin] useGetIdentity failed:', err);
    });
  }

  if (typeof window !== 'undefined') {
    fetch();
  }

  return {
    get data() { return data; },
    get isLoading() { return isLoading; },
    get error() { return error; },
    refetch: fetch,
  };
}

// ─── useIsAuthenticated ──────────────────────────────────────

export function useIsAuthenticated() {
  const provider = getAuthProvider();
  let isAuthenticated = $state(false);
  let isLoading = $state(true);

  if (provider) {
    if (typeof window !== 'undefined') {
      provider.check().then((result: CheckResult) => {
        isAuthenticated = result.authenticated;
        isLoading = false;
      }).catch(() => {
        isAuthenticated = false;
        isLoading = false;
      });
    } else {
      // In SSR we assume false to prevent hydration mismatch before check
      isAuthenticated = false;
      isLoading = false;
    }
  } else {
    // No auth provider — treat as authenticated
    isAuthenticated = true;
    isLoading = false;
  }

  return {
    get isAuthenticated() { return isAuthenticated; },
    get isLoading() { return isLoading; },
  };
}

// ─── useOnError ──────────────────────────────────────────────

/**
 * Handles errors from data hooks by calling authProvider.onError().
 * If the provider returns { logout: true }, triggers logout flow.
 * If it returns { redirectTo }, navigates there.
 */
export function useOnError() {
  const provider = getAuthProvider();

  async function mutate(error: unknown) {
    if (!provider?.onError) {
      console.warn('[svadmin] useOnError: authProvider.onError not implemented');
      return;
    }
    try {
      const result = await provider.onError(error);
      if (result.logout) {
        await provider.logout?.();
        navigate(result.redirectTo ?? '/login');
      } else if (result.redirectTo) {
        navigate(result.redirectTo);
      }
    } catch (err) {
      console.warn('[svadmin] useOnError failed:', err);
    }
  }

  return { mutate };
}

// ─── usePermissions ──────────────────────────────────────────

/**
 * Fetches permissions from authProvider.getPermissions().
 * Returns a reactive object with convenience methods for permission checks.
 * 
 * Supports `refetch()` for session-level permission refresh (e.g., after role change).
 * 
 * @example
 * ```svelte
 * <script>
 *   import { usePermissions } from '@svadmin/core';
 *   const perms = usePermissions();
 *   const canAdmin = $derived(perms.has('admin'));
 * </script>
 * ```
 */
export function usePermissions<T = unknown>() {
  const provider = getAuthProvider();
  let permissions = $state<T | null>(null);
  let isLoading = $state(true);
  let error = $state<Error | null>(null);
  let version = $state(0);

  function fetch() {
    if (!provider?.getPermissions) { isLoading = false; return; }
    isLoading = true;
    error = null;
    provider.getPermissions().then(p => {
      permissions = p as T;
      version++;
      isLoading = false;
    }).catch(err => {
      error = err instanceof Error ? err : new Error(String(err));
      isLoading = false;
      console.warn('[svadmin] usePermissions failed:', err);
    });
  }

  if (typeof window !== 'undefined') {
    fetch();
  }

  const hasFn = (perm: string): boolean => {
    if (!permissions) return false;
    if (Array.isArray(permissions)) return permissions.includes(perm);
    if (permissions instanceof Set) return (permissions as Set<string>).has(perm);
    if (typeof permissions === 'object') return !!(permissions as Record<string, boolean>)[perm];
    return false;
  };

  return {
    get isLoading() { return isLoading; },
    get error() { return error; },
    get version() { return version; },
    get raw() { return permissions; },
    refetch: fetch,

    /** Check if a specific permission string exists */
    has: hasFn,

    /** Check resource:action style permission */
    can: (resource: string, action: string): boolean => hasFn(`${resource}:${action}`),
  };
}

