import { describe, expect, it, vi, beforeEach } from 'vitest';
import { utils, write } from 'xlsx';

vi.mock('@/domain/ai-workbook/workbook-comprehension', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./workbook-comprehension')>();
  return {
    ...actual,
    comprehendWorkbook: vi.fn(async () => ({
      comprehension: {
        workbook: { title: 'Test Workbook', company: 'PT Test', period: 'June 2026', summary: 'Test summary' },
        sheets: [
          {
            tabName: 'PL',
            category: 'profit_loss' as const,
            title: 'Profit & Loss',
            summary: 'P&L sheet',
            periodHint: 'June 2026',
            metrics: [{ period: '2026-06', dataType: 'actual' as const, scenario: 'actual' as const, revenue: 1000 }],
          },
        ],
        projections: [
          { period: '2026-06', dataType: 'actual' as const, scenario: 'actual' as const, revenue: 1000, ebitda: 100, netIncome: 50, staffCost: 200 },
        ],
        template: { id: 'financial-analytics', confidence: 0.9 },
      },
      model: 'gpt-4o',
      promptLength: 123,
    })),
  };
});

vi.mock('@/domain/ai-content/content-generator', () => ({
  generateAndSave: vi.fn(async () => ({ success: true })),
}));

vi.mock('@/lib/page-catalog', () => ({
  setDynamicPages: vi.fn(),
}));

import { runAiWorkbookPipeline } from './pipeline';
import { comprehendWorkbook } from './workbook-comprehension';
import { generateAndSave } from '@/domain/ai-content/content-generator';
import { setDynamicPages } from '@/lib/page-catalog';

function wbBuffer(): Buffer {
  const wb = utils.book_new();
  utils.book_append_sheet(wb, utils.aoa_to_sheet([[null, 'PROFIT & LOSS'], [null, 'Total Income', 1000]]), 'PL');
  return Buffer.from(write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

function makeDb() {
  return {
    $executeRaw: vi.fn(async () => 1),
    $queryRaw: vi.fn(async () => [{ id: "page-1" }]),
    knowledgeSnippet: { upsert: vi.fn(async () => ({ id: 's1' })) },
  };
}

describe('runAiWorkbookPipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('populates projections, sheet pages and snippets from the comprehension', async () => {
    const db = makeDb();
    const result = await runAiWorkbookPipeline({
      buffers: [wbBuffer()],
      db: db as never,
      model: 'gpt-4o',
    });

    expect(result.success).toBe(true);
    expect(result.projectionsCount).toBe(1);
    expect(result.pagesCreated).toEqual([{ slug: 'sheet-pl', title: 'Profit & Loss' }]);
    expect(result.contentGenerated).toBe(true);

    // Projection upsert executed (financial_projections INSERT ... ON CONFLICT)
    const execCalls = db.$executeRaw.mock.calls as unknown[][];
    const projCall = execCalls.find((c) => String(c[0]).includes('financial_projections'));
    expect(projCall).toBeDefined();

    // App page inserted via $queryRaw (RETURNING id, §7.1 fix)
    const queryCalls = db.$queryRaw.mock.calls as unknown[][];
    const pageCall = queryCalls.find((c) => String(c[0]).includes('app_pages'));
    expect(pageCall).toBeDefined();
    const sectionCalls = execCalls.filter((c) => String(c[0]).includes('page_sections'));
    expect(sectionCalls.length).toBeGreaterThanOrEqual(2); // doc_markdown + category blocks

    // Comprehension snippet saved
    expect(db.knowledgeSnippet.upsert).toHaveBeenCalled();
    expect(comprehendWorkbook).toHaveBeenCalledTimes(1);
    // Content generation triggered with the comprehension as context
    expect(generateAndSave).toHaveBeenCalledTimes(1);
    const ctx = (generateAndSave as ReturnType<typeof vi.fn>).mock.calls[0]![4] as string; // additionalContext
    expect(ctx).toContain('AI Workbook Comprehension');
    expect(ctx).toContain('Test Workbook');
    // Dynamic pages registered
    expect(setDynamicPages).toHaveBeenCalledTimes(1);
  });

  it('skips content generation when requested', async () => {
    const db = makeDb();
    const result = await runAiWorkbookPipeline({
      buffers: [wbBuffer()],
      db: db as never,
      skipContentGeneration: true,
    });
    expect(result.success).toBe(true);
    expect(result.contentGenerated).toBe(false);
    expect(generateAndSave).not.toHaveBeenCalled();
  });

  it('returns failure when comprehension throws', async () => {
    vi.mocked(comprehendWorkbook).mockRejectedValueOnce(new Error('AI is down'));
    const db = makeDb();
    const result = await runAiWorkbookPipeline({ buffers: [wbBuffer()], db: db as never });
    expect(result.success).toBe(false);
    expect(result.error).toContain('AI is down');
    expect(result.pagesCreated).toEqual([]);
  });
});
