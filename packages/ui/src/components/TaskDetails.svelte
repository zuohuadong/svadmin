<script lang="ts">
  import { useTask, getTaskProvider } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import type { TaskProvider, TaskRecord } from '@svadmin/core';
  import { Loader2 } from '@lucide/svelte';
  import * as Card from './ui/card/index.js';
  import { Badge } from './ui/badge/index.js';
  import TaskStatusBadge from './TaskStatusBadge.svelte';
  import TaskProgressBar from './TaskProgressBar.svelte';
  import RetryTaskButton from './RetryTaskButton.svelte';
  import CancelTaskButton from './CancelTaskButton.svelte';
  import {
    canCancelTask,
    canRetryTask,
    resolveTaskCreatedAt,
    resolveTaskError,
    resolveTaskMessage,
    resolveTaskProgress,
    resolveTaskResult,
    resolveTaskTitle,
    resolveTaskUpdatedAt,
  } from './task-utils.js';

  let {
    task,
    taskId,
    taskProvider = getTaskProvider({ optional: true }) as TaskProvider<TaskRecord> | undefined,
    title,
    useProviderData = !task && !!taskId,
    queryOptions,
  } = $props<{
    task?: TaskRecord;
    taskId?: string;
    taskProvider?: TaskProvider<TaskRecord>;
    title?: string;
    useProviderData?: boolean;
    queryOptions?: {
      enabled?: boolean;
      staleTime?: number;
      gcTime?: number;
      refetchOnWindowFocus?: boolean;
      refetchInterval?: number | false;
      refetchIntervalInBackground?: boolean;
    };
  }>();

  const query = useTask({
    get taskId() {
      return taskId;
    },
    get taskProvider() {
      return taskProvider;
    },
    get queryOptions() {
      return { enabled: useProviderData && !!taskId && !!taskProvider, ...queryOptions };
    },
  });

  const resolvedTask = $derived(task ?? query.data);
  const resolvedTitle = $derived(title ?? t('task.detailsTitle'));

  function formatDate(value: unknown) {
    if (!value) return '—';
    const date = new Date(value as string | Date);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
  }

  function toPrettyJson(value: unknown) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
</script>

<Card.Root class="border-border/40 shadow-sm">
  <Card.Header class="pb-3">
    <Card.Title class="text-base">{resolvedTitle}</Card.Title>
    <Card.Description>
      {#if resolvedTask}
        {resolveTaskTitle(resolvedTask)}
      {:else}
        {t('task.detailsSummary')}
      {/if}
    </Card.Description>
  </Card.Header>
  <Card.Content class="space-y-5 pt-0">
    {#if useProviderData && taskProvider && query.isLoading}
      <div class="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {t('task.loadingDetail')}
      </div>
    {:else if resolvedTask}
      <div class="flex flex-wrap items-center gap-2">
        <TaskStatusBadge status={String(resolvedTask.status ?? 'pending')} />
        <Badge variant="outline" class="font-mono text-xs">{resolvedTask.id}</Badge>
      </div>

      {#if typeof resolveTaskProgress(resolvedTask) === 'number'}
        <TaskProgressBar value={resolveTaskProgress(resolvedTask)} />
      {/if}

      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-muted-foreground">{t('task.createdLabel')}</div>
          <div class="text-sm">{formatDate(resolveTaskCreatedAt(resolvedTask))}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-muted-foreground">{t('task.updatedLabel')}</div>
          <div class="text-sm">{formatDate(resolveTaskUpdatedAt(resolvedTask))}</div>
        </div>
      </div>

      {#if resolveTaskMessage(resolvedTask)}
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-muted-foreground">{t('task.messageLabel')}</div>
          <div class="rounded-md border border-border/60 bg-muted/30 p-3 text-sm">{resolveTaskMessage(resolvedTask)}</div>
        </div>
      {/if}

      {#if resolveTaskError(resolvedTask)}
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-destructive">{t('task.errorLabel')}</div>
          <pre class="overflow-auto rounded-md border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">{toPrettyJson(resolveTaskError(resolvedTask))}</pre>
        </div>
      {/if}

      {#if resolveTaskResult(resolvedTask) !== undefined}
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-muted-foreground">{t('task.resultLabel')}</div>
          <pre class="overflow-auto rounded-md border border-border/60 bg-muted/20 p-3 text-xs">{toPrettyJson(resolveTaskResult(resolvedTask))}</pre>
        </div>
      {/if}

      <div class="space-y-1">
        <div class="text-xs uppercase tracking-wide text-muted-foreground">{t('task.payloadLabel')}</div>
        <pre class="overflow-auto rounded-md border border-border/60 bg-muted/20 p-3 text-xs">{toPrettyJson(resolvedTask.payload ?? resolvedTask)}</pre>
      </div>

      {#if taskProvider?.retry || taskProvider?.cancel}
        <div class="flex flex-wrap gap-2 pt-2">
          {#if taskProvider?.retry && canRetryTask(resolvedTask)}
            <RetryTaskButton taskId={resolvedTask.id} {taskProvider} />
          {/if}
          {#if taskProvider?.cancel && canCancelTask(resolvedTask)}
            <CancelTaskButton taskId={resolvedTask.id} {taskProvider} />
          {/if}
        </div>
      {/if}
    {:else}
      <div class="flex h-32 items-center justify-center text-sm text-muted-foreground">
        {t('task.noSelection')}
      </div>
    {/if}
  </Card.Content>
</Card.Root>
