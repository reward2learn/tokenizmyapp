import { describe, expect, it, vi, beforeEach } from 'vitest';
import { listTenantSuiteApps } from '@/domain/billing/seed-tenant-ai-credits';

describe('listTenantSuiteApps', () => {
  it('returns suite apps from appPack', () => {
    const apps = listTenantSuiteApps('acme', {
      display_name: 'Acme',
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
    expect(apps).toEqual([
      { appId: 'sales', name: 'Sales', vercelProjectId: 'prj_sales' },
      { appId: 'ops', name: 'Ops', vercelProjectId: null },
    ]);
  });

  it('falls back to single synthetic app for non-suite tenants', () => {
    const apps = listTenantSuiteApps('solo', {
      display_name: 'Solo Co',
      vercel_project_id: 'prj_solo',
      metadata: { config: {} },
    });
    expect(apps).toEqual([
      { appId: 'solo', name: 'Solo Co', vercelProjectId: 'prj_solo' },
    ]);
  });
});

describe('seedTenantAiCredits', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('rejects tenants without organization_id', async () => {
    vi.doMock('@/lib/db', () => ({
      createRawClient: () => ({
        $executeRawUnsafe: vi.fn(),
        $queryRawUnsafe: vi.fn().mockResolvedValue([
          {
            slug: 'orphan',
            display_name: 'Orphan',
            organization_id: null,
            vercel_project_id: null,
            metadata: {},
          },
        ]),
      }),
    }));
    vi.doMock('@/domain/tenant/tenant-service', () => ({
      ensureTenantsTable: vi.fn(),
    }));

    const { seedTenantAiCredits } = await import('@/domain/billing/seed-tenant-ai-credits');
    await expect(seedTenantAiCredits('orphan')).rejects.toThrow(/no organization_id/);
  });

  it('rejects unknown scoped appId', async () => {
    vi.doMock('@/lib/db', () => ({
      createRawClient: () => ({
        $executeRawUnsafe: vi.fn(),
        $queryRawUnsafe: vi.fn().mockResolvedValue([
          {
            slug: 'acme',
            display_name: 'Acme',
            organization_id: 'org_1',
            vercel_project_id: 'prj_root',
            metadata: {
              config: {
                appPack: {
                  apps: [
                    {
                      appId: 'sales',
                      name: 'Sales',
                      vercelProjectId: 'prj_s',
                    },
                  ],
                },
              },
            },
          },
        ]),
      }),
    }));
    vi.doMock('@/domain/tenant/tenant-service', () => ({
      ensureTenantsTable: vi.fn(),
    }));

    const { seedTenantAiCredits } = await import('@/domain/billing/seed-tenant-ai-credits');
    await expect(
      seedTenantAiCredits('acme', { scopedAppId: 'missing' }),
    ).rejects.toThrow(/is not in tenant/);
  });

  it('recalculates, refreshes catalog credits, syncs plan, propagates identity', async () => {
    const db = {
      $executeRawUnsafe: vi.fn(),
      $queryRawUnsafe: vi.fn().mockResolvedValue([
        {
          slug: 'acme',
          display_name: 'Acme',
          organization_id: 'org_1',
          vercel_project_id: 'prj_root',
          metadata: {
            config: {
              appPack: {
                apps: [
                  { appId: 'sales', name: 'Sales', vercelProjectId: 'prj_s' },
                  { appId: 'ops', name: 'Ops', vercelProjectId: 'prj_o' },
                ],
              },
            },
          },
        },
      ]),
    };
    vi.doMock('@/lib/db', () => ({
      createRawClient: () => db,
    }));
    vi.doMock('@/domain/tenant/tenant-service', () => ({
      ensureTenantsTable: vi.fn(),
    }));

    const rateCard = {
      inputs: {
        appCount: 2,
        userCount: 1,
        annualRevenueUsd: 0,
        macStudioCostUsd: 12999,
        monthlyThirdPartyUsd: 0,
      },
      markupPercent: 0.3,
      manualMarkupPercent: null,
      breakdown: {
        floor: 0.3,
        appFactor: 0.02,
        userFactor: 0,
        revenueFactor: 0,
        hardwareFactor: 0,
        expenseFactor: 0,
        raw: 0.32,
        clamped: 0.32,
      },
      creditsPerUsd: 123,
      planCredits: { free: 100, pro: 1000, business: 2000 },
      packCredits: { 'pack-25': 250, 'pack-50': 500, 'pack-100': 1000 },
      computedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const recalculateOrgRateCard = vi.fn().mockResolvedValue(rateCard);
    const refreshOrgRateCardCreditsFromCatalog = vi.fn().mockResolvedValue(rateCard);
    vi.doMock('@/domain/billing/org-rate-card-service', () => ({
      recalculateOrgRateCard,
      refreshOrgRateCardCreditsFromCatalog,
    }));

    const planAllowance = {
      action: 'granted' as const,
      targetCredits: 1000,
      delta: 1000,
      planId: 'pro',
      grantId: 'g1',
    };
    const syncCurrentPeriodPlanAllowance = vi.fn().mockResolvedValue(planAllowance);
    vi.doMock('@/domain/billing/credit-service', () => ({
      syncCurrentPeriodPlanAllowance,
    }));

    const billingIdentity = {
      orgId: 'org_1',
      appsTouched: 2,
      envVarsPushed: 4,
      skippedNoProject: [],
      errors: [],
    };
    const propagateBillingIdentityForTenant = vi.fn().mockResolvedValue(billingIdentity);
    vi.doMock('@/domain/billing/propagate-billing-identity', () => ({
      propagateBillingIdentityForTenant,
    }));

    const { seedTenantAiCredits } = await import('@/domain/billing/seed-tenant-ai-credits');
    const result = await seedTenantAiCredits('acme', { scopedAppId: 'sales' }, db as never);

    expect(recalculateOrgRateCard).toHaveBeenCalledWith('org_1', db);
    expect(refreshOrgRateCardCreditsFromCatalog).toHaveBeenCalledWith('org_1', db);
    expect(syncCurrentPeriodPlanAllowance).toHaveBeenCalledWith('org_1', db);
    expect(propagateBillingIdentityForTenant).toHaveBeenCalledWith('acme', db);
    expect(result.orgId).toBe('org_1');
    expect(result.scopedAppId).toBe('sales');
    expect(result.apps).toHaveLength(2);
    expect(result.planAllowance.action).toBe('granted');
    expect(result.billingIdentity.appsTouched).toBe(2);
  });
});
