<script lang="ts">
  import type { MenuItem } from '@svadmin/core';
  import * as Collapsible from './ui/collapsible/index.js';
  import * as Tooltip from './ui/tooltip/index.js';
  import SidebarItem from './SidebarItem.svelte';
  import {
    LayoutDashboard, FileText, Users, Settings, Home,
    ChevronDown, Folder, ExternalLink, Repeat, ClipboardCheck, SlidersHorizontal, AlertTriangle,
    Barcode, FolderTree, Building2, Warehouse, BriefcaseBusiness, Handshake, UserRoundCheck,
    CalendarCheck, KeyRound, MapPinned,
  } from '@lucide/svelte';

  import { formatLink } from '@svadmin/core/router';
  
  let { item, currentPath, collapsed = false, depth = 0 }: {
    item: MenuItem;
    currentPath: string;
    collapsed?: boolean;
    depth?: number;
  } = $props();

  const iconMap: Record<string, typeof LayoutDashboard> = {
    dashboard: LayoutDashboard,
    posts: FileText,
    users: Users,
    settings: Settings,
    home: Home,
    folder: Folder,
    repeat: Repeat,
    'clipboard-check': ClipboardCheck,
    'sliders-horizontal': SlidersHorizontal,
    'alert-triangle': AlertTriangle,
    'barcode': Barcode,
    'folder-tree': FolderTree,
    'building-2': Building2,
    'warehouse': Warehouse,
    'briefcase-business': BriefcaseBusiness,
    handshake: Handshake,
    'user-round-check': UserRoundCheck,
    'calendar-check': CalendarCheck,
    'key-round': KeyRound,
    'map-pinned': MapPinned,
  };

  function getIcon(name?: string | typeof LayoutDashboard): typeof LayoutDashboard {
    if (!name) return depth === 0 ? Settings : Folder;
    if (typeof name !== 'string') return name; // if it's already a component
    return iconMap[name] ?? Settings;
  }

  function getLabel(mi: MenuItem): string {
    return mi.label ?? mi.name;
  }

  function isActive(itemHref: string | undefined): boolean {
    if (!itemHref) return false;
    if (itemHref === '/') return currentPath === '/';
    return currentPath.startsWith(itemHref) && (currentPath.length === itemHref.length || currentPath[itemHref.length] === '/');
  }

  /** Check if any child (recursively) is active — used to auto-open parent groups */
  function hasActiveChild(menuItem: MenuItem): boolean {
    if (isActive(menuItem.href)) return true;
    return menuItem.children?.some((c: MenuItem) => hasActiveChild(c)) ?? false;
  }

  function getItemBadge(menuItem: MenuItem): string | undefined {
    const meta = menuItem.meta as (MenuItem['meta'] & { badge?: unknown }) | undefined;
    return typeof meta?.badge === 'string' ? meta.badge : undefined;
  }

  function aggregateBadges(menuItems: MenuItem[] | undefined): string | undefined {
    const total = menuItems?.reduce((sum, menuItem) => {
      const ownBadge = Number(getItemBadge(menuItem));
      const childBadge = Number(aggregateBadges(menuItem.children));
      return sum + (Number.isFinite(ownBadge) ? ownBadge : 0) + (Number.isFinite(childBadge) ? childBadge : 0);
    }, 0) ?? 0;

    return total > 0 ? String(total) : undefined;
  }

  const hasChildren = $derived(item.children && item.children.length > 0);
  const active = $derived(isActive(item.href));
  const childActive = $derived(hasActiveChild(item));
  const isExternal = $derived(item.target === '_blank' || item.href?.startsWith('http'));
  const badge = $derived(getItemBadge(item));
  const childrenBadge = $derived(aggregateBadges(item.children));

  const finalHref = $derived(isExternal ? item.href : (item.href ? formatLink(item.href) : undefined));
  // Auto-open the active branch once, then respect manual collapse/expand.
  let isOpen = $state(false);
  let touchedOpen = $state(false);

  function setOpen(nextOpen: boolean) {
    touchedOpen = true;
    isOpen = nextOpen;
  }

  $effect(() => {
    if (childActive && !touchedOpen && !isOpen) isOpen = true;
  });

  const Icon = $derived(getIcon(item.icon));
  const label = $derived(getLabel(item));
</script>

{#if item.meta?.hidden}
  <!-- hidden item, render nothing -->
{:else if hasChildren && !collapsed}
  <!-- Parent node with children: render as collapsible group -->
  <Collapsible.Root open={isOpen} onOpenChange={setOpen}>
    <Collapsible.Trigger
      class="flex w-full items-center justify-between rounded-xl px-3 {depth === 1 ? 'py-1.5' : 'py-2'} text-sm font-medium transition-all duration-200
      {childActive
        ? 'text-primary font-semibold'
        : 'text-sidebar-foreground/68 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground'}"
      style="padding-left: {depth === 0 ? 12 : 4 + (depth - 1) * 12}px"
      data-sidebar={depth === 0 ? "menu-button" : "menu-sub-button"}
      data-active={childActive ? "true" : "false"}
    >
      <span class="flex items-center gap-3">
        <Icon class="h-4 w-4 flex-shrink-0" />
        <span>{label}</span>
      </span>
      <span class="ml-2 flex items-center gap-2">
        {#if childrenBadge}
          <span class="rounded-full {childActive ? 'bg-primary/12 text-primary' : 'bg-sidebar-accent text-sidebar-foreground/60'} px-2 py-0.5 text-[10px] font-semibold">{childrenBadge}</span>
        {/if}
        <ChevronDown class="h-3.5 w-3.5 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
      </span>
    </Collapsible.Trigger>
    <Collapsible.Content>
      <div
        class="mt-0.5 {depth >= 1 ? 'divide-y divide-border/45' : 'space-y-0'}"
        style="padding-left: {depth > 0 ? 0 : 0}px"
        data-sidebar="menu-sub"
      >
        {#each item.children as child, _i (_i)}
          <SidebarItem item={child} {currentPath} {collapsed} depth={depth + 1} />
        {/each}
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
{:else if collapsed}
  <!-- Collapsed sidebar: icon-only with tooltip -->
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props }: { props: Record<string, unknown> })}
        <a
          {...props}
          href={finalHref}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          class="mx-auto flex h-10 w-10 items-center justify-center text-sm font-medium transition-colors duration-200
          {active
            ? 'text-primary'
            : 'text-sidebar-foreground/68 hover:text-sidebar-foreground'}"
          data-sidebar={depth === 0 ? "menu-button" : "menu-sub-button"}
          data-active={active ? "true" : "false"}
        >
          <Icon class="h-4 w-4 flex-shrink-0" />
        </a>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content side="right">
      {label}
    </Tooltip.Content>
  </Tooltip.Root>
{:else}
  <!-- Leaf node: render as a link -->
  <a
    href={finalHref}
    target={isExternal ? '_blank' : undefined}
    rel={isExternal ? 'noopener noreferrer' : undefined}
    class="relative flex items-center gap-3 px-3 {depth === 1 ? 'py-1.5' : 'py-2'} text-sm font-medium transition-all duration-200 {depth >= 2 ? 'first:rounded-t-xl last:rounded-b-xl' : 'rounded-xl'}
    {active
      ? 'text-primary font-semibold'
      : 'text-sidebar-foreground/68 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground'}"
    style="padding-left: {12 + depth * 12}px"
    data-sidebar={depth === 0 ? "menu-button" : "menu-sub-button"}
    data-active={active ? "true" : "false"}
  >
    <Icon class="h-4 w-4 flex-shrink-0" />
    <span class="flex-1">{label}</span>
    {#if isExternal}
      <ExternalLink class="h-3 w-3 opacity-50" />
    {/if}
    {#if badge}
      <span class="rounded-full {active ? 'bg-primary/12 text-primary' : 'bg-sidebar-accent text-sidebar-foreground/60'} px-2 py-0.5 text-[10px] font-semibold">{badge}</span>
    {/if}
  </a>
{/if}
