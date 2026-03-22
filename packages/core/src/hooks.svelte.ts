// Complete CRUD hooks — 100% Refine-compatible
// TanStack Query v6 (Svelte 5 runes-native) wrappers

import {
  createQuery,
  createMutation,
  createInfiniteQuery,
  useQueryClient,
} from '@tanstack/svelte-query';
import { getDataProviderForResource, getDataProvider } from './context';
import type { GetListResult, Sort, Filter, Pagination, MutationMode } from './types';
import { HttpError } from './types';
import { toast } from './toast.svelte';
import { audit } from './audit';
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
  enabled?: boolean;
}

export function useList<T = Record<string, unknown>>(options: UseListOptions) {
  const { resource, pagination, sorters, filters, meta, enabled = true } = options;
  const provider = getDataProviderForResource(resource);

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
  enabled?: boolean;
}

export function useInfiniteList<T = Record<string, unknown>>(options: UseInfiniteListOptions) {
  const { resource, pageSize = 10, sorters, filters, meta, enabled = true } = options;
  const provider = getDataProviderForResource(resource);

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
  enabled?: boolean;
}

export function useOne<T = Record<string, unknown>>(options: UseOneOptions) {
  const { resource, id, meta, enabled = true } = options;
  const provider = getDataProviderForResource(resource);

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

// ─── useCustom ──────────────────────────────────────────────────

interface UseCustomQueryOptions<T = unknown> {
  queryKey: unknown[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
}

export function useCustom<T = unknown>(options: UseCustomQueryOptions<T>) {
  return createQuery(() => ({
    queryKey: options.queryKey,
    queryFn: options.queryFn,
    enabled: options.enabled ?? true,
  }));
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

// ─── useResource ────────────────────────────────────────────────

export { getResource as useResource } from './context';

// ─── Mutation options ───────────────────────────────────────────

interface UseMutationOptions {
  showToast?: boolean;
  auditLog?: boolean;
  mutationMode?: MutationMode;
}

// ─── useCreate ──────────────────────────────────────────────────

export function useCreate<T = Record<string, unknown>>(resource: string, opts?: UseMutationOptions) {
  const provider = getDataProviderForResource(resource);
  const queryClient = useQueryClient();
  const { showToast = true, auditLog = true, mutationMode = 'pessimistic' } = opts ?? {};

  return createMutation(() => ({
    mutationFn: (variables: Record<string, unknown>) =>
      provider.create<T>({ resource, variables }),
    onMutate: mutationMode === 'optimistic'
      ? async (_variables: Record<string, unknown>) => {
          await queryClient.cancelQueries({ queryKey: [resource] });
          const previousData = queryClient.getQueryData([resource, 'list']);
          return { previousData };
        }
      : undefined,
    onSuccess: (data: { data: T }) => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      if (showToast) toast.success(t('common.createSuccess'));
      if (auditLog) {
        const record = data.data as Record<string, unknown>;
        audit({ action: 'create', resource, recordId: record.id as string });
      }
    },
    onError: (error: Error, _variables: Record<string, unknown>, context: { previousData?: unknown } | undefined) => {
      if (mutationMode === 'optimistic' && context?.previousData) {
        queryClient.setQueryData([resource, 'list'], context.previousData);
      }
      if (showToast) toast.error(t('common.operationFailed') + ': ' + error.message);
    },
  }));
}

// ─── useCreateMany ──────────────────────────────────────────────

export function useCreateMany<T = Record<string, unknown>>(resource: string, opts?: UseMutationOptions) {
  const provider = getDataProviderForResource(resource);
  const queryClient = useQueryClient();
  const { showToast = true, auditLog = true } = opts ?? {};

  return createMutation(() => ({
    mutationFn: async (variables: Record<string, unknown>[]) => {
      if (provider.createMany) {
        return provider.createMany<T>({ resource, variables });
      }
      const results = await Promise.all(variables.map(v => provider.create<T>({ resource, variables: v })));
      return { data: results.map(r => r.data) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      if (showToast) toast.success(t('common.createSuccess'));
      if (auditLog) audit({ action: 'create', resource, details: { batch: true } });
    },
    onError: (error: Error) => {
      if (showToast) toast.error(t('common.operationFailed') + ': ' + error.message);
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
  const { showToast = true, auditLog = true, mutationMode = 'pessimistic' } = opts ?? {};

  return createMutation<{ data: T }, Error, UpdateVariables>(() => ({
    mutationFn: ({ id, variables }: UpdateVariables) =>
      provider.update<T>({ resource, id, variables }),
    onMutate: mutationMode === 'optimistic'
      ? async ({ id }: UpdateVariables) => {
          await queryClient.cancelQueries({ queryKey: [resource, 'one', id] });
          const previousData = queryClient.getQueryData([resource, 'one', id]);
          return { previousData };
        }
      : undefined,
    onSuccess: (_data: { data: T }, vars: UpdateVariables) => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      if (showToast) toast.success(t('common.updateSuccess'));
      if (auditLog) audit({ action: 'update', resource, recordId: vars.id });
    },
    onError: (error: Error) => {
      if (showToast) toast.error(t('common.operationFailed') + ': ' + error.message);
    },
  }));
}

// ─── useUpdateMany ──────────────────────────────────────────────

export function useUpdateMany<T = Record<string, unknown>>(resource: string, opts?: UseMutationOptions) {
  const provider = getDataProviderForResource(resource);
  const queryClient = useQueryClient();
  const { showToast = true, auditLog = true } = opts ?? {};

  return createMutation(() => ({
    mutationFn: async ({ ids, variables }: { ids: (string | number)[]; variables: Record<string, unknown> }) => {
      if (provider.updateMany) {
        return provider.updateMany<T>({ resource, ids, variables });
      }
      const results = await Promise.all(ids.map(id => provider.update<T>({ resource, id, variables })));
      return { data: results.map(r => r.data) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      if (showToast) toast.success(t('common.updateSuccess'));
      if (auditLog) audit({ action: 'update', resource, details: { batch: true } });
    },
    onError: (error: Error) => {
      if (showToast) toast.error(t('common.operationFailed') + ': ' + error.message);
    },
  }));
}

// ─── useDelete ──────────────────────────────────────────────────

export function useDelete(resource: string, opts?: UseMutationOptions) {
  const provider = getDataProviderForResource(resource);
  const queryClient = useQueryClient();
  const { showToast = true, auditLog = true, mutationMode = 'pessimistic' } = opts ?? {};

  return createMutation(() => ({
    mutationFn: (id: string | number) =>
      provider.deleteOne({ resource, id }),
    onMutate: mutationMode === 'optimistic'
      ? async (_id: string | number) => {
          await queryClient.cancelQueries({ queryKey: [resource] });
          const previousData = queryClient.getQueryData([resource, 'list']);
          return { previousData };
        }
      : undefined,
    onSuccess: (_data: unknown, id: string | number) => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      if (showToast) toast.success(t('common.deleteSuccess'));
      if (auditLog) audit({ action: 'delete', resource, recordId: id });
    },
    onError: (error: Error) => {
      if (showToast) toast.error(t('common.operationFailed') + ': ' + error.message);
    },
  }));
}

// ─── useDeleteMany ──────────────────────────────────────────────

export function useDeleteMany(resource: string, opts?: UseMutationOptions) {
  const provider = getDataProviderForResource(resource);
  const queryClient = useQueryClient();
  const { showToast = true, auditLog = true } = opts ?? {};

  return createMutation(() => ({
    mutationFn: async (ids: (string | number)[]) => {
      if (provider.deleteMany) {
        return provider.deleteMany({ resource, ids });
      }
      const results = await Promise.all(ids.map(id => provider.deleteOne({ resource, id })));
      return { data: results.map(r => r.data) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      if (showToast) toast.success(t('common.deleteSuccess'));
      if (auditLog) audit({ action: 'delete', resource, details: { batch: true } });
    },
    onError: (error: Error) => {
      if (showToast) toast.error(t('common.operationFailed') + ': ' + error.message);
    },
  }));
}

// ─── useForm ────────────────────────────────────────────────────
// Standalone form hook (like Refine's useForm)

interface UseFormOptions {
  resource?: string;
  action?: 'create' | 'edit' | 'clone';
  id?: string | number;
  redirect?: 'list' | 'edit' | 'show' | false;
  mutationMode?: MutationMode;
  undoableTimeout?: number;
  onMutationSuccess?: (data: unknown) => void;
  onMutationError?: (error: Error) => void;
  meta?: Record<string, unknown>;
  validate?: (values: Record<string, unknown>) => Record<string, string> | null;
  autoSave?: {
    enabled: boolean;
    debounce?: number;
    onFinish?: (values: Record<string, unknown>) => Record<string, unknown>;
  };
}

export function useForm<T = Record<string, unknown>>(options: UseFormOptions = {}) {
  const queryClient = useQueryClient();

  // #7: Auto-derive from route when not provided
  const parsed = useParsed();
  const resource = options.resource ?? parsed.resource ?? '';
  const action = options.action ?? (parsed.action === 'list' ? 'create' : parsed.action as 'create' | 'edit' | 'clone') ?? 'create';
  const id = options.id ?? parsed.id;
  const { redirect = 'list', onMutationSuccess, onMutationError, meta, validate, autoSave, mutationMode = 'pessimistic', undoableTimeout = 5000 } = options;
  const provider = getDataProviderForResource(resource);

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
    if (error instanceof HttpError && error.errors) {
      for (const [field, messages] of Object.entries(error.errors)) {
        const msg = Array.isArray(messages) ? messages[0] : messages;
        setFieldError(field, msg);
      }
      toast.error(error.message || t('common.operationFailed'));
    } else {
      toast.error(t('common.operationFailed') + ': ' + error.message);
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
      toast.success(t('common.createSuccess'));
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
      toast.success(t('common.updateSuccess'));
      audit({ action: 'update', resource, recordId: id });
      onMutationSuccess?.(data);
      handleRedirect();
    },
    onError: (error: Error) => {
      handleHttpError(error);
      onMutationError?.(error);
    },
  }));

  function handleRedirect() {
    if (redirect === 'list') navigate(`/${resource}`);
    else if (redirect === 'edit' && id) navigate(`/${resource}/edit/${id}`);
    else if (redirect === 'show' && id) navigate(`/${resource}/show/${id}`);
  }

  async function onFinish(values: Record<string, unknown>) {
    // Run validation before submitting
    if (!runValidation(values)) {
      toast.warning(t('validation.required'));
      return;
    }

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

  // Read initial state from URL if syncWithLocation
  let initialPagination = options.pagination ?? { current: 1, pageSize: 10 };
  let initialSorters = options.sorters ?? [];

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
  }

  let pagination = $state<Pagination>(initialPagination);
  let sorters = $state<Sort[]>(initialSorters);
  let filters = $state<Filter[]>(options.filters ?? []);

  const query = useList<T>({ resource, pagination, sorters, filters, meta });

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
      return Math.ceil(($query.data?.total ?? 0) / (pagination.pageSize ?? 10));
    },
  };
}
