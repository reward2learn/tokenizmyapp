/**
 * Google OAuth Sync — POST /api/admin/tenants/[slug]/provision/google-oauth/sync
 *
 * The consistency workflow: fetches the CURRENT OAuth client data from Google
 * (via service-account SDK or gcloud CLI — whichever is available), then:
 *   1. Merges the live GCP redirect URIs with the tenant's saved URIs and all
 *      suite apps' saved URIs (union — never removes registered URIs)
 *   2. When `patch: true` (or auto when editor rights exist): PATCHes the GCP
 *      client so any missing app URIs are actually registered
 *   3. Writes the merged redirect URIs BACK into the tenant config
 *      (metadata.config.googleAuth.redirectUris) and every app's
 *      config.googleAuth.redirectUris — fixing saved-config inconsistencies
 *
 * When no API access is available (no service account / gcloud), returns
 * apiUnavailable: true with the saved URIs and setup guidance.
 *
 * Body: { patch?: boolean }
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { createClient } from '@/lib/db';
import {
  fetchGoogleOAuthClientInfo,
  updateGoogleOAuthClientRedirectUris,
} from '@/domain/tenant/google-cloud-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

interface GoogleAuthCfg {
  clientId?: unknown;
  clientSecret?: unknown;
  projectId?: unknown;
  redirectUris?: unknown;
}

function readGoogleAuth(meta: Record<string, unknown> | null | undefined): GoogleAuthCfg | undefined {
  const cfg = (meta?.config ?? {}) as Record<string, unknown>;
  return (cfg.googleAuth as GoogleAuthCfg | undefined) ?? undefined;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  let body: { patch?: boolean } = {};
  try { body = await request.json(); } catch { /* empty body ok */ }

  try {
    const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
    const tenant = await db.tenant.findUnique({ where: { slug }, select: { metadata: true } });
    if (!tenant) return jsonError('Tenant not found', 404);

    const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
    const savedGoogle = readGoogleAuth(meta);
    const clientId = savedGoogle?.clientId ? String(savedGoogle.clientId) : process.env.GOOGLE_CLIENT_ID;
    const projectId = savedGoogle?.projectId ? String(savedGoogle.projectId) : process.env.GOOGLE_PROJECT_ID || '';

    if (!clientId || !projectId) {
      return jsonError('No Google OAuth client configured for this tenant', 404);
    }

    // Collect all URIs the platform knows about (tenant + every suite app)
    const cfg = (meta.config ?? {}) as Record<string, unknown>;
    const appPack = (cfg.appPack ?? {}) as { apps?: Array<{ appId?: string; config?: { googleAuth?: GoogleAuthCfg } }> };
    const knownUris = new Set<string>(asStringArray(savedGoogle?.redirectUris));
    for (const app of appPack.apps ?? []) {
      for (const u of asStringArray(app.config?.googleAuth?.redirectUris)) knownUris.add(u);
    }

    // 1. Fetch LIVE data from Google (SDK or CLI)
    const info = await fetchGoogleOAuthClientInfo(clientId, projectId);

    if (!info) {
      return jsonOk({
        success: true,
        slug,
        clientId,
        projectId,
        source: 'saved-config',
        apiUnavailable: true,
        savedUris: [...knownUris],
        guidance: 'No service account or gcloud auth available. To enable live GCP sync: create a service account in GCP project "' + projectId + '" with roles/oauthconfig.viewer (read) or roles/oauthconfig.editor (read + auto-register), then store its JSON in the secrets table as GOOGLE_CLOUD_SERVICE_ACCOUNT or set GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON on Vercel. Or run scripts/google-oauth-sync.mjs locally with --sa=path/to/sa.json.',
        fetchedAt: new Date().toISOString(),
      });
    }

    // 2. Merge: live GCP ∪ known URIs (never drop registered URIs)
    const mergedUris = [...new Set([...info.redirectUris, ...knownUris])];

    // 3. PATCH the GCP client when requested (or when app URIs are missing)
    const missingUris = [...knownUris].filter((u) => !info.redirectUris.includes(u));
    let patched = false;
    if (body.patch && missingUris.length > 0) {
      patched = await updateGoogleOAuthClientRedirectUris(clientId, projectId, mergedUris);
    }

    // 4. Write the merged URIs back into tenant + app configs (consistency fix)
    const metaOut = structuredClone(meta);
    const cfgOut = (metaOut.config ?? {}) as Record<string, unknown>;
    const googleOut = (cfgOut.googleAuth ?? {}) as Record<string, unknown>;
    googleOut.redirectUris = mergedUris;
    cfgOut.googleAuth = googleOut;
    metaOut.config = cfgOut;

    const appPackOut = (cfgOut.appPack ?? {}) as { apps?: Array<Record<string, unknown>> };
    let appsUpdated = 0;
    for (const app of appPackOut.apps ?? []) {
      const appCfg = (app.config ?? {}) as Record<string, unknown>;
      const appGoogle = (appCfg.googleAuth ?? {}) as Record<string, unknown>;
      if (appGoogle.clientId === clientId || !appGoogle.clientId) {
        appGoogle.redirectUris = mergedUris;
        appCfg.googleAuth = appGoogle;
        app.config = appCfg;
        appsUpdated += 1;
      }
    }

    await db.tenant.update({
      where: { slug },
      data: { metadata: metaOut as object },
    });

    return jsonOk({
      success: true,
      slug,
      clientId,
      projectId,
      source: info.source,
      fetchedUris: info.redirectUris,
      mergedUris,
      addedUris: mergedUris.filter((u) => !info.redirectUris.includes(u)),
      patched,
      appsUpdated,
      written: true,
      fetchedAt: info.fetchedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[provision:google-oauth:sync] Failed for ${slug}:`, message);
    return jsonError(`Google OAuth sync failed: ${message}`, 500);
  }
}
