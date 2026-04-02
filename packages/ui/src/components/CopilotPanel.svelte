<script lang="ts">
  import { getChatProvider, getChatContext } from '@svadmin/core';
  import { Sparkles, X, ChevronRight, Check, RefreshCcw } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';
  import { Button } from './ui/button/index.js';
  import MarkdownRenderer from './MarkdownRenderer.svelte';
  import TooltipButton from './TooltipButton.svelte';

  let { open = $bindable(false) } = $props<{ open?: boolean }>();

  const provider = $derived(getChatProvider());
  const ctx = $derived(getChatContext());

  let isPredicting = $state(false);
  let insightText = $state('');
  let abortController: AbortController | null = null;
  let hasFetchedForContext = $state('');

  // Automatically request insights when the context changes
  $effect(() => {
    if (!open || !provider) return;
    
    // Create a context hash to avoid refetching for the same page
    const currentHash = `${ctx.currentResource}-${ctx.currentView}-${ctx.selectedRecordId}`;
    if (hasFetchedForContext === currentHash) return;
    
    hasFetchedForContext = currentHash;
    getInsights();
  });

  async function getInsights() {
    if (!provider) return;
    
    isPredicting = true;
    insightText = '';
    
    if (abortController) abortController.abort();
    abortController = new AbortController();

    const prompt = `Analyze the current context and provide 3 quick insights or context-aware suggestions for the admin user.
Resource: ${ctx.currentResource}
View: ${ctx.currentView}
Record ID: ${ctx.selectedRecordId || 'None'}
Keep it concise, professional, and use bullet points.`;

    try {
      const result = provider.sendMessage(
        [{ id: 'insights', role: 'system', content: prompt, timestamp: Date.now() }],
        { signal: abortController.signal }
      );

      if (Symbol.asyncIterator in result) {
        for await (const chunk of result as AsyncIterable<string>) {
          insightText += chunk;
        }
      } else {
        insightText = await result;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        insightText = 'Failed to generate insights for this context.';
      }
    } finally {
      isPredicting = false;
    }
  }
</script>

{#if open}
  <div 
    class="fixed right-0 top-14 bottom-0 w-80 bg-card shadow-2xl z-40 flex flex-col shadow-sm"
    transition:slide={{ axis: 'x', duration: 300 }}
  >
    <!-- Header -->
    <div class="h-14 flex items-center justify-between px-4 bg-muted/20 shadow-sm">
      <div class="flex items-center gap-2 font-medium">
        <Sparkles class="h-4 w-4 text-primary" />
        Copilot Sidebar
      </div>
      <TooltipButton tooltip="Close panel" variant="ghost" size="icon-sm" onclick={() => open = false}>
        <X class="h-4 w-4" />
      </TooltipButton>
    </div>

    <!-- Context Meta -->
    <div class="px-4 py-3 bg-muted/10 text-xs text-muted-foreground flex flex-col gap-1 shadow-sm">
      <div class="flex items-center gap-2">
        <span class="w-16">Resource:</span>
        <span class="font-mono text-foreground">{ctx.currentResource || 'Dashboard'}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-16">View:</span>
        <span class="font-mono text-foreground capitalize">{ctx.currentView || 'List'}</span>
      </div>
      {#if ctx.selectedRecordId}
        <div class="flex items-center gap-2">
          <span class="w-16">Record ID:</span>
          <span class="font-mono text-foreground">{ctx.selectedRecordId}</span>
        </div>
      {/if}
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      
      <!-- Smart Insights Section -->
      <div>
        <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
          Smart Insights
          {#if isPredicting}
            <span class="flex items-center gap-1 text-[10px] text-primary normal-case font-medium">
              <div class="h-1 w-1 bg-primary rounded-full animate-bounce delay-75"></div>
              <div class="h-1 w-1 bg-primary rounded-full animate-bounce delay-150"></div>
              <div class="h-1 w-1 bg-primary rounded-full animate-bounce delay-300"></div>
            </span>
          {:else}
            <Button variant="ghost" size="icon-sm" class="h-5 w-5 hover:bg-muted" onclick={getInsights}>
              <RefreshCcw class="h-3 w-3" />
            </Button>
          {/if}
        </h4>
        
        <div class="text-sm">
          {#if !insightText && !isPredicting}
            <div class="text-muted-foreground italic text-center py-4 bg-muted/30 rounded-lg shadow-sm">
              No insights loaded.
            </div>
          {:else}
            <div class="bg-primary/5 p-3 rounded-xl border-primary/10 prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 shadow-sm">
              <MarkdownRenderer content={insightText} streaming={isPredicting} />
            </div>
          {/if}
        </div>
      </div>

      <!-- Quick Actions (Example static definitions for the copilot) -->
      <div>
        <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Suggested Actions
        </h4>
        <div class="space-y-2">
          {#if ctx.currentView === 'list'}
            <button class="w-full flex items-center gap-2 text-left p-2 rounded-lg hover:bg-muted border-transparent hover:border-border transition-colors text-sm shadow-sm">
              <div class="bg-background rounded shadow-sm p-1"><Check class="h-3.5 w-3.5 text-muted-foreground" /></div>
              <span>Generate monthly report</span>
            </button>
            <button class="w-full flex items-center gap-2 text-left p-2 rounded-lg hover:bg-muted border-transparent hover:border-border transition-colors text-sm shadow-sm">
              <div class="bg-background rounded shadow-sm p-1"><Check class="h-3.5 w-3.5 text-muted-foreground" /></div>
              <span>Find anomalies in {ctx.currentResource}</span>
            </button>
          {:else if ctx.currentView === 'edit' || ctx.currentView === 'create'}
            <button class="w-full flex items-center gap-2 text-left p-2 rounded-lg hover:bg-muted border-transparent hover:border-border transition-colors text-sm shadow-sm">
              <div class="bg-background rounded shadow-sm p-1"><Check class="h-3.5 w-3.5 text-muted-foreground" /></div>
              <span>Auto-fill form from context</span>
            </button>
          {:else}
            <div class="text-muted-foreground text-sm py-2 text-center">No precise actions for this view</div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
