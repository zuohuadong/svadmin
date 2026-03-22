<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Identity } from '@svadmin/core';
  import { toggleTheme, getResolvedTheme } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import { Sun, Moon, Bell, Search } from 'lucide-svelte';

  interface Props {
    identity?: Identity | null;
    title?: string;
    showSearch?: boolean;
    actions?: Snippet;
    class?: string;
  }

  let {
    identity,
    title = '',
    showSearch = false,
    actions,
    class: className = '',
  }: Props = $props();
</script>

<header class="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 {className}">
  {#if title}
    <h2 class="text-lg font-semibold text-foreground">{title}</h2>
  {/if}

  <div class="flex-1"></div>

  {#if showSearch}
    <div class="relative hidden md:block">
      <Search class="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        placeholder={t('common.search')}
        class="h-8 w-64 rounded-lg border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
      />
    </div>
  {/if}

  {#if actions}
    {@render actions()}
  {/if}

  <!-- Theme toggle -->
  <Button variant="ghost" size="icon-sm" onclick={toggleTheme} title={t('common.toggleTheme')}>
    {#if getResolvedTheme() === 'dark'}
      <Sun class="h-4 w-4" />
    {:else}
      <Moon class="h-4 w-4" />
    {/if}
  </Button>

  <!-- User info -->
  {#if identity}
    <div class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
        {identity.name?.charAt(0).toUpperCase() ?? 'U'}
      </div>
      <span class="hidden text-sm font-medium text-foreground md:inline">{identity.name}</span>
    </div>
  {/if}
</header>
