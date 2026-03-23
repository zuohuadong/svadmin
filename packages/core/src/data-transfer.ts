import { getDataProviderForResource } from './context';
import { useParsed } from './useParsed';
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
  const resource = options.resource ?? parsed.resource ?? '';
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

      if (options.download !== false) {
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
  const resource = options.resource ?? parsed.resource ?? '';
  let isLoading = $state(false);
  let mutationResult = $state<{ succeeded: unknown[]; errored: { request: unknown; error: unknown }[] } | null>(null);

  async function handleChange(info: { file: File }) {
    const provider = getDataProviderForResource(resource, options.dataProviderName);
    isLoading = true;
    const succeeded: unknown[] = [];
    const errored: { request: unknown; error: unknown }[] = [];

    try {
      const text = await info.file.text();
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) return;

      const headers = parseCSVLine(lines[0]);
      const records: Record<string, unknown>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
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
          try {
            if (provider.createMany) {
              const res = await provider.createMany({ resource, variables: batch, meta: options.meta });
              succeeded.push(res);
            } else {
              for (const record of batch) {
                const res = await provider.create({ resource, variables: record, meta: options.meta });
                succeeded.push(res);
              }
            }
          } catch (error) {
            errored.push({ request: batch, error });
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

/** Parse a single CSV line respecting quoted fields */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}
