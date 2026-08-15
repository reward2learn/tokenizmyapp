/**
 * Google OAuth Provisioning — POST /api/admin/tenants/[slug]/provision/google-oauth
 *
 * Standalone endpoint to provision Google OAuth credentials for a tenant.
 * Creates a new OAuth 2.0 Web client via gcloud CLI or Google Cloud REST API.
 *
 * Body:
 *   { email?: string, redirectUris?: string[], logoPath?: string }
 *
 * Response:
 *   { success, clientId, clientSecret, projectId, clientSecretJson, strategy }
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { createClient } from '@/lib/db';
import { provisionGoogleOAuth, saveClientSecretJson, type ExistingOAuthConfig } from '@/domain/tenant/google-cloud-service';
import { setGoogleOAuthConfig } from '@/lib/auth/google-oauth';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const bodySchema = z.object({
  email: z.string().email().optional(),
  redirectUris: z.array(z.string().url()).optional(),
  logoPath: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    body = {};
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(`Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`, 400);
  }

  try {
    // Get tenant info for display name
    const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
    const tenant = await db.tenant.findUnique({ where: { slug }, select: { displayName: true, metadata: true } });

    // Prefer the tenant's already-saved Google OAuth client (metadata.config.googleAuth) —
    // never fall back to the factory's own GOOGLE_CLIENT_* env vars when the tenant has one.
    const savedGoogle = (tenant?.metadata as { config?: { googleAuth?: Record<string, unknown> } } | null)?.config?.googleAuth;
    const existingConfig: ExistingOAuthConfig | undefined =
      savedGoogle?.clientId && savedGoogle?.clientSecret
        ? {
            clientId: String(savedGoogle.clientId),
            clientSecret: String(savedGoogle.clientSecret),
            projectId: String(savedGoogle.projectId || ''),
            authUri: savedGoogle.authUri ? String(savedGoogle.authUri) : undefined,
            tokenUri: savedGoogle.tokenUri ? String(savedGoogle.tokenUri) : undefined,
            redirectUris: Array.isArray(savedGoogle.redirectUris) ? (savedGoogle.redirectUris as string[]) : undefined,
          }
        : undefined;

    const oauthResult = await provisionGoogleOAuth({
      slug,
      displayName: tenant?.displayName || slug,
      redirectUris: parsed.data.redirectUris || [
        `https://${slug}.vercel.app`,
        `https://${slug}.vercel.app/api/auth/callback/google`,
      ],
          adminEmail: parsed.data.email || guard.session.email || 'reward2learn@gmail.com',
      logoPath: parsed.data.logoPath,
    }, existingConfig);

    // Persist to DB (encrypted) ONLY when we provisioned NEW credentials —
    // never clobber the tenant's saved client with env-fallback values.
    if (oauthResult.strategy !== 'pre-existing') {
      await setGoogleOAuthConfig({
        clientId: oauthResult.clientId,
        clientSecret: oauthResult.clientSecret,
        projectId: oauthResult.projectId,
        authUri: oauthResult.authUri,
        tokenUri: oauthResult.tokenUri,
      });
    } else {
      console.log(`[provision:google-oauth] Tenant ${slug} already has a saved OAuth client — kept ${oauthResult.clientId} (strategy: pre-existing, apiUpdated: ${oauthResult.apiUpdated ?? false})`);
    }

    // Save JSON file
    const savedPath = await saveClientSecretJson(oauthResult);

    return jsonOk({
      success: true,
      slug,
      clientId: oauthResult.clientId,
      clientSecret: oauthResult.clientSecret,
      projectId: oauthResult.projectId,
      projectName: oauthResult.projectName,
      strategy: oauthResult.strategy,
      apiUpdated: oauthResult.apiUpdated ?? false,
      clientSecretJsonPath: savedPath,
      redirectUris: oauthResult.redirectUris,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[provision:google-oauth] Failed for ${slug}:`, message);
    return jsonError(`Google OAuth provisioning failed: ${message}`, 500);
  }
}
