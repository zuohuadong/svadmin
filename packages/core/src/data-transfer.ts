// Data transfer utilities — CSV export/import

import { getDataProviderForResource } from './context';
import type { GetListResult } from './types';

/**
 * useExport — export all records from a resource as CSV download
 */
export function useExport(resource: string) {
  let isExporting = $state(false);

  async function exportCSV(opts?: { filename?: string; fields?: string[] }) {
    const provider = getDataProviderForResource(resource);
    isExporting = true;

    try {
      // Fetch all records (up to 10000)
      const result: GetListResult = await provider.getList({
        resource,
        pagination: { current: 1, pageSize: 10000 },
      });

      if (result.data.length === 0) return;

      const records = result.data as Record<string, unknown>[];
      const fields = opts?.fields ?? Object.keys(records[0]);

      // Build CSV
      const header = fields.join(',');
      const rows = records.map(record =>
        fields.map(f => {
          const val = record[f];
          const str = val === null || val === undefined ? '' : String(val);
          // Escape commas and quotes
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
      a.download = opts?.filename ?? `${resource}_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      isExporting = false;
    }
  }

  return {
    exportCSV,
    get isExporting() { return isExporting; },
  };
}

/**
 * useImport — import records from a CSV file
 */
export function useImport(resource: string) {
  let isImporting = $state(false);
  let importResult = $state<{ success: number; failed: number } | null>(null);

  async function importCSV(file: File): Promise<{ success: number; failed: number }> {
    const provider = getDataProviderForResource(resource);
    isImporting = true;
    let success = 0;
    let failed = 0;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) return { success: 0, failed: 0 };

      const headers = parseCSVLine(lines[0]);

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const record: Record<string, unknown> = {};
        headers.forEach((h, idx) => {
          record[h] = values[idx] ?? '';
        });

        try {
          await provider.create({ resource, variables: record });
          success++;
        } catch {
          failed++;
        }
      }

      importResult = { success, failed };
      return { success, failed };
    } finally {
      isImporting = false;
    }
  }

  return {
    importCSV,
    get isImporting() { return isImporting; },
    get importResult() { return importResult; },
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
