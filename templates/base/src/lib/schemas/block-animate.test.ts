import { describe, expect, it } from 'vitest';
import {
  containerAnimateDelayMs,
  DEFAULT_BLOCK_ANIMATE,
  resolveBlockAnimate,
} from '@/lib/schemas/block-animate';

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

describe('containerAnimateDelayMs', () => {
  it('staggers containers from initial delay', () => {
    const config = resolveBlockAnimate({ delayMs: 100, staggerMs: 80 });
    expect(containerAnimateDelayMs(config, 0)).toBe(100);
    expect(containerAnimateDelayMs(config, 1)).toBe(180);
    expect(containerAnimateDelayMs(config, 2)).toBe(260);
  });
});
