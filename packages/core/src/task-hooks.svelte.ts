import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
import { getAdminOptions } from './options.svelte';
import { getTaskProvider } from './context.svelte';
import { checkError, createOvertimeTracker, fireErrorNotification, fireSuccessNotification } from './hook-utils.svelte';
import type { NotificationConfig, OvertimeOptions } from './hook-utils.svelte';
import { t } from './i18n.svelte';
import type {
  HttpError,
  SubmitTaskOptions,
  TaskHandle,
  TaskListResult,
  TaskProvider,
  TaskRecord,
} from './types';

function normalizeTaskProvider<TTask extends TaskRecord = TaskRecord>(
  provider?: TaskProvider<TTask>,
): TaskProvider<TTask> {
  return (provider ?? getTaskProvider({ optional: true }) ?? getTaskProvider()) as TaskProvider<TTask>;
}

export interface UseSubmitTaskOptions {
  mutationOptions?: {
    onSuccess?: (data: unknown, variables: unknown, context: unknown) => void;
    onError?: (error: unknown, variables: unknown, context: unknown) => void;
  };
  overtimeOptions?: OvertimeOptions;
}

export interface UseSubmitTaskMutateParams<TTask extends TaskRecord = TaskRecord> {
  taskName: string;
  options?: SubmitTaskOptions;
  taskProvider?: TaskProvider<TTask>;
  successNotification?: NotificationConfig;
  errorNotification?: NotificationConfig;
}

export function useSubmitTask<
  TTask extends TaskRecord = TaskRecord,
  TError = HttpError,
>(options: UseSubmitTaskOptions = {}) {
  const adminOptions = getAdminOptions();
  const queryClient = useQueryClient();
  const overtime = createOvertimeTracker(() => mutation.isPending, options.overtimeOptions ?? adminOptions.overtime);

  const mutation = createMutation<TaskHandle<TTask>, TError, UseSubmitTaskMutateParams<TTask>>(() => ({
    mutationFn: async (params) => {
      const provider = normalizeTaskProvider<TTask>(params.taskProvider);
      return provider.submit(params.taskName, params.options);
    },
    onSuccess: (data, params, context) => {
      fireSuccessNotification(
        params.successNotification,
        t('task.submitSuccess'),
        data,
        params.options,
        params.taskName,
      );
      void queryClient.invalidateQueries({ queryKey: ['taskList'] });
      options.mutationOptions?.onSuccess?.(data, params, context);
    },
    onError: (error, params, context) => {
      checkError(error);
      fireErrorNotification(
        params.errorNotification,
        t('task.submitFailed'),
        error,
        params.taskName,
      );
      options.mutationOptions?.onError?.(error, params, context);
    },
  }));

  return { mutation, get overtime() { return overtime; } };
}

export interface UseTaskOptions<TTask extends TaskRecord = TaskRecord, TError = HttpError> {
  taskId?: string;
  taskProvider?: TaskProvider<TTask>;
  queryOptions?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchInterval?: number | false;
    refetchIntervalInBackground?: boolean;
  };
  successNotification?: NotificationConfig;
  errorNotification?: NotificationConfig;
  overtimeOptions?: OvertimeOptions;
}

export function useTask<TTask extends TaskRecord = TaskRecord, TError = HttpError>(
  options: UseTaskOptions<TTask, TError> = {},
) {
  const adminOptions = getAdminOptions();

  const query = createQuery<TTask, TError>(() => {
    const provider = normalizeTaskProvider<TTask>(options.taskProvider);
    const queryOptions = options.queryOptions;
    return {
      queryKey: ['task', options.taskId],
      queryFn: async () => {
        if (!options.taskId) throw new Error('useTask requires a taskId');
        return provider.get(options.taskId);
      },
      enabled: (queryOptions?.enabled ?? true) && !!options.taskId,
      staleTime: queryOptions?.staleTime ?? adminOptions.reactQuery?.staleTime,
      gcTime: queryOptions?.gcTime ?? adminOptions.reactQuery?.gcTime,
      refetchOnWindowFocus: queryOptions?.refetchOnWindowFocus ?? adminOptions.reactQuery?.refetchOnWindowFocus,
      refetchInterval: queryOptions?.refetchInterval,
      refetchIntervalInBackground: queryOptions?.refetchIntervalInBackground,
    };
  });

  const overtime = createOvertimeTracker(() => query.isLoading, options.overtimeOptions ?? adminOptions.overtime);

  let lastSuccessAt = 0;
  let lastErrorAt = 0;
  $effect(() => {
    if (query.isSuccess && query.dataUpdatedAt > lastSuccessAt) {
      lastSuccessAt = query.dataUpdatedAt;
      if (options.successNotification) {
        fireSuccessNotification(options.successNotification, '', query.data, undefined, options.taskId);
      }
    } else if (query.isError && query.errorUpdatedAt > lastErrorAt) {
      lastErrorAt = query.errorUpdatedAt;
      checkError(query.error);
      fireErrorNotification(options.errorNotification, t('task.fetchFailed'), query.error, options.taskId);
    }
  });

  return new Proxy(query, {
    get(target, prop) {
      if (prop === 'overtime') return overtime;
      return target[prop as keyof typeof target];
    },
  }) as typeof query & { overtime: typeof overtime };
}

export interface UseTaskListOptions<TTask extends TaskRecord = TaskRecord, TError = HttpError> {
  params?: Record<string, unknown>;
  dlq?: boolean;
  taskProvider?: TaskProvider<TTask>;
  queryOptions?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchInterval?: number | false;
    refetchIntervalInBackground?: boolean;
  };
  successNotification?: NotificationConfig;
  errorNotification?: NotificationConfig;
  overtimeOptions?: OvertimeOptions;
}

export function useTaskList<TTask extends TaskRecord = TaskRecord, TError = HttpError>(
  options: UseTaskListOptions<TTask, TError> = {},
) {
  const adminOptions = getAdminOptions();

  const query = createQuery<TaskListResult<TTask>, TError>(() => {
    const provider = normalizeTaskProvider<TTask>(options.taskProvider);
    const queryOptions = options.queryOptions;
    return {
      queryKey: ['taskList', options.dlq ? 'dlq' : 'default', options.params],
      queryFn: async () => {
        if (options.dlq) {
          if (!provider.listDlq) throw new Error('TaskProvider does not implement listDlq');
          return provider.listDlq(options.params);
        }
        if (!provider.list) throw new Error('TaskProvider does not implement list');
        return provider.list(options.params);
      },
      enabled: queryOptions?.enabled ?? true,
      staleTime: queryOptions?.staleTime ?? adminOptions.reactQuery?.staleTime,
      gcTime: queryOptions?.gcTime ?? adminOptions.reactQuery?.gcTime,
      refetchOnWindowFocus: queryOptions?.refetchOnWindowFocus ?? adminOptions.reactQuery?.refetchOnWindowFocus,
      refetchInterval: queryOptions?.refetchInterval,
      refetchIntervalInBackground: queryOptions?.refetchIntervalInBackground,
    };
  });

  const overtime = createOvertimeTracker(() => query.isLoading, options.overtimeOptions ?? adminOptions.overtime);

  let lastSuccessAt = 0;
  let lastErrorAt = 0;
  $effect(() => {
    if (query.isSuccess && query.dataUpdatedAt > lastSuccessAt) {
      lastSuccessAt = query.dataUpdatedAt;
      if (options.successNotification) {
        fireSuccessNotification(options.successNotification, '', query.data, options.params, options.dlq ? 'taskDlq' : 'tasks');
      }
    } else if (query.isError && query.errorUpdatedAt > lastErrorAt) {
      lastErrorAt = query.errorUpdatedAt;
      checkError(query.error);
      fireErrorNotification(options.errorNotification, t('task.fetchListFailed'), query.error, options.dlq ? 'taskDlq' : 'tasks');
    }
  });

  return new Proxy(query, {
    get(target, prop) {
      if (prop === 'overtime') return overtime;
      return target[prop as keyof typeof target];
    },
  }) as typeof query & { overtime: typeof overtime };
}

export interface UseTaskSubscriptionOptions<TTask extends TaskRecord = TaskRecord> {
  taskId: string;
  taskProvider?: TaskProvider<TTask>;
  enabled?: boolean;
  onTask: (task: TTask) => void;
}

export function useTaskSubscription<TTask extends TaskRecord = TaskRecord>(
  options: UseTaskSubscriptionOptions<TTask>,
): void {
  $effect(() => {
    const enabled = options.enabled ?? true;
    if (!enabled) return;

    const provider = normalizeTaskProvider<TTask>(options.taskProvider);
    if (!provider.subscribe) {
      throw new Error('TaskProvider does not implement subscribe');
    }

    const subscription = provider.subscribe(options.taskId, options.onTask);
    if (!subscription) return;

    if (typeof subscription === 'function') {
      return subscription;
    }

    if (typeof subscription.unsubscribe === 'function') {
      return () => subscription.unsubscribe();
    }
  });
}
