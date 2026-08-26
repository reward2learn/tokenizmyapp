import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_OLLAMA_TUNNEL_HOST,
  normalizeOllamaTunnelHost,
  OLLAMA_TUNNEL_HOST_ENV_KEY,
} from '@/lib/ollama-tunnel-host';

describe('normalizeOllamaTunnelHost', () => {
  it('strips trailing slashes', () => {
    expect(normalizeOllamaTunnelHost('https://ollama.tokenizin.com/')).toBe(
      'https://ollama.tokenizin.com',
    );
  });

  it('rejects empty input', () => {
    expect(() => normalizeOllamaTunnelHost('  ')).toThrow(/required/i);
  });

  it('rejects invalid URLs', () => {
    expect(() => normalizeOllamaTunnelHost('not-a-url')).toThrow(/valid URL/i);
  });
});

describe('collectOllamaTunnelHostProjectIds', () => {
  const prevProjectId = process.env.VERCEL_PROJECT_ID;

  beforeEach(() => {
    process.env.VERCEL_PROJECT_ID = 'prj_factory';
  });

  afterEach(() => {
    if (prevProjectId === undefined) delete process.env.VERCEL_PROJECT_ID;
    else process.env.VERCEL_PROJECT_ID = prevProjectId;
  });

  it('includes tenant projects and factory', async () => {
    const { collectOllamaTunnelHostProjectIds } = await import(
      '@/domain/config/ollama-tunnel-host-service'
    );
    const { projectRefs } = await collectOllamaTunnelHostProjectIds('acme', {
      vercel_project_id: 'prj_root',
      metadata: {},
    });
    expect(projectRefs.map((r) => r.projectId).sort()).toEqual(['prj_factory', 'prj_root']);
  });

  it('returns factory only when tenant is null', async () => {
    const { collectOllamaTunnelHostProjectIds } = await import(
      '@/domain/config/ollama-tunnel-host-service'
    );
    const { projectRefs } = await collectOllamaTunnelHostProjectIds('new-tenant', null);
    expect(projectRefs).toEqual([{ projectId: 'prj_factory', appId: null }]);
  });
});

describe('pushOllamaTunnelHostForTenant', () => {
  it('requires confirm and upserts OLLAMA_TUNNEL_HOST', async () => {
    const upsert = vi.fn().mockResolvedValue(true);
    vi.doMock('@/domain/tenant/vercel-deploy-service', () => ({
      upsertProjectEnvVar: upsert,
    }));
    vi.doMock('@/domain/tenant/vercel-sdk-client', () => ({
      listVercelBearerTokens: vi.fn().mockResolvedValue(['tok']),
    }));
    vi.doMock('@/domain/tenant/tenant-service', () => ({
      ensureTenantsTable: vi.fn(),
    }));
    vi.doMock('@/domain/billing/sec-user-agent-service', () => ({
      collectTenantVercelProjectIds: vi.fn().mockResolvedValue({
        projectRefs: [{ projectId: 'prj_root', appId: null }],
        skippedNoProject: [],
      }),
    }));

    const db = {
      $executeRawUnsafe: vi.fn(),
      $queryRawUnsafe: vi.fn().mockResolvedValue([
        { slug: 'acme', vercel_project_id: 'prj_root', metadata: {} },
      ]),
    };

    const { pushOllamaTunnelHostForTenant } = await import(
      '@/domain/config/ollama-tunnel-host-service'
    );

    const result = await pushOllamaTunnelHostForTenant(
      'acme',
      { confirm: true, tunnelHost: DEFAULT_OLLAMA_TUNNEL_HOST },
      db as never,
    );

    expect(result.tunnelHost).toBe(DEFAULT_OLLAMA_TUNNEL_HOST);
    expect(result.updated.some((u) => u.ok)).toBe(true);
    expect(upsert).toHaveBeenCalledWith(
      expect.any(String),
      OLLAMA_TUNNEL_HOST_ENV_KEY,
      DEFAULT_OLLAMA_TUNNEL_HOST,
    );
  });
});
