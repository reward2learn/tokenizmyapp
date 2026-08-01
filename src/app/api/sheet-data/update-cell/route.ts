import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { read, utils, write } from 'xlsx';
import type { WorkSheet } from 'xlsx';
import { evaluateFormula } from '@/lib/excel-formula';

export const dynamic = 'force-dynamic';

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

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
    return { headerRow: 1, headers: (rows[0] ?? []).map((c) => String(c ?? '')) };
  }
  return { headerRow: bestRow + 1, headers: bestHeaders };
}

export async function POST(request: Request): Promise<NextResponse> {
  const prisma = getClient();
  try {
    const body = await request.json();
    const { sheet, rowIndex, column, value, _excelCell, _excelRow, formulaMode } = body;

    const sheetStr = String(sheet ?? '').trim();
    const colStr = String(column ?? '').trim();

    console.log("[sheet-data/update-cell] Received:", { sheet: sheetStr, rowIndex, column: colStr, value, _excelCell });

    if (!sheetStr || (!rowIndex && !_excelCell) || !colStr) {
      return NextResponse.json({ error: 'Missing required fields: sheet, rowIndex/_cell, column' }, { status: 400 });
    }

    const cached = await prisma.knowledgeSnippet.findUnique({ where: { key: 'workbook_data' } });
    if (!cached?.content) {
      return NextResponse.json({ error: 'No workbook cached. Upload via Config > Source first.' }, { status: 404 });
    }

    const buf = Buffer.from(cached.content, 'base64');
    // cellFormula: true is REQUIRED — otherwise write() below strips every formula from the workbook.
    const wb = read(buf, { type: 'buffer', cellFormula: true });

    const tabName = wb.SheetNames?.find((n) => typeof n === "string" && n.toLowerCase() === sheetStr.toLowerCase());
    if (!tabName) {
      return NextResponse.json({ error: `Sheet "${sheetStr}" not found`, availableSheets: wb.SheetNames || [] }, { status: 404 });
    }

    const ws = wb.Sheets?.[tabName];
    if (!ws) {
      return NextResponse.json({ error: `Worksheet "${tabName}" not found` }, { status: 404 });
    }

    let cellAddress: string;

    if (_excelCell) {
      // Use the original Excel cell reference from initial load (preserves position after sorting/filtering)
      cellAddress = _excelCell;
      console.log(`[sheet-data/update-cell] Using original Excel cell: ${cellAddress}`);
    } else {
      // Fallback: calculate from rowIndex and column name
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
        return rawHeader === colStr ||
               key.toLowerCase() === colStr.toLowerCase() ||
               rawHeader.toLowerCase().replace(/\s+/g, '') === colStr.toLowerCase().replace(/\s+/g, '') ||
               key.toLowerCase().replace(/\s+/g, '') === colStr.toLowerCase().replace(/\s+/g, '');
      });

      if (colIndex === -1) {
        return NextResponse.json({
          error: `Column "${colStr}" not found in sheet "${sheetStr}". Available: ${columnKeys.filter(k => !k.startsWith('__hidden_')).join(', ')}`
        }, { status: 400 });
      }

      const excelRow = Number(rowIndex) + 1;
      cellAddress = utils.encode_cell({ r: excelRow, c: colIndex });
    }

    // ── Formula support (gated by formulaMode, default OFF) ──────────────
    // When formulaMode is enabled and the edited value starts with "=" the
    // cell stores a formula (f) plus the calculated result (v) when evaluable.
    // When OFF (default) every edit is stored as a plain value — no formula
    // parsing or evaluation happens.
    const isFormula = !!formulaMode && typeof value === 'string' && value.trim().startsWith('=');
    let responseValue: unknown = value;
    let formula: string | undefined;
    let unevaluable = false;

    if (isFormula) {
      formula = value.trim();
      const result = evaluateFormula(wb, ws, formula, 0);
      unevaluable = result.unevaluable;
      // Ensure Excel recalculates all formulas when the workbook is next opened
      // (cached values written by SheetJS may be stale for unevaluable formulas).
      if (wb.Workbook) (wb.Workbook as unknown as { CalcPr: { fullCalcOnLoad: boolean } }).CalcPr = { fullCalcOnLoad: true };
      if (!unevaluable) {
        responseValue = result.value;
        if (typeof responseValue === 'number') {
          ws[cellAddress] = { f: formula, v: responseValue, t: 'n', w: String(responseValue) };
        } else {
          const strVal = String(responseValue ?? '');
          ws[cellAddress] = { f: formula, v: strVal, t: 's', w: strVal };
        }
      } else {
        // SheetJS drops formula-only cells on read (f without v), so keep the
        // previous cached value to preserve the cell; Excel recalcs on open.
        const prev = ws[cellAddress]?.v;
        ws[cellAddress] = {
          f: formula,
          v: typeof prev === 'number' ? prev : 0,
          t: 'n',
        };
        responseValue = null;
      }
    } else {
      const cellValue = typeof value === 'number' ? value : String(value || '');
      // Replacing the whole cell object also clears any previous formula
      ws[cellAddress] = { v: cellValue, t: typeof value === 'number' ? 'n' : 's' };
      responseValue = cellValue;
    }

    const updatedBuffer = write(wb, { bookType: 'xlsx', type: 'buffer' });
    const base64Updated = Buffer.from(updatedBuffer).toString('base64');

    await prisma.knowledgeSnippet.update({
      where: { key: 'workbook_data' },
      data: { content: base64Updated },
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${sheetStr}!${cellAddress}`,
      cell: cellAddress,
      value: responseValue ?? null,
      formula,
      unevaluable,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sheet-data/update-cell] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
