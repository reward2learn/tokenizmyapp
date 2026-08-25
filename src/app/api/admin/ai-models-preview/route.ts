/**
 * POST /api/admin/ai-models-preview
 *
 * Lists models for a provider using an API key supplied directly in the
 * request body — not one resolved from any database. This backs the AI
 * Provider step in Create Tenant / Create App wizards, where the admin may
 * be typing in a brand-new key (and possibly a custom provider def) before
 * any database exists to resolve a stored key from.
 */
import { z } from 'zod';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getAiProvider, listProviderModels } from '@/lib/ai-providers';
import { aiProviderDefSchema } from '@/lib/ai-provider-def-schema';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const bodySchema = z.object({
  providerId: z.string().min(1).max(64).optional(),
  apiKey: z.string().trim().min(1).optional(),
  /** Full def for custom / not-yet-saved providers (preferred over builtin lookup). */
  provider: aiProviderDefSchema.optional(),
}).refine((d) => Boolean(d.provider || d.providerId), {
  message: 'provider or providerId is required',
});

export async function POST(request: Request) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const provider = parsed.data.provider
    ?? getAiProvider(parsed.data.providerId);
  if (!provider) return jsonError('Unknown provider', 400);

  try {
    const models = await listProviderModels(provider, parsed.data.apiKey ?? null);
    return jsonOk({ providerId: provider.id, models });
  } catch (err) {
    console.error(`[ai-models-preview] POST error for ${provider.id}:`, err);
    return jsonError(err instanceof Error ? err.message : 'Failed to list models', 502);
  }
}
