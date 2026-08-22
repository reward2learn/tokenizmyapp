import { describe, expect, it } from 'vitest';
import { normalizeAuthTier, resolveViewerAuthTier, tierAllowsAccess } from '@/lib/auth/tier-access';

describe('tierAllowsAccess', () => {
  it('lets Google users see PIN and public nav items', () => {
    expect(tierAllowsAccess('google', 'pin')).toBe(true);
    expect(tierAllowsAccess('google', 'public')).toBe(true);
    expect(tierAllowsAccess('google', 'google')).toBe(true);
  });

  it('blocks PIN users from Google-only nav items but not PIN/public', () => {
    expect(tierAllowsAccess('pin', 'google')).toBe(false);
    expect(tierAllowsAccess('pin', 'pin')).toBe(true);
    expect(tierAllowsAccess('pin', 'public')).toBe(true);
  });

  it('keeps public visitors on public items only', () => {
    expect(tierAllowsAccess('public', 'public')).toBe(true);
    expect(tierAllowsAccess('public', 'pin')).toBe(false);
    expect(tierAllowsAccess('public', 'google')).toBe(false);
  });
});

describe('resolveViewerAuthTier', () => {
  it('prefers the signed-in session over a stale client query hint', () => {
    expect(resolveViewerAuthTier({ tier: 'google' }, 'public')).toBe('google');
    expect(resolveViewerAuthTier({ tier: 'pin' }, 'google')).toBe('pin');
  });

  it('falls back to the query tier for signed-out visitors', () => {
    expect(resolveViewerAuthTier(null, 'public')).toBe('public');
  });
});

describe('normalizeAuthTier', () => {
  it('defaults unknown values to public', () => {
    expect(normalizeAuthTier('PIN')).toBe('public');
    expect(normalizeAuthTier(undefined)).toBe('public');
  });
});
