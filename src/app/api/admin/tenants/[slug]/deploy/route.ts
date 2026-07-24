/**
 * POST /api/admin/tenants/[slug]/deploy
 *
 * Deploy (or re-deploy) a tenant to Vercel:
 * 1. Creates or finds the Vercel project
 * 2. Syncs all environment variables from the tenant config
 * 3. Assigns the domain
 * 4. Triggers a production deployment
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { deployTenant, syncEnvVars, ensureVercelProject } from '@/domain/tenant/vercel-deploy-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient() as any;

  try {
    // Fetch the tenant record from DB
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];

    if (rows.length === 0) {
      return jsonError(`Tenant "${slug}" not found`, 404);
    }

    const tenant = rows[0];

    // Build the deploy input from tenant data
    const deployInput = {
      slug: tenant.slug as string,
      displayName: tenant.display_name as string,
      template: (tenant.template as string) || 'default',
      primaryColor: (tenant.primary_color as string) || '#eb3d28',
      secondaryColor: (tenant.secondary_color as string) || '#0af9fe',
      metadata: (tenant.metadata as Record<string, unknown>) || {},
    };

    // Run deployment
    const result = await deployTenant(deployInput);

    // Update tenant with Vercel project info
    await db.$executeRawUnsafe(
      `UPDATE tenants SET vercel_project_id = $1, app_url = $2, status = 'live', updated_at = CURRENT_TIMESTAMP WHERE slug = $3;`,
      result.projectId, result.appUrl, slug,
    );

    return jsonOk({
      deployed: true,
      projectId: result.projectId,
      projectName: result.projectName,
      appUrl: result.appUrl,
      vercelDashboardUrl: result.vercelDashboardUrl,
      envCount: result.envCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[deploy] POST /${slug} error:`, message);
    return jsonError(`Deploy failed: ${message}`, 500);
  }
}
