import type { ComponentType } from 'react';
import type { BlockType } from '@/lib/page-catalog';
import { HeroBlock } from '@/components/blocks/hero-block';
import { DocMarkdownBlock } from '@/components/blocks/doc-markdown-block';
import {
  CalendarImportBlock,
  ChatPanelBlock,
} from '@/components/blocks/stub-blocks';

export type BlockComponent = ComponentType<{ config: Record<string, unknown> }>;

/**
 * Base block registry — contains only generic, non-template-specific blocks.
 * Template-specific blocks (chart_financial, lever_accordion, pnl_table,
 * z_report_form, costs_form, review_blocks, reports_rollup, sheet_viewer,
 * ops_admin_tabs, kpi_cards, metric_grid, action_checklist) are registered
 * by the codegen service based on the AI-generated schema.
 */
export const BLOCK_REGISTRY: Partial<Record<BlockType, BlockComponent>> = {
  hero: HeroBlock,
  doc_markdown: DocMarkdownBlock,
  calendar_import: CalendarImportBlock,
  chat_panel: ChatPanelBlock,
};

export function getBlockComponent(blockType: BlockType): BlockComponent | undefined {
  return BLOCK_REGISTRY[blockType];
}
