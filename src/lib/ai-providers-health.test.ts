import { describe, expect, it } from 'vitest';
import { checkModelHealth } from '@/lib/ai-providers';

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
