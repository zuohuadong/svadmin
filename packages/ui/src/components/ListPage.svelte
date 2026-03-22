<script lang="ts">
  import { getResource } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import type { Snippet } from 'svelte';
  import PageHeader from './PageHeader.svelte';
  import AutoTable from './AutoTable.svelte';
  import { Button } from './ui/button/index.js';
  import { Plus } from 'lucide-svelte';

  interface Props {
    resourceName: string;
    title?: string;
    canCreate?: boolean;
    headerActions?: Snippet;
    class?: string;
  }

  let {
    resourceName,
    title,
    canCreate,
    headerActions,
    class: className = '',
  }: Props = $props();

  const resource = getResource(resourceName);
  const pageTitle = title ?? resource.label;
  const showCreate = canCreate ?? resource.canCreate !== false;
</script>

<div class="space-y-6 {className}">
  <PageHeader title={pageTitle}>
    {#snippet actions()}
      {#if showCreate}
        <Button onclick={() => navigate(`/${resourceName}/create`)}>
          <Plus class="h-4 w-4" data-icon="inline-start" /> {t('common.create')}
        </Button>
      {/if}
      {#if headerActions}
        {@render headerActions()}
      {/if}
    {/snippet}
  </PageHeader>

  <AutoTable {resourceName} />
</div>
