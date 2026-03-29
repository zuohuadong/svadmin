<script lang="ts">
  /**
   * LiteArrayField — SSR-compatible dynamic array sub-form.
   * Uses progressive enhancement: hidden inputs + JS optional add/remove.
   * Falls back to server-side form POST for non-JS browsers.
   */
  import type { FieldDefinition } from '@svadmin/core';
  import { fieldToInputType, fieldToPlaceholder } from '../schema-generator';

  interface Props {
    field: FieldDefinition;
    /** Current array values */
    values: Record<string, unknown>[];
    /** Form field name prefix (for nested form encoding) */
    namePrefix?: string;
  }

  let {
    field,
    values = [],
    namePrefix = field.key,
  }: Props = $props();

  const subFields = $derived(field.subFields || []);
</script>

<fieldset class="lite-array-field">
  <legend style="font-weight:600;font-size:14px;margin-bottom:8px;">
    {field.label}
    {#if field.required}<span style="color:#dc2626;">*</span>{/if}
  </legend>

  {#each values as item, i}
    <div class="lite-array-item" style="border:1px solid #e2e8f0;border-radius:6px;padding:12px;margin-bottom:8px;background:#f8fafc;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:12px;font-weight:600;color:#94a3b8;">#{i + 1}</span>
        <button type="button" class="lite-btn lite-btn-sm" style="color:#dc2626;border-color:#fecaca;" onclick="this.closest('.lite-array-item').remove()">
          Remove
        </button>
      </div>
      {#each subFields as sub}
        <div style="margin-bottom:8px;">
          <label for="{namePrefix}_{i}_{sub.key}" style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:4px;">
            {sub.label}
            {#if sub.required}<span style="color:#dc2626;">*</span>{/if}
          </label>
          {#if sub.type === 'textarea'}
            <textarea
              id="{namePrefix}_{i}_{sub.key}"
              name="{namePrefix}[{i}][{sub.key}]"
              class="lite-input"
              rows="3"
              placeholder={fieldToPlaceholder(sub)}
            >{item[sub.key] ?? ''}</textarea>
          {:else if sub.type === 'boolean'}
            <input
              id="{namePrefix}_{i}_{sub.key}"
              name="{namePrefix}[{i}][{sub.key}]"
              type="checkbox"
              checked={!!item[sub.key]}
              style="width:18px;height:18px;"
            />
          {:else if sub.type === 'select' && sub.options}
            <select
              id="{namePrefix}_{i}_{sub.key}"
              name="{namePrefix}[{i}][{sub.key}]"
              class="lite-input"
            >
              {#each sub.options as opt}
                <option value={typeof opt === 'string' ? opt : opt.value} selected={item[sub.key] === (typeof opt === 'string' ? opt : opt.value)}>
                  {typeof opt === 'string' ? opt : opt.label}
                </option>
              {/each}
            </select>
          {:else}
            <input
              id="{namePrefix}_{i}_{sub.key}"
              name="{namePrefix}[{i}][{sub.key}]"
              type={fieldToInputType(sub)}
              value={item[sub.key] ?? ''}
              class="lite-input"
              placeholder={fieldToPlaceholder(sub)}
            />
          {/if}
        </div>
      {/each}
    </div>
  {/each}

  {#if values.length === 0}
    <p style="text-align:center;padding:16px;color:#94a3b8;font-size:14px;">No items added yet.</p>
  {/if}

  <button type="button" class="lite-btn" style="margin-top:4px;" onclick="
    const template = this.previousElementSibling?.previousElementSibling?.cloneNode(true);
    if (template) this.parentElement.insertBefore(template, this.previousElementSibling);
  ">
    + Add Item
  </button>
</fieldset>

<style>
  .lite-array-field {
    border: 2px dashed #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }
  .lite-array-field legend {
    padding: 0 8px;
  }
</style>
