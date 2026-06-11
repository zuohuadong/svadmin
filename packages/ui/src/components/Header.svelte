<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
  import { Moon, Sun, Search, MonitorUp } from '@lucide/svelte';
  import { Button } from './ui/button';
  import TooltipButton from './TooltipButton.svelte';
  import { getResolvedTheme, toggleTheme } from '@svadmin/core';
  import Breadcrumbs from './Breadcrumbs.svelte';
  import { t } from '@svadmin/core/i18n';
  import { getComponentRegistry } from '../component-registry.svelte.js';

  let {
    showThemeToggle = false,
    showBreadcrumbs = true,
    showSearch = true,
    onSearchClick,
    children,
    /** Slot for additional actions on the right side of the header */
    rightActions,
    siteUrl,
  } = $props<{
    showThemeToggle?: boolean;
    showBreadcrumbs?: boolean;
    showSearch?: boolean;
    onSearchClick?: () => void;
    children?: import('svelte').Snippet;
    rightActions?: import('svelte').Snippet;
    siteUrl?: string;
  }>();

  // Retrieve optional component overrides from registry
  const registry = getComponentRegistry() || {} as any;
  const CustomBreadcrumbs = registry.Breadcrumbs;
  const CustomThemeToggle = registry.ThemeToggle;
  const CustomUserMenu = registry.UserMenu;
  const CustomNotificationPanel = registry.NotificationPanel;
</script>

<header class="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-border/70 bg-card/85 px-4 shadow-sm shadow-slate-900/[0.02] backdrop-blur-xl md:px-6">
  <div class="flex items-center gap-4">
    {#if children}
      {@render children()}
    {/if}
    {#if showBreadcrumbs}
      {#if CustomBreadcrumbs}
        <CustomBreadcrumbs />
      {:else}
        <Breadcrumbs />
      {/if}
    {/if}
  </div>
  <div class="ml-auto flex items-center gap-2">
    {#if rightActions}
      {@render rightActions()}
    {/if}

    {#if siteUrl}
      <TooltipButton tooltip={t('common.goToSite')} href={siteUrl} target="_blank" rel="noopener noreferrer" class="flex items-center justify-center rounded-xl border border-border/60 bg-background/80">
        <MonitorUp class="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
      </TooltipButton>
    {/if}

    {#if CustomNotificationPanel}
      <CustomNotificationPanel />
    {/if}

    {#if showSearch && onSearchClick}
      <Button variant="outline" size="sm" onclick={onSearchClick} class="h-10 gap-2 rounded-xl border-border/70 bg-background/85 px-3 text-muted-foreground shadow-sm shadow-slate-900/[0.02] hover:bg-muted/45 sm:min-w-56 sm:justify-start">
        <Search class="h-3.5 w-3.5" />
        <span class="hidden text-xs sm:inline">{t('common.search')}</span>
        <kbd class="ml-auto hidden items-center gap-0.5 rounded-md border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          <span class="text-xs">⌘</span>K
        </kbd>
      </Button>
    {/if}
    
    {#if showThemeToggle}
      {#if CustomThemeToggle}
        <CustomThemeToggle />
      {:else}
        <TooltipButton tooltip={t('common.toggleTheme')} onclick={() => toggleTheme()} class="rounded-xl border border-border/60 bg-background/80">
          {#if getResolvedTheme() === 'dark'}
            <Moon class="h-4 w-4 transition-all" />
          {:else}
            <Sun class="h-4 w-4 transition-all" />
          {/if}
        </TooltipButton>
      {/if}
    {/if}

    {#if CustomUserMenu}
      <CustomUserMenu />
    {/if}
  </div>
</header>
