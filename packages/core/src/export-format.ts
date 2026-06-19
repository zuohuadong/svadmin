// 纯函数导出格式化工具 — 不依赖 Svelte runes 或浏览器 API（downloadData 除外）
// 可被 bun:test 直接测试

/** 支持的导出/导入格式 */
export type ExportFormat = 'csv' | 'json' | 'xlsx';

/** CSV 转义，含公式注入防护 */
export function escapeCsvField(s: string): string {
  let val = s;
  if (/^[=+@\t\r]/.test(val)) val = "'" + val;
  return val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')
    ? `"${val.replace(/"/g, '""')}"`
    : val;
}

/** 将记录数组转为 CSV 字符串 */
export function toCsv(records: Record<string, unknown>[]): string {
  if (records.length === 0) return '';
  const fields = Object.keys(records[0]);
  const header = fields.map(escapeCsvField).join(',');
  const rows = records.map(record =>
    fields.map(f => {
      const val = record[f];
      const str = val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
      return escapeCsvField(str);
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

/** 将记录数组转为格式化的 JSON 字符串 */
export function toJson(records: Record<string, unknown>[]): string {
  return JSON.stringify(records, null, 2);
}

/** 转义 XML 特殊字符 */
export function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 生成最小可用的 XLSX（SpreadsheetML）——零依赖。
 */
export function toXlsx(records: Record<string, unknown>[]): string {
  if (records.length === 0) return '';
  const fields = Object.keys(records[0]);

  const headerCells = fields.map(f => `<Cell><Data ss:Type="String">${escapeXml(f)}</Data></Cell>`).join('');
  const dataRows = records.map(record =>
    `<Row>${fields.map(f => {
      const val = record[f];
      if (val === null || val === undefined) return '<Cell><Data ss:Type="String"></Data></Cell>';
      if (typeof val === 'number') return `<Cell><Data ss:Type="Number">${val}</Data></Cell>`;
      if (typeof val === 'boolean') return `<Cell><Data ss:Type="Boolean">${val ? 1 : 0}</Data></Cell>`;
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `<Cell><Data ss:Type="String">${escapeXml(str)}</Data></Cell>`;
    }).join('')}</Row>`
  ).join('\n');

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Export">
  <Table>
   <Row>${headerCells}</Row>
${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;
}

/**
 * 将记录以指定格式下载为文件。
 * 依赖浏览器 document API；在 Node/bun:test 中需 mock。
 */
export function downloadData(
  records: Record<string, unknown>[],
  resource: string,
  format: ExportFormat = 'csv',
): void {
  if (records.length === 0) return;
  if (typeof document === 'undefined') return;

  let content: string;
  let mimeType: string;
  let ext: string;

  switch (format) {
    case 'json':
      content = toJson(records);
      mimeType = 'application/json;charset=utf-8;';
      ext = 'json';
      break;
    case 'xlsx':
      content = toXlsx(records);
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      ext = 'xls';
      break;
    case 'csv':
    default:
      content = toCsv(records);
      mimeType = 'text/csv;charset=utf-8;';
      ext = 'csv';
      break;
  }

  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resource}_export.${ext}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
