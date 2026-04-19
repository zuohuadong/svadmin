<script lang="ts">
  import { getTaskProvider } from '@svadmin/core';
  import { useQueryClient } from '@tanstack/svelte-query';
  import { t } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import { Loader2, Ban } from '@lucide/svelte';

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

  async function handleCancel() {
    if (!taskProvider?.cancel || pending) return;
    pending = true;
    try {
      await taskProvider.cancel(taskId);
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

<Button {variant} {size} onclick={handleCancel} disabled={disabled || pending || !taskProvider?.cancel}>
  {#if pending}
    <Loader2 class="mr-1.5 h-3.5 w-3.5 animate-spin" />
  {:else}
    <Ban class="mr-1.5 h-3.5 w-3.5" />
  {/if}
  {#if children}
    {@render children()}
  {:else}
    {t('common.cancel')}
  {/if}
</Button>
