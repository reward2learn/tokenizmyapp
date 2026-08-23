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
      return { heading: 'Get started', ctaLabel: 'Start', ctaHref: '/admin' };
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
