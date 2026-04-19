import type {
  LiveEvent,
  LiveProvider,
  SubmitTaskOptions,
  TaskHandle,
  TaskListResult,
  TaskProvider,
  TaskRecord,
  TaskSubscription,
} from '@svadmin/core';

export interface SupaCloudTaskRecord extends TaskRecord {
  [key: string]: unknown;
}

export interface SupaCloudTaskClient<TTask extends SupaCloudTaskRecord = SupaCloudTaskRecord> {
  submit(taskName: string, options?: SubmitTaskOptions): Promise<TaskHandle<TTask>>;
  get(taskId: string): Promise<TTask>;
  list?(params?: Record<string, unknown>): Promise<TTask[] | { data?: TTask[] }>;
  listDlq?(params?: Record<string, unknown>): Promise<TTask[] | { data?: TTask[] }>;
  cancel?(taskId: string): Promise<unknown>;
  retry?(taskId: string): Promise<unknown>;
  subscribe?(
    taskId: string,
    callback: (task: TTask) => void
  ): TaskSubscription | (() => void) | void;
}

export interface CreateSupaCloudTaskProviderOptions<
  TTask extends SupaCloudTaskRecord = SupaCloudTaskRecord,
> {
  supacloud: SupaCloudTaskClient<TTask>;
}

export interface CreateSupaCloudTaskLiveProviderOptions<
  TTask extends SupaCloudTaskRecord = SupaCloudTaskRecord,
> {
  supacloud: Pick<SupaCloudTaskClient<TTask>, 'subscribe'>;
  resource?: string;
  mapTaskToEvent?: (task: TTask, resource: string) => LiveEvent;
}

function normalizeTaskSubscription(
  subscription: TaskSubscription | (() => void) | void,
): (() => void) | undefined {
  if (!subscription) return undefined;
  if (typeof subscription === 'function') return subscription;
  if (typeof subscription.unsubscribe === 'function') {
    return () => subscription.unsubscribe();
  }
  return undefined;
}

function normalizeTaskList<TTask extends SupaCloudTaskRecord>(
  value: TTask[] | { data?: TTask[] },
): TaskListResult<TTask> {
  const data = Array.isArray(value) ? value : (value.data ?? []);
  return {
    data,
    total: data.length,
  };
}

function defaultMapTaskToEvent<TTask extends SupaCloudTaskRecord>(
  task: TTask,
  resource: string,
): LiveEvent {
  return {
    type: 'UPDATE',
    resource,
    payload: task as Record<string, unknown>,
  };
}

export function createSupaCloudTaskProvider<
  TTask extends SupaCloudTaskRecord = SupaCloudTaskRecord,
>(options: CreateSupaCloudTaskProviderOptions<TTask>): TaskProvider<TTask> {
  const { supacloud } = options;

  return {
    submit(taskName, submitOptions) {
      return supacloud.submit(taskName, submitOptions);
    },
    get(taskId) {
      return supacloud.get(taskId);
    },
    async list(params) {
      if (!supacloud.list) {
        throw new Error('[svadmin/supabase] SupaCloud client does not implement tasks.list');
      }
      return normalizeTaskList(await supacloud.list(params));
    },
    async listDlq(params) {
      if (!supacloud.listDlq) {
        throw new Error('[svadmin/supabase] SupaCloud client does not implement tasks.listDlq');
      }
      return normalizeTaskList(await supacloud.listDlq(params));
    },
    cancel(taskId) {
      if (!supacloud.cancel) {
        throw new Error('[svadmin/supabase] SupaCloud client does not implement tasks.cancel');
      }
      return supacloud.cancel(taskId);
    },
    retry(taskId) {
      if (!supacloud.retry) {
        throw new Error('[svadmin/supabase] SupaCloud client does not implement tasks.retry');
      }
      return supacloud.retry(taskId);
    },
    subscribe(taskId, callback) {
      if (!supacloud.subscribe) {
        throw new Error('[svadmin/supabase] SupaCloud client does not implement tasks.subscribe');
      }
      return supacloud.subscribe(taskId, callback);
    },
  };
}

export function createSupaCloudTaskLiveProvider<
  TTask extends SupaCloudTaskRecord = SupaCloudTaskRecord,
>(options: CreateSupaCloudTaskLiveProviderOptions<TTask>): LiveProvider {
  const resourceName = options.resource ?? 'tasks';
  const mapTaskToEvent = options.mapTaskToEvent ?? defaultMapTaskToEvent<TTask>;

  return {
    subscribe({ resource, liveParams, callback }) {
      if (!options.supacloud.subscribe) {
        throw new Error('[svadmin/supabase] SupaCloud client does not implement tasks.subscribe');
      }

      const taskId = typeof liveParams?.taskId === 'string' ? liveParams.taskId : undefined;
      if (!taskId) {
        throw new Error('[svadmin/supabase] createSupaCloudTaskLiveProvider requires liveParams.taskId');
      }

      const unsubscribe = options.supacloud.subscribe(taskId, (task) => {
        callback(mapTaskToEvent(task, resource || resourceName));
      });

      return normalizeTaskSubscription(unsubscribe) ?? (() => {});
    },
  };
}
