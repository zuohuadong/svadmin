<script lang="ts">
  import { useTaskList, getTaskProvider } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import type { TaskProvider, TaskRecord } from '@svadmin/core';
  import { Loader2 } from '@lucide/svelte';
  import * as Card from './ui/card/index.js';
  import * as Table from './ui/table/index.js';
  import { Button } from './ui/button/index.js';
  import TaskStatusBadge from './TaskStatusBadge.svelte';
  import TaskProgressBar from './TaskProgressBar.svelte';
  import RetryTaskButton from './RetryTaskButton.svelte';
  import CancelTaskButton from './CancelTaskButton.svelte';

  let {
    tasks,
    taskProvider = getTaskProvider({ optional: true }) as TaskProvider<TaskRecord> | undefined,
    params,
    dlq = false,
    title,
    emptyText,
    showActions = true,
    showProgress = true,
    useProviderData = !tasks,
    queryOptions,
    onSelect,
  } = $props<{
    tasks?: TaskRecord[];
    taskProvider?: TaskProvider<TaskRecord>;
    params?: Record<string, unknown>;
    dlq?: boolean;
    title?: string;
    emptyText?: string;
    showActions?: boolean;
    showProgress?: boolean;
    useProviderData?: boolean;
    queryOptions?: {
      enabled?: boolean;
      staleTime?: number;
      gcTime?: number;
      refetchOnWindowFocus?: boolean;
      refetchInterval?: number | false;
      refetchIntervalInBackground?: boolean;
    };
    onSelect?: (task: TaskRecord) => void;
  }>();

  const query = useTaskList({
    get params() {
      return params;
    },
    get dlq() {
      return dlq;
    },
    get taskProvider() {
      return taskProvider;
    },
    get queryOptions() {
      return { enabled: useProviderData && !!taskProvider, ...queryOptions };
    },
  });

  const resolvedTasks = $derived(tasks ?? query.data?.data ?? []);
  const resolvedTitle = $derived(title ?? (dlq ? t('task.dlqTitle') : t('task.listTitle')));
  const resolvedEmptyText = $derived(emptyText ?? (dlq ? t('task.noDlq') : t('task.noTasks')));

  function formatDate(value: unknown) {
    if (!value) return '—';
    return new Date(value as string | Date).toLocaleString();
  }
</script>

<Card.Root class="border-border/40 shadow-sm">
  <Card.Header class="pb-3">
    <Card.Title class="text-base">{resolvedTitle}</Card.Title>
      <Card.Description>
      {#if useProviderData && taskProvider}
        {t('task.count', { count: (query.data?.total ?? resolvedTasks.length) || 0 })}
      {:else}
        {t('task.count', { count: resolvedTasks.length })}
      {/if}
    </Card.Description>
  </Card.Header>
  <Card.Content class="pt-0">
    {#if useProviderData && taskProvider && query.isLoading}
      <div class="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {t('task.loadingList')}
      </div>
    {:else}
      <div class="overflow-auto">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>{t('task.taskColumn')}</Table.Head>
              <Table.Head>{t('task.statusColumn')}</Table.Head>
              <Table.Head>{t('task.updatedColumn')}</Table.Head>
              {#if showActions}
                <Table.Head class="text-right">{t('task.actionsColumn')}</Table.Head>
              {/if}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each resolvedTasks as task}
              <Table.Row class="cursor-pointer hover:bg-muted/40" onclick={() => onSelect?.(task)}>
                <Table.Cell class="min-w-[240px]">
                  <div class="space-y-1">
                    <div class="font-medium text-foreground">{String(task.title ?? task.name ?? task.id)}</div>
                    {#if task.message}
                      <div class="text-xs text-muted-foreground">{String(task.message)}</div>
                    {/if}
                    {#if showProgress && typeof task.progress === 'number' && String(task.status).toLowerCase() === 'running'}
                      <TaskProgressBar value={Number(task.progress)} />
                    {/if}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <TaskStatusBadge status={String(task.status ?? 'pending')} />
                </Table.Cell>
                <Table.Cell class="text-xs text-muted-foreground">
                  {formatDate(task.updatedAt ?? task.createdAt)}
                </Table.Cell>
                {#if showActions}
                  <Table.Cell class="text-right">
                    <div class="flex justify-end gap-2">
                      {#if taskProvider?.retry && ['failed', 'error'].includes(String(task.status).toLowerCase())}
                        <RetryTaskButton taskId={task.id} {taskProvider} />
                      {/if}
                      {#if taskProvider?.cancel && ['pending', 'queued', 'running', 'processing'].includes(String(task.status).toLowerCase())}
                        <CancelTaskButton taskId={task.id} {taskProvider} />
                      {/if}
                      <Button variant="ghost" size="sm" onclick={(e) => { e.stopPropagation(); onSelect?.(task); }}>
                        {t('task.detailsAction')}
                      </Button>
                    </div>
                  </Table.Cell>
                {/if}
              </Table.Row>
            {:else}
              <Table.Row>
                <Table.Cell colspan={showActions ? 4 : 3} class="h-24 text-center text-muted-foreground">
                  {resolvedEmptyText}
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
