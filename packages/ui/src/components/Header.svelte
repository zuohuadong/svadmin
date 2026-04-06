<script lang="ts">
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
  const registry = getComponentRegistry();
  const CustomBreadcrumbs = registry.Breadcrumbs;
  const CustomThemeToggle = registry.ThemeToggle;
  const CustomUserMenu = registry.UserMenu;
  const CustomNotificationPanel = registry.NotificationPanel;
</script>

<header class="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between bg-card/60 backdrop-blur-md px-4 md:px-6">
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
      <TooltipButton tooltip={t('common.goToSite') || 'Site'} href={siteUrl} target="_blank" rel="noopener noreferrer" class="rounded-full flex items-center justify-center">
        <MonitorUp class="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
      </TooltipButton>
    {/if}

    {#if CustomNotificationPanel}
      <CustomNotificationPanel />
    {/if}

    {#if showSearch && onSearchClick}
      <Button variant="outline" size="sm" onclick={onSearchClick} class="gap-2 text-muted-foreground h-8 px-3">
        <Search class="h-3.5 w-3.5" />
        <span class="hidden sm:inline text-xs">Search...</span>
        <kbd class="hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium font-mono text-muted-foreground">
          <span class="text-xs">⌘</span>K
        </kbd>
      </Button>
    {/if}
    
    {#if showThemeToggle}
      {#if CustomThemeToggle}
        <CustomThemeToggle />
      {:else}
        <TooltipButton tooltip={t('common.toggleTheme')} onclick={() => toggleTheme()} class="rounded-full">
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

