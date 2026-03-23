<script lang="ts" module>
  export type { FieldDefinition } from '@svadmin/core';
</script>

<script lang="ts">
  import type { FieldDefinition } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { Input } from './ui/input/index.js';
  import { Textarea } from './ui/textarea/index.js';
  import { Switch } from './ui/switch/index.js';
  import { Badge } from './ui/badge/index.js';
  import type { Snippet } from 'svelte';

  let { field, value, onchange, children } = $props<{
    field: FieldDefinition;
    value: unknown;
    onchange: (val: unknown) => void;
    /** Optional custom renderer snippet */
    children?: Snippet;
  }>();

  // Typed accessors
  const strVal = $derived((value as string) ?? '');
  const numVal = $derived((value as number) ?? 0);
  const boolVal = $derived((value as boolean) ?? false);
  const tagsVal = $derived((value as string[]) ?? []);

  function handleTagKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const tag = input.value.trim();
      if (tag) {
        onchange([...tagsVal, tag]);
        input.value = '';
      }
    }
  }

  function removeTag(index: number) {
    onchange(tagsVal.filter((_, i) => i !== index));
  }
</script>

<div class="space-y-1.5">
  <label class="block text-sm font-medium text-foreground" for={field.key}>
    {field.label}
    {#if field.required}
      <span class="text-destructive">*</span>
    {/if}
  </label>

  {#if children}
    {@render children()}

  {:else if field.type === 'text' || field.type === 'image'}
    <Input
      id={field.key}
      type="text"
      value={strVal}
      oninput={(e) => onchange((e.target as HTMLInputElement).value)}
      required={field.required}
      placeholder={t('field.enterValue', { label: field.label })}
    />

  {:else if field.type === 'number'}
    <Input
      id={field.key}
      type="number"
      value={String(numVal)}
      oninput={(e) => onchange(parseFloat((e.target as HTMLInputElement).value) || 0)}
      required={field.required}
    />

  {:else if field.type === 'textarea' || field.type === 'richtext'}
    <Textarea
      id={field.key}
      value={strVal}
      oninput={(e) => onchange((e.target as HTMLTextAreaElement).value)}
      required={field.required}
      rows={field.type === 'richtext' ? 10 : 4}
      placeholder={t('field.enterValue', { label: field.label })}
      class="resize-y"
    />

  {:else if field.type === 'select'}
    <select
      id={field.key}
      value={strVal}
      onchange={(e) => onchange((e.target as HTMLSelectElement).value)}
      required={field.required}
      class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <option value="">{t('field.selectPlaceholder')}</option>
      {#each field.options ?? [] as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>

  {:else if field.type === 'boolean'}
    <div class="flex items-center gap-2 pt-1">
      <Switch
        checked={boolVal}
        onCheckedChange={(v) => onchange(v)}
      />
      <span class="text-sm text-muted-foreground">{boolVal ? t('common.yes') : t('common.no')}</span>
    </div>

  {:else if field.type === 'tags'}
    <div class="space-y-2">
      <div class="flex flex-wrap gap-1.5">
        {#each tagsVal as tag, i}
          <Badge variant="secondary" class="gap-1">
            {tag}
            <button
              type="button"
              onclick={() => removeTag(i)}
              class="ml-0.5 hover:text-destructive"
            >×</button>
          </Badge>
        {/each}
      </div>
      <Input
        type="text"
        placeholder={t('field.tagsPlaceholder')}
        onkeydown={handleTagKeydown}
      />
    </div>

  {:else if field.type === 'date'}
    <Input
      id={field.key}
      type="date"
      value={strVal}
      oninput={(e) => onchange((e.target as HTMLInputElement).value)}
      required={field.required}
    />

  {:else if field.type === 'json'}
    <Textarea
      id={field.key}
      value={typeof value === 'string' ? strVal : JSON.stringify(value, null, 2)}
      oninput={(e) => {
        try {
          onchange(JSON.parse((e.target as HTMLTextAreaElement).value));
        } catch {
          // keep raw text until valid JSON
        }
      }}
      rows={6}
      class="resize-y font-mono text-xs"
    />

  {:else}
    <Input
      id={field.key}
      type="text"
      value={strVal}
      oninput={(e) => onchange((e.target as HTMLInputElement).value)}
    />
  {/if}
</div>
