import { describe, expect, it } from 'vitest';
import {
  cssLengthSchema,
  cssLengthToChartSx,
  cssLengthToSx,
  parseCssLength,
  percentHeightToVh,
} from '@/lib/schemas/css-length';

describe('parseCssLength', () => {
  it('accepts numbers as px', () => {
    expect(parseCssLength(300)).toBe(300);
    expect(parseCssLength('320')).toBe(320);
  });

  it('accepts css units including %', () => {
    expect(parseCssLength('50%')).toBe('50%');
    expect(parseCssLength('40vh')).toBe('40vh');
    expect(parseCssLength('300px')).toBe('300px');
  });

  it('rejects invalid values', () => {
    expect(parseCssLength('auto')).toBeUndefined();
    expect(parseCssLength(-1)).toBeUndefined();
    expect(parseCssLength('')).toBeUndefined();
  });
});

describe('cssLengthSchema', () => {
  it('parses height fields', () => {
    expect(cssLengthSchema.parse(300)).toBe(300);
    expect(cssLengthSchema.parse('50%')).toBe('50%');
    expect(cssLengthSchema.parse(undefined)).toBeUndefined();
  });
});

describe('cssLengthToSx', () => {
  it('falls back when unset', () => {
    expect(cssLengthToSx(undefined, 300)).toBe(300);
    expect(cssLengthToSx('50%', 300)).toBe('50%');
  });
});

describe('percentHeightToVh / cssLengthToChartSx', () => {
  it('maps percent to viewport height for chart containers', () => {
    expect(percentHeightToVh('50%')).toBe('50vh');
    expect(percentHeightToVh('40.5%')).toBe('40.5vh');
    expect(cssLengthToChartSx('50%', 300)).toBe('50vh');
  });

  it('leaves px, vh, and numbers unchanged', () => {
    expect(percentHeightToVh(300)).toBe(300);
    expect(percentHeightToVh('40vh')).toBe('40vh');
    expect(percentHeightToVh('300px')).toBe('300px');
    expect(cssLengthToChartSx(320, 300)).toBe(320);
  });
});
