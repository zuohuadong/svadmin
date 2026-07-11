<script lang="ts">
  /**
   * LiteArrayField — SSR-compatible array sub-form.
   * One row and remove-on-save controls work without JavaScript; enhance.js
   * progressively adds in-place add/remove controls.
   */
  import type { FieldDefinition } from '@svadmin/core';
  import LiteArrayItem from './LiteArrayItem.svelte';

  interface Props {
    field: FieldDefinition;
    /** Current array values */
    values?: Record<string, unknown>[];
    /** Form field name prefix (for nested form encoding) */
    namePrefix?: string;
    mode?: 'create' | 'edit';
  }

  let {
    field,
    values = [],
    namePrefix = field.key,
    mode = 'create',
  }: Props = $props();

  const subFields = $derived(field.subFields || []);
  const renderedValues = $derived(values.length > 0 ? values : [{}]);
  const hasServerValues = $derived(values.length > 0);
</script>

<fieldset
  class="lite-array-field"
  data-lite-array
  data-lite-array-name={namePrefix}
  data-next-index={renderedValues.length}
>
  <legend>
    {field.label}
    {#if field.required}<span class="required">*</span>{/if}
  </legend>

  {#each renderedValues as item, i (i)}
    <LiteArrayItem
      {subFields}
      {item}
      {namePrefix}
      index={i}
      isDraft={!field.required && !hasServerValues}
      {mode}
    />
  {/each}

  <button type="button" class="lite-btn" data-lite-array-add hidden>
    + Add Item
  </button>

  <template data-lite-array-template>
    <LiteArrayItem {subFields} item={{}} {namePrefix} index="__INDEX__" isDraft={false} {mode} />
  </template>
</fieldset>
