import { requireWriteAuth, requireCapability } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getAiProvider, resolveProviderKey, listProviderModels } from '@/lib/ai-providers';

export const maxDuration = 30;

/**
 * GET /api/config/ai-models?providerId=openai
 *
 * Live model list for a provider, so the Config UI can offer a real "select
 * Model from a list of available models" step instead of a hardcoded/stale
 * dropdown — provider catalogs change too often to bake in.
 */
export async function GET(request: Request) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const groupGuard = await requireCapability('config:write', request);
  if (!groupGuard.ok) return groupGuard.response;

  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');
  const provider = getAiProvider(providerId);
  if (!provider) return jsonError('Unknown or missing providerId', 400);

  try {
    const apiKey = await resolveProviderKey(provider);
    const models = await listProviderModels(provider, apiKey);
    return jsonOk({ providerId: provider.id, models });
  } catch (err) {
    console.error(`[ai-models] GET error for ${provider.id}:`, err);
    return jsonError(err instanceof Error ? err.message : 'Failed to list models', 502);
  }
}
