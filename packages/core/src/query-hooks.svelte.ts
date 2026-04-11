import { createQuery, createInfiniteQuery } from '@tanstack/svelte-query';
import { getAdminOptions } from './options.svelte';
import { getDataProviderForResource, getDataProvider, getLiveProvider } from './context.svelte';
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

// ─── useList ───────────────────────────────────────────────────

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

export function useList<TData extends BaseRecord = BaseRecord, TError = HttpError>(options: UseListOptions<TData, TError> = {}) {
  const parsed = useParsed();
  const resource = options.resource ?? parsed.resource ?? '';
  const adminOptions = getAdminOptions();
  const provider = getDataProviderForResource(resource, options.dataProviderName);

  const queryOptions = options.queryOptions;

  const query = createQuery<GetListResult<TData>, TError>(() => ({
    queryKey: [resource, 'list', options.pagination, options.sorters, options.filters, options.meta],
    queryFn: async () => {
      const result = await provider.getList<TData>({
        resource,
        pagination: options.pagination,
        sorters: options.sorters,
        filters: options.filters,
        meta: options.meta,
      });
      return result;
    },
    enabled: queryOptions?.enabled ?? true,
    staleTime: queryOptions?.staleTime ?? adminOptions.reactQuery?.staleTime,
    gcTime: queryOptions?.gcTime ?? adminOptions.reactQuery?.gcTime,
    refetchOnWindowFocus: queryOptions?.refetchOnWindowFocus ?? adminOptions.reactQuery?.refetchOnWindowFocus,
  }));

  const overtime = createOvertimeTracker(() => query.isLoading, options.overtimeOptions ?? adminOptions.overtime);

  createLiveSubscription((): LiveSubscriptionParams => ({
    resource,
    liveProvider: getLiveProvider(),
    liveMode: options.liveMode ?? adminOptions.liveMode,
    onLiveEvent: (e: LiveEvent) => {
      options.onLiveEvent?.(e);
      adminOptions.onLiveEvent?.(e);
    },
    liveParams: options.liveParams,
    enabled: queryOptions?.enabled ?? true,
  }));

  $effect(() => {
    if (query.isSuccess && options.successNotification) {
      fireSuccessNotification(options.successNotification, '', query.data, undefined, resource);
    } else if (query.isError) {
      fireErrorNotification(options.errorNotification, 'Fetch failed', query.error);
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

export function useOne<TData extends BaseRecord = BaseRecord, TError = HttpError>(options: UseOneOptions<TData, TError> = {}) {
  const parsed = useParsed();
  const resource = options.resource ?? parsed.resource ?? '';
  const id = options.id ?? parsed.id;
  const adminOptions = getAdminOptions();
  const provider = getDataProviderForResource(resource, options.dataProviderName);

  const queryOptions = options.queryOptions;

  const query = createQuery<GetOneResult<TData>, TError>(() => ({
    queryKey: [resource, 'one', id, options.meta],
    queryFn: async () => {
      if (id == null) throw new Error('useOne requires an id');
      const result = await provider.getOne<TData>({
        resource,
        id,
        meta: options.meta,
      });
      return result;
    },
    enabled: (queryOptions?.enabled ?? true) && id != null,
    staleTime: queryOptions?.staleTime ?? adminOptions.reactQuery?.staleTime,
    gcTime: queryOptions?.gcTime ?? adminOptions.reactQuery?.gcTime,
  }));

  const overtime = createOvertimeTracker(() => query.isLoading, options.overtimeOptions ?? adminOptions.overtime);

  $effect(() => {
    if (query.isSuccess && options.successNotification) {
      fireSuccessNotification(options.successNotification, '', query.data, undefined, resource);
    } else if (query.isError) {
      fireErrorNotification(options.errorNotification, 'Fetch failed', query.error);
    }
  });

  return extendQuery(query, () => ({ overtime }));
}

// ─── useShow ──────────────────────────────────────────────────
export function useShow<TData extends BaseRecord = BaseRecord, TError = HttpError>(
  options: UseOneOptions<TData, TError> = {}
) {
  const parsed = useParsed();
  let showId = $state<string | number | undefined>(options.id ?? parsed.id);

  function setShowId(id: string | number) { showId = id; }

  const result = useOne<TData, TError>({
    ...options,
    get id() { return showId; },
  });

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

export function useMany<TData extends BaseRecord = BaseRecord, TError = HttpError>(options: UseManyOptions<TData, TError>) {
  const { resource, ids, meta, dataProviderName, queryOptions } = options;
  const adminOptions = getAdminOptions();
  const provider = getDataProviderForResource(resource, dataProviderName);

  const query = createQuery<GetManyResult<TData>, TError>(() => ({
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
  }));

  const overtime = createOvertimeTracker(() => query.isLoading, options.overtimeOptions ?? adminOptions.overtime);

  $effect(() => {
    if (query.isSuccess && options.successNotification) fireSuccessNotification(options.successNotification, '', query.data, undefined, resource);
    else if (query.isError) fireErrorNotification(options.errorNotification, 'Fetch failed', query.error);
  });

  return extendQuery(query, () => ({ overtime }));
}

export function useApiUrl(dataProviderName?: string): string {
  return getDataProvider(dataProviderName).getApiUrl();
}
