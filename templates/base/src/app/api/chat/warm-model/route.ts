/**
 * GET  /api/chat/warm-model?model=… — is the model loaded in Ollama VRAM?
 * POST /api/chat/warm-model — start background warm if needed; returns immediately.
 */
import { z } from 'zod';
import { waitUntil } from '@vercel/functions';
import { requireSession } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  findProviderInCatalog,
  getActiveProviderId,
  getActiveModel,
  loadAiProvidersCatalog,
} from '@/lib/ai-providers';
import { isOllamaModelLoaded, triggerOllamaModelWarm } from '@/lib/ollama-studio';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const STUDIO_PROVIDER_ID = 'ollama-studio';

const querySchema = z.object({
  model: z.string().trim().min(1).max(200),
  providerId: z.string().trim().min(1).max(64).optional(),
});

const bodySchema = z.object({
  model: z.string().trim().min(1).max(200).optional(),
  providerId: z.string().trim().min(1).max(64).optional(),
});

async function resolveStudioContext(providerIdParam: string | undefined, modelParam: string | undefined) {
  const catalog = await loadAiProvidersCatalog();
  const workspaceProviderId = await getActiveProviderId();
  const providerId = providerIdParam ?? workspaceProviderId;

  if (providerId !== STUDIO_PROVIDER_ID) {
    return {
      ok: false as const,
      response: jsonOk({
        status: 'skipped' as const,
        providerId,
        reason: 'Warm-up applies only to TokenizMyApp-Studio-AI (ollama-studio).',
      }),
    };
  }

  if (workspaceProviderId !== STUDIO_PROVIDER_ID) {
    return {
      ok: false as const,
      response: jsonOk({
        status: 'skipped' as const,
        providerId,
        reason: 'Studio AI is not the workspace default provider.',
      }),
    };
  }

  const provider = findProviderInCatalog(catalog, providerId);
  if (!provider) {
    return { ok: false as const, response: jsonError('Unknown provider', 400) };
  }

  const model = modelParam ?? (await getActiveModel(providerId)) ?? provider.defaultModel;
  if (!model) {
    return { ok: false as const, response: jsonError('No model specified for warm-up', 400) };
  }

  return { ok: true as const, providerId, model };
}

function scheduleBackgroundWarm(model: string): void {
  const task = triggerOllamaModelWarm(model).catch((err) => {
    console.error(`[chat/warm-model] background warm failed for ${model}:`, err);
  });
  waitUntil(task);
}

export async function GET(request: Request): Promise<Response> {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    model: searchParams.get('model'),
    providerId: searchParams.get('providerId') ?? undefined,
  });
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'model query param is required', 400);
  }

  const ctx = await resolveStudioContext(parsed.data.providerId, parsed.data.model);
  if (!ctx.ok) return ctx.response;

  try {
    const loaded = await isOllamaModelLoaded(ctx.model);
    return jsonOk({
      status: loaded ? 'ready' as const : 'warming' as const,
      providerId: ctx.providerId,
      model: ctx.model,
    });
  } catch (err) {
    console.error('[chat/warm-model] GET error:', err);
    return jsonError(
      err instanceof Error ? err.message : 'Failed to check Studio model status',
      502,
    );
  }
}

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

  const ctx = await resolveStudioContext(parsed.data.providerId, parsed.data.model);
  if (!ctx.ok) return ctx.response;

  try {
    const loaded = await isOllamaModelLoaded(ctx.model);
    if (loaded) {
      return jsonOk({ status: 'ready' as const, providerId: ctx.providerId, model: ctx.model });
    }

    scheduleBackgroundWarm(ctx.model);
    return jsonOk({ status: 'warming' as const, providerId: ctx.providerId, model: ctx.model });
  } catch (err) {
    console.error('[chat/warm-model] POST error:', err);
    return jsonError(
      err instanceof Error ? err.message : 'Failed to start Studio model warm-up',
      502,
    );
  }
}
