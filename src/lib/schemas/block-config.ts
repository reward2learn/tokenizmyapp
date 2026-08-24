import { z } from 'zod';
import type { BlockType } from '@/lib/page-catalog';
import { heroConfigSchema } from '@/lib/hero-config';

const minTierSchema = z.enum(['public', 'pin', 'google']).optional();

export { heroConfigSchema };

export const metricGridConfigSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  scenarios: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        target: z.string().optional(),
      }),
    )
    .optional(),
  minTier: minTierSchema,
});

export const chartFinancialConfigSchema = z.object({
  scenario: z
    .enum(['conservative', 'realistic', 'aspirational', 'actual'])
    .optional(),
  height: z.number().optional(),
  variant: z.enum(['dashboard', 'ops']).optional(),
  minTier: minTierSchema,
});

export const leverAccordionConfigSchema = z.object({
  title: z.string().optional(),
  subheading: z.string().optional(),
  minTier: minTierSchema,
});

export const actionChecklistConfigSchema = z.object({
  /** Section chrome — rendered above phases loaded from dashboard_data. */
  heading: z.string().optional(),
  subheading: z.string().optional(),
  priority: z.enum(['P0', 'P1', 'P2']).optional(),
  minTier: minTierSchema,
});

export const docMarkdownConfigSchema = z.object({
  source: z.string().optional(),
  markdown: z.string().optional(),
  title: z.string().optional(),
  /** When true, AI Content Generation refreshes this section from current CMS markdown. */
  aiRegenerate: z.boolean().optional(),
  minTier: minTierSchema,
});

export const kpiCardsConfigSchema = z.object({
  period: z.string().optional(),
  variant: z.enum(['dashboard', 'ops']).optional(),
  minTier: minTierSchema,
});

export const pnlTableConfigSchema = z.object({
  period: z.string().optional(),
  minTier: minTierSchema,
});

export const opsAdminTabsConfigSchema = z.object({});
export const zReportFormConfigSchema = z.object({});
export const costsFormConfigSchema = z.object({});
export const calendarImportConfigSchema = z.object({});
export const chatPanelConfigSchema = z.object({
  /** Overrides the template-stamped chat starter when set on the page section. */
  emptyStatePrompt: z.string().max(300).optional(),
  suggestedPrompts: z.array(z.string().max(200)).max(5).optional(),
  /** When converted from another block type, records the original data source. */
  dataContext: z
    .object({
      blockType: z.string(),
      config: z.record(z.unknown()).optional(),
    })
    .optional(),
  minTier: minTierSchema,
});
export const reviewBlocksConfigSchema = z.object({});
export const reportsRollupConfigSchema = z.object({
  minTier: minTierSchema,
});

export const sheetViewerConfigSchema = z.object({
  sheet: z.string().optional(),
  columns: z.array(z.string()).optional(),
  title: z.string().optional(),
  minTier: minTierSchema,
});

export const packTableConfigSchema = z.object({
  table: z.string(),
  title: z.string().optional(),
  pageSize: z.number().min(1).max(500).optional(),
  readonly: z.boolean().optional(),
  columns: z.array(z.string()).optional(),
  minTier: minTierSchema,
});

export const featureGridConfigSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  minTier: minTierSchema,
});

// ── Marketing landing blocks (roadmap Phase 7) ──
//
// Each block also reads its own config defensively at render time, so these
// schemas are the strict contract for authored page data rather than the only
// guard. Config reaching a block from the database has not been through here.

export const marketingHeroConfigSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  audiences: z.array(z.string()).optional(),
  quickStarts: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  minTier: minTierSchema,
});

export const capabilityMarqueeConfigSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  rows: z.array(z.array(z.string())).optional(),
  minTier: minTierSchema,
});

export const productShowcaseConfigSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  items: z
    .array(z.object({ icon: z.string().optional(), title: z.string(), body: z.string() }))
    .optional(),
  minTier: minTierSchema,
});

export const customerProofConfigSchema = z.object({
  heading: z.string().optional(),
  /**
   * Real, permissioned customers only. Empty is the correct default — the
   * block renders nothing rather than inventing social proof.
   */
  items: z
    .array(
      z.object({
        industry: z.string(),
        name: z.string(),
        metrics: z.array(z.object({ value: z.string(), label: z.string() })),
        href: z.string().optional(),
      }),
    )
    .optional(),
  minTier: minTierSchema,
});

export const faqConfigSchema = z.object({
  heading: z.string().optional(),
  items: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  minTier: minTierSchema,
});

export const pricingTableConfigSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  ctaHref: z.string().optional(),
  /** Plan id to mark "Most popular". */
  highlightPlanId: z.string().optional(),
  minTier: minTierSchema,
});

export const ctaBannerConfigSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  minTier: minTierSchema,
});

export const testimonialsConfigSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        quote: z.string(),
        name: z.string().optional(),
        role: z.string().optional(),
        avatarUrl: z.string().optional(),
        rating: z.number().min(0).max(5).optional(),
      }),
    )
    .optional(),
  minTier: minTierSchema,
});

export const blockConfigSchemas = {
  hero: heroConfigSchema,
  metric_grid: metricGridConfigSchema,
  chart_financial: chartFinancialConfigSchema,
  lever_accordion: leverAccordionConfigSchema,
  action_checklist: actionChecklistConfigSchema,
  doc_markdown: docMarkdownConfigSchema,
  kpi_cards: kpiCardsConfigSchema,
  pnl_table: pnlTableConfigSchema,
  ops_admin_tabs: opsAdminTabsConfigSchema,
  z_report_form: zReportFormConfigSchema,
  costs_form: costsFormConfigSchema,
  calendar_import: calendarImportConfigSchema,
  chat_panel: chatPanelConfigSchema,
  review_blocks: reviewBlocksConfigSchema,
  reports_rollup: reportsRollupConfigSchema,
  sheet_viewer: sheetViewerConfigSchema,
  pack_table: packTableConfigSchema,
  feature_grid: featureGridConfigSchema,
  testimonials: testimonialsConfigSchema,
  marketing_hero: marketingHeroConfigSchema,
  capability_marquee: capabilityMarqueeConfigSchema,
  product_showcase: productShowcaseConfigSchema,
  customer_proof: customerProofConfigSchema,
  faq: faqConfigSchema,
  cta_banner: ctaBannerConfigSchema,
  pricing_table: pricingTableConfigSchema,
} as const satisfies Record<BlockType, z.ZodType>;

export type BlockConfigMap = {
  [K in BlockType]: z.infer<(typeof blockConfigSchemas)[K]>;
};

export function parseBlockConfig<T extends BlockType>(
  blockType: T,
  config: Record<string, unknown>,
): BlockConfigMap[T] {
  return blockConfigSchemas[blockType].parse(config) as BlockConfigMap[T];
}
