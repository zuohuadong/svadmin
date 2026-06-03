<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
  import type { FieldDefinition } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';

  interface Props {
    field: FieldDefinition;
    value?: unknown;
    error?: string[];
    mode?: 'show' | 'edit' | 'create';
  }

  let { field, value, error = [], mode = 'show' }: Props = $props();
  let hasError = $derived(error.length > 0);

  // In Lite version, relations might need to be rendered via server-side joined data 
  // passed through options, or just standard inputs requesting ID.
  function displayRelation(v: unknown): string {
    if (v == null) return '—';
    if (typeof v === 'object' && v !== null && 'id' in v) {
      // It's a populated relation object
      const labelField = (field as any).relation?.labelField || 'name';
      return String((v as Record<string, unknown>)[labelField] || (v as Record<string, unknown>).id);
    }
    // Try options
    const opt = field.options?.find(o => String(o.value) === String(v));
    return opt?.label ?? String(v);
  }
</script>

{#if mode === 'show'}
  <span class="lite-badge">{displayRelation(value)}</span>
{:else}
  <div>
    {#if field.options && field.options.length > 0}
      <!-- Render as select if options provided by loader -->
      <select
        name={field.key}
        id={field.key}
        class="lite-select {hasError ? 'lite-input-error' : ''}"
      >
        <option value="">-- {t('common.select') || 'Select'} Reference --</option>
        {#each field.options as opt, _i (_i)}
          <option value={String(opt.value)} selected={String(value) === String(opt.value)}>
            {opt.label}
          </option>
        {/each}
      </select>
    {:else}
      <!-- Fallback text input for target ID -->
      <input
        type="text"
        name={field.key}
        id={field.key}
        value={typeof value === 'object' && value ? String((value as Record<string, unknown>).id || '') : String(value ?? '')}
        class="lite-input {hasError ? 'lite-input-error' : ''}"
        placeholder="Enter reference ID"
        {...field.required ? { required: true } : {}}
      />
    {/if}
    {#if hasError}
      {#each error as err, _i (_i)}
        <div class="lite-error-text">{err}</div>
      {/each}
    {/if}
  </div>
{/if}
