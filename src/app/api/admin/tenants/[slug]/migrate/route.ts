/**
 * POST /api/admin/tenants/[slug]/migrate
 *
 * Body (optional JSON):
 *   { mode?: 'schema' | 'full', triggerRedeploy?: boolean }
 *
 * - mode=schema (default): tenant table/column migrations + security groups
 * - mode=full: schema + Neon URL refresh + Google OAuth sync + Vercel env
 *   repoint + billing identity + Stripe env/prices + agentic catalog cron twin
 *   + optional deploy-hook redeploys for existing configured instances
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  runFullTenantMigrate,
  runSchemaMigrate,
} from '@/domain/tenant/full-tenant-migrate-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  let body: { mode?: string; triggerRedeploy?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    /* empty body → schema mode */
  }

  const mode = body.mode === 'full' ? 'full' : 'schema';

  try {
    if (mode === 'full') {
      const result = await runFullTenantMigrate(slug, {
        triggerRedeploy: body.triggerRedeploy,
      });
      return jsonOk(result);
    }

    const db = createRawClient();
    const { results } = await runSchemaMigrate(slug, db);
    console.log(`[migrate] Schema migration complete for "${slug}":`, results);
    return jsonOk({
      migrated: true,
      mode: 'schema' as const,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Tenant not found') {
      return jsonError('Tenant not found', 404);
    }
    console.error(`[migrate] POST /${slug}/migrate error:`, err);
    return jsonError('Failed to migrate tenant: ' + message, 500);
  }
}
