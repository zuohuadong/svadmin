<script lang="ts">
  import { useNavigation, useCan, t } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { Pencil } from '@lucide/svelte';
  import type { ButtonAccessControl } from './access-control';
  import { withRecordId } from './access-control';

  let { resource, recordItemId, hideText = false, accessControl = { enabled: true, hideIfUnauthorized: true }, class: className = '' } = $props<{
    resource: string;
    recordItemId: string | number;
    hideText?: boolean;
    accessControl?: ButtonAccessControl;
    class?: string;
  }>();

  const nav = useNavigation();
  const can = useCan(() => ({
    resource,
    action: 'edit',
    params: withRecordId(accessControl?.params, recordItemId),
    meta: accessControl?.meta,
    queryOptions: { enabled: accessControl?.enabled ?? true }
  }));
  const hidden = $derived(accessControl?.hideIfUnauthorized && !can.allowed);
</script>

{#if !hidden}
  <Button
    variant="outline"
    size={hideText ? 'icon' : 'sm'}
    class={className}
    disabled={!can.allowed}
    onclick={() => nav.edit(resource, recordItemId)}
  >
    <Pencil class="h-4 w-4" />
    {#if !hideText}<span class="ml-1">{t('common.edit')}</span>{/if}
  </Button>
{/if}
