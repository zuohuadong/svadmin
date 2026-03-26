<script lang="ts">
  import { useNavigation, useCan, t } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { Copy } from 'lucide-svelte';

  let { resource, recordItemId, hideText = false, accessControl = { enabled: true, hideIfUnauthorized: true }, class: className = '' } = $props<{
    resource: string;
    recordItemId: string | number;
    hideText?: boolean;
    accessControl?: { enabled?: boolean; hideIfUnauthorized?: boolean };
    class?: string;
  }>();

  const nav = useNavigation();
  const can = $derived(accessControl?.enabled ? useCan(resource, 'create') : null);
  const hidden = $derived(accessControl?.hideIfUnauthorized && can && !can.allowed);
</script>

{#if !hidden}
  <Button
    variant="outline"
    size={hideText ? 'icon' : 'sm'}
    class={className}
    disabled={can ? !can.allowed : false}
    onclick={() => nav.clone(resource, recordItemId)}
  >
    <Copy class="h-4 w-4" />
    {#if !hideText}<span class="ml-1">{t('common.clone')}</span>{/if}
  </Button>
{/if}
