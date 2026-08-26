import { describe, expect, it } from 'vitest';
import { checkModelHealth, parseAiProvidersCatalogJson, isValidAiProviderDef } from '@/lib/ai-providers';
import { AI_PROVIDERS } from '@/lib/ai-providers-catalog';

describe('checkModelHealth', () => {
  const models = [{ id: 'gpt-4o', label: 'gpt-4o' }];

  it('flags unhealthy when provider is unconfigured', () => {
    const result = checkModelHealth('gpt-4o', models, { status: 'unconfigured', message: 'No API key' });
    expect(result.status).toBe('unhealthy');
    expect(result.message).toContain('No API key');
  });

  it('flags unhealthy when model is missing from catalog', () => {
    const result = checkModelHealth('gpt-5', models, { status: 'healthy' });
    expect(result.status).toBe('unhealthy');
    expect(result.message).toContain('gpt-5');
  });

  it('passes when provider and model are valid', () => {
    const result = checkModelHealth('gpt-4o', models, { status: 'healthy' });
    expect(result.status).toBe('healthy');
  });
});

describe('parseAiProvidersCatalogJson', () => {
  it('returns null for empty / invalid JSON', () => {
    expect(parseAiProvidersCatalogJson(null)).toBeNull();
    expect(parseAiProvidersCatalogJson('')).toBeNull();
    expect(parseAiProvidersCatalogJson('not-json')).toBeNull();
    expect(parseAiProvidersCatalogJson('[]')).toBeNull();
    expect(parseAiProvidersCatalogJson('{}')).toBeNull();
  });

  it('parses a valid builtin-shaped catalog', () => {
    const parsed = parseAiProvidersCatalogJson(JSON.stringify(AI_PROVIDERS));
    expect(parsed).not.toBeNull();
    expect(parsed).toHaveLength(AI_PROVIDERS.length);
    expect(parsed?.[0].id).toBe('openai');
    expect(parsed?.find((p) => p.id === 'openai')?.modelsRequireAuth).toBe(true);
    expect(parsed?.find((p) => p.id === 'ollama-studio')?.modelsRequireAuth).toBe(false);
  });

  it('merges missing builtins back into a partial catalog', async () => {
    const { withBuiltinAiProviders } = await import('@/lib/ai-providers-catalog');
    const partial = [AI_PROVIDERS.find((p) => p.id === 'ollama-studio')!];
    const merged = withBuiltinAiProviders(partial);
    expect(merged.map((p) => p.id)).toEqual([
      'openai',
      'vercel-ai-gateway',
      'opencode-zen',
      'nous-research',
      'ollama-studio',
    ]);
  });

  it('rejects duplicate ids', () => {
    const dup = [AI_PROVIDERS[0], { ...AI_PROVIDERS[0], label: 'Other' }];
    expect(parseAiProvidersCatalogJson(JSON.stringify(dup))).toBeNull();
  });

  it('accepts a custom provider id', () => {
    const custom = [{
      ...AI_PROVIDERS[0],
      id: 'my-custom-llm',
      label: 'Custom LLM',
      keySecretName: 'CUSTOM_LLM_API_KEY',
      keyEnvVar: 'CUSTOM_LLM_API_KEY',
    }];
    const parsed = parseAiProvidersCatalogJson(JSON.stringify(custom));
    expect(parsed?.[0].id).toBe('my-custom-llm');
    expect(isValidAiProviderDef(custom[0])).toBe(true);
  });
});

describe('keyless provider helpers', () => {
  it('ollama-studio does not require an API key', async () => {
    const { providerRequiresApiKey, isProviderConfigured, KEYLESS_PROVIDER_BEARER } = await import('@/lib/ai-providers-catalog');
    const studio = AI_PROVIDERS.find((p) => p.id === 'ollama-studio')!;
    expect(providerRequiresApiKey(studio)).toBe(false);
    expect(isProviderConfigured(studio, null)).toBe(true);
    expect(KEYLESS_PROVIDER_BEARER).toBe('ollama');
  });

  it('openai still requires an API key', async () => {
    const { providerRequiresApiKey, isProviderConfigured } = await import('@/lib/ai-providers-catalog');
    const openai = AI_PROVIDERS.find((p) => p.id === 'openai')!;
    expect(providerRequiresApiKey(openai)).toBe(true);
    expect(isProviderConfigured(openai, null)).toBe(false);
    expect(isProviderConfigured(openai, 'db')).toBe(true);
  });
});
