<script lang="ts">
  import { captureAdminContext, getResource } from '@svadmin/core';
  import { useTranslation } from '@svadmin/core/i18n';

  import type { Snippet } from 'svelte';
  import PageHeader from './PageHeader.svelte';
  import AutoForm from './AutoForm.svelte';
  import ListButton from './buttons/ListButton.svelte';
  import ShowButton from './buttons/ShowButton.svelte';
  import RefreshButton from './buttons/RefreshButton.svelte';
  import DeleteButton from './buttons/DeleteButton.svelte';

  const i18n = useTranslation();

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
  const adminContext = captureAdminContext();

  const resource = $derived(getResource(resourceName));
  const pageTitle = $derived(title ?? `${i18n.t('common.edit')} ${resource.label} #${id}`);
  const showDelete = $derived(canDelete ?? resource.canDelete !== false);
</script>

<div class="space-y-6 {className}">
  <PageHeader title={pageTitle}>
    {#snippet actions()}
      <ListButton resource={resourceName} hideText />
      <ShowButton resource={resourceName} recordItemId={id} hideText />
      <RefreshButton resource={resourceName} hideText />
      {#if showDelete !== false}
        <DeleteButton resource={resourceName} recordItemId={id} hideText onSuccess={() => adminContext.navigate(`/${resourceName}`)} />
      {/if}
      {#if headerActions}
        {@render headerActions()}
      {/if}
    {/snippet}
  </PageHeader>

  <AutoForm {resourceName} mode="edit" {id} />
</div>
