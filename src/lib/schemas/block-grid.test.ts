import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BLOCK_GRID,
  defaultContentGridForBlock,
  gridOffsetProps,
  gridSizeProps,
  itemGridTemplateColumns,
  resolveBlockGrid,
  resolveContentGrid,
  spanOffset,
} from '@/lib/schemas/block-grid';

describe('resolveBlockGrid', () => {
  it('returns defaults when grid is missing (full width + center align)', () => {
    expect(resolveBlockGrid(undefined)).toEqual(DEFAULT_BLOCK_GRID);
    expect(resolveBlockGrid(undefined).align).toBe('center');
  });

  it('falls back md→xs and lg→md', () => {
    expect(resolveBlockGrid({ xs: 6 })).toEqual({ xs: 6, md: 6, lg: 6, align: 'center' });
    expect(resolveBlockGrid({ xs: 12, md: 4 })).toEqual({ xs: 12, md: 4, lg: 4, align: 'center' });
  });

  it('clamps spans to 1–12', () => {
    expect(resolveBlockGrid({ xs: 0, md: 99, lg: 3.7 })).toEqual({
      xs: 1,
      md: 12,
      lg: 4,
      align: 'center',
    });
  });

  it('preserves explicit align', () => {
    expect(resolveBlockGrid({ xs: 6, align: 'end' }).align).toBe('end');
    expect(resolveBlockGrid({ xs: 6, align: 'start' }).align).toBe('start');
  });
});

describe('spanOffset / gridOffsetProps', () => {
  it('centers a 6-col span', () => {
    expect(spanOffset(6, 'center')).toBe(3);
    expect(gridOffsetProps({ xs: 6, md: 6, lg: 6 })).toEqual({ xs: 3, md: 3, lg: 3 });
  });

  it('full width has no offset', () => {
    expect(spanOffset(12, 'center')).toBe(0);
    expect(gridOffsetProps({ xs: 12 })).toEqual({ xs: 0, md: 0, lg: 0 });
  });

  it('start and end offsets', () => {
    expect(spanOffset(4, 'start')).toBe(0);
    expect(spanOffset(4, 'end')).toBe(8);
  });
});

describe('resolveContentGrid', () => {
  it('uses block fallback when contentGrid is absent', () => {
    expect(resolveContentGrid(undefined, defaultContentGridForBlock('feature_grid'))).toEqual({
      xs: 12,
      md: 6,
      lg: 3,
      align: 'center',
    });
  });
});

describe('gridSizeProps', () => {
  it('returns resolved size object without align', () => {
    expect(gridSizeProps({ xs: 12, md: 6, lg: 4 })).toEqual({ xs: 12, md: 6, lg: 4 });
  });
});

describe('itemGridTemplateColumns', () => {
  it('maps span to equal column counts', () => {
    expect(itemGridTemplateColumns({ xs: 12, md: 6, lg: 3 })).toEqual({
      xs: 'repeat(1, minmax(0, 1fr))',
      md: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(4, minmax(0, 1fr))',
    });
    expect(itemGridTemplateColumns({ xs: 12, md: 6, lg: 4 })).toEqual({
      xs: 'repeat(1, minmax(0, 1fr))',
      md: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(3, minmax(0, 1fr))',
    });
  });
});
