import { describe, expect, it } from 'vitest';
import { effectiveUserGroups, sessionIsPlatformAdmin } from '@/lib/auth/jwt';

describe('effectiveUserGroups', () => {
  it('adds platform-admin when the session is a platform admin by role claim', () => {
    expect(effectiveUserGroups(['finance'], true)).toEqual(['finance', 'platform-admin']);
  });

  it('does not duplicate platform-admin when already present', () => {
    expect(effectiveUserGroups(['platform-admin', 'finance'], true)).toEqual([
      'platform-admin',
      'finance',
    ]);
  });

  it('leaves non-admin groups unchanged', () => {
    expect(effectiveUserGroups(['finance'], false)).toEqual(['finance']);
  });
});

describe('sessionIsPlatformAdmin', () => {
  it('returns true for platformAdmin claim without group membership', () => {
    expect(sessionIsPlatformAdmin({ platformAdmin: true, groups: [] })).toBe(true);
  });
});
