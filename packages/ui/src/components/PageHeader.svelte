<script lang="ts">
  import type { Snippet } from 'svelte';
  import Breadcrumbs from './Breadcrumbs.svelte';

  interface Props {
    title: string;
    description?: string;
    actions?: Snippet;
    showBreadcrumbs?: boolean;
    class?: string;
  }

  let {
    title,
    description,
    actions,
    showBreadcrumbs = true,
    class: className = '',
  }: Props = $props();
</script>

<div class="space-y-4 {className}">
  {#if showBreadcrumbs}
    <Breadcrumbs />
  {/if}
  <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      {#if description}
        <p class="text-sm text-muted-foreground">{description}</p>
      {/if}
    </div>
    {#if actions}
      <div class="flex items-center gap-2">
        {@render actions()}
      </div>
    {/if}
  </div>
</div>
