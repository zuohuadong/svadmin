<script lang="ts">
  import { getResources } from '@svadmin/core';
  import type { Identity } from '@svadmin/core';
  import { currentPath, navigate } from '@svadmin/core/router';
  import { t, getLocale, setLocale, getAvailableLocales } from '@svadmin/core/i18n';
  import { toggleTheme, getResolvedTheme, colorThemes, getColorTheme, setColorTheme, canAccessAsync } from '@svadmin/core';
  import { Button } from './ui/button/index.js';
  import * as Tooltip from './ui/tooltip/index.js';
  import * as DropdownMenu from './ui/dropdown-menu/index.js';
  import { Separator } from './ui/separator/index.js';
  import { ScrollArea } from './ui/scroll-area/index.js';
  import * as Collapsible from './ui/collapsible/index.js';
  import { Avatar } from './ui/avatar/index.js';
  import {
    LayoutDashboard, FileText, Users, Settings, Home,
    ChevronLeft, ChevronRight, ChevronDown, LogOut, Sun, Moon, Languages, Palette
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
    return path.startsWith(itemPath);
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
</script>

<svelte:window onhashchange={onHashChange} />

<aside
  aria-label="Sidebar navigation"
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
  <nav aria-label="Main menu" class="py-4 px-2 space-y-1">
    {#each navGroups as group}
      {#if group.name && !collapsed}
        <!-- Grouped section with Collapsible -->
        <Collapsible.Root open={openGroups.has(group.name)} onOpenChange={(isOpen) => {
          const next = new Set(openGroups);
          if (isOpen) next.add(group.name!); else next.delete(group.name!);
          openGroups = next;
        }}>
          <Collapsible.Trigger
            class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition-colors"
          >
            <span>{group.name}</span>
            <ChevronDown class="h-3 w-3 transition-transform {openGroups.has(group.name) ? 'rotate-180' : ''}" />
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div class="mt-1 space-y-0.5 pl-1">
              {#each group.items as item}
                {@const active = isActive(item.path)}
                <a
                  href={`#${item.path}`}
                  class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  class:bg-sidebar-accent={active}
                  class:text-sidebar-accent-foreground={active}
                  class:text-sidebar-foreground={!active}
                  class:hover:bg-sidebar-accent={!active}
                >
                  <item.Icon class="h-5 w-5 flex-shrink-0" />
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
      {/if}
    {/each}
  </nav>
  </ScrollArea>

  <!-- Footer -->
  <Separator class="bg-sidebar-border" />
  <div class="p-3 space-y-2">
    <!-- Color theme picker via DropdownMenu -->
    {#if !collapsed}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="ghost"
              class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors h-auto justify-start"
            >
              <Palette class="h-4 w-4" />
              <span class="flex-1 text-left text-xs">{t('common.toggleTheme')}</span>
              <span
                class="h-4 w-4 rounded-full ring-1 ring-offset-1 ring-offset-sidebar"
                style="background-color: {colorThemes.find(c => c.id === getColorTheme())?.color ?? '#3b82f6'}; --tw-ring-color: {colorThemes.find(c => c.id === getColorTheme())?.color ?? '#3b82f6'}"
              ></span>
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" class="w-40">
          {#each colorThemes as ct}
            <DropdownMenu.Item onclick={() => setColorTheme(ct.id)} class="gap-2">
              <span
                class="h-4 w-4 rounded-full {getColorTheme() === ct.id ? 'ring-2 ring-offset-2 scale-110' : 'opacity-70'}"
                style="background-color: {ct.color}; {getColorTheme() === ct.id ? `--tw-ring-color: ${ct.color}` : ''}"
              ></span>
              {ct.label}
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {/if}

    {#if !collapsed && identity}
      <div class="flex items-center gap-3 rounded-lg px-2 py-2">
        <Avatar
          src={(identity as Record<string, unknown>).avatar as string | undefined}
          alt={identity.name ?? 'User'}
          fallback={identity.name?.charAt(0).toUpperCase() ?? 'U'}
          size="sm"
        />
        <div class="flex-1 min-w-0">
          <p class="truncate text-sm font-medium text-sidebar-foreground">{identity.name}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onclick={toggleLocale} class="text-sidebar-foreground" title={t('common.switchLanguage')}>
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
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="ghost" size="icon" onclick={toggleLocale} class="w-full text-sidebar-foreground" title={t('common.switchLanguage')}>
              <span class="text-xs font-bold">{localeLabel}</span>
            </Button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content side="right">{t('common.switchLanguage')}</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="ghost" size="icon" onclick={toggleTheme} class="w-full text-sidebar-foreground" title={t('common.toggleTheme')}>
              {#if getResolvedTheme() === 'dark'}
                <Sun class="h-5 w-5" />
              {:else}
                <Moon class="h-5 w-5" />
              {/if}
            </Button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content side="right">{t('common.toggleTheme')}</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="ghost" size="icon" onclick={onLogout} class="w-full text-sidebar-foreground hover:text-destructive" title={t('common.logout')}>
              <LogOut class="h-5 w-5" />
            </Button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content side="right">{t('common.logout')}</Tooltip.Content>
      </Tooltip.Root>
    {:else}
      <div class="flex gap-1">
        <Button variant="ghost" size="icon" onclick={toggleLocale} class="flex-1 text-sidebar-foreground" title={t('common.switchLanguage')}>
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
