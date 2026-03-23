import { useParsed } from './useParsed';
import { useList } from './query-hooks.svelte';
import { readURLState, writeURLState } from './url-sync';
import type { Pagination, Sort, Filter, BaseRecord, HttpError, KnownResources, GetListResult } from './types';
import type { UseListOptions } from './query-hooks.svelte';

export type FilterSetMode = 'merge' | 'replace';

export interface UseTableOptions<TQueryFnData extends BaseRecord = BaseRecord, TError = HttpError, TSearchVariables = Record<string, unknown>> extends Omit<UseListOptions<TQueryFnData, TError>, 'pagination' | 'sorters' | 'filters'> {
  resource?: KnownResources;
  pagination?: Pagination;
  sorters?: {
    initial?: Sort[];
    permanent?: Sort[];
    mode?: 'off' | 'server';
  };
  filters?: {
    initial?: Filter[];
    permanent?: Filter[];
    mode?: 'off' | 'server';
    defaultBehavior?: FilterSetMode;
  };
  syncWithLocation?: boolean;
}

export function useTable<
  TQueryFnData extends BaseRecord = BaseRecord,
  TError = HttpError,
  TSearchVariables = Record<string, unknown>
>(options: UseTableOptions<TQueryFnData, TError, TSearchVariables> = {}) {
  const parsed = useParsed();
  const resource = options.resource ?? parsed.resource ?? '';
  const { meta, syncWithLocation = false, dataProviderName, pagination: _p, sorters: _s, filters: _f, ...restOptions } = options;
  
  const paginationMode = options.pagination?.mode ?? 'server';
  const sortersMode = options.sorters?.mode ?? 'server';
  const filtersMode = options.filters?.mode ?? 'server';
  const filterDefaultBehavior = options.filters?.defaultBehavior ?? 'replace';

  const permanentSorters = options.sorters?.permanent ?? [];
  const permanentFilters = options.filters?.permanent ?? [];

  let initPagination = options.pagination ?? { current: 1, pageSize: 10 };
  let initSorters = options.sorters?.initial ?? [];
  let initFilters = options.filters?.initial ?? [];

  if (syncWithLocation && typeof window !== 'undefined') {
    const urlState = readURLState();
    if (urlState.page || urlState.pageSize) {
      initPagination = {
        current: urlState.page ?? initPagination.current,
        pageSize: urlState.pageSize ?? initPagination.pageSize,
      };
    }
    if (urlState.sortField) {
      initSorters = [{ field: urlState.sortField, order: (urlState.sortOrder as 'asc' | 'desc') ?? 'asc' }];
    }
    if (urlState.filters) {
      initFilters = urlState.filters;
    }
  }

  let pagination = $state<Pagination>(initPagination);
  let currentSorters = $state<Sort[]>(initSorters);
  let currentFilters = $state<Filter[]>(initFilters);

  const effectiveSorters = $derived([...currentSorters, ...permanentSorters]);
  const effectiveFilters = $derived([...currentFilters, ...permanentFilters]);

  const querySorters = $derived(sortersMode === 'server' ? effectiveSorters : []);
  const queryFilters = $derived(filtersMode === 'server' ? effectiveFilters : []);
  const queryPagination = paginationMode === 'server'
    ? pagination
    : { current: 1, pageSize: 999999, mode: paginationMode as 'client' | 'off' };

  const tableQueryInfo = useList<TQueryFnData, TError>({
    resource,
    pagination: queryPagination,
    sorters: querySorters,
    filters: queryFilters,
    meta,
    dataProviderName,
    ...restOptions
  });

  const query = tableQueryInfo.query;
  const overtime = tableQueryInfo.overtime;

  function setSorters(newSorters: Sort[]) { currentSorters = newSorters; }
  function setFilters(newFilters: Filter[], mode?: FilterSetMode) {
    const behavior = mode ?? filterDefaultBehavior;
    if (behavior === 'merge') {
      const merged = [...currentFilters];
      for (const nf of newFilters) {
        const idx = merged.findIndex(f => f.field === nf.field && f.operator === nf.operator);
        if (idx >= 0) {
          if (nf.value === undefined || nf.value === null || nf.value === '') merged.splice(idx, 1);
          else merged[idx] = nf;
        } else if (nf.value !== undefined && nf.value !== null && nf.value !== '') {
          merged.push(nf);
        }
      }
      currentFilters = merged;
    } else {
      currentFilters = newFilters;
    }
    pagination = { ...pagination, current: 1 };
  }

  function setPage(page: number) { pagination = { ...pagination, current: page }; }
  function setPageSize(size: number) { pagination = { ...pagination, pageSize: size, current: 1 }; }

  if (syncWithLocation && typeof window !== 'undefined') {
    $effect(() => {
      writeURLState({
        page: pagination.current,
        pageSize: pagination.pageSize,
        sortField: effectiveSorters[0]?.field,
        sortOrder: effectiveSorters[0]?.order,
        filters: effectiveFilters,
      });
    });
  }

  function createLinkForSyncWithLocation(): string {
    const params = new URLSearchParams();
    if (pagination.current) params.set('page', String(pagination.current));
    if (pagination.pageSize) params.set('pageSize', String(pagination.pageSize));
    if (effectiveSorters[0]) {
      params.set('sortField', effectiveSorters[0].field);
      params.set('sortOrder', effectiveSorters[0].order);
    }
    if (effectiveFilters.length > 0) {
      params.set('filters', JSON.stringify(effectiveFilters));
    }
    return `?${params.toString()}`;
  }

  return {
    query,
    tableQuery: query,
    get overtime() { return overtime; },
    get pagination() { return pagination; },
    get sorters() { return currentSorters; },
    get filters() { return currentFilters; },
    setSorters, setFilters, setPage, setPageSize,
    setCurrentPage: setPage,
    createLinkForSyncWithLocation,
    get totalPages() {
      // ts-expect-error reactive access
      const total = (query.data as GetListResult<TQueryFnData> | undefined)?.total ?? 0;
      return Math.ceil(total / (pagination.pageSize ?? 10));
    },
    get current() { return pagination.current ?? 1; },
    get pageSize() { return pagination.pageSize ?? 10; },
    get pageCount() { return Math.ceil(((query.data as GetListResult<TQueryFnData> | undefined)?.total ?? 0) / (pagination.pageSize ?? 10)); },
    get clientData(): TQueryFnData[] {
      if (paginationMode !== 'client') return [];
      const allData = ((query.data as GetListResult<TQueryFnData> | undefined)?.data ?? []) as TQueryFnData[];
      const start = ((pagination.current ?? 1) - 1) * (pagination.pageSize ?? 10);
      const end = start + (pagination.pageSize ?? 10);
      let sorted = [...allData];
      const activeSorters = sortersMode === 'off' ? effectiveSorters : currentSorters;
      if (activeSorters.length > 0) {
        const { field, order } = activeSorters[0];
        sorted.sort((a, b) => {
          const va = (a as Record<string, unknown>)[field];
          const vb = (b as Record<string, unknown>)[field];
          if (va == null) return 1;
          if (vb == null) return -1;
          const cmp = va < vb ? -1 : va > vb ? 1 : 0;
          return order === 'desc' ? -cmp : cmp;
        });
      }
      return sorted.slice(start, end);
    },
  };
}
