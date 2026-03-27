<script lang="ts">
  /**
   * LiteForm — Server-rendered form driven by FieldDefinitions.
   * Uses native <form> with method="POST" for IE11 compatibility.
   * Integrates with sveltekit-superforms for server-side validation.
   */
  import type { FieldDefinition, ResourceDefinition } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { fieldToInputType, fieldToPlaceholder } from '../schema-generator';

  interface Props {
    fields: FieldDefinition[];
    /** Resource definition (used for primaryKey) */
    resource?: ResourceDefinition;
    /** Existing values (for edit mode) */
    values?: Record<string, unknown>;
    /** Validation errors from server */
    errors?: Record<string, string[]>;
    /** 'create' or 'edit' */
    mode?: 'create' | 'edit';
    /** Form action URL */
    action?: string;
    /** Submit button label */
    submitLabel?: string;
    /** Cancel URL */
    cancelUrl?: string;
  }

  let {
    fields,
    resource,
    values = {},
    errors = {},
    mode = 'create',
    action = '',
    submitLabel,
    cancelUrl,
  }: Props = $props();

  const formFields = $derived(
    fields.filter(f => {
      if (f.showInForm === false) return false;
      if (mode === 'create' && f.showInCreate === false) return false;
      if (mode === 'edit' && f.showInEdit === false) return false;
      return true;
    })
  );
</script>

<form method="POST" action={action || undefined} class="lite-card" enctype="multipart/form-data">
  {#if mode === 'edit'}
    {@const pk = resource?.primaryKey ?? 'id'}
    {#if values[pk] != null}
      <input type="hidden" name="_id" value={String(values[pk])} />
    {/if}
  {/if}

  {#each formFields as field}
    {@const inputType = fieldToInputType(field)}
    {@const placeholder = fieldToPlaceholder(field)}
    {@const value = values[field.key]}
    {@const fieldErrors = errors[field.key]}
    {@const hasError = fieldErrors && fieldErrors.length > 0}

    <div class="lite-form-group">
      {#if inputType === 'checkbox'}
        <div class="lite-checkbox-group">
          <input
            type="checkbox"
            name={field.key}
            id={field.key}
            checked={!!value}
          />
          <label for={field.key}>{field.label}</label>
        </div>
      {:else}
        <label for={field.key}>
          {field.label}
          {#if field.required}<span class="required">*</span>{/if}
        </label>

        {#if inputType === 'textarea'}
          <textarea
            name={field.key}
            id={field.key}
            class="lite-input {hasError ? 'lite-input-error' : ''}"
            placeholder={placeholder}
          >{value ?? ''}</textarea>
        {:else if inputType === 'select'}
          <select
            name={field.key}
            id={field.key}
            class="lite-select {hasError ? 'lite-input-error' : ''}"
            {...field.type === 'multiselect' ? { multiple: true } : {}}
          >
            {#if field.type !== 'multiselect'}
              <option value="">-- {t('common.select') || 'Select'} --</option>
            {/if}
            {#if field.options}
              {#each field.options as opt}
                <option 
                  value={String(opt.value)} 
                  selected={field.type === 'multiselect' ? (Array.isArray(value) && value.includes(opt.value)) : value === opt.value}
                >
                  {opt.label}
                </option>
              {/each}
            {/if}
          </select>
        {:else}
          <input
            type={inputType}
            name={field.key}
            id={field.key}
            value={String(value ?? '')}
            class="lite-input {hasError ? 'lite-input-error' : ''}"
            placeholder={placeholder}
            {... field.required ? { required: true } : {}}
            {... field.type === 'images' ? { multiple: true } : {}}
          />
        {/if}

        {#if hasError}
          {#each fieldErrors as err}
            <div class="lite-error-text">{err}</div>
          {/each}
        {/if}
      {/if}
    </div>
  {/each}

  <div style="display:flex;align-items:center;margin-top:20px;">
    <button type="submit" class="lite-btn lite-btn-primary">{submitLabel || t('common.save') || 'Save'}</button>
    {#if cancelUrl}
      <a href={cancelUrl} class="lite-btn" style="margin-left:8px;">{t('common.cancel') || 'Cancel'}</a>
    {/if}
  </div>
</form>
