/**
 * GET /api/chat/ai-options?providerId=openai
 *
 * Session-auth chat picker data: configured providers + live models for the
 * selected provider. Config → AI Provider stays admin-only for key writes;
 * any signed-in chat user can read options here to change the model for the
 * next prompt.
 */
import { requireSession } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getSecretPlaintext } from '@/lib/secrets';
import {
  AI_PROVIDERS,
  getAiProvider,
  getActiveProviderId,
  getActiveModel,
  resolveProviderKey,
  listProviderModels,
  type AiProviderId,
} from '@/lib/ai-providers';

export const maxDuration = 30;

const PROVIDER_IDS = new Set<string>(AI_PROVIDERS.map((p) => p.id));

export async function GET(request: Request): Promise<Response> {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const requested = searchParams.get('providerId');

  const providers = await Promise.all(
    AI_PROVIDERS.map(async (p) => {
      const dbKey = await getSecretPlaintext(p.keySecretName);
      const source: 'db' | 'env' | null = dbKey
        ? 'db'
        : process.env[p.keyEnvVar]
          ? 'env'
          : null;
      return {
        id: p.id,
        label: p.label,
        configured: source !== null,
        source,
        defaultModel: p.defaultModel ?? null,
      };
    }),
  );

  const activeProviderId = await getActiveProviderId();
  const activeModel = await getActiveModel(activeProviderId);

  let providerId: AiProviderId = activeProviderId;
  if (requested && PROVIDER_IDS.has(requested)) {
    providerId = requested as AiProviderId;
  }

  const provider = getAiProvider(providerId);
  if (!provider) return jsonError('Unknown provider', 400);

  let models: { id: string; label: string; description?: string }[] = [];
  try {
    const apiKey = await resolveProviderKey(provider);
    if (apiKey || !provider.modelsRequireAuth) {
      models = await listProviderModels(provider, apiKey);
    }
  } catch (err) {
    console.warn(`[chat/ai-options] model list failed for ${provider.id}:`, err);
  }

  return jsonOk({
    providers,
    activeProviderId,
    activeModel,
    providerId,
    models,
  });
}
