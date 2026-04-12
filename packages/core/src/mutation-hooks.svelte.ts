import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { getAdminOptions } from './options.svelte';
import { getDataProviderForResource, getResource, getLiveProvider } from './context.svelte';
import { useParsed } from './useParsed.svelte';
import { audit } from './audit';
import { UndoError } from './types';
import type { BaseRecord, HttpError, CreateParams, UpdateParams, DeleteParams, KnownResources } from './types';
import { checkError, createOvertimeTracker, fireSuccessNotification, fireErrorNotification } from './hook-utils.svelte';
import type { NotificationConfig, OvertimeOptions } from './hook-utils.svelte';
import { toast } from './toast.svelte';

// ─── Helper: publish live events after mutations ────────────────

function publishLiveEvent(resource: string, type: 'created' | 'updated' | 'deleted', ids?: (string | number)[]) {
  try {
    const liveProvider = getLiveProvider();
    if (liveProvider?.publish) {
      liveProvider.publish({
        type: type === 'created' ? 'INSERT' : type === 'updated' ? 'UPDATE' : 'DELETE',
        resource,
        payload: { ids },
      });
    }
  } catch { /* LiveProvider not configured — skip silently */ }
}

/**
 * Invalidate queries by scope. Respects per-mutation `invalidates` override.
 * Default invalidation scopes per operation:
 *   - create: ['list', 'many']
 *   - update: ['list', 'many', 'detail']
 *   - delete: ['list', 'many']
 */
function invalidateByScopes(
  queryClient: ReturnType<typeof useQueryClient>,
  resource: string,
  scopes: string[] | false | undefined,
  defaults: string[],
  id?: string | number
): void {
  if (scopes === false) return;
  const effectiveScopes = (scopes && scopes.length > 0) ? scopes : defaults;
  for (const scope of effectiveScopes) {
    if (scope === 'list') queryClient.invalidateQueries({ queryKey: [resource, 'list'] });
    else if (scope === 'many') queryClient.invalidateQueries({ queryKey: [resource, 'many'] });
    else if ((scope === 'detail' || scope === 'one') && id != null) queryClient.invalidateQueries({ queryKey: [resource, 'one', id] });
    else if (scope === 'resourceAll') queryClient.invalidateQueries({ queryKey: [resource] });
  }
}

function deepMerge(target: any, source: any): any {
  if (!target || typeof target !== 'object') return source;
  if (!source || typeof source !== 'object') return source;
  if (Array.isArray(source) || source instanceof Date) return source;
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && !(source[key] instanceof Date)) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// ─── useCreate ─────────────────────────────────────────────────

interface MutationContext {
  _svadmin_ctx?: boolean;
  userContext?: unknown;
  previousQueries?: [unknown, unknown][];
}

interface MutationCallbacks {
  onMutate?: (variables: unknown) => unknown | Promise<unknown>;
  onSuccess?: (data: unknown, variables: unknown, context: unknown) => void;
  onError?: (error: unknown, variables: unknown, context: unknown) => void;
  onSettled?: (data: unknown | undefined, error: unknown | null, variables: unknown, context: unknown) => void;
}

export interface UseCreateOptions {
  resource?: KnownResources;
  mutationOptions?: MutationCallbacks;
  overtimeOptions?: OvertimeOptions;
}

export interface UseCreateMutateParams<TVariables> {
  resource?: KnownResources;
  variables: TVariables;
  successNotification?: NotificationConfig;
  errorNotification?: NotificationConfig;
  invalidates?: string[] | false;
  meta?: Record<string, unknown>;
  dataProviderName?: string;
}

export function useCreate<TData extends BaseRecord = BaseRecord, TError = HttpError, TVariables = Record<string, unknown>>(options: UseCreateOptions = {}) {
  const parsed = useParsed();
  const defaultResource = options.resource ?? parsed.resource ?? '';
  const adminOptions = getAdminOptions();
  const queryClient = useQueryClient();

  const overtime = createOvertimeTracker(() => mutation.isPending, options.overtimeOptions ?? adminOptions.overtime);

  const mutation = createMutation<
    { data: TData },
    TError,
    UseCreateMutateParams<TVariables>
  >(() => ({
    ...options.mutationOptions,
    mutationFn: async (params) => {
      const resName = params.resource ?? defaultResource;
      const provider = getDataProviderForResource(resName, params.dataProviderName);
      return await provider.create<TData, TVariables>({
          resource: resName,
          variables: params.variables,
          meta: params.meta,
        });
    },
    onMutate: options.mutationOptions?.onMutate,
    onSuccess: (data, params, context) => {
      const resName = params.resource ?? defaultResource;
      fireSuccessNotification(params.successNotification, 'Created successfully', data.data, params.variables, resName);
      const res = getResource(resName);
      const pk = res.primaryKey ?? 'id';
      const newId = (data.data as Record<string, unknown>)[pk];
      audit({ action: 'create', resource: resName, recordId: String(newId) });
      publishLiveEvent(resName, 'created', newId != null ? [newId as string | number] : undefined);
      // Invalidation in onSuccess for create (refine pattern — no optimistic data to reconcile on error)
      invalidateByScopes(queryClient, resName, params.invalidates, ['list', 'many']);
      if (typeof options.mutationOptions?.onSuccess === 'function') {
        (options.mutationOptions.onSuccess as Function)(data, params, context);
      }
    },
    onError: (error, params, context) => {
      checkError(error);
      fireErrorNotification(params.errorNotification, 'Create failed', error);
      if (typeof options.mutationOptions?.onError === 'function') {
        (options.mutationOptions.onError as Function)(error, params, context);
      }
    },
  }));

  return { mutation, get overtime() { return overtime; } };
}

// ─── useUpdate ─────────────────────────────────────────────────

export interface UseUpdateOptions {
  resource?: KnownResources;
  id?: string | number;
  mutationMode?: 'pessimistic' | 'optimistic' | 'undoable';
  undoableTimeout?: number;
  mutationOptions?: MutationCallbacks;
  overtimeOptions?: OvertimeOptions;
}

export interface UseUpdateMutateParams<TVariables> {
  resource?: KnownResources;
  id?: string | number;
  variables: TVariables;
  successNotification?: NotificationConfig;
  errorNotification?: NotificationConfig;
  invalidates?: string[] | false;
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  onCancel?: () => void;
  optimisticUpdateMap?: {
    detail?: boolean | ((previous: unknown, variables: TVariables, id?: string | number) => unknown);
    list?: boolean | ((previous: unknown, variables: TVariables, id?: string | number) => unknown);
    many?: boolean | ((previous: unknown, variables: TVariables, id?: string | number) => unknown);
  };
}

export function useUpdate<TData extends BaseRecord = BaseRecord, TError = HttpError, TVariables = Record<string, unknown>>(options: UseUpdateOptions = {}) {
  const parsed = useParsed();
  const defaultResource = options.resource ?? parsed.resource ?? '';
  const defaultId = options.id ?? parsed.id;
  const adminOptions = getAdminOptions();
  const queryClient = useQueryClient();
  const mutationMode = options.mutationMode ?? adminOptions.mutationMode ?? 'pessimistic';
  const undoableTimeout = options.undoableTimeout ?? adminOptions.undoableTimeout ?? 5000;

  const overtime = createOvertimeTracker(() => mutation.isPending, options.overtimeOptions ?? adminOptions.overtime);

  const mutation = createMutation<
    { data: TData },
    TError,
    UseUpdateMutateParams<TVariables>
  >(() => ({
    ...options.mutationOptions,
    mutationFn: async (params) => {
      const resName = params.resource ?? defaultResource;
      const targetId = params.id ?? defaultId;
      if (targetId == null) throw new Error('useUpdate requires an id');

      if (mutationMode === 'undoable') {
        await new Promise<void>((resolve, reject) => {
          toast.undoable('Action can be undone', undoableTimeout, () => {
            params.onCancel?.();
            reject(new UndoError());
          }, resolve);
        });
      }

      const provider = getDataProviderForResource(resName, params.dataProviderName);
      return await provider.update<TData, TVariables>({
          resource: resName,
          id: targetId,
          variables: params.variables,
          meta: params.meta,
        });
    },
    onMutate: async (params) => {
      const userOnMutate = options.mutationOptions?.onMutate;
      const userContext = typeof userOnMutate === 'function' ? await userOnMutate(params) : undefined;
      
      if (mutationMode === 'pessimistic') return { _svadmin_ctx: true, userContext };
      const resName = params.resource ?? defaultResource;
      const targetId = params.id ?? defaultId;
      
      // Cancel in-flight queries for this resource
      await queryClient.cancelQueries({ queryKey: [resName] });

      // Snapshot ALL previous queries for rollback (matches refine pattern)
      const previousQueries = queryClient.getQueriesData({ queryKey: [resName] });
      
      const pk = getResource(resName).primaryKey ?? 'id';
      const updater = params.optimisticUpdateMap ?? { list: true, many: true, detail: true };
      
      // Optimistic update: detail queries
      if (updater.detail !== false) {
        const detailFn = updater.detail;
        if (typeof detailFn === 'function') {
          queryClient.setQueryData([resName, 'one', targetId], (old: unknown) => detailFn(old, params.variables, targetId));
        } else {
          queryClient.setQueryData([resName, 'one', targetId], (old: Record<string, unknown> | undefined) => old ? { ...old, data: deepMerge((old as Record<string, unknown>).data || {}, params.variables) } : old);
        }
      }
      
      // Optimistic update: list queries
      if (updater.list !== false) {
        queryClient.setQueriesData({ queryKey: [resName, 'list'] }, (old: unknown) => {
          if (typeof updater.list === 'function') return updater.list!(old, params.variables, targetId);
          if (!old || typeof old !== 'object' || !('data' in old)) return old;
          const o = old as { data: Record<string, unknown>[] };
          return { ...o, data: o.data.map((item) => String(item[pk]) === String(targetId) ? deepMerge(item, params.variables) : item) };
        });
      }

      // Optimistic update: many queries (missing before — refine parity)
      if (updater.many !== false) {
        queryClient.setQueriesData({ queryKey: [resName, 'many'] }, (old: unknown) => {
          if (typeof updater.many === 'function') return updater.many!(old, params.variables, targetId);
          if (!old || typeof old !== 'object' || !('data' in old)) return old;
          const o = old as { data: Record<string, unknown>[] };
          return { ...o, data: o.data.map((item) => String(item[pk]) === String(targetId) ? deepMerge(item, params.variables) : item) };
        });
      }

      return { _svadmin_ctx: true, userContext, previousQueries };
    },
    onSuccess: (data, params, context) => {
      const extractedCtx = (context as MutationContext)?._svadmin_ctx ? (context as MutationContext).userContext : context;
      const resName = params.resource ?? defaultResource;
      const targetId = params.id ?? defaultId;
      fireSuccessNotification(params.successNotification, 'Updated successfully', data.data, params.variables, resName);
      audit({ action: 'update', resource: resName, recordId: String(targetId) });
      publishLiveEvent(resName, 'updated', targetId != null ? [targetId] : undefined);
      if (typeof options.mutationOptions?.onSuccess === 'function') {
        (options.mutationOptions.onSuccess as Function)(data, params, extractedCtx);
      }
    },
    // Invalidation in onSettled (refine pattern) — runs on BOTH success and error
    onSettled: (_data, _error, params) => {
      const resName = params.resource ?? defaultResource;
      const targetId = params.id ?? defaultId;
      invalidateByScopes(queryClient, resName, params.invalidates, ['list', 'many', 'detail'], targetId != null ? targetId : undefined);
    },
    onError: (error, params, context: unknown) => {
      // Rollback ALL queries from snapshot (refine pattern — more robust than individual rollbacks)
      const ctx = context as MutationContext | undefined;
      if (ctx?.previousQueries) {
        for (const [queryKey, data] of ctx.previousQueries) {
          queryClient.setQueryData(queryKey as string[], data);
        }
      }
      if (error instanceof UndoError) return;
      checkError(error);
      const extractedCtx = ctx?._svadmin_ctx ? ctx.userContext : context;
      fireErrorNotification(params.errorNotification, 'Update failed', error);
      if (typeof options.mutationOptions?.onError === 'function') {
        (options.mutationOptions.onError as Function)(error, params, extractedCtx);
      }
    },
  }));

  return { mutation, get overtime() { return overtime; } };
}

// ─── useDelete ─────────────────────────────────────────────────

export interface UseDeleteOptions {
  resource?: KnownResources;
  id?: string | number;
  mutationMode?: 'pessimistic' | 'optimistic' | 'undoable';
  undoableTimeout?: number;
  mutationOptions?: MutationCallbacks;
  overtimeOptions?: OvertimeOptions;
}

export interface UseDeleteMutateParams<TVariables> {
  resource?: KnownResources;
  id?: string | number;
  variables?: TVariables;
  successNotification?: NotificationConfig;
  errorNotification?: NotificationConfig;
  invalidates?: string[] | false;
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  onCancel?: () => void;
}

export function useDelete<TData extends BaseRecord = BaseRecord, TError = HttpError, TVariables = Record<string, unknown>>(options: UseDeleteOptions = {}) {
  const parsed = useParsed();
  const defaultResource = options.resource ?? parsed.resource ?? '';
  const defaultId = options.id ?? parsed.id;
  const adminOptions = getAdminOptions();
  const queryClient = useQueryClient();
  const mutationMode = options.mutationMode ?? adminOptions.mutationMode ?? 'pessimistic';
  const undoableTimeout = options.undoableTimeout ?? adminOptions.undoableTimeout ?? 5000;

  const overtime = createOvertimeTracker(() => mutation.isPending, options.overtimeOptions ?? adminOptions.overtime);

  const mutation = createMutation<
    { data: TData },
    TError,
    UseDeleteMutateParams<TVariables>
  >(() => ({
    ...options.mutationOptions,
    mutationFn: async (params) => {
      const resName = params.resource ?? defaultResource;
      const targetId = params.id ?? defaultId;
      if (targetId == null) throw new Error('useDelete requires an id');

      if (mutationMode === 'undoable') {
        await new Promise<void>((resolve, reject) => {
          toast.undoable('Action can be undone', undoableTimeout, () => {
            params.onCancel?.();
            reject(new UndoError());
          }, resolve);
        });
      }

      const provider = getDataProviderForResource(resName, params.dataProviderName);
      return await provider.deleteOne<TData, TVariables>({
          resource: resName,
          id: targetId,
          variables: params.variables,
          meta: params.meta,
        });
    },
    onMutate: async (params) => {
      const userOnMutate = options.mutationOptions?.onMutate;
      const userContext = typeof userOnMutate === 'function' ? await userOnMutate(params) : undefined;
      
      if (mutationMode === 'pessimistic') return { _svadmin_ctx: true, userContext };
      const resName = params.resource ?? defaultResource;
      const targetId = params.id ?? defaultId;
      
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: [resName] });

      // Snapshot ALL previous queries for rollback
      const previousQueries = queryClient.getQueriesData({ queryKey: [resName] });
      
      const pk = getResource(resName).primaryKey ?? 'id';
      
      // Optimistic scrub from detail queries
      if (targetId != null) queryClient.removeQueries({ queryKey: [resName, 'one', targetId] });

      // Optimistic remove from list queries
      queryClient.setQueriesData({ queryKey: [resName, 'list'] }, (old: unknown) => {
        if (!old || typeof old !== 'object' || !('data' in old)) return old;
        const o = old as { data: Record<string, unknown>[]; total?: number };
        const filtered = o.data.filter((item) => String(item[pk]) !== String(targetId));
        return { ...o, data: filtered, total: (o.total ?? o.data.length) - (o.data.length - filtered.length) };
      });

      // Optimistic remove from many queries (refine parity)
      queryClient.setQueriesData({ queryKey: [resName, 'many'] }, (old: unknown) => {
        if (!old || typeof old !== 'object' || !('data' in old)) return old;
        const o = old as { data: Record<string, unknown>[] };
        return { ...o, data: o.data.filter((item) => String(item[pk]) !== String(targetId)) };
      });

      return { _svadmin_ctx: true, userContext, previousQueries };
    },
    onSuccess: (data, params, context) => {
      const extractedCtx = (context as MutationContext)?._svadmin_ctx ? (context as MutationContext).userContext : context;
      const resName = params.resource ?? defaultResource;
      const targetId = params.id ?? defaultId;

      // Remove detail cache entry (refine pattern — no stale show page)
      if (targetId != null) {
        queryClient.removeQueries({ queryKey: [resName, 'one', targetId] });
      }

      fireSuccessNotification(params.successNotification, 'Deleted successfully', data.data, params.variables, resName);
      audit({ action: 'delete', resource: resName, recordId: String(targetId) });
      publishLiveEvent(resName, 'deleted', targetId != null ? [targetId] : undefined);
      if (typeof options.mutationOptions?.onSuccess === 'function') {
        (options.mutationOptions.onSuccess as Function)(data, params, extractedCtx);
      }
    },
    // Invalidation in onSettled (refine pattern)
    onSettled: (_data, _error, params) => {
      const resName = params.resource ?? defaultResource;
      invalidateByScopes(queryClient, resName, params.invalidates, ['list', 'many']);
    },
    onError: (error, params, context: unknown) => {
      // Rollback ALL queries from snapshot
      const ctx = context as MutationContext | undefined;
      if (ctx?.previousQueries) {
        for (const [queryKey, data] of ctx.previousQueries) {
          queryClient.setQueryData(queryKey as string[], data);
        }
      }
      if (error instanceof UndoError) return;
      checkError(error);
      const extractedCtx = ctx?._svadmin_ctx ? ctx.userContext : context;
      fireErrorNotification(params.errorNotification, 'Delete failed', error);
      if (typeof options.mutationOptions?.onError === 'function') {
        (options.mutationOptions.onError as Function)(error, params, extractedCtx);
      }
    },
  }));

  return { mutation, get overtime() { return overtime; } };
}
