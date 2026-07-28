/**
 * Custom Domain API — GET / POST /api/admin/tenants/[slug]/domain
 *
 * GET  — Fetch domains from Vercel for the tenant's project
 * POST — Set a custom domain for the tenant project, update appUrl in DB
 *
 * Uses the vercel-deploy-service which handles OAuth token resolution,
 * project lookup, and domain management via the Vercel API.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getVercelDomains, setCustomDomain } from '@/domain/tenant/vercel-deploy-service';

export const dynamic = 'force-dynamic';

const setDomainSchema = z.object({
  domain: z.string().min(3).max(253).regex(
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
    'Invalid domain name. Must be a fully qualified domain name (e.g. app.example.com).',
  ),
  updateAppUrl: z.boolean().optional().default(true),
});

// ── GET /api/admin/tenants/[slug]/domain ──────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient() as any;

  try {
    // Fetch tenant to get vercelProjectId
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];

    if (rows.length === 0) {
      return jsonError(`Tenant "${slug}" not found`, 404);
    }

    const tenant = rows[0] as Record<string, unknown>;
    const projectId = tenant.vercel_project_id as string | null;

    if (!projectId) {
      return jsonOk({
        domains: [],
        projectId: null,
        note: 'No Vercel project deployed yet. Deploy the tenant first.',
      });
    }

    // Fetch domains from Vercel
    const domains = await getVercelDomains(projectId);

    return jsonOk({
      domains,
      projectId,
      appUrl: tenant.app_url as string | null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[domain] GET /${slug} error:`, message);
    return jsonError(`Failed to fetch domains: ${message}`, 500);
  }
}

// ── POST /api/admin/tenants/[slug]/domain ─────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = setDomainSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      400,
    );
  }

  const db = createRawClient() as any;

  try {
    // Fetch tenant to get vercelProjectId
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];

    if (rows.length === 0) {
      return jsonError(`Tenant "${slug}" not found`, 404);
    }

    const tenant = rows[0] as Record<string, unknown>;
    const projectId = tenant.vercel_project_id as string | null;

    if (!projectId) {
      return jsonError('No Vercel project deployed yet. Deploy the tenant first.', 400);
    }

    const { domain, updateAppUrl } = parsed.data;

    // Add domain to Vercel project
    const result = await setCustomDomain(projectId, domain);

    // Optionally update the tenant's appUrl in DB
    if (updateAppUrl) {
      const customAppUrl = `https://${domain}`;
      await db.$executeRawUnsafe(
        `UPDATE tenants SET app_url = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
        customAppUrl,
        slug,
      );
      console.log(`[domain] Updated appUrl for ${slug} to ${customAppUrl}`);
    }

    // Fetch updated domain list
    const updatedDomains = await getVercelDomains(projectId);

    return jsonOk({
      domain,
      verified: result.verified,
      projectId,
      domains: updatedDomains,
      appUrl: updateAppUrl ? `https://${domain}` : (tenant.app_url as string | null),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[domain] POST /${slug} error:`, message);
    return jsonError(`Failed to set domain: ${message}`, 500);
  }
}
