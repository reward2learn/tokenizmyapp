import { describe, expect, it } from 'vitest';
import {
  cmsPageCacheKey,
  normalizeCmsScope,
  resolveRegistryTenantSlug,
} from '@shared/lib/cms-scope';

describe('resolveRegistryTenantSlug', () => {
  it('strips suite app suffix from deployment slug', () => {
    expect(resolveRegistryTenantSlug('tokenizmyapp-finance', 'finance')).toBe('tokenizmyapp');
  });

  it('returns slug unchanged when no app id', () => {
    expect(resolveRegistryTenantSlug('tokenizmyapp', '')).toBe('tokenizmyapp');
  });

  it('returns slug unchanged when suffix does not match app id', () => {
    expect(resolveRegistryTenantSlug('tokenizmyapp-finance', 'hr')).toBe('tokenizmyapp-finance');
  });
});

describe('normalizeCmsScope', () => {
  it('maps deployment slug to registry tenant slug for suite apps', () => {
    const scope = normalizeCmsScope({ tenantSlug: 'tokenizmyapp-finance', appId: 'finance' });
    expect(scope.tenantSlug).toBe('tokenizmyapp');
    expect(scope.deploymentSlug).toBe('tokenizmyapp-finance');
    expect(scope.appId).toBe('finance');
  });
});

describe('cmsPageCacheKey', () => {
  it('uses deployment slug in the cache key', () => {
    const scope = normalizeCmsScope({ tenantSlug: 'tokenizmyapp-finance', appId: 'finance' });
    expect(cmsPageCacheKey(scope, 'summary')).toBe('tokenizmyapp-finance:finance:summary');
  });
});
