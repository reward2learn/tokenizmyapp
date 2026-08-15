/**
 * Provision Tenant API — POST /api/admin/tenants/[slug]/provision
 *
 * Full tenant provisioning pipeline that orchestrates:
 *   1. Google Cloud OAuth credential creation
 *      - Suite (metadata.config.appPack): one client per app via provisionGoogleOAuthPerApp
 *      - Single: tenant-level singleton via provisionGoogleOAuth + setGoogleOAuthConfig
 *   2. Neon Postgres database branch provisioning
 *   3. (Optional) Vercel deployment trigger
 *
 * This is the server-side equivalent of the CLI `bun run provision:tenant`.
 * Each step can be individually toggled via the request body.
 *
 * Response includes all credentials, connection strings, and env vars
 * needed to configure the tenant's Vercel project.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { provisionTenantDatabase } from '@/domain/tenant/neon-provision-service';
import { formatNeonConnectionStrings } from '@/domain/tenant/neon-output-formatter';
import {
  provisionGoogleOAuth,
  provisionGoogleOAuthPerApp,
  saveClientSecretJson,
} from '@/domain/tenant/google-cloud-service';
import { setGoogleOAuthConfig } from '@/lib/auth/google-oauth';
import { DEFAULT_RELAY_REDIRECT_URI } from '@/lib/auth/google-relay';
import { inngest } from '@/lib/inngest';
import type { AppPackConfig } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min timeout for provisioning

const provisionSchema = z.object({
  // Which steps to run
  google: z.boolean().optional().default(true),
  neon: z.boolean().optional().default(true),
  vercel: z.boolean().optional().default(false),

  // Google OAuth config
  email: z.string().email().optional(),
  /** Single-tenant only — ignored in suite mode (use perAppRedirectUris). */
  redirectUris: z.array(z.string().url()).optional(),
  /**
   * Suite mode: custom domains / redirect URIs keyed by appId.
   * Apps omitted from the map fall back to defaultRedirectUris(slug-appId).
   */
  perAppRedirectUris: z.record(z.string().min(1), z.array(z.string().url()).min(1)).optional(),
  logoPath: z.string().optional(),

  // Template config
  template: z.string().max(50).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

type StepResult = {
  name: string;
  status: 'success' | 'skipped' | 'error';
  data?: Record<string, unknown>;
  error?: string;
};

/** Suite mode lives under tenants.metadata.config.appPack. */
function getAppPack(tenant: { metadata?: unknown }): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

/** Default redirect URIs for a Vercel app slug (parent or `parent-appId`). */
function defaultRedirectUris(appSlug: string): string[] {
  return [
    `https://${appSlug}.vercel.app`,
    `https://${appSlug}.vercel.app/api/auth/callback/google`,
  ];
}

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

  const parsed = provisionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(`Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`, 400);
  }

  const steps: StepResult[] = [];
  const envVars: Record<string, string> = {};

  // Relay env vars — included for every new tenant/app so Google sign-in works
  // without registering per-app redirect URIs (Google removed that API).
  if (process.env.GOOGLE_RELAY_SECRET) {
    envVars.GOOGLE_RELAY_SECRET = process.env.GOOGLE_RELAY_SECRET;
    envVars.GOOGLE_RELAY_REDIRECT_URI =
      process.env.GOOGLE_RELAY_REDIRECT_URI || DEFAULT_RELAY_REDIRECT_URI;
  }

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });

  try {
    await ensureTenantsTable(db);

    // Ensure tenant exists
    let tenant = await db.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      return jsonError(`Tenant "${slug}" not found. Create it first via POST /api/admin/tenants`, 404);
    }

    // ════════════════════════════════════════════════════════
    // STEP 1: Google Cloud OAuth
    // Suite: one OAuth client + google_oauth_config row per app
    // Single: existing tenant-level singleton (id='default')
    // ════════════════════════════════════════════════════════
    if (parsed.data.google) {
      try {
        const appPack = getAppPack(tenant);

        if (appPack && appPack.apps.length > 0) {
          // ── Suite mode: provision OAuth per app ───────────
          const perAppResults: Array<Record<string, unknown>> = [];
          const perAppErrors: Array<{ appId: string; error: string }> = [];

          for (const app of appPack.apps) {
            try {
              const appSlug = `${slug}-${app.appId}`;
              // Prefer explicit per-app URIs (custom domains); never reuse
              // flat redirectUris — that list cannot describe N hosts.
              const redirectUris =
                parsed.data.perAppRedirectUris?.[app.appId] ??
                defaultRedirectUris(appSlug);

              const result = await provisionGoogleOAuthPerApp(
                slug,
                app.appId,
                app.name,
                redirectUris,
              );

              perAppResults.push({
                appId: result.appId,
                configId: result.configId,
                stored: result.stored,
                clientId: result.oauth.clientId,
                projectId: result.oauth.projectId,
                strategy: result.oauth.strategy,
                redirectUris,
              });

              // Namespaced env vars so deploy can wire each app separately
              envVars[`GOOGLE_CLIENT_ID__${app.appId}`] = result.oauth.clientId;
              envVars[`GOOGLE_CLIENT_SECRET__${app.appId}`] = result.oauth.clientSecret;
              envVars[`GOOGLE_PROJECT_ID__${app.appId}`] = result.oauth.projectId;
            } catch (appErr) {
              const appErrMsg = appErr instanceof Error ? appErr.message : String(appErr);
              perAppErrors.push({ appId: app.appId, error: appErrMsg });
              console.error(
                `[provision] Google OAuth failed for suite app ${slug}/${app.appId}:`,
                appErrMsg,
              );
            }
          }

          const suiteOk = perAppErrors.length === 0 && perAppResults.length > 0;
          steps.push({
            name: 'google-oauth',
            status: suiteOk ? 'success' : 'error',
            data: {
              mode: 'suite',
              apps: perAppResults,
              ...(perAppErrors.length > 0 ? { errors: perAppErrors } : {}),
            },
            ...(perAppErrors.length > 0
              ? {
                  error: `Failed for ${perAppErrors.length}/${appPack.apps.length} apps: ${perAppErrors
                    .map((e) => e.appId)
                    .join(', ')}`,
                }
              : {}),
          });
        } else {
          // ── Single-tenant path (unchanged) ────────────────
          const oauthResult = await provisionGoogleOAuth({
            slug,
            displayName: tenant.displayName || slug,
            redirectUris: parsed.data.redirectUris || defaultRedirectUris(slug),
            adminEmail: parsed.data.email || guard.session.email || 'reward2learn@gmail.com',
            logoPath: parsed.data.logoPath,
          });

          // Store credentials in DB
          await setGoogleOAuthConfig({
            clientId: oauthResult.clientId,
            clientSecret: oauthResult.clientSecret,
            projectId: oauthResult.projectId,
            authUri: oauthResult.authUri,
            tokenUri: oauthResult.tokenUri,
          });

          // Save client_secret JSON
          await saveClientSecretJson(oauthResult);

          envVars.GOOGLE_CLIENT_ID = oauthResult.clientId;
          envVars.GOOGLE_CLIENT_SECRET = oauthResult.clientSecret;
          envVars.GOOGLE_PROJECT_ID = oauthResult.projectId;
          envVars.GOOGLE_AUTH_URI = oauthResult.authUri;
          envVars.GOOGLE_TOKEN_URI = oauthResult.tokenUri;

          steps.push({
            name: 'google-oauth',
            status: 'success',
            data: {
              mode: 'single',
              clientId: oauthResult.clientId,
              projectId: oauthResult.projectId,
              strategy: oauthResult.strategy,
            },
          });
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        steps.push({ name: 'google-oauth', status: 'error', error: errMsg });
        console.error(`[provision] Google OAuth failed for ${slug}:`, errMsg);
      }
    } else {
      steps.push({ name: 'google-oauth', status: 'skipped' });
    }

    // ════════════════════════════════════════════════════════
    // STEP 2: Neon Postgres Database
    // ════════════════════════════════════════════════════════
    if (parsed.data.neon) {
      try {
        const neonDb = await provisionTenantDatabase(slug);

        // Format connection strings
        const formatted = formatNeonConnectionStrings(neonDb, slug);
        Object.assign(envVars, formatted.envVars);

        // Update tenant record with DB URL
        await db.tenant.update({
          where: { slug },
          data: {
            dbUrl: neonDb.pooledUrl,
            updatedAt: new Date(),
          },
        });

        steps.push({
          name: 'neon-database',
          status: 'success',
          data: {
            branchId: neonDb.branchId,
            databaseName: neonDb.databaseName,
            envVarCount: Object.keys(formatted.envVars).length,
          },
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        steps.push({ name: 'neon-database', status: 'error', error: errMsg });
        console.error(`[provision] Neon DB failed for ${slug}:`, errMsg);
      }
    } else {
      steps.push({ name: 'neon-database', status: 'skipped' });
    }

    // ════════════════════════════════════════════════════════
    // STEP 3: Vercel Deploy
    // ════════════════════════════════════════════════════════
    if (parsed.data.vercel) {
      try {
        // Trigger deploy via Inngest (async)
        await inngest.send({
          name: 'tenant.created',
          data: {
            slug,
            displayName: tenant.displayName || slug,
            templateId: parsed.data.template || tenant.template || 'default',
            primaryColor: parsed.data.primaryColor || tenant.primaryColor || '#eb3d28',
            secondaryColor: parsed.data.secondaryColor || tenant.secondaryColor || '#0af9fe',
            metadata: {
              envVars: sanitizeForLogging(envVars),
              provisionedBy: 'api',
              provisionedAt: new Date().toISOString(),
            } as Record<string, unknown>,
          },
        });

        // Also set status to deploying
        await db.tenant.update({
          where: { slug },
          data: { status: 'deploying', updatedAt: new Date() },
        });

        steps.push({
          name: 'vercel-deploy',
          status: 'success',
          data: {
            triggered: true,
            note: 'Deployment triggered via Inngest. Check /api/admin/tenants for status.',
          },
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        steps.push({ name: 'vercel-deploy', status: 'error', error: errMsg });
      }
    } else {
      steps.push({ name: 'vercel-deploy', status: 'skipped' });
    }

    // Update tenant metadata with provision info
    await db.tenant.update({
      where: { slug },
      data: {
        metadata: {
          ...(tenant!.metadata as Record<string, unknown> || {}),
          provisionSteps: steps,
          lastProvisionedAt: new Date().toISOString(),
          provisioned: true,
        } as never,
      },
    });

    const allSuccess = steps.every((s) => s.status === 'success' || s.status === 'skipped');

    return jsonOk({
      success: allSuccess,
      slug,
      steps,
      envVars: sanitizeForLogging(envVars),
      summary: steps.map((s) => `${s.name}: ${s.status}`).join(', '),
      appUrl: `https://${slug}.vercel.app`,
      note: allSuccess
        ? 'Tenant fully provisioned. Set the env vars above in your Vercel project and deploy.'
        : 'Some steps failed — check the steps array for details.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Provisioning failed';
    console.error(`[provision] Fatal error for ${slug}:`, message);
    return jsonError(message, 500);
  }
}

/** Mask secrets in env vars for safe logging. */
function sanitizeForLogging(vars: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(vars)) {
    if (/secret|password|token|key/i.test(key) && value.length > 8) {
      sanitized[key] = `${value.slice(0, 4)}...${value.slice(-4)}`;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
