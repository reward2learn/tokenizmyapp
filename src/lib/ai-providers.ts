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

/** Where a resolved API key came from — 'db' means the tenant's own BYOK key. */
export type ProviderKeySource = 'db' | 'env';

interface ResolvedProviderKey {
  key: string | null;
  source: ProviderKeySource | null;
}

/**
 * Resolve an API key for a provider: DB secret first, then its env var.
 * Returns the source alongside the key so callers can distinguish "tenant's
 * own key (BYOK)" from "platform key" — the credit-metering decision in
 * credit-service.ts depends on it (roadmap §5.1).
 */
async function resolveProviderKeyWithSource(
  provider: AiProviderDef,
  db?: DbClient,
): Promise<ResolvedProviderKey> {
  try {
    const key = await getSecretPlaintext(provider.keySecretName, db);
    if (key) return { key, source: 'db' };
  } catch (err) {
    console.warn(`[ai-providers] DB key fetch failed for ${provider.id}, falling back to env:`, err instanceof Error ? err.message : err);
  }
  const envKey = process.env[provider.keyEnvVar] ?? null;
  return { key: envKey, source: envKey ? 'env' : null };
}

/** Resolve an API key for a provider: DB secret first, then its env var. */
export async function resolveProviderKey(provider: AiProviderDef, db?: DbClient): Promise<string | null> {
  return (await resolveProviderKeyWithSource(provider, db)).key;
}

export interface ActiveAiConfig {
  provider: AiProviderDef;
  apiKey: string;
  model: string;
  /** 'db' = tenant's own BYOK key (do not charge credits); 'env' = platform key. */
  keySource: ProviderKeySource;
}

/**
 * Resolve the fully-configured active AI backend: which provider, its API
 * key, and which model to call. Returns null when the active provider has
 * no key configured (DB or env) — callers should surface a "configure a
 * provider" error rather than attempting a request with no credentials.
 *
 * Optional overrides let the chat Tools picker use a configured provider/model
 * for a single request without changing the workspace-wide Config selection.
 * Overrides are only accepted for providers that already have a resolvable key.
 */
export async function resolveActiveAiConfig(
  modelOverride?: string | null,
  db?: DbClient,
  providerOverride?: AiProviderId | null,
): Promise<ActiveAiConfig | null> {
  const providerId = providerOverride && getAiProvider(providerOverride)
    ? providerOverride
    : await getActiveProviderId(db);
  const provider = getAiProvider(providerId);
  if (!provider) return null;

  const { key: apiKey, source: keySource } = await resolveProviderKeyWithSource(provider, db);
  if (!apiKey) return null;

  const model = modelOverride || (await getActiveModel(providerId, db));
  if (!model) return null;

  return { provider, apiKey, model, keySource: keySource ?? 'env' };
}
