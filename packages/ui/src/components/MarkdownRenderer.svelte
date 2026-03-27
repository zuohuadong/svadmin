<script lang="ts">
  // @ts-expect-error - missing types
  import { Marked } from 'marked';
  // @ts-expect-error - missing types
  import { markedHighlight } from 'marked-highlight';
  // @ts-expect-error - missing types
  import hljs from 'highlight.js';
  import 'highlight.js/styles/github-dark.css'; // or your preferred theme
  // @ts-expect-error - missing types
  import DOMPurify from 'isomorphic-dompurify';
  import { Check, Copy } from 'lucide-svelte';
  import { Button } from './ui/button/index.js';

  interface Props {
    /** The raw markdown string to render */
    content: string;
    /** Whether to enable streaming/typing effect styling */
    streaming?: boolean;
    /** Custom class for the container */
    class?: string;
  }

  let { content, streaming = false, class: className = '' }: Props = $props();

  // Configure marked with syntax highlighting
  const marked = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code: string, lang: string) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  // Render HTML safely
  const html = $derived(DOMPurify.sanitize(marked.parse(content || '') as string));

  // Handle copy code blocks
  let copiedBlock = $state<string | null>(null);

  function handleCopy(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const button = target.closest('.copy-btn');
    if (!button) return;

    const pre = button.closest('.code-block-wrapper')?.querySelector('pre');
    if (!pre) return;

    const code = pre.textContent || '';
    navigator.clipboard.writeText(code);

    const id = Math.random().toString(36);
    copiedBlock = id;
    button.setAttribute('data-copied-id', id);

    setTimeout(() => {
      if (copiedBlock === id) copiedBlock = null;
    }, 2000);
  }

  // Inject copy buttons into the HTML after rendering
  // We do this via action instead of raw string manipulation for safety
  function enhanceCodeBlocks(node: HTMLElement, _: string) {
    return {
      update(newHtml: string) {
        // Find all pre > code blocks that don't have wrappers yet
        const pres = node.querySelectorAll('pre:not(.enhanced)');
        pres.forEach(pre => {
          pre.classList.add('enhanced');
          const wrapper = document.createElement('div');
          wrapper.className = 'code-block-wrapper group relative my-4 rounded-md bg-foreground/95';
          
          const header = document.createElement('div');
          header.className = 'flex items-center justify-between px-4 py-2 text-xs text-zinc-400 border-b border-zinc-800';
          
          const lang = Array.from(pre.querySelector('code')?.classList || []).find(c => c.startsWith('language-'))?.replace('language-', '') || 'Code';
          header.innerHTML = `
            <span>${lang}</span>
            <button class="copy-btn hover:text-white transition-colors flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          `;
          
          pre.replaceWith(wrapper);
          wrapper.appendChild(header);
          
          const scrollContainer = document.createElement('div');
          scrollContainer.className = 'overflow-x-auto p-4';
          scrollContainer.appendChild(pre);
          wrapper.appendChild(scrollContainer);
        });

        // Add event listener for copy buttons
        node.addEventListener('click', handleCopy);
      },
      destroy() {
        node.removeEventListener('click', handleCopy);
      }
    };
  }
</script>

<div 
  class="prose prose-sm dark:prose-invert max-w-none break-words {className}"
  class:streaming={streaming}
  use:enhanceCodeBlocks={html}
>
  {@html html}
</div>

<style>
  /* Base Markdown Styles */
  :global(.prose) {
    line-height: 1.6;
  }
  :global(.prose p) {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  
  /* Streaming cursor effect */
  .streaming > :global(*:last-child)::after {
    content: '▋';
    display: inline-block;
    animation: blink 1s step-start infinite;
    margin-left: 2px;
    vertical-align: baseline;
    color: currentColor;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }

  /* Handle copied state for dynamically injected buttons */
  :global(.copy-btn[data-copied-id]) {
    color: #10b981; /* Tailwind emerald-500 */
  }
  :global(.copy-btn[data-copied-id] svg) {
    /* Swap to Check icon */
    content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>');
  }
</style>
