/**
 * GET /api/chat/ai-options
 *
 * Session-auth chat picker data: models for the tenant's default/active
 * provider. Config → AI Provider stays admin-only for key writes and for
 * choosing which provider is active; chat users only pick a model.
 *
 * Providers come from the loaded DB catalog (AI_PROVIDERS_CATALOG) with
 * builtin fallback — custom backends appear once seeded and can be set as
 * the tenant default in setup.
 */
import { requireSession } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getSecretPlaintext } from '@/lib/secrets';
import {
  findProviderInCatalog,
  getActiveProviderId,
  getActiveModel,
  resolveProviderKey,
  listProviderModels,
  checkProviderHealth,
  checkModelHealth,
  loadAiProvidersCatalog,
  isProviderConfigured,
  type AiProviderHealth,
} from '@/lib/ai-providers';

export const maxDuration = 30;

export async function GET(request: Request): Promise<Response> {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const requestedModel = searchParams.get('model');

  const catalog = await loadAiProvidersCatalog();

  const providers = await Promise.all(
    catalog.map(async (p) => {
      const dbKey = await getSecretPlaintext(p.keySecretName);
      const source: 'db' | 'env' | null = dbKey
        ? 'db'
        : process.env[p.keyEnvVar]
          ? 'env'
          : null;
      const configured = isProviderConfigured(p, source);
      const health: AiProviderHealth = configured
        ? await checkProviderHealth(p)
        : { status: 'unconfigured', message: 'No API key configured' };

      return {
        id: p.id,
        label: p.label,
        configured,
        requiresApiKey: p.modelsRequireAuth,
        source,
        defaultModel: p.defaultModel ?? null,
        health,
      };
    }),
  );

  const activeProviderId = await getActiveProviderId();
  const activeModel = await getActiveModel(activeProviderId);

  // Chat always lists models for the tenant default provider.
  const providerId = activeProviderId;
  const provider = findProviderInCatalog(catalog, providerId);
  if (!provider) return jsonError('Unknown provider', 400);

  const providerHealth =
    providers.find((p) => p.id === providerId)?.health
    ?? await checkProviderHealth(provider);

  let models: { id: string; label: string; description?: string }[] = [];
  if (providerHealth.status === 'healthy') {
    try {
      const apiKey = await resolveProviderKey(provider);
      models = await listProviderModels(provider, apiKey);
    } catch (err) {
      console.warn(`[chat/ai-options] model list failed for ${provider.id}:`, err);
      providerHealth.status = 'unhealthy';
      providerHealth.message = err instanceof Error ? err.message : 'Failed to list models';
    }
  }

  const modelForHealth = requestedModel ?? activeModel;
  const modelHealth = checkModelHealth(modelForHealth, models, providerHealth);

  return jsonOk({
    providers,
    activeProviderId,
    activeModel,
    providerId,
    models,
    providerHealth,
    modelHealth,
  });
}
