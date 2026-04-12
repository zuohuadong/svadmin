// Pure utility functions — no Svelte runtime dependency
// Extracted to enable unit testing with bun test

import type { Filter, Sort, CrudOperator } from './types';

// ─── Table Helpers ────────────────────────────────────────────

/**
 * Get the current filter value for a field from a filter array.
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

  let result = [...prevFilters];

  for (const newFilter of newFilters) {
    const idx = result.findIndex((f) => compareFilters(f, newFilter));
    if (idx >= 0) {
      result[idx] = newFilter;
    } else {
      result.push(newFilter);
    }
  }

  for (const perm of permanentFilter) {
    const idx = result.findIndex((f) => compareFilters(f, perm));
    if (idx >= 0) {
      result[idx] = perm;
    } else {
      result.push(perm);
    }
  }

  return result.filter((f) => !('value' in f && f.value === undefined));
}

/**
 * Merge two sorter arrays, deduplicating by field.
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

/**
 * Convert a File to a base64 data URL string.
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

/** Parse full CSV text respecting quoted multi-line fields */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentVal += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentVal += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if (ch === '\n' || ch === '\r') {
        currentRow.push(currentVal.trim());
        if (currentRow.some(v => v !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
        if (ch === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
          i++; // consume \n of \r\n
        }
      } else {
        currentVal += ch;
      }
    }
  }
  
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(v => v !== '')) {
      rows.push(currentRow);
    }
  }
  return rows;
}
