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

<div class="border-b border-border/70 pb-5 {className}" data-svadmin-page-header>
  {#if showBreadcrumbs}
    <div class="mb-4">
      <Breadcrumbs />
    </div>
  {/if}
  <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div class="min-w-0">
      <h1 class="truncate text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {#if description}
        <p class="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      {/if}
    </div>
    {#if actions}
      <div class="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
        {@render actions()}
      </div>
    {/if}
  </div>
</div>
