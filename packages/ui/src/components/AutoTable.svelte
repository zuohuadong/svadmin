<script lang="ts">
  import {
    createSvelteTable,
    getCoreRowModel,
    type ColumnDef,
    type SortingState,
    type RowSelectionState,
    type VisibilityState,
    type ExpandedState,
    flexRender,
  } from '@tanstack/svelte-table';
  import { get } from 'svelte/store';
  import { useList, useDelete, getResource } from '@svadmin/core';
  import type { Pagination, Sort, Filter, FieldDefinition } from '@svadmin/core';
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
  import {
    Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
    Search, Download, Upload, ChevronDown, ChevronUp, SlidersHorizontal, Filter as FilterIcon,
  } from 'lucide-svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
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
    expandedRowRender?: Snippet<[record: Record<string, unknown>]>;
  }

  let {
    resourceName,
    selectable = true,
    headerActions,
    cellRenderer,
    rowActions,
    emptyState,
    expandedRowRender,
  }: Props = $props();

  const resource = getResource(resourceName);
  const primaryKey = $derived(resource.primaryKey ?? 'id');

  // ─── URL state + server-side state ────────────────────────────
  const urlState = readURLState();

  let pagination = $state<Pagination>({
    current: urlState.page ?? 1,
    pageSize: urlState.pageSize ?? resource.pageSize ?? 10,
  });
  let sorters = $state<Sort[]>(
    urlState.sortField
      ? [{ field: urlState.sortField, order: urlState.sortOrder ?? 'asc' }]
      : resource.defaultSort ? [resource.defaultSort] : []
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
  const searchableFields = resource.fields.filter(f => f.searchable);
  const filterableFields = resource.fields.filter(f => (f as any).filterable);
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
  const listResult = useList({ resource: resourceName, pagination, sorters, filters: activeFilters });
  const query = listResult.query;
  const deleteResult = useDelete({ resource: resourceName });
  const deleteMutation = deleteResult.mutation;

  // ─── Permissions ──────────────────────────────────────────────
  const canCreate = canAccess(resourceName, 'create').can && resource.canCreate !== false;
  const canEdit = canAccess(resourceName, 'edit').can && resource.canEdit !== false;
  const canDelete = canAccess(resourceName, 'delete').can && resource.canDelete !== false;
  const canExport = canAccess(resourceName, 'export').can;

  // ─── TanStack Table state ────────────────────────────────────
  let sorting = $state<SortingState>(
    sorters.map(s => ({ id: s.field, desc: s.order === 'desc' }))
  );
  let columnVisibility = $state<VisibilityState>((() => {
    const vis: VisibilityState = {};
    for (const f of resource.fields) {
      if (f.showInList === false) vis[f.key] = false;
    }
    return vis;
  })());
  let rowSelection = $state<RowSelectionState>({});
  let expanded = $state<ExpandedState>({});

  // Sync TanStack sorting → server sorters
  $effect(() => {
    const newSorters: Sort[] = sorting.map(s => ({
      field: s.id,
      order: s.desc ? 'desc' as const : 'asc' as const,
    }));
    // Only update if actually different
    if (JSON.stringify(newSorters) !== JSON.stringify(sorters)) {
      sorters = newSorters;
    }
  });

  // ─── Auto-generate columns from resource fields ──────────────
  const visibleFields = $derived(
    resource.fields.filter(f => f.showInList !== false)
  );

  function renderCellValue(field: FieldDefinition, value: unknown, record: Record<string, unknown>): string {
    if (value == null) return '—';
    if (field.type === 'date') return new Date(value as string).toLocaleDateString();
    if (field.type === 'boolean') return value ? '✓' : '✗';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

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
  const tableStore = createSvelteTable({
    get data() { return query.data?.data ?? []; },
    columns,
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
    enableRowSelection: selectable && canDelete,
    enableExpanding: !!expandedRowRender,
  });

  // Unwrap the Readable<Table> store into a reactive value
  const tbl = $derived(get(tableStore));
  const selectedCount = $derived(Object.keys(rowSelection).length);
  const totalPages = $derived(Math.ceil((query.data?.total ?? 0) / (pagination.pageSize ?? 10)));

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
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${resourceName}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // Column picker
  let showColumnPicker = $state(false);
</script>

<div class="space-y-4">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-foreground">{resource.label}</h1>
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
      <!-- Column Visibility Picker -->
      <div class="relative">
        <Button variant="outline" size="sm" onclick={() => showColumnPicker = !showColumnPicker}>
          <SlidersHorizontal class="h-4 w-4" data-icon="inline-start" /> {t('common.columns') || 'Columns'}
        </Button>
        {#if showColumnPicker}
          <div class="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border bg-popover p-2 shadow-lg">
            {#each tbl.getAllLeafColumns().filter(c => !c.id.startsWith('_')) as column}
              <label class="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent cursor-pointer">
                <Checkbox
                  checked={column.getIsVisible()}
                  onCheckedChange={(v: boolean) => column.toggleVisibility(!!v)}
                />
                {visibleFields.find(f => f.key === column.id)?.label ?? column.id}
              </label>
            {/each}
          </div>
        {/if}
      </div>
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
  <div class="rounded-xl border border-border/60 bg-card shadow-md overflow-hidden">
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
                      <button
                        class="flex items-center gap-1 hover:text-foreground"
                        onclick={() => header.column.toggleSorting()}
                      >
                        {visibleFields.find(f => f.key === header.id)?.label ?? header.id}
                        <span class="text-xs opacity-50">
                          {#if header.column.getIsSorted() === 'asc'}↑
                          {:else if header.column.getIsSorted() === 'desc'}↓
                          {:else}⇅
                          {/if}
                        </span>
                      </button>
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
              <Table.Row class="transition-colors {row.getIsSelected() ? 'bg-accent' : ''}">
                {#each row.getVisibleCells() as cell}
                  <Table.Cell>
                    {#if cell.column.id === '_select'}
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={() => row.toggleSelected()}
                      />
                    {:else if cell.column.id === '_expand'}
                      <button class="p-1 hover:bg-accent rounded" onclick={() => row.toggleExpanded()}>
                        {#if row.getIsExpanded()}
                          <ChevronUp class="h-4 w-4" />
                        {:else}
                          <ChevronDown class="h-4 w-4" />
                        {/if}
                      </button>
                    {:else if cell.column.id === '_actions'}
                      <div class="flex items-center justify-end gap-1">
                        {#if rowActions}
                          {@render rowActions({ record, id })}
                        {:else}
                          {#if canEdit}
                            <Button variant="ghost" size="icon-sm" onclick={() => navigate(`/${resourceName}/edit/${id}`)} title={t('common.edit')}>
                              <Pencil class="h-4 w-4" />
                            </Button>
                          {/if}
                          {#if canDelete}
                            <Button variant="ghost" size="icon-sm" onclick={() => confirmDelete(id)} title={t('common.delete')} class="hover:text-destructive">
                              <Trash2 class="h-4 w-4" />
                            </Button>
                          {/if}
                        {/if}
                      </div>
                    {:else}
                      {@const field = visibleFields.find(f => f.key === cell.column.id)}
                      {#if cellRenderer && field}
                        {@render cellRenderer({ field, value: cell.getValue(), record })}
                      {:else if field?.type === 'boolean'}
                        <span class="inline-block h-2 w-2 rounded-full {cell.getValue() ? 'bg-green-500' : 'bg-muted-foreground/30'}"></span>
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
              {#if expandedRowRender && row.getIsExpanded()}
                <Table.Row class="bg-muted/30">
                  <Table.Cell colspan={row.getVisibleCells().length}>
                    {@render expandedRowRender(record)}
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
    {/if}
  </div>

  <!-- Pagination -->
  {#if totalPages > 0}
  {@const currentPage = pagination.current ?? 1}
  {@const pages = (() => {
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
  })()}
  <div class="flex items-center justify-between text-sm text-muted-foreground">
    <div class="flex items-center gap-2">
      <span>{t('common.total', { total: query.data?.total ?? 0 })}</span>
      <select
        class="h-8 rounded-md border border-input bg-background px-2 text-xs"
        value={pagination.pageSize ?? 10}
        onchange={(e: Event) => {
          const size = Number((e.target as HTMLSelectElement).value);
          pagination = { ...pagination, pageSize: size, current: 1 };
        }}
      >
        {#each [10, 20, 50, 100] as size}
          <option value={size}>{size} / {t('common.page', { current: '', total: '' }).replace(/[\d\s/]/g, '').trim() || 'page'}</option>
        {/each}
      </select>
    </div>
    <div class="flex items-center gap-1">
      <Button
        variant="outline" size="icon-sm"
        onclick={() => { pagination = { ...pagination, current: Math.max(1, currentPage - 1) }; }}
        disabled={currentPage <= 1}
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>
      {#each pages as page}
        {#if page === '...'}
          <span class="px-2 text-muted-foreground">…</span>
        {:else}
          <Button
            variant={page === currentPage ? 'default' : 'outline'}
            size="icon-sm"
            onclick={() => { pagination = { ...pagination, current: page as number }; }}
          >
            {page}
          </Button>
        {/if}
      {/each}
      <Button
        variant="outline" size="icon-sm"
        onclick={() => { pagination = { ...pagination, current: Math.min(totalPages, currentPage + 1) }; }}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
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
