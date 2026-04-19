<script lang="ts">
  import { getTaskProvider } from '@svadmin/core';
  import { useQueryClient } from '@tanstack/svelte-query';
  import { t } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import { Loader2, RotateCcw } from '@lucide/svelte';

  let {
    taskId,
    taskProvider = getTaskProvider({ optional: true }),
    onSuccess,
    onError,
    disabled = false,
    variant = 'outline',
    size = 'sm',
    children,
  } = $props<{
    taskId: string;
    taskProvider?: import('@svadmin/core').TaskProvider;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
    disabled?: boolean;
    variant?: import('./ui/button/index.js').ButtonVariant;
    size?: import('./ui/button/index.js').ButtonSize;
    children?: import('svelte').Snippet;
  }>();

  const queryClient = useQueryClient();
  let pending = $state(false);

  async function handleRetry() {
    if (!taskProvider?.retry || pending) return;
    pending = true;
    try {
      await taskProvider.retry(taskId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['taskList'] }),
        queryClient.invalidateQueries({ queryKey: ['task', taskId] }),
      ]);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    } finally {
      pending = false;
    }
  }
</script>

<Button {variant} {size} onclick={handleRetry} disabled={disabled || pending || !taskProvider?.retry}>
  {#if pending}
    <Loader2 class="mr-1.5 h-3.5 w-3.5 animate-spin" />
  {:else}
    <RotateCcw class="mr-1.5 h-3.5 w-3.5" />
  {/if}
  {#if children}
    {@render children()}
  {:else}
    {t('common.retry')}
  {/if}
</Button>
