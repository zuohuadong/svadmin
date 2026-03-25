<script lang="ts">
  import { useNavigation, useCan, t } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { Plus } from 'lucide-svelte';

  let { resource, hideText = false, accessControl, class: className = '' } = $props<{
    resource: string;
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
    variant="default"
    size={hideText ? 'icon' : 'default'}
    class={className}
    disabled={can ? !can.allowed : false}
    onclick={() => nav.create(resource)}
  >
    <Plus class="h-4 w-4" />
    {#if !hideText}<span class="ml-1">{t('common.create')}</span>{/if}
  </Button>
{/if}
