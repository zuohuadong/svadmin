<script lang="ts">
  import type { FieldDefinition } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { Button } from '../ui/button/index.js';
  import { Plus, Trash2 } from 'lucide-svelte';
  import TooltipButton from '../TooltipButton.svelte';
  import FieldRenderer from '../FieldRenderer.svelte';

  let { field, value, onchange } = $props<{
    field: FieldDefinition;
    value: unknown;
    onchange: (val: unknown) => void;
  }>();

  const arrayVal = $derived(Array.isArray(value) ? value : []);
  const subFields = $derived(field.subFields || []);

  function getDefaultForType(type: string): unknown {
    switch (type) {
      case 'text': case 'textarea': case 'richtext': case 'image': return '';
      case 'number': return 0;
      case 'boolean': return false;
      case 'tags': case 'images': case 'multiselect': case 'array': return [];
      case 'json': return {};
      default: return '';
    }
  }

  function handleAdd() {
    const newItem: Record<string, unknown> = {};
    for (const f of subFields) {
      newItem[f.key] = f.defaultValue ?? getDefaultForType(f.type);
    }
    onchange([...arrayVal, newItem]);
  }

  function handleRemove(index: number) {
    onchange(arrayVal.filter((_, i) => i !== index));
  }

  function handleChange(index: number, key: string, val: unknown) {
    const next = [...arrayVal];
    next[index] = { ...next[index], [key]: val };
    onchange(next);
  }
</script>

<div class="space-y-4 rounded-lg border border-dashed p-4">
  <div class="flex items-center justify-between">
    <div class="text-sm font-medium text-foreground">
      {field.label}
      {#if field.required}
        <span class="text-destructive">*</span>
      {/if}
    </div>
    <Button variant="outline" size="sm" type="button" onclick={handleAdd}>
      <Plus class="h-3.5 w-3.5 mr-1" /> {t('common.add') || 'Add'}
    </Button>
  </div>
  
  <div class="space-y-4 pt-2">
    {#each arrayVal as item, i}
      <div class="relative rounded-md border bg-card p-4 pt-6 shadow-sm">
        <div class="absolute right-2 top-2">
          <TooltipButton tooltip={t('common.remove') || 'Remove'} variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" onclick={() => handleRemove(i)}>
            <Trash2 class="h-4 w-4" />
          </TooltipButton>
        </div>
        <div class="grid gap-5">
          {#each subFields as subField (subField.key)}
            <FieldRenderer
              field={subField}
              value={item[subField.key]}
              onchange={(val) => handleChange(i, subField.key, val)}
            />
          {/each}
        </div>
      </div>
    {/each}
    {#if arrayVal.length === 0}
      <div class="flex flex-col items-center justify-center py-6 text-sm text-muted-foreground bg-muted/10 rounded-md">
        <span>{t('common.noData') || 'No items added yet.'}</span>
      </div>
    {/if}
  </div>
</div>
