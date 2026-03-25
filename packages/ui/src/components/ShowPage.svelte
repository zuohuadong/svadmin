<script lang="ts">
  import { useShow, getResource } from '@svadmin/core';
  import type { FieldDefinition } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t, getLocale } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import * as Card from './ui/card/index.js';
  import { Skeleton } from './ui/skeleton/index.js';
  import PageHeader from './PageHeader.svelte';
  import TooltipButton from './TooltipButton.svelte';
  import { getDisplayComponent } from './fieldComponentMap';
  import { ArrowLeft, Pencil } from 'lucide-svelte';

  let { resourceName, id } = $props<{ resourceName: string; id: string | number }>();

  const resource = $derived(getResource(resourceName));
  const showFields = $derived(resource.fields.filter(f => f.showInShow !== false));

  const query = useShow({ get resource() { return resourceName; }, get id() { return id; } });
</script>

<div class="space-y-6">
  <PageHeader title="{resource.label} {t('common.detail')}">
    {#snippet actions()}
      <TooltipButton tooltip={t('common.back')} onclick={() => navigate(`/${resourceName}`)}>
        <ArrowLeft class="h-5 w-5" />
      </TooltipButton>
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
