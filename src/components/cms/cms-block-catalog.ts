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

/** Default config when creating a new section of the given block type. */
export function defaultConfigForBlock(blockType: string): Record<string, unknown> {
  const animate = { ...DEFAULT_BLOCK_ANIMATE };

  switch (blockType) {
    case 'hero':
      return {
        animate,
        headline: getHeroFallbackTitle(),
        accent: DEFAULT_HERO_FALLBACK_ACCENT,
        navButtons: DEFAULT_HERO_NAV_BUTTONS,
      };
    case 'faq':
      return { animate, heading: 'Frequently asked questions', items: [] };
    case 'cta_banner':
      return { animate, heading: 'Start building for free', ctaLabel: 'Start building', ctaHref: '/admin' };
    case 'pricing_table':
      return {
        animate,
        heading: 'Pricing',
        subheading: 'Start for free and upgrade as you grow.',
        ctaHref: '/admin',
        highlightPlanId: 'business',
      };
    case 'capability_marquee':
      return { animate, heading: 'Everything you need is built-in', rows: [] };
    case 'customer_proof':
      return { animate, heading: 'Customer results', items: [] };
    case 'testimonials':
      return { animate, heading: 'What customers say', items: [] };
    case 'product_showcase':
      return { animate, heading: 'From idea to published app in minutes', items: [] };
    case 'feature_grid':
      return {
        animate,
        heading: 'Everything the business runs on, in one tenant',
        subheading:
          'Private AI for planning and analysis, department apps generated on demand, and access controlled down to the record.',
      };
    case 'lever_accordion':
      return { animate, title: 'The 5 Levers' };
    case 'marketing_hero':
      return {
        animate,
        headline: 'Build software for your business',
        subheadline: 'Describe what you need and get a working app.',
      };
    case 'doc_markdown':
      return { animate, source: 'executive-summary', title: 'Document' };
    case 'sheet_viewer':
      return { animate, sheet: '', title: '' };
    case 'pack_table':
      return { animate, table: '', title: '' };
    case 'chat_panel':
      return { animate, emptyStatePrompt: 'How can I help?', suggestedPrompts: [] };
    case 'metric_grid':
      return { animate, scenarios: [] };
    case 'chart_financial':
      return { animate, variant: 'dashboard', scenario: 'conservative' };
    case 'kpi_cards':
      return { animate, variant: 'dashboard' };
    default:
      return { animate };
  }
}
