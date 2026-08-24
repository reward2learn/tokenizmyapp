import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { utils, write } from 'xlsx';
import { renderAllSheetsForAi, comprehendWorkbook, WorkbookComprehensionSchema } from './workbook-comprehension';

function wbBuffer(sheets: Record<string, unknown[][]>): Buffer {
  const wb = utils.book_new();
  for (const [name, aoa] of Object.entries(sheets)) {
    utils.book_append_sheet(wb, utils.aoa_to_sheet(aoa), name);
  }
  return Buffer.from(write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

const VALID_COMPREHENSION = {
  workbook: {
    title: 'Red Ruby P&L',
    company: 'PT Taman Bintang Bali',
    period: 'June 2026',
    currency: 'IDR',
    summary: 'Monthly P&L for June 2026.',
  },
  sheets: [
    {
      tabName: 'PL',
      category: 'profit_loss',
      title: 'Profit & Loss',
      summary: 'COA-style P&L with Total Income, salaries and net result.',
      periodHint: 'June 2026',
      columns: ['DESCRIPTION', 'Amount'],
      rowCount: 138,
      metrics: [
        { period: '2026-06', dataType: 'actual', scenario: 'actual', revenue: 1975304568, netIncome: -104182314, staffCost: 620122268 },
      ],
    },
    {
      tabName: 'BEP Monthly',
      category: 'break_even',
      title: 'Break-Even Analysis',
      summary: 'Monthly break-even point and coverage.',
      metrics: [
        { period: '2025-01', dataType: 'forecast', scenario: 'conservative', revenue: 2674811722, staffCost: 546183562 },
      ],
    },
  ],
  projections: [
    { period: '2026-06', dataType: 'actual', scenario: 'actual', revenue: 1975304568, ebitda: 74040075, netIncome: -104182314, staffCost: 620122268 },
    { period: '2025-01', dataType: 'forecast', scenario: 'conservative', revenue: 2674811722, staffCost: 546183562 },
  ],
  template: { id: 'financial-analytics', confidence: 0.95, reason: 'P&L + BEP workbook' },
};

describe('renderAllSheetsForAi', () => {
  it('serializes every sheet to row-numbered text', () => {
    const buf = wbBuffer({
      PL: [
        [null, '', 'PROFIT & LOSS'],
        [null, '', 'Periode: June 2026'],
        [null, '4-9999', 'Total Income', 1975304568],
      ],
      GL: [[null, 'DATE', 'REFF#'], [4, 46174, 'DS26-0601']],
    });
    const blocks = renderAllSheetsForAi(buf);
    expect(blocks.map((b) => b.tabName)).toEqual(['PL', 'GL']);
    const pl = blocks.find((b) => b.tabName === 'PL')!;
    expect(pl.text).toContain('PROFIT & LOSS');
    expect(pl.text).toContain('Periode: June 2026');
    expect(pl.text).toContain('1975304568');
    expect(pl.text).toContain('R3:');
  });

  it('trims trailing empty cells and caps long strings', () => {
    const buf = wbBuffer({
      Sheet1: [[1, 2, '', ''], ['x'.repeat(200), null, null, null]],
    });
    const [block] = renderAllSheetsForAi(buf);
    expect(block!.text).toContain('R1: 1 | 2');
    expect(block!.text).toContain('…');
  });
});

describe('WorkbookComprehensionSchema', () => {
  it('accepts a valid comprehension', () => {
    const parsed = WorkbookComprehensionSchema.parse(VALID_COMPREHENSION);
    expect(parsed.sheets).toHaveLength(2);
    expect(parsed.projections[0]!.revenue).toBe(1975304568);
    expect(parsed.template!.id).toBe('financial-analytics');
  });

  it('rejects an invalid period format', () => {
    const bad = {
      ...VALID_COMPREHENSION,
      projections: [{ period: 'June-2026', dataType: 'actual', scenario: 'actual' }],
    };
    expect(() => WorkbookComprehensionSchema.parse(bad)).toThrow();
  });
  it('coerceComprehensionPayload fills missing workbook.title before parse', async () => {
    const { coerceComprehensionPayload, WorkbookComprehensionSchema: schema } =
      await import('./comprehend');
    const missingTitle = {
      ...VALID_COMPREHENSION,
      workbook: { ...VALID_COMPREHENSION.workbook, title: undefined },
    };
    const coerced = coerceComprehensionPayload(missingTitle);
    const parsed = schema.parse(coerced);
    expect(parsed.workbook.title.length).toBeGreaterThan(0);
  });

  it('coerceComprehensionPayload backfills missing sheets[].tabName from known extract names', async () => {
    const { coerceComprehensionPayload, WorkbookComprehensionSchema: schema } =
      await import('./comprehend');
    const missingTabNames = {
      ...VALID_COMPREHENSION,
      sheets: VALID_COMPREHENSION.sheets.map(({ tabName: _omit, ...rest }) => rest),
    };
    const coerced = coerceComprehensionPayload(missingTabNames, undefined, ['PL', 'BEP Monthly']);
    const parsed = schema.parse(coerced);
    expect(parsed.sheets.map((s) => s.tabName)).toEqual(['PL', 'BEP Monthly']);
  });

  it('coerceComprehensionPayload accepts name/sheetName aliases for tabName', async () => {
    const { coerceComprehensionPayload, WorkbookComprehensionSchema: schema } =
      await import('./comprehend');
    const aliased = {
      ...VALID_COMPREHENSION,
      sheets: [
        { ...VALID_COMPREHENSION.sheets[0]!, tabName: undefined, name: 'PL' },
        { ...VALID_COMPREHENSION.sheets[1]!, tabName: undefined, sheetName: 'BEP Monthly' },
      ],
    };
    const coerced = coerceComprehensionPayload(aliased);
    const parsed = schema.parse(coerced);
    expect(parsed.sheets.map((s) => s.tabName)).toEqual(['PL', 'BEP Monthly']);
  });
});

vi.mock('@/lib/openai', () => ({
  resolveOpenAiKey: vi.fn(async () => 'sk-test'),
}));

describe('comprehendWorkbook', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls OpenAI and returns the validated comprehension', async () => {
    const { comprehendWorkbook: cw } = await import('./workbook-comprehension');

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(VALID_COMPREHENSION) } }],
      }),
    } as never);

    const buf = wbBuffer({ PL: [[null, 'Total Income', 1975304568]] });
    const result = await cw([buf], 'gpt-4o');
    expect(result.comprehension.sheets).toHaveLength(2); // sheets from the mocked AI response
    expect(result.comprehension.projections[0]!.period).toBe('2026-06');
    expect(result.model).toBe('gpt-4o');
    expect(fetch).toHaveBeenCalledTimes(1);

    const body = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1]!.body as string);
    expect(body.messages[1].content).toContain('===== SHEET: PL =====');
  });

  it('retries once when the first response is malformed', async () => {
    const { comprehendWorkbook: cw } = await import('./workbook-comprehension');

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'not json' } }] }),
      } as never)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '```json\n' + JSON.stringify(VALID_COMPREHENSION) + '\n```' } }],
        }),
      } as never);

    const result = await cw([wbBuffer({ PL: [[1]] })]);
    expect(result.comprehension.sheets).toHaveLength(2); // sheets from the mocked AI response
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('throws when OpenAI is unreachable', async () => {
    const { comprehendWorkbook: cw } = await import('./workbook-comprehension');
    // Retry loop makes up to 2 attempts — both must fail for the error to surface.
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'boom', headers: { get: () => null } } as never)
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'boom', headers: { get: () => null } } as never);

    await expect(cw([wbBuffer({ PL: [[1]] })])).rejects.toThrow(/OpenAI API error/);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
