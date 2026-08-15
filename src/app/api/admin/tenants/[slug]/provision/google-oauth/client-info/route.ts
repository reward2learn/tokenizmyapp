/**
 * Google OAuth Client Info — GET /api/admin/tenants/[slug]/provision/google-oauth/client-info
 *
 * Fetches the CURRENT OAuth client data (redirect URIs, display name) from Google
 * via the OAuth 2.0 API (oauth2.googleapis.com/v1/projects/{projectNumber}/oauthClients/{clientId}),
 * using the tenant's saved client (metadata.config.googleAuth) — falling back to the
 * factory's GOOGLE_CLIENT_* env vars only when the tenant has no saved client.
 *
 * When no service account is configured (no API access), returns the saved config's
 * redirect URIs with source: 'saved-config' and apiUnavailable: true.
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { createClient } from '@/lib/db';
import { fetchGoogleOAuthClientInfo } from '@/domain/tenant/google-cloud-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  try {
    const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
    const tenant = await db.tenant.findUnique({ where: { slug }, select: { metadata: true } });

    const savedGoogle = (tenant?.metadata as { config?: { googleAuth?: Record<string, unknown> } } | null)?.config?.googleAuth;
    const clientId = savedGoogle?.clientId ? String(savedGoogle.clientId) : process.env.GOOGLE_CLIENT_ID;
    const projectId = savedGoogle?.projectId ? String(savedGoogle.projectId) : process.env.GOOGLE_PROJECT_ID || '';

    if (!clientId || !projectId) {
      return jsonError('No Google OAuth client configured for this tenant', 404);
    }

    // Try the Google API first — real current data from GCP
    const info = await fetchGoogleOAuthClientInfo(clientId, projectId);
    if (info) {
      return jsonOk({ success: true, slug, ...info });
    }

    // No API access — return the saved config's redirect URIs as the best-known state
    return jsonOk({
      success: true,
      slug,
      clientId,
      projectId,
      redirectUris: Array.isArray(savedGoogle?.redirectUris) ? (savedGoogle.redirectUris as string[]) : [],
      source: 'saved-config',
      apiUnavailable: true,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[provision:google-oauth:client-info] Failed for ${slug}:`, message);
    return jsonError(`Failed to fetch Google OAuth client info: ${message}`, 500);
  }
}
