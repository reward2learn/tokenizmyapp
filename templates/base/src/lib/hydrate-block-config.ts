import { getChatStarterPrompt } from '@shared/lib/config/template-profile';
import {
  CAPABILITY_MARQUEE_DEFAULTS,
  CHART_FINANCIAL_DEFAULTS,
  CTA_BANNER_DEFAULTS,
  CUSTOMER_PROOF_DEFAULTS,
  DOC_MARKDOWN_DEFAULTS,
  FAQ_DEFAULTS,
  FEATURE_GRID_DEFAULTS,
  KPI_CARDS_DEFAULTS,
  LEVER_ACCORDION_DEFAULTS,
  MARKETING_HERO_DEFAULTS,
  PRICING_TABLE_DEFAULTS,
  PRODUCT_SHOWCASE_DEFAULTS,
  TESTIMONIALS_DEFAULTS,
} from '@/lib/block-display-defaults';
import { hydrateHeroConfigForEdit } from '@/lib/hero-config';
import { hydrateBlockAnimateForEdit } from '@/lib/schemas/block-animate';

function isUnsetString(value: unknown): boolean {
  return typeof value !== 'string';
}

/** Fill string fields only when missing from persisted config (not when explicitly ""). */
function fillStrings(
  config: Record<string, unknown>,
  defaults: Record<string, string>,
): Record<string, unknown> {
  const next = { ...config };
  for (const [key, value] of Object.entries(defaults)) {
    if (isUnsetString(next[key])) {
      next[key] = value;
    }
  }
  return next;
}

/**
 * Merge display defaults into block config for the CMS editor so fields match
 * what the live block renders. Only fills keys that are absent — never
 * overwrites values the user has saved (including empty strings).
 */
export function hydrateBlockConfigForEdit(
  blockType: string,
  config: Record<string, unknown>,
): Record<string, unknown> {
  const withAnimate = hydrateBlockAnimateForEdit(config);

  switch (blockType) {
    case 'hero':
      return hydrateHeroConfigForEdit(withAnimate);

    case 'marketing_hero':
      return fillStrings(withAnimate, MARKETING_HERO_DEFAULTS);

    case 'faq':
      return fillStrings(withAnimate, FAQ_DEFAULTS);

    case 'cta_banner':
      return fillStrings(withAnimate, CTA_BANNER_DEFAULTS);

    case 'pricing_table':
      return fillStrings(withAnimate, PRICING_TABLE_DEFAULTS);

    case 'capability_marquee':
      return fillStrings(withAnimate, CAPABILITY_MARQUEE_DEFAULTS);

    case 'customer_proof':
      return fillStrings(withAnimate, CUSTOMER_PROOF_DEFAULTS);

    case 'testimonials':
      return fillStrings(withAnimate, TESTIMONIALS_DEFAULTS);

    case 'product_showcase':
      return fillStrings(withAnimate, PRODUCT_SHOWCASE_DEFAULTS);

    case 'feature_grid':
      return fillStrings(withAnimate, FEATURE_GRID_DEFAULTS);

    case 'doc_markdown': {
      const next = fillStrings(withAnimate, DOC_MARKDOWN_DEFAULTS);
      if (isUnsetString(next.title) && typeof next.source === 'string' && next.source.trim()) {
        const derived = next.source
          .replace(/\.(html|md)$/i, '')
          .split(/[-_]/)
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
        if (derived) next.title = derived;
      }
      return next;
    }

    case 'chat_panel': {
      const next = { ...withAnimate };
      if (isUnsetString(next.emptyStatePrompt)) {
        next.emptyStatePrompt = getChatStarterPrompt();
      }
      if (!Array.isArray(next.suggestedPrompts)) {
        next.suggestedPrompts = [];
      }
      return next;
    }

    case 'lever_accordion':
      return fillStrings(withAnimate, LEVER_ACCORDION_DEFAULTS);

    case 'chart_financial':
      return fillStrings(withAnimate, CHART_FINANCIAL_DEFAULTS);

    case 'kpi_cards':
      return fillStrings(withAnimate, KPI_CARDS_DEFAULTS);

    case 'sheet_viewer':
    case 'pack_table':
      return { ...withAnimate };

    default:
      return { ...withAnimate };
  }
}
