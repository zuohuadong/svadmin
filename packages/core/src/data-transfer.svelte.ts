import { getDataProviderForResource } from './context.svelte';
import { useParsed } from './useParsed.svelte';
import type { GetListResult, Sort, Filter, BaseRecord } from './types';

export interface UseExportOptions<TData extends BaseRecord = BaseRecord> {
  resource?: string;
  mapData?: (item: TData) => Record<string, unknown>;
  sorters?: Sort[];
  filters?: Filter[];
  maxItemCount?: number;
  pageSize?: number;
  download?: boolean;
  meta?: Record<string, unknown>;
  dataProviderName?: string;
  onError?: (error: Error) => void;
}

/**
 * useExport — export records from a resource as CSV download
 * Supports mapData, sorters, filters, maxItemCount, pageSize
 */
export function useExport<TData extends BaseRecord = BaseRecord>(options: UseExportOptions<TData> = {}) {
  const parsed = useParsed();
  const resource = $derived(options.resource ?? parsed.resource ?? '');
  let isLoading = $state(false);

  async function triggerExport() {
    const provider = getDataProviderForResource(resource, options.dataProviderName);
    isLoading = true;

    try {
      const batchSize = options.pageSize ?? 20;
      const maxItems = options.maxItemCount ?? Infinity;
      let allRecords: TData[] = [];
      let page = 1;

      while (allRecords.length < maxItems) {
        const result = await provider.getList<TData>({
          resource,
          pagination: { current: page, pageSize: batchSize },
          sorters: options.sorters,
          filters: options.filters,
          meta: options.meta,
        });

        allRecords = [...allRecords, ...result.data];
        if (result.data.length < batchSize || allRecords.length >= result.total) break;
        page++;
      }

      if (maxItems !== Infinity) allRecords = allRecords.slice(0, maxItems);
      if (allRecords.length === 0) return allRecords;

      const mapped = options.mapData
        ? allRecords.map(options.mapData)
        : allRecords.map(r => r as unknown as Record<string, unknown>);

      if (options.download !== false && typeof document !== 'undefined') {
        const fields = Object.keys(mapped[0]);
        const header = fields.join(',');
        const rows = mapped.map(record =>
          fields.map(f => {
            const val = record[f];
            const str = val === null || val === undefined ? '' : String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          }).join(',')
        );

        const csv = [header, ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resource}_export.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      return allRecords;
    } catch (error) {
      options.onError?.(error as Error);
      return [];
    } finally {
      isLoading = false;
    }
  }

  return {
    triggerExport,
    get isLoading() { return isLoading; },
  };
}

export interface UseImportOptions<TData = Record<string, unknown>> {
  resource?: string;
  mapData?: (item: Record<string, unknown>) => TData;
  batchSize?: number;
  onFinish?: (result: { succeeded: unknown[]; errored: { request: unknown; error: unknown }[] }) => void;
  onProgress?: (info: { totalAmount: number; processedAmount: number }) => void;
  meta?: Record<string, unknown>;
  dataProviderName?: string;
}

/**
 * useImport — import records from a CSV file
 * Supports mapData, batchSize, onFinish, onProgress, meta
 */
export function useImport<TData = Record<string, unknown>>(options: UseImportOptions<TData> = {}) {
  const parsed = useParsed();
  const resource = $derived(options.resource ?? parsed.resource ?? '');
  let isLoading = $state(false);
  let mutationResult = $state<{ succeeded: unknown[]; errored: { request: unknown; error: unknown }[] } | null>(null);

  async function handleChange(info: { file: File }) {
    const provider = getDataProviderForResource(resource, options.dataProviderName);
    isLoading = true;
    const succeeded: unknown[] = [];
    const errored: { request: unknown; error: unknown }[] = [];

    try {
      let text = await info.file.text();
      // Strip BOM
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
      }

      const rows = parseCSV(text);
      if (rows.length < 2) return;

      const headers = rows[0];
      const records: Record<string, unknown>[] = [];

      for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        const record: Record<string, unknown> = {};
        headers.forEach((h, idx) => { record[h] = values[idx] ?? ''; });
        records.push(options.mapData ? (options.mapData(record) as unknown as Record<string, unknown>) : record);
      }

      const batchSize = options.batchSize ?? 1;
      let processed = 0;

      if (batchSize === 1) {
        for (const record of records) {
          try {
            const res = await provider.create({ resource, variables: record, meta: options.meta });
            succeeded.push(res);
          } catch (error) {
            errored.push({ request: record, error });
          }
          processed++;
          options.onProgress?.({ totalAmount: records.length, processedAmount: processed });
        }
      } else {
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          if (provider.createMany) {
            try {
              const res = await provider.createMany({ resource, variables: batch, meta: options.meta });
              succeeded.push(res);
            } catch (error) {
              errored.push({ request: batch, error });
            }
          } else {
            // Fallback: loop internal items inside batch securely instead of breaking whole batch
            for (const record of batch) {
              try {
                const res = await provider.create({ resource, variables: record, meta: options.meta });
                succeeded.push(res);
              } catch (error) {
                errored.push({ request: record, error });
              }
            }
          }
          processed += batch.length;
          options.onProgress?.({ totalAmount: records.length, processedAmount: processed });
        }
      }

      mutationResult = { succeeded, errored };
      options.onFinish?.({ succeeded, errored });
    } finally {
      isLoading = false;
    }
  }

  return {
    inputProps: { type: 'file' as const, accept: '.csv' },
    handleChange,
    get isLoading() { return isLoading; },
    get mutationResult() { return mutationResult; },
  };
}

/** Parse full CSV text respecting quoted multi-line fields */
function parseCSV(text: string): string[][] {
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
