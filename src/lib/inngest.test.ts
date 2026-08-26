import { describe, expect, it } from 'vitest';
import { isInngestAuthError } from '@/lib/inngest';

describe('isInngestAuthError', () => {
  it('detects invalid event key responses', () => {
    expect(isInngestAuthError(new Error('Inngest API Error: 401 Event key not found'))).toBe(true);
    expect(isInngestAuthError('401 Unauthorized')).toBe(true);
    expect(isInngestAuthError(new Error('signing key mismatch'))).toBe(true);
  });

  it('ignores unrelated failures', () => {
    expect(isInngestAuthError(new Error('network timeout'))).toBe(false);
    expect(isInngestAuthError(new Error('500 Internal Server Error'))).toBe(false);
  });
});
