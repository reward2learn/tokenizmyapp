/**
 * Custom Columns API — item-level operations.
 *
 * PATCH /api/sheet-data/custom-columns/[id]  → rename / reposition / bulk cell write
 * DELETE /api/sheet-data/custom-columns/[id] → remove the column (frees its slot)
 *
 * Never touches the workbook buffer — see custom-columns/route.ts for the
 * overlay rationale.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { read } from 'xlsx';
import { evaluateFormula } from '@/lib/excel-formula';
import {
  CUSTOM_COLUMNS_SNIPPET_KEY,
  emptyCustomColumnsStore,
  parseCustomColumnsStore,
  resolveCustomColumnByName,
  applyCustomColumnOverlay,
  virtualAddress,
  type CustomColumn,
  type CustomColumnCell,
  type CustomColumnsStore,
} from '@/lib/custom-columns';

export const dynamic = 'force-dynamic';

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

const INVALID_NAME = /^_|_(cell|formula|unevaluable)$/i;

function toMeta(col: CustomColumn): {
  id: string;
  sheet: string;
  name: string;
  position: number;
  virtualCol: number;
  cellCount: number;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: col.id,
    sheet: col.sheet,
    name: col.name,
    position: col.position,
    virtualCol: col.virtualCol,
    cellCount: Object.keys(col.cells).length,
    createdAt: col.createdAt,
    updatedAt: col.updatedAt,
  };
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await ctx.params;

  const prisma = getClient();
  try {
    const body = await request.json();
    const snippet = await prisma.knowledgeSnippet.findUnique({
      where: { key: CUSTOM_COLUMNS_SNIPPET_KEY },
    });
    const store = parseCustomColumnsStore(snippet?.content ?? null);
    const col = store.columns.find((c) => c.id === id);
    if (!col) {
      return NextResponse.json({ error: `Custom column "${id}" not found` }, { status: 404 });
    }

    // Rename (validated + uniqueness-checked)
    if (body.name !== undefined) {
      const name = String(body.name ?? '').trim();
      if (!name || name.length > 60 || INVALID_NAME.test(name)) {
        return NextResponse.json({ error: 'Invalid column name' }, { status: 400 });
      }
      if (resolveCustomColumnByName(store, col.sheet, name) && name !== col.name) {
        return NextResponse.json({ error: `Custom column "${name}" already exists in sheet "${col.sheet}"` }, { status: 409 });
      }
      col.name = name;
    }

    // Reposition (index among the workbook's visible columns)
    if (body.position !== undefined) {
      const position = Math.floor(Number(body.position));
      if (!Number.isFinite(position) || position < 0) {
        return NextResponse.json({ error: 'position must be a non-negative integer' }, { status: 400 });
      }
      col.position = position;
    }

    // Bulk cell writes: { "5": 1200, "6": "=D6*2", "7": "" }
    if (body.cells !== undefined && typeof body.cells === 'object' && body.cells !== null) {
      const formulaMode = !!body.formulaMode;
      const formulaEntries: Array<{ row: number; formula: string }> = [];
      for (const [rowKey, raw] of Object.entries(body.cells as Record<string, unknown>)) {
        const excelRow = Number(rowKey);
        if (!Number.isInteger(excelRow) || excelRow < 1) continue;
        if (raw === '' || raw === null || raw === undefined) {
          delete col.cells[String(excelRow)];
          continue;
        }
        if (formulaMode && typeof raw === 'string' && raw.trim().startsWith('=')) {
          formulaEntries.push({ row: excelRow, formula: raw.trim() });
          continue;
        }
        col.cells[String(excelRow)] = {
          value: typeof raw === 'number' ? raw : String(raw),
        };
      }

      if (formulaEntries.length > 0) {
        const cached = await prisma.knowledgeSnippet.findUnique({ where: { key: 'workbook_data' } });
        if (!cached?.content) {
          return NextResponse.json({ error: 'No workbook cached. Upload via Config > Source first.' }, { status: 404 });
        }
        const wb = read(Buffer.from(cached.content, 'base64'), { type: 'buffer', cellFormula: true });
        const ws = wb.Sheets[col.sheet];
        if (!ws) {
          return NextResponse.json({ error: `Sheet "${col.sheet}" not found in workbook` }, { status: 404 });
        }
        applyCustomColumnOverlay(wb, store, col.sheet);
        for (const entry of formulaEntries) {
          const addr = virtualAddress(col, entry.row);
          const result = evaluateFormula(wb, ws, entry.formula, 0, addr);
          const cell: CustomColumnCell = {
            formula: entry.formula,
            unevaluable: result.unevaluable,
          };
          if (!result.unevaluable) cell.value = result.value;
          col.cells[String(entry.row)] = cell;
        }
      }
    }

    col.updatedAt = new Date().toISOString();

    const nextStore: CustomColumnsStore = {
      ...emptyCustomColumnsStore(),
      columns: store.columns,
    };
    await prisma.knowledgeSnippet.upsert({
      where: { key: CUSTOM_COLUMNS_SNIPPET_KEY },
      create: { key: CUSTOM_COLUMNS_SNIPPET_KEY, category: 'cache', content: JSON.stringify(nextStore) },
      update: { content: JSON.stringify(nextStore) },
    });

    return NextResponse.json({ success: true, data: { column: toMeta(col) } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await ctx.params;

  const prisma = getClient();
  try {
    const snippet = await prisma.knowledgeSnippet.findUnique({
      where: { key: CUSTOM_COLUMNS_SNIPPET_KEY },
    });
    const store = parseCustomColumnsStore(snippet?.content ?? null);
    const before = store.columns.length;
    store.columns = store.columns.filter((c) => c.id !== id);
    if (store.columns.length === before) {
      return NextResponse.json({ error: `Custom column "${id}" not found` }, { status: 404 });
    }

    await prisma.knowledgeSnippet.upsert({
      where: { key: CUSTOM_COLUMNS_SNIPPET_KEY },
      create: { key: CUSTOM_COLUMNS_SNIPPET_KEY, category: 'cache', content: JSON.stringify(store) },
      update: { content: JSON.stringify(store) },
    });

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
