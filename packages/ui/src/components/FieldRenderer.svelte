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
  import { Label } from './ui/label/index.js';
  import { Select } from './ui/select/index.js';
  import { Checkbox } from './ui/checkbox/index.js';
  import { Button } from './ui/button/index.js';
  import TooltipButton from './TooltipButton.svelte';
  import ComboboxField from './ComboboxField.svelte';
  import ArrayField from './fields/ArrayField.svelte';
  import { Plus, X } from 'lucide-svelte';
  import type { Snippet } from 'svelte';
  import { getRichTextEditor } from '../editor-config.svelte.js';

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
  const multiVal = $derived((value as (string | number)[]) ?? []);
  const imagesVal = $derived((value as string[]) ?? []);

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
    onchange(tagsVal.filter((_: string, i: number) => i !== index));
  }

  // Multiselect toggle
  function toggleMulti(optValue: string | number) {
    if (multiVal.includes(optValue)) {
      onchange(multiVal.filter((v: string | number) => v !== optValue));
    } else {
      onchange([...multiVal, optValue]);
    }
  }

  // Images management
  function addImage() {
    onchange([...imagesVal, '']);
  }

  function updateImage(index: number, url: string) {
    const next = [...imagesVal];
    next[index] = url;
    onchange(next);
  }

  function removeImage(index: number) {
    onchange(imagesVal.filter((_: string, i: number) => i !== index));
  }
</script>

<div class="space-y-1.5">
  <Label for={field.key} id="label-{field.key}">
    {field.label}
    {#if field.required}
      <span class="text-destructive">*</span>
    {/if}
  </Label>

  {#if children}
    {@render children()}

  {:else if field.type === 'array'}
    <ArrayField {field} {value} {onchange} />

  {:else if field.type === 'text' || field.type === 'image'}
    <Input
      id={field.key}
      type="text"
      value={strVal}
      oninput={(e) => onchange((e.target as HTMLInputElement).value)}
      required={field.required}
      placeholder={t('field.enterValue', { label: field.label })}
    />

  {:else if field.type === 'email'}
    <Input
      id={field.key}
      type="email"
      value={strVal}
      oninput={(e) => onchange((e.target as HTMLInputElement).value)}
      required={field.required}
      placeholder="name@example.com"
    />

  {:else if field.type === 'url'}
    <Input
      id={field.key}
      type="url"
      value={strVal}
      oninput={(e) => onchange((e.target as HTMLInputElement).value)}
      required={field.required}
      placeholder="https://"
    />

  {:else if field.type === 'phone'}
    <Input
      id={field.key}
      type="tel"
      value={strVal}
      oninput={(e) => onchange((e.target as HTMLInputElement).value)}
      required={field.required}
      placeholder="+1 (555) 000-0000"
    />

  {:else if field.type === 'color'}
    <div class="flex items-center gap-3">
      <input
        id={field.key}
        type="color"
        value={strVal || '#000000'}
        oninput={(e) => onchange((e.target as HTMLInputElement).value)}
        class="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
      />
      <Input
        type="text"
        value={strVal}
        oninput={(e) => onchange((e.target as HTMLInputElement).value)}
        placeholder="#000000"
        class="max-w-32 font-mono text-sm"
      />
      {#if strVal}
        <span
          class="h-8 w-8 rounded-full border border-border shadow-sm"
          style="background-color: {strVal}"
        ></span>
      {/if}
    </div>

  {:else if field.type === 'number'}
    <Input
      id={field.key}
      type="number"
      value={String(numVal)}
      oninput={(e) => onchange(parseFloat((e.target as HTMLInputElement).value) || 0)}
      required={field.required}
    />

  {:else if field.type === 'richtext'}
    {@const EditorComp = getRichTextEditor()}
    {#if EditorComp}
      <EditorComp
        id={field.key}
        value={strVal}
        placeholder={t('field.enterValue', { label: field.label })}
        preset="full"
        onchange={(html: string) => onchange(html)}
      />
    {:else}
      <Textarea
        id={field.key}
        value={strVal}
        oninput={(e) => onchange((e.target as HTMLTextAreaElement).value)}
        required={field.required}
        rows={10}
        placeholder={t('field.enterValue', { label: field.label })}
        class="resize-y"
      />
    {/if}

  {:else if field.type === 'textarea'}
    <Textarea
      id={field.key}
      value={strVal}
      oninput={(e) => onchange((e.target as HTMLTextAreaElement).value)}
      required={field.required}
      rows={4}
      placeholder={t('field.enterValue', { label: field.label })}
      class="resize-y"
    />

  {:else if field.type === 'relation' && field.resource}
    <ComboboxField
      id={field.key}
      resource={field.resource}
      value={value as string | number | null}
      onchange={(v) => onchange(v)}
      optionLabel={field.optionLabel ?? 'title'}
      optionValue={field.optionValue ?? 'id'}
      placeholder={t('field.selectPlaceholder')}
    />

  {:else if field.type === 'select'}
    {#if (field.options?.length ?? 0) > 8}
      <!-- Many options → use ComboboxField-style search -->
      <ComboboxField
        id={field.key}
        resource=""
        value={value as string | number | null}
        onchange={(v) => onchange(v)}
        searchable={false}
      />
    {:else}
      <Select
        id={field.key}
        value={strVal}
        onchange={(e) => onchange((e.target as HTMLSelectElement).value)}
        required={field.required}
        placeholder={t('field.selectPlaceholder')}
      >
        {#each field.options ?? [] as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </Select>
    {/if}

  {:else if field.type === 'multiselect'}
    <div 
      class="space-y-2 rounded-lg border border-input p-3 max-h-48 overflow-y-auto"
      role="group" 
      aria-labelledby="label-{field.key}"
    >
      {#each field.options ?? [] as opt}
        <label class="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors">
          <Checkbox
            id={`${field.key}-${opt.value}`}
            checked={multiVal.includes(opt.value)}
            onCheckedChange={() => toggleMulti(opt.value)}
          />
          {opt.label}
        </label>
      {/each}
      {#if !(field.options?.length)}
        <p class="text-xs text-muted-foreground">{t('field.noOptions')}</p>
      {/if}
    </div>
    {#if multiVal.length > 0}
      <div class="flex flex-wrap gap-1 mt-1">
        {#each multiVal as v}
          {@const label = field.options?.find((o: { label: string; value: string | number }) => o.value === v)?.label ?? String(v)}
          <Badge variant="secondary" class="gap-1">
            {label}
            <button type="button" onclick={() => toggleMulti(v)} class="ml-0.5 rounded-sm hover:text-destructive hover:bg-destructive/10 transition-colors" aria-label={t('common.clear')}>×</button>
          </Badge>
        {/each}
      </div>
    {/if}

  {:else if field.type === 'boolean'}
    <div class="flex items-center gap-2 pt-1">
      <Switch
        id={field.key}
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
              class="ml-0.5 rounded-sm hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label={t('common.clear')}
            >×</button>
          </Badge>
        {/each}
      </div>
      <Input
        id={field.key}
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

  {:else if field.type === 'images'}
    <div class="space-y-2">
      {#each imagesVal as url, i}
        <div class="flex items-center gap-2">
          <Input
            id={i === 0 ? field.key : undefined}
            type="text"
            value={url}
            oninput={(e) => updateImage(i, (e.target as HTMLInputElement).value)}
            placeholder="https://example.com/image.jpg"
            class="flex-1"
          />
          {#if url}
            <img src={url} alt="preview" class="h-9 w-9 rounded object-cover border" />
          {/if}
          <TooltipButton tooltip={t('common.removeImage')} variant="ghost" size="icon" class="h-8 w-8 shrink-0" onclick={() => removeImage(i)}>
            <X class="h-3.5 w-3.5" />
          </TooltipButton>
        </div>
      {/each}
      <Button variant="outline" size="sm" type="button" onclick={addImage}>
        <Plus class="h-3.5 w-3.5 mr-1" /> {t('field.addImage')}
      </Button>
    </div>

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
