<script lang="ts">
  import { useNavigation, useCan, t } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { Pencil } from 'lucide-svelte';

  let { resource, recordItemId, hideText = false, accessControl, class: className = '' } = $props<{
    resource: string;
    recordItemId: string | number;
    hideText?: boolean;
    accessControl?: { enabled?: boolean; hideIfUnauthorized?: boolean };
    class?: string;
  }>();

  const nav = useNavigation();
  const can = $derived(accessControl?.enabled ? useCan(resource, 'edit') : null);
  const hidden = $derived(accessControl?.hideIfUnauthorized && can && !can.allowed);
</script>

{#if !hidden}
  <Button
    variant="outline"
    size={hideText ? 'icon' : 'sm'}
    class={className}
    disabled={can ? !can.allowed : false}
    onclick={() => nav.edit(resource, recordItemId)}
  >
    <Pencil class="h-4 w-4" />
    {#if !hideText}<span class="ml-1">{t('common.edit')}</span>{/if}
  </Button>
{/if}
