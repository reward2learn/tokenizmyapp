import { z } from 'zod';
import { requireWriteAuth, requireCapability } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { setSecret, deleteSecret, getSecretPlaintext } from '@/lib/secrets';
import {
  AI_PROVIDERS,
  getAiProvider,
  getActiveProviderId,
  getActiveModel,
  setActiveProvider,
  resolveProviderKey,
  type AiProviderId,
} from '@/lib/ai-providers';

const providerIdSchema = z.enum(['openai', 'vercel-ai-gateway', 'opencode-zen']);

const postSchema = z.object({
  providerId: providerIdSchema,
  apiKey: z.string().trim().min(10, 'API key is too short').optional(),
  model: z.string().trim().min(1).optional(),
  /** Set this provider as the active one used by content generation. */
  activate: z.boolean().optional(),
});

const deleteSchema = z.object({
  providerId: providerIdSchema,
});

interface ProviderStatus {
  id: AiProviderId;
  label: string;
  configured: boolean;
  source: 'db' | 'env' | null;
  docsUrl: string;
  keyPlaceholder: string;
  defaultModel: string | null;
}

async function buildStatus(): Promise<{ providers: ProviderStatus[]; activeProviderId: AiProviderId; activeModel: string | null }> {
  const providers: ProviderStatus[] = await Promise.all(
    AI_PROVIDERS.map(async (p) => {
      const dbKey = await getSecretPlaintext(p.keySecretName);
      const source: 'db' | 'env' | null = dbKey ? 'db' : process.env[p.keyEnvVar] ? 'env' : null;
      return {
        id: p.id,
        label: p.label,
        configured: source !== null,
        source,
        docsUrl: p.docsUrl,
        keyPlaceholder: p.keyPlaceholder,
        defaultModel: p.defaultModel ?? null,
      };
    }),
  );
  const activeProviderId = await getActiveProviderId();
  const activeModel = await getActiveModel(activeProviderId);
  return { providers, activeProviderId, activeModel };
}

export async function GET(request: Request) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const groupGuard = await requireCapability('config:write', request);
  if (!groupGuard.ok) return groupGuard.response;

  return jsonOk(await buildStatus());
}

export async function POST(request: Request) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const groupGuard = await requireCapability('config:write', request);
  if (!groupGuard.ok) return groupGuard.response;

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

  const provider = getAiProvider(parsed.data.providerId);
  if (!provider) return jsonError('Unknown provider', 400);

  if (parsed.data.apiKey) {
    await setSecret(provider.keySecretName, parsed.data.apiKey);
  }

  if (parsed.data.activate) {
    // Require a resolvable key (just-saved or already on file/env) before
    // switching content generation over to this provider.
    const key = await resolveProviderKey(provider);
    if (!key) return jsonError(`${provider.label} has no API key configured — save one first`, 400);
    await setActiveProvider(provider.id, parsed.data.model ?? null);
  }

  return jsonOk(await buildStatus());
}

export async function DELETE(request: Request) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const groupGuard = await requireCapability('config:write', request);
  if (!groupGuard.ok) return groupGuard.response;

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

  const provider = getAiProvider(parsed.data.providerId);
  if (!provider) return jsonError('Unknown provider', 400);

  await deleteSecret(provider.keySecretName);
  return jsonOk(await buildStatus());
}
