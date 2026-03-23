// URL state sync — sync pagination/sort/filters with hash params

import type { Filter } from './types';

export interface URLState {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Filter[];
}

export function readURLState(): URLState {
  if (typeof window === 'undefined') return {};
  const hash = window.location.hash;
  const queryIdx = hash.indexOf('?');
  if (queryIdx === -1) return {};

  const params = new URLSearchParams(hash.slice(queryIdx + 1));
  const state: URLState = {};

  const page = params.get('page');
  if (page) state.page = parseInt(page, 10);

  const pageSize = params.get('pageSize');
  if (pageSize) state.pageSize = parseInt(pageSize, 10);

  const sortField = params.get('sort');
  if (sortField) state.sortField = sortField;

  const sortOrder = params.get('order');
  if (sortOrder === 'asc' || sortOrder === 'desc') state.sortOrder = sortOrder;

  const search = params.get('q');
  if (search) state.search = search;

  const filtersRaw = params.get('filters');
  if (filtersRaw) {
    try {
      state.filters = JSON.parse(filtersRaw);
    } catch { /* ignore invalid json */ }
  }

  return state;
}

export function writeURLState(state: URLState): void {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash;
  const pathIdx = hash.indexOf('?');
  const basePath = pathIdx === -1 ? hash : hash.slice(0, pathIdx);

  const params = new URLSearchParams();
  if (state.page && state.page > 1) params.set('page', String(state.page));
  if (state.pageSize && state.pageSize !== 10) params.set('pageSize', String(state.pageSize));
  if (state.sortField) params.set('sort', state.sortField);
  if (state.sortOrder) params.set('order', state.sortOrder);
  if (state.search) params.set('q', state.search);
  if (state.filters && state.filters.length > 0) {
    params.set('filters', JSON.stringify(state.filters));
  }

  const qs = params.toString();
  const newHash = qs ? `${basePath}?${qs}` : basePath;

  if (window.location.hash !== newHash) {
    history.replaceState(null, '', newHash);
  }
}
