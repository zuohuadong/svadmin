<script lang="ts">
  import type { Editor } from '@tiptap/core';
  import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/extension-bubble-menu';
  import ToolbarButton from './ToolbarButton.svelte';
  import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Code, Link as LinkIcon, Highlighter,
  } from 'lucide-svelte';
  import { t } from '@svadmin/core';

  let { editor } = $props<{
    editor: Editor;
  }>();

  let menuElement: HTMLDivElement | undefined = $state();

  let txn = $state(0);
  $effect(() => {
    const handler = () => { txn++; };
    editor.on('transaction', handler);
    return () => { editor.off('transaction', handler); };
  });

  const isBold = $derived((void txn, editor.isActive('bold')));
  const isItalic = $derived((void txn, editor.isActive('italic')));
  const isUnderline = $derived((void txn, editor.isActive('underline')));
  const isStrike = $derived((void txn, editor.isActive('strike')));
  const isCode = $derived((void txn, editor.isActive('code')));
  const isLink = $derived((void txn, editor.isActive('link')));

  // Register the bubble menu extension
  $effect(() => {
    if (!menuElement) return;

    // Check if BubbleMenu is already registered
    const existing = editor.extensionManager.extensions.find(
      (e) => e.name === 'bubbleMenu'
    );
    if (existing) return;

    // We need to register the extension dynamically
    // Tiptap handles this through the plugin system
    const plugin = TiptapBubbleMenu.configure({
      element: menuElement,
      tippyOptions: {
        duration: 150,
        placement: 'top',
        animation: 'shift-away',
      },
      shouldShow: ({ editor: e, state }) => {
        const { selection } = state;
        const { empty } = selection;
        // Don't show in code blocks or empty selections
        if (empty || e.isActive('codeBlock')) return false;
        return true;
      },
    });

    editor.registerPlugin(plugin.options.plugin(plugin.options));
    return () => {
      // cleanup handled by editor destroy
    };
  });
</script>

<div class="svadmin-bubble-menu" bind:this={menuElement} style="visibility: hidden;">
  <ToolbarButton title={t('editor.bold')} active={isBold} onclick={() => editor.chain().focus().toggleBold().run()}>
    <Bold />
  </ToolbarButton>
  <ToolbarButton title={t('editor.italic')} active={isItalic} onclick={() => editor.chain().focus().toggleItalic().run()}>
    <Italic />
  </ToolbarButton>
  <ToolbarButton title={t('editor.underline')} active={isUnderline} onclick={() => editor.chain().focus().toggleUnderline().run()}>
    <UnderlineIcon />
  </ToolbarButton>
  <ToolbarButton title={t('editor.strikethrough')} active={isStrike} onclick={() => editor.chain().focus().toggleStrike().run()}>
    <Strikethrough />
  </ToolbarButton>
  <ToolbarButton title={t('editor.code')} active={isCode} onclick={() => editor.chain().focus().toggleCode().run()}>
    <Code />
  </ToolbarButton>
  <ToolbarButton
    title={t('editor.link')}
    active={isLink}
    onclick={() => {
      if (isLink) {
        editor.chain().focus().unsetLink().run();
      } else {
        const url = window.prompt('Enter URL:');
        if (url) {
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
      }
    }}
  >
    <LinkIcon />
  </ToolbarButton>
  <ToolbarButton
    title="Highlight"
    onclick={() => editor.chain().focus().toggleHighlight().run()}
  >
    <Highlighter />
  </ToolbarButton>
</div>
