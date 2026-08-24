/**
 * AI Content Generation API
 *
 * GET  /api/admin/ai-content
 *   Returns: prompt preview, data summary, current generated content status
 *
 * POST /api/admin/ai-content  (no Accept: text/event-stream)
 *   Standard blocking POST — reads Excel, calls the configured AI provider, saves to DB.
 *   Returns: generation result with saved content info
 *
 * POST /api/admin/ai-content  (Accept: text/event-stream or ?stream=true)
 *   SSE streaming — same pipeline but each stage is pushed as a server-sent event
 *   so the client can show real-time progress, notifications, and a progress bar.
 *
 *   Events:
 *     event: progress
 *     data: {"step":"extracting","message":"...","pct":5}
 *
 *     event: complete
 *     data: {"step":"complete","message":"...","pct":100,"detail":{...}}
 *
 *     event: error
 *     data: {"step":"error","message":"...","detail":{...}}
 *
 *   The last event is always either "complete" or "error".
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import type { DbSession } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError } from '@/lib/api/response';
import { extractExcelData, type ExcelData } from '@/domain/excel/excel-extractor';
import { buildGenerationPrompt, buildDataSummary } from '@/domain/ai-content/prompt-builder';
import { generateAndSave, OPENAI_QUOTA_MARKER, type ProgressEvent } from '@/domain/ai-content/content-generator';
import { isBypassedAdminSlug } from '@/domain/ai-content/ensure-template-pages';
import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';
import { withTimeout } from '@/lib/with-timeout';

export const dynamic = 'force-dynamic';
// The three AI calls (business review, executive summary, dashboard data)
// now run concurrently (see content-generator.ts) rather than summed
// sequentially, but a single slow model/provider can still approach 120s on
// its own — this raises the ceiling as a safety margin. Actual max is
// whatever the deployment's Vercel plan allows; excess is silently capped.
export const maxDuration = 300;

// ── Schema ──────────────────────────────────────────────

const postSchema = z.object({
  filePath: z.string().optional(),
  model: z.string().optional(),
  additionalContext: z.string().optional(),
  overridePrompt: z.string().optional(),
});

// ── SSE helpers ─────────────────────────────────────────

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

const encoder = new TextEncoder();

function sseStream(run: (emit: (event: ProgressEvent) => void) => Promise<void>): ReadableStream<Uint8Array> {
  let streamController: ReadableStreamDefaultController<Uint8Array> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      streamController = c;
    },
    cancel() {
      streamController = null;
    },
  });

  // Run the pipeline, pushing SSE events as progress is reported
  void (async () => {
    try {
      await run((event: ProgressEvent) => {
        if (!streamController) return;
        const ctrl: ReadableStreamDefaultController<Uint8Array> = streamController;
        try {
          const eventType = event.step === 'complete'
            ? 'complete'
            : event.step === 'error'
              ? 'error'
              : 'progress';
          ctrl.enqueue(encoder.encode(sseEvent(eventType, event)));

          // Close the stream on terminal events
          if (event.step === 'complete' || event.step === 'error') {
            ctrl.close();
          }
        } catch {
          // Stream may have been cancelled
        }
      });
    } catch (err) {
      if (!streamController) return;
      const ctrl: ReadableStreamDefaultController<Uint8Array> = streamController;
      try {
        ctrl.enqueue(
          encoder.encode(
            sseEvent('error', {
              step: 'error',
              message: err instanceof Error ? err.message : String(err),
              pct: 0,
              code: err instanceof Error && err.message.includes(OPENAI_QUOTA_MARKER)
                ? 'ai_provider_no_credits'
                : undefined,
            }),
          ),
        );
        ctrl.close();
      } catch {
        // ignore
      }
    }
  })();

  return stream;
}

// ── Workbook resolver ─────────────────────────────────

/**
 * Resolve the workbook — prefer the DB cache for the current suite appId
 * (what Config → Upload & Seed just wrote), then fall back to disk, then
 * other appId variants. Disk-first used to win with a stale baked-in file
 * and ignore the freshly uploaded workbook_data row.
 */
async function resolveWorkbook(): Promise<ExcelData> {
  const tenantConfig = getTenantConfig();
  const tenantSlug = tenantConfig.slug;
  const appId = getCurrentAppId(); // e.g. "finance", "hr", or ""
  const combinedAppId = tenantSlug && appId ? `${tenantSlug}_${appId}` : null;

  async function tryAppId(candidate: string): Promise<ExcelData | null> {
    try {
      const db = createClient();
      const cached = await db.knowledgeSnippet.findUnique({
        where: { key_appId: { key: 'workbook_data', appId: candidate } },
      });
      if (cached?.content) {
        return extractExcelData(Buffer.from(cached.content, 'base64'));
      }
      return null;
    } catch {
      return null;
    }
  }

  // ── 1. Current app / suite cache (fresh upload) ──────────
  if (appId) {
    const appOnlyData = await tryAppId(appId);
    if (appOnlyData) return appOnlyData;
  }
  if (combinedAppId) {
    const combinedData = await tryAppId(combinedAppId);
    if (combinedData) return combinedData;
  }

  // ── 2. Disk (local / baked template) ─────────────────────
  try {
    return extractExcelData();
  } catch {
    // not on disk — continue
  }

  // ── 3. Broader fallbacks ─────────────────────────────────
  if (tenantSlug && tenantSlug !== 'tokenizmyapp') {
    const tenantData = await tryAppId(tenantSlug);
    if (tenantData) return tenantData;
  }

  const defaultData = await tryAppId('');
  if (defaultData) return defaultData;

  const rootData = await tryAppId('tokenizmyapp');
  if (rootData) return rootData;

  throw new Error(
    'Workbook file not found on disk and no cached copy in database. ' +
      'Upload the workbook via the Config > Workbook Upload page first.',
  );
}

// ── GET handler ─────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const guard = await requireWriteAuth(request);
    if (!guard.ok) return guard.response;
    if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

    // Resolve the workbook — prefer DB cache for current app, then disk.
    const data = await resolveWorkbook();

    const fullPrompt = buildGenerationPrompt(data);
    // Note: GET preview is Excel-only; POST generateAndSave also appends
    // buildSeededPromptContext() so the live run includes projections/targets/etc.
    const promptPreview =
      fullPrompt.length > 3000
        ? fullPrompt.slice(0, 3000) + '\n\n... (truncated, full prompt available on request)'
        : fullPrompt;
    const dataSummary = buildDataSummary(data);

    const db = createClient();
    let existingContent: {
      executiveSummary: string | null;
      reviewParts: number;
      dashboardData: boolean;
      pages: { slug: string; title: string; kind: string; hasContent: boolean; detail?: string }[];
    } = {
      executiveSummary: null,
      reviewParts: 0,
      dashboardData: false,
      pages: [],
    };

    try {
      const snippet = await withTimeout(
        db.knowledgeSnippet.findUnique({ where: { key_appId: { key: 'executive_summary', appId: getCurrentAppId() } } }),
        8000,
        'Existing executive summary lookup',
      );
      existingContent.executiveSummary = snippet && typeof snippet === 'object' && 'content' in snippet
        ? (snippet as { content: string }).content.slice(0, 500) + '...'
        : null;
      const partCount = await withTimeout(db.businessReviewPart.count(), 8000, 'Business review part count');
      existingContent.reviewParts = partCount as number;
      const dash = await withTimeout(
        db.knowledgeSnippet.findUnique({ where: { key_appId: { key: 'dashboard_data', appId: getCurrentAppId() } } }),
        8000,
        'Dashboard data lookup',
      );
      existingContent.dashboardData = Boolean(dash && typeof dash === 'object' && 'content' in dash);

      const appPages = await withTimeout(
        db.appPage.findMany({
          select: { slug: true, title: true },
          orderBy: { sortOrder: 'asc' },
        }),
        8000,
        'App pages lookup',
      ).catch(() => [] as { slug: string; title: string }[]);

      const taskCount = await withTimeout(db.task.count().catch(() => 0), 8000, 'Task count').catch(() => 0);

      existingContent.pages = (appPages as { slug: string; title: string }[])
        .filter((p) => !isBypassedAdminSlug(p.slug) && p.slug !== 'terms-of-service' && p.slug !== 'privacy-policy')
        .map((p) => {
        const slug = p.slug;
        if (slug === 'summary') {
          return {
            slug,
            title: p.title,
            kind: 'narrative',
            hasContent: Boolean(existingContent.executiveSummary),
            detail: existingContent.executiveSummary ? 'Executive summary' : 'Missing',
          };
        }
        if (slug === 'review') {
          return {
            slug,
            title: p.title,
            kind: 'narrative',
            hasContent: existingContent.reviewParts > 0,
            detail: `${existingContent.reviewParts} part(s)`,
          };
        }
        if (slug === 'home') {
          return {
            slug,
            title: p.title,
            kind: 'narrative',
            hasContent: Boolean(existingContent.executiveSummary) || existingContent.reviewParts > 0,
            detail: 'Exec summary + review blocks',
          };
        }
        if (slug === 'dashboard') {
          return {
            slug,
            title: p.title,
            kind: 'dashboard',
            hasContent: existingContent.dashboardData,
            detail: existingContent.dashboardData ? 'Dashboard JSON' : 'Missing dashboard data',
          };
        }
        if (slug === 'tasks') {
          return {
            slug,
            title: p.title,
            kind: 'tasks',
            hasContent: (taskCount as number) > 0,
            detail: `${taskCount} task(s)`,
          };
        }
        if (slug.startsWith('sheet-')) {
          return {
            slug,
            title: p.title,
            kind: 'sheet',
            hasContent: true,
            detail: 'Workbook sheet page',
          };
        }
        if (slug === 'ops-tracking') {
          return {
            slug,
            title: p.title,
            kind: 'live-data',
            hasContent: true,
            detail: 'Live projections / KPIs',
          };
        }
        return {
          slug,
          title: p.title,
          kind: 'narrative',
          hasContent: true,
          detail: 'Template page',
        };
      });
    } catch (err) {
      console.error('[ai-content] GET existing-content lookup failed:', err instanceof Error ? err.message : err);
    }

    return NextResponse.json({
      success: true,
      data: {
        promptLength: fullPrompt.length,
        promptPreview,
        fullPrompt,
        dataSummary,
        existingContent,
        excelPeriod: data.period,
        excelCompany: data.company,
        tabs: [
          'Daily Sales', 'GL', 'TB', 'PL', 'BS', 'COS',
          'Month on Month', 'BEP Monthly', 'Monthly Variance', 'SUMPL', 'SumBS',
        ],
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ── POST handler ────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  // Parse body regardless of stream mode (needed for filePath, model)
  const body = await request.json().catch(() => ({}));
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { filePath, model, additionalContext, overridePrompt } = parsed.data;

  // Build a DbSession from the authenticated request (needed for ZenStack policy)
  const dbSession: DbSession = { tier: guard.session.tier as 'public' | 'pin' | 'google', sub: guard.session.sub };

  // Resolve the workbook source — prefer DB cache for the current appId
  // (fresh Upload & Seed), then disk, then broader appId fallbacks.
  let source: string | Buffer | Buffer[] | undefined;
  if (filePath) {
    source = filePath;
  } else {
    try {
      const db = createClient(dbSession);
      const tenantConfig = getTenantConfig();
      const tenantSlug = tenantConfig.slug;
      const appId = getCurrentAppId();
      const combinedAppId = tenantSlug && appId ? `${tenantSlug}_${appId}` : null;

      async function tryAppId(candidate: string) {
        const cached = await withTimeout(
          db.knowledgeSnippet.findUnique({ where: { key_appId: { key: 'workbook_data', appId: candidate } } }),
          8000,
          `Workbook cache lookup (appId="${candidate}")`,
        );
        if (cached && typeof cached === 'object' && 'content' in cached) {
          return Buffer.from((cached as { content: string }).content, 'base64');
        }
        return null;
      }

      let buffers: Buffer[] = [];
      // Prefer current suite app cache (what reseed just wrote)
      if (appId) {
        const cached = await tryAppId(appId);
        if (cached) buffers = [cached];
      }
      if (!buffers.length && combinedAppId) {
        const cached = await tryAppId(combinedAppId);
        if (cached) buffers = [cached];
      }
      if (!buffers.length && tenantSlug && tenantSlug !== 'tokenizmyapp') {
        const cached = await tryAppId(tenantSlug);
        if (cached) buffers = [cached];
      }
      if (!buffers.length) {
        const cached = await tryAppId('');
        if (cached) buffers = [cached];
      }
      if (!buffers.length) {
        const cached = await tryAppId('tokenizmyapp');
        if (cached) buffers = [cached];
      }

      if (buffers.length > 0) {
        source = buffers;
      } else {
        // No DB cache — fall back to disk auto-detect inside generateAndSave
        try {
          extractExcelData();
          source = undefined;
        } catch {
          source = undefined;
        }
      }
    } catch (err) {
      console.error('[ai-content] Workbook cache lookup failed:', err instanceof Error ? err.message : err);
      try {
        extractExcelData();
        source = undefined;
      } catch {
        source = undefined;
      }
    }
  }

  // ── SSE streaming mode ────────────────────────────────
  const wantsStream =
    request.headers.get('accept') === 'text/event-stream' ||
    new URL(request.url).searchParams.has('stream');

  if (wantsStream) {
    const stream = sseStream(async (emit) => {
      const db = createClient(dbSession);
      await generateAndSave(db, emit, source, model, additionalContext, overridePrompt, getTenantConfig().slug);
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }

  // ── Blocking (legacy) mode ────────────────────────────
  try {
    const db = createClient(dbSession);
    const result = await generateAndSave(db, undefined, source, model, additionalContext, overridePrompt, getTenantConfig().slug);

    if (!result.success) {
      const isQuota = result.error?.includes(OPENAI_QUOTA_MARKER) ?? false;
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: isQuota ? 'ai_provider_no_credits' : undefined,
          prompt: result.prompt,
        },
        { status: isQuota ? 402 : 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        promptLength: result.prompt?.length ?? 0,
        contentLengths: {
          businessReview: result.content?.businessReview.length ?? 0,
          executiveSummary: result.content?.executiveSummary.length ?? 0,
        },
        saved: result.saved,
        sheetPagesCreated: result.saved?.sheetPages?.length ?? 0,
        model: result.content?.model,
        providerId: result.content?.providerId,
        providerLabel: result.content?.providerLabel,
        usage: result.usage ?? null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
