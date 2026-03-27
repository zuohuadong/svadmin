<script lang="ts">
  import { Input } from './ui/input/index.js';
  import type { ChatProvider } from '@svadmin/core';

  interface Props {
    /** The bound value of the input */
    value: string;
    /** The chat provider to generate suggestions */
    provider?: ChatProvider;
    /** Context given to the AI to help it predict the text */
    context?: string;
    /** Standard input props */
    placeholder?: string;
    class?: string;
    id?: string;
    disabled?: boolean;
    name?: string;
    type?: string;
  }

  let { 
    value = $bindable(), 
    provider, 
    context = '', 
    placeholder = '', 
    class: className = '', 
    id, 
    disabled = false, 
    name, 
    type = 'text' 
  }: Props = $props();

  let suggestion = $state('');
  let isPredicting = $state(false);
  let abortController: AbortController | null = null;
  let predictTimer: ReturnType<typeof setTimeout> | null = null;

  // The ghost text shows the suggestion, but only the part *after* what the user has typed
  // It only displays if the suggestion actually starts with the current value
  const ghostText = $derived.by(() => {
    if (!suggestion || !value) return '';
    const lowerVal = value.toLowerCase();
    const lowerSugg = suggestion.toLowerCase();
    
    if (lowerSugg.startsWith(lowerVal) && suggestion.length > value.length) {
      // Preserve original casing from the suggestion but append only the suffix
      return value + suggestion.slice(value.length);
    }
    return '';
  });

  const suffixText = $derived(ghostText ? ghostText.slice(value.length) : '');

  async function predict() {
    if (!provider || !value.trim()) {
      suggestion = '';
      return;
    }

    isPredicting = true;
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    try {
      const prompt = `You are an autocomplete engine. The user is typing: "${value}". 
Context: ${context}.
Provide ONLY the most likely completion of the exact phrase the user is typing. 
Include the user's input in your returned string. 
Do not include any other text, Markdown formatting, quotes, or explanations.`;

      const result = provider.sendMessage(
        [{ id: 'prompt', role: 'user', content: prompt, timestamp: Date.now() }],
        { signal: abortController.signal }
      );

      suggestion = '';
      
      // Handle streaming or Promise responses seamlessly
      if (Symbol.asyncIterator in result) {
        for await (const chunk of result as AsyncIterable<string>) {
          suggestion += chunk;
        }
      } else {
        suggestion = await result;
      }
      
      // Clean up the suggestion
      suggestion = suggestion.trim().replace(/^["']|["']$/g, '');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        suggestion = '';
      }
    } finally {
      isPredicting = false;
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;

    // Reset suggestion immediately if it no longer matches
    if (suggestion && !suggestion.toLowerCase().startsWith(value.toLowerCase())) {
      suggestion = '';
    }

    if (predictTimer) clearTimeout(predictTimer);
    
    // Debounce prediction
    predictTimer = setTimeout(() => {
      predict();
    }, 500);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab' && suffixText) {
      e.preventDefault(); // Prevent standard tab navigation
      value = ghostText;
      suggestion = ''; // Clear suggestion once accepted
    }
  }

</script>

<div class="relative w-full {className}">
  <!-- Ghost Text Layer (positioned exactly beneath the actual text) -->
  {#if suffixText}
    <div 
      class="absolute inset-0 pointer-events-none flex items-center px-3 text-sm font-medium"
      aria-hidden="true"
    >
      <span class="opacity-0">{value}</span>
      <span class="text-muted-foreground/40">{suffixText}</span>
    </div>
  {/if}

  <!-- Actual Input Layer -->
  <Input
    {id}
    {name}
    {type}
    {disabled}
    {placeholder}
    value={value}
    oninput={handleInput}
    onkeydown={handleKeyDown}
    class="bg-transparent relative z-10 w-full"
  />

  <!-- Loading indicator -->
  {#if isPredicting}
    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <div class="h-1.5 w-1.5 rounded-full bg-primary/50 animate-pulse"></div>
    </div>
  {/if}
</div>
