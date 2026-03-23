<script lang="ts">
  import { useDelete, useCan, t } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { Trash2 } from 'lucide-svelte';

  let {
    resource, recordItemId, hideText = false,
    accessControl, onSuccess, undoable = false, class: className = '',
  } = $props<{
    resource: string;
    recordItemId: string | number;
    hideText?: boolean;
    accessControl?: { enabled?: boolean; hideIfUnauthorized?: boolean };
    onSuccess?: () => void;
    undoable?: boolean;
    class?: string;
  }>();

  const deleteMut = useDelete({ resource, mutationMode: undoable ? 'undoable' : 'pessimistic' });
  const can = accessControl?.enabled ? useCan(resource, 'delete') : null;
  const hidden = $derived(accessControl?.hideIfUnauthorized && can && !can.allowed);
  let confirming = $state(false);

  async function handleDelete() {
    if (!confirming) {
      confirming = true;
      return;
    }
    confirming = false;
    await deleteMut.mutation.mutateAsync({ id: recordItemId, resource });
    onSuccess?.();
  }

  function cancel() { confirming = false; }
</script>

{#if !hidden}
  {#if confirming}
    <div class="inline-flex items-center gap-1">
      <Button variant="destructive" size="sm" onclick={handleDelete}>
        {t('common.confirm')}
      </Button>
      <Button variant="ghost" size="sm" onclick={cancel}>
        {t('common.cancel')}
      </Button>
    </div>
  {:else}
    <Button
      variant="ghost"
      size={hideText ? 'icon' : 'sm'}
      class="text-destructive hover:text-destructive {className}"
      disabled={can ? !can.allowed : false}
      onclick={handleDelete}
    >
      <Trash2 class="h-4 w-4" />
      {#if !hideText}<span class="ml-1">{t('common.delete')}</span>{/if}
    </Button>
  {/if}
{/if}
