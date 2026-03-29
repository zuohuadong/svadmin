<script lang="ts">
  import type { Editor } from '@tiptap/core';
  import { ImageIcon, Upload, Link as LinkIcon, X } from 'lucide-svelte';
  import { t } from '@svadmin/core';

  let { editor, onUpload, onclose } = $props<{
    editor: Editor;
    onUpload?: (file: File) => Promise<string>;
    onclose?: () => void;
  }>();

  let mode: 'url' | 'upload' = $state('url');
  let url = $state('');
  let alt = $state('');
  let uploading = $state(false);
  let dragover = $state(false);
  let fileInput: HTMLInputElement | undefined = $state();

  function insertByUrl() {
    if (!url.trim()) return;
    editor.chain().focus().setImage({ src: url, alt: alt || undefined }).run();
    url = '';
    alt = '';
    onclose?.();
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length || !onUpload) return;
    uploading = true;
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const uploadedUrl = await onUpload(file);
        editor.chain().focus().setImage({ src: uploadedUrl, alt: file.name }).run();
      }
    } catch (e) {
      console.error('Image upload failed:', e);
    } finally {
      uploading = false;
      onclose?.();
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragover = false;
    handleFiles(e.dataTransfer?.files ?? null);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    dragover = true;
  }

  function handleDragLeave() {
    dragover = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      insertByUrl();
    }
    if (e.key === 'Escape') {
      onclose?.();
    }
  }
</script>

<div class="svadmin-color-picker" style="min-width: 300px;">
  <div style="display: flex; gap: 2px; margin-bottom: 8px;">
    <button
      type="button"
      class="svadmin-toolbar-btn"
      style="width: auto; padding: 0 10px; font-size: 12px; gap: 4px; display: flex; align-items: center;"
      data-active={mode === 'url'}
      onclick={() => { mode = 'url'; }}
    >
      <LinkIcon style="width: 12px; height: 12px;" />
      URL
    </button>
    {#if onUpload}
      <button
        type="button"
        class="svadmin-toolbar-btn"
        style="width: auto; padding: 0 10px; font-size: 12px; gap: 4px; display: flex; align-items: center;"
        data-active={mode === 'upload'}
        onclick={() => { mode = 'upload'; }}
      >
        <Upload style="width: 12px; height: 12px;" />
        Upload
      </button>
    {/if}
  </div>

  {#if mode === 'url'}
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <input
        class="svadmin-link-input"
        type="url"
        placeholder={t('editor.image.url')}
        bind:value={url}
        onkeydown={handleKeydown}
        style="width: 100%;"
      />
      <input
        class="svadmin-link-input"
        type="text"
        placeholder="Alt (optional)"
        bind:value={alt}
        onkeydown={handleKeydown}
        style="width: 100%;"
      />
      <button
        type="button"
        class="svadmin-toolbar-btn"
        style="width: 100%; font-size: 13px; height: 34px; background: hsl(var(--primary) / 0.1); color: var(--editor-primary); font-weight: 500;"
        onclick={insertByUrl}
        disabled={!url.trim()}
      >
        {t('editor.image.apply') || t('editor.link.apply')}
      </button>
    </div>
  {:else}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      style="
        border: 2px dashed {dragover ? 'var(--editor-primary)' : 'var(--editor-border)'};
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.15s ease, background 0.15s ease;
        background: {dragover ? 'hsl(var(--primary) / 0.05)' : 'transparent'};
      "
      ondrop={handleDrop}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      onclick={() => fileInput?.click()}
    >
      {#if uploading}
        <div style="color: var(--editor-muted); font-size: 13px;">{t('editor.image.uploading')}</div>
      {:else}
        <ImageIcon style="width: 24px; height: 24px; margin: 0 auto 8px; color: var(--editor-muted);" />
        <div style="font-size: 13px; color: var(--editor-muted);">
          {t('editor.image.upload')}
        </div>
      {/if}
    </div>
    <input
      bind:this={fileInput}
      type="file"
      accept="image/*"
      multiple
      style="display: none;"
      onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
    />
  {/if}
</div>
