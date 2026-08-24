import { defaultConfigForBlock } from '@/components/cms/cms-block-catalog';

/** Layout + access keys preserved when switching block presentation type. */
const PRESERVED_CONFIG_KEYS = ['animate', 'grid', 'contentGrid', 'minTier'] as const;

/** Block types users may switch to in the CMS block settings drawer. */
export const CMS_SWITCHABLE_BLOCK_TYPES = [
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
  'lever_accordion',
  'action_checklist',
  'pnl_table',
  'ops_admin_tabs',
  'z_report_form',
  'costs_form',
  'calendar_import',
  'review_blocks',
  'reports_rollup',
] as const;

export type CmsSwitchableBlockType = (typeof CMS_SWITCHABLE_BLOCK_TYPES)[number];

const DATA_BACKED_BLOCKS = new Set([
  'kpi_cards',
  'chart_financial',
  'metric_grid',
  'lever_accordion',
  'action_checklist',
  'pnl_table',
  'sheet_viewer',
  'pack_table',
]);

const CHAT_FROM_DATA_BLOCK: Record<
  string,
  { emptyStatePrompt: string; suggestedPrompts: string[] }
> = {
  kpi_cards: {
    emptyStatePrompt: 'Ask about the KPI snapshot for this page.',
    suggestedPrompts: [
      'Summarize this month’s KPI figures',
      'How does revenue compare to forecast?',
      'Explain staff cost as a percentage of revenue',
    ],
  },
  chart_financial: {
    emptyStatePrompt: 'Ask about the financial chart on this page.',
    suggestedPrompts: [
      'Explain the trend in this chart',
      'Which scenario looks most realistic?',
      'What changed month over month?',
    ],
  },
  metric_grid: {
    emptyStatePrompt: 'Ask about the target comparison grid.',
    suggestedPrompts: [
      'Compare conservative vs aspirational targets',
      'Which metrics are furthest from target?',
      'Summarize the scenario grid',
    ],
  },
  lever_accordion: {
    emptyStatePrompt: 'Ask about the strategic levers for this business.',
    suggestedPrompts: [
      'Which lever should we prioritize first?',
      'Summarize the five levers',
      'What actions follow from the top lever?',
    ],
  },
  action_checklist: {
    emptyStatePrompt: 'Ask about the phased action plan.',
    suggestedPrompts: [
      'What are the P1 actions this month?',
      'Summarize all three phases',
      'Which phase has the highest impact?',
    ],
  },
  pnl_table: {
    emptyStatePrompt: 'Ask about the P&L figures for this page.',
    suggestedPrompts: [
      'Walk through the P&L for this period',
      'Where is margin pressure highest?',
      'Compare revenue to net income',
    ],
  },
  sheet_viewer: {
    emptyStatePrompt: 'Ask about the workbook sheet shown on this page.',
    suggestedPrompts: [
      'Summarize the key rows in this sheet',
      'What stands out in the latest data?',
      'Which columns should I focus on?',
    ],
  },
  pack_table: {
    emptyStatePrompt: 'Ask about the data table on this page.',
    suggestedPrompts: [
      'Summarize this table',
      'What are the top entries?',
      'Which records need attention?',
    ],
  },
  ops_admin_tabs: {
    emptyStatePrompt: 'Ask about ops admin tasks and data entry on this page.',
    suggestedPrompts: [
      'What can I do in ops admin?',
      'Walk me through daily data entry',
      'Which tab should I use first?',
    ],
  },
  z_report_form: {
    emptyStatePrompt: 'Ask about Z-report / day POS entry.',
    suggestedPrompts: [
      'How do I enter today’s Z-report?',
      'What fields are required?',
      'Explain common Z-report mistakes',
    ],
  },
  costs_form: {
    emptyStatePrompt: 'Ask about costs and payroll entry.',
    suggestedPrompts: [
      'How do I log payroll costs?',
      'Which cost categories should I track?',
      'Summarize recent cost entries',
    ],
  },
  calendar_import: {
    emptyStatePrompt: 'Ask about calendar import and missing-day fill.',
    suggestedPrompts: [
      'How do I import calendar data?',
      'Fill missing days for this month',
      'What format does the import expect?',
    ],
  },
  review_blocks: {
    emptyStatePrompt: 'Ask about the business review sections on this page.',
    suggestedPrompts: [
      'Summarize the business review',
      'What are the key findings?',
      'Which review part should I read first?',
    ],
  },
  reports_rollup: {
    emptyStatePrompt: 'Ask about ops reports and rollups.',
    suggestedPrompts: [
      'Summarize the latest ops reports',
      'Which reports need attention?',
      'Explain the rollup for this period',
    ],
  },
};

function pickPreservedConfig(config: Record<string, unknown>): Record<string, unknown> {
  const preserved: Record<string, unknown> = {};
  for (const key of PRESERVED_CONFIG_KEYS) {
    if (config[key] !== undefined) preserved[key] = config[key];
  }
  return preserved;
}

function pickSourceBlockConfig(
  blockType: string,
  config: Record<string, unknown>,
): Record<string, unknown> {
  const { animate: _a, grid: _g, contentGrid: _c, minTier: _m, ...rest } = config;
  if (blockType === 'kpi_cards' || blockType === 'chart_financial' || blockType === 'pnl_table') {
    const subset: Record<string, unknown> = {};
    if (rest.period !== undefined) subset.period = rest.period;
    if (rest.variant !== undefined) subset.variant = rest.variant;
    if (rest.scenario !== undefined) subset.scenario = rest.scenario;
    return subset;
  }
  if (blockType === 'sheet_viewer' || blockType === 'pack_table') {
    const subset: Record<string, unknown> = {};
    if (rest.sheet !== undefined) subset.sheet = rest.sheet;
    if (rest.table !== undefined) subset.table = rest.table;
    if (rest.title !== undefined) subset.title = rest.title;
    return subset;
  }
  if (blockType === 'metric_grid' || blockType === 'lever_accordion' || blockType === 'action_checklist') {
    const subset: Record<string, unknown> = {};
    for (const key of ['heading', 'subheading', 'title']) {
      if (rest[key] !== undefined) subset[key] = rest[key];
    }
    return subset;
  }
  return {};
}

function chatPanelFromSourceBlock(
  fromType: string,
  fromConfig: Record<string, unknown>,
): Record<string, unknown> {
  const chatDefaults = CHAT_FROM_DATA_BLOCK[fromType];
  const dataContext = DATA_BACKED_BLOCKS.has(fromType)
    ? { blockType: fromType, config: pickSourceBlockConfig(fromType, fromConfig) }
    : undefined;

  if (!chatDefaults) {
    return dataContext ? { dataContext } : {};
  }

  return {
    emptyStatePrompt: chatDefaults.emptyStatePrompt,
    suggestedPrompts: chatDefaults.suggestedPrompts,
    ...(dataContext ? { dataContext } : {}),
  };
}

function restoreFromChatDataContext(
  toType: string,
  fromConfig: Record<string, unknown>,
  merged: Record<string, unknown>,
): Record<string, unknown> {
  const raw = fromConfig.dataContext;
  if (!raw || typeof raw !== 'object') return merged;
  const ctx = raw as { blockType?: string; config?: Record<string, unknown> };
  if (ctx.blockType !== toType || !ctx.config) return merged;
  return { ...merged, ...ctx.config };
}

/** Shared fields worth carrying between related dashboard blocks. */
function carryCompatibleFields(
  fromType: string,
  toType: string,
  fromConfig: Record<string, unknown>,
  merged: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...merged };
  const dashboardVariants = new Set(['kpi_cards', 'chart_financial']);
  if (dashboardVariants.has(fromType) && dashboardVariants.has(toType)) {
    if (fromConfig.variant !== undefined) next.variant = fromConfig.variant;
  }
  if (fromConfig.period !== undefined && (toType === 'kpi_cards' || toType === 'pnl_table')) {
    next.period = fromConfig.period;
  }
  if (fromConfig.scenario !== undefined && toType === 'chart_financial') {
    next.scenario = fromConfig.scenario;
  }
  if (fromConfig.sheet !== undefined && toType === 'sheet_viewer') {
    next.sheet = fromConfig.sheet;
  }
  if (fromConfig.table !== undefined && toType === 'pack_table') {
    next.table = fromConfig.table;
  }
  if (fromConfig.title !== undefined && (toType === 'sheet_viewer' || toType === 'pack_table')) {
    next.title = fromConfig.title;
  }
  for (const key of ['heading', 'subheading', 'title'] as const) {
    if (fromConfig[key] !== undefined) {
      if (toType === 'metric_grid' || toType === 'lever_accordion' || toType === 'action_checklist') {
        next[key] = fromConfig[key];
      }
    }
  }
  return next;
}

/**
 * Build config for a new block type while preserving layout/access settings.
 * When switching a data-backed block to chat_panel, seeds prompts and stores
 * dataContext so the chat can reference the original data source.
 */
export function migrateConfigForBlockTypeChange(
  fromType: string,
  toType: string,
  config: Record<string, unknown>,
): Record<string, unknown> {
  if (fromType === toType) return { ...config };

  const preserved = pickPreservedConfig(config);
  const defaults = defaultConfigForBlock(toType);
  let merged: Record<string, unknown> = { ...defaults, ...preserved };

  if (toType === 'chat_panel') {
    merged = { ...merged, ...chatPanelFromSourceBlock(fromType, config) };
  } else if (fromType === 'chat_panel') {
    merged = restoreFromChatDataContext(toType, config, merged);
  } else {
    merged = carryCompatibleFields(fromType, toType, config, merged);
  }

  return merged;
}

export function isSwitchableBlockType(value: string): value is CmsSwitchableBlockType {
  return (CMS_SWITCHABLE_BLOCK_TYPES as readonly string[]).includes(value);
}
