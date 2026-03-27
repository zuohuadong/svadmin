<script lang="ts">
  /**
   * LiteShow — Detail/view page for a single record.
   * Renders field labels and values in a key-value layout.
   */
  import type { ResourceDefinition, FieldDefinition } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';

  interface Props {
    record: Record<string, unknown>;
    resource: ResourceDefinition;
    basePath?: string;
    canEdit?: boolean;
  }

  let {
    record,
    resource,
    basePath = '/lite',
    canEdit = true,
  }: Props = $props();

  const pk = resource.primaryKey ?? 'id';
  const id = record[pk];
  const showFields = $derived(
    resource.fields.filter(f => f.showInShow !== false && f.showInList !== false)
  );

  function formatValue(value: unknown, field: FieldDefinition): string {
    if (value == null) return '—';
    if (field.type === 'boolean') return value ? '✓' : '✗';
    if (field.type === 'date') {
      try { return new Date(value as string).toLocaleString(); } catch { return String(value); }
    }
    if (field.type === 'select' && field.options) {
      const opt = field.options.find(o => o.value === value);
      return opt?.label ?? String(value);
    }
    if (field.type === 'url') return String(value);
    if (field.type === 'email') return String(value);
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      try { return JSON.stringify(value, null, 2); } catch { return String(value); }
    }
    return String(value);
  }
</script>

<div class="lite-card">
  <div class="lite-header">
    <h1>{resource.label} #{id}</h1>
    <div>
      {#if canEdit}
        <a href="{basePath}/{resource.name}/edit/{id}" class="lite-btn lite-btn-primary">
          {t('common.edit') || 'Edit'}
        </a>
      {/if}
      <a href="{basePath}/{resource.name}" class="lite-btn" style="margin-left:8px;">
        {t('common.backToList') || 'Back to List'}
      </a>
    </div>
  </div>

  <table class="lite-table">
    <tbody>
      {#each showFields as field}
        {@const value = record[field.key]}
        <tr>
          <td style="width:200px;font-weight:600;color:#64748b;vertical-align:top;">
            {field.label}
          </td>
          <td>
            {#if field.type === 'boolean'}
              <span class="lite-bool {value ? 'lite-bool-true' : ''}"></span>
              {value ? '✓ Yes' : '✗ No'}
            {:else if field.type === 'url' && value}
              <a href={String(value)} target="_blank" rel="noopener">{value}</a>
            {:else if field.type === 'email' && value}
              <a href="mailto:{value}">{value}</a>
            {:else if field.type === 'image' && value}
              <img src={String(value)} alt={field.label} style="max-width:300px;max-height:200px;border-radius:4px;" />
            {:else if field.type === 'tags' && Array.isArray(value)}
              {#each value as tag}
                <span class="lite-badge">{tag}</span>
              {/each}
            {:else if field.type === 'json' && value}
              <pre style="margin:0;font-size:12px;background:#f8fafc;padding:8px;border-radius:4px;overflow-x:auto;">{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</pre>
            {:else}
              {formatValue(value, field)}
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
