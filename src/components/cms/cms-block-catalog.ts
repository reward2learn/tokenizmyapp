/** Block types available when adding a new page section. */
export const CMS_ADDABLE_BLOCKS = [
  'marketing_hero',
  'faq',
  'product_showcase',
  'capability_marquee',
  'cta_banner',
  'pricing_table',
  'customer_proof',
  'testimonials',
  'hero',
  'doc_markdown',
  'feature_grid',
  'sheet_viewer',
  'pack_table',
  'metric_grid',
  'chart_financial',
  'kpi_cards',
  'chat_panel',
] as const;

export type CmsAddableBlock = (typeof CMS_ADDABLE_BLOCKS)[number];

import { DEFAULT_HERO_FALLBACK_ACCENT, DEFAULT_HERO_NAV_BUTTONS, getHeroFallbackTitle } from '@/lib/hero-config';
import { DEFAULT_BLOCK_ANIMATE } from '@/lib/schemas/block-animate';
import { DEFAULT_BLOCK_GRID, defaultContentGridForBlock } from '@/lib/schemas/block-grid';

/** Default config when creating a new section of the given block type. */
export function defaultConfigForBlock(blockType: string): Record<string, unknown> {
  const animate = { ...DEFAULT_BLOCK_ANIMATE };
  const grid = { ...DEFAULT_BLOCK_GRID };
  const contentGrid = { ...defaultContentGridForBlock(blockType) };
  const base = { animate, grid, contentGrid };

  switch (blockType) {
    case 'hero':
      return {
        ...base,
        headline: getHeroFallbackTitle(),
        accent: DEFAULT_HERO_FALLBACK_ACCENT,
        navButtons: DEFAULT_HERO_NAV_BUTTONS,
      };
    case 'faq':
      return { ...base, heading: 'Frequently asked questions', items: [] };
    case 'cta_banner':
      return { ...base, heading: 'Start building for free', ctaLabel: 'Start building', ctaHref: '/admin' };
    case 'pricing_table':
      return {
        ...base,
        heading: 'Pricing',
        subheading: 'Start for free and upgrade as you grow.',
        ctaHref: '/admin',
        highlightPlanId: 'business',
      };
    case 'capability_marquee':
      return { ...base, heading: 'Everything you need is built-in', rows: [] };
    case 'customer_proof':
      return { ...base, heading: 'Customer results', items: [] };
    case 'testimonials':
      return { ...base, heading: 'What customers say', items: [] };
    case 'product_showcase':
      return { ...base, heading: 'From idea to published app in minutes', items: [] };
    case 'feature_grid':
      return {
        ...base,
        heading: 'Everything the business runs on, in one tenant',
        subheading:
          'Private AI for planning and analysis, department apps generated on demand, and access controlled down to the record.',
      };
    case 'lever_accordion':
      return { ...base, title: 'The 5 Levers' };
    case 'action_checklist':
      return {
        ...base,
        heading: 'Step-by-Step Action Plan',
        subheading:
          'Three phases from survival to sustainable profitability. Click each phase to expand.',
      };
    case 'marketing_hero':
      return {
        ...base,
        headline: 'Build software for your business',
        subheadline: 'Describe what you need and get a working app.',
      };
    case 'doc_markdown':
      return { ...base, source: 'executive-summary', title: 'Document' };
    case 'sheet_viewer':
      return { ...base, sheet: '', title: '' };
    case 'pack_table':
      return { ...base, table: '', title: '' };
    case 'chat_panel':
      return { ...base, emptyStatePrompt: 'How can I help?', suggestedPrompts: [] };
    case 'metric_grid':
      return { ...base, scenarios: [] };
    case 'chart_financial':
      return { ...base, variant: 'dashboard', scenario: 'conservative' };
    case 'kpi_cards':
      return { ...base, variant: 'dashboard' };
    default:
      return { ...base };
  }
}
