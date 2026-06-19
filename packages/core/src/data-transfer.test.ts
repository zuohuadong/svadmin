// Unit tests for CSV parsing and data-transfer utilities
import { describe, test, expect } from 'bun:test';

// We test parseCSVLine directly by re-implementing the exported logic
// since the function is not exported. We test the CSV format contract.

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

describe('parseCSVLine', () => {
  test('simple comma-separated values', () => {
    expect(parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  test('values with whitespace are trimmed', () => {
    expect(parseCSVLine(' hello , world , test ')).toEqual(['hello', 'world', 'test']);
  });

  test('quoted values preserve commas', () => {
    expect(parseCSVLine('"hello, world",b,c')).toEqual(['hello, world', 'b', 'c']);
  });

  test('escaped quotes inside quoted values', () => {
    expect(parseCSVLine('"say ""hello""",b')).toEqual(['say "hello"', 'b']);
  });

  test('empty values', () => {
    expect(parseCSVLine('a,,c')).toEqual(['a', '', 'c']);
  });

  test('single value', () => {
    expect(parseCSVLine('hello')).toEqual(['hello']);
  });

  test('empty line', () => {
    expect(parseCSVLine('')).toEqual(['']);
  });

  test('quoted value with newline character', () => {
    expect(parseCSVLine('"line1\nline2",b')).toEqual(['line1\nline2', 'b']);
  });

  test('mixed quoted and unquoted', () => {
    expect(parseCSVLine('1,"John Doe","admin@test.com",true')).toEqual([
      '1', 'John Doe', 'admin@test.com', 'true'
    ]);
  });
});

// CSV row formatting (escape logic from useExport)
function escapeCSVField(val: unknown): string {
  const str = val === null || val === undefined ? '' : String(val);
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

describe('escapeCSVField', () => {
  test('simple string passes through', () => {
    expect(escapeCSVField('hello')).toBe('hello');
  });

  test('null becomes empty string', () => {
    expect(escapeCSVField(null)).toBe('');
  });

  test('undefined becomes empty string', () => {
    expect(escapeCSVField(undefined)).toBe('');
  });

  test('string with comma is quoted', () => {
    expect(escapeCSVField('hello, world')).toBe('"hello, world"');
  });

  test('string with double quote is escaped', () => {
    expect(escapeCSVField('say "hi"')).toBe('"say ""hi"""');
  });

  test('string with newline is quoted', () => {
    expect(escapeCSVField('line1\nline2')).toBe('"line1\nline2"');
  });

  test('number is converted to string', () => {
    expect(escapeCSVField(42)).toBe('42');
  });

  test('boolean is converted to string', () => {
    expect(escapeCSVField(true)).toBe('true');
  });
});

// ── 多格式导出测试（测真实 export-format.ts 纯函数） ─────────────
import { toCsv, toJson, toXlsx, downloadData } from './export-format';

describe('toCsv', () => {
  test('generates valid CSV with headers', () => {
    const csv = toCsv([{ id: 1, name: 'Alice' }]);
    expect(csv).toContain('id,name');
    expect(csv).toContain('1,Alice');
  });

  test('handles multiple records', () => {
    const csv = toCsv([{ id: 1, name: 'A' }, { id: 2, name: 'B' }]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe('1,A');
    expect(lines[2]).toBe('2,B');
  });

  test('handles null and undefined values', () => {
    const csv = toCsv([{ id: 1, name: null as unknown as undefined, email: undefined }]);
    expect(csv).toContain('1,,');
  });

  test('handles nested objects via JSON stringify', () => {
    const csv = toCsv([{ id: 1, meta: { tags: ['a'] } }]);
    expect(csv).toContain('"{""tags"":[""a""]}"');
  });

  test('returns empty string for empty records', () => {
    expect(toCsv([])).toBe('');
  });
});

describe('toJson', () => {
  test('formats records as pretty JSON', () => {
    const json = toJson([{ id: 1, name: 'Alice', active: true }]);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual([{ id: 1, name: 'Alice', active: true }]);
  });

  test('handles nested objects', () => {
    const json = toJson([{ id: 1, meta: { tags: ['a', 'b'] } }]);
    const parsed = JSON.parse(json);
    expect(parsed[0].meta.tags).toEqual(['a', 'b']);
  });

  test('handles empty array', () => {
    expect(JSON.parse(toJson([]))).toEqual([]);
  });
});

describe('toXlsx (SpreadsheetML)', () => {
  test('generates valid XML with headers', () => {
    const xml = toXlsx([{ id: 1, name: 'Alice' }]);
    expect(xml).toContain('<?xml version="1.0"?>');
    expect(xml).toContain('<Workbook');
    expect(xml).toContain('id');
    expect(xml).toContain('Alice');
    expect(xml).toContain('ss:Type="Number"');
  });

  test('numbers use Number type', () => {
    const xml = toXlsx([{ count: 42 }]);
    expect(xml).toContain('ss:Type="Number"');
    expect(xml).toContain('>42<');
  });

  test('booleans use Boolean type', () => {
    const xml = toXlsx([{ active: true }]);
    expect(xml).toContain('ss:Type="Boolean"');
  });

  test('returns empty string for empty records', () => {
    expect(toXlsx([])).toBe('');
  });
});

describe('downloadData (browser API integration)', () => {
  test('empty records does nothing without document', () => {
    // 无 document 环境下安全返回
    expect(() => downloadData([], 'users', 'csv')).not.toThrow();
  });
});
