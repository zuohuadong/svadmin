<script module lang="ts">
  import type { Component } from 'svelte';

  type RichTextEditorProps = {
    value?: string;
    placeholder?: string;
    editable?: boolean;
    autofocus?: boolean | 'start' | 'end';
    maxLength?: number;
    showToolbar?: boolean;
    showBubbleMenu?: boolean;
    showFloatingMenu?: boolean;
    showCharCount?: boolean;
    preset?: 'full' | 'minimal' | 'prose';
    extensions?: unknown[];
    onUpload?: (file: File) => Promise<string>;
    onchange?: (html: string) => void;
    class?: string;
    minHeight?: string;
    maxHeight?: string;
    lowlight?: unknown;
  };

  type RichTextEditorModule = {
    default: Component<RichTextEditorProps>;
  };

  let editorPromise: Promise<RichTextEditorModule> | undefined;

  export function loadRichTextEditor(): Promise<RichTextEditorModule> {
    editorPromise ??= import('@svadmin/editor/components/Editor.svelte')
      .then((module) => module as unknown as RichTextEditorModule)
      .catch((error: unknown) => {
        editorPromise = undefined;
        throw error;
      });
    return editorPromise;
  }
</script>

<script lang="ts">
  let {
    id,
    value = $bindable(''),
    placeholder,
    editable = true,
    disabled = false,
    autofocus,
    maxLength,
    showToolbar,
    showBubbleMenu,
    showFloatingMenu,
    showCharCount,
    preset,
    extensions,
    onUpload,
    onchange,
    class: className,
    minHeight,
    maxHeight,
    lowlight,
  }: RichTextEditorProps & {
    id?: string;
    disabled?: boolean;
  } = $props();

  const resolvedEditable = $derived(editable && !disabled);
  const editorModulePromise = loadRichTextEditor();
</script>

<div {id} class="contents">
  {#await editorModulePromise}
    <div class="flex min-h-40 items-center justify-center" role="status" aria-live="polite">
      <span class="text-sm text-muted-foreground">Loading editor...</span>
    </div>
  {:then editorModule}
    {@const Editor = editorModule.default}
    <Editor
      bind:value
      {placeholder}
      editable={resolvedEditable}
      {autofocus}
      {maxLength}
      {showToolbar}
      {showBubbleMenu}
      {showFloatingMenu}
      {showCharCount}
      {preset}
      {extensions}
      {onUpload}
      {onchange}
      class={className}
      {minHeight}
      {maxHeight}
      {lowlight}
    />
  {:catch}
    <div class="flex min-h-40 items-center justify-center" role="alert">
      <span class="text-sm text-destructive">Unable to load the rich text editor.</span>
    </div>
  {/await}
</div>
