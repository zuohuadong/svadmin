<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Loader2, CheckCircle2, XCircle, Clock, Download, X, ListTodo } from 'lucide-svelte';
  import { Button } from './ui/button/index.js';
  import { Badge } from './ui/badge/index.js';
  import type { BackgroundTask, TaskStatus } from '../types.js';

  let {
    open = $bindable(false),
    tasks = $bindable<BackgroundTask[]>([]),
    onDismiss,
    onRetry,
    onDownload,
  }: {
    open?: boolean;
    tasks?: BackgroundTask[];
    onDismiss?: (taskId: string) => void;
    onRetry?: (taskId: string) => void;
    onDownload?: (taskId: string, url: string) => void;
  } = $props();

  let runningCount = $derived(tasks.filter(t => t.status === 'running' || t.status === 'pending').length);

  const statusIcon: Record<TaskStatus, typeof Loader2> = {
    pending: Clock,
    running: Loader2,
    completed: CheckCircle2,
    failed: XCircle,
  };

  const statusColor: Record<TaskStatus, string> = {
    pending: 'text-muted-foreground',
    running: 'text-primary',
    completed: 'text-green-500',
    failed: 'text-destructive',
  };

  function formatTime(d: string | Date) {
    return new Date(d).toLocaleTimeString();
  }

  function dismissTask(id: string) {
    tasks = tasks.filter(t => t.id !== id);
    onDismiss?.(id);
  }
</script>

<!-- Trigger Button (to be placed in Header) -->
<Button
  variant="ghost"
  size="icon"
  class="relative"
  onclick={() => open = !open}
>
  <ListTodo class="h-4 w-4" />
  {#if runningCount > 0}
    <span class="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
      {runningCount}
    </span>
  {/if}
</Button>

<!-- Task Queue Drawer -->
{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="fixed inset-0 z-[90] flex justify-end" onclick={() => open = false}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="bg-card shadow-2xl w-full max-w-sm h-full flex flex-col border-l border-border animate-in slide-in-from-right duration-200"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="p-4 border-b border-border flex items-center justify-between bg-muted/30">
        <div class="flex items-center gap-2">
          <ListTodo class="h-5 w-5 text-muted-foreground" />
          <h2 class="text-sm font-semibold">Background Tasks</h2>
          {#if runningCount > 0}
            <Badge variant="secondary" class="text-xs">{runningCount} active</Badge>
          {/if}
        </div>
        <Button variant="ghost" size="icon" class="h-7 w-7" onclick={() => open = false}>
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Task List -->
      <div class="flex-1 overflow-y-auto">
        {#each tasks as task}
          {@const Icon = statusIcon[task.status]}
          <div class="p-4 border-b border-border hover:bg-muted/30 transition-colors">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-3 flex-1 min-w-0">
                <div class="{statusColor[task.status]} mt-0.5 shrink-0">
                  <Icon class="h-4 w-4 {task.status === 'running' ? 'animate-spin' : ''}" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate text-foreground">{task.title}</p>
                  {#if task.message}
                    <p class="text-xs text-muted-foreground mt-0.5">{task.message}</p>
                  {/if}
                  <p class="text-[10px] text-muted-foreground/60 mt-1 font-mono">{formatTime(task.createdAt)}</p>
                </div>
              </div>
              <button
                class="text-muted-foreground/40 hover:text-muted-foreground transition shrink-0"
                onclick={() => dismissTask(task.id)}
              >
                <X class="h-3.5 w-3.5" />
              </button>
            </div>

            <!-- Progress bar -->
            {#if task.status === 'running' && task.progress != null}
              <div class="mt-3 ml-7">
                <div class="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style="width: {task.progress}%"
                  ></div>
                </div>
                <p class="text-[10px] text-muted-foreground mt-1">{task.progress}%</p>
              </div>
            {/if}

            <!-- Actions -->
            {#if task.status === 'completed' && task.downloadUrl}
              <div class="mt-2 ml-7">
                <Button
                  variant="outline" size="sm" class="h-7 text-xs"
                  onclick={() => onDownload?.(task.id, task.downloadUrl!)}
                >
                  <Download class="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            {:else if task.status === 'failed' && onRetry}
              <div class="mt-2 ml-7">
                <Button
                  variant="outline" size="sm" class="h-7 text-xs text-destructive"
                  onclick={() => onRetry?.(task.id)}
                >
                  Retry
                </Button>
              </div>
            {/if}
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <ListTodo class="h-8 w-8 mb-2 opacity-30" />
            <p class="text-sm">No background tasks</p>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
