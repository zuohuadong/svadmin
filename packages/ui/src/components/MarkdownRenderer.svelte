<script lang="ts">
  // @ts-expect-error - missing types
  import { Marked } from "marked";
  // @ts-expect-error - missing types
  import { markedHighlight } from "marked-highlight";
  // @ts-expect-error - missing types
  import * as hljsModule from "highlight.js";
  const hljs = "default" in hljsModule ? hljsModule.default : hljsModule;
  import "highlight.js/styles/github-dark.css"; // or your preferred theme
  // @ts-expect-error - missing types
  import DOMPurify from "isomorphic-dompurify";
  import { Check, Copy } from "lucide-svelte";
  import { Button } from "./ui/button/index.js";

  interface Props {
    /** The raw markdown string to render */
    content: string;
    /** Whether to enable streaming/typing effect styling */
    streaming?: boolean;
    /** Custom class for the container */
    class?: string;
  }

  let { content, streaming = false, class: className = "" }: Props = $props();

  // Configure marked with syntax highlighting
  const marked = new Marked(
    markedHighlight({
      langPrefix: "hljs language-",
      highlight(code: string, lang: string) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    }),
  );

  // Render HTML safely
  const html = $derived(
    DOMPurify.sanitize(marked.parse(content || "") as string),
  );

  // Handle copy code blocks
  let copiedBlock = $state<string | null>(null);

  function handleCopy(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const button = target.closest(".copy-btn");
    if (!button) return;

    const pre = button.closest(".code-block-wrapper")?.querySelector("pre");
    if (!pre) return;

    const code = pre.textContent || "";
    navigator.clipboard.writeText(code);

    const id = Math.random().toString(36);
    copiedBlock = id;
    button.setAttribute("data-copied-id", id);

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
        const pres = node.querySelectorAll("pre:not(.enhanced)");
        pres.forEach((pre) => {
          pre.classList.add("enhanced");
          const wrapper = document.createElement("div");
          wrapper.className =
            "code-block-wrapper group relative my-4 rounded-md bg-foreground/95";

          const header = document.createElement("div");
          header.className =
            "flex items-center justify-between px-4 py-2 text-xs text-zinc-400 border-b border-zinc-800";

          const lang =
            Array.from(pre.querySelector("code")?.classList || [])
              .find((c) => c.startsWith("language-"))
              ?.replace("language-", "") || "Code";
          header.innerHTML = `
            <span>${lang}</span>
            <button class="copy-btn hover:text-white transition-colors flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          `;

          pre.replaceWith(wrapper);
          wrapper.appendChild(header);

          const scrollContainer = document.createElement("div");
          scrollContainer.className = "overflow-x-auto p-4";
          scrollContainer.appendChild(pre);
          wrapper.appendChild(scrollContainer);
        });

        // Add event listener for copy buttons
        node.addEventListener("click", handleCopy);
      },
      destroy() {
        node.removeEventListener("click", handleCopy);
      },
    };
  }
</script>

<div 
  class="prose prose-sm dark:prose-invert max-w-none wrap-break-word {className}"
  class:streaming={streaming}
  use:enhanceCodeBlocks={html}
>
  {@html html}
</div>
