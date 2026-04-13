<script lang="ts">
  import { ExternalLink } from '@lucide/svelte';
  import { getRouterProvider } from '@svadmin/core';

  let { value, resourceName, displayValue } = $props<{
    value: string | number | null | undefined;
    resourceName?: string;
    displayValue?: string;
  }>();

  const display = $derived(displayValue ?? (value != null ? `#${value}` : '—'));
  const href = $derived.by(() => {
    if (!resourceName || value == null) return undefined;
    const router = getRouterProvider();
    const path = `/${resourceName}/show/${value}`;
    return router?.formatLink?.(path) ?? path;
  });
</script>

{#if href}
  <a
    {href}
    class="inline-flex items-center gap-1 text-primary hover:underline text-sm"
  >
    {display}
    <ExternalLink class="h-3 w-3" />
  </a>
{:else}
  <span class="text-muted-foreground">{display}</span>
{/if}
