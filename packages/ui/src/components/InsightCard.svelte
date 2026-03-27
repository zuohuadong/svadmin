<script lang="ts">
  import { getChatProvider } from '@svadmin/core';
  import { Sparkles, RefreshCcw, Loader2 } from 'lucide-svelte';
  import { Button } from './ui/button/index.js';
  import MarkdownRenderer from './MarkdownRenderer.svelte';

  interface Props {
    title?: string;
    context: string;
    autoFetch?: boolean;
    class?: string;
  }

  let { title = 'AI Insights', context, autoFetch = true, class: className = '' }: Props = $props();

  const provider = $derived(getChatProvider());

  let isPredicting = $state(false);
  let insightText = $state('');
  let abortController: AbortController | null = null;
  let hasFetchedForContext = $state('');

  $effect(() => {
    if (autoFetch && context && provider && hasFetchedForContext !== context) {
      hasFetchedForContext = context;
      getInsights();
    }
  });

  export async function getInsights() {
    if (!provider || !context) return;
    
    isPredicting = true;
    insightText = '';
    
    if (abortController) abortController.abort();
    abortController = new AbortController();

    const prompt = `Based on the following data/context, generate 3 concise, highly professional insights. 
Use bullet points. Do not include introductory text like "Here are the insights".

Data Context:
${context}`;

    try {
      const result = provider.sendMessage(
        [{ id: 'insights', role: 'user', content: prompt, timestamp: Date.now() }],
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
        insightText = 'Failed to generate insights.';
      }
    } finally {
      isPredicting = false;
    }
  }
</script>

<div class="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col {className}">
  <div class="flex items-center justify-between p-4 border-b">
    <div class="flex items-center gap-2 font-medium">
      <Sparkles class="h-4 w-4 text-amber-500" />
      {title}
    </div>
    <Button variant="ghost" size="icon-sm" class="h-6 w-6" onclick={getInsights} disabled={isPredicting || !provider}>
      <RefreshCcw class="h-3 w-3 {isPredicting ? 'animate-spin' : ''}" />
    </Button>
  </div>
  
  <div class="p-4 flex-1">
    {#if !provider}
      <div class="text-sm text-muted-foreground italic flex items-center justify-center h-full">
        ChatProvider not configured.
      </div>
    {:else if isPredicting && !insightText}
      <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground h-full py-4">
        <Loader2 class="h-4 w-4 animate-spin" /> Analyzing data...
      </div>
    {:else if !insightText}
      <div class="text-sm text-muted-foreground italic flex items-center justify-center h-full">
        No insights available. Click refresh to analyze.
      </div>
    {:else}
      <div class="text-sm prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
        <MarkdownRenderer content={insightText} streaming={isPredicting} />
      </div>
    {/if}
  </div>
</div>
