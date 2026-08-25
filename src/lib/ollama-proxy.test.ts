import { describe, expect, it, afterEach } from 'vitest';
import {
  assertOllamaProxyAuthorized,
  curatedModelsOpenAiPayload,
  extractBearerToken,
  normalizeOllamaUpstreamModelId,
  STUDIO_OLLAMA_MODELS,
} from '@/lib/ollama-proxy';

describe('normalizeOllamaUpstreamModelId', () => {
  it('strips the ollama/ provider prefix', () => {
    expect(normalizeOllamaUpstreamModelId('ollama/qwen2.5:14b')).toBe('qwen2.5:14b');
    expect(normalizeOllamaUpstreamModelId('ollama/qwen3.6:latest')).toBe('qwen3.6:latest');
  });

  it('leaves bare Ollama tags unchanged', () => {
    expect(normalizeOllamaUpstreamModelId('qwen3:8b')).toBe('qwen3:8b');
  });
});

describe('curatedModelsOpenAiPayload', () => {
  it('hides embedding models from the chat picker by default', () => {
    const payload = curatedModelsOpenAiPayload(false);
    expect(payload.data.every((m) => !/embed/i.test(m.id))).toBe(true);
    expect(payload.data.length).toBe(
      STUDIO_OLLAMA_MODELS.filter((m) => m.chatCapable).length,
    );
  });

  it('exposes Studio chat model ids used in AI Providers', () => {
    const ids = curatedModelsOpenAiPayload(false).data.map((m) => m.id);
    expect(ids).toContain('ollama/qwen2.5:14b');
    expect(ids).toContain('ollama/qwen3.6:latest');
  });
});

describe('assertOllamaProxyAuthorized', () => {
  const prevProxy = process.env.OLLAMA_PROXY_API_KEY;
  const prevTokeniz = process.env.TOKENIZMYAPP_API_KEY;

  afterEach(() => {
    if (prevProxy === undefined) delete process.env.OLLAMA_PROXY_API_KEY;
    else process.env.OLLAMA_PROXY_API_KEY = prevProxy;
    if (prevTokeniz === undefined) delete process.env.TOKENIZMYAPP_API_KEY;
    else process.env.TOKENIZMYAPP_API_KEY = prevTokeniz;
  });

  it('allows all requests when no proxy keys are configured', () => {
    delete process.env.OLLAMA_PROXY_API_KEY;
    delete process.env.TOKENIZMYAPP_API_KEY;
    expect(assertOllamaProxyAuthorized(null)).toBe(true);
  });

  it('accepts a matching Bearer token', () => {
    delete process.env.TOKENIZMYAPP_API_KEY;
    process.env.OLLAMA_PROXY_API_KEY = 'studio-secret';
    expect(assertOllamaProxyAuthorized('Bearer studio-secret')).toBe(true);
    expect(assertOllamaProxyAuthorized('Bearer wrong')).toBe(false);
    expect(assertOllamaProxyAuthorized(null)).toBe(false);
  });

  it('parses Bearer tokens', () => {
    expect(extractBearerToken('Bearer abc')).toBe('abc');
    expect(extractBearerToken('Basic abc')).toBeNull();
  });
});
