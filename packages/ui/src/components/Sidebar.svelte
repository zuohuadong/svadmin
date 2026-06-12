<script lang="ts">
/* eslint-disable svelte/prefer-svelte-reactivity */
  import { getResources, canAccessAsync, getAuthProvider } from '@svadmin/core';
  import type { Identity, MenuItem } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { getPath } from '../router-state.svelte.js';
  import { t, getLocale, setLocale, getAvailableLocales } from '@svadmin/core/i18n';
  import { toggleTheme, getResolvedTheme } from '@svadmin/core';
  import { Button } from './ui/button/index.js';
  import TooltipButton from './TooltipButton.svelte';
  import * as Tooltip from './ui/tooltip/index.js';
  import * as Popover from './ui/popover/index.js';
  import SidebarItem from './SidebarItem.svelte';

  import { ScrollArea } from './ui/scroll-area/index.js';
  import { Avatar } from './ui/avatar/index.js';
  import {
    LayoutDashboard, FileText, Users, Settings, Home,
    ChevronLeft, ChevronRight, ChevronDown, LogOut, Sun, Moon, Palette,
    Image as ImageIcon, Layout, Folder, Type, Video,
    Download, ListTodo, TrendingUp, Sparkles, Images, Bot, Key, KeyRound, CreditCard, BookOpen, Wrench,
    Repeat, ClipboardCheck, SlidersHorizontal, AlertTriangle, Bell, CalendarDays, Package, Shield,
    Barcode, FolderTree, Building2, Warehouse, Languages, User, Lock, Puzzle, FileSearch, Info
  } from '@lucide/svelte';

  const authProvider = getAuthProvider({ optional: true });

  let { collapsed, identity, title, onToggle, onLogout, menu, routeMode = 'auto' }: {
    collapsed: boolean;
    identity: Identity | null;
    title: string;
    onToggle: () => void;
    onLogout: () => void;
    menu?: MenuItem[];
    /** 'hash' for SPA hash routing, 'path' for SvelteKit/filesystem routing, 'auto' to detect */
    routeMode?: 'hash' | 'path' | 'auto';
  } = $props();

  const effectiveRouteMode = $derived(
    routeMode === 'auto'
      ? (typeof window !== 'undefined' && window.location.hash.startsWith('#/') ? 'hash' : 'path')
      : routeMode
  );

  const _resources = getResources();

  const iconMap: Record<string, typeof LayoutDashboard> = {
    'dashboard': LayoutDashboard,
    'posts': FileText,
    'users': Users,
    'settings': Settings,
    'home': Home,
    'palette': Palette,
    'image': ImageIcon,
    'layout': Layout,
    'folder': Folder,
    'type': Type,
    'video': Video,
    'download': Download,
    'list-todo': ListTodo,
    'trending-up': TrendingUp,
    'sparkles': Sparkles,
    'images': Images,
    'bot': Bot,
    'key': Key,
    'key-round': KeyRound,
    'credit-card': CreditCard,
    'book-open': BookOpen,
    'wrench': Wrench,
    'repeat': Repeat,
    'clipboard-check': ClipboardCheck,
    'sliders-horizontal': SlidersHorizontal,
    'alert-triangle': AlertTriangle,
    'bell': Bell,
    'calendar': CalendarDays,
    'package': Package,
    'shield': Shield,
    'barcode': Barcode,
    'folder-tree': FolderTree,
    'building-2': Building2,
    'warehouse': Warehouse,
  };

  interface NavItem {
    path: string;
    label: string;
    Icon: typeof LayoutDashboard;
    group?: string;
    badge?: string;
  }

  interface NavGroup {
    name: string | null; // null = ungrouped
    items: NavItem[];
  }

  interface UserSettingsItem {
    key: string;
    path: string;
    icon: typeof LayoutDashboard;
    label: string;
  }

  const userSettingsItems: UserSettingsItem[] = [
    { key: 'account', path: '/settings/account', icon: User, label: 'settings.accountPreferences' },
    { key: 'access', path: '/settings/access', icon: Lock, label: 'settings.accessSecurity' },
    { key: 'developer', path: '/settings/developer', icon: Puzzle, label: 'settings.integrationApi' },
    ...(authProvider ? [
      { key: 'audit', path: '/settings/audit', icon: FileSearch, label: 'settings.auditLogs' },
    ] : []),
    { key: 'about', path: '/settings/about', icon: Info, label: 'settings.about' },
  ];

  // Use effect to build nav items, taking access control into account
  let navItems = $state.raw<NavItem[]>([]);

  $effect(() => {
    const _localeVal = getLocale();
    const currentResources = getResources();
    let cancelled = false;

    Promise.all(currentResources.map(async (r) => {
      try {
        const { can } = await canAccessAsync(r.name, 'list');
        return { r, can };
      } catch {
        return { r, can: false };
      }
    })).then(results => {
      if (cancelled) return;
      const items: NavItem[] = [{ path: '/', label: t('common.home'), Icon: LayoutDashboard }];
      for (const { r, can } of results) {
        if (can) {
          items.push({
            path: `/${r.name}`,
            label: r.label,
            Icon: (typeof r.icon === 'string' ? iconMap[r.icon] : r.icon) ?? iconMap[r.name] ?? Settings,
            group: r.group,
            badge: typeof r.meta?.badge === 'string' ? r.meta.badge : undefined,
          });
        }
      }
      navItems = items;
    });

    return () => { cancelled = true; };
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
  const path = $derived(getPath());
  let userMenuOpen = $state(false);

  function isActive(itemPath: string): boolean {
    if (itemPath === '/') return path === '/';
    return path === itemPath || path.startsWith(itemPath + "/");
  }

  function aggregateBadges(items: { badge?: string }[]): string | undefined {
    const total = items.reduce((sum, item) => {
      const value = Number(item.badge);
      return Number.isFinite(value) ? sum + value : sum;
    }, 0);

    return total > 0 ? String(total) : undefined;
  }

  function openUserMenuRoute(path: string) {
    userMenuOpen = false;
    navigate(path);
  }

  function handleUserMenuAction(action: () => void) {
    userMenuOpen = false;
    action();
  }

  /** Prefetch resource data on hover for instant navigation */
  const prefetchedResources = new Set<string>();
  function _prefetchResource(resourceName: string) {
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
        groups.push({ name: key, items: groupMap.get(key) ?? [] });
      }
      (groupMap.get(key) ?? []).push(item);
    }

    return groups;
  });

  let autoGroupOpen = $state<Record<string, boolean>>({});
  let autoGroupTouched = $state<Record<string, boolean>>({});

  function isGroupActive(group: NavGroup): boolean {
    return group.items.some((item) => isActive(item.path));
  }

  function isAutoGroupOpen(group: NavGroup): boolean {
    if (!group.name) return true;
    return autoGroupOpen[group.name] ?? true;
  }

  function toggleAutoGroup(group: NavGroup) {
    if (!group.name) return;
    const currentOpen = isAutoGroupOpen(group);
    autoGroupTouched = { ...autoGroupTouched, [group.name]: true };
    autoGroupOpen = { ...autoGroupOpen, [group.name]: !currentOpen };
  }

  $effect(() => {
    let nextOpen = autoGroupOpen;
    let changed = false;

    for (const group of navGroups) {
      if (!group.name || autoGroupTouched[group.name] || !isGroupActive(group) || autoGroupOpen[group.name]) continue;
      if (!changed) nextOpen = { ...autoGroupOpen };
      nextOpen[group.name] = true;
      changed = true;
    }

    if (changed) autoGroupOpen = nextOpen;
  });

  // Density state
  let density = $state<'compact' | 'standard'>('standard');
  
  $effect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('svadmin-sidebar-density');
      if (stored === 'compact' || stored === 'standard') density = stored;
      
      const onDensityChange = (e: Event) => {
        const customEvent = e as CustomEvent<'compact' | 'standard'>;
        density = customEvent.detail;
      };
      window.addEventListener('svadmin-density-change', onDensityChange);
      return () => window.removeEventListener('svadmin-density-change', onDensityChange);
    }
  });

  const pyClass = $derived(density === 'compact' ? 'py-1.5' : 'py-2.5');
  const pyClassGroupItem = $derived(density === 'compact' ? 'py-1.5' : 'py-2');

</script>



<aside
  aria-label="Sidebar navigation"
  class="fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border/70 bg-sidebar/95 shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl transition-all duration-300"
  class:w-72={!collapsed}
  class:w-16={collapsed}
  data-sidebar="sidebar"
  data-collapsed={collapsed ? "true" : "false"}
>
  <!-- Logo -->
  <div class="flex border-b border-border/60 {collapsed ? 'h-24 flex-col items-center justify-center gap-1 px-2' : 'h-16 items-center justify-between px-4'}">
    {#if !collapsed}
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <div class="flex h-9 w-6 shrink-0 items-center justify-center text-sm font-bold text-primary">
          {title.slice(0, 1).toUpperCase()}
        </div>
        <div class="min-w-0 flex-1 text-left">
          <span class="block truncate text-[1.15rem] font-semibold leading-6 tracking-tight text-sidebar-foreground">{title}</span>
          <span class="block truncate text-xs font-medium leading-4 text-sidebar-foreground/50">{getLocale() === 'zh-CN' ? '管理控制台' : 'Admin Console'}</span>
        </div>
      </div>
    {:else}
      <div class="mx-auto flex h-9 w-9 shrink-0 items-center justify-center text-sm font-bold text-primary">
        {title.slice(0, 1).toUpperCase()}
      </div>
    {/if}
    {#if !collapsed}
      <TooltipButton tooltip={t('common.toggleSidebar')} variant="ghost" size="icon-sm" onclick={onToggle} class="text-sidebar-foreground/55 hover:bg-transparent hover:text-sidebar-foreground">
        <ChevronLeft class="h-4 w-4" />
      </TooltipButton>
    {:else}
      <TooltipButton tooltip={t('common.toggleSidebar')} variant="ghost" size="icon-sm" onclick={onToggle} class="mx-auto text-sidebar-foreground/55 hover:bg-transparent hover:text-sidebar-foreground">
        <ChevronRight class="h-4 w-4" />
      </TooltipButton>
    {/if}
  </div>

  <div class="flex min-h-0 flex-1">
  <ScrollArea class="min-w-0 flex-1">
  <nav aria-label="Main menu" class="space-y-2 py-4 px-2">
    {#if menu && menu.length > 0}
      <!-- Custom multi-level menu -->
      {#each menu as item, _i (_i)}
        <SidebarItem {item} currentPath={path} {collapsed} depth={0} />
      {/each}
    {:else}
    <!-- Auto-generated menu from resources (fallback) -->
    {#each navGroups as group, _i (_i)}
      {#if group.name && !collapsed}
        {@const groupOpen = isAutoGroupOpen(group)}
        {@const groupActive = isGroupActive(group)}
        {@const groupBadge = aggregateBadges(group.items)}
        <div class="border-b border-border/60 pb-2 last:border-b-0">
          <button
            type="button"
            class="flex w-full items-center justify-between px-0.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors {groupActive ? 'text-primary' : 'text-sidebar-foreground/45 hover:text-sidebar-foreground/75'}"
            data-sidebar="group-label"
            aria-expanded={groupOpen}
            onclick={() => toggleAutoGroup(group)}
          >
            <span class="flex min-w-0 flex-1 items-center">
              <span class="truncate">{group.name}</span>
              {#if groupBadge}
                <span class="ml-2 rounded-full {groupActive ? 'bg-primary/12 text-primary' : 'bg-sidebar-accent text-sidebar-foreground/60'} px-2 py-0.5 text-[10px] font-semibold tracking-normal">{groupBadge}</span>
              {/if}
            </span>
            <ChevronDown class="h-3.5 w-3.5 shrink-0 transition-transform duration-200 {groupOpen ? 'rotate-180' : ''}" />
          </button>
          {#if groupOpen}
            <div class="mt-0.5 divide-y divide-border/45" data-sidebar="menu-sub">
              {#each group.items as item, _i (_i)}
                {@const active = isActive(item.path)}
                <a
                  href={effectiveRouteMode === 'hash' ? `#${item.path}` : item.path}
                  onclick={(e) => { e.preventDefault(); navigate(item.path); }}
                  class="group relative flex items-center gap-3 px-2 {pyClassGroupItem} text-sm font-medium transition-all duration-200 first:rounded-t-xl last:rounded-b-xl
                  {active
                    ? 'text-primary font-semibold'
                    : 'text-sidebar-foreground/68 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground'}"
                  data-sidebar="menu-sub-button"
                  data-active={active ? "true" : "false"}
                >
                  <span data-sidebar="menu-icon" class="flex h-5 w-5 shrink-0 items-center justify-center {active ? 'text-primary' : 'text-sidebar-foreground/55 group-hover:text-primary'}">
                    <item.Icon class="h-4 w-4 flex-shrink-0" />
                  </span>
                  <span class="min-w-0 flex-1 truncate">{item.label}</span>
                  {#if item.badge}
                    <span class="rounded-full {active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'} px-2 py-0.5 text-[10px] font-semibold">{item.badge}</span>
                  {/if}
                </a>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <!-- Ungrouped items (flat) -->
        {#each group.items as item, _i (_i)}
          {@const active = isActive(item.path)}
          {#if collapsed}
            <Tooltip.Root>
              <Tooltip.Trigger>
                {#snippet child({ props }: { props: Record<string, unknown> })}
                  <a
                    {...props}
                    href={effectiveRouteMode === 'hash' ? `#${item.path}` : item.path}
                    onclick={(e) => { e.preventDefault(); navigate(item.path); }}
                    class="mx-auto flex h-10 w-10 items-center justify-center text-sm font-medium transition-colors duration-200
                    {active
                      ? 'text-primary'
                      : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'}"
                    data-sidebar="menu-button"
                    data-active={active ? "true" : "false"}
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
              href={effectiveRouteMode === 'hash' ? `#${item.path}` : item.path}
              onclick={(e) => { e.preventDefault(); navigate(item.path); }}
              class="group relative flex items-center gap-3 rounded-xl px-2 {pyClass} text-sm font-medium transition-all duration-200
              {active
                ? 'text-primary font-semibold'
                : 'text-sidebar-foreground/68 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground'}"
              data-sidebar="menu-button"
              data-active={active ? "true" : "false"}
            >              <span data-sidebar="menu-icon" class="flex h-5 w-5 shrink-0 items-center justify-center {active ? 'text-primary' : 'text-sidebar-foreground/55 group-hover:text-primary'}">
                <item.Icon class="h-4 w-4 flex-shrink-0" />
              </span>
              <span class="min-w-0 flex-1 truncate">{item.label}</span>
              {#if item.badge}
                <span class="rounded-full {active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'} px-2 py-0.5 text-[10px] font-semibold">{item.badge}</span>
              {/if}
            </a>
          {/if}
        {/each}
      {/if}
    {/each}
    {/if}
  </nav>
  </ScrollArea>
  </div>

  <!-- Footer -->
  <div class="border-t border-border/60 bg-sidebar/95">
    <!-- User info -->
    {#if !collapsed && identity}
      <div class="px-3 py-3">
        <Popover.Root bind:open={userMenuOpen}>
          <Popover.Trigger>
            {#snippet child({ props }: { props: Record<string, unknown> })}
              <button
                {...props}
                type="button"
                class="flex w-full items-center gap-3 rounded-2xl border border-border/50 bg-background/65 p-2 text-left shadow-sm shadow-slate-900/[0.02] transition-colors hover:bg-sidebar-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label={identity.name ?? 'User'}
              >
                <Avatar
                  src={(identity as Record<string, unknown>).avatar as string | undefined}
                  alt={identity.name ?? 'User'}
                  fallback={identity.name?.charAt(0).toUpperCase() ?? 'U'}
                  size="sm"
                />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-sidebar-foreground">{identity.name}</p>
                  <p class="truncate text-[10px] text-sidebar-foreground/50">{((identity as Record<string, unknown>).role || (identity as Record<string, unknown>).roleName) ?? 'User'}</p>
                </div>
                <ChevronDown class="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/45 transition-transform {userMenuOpen ? 'rotate-180' : ''}" />
              </button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content align="start" side="right" sideOffset={10} class="w-56 p-2">
            <div class="space-y-1">
              <button type="button" class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground" onclick={() => handleUserMenuAction(toggleLocale)}>
                <Languages class="h-4 w-4 shrink-0" />
                <span class="min-w-0 flex-1 truncate">{t('common.switchLanguage')}</span>
                <span class="text-xs font-semibold text-muted-foreground">{localeLabel}</span>
              </button>
              <button type="button" class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground" onclick={() => handleUserMenuAction(toggleTheme)}>
                {#if getResolvedTheme() === 'dark'}
                  <Sun class="h-4 w-4 shrink-0" />
                {:else}
                  <Moon class="h-4 w-4 shrink-0" />
                {/if}
                <span class="min-w-0 flex-1 truncate">{t('common.toggleTheme')}</span>
              </button>
              <div class="my-1 h-px bg-border/60"></div>
              {#each userSettingsItems as item, _i (_i)}
                {@const active = isActive(item.path)}
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors
                    {active
                      ? 'bg-muted text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'}"
                  onclick={() => openUserMenuRoute(item.path)}
                >
                  <item.icon class="h-4 w-4 shrink-0" />
                  <span class="min-w-0 flex-1 truncate">{t(item.label)}</span>
                </button>
              {/each}
              <div class="my-1 h-px bg-border/60"></div>
              <button type="button" class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" onclick={() => handleUserMenuAction(onLogout)}>
                <LogOut class="h-4 w-4 shrink-0" />
                <span class="min-w-0 flex-1 truncate">{t('common.logout')}</span>
              </button>
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>
    {:else if collapsed}
      <div class="flex flex-col items-center px-2 py-3">
        {#if identity}
          <Popover.Root bind:open={userMenuOpen}>
            <Popover.Trigger>
              {#snippet child({ props }: { props: Record<string, unknown> })}
                <button {...props} type="button" class="mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sidebar-foreground transition-colors hover:bg-sidebar-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" aria-label={identity.name ?? 'User'}>
                  <Avatar
                    src={(identity as Record<string, unknown>).avatar as string | undefined}
                    alt={identity.name ?? 'User'}
                    fallback={identity.name?.charAt(0).toUpperCase() ?? 'U'}
                    size="sm"
                  />
                </button>
              {/snippet}
            </Popover.Trigger>
            <Popover.Content align="start" side="right" sideOffset={10} class="w-56 p-2">
              <div class="space-y-1">
                <button type="button" class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground" onclick={() => handleUserMenuAction(toggleLocale)}>
                  <Languages class="h-4 w-4 shrink-0" />
                  <span class="min-w-0 flex-1 truncate">{t('common.switchLanguage')}</span>
                  <span class="text-xs font-semibold text-muted-foreground">{localeLabel}</span>
                </button>
                <button type="button" class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground" onclick={() => handleUserMenuAction(toggleTheme)}>
                  {#if getResolvedTheme() === 'dark'}
                    <Sun class="h-4 w-4 shrink-0" />
                  {:else}
                    <Moon class="h-4 w-4 shrink-0" />
                  {/if}
                  <span class="min-w-0 flex-1 truncate">{t('common.toggleTheme')}</span>
                </button>
                <div class="my-1 h-px bg-border/60"></div>
                {#each userSettingsItems as item, _i (_i)}
                  {@const active = isActive(item.path)}
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors
                      {active
                        ? 'bg-muted text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'}"
                    onclick={() => openUserMenuRoute(item.path)}
                  >
                    <item.icon class="h-4 w-4 shrink-0" />
                    <span class="min-w-0 flex-1 truncate">{t(item.label)}</span>
                  </button>
                {/each}
                <div class="my-1 h-px bg-border/60"></div>
                <button type="button" class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" onclick={() => handleUserMenuAction(onLogout)}>
                  <LogOut class="h-4 w-4 shrink-0" />
                  <span class="min-w-0 flex-1 truncate">{t('common.logout')}</span>
                </button>
              </div>
            </Popover.Content>
          </Popover.Root>
        {/if}
      </div>
    {:else}
      <div class="h-3"></div>
    {/if}
  </div>
</aside>
