<script lang="ts">
  import type { FieldDefinition } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';

  let { field, value, onchange } = $props<{
    field: FieldDefinition;
    value: unknown;
    onchange: (val: unknown) => void;
  }>();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (field.type === 'number') {
      onchange(parseFloat(target.value) || 0);
    } else if (field.type === 'boolean') {
      onchange((target as HTMLInputElement).checked);
    } else {
      onchange(target.value);
    }
  }
</script>

<div class="space-y-1.5">
  <label class="block text-sm font-medium text-gray-700" for={field.key}>
    {field.label}
    {#if field.required}
      <span class="text-red-500">*</span>
    {/if}
  </label>

  {#if field.type === 'text' || field.type === 'image'}
    <input
      id={field.key}
      type="text"
      value={value as string ?? ''}
      oninput={handleInput}
      required={field.required}
      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      placeholder={t('field.enterValue', { label: field.label })}
    />

  {:else if field.type === 'number'}
    <input
      id={field.key}
      type="number"
      value={value as number ?? 0}
      oninput={handleInput}
      required={field.required}
      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    />

  {:else if field.type === 'textarea' || field.type === 'richtext'}
    <textarea
      id={field.key}
      value={value as string ?? ''}
      oninput={handleInput}
      required={field.required}
      rows={field.type === 'richtext' ? 10 : 4}
      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
      placeholder={t('field.enterValue', { label: field.label })}
    ></textarea>

  {:else if field.type === 'select'}
    <select
      id={field.key}
      value={value as string ?? ''}
      onchange={handleInput}
      required={field.required}
      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
    >
      <option value="">{t('field.selectPlaceholder')}</option>
      {#each field.options ?? [] as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>

  {:else if field.type === 'boolean'}
    <label class="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={value as boolean ?? false}
        onchange={handleInput}
        class="peer sr-only"
      />
      <div class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-primary/20"></div>
    </label>

  {:else if field.type === 'tags'}
    {@const tags = (value as string[] ?? [])}
    <div class="space-y-2">
      <div class="flex flex-wrap gap-1.5">
        {#each tags as tag, i}
          <span class="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
            {tag}
            <button
              type="button"
              onclick={() => onchange(tags.filter((_, idx) => idx !== i))}
              class="text-primary-400 hover:text-primary-700"
            >×</button>
          </span>
        {/each}
      </div>
      <input
        type="text"
        placeholder={t('field.tagsPlaceholder')}
        class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const input = e.target as HTMLInputElement;
            if (input.value.trim()) {
              onchange([...tags, input.value.trim()]);
              input.value = '';
            }
          }
        }}
      />
    </div>

  {:else if field.type === 'date'}
    <input
      id={field.key}
      type="date"
      value={value as string ?? ''}
      oninput={handleInput}
      required={field.required}
      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    />

  {:else if field.type === 'json'}
    <textarea
      id={field.key}
      value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      oninput={(e) => {
        try {
          onchange(JSON.parse((e.target as HTMLTextAreaElement).value));
        } catch (err) {
          console.debug('[FieldRenderer] Invalid JSON input:', err);
        }
      }}
      rows={6}
      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
    ></textarea>

  {:else}
    <input
      id={field.key}
      type="text"
      value={value as string ?? ''}
      oninput={handleInput}
      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    />
  {/if}
</div>
