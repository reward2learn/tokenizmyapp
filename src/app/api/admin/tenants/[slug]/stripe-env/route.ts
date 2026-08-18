/**
 * Stripe Env Push — "Save Changes" in the Organization & Billing wizard step
 *
 * POST /api/admin/tenants/[slug]/stripe-env
 *
 * Pushes the tenant's saved Stripe keys (metadata.config.stripe) to the
 * tenant's own Vercel project AND every suite app's project:
 *
 *   STRIPE_SECRET_KEY                  (encrypted, server-only)
 *   STRIPE_WEBHOOK_SECRET              (encrypted, server-only)
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (plain, inlined at build time)
 *
 * Because NEXT_PUBLIC_ vars are baked into the client bundle at build time,
 * the route also triggers the tenant's deploy hook (and each suite app's
 * deploy hook) when at least one key was written, so the publishable key
 * actually reaches the running app. See docs/STRIPE-SETUP.md — keys are
 * user-created and never committed; this route only moves them from the
 * tenant config into Vercel env.
 */

import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import type { AppPackConfig } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const tenant = rows[0];
    const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
    const cfg = (meta.config ?? {}) as Record<string, unknown>;
    const stripe = (cfg.stripe ?? {}) as Record<string, unknown>;
    const secretKey = String(stripe.secretKey ?? '').trim();
    const webhookSecret = String(stripe.webhookSecret ?? '').trim();
    const publishableKey = String(stripe.publishableKey ?? '').trim();

    if (!secretKey && !webhookSecret && !publishableKey) {
      return jsonError('No Stripe keys saved for this tenant — fill them in the Organization & Billing step first.', 400);
    }

    const { syncStripeEnvVars } = await import('@/domain/tenant/vercel-deploy-service');

    // Collect every Vercel project this tenant owns: its own project plus
    // each suite app's project.
    const projects: { id: string; name: string; deployHookUrl?: string }[] = [];
    const tenantProjectId = String(tenant.vercel_project_id ?? '');
    if (tenantProjectId) {
      projects.push({
        id: tenantProjectId,
        name: slug,
        deployHookUrl: String((cfg.hooks as Record<string, unknown> | undefined)?.deployHookUrl ?? '') || undefined,
      });
    }
    const appPack = getAppPack(tenant);
    for (const app of appPack?.apps ?? []) {
      if (app.vercelProjectId) {
        projects.push({
          id: app.vercelProjectId,
          name: `${slug}/${app.appId}`,
          deployHookUrl: app.deployHookUrl || undefined,
        });
      }
    }

    if (projects.length === 0) {
      return jsonError('Tenant has no Vercel project yet — deploy the app first, then save the Stripe keys.', 400);
    }

    let envCount = 0;
    const pushed: string[] = [];
    const redeployTriggered: string[] = [];
    for (const project of projects) {
      const count = await syncStripeEnvVars(project.id, { secretKey, webhookSecret, publishableKey });
      envCount += count;
      if (count > 0) pushed.push(project.name);
      // NEXT_PUBLIC_ vars are inlined at build time — redeploy so the
      // publishable key reaches the running client bundle.
      if (count > 0 && project.deployHookUrl) {
        try {
          await fetch(project.deployHookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
          redeployTriggered.push(project.name);
        } catch (err) {
          console.warn(`[stripe-env] Deploy hook failed for ${project.name}:`, err instanceof Error ? err.message : err);
        }
      }
    }

    return jsonOk({
      projects: projects.length,
      envCount,
      pushed,
      redeployTriggered,
      note: redeployTriggered.length === 0
        ? 'Keys pushed, but no deploy hook is set — redeploy the app so NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY reaches the client bundle.'
        : undefined,
    });
  } catch (err) {
    return jsonError('Failed to push Stripe env vars: ' + (err as Error).message, 500);
  }
}
