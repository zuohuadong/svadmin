<script lang="ts">
  import { Badge } from '../ui/badge/index.js';

  let { value } = $props<{
    value: (string | number)[] | null | undefined;
    options?: { label: string; value: string | number }[];
  }>();

  const items = $derived(Array.isArray(value) ? value : []);
</script>

{#if items.length > 0}
  <div class="flex flex-wrap gap-1">
    {#each items as item}
      <Badge variant="secondary">{String(item)}</Badge>
    {/each}
  </div>
{:else}
  <span class="text-muted-foreground">—</span>
{/if}
