<script lang="ts">
  import { untrack } from 'svelte';
  import {
    createTable,
    getCoreRowModel,
    type ColumnDef,
    type SortingState,
    type RowSelectionState,
    type VisibilityState,
    type ExpandedState,
  } from '@tanstack/svelte-table';

  import { useList, useDelete, getResource } from '@svadmin/core';
  import type { Pagination as PaginationState, Sort, Filter, FieldDefinition } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { canAccess } from '@svadmin/core/permissions';
  import { readURLState, writeURLState } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { fade } from 'svelte/transition';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import { Checkbox } from './ui/checkbox/index.js';
  import { Badge } from './ui/badge/index.js';
  import * as Table from './ui/table/index.js';
  import { Skeleton } from './ui/skeleton/index.js';
  import * as Popover from './ui/popover/index.js';
  import * as DropdownMenu from './ui/dropdown-menu/index.js';
  import * as PaginationUI from './ui/pagination/index.js';
  import * as ContextMenu from './ui/context-menu/index.js';
  import { Select } from './ui/select/index.js';
  import {
    Plus, Pencil, Trash2,
    Search, Download, Upload, ChevronDown, ChevronUp, SlidersHorizontal, Filter as FilterIcon,
    Eye, Copy
  } from 'lucide-svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import TooltipButton from './TooltipButton.svelte';
  import type { Snippet } from 'svelte';

  // ─── Props with Snippet composability ─────────────────────────
  interface Props {
    resourceName: string;
    selectable?: boolean;
    /** Custom header actions (right side) */
    headerActions?: Snippet;
    /** Custom cell renderer per field */
    cellRenderer?: Snippet<[{ field: FieldDefinition; value: unknown; record: Record<string, unknown> }]>;
    /** Custom row actions (edit/delete column) */
    rowActions?: Snippet<[{ record: Record<string, unknown>; id: string | number }]>;
    /** Custom empty state */
    emptyState?: Snippet;
    /** Expandable row content */
    expandedRowRender?: Snippet<[{ record: Record<string, unknown> }]>;
    /** Externally controlled pagination */
    pagination?: { current: number; pageSize: number };
    /** Externally controlled sorters */
    sorters?: Sort[];
  }

  let {
    resourceName,
    selectable = true,
    headerActions,
    cellRenderer,
    rowActions,
    emptyState,
    expandedRowRender,
    pagination: externalPagination,
    sorters: externalSorters,
  }: Props = $props();

  const resource = $derived(getResource(resourceName));
  const primaryKey = $derived(resource.primaryKey ?? 'id');

  // ─── URL state + server-side state ────────────────────────────
  const urlState = readURLState();

  // Snapshot resource values for initial state (untrack to avoid reactive tracking)
  const initPageSize = untrack(() => resource.pageSize ?? 10);
  const initDefaultSort = untrack(() => resource.defaultSort);

  let pagination = $state<{ current: number; pageSize: number }>(untrack(() => externalPagination ?? {
    current: urlState.page ?? 1,
    pageSize: urlState.pageSize ?? initPageSize,
  }));
  let sorters = $state<Sort[]>(untrack(() =>
    externalSorters ??
    (urlState.sortField
      ? [{ field: urlState.sortField, order: urlState.sortOrder ?? 'asc' }]
      : initDefaultSort ? [initDefaultSort] : []))
  );
  let filters = $state<Filter[]>([]);
  let searchText = $state(urlState.search ?? '');

  // URL sync
  $effect(() => {
    writeURLState({
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sorters[0]?.field,
      sortOrder: sorters[0]?.order,
      search: searchText || undefined,
    });
  });

  // ─── Build active filters with search ─────────────────────────
  const searchableFields = $derived(resource.fields.filter(f => f.searchable));
  const filterableFields = $derived(resource.fields.filter(f => f.filterable));
  let filterValues = $state<Record<string, string>>({});
  const activeFilterCount = $derived(Object.values(filterValues).filter(v => v.trim()).length);
  const activeFilters = $derived.by(() => {
    const result: Filter[] = [...filters];
    if (searchText.trim() && searchableFields.length > 0) {
      result.push({ field: searchableFields[0].key, operator: 'contains', value: searchText });
    }
    // Add popover filters
    for (const [key, value] of Object.entries(filterValues)) {
      if (value.trim()) {
        result.push({ field: key, operator: 'contains', value: value.trim() });
      }
    }
    return result;
  });

  // ─── Data fetching ────────────────────────────────────────────
  const listResult = useList({
    get resource() { return resourceName; },
    get pagination() { return pagination; },
    get sorters() { return sorters; },
    get filters() { return activeFilters; },
  });
  const query = listResult.query;
  const deleteResult = useDelete({ get resource() { return resourceName; } });
  const deleteMutation = deleteResult.mutation;

  // ─── Permissions ──────────────────────────────────────────────
  const canCreate = $derived(canAccess(resourceName, 'create').can && resource.canCreate !== false);
  const canEdit = $derived(canAccess(resourceName, 'edit').can && resource.canEdit !== false);
  const canDelete = $derived(canAccess(resourceName, 'delete').can && resource.canDelete !== false);
  const canExport = $derived(canAccess(resourceName, 'export').can);

  // ─── TanStack Table state ────────────────────────────────────
  let sorting = $state<SortingState>(untrack(() =>
    sorters.map(s => ({ id: s.field, desc: s.order === 'desc' }))
  ));
  let columnVisibility = $state<VisibilityState>((() => {
    const vis: VisibilityState = {};
    for (const f of resource.fields) {
      if (f.showInList === false) vis[f.key] = false;
    }
    return vis;
  })());
  let rowSelection = $state<RowSelectionState>({});
  let expanded = $state.raw<ExpandedState>({});

  // Sync TanStack sorting → server sorters
  $effect(() => {
    const newSorters: Sort[] = sorting.map(s => ({
      field: s.id,
      order: s.desc ? 'desc' as const : 'asc' as const,
    }));
    if (JSON.stringify(newSorters) !== JSON.stringify(sorters)) {
      sorters = newSorters;
    }
  });

  // ─── Auto-generate columns from resource fields ──────────────
  const visibleFields = $derived(
    resource.fields.filter(f => f.showInList !== false)
  );

  const columns = $derived<ColumnDef<Record<string, unknown>>[]>([
    // Selection column
    ...(selectable && canDelete ? [{
      id: '_select',
      header: () => '',
      cell: () => '',
      size: 40,
      enableSorting: false,
    } satisfies ColumnDef<Record<string, unknown>>] : []),
    // Expand column
    ...(expandedRowRender ? [{
      id: '_expand',
      header: () => '',
      cell: () => '',
      size: 40,
      enableSorting: false,
    } satisfies ColumnDef<Record<string, unknown>>] : []),
    // Data columns
    ...visibleFields.map((field): ColumnDef<Record<string, unknown>> => ({
      id: field.key,
      accessorKey: field.key,
      header: () => field.label,
      size: field.width ? parseInt(String(field.width)) : undefined,
    })),
    // Actions column
    {
      id: '_actions',
      header: () => t('common.actions'),
      cell: () => '',
      size: 100,
      enableSorting: false,
    },
  ]);

  // ─── Create TanStack Table ────────────────────────────────────
  const tbl = createTable({
    get data() { return query.data?.data ?? []; },
    get columns() { return columns; },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    getRowId: (row) => String(row[primaryKey]),
    state: {
      get sorting() { return sorting; },
      get columnVisibility() { return columnVisibility; },
      get rowSelection() { return rowSelection; },
      get expanded() { return expanded; },
    },
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater;
    },
    onColumnVisibilityChange: (updater) => {
      columnVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
    },
    onRowSelectionChange: (updater) => {
      rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
    },
    onExpandedChange: (updater) => {
      expanded = typeof updater === 'function' ? updater(expanded) : updater;
    },
    get enableRowSelection() { return selectable && canDelete; },
    get enableExpanding() { return !!expandedRowRender; },
  });

  const selectedCount = $derived(Object.keys(rowSelection).length);
  const totalPages = $derived(Math.ceil((query.data?.total ?? 0) / (pagination.pageSize ?? 10)));

  // ─── Pagination helpers ───────────────────────────────────────
  const currentPage = $derived(pagination.current ?? 1);
  const pages = $derived.by(() => {
    const p: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) p.push(i);
    } else {
      p.push(1);
      if (currentPage > 3) p.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) p.push(i);
      if (currentPage < totalPages - 2) p.push('...');
      p.push(totalPages);
    }
    return p;
  });

  // ─── Confirm dialog ───────────────────────────────────────────
  let confirmOpen = $state(false);
  let confirmMessage = $state('');
  let confirmAction = $state<() => void>(() => {});

  function confirmDelete(id: string | number) {
    confirmMessage = t('common.deleteConfirm');
    confirmAction = async () => {
      await deleteMutation.mutateAsync({ id, resource: resourceName });
      confirmOpen = false;
    };
    confirmOpen = true;
  }

  function confirmBatchDelete() {
    const ids = Object.keys(rowSelection);
    confirmMessage = t('common.batchDeleteConfirm', { count: ids.length });
    confirmAction = async () => {
      for (const id of ids) {
        await deleteMutation.mutateAsync({ id, resource: resourceName });
      }
      rowSelection = {};
      confirmOpen = false;
    };
    confirmOpen = true;
  }

  // ─── CSV Export ───────────────────────────────────────────────
  function exportCSV() {
    const data = query.data?.data ?? [];
    if (data.length === 0) return;
    const headers = visibleFields.map(f => f.label);
    const rows = data.map(record =>
      visibleFields.map(f => {
        const val = record[f.key];
        if (val == null) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      })
    );
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v.replace(new RegExp('"', 'g'), '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${resourceName}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function goToPage(page: number) {
    pagination = { ...pagination, current: page };
  }
</script>

<div class="space-y-4">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-semibold text-foreground">{resource.label}</h1>
    <div class="flex items-center gap-2">
      {#if canExport}
        <Button variant="outline" size="sm" onclick={exportCSV}>
          <Download class="h-4 w-4" data-icon="inline-start" /> {t('common.export')}
        </Button>
      {/if}
      {#if selectedCount > 0 && canDelete}
        <Button variant="destructive" size="sm" onclick={confirmBatchDelete}>
          <Trash2 class="h-4 w-4" data-icon="inline-start" /> {t('common.batchDelete', { count: selectedCount })}
        </Button>
      {/if}
      <!-- Column Visibility Picker (DropdownMenu) -->
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button variant="outline" size="sm" {...props}>
              <SlidersHorizontal class="h-4 w-4" data-icon="inline-start" /> {t('common.columns') || 'Columns'}
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" class="w-48">
          {#each tbl.getAllLeafColumns().filter(c => !c.id.startsWith('_')) as column}
            <DropdownMenu.CheckboxItem
              checked={column.getIsVisible()}
              onCheckedChange={(v) => column.toggleVisibility(!!v)}
            >
              {visibleFields.find(f => f.key === column.id)?.label ?? column.id}
            </DropdownMenu.CheckboxItem>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      {#if headerActions}
        {@render headerActions()}
      {/if}
      {#if canCreate}
        <Button onclick={() => navigate(`/${resourceName}/create`)}>
          <Plus class="h-4 w-4" data-icon="inline-start" /> {t('common.create')}
        </Button>
      {/if}
    </div>
  </div>

  <!-- Search -->
  {#if searchableFields.length > 0}
    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        bind:value={searchText}
        oninput={() => { pagination = { ...pagination, current: 1 }; }}
        placeholder={t('common.search')}
        class="pl-10"
      />
    </div>
  {/if}

  <!-- Advanced Filters (Popover) -->
  {#if filterableFields.length > 0}
    <Popover.Root>
      <Popover.Trigger>
        {#snippet child({ props })}
          <Button variant="outline" size="sm" {...props}>
            <FilterIcon class="h-4 w-4" data-icon="inline-start" />
            {t('common.filter')}
            {#if activeFilterCount > 0}
              <Badge variant="secondary" class="ml-1 h-5 min-w-5 px-1">{activeFilterCount}</Badge>
            {/if}
          </Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content class="w-80">
        <div class="space-y-3">
          <h4 class="font-medium text-sm">{t('common.filter')}</h4>
          {#each filterableFields as field}
            <div class="space-y-1">
              <label class="text-xs text-muted-foreground" for="filter-{field.key}">{field.label}</label>
              <Input
                id="filter-{field.key}"
                type="text"
                bind:value={filterValues[field.key]}
                placeholder={field.label}
                class="h-8 text-sm"
              />
            </div>
          {/each}
          <div class="flex gap-2">
            <Button size="sm" class="flex-1" onclick={() => { pagination = { ...pagination, current: 1 }; }}>
              {t('common.confirm')}
            </Button>
            <Button variant="outline" size="sm" onclick={() => {
              filterValues = {};
              pagination = { ...pagination, current: 1 };
            }}>
              {t('common.reset')}
            </Button>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  {/if}

  <!-- Table (TanStack-powered) -->
  <div class="rounded-lg bg-card shadow-sm overflow-hidden">
    {#if query.isLoading}
      <div class="p-4 space-y-3">
        <div class="flex gap-4 mb-2">
          {#each visibleFields.slice(0, 4) as _}
            <Skeleton class="h-4 flex-1" />
          {/each}
        </div>
        {#each Array(5) as _}
          <div class="flex gap-4">
            {#each visibleFields.slice(0, 4) as __}
              <Skeleton class="h-8 flex-1" />
            {/each}
          </div>
        {/each}
      </div>
    {:else if query.error}
      <div class="flex h-64 items-center justify-center text-destructive text-sm">
        {t('common.loadFailed', { message: (query.error as Error).message })}
      </div>
    {:else}
      <div in:fade={{ duration: 150 }}>
        <!-- Desktop Table (hidden on mobile) -->
        <div class="hidden md:block">
        <Table.Root>
          <Table.Header>
            {#each tbl.getHeaderGroups() as headerGroup}
              <Table.Row class="bg-muted/50 hover:bg-muted/50">
                {#each headerGroup.headers as header}
                  <Table.Head
                    style={header.getSize() !== 150 ? `width:${header.getSize()}px` : undefined}
                  >
                    {#if header.id === '_select'}
                      <Checkbox
                        checked={tbl.getIsAllRowsSelected()}
                        onCheckedChange={() => tbl.toggleAllRowsSelected()}
                      />
                    {:else if header.id === '_expand'}
                      <!-- empty -->
                    {:else if header.id === '_actions'}
                      <span class="text-right block">{t('common.actions')}</span>
                    {:else if header.column.getCanSort()}
                      <Button
                        variant="ghost"
                        size="sm"
                        class="flex items-center gap-1 hover:text-foreground -ml-3 h-auto py-1 px-2"
                        onclick={() => header.column.toggleSorting()}
                      >
                        {visibleFields.find(f => f.key === header.id)?.label ?? header.id}
                        <span class="text-xs opacity-50">
                          {#if header.column.getIsSorted() === 'asc'}↑
                          {:else if header.column.getIsSorted() === 'desc'}↓
                          {:else}⇅
                          {/if}
                        </span>
                      </Button>
                    {:else}
                      {visibleFields.find(f => f.key === header.id)?.label ?? header.id}
                    {/if}
                  </Table.Head>
                {/each}
              </Table.Row>
            {/each}
          </Table.Header>
          <Table.Body>
            {#each tbl.getRowModel().rows as row}
              {@const record = row.original}
              {@const id = record[primaryKey] as string | number}
              <ContextMenu.Root>
                <ContextMenu.Trigger>
                  {#snippet child({ props })}
                    <Table.Row {...props} class="transition-colors {row.getIsSelected() ? 'bg-accent' : ''}">
                      {#each row.getVisibleCells() as cell}
                        <Table.Cell>
                          {#if cell.column.id === '_select'}
                            <Checkbox
                              checked={row.getIsSelected()}
                              onCheckedChange={() => row.toggleSelected()}
                            />
                          {:else if cell.column.id === '_expand'}
                            <TooltipButton tooltip={row.getIsExpanded() ? t('common.collapse') : t('common.expand')} variant="ghost" size="icon" class="h-7 w-7" onclick={() => row.toggleExpanded()}>
                              {#if row.getIsExpanded()}
                                <ChevronUp class="h-4 w-4" />
                              {:else}
                                <ChevronDown class="h-4 w-4" />
                              {/if}
                            </TooltipButton>
                          {:else if cell.column.id === '_actions'}
                            <div class="flex items-center justify-end gap-1">
                              {#if rowActions}
                                {@render rowActions({ record, id })}
                              {:else}
                                {#if canEdit}
                                  <TooltipButton tooltip={t('common.edit')} variant="ghost" size="icon-sm" onclick={() => navigate(`/${resourceName}/edit/${id}`)}>
                                    <Pencil class="h-4 w-4" />
                                  </TooltipButton>
                                {/if}
                                {#if canDelete}
                                  <TooltipButton tooltip={t('common.delete')} variant="ghost" size="icon-sm" onclick={() => confirmDelete(id)} class="hover:text-destructive">
                                    <Trash2 class="h-4 w-4" />
                                  </TooltipButton>
                                {/if}
                              {/if}
                            </div>
                          {:else}
                            {@const field = visibleFields.find(f => f.key === cell.column.id)}
                            {#if cellRenderer && field}
                              {@render cellRenderer({ field, value: cell.getValue(), record })}
                            {:else if field?.type === 'boolean'}
                              <span class="inline-block h-2 w-2 rounded-full {cell.getValue() ? 'bg-success' : 'bg-muted-foreground/30'}"></span>
                            {:else if field?.type === 'date' && cell.getValue()}
                              {new Date(cell.getValue() as string).toLocaleDateString()}
                            {:else if field?.type === 'tags' && Array.isArray(cell.getValue())}
                              <div class="flex flex-wrap gap-1">
                                {#each (cell.getValue() as string[]).slice(0, 3) as tag}
                                  <Badge variant="secondary">{tag}</Badge>
                                {/each}
                              </div>
                            {:else if field?.type === 'select' && field.options}
                              {@const opt = field.options.find(o => o.value === cell.getValue())}
                              <Badge variant="outline">{opt?.label ?? cell.getValue() ?? '—'}</Badge>
                            {:else}
                              {cell.getValue() ?? '—'}
                            {/if}
                          {/if}
                        </Table.Cell>
                      {/each}
                    </Table.Row>
                  {/snippet}
                </ContextMenu.Trigger>
                <ContextMenu.Content class="w-48">
                  {#if canEdit}
                    <ContextMenu.Item onclick={() => navigate(`/${resourceName}/edit/${id}`)} class="gap-2">
                      <Pencil class="h-4 w-4" /> {t('common.edit')}
                    </ContextMenu.Item>
                  {/if}
                  <ContextMenu.Item onclick={() => navigate(`/${resourceName}/show/${id}`)} class="gap-2">
                    <Eye class="h-4 w-4" /> {t('common.detail')}
                  </ContextMenu.Item>
                  <ContextMenu.Item onclick={() => navigator.clipboard?.writeText(String(id))} class="gap-2">
                    <Copy class="h-4 w-4" /> {t('common.copyId')}
                  </ContextMenu.Item>
                  {#if canDelete}
                    <ContextMenu.Separator />
                    <ContextMenu.Item onclick={() => confirmDelete(id)} class="gap-2 text-destructive">
                      <Trash2 class="h-4 w-4" /> {t('common.delete')}
                    </ContextMenu.Item>
                  {/if}
                </ContextMenu.Content>
              </ContextMenu.Root>
              {#if expandedRowRender && row.getIsExpanded()}
                <Table.Row class="bg-muted/30">
                  <Table.Cell colspan={row.getVisibleCells().length}>
                    {@render expandedRowRender({ record })}
                  </Table.Cell>
                </Table.Row>
              {/if}
            {:else}
              <Table.Row>
                <Table.Cell colspan={columns.length} class="h-24 text-center text-muted-foreground">
                  {#if emptyState}
                    {@render emptyState()}
                  {:else}
                    {t('common.noData')}
                  {/if}
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
        </div>

        <!-- Mobile Card View (visible only on small screens) -->
        <div class="md:hidden space-y-3 p-2">
          {#each tbl.getRowModel().rows as row}
            {@const record = row.original}
            {@const id = record[primaryKey] as string | number}
            <div
              class="rounded-xl border bg-card p-4 shadow-sm transition-colors {row.getIsSelected() ? 'ring-2 ring-primary bg-accent/30' : ''}"
            >
              <!-- Card header: ID + select + actions -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  {#if selectable && canDelete}
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={() => row.toggleSelected()}
                    />
                  {/if}
                  <span class="text-xs font-mono text-muted-foreground">#{id}</span>
                </div>
                <div class="flex items-center gap-1">
                  {#if rowActions}
                    {@render rowActions({ record, id })}
                  {:else}
                    {#if canEdit}
                      <TooltipButton tooltip={t('common.edit')} variant="ghost" size="icon-sm" onclick={() => navigate(`/${resourceName}/edit/${id}`)}>
                        <Pencil class="h-4 w-4" />
                      </TooltipButton>
                    {/if}
                    <TooltipButton tooltip={t('common.detail')} variant="ghost" size="icon-sm" onclick={() => navigate(`/${resourceName}/show/${id}`)}>
                      <Eye class="h-4 w-4" />
                    </TooltipButton>
                    {#if canDelete}
                      <TooltipButton tooltip={t('common.delete')} variant="ghost" size="icon-sm" onclick={() => confirmDelete(id)} class="hover:text-destructive">
                        <Trash2 class="h-4 w-4" />
                      </TooltipButton>
                    {/if}
                  {/if}
                </div>
              </div>
              <!-- Card fields -->
              <div class="space-y-2">
                {#each visibleFields.slice(0, 6) as field}
                  {@const value = record[field.key]}
                  <div class="flex items-start justify-between gap-4">
                    <span class="text-xs font-medium text-muted-foreground shrink-0">{field.label}</span>
                    <span class="text-sm text-right truncate max-w-[60%]">
                      {#if cellRenderer}
                        {@render cellRenderer({ field, value, record })}
                      {:else if field.type === 'boolean'}
                        <span class="inline-block h-2 w-2 rounded-full {value ? 'bg-success' : 'bg-muted-foreground/30'}"></span>
                      {:else if field.type === 'date' && value}
                        {new Date(value as string).toLocaleDateString()}
                      {:else if field.type === 'tags' && Array.isArray(value)}
                        <div class="flex flex-wrap gap-1 justify-end">
                          {#each (value as string[]).slice(0, 2) as tag}
                            <Badge variant="secondary" class="text-[10px]">{tag}</Badge>
                          {/each}
                        </div>
                      {:else if field.type === 'select' && field.options}
                        {@const opt = field.options.find(o => o.value === value)}
                        <Badge variant="outline" class="text-[10px]">{opt?.label ?? value ?? '—'}</Badge>
                      {:else}
                        {value ?? '—'}
                      {/if}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {:else}
            <div class="text-center py-10 text-muted-foreground">
              {#if emptyState}
                {@render emptyState()}
              {:else}
                {t('common.noData')}
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Pagination (shadcn) -->
  {#if totalPages > 0}
  <div class="flex items-center justify-between text-sm text-muted-foreground">
    <div class="flex items-center gap-2">
      <span>{t('common.total', { total: query.data?.total ?? 0 })}</span>
      <Select
        class="h-8 w-auto text-xs"
        value={String(pagination.pageSize ?? 10)}
        onchange={(e: Event) => {
          const size = Number((e.target as HTMLSelectElement).value);
          pagination = { ...pagination, pageSize: size, current: 1 };
        }}
      >
        {#each [10, 20, 50, 100] as size}
          <option value={size}>{size} / {t('common.perPage')}</option>
        {/each}
      </Select>
    </div>
    <PaginationUI.Root>
      <PaginationUI.Content>
        <PaginationUI.Item>
          <PaginationUI.Previous
            onclick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          />
        </PaginationUI.Item>
        {#each pages as page}
          <PaginationUI.Item>
            {#if page === '...'}
              <PaginationUI.Ellipsis />
            {:else}
              <PaginationUI.Link
                isActive={page === currentPage}
                onclick={() => goToPage(page as number)}
              >
                {page}
              </PaginationUI.Link>
            {/if}
          </PaginationUI.Item>
        {/each}
        <PaginationUI.Item>
          <PaginationUI.Next
            onclick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          />
        </PaginationUI.Item>
      </PaginationUI.Content>
    </PaginationUI.Root>
  </div>
  {/if}
</div>

<ConfirmDialog
  open={confirmOpen}
  message={confirmMessage}
  confirmText={t('common.delete')}
  onconfirm={confirmAction}
  oncancel={() => { confirmOpen = false; }}
/>
