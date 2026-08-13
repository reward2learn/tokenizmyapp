/**
 * Sheet Viewer table configuration API.
 *
 * GET  /api/sheet-data/config?sheet=X → stored config (widths + row height)
 * POST /api/sheet-data/config         → merge-save a patch
 *
 * Persisted in knowledge_snippets.workbook_sheet_viewer_config (per sheet).
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import {
  SHEET_VIEWER_CONFIG_SNIPPET_KEY,
  getSheetViewerConfig,
  mergeSheetViewerConfig,
  parseSheetViewerConfigStore,
} from '@/lib/sheet-viewer-config';

export const dynamic = 'force-dynamic';

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const sheetName = searchParams.get('sheet');

  const prisma = getClient();
  try {
    if (!sheetName) {
      return NextResponse.json({ error: 'Query param "sheet" is required' }, { status: 400 });
    }
    const snippet = await prisma.knowledgeSnippet.findUnique({
      where: { key: SHEET_VIEWER_CONFIG_SNIPPET_KEY },
    });
    const store = parseSheetViewerConfigStore(snippet?.content ?? null);
    return NextResponse.json({ success: true, data: getSheetViewerConfig(store, sheetName) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const prisma = getClient();
  try {
    const body = await request.json();
    const sheetName = String(body?.sheet ?? '').trim();
    if (!sheetName) {
      return NextResponse.json({ error: 'Field "sheet" is required' }, { status: 400 });
    }

    const snippet = await prisma.knowledgeSnippet.findUnique({
      where: { key: SHEET_VIEWER_CONFIG_SNIPPET_KEY },
    });
    const store = parseSheetViewerConfigStore(snippet?.content ?? null);
    const nextStore = mergeSheetViewerConfig(store, sheetName, {
      columnWidths:
        body.columnWidths !== undefined && typeof body.columnWidths === 'object' && body.columnWidths !== null
          ? (body.columnWidths as Record<string, number>)
          : undefined,
      rowHeight: body.rowHeight !== undefined ? Number(body.rowHeight) : undefined,
    });

    await prisma.knowledgeSnippet.upsert({
      where: { key: SHEET_VIEWER_CONFIG_SNIPPET_KEY },
      create: { key: SHEET_VIEWER_CONFIG_SNIPPET_KEY, category: 'cache', content: JSON.stringify(nextStore) },
      update: { content: JSON.stringify(nextStore) },
    });

    return NextResponse.json({ success: true, data: getSheetViewerConfig(nextStore, sheetName) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
