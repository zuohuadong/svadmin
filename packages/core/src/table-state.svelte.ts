// TableState — Svelte 5 Class State Pattern for table data management
// Reactive class that encapsulates all table state with fine-grained $state/$derived

import { useParsed } from './useParsed';
import { useList } from './query-hooks.svelte';
import { readURLState, writeURLState } from './url-sync';
import type { Pagination, Sort, Filter, BaseRecord, HttpError, KnownResources } from './types';
import type { UseListOptions } from './query-hooks.svelte';

export type FilterSetMode = 'merge' | 'replace';

export interface TableStateOptions<TData extends BaseRecord = BaseRecord, TError = HttpError>
  extends Omit<UseListOptions<TData, TError>, 'pagination' | 'sorters' | 'filters'> {
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

/**
 * Svelte 5 Class-based reactive table state.
 *
 * Usage:
 * ```ts
 * const table = new TableState({ resource: 'posts' });
 * table.setPage(2);
 * table.toggleSort('title');
 * console.log(table.data); // reactive
 * ```
 */
export class TableState<TData extends BaseRecord = BaseRecord, TError = HttpError> {
  // ─── Reactive state ───────────────────────────────────────────
  pagination = $state<Pagination>({ current: 1, pageSize: 10 });
  currentSorters = $state<Sort[]>([]);
  currentFilters = $state<Filter[]>([]);

  // ─── Private config ───────────────────────────────────────────
  private permanentSorters: Sort[];
  private permanentFilters: Filter[];
  private sortersMode: 'off' | 'server';
  private filtersMode: 'off' | 'server';
  private filterDefaultBehavior: FilterSetMode;
  private syncWithLocation: boolean;
  private paginationMode: string;

  // ─── Query result ─────────────────────────────────────────────
  private _queryResult;

  constructor(options: TableStateOptions<TData, TError> = {}) {
    const parsed = useParsed();
    const resource = options.resource ?? parsed.resource ?? '';

    this.permanentSorters = options.sorters?.permanent ?? [];
    this.permanentFilters = options.filters?.permanent ?? [];
    this.sortersMode = options.sorters?.mode ?? 'server';
    this.filtersMode = options.filters?.mode ?? 'server';
    this.filterDefaultBehavior = options.filters?.defaultBehavior ?? 'replace';
    this.syncWithLocation = options.syncWithLocation ?? false;
    this.paginationMode = options.pagination?.mode ?? 'server';

    // Init from URL or defaults
    let initPagination = options.pagination ?? { current: 1, pageSize: 10 };
    let initSorters = options.sorters?.initial ?? [];
    let initFilters = options.filters?.initial ?? [];

    if (this.syncWithLocation && typeof window !== 'undefined') {
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

    this.pagination = initPagination;
    this.currentSorters = initSorters;
    this.currentFilters = initFilters;

    // Create query
    const { meta, syncWithLocation: _s, dataProviderName, pagination: _p, sorters: _sr, filters: _f, ...restOptions } = options;
    this._queryResult = useList<TData, TError>({
      resource,
      pagination: this.queryPagination,
      sorters: this.effectiveSorters,
      filters: this.effectiveFilters,
      meta,
      dataProviderName,
      ...restOptions,
    });

    // URL sync effect
    if (this.syncWithLocation && typeof window !== 'undefined') {
      $effect(() => {
        writeURLState({
          page: this.pagination.current,
          pageSize: this.pagination.pageSize,
          sortField: this.effectiveSorters[0]?.field,
          sortOrder: this.effectiveSorters[0]?.order,
          filters: this.effectiveFilters,
        });
      });
    }
  }

  // ─── Derived state ────────────────────────────────────────────
  get effectiveSorters() { return [...this.currentSorters, ...this.permanentSorters]; }
  get effectiveFilters() { return [...this.currentFilters, ...this.permanentFilters]; }

  private get queryPagination() {
    return this.paginationMode === 'server'
      ? this.pagination
      : { current: 1, pageSize: 999999, mode: this.paginationMode as 'client' | 'off' };
  }

  /** Underlying TanStack Query result */
  get query() { return this._queryResult.query; }

  /** Table data rows */
  get data(): TData[] { return (this.query.data as any)?.data ?? []; }

  /** Total record count */
  get total(): number { return (this.query.data as any)?.total ?? 0; }

  /** Is data loading */
  get isLoading(): boolean { return this.query.isLoading; }

  /** Is data error */
  get isError(): boolean { return this.query.isError; }

  /** Error object */
  get error(): TError | null { return this.query.error; }

  /** Current page number */
  get current(): number { return this.pagination.current ?? 1; }

  /** Page size */
  get pageSize(): number { return this.pagination.pageSize ?? 10; }

  /** Total number of pages */
  get pageCount(): number { return Math.ceil(this.total / this.pageSize); }

  /** Has next page */
  get hasNextPage(): boolean { return this.current < this.pageCount; }

  /** Has previous page */
  get hasPreviousPage(): boolean { return this.current > 1; }

  // ─── Mutators ─────────────────────────────────────────────────
  setPage(page: number) {
    this.pagination = { ...this.pagination, current: page };
  }

  setPageSize(size: number) {
    this.pagination = { ...this.pagination, pageSize: size, current: 1 };
  }

  nextPage() {
    if (this.hasNextPage) this.setPage(this.current + 1);
  }

  previousPage() {
    if (this.hasPreviousPage) this.setPage(this.current - 1);
  }

  setSorters(newSorters: Sort[]) {
    this.currentSorters = newSorters;
  }

  toggleSort(field: string) {
    const existing = this.currentSorters.find(s => s.field === field);
    if (!existing) {
      this.currentSorters = [{ field, order: 'asc' }];
    } else if (existing.order === 'asc') {
      this.currentSorters = [{ field, order: 'desc' }];
    } else {
      this.currentSorters = [];
    }
  }

  setFilters(newFilters: Filter[], mode?: FilterSetMode) {
    const behavior = mode ?? this.filterDefaultBehavior;
    if (behavior === 'merge') {
      const merged = [...this.currentFilters];
      for (const nf of newFilters) {
        const idx = merged.findIndex(f => f.field === nf.field && f.operator === nf.operator);
        if (idx >= 0) {
          if (nf.value === undefined || nf.value === null || nf.value === '') merged.splice(idx, 1);
          else merged[idx] = nf;
        } else if (nf.value !== undefined && nf.value !== null && nf.value !== '') {
          merged.push(nf);
        }
      }
      this.currentFilters = merged;
    } else {
      this.currentFilters = newFilters;
    }
    this.pagination = { ...this.pagination, current: 1 };
  }

  resetFilters() {
    this.currentFilters = [];
    this.pagination = { ...this.pagination, current: 1 };
  }

  /** For client-side pagination mode */
  get clientData(): TData[] {
    if (this.paginationMode !== 'client') return [];
    const allData = this.data;
    const start = (this.current - 1) * this.pageSize;
    const end = start + this.pageSize;
    let sorted = [...allData];
    const activeSorters = this.sortersMode === 'off' ? this.effectiveSorters : this.currentSorters;
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
  }
}
