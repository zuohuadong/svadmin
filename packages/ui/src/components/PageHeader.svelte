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

<div class="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm shadow-slate-900/[0.03] backdrop-blur {className}">
  {#if showBreadcrumbs}
    <div class="mb-4">
      <Breadcrumbs />
    </div>
  {/if}
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="min-w-0">
      <h1 class="truncate text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {#if description}
        <p class="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      {/if}
    </div>
    {#if actions}
      <div class="flex flex-wrap items-center gap-2">
        {@render actions()}
      </div>
    {/if}
  </div>
</div>
