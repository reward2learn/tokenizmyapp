/**
 * Sheet Data API
 *
 * GET /api/sheet-data?sheet=PL&page=1&perPage=200
 * POST /api/sheet-data/update-cell
 *
 * Reads the cached workbook, detects the header row automatically, and returns
 * paginated sheet data as a JSON array of objects keyed by column header.
 *
 * Formula evaluation (when ?formulas=1) runs ONLY on the current page after
 * sort + slice — never on the full sheet — to avoid 504s on large tabs (TB).
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { read, utils, write } from 'xlsx';
import { evaluateFormula } from '@/lib/excel-formula';
import { findHeaderRow, buildColumnKeys } from '@/lib/workbook-mapping';
import {
  findCachedWorkbook,
  invalidateParsedWorkbookCache,
} from '@/lib/workbook-cache';
import { querySheetDataFromCache } from '@/lib/sheet-data-read';
import type { SheetSortBy } from '@/lib/sheet-data-sort';

export const dynamic = 'force-dynamic';
/** Raised from 30s — large sheets still need headroom for parse + page formula eval. */
export const maxDuration = 120;

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

// ── GET handler ─────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const sheetName = searchParams.get('sheet');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const perPage = Math.min(1000, Math.max(1, parseInt(searchParams.get('perPage') ?? '200', 10)));

  const formulasEnabled = searchParams.get('formulas') === '1';

  let sortBy: SheetSortBy = [];
  try {
    const raw = searchParams.get('sortBy');
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        sortBy = parsed
          .filter(
            (e): e is [string, 'asc' | 'desc'] =>
              Array.isArray(e)
              && e.length === 2
              && typeof e[0] === 'string'
              && (e[1] === 'asc' || e[1] === 'desc'),
          )
          .slice(0, 3);
      }
    }
  } catch {
    sortBy = [];
  }

  if (!sheetName) {
    return NextResponse.json({ error: 'Query param "sheet" is required (e.g. ?sheet=PL)' }, { status: 400 });
  }

  const prisma = getClient();
  try {
    const result = await querySheetDataFromCache(prisma, {
      sheet: sheetName,
      page,
      perPage,
      formulas: formulasEnabled,
      sortBy,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          ...(result.availableSheets ? { availableSheets: result.availableSheets } : {}),
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result.data });
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

    console.log('[sheet-data/update-cell] Received payload:', {
      sheet,
      rowIndex,
      column,
      value,
      _excelCell,
    });

    if (!sheet || (!rowIndex && !_excelCell) || !column) {
      return NextResponse.json(
        {
          error: 'Missing required fields: sheet, rowIndex/_cell, column',
        },
        { status: 400 },
      );
    }

    const cached = await findCachedWorkbook(prisma);
    if (!cached?.content) {
      return NextResponse.json(
        {
          error: 'No workbook cached. Upload via Config > Source first.',
        },
        { status: 404 },
      );
    }
    const cacheAppId = cached.appId;

    // Writes must not mutate the shared GET parse cache — parse a private copy.
    const buf = Buffer.from(cached.content, 'base64');
    const wb = read(buf, { type: 'buffer', cellFormula: true });

    const tabName = wb.SheetNames?.find(
      (n) => typeof n === 'string' && n.toLowerCase() === sheet.toLowerCase(),
    );
    if (!tabName) {
      return NextResponse.json(
        {
          error: `Sheet "${sheet}" not found`,
          availableSheets: wb.SheetNames || [],
        },
        { status: 404 },
      );
    }

    const ws = wb.Sheets?.[tabName];
    if (!ws) {
      return NextResponse.json({ error: `Worksheet "${tabName}" not found` }, { status: 404 });
    }

    let cellAddress: string;

    if (_excelCell) {
      cellAddress = _excelCell;
      console.log(`[sheet-data/update-cell] Using original Excel cell: ${cellAddress}`);
    } else {
      const { headers: rawHeaders } = findHeaderRow(ws);
      const columnKeys = buildColumnKeys(rawHeaders);

      const colIndex = columnKeys.findIndex((key, idx) => {
        const rawHeader = String(rawHeaders[idx] ?? '').trim();
        const searchColumn = String(column ?? '').trim();
        return (
          rawHeader === searchColumn
          || key.toLowerCase() === searchColumn.toLowerCase()
          || rawHeader.toLowerCase().replace(/\s+/g, '') === searchColumn.toLowerCase().replace(/\s+/g, '')
          || key.toLowerCase().replace(/\s+/g, '') === searchColumn.toLowerCase().replace(/\s+/g, '')
        );
      });

      if (colIndex === -1) {
        return NextResponse.json(
          {
            error: `Column "${column}" not found in sheet "${sheet}". Available: ${columnKeys.filter((k) => !k.startsWith('__hidden_')).join(', ')}`,
          },
          { status: 400 },
        );
      }

      const excelRow = Number(rowIndex) + 1;
      cellAddress = utils.encode_cell({ r: excelRow, c: colIndex });
    }

    const isFormula = typeof value === 'string' && value.trim().startsWith('=');
    let responseValue: unknown = value;
    let formula: string | undefined;
    let unevaluable = false;

    if (isFormula) {
      formula = value.trim();
      const storedFormula = formula.replace(/^=/, '');
      const result = evaluateFormula(wb, ws, formula, 0, cellAddress);
      unevaluable = result.unevaluable;
      if (wb.Workbook) {
        (wb.Workbook as unknown as { CalcPr: { fullCalcOnLoad: boolean } }).CalcPr = {
          fullCalcOnLoad: true,
        };
      }
      if (!unevaluable) {
        responseValue = result.value;
        if (typeof responseValue === 'number') {
          ws[cellAddress] = { f: storedFormula, v: responseValue, t: 'n', w: String(responseValue) };
        } else {
          const strVal = String(responseValue ?? '');
          ws[cellAddress] = { f: storedFormula, v: strVal, t: 's', w: strVal };
        }
      } else {
        const prev = ws[cellAddress]?.v;
        ws[cellAddress] = {
          f: storedFormula,
          v: typeof prev === 'number' ? prev : 0,
          t: 'n',
        };
        responseValue = null;
      }
    } else {
      const cellValue = typeof value === 'number' ? value : String(value || '');
      ws[cellAddress] = {
        v: cellValue,
        t: typeof value === 'number' ? 'n' : 's',
      };
      responseValue = cellValue;
    }

    const updatedBuffer = write(wb, { bookType: 'xlsx', type: 'buffer' });
    const base64Updated = Buffer.from(updatedBuffer).toString('base64');

    await prisma.knowledgeSnippet.update({
      where: { key_appId: { key: 'workbook_data', appId: cacheAppId } },
      data: { content: base64Updated },
    });

    invalidateParsedWorkbookCache(cacheAppId);

    return NextResponse.json({
      success: true,
      message: `Updated ${sheet}!${cellAddress}`,
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
