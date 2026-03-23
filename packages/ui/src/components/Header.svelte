<script lang="ts">
  import { Moon, Sun, Search } from 'lucide-svelte';
  import { Button } from './ui/button';
  import TooltipButton from './TooltipButton.svelte';
  import { getResolvedTheme, toggleTheme } from '@svadmin/core';
  import Breadcrumbs from './Breadcrumbs.svelte';
  import { t } from '@svadmin/core/i18n';

  let {
    showThemeToggle = true,
    showBreadcrumbs = true,
    showSearch = true,
    onSearchClick,
    children,
  } = $props<{
    showThemeToggle?: boolean;
    showBreadcrumbs?: boolean;
    showSearch?: boolean;
    onSearchClick?: () => void;
    children?: import('svelte').Snippet;
  }>();
</script>

<header class="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
  <div class="flex items-center gap-4">
    {#if showBreadcrumbs}
      <Breadcrumbs />
    {/if}
  </div>
  <div class="ml-auto flex items-center gap-2">
    {#if children}
      {@render children()}
    {/if}

    {#if showSearch && onSearchClick}
      <Button variant="outline" size="sm" onclick={onSearchClick} class="gap-2 text-muted-foreground">
        <Search class="h-4 w-4" />
        <span class="hidden sm:inline text-xs">Search...</span>
        <kbd class="hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <span class="text-xs">⌘</span>K
        </kbd>
      </Button>
    {/if}
    
    {#if showThemeToggle}
      <TooltipButton tooltip={t('common.toggleTheme')} onclick={() => toggleTheme()} class="rounded-full">
        {#if getResolvedTheme() === 'dark'}
          <Moon class="h-5 w-5 transition-all" />
        {:else}
          <Sun class="h-5 w-5 transition-all" />
        {/if}
      </TooltipButton>
    {/if}
  </div>
</header>
