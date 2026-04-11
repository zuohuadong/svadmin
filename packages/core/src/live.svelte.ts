// LiveProvider — Real-time subscription interface + hooks

import { useQueryClient } from '@tanstack/svelte-query';

// ─── Types ──────────────────────────────────────────────────────

export type LiveMode = 'auto' | 'manual' | 'off';

export interface LiveEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  resource: string;
  payload: Record<string, unknown>;
}

export interface LiveProvider {
  subscribe(params: { resource: string; liveParams?: Record<string, unknown>; callback: (event: LiveEvent) => void }): () => void;
  unsubscribe?(params: { resource: string; liveParams?: Record<string, unknown> }): void;
  publish?(event: LiveEvent): void;
}

// ─── useLive — auto-invalidate queries on real-time events ──────

export function useLive(
  liveProvider: LiveProvider,
  resource: string,
  options?: { liveMode?: LiveMode; onLiveEvent?: (event: LiveEvent) => void }
): void {
  const queryClient = useQueryClient();
  const liveMode = options?.liveMode ?? 'auto';

  if (liveMode === 'off') return;

  $effect(() => {
    const unsubscribe = liveProvider.subscribe({
      resource,
      callback: (event) => {
        options?.onLiveEvent?.(event);
        if (liveMode === 'auto') {
          queryClient.invalidateQueries({ queryKey: [resource] });
        }
      },
    });
    return unsubscribe;
  });
}

// ─── useSubscription — manual channel subscription ──────────────

interface UseSubscriptionOptions {
  resource: string;
  liveProvider: LiveProvider;
  onLiveEvent: (event: LiveEvent) => void;
  enabled?: boolean;
}

export function useSubscription(options: UseSubscriptionOptions): void {
  const { resource, liveProvider, onLiveEvent, enabled = true } = options;

  if (!enabled) return;

  $effect(() => {
    const unsubscribe = liveProvider.subscribe({
      resource,
      callback: onLiveEvent,
    });
    return unsubscribe;
  });
}

// ─── usePublish — publish custom events ─────────────────────────

export function usePublish(liveProvider: LiveProvider) {
  return (event: LiveEvent) => {
    if (liveProvider.publish) {
      liveProvider.publish(event);
    } else {
      console.warn('[svadmin] LiveProvider.publish() not implemented');
    }
  };
}
