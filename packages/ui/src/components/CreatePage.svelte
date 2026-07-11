<script lang="ts">
  import { getResource } from '@svadmin/core';
  import { useTranslation } from '@svadmin/core/i18n';
  import type { Snippet } from 'svelte';
  import PageHeader from './PageHeader.svelte';
  import AutoForm from './AutoForm.svelte';
  import ListButton from './buttons/ListButton.svelte';

  const i18n = useTranslation();

  interface Props {
    resourceName: string;
    title?: string;
    headerActions?: Snippet;
    class?: string;
  }

  let {
    resourceName,
    title,
    headerActions,
    class: className = '',
  }: Props = $props();

  const resource = $derived(getResource(resourceName));
  const pageTitle = $derived(title ?? `${i18n.t('common.create')}${resource.label}`);
</script>

<div class="space-y-6 {className}">
  <PageHeader title={pageTitle}>
    {#snippet actions()}
      <ListButton resource={resourceName} hideText />
      {#if headerActions}
        {@render headerActions()}
      {/if}
    {/snippet}
  </PageHeader>

  <AutoForm {resourceName} mode="create" />
</div>
