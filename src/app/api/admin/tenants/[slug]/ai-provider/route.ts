/**
 * Admin-scoped AI Provider config — POST /api/admin/tenants/[slug]/ai-provider
 *
 * Lets a platform admin set a tenant (or one suite app within it)'s AI
 * provider catalog, API keys, and active model directly from the tenant/app
 * edit modal in /admin, instead of requiring someone to sign into that
 * tenant's own deployment and use its self-service Config > AI Chat page.
 *
 * Writes land directly on the tenant/app's own dedicated database (see
 * tenant-db-resolver.ts) — the same secrets table the self-service page
 * reads — so the change takes effect on the tenant's live app immediately,
 * with no redeploy and no env var push required.
 */
import { z } from 'zod';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { createClient, createClientForUrl, type DbClient } from '@/lib/db';
import { resolveDedicatedTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import {
  findProviderInCatalog,
  getActiveProviderId,
  getActiveModel,
  setActiveProvider,
  resolveProviderKey,
  loadAiProvidersCatalog,
  saveAiProvidersCatalog,
  providerRequiresApiKey,
  isProviderConfigured,
  type AiProviderDef,
} from '@/lib/ai-providers';
import { aiProvidersCatalogSchema } from '@/lib/ai-provider-def-schema';
import { getSecretPlaintext, setSecret, deleteSecret } from '@/lib/secrets';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  appId: z.string().max(50).optional(),
  /** Optional full catalog replace (persisted as AI_PROVIDERS_CATALOG). */
  catalog: aiProvidersCatalogSchema.optional(),
  /** Provider to configure / activate — must exist in saved or incoming catalog. */
  providerId: z.string().min(1).max(64).optional(),
  apiKey: z.string().trim().optional(),
  /** Bulk key write by secret name (create/seed flows). */
  apiKeysBySecretName: z.record(z.string(), z.string()).optional(),
  model: z.string().trim().min(1).optional(),
  activate: z.boolean().optional(),
}).refine(
  (d) => d.catalog || d.providerId || d.apiKeysBySecretName,
  { message: 'Provide catalog, providerId, and/or apiKeysBySecretName' },
);

const deleteSchema = z.object({
  appId: z.string().max(50).optional(),
  providerId: z.string().min(1).max(64),
});

interface ProviderStatus {
  id: string;
  label: string;
  configured: boolean;
  requiresApiKey: boolean;
  source: 'db' | 'env' | null;
  docsUrl: string;
  keyPlaceholder: string;
  defaultModel: string | null;
}

async function buildStatus(db: DbClient): Promise<{
  providers: ProviderStatus[];
  catalog: AiProviderDef[];
  activeProviderId: string;
  activeModel: string | null;
}> {
  const catalog = await loadAiProvidersCatalog(db);
  const providers: ProviderStatus[] = await Promise.all(
    catalog.map(async (p) => {
      const dbKey = await getSecretPlaintext(p.keySecretName, db);
      const source: 'db' | 'env' | null = dbKey ? 'db' : process.env[p.keyEnvVar] ? 'env' : null;
      return {
        id: p.id,
        label: p.label,
        configured: isProviderConfigured(p, source),
        requiresApiKey: providerRequiresApiKey(p),
        source,
        docsUrl: p.docsUrl,
        keyPlaceholder: p.keyPlaceholder,
        defaultModel: p.defaultModel ?? null,
      };
    }),
  );
  const activeProviderId = await getActiveProviderId(db);
  const activeModel = await getActiveModel(activeProviderId, db);
  return { providers, catalog, activeProviderId, activeModel };
}

/** Resolve which database this tenant/app's AI provider config lives on —
 *  its own dedicated DB when it has one, the root DB otherwise (same
 *  fallback convention as admin/users, admin/groups). Returns the client
 *  plus whether it needs an explicit $disconnect(). */
async function resolveTenantDb(slug: string, appId: string | undefined): Promise<{ db: DbClient; dedicated: boolean }> {
  const dbUrl = await resolveDedicatedTenantDbUrl(slug, appId);
  if (dbUrl) return { db: createClientForUrl(dbUrl), dedicated: true };
  return { db: createClient(), dedicated: false };
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get('appId') ?? undefined;

  const { db, dedicated } = await resolveTenantDb(slug, appId);
  try {
    return jsonOk(await buildStatus(db));
  } catch (err) {
    console.error(`[admin/ai-provider] GET error for "${slug}":`, err);
    return jsonError('Failed to load AI provider status', 500);
  } finally {
    if (dedicated) await (db as unknown as { $disconnect: () => Promise<void> }).$disconnect();
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const { db, dedicated } = await resolveTenantDb(slug, parsed.data.appId);
  try {
    if (parsed.data.catalog) {
      await saveAiProvidersCatalog(parsed.data.catalog, db);
    }

    if (parsed.data.apiKeysBySecretName) {
      for (const [secretName, key] of Object.entries(parsed.data.apiKeysBySecretName)) {
        const trimmed = key?.trim();
        if (!trimmed) continue;
        await setSecret(secretName, trimmed, db);
      }
    }

    const catalog = await loadAiProvidersCatalog(db);

    if (parsed.data.providerId) {
      const provider = findProviderInCatalog(catalog, parsed.data.providerId);
      if (!provider) return jsonError('Unknown provider — not in catalog', 400);

      if (parsed.data.apiKey) {
        if (providerRequiresApiKey(provider) && parsed.data.apiKey.length < 10) {
          return jsonError('API key is too short', 400);
        }
        await setSecret(provider.keySecretName, parsed.data.apiKey, db);
      }

      if (parsed.data.activate) {
        const key = await resolveProviderKey(provider, db);
        if (!key && providerRequiresApiKey(provider)) {
          return jsonError(`${provider.label} has no API key configured — save one first`, 400);
        }
        await setActiveProvider(provider.id, parsed.data.model ?? null, db);
      }
    } else if (parsed.data.activate && parsed.data.model) {
      // Activate using current active provider when only model/catalog was sent
      const activeId = await getActiveProviderId(db);
      const provider = findProviderInCatalog(catalog, activeId);
      if (provider) {
        const key = await resolveProviderKey(provider, db);
        if (!key && providerRequiresApiKey(provider)) {
          return jsonError(`${provider.label} has no API key configured — save one first`, 400);
        }
        await setActiveProvider(provider.id, parsed.data.model, db);
      }
    }

    return jsonOk(await buildStatus(db));
  } catch (err) {
    console.error(`[admin/ai-provider] POST error for "${slug}":`, err);
    return jsonError(err instanceof Error ? err.message : 'Failed to save AI provider config', 500);
  } finally {
    if (dedicated) await (db as unknown as { $disconnect: () => Promise<void> }).$disconnect();
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const { db, dedicated } = await resolveTenantDb(slug, parsed.data.appId);
  try {
    const catalog = await loadAiProvidersCatalog(db);
    const provider = findProviderInCatalog(catalog, parsed.data.providerId);
    if (!provider) return jsonError('Unknown provider', 400);

    await deleteSecret(provider.keySecretName, db);
    return jsonOk(await buildStatus(db));
  } catch (err) {
    console.error(`[admin/ai-provider] DELETE error for "${slug}":`, err);
    return jsonError('Failed to remove AI provider key', 500);
  } finally {
    if (dedicated) await (db as unknown as { $disconnect: () => Promise<void> }).$disconnect();
  }
}
