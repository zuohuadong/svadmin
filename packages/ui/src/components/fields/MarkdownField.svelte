<script lang="ts">
  interface Props { value: string | null | undefined }
  let { value }: Props = $props();
</script>
{#if value}
  <div class="field-markdown">{@html value}</div>
{:else}
  <span class="field-empty">—</span>
{/if}

<style>
  .field-markdown { line-height: 1.6; }
  .field-markdown :global(h1), .field-markdown :global(h2), .field-markdown :global(h3) { margin-top: 0.5em; margin-bottom: 0.25em; }
  .field-markdown :global(p) { margin: 0.5em 0; }
  .field-markdown :global(code) { background: var(--color-surface, #f3f4f6); padding: 2px 6px; border-radius: 4px; font-size: 0.875em; }
  .field-markdown :global(pre) { background: var(--color-surface, #f3f4f6); padding: 12px; border-radius: 8px; overflow-x: auto; }
  .field-markdown :global(a) { color: var(--color-primary, #3b82f6); }
  .field-empty { color: var(--color-text-muted, #9ca3af); }
</style>
