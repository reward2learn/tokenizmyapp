export type CmsFieldValueType =
  | 'text'
  | 'multiline'
  | 'markdown'
  | 'url'
  | 'string_array'
  | 'faq_items'
  | 'showcase_items'
  | 'json_rows'
  | 'nav_buttons'
  | 'enum';

export interface CmsFieldSpec {
  label: string;
  type: CmsFieldValueType;
  description: string;
  enumValues?: string[];
}

/** What each block is for — passed to the AI as use-case context. */
export const BLOCK_USE_CASES: Record<string, string> = {
  hero:
    'Primary landing hero: headline, brand-colour accent line, subtitle, up to two navigation buttons, optional background image/video or carousel slides.',
  marketing_hero:
    'Platform marketing hero with prompt box: headline, subheadline, audience chips, quick-start ideas, placeholder text, and CTA.',
  faq: 'FAQ accordion — heading plus question/answer pairs (answers may use Markdown).',
  cta_banner: 'Closing call-to-action banner with heading, optional subheading, and a single CTA button.',
  pricing_table:
    'Pricing section heading and subheading (plan cards are derived from billing catalog, not CMS copy).',
  capability_marquee:
    'Scrolling capability chips in multiple rows — heading, optional subheading, and rows of short labels.',
  customer_proof:
    'Customer case-study cards with industry, business name, and two metrics each (only real permissioned customers).',
  testimonials: 'Customer quote wall — heading, optional subheading, and testimonial items.',
  product_showcase:
    'Capability cards explaining how the product works — heading, optional subheading, and title/body items.',
  feature_grid: 'Grid of product capability cards — heading and subheading (card copy is template defaults unless extended).',
  doc_markdown:
    'Markdown document section — title, optional inline markdown override, or content source key.',
  review_part:
    'Single section of the multi-part business review — title and full Markdown body stored in business_review_parts.',
  chat_panel: 'AI chat empty-state prompt and up to five suggested starter prompts; optional dataContext when converted from a data block.',
  chart_financial: 'Financial chart block — scenario and dashboard/ops variant.',
  kpi_cards: 'KPI cards — period label and dashboard/ops variant.',
  pnl_table: 'P&L table — optional period label.',
  metric_grid:
    'Scenario / target comparison grid — heading and subheading in CMS; target rows live in dashboard_data.',
  lever_accordion:
    'Strategic levers accordion — section title/subheading in CMS; lever cards live in dashboard_data.',
  action_checklist:
    'Phased action plan checklist — heading/subheading in CMS; phases live in dashboard_data.actionPhases.',
  sheet_viewer: 'Workbook sheet table viewer — sheet name, title, optional column filter.',
  pack_table: 'App-pack data table viewer — table name, title, page size.',
  review_blocks: 'Multi-part business review container (parts are separate documents, not CMS JSON).',
  reports_rollup: 'Ops reports rollup — no authored CMS copy.',
  ops_admin_tabs: 'Ops admin tab shell — no authored CMS copy.',
  z_report_form: 'Z-report data entry form — no authored CMS copy.',
  costs_form: 'Costs data entry form — no authored CMS copy.',
  calendar_import: 'Calendar import tool — no authored CMS copy.',
};

const COMMON_STRING: Omit<CmsFieldSpec, 'label'> = {
  type: 'text',
  description: 'Short, scannable copy suitable for this block on the page.',
};

export const BLOCK_FIELD_SPECS: Record<string, Record<string, CmsFieldSpec>> = {
  hero: {
    headline: { label: 'headline', ...COMMON_STRING, description: 'Main hero title line.' },
    accent: { label: 'accent', ...COMMON_STRING, description: 'Second headline line shown in brand colour.' },
    subtitle: { label: 'subtitle', type: 'multiline', description: 'Supporting line under the headline.' },
    badge: { label: 'badge', ...COMMON_STRING, description: 'Small chip above the headline.' },
    navButtons: { label: 'navigation buttons', type: 'nav_buttons', description: 'Up to two CTA cards with label and href.' },
    backgroundImage: { label: 'background image URL', type: 'url', description: 'Hero backdrop image URL.' },
    backgroundVideo: { label: 'background video URL', type: 'url', description: 'Hero backdrop video URL (MP4/WebM).' },
    slides: { label: 'carousel slides', type: 'json_rows', description: 'Array of hero slides for carousel mode.' },
  },
  marketing_hero: {
    headline: { label: 'headline', ...COMMON_STRING, description: 'Primary marketing headline.' },
    subheadline: { label: 'subheadline', type: 'multiline', description: 'One or two sentences under the headline.' },
    audiences: { label: 'audiences', type: 'string_array', description: 'Short audience category chips.' },
    quickStarts: { label: 'quickStarts', type: 'string_array', description: 'Quick-start idea chips for the prompt box.' },
    placeholder: { label: 'placeholder', ...COMMON_STRING, description: 'Placeholder in the prompt text field.' },
    ctaLabel: { label: 'ctaLabel', ...COMMON_STRING, description: 'Primary CTA button label.' },
    ctaHref: { label: 'ctaHref', type: 'url', description: 'Route for the CTA (e.g. /admin).' },
  },
  faq: {
    heading: { label: 'heading', ...COMMON_STRING, description: 'FAQ section heading.' },
    items: { label: 'FAQ items', type: 'faq_items', description: 'Question and answer pairs; answers may use Markdown.' },
  },
  cta_banner: {
    heading: { label: 'heading', ...COMMON_STRING, description: 'Bold closing headline.' },
    subheading: { label: 'subheading', type: 'multiline', description: 'Supporting line under the heading.' },
    ctaLabel: { label: 'ctaLabel', ...COMMON_STRING, description: 'CTA button label.' },
    ctaHref: { label: 'ctaHref', type: 'url', description: 'CTA link path.' },
  },
  pricing_table: {
    heading: { label: 'heading', ...COMMON_STRING, description: 'Pricing section title.' },
    subheading: { label: 'subheading', type: 'multiline', description: 'One line under the pricing title.' },
    ctaHref: { label: 'ctaHref', type: 'url', description: 'Default plan CTA path.' },
    highlightPlanId: { label: 'highlightPlanId', ...COMMON_STRING, description: 'Plan id marked Most popular (e.g. business).' },
  },
  capability_marquee: {
    heading: { label: 'heading', ...COMMON_STRING, description: 'Section heading above the marquee.' },
    subheading: { label: 'subheading', type: 'multiline', description: 'Optional subheading.' },
    rows: { label: 'rows', type: 'json_rows', description: 'JSON array of string arrays — each inner array is one scrolling row of capability labels.' },
  },
  customer_proof: {
    heading: { label: 'heading', ...COMMON_STRING, description: 'Customer results section heading.' },
    items: { label: 'items', type: 'json_rows', description: 'Customer proof cards JSON array.' },
  },
  testimonials: {
    heading: { label: 'heading', ...COMMON_STRING, description: 'Testimonials section heading.' },
    subheading: { label: 'subheading', type: 'multiline', description: 'Optional subheading.' },
    items: { label: 'items', type: 'json_rows', description: 'Testimonial objects with quote, name, role.' },
  },
  product_showcase: {
    heading: { label: 'heading', ...COMMON_STRING, description: 'Showcase section heading.' },
    subheading: { label: 'subheading', type: 'multiline', description: 'Optional subheading.' },
    items: { label: 'items', type: 'showcase_items', description: 'Capability cards: title and body per item.' },
  },
  feature_grid: {
    heading: { label: 'heading', ...COMMON_STRING, description: 'Feature grid heading.' },
    subheading: { label: 'subheading', type: 'multiline', description: 'Feature grid subheading.' },
  },
  doc_markdown: {
    source: { label: 'source', ...COMMON_STRING, description: 'Knowledge snippet key or alias.' },
    title: { label: 'title', ...COMMON_STRING, description: 'Document section title.' },
    markdown: { label: 'markdown', type: 'markdown', description: 'Full Markdown body for this section.' },
  },
  review_part: {
    title: { label: 'title', ...COMMON_STRING, description: 'Review part section title.' },
    markdown: { label: 'markdown', type: 'markdown', description: 'Full Markdown body for this review part.' },
  },
  chat_panel: {
    emptyStatePrompt: { label: 'emptyStatePrompt', type: 'multiline', description: 'Chat empty-state greeting question.' },
    suggestedPrompts: { label: 'suggestedPrompts', type: 'string_array', description: 'Up to five suggested prompts, one per line.' },
    dataContext: {
      label: 'dataContext',
      type: 'json_rows',
      description: 'Optional reference to the original data-backed block type when this chat replaced another block.',
    },
  },
  chart_financial: {
    scenario: { label: 'scenario', type: 'enum', enumValues: ['conservative', 'realistic', 'aspirational', 'actual'], description: 'Financial scenario to chart.' },
    variant: { label: 'variant', type: 'enum', enumValues: ['dashboard', 'ops'], description: 'Chart layout variant.' },
  },
  kpi_cards: {
    period: { label: 'period', ...COMMON_STRING, description: 'Period label e.g. 2025-01.' },
    variant: { label: 'variant', type: 'enum', enumValues: ['dashboard', 'ops'], description: 'KPI card layout variant.' },
  },
  pnl_table: {
    period: { label: 'period', ...COMMON_STRING, description: 'Period label e.g. 2025-01.' },
  },
  lever_accordion: {
    title: { label: 'title', ...COMMON_STRING, description: 'Levers section title.' },
    subheading: {
      label: 'subheading',
      type: 'multiline',
      description: 'Supporting line under the levers title.',
    },
  },
  action_checklist: {
    heading: { label: 'heading', ...COMMON_STRING, description: 'Action plan section heading.' },
    subheading: {
      label: 'subheading',
      type: 'multiline',
      description: 'Supporting line under the action plan heading.',
    },
  },
  metric_grid: {
    heading: { label: 'heading', ...COMMON_STRING, description: 'Target grid section heading.' },
    subheading: {
      label: 'subheading',
      type: 'multiline',
      description: 'Supporting line under the target grid heading.',
    },
    scenarios: {
      label: 'scenarios',
      type: 'json_rows',
      description: 'Optional scenario column definitions when not using dashboard target rows.',
    },
  },
  sheet_viewer: {
    sheet: { label: 'sheet', ...COMMON_STRING, description: 'Workbook sheet tab name.' },
    title: { label: 'title', ...COMMON_STRING, description: 'Viewer section title.' },
  },
  pack_table: {
    table: { label: 'table', ...COMMON_STRING, description: 'Pack table name.' },
    title: { label: 'title', ...COMMON_STRING, description: 'Table section title.' },
  },
};

export function getBlockUseCase(blockType: string): string {
  return BLOCK_USE_CASES[blockType] ?? `CMS block type "${blockType}" on this page.`;
}

export function getFieldSpec(blockType: string, fieldKey: string): CmsFieldSpec {
  const spec = BLOCK_FIELD_SPECS[blockType]?.[fieldKey];
  if (spec) return spec;
  return {
    label: fieldKey,
    type: 'text',
    description: `Value for config field "${fieldKey}".`,
  };
}
