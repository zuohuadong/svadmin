<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  <div>
    <span class="lite-bool {value ? 'lite-bool-true' : ''}"></span>
    {value ? '✓ Yes' : '✗ No'}
  </div>
{:else}
  <div class="lite-checkbox-group">
    <input
      type="checkbox"
      name={field.key}
      id={field.key}
      checked={!!value}
      value="true"
    />
    <!-- Fallback hidden input so unchecked boxes submit "false" -->
    <input type="hidden" name={field.key} value="false" />
    
    <label for={field.key}>
      {(field as any).placeholder ?? (field.label || 'Yes')}
    </label>
    {#if hasError}
      {#each error as err, _i (_i)}
        <div class="lite-error-text">{err}</div>
      {/each}
    {/if}
  </div>
{/if}
