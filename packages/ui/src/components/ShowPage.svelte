<script lang="ts">
  import { useShow, getResource } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import * as Card from './ui/card/index.js';
  import { Skeleton } from './ui/skeleton/index.js';
  import PageHeader from './PageHeader.svelte';
  import { getDisplayComponent } from './fieldComponentMap';
  import ListButton from './buttons/ListButton.svelte';
  import EditButton from './buttons/EditButton.svelte';
  import DeleteButton from './buttons/DeleteButton.svelte';
  import CloneButton from './buttons/CloneButton.svelte';
  import RefreshButton from './buttons/RefreshButton.svelte';

  let { resourceName, id } = $props<{ resourceName: string; id: string | number }>();

  const resource = $derived(getResource(resourceName));
  const showFields = $derived(resource.fields.filter(f => f.showInShow !== false));

  const query = useShow({ get resource() { return resourceName; }, get id() { return id; } });
</script>

<div class="space-y-6">
  <PageHeader title="{resource.label} {t('common.detail')}">
    {#snippet actions()}
      <ListButton resource={resourceName} hideText />
      {#if resource.canEdit !== false}
        <EditButton resource={resourceName} recordItemId={id} hideText />
      {/if}
      {#if resource.canCreate !== false}
        <CloneButton resource={resourceName} recordItemId={id} hideText />
      {/if}
      {#if resource.canDelete !== false}
        <DeleteButton resource={resourceName} recordItemId={id} hideText onSuccess={() => navigate(`/${resourceName}`)} />
      {/if}
      <RefreshButton resource={resourceName} hideText />
    {/snippet}
  </PageHeader>

  {#if query.isLoading}
    <Card.Root class="overflow-hidden border-border/60 bg-card shadow-none" data-svadmin-show-card>
      <Card.Content class="space-y-3 p-4 sm:p-5">
        {#each showFields.slice(0, 6) as _, i (i)}
          <div class="flex flex-col border-b border-border/50 px-1 py-4 sm:flex-row sm:py-4">
            <Skeleton class="h-4 w-1/2 sm:w-1/4" />
            <Skeleton class="h-4 w-3/4 sm:w-2/5 mt-1 sm:mt-0 sm:ml-auto" />
          </div>
        {/each}
      </Card.Content>
    </Card.Root>
  {:else if query.data?.data}
    <Card.Root class="overflow-hidden border-border/60 bg-card shadow-none" data-svadmin-show-card>
      <Card.Content class="space-y-3 p-4 sm:p-5">
        {#each showFields as field, i (i)}
          {@const value = ((query.data as { data: Record<string, unknown> }).data as Record<string, unknown>)[field.key]}
          {@const DisplayComponent = getDisplayComponent(field.type)}
          <div class="flex flex-col border-b border-border/50 px-1 py-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-start sm:py-4 {i % 2 === 1 ? 'bg-muted/10' : ''}">
            <div class="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:mb-0 sm:w-1/3">{field.label}</div>
            <div class="text-sm text-foreground sm:w-2/3">
              {#if DisplayComponent && value != null}
                <DisplayComponent
                  {value}
                  options={field.options}
                  resourceName={field.resource}
                />
              {:else}
                {value != null ? String(value) : '—'}
              {/if}
            </div>
          </div>
        {/each}
      </Card.Content>
    </Card.Root>
  {:else}
    <Card.Root class="overflow-hidden border-border/60 bg-card shadow-none" data-svadmin-show-card>
      <Card.Content class="p-8 text-center">
        <p class="text-muted-foreground">{t('common.noData')}</p>
        {#if query.isError}
          <p class="text-sm text-destructive mt-2">{(query.error as Error)?.message ?? t('common.operationFailed')}</p>
        {/if}
      </Card.Content>
    </Card.Root>
  {/if}
</div>
