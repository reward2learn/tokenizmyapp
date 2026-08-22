/**
 * POST /api/admin/tenants/[slug]/stripe-webhook-test
 *
 * Signs a snapshot customer.subscription.updated event with the project's
 * STRIPE_WEBHOOK_SECRET (read from Vercel env) and POSTs it to the live
 * *.vercel.app /api/webhooks/stripe endpoint. Returns pass/fail for Flight
 * Check and the Stripe wizard "Verify webhook" button.
 *
 * Body: { appId?: string; projectNameHint?: string; allowFactoryFallback?: boolean }
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import type { AppPackConfig } from '@/store/apis/tenant-api';
import { testStripeWebhookForProject } from '@/domain/billing/stripe-webhook-test-service';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  appId: z.string().trim().optional(),
  projectNameHint: z.string().trim().optional(),
  allowFactoryFallback: z.boolean().optional(),
});

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  let body: z.infer<typeof bodySchema> = {};
  try {
    body = bodySchema.parse(await request.json().catch(() => ({})));
  } catch (err) {
    return jsonError(
      err instanceof z.ZodError ? err.errors.map((e) => e.message).join('; ') : 'Invalid body',
      400,
    );
  }

  const db = createRawClient();
  try {
    await ensureTenantsTable(db);
    const rows = (await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
      slug,
    )) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const { projectId, projectName } = await resolveProject(rows[0], slug, body.appId ?? null);
    const projectNameHint =
      body.projectNameHint?.trim()
      || projectName
      || (body.appId ? `${slug}-${body.appId}` : slug);

    const result = await testStripeWebhookForProject({
      projectId,
      projectNameHint,
      allowFactoryFallback: body.allowFactoryFallback,
    });

    return jsonOk(result);
  } catch (err) {
    return jsonError(
      `Stripe webhook test failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}
