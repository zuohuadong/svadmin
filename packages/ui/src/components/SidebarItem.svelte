<script lang="ts">
  import type { MenuItem } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import * as Collapsible from './ui/collapsible/index.js';
  import * as Tooltip from './ui/tooltip/index.js';
  import SidebarItem from './SidebarItem.svelte';
  import {
    LayoutDashboard, FileText, Users, Settings, Home,
    ChevronDown, Folder, ExternalLink, type Icon as LucideIcon,
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
  };

  function getIcon(name?: string | any): typeof LayoutDashboard {
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

  const hasChildren = $derived(item.children && item.children.length > 0);
  const active = $derived(isActive(item.href));
  const childActive = $derived(hasActiveChild(item));
  const isExternal = $derived(item.target === '_blank' || item.href?.startsWith('http'));

  const finalHref = $derived(isExternal ? item.href : (item.href ? formatLink(item.href) : undefined));

  // Track open state — auto-open if a child is active
  let isOpen = $state(false);
  $effect(() => { if (childActive) isOpen = true; });

  const Icon = $derived(getIcon(item.icon));
  const label = $derived(getLabel(item));
</script>

{#if item.meta?.hidden}
  <!-- hidden item, render nothing -->
{:else if hasChildren && !collapsed}
  <!-- Parent node with children: render as collapsible group -->
  <Collapsible.Root bind:open={isOpen}>
    <Collapsible.Trigger
      class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
      {childActive
        ? 'text-sidebar-foreground bg-sidebar-accent/30'
        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}"
      style="padding-left: {12 + depth * 12}px"
    >
      <span class="flex items-center gap-3">
        <Icon class="h-4 w-4 flex-shrink-0" />
        <span>{label}</span>
      </span>
      <ChevronDown class="h-3.5 w-3.5 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
    </Collapsible.Trigger>
    <Collapsible.Content>
      <div class="mt-0.5 space-y-0.5" style="padding-left: {depth > 0 ? 0 : 0}px">
        {#each item.children as child}
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
          class="flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
          {active
            ? 'bg-card text-sidebar-primary shadow-sm ring-1 ring-foreground/5'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}"
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
    class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
    {active
      ? 'bg-card text-sidebar-primary shadow-sm ring-1 ring-foreground/5 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-primary before:rounded-r-md overflow-hidden relative'
      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}"
    style="padding-left: {12 + depth * 12}px"
  >
    <Icon class="h-4 w-4 flex-shrink-0" />
    <span class="flex-1">{label}</span>
    {#if isExternal}
      <ExternalLink class="h-3 w-3 opacity-50" />
    {/if}
  </a>
{/if}
