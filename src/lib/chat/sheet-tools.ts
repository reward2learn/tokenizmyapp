/**
 * Workbook / spreadsheet lookup tools for the chat assistant.
 *
 * Read-only — queries the cached workbook (Config > Source) using the same
 * path as the sheet viewer block.
 */
import type { WorkbookCacheClient } from '@/lib/workbook-cache';
import { listWorkbookSheetNames, querySheetDataFromCache } from '@/lib/sheet-data-read';
import type { SheetSortBy } from '@/lib/sheet-data-sort';

export const SHEET_TOOL_INSTRUCTIONS = `Workbook spreadsheet tools read the cached financial workbook (same data as the sheet viewer blocks on Financial Review pages).

Use them whenever the user asks about figures from Excel tabs — payroll, BEP, P&L, staff cost, monthly projections, or any line item you do not already have in the system prompt or database context.

- list_workbook_sheets — tab names in the cached workbook. Call first if you are unsure which sheet holds the data (common tabs: "BEP Monthly", "PL", "TB").
- query_sheet_data — paginated rows from one tab as TSV. Pass sheet (required), optional page, perPage (default 50, max 200), searchText (filter rows containing text, e.g. "payroll" or "2025"), and sortBy when ordering helps.

After a tool returns data, answer from the TSV — cite the sheet name and row numbers. If the sheet is missing, call list_workbook_sheets and retry with the correct tab name. Paginate (page 2, 3, …) when totalPages > 1.`;

export const SHEET_OPENAI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'list_workbook_sheets',
      description:
        'List Excel tab names available in the cached workbook. Use before query_sheet_data when the sheet name is unknown.',
      parameters: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'query_sheet_data',
      description:
        'Query rows from a workbook sheet tab (paginated TSV). Use for BEP, payroll, P&L, and other spreadsheet metrics.',
      parameters: {
        type: 'object',
        properties: {
          sheet: {
            type: 'string',
            description: 'Excel tab name, e.g. "BEP Monthly", "PL", "TB".',
          },
          page: {
            type: 'integer',
            description: 'Page number (default 1).',
            minimum: 1,
          },
          perPage: {
            type: 'integer',
            description: 'Rows per page (default 50, max 200).',
            minimum: 1,
            maximum: 200,
          },
          searchText: {
            type: 'string',
            description:
              'Optional filter — only rows where any column contains this text (case-insensitive), e.g. "payroll" or "Jun-25".',
          },
          sortBy: {
            type: 'array',
            description: 'Optional sort — up to 3 [columnName, "asc"|"desc"] pairs.',
            items: {
              type: 'array',
              prefixItems: [{ type: 'string' }, { type: 'string', enum: ['asc', 'desc'] }],
              minItems: 2,
              maxItems: 2,
            },
            maxItems: 3,
          },
        },
        required: ['sheet'],
        additionalProperties: false,
      },
    },
  },
] as const;

const SHEET_TOOL_NAMES = new Set(
  SHEET_OPENAI_TOOLS.map((tool) => tool.function.name),
);

export function isSheetToolName(name: string): boolean {
  return SHEET_TOOL_NAMES.has(name as any);
}

export interface SheetToolContext {
  db: WorkbookCacheClient;
  isAuthenticated: boolean;
}

function parseSortBy(raw: unknown): SheetSortBy {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (e): e is [string, 'asc' | 'desc'] =>
        Array.isArray(e)
        && e.length === 2
        && typeof e[0] === 'string'
        && (e[1] === 'asc' || e[1] === 'desc'),
    )
    .slice(0, 3);
}

export async function executeSheetTool(
  toolName: string,
  rawArgs: string,
  ctx: SheetToolContext,
): Promise<string> {
  if (!ctx.isAuthenticated) {
    return 'Workbook lookup requires a signed-in session.';
  }

  let args: Record<string, unknown> = {};
  if (rawArgs.trim()) {
    try {
      args = JSON.parse(rawArgs) as Record<string, unknown>;
    } catch {
      return 'Tool arguments were invalid JSON.';
    }
  }

  switch (toolName) {
    case 'list_workbook_sheets': {
      const result = await listWorkbookSheetNames(ctx.db);
      if (!result.ok) return result.error;
      if (!result.sheets.length) {
        return 'The cached workbook has no sheets.';
      }
      return `Workbook tabs (${result.sheets.length}):\n${result.sheets.map((s) => `- ${s}`).join('\n')}`;
    }
    case 'query_sheet_data': {
      const sheet = typeof args.sheet === 'string' ? args.sheet.trim() : '';
      if (!sheet) return 'query_sheet_data requires a "sheet" tab name.';

      const page = typeof args.page === 'number' && Number.isFinite(args.page)
        ? Math.max(1, Math.floor(args.page))
        : 1;
      const perPage = typeof args.perPage === 'number' && Number.isFinite(args.perPage)
        ? Math.min(200, Math.max(1, Math.floor(args.perPage)))
        : 50;
      const searchText = typeof args.searchText === 'string' ? args.searchText : undefined;

      const result = await querySheetDataFromCache(ctx.db, {
        sheet,
        page,
        perPage,
        searchText,
        sortBy: parseSortBy(args.sortBy),
        formulas: false,
      });

      if (!result.ok) {
        const sheets = result.availableSheets?.length
          ? `\nAvailable tabs: ${result.availableSheets.join(', ')}`
          : '';
        return `${result.error}${sheets}`;
      }

      return result.tsv;
    }
    default:
      return `Unknown sheet tool: ${toolName}`;
  }
}
