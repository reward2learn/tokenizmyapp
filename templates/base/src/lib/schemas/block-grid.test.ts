import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BLOCK_GRID,
  defaultContentGridForBlock,
  gridSizeProps,
  itemGridTemplateColumns,
  resolveBlockGrid,
  resolveContentGrid,
} from '@/lib/schemas/block-grid';

describe('resolveBlockGrid', () => {
  it('returns defaults when grid is missing', () => {
    expect(resolveBlockGrid(undefined)).toEqual(DEFAULT_BLOCK_GRID);
  });

  it('falls back md→xs and lg→md', () => {
    expect(resolveBlockGrid({ xs: 6 })).toEqual({ xs: 6, md: 6, lg: 6 });
    expect(resolveBlockGrid({ xs: 12, md: 4 })).toEqual({ xs: 12, md: 4, lg: 4 });
  });

  it('clamps spans to 1–12', () => {
    expect(resolveBlockGrid({ xs: 0, md: 99, lg: 3.7 })).toEqual({
      xs: 1,
      md: 12,
      lg: 4,
    });
  });
});

describe('resolveContentGrid', () => {
  it('uses block fallback when contentGrid is absent', () => {
    expect(resolveContentGrid(undefined, defaultContentGridForBlock('feature_grid'))).toEqual({
      xs: 12,
      md: 6,
      lg: 3,
    });
  });
});

describe('gridSizeProps', () => {
  it('returns resolved size object', () => {
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
