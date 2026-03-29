<script lang="ts">
  /**
   * LiteShowField — SSR-compatible field renderer for detail views.
   * Renders a single field value based on its type definition.
   */
  import type { FieldDefinition } from '@svadmin/core';

  interface Props {
    field: FieldDefinition;
    value: unknown;
  }

  let { field, value }: Props = $props();

  function formatValue(v: unknown, f: FieldDefinition): string {
    if (v == null) return '—';
    if (f.type === 'date') {
      try { return new Date(v as string).toLocaleString(); } catch { return String(v); }
    }
    if (f.type === 'select' && f.options) {
      const opt = f.options.find(o => o.value === v);
      return opt?.label ?? String(v);
    }
    if (f.type === 'url') return String(v);
    if (f.type === 'email') return String(v);
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'object') {
      try { return JSON.stringify(v, null, 2); } catch { return String(v); }
    }
    return String(v);
  }
</script>

{#if field.type === 'boolean'}
  <span class="lite-bool {value ? 'lite-bool-true' : ''}"></span>
  {value ? '✓ Yes' : '✗ No'}
{:else if field.type === 'url' && value}
  <a href={String(value)} target="_blank" rel="noopener">{value}</a>
{:else if field.type === 'email' && value}
  <a href="mailto:{value}">{value}</a>
{:else if field.type === 'image' && value}
  <img src={String(value)} alt={field.label} style="max-width:300px;max-height:200px;border-radius:6px;border:1px solid #e2e8f0;" />
{:else if field.type === 'tags' && Array.isArray(value)}
  {#each value as tag}
    <span class="lite-badge">{tag}</span>
  {/each}
{:else if field.type === 'json' && value}
  <pre style="margin:0;font-size:12px;background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e2e8f0;overflow-x:auto;">{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</pre>
{:else}
  {formatValue(value, field)}
{/if}
