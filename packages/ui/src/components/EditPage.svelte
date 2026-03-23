<script lang="ts">
  import { getResource, useDelete } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import type { Snippet } from 'svelte';
  import PageHeader from './PageHeader.svelte';
  import AutoForm from './AutoForm.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import { ArrowLeft, Trash2 } from 'lucide-svelte';
  import { Button } from './ui/button/index.js';
  import TooltipButton from './TooltipButton.svelte';

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

  const deleteResult = useDelete({ resource: resourceName });
  const deleteMutation = deleteResult.mutation;

  let confirmOpen = $state(false);

  async function handleDelete() {
    await deleteMutation.mutateAsync({ id, resource: resourceName });
    confirmOpen = false;
    navigate(`/${resourceName}`);
  }
</script>

<div class="space-y-6 {className}">
  <PageHeader title={pageTitle}>
    {#snippet actions()}
      <TooltipButton tooltip={t('common.back')} onclick={() => navigate(`/${resourceName}`)}>
        <ArrowLeft class="h-5 w-5" />
      </TooltipButton>
      {#if showDelete}
        <TooltipButton tooltip={t('common.delete')} variant="destructive" size="sm" onclick={() => { confirmOpen = true; }}>
          <Trash2 class="h-4 w-4" />
        </TooltipButton>
      {/if}
      {#if headerActions}
        {@render headerActions()}
      {/if}
    {/snippet}
  </PageHeader>

  <AutoForm {resourceName} mode="edit" {id} />
</div>

<ConfirmDialog
  bind:open={confirmOpen}
  title={t('common.deleteConfirm')}
  onConfirm={handleDelete}
/>
