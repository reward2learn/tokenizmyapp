import { z } from 'zod';

/** Default scroll-reveal: fade in while rising 100px from below. */
export const DEFAULT_BLOCK_ANIMATE = {
  enabled: true,
  translateYFrom: 100,
  translateYTo: 0,
  alphaFrom: 0,
  alphaTo: 1,
  durationMs: 600,
  delayMs: 0,
} as const;

export type BlockAnimateConfig = {
  enabled: boolean;
  translateYFrom: number;
  translateYTo: number;
  alphaFrom: number;
  alphaTo: number;
  durationMs: number;
  delayMs: number;
};

export const blockAnimateSchema = z.object({
  enabled: z.boolean().optional(),
  translateYFrom: z.number().optional(),
  translateYTo: z.number().optional(),
  alphaFrom: z.number().min(0).max(1).optional(),
  alphaTo: z.number().min(0).max(1).optional(),
  durationMs: z.number().min(0).max(5000).optional(),
  delayMs: z.number().min(0).max(5000).optional(),
});

export function resolveBlockAnimate(animate: unknown): BlockAnimateConfig {
  const parsed = blockAnimateSchema.safeParse(animate);
  const partial = parsed.success ? parsed.data : {};
  return {
    enabled: partial.enabled ?? DEFAULT_BLOCK_ANIMATE.enabled,
    translateYFrom: partial.translateYFrom ?? DEFAULT_BLOCK_ANIMATE.translateYFrom,
    translateYTo: partial.translateYTo ?? DEFAULT_BLOCK_ANIMATE.translateYTo,
    alphaFrom: partial.alphaFrom ?? DEFAULT_BLOCK_ANIMATE.alphaFrom,
    alphaTo: partial.alphaTo ?? DEFAULT_BLOCK_ANIMATE.alphaTo,
    durationMs: partial.durationMs ?? DEFAULT_BLOCK_ANIMATE.durationMs,
    delayMs: partial.delayMs ?? DEFAULT_BLOCK_ANIMATE.delayMs,
  };
}

export function hydrateBlockAnimateForEdit(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const animate = resolveBlockAnimate(config.animate);
  return { ...config, animate };
}

export function mergeAnimateIntoConfig(
  config: Record<string, unknown>,
  animate: BlockAnimateConfig,
): Record<string, unknown> {
  return { ...config, animate };
}
