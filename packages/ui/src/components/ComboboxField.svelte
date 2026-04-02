<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import { useSelect } from '@svadmin/core';
  import type { Filter } from '@svadmin/core';
  import { Button } from './ui/button/index.js';
  import TooltipButton from './TooltipButton.svelte';
  import { Badge } from './ui/badge/index.js';
  import { Command } from 'cmdk-sv';
  import { Skeleton } from './ui/skeleton/index.js';
  import { ChevronsUpDown, Check, X, Search } from 'lucide-svelte';

  interface Props {
    resource: string;
    value?: string | number | null;
    onchange?: (value: string | number | null) => void;
    optionLabel?: string;
    optionValue?: string;
    placeholder?: string;
    searchable?: boolean;
    onSearch?: (value: string) => Filter[];
    id?: string;
    class?: string;
    [key: string]: any;
  }

  let {
    resource,
    value = null,
    onchange,
    optionLabel = 'title',
    optionValue = 'id',
    placeholder = 'Select...',
    searchable = true,
    onSearch,
    ...restProps
  }: Props = $props();

  const { options, query, onSearchChange } = useSelect({
    get resource() { return resource; },
    get optionLabel() { return optionLabel; },
    get optionValue() { return optionValue; },
    get onSearch() { return onSearch ?? (searchable ? (v: string) => v ? [{ field: optionLabel, operator: 'contains' as const, value: v }] : [] : undefined); },
  });

  let open = $state(false);
  let searchInputValue = $state('');

  const selectedLabel = $derived(
    (options as { label: string; value: string | number }[])?.find(
      (o: { label: string; value: string | number }) => o.value === value
    )?.label ?? ''
  );

  function handleSelect(optValue: string | number) {
    onchange?.(optValue === value ? null : optValue);
    open = false;
    searchInputValue = '';
  }

  function handleClear(e: Event) {
    e.stopPropagation();
    onchange?.(null);
  }

  function handleSearchInput(e: Event) {
    const v = (e.currentTarget as HTMLInputElement).value;
    searchInputValue = v;
    onSearchChange(v);
  }
</script>

<div class="relative">
  <Button
    variant="outline"
    type="button"
    class="w-full justify-between font-normal"
    onclick={() => { open = !open; }}
    {...restProps}
  >
    {#if selectedLabel}
      <span class="truncate">{selectedLabel}</span>
      <TooltipButton tooltip={t('common.clear')} size="icon-sm" class="h-5 w-5 ml-1" onclick={handleClear}>
        <X class="h-3 w-3" />
      </TooltipButton>
    {:else}
      <span class="text-muted-foreground">{placeholder}</span>
    {/if}
    <ChevronsUpDown class="ml-auto h-4 w-4 shrink-0 opacity-50" />
  </Button>

  {#if open}
    <div class="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
      <Command.Root class="flex flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
        {#if searchable}
          <div class="flex items-center border-b px-2">
            <Search class="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-50" />
            <Command.Input
              bind:value={searchInputValue}
              oninput={handleSearchInput}
              placeholder="Search..."
              class="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        {/if}
        <Command.List class="max-h-48 overflow-y-auto p-1">
          <Command.Empty class="py-4 text-center text-xs text-muted-foreground">
            No results.
          </Command.Empty>
          {#if query.isLoading}
            {#each Array(3) as _}
              <div class="px-2 py-1.5"><Skeleton class="h-5 w-full" /></div>
            {/each}
          {:else}
            {#each (options as { label: string; value: string | number }[]) ?? [] as opt}
              <Command.Item
                value={opt.label}
                onSelect={() => handleSelect(opt.value)}
                class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
              >
                <Check class="mr-2 h-3.5 w-3.5 {value === opt.value ? 'opacity-100' : 'opacity-0'}" />
                {opt.label}
              </Command.Item>
            {/each}
          {/if}
        </Command.List>
      </Command.Root>
    </div>
  {/if}
</div>
