import { describe, expect, it } from 'vitest';
import { collectHeroNavLinks, parseHeroNavHref } from '@shared/lib/hero-nav-routes';

describe('parseHeroNavHref', () => {
  it('accepts single-segment internal paths', () => {
    expect(parseHeroNavHref('/summary')).toEqual({ path: '/summary', slug: 'summary' });
    expect(parseHeroNavHref('pricing')).toEqual({ path: '/pricing', slug: 'pricing' });
  });

  it('skips home, review parts, and infrastructure routes', () => {
    expect(parseHeroNavHref('/')).toBeNull();
    expect(parseHeroNavHref('/review/foo')).toBeNull();
    expect(parseHeroNavHref('/settings')).toBeNull();
    expect(parseHeroNavHref('https://example.com/foo')).toBeNull();
  });
});

describe('collectHeroNavLinks', () => {
  it('collects nav buttons from hero config and carousel slides', () => {
    const links = collectHeroNavLinks({
      navButtons: [{ label: 'Home', href: '/dashboard' }],
      slides: [{ navButtons: [{ label: 'Pricing', href: '/pricing' }] }],
    });
    expect(links).toEqual([
      { label: 'Home', href: '/dashboard' },
      { label: 'Pricing', href: '/pricing' },
    ]);
  });
});
