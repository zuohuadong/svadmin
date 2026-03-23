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
  import { Pencil } from 'lucide-svelte';

  let { resourceName, id } = $props<{ resourceName: string; id: string | number }>();

  const resource = getResource(resourceName);
  const showFields = resource.fields.filter(f => f.showInShow !== false);

  const query = useShow({ resource: resourceName, id });
</script>

<div class="space-y-6">
  <PageHeader title="{resource.label} {t('common.detail')}">
    {#snippet actions()}
      <Button variant="ghost" size="icon" onclick={() => navigate(`/${resourceName}`)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
      </Button>
      {#if resource.canEdit !== false}
        <Button onclick={() => navigate(`/${resourceName}/edit/${id}`)}>
          <Pencil class="h-4 w-4" data-icon="inline-start" /> {t('common.edit')}
        </Button>
      {/if}
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
