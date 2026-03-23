<script lang="ts">
  interface Props { value: string | null | undefined; alt?: string; width?: number; height?: number }
  let { value, alt = '', width = 80, height = 80 }: Props = $props();
</script>
{#if value}
  <img src={value} {alt} {width} {height} class="field-image" />
{:else}
  <span class="field-image field-empty">—</span>
{/if}

<style>
  .field-image { border-radius: 8px; object-fit: cover; border: 1px solid var(--color-border, #e5e7eb); }
  .field-empty { color: var(--color-text-muted, #9ca3af); display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: var(--color-surface, #f3f4f6); border-radius: 8px; }
</style>
