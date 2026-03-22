// Complete CRUD hooks — 100% Refine-compatible
// TanStack Query v6 (Svelte 5 runes-native) wrappers

import {
  createQuery,
  createMutation,
  createInfiniteQuery,
  useQueryClient,
} from '@tanstack/svelte-query';
import { getDataProviderForResource, getDataProvider } from './context';
import type { GetListResult, Sort, Filter, Pagination, MutationMode, CustomParams, CustomResult } from './types';
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

// ─── useSelect ──────────────────────────────────────────────────

interface UseSelectOptions {
  resource: string;
  optionLabel?: string;
  optionValue?: string;
  filters?: Filter[];
  sorters?: Sort[];
  enabled?: boolean;
}

export function useSelect(options: UseSelectOptions) {
  const {
    resource, optionLabel = 'name', optionValue = 'id',
    filters, sorters, enabled = true,
  } = options;
  const provider = getDataProviderForResource(resource);

  return createQuery(() => ({
    queryKey: [resource, 'select', { optionLabel, optionValue, filters }],
    queryFn: async () => {
      const result = await provider.getList({ resource, pagination: { current: 1, pageSize: 1000 }, filters, sorters });
      return result.data.map(item => ({
        label: String(item[optionLabel] ?? ''),
        value: String(item[optionValue] ?? ''),
      }));
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  }));
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
// Standalone form hook (like Refine's useForm)

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
  disableServerSideValidation?: boolean;
  validate?: (values: Record<string, unknown>) => Record<string, string> | null;
  autoSave?: {
    enabled: boolean;
    debounce?: number;
    onFinish?: (values: Record<string, unknown>) => Record<string, unknown>;
  };
  mutationMode?: MutationMode;
  undoableTimeout?: number;
}

export type UseFormResult<T = Record<string, unknown>> = {
  readonly query: any;
  readonly mutation: any;
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
  readonly mutationMode: MutationMode;
};

export function useForm<T = Record<string, unknown>>(options: UseFormOptions = {}): UseFormResult<T> {
  const queryClient = useQueryClient();

  // #7: Auto-derive from route when not provided
  const parsed = useParsed();
  const resource = options.resource ?? parsed.resource ?? '';
  const action = options.action ?? (parsed.action === 'list' ? 'create' : parsed.action as 'create' | 'edit' | 'clone') ?? 'create';
  const id = options.id ?? parsed.id;
  const { redirect = 'list', successNotification, errorNotification, onMutationSuccess, onMutationError, meta: hookMeta, disableServerSideValidation, validate, autoSave, mutationMode = 'pessimistic', undoableTimeout = 5000, dataProviderName } = options;
  const provider = getDataProviderForResource(resource, dataProviderName);

  // #8: Merge meta from URL
  const parsedMeta = typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search).entries()) : {};
  const meta = { ...parsedMeta, ...hookMeta };

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

  // #5: HttpError integration — maps server validation errors to form fields
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

  // Fetch existing data for edit/clone
  const query = (action === 'edit' || action === 'clone') && id != null
    ? createQuery(() => ({
        queryKey: [resource, 'one', id],
        queryFn: async () => {
          const result = await provider.getOne<T>({ resource, id, meta });
          return result.data;
        },
        enabled: id != null,
      }))
    : null;

  const createMut = createMutation(() => ({
    mutationFn: (variables: Record<string, unknown>) =>
      provider.create<T>({ resource, variables }),
    onSuccess: (data: { data: T }) => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      if (successNotification !== false) toast.success(successNotification || t('common.createSuccess'));
      const record = data.data as Record<string, unknown>;
      audit({ action: 'create', resource, recordId: record.id as string });
      onMutationSuccess?.(data);
      handleRedirect();
    },
    onError: (error: Error) => {
      handleHttpError(error);
      onMutationError?.(error);
    },
  }));

  const updateMut = createMutation(() => ({
    mutationFn: (variables: Record<string, unknown>) =>
      provider.update<T>({ resource, id: id!, variables }),
    onSuccess: (data: { data: T }) => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      if (successNotification !== false) toast.success(successNotification || t('common.updateSuccess'));
      audit({ action: 'update', resource, recordId: id });
      onMutationSuccess?.(data);
      handleRedirect();
    },
    onError: (error: Error) => {
      handleHttpError(error);
      onMutationError?.(error);
    },
  }));

  let redirectOverride: 'list' | 'edit' | 'show' | false | undefined;

  function handleRedirect() {
    const r = redirectOverride !== undefined ? redirectOverride : redirect;
    if (r === 'list') navigate(`/${resource}`);
    else if (r === 'edit' && id) navigate(`/${resource}/edit/${id}`);
    else if (r === 'show' && id) navigate(`/${resource}/show/${id}`);
  }

  async function onFinish(values: Record<string, unknown>, finishOptions?: { redirect?: 'list' | 'edit' | 'show' | false }) {
    // Run validation before submitting
    if (!runValidation(values)) {
      toast.warning(t('validation.required'));
      return;
    }

    redirectOverride = finishOptions?.redirect;

    if (action === 'create' || action === 'clone') {
      // @ts-expect-error $ rune prefix — Svelte compiler transforms this
      await $createMut.mutateAsync(values);
    } else {
      // @ts-expect-error $ rune prefix — Svelte compiler transforms this
      await $updateMut.mutateAsync(values);
    }
  }

  const base = {
    query,
    get formLoading() {
      // @ts-expect-error $ rune prefix — Svelte compiler transforms this
      return (query ? $query?.isLoading : false) || $createMut.isPending || $updateMut.isPending;
    },
    mutation: action === 'edit' ? updateMut : createMut,
    onFinish,
    get errors() { return errors; },
    setFieldError,
    clearErrors,
    clearFieldError,
  };

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
        await provider.update<T>({ resource, id: id!, variables: finalValues });
        queryClient.invalidateQueries({ queryKey: [resource] });
        autoSaveStatus = 'saved';
        // Reset to idle after 2s
        setTimeout(() => { autoSaveStatus = 'idle'; }, 2000);
      } catch {
        autoSaveStatus = 'error';
      }
    }, autoSave.debounce ?? 1000);
  }

  return {
    query,
    get formLoading() {
      // @ts-expect-error $ rune prefix — Svelte compiler transforms this
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
    id,
    mutationMode,
  };
}

// ─── useTable ───────────────────────────────────────────────────
// Standalone table hook (like Refine's useTable)

interface UseTableOptions {
  resource?: string;
  pagination?: Pagination;
  sorters?: Sort[];
  filters?: Filter[];
  syncWithLocation?: boolean;
  meta?: Record<string, unknown>;
}

export function useTable<T = Record<string, unknown>>(options: UseTableOptions = {}) {
  // #7: Auto-derive from route when not provided
  const parsed = useParsed();
  const resource = options.resource ?? parsed.resource ?? '';
  const { meta, syncWithLocation = false } = options;
  const paginationMode = options.pagination?.mode ?? 'server';

  // Read initial state from URL if syncWithLocation
  let initialPagination = options.pagination ?? { current: 1, pageSize: 10 };
  let initialSorters = options.sorters ?? [];
  let initialFilters = options.filters ?? [];

  if (syncWithLocation) {
    const urlState = readURLState();
    if (urlState.page || urlState.pageSize) {
      initialPagination = {
        current: urlState.page ?? initialPagination.current,
        pageSize: urlState.pageSize ?? initialPagination.pageSize,
      };
    }
    if (urlState.sortField) {
      initialSorters = [{ field: urlState.sortField, order: urlState.sortOrder ?? 'asc' }];
    }
    if (urlState.filters) {
      initialFilters = urlState.filters;
    }
  }

  let pagination = $state<Pagination>(initialPagination);
  let sorters = $state<Sort[]>(initialSorters);
  let filters = $state<Filter[]>(initialFilters);

  // For client/off mode, fetch all data (no server pagination)
  const queryPagination = paginationMode === 'server' ? pagination : { current: 1, pageSize: 999999, mode: paginationMode as 'client' | 'off' };
  const query = useList<T>({ resource, pagination: queryPagination, sorters: paginationMode === 'server' ? sorters : [], filters, meta });

  function setSorters(newSorters: Sort[]) { sorters = newSorters; }
  function setFilters(newFilters: Filter[]) { filters = newFilters; }
  function setPage(page: number) { pagination = { ...pagination, current: page }; }
  function setPageSize(size: number) { pagination = { ...pagination, pageSize: size, current: 1 }; }

  // Sync state to URL when syncWithLocation is enabled
  if (syncWithLocation) {
    $effect(() => {
      writeURLState({
        page: pagination.current,
        pageSize: pagination.pageSize,
        sortField: sorters[0]?.field,
        sortOrder: sorters[0]?.order,
        filters: filters,
      });
    });
  }

  return {
    query,
    pagination,
    sorters,
    filters,
    setSorters,
    setFilters,
    setPage,
    setPageSize,
    get totalPages() {
      // @ts-expect-error $ rune prefix — Svelte compiler transforms this
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
      if (sorters.length > 0) {
        const { field, order } = sorters[0];
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
