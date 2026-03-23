<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Sidebar from './Sidebar.svelte';
  import Toast from './Toast.svelte';
  import Breadcrumbs from './Breadcrumbs.svelte';
  import CommandPalette from './CommandPalette.svelte';
  import { getAuthProvider } from '@svadmin/core';
  import type { Identity } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { Loader2 } from 'lucide-svelte';

  let commandOpen = $state(false);

  let { children, title = 'Admin' }: { children: Snippet; title?: string } = $props();

  let hasAuth = true;
  let auth: ReturnType<typeof getAuthProvider> | null = null;
  try {
    auth = getAuthProvider();
  } catch {
    hasAuth = false;
  }
  let loading = $state(true);
  let identity = $state<Identity | null>(null);

  onMount(async () => {
    if (!auth) {
      loading = false;
      return;
    }
    const { authenticated, redirectTo } = await auth.check();
    if (!authenticated) {
      navigate(redirectTo ?? '/login');
      return;
    }
    identity = await auth.getIdentity();
    loading = false;
  });

  async function handleLogout() {
    if (!auth) return;
    const result = await auth.logout();
    if (result.success) {
      navigate(result.redirectTo ?? '/login');
    }
  }

  let collapsed = $state(false);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onkeydown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); commandOpen = true; } }}>
{#if loading}
  <div class="flex h-screen items-center justify-center" transition:fade={{ duration: 150 }}>
    <Loader2 class="h-8 w-8 animate-spin text-primary" />
  </div>
{:else}
  <div class="flex h-screen bg-gradient-to-br from-background via-background to-muted/30" in:fade={{ duration: 200, delay: 50 }}>
    <Sidebar {collapsed} {identity} {title} onToggle={() => collapsed = !collapsed} onLogout={handleLogout} />
    <main
      class="flex-1 overflow-y-auto p-8 transition-all duration-300"
      class:ml-64={!collapsed}
      class:ml-16={collapsed}
    >
      <Breadcrumbs />
      {@render children()}
    </main>
  </div>
  <CommandPalette bind:open={commandOpen} />
  <Toast />
{/if}
</div>
