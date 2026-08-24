/**
 * Display defaults mirrored from block components — used when hydrating CMS
 * block settings so the editor shows what users actually see on the page.
 */

export const MARKETING_HERO_DEFAULTS = {
  headline: 'Build software for your business',
  subheadline: 'Describe what you need and get a working app.',
  placeholder: 'Describe the app you want to build…',
  ctaLabel: 'Try it',
  ctaHref: '/admin',
} as const;

export const FAQ_DEFAULTS = {
  heading: 'Frequently asked questions',
} as const;

export const CTA_BANNER_DEFAULTS = {
  heading: 'Start building for free',
  ctaLabel: 'Start building',
  ctaHref: '/admin',
} as const;

export const PRICING_TABLE_DEFAULTS = {
  heading: 'Pricing',
  subheading: 'Start for free and upgrade as you grow.',
  ctaHref: '/admin',
  highlightPlanId: 'business',
} as const;

export const CAPABILITY_MARQUEE_DEFAULTS = {
  heading: 'Everything you need is built-in',
} as const;

export const CUSTOMER_PROOF_DEFAULTS = {
  heading: 'Customer results',
} as const;

export const TESTIMONIALS_DEFAULTS = {
  heading: 'What customers say',
} as const;

export const PRODUCT_SHOWCASE_DEFAULTS = {
  heading: 'From idea to published app in minutes',
} as const;

export const FEATURE_GRID_DEFAULTS = {
  heading: 'Everything the business runs on, in one tenant',
  subheading:
    'Private AI for planning and analysis, department apps generated on demand, and access controlled down to the record.',
} as const;

export const DOC_MARKDOWN_DEFAULTS = {
  source: 'executive-summary',
  title: 'Document',
} as const;

export const LEVER_ACCORDION_DEFAULTS = {
  title: 'The 5 Levers',
  subheading:
    'Click each lever to see the actionable steps. Five interconnected strategies driving the turnaround.',
} as const;

export const ACTION_CHECKLIST_DEFAULTS = {
  heading: 'Step-by-Step Action Plan',
  subheading:
    'Three phases from survival to sustainable profitability. Click each phase to expand.',
} as const;

export const METRIC_GRID_DEFAULTS = {
  heading: '12-Month Target',
  subheading: 'From barely breaking even to industry-leading margins.',
} as const;

export const CHART_FINANCIAL_DEFAULTS = {
  scenario: 'conservative',
  variant: 'dashboard',
} as const;

export const KPI_CARDS_DEFAULTS = {
  variant: 'dashboard',
} as const;
