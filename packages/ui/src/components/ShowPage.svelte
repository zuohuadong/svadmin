<script lang="ts">
  import { useShow, getResource } from '@svadmin/core';
  import type { FieldDefinition } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t, getLocale } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import * as Card from './ui/card/index.js';
  import { Skeleton } from './ui/skeleton/index.js';
  import PageHeader from './PageHeader.svelte';
  import { getDisplayComponent } from './fieldComponentMap';
  import ListButton from './buttons/ListButton.svelte';
  import EditButton from './buttons/EditButton.svelte';
  import DeleteButton from './buttons/DeleteButton.svelte';
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
      {#if resource.canDelete !== false}
        <DeleteButton resource={resourceName} recordItemId={id} hideText onSuccess={() => navigate(`/${resourceName}`)} />
      {/if}
      <RefreshButton resource={resourceName} hideText />
    {/snippet}
  </PageHeader>

  {#if query.query.isLoading}
    <Card.Root>
      <Card.Content class="divide-y divide-border p-0">
        {#each showFields.slice(0, 6) as _}
          <div class="flex px-6 py-4">
            <Skeleton class="h-4 w-1/4" />
            <Skeleton class="h-4 w-2/5 ml-auto" />
          </div>
        {/each}
      </Card.Content>
    </Card.Root>
  {:else if query.query.data?.data}
    <Card.Root>
      <Card.Content class="divide-y divide-border p-0">
        {#each showFields as field}
          {@const value = (query.query.data!.data as Record<string, unknown>)[field.key]}
          {@const DisplayComponent = getDisplayComponent(field.type)}
          <div class="flex px-6 py-4">
            <div class="w-1/3 text-sm font-medium text-muted-foreground">{field.label}</div>
            <div class="w-2/3 text-sm text-foreground">
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
  {/if}
</div>
