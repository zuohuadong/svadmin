<script lang="ts">
  import { useInvalidate, useTranslation } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { RefreshCw } from '@lucide/svelte';

  const i18n = useTranslation();

  let { resource, hideText = false, class: className = '' } = $props<{
    resource: string;
    hideText?: boolean;
    class?: string;
  }>();

  const invalidate = useInvalidate();
  let spinning = $state(false);
  let spinTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    return () => { if (spinTimer) clearTimeout(spinTimer); };
  });

  function refresh() {
    spinning = true;
    invalidate({ resource, invalidates: ['list', 'many'] });
    if (spinTimer) clearTimeout(spinTimer);
    spinTimer = setTimeout(() => { spinning = false; }, 600);
  }
</script>

<Button
  variant="ghost"
  size={hideText ? 'icon' : 'sm'}
  class={className}
  onclick={refresh}
>
  <RefreshCw class="h-4 w-4 {spinning ? 'animate-spin' : ''}" />
  {#if !hideText}<span class="ml-1">{i18n.t('common.retry')}</span>{/if}
</Button>
