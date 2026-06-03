<script lang="ts">
  import { Badge } from '../ui/badge/index.js';
  interface Props { value: string | string[] | null | undefined }
  let { value }: Props = $props();
  const tags = $derived(Array.isArray(value) ? value : value ? [value] : []);
</script>
<span class="inline-flex flex-wrap gap-1">
  {#each tags as tag, _i (_i)}
    <Badge variant="secondary">{tag}</Badge>
  {/each}
  {#if tags.length === 0}<span class="text-muted-foreground">—</span>{/if}
</span>
