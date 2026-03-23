<script lang="ts">
  import { useNavigation, t } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { Eye } from 'lucide-svelte';

  let { resource, recordItemId, hideText = false, class: className = '' } = $props<{
    resource: string;
    recordItemId: string | number;
    hideText?: boolean;
    class?: string;
  }>();

  const nav = useNavigation();
</script>

<Button
  variant="ghost"
  size={hideText ? 'icon' : 'sm'}
  class={className}
  onclick={() => nav.show(resource, recordItemId)}
>
  <Eye class="h-4 w-4" />
  {#if !hideText}<span class="ml-1">{t('common.detail')}</span>{/if}
</Button>
