// Complete CRUD hooks — 100% Refine-compatible
// TanStack Query v6 (Svelte 5 runes-native) wrappers

import {
  createQuery,
  createMutation,
  createInfiniteQuery,
  useQueryClient,
} from '@tanstack/svelte-query';
import { getDataProviderForResource, getDataProvider, getResources, getResource } from './context';
import { canAccess } from './permissions';
import { getTextTransformers } from './options';
import type { GetListResult, Sort, Filter, Pagination, MutationMode, CustomParams, CustomResult, CrudOperator } from './types';
import { HttpError, UndoError } from './types';
import { toast } from './toast.svelte';
import { audit, getAuditLogProvider } from './audit';
import { navigate } from './router';
import { t } from './i18n.svelte';
import { readURLState, writeURLState } from './url-sync';
import { useParsed } from './useParsed';

// ─── useList ────────────────────────────────────────────────────

interface UseListOptions {
  resource: string;
  pagination?: Pagination;
  sorters?: Sort[];
  filters?: Filter[];
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  enabled?: boolean;
}

export function useList<T = Record<string, unknown>>(options: UseListOptions) {
  const { resource, pagination, sorters, filters, meta, dataProviderName, enabled = true } = options;
  const provider = getDataProviderForResource(resource, dataProviderName);

  return createQuery<GetListResult<T>>(() => ({
    queryKey: [resource, 'list', { pagination, sorters, filters }],
    queryFn: () => provider.getList<T>({ resource, pagination, sorters, filters, meta }),
    enabled,
  }));
}

// ─── useInfiniteList ────────────────────────────────────────────

interface UseInfiniteListOptions {
  resource: string;
  pageSize?: number;
  sorters?: Sort[];
  filters?: Filter[];
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  enabled?: boolean;
}

export function useInfiniteList<T = Record<string, unknown>>(options: UseInfiniteListOptions) {
  const { resource, pageSize = 10, sorters, filters, meta, dataProviderName, enabled = true } = options;
  const provider = getDataProviderForResource(resource, dataProviderName);

  return createInfiniteQuery<GetListResult<T>>(() => ({
    queryKey: [resource, 'infinite', { sorters, filters }],
    queryFn: ({ pageParam = 1 }) =>
      provider.getList<T>({
        resource,
        pagination: { current: pageParam as number, pageSize },
        sorters,
        filters,
        meta,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, p) => sum + p.data.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    enabled,
  }));
}

// ─── useOne ─────────────────────────────────────────────────────

interface UseOneOptions {
  resource: string;
  id: string | number;
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  enabled?: boolean;
}

export function useOne<T = Record<string, unknown>>(options: UseOneOptions) {
  const { resource, id, meta, dataProviderName, enabled = true } = options;
  const provider = getDataProviderForResource(resource, dataProviderName);

  return createQuery(() => ({
    queryKey: [resource, 'one', id],
    queryFn: async () => {
      const result = await provider.getOne<T>({ resource, id, meta });
      return result.data;
    },
    enabled: enabled && id != null,
  }));
}

// ─── useShow (alias for useOne with route awareness) ────────────

export function useShow<T = Record<string, unknown>>(options: UseOneOptions) {
  return useOne<T>(options);
}

// ─── Helpers ────────────────────────────────────────────────────

/** Resolve a nested property via dot path, e.g. "nested.title" */
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], obj);
}

// ─── useSelect ──────────────────────────────────────────────────

type OptionMapper<T = Record<string, unknown>> = string | ((item: T) => string);

interface UseSelectOptions<T = Record<string, unknown>> {
  resource: string;
  optionLabel?: OptionMapper<T>;
  optionValue?: OptionMapper<T>;
  searchField?: string;
  filters?: Filter[];
  sorters?: Sort[];
  pagination?: Pagination;
  enabled?: boolean;
  defaultValue?: (string | number)[];
  debounce?: number;
  selectedOptionsOrder?: 'top' | 'none';
  dataProviderName?: string;
  meta?: Record<string, unknown>;
  queryOptions?: { staleTime?: number; enabled?: boolean };
  defaultValueQueryOptions?: { enabled?: boolean };
  onSearch?: (value: string) => Filter[];
}

interface SelectOption {
  label: string;
  value: string;
}

export function useSelect<T = Record<string, unknown>>(options: UseSelectOptions<T>) {
  const {
    resource,
    optionLabel = 'title',
    optionValue = 'id',
    searchField,
    filters: staticFilters,
    sorters,
    pagination = { current: 1, pageSize: 50 },
    enabled = true,
    defaultValue,
    debounce: debounceMs = 300,
    selectedOptionsOrder = 'none',
    dataProviderName,
    meta,
    queryOptions,
    defaultValueQueryOptions,
    onSearch: onSearchProp,
  } = options;

  const provider = getDataProviderForResource(resource, dataProviderName);

  // Resolve label/value from an item
  function resolveLabel(item: T): string {
    if (typeof optionLabel === 'function') return optionLabel(item);
    return String(getByPath(item as Record<string, unknown>, optionLabel) ?? '');
  }
  function resolveValue(item: T): string {
    if (typeof optionValue === 'function') return optionValue(item);
    return String(getByPath(item as Record<string, unknown>, optionValue) ?? '');
  }

  function toOptions(data: T[]): SelectOption[] {
    return data.map(item => ({ label: resolveLabel(item), value: resolveValue(item) }));
  }

  // Search state
  let searchFilters = $state<Filter[]>([]);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function onSearch(value: string) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (onSearchProp) {
        searchFilters = onSearchProp(value);
      } else {
        const field = searchField ?? (typeof optionLabel === 'string' ? optionLabel : 'title');
        searchFilters = value ? [{ field, operator: 'contains' as CrudOperator, value }] : [];
      }
    }, debounceMs);
  }

  // Combined filters
  const allFilters = $derived([...(staticFilters ?? []), ...searchFilters]);

  // Main query
  const query = createQuery<GetListResult<T>>(() => ({
    queryKey: [resource, 'select', { optionLabel: String(optionLabel), optionValue: String(optionValue), filters: allFilters, pagination }],
    queryFn: () => provider.getList<T>({ resource, pagination, sorters, filters: allFilters, meta }),
    enabled: (queryOptions?.enabled ?? enabled),
    staleTime: queryOptions?.staleTime ?? 5 * 60 * 1000,
  }));

  // Default value query — fetch selected records separately to ensure they appear in options
  const defaultValueQuery = defaultValue && defaultValue.length > 0
    ? createQuery<T[]>(() => ({
        queryKey: [resource, 'select-default', defaultValue],
        queryFn: async () => {
          if (provider.getMany) {
            const result = await provider.getMany<T>({ resource, ids: defaultValue!, meta });
            return result.data;
          }
          const results = await Promise.all(defaultValue!.map(id => provider.getOne<T>({ resource, id, meta })));
          return results.map(r => r.data);
        },
        enabled: defaultValueQueryOptions?.enabled ?? true,
        staleTime: Infinity,
      }))
    : null;

  return {
    query,
    defaultValueQuery,
    onSearch,
    /** Merged options: main query results + defaultValue results, deduplicated */
    get options(): SelectOption[] {
      // @ts-expect-error $ rune prefix
      const mainData = ($query.data?.data ?? []) as T[];
      // @ts-expect-error $ rune prefix
      const defaultData = (defaultValueQuery ? ($defaultValueQuery?.data ?? []) : []) as T[];

      const mainOptions = toOptions(mainData);
      const defaultOptions = toOptions(defaultData);

      // Deduplicate: merge default into main
      const seenValues = new Set(mainOptions.map(o => o.value));
      const merged = [...mainOptions];
      for (const opt of defaultOptions) {
        if (!seenValues.has(opt.value)) {
          merged.push(opt);
          seenValues.add(opt.value);
        }
      }

      // selectedOptionsOrder: move defaultValue items to top
      if (selectedOptionsOrder === 'top' && defaultValue && defaultValue.length > 0) {
        const dvSet = new Set(defaultValue.map(String));
        const selected = merged.filter(o => dvSet.has(o.value));
        const rest = merged.filter(o => !dvSet.has(o.value));
        return [...selected, ...rest];
      }

      return merged;
    },
  };
}

// ─── useMany ────────────────────────────────────────────────────

interface UseManyOptions {
  resource: string;
  ids: (string | number)[];
  meta?: Record<string, unknown>;
  enabled?: boolean;
}

export function useMany<T = Record<string, unknown>>(options: UseManyOptions) {
  const { resource, ids, meta, enabled = true } = options;
  const provider = getDataProviderForResource(resource);

  return createQuery(() => ({
    queryKey: [resource, 'many', ids],
    queryFn: async () => {
      if (provider.getMany) {
        const result = await provider.getMany<T>({ resource, ids, meta });
        return result.data;
      }
      const results = await Promise.all(ids.map(id => provider.getOne<T>({ resource, id, meta })));
      return results.map(r => r.data);
    },
    enabled: enabled && ids.length > 0,
  }));
}

// ─── useRelation ────────────────────────────────────────────────

interface UseRelationOptions {
  resource: string;
  id?: string | number;
  ids?: (string | number)[];
  meta?: Record<string, unknown>;
  enabled?: boolean;
}

export function useRelation<T = Record<string, unknown>>(options: UseRelationOptions) {
  const { resource, id, ids, meta, enabled = true } = options;
  if (ids !== undefined) {
    return useMany<T>({ resource, ids, meta, enabled: enabled && ids.length > 0 });
  }
  return useOne<T>({ resource, id: id as string | number, meta, enabled: enabled && id != null });
}

// ─── useCustom ──────────────────────────────────────────────────

interface UseCustomOptions<T = unknown> {
  url: string;
  method: CustomParams['method'];
  config?: {
    headers?: Record<string, string>;
    query?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    sorters?: Sort[];
    filters?: Filter[];
  };
  queryOptions?: {
    enabled?: boolean;
    queryKey?: unknown[];
  };
  dataProviderName?: string;
  meta?: Record<string, unknown>;
}

export function useCustom<T = unknown>(options: UseCustomOptions<T>) {
  const { url, method, config, queryOptions, dataProviderName, meta } = options;
  const provider = dataProviderName ? getDataProvider(dataProviderName) : getDataProvider();

  return createQuery<CustomResult<T>>(() => ({
    queryKey: queryOptions?.queryKey ?? ['custom', url, method, config],
    queryFn: () => {
      if (!provider.custom) {
        throw new Error('DataProvider does not implement custom() method');
      }
      return provider.custom<T>({
        url,
        method,
        payload: config?.payload,
        query: config?.query,
        headers: config?.headers,
        sorters: config?.sorters,
        filters: config?.filters,
        meta,
      });
    },
    enabled: queryOptions?.enabled ?? true,
  }));
}

// ─── useCustomMutation ──────────────────────────────────────────

export function useCustomMutation<T = unknown>() {
  const provider = getDataProvider();

  return createMutation<CustomResult<T>, Error, Omit<CustomParams, 'method'> & { method: CustomParams['method']; dataProviderName?: string }>(() => ({
    mutationFn: (params) => {
      const dp = params.dataProviderName ? getDataProvider(params.dataProviderName) : provider;
      if (!dp.custom) {
        throw new Error('DataProvider does not implement custom() method');
      }
      return dp.custom<T>(params);
    },
  }));
}

// ─── useInvalidate ──────────────────────────────────────────────

export type InvalidateScope = 'all' | 'list' | 'many' | 'detail' | 'resourceAll';

interface UseInvalidateParams {
  resource?: string;
  id?: string | number;
  dataProviderName?: string;
  invalidates: InvalidateScope[];
}

export function useInvalidate() {
  const queryClient = useQueryClient();

  return (params: UseInvalidateParams) => {
    const { resource, id, invalidates } = params;

    for (const scope of invalidates) {
      switch (scope) {
        case 'all':
          queryClient.invalidateQueries();
          break;
        case 'resourceAll':
          if (resource) queryClient.invalidateQueries({ queryKey: [resource] });
          break;
        case 'list':
          if (resource) queryClient.invalidateQueries({ queryKey: [resource, 'list'] });
          break;
        case 'many':
          if (resource) queryClient.invalidateQueries({ queryKey: [resource, 'many'] });
          break;
        case 'detail':
          if (resource && id != null) {
            queryClient.invalidateQueries({ queryKey: [resource, 'one', id] });
          } else if (resource) {
            queryClient.invalidateQueries({ queryKey: [resource, 'one'] });
          }
          break;
      }
    }
  };
}

// ─── useApiUrl ──────────────────────────────────────────────────

export function useApiUrl(dataProviderName?: string): string {
  const provider = dataProviderName ? getDataProvider(dataProviderName) : getDataProvider();
  return provider.getApiUrl();
}

// ─── useNavigation ──────────────────────────────────────────────

export function useNavigation() {
  return {
    list: (resource: string) => navigate(`/${resource}`),
    create: (resource: string) => navigate(`/${resource}/create`),
    edit: (resource: string, id: string | number) => navigate(`/${resource}/edit/${id}`),
    show: (resource: string, id: string | number) => navigate(`/${resource}/show/${id}`),
    clone: (resource: string, id: string | number) => navigate(`/${resource}/create?clone_id=${id}`),
    goBack: () => history.back(),
    push: (path: string) => navigate(path),
  };
}

// ─── useGo ──────────────────────────────────────────────────────

interface GoParams {
  to?: string | { resource: string; action?: 'list' | 'create' | 'edit' | 'show' | 'clone'; id?: string | number; meta?: Record<string, unknown> };
  query?: Record<string, string | number>;
  hash?: string;
  type?: 'push' | 'replace';
  keepQuery?: boolean;
  keepHash?: boolean;
}

export function useGo() {
  const parsed = useParsed();

  return (params: GoParams) => {
    let path: string;

    if (!params.to) {
      path = '/';
    } else if (typeof params.to === 'string') {
      path = params.to;
    } else {
      const { resource, action = 'list', id, meta } = params.to;
      let resourcePath = `/${resource}`;
      
      if (meta?.parent) {
        let parentIdStr = meta.parentId as string | number | undefined;
        if (!parentIdStr) {
          const singular = String(meta.parent).endsWith('s') ? String(meta.parent).slice(0, -1) : String(meta.parent);
          parentIdStr = parsed.params[`${singular}Id`];
        }
        if (parentIdStr) {
          resourcePath = `/${meta.parent}/${parentIdStr}${resourcePath}`;
        }
      }

      switch (action) {
        case 'list': path = resourcePath; break;
        case 'create': path = `${resourcePath}/create`; break;
        case 'edit': path = `${resourcePath}/edit/${id ?? ''}`; break;
        case 'show': path = `${resourcePath}/show/${id ?? ''}`; break;
        case 'clone': path = `${resourcePath}/create?clone_id=${id ?? ''}`; break;
        default: path = resourcePath;
      }
    }

    // Handle query params
    const url = new URL(path, 'http://localhost');
    if (params.keepQuery && typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
      currentParams.forEach((v, k) => url.searchParams.set(k, v));
    }
    if (params.query) {
      Object.entries(params.query).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    }

    const queryStr = url.searchParams.toString();
    const finalPath = url.pathname + (queryStr ? `?${queryStr}` : '') + (params.hash ? `#${params.hash}` : '');

    if (params.type === 'replace') {
      if (typeof window !== 'undefined') {
        history.replaceState(null, '', `#${finalPath}`);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    } else {
      navigate(finalPath);
    }
  };
}

// ─── useBack ────────────────────────────────────────────────────

export function useBack() {
  return () => {
    if (typeof window !== 'undefined') {
      history.back();
    }
  };
}

// ─── useResource ────────────────────────────────────────────────

export { getResource as useResource } from './context';

// ─── Mutation options ───────────────────────────────────────────

interface UseMutationOptions {
  showToast?: boolean;
  successNotification?: string | false;
  errorNotification?: string | false;
  auditLog?: boolean;
  mutationMode?: MutationMode;
  undoableTimeout?: number;
  invalidates?: InvalidateScope[] | false;
  meta?: Record<string, unknown>;
}

/** Helper: invalidate queries based on scope. Default = invalidate all resource queries */
function invalidateResource(
  queryClient: ReturnType<typeof useQueryClient>,
  resource: string,
  invalidates: InvalidateScope[] | false | undefined,
  id?: string | number,
) {
  if (invalidates === false) return;
  const scopes = invalidates ?? ['resourceAll'];
  for (const scope of scopes) {
    switch (scope) {
      case 'all':
        queryClient.invalidateQueries();
        break;
      case 'resourceAll':
        queryClient.invalidateQueries({ queryKey: [resource] });
        break;
      case 'list':
        queryClient.invalidateQueries({ queryKey: [resource, 'list'] });
        break;
      case 'many':
        queryClient.invalidateQueries({ queryKey: [resource, 'many'] });
        break;
      case 'detail':
        if (id != null) {
          queryClient.invalidateQueries({ queryKey: [resource, 'one', id] });
        } else {
          queryClient.invalidateQueries({ queryKey: [resource, 'one'] });
        }
        break;
    }
  }
}

// ─── useCreate ──────────────────────────────────────────────────

export function useCreate<T = Record<string, unknown>>(resource: string, opts?: UseMutationOptions) {
  const provider = getDataProviderForResource(resource);
  const queryClient = useQueryClient();
  const { showToast = true, auditLog = true, mutationMode = 'pessimistic', undoableTimeout = 5000, invalidates, successNotification, errorNotification } = opts ?? {};

  return createMutation(() => ({
    mutationFn: async (variables: Record<string, unknown>) => {
      if (mutationMode === 'undoable') {
        await new Promise<void>((resolve, reject) => {
          toast.undoable('Action can be undone', undoableTimeout, () => reject(new UndoError()), resolve);
        });
      }
      return provider.create<T>({ resource, variables });
    },
    onMutate: mutationMode === 'optimistic' || mutationMode === 'undoable'
      ? async (_variables: Record<string, unknown>) => {
          await queryClient.cancelQueries({ queryKey: [resource] });
          const previousData = queryClient.getQueryData([resource, 'list']);
          return { previousData };
        }
      : undefined,
    onSuccess: (data: { data: T }) => {
      invalidateResource(queryClient, resource, invalidates);
      if (showToast && successNotification !== false) toast.success(successNotification || t('common.createSuccess'));
      if (auditLog) {
        const record = data.data as Record<string, unknown>;
        audit({ action: 'create', resource, recordId: record.id as string, meta: opts?.meta });
      }
    },
    onError: (error: Error, _variables: Record<string, unknown>, context: { previousData?: unknown } | undefined) => {
      if ((mutationMode === 'optimistic' || mutationMode === 'undoable') && context?.previousData) {
        queryClient.setQueryData([resource, 'list'], context.previousData);
      }
      if (error instanceof UndoError) return;
      if (showToast && errorNotification !== false) toast.error(errorNotification || t('common.operationFailed') + ': ' + error.message);
    },
  }));
}

// ─── useCreateMany ──────────────────────────────────────────────

export function useCreateMany<T = Record<string, unknown>>(resource: string, opts?: UseMutationOptions) {
  const provider = getDataProviderForResource(resource);
  const queryClient = useQueryClient();
  const { showToast = true, auditLog = true, mutationMode = 'pessimistic', undoableTimeout = 5000, invalidates, successNotification, errorNotification } = opts ?? {};

  return createMutation(() => ({
    mutationFn: async (variables: Record<string, unknown>[]) => {
      if (mutationMode === 'undoable') {
        await new Promise<void>((resolve, reject) => {
          toast.undoable('Action can be undone', undoableTimeout, () => reject(new UndoError()), resolve);
        });
      }
      if (provider.createMany) {
        return provider.createMany<T>({ resource, variables });
      }
      const results = await Promise.all(variables.map(v => provider.create<T>({ resource, variables: v })));
      return { data: results.map(r => r.data) };
    },
    onMutate: mutationMode === 'optimistic' || mutationMode === 'undoable'
      ? async () => {
          await queryClient.cancelQueries({ queryKey: [resource] });
          const previousData = queryClient.getQueryData([resource, 'list']);
          return { previousData };
        }
      : undefined,
    onSuccess: () => {
      invalidateResource(queryClient, resource, invalidates);
      if (showToast && successNotification !== false) toast.success(successNotification || t('common.createSuccess'));
      if (auditLog) audit({ action: 'create', resource, details: { batch: true }, meta: opts?.meta });
    },
    onError: (error: Error, _variables: Record<string, unknown>[], context: { previousData?: unknown } | undefined) => {
      if ((mutationMode === 'optimistic' || mutationMode === 'undoable') && context?.previousData) {
        queryClient.setQueryData([resource, 'list'], context.previousData);
      }
      if (error instanceof UndoError) return;
      if (showToast && errorNotification !== false) toast.error(errorNotification || t('common.operationFailed') + ': ' + error.message);
    },
  }));
}

// ─── useUpdate ──────────────────────────────────────────────────

interface UpdateVariables {
  id: string | number;
  variables: Record<string, unknown>;
}

export function useUpdate<T = Record<string, unknown>>(resource: string, opts?: UseMutationOptions) {
  const provider = getDataProviderForResource(resource);
  const queryClient = useQueryClient();
  const { showToast = true, auditLog = true, mutationMode = 'pessimistic', undoableTimeout = 5000, invalidates, successNotification, errorNotification } = opts ?? {};

  return createMutation<{ data: T }, Error, UpdateVariables>(() => ({
    mutationFn: async ({ id, variables }: UpdateVariables) => {
      if (mutationMode === 'undoable') {
        await new Promise<void>((resolve, reject) => {
          toast.undoable('Action can be undone', undoableTimeout, () => reject(new UndoError()), resolve);
        });
      }
      return provider.update<T>({ resource, id, variables });
    },
    onMutate: mutationMode === 'optimistic' || mutationMode === 'undoable'
      ? async ({ id, variables }: UpdateVariables) => {
          await queryClient.cancelQueries({ queryKey: [resource] });
          const previousDetail = queryClient.getQueryData([resource, 'one', id]);
          const previousList = queryClient.getQueriesData({ queryKey: [resource, 'list'] });
          
          queryClient.setQueryData([resource, 'one', id], (old: any) => old ? { ...old, ...variables } : old);
          queryClient.setQueriesData({ queryKey: [resource, 'list'] }, (old: any) => {
            if (!old?.data) return old;
            return { ...old, data: old.data.map((item: any) => String(item.id) === String(id) ? { ...item, ...variables } : item) };
          });

          return { previousDetail, previousList };
        }
      : undefined,
    onSuccess: (_data: { data: T }, vars: UpdateVariables) => {
      invalidateResource(queryClient, resource, invalidates, vars.id);
      if (showToast && successNotification !== false) toast.success(successNotification || t('common.updateSuccess'));
      if (auditLog) audit({ action: 'update', resource, recordId: vars.id, meta: opts?.meta });
    },
    onError: (error: Error, _variables: UpdateVariables, context: any) => {
      if ((mutationMode === 'optimistic' || mutationMode === 'undoable') && context) {
        if (context.previousDetail) queryClient.setQueryData([resource, 'one', _variables.id], context.previousDetail);
        if (context.previousList) {
          context.previousList.forEach(([queryKey, data]: any) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
      }
      if (error instanceof UndoError) return;
      if (showToast && errorNotification !== false) toast.error(errorNotification || t('common.operationFailed') + ': ' + error.message);
    },
  }));
}

// ─── useUpdateMany ──────────────────────────────────────────────

export function useUpdateMany<T = Record<string, unknown>>(resource: string, opts?: UseMutationOptions) {
  const provider = getDataProviderForResource(resource);
  const queryClient = useQueryClient();
  const { showToast = true, auditLog = true, mutationMode = 'pessimistic', undoableTimeout = 5000, invalidates, successNotification, errorNotification } = opts ?? {};

  return createMutation<{ data: T[] }, Error, { ids: (string | number)[]; variables: Record<string, unknown> }>(() => ({
    mutationFn: async ({ ids, variables }: { ids: (string | number)[]; variables: Record<string, unknown> }) => {
      if (mutationMode === 'undoable') {
        await new Promise<void>((resolve, reject) => {
          toast.undoable('Action can be undone', undoableTimeout, () => reject(new UndoError()), resolve);
        });
      }
      if (provider.updateMany) {
        return provider.updateMany<T>({ resource, ids, variables });
      }
      const results = await Promise.all(ids.map(id => provider.update<T>({ resource, id, variables })));
      return { data: results.map(r => r.data) };
    },
    onMutate: mutationMode === 'optimistic' || mutationMode === 'undoable'
      ? async ({ ids, variables }) => {
          await queryClient.cancelQueries({ queryKey: [resource] });
          const previousList = queryClient.getQueriesData({ queryKey: [resource, 'list'] });
          
          queryClient.setQueriesData({ queryKey: [resource, 'list'] }, (old: any) => {
            if (!old?.data) return old;
            return { ...old, data: old.data.map((item: any) => ids.some(id => String(id) === String(item.id)) ? { ...item, ...variables } : item) };
          });

          return { previousList };
        }
      : undefined,
    onSuccess: () => {
      invalidateResource(queryClient, resource, invalidates);
      if (showToast && successNotification !== false) toast.success(successNotification || t('common.updateSuccess'));
      if (auditLog) audit({ action: 'update', resource, details: { batch: true }, meta: opts?.meta });
    },
    onError: (error: Error, _variables: { ids: (string|number)[] }, context: any) => {
      if ((mutationMode === 'optimistic' || mutationMode === 'undoable') && context?.previousList) {
        context.previousList.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (error instanceof UndoError) return;
      if (showToast && errorNotification !== false) toast.error(errorNotification || t('common.operationFailed') + ': ' + error.message);
    },
  }));
}

// ─── useDelete ──────────────────────────────────────────────────

export function useDelete(resource: string, opts?: UseMutationOptions) {
  const provider = getDataProviderForResource(resource);
  const queryClient = useQueryClient();
  const { showToast = true, auditLog = true, mutationMode = 'pessimistic', undoableTimeout = 5000, invalidates, successNotification, errorNotification } = opts ?? {};

  return createMutation(() => ({
    mutationFn: async (id: string | number) => {
      if (mutationMode === 'undoable') {
        await new Promise<void>((resolve, reject) => {
          toast.undoable('Action can be undone', undoableTimeout, () => reject(new UndoError()), resolve);
        });
      }
      return provider.deleteOne({ resource, id });
    },
    onMutate: mutationMode === 'optimistic' || mutationMode === 'undoable'
      ? async (id: string | number) => {
          await queryClient.cancelQueries({ queryKey: [resource] });
          const previousList = queryClient.getQueriesData({ queryKey: [resource, 'list'] });
          
          queryClient.setQueriesData({ queryKey: [resource, 'list'] }, (old: any) => {
            if (!old?.data) return old;
            return { ...old, data: old.data.filter((item: any) => String(item.id) !== String(id)) };
          });

          return { previousList };
        }
      : undefined,
    onSuccess: (_data: unknown, id: string | number) => {
      invalidateResource(queryClient, resource, invalidates, id);
      if (showToast && successNotification !== false) toast.success(successNotification || t('common.deleteSuccess'));
      if (auditLog) audit({ action: 'delete', resource, recordId: id, meta: opts?.meta });
    },
    onError: (error: Error, _variables: string | number, context: any) => {
      if ((mutationMode === 'optimistic' || mutationMode === 'undoable') && context?.previousList) {
        context.previousList.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (error instanceof UndoError) return;
      if (showToast && errorNotification !== false) toast.error(errorNotification || t('common.operationFailed') + ': ' + error.message);
    },
  }));
}

// ─── useDeleteMany ──────────────────────────────────────────────

export function useDeleteMany(resource: string, opts?: UseMutationOptions) {
  const provider = getDataProviderForResource(resource);
  const queryClient = useQueryClient();
  const { showToast = true, auditLog = true, mutationMode = 'pessimistic', undoableTimeout = 5000, invalidates, successNotification, errorNotification } = opts ?? {};

  return createMutation(() => ({
    mutationFn: async (ids: (string | number)[]) => {
      if (mutationMode === 'undoable') {
        await new Promise<void>((resolve, reject) => {
          toast.undoable('Action can be undone', undoableTimeout, () => reject(new UndoError()), resolve);
        });
      }
      if (provider.deleteMany) {
        return provider.deleteMany({ resource, ids });
      }
      const results = await Promise.all(ids.map(id => provider.deleteOne({ resource, id })));
      return { data: results.map(r => r.data) };
    },
    onMutate: mutationMode === 'optimistic' || mutationMode === 'undoable'
      ? async (ids: (string | number)[]) => {
          await queryClient.cancelQueries({ queryKey: [resource] });
          const previousList = queryClient.getQueriesData({ queryKey: [resource, 'list'] });
          
          queryClient.setQueriesData({ queryKey: [resource, 'list'] }, (old: any) => {
            if (!old?.data) return old;
            return { ...old, data: old.data.filter((item: any) => !ids.some(id => String(id) === String(item.id))) };
          });

          return { previousList };
        }
      : undefined,
    onSuccess: () => {
      invalidateResource(queryClient, resource, invalidates);
      if (showToast && successNotification !== false) toast.success(successNotification || t('common.deleteSuccess'));
      if (auditLog) audit({ action: 'delete', resource, details: { batch: true }, meta: opts?.meta });
    },
    onError: (error: Error, _ids: (string|number)[], context: any) => {
      if ((mutationMode === 'optimistic' || mutationMode === 'undoable') && context?.previousList) {
        context.previousList.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (error instanceof UndoError) return;
      if (showToast && errorNotification !== false) toast.error(errorNotification || t('common.operationFailed') + ': ' + error.message);
    },
  }));
}

// ─── useForm ────────────────────────────────────────────────────
// Standalone form hook — Refine v5 API compatible

type OptimisticUpdater<TData = unknown> = boolean | ((previous: TData | undefined, variables: Record<string, unknown>, id?: string | number) => TData);

export interface UseFormOptions {
  resource?: string;
  action?: 'create' | 'edit' | 'clone';
  id?: string | number;
  redirect?: 'list' | 'edit' | 'show' | false;
  successNotification?: string | false;
  errorNotification?: string | false;
  dataProviderName?: string;
  onMutationSuccess?: (data: unknown) => void;
  onMutationError?: (error: Error) => void;
  meta?: Record<string, unknown>;
  queryMeta?: Record<string, unknown>;
  mutationMeta?: Record<string, unknown>;
  disableServerSideValidation?: boolean;
  validate?: (values: Record<string, unknown>) => Record<string, string> | null;
  autoSave?: {
    enabled: boolean;
    debounce?: number;
    onFinish?: (values: Record<string, unknown>) => Record<string, unknown>;
    invalidateOnUnmount?: boolean;
    invalidates?: InvalidateScope[];
  };
  mutationMode?: MutationMode;
  undoableTimeout?: number;
  invalidates?: InvalidateScope[] | false;
  optimisticUpdateMap?: {
    list?: OptimisticUpdater;
    many?: OptimisticUpdater;
    detail?: OptimisticUpdater;
  };
  queryOptions?: { staleTime?: number; enabled?: boolean };
  createMutationOptions?: Record<string, unknown>;
  updateMutationOptions?: Record<string, unknown>;
  liveMode?: 'auto' | 'manual' | 'off';
  onLiveEvent?: (event: unknown) => void;
  liveParams?: Record<string, unknown>;
}

export type UseFormResult<T = Record<string, unknown>> = {
  readonly query: unknown;
  readonly mutation: unknown;
  readonly formLoading: boolean;
  readonly errors: Record<string, string>;
  setFieldError: (field: string, message: string) => void;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  onFinish: (values: Record<string, unknown>, finishOptions?: { redirect?: 'list' | 'edit' | 'show' | false }) => Promise<void>;
  triggerAutoSave: (values: Record<string, unknown>) => void;
  readonly autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  readonly resource: string;
  readonly action: 'create' | 'edit' | 'clone';
  readonly id: string | number | undefined;
  setId: (newId: string | number) => void;
  readonly mutationMode: MutationMode;
  redirect: (to: 'list' | 'edit' | 'show' | false) => void;
};

export function useForm<T = Record<string, unknown>>(options: UseFormOptions = {}): UseFormResult<T> {
  const queryClient = useQueryClient();

  const parsed = useParsed();
  const resource = options.resource ?? parsed.resource ?? '';
  const action = options.action ?? (parsed.action === 'list' ? 'create' : parsed.action as 'create' | 'edit' | 'clone') ?? 'create';
  let currentId = $state<string | number | undefined>(options.id ?? parsed.id);
  const {
    redirect: redirectDefault = 'list',
    successNotification, errorNotification,
    onMutationSuccess, onMutationError,
    meta: hookMeta, queryMeta: hookQueryMeta, mutationMeta: hookMutationMeta,
    disableServerSideValidation, validate, autoSave,
    mutationMode = 'pessimistic', undoableTimeout = 5000,
    dataProviderName, invalidates: invalidateScopes,
    optimisticUpdateMap,
    queryOptions,
  } = options;
  const provider = getDataProviderForResource(resource, dataProviderName);

  // Meta: split into query-specific and mutation-specific
  const parsedMeta = typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search).entries()) : {};
  const queryMeta = { ...parsedMeta, ...hookMeta, ...hookQueryMeta };
  const mutationMeta = { ...parsedMeta, ...hookMeta, ...hookMutationMeta };

  // setId — dynamically switch the record being edited
  function setId(newId: string | number) {
    currentId = newId;
  }

  // Validation state
  let errors = $state<Record<string, string>>({});

  function setFieldError(field: string, message: string) {
    errors = { ...errors, [field]: message };
  }

  function clearErrors() {
    errors = {};
  }

  function clearFieldError(field: string) {
    const next = { ...errors };
    delete next[field];
    errors = next;
  }

  function runValidation(values: Record<string, unknown>): boolean {
    clearErrors();
    if (validate) {
      const result = validate(values);
      if (result && Object.keys(result).length > 0) {
        errors = result;
        return false;
      }
    }
    return true;
  }

  function handleHttpError(error: Error) {
    if (error instanceof HttpError && error.errors && !disableServerSideValidation) {
      for (const [field, messages] of Object.entries(error.errors)) {
        const msg = Array.isArray(messages) ? messages[0] : messages;
        setFieldError(field, msg);
      }
      if (errorNotification !== false) toast.error(errorNotification || error.message || t('common.operationFailed'));
    } else {
      if (errorNotification !== false) toast.error(errorNotification || t('common.operationFailed') + ': ' + error.message);
    }
  }

  // Query for edit/clone
  const query = (action === 'edit' || action === 'clone') && currentId != null
    ? createQuery(() => ({
        queryKey: [resource, 'one', currentId],
        queryFn: async () => {
          const result = await provider.getOne<T>({ resource, id: currentId!, meta: queryMeta });
          return result.data;
        },
        enabled: (queryOptions?.enabled ?? true) && currentId != null,
        staleTime: queryOptions?.staleTime,
      }))
    : null;

  const createMut = createMutation(() => ({
    mutationFn: (variables: Record<string, unknown>) =>
      provider.create<T>({ resource, variables, meta: mutationMeta }),
    onSuccess: (data: { data: T }) => {
      if (invalidateScopes !== false) {
        queryClient.invalidateQueries({ queryKey: [resource] });
      }
      if (successNotification !== false) toast.success(successNotification || t('common.createSuccess'));
      const record = data.data as Record<string, unknown>;
      audit({ action: 'create', resource, recordId: record.id as string });
      onMutationSuccess?.(data);
      doRedirect(redirectOverride ?? redirectDefault);
    },
    onError: (error: Error) => {
      handleHttpError(error);
      onMutationError?.(error);
    },
  }));

  const updateMut = createMutation(() => ({
    mutationFn: (variables: Record<string, unknown>) =>
      provider.update<T>({ resource, id: currentId!, variables, meta: mutationMeta }),
    onMutate: optimisticUpdateMap ? async (variables: Record<string, unknown>) => {
      await queryClient.cancelQueries({ queryKey: [resource] });
      const previousDetail = queryClient.getQueryData([resource, 'one', currentId]);
      const previousList = queryClient.getQueriesData({ queryKey: [resource, 'list'] });
      const previousMany = queryClient.getQueriesData({ queryKey: [resource, 'many'] });

      // Apply optimistic updates per map
      const detailUpdater = optimisticUpdateMap.detail;
      if (detailUpdater !== false) {
        if (typeof detailUpdater === 'function') {
          queryClient.setQueryData([resource, 'one', currentId], (old: unknown) => detailUpdater(old, variables, currentId));
        } else {
          queryClient.setQueryData([resource, 'one', currentId], (old: Record<string, unknown> | undefined) => old ? { ...old, ...variables } : old);
        }
      }
      const listUpdater = optimisticUpdateMap.list;
      if (listUpdater !== false) {
        if (typeof listUpdater === 'function') {
          queryClient.setQueriesData({ queryKey: [resource, 'list'] }, (old: unknown) => listUpdater(old, variables, currentId));
        } else {
          queryClient.setQueriesData({ queryKey: [resource, 'list'] }, (old: { data?: Record<string, unknown>[] } | undefined) => {
            if (!old?.data) return old;
            return { ...old, data: old.data.map(item => String(item.id) === String(currentId) ? { ...item, ...variables } : item) };
          });
        }
      }

      return { previousDetail, previousList, previousMany };
    } : undefined,
    onSuccess: (data: { data: T }) => {
      if (invalidateScopes !== false) {
        queryClient.invalidateQueries({ queryKey: [resource] });
      }
      if (successNotification !== false) toast.success(successNotification || t('common.updateSuccess'));
      audit({ action: 'update', resource, recordId: currentId });
      onMutationSuccess?.(data);
      doRedirect(redirectOverride ?? redirectDefault);
    },
    onError: (error: Error, _variables: Record<string, unknown>, context: { previousDetail?: unknown; previousList?: [unknown, unknown][]; previousMany?: [unknown, unknown][] } | undefined) => {
      // Rollback optimistic updates
      if (context) {
        if (context.previousDetail) queryClient.setQueryData([resource, 'one', currentId], context.previousDetail);
        if (context.previousList) {
          for (const [qk, data] of context.previousList) {
            queryClient.setQueryData(qk as unknown[], data);
          }
        }
      }
      handleHttpError(error);
      onMutationError?.(error);
    },
  }));

  let redirectOverride: 'list' | 'edit' | 'show' | false | undefined;

  function doRedirect(to: 'list' | 'edit' | 'show' | false) {
    if (to === 'list') navigate(`/${resource}`);
    else if (to === 'edit' && currentId) navigate(`/${resource}/edit/${currentId}`);
    else if (to === 'show' && currentId) navigate(`/${resource}/show/${currentId}`);
  }

  async function onFinish(values: Record<string, unknown>, finishOptions?: { redirect?: 'list' | 'edit' | 'show' | false }) {
    if (!runValidation(values)) {
      toast.warning(t('validation.required'));
      return;
    }

    redirectOverride = finishOptions?.redirect;

    if (action === 'create' || action === 'clone') {
      // @ts-expect-error $ rune prefix
      await $createMut.mutateAsync(values);
    } else {
      // @ts-expect-error $ rune prefix
      await $updateMut.mutateAsync(values);
    }
  }

  // ─── autoSave ─────────────────────────────────────────────
  let autoSaveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  function triggerAutoSave(values: Record<string, unknown>) {
    if (!autoSave?.enabled || action === 'create') return;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    autoSaveTimer = setTimeout(async () => {
      const finalValues = autoSave.onFinish ? autoSave.onFinish(values) : values;
      autoSaveStatus = 'saving';
      try {
        await provider.update<T>({ resource, id: currentId!, variables: finalValues, meta: mutationMeta });
        // Invalidate per autoSave.invalidates or default
        const scopes = autoSave.invalidates ?? ['resourceAll'];
        for (const scope of scopes) {
          if (scope === 'resourceAll') queryClient.invalidateQueries({ queryKey: [resource] });
          else if (scope === 'detail' && currentId) queryClient.invalidateQueries({ queryKey: [resource, 'one', currentId] });
          else if (scope === 'list') queryClient.invalidateQueries({ queryKey: [resource, 'list'] });
        }
        autoSaveStatus = 'saved';
        setTimeout(() => { autoSaveStatus = 'idle'; }, 2000);
      } catch {
        autoSaveStatus = 'error';
      }
    }, autoSave.debounce ?? 1000);
  }

  // autoSave.invalidateOnUnmount — clean up when component unmounts
  if (autoSave?.invalidateOnUnmount) {
    $effect(() => {
      return () => {
        queryClient.invalidateQueries({ queryKey: [resource] });
      };
    });
  }

  return {
    query,
    get formLoading() {
      // @ts-expect-error $ rune prefix
      return (query ? $query?.isLoading : false) || $createMut.isPending || $updateMut.isPending;
    },
    mutation: action === 'edit' ? updateMut : createMut,
    onFinish,
    get errors() { return errors; },
    setFieldError,
    clearErrors,
    clearFieldError,
    triggerAutoSave,
    get autoSaveStatus() { return autoSaveStatus; },
    resource,
    action,
    get id() { return currentId; },
    setId,
    mutationMode,
    redirect: doRedirect,
  };
}

// ─── useTable ───────────────────────────────────────────────────
// Standalone table hook — Refine v5 API compatible

type FilterSetMode = 'merge' | 'replace';

interface UseTableOptions<T = Record<string, unknown>> {
  resource?: string;
  pagination?: Pagination;
  sorters?: {
    initial?: Sort[];
    permanent?: Sort[];
    mode?: 'off' | 'server';
  };
  filters?: {
    initial?: Filter[];
    permanent?: Filter[];
    mode?: 'off' | 'server';
    defaultBehavior?: FilterSetMode;
  };
  syncWithLocation?: boolean;
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  queryOptions?: { staleTime?: number; enabled?: boolean };
  liveMode?: 'auto' | 'manual' | 'off';
  onLiveEvent?: (event: unknown) => void;
  liveParams?: Record<string, unknown>;
  overtimeOptions?: { interval?: number; onInterval?: (elapsed: number) => void };
  successNotification?: string | false;
  errorNotification?: string | false;
}

export function useTable<T = Record<string, unknown>>(options: UseTableOptions<T> = {}) {
  const parsed = useParsed();
  const resource = options.resource ?? parsed.resource ?? '';
  const { meta, syncWithLocation = false, dataProviderName } = options;
  const paginationMode = options.pagination?.mode ?? 'server';
  const sortersMode = options.sorters?.mode ?? 'server';
  const filtersMode = options.filters?.mode ?? 'server';
  const filterDefaultBehavior = options.filters?.defaultBehavior ?? 'replace';

  const permanentSorters = options.sorters?.permanent ?? [];
  const permanentFilters = options.filters?.permanent ?? [];

  // Read initial state from URL if syncWithLocation
  let initPagination = options.pagination ?? { current: 1, pageSize: 10 };
  let initSorters = options.sorters?.initial ?? [];
  let initFilters = options.filters?.initial ?? [];

  if (syncWithLocation) {
    const urlState = readURLState();
    if (urlState.page || urlState.pageSize) {
      initPagination = {
        current: urlState.page ?? initPagination.current,
        pageSize: urlState.pageSize ?? initPagination.pageSize,
      };
    }
    if (urlState.sortField) {
      initSorters = [{ field: urlState.sortField, order: urlState.sortOrder ?? 'asc' }];
    }
    if (urlState.filters) {
      initFilters = urlState.filters;
    }
  }

  let pagination = $state<Pagination>(initPagination);
  let currentSorters = $state<Sort[]>(initSorters);
  let currentFilters = $state<Filter[]>(initFilters);

  // Effective sorters/filters = current + permanent
  const effectiveSorters = $derived([...currentSorters, ...permanentSorters]);
  const effectiveFilters = $derived([...currentFilters, ...permanentFilters]);

  // Build query params based on modes
  const querySorters = $derived(sortersMode === 'server' ? effectiveSorters : []);
  const queryFilters = $derived(filtersMode === 'server' ? effectiveFilters : []);
  const queryPagination = paginationMode === 'server'
    ? pagination
    : { current: 1, pageSize: 999999, mode: paginationMode as 'client' | 'off' };

  const query = useList<T>({ resource, pagination: queryPagination, sorters: querySorters, filters: queryFilters, meta, dataProviderName });

  function setSorters(newSorters: Sort[]) {
    currentSorters = newSorters;
  }

  function setFilters(newFilters: Filter[], mode?: FilterSetMode) {
    const behavior = mode ?? filterDefaultBehavior;
    if (behavior === 'merge') {
      // Merge: update existing by field, add new ones
      const merged = [...currentFilters];
      for (const nf of newFilters) {
        const idx = merged.findIndex(f => f.field === nf.field && f.operator === nf.operator);
        if (idx >= 0) {
          if (nf.value === undefined || nf.value === null || nf.value === '') {
            merged.splice(idx, 1); // Remove filter if value is empty
          } else {
            merged[idx] = nf;
          }
        } else if (nf.value !== undefined && nf.value !== null && nf.value !== '') {
          merged.push(nf);
        }
      }
      currentFilters = merged;
    } else {
      currentFilters = newFilters;
    }
    // Reset to page 1 when filters change
    pagination = { ...pagination, current: 1 };
  }

  function setPage(page: number) {
    pagination = { ...pagination, current: page };
  }

  function setPageSize(size: number) {
    pagination = { ...pagination, pageSize: size, current: 1 };
  }

  // Sync state to URL
  if (syncWithLocation) {
    $effect(() => {
      writeURLState({
        page: pagination.current,
        pageSize: pagination.pageSize,
        sortField: effectiveSorters[0]?.field,
        sortOrder: effectiveSorters[0]?.order,
        filters: effectiveFilters,
      });
    });
  }

  /** Generate a shareable URL string for current table state */
  function createLinkForSyncWithLocation(): string {
    const params = new URLSearchParams();
    if (pagination.current) params.set('page', String(pagination.current));
    if (pagination.pageSize) params.set('pageSize', String(pagination.pageSize));
    if (effectiveSorters[0]) {
      params.set('sortField', effectiveSorters[0].field);
      params.set('sortOrder', effectiveSorters[0].order);
    }
    if (effectiveFilters.length > 0) {
      params.set('filters', JSON.stringify(effectiveFilters));
    }
    return `?${params.toString()}`;
  }

  return {
    query,
    get pagination() { return pagination; },
    /** Current user-changeable sorters (excludes permanent) */
    get sorters() { return currentSorters; },
    /** Current user-changeable filters (excludes permanent) */
    get filters() { return currentFilters; },
    setSorters,
    setFilters,
    setPage,
    setPageSize,
    createLinkForSyncWithLocation,
    get totalPages() {
      // @ts-expect-error $ rune prefix
      const total = $query.data?.total ?? 0;
      return Math.ceil(total / (pagination.pageSize ?? 10));
    },
    get current() { return pagination.current ?? 1; },
    get pageSize() { return pagination.pageSize ?? 10; },
    get pageCount() {
      // @ts-expect-error $ rune prefix
      const total = $query.data?.total ?? 0;
      return Math.ceil(total / (pagination.pageSize ?? 10));
    },
    /** Client-side paged data (when pagination.mode is 'client') */
    get clientData(): T[] {
      if (paginationMode !== 'client') return [];
      // @ts-expect-error $ rune prefix
      const allData = ($query.data?.data ?? []) as T[];
      const start = ((pagination.current ?? 1) - 1) * (pagination.pageSize ?? 10);
      const end = start + (pagination.pageSize ?? 10);
      // Apply client-side sorting
      let sorted = [...allData];
      const activeSorters = sortersMode === 'off' ? effectiveSorters : currentSorters;
      if (activeSorters.length > 0) {
        const { field, order } = activeSorters[0];
        sorted.sort((a, b) => {
          const va = (a as Record<string, unknown>)[field];
          const vb = (b as Record<string, unknown>)[field];
          if (va == null) return 1;
          if (vb == null) return -1;
          const cmp = va < vb ? -1 : va > vb ? 1 : 0;
          return order === 'desc' ? -cmp : cmp;
        });
      }
      return sorted.slice(start, end);
    },
  };
}

// ─── useLog — Audit mutation hook ───────────────────────────────

export function useLog() {
  const auditProvider = getAuditLogProvider();

  const logMutation = createMutation(() => ({
    mutationFn: (params: { resource: string; action: string; data?: Record<string, unknown>; previousData?: Record<string, unknown>; meta?: Record<string, unknown> }) => {
      if (!auditProvider) throw new Error('AuditLogProvider is not configured. Call setAuditLogProvider() first.');
      return auditProvider.create(params);
    },
  }));

  return { log: logMutation };
}

// ─── useLogList — Audit query hook ──────────────────────────────

export function useLogList(params: { resource: string; action?: string; meta?: Record<string, unknown> }) {
  const auditProvider = getAuditLogProvider();

  return createQuery(() => ({
    queryKey: ['audit-log', params.resource, params.action],
    queryFn: () => {
      if (!auditProvider) throw new Error('AuditLogProvider is not configured. Call setAuditLogProvider() first.');
      return auditProvider.get(params);
    },
    enabled: !!auditProvider,
  }));
}

// ─── useModalForm — Modal + Form state hook ─────────────────────

interface UseModalFormOptions {
  resource?: string;
  action?: 'create' | 'edit';
  id?: string | number;
  autoResetForm?: boolean;
  defaultVisible?: boolean;
  meta?: Record<string, unknown>;
}

export function useModalForm<T = Record<string, unknown>>(options: UseModalFormOptions = {}) {
  let visible = $state(options.defaultVisible ?? false);
  let modalId = $state<string | number | undefined>(options.id);

  const form = useForm<T>({
    resource: options.resource,
    action: options.action ?? 'create',
    id: modalId,
    redirect: false,
    meta: options.meta,
  });

  function show(id?: string | number) {
    if (id !== undefined) modalId = id;
    visible = true;
  }

  function close() {
    visible = false;
    if (options.autoResetForm !== false) {
      form.clearErrors();
    }
  }

  return {
    ...form,
    get visible() { return visible; },
    show,
    close,
    get modalId() { return modalId; },
  };
}

// ─── useDrawerForm — Drawer + Form state hook ───────────────────

export function useDrawerForm<T = Record<string, unknown>>(options: UseModalFormOptions = {}) {
  // Same API as useModalForm, just semantic distinction
  return useModalForm<T>(options);
}

// ─── useOvertime — Long request elapsed time indicator ──────────

interface UseOvertimeOptions {
  interval?: number; // ms, default 1000
  onInterval?: (elapsedTime: number) => void;
}

export function useOvertime(isLoading: boolean, options: UseOvertimeOptions = {}) {
  const { interval = 1000, onInterval } = options;
  let elapsedTime = $state(0);
  let timer: ReturnType<typeof setInterval> | null = null;

  $effect(() => {
    if (isLoading) {
      elapsedTime = 0;
      timer = setInterval(() => {
        elapsedTime += interval;
        onInterval?.(elapsedTime);
      }, interval);
    } else {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      elapsedTime = 0;
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  });

  return {
    get elapsedTime() { return elapsedTime; },
  };
}

// ─── useNotification ────────────────────────────────────────────

export function useNotification() {
  return {
    open: (params: { type: 'success' | 'error' | 'warning' | 'info'; message: string; description?: string; key?: string }) => {
      const fn = params.type === 'error' ? toast.error
        : params.type === 'warning' ? toast.warning
        : params.type === 'info' ? toast.info
        : toast.success;
      fn(params.message);
    },
    close: (_key: string) => {
      // toast system auto-dismisses; no-op for compatibility
    },
  };
}

// ─── useDataProvider ────────────────────────────────────────────

export function useDataProvider(name?: string) {
  return getDataProvider(name);
}

// ─── useMenu ────────────────────────────────────────────────────



interface MenuItem {
  name: string;
  label: string;
  icon?: string;
  route: string;
  identifier?: string;
}

export function useMenu(): { menuItems: MenuItem[]; selectedKey: string } {
  const resources = getResources();
  const parsed = useParsed();

  const menuItems: MenuItem[] = resources
    .filter(r => {
      try {
        return canAccess(r.name, 'list').can;
      } catch {
        return true; // No access control configured, show all
      }
    })
    .map(r => ({
      name: r.name,
      label: r.label,
      icon: r.icon,
      route: `/${r.name}`,
      identifier: r.identifier,
    }));

  return {
    menuItems,
    get selectedKey() { return parsed.resource ?? ''; },
  };
}

// ─── useBreadcrumb ──────────────────────────────────────────────



interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

export function useBreadcrumb(): { breadcrumbs: BreadcrumbItem[] } {
  const parsed = useParsed();
  const { humanize } = getTextTransformers();

  const breadcrumbs: BreadcrumbItem[] = [];

  if (parsed.resource) {
    try {
      const resource = getResource(parsed.resource);
      breadcrumbs.push({
        label: resource.label || humanize(resource.name),
        href: `/${resource.name}`,
        icon: resource.icon,
      });
    } catch {
      breadcrumbs.push({ label: humanize(parsed.resource), href: `/${parsed.resource}` });
    }

    if (parsed.action && parsed.action !== 'list') {
      breadcrumbs.push({ label: humanize(parsed.action) });
    }
  }

  return { breadcrumbs };
}

// ─── useThemedLayoutContext ─────────────────────────────────────

export function useThemedLayoutContext() {
  let sidebarCollapsed = $state(false);

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed = collapsed;
  }

  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
  }

  return {
    get sidebarCollapsed() { return sidebarCollapsed; },
    setSidebarCollapsed,
    toggleSidebar,
  };
}
