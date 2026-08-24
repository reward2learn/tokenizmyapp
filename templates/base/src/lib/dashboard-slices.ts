/**
 * Client-safe dashboard slice catalog — no Node/fs imports.
 * Server generation lives in `@/domain/ai-content/dashboard-slice-generator`.
 */

export const DASHBOARD_SLICES = ['actionPhases', 'levers', 'targetRows'] as const;
export type DashboardSliceKey = (typeof DASHBOARD_SLICES)[number];

/** CMS block type → knowledge_snippets.dashboard_data key. */
export const BLOCK_TO_DASHBOARD_SLICE: Record<string, DashboardSliceKey> = {
  action_checklist: 'actionPhases',
  lever_accordion: 'levers',
  metric_grid: 'targetRows',
};
