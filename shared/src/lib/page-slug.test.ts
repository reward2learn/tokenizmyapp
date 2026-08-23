import { describe, expect, it } from 'vitest';
import { pageSlugLookupCandidates, toStoragePageSlug } from '@shared/lib/page-slug';
import { cmsPageCacheKey } from '@shared/lib/cms-scope';

describe('pageSlugLookupCandidates', () => {
  it('returns only the prefixed slug when app id is set', () => {
    expect(pageSlugLookupCandidates('home', 'finance')).toEqual(['finance-home']);
  });

  it('returns route slug when no app id', () => {
    expect(pageSlugLookupCandidates('home', '')).toEqual(['home']);
  });
});

describe('cmsPageCacheKey', () => {
  it('isolates suite apps on the same tenant', () => {
    const tenant = 'acme';
    expect(cmsPageCacheKey({ tenantSlug: tenant, appId: 'finance' }, 'home')).not.toEqual(
      cmsPageCacheKey({ tenantSlug: tenant, appId: 'ceo-overview' }, 'home'),
    );
  });
});

describe('toStoragePageSlug', () => {
  it('prefixes route slug with app id', () => {
    expect(toStoragePageSlug('home', 'finance')).toBe('finance-home');
  });
});
