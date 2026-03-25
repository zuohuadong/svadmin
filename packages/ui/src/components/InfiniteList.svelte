<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { useInfiniteList } from '@svadmin/core';
  import type { BaseRecord, Sort, Filter } from '@svadmin/core';
  import type { Snippet } from 'svelte';
  import { t } from '@svadmin/core/i18n';
  import { Skeleton } from './ui/skeleton/index.js';
  import { Button } from './ui/button/index.js';
  import { Loader2 } from 'lucide-svelte';
  import { intersect } from '../actions.js';

  interface Props<T extends BaseRecord = BaseRecord> {
    resource: string;
    pageSize?: number;
    sorters?: Sort[];
    filters?: Filter[];
    /** Render each item */
    children: Snippet<[{ item: T; index: number }]>;
    /** Custom empty state */
    empty?: Snippet;
    /** Custom loading skeleton */
    loadingSkeleton?: Snippet;
  }

  let {
    resource,
    pageSize = 20,
    sorters,
    filters,
    children,
    empty,
    loadingSkeleton,
  }: Props = $props();

  const { query } = useInfiniteList({
    get resource() { return resource; },
    get pagination() { return { pageSize }; },
    get sorters() { return sorters; },
    get filters() { return filters; },
  });

  const allItems = $derived(
    (query.data as { pages?: { data: BaseRecord[] }[] })?.pages?.flatMap(p => p.data) ?? []
  );

  const hasNextPage = $derived(query.hasNextPage ?? false);
  const isFetchingNextPage = $derived(query.isFetchingNextPage ?? false);

  function loadMore() {
    if (hasNextPage && !isFetchingNextPage) {
      query.fetchNextPage();
    }
  }
</script>

<div class="space-y-2">
  {#if query.isLoading}
    {#if loadingSkeleton}
      {@render loadingSkeleton()}
    {:else}
      <div class="space-y-3">
        {#each Array(5) as _}
          <Skeleton class="h-16 w-full rounded-lg" />
        {/each}
      </div>
    {/if}
  {:else if allItems.length === 0}
    {#if empty}
      {@render empty()}
    {:else}
      <p class="text-center text-sm text-muted-foreground py-8">{t('empty.title')}</p>
    {/if}
  {:else}
    {#each allItems as item, index}
      <div in:fade={{ duration: 200, delay: index < 20 ? index * 30 : 0 }}>
        {@render children({ item, index })}
      </div>
    {/each}

    {#if isFetchingNextPage}
      <div class="flex justify-center py-4">
        <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    {/if}

    {#if hasNextPage}
      <!-- Sentinel for infinite scroll -->
      <div use:intersect={loadMore} class="h-1"></div>
    {:else}
      <p class="text-center text-xs text-muted-foreground py-2">{t('empty.noMore')}</p>
    {/if}
  {/if}
</div>
