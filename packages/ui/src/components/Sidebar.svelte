<script lang="ts">
  import { getResources, canAccessAsync } from '@svadmin/core';
  import type { Identity, MenuItem } from '@svadmin/core';
  import { currentPath, navigate } from '@svadmin/core/router';
  import { t, getLocale, setLocale, getAvailableLocales } from '@svadmin/core/i18n';
  import { toggleTheme, getResolvedTheme, colorThemes, getColorTheme, setColorTheme } from '@svadmin/core';
  import { Button } from './ui/button/index.js';
  import TooltipButton from './TooltipButton.svelte';
  import * as Tooltip from './ui/tooltip/index.js';
  import SidebarItem from './SidebarItem.svelte';

  import { ScrollArea } from './ui/scroll-area/index.js';
  import * as Collapsible from './ui/collapsible/index.js';
  import { Avatar } from './ui/avatar/index.js';
  import {
    LayoutDashboard, FileText, Users, Settings, Home,
    ChevronLeft, ChevronDown, LogOut, Sun, Moon, Palette
  } from 'lucide-svelte';

  let { collapsed, identity, title, onToggle, onLogout, menu, legacyHashRouting = false }: {
    collapsed: boolean;
    identity: Identity | null;
    title: string;
    onToggle: () => void;
    onLogout: () => void;
    menu?: MenuItem[];
    legacyHashRouting?: boolean;
  } = $props();

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
    group?: string;
  }

  interface NavGroup {
    name: string | null; // null = ungrouped
    items: NavItem[];
  }

  // Use effect to build nav items, taking access control into account
  let navItems = $state.raw<NavItem[]>([]);

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
            group: r.group,
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

  function onHashChange() { path = currentPath(); }

  function isActive(itemPath: string): boolean {
    if (itemPath === '/') return path === '/';
    return path === itemPath || path.startsWith(itemPath + "/");
  }

  /** Prefetch resource data on hover for instant navigation */
  const prefetchedResources = new Set<string>();
  function prefetchResource(resourceName: string) {
    if (resourceName === '/' || prefetchedResources.has(resourceName)) return;
    prefetchedResources.add(resourceName);
    // Trigger a background fetch by navigating the browser cache
    // The actual prefetch happens via the #key block re-creating useList in AdminApp
  }

  // Group nav items by group field (null = ungrouped)
  const navGroups = $derived.by((): NavGroup[] => {
    const groups: NavGroup[] = [];
    const groupMap = new Map<string | null, NavItem[]>();

    for (const item of navItems) {
      const key = item.group ?? null;
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
        groups.push({ name: key, items: groupMap.get(key)! });
      }
      groupMap.get(key)!.push(item);
    }

    return groups;
  });

  // Track which groups are open
  let openGroups = $state<Set<string>>(new Set());
  let colorPickerOpen = $state(false);
  let colorPickerRef = $state<HTMLDivElement | null>(null);
  let colorPickerOpenedAt = 0;

  // Click-outside to close color picker
  $effect(() => {
    if (!colorPickerOpen) return;
    function handleMouseDown(e: MouseEvent) {
      // Ignore if opened within last 200ms (same interaction)
      if (Date.now() - colorPickerOpenedAt < 200) return;
      if (colorPickerRef && !colorPickerRef.contains(e.target as Node)) {
        colorPickerOpen = false;
      }
    }
    document.addEventListener('mousedown', handleMouseDown, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
    };
  });
</script>

<svelte:window onhashchange={onHashChange} />

<aside
  aria-label="Sidebar navigation"
  class="fixed inset-y-0 left-0 z-30 flex flex-col backdrop-blur-xl transition-all duration-300"
  style="background-color: var(--sidebar);"
  class:w-64={!collapsed}
  class:w-16={collapsed}
>
  <!-- Logo -->
  <div class="flex h-16 items-center justify-between px-4">
    {#if !collapsed}
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 shrink-0" style="box-shadow: 0 4px 12px oklch(0.488 0.243 264.376 / 20%);"></div>
        <span class="font-semibold text-lg tracking-tight text-sidebar-foreground">{title}</span>
      </div>
    {:else}
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 shrink-0 mx-auto" style="box-shadow: 0 4px 12px oklch(0.488 0.243 264.376 / 20%);"></div>
    {/if}
    {#if !collapsed}
      <TooltipButton tooltip={t('common.toggleSidebar')} variant="ghost" size="icon-sm" onclick={onToggle}>
        <ChevronLeft class="h-4 w-4" />
      </TooltipButton>
    {:else}
      <div></div>
    {/if}
  </div>

  <ScrollArea class="flex-1">
  <nav aria-label="Main menu" class="py-4 px-3 space-y-1">
    {#if menu && menu.length > 0}
      <!-- Custom multi-level menu -->
      {#each menu as item}
        <SidebarItem {item} currentPath={path} {collapsed} depth={0} />
      {/each}
    {:else}
    <!-- Auto-generated menu from resources (fallback) -->
    {#each navGroups as group}
      {#if group.name && !collapsed}
        <!-- Grouped section with Collapsible -->
        <Collapsible.Root open={openGroups.has(group.name)} onOpenChange={(isOpen) => {
          const next = new Set(openGroups);
          if (isOpen) next.add(group.name!); else next.delete(group.name!);
          openGroups = next;
        }}>
          <Collapsible.Trigger
            class="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
          >
            <span>{group.name}</span>
            <ChevronDown class="h-3 w-3 transition-transform {openGroups.has(group.name) ? 'rotate-180' : ''}" />
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div class="mt-1 space-y-1">
              {#each group.items as item}
                {@const active = isActive(item.path)}
                <a
                  href={legacyHashRouting ? `#${item.path}` : item.path}
                  class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                  {active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground sidebar-nav-active'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}"
                >
                  <item.Icon class="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </a>
              {/each}
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      {:else}
        <!-- Ungrouped items (flat) -->
        {#each group.items as item}
          {@const active = isActive(item.path)}
          {#if collapsed}
            <Tooltip.Root>
              <Tooltip.Trigger>
                {#snippet child({ props }: { props: Record<string, unknown> })}
                  <a
                    {...props}
                    href={legacyHashRouting ? `#${item.path}` : item.path}
                    class="flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                    {active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}"
                  >
                    <item.Icon class="h-4 w-4 flex-shrink-0" />
                  </a>
                {/snippet}
              </Tooltip.Trigger>
              <Tooltip.Content side="right">
                {item.label}
              </Tooltip.Content>
            </Tooltip.Root>
          {:else}
            <a
              href={legacyHashRouting ? `#${item.path}` : item.path}
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
              {active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground sidebar-nav-active'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}"
            >
              <item.Icon class="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </a>
          {/if}
        {/each}
      {/if}
    {/each}
    {/if}
  </nav>
  </ScrollArea>

  <!-- Footer -->
  <div>
    <!-- Color theme picker -->
    {#if !collapsed}
      <div class="px-3 pt-3 pb-1">
        <div class="relative" bind:this={colorPickerRef}>
          <Button
            variant="ghost"
            class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors h-auto justify-start"
            onclick={() => { if (!colorPickerOpen) colorPickerOpenedAt = Date.now(); colorPickerOpen = !colorPickerOpen; }}
          >
            <Palette class="h-4 w-4" />
            <span class="flex-1 text-left text-xs">{t('common.toggleTheme')}</span>
            <span
              class="h-3.5 w-3.5 rounded-full ring-1 ring-offset-1 ring-offset-sidebar"
              style="background-color: {colorThemes.find(c => c.id === getColorTheme())?.color ?? '#6366f1'}; --tw-ring-color: {colorThemes.find(c => c.id === getColorTheme())?.color ?? '#6366f1'}"
            ></span>
          </Button>
          {#if colorPickerOpen}
            <div class="absolute bottom-full left-0 mb-1 z-50 w-40 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
              {#each colorThemes as ct}
                <button
                  class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onclick={() => { setColorTheme(ct.id as typeof ct.id & import('@svadmin/core').ColorTheme); colorPickerOpen = false; }}
                >
                  <span
                    class="h-3.5 w-3.5 rounded-full {getColorTheme() === ct.id ? 'ring-2 ring-offset-1 scale-110' : 'opacity-70'}"
                    style="background-color: {ct.color}; {getColorTheme() === ct.id ? `--tw-ring-color: ${ct.color}` : ''}"
                  ></span>
                  <span class="text-xs">{ct.label}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- User info -->
    {#if !collapsed && identity}
      <div class="px-3 pb-3 pt-1">
        <div class="flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent/50 transition-colors">
          <Avatar
            src={(identity as Record<string, unknown>).avatar as string | undefined}
            alt={identity.name ?? 'User'}
            fallback={identity.name?.charAt(0).toUpperCase() ?? 'U'}
            size="sm"
          />
          <div class="flex-1 min-w-0">
            <p class="truncate text-sm font-medium text-sidebar-foreground">{identity.name}</p>
            <p class="truncate text-[10px] text-sidebar-foreground/50">{((identity as Record<string, unknown>).role || (identity as Record<string, unknown>).roleName) ?? 'User'}</p>
          </div>
        </div>
        <div class="flex items-center justify-between px-1 mt-1">
          <TooltipButton tooltip={t('common.switchLanguage')} variant="ghost" size="icon-sm" onclick={toggleLocale} class="text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <span class="text-xs font-bold">{localeLabel}</span>
          </TooltipButton>
          <TooltipButton tooltip={t('common.toggleTheme')} variant="ghost" size="icon-sm" onclick={toggleTheme} class="text-sidebar-foreground/60 hover:text-sidebar-foreground">
            {#if getResolvedTheme() === 'dark'}
              <Sun class="h-4 w-4" />
            {:else}
              <Moon class="h-4 w-4" />
            {/if}
          </TooltipButton>
          <TooltipButton tooltip={t('settings.title')} variant="ghost" size="icon-sm" onclick={() => navigate('/settings')} class="text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <Settings class="h-4 w-4" />
          </TooltipButton>
          <TooltipButton tooltip={t('common.logout')} variant="ghost" size="icon-sm" onclick={onLogout} class="text-sidebar-foreground/60 hover:text-destructive">
            <LogOut class="h-4 w-4" />
          </TooltipButton>
        </div>
      </div>
    {:else if collapsed}
      <div class="px-1 py-3 space-y-1">
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props }: { props: Record<string, unknown> })}
              <Button {...props} variant="ghost" size="icon" onclick={toggleLocale} class="w-full text-sidebar-foreground/60 hover:text-sidebar-foreground">
                <span class="text-xs font-bold">{localeLabel}</span>
              </Button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content side="right">{t('common.switchLanguage')}</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props }: { props: Record<string, unknown> })}
              <Button {...props} variant="ghost" size="icon" onclick={toggleTheme} class="w-full text-sidebar-foreground/60 hover:text-sidebar-foreground">
                {#if getResolvedTheme() === 'dark'}
                  <Sun class="h-4 w-4" />
                {:else}
                  <Moon class="h-4 w-4" />
                {/if}
              </Button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content side="right">{t('common.toggleTheme')}</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props }: { props: Record<string, unknown> })}
              <Button {...props} variant="ghost" size="icon" onclick={onLogout} class="w-full text-sidebar-foreground/60 hover:text-destructive">
                <LogOut class="h-4 w-4" />
              </Button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content side="right">{t('common.logout')}</Tooltip.Content>
        </Tooltip.Root>
      </div>
    {:else}
      <div class="flex gap-1 p-3">
        <TooltipButton tooltip={t('common.switchLanguage')} variant="ghost" size="icon" onclick={toggleLocale} class="flex-1 text-sidebar-foreground/60 hover:text-sidebar-foreground">
          <span class="text-xs font-bold">{localeLabel}</span>
        </TooltipButton>
        <TooltipButton tooltip={t('common.toggleTheme')} variant="ghost" size="icon" onclick={toggleTheme} class="flex-1 text-sidebar-foreground/60 hover:text-sidebar-foreground">
          {#if getResolvedTheme() === 'dark'}
            <Sun class="h-4 w-4" />
          {:else}
            <Moon class="h-4 w-4" />
          {/if}
        </TooltipButton>
      </div>
    {/if}
  </div>
</aside>
