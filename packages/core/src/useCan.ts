// useCan — reactive permission check hook with TanStack Query integration

import { createQuery } from '@tanstack/svelte-query';
import { canAccessAsync, getAccessControlProvider } from './permissions';
import type { Action, CanResult } from './permissions';

export interface UseCanOptions {
  resource: string;
  action: Action;
  params?: Record<string, unknown>;
  queryOptions?: {
    enabled?: boolean;
    staleTime?: number;
  };
}

export interface UseCanResult {
  readonly allowed: boolean;
  readonly reason: string | undefined;
  readonly isLoading: boolean;
}

/**
 * Reactive permission check backed by TanStack Query for caching and deduplication.
 * Accepts a getter function for Svelte 5 fine-grained reactivity.
 *
 * @example
 * ```ts
 * const can = useCan(() => ({ resource: 'posts', action: 'delete', params: { id: 1 } }));
 * if (can.allowed) { ... }
 * ```
 */
export function useCan(options: () => UseCanOptions): UseCanResult {
  const query = createQuery<CanResult>(() => {
    const opts = options();
    return {
      queryKey: ['useCan', opts.resource, opts.action, opts.params] as const,
      queryFn: () => canAccessAsync(opts.resource, opts.action, opts.params),
      enabled: opts.queryOptions?.enabled ?? true,
      staleTime: opts.queryOptions?.staleTime ?? 5 * 60 * 1000,
    };
  });

  return {
    get allowed() { 
      const p = getAccessControlProvider();
      if (!p) return true;
      return (query.data as CanResult | undefined)?.can ?? false; 
    },
    get reason() { return (query.data as CanResult | undefined)?.reason; },
    get isLoading() { return query.isLoading; },
  };
}
