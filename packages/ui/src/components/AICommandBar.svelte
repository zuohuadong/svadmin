<script lang="ts">
  import { getResources, getChatProvider } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import { toggleTheme } from '@svadmin/core';
  import { Command } from 'cmdk-sv';
  import * as Dialog from './ui/dialog/index.js';
  import { Search, LayoutDashboard, Plus, Sun, FileText, Sparkles, Loader2, Send } from 'lucide-svelte';
  import MarkdownRenderer from './MarkdownRenderer.svelte';

  let { open = $bindable(false) } = $props<{ open?: boolean }>();
  let searchValue = $state('');
  
  const resources = getResources();
  const provider = $derived(getChatProvider());

  // AI State
  let aiMode = $state(false);
  let aiResponse = $state('');
  let isPredicting = $state(false);
  let abortController: AbortController | null = null;

  function close() {
    open = false;
    searchValue = '';
    aiMode = false;
    aiResponse = '';
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  }

  function act(fn: () => void) {
    fn();
    close();
  }

  async function askAI() {
    if (!provider || !searchValue.trim()) return;
    
    aiMode = true;
    isPredicting = true;
    aiResponse = '';
    
    if (abortController) abortController.abort();
    abortController = new AbortController();

    try {
      const result = provider.sendMessage(
        [{ id: 'cmd', role: 'user', content: searchValue, timestamp: Date.now() }],
        { signal: abortController.signal }
      );

      if (Symbol.asyncIterator in result) {
        for await (const chunk of result as AsyncIterable<string>) {
          aiResponse += chunk;
        }
      } else {
        aiResponse = await result;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        aiResponse = 'Failed to get response from AI.';
      }
    } finally {
      isPredicting = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && searchValue.trim() && !aiMode) {
      // If pressing enter on an active search, cmdk usually handles selection.
      // But if there's no selection or we want to force AI, we can intercept.
      // For simplicity, we trigger AI on Ctrl+Enter
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        askAI();
      }
    }
  }

  const itemClass = 'relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50';
</script>

<Dialog.Dialog bind:open onOpenChange={(v: boolean) => !v && close()}>
  <Dialog.DialogContent class="overflow-hidden p-0 sm:max-w-[600px] border-none shadow-2xl">
    <Command.Root
      shouldFilter={!aiMode}
      class="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground [&_[data-cmdk-group-heading]]:text-muted-foreground [&_[data-cmdk-group-heading]]:px-2 [&_[data-cmdk-group-heading]]:py-1.5 [&_[data-cmdk-group-heading]]:text-xs [&_[data-cmdk-group-heading]]:font-semibold [&_[data-cmdk-group-heading]]:uppercase [&_[data-cmdk-group-heading]]:tracking-wider"
    >
      <div class="flex items-center border-b px-3 h-12 relative" data-cmdk-input-wrapper="">
        {#if aiMode}
          <Sparkles class="mr-2 h-4 w-4 shrink-0 text-warning animate-pulse" />
        {:else}
          <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
        {/if}
        <Command.Input
          bind:value={searchValue}
          onkeydown={handleKeyDown}
          placeholder={aiMode ? "Ask AI anything..." : "Search commands or ask AI (Ctrl+Enter)..."}
          class="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
        {#if searchValue.trim() && !aiMode}
          <button 
            class="absolute right-3 flex items-center gap-1 text-[10px] font-medium text-warning bg-warning/10 hover:bg-warning/20 px-2 py-1 rounded transition-colors"
            onclick={askAI}
          >
            <Sparkles class="h-3 w-3" />
            <kbd class="font-sans">Ctrl+Enter</kbd> to Ask AI
          </button>
        {/if}
      </div>

      {#if !aiMode}
        <Command.List class="max-h-[360px] overflow-y-auto overflow-x-hidden p-1">
          <Command.Empty class="py-6 text-center text-sm text-muted-foreground">
            No standard commands found. Press <kbd class="px-1 py-0.5 rounded bg-muted border font-sans text-[10px]">Ctrl+Enter</kbd> to ask AI.
          </Command.Empty>

          <!-- Navigation -->
          <Command.Group heading={t('common.home')}>
            <Command.Item value="home" onSelect={() => act(() => navigate('/'))} class={itemClass}>
              <LayoutDashboard class="h-4 w-4 text-muted-foreground" />
              {t('common.home')}
            </Command.Item>
            {#each resources as r}
              <Command.Item value={r.name} onSelect={() => act(() => navigate(`/${r.name}`))} class={itemClass}>
                <FileText class="h-4 w-4 text-muted-foreground" />
                {r.label}
              </Command.Item>
            {/each}
          </Command.Group>

          <Command.Separator class="mx-1 my-1 h-px bg-border" />

          <!-- Actions -->
          <Command.Group heading={t('common.actions')}>
            {#each resources as r}
              <Command.Item value={`create-${r.name}`} onSelect={() => act(() => navigate(`/${r.name}/create`))} class={itemClass}>
                <Plus class="h-4 w-4 text-muted-foreground" />
                {t('common.create')} {r.label}
              </Command.Item>
            {/each}
            <Command.Item value="toggle-theme" onSelect={() => act(() => toggleTheme())} class={itemClass}>
              <Sun class="h-4 w-4 text-muted-foreground" />
              {t('common.toggleTheme')}
            </Command.Item>
          </Command.Group>
        </Command.List>
      {:else}
        <!-- AI Response Area -->
        <div class="h-[360px] max-h-[360px] overflow-y-auto p-4 bg-muted/20">
          <div class="flex items-start gap-3">
            <div class="mt-0.5 w-8 h-8 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0">
              <Sparkles class="h-4 w-4" />
            </div>
            <div class="flex-1 w-full text-sm">
              {#if !aiResponse && isPredicting}
                <div class="flex items-center gap-2 text-muted-foreground mt-1.5">
                  <Loader2 class="h-4 w-4 animate-spin" /> Thinking...
                </div>
              {:else}
                <MarkdownRenderer content={aiResponse} streaming={isPredicting} />
              {/if}
            </div>
          </div>
        </div>
        <div class="p-2 border-t flex justify-end gap-2 bg-muted/10">
          <button 
            class="text-xs px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            onclick={() => { aiMode = false; searchValue = ''; }}
          >
            Clear & Return
          </button>
        </div>
      {/if}
    </Command.Root>
  </Dialog.DialogContent>
</Dialog.Dialog>
