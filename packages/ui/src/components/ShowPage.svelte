<script lang="ts">
  import { useShow, getResource } from '@svadmin/core';
  import type { FieldDefinition } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t, getLocale } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import * as Card from './ui/card/index.js';
  import { ArrowLeft, Pencil, Loader2 } from 'lucide-svelte';

  let { resourceName, id } = $props<{ resourceName: string; id: string | number }>();

  const resource = getResource(resourceName);
  const showFields = resource.fields.filter(f => f.showInShow !== false);

  const query = useShow({ resource: resourceName, id });

  function formatValue(field: FieldDefinition, value: unknown): string {
    if (value == null) return '—';
    if (field.type === 'boolean') return value ? t('common.yes') : t('common.no');
    if (field.type === 'date') return new Date(value as string).toLocaleDateString(getLocale());
    if (field.type === 'json') return JSON.stringify(value, null, 2);
    if (field.type === 'tags' && Array.isArray(value)) return (value as string[]).join(', ');
    if (field.type === 'select' && field.options) {
      const opt = field.options.find(o => o.value === value);
      return opt?.label ?? String(value);
    }
    return String(value);
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" onclick={() => navigate(`/${resourceName}`)}>
        <ArrowLeft class="h-5 w-5" />
      </Button>
      <h1 class="text-2xl font-bold text-foreground">{resource.label} {t('common.detail')}</h1>
    </div>
    {#if resource.canEdit !== false}
      <Button onclick={() => navigate(`/${resourceName}/edit/${id}`)}>
        <Pencil class="h-4 w-4" data-icon="inline-start" /> {t('common.edit')}
      </Button>
    {/if}
  </div>

  {#if $query.isLoading}
    <div class="flex h-64 items-center justify-center">
      <Loader2 class="h-6 w-6 animate-spin text-primary" />
    </div>
  {:else if $query.data}
    <Card.Root>
      <Card.Content class="divide-y divide-border p-0">
        {#each showFields as field}
          {@const value = ($query.data as Record<string, unknown>)[field.key]}
          <div class="flex px-6 py-4">
            <div class="w-1/3 text-sm font-medium text-muted-foreground">{field.label}</div>
            <div class="w-2/3 text-sm text-foreground">
              {#if field.type === 'image' && value}
                <img src={value as string} alt={field.label} class="h-20 w-20 rounded-lg object-cover" />
              {:else if field.type === 'json' && value}
                <pre class="rounded-lg bg-muted p-3 text-xs overflow-auto max-h-40">{formatValue(field, value)}</pre>
              {:else}
                {formatValue(field, value)}
              {/if}
            </div>
          </div>
        {/each}
      </Card.Content>
    </Card.Root>
  {/if}
</div>
