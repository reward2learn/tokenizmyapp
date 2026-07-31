/**
 * Sheet Data API
 *
 * GET /api/sheet-data?sheet=PL&page=1&perPage=200
 * POST /api/sheet-data/update-cell
 *
 * Reads the cached workbook, detects the header row automatically, and returns
 * paginated sheet data as a JSON array of objects keyed by column header.
 *
 * Each row includes _excelCells mapping to preserve original Excel positions
 * even after sorting and filtering in the frontend DataGrid.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { read, utils, write } from 'xlsx';
import type { WorkSheet } from 'xlsx';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

// Header row detection (mirrors the logic in workbook-analyzer.ts)
const HEADER_KEYWORDS = /description|amount|total|date|revenue|account|name|qty|price|cost|sales|income|expense|balance|number|ref|period|transaction|debit|credit|unit|rate|pct|margin|bills|covers|guests|staff|code|type|category|item|product|service|charge|discount|tax|subtotal|net|gross/i;
const TITLE_KEYWORDS = /^(profit\s*&?\s*loss|balance\s*sheet|trial\s*balance|general\s*ledger|periode|period|month\s*of|input\s*data|auto\s*calc)/i;

function findHeaderRow(ws: WorkSheet): { headerRow: number; headers: string[] } {
  const rows = utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
  const maxScan = Math.min(rows.length, 20);

  let bestRow = 0;
  let bestScore = 0;
  let bestHeaders: string[] = [];

  for (let i = 0; i < maxScan; i++) {
    const row = rows[i] ?? [];
    const nonEmpty = row.filter((c) => c !== '' && c !== undefined && c !== null) as unknown[];
    const nonEmptyCount = nonEmpty.length;
    if (nonEmptyCount === 0) continue;

    const firstCell = String(row[0] ?? '').trim();
    if (nonEmptyCount <= 2 && TITLE_KEYWORDS.test(firstCell)) continue;

    let headerLikeCount = 0;
    let numericCount = 0;
    for (const cell of nonEmpty) {
      const str = String(cell);
      if (str === '#N/A' || str === '#REF!' || str === '#VALUE!') continue;
      const num = Number(cell);
      const isNumeric = typeof cell === 'number' || (typeof cell === 'string' && /^[\d,.\-]+$/.test(str.trim()) && isFinite(num));
      if (isNumeric && Math.abs(num) > 0) numericCount++;
      else if (HEADER_KEYWORDS.test(str)) headerLikeCount++;
    }

    const textRatio = nonEmptyCount > 0 ? (nonEmptyCount - numericCount) / nonEmptyCount : 0;
    const score = headerLikeCount * 3 + textRatio * 2 + (nonEmptyCount >= 3 ? 1 : 0);

    if (score > bestScore) {
      bestScore = score;
      bestRow = i;
      bestHeaders = row.map((c) => String(c ?? ''));
    }
  }

  if (bestScore < 2 && rows.length > 0) {
    const firstRow = (rows[0] ?? []).map((c) => String(c ?? ''));
    return { headerRow: 1, headers: firstRow };
  }

  return { headerRow: bestRow + 1, headers: bestHeaders };
}

// ── GET handler ─────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const sheetName = searchParams.get('sheet');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const perPage = Math.min(1000, Math.max(1, parseInt(searchParams.get('perPage') ?? '200', 10)));

  if (!sheetName) {
    return NextResponse.json({ error: 'Query param "sheet" is required (e.g. ?sheet=PL)' }, { status: 400 });
  }

  const prisma = getClient();
  try {
    const cached = await prisma.knowledgeSnippet.findUnique({
      where: { key: 'workbook_data' },
    });
    if (!cached?.content) {
      return NextResponse.json({ error: 'No workbook cached. Upload the workbook via Config > Source first.' }, { status: 404 });
    }

    const buf = Buffer.from(cached.content, 'base64');
    const wb = read(buf, { type: 'buffer' });

    const tabName = wb.SheetNames?.find((n) => 
      typeof n === "string" && n.toLowerCase() === sheetName.toLowerCase()
    );
    if (!tabName) {
      return NextResponse.json({
        error: `Sheet "${sheetName}" not found`,
        availableSheets: wb.SheetNames,
      }, { status: 404 });
    }

    const ws = wb.Sheets[tabName]!;

    // Detect the correct header row
    const { headerRow, headers } = findHeaderRow(ws);

    // Build clean column keys with deduplication
    const seen = new Map<string, number>();
    let emptyColIdx = 0;
    const columnKeys = headers.map((h) => {
      const trimmed = (h || '').toString().trim();
      if (!trimmed) return `__hidden_${emptyColIdx++}`;
      const count = seen.get(trimmed) ?? 0;
      seen.set(trimmed, count + 1);
      return count > 0 ? `${trimmed}_${count}` : trimmed;
    });

    const columns = columnKeys.filter((k) => !k.startsWith('__hidden_'));

    // Parse data using deduplicated column keys
    const allRows = utils.sheet_to_json<Record<string, unknown>>(ws, {
      header: columnKeys,
      defval: '',
      range: headerRow + 1 // Skip header row
    });

    // Remove empty or metadata rows
    const dataRows = allRows.filter((row) => {
      const filled = Object.entries(row).filter(([, v]) => v !== '' && v !== undefined && v !== null);
      const naOnly = filled.every(([, v]) => String(v) === '#N/A');
      if (filled.length === 0 || naOnly) return false;
      
      const isHeader = filled.length === columns.length && 
                      columns.every((c) => String(row[c] ?? '') === c);
      return !isHeader;
    });

    // Add original Excel cell references to each row
    // This ensures that after sorting/filtering in the frontend, we can still map back to the correct Excel cell
    const rowsWithCellRefs = dataRows.map((row, idx) => {
      const excelRow = headerRow + 1 + idx; // Excel is 1-based
      const rowWithRefs: any = { 
        ...row, 
        _rowIndex: (page - 1) * perPage + idx + 1,
        _excelRow: excelRow 
      };

      // Add cell reference for each column (e.g. "TB_cell": "D7")
      columns.forEach((colKey, colIdx) => {
        const cellAddress = utils.encode_cell({ r: excelRow, c: colIdx });
        rowWithRefs[`${colKey}_cell`] = cellAddress;
      });

      return rowWithRefs;
    });

    const totalRows = rowsWithCellRefs.length;
    const totalPages = Math.ceil(totalRows / perPage);

    const startIdx = (page - 1) * perPage;
    const rows = rowsWithCellRefs.slice(startIdx, startIdx + perPage);

    const data = {
      sheet: tabName,
      headerRow,
      columns,
      rows,
      totalRows,
      returnedRows: rows.length,
      page,
      perPage,
      totalPages,
    };

    return NextResponse.json({ success: true, data });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ── POST handler for cell updates ─────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  const prisma = getClient();
  try {
    const body = await request.json();
    const { sheet, rowIndex, column, value, _excelCell } = body;

    console.log("[sheet-data/update-cell] Received payload:", { 
      sheet, rowIndex, column, value, _excelCell 
    });

    if (!sheet || (!rowIndex && !_excelCell) || !column) {
      return NextResponse.json({ 
        error: 'Missing required fields: sheet, rowIndex/_cell, column' 
      }, { status: 400 });
    }

    const cached = await prisma.knowledgeSnippet.findUnique({
      where: { key: 'workbook_data' },
    });

    if (!cached?.content) {
      return NextResponse.json({ 
        error: 'No workbook cached. Upload via Config > Source first.' 
      }, { status: 404 });
    }

    const buf = Buffer.from(cached.content, 'base64');
    const wb = read(buf, { type: 'buffer' });

    const tabName = wb.SheetNames?.find((n) => 
      typeof n === "string" && n.toLowerCase() === sheet.toLowerCase()
    );
    if (!tabName) {
      return NextResponse.json({ 
        error: `Sheet "${sheet}" not found`,
        availableSheets: wb.SheetNames || [] 
      }, { status: 404 });
    }

    const ws = wb.Sheets?.[tabName];
    if (!ws) {
      return NextResponse.json({ error: `Worksheet "${tabName}" not found` }, { status: 404 });
    }

    let cellAddress: string;

    if (_excelCell) {
      // Use the original Excel cell reference if provided (preferred)
      cellAddress = _excelCell;
      console.log(`[sheet-data/update-cell] Using original Excel cell: ${cellAddress}`);
    } else {
      // Fallback: calculate from rowIndex and column (for backward compatibility)
      const { headers: rawHeaders } = findHeaderRow(ws);
      const seen = new Map<string, number>();
      let emptyColIdx = 0;
      const columnKeys = rawHeaders.map((h) => {
        const trimmed = String(h || '').trim();
        if (!trimmed) return `__hidden_${emptyColIdx++}`;
        const count = seen.get(trimmed) ?? 0;
        seen.set(trimmed, count + 1);
        return count > 0 ? `${trimmed}_${count}` : trimmed;
      });

      const colIndex = columnKeys.findIndex((key, idx) => {
        const rawHeader = String(rawHeaders[idx] ?? '').trim();
        const searchColumn = String(column ?? '').trim();
        return rawHeader === searchColumn || 
               key.toLowerCase() === searchColumn.toLowerCase() ||
               rawHeader.toLowerCase().replace(/\s+/g, '') === searchColumn.toLowerCase().replace(/\s+/g, '') ||
               key.toLowerCase().replace(/\s+/g, '') === searchColumn.toLowerCase().replace(/\s+/g, '');
      });

      if (colIndex === -1) {
        return NextResponse.json({ 
          error: `Column "${column}" not found in sheet "${sheet}". Available: ${columnKeys.filter(k => !k.startsWith('__hidden_')).join(', ')}` 
        }, { status: 400 });
      }

      const excelRow = Number(rowIndex) + 1;
      cellAddress = utils.encode_cell({ r: excelRow, c: colIndex });
    }

    const cellValue = typeof value === 'number' ? value : String(value || '');
    ws[cellAddress] = { 
      v: cellValue, 
      t: typeof value === 'number' ? 'n' : 's' 
    };

    const updatedBuffer = write(wb, { bookType: 'xlsx', type: 'buffer' });
    const base64Updated = Buffer.from(updatedBuffer).toString('base64');

    await prisma.knowledgeSnippet.update({
      where: { key: 'workbook_data' },
      data: { content: base64Updated },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${sheet}!${cellAddress}`,
      cell: cellAddress,
      value: cellValue
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sheet-data/update-cell] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
