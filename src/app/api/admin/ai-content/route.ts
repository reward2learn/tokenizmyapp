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
 * Resolve the June 2026 workbook — try disk first, then the base64
 * cached copy stored in knowledge_snippets.
 *
 * Multi-tenant + suite-mode aware: tries the following appId combinations
 * in order, using the current tenant slug and suite app_id:
 *   1. tenantSlug + appId (e.g. "redrubybali_hr") — full suite mode
 *   2. tenantSlug only — multi-tenant without suite app
 *   3. appId only (e.g. "hr") — suite mode without tenant isolation
 *   4. empty string '' — single-app tokenizmyapp tenant
 *   5. 'tokenizmyapp' explicitly — root config app fallback
 */
async function resolveWorkbook(): Promise<ExcelData> {
  // ── 1. Try disk (auto-detect) ────────────────────────────────
  try {
    return extractExcelData();
  } catch {
    // not on disk — continue to DB cache
  }

  // ── 2. Try DB cache with multi-tenant + suite-mode awareness ─────
  const tenantConfig = getTenantConfig();
  const tenantSlug = tenantConfig.slug;
  const appId = getCurrentAppId(); // e.g. "hr", "sales-reporting", or ""

  // Build the combined appId: "tenantSlug_appId" for suite mode
  const combinedAppId = tenantSlug && appId ? `${tenantSlug}_${appId}` : null;

  // Helper to try a specific appId
  async function tryAppId(appId: string): Promise<ExcelData | null> {
    try {
      const db = createClient();
      const cached = await db.knowledgeSnippet.findUnique({
        where: { key_appId: { key: 'workbook_data', appId } },
      });
      if (cached?.content) {
        return extractExcelData(Buffer.from(cached.content, 'base64'));
      }
      return null;
    } catch {
      return null;
    }
  }

  // Try order: suite-mode combos first, then fallbacks
  // 1. Combined: tenantSlug + appId (e.g. "redrubybali_hr")
  if (combinedAppId) {
    const combinedData = await tryAppId(combinedAppId);
    if (combinedData) return combinedData;
  }

  // 2. Tenant slug only (multi-tenant, no suite app)
  if (tenantSlug && tenantSlug !== 'tokenizmyapp') {
    const tenantData = await tryAppId(tenantSlug);
    if (tenantData) return tenantData;
  }

  // 3. AppId only (suite mode, e.g. "hr") — no tenant isolation
  if (appId) {
    const appOnlyData = await tryAppId(appId);
    if (appOnlyData) return appOnlyData;
  }

  // 4. Empty appId (single-app / tokenizmyapp)
  const defaultData = await tryAppId('');
  if (defaultData) return defaultData;

  // 5. tokenizmyapp explicitly (root config app)
  const rootData = await tryAppId('tokenizmyapp');
  if (rootData) return rootData;

  // ── 3. Fallback error ─────────────────────────────────────────
  throw new Error(
    'Workbook file not found on disk and no cached copy in database. ' +
    'Upload the June 2026 workbook via the Config > Workbook Upload page first.',
  );
}

// ── GET handler ─────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const guard = await requireWriteAuth(request);
    if (!guard.ok) return guard.response;
    if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

    // Resolve the workbook — try disk first, then DB cache (uploaded via /config/reseed).
    const data = await resolveWorkbook();

    const fullPrompt = buildGenerationPrompt(data);
    const promptPreview =
      fullPrompt.length > 3000
        ? fullPrompt.slice(0, 3000) + '\n\n... (truncated, full prompt available on request)'
        : fullPrompt;
    const dataSummary = buildDataSummary(data);

    const db = createClient();
    let existingContent: { executiveSummary: string | null; reviewParts: number } = {
      executiveSummary: null,
      reviewParts: 0,
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

  // Resolve the workbook source — try explicit filePath, then auto-detect, then DB cache.
  // In-memory Buffer is preferred on serverless runtimes where the filesystem is read-only.
  let source: string | Buffer | Buffer[] | undefined;
  if (filePath) {
    source = filePath;
  } else {
    try {
      // Try disk (auto-detect)
      extractExcelData();
      source = undefined; // auto-detect succeeded, leave undefined so extractExcelData finds it
    } catch {
      // Not on disk — resolve via DB cache (uploaded during reseed)
      try {
        const db = createClient(dbSession);
        // Try DB cache with multi-tenant + suite-mode awareness — same logic as GET handler
        const tenantConfig = getTenantConfig();
        const tenantSlug = tenantConfig.slug;
        const appId = getCurrentAppId(); // e.g. "hr", "sales-reporting", or ""
        const combinedAppId = tenantSlug && appId ? `${tenantSlug}_${appId}` : null;

        // Helper to try a specific appId — timeout-guarded so a single stuck
        // DB connection (invisible to Vercel's "External APIs" trace, since
        // Postgres isn't HTTP) can't silently eat the whole 120s function
        // budget; up to 5 of these run sequentially below.
        async function tryAppId(appId: string) {
          const cached = await withTimeout(
            db.knowledgeSnippet.findUnique({ where: { key_appId: { key: 'workbook_data', appId } } }),
            8000,
            `Workbook cache lookup (appId="${appId}")`,
          );
          if (cached && typeof cached === 'object' && 'content' in cached) {
            return Buffer.from((cached as { content: string }).content, 'base64');
          }
          return null;
        }

        // Try combined tenant+appId first (e.g. "redrubybali_hr")
        let buffers: Buffer[] = [];
        if (combinedAppId) {
          const cached = await tryAppId(combinedAppId);
          if (cached) buffers = [cached];
        }
        // Try tenant slug only
        if (!buffers.length && tenantSlug && tenantSlug !== 'tokenizmyapp') {
          const cached = await tryAppId(tenantSlug);
          if (cached) buffers = [cached];
        }
        // Try appId only
        if (!buffers.length && appId) {
          const cached = await tryAppId(appId);
          if (cached) buffers = [cached];
        }
        // Try empty appId (single-app tokenizmyapp)
        if (!buffers.length) {
          const cached = await tryAppId('');
          if (cached) buffers = [cached];
        }
        // Try tokenizmyapp explicitly
        if (!buffers.length) {
          const cached = await tryAppId('tokenizmyapp');
          if (cached) buffers = [cached];
        }

        if (buffers.length > 0) {
          source = buffers;
        }
      } catch (err) {
        // DB unavailable, or one of the timeout-guarded lookups above hung —
        // logged (not silently swallowed) so Vercel function logs show
        // exactly which stage failed instead of just a bare 120s timeout.
        console.error('[ai-content] Workbook cache lookup failed:', err instanceof Error ? err.message : err);
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
        model: result.content?.model,
        providerId: result.content?.providerId,
        providerLabel: result.content?.providerLabel,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
