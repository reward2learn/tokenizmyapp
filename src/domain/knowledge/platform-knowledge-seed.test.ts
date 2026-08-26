import { describe, expect, it, afterEach } from 'vitest';
import { buildPlatformKnowledgeSnippets } from '@/domain/knowledge/platform-knowledge-seed';
import { redRubySeedCorpusEnabled } from '@/domain/seed/seed-knowledge-corpus';

const envBackup: Record<string, string | undefined> = {};

function stubEnv(key: string, value: string): void {
  if (!(key in envBackup)) envBackup[key] = process.env[key];
  process.env[key] = value;
}

afterEach(() => {
  for (const [key, value] of Object.entries(envBackup)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  for (const key of Object.keys(envBackup)) delete envBackup[key];
});

describe('redRubySeedCorpusEnabled', () => {
  it('is disabled on the platform factory app', () => {
    stubEnv('NEXT_PUBLIC_TENANT_SLUG', 'tokenizmyapp');
    expect(redRubySeedCorpusEnabled()).toBe(false);
  });

  it('is enabled on tenant deployments', () => {
    stubEnv('NEXT_PUBLIC_TENANT_SLUG', 'redrubybali');
    expect(redRubySeedCorpusEnabled()).toBe(true);
  });
});

describe('buildPlatformKnowledgeSnippets', () => {
  it('describes the platform control plane, not Red Ruby', () => {
    stubEnv('NEXT_PUBLIC_TENANT_SLUG', 'tokenizmyapp');
    stubEnv('NEXT_PUBLIC_TENANT_DISPLAY_NAME', 'TokenizMyApp');

    const text = buildPlatformKnowledgeSnippets().map((s) => s.content).join(' ');

    expect(text).toContain('TokenizMyApp');
    expect(text).toContain('Platform Admin');
    expect(text).toContain('tenant applications');
    expect(text.toLowerCase()).not.toContain('red ruby club');
    expect(text.toLowerCase()).not.toContain('terrace bar');
  });
});
