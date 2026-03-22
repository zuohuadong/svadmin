<script lang="ts">
  interface Props { value: string | string[] | null | undefined; color?: string }
  let { value, color = 'var(--color-primary, #3b82f6)' }: Props = $props();
  const tags = $derived(Array.isArray(value) ? value : value ? [value] : []);
</script>
<span class="field-tags">
  {#each tags as tag}
    <span class="tag" style="--tag-color: {color}">{tag}</span>
  {/each}
  {#if tags.length === 0}<span class="field-empty">—</span>{/if}
</span>

<style>
  .field-tags { display: inline-flex; flex-wrap: wrap; gap: 4px; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; background: color-mix(in srgb, var(--tag-color) 15%, transparent); color: var(--tag-color); border: 1px solid color-mix(in srgb, var(--tag-color) 30%, transparent); }
  .field-empty { color: var(--color-text-muted, #9ca3af); }
</style>
