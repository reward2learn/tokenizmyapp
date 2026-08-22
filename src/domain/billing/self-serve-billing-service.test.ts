import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@shared/lib/config/tenant', () => ({
  isPlatformApp: vi.fn(() => true),
  getTenantConfig: vi.fn(() => ({ slug: 'tokenizmyapp' })),
}));

vi.mock('@/lib/billing/self-serve-billing', () => ({
  isSelfServeBillingEnabledFromEnv: vi.fn(() => false),
  parseSelfServeBillingConfig: (raw: unknown) => ({
    enabled: (raw as { enabled?: boolean })?.enabled === true,
  }),
}));

import { isPlatformApp } from '@shared/lib/config/tenant';
import { resolveTenantSelfServeBilling } from '@/domain/billing/self-serve-billing-service';

describe('resolveTenantSelfServeBilling', () => {
  beforeEach(() => {
    (isPlatformApp as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  it('reads enabled flag from tenant metadata on factory', async () => {
    const db = {
      $queryRawUnsafe: vi.fn(async () => [
        {
          slug: 'redrubybali',
          metadata: { config: { stripe: { selfServeBilling: { enabled: true } } } },
        },
      ]),
    };

    const result = await resolveTenantSelfServeBilling('org_1', db as never);
    expect(result.enabled).toBe(true);
    expect(result.tenantSlug).toBe('redrubybali');
  });
});
