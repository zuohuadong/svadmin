<script module lang="ts">
  import type { Component } from 'svelte';

  export type LazyPageModule = {
    default: Component<never>;
  };

  export type LazyPageRenderable = Component<Record<string, unknown>>;
  export type LazyPageLoader = () => Promise<LazyPageModule>;

  const pagePromises = new WeakMap<object, Promise<unknown>>();

  export function loadLazyPage(loader: LazyPageLoader): Promise<LazyPageModule> {
    const cached = pagePromises.get(loader);
    if (cached) return cached as Promise<LazyPageModule>;

    const promise = loader();
    pagePromises.set(loader, promise);
    void promise.catch(() => pagePromises.delete(loader));
    return promise;
  }
</script>

<script lang="ts">
  let {
    loader,
    props,
  }: {
    loader: LazyPageLoader;
    props: Record<string, unknown>;
  } = $props();

  const pagePromise = $derived(loadLazyPage(loader));
</script>

{#await pagePromise}
  <div class="flex min-h-40 items-center justify-center" role="status" aria-live="polite">
    <span class="text-sm text-muted-foreground">Loading...</span>
  </div>
{:then pageModule}
  {@const Page = pageModule.default as unknown as LazyPageRenderable}
  <Page {...props} />
{:catch}
  <div class="flex min-h-40 items-center justify-center" role="alert">
    <span class="text-sm text-destructive">Unable to load this page.</span>
  </div>
{/await}
