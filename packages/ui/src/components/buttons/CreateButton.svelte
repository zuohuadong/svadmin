<script lang="ts">
  import { useNavigation, useCan, t } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { Plus } from '@lucide/svelte';
  import type { ButtonAccessControl } from './access-control';

  let { resource, hideText = false, accessControl = { enabled: true, hideIfUnauthorized: true }, class: className = '' } = $props<{
    resource: string;
    hideText?: boolean;
    accessControl?: ButtonAccessControl;
    class?: string;
  }>();

  const nav = useNavigation();
  const can = useCan(() => ({
    resource,
    action: 'create',
    params: accessControl?.params,
    meta: accessControl?.meta,
    queryOptions: { enabled: accessControl?.enabled ?? true }
  }));
  const hidden = $derived(accessControl?.hideIfUnauthorized && !can.allowed);
</script>

{#if !hidden}
  <Button
    variant="default"
    size={hideText ? 'icon' : 'default'}
    class={className}
    disabled={!can.allowed}
    onclick={() => nav.create(resource)}
  >
    <Plus class="h-4 w-4" />
    {#if !hideText}<span class="ml-1">{t('common.create')}</span>{/if}
  </Button>
{/if}
