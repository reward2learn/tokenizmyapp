import { z } from 'zod';

/** Full-width page section / single-column content by default. */
export const DEFAULT_BLOCK_GRID = {
  xs: 12,
  md: 12,
  lg: 12,
} as const;

/** Span out of 12 columns per breakpoint (MUI Grid2 size). */
export type BlockGridSpan = {
  xs?: number;
  md?: number;
  lg?: number;
};

export type ResolvedBlockGrid = {
  xs: number;
  md: number;
  lg: number;
};

const spanValue = z.number().optional();

export const blockGridSchema = z.object({
  xs: spanValue,
  md: spanValue,
  lg: spanValue,
});

function clampSpan(n: number | undefined): number | undefined {
  if (n === undefined || !Number.isFinite(n)) return undefined;
  return Math.min(12, Math.max(1, Math.round(n)));
}

/**
 * Resolve spans with fallback chain: xs→12, md→xs, lg→md.
 */
export function resolveBlockGrid(grid: unknown): ResolvedBlockGrid {
  const parsed = blockGridSchema.safeParse(grid);
  const partial = parsed.success ? parsed.data : {};
  const xs = clampSpan(partial.xs) ?? DEFAULT_BLOCK_GRID.xs;
  const md = clampSpan(partial.md) ?? xs;
  const lg = clampSpan(partial.lg) ?? md;
  return { xs, md, lg };
}

/** Block-specific contentGrid defaults matching prior hardcoded layouts. */
export function defaultContentGridForBlock(blockType: string): ResolvedBlockGrid {
  switch (blockType) {
    case 'feature_grid':
      // Was CSS: 1 / 2 / 4 cols → spans 12 / 6 / 3
      return { xs: 12, md: 6, lg: 3 };
    case 'product_showcase':
    case 'customer_proof':
      // Was Grid size xs:12 sm:6 md:4
      return { xs: 12, md: 6, lg: 4 };
    case 'pricing_table':
      // Was Grid size xs:12 sm:6 md:3
      return { xs: 12, md: 6, lg: 3 };
    case 'kpi_cards':
      // Was 2 cols xs / ~5 md — closest with span→cols is 2 / 6
      return { xs: 6, md: 2, lg: 2 };
    default:
      return { ...DEFAULT_BLOCK_GRID };
  }
}

export function resolveContentGrid(
  contentGrid: unknown,
  fallback: BlockGridSpan = DEFAULT_BLOCK_GRID,
): ResolvedBlockGrid {
  if (contentGrid === undefined || contentGrid === null) {
    return resolveBlockGrid(fallback);
  }
  return resolveBlockGrid(contentGrid);
}

/** MUI Grid2 `size` prop for page section wrappers (and item cells). */
export function gridSizeProps(grid: unknown): ResolvedBlockGrid {
  return resolveBlockGrid(grid);
}

/**
 * CSS gridTemplateColumns for equal inner cells derived from span.
 * Columns at breakpoint = Math.max(1, Math.floor(12 / span))
 * e.g. lg:4 → 3 cols, md:6 → 2 cols, xs:12 → 1 col.
 */
export function itemGridTemplateColumns(grid: unknown): {
  xs: string;
  md: string;
  lg: string;
} {
  const resolved = resolveBlockGrid(grid);
  const cols = (span: number) => Math.max(1, Math.floor(12 / span));
  return {
    xs: `repeat(${cols(resolved.xs)}, minmax(0, 1fr))`,
    md: `repeat(${cols(resolved.md)}, minmax(0, 1fr))`,
    lg: `repeat(${cols(resolved.lg)}, minmax(0, 1fr))`,
  };
}

export function hydrateBlockGridForEdit(
  config: Record<string, unknown>,
  blockType?: string,
): Record<string, unknown> {
  const grid = resolveBlockGrid(config.grid);
  const contentFallback = blockType
    ? defaultContentGridForBlock(blockType)
    : DEFAULT_BLOCK_GRID;
  const contentGrid = resolveContentGrid(config.contentGrid, contentFallback);
  return { ...config, grid, contentGrid };
}

export function mergeGridIntoConfig(
  config: Record<string, unknown>,
  grid: ResolvedBlockGrid,
): Record<string, unknown> {
  return { ...config, grid };
}

export function mergeContentGridIntoConfig(
  config: Record<string, unknown>,
  contentGrid: ResolvedBlockGrid,
): Record<string, unknown> {
  return { ...config, contentGrid };
}
