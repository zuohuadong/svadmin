<script lang="ts">
  interface Props { value: string | null | undefined }
  let { value }: Props = $props();
</script>
{#if value}
  <a href="mailto:{value}" class="field-email">{value}</a>
{:else}
  <span class="field-email field-empty">—</span>
{/if}

<style>
  .field-email { color: var(--color-primary, #3b82f6); text-decoration: none; }
  .field-email:hover { text-decoration: underline; }
  .field-empty { color: var(--color-text-muted, #9ca3af); }
</style>
