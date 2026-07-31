/**
 * In-process workflow tests for the workbook-ingest workflow (Phases 1–2:
 * LOAD → EXTRACT → ANALYZE → COMPREHEND).
 *
 * The @workflow/vitest plugin builds the workflow bundles in globalSetup and
 * registers an in-process world, so `start()` from `workflow/api` executes
 * the workflow durably without a dev server.
 *
 * OpenAI is mocked at the global fetch level while the API key is resolved
 * from DB via the real resolveOpenAiKey (matching the production route behavior).
 * The pre-built step bundle runs in-process — `vi.mock('@/lib/openai')` would
 * not reach the bundled code.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { start } from 'workflow/api';
import { utils, write } from 'xlsx';
import { handleWorkbookIngest } from './index';
import type { WorkbookIngestInput } from './types';
import { resolveOpenAiKey } from '../../src/lib/openai';

/** Build a real xlsx file as Uint8Array (mirrors what the route uploads). */
function xlsxBytes(sheets: Record<string, unknown[][]>): Uint8Array {
  const wb = utils.book_new();
  for (const [name, aoa] of Object.entries(sheets)) {
    utils.book_append_sheet(wb, utils.aoa_to_sheet(aoa), name);
  }
  const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
  return new Uint8Array(buf);
}

function inputFor(openaiApiKey: string | null, ...files: Array<{ name: string; data: Uint8Array }>): WorkbookIngestInput {
  return {
    files: files.map((f) => ({ name: f.name, data: f.data, size: f.data.byteLength })),
    model: 'gpt-4o',
    skipContentGeneration: true,
    dbUrl: process.env.POSTGRES_URL || '',
    openaiApiKey,
  };
}

const PNL_SHEET = [
  [null, '', 'PROFIT & LOSS'],
  [null, '', 'Periode: June 2026 (IDR)'],
  [null, '4-9999', 'Total Income', 1975304568],
  [null, '', 'Food Cost', 620122268],
  [null, '', 'Net Profit', -104182314],
];

const BEP_SHEET = [
  ['BEP Monthly'],
  ['Period', 'Revenue', 'Cover'],
  ['Jan 2026', 2674811722, 8900],
  ['Feb 2026', 2810000000, 9100],
];

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

/** A mock OpenAI chat-completions response. */
function openAiOk(comprehension: unknown = VALID_COMPREHENSION): Response {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    text: async () => '',
    json: async () => ({ choices: [{ message: { content: JSON.stringify(comprehension) } }] }),
  } as unknown as Response;
}

function openAi429(retryAfter = '1'): Response {
  return {
    ok: false,
    status: 429,
    headers: { get: (name: string) => (name === 'retry-after' ? retryAfter : null) },
    text: async () => 'rate limited',
    json: async () => ({}),
  } as unknown as Response;
}

function openAi500(): Response {
  return {
    ok: false,
    status: 500,
    headers: { get: () => null },
    text: async () => 'internal error',
    json: async () => ({}),
  } as unknown as Response;
}

let apiKey: string | null = null;

beforeAll(async () => {
  apiKey = (await resolveOpenAiKey()) || process.env.OPENAI_API_KEY || "sk-test-workaround-db-key-unavailable";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Mock global fetch ONLY — the API key comes from real DB resolution. */
function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl));
}

const fetchMock = () => vi.mocked(fetch);

describe('handleWorkbookIngest (Phases 1–2: LOAD → EXTRACT → ANALYZE → COMPREHEND)', () => {
  it('extracts, analyzes and comprehends a real P&L + BEP workbook', async () => {
    mockFetch(async () => openAiOk());

    const input = inputFor(apiKey, {
      name: 'red-ruby.xlsx',
      data: xlsxBytes({ PL: PNL_SHEET, 'BEP Monthly': BEP_SHEET }),
    });

    const run = await start(handleWorkbookIngest, [input]);
    const result = await run.returnValue;

    expect(result.stage).toBe('complete');
    expect(result.sheetCount).toBe(2);
    expect(result.sheets.map((s) => s.tabName)).toEqual(['PL', 'BEP Monthly']);
    expect(result.sheets[0]!.text).toContain('PROFIT & LOSS');
    expect(result.sheets[1]!.text).toContain('BEP Monthly');

    // AI comprehension passthrough
    expect(result.comprehension).toBeDefined();
    expect(result.comprehension!.sheets).toHaveLength(2);
    expect(result.comprehension!.projections[0]!.period).toBe('2026-06');
    expect(result.comprehension!.template!.id).toBe('financial-analytics');
    expect(result.model).toBe('gpt-4o');

    // Phase 3 POPULATE assertions
    expect(result.projectionsCount).toBe(2); // 2 projections from VALID_COMPREHENSION
    expect(result.pagesCreated).toBeDefined();
    expect(result.pagesCreated!.length).toBe(2); // 2 sheet pages
    expect(result.templateFit).toBeDefined();
    expect(result.templateFit!.recommended).toBeDefined();

    // Deterministic ANALYZE hints
    expect(result.hints.sheets).toHaveLength(2);
    const pl = result.hints.sheets.find((s) => s.tabName === 'PL')!;
    expect(pl.likelyCategory).toBe('profit_loss');
    expect(pl.currencyHints).toContain('IDR');
    expect(pl.numericRatio).toBeGreaterThan(0.2); // 3 numeric / 9 non-empty cells
    expect(pl.rowCount).toBe(PNL_SHEET.length);

    const bep = result.hints.sheets.find((s) => s.tabName === 'BEP Monthly')!;
    expect(bep.likelyCategory).toBe('break_even');

    expect(result.hints.workbook.sheetCount).toBe(2);
    expect(result.hints.workbook.currencyGuess).toBe('IDR');
    expect(result.message).toContain('comprehended');
  });

  it('injects the deterministic ANALYSIS hints into the comprehension prompt', async () => {
    mockFetch(async () => openAiOk());

    const run = await start(handleWorkbookIngest, [
      inputFor(apiKey, { name: 'red-ruby.xlsx', data: xlsxBytes({ PL: PNL_SHEET, 'BEP Monthly': BEP_SHEET }) }),
    ]);
    await run.returnValue;

    expect(fetch).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock().mock.calls[0]!;
    const body = JSON.parse(String((init as RequestInit).body));
    const userContent: string = body.messages[1].content;

    expect(userContent).toContain('DETERMINISTIC PRE-ANALYSIS');
    expect(userContent).toContain('Currency guess: IDR');
    expect(userContent).toContain('Period guess:');
    expect(userContent).toContain('category-guess profit_loss');
    expect(userContent).toContain('===== SHEET: PL =====');
    expect(body.model).toBe('gpt-4o');
    expect(body.response_format.type).toBe('json_object');
  });

  it('retries the step on OpenAI 429 using Retry-After', async () => {
    const impl = vi
      .fn()
      .mockResolvedValueOnce(openAi429('0')) // immediate retry
      .mockResolvedValueOnce(openAiOk());
    mockFetch(async () => impl());

    const run = await start(handleWorkbookIngest, [
      inputFor(apiKey, { name: 'simple.xlsx', data: xlsxBytes({ Sheet1: [[1, 2, 3], [4, 5, 6]] }) }),
    ]);
    const result = await run.returnValue;

    expect(result.stage).toBe('complete');
    expect(impl).toHaveBeenCalledTimes(2);
    // 429 must have been answered with a Retry-After header read
    expect(fetchMock().mock.calls[0]![1]).toBeDefined();
  });

  it('fails the run with FatalError when OPENAI_API_KEY is missing', async () => {
    mockFetch(async () => openAiOk());

    const run = await start(handleWorkbookIngest, [
      inputFor(null, { name: 'simple.xlsx', data: xlsxBytes({ Sheet1: [[1]] }) }),
    ]);
    await expect(run.returnValue).rejects.toThrow(/OpenAI API key not configured/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('streams progress chunks to the run readable stream', async () => {
    mockFetch(async () => openAiOk());

    const input = inputFor(apiKey, {
      name: 'simple.xlsx',
      data: xlsxBytes({ Sheet1: [[1, 2, 3], [4, 5, 6]] }),
    });

    const run = await start(handleWorkbookIngest, [input]);
    await run.returnValue;

    const reader = run.readable.getReader();
    const chunks: unknown[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    reader.releaseLock();

    const messages = chunks.flatMap((c) => {
      if (c == null) return [];
      if (typeof c === 'string') {
        try {
          return [JSON.parse(c)];
        } catch {
          return [];
        }
      }
      return [c];
    }) as Array<{ step?: string; pct?: number }>;

    const steps = messages.map((m) => m.step).filter(Boolean);
    expect(steps[0]).toBe('started');
    expect(steps).toContain('extracting');
    expect(steps).toContain('analyzing');
    expect(steps).toContain('comprehending');
    expect(steps).toContain('populating');
    expect(steps[steps.length - 1]).toBe('complete');
    expect(messages.some((m) => m.pct === 100)).toBe(true);
  });

  it('fails with FatalError on an empty file list', async () => {
    const run = await start(handleWorkbookIngest, [{ files: [] }]);
    await expect(run.returnValue).rejects.toThrow(/No workbook files/);
  });

  it('fails on non-spreadsheet bytes', async () => {
    const run = await start(handleWorkbookIngest, [
      inputFor(apiKey, { name: 'garbage.xlsx', data: new TextEncoder().encode('not an xlsx file at all') }),
    ]);
    await expect(run.returnValue).rejects.toThrow(/not a readable \.xlsx\/\.xls file/);
  });

  it('handles empty tabs without dropping the workbook', async () => {
    mockFetch(async () => openAiOk());
    const input = inputFor(apiKey, {
      name: 'mixed.xlsx',
      data: xlsxBytes({ Empty: [[]], Data: [['A', 'B'], [1, 2]] }),
    });
    const run = await start(handleWorkbookIngest, [input]);
    const result = await run.returnValue;
    // Empty sheets are skipped by extraction; Data survives.
    expect(result.sheets.map((s) => s.tabName)).toEqual(['Data']);
    expect(result.sheetCount).toBe(1);
  });

  it('is replay-safe: identical input yields identical analysis + comprehension', async () => {
    mockFetch(async () => openAiOk()); // mockResolvedValue handles both runs
    const bytes = xlsxBytes({ PL: PNL_SHEET });
    const run1 = await start(handleWorkbookIngest, [inputFor(apiKey, { name: 'a.xlsx', data: bytes })]);
    const run2 = await start(handleWorkbookIngest, [inputFor(apiKey, { name: 'b.xlsx', data: bytes })]);
    const [r1, r2] = await Promise.all([run1.returnValue, run2.returnValue]);
    expect(r1.hints.workbook.currencyGuess).toBe(r2.hints.workbook.currencyGuess);
    expect(r1.hints.workbook.periodGuess).toBe(r2.hints.workbook.periodGuess);
    expect(r1.sheets).toEqual(r2.sheets);
    expect(r1.comprehension).toEqual(r2.comprehension);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('fails the run when OpenAI returns 500 after the SDK retry budget', async () => {
    // All attempts 500 → plain Error → SDK auto-retries (3) → run fails.
    mockFetch(async () => openAi500());
    const run = await start(handleWorkbookIngest, [
      inputFor(apiKey, { name: 'simple.xlsx', data: xlsxBytes({ Sheet1: [[1]] }) }),
    ]);
    await expect(run.returnValue).rejects.toThrow(/OpenAI API error \(500\)/);
    expect(fetch).toHaveBeenCalledTimes(4); // initial call + 3 SDK auto-retries = 4 total
  });
});
