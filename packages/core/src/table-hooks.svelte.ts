import { useParsed } from './useParsed.svelte';
import { useList } from './query-hooks.svelte';
import { readURLState, writeURLState } from './url-sync';
import type { Pagination, Sort, Filter, BaseRecord, HttpError, KnownResources, GetListResult } from './types';
import type { UseListOptions, MaybeGetter } from './query-hooks.svelte';

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
>(optionsOrGetter: MaybeGetter<UseTableOptions<TQueryFnData, TError, TSearchVariables>> = {}) {
  const getOptions = () => typeof optionsOrGetter === 'function' ? optionsOrGetter() : optionsOrGetter;
  const parsed = useParsed();
  
  // Use a local derived to compute these since they are used to initialize state
  // Even if options change, init values are only used once, which makes sense for initial state
  const initialOpts = getOptions();
  
  const paginationMode = $derived(getOptions().pagination?.mode ?? 'server');
  const sortersMode = $derived(getOptions().sorters?.mode ?? 'server');
  const filtersMode = $derived(getOptions().filters?.mode ?? 'server');
  const filterDefaultBehavior = $derived(getOptions().filters?.defaultBehavior ?? 'replace');

  const permanentSorters = $derived(getOptions().sorters?.permanent ?? []);
  const permanentFilters = $derived(getOptions().filters?.permanent ?? []);

  let initPagination = initialOpts.pagination ?? { current: 1, pageSize: 10 };
  let initSorters = initialOpts.sorters?.initial ?? [];
  let initFilters = initialOpts.filters?.initial ?? [];

  if (initialOpts.syncWithLocation && typeof window !== 'undefined') {
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
  const queryPagination = $derived(paginationMode === 'server'
    ? pagination
    : { current: 1, pageSize: 999999, mode: paginationMode as 'client' | 'off' });

  const tableQueryInfo = useList<TQueryFnData, TError>(() => {
    const currentOpts = getOptions();
    const { meta, syncWithLocation, dataProviderName, pagination: _p, sorters: _s, filters: _f, ...restOptions } = currentOpts;
    return {
      resource: currentOpts.resource ?? parsed.resource ?? '',
      pagination: queryPagination,
      sorters: querySorters,
      filters: queryFilters,
      meta,
      dataProviderName,
      ...restOptions
    };
  });

  const query = tableQueryInfo;
  const overtime = tableQueryInfo.overtime;

  function setSorters(newSorters: Sort[]) { currentSorters = newSorters; }
  function setFilters(newFilters: Filter[], mode?: FilterSetMode) {
    const behavior = mode ?? filterDefaultBehavior;
    if (behavior === 'merge') {
      const merged = [...currentFilters];
      for (const nf of newFilters) {
        if (!('field' in nf)) { merged.push(nf); continue; }
        const idx = merged.findIndex(f => 'field' in f && f.field === nf.field && f.operator === nf.operator);
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

  if (initialOpts.syncWithLocation && typeof window !== 'undefined') {
    $effect(() => {
      writeURLState({
        page: pagination.current,
        pageSize: pagination.pageSize,
        sortField: currentSorters[0]?.field,
        sortOrder: currentSorters[0]?.order,
        filters: currentFilters,
      });
    });
  }

  function createLinkForSyncWithLocation(): string {
    const params = new URLSearchParams();
    if (pagination.current) params.set('page', String(pagination.current));
    if (pagination.pageSize) params.set('pageSize', String(pagination.pageSize));
    if (currentSorters[0]) {
      params.set('sort', currentSorters[0].field);
      params.set('order', currentSorters[0].order);
    }
    if (currentFilters.length > 0) {
      params.set('filters', JSON.stringify(currentFilters));
    }
    return `?${params.toString()}`;
  }

  return {
    query,
    get overtime() { return overtime; },
    get pagination() { return pagination; },
    get sorters() { return currentSorters; },
    get filters() { return currentFilters; },
    setSorters, setFilters, setPage, setPageSize,
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
      const activeSorters = sortersMode === 'off' ? effectiveSorters : [];
      if (activeSorters.length > 0) {
        sorted.sort((a, b) => {
          for (const { field, order } of activeSorters) {
            const va = (a as Record<string, unknown>)[field];
            const vb = (b as Record<string, unknown>)[field];
            if (va == null && vb != null) return 1;
            if (vb == null && va != null) return -1;
            if (va == null && vb == null) continue;
            
            let cmp = 0;
            if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
            else if (va instanceof Date && vb instanceof Date) cmp = va.getTime() - vb.getTime();
            else if (typeof va === 'string' && typeof vb === 'string' && !isNaN(Number(va)) && !isNaN(Number(vb))) cmp = Number(va) - Number(vb);
            else cmp = String(va).localeCompare(String(vb));
            
            if (cmp !== 0) return order === 'desc' ? -cmp : cmp;
          }
          return 0;
        });
      }
      return sorted.slice(start, end);
    },
  };
}
