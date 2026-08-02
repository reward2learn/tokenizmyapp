import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { read, utils, write } from 'xlsx';
import type { WorkSheet } from 'xlsx';
import { evaluateFormula } from '@/lib/excel-formula';
import { findHeaderRow, buildColumnKeys } from '@/lib/workbook-mapping';
import {
  CUSTOM_COLUMNS_SNIPPET_KEY,
  parseCustomColumnsStore,
  resolveCustomColumnByName,
  applyCustomColumnOverlay,
  virtualAddress,
  type CustomColumnCell,
} from '@/lib/custom-columns';

export const dynamic = 'force-dynamic';

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
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

    // ── Custom-column (overlay) branch ────────────────────────────────
    // Custom columns live in knowledge_snippets.workbook_custom_columns and are
    // NEVER written into the workbook buffer, so Excel column indices and every
    // formula reference stay intact. Edits to a custom column update the
    // overlay store only — cell input and formulas are preserved.
    const customSnippet = await prisma.knowledgeSnippet.findUnique({
      where: { key: CUSTOM_COLUMNS_SNIPPET_KEY },
    });
    const customStore = parseCustomColumnsStore(customSnippet?.content ?? null);
    const customCol = resolveCustomColumnByName(customStore, tabName, colStr);

    if (customCol) {
      // Overlay all custom columns (incl. this one) so formulas can reference
      // both workbook cells and other custom-column cells. In-memory only.
      applyCustomColumnOverlay(wb, customStore, tabName);

      const excelRow = Number(_excelRow) || (Number(rowIndex) + 1);
      if (!Number.isFinite(excelRow) || excelRow < 1) {
        return NextResponse.json({ error: 'Invalid row for custom column cell' }, { status: 400 });
      }
      const cellAddr = virtualAddress(customCol, excelRow);

      const isFormula = !!formulaMode && typeof value === 'string' && value.trim().startsWith('=');
      const cell: CustomColumnCell = isFormula
        ? { formula: value.trim() }
        : { value: typeof value === 'number' ? value : String(value ?? '') };

      let responseValue: unknown = cell.value ?? null;
      let unevaluable = false;
      if (isFormula) {
        const result = evaluateFormula(wb, ws, value.trim(), 0, cellAddr);
        unevaluable = result.unevaluable;
        cell.unevaluable = unevaluable;
        if (!unevaluable) {
          cell.value = result.value;
          responseValue = result.value;
        } else {
          responseValue = null;
        }
      }

      customCol.cells[String(excelRow)] = cell;
      customCol.updatedAt = new Date().toISOString();
      await prisma.knowledgeSnippet.upsert({
        where: { key: CUSTOM_COLUMNS_SNIPPET_KEY },
        create: { key: CUSTOM_COLUMNS_SNIPPET_KEY, category: 'cache', content: JSON.stringify(customStore) },
        update: { content: JSON.stringify(customStore) },
      });

      return NextResponse.json({
        success: true,
        message: `Updated ${sheetStr}!${cellAddr}`,
        cell: cellAddr,
        value: responseValue ?? null,
        formula: isFormula ? value.trim() : undefined,
        unevaluable,
      });
    }

    let cellAddress: string;

    if (_excelCell) {
      // Use the original Excel cell reference from initial load (preserves position after sorting/filtering)
      cellAddress = _excelCell;
      console.log(`[sheet-data/update-cell] Using original Excel cell: ${cellAddress}`);
    } else {
      // Fallback: calculate from rowIndex and column name
      const { headers: rawHeaders } = findHeaderRow(ws);
      const columnKeys = buildColumnKeys(rawHeaders);

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
      const storedFormula = formula.replace(/^=/, '');
      const result = evaluateFormula(wb, ws, formula, 0, cellAddress);
      unevaluable = result.unevaluable;
      // Ensure Excel recalculates all formulas when the workbook is next opened
      // (cached values written by SheetJS may be stale for unevaluable formulas).
      if (wb.Workbook) (wb.Workbook as unknown as { CalcPr: { fullCalcOnLoad: boolean } }).CalcPr = { fullCalcOnLoad: true };
      if (!unevaluable) {
        responseValue = result.value;
        if (typeof responseValue === 'number') {
          ws[cellAddress] = { f: storedFormula, v: responseValue, t: 'n', w: String(responseValue) };
        } else {
          const strVal = String(responseValue ?? '');
          ws[cellAddress] = { f: storedFormula, v: strVal, t: 's', w: strVal };
        }
      } else {
        // SheetJS drops formula-only cells on read (f without v), so keep the
        // previous cached value to preserve the cell; Excel recalcs on open.
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
