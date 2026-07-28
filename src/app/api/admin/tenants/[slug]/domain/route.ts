/**
 * Custom Domain API — GET / POST /api/admin/tenants/[slug]/domain
 *
 * GET  — Fetch domains AND Vercel project info (name, auto-generated URL)
 * POST — Set a custom domain OR rename the Vercel project (for .vercel.app subdomains)
 *
 * Key distinction:
 *   - Custom domains (e.g. app.example.com) → POST /v9/projects/{id}/domains
 *   - .vercel.app subdomains → PATCH /v10/projects/{id} (rename project)
 *
 * The .vercel.app subdomain is auto-generated from the project name and CANNOT
 * be added/removed via the domains endpoint. To change it, rename the project.
 *
 * Uses the vercel-deploy-service which handles OAuth token resolution,
 * project lookup, domain management, and project rename via the Vercel API.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  getVercelDomains,
  setCustomDomain,
  getVercelProject,
  renameVercelProject,
} from '@/domain/tenant/vercel-deploy-service';

export const dynamic = 'force-dynamic';

/**
 * Domain validation regex.
 * Accepts standard FQDNs like "app.example.com" and
 * Vercel subdomains like "my-project.vercel.app".
 * The TLD portion `[a-z]{2,}` already accepts "app" (3 chars).
 */
const setDomainSchema = z.object({
  domain: z.string().min(3).max(253).regex(
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
    'Invalid domain name. Must be a fully qualified domain name (e.g. app.example.com ' +
    'or my-project.vercel.app).',
  ),
  updateAppUrl: z.boolean().optional().default(true),
});

// ── Helpers ────────────────────────────────────────────────

/**
 * Build the auto-generated .vercel.app URL from a project name.
 */
function vercelAppUrl(projectName: string): string {
  return `https://${projectName}.vercel.app`;
}

/**
 * Fetch the tenant row and projectId. Returns null responses for missing cases.
 */
async function fetchTenantAndProject(
  slug: string,
  db: any,
): Promise<{ tenant: Record<string, unknown> | null; projectId: string | null; error?: NextResponse }> {
  const rows = await db.$queryRawUnsafe(
    `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
  ) as Record<string, unknown>[];

  if (rows.length === 0) {
    return { tenant: null, projectId: null, error: jsonError(`Tenant "${slug}" not found`, 404) };
  }

  const tenant = rows[0] as Record<string, unknown>;
  const projectId = tenant.vercel_project_id as string | null;

  return { tenant, projectId };
}

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
    const { tenant, projectId, error } = await fetchTenantAndProject(slug, db);
    if (error || !tenant) return error!;

    // Fetch domains from Vercel (empty list if no projectId or project deleted)
    let domains: { name: string; verified: boolean; createdAt: string }[] = [];
    if (projectId) {
      try {
        domains = await getVercelDomains(projectId);
      } catch (err) {
        console.warn(`[domain] Could not fetch Vercel domains for ${projectId}:`, err);
      }
    }

    // Fetch Vercel project info to show current project name and auto-generated URL
    let projectInfo: { name: string; id: string; updatedAt: string } | null = null;
    if (projectId) {
      try {
        projectInfo = await getVercelProject(projectId);
      } catch (err) {
        console.warn(`[domain] Could not fetch Vercel project info for ${projectId}:`, err);
      }
    }

    return jsonOk({
      domains,
      projectId,
      projectInfo,
      autoVercelUrl: projectInfo ? vercelAppUrl(projectInfo.name) : null,
      appUrl: tenant.app_url as string | null,
      note: projectId
        ? null
        : 'No Vercel project deployed yet. Deploy the tenant first.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[domain] GET /${slug} error:`, message);
    return jsonError(`Failed to fetch domain info: ${message}`, 500);
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
    const { tenant, projectId, error } = await fetchTenantAndProject(slug, db);
    if (error || !tenant) return error!;

    if (!projectId) {
      return jsonError(
        'No Vercel project deployed yet. Deploy the tenant first before configuring domains.',
        400,
      );
    }

    const { domain, updateAppUrl } = parsed.data;
    const isVercelSubdomain = domain.endsWith('.vercel.app');

    if (isVercelSubdomain) {
      // ── .vercel.app subdomain → rename the project ──────────
      // Extract the desired subdomain name (e.g. "my-new-flax" from "my-new-flax.vercel.app")
      const subdomainName = domain.replace(/\.vercel\.app$/i, '');

      if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(subdomainName)) {
        return jsonError(
          `Invalid subdomain name "${subdomainName}". Use only letters, numbers, and hyphens.`,
          400,
        );
      }

      let projectName: string;
      try {
        const renameResult = await renameVercelProject(projectId, subdomainName);
        projectName = renameResult.name;
      } catch (renameErr) {
        const msg = renameErr instanceof Error ? renameErr.message : String(renameErr);
        console.error(`[domain] Rename failed for ${slug} → ${subdomainName}:`, msg);
        return jsonError(`Failed to rename Vercel project: ${msg}`, 500);
      }

      const newVercelUrl = vercelAppUrl(projectName);

      // Update tenant record with new app URL
      if (updateAppUrl) {
        await db.$executeRawUnsafe(
          `UPDATE tenants SET app_url = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
          newVercelUrl,
          slug,
        );
        console.log(`[domain] Updated appUrl for ${slug} to ${newVercelUrl} (project rename)`);
      }

      // Fetch updated domain list
      const updatedDomains = await getVercelDomains(projectId);
      let projectInfo: { name: string; id: string; updatedAt: string } | null = null;
      try {
        projectInfo = await getVercelProject(projectId);
      } catch {}

      return jsonOk({
        domain,
        verified: true,
        projectId,
        projectName,
        autoVercelUrl: newVercelUrl,
        domains: updatedDomains,
        projectInfo,
        appUrl: updateAppUrl ? newVercelUrl : (tenant.app_url as string | null),
        renamed: true,
        note: `Project renamed to "${projectName}". The .vercel.app URL is now ${newVercelUrl}.`,
      });
    }

    // ── Custom domain (non-.vercel.app) → add via domains endpoint ──
    let result: { verified: boolean };
    try {
      result = await setCustomDomain(projectId, domain);
    } catch (domainErr) {
      const msg = domainErr instanceof Error ? domainErr.message : String(domainErr);
      console.error(`[domain] setCustomDomain failed for ${slug} → ${domain}:`, msg);
      return jsonError(`Failed to add domain: ${msg}`, 500);
    }

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
      renamed: false,
      note: result.verified
        ? `Domain "${domain}" verified and active.`
        : `Domain "${domain}" added. Configure DNS to point to Vercel for verification.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[domain] POST /${slug} error:`, message);
    return jsonError(`Failed to set domain: ${message}`, 500);
  }
}
