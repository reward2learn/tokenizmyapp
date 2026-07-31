// biome-ignore-all lint: generated file
/* eslint-disable */

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/page-catalog.ts
var page_catalog_exports = {};
__export(page_catalog_exports, {
  PAGE_CATALOG: () => PAGE_CATALOG,
  REVIEW_PART_CATALOG: () => REVIEW_PART_CATALOG,
  getFullCatalog: () => getFullCatalog,
  getReviewPartCatalog: () => getReviewPartCatalog,
  getReviewPartDisplayTitle: () => getReviewPartDisplayTitle,
  listNavPages: () => listNavPages,
  listReviewParts: () => listReviewParts,
  resolvePage: () => resolvePage,
  resolveReviewPart: () => resolveReviewPart,
  setDynamicPages: () => setDynamicPages,
  setDynamicReviewParts: () => setDynamicReviewParts,
  tierAllowsAccess: () => tierAllowsAccess
});
function setDynamicReviewParts(parts) {
  DYNAMIC_PARTS = Object.fromEntries(parts.map((p) => [
    p.partSlug,
    p
  ]));
}
function getReviewPartCatalog() {
  return {
    ...STATIC_PARTS,
    ...DYNAMIC_PARTS
  };
}
function setDynamicPages(pages) {
  DYNAMIC_PAGES = Object.fromEntries(pages.map((p) => [
    p.slug,
    p
  ]));
}
function getFullCatalog() {
  return {
    ...PAGE_CATALOG,
    ...DYNAMIC_PAGES
  };
}
function tierAllowsAccess(current, required) {
  return TIER_RANK[current] >= TIER_RANK[required];
}
function listNavPages(tier, groups = []) {
  return Object.values(getFullCatalog()).filter((p) => p.showInNav !== false).filter((p) => tierAllowsAccess(tier, p.authTier)).filter((p) => !p.requiredGroups || p.requiredGroups.length === 0 || groups.includes("platform-admin") || p.requiredGroups.some((g) => groups.includes(g))).sort((a, b) => a.title.localeCompare(b.title));
}
function resolvePage(slug) {
  return getFullCatalog()[slug] ?? null;
}
function resolveReviewPart(partSlug) {
  return getReviewPartCatalog()[partSlug] ?? null;
}
function listReviewParts() {
  return Object.values(getReviewPartCatalog()).sort((a, b) => a.partKey.localeCompare(b.partKey));
}
function getReviewPartDisplayTitle(title) {
  return title.replace(/^Part [A-O]: /, "");
}
var STATIC_PARTS, DYNAMIC_PARTS, REVIEW_PART_CATALOG, DYNAMIC_PAGES, PAGE_CATALOG, TIER_RANK;
var init_page_catalog = __esm({
  "src/lib/page-catalog.ts"() {
    "use strict";
    STATIC_PARTS = {
      "part-a": {
        partSlug: "part-a",
        partKey: "A",
        title: "Part A: Current Situation \u2014 The Numbers",
        authTier: "google"
      },
      "part-b": {
        partSlug: "part-b",
        partKey: "B",
        title: "Part B: The 10-Year Growth Model",
        authTier: "google"
      },
      "part-c": {
        partSlug: "part-c",
        partKey: "C",
        title: "Part C: Revenue Optimization Strategy",
        authTier: "google"
      },
      "part-d": {
        partSlug: "part-d",
        partKey: "D",
        title: "Part D: Cost Management",
        authTier: "google"
      },
      "part-e": {
        partSlug: "part-e",
        partKey: "E",
        title: "Part E: Risk Register",
        authTier: "google"
      },
      "part-f": {
        partSlug: "part-f",
        partKey: "F",
        title: "Part F: StarWORLD Membership Program",
        authTier: "google"
      },
      "part-g": {
        partSlug: "part-g",
        partKey: "G",
        title: "Part G: Immediate Actions (Next 30 Days)",
        authTier: "google"
      }
    };
    DYNAMIC_PARTS = {};
    __name(setDynamicReviewParts, "setDynamicReviewParts");
    __name(getReviewPartCatalog, "getReviewPartCatalog");
    REVIEW_PART_CATALOG = {
      ...STATIC_PARTS,
      ...DYNAMIC_PARTS
    };
    DYNAMIC_PAGES = {};
    __name(setDynamicPages, "setDynamicPages");
    __name(getFullCatalog, "getFullCatalog");
    PAGE_CATALOG = {
      home: {
        slug: "home",
        title: "Home",
        navLabel: "Home",
        showInNav: true,
        authTier: "public",
        sections: [
          {
            blockType: "hero",
            config: {
              headline: "Welcome",
              subtitle: "Your business application \u2014 configure pages, data and branding from the Admin area.",
              minTier: "public"
            }
          }
        ]
      },
      dashboard: {
        slug: "dashboard",
        title: "Dashboard",
        navLabel: "Dashboard",
        showInNav: true,
        authTier: "public",
        sections: [
          {
            blockType: "hero",
            config: {
              badge: "July 2026 \xB7 Exit Viability Review",
              headline: "Business Review",
              subtitle: "Exit-viability assessment for PT Taman Bintang Bali \u2014 revenue under pressure, margin erosion detected, shareholder seeking pathway out.",
              minTier: "public"
            }
          },
          // {
          //   blockType: 'chart_financial',
          //   config: { variant: 'dashboard', scenario: 'conservative', minTier: 'google' },
          // },
          {
            blockType: "action_checklist",
            config: {
              minTier: "pin"
            }
          },
          {
            blockType: "metric_grid",
            config: {
              minTier: "google"
            }
          },
          {
            blockType: "lever_accordion",
            config: {
              title: "The 5 Levers",
              minTier: "google"
            }
          }
        ]
      },
      summary: {
        slug: "summary",
        title: "Executive Summary",
        navLabel: "Summary",
        showInNav: true,
        authTier: "google",
        pdfExport: true,
        sections: [
          {
            blockType: "doc_markdown",
            config: {
              source: "executive-summary"
            }
          }
        ]
      },
      "ops-admin": {
        slug: "ops-admin",
        title: "Ops Admin",
        navLabel: "Ops Admin",
        showInNav: true,
        authTier: "pin",
        requiredGroups: [
          "ops-admin"
        ],
        sections: [
          {
            blockType: "ops_admin_tabs",
            config: {}
          }
        ]
      },
      review: {
        slug: "review",
        title: "Business Review",
        navLabel: "Review",
        showInNav: true,
        authTier: "google",
        pdfExport: true,
        sections: [
          {
            blockType: "review_blocks",
            config: {}
          }
        ]
      },
      "ops-tracking": {
        slug: "ops-tracking",
        title: "Financial Tracking",
        navLabel: "Tracking",
        showInNav: true,
        authTier: "google",
        sections: [
          {
            blockType: "kpi_cards",
            config: {
              variant: "ops"
            }
          },
          {
            blockType: "reports_rollup",
            config: {}
          },
          {
            blockType: "chart_financial",
            config: {
              variant: "ops"
            }
          },
          {
            blockType: "pnl_table",
            config: {}
          }
        ]
      },
      "ops-chat": {
        slug: "ops-chat",
        title: "AI Chat",
        navLabel: "AI Chat",
        showInNav: true,
        authTier: "google",
        sections: [
          {
            blockType: "chat_panel",
            config: {}
          }
        ]
      },
      tasks: {
        slug: "tasks",
        title: "Exit-Viability Tasks",
        navLabel: "Tasks",
        showInNav: true,
        authTier: "google",
        sections: []
      },
      admin: {
        slug: "admin",
        title: "Platform Admin",
        navLabel: "Admin",
        showInNav: true,
        authTier: "pin",
        sections: []
      },
      config: {
        slug: "config",
        title: "Source Config",
        navLabel: "Config",
        showInNav: true,
        authTier: "pin",
        sections: []
      },
      "terms-of-service": {
        slug: "terms-of-service",
        title: "Terms of Service",
        showInNav: false,
        authTier: "public",
        sections: [
          {
            blockType: "doc_markdown",
            config: {
              source: "terms-of-service.html"
            }
          }
        ]
      },
      "privacy-policy": {
        slug: "privacy-policy",
        title: "Privacy Policy",
        showInNav: false,
        authTier: "public",
        sections: [
          {
            blockType: "doc_markdown",
            config: {
              source: "privacy-policy.html"
            }
          }
        ]
      }
    };
    TIER_RANK = {
      public: 0,
      pin: 1,
      google: 2
    };
    __name(tierAllowsAccess, "tierAllowsAccess");
    __name(listNavPages, "listNavPages");
    __name(resolvePage, "resolvePage");
    __name(resolveReviewPart, "resolveReviewPart");
    __name(listReviewParts, "listReviewParts");
    __name(getReviewPartDisplayTitle, "getReviewPartDisplayTitle");
  }
});

// node_modules/workflow/dist/internal/builtins.js
import { registerStepFunction } from "workflow/internal/private";
async function __builtin_response_array_buffer() {
  return this.arrayBuffer();
}
__name(__builtin_response_array_buffer, "__builtin_response_array_buffer");
async function __builtin_response_json() {
  return this.json();
}
__name(__builtin_response_json, "__builtin_response_json");
async function __builtin_response_text() {
  return this.text();
}
__name(__builtin_response_text, "__builtin_response_text");
registerStepFunction("__builtin_response_array_buffer", __builtin_response_array_buffer);
registerStepFunction("__builtin_response_json", __builtin_response_json);
registerStepFunction("__builtin_response_text", __builtin_response_text);

// node_modules/workflow/dist/stdlib.js
import { registerStepFunction as registerStepFunction2 } from "workflow/internal/private";
async function fetch2(...args) {
  return globalThis.fetch(...args);
}
__name(fetch2, "fetch");
registerStepFunction2("step//workflow@4.7.0//fetch", fetch2);

// workflows/workbook-ingest/steps.ts
import { registerStepFunction as registerStepFunction3 } from "workflow/internal/private";
import { FatalError, RetryableError } from "workflow";

// src/domain/ai-workbook/extract-sheets.ts
import { read, utils } from "xlsx";
var SHEET_CATEGORIES = [
  "daily_sales",
  "profit_loss",
  "balance_sheet",
  "trial_balance",
  "general_ledger",
  "cost_of_sales",
  "month_on_month",
  "break_even",
  "variance",
  "summary_pl",
  "summary_bs",
  "other"
];
var MAX_SHEET_ROWS = 40;
var MAX_SHEET_COLS = 16;
var MAX_CELL_CHARS = 80;
function formatCell(v) {
  if (v == null) return "";
  if (typeof v === "number") {
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(2).replace(/\.00$/, "");
  }
  const s = String(v).replace(/\s+/g, " ").trim();
  return s.length > MAX_CELL_CHARS ? s.slice(0, MAX_CELL_CHARS - 1) + "\u2026" : s;
}
__name(formatCell, "formatCell");
function readFullGrid(sheet) {
  return utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: true
  });
}
__name(readFullGrid, "readFullGrid");
function capGrid(grid, maxRows, maxCols) {
  const capped = [];
  for (let r = 0; r < Math.min(grid.length, maxRows); r++) {
    const row = grid[r] ?? [];
    const trimmed = row.slice(0, maxCols);
    if (trimmed.some((c) => c != null && String(c).trim() !== "")) capped.push(trimmed);
  }
  return capped;
}
__name(capGrid, "capGrid");
function gridToText(grid) {
  const lines = grid.map((row, i) => {
    const cells = row.map((c) => formatCell(c));
    while (cells.length > 0 && cells[cells.length - 1] === "") cells.pop();
    return `R${i + 1}: ${cells.join(" | ")}`;
  });
  return lines.join("\n");
}
__name(gridToText, "gridToText");
function computeStats(tabName, grid) {
  let colCount = 0;
  let numericCells = 0;
  let nonEmptyCells = 0;
  for (const row of grid) {
    if (row.length > colCount) colCount = row.length;
    for (const cell of row) {
      if (cell == null || String(cell).trim() === "") continue;
      nonEmptyCells++;
      if (typeof cell === "number") {
        numericCells++;
      } else if (typeof cell === "string" && /^[-+]?\d[\d.,]*$/.test(cell.trim())) {
        numericCells++;
      }
    }
  }
  return {
    tabName,
    rowCount: grid.length,
    colCount,
    numericRatio: nonEmptyCells > 0 ? numericCells / nonEmptyCells : 0,
    nonEmptyCells
  };
}
__name(computeStats, "computeStats");
function extractSheetsWithStats(buf) {
  const wb = read(buf, {
    type: "buffer"
  });
  const sheets = [];
  for (const name of wb.SheetNames ?? []) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;
    const fullGrid = readFullGrid(sheet);
    if (fullGrid.length === 0) continue;
    const stats = computeStats(name, fullGrid);
    const text = gridToText(capGrid(fullGrid, MAX_SHEET_ROWS, MAX_SHEET_COLS));
    sheets.push({
      tabName: name,
      text,
      stats
    });
  }
  return sheets;
}
__name(extractSheetsWithStats, "extractSheetsWithStats");

// src/domain/ai-workbook/sheet-analysis.ts
var CURRENCY_PATTERNS = [
  [
    "IDR",
    /\b(?:IDR|Rp\.?|Rupiah)\b/i
  ],
  [
    "USD",
    /\b(?:USD|\$)\b/
  ],
  [
    "EUR",
    /\b(?:EUR|€)\b/
  ],
  [
    "GBP",
    /\b(?:GBP|£)\b/
  ]
];
var MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "januari",
  "februari",
  "maret",
  "april",
  "mei",
  "juni",
  "juli",
  "agustus",
  "september",
  "oktober",
  "november",
  "desember"
];
function periodPatterns() {
  return [
    /\b(19|20)\d{2}[-/](0?[1-9]|1[0-2])(?:[-/]\d{1,2})?\b/g,
    /\b(0?[1-9]|1[0-2])[-/](19|20)\d{2}\b/g,
    new RegExp(`\\b(?:${MONTH_NAMES.join("|")})\\b`, "gi"),
    /\bQ[1-4][ -]?(?:19|20)\d{2}\b/gi
  ];
}
__name(periodPatterns, "periodPatterns");
var LABEL_CATEGORY_MAP = [
  [
    "profit_loss",
    [
      "PROFIT & LOSS",
      "PROFIT AND LOSS",
      "Laba Rugi",
      "INCOME STATEMENT",
      "P&L",
      "EBITDA",
      "NET PROFIT",
      "NET INCOME",
      "LABA BERSIH",
      "RUGI"
    ]
  ],
  [
    "balance_sheet",
    [
      "BALANCE SHEET",
      "NERACA",
      "ASSET",
      "LIABILIT",
      "EKUITAS",
      "EQUITY",
      "TOTAL ASSETS"
    ]
  ],
  [
    "trial_balance",
    [
      "TRIAL BALANCE",
      "NERACA SALDO"
    ]
  ],
  [
    "general_ledger",
    [
      "GENERAL LEDGER",
      "BUKU BESAR",
      "JURNAL"
    ]
  ],
  [
    "cost_of_sales",
    [
      "COST OF SALES",
      "COGS",
      "HARGA POKOK",
      "FOOD COST",
      "BEVERAGE COST"
    ]
  ],
  [
    "break_even",
    [
      "BREAK EVEN",
      "BREAK-EVEN",
      "BEP",
      "TITIK IMPAS"
    ]
  ],
  [
    "daily_sales",
    [
      "DAILY SALES",
      "PENJUALAN HARIAN",
      "OMZET"
    ]
  ],
  [
    "month_on_month",
    [
      "MONTH ON MONTH",
      "MOM",
      "BULANAN"
    ]
  ],
  [
    "variance",
    [
      "VARIANCE",
      "VARIANSI",
      "SELISIH",
      "ACTUAL VS BUDGET",
      "ACTUAL VS"
    ]
  ],
  [
    "summary_pl",
    [
      "SUMMARY P&L",
      "RINGKASAN LABA RUGI",
      "SUMMARY PROFIT"
    ]
  ],
  [
    "summary_bs",
    [
      "SUMMARY BALANCE",
      "RINGKASAN NERACA"
    ]
  ]
];
function collectHints(text) {
  const currency = [];
  for (const [name, re] of CURRENCY_PATTERNS) {
    if (re.test(text)) currency.push(name);
  }
  const periods = [];
  for (const re of periodPatterns()) {
    const matches = text.match(re);
    if (matches) periods.push(...matches);
  }
  const labels = [];
  for (const [, terms] of LABEL_CATEGORY_MAP) {
    for (const term of terms) {
      if (text.toUpperCase().includes(term.toUpperCase())) labels.push(term);
    }
  }
  return {
    currency,
    periods,
    labels
  };
}
__name(collectHints, "collectHints");
function guessCategory(labels) {
  const scores = /* @__PURE__ */ new Map();
  for (const [category, terms] of LABEL_CATEGORY_MAP) {
    let score = 0;
    for (const term of terms) {
      if (labels.includes(term)) score += term.length;
    }
    if (score > 0) scores.set(category, score);
  }
  if (scores.size === 0) return null;
  const sorted = [
    ...scores.entries()
  ].sort((a, b) => b[1] - a[1]);
  if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) return null;
  return sorted[0][0];
}
__name(guessCategory, "guessCategory");
function bestGuess(values) {
  if (values.length === 0) return null;
  const counts = /* @__PURE__ */ new Map();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [
    ...counts.entries()
  ].sort((a, b) => b[1] - a[1])[0][0];
}
__name(bestGuess, "bestGuess");
function analyzeSheets(sheets) {
  const sheetHints = sheets.map((s) => {
    const { currency, periods, labels } = collectHints(s.text);
    return {
      tabName: s.tabName,
      rowCount: s.stats.rowCount,
      colCount: s.stats.colCount,
      numericRatio: s.stats.numericRatio,
      currencyHints: currency,
      periodHints: periods,
      labelHints: labels,
      likelyCategory: guessCategory(labels)
    };
  });
  const totalRows = sheetHints.reduce((acc, s) => acc + s.rowCount, 0);
  const totalNonEmptyCells = sheets.reduce((acc, s) => acc + s.stats.nonEmptyCells, 0);
  const weightedNumeric = sheets.reduce((acc, s) => acc + s.stats.numericRatio * s.stats.nonEmptyCells, 0);
  const allCurrency = sheetHints.flatMap((s) => s.currencyHints);
  const allPeriods = sheetHints.flatMap((s) => s.periodHints);
  return {
    workbook: {
      sheetCount: sheets.length,
      totalRows,
      totalNonEmptyCells,
      overallNumericRatio: totalNonEmptyCells > 0 ? weightedNumeric / totalNonEmptyCells : 0,
      currencyGuess: bestGuess(allCurrency),
      periodGuess: bestGuess(allPeriods)
    },
    sheets: sheetHints
  };
}
__name(analyzeSheets, "analyzeSheets");

// src/domain/ai-workbook/comprehend.ts
import { z } from "zod";
var MetricSchema = z.object({
  /** Period in YYYY-MM (annual totals may use YYYY-12). */
  period: z.string().regex(/^\d{4}-\d{2}$/),
  dataType: z.enum([
    "actual",
    "forecast"
  ]),
  scenario: z.enum([
    "actual",
    "conservative",
    "realistic",
    "aspirational"
  ]),
  revenue: z.number().nullable().optional(),
  ebitda: z.number().nullable().optional(),
  netIncome: z.number().nullable().optional(),
  guests: z.number().nullable().optional(),
  staffCost: z.number().nullable().optional()
});
var SheetComprehensionSchema = z.object({
  /** Exact tab name as it appears in the workbook. */
  tabName: z.string(),
  category: z.enum(SHEET_CATEGORIES),
  /** Human-readable title for the dynamic page. */
  title: z.string(),
  /** One-paragraph comprehension of what this sheet contains. */
  summary: z.string(),
  /** Detected period, e.g. "June 2026" — null when not detectable. */
  periodHint: z.string().nullable().optional(),
  /** Column headers (first meaningful row). */
  columns: z.array(z.string()).optional(),
  rowCount: z.number().int().nonnegative().optional(),
  /** Per-period metrics found on THIS sheet. */
  metrics: z.array(MetricSchema).optional()
});
var WorkbookComprehensionSchema = z.object({
  workbook: z.object({
    title: z.string(),
    company: z.string().nullable().optional(),
    period: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
    summary: z.string()
  }),
  sheets: z.array(SheetComprehensionSchema),
  /**
  * Normalized financial projections consolidated across ALL sheets.
  * This is the source for the financial_projections table.
  */
  projections: z.array(MetricSchema),
  /**
  * Template suggestion from the available template catalog
  * (TEMPLATE_CATALOG ids, e.g. "financial-analytics", "restaurant").
  */
  template: z.object({
    id: z.string(),
    confidence: z.number().min(0).max(1).optional(),
    reason: z.string().optional()
  }).optional()
});
var ComprehendError = class extends Error {
  static {
    __name(this, "ComprehendError");
  }
  constructor(message, options) {
    super(message, options);
    this.name = "ComprehendError";
  }
};
var ComprehendHttpError = class extends ComprehendError {
  static {
    __name(this, "ComprehendHttpError");
  }
  status;
  /** Retry-After header value in seconds, when present. */
  retryAfterSeconds;
  constructor(status, message, retryAfterSeconds = null) {
    super(message);
    this.name = "ComprehendHttpError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
};
var ComprehendValidationError = class extends ComprehendError {
  static {
    __name(this, "ComprehendValidationError");
  }
  constructor(message, options) {
    super(message, options);
    this.name = "ComprehendValidationError";
  }
};
var SYSTEM_PROMPT = "You are a precise financial analyst and workbook interpreter. You read raw spreadsheet dumps and return ONLY valid JSON matching the requested schema exactly. Never invent data that is not present in the sheets \u2014 leave metrics null when absent.";
function renderHintsSection(hints) {
  const wb = hints.workbook;
  const lines = [
    `- Workbook: ${wb.sheetCount} sheet(s), ${wb.totalRows} total rows, ${Math.round(wb.overallNumericRatio * 100)}% numeric cells.`
  ];
  if (wb.currencyGuess) lines.push(`- Currency guess: ${wb.currencyGuess}`);
  if (wb.periodGuess) lines.push(`- Period guess: ${wb.periodGuess}`);
  for (const s of hints.sheets) {
    const parts = [
      `"${s.tabName}": ${s.rowCount} rows \xD7 ${s.colCount} cols, ${Math.round(s.numericRatio * 100)}% numeric`
    ];
    if (s.currencyHints.length > 0) parts.push(`currency [${s.currencyHints.join(",")}]`);
    if (s.periodHints.length > 0) parts.push(`periods [${s.periodHints.join(", ")}]`);
    if (s.labelHints.length > 0) parts.push(`labels [${s.labelHints.join(", ")}]`);
    if (s.likelyCategory) parts.push(`category-guess ${s.likelyCategory}`);
    lines.push(`  - Sheet ${parts.join("; ")}`);
  }
  return lines.join("\n");
}
__name(renderHintsSection, "renderHintsSection");
function buildComprehensionPrompt(blocks, hints) {
  const sheetBlocks = blocks.map((b) => `===== SHEET: ${b.tabName} =====
${b.text}
`).join("\n");
  const hintsSection = hints ? `DETERMINISTIC PRE-ANALYSIS (generated by code \u2014 use as strong priors, but ALWAYS verify against the actual dump; category-guess is not authoritative):
${renderHintsSection(hints)}

` : "";
  return `Analyze the following workbook. Every sheet of the workbook is dumped below as "R<row>: <cells>".

TASKS:
1. Understand the workbook as a whole (company, period, currency, purpose).
2. For EACH sheet: identify its category, a human-readable title, a short comprehension summary, detected period (e.g. "June 2026"), column headers, row count, and any per-period financial metrics (revenue, EBITDA, net income, guests, staff cost) you can read from the sheet.
3. Consolidate ALL period-level financial data across the whole workbook into a single "projections" array: one entry per (period YYYY-MM, dataType actual|forecast, scenario actual|conservative|realistic|aspirational). Use the best source for each period (e.g. a P&L statement for actuals, a BEP table or budget sheet for forecasts). Annual totals use YYYY-12. Only include entries where at least one metric is present.
4. Suggest the most appropriate app template id from this available catalog: financial-analytics, restaurant, hotel, education, ecommerce-retail, healthcare, manufacturing, professional-services, real-estate, supply-chain (confidence 0..1).

RULES:
- periods: YYYY-MM only (e.g. "2026-06", "2025-12" for annual).
- dataType "actual" for reported/actual figures, "forecast" for projections/budgets.
- scenario: "actual" for actuals; "conservative" for base forecasts; "realistic"/"aspirational" when the sheet explicitly labels scenarios.
- Amounts are full IDR integers (no "K" shorthand). Round to integers.
- Leave a metric null when the sheet does not contain it for that period.
- category must be one of: ${SHEET_CATEGORIES.join(", ")}.

${hintsSection}WORKBOOK DUMP:
${sheetBlocks}`;
}
__name(buildComprehensionPrompt, "buildComprehensionPrompt");
function stripCodeFence(reply) {
  const match = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1] : reply;
}
__name(stripCodeFence, "stripCodeFence");
async function comprehendOnce(blocks, options) {
  const { model = "gpt-4o", hints, apiKey, baseUrl = "https://api.openai.com/v1" } = options;
  if (blocks.length === 0) {
    throw new ComprehendValidationError("Workbook contains no readable sheets");
  }
  const prompt = buildComprehensionPrompt(blocks, hints);
  let response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 16384,
        response_format: {
          type: "json_object"
        }
      })
    });
  } catch (err) {
    throw new ComprehendError(`OpenAI request failed: ${err instanceof Error ? err.message : String(err)}`, {
      cause: err
    });
  }
  if (!response.ok) {
    const errBody = await response.text().catch(() => "Unknown error");
    let retryAfterSeconds = null;
    const retryAfter = response.headers.get("retry-after");
    if (retryAfter) {
      const parsed2 = Number(retryAfter);
      if (Number.isFinite(parsed2) && parsed2 >= 0) retryAfterSeconds = parsed2;
    }
    throw new ComprehendHttpError(response.status, `OpenAI API error (${response.status}): ${errBody}`, retryAfterSeconds);
  }
  let result;
  try {
    result = await response.json();
  } catch (err) {
    throw new ComprehendValidationError(`OpenAI response was not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
  const reply = result.choices?.[0]?.message?.content ?? "";
  let parsed;
  try {
    parsed = JSON.parse(stripCodeFence(reply));
  } catch {
    throw new ComprehendValidationError("AI response was not valid JSON: " + reply.slice(0, 500));
  }
  let comprehension;
  try {
    comprehension = WorkbookComprehensionSchema.parse(parsed);
  } catch (err) {
    const first = err instanceof z.ZodError ? err.issues[0] : null;
    const detail = first ? `${first.path.join(".") || "root"}: ${first.message}` : String(err);
    throw new ComprehendValidationError(`AI response failed schema validation: ${detail}`, {
      cause: err
    });
  }
  return {
    comprehension,
    model,
    promptLength: prompt.length
  };
}
__name(comprehendOnce, "comprehendOnce");

// workflows/workbook-ingest/progress.ts
async function writeProgressChunk(writable, chunk) {
  const writer = writable.getWriter();
  try {
    await writer.write(chunk);
  } finally {
    writer.releaseLock();
  }
}
__name(writeProgressChunk, "writeProgressChunk");
async function closeProgressStream(writable) {
  await writable.close();
}
__name(closeProgressStream, "closeProgressStream");

// workflows/workbook-ingest/db.ts
import { Client } from "pg";
async function withPgClient(connectionString, fn) {
  if (!connectionString) {
    throw new Error("No database connection string provided.");
  }
  const client = new Client({
    connectionString
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}
__name(withPgClient, "withPgClient");
async function executeOne(client, sql, params = []) {
  const result = await client.query(sql, params);
  return result.rowCount ?? 0;
}
__name(executeOne, "executeOne");
async function queryRows(client, sql, params = []) {
  const result = await client.query(sql, params);
  return result.rows;
}
__name(queryRows, "queryRows");

// workflows/workbook-ingest/steps.ts
function hasSpreadsheetMagic(data) {
  const b = data;
  if (b[0] === 80 && b[1] === 75) return true;
  if (b[0] === 208 && b[1] === 207 && b[2] === 17 && b[3] === 224 && b[4] === 161 && b[5] === 177 && b[6] === 26 && b[7] === 225) {
    return true;
  }
  return false;
}
__name(hasSpreadsheetMagic, "hasSpreadsheetMagic");
async function loadWorkbookStep(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new FatalError("No workbook files were provided.");
  }
  return files.map((f) => {
    if (!f || typeof f.name !== "string" || !(f.data instanceof Uint8Array)) {
      throw new FatalError("Invalid file entry: expected { name, data: Uint8Array }.");
    }
    if (f.data.byteLength === 0) {
      throw new FatalError(`Workbook "${f.name}" is empty.`);
    }
    if (!hasSpreadsheetMagic(f.data)) {
      throw new FatalError(`Workbook "${f.name}" is not a readable .xlsx/.xls file (unexpected file signature).`);
    }
    return f.data;
  });
}
__name(loadWorkbookStep, "loadWorkbookStep");
async function extractSheetsStep(buffers) {
  const all = [];
  for (const buf of buffers) {
    let extracted;
    try {
      extracted = extractSheetsWithStats(buf);
    } catch (err) {
      throw new FatalError(`Workbook is not a readable .xlsx file: ${err instanceof Error ? err.message : String(err)}`);
    }
    all.push(...extracted);
  }
  if (all.length === 0) {
    throw new FatalError("Workbook contains no readable sheets.");
  }
  return all;
}
__name(extractSheetsStep, "extractSheetsStep");
async function analyzeSheetsStep(sheets) {
  return analyzeSheets(sheets);
}
__name(analyzeSheetsStep, "analyzeSheetsStep");
async function comprehendWorkbookStep(sheets, hints, model = "gpt-4o", openaiApiKey) {
  const apiKey = openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new FatalError("OpenAI API key not configured. Set it in Config > OpenAI Key (via the reseed route) or set OPENAI_API_KEY env var.");
  }
  const blocks = sheets.map(({ tabName, text }) => ({
    tabName,
    text
  }));
  try {
    return await comprehendOnce(blocks, {
      model,
      hints,
      apiKey
    });
  } catch (err) {
    if (err instanceof ComprehendHttpError) {
      if (err.status === 429) {
        const retryAfterSeconds = err.retryAfterSeconds ?? 1;
        throw new RetryableError(err.message, {
          retryAfter: `${retryAfterSeconds}s`
        });
      }
      throw err;
    }
    if (err instanceof ComprehendValidationError) {
      throw err;
    }
    throw err;
  }
}
__name(comprehendWorkbookStep, "comprehendWorkbookStep");
async function emitProgressStep(writable, chunk) {
  await writeProgressChunk(writable, chunk);
}
__name(emitProgressStep, "emitProgressStep");
async function closeProgressStep(writable) {
  await closeProgressStream(writable);
}
__name(closeProgressStep, "closeProgressStep");
async function populateProjectionsStep(comprehension, dbUrl) {
  let count = 0;
  await withPgClient(dbUrl, async (db) => {
    for (const metric of comprehension.projections) {
      const year = Number(metric.period.slice(0, 4));
      const month = Number(metric.period.slice(5, 7));
      const revenue = Math.round(metric.revenue ?? 0);
      const ebitda = Math.round(metric.ebitda ?? 0);
      const netIncome = Math.round(metric.netIncome ?? 0);
      const guests = Math.round(metric.guests ?? 0);
      const staffCost = Math.round(metric.staffCost ?? 0);
      const pnlLines = JSON.stringify([
        {
          key: "revenue",
          label: "Revenue",
          value: revenue
        },
        {
          key: "ebitda",
          label: "EBITDA",
          value: ebitda
        },
        {
          key: "net_income",
          label: "Net Income",
          value: netIncome
        },
        {
          key: "staff_cost",
          label: "Staff Cost",
          value: staffCost
        },
        {
          key: "guests",
          label: "Guests",
          value: guests
        }
      ]);
      await executeOne(db, `INSERT INTO financial_projections (period, year, month, data_type, scenario, revenue, ebitda, net_income, guests, staff_cost, pnl_lines)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
         ON CONFLICT (period, data_type, scenario)
         DO UPDATE SET
           revenue = EXCLUDED.revenue,
           ebitda = EXCLUDED.ebitda,
           net_income = EXCLUDED.net_income,
           guests = EXCLUDED.guests,
           staff_cost = EXCLUDED.staff_cost,
           pnl_lines = EXCLUDED.pnl_lines;`, [
        metric.period,
        year,
        month,
        metric.dataType,
        metric.scenario,
        revenue,
        ebitda,
        netIncome,
        guests,
        staffCost,
        pnlLines
      ]);
      count++;
    }
  });
  return count;
}
__name(populateProjectionsStep, "populateProjectionsStep");
function normalizeSlug(name) {
  return name.toLowerCase().replace(/[&]/g, "and").replace(/[\s]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
__name(normalizeSlug, "normalizeSlug");
var SHEET_CATEGORY_BLOCKS = {
  daily_sales: [
    {
      blockType: "sheet_viewer",
      title: "Daily Sales \u2014 Data"
    },
    {
      blockType: "chart_financial",
      title: "Daily Sales \u2014 Trends"
    }
  ],
  profit_loss: [
    {
      blockType: "pnl_table",
      title: "Profit & Loss \u2014 Statement"
    },
    {
      blockType: "chart_financial",
      title: "Profit & Loss \u2014 Trends"
    }
  ],
  balance_sheet: [
    {
      blockType: "sheet_viewer",
      title: "Balance Sheet \u2014 Data"
    }
  ],
  trial_balance: [
    {
      blockType: "sheet_viewer",
      title: "Trial Balance \u2014 Data"
    }
  ],
  general_ledger: [
    {
      blockType: "sheet_viewer",
      title: "General Ledger \u2014 Data"
    }
  ],
  cost_of_sales: [
    {
      blockType: "sheet_viewer",
      title: "Cost of Sales \u2014 Data"
    }
  ],
  month_on_month: [
    {
      blockType: "chart_financial",
      title: "Month on Month \u2014 Comparison"
    }
  ],
  break_even: [
    {
      blockType: "kpi_cards",
      title: "Break-Even \u2014 KPIs"
    },
    {
      blockType: "chart_financial",
      title: "Break-Even \u2014 Trend"
    }
  ],
  variance: [
    {
      blockType: "chart_financial",
      title: "Monthly Variance \u2014 Analysis"
    }
  ],
  summary_pl: [
    {
      blockType: "chart_financial",
      title: "Multi-Year P&L \u2014 Trend"
    },
    {
      blockType: "pnl_table",
      title: "Multi-Year P&L \u2014 Statement"
    }
  ],
  summary_bs: [
    {
      blockType: "sheet_viewer",
      title: "Multi-Year Balance Sheet \u2014 Data"
    }
  ],
  other: [
    {
      blockType: "sheet_viewer",
      title: "Sheet Data"
    }
  ]
};
async function upsertSheetPagesStep(comprehension, dbUrl) {
  const created = [];
  let sortOrder = 100;
  await withPgClient(dbUrl, async (db) => {
    for (const sheet of comprehension.sheets) {
      const slug = `sheet-${normalizeSlug(sheet.tabName)}`;
      const blocks = SHEET_CATEGORY_BLOCKS[sheet.category] ?? SHEET_CATEGORY_BLOCKS.other;
      const pageRows = await queryRows(db, `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav)
         VALUES (gen_random_uuid()::TEXT, $1, $2, 'google', $3, $4, true)
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           auth_tier = EXCLUDED.auth_tier,
           sort_order = EXCLUDED.sort_order,
           nav_label = EXCLUDED.nav_label,
           show_in_nav = EXCLUDED.show_in_nav
         RETURNING id;`, [
        slug,
        sheet.title,
        sortOrder++,
        sheet.title
      ]);
      const pageId = pageRows[0]?.id;
      if (!pageId) continue;
      await executeOne(db, `DELETE FROM page_sections WHERE page_id = $1;`, [
        pageId
      ]);
      const summaryMarkdown = [
        `# ${sheet.title}`,
        "",
        sheet.summary,
        sheet.periodHint ? `
**Period**: ${sheet.periodHint}` : "",
        `**Rows**: ${sheet.rowCount ?? "\u2014"}  |  **Columns**: ${(sheet.columns ?? []).length || "\u2014"}`,
        ""
      ].filter((l) => l !== "").join("\n");
      await executeOne(db, `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
         VALUES (gen_random_uuid()::TEXT, $1, 0, 'doc_markdown', $2::jsonb);`, [
        pageId,
        JSON.stringify({
          title: "About this sheet",
          markdown: summaryMarkdown
        })
      ]);
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        await executeOne(db, `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
           VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4::jsonb);`, [
          pageId,
          i + 1,
          block.blockType,
          JSON.stringify({
            sheet: sheet.tabName,
            title: block.title
          })
        ]);
      }
      created.push({
        slug,
        title: sheet.title
      });
    }
  });
  return created;
}
__name(upsertSheetPagesStep, "upsertSheetPagesStep");
async function saveSnippetsStep(comprehension, model, dbUrl) {
  let count = 0;
  await withPgClient(dbUrl, async (db) => {
    await executeOne(db, `INSERT INTO knowledge_snippets (id, key, category, content)
       VALUES (gen_random_uuid()::TEXT, $1, 'document', $2)
       ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;`, [
      "workbook_comprehension",
      JSON.stringify({
        model,
        comprehendedAt: (/* @__PURE__ */ new Date()).toISOString(),
        comprehension
      })
    ]);
    count++;
    for (const sheet of comprehension.sheets) {
      const key = `sheet_${normalizeSlug(sheet.tabName)}`;
      const markdown = [
        `# ${sheet.title}`,
        "",
        sheet.summary,
        "",
        `**Category**: ${sheet.category}`,
        sheet.periodHint ? `**Period**: ${sheet.periodHint}` : ""
      ].filter((l) => l !== "").join("\n");
      await executeOne(db, `INSERT INTO knowledge_snippets (id, key, category, content)
         VALUES (gen_random_uuid()::TEXT, $1, 'sheet', $2)
         ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;`, [
        key,
        markdown
      ]);
      count++;
    }
  });
  return count;
}
__name(saveSnippetsStep, "saveSnippetsStep");
async function selectTemplateStep(comprehension) {
  const aiTemplate = comprehension.template;
  const aiConfidence = aiTemplate?.confidence ?? 0.5;
  const sheetCategories = comprehension.sheets.map((s) => s.category);
  const templateProfiles = {
    "financial-analytics": {
      categories: [
        "profit_loss",
        "balance_sheet",
        "break_even",
        "variance",
        "trial_balance",
        "summary_pl",
        "summary_bs"
      ],
      keywords: [
        "financial",
        "pnl",
        "profit",
        "loss",
        "balance",
        "break even",
        "bep",
        "variance"
      ]
    },
    restaurant: {
      categories: [
        "daily_sales",
        "cost_of_sales",
        "profit_loss",
        "break_even",
        "month_on_month"
      ],
      keywords: [
        "restaurant",
        "kitchen",
        "menu",
        "food",
        "beverage",
        "covers",
        "guests"
      ]
    },
    hotel: {
      categories: [
        "daily_sales",
        "profit_loss",
        "month_on_month",
        "cost_of_sales"
      ],
      keywords: [
        "hotel",
        "rooms",
        "occupancy",
        "revpar",
        "housekeeping"
      ]
    },
    "ecommerce-retail": {
      categories: [
        "daily_sales",
        "profit_loss",
        "cost_of_sales",
        "variance"
      ],
      keywords: [
        "ecommerce",
        "retail",
        "online",
        "sku",
        "cart",
        "conversion"
      ]
    },
    healthcare: {
      categories: [
        "profit_loss",
        "balance_sheet",
        "cost_of_sales"
      ],
      keywords: [
        "health",
        "patient",
        "clinic",
        "medical",
        "pharmacy"
      ]
    },
    "supply-chain": {
      categories: [
        "profit_loss",
        "cost_of_sales",
        "variance",
        "balance_sheet"
      ],
      keywords: [
        "supply",
        "logistics",
        "inventory",
        "warehouse",
        "shipping"
      ]
    },
    "real-estate": {
      categories: [
        "profit_loss",
        "balance_sheet",
        "summary_bs"
      ],
      keywords: [
        "real estate",
        "property",
        "lease",
        "rent",
        "mortgage"
      ]
    },
    education: {
      categories: [
        "profit_loss",
        "month_on_month"
      ],
      keywords: [
        "education",
        "student",
        "tuition",
        "course",
        "enrollment"
      ]
    },
    "professional-services": {
      categories: [
        "profit_loss",
        "balance_sheet",
        "cost_of_sales"
      ],
      keywords: [
        "consulting",
        "services",
        "billing",
        "client",
        "project"
      ]
    },
    manufacturing: {
      categories: [
        "profit_loss",
        "cost_of_sales",
        "balance_sheet",
        "variance"
      ],
      keywords: [
        "manufacturing",
        "production",
        "factory",
        "bill of materials",
        "work order"
      ]
    }
  };
  function categoryOverlap(tmplId) {
    const profile = templateProfiles[tmplId];
    if (!profile) return 0;
    const matches = sheetCategories.filter((c) => profile.categories.includes(c));
    return sheetCategories.length > 0 ? matches.length / sheetCategories.length : 0;
  }
  __name(categoryOverlap, "categoryOverlap");
  function keywordMatch(tmplId) {
    const profile = templateProfiles[tmplId];
    if (!profile) return 0;
    const text = [
      comprehension.workbook.title,
      comprehension.workbook.summary,
      comprehension.workbook.company ?? ""
    ].join(" ").toLowerCase();
    const matches = profile.keywords.filter((kw) => text.includes(kw));
    return profile.keywords.length > 0 ? matches.length / profile.keywords.length : 0;
  }
  __name(keywordMatch, "keywordMatch");
  const suggestedScore = aiTemplate?.id ? aiConfidence * (categoryOverlap(aiTemplate.id) * 0.7 + keywordMatch(aiTemplate.id) * 0.3) : -1;
  const allScores = Object.keys(templateProfiles).map((id) => ({
    id,
    score: categoryOverlap(id) * 0.7 + keywordMatch(id) * 0.3,
    reason: `${Math.round(categoryOverlap(id) * 100)}% category match, ${Math.round(keywordMatch(id) * 100)}% keyword match`
  }));
  allScores.sort((a, b) => b.score - a.score);
  const recommended = suggestedScore > allScores[0].score ? aiTemplate.id : allScores[0].id;
  const recommendedScore = recommended === aiTemplate?.id ? suggestedScore : allScores[0].score;
  return {
    recommended,
    aiSuggestion: aiTemplate?.id ?? null,
    aiConfidence,
    score: Math.round(recommendedScore * 100) / 100,
    reason: allScores[0].reason,
    alternatives: allScores.filter((s) => s.id !== recommended).slice(0, 3).map((s) => ({
      id: s.id,
      score: Math.round(s.score * 100) / 100
    }))
  };
}
__name(selectTemplateStep, "selectTemplateStep");
async function registerDynamicPagesStep(comprehension) {
  try {
    const { setDynamicPages: setDynamicPages2 } = await Promise.resolve().then(() => (init_page_catalog(), page_catalog_exports));
    const pages = comprehension.sheets.map((sheet) => ({
      slug: `sheet-${normalizeSlug(sheet.tabName)}`,
      title: sheet.title,
      authTier: "google",
      navLabel: sheet.title,
      showInNav: true,
      sections: [
        {
          blockType: "doc_markdown",
          config: {
            source: `sheet_${normalizeSlug(sheet.tabName)}`,
            title: sheet.title
          }
        },
        ...(SHEET_CATEGORY_BLOCKS[sheet.category] ?? SHEET_CATEGORY_BLOCKS.other).map((b) => ({
          blockType: b.blockType,
          config: {
            sheet: sheet.tabName,
            title: b.title
          }
        }))
      ]
    }));
    setDynamicPages2(pages);
    return pages.length;
  } catch {
    return 0;
  }
}
__name(registerDynamicPagesStep, "registerDynamicPagesStep");
function parseReviewParts(markdown) {
  const parts = [];
  const headerRe = /^#{2,3}\s+Part\s+([A-Z]):\s*(.+)$/m;
  const sections = markdown.split(/\n(?=#{2,3}\s+Part\s+[A-Z]:)/);
  let sortOrder = 0;
  for (const section of sections) {
    const match = headerRe.exec(section);
    if (!match) continue;
    const [, letter, rawTitle] = match;
    const title = (rawTitle ?? section.split("\n")[0]?.replace(/^#{2,3}\s+Part\s+[A-Z]:\s*/, "") ?? "").trim();
    const slug = `part-${(letter ?? "a").toLowerCase()}`;
    const partKey = `part_${(letter ?? "a").toLowerCase()}`;
    parts.push({
      slug,
      partKey,
      title,
      sortOrder: sortOrder++,
      markdown: section.trim()
    });
  }
  return parts;
}
__name(parseReviewParts, "parseReviewParts");
async function generateBusinessReviewStep(comprehension, apiKey, dbUrl, model = "gpt-4o") {
  const prompt = buildGenPrompt(comprehension, "businessReview");
  let markdown;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a precise financial analyst and business writer. Return ONLY valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 16384,
        response_format: {
          type: "json_object"
        }
      })
    });
    if (!response.ok) throw new Error(`OpenAI API error (${response.status})`);
    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(reply);
    markdown = parsed.businessReview ?? "";
  } catch (err) {
    throw new Error(`Business Review generation failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!markdown.trim()) return 0;
  const parts = parseReviewParts(markdown);
  let saved = 0;
  await withPgClient(dbUrl, async (db) => {
    for (const part of parts) {
      await executeOne(db, `INSERT INTO business_review_parts (id, slug, part_key, title, sort_order, auth_tier, markdown)
         VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, 'google', $5)
         ON CONFLICT (slug) DO UPDATE SET
           part_key = EXCLUDED.part_key,
           title = EXCLUDED.title,
           sort_order = EXCLUDED.sort_order,
           markdown = EXCLUDED.markdown;`, [
        part.slug,
        part.partKey,
        part.title,
        part.sortOrder,
        part.markdown
      ]);
      saved++;
    }
  });
  return saved;
}
__name(generateBusinessReviewStep, "generateBusinessReviewStep");
async function generateExecutiveSummaryStep(comprehension, apiKey, dbUrl, model = "gpt-4o") {
  const prompt = buildGenPrompt(comprehension, "executiveSummary");
  let markdown;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a precise financial analyst and business writer. Return ONLY valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 16384,
        response_format: {
          type: "json_object"
        }
      })
    });
    if (!response.ok) throw new Error(`OpenAI API error (${response.status})`);
    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(reply);
    markdown = parsed.executiveSummary ?? "";
  } catch (err) {
    throw new Error(`Executive Summary generation failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!markdown.trim()) return false;
  await withPgClient(dbUrl, async (db) => {
    await executeOne(db, `INSERT INTO knowledge_snippets (id, key, category, content)
       VALUES (gen_random_uuid()::TEXT, 'executive_summary', 'document', $1)
       ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;`, [
      markdown
    ]);
  });
  return true;
}
__name(generateExecutiveSummaryStep, "generateExecutiveSummaryStep");
async function generateDashboardStep(comprehension, apiKey, dbUrl, model = "gpt-4o") {
  const prompt = buildGenPrompt(comprehension, "dashboardData");
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: 'You are a precise financial analyst. Return ONLY valid JSON with keys "actionPhases", "targetRows", and "levers".'
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 16384,
        response_format: {
          type: "json_object"
        }
      })
    });
    if (!response.ok) throw new Error(`OpenAI API error (${response.status})`);
    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content ?? "";
    if (!reply) return false;
    const parsed = JSON.parse(reply);
    if (!parsed.actionPhases && !parsed.targetRows && !parsed.levers) return false;
    await withPgClient(dbUrl, async (db) => {
      await executeOne(db, `INSERT INTO knowledge_snippets (id, key, category, content)
         VALUES (gen_random_uuid()::TEXT, 'dashboard_data', 'document', $1)
         ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;`, [
        JSON.stringify(parsed)
      ]);
    });
    return true;
  } catch {
    return false;
  }
}
__name(generateDashboardStep, "generateDashboardStep");
function buildGenPrompt(comprehension, target) {
  const { workbook, sheets, projections } = comprehension;
  const context = [
    `# Generated Content: ${target === "businessReview" ? "Business Review" : target === "executiveSummary" ? "Executive Summary" : "Dashboard Data"}`,
    "",
    `## Workbook Summary`,
    `**Title**: ${workbook.title}`,
    `**Company**: ${workbook.company ?? "N/A"}`,
    `**Period**: ${workbook.period ?? "N/A"}`,
    `**Currency**: ${workbook.currency ?? "IDR"}`,
    workbook.summary,
    "",
    `## Sheet Inventory (${sheets.length} sheets)`,
    ...sheets.map((s) => `- **${s.tabName}** (${s.category}): ${s.title} \u2014 ${s.summary}${s.periodHint ? ` [${s.periodHint}]` : ""}`),
    "",
    `## Consolidated Financial Projections`,
    "```json",
    JSON.stringify(projections, null, 2),
    "```"
  ].join("\n");
  if (target === "businessReview") {
    return `${context}

Generate ONLY a "businessReview" document as a JSON object with a single key "businessReview" containing a comprehensive Markdown business review. Include sections for each part of the business: Part A: Revenue & Sales, Part B: Costs & Margins, Part C: Profitability & EBITDA, Part D: Break-Even Analysis, Part E: Trends & Projections, Part F: Risks & Recommendations. Use ## Part X: Title headers. Include data tables from the projections.`;
  }
  if (target === "executiveSummary") {
    return `${context}

Generate ONLY an "executiveSummary" document as a JSON object with a single key "executiveSummary" containing a concise Markdown executive summary (1-2 pages) highlighting the key financial metrics, trends, risks, and actionable recommendations from the workbook data.`;
  }
  return `${context}

Generate ONLY a JSON object with keys "actionPhases" (array of {phase, description}), "targetRows" (array of {label, value, unit}), and "levers" (array of {name, impact, actions[]}) based on the financial data. Focus on actionable operational recommendations.`;
}
__name(buildGenPrompt, "buildGenPrompt");
registerStepFunction3("step//./workflows/workbook-ingest/steps//loadWorkbookStep", loadWorkbookStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//extractSheetsStep", extractSheetsStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//analyzeSheetsStep", analyzeSheetsStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//comprehendWorkbookStep", comprehendWorkbookStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//emitProgressStep", emitProgressStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//closeProgressStep", closeProgressStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//populateProjectionsStep", populateProjectionsStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//upsertSheetPagesStep", upsertSheetPagesStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//saveSnippetsStep", saveSnippetsStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//selectTemplateStep", selectTemplateStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//registerDynamicPagesStep", registerDynamicPagesStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//generateBusinessReviewStep", generateBusinessReviewStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//generateExecutiveSummaryStep", generateExecutiveSummaryStep);
registerStepFunction3("step//./workflows/workbook-ingest/steps//generateDashboardStep", generateDashboardStep);

// node_modules/@workflow/builders/dist/serde-checker.js
import builtinModules from "builtin-modules";
var nodeBuiltins = builtinModules.join("|");
var nodeImportExtractRegex = new RegExp(`(?:from\\s+['"](?:node:)?((?:${nodeBuiltins})(?:/[^'"]*)?)['"]|require\\s*\\(\\s*['"](?:node:)?((?:${nodeBuiltins})(?:/[^'"]*)?)['"]\\s*\\))`, "g");

// node_modules/@workflow/core/dist/runtime.js
import { CorruptedEventLogError, EntityConflictError, PreconditionFailedError, ReplayDivergenceError as ReplayDivergenceError2, RUN_ERROR_CODES, RunExpiredError, WorkflowRuntimeError as WorkflowRuntimeError3 } from "@workflow/errors";
import { setWorkflowBasePath } from "@workflow/utils";
import { parseWorkflowName as parseWorkflowName2 } from "@workflow/utils/parse-name";
import { getQueueTopicPrefix, resolveQueueNamespace, SPEC_VERSION_CURRENT as SPEC_VERSION_CURRENT2, SPEC_VERSION_LEGACY as SPEC_VERSION_LEGACY2, WorkflowInvokePayloadSchema } from "@workflow/world";
import { classifyRunError, isRetryableWorldError, isWorldContractError } from "../node_modules/@workflow/core/dist/classify-error.js";
import { importKey as importKey2 } from "../node_modules/@workflow/core/dist/encryption.js";
import { WorkflowSuspension as WorkflowSuspension2 } from "../node_modules/@workflow/core/dist/global.js";
import { runtimeLogger as runtimeLogger3 } from "../node_modules/@workflow/core/dist/logger.js";
import { MAX_QUEUE_DELIVERIES, REPLAY_DIVERGENCE_MAX_RETRIES, REPLAY_TIMEOUT_MAX_RETRIES, REPLAY_TIMEOUT_MS } from "../node_modules/@workflow/core/dist/runtime/constants.js";
import { getQueueOverhead, getWorkflowQueueName as getWorkflowQueueName2, getWorkflowRunEvents, handleHealthCheckMessage, parseHealthCheckPayload, queueMessage, stateUpdatedAtForCreate, withHealthCheck, withPreconditionRetry } from "../node_modules/@workflow/core/dist/runtime/helpers.js";
import { handleSuspension } from "../node_modules/@workflow/core/dist/runtime/suspension-handler.js";
import { getWorld as getWorld2, getWorldHandlers } from "../node_modules/@workflow/core/dist/runtime/world.js";
import { remapErrorStack } from "../node_modules/@workflow/core/dist/source-map.js";
import * as Attribute3 from "../node_modules/@workflow/core/dist/telemetry/semantic-conventions.js";
import { linkToCurrentContext, trace as trace3, withTraceContext, withWorkflowBaggage } from "../node_modules/@workflow/core/dist/telemetry.js";
import { getErrorName, getErrorStack, normalizeUnknownError } from "../node_modules/@workflow/core/dist/types.js";
import { buildWorkflowSuspensionMessage } from "../node_modules/@workflow/core/dist/util.js";

// node_modules/@workflow/core/dist/workflow.js
import { ERROR_SLUGS, ReplayDivergenceError, WorkflowNotRegisteredError, WorkflowRuntimeError } from "@workflow/errors";
import { createWorkflowBaseUrl, withResolvers } from "@workflow/utils";
import { parseWorkflowName } from "@workflow/utils/parse-name";
import * as nanoid from "nanoid";
import { monotonicFactory } from "ulid";
import { EventConsumerResult, EventsConsumer } from "../node_modules/@workflow/core/dist/events-consumer.js";
import { ENOTSUP, WorkflowSuspension } from "../node_modules/@workflow/core/dist/global.js";
import { runtimeLogger } from "../node_modules/@workflow/core/dist/logger.js";
import { getPortLazy } from "../node_modules/@workflow/core/dist/runtime/get-port-lazy.js";
import { dehydrateWorkflowReturnValue, hydrateWorkflowArguments } from "../node_modules/@workflow/core/dist/serialization.js";
import { createUseStep } from "../node_modules/@workflow/core/dist/step.js";
import { BODY_INIT_SYMBOL, STABLE_ULID, WORKFLOW_CREATE_HOOK, WORKFLOW_GET_STREAM_ID, WORKFLOW_SLEEP, WORKFLOW_USE_STEP } from "../node_modules/@workflow/core/dist/symbols.js";
import * as Attribute from "../node_modules/@workflow/core/dist/telemetry/semantic-conventions.js";
import { trace } from "../node_modules/@workflow/core/dist/telemetry.js";
import { getWorkflowRunStreamId } from "../node_modules/@workflow/core/dist/util.js";
import { createContext } from "../node_modules/@workflow/core/dist/vm/index.js";
import { runCachedWorkflowScript } from "../node_modules/@workflow/core/dist/vm/script-cache.js";
import { WORKFLOW_CONTEXT_SYMBOL } from "../node_modules/@workflow/core/dist/workflow/get-workflow-metadata.js";
import { createCreateHook } from "../node_modules/@workflow/core/dist/workflow/hook.js";
import { createSleep } from "../node_modules/@workflow/core/dist/workflow/sleep.js";

// node_modules/@workflow/core/dist/runtime.js
import { WorkflowSuspension as WorkflowSuspension3 } from "../node_modules/@workflow/core/dist/global.js";
import { healthCheck } from "../node_modules/@workflow/core/dist/runtime/helpers.js";

// node_modules/@workflow/core/dist/runtime/resume-hook.js
import { ERROR_SLUGS as ERROR_SLUGS2, HookNotFoundError, WorkflowRuntimeError as WorkflowRuntimeError2 } from "@workflow/errors";
import { isLegacySpecVersion, SPEC_VERSION_CURRENT, SPEC_VERSION_LEGACY } from "@workflow/world";
import { getRunCapabilities } from "../node_modules/@workflow/core/dist/capabilities.js";
import { importKey } from "../node_modules/@workflow/core/dist/encryption.js";
import { runtimeLogger as runtimeLogger2 } from "../node_modules/@workflow/core/dist/logger.js";
import { dehydrateStepReturnValue, hydrateStepArguments, SerializationFormat } from "../node_modules/@workflow/core/dist/serialization.js";
import { WEBHOOK_RESPONSE_WRITABLE } from "../node_modules/@workflow/core/dist/symbols.js";
import * as Attribute2 from "../node_modules/@workflow/core/dist/telemetry/semantic-conventions.js";
import { getSpanContextForTraceCarrier, trace as trace2 } from "../node_modules/@workflow/core/dist/telemetry.js";
import { getWorkflowQueueName } from "../node_modules/@workflow/core/dist/runtime/helpers.js";
import { safeWaitUntil, waitedUntil } from "../node_modules/@workflow/core/dist/runtime/wait-until.js";
import { getWorld } from "../node_modules/@workflow/core/dist/runtime/world.js";

// node_modules/@workflow/core/dist/runtime.js
import { getRun, Run } from "../node_modules/@workflow/core/dist/runtime/run.js";
import { cancelRun, listStreams, readStream, recreateRunFromExisting, reenqueueRun, wakeUpRun } from "../node_modules/@workflow/core/dist/runtime/runs.js";
import { start } from "../node_modules/@workflow/core/dist/runtime/start.js";
import { stepEntrypoint } from "../node_modules/@workflow/core/dist/runtime/step-handler.js";
import { createWorld, getWorld as getWorld3, getWorldHandlers as getWorldHandlers2, setWorld } from "../node_modules/@workflow/core/dist/runtime/world.js";
export {
  stepEntrypoint as HEAD,
  stepEntrypoint as POST
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2xpYi9wYWdlLWNhdGFsb2cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL3dvcmtmbG93L3NyYy9pbnRlcm5hbC9idWlsdGlucy50cyIsICIuLi9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL3N0ZGxpYi50cyIsICIuLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLnRzIiwgIi4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svZXh0cmFjdC1zaGVldHMudHMiLCAiLi4vc3JjL2RvbWFpbi9haS13b3JrYm9vay9zaGVldC1hbmFseXNpcy50cyIsICIuLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL2NvbXByZWhlbmQudHMiLCAiLi4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9wcm9ncmVzcy50cyIsICIuLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L2RiLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvYnVpbGRlcnMvc3JjL3NlcmRlLWNoZWNrZXIudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9ydW50aW1lLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvd29ya2Zsb3cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9ydW50aW1lL3Jlc3VtZS1ob29rLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIENvZGUtZmlyc3QgcGFnZSBjYXRhbG9nIFx1MjAxNCBydW50aW1lIFNTb1QgYXQgTVZQLlxuICogU3VwcG9ydHMgc3RhdGljIGNhdGFsb2cgZW50cmllcyBhbmQgZHluYW1pY2FsbHkgcmVnaXN0ZXJlZCBwYWdlc1xuICogKGUuZy4gZnJvbSB3b3JrYm9vayBhbmFseXNpcyBhZnRlciBhbiBFeGNlbCB1cGxvYWQpLlxuICpcbiAqIERCIEFwcFBhZ2UvUGFnZVNlY3Rpb24gc2VlZGVkIGluIFA2OyBjYXRhbG9nIHdpbnMgYXQgcnVudGltZS5cbiAqLyAvKiogUGFydHMgZnJvbSB0aGUgdXBsb2FkZWQgQnVzaW5lc3MgUmV2aWV3IFx1MjAxNCBwb3B1bGF0ZWQgZHluYW1pY2FsbHkgYXQgcmVuZGVyIHRpbWUuICovIC8qKiBTdGF0aWMgcGFydHMgQVx1MjAxM0cgZXhpc3QgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aCBsZWdhY3kgc2VlZGVkIGRvY3MuIER5bmFtaWMgcGFydHMgb3ZlcnJpZGUgdGhlc2UuICovIGNvbnN0IFNUQVRJQ19QQVJUUyA9IHtcbiAgICAncGFydC1hJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtYScsXG4gICAgICAgIHBhcnRLZXk6ICdBJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEE6IEN1cnJlbnQgU2l0dWF0aW9uIFx1MjAxNCBUaGUgTnVtYmVycycsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtYic6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWInLFxuICAgICAgICBwYXJ0S2V5OiAnQicsXG4gICAgICAgIHRpdGxlOiAnUGFydCBCOiBUaGUgMTAtWWVhciBHcm93dGggTW9kZWwnLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWMnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1jJyxcbiAgICAgICAgcGFydEtleTogJ0MnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgQzogUmV2ZW51ZSBPcHRpbWl6YXRpb24gU3RyYXRlZ3knLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWQnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1kJyxcbiAgICAgICAgcGFydEtleTogJ0QnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRDogQ29zdCBNYW5hZ2VtZW50JyxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnXG4gICAgfSxcbiAgICAncGFydC1lJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtZScsXG4gICAgICAgIHBhcnRLZXk6ICdFJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEU6IFJpc2sgUmVnaXN0ZXInLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWYnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1mJyxcbiAgICAgICAgcGFydEtleTogJ0YnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRjogU3RhcldPUkxEIE1lbWJlcnNoaXAgUHJvZ3JhbScsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtZyc6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWcnLFxuICAgICAgICBwYXJ0S2V5OiAnRycsXG4gICAgICAgIHRpdGxlOiAnUGFydCBHOiBJbW1lZGlhdGUgQWN0aW9ucyAoTmV4dCAzMCBEYXlzKScsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH1cbn07XG4vKiogRHluYW1pYyBwYXJ0cyBwb3B1bGF0ZWQgZnJvbSBwYXJzZWQgQnVzaW5lc3MgUmV2aWV3IE1EIHVwbG9hZGVkIHZpYSAvY29uZmlnLiAqLyBsZXQgRFlOQU1JQ19QQVJUUyA9IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIHNldER5bmFtaWNSZXZpZXdQYXJ0cyhwYXJ0cykge1xuICAgIERZTkFNSUNfUEFSVFMgPSBPYmplY3QuZnJvbUVudHJpZXMocGFydHMubWFwKChwKT0+W1xuICAgICAgICAgICAgcC5wYXJ0U2x1ZyxcbiAgICAgICAgICAgIHBcbiAgICAgICAgXSkpO1xufVxuLyoqXG4gKiBEeW5hbWljIGdldHRlciB0aGF0IG1lcmdlcyBzdGF0aWMgKyBhbnkgcnVudGltZS1yZWdpc3RlcmVkIHBhcnRzLlxuICogVXNlIGluc3RlYWQgb2YgUkVWSUVXX1BBUlRfQ0FUQUxPRyBzbyB0aGF0IHNldER5bmFtaWNSZXZpZXdQYXJ0cygpIGNhbGxzXG4gKiBhcmUgcmVmbGVjdGVkIGltbWVkaWF0ZWx5LlxuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5TVEFUSUNfUEFSVFMsXG4gICAgICAgIC4uLkRZTkFNSUNfUEFSVFNcbiAgICB9O1xufVxuLyoqIEBkZXByZWNhdGVkIFVzZSBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpIFx1MjAxNCB0aGlzIGNvbnN0IGlzIGZyb3plbiBhdCBtb2R1bGUgbG9hZCB0aW1lLiAqLyBleHBvcnQgY29uc3QgUkVWSUVXX1BBUlRfQ0FUQUxPRyA9IHtcbiAgICAuLi5TVEFUSUNfUEFSVFMsXG4gICAgLi4uRFlOQU1JQ19QQVJUU1xufTtcbi8qKiBEeW5hbWljIHBhZ2VzIHJlZ2lzdGVyZWQgYXQgcnVudGltZSAoZS5nLiBmcm9tIHdvcmtib29rIGFuYWx5c2lzIGFmdGVyIHJlc2VlZCkuICovIGxldCBEWU5BTUlDX1BBR0VTID0ge307XG4vKipcbiAqIFJlZ2lzdGVyIGR5bmFtaWNhbGx5IGdlbmVyYXRlZCBwYWdlcyBcdTIwMTQgY2FsbGVkIGFmdGVyIHdvcmtib29rIGFuYWx5c2lzXG4gKiBkdXJpbmcgdGhlIHJlc2VlZCBwaXBlbGluZSBzbyBzaGVldC1kZXJpdmVkIGFuYWx5dGljcyBwYWdlcyBhcHBlYXIgaW4gdGhlIG5hdi5cbiAqLyBleHBvcnQgZnVuY3Rpb24gc2V0RHluYW1pY1BhZ2VzKHBhZ2VzKSB7XG4gICAgRFlOQU1JQ19QQUdFUyA9IE9iamVjdC5mcm9tRW50cmllcyhwYWdlcy5tYXAoKHApPT5bXG4gICAgICAgICAgICBwLnNsdWcsXG4gICAgICAgICAgICBwXG4gICAgICAgIF0pKTtcbn1cbi8qKiBDb21iaW5lZCBzdGF0aWMgKyBkeW5hbWljIHBhZ2UgY2F0YWxvZyAoZXZhbHVhdGVkIGxhemlseSBzbyBkeW5hbWljIHBhZ2VzIGFyZSBpbmNsdWRlZCkuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRGdWxsQ2F0YWxvZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5QQUdFX0NBVEFMT0csXG4gICAgICAgIC4uLkRZTkFNSUNfUEFHRVNcbiAgICB9O1xufVxuZXhwb3J0IGNvbnN0IFBBR0VfQ0FUQUxPRyA9IHtcbiAgICBob21lOiB7XG4gICAgICAgIHNsdWc6ICdob21lJyxcbiAgICAgICAgdGl0bGU6ICdIb21lJyxcbiAgICAgICAgbmF2TGFiZWw6ICdIb21lJyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnaGVybycsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnV2VsY29tZScsXG4gICAgICAgICAgICAgICAgICAgIHN1YnRpdGxlOiAnWW91ciBidXNpbmVzcyBhcHBsaWNhdGlvbiBcdTIwMTQgY29uZmlndXJlIHBhZ2VzLCBkYXRhIGFuZCBicmFuZGluZyBmcm9tIHRoZSBBZG1pbiBhcmVhLicsXG4gICAgICAgICAgICAgICAgICAgIG1pblRpZXI6ICdwdWJsaWMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICBkYXNoYm9hcmQ6IHtcbiAgICAgICAgc2x1ZzogJ2Rhc2hib2FyZCcsXG4gICAgICAgIHRpdGxlOiAnRGFzaGJvYXJkJyxcbiAgICAgICAgbmF2TGFiZWw6ICdEYXNoYm9hcmQnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncHVibGljJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdoZXJvJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2U6ICdKdWx5IDIwMjYgXHUwMEI3IEV4aXQgVmlhYmlsaXR5IFJldmlldycsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnQnVzaW5lc3MgUmV2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgc3VidGl0bGU6ICdFeGl0LXZpYWJpbGl0eSBhc3Nlc3NtZW50IGZvciBQVCBUYW1hbiBCaW50YW5nIEJhbGkgXHUyMDE0IHJldmVudWUgdW5kZXIgcHJlc3N1cmUsIG1hcmdpbiBlcm9zaW9uIGRldGVjdGVkLCBzaGFyZWhvbGRlciBzZWVraW5nIHBhdGh3YXkgb3V0LicsXG4gICAgICAgICAgICAgICAgICAgIG1pblRpZXI6ICdwdWJsaWMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIC8vICAgY29uZmlnOiB7IHZhcmlhbnQ6ICdkYXNoYm9hcmQnLCBzY2VuYXJpbzogJ2NvbnNlcnZhdGl2ZScsIG1pblRpZXI6ICdnb29nbGUnIH0sXG4gICAgICAgICAgICAvLyB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2FjdGlvbl9jaGVja2xpc3QnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAncGluJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnbWV0cmljX2dyaWQnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAnZ29vZ2xlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnbGV2ZXJfYWNjb3JkaW9uJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdUaGUgNSBMZXZlcnMnLFxuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAnZ29vZ2xlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgc3VtbWFyeToge1xuICAgICAgICBzbHVnOiAnc3VtbWFyeScsXG4gICAgICAgIHRpdGxlOiAnRXhlY3V0aXZlIFN1bW1hcnknLFxuICAgICAgICBuYXZMYWJlbDogJ1N1bW1hcnknLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgcGRmRXhwb3J0OiB0cnVlLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ2V4ZWN1dGl2ZS1zdW1tYXJ5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ29wcy1hZG1pbic6IHtcbiAgICAgICAgc2x1ZzogJ29wcy1hZG1pbicsXG4gICAgICAgIHRpdGxlOiAnT3BzIEFkbWluJyxcbiAgICAgICAgbmF2TGFiZWw6ICdPcHMgQWRtaW4nLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgcmVxdWlyZWRHcm91cHM6IFtcbiAgICAgICAgICAgICdvcHMtYWRtaW4nXG4gICAgICAgIF0sXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnb3BzX2FkbWluX3RhYnMnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgcmV2aWV3OiB7XG4gICAgICAgIHNsdWc6ICdyZXZpZXcnLFxuICAgICAgICB0aXRsZTogJ0J1c2luZXNzIFJldmlldycsXG4gICAgICAgIG5hdkxhYmVsOiAnUmV2aWV3JyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZScsXG4gICAgICAgIHBkZkV4cG9ydDogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdyZXZpZXdfYmxvY2tzJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgICdvcHMtdHJhY2tpbmcnOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtdHJhY2tpbmcnLFxuICAgICAgICB0aXRsZTogJ0ZpbmFuY2lhbCBUcmFja2luZycsXG4gICAgICAgIG5hdkxhYmVsOiAnVHJhY2tpbmcnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdrcGlfY2FyZHMnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICB2YXJpYW50OiAnb3BzJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAncmVwb3J0c19yb2xsdXAnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudDogJ29wcydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ3BubF90YWJsZScsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICAnb3BzLWNoYXQnOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtY2hhdCcsXG4gICAgICAgIHRpdGxlOiAnQUkgQ2hhdCcsXG4gICAgICAgIG5hdkxhYmVsOiAnQUkgQ2hhdCcsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXRfcGFuZWwnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgdGFza3M6IHtcbiAgICAgICAgc2x1ZzogJ3Rhc2tzJyxcbiAgICAgICAgdGl0bGU6ICdFeGl0LVZpYWJpbGl0eSBUYXNrcycsXG4gICAgICAgIG5hdkxhYmVsOiAnVGFza3MnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICBhZG1pbjoge1xuICAgICAgICBzbHVnOiAnYWRtaW4nLFxuICAgICAgICB0aXRsZTogJ1BsYXRmb3JtIEFkbWluJyxcbiAgICAgICAgbmF2TGFiZWw6ICdBZG1pbicsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwaW4nLFxuICAgICAgICBzZWN0aW9uczogW11cbiAgICB9LFxuICAgIGNvbmZpZzoge1xuICAgICAgICBzbHVnOiAnY29uZmlnJyxcbiAgICAgICAgdGl0bGU6ICdTb3VyY2UgQ29uZmlnJyxcbiAgICAgICAgbmF2TGFiZWw6ICdDb25maWcnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICAndGVybXMtb2Ytc2VydmljZSc6IHtcbiAgICAgICAgc2x1ZzogJ3Rlcm1zLW9mLXNlcnZpY2UnLFxuICAgICAgICB0aXRsZTogJ1Rlcm1zIG9mIFNlcnZpY2UnLFxuICAgICAgICBzaG93SW5OYXY6IGZhbHNlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnZG9jX21hcmtkb3duJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAndGVybXMtb2Ytc2VydmljZS5odG1sJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ3ByaXZhY3ktcG9saWN5Jzoge1xuICAgICAgICBzbHVnOiAncHJpdmFjeS1wb2xpY3knLFxuICAgICAgICB0aXRsZTogJ1ByaXZhY3kgUG9saWN5JyxcbiAgICAgICAgc2hvd0luTmF2OiBmYWxzZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwdWJsaWMnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ3ByaXZhY3ktcG9saWN5Lmh0bWwnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfVxufTtcbmNvbnN0IFRJRVJfUkFOSyA9IHtcbiAgICBwdWJsaWM6IDAsXG4gICAgcGluOiAxLFxuICAgIGdvb2dsZTogMlxufTtcbmV4cG9ydCBmdW5jdGlvbiB0aWVyQWxsb3dzQWNjZXNzKGN1cnJlbnQsIHJlcXVpcmVkKSB7XG4gICAgcmV0dXJuIFRJRVJfUkFOS1tjdXJyZW50XSA+PSBUSUVSX1JBTktbcmVxdWlyZWRdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxpc3ROYXZQYWdlcyh0aWVyLCBncm91cHMgPSBbXSkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGdldEZ1bGxDYXRhbG9nKCkpLmZpbHRlcigocCk9PnAuc2hvd0luTmF2ICE9PSBmYWxzZSkuZmlsdGVyKChwKT0+dGllckFsbG93c0FjY2Vzcyh0aWVyLCBwLmF1dGhUaWVyKSkuZmlsdGVyKChwKT0+IXAucmVxdWlyZWRHcm91cHMgfHwgcC5yZXF1aXJlZEdyb3Vwcy5sZW5ndGggPT09IDAgfHwgZ3JvdXBzLmluY2x1ZGVzKCdwbGF0Zm9ybS1hZG1pbicpIHx8IHAucmVxdWlyZWRHcm91cHMuc29tZSgoZyk9Pmdyb3Vwcy5pbmNsdWRlcyhnKSkpLnNvcnQoKGEsIGIpPT5hLnRpdGxlLmxvY2FsZUNvbXBhcmUoYi50aXRsZSkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYWdlKHNsdWcpIHtcbiAgICByZXR1cm4gZ2V0RnVsbENhdGFsb2coKVtzbHVnXSA/PyBudWxsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVSZXZpZXdQYXJ0KHBhcnRTbHVnKSB7XG4gICAgcmV0dXJuIGdldFJldmlld1BhcnRDYXRhbG9nKClbcGFydFNsdWddID8/IG51bGw7XG59XG5leHBvcnQgZnVuY3Rpb24gbGlzdFJldmlld1BhcnRzKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGdldFJldmlld1BhcnRDYXRhbG9nKCkpLnNvcnQoKGEsIGIpPT5hLnBhcnRLZXkubG9jYWxlQ29tcGFyZShiLnBhcnRLZXkpKTtcbn1cbi8qKiBEZXNjcmlwdGl2ZSB0aXRsZSB3aXRob3V0IHRoZSBcIlBhcnQgWDogXCIgY2F0YWxvZyBwcmVmaXguICovIGV4cG9ydCBmdW5jdGlvbiBnZXRSZXZpZXdQYXJ0RGlzcGxheVRpdGxlKHRpdGxlKSB7XG4gICAgcmV0dXJuIHRpdGxlLnJlcGxhY2UoL15QYXJ0IFtBLU9dOiAvLCAnJyk7XG59XG4iLCAiLyoqXG4gKiBUaGVzZSBhcmUgdGhlIGJ1aWx0LWluIHN0ZXBzIHRoYXQgYXJlIFwiYXV0b21hdGljYWxseSBhdmFpbGFibGVcIiBpbiB0aGUgd29ya2Zsb3cgc2NvcGUuIFRoZXkgYXJlXG4gKiBzaW1pbGFyIHRvIFwic3RkbGliXCIgZXhjZXB0IHRoYXQgYXJlIG5vdCBtZWFudCB0byBiZSBpbXBvcnRlZCBieSB1c2VycywgYnV0IGFyZSBpbnN0ZWFkIFwianVzdCBhdmFpbGFibGVcIlxuICogYWxvbmdzaWRlIHVzZXIgZGVmaW5lZCBzdGVwcy4gVGhleSBhcmUgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBydW50aW1lXG4gKi9cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV9hcnJheV9idWZmZXIoXG4gIHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZVxuKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmFycmF5QnVmZmVyKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfanNvbih0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2UpIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIHRoaXMuanNvbigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX3RleHQodGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLnRleHQoKTtcbn1cbiIsICIvKipcbiAqIFRoaXMgaXMgdGhlIFwic3RhbmRhcmQgbGlicmFyeVwiIG9mIHN0ZXBzIHRoYXQgd2UgbWFrZSBhdmFpbGFibGUgdG8gYWxsIHdvcmtmbG93IHVzZXJzLlxuICogVGhlIGNhbiBiZSBpbXBvcnRlZCBsaWtlIHNvOiBgaW1wb3J0IHsgZmV0Y2ggfSBmcm9tICd3b3JrZmxvdydgLiBhbmQgdXNlZCBpbiB3b3JrZmxvdy5cbiAqIFRoZSBuZWVkIHRvIGJlIGV4cG9ydGVkIGRpcmVjdGx5IGluIHRoaXMgcGFja2FnZSBhbmQgY2Fubm90IGxpdmUgaW4gYGNvcmVgIHRvIHByZXZlbnRcbiAqIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBwb3N0LWNvbXBpbGF0aW9uLlxuICovXG5cbi8qKlxuICogQSBob2lzdGVkIGBmZXRjaCgpYCBmdW5jdGlvbiB0aGF0IGlzIGV4ZWN1dGVkIGFzIGEgXCJzdGVwXCIgZnVuY3Rpb24sXG4gKiBmb3IgdXNlIHdpdGhpbiB3b3JrZmxvdyBmdW5jdGlvbnMuXG4gKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRmV0Y2hfQVBJXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaCguLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBnbG9iYWxUaGlzLmZldGNoPikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gZ2xvYmFsVGhpcy5mZXRjaCguLi5hcmdzKTtcbn1cbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG4vKipcbiAqIFN0ZXAgZnVuY3Rpb25zIGZvciB0aGUgd29ya2Jvb2staW5nZXN0IHdvcmtmbG93LlxuICpcbiAqIEVhY2ggZXhwb3J0ZWQgYXN5bmMgZnVuY3Rpb24gd2l0aCB0aGUgYCd1c2Ugc3RlcCdgIGRpcmVjdGl2ZSBpcyBhIGR1cmFibGVcbiAqIHN0ZXA6IGl0cyBhcmdzIGFuZCByZXN1bHQgYXJlIHNlcmlhbGl6ZWQgdG8gdGhlIGV2ZW50IGxvZywgYW5kIGl0IHJldHJpZXNcbiAqIChtYXggMywgb3IgcGVyIFJldHJ5YWJsZUVycm9yKSBiZWZvcmUgdGhlIGVycm9yIGJ1YmJsZXMgdG8gdGhlIHdvcmtmbG93LlxuICovIGltcG9ydCB7IEZhdGFsRXJyb3IsIFJldHJ5YWJsZUVycm9yIH0gZnJvbSAnd29ya2Zsb3cnO1xuaW1wb3J0IHsgZXh0cmFjdFNoZWV0c1dpdGhTdGF0cyB9IGZyb20gJy4uLy4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svZXh0cmFjdC1zaGVldHMnO1xuaW1wb3J0IHsgYW5hbHl6ZVNoZWV0cyB9IGZyb20gJy4uLy4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svc2hlZXQtYW5hbHlzaXMnO1xuaW1wb3J0IHsgY29tcHJlaGVuZE9uY2UsIENvbXByZWhlbmRIdHRwRXJyb3IsIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL2NvbXByZWhlbmQnO1xuaW1wb3J0IHsgd3JpdGVQcm9ncmVzc0NodW5rLCBjbG9zZVByb2dyZXNzU3RyZWFtIH0gZnJvbSAnLi9wcm9ncmVzcyc7XG5pbXBvcnQgeyB3aXRoUGdDbGllbnQsIGV4ZWN1dGVPbmUsIHF1ZXJ5Um93cyB9IGZyb20gJy4vZGInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcIndvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMudHNcIjp7XCJhbmFseXplU2hlZXRzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9hbmFseXplU2hlZXRzU3RlcFwifSxcImNsb3NlUHJvZ3Jlc3NTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2Nsb3NlUHJvZ3Jlc3NTdGVwXCJ9LFwiY29tcHJlaGVuZFdvcmtib29rU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9jb21wcmVoZW5kV29ya2Jvb2tTdGVwXCJ9LFwiZW1pdFByb2dyZXNzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9lbWl0UHJvZ3Jlc3NTdGVwXCJ9LFwiZXh0cmFjdFNoZWV0c1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZXh0cmFjdFNoZWV0c1N0ZXBcIn0sXCJnZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcFwifSxcImdlbmVyYXRlRGFzaGJvYXJkU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZURhc2hib2FyZFN0ZXBcIn0sXCJnZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXBcIn0sXCJsb2FkV29ya2Jvb2tTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2xvYWRXb3JrYm9va1N0ZXBcIn0sXCJwb3B1bGF0ZVByb2plY3Rpb25zU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9wb3B1bGF0ZVByb2plY3Rpb25zU3RlcFwifSxcInJlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9yZWdpc3RlckR5bmFtaWNQYWdlc1N0ZXBcIn0sXCJzYXZlU25pcHBldHNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NhdmVTbmlwcGV0c1N0ZXBcIn0sXCJzZWxlY3RUZW1wbGF0ZVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2VsZWN0VGVtcGxhdGVTdGVwXCJ9LFwidXBzZXJ0U2hlZXRQYWdlc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vdXBzZXJ0U2hlZXRQYWdlc1N0ZXBcIn19fX0qLztcbi8qKiBEZXRlY3QgdGhlIGZpbGUgc2lnbmF0dXJlcyBvZiByZWFsIHNwcmVhZHNoZWV0IGZpbGVzICh6aXAveGxzeCwgQklGRi94bHMpLiAqLyBmdW5jdGlvbiBoYXNTcHJlYWRzaGVldE1hZ2ljKGRhdGEpIHtcbiAgICBjb25zdCBiID0gZGF0YTtcbiAgICAvLyBQS1xceDAzXFx4MDQgKHppcCBcdTIxOTIgeGxzeCkgb3IgUEtcXHgwNVxceDA2IChlbXB0eSB6aXApXG4gICAgaWYgKGJbMF0gPT09IDB4NTAgJiYgYlsxXSA9PT0gMHg0YikgcmV0dXJuIHRydWU7XG4gICAgLy8gRDAgQ0YgMTEgRTAgQTEgQjEgMUEgRTEgKE9MRTIgY29tcG91bmQgXHUyMTkyIC54bHMpXG4gICAgaWYgKGJbMF0gPT09IDB4ZDAgJiYgYlsxXSA9PT0gMHhjZiAmJiBiWzJdID09PSAweDExICYmIGJbM10gPT09IDB4ZTAgJiYgYls0XSA9PT0gMHhhMSAmJiBiWzVdID09PSAweGIxICYmIGJbNl0gPT09IDB4MWEgJiYgYls3XSA9PT0gMHhlMSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuLyoqXG4gKiBDb252ZXJ0IHJhdyB1cGxvYWQgYnl0ZXMgaW50byB4bHN4IGJ1ZmZlcnMuXG4gKlxuICogVWludDhBcnJheSBpcyBzZXJpYWxpemFibGUgYWNyb3NzIHRoZSB3b3JrZmxvdyBib3VuZGFyeTsgQnVmZmVyIGlzIG5vdFxuICogZ3VhcmFudGVlZCBpbiB3b3JrZmxvdyBzdGVwIHNhbmRib3hlcywgc28gd2Uga2VlcCBVaW50OEFycmF5IGV2ZXJ5d2hlcmVcbiAqIGFuZCBoYW5kIGl0IGRpcmVjdGx5IHRvIGB4bHN4LnJlYWQoeyB0eXBlOiAnYnVmZmVyJyB9KWAuXG4gKlxuICogU2hlZXRKUyBpcyBsZW5pZW50IHdpdGggYXJiaXRyYXJ5IHRleHQgKGl0IHBhcnNlcyBwbGFpbiB0ZXh0IGFzIGEgMS1jb2x1bW5cbiAqIHNoZWV0KSwgc28gd2UgdmFsaWRhdGUgdGhlIG1hZ2ljIGJ5dGVzIEJFRk9SRSBwYXJzaW5nIHRvIGNhdGNoIHVwbG9hZHMgb2ZcbiAqIHRoZSB3cm9uZyBmaWxlIHR5cGUgd2l0aCBhIGNsZWFuIEZhdGFsRXJyb3IuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRXb3JrYm9va1N0ZXAoZmlsZXMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZmlsZXMpIHx8IGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcignTm8gd29ya2Jvb2sgZmlsZXMgd2VyZSBwcm92aWRlZC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGVzLm1hcCgoZik9PntcbiAgICAgICAgaWYgKCFmIHx8IHR5cGVvZiBmLm5hbWUgIT09ICdzdHJpbmcnIHx8ICEoZi5kYXRhIGluc3RhbmNlb2YgVWludDhBcnJheSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdJbnZhbGlkIGZpbGUgZW50cnk6IGV4cGVjdGVkIHsgbmFtZSwgZGF0YTogVWludDhBcnJheSB9LicpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmLmRhdGEuYnl0ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYFdvcmtib29rIFwiJHtmLm5hbWV9XCIgaXMgZW1wdHkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYXNTcHJlYWRzaGVldE1hZ2ljKGYuZGF0YSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBXb3JrYm9vayBcIiR7Zi5uYW1lfVwiIGlzIG5vdCBhIHJlYWRhYmxlIC54bHN4Ly54bHMgZmlsZSAodW5leHBlY3RlZCBmaWxlIHNpZ25hdHVyZSkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGYuZGF0YTtcbiAgICB9KTtcbn1cbi8qKiBFWFRSQUNUOiBzZXJpYWxpemUgZXZlcnkgc2hlZXQgdG8gdGV4dCArIHN0cnVjdHVyYWwgc3RhdHMuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHRyYWN0U2hlZXRzU3RlcChidWZmZXJzKSB7XG4gICAgY29uc3QgYWxsID0gW107XG4gICAgZm9yIChjb25zdCBidWYgb2YgYnVmZmVycyl7XG4gICAgICAgIGxldCBleHRyYWN0ZWQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBleHRyYWN0ZWQgPSBleHRyYWN0U2hlZXRzV2l0aFN0YXRzKGJ1Zik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYFdvcmtib29rIGlzIG5vdCBhIHJlYWRhYmxlIC54bHN4IGZpbGU6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgICAgICB9XG4gICAgICAgIGFsbC5wdXNoKC4uLmV4dHJhY3RlZCk7XG4gICAgfVxuICAgIGlmIChhbGwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdXb3JrYm9vayBjb250YWlucyBubyByZWFkYWJsZSBzaGVldHMuJyk7XG4gICAgfVxuICAgIHJldHVybiBhbGw7XG59XG4vKiogQU5BTFlaRTogZGV0ZXJtaW5pc3RpYyBwcmUtcGFzcyBwcm9kdWNpbmcgc3RydWN0dXJlZCBoaW50cy4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFuYWx5emVTaGVldHNTdGVwKHNoZWV0cykge1xuICAgIHJldHVybiBhbmFseXplU2hlZXRzKHNoZWV0cyk7XG59XG4vKipcbiAqIENPTVBSRUhFTkQ6IG9uZSBPcGVuQUkgY2FsbCAoZ3B0LTRvLCBqc29uX29iamVjdCwgWm9kLXZhbGlkYXRlZCkgd2l0aCB0aGVcbiAqIGRldGVybWluaXN0aWMgQU5BTFlTSVMgaGludHMgaW5qZWN0ZWQgaW50byB0aGUgcHJvbXB0LlxuICpcbiAqIFJldHJ5IHBvbGljeSAoXHUwMEE3NC4yIG9mIHRoZSByb2FkbWFwKTpcbiAqICAgLSA0MjkgICAgICAgICAgICBcdTIxOTIgUmV0cnlhYmxlRXJyb3IoeyByZXRyeUFmdGVyIH0pIHVzaW5nIFJldHJ5LUFmdGVyIGhlYWRlciAoZmFsbGJhY2sgMXMpXG4gKiAgIC0gNXh4IC8gbmV0d29yayAgXHUyMTkyIHBsYWluIEVycm9yIFx1MjE5MiBTREsgYXV0by1yZXRyeSAobWF4IDMpXG4gKiAgIC0gbWlzc2luZyBrZXkgICAgXHUyMTkyIEZhdGFsRXJyb3IgKHBlcm1hbmVudCwgbm8gcmV0cnkgc3Rvcm0pXG4gKiAgIC0gc2NoZW1hIHJlamVjdGVkIFx1MjE5MiBwbGFpbiBFcnJvciBcdTIxOTIgU0RLIGF1dG8tcmV0cmllcyAobW9kZWwgb3V0cHV0IGlzIHN0b2NoYXN0aWNcbiAqICAgICAgICAgICAgICAgICAgICAgIGF0IHRlbXBlcmF0dXJlIDAuMik7IHJ1biBmYWlscyB3aXRoIGEgY2xlYXIgbWVzc2FnZSBhZnRlclxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIFNESydzIHJldHJ5IGJ1ZGdldCBpcyBleGhhdXN0ZWQuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXByZWhlbmRXb3JrYm9va1N0ZXAoc2hlZXRzLCBoaW50cywgbW9kZWwgPSAnZ3B0LTRvJywgb3BlbmFpQXBpS2V5KSB7XG4gICAgY29uc3QgYXBpS2V5ID0gb3BlbmFpQXBpS2V5IHx8IHByb2Nlc3MuZW52Lk9QRU5BSV9BUElfS0VZO1xuICAgIGlmICghYXBpS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdPcGVuQUkgQVBJIGtleSBub3QgY29uZmlndXJlZC4gU2V0IGl0IGluIENvbmZpZyA+IE9wZW5BSSBLZXkgKHZpYSB0aGUgcmVzZWVkIHJvdXRlKSBvciBzZXQgT1BFTkFJX0FQSV9LRVkgZW52IHZhci4nKTtcbiAgICB9XG4gICAgY29uc3QgYmxvY2tzID0gc2hlZXRzLm1hcCgoeyB0YWJOYW1lLCB0ZXh0IH0pPT4oe1xuICAgICAgICAgICAgdGFiTmFtZSxcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgfSkpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjb21wcmVoZW5kT25jZShibG9ja3MsIHtcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgaGludHMsXG4gICAgICAgICAgICBhcGlLZXlcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDb21wcmVoZW5kSHR0cEVycm9yKSB7XG4gICAgICAgICAgICBpZiAoZXJyLnN0YXR1cyA9PT0gNDI5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0cnlBZnRlclNlY29uZHMgPSBlcnIucmV0cnlBZnRlclNlY29uZHMgPz8gMTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmV0cnlhYmxlRXJyb3IoZXJyLm1lc3NhZ2UsIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0cnlBZnRlcjogYCR7cmV0cnlBZnRlclNlY29uZHN9c2BcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIDV4eCBldGMgXHUyMTkyIHBsYWluIEVycm9yIFx1MjE5MiBTREsgYXV0by1yZXRyeSAobWF4IDMpXG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFNjaGVtYS9KU09OIHJlamVjdGlvbiBcdTIwMTQgdGhlIG1vZGVsIG1heSBwcm9kdWNlIHZhbGlkIG91dHB1dCBvbiByZXRyeS5cbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgfVxufVxuLyoqXG4gKiBFbWl0IGEgcHJvZ3Jlc3MgY2h1bmsgdG8gdGhlIHJ1bidzIHdyaXRhYmxlIHN0cmVhbSAoU1NFIHBheWxvYWQpLlxuICogTXVzdCBiZSBhIHN0ZXA6IHdvcmtmbG93IGZ1bmN0aW9ucyBjYW5ub3QgaW50ZXJhY3Qgd2l0aCB0aGUgc3RyZWFtIGRpcmVjdGx5LlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbWl0UHJvZ3Jlc3NTdGVwKHdyaXRhYmxlLCBjaHVuaykge1xuICAgIGF3YWl0IHdyaXRlUHJvZ3Jlc3NDaHVuayh3cml0YWJsZSwgY2h1bmspO1xufVxuLyoqXG4gKiBDbG9zZSB0aGUgcnVuJ3Mgd3JpdGFibGUgc3RyZWFtLCBzaWduYWxpbmcgY29tcGxldGlvbiB0byBzdHJlYW0gcmVhZGVycy5cbiAqIE11c3QgYmUgYSBzdGVwOiB3b3JrZmxvdyBmdW5jdGlvbnMgY2Fubm90IGludGVyYWN0IHdpdGggdGhlIHN0cmVhbSBkaXJlY3RseS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0ZXAod3JpdGFibGUpIHtcbiAgICBhd2FpdCBjbG9zZVByb2dyZXNzU3RyZWFtKHdyaXRhYmxlKTtcbn1cbi8vIFx1MjUwMFx1MjUwMCBQaGFzZSAzOiBQT1BVTEFURSBzdGVwcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8qKlxuICogVXBzZXJ0IGZpbmFuY2lhbCBwcm9qZWN0aW9ucyBmcm9tIHRoZSBBSSBjb21wcmVoZW5zaW9uLlxuICogSWRlbXBvdGVudDogT04gQ09ORkxJQ1QgKHBlcmlvZCwgZGF0YV90eXBlLCBzY2VuYXJpbykgRE8gVVBEQVRFLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBwb3B1bGF0ZVByb2plY3Rpb25zU3RlcChjb21wcmVoZW5zaW9uLCBkYlVybCkge1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgIGZvciAoY29uc3QgbWV0cmljIG9mIGNvbXByZWhlbnNpb24ucHJvamVjdGlvbnMpe1xuICAgICAgICAgICAgY29uc3QgeWVhciA9IE51bWJlcihtZXRyaWMucGVyaW9kLnNsaWNlKDAsIDQpKTtcbiAgICAgICAgICAgIGNvbnN0IG1vbnRoID0gTnVtYmVyKG1ldHJpYy5wZXJpb2Quc2xpY2UoNSwgNykpO1xuICAgICAgICAgICAgY29uc3QgcmV2ZW51ZSA9IE1hdGgucm91bmQobWV0cmljLnJldmVudWUgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBlYml0ZGEgPSBNYXRoLnJvdW5kKG1ldHJpYy5lYml0ZGEgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBuZXRJbmNvbWUgPSBNYXRoLnJvdW5kKG1ldHJpYy5uZXRJbmNvbWUgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBndWVzdHMgPSBNYXRoLnJvdW5kKG1ldHJpYy5ndWVzdHMgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBzdGFmZkNvc3QgPSBNYXRoLnJvdW5kKG1ldHJpYy5zdGFmZkNvc3QgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBwbmxMaW5lcyA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ3JldmVudWUnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1JldmVudWUnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmV2ZW51ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdlYml0ZGEnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VCSVREQScsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBlYml0ZGFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnbmV0X2luY29tZScsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTmV0IEluY29tZScsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBuZXRJbmNvbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnc3RhZmZfY29zdCcsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU3RhZmYgQ29zdCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzdGFmZkNvc3RcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnZ3Vlc3RzJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdHdWVzdHMnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZ3Vlc3RzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gZmluYW5jaWFsX3Byb2plY3Rpb25zIChwZXJpb2QsIHllYXIsIG1vbnRoLCBkYXRhX3R5cGUsIHNjZW5hcmlvLCByZXZlbnVlLCBlYml0ZGEsIG5ldF9pbmNvbWUsIGd1ZXN0cywgc3RhZmZfY29zdCwgcG5sX2xpbmVzKVxuICAgICAgICAgVkFMVUVTICgkMSwgJDIsICQzLCAkNCwgJDUsICQ2LCAkNywgJDgsICQ5LCAkMTAsICQxMTo6anNvbmIpXG4gICAgICAgICBPTiBDT05GTElDVCAocGVyaW9kLCBkYXRhX3R5cGUsIHNjZW5hcmlvKVxuICAgICAgICAgRE8gVVBEQVRFIFNFVFxuICAgICAgICAgICByZXZlbnVlID0gRVhDTFVERUQucmV2ZW51ZSxcbiAgICAgICAgICAgZWJpdGRhID0gRVhDTFVERUQuZWJpdGRhLFxuICAgICAgICAgICBuZXRfaW5jb21lID0gRVhDTFVERUQubmV0X2luY29tZSxcbiAgICAgICAgICAgZ3Vlc3RzID0gRVhDTFVERUQuZ3Vlc3RzLFxuICAgICAgICAgICBzdGFmZl9jb3N0ID0gRVhDTFVERUQuc3RhZmZfY29zdCxcbiAgICAgICAgICAgcG5sX2xpbmVzID0gRVhDTFVERUQucG5sX2xpbmVzO2AsIFtcbiAgICAgICAgICAgICAgICBtZXRyaWMucGVyaW9kLFxuICAgICAgICAgICAgICAgIHllYXIsXG4gICAgICAgICAgICAgICAgbW9udGgsXG4gICAgICAgICAgICAgICAgbWV0cmljLmRhdGFUeXBlLFxuICAgICAgICAgICAgICAgIG1ldHJpYy5zY2VuYXJpbyxcbiAgICAgICAgICAgICAgICByZXZlbnVlLFxuICAgICAgICAgICAgICAgIGViaXRkYSxcbiAgICAgICAgICAgICAgICBuZXRJbmNvbWUsXG4gICAgICAgICAgICAgICAgZ3Vlc3RzLFxuICAgICAgICAgICAgICAgIHN0YWZmQ29zdCxcbiAgICAgICAgICAgICAgICBwbmxMaW5lc1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvdW50O1xufVxuLyoqIE5vcm1hbGl6ZSBhIHNoZWV0IHRhYiBuYW1lIGludG8gYSBVUkwtc2FmZSBzbHVnLiAqLyBmdW5jdGlvbiBub3JtYWxpemVTbHVnKG5hbWUpIHtcbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1smXS9nLCAnYW5kJykucmVwbGFjZSgvW1xcc10rL2csICctJykucmVwbGFjZSgvW15hLXowLTktXS9nLCAnJykucmVwbGFjZSgvLSsvZywgJy0nKS5yZXBsYWNlKC9eLXwtJC9nLCAnJyk7XG59XG4vKiogUGFnZSBibG9ja3MgcGVyIHNoZWV0IGNhdGVnb3J5IChtaXJyb3JzIHBpcGVsaW5lLnRzIENBVEVHT1JZX0JMT0NLUykuICovIGNvbnN0IFNIRUVUX0NBVEVHT1JZX0JMT0NLUyA9IHtcbiAgICBkYWlseV9zYWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdEYWlseSBTYWxlcyBcdTIwMTQgRGF0YSdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnRGFpbHkgU2FsZXMgXHUyMDE0IFRyZW5kcydcbiAgICAgICAgfVxuICAgIF0sXG4gICAgcHJvZml0X2xvc3M6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAncG5sX3RhYmxlJyxcbiAgICAgICAgICAgIHRpdGxlOiAnUHJvZml0ICYgTG9zcyBcdTIwMTQgU3RhdGVtZW50J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdQcm9maXQgJiBMb3NzIFx1MjAxNCBUcmVuZHMnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIGJhbGFuY2Vfc2hlZXQ6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnQmFsYW5jZSBTaGVldCBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgdHJpYWxfYmFsYW5jZTogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdUcmlhbCBCYWxhbmNlIFx1MjAxNCBEYXRhJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBnZW5lcmFsX2xlZGdlcjogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdHZW5lcmFsIExlZGdlciBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgY29zdF9vZl9zYWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdDb3N0IG9mIFNhbGVzIFx1MjAxNCBEYXRhJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBtb250aF9vbl9tb250aDogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdNb250aCBvbiBNb250aCBcdTIwMTQgQ29tcGFyaXNvbidcbiAgICAgICAgfVxuICAgIF0sXG4gICAgYnJlYWtfZXZlbjogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdrcGlfY2FyZHMnLFxuICAgICAgICAgICAgdGl0bGU6ICdCcmVhay1FdmVuIFx1MjAxNCBLUElzJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdCcmVhay1FdmVuIFx1MjAxNCBUcmVuZCdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgdmFyaWFuY2U6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTW9udGhseSBWYXJpYW5jZSBcdTIwMTQgQW5hbHlzaXMnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIHN1bW1hcnlfcGw6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTXVsdGktWWVhciBQJkwgXHUyMDE0IFRyZW5kJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdwbmxfdGFibGUnLFxuICAgICAgICAgICAgdGl0bGU6ICdNdWx0aS1ZZWFyIFAmTCBcdTIwMTQgU3RhdGVtZW50J1xuICAgICAgICB9XG4gICAgXSxcbiAgICBzdW1tYXJ5X2JzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3NoZWV0X3ZpZXdlcicsXG4gICAgICAgICAgICB0aXRsZTogJ011bHRpLVllYXIgQmFsYW5jZSBTaGVldCBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgb3RoZXI6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnU2hlZXQgRGF0YSdcbiAgICAgICAgfVxuICAgIF1cbn07XG4vKipcbiAqIENyZWF0ZS91cGRhdGUgZHluYW1pYyBhcHAgcGFnZXMgKyBwYWdlIHNlY3Rpb25zIGZvciBlYWNoIGNvbXByZWhlbmRlZCBzaGVldC5cbiAqXG4gKiBcdTAwQTc3LjEgRklYOiBPTiBDT05GTElDVCAoc2x1ZykgRE8gVVBEQVRFIC4uLiBSRVRVUk5JTkcgaWQgZW5zdXJlcyB3ZSBhbHdheXNcbiAqIGhhdmUgdGhlIGNvcnJlY3QgcGFnZSBJRCAobmV3IG9yIGV4aXN0aW5nKS4gUGFnZSBzZWN0aW9ucyBhcmUgZGVsZXRlZCBhbmRcbiAqIHJlLWluc2VydGVkIHNjb3BlZCB0byB0aGF0IGlkIFx1MjAxNCBubyBvcnBoYW4gRksgcmVmZXJlbmNlcy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBzZXJ0U2hlZXRQYWdlc1N0ZXAoY29tcHJlaGVuc2lvbiwgZGJVcmwpIHtcbiAgICBjb25zdCBjcmVhdGVkID0gW107XG4gICAgbGV0IHNvcnRPcmRlciA9IDEwMDtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgZm9yIChjb25zdCBzaGVldCBvZiBjb21wcmVoZW5zaW9uLnNoZWV0cyl7XG4gICAgICAgICAgICBjb25zdCBzbHVnID0gYHNoZWV0LSR7bm9ybWFsaXplU2x1ZyhzaGVldC50YWJOYW1lKX1gO1xuICAgICAgICAgICAgY29uc3QgYmxvY2tzID0gU0hFRVRfQ0FURUdPUllfQkxPQ0tTW3NoZWV0LmNhdGVnb3J5XSA/PyBTSEVFVF9DQVRFR09SWV9CTE9DS1Mub3RoZXI7XG4gICAgICAgICAgICAvLyBcdTAwQTc3LjEgZml4OiBSRVRVUk5JTkcgaWQgZ2l2ZXMgdXMgdGhlIHJlYWwgcGFnZSBJRCBvbiBpbnNlcnQgT1IgY29uZmxpY3QuXG4gICAgICAgICAgICBjb25zdCBwYWdlUm93cyA9IGF3YWl0IHF1ZXJ5Um93cyhkYiwgYElOU0VSVCBJTlRPIGFwcF9wYWdlcyAoaWQsIHNsdWcsIHRpdGxlLCBhdXRoX3RpZXIsIHNvcnRfb3JkZXIsIG5hdl9sYWJlbCwgc2hvd19pbl9uYXYpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJDIsICdnb29nbGUnLCAkMywgJDQsIHRydWUpXG4gICAgICAgICBPTiBDT05GTElDVCAoc2x1ZykgRE8gVVBEQVRFIFNFVFxuICAgICAgICAgICB0aXRsZSA9IEVYQ0xVREVELnRpdGxlLFxuICAgICAgICAgICBhdXRoX3RpZXIgPSBFWENMVURFRC5hdXRoX3RpZXIsXG4gICAgICAgICAgIHNvcnRfb3JkZXIgPSBFWENMVURFRC5zb3J0X29yZGVyLFxuICAgICAgICAgICBuYXZfbGFiZWwgPSBFWENMVURFRC5uYXZfbGFiZWwsXG4gICAgICAgICAgIHNob3dfaW5fbmF2ID0gRVhDTFVERUQuc2hvd19pbl9uYXZcbiAgICAgICAgIFJFVFVSTklORyBpZDtgLCBbXG4gICAgICAgICAgICAgICAgc2x1ZyxcbiAgICAgICAgICAgICAgICBzaGVldC50aXRsZSxcbiAgICAgICAgICAgICAgICBzb3J0T3JkZXIrKyxcbiAgICAgICAgICAgICAgICBzaGVldC50aXRsZVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb25zdCBwYWdlSWQgPSBwYWdlUm93c1swXT8uaWQ7XG4gICAgICAgICAgICBpZiAoIXBhZ2VJZCkgY29udGludWU7XG4gICAgICAgICAgICAvLyBSZXBsYWNlIHNlY3Rpb25zIGZvciB0aGlzIHBhZ2UgKGlkZW1wb3RlbnQgb24gcmV0cnkpLlxuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYERFTEVURSBGUk9NIHBhZ2Vfc2VjdGlvbnMgV0hFUkUgcGFnZV9pZCA9ICQxO2AsIFtcbiAgICAgICAgICAgICAgICBwYWdlSWRcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeU1hcmtkb3duID0gW1xuICAgICAgICAgICAgICAgIGAjICR7c2hlZXQudGl0bGV9YCxcbiAgICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgICBzaGVldC5zdW1tYXJ5LFxuICAgICAgICAgICAgICAgIHNoZWV0LnBlcmlvZEhpbnQgPyBgXFxuKipQZXJpb2QqKjogJHtzaGVldC5wZXJpb2RIaW50fWAgOiAnJyxcbiAgICAgICAgICAgICAgICBgKipSb3dzKio6ICR7c2hlZXQucm93Q291bnQgPz8gJ1x1MjAxNCd9ICB8ICAqKkNvbHVtbnMqKjogJHsoc2hlZXQuY29sdW1ucyA/PyBbXSkubGVuZ3RoIHx8ICdcdTIwMTQnfWAsXG4gICAgICAgICAgICAgICAgJydcbiAgICAgICAgICAgIF0uZmlsdGVyKChsKT0+bCAhPT0gJycpLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgLy8gZG9jX21hcmtkb3duIGJsb2NrXG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gcGFnZV9zZWN0aW9ucyAoaWQsIHBhZ2VfaWQsIHNvcnRfb3JkZXIsIGJsb2NrX3R5cGUsIGNvbmZpZylcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAwLCAnZG9jX21hcmtkb3duJywgJDI6Ompzb25iKTtgLCBbXG4gICAgICAgICAgICAgICAgcGFnZUlkLFxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdBYm91dCB0aGlzIHNoZWV0JyxcbiAgICAgICAgICAgICAgICAgICAgbWFya2Rvd246IHN1bW1hcnlNYXJrZG93blxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIC8vIENhdGVnb3J5LXNwZWNpZmljIGJsb2Nrc1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgY29uc3QgYmxvY2sgPSBibG9ja3NbaV07XG4gICAgICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIHBhZ2Vfc2VjdGlvbnMgKGlkLCBwYWdlX2lkLCBzb3J0X29yZGVyLCBibG9ja190eXBlLCBjb25maWcpXG4gICAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAkMiwgJDMsICQ0Ojpqc29uYik7YCwgW1xuICAgICAgICAgICAgICAgICAgICBwYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgIGkgKyAxLFxuICAgICAgICAgICAgICAgICAgICBibG9jay5ibG9ja1R5cGUsXG4gICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWV0OiBzaGVldC50YWJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGJsb2NrLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjcmVhdGVkLnB1c2goe1xuICAgICAgICAgICAgICAgIHNsdWcsXG4gICAgICAgICAgICAgICAgdGl0bGU6IHNoZWV0LnRpdGxlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjcmVhdGVkO1xufVxuLyoqIFVwc2VydCBrbm93bGVkZ2Ugc25pcHBldHMgKGZ1bGwgY29tcHJlaGVuc2lvbiArIHBlci1zaGVldCBtYXJrZG93bikuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlU25pcHBldHNTdGVwKGNvbXByZWhlbnNpb24sIG1vZGVsLCBkYlVybCkge1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgIC8vIFJhdyBjb21wcmVoZW5zaW9uIEpTT04gKHVzZWQgYnkgQUkgY2hhdCAvIHJlcHJvY2VzcykuXG4gICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBrbm93bGVkZ2Vfc25pcHBldHMgKGlkLCBrZXksIGNhdGVnb3J5LCBjb250ZW50KVxuICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAnZG9jdW1lbnQnLCAkMilcbiAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50O2AsIFtcbiAgICAgICAgICAgICd3b3JrYm9va19jb21wcmVoZW5zaW9uJyxcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBjb21wcmVoZW5kZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIGNvbXByZWhlbnNpb25cbiAgICAgICAgICAgIH0pXG4gICAgICAgIF0pO1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICAvLyBPbmUgaHVtYW4tcmVhZGFibGUgc25pcHBldCBwZXIgc2hlZXQuXG4gICAgICAgIGZvciAoY29uc3Qgc2hlZXQgb2YgY29tcHJlaGVuc2lvbi5zaGVldHMpe1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYHNoZWV0XyR7bm9ybWFsaXplU2x1ZyhzaGVldC50YWJOYW1lKX1gO1xuICAgICAgICAgICAgY29uc3QgbWFya2Rvd24gPSBbXG4gICAgICAgICAgICAgICAgYCMgJHtzaGVldC50aXRsZX1gLFxuICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgIHNoZWV0LnN1bW1hcnksXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgYCoqQ2F0ZWdvcnkqKjogJHtzaGVldC5jYXRlZ29yeX1gLFxuICAgICAgICAgICAgICAgIHNoZWV0LnBlcmlvZEhpbnQgPyBgKipQZXJpb2QqKjogJHtzaGVldC5wZXJpb2RIaW50fWAgOiAnJ1xuICAgICAgICAgICAgXS5maWx0ZXIoKGwpPT5sICE9PSAnJykuam9pbignXFxuJyk7XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjYXRlZ29yeSwgY29udGVudClcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAnc2hlZXQnLCAkMilcbiAgICAgICAgIE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQ7YCwgW1xuICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICBtYXJrZG93blxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvdW50O1xufVxuLyoqXG4gKiBEZXRlcm1pbmlzdGljIHRlbXBsYXRlLWZpdCBzY29yaW5nIChcdTAwQTc1LjUpLlxuICpcbiAqIFNjb3JlcyB0aGUgQUktc3VnZ2VzdGVkIHRlbXBsYXRlIGFnYWluc3QgdGhlIGNvbXByZWhlbmRlZCBzaGVldCBjYXRlZ29yaWVzLlxuICogTm8gZXh0ZXJuYWwgaW1wb3J0cyBcdTIwMTQgYWxsIHRlbXBsYXRlIGRhdGEgaXMgaGFyZGNvZGVkIHRvIGtlZXAgdGhlIGJ1bmRsZSBsZWFuLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWxlY3RUZW1wbGF0ZVN0ZXAoY29tcHJlaGVuc2lvbikge1xuICAgIGNvbnN0IGFpVGVtcGxhdGUgPSBjb21wcmVoZW5zaW9uLnRlbXBsYXRlO1xuICAgIGNvbnN0IGFpQ29uZmlkZW5jZSA9IGFpVGVtcGxhdGU/LmNvbmZpZGVuY2UgPz8gMC41O1xuICAgIGNvbnN0IHNoZWV0Q2F0ZWdvcmllcyA9IGNvbXByZWhlbnNpb24uc2hlZXRzLm1hcCgocyk9PnMuY2F0ZWdvcnkpO1xuICAgIC8vIENhdGVnb3J5IHByb2ZpbGUgcGVyIHRlbXBsYXRlICh3aGljaCBzaGVldCBjYXRlZ29yaWVzIG1hdGNoIGJlc3QpLlxuICAgIGNvbnN0IHRlbXBsYXRlUHJvZmlsZXMgPSB7XG4gICAgICAgICdmaW5hbmNpYWwtYW5hbHl0aWNzJzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICdicmVha19ldmVuJyxcbiAgICAgICAgICAgICAgICAndmFyaWFuY2UnLFxuICAgICAgICAgICAgICAgICd0cmlhbF9iYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnc3VtbWFyeV9wbCcsXG4gICAgICAgICAgICAgICAgJ3N1bW1hcnlfYnMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnZmluYW5jaWFsJyxcbiAgICAgICAgICAgICAgICAncG5sJyxcbiAgICAgICAgICAgICAgICAncHJvZml0JyxcbiAgICAgICAgICAgICAgICAnbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdicmVhayBldmVuJyxcbiAgICAgICAgICAgICAgICAnYmVwJyxcbiAgICAgICAgICAgICAgICAndmFyaWFuY2UnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3RhdXJhbnQ6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAnZGFpbHlfc2FsZXMnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJyxcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdicmVha19ldmVuJyxcbiAgICAgICAgICAgICAgICAnbW9udGhfb25fbW9udGgnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAncmVzdGF1cmFudCcsXG4gICAgICAgICAgICAgICAgJ2tpdGNoZW4nLFxuICAgICAgICAgICAgICAgICdtZW51JyxcbiAgICAgICAgICAgICAgICAnZm9vZCcsXG4gICAgICAgICAgICAgICAgJ2JldmVyYWdlJyxcbiAgICAgICAgICAgICAgICAnY292ZXJzJyxcbiAgICAgICAgICAgICAgICAnZ3Vlc3RzJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBob3RlbDoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdkYWlseV9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnbW9udGhfb25fbW9udGgnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2hvdGVsJyxcbiAgICAgICAgICAgICAgICAncm9vbXMnLFxuICAgICAgICAgICAgICAgICdvY2N1cGFuY3knLFxuICAgICAgICAgICAgICAgICdyZXZwYXInLFxuICAgICAgICAgICAgICAgICdob3VzZWtlZXBpbmcnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgICdlY29tbWVyY2UtcmV0YWlsJzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdkYWlseV9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2Vjb21tZXJjZScsXG4gICAgICAgICAgICAgICAgJ3JldGFpbCcsXG4gICAgICAgICAgICAgICAgJ29ubGluZScsXG4gICAgICAgICAgICAgICAgJ3NrdScsXG4gICAgICAgICAgICAgICAgJ2NhcnQnLFxuICAgICAgICAgICAgICAgICdjb252ZXJzaW9uJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBoZWFsdGhjYXJlOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnaGVhbHRoJyxcbiAgICAgICAgICAgICAgICAncGF0aWVudCcsXG4gICAgICAgICAgICAgICAgJ2NsaW5pYycsXG4gICAgICAgICAgICAgICAgJ21lZGljYWwnLFxuICAgICAgICAgICAgICAgICdwaGFybWFjeSdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgJ3N1cHBseS1jaGFpbic6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJyxcbiAgICAgICAgICAgICAgICAndmFyaWFuY2UnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0J1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ3N1cHBseScsXG4gICAgICAgICAgICAgICAgJ2xvZ2lzdGljcycsXG4gICAgICAgICAgICAgICAgJ2ludmVudG9yeScsXG4gICAgICAgICAgICAgICAgJ3dhcmVob3VzZScsXG4gICAgICAgICAgICAgICAgJ3NoaXBwaW5nJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICAncmVhbC1lc3RhdGUnOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgICAgICAgICAgICAgJ3N1bW1hcnlfYnMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAncmVhbCBlc3RhdGUnLFxuICAgICAgICAgICAgICAgICdwcm9wZXJ0eScsXG4gICAgICAgICAgICAgICAgJ2xlYXNlJyxcbiAgICAgICAgICAgICAgICAncmVudCcsXG4gICAgICAgICAgICAgICAgJ21vcnRnYWdlJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBlZHVjYXRpb246IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdtb250aF9vbl9tb250aCdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdlZHVjYXRpb24nLFxuICAgICAgICAgICAgICAgICdzdHVkZW50JyxcbiAgICAgICAgICAgICAgICAndHVpdGlvbicsXG4gICAgICAgICAgICAgICAgJ2NvdXJzZScsXG4gICAgICAgICAgICAgICAgJ2Vucm9sbG1lbnQnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgICdwcm9mZXNzaW9uYWwtc2VydmljZXMnOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnY29uc3VsdGluZycsXG4gICAgICAgICAgICAgICAgJ3NlcnZpY2VzJyxcbiAgICAgICAgICAgICAgICAnYmlsbGluZycsXG4gICAgICAgICAgICAgICAgJ2NsaWVudCcsXG4gICAgICAgICAgICAgICAgJ3Byb2plY3QnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIG1hbnVmYWN0dXJpbmc6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ21hbnVmYWN0dXJpbmcnLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0aW9uJyxcbiAgICAgICAgICAgICAgICAnZmFjdG9yeScsXG4gICAgICAgICAgICAgICAgJ2JpbGwgb2YgbWF0ZXJpYWxzJyxcbiAgICAgICAgICAgICAgICAnd29yayBvcmRlcidcbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgIH07XG4gICAgZnVuY3Rpb24gY2F0ZWdvcnlPdmVybGFwKHRtcGxJZCkge1xuICAgICAgICBjb25zdCBwcm9maWxlID0gdGVtcGxhdGVQcm9maWxlc1t0bXBsSWRdO1xuICAgICAgICBpZiAoIXByb2ZpbGUpIHJldHVybiAwO1xuICAgICAgICBjb25zdCBtYXRjaGVzID0gc2hlZXRDYXRlZ29yaWVzLmZpbHRlcigoYyk9PnByb2ZpbGUuY2F0ZWdvcmllcy5pbmNsdWRlcyhjKSk7XG4gICAgICAgIHJldHVybiBzaGVldENhdGVnb3JpZXMubGVuZ3RoID4gMCA/IG1hdGNoZXMubGVuZ3RoIC8gc2hlZXRDYXRlZ29yaWVzLmxlbmd0aCA6IDA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGtleXdvcmRNYXRjaCh0bXBsSWQpIHtcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IHRlbXBsYXRlUHJvZmlsZXNbdG1wbElkXTtcbiAgICAgICAgaWYgKCFwcm9maWxlKSByZXR1cm4gMDtcbiAgICAgICAgY29uc3QgdGV4dCA9IFtcbiAgICAgICAgICAgIGNvbXByZWhlbnNpb24ud29ya2Jvb2sudGl0bGUsXG4gICAgICAgICAgICBjb21wcmVoZW5zaW9uLndvcmtib29rLnN1bW1hcnksXG4gICAgICAgICAgICBjb21wcmVoZW5zaW9uLndvcmtib29rLmNvbXBhbnkgPz8gJydcbiAgICAgICAgXS5qb2luKCcgJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHByb2ZpbGUua2V5d29yZHMuZmlsdGVyKChrdyk9PnRleHQuaW5jbHVkZXMoa3cpKTtcbiAgICAgICAgcmV0dXJuIHByb2ZpbGUua2V5d29yZHMubGVuZ3RoID4gMCA/IG1hdGNoZXMubGVuZ3RoIC8gcHJvZmlsZS5rZXl3b3Jkcy5sZW5ndGggOiAwO1xuICAgIH1cbiAgICAvLyBTY29yZSB0aGUgQUktc3VnZ2VzdGVkIHRlbXBsYXRlLlxuICAgIGNvbnN0IHN1Z2dlc3RlZFNjb3JlID0gYWlUZW1wbGF0ZT8uaWQgPyBhaUNvbmZpZGVuY2UgKiAoY2F0ZWdvcnlPdmVybGFwKGFpVGVtcGxhdGUuaWQpICogMC43ICsga2V5d29yZE1hdGNoKGFpVGVtcGxhdGUuaWQpICogMC4zKSA6IC0xO1xuICAgIC8vIFNjb3JlIGFsbCB0ZW1wbGF0ZXMgZm9yIGFsdGVybmF0aXZlcy5cbiAgICBjb25zdCBhbGxTY29yZXMgPSBPYmplY3Qua2V5cyh0ZW1wbGF0ZVByb2ZpbGVzKS5tYXAoKGlkKT0+KHtcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgc2NvcmU6IGNhdGVnb3J5T3ZlcmxhcChpZCkgKiAwLjcgKyBrZXl3b3JkTWF0Y2goaWQpICogMC4zLFxuICAgICAgICAgICAgcmVhc29uOiBgJHtNYXRoLnJvdW5kKGNhdGVnb3J5T3ZlcmxhcChpZCkgKiAxMDApfSUgY2F0ZWdvcnkgbWF0Y2gsICR7TWF0aC5yb3VuZChrZXl3b3JkTWF0Y2goaWQpICogMTAwKX0lIGtleXdvcmQgbWF0Y2hgXG4gICAgICAgIH0pKTtcbiAgICBhbGxTY29yZXMuc29ydCgoYSwgYik9PmIuc2NvcmUgLSBhLnNjb3JlKTtcbiAgICBjb25zdCByZWNvbW1lbmRlZCA9IHN1Z2dlc3RlZFNjb3JlID4gYWxsU2NvcmVzWzBdLnNjb3JlID8gYWlUZW1wbGF0ZS5pZCA6IGFsbFNjb3Jlc1swXS5pZDtcbiAgICBjb25zdCByZWNvbW1lbmRlZFNjb3JlID0gcmVjb21tZW5kZWQgPT09IGFpVGVtcGxhdGU/LmlkID8gc3VnZ2VzdGVkU2NvcmUgOiBhbGxTY29yZXNbMF0uc2NvcmU7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVjb21tZW5kZWQsXG4gICAgICAgIGFpU3VnZ2VzdGlvbjogYWlUZW1wbGF0ZT8uaWQgPz8gbnVsbCxcbiAgICAgICAgYWlDb25maWRlbmNlLFxuICAgICAgICBzY29yZTogTWF0aC5yb3VuZChyZWNvbW1lbmRlZFNjb3JlICogMTAwKSAvIDEwMCxcbiAgICAgICAgcmVhc29uOiBhbGxTY29yZXNbMF0ucmVhc29uLFxuICAgICAgICBhbHRlcm5hdGl2ZXM6IGFsbFNjb3Jlcy5maWx0ZXIoKHMpPT5zLmlkICE9PSByZWNvbW1lbmRlZCkuc2xpY2UoMCwgMykubWFwKChzKT0+KHtcbiAgICAgICAgICAgICAgICBpZDogcy5pZCxcbiAgICAgICAgICAgICAgICBzY29yZTogTWF0aC5yb3VuZChzLnNjb3JlICogMTAwKSAvIDEwMFxuICAgICAgICAgICAgfSkpXG4gICAgfTtcbn1cbi8qKiBCZXN0LWVmZm9ydCByZWdpc3RlciBkeW5hbWljIHBhZ2VzIGluIHRoZSBydW50aW1lIGNhdGFsb2cuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWdpc3RlckR5bmFtaWNQYWdlc1N0ZXAoY29tcHJlaGVuc2lvbikge1xuICAgIC8vIHNldER5bmFtaWNQYWdlcyBpcyBhIHJ1bnRpbWUtc2lkZSBlZmZlY3Q7IGluIHRoZSB3b3JrZmxvdyBjb250ZXh0IHRoZVxuICAgIC8vIGNhdGFsb2cgcmVidWlsZHMgZnJvbSBEQiBhcHBfcGFnZXMgb24gbmV4dCByZXF1ZXN0LiBCZXN0LWVmZm9ydC5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHNldER5bmFtaWNQYWdlcyB9ID0gYXdhaXQgaW1wb3J0KCcuLi8uLi9zcmMvbGliL3BhZ2UtY2F0YWxvZycpO1xuICAgICAgICBjb25zdCBwYWdlcyA9IGNvbXByZWhlbnNpb24uc2hlZXRzLm1hcCgoc2hlZXQpPT4oe1xuICAgICAgICAgICAgICAgIHNsdWc6IGBzaGVldC0ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YCxcbiAgICAgICAgICAgICAgICB0aXRsZTogc2hlZXQudGl0bGUsXG4gICAgICAgICAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnLFxuICAgICAgICAgICAgICAgIG5hdkxhYmVsOiBzaGVldC50aXRsZSxcbiAgICAgICAgICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnZG9jX21hcmtkb3duJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogYHNoZWV0XyR7bm9ybWFsaXplU2x1ZyhzaGVldC50YWJOYW1lKX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBzaGVldC50aXRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAuLi4oU0hFRVRfQ0FURUdPUllfQkxPQ0tTW3NoZWV0LmNhdGVnb3J5XSA/PyBTSEVFVF9DQVRFR09SWV9CTE9DS1Mub3RoZXIpLm1hcCgoYik9Pih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tUeXBlOiBiLmJsb2NrVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hlZXQ6IHNoZWV0LnRhYk5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBiLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICBzZXREeW5hbWljUGFnZXMocGFnZXMpO1xuICAgICAgICByZXR1cm4gcGFnZXMubGVuZ3RoO1xuICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgLy8gUnVudGltZSBjYXRhbG9nIHVuYXZhaWxhYmxlIGluIHdvcmtmbG93IGNvbnRleHQgXHUyMDE0IG5vbi1jcml0aWNhbC5cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxufVxuLy8gXHUyNTAwXHUyNTAwIFBoYXNlIDU6IEdFTkVSQVRFIHN0ZXBzIChPcGVuQUkgXHUyMTkyIEJSIC8gRVMgLyBEYXNoYm9hcmQpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuLyoqIFBhcnNlIEJ1c2luZXNzIFJldmlldyBtYXJrZG93biBpbnRvIHBhcnQgc2VjdGlvbnMgKGxpZ2h0d2VpZ2h0IGlubGluZSBwYXJzZXIpLiAqLyBmdW5jdGlvbiBwYXJzZVJldmlld1BhcnRzKG1hcmtkb3duKSB7XG4gICAgY29uc3QgcGFydHMgPSBbXTtcbiAgICBjb25zdCBoZWFkZXJSZSA9IC9eI3syLDN9XFxzK1BhcnRcXHMrKFtBLVpdKTpcXHMqKC4rKSQvbTtcbiAgICBjb25zdCBzZWN0aW9ucyA9IG1hcmtkb3duLnNwbGl0KC9cXG4oPz0jezIsM31cXHMrUGFydFxccytbQS1aXTopLyk7XG4gICAgbGV0IHNvcnRPcmRlciA9IDA7XG4gICAgZm9yIChjb25zdCBzZWN0aW9uIG9mIHNlY3Rpb25zKXtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBoZWFkZXJSZS5leGVjKHNlY3Rpb24pO1xuICAgICAgICBpZiAoIW1hdGNoKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgWywgbGV0dGVyLCByYXdUaXRsZV0gPSBtYXRjaDtcbiAgICAgICAgY29uc3QgdGl0bGUgPSAocmF3VGl0bGUgPz8gc2VjdGlvbi5zcGxpdCgnXFxuJylbMF0/LnJlcGxhY2UoL14jezIsM31cXHMrUGFydFxccytbQS1aXTpcXHMqLywgJycpID8/ICcnKS50cmltKCk7XG4gICAgICAgIGNvbnN0IHNsdWcgPSBgcGFydC0keyhsZXR0ZXIgPz8gJ2EnKS50b0xvd2VyQ2FzZSgpfWA7XG4gICAgICAgIGNvbnN0IHBhcnRLZXkgPSBgcGFydF8keyhsZXR0ZXIgPz8gJ2EnKS50b0xvd2VyQ2FzZSgpfWA7XG4gICAgICAgIHBhcnRzLnB1c2goe1xuICAgICAgICAgICAgc2x1ZyxcbiAgICAgICAgICAgIHBhcnRLZXksXG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIHNvcnRPcmRlcjogc29ydE9yZGVyKyssXG4gICAgICAgICAgICBtYXJrZG93bjogc2VjdGlvbi50cmltKClcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwYXJ0cztcbn1cbi8qKlxuICogR2VuZXJhdGUgdGhlIEJ1c2luZXNzIFJldmlldyBmcm9tIGNvbXByZWhlbnNpb24gZGF0YS5cbiAqIFNhdmVzIHBhcnNlZCBwYXJ0cyB0byBidXNpbmVzc19yZXZpZXdfcGFydHMgdmlhIHBnLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcChjb21wcmVoZW5zaW9uLCBhcGlLZXksIGRiVXJsLCBtb2RlbCA9ICdncHQtNG8nKSB7XG4gICAgY29uc3QgcHJvbXB0ID0gYnVpbGRHZW5Qcm9tcHQoY29tcHJlaGVuc2lvbiwgJ2J1c2luZXNzUmV2aWV3Jyk7XG4gICAgbGV0IG1hcmtkb3duO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJ1lvdSBhcmUgYSBwcmVjaXNlIGZpbmFuY2lhbCBhbmFseXN0IGFuZCBidXNpbmVzcyB3cml0ZXIuIFJldHVybiBPTkxZIHZhbGlkIEpTT04uJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuMyxcbiAgICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAxNjM4NCxcbiAgICAgICAgICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2pzb25fb2JqZWN0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYE9wZW5BSSBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSlgKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBjb25zdCByZXBseSA9IHJlc3VsdC5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgPz8gJyc7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmVwbHkpO1xuICAgICAgICBtYXJrZG93biA9IHBhcnNlZC5idXNpbmVzc1JldmlldyA/PyAnJztcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCdXNpbmVzcyBSZXZpZXcgZ2VuZXJhdGlvbiBmYWlsZWQ6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgIH1cbiAgICBpZiAoIW1hcmtkb3duLnRyaW0oKSkgcmV0dXJuIDA7XG4gICAgY29uc3QgcGFydHMgPSBwYXJzZVJldmlld1BhcnRzKG1hcmtkb3duKTtcbiAgICBsZXQgc2F2ZWQgPSAwO1xuICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpe1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGJ1c2luZXNzX3Jldmlld19wYXJ0cyAoaWQsIHNsdWcsIHBhcnRfa2V5LCB0aXRsZSwgc29ydF9vcmRlciwgYXV0aF90aWVyLCBtYXJrZG93bilcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAkMiwgJDMsICQ0LCAnZ29vZ2xlJywgJDUpXG4gICAgICAgICBPTiBDT05GTElDVCAoc2x1ZykgRE8gVVBEQVRFIFNFVFxuICAgICAgICAgICBwYXJ0X2tleSA9IEVYQ0xVREVELnBhcnRfa2V5LFxuICAgICAgICAgICB0aXRsZSA9IEVYQ0xVREVELnRpdGxlLFxuICAgICAgICAgICBzb3J0X29yZGVyID0gRVhDTFVERUQuc29ydF9vcmRlcixcbiAgICAgICAgICAgbWFya2Rvd24gPSBFWENMVURFRC5tYXJrZG93bjtgLCBbXG4gICAgICAgICAgICAgICAgcGFydC5zbHVnLFxuICAgICAgICAgICAgICAgIHBhcnQucGFydEtleSxcbiAgICAgICAgICAgICAgICBwYXJ0LnRpdGxlLFxuICAgICAgICAgICAgICAgIHBhcnQuc29ydE9yZGVyLFxuICAgICAgICAgICAgICAgIHBhcnQubWFya2Rvd25cbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgc2F2ZWQrKztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzYXZlZDtcbn1cbi8qKlxuICogR2VuZXJhdGUgdGhlIEV4ZWN1dGl2ZSBTdW1tYXJ5IGZyb20gY29tcHJlaGVuc2lvbiBkYXRhLlxuICogU2F2ZXMgdG8ga25vd2xlZGdlX3NuaXBwZXRzIHZpYSBwZy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcChjb21wcmVoZW5zaW9uLCBhcGlLZXksIGRiVXJsLCBtb2RlbCA9ICdncHQtNG8nKSB7XG4gICAgY29uc3QgcHJvbXB0ID0gYnVpbGRHZW5Qcm9tcHQoY29tcHJlaGVuc2lvbiwgJ2V4ZWN1dGl2ZVN1bW1hcnknKTtcbiAgICBsZXQgbWFya2Rvd247XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAnWW91IGFyZSBhIHByZWNpc2UgZmluYW5jaWFsIGFuYWx5c3QgYW5kIGJ1c2luZXNzIHdyaXRlci4gUmV0dXJuIE9OTFkgdmFsaWQgSlNPTi4nXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHByb21wdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgICAgICAgICAgICAgIG1heF90b2tlbnM6IDE2Mzg0LFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlX2Zvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnanNvbl9vYmplY3QnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgT3BlbkFJIEFQSSBlcnJvciAoJHtyZXNwb25zZS5zdGF0dXN9KWApO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGNvbnN0IHJlcGx5ID0gcmVzdWx0LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudCA/PyAnJztcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyZXBseSk7XG4gICAgICAgIG1hcmtkb3duID0gcGFyc2VkLmV4ZWN1dGl2ZVN1bW1hcnkgPz8gJyc7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhlY3V0aXZlIFN1bW1hcnkgZ2VuZXJhdGlvbiBmYWlsZWQ6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgIH1cbiAgICBpZiAoIW1hcmtkb3duLnRyaW0oKSkgcmV0dXJuIGZhbHNlO1xuICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjYXRlZ29yeSwgY29udGVudClcbiAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAnZXhlY3V0aXZlX3N1bW1hcnknLCAnZG9jdW1lbnQnLCAkMSlcbiAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50O2AsIFtcbiAgICAgICAgICAgIG1hcmtkb3duXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgRGFzaGJvYXJkIERhdGEgZnJvbSBjb21wcmVoZW5zaW9uIGRhdGEuXG4gKiBTYXZlcyB0byBrbm93bGVkZ2Vfc25pcHBldHMgdmlhIHBnLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURhc2hib2FyZFN0ZXAoY29tcHJlaGVuc2lvbiwgYXBpS2V5LCBkYlVybCwgbW9kZWwgPSAnZ3B0LTRvJykge1xuICAgIGNvbnN0IHByb21wdCA9IGJ1aWxkR2VuUHJvbXB0KGNvbXByZWhlbnNpb24sICdkYXNoYm9hcmREYXRhJyk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAnWW91IGFyZSBhIHByZWNpc2UgZmluYW5jaWFsIGFuYWx5c3QuIFJldHVybiBPTkxZIHZhbGlkIEpTT04gd2l0aCBrZXlzIFwiYWN0aW9uUGhhc2VzXCIsIFwidGFyZ2V0Um93c1wiLCBhbmQgXCJsZXZlcnNcIi4nXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHByb21wdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgICAgICAgICAgICAgIG1heF90b2tlbnM6IDE2Mzg0LFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlX2Zvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnanNvbl9vYmplY3QnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgT3BlbkFJIEFQSSBlcnJvciAoJHtyZXNwb25zZS5zdGF0dXN9KWApO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGNvbnN0IHJlcGx5ID0gcmVzdWx0LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudCA/PyAnJztcbiAgICAgICAgaWYgKCFyZXBseSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJlcGx5KTtcbiAgICAgICAgaWYgKCFwYXJzZWQuYWN0aW9uUGhhc2VzICYmICFwYXJzZWQudGFyZ2V0Um93cyAmJiAhcGFyc2VkLmxldmVycykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBrbm93bGVkZ2Vfc25pcHBldHMgKGlkLCBrZXksIGNhdGVnb3J5LCBjb250ZW50KVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJ2Rhc2hib2FyZF9kYXRhJywgJ2RvY3VtZW50JywgJDEpXG4gICAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50O2AsIFtcbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShwYXJzZWQpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgLy8gRGFzaGJvYXJkIGlzIG5vbi1jcml0aWNhbCBcdTIwMTQgc3dhbGxvdyBlcnJvcnNcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbi8qKlxuICogQnVpbGQgYSBnZW5lcmF0aW9uIHByb21wdCBmcm9tIHRoZSB3b3JrYm9vayBjb21wcmVoZW5zaW9uLlxuICogTm8gZXh0ZXJuYWwgZGVwZW5kZW5jaWVzIFx1MjAxNCBwdXJlIGNvbXB1dGF0aW9uIGZyb20gdGhlIGNvbXByZWhlbnNpb24gc3RhdGUuXG4gKi8gZnVuY3Rpb24gYnVpbGRHZW5Qcm9tcHQoY29tcHJlaGVuc2lvbiwgdGFyZ2V0KSB7XG4gICAgY29uc3QgeyB3b3JrYm9vaywgc2hlZXRzLCBwcm9qZWN0aW9ucyB9ID0gY29tcHJlaGVuc2lvbjtcbiAgICBjb25zdCBjb250ZXh0ID0gW1xuICAgICAgICBgIyBHZW5lcmF0ZWQgQ29udGVudDogJHt0YXJnZXQgPT09ICdidXNpbmVzc1JldmlldycgPyAnQnVzaW5lc3MgUmV2aWV3JyA6IHRhcmdldCA9PT0gJ2V4ZWN1dGl2ZVN1bW1hcnknID8gJ0V4ZWN1dGl2ZSBTdW1tYXJ5JyA6ICdEYXNoYm9hcmQgRGF0YSd9YCxcbiAgICAgICAgJycsXG4gICAgICAgIGAjIyBXb3JrYm9vayBTdW1tYXJ5YCxcbiAgICAgICAgYCoqVGl0bGUqKjogJHt3b3JrYm9vay50aXRsZX1gLFxuICAgICAgICBgKipDb21wYW55Kio6ICR7d29ya2Jvb2suY29tcGFueSA/PyAnTi9BJ31gLFxuICAgICAgICBgKipQZXJpb2QqKjogJHt3b3JrYm9vay5wZXJpb2QgPz8gJ04vQSd9YCxcbiAgICAgICAgYCoqQ3VycmVuY3kqKjogJHt3b3JrYm9vay5jdXJyZW5jeSA/PyAnSURSJ31gLFxuICAgICAgICB3b3JrYm9vay5zdW1tYXJ5LFxuICAgICAgICAnJyxcbiAgICAgICAgYCMjIFNoZWV0IEludmVudG9yeSAoJHtzaGVldHMubGVuZ3RofSBzaGVldHMpYCxcbiAgICAgICAgLi4uc2hlZXRzLm1hcCgocyk9PmAtICoqJHtzLnRhYk5hbWV9KiogKCR7cy5jYXRlZ29yeX0pOiAke3MudGl0bGV9IFx1MjAxNCAke3Muc3VtbWFyeX0ke3MucGVyaW9kSGludCA/IGAgWyR7cy5wZXJpb2RIaW50fV1gIDogJyd9YCksXG4gICAgICAgICcnLFxuICAgICAgICBgIyMgQ29uc29saWRhdGVkIEZpbmFuY2lhbCBQcm9qZWN0aW9uc2AsXG4gICAgICAgICdgYGBqc29uJyxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkocHJvamVjdGlvbnMsIG51bGwsIDIpLFxuICAgICAgICAnYGBgJ1xuICAgIF0uam9pbignXFxuJyk7XG4gICAgaWYgKHRhcmdldCA9PT0gJ2J1c2luZXNzUmV2aWV3Jykge1xuICAgICAgICByZXR1cm4gYCR7Y29udGV4dH1cXG5cXG5HZW5lcmF0ZSBPTkxZIGEgXCJidXNpbmVzc1Jldmlld1wiIGRvY3VtZW50IGFzIGEgSlNPTiBvYmplY3Qgd2l0aCBhIHNpbmdsZSBrZXkgXCJidXNpbmVzc1Jldmlld1wiIGNvbnRhaW5pbmcgYSBjb21wcmVoZW5zaXZlIE1hcmtkb3duIGJ1c2luZXNzIHJldmlldy4gSW5jbHVkZSBzZWN0aW9ucyBmb3IgZWFjaCBwYXJ0IG9mIHRoZSBidXNpbmVzczogUGFydCBBOiBSZXZlbnVlICYgU2FsZXMsIFBhcnQgQjogQ29zdHMgJiBNYXJnaW5zLCBQYXJ0IEM6IFByb2ZpdGFiaWxpdHkgJiBFQklUREEsIFBhcnQgRDogQnJlYWstRXZlbiBBbmFseXNpcywgUGFydCBFOiBUcmVuZHMgJiBQcm9qZWN0aW9ucywgUGFydCBGOiBSaXNrcyAmIFJlY29tbWVuZGF0aW9ucy4gVXNlICMjIFBhcnQgWDogVGl0bGUgaGVhZGVycy4gSW5jbHVkZSBkYXRhIHRhYmxlcyBmcm9tIHRoZSBwcm9qZWN0aW9ucy5gO1xuICAgIH1cbiAgICBpZiAodGFyZ2V0ID09PSAnZXhlY3V0aXZlU3VtbWFyeScpIHtcbiAgICAgICAgcmV0dXJuIGAke2NvbnRleHR9XFxuXFxuR2VuZXJhdGUgT05MWSBhbiBcImV4ZWN1dGl2ZVN1bW1hcnlcIiBkb2N1bWVudCBhcyBhIEpTT04gb2JqZWN0IHdpdGggYSBzaW5nbGUga2V5IFwiZXhlY3V0aXZlU3VtbWFyeVwiIGNvbnRhaW5pbmcgYSBjb25jaXNlIE1hcmtkb3duIGV4ZWN1dGl2ZSBzdW1tYXJ5ICgxLTIgcGFnZXMpIGhpZ2hsaWdodGluZyB0aGUga2V5IGZpbmFuY2lhbCBtZXRyaWNzLCB0cmVuZHMsIHJpc2tzLCBhbmQgYWN0aW9uYWJsZSByZWNvbW1lbmRhdGlvbnMgZnJvbSB0aGUgd29ya2Jvb2sgZGF0YS5gO1xuICAgIH1cbiAgICByZXR1cm4gYCR7Y29udGV4dH1cXG5cXG5HZW5lcmF0ZSBPTkxZIGEgSlNPTiBvYmplY3Qgd2l0aCBrZXlzIFwiYWN0aW9uUGhhc2VzXCIgKGFycmF5IG9mIHtwaGFzZSwgZGVzY3JpcHRpb259KSwgXCJ0YXJnZXRSb3dzXCIgKGFycmF5IG9mIHtsYWJlbCwgdmFsdWUsIHVuaXR9KSwgYW5kIFwibGV2ZXJzXCIgKGFycmF5IG9mIHtuYW1lLCBpbXBhY3QsIGFjdGlvbnNbXX0pIGJhc2VkIG9uIHRoZSBmaW5hbmNpYWwgZGF0YS4gRm9jdXMgb24gYWN0aW9uYWJsZSBvcGVyYXRpb25hbCByZWNvbW1lbmRhdGlvbnMuYDtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9sb2FkV29ya2Jvb2tTdGVwXCIsIGxvYWRXb3JrYm9va1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2V4dHJhY3RTaGVldHNTdGVwXCIsIGV4dHJhY3RTaGVldHNTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9hbmFseXplU2hlZXRzU3RlcFwiLCBhbmFseXplU2hlZXRzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vY29tcHJlaGVuZFdvcmtib29rU3RlcFwiLCBjb21wcmVoZW5kV29ya2Jvb2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9lbWl0UHJvZ3Jlc3NTdGVwXCIsIGVtaXRQcm9ncmVzc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2Nsb3NlUHJvZ3Jlc3NTdGVwXCIsIGNsb3NlUHJvZ3Jlc3NTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9wb3B1bGF0ZVByb2plY3Rpb25zU3RlcFwiLCBwb3B1bGF0ZVByb2plY3Rpb25zU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vdXBzZXJ0U2hlZXRQYWdlc1N0ZXBcIiwgdXBzZXJ0U2hlZXRQYWdlc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NhdmVTbmlwcGV0c1N0ZXBcIiwgc2F2ZVNuaXBwZXRzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2VsZWN0VGVtcGxhdGVTdGVwXCIsIHNlbGVjdFRlbXBsYXRlU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vcmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwXCIsIHJlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXBcIiwgZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXBcIiwgZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVEYXNoYm9hcmRTdGVwXCIsIGdlbmVyYXRlRGFzaGJvYXJkU3RlcCk7XG4iLCAiLyoqXG4gKiBXb3JrYm9vayBTaGVldCBFeHRyYWN0aW9uIChkZXBlbmRlbmN5LWZyZWUpXG4gKlxuICogUHVyZSBzaGVldCBzZXJpYWxpemF0aW9uICsgc3RydWN0dXJhbCBzdGF0aXN0aWNzLiBUaGlzIG1vZHVsZSBpbnRlbnRpb25hbGx5XG4gKiBoYXMgTk8gYXBwbGljYXRpb24gYWxpYXNlcyAoYEAvLi4uYCksIG5vIHpvZCwgYW5kIG5vIE9wZW5BSSBpbXBvcnRzIHNvIHRoYXRcbiAqIGl0IGNhbiBiZSBidW5kbGVkIGludG8gVmVyY2VsIFdvcmtmbG93IHN0ZXAgYnVuZGxlcyAod29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdClcbiAqIHdpdGhvdXQgZHJhZ2dpbmcgdGhlIHdob2xlIGRvbWFpbiBsYXllciBhbG9uZy5cbiAqXG4gKiBUaGUgQUktZmlyc3QgcGlwZWxpbmUgc2VyaWFsaXplcyBldmVyeSBzaGVldCB0byBwbGFpbiB0ZXh0ICh0YWIgbmFtZSArIHJvd3MpXG4gKiBhbmQgbGV0cyB0aGUgbW9kZWwgZG8gdGhlIGNvbXByZWhlbnNpb24uIFRoZSBzdHJ1Y3R1cmFsIHN0YXRpc3RpY3MgcHJvZHVjZWRcbiAqIGhlcmUgZmVlZCBhIGRldGVybWluaXN0aWMgQU5BTFlaRSBwcmUtcGFzcyB0aGF0IGVucmljaGVzIHRoZSBBSSBwcm9tcHQuXG4gKi8gaW1wb3J0IHsgcmVhZCwgdXRpbHMgfSBmcm9tICd4bHN4JztcbmV4cG9ydCBjb25zdCBTSEVFVF9DQVRFR09SSUVTID0gW1xuICAgICdkYWlseV9zYWxlcycsXG4gICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgJ3RyaWFsX2JhbGFuY2UnLFxuICAgICdnZW5lcmFsX2xlZGdlcicsXG4gICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICdtb250aF9vbl9tb250aCcsXG4gICAgJ2JyZWFrX2V2ZW4nLFxuICAgICd2YXJpYW5jZScsXG4gICAgJ3N1bW1hcnlfcGwnLFxuICAgICdzdW1tYXJ5X2JzJyxcbiAgICAnb3RoZXInXG5dO1xuZXhwb3J0IGNvbnN0IE1BWF9TSEVFVF9ST1dTID0gNDA7XG5leHBvcnQgY29uc3QgTUFYX1NIRUVUX0NPTFMgPSAxNjtcbmV4cG9ydCBjb25zdCBNQVhfQ0VMTF9DSEFSUyA9IDgwO1xuZnVuY3Rpb24gZm9ybWF0Q2VsbCh2KSB7XG4gICAgaWYgKHYgPT0gbnVsbCkgcmV0dXJuICcnO1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgaWYgKE51bWJlci5pc0ludGVnZXIodikpIHJldHVybiBTdHJpbmcodik7XG4gICAgICAgIHJldHVybiB2LnRvRml4ZWQoMikucmVwbGFjZSgvXFwuMDAkLywgJycpO1xuICAgIH1cbiAgICBjb25zdCBzID0gU3RyaW5nKHYpLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCk7XG4gICAgcmV0dXJuIHMubGVuZ3RoID4gTUFYX0NFTExfQ0hBUlMgPyBzLnNsaWNlKDAsIE1BWF9DRUxMX0NIQVJTIC0gMSkgKyAnXHUyMDI2JyA6IHM7XG59XG5mdW5jdGlvbiByZWFkRnVsbEdyaWQoc2hlZXQpIHtcbiAgICByZXR1cm4gdXRpbHMuc2hlZXRfdG9fanNvbihzaGVldCwge1xuICAgICAgICBoZWFkZXI6IDEsXG4gICAgICAgIGRlZnZhbDogbnVsbCxcbiAgICAgICAgcmF3OiB0cnVlXG4gICAgfSk7XG59XG5mdW5jdGlvbiBjYXBHcmlkKGdyaWQsIG1heFJvd3MsIG1heENvbHMpIHtcbiAgICBjb25zdCBjYXBwZWQgPSBbXTtcbiAgICBmb3IobGV0IHIgPSAwOyByIDwgTWF0aC5taW4oZ3JpZC5sZW5ndGgsIG1heFJvd3MpOyByKyspe1xuICAgICAgICBjb25zdCByb3cgPSBncmlkW3JdID8/IFtdO1xuICAgICAgICBjb25zdCB0cmltbWVkID0gcm93LnNsaWNlKDAsIG1heENvbHMpO1xuICAgICAgICBpZiAodHJpbW1lZC5zb21lKChjKT0+YyAhPSBudWxsICYmIFN0cmluZyhjKS50cmltKCkgIT09ICcnKSkgY2FwcGVkLnB1c2godHJpbW1lZCk7XG4gICAgfVxuICAgIHJldHVybiBjYXBwZWQ7XG59XG5mdW5jdGlvbiBncmlkVG9UZXh0KGdyaWQpIHtcbiAgICBjb25zdCBsaW5lcyA9IGdyaWQubWFwKChyb3csIGkpPT57XG4gICAgICAgIGNvbnN0IGNlbGxzID0gcm93Lm1hcCgoYyk9PmZvcm1hdENlbGwoYykpO1xuICAgICAgICAvLyBUcmltIHRyYWlsaW5nIGVtcHRpZXMgZm9yIGNvbXBhY3RuZXNzXG4gICAgICAgIHdoaWxlKGNlbGxzLmxlbmd0aCA+IDAgJiYgY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV0gPT09ICcnKWNlbGxzLnBvcCgpO1xuICAgICAgICByZXR1cm4gYFIke2kgKyAxfTogJHtjZWxscy5qb2luKCcgfCAnKX1gO1xuICAgIH0pO1xuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVTdGF0cyh0YWJOYW1lLCBncmlkKSB7XG4gICAgbGV0IGNvbENvdW50ID0gMDtcbiAgICBsZXQgbnVtZXJpY0NlbGxzID0gMDtcbiAgICBsZXQgbm9uRW1wdHlDZWxscyA9IDA7XG4gICAgZm9yIChjb25zdCByb3cgb2YgZ3JpZCl7XG4gICAgICAgIGlmIChyb3cubGVuZ3RoID4gY29sQ291bnQpIGNvbENvdW50ID0gcm93Lmxlbmd0aDtcbiAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHJvdyl7XG4gICAgICAgICAgICBpZiAoY2VsbCA9PSBudWxsIHx8IFN0cmluZyhjZWxsKS50cmltKCkgPT09ICcnKSBjb250aW51ZTtcbiAgICAgICAgICAgIG5vbkVtcHR5Q2VsbHMrKztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2VsbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBudW1lcmljQ2VsbHMrKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGwgPT09ICdzdHJpbmcnICYmIC9eWy0rXT9cXGRbXFxkLixdKiQvLnRlc3QoY2VsbC50cmltKCkpKSB7XG4gICAgICAgICAgICAgICAgbnVtZXJpY0NlbGxzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGFiTmFtZSxcbiAgICAgICAgcm93Q291bnQ6IGdyaWQubGVuZ3RoLFxuICAgICAgICBjb2xDb3VudCxcbiAgICAgICAgbnVtZXJpY1JhdGlvOiBub25FbXB0eUNlbGxzID4gMCA/IG51bWVyaWNDZWxscyAvIG5vbkVtcHR5Q2VsbHMgOiAwLFxuICAgICAgICBub25FbXB0eUNlbGxzXG4gICAgfTtcbn1cbi8qKiBTZXJpYWxpemUgb25lIHdvcmtzaGVldCB0byB0ZXh0IChyb3ctbnVtYmVyZWQsIGNhcHBlZCkgZm9yIHRoZSBBSSBwcm9tcHQuICovIGV4cG9ydCBmdW5jdGlvbiByZW5kZXJTaGVldEZvckFpKHdiLCB0YWJOYW1lLCBtYXhSb3dzID0gTUFYX1NIRUVUX1JPV1MsIG1heENvbHMgPSBNQVhfU0hFRVRfQ09MUykge1xuICAgIGNvbnN0IHNoZWV0ID0gd2IuU2hlZXRzW3RhYk5hbWVdO1xuICAgIGlmICghc2hlZXQpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGdyaWQgPSBjYXBHcmlkKHJlYWRGdWxsR3JpZChzaGVldCksIG1heFJvd3MsIG1heENvbHMpO1xuICAgIGlmIChncmlkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGFiTmFtZSxcbiAgICAgICAgdGV4dDogZ3JpZFRvVGV4dChncmlkKVxuICAgIH07XG59XG4vKiogU2VyaWFsaXplIEFMTCBzaGVldHMgb2YgYSB3b3JrYm9vayB0byB0ZXh0IGJsb2Nrcy4gQWNjZXB0cyBVaW50OEFycmF5IG9yIEJ1ZmZlci4gKi8gZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckFsbFNoZWV0c0ZvckFpKGJ1Zikge1xuICAgIGNvbnN0IHdiID0gcmVhZChidWYsIHtcbiAgICAgICAgdHlwZTogJ2J1ZmZlcidcbiAgICB9KTtcbiAgICBjb25zdCBibG9ja3MgPSBbXTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygd2IuU2hlZXROYW1lcyA/PyBbXSl7XG4gICAgICAgIGNvbnN0IHJlbmRlcmVkID0gcmVuZGVyU2hlZXRGb3JBaSh3YiwgbmFtZSk7XG4gICAgICAgIGlmIChyZW5kZXJlZCkgYmxvY2tzLnB1c2gocmVuZGVyZWQpO1xuICAgIH1cbiAgICByZXR1cm4gYmxvY2tzO1xufVxuLyoqXG4gKiBTZXJpYWxpemUgQUxMIHNoZWV0cyBBTkQgY29tcHV0ZSBmdWxsLWdyaWQgc3RydWN0dXJhbCBzdGF0aXN0aWNzLlxuICogVGhpcyBpcyB0aGUgRVhUUkFDVCBvdXRwdXQgZm9yIHRoZSB3b3JrZmxvdyBwaXBlbGluZTogb25lIHBhcnNlIHBlclxuICogc2hlZXQgcHJvZHVjZXMgYm90aCB0aGUgQUkgcHJvbXB0IGJsb2NrIGFuZCB0aGUgQU5BTFlaRSBoaW50cy5cbiAqLyBleHBvcnQgZnVuY3Rpb24gZXh0cmFjdFNoZWV0c1dpdGhTdGF0cyhidWYpIHtcbiAgICBjb25zdCB3YiA9IHJlYWQoYnVmLCB7XG4gICAgICAgIHR5cGU6ICdidWZmZXInXG4gICAgfSk7XG4gICAgY29uc3Qgc2hlZXRzID0gW107XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHdiLlNoZWV0TmFtZXMgPz8gW10pe1xuICAgICAgICBjb25zdCBzaGVldCA9IHdiLlNoZWV0c1tuYW1lXTtcbiAgICAgICAgaWYgKCFzaGVldCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGZ1bGxHcmlkID0gcmVhZEZ1bGxHcmlkKHNoZWV0KTtcbiAgICAgICAgaWYgKGZ1bGxHcmlkLmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IHN0YXRzID0gY29tcHV0ZVN0YXRzKG5hbWUsIGZ1bGxHcmlkKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGdyaWRUb1RleHQoY2FwR3JpZChmdWxsR3JpZCwgTUFYX1NIRUVUX1JPV1MsIE1BWF9TSEVFVF9DT0xTKSk7XG4gICAgICAgIHNoZWV0cy5wdXNoKHtcbiAgICAgICAgICAgIHRhYk5hbWU6IG5hbWUsXG4gICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgc3RhdHNcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBzaGVldHM7XG59XG4iLCAiLyoqXG4gKiBXb3JrYm9vayBTaGVldCBBbmFseXNpcyAoZGV0ZXJtaW5pc3RpYyBwcmUtcGFzcylcbiAqXG4gKiBBIGRlcGVuZGVuY3ktZnJlZSBoZXVyaXN0aWMgcGFzcyBvdmVyIGV4dHJhY3RlZCBzaGVldHMgdGhhdCBwcm9kdWNlc1xuICogXCJBbmFseXNpc0hpbnRzXCIgXHUyMDE0IHN0cnVjdHVyZWQgY29udGV4dCB0aGF0OlxuICogICAtIGlzIGZlZCBpbnRvIHRoZSBDT01QUkVIRU5EIHByb21wdCB0byBiaWFzIHRoZSBtb2RlbCAoUGhhc2UgMiksXG4gKiAgIC0gZ2l2ZXMgdGhlIHJvdXRlIGxheWVyIGEgZmFzdCBwcmUtQUkgc3RhdHVzIChcIndlIHNlZSA0IHNoZWV0cywgbW9zdGx5XG4gKiAgICAgbnVtZXJpYywgbGlrZWx5IElEUiwgcGVyaW9kIGhpbnRzIDIwMjYtMDZcIikuXG4gKlxuICogTm8gYXBwbGljYXRpb24gYWxpYXNlcyBhbmQgbm8gZXh0ZXJuYWwgZGVwcyBcdTIwMTQgc2FmZSB0byBidW5kbGUgaW50byB0aGVcbiAqIFZlcmNlbCBXb3JrZmxvdyBzdGVwIGJ1bmRsZS5cbiAqLyBpbXBvcnQgeyBTSEVFVF9DQVRFR09SSUVTIH0gZnJvbSAnLi9leHRyYWN0LXNoZWV0cyc7XG4vLyBcdTI1MDBcdTI1MDAgSGV1cmlzdGljIHRhYmxlcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmNvbnN0IENVUlJFTkNZX1BBVFRFUk5TID0gW1xuICAgIFtcbiAgICAgICAgJ0lEUicsXG4gICAgICAgIC9cXGIoPzpJRFJ8UnBcXC4/fFJ1cGlhaClcXGIvaVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnVVNEJyxcbiAgICAgICAgL1xcYig/OlVTRHxcXCQpXFxiL1xuICAgIF0sXG4gICAgW1xuICAgICAgICAnRVVSJyxcbiAgICAgICAgL1xcYig/OkVVUnxcdTIwQUMpXFxiL1xuICAgIF0sXG4gICAgW1xuICAgICAgICAnR0JQJyxcbiAgICAgICAgL1xcYig/OkdCUHxcdTAwQTMpXFxiL1xuICAgIF1cbl07XG5jb25zdCBNT05USF9OQU1FUyA9IFtcbiAgICAnamFudWFyeScsXG4gICAgJ2ZlYnJ1YXJ5JyxcbiAgICAnbWFyY2gnLFxuICAgICdhcHJpbCcsXG4gICAgJ21heScsXG4gICAgJ2p1bmUnLFxuICAgICdqdWx5JyxcbiAgICAnYXVndXN0JyxcbiAgICAnc2VwdGVtYmVyJyxcbiAgICAnb2N0b2JlcicsXG4gICAgJ25vdmVtYmVyJyxcbiAgICAnZGVjZW1iZXInLFxuICAgICdqYW51YXJpJyxcbiAgICAnZmVicnVhcmknLFxuICAgICdtYXJldCcsXG4gICAgJ2FwcmlsJyxcbiAgICAnbWVpJyxcbiAgICAnanVuaScsXG4gICAgJ2p1bGknLFxuICAgICdhZ3VzdHVzJyxcbiAgICAnc2VwdGVtYmVyJyxcbiAgICAnb2t0b2JlcicsXG4gICAgJ25vdmVtYmVyJyxcbiAgICAnZGVzZW1iZXInXG5dO1xuZnVuY3Rpb24gcGVyaW9kUGF0dGVybnMoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgL1xcYigxOXwyMClcXGR7Mn1bLS9dKDA/WzEtOV18MVswLTJdKSg/OlstL11cXGR7MSwyfSk/XFxiL2csXG4gICAgICAgIC9cXGIoMD9bMS05XXwxWzAtMl0pWy0vXSgxOXwyMClcXGR7Mn1cXGIvZyxcbiAgICAgICAgbmV3IFJlZ0V4cChgXFxcXGIoPzoke01PTlRIX05BTUVTLmpvaW4oJ3wnKX0pXFxcXGJgLCAnZ2knKSxcbiAgICAgICAgL1xcYlFbMS00XVsgLV0/KD86MTl8MjApXFxkezJ9XFxiL2dpXG4gICAgXTtcbn1cbmNvbnN0IExBQkVMX0NBVEVHT1JZX01BUCA9IFtcbiAgICBbXG4gICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdQUk9GSVQgJiBMT1NTJyxcbiAgICAgICAgICAgICdQUk9GSVQgQU5EIExPU1MnLFxuICAgICAgICAgICAgJ0xhYmEgUnVnaScsXG4gICAgICAgICAgICAnSU5DT01FIFNUQVRFTUVOVCcsXG4gICAgICAgICAgICAnUCZMJyxcbiAgICAgICAgICAgICdFQklUREEnLFxuICAgICAgICAgICAgJ05FVCBQUk9GSVQnLFxuICAgICAgICAgICAgJ05FVCBJTkNPTUUnLFxuICAgICAgICAgICAgJ0xBQkEgQkVSU0lIJyxcbiAgICAgICAgICAgICdSVUdJJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ0JBTEFOQ0UgU0hFRVQnLFxuICAgICAgICAgICAgJ05FUkFDQScsXG4gICAgICAgICAgICAnQVNTRVQnLFxuICAgICAgICAgICAgJ0xJQUJJTElUJyxcbiAgICAgICAgICAgICdFS1VJVEFTJyxcbiAgICAgICAgICAgICdFUVVJVFknLFxuICAgICAgICAgICAgJ1RPVEFMIEFTU0VUUydcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAndHJpYWxfYmFsYW5jZScsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdUUklBTCBCQUxBTkNFJyxcbiAgICAgICAgICAgICdORVJBQ0EgU0FMRE8nXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ2dlbmVyYWxfbGVkZ2VyJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ0dFTkVSQUwgTEVER0VSJyxcbiAgICAgICAgICAgICdCVUtVIEJFU0FSJyxcbiAgICAgICAgICAgICdKVVJOQUwnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnQ09TVCBPRiBTQUxFUycsXG4gICAgICAgICAgICAnQ09HUycsXG4gICAgICAgICAgICAnSEFSR0EgUE9LT0snLFxuICAgICAgICAgICAgJ0ZPT0QgQ09TVCcsXG4gICAgICAgICAgICAnQkVWRVJBR0UgQ09TVCdcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnYnJlYWtfZXZlbicsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdCUkVBSyBFVkVOJyxcbiAgICAgICAgICAgICdCUkVBSy1FVkVOJyxcbiAgICAgICAgICAgICdCRVAnLFxuICAgICAgICAgICAgJ1RJVElLIElNUEFTJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdkYWlseV9zYWxlcycsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdEQUlMWSBTQUxFUycsXG4gICAgICAgICAgICAnUEVOSlVBTEFOIEhBUklBTicsXG4gICAgICAgICAgICAnT01aRVQnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ21vbnRoX29uX21vbnRoJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ01PTlRIIE9OIE1PTlRIJyxcbiAgICAgICAgICAgICdNT00nLFxuICAgICAgICAgICAgJ0JVTEFOQU4nXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ3ZhcmlhbmNlJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ1ZBUklBTkNFJyxcbiAgICAgICAgICAgICdWQVJJQU5TSScsXG4gICAgICAgICAgICAnU0VMSVNJSCcsXG4gICAgICAgICAgICAnQUNUVUFMIFZTIEJVREdFVCcsXG4gICAgICAgICAgICAnQUNUVUFMIFZTJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdzdW1tYXJ5X3BsJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ1NVTU1BUlkgUCZMJyxcbiAgICAgICAgICAgICdSSU5HS0FTQU4gTEFCQSBSVUdJJyxcbiAgICAgICAgICAgICdTVU1NQVJZIFBST0ZJVCdcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnc3VtbWFyeV9icycsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdTVU1NQVJZIEJBTEFOQ0UnLFxuICAgICAgICAgICAgJ1JJTkdLQVNBTiBORVJBQ0EnXG4gICAgICAgIF1cbiAgICBdXG5dO1xuZnVuY3Rpb24gY29sbGVjdEhpbnRzKHRleHQpIHtcbiAgICBjb25zdCBjdXJyZW5jeSA9IFtdO1xuICAgIGZvciAoY29uc3QgW25hbWUsIHJlXSBvZiBDVVJSRU5DWV9QQVRURVJOUyl7XG4gICAgICAgIGlmIChyZS50ZXN0KHRleHQpKSBjdXJyZW5jeS5wdXNoKG5hbWUpO1xuICAgIH1cbiAgICBjb25zdCBwZXJpb2RzID0gW107XG4gICAgZm9yIChjb25zdCByZSBvZiBwZXJpb2RQYXR0ZXJucygpKXtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHRleHQubWF0Y2gocmUpO1xuICAgICAgICBpZiAobWF0Y2hlcykgcGVyaW9kcy5wdXNoKC4uLm1hdGNoZXMpO1xuICAgIH1cbiAgICBjb25zdCBsYWJlbHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IFssIHRlcm1zXSBvZiBMQUJFTF9DQVRFR09SWV9NQVApe1xuICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybXMpe1xuICAgICAgICAgICAgaWYgKHRleHQudG9VcHBlckNhc2UoKS5pbmNsdWRlcyh0ZXJtLnRvVXBwZXJDYXNlKCkpKSBsYWJlbHMucHVzaCh0ZXJtKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW5jeSxcbiAgICAgICAgcGVyaW9kcyxcbiAgICAgICAgbGFiZWxzXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGd1ZXNzQ2F0ZWdvcnkobGFiZWxzKSB7XG4gICAgY29uc3Qgc2NvcmVzID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgW2NhdGVnb3J5LCB0ZXJtc10gb2YgTEFCRUxfQ0FURUdPUllfTUFQKXtcbiAgICAgICAgbGV0IHNjb3JlID0gMDtcbiAgICAgICAgZm9yIChjb25zdCB0ZXJtIG9mIHRlcm1zKXtcbiAgICAgICAgICAgIGlmIChsYWJlbHMuaW5jbHVkZXModGVybSkpIHNjb3JlICs9IHRlcm0ubGVuZ3RoOyAvLyBsb25nZXIgdGVybXMgYXJlIG1vcmUgc3BlY2lmaWNcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NvcmUgPiAwKSBzY29yZXMuc2V0KGNhdGVnb3J5LCBzY29yZSk7XG4gICAgfVxuICAgIGlmIChzY29yZXMuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3Qgc29ydGVkID0gW1xuICAgICAgICAuLi5zY29yZXMuZW50cmllcygpXG4gICAgXS5zb3J0KChhLCBiKT0+YlsxXSAtIGFbMV0pO1xuICAgIGlmIChzb3J0ZWQubGVuZ3RoID4gMSAmJiBzb3J0ZWRbMF1bMV0gPT09IHNvcnRlZFsxXVsxXSkgcmV0dXJuIG51bGw7IC8vIHRpZSBcdTIxOTIgYW1iaWd1b3VzXG4gICAgcmV0dXJuIHNvcnRlZFswXVswXTtcbn1cbmZ1bmN0aW9uIGJlc3RHdWVzcyh2YWx1ZXMpIHtcbiAgICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgY291bnRzID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgdiBvZiB2YWx1ZXMpY291bnRzLnNldCh2LCAoY291bnRzLmdldCh2KSA/PyAwKSArIDEpO1xuICAgIHJldHVybiBbXG4gICAgICAgIC4uLmNvdW50cy5lbnRyaWVzKClcbiAgICBdLnNvcnQoKGEsIGIpPT5iWzFdIC0gYVsxXSlbMF1bMF07XG59XG4vLyBcdTI1MDBcdTI1MDAgUHVibGljIEFQSSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8qKiBBbmFseXplIGV4dHJhY3RlZCBzaGVldHMgKEVYVFJBQ1Qgb3V0cHV0KSBpbnRvIGRldGVybWluaXN0aWMgaGludHMuICovIGV4cG9ydCBmdW5jdGlvbiBhbmFseXplU2hlZXRzKHNoZWV0cykge1xuICAgIGNvbnN0IHNoZWV0SGludHMgPSBzaGVldHMubWFwKChzKT0+e1xuICAgICAgICBjb25zdCB7IGN1cnJlbmN5LCBwZXJpb2RzLCBsYWJlbHMgfSA9IGNvbGxlY3RIaW50cyhzLnRleHQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGFiTmFtZTogcy50YWJOYW1lLFxuICAgICAgICAgICAgcm93Q291bnQ6IHMuc3RhdHMucm93Q291bnQsXG4gICAgICAgICAgICBjb2xDb3VudDogcy5zdGF0cy5jb2xDb3VudCxcbiAgICAgICAgICAgIG51bWVyaWNSYXRpbzogcy5zdGF0cy5udW1lcmljUmF0aW8sXG4gICAgICAgICAgICBjdXJyZW5jeUhpbnRzOiBjdXJyZW5jeSxcbiAgICAgICAgICAgIHBlcmlvZEhpbnRzOiBwZXJpb2RzLFxuICAgICAgICAgICAgbGFiZWxIaW50czogbGFiZWxzLFxuICAgICAgICAgICAgbGlrZWx5Q2F0ZWdvcnk6IGd1ZXNzQ2F0ZWdvcnkobGFiZWxzKVxuICAgICAgICB9O1xuICAgIH0pO1xuICAgIGNvbnN0IHRvdGFsUm93cyA9IHNoZWV0SGludHMucmVkdWNlKChhY2MsIHMpPT5hY2MgKyBzLnJvd0NvdW50LCAwKTtcbiAgICBjb25zdCB0b3RhbE5vbkVtcHR5Q2VsbHMgPSBzaGVldHMucmVkdWNlKChhY2MsIHMpPT5hY2MgKyBzLnN0YXRzLm5vbkVtcHR5Q2VsbHMsIDApO1xuICAgIGNvbnN0IHdlaWdodGVkTnVtZXJpYyA9IHNoZWV0cy5yZWR1Y2UoKGFjYywgcyk9PmFjYyArIHMuc3RhdHMubnVtZXJpY1JhdGlvICogcy5zdGF0cy5ub25FbXB0eUNlbGxzLCAwKTtcbiAgICBjb25zdCBhbGxDdXJyZW5jeSA9IHNoZWV0SGludHMuZmxhdE1hcCgocyk9PnMuY3VycmVuY3lIaW50cyk7XG4gICAgY29uc3QgYWxsUGVyaW9kcyA9IHNoZWV0SGludHMuZmxhdE1hcCgocyk9PnMucGVyaW9kSGludHMpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHdvcmtib29rOiB7XG4gICAgICAgICAgICBzaGVldENvdW50OiBzaGVldHMubGVuZ3RoLFxuICAgICAgICAgICAgdG90YWxSb3dzLFxuICAgICAgICAgICAgdG90YWxOb25FbXB0eUNlbGxzLFxuICAgICAgICAgICAgb3ZlcmFsbE51bWVyaWNSYXRpbzogdG90YWxOb25FbXB0eUNlbGxzID4gMCA/IHdlaWdodGVkTnVtZXJpYyAvIHRvdGFsTm9uRW1wdHlDZWxscyA6IDAsXG4gICAgICAgICAgICBjdXJyZW5jeUd1ZXNzOiBiZXN0R3Vlc3MoYWxsQ3VycmVuY3kpLFxuICAgICAgICAgICAgcGVyaW9kR3Vlc3M6IGJlc3RHdWVzcyhhbGxQZXJpb2RzKVxuICAgICAgICB9LFxuICAgICAgICBzaGVldHM6IHNoZWV0SGludHNcbiAgICB9O1xufVxuZXhwb3J0IHsgU0hFRVRfQ0FURUdPUklFUyB9O1xuIiwgIi8qKlxuICogV29ya2Jvb2sgQ29tcHJlaGVuc2lvbiBcdTIwMTQgYnVuZGxlLWxlYW4gT3BlbkFJIGNhbGxcbiAqXG4gKiBUaGlzIG1vZHVsZSBjb250YWlucyBPTkxZIHRoZSBjb21wcmVoZW5zaW9uIHJlcXVlc3QgcGF0aDogWm9kIHNjaGVtYXMsXG4gKiBwcm9tcHQgYnVpbGRpbmcgKGhpbnRzLWF3YXJlKSwgYSBzaW5nbGUtYXR0ZW1wdCBPcGVuQUkgY2FsbCB3aXRoIHR5cGVkXG4gKiBlcnJvcnMsIGFuZCByZXNwb25zZSBwYXJzaW5nLlxuICpcbiAqIEJ1bmRsZSBjb25zdHJhaW50czpcbiAqICAgLSBOTyBhcHBsaWNhdGlvbiBhbGlhc2VzIChgQC8uLi5gKSBcdTIwMTQgb25seSBgem9kYCArIHJlbGF0aXZlIGltcG9ydHMuXG4gKiAgIC0gTm8gREIgLyBzZWNyZXRzIC8gUHJpc21hIFx1MjAxNCB0aGUgQVBJIGtleSBpcyBwYXNzZWQgaW4gZXhwbGljaXRseS5cbiAqICAgLSBTYWZlIHRvIGJ1bmRsZSBpbnRvIFZlcmNlbCBXb3JrZmxvdyBzdGVwIGJ1bmRsZXMgKHdvcmtmbG93cy8qKS5cbiAqXG4gKiBUaGUgc3luYyBwaXBlbGluZSB3cmFwcGVyIChgY29tcHJlaGVuZFdvcmtib29rYCBpbiB3b3JrYm9vay1jb21wcmVoZW5zaW9uLnRzKVxuICoga2VlcHMgaXRzIG93biBrZXkgcmVzb2x1dGlvbiArIDItYXR0ZW1wdCByZXRyeSBsb29wIGZvciB0aGUgbm9uLXdvcmtmbG93XG4gKiBwYXRoOyB0aGlzIG1vZHVsZSBpcyB0aGUgc2hhcmVkIHNpbmdsZS1hdHRlbXB0IGNvcmUuXG4gKi8gaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBTSEVFVF9DQVRFR09SSUVTIH0gZnJvbSAnLi9leHRyYWN0LXNoZWV0cyc7XG4vLyBcdTI1MDBcdTI1MDAgWm9kIHZhbGlkYXRpb24gc2NoZW1hIGZvciB0aGUgQUkgc3RydWN0dXJlZCBvdXRwdXQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5leHBvcnQgY29uc3QgTWV0cmljU2NoZW1hID0gei5vYmplY3Qoe1xuICAgIC8qKiBQZXJpb2QgaW4gWVlZWS1NTSAoYW5udWFsIHRvdGFscyBtYXkgdXNlIFlZWVktMTIpLiAqLyBwZXJpb2Q6IHouc3RyaW5nKCkucmVnZXgoL15cXGR7NH0tXFxkezJ9JC8pLFxuICAgIGRhdGFUeXBlOiB6LmVudW0oW1xuICAgICAgICAnYWN0dWFsJyxcbiAgICAgICAgJ2ZvcmVjYXN0J1xuICAgIF0pLFxuICAgIHNjZW5hcmlvOiB6LmVudW0oW1xuICAgICAgICAnYWN0dWFsJyxcbiAgICAgICAgJ2NvbnNlcnZhdGl2ZScsXG4gICAgICAgICdyZWFsaXN0aWMnLFxuICAgICAgICAnYXNwaXJhdGlvbmFsJ1xuICAgIF0pLFxuICAgIHJldmVudWU6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgIGViaXRkYTogei5udW1iZXIoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgbmV0SW5jb21lOiB6Lm51bWJlcigpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICBndWVzdHM6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgIHN0YWZmQ29zdDogei5udW1iZXIoKS5udWxsYWJsZSgpLm9wdGlvbmFsKClcbn0pO1xuZXhwb3J0IGNvbnN0IFNoZWV0Q29tcHJlaGVuc2lvblNjaGVtYSA9IHoub2JqZWN0KHtcbiAgICAvKiogRXhhY3QgdGFiIG5hbWUgYXMgaXQgYXBwZWFycyBpbiB0aGUgd29ya2Jvb2suICovIHRhYk5hbWU6IHouc3RyaW5nKCksXG4gICAgY2F0ZWdvcnk6IHouZW51bShTSEVFVF9DQVRFR09SSUVTKSxcbiAgICAvKiogSHVtYW4tcmVhZGFibGUgdGl0bGUgZm9yIHRoZSBkeW5hbWljIHBhZ2UuICovIHRpdGxlOiB6LnN0cmluZygpLFxuICAgIC8qKiBPbmUtcGFyYWdyYXBoIGNvbXByZWhlbnNpb24gb2Ygd2hhdCB0aGlzIHNoZWV0IGNvbnRhaW5zLiAqLyBzdW1tYXJ5OiB6LnN0cmluZygpLFxuICAgIC8qKiBEZXRlY3RlZCBwZXJpb2QsIGUuZy4gXCJKdW5lIDIwMjZcIiBcdTIwMTQgbnVsbCB3aGVuIG5vdCBkZXRlY3RhYmxlLiAqLyBwZXJpb2RIaW50OiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAvKiogQ29sdW1uIGhlYWRlcnMgKGZpcnN0IG1lYW5pbmdmdWwgcm93KS4gKi8gY29sdW1uczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLFxuICAgIHJvd0NvdW50OiB6Lm51bWJlcigpLmludCgpLm5vbm5lZ2F0aXZlKCkub3B0aW9uYWwoKSxcbiAgICAvKiogUGVyLXBlcmlvZCBtZXRyaWNzIGZvdW5kIG9uIFRISVMgc2hlZXQuICovIG1ldHJpY3M6IHouYXJyYXkoTWV0cmljU2NoZW1hKS5vcHRpb25hbCgpXG59KTtcbmV4cG9ydCBjb25zdCBXb3JrYm9va0NvbXByZWhlbnNpb25TY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgd29ya2Jvb2s6IHoub2JqZWN0KHtcbiAgICAgICAgdGl0bGU6IHouc3RyaW5nKCksXG4gICAgICAgIGNvbXBhbnk6IHouc3RyaW5nKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgICAgICBwZXJpb2Q6IHouc3RyaW5nKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgICAgICBjdXJyZW5jeTogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgICAgIHN1bW1hcnk6IHouc3RyaW5nKClcbiAgICB9KSxcbiAgICBzaGVldHM6IHouYXJyYXkoU2hlZXRDb21wcmVoZW5zaW9uU2NoZW1hKSxcbiAgICAvKipcbiAgICogTm9ybWFsaXplZCBmaW5hbmNpYWwgcHJvamVjdGlvbnMgY29uc29saWRhdGVkIGFjcm9zcyBBTEwgc2hlZXRzLlxuICAgKiBUaGlzIGlzIHRoZSBzb3VyY2UgZm9yIHRoZSBmaW5hbmNpYWxfcHJvamVjdGlvbnMgdGFibGUuXG4gICAqLyBwcm9qZWN0aW9uczogei5hcnJheShNZXRyaWNTY2hlbWEpLFxuICAgIC8qKlxuICAgKiBUZW1wbGF0ZSBzdWdnZXN0aW9uIGZyb20gdGhlIGF2YWlsYWJsZSB0ZW1wbGF0ZSBjYXRhbG9nXG4gICAqIChURU1QTEFURV9DQVRBTE9HIGlkcywgZS5nLiBcImZpbmFuY2lhbC1hbmFseXRpY3NcIiwgXCJyZXN0YXVyYW50XCIpLlxuICAgKi8gdGVtcGxhdGU6IHoub2JqZWN0KHtcbiAgICAgICAgaWQ6IHouc3RyaW5nKCksXG4gICAgICAgIGNvbmZpZGVuY2U6IHoubnVtYmVyKCkubWluKDApLm1heCgxKS5vcHRpb25hbCgpLFxuICAgICAgICByZWFzb246IHouc3RyaW5nKCkub3B0aW9uYWwoKVxuICAgIH0pLm9wdGlvbmFsKClcbn0pO1xuLy8gXHUyNTAwXHUyNTAwIFR5cGVkIGVycm9ycyAobWFwcGVkIHRvIHRoZSB3b3JrZmxvdyByZXRyeSBwb2xpY3kgYnkgdGhlIGNhbGxlcikgXHUyNTAwXG5leHBvcnQgY2xhc3MgQ29tcHJlaGVuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG9wdGlvbnMpe1xuICAgICAgICBzdXBlcihtZXNzYWdlLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0NvbXByZWhlbmRFcnJvcic7XG4gICAgfVxufVxuLyoqIEhUVFAtbGV2ZWwgZmFpbHVyZSAobm9uLTJ4eCkuIENhcnJpZXMgc3RhdHVzICsgb3B0aW9uYWwgUmV0cnktQWZ0ZXIuICovIGV4cG9ydCBjbGFzcyBDb21wcmVoZW5kSHR0cEVycm9yIGV4dGVuZHMgQ29tcHJlaGVuZEVycm9yIHtcbiAgICBzdGF0dXM7XG4gICAgLyoqIFJldHJ5LUFmdGVyIGhlYWRlciB2YWx1ZSBpbiBzZWNvbmRzLCB3aGVuIHByZXNlbnQuICovIHJldHJ5QWZ0ZXJTZWNvbmRzO1xuICAgIGNvbnN0cnVjdG9yKHN0YXR1cywgbWVzc2FnZSwgcmV0cnlBZnRlclNlY29uZHMgPSBudWxsKXtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdDb21wcmVoZW5kSHR0cEVycm9yJztcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMucmV0cnlBZnRlclNlY29uZHMgPSByZXRyeUFmdGVyU2Vjb25kcztcbiAgICB9XG59XG4vKiogUmVzcG9uc2UgY291bGQgbm90IGJlIHBhcnNlZC92YWxpZGF0ZWQgKEpTT04gb3IgWm9kKS4gKi8gZXhwb3J0IGNsYXNzIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IgZXh0ZW5kcyBDb21wcmVoZW5kRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG9wdGlvbnMpe1xuICAgICAgICBzdXBlcihtZXNzYWdlLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0NvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3InO1xuICAgIH1cbn1cbi8vIFx1MjUwMFx1MjUwMCBQcm9tcHQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5jb25zdCBTWVNURU1fUFJPTVBUID0gJ1lvdSBhcmUgYSBwcmVjaXNlIGZpbmFuY2lhbCBhbmFseXN0IGFuZCB3b3JrYm9vayBpbnRlcnByZXRlci4gJyArICdZb3UgcmVhZCByYXcgc3ByZWFkc2hlZXQgZHVtcHMgYW5kIHJldHVybiBPTkxZIHZhbGlkIEpTT04gbWF0Y2hpbmcgdGhlIHJlcXVlc3RlZCBzY2hlbWEgZXhhY3RseS4gJyArICdOZXZlciBpbnZlbnQgZGF0YSB0aGF0IGlzIG5vdCBwcmVzZW50IGluIHRoZSBzaGVldHMgXHUyMDE0IGxlYXZlIG1ldHJpY3MgbnVsbCB3aGVuIGFic2VudC4nO1xuLyoqIFJlbmRlciB0aGUgZGV0ZXJtaW5pc3RpYyBBTkFMWVpFIGhpbnRzIGFzIGEgcHJvbXB0IHNlY3Rpb24uICovIGZ1bmN0aW9uIHJlbmRlckhpbnRzU2VjdGlvbihoaW50cykge1xuICAgIGNvbnN0IHdiID0gaGludHMud29ya2Jvb2s7XG4gICAgY29uc3QgbGluZXMgPSBbXG4gICAgICAgIGAtIFdvcmtib29rOiAke3diLnNoZWV0Q291bnR9IHNoZWV0KHMpLCAke3diLnRvdGFsUm93c30gdG90YWwgcm93cywgYCArIGAke01hdGgucm91bmQod2Iub3ZlcmFsbE51bWVyaWNSYXRpbyAqIDEwMCl9JSBudW1lcmljIGNlbGxzLmBcbiAgICBdO1xuICAgIGlmICh3Yi5jdXJyZW5jeUd1ZXNzKSBsaW5lcy5wdXNoKGAtIEN1cnJlbmN5IGd1ZXNzOiAke3diLmN1cnJlbmN5R3Vlc3N9YCk7XG4gICAgaWYgKHdiLnBlcmlvZEd1ZXNzKSBsaW5lcy5wdXNoKGAtIFBlcmlvZCBndWVzczogJHt3Yi5wZXJpb2RHdWVzc31gKTtcbiAgICBmb3IgKGNvbnN0IHMgb2YgaGludHMuc2hlZXRzKXtcbiAgICAgICAgY29uc3QgcGFydHMgPSBbXG4gICAgICAgICAgICBgXCIke3MudGFiTmFtZX1cIjogJHtzLnJvd0NvdW50fSByb3dzIFx1MDBENyAke3MuY29sQ291bnR9IGNvbHMsIGAgKyBgJHtNYXRoLnJvdW5kKHMubnVtZXJpY1JhdGlvICogMTAwKX0lIG51bWVyaWNgXG4gICAgICAgIF07XG4gICAgICAgIGlmIChzLmN1cnJlbmN5SGludHMubGVuZ3RoID4gMCkgcGFydHMucHVzaChgY3VycmVuY3kgWyR7cy5jdXJyZW5jeUhpbnRzLmpvaW4oJywnKX1dYCk7XG4gICAgICAgIGlmIChzLnBlcmlvZEhpbnRzLmxlbmd0aCA+IDApIHBhcnRzLnB1c2goYHBlcmlvZHMgWyR7cy5wZXJpb2RIaW50cy5qb2luKCcsICcpfV1gKTtcbiAgICAgICAgaWYgKHMubGFiZWxIaW50cy5sZW5ndGggPiAwKSBwYXJ0cy5wdXNoKGBsYWJlbHMgWyR7cy5sYWJlbEhpbnRzLmpvaW4oJywgJyl9XWApO1xuICAgICAgICBpZiAocy5saWtlbHlDYXRlZ29yeSkgcGFydHMucHVzaChgY2F0ZWdvcnktZ3Vlc3MgJHtzLmxpa2VseUNhdGVnb3J5fWApO1xuICAgICAgICBsaW5lcy5wdXNoKGAgIC0gU2hlZXQgJHtwYXJ0cy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59XG5leHBvcnQgZnVuY3Rpb24gYnVpbGRDb21wcmVoZW5zaW9uUHJvbXB0KGJsb2NrcywgaGludHMpIHtcbiAgICBjb25zdCBzaGVldEJsb2NrcyA9IGJsb2Nrcy5tYXAoKGIpPT5gPT09PT0gU0hFRVQ6ICR7Yi50YWJOYW1lfSA9PT09PVxcbiR7Yi50ZXh0fVxcbmApLmpvaW4oJ1xcbicpO1xuICAgIGNvbnN0IGhpbnRzU2VjdGlvbiA9IGhpbnRzID8gYERFVEVSTUlOSVNUSUMgUFJFLUFOQUxZU0lTIChnZW5lcmF0ZWQgYnkgY29kZSBcdTIwMTQgdXNlIGFzIHN0cm9uZyBwcmlvcnMsIGJ1dCBBTFdBWVMgdmVyaWZ5IGFnYWluc3QgdGhlIGFjdHVhbCBkdW1wOyBjYXRlZ29yeS1ndWVzcyBpcyBub3QgYXV0aG9yaXRhdGl2ZSk6XG4ke3JlbmRlckhpbnRzU2VjdGlvbihoaW50cyl9XG5cbmAgOiAnJztcbiAgICByZXR1cm4gYEFuYWx5emUgdGhlIGZvbGxvd2luZyB3b3JrYm9vay4gRXZlcnkgc2hlZXQgb2YgdGhlIHdvcmtib29rIGlzIGR1bXBlZCBiZWxvdyBhcyBcIlI8cm93PjogPGNlbGxzPlwiLlxuXG5UQVNLUzpcbjEuIFVuZGVyc3RhbmQgdGhlIHdvcmtib29rIGFzIGEgd2hvbGUgKGNvbXBhbnksIHBlcmlvZCwgY3VycmVuY3ksIHB1cnBvc2UpLlxuMi4gRm9yIEVBQ0ggc2hlZXQ6IGlkZW50aWZ5IGl0cyBjYXRlZ29yeSwgYSBodW1hbi1yZWFkYWJsZSB0aXRsZSwgYSBzaG9ydCBjb21wcmVoZW5zaW9uIHN1bW1hcnksIGRldGVjdGVkIHBlcmlvZCAoZS5nLiBcIkp1bmUgMjAyNlwiKSwgY29sdW1uIGhlYWRlcnMsIHJvdyBjb3VudCwgYW5kIGFueSBwZXItcGVyaW9kIGZpbmFuY2lhbCBtZXRyaWNzIChyZXZlbnVlLCBFQklUREEsIG5ldCBpbmNvbWUsIGd1ZXN0cywgc3RhZmYgY29zdCkgeW91IGNhbiByZWFkIGZyb20gdGhlIHNoZWV0LlxuMy4gQ29uc29saWRhdGUgQUxMIHBlcmlvZC1sZXZlbCBmaW5hbmNpYWwgZGF0YSBhY3Jvc3MgdGhlIHdob2xlIHdvcmtib29rIGludG8gYSBzaW5nbGUgXCJwcm9qZWN0aW9uc1wiIGFycmF5OiBvbmUgZW50cnkgcGVyIChwZXJpb2QgWVlZWS1NTSwgZGF0YVR5cGUgYWN0dWFsfGZvcmVjYXN0LCBzY2VuYXJpbyBhY3R1YWx8Y29uc2VydmF0aXZlfHJlYWxpc3RpY3xhc3BpcmF0aW9uYWwpLiBVc2UgdGhlIGJlc3Qgc291cmNlIGZvciBlYWNoIHBlcmlvZCAoZS5nLiBhIFAmTCBzdGF0ZW1lbnQgZm9yIGFjdHVhbHMsIGEgQkVQIHRhYmxlIG9yIGJ1ZGdldCBzaGVldCBmb3IgZm9yZWNhc3RzKS4gQW5udWFsIHRvdGFscyB1c2UgWVlZWS0xMi4gT25seSBpbmNsdWRlIGVudHJpZXMgd2hlcmUgYXQgbGVhc3Qgb25lIG1ldHJpYyBpcyBwcmVzZW50LlxuNC4gU3VnZ2VzdCB0aGUgbW9zdCBhcHByb3ByaWF0ZSBhcHAgdGVtcGxhdGUgaWQgZnJvbSB0aGlzIGF2YWlsYWJsZSBjYXRhbG9nOiBmaW5hbmNpYWwtYW5hbHl0aWNzLCByZXN0YXVyYW50LCBob3RlbCwgZWR1Y2F0aW9uLCBlY29tbWVyY2UtcmV0YWlsLCBoZWFsdGhjYXJlLCBtYW51ZmFjdHVyaW5nLCBwcm9mZXNzaW9uYWwtc2VydmljZXMsIHJlYWwtZXN0YXRlLCBzdXBwbHktY2hhaW4gKGNvbmZpZGVuY2UgMC4uMSkuXG5cblJVTEVTOlxuLSBwZXJpb2RzOiBZWVlZLU1NIG9ubHkgKGUuZy4gXCIyMDI2LTA2XCIsIFwiMjAyNS0xMlwiIGZvciBhbm51YWwpLlxuLSBkYXRhVHlwZSBcImFjdHVhbFwiIGZvciByZXBvcnRlZC9hY3R1YWwgZmlndXJlcywgXCJmb3JlY2FzdFwiIGZvciBwcm9qZWN0aW9ucy9idWRnZXRzLlxuLSBzY2VuYXJpbzogXCJhY3R1YWxcIiBmb3IgYWN0dWFsczsgXCJjb25zZXJ2YXRpdmVcIiBmb3IgYmFzZSBmb3JlY2FzdHM7IFwicmVhbGlzdGljXCIvXCJhc3BpcmF0aW9uYWxcIiB3aGVuIHRoZSBzaGVldCBleHBsaWNpdGx5IGxhYmVscyBzY2VuYXJpb3MuXG4tIEFtb3VudHMgYXJlIGZ1bGwgSURSIGludGVnZXJzIChubyBcIktcIiBzaG9ydGhhbmQpLiBSb3VuZCB0byBpbnRlZ2Vycy5cbi0gTGVhdmUgYSBtZXRyaWMgbnVsbCB3aGVuIHRoZSBzaGVldCBkb2VzIG5vdCBjb250YWluIGl0IGZvciB0aGF0IHBlcmlvZC5cbi0gY2F0ZWdvcnkgbXVzdCBiZSBvbmUgb2Y6ICR7U0hFRVRfQ0FURUdPUklFUy5qb2luKCcsICcpfS5cblxuJHtoaW50c1NlY3Rpb259V09SS0JPT0sgRFVNUDpcbiR7c2hlZXRCbG9ja3N9YDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcENvZGVGZW5jZShyZXBseSkge1xuICAgIGNvbnN0IG1hdGNoID0gcmVwbHkubWF0Y2goL2BgYCg/Ompzb24pP1xccyooW1xcc1xcU10qPylgYGAvKTtcbiAgICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6IHJlcGx5O1xufVxuLyoqXG4gKiBPTkUgT3BlbkFJIGNhbGwgdG8gY29tcHJlaGVuZCB0aGUgd29ya2Jvb2suIE5vIHJldHJ5IGxvb3AgXHUyMDE0IHRoZSBjYWxsZXJcbiAqIChzeW5jIHBpcGVsaW5lIG9yIHdvcmtmbG93IHN0ZXApIG93bnMgcmV0cnkgcG9saWN5LlxuICpcbiAqIFRocm93czpcbiAqICAgLSBDb21wcmVoZW5kSHR0cEVycm9yIChzdGF0dXMgNDI5IGNhcnJpZXMgcmV0cnlBZnRlclNlY29uZHMpXG4gKiAgIC0gQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvciAoYmFkIEpTT04gLyBab2QgcmVqZWN0aW9uKVxuICogICAtIENvbXByZWhlbmRFcnJvciAobmV0d29yayBldGMuIFx1MjAxNCB3cmFwcGVkIGZyb20gZmV0Y2ggZmFpbHVyZXMpXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXByZWhlbmRPbmNlKGJsb2Nrcywgb3B0aW9ucykge1xuICAgIGNvbnN0IHsgbW9kZWwgPSAnZ3B0LTRvJywgaGludHMsIGFwaUtleSwgYmFzZVVybCA9ICdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxJyB9ID0gb3B0aW9ucztcbiAgICBpZiAoYmxvY2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcignV29ya2Jvb2sgY29udGFpbnMgbm8gcmVhZGFibGUgc2hlZXRzJyk7XG4gICAgfVxuICAgIGNvbnN0IHByb21wdCA9IGJ1aWxkQ29tcHJlaGVuc2lvblByb21wdChibG9ja3MsIGhpbnRzKTtcbiAgICBsZXQgcmVzcG9uc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtiYXNlVXJsfS9jaGF0L2NvbXBsZXRpb25zYCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBTWVNURU1fUFJPTVBUXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHByb21wdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC4yLFxuICAgICAgICAgICAgICAgIG1heF90b2tlbnM6IDE2Mzg0LFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlX2Zvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnanNvbl9vYmplY3QnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kRXJyb3IoYE9wZW5BSSByZXF1ZXN0IGZhaWxlZDogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCwge1xuICAgICAgICAgICAgY2F1c2U6IGVyclxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zdCBlcnJCb2R5ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpLmNhdGNoKCgpPT4nVW5rbm93biBlcnJvcicpO1xuICAgICAgICBsZXQgcmV0cnlBZnRlclNlY29uZHMgPSBudWxsO1xuICAgICAgICBjb25zdCByZXRyeUFmdGVyID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ3JldHJ5LWFmdGVyJyk7XG4gICAgICAgIGlmIChyZXRyeUFmdGVyKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBOdW1iZXIocmV0cnlBZnRlcik7XG4gICAgICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHBhcnNlZCkgJiYgcGFyc2VkID49IDApIHJldHJ5QWZ0ZXJTZWNvbmRzID0gcGFyc2VkO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kSHR0cEVycm9yKHJlc3BvbnNlLnN0YXR1cywgYE9wZW5BSSBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSk6ICR7ZXJyQm9keX1gLCByZXRyeUFmdGVyU2Vjb25kcyk7XG4gICAgfVxuICAgIGxldCByZXN1bHQ7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcihgT3BlbkFJIHJlc3BvbnNlIHdhcyBub3QgdmFsaWQgSlNPTjogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgfVxuICAgIGNvbnN0IHJlcGx5ID0gcmVzdWx0LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudCA/PyAnJztcbiAgICBsZXQgcGFyc2VkO1xuICAgIHRyeSB7XG4gICAgICAgIHBhcnNlZCA9IEpTT04ucGFyc2Uoc3RyaXBDb2RlRmVuY2UocmVwbHkpKTtcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yKCdBSSByZXNwb25zZSB3YXMgbm90IHZhbGlkIEpTT046ICcgKyByZXBseS5zbGljZSgwLCA1MDApKTtcbiAgICB9XG4gICAgbGV0IGNvbXByZWhlbnNpb247XG4gICAgdHJ5IHtcbiAgICAgICAgY29tcHJlaGVuc2lvbiA9IFdvcmtib29rQ29tcHJlaGVuc2lvblNjaGVtYS5wYXJzZShwYXJzZWQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBmaXJzdCA9IGVyciBpbnN0YW5jZW9mIHouWm9kRXJyb3IgPyBlcnIuaXNzdWVzWzBdIDogbnVsbDtcbiAgICAgICAgY29uc3QgZGV0YWlsID0gZmlyc3QgPyBgJHtmaXJzdC5wYXRoLmpvaW4oJy4nKSB8fCAncm9vdCd9OiAke2ZpcnN0Lm1lc3NhZ2V9YCA6IFN0cmluZyhlcnIpO1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcihgQUkgcmVzcG9uc2UgZmFpbGVkIHNjaGVtYSB2YWxpZGF0aW9uOiAke2RldGFpbH1gLCB7XG4gICAgICAgICAgICBjYXVzZTogZXJyXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjb21wcmVoZW5zaW9uLFxuICAgICAgICBtb2RlbCxcbiAgICAgICAgcHJvbXB0TGVuZ3RoOiBwcm9tcHQubGVuZ3RoXG4gICAgfTtcbn1cbiIsICIvKipcbiAqIFByb2dyZXNzIGVtaXNzaW9uIGZvciB0aGUgd29ya2Jvb2staW5nZXN0IHdvcmtmbG93LlxuICpcbiAqIEZvbGxvd3MgdGhlIFNESyBzdHJlYW1pbmcgcGF0dGVybjpcbiAqICAgLSB0aGUgd29ya2Zsb3cgZnVuY3Rpb24gY2FsbHMgYGdldFdyaXRhYmxlKClgIGFuZCBwYXNzZXMgdGhlIHN0cmVhbSB0byBzdGVwcztcbiAqICAgLSBzdGVwcyBvYnRhaW4gYSB3cml0ZXIsIHdyaXRlIEpTT04gY2h1bmtzLCBhbmQgcmVsZWFzZSB0aGUgbG9jay5cbiAqXG4gKiBUaGUgd3JpdGFibGUgc3RyZWFtIGlzIHNlcmlhbGl6ZWQgYnkgcmVmZXJlbmNlIGFjcm9zcyBzdGVwIGJvdW5kYXJpZXNcbiAqIChzdHJlYW1Ub1N0cmVhbVJlZiksIHNvIHdlIGFsd2F5cyBwYXNzIHRoZSByYXcgV3JpdGFibGVTdHJlYW0gXHUyMDE0IG5ldmVyIGFcbiAqIHdyYXBwZXIgb2JqZWN0LlxuICovIC8qKlxuICogRW5jb2RlIGEgcHJvZ3Jlc3MgY2h1bmsgYXMgYSBKU09OIHN0cmluZyAoY2h1bmtzIGFyZSB3cml0dGVuIGFzIHRleHQpLlxuICovIGV4cG9ydCBmdW5jdGlvbiBlbmNvZGVDaHVuayhjaHVuaykge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShjaHVuayk7XG59XG4vKipcbiAqIFdyaXRlIG9uZSBwcm9ncmVzcyBjaHVuay4gQ2FsbCBmcm9tIHdpdGhpbiBhIHN0ZXA6XG4gKlxuICogICBhc3luYyBmdW5jdGlvbiBlbWl0UHJvZ3Jlc3NTdGVwKHdyaXRhYmxlOiBXcml0YWJsZVN0cmVhbSwgY2h1bms6IFByb2dyZXNzQ2h1bmspIHtcbiAqICAgICAndXNlIHN0ZXAnO1xuICogICAgIGF3YWl0IHdyaXRlUHJvZ3Jlc3NDaHVuayh3cml0YWJsZSwgY2h1bmspO1xuICogICB9XG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlUHJvZ3Jlc3NDaHVuayh3cml0YWJsZSwgY2h1bmspIHtcbiAgICBjb25zdCB3cml0ZXIgPSB3cml0YWJsZS5nZXRXcml0ZXIoKTtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCB3cml0ZXIud3JpdGUoY2h1bmspO1xuICAgIH0gZmluYWxseXtcbiAgICAgICAgd3JpdGVyLnJlbGVhc2VMb2NrKCk7XG4gICAgfVxufVxuLyoqIENsb3NlIHRoZSBzdHJlYW0gdG8gc2lnbmFsIGNvbXBsZXRpb24uIENhbGwgZnJvbSB3aXRoaW4gYSBzdGVwLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0cmVhbSh3cml0YWJsZSkge1xuICAgIGF3YWl0IHdyaXRhYmxlLmNsb3NlKCk7XG59XG4iLCAiLyoqXG4gKiBMaWdodHdlaWdodCBQb3N0Z3JlU1FMIGhlbHBlciBmb3Igd29ya2Zsb3cgc3RlcHMgKHBnIGRyaXZlciwgbm8gUHJpc21hKS5cbiAqXG4gKiBFYWNoIHN0ZXAgb3BlbnMgaXRzIG93biBzaG9ydC1saXZlZCBjb25uZWN0aW9uIFx1MjAxNCBmaW5lIGZvciB3b3JrZmxvdyBzdGVwc1xuICogd2hpY2ggYXJlIGFscmVhZHkgaW5kaXZpZHVhbGx5IGludm9pY2VkIFZlcmNlbCBGdW5jdGlvbiBpbnZvY2F0aW9ucy5cbiAqIFRoZSBwb29sL2Nvbm5lY3Rpb24tc3RyaW5nIGNvbWVzIGZyb20gYHByb2Nlc3MuZW52LlBPU1RHUkVTX1VSTGAgKHNldCBieVxuICogdGhlIFZlcmNlbC9OZW9uIGludGVncmF0aW9uIGFuZCBhdmFpbGFibGUgaW4gc3RlcCBydW50aW1lKS5cbiAqLyBpbXBvcnQgeyBDbGllbnQgfSBmcm9tICdwZyc7XG4vKipcbiAqIFJ1biBhIGNhbGxiYWNrIHdpdGggYSBzaG9ydC1saXZlZCBwZyBjb25uZWN0aW9uLlxuICogVGhlIGNvbm5lY3Rpb24gc3RyaW5nIGlzIHJlc29sdmVkIGJ5IHRoZSByb3V0ZSAocm9vdCBlbnYgXHUyMTkyIHRlbmFudCBkYl91cmwgbG9va3VwKVxuICogYW5kIHBhc3NlZCB0aHJvdWdoIHRoZSB3b3JrZmxvdyBpbnB1dCBcdTIwMTQgbmV2ZXIgcmVhZCBmcm9tIHByb2Nlc3MuZW52IGRpcmVjdGx5LlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3aXRoUGdDbGllbnQoY29ubmVjdGlvblN0cmluZywgZm4pIHtcbiAgICBpZiAoIWNvbm5lY3Rpb25TdHJpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkYXRhYmFzZSBjb25uZWN0aW9uIHN0cmluZyBwcm92aWRlZC4nKTtcbiAgICB9XG4gICAgY29uc3QgY2xpZW50ID0gbmV3IENsaWVudCh7XG4gICAgICAgIGNvbm5lY3Rpb25TdHJpbmdcbiAgICB9KTtcbiAgICBhd2FpdCBjbGllbnQuY29ubmVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBmbihjbGllbnQpO1xuICAgIH0gZmluYWxseXtcbiAgICAgICAgYXdhaXQgY2xpZW50LmVuZCgpO1xuICAgIH1cbn1cbi8qKiBSdW4gYSBzaW5nbGUgU1FMIHN0YXRlbWVudCBhbmQgcmV0dXJuIHRoZSByb3cgY291bnQgb3IgcmVzdWx0LiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZU9uZShjbGllbnQsIHNxbCwgcGFyYW1zID0gW10pIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQucXVlcnkoc3FsLCBwYXJhbXMpO1xuICAgIHJldHVybiByZXN1bHQucm93Q291bnQgPz8gMDtcbn1cbi8qKiBSdW4gU1FMIGFuZCByZXR1cm4gYWxsIHJvd3MuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBxdWVyeVJvd3MoY2xpZW50LCBzcWwsIHBhcmFtcyA9IFtdKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnF1ZXJ5KHNxbCwgcGFyYW1zKTtcbiAgICByZXR1cm4gcmVzdWx0LnJvd3M7XG59XG4iLCAiLyoqXG4gKiBTZXJkZSBjb21wbGlhbmNlIGNoZWNrZXIgZm9yIHdvcmtmbG93IGN1c3RvbSBjbGFzcyBzZXJpYWxpemF0aW9uLlxuICpcbiAqIEFuYWx5emVzIHNvdXJjZSBjb2RlIHRvIGRldGVybWluZSBpZiBjbGFzc2VzIHdpdGggV09SS0ZMT1dfU0VSSUFMSVpFIC9cbiAqIFdPUktGTE9XX0RFU0VSSUFMSVpFIGFyZSBjb3JyZWN0bHkgc2V0IHVwIGZvciB0aGUgd29ya2Zsb3cgc2FuZGJveC5cbiAqXG4gKiBVc2VkIGJ5OlxuICogLSBDTEkgYHZhbGlkYXRlYCBjb21tYW5kXG4gKiAtIENMSSBgdHJhbnNmb3JtYCBjb21tYW5kICgtLWNoZWNrLXNlcmRlKVxuICogLSBTV0MgcGxheWdyb3VuZCBzZXJkZSBhbmFseXNpcyBwYW5lbFxuICogLSBCdWlsZC10aW1lIHdhcm5pbmdzIGluIEJhc2VCdWlsZGVyXG4gKi9cblxuaW1wb3J0IGJ1aWx0aW5Nb2R1bGVzIGZyb20gJ2J1aWx0aW4tbW9kdWxlcyc7XG5pbXBvcnQgdHlwZSB7IFdvcmtmbG93TWFuaWZlc3QgfSBmcm9tICcuL2FwcGx5LXN3Yy10cmFuc2Zvcm0uanMnO1xuXG4vLyBCdWlsZCBhIHJlZ2V4IHRoYXQgbWF0Y2hlcyBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBpbXBvcnRzIGluIHRyYW5zZm9ybWVkIGNvZGUuXG4vLyBIYW5kbGVzIGJvdGggRVNNIChgZnJvbSAnZnMnYCwgYGZyb20gJ25vZGU6ZnMnYCkgYW5kIENKUyAoYHJlcXVpcmUoJ2ZzJylgKVxuY29uc3Qgbm9kZUJ1aWx0aW5zID0gYnVpbHRpbk1vZHVsZXMuam9pbignfCcpO1xuXG4vLyBSZWdleCB0byBleHRyYWN0IHNwZWNpZmljIG1vZHVsZSBuYW1lcyBmcm9tIGltcG9ydC9yZXF1aXJlIHN0YXRlbWVudHNcbmNvbnN0IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXggPSBuZXcgUmVnRXhwKFxuICBgKD86ZnJvbVxcXFxzK1snXCJdKD86bm9kZTopPygoPzoke25vZGVCdWlsdGluc30pKD86L1teJ1wiXSopPylbJ1wiXWAgK1xuICAgIGB8cmVxdWlyZVxcXFxzKlxcXFwoXFxcXHMqWydcIl0oPzpub2RlOik/KCg/OiR7bm9kZUJ1aWx0aW5zfSkoPzovW14nXCJdKik/KVsnXCJdXFxcXHMqXFxcXCkpYCxcbiAgJ2cnXG4pO1xuXG4vLyBSZWdleCB0byBkZXRlY3QgY2xhc3MgcmVnaXN0cmF0aW9uIElJRkVzIGdlbmVyYXRlZCBieSB0aGUgU1dDIHBsdWdpblxuY29uc3QgcmVnaXN0cmF0aW9uSWlmZVJlZ2V4ID1cbiAgL1N5bWJvbFxcLmZvclxccypcXChcXHMqW1wiJ113b3JrZmxvdy1jbGFzcy1yZWdpc3RyeVtcIiddXFxzKlxcKS87XG5cbi8qKlxuICogUmVzdWx0IG9mIGNoZWNraW5nIGEgc2luZ2xlIGNsYXNzIGZvciBzZXJkZSBjb21wbGlhbmNlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlcmRlQ2xhc3NDaGVja1Jlc3VsdCB7XG4gIC8qKiBUaGUgY2xhc3MgbmFtZSBhcyBkZXRlY3RlZCBpbiB0aGUgc291cmNlICovXG4gIGNsYXNzTmFtZTogc3RyaW5nO1xuICAvKiogVGhlIGNsYXNzSWQgYXNzaWduZWQgYnkgdGhlIFNXQyBwbHVnaW4gKGZyb20gdGhlIG1hbmlmZXN0KSAqL1xuICBjbGFzc0lkOiBzdHJpbmc7XG4gIC8qKiBXaGV0aGVyIHRoZSBTV0MgcGx1Z2luIGRldGVjdGVkIHNlcmRlIHN5bWJvbHMgb24gdGhpcyBjbGFzcyAqL1xuICBkZXRlY3RlZDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgYSByZWdpc3RyYXRpb24gSUlGRSB3YXMgZ2VuZXJhdGVkIGluIHRoZSBvdXRwdXQgKi9cbiAgcmVnaXN0ZXJlZDogYm9vbGVhbjtcbiAgLyoqXG4gICAqIE5vZGUuanMgYnVpbHQtaW4gbW9kdWxlIGltcG9ydHMgcmVtYWluaW5nIGluIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dC5cbiAgICogSWYgbm9uLWVtcHR5LCB0aGUgY2xhc3MgaXMgTk9UIHdvcmtmbG93LXNhbmRib3ggY29tcGxpYW50LlxuICAgKi9cbiAgbm9kZUltcG9ydHM6IHN0cmluZ1tdO1xuICAvKiogV2hldGhlciB0aGUgY2xhc3MgcGFzc2VzIGFsbCBjb21wbGlhbmNlIGNoZWNrcyAqL1xuICBjb21wbGlhbnQ6IGJvb2xlYW47XG4gIC8qKiBIdW1hbi1yZWFkYWJsZSBkZXNjcmlwdGlvbnMgb2YgYW55IGlzc3VlcyBmb3VuZCAqL1xuICBpc3N1ZXM6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIEZ1bGwgcmVzdWx0IG9mIHNlcmRlIGNvbXBsaWFuY2UgYW5hbHlzaXMgZm9yIGEgc291cmNlIGZpbGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VyZGVDaGVja1Jlc3VsdCB7XG4gIC8qKiBQZXItY2xhc3MgYW5hbHlzaXMgcmVzdWx0cyAqL1xuICBjbGFzc2VzOiBTZXJkZUNsYXNzQ2hlY2tSZXN1bHRbXTtcbiAgLyoqIEFsbCBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHMgZm91bmQgaW4gdGhlIHdvcmtmbG93LW1vZGUgb3V0cHV0ICovXG4gIGdsb2JhbE5vZGVJbXBvcnRzOiBzdHJpbmdbXTtcbiAgLyoqIFdoZXRoZXIgdGhlIHdvcmtmbG93LW1vZGUgb3V0cHV0IGNvbnRhaW5zIGFueSBzZXJkZS1yZWxhdGVkIGNsYXNzZXMgKi9cbiAgaGFzU2VyZGVDbGFzc2VzOiBib29sZWFuO1xuICAvKiogVGhlIHJhdyB3b3JrZmxvdyBtYW5pZmVzdCBleHRyYWN0ZWQgZnJvbSB0aGUgU1dDIHRyYW5zZm9ybSAqL1xuICBtYW5pZmVzdDogV29ya2Zsb3dNYW5pZmVzdDtcbn1cblxuLyoqXG4gKiBMaWdodHdlaWdodCBzZXJkZSBjb21wbGlhbmNlIGNoZWNrZXIgdGhhdCB3b3JrcyB3aXRoIHByZS1jb21wdXRlZFxuICogU1dDIHRyYW5zZm9ybSByZXN1bHRzLiBUaGlzIGF2b2lkcyByZS1ydW5uaW5nIHRoZSBTV0MgdHJhbnNmb3JtXG4gKiB3aGVuIHRoZSBjYWxsZXIgYWxyZWFkeSBoYXMgdGhlIG91dHB1dHMgKGUuZy4sIHRoZSBwbGF5Z3JvdW5kIG9yIGJ1aWxkZXIpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5hbHl6ZVNlcmRlQ29tcGxpYW5jZShvcHRpb25zOiB7XG4gIC8qKiBTb3VyY2UgY29kZSAodXNlZCBmb3IgcGF0dGVybiBkZXRlY3Rpb24pICovXG4gIHNvdXJjZUNvZGU6IHN0cmluZztcbiAgLyoqIFdvcmtmbG93LW1vZGUgdHJhbnNmb3JtZWQgb3V0cHV0ICovXG4gIHdvcmtmbG93Q29kZTogc3RyaW5nO1xuICAvKiogTWFuaWZlc3QgZXh0cmFjdGVkIGZyb20gdGhlIFNXQyB0cmFuc2Zvcm0gKi9cbiAgbWFuaWZlc3Q6IFdvcmtmbG93TWFuaWZlc3Q7XG59KTogU2VyZGVDaGVja1Jlc3VsdCB7XG4gIGNvbnN0IHsgc291cmNlQ29kZSwgd29ya2Zsb3dDb2RlLCBtYW5pZmVzdCB9ID0gb3B0aW9ucztcblxuICAvLyAxLiBFeHRyYWN0IGFsbCBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHMgZnJvbSB0aGUgd29ya2Zsb3cgb3V0cHV0XG4gIGNvbnN0IGdsb2JhbE5vZGVJbXBvcnRzID0gZXh0cmFjdE5vZGVJbXBvcnRzKHdvcmtmbG93Q29kZSk7XG5cbiAgLy8gMi4gQ2hlY2sgaWYgdGhlIG1hbmlmZXN0IGNvbnRhaW5zIGFueSBzZXJkZS1yZWdpc3RlcmVkIGNsYXNzZXNcbiAgY29uc3QgY2xhc3NFbnRyaWVzID0gZXh0cmFjdENsYXNzRW50cmllcyhtYW5pZmVzdCk7XG4gIGNvbnN0IGhhc1NlcmRlQ2xhc3NlcyA9IGNsYXNzRW50cmllcy5sZW5ndGggPiAwO1xuXG4gIC8vIDMuIENoZWNrIGlmIHRoZSB3b3JrZmxvdyBvdXRwdXQgY29udGFpbnMgcmVnaXN0cmF0aW9uIElJRkVzXG4gIGNvbnN0IGhhc1JlZ2lzdHJhdGlvbiA9IHJlZ2lzdHJhdGlvbklpZmVSZWdleC50ZXN0KHdvcmtmbG93Q29kZSk7XG5cbiAgLy8gNC4gQW5hbHl6ZSBlYWNoIGNsYXNzXG4gIGNvbnN0IGNsYXNzZXM6IFNlcmRlQ2xhc3NDaGVja1Jlc3VsdFtdID0gY2xhc3NFbnRyaWVzLm1hcCgoZW50cnkpID0+IHtcbiAgICBjb25zdCBpc3N1ZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyBDaGVjayBmb3IgTm9kZS5qcyBpbXBvcnRzICh0aGVzZSB3aWxsIGZhaWwgaW4gdGhlIHdvcmtmbG93IHNhbmRib3gpXG4gICAgaWYgKGdsb2JhbE5vZGVJbXBvcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlzc3Vlcy5wdXNoKFxuICAgICAgICBgV29ya2Zsb3cgYnVuZGxlIGNvbnRhaW5zIE5vZGUuanMgYnVpbHQtaW4gaW1wb3J0czogJHtnbG9iYWxOb2RlSW1wb3J0cy5qb2luKCcsICcpfS4gYCArXG4gICAgICAgICAgYFRoZXNlIHdpbGwgZmFpbCBhdCBydW50aW1lIGluIHRoZSB3b3JrZmxvdyBzYW5kYm94LiBgICtcbiAgICAgICAgICBgQWRkIFwidXNlIHN0ZXBcIiB0byBtZXRob2RzIHRoYXQgZGVwZW5kIG9uIE5vZGUuanMgQVBJcyBzbyB0aGV5IGFyZSBzdHJpcHBlZCBmcm9tIHRoZSB3b3JrZmxvdyBidW5kbGUuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgcmVnaXN0cmF0aW9uXG4gICAgaWYgKCFoYXNSZWdpc3RyYXRpb24pIHtcbiAgICAgIGlzc3Vlcy5wdXNoKFxuICAgICAgICBgTm8gY2xhc3MgcmVnaXN0cmF0aW9uIElJRkUgd2FzIGdlbmVyYXRlZC4gYCArXG4gICAgICAgICAgYEVuc3VyZSBXT1JLRkxPV19TRVJJQUxJWkUgYW5kIFdPUktGTE9XX0RFU0VSSUFMSVpFIGFyZSBkZWZpbmVkIGFzIHN0YXRpYyBtZXRob2RzIGAgK1xuICAgICAgICAgIGBpbnNpZGUgdGhlIGNsYXNzIGJvZHkgdXNpbmcgY29tcHV0ZWQgcHJvcGVydHkgc3ludGF4OiBzdGF0aWMgW1dPUktGTE9XX1NFUklBTElaRV0oLi4uKSB7IC4uLiB9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2xhc3NOYW1lOiBlbnRyeS5jbGFzc05hbWUsXG4gICAgICBjbGFzc0lkOiBlbnRyeS5jbGFzc0lkLFxuICAgICAgZGV0ZWN0ZWQ6IHRydWUsXG4gICAgICByZWdpc3RlcmVkOiBoYXNSZWdpc3RyYXRpb24sXG4gICAgICBub2RlSW1wb3J0czogZ2xvYmFsTm9kZUltcG9ydHMsXG4gICAgICBjb21wbGlhbnQ6IGdsb2JhbE5vZGVJbXBvcnRzLmxlbmd0aCA9PT0gMCAmJiBoYXNSZWdpc3RyYXRpb24sXG4gICAgICBpc3N1ZXMsXG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gNS4gQ2hlY2sgZm9yIGNsYXNzZXMgdGhhdCBoYXZlIHNlcmRlIHBhdHRlcm5zIGluIHNvdXJjZSBidXQgd2VyZW4ndCBkZXRlY3RlZCBieSBTV0NcbiAgY29uc3Qgc291cmNlSGFzU2VyZGVQYXR0ZXJucyA9XG4gICAgL1xcW1xccypXT1JLRkxPV18oPzpTRVJJQUxJWkV8REVTRVJJQUxJWkUpXFxzKlxcXS8udGVzdChzb3VyY2VDb2RlKSB8fFxuICAgIC9TeW1ib2xcXC5mb3JcXHMqXFwoXFxzKlsnXCJdd29ya2Zsb3ctKD86c2VyaWFsaXplfGRlc2VyaWFsaXplKVsnXCJdXFxzKlxcKS8udGVzdChcbiAgICAgIHNvdXJjZUNvZGVcbiAgICApO1xuXG4gIGlmIChzb3VyY2VIYXNTZXJkZVBhdHRlcm5zICYmIGNsYXNzRW50cmllcy5sZW5ndGggPT09IDApIHtcbiAgICBjbGFzc2VzLnB1c2goe1xuICAgICAgY2xhc3NOYW1lOiAnPHVua25vd24+JyxcbiAgICAgIGNsYXNzSWQ6ICcnLFxuICAgICAgZGV0ZWN0ZWQ6IGZhbHNlLFxuICAgICAgcmVnaXN0ZXJlZDogZmFsc2UsXG4gICAgICBub2RlSW1wb3J0czogZ2xvYmFsTm9kZUltcG9ydHMsXG4gICAgICBjb21wbGlhbnQ6IGZhbHNlLFxuICAgICAgaXNzdWVzOiBbXG4gICAgICAgIGBTb3VyY2UgY29kZSBjb250YWlucyBXT1JLRkxPV19TRVJJQUxJWkUvV09SS0ZMT1dfREVTRVJJQUxJWkUgcGF0dGVybnMgYnV0IGAgK1xuICAgICAgICAgIGB0aGUgU1dDIHBsdWdpbiBkaWQgbm90IGRldGVjdCBhbnkgc2VyZGUtZW5hYmxlZCBjbGFzc2VzLiBgICtcbiAgICAgICAgICBgRW5zdXJlIHRoZSBzeW1ib2xzIGFyZSBkZWZpbmVkIGFzIHN0YXRpYyBtZXRob2RzIElOU0lERSB0aGUgY2xhc3MgYm9keSwgYCArXG4gICAgICAgICAgYG5vdCBhc3NpZ25lZCBleHRlcm5hbGx5IChlLmcuLCAoTXlDbGFzcyBhcyBhbnkpW1dPUktGTE9XX1NFUklBTElaRV0gPSAuLi4pLmAsXG4gICAgICBdLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjbGFzc2VzLFxuICAgIGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgIGhhc1NlcmRlQ2xhc3NlcyxcbiAgICBtYW5pZmVzdCxcbiAgfTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IE5vZGUuanMgYnVpbHQtaW4gbW9kdWxlIG5hbWVzIGZyb20gdHJhbnNmb3JtZWQgY29kZS5cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdE5vZGVJbXBvcnRzKGNvZGU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgaW1wb3J0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAvLyBSZXNldCByZWdleCBzdGF0ZVxuICBub2RlSW1wb3J0RXh0cmFjdFJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gIGZvciAoXG4gICAgbGV0IG1hdGNoID0gbm9kZUltcG9ydEV4dHJhY3RSZWdleC5leGVjKGNvZGUpO1xuICAgIG1hdGNoICE9PSBudWxsO1xuICAgIG1hdGNoID0gbm9kZUltcG9ydEV4dHJhY3RSZWdleC5leGVjKGNvZGUpXG4gICkge1xuICAgIC8vIG1hdGNoWzFdIGlzIGZyb20gdGhlIEVTTSBwYXR0ZXJuLCBtYXRjaFsyXSBpcyBmcm9tIHRoZSBDSlMgcGF0dGVyblxuICAgIGNvbnN0IG1vZHVsZU5hbWUgPSBtYXRjaFsxXSB8fCBtYXRjaFsyXTtcbiAgICBpZiAobW9kdWxlTmFtZSkge1xuICAgICAgLy8gTm9ybWFsaXplIHRvIGJhc2UgbW9kdWxlIG5hbWUgKGUuZy4sICdmcy9wcm9taXNlcycgLT4gJ2ZzJylcbiAgICAgIGltcG9ydHMuYWRkKG1vZHVsZU5hbWUuc3BsaXQoJy8nKVswXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBbLi4uaW1wb3J0c10uc29ydCgpO1xufVxuXG4vKipcbiAqIEV4dHJhY3QgY2xhc3MgZW50cmllcyBmcm9tIGEgV29ya2Zsb3dNYW5pZmVzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RDbGFzc0VudHJpZXMoXG4gIG1hbmlmZXN0OiBXb3JrZmxvd01hbmlmZXN0XG4pOiBBcnJheTx7IGNsYXNzTmFtZTogc3RyaW5nOyBjbGFzc0lkOiBzdHJpbmc7IGZpbGVOYW1lOiBzdHJpbmcgfT4ge1xuICBjb25zdCBlbnRyaWVzOiBBcnJheTx7XG4gICAgY2xhc3NOYW1lOiBzdHJpbmc7XG4gICAgY2xhc3NJZDogc3RyaW5nO1xuICAgIGZpbGVOYW1lOiBzdHJpbmc7XG4gIH0+ID0gW107XG4gIGlmICghbWFuaWZlc3QuY2xhc3NlcykgcmV0dXJuIGVudHJpZXM7XG5cbiAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNsYXNzZXNdIG9mIE9iamVjdC5lbnRyaWVzKG1hbmlmZXN0LmNsYXNzZXMpKSB7XG4gICAgZm9yIChjb25zdCBbY2xhc3NOYW1lLCB7IGNsYXNzSWQgfV0gb2YgT2JqZWN0LmVudHJpZXMoY2xhc3NlcykpIHtcbiAgICAgIGVudHJpZXMucHVzaCh7IGNsYXNzTmFtZSwgY2xhc3NJZCwgZmlsZU5hbWUgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBlbnRyaWVzO1xufVxuIiwgImltcG9ydCB7XG4gIENvcnJ1cHRlZEV2ZW50TG9nRXJyb3IsXG4gIEVudGl0eUNvbmZsaWN0RXJyb3IsXG4gIFByZWNvbmRpdGlvbkZhaWxlZEVycm9yLFxuICBSZXBsYXlEaXZlcmdlbmNlRXJyb3IsXG4gIFJVTl9FUlJPUl9DT0RFUyxcbiAgUnVuRXhwaXJlZEVycm9yLFxuICBXb3JrZmxvd1J1bnRpbWVFcnJvcixcbn0gZnJvbSAnQHdvcmtmbG93L2Vycm9ycyc7XG5pbXBvcnQgeyBzZXRXb3JrZmxvd0Jhc2VQYXRoIH0gZnJvbSAnQHdvcmtmbG93L3V0aWxzJztcbmltcG9ydCB7IHBhcnNlV29ya2Zsb3dOYW1lIH0gZnJvbSAnQHdvcmtmbG93L3V0aWxzL3BhcnNlLW5hbWUnO1xuaW1wb3J0IHtcbiAgdHlwZSBFdmVudCxcbiAgZ2V0UXVldWVUb3BpY1ByZWZpeCxcbiAgcmVzb2x2ZVF1ZXVlTmFtZXNwYWNlLFxuICBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgU1BFQ19WRVJTSU9OX0xFR0FDWSxcbiAgV29ya2Zsb3dJbnZva2VQYXlsb2FkU2NoZW1hLFxuICB0eXBlIFdvcmtmbG93UnVuLFxufSBmcm9tICdAd29ya2Zsb3cvd29ybGQnO1xuaW1wb3J0IHtcbiAgY2xhc3NpZnlSdW5FcnJvcixcbiAgaXNSZXRyeWFibGVXb3JsZEVycm9yLFxuICBpc1dvcmxkQ29udHJhY3RFcnJvcixcbn0gZnJvbSAnLi9jbGFzc2lmeS1lcnJvci5qcyc7XG5pbXBvcnQgeyBpbXBvcnRLZXkgfSBmcm9tICcuL2VuY3J5cHRpb24uanMnO1xuaW1wb3J0IHsgV29ya2Zsb3dTdXNwZW5zaW9uIH0gZnJvbSAnLi9nbG9iYWwuanMnO1xuaW1wb3J0IHsgcnVudGltZUxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyLmpzJztcbmltcG9ydCB7XG4gIE1BWF9RVUVVRV9ERUxJVkVSSUVTLFxuICBSRVBMQVlfRElWRVJHRU5DRV9NQVhfUkVUUklFUyxcbiAgUkVQTEFZX1RJTUVPVVRfTUFYX1JFVFJJRVMsXG4gIFJFUExBWV9USU1FT1VUX01TLFxufSBmcm9tICcuL3J1bnRpbWUvY29uc3RhbnRzLmpzJztcbmltcG9ydCB7XG4gIGdldFF1ZXVlT3ZlcmhlYWQsXG4gIGdldFdvcmtmbG93UXVldWVOYW1lLFxuICBnZXRXb3JrZmxvd1J1bkV2ZW50cyxcbiAgaGFuZGxlSGVhbHRoQ2hlY2tNZXNzYWdlLFxuICB0eXBlIE11dGFibGVFdmVudExvZyxcbiAgcGFyc2VIZWFsdGhDaGVja1BheWxvYWQsXG4gIHF1ZXVlTWVzc2FnZSxcbiAgc3RhdGVVcGRhdGVkQXRGb3JDcmVhdGUsXG4gIHdpdGhIZWFsdGhDaGVjayxcbiAgd2l0aFByZWNvbmRpdGlvblJldHJ5LFxufSBmcm9tICcuL3J1bnRpbWUvaGVscGVycy5qcyc7XG5pbXBvcnQgeyBoYW5kbGVTdXNwZW5zaW9uIH0gZnJvbSAnLi9ydW50aW1lL3N1c3BlbnNpb24taGFuZGxlci5qcyc7XG5pbXBvcnQgeyBnZXRXb3JsZCwgZ2V0V29ybGRIYW5kbGVycyB9IGZyb20gJy4vcnVudGltZS93b3JsZC5qcyc7XG5pbXBvcnQgeyByZW1hcEVycm9yU3RhY2sgfSBmcm9tICcuL3NvdXJjZS1tYXAuanMnO1xuaW1wb3J0ICogYXMgQXR0cmlidXRlIGZyb20gJy4vdGVsZW1ldHJ5L3NlbWFudGljLWNvbnZlbnRpb25zLmpzJztcbmltcG9ydCB7XG4gIGxpbmtUb0N1cnJlbnRDb250ZXh0LFxuICB0cmFjZSxcbiAgd2l0aFRyYWNlQ29udGV4dCxcbiAgd2l0aFdvcmtmbG93QmFnZ2FnZSxcbn0gZnJvbSAnLi90ZWxlbWV0cnkuanMnO1xuaW1wb3J0IHsgZ2V0RXJyb3JOYW1lLCBnZXRFcnJvclN0YWNrLCBub3JtYWxpemVVbmtub3duRXJyb3IgfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGJ1aWxkV29ya2Zsb3dTdXNwZW5zaW9uTWVzc2FnZSB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBydW5Xb3JrZmxvdyB9IGZyb20gJy4vd29ya2Zsb3cuanMnO1xuXG5leHBvcnQgdHlwZSB7IEV2ZW50LCBXb3JrZmxvd1J1biB9O1xuZXhwb3J0IHsgV29ya2Zsb3dTdXNwZW5zaW9uIH0gZnJvbSAnLi9nbG9iYWwuanMnO1xuZXhwb3J0IHtcbiAgdHlwZSBIZWFsdGhDaGVja0VuZHBvaW50LFxuICB0eXBlIEhlYWx0aENoZWNrT3B0aW9ucyxcbiAgdHlwZSBIZWFsdGhDaGVja1Jlc3VsdCxcbiAgaGVhbHRoQ2hlY2ssXG59IGZyb20gJy4vcnVudGltZS9oZWxwZXJzLmpzJztcbmV4cG9ydCB7XG4gIGdldEhvb2tCeVRva2VuLFxuICByZXN1bWVIb29rLFxuICByZXN1bWVXZWJob29rLFxufSBmcm9tICcuL3J1bnRpbWUvcmVzdW1lLWhvb2suanMnO1xuZXhwb3J0IHtcbiAgZ2V0UnVuLFxuICBSdW4sXG4gIHR5cGUgV29ya2Zsb3dSZWFkYWJsZVN0cmVhbSxcbiAgdHlwZSBXb3JrZmxvd1JlYWRhYmxlU3RyZWFtT3B0aW9ucyxcbn0gZnJvbSAnLi9ydW50aW1lL3J1bi5qcyc7XG5leHBvcnQge1xuICBjYW5jZWxSdW4sXG4gIGxpc3RTdHJlYW1zLFxuICB0eXBlIFJlYWRTdHJlYW1PcHRpb25zLFxuICB0eXBlIFJlY3JlYXRlUnVuT3B0aW9ucyxcbiAgcmVhZFN0cmVhbSxcbiAgcmVjcmVhdGVSdW5Gcm9tRXhpc3RpbmcsXG4gIHJlZW5xdWV1ZVJ1bixcbiAgdHlwZSBTdG9wU2xlZXBPcHRpb25zLFxuICB0eXBlIFN0b3BTbGVlcFJlc3VsdCxcbiAgd2FrZVVwUnVuLFxufSBmcm9tICcuL3J1bnRpbWUvcnVucy5qcyc7XG5leHBvcnQge1xuICB0eXBlIFN0YXJ0T3B0aW9ucyxcbiAgdHlwZSBTdGFydE9wdGlvbnNCYXNlLFxuICB0eXBlIFN0YXJ0T3B0aW9uc1dpdGhEZXBsb3ltZW50SWQsXG4gIHR5cGUgU3RhcnRPcHRpb25zV2l0aG91dERlcGxveW1lbnRJZCxcbiAgc3RhcnQsXG59IGZyb20gJy4vcnVudGltZS9zdGFydC5qcyc7XG5leHBvcnQgeyBzdGVwRW50cnlwb2ludCB9IGZyb20gJy4vcnVudGltZS9zdGVwLWhhbmRsZXIuanMnO1xuZXhwb3J0IHtcbiAgY3JlYXRlV29ybGQsXG4gIGdldFdvcmxkLFxuICBnZXRXb3JsZEhhbmRsZXJzLFxuICBzZXRXb3JsZCxcbn0gZnJvbSAnLi9ydW50aW1lL3dvcmxkLmpzJztcblxuZnVuY3Rpb24gaGFzUmVjb3JkZWRUZXJtaW5hbFJ1bkV2ZW50KGV2ZW50czogRXZlbnRbXSwgcnVuSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCB0ZXJtaW5hbEV2ZW50ID0gZXZlbnRzLmZpbmQoXG4gICAgKGV2ZW50KSA9PlxuICAgICAgZXZlbnQucnVuSWQgPT09IHJ1bklkICYmXG4gICAgICAoZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX2NvbXBsZXRlZCcgfHxcbiAgICAgICAgZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX2ZhaWxlZCcgfHxcbiAgICAgICAgZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX2NhbmNlbGxlZCcpXG4gICk7XG5cbiAgaWYgKCF0ZXJtaW5hbEV2ZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICdXb3JrZmxvdyBldmVudCBsb2cgYWxyZWFkeSBjb250YWlucyBhIHRlcm1pbmFsIHJ1biBldmVudCwgc2tpcHBpbmcgcmVwbGF5JyxcbiAgICB7XG4gICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgIGV2ZW50VHlwZTogdGVybWluYWxFdmVudC5ldmVudFR5cGUsXG4gICAgICBldmVudElkOiB0ZXJtaW5hbEV2ZW50LmV2ZW50SWQsXG4gICAgfVxuICApO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYSBzaW5nbGUgcm91dGUgd2hpY2ggaGFuZGxlcyBhbnkgd29ya2Zsb3cgZXhlY3V0aW9uXG4gKiByZXF1ZXN0IGFuZCByb3V0ZXMgdG8gdGhlIGFwcHJvcHJpYXRlIHdvcmtmbG93IGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB3b3JrZmxvd0NvZGUgLSBUaGUgd29ya2Zsb3cgYnVuZGxlIGNvZGUgY29udGFpbmluZyBhbGwgdGhlIHdvcmtmbG93XG4gKiBmdW5jdGlvbnMgYXQgdGhlIHRvcCBsZXZlbC5cbiAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCBhcyBhIFZlcmNlbCBBUEkgcm91dGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZmxvd0VudHJ5cG9pbnQoXG4gIHdvcmtmbG93Q29kZTogc3RyaW5nLFxuICBvcHRpb25zPzogeyBuYW1lc3BhY2U/OiBzdHJpbmc7IGJhc2VQYXRoPzogc3RyaW5nIH1cbik6IChyZXE6IFJlcXVlc3QpID0+IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgc2V0V29ya2Zsb3dCYXNlUGF0aChvcHRpb25zPy5iYXNlUGF0aCk7XG5cbiAgY29uc3QgbmFtZXNwYWNlID0gcmVzb2x2ZVF1ZXVlTmFtZXNwYWNlKG9wdGlvbnM/Lm5hbWVzcGFjZSk7XG4gIGNvbnN0IHdvcmtmbG93UHJlZml4ID0gZ2V0UXVldWVUb3BpY1ByZWZpeCgnd29ya2Zsb3cnLCBuYW1lc3BhY2UpO1xuXG4gIGNvbnN0IHsgY3JlYXRlUXVldWVIYW5kbGVyLCBzcGVjVmVyc2lvbjogd29ybGRTcGVjVmVyc2lvbiB9ID1cbiAgICBnZXRXb3JsZEhhbmRsZXJzKCk7XG4gIGNvbnN0IGhhbmRsZXIgPSBjcmVhdGVRdWV1ZUhhbmRsZXIoXG4gICAgd29ya2Zsb3dQcmVmaXgsXG4gICAgYXN5bmMgKG1lc3NhZ2VfLCBtZXRhZGF0YSkgPT4ge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIGhlYWx0aCBjaGVjayBtZXNzYWdlXG4gICAgICAvLyBOT1RFOiBIZWFsdGggY2hlY2sgbWVzc2FnZXMgYXJlIGludGVudGlvbmFsbHkgdW5hdXRoZW50aWNhdGVkIGZvciBtb25pdG9yaW5nIHB1cnBvc2VzLlxuICAgICAgLy8gVGhleSBvbmx5IHdyaXRlIGEgc2ltcGxlIHN0YXR1cyByZXNwb25zZSB0byBhIHN0cmVhbSBhbmQgZG8gbm90IGV4cG9zZSBzZW5zaXRpdmUgZGF0YS5cbiAgICAgIC8vIFRoZSBzdHJlYW0gbmFtZSBpbmNsdWRlcyBhIHVuaXF1ZSBjb3JyZWxhdGlvbklkIHRoYXQgbXVzdCBiZSBrbm93biBieSB0aGUgY2FsbGVyLlxuICAgICAgY29uc3QgaGVhbHRoQ2hlY2sgPSBwYXJzZUhlYWx0aENoZWNrUGF5bG9hZChtZXNzYWdlXyk7XG4gICAgICBpZiAoaGVhbHRoQ2hlY2spIHtcbiAgICAgICAgYXdhaXQgaGFuZGxlSGVhbHRoQ2hlY2tNZXNzYWdlKFxuICAgICAgICAgIGhlYWx0aENoZWNrLFxuICAgICAgICAgICd3b3JrZmxvdycsXG4gICAgICAgICAgd29ybGRTcGVjVmVyc2lvblxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcnVuSWQsXG4gICAgICAgIHRyYWNlQ2FycmllcjogdHJhY2VDb250ZXh0LFxuICAgICAgICByZXF1ZXN0ZWRBdCxcbiAgICAgICAgcmVwbGF5RGl2ZXJnZW5jZSxcbiAgICAgICAgcnVuSW5wdXQsXG4gICAgICB9ID0gV29ya2Zsb3dJbnZva2VQYXlsb2FkU2NoZW1hLnBhcnNlKG1lc3NhZ2VfKTtcbiAgICAgIGNvbnN0IHsgcmVxdWVzdElkIH0gPSBtZXRhZGF0YTtcbiAgICAgIC8vIEV4dHJhY3QgdGhlIHdvcmtmbG93IG5hbWUgZnJvbSB0aGUgdG9waWMgbmFtZVxuICAgICAgY29uc3Qgd29ya2Zsb3dOYW1lID0gbWV0YWRhdGEucXVldWVOYW1lLnNsaWNlKHdvcmtmbG93UHJlZml4Lmxlbmd0aCk7XG5cbiAgICAgIC8vIC0tLSBNYXggZGVsaXZlcnkgY2hlY2sgLS0tXG4gICAgICAvLyBFbmZvcmNlIG1heCBkZWxpdmVyeSBsaW1pdCBiZWZvcmUgYW55IGluZnJhc3RydWN0dXJlIGNhbGxzLlxuICAgICAgLy8gVGhpcyBwcmV2ZW50cyBydW5hd2F5IHdvcmtmbG93cyBmcm9tIGNvbnN1bWluZyBpbmZpbml0ZSBxdWV1ZSBkZWxpdmVyaWVzLlxuICAgICAgLy8gQXQgdGhpcyBwb2ludCwgd2Ugd2FudCB0byBkbyB0aGUgbWluaW1hbCBhbW91bnQgb2Ygd29yayAobm8gZmV0Y2hpbmdcbiAgICAgIC8vIG9mIHRoZSB3b3JrZmxvdyBldmVudHMsIGV0Yy4gV2Ugc2ltcGx5IGF0dGVtcHQgdG8gbWFyayB0aGUgcnVuIGFzIGZhaWxlZFxuICAgICAgLy8gYW5kIGlmIHRoYXQgZmFpbHMsIHRoZSBtZXNzYWdlIGlzIHN0aWxsIGNvbnN1bWVkIGJ1dCB3aXRoIGFkZXF1YXRlIGxvZ2dpbmdcbiAgICAgIC8vIHRoYXQgYW4gZXJyb3Igb2NjdXJyZWQgcHJldmVudGluZyB1cyBmcm9tIGZhaWxpbmcgdGhlIHJ1bi5cbiAgICAgIGlmIChtZXRhZGF0YS5hdHRlbXB0ID4gTUFYX1FVRVVFX0RFTElWRVJJRVMpIHtcbiAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICBgV29ya2Zsb3cgaGFuZGxlciBleGNlZWRlZCBtYXggZGVsaXZlcmllcyAoJHttZXRhZGF0YS5hdHRlbXB0fS8ke01BWF9RVUVVRV9ERUxJVkVSSUVTfSlgLFxuICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQsIHdvcmtmbG93TmFtZSwgYXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCB9XG4gICAgICAgICk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgd29ybGQgPSBnZXRXb3JsZCgpO1xuICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2ZhaWxlZCcsXG4gICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBXb3JrZmxvdyBleGNlZWRlZCBtYXhpbXVtIHF1ZXVlIGRlbGl2ZXJpZXMgKCR7bWV0YWRhdGEuYXR0ZW1wdH0vJHtNQVhfUVVFVUVfREVMSVZFUklFU30pYCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLk1BWF9ERUxJVkVSSUVTX0VYQ0VFREVELFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBpZiAoRW50aXR5Q29uZmxpY3RFcnJvci5pcyhlcnIpIHx8IFJ1bkV4cGlyZWRFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAvLyBSdW4gYWxyZWFkeSBmaW5pc2hlZCwgY29uc3VtZSB0aGUgbWVzc2FnZSBzaWxlbnRseVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgYEZhaWxlZCB0byBtYXJrIHJ1biBhcyBmYWlsZWQgYWZ0ZXIgJHttZXRhZGF0YS5hdHRlbXB0fSBkZWxpdmVyeSBhdHRlbXB0cy4gYCArXG4gICAgICAgICAgICAgIGBBIHBlcnNpc3RlbnQgZXJyb3IgaXMgcHJldmVudGluZyB0aGUgcnVuIGZyb20gYmVpbmcgdGVybWluYXRlZC4gYCArXG4gICAgICAgICAgICAgIGBUaGUgcnVuIHdpbGwgcmVtYWluIGluIGl0cyBjdXJyZW50IHN0YXRlIHVudGlsIG1hbnVhbGx5IHJlc29sdmVkLiBgICtcbiAgICAgICAgICAgICAgYFRoaXMgaXMgbW9zdCBsaWtlbHkgZHVlIHRvIGEgcGVyc2lzdGVudCBvdXRhZ2Ugb2YgdGhlIHdvcmtmbG93IGJhY2tlbmQgYCArXG4gICAgICAgICAgICAgIGBvciBhIGJ1ZyBpbiB0aGUgd29ya2Zsb3cgcnVudGltZSBhbmQgc2hvdWxkIGJlIHJlcG9ydGVkIHRvIHRoZSBXb3JrZmxvdyB0ZWFtLmAsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICBlcnJvcjogZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpLFxuICAgICAgICAgICAgICBhdHRlbXB0OiBtZXRhZGF0YS5hdHRlbXB0LFxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzcGFuTGlua3MgPSBhd2FpdCBsaW5rVG9DdXJyZW50Q29udGV4dCgpO1xuXG4gICAgICAvLyAtLS0gUmVwbGF5IHRpbWVvdXQgZ3VhcmQgLS0tXG4gICAgICAvLyBJZiB0aGUgcmVwbGF5IHRha2VzIGxvbmdlciB0aGFuIHRoZSB0aW1lb3V0LCBmYWlsIHRoZSBydW4gYW5kIGV4aXQuXG4gICAgICAvLyBUaGlzIG11c3QgYmUgbG93ZXIgdGhhbiB0aGUgZnVuY3Rpb24ncyBtYXhEdXJhdGlvbiB0byBlbnN1cmVcbiAgICAgIC8vIHRoZSBmYWlsdXJlIGlzIHJlY29yZGVkIGJlZm9yZSB0aGUgcGxhdGZvcm0ga2lsbHMgdGhlIGZ1bmN0aW9uLlxuICAgICAgbGV0IHJlcGxheVRpbWVvdXQ6IE5vZGVKUy5UaW1lb3V0IHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKHByb2Nlc3MuZW52LlZFUkNFTF9VUkwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXBsYXlUaW1lb3V0ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcignV29ya2Zsb3cgcmVwbGF5IGV4Y2VlZGVkIHRpbWVvdXQnLCB7XG4gICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgIHRpbWVvdXRNczogUkVQTEFZX1RJTUVPVVRfTVMsXG4gICAgICAgICAgICBhdHRlbXB0OiBtZXRhZGF0YS5hdHRlbXB0LFxuICAgICAgICAgICAgbWF4UmV0cmllczogUkVQTEFZX1RJTUVPVVRfTUFYX1JFVFJJRVMsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBBbGxvdyBhIGZldyByZXRyaWVzIGJlZm9yZSBwZXJtYW5lbnRseSBmYWlsaW5nIHRoZSBydW4uXG4gICAgICAgICAgLy8gT24gZWFybHkgYXR0ZW1wdHMsIGp1c3QgZXhpdCBzbyB0aGUgcXVldWUgcmV0cmllcyB0aGUgbWVzc2FnZS5cbiAgICAgICAgICBpZiAobWV0YWRhdGEuYXR0ZW1wdCA8PSBSRVBMQVlfVElNRU9VVF9NQVhfUkVUUklFUykge1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB3b3JsZCA9IGF3YWl0IGdldFdvcmxkKCk7XG4gICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBXb3JrZmxvdyByZXBsYXkgZXhjZWVkZWQgbWF4aW11bSBkdXJhdGlvbiAoJHtSRVBMQVlfVElNRU9VVF9NUyAvIDEwMDB9cykgYWZ0ZXIgJHttZXRhZGF0YS5hdHRlbXB0fSBhdHRlbXB0c2AsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuUkVQTEFZX1RJTUVPVVQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIEJlc3QgZWZmb3J0IOKAlCBwcm9jZXNzIGV4aXRzIHJlZ2FyZGxlc3NcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgYWxzbyBwcmV2ZW50cyB0aGUgcnVudGltZSBmcm9tIGFja2luZyB0aGUgcXVldWUgbWVzc2FnZSxcbiAgICAgICAgICAvLyBzbyB0aGUgcXVldWUgd2lsbCBjYWxsIGJhY2sgb25jZSwgYWZ0ZXIgd2hpY2ggYSA0MTAgd2lsbCBnZXQgaXQgdG8gZXhpdCBlYXJseS5cbiAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH0sIFJFUExBWV9USU1FT1VUX01TKTtcbiAgICAgICAgcmVwbGF5VGltZW91dC51bnJlZigpO1xuICAgICAgfVxuXG4gICAgICAvLyBJbnZva2UgdXNlciB3b3JrZmxvdyB3aXRoaW4gdGhlIHByb3BhZ2F0ZWQgdHJhY2UgY29udGV4dCBhbmQgYmFnZ2FnZVxuICAgICAgcmV0dXJuIGF3YWl0IHdpdGhUcmFjZUNvbnRleHQodHJhY2VDb250ZXh0LCBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIFNldCB3b3JrZmxvdyBjb250ZXh0IGFzIGJhZ2dhZ2UgZm9yIGF1dG9tYXRpYyBwcm9wYWdhdGlvblxuICAgICAgICByZXR1cm4gYXdhaXQgd2l0aFdvcmtmbG93QmFnZ2FnZShcbiAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkLCB3b3JrZmxvd05hbWUgfSxcbiAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB3b3JsZCA9IGdldFdvcmxkKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJhY2UoXG4gICAgICAgICAgICAgIGBXT1JLRkxPVyAke3dvcmtmbG93TmFtZX1gLFxuICAgICAgICAgICAgICB7IGxpbmtzOiBzcGFuTGlua3MgfSxcbiAgICAgICAgICAgICAgYXN5bmMgKHNwYW4pID0+IHtcbiAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd05hbWUod29ya2Zsb3dOYW1lKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd09wZXJhdGlvbignZXhlY3V0ZScpLFxuICAgICAgICAgICAgICAgICAgLy8gU3RhbmRhcmQgT1RFTCBtZXNzYWdpbmcgY29udmVudGlvbnNcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5NZXNzYWdpbmdTeXN0ZW0oJ3ZlcmNlbC1xdWV1ZScpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLk1lc3NhZ2luZ0Rlc3RpbmF0aW9uTmFtZShtZXRhZGF0YS5xdWV1ZU5hbWUpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLk1lc3NhZ2luZ01lc3NhZ2VJZChtZXRhZGF0YS5tZXNzYWdlSWQpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLk1lc3NhZ2luZ09wZXJhdGlvblR5cGUoJ3Byb2Nlc3MnKSxcbiAgICAgICAgICAgICAgICAgIC4uLmdldFF1ZXVlT3ZlcmhlYWQoeyByZXF1ZXN0ZWRBdCB9KSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIFRPRE86IHZhbGlkYXRlIGB3b3JrZmxvd05hbWVgIGV4aXN0cyBiZWZvcmUgY29uc3VtaW5nIG1lc3NhZ2U/XG5cbiAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1bklkKHJ1bklkKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1RyYWNlUHJvcGFnYXRlZCghIXRyYWNlQ29udGV4dCksXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgd29ya2Zsb3dTdGFydGVkQXQgPSAtMTtcbiAgICAgICAgICAgICAgICBsZXQgd29ya2Zsb3dSdW46IFdvcmtmbG93UnVuIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIC8vIFByZS1sb2FkZWQgZXZlbnRzIGZyb20gdGhlIHJ1bl9zdGFydGVkIHJlc3BvbnNlLlxuICAgICAgICAgICAgICAgIC8vIFdoZW4gcHJlc2VudCwgd2Ugc2tpcCB0aGUgZXZlbnRzLmxpc3QgY2FsbC5cbiAgICAgICAgICAgICAgICBsZXQgcHJlbG9hZGVkRXZlbnRzOiBFdmVudFtdIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGxldCBwcmVsb2FkZWRFdmVudHNDdXJzb3I6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAvLyAtLS0gSW5mcmFzdHJ1Y3R1cmU6IHByZXBhcmUgdGhlIHJ1biBzdGF0ZSAtLS1cbiAgICAgICAgICAgICAgICAvLyBBbHdheXMgY2FsbCBydW5fc3RhcnRlZCBkaXJlY3RseSDigJQgdGhpcyBib3RoIHRyYW5zaXRpb25zXG4gICAgICAgICAgICAgICAgLy8gdGhlIHJ1biB0byAncnVubmluZycgQU5EIHJldHVybnMgdGhlIHJ1biBlbnRpdHksIHNhdmluZ1xuICAgICAgICAgICAgICAgIC8vIGEgc2VwYXJhdGUgcnVucy5nZXQgcm91bmQtdHJpcC5cbiAgICAgICAgICAgICAgICAvLyBDb250cmFjdDogZXZlbnRzLmNyZWF0ZSgncnVuX3N0YXJ0ZWQnKSBtdXN0IGJlIGlkZW1wb3RlbnRcbiAgICAgICAgICAgICAgICAvLyBmb3IgcnVucyBhbHJlYWR5IGluICdydW5uaW5nJyBzdGF0dXMgKHJldHVybiB0aGUgcnVuXG4gICAgICAgICAgICAgICAgLy8gd2l0aG91dCBlcnJvciksIG5vdCBqdXN0IGZvciBwZW5kaW5nIOKGkiBydW5uaW5nIHRyYW5zaXRpb25zLlxuICAgICAgICAgICAgICAgIC8vIE5ldHdvcmsvc2VydmVyIGVycm9ycyBwcm9wYWdhdGUgdG8gdGhlIHF1ZXVlIGhhbmRsZXIgZm9yIHJldHJ5LlxuICAgICAgICAgICAgICAgIC8vIFdvcmtmbG93UnVudGltZUVycm9yIChkYXRhIGludGVncml0eSBpc3N1ZXMpIGFyZSBmYXRhbCBhbmRcbiAgICAgICAgICAgICAgICAvLyBwcm9kdWNlIHJ1bl9mYWlsZWQgc2luY2UgcmV0cnlpbmcgd29uJ3QgZml4IHRoZW0uXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX3N0YXJ0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIFVzZSB0aGUgc3BlYyB2ZXJzaW9uIGZyb20gdGhlIG9yaWdpbmFsIHN0YXJ0KCkgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gYXZhaWxhYmxlLCBzbyB0aGUgcmVzaWxpZW50IHN0YXJ0IHBhdGggY3JlYXRlc1xuICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBydW4gd2l0aCB0aGUgY29ycmVjdCB2ZXJzaW9uIChub3QgYWx3YXlzIGN1cnJlbnQpLlxuICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOlxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuSW5wdXQ/LnNwZWNWZXJzaW9uID8/IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgIC8vIFBhc3MgcnVuIGlucHV0IGZyb20gcXVldWUgc28gdGhlIHNlcnZlciBjYW5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHJ1biBpZiBydW5fY3JlYXRlZCB3YXMgbWlzc2VkLlxuICAgICAgICAgICAgICAgICAgICAgIC8vIFVpbnQ4QXJyYXkgdmFsdWVzIHN1cnZpdmUgdGhlIHF1ZXVlIG5hdGl2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgLy8gKENCT1Igb24gd29ybGQtdmVyY2VsLCBKU09OIHJldml2ZXIgb24gd29ybGQtbG9jYWwpLlxuICAgICAgICAgICAgICAgICAgICAgIC4uLihydW5JbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogcnVuSW5wdXQuaW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3ltZW50SWQ6IHJ1bklucHV0LmRlcGxveW1lbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogcnVuSW5wdXQud29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhlY3V0aW9uQ29udGV4dDogcnVuSW5wdXQuZXhlY3V0aW9uQ29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICA6IHt9KSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LnJ1bikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYEV2ZW50IGNyZWF0aW9uIGZvciAncnVuX3N0YXJ0ZWQnIGRpZCBub3QgcmV0dXJuIHRoZSBydW4gZW50aXR5IGZvciBydW4gXCIke3J1bklkfVwiYFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4gPSByZXN1bHQucnVuO1xuXG4gICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcmVzcG9uc2UgaW5jbHVkZXMgZXZlbnRzLCB1c2UgdGhlbSB0byBza2lwXG4gICAgICAgICAgICAgICAgICAvLyB0aGUgaW5pdGlhbCBldmVudHMubGlzdCBjYWxsIGFuZCByZWR1Y2UgVFRGQi5cbiAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmV2ZW50cyAmJlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZXZlbnRzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhhc01vcmUgIT09IHRydWVcbiAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkZWRFdmVudHMgPSByZXN1bHQuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkZWRFdmVudHNDdXJzb3IgPSByZXN1bHQuY3Vyc29yO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZiAoIXdvcmtmbG93UnVuLnN0YXJ0ZWRBdCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYFdvcmtmbG93IHJ1biBcIiR7cnVuSWR9XCIgaGFzIG5vIFwic3RhcnRlZEF0XCIgdGltZXN0YW1wYFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgLy8gUnVuIHdhcyBjb25jdXJyZW50bHkgY29tcGxldGVkL2ZhaWxlZC9jYW5jZWxsZWRcbiAgICAgICAgICAgICAgICAgIGlmIChFbnRpdHlDb25mbGljdEVycm9yLmlzKGVycikgfHwgUnVuRXhwaXJlZEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRW50aXR5Q29uZmxpY3RFcnJvcjogcnVuIHdhcyBjb25jdXJyZW50bHlcbiAgICAgICAgICAgICAgICAgICAgLy8gY29tcGxldGVkL2ZhaWxlZC9jYW5jZWxsZWQgZHVyaW5nIHNldHVwLlxuICAgICAgICAgICAgICAgICAgICAvLyBSdW5FeHBpcmVkRXJyb3I6IHJ1biBhbHJlYWR5IGluIHRlcm1pbmFsIHN0YXRlLlxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBib3RoIGNhc2VzLCBza2lwIHByb2Nlc3NpbmcgdGhpcyBtZXNzYWdlLlxuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgJ1J1biBhbHJlYWR5IGZpbmlzaGVkIGR1cmluZyBzZXR1cCwgc2tpcHBpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQsIG1lc3NhZ2U6IGVyci5tZXNzYWdlIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIgaW5zdGFuY2VvZiBXb3JrZmxvd1J1bnRpbWVFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCBydW50aW1lIGVycm9yIGR1cmluZyB3b3JrZmxvdyBzZXR1cCcsXG4gICAgICAgICAgICAgICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCwgZXJyb3I6IGVyci5tZXNzYWdlIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5SVU5USU1FX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChmYWlsRXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgRW50aXR5Q29uZmxpY3RFcnJvci5pcyhmYWlsRXJyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgUnVuRXhwaXJlZEVycm9yLmlzKGZhaWxFcnIpXG4gICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihmYWlsRXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIHJlY29yZGluZyB3b3JrZmxvdyBmYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbEVyciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZmFpbEVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogU3RyaW5nKGZhaWxFcnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBmYWlsRXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciBkdXJpbmcgd29ya2Zsb3cgc2V0dXAnLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuV09STERfQ09OVFJBQ1RfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2ZhaWxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChmYWlsRXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgRW50aXR5Q29uZmxpY3RFcnJvci5pcyhmYWlsRXJyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgUnVuRXhwaXJlZEVycm9yLmlzKGZhaWxFcnIpXG4gICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihmYWlsRXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIHJlY29yZGluZyB3b3JrZmxvdyBmYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbEVyciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZmFpbEVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogU3RyaW5nKGZhaWxFcnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBmYWlsRXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3b3JrZmxvd1N0YXJ0ZWRBdCA9ICt3b3JrZmxvd1J1bi5zdGFydGVkQXQ7XG5cbiAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1blN0YXR1cyh3b3JrZmxvd1J1bi5zdGF0dXMpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93U3RhcnRlZEF0KHdvcmtmbG93U3RhcnRlZEF0KSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmICh3b3JrZmxvd1J1bi5zdGF0dXMgIT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgICAgICAgLy8gV29ya2Zsb3cgaGFzIGFscmVhZHkgY29tcGxldGVkIG9yIGZhaWxlZCwgc28gd2UgY2FuIHNraXAgaXRcbiAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgJ1dvcmtmbG93IGFscmVhZHkgY29tcGxldGVkIG9yIGZhaWxlZCwgc2tpcHBpbmcnLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB3b3JrZmxvd1J1bi5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGZvciBgY2FuY2VsYCwgd2UgYWN0dWFsbHkgd2FudCB0byBwcm9wYWdhdGUgYSBXb3JrZmxvd0NhbmNlbGxlZCBldmVudFxuICAgICAgICAgICAgICAgICAgLy8gaW5zaWRlIHRoZSB3b3JrZmxvdyBjb250ZXh0IHNvIHRoZSB1c2VyIGNhbiBncmFjZWZ1bGx5IGV4aXQuIHRoaXMgaXMgU0lHVEVSTVxuICAgICAgICAgICAgICAgICAgLy8gVE9ETzogZnVydGhlcm1vcmUsIHRoZXJlIHNob3VsZCBiZSBhIHRpbWVvdXQgb3IgYSB3YXkgdG8gZm9yY2UgY2FuY2VsIFNJR0tJTExcbiAgICAgICAgICAgICAgICAgIC8vIHNvIHRoYXQgd2UgYWN0dWFsbHkgZXhpdCBoZXJlIHdpdGhvdXQgcmVwbGF5aW5nIHRoZSB3b3JrZmxvdyBhdCBhbGwsIGluIHRoZSBjYXNlXG4gICAgICAgICAgICAgICAgICAvLyB0aGUgcmVwbGF5aW5nIHRoZSB3b3JrZmxvdyBpcyBpdHNlbGYgZmFpbGluZy5cblxuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIExvYWQgYWxsIGV2ZW50cyBpbnRvIG1lbW9yeSBiZWZvcmUgcnVubmluZy5cbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSBnb3QgcHJlLWxvYWRlZCBldmVudHMgZnJvbSB0aGUgcnVuX3N0YXJ0ZWQgcmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgLy8gc2tpcCB0aGUgZXZlbnRzLmxpc3Qgcm91bmQtdHJpcCB0byByZWR1Y2UgVFRGQi5cbiAgICAgICAgICAgICAgICBsZXQgZXZlbnRzOiBFdmVudFtdO1xuICAgICAgICAgICAgICAgIGxldCBldmVudHNDdXJzb3I6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGlmIChwcmVsb2FkZWRFdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzID0gcHJlbG9hZGVkRXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICBldmVudHNDdXJzb3IgPSBwcmVsb2FkZWRFdmVudHNDdXJzb3I7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRFdmVudHMgPSBhd2FpdCBnZXRXb3JrZmxvd1J1bkV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBldmVudHMgPSBsb2FkZWRFdmVudHMuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICBldmVudHNDdXJzb3IgPSBsb2FkZWRFdmVudHMuY3Vyc29yO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgaWYgKGlzV29ybGRDb250cmFjdEVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgd29ybGQgY29udHJhY3QgZXJyb3Igd2hpbGUgbG9hZGluZyB3b3JrZmxvdyBldmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuV09STERfQ09OVFJBQ1RfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2ZhaWxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChmYWlsRXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgRW50aXR5Q29uZmxpY3RFcnJvci5pcyhmYWlsRXJyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgUnVuRXhwaXJlZEVycm9yLmlzKGZhaWxFcnIpXG4gICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihmYWlsRXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIHJlY29yZGluZyB3b3JrZmxvdyBmYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbEVyciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZmFpbEVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogU3RyaW5nKGZhaWxFcnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBmYWlsRXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUaGUgbWF0ZXJpYWxpemVkIHJ1biByZXR1cm5lZCBieSBydW5fc3RhcnRlZCBjYW4gcmFjZSBhXG4gICAgICAgICAgICAgICAgLy8gdGVybWluYWwgZXZlbnQgaW4gdGhlIGxvYWRlZCBzbmFwc2hvdC4gRG8gbm90IHJlcGxheSBhIHJ1blxuICAgICAgICAgICAgICAgIC8vIHdob3NlIGV2ZW50IGxvZyBhbHJlYWR5IGVzdGFibGlzaGVzIGl0cyB0ZXJtaW5hbCBvdXRjb21lLlxuICAgICAgICAgICAgICAgIGlmIChoYXNSZWNvcmRlZFRlcm1pbmFsUnVuRXZlbnQoZXZlbnRzLCBydW5JZCkpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgYW55IGVsYXBzZWQgd2FpdHMgYW5kIGNyZWF0ZSB3YWl0X2NvbXBsZXRlZCBldmVudHNcbiAgICAgICAgICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgICAgICAgICAgLy8gUHJlLWNvbXB1dGUgY29tcGxldGVkIGNvcnJlbGF0aW9uIElEcyBmb3IgTyhuKSBsb29rdXAgaW5zdGVhZCBvZiBPKG7CsilcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wbGV0ZWRXYWl0SWRzID0gbmV3IFNldChcbiAgICAgICAgICAgICAgICAgIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChlKSA9PiBlLmV2ZW50VHlwZSA9PT0gJ3dhaXRfY29tcGxldGVkJylcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoZSkgPT4gZS5jb3JyZWxhdGlvbklkKVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAvLyBDb2xsZWN0IGFsbCB3YWl0cyB0aGF0IG5lZWQgY29tcGxldGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IHdhaXRzVG9Db21wbGV0ZSA9IGV2ZW50c1xuICAgICAgICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAgIGVcbiAgICAgICAgICAgICAgICAgICAgKTogZSBpcyBFeHRyYWN0PEV2ZW50LCB7IGV2ZW50VHlwZTogJ3dhaXRfY3JlYXRlZCcgfT4gJiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29ycmVsYXRpb25JZDogc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICB9ID0+XG4gICAgICAgICAgICAgICAgICAgICAgZS5ldmVudFR5cGUgPT09ICd3YWl0X2NyZWF0ZWQnICYmXG4gICAgICAgICAgICAgICAgICAgICAgZS5jb3JyZWxhdGlvbklkICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAhY29tcGxldGVkV2FpdElkcy5oYXMoZS5jb3JyZWxhdGlvbklkKSAmJlxuICAgICAgICAgICAgICAgICAgICAgIG5vdyA+PSAoZS5ldmVudERhdGEucmVzdW1lQXQgYXMgRGF0ZSkuZ2V0VGltZSgpXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAubWFwKChlKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICd3YWl0X2NvbXBsZXRlZCcgYXMgY29uc3QsXG4gICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgY29ycmVsYXRpb25JZDogZS5jb3JyZWxhdGlvbklkLFxuICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bWVBdDogZS5ldmVudERhdGEucmVzdW1lQXQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYWxsIHdhaXRfY29tcGxldGVkIGV2ZW50c1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgd2FpdEV2ZW50IG9mIHdhaXRzVG9Db21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgY29uc3Qgd2FpdExvZzogTXV0YWJsZUV2ZW50TG9nID0ge1xuICAgICAgICAgICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogZXZlbnRzQ3Vyc29yID8/IG51bGwsXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgd2l0aFByZWNvbmRpdGlvblJldHJ5KFxuICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIHdhaXRMb2csXG4gICAgICAgICAgICAgICAgICAgICAgKHN0YXRlVXBkYXRlZEF0KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgd29ybGQuZXZlbnRzLmNyZWF0ZShydW5JZCwgd2FpdEV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVVcGRhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChFbnRpdHlDb25mbGljdEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oJ1dhaXQgYWxyZWFkeSBjb21wbGV0ZWQsIHNraXBwaW5nJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3JyZWxhdGlvbklkOiB3YWl0RXZlbnQuY29ycmVsYXRpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZWxvYWRzIGluc2lkZSB0aGUgZ3VhcmQgbWF5IGhhdmUgYWR2YW5jZWQgdGhlIGN1cnNvci5cbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzQ3Vyc29yID0gd2FpdExvZy5jdXJzb3I7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHdhaXRzVG9Db21wbGV0ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGUgZXZlbnQgbGlzdCBhYm92ZSBtYXkgYmUgc3RhbGUgYnkgdGhlIHRpbWUgYW4gZWxhcHNlZFxuICAgICAgICAgICAgICAgICAgLy8gd2FpdCBpcyBjb21taXR0ZWQuIExvYWQgb25seSBldmVudHMgYWZ0ZXIgdGhlIG9yaWdpbmFsXG4gICAgICAgICAgICAgICAgICAvLyBzbmFwc2hvdCBjdXJzb3Igc28gY29uY3VycmVudCBkdXJhYmxlIGV2ZW50cywgc3VjaCBhc1xuICAgICAgICAgICAgICAgICAgLy8gaG9va19yZWNlaXZlZCwga2VlcCB0aGVpciBvcmRlcmluZyByZWxhdGl2ZSB0b1xuICAgICAgICAgICAgICAgICAgLy8gd2FpdF9jb21wbGV0ZWQuIEZhbGwgYmFjayB0byBhIGZ1bGwgcmVsb2FkIGZvciBvbGRlciB3b3JsZHNcbiAgICAgICAgICAgICAgICAgIC8vIHRoYXQgY2Fubm90IGdpdmUgdXMgYSBzdGFibGUgY3Vyc29yLlxuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50c0N1cnNvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdFdmVudHMgPSBhd2FpdCBnZXRXb3JrZmxvd1J1bkV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICBldmVudHNDdXJzb3JcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcGxldGVkV2FpdElkc0FmdGVyQ3Vyc29yID0gbmV3IFNldChcbiAgICAgICAgICAgICAgICAgICAgICBuZXdFdmVudHMuZXZlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChlKSA9PiBlLmV2ZW50VHlwZSA9PT0gJ3dhaXRfY29tcGxldGVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGUpID0+IGUuY29ycmVsYXRpb25JZClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2F3QWxsV2FpdENvbXBsZXRpb25zID0gd2FpdHNUb0NvbXBsZXRlLmV2ZXJ5KFxuICAgICAgICAgICAgICAgICAgICAgICh3YWl0RXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWRXYWl0SWRzQWZ0ZXJDdXJzb3IuaGFzKHdhaXRFdmVudC5jb3JyZWxhdGlvbklkKVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzYXdBbGxXYWl0Q29tcGxldGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ0lkcyA9IG5ldyBTZXQoXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMubWFwKChldmVudCkgPT4gZXZlbnQuZXZlbnRJZClcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgbmV3RXZlbnRzLmV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFleGlzdGluZ0lkcy5oYXMoZXZlbnQuZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdJZHMuYWRkKGV2ZW50LmV2ZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlZEV2ZW50cyA9IGF3YWl0IGdldFdvcmtmbG93UnVuRXZlbnRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWRcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cyA9IGxvYWRlZEV2ZW50cy5ldmVudHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlZEV2ZW50cyA9IGF3YWl0IGdldFdvcmtmbG93UnVuRXZlbnRzKFxuICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuLnJ1bklkXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cyA9IGxvYWRlZEV2ZW50cy5ldmVudHM7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIEEgY29uY3VycmVudCB0ZXJtaW5hbCB3cml0ZSBtYXkgaGF2ZSBsYW5kZWQgd2hpbGVcbiAgICAgICAgICAgICAgICAgIC8vIGNvbW1pdHRpbmcgYW4gZWxhcHNlZCB3YWl0IGFuZCByZWZyZXNoaW5nIHRoZSBzbmFwc2hvdC5cbiAgICAgICAgICAgICAgICAgIGlmIChoYXNSZWNvcmRlZFRlcm1pbmFsUnVuRXZlbnQoZXZlbnRzLCBydW5JZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFJlc29sdmUgdGhlIGVuY3J5cHRpb24ga2V5IGZvciB0aGlzIHJ1bidzIGRlcGxveW1lbnRcbiAgICAgICAgICAgICAgICBjb25zdCByYXdLZXkgPVxuICAgICAgICAgICAgICAgICAgYXdhaXQgd29ybGQuZ2V0RW5jcnlwdGlvbktleUZvclJ1bj8uKHdvcmtmbG93UnVuKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmNyeXB0aW9uS2V5ID0gcmF3S2V5XG4gICAgICAgICAgICAgICAgICA/IGF3YWl0IGltcG9ydEtleShyYXdLZXkpXG4gICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgIC8vIC0tLSBVc2VyIGNvZGUgZXhlY3V0aW9uIC0tLVxuICAgICAgICAgICAgICAgIC8vIE9ubHkgZXJyb3JzIGZyb20gcnVuV29ya2Zsb3coKSAodXNlciB3b3JrZmxvdyBjb2RlKSBzaG91bGRcbiAgICAgICAgICAgICAgICAvLyBwcm9kdWNlIHJ1bl9mYWlsZWQuIEluZnJhc3RydWN0dXJlIGVycm9ycyAobmV0d29yaywgc2VydmVyKVxuICAgICAgICAgICAgICAgIC8vIG11c3QgcHJvcGFnYXRlIHRvIHRoZSBxdWV1ZSBoYW5kbGVyIGZvciBhdXRvbWF0aWMgcmV0cnkuXG4gICAgICAgICAgICAgICAgbGV0IHdvcmtmbG93UmVzdWx0OiB1bmtub3duO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICB3b3JrZmxvd1Jlc3VsdCA9IGF3YWl0IHRyYWNlKFxuICAgICAgICAgICAgICAgICAgICAnd29ya2Zsb3cucmVwbGF5JyxcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIGFzeW5jIChyZXBsYXlTcGFuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVwbGF5U3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFdmVudHNDb3VudChldmVudHMubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcnVuV29ya2Zsb3coXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd0NvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bixcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY3J5cHRpb25LZXlcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgLy8gV29ya2Zsb3dTdXNwZW5zaW9uIGlzIG5vcm1hbCBjb250cm9sIGZsb3cg4oCUIG5vdCBhbiBlcnJvclxuICAgICAgICAgICAgICAgICAgaWYgKFdvcmtmbG93U3VzcGVuc2lvbi5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1c3BlbnNpb25NZXNzYWdlID0gYnVpbGRXb3JrZmxvd1N1c3BlbnNpb25NZXNzYWdlKFxuICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIGVyci5zdGVwQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgZXJyLmhvb2tDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICBlcnIud2FpdENvdW50XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdXNwZW5zaW9uTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZGVidWcoc3VzcGVuc2lvbk1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRWFjaCBldmVudCBjcmVhdGlvbiBpbnNpZGUgaGFuZGxlU3VzcGVuc2lvbiBjYXJyaWVzIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBsb2FkZWQgc25hcHNob3QncyBgc3RhdGVVcGRhdGVkQXRgOyBvbiBhIHN0YWxlICg0MTIpXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlamVjdGlvbiB0aGUgZ3VhcmQgcmVsb2FkcyB0aGlzIGxvZyBpbiBwbGFjZSBhbmQgcmV0cmllcy5cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VzcGVuc2lvbkxvZzogTXV0YWJsZUV2ZW50TG9nID0ge1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6IGV2ZW50c0N1cnNvciA/PyBudWxsLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBBd2FpdGVkPFJldHVyblR5cGU8dHlwZW9mIGhhbmRsZVN1c3BlbnNpb24+PjtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBhd2FpdCBoYW5kbGVTdXNwZW5zaW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1c3BlbnNpb246IGVycixcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuOiB3b3JrZmxvd1J1bixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudExvZzogc3VzcGVuc2lvbkxvZyxcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoc3VzcGVuc2lvbkVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGd1YXJkIGV4aGF1c3RlZCBpdHMgcmVsb2FkcyBvbiBhIHN0YWxlIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRpb24uIFNjaGVkdWxlIGFuIGV4cGxpY2l0IGltbWVkaWF0ZSByZS1pbnZvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgLy8gKGEgcmV0aHJvdyByZWxpZXMgb24gcXVldWUgcmVkZWxpdmVyeSkgc28gYSBmcmVzaFxuICAgICAgICAgICAgICAgICAgICAgIC8vIHJlcGxheSBvYnNlcnZlcyB0aGUgbmV3ZXIgZXZlbnQuXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFByZWNvbmRpdGlvbkZhaWxlZEVycm9yLmlzKHN1c3BlbnNpb25FcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ1N1c3BlbnNpb24gZXZlbnQgY3JlYXRpb24gZXhoYXVzdGVkIHByZWNvbmRpdGlvbiByZXRyaWVzOyByZS1pbnZva2luZyB3aXRoIGEgZnJlc2ggcmVwbGF5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdGltZW91dFNlY29uZHM6IDAgfTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgc3VzcGVuc2lvbkVycm9yO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC50aW1lb3V0U2Vjb25kcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdGltZW91dFNlY29uZHM6IHJlc3VsdC50aW1lb3V0U2Vjb25kcyB9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU3VzcGVuc2lvbiBoYW5kbGVkLCBubyBmdXJ0aGVyIHdvcmsgbmVlZGVkXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gVHJhbnNpZW50IGluZnJhc3RydWN0dXJlIGZhaWx1cmVzIHRhbGtpbmcgdG8gdGhlXG4gICAgICAgICAgICAgICAgICAvLyB3b3JsZCAod29ya2Zsb3ctc2VydmVyKSDigJQgYW4gZXhoYXVzdGVkIFJldHJ5QWdlbnRcbiAgICAgICAgICAgICAgICAgIC8vIChVTkRfRVJSX1JFUV9SRVRSWSBmcm9tIGEgc3VzdGFpbmVkIDQyOS81MDMgc3Rvcm0pLFxuICAgICAgICAgICAgICAgICAgLy8gYSBkcm9wcGVkIHNvY2tldCwgYSBjb25uZWN0L0ROUyBmYWlsdXJlLCBvciBhIGNsaWVudFxuICAgICAgICAgICAgICAgICAgLy8gdGltZW91dCDigJQgbXVzdCBOT1QgZmFpbCB0aGUgcnVuLiBSZXRocm93IHNvIHRoZSBxdWV1ZVxuICAgICAgICAgICAgICAgICAgLy8gcmVkZWxpdmVycyBhbmQgYSBmcmVzaCBpbnZvY2F0aW9uIHJldHJpZXMgdGhlIHJlcGxheVxuICAgICAgICAgICAgICAgICAgLy8gb25jZSB0aGUgYmFja2VuZCByZWNvdmVycy4gVGhlIEB2ZXJjZWwvcXVldWUgaGFuZGxlclxuICAgICAgICAgICAgICAgICAgLy8gYXBwbGllcyBhIGZhc3QgKDFz4oaSNjBzKSBiYWNrb2ZmIGJ5IGRlbGl2ZXJ5IGNvdW50LFxuICAgICAgICAgICAgICAgICAgLy8gYXZvaWRpbmcgdGhlIH41bWluIGRlZmF1bHQgdmlzaWJpbGl0eS10aW1lb3V0IHJlZHJpdmVcbiAgICAgICAgICAgICAgICAgIC8vIChhbmQgbmV2ZXIga2lsbGluZyB0aGUgcHJvY2VzcyB2aWEgcnVuX2ZhaWxlZCkuXG4gICAgICAgICAgICAgICAgICBpZiAoaXNSZXRyeWFibGVXb3JsZEVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICdUcmFuc2llbnQgd29ybGQgZXJyb3IgZHVyaW5nIHJlcGxheTsgcmVkZWxpdmVyaW5nIHZpYSBxdWV1ZSBpbnN0ZWFkIG9mIGZhaWxpbmcgdGhlIHJ1bicsXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JOYW1lOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5uYW1lIDogJ1Vua25vd25FcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGl2ZXJ5QXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgbGV0IHRlcm1pbmFsRXJyb3IgPSBlcnI7XG4gICAgICAgICAgICAgICAgICBpZiAoUmVwbGF5RGl2ZXJnZW5jZUVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGl2ZXJnZW5jZUNvdW50ID0gKHJlcGxheURpdmVyZ2VuY2U/LmNvdW50ID8/IDApICsgMTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGl2ZXJnZW5jZUNvdW50IDw9IFJFUExBWV9ESVZFUkdFTkNFX01BWF9SRVRSSUVTKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1dvcmtmbG93IHJlcGxheSBkaXZlcmdlZDsgcXVldWVpbmcgYSByZWNvdmVyeSByZXBsYXkgYmVmb3JlIGRlY2xhcmluZyB0aGUgZXZlbnQgbG9nIGNvcnJ1cHRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5SRVBMQVlfRElWRVJHRU5DRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGl2ZXJnZW5jZUV2ZW50SWQ6IGVyci5ldmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwcmlvckRpdmVyZ2VuY2VFdmVudElkOiByZXBsYXlEaXZlcmdlbmNlPy5ldmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkaXZlcmdlbmNlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGl2ZXJ5QXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4UmVjb3ZlcnlSZXBsYXlzOiBSRVBMQVlfRElWRVJHRU5DRV9NQVhfUkVUUklFUyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHF1ZXVlTWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0V29ya2Zsb3dRdWV1ZU5hbWUod29ya2Zsb3dOYW1lLCBuYW1lc3BhY2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhY2VDYXJyaWVyOiB0cmFjZUNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsYXlEaXZlcmdlbmNlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRJZDogZXJyLmV2ZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IGRpdmVyZ2VuY2VDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveW1lbnRJZDogd29ya2Zsb3dSdW4uZGVwbG95bWVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5zcGVjVmVyc2lvbiA/PyBTUEVDX1ZFUlNJT05fTEVHQUNZLFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGVybWluYWxFcnJvciA9IG5ldyBDb3JydXB0ZWRFdmVudExvZ0Vycm9yKFxuICAgICAgICAgICAgICAgICAgICAgIGBXb3JrZmxvdyByZXBsYXkgZGl2ZXJnZWQgJHtkaXZlcmdlbmNlQ291bnR9IHRpbWVzIGFmdGVyICR7UkVQTEFZX0RJVkVSR0VOQ0VfTUFYX1JFVFJJRVN9IHJlY292ZXJ5IHJlcGxheXM7IGxhdGVzdCBkaXZlcmdlbnQgZXZlbnQgd2FzICR7ZXJyLmV2ZW50SWR9LiBMYXN0IGRpdmVyZ2VuY2U6ICR7ZXJyLm1lc3NhZ2V9YCxcbiAgICAgICAgICAgICAgICAgICAgICB7IGNhdXNlOiBlcnIgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgdXNlciBjb2RlIGVycm9yIG9yIGEgdGVybWluYWxcbiAgICAgICAgICAgICAgICAgIC8vIFdvcmtmbG93UnVudGltZUVycm9yLiBGYWlsIHRoZSB3b3JrZmxvdyBydW4uXG5cbiAgICAgICAgICAgICAgICAgIC8vIFJlY29yZCBleGNlcHRpb24gZm9yIE9URUwgZXJyb3IgdHJhY2tpbmdcbiAgICAgICAgICAgICAgICAgIGlmICh0ZXJtaW5hbEVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgc3Bhbj8ucmVjb3JkRXhjZXB0aW9uPy4odGVybWluYWxFcnJvcik7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRFcnJvciA9XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG5vcm1hbGl6ZVVua25vd25FcnJvcih0ZXJtaW5hbEVycm9yKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTmFtZSA9XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRFcnJvci5uYW1lIHx8IGdldEVycm9yTmFtZSh0ZXJtaW5hbEVycm9yKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IG5vcm1hbGl6ZWRFcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgbGV0IGVycm9yU3RhY2sgPVxuICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkRXJyb3Iuc3RhY2sgfHwgZ2V0RXJyb3JTdGFjayh0ZXJtaW5hbEVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgLy8gUmVtYXAgZXJyb3Igc3RhY2sgdXNpbmcgc291cmNlIG1hcHMgdG8gc2hvdyBvcmlnaW5hbCBzb3VyY2UgbG9jYXRpb25zXG4gICAgICAgICAgICAgICAgICBpZiAoZXJyb3JTdGFjaykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWROYW1lID0gcGFyc2VXb3JrZmxvd05hbWUod29ya2Zsb3dOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZW5hbWUgPVxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZE5hbWU/Lm1vZHVsZVNwZWNpZmllciB8fCB3b3JrZmxvd05hbWU7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yU3RhY2sgPSByZW1hcEVycm9yU3RhY2soXG4gICAgICAgICAgICAgICAgICAgICAgZXJyb3JTdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd0NvZGVcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gQ2xhc3NpZnkgdGhlIGVycm9yOiBXb3JrZmxvd1J1bnRpbWVFcnJvciBpbmRpY2F0ZXNcbiAgICAgICAgICAgICAgICAgIC8vIGFuIFNESy9ydW50aW1lIGlzc3VlLCBhbmQgc2VsZWN0ZWQgc3ViY2xhc3NlcyB1c2VcbiAgICAgICAgICAgICAgICAgIC8vIG1vcmUgc3BlY2lmaWMgY29kZXMgZm9yIGJhY2tlbmQgdHJhY2tpbmcuXG4gICAgICAgICAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPSBjbGFzc2lmeVJ1bkVycm9yKHRlcm1pbmFsRXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBydW5uaW5nIHdvcmtmbG93Jywge1xuICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yU3RhY2ssXG4gICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgLy8gRmFpbCB0aGUgd29ya2Zsb3cgcnVuIHZpYSBldmVudCAoZXZlbnQtc291cmNlZCBhcmNoaXRlY3R1cmUpXG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnJvclN0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZmFpbEVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgRW50aXR5Q29uZmxpY3RFcnJvci5pcyhmYWlsRXJyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgIFJ1bkV4cGlyZWRFcnJvci5pcyhmYWlsRXJyKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgICAnVHJpZWQgZmFpbGluZyB3b3JrZmxvdyBydW4sIGJ1dCBydW4gaGFzIGFscmVhZHkgZmluaXNoZWQuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGZhaWxFcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JDb2RlKGVycm9yQ29kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvck5hbWUoZXJyb3JOYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yTWVzc2FnZShlcnJvck1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLkVycm9yVHlwZShlcnJvck5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZmFpbEVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIHJlY29yZGluZyB3b3JrZmxvdyBmYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsRXJyIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZmFpbEVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhmYWlsRXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBmYWlsRXJyO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuU3RhdHVzKCdmYWlsZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JDb2RlKGVycm9yQ29kZSksXG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yTmFtZShlcnJvck5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvck1lc3NhZ2UoZXJyb3JNZXNzYWdlKSxcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLkVycm9yVHlwZShlcnJvck5hbWUpLFxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gLS0tIEluZnJhc3RydWN0dXJlOiBjb21wbGV0ZSB0aGUgcnVuIC0tLVxuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgb3V0c2lkZSB0aGUgdXNlci1jb2RlIHRyeS9jYXRjaCBzbyB0aGF0IGZhaWx1cmVzXG4gICAgICAgICAgICAgICAgLy8gaGVyZSAoZS5nLiwgbmV0d29yayBlcnJvcnMpIHByb3BhZ2F0ZSB0byB0aGUgcXVldWUgaGFuZGxlci5cbiAgICAgICAgICAgICAgICAvLyBydW5fY29tcGxldGVkIGNhcnJpZXMgdGhlIGxvYWRlZCBzbmFwc2hvdCdzIGBzdGF0ZVVwZGF0ZWRBdGAsXG4gICAgICAgICAgICAgICAgLy8gYnV0IGlzIGludGVudGlvbmFsbHkgTk9UIHJldHJpZWQgaW4gcGxhY2UgKG5vXG4gICAgICAgICAgICAgICAgLy8gd2l0aFByZWNvbmRpdGlvblJldHJ5KSBvbiBhIHN0YWxlICg0MTIpIHJlamVjdGlvbjogYHJlc3VsdGBcbiAgICAgICAgICAgICAgICAvLyB3YXMgY29tcHV0ZWQgYnkgdGhpcyByZXBsYXksIHNvIGEgbmV3ZXIgb3V0LW9mLWJhbmQgZXZlbnRcbiAgICAgICAgICAgICAgICAvLyBsYW5kaW5nIGFmdGVyIHRoZSBzbmFwc2hvdCBtdXN0IGZvcmNlIGEgKmZyZXNoIHJlcGxheSpcbiAgICAgICAgICAgICAgICAvLyAod2hpY2ggbWF5IG9ic2VydmUgaXQgYW5kIHByb2R1Y2UgYSBkaWZmZXJlbnQgcmVzdWx0KSwgbm90XG4gICAgICAgICAgICAgICAgLy8gcmUtY29tbWl0IHRoZSBzdGFsZSByZXN1bHQuIE9uIDQxMiB0aGUgY2F0Y2ggYmVsb3cgc2NoZWR1bGVzXG4gICAgICAgICAgICAgICAgLy8gYW4gZXhwbGljaXQgaW1tZWRpYXRlIHJlLWludm9jYXRpb24gaW5zdGVhZC5cbiAgICAgICAgICAgICAgICAvLyAocnVuX2ZhaWxlZCBpcyBkZWxpYmVyYXRlbHkgbGVmdCB1bmd1YXJkZWQgYW5kIGZhaWxzIG9wZW46XG4gICAgICAgICAgICAgICAgLy8gYSBzcHVyaW91cyByZS1ydW4gaXMgc2FmZSwgYSBzcHVyaW91cyBjb21wbGV0aW9uIGlzIG5vdCwgYW5kXG4gICAgICAgICAgICAgICAgLy8gdGhlIGxvYWRlZCBldmVudCBsb2cgaXMgbm90IGluIHNjb3BlIG9uIHRoYXQgY2F0Y2ggcGF0aC4pXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiB3b3JrZmxvd1Jlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgICAgICAgIHN0YXRlVXBkYXRlZEF0OiBzdGF0ZVVwZGF0ZWRBdEZvckNyZWF0ZShldmVudHMpLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgaWYgKFByZWNvbmRpdGlvbkZhaWxlZEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICdydW5fY29tcGxldGVkIHJlamVjdGVkIGFzIHN0YWxlOyByZS1pbnZva2luZyB3aXRoIGEgZnJlc2ggcmVwbGF5JyxcbiAgICAgICAgICAgICAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdGltZW91dFNlY29uZHM6IDAgfTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmIChFbnRpdHlDb25mbGljdEVycm9yLmlzKGVycikgfHwgUnVuRXhwaXJlZEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICdUcmllZCBjb21wbGV0aW5nIHdvcmtmbG93IHJ1biwgYnV0IHJ1biBoYXMgYWxyZWFkeSBmaW5pc2hlZC4nLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5TdGF0dXMoJ2NvbXBsZXRlZCcpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXZlbnRzQ291bnQoZXZlbnRzLmxlbmd0aCksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7IC8vIEVuZCB0cmFjZVxuICAgICAgICAgIH1cbiAgICAgICAgKTsgLy8gRW5kIHdpdGhXb3JrZmxvd0JhZ2dhZ2VcbiAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICBpZiAocmVwbGF5VGltZW91dCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChyZXBsYXlUaW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgfSk7IC8vIEVuZCB3aXRoVHJhY2VDb250ZXh0XG4gICAgfVxuICApO1xuXG4gIHJldHVybiB3aXRoSGVhbHRoQ2hlY2soaGFuZGxlciwgd29ybGRTcGVjVmVyc2lvbik7XG59XG5cbi8vIHRoaXMgaXMgYSBuby1vcCBwbGFjZWhvbGRlciBhcyB0aGUgY2xpZW50IGlzXG4vLyBleHBlY3RpbmcgdGhpcyB0byBiZSBwcmVzZW50IGJ1dCB3ZSBhcmVuJ3QgYWN0dWFsbHkgdXNpbmcgaXRcbmV4cG9ydCBmdW5jdGlvbiBydW5TdGVwKCkge31cbiIsICJpbXBvcnQge1xuICBFUlJPUl9TTFVHUyxcbiAgUmVwbGF5RGl2ZXJnZW5jZUVycm9yLFxuICBXb3JrZmxvd05vdFJlZ2lzdGVyZWRFcnJvcixcbiAgV29ya2Zsb3dSdW50aW1lRXJyb3IsXG59IGZyb20gJ0B3b3JrZmxvdy9lcnJvcnMnO1xuaW1wb3J0IHsgY3JlYXRlV29ya2Zsb3dCYXNlVXJsLCB3aXRoUmVzb2x2ZXJzIH0gZnJvbSAnQHdvcmtmbG93L3V0aWxzJztcbmltcG9ydCB7IHBhcnNlV29ya2Zsb3dOYW1lIH0gZnJvbSAnQHdvcmtmbG93L3V0aWxzL3BhcnNlLW5hbWUnO1xuaW1wb3J0IHR5cGUgeyBFdmVudCwgV29ya2Zsb3dSdW4gfSBmcm9tICdAd29ya2Zsb3cvd29ybGQnO1xuaW1wb3J0ICogYXMgbmFub2lkIGZyb20gJ25hbm9pZCc7XG5pbXBvcnQgeyBtb25vdG9uaWNGYWN0b3J5IH0gZnJvbSAndWxpZCc7XG5pbXBvcnQgdHlwZSB7IENyeXB0b0tleSB9IGZyb20gJy4vZW5jcnlwdGlvbi5qcyc7XG5pbXBvcnQgeyBFdmVudENvbnN1bWVyUmVzdWx0LCBFdmVudHNDb25zdW1lciB9IGZyb20gJy4vZXZlbnRzLWNvbnN1bWVyLmpzJztcbmltcG9ydCB0eXBlIHsgUXVldWVJdGVtIH0gZnJvbSAnLi9nbG9iYWwuanMnO1xuaW1wb3J0IHsgRU5PVFNVUCwgV29ya2Zsb3dTdXNwZW5zaW9uIH0gZnJvbSAnLi9nbG9iYWwuanMnO1xuaW1wb3J0IHsgcnVudGltZUxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyLmpzJztcbmltcG9ydCB0eXBlIHsgV29ya2Zsb3dPcmNoZXN0cmF0b3JDb250ZXh0IH0gZnJvbSAnLi9wcml2YXRlLmpzJztcbmltcG9ydCB7IGdldFBvcnRMYXp5IH0gZnJvbSAnLi9ydW50aW1lL2dldC1wb3J0LWxhenkuanMnO1xuaW1wb3J0IHtcbiAgZGVoeWRyYXRlV29ya2Zsb3dSZXR1cm5WYWx1ZSxcbiAgaHlkcmF0ZVdvcmtmbG93QXJndW1lbnRzLFxufSBmcm9tICcuL3NlcmlhbGl6YXRpb24uanMnO1xuaW1wb3J0IHsgY3JlYXRlVXNlU3RlcCB9IGZyb20gJy4vc3RlcC5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0ZXBIeWRyYXRpb25DYWNoZSB9IGZyb20gJy4vc3RlcC1oeWRyYXRpb24tY2FjaGUuanMnO1xuaW1wb3J0IHtcbiAgQk9EWV9JTklUX1NZTUJPTCxcbiAgU1RBQkxFX1VMSUQsXG4gIFdPUktGTE9XX0NSRUFURV9IT09LLFxuICBXT1JLRkxPV19HRVRfU1RSRUFNX0lELFxuICBXT1JLRkxPV19TTEVFUCxcbiAgV09SS0ZMT1dfVVNFX1NURVAsXG59IGZyb20gJy4vc3ltYm9scy5qcyc7XG5pbXBvcnQgKiBhcyBBdHRyaWJ1dGUgZnJvbSAnLi90ZWxlbWV0cnkvc2VtYW50aWMtY29udmVudGlvbnMuanMnO1xuaW1wb3J0IHsgdHJhY2UgfSBmcm9tICcuL3RlbGVtZXRyeS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JrZmxvd1J1blN0cmVhbUlkIH0gZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IGNyZWF0ZUNvbnRleHQgfSBmcm9tICcuL3ZtL2luZGV4LmpzJztcbmltcG9ydCB7IHJ1bkNhY2hlZFdvcmtmbG93U2NyaXB0IH0gZnJvbSAnLi92bS9zY3JpcHQtY2FjaGUuanMnO1xuaW1wb3J0IHR5cGUgeyBXb3JrZmxvd01ldGFkYXRhIH0gZnJvbSAnLi93b3JrZmxvdy9nZXQtd29ya2Zsb3ctbWV0YWRhdGEuanMnO1xuaW1wb3J0IHsgV09SS0ZMT1dfQ09OVEVYVF9TWU1CT0wgfSBmcm9tICcuL3dvcmtmbG93L2dldC13b3JrZmxvdy1tZXRhZGF0YS5qcyc7XG5pbXBvcnQgeyBjcmVhdGVDcmVhdGVIb29rIH0gZnJvbSAnLi93b3JrZmxvdy9ob29rLmpzJztcbmltcG9ydCB7IGNyZWF0ZVNsZWVwIH0gZnJvbSAnLi93b3JrZmxvdy9zbGVlcC5qcyc7XG5cbi8qKlxuICogTG9ncyBhIHdhcm5pbmcgd2hlbiBhIHdvcmtmbG93IHJ1biBjb21wbGV0ZXMgb3IgZmFpbHMgd2l0aCB1bmNvbW1pdHRlZFxuICogb3BlcmF0aW9ucyBzdGlsbCBpbiB0aGUgaW52b2NhdGlvbnMgcXVldWUuIFRoaXMgdHlwaWNhbGx5IGluZGljYXRlcyB0aGVcbiAqIHVzZXIgZm9yZ290IHRvIGBhd2FpdGAgYSBzdGVwLCBob29rLCBvciBzbGVlcCBjYWxsLlxuICovXG5mdW5jdGlvbiB3YXJuUGVuZGluZ1F1ZXVlSXRlbXMoXG4gIHJ1bklkOiBzdHJpbmcsXG4gIHBlbmRpbmdRdWV1ZTogTWFwPHN0cmluZywgUXVldWVJdGVtPixcbiAgb3V0Y29tZTogJ2NvbXBsZXRlZCcgfCAnZmFpbGVkJ1xuKTogdm9pZCB7XG4gIC8vIEZpbHRlciBvdXQgaG9va3MgdGhhdCBhcmUgZWl0aGVyIGFscmVhZHkgY3JlYXRlZCAoYWxpdmUsIHdhaXRpbmcgZm9yIHBheWxvYWRzKVxuICAvLyBvciBleHBsaWNpdGx5IGRpc3Bvc2VkIOKAlCBib3RoIGFyZSBiZW5pZ24gc2luY2UgdGhlIGJhY2tlbmQgYXV0by1kaXNwb3Nlc1xuICAvLyBhbGwgaG9va3Mgd2hlbiBhIHJ1biByZWFjaGVzIGEgdGVybWluYWwgc3RhdGVcbiAgY29uc3QgaXRlbXMgPSBbLi4ucGVuZGluZ1F1ZXVlLnZhbHVlcygpXS5maWx0ZXIoXG4gICAgKGl0ZW0pID0+ICEoaXRlbS50eXBlID09PSAnaG9vaycgJiYgKGl0ZW0uaGFzQ3JlYXRlZEV2ZW50IHx8IGl0ZW0uZGlzcG9zZWQpKVxuICApO1xuICBpZiAoaXRlbXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgY29uc3QgZGV0YWlscyA9IGl0ZW1zLm1hcCgoaXRlbSkgPT4ge1xuICAgIHN3aXRjaCAoaXRlbS50eXBlKSB7XG4gICAgICBjYXNlICdzdGVwJzpcbiAgICAgICAgcmV0dXJuIGBzdGVwIFwiJHtpdGVtLnN0ZXBOYW1lfVwiYDtcbiAgICAgIGNhc2UgJ2hvb2snOlxuICAgICAgICByZXR1cm4gYGhvb2sgXCIke2l0ZW0udG9rZW59XCJgO1xuICAgICAgY2FzZSAnd2FpdCc6XG4gICAgICAgIHJldHVybiAnc2xlZXAnO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGB1bmtub3duICgkeyhpdGVtIGFzIHsgdHlwZTogc3RyaW5nIH0pLnR5cGV9KWA7XG4gICAgfVxuICB9KTtcblxuICBydW50aW1lTG9nZ2VyLndhcm4oXG4gICAgYFdvcmtmbG93IHJ1biAke291dGNvbWV9IHdpdGggJHtpdGVtcy5sZW5ndGh9IHVuY29tbWl0dGVkIG9wZXJhdGlvbihzKTogJHtkZXRhaWxzLmpvaW4oJywgJyl9LiBgICtcbiAgICAgICdEaWQgeW91IGZvcmdldCB0byBgYXdhaXRgIGEgc3RlcCwgaG9vaywgb3Igc2xlZXAgY2FsbD8nLFxuICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQgfVxuICApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuV29ya2Zsb3coXG4gIHdvcmtmbG93Q29kZTogc3RyaW5nLFxuICB3b3JrZmxvd1J1bjogV29ya2Zsb3dSdW4sXG4gIGV2ZW50czogRXZlbnRbXSxcbiAgZW5jcnlwdGlvbktleTogQ3J5cHRvS2V5IHwgdW5kZWZpbmVkLFxuICAvKipcbiAgICogT3B0aW9uYWwgcGVyLXJ1biBjYWNoZSBmb3IgaHlkcmF0ZWQgc3RlcCByZXR1cm4gdmFsdWVzLCBvd25lZCBieSB0aGUgaW5saW5lXG4gICAqIHJlcGxheSBsb29wIHNvIGl0IHN1cnZpdmVzIGFjcm9zcyB0aGUgbG9vcCdzIGl0ZXJhdGlvbnMgKGVhY2ggb2Ygd2hpY2hcbiAgICogY3JlYXRlcyBhIGZyZXNoIGNvbnRleHQpLiBNZW1vaXplcyB0aGUgZGVjcnlwdCArIGRldmFsdWUtcGFyc2Ugb2YgY29tcGxldGVkXG4gICAqIHN0ZXAgcmVzdWx0cyB0byB0dXJuIE8oTsKyKSByZXBsYXkgaHlkcmF0aW9uIGludG8gTyhOKS4gT21pdHRlZCBieSBjYWxsZXJzXG4gICAqIHRoYXQgcmVwbGF5IG9ubHkgb25jZSAodGhlbiB0aGVyZSBpcyBub3RoaW5nIHRvIHJldXNlKS5cbiAgICovXG4gIHN0ZXBIeWRyYXRpb25DYWNoZT86IFN0ZXBIeWRyYXRpb25DYWNoZVxuKTogUHJvbWlzZTxVaW50OEFycmF5IHwgdW5rbm93bj4ge1xuICByZXR1cm4gdHJhY2UoYHdvcmtmbG93LnJ1biAke3dvcmtmbG93UnVuLndvcmtmbG93TmFtZX1gLCBhc3luYyAoc3BhbikgPT4ge1xuICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93TmFtZSh3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpLFxuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuSWQod29ya2Zsb3dSdW4ucnVuSWQpLFxuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuU3RhdHVzKHdvcmtmbG93UnVuLnN0YXR1cyksXG4gICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFdmVudHNDb3VudChldmVudHMubGVuZ3RoKSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHN0YXJ0ZWRBdCA9IHdvcmtmbG93UnVuLnN0YXJ0ZWRBdDtcbiAgICBpZiAoIXN0YXJ0ZWRBdCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgV29ya2Zsb3cgcnVuIFwiJHt3b3JrZmxvd1J1bi5ydW5JZH1cIiBoYXMgbm8gXCJzdGFydGVkQXRcIiB0aW1lc3RhbXAgKHNob3VsZCBub3QgaGFwcGVuKWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBwb3J0IGJlZm9yZSBjcmVhdGluZyBWTSBjb250ZXh0IHRvIGF2b2lkIGFzeW5jIG9wZXJhdGlvbnNcbiAgICAvLyBhZmZlY3RpbmcgdGhlIGRldGVybWluaXN0aWMgdGltZXN0YW1wXG4gICAgY29uc3QgaXNWZXJjZWwgPSBwcm9jZXNzLmVudi5WRVJDRUxfVVJMICE9PSB1bmRlZmluZWQ7XG4gICAgLy8gTG9hZCBnZXRQb3J0IGxhemlseSB0byBwcmV2ZW50IFR1cmJvcGFjayBmcm9tIHRyYWNpbmcgZ2V0LXBvcnQnc1xuICAgIC8vIGZzIG9wcyAocmVhZGRpciwgcmVhZEZpbGUpIGludG8gdGhlIGZsb3cgcm91dGUgYnVuZGxlLiBUaGUgcmVzb2x2ZWRcbiAgICAvLyBwb3J0IGlzIGNhY2hlZCBwZXIgcHJvY2VzcyAoc2VlIGdldC1wb3J0LWxhenkudHMpLCBzbyB0aGlzIGlzIGNoZWFwXG4gICAgLy8gb24gcmVwbGF5cyBhZnRlciB0aGUgZmlyc3Qg4oCUIGBnZXRQb3J0KClgIG90aGVyd2lzZSByZS1ydW5zIE9TIHBvcnRcbiAgICAvLyBkaXNjb3ZlcnkgKHNwYXduaW5nIGBsc29mYCBvbiBtYWNPUywgfjYwbXMpIG9uIGV2ZXJ5IHJlcGxheS5cbiAgICBjb25zdCB3b3JrZmxvd0Jhc2VVcmwgPSBjcmVhdGVXb3JrZmxvd0Jhc2VVcmwoXG4gICAgICBpc1ZlcmNlbFxuICAgICAgICA/IGBodHRwczovLyR7cHJvY2Vzcy5lbnYuVkVSQ0VMX1VSTH1gXG4gICAgICAgIDogYGh0dHA6Ly9sb2NhbGhvc3Q6JHsoYXdhaXQgZ2V0UG9ydExhenkoKSkgPz8gMzAwMH1gXG4gICAgKTtcblxuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQsXG4gICAgICBnbG9iYWxUaGlzOiB2bUdsb2JhbFRoaXMsXG4gICAgICB1cGRhdGVUaW1lc3RhbXAsXG4gICAgfSA9IGNyZWF0ZUNvbnRleHQoe1xuICAgICAgc2VlZDogYCR7d29ya2Zsb3dSdW4ucnVuSWR9OiR7d29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lfTokeytzdGFydGVkQXR9YCxcbiAgICAgIGZpeGVkVGltZXN0YW1wOiArc3RhcnRlZEF0LFxuICAgIH0pO1xuXG4gICAgY29uc3Qgd29ya2Zsb3dEaXNjb250aW51YXRpb24gPSB3aXRoUmVzb2x2ZXJzPHZvaWQ+KCk7XG5cbiAgICBjb25zdCB1bGlkID0gbW9ub3RvbmljRmFjdG9yeSgoKSA9PiB2bUdsb2JhbFRoaXMuTWF0aC5yYW5kb20oKSk7XG4gICAgY29uc3QgZ2VuZXJhdGVOYW5vaWQgPSBuYW5vaWQuY3VzdG9tUmFuZG9tKG5hbm9pZC51cmxBbHBoYWJldCwgMjEsIChzaXplKSA9PlxuICAgICAgbmV3IFVpbnQ4QXJyYXkoc2l6ZSkubWFwKCgpID0+IDI1NiAqIHZtR2xvYmFsVGhpcy5NYXRoLnJhbmRvbSgpKVxuICAgICk7XG5cbiAgICAvLyBDcmVhdGUgYSBtdXRhYmxlIGhvbGRlciBmb3IgdGhlIHByb21pc2UgcXVldWUgc28gdGhlIEV2ZW50c0NvbnN1bWVyXG4gICAgLy8gY2FuIGFjY2VzcyB0aGUgY3VycmVudCBxdWV1ZSBzdGF0ZSB2aWEgYSBnZXR0ZXIuIFRoZSBxdWV1ZSBpcyBtdXRhdGVkXG4gICAgLy8gYnkgc3RlcC9ob29rL3NsZWVwIGNhbGxiYWNrcyBhcyBldmVudHMgYXJlIHByb2Nlc3NlZC5cbiAgICBjb25zdCBwcm9taXNlUXVldWVIb2xkZXIgPSB7IGN1cnJlbnQ6IFByb21pc2UucmVzb2x2ZSgpIH07XG5cbiAgICBjb25zdCBldmVudHNDb25zdW1lciA9IG5ldyBFdmVudHNDb25zdW1lcihldmVudHMsIHtcbiAgICAgIG9uQ29uc3VtZWRFdmVudDogKGV2ZW50KSA9PiB7XG4gICAgICAgIHVwZGF0ZVRpbWVzdGFtcCgrZXZlbnQuY3JlYXRlZEF0KTtcbiAgICAgIH0sXG4gICAgICBvblVuY29uc3VtZWRFdmVudDogKGV2ZW50KSA9PiB7XG4gICAgICAgIHdvcmtmbG93RGlzY29udGludWF0aW9uLnJlamVjdChcbiAgICAgICAgICBuZXcgUmVwbGF5RGl2ZXJnZW5jZUVycm9yKFxuICAgICAgICAgICAgYFJlcGxheSBjb3VsZCBub3QgY29uc3VtZSBldmVudDogZXZlbnRUeXBlPSR7ZXZlbnQuZXZlbnRUeXBlfSwgY29ycmVsYXRpb25JZD0ke2V2ZW50LmNvcnJlbGF0aW9uSWR9LCBldmVudElkPSR7ZXZlbnQuZXZlbnRJZH0uYCxcbiAgICAgICAgICAgIHsgZXZlbnRJZDogZXZlbnQuZXZlbnRJZCB9XG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIGdldFByb21pc2VRdWV1ZTogKCkgPT4gcHJvbWlzZVF1ZXVlSG9sZGVyLmN1cnJlbnQsXG4gICAgfSk7XG5cbiAgICBjb25zdCB3b3JrZmxvd0NvbnRleHQ6IFdvcmtmbG93T3JjaGVzdHJhdG9yQ29udGV4dCA9IHtcbiAgICAgIHJ1bklkOiB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgIGVuY3J5cHRpb25LZXksXG4gICAgICBnbG9iYWxUaGlzOiB2bUdsb2JhbFRoaXMsXG4gICAgICBvbldvcmtmbG93RXJyb3I6IHdvcmtmbG93RGlzY29udGludWF0aW9uLnJlamVjdCxcbiAgICAgIGV2ZW50c0NvbnN1bWVyLFxuICAgICAgZ2VuZXJhdGVVbGlkOiAoKSA9PiB1bGlkKCtzdGFydGVkQXQpLFxuICAgICAgZ2VuZXJhdGVOYW5vaWQsXG4gICAgICBpbnZvY2F0aW9uc1F1ZXVlOiBuZXcgTWFwKCksXG4gICAgICAvLyBVc2UgZ2V0dGVyL3NldHRlciBzbyB0aGUgRXZlbnRzQ29uc3VtZXIncyBnZXRQcm9taXNlUXVldWUoKSBhbHdheXNcbiAgICAgIC8vIHNlZXMgdGhlIGxhdGVzdCBxdWV1ZSBzdGF0ZSBhcyBpdCdzIG11dGF0ZWQgYnkgc3RlcC9ob29rL3NsZWVwIGNhbGxiYWNrcy5cbiAgICAgIGdldCBwcm9taXNlUXVldWUoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlUXVldWVIb2xkZXIuY3VycmVudDtcbiAgICAgIH0sXG4gICAgICBzZXQgcHJvbWlzZVF1ZXVlKHZhbHVlOiBQcm9taXNlPHZvaWQ+KSB7XG4gICAgICAgIHByb21pc2VRdWV1ZUhvbGRlci5jdXJyZW50ID0gdmFsdWU7XG4gICAgICB9LFxuICAgICAgcGVuZGluZ0RlbGl2ZXJpZXM6IDAsXG4gICAgICBwZW5kaW5nRGVsaXZlcnlCYXJyaWVyczogbmV3IE1hcCgpLFxuICAgICAgc3RlcEh5ZHJhdGlvbkNhY2hlLFxuICAgIH07XG5cbiAgICAvLyBDb25zdW1lIHJ1biBsaWZlY3ljbGUgZXZlbnRzIC0gdGhlc2UgYXJlIHN0cnVjdHVyYWwgZXZlbnRzIHRoYXQgZG9uJ3RcbiAgICAvLyBuZWVkIHNwZWNpYWwgaGFuZGxpbmcgaW4gdGhlIHdvcmtmbG93LCBidXQgbXVzdCBiZSBjb25zdW1lZCB0byBhZHZhbmNlXG4gICAgLy8gcGFzdCB0aGVtIGluIHRoZSBldmVudCBsb2dcbiAgICB3b3JrZmxvd0NvbnRleHQuZXZlbnRzQ29uc3VtZXIuc3Vic2NyaWJlKChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudCkge1xuICAgICAgICByZXR1cm4gRXZlbnRDb25zdW1lclJlc3VsdC5Ob3RDb25zdW1lZDtcbiAgICAgIH1cblxuICAgICAgLy8gQ29uc3VtZSBydW5fY3JlYXRlZCAtIGV2ZXJ5IHJ1biBoYXMgZXhhY3RseSBvbmVcbiAgICAgIGlmIChldmVudC5ldmVudFR5cGUgPT09ICdydW5fY3JlYXRlZCcpIHtcbiAgICAgICAgcmV0dXJuIEV2ZW50Q29uc3VtZXJSZXN1bHQuQ29uc3VtZWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnN1bWUgcnVuX3N0YXJ0ZWQgLSBldmVyeSBydW4gaGFzIGV4YWN0bHkgb25lXG4gICAgICBpZiAoZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX3N0YXJ0ZWQnKSB7XG4gICAgICAgIHJldHVybiBFdmVudENvbnN1bWVyUmVzdWx0LkNvbnN1bWVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gRXZlbnRDb25zdW1lclJlc3VsdC5Ob3RDb25zdW1lZDtcbiAgICB9KTtcblxuICAgIGNvbnN0IHVzZVN0ZXAgPSBjcmVhdGVVc2VTdGVwKHdvcmtmbG93Q29udGV4dCk7XG4gICAgY29uc3QgY3JlYXRlSG9vayA9IGNyZWF0ZUNyZWF0ZUhvb2sod29ya2Zsb3dDb250ZXh0KTtcbiAgICBjb25zdCBzbGVlcCA9IGNyZWF0ZVNsZWVwKHdvcmtmbG93Q29udGV4dCk7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfVVNFX1NURVBdID0gdXNlU3RlcDtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfQ1JFQVRFX0hPT0tdID0gY3JlYXRlSG9vaztcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfU0xFRVBdID0gc2xlZXA7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX0dFVF9TVFJFQU1fSURdID0gKG5hbWVzcGFjZT86IHN0cmluZykgPT5cbiAgICAgIGdldFdvcmtmbG93UnVuU3RyZWFtSWQod29ya2Zsb3dSdW4ucnVuSWQsIG5hbWVzcGFjZSk7XG5cbiAgICAvLyBGb3IgdGhlIHdvcmtmbG93IFZNLCB3ZSBzdG9yZSB0aGUgY29udGV4dCBpbiBhIHN5bWJvbCBvbiB0aGUgYGdsb2JhbFRoaXNgIG9iamVjdFxuICAgIGNvbnN0IGN0eDogV29ya2Zsb3dNZXRhZGF0YSA9IHtcbiAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lLFxuICAgICAgd29ya2Zsb3dSdW5JZDogd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICB3b3JrZmxvd1N0YXJ0ZWRBdDogbmV3IHZtR2xvYmFsVGhpcy5EYXRlKCtzdGFydGVkQXQpLFxuICAgICAgdXJsOiB3b3JrZmxvd0Jhc2VVcmwsXG4gICAgfTtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tXT1JLRkxPV19DT05URVhUX1NZTUJPTF0gPSBjdHg7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1NUQUJMRV9VTElEXSA9IHVsaWQ7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGhhdmUgYSBjb25maWcgb3ZlcnJpZGUgdG8gdXNlIHRoZSBjdXN0b20gZmV0Y2ggc3RlcC5cbiAgICAvLyAgICAgICBGb3Igbm93IGBmZXRjaGAgbXVzdCBiZSBleHBsaWNpdGx5IGltcG9ydGVkIGZyb20gYHdvcmtmbG93YC5cbiAgICB2bUdsb2JhbFRoaXMuZmV0Y2ggPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgdm1HbG9iYWxUaGlzLkVycm9yKFxuICAgICAgICBgR2xvYmFsIFwiZmV0Y2hcIiBpcyB1bmF2YWlsYWJsZSBpbiB3b3JrZmxvdyBmdW5jdGlvbnMuIFVzZSB0aGUgXCJmZXRjaFwiIHN0ZXAgZnVuY3Rpb24gZnJvbSBcIndvcmtmbG93XCIgdG8gbWFrZSBIVFRQIHJlcXVlc3RzLlxcblxcbkxlYXJuIG1vcmU6IGh0dHBzOi8vdXNld29ya2Zsb3cuZGV2L2Vyci8ke0VSUk9SX1NMVUdTLkZFVENIX0lOX1dPUktGTE9XX0ZVTkNUSU9OfWBcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIE92ZXJyaWRlIHRpbWVvdXQvaW50ZXJ2YWwgZnVuY3Rpb25zIHRvIHRocm93IGhlbHBmdWwgZXJyb3JzXG4gICAgLy8gVGhlc2UgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gd29ya2Zsb3cgZnVuY3Rpb25zIGJlY2F1c2UgdGhleSByZWx5IG9uXG4gICAgLy8gYXN5bmNocm9ub3VzIHNjaGVkdWxpbmcgd2hpY2ggYnJlYWtzIGRldGVybWluaXN0aWMgcmVwbGF5XG4gICAgY29uc3QgdGltZW91dEVycm9yTWVzc2FnZSA9XG4gICAgICAnVGltZW91dCBmdW5jdGlvbnMgbGlrZSBcInNldFRpbWVvdXRcIiBhbmQgXCJzZXRJbnRlcnZhbFwiIGFyZSBub3Qgc3VwcG9ydGVkIGluIHdvcmtmbG93IGZ1bmN0aW9ucy4gVXNlIHRoZSBcInNsZWVwXCIgZnVuY3Rpb24gZnJvbSBcIndvcmtmbG93XCIgZm9yIHRpbWUtYmFzZWQgZGVsYXlzLic7XG5cbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuc2V0VGltZW91dCA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuc2V0SW50ZXJ2YWwgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLmNsZWFyVGltZW91dCA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuY2xlYXJJbnRlcnZhbCA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuc2V0SW1tZWRpYXRlID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuVElNRU9VVF9GVU5DVElPTlNfSU5fV09SS0ZMT1csXG4gICAgICB9KTtcbiAgICB9O1xuICAgICh2bUdsb2JhbFRoaXMgYXMgYW55KS5jbGVhckltbWVkaWF0ZSA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIGBSZXF1ZXN0YCBhbmQgYFJlc3BvbnNlYCBhcmUgc3BlY2lhbCBidWlsdC1pbiBjbGFzc2VzIHRoYXQgaW52b2tlIHN0ZXBzXG4gICAgLy8gZm9yIHRoZSBganNvbigpYCwgYHRleHQoKWAgYW5kIGBhcnJheUJ1ZmZlcigpYCBpbnN0YW5jZSBtZXRob2RzXG4gICAgY2xhc3MgUmVxdWVzdCBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuUmVxdWVzdCB7XG4gICAgICBjYWNoZSE6IGdsb2JhbFRoaXMuUmVxdWVzdFsnY2FjaGUnXTtcbiAgICAgIGNyZWRlbnRpYWxzITogZ2xvYmFsVGhpcy5SZXF1ZXN0WydjcmVkZW50aWFscyddO1xuICAgICAgZGVzdGluYXRpb24hOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ2Rlc3RpbmF0aW9uJ107XG4gICAgICBoZWFkZXJzITogSGVhZGVycztcbiAgICAgIGludGVncml0eSE6IHN0cmluZztcbiAgICAgIG1ldGhvZCE6IHN0cmluZztcbiAgICAgIG1vZGUhOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ21vZGUnXTtcbiAgICAgIHJlZGlyZWN0ITogZ2xvYmFsVGhpcy5SZXF1ZXN0WydyZWRpcmVjdCddO1xuICAgICAgcmVmZXJyZXIhOiBzdHJpbmc7XG4gICAgICByZWZlcnJlclBvbGljeSE6IGdsb2JhbFRoaXMuUmVxdWVzdFsncmVmZXJyZXJQb2xpY3knXTtcbiAgICAgIHVybCE6IHN0cmluZztcbiAgICAgIGtlZXBhbGl2ZSE6IGJvb2xlYW47XG4gICAgICBzaWduYWwhOiBBYm9ydFNpZ25hbDtcbiAgICAgIGR1cGxleCE6ICdoYWxmJztcbiAgICAgIGJvZHkhOiBSZWFkYWJsZVN0cmVhbTxhbnk+IHwgbnVsbDtcblxuICAgICAgY29uc3RydWN0b3IoaW5wdXQ6IGFueSwgaW5pdD86IFJlcXVlc3RJbml0KSB7XG4gICAgICAgIC8vIEhhbmRsZSBVUkwgaW5wdXRcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgfHwgaW5wdXQgaW5zdGFuY2VvZiB2bUdsb2JhbFRoaXMuVVJMKSB7XG4gICAgICAgICAgY29uc3QgdXJsU3RyaW5nID0gU3RyaW5nKGlucHV0KTtcbiAgICAgICAgICAvLyBWYWxpZGF0ZSBVUkwgZm9ybWF0XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG5ldyB2bUdsb2JhbFRoaXMuVVJMKHVybFN0cmluZyk7XG4gICAgICAgICAgICB0aGlzLnVybCA9IHVybFN0cmluZztcbiAgICAgICAgICB9IGNhdGNoIChjYXVzZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRmFpbGVkIHRvIHBhcnNlIFVSTCBmcm9tICR7dXJsU3RyaW5nfWAsIHtcbiAgICAgICAgICAgICAgY2F1c2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSW5wdXQgaXMgYSBSZXF1ZXN0IG9iamVjdCAtIGNsb25lIGl0cyBwcm9wZXJ0aWVzXG4gICAgICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmw7XG4gICAgICAgICAgaWYgKCFpbml0KSB7XG4gICAgICAgICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZDtcbiAgICAgICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbnB1dC5oZWFkZXJzKTtcbiAgICAgICAgICAgIHRoaXMuYm9keSA9IGlucHV0LmJvZHk7XG4gICAgICAgICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlO1xuICAgICAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzO1xuICAgICAgICAgICAgdGhpcy5jYWNoZSA9IGlucHV0LmNhY2hlO1xuICAgICAgICAgICAgdGhpcy5yZWRpcmVjdCA9IGlucHV0LnJlZGlyZWN0O1xuICAgICAgICAgICAgdGhpcy5yZWZlcnJlciA9IGlucHV0LnJlZmVycmVyO1xuICAgICAgICAgICAgdGhpcy5yZWZlcnJlclBvbGljeSA9IGlucHV0LnJlZmVycmVyUG9saWN5O1xuICAgICAgICAgICAgdGhpcy5pbnRlZ3JpdHkgPSBpbnB1dC5pbnRlZ3JpdHk7XG4gICAgICAgICAgICB0aGlzLmtlZXBhbGl2ZSA9IGlucHV0LmtlZXBhbGl2ZTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFsID0gaW5wdXQuc2lnbmFsO1xuICAgICAgICAgICAgdGhpcy5kdXBsZXggPSBpbnB1dC5kdXBsZXg7XG4gICAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gaW5wdXQuZGVzdGluYXRpb247XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElmIGluaXQgaXMgcHJvdmlkZWQsIG1lcmdlOiB1c2Ugc291cmNlIHByb3BlcnRpZXMsIHRoZW4gb3ZlcnJpZGUgd2l0aCBpbml0XG4gICAgICAgICAgLy8gQ29weSBhbGwgcHJvcGVydGllcyBmcm9tIHRoZSBzb3VyY2UgUmVxdWVzdCBmaXJzdFxuICAgICAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kO1xuICAgICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbnB1dC5oZWFkZXJzKTtcbiAgICAgICAgICB0aGlzLmJvZHkgPSBpbnB1dC5ib2R5O1xuICAgICAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGU7XG4gICAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzO1xuICAgICAgICAgIHRoaXMuY2FjaGUgPSBpbnB1dC5jYWNoZTtcbiAgICAgICAgICB0aGlzLnJlZGlyZWN0ID0gaW5wdXQucmVkaXJlY3Q7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlciA9IGlucHV0LnJlZmVycmVyO1xuICAgICAgICAgIHRoaXMucmVmZXJyZXJQb2xpY3kgPSBpbnB1dC5yZWZlcnJlclBvbGljeTtcbiAgICAgICAgICB0aGlzLmludGVncml0eSA9IGlucHV0LmludGVncml0eTtcbiAgICAgICAgICB0aGlzLmtlZXBhbGl2ZSA9IGlucHV0LmtlZXBhbGl2ZTtcbiAgICAgICAgICB0aGlzLnNpZ25hbCA9IGlucHV0LnNpZ25hbDtcbiAgICAgICAgICB0aGlzLmR1cGxleCA9IGlucHV0LmR1cGxleDtcbiAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gaW5wdXQuZGVzdGluYXRpb247XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPdmVycmlkZSB3aXRoIGluaXQgb3B0aW9ucyBpZiBwcm92aWRlZFxuICAgICAgICAvLyBTZXQgbWV0aG9kXG4gICAgICAgIGlmIChpbml0Py5tZXRob2QpIHtcbiAgICAgICAgICB0aGlzLm1ldGhvZCA9IGluaXQubWV0aG9kLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMubWV0aG9kICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIEZhbGxiYWNrIHRvIGRlZmF1bHQgZm9yIHN0cmluZyBpbnB1dCBjYXNlXG4gICAgICAgICAgdGhpcy5tZXRob2QgPSAnR0VUJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBoZWFkZXJzXG4gICAgICAgIGlmIChpbml0Py5oZWFkZXJzKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKGluaXQuaGVhZGVycyk7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgIGlucHV0IGluc3RhbmNlb2Ygdm1HbG9iYWxUaGlzLlVSTFxuICAgICAgICApIHtcbiAgICAgICAgICAvLyBGb3Igc3RyaW5nL1VSTCBpbnB1dCwgY3JlYXRlIGVtcHR5IGhlYWRlcnNcbiAgICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBvdGhlciBwcm9wZXJ0aWVzIHdpdGggaW5pdCB2YWx1ZXMgb3IgZGVmYXVsdHNcbiAgICAgICAgaWYgKGluaXQ/Lm1vZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMubW9kZSA9IGluaXQubW9kZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5tb2RlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMubW9kZSA9ICdjb3JzJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5jcmVkZW50aWFscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGluaXQuY3JlZGVudGlhbHM7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuY3JlZGVudGlhbHMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9ICdzYW1lLW9yaWdpbic7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBgYW55YCBjYXN0IGhlcmUgYmVjYXVzZSBAdHlwZXMvbm9kZSB2MjIgZG9lcyBub3QgeWV0IGhhdmUgYGNhY2hlYFxuICAgICAgICBpZiAoKGluaXQgYXMgYW55KT8uY2FjaGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuY2FjaGUgPSAoaW5pdCBhcyBhbnkpLmNhY2hlO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNhY2hlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuY2FjaGUgPSAnZGVmYXVsdCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8ucmVkaXJlY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMucmVkaXJlY3QgPSBpbml0LnJlZGlyZWN0O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnJlZGlyZWN0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMucmVkaXJlY3QgPSAnZm9sbG93JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5yZWZlcnJlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlciA9IGluaXQucmVmZXJyZXI7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucmVmZXJyZXIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlciA9ICdhYm91dDpjbGllbnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LnJlZmVycmVyUG9saWN5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLnJlZmVycmVyUG9saWN5ID0gaW5pdC5yZWZlcnJlclBvbGljeTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZWZlcnJlclBvbGljeSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLnJlZmVycmVyUG9saWN5ID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8uaW50ZWdyaXR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLmludGVncml0eSA9IGluaXQuaW50ZWdyaXR5O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmludGVncml0eSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmludGVncml0eSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LmtlZXBhbGl2ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5rZWVwYWxpdmUgPSBpbml0LmtlZXBhbGl2ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5rZWVwYWxpdmUgIT09ICdib29sZWFuJykge1xuICAgICAgICAgIHRoaXMua2VlcGFsaXZlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8uc2lnbmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gQWJvcnRTaWduYWwgc3R1YlxuICAgICAgICAgIHRoaXMuc2lnbmFsID0gaW5pdC5zaWduYWw7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc2lnbmFsKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEFib3J0U2lnbmFsIHN0dWJcbiAgICAgICAgICB0aGlzLnNpZ25hbCA9IHsgYWJvcnRlZDogZmFsc2UgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5kdXBsZXgpIHtcbiAgICAgICAgICB0aGlzLmR1cGxleCA9ICdoYWxmJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5kZXN0aW5hdGlvbikge1xuICAgICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSAnZG9jdW1lbnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYm9keSA9IGluaXQ/LmJvZHk7XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCBHRVQvSEVBRCBtZXRob2RzIGRvbid0IGhhdmUgYSBib2R5XG4gICAgICAgIGlmIChcbiAgICAgICAgICBib2R5ICE9PSBudWxsICYmXG4gICAgICAgICAgYm9keSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBSZXF1ZXN0IHdpdGggR0VUL0hFQUQgbWV0aG9kIGNhbm5vdCBoYXZlIGJvZHkuYCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdG9yZSB0aGUgb3JpZ2luYWwgQm9keUluaXQgZm9yIHNlcmlhbGl6YXRpb25cbiAgICAgICAgaWYgKGJvZHkgIT09IG51bGwgJiYgYm9keSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQ3JlYXRlIGEgXCJmYWtlXCIgUmVhZGFibGVTdHJlYW0gdGhhdCBzdG9yZXMgdGhlIG9yaWdpbmFsIGJvZHlcbiAgICAgICAgICAvLyBUaGlzIGF2b2lkcyBkb2luZyBhc3luYyB3b3JrIGR1cmluZyB3b3JrZmxvdyByZXBsYXlcbiAgICAgICAgICB0aGlzLmJvZHkgPSBPYmplY3QuY3JlYXRlKHZtR2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbS5wcm90b3R5cGUsIHtcbiAgICAgICAgICAgIFtCT0RZX0lOSVRfU1lNQk9MXToge1xuICAgICAgICAgICAgICB2YWx1ZTogYm9keSxcbiAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmJvZHkgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNsb25lKCk6IFJlcXVlc3Qge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGdldCBib2R5VXNlZCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBpbXBsZW1lbnQgdGhlc2VcbiAgICAgIGJsb2IhOiAoKSA9PiBQcm9taXNlPEJsb2I+O1xuICAgICAgZm9ybURhdGEhOiAoKSA9PiBQcm9taXNlPEZvcm1EYXRhPjtcblxuICAgICAgYXJyYXlCdWZmZXIhOiAoKSA9PiBQcm9taXNlPEFycmF5QnVmZmVyPjtcbiAgICAgIGpzb24hOiAoKSA9PiBQcm9taXNlPGFueT47XG4gICAgICB0ZXh0ITogKCkgPT4gUHJvbWlzZTxzdHJpbmc+O1xuXG4gICAgICBhc3luYyBieXRlcygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGF3YWl0IHRoaXMuYXJyYXlCdWZmZXIoKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHZtR2xvYmFsVGhpcy5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFJlcXVlc3QucHJvdG90eXBlLCB7XG4gICAgICBhcnJheUJ1ZmZlcjoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgQXJyYXlCdWZmZXI+KCdfX2J1aWx0aW5fcmVzcG9uc2VfYXJyYXlfYnVmZmVyJyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgICAganNvbjoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgYW55PignX19idWlsdGluX3Jlc3BvbnNlX2pzb24nKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICB0ZXh0OiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBzdHJpbmc+KCdfX2J1aWx0aW5fcmVzcG9uc2VfdGV4dCcpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNsYXNzIFJlc3BvbnNlIGltcGxlbWVudHMgZ2xvYmFsVGhpcy5SZXNwb25zZSB7XG4gICAgICB0eXBlITogZ2xvYmFsVGhpcy5SZXNwb25zZVsndHlwZSddO1xuICAgICAgdXJsITogc3RyaW5nO1xuICAgICAgc3RhdHVzITogbnVtYmVyO1xuICAgICAgc3RhdHVzVGV4dCE6IHN0cmluZztcbiAgICAgIGJvZHkhOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PiB8IG51bGw7XG4gICAgICBoZWFkZXJzITogSGVhZGVycztcbiAgICAgIHJlZGlyZWN0ZWQhOiBib29sZWFuO1xuXG4gICAgICBjb25zdHJ1Y3Rvcihib2R5PzogYW55LCBpbml0PzogUmVzcG9uc2VJbml0KSB7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gaW5pdD8uc3RhdHVzID8/IDIwMDtcbiAgICAgICAgdGhpcy5zdGF0dXNUZXh0ID0gaW5pdD8uc3RhdHVzVGV4dCA/PyAnJztcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKGluaXQ/LmhlYWRlcnMpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCc7XG4gICAgICAgIHRoaXMudXJsID0gJyc7XG4gICAgICAgIHRoaXMucmVkaXJlY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgbnVsbC1ib2R5IHN0YXR1cyBjb2RlcyBkb24ndCBoYXZlIGEgYm9keVxuICAgICAgICAvLyBQZXIgSFRUUCBzcGVjOiAyMDQgKE5vIENvbnRlbnQpLCAyMDUgKFJlc2V0IENvbnRlbnQpLCBhbmQgMzA0IChOb3QgTW9kaWZpZWQpXG4gICAgICAgIGlmIChcbiAgICAgICAgICBib2R5ICE9PSBudWxsICYmXG4gICAgICAgICAgYm9keSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgKHRoaXMuc3RhdHVzID09PSAyMDQgfHwgdGhpcy5zdGF0dXMgPT09IDIwNSB8fCB0aGlzLnN0YXR1cyA9PT0gMzA0KVxuICAgICAgICApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgYFJlc3BvbnNlIGNvbnN0cnVjdG9yOiBJbnZhbGlkIHJlc3BvbnNlIHN0YXR1cyBjb2RlICR7dGhpcy5zdGF0dXN9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdG9yZSB0aGUgb3JpZ2luYWwgQm9keUluaXQgZm9yIHNlcmlhbGl6YXRpb25cbiAgICAgICAgaWYgKGJvZHkgIT09IG51bGwgJiYgYm9keSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQ3JlYXRlIGEgXCJmYWtlXCIgUmVhZGFibGVTdHJlYW0gdGhhdCBzdG9yZXMgdGhlIG9yaWdpbmFsIGJvZHlcbiAgICAgICAgICAvLyBUaGlzIGF2b2lkcyBkb2luZyBhc3luYyB3b3JrIGR1cmluZyB3b3JrZmxvdyByZXBsYXlcbiAgICAgICAgICB0aGlzLmJvZHkgPSBPYmplY3QuY3JlYXRlKHZtR2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbS5wcm90b3R5cGUsIHtcbiAgICAgICAgICAgIFtCT0RZX0lOSVRfU1lNQk9MXToge1xuICAgICAgICAgICAgICB2YWx1ZTogYm9keSxcbiAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmJvZHkgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IGltcGxlbWVudCB0aGVzZVxuICAgICAgY2xvbmUhOiAoKSA9PiBSZXNwb25zZTtcbiAgICAgIGJsb2IhOiAoKSA9PiBQcm9taXNlPGdsb2JhbFRoaXMuQmxvYj47XG4gICAgICBmb3JtRGF0YSE6ICgpID0+IFByb21pc2U8Z2xvYmFsVGhpcy5Gb3JtRGF0YT47XG5cbiAgICAgIGdldCBvaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMDtcbiAgICAgIH1cblxuICAgICAgZ2V0IGJvZHlVc2VkKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGFycmF5QnVmZmVyITogKCkgPT4gUHJvbWlzZTxBcnJheUJ1ZmZlcj47XG4gICAgICBqc29uITogKCkgPT4gUHJvbWlzZTxhbnk+O1xuICAgICAgdGV4dCE6ICgpID0+IFByb21pc2U8c3RyaW5nPjtcblxuICAgICAgYXN5bmMgYnl0ZXMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCB0aGlzLmFycmF5QnVmZmVyKCkpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMganNvbihkYXRhOiBhbnksIGluaXQ/OiBSZXNwb25zZUluaXQpOiBSZXNwb25zZSB7XG4gICAgICAgIGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbml0Py5oZWFkZXJzKTtcbiAgICAgICAgaWYgKCFoZWFkZXJzLmhhcygnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgICBoZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHsgLi4uaW5pdCwgaGVhZGVycyB9KTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGVycm9yKCk6IFJlc3BvbnNlIHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgcmVkaXJlY3QodXJsOiBzdHJpbmcgfCBVUkwsIHN0YXR1czogbnVtYmVyID0gMzAyKTogUmVzcG9uc2Uge1xuICAgICAgICAvLyBWYWxpZGF0ZSBzdGF0dXMgY29kZSAtIG9ubHkgc3BlY2lmaWMgcmVkaXJlY3QgY29kZXMgYXJlIGFsbG93ZWRcbiAgICAgICAgaWYgKCFbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdLmluY2x1ZGVzKHN0YXR1cykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcbiAgICAgICAgICAgIGBJbnZhbGlkIHJlZGlyZWN0IHN0YXR1cyBjb2RlOiAke3N0YXR1c30uIE11c3QgYmUgb25lIG9mOiAzMDEsIDMwMiwgMzAzLCAzMDcsIDMwOGBcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIHJlc3BvbnNlIHdpdGggTG9jYXRpb24gaGVhZGVyXG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoKTtcbiAgICAgICAgaGVhZGVycy5zZXQoJ0xvY2F0aW9uJywgU3RyaW5nKHVybCkpO1xuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gT2JqZWN0LmNyZWF0ZShSZXNwb25zZS5wcm90b3R5cGUpO1xuICAgICAgICByZXNwb25zZS5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHJlc3BvbnNlLnN0YXR1c1RleHQgPSAnJztcbiAgICAgICAgcmVzcG9uc2UuaGVhZGVycyA9IGhlYWRlcnM7XG4gICAgICAgIHJlc3BvbnNlLmJvZHkgPSBudWxsO1xuICAgICAgICByZXNwb25zZS50eXBlID0gJ2RlZmF1bHQnO1xuICAgICAgICByZXNwb25zZS51cmwgPSAnJztcbiAgICAgICAgcmVzcG9uc2UucmVkaXJlY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdm1HbG9iYWxUaGlzLlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhSZXNwb25zZS5wcm90b3R5cGUsIHtcbiAgICAgIGFycmF5QnVmZmVyOiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBBcnJheUJ1ZmZlcj4oJ19fYnVpbHRpbl9yZXNwb25zZV9hcnJheV9idWZmZXInKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBqc29uOiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBhbnk+KCdfX2J1aWx0aW5fcmVzcG9uc2VfanNvbicpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHRleHQ6IHtcbiAgICAgICAgdmFsdWU6IHVzZVN0ZXA8W10sIHN0cmluZz4oJ19fYnVpbHRpbl9yZXNwb25zZV90ZXh0JyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY2xhc3MgUmVhZGFibGVTdHJlYW08VD4gaW1wbGVtZW50cyBnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtPFQ+IHtcbiAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGdldCBsb2NrZWQoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgY2FuY2VsKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgZ2V0UmVhZGVyKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgcGlwZVRocm91Z2goKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBwaXBlVG8oKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICB0ZWUoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZXMoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgZnJvbSgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW0gPSBSZWFkYWJsZVN0cmVhbTtcblxuICAgIGNsYXNzIFdyaXRhYmxlU3RyZWFtPFQ+IGltcGxlbWVudHMgZ2xvYmFsVGhpcy5Xcml0YWJsZVN0cmVhbTxUPiB7XG4gICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXQgbG9ja2VkKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGFib3J0KCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgY2xvc2UoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXRXcml0ZXIoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW0gPSBXcml0YWJsZVN0cmVhbTtcblxuICAgIGNsYXNzIFRyYW5zZm9ybVN0cmVhbTxJLCBPPiBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuVHJhbnNmb3JtU3RyZWFtPEksIE8+IHtcbiAgICAgIHJlYWRhYmxlOiBnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtPE8+O1xuICAgICAgd3JpdGFibGU6IGdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW08ST47XG5cbiAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHZtR2xvYmFsVGhpcy5UcmFuc2Zvcm1TdHJlYW0gPSBUcmFuc2Zvcm1TdHJlYW07XG5cbiAgICAvLyBFdmVudHVhbGx5IHdlJ2xsIHByb2JhYmx5IHdhbnQgdG8gcHJvdmlkZSBvdXIgb3duIGBjb25zb2xlYCBvYmplY3QsXG4gICAgLy8gYnV0IGZvciBub3cgd2UnbGwganVzdCBleHBvc2UgdGhlIGdsb2JhbCBvbmUuXG4gICAgdm1HbG9iYWxUaGlzLmNvbnNvbGUgPSBnbG9iYWxUaGlzLmNvbnNvbGU7XG5cbiAgICAvLyBIQUNLOiBwcm9wYWdhdGUgc3ltYm9sIG5lZWRlZCBmb3IgQUkgZ2F0ZXdheSB1c2FnZVxuICAgIGNvbnN0IFNZTUJPTF9GT1JfUkVRX0NPTlRFWFQgPSBTeW1ib2wuZm9yKCdAdmVyY2VsL3JlcXVlc3QtY29udGV4dCcpO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tTWU1CT0xfRk9SX1JFUV9DT05URVhUXSA9IChnbG9iYWxUaGlzIGFzIGFueSlbXG4gICAgICBTWU1CT0xfRk9SX1JFUV9DT05URVhUXG4gICAgXTtcblxuICAgIC8vIEdldCBhIHJlZmVyZW5jZSB0byB0aGUgdXNlci1kZWZpbmVkIHdvcmtmbG93IGZ1bmN0aW9uLlxuICAgIC8vIFRoZSBmaWxlbmFtZSBwYXJhbWV0ZXIgZW5zdXJlcyBzdGFjayB0cmFjZXMgc2hvdyBhIG1lYW5pbmdmdWwgbmFtZVxuICAgIC8vIChlLmcuLCBcImV4YW1wbGUvd29ya2Zsb3dzLzk5X2UyZS50c1wiKSBpbnN0ZWFkIG9mIFwiZXZhbG1hY2hpbmUuPGFub255bW91cz5cIi5cbiAgICBjb25zdCBwYXJzZWROYW1lID0gcGFyc2VXb3JrZmxvd05hbWUod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKTtcbiAgICBjb25zdCBmaWxlbmFtZSA9IHBhcnNlZE5hbWU/Lm1vZHVsZVNwZWNpZmllciB8fCB3b3JrZmxvd1J1bi53b3JrZmxvd05hbWU7XG5cbiAgICAvLyBFdmFsdWF0ZSB0aGUgd29ya2Zsb3cgYnVuZGxlIGFnYWluc3QgdGhlIGZyZXNoIGNvbnRleHQgdXNpbmcgYVxuICAgIC8vIHByb2Nlc3Mtd2lkZSBjYWNoZSBvZiB0aGUgY29tcGlsZWQgYHZtLlNjcmlwdGAuIFRoZSBidW5kbGUgaXMgdGhlIHNhbWVcbiAgICAvLyBzdHJpbmcgZm9yIGV2ZXJ5IHJlcGxheSBhbmQgZXZlcnkgaW52b2NhdGlvbiBpbiB0aGlzIHByb2Nlc3MsIGFuZFxuICAgIC8vIGNvbXBpbGF0aW9uIGlzIGEgcHVyZSBmdW5jdGlvbiBvZiBgKGNvZGUsIGZpbGVuYW1lKWAsIHNvIHJldXNpbmcgdGhlXG4gICAgLy8gY29tcGlsZWQgU2NyaXB0IGFjcm9zcyByZXBsYXlzIGlzIGRldGVybWluaXNtLXNhZmU6IGl0IHByb2R1Y2VzIHRoZSBzYW1lXG4gICAgLy8gd29ya2Zsb3cgZnVuY3Rpb24gYW5kIHRoZSBzYW1lIGBmaWxlbmFtZWAgc291cmNlIGF0dHJpYnV0aW9uIGFzXG4gICAgLy8gcmUtcGFyc2luZyB0aGUgYnVuZGxlIGV2ZXJ5IHRpbWUsIGJ1dCBza2lwcyB0aGUgKGV4cGVuc2l2ZSkgcmUtcGFyc2UuXG4gICAgLy8gRXZhbHVhdGluZyB0aGUgYnVuZGxlIHJlZ2lzdGVycyBldmVyeSB3b3JrZmxvdyBvblxuICAgIC8vIGBnbG9iYWxUaGlzLl9fcHJpdmF0ZV93b3JrZmxvd3NgOyB0aGUgdHJhaWxpbmcgbG9va3VwIGV4cHJlc3Npb24gdGhlblxuICAgIC8vIHJldHJpZXZlcyB0aGUgcmVxdWVzdGVkIHdvcmtmbG93IGZ1bmN0aW9uLiBUaGUgbG9va3VwIGlzIGV2YWx1YXRlZCBhcyBhXG4gICAgLy8gc2VwYXJhdGUgY2FjaGVkIFNjcmlwdCB1bmRlciB0aGUgc2FtZSBgZmlsZW5hbWVgLCBzbyBlcnJvciBzdGFjayBmcmFtZXNcbiAgICAvLyBzdGlsbCBhdHRyaWJ1dGUgdG8gdGhlIHdvcmtmbG93J3Mgc291cmNlIGZpbGUgKGByZW1hcEVycm9yU3RhY2tgIGtleXMgb25cbiAgICAvLyBgZmlsZW5hbWVgKS4gVGhlIG9uZSBiZWhhdmlvdXJhbCBkaWZmZXJlbmNlIGZyb20gdGhlIHByZXZpb3VzXG4gICAgLy8gc2luZ2xlLWNvbWJpbmVkLXN0cmluZyBhcHByb2FjaCBpcyB0aGUgKmxpbmUgbnVtYmVyKiBvZiBhbiBlcnJvciB0aHJvd25cbiAgICAvLyBieSB0aGUgbG9va3VwIGV4cHJlc3Npb24gaXRzZWxmOiBpdCBub3cgcmVwb3J0cyBsaW5lIDEgb2YgdGhlIGxvb2t1cFxuICAgIC8vIFNjcmlwdCByYXRoZXIgdGhhbiB0aGUgbGluZSBqdXN0IHBhc3QgdGhlIGVuZCBvZiB0aGUgYnVuZGxlLiBUaGF0IHBhdGhcbiAgICAvLyBpcyByYXJlIChpdCByZXF1aXJlcyB0aGUgbG9va3VwIGA/LmdldCguLi4pYCBleHByZXNzaW9uIHRvIHRocm93KSBhbmRcbiAgICAvLyBkb2VzIG5vdCBhZmZlY3QgdGhlIHdvcmtmbG93IGZ1bmN0aW9uIG9yIHJlcGxheSBkZXRlcm1pbmlzbS5cbiAgICBydW5DYWNoZWRXb3JrZmxvd1NjcmlwdCh3b3JrZmxvd0NvZGUsIGZpbGVuYW1lLCBjb250ZXh0KTtcbiAgICBjb25zdCB3b3JrZmxvd0ZuID0gcnVuQ2FjaGVkV29ya2Zsb3dTY3JpcHQoXG4gICAgICBgZ2xvYmFsVGhpcy5fX3ByaXZhdGVfd29ya2Zsb3dzPy5nZXQoJHtKU09OLnN0cmluZ2lmeSh3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpfSlgLFxuICAgICAgZmlsZW5hbWUsXG4gICAgICBjb250ZXh0XG4gICAgKTtcblxuICAgIGlmICh0eXBlb2Ygd29ya2Zsb3dGbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93Tm90UmVnaXN0ZXJlZEVycm9yKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSk7XG4gICAgfVxuXG4gICAgLy8gQ2hhaW4gd29ya2Zsb3cgYXJndW1lbnQgaHlkcmF0aW9uIG9udG8gdGhlIHByb21pc2VRdWV1ZSBzbyB0aGF0IHRoZVxuICAgIC8vIHVuY29uc3VtZWQgZXZlbnQgY2hlY2sgKHdoaWNoIHdhaXRzIGZvciB0aGUgcXVldWUgdG8gZHJhaW4pIGRvZXNuJ3RcbiAgICAvLyBmaXJlIGR1cmluZyB0aGUgYXN5bmMgZ2FwIGJldHdlZW4gcnVuX3N0YXJ0ZWQgY29uc3VtcHRpb24gYW5kIHRoZVxuICAgIC8vIHdvcmtmbG93IGZ1bmN0aW9uIHN1YnNjcmliaW5nIGl0cyBmaXJzdCBzdGVwIGNhbGxiYWNrcy5cbiAgICBsZXQgYXJnczogdW5rbm93bltdID0gW107XG4gICAgd29ya2Zsb3dDb250ZXh0LnByb21pc2VRdWV1ZSA9IHdvcmtmbG93Q29udGV4dC5wcm9taXNlUXVldWUudGhlbihcbiAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXJncyA9IGF3YWl0IGh5ZHJhdGVXb3JrZmxvd0FyZ3VtZW50cyhcbiAgICAgICAgICB3b3JrZmxvd1J1bi5pbnB1dCxcbiAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgICBlbmNyeXB0aW9uS2V5LFxuICAgICAgICAgIHZtR2xvYmFsVGhpc1xuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gICAgYXdhaXQgd29ya2Zsb3dDb250ZXh0LnByb21pc2VRdWV1ZTtcblxuICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93QXJndW1lbnRzQ291bnQoYXJncy5sZW5ndGgpLFxuICAgIH0pO1xuXG4gICAgLy8gSW52b2tlIHVzZXIgd29ya2Zsb3dcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUHJvbWlzZS5yYWNlKFtcbiAgICAgICAgd29ya2Zsb3dGbiguLi5hcmdzKSxcbiAgICAgICAgd29ya2Zsb3dEaXNjb250aW51YXRpb24ucHJvbWlzZSxcbiAgICAgIF0pO1xuXG4gICAgICBjb25zdCBkZWh5ZHJhdGVkID0gYXdhaXQgZGVoeWRyYXRlV29ya2Zsb3dSZXR1cm5WYWx1ZShcbiAgICAgICAgcmVzdWx0LFxuICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgZW5jcnlwdGlvbktleSxcbiAgICAgICAgdm1HbG9iYWxUaGlzXG4gICAgICApO1xuXG4gICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UmVzdWx0VHlwZSh0eXBlb2YgcmVzdWx0KSxcbiAgICAgIH0pO1xuXG4gICAgICB3YXJuUGVuZGluZ1F1ZXVlSXRlbXMoXG4gICAgICAgIHdvcmtmbG93UnVuLnJ1bklkLFxuICAgICAgICB3b3JrZmxvd0NvbnRleHQuaW52b2NhdGlvbnNRdWV1ZSxcbiAgICAgICAgJ2NvbXBsZXRlZCdcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkZWh5ZHJhdGVkO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gQ29udHJvbC1mbG93IHNpZ25hbHMgYXJlIGhhbmRsZWQgYnkgdGhlIHJ1bnRpbWUgYW5kIGRvIG5vdCBtZWFuIHRoZVxuICAgICAgLy8gd29ya2Zsb3cgaGFzIHRlcm1pbmFsbHkgZmFpbGVkLlxuICAgICAgaWYgKFdvcmtmbG93U3VzcGVuc2lvbi5pcyhlcnIpIHx8IFJlcGxheURpdmVyZ2VuY2VFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cblxuICAgICAgd2FyblBlbmRpbmdRdWV1ZUl0ZW1zKFxuICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgd29ya2Zsb3dDb250ZXh0Lmludm9jYXRpb25zUXVldWUsXG4gICAgICAgICdmYWlsZWQnXG4gICAgICApO1xuXG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9KTtcbn1cbiIsICJpbXBvcnQge1xuICBFUlJPUl9TTFVHUyxcbiAgSG9va05vdEZvdW5kRXJyb3IsXG4gIFdvcmtmbG93UnVudGltZUVycm9yLFxufSBmcm9tICdAd29ya2Zsb3cvZXJyb3JzJztcbmltcG9ydCB7XG4gIHR5cGUgSG9vayxcbiAgaXNMZWdhY3lTcGVjVmVyc2lvbixcbiAgU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gIFNQRUNfVkVSU0lPTl9MRUdBQ1ksXG4gIHR5cGUgV29ya2Zsb3dJbnZva2VQYXlsb2FkLFxuICB0eXBlIFdvcmtmbG93UnVuLFxufSBmcm9tICdAd29ya2Zsb3cvd29ybGQnO1xuaW1wb3J0IHsgZ2V0UnVuQ2FwYWJpbGl0aWVzIH0gZnJvbSAnLi4vY2FwYWJpbGl0aWVzLmpzJztcbmltcG9ydCB7IHR5cGUgQ3J5cHRvS2V5LCBpbXBvcnRLZXkgfSBmcm9tICcuLi9lbmNyeXB0aW9uLmpzJztcbmltcG9ydCB7IHJ1bnRpbWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIuanMnO1xuaW1wb3J0IHtcbiAgZGVoeWRyYXRlU3RlcFJldHVyblZhbHVlLFxuICBoeWRyYXRlU3RlcEFyZ3VtZW50cyxcbiAgU2VyaWFsaXphdGlvbkZvcm1hdCxcbn0gZnJvbSAnLi4vc2VyaWFsaXphdGlvbi5qcyc7XG5pbXBvcnQgeyBXRUJIT09LX1JFU1BPTlNFX1dSSVRBQkxFIH0gZnJvbSAnLi4vc3ltYm9scy5qcyc7XG5pbXBvcnQgKiBhcyBBdHRyaWJ1dGUgZnJvbSAnLi4vdGVsZW1ldHJ5L3NlbWFudGljLWNvbnZlbnRpb25zLmpzJztcbmltcG9ydCB7IGdldFNwYW5Db250ZXh0Rm9yVHJhY2VDYXJyaWVyLCB0cmFjZSB9IGZyb20gJy4uL3RlbGVtZXRyeS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JrZmxvd1F1ZXVlTmFtZSB9IGZyb20gJy4vaGVscGVycy5qcyc7XG5pbXBvcnQgeyBzYWZlV2FpdFVudGlsLCB3YWl0ZWRVbnRpbCB9IGZyb20gJy4vd2FpdC11bnRpbC5qcyc7XG5pbXBvcnQgeyBnZXRXb3JsZCB9IGZyb20gJy4vd29ybGQuanMnO1xuXG5hc3luYyBmdW5jdGlvbiBtYXRlcmlhbGl6ZVJlc3BvbnNlQm9keShyZXNwb25zZTogUmVzcG9uc2UpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGlmICghcmVzcG9uc2UuYm9keSkge1xuICAgIHJldHVybiByZXNwb25zZTtcbiAgfVxuXG4gIGNvbnN0IGJvZHkgPSBhd2FpdCByZXNwb25zZS5hcnJheUJ1ZmZlcigpO1xuICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHtcbiAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgIGhlYWRlcnM6IHJlc3BvbnNlLmhlYWRlcnMsXG4gIH0pO1xufVxuXG4vKipcbiAqIEludGVybmFsIGhlbHBlciB0aGF0IHJldHVybnMgdGhlIGhvb2ssIHRoZSBhc3NvY2lhdGVkIHdvcmtmbG93IHJ1bixcbiAqIGFuZCB0aGUgcmVzb2x2ZWQgZW5jcnlwdGlvbiBrZXkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEhvb2tCeVRva2VuV2l0aEtleSh0b2tlbjogc3RyaW5nKTogUHJvbWlzZTx7XG4gIGhvb2s6IEhvb2s7XG4gIHJ1bjogV29ya2Zsb3dSdW47XG4gIGVuY3J5cHRpb25LZXk6IENyeXB0b0tleSB8IHVuZGVmaW5lZDtcbn0+IHtcbiAgY29uc3Qgd29ybGQgPSBnZXRXb3JsZCgpO1xuICBjb25zdCBob29rID0gYXdhaXQgd29ybGQuaG9va3MuZ2V0QnlUb2tlbih0b2tlbik7XG4gIGNvbnN0IHJ1biA9IGF3YWl0IHdvcmxkLnJ1bnMuZ2V0KGhvb2sucnVuSWQpO1xuICBjb25zdCByYXdLZXkgPSBhd2FpdCB3b3JsZC5nZXRFbmNyeXB0aW9uS2V5Rm9yUnVuPy4ocnVuKTtcbiAgY29uc3QgZW5jcnlwdGlvbktleSA9IHJhd0tleSA/IGF3YWl0IGltcG9ydEtleShyYXdLZXkpIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIGhvb2subWV0YWRhdGEgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaG9vay5tZXRhZGF0YSA9IGF3YWl0IGh5ZHJhdGVTdGVwQXJndW1lbnRzKFxuICAgICAgaG9vay5tZXRhZGF0YSBhcyBhbnksXG4gICAgICBob29rLnJ1bklkLFxuICAgICAgZW5jcnlwdGlvbktleVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHsgaG9vaywgcnVuLCBlbmNyeXB0aW9uS2V5IH07XG59XG5cbi8qKlxuICogR2V0IHRoZSBob29rIGJ5IHRva2VuIHRvIGZpbmQgdGhlIGFzc29jaWF0ZWQgd29ya2Zsb3cgcnVuLFxuICogYW5kIGh5ZHJhdGUgdGhlIGBtZXRhZGF0YWAgcHJvcGVydHkgaWYgaXQgd2FzIHNldCBmcm9tIHdpdGhpblxuICogdGhlIHdvcmtmbG93IHJ1bi5cbiAqXG4gKiBAcGFyYW0gdG9rZW4gLSBUaGUgdW5pcXVlIHRva2VuIGlkZW50aWZ5aW5nIHRoZSBob29rXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRIb29rQnlUb2tlbih0b2tlbjogc3RyaW5nKTogUHJvbWlzZTxIb29rPiB7XG4gIGNvbnN0IHsgaG9vayB9ID0gYXdhaXQgZ2V0SG9va0J5VG9rZW5XaXRoS2V5KHRva2VuKTtcbiAgcmV0dXJuIGhvb2s7XG59XG5cbi8qKlxuICogUmVzdW1lcyBhIHdvcmtmbG93IHJ1biBieSBzZW5kaW5nIGEgcGF5bG9hZCB0byBhIGhvb2sgaWRlbnRpZmllZCBieSBpdHMgdG9rZW4uXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgZXh0ZXJuYWxseSAoZS5nLiwgZnJvbSBhbiBBUEkgcm91dGUgb3Igc2VydmVyIGFjdGlvbilcbiAqIHRvIHNlbmQgZGF0YSB0byBhIGhvb2sgYW5kIHJlc3VtZSB0aGUgYXNzb2NpYXRlZCB3b3JrZmxvdyBydW4uXG4gKlxuICogQHBhcmFtIHRva2VuT3JIb29rIC0gVGhlIHVuaXF1ZSB0b2tlbiBpZGVudGlmeWluZyB0aGUgaG9vaywgb3IgdGhlIGhvb2sgb2JqZWN0IGl0c2VsZlxuICogQHBhcmFtIHBheWxvYWQgLSBUaGUgZGF0YSBwYXlsb2FkIHRvIHNlbmQgdG8gdGhlIGhvb2tcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHRoZSBob29rXG4gKiBAdGhyb3dzIEVycm9yIGlmIHRoZSBob29rIGlzIG5vdCBmb3VuZCBvciBpZiB0aGVyZSdzIGFuIGVycm9yIGR1cmluZyB0aGUgcHJvY2Vzc1xuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIC8vIEluIGFuIEFQSSByb3V0ZVxuICogaW1wb3J0IHsgcmVzdW1lSG9vayB9IGZyb20gJ0B3b3JrZmxvdy9jb3JlL3J1bnRpbWUnO1xuICpcbiAqIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IFJlcXVlc3QpIHtcbiAqICAgY29uc3QgeyB0b2tlbiwgZGF0YSB9ID0gYXdhaXQgcmVxdWVzdC5qc29uKCk7XG4gKlxuICogICB0cnkge1xuICogICAgIGNvbnN0IGhvb2sgPSBhd2FpdCByZXN1bWVIb29rKHRva2VuLCBkYXRhKTtcbiAqICAgICByZXR1cm4gUmVzcG9uc2UuanNvbih7IHJ1bklkOiBob29rLnJ1bklkIH0pO1xuICogICB9IGNhdGNoIChlcnJvcikge1xuICogICAgIHJldHVybiBuZXcgUmVzcG9uc2UoJ0hvb2sgbm90IGZvdW5kJywgeyBzdGF0dXM6IDQwNCB9KTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXN1bWVIb29rPFQgPSBhbnk+KFxuICB0b2tlbk9ySG9vazogc3RyaW5nIHwgSG9vayxcbiAgcGF5bG9hZDogVCxcbiAgZW5jcnlwdGlvbktleU92ZXJyaWRlPzogQ3J5cHRvS2V5XG4pOiBQcm9taXNlPEhvb2s+IHtcbiAgcmV0dXJuIGF3YWl0IHdhaXRlZFVudGlsKCgpID0+IHtcbiAgICByZXR1cm4gdHJhY2UoJ2hvb2sucmVzdW1lJywgYXN5bmMgKHNwYW4pID0+IHtcbiAgICAgIGNvbnN0IHdvcmxkID0gZ2V0V29ybGQoKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IGhvb2s6IEhvb2s7XG4gICAgICAgIGxldCB3b3JrZmxvd1J1bjogV29ya2Zsb3dSdW47XG4gICAgICAgIGxldCBlbmNyeXB0aW9uS2V5OiBDcnlwdG9LZXkgfCB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW5Pckhvb2sgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZ2V0SG9va0J5VG9rZW5XaXRoS2V5KHRva2VuT3JIb29rKTtcbiAgICAgICAgICBob29rID0gcmVzdWx0Lmhvb2s7XG4gICAgICAgICAgd29ya2Zsb3dSdW4gPSByZXN1bHQucnVuO1xuICAgICAgICAgIGVuY3J5cHRpb25LZXkgPSBlbmNyeXB0aW9uS2V5T3ZlcnJpZGUgPz8gcmVzdWx0LmVuY3J5cHRpb25LZXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaG9vayA9IHRva2VuT3JIb29rO1xuICAgICAgICAgIHdvcmtmbG93UnVuID0gYXdhaXQgd29ybGQucnVucy5nZXQoaG9vay5ydW5JZCk7XG4gICAgICAgICAgaWYgKGVuY3J5cHRpb25LZXlPdmVycmlkZSkge1xuICAgICAgICAgICAgZW5jcnlwdGlvbktleSA9IGVuY3J5cHRpb25LZXlPdmVycmlkZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcmF3S2V5ID0gYXdhaXQgd29ybGQuZ2V0RW5jcnlwdGlvbktleUZvclJ1bj8uKHdvcmtmbG93UnVuKTtcbiAgICAgICAgICAgIGVuY3J5cHRpb25LZXkgPSByYXdLZXkgPyBhd2FpdCBpbXBvcnRLZXkocmF3S2V5KSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuSG9va1Rva2VuKGhvb2sudG9rZW4pLFxuICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Ib29rSWQoaG9vay5ob29rSWQpLFxuICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1bklkKGhvb2sucnVuSWQpLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDaGVjayB0aGUgdGFyZ2V0IHJ1bidzIGNhcGFiaWxpdGllcyB0byBlbnN1cmUgd2UgZW5jb2RlIHRoZVxuICAgICAgICAvLyBwYXlsb2FkIGluIGEgZm9ybWF0IHRoZSBydW4ncyBkZXBsb3ltZW50IGNhbiBkZWNvZGUuIEZvciBleGFtcGxlLFxuICAgICAgICAvLyBydW5zIGNyZWF0ZWQgYmVmb3JlIGVuY3J5cHRpb24gc3VwcG9ydCB3YXMgYWRkZWQgY2Fubm90IGRlY29kZVxuICAgICAgICAvLyB0aGUgJ2VuY3InIHNlcmlhbGl6YXRpb24gZm9ybWF0LCBhbmQgcnVucyBjcmVhdGVkIGJlZm9yZVxuICAgICAgICAvLyBieXRlLXN0cmVhbSBmcmFtaW5nIHN1cHBvcnQgY2Fubm90IGRlY29kZSBmcmFtZWQgYnl0ZSBzdHJlYW1zLlxuICAgICAgICBjb25zdCByYXdWZXJzaW9uID0gd29ya2Zsb3dSdW4uZXhlY3V0aW9uQ29udGV4dD8ud29ya2Zsb3dDb3JlVmVyc2lvbjtcbiAgICAgICAgY29uc3QgY2FwYWJpbGl0aWVzID0gZ2V0UnVuQ2FwYWJpbGl0aWVzKFxuICAgICAgICAgIHR5cGVvZiByYXdWZXJzaW9uID09PSAnc3RyaW5nJyA/IHJhd1ZlcnNpb24gOiB1bmRlZmluZWRcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKCFjYXBhYmlsaXRpZXMuc3VwcG9ydGVkRm9ybWF0cy5oYXMoU2VyaWFsaXphdGlvbkZvcm1hdC5FTkNSWVBURUQpKSB7XG4gICAgICAgICAgZW5jcnlwdGlvbktleSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlaHlkcmF0ZSB0aGUgcGF5bG9hZCBmb3Igc3RvcmFnZVxuICAgICAgICBjb25zdCBvcHM6IFByb21pc2U8YW55PltdID0gW107XG4gICAgICAgIGNvbnN0IHYxQ29tcGF0ID0gaXNMZWdhY3lTcGVjVmVyc2lvbihob29rLnNwZWNWZXJzaW9uKTtcbiAgICAgICAgY29uc3QgZGVoeWRyYXRlZFBheWxvYWQgPSBhd2FpdCBkZWh5ZHJhdGVTdGVwUmV0dXJuVmFsdWUoXG4gICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICBob29rLnJ1bklkLFxuICAgICAgICAgIGVuY3J5cHRpb25LZXksXG4gICAgICAgICAgb3BzLFxuICAgICAgICAgIGdsb2JhbFRoaXMsXG4gICAgICAgICAgdjFDb21wYXQsXG4gICAgICAgICAgY2FwYWJpbGl0aWVzLmZyYW1lZEJ5dGVTdHJlYW1zXG4gICAgICAgICk7XG4gICAgICAgIC8vIFRoZXNlIHBheWxvYWQtc3RyZWFtIG9wcyBhcmUgZmx1c2hlZCBpbiB0aGUgYmFja2dyb3VuZDsgdGhlXG4gICAgICAgIC8vIHByb21pc2UgaGFuZGVkIHRvIHdhaXRVbnRpbCBtdXN0IG5ldmVyIHJlamVjdCAoYW4gdW5jb25zdW1lZFxuICAgICAgICAvLyB3YWl0VW50aWwgcmVqZWN0aW9uIGNyYXNoZXMgdGhlIHByb2Nlc3MgYXMgdW5oYW5kbGVkUmVqZWN0aW9uKSxcbiAgICAgICAgLy8gc28gdW5leHBlY3RlZCBmYWlsdXJlcyBhcmUgbG9nZ2VkIGluc3RlYWQuXG4gICAgICAgIC8vIE5PVEU6IHJlamVjdGlvbnMgd2l0aCBgdW5kZWZpbmVkYCBhcmUgYW4gZXhwZWN0ZWQgYXJ0aWZhY3Qgb2YgdGhlXG4gICAgICAgIC8vIHdlYmhvb2sgYnVuZGxlIGFuZCBhcmUgaWdub3JlZCBlbnRpcmVseS5cbiAgICAgICAgc2FmZVdhaXRVbnRpbChQcm9taXNlLmFsbChvcHMpLCAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVyciA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgcnVudGltZUxvZ2dlci53YXJuKCdCYWNrZ3JvdW5kIGZsdXNoIG9mIGhvb2sgcGF5bG9hZCBvcHMgZmFpbGVkJywge1xuICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogaG9vay5ydW5JZCxcbiAgICAgICAgICAgIGhvb2tJZDogaG9vay5ob29rSWQsXG4gICAgICAgICAgICBlcnJvcjogZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDcmVhdGUgYSBob29rX3JlY2VpdmVkIGV2ZW50IHdpdGggdGhlIHBheWxvYWRcbiAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICBob29rLnJ1bklkLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGV2ZW50VHlwZTogJ2hvb2tfcmVjZWl2ZWQnLFxuICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgY29ycmVsYXRpb25JZDogaG9vay5ob29rSWQsXG4gICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgLi4uKHYxQ29tcGF0ID8ge30gOiB7IHRva2VuOiBob29rLnRva2VuIH0pLFxuICAgICAgICAgICAgICBwYXlsb2FkOiBkZWh5ZHJhdGVkUGF5bG9hZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7IHYxQ29tcGF0IH1cbiAgICAgICAgKTtcblxuICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dOYW1lKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHRyYWNlQ2FycmllciA9IHdvcmtmbG93UnVuLmV4ZWN1dGlvbkNvbnRleHQ/LnRyYWNlQ2FycmllcjtcblxuICAgICAgICBpZiAodHJhY2VDYXJyaWVyKSB7XG4gICAgICAgICAgY29uc3QgY29udGV4dCA9IGF3YWl0IGdldFNwYW5Db250ZXh0Rm9yVHJhY2VDYXJyaWVyKHRyYWNlQ2Fycmllcik7XG4gICAgICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgICAgIHNwYW4/LmFkZExpbms/Lih7IGNvbnRleHQgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmUtdHJpZ2dlciB0aGUgd29ya2Zsb3cgYWdhaW5zdCB0aGUgZGVwbG95bWVudCBJRCBhc3NvY2lhdGVkXG4gICAgICAgIC8vIHdpdGggdGhlIHdvcmtmbG93IHJ1biB0aGF0IHRoZSBob29rIGJlbG9uZ3MgdG9cbiAgICAgICAgYXdhaXQgd29ybGQucXVldWUoXG4gICAgICAgICAgZ2V0V29ya2Zsb3dRdWV1ZU5hbWUod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBydW5JZDogaG9vay5ydW5JZCxcbiAgICAgICAgICAgIC8vIGF0dGFjaCB0aGUgdHJhY2UgY2FycmllciBmcm9tIHRoZSB3b3JrZmxvdyBydW5cbiAgICAgICAgICAgIHRyYWNlQ2FycmllcjpcbiAgICAgICAgICAgICAgd29ya2Zsb3dSdW4uZXhlY3V0aW9uQ29udGV4dD8udHJhY2VDYXJyaWVyID8/IHVuZGVmaW5lZCxcbiAgICAgICAgICB9IHNhdGlzZmllcyBXb3JrZmxvd0ludm9rZVBheWxvYWQsXG4gICAgICAgICAge1xuICAgICAgICAgICAgZGVwbG95bWVudElkOiB3b3JrZmxvd1J1bi5kZXBsb3ltZW50SWQsXG4gICAgICAgICAgICBzcGVjVmVyc2lvbjogd29ya2Zsb3dSdW4uc3BlY1ZlcnNpb24gPz8gU1BFQ19WRVJTSU9OX0xFR0FDWSxcbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIGhvb2s7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgLi4uQXR0cmlidXRlLkhvb2tUb2tlbihcbiAgICAgICAgICAgIHR5cGVvZiB0b2tlbk9ySG9vayA9PT0gJ3N0cmluZycgPyB0b2tlbk9ySG9vayA6IHRva2VuT3JIb29rLnRva2VuXG4gICAgICAgICAgKSxcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuSG9va0ZvdW5kKGZhbHNlKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmVzdW1lcyBhIHdlYmhvb2sgYnkgc2VuZGluZyBhIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvUmVxdWVzdCB8IFJlcXVlc3R9XG4gKiBvYmplY3QgdG8gYSBob29rIGlkZW50aWZpZWQgYnkgaXRzIHRva2VuLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGV4dGVybmFsbHkgKGUuZy4sIGZyb20gYW4gQVBJIHJvdXRlIG9yIHNlcnZlciBhY3Rpb24pXG4gKiB0byBzZW5kIGEgcmVxdWVzdCB0byBhIHdlYmhvb2sgYW5kIHJlc3VtZSB0aGUgYXNzb2NpYXRlZCB3b3JrZmxvdyBydW4uXG4gKlxuICogQHBhcmFtIHRva2VuIC0gVGhlIHVuaXF1ZSB0b2tlbiBpZGVudGlmeWluZyB0aGUgaG9va1xuICogQHBhcmFtIHJlcXVlc3QgLSBUaGUgcmVxdWVzdCB0byBzZW5kIHRvIHRoZSBob29rXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byB0aGUgcmVzcG9uc2VcbiAqIEB0aHJvd3MgRXJyb3IgaWYgdGhlIGhvb2sgaXMgbm90IGZvdW5kIG9yIGlmIHRoZXJlJ3MgYW4gZXJyb3IgZHVyaW5nIHRoZSBwcm9jZXNzXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBgYGB0c1xuICogLy8gSW4gYW4gQVBJIHJvdXRlXG4gKiBpbXBvcnQgeyByZXN1bWVXZWJob29rIH0gZnJvbSAnQHdvcmtmbG93L2NvcmUvcnVudGltZSc7XG4gKlxuICogZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogUmVxdWVzdCkge1xuICogICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlcXVlc3QudXJsKTtcbiAqICAgY29uc3QgdG9rZW4gPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgndG9rZW4nKTtcbiAqXG4gKiAgIGlmICghdG9rZW4pIHtcbiAqICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdNaXNzaW5nIHRva2VuJywgeyBzdGF0dXM6IDQwMCB9KTtcbiAqICAgfVxuICpcbiAqICAgdHJ5IHtcbiAqICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlc3VtZVdlYmhvb2sodG9rZW4sIHJlcXVlc3QpO1xuICogICAgIHJldHVybiByZXNwb25zZTtcbiAqICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdXZWJob29rIG5vdCBmb3VuZCcsIHsgc3RhdHVzOiA0MDQgfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdW1lV2ViaG9vayhcbiAgdG9rZW46IHN0cmluZyxcbiAgcmVxdWVzdDogUmVxdWVzdFxuKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICBjb25zdCB7IGhvb2ssIGVuY3J5cHRpb25LZXkgfSA9IGF3YWl0IGdldEhvb2tCeVRva2VuV2l0aEtleSh0b2tlbik7XG5cbiAgLy8gT25seSB3ZWJob29rcyBjYW4gYmUgcmVzdW1lZCB2aWEgdGhlIHB1YmxpYyBlbmRwb2ludC5cbiAgLy8gSWYgdGhlIGhvb2sgd2FzIGNyZWF0ZWQgdmlhIGNyZWF0ZUhvb2soKSAoaXNXZWJob29rICE9PSB0cnVlKSxcbiAgLy8gdGhyb3cgdGhlIHNhbWUgXCJub3QgZm91bmRcIiBlcnJvciB0aGUgd29ybGQgd291bGQgdGhyb3cgZm9yIGEgbWlzc2luZ1xuICAvLyB0b2tlbi4gVGhpcyBwcmV2ZW50cyBsZWFraW5nIHRoYXQgdGhlIHRva2VuIGlzIHZhbGlkLlxuICBpZiAoaG9vay5pc1dlYmhvb2sgPT09IGZhbHNlKSB7XG4gICAgdGhyb3cgbmV3IEhvb2tOb3RGb3VuZEVycm9yKHRva2VuKTtcbiAgfVxuXG4gIGxldCByZXNwb25zZTogUmVzcG9uc2UgfCB1bmRlZmluZWQ7XG4gIGxldCByZXNwb25zZVJlYWRhYmxlOiBSZWFkYWJsZVN0cmVhbTxSZXNwb25zZT4gfCB1bmRlZmluZWQ7XG4gIGlmIChcbiAgICBob29rLm1ldGFkYXRhICYmXG4gICAgdHlwZW9mIGhvb2subWV0YWRhdGEgPT09ICdvYmplY3QnICYmXG4gICAgJ3Jlc3BvbmRXaXRoJyBpbiBob29rLm1ldGFkYXRhXG4gICkge1xuICAgIGlmIChob29rLm1ldGFkYXRhLnJlc3BvbmRXaXRoID09PSAnbWFudWFsJykge1xuICAgICAgY29uc3QgeyByZWFkYWJsZSwgd3JpdGFibGUgfSA9IG5ldyBUcmFuc2Zvcm1TdHJlYW08UmVzcG9uc2UsIFJlc3BvbnNlPigpO1xuICAgICAgcmVzcG9uc2VSZWFkYWJsZSA9IHJlYWRhYmxlO1xuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBpbnN0YW5jZSBpbmNsdWRlcyB0aGUgd3JpdGFibGUgc3RyZWFtIHdoaWNoIHdpbGwgYmUgdXNlZFxuICAgICAgLy8gdG8gd3JpdGUgdGhlIHJlc3BvbnNlIHRvIHRoZSBjbGllbnQgZnJvbSB3aXRoaW4gdGhlIHdvcmtmbG93IHJ1blxuICAgICAgKHJlcXVlc3QgYXMgYW55KVtXRUJIT09LX1JFU1BPTlNFX1dSSVRBQkxFXSA9IHdyaXRhYmxlO1xuICAgIH0gZWxzZSBpZiAoaG9vay5tZXRhZGF0YS5yZXNwb25kV2l0aCBpbnN0YW5jZW9mIFJlc3BvbnNlKSB7XG4gICAgICByZXNwb25zZSA9IGhvb2subWV0YWRhdGEucmVzcG9uZFdpdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcihcbiAgICAgICAgYEludmFsaWQgXFxgcmVzcG9uZFdpdGhcXGAgdmFsdWU6ICR7aG9vay5tZXRhZGF0YS5yZXNwb25kV2l0aH1gLFxuICAgICAgICB7IHNsdWc6IEVSUk9SX1NMVUdTLldFQkhPT0tfSU5WQUxJRF9SRVNQT05EX1dJVEhfVkFMVUUgfVxuICAgICAgKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gTm8gYHJlc3BvbmRXaXRoYCB2YWx1ZSBpbXBsaWVzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mIHJldHVybmluZyBhIDIwMlxuICAgIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHsgc3RhdHVzOiAyMDIgfSk7XG4gIH1cblxuICBhd2FpdCByZXN1bWVIb29rKGhvb2ssIHJlcXVlc3QsIGVuY3J5cHRpb25LZXkpO1xuXG4gIGlmIChyZXNwb25zZVJlYWRhYmxlKSB7XG4gICAgLy8gV2FpdCBmb3IgdGhlIHJlYWRhYmxlIHN0cmVhbSB0byBlbWl0IG9uZSBjaHVuayxcbiAgICAvLyB3aGljaCBpcyB0aGUgYFJlc3BvbnNlYCBvYmplY3RcbiAgICBjb25zdCByZWFkZXIgPSByZXNwb25zZVJlYWRhYmxlLmdldFJlYWRlcigpO1xuICAgIGNvbnN0IGNodW5rID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICBpZiAoY2h1bmsudmFsdWUpIHtcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgbWF0ZXJpYWxpemVSZXNwb25zZUJvZHkoY2h1bmsudmFsdWUpO1xuICAgIH1cbiAgICBhd2FpdCByZWFkZXIuY2FuY2VsKCk7XG4gIH1cblxuICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKCdXb3JrZmxvdyBydW4gZGlkIG5vdCBzZW5kIGEgcmVzcG9uc2UnLCB7XG4gICAgICBzbHVnOiBFUlJPUl9TTFVHUy5XRUJIT09LX1JFU1BPTlNFX05PVF9TRU5ULFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFtRE8sU0FBUyxzQkFBc0IsT0FBTztBQUN6QyxrQkFBZ0IsT0FBTyxZQUFZLE1BQU0sSUFBSSxDQUFDLE1BQUk7QUFBQSxJQUMxQyxFQUFFO0FBQUEsSUFDRjtBQUFBLEVBQ0osQ0FBQyxDQUFDO0FBQ1Y7QUFLVyxTQUFTLHVCQUF1QjtBQUN2QyxTQUFPO0FBQUEsSUFDSCxHQUFHO0FBQUEsSUFDSCxHQUFHO0FBQUEsRUFDUDtBQUNKO0FBU1csU0FBUyxnQkFBZ0IsT0FBTztBQUN2QyxrQkFBZ0IsT0FBTyxZQUFZLE1BQU0sSUFBSSxDQUFDLE1BQUk7QUFBQSxJQUMxQyxFQUFFO0FBQUEsSUFDRjtBQUFBLEVBQ0osQ0FBQyxDQUFDO0FBQ1Y7QUFDdUcsU0FBUyxpQkFBaUI7QUFDN0gsU0FBTztBQUFBLElBQ0gsR0FBRztBQUFBLElBQ0gsR0FBRztBQUFBLEVBQ1A7QUFDSjtBQThNTyxTQUFTLGlCQUFpQixTQUFTLFVBQVU7QUFDaEQsU0FBTyxVQUFVLE9BQU8sS0FBSyxVQUFVLFFBQVE7QUFDbkQ7QUFDTyxTQUFTLGFBQWEsTUFBTSxTQUFTLENBQUMsR0FBRztBQUM1QyxTQUFPLE9BQU8sT0FBTyxlQUFlLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBSSxFQUFFLGNB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Q0o7QUFQUztBQVFULElBQU0scUJBQXFCO0FBQUEsRUFDdkI7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0E7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0E7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0E7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0E7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsTUFDSTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFB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c0JBQ0EsMkJBR0Q7QUFDRCxTQUFTLDBCQUEwQjtBQUNuQyxTQUF5QixpQkFBaUI7QUFDMUMsU0FBUyxpQkFBQUMsc0JBQXFCO0FBQzlCLFNBQ0UsMEJBQ0Esc0JBQ0EsMkJBQ0Q7QUFDRCxTQUFTLGlDQUFpQztBQUMxQyxZQUFZQyxnQkFBZTtBQUMzQixTQUFTLCtCQUErQixTQUFBQyxjQUFhO0FBQ3JELFNBQVMsNEJBQTRCO0FBQ3JDLFNBQVMsZUFBZSxtQkFBbUI7QUFDM0MsU0FBUyxnQkFBZ0I7OztBRitDekIsU0FDRSxRQUNBLFdBR0Q7QUFDRCxTQUNFLFdBQ0EsYUFHQSxZQUNBLHlCQUNBLGNBR0EsaUJBQ0Q7QUFDRCxTQUtFLGFBQ0Q7QUFDRCxTQUFTLHNCQUFzQjtBQUMvQixTQUNFLGFBQ0EsWUFBQUMsV0FDQSxvQkFBQUMsbUJBQ0EsZ0JBQ0Q7IiwKICAibmFtZXMiOiBbInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImZldGNoIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInBhcnNlZCIsICJzZXREeW5hbWljUGFnZXMiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiUmVwbGF5RGl2ZXJnZW5jZUVycm9yIiwgIldvcmtmbG93UnVudGltZUVycm9yIiwgInBhcnNlV29ya2Zsb3dOYW1lIiwgIlNQRUNfVkVSU0lPTl9DVVJSRU5UIiwgIlNQRUNfVkVSU0lPTl9MRUdBQ1kiLCAiaW1wb3J0S2V5IiwgIldvcmtmbG93U3VzcGVuc2lvbiIsICJydW50aW1lTG9nZ2VyIiwgImdldFdvcmtmbG93UXVldWVOYW1lIiwgImdldFdvcmxkIiwgIkF0dHJpYnV0ZSIsICJ0cmFjZSIsICJXb3JrZmxvd1N1c3BlbnNpb24iLCAiRVJST1JfU0xVR1MiLCAiV29ya2Zsb3dSdW50aW1lRXJyb3IiLCAicnVudGltZUxvZ2dlciIsICJBdHRyaWJ1dGUiLCAidHJhY2UiLCAiZ2V0V29ybGQiLCAiZ2V0V29ybGRIYW5kbGVycyJdCn0K
