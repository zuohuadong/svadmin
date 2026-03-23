<script lang="ts">
  import { useIsAuthenticated } from '@svadmin/core';
  import type { Snippet } from 'svelte';
  import { navigate } from '@svadmin/core';

  let {
    children,
    fallback,
    loading,
    redirectTo = '/login',
    appendCurrentPathToQuery = true,
  } = $props<{
    children?: Snippet;
    fallback?: Snippet;
    loading?: Snippet;
    redirectTo?: string;
    appendCurrentPathToQuery?: boolean;
  }>();

  const isAuth = useIsAuthenticated();

  function triggerRedirect() {
    if (fallback) return;
    let url = redirectTo;
    if (appendCurrentPathToQuery && typeof window !== 'undefined') {
      const current = encodeURIComponent(window.location.pathname + window.location.search);
      url += `?to=${current}`;
    }
    navigate(url);
  }

  $effect(() => {
    if (!isAuth.isLoading && !isAuth.isAuthenticated) {
      triggerRedirect();
    }
  });
</script>

{#if isAuth.isLoading}
  {#if loading}
    {@render loading()}
  {/if}
{:else if isAuth.isAuthenticated}
  {#if children}
    {@render children()}
  {/if}
{:else}
  {#if fallback}
    {@render fallback()}
  {/if}
{/if}
