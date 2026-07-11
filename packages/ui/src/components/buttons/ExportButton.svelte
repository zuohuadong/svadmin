<script lang="ts">
  import { useExport, useCan, useTranslation } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { Download } from '@lucide/svelte';
  import type { ButtonAccessControl } from './access-control';

  const i18n = useTranslation();

  let { resource, hideText = false, accessControl = { enabled: true, hideIfUnauthorized: true }, class: className = '' } = $props<{
    resource: string;
    hideText?: boolean;
    accessControl?: ButtonAccessControl;
    class?: string;
  }>();

  const { triggerExport, isLoading } = useExport({ get resource() { return resource; } });
  const can = useCan(() => ({
    resource,
    action: 'export',
    params: accessControl?.params,
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
    disabled={isLoading || !can.allowed}
    onclick={triggerExport}
  >
    <Download class="h-4 w-4" />
    {#if !hideText}<span class="ml-1">{i18n.t('common.export')}</span>{/if}
  </Button>
{/if}
