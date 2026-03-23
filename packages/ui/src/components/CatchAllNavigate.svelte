<script lang="ts">
  import { useIsAuthenticated } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import NavigateToResource from './NavigateToResource.svelte';
  
  const auth = useIsAuthenticated();

  $effect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate('/login');
    }
  });
</script>

{#if auth.isLoading}
  <div class="flex h-screen w-screen items-center justify-center">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
  </div>
{:else if auth.isAuthenticated}
  <NavigateToResource />
{/if}
