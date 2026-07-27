/**
 * POST /api/admin/tenants/[slug]/deploy
 *
 * Deploy (or re-deploy) a tenant to Vercel:
 * 1. Creates or finds the Vercel project (via ensureVercelProject)
 * 2. Syncs all environment variables from the tenant config
 * 3. Assigns the domain
 * 4. Triggers a production deployment
 *
 * Uses the vercel-deploy-service which handles OAuth token resolution,
 * project creation, env var syncing, and deployment triggering.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { deployTenant, ensureVercelProject } from '@/domain/tenant/vercel-deploy-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  let body: { template?: string; metadata?: Record<string, unknown> };
  try { body = await request.json(); } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const db = createRawClient() as any;

  try {
    // Fetch the tenant record from DB to get displayName
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];

    if (rows.length === 0) {
      return jsonError(`Tenant "${slug}" not found`, 404);
    }

    const tenant = rows[0] as Record<string, unknown>;

    // Step 1: Ensure Vercel project exists (creates if not found)
    const { projectId, created } = await ensureVercelProject({ slug });

    // Update tenant record with project ID if it was just created
    if (created) {
      await db.$executeRawUnsafe(
        `UPDATE tenants SET vercel_project_id = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
        projectId, slug,
      );
    }

    // Step 2: Deploy — sync env vars, assign domain, trigger deployment
    const result = await deployTenant({
      slug,
      displayName: (tenant.display_name as string) || slug,
      template: body.template || (tenant.template as string) || 'default',
      primaryColor: (tenant.primary_color as string) || '#eb3d28',
      secondaryColor: (tenant.secondary_color as string) || '#0af9fe',
      metadata: body.metadata || ((tenant.metadata as Record<string, unknown>) || {}),
    });

    // Step 3: Update tenant status to deploying
    await db.$executeRawUnsafe(
      `UPDATE tenants SET status = 'deploying', app_url = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
      result.appUrl, slug,
    );

    return jsonOk({
      deployed: true,
      projectId: result.projectId,
      projectCreated: created,
      projectName: result.projectName,
      appUrl: result.appUrl,
      envCount: result.envCount,
      vercelDashboardUrl: result.vercelDashboardUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[deploy] POST /${slug} error:`, message);
    return jsonError(`Deploy failed: ${message}`, 500);
  }
}
