<script lang="ts">
  interface Props { value: string | null | undefined; title?: string }
  let { value, title }: Props = $props();
  const fileName = $derived(value ? value.split('/').pop() ?? value : null);
</script>
{#if value}
  <a href={value} download class="field-file" title={title ?? fileName ?? ''}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    {fileName}
  </a>
{:else}
  <span class="field-file field-empty">—</span>
{/if}

<style>
  .field-file { color: var(--color-primary, #3b82f6); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
  .field-file:hover { text-decoration: underline; }
  .field-empty { color: var(--color-text-muted, #9ca3af); }
</style>
