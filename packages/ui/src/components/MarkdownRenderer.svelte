<script lang="ts">
/* eslint-disable svelte/no-at-html-tags */
  import * as markedPkg from "marked";
  import * as markedHighlightPkg from "marked-highlight";
  import * as hljsPkg from "highlight.js";
  import * as DOMPurifyPkg from "isomorphic-dompurify";

  const Marked = markedPkg.Marked;
  const markedHighlight = markedHighlightPkg.markedHighlight;
  const hljsModule = hljsPkg.default || hljsPkg;
  const DOMPurify = 'default' in DOMPurifyPkg ? DOMPurifyPkg.default : DOMPurifyPkg;

  // Only safely import css if hljs exists
  if (hljsModule && Object.keys(hljsModule).length > 0) {
    import("highlight.js/styles/github-dark.css").catch(() => {});
  }

  interface Props {
    /** The raw markdown string to render */
    content: string;
    /** Whether to enable streaming/typing effect styling */
    streaming?: boolean;
    /** Custom class for the container */
    class?: string;
  }

  let { content, streaming = false, class: className = "" }: Props = $props();

  const hasMarkdownDeps = typeof Marked === "function" && typeof DOMPurify?.sanitize === "function";

  // Configure marked with syntax highlighting if available
  const markedObj = hasMarkdownDeps ? new Marked(
    markedHighlight({
      langPrefix: "hljs language-",
      highlight(code: string, lang: string) {
        const language = hljsModule.getLanguage && hljsModule.getLanguage(lang) ? lang : "plaintext";
        return hljsModule.highlight ? hljsModule.highlight(code, { language }).value : code;
      },
    }),
  ) : null;

  // Render HTML safely
  const html = $derived(
    hasMarkdownDeps
      ? DOMPurify.sanitize(markedObj?.parse(content || "") as string)
      : `<div style="white-space: pre-wrap">${String(content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`
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

  function createCopyIcon(): SVGSVGElement {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("lucide", "lucide-copy");

    const rect = document.createElementNS(svgNamespace, "rect");
    rect.setAttribute("width", "14");
    rect.setAttribute("height", "14");
    rect.setAttribute("x", "8");
    rect.setAttribute("y", "8");
    rect.setAttribute("rx", "2");
    rect.setAttribute("ry", "2");
    svg.appendChild(rect);

    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("d", "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2");
    svg.appendChild(path);

    return svg;
  }

  // Inject copy buttons into the HTML after rendering
  // We do this via action instead of raw string manipulation for safety
  function enhanceCodeBlocks(node: HTMLElement, _: string) {
    let destroyed = false;
    let enhancementScheduled = false;

    function enhance() {
      if (destroyed) return;

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
            .find((className) => className.startsWith("language-"))
            ?.replace("language-", "") || "Code";
        const languageLabel = document.createElement("span");
        languageLabel.textContent = lang;

        const copyButton = document.createElement("button");
        copyButton.type = "button";
        copyButton.className =
          "copy-btn hover:text-white transition-colors flex items-center gap-1";
        copyButton.setAttribute("aria-label", "Copy code");
        copyButton.appendChild(createCopyIcon());

        header.append(languageLabel, copyButton);
        pre.replaceWith(wrapper);
        wrapper.appendChild(header);

        const scrollContainer = document.createElement("div");
        scrollContainer.className = "overflow-x-auto p-4";
        scrollContainer.appendChild(pre);
        wrapper.appendChild(scrollContainer);
      });
    }

    function scheduleEnhancement() {
      if (enhancementScheduled || destroyed) return;
      enhancementScheduled = true;
      queueMicrotask(() => {
        enhancementScheduled = false;
        enhance();
      });
    }

    node.addEventListener("click", handleCopy);
    enhance();
    scheduleEnhancement();

    return {
      update(_newHtml: string) {
        scheduleEnhancement();
      },
      destroy() {
        destroyed = true;
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
