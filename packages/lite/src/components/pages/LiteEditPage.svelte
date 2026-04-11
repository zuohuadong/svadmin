<script lang="ts">
  import type { ResourceDefinition } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import LiteForm from '../LiteForm.svelte';
  import LiteListButton from '../buttons/LiteListButton.svelte';
  import LiteShowButton from '../buttons/LiteShowButton.svelte';
  import LiteDeleteButton from '../buttons/LiteDeleteButton.svelte';

  interface Props {
    resource: ResourceDefinition;
    record: Record<string, unknown>;
    errors?: Record<string, string[]>;
    basePath?: string;
    canDelete?: boolean;
    canShow?: boolean;
  }

  let {
    resource,
    record,
    errors = {},
    basePath = '/lite',
    canDelete = true,
    canShow = true,
  }: Props = $props();

  let pk = $derived(resource.primaryKey ?? 'id');
  let idStr = $derived(String(record[pk]));
</script>

<div class="lite-page">
  <div class="lite-page-header">
    <h1 class="lite-page-title">{t('common.edit') || 'Edit'} {resource.label || resource.name} #{idStr}</h1>
    <div class="lite-page-actions">
      {#if canShow}
        <LiteShowButton resource={resource.name} recordItemId={idStr} {basePath} />
      {/if}
      <LiteListButton resource={resource.name} {basePath} />
      {#if canDelete}
        <LiteDeleteButton resource={resource.name} recordItemId={idStr} redirectUrl={`${basePath}/${resource.name}`} {basePath} />
      {/if}
    </div>
  </div>

  <LiteForm
    fields={resource.fields}
    mode="edit"
    {resource}
    {errors}
    values={record}
    action="?/${resource.name}_update"
    cancelUrl={`${basePath}/${resource.name}`}
  />
</div>
