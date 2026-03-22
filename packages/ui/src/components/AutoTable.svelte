<script lang="ts">
  import { useList, useDelete, getResource } from '@svadmin/core';
  import type { Pagination, Sort, Filter } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { canAccess } from '@svadmin/core/permissions';
  import { readURLState, writeURLState } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import { Checkbox } from './ui/checkbox/index.js';
  import { Badge } from './ui/badge/index.js';
  import * as Table from './ui/table/index.js';
  import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search, Loader2, Download, Upload } from 'lucide-svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';

  let { resourceName } = $props<{ resourceName: string }>();

  const resource = getResource(resourceName);
  const primaryKey = $derived(resource.primaryKey ?? 'id');

  // URL state init
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

  // Batch selection
  let selectedIds = $state<Set<string | number>>(new Set());
  let selectAll = $state(false);

  // Confirm dialog
  let confirmOpen = $state(false);
  let confirmMessage = $state('');
  let confirmAction = $state<() => void>(() => {});

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

  const searchableFields = resource.fields.filter(f => f.searchable);
  const listFields = resource.fields.filter(f => f.showInList !== false);

  const activeFilters = $derived.by(() => {
    const result: Filter[] = [...filters];
    if (searchText.trim() && searchableFields.length > 0) {
      result.push({ field: searchableFields[0].key, operator: 'contains', value: searchText });
    }
    return result;
  });

  const query = useList({
    resource: resourceName,
    pagination,
    sorters,
    filters: activeFilters,
  });

  const deleteMutation = useDelete(resourceName);

  function toggleSort(field: string) {
    const existing = sorters.find(s => s.field === field);
    if (!existing) {
      sorters = [{ field, order: 'asc' }];
    } else if (existing.order === 'asc') {
      sorters = [{ field, order: 'desc' }];
    } else {
      sorters = [];
    }
  }

  function getSortIcon(field: string): string {
    const s = sorters.find(ss => ss.field === field);
    if (!s) return '⇅';
    return s.order === 'asc' ? '↑' : '↓';
  }

  // Batch operations
  function toggleSelect(id: string | number) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    selectedIds = next;
  }

  function toggleSelectAll() {
    if (selectAll) {
      selectedIds = new Set();
      selectAll = false;
    } else {
      const allIds = ($query.data?.data ?? []).map(r => r[primaryKey] as string | number);
      selectedIds = new Set(allIds);
      selectAll = true;
    }
  }

  function confirmDelete(id: string | number) {
    confirmMessage = t('common.deleteConfirm');
    confirmAction = async () => {
      await $deleteMutation.mutateAsync(id);
      confirmOpen = false;
    };
    confirmOpen = true;
  }

  function confirmBatchDelete() {
    confirmMessage = t('common.batchDeleteConfirm', { count: selectedIds.size });
    confirmAction = async () => {
      for (const id of selectedIds) {
        await $deleteMutation.mutateAsync(id);
      }
      selectedIds = new Set();
      selectAll = false;
      confirmOpen = false;
    };
    confirmOpen = true;
  }

  // CSV Export
  function exportCSV() {
    const data = $query.data?.data ?? [];
    if (data.length === 0) return;

    const headers = listFields.map(f => f.label);
    const rows = data.map(record =>
      listFields.map(f => {
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

  // CSV Import
  function handleImportCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      alert(`Import: selected ${file.name}, batch create API needed`);
    };
    input.click();
  }

  // Permissions
  const canCreate = canAccess(resourceName, 'create').can && resource.canCreate !== false;
  const canEdit = canAccess(resourceName, 'edit').can && resource.canEdit !== false;
  const canDelete = canAccess(resourceName, 'delete').can && resource.canDelete !== false;
  const canExport = canAccess(resourceName, 'export').can;

  const totalPages = $derived(Math.ceil(($query.data?.total ?? 0) / (pagination.pageSize ?? 10)));
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
        <Button variant="outline" size="sm" onclick={handleImportCSV}>
          <Upload class="h-4 w-4" data-icon="inline-start" /> {t('common.import')}
        </Button>
      {/if}
      {#if selectedIds.size > 0 && canDelete}
        <Button variant="destructive" size="sm" onclick={confirmBatchDelete}>
          <Trash2 class="h-4 w-4" data-icon="inline-start" /> {t('common.batchDelete', { count: selectedIds.size })}
        </Button>
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

  <!-- Table -->
  <div class="rounded-xl border border-border bg-card shadow-sm">
    {#if $query.isLoading}
      <div class="flex h-64 items-center justify-center">
        <Loader2 class="h-6 w-6 animate-spin text-primary" />
      </div>
    {:else if $query.error}
      <div class="flex h-64 items-center justify-center text-destructive text-sm">
        {t('common.loadFailed', { message: ($query.error as Error).message })}
      </div>
    {:else}
      <Table.Root>
        <Table.Header>
          <Table.Row class="bg-muted/50 hover:bg-muted/50">
            {#if canDelete}
              <Table.Head class="w-10">
                <Checkbox checked={selectAll} onCheckedChange={() => toggleSelectAll()} />
              </Table.Head>
            {/if}
            {#each listFields as field}
              <Table.Head style={field.width ? `width:${field.width}` : undefined}>
                <button class="flex items-center gap-1 hover:text-foreground" onclick={() => toggleSort(field.key)}>
                  {field.label}
                  <span class="text-xs opacity-50">{getSortIcon(field.key)}</span>
                </button>
              </Table.Head>
            {/each}
            <Table.Head class="text-right">{t('common.actions')}</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each $query.data?.data ?? [] as record}
            {@const id = record[primaryKey] as string | number}
            <Table.Row class={selectedIds.has(id) ? 'bg-accent' : ''}>
              {#if canDelete}
                <Table.Cell>
                  <Checkbox checked={selectedIds.has(id)} onCheckedChange={() => toggleSelect(id)} />
                </Table.Cell>
              {/if}
              {#each listFields as field}
                <Table.Cell>
                  {#if field.type === 'boolean'}
                    <span class="inline-block h-2 w-2 rounded-full {record[field.key] ? 'bg-green-500' : 'bg-muted-foreground/30'}"></span>
                  {:else if field.type === 'date' && record[field.key]}
                    {new Date(record[field.key] as string).toLocaleDateString('zh-CN')}
                  {:else if field.type === 'tags' && Array.isArray(record[field.key])}
                    <div class="flex flex-wrap gap-1">
                      {#each (record[field.key] as string[]).slice(0, 3) as tag}
                        <Badge variant="secondary">{tag}</Badge>
                      {/each}
                    </div>
                  {:else if field.type === 'select' && field.options}
                    {@const opt = field.options.find(o => o.value === record[field.key])}
                    <Badge variant="outline">{opt?.label ?? record[field.key] ?? '—'}</Badge>
                  {:else}
                    {record[field.key] ?? '—'}
                  {/if}
                </Table.Cell>
              {/each}
              <Table.Cell class="text-right">
                <div class="flex items-center justify-end gap-1">
                  {#if canEdit}
                    <Button
                      variant="ghost" size="icon-sm"
                      onclick={() => navigate(`/${resourceName}/edit/${id}`)}
                      title={t('common.edit')}
                    >
                      <Pencil class="h-4 w-4" />
                    </Button>
                  {/if}
                  {#if canDelete}
                    <Button
                      variant="ghost" size="icon-sm"
                      onclick={() => confirmDelete(id)}
                      title={t('common.delete')}
                      class="hover:text-destructive"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  {/if}
                </div>
              </Table.Cell>
            </Table.Row>
          {:else}
            <Table.Row>
              <Table.Cell colspan={listFields.length + (canDelete ? 2 : 1)} class="h-24 text-center text-muted-foreground">
                {t('common.noData')}
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    {/if}
  </div>

  <!-- Pagination -->
  <div class="flex items-center justify-between text-sm text-muted-foreground">
    <span>{t('common.total', { total: $query.data?.total ?? 0 })}</span>
    <div class="flex items-center gap-2">
      <Button
        variant="outline" size="icon-sm"
        onclick={() => { pagination = { ...pagination, current: Math.max(1, (pagination.current ?? 1) - 1) }; }}
        disabled={(pagination.current ?? 1) <= 1}
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <span>{t('common.page', { current: pagination.current ?? 1, total: totalPages || 1 })}</span>
      <Button
        variant="outline" size="icon-sm"
        onclick={() => { pagination = { ...pagination, current: Math.min(totalPages, (pagination.current ?? 1) + 1) }; }}
        disabled={(pagination.current ?? 1) >= totalPages}
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>

<ConfirmDialog
  open={confirmOpen}
  message={confirmMessage}
  confirmText={t('common.delete')}
  onconfirm={confirmAction}
  oncancel={() => { confirmOpen = false; }}
/>
