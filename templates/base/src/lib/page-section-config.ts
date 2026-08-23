import { ZodError } from 'zod';
import { blockConfigSchemas, parseBlockConfig } from '@/lib/schemas/block-config';
import type { BlockType } from '@/lib/page-catalog';

/** Block types allowed in page_sections for this deployment's Postgres enum. */
export const PAGE_SECTION_BLOCK_TYPES = [
  'hero',
  'metric_grid',
  'chart_financial',
  'lever_accordion',
  'action_checklist',
  'doc_markdown',
  'pnl_table',
  'z_report_form',
  'costs_form',
  'calendar_import',
  'chat_panel',
  'kpi_cards',
  'ops_admin_tabs',
  'review_blocks',
  'reports_rollup',
  'sheet_viewer',
  'marketing_hero',
  'capability_marquee',
  'product_showcase',
  'customer_proof',
  'faq',
  'cta_banner',
  'pricing_table',
  'testimonials',
  'feature_grid',
  'pack_table',
] as const;

export type PageSectionBlockType = (typeof PAGE_SECTION_BLOCK_TYPES)[number];

export function validatePageSectionConfig(
  blockType: string,
  config: Record<string, unknown>,
): Record<string, unknown> {
  const withDefaults: Record<string, unknown> =
    blockType === 'marketing_hero'
      ? {
          headline: 'Build software for your business',
          subheadline: 'Describe what you need and get a working app.',
          ...config,
        }
      : config;

  if (blockType in blockConfigSchemas) {
    try {
      return parseBlockConfig(blockType as BlockType, withDefaults) as Record<string, unknown>;
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(
          `Invalid config for ${blockType}: ${err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
        );
      }
      throw err;
    }
  }

  return withDefaults;
}
