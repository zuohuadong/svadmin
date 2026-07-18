// 纯函数导出格式化工具 — 不依赖 Svelte runes 或浏览器 API（downloadData 除外）
// 可被 bun:test 直接测试

/** 支持的导出/导入格式 */
export type ExportFormat = 'csv' | 'json' | 'xlsx';

/** CSV 转义，含公式注入防护 */
export function escapeCsvField(fieldValue: string): string {
  let escapedValue = fieldValue;
  if (/^[=+@\t\r]/.test(escapedValue)) escapedValue = "'" + escapedValue;
  return escapedValue.includes(',') || escapedValue.includes('"') || escapedValue.includes('\n') || escapedValue.includes('\r')
    ? `"${escapedValue.replace(/"/g, '""')}"`
    : escapedValue;
}

/** 将记录数组转为 CSV 字符串 */
export function toCsv(records: Record<string, unknown>[]): string {
  if (records.length === 0) return '';
  const fieldNames = Object.keys(records[0]);
  const header = fieldNames.map(escapeCsvField).join(',');
  const rows = records.map(record =>
    fieldNames.map(fieldName => {
      const rawFieldValue = record[fieldName];
      const serializedFieldValue = rawFieldValue === null || rawFieldValue === undefined
        ? ''
        : typeof rawFieldValue === 'object'
          ? JSON.stringify(rawFieldValue)
          : String(rawFieldValue);
      return escapeCsvField(serializedFieldValue);
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

/** 将记录数组转为格式化的 JSON 字符串 */
export function toJson(records: Record<string, unknown>[]): string {
  return JSON.stringify(records, null, 2);
}

/** 转义 XML 特殊字符 */
export function escapeXml(xmlValue: string): string {
  return xmlValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 生成最小可用的 XLSX（SpreadsheetML）——零依赖。
 */
export function toXlsx(records: Record<string, unknown>[]): string {
  if (records.length === 0) return '';
  const fieldNames = Object.keys(records[0]);

  const headerCells = fieldNames.map(fieldName => `<Cell><Data ss:Type="String">${escapeXml(fieldName)}</Data></Cell>`).join('');
  const dataRows = records.map(record =>
    `<Row>${fieldNames.map(fieldName => {
      const fieldValue = record[fieldName];
      if (fieldValue === null || fieldValue === undefined) return '<Cell><Data ss:Type="String"></Data></Cell>';
      if (typeof fieldValue === 'number') return `<Cell><Data ss:Type="Number">${fieldValue}</Data></Cell>`;
      if (typeof fieldValue === 'boolean') return `<Cell><Data ss:Type="Boolean">${fieldValue ? 1 : 0}</Data></Cell>`;
      const serializedValue = typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue);
      return `<Cell><Data ss:Type="String">${escapeXml(serializedValue)}</Data></Cell>`;
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
  let extension: string;

  switch (format) {
    case 'json':
      content = toJson(records);
      mimeType = 'application/json;charset=utf-8;';
      extension = 'json';
      break;
    case 'xlsx':
      content = toXlsx(records);
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      extension = 'xls';
      break;
    case 'csv':
    default:
      content = toCsv(records);
      mimeType = 'text/csv;charset=utf-8;';
      extension = 'csv';
      break;
  }

  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = `${resource}_export.${extension}`;
  downloadAnchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
