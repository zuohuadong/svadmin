<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import Sidebar from './Sidebar.svelte';
  import Toast from './Toast.svelte';
  import Header from './Header.svelte';
  import CommandPalette from './CommandPalette.svelte';
  import KeyboardShortcuts from './KeyboardShortcuts.svelte';
  import ChatDialog from './ChatDialog.svelte';
  import TooltipButton from './TooltipButton.svelte';
  import { t } from '@svadmin/core/i18n';
  import { getAuthProvider } from '@svadmin/core';
  import type { Identity, MenuItem } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { getPath } from '../router-state.svelte.js';
  import { Skeleton } from './ui/skeleton/index.js';
  import { Button } from './ui/button/index.js';
  import * as Sheet from './ui/sheet/index.js';
  import { Menu } from '@lucide/svelte';

  let commandOpen = $state(false);
  let shortcutsOpen = $state(false);
  let mobileMenuOpen = $state(false);

  let { children, title = 'Admin', menu, siteUrl, routeMode = 'auto' }: { children: Snippet; title?: string; menu?: MenuItem[]; siteUrl?: string; routeMode?: 'hash' | 'path' | 'auto' } = $props();

  let hasAuth = true;
  let auth: ReturnType<typeof getAuthProvider> | null = null;
  try {
    auth = getAuthProvider();
  } catch {
    hasAuth = false;
  }
  let loading = $state(true);
  let identity = $state<Identity | null>(null);

  $effect(() => {
    let cancelled = false;
    if (!auth) {
      if (!cancelled) loading = false;
      return;
    }
    auth.getIdentity().then(id => {
      if (!cancelled) {
        identity = id;
        loading = false;
      }
    }).catch(() => {
      if (!cancelled) loading = false;
    });
    return () => { cancelled = true; };
  });

  async function handleLogout() {
    if (!auth) return;
    const result = await auth.logout();
    if (result.success) {
      navigate(result.redirectTo ?? '/login');
    }
  }

  let collapsed = $state(false);

  // Swipe gesture for mobile menu
  let touchStartX = $state(0);
  let touchEndX = $state(0);

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchEndX = e.touches[0].clientX;
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (e.touches.length === 1) {
      touchEndX = e.touches[0].clientX;
    }
  }

  function handleTouchEnd() {
    // Only trigger swipe-to-open if starting near the left edge (e.g., within 30px)
    // and swiping right by at least 50px
    if (touchStartX < 30 && touchEndX - touchStartX > 50) {
      mobileMenuOpen = true;
    }
  }
</script>

<svelte:window 
  onkeydown={(e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); commandOpen = true; }
    if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) { e.preventDefault(); shortcutsOpen = true; }
  }}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
/>
{#if loading}
  <div class="flex h-screen" in:fade={{ duration: 150 }}>
    <div class="hidden md:block w-64 bg-sidebar/80 p-4 space-y-4">
      <Skeleton class="h-8 w-32" />
      <div class="space-y-2 mt-6">
        {#each Array(5) as _}
          <Skeleton class="h-9 w-full rounded-lg" />
        {/each}
      </div>
    </div>
    <div class="flex-1 p-8 space-y-6">
      <Skeleton class="h-8 w-48" />
      <div class="space-y-3">
        {#each Array(4) as _}
          <Skeleton class="h-12 w-full" />
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="flex h-screen bg-background" in:fade={{ duration: 200, delay: 50 }}>
    <!-- Desktop sidebar -->
    <div class="hidden md:block">
      <Sidebar {collapsed} {identity} {title} {menu} {routeMode} onToggle={() => collapsed = !collapsed} onLogout={handleLogout} />
    </div>

    <!-- Mobile sidebar via Sheet -->
    <Sheet.Root bind:open={mobileMenuOpen} side="left">
      <div class="md:hidden">
        <Sidebar collapsed={false} {identity} {title} {menu} {routeMode} onToggle={() => { mobileMenuOpen = false; }} onLogout={handleLogout} />
      </div>
    </Sheet.Root>

    <div
      class="flex-1 flex flex-col overflow-hidden transition-all duration-300"
      class:md:ml-64={!collapsed}
      class:md:ml-16={collapsed}
    >
      <!-- Header with mobile hamburger -->
      <Header
        {siteUrl}
        showSearch={true}
        onSearchClick={() => { commandOpen = true; }}
      >
        {#snippet children()}
          <!-- Mobile hamburger -->
          <TooltipButton tooltip={t('common.menu')} class="md:hidden" onclick={() => { mobileMenuOpen = true; }}>
            <Menu class="h-5 w-5" />
          </TooltipButton>
        {/snippet}
      </Header>

      <!-- Content area -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8">
        {#key getPath()}
          <div in:fly={{ x: 20, duration: 150 }} out:fade={{ duration: 80 }}>
            {@render children()}
          </div>
        {/key}
      </main>
    </div>
  </div>
  <CommandPalette bind:open={commandOpen} />
  <KeyboardShortcuts bind:open={shortcutsOpen} />
  <ChatDialog />
  <Toast />
{/if}
