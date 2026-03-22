// Auth Hooks — reactive wrappers around AuthProvider methods
// Each hook encapsulates the auth call + loading state + error handling + redirect

import { getAuthProvider } from './context';
import { navigate } from './router';
import { toast } from './toast.svelte';
import { t } from './i18n.svelte';
import type { AuthActionResult, CheckResult, Identity } from './types';

// ─── useLogin ─────────────────────────────────────────────────

export function useLogin() {
  let isLoading = $state(false);

  async function mutate(params: Record<string, unknown>): Promise<AuthActionResult> {
    const provider = getAuthProvider();
    if (!provider) throw new Error('AuthProvider not configured');
    isLoading = true;
    try {
      const result = await provider.login(params);
      if (result.success) {
        toast.success(t('common.operationSuccess'));
        if (result.redirectTo) navigate(result.redirectTo);
      } else {
        const msg = result.error?.message ?? t('common.loginFailed');
        toast.error(msg);
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.loginFailed');
      toast.error(msg);
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

// ─── useLogout ────────────────────────────────────────────────

export function useLogout() {
  let isLoading = $state(false);

  async function mutate(params?: Record<string, unknown>): Promise<AuthActionResult> {
    const provider = getAuthProvider();
    if (!provider) throw new Error('AuthProvider not configured');
    isLoading = true;
    try {
      const result = await provider.logout(params);
      if (result.success) {
        navigate(result.redirectTo ?? '/login');
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.operationFailed');
      toast.error(msg);
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

// ─── useRegister ──────────────────────────────────────────────

export function useRegister() {
  let isLoading = $state(false);

  async function mutate(params: Record<string, unknown>): Promise<AuthActionResult> {
    const provider = getAuthProvider();
    if (!provider?.register) throw new Error('AuthProvider.register not implemented');
    isLoading = true;
    try {
      const result = await provider.register(params);
      if (result.success) {
        toast.success(t('auth.registerSuccess'));
        if (result.redirectTo) navigate(result.redirectTo);
      } else {
        const msg = result.error?.message ?? t('common.operationFailed');
        toast.error(msg);
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.operationFailed');
      toast.error(msg);
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

// ─── useForgotPassword ───────────────────────────────────────

export function useForgotPassword() {
  let isLoading = $state(false);

  async function mutate(params: Record<string, unknown>): Promise<AuthActionResult> {
    const provider = getAuthProvider();
    if (!provider?.forgotPassword) throw new Error('AuthProvider.forgotPassword not implemented');
    isLoading = true;
    try {
      const result = await provider.forgotPassword(params);
      if (result.success) {
        toast.success(t('auth.resetLinkSent'));
      } else {
        const msg = result.error?.message ?? t('common.operationFailed');
        toast.error(msg);
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.operationFailed');
      toast.error(msg);
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

// ─── useUpdatePassword ───────────────────────────────────────

export function useUpdatePassword() {
  let isLoading = $state(false);

  async function mutate(params: Record<string, unknown>): Promise<AuthActionResult> {
    const provider = getAuthProvider();
    if (!provider?.updatePassword) throw new Error('AuthProvider.updatePassword not implemented');
    isLoading = true;
    try {
      const result = await provider.updatePassword(params);
      if (result.success) {
        toast.success(t('common.operationSuccess'));
        if (result.redirectTo) navigate(result.redirectTo);
      } else {
        const msg = result.error?.message ?? t('common.operationFailed');
        toast.error(msg);
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.operationFailed');
      toast.error(msg);
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

// ─── useGetIdentity ──────────────────────────────────────────

export function useGetIdentity() {
  let data = $state<Identity | null>(null);
  let isLoading = $state(true);
  let error = $state<Error | null>(null);

  const provider = getAuthProvider();
  if (provider) {
    provider.getIdentity().then(identity => {
      data = identity;
      isLoading = false;
    }).catch(err => {
      error = err instanceof Error ? err : new Error(String(err));
      isLoading = false;
      console.warn('[svadmin] useGetIdentity failed:', err);
    });
  } else {
    isLoading = false;
  }

  return {
    get data() { return data; },
    get isLoading() { return isLoading; },
    get error() { return error; },
  };
}

// ─── useIsAuthenticated ──────────────────────────────────────

export function useIsAuthenticated() {
  let isAuthenticated = $state(false);
  let isLoading = $state(true);

  const provider = getAuthProvider();
  if (provider) {
    provider.check().then((result: CheckResult) => {
      isAuthenticated = result.authenticated;
      isLoading = false;
    }).catch(() => {
      isAuthenticated = false;
      isLoading = false;
    });
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
