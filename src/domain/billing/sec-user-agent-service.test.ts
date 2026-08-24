import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  buildSecUserAgent,
  sanitizeSecUserAgentName,
} from '@/lib/billing/sec-user-agent';
import { collectTenantVercelProjectIds } from '@/domain/billing/sec-user-agent-service';

describe('sanitizeSecUserAgentName', () => {
  it('strips quotes and newlines', () => {
    expect(sanitizeSecUserAgentName('Acme "Co"\nInc')).toBe('Acme Co Inc');
  });
});

describe('buildSecUserAgent', () => {
  it('uses org name when provided', () => {
    expect(
      buildSecUserAgent({
        tenantSlug: 'acme',
        organizationName: 'Acme Corp',
        tenantDisplayName: 'Ignored',
      }),
    ).toBe('Acme Corp AI Credits Calculator admin@acme.com');
  });

  it('defaults TokenizMyApp for factory slug without names', () => {
    expect(buildSecUserAgent({ tenantSlug: 'tokenizmyapp' })).toBe(
      'TokenizMyApp AI Credits Calculator admin@tokenizmyapp.com',
    );
  });

  it('falls back to tenant display name', () => {
    expect(
      buildSecUserAgent({
        tenantSlug: 'redruby',
        tenantDisplayName: 'Red Ruby Bali',
      }),
    ).toBe('Red Ruby Bali AI Credits Calculator admin@redruby.com');
  });
});

describe('collectTenantVercelProjectIds', () => {
  it('collects root + suite project ids and skips missing', async () => {
    const { projectRefs, skippedNoProject } = await collectTenantVercelProjectIds('acme', {
      vercel_project_id: 'prj_root',
      metadata: {
        config: {
          appPack: {
            packId: 'p1',
            name: 'Suite',
            description: '',
            apps: [
              {
                appId: 'sales',
                name: 'Sales',
                department: 'Sales',
                templateId: 't',
                status: 'live',
                appUrl: null,
                dbUrl: null,
                vercelProjectId: 'prj_sales',
              },
              {
                appId: 'ops',
                name: 'Ops',
                department: 'Ops',
                templateId: 't',
                status: 'live',
                appUrl: null,
                dbUrl: null,
                vercelProjectId: null,
              },
            ],
            ceoOverview: { purpose: '', kpis: [] },
          },
        },
      },
    });
    expect(projectRefs.map((r) => r.projectId).sort()).toEqual(['prj_root', 'prj_sales']);
    expect(skippedNoProject).toEqual(['ops']);
  });
});

describe('pushSecUserAgentForTenant', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('requires confirm and upserts SEC_USER_AGENT', async () => {
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

    const db = {
      $executeRawUnsafe: vi.fn(),
      $queryRawUnsafe: vi.fn().mockImplementation(async (sql: string) => {
        if (sql.includes('FROM tenants')) {
          return [
            {
              slug: 'acme',
              display_name: 'Acme',
              vercel_project_id: 'prj_acme',
              organization_id: 'org_1',
              metadata: {},
            },
          ];
        }
        if (sql.includes('FROM organizations')) {
          return [{ display_name: 'Acme Org', slug: 'acme-org' }];
        }
        return [];
      }),
    };

    const { pushSecUserAgentForTenant } = await import(
      '@/domain/billing/sec-user-agent-service'
    );
    const result = await pushSecUserAgentForTenant(
      'acme',
      { confirm: true, organizationName: 'Acme Org' },
      db as never,
    );

    expect(result.secUserAgent).toBe(
      'Acme Org AI Credits Calculator admin@acme.com',
    );
    expect(result.updated).toEqual([
      { projectId: 'prj_acme', appId: null, ok: true, error: undefined },
    ]);
    expect(upsert).toHaveBeenCalledWith(
      'prj_acme',
      'SEC_USER_AGENT',
      'Acme Org AI Credits Calculator admin@acme.com',
    );
  });
});
