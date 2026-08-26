import { z } from 'zod';
import { requireWriteAuth, requireCapability } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { setSecret, deleteSecret, getSecretPlaintext } from '@/lib/secrets';
import {
  findProviderInCatalog,
  getActiveProviderId,
  getActiveModel,
  setActiveProvider,
  resolveProviderKey,
  loadAiProvidersCatalog,
  saveAiProvidersCatalog,
  providerRequiresApiKey,
  isProviderConfigured,
  type AiProviderDef,
} from '@/lib/ai-providers';
import { aiProvidersCatalogSchema } from '@/lib/ai-provider-def-schema';

const postSchema = z.object({
  catalog: aiProvidersCatalogSchema.optional(),
  providerId: z.string().min(1).max(64).optional(),
  apiKey: z.string().trim().optional(),
  apiKeysBySecretName: z.record(z.string(), z.string()).optional(),
  model: z.string().trim().min(1).optional(),
  /** Set this provider as the active one used by content generation. */
  activate: z.boolean().optional(),
}).refine(
  (d) => d.catalog || d.providerId || d.apiKeysBySecretName,
  { message: 'Provide catalog, providerId, and/or apiKeysBySecretName' },
);

const deleteSchema = z.object({
  providerId: z.string().min(1).max(64),
});

interface ProviderStatus {
  id: string;
  label: string;
  configured: boolean;
  requiresApiKey: boolean;
  source: 'db' | 'env' | null;
  docsUrl: string;
  keyPlaceholder: string;
  defaultModel: string | null;
}

async function buildStatus(): Promise<{
  providers: ProviderStatus[];
  catalog: AiProviderDef[];
  activeProviderId: string;
  activeModel: string | null;
}> {
  const catalog = await loadAiProvidersCatalog();
  const providers: ProviderStatus[] = await Promise.all(
    catalog.map(async (p) => {
      const dbKey = await getSecretPlaintext(p.keySecretName);
      const source: 'db' | 'env' | null = dbKey ? 'db' : process.env[p.keyEnvVar] ? 'env' : null;
      return {
        id: p.id,
        label: p.label,
        configured: isProviderConfigured(p, source),
        requiresApiKey: providerRequiresApiKey(p),
        source,
        docsUrl: p.docsUrl,
        keyPlaceholder: p.keyPlaceholder,
        defaultModel: p.defaultModel ?? null,
      };
    }),
  );
  const activeProviderId = await getActiveProviderId();
  const activeModel = await getActiveModel(activeProviderId);
  return { providers, catalog, activeProviderId, activeModel };
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

  if (parsed.data.catalog) {
    await saveAiProvidersCatalog(parsed.data.catalog);
  }

  if (parsed.data.apiKeysBySecretName) {
    for (const [secretName, key] of Object.entries(parsed.data.apiKeysBySecretName)) {
      const trimmed = key?.trim();
      if (!trimmed) continue;
      await setSecret(secretName, trimmed);
    }
  }

  const catalog = await loadAiProvidersCatalog();

  if (parsed.data.providerId) {
    const provider = findProviderInCatalog(catalog, parsed.data.providerId);
    if (!provider) return jsonError('Unknown provider — not in catalog', 400);

    if (parsed.data.apiKey) {
      if (providerRequiresApiKey(provider) && parsed.data.apiKey.length < 10) {
        return jsonError('API key is too short', 400);
      }
      await setSecret(provider.keySecretName, parsed.data.apiKey);
    }

    if (parsed.data.activate) {
      const key = await resolveProviderKey(provider);
      if (!key && providerRequiresApiKey(provider)) {
        return jsonError(`${provider.label} has no API key configured — save one first`, 400);
      }
      await setActiveProvider(provider.id, parsed.data.model ?? null);
    }
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

  const catalog = await loadAiProvidersCatalog();
  const provider = findProviderInCatalog(catalog, parsed.data.providerId);
  if (!provider) return jsonError('Unknown provider', 400);

  await deleteSecret(provider.keySecretName);
  return jsonOk(await buildStatus());
}
