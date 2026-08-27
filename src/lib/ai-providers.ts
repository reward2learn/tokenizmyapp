/**
 * AI Provider resolution — DB-backed half of the AI provider system. Server
 * only (imports Prisma via secrets.ts) — see ai-providers-catalog.ts for the
 * client-safe static catalog + model-list fetcher, both re-exported below.
 *
 * Runtime catalog lives in encrypted secrets under AI_PROVIDERS_CATALOG
 * (JSON array of AiProviderDef). Builtin AI_PROVIDERS is the seed template /
 * fallback when the secret is missing or invalid.
 */
import { getSecretPlaintext, setSecret, deleteSecret } from '@/lib/secrets';
import type { DbClient } from '@/lib/db';
import {
  AI_PROVIDERS,
  findProviderInCatalog,
  withBuiltinAiProviders,
  KEYLESS_PROVIDER_BEARER,
  providerRequiresApiKey,
  isProviderConfigured,
  type AiProviderDef,
  type AiModelOption,
  listProviderModels,
} from '@/lib/ai-providers-catalog';

export {
  AI_PROVIDER_IDS,
  AI_PROVIDERS,
  FACTORY_OLLAMA_V1_BASE,
  KEYLESS_PROVIDER_BEARER,
  isKeylessProviderBearer,
  buildProviderFetchHeaders,
  getAiProvider,
  findProviderInCatalog,
  withBuiltinAiProviders,
  providerRequiresApiKey,
  isProviderConfigured,
  resolveChatCompletionsUrl,
  listProviderModels,
  type AiProviderDef,
  type AiProviderId,
  type AiModelOption,
} from '@/lib/ai-providers-catalog';

export type AiProviderHealthStatus = 'healthy' | 'unhealthy' | 'unconfigured';

export interface AiProviderHealth {
  status: AiProviderHealthStatus;
  message?: string;
}

export type AiModelHealthStatus = 'healthy' | 'unhealthy';

export interface AiModelHealth {
  status: AiModelHealthStatus;
  message?: string;
}

/** Secret keyName the active provider selection is stored under — not a
 *  real secret, just reusing the existing encrypted key-value store so this
 *  needs no new table/migration. */
const ACTIVE_PROVIDER_KEY = 'AI_ACTIVE_PROVIDER';
const ACTIVE_MODEL_KEY = 'AI_ACTIVE_MODEL';

/** Full per-tenant/app provider catalog (JSON array of AiProviderDef). */
export const AI_PROVIDERS_CATALOG_KEY = 'AI_PROVIDERS_CATALOG';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/** Light shape validation for a single catalog entry (no Zod — keep deps thin). */
export function isValidAiProviderDef(value: unknown): value is AiProviderDef {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    isNonEmptyString(v.id)
    && isNonEmptyString(v.label)
    && isNonEmptyString(v.keySecretName)
    && isNonEmptyString(v.keyEnvVar)
    && typeof v.keyPlaceholder === 'string'
    && isNonEmptyString(v.chatCompletionsUrl)
    && isNonEmptyString(v.modelsUrl)
    && typeof v.modelsRequireAuth === 'boolean'
    && isNonEmptyString(v.docsUrl)
    && (v.defaultModel === undefined || typeof v.defaultModel === 'string')
  );
}

/** Parse a JSON catalog string; returns null if missing/invalid. */
export function parseAiProvidersCatalogJson(raw: string | null | undefined): AiProviderDef[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    if (!parsed.every(isValidAiProviderDef)) return null;
    const ids = new Set<string>();
    for (const def of parsed) {
      if (ids.has(def.id)) return null;
      ids.add(def.id);
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Load the AI provider catalog from DB secrets, falling back to the static
 * builtin seed template when missing or invalid. Always merges in any
 * builtin seed entries that are absent from a saved catalog so OpenAI /
 * Gateway / Zen / Nous / Studio stay available after partial custom saves.
 */
export async function loadAiProvidersCatalog(db?: DbClient): Promise<AiProviderDef[]> {
  try {
    const raw = await getSecretPlaintext(AI_PROVIDERS_CATALOG_KEY, db);
    const parsed = parseAiProvidersCatalogJson(raw);
    if (parsed) return withBuiltinAiProviders(parsed);
  } catch (err) {
    console.warn(
      '[ai-providers] catalog load failed, using builtin fallback:',
      err instanceof Error ? err.message : err,
    );
  }
  return AI_PROVIDERS;
}

export async function saveAiProvidersCatalog(defs: AiProviderDef[], db?: DbClient): Promise<void> {
  if (!Array.isArray(defs) || defs.length === 0) {
    throw new Error('AI providers catalog must be a non-empty array');
  }
  if (!defs.every(isValidAiProviderDef)) {
    throw new Error('AI providers catalog contains invalid entries');
  }
  const ids = new Set(defs.map((d) => d.id));
  if (ids.size !== defs.length) {
    throw new Error('AI providers catalog contains duplicate ids');
  }
  await setSecret(AI_PROVIDERS_CATALOG_KEY, JSON.stringify(defs), db);
}

export interface SeedAiProviderConfigInput {
  catalog: AiProviderDef[];
  /** Map of keySecretName → plaintext API key (only entries with values are written). */
  apiKeysBySecretName?: Record<string, string>;
  activeProviderId?: string | null;
  activeModel?: string | null;
}

/**
 * Seed a tenant/app DB with a full provider catalog, optional API keys, and
 * active provider/model selection. Used by create-tenant / create-app flows.
 */
export async function seedAiProviderConfig(
  db: DbClient,
  input: SeedAiProviderConfigInput,
): Promise<void> {
  await saveAiProvidersCatalog(input.catalog, db);

  if (input.apiKeysBySecretName) {
    for (const [secretName, key] of Object.entries(input.apiKeysBySecretName)) {
      const trimmed = key?.trim();
      if (!trimmed) continue;
      await setSecret(secretName, trimmed, db);
    }
  }

  if (input.activeProviderId) {
    const provider = findProviderInCatalog(input.catalog, input.activeProviderId);
    if (!provider) {
      throw new Error(`Active provider "${input.activeProviderId}" is not in the catalog`);
    }
    await setActiveProvider(provider.id, input.activeModel ?? null, db);
  }
}

/**
 * Every function below optionally accepts a `db` client so the admin
 * console can manage a DIFFERENT tenant/app's AI provider config directly
 * on that tenant's own dedicated database (see admin/tenants/[slug]/
 * ai-provider/route.ts) — the config takes effect immediately, with no
 * redeploy, since it's read live on that tenant's next request. Omitting
 * `db` operates on the caller's own database (the self-service Config page).
 */
export async function getActiveProviderId(db?: DbClient): Promise<string> {
  const catalog = await loadAiProvidersCatalog(db);
  const stored = await getSecretPlaintext(ACTIVE_PROVIDER_KEY, db);
  const provider = findProviderInCatalog(catalog, stored);
  return provider?.id ?? findProviderInCatalog(catalog, 'openai')?.id ?? catalog[0]?.id ?? 'openai';
}

export async function getActiveModel(providerId: string, db?: DbClient): Promise<string | null> {
  const stored = await getSecretPlaintext(ACTIVE_MODEL_KEY, db);
  if (stored) return stored;
  const catalog = await loadAiProvidersCatalog(db);
  return findProviderInCatalog(catalog, providerId)?.defaultModel ?? null;
}

export async function setActiveProvider(providerId: string, model?: string | null, db?: DbClient): Promise<void> {
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
 * Returns the source alongside the key for diagnostics. Credit metering
 * always charges the org balance regardless of source.
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
  if (envKey) return { key: envKey, source: 'env' };
  if (!providerRequiresApiKey(provider)) {
    return { key: KEYLESS_PROVIDER_BEARER, source: null };
  }
  return { key: null, source: null };
}

/** Resolve an API key for a provider: DB secret first, then its env var. */
export async function resolveProviderKey(provider: AiProviderDef, db?: DbClient): Promise<string | null> {
  return (await resolveProviderKeyWithSource(provider, db)).key;
}

/**
 * Lightweight init-time probe: verifies the provider has a resolvable key and
 * can list models (which exercises auth for key-gated catalogs).
 */
export async function checkProviderHealth(
  provider: AiProviderDef,
  db?: DbClient,
): Promise<AiProviderHealth> {
  const apiKey = await resolveProviderKey(provider, db);
  if (!apiKey && providerRequiresApiKey(provider)) {
    return { status: 'unconfigured', message: 'No API key configured' };
  }

  try {
    await listProviderModels(provider, apiKey);
    return { status: 'healthy' };
  } catch (err) {
    return {
      status: 'unhealthy',
      message: err instanceof Error ? err.message : 'Provider health check failed',
    };
  }
}

export function checkModelHealth(
  modelId: string | null | undefined,
  models: AiModelOption[],
  providerHealth: AiProviderHealth,
): AiModelHealth {
  if (providerHealth.status === 'unconfigured') {
    return { status: 'unhealthy', message: providerHealth.message ?? 'Provider is not configured' };
  }
  if (providerHealth.status === 'unhealthy') {
    return { status: 'unhealthy', message: providerHealth.message ?? 'Provider is not healthy' };
  }
  if (!modelId) {
    return { status: 'unhealthy', message: 'No model selected' };
  }
  if (!models.some((m) => m.id === modelId)) {
    return { status: 'unhealthy', message: `Model "${modelId}" is not available for this provider` };
  }
  return { status: 'healthy' };
}

export interface ActiveAiConfig {
  provider: AiProviderDef;
  apiKey: string;
  model: string;
  /** Where the API key was resolved from — diagnostic only; usage is always metered. */
  keySource: ProviderKeySource;
}

/**
 * Resolve the fully-configured active AI backend: which provider, its API
 * key, and which model to call. Returns null when the active provider has
 * no key configured (DB or env) — callers should surface a "configure a
 * provider" error rather than attempting a request with no credentials.
 *
 * Optional model override lets the chat model picker use a configured model
 * for a single request without changing the workspace-wide Config selection.
 * Provider is always the tenant's active/default provider.
 */
export async function resolveActiveAiConfig(
  modelOverride?: string | null,
  db?: DbClient,
): Promise<ActiveAiConfig | null> {
  const catalog = await loadAiProvidersCatalog(db);
  const providerId = await getActiveProviderId(db);
  const provider = findProviderInCatalog(catalog, providerId);
  if (!provider) return null;

  const { key: apiKey, source: keySource } = await resolveProviderKeyWithSource(provider, db);
  if (!apiKey) return null;

  const model = modelOverride || (await getActiveModel(providerId, db));
  if (!model) return null;

  return { provider, apiKey, model, keySource: keySource ?? 'env' };
}
