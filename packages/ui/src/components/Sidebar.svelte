<script lang="ts">
  import { getResources } from '@svadmin/core';
  import type { Identity } from '@svadmin/core';
  import { currentPath, navigate } from '@svadmin/core/router';
  import { t, getLocale, setLocale, getAvailableLocales } from '@svadmin/core/i18n';
  import { toggleTheme, getResolvedTheme, colorThemes, getColorTheme, setColorTheme, canAccessAsync } from '@svadmin/core';
  import { Button } from './ui/button/index.js';
  import * as Tooltip from './ui/tooltip/index.js';
  import { Separator } from './ui/separator/index.js';
  import { ScrollArea } from './ui/scroll-area/index.js';
  import {
    LayoutDashboard, FileText, Users, Settings, Home,
    ChevronLeft, ChevronRight, LogOut, Sun, Moon, Languages
  } from 'lucide-svelte';

  let { collapsed, identity, title, onToggle, onLogout } = $props<{
    collapsed: boolean;
    identity: Identity | null;
    title: string;
    onToggle: () => void;
    onLogout: () => void;
  }>();

  const resources = getResources();

  const iconMap: Record<string, typeof LayoutDashboard> = {
    dashboard: LayoutDashboard,
    posts: FileText,
    users: Users,
    settings: Settings,
    home: Home,
  };

  interface NavItem {
    path: string;
    label: string;
    Icon: typeof LayoutDashboard;
  }

  // Use effect to build nav items, taking access control into account
  let navItems = $state<NavItem[]>([]);

  $effect(() => {
    // Re-run when locale or resources change
    const localeVal = getLocale();
    
    Promise.all(resources.map(async (r) => {
      try {
        const { can } = await canAccessAsync(r.name, 'list');
        return { r, can };
      } catch {
        return { r, can: false };
      }
    })).then(results => {
      const items: NavItem[] = [{ path: '/', label: t('common.home'), Icon: LayoutDashboard }];
      for (const { r, can } of results) {
        if (can) {
          items.push({
            path: `/${r.name}`,
            label: r.label,
            Icon: iconMap[r.name] ?? Settings,
          });
        }
      }
      navItems = items;
    });
  });

  /** Toggle between available locales */
  function toggleLocale() {
    const locales = getAvailableLocales();
    const current = getLocale();
    const idx = locales.indexOf(current);
    const next = locales[(idx + 1) % locales.length];
    setLocale(next);
  }

  /** Short display label for current locale */
  const localeLabel = $derived(getLocale() === 'zh-CN' ? '中' : 'EN');

  // Track current hash for active state
  let path = $state(currentPath());
  $effect(() => {
    function onHash() { path = currentPath(); }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  });

  function isActive(itemPath: string): boolean {
    if (itemPath === '/') return path === '/';
    return path.startsWith(itemPath);
  }
</script>

<aside
  class="fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border/50 shadow-xl transition-all duration-300"
  class:w-64={!collapsed}
  class:w-16={collapsed}
>
  <!-- Logo -->
  <div class="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
    {#if !collapsed}
      <span class="text-lg font-bold text-sidebar-primary">{title}</span>
    {:else}
      <span class="text-lg font-bold text-sidebar-primary">{title.charAt(0)}</span>
    {/if}
    <Button variant="ghost" size="icon-sm" onclick={onToggle}>
      {#if collapsed}
        <ChevronRight class="h-4 w-4" />
      {:else}
        <ChevronLeft class="h-4 w-4" />
      {/if}
    </Button>
  </div>

  <ScrollArea class="flex-1">
  <nav class="py-4 px-2 space-y-1">
    {#each navItems as item}
      {@const active = isActive(item.path)}
      {#if collapsed}
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <a
                {...props}
                href={`#${item.path}`}
                class="flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                class:bg-sidebar-accent={active}
                class:text-sidebar-accent-foreground={active}
                class:text-sidebar-foreground={!active}
                class:hover:bg-sidebar-accent={!active}
              >
                <item.Icon class="h-5 w-5 flex-shrink-0" />
              </a>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content side="right">
            {item.label}
          </Tooltip.Content>
        </Tooltip.Root>
      {:else}
        <a
          href={`#${item.path}`}
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          class:bg-sidebar-accent={active}
          class:text-sidebar-accent-foreground={active}
          class:text-sidebar-foreground={!active}
          class:hover:bg-sidebar-accent={!active}
        >
          <item.Icon class="h-5 w-5 flex-shrink-0" />
          <span>{item.label}</span>
        </a>
      {/if}
    {/each}
  </nav>
  </ScrollArea>

  <!-- Footer -->
  <Separator class="bg-sidebar-border" />
  <div class="p-3 space-y-2">
    <!-- Color theme picker -->
    {#if !collapsed}
      <div class="flex items-center justify-center gap-1.5 px-2 py-1">
        {#each colorThemes as ct}
          <button
            class="h-5 w-5 rounded-full transition-all duration-200 hover:scale-110 {getColorTheme() === ct.id ? 'ring-2 ring-offset-2 ring-offset-sidebar scale-110' : 'opacity-70 hover:opacity-100'}"
            style="background-color: {ct.color}; {getColorTheme() === ct.id ? `--tw-ring-color: ${ct.color}` : ''}"
            title={ct.label}
            onclick={() => setColorTheme(ct.id)}
          ></button>
        {/each}
      </div>
    {/if}

    {#if !collapsed && identity}
      <div class="flex items-center gap-3 rounded-lg px-2 py-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground">
          {identity.name?.charAt(0).toUpperCase() ?? 'U'}
        </div>
        <div class="flex-1 min-w-0">
          <p class="truncate text-sm font-medium text-sidebar-foreground">{identity.name}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onclick={toggleLocale} class="text-sidebar-foreground" title="Switch language">
          <span class="text-xs font-bold">{localeLabel}</span>
        </Button>
        <Button variant="ghost" size="icon-sm" onclick={toggleTheme} class="text-sidebar-foreground" title={t('common.toggleTheme')}>
          {#if getResolvedTheme() === 'dark'}
            <Sun class="h-4 w-4" />
          {:else}
            <Moon class="h-4 w-4" />
          {/if}
        </Button>
        <Button variant="ghost" size="icon-sm" onclick={onLogout} class="text-sidebar-foreground hover:text-destructive" title={t('common.logout')}>
          <LogOut class="h-4 w-4" />
        </Button>
      </div>
    {:else if collapsed}
      <Button variant="ghost" size="icon" onclick={toggleLocale} class="w-full text-sidebar-foreground" title="Switch language">
        <span class="text-xs font-bold">{localeLabel}</span>
      </Button>
      <Button variant="ghost" size="icon" onclick={toggleTheme} class="w-full text-sidebar-foreground" title={t('common.toggleTheme')}>
        {#if getResolvedTheme() === 'dark'}
          <Sun class="h-5 w-5" />
        {:else}
          <Moon class="h-5 w-5" />
        {/if}
      </Button>
      <Button variant="ghost" size="icon" onclick={onLogout} class="w-full text-sidebar-foreground hover:text-destructive" title={t('common.logout')}>
        <LogOut class="h-5 w-5" />
      </Button>
    {:else}
      <div class="flex gap-1">
        <Button variant="ghost" size="icon" onclick={toggleLocale} class="flex-1 text-sidebar-foreground" title="Switch language">
          <span class="text-xs font-bold">{localeLabel}</span>
        </Button>
        <Button variant="ghost" size="icon" onclick={toggleTheme} class="flex-1 text-sidebar-foreground" title={t('common.toggleTheme')}>
          {#if getResolvedTheme() === 'dark'}
            <Sun class="h-5 w-5" />
          {:else}
            <Moon class="h-5 w-5" />
          {/if}
        </Button>
      </div>
    {/if}
  </div>
</aside>
