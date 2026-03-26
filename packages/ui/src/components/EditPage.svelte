<script lang="ts">
  import { getResource, useDelete } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import type { Snippet } from 'svelte';
  import PageHeader from './PageHeader.svelte';
  import AutoForm from './AutoForm.svelte';
  import ListButton from './buttons/ListButton.svelte';
  import ShowButton from './buttons/ShowButton.svelte';
  import RefreshButton from './buttons/RefreshButton.svelte';
  import DeleteButton from './buttons/DeleteButton.svelte';

  interface Props {
    resourceName: string;
    id: string | number;
    title?: string;
    canDelete?: boolean;
    headerActions?: Snippet;
    class?: string;
  }

  let {
    resourceName,
    id,
    title,
    canDelete,
    headerActions,
    class: className = '',
  }: Props = $props();

  const resource = $derived(getResource(resourceName));
  const pageTitle = $derived(title ?? `${t('common.edit')} ${resource.label} #${id}`);
  const showDelete = $derived(canDelete ?? resource.canDelete !== false);
</script>

<div class="space-y-6 {className}">
  <PageHeader title={pageTitle}>
    {#snippet actions()}
      <ListButton resource={resourceName} hideText />
      <ShowButton resource={resourceName} recordItemId={id} hideText />
      <RefreshButton resource={resourceName} hideText />
      {#if showDelete !== false}
        <DeleteButton resource={resourceName} recordItemId={id} hideText onSuccess={() => navigate(`/${resourceName}`)} />
      {/if}
      {#if headerActions}
        {@render headerActions()}
      {/if}
    {/snippet}
  </PageHeader>

  <AutoForm {resourceName} mode="edit" {id} />
</div>
