import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@shared/lib/config/tenant', () => ({
  isPlatformApp: vi.fn(() => false),
  getTenantConfig: vi.fn(() => ({ slug: 'redrubybali' })),
}));

vi.mock('@/domain/billing/organization-service', () => ({
  resolveOrgForTenant: vi.fn(async () => ({ id: 'org_1', slug: 'acme', displayName: 'Acme' })),
}));

vi.mock('@/domain/billing/self-serve-billing-service', () => ({
  resolveTenantSelfServeBilling: vi.fn(async () => ({
    enabled: true,
    tenantSlug: 'redrubybali',
    config: { enabled: true },
  })),
}));

import { isPlatformApp } from '@shared/lib/config/tenant';
import { resolveOrgForTenant } from '@/domain/billing/organization-service';
import { resolveTenantSelfServeBilling } from '@/domain/billing/self-serve-billing-service';
import { requireOrgCreditPurchase } from '@/lib/auth/billing-guards';

vi.mock('@/lib/auth/guards', () => ({
  requireWriteAuth: vi.fn(async () => ({
    ok: true,
    session: { sub: 'user_1', tier: 'google' as const },
  })),
}));

vi.mock('@/lib/auth/jwt', () => ({
  sessionIsPlatformAdmin: vi.fn(() => false),
}));

describe('requireOrgCreditPurchase', () => {
  beforeEach(() => {
    (isPlatformApp as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (resolveTenantSelfServeBilling as ReturnType<typeof vi.fn>).mockResolvedValue({
      enabled: true,
      tenantSlug: 'redrubybali',
      config: { enabled: true },
    });
    (resolveOrgForTenant as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'org_1',
      slug: 'acme',
      displayName: 'Acme',
      logoUrl: null,
      createdAt: '',
      updatedAt: '',
    });
  });

  it('allows self-serve tenant users for their org', async () => {
    const result = await requireOrgCreditPurchase(new Request('http://localhost'), 'org_1');
    expect(result.ok).toBe(true);
  });

  it('rejects when self-serve is disabled', async () => {
    (resolveTenantSelfServeBilling as ReturnType<typeof vi.fn>).mockResolvedValue({
      enabled: false,
      tenantSlug: 'redrubybali',
      config: { enabled: false },
    });
    const result = await requireOrgCreditPurchase(new Request('http://localhost'), 'org_1');
    expect(result.ok).toBe(false);
  });

  it('rejects mismatched org id', async () => {
    (resolveOrgForTenant as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'org_other',
      slug: 'acme',
      displayName: 'Acme',
      logoUrl: null,
      createdAt: '',
      updatedAt: '',
    });
    const result = await requireOrgCreditPurchase(new Request('http://localhost'), 'org_1');
    expect(result.ok).toBe(false);
  });
});
