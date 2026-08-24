/**
 * Reprocess API — re-runs the seed pipeline using the cached workbook
 * from the database (stored as a `workbook_data` knowledge snippet).
 *
 * POST /api/config/reprocess
 *
 * This does NOT require re-uploading source files. It reads the
 * previously cached workbook and re-analyzes it, regenerating
 * dynamic pages, knowledge snippets, and summary content.
 *
 * When the durable workbook-ingest workflow is available, also starts
 * it and returns a 202 with `runId` so the Upload & Seed UI can stream
 * the same progress timeline as a fresh upload.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { requireWriteAuth, requireCapability } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { seedFromSources, type SeedCounts } from '@/domain/seed/seed-runner';
import type { SourceFileKey } from '@/domain/seed/source-files';
import {
  findCachedWorkbook,
  findCachedWorkbookInfo,
} from '@/lib/workbook-cache';
import { resolveOpenAiKey } from '@/lib/openai';
import { start } from 'workflow/api';
import { handleWorkbookIngest } from '../../../../../workflows/workbook-ingest';
import type { WorkbookIngestInput } from '../../../../../workflows/workbook-ingest/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min

export interface ReprocessResponse {
  counts: SeedCounts;
  filesUsed: Record<SourceFileKey, 'upload' | 'disk'>;
  uploaded: SourceFileKey[];
  source: 'cache' | 'none';
  /** Present when workbook ingest was started (same shape as reseed 202). */
  runId?: string;
  status?: 'accepted';
  ok?: boolean;
  warnings?: string[];
}

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const groupGuard = await requireCapability('config:write', request);
  if (!groupGuard.ok) return groupGuard.response;

  const prisma = new PrismaClient();

  try {
    const cached = await findCachedWorkbook(prisma);
    const cacheAppId = cached?.appId ?? '';

    if (!cached) {
      return jsonError(
        'No cached workbook found. Upload the workbook via the Source tab first (Upload & Seed).',
        404,
      );
    }

    const info = await findCachedWorkbookInfo(prisma);
    const excelBuffers: Buffer[] = [Buffer.from(cached.content, 'base64')];
    const excelFileNames: string[] = [
      info?.meta.files[0]?.fileName ?? 'workbook.xlsx',
    ];

    // Read additional cached workbooks (workbook_data_1, workbook_data_2, ...)
    for (let i = 1; i < 10; i++) {
      const extra = await prisma.knowledgeSnippet.findUnique({
        where: { key_appId: { key: `workbook_data_${i}`, appId: cacheAppId } },
      });
      if (extra?.content) {
        excelBuffers.push(Buffer.from(extra.content, 'base64'));
        excelFileNames.push(
          info?.meta.files[i]?.fileName ?? `workbook_${i}.xlsx`,
        );
      } else {
        break;
      }
    }

    const result = await seedFromSources({
      overrides: { excel: excelBuffers },
      persistOverrides: false, // read-only filesystem on Vercel
      excelFileNames,
    });

    const input: WorkbookIngestInput = {
      files: excelBuffers.map((buf, i) => ({
        name: excelFileNames[i] || 'workbook.xlsx',
        data: new Uint8Array(buf),
        size: buf.byteLength,
      })),
      model: 'gpt-4o',
      skipContentGeneration: false,
      tenantSlug: process.env.NEXT_PUBLIC_TENANT_SLUG || undefined,
      appId: process.env.NEXT_PUBLIC_APP_ID?.trim() || '',
      dbUrl: process.env.POSTGRES_URL || '',
      openaiApiKey: (await resolveOpenAiKey()) || process.env.OPENAI_API_KEY || null,
    };

    try {
      const run = await start(handleWorkbookIngest, [input]);
      const payload: ReprocessResponse = {
        ok: true,
        runId: run.runId,
        status: 'accepted',
        counts: result.counts,
        filesUsed: result.filesUsed,
        uploaded: [],
        source: 'cache',
        warnings: [],
      };
      return NextResponse.json({ success: true, data: payload }, { status: 202 });
    } catch (workflowErr) {
      console.warn(
        '[reprocess] Workbook ingest workflow unavailable, returning sync seed only:',
        workflowErr instanceof Error ? workflowErr.message : workflowErr,
      );
      const payload: ReprocessResponse = {
        counts: result.counts,
        filesUsed: result.filesUsed,
        uploaded: [],
        source: 'cache',
      };
      return jsonOk(payload);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Reprocess failed';
    return jsonError(message, 500);
  } finally {
    await prisma.$disconnect();
  }
}
