<script lang="ts">
  import { useNavigation, t } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { List } from 'lucide-svelte';

  let { resource, hideText = false, class: className = '' } = $props<{
    resource: string;
    hideText?: boolean;
    class?: string;
  }>();

  const nav = useNavigation();
</script>

<Button
  variant="outline"
  size={hideText ? 'icon' : 'sm'}
  class={className}
  onclick={() => nav.list(resource)}
>
  <List class="h-4 w-4" />
  {#if !hideText}<span class="ml-1">{resource}</span>{/if}
</Button>
