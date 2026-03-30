<script lang="ts">
  import type { FieldDefinition } from '@svadmin/core';

  interface Props {
    field: FieldDefinition;
    value?: unknown;
    error?: string[];
    mode?: 'show' | 'edit' | 'create';
  }

  let { field, value, error = [], mode = 'show' }: Props = $props();
  let hasError = $derived(error.length > 0);
  
</script>

{#if mode === 'show'}
  <!-- SSR fallback for rich text: render raw HTML if safe, or escaped. 
       We use standard HTML output for SSR. If it includes scripts, 
       backend should have sanitized it. -->
  <div style="padding: 16px; border: 1px solid #e2e8f0; border-radius: 6px; max-height: 500px; overflow-y: auto; background: #fff;" class="prose">
    {@html String(value ?? '—')}
  </div>
{:else}
  <div class="lite-markdown-editor">
    <div style="padding: 8px 12px; border: 1px solid #cbd5e1; border-bottom: none; border-radius: 6px 6px 0 0; background: #f8fafc; color: #64748b; font-size: 12px; display: flex; gap: 12px; font-weight: 500;">
      <span>Markdown is supported</span>
      <span style="color: #94a3b8;">**bold**</span>
      <span style="color: #94a3b8; font-style: italic;">*italic*</span>
      <span style="color: #94a3b8;"># heading</span>
    </div>
    <textarea
      name={field.key}
      id={field.key}
      class="lite-input {hasError ? 'lite-input-error' : ''}"
      style="min-height: 280px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 13px; line-height: 1.6; padding: 16px; border-radius: 0 0 6px 6px; resize: vertical;"
      placeholder="Wait... Rich Text Editor is disabled in lite mode.&#10;&#10;You can write standard HTML or use Markdown syntax here. Content will be safely rendered on the server."
      {...field.required ? { required: true } : {}}
    >{String(value ?? '')}</textarea>
    {#if hasError}
      {#each error as err}
        <div class="lite-error-text">{err}</div>
      {/each}
    {/if}
  </div>
{/if}
