<script lang="ts">
  interface Props { value: string | null | undefined; label?: string }
  let { value, label }: Props = $props();
  const display = $derived(label ?? value ?? '');
</script>
{#if value}
  <a href={value} target="_blank" rel="noopener noreferrer" class="field-url">
    {display}
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
  </a>
{:else}
  <span class="field-url field-empty">—</span>
{/if}

<style>
  .field-url { color: var(--color-primary, #3b82f6); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
  .field-url:hover { text-decoration: underline; }
  .field-url svg { opacity: 0.6; }
  .field-empty { color: var(--color-text-muted, #9ca3af); }
</style>
