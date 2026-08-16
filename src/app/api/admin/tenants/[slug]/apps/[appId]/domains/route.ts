/**
 * Per-App Custom Domain API — mirrors /api/admin/tenants/[slug]/domain, but
 * scoped to a single suite app's own Vercel project (app.vercelProjectId)
 * instead of the tenant's project.
 *
 * GET  /api/admin/tenants/[slug]/apps/[appId]/domains
 * POST /api/admin/tenants/[slug]/apps/[appId]/domains
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { requireFeatureForTenant } from '@/domain/billing/entitlement-service';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  getVercelDomains,
  setCustomDomain,
  getVercelProject,
  renameVercelProject,
} from '@/domain/tenant/vercel-deploy-service';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';

const setDomainSchema = z.object({
  domain: z.string().min(3).max(253).regex(
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
    'Invalid domain name. Must be a fully qualified domain name (e.g. app.example.com or my-project.vercel.app).',
  ),
  updateAppUrl: z.boolean().optional().default(true),
});

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

async function saveAppPack(db: ReturnType<typeof createRawClient>, slug: string, appPack: AppPackConfig): Promise<void> {
  await db.$executeRawUnsafe(
    `UPDATE tenants SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{config,appPack}', $1::jsonb), updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    JSON.stringify(appPack),
    slug,
  );
}

function vercelAppUrl(projectName: string): string {
  return `https://${projectName}.vercel.app`;
}

async function findApp(
  db: ReturnType<typeof createRawClient>,
  slug: string,
  appId: string,
): Promise<{ appPack: AppPackConfig; idx: number; app: SuiteAppInstance } | { error: NextResponse }> {
  const rows = await db.$queryRawUnsafe(
    `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
  ) as Record<string, unknown>[];
  if (rows.length === 0) return { error: jsonError('Tenant not found', 404) };

  const appPack = getAppPack(rows[0]);
  if (!appPack) return { error: jsonError('Tenant is not in suite mode', 400) };

  const idx = appPack.apps.findIndex((a) => a.appId === appId);
  if (idx === -1) return { error: jsonError(`App "${appId}" not found in suite`, 404) };

  return { appPack, idx, app: appPack.apps[idx] };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; appId: string }> },
): Promise<Response> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug, appId } = await params;
  const db = createRawClient();

  try {
    const found = await findApp(db, slug, appId);
    if ('error' in found) return found.error;
    const { app } = found;
    const projectId = app.vercelProjectId;

    let domains: { name: string; verified: boolean; createdAt: string }[] = [];
    let projectInfo: { name: string; id: string; updatedAt: string } | null = null;
    if (projectId) {
      try { domains = await getVercelDomains(projectId); } catch (err) {
        console.warn(`[app-domain] Could not fetch Vercel domains for ${projectId}:`, err);
      }
      try { projectInfo = await getVercelProject(projectId); } catch (err) {
        console.warn(`[app-domain] Could not fetch Vercel project info for ${projectId}:`, err);
      }
    }

    return jsonOk({
      domains,
      projectId,
      projectInfo,
      autoVercelUrl: projectInfo ? vercelAppUrl(projectInfo.name) : null,
      appUrl: app.appUrl,
      note: projectId ? null : 'This app has not been deployed yet. Deploy it first.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(`Failed to fetch app domain info: ${message}`, 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; appId: string }> },
): Promise<Response> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug, appId } = await params;

  // Attaching a domain is a paid capability. Reading existing domains is not
  // gated — a downgraded tenant must still be able to see what it has.
  const entitled = await requireFeatureForTenant(slug, 'custom-domains');
  if (!entitled.ok) return entitled.response!;

  let body: unknown;
  try { body = await request.json(); } catch {
    return jsonError('Invalid JSON body', 400);
  }
  const parsed = setDomainSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(`Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`, 400);
  }

  const db = createRawClient();

  try {
    const found = await findApp(db, slug, appId);
    if ('error' in found) return found.error;
    const { appPack, idx, app } = found;
    const projectId = app.vercelProjectId;

    if (!projectId) {
      return jsonError('This app has not been deployed yet. Deploy it first before configuring domains.', 400);
    }

    const { domain, updateAppUrl } = parsed.data;
    const isVercelSubdomain = domain.endsWith('.vercel.app');

    if (isVercelSubdomain) {
      const subdomainName = domain.replace(/\.vercel\.app$/i, '');
      if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(subdomainName)) {
        return jsonError(`Invalid subdomain name "${subdomainName}". Use only letters, numbers, and hyphens.`, 400);
      }

      let projectName: string;
      try {
        const renameResult = await renameVercelProject(projectId, subdomainName);
        projectName = renameResult.name;
      } catch (renameErr) {
        const msg = renameErr instanceof Error ? renameErr.message : String(renameErr);
        return jsonError(`Failed to rename Vercel project: ${msg}`, 500);
      }

      const newVercelUrl = vercelAppUrl(projectName);
      if (updateAppUrl) {
        appPack.apps[idx] = { ...app, appUrl: newVercelUrl };
        await saveAppPack(db, slug, appPack);
      }

      const updatedDomains = await getVercelDomains(projectId);
      let projectInfo: { name: string; id: string; updatedAt: string } | null = null;
      try { projectInfo = await getVercelProject(projectId); } catch { /* best-effort */ }

      return jsonOk({
        domain, verified: true, projectId, projectName,
        autoVercelUrl: newVercelUrl, domains: updatedDomains, projectInfo,
        appUrl: updateAppUrl ? newVercelUrl : app.appUrl,
        renamed: true,
      });
    }

    let result: { verified: boolean };
    try {
      result = await setCustomDomain(projectId, domain);
    } catch (domainErr) {
      const msg = domainErr instanceof Error ? domainErr.message : String(domainErr);
      return jsonError(`Failed to add domain: ${msg}`, 500);
    }

    if (updateAppUrl) {
      appPack.apps[idx] = { ...app, appUrl: `https://${domain}` };
      await saveAppPack(db, slug, appPack);
    }

    const updatedDomains = await getVercelDomains(projectId);

    return jsonOk({
      domain,
      verified: result.verified,
      projectId,
      domains: updatedDomains,
      appUrl: updateAppUrl ? `https://${domain}` : app.appUrl,
      renamed: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(`Failed to set app domain: ${message}`, 500);
  }
}
