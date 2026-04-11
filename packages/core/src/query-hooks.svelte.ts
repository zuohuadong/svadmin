import { createQuery, createInfiniteQuery } from '@tanstack/svelte-query';
import { getAdminOptions } from './options.svelte';
import { getDataProviderForResource, getDataProvider, getLiveProvider, getAuthProvider } from './context.svelte';
import { useParsed } from './useParsed.svelte';
import {
  createOvertimeTracker,
  createLiveSubscription,
  fireSuccessNotification,
  fireErrorNotification,
} from './hook-utils.svelte';
import type { NotificationConfig, OvertimeOptions, LiveSubscriptionParams } from './hook-utils.svelte';
import type {
  GetListParams, GetListResult, Pagination, Sort, Filter, BaseRecord, HttpError,
  GetOneParams, GetOneResult, GetManyParams, GetManyResult, CustomParams, CustomResult,
  KnownResources,
} from './types';
import type { LiveMode, LiveEvent } from './live.svelte';

/**
 * Extend a Tanstack Query result with additional properties.
 * The query object is returned as-is, with extra properties accessible via Proxy.
 */
function extendQuery<Q extends object, E extends Record<string, unknown>>(
  query: Q,
  extensions: () => E,
): Q & E {
  return new Proxy(query, {
    get(target, prop) {
      if (typeof prop === 'string') {
        const ext = extensions();
        if (prop in ext) return ext[prop as keyof E];
      }
      return target[prop as keyof Q];
    },
    has(target, prop) {
      if (typeof prop === 'string' && prop in extensions()) return true;
      return prop in target;
    },
  }) as Q & E;
}

/**
 * Delegate auth errors (401/403) to authProvider.onError() — refine pattern.
 */
async function checkError(error: unknown): Promise<void> {
  try {
    const authProvider = getAuthProvider({ optional: true });
    if (!authProvider?.onError) return;
    const result = await authProvider.onError(error);
    if (result.logout) {
      await authProvider.logout?.();
      const { navigate } = await import('./router');
      navigate(result.redirectTo ?? '/login');
    } else if (result.redirectTo) {
      const { navigate } = await import('./router');
      navigate(result.redirectTo);
    }
  } catch { /* auth check failed silently */ }
}

// ─── useList ───────────────────────────────────────────────────

export type MaybeGetter<T> = T | (() => T);

export interface UseListOptions<TData extends BaseRecord = BaseRecord, TError = HttpError> {
  resource?: KnownResources;
  pagination?: Pagination;
  sorters?: Sort[];
  filters?: Filter[];
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  queryOptions?: { staleTime?: number; enabled?: boolean; gcTime?: number; refetchOnWindowFocus?: boolean };
  successNotification?: NotificationConfig;
  errorNotification?: NotificationConfig;
  liveMode?: LiveMode;
  onLiveEvent?: (event: LiveEvent) => void;
  liveParams?: Record<string, unknown>;
  overtimeOptions?: OvertimeOptions;
}

export function useList<TData extends BaseRecord = BaseRecord, TError = HttpError>(optionsOrGetter: MaybeGetter<UseListOptions<TData, TError>> = {}) {
  const parsed = useParsed();
  const adminOptions = getAdminOptions();
  
  const getOptions = () => typeof optionsOrGetter === 'function' ? optionsOrGetter() : optionsOrGetter;
  const getResource = () => getOptions().resource ?? parsed.resource ?? '';

  const query = createQuery<GetListResult<TData>, TError>(() => {
    const opts = getOptions();
    const resource = getResource();
    const provider = getDataProviderForResource(resource, opts.dataProviderName);
    const queryOptions = opts.queryOptions;
    
    return {
      queryKey: [resource, 'list', opts.pagination, opts.sorters, opts.filters, opts.meta],
      queryFn: async () => provider.getList<TData>({
        resource,
        pagination: opts.pagination,
        sorters: opts.sorters,
        filters: opts.filters,
        meta: opts.meta,
      }),
      enabled: queryOptions?.enabled ?? true,
      staleTime: queryOptions?.staleTime ?? adminOptions.reactQuery?.staleTime,
      gcTime: queryOptions?.gcTime ?? adminOptions.reactQuery?.gcTime,
      refetchOnWindowFocus: queryOptions?.refetchOnWindowFocus ?? adminOptions.reactQuery?.refetchOnWindowFocus,
    };
  });

  const overtime = createOvertimeTracker(() => query.isLoading, typeof optionsOrGetter === 'function' ? optionsOrGetter().overtimeOptions : optionsOrGetter.overtimeOptions ?? adminOptions.overtime);

  createLiveSubscription((): LiveSubscriptionParams => {
    const opts = getOptions();
    return {
      resource: getResource(),
      liveProvider: getLiveProvider(),
      liveMode: opts.liveMode ?? adminOptions.liveMode,
      onLiveEvent: (e: LiveEvent) => {
        opts.onLiveEvent?.(e);
        adminOptions.onLiveEvent?.(e);
      },
      liveParams: opts.liveParams,
      enabled: opts.queryOptions?.enabled ?? true,
    };
  });

  // Track last notification timestamps to prevent duplicate firings on re-render
  let lastSuccessAt = 0;
  let lastErrorAt = 0;
  $effect(() => {
    const opts = getOptions();
    if (query.isSuccess && query.dataUpdatedAt > lastSuccessAt && opts.successNotification) {
      lastSuccessAt = query.dataUpdatedAt;
      fireSuccessNotification(opts.successNotification, '', query.data, undefined, getResource());
    } else if (query.isError && query.errorUpdatedAt > lastErrorAt) {
      lastErrorAt = query.errorUpdatedAt;
      checkError(query.error);
      fireErrorNotification(opts.errorNotification, 'Fetch failed', query.error);
    }
  });

  return extendQuery(query, () => ({ overtime }));
}

// ─── useOne ────────────────────────────────────────────────────

export interface UseOneOptions<TData extends BaseRecord = BaseRecord, TError = HttpError> {
  resource?: KnownResources;
  id?: string | number;
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  queryOptions?: { staleTime?: number; enabled?: boolean; gcTime?: number; refetchOnWindowFocus?: boolean };
  successNotification?: NotificationConfig;
  errorNotification?: NotificationConfig;
  liveMode?: LiveMode;
  onLiveEvent?: (event: LiveEvent) => void;
  liveParams?: Record<string, unknown>;
  overtimeOptions?: OvertimeOptions;
}

export function useOne<TData extends BaseRecord = BaseRecord, TError = HttpError>(optionsOrGetter: MaybeGetter<UseOneOptions<TData, TError>> = {}) {
  const parsed = useParsed();
  const adminOptions = getAdminOptions();
  
  const getOptions = () => typeof optionsOrGetter === 'function' ? optionsOrGetter() : optionsOrGetter;
  const getResource = () => getOptions().resource ?? parsed.resource ?? '';
  const getId = () => getOptions().id ?? parsed.id;

  const query = createQuery<GetOneResult<TData>, TError>(() => {
    const opts = getOptions();
    const resource = getResource();
    const id = getId();
    const provider = getDataProviderForResource(resource, opts.dataProviderName);
    const queryOptions = opts.queryOptions;

    return {
      queryKey: [resource, 'one', id, opts.meta],
      queryFn: async () => {
        if (id == null) throw new Error('useOne requires an id');
        const result = await provider.getOne<TData>({
          resource,
          id,
          meta: opts.meta,
        });
        return result;
      },
      enabled: (queryOptions?.enabled ?? true) && id != null,
      staleTime: queryOptions?.staleTime ?? adminOptions.reactQuery?.staleTime,
      gcTime: queryOptions?.gcTime ?? adminOptions.reactQuery?.gcTime,
      refetchOnWindowFocus: queryOptions?.refetchOnWindowFocus ?? adminOptions.reactQuery?.refetchOnWindowFocus,
    };
  });

  const overtime = createOvertimeTracker(() => query.isLoading, typeof optionsOrGetter === 'function' ? optionsOrGetter().overtimeOptions : optionsOrGetter.overtimeOptions ?? adminOptions.overtime);

  let lastSuccessAt = 0;
  let lastErrorAt = 0;
  $effect(() => {
    const opts = getOptions();
    if (query.isSuccess && query.dataUpdatedAt > lastSuccessAt && opts.successNotification) {
      lastSuccessAt = query.dataUpdatedAt;
      fireSuccessNotification(opts.successNotification, '', query.data, undefined, getResource());
    } else if (query.isError && query.errorUpdatedAt > lastErrorAt) {
      lastErrorAt = query.errorUpdatedAt;
      checkError(query.error);
      fireErrorNotification(opts.errorNotification, 'Fetch failed', query.error);
    }
  });

  return extendQuery(query, () => ({ overtime }));
}

// ─── useShow ──────────────────────────────────────────────────
export function useShow<TData extends BaseRecord = BaseRecord, TError = HttpError>(
  optionsOrGetter: MaybeGetter<UseOneOptions<TData, TError>> = {}
) {
  const parsed = useParsed();
  const getOptions = () => typeof optionsOrGetter === 'function' ? optionsOrGetter() : optionsOrGetter;
  
  let _showId = $state<string | number | undefined>(undefined);
  
  // showId prioritizes explicit setShowId, then options.id, then URL id.
  const showId = $derived(_showId ?? getOptions().id ?? parsed.id);

  function setShowId(id: string | number) { _showId = id; }

  // We wrap it in a getter so useOne evaluates it dynamically.
  const result = useOne<TData, TError>(() => ({
    ...getOptions(),
    id: showId,
  }));

  return extendQuery(result, () => ({ showId, setShowId }));
}

// ─── useMany ───────────────────────────────────────────────────

export interface UseManyOptions<TData extends BaseRecord = BaseRecord, TError = HttpError> {
  resource: KnownResources;
  ids: (string | number)[];
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  queryOptions?: { staleTime?: number; enabled?: boolean; gcTime?: number; refetchOnWindowFocus?: boolean };
  successNotification?: NotificationConfig;
  errorNotification?: NotificationConfig;
  liveMode?: LiveMode;
  onLiveEvent?: (event: LiveEvent) => void;
  liveParams?: Record<string, unknown>;
  overtimeOptions?: OvertimeOptions;
}

export function useMany<TData extends BaseRecord = BaseRecord, TError = HttpError>(optionsOrGetter: MaybeGetter<UseManyOptions<TData, TError>>) {
  const adminOptions = getAdminOptions();
  const getOptions = () => typeof optionsOrGetter === 'function' ? optionsOrGetter() : optionsOrGetter;

  const query = createQuery<GetManyResult<TData>, TError>(() => {
    const opts = getOptions();
    const { resource, ids, meta, dataProviderName, queryOptions } = opts;
    const provider = getDataProviderForResource(resource, dataProviderName);

    return {
      queryKey: [resource, 'many', ids, meta],
      queryFn: async () => {
        if (!ids.length) return { data: [] };
        if (provider.getMany) {
          return provider.getMany<TData>({ resource, ids, meta });
        }
        const results = await Promise.all(ids.map(id => provider.getOne<TData>({ resource, id, meta })));
        return { data: results.map(r => r.data) };
      },
      enabled: (queryOptions?.enabled ?? true) && ids.length > 0,
      staleTime: queryOptions?.staleTime ?? adminOptions.reactQuery?.staleTime,
      gcTime: queryOptions?.gcTime ?? adminOptions.reactQuery?.gcTime,
      refetchOnWindowFocus: queryOptions?.refetchOnWindowFocus ?? adminOptions.reactQuery?.refetchOnWindowFocus,
    };
  });

  const overtime = createOvertimeTracker(() => query.isLoading, typeof optionsOrGetter === 'function' ? optionsOrGetter().overtimeOptions : optionsOrGetter.overtimeOptions ?? adminOptions.overtime);

  let lastSuccessAt = 0;
  let lastErrorAt = 0;
  $effect(() => {
    const opts = getOptions();
    if (query.isSuccess && query.dataUpdatedAt > lastSuccessAt && opts.successNotification) {
      lastSuccessAt = query.dataUpdatedAt;
      fireSuccessNotification(opts.successNotification, '', query.data, undefined, opts.resource);
    } else if (query.isError && query.errorUpdatedAt > lastErrorAt) {
      lastErrorAt = query.errorUpdatedAt;
      checkError(query.error);
      fireErrorNotification(opts.errorNotification, 'Fetch failed', query.error);
    }
  });

  return extendQuery(query, () => ({ overtime }));
}

export function useApiUrl(dataProviderName?: string): string {
  return getDataProvider(dataProviderName).getApiUrl();
}
