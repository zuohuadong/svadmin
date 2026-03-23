<script lang="ts">
  import { Moon, Sun } from 'lucide-svelte';
  import { Button } from './ui/button';
  import { getTheme, toggleTheme } from '@svadmin/core';

  let {
    showThemeToggle = true,
    children,
  } = $props<{
    showThemeToggle?: boolean;
    children?: import('svelte').Snippet;
  }>();
</script>

<header class="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
  <div class="flex items-center gap-4">
    <!-- Mobile sidebar toggle can go here -->
  </div>
  <div class="ml-auto flex items-center gap-4">
    {#if children}
      {@render children()}
    {/if}
    
    {#if showThemeToggle}
      <Button variant="ghost" size="icon" onclick={() => toggleTheme()} class="rounded-full">
        {#if getTheme() === 'dark'}
          <Moon class="h-5 w-5 transition-all" />
        {:else}
          <Sun class="h-5 w-5 transition-all" />
        {/if}
        <span class="sr-only">Toggle theme</span>
      </Button>
    {/if}
  </div>
</header>
