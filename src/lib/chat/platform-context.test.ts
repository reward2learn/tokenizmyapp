import { describe, expect, it } from 'vitest';
import { detectPlatformQuery } from '@/lib/chat/platform-context';

describe('detectPlatformQuery', () => {
  it('matches tenant and app inventory questions', () => {
    expect(detectPlatformQuery('how many apps and tenants do i currently have')).toBe(true);
    expect(detectPlatformQuery('List all deployed tenants')).toBe(true);
    expect(detectPlatformQuery('Which suite apps are in error?')).toBe(true);
    expect(detectPlatformQuery('Show me the tenant registry')).toBe(true);
  });

  it('does not match unrelated business questions', () => {
    expect(detectPlatformQuery('What was revenue last month?')).toBe(false);
    expect(detectPlatformQuery('Summarize the business review')).toBe(false);
    expect(detectPlatformQuery('Hello')).toBe(false);
  });
});
