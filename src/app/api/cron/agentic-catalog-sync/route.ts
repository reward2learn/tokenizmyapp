/**
 * Nightly agentic catalog sync for tenants with agenticCommerce.enabled.
 *
 * GET /api/cron/agentic-catalog-sync
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { syncAgenticCatalogForTenant } from '@/domain/billing/agentic-catalog-service';
import type { AgenticCommerceConfig } from '@/lib/billing/agentic-commerce-types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const db = createRawClient();
  await ensureTenantsTable(db);

  const rows = (await db.$queryRawUnsafe(
    `SELECT slug, metadata FROM tenants WHERE metadata IS NOT NULL;`,
  )) as Record<string, unknown>[];

  const synced: string[] = [];
  const skipped: string[] = [];
  const failed: { slug: string; error: string }[] = [];

  for (const row of rows) {
    const slug = String(row.slug);
    const meta = (row.metadata ?? {}) as Record<string, unknown>;
    const cfg = (meta.config ?? {}) as Record<string, unknown>;
    const stripe = (cfg.stripe ?? {}) as Record<string, unknown>;
    const agentic = (stripe.agenticCommerce ?? {}) as AgenticCommerceConfig;
    if (!agentic.enabled) {
      skipped.push(slug);
      continue;
    }

    try {
      await syncAgenticCatalogForTenant(slug, db);
      synced.push(slug);
    } catch (err) {
      failed.push({ slug, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({
    success: true,
    data: { synced, skipped: skipped.length, failed },
  });
}
