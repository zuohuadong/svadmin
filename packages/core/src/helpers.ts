// Refine v5 compatible utility helpers

import type { Filter, Sort, CrudOperator } from './types';
import { t } from './i18n.svelte';
import { getTextTransformers } from './options';

// ─── Table Helpers ────────────────────────────────────────────

/**
 * Get the current filter value for a field from a filter array.
 * Useful for setting default values in filter inputs.
 */
export function getDefaultFilter(
  columnName: string,
  filters?: Filter[],
  operatorType: CrudOperator = 'eq',
): unknown | undefined {
  if (!filters) return undefined;
  const filter = filters.find((f) => {
    if ('field' in f) {
      return f.field === columnName && f.operator === operatorType;
    }
    return false;
  });
  return filter && 'value' in filter ? filter.value : undefined;
}

/**
 * Get the current sort order for a field from a sorter array.
 * Returns 'asc', 'desc', or undefined.
 */
export function getDefaultSortOrder(
  columnName: string,
  sorters?: Sort[],
): 'asc' | 'desc' | undefined {
  if (!sorters) return undefined;
  const sortItem = sorters.find((item) => item.field === columnName);
  return sortItem?.order as 'asc' | 'desc' | undefined;
}

/**
 * Merge two filter arrays, deduplicating by field+operator.
 * Filters in `newFilters` take priority over `prevFilters`.
 * `permanentFilter` items are always preserved.
 * Filters with undefined values are removed from the result.
 */
export function unionFilters(
  permanentFilter: Filter[],
  newFilters: Filter[],
  prevFilters: Filter[] = [],
): Filter[] {
  const compareFilters = (a: Filter, b: Filter): boolean => {
    if ('field' in a && 'field' in b) {
      return a.field === b.field && a.operator === b.operator;
    }
    return false;
  };

  // Start with previous filters
  let result = [...prevFilters];

  // Apply new filters (override previous by field+operator)
  for (const newFilter of newFilters) {
    const idx = result.findIndex((f) => compareFilters(f, newFilter));
    if (idx >= 0) {
      result[idx] = newFilter;
    } else {
      result.push(newFilter);
    }
  }

  // Ensure permanent filters are always present
  for (const perm of permanentFilter) {
    const idx = result.findIndex((f) => compareFilters(f, perm));
    if (idx >= 0) {
      result[idx] = perm;
    } else {
      result.push(perm);
    }
  }

  // Remove filters with undefined values
  return result.filter((f) => !('value' in f && f.value === undefined));
}

/**
 * Merge two sorter arrays, deduplicating by field.
 * Sorters in `newSorters` take priority.
 */
export function unionSorters(
  permanentSorters: Sort[],
  newSorters: Sort[],
): Sort[] {
  const result = [...newSorters];

  for (const perm of permanentSorters) {
    if (!result.some((s) => s.field === perm.field)) {
      result.push(perm);
    }
  }

  return result;
}

// ─── Upload Helpers ───────────────────────────────────────────

/**
 * Convert a File (or file-like object) to a base64 data URL string.
 * Useful for image uploads and previews.
 */
export function file2Base64(file: File | { uid?: string } & Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file as Blob);
    reader.addEventListener('load', () => {
      resolve(reader.result as string);
    });
    reader.addEventListener('error', () => {
      reject(reader.error);
    });
  });
}

// ─── Document Title Helper ────────────────────────────────────

/**
 * Generate a default document title for a resource page.
 * e.g., "Edit Post #5 | Admin" or "Posts | Admin"
 */
export function generateDefaultDocumentTitle(options?: {
  resource?: string;
  action?: string;
  id?: string | number;
  suffix?: string;
}): string {
  const { resource, action, id, suffix = ' | Admin' } = options ?? {};
  const transformers = getTextTransformers();

  if (!resource) {
    return t('documentTitle.default', {}) || `Admin${suffix}`;
  }

  const resourceLabel = transformers.humanize
    ? transformers.humanize(resource)
    : resource.charAt(0).toUpperCase() + resource.slice(1);

  const actionPrefixes: Record<string, string> = {
    create: `${t('common.create', {}) || 'Create'} `,
    clone: `#${id ?? ''} ${t('common.clone', {}) || 'Clone'} `,
    edit: `#${id ?? ''} ${t('common.edit', {}) || 'Edit'} `,
    show: `#${id ?? ''} ${t('common.detail', {}) || 'Show'} `,
    list: '',
  };

  const prefix = action ? (actionPrefixes[action] ?? '') : '';
  return `${prefix}${resourceLabel}${suffix}`;
}
