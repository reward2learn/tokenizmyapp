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

/** Default config when creating a new section of the given block type. */
export function defaultConfigForBlock(blockType: string): Record<string, unknown> {
  switch (blockType) {
    case 'hero':
      return {
        headline: getHeroFallbackTitle(),
        accent: DEFAULT_HERO_FALLBACK_ACCENT,
        navButtons: DEFAULT_HERO_NAV_BUTTONS,
      };
    case 'faq':
      return { heading: 'Frequently asked questions', items: [] };
    case 'cta_banner':
      return { heading: 'Start building for free', ctaLabel: 'Start building', ctaHref: '/admin' };
    case 'pricing_table':
      return {
        heading: 'Pricing',
        subheading: 'Start for free and upgrade as you grow.',
        ctaHref: '/admin',
        highlightPlanId: 'business',
      };
    case 'capability_marquee':
      return { heading: 'Everything you need is built-in', rows: [] };
    case 'customer_proof':
      return { heading: 'Customer results', items: [] };
    case 'testimonials':
      return { heading: 'What customers say', items: [] };
    case 'product_showcase':
      return { heading: 'From idea to published app in minutes', items: [] };
    case 'feature_grid':
      return {
        heading: 'Everything the business runs on, in one tenant',
        subheading:
          'Private AI for planning and analysis, department apps generated on demand, and access controlled down to the record.',
      };
    case 'lever_accordion':
      return { title: 'The 5 Levers' };
    case 'marketing_hero':
      return {
        headline: 'Build software for your business',
        subheadline: 'Describe what you need and get a working app.',
      };
    case 'doc_markdown':
      return { source: 'executive-summary', title: 'Document' };
    case 'sheet_viewer':
      return { sheet: '', title: '' };
    case 'pack_table':
      return { table: '', title: '' };
    case 'chat_panel':
      return { emptyStatePrompt: 'How can I help?', suggestedPrompts: [] };
    case 'metric_grid':
      return { scenarios: [] };
    case 'chart_financial':
      return { variant: 'dashboard', scenario: 'conservative' };
    case 'kpi_cards':
      return { variant: 'dashboard' };
    default:
      return {};
  }
}
