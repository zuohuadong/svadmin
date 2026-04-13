// @svadmin/core — Core Data and Hook APIs (Modularized for v0.2.29+)

// ─── Re-exports from modular hook files ─────────────────────────────

export * from './query-hooks.svelte';
export * from './mutation-hooks.svelte';
export * from './form-hooks.svelte';
export * from './table-hooks.svelte';
export * from './routing-hooks.svelte';
export * from './utility-hooks.svelte';

// ─── Re-export types from options ─────────────────────────────────
export type { InvalidateScope, OvertimeConfig } from './options.svelte';

// ─── Export shared utilities ────────────────────────────────────────

export { createOvertimeTracker, createLiveSubscription } from './hook-utils.svelte';
export type { OvertimeResult, OvertimeOptions, NotificationConfig } from './hook-utils.svelte';

// ─── Missing hooks stubs ───────────────────────────────────────────
// These hooks were in the original monolithic file. They are re-created
// here as thin wrappers or stubs until they get their own modular files.

import { createQuery, createInfiniteQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import { getAdminOptions } from './options.svelte';
import { getDataProviderForResource, getDataProvider, getLiveProvider } from './context.svelte';
import { useParsed } from './useParsed.svelte';
import { createOvertimeTracker, createLiveSubscription, fireSuccessNotification, fireErrorNotification, checkError } from './hook-utils.svelte';
import { invalidateByScopes, publishLiveEvent } from './mutation-hooks.svelte';
import type { NotificationConfig, OvertimeOptions, LiveSubscriptionParams } from './hook-utils.svelte';
import type { BaseRecord, HttpError, Pagination, Sort, Filter, DataProvider, KnownResources } from './types';
import type { LiveMode, LiveEvent } from './live.svelte';
import { useList } from './query-hooks.svelte';
import type { UseListOptions } from './query-hooks.svelte';
import { audit } from './audit';

// ─── useInfiniteList ────────────────────────────────────────────────

export interface UseInfiniteListOptions<TData extends BaseRecord = BaseRecord, TError = HttpError> {
  resource?: KnownResources;
  pagination?: Pagination;
  sorters?: Sort[];
  filters?: Filter[];
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  queryOptions?: { staleTime?: number; enabled?: boolean };
  successNotification?: NotificationConfig;
  errorNotification?: NotificationConfig;
  liveMode?: LiveMode;
  onLiveEvent?: (event: LiveEvent) => void;
  overtimeOptions?: OvertimeOptions;
}

export function useInfiniteList<TData extends BaseRecord = BaseRecord, TError = HttpError>(options: UseInfiniteListOptions<TData, TError> = {}) {
  const parsed = useParsed();
  const adminOptions = getAdminOptions();

  const query = createInfiniteQuery<{ data: TData[]; total: number }, TError>(() => {
    const resource = options.resource ?? parsed.resource ?? '';
    const provider = getDataProviderForResource(resource, options.dataProviderName);
    return {
    queryKey: [options.dataProviderName, resource, 'infiniteList', options.pagination?.pageSize, options.sorters, options.filters, options.meta],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await provider.getList<TData>({
        resource,
        pagination: { current: pageParam as number, pageSize: options.pagination?.pageSize ?? 10 },
        sorters: options.sorters,
        filters: options.filters,
        meta: options.meta,
      });
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: { data: TData[]; total: number }, allPages: { data: TData[]; total: number }[]) => {
      const totalFetched = allPages.reduce((acc: number, p) => acc + (p.data?.length ?? 0), 0);
      if (totalFetched >= (lastPage.total ?? 0)) return undefined;
      return allPages.length + 1;
    },
    enabled: options.queryOptions?.enabled ?? true,
    staleTime: options.queryOptions?.staleTime ?? adminOptions.reactQuery?.staleTime,
    };
  });

  const overtime = createOvertimeTracker(() => query.isLoading, options.overtimeOptions ?? adminOptions.overtime);

  createLiveSubscription((): LiveSubscriptionParams => ({
    resource: options.resource ?? parsed.resource ?? '',
    liveProvider: getLiveProvider(),
    liveMode: options.liveMode ?? adminOptions.liveMode,
    onLiveEvent: (e: LiveEvent) => {
      options.onLiveEvent?.(e);
      adminOptions.onLiveEvent?.(e);
    },
    enabled: options.queryOptions?.enabled ?? true,
    dataProviderName: options.dataProviderName,
  }));

  let lastSuccessAt = 0;
  let lastErrorAt = 0;
  $effect(() => {
    if (query.isSuccess && query.dataUpdatedAt > lastSuccessAt && options.successNotification) {
      lastSuccessAt = query.dataUpdatedAt;
      fireSuccessNotification(options.successNotification, '', query.data, undefined, options.resource ?? parsed.resource ?? '');
    } else if (query.isError && query.errorUpdatedAt > lastErrorAt) {
      lastErrorAt = query.errorUpdatedAt;
      checkError(query.error);
      fireErrorNotification(options.errorNotification, 'Fetch failed', query.error, options.resource ?? parsed.resource ?? '');
    }
  });

  return { query, get overtime() { return overtime; } };
}

// ─── useSelect ──────────────────────────────────────────────────────

export interface UseSelectOptions<TData extends BaseRecord = BaseRecord, TOption = { label: string; value: string | number }> {
  resource: KnownResources;
  optionLabel?: string | ((item: TData) => string);
  optionValue?: string | ((item: TData) => string | number);
  sorters?: Sort[];
  filters?: Filter[];
  defaultValue?: (string | number)[];
  fetchSize?: number;
  pagination?: Pagination;
  debounce?: number;
  queryOptions?: { staleTime?: number; enabled?: boolean };
  defaultValueQueryOptions?: { staleTime?: number; enabled?: boolean };
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  onSearch?: (value: string) => Filter[];
  successNotification?: NotificationConfig;
  errorNotification?: NotificationConfig;
  overtimeOptions?: OvertimeOptions;
}

export function useSelect<TData extends BaseRecord = BaseRecord, TOption = { label: string; value: string | number }>(options: UseSelectOptions<TData, TOption>) {
  const { resource, optionLabel = 'title', optionValue = 'id', sorters, filters, pagination, meta, dataProviderName, onSearch, debounce: debounceMs = 300 } = options;
  const adminOptions = getAdminOptions();

  let searchText = $state('');
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const searchFilters = $derived.by<Filter[]>(() => {
    if (!onSearch || !searchText) return [];
    return onSearch(searchText);
  });

  const allFilters = $derived([...(filters ?? []), ...searchFilters]);

  const effectivePageSize = options.fetchSize ?? pagination?.pageSize ?? 999;

  const query = createQuery<{ data: TData[]; total: number }>(() => {
    const provider = getDataProviderForResource(resource, dataProviderName);
    return {
    queryKey: [dataProviderName, resource, 'select', allFilters, sorters, pagination, meta],
    queryFn: () => provider.getList<TData>({ resource, sorters, filters: allFilters, pagination: { current: 1, pageSize: effectivePageSize }, meta }),
    enabled: options.queryOptions?.enabled ?? true,
    staleTime: options.queryOptions?.staleTime ?? adminOptions.reactQuery?.staleTime,
    };
  });

  // Parallel query to ensure default values are always available in options
  const defaultValueIds = options.defaultValue ?? [];
  const defaultValueQuery = defaultValueIds.length > 0
    ? createQuery<{ data: TData[] }>(() => {
        const provider = getDataProviderForResource(resource, dataProviderName);
        return {
          queryKey: [dataProviderName, resource, 'select-defaults', defaultValueIds],
          queryFn: async () => {
            if (provider.getMany) return provider.getMany<TData>({ resource, ids: defaultValueIds, meta });
            const results = await Promise.all(defaultValueIds.map(id => provider.getOne<TData>({ resource, id, meta })));
            return { data: results.map(r => r.data) };
          },
          enabled: (options.defaultValueQueryOptions?.enabled ?? true) && defaultValueIds.length > 0,
          staleTime: options.defaultValueQueryOptions?.staleTime ?? Infinity,
        };
      })
    : null;

  const selectOptions = $derived.by(() => {
    const queryResult = query.data as { data: TData[]; total: number } | undefined;
    const data: TData[] = queryResult?.data ?? [];
    // Merge default value items if not already in data
    const defaultQueryResult = defaultValueQuery as { data: { data: TData[] } | undefined } | null;
    const defaultData: TData[] = defaultQueryResult?.data?.data ?? [];
    const allData: TData[] = [...data];
    const resolveValue = (item: TData) => typeof optionValue === 'function' ? optionValue(item) : (item as Record<string, unknown>)[optionValue];
    const existingIds = new Set(data.map((d: TData) => String(resolveValue(d))));
    for (const item of defaultData) {
      if (!existingIds.has(String(resolveValue(item)))) allData.push(item);
    }
    return allData.map((item: TData) => {
      const label = typeof optionLabel === 'function' ? optionLabel(item) : String((item as Record<string, unknown>)[optionLabel] ?? '');
      const value = resolveValue(item);
      return { label, value } as unknown as TOption;
    });
  });

  const overtime = createOvertimeTracker(() => query.isLoading, options.overtimeOptions ?? adminOptions.overtime);

  let lastSuccessAt = 0;
  let lastErrorAt = 0;
  $effect(() => {
    if (query.isSuccess && query.dataUpdatedAt > lastSuccessAt && options.successNotification) {
      lastSuccessAt = query.dataUpdatedAt;
      fireSuccessNotification(options.successNotification, '', query.data, undefined, resource);
    } else if (query.isError && query.errorUpdatedAt > lastErrorAt) {
      lastErrorAt = query.errorUpdatedAt;
      checkError(query.error);
      fireErrorNotification(options.errorNotification, 'Fetch failed', query.error, resource);
    }
  });

  function onSearchChange(value: string) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { searchText = value; }, debounceMs);
  }

  // Cleanup debounce timer on unmount
  $effect(() => {
    return () => { if (debounceTimer) clearTimeout(debounceTimer); };
  });

  return {
    query,
    get options() { return selectOptions; },
    get overtime() { return overtime; },
    onSearchChange,
  };
}

// ─── useCustom ──────────────────────────────────────────────────────

export interface UseCustomOptions<TData = unknown, TError = HttpError> {
  url: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  config?: { payload?: unknown; query?: Record<string, unknown>; headers?: Record<string, string>; sorters?: Sort[]; filters?: Filter[] };
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  queryOptions?: { staleTime?: number; enabled?: boolean };
  successNotification?: NotificationConfig;
  errorNotification?: NotificationConfig;
  overtimeOptions?: OvertimeOptions;
}

export function useCustom<TData = unknown, TError = HttpError>(options: UseCustomOptions<TData, TError>) {
  const adminOptions = getAdminOptions();

  const query = createQuery<{ data: TData }, TError>(() => {
    const provider = getDataProvider(options.dataProviderName);
    return {
    queryKey: [options.dataProviderName, 'custom', options.url, options.method, options.config, options.meta],
    queryFn: async () => {
      if (!provider.custom) throw new Error('DataProvider does not support custom method');
      return provider.custom<TData>({
        url: options.url,
        method: options.method,
        payload: options.config?.payload,
        query: options.config?.query,
        headers: options.config?.headers,
        sorters: options.config?.sorters,
        filters: options.config?.filters,
        meta: options.meta,
      });
    },
    enabled: options.queryOptions?.enabled ?? true,
    staleTime: options.queryOptions?.staleTime ?? adminOptions.reactQuery?.staleTime,
    };
  });

  const overtime = createOvertimeTracker(() => query.isLoading, options.overtimeOptions ?? adminOptions.overtime);

  let lastSuccessAt = 0;
  let lastErrorAt = 0;
  $effect(() => {
    if (query.isSuccess && query.dataUpdatedAt > lastSuccessAt && options.successNotification) {
      lastSuccessAt = query.dataUpdatedAt;
      fireSuccessNotification(options.successNotification, '', query.data);
    } else if (query.isError && query.errorUpdatedAt > lastErrorAt) {
      lastErrorAt = query.errorUpdatedAt;
      checkError(query.error);
      fireErrorNotification(options.errorNotification, 'Custom request failed', query.error, '');
    }
  });

  return { query, get overtime() { return overtime; } };
}

// ─── useCustomMutation ──────────────────────────────────────────────

export function useCustomMutation<TData = unknown, TError = HttpError, TVariables = unknown>(dataProviderName?: string) {
  const queryClient = useQueryClient();

  const mutation = createMutation<{ data: TData }, TError, { url: string; method: 'get' | 'post' | 'put' | 'patch' | 'delete'; values?: TVariables; query?: Record<string, unknown>; headers?: Record<string, string>; sorters?: Sort[]; filters?: Filter[]; meta?: Record<string, unknown>; invalidates?: string[] | false; resource?: string }>(() => ({
    mutationFn: async (params) => {
      const provider = getDataProvider(dataProviderName);
      if (!provider.custom) throw new Error('DataProvider does not support custom method');
      return provider.custom<TData>({ url: params.url, method: params.method, payload: params.values, query: params.query, headers: params.headers, sorters: params.sorters, filters: params.filters, meta: params.meta });
    },
    onSuccess: (data, params) => {
      if (params.resource && params.invalidates !== false) {
        invalidateByScopes(queryClient, params.resource, params.invalidates, ['list', 'many'], undefined, dataProviderName);
      }
    },
    onError: (error) => {
      checkError(error);
    },
  }));

  return { mutation };
}

// ─── useCreateMany / useUpdateMany / useDeleteMany ──────────────────

export function useCreateMany<TData extends BaseRecord = BaseRecord, TError = HttpError, TVariables = Record<string, unknown>>(options: { resource?: KnownResources; overtimeOptions?: OvertimeOptions } = {}) {
  const parsed = useParsed();
  const resource = options.resource ?? parsed.resource ?? '';
  const adminOptions = getAdminOptions();
  const queryClient = useQueryClient();
  let isMutating = $state(false);
  const overtime = createOvertimeTracker(() => isMutating, options.overtimeOptions ?? adminOptions.overtime);

  const mutation = createMutation<{ data: TData[] }, TError, { resource?: KnownResources; variables: TVariables[]; meta?: Record<string, unknown>; dataProviderName?: string }>(() => ({
    mutationFn: async (params) => {
      isMutating = true;
      const resName = params.resource ?? resource;
      const provider = getDataProviderForResource(resName, params.dataProviderName);
      try {
        if (provider.createMany) return await provider.createMany<TData, TVariables>({ resource: resName, variables: params.variables, meta: params.meta });
        const results = await Promise.all(params.variables.map(v => provider.create<TData, TVariables>({ resource: resName, variables: v, meta: params.meta })));
        return { data: results.map(r => r.data) };
      } finally { isMutating = false; }
    },
    onSuccess: (data, params) => {
      const resName = params.resource ?? resource;
      fireSuccessNotification(undefined, 'Created successfully', data.data, params.variables, resName);
      audit({ action: 'create', resource: resName });
      publishLiveEvent(resName, 'created');
    },
    onError: (error, params) => {
      checkError(error);
      fireErrorNotification(undefined, 'Create many failed', error, params.resource ?? resource);
    },
    onSettled: (_d, _e, params) => {
      const resName = params.resource ?? resource;
      invalidateByScopes(queryClient, resName, undefined, ['list', 'many'], undefined, params.dataProviderName);
    },
  }));

  return { mutation, get overtime() { return overtime; } };
}

export function useUpdateMany<TData extends BaseRecord = BaseRecord, TError = HttpError, TVariables = Record<string, unknown>>(options: { resource?: KnownResources; overtimeOptions?: OvertimeOptions } = {}) {
  const parsed = useParsed();
  const resource = options.resource ?? parsed.resource ?? '';
  const adminOptions = getAdminOptions();
  const queryClient = useQueryClient();
  let isMutating = $state(false);
  const overtime = createOvertimeTracker(() => isMutating, options.overtimeOptions ?? adminOptions.overtime);

  const mutation = createMutation<{ data: TData[] }, TError, { resource?: KnownResources; ids: (string | number)[]; variables: TVariables; meta?: Record<string, unknown>; dataProviderName?: string }>(() => ({
    mutationFn: async (params) => {
      isMutating = true;
      const resName = params.resource ?? resource;
      const provider = getDataProviderForResource(resName, params.dataProviderName);
      try {
        if (provider.updateMany) return await provider.updateMany<TData, TVariables>({ resource: resName, ids: params.ids, variables: params.variables, meta: params.meta });
        const results = await Promise.all(params.ids.map(id => provider.update<TData, TVariables>({ resource: resName, id, variables: params.variables, meta: params.meta })));
        return { data: results.map(r => r.data) };
      } finally { isMutating = false; }
    },
    onSuccess: (data, params) => {
      const resName = params.resource ?? resource;
      fireSuccessNotification(undefined, 'Updated successfully', data.data, params.variables, resName);
      audit({ action: 'update', resource: resName });
      publishLiveEvent(resName, 'updated', params.ids);
    },
    onError: (error, params) => {
      checkError(error);
      fireErrorNotification(undefined, 'Update many failed', error, params.resource ?? resource);
    },
    onSettled: (_d, _e, params) => {
      const resName = params.resource ?? resource;
      invalidateByScopes(queryClient, resName, undefined, ['list', 'many', 'detail'], undefined, params.dataProviderName);
      for (const id of params.ids) {
        queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === params.dataProviderName && q.queryKey[1] === resName && q.queryKey[2] === 'one' && q.queryKey[3] === id });
      }
    },
  }));

  return { mutation, get overtime() { return overtime; } };
}

export function useDeleteMany<TData extends BaseRecord = BaseRecord, TError = HttpError>(options: { resource?: KnownResources; overtimeOptions?: OvertimeOptions } = {}) {
  const parsed = useParsed();
  const resource = options.resource ?? parsed.resource ?? '';
  const adminOptions = getAdminOptions();
  const queryClient = useQueryClient();
  let isMutating = $state(false);
  const overtime = createOvertimeTracker(() => isMutating, options.overtimeOptions ?? adminOptions.overtime);

  const mutation = createMutation<{ data: TData[] }, TError, { resource?: KnownResources; ids: (string | number)[]; meta?: Record<string, unknown>; dataProviderName?: string }>(() => ({
    mutationFn: async (params) => {
      isMutating = true;
      const resName = params.resource ?? resource;
      const provider = getDataProviderForResource(resName, params.dataProviderName);
      try {
        if (provider.deleteMany) return await provider.deleteMany<TData>({ resource: resName, ids: params.ids, meta: params.meta });
        const results = await Promise.all(params.ids.map(id => provider.deleteOne<TData>({ resource: resName, id, meta: params.meta })));
        return { data: results.map(r => r.data) };
      } finally { isMutating = false; }
    },
    onSuccess: (data, params) => {
      const resName = params.resource ?? resource;
      fireSuccessNotification(undefined, 'Deleted successfully', data.data, undefined, resName);
      audit({ action: 'delete', resource: resName });
      publishLiveEvent(resName, 'deleted', params.ids);
    },
    onError: (error, params) => {
      checkError(error);
      fireErrorNotification(undefined, 'Delete many failed', error, params.resource ?? resource);
    },
    onSettled: (_d, _e, params) => {
      const resName = params.resource ?? resource;
      invalidateByScopes(queryClient, resName, undefined, ['list', 'many'], undefined, params.dataProviderName);
      for (const id of params.ids) {
        queryClient.removeQueries({ predicate: (q) => q.queryKey[0] === params.dataProviderName && q.queryKey[1] === resName && q.queryKey[2] === 'one' && q.queryKey[3] === id });
      }
    },
  }));

  return { mutation, get overtime() { return overtime; } };
}

// ─── useInvalidate ──────────────────────────────────────────────────

export function useInvalidate() {
  const queryClient = useQueryClient();
  return (params: { resource?: string; invalidates?: string[] | 'all' | false; id?: string | number; dataProviderName?: string }) => {
    if (params.invalidates === false) return;
    if (params.invalidates === 'all' || !params.resource) {
      queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === params.dataProviderName });
      return;
    }
    const scopes = params.invalidates || ['resourceAll'];
    const res = params.resource;
    const dpMatch = (q: { queryKey: readonly unknown[] }) => q.queryKey[0] === params.dataProviderName;
    for (const scope of scopes) {
      if (scope === 'resourceAll') queryClient.invalidateQueries({ predicate: (q) => dpMatch(q) && q.queryKey[1] === res });
      else if ((scope === 'detail' || scope === 'one') && params.id) queryClient.invalidateQueries({ predicate: (q) => dpMatch(q) && q.queryKey[1] === res && q.queryKey[2] === 'one' && q.queryKey[3] === params.id });
      else if (scope === 'detail' || scope === 'one') queryClient.invalidateQueries({ predicate: (q) => dpMatch(q) && q.queryKey[1] === res && q.queryKey[2] === 'one' });
      else if (scope === 'list') queryClient.invalidateQueries({ predicate: (q) => dpMatch(q) && q.queryKey[1] === res && (q.queryKey[2] === 'list' || q.queryKey[2] === 'infiniteList' || q.queryKey[2] === 'select') });
      else if (scope === 'many') queryClient.invalidateQueries({ predicate: (q) => dpMatch(q) && q.queryKey[1] === res && q.queryKey[2] === 'many' });
    }
  };
}

// ─── useOvertime ────────────────────────────────────────────────────

export function useOvertime(options?: OvertimeOptions) {
  let isLoading = $state(false);
  const overtime = createOvertimeTracker(() => isLoading, options);
  return {
    get elapsedTime() { return overtime.elapsedTime; },
    start() { isLoading = true; },
    stop() { isLoading = false; },
  };
}

// ─── useDataProvider ────────────────────────────────────────────────

export function useDataProvider(): (dataProviderName?: string) => DataProvider {
  return (name?: string) => getDataProvider(name);
}

// ─── useThemedLayoutContext ─────────────────────────────────────────

let _sidebarCollapsed = $state(false);

export function resetSidebarCollapsed() { _sidebarCollapsed = false; }

export function useThemedLayoutContext() {
  return {
    get sidebarCollapsed() { return _sidebarCollapsed; },
    setSidebarCollapsed(v: boolean) { _sidebarCollapsed = v; },
    toggleSidebar() { _sidebarCollapsed = !_sidebarCollapsed; },
  };
}

