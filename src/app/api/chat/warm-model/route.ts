/**
 * POST /api/chat/warm-model
 *
 * Preloads a Mac Studio Ollama model (ollama-studio) with a minimal
 * completion so the first real chat message is faster. Session-auth only.
 */
import { z } from 'zod';
import { requireSession } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  findProviderInCatalog,
  getActiveProviderId,
  getActiveModel,
  loadAiProvidersCatalog,
  resolveProviderKey,
  resolveChatCompletionsUrl,
} from '@/lib/ai-providers';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const bodySchema = z.object({
  model: z.string().trim().min(1).max(200).optional(),
  providerId: z.string().trim().min(1).max(64).optional(),
});

export async function POST(request: Request): Promise<Response> {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const catalog = await loadAiProvidersCatalog();
  const workspaceProviderId = await getActiveProviderId();
  const providerId = parsed.data.providerId ?? workspaceProviderId;

  if (providerId !== 'ollama-studio') {
    return jsonOk({
      status: 'skipped',
      providerId,
      reason: 'Warm-up applies only to TokenizMyApp-Studio-AI (ollama-studio).',
    });
  }

  if (workspaceProviderId !== 'ollama-studio') {
    return jsonOk({
      status: 'skipped',
      providerId,
      reason: 'Studio AI is not the workspace default provider.',
    });
  }

  const provider = findProviderInCatalog(catalog, providerId);
  if (!provider) return jsonError('Unknown provider', 400);

  const model = parsed.data.model ?? (await getActiveModel(providerId)) ?? provider.defaultModel;
  if (!model) return jsonError('No model specified for warm-up', 400);

  const apiKey = await resolveProviderKey(provider);
  if (!apiKey) return jsonError('Studio AI is not configured', 503);

  const chatUrl = resolveChatCompletionsUrl(provider);

  try {
    const response = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        stream: false,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      const message = detail.slice(0, 300) || `Warm-up failed (${response.status})`;
      return jsonError(message, response.status >= 500 ? 502 : response.status);
    }

    return jsonOk({ status: 'ready', providerId, model });
  } catch (err) {
    console.error('[chat/warm-model] error:', err);
    return jsonError(
      err instanceof Error ? err.message : 'Failed to warm Studio AI model',
      502,
    );
  }
}
