import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { getAdminOptions } from './options.svelte';
import { getDataProviderForResource, getResource } from './context.svelte';
import { useParsed } from './useParsed.svelte';
import { audit } from './audit';
import { UndoError } from './types';
import type { BaseRecord, HttpError, CreateParams, UpdateParams, DeleteParams, KnownResources } from './types';
import { createOvertimeTracker, fireSuccessNotification, fireErrorNotification } from './hook-utils.svelte';
import type { NotificationConfig, OvertimeOptions } from './hook-utils.svelte';
import { toast } from './toast.svelte';

// ─── useCreate ─────────────────────────────────────────────────

export interface UseCreateOptions {
  resource?: KnownResources;
  mutationOptions?: Record<string, unknown>;
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

  let isMutating = $state(false);
  const overtime = createOvertimeTracker(() => isMutating, options.overtimeOptions ?? adminOptions.overtime);

  const mutation = createMutation<
    { data: TData },
    TError,
    UseCreateMutateParams<TVariables>
  >(() => ({
    ...options.mutationOptions,
    mutationFn: async (params) => {
      isMutating = true;
      const resName = params.resource ?? defaultResource;
      const provider = getDataProviderForResource(resName, params.dataProviderName);
      try {
        return await provider.create<TData, TVariables>({
          resource: resName,
          variables: params.variables,
          meta: params.meta,
        });
      } finally {
        isMutating = false;
      }
    },
    onMutate: (options.mutationOptions as any)?.onMutate,
    onSuccess: (data, params, context) => {
      const resName = params.resource ?? defaultResource;
      if (params.invalidates !== false) {
        queryClient.invalidateQueries({ queryKey: [resName] });
      }
      fireSuccessNotification(params.successNotification, 'Created successfully', data.data, params.variables, resName);
      const res = getResource(resName);
      const pk = res.primaryKey ?? 'id';
      audit({ action: 'create', resource: resName, recordId: String((data.data as Record<string, unknown>)[pk]) });
      if (typeof options.mutationOptions?.onSuccess === 'function') {
        (options.mutationOptions.onSuccess as Function)(data, params, context);
      }
    },
    onError: (error, params, context) => {
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
  mutationOptions?: Record<string, unknown>;
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
    detail?: (previous: unknown, variables: TVariables, id?: string | number) => unknown;
    list?: (previous: unknown, variables: TVariables, id?: string | number) => unknown;
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

  let isMutating = $state(false);
  const overtime = createOvertimeTracker(() => isMutating, options.overtimeOptions ?? adminOptions.overtime);

  const mutation = createMutation<
    { data: TData },
    TError,
    UseUpdateMutateParams<TVariables>
  >(() => ({
    ...options.mutationOptions,
    mutationFn: async (params) => {
      isMutating = true;
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
      try {
        return await provider.update<TData, TVariables>({
          resource: resName,
          id: targetId,
          variables: params.variables,
          meta: params.meta,
        });
      } finally {
        isMutating = false;
      }
    },
    onMutate: async (params) => {
      const userOnMutate = (options.mutationOptions as any)?.onMutate;
      const userContext = typeof userOnMutate === 'function' ? await userOnMutate(params) : undefined;
      
      if (mutationMode === 'pessimistic') return { _svadmin_ctx: true, userContext };
      const resName = params.resource ?? defaultResource;
      const targetId = params.id ?? defaultId;
      
      await queryClient.cancelQueries({ queryKey: [resName] });
      const previousDetail = queryClient.getQueryData([resName, 'one', targetId]);
      const previousList = queryClient.getQueriesData({ queryKey: [resName, 'list'] });
      
      const pk = getResource(resName).primaryKey ?? 'id';
      const updater = params.optimisticUpdateMap;
      
      if (updater?.detail) {
        queryClient.setQueryData([resName, 'one', targetId], (old: unknown) => updater.detail!(old, params.variables, targetId));
      } else {
        queryClient.setQueryData([resName, 'one', targetId], (old: Record<string, unknown> | undefined) => old ? { ...old, ...params.variables } : old);
      }
      
      if (updater?.list) {
        queryClient.setQueriesData({ queryKey: [resName, 'list'] }, (old: unknown) => updater.list!(old, params.variables, targetId));
      } else {
        queryClient.setQueriesData({ queryKey: [resName, 'list'] }, (old: unknown) => {
          if (!old || typeof old !== 'object' || !('data' in old)) return old;
          const o = old as { data: Record<string, unknown>[] };
          return { ...o, data: o.data.map((item) => String(item[pk]) === String(targetId) ? { ...item, ...params.variables } : item) };
        });
      }

      return { _svadmin_ctx: true, userContext, previousDetail, previousList };
    },
    onSuccess: (data, params, context) => {
      const extractedCtx = (context as any)?._svadmin_ctx ? (context as any).userContext : context;
      const resName = params.resource ?? defaultResource;
      const targetId = params.id ?? defaultId;
      if (params.invalidates !== false) {
        queryClient.invalidateQueries({ queryKey: [resName] });
      }
      fireSuccessNotification(params.successNotification, 'Updated successfully', data.data, params.variables, resName);
      audit({ action: 'update', resource: resName, recordId: String(targetId) });
      if (typeof options.mutationOptions?.onSuccess === 'function') {
        (options.mutationOptions.onSuccess as Function)(data, params, extractedCtx);
      }
    },
    onError: (error, params, context: unknown) => {
      const extractedCtx = (context as any)?._svadmin_ctx ? (context as any).userContext : context;
      const resName = params.resource ?? defaultResource;
      const targetId = params.id ?? defaultId;
      const ctx = context as { previousDetail?: unknown; previousList?: [unknown, unknown][] } | undefined;
      if (ctx?.previousDetail) queryClient.setQueryData([resName, 'one', targetId], ctx.previousDetail);
      if (ctx?.previousList) {
        ctx.previousList.forEach(([qk, data]) => queryClient.setQueryData(qk as string[], data));
      }
      if (error instanceof UndoError) return;
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
  mutationOptions?: Record<string, unknown>;
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

  let isMutating = $state(false);
  const overtime = createOvertimeTracker(() => isMutating, options.overtimeOptions ?? adminOptions.overtime);

  const mutation = createMutation<
    { data: TData },
    TError,
    UseDeleteMutateParams<TVariables>
  >(() => ({
    ...options.mutationOptions,
    mutationFn: async (params) => {
      isMutating = true;
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
      try {
        return await provider.deleteOne<TData, TVariables>({
          resource: resName,
          id: targetId,
          variables: params.variables,
          meta: params.meta,
        });
      } finally {
        isMutating = false;
      }
    },
    onMutate: async (params) => {
      const userOnMutate = (options.mutationOptions as any)?.onMutate;
      const userContext = typeof userOnMutate === 'function' ? await userOnMutate(params) : undefined;
      
      if (mutationMode === 'pessimistic') return { _svadmin_ctx: true, userContext };
      const resName = params.resource ?? defaultResource;
      const targetId = params.id ?? defaultId;
      
      await queryClient.cancelQueries({ queryKey: [resName] });
      const previousList = queryClient.getQueriesData({ queryKey: [resName, 'list'] });
      
      const pk = getResource(resName).primaryKey ?? 'id';
      
      queryClient.setQueriesData({ queryKey: [resName, 'list'] }, (old: unknown) => {
        if (!old || typeof old !== 'object' || !('data' in old)) return old;
        const o = old as { data: Record<string, unknown>[] };
        return { ...o, data: o.data.filter((item) => String(item[pk]) !== String(targetId)) };
      });

      return { _svadmin_ctx: true, userContext, previousList };
    },
    onSuccess: (data, params, context) => {
      const extractedCtx = (context as any)?._svadmin_ctx ? (context as any).userContext : context;
      const resName = params.resource ?? defaultResource;
      const targetId = params.id ?? defaultId;
      if (params.invalidates !== false) {
        queryClient.invalidateQueries({ queryKey: [resName] });
      }
      fireSuccessNotification(params.successNotification, 'Deleted successfully', data.data, params.variables, resName);
      audit({ action: 'delete', resource: resName, recordId: String(targetId) });
      if (typeof options.mutationOptions?.onSuccess === 'function') {
        (options.mutationOptions.onSuccess as Function)(data, params, extractedCtx);
      }
    },
    onError: (error, params, context: unknown) => {
      const extractedCtx = (context as any)?._svadmin_ctx ? (context as any).userContext : context;
      const ctx = context as { previousList?: [unknown, unknown][] } | undefined;
      if (ctx?.previousList) {
        ctx.previousList.forEach(([qk, data]) => queryClient.setQueryData(qk as string[], data));
      }
      if (error instanceof UndoError) return;
      fireErrorNotification(params.errorNotification, 'Delete failed', error);
      if (typeof options.mutationOptions?.onError === 'function') {
        (options.mutationOptions.onError as Function)(error, params, extractedCtx);
      }
    },
  }));

  return { mutation, get overtime() { return overtime; } };
}
