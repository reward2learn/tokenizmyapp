import { z } from 'zod';

/**
 * CSS length for CMS size fields (height, etc.).
 * Accepts bare numbers (treated as px), "300px", "50%", "40vh", etc.
 */

const CSS_LENGTH_RE = /^\d+(\.\d+)?(px|%|vh|vw|rem|em)$/i;

export type CssLength = number | string;

export function parseCssLength(value: unknown): CssLength | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      const n = Number(trimmed);
      return Number.isFinite(n) && n >= 0 ? n : undefined;
    }
    if (CSS_LENGTH_RE.test(trimmed)) return trimmed;
  }
  return undefined;
}

const PERCENT_RE = /^(\d+(?:\.\d+)?)%$/i;

/**
 * Chart containers have no sized parent, so `%` would collapse.
 * Map `50%` → `50vh` at render time; stored CMS values stay as `%`.
 */
export function percentHeightToVh(value: CssLength): CssLength {
  if (typeof value !== 'string') return value;
  const match = PERCENT_RE.exec(value.trim());
  if (!match) return value;
  return `${match[1]}vh`;
}

/** Value safe for MUI `sx.height` / Chart.js container. */
export function cssLengthToSx(value: CssLength | undefined, fallback: number): number | string {
  if (value === undefined) return fallback;
  return value;
}

/** Chart height: same as cssLengthToSx, but `%` is treated as viewport height. */
export function cssLengthToChartSx(value: CssLength | undefined, fallback: number): number | string {
  if (value === undefined) return fallback;
  return percentHeightToVh(value);
}

export const cssLengthSchema = z
  .union([z.number().nonnegative(), z.string().min(1).max(32)])
  .optional()
  .transform((v, ctx) => {
    if (v === undefined) return undefined;
    const parsed = parseCssLength(v);
    if (parsed === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expected a number (px) or CSS length like 300px, 50%, 40vh',
      });
      return z.NEVER;
    }
    return parsed;
  });
