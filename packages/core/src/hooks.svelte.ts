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
import { getDataProviderForResource, getDataProvider } from './context.svelte';
import { useParsed } from './useParsed.svelte';
import { createOvertimeTracker, fireSuccessNotification, fireErrorNotification } from './hook-utils.svelte';
import type { NotificationConfig, OvertimeOptions } from './hook-utils.svelte';
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
  const resource = options.resource ?? parsed.resource ?? '';
  const adminOptions = getAdminOptions();
  const provider = getDataProviderForResource(resource, options.dataProviderName);

  const query = createInfiniteQuery<{ data: TData[]; total: number }, TError>(() => ({
    queryKey: [resource, 'infiniteList', options.sorters, options.filters, options.meta],
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
  }));

  const overtime = createOvertimeTracker(() => query.isLoading, options.overtimeOptions ?? adminOptions.overtime);

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
  const provider = getDataProviderForResource(resource, dataProviderName);

  let searchText = $state('');
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const searchFilters = $derived.by<Filter[]>(() => {
    if (!onSearch || !searchText) return [];
    return onSearch(searchText);
  });

  const allFilters = $derived([...(filters ?? []), ...searchFilters]);

  const effectivePageSize = options.fetchSize ?? pagination?.pageSize ?? 999;

  const query = createQuery<{ data: TData[]; total: number }>(() => ({
    queryKey: [resource, 'select', allFilters, sorters, pagination, meta],
    queryFn: () => provider.getList<TData>({ resource, sorters, filters: allFilters, pagination: { current: 1, pageSize: effectivePageSize }, meta }),
    enabled: options.queryOptions?.enabled ?? true,
    staleTime: options.queryOptions?.staleTime ?? adminOptions.reactQuery?.staleTime,
  }));

  // Parallel query to ensure default values are always available in options
  const defaultValueIds = options.defaultValue ?? [];
  const defaultValueQuery = defaultValueIds.length > 0
    ? createQuery<{ data: TData[] }>(() => ({
        queryKey: [resource, 'select-defaults', defaultValueIds],
        queryFn: async () => {
          if (provider.getMany) return provider.getMany<TData>({ resource, ids: defaultValueIds, meta });
          const results = await Promise.all(defaultValueIds.map(id => provider.getOne<TData>({ resource, id, meta })));
          return { data: results.map(r => r.data) };
        },
        enabled: (options.defaultValueQueryOptions?.enabled ?? true) && defaultValueIds.length > 0,
        staleTime: options.defaultValueQueryOptions?.staleTime ?? Infinity,
      }))
    : null;

  const selectOptions = $derived.by(() => {
    const queryResult = query.data as { data: TData[]; total: number } | undefined;
    const data: TData[] = queryResult?.data ?? [];
    // Merge default value items if not already in data
    const defaultQueryResult = defaultValueQuery as { data: { data: TData[] } | undefined } | null;
    const defaultData: TData[] = defaultQueryResult?.data?.data ?? [];
    const allData: TData[] = [...data];
    const existingIds = new Set(data.map((d: TData) => String((d as Record<string, unknown>)[typeof optionValue === 'string' ? optionValue : 'id'])));
    for (const item of defaultData) {
      const itemId = String((item as Record<string, unknown>)[typeof optionValue === 'string' ? optionValue : 'id']);
      if (!existingIds.has(itemId)) allData.push(item);
    }
    return allData.map((item: TData) => {
      const label = typeof optionLabel === 'function' ? optionLabel(item) : String((item as Record<string, unknown>)[optionLabel] ?? '');
      const value = typeof optionValue === 'function' ? optionValue(item) : (item as Record<string, unknown>)[optionValue];
      return { label, value } as unknown as TOption;
    });
  });

  const overtime = createOvertimeTracker(() => query.isLoading, options.overtimeOptions ?? adminOptions.overtime);

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
  const provider = getDataProvider(options.dataProviderName);

  const query = createQuery<{ data: TData }, TError>(() => ({
    queryKey: ['custom', options.url, options.method, options.config, options.meta],
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
  }));

  const overtime = createOvertimeTracker(() => query.isLoading, options.overtimeOptions ?? adminOptions.overtime);

  return { query, get overtime() { return overtime; } };
}

// ─── useCustomMutation ──────────────────────────────────────────────

export function useCustomMutation<TData = unknown, TError = HttpError, TVariables = unknown>(dataProviderName?: string) {
  const provider = getDataProvider(dataProviderName);
  const queryClient = useQueryClient();

  const mutation = createMutation<{ data: TData }, TError, { url: string; method: 'get' | 'post' | 'put' | 'patch' | 'delete'; values?: TVariables; meta?: Record<string, unknown> }>(() => ({
    mutationFn: async (params) => {
      if (!provider.custom) throw new Error('DataProvider does not support custom method');
      return provider.custom<TData>({ url: params.url, method: params.method, payload: params.values, meta: params.meta });
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
    onSuccess: (_d, params) => { queryClient.invalidateQueries({ queryKey: [params.resource ?? resource] }); },
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
    onSuccess: (_d, params) => { queryClient.invalidateQueries({ queryKey: [params.resource ?? resource] }); },
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
    onSuccess: (_d, params) => { queryClient.invalidateQueries({ queryKey: [params.resource ?? resource] }); },
  }));

  return { mutation, get overtime() { return overtime; } };
}

// ─── useInvalidate ──────────────────────────────────────────────────

export function useInvalidate() {
  const queryClient = useQueryClient();
  return (params: { resource?: string; invalidates?: string[] | 'all' | false; id?: string | number; dataProviderName?: string }) => {
    if (params.invalidates === false) return;
    if (params.invalidates === 'all' || !params.resource) {
      queryClient.invalidateQueries();
      return;
    }
    queryClient.invalidateQueries({ queryKey: [params.resource] });
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

export function useThemedLayoutContext() {
  let sidebarCollapsed = $state(false);
  return {
    get sidebarCollapsed() { return sidebarCollapsed; },
    setSidebarCollapsed(v: boolean) { sidebarCollapsed = v; },
    toggleSidebar() { sidebarCollapsed = !sidebarCollapsed; },
  };
}

