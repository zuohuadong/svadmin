// Hook Utilities — shared reactive helpers for all hooks
// Uses Svelte 5 runes ($state, $effect) for automatic lifecycle management

import { useQueryClient } from '@tanstack/svelte-query';
import type { LiveProvider, LiveEvent, LiveMode } from './live.svelte';
import { getAuthProvider } from './context.svelte';
import { notify } from './notification.svelte';

// ─── Auth Error Delegate ────────────────────────────────────────
// Delegate auth errors (401/403) to authProvider.onError() — refine pattern

export async function checkError(error: unknown): Promise<void> {
  try {
    const authProvider = getAuthProvider({ optional: true });
    if (authProvider?.onError) {
      const result = await authProvider.onError(error);
      if (!result) return;
      if (result.logout) {
        try { await authProvider.logout?.(); } catch { /* logout failure should not block redirect */ }
        const { navigate } = await import('./router');
        navigate(result.redirectTo ?? '/login');
      } else if (result.redirectTo) {
        const { navigate } = await import('./router');
        navigate(result.redirectTo);
      }
      return;
    }
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const status = (error as { statusCode: number }).statusCode;
      if (status === 401 || status === 403) {
        const { navigate } = await import('./router');
        navigate('/login');
      }
    }
  } catch { /* auth check failed silently */ }
}

// ─── Overtime Tracker ───────────────────────────────────────────
// Tracks elapsed time during loading, auto-cleans via $effect

export interface OvertimeOptions {
  interval?: number; // ms, default 1000
  onInterval?: (elapsedTime: number) => void;
}

export interface OvertimeResult {
  readonly elapsedTime: number;
}

export function createOvertimeTracker(
  isLoadingFn: () => boolean,
  options: OvertimeOptions = {},
): OvertimeResult {
  const { interval = 1000, onInterval } = options;
  let elapsedTime = $state(0);

  $effect(() => {
    if (isLoadingFn()) {
      elapsedTime = 0;
      const timer = setInterval(() => {
        elapsedTime += interval;
        onInterval?.(elapsedTime);
      }, interval);
      return () => clearInterval(timer);
    } else {
      elapsedTime = 0;
    }
  });

  return {
    get elapsedTime() { return elapsedTime; },
  };
}

// ─── Live Subscription ──────────────────────────────────────────
// Auto-subscribes to realtime events, invalidates queries on 'auto' mode

export interface LiveSubscriptionParams {
  resource: string;
  liveProvider?: LiveProvider;
  liveMode?: LiveMode;
  onLiveEvent?: (event: LiveEvent) => void;
  liveParams?: Record<string, unknown>;
  enabled?: boolean;
  dataProviderName?: string;
}

export function createLiveSubscription(paramsFn: () => LiveSubscriptionParams): void {
  const queryClient = useQueryClient();

  $effect(() => {
    const params = paramsFn();
    const liveProvider = params.liveProvider;
    const liveMode = params.liveMode ?? 'off';
    const enabled = params.enabled ?? true;

    if (!liveProvider || liveMode === 'off' || !enabled) return;

    const unsubscribe = liveProvider.subscribe({
      resource: params.resource,
      liveParams: params.liveParams,
      callback: (event: LiveEvent) => {
        params.onLiveEvent?.(event);
        if (liveMode === 'auto') {
          const dpN = params.dataProviderName;
          const dpMatch = (q: { queryKey: readonly unknown[] }) => q.queryKey[0] === dpN;
          queryClient.invalidateQueries({ predicate: (q) => dpMatch(q) && q.queryKey[1] === params.resource });
        }
      },
    });
    return unsubscribe;
  });
}

// ─── Notification Helpers ───────────────────────────────────────

export type NotificationConfig =
  | string
  | false
  | ((data?: unknown, values?: unknown, resource?: string) => { message: string; description?: string; type?: 'success' | 'error' })
  | undefined;

export function fireSuccessNotification(
  config: NotificationConfig,
  defaultMessage: string,
  data?: unknown,
  values?: unknown,
  resource?: string,
): void {
  if (config === false) return;
  if (!config && !defaultMessage) return;
  if (typeof config === 'function') {
    const result = config(data, values, resource);
    notify({ type: 'success', message: result.message, description: result.description });
    return;
  }
  notify({ type: 'success', message: config || defaultMessage });
}

export function fireErrorNotification(
  config: NotificationConfig,
  defaultMessage: string,
  error?: unknown,
  resource?: string,
): void {
  if (config === false) return;
  if (!config && !defaultMessage) return;
  if (typeof config === 'function') {
    const result = config(error, undefined, resource);
    notify({ type: 'error', message: result.message, description: result.description });
    return;
  }
  const errMsg = error instanceof Error ? error.message : String(error ?? '');
  notify({ type: 'error', message: config || `${defaultMessage}${errMsg ? ': ' + errMsg : ''}` });
}
