/**
 * Shared TSV prompt builders for spreadsheet data — used by the sheet viewer
 * ("Send selected cells to AI chat") and the chat drawer ("Attach from page").
 * Pure functions: rows + column order + selected cell keys in, prompt text out.
 */

export interface PromptRow {
  _rowIndex?: number | string;
  id?: number | string;
  [key: string]: unknown;
}

export type PromptColOrder = string[];

function rowIdOf(row: PromptRow): string {
  return String(row._rowIndex ?? row.id ?? '');
}

function cellText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** TSV of exactly the selected cells (headers + values), Excel-style. */
export function buildCellsPrompt(params: {
  sheet: string;
  rows: PromptRow[];
  colOrder: PromptColOrder;
  selectedKeys: string[];
}): string {
  const { sheet, rows, colOrder, selectedKeys } = params;
  if (!rows.length || !selectedKeys.length) return '';

  const selectedRowIds = new Set<string>();
  const selectedFields = new Set<string>();
  for (const key of selectedKeys) {
    const [rId, f] = key.split('|');
    if (rId && f) {
      selectedRowIds.add(rId);
      selectedFields.add(f);
    }
  }

  const rowOrder = Array.from(selectedRowIds).sort((a, b) => Number(a) - Number(b));
  const fields = colOrder.filter((f) => selectedFields.has(f));
  if (!rowOrder.length || !fields.length) return '';

  const header = ['Row #', ...fields].join('\t');
  const body = rowOrder.map((rowIdStr) => {
    const row = rows.find((r) => rowIdOf(r) === rowIdStr);
    if (!row) return '';
    return [rowIdStr, ...fields.map((f) => cellText(row[f]))].join('\t');
  });

  return `Sheet "${sheet}" — selected cells (${rowOrder.length} rows × ${fields.length} cols):\n${header}\n${body.join('\n')}`;
}

/** TSV of the entire current page of the sheet (all visible rows). */
export function buildPagePrompt(params: {
  sheet: string;
  rows: PromptRow[];
  colOrder: PromptColOrder;
}): string {
  const { sheet, rows, colOrder } = params;
  if (!rows.length || !colOrder.length) return '';

  const header = ['Row #', ...colOrder].join('\t');
  const body = rows.map((row) => [rowIdOf(row), ...colOrder.map((f) => cellText(row[f]))].join('\t'));

  return `Sheet "${sheet}" — current page (${rows.length} rows × ${colOrder.length} cols):\n${header}\n${body.join('\n')}`;
}
