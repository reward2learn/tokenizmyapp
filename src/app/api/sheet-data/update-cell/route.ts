/**
 * Sheet Cell Update API
 *
 * POST /api/sheet-data/update-cell
 *
 * Updates a specific cell in a cached Excel workbook and persists it back.
 * Used by SheetViewerBlock for inline cell editing with debounce.
 *
 * Body:
 *   {
 *     sheet: string,      // Sheet name (e.g. "COS", "PL")
 *     rowIndex: number,   // 1-based row index (after header row)
 *     column: string,     // Column header name (e.g. "TB", "Revenue")
 *     value: string|number
 *   }
 *
 * Returns success with updated cell reference.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { read, utils, write } from 'xlsx';
import type { WorkSheet } from 'xlsx';

export const dynamic = 'force-dynamic';

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

// Header detection (shared with main sheet-data route)
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

export async function POST(request: Request): Promise<NextResponse> {
  const prisma = getClient();
  try {
    const body = await request.json();
    const { sheet, rowIndex, column, value } = body;

    if (!sheet || rowIndex === undefined || !column) {
      return NextResponse.json({ 
        error: 'Missing required fields: sheet, rowIndex, column' 
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
      typeof n === "string" && n.toLowerCase() === (sheet || "").toLowerCase()
    );
    if (!tabName) {
      return NextResponse.json({ 
        error: `Sheet "${sheet}" not found`,
        availableSheets: wb.SheetNames || [] 
      }, { status: 404 });
    }

    const ws = wb.Sheets?.[tabName];
    if (!ws) {
      return NextResponse.json({ error: `Worksheet "${tabName}" not found in workbook` }, { status: 404 });
    }

    // Use the same header detection and column key logic as the main GET endpoint
    const { headerRow, headers: rawHeaders } = findHeaderRow(ws);
    
    // Build clean column keys with deduplication (same logic as main sheet-data/route.ts)
    const seen = new Map<string, number>();
    let emptyColIdx = 0;
    const columnKeys = rawHeaders.map((h) => {
      const trimmed = (h || '').toString().trim();
      if (!trimmed) return `__hidden_${emptyColIdx++}`;
      const count = seen.get(trimmed) ?? 0;
      seen.set(trimmed, count + 1);
      return count > 0 ? `${trimmed}_${count}` : trimmed;
    });

    const columns = columnKeys.filter((k) => !k.startsWith('__hidden_'));

    const colIndex = columnKeys.findIndex((key, idx) => {
      const rawHeader = (rawHeaders[idx] || '').toString().trim();
      const searchColumn = (column || '').toString().trim();
      
      return rawHeader === searchColumn || 
             key.toLowerCase() === searchColumn.toLowerCase() ||
             rawHeader.toLowerCase().replace(/\s+/g, '') === searchColumn.toLowerCase().replace(/\s+/g, '') ||
             key.toLowerCase().replace(/\s+/g, '') === searchColumn.toLowerCase().replace(/\s+/g, '');
    });

    if (colIndex === -1) {
      return NextResponse.json({ 
        error: `Column "${column}" not found in sheet "${sheet}". Available: ${columns.join(', ')}` 
      }, { status: 400 });
    }

    const excelRow = Number(rowIndex) + 1; // +1 because Excel is 1-based, frontend rowIndex skips header
    const cellAddress = utils.encode_cell({ r: excelRow, c: colIndex });

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
      message: `Updated ${sheet}!${cellAddress} (column key: ${columnKeys[colIndex]})`,
      cell: cellAddress,
      columnKey: columnKeys[colIndex],
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
