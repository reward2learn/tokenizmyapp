import { describe, expect, it } from 'vitest';
import { DEFAULT_BLOCK_ANIMATE, resolveBlockAnimate } from '@/lib/schemas/block-animate';

describe('resolveBlockAnimate', () => {
  it('returns defaults when animate is missing', () => {
    expect(resolveBlockAnimate(undefined)).toEqual(DEFAULT_BLOCK_ANIMATE);
  });

  it('merges partial overrides', () => {
    expect(resolveBlockAnimate({ alphaFrom: 0.2, translateYFrom: 50 })).toEqual({
      ...DEFAULT_BLOCK_ANIMATE,
      alphaFrom: 0.2,
      translateYFrom: 50,
    });
  });
});
