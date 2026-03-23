<script lang="ts">
  import { getResource } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import type { Snippet } from 'svelte';
  import PageHeader from './PageHeader.svelte';
  import AutoForm from './AutoForm.svelte';
  import { ArrowLeft, Trash2 } from 'lucide-svelte';
  import { Button } from './ui/button/index.js';

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

  const resource = getResource(resourceName);
  const pageTitle = title ?? `${t('common.edit')} ${resource.label} #${id}`;
  const showDelete = canDelete ?? resource.canDelete !== false;
</script>

<div class="space-y-6 {className}">
  <PageHeader title={pageTitle}>
    {#snippet actions()}
      <Button variant="ghost" size="icon" onclick={() => navigate(`/${resourceName}`)}>
        <ArrowLeft class="h-5 w-5" />
      </Button>
      {#if showDelete}
        <Button variant="destructive" size="sm">
          <Trash2 class="h-4 w-4" data-icon="inline-start" /> {t('common.delete')}
        </Button>
      {/if}
      {#if headerActions}
        {@render headerActions()}
      {/if}
    {/snippet}
  </PageHeader>

  <AutoForm {resourceName} mode="edit" {id} />
</div>
