/**
 * AI Provider resolution — DB-backed half of the AI provider system. Server
 * only (imports Prisma via secrets.ts) — see ai-providers-catalog.ts for the
 * client-safe static catalog + model-list fetcher, both re-exported below.
 */
import { getSecretPlaintext, setSecret, deleteSecret } from '@/lib/secrets';
import type { DbClient } from '@/lib/db';
import { getAiProvider, type AiProviderDef, type AiProviderId } from '@/lib/ai-providers-catalog';

export {
  AI_PROVIDERS,
  getAiProvider,
  listProviderModels,
  type AiProviderDef,
  type AiProviderId,
  type AiModelOption,
} from '@/lib/ai-providers-catalog';

/** Secret keyName the active provider selection is stored under — not a
 *  real secret, just reusing the existing encrypted key-value store so this
 *  needs no new table/migration. */
const ACTIVE_PROVIDER_KEY = 'AI_ACTIVE_PROVIDER';
const ACTIVE_MODEL_KEY = 'AI_ACTIVE_MODEL';

/**
 * Every function below optionally accepts a `db` client so the admin
 * console can manage a DIFFERENT tenant/app's AI provider config directly
 * on that tenant's own dedicated database (see admin/tenants/[slug]/
 * ai-provider/route.ts) — the config takes effect immediately, with no
 * redeploy, since it's read live on that tenant's next request. Omitting
 * `db` operates on the caller's own database (the self-service Config page).
 */
export async function getActiveProviderId(db?: DbClient): Promise<AiProviderId> {
  const stored = await getSecretPlaintext(ACTIVE_PROVIDER_KEY, db);
  const provider = getAiProvider(stored);
  return provider?.id ?? 'openai'; // default preserves pre-multi-provider behavior
}

export async function getActiveModel(providerId: AiProviderId, db?: DbClient): Promise<string | null> {
  const stored = await getSecretPlaintext(ACTIVE_MODEL_KEY, db);
  if (stored) return stored;
  return getAiProvider(providerId)?.defaultModel ?? null;
}

export async function setActiveProvider(providerId: AiProviderId, model?: string | null, db?: DbClient): Promise<void> {
  await setSecret(ACTIVE_PROVIDER_KEY, providerId, db);
  if (model) {
    await setSecret(ACTIVE_MODEL_KEY, model, db);
  } else {
    await deleteSecret(ACTIVE_MODEL_KEY, db);
  }
}

/** Resolve an API key for a provider: DB secret first, then its env var. */
export async function resolveProviderKey(provider: AiProviderDef, db?: DbClient): Promise<string | null> {
  try {
    const key = await getSecretPlaintext(provider.keySecretName, db);
    if (key) return key;
  } catch (err) {
    console.warn(`[ai-providers] DB key fetch failed for ${provider.id}, falling back to env:`, err instanceof Error ? err.message : err);
  }
  return process.env[provider.keyEnvVar] ?? null;
}

export interface ActiveAiConfig {
  provider: AiProviderDef;
  apiKey: string;
  model: string;
}

/**
 * Resolve the fully-configured active AI backend: which provider, its API
 * key, and which model to call. Returns null when the active provider has
 * no key configured (DB or env) — callers should surface a "configure a
 * provider" error rather than attempting a request with no credentials.
 */
export async function resolveActiveAiConfig(modelOverride?: string | null, db?: DbClient): Promise<ActiveAiConfig | null> {
  const providerId = await getActiveProviderId(db);
  const provider = getAiProvider(providerId);
  if (!provider) return null;

  const apiKey = await resolveProviderKey(provider, db);
  if (!apiKey) return null;

  const model = modelOverride || (await getActiveModel(providerId, db));
  if (!model) return null;

  return { provider, apiKey, model };
}
