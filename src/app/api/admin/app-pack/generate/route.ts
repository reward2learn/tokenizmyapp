import { NextResponse } from 'next/server';
import { requireWriteAuth, requireCapability } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { createRawClient } from '@/lib/db';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { start } from 'workflow/api';
import { handleAppPackGenerate } from '../../../../../../workflows/app-pack-generate';
import type { AppPackGenerateInput } from '../../../../../../workflows/app-pack-generate/types';
import { defaultPackId } from '../../../../../../workflows/app-pack-generate/steps';

export const maxDuration = 300; // 5 min — workflow steps run zenstack generate + prisma db push

/**
 * POST /api/admin/app-pack/generate
 *
 * Starts a Vercel Workflow SDK run that derives a complete application pack
 * (W3 schema → ZenStack → pages → nav → UX workflow → knowledge snippets)
 * from a single admin prompt. Returns 202 with the run id; progress streams
 * via /api/admin/app-pack/generate/stream?runId=... and status via
 * /api/admin/app-pack/generate/status?runId=...
 */
export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const groupGuard = await requireCapability('config:write', request);
  if (!groupGuard.ok) return groupGuard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Expected JSON body', 400);
  }
  if (!body || typeof body !== 'object') {
    return jsonError('Expected JSON body', 400);
  }

  const { prompt, packId, name, tenantSlug, mock, model } = body as {
    prompt?: string;
    packId?: string;
    name?: string;
    tenantSlug?: string;
    mock?: boolean;
    model?: string;
  };

  if (!prompt || !prompt.trim()) {
    return jsonError('Missing required field: prompt', 400);
  }
  if (prompt.length > 4000) {
    return jsonError('prompt too long (max 4000 chars)', 400);
  }

  const targetSlug = tenantSlug?.trim() || 'tokenizmyapp';

  // Resolve the target database server-side: prefer the tenant's provisioned
  // Neon database (Tenant.dbUrl) so the pack materializes in the tenant's own
  // app DB (the tenant app reads nav/pages from its own POSTGRES_URL). Tenants
  // without a separate DB — including the root "tokenizmyapp" scope — fall
  // back to this app's DB with rows scoped by tenant_slug.
  let resolvedDbUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? '';
  try {
    const db = createRawClient();
    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT db_url FROM tenants WHERE slug = $1 LIMIT 1;`,
      targetSlug,
    ) as { db_url: string | null }[];
    if (rows.length && rows[0].db_url) {
      resolvedDbUrl = rows[0].db_url;
      console.log(`[app-pack] Materializing pack for tenant "${targetSlug}" into its own DB`);
    }
    await db.$disconnect();
  } catch (err) {
    console.warn(
      `[app-pack] Tenant DB lookup failed for "${targetSlug}" — falling back to root DB:`,
      err,
    );
  }
  if (!resolvedDbUrl) {
    return jsonError('No database connection string configured', 500);
  }

  const input: AppPackGenerateInput = {
    prompt: prompt.trim(),
    packId: packId?.trim() || undefined,
    name: name?.trim() || undefined,
    tenantSlug: targetSlug,
    dbUrl: resolvedDbUrl,
    mock: mock === true,
    model: model?.trim() || undefined,
  };

  try {
    const run = await start(handleAppPackGenerate, [input]);
    // Wrap in the standard envelope ({ success: true, data }) so RTK Query
    // surfaces runId at response.data.runId — matches ApiEnvelope<{ runId }>.
    return jsonOk(
      {
        runId: run.runId,
        packId: input.packId ?? defaultPackId(input.prompt),
        status: 'accepted',
      },
      { status: 202 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(`Failed to start app pack generation: ${message}`, 500);
  }
}

/** Lightweight GET for route metadata checks (avoids edge 405s in some setups). */
export async function GET(): Promise<NextResponse> {
  return jsonOk({ ok: true, usage: 'POST with { prompt, tenantSlug?, mock?, packId?, name?, model? }' });
}
