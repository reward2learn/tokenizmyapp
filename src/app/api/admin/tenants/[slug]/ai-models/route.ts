/**
 * GET /api/admin/tenants/[slug]/ai-models?providerId=openai&appId=hr
 *
 * Live model list for a tenant/app's AI provider — the admin-console
 * counterpart of /api/config/ai-models, reading the API key from that
 * tenant/app's own dedicated database instead of the caller's own.
 */
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { createClient, createClientForUrl, type DbClient } from '@/lib/db';
import { resolveDedicatedTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import {
  findProviderInCatalog,
  loadAiProvidersCatalog,
  resolveProviderKey,
  listProviderModels,
} from '@/lib/ai-providers';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');
  const appId = searchParams.get('appId') ?? undefined;

  if (!providerId) return jsonError('Missing providerId', 400);

  const dbUrl = await resolveDedicatedTenantDbUrl(slug, appId);
  const db: DbClient = dbUrl ? createClientForUrl(dbUrl) : createClient();

  try {
    const catalog = await loadAiProvidersCatalog(db);
    const provider = findProviderInCatalog(catalog, providerId);
    if (!provider) return jsonError('Unknown or missing providerId', 400);

    const apiKey = await resolveProviderKey(provider, db);
    const models = await listProviderModels(provider, apiKey);
    return jsonOk({ providerId: provider.id, models });
  } catch (err) {
    console.error(`[admin/ai-models] GET error for "${slug}"/${providerId}:`, err);
    return jsonError(err instanceof Error ? err.message : 'Failed to list models', 502);
  } finally {
    if (dbUrl) await (db as unknown as { $disconnect: () => Promise<void> }).$disconnect();
  }
}
