<script lang="ts">
  import { PackageOpen } from 'lucide-svelte';
  import { t } from '@svadmin/core';

  let {
    title = t('empty.title'),
    description = t('empty.description'),
    children,
  } = $props<{
    title?: string;
    description?: string;
    children?: import('svelte').Snippet;
  }>();
</script>

<div class="flex flex-col items-center justify-center p-8 text-center min-h-[300px] bg-card rounded-lg border border-dashed border-border/50 shadow-sm transition-all duration-300">
  <div class="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
    <PackageOpen class="h-10 w-10 text-muted-foreground" />
  </div>
  <h3 class="text-lg font-semibold tracking-tight">{title}</h3>
  <p class="text-sm text-muted-foreground mt-2 max-w-sm">{description}</p>
  {#if children}
    <div class="mt-6">
      {@render children()}
    </div>
  {/if}
</div>
