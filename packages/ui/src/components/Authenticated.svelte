<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useIsAuthenticated } from '@svadmin/core';

  let { children, fallback, loading } = $props<{
    children: Snippet;
    fallback?: Snippet;
    loading?: Snippet;
  }>();

  const auth = useIsAuthenticated();
</script>

{#if auth.isLoading}
  {#if loading}
    {@render loading()}
  {:else}
    <div class="flex items-center justify-center min-h-[200px]">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  {/if}
{:else if auth.isAuthenticated}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
