import { describe, expect, it } from 'vitest';
import {
  DEFAULT_OLLAMA_TUNNEL_HOST,
  normalizeOllamaTunnelHost,
  resolveOllamaTunnelHost,
} from '@/lib/ollama-tunnel-host';

describe('resolveOllamaTunnelHost', () => {
  it('uses override when provided', () => {
    expect(resolveOllamaTunnelHost('https://custom.example.com/')).toBe(
      'https://custom.example.com',
    );
  });

  it('falls back to default when unset', () => {
    const prev = process.env.OLLAMA_TUNNEL_HOST;
    delete process.env.OLLAMA_TUNNEL_HOST;
    expect(resolveOllamaTunnelHost()).toBe(DEFAULT_OLLAMA_TUNNEL_HOST);
    if (prev !== undefined) process.env.OLLAMA_TUNNEL_HOST = prev;
  });
});

describe('normalizeOllamaTunnelHost paths', () => {
  it('preserves non-root path segments', () => {
    expect(normalizeOllamaTunnelHost('https://host.example.com/ollama/')).toBe(
      'https://host.example.com/ollama',
    );
  });
});
