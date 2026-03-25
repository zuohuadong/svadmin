<script lang="ts">
  import { useExport, t } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { Download } from 'lucide-svelte';

  let { resource, hideText = false, class: className = '' } = $props<{
    resource: string;
    hideText?: boolean;
    class?: string;
  }>();

  const { triggerExport, isLoading } = useExport({ get resource() { return resource; } });
</script>

<Button
  variant="outline"
  size={hideText ? 'icon' : 'sm'}
  class={className}
  disabled={isLoading}
  onclick={triggerExport}
>
  <Download class="h-4 w-4" />
  {#if !hideText}<span class="ml-1">{t('common.export')}</span>{/if}
</Button>
