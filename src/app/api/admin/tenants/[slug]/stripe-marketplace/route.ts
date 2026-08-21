/**
 * GET  /api/admin/tenants/[slug]/stripe-marketplace
 *      → Marketplace install status for the tenant project (or ?appId= suite app)
 *
 * POST /api/admin/tenants/[slug]/stripe-marketplace
 *      → Returns install / connect URLs (browser OAuth). Body: { appId?: string }
 *
 * Marketplace Install Stripe is connectable (browser OAuth / claim). We never
 * paste secrets from the Marketplace flow — Vercel provisions env vars onto
 * the project. Manual key push remains available via /stripe-env.
 */

import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import type { AppPackConfig } from '@/store/apis/tenant-api';
import {
  buildStripeMarketplaceInstallUrl,
  buildProjectIntegrationsUrl,
  getStripeMarketplaceStatus,
} from '@/domain/tenant/vercel-stripe-marketplace-service';

export const dynamic = 'force-dynamic';

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

async function resolveProject(
  tenant: Record<string, unknown>,
  slug: string,
  appId: string | null,
): Promise<{ projectId: string | null; projectName: string | null }> {
  const pack = getAppPack(tenant);
  if (appId) {
    const app = pack?.apps?.find((a) => a.appId === appId);
    return {
      projectId: app?.vercelProjectId ?? null,
      projectName: app ? `${slug}-${app.appId}` : null,
    };
  }
  return {
    projectId: (tenant.vercel_project_id as string | null) ?? null,
    projectName: slug,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const appId = new URL(request.url).searchParams.get('appId');
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
      slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const { projectId, projectName } = await resolveProject(rows[0], slug, appId);
    const status = await getStripeMarketplaceStatus({ projectId, projectName });
    return jsonOk(status);
  } catch (err) {
    return jsonError(
      `Stripe Marketplace status failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  let appId: string | null = null;
  try {
    const body = await request.json().catch(() => ({})) as { appId?: string };
    appId = body.appId?.trim() || null;
  } catch {
    /* empty body ok */
  }

  try {
    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
      slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const { projectId, projectName } = await resolveProject(rows[0], slug, appId);
    const status = await getStripeMarketplaceStatus({ projectId, projectName });

    // Stripe is connectable — CLI/API cannot finish OAuth. Return URLs for the admin.
    return jsonOk({
      ...status,
      installUrl: buildStripeMarketplaceInstallUrl(),
      projectIntegrationsUrl:
        status.projectIntegrationsUrl
        ?? (projectName || projectId
          ? buildProjectIntegrationsUrl(projectName || projectId!)
          : null),
      instructions: [
        '1. Open Install URL → Install New Stripe Sandbox or Import Existing Stripe Account.',
        '2. Open Project Integrations URL → Connect this Vercel project to the Stripe installation.',
        '3. Click Refresh Status here — STRIPE_SECRET_KEY + NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should appear.',
        '4. Optionally push STRIPE_WEBHOOK_SECRET via manual key push for /api/webhooks/stripe.',
      ],
    });
  } catch (err) {
    return jsonError(
      `Stripe Marketplace install helper failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}
