<script lang="ts">
  import { getResource } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import type { Snippet } from 'svelte';
  import PageHeader from './PageHeader.svelte';
  import AutoForm from './AutoForm.svelte';
  import { ArrowLeft } from 'lucide-svelte';
  import { Button } from './ui/button/index.js';

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

  const resource = getResource(resourceName);
  const pageTitle = title ?? `${t('common.create')}${resource.label}`;
</script>

<div class="space-y-6 {className}">
  <PageHeader title={pageTitle}>
    {#snippet actions()}
      <Button variant="ghost" size="icon" onclick={() => navigate(`/${resourceName}`)}>
        <ArrowLeft class="h-5 w-5" />
      </Button>
      {#if headerActions}
        {@render headerActions()}
      {/if}
    {/snippet}
  </PageHeader>

  <AutoForm {resourceName} mode="create" />
</div>
