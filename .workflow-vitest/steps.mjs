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
import { read as read2 } from "xlsx";

// src/lib/workbook-formulas.ts
import { utils as utils4 } from "xlsx";

// src/lib/excel-formula.ts
import { utils as utils2 } from "xlsx";
var MAX_DEPTH = 12;
var MAX_RANGE_CELLS = 1e5;
function isRange(v) {
  return typeof v === "object" && v !== null && "__range" in v;
}
__name(isRange, "isRange");
function tokenize(src) {
  const tokens = [];
  let i = 0;
  let prevToken;
  while (i < src.length) {
    const ch = src[i];
    if (ch === " " || ch === "	" || ch === "\n") {
      i++;
      continue;
    }
    if (/[\d.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[\d.]/.test(src[j])) j++;
      tokens.push({
        type: "num",
        value: src.slice(i, j)
      });
      i = j;
      prevToken = tokens[tokens.length - 1];
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== '"') j++;
      tokens.push({
        type: "str",
        value: src.slice(i + 1, j)
      });
      i = j + 1;
      prevToken = tokens[tokens.length - 1];
      continue;
    }
    if (ch === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== "'") j++;
      const sheetName = src.slice(i + 1, j);
      i = j + 1;
      if (src[i] === "!") {
        tokens.push({
          type: "sheet",
          value: sheetName
        });
        i++;
        prevToken = tokens[tokens.length - 1];
        continue;
      }
      throw new Error("bad quoted token");
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_$.]/.test(src[j])) j++;
      const word = src.slice(i, j);
      if (src[j] === "!") {
        tokens.push({
          type: "sheet",
          value: word
        });
        i = j + 1;
        prevToken = tokens[tokens.length - 1];
        continue;
      }
      if (/^\$?[A-Za-z]{1,3}\$?\d+$/.test(word)) tokens.push({
        type: "ref",
        value: word
      });
      else if (/^\$?[A-Za-z]{1,3}$/.test(word) && (src[j] === ":" || prevToken?.type === "op" && prevToken.value === ":")) {
        tokens.push({
          type: "ref",
          value: word
        });
      } else if (word === "TRUE") tokens.push({
        type: "bool",
        value: "TRUE"
      });
      else if (word === "FALSE") tokens.push({
        type: "bool",
        value: "FALSE"
      });
      else tokens.push({
        type: "ident",
        value: word.toUpperCase()
      });
      i = j;
      prevToken = tokens[tokens.length - 1];
      continue;
    }
    const two = src.slice(i, i + 2);
    if (two === "<=" || two === ">=" || two === "<>") {
      tokens.push({
        type: "op",
        value: two
      });
      i += 2;
      prevToken = tokens[tokens.length - 1];
      continue;
    }
    if ("+-*/^=<>(),%:".includes(ch)) {
      tokens.push({
        type: "op",
        value: ch
      });
      i++;
      prevToken = tokens[tokens.length - 1];
      continue;
    }
    throw new Error("unexpected char: " + ch);
  }
  return tokens;
}
__name(tokenize, "tokenize");
function toNum(v) {
  if (v === void 0 || v === null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "string") {
    const n = Number(v.trim());
    if (isFinite(n)) return n;
  }
  throw new Error("not numeric");
}
__name(toNum, "toNum");
function truthy(v) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v.trim() !== "";
  if (isRange(v)) return v.values.some((x) => truthy(x));
  return false;
}
__name(truthy, "truthy");
var Parser = class {
  static {
    __name(this, "Parser");
  }
  wb;
  ws;
  depth;
  currentCellAddr;
  tokens;
  pos = 0;
  constructor(wb, ws, src, depth = 0, currentCellAddr) {
    this.wb = wb;
    this.ws = ws;
    this.depth = depth;
    this.currentCellAddr = currentCellAddr;
    this.tokens = tokenize(src);
  }
  parseExpr() {
    return this.parseComparison();
  }
  /** True when the full token stream has been consumed. */
  finished() {
    return this.pos >= this.tokens.length;
  }
  peek() {
    return this.tokens[this.pos];
  }
  next() {
    return this.tokens[this.pos++];
  }
  expectOp(op) {
    const t = this.next();
    if (!t || t.type !== "op" || t.value !== op) throw new Error("expected " + op);
  }
  parseComparison() {
    let left = this.parseAdditive();
    while (this.peek() && this.peek().type === "op" && [
      "=",
      "<>",
      "<",
      ">",
      "<=",
      ">="
    ].includes(this.peek().value)) {
      const op = this.next().value;
      const right = this.parseAdditive();
      left = compare(op, left, right);
    }
    return left;
  }
  parseAdditive() {
    let left = this.parseMultiplicative();
    while (this.peek() && this.peek().type === "op" && (this.peek().value === "+" || this.peek().value === "-")) {
      const op = this.next().value;
      const right = this.parseMultiplicative();
      left = arith(op, left, right);
    }
    return left;
  }
  parseMultiplicative() {
    let left = this.parseUnary();
    while (this.peek() && this.peek().type === "op" && (this.peek().value === "*" || this.peek().value === "/")) {
      const op = this.next().value;
      const right = this.parseUnary();
      left = arith(op, left, right);
    }
    return left;
  }
  parseUnary() {
    const t = this.peek();
    if (t && t.type === "op" && (t.value === "-" || t.value === "+")) {
      this.next();
      const v = this.parseUnary();
      return t.value === "-" ? -toNum(v) : toNum(v);
    }
    return this.parsePostfix();
  }
  parsePostfix() {
    let v = this.parseAtom();
    while (this.peek() && this.peek().type === "op" && this.peek().value === "%") {
      this.next();
      v = toNum(v) / 100;
    }
    return v;
  }
  parseAtom() {
    const t = this.next();
    if (!t) throw new Error("unexpected end of formula");
    if (t.type === "num") return Number(t.value);
    if (t.type === "str") return t.value;
    if (t.type === "bool") return t.value === "TRUE";
    if (t.type === "sheet") {
      const ref = this.next();
      if (!ref || ref.type !== "ref") throw new Error("expected cell ref after sheet");
      const sheetWs = this.getSheet(t.value);
      return this.parseRangeOrValue(sheetWs, ref.value);
    }
    if (t.type === "ref") return this.parseRangeOrValue(this.ws, t.value);
    if (t.type === "ident") {
      if (this.peek() && this.peek().type === "op" && this.peek().value === "(") {
        return this.callFunction(t.value);
      }
      throw new Error("unknown identifier: " + t.value);
    }
    if (t.type === "op" && t.value === "(") {
      const v = this.parseExpr();
      this.expectOp(")");
      return v;
    }
    throw new Error("unexpected token: " + t.value);
  }
  parseRangeOrValue(ws, addr) {
    const t = this.peek();
    if (t && t.type === "op" && t.value === ":") {
      this.next();
      const end = this.next();
      if (!end || end.type !== "ref") throw new Error("bad range end");
      const cells = this.rangeCells(ws, addr, end.value);
      const c1 = utils2.decode_cell(addr.replace(/\$/g, ""));
      const c2 = utils2.decode_cell(end.value.replace(/\$/g, ""));
      const width = Math.abs(c2.c - c1.c) + 1;
      return {
        __range: true,
        values: cells.map((c) => this.resolveCell(c.ws, c.addr, this.depth)),
        width
      };
    }
    return this.resolveCell(ws, addr, this.depth);
  }
  getSheet(name) {
    const sheet = this.wb.Sheets[name] ?? this.wb.Sheets[this.wb.SheetNames.find((n) => n.toLowerCase() === name.toLowerCase()) ?? ""];
    if (!sheet) throw new Error("sheet not found: " + name);
    return sheet;
  }
  rangeCells(ws, a, b) {
    const cleanA = a.replace(/\$/g, "");
    const cleanB = b.replace(/\$/g, "");
    const colOnly = /* @__PURE__ */ __name((s) => /^[A-Za-z]+$/.test(s), "colOnly");
    let r1, r2, cMin, cMax;
    if (colOnly(cleanA) || colOnly(cleanB)) {
      const maxRow = ws["!ref"] ? utils2.decode_range(ws["!ref"]).e.r : 0;
      const colIndex = /* @__PURE__ */ __name((s) => {
        let c = 0;
        for (const ch of s.toUpperCase()) c = c * 26 + (ch.charCodeAt(0) - 64);
        return c - 1;
      }, "colIndex");
      const cA = colOnly(cleanA) ? colIndex(cleanA) : utils2.decode_cell(cleanA).c;
      const cB = colOnly(cleanB) ? colIndex(cleanB) : utils2.decode_cell(cleanB).c;
      cMin = Math.min(cA, cB);
      cMax = Math.max(cA, cB);
      r1 = 0;
      r2 = maxRow;
    } else {
      const c1 = utils2.decode_cell(cleanA);
      const c2 = utils2.decode_cell(cleanB);
      r1 = Math.min(c1.r, c2.r);
      r2 = Math.max(c1.r, c2.r);
      cMin = Math.min(c1.c, c2.c);
      cMax = Math.max(c1.c, c2.c);
    }
    const count = (r2 - r1 + 1) * (cMax - cMin + 1);
    if (count > MAX_RANGE_CELLS) throw new Error("range too large");
    const out = [];
    for (let r = r1; r <= r2; r++) {
      for (let c = cMin; c <= cMax; c++) {
        out.push({
          ws,
          addr: utils2.encode_cell({
            r,
            c
          })
        });
      }
    }
    return out;
  }
  resolveCell(ws, addr, depth) {
    if (depth > MAX_DEPTH) return void 0;
    const clean = addr.replace(/\$/g, "");
    const cell = ws[clean];
    if (!cell) return void 0;
    if (cell.v !== void 0 && cell.v !== null) return cell.v;
    if (typeof cell.f === "string" && cell.f.trim() !== "") {
      const f = cell.f.trim().startsWith("=") ? cell.f.trim() : "=" + cell.f.trim();
      const sub = evaluateFormula(this.wb, ws, f, depth + 1, clean);
      if (sub.unevaluable) throw new Error("referenced cell formula unevaluable: " + clean);
      return sub.value;
    }
    return void 0;
  }
  /**
  * Skip tokens of an expression without evaluating (used for lazy IF's
  * untaken branch). Stops before the next top-level ',' or ')'.
  */
  skipExpr() {
    let depth = 0;
    while (this.pos < this.tokens.length) {
      const t = this.tokens[this.pos];
      if (t.type === "op") {
        if (t.value === "(") depth++;
        else if (t.value === ")") {
          if (depth === 0) return;
          depth--;
        } else if (t.value === "," && depth === 0) return;
      }
      this.pos++;
    }
  }
  callFunction(name) {
    if (name === "IF") {
      this.expectOp("(");
      const cond = this.parseExpr();
      this.expectOp(",");
      if (truthy(cond)) {
        const v = this.parseExpr();
        if (this.peek() && this.peek().type === "op" && this.peek().value === ",") {
          this.next();
          this.skipExpr();
        }
        this.expectOp(")");
        return v;
      }
      this.skipExpr();
      if (this.peek() && this.peek().type === "op" && this.peek().value === ",") {
        this.next();
        const v = this.parseExpr();
        this.expectOp(")");
        return v;
      }
      this.expectOp(")");
      return false;
    }
    if (name === "IFERROR") {
      this.expectOp("(");
      const startPos = this.pos;
      let first;
      try {
        first = this.parseExpr();
      } catch {
        first = void 0;
        let depth = 0;
        this.pos = startPos;
        while (this.pos < this.tokens.length) {
          const t = this.tokens[this.pos];
          if (t.type === "op") {
            if (t.value === "(") depth++;
            else if (t.value === ")") {
              if (depth === 0) {
                this.pos++;
                break;
              }
              depth--;
            } else if (t.value === "," && depth === 0) {
              this.pos++;
              break;
            }
          }
          this.pos++;
        }
      }
      if (this.peek() && this.peek().type === "op" && this.peek().value === ",") this.next();
      const fallback = this.parseExpr();
      this.expectOp(")");
      return first === void 0 ? fallback : first;
    }
    this.expectOp("(");
    const args = [];
    if (!(this.peek() && this.peek().type === "op" && this.peek().value === ")")) {
      args.push(this.parseExpr());
      while (this.peek() && this.peek().type === "op" && this.peek().value === ",") {
        this.next();
        args.push(this.parseExpr());
      }
    }
    this.expectOp(")");
    return applyFunction(name, args, this.currentCellAddr);
  }
};
function compare(op, a, b) {
  if (typeof a === "string" && typeof b === "string") {
    switch (op) {
      case "=":
        return a === b;
      case "<>":
        return a !== b;
      case "<":
        return a < b;
      case ">":
        return a > b;
      case "<=":
        return a <= b;
      case ">=":
        return a >= b;
    }
  }
  const x = toNum(a), y = toNum(b);
  switch (op) {
    case "=":
      return x === y;
    case "<>":
      return x !== y;
    case "<":
      return x < y;
    case ">":
      return x > y;
    case "<=":
      return x <= y;
    case ">=":
      return x >= y;
  }
  throw new Error("bad comparison");
}
__name(compare, "compare");
function arith(op, a, b) {
  const x = toNum(a), y = toNum(b);
  switch (op) {
    case "+":
      return x + y;
    case "-":
      return x - y;
    case "*":
      return x * y;
    case "/": {
      if (y === 0) throw new Error("divide by zero");
      return x / y;
    }
    case "^":
      return Math.pow(x, y);
  }
  throw new Error("bad operator");
}
__name(arith, "arith");
function flatten(args) {
  const out = [];
  for (const a of args) {
    if (isRange(a)) out.push(...a.values);
    else out.push(a);
  }
  return out;
}
__name(flatten, "flatten");
function numbers(args) {
  const out = [];
  for (const v of flatten(args)) {
    if (typeof v === "number") out.push(v);
    else if (typeof v === "boolean") out.push(v ? 1 : 0);
    else if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v.trim());
      if (isFinite(n)) out.push(n);
    }
  }
  return out;
}
__name(numbers, "numbers");
function toNumSafe(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.trim());
    return isFinite(n) ? n : void 0;
  }
  return void 0;
}
__name(toNumSafe, "toNumSafe");
function excelTrim(v) {
  if (v === void 0 || v === null) return "";
  return String(v ?? "").replace(/\s+/g, " ").trim();
}
__name(excelTrim, "excelTrim");
function excelProper(v) {
  if (v === void 0 || v === null) return "";
  return String(v ?? "").toLowerCase().replace(/(^|[^A-Za-z0-9])([a-z])/g, (_, p, c) => p + c.toUpperCase());
}
__name(excelProper, "excelProper");
function serialToDate(serial) {
  const days = Math.floor(serial) + (serial >= 60 ? -1 : 0);
  const ms = days * 864e5;
  const date = new Date(Date.UTC(1899, 11, 31) + ms);
  return {
    y: date.getUTCFullYear(),
    m: date.getUTCMonth() + 1,
    d: date.getUTCDate()
  };
}
__name(serialToDate, "serialToDate");
function dateToSerial(y, m, d) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  const serial = Math.floor((dt.getTime() - Date.UTC(1899, 11, 31)) / 864e5);
  return serial >= 60 ? serial + 1 : serial;
}
__name(dateToSerial, "dateToSerial");
function excelTextFormat(v, format) {
  if (v === void 0 || v === null) return "";
  const fmt = String(format);
  const num = typeof v === "number" ? v : Number(String(v ?? "").trim());
  const isDateLike = /[yYdDhHmMsS]/.test(fmt.replace(/[^a-zA-Z]/g, "")) && /y|d|h|s/i.test(fmt);
  if (isDateLike && isFinite(num)) {
    const { y, m, d } = serialToDate(num);
    const hours = Math.floor(num % 1 * 24);
    const minutes = Math.floor((num % 1 * 24 - hours) * 60);
    const seconds = Math.round(((num % 1 * 24 - hours) * 60 - minutes) * 60);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const rep = {
      "yyyy": String(y),
      "yy": String(y).slice(-2),
      "mmmm": monthNames[m - 1],
      "mmm": monthNames[m - 1].slice(0, 3),
      "mon": String(m).padStart(2, "0"),
      "mon1": String(m),
      "dddd": dayNames[wd],
      "ddd": dayNames[wd].slice(0, 3),
      "dd": String(d).padStart(2, "0"),
      "d": String(d),
      "hh": String(hours).padStart(2, "0"),
      "h": String(hours),
      "min": String(minutes).padStart(2, "0"),
      "min1": String(minutes),
      "ss": String(seconds).padStart(2, "0"),
      "s": String(seconds)
    };
    const hasHour = /h/i.test(fmt);
    return fmt.replace(/yyyy|yy|mmmm|mmm|dddd|ddd|hh|ss|dd|mm|d|m|h|s/gi, (tok) => {
      const key = tok.toLowerCase();
      if (key === "mm") return hasHour ? rep["min"] : rep["mon"];
      if (key === "m") return hasHour ? rep["min1"] : rep["mon1"];
      return rep[key] ?? tok;
    });
  }
  if (!isFinite(num)) return String(v ?? "");
  const pct = fmt.includes("%");
  const decimals = (fmt.match(/0+\.(0+)/) ?? [])[1]?.length ?? 0;
  const grouping = fmt.includes(",");
  const value = pct ? num * 100 : num;
  let out = value.toFixed(decimals);
  if (grouping) {
    const [int, dec] = out.split(".");
    out = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (dec ? "." + dec : "");
  }
  return out + (pct ? "%" : "");
}
__name(excelTextFormat, "excelTextFormat");
function findMatch(lookup, arr, type) {
  if (type === 0) {
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      if (typeof lookup === "number" && typeof a === "number" && lookup === a) return i + 1;
      if (typeof lookup === "string" && typeof a === "string" && excelTrim(lookup).toLowerCase() === excelTrim(a).toLowerCase()) return i + 1;
      if (String(lookup).toLowerCase() === String(a ?? "").toLowerCase()) return i + 1;
    }
    return -1;
  }
  let best = -1;
  if (type === 1) {
    for (let i = 0; i < arr.length; i++) {
      const a = toNumSafe(arr[i]);
      const l = toNumSafe(lookup);
      if (a !== void 0 && l !== void 0 && a <= l) best = i + 1;
    }
  } else if (type === -1) {
    for (let i = 0; i < arr.length; i++) {
      const a = toNumSafe(arr[i]);
      const l = toNumSafe(lookup);
      if (a !== void 0 && l !== void 0 && a >= l && (best === -1 || a <= toNumSafe(arr[best - 1]))) best = i + 1;
    }
  }
  return best;
}
__name(findMatch, "findMatch");
function criteriaMatches(value, criteria) {
  const v = value ?? "";
  if (typeof criteria === "number") return typeof v === "number" ? v === criteria : Number(String(v)) === criteria;
  const crit = excelTrim(criteria);
  if (crit === "") return v === "" || v === null || v === void 0;
  const m = crit.match(/^(<=|>=|<>|<|>|=)?(.*)$/s);
  const op = m?.[1] ?? "=";
  let target = m?.[2] ?? "";
  const numericTarget = toNumSafe(target);
  const numericVal = toNumSafe(v);
  if (op !== "=" && numericTarget !== void 0 && numericVal !== void 0) {
    switch (op) {
      case "<":
        return numericVal < numericTarget;
      case "<=":
        return numericVal <= numericTarget;
      case ">":
        return numericVal > numericTarget;
      case ">=":
        return numericVal >= numericTarget;
      case "<>":
        return numericVal !== numericTarget;
    }
  }
  if (target.includes("*") || target.includes("?")) {
    const rx = "^" + target.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$";
    return new RegExp(rx, "i").test(String(v ?? ""));
  }
  const s1 = String(v ?? "").trim().toLowerCase();
  const s2 = target.trim().toLowerCase();
  if (op === "<>") return s1 !== s2;
  return s1 === s2;
}
__name(criteriaMatches, "criteriaMatches");
function applyFunction(name, args, thisCellAddr) {
  const nums = numbers(args);
  const sum = /* @__PURE__ */ __name(() => nums.reduce((s, v) => s + v, 0), "sum");
  switch (name) {
    case "SUM":
      return sum();
    case "AVERAGE": {
      if (!nums.length) throw new Error("AVERAGE of empty");
      return sum() / nums.length;
    }
    case "MIN": {
      if (!nums.length) throw new Error("MIN of empty");
      return Math.min(...nums);
    }
    case "MAX": {
      if (!nums.length) throw new Error("MAX of empty");
      return Math.max(...nums);
    }
    case "COUNT":
      return nums.length;
    case "COUNTA":
      return flatten(args).filter((v) => v !== "" && v !== void 0 && v !== null).length;
    case "PRODUCT": {
      if (!nums.length) throw new Error("PRODUCT of empty");
      return nums.reduce((p, v) => p * v, 1);
    }
    case "ABS":
      return Math.abs(toNum(args[0]));
    case "INT":
      return Math.trunc(toNum(args[0]));
    case "SQRT": {
      const v = toNum(args[0]);
      if (v < 0) throw new Error("SQRT of negative");
      return Math.sqrt(v);
    }
    case "ROUND": {
      const v = toNum(args[0]);
      const d = args.length > 1 ? toNum(args[1]) : 0;
      const f = Math.pow(10, d);
      return Math.round(v * f) / f;
    }
    case "ROUNDUP": {
      const v = toNum(args[0]);
      const d = args.length > 1 ? toNum(args[1]) : 0;
      const f = Math.pow(10, d);
      return Math.sign(v) * Math.ceil(Math.abs(v) * f) / f;
    }
    case "ROUNDDOWN": {
      const v = toNum(args[0]);
      const d = args.length > 1 ? toNum(args[1]) : 0;
      const f = Math.pow(10, d);
      return Math.sign(v) * Math.floor(Math.abs(v) * f) / f;
    }
    case "MOD": {
      const a = toNum(args[0]), b = toNum(args[1]);
      if (b === 0) throw new Error("MOD by zero");
      return a - b * Math.floor(a / b);
    }
    case "POWER":
      return Math.pow(toNum(args[0]), toNum(args[1]));
    case "IF":
      return truthy(args[0]) ? args[1] : args[2];
    case "SUBTOTAL": {
      const code = Math.abs(toNum(args[0]));
      if (code === 9 || code === 109) {
        const rangeNums = numbers(args.slice(1));
        return rangeNums.reduce((s, v) => s + v, 0);
      }
      throw new Error("SUBTOTAL code " + code + " not supported");
    }
    case "AND":
      return flatten(args).every((a) => truthy(a));
    case "OR":
      return flatten(args).some((a) => truthy(a));
    case "TRIM":
      return excelTrim(args[0]);
    case "PROPER":
      return excelProper(args[0]);
    case "CHOOSE": {
      const idx = Math.floor(toNum(args[0]));
      const candidates = flatten(args.slice(1));
      if (idx < 1 || idx > candidates.length) throw new Error("CHOOSE index out of range");
      return candidates[idx - 1];
    }
    case "DATE":
      return dateToSerial(Math.floor(toNum(args[0])), Math.floor(toNum(args[1])), Math.floor(toNum(args[2])));
    case "WEEKDAY": {
      const serial = toNum(args[0]);
      const type = args.length > 1 ? Math.floor(toNum(args[1])) : 1;
      const { y, m, d } = serialToDate(serial);
      const jsDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      switch (type) {
        case 1:
          return jsDay + 1;
        // 1=Sunday .. 7=Saturday
        case 2:
          return jsDay === 0 ? 7 : jsDay;
        // 1=Monday .. 7=Sunday
        case 3:
          return jsDay;
        // 0=Monday .. 6=Sunday
        default:
          throw new Error("WEEKDAY return_type " + type + " not supported");
      }
    }
    case "COLUMN": {
      const ref = args[0];
      if (ref === void 0) {
        if (!thisCellAddr) throw new Error("COLUMN without ref needs cell context");
        const decoded = utils2.decode_cell(thisCellAddr);
        return decoded.c + 1;
      }
      if (typeof ref === "string") {
        const m = ref.match(/[A-Za-z]{1,3}/);
        if (!m) throw new Error("bad COLUMN ref");
        const colStr = m[0].toUpperCase();
        let col = 0;
        for (const ch of colStr) col = col * 26 + (ch.charCodeAt(0) - 64);
        return col;
      }
      throw new Error("COLUMN of range not supported");
    }
    case "SUMIF": {
      const rangeArg = args[0];
      const criteria = args[1];
      const sumArg = args[2] ?? rangeArg;
      if (!isRange(rangeArg) || !isRange(sumArg)) throw new Error("SUMIF needs ranges");
      const values = rangeArg.values;
      const sums = sumArg.values;
      const out = [];
      for (let i = 0; i < values.length; i++) {
        if (criteriaMatches(values[i], criteria)) out.push(toNumSafe(sums[i] ?? 0) ?? 0);
      }
      return out.reduce((s, v) => s + v, 0);
    }
    case "VLOOKUP": {
      const lookup = args[0];
      const table = args[1];
      const colIdx = Math.floor(toNum(args[2]));
      const approx = args.length > 3 ? truthy(args[3]) : true;
      if (!isRange(table) || colIdx < 1 || colIdx > table.width) throw new Error("VLOOKUP bad table/col");
      const firstCol = [];
      const rows = [];
      for (let r = 0; r < Math.floor(table.values.length / table.width); r++) {
        const row = table.values.slice(r * table.width, (r + 1) * table.width);
        rows.push(row);
        firstCol.push(row[0]);
      }
      const hit = approx ? findMatch(lookup, firstCol, 1) : findMatch(lookup, firstCol, 0);
      if (hit === -1) throw new Error("VLOOKUP no match");
      const val = rows[hit - 1][colIdx - 1];
      return val === void 0 ? "" : val;
    }
    case "MATCH": {
      const lookup = args[0];
      const arr = args[1];
      const type = args.length > 2 ? Math.floor(toNum(args[2])) : 1;
      if (!isRange(arr)) throw new Error("MATCH needs a range");
      const hit = findMatch(lookup, arr.values, type);
      if (hit === -1) throw new Error("MATCH no match");
      return hit;
    }
    case "INDEX": {
      const arr = args[0];
      const rowIdx = Math.floor(toNum(args[1]));
      if (!isRange(arr)) {
        return rowIdx === 1 ? arr : (() => {
          throw new Error("INDEX out of range");
        })();
      }
      if (args.length > 2) {
        const colIdx = Math.floor(toNum(args[2]));
        const pos2 = (rowIdx - 1) * arr.width + (colIdx - 1);
        if (pos2 < 0 || pos2 >= arr.values.length) throw new Error("INDEX out of range");
        return arr.values[pos2] ?? 0;
      }
      const pos = rowIdx - 1;
      if (pos < 0 || pos >= arr.values.length) throw new Error("INDEX out of range");
      return arr.values[pos] ?? 0;
    }
    case "TEXT": {
      const fmt = String(args[1] ?? "");
      if (isRange(args[0])) {
        return {
          __range: true,
          values: args[0].values.map((v) => excelTextFormat(v, fmt)),
          width: args[0].width
        };
      }
      return excelTextFormat(args[0], fmt);
    }
    default:
      throw new Error("unsupported function: " + name);
  }
}
__name(applyFunction, "applyFunction");
function regexRefs(src) {
  const out = [];
  const re = /(?:(?:'([^']+)'|([A-Za-z_][A-Za-z0-9_.]*))!?)?\$?([A-Za-z]{1,3})(\$?)(\d*)(?::\$?([A-Za-z]{1,3})(\$?)(\d*))?/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const [, sheet, sheet2, col, , digits, endCol, , endDigits] = m;
    const nextCh = src[m.index + m[0].length];
    if (digits === "") {
      if (nextCh !== ":") continue;
    } else if (nextCh === "(") {
      continue;
    }
    const addr = `${col}${digits}`;
    if (endCol && endDigits !== "") out.push({
      sheet: sheet ?? sheet2,
      addr,
      end: `${endCol}${endDigits}`
    });
    else if (endCol) out.push({
      sheet: sheet ?? sheet2,
      addr,
      end: `${endCol}`
    });
    else out.push({
      sheet: sheet ?? sheet2,
      addr
    });
  }
  return out;
}
__name(regexRefs, "regexRefs");
function collectReferences(src) {
  const text = src.replace(/^=/, "").trim();
  if (!text) return [];
  try {
    const tokens = tokenize(text);
    const refs = [];
    let pendingSheet;
    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i];
      if (t.type === "sheet") {
        pendingSheet = t.value;
        i++;
        continue;
      }
      if (t.type === "ref") {
        const addr = t.value.replace(/\$/g, "");
        const nxt = tokens[i + 1];
        if (nxt && nxt.type === "op" && nxt.value === "(") {
          i += 2;
          pendingSheet = void 0;
          continue;
        }
        if (nxt && nxt.type === "op" && nxt.value === ":") {
          const endTok = tokens[i + 2];
          if (endTok && endTok.type === "ref") {
            refs.push({
              sheet: pendingSheet,
              addr,
              end: endTok.value.replace(/\$/g, "")
            });
            i += 3;
            pendingSheet = void 0;
            continue;
          }
        }
        refs.push({
          sheet: pendingSheet,
          addr
        });
        i++;
        pendingSheet = void 0;
        continue;
      }
      i++;
    }
    return refs;
  } catch {
    return regexRefs(text);
  }
}
__name(collectReferences, "collectReferences");
function evaluateFormula(wb, ws, formula, depth = 0, currentCellAddr) {
  try {
    const src = formula.trim();
    if (!src.startsWith("=")) return {
      unevaluable: true
    };
    const parser = new Parser(wb, ws, src.slice(1), depth, currentCellAddr);
    const v = parser.parseExpr();
    if (!parser.finished()) return {
      unevaluable: true
    };
    if (v === void 0 || v === null) return {
      value: 0,
      unevaluable: false
    };
    if (typeof v === "number" && !isFinite(v)) return {
      unevaluable: true
    };
    if (typeof v === "boolean") return {
      value: v ? 1 : 0,
      unevaluable: false
    };
    return {
      value: v,
      unevaluable: false
    };
  } catch {
    return {
      unevaluable: true
    };
  }
}
__name(evaluateFormula, "evaluateFormula");

// src/lib/workbook-mapping.ts
import { utils as utils3 } from "xlsx";
var HEADER_KEYWORDS = /description|amount|total|date|revenue|account|name|qty|price|cost|sales|income|expense|balance|number|ref|period|transaction|debit|credit|unit|rate|pct|margin|bills|covers|guests|staff|code|type|category|item|product|service|charge|discount|tax|subtotal|net|gross/i;
var TITLE_KEYWORDS = /^(profit\s*&?\s*loss|balance\s*sheet|trial\s*balance|general\s*ledger|periode|period|month\s*of|input\s*data|auto\s*calc)/i;
function findHeaderRow(ws) {
  const rows = utils3.sheet_to_json(ws, {
    header: 1
  });
  const maxScan = Math.min(rows.length, 20);
  let bestRow = 0;
  let bestScore = 0;
  let bestHeaders = [];
  for (let i = 0; i < maxScan; i++) {
    const row = rows[i] ?? [];
    const nonEmpty = row.filter((c) => c !== "" && c !== void 0 && c !== null);
    const nonEmptyCount = nonEmpty.length;
    if (nonEmptyCount === 0) continue;
    const firstCell = String(row[0] ?? "").trim();
    if (nonEmptyCount <= 2 && TITLE_KEYWORDS.test(firstCell)) continue;
    let headerLikeCount = 0;
    let numericCount = 0;
    for (const cell of nonEmpty) {
      const str = String(cell);
      if (str === "#N/A" || str === "#REF!" || str === "#VALUE!") continue;
      const num = Number(cell);
      const isNumeric = typeof cell === "number" || typeof cell === "string" && /^[\d,.\-]+$/.test(str.trim()) && isFinite(num);
      if (isNumeric && Math.abs(num) > 0) numericCount++;
      else if (HEADER_KEYWORDS.test(str)) headerLikeCount++;
    }
    const textRatio = nonEmptyCount > 0 ? (nonEmptyCount - numericCount) / nonEmptyCount : 0;
    const score = headerLikeCount * 3 + textRatio * 2 + (nonEmptyCount >= 3 ? 1 : 0);
    if (score > bestScore) {
      bestScore = score;
      bestRow = i;
      bestHeaders = row.map((c) => String(c ?? ""));
    }
  }
  if (bestScore < 2 && rows.length > 0) {
    const firstRow = (rows[0] ?? []).map((c) => String(c ?? ""));
    return {
      headerRow: 1,
      headers: firstRow
    };
  }
  return {
    headerRow: bestRow + 1,
    headers: bestHeaders
  };
}
__name(findHeaderRow, "findHeaderRow");
function buildColumnKeys(headers) {
  const seen = /* @__PURE__ */ new Map();
  let emptyColIdx = 0;
  return headers.map((h) => {
    const trimmed = (h || "").toString().trim();
    if (!trimmed) return `__hidden_${emptyColIdx++}`;
    const count = seen.get(trimmed) ?? 0;
    seen.set(trimmed, count + 1);
    return count > 0 ? `${trimmed}_${count}` : trimmed;
  });
}
__name(buildColumnKeys, "buildColumnKeys");

// src/lib/workbook-formulas.ts
function isCellAddress(key) {
  return /^[A-Z]+\d+$/.test(key);
}
__name(isCellAddress, "isCellAddress");
function mapRef(ref, headerCache, wb, formulaSheet) {
  const target = ref.sheet ?? formulaSheet;
  const targetWs = wb.Sheets[target];
  const sheet = ref.sheet ?? "";
  if (!targetWs) {
    return {
      sheet,
      kind: "cell",
      absCell: ref.addr
    };
  }
  let header = headerCache.get(target);
  if (!header) {
    header = findHeaderRow(targetWs);
    headerCache.set(target, header);
  }
  const start2 = mapCellToDataRef(targetWs, ref.addr, header);
  const mapped = {
    sheet,
    kind: ref.end ? "range" : "cell",
    colKey: start2.colKey,
    relRow: start2.relRow,
    absCell: ref.addr
  };
  if (ref.end) {
    const end = mapCellToDataRef(targetWs, ref.end, header);
    mapped.end = {
      colKey: end.colKey,
      relRow: end.relRow,
      absCell: ref.end
    };
  }
  return mapped;
}
__name(mapRef, "mapRef");
function mapCellToDataRef(ws, addr, header) {
  const clean = addr.replace(/\$/g, "");
  if (/^[A-Za-z]+$/.test(clean)) {
    const colIdx = utils4.decode_col(clean);
    const columnKeys2 = buildColumnKeys(header.headers);
    const rawHeader2 = header.headers[colIdx] ?? "";
    return {
      colKey: rawHeader2.trim() ? columnKeys2[colIdx] : void 0,
      relRow: void 0
    };
  }
  const decoded = utils4.decode_cell(clean);
  const relRow = decoded.r - header.headerRow + 1;
  const columnKeys = buildColumnKeys(header.headers);
  const rawHeader = header.headers[decoded.c] ?? "";
  return {
    colKey: rawHeader.trim() ? columnKeys[decoded.c] : void 0,
    relRow: relRow >= 1 ? relRow : void 0
  };
}
__name(mapCellToDataRef, "mapCellToDataRef");
function buildWorkbookFormulaMap(wb) {
  const map = {};
  const headerCache = /* @__PURE__ */ new Map();
  for (const tabName of wb.SheetNames) {
    const ws = wb.Sheets[tabName];
    const header = findHeaderRow(ws);
    const columnKeys = buildColumnKeys(header.headers);
    const headerCacheKey = tabName;
    headerCache.set(headerCacheKey, header);
    const formulas = [];
    for (const key of Object.keys(ws)) {
      if (key === "!ref" || key === "!margins" || key === "!merges" || key === "!cols" || key === "!rows") continue;
      if (!isCellAddress(key)) continue;
      const cell = ws[key];
      if (!cell || typeof cell.f !== "string" || cell.f.trim() === "") continue;
      const formula = cell.f.trim().startsWith("=") ? cell.f.trim() : "=" + cell.f.trim();
      const decoded = utils4.decode_cell(key);
      const relRow = decoded.r - header.headerRow + 1;
      const rawHeader = header.headers[decoded.c] ?? "";
      const refs = [];
      for (const rawRef of collectReferences(formula)) {
        refs.push(mapRef(rawRef, headerCache, wb, tabName));
      }
      const result = evaluateFormula(wb, ws, formula, 0, key);
      formulas.push({
        cell: key,
        formula,
        colKey: rawHeader.trim() ? columnKeys[decoded.c] : void 0,
        relRow: relRow >= 1 ? relRow : void 0,
        absRow: decoded.r + 1,
        absCol: decoded.c + 1,
        value: result.unevaluable ? void 0 : result.value,
        unevaluable: result.unevaluable,
        refs
      });
    }
    map[tabName] = {
      headerRow: header.headerRow,
      headers: header.headers,
      columnKeys,
      formulas
    };
  }
  return map;
}
__name(buildWorkbookFormulaMap, "buildWorkbookFormulaMap");

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
async function saveWorkbookFormulaMapStep(buffers, dbUrl) {
  let total = 0;
  try {
    const wb = read2(buffers[0], {
      type: "buffer",
      cellFormula: true
    });
    const formulaMap = buildWorkbookFormulaMap(wb);
    total = Object.values(formulaMap).reduce((n, s) => n + s.formulas.length, 0);
    await withPgClient(dbUrl, async (db) => {
      await executeOne(db, `INSERT INTO knowledge_snippets (id, key, category, content)
         VALUES (gen_random_uuid()::TEXT, $1, 'cache', $2)
         ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;`, [
        "workbook_formulas",
        JSON.stringify(formulaMap)
      ]);
    });
  } catch (err) {
    console.warn("[workbook-ingest] Formula map step skipped:", err instanceof Error ? err.message : String(err));
    return 0;
  }
  return total;
}
__name(saveWorkbookFormulaMapStep, "saveWorkbookFormulaMapStep");
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
async function upsertSheetPagesStep(comprehension, dbUrl, tenantSlug) {
  const created = [];
  let sortOrder = 100;
  await withPgClient(dbUrl, async (db) => {
    for (const sheet of comprehension.sheets) {
      const slug = `sheet-${normalizeSlug(sheet.tabName)}`;
      const blocks = SHEET_CATEGORY_BLOCKS[sheet.category] ?? SHEET_CATEGORY_BLOCKS.other;
      const pageRows = await queryRows(db, `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug)
         VALUES (gen_random_uuid()::TEXT, $1, $2, 'google', $3, $4, true, $5)
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           auth_tier = EXCLUDED.auth_tier,
           sort_order = EXCLUDED.sort_order,
           nav_label = EXCLUDED.nav_label,
           show_in_nav = EXCLUDED.show_in_nav,
           tenant_slug = COALESCE(EXCLUDED.tenant_slug, app_pages.tenant_slug)
         RETURNING id;`, [
        slug,
        sheet.title,
        sortOrder++,
        sheet.title,
        tenantSlug ?? null
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
    const excelFolder = await queryRows(db, `SELECT id FROM navigation_items WHERE title = $1 AND parent_id IS NULL LIMIT 1`, [
      "Excel"
    ]);
    let excelId = excelFolder[0]?.id;
    if (!excelId) {
      const created2 = await queryRows(db, `INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, required_groups, is_visible, is_dynamic)
         VALUES (gen_random_uuid()::TEXT, NULL, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM navigation_items WHERE parent_id IS NULL),
         'Excel', '/excel', 'Folder', CAST('google' AS "AuthTier"), 'viewer,ops-admin,finance,platform-admin', true, true)
         RETURNING id`);
      excelId = created2[0]?.id;
    }
    if (excelId) {
      let navSort = 0;
      for (const sheet of comprehension.sheets) {
        const slug = `sheet-${normalizeSlug(sheet.tabName)}`;
        const existing = await queryRows(db, `SELECT id FROM navigation_items WHERE path = $1 AND parent_id = $2 LIMIT 1`, [
          `/${slug}`,
          excelId
        ]);
        if (existing.length === 0) {
          await executeOne(db, `INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, required_groups, is_visible, is_dynamic)
             VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, 'Description', CAST('google' AS "AuthTier"), '', true, true)`, [
            excelId,
            navSort++,
            sheet.title,
            `/${slug}`
          ]);
        }
      }
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
registerStepFunction3("step//./workflows/workbook-ingest/steps//saveWorkbookFormulaMapStep", saveWorkbookFormulaMapStep);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2xpYi9wYWdlLWNhdGFsb2cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL3dvcmtmbG93L3NyYy9pbnRlcm5hbC9idWlsdGlucy50cyIsICIuLi9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL3N0ZGxpYi50cyIsICIuLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLnRzIiwgIi4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svZXh0cmFjdC1zaGVldHMudHMiLCAiLi4vc3JjL2RvbWFpbi9haS13b3JrYm9vay9zaGVldC1hbmFseXNpcy50cyIsICIuLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL2NvbXByZWhlbmQudHMiLCAiLi4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9wcm9ncmVzcy50cyIsICIuLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L2RiLnRzIiwgIi4uL3NyYy9saWIvd29ya2Jvb2stZm9ybXVsYXMudHMiLCAiLi4vc3JjL2xpYi9leGNlbC1mb3JtdWxhLnRzIiwgIi4uL3NyYy9saWIvd29ya2Jvb2stbWFwcGluZy50cyIsICIuLi9ub2RlX21vZHVsZXMvQHdvcmtmbG93L2J1aWxkZXJzL3NyYy9zZXJkZS1jaGVja2VyLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvcnVudGltZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHdvcmtmbG93L2NvcmUvc3JjL3dvcmtmbG93LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvcnVudGltZS9yZXN1bWUtaG9vay50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBDb2RlLWZpcnN0IHBhZ2UgY2F0YWxvZyBcdTIwMTQgcnVudGltZSBTU29UIGF0IE1WUC5cbiAqIFN1cHBvcnRzIHN0YXRpYyBjYXRhbG9nIGVudHJpZXMgYW5kIGR5bmFtaWNhbGx5IHJlZ2lzdGVyZWQgcGFnZXNcbiAqIChlLmcuIGZyb20gd29ya2Jvb2sgYW5hbHlzaXMgYWZ0ZXIgYW4gRXhjZWwgdXBsb2FkKS5cbiAqXG4gKiBEQiBBcHBQYWdlL1BhZ2VTZWN0aW9uIHNlZWRlZCBpbiBQNjsgY2F0YWxvZyB3aW5zIGF0IHJ1bnRpbWUuXG4gKi8gLyoqIFBhcnRzIGZyb20gdGhlIHVwbG9hZGVkIEJ1c2luZXNzIFJldmlldyBcdTIwMTQgcG9wdWxhdGVkIGR5bmFtaWNhbGx5IGF0IHJlbmRlciB0aW1lLiAqLyAvKiogU3RhdGljIHBhcnRzIEFcdTIwMTNHIGV4aXN0IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdpdGggbGVnYWN5IHNlZWRlZCBkb2NzLiBEeW5hbWljIHBhcnRzIG92ZXJyaWRlIHRoZXNlLiAqLyBjb25zdCBTVEFUSUNfUEFSVFMgPSB7XG4gICAgJ3BhcnQtYSc6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWEnLFxuICAgICAgICBwYXJ0S2V5OiAnQScsXG4gICAgICAgIHRpdGxlOiAnUGFydCBBOiBDdXJyZW50IFNpdHVhdGlvbiBcdTIwMTQgVGhlIE51bWJlcnMnLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWInOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1iJyxcbiAgICAgICAgcGFydEtleTogJ0InLFxuICAgICAgICB0aXRsZTogJ1BhcnQgQjogVGhlIDEwLVllYXIgR3Jvd3RoIE1vZGVsJyxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnXG4gICAgfSxcbiAgICAncGFydC1jJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtYycsXG4gICAgICAgIHBhcnRLZXk6ICdDJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEM6IFJldmVudWUgT3B0aW1pemF0aW9uIFN0cmF0ZWd5JyxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnXG4gICAgfSxcbiAgICAncGFydC1kJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtZCcsXG4gICAgICAgIHBhcnRLZXk6ICdEJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEQ6IENvc3QgTWFuYWdlbWVudCcsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtZSc6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWUnLFxuICAgICAgICBwYXJ0S2V5OiAnRScsXG4gICAgICAgIHRpdGxlOiAnUGFydCBFOiBSaXNrIFJlZ2lzdGVyJyxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnXG4gICAgfSxcbiAgICAncGFydC1mJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtZicsXG4gICAgICAgIHBhcnRLZXk6ICdGJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEY6IFN0YXJXT1JMRCBNZW1iZXJzaGlwIFByb2dyYW0nLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWcnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1nJyxcbiAgICAgICAgcGFydEtleTogJ0cnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRzogSW1tZWRpYXRlIEFjdGlvbnMgKE5leHQgMzAgRGF5cyknLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9XG59O1xuLyoqIER5bmFtaWMgcGFydHMgcG9wdWxhdGVkIGZyb20gcGFyc2VkIEJ1c2luZXNzIFJldmlldyBNRCB1cGxvYWRlZCB2aWEgL2NvbmZpZy4gKi8gbGV0IERZTkFNSUNfUEFSVFMgPSB7fTtcbmV4cG9ydCBmdW5jdGlvbiBzZXREeW5hbWljUmV2aWV3UGFydHMocGFydHMpIHtcbiAgICBEWU5BTUlDX1BBUlRTID0gT2JqZWN0LmZyb21FbnRyaWVzKHBhcnRzLm1hcCgocCk9PltcbiAgICAgICAgICAgIHAucGFydFNsdWcsXG4gICAgICAgICAgICBwXG4gICAgICAgIF0pKTtcbn1cbi8qKlxuICogRHluYW1pYyBnZXR0ZXIgdGhhdCBtZXJnZXMgc3RhdGljICsgYW55IHJ1bnRpbWUtcmVnaXN0ZXJlZCBwYXJ0cy5cbiAqIFVzZSBpbnN0ZWFkIG9mIFJFVklFV19QQVJUX0NBVEFMT0cgc28gdGhhdCBzZXREeW5hbWljUmV2aWV3UGFydHMoKSBjYWxsc1xuICogYXJlIHJlZmxlY3RlZCBpbW1lZGlhdGVseS5cbiAqLyBleHBvcnQgZnVuY3Rpb24gZ2V0UmV2aWV3UGFydENhdGFsb2coKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLi4uU1RBVElDX1BBUlRTLFxuICAgICAgICAuLi5EWU5BTUlDX1BBUlRTXG4gICAgfTtcbn1cbi8qKiBAZGVwcmVjYXRlZCBVc2UgZ2V0UmV2aWV3UGFydENhdGFsb2coKSBcdTIwMTQgdGhpcyBjb25zdCBpcyBmcm96ZW4gYXQgbW9kdWxlIGxvYWQgdGltZS4gKi8gZXhwb3J0IGNvbnN0IFJFVklFV19QQVJUX0NBVEFMT0cgPSB7XG4gICAgLi4uU1RBVElDX1BBUlRTLFxuICAgIC4uLkRZTkFNSUNfUEFSVFNcbn07XG4vKiogRHluYW1pYyBwYWdlcyByZWdpc3RlcmVkIGF0IHJ1bnRpbWUgKGUuZy4gZnJvbSB3b3JrYm9vayBhbmFseXNpcyBhZnRlciByZXNlZWQpLiAqLyBsZXQgRFlOQU1JQ19QQUdFUyA9IHt9O1xuLyoqXG4gKiBSZWdpc3RlciBkeW5hbWljYWxseSBnZW5lcmF0ZWQgcGFnZXMgXHUyMDE0IGNhbGxlZCBhZnRlciB3b3JrYm9vayBhbmFseXNpc1xuICogZHVyaW5nIHRoZSByZXNlZWQgcGlwZWxpbmUgc28gc2hlZXQtZGVyaXZlZCBhbmFseXRpY3MgcGFnZXMgYXBwZWFyIGluIHRoZSBuYXYuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIHNldER5bmFtaWNQYWdlcyhwYWdlcykge1xuICAgIERZTkFNSUNfUEFHRVMgPSBPYmplY3QuZnJvbUVudHJpZXMocGFnZXMubWFwKChwKT0+W1xuICAgICAgICAgICAgcC5zbHVnLFxuICAgICAgICAgICAgcFxuICAgICAgICBdKSk7XG59XG4vKiogQ29tYmluZWQgc3RhdGljICsgZHluYW1pYyBwYWdlIGNhdGFsb2cgKGV2YWx1YXRlZCBsYXppbHkgc28gZHluYW1pYyBwYWdlcyBhcmUgaW5jbHVkZWQpLiAqLyBleHBvcnQgZnVuY3Rpb24gZ2V0RnVsbENhdGFsb2coKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLi4uUEFHRV9DQVRBTE9HLFxuICAgICAgICAuLi5EWU5BTUlDX1BBR0VTXG4gICAgfTtcbn1cbmV4cG9ydCBjb25zdCBQQUdFX0NBVEFMT0cgPSB7XG4gICAgaG9tZToge1xuICAgICAgICBzbHVnOiAnaG9tZScsXG4gICAgICAgIHRpdGxlOiAnSG9tZScsXG4gICAgICAgIG5hdkxhYmVsOiAnSG9tZScsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwdWJsaWMnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2hlcm8nLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBoZWFkbGluZTogJ1dlbGNvbWUnLFxuICAgICAgICAgICAgICAgICAgICBzdWJ0aXRsZTogJ1lvdXIgYnVzaW5lc3MgYXBwbGljYXRpb24gXHUyMDE0IGNvbmZpZ3VyZSBwYWdlcywgZGF0YSBhbmQgYnJhbmRpbmcgZnJvbSB0aGUgQWRtaW4gYXJlYS4nLFxuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAncHVibGljJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgZGFzaGJvYXJkOiB7XG4gICAgICAgIHNsdWc6ICdkYXNoYm9hcmQnLFxuICAgICAgICB0aXRsZTogJ0Rhc2hib2FyZCcsXG4gICAgICAgIG5hdkxhYmVsOiAnRGFzaGJvYXJkJyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnaGVybycsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGJhZGdlOiAnSnVseSAyMDI2IFx1MDBCNyBFeGl0IFZpYWJpbGl0eSBSZXZpZXcnLFxuICAgICAgICAgICAgICAgICAgICBoZWFkbGluZTogJ0J1c2luZXNzIFJldmlldycsXG4gICAgICAgICAgICAgICAgICAgIHN1YnRpdGxlOiAnRXhpdC12aWFiaWxpdHkgYXNzZXNzbWVudCBmb3IgUFQgVGFtYW4gQmludGFuZyBCYWxpIFx1MjAxNCByZXZlbnVlIHVuZGVyIHByZXNzdXJlLCBtYXJnaW4gZXJvc2lvbiBkZXRlY3RlZCwgc2hhcmVob2xkZXIgc2Vla2luZyBwYXRod2F5IG91dC4nLFxuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAncHVibGljJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgIGJsb2NrVHlwZTogJ2NoYXJ0X2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICAvLyAgIGNvbmZpZzogeyB2YXJpYW50OiAnZGFzaGJvYXJkJywgc2NlbmFyaW86ICdjb25zZXJ2YXRpdmUnLCBtaW5UaWVyOiAnZ29vZ2xlJyB9LFxuICAgICAgICAgICAgLy8gfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdhY3Rpb25fY2hlY2tsaXN0JyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgbWluVGllcjogJ3BpbidcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ21ldHJpY19ncmlkJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgbWluVGllcjogJ2dvb2dsZSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2xldmVyX2FjY29yZGlvbicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnVGhlIDUgTGV2ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgbWluVGllcjogJ2dvb2dsZSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgIHN1bW1hcnk6IHtcbiAgICAgICAgc2x1ZzogJ3N1bW1hcnknLFxuICAgICAgICB0aXRsZTogJ0V4ZWN1dGl2ZSBTdW1tYXJ5JyxcbiAgICAgICAgbmF2TGFiZWw6ICdTdW1tYXJ5JyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZScsXG4gICAgICAgIHBkZkV4cG9ydDogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdkb2NfbWFya2Rvd24nLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6ICdleGVjdXRpdmUtc3VtbWFyeSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgICdvcHMtYWRtaW4nOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtYWRtaW4nLFxuICAgICAgICB0aXRsZTogJ09wcyBBZG1pbicsXG4gICAgICAgIG5hdkxhYmVsOiAnT3BzIEFkbWluJyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ3BpbicsXG4gICAgICAgIHJlcXVpcmVkR3JvdXBzOiBbXG4gICAgICAgICAgICAnb3BzLWFkbWluJ1xuICAgICAgICBdLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ29wc19hZG1pbl90YWJzJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgIHJldmlldzoge1xuICAgICAgICBzbHVnOiAncmV2aWV3JyxcbiAgICAgICAgdGl0bGU6ICdCdXNpbmVzcyBSZXZpZXcnLFxuICAgICAgICBuYXZMYWJlbDogJ1JldmlldycsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnLFxuICAgICAgICBwZGZFeHBvcnQ6IHRydWUsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAncmV2aWV3X2Jsb2NrcycsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICAnb3BzLXRyYWNraW5nJzoge1xuICAgICAgICBzbHVnOiAnb3BzLXRyYWNraW5nJyxcbiAgICAgICAgdGl0bGU6ICdGaW5hbmNpYWwgVHJhY2tpbmcnLFxuICAgICAgICBuYXZMYWJlbDogJ1RyYWNraW5nJyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZScsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAna3BpX2NhcmRzJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudDogJ29wcydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ3JlcG9ydHNfcm9sbHVwJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXJ0X2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ6ICdvcHMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdwbmxfdGFibGUnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ29wcy1jaGF0Jzoge1xuICAgICAgICBzbHVnOiAnb3BzLWNoYXQnLFxuICAgICAgICB0aXRsZTogJ0FJIENoYXQnLFxuICAgICAgICBuYXZMYWJlbDogJ0FJIENoYXQnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdjaGF0X3BhbmVsJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgIHRhc2tzOiB7XG4gICAgICAgIHNsdWc6ICd0YXNrcycsXG4gICAgICAgIHRpdGxlOiAnRXhpdC1WaWFiaWxpdHkgVGFza3MnLFxuICAgICAgICBuYXZMYWJlbDogJ1Rhc2tzJyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZScsXG4gICAgICAgIHNlY3Rpb25zOiBbXVxuICAgIH0sXG4gICAgYWRtaW46IHtcbiAgICAgICAgc2x1ZzogJ2FkbWluJyxcbiAgICAgICAgdGl0bGU6ICdQbGF0Zm9ybSBBZG1pbicsXG4gICAgICAgIG5hdkxhYmVsOiAnQWRtaW4nLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICBjb25maWc6IHtcbiAgICAgICAgc2x1ZzogJ2NvbmZpZycsXG4gICAgICAgIHRpdGxlOiAnU291cmNlIENvbmZpZycsXG4gICAgICAgIG5hdkxhYmVsOiAnQ29uZmlnJyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ3BpbicsXG4gICAgICAgIHNlY3Rpb25zOiBbXVxuICAgIH0sXG4gICAgJ3Rlcm1zLW9mLXNlcnZpY2UnOiB7XG4gICAgICAgIHNsdWc6ICd0ZXJtcy1vZi1zZXJ2aWNlJyxcbiAgICAgICAgdGl0bGU6ICdUZXJtcyBvZiBTZXJ2aWNlJyxcbiAgICAgICAgc2hvd0luTmF2OiBmYWxzZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwdWJsaWMnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ3Rlcm1zLW9mLXNlcnZpY2UuaHRtbCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgICdwcml2YWN5LXBvbGljeSc6IHtcbiAgICAgICAgc2x1ZzogJ3ByaXZhY3ktcG9saWN5JyxcbiAgICAgICAgdGl0bGU6ICdQcml2YWN5IFBvbGljeScsXG4gICAgICAgIHNob3dJbk5hdjogZmFsc2UsXG4gICAgICAgIGF1dGhUaWVyOiAncHVibGljJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdkb2NfbWFya2Rvd24nLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6ICdwcml2YWN5LXBvbGljeS5odG1sJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH1cbn07XG5jb25zdCBUSUVSX1JBTksgPSB7XG4gICAgcHVibGljOiAwLFxuICAgIHBpbjogMSxcbiAgICBnb29nbGU6IDJcbn07XG5leHBvcnQgZnVuY3Rpb24gdGllckFsbG93c0FjY2VzcyhjdXJyZW50LCByZXF1aXJlZCkge1xuICAgIHJldHVybiBUSUVSX1JBTktbY3VycmVudF0gPj0gVElFUl9SQU5LW3JlcXVpcmVkXTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBsaXN0TmF2UGFnZXModGllciwgZ3JvdXBzID0gW10pIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhnZXRGdWxsQ2F0YWxvZygpKS5maWx0ZXIoKHApPT5wLnNob3dJbk5hdiAhPT0gZmFsc2UpLmZpbHRlcigocCk9PnRpZXJBbGxvd3NBY2Nlc3ModGllciwgcC5hdXRoVGllcikpLmZpbHRlcigocCk9PiFwLnJlcXVpcmVkR3JvdXBzIHx8IHAucmVxdWlyZWRHcm91cHMubGVuZ3RoID09PSAwIHx8IGdyb3Vwcy5pbmNsdWRlcygncGxhdGZvcm0tYWRtaW4nKSB8fCBwLnJlcXVpcmVkR3JvdXBzLnNvbWUoKGcpPT5ncm91cHMuaW5jbHVkZXMoZykpKS5zb3J0KChhLCBiKT0+YS50aXRsZS5sb2NhbGVDb21wYXJlKGIudGl0bGUpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUGFnZShzbHVnKSB7XG4gICAgcmV0dXJuIGdldEZ1bGxDYXRhbG9nKClbc2x1Z10gPz8gbnVsbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUmV2aWV3UGFydChwYXJ0U2x1Zykge1xuICAgIHJldHVybiBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpW3BhcnRTbHVnXSA/PyBudWxsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxpc3RSZXZpZXdQYXJ0cygpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpKS5zb3J0KChhLCBiKT0+YS5wYXJ0S2V5LmxvY2FsZUNvbXBhcmUoYi5wYXJ0S2V5KSk7XG59XG4vKiogRGVzY3JpcHRpdmUgdGl0bGUgd2l0aG91dCB0aGUgXCJQYXJ0IFg6IFwiIGNhdGFsb2cgcHJlZml4LiAqLyBleHBvcnQgZnVuY3Rpb24gZ2V0UmV2aWV3UGFydERpc3BsYXlUaXRsZSh0aXRsZSkge1xuICAgIHJldHVybiB0aXRsZS5yZXBsYWNlKC9eUGFydCBbQS1PXTogLywgJycpO1xufVxuIiwgIi8qKlxuICogVGhlc2UgYXJlIHRoZSBidWlsdC1pbiBzdGVwcyB0aGF0IGFyZSBcImF1dG9tYXRpY2FsbHkgYXZhaWxhYmxlXCIgaW4gdGhlIHdvcmtmbG93IHNjb3BlLiBUaGV5IGFyZVxuICogc2ltaWxhciB0byBcInN0ZGxpYlwiIGV4Y2VwdCB0aGF0IGFyZSBub3QgbWVhbnQgdG8gYmUgaW1wb3J0ZWQgYnkgdXNlcnMsIGJ1dCBhcmUgaW5zdGVhZCBcImp1c3QgYXZhaWxhYmxlXCJcbiAqIGFsb25nc2lkZSB1c2VyIGRlZmluZWQgc3RlcHMuIFRoZXkgYXJlIHVzZWQgaW50ZXJuYWxseSBieSB0aGUgcnVudGltZVxuICovXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfYXJyYXlfYnVmZmVyKFxuICB0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2Vcbikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy5hcnJheUJ1ZmZlcigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX2pzb24odGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmpzb24oKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV90ZXh0KHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZSkge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy50ZXh0KCk7XG59XG4iLCAiLyoqXG4gKiBUaGlzIGlzIHRoZSBcInN0YW5kYXJkIGxpYnJhcnlcIiBvZiBzdGVwcyB0aGF0IHdlIG1ha2UgYXZhaWxhYmxlIHRvIGFsbCB3b3JrZmxvdyB1c2Vycy5cbiAqIFRoZSBjYW4gYmUgaW1wb3J0ZWQgbGlrZSBzbzogYGltcG9ydCB7IGZldGNoIH0gZnJvbSAnd29ya2Zsb3cnYC4gYW5kIHVzZWQgaW4gd29ya2Zsb3cuXG4gKiBUaGUgbmVlZCB0byBiZSBleHBvcnRlZCBkaXJlY3RseSBpbiB0aGlzIHBhY2thZ2UgYW5kIGNhbm5vdCBsaXZlIGluIGBjb3JlYCB0byBwcmV2ZW50XG4gKiBjaXJjdWxhciBkZXBlbmRlbmNpZXMgcG9zdC1jb21waWxhdGlvbi5cbiAqL1xuXG4vKipcbiAqIEEgaG9pc3RlZCBgZmV0Y2goKWAgZnVuY3Rpb24gdGhhdCBpcyBleGVjdXRlZCBhcyBhIFwic3RlcFwiIGZ1bmN0aW9uLFxuICogZm9yIHVzZSB3aXRoaW4gd29ya2Zsb3cgZnVuY3Rpb25zLlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0ZldGNoX0FQSVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2goLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgZ2xvYmFsVGhpcy5mZXRjaD4pIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIGdsb2JhbFRoaXMuZmV0Y2goLi4uYXJncyk7XG59XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuLyoqXG4gKiBTdGVwIGZ1bmN0aW9ucyBmb3IgdGhlIHdvcmtib29rLWluZ2VzdCB3b3JrZmxvdy5cbiAqXG4gKiBFYWNoIGV4cG9ydGVkIGFzeW5jIGZ1bmN0aW9uIHdpdGggdGhlIGAndXNlIHN0ZXAnYCBkaXJlY3RpdmUgaXMgYSBkdXJhYmxlXG4gKiBzdGVwOiBpdHMgYXJncyBhbmQgcmVzdWx0IGFyZSBzZXJpYWxpemVkIHRvIHRoZSBldmVudCBsb2csIGFuZCBpdCByZXRyaWVzXG4gKiAobWF4IDMsIG9yIHBlciBSZXRyeWFibGVFcnJvcikgYmVmb3JlIHRoZSBlcnJvciBidWJibGVzIHRvIHRoZSB3b3JrZmxvdy5cbiAqLyBpbXBvcnQgeyBGYXRhbEVycm9yLCBSZXRyeWFibGVFcnJvciB9IGZyb20gJ3dvcmtmbG93JztcbmltcG9ydCB7IGV4dHJhY3RTaGVldHNXaXRoU3RhdHMgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL2V4dHJhY3Qtc2hlZXRzJztcbmltcG9ydCB7IGFuYWx5emVTaGVldHMgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL3NoZWV0LWFuYWx5c2lzJztcbmltcG9ydCB7IGNvbXByZWhlbmRPbmNlLCBDb21wcmVoZW5kSHR0cEVycm9yLCBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yIH0gZnJvbSAnLi4vLi4vc3JjL2RvbWFpbi9haS13b3JrYm9vay9jb21wcmVoZW5kJztcbmltcG9ydCB7IHdyaXRlUHJvZ3Jlc3NDaHVuaywgY2xvc2VQcm9ncmVzc1N0cmVhbSB9IGZyb20gJy4vcHJvZ3Jlc3MnO1xuaW1wb3J0IHsgd2l0aFBnQ2xpZW50LCBleGVjdXRlT25lLCBxdWVyeVJvd3MgfSBmcm9tICcuL2RiJztcbmltcG9ydCB7IHJlYWQgfSBmcm9tICd4bHN4JztcbmltcG9ydCB7IGJ1aWxkV29ya2Jvb2tGb3JtdWxhTWFwIH0gZnJvbSAnLi4vLi4vc3JjL2xpYi93b3JrYm9vay1mb3JtdWxhcyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wid29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy50c1wiOntcImFuYWx5emVTaGVldHNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2FuYWx5emVTaGVldHNTdGVwXCJ9LFwiY2xvc2VQcm9ncmVzc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vY2xvc2VQcm9ncmVzc1N0ZXBcIn0sXCJjb21wcmVoZW5kV29ya2Jvb2tTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2NvbXByZWhlbmRXb3JrYm9va1N0ZXBcIn0sXCJlbWl0UHJvZ3Jlc3NTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2VtaXRQcm9ncmVzc1N0ZXBcIn0sXCJleHRyYWN0U2hlZXRzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9leHRyYWN0U2hlZXRzU3RlcFwifSxcImdlbmVyYXRlQnVzaW5lc3NSZXZpZXdTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlQnVzaW5lc3NSZXZpZXdTdGVwXCJ9LFwiZ2VuZXJhdGVEYXNoYm9hcmRTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlRGFzaGJvYXJkU3RlcFwifSxcImdlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcFwifSxcImxvYWRXb3JrYm9va1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vbG9hZFdvcmtib29rU3RlcFwifSxcInBvcHVsYXRlUHJvamVjdGlvbnNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3BvcHVsYXRlUHJvamVjdGlvbnNTdGVwXCJ9LFwicmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3JlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcFwifSxcInNhdmVTbmlwcGV0c1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2F2ZVNuaXBwZXRzU3RlcFwifSxcInNhdmVXb3JrYm9va0Zvcm11bGFNYXBTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NhdmVXb3JrYm9va0Zvcm11bGFNYXBTdGVwXCJ9LFwic2VsZWN0VGVtcGxhdGVTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NlbGVjdFRlbXBsYXRlU3RlcFwifSxcInVwc2VydFNoZWV0UGFnZXNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3Vwc2VydFNoZWV0UGFnZXNTdGVwXCJ9fX19Ki87XG4vKiogRGV0ZWN0IHRoZSBmaWxlIHNpZ25hdHVyZXMgb2YgcmVhbCBzcHJlYWRzaGVldCBmaWxlcyAoemlwL3hsc3gsIEJJRkYveGxzKS4gKi8gZnVuY3Rpb24gaGFzU3ByZWFkc2hlZXRNYWdpYyhkYXRhKSB7XG4gICAgY29uc3QgYiA9IGRhdGE7XG4gICAgLy8gUEtcXHgwM1xceDA0ICh6aXAgXHUyMTkyIHhsc3gpIG9yIFBLXFx4MDVcXHgwNiAoZW1wdHkgemlwKVxuICAgIGlmIChiWzBdID09PSAweDUwICYmIGJbMV0gPT09IDB4NGIpIHJldHVybiB0cnVlO1xuICAgIC8vIEQwIENGIDExIEUwIEExIEIxIDFBIEUxIChPTEUyIGNvbXBvdW5kIFx1MjE5MiAueGxzKVxuICAgIGlmIChiWzBdID09PSAweGQwICYmIGJbMV0gPT09IDB4Y2YgJiYgYlsyXSA9PT0gMHgxMSAmJiBiWzNdID09PSAweGUwICYmIGJbNF0gPT09IDB4YTEgJiYgYls1XSA9PT0gMHhiMSAmJiBiWzZdID09PSAweDFhICYmIGJbN10gPT09IDB4ZTEpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbi8qKlxuICogQ29udmVydCByYXcgdXBsb2FkIGJ5dGVzIGludG8geGxzeCBidWZmZXJzLlxuICpcbiAqIFVpbnQ4QXJyYXkgaXMgc2VyaWFsaXphYmxlIGFjcm9zcyB0aGUgd29ya2Zsb3cgYm91bmRhcnk7IEJ1ZmZlciBpcyBub3RcbiAqIGd1YXJhbnRlZWQgaW4gd29ya2Zsb3cgc3RlcCBzYW5kYm94ZXMsIHNvIHdlIGtlZXAgVWludDhBcnJheSBldmVyeXdoZXJlXG4gKiBhbmQgaGFuZCBpdCBkaXJlY3RseSB0byBgeGxzeC5yZWFkKHsgdHlwZTogJ2J1ZmZlcicgfSlgLlxuICpcbiAqIFNoZWV0SlMgaXMgbGVuaWVudCB3aXRoIGFyYml0cmFyeSB0ZXh0IChpdCBwYXJzZXMgcGxhaW4gdGV4dCBhcyBhIDEtY29sdW1uXG4gKiBzaGVldCksIHNvIHdlIHZhbGlkYXRlIHRoZSBtYWdpYyBieXRlcyBCRUZPUkUgcGFyc2luZyB0byBjYXRjaCB1cGxvYWRzIG9mXG4gKiB0aGUgd3JvbmcgZmlsZSB0eXBlIHdpdGggYSBjbGVhbiBGYXRhbEVycm9yLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkV29ya2Jvb2tTdGVwKGZpbGVzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGZpbGVzKSB8fCBmaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoJ05vIHdvcmtib29rIGZpbGVzIHdlcmUgcHJvdmlkZWQuJyk7XG4gICAgfVxuICAgIHJldHVybiBmaWxlcy5tYXAoKGYpPT57XG4gICAgICAgIGlmICghZiB8fCB0eXBlb2YgZi5uYW1lICE9PSAnc3RyaW5nJyB8fCAhKGYuZGF0YSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcignSW52YWxpZCBmaWxlIGVudHJ5OiBleHBlY3RlZCB7IG5hbWUsIGRhdGE6IFVpbnQ4QXJyYXkgfS4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZi5kYXRhLmJ5dGVMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBXb3JrYm9vayBcIiR7Zi5uYW1lfVwiIGlzIGVtcHR5LmApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaGFzU3ByZWFkc2hlZXRNYWdpYyhmLmRhdGEpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgV29ya2Jvb2sgXCIke2YubmFtZX1cIiBpcyBub3QgYSByZWFkYWJsZSAueGxzeC8ueGxzIGZpbGUgKHVuZXhwZWN0ZWQgZmlsZSBzaWduYXR1cmUpLmApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmLmRhdGE7XG4gICAgfSk7XG59XG4vKiogRVhUUkFDVDogc2VyaWFsaXplIGV2ZXJ5IHNoZWV0IHRvIHRleHQgKyBzdHJ1Y3R1cmFsIHN0YXRzLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXh0cmFjdFNoZWV0c1N0ZXAoYnVmZmVycykge1xuICAgIGNvbnN0IGFsbCA9IFtdO1xuICAgIGZvciAoY29uc3QgYnVmIG9mIGJ1ZmZlcnMpe1xuICAgICAgICBsZXQgZXh0cmFjdGVkO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZXh0cmFjdGVkID0gZXh0cmFjdFNoZWV0c1dpdGhTdGF0cyhidWYpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBXb3JrYm9vayBpcyBub3QgYSByZWFkYWJsZSAueGxzeCBmaWxlOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gKTtcbiAgICAgICAgfVxuICAgICAgICBhbGwucHVzaCguLi5leHRyYWN0ZWQpO1xuICAgIH1cbiAgICBpZiAoYWxsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcignV29ya2Jvb2sgY29udGFpbnMgbm8gcmVhZGFibGUgc2hlZXRzLicpO1xuICAgIH1cbiAgICByZXR1cm4gYWxsO1xufVxuLyoqIEFOQUxZWkU6IGRldGVybWluaXN0aWMgcHJlLXBhc3MgcHJvZHVjaW5nIHN0cnVjdHVyZWQgaGludHMuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBhbmFseXplU2hlZXRzU3RlcChzaGVldHMpIHtcbiAgICByZXR1cm4gYW5hbHl6ZVNoZWV0cyhzaGVldHMpO1xufVxuLyoqXG4gKiBGT1JNVUxBIE1BUDogZmluZCBldmVyeSBmb3JtdWxhIGNlbGwgaW4gdGhlIGltcG9ydGVkIHdvcmtib29rIGFuZCBwZXJzaXN0XG4gKiBpdHMgcmVmZXJlbmNlcyBtYXBwZWQgdG8gdGhlIERCLXNoZWV0IGNvb3JkaW5hdGVzIChjb2x1bW4ga2V5ICsgZGF0YSByb3dcbiAqIG9mZnNldCkgdGhhdCB0aGUgc2hlZXQgdmlld2VyIHNlcnZlcywgc28gZm9ybXVsYXMgY2FuIGJlIGNvbXB1dGVkIGFnYWluc3RcbiAqIHRoZSBkYXRhYmFzZS1zYXZlZCBzaGVldCBkYXRhLiBJZGVtcG90ZW50OiBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVXb3JrYm9va0Zvcm11bGFNYXBTdGVwKGJ1ZmZlcnMsIGRiVXJsKSB7XG4gICAgbGV0IHRvdGFsID0gMDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB3YiA9IHJlYWQoYnVmZmVyc1swXSwge1xuICAgICAgICAgICAgdHlwZTogJ2J1ZmZlcicsXG4gICAgICAgICAgICBjZWxsRm9ybXVsYTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZm9ybXVsYU1hcCA9IGJ1aWxkV29ya2Jvb2tGb3JtdWxhTWFwKHdiKTtcbiAgICAgICAgdG90YWwgPSBPYmplY3QudmFsdWVzKGZvcm11bGFNYXApLnJlZHVjZSgobiwgcyk9Pm4gKyBzLmZvcm11bGFzLmxlbmd0aCwgMCk7XG4gICAgICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY2F0ZWdvcnksIGNvbnRlbnQpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJ2NhY2hlJywgJDIpXG4gICAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50O2AsIFtcbiAgICAgICAgICAgICAgICAnd29ya2Jvb2tfZm9ybXVsYXMnLFxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGZvcm11bGFNYXApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIE5vbi1mYXRhbDogdGhlIHdvcmtib29rX2RhdGEgc25pcHBldCByZW1haW5zIHRoZSBzb3VyY2Ugb2YgdHJ1dGggYW5kIHRoZVxuICAgICAgICAvLyBzaGVldC1kYXRhIEFQSSBjb21wdXRlcyBmb3JtdWxhIHZhbHVlcyBvbiByZWFkIHdoZW4gdGhpcyBpcyBtaXNzaW5nLlxuICAgICAgICBjb25zb2xlLndhcm4oJ1t3b3JrYm9vay1pbmdlc3RdIEZvcm11bGEgbWFwIHN0ZXAgc2tpcHBlZDonLCBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycikpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsO1xufVxuLyoqXG4gKiBDT01QUkVIRU5EOiBvbmUgT3BlbkFJIGNhbGwgKGdwdC00bywganNvbl9vYmplY3QsIFpvZC12YWxpZGF0ZWQpIHdpdGggdGhlXG4gKiBkZXRlcm1pbmlzdGljIEFOQUxZU0lTIGhpbnRzIGluamVjdGVkIGludG8gdGhlIHByb21wdC5cbiAqXG4gKiBSZXRyeSBwb2xpY3kgKFx1MDBBNzQuMiBvZiB0aGUgcm9hZG1hcCk6XG4gKiAgIC0gNDI5ICAgICAgICAgICAgXHUyMTkyIFJldHJ5YWJsZUVycm9yKHsgcmV0cnlBZnRlciB9KSB1c2luZyBSZXRyeS1BZnRlciBoZWFkZXIgKGZhbGxiYWNrIDFzKVxuICogICAtIDV4eCAvIG5ldHdvcmsgIFx1MjE5MiBwbGFpbiBFcnJvciBcdTIxOTIgU0RLIGF1dG8tcmV0cnkgKG1heCAzKVxuICogICAtIG1pc3Npbmcga2V5ICAgIFx1MjE5MiBGYXRhbEVycm9yIChwZXJtYW5lbnQsIG5vIHJldHJ5IHN0b3JtKVxuICogICAtIHNjaGVtYSByZWplY3RlZCBcdTIxOTIgcGxhaW4gRXJyb3IgXHUyMTkyIFNESyBhdXRvLXJldHJpZXMgKG1vZGVsIG91dHB1dCBpcyBzdG9jaGFzdGljXG4gKiAgICAgICAgICAgICAgICAgICAgICBhdCB0ZW1wZXJhdHVyZSAwLjIpOyBydW4gZmFpbHMgd2l0aCBhIGNsZWFyIG1lc3NhZ2UgYWZ0ZXJcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZSBTREsncyByZXRyeSBidWRnZXQgaXMgZXhoYXVzdGVkLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21wcmVoZW5kV29ya2Jvb2tTdGVwKHNoZWV0cywgaGludHMsIG1vZGVsID0gJ2dwdC00bycsIG9wZW5haUFwaUtleSkge1xuICAgIGNvbnN0IGFwaUtleSA9IG9wZW5haUFwaUtleSB8fCBwcm9jZXNzLmVudi5PUEVOQUlfQVBJX0tFWTtcbiAgICBpZiAoIWFwaUtleSkge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcignT3BlbkFJIEFQSSBrZXkgbm90IGNvbmZpZ3VyZWQuIFNldCBpdCBpbiBDb25maWcgPiBPcGVuQUkgS2V5ICh2aWEgdGhlIHJlc2VlZCByb3V0ZSkgb3Igc2V0IE9QRU5BSV9BUElfS0VZIGVudiB2YXIuJyk7XG4gICAgfVxuICAgIGNvbnN0IGJsb2NrcyA9IHNoZWV0cy5tYXAoKHsgdGFiTmFtZSwgdGV4dCB9KT0+KHtcbiAgICAgICAgICAgIHRhYk5hbWUsXG4gICAgICAgICAgICB0ZXh0XG4gICAgICAgIH0pKTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgY29tcHJlaGVuZE9uY2UoYmxvY2tzLCB7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIGhpbnRzLFxuICAgICAgICAgICAgYXBpS2V5XG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQ29tcHJlaGVuZEh0dHBFcnJvcikge1xuICAgICAgICAgICAgaWYgKGVyci5zdGF0dXMgPT09IDQyOSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldHJ5QWZ0ZXJTZWNvbmRzID0gZXJyLnJldHJ5QWZ0ZXJTZWNvbmRzID8/IDE7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJldHJ5YWJsZUVycm9yKGVyci5tZXNzYWdlLCB7XG4gICAgICAgICAgICAgICAgICAgIHJldHJ5QWZ0ZXI6IGAke3JldHJ5QWZ0ZXJTZWNvbmRzfXNgXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyA1eHggZXRjIFx1MjE5MiBwbGFpbiBFcnJvciBcdTIxOTIgU0RLIGF1dG8tcmV0cnkgKG1heCAzKVxuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yKSB7XG4gICAgICAgICAgICAvLyBTY2hlbWEvSlNPTiByZWplY3Rpb24gXHUyMDE0IHRoZSBtb2RlbCBtYXkgcHJvZHVjZSB2YWxpZCBvdXRwdXQgb24gcmV0cnkuXG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbn1cbi8qKlxuICogRW1pdCBhIHByb2dyZXNzIGNodW5rIHRvIHRoZSBydW4ncyB3cml0YWJsZSBzdHJlYW0gKFNTRSBwYXlsb2FkKS5cbiAqIE11c3QgYmUgYSBzdGVwOiB3b3JrZmxvdyBmdW5jdGlvbnMgY2Fubm90IGludGVyYWN0IHdpdGggdGhlIHN0cmVhbSBkaXJlY3RseS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZW1pdFByb2dyZXNzU3RlcCh3cml0YWJsZSwgY2h1bmspIHtcbiAgICBhd2FpdCB3cml0ZVByb2dyZXNzQ2h1bmsod3JpdGFibGUsIGNodW5rKTtcbn1cbi8qKlxuICogQ2xvc2UgdGhlIHJ1bidzIHdyaXRhYmxlIHN0cmVhbSwgc2lnbmFsaW5nIGNvbXBsZXRpb24gdG8gc3RyZWFtIHJlYWRlcnMuXG4gKiBNdXN0IGJlIGEgc3RlcDogd29ya2Zsb3cgZnVuY3Rpb25zIGNhbm5vdCBpbnRlcmFjdCB3aXRoIHRoZSBzdHJlYW0gZGlyZWN0bHkuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsb3NlUHJvZ3Jlc3NTdGVwKHdyaXRhYmxlKSB7XG4gICAgYXdhaXQgY2xvc2VQcm9ncmVzc1N0cmVhbSh3cml0YWJsZSk7XG59XG4vLyBcdTI1MDBcdTI1MDAgUGhhc2UgMzogUE9QVUxBVEUgc3RlcHMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vKipcbiAqIFVwc2VydCBmaW5hbmNpYWwgcHJvamVjdGlvbnMgZnJvbSB0aGUgQUkgY29tcHJlaGVuc2lvbi5cbiAqIElkZW1wb3RlbnQ6IE9OIENPTkZMSUNUIChwZXJpb2QsIGRhdGFfdHlwZSwgc2NlbmFyaW8pIERPIFVQREFURS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXAoY29tcHJlaGVuc2lvbiwgZGJVcmwpIHtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICBmb3IgKGNvbnN0IG1ldHJpYyBvZiBjb21wcmVoZW5zaW9uLnByb2plY3Rpb25zKXtcbiAgICAgICAgICAgIGNvbnN0IHllYXIgPSBOdW1iZXIobWV0cmljLnBlcmlvZC5zbGljZSgwLCA0KSk7XG4gICAgICAgICAgICBjb25zdCBtb250aCA9IE51bWJlcihtZXRyaWMucGVyaW9kLnNsaWNlKDUsIDcpKTtcbiAgICAgICAgICAgIGNvbnN0IHJldmVudWUgPSBNYXRoLnJvdW5kKG1ldHJpYy5yZXZlbnVlID8/IDApO1xuICAgICAgICAgICAgY29uc3QgZWJpdGRhID0gTWF0aC5yb3VuZChtZXRyaWMuZWJpdGRhID8/IDApO1xuICAgICAgICAgICAgY29uc3QgbmV0SW5jb21lID0gTWF0aC5yb3VuZChtZXRyaWMubmV0SW5jb21lID8/IDApO1xuICAgICAgICAgICAgY29uc3QgZ3Vlc3RzID0gTWF0aC5yb3VuZChtZXRyaWMuZ3Vlc3RzID8/IDApO1xuICAgICAgICAgICAgY29uc3Qgc3RhZmZDb3N0ID0gTWF0aC5yb3VuZChtZXRyaWMuc3RhZmZDb3N0ID8/IDApO1xuICAgICAgICAgICAgY29uc3QgcG5sTGluZXMgPSBKU09OLnN0cmluZ2lmeShbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdyZXZlbnVlJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdSZXZlbnVlJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJldmVudWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnZWJpdGRhJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFQklUREEnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZWJpdGRhXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ25ldF9pbmNvbWUnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ05ldCBJbmNvbWUnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbmV0SW5jb21lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ3N0YWZmX2Nvc3QnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1N0YWZmIENvc3QnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc3RhZmZDb3N0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ2d1ZXN0cycsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnR3Vlc3RzJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGd1ZXN0c1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGZpbmFuY2lhbF9wcm9qZWN0aW9ucyAocGVyaW9kLCB5ZWFyLCBtb250aCwgZGF0YV90eXBlLCBzY2VuYXJpbywgcmV2ZW51ZSwgZWJpdGRhLCBuZXRfaW5jb21lLCBndWVzdHMsIHN0YWZmX2Nvc3QsIHBubF9saW5lcylcbiAgICAgICAgIFZBTFVFUyAoJDEsICQyLCAkMywgJDQsICQ1LCAkNiwgJDcsICQ4LCAkOSwgJDEwLCAkMTE6Ompzb25iKVxuICAgICAgICAgT04gQ09ORkxJQ1QgKHBlcmlvZCwgZGF0YV90eXBlLCBzY2VuYXJpbylcbiAgICAgICAgIERPIFVQREFURSBTRVRcbiAgICAgICAgICAgcmV2ZW51ZSA9IEVYQ0xVREVELnJldmVudWUsXG4gICAgICAgICAgIGViaXRkYSA9IEVYQ0xVREVELmViaXRkYSxcbiAgICAgICAgICAgbmV0X2luY29tZSA9IEVYQ0xVREVELm5ldF9pbmNvbWUsXG4gICAgICAgICAgIGd1ZXN0cyA9IEVYQ0xVREVELmd1ZXN0cyxcbiAgICAgICAgICAgc3RhZmZfY29zdCA9IEVYQ0xVREVELnN0YWZmX2Nvc3QsXG4gICAgICAgICAgIHBubF9saW5lcyA9IEVYQ0xVREVELnBubF9saW5lcztgLCBbXG4gICAgICAgICAgICAgICAgbWV0cmljLnBlcmlvZCxcbiAgICAgICAgICAgICAgICB5ZWFyLFxuICAgICAgICAgICAgICAgIG1vbnRoLFxuICAgICAgICAgICAgICAgIG1ldHJpYy5kYXRhVHlwZSxcbiAgICAgICAgICAgICAgICBtZXRyaWMuc2NlbmFyaW8sXG4gICAgICAgICAgICAgICAgcmV2ZW51ZSxcbiAgICAgICAgICAgICAgICBlYml0ZGEsXG4gICAgICAgICAgICAgICAgbmV0SW5jb21lLFxuICAgICAgICAgICAgICAgIGd1ZXN0cyxcbiAgICAgICAgICAgICAgICBzdGFmZkNvc3QsXG4gICAgICAgICAgICAgICAgcG5sTGluZXNcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb3VudDtcbn1cbi8qKiBOb3JtYWxpemUgYSBzaGVldCB0YWIgbmFtZSBpbnRvIGEgVVJMLXNhZmUgc2x1Zy4gKi8gZnVuY3Rpb24gbm9ybWFsaXplU2x1ZyhuYW1lKSB7XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bJl0vZywgJ2FuZCcpLnJlcGxhY2UoL1tcXHNdKy9nLCAnLScpLnJlcGxhY2UoL1teYS16MC05LV0vZywgJycpLnJlcGxhY2UoLy0rL2csICctJykucmVwbGFjZSgvXi18LSQvZywgJycpO1xufVxuLyoqIFBhZ2UgYmxvY2tzIHBlciBzaGVldCBjYXRlZ29yeSAobWlycm9ycyBwaXBlbGluZS50cyBDQVRFR09SWV9CTE9DS1MpLiAqLyBjb25zdCBTSEVFVF9DQVRFR09SWV9CTE9DS1MgPSB7XG4gICAgZGFpbHlfc2FsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnRGFpbHkgU2FsZXMgXHUyMDE0IERhdGEnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXJ0X2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICB0aXRsZTogJ0RhaWx5IFNhbGVzIFx1MjAxNCBUcmVuZHMnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIHByb2ZpdF9sb3NzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3BubF90YWJsZScsXG4gICAgICAgICAgICB0aXRsZTogJ1Byb2ZpdCAmIExvc3MgXHUyMDE0IFN0YXRlbWVudCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnUHJvZml0ICYgTG9zcyBcdTIwMTQgVHJlbmRzJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBiYWxhbmNlX3NoZWV0OiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3NoZWV0X3ZpZXdlcicsXG4gICAgICAgICAgICB0aXRsZTogJ0JhbGFuY2UgU2hlZXQgXHUyMDE0IERhdGEnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIHRyaWFsX2JhbGFuY2U6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnVHJpYWwgQmFsYW5jZSBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgZ2VuZXJhbF9sZWRnZXI6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnR2VuZXJhbCBMZWRnZXIgXHUyMDE0IERhdGEnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIGNvc3Rfb2Zfc2FsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnQ29zdCBvZiBTYWxlcyBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgbW9udGhfb25fbW9udGg6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTW9udGggb24gTW9udGggXHUyMDE0IENvbXBhcmlzb24nXG4gICAgICAgIH1cbiAgICBdLFxuICAgIGJyZWFrX2V2ZW46IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAna3BpX2NhcmRzJyxcbiAgICAgICAgICAgIHRpdGxlOiAnQnJlYWstRXZlbiBcdTIwMTQgS1BJcydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnQnJlYWstRXZlbiBcdTIwMTQgVHJlbmQnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIHZhcmlhbmNlOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXJ0X2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICB0aXRsZTogJ01vbnRobHkgVmFyaWFuY2UgXHUyMDE0IEFuYWx5c2lzJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBzdW1tYXJ5X3BsOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXJ0X2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICB0aXRsZTogJ011bHRpLVllYXIgUCZMIFx1MjAxNCBUcmVuZCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAncG5sX3RhYmxlJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTXVsdGktWWVhciBQJkwgXHUyMDE0IFN0YXRlbWVudCdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgc3VtbWFyeV9iczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdNdWx0aS1ZZWFyIEJhbGFuY2UgU2hlZXQgXHUyMDE0IERhdGEnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIG90aGVyOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3NoZWV0X3ZpZXdlcicsXG4gICAgICAgICAgICB0aXRsZTogJ1NoZWV0IERhdGEnXG4gICAgICAgIH1cbiAgICBdXG59O1xuLyoqXG4gKiBDcmVhdGUvdXBkYXRlIGR5bmFtaWMgYXBwIHBhZ2VzICsgcGFnZSBzZWN0aW9ucyBmb3IgZWFjaCBjb21wcmVoZW5kZWQgc2hlZXQuXG4gKlxuICogXHUwMEE3Ny4xIEZJWDogT04gQ09ORkxJQ1QgKHNsdWcpIERPIFVQREFURSAuLi4gUkVUVVJOSU5HIGlkIGVuc3VyZXMgd2UgYWx3YXlzXG4gKiBoYXZlIHRoZSBjb3JyZWN0IHBhZ2UgSUQgKG5ldyBvciBleGlzdGluZykuIFBhZ2Ugc2VjdGlvbnMgYXJlIGRlbGV0ZWQgYW5kXG4gKiByZS1pbnNlcnRlZCBzY29wZWQgdG8gdGhhdCBpZCBcdTIwMTQgbm8gb3JwaGFuIEZLIHJlZmVyZW5jZXMuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwc2VydFNoZWV0UGFnZXNTdGVwKGNvbXByZWhlbnNpb24sIGRiVXJsLCB0ZW5hbnRTbHVnKSB7XG4gICAgY29uc3QgY3JlYXRlZCA9IFtdO1xuICAgIGxldCBzb3J0T3JkZXIgPSAxMDA7XG4gICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgIGZvciAoY29uc3Qgc2hlZXQgb2YgY29tcHJlaGVuc2lvbi5zaGVldHMpe1xuICAgICAgICAgICAgY29uc3Qgc2x1ZyA9IGBzaGVldC0ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YDtcbiAgICAgICAgICAgIGNvbnN0IGJsb2NrcyA9IFNIRUVUX0NBVEVHT1JZX0JMT0NLU1tzaGVldC5jYXRlZ29yeV0gPz8gU0hFRVRfQ0FURUdPUllfQkxPQ0tTLm90aGVyO1xuICAgICAgICAgICAgLy8gXHUwMEE3Ny4xIGZpeDogUkVUVVJOSU5HIGlkIGdpdmVzIHVzIHRoZSByZWFsIHBhZ2UgSUQgb24gaW5zZXJ0IE9SIGNvbmZsaWN0LlxuICAgICAgICAgICAgY29uc3QgcGFnZVJvd3MgPSBhd2FpdCBxdWVyeVJvd3MoZGIsIGBJTlNFUlQgSU5UTyBhcHBfcGFnZXMgKGlkLCBzbHVnLCB0aXRsZSwgYXV0aF90aWVyLCBzb3J0X29yZGVyLCBuYXZfbGFiZWwsIHNob3dfaW5fbmF2LCB0ZW5hbnRfc2x1ZylcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAkMiwgJ2dvb2dsZScsICQzLCAkNCwgdHJ1ZSwgJDUpXG4gICAgICAgICBPTiBDT05GTElDVCAoc2x1ZykgRE8gVVBEQVRFIFNFVFxuICAgICAgICAgICB0aXRsZSA9IEVYQ0xVREVELnRpdGxlLFxuICAgICAgICAgICBhdXRoX3RpZXIgPSBFWENMVURFRC5hdXRoX3RpZXIsXG4gICAgICAgICAgIHNvcnRfb3JkZXIgPSBFWENMVURFRC5zb3J0X29yZGVyLFxuICAgICAgICAgICBuYXZfbGFiZWwgPSBFWENMVURFRC5uYXZfbGFiZWwsXG4gICAgICAgICAgIHNob3dfaW5fbmF2ID0gRVhDTFVERUQuc2hvd19pbl9uYXYsXG4gICAgICAgICAgIHRlbmFudF9zbHVnID0gQ09BTEVTQ0UoRVhDTFVERUQudGVuYW50X3NsdWcsIGFwcF9wYWdlcy50ZW5hbnRfc2x1ZylcbiAgICAgICAgIFJFVFVSTklORyBpZDtgLCBbXG4gICAgICAgICAgICAgICAgc2x1ZyxcbiAgICAgICAgICAgICAgICBzaGVldC50aXRsZSxcbiAgICAgICAgICAgICAgICBzb3J0T3JkZXIrKyxcbiAgICAgICAgICAgICAgICBzaGVldC50aXRsZSxcbiAgICAgICAgICAgICAgICB0ZW5hbnRTbHVnID8/IG51bGxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY29uc3QgcGFnZUlkID0gcGFnZVJvd3NbMF0/LmlkO1xuICAgICAgICAgICAgaWYgKCFwYWdlSWQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgLy8gUmVwbGFjZSBzZWN0aW9ucyBmb3IgdGhpcyBwYWdlIChpZGVtcG90ZW50IG9uIHJldHJ5KS5cbiAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBERUxFVEUgRlJPTSBwYWdlX3NlY3Rpb25zIFdIRVJFIHBhZ2VfaWQgPSAkMTtgLCBbXG4gICAgICAgICAgICAgICAgcGFnZUlkXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnlNYXJrZG93biA9IFtcbiAgICAgICAgICAgICAgICBgIyAke3NoZWV0LnRpdGxlfWAsXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgc2hlZXQuc3VtbWFyeSxcbiAgICAgICAgICAgICAgICBzaGVldC5wZXJpb2RIaW50ID8gYFxcbioqUGVyaW9kKio6ICR7c2hlZXQucGVyaW9kSGludH1gIDogJycsXG4gICAgICAgICAgICAgICAgYCoqUm93cyoqOiAke3NoZWV0LnJvd0NvdW50ID8/ICdcdTIwMTQnfSAgfCAgKipDb2x1bW5zKio6ICR7KHNoZWV0LmNvbHVtbnMgPz8gW10pLmxlbmd0aCB8fCAnXHUyMDE0J31gLFxuICAgICAgICAgICAgICAgICcnXG4gICAgICAgICAgICBdLmZpbHRlcigobCk9PmwgIT09ICcnKS5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgIC8vIGRvY19tYXJrZG93biBibG9ja1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIHBhZ2Vfc2VjdGlvbnMgKGlkLCBwYWdlX2lkLCBzb3J0X29yZGVyLCBibG9ja190eXBlLCBjb25maWcpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgMCwgJ2RvY19tYXJrZG93bicsICQyOjpqc29uYik7YCwgW1xuICAgICAgICAgICAgICAgIHBhZ2VJZCxcbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQWJvdXQgdGhpcyBzaGVldCcsXG4gICAgICAgICAgICAgICAgICAgIG1hcmtkb3duOiBzdW1tYXJ5TWFya2Rvd25cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAvLyBDYXRlZ29yeS1zcGVjaWZpYyBibG9ja3NcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBibG9ja3MubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIGNvbnN0IGJsb2NrID0gYmxvY2tzW2ldO1xuICAgICAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBwYWdlX3NlY3Rpb25zIChpZCwgcGFnZV9pZCwgc29ydF9vcmRlciwgYmxvY2tfdHlwZSwgY29uZmlnKVxuICAgICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJDIsICQzLCAkNDo6anNvbmIpO2AsIFtcbiAgICAgICAgICAgICAgICAgICAgcGFnZUlkLFxuICAgICAgICAgICAgICAgICAgICBpICsgMSxcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suYmxvY2tUeXBlLFxuICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaGVldDogc2hlZXQudGFiTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBibG9jay50aXRsZVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3JlYXRlZC5wdXNoKHtcbiAgICAgICAgICAgICAgICBzbHVnLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBzaGVldC50aXRsZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXV0by1wb3B1bGF0ZSBuYXZpZ2F0aW9uX2l0ZW1zOiBhZGQgZWFjaCBzaGVldCBwYWdlIGFzIGEgY2hpbGQgb2YgdGhlIFwiRXhjZWxcIiBmb2xkZXIuXG4gICAgICAgIC8vIEZpbmQgdGhlIEV4Y2VsIGZvbGRlciBmaXJzdCwgb3IgY3JlYXRlIGl0IGlmIGl0IGRvZXNuJ3QgZXhpc3QgeWV0LlxuICAgICAgICBjb25zdCBleGNlbEZvbGRlciA9IGF3YWl0IHF1ZXJ5Um93cyhkYiwgYFNFTEVDVCBpZCBGUk9NIG5hdmlnYXRpb25faXRlbXMgV0hFUkUgdGl0bGUgPSAkMSBBTkQgcGFyZW50X2lkIElTIE5VTEwgTElNSVQgMWAsIFtcbiAgICAgICAgICAgICdFeGNlbCdcbiAgICAgICAgXSk7XG4gICAgICAgIGxldCBleGNlbElkID0gZXhjZWxGb2xkZXJbMF0/LmlkO1xuICAgICAgICBpZiAoIWV4Y2VsSWQpIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgRXhjZWwgZm9sZGVyIGlmIGl0IGRvZXNuJ3QgZXhpc3QgeWV0XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVkID0gYXdhaXQgcXVlcnlSb3dzKGRiLCBgSU5TRVJUIElOVE8gbmF2aWdhdGlvbl9pdGVtcyAoaWQsIHBhcmVudF9pZCwgc29ydF9vcmRlciwgdGl0bGUsIHBhdGgsIGljb24sIGF1dGhfdGllciwgcmVxdWlyZWRfZ3JvdXBzLCBpc192aXNpYmxlLCBpc19keW5hbWljKVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgTlVMTCwgKFNFTEVDVCBDT0FMRVNDRShNQVgoc29ydF9vcmRlciksIDApICsgMSBGUk9NIG5hdmlnYXRpb25faXRlbXMgV0hFUkUgcGFyZW50X2lkIElTIE5VTEwpLFxuICAgICAgICAgJ0V4Y2VsJywgJy9leGNlbCcsICdGb2xkZXInLCBDQVNUKCdnb29nbGUnIEFTIFwiQXV0aFRpZXJcIiksICd2aWV3ZXIsb3BzLWFkbWluLGZpbmFuY2UscGxhdGZvcm0tYWRtaW4nLCB0cnVlLCB0cnVlKVxuICAgICAgICAgUkVUVVJOSU5HIGlkYCk7XG4gICAgICAgICAgICBleGNlbElkID0gY3JlYXRlZFswXT8uaWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4Y2VsSWQpIHtcbiAgICAgICAgICAgIGxldCBuYXZTb3J0ID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2hlZXQgb2YgY29tcHJlaGVuc2lvbi5zaGVldHMpe1xuICAgICAgICAgICAgICAgIGNvbnN0IHNsdWcgPSBgc2hlZXQtJHtub3JtYWxpemVTbHVnKHNoZWV0LnRhYk5hbWUpfWA7XG4gICAgICAgICAgICAgICAgLy8gU2tpcCBpZiBhbHJlYWR5IHByZXNlbnRcbiAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IHF1ZXJ5Um93cyhkYiwgYFNFTEVDVCBpZCBGUk9NIG5hdmlnYXRpb25faXRlbXMgV0hFUkUgcGF0aCA9ICQxIEFORCBwYXJlbnRfaWQgPSAkMiBMSU1JVCAxYCwgW1xuICAgICAgICAgICAgICAgICAgICBgLyR7c2x1Z31gLFxuICAgICAgICAgICAgICAgICAgICBleGNlbElkXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gbmF2aWdhdGlvbl9pdGVtcyAoaWQsIHBhcmVudF9pZCwgc29ydF9vcmRlciwgdGl0bGUsIHBhdGgsIGljb24sIGF1dGhfdGllciwgcmVxdWlyZWRfZ3JvdXBzLCBpc192aXNpYmxlLCBpc19keW5hbWljKVxuICAgICAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAkMiwgJDMsICQ0LCAnRGVzY3JpcHRpb24nLCBDQVNUKCdnb29nbGUnIEFTIFwiQXV0aFRpZXJcIiksICcnLCB0cnVlLCB0cnVlKWAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2VsSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYXZTb3J0KyssXG4gICAgICAgICAgICAgICAgICAgICAgICBzaGVldC50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGAvJHtzbHVnfWBcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNyZWF0ZWQ7XG59XG4vKiogVXBzZXJ0IGtub3dsZWRnZSBzbmlwcGV0cyAoZnVsbCBjb21wcmVoZW5zaW9uICsgcGVyLXNoZWV0IG1hcmtkb3duKS4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVTbmlwcGV0c1N0ZXAoY29tcHJlaGVuc2lvbiwgbW9kZWwsIGRiVXJsKSB7XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgLy8gUmF3IGNvbXByZWhlbnNpb24gSlNPTiAodXNlZCBieSBBSSBjaGF0IC8gcmVwcm9jZXNzKS5cbiAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY2F0ZWdvcnksIGNvbnRlbnQpXG4gICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICdkb2N1bWVudCcsICQyKVxuICAgICAgIE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQ7YCwgW1xuICAgICAgICAgICAgJ3dvcmtib29rX2NvbXByZWhlbnNpb24nLFxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIGNvbXByZWhlbmRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgY29tcHJlaGVuc2lvblxuICAgICAgICAgICAgfSlcbiAgICAgICAgXSk7XG4gICAgICAgIGNvdW50Kys7XG4gICAgICAgIC8vIE9uZSBodW1hbi1yZWFkYWJsZSBzbmlwcGV0IHBlciBzaGVldC5cbiAgICAgICAgZm9yIChjb25zdCBzaGVldCBvZiBjb21wcmVoZW5zaW9uLnNoZWV0cyl7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBgc2hlZXRfJHtub3JtYWxpemVTbHVnKHNoZWV0LnRhYk5hbWUpfWA7XG4gICAgICAgICAgICBjb25zdCBtYXJrZG93biA9IFtcbiAgICAgICAgICAgICAgICBgIyAke3NoZWV0LnRpdGxlfWAsXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgc2hlZXQuc3VtbWFyeSxcbiAgICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgICBgKipDYXRlZ29yeSoqOiAke3NoZWV0LmNhdGVnb3J5fWAsXG4gICAgICAgICAgICAgICAgc2hlZXQucGVyaW9kSGludCA/IGAqKlBlcmlvZCoqOiAke3NoZWV0LnBlcmlvZEhpbnR9YCA6ICcnXG4gICAgICAgICAgICBdLmZpbHRlcigobCk9PmwgIT09ICcnKS5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBrbm93bGVkZ2Vfc25pcHBldHMgKGlkLCBrZXksIGNhdGVnb3J5LCBjb250ZW50KVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICdzaGVldCcsICQyKVxuICAgICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudDtgLCBbXG4gICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgIG1hcmtkb3duXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY291bnQ7XG59XG4vKipcbiAqIERldGVybWluaXN0aWMgdGVtcGxhdGUtZml0IHNjb3JpbmcgKFx1MDBBNzUuNSkuXG4gKlxuICogU2NvcmVzIHRoZSBBSS1zdWdnZXN0ZWQgdGVtcGxhdGUgYWdhaW5zdCB0aGUgY29tcHJlaGVuZGVkIHNoZWV0IGNhdGVnb3JpZXMuXG4gKiBObyBleHRlcm5hbCBpbXBvcnRzIFx1MjAxNCBhbGwgdGVtcGxhdGUgZGF0YSBpcyBoYXJkY29kZWQgdG8ga2VlcCB0aGUgYnVuZGxlIGxlYW4uXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbGVjdFRlbXBsYXRlU3RlcChjb21wcmVoZW5zaW9uKSB7XG4gICAgY29uc3QgYWlUZW1wbGF0ZSA9IGNvbXByZWhlbnNpb24udGVtcGxhdGU7XG4gICAgY29uc3QgYWlDb25maWRlbmNlID0gYWlUZW1wbGF0ZT8uY29uZmlkZW5jZSA/PyAwLjU7XG4gICAgY29uc3Qgc2hlZXRDYXRlZ29yaWVzID0gY29tcHJlaGVuc2lvbi5zaGVldHMubWFwKChzKT0+cy5jYXRlZ29yeSk7XG4gICAgLy8gQ2F0ZWdvcnkgcHJvZmlsZSBwZXIgdGVtcGxhdGUgKHdoaWNoIHNoZWV0IGNhdGVnb3JpZXMgbWF0Y2ggYmVzdCkuXG4gICAgY29uc3QgdGVtcGxhdGVQcm9maWxlcyA9IHtcbiAgICAgICAgJ2ZpbmFuY2lhbC1hbmFseXRpY3MnOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgICAgICAgICAgICAgJ2JyZWFrX2V2ZW4nLFxuICAgICAgICAgICAgICAgICd2YXJpYW5jZScsXG4gICAgICAgICAgICAgICAgJ3RyaWFsX2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdzdW1tYXJ5X3BsJyxcbiAgICAgICAgICAgICAgICAnc3VtbWFyeV9icydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdmaW5hbmNpYWwnLFxuICAgICAgICAgICAgICAgICdwbmwnLFxuICAgICAgICAgICAgICAgICdwcm9maXQnLFxuICAgICAgICAgICAgICAgICdsb3NzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2JyZWFrIGV2ZW4nLFxuICAgICAgICAgICAgICAgICdiZXAnLFxuICAgICAgICAgICAgICAgICd2YXJpYW5jZSdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgcmVzdGF1cmFudDoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdkYWlseV9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JyZWFrX2V2ZW4nLFxuICAgICAgICAgICAgICAgICdtb250aF9vbl9tb250aCdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdyZXN0YXVyYW50JyxcbiAgICAgICAgICAgICAgICAna2l0Y2hlbicsXG4gICAgICAgICAgICAgICAgJ21lbnUnLFxuICAgICAgICAgICAgICAgICdmb29kJyxcbiAgICAgICAgICAgICAgICAnYmV2ZXJhZ2UnLFxuICAgICAgICAgICAgICAgICdjb3ZlcnMnLFxuICAgICAgICAgICAgICAgICdndWVzdHMnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIGhvdGVsOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ2RhaWx5X3NhbGVzJyxcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdtb250aF9vbl9tb250aCcsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnaG90ZWwnLFxuICAgICAgICAgICAgICAgICdyb29tcycsXG4gICAgICAgICAgICAgICAgJ29jY3VwYW5jeScsXG4gICAgICAgICAgICAgICAgJ3JldnBhcicsXG4gICAgICAgICAgICAgICAgJ2hvdXNla2VlcGluZydcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgJ2Vjb21tZXJjZS1yZXRhaWwnOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ2RhaWx5X3NhbGVzJyxcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJyxcbiAgICAgICAgICAgICAgICAndmFyaWFuY2UnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnZWNvbW1lcmNlJyxcbiAgICAgICAgICAgICAgICAncmV0YWlsJyxcbiAgICAgICAgICAgICAgICAnb25saW5lJyxcbiAgICAgICAgICAgICAgICAnc2t1JyxcbiAgICAgICAgICAgICAgICAnY2FydCcsXG4gICAgICAgICAgICAgICAgJ2NvbnZlcnNpb24nXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIGhlYWx0aGNhcmU6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdoZWFsdGgnLFxuICAgICAgICAgICAgICAgICdwYXRpZW50JyxcbiAgICAgICAgICAgICAgICAnY2xpbmljJyxcbiAgICAgICAgICAgICAgICAnbWVkaWNhbCcsXG4gICAgICAgICAgICAgICAgJ3BoYXJtYWN5J1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICAnc3VwcGx5LWNoYWluJzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICAgICAgICAgICAgICd2YXJpYW5jZScsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnc3VwcGx5JyxcbiAgICAgICAgICAgICAgICAnbG9naXN0aWNzJyxcbiAgICAgICAgICAgICAgICAnaW52ZW50b3J5JyxcbiAgICAgICAgICAgICAgICAnd2FyZWhvdXNlJyxcbiAgICAgICAgICAgICAgICAnc2hpcHBpbmcnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgICdyZWFsLWVzdGF0ZSc6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgICAgICAgICAnc3VtbWFyeV9icydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdyZWFsIGVzdGF0ZScsXG4gICAgICAgICAgICAgICAgJ3Byb3BlcnR5JyxcbiAgICAgICAgICAgICAgICAnbGVhc2UnLFxuICAgICAgICAgICAgICAgICdyZW50JyxcbiAgICAgICAgICAgICAgICAnbW9ydGdhZ2UnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIGVkdWNhdGlvbjoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ21vbnRoX29uX21vbnRoJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2VkdWNhdGlvbicsXG4gICAgICAgICAgICAgICAgJ3N0dWRlbnQnLFxuICAgICAgICAgICAgICAgICd0dWl0aW9uJyxcbiAgICAgICAgICAgICAgICAnY291cnNlJyxcbiAgICAgICAgICAgICAgICAnZW5yb2xsbWVudCdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgJ3Byb2Zlc3Npb25hbC1zZXJ2aWNlcyc6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdjb25zdWx0aW5nJyxcbiAgICAgICAgICAgICAgICAnc2VydmljZXMnLFxuICAgICAgICAgICAgICAgICdiaWxsaW5nJyxcbiAgICAgICAgICAgICAgICAnY2xpZW50JyxcbiAgICAgICAgICAgICAgICAncHJvamVjdCdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgbWFudWZhY3R1cmluZzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgICAgICAgICAndmFyaWFuY2UnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnbWFudWZhY3R1cmluZycsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3Rpb24nLFxuICAgICAgICAgICAgICAgICdmYWN0b3J5JyxcbiAgICAgICAgICAgICAgICAnYmlsbCBvZiBtYXRlcmlhbHMnLFxuICAgICAgICAgICAgICAgICd3b3JrIG9yZGVyJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBjYXRlZ29yeU92ZXJsYXAodG1wbElkKSB7XG4gICAgICAgIGNvbnN0IHByb2ZpbGUgPSB0ZW1wbGF0ZVByb2ZpbGVzW3RtcGxJZF07XG4gICAgICAgIGlmICghcHJvZmlsZSkgcmV0dXJuIDA7XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBzaGVldENhdGVnb3JpZXMuZmlsdGVyKChjKT0+cHJvZmlsZS5jYXRlZ29yaWVzLmluY2x1ZGVzKGMpKTtcbiAgICAgICAgcmV0dXJuIHNoZWV0Q2F0ZWdvcmllcy5sZW5ndGggPiAwID8gbWF0Y2hlcy5sZW5ndGggLyBzaGVldENhdGVnb3JpZXMubGVuZ3RoIDogMDtcbiAgICB9XG4gICAgZnVuY3Rpb24ga2V5d29yZE1hdGNoKHRtcGxJZCkge1xuICAgICAgICBjb25zdCBwcm9maWxlID0gdGVtcGxhdGVQcm9maWxlc1t0bXBsSWRdO1xuICAgICAgICBpZiAoIXByb2ZpbGUpIHJldHVybiAwO1xuICAgICAgICBjb25zdCB0ZXh0ID0gW1xuICAgICAgICAgICAgY29tcHJlaGVuc2lvbi53b3JrYm9vay50aXRsZSxcbiAgICAgICAgICAgIGNvbXByZWhlbnNpb24ud29ya2Jvb2suc3VtbWFyeSxcbiAgICAgICAgICAgIGNvbXByZWhlbnNpb24ud29ya2Jvb2suY29tcGFueSA/PyAnJ1xuICAgICAgICBdLmpvaW4oJyAnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBtYXRjaGVzID0gcHJvZmlsZS5rZXl3b3Jkcy5maWx0ZXIoKGt3KT0+dGV4dC5pbmNsdWRlcyhrdykpO1xuICAgICAgICByZXR1cm4gcHJvZmlsZS5rZXl3b3Jkcy5sZW5ndGggPiAwID8gbWF0Y2hlcy5sZW5ndGggLyBwcm9maWxlLmtleXdvcmRzLmxlbmd0aCA6IDA7XG4gICAgfVxuICAgIC8vIFNjb3JlIHRoZSBBSS1zdWdnZXN0ZWQgdGVtcGxhdGUuXG4gICAgY29uc3Qgc3VnZ2VzdGVkU2NvcmUgPSBhaVRlbXBsYXRlPy5pZCA/IGFpQ29uZmlkZW5jZSAqIChjYXRlZ29yeU92ZXJsYXAoYWlUZW1wbGF0ZS5pZCkgKiAwLjcgKyBrZXl3b3JkTWF0Y2goYWlUZW1wbGF0ZS5pZCkgKiAwLjMpIDogLTE7XG4gICAgLy8gU2NvcmUgYWxsIHRlbXBsYXRlcyBmb3IgYWx0ZXJuYXRpdmVzLlxuICAgIGNvbnN0IGFsbFNjb3JlcyA9IE9iamVjdC5rZXlzKHRlbXBsYXRlUHJvZmlsZXMpLm1hcCgoaWQpPT4oe1xuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBzY29yZTogY2F0ZWdvcnlPdmVybGFwKGlkKSAqIDAuNyArIGtleXdvcmRNYXRjaChpZCkgKiAwLjMsXG4gICAgICAgICAgICByZWFzb246IGAke01hdGgucm91bmQoY2F0ZWdvcnlPdmVybGFwKGlkKSAqIDEwMCl9JSBjYXRlZ29yeSBtYXRjaCwgJHtNYXRoLnJvdW5kKGtleXdvcmRNYXRjaChpZCkgKiAxMDApfSUga2V5d29yZCBtYXRjaGBcbiAgICAgICAgfSkpO1xuICAgIGFsbFNjb3Jlcy5zb3J0KChhLCBiKT0+Yi5zY29yZSAtIGEuc2NvcmUpO1xuICAgIGNvbnN0IHJlY29tbWVuZGVkID0gc3VnZ2VzdGVkU2NvcmUgPiBhbGxTY29yZXNbMF0uc2NvcmUgPyBhaVRlbXBsYXRlLmlkIDogYWxsU2NvcmVzWzBdLmlkO1xuICAgIGNvbnN0IHJlY29tbWVuZGVkU2NvcmUgPSByZWNvbW1lbmRlZCA9PT0gYWlUZW1wbGF0ZT8uaWQgPyBzdWdnZXN0ZWRTY29yZSA6IGFsbFNjb3Jlc1swXS5zY29yZTtcbiAgICByZXR1cm4ge1xuICAgICAgICByZWNvbW1lbmRlZCxcbiAgICAgICAgYWlTdWdnZXN0aW9uOiBhaVRlbXBsYXRlPy5pZCA/PyBudWxsLFxuICAgICAgICBhaUNvbmZpZGVuY2UsXG4gICAgICAgIHNjb3JlOiBNYXRoLnJvdW5kKHJlY29tbWVuZGVkU2NvcmUgKiAxMDApIC8gMTAwLFxuICAgICAgICByZWFzb246IGFsbFNjb3Jlc1swXS5yZWFzb24sXG4gICAgICAgIGFsdGVybmF0aXZlczogYWxsU2NvcmVzLmZpbHRlcigocyk9PnMuaWQgIT09IHJlY29tbWVuZGVkKS5zbGljZSgwLCAzKS5tYXAoKHMpPT4oe1xuICAgICAgICAgICAgICAgIGlkOiBzLmlkLFxuICAgICAgICAgICAgICAgIHNjb3JlOiBNYXRoLnJvdW5kKHMuc2NvcmUgKiAxMDApIC8gMTAwXG4gICAgICAgICAgICB9KSlcbiAgICB9O1xufVxuLyoqIEJlc3QtZWZmb3J0IHJlZ2lzdGVyIGR5bmFtaWMgcGFnZXMgaW4gdGhlIHJ1bnRpbWUgY2F0YWxvZy4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcChjb21wcmVoZW5zaW9uKSB7XG4gICAgLy8gc2V0RHluYW1pY1BhZ2VzIGlzIGEgcnVudGltZS1zaWRlIGVmZmVjdDsgaW4gdGhlIHdvcmtmbG93IGNvbnRleHQgdGhlXG4gICAgLy8gY2F0YWxvZyByZWJ1aWxkcyBmcm9tIERCIGFwcF9wYWdlcyBvbiBuZXh0IHJlcXVlc3QuIEJlc3QtZWZmb3J0LlxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgc2V0RHluYW1pY1BhZ2VzIH0gPSBhd2FpdCBpbXBvcnQoJy4uLy4uL3NyYy9saWIvcGFnZS1jYXRhbG9nJyk7XG4gICAgICAgIGNvbnN0IHBhZ2VzID0gY29tcHJlaGVuc2lvbi5zaGVldHMubWFwKChzaGVldCk9Pih7XG4gICAgICAgICAgICAgICAgc2x1ZzogYHNoZWV0LSR7bm9ybWFsaXplU2x1ZyhzaGVldC50YWJOYW1lKX1gLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBzaGVldC50aXRsZSxcbiAgICAgICAgICAgICAgICBhdXRoVGllcjogJ2dvb2dsZScsXG4gICAgICAgICAgICAgICAgbmF2TGFiZWw6IHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdkb2NfbWFya2Rvd24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBgc2hlZXRfJHtub3JtYWxpemVTbHVnKHNoZWV0LnRhYk5hbWUpfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHNoZWV0LnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC4uLihTSEVFVF9DQVRFR09SWV9CTE9DS1Nbc2hlZXQuY2F0ZWdvcnldID8/IFNIRUVUX0NBVEVHT1JZX0JMT0NLUy5vdGhlcikubWFwKChiKT0+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9ja1R5cGU6IGIuYmxvY2tUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGVldDogc2hlZXQudGFiTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGIudGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIHNldER5bmFtaWNQYWdlcyhwYWdlcyk7XG4gICAgICAgIHJldHVybiBwYWdlcy5sZW5ndGg7XG4gICAgfSBjYXRjaCAge1xuICAgICAgICAvLyBSdW50aW1lIGNhdGFsb2cgdW5hdmFpbGFibGUgaW4gd29ya2Zsb3cgY29udGV4dCBcdTIwMTQgbm9uLWNyaXRpY2FsLlxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG59XG4vLyBcdTI1MDBcdTI1MDAgUGhhc2UgNTogR0VORVJBVEUgc3RlcHMgKE9wZW5BSSBcdTIxOTIgQlIgLyBFUyAvIERhc2hib2FyZCkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vKiogUGFyc2UgQnVzaW5lc3MgUmV2aWV3IG1hcmtkb3duIGludG8gcGFydCBzZWN0aW9ucyAobGlnaHR3ZWlnaHQgaW5saW5lIHBhcnNlcikuICovIGZ1bmN0aW9uIHBhcnNlUmV2aWV3UGFydHMobWFya2Rvd24pIHtcbiAgICBjb25zdCBwYXJ0cyA9IFtdO1xuICAgIGNvbnN0IGhlYWRlclJlID0gL14jezIsM31cXHMrUGFydFxccysoW0EtWl0pOlxccyooLispJC9tO1xuICAgIGNvbnN0IHNlY3Rpb25zID0gbWFya2Rvd24uc3BsaXQoL1xcbig/PSN7MiwzfVxccytQYXJ0XFxzK1tBLVpdOikvKTtcbiAgICBsZXQgc29ydE9yZGVyID0gMDtcbiAgICBmb3IgKGNvbnN0IHNlY3Rpb24gb2Ygc2VjdGlvbnMpe1xuICAgICAgICBjb25zdCBtYXRjaCA9IGhlYWRlclJlLmV4ZWMoc2VjdGlvbik7XG4gICAgICAgIGlmICghbWF0Y2gpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBbLCBsZXR0ZXIsIHJhd1RpdGxlXSA9IG1hdGNoO1xuICAgICAgICBjb25zdCB0aXRsZSA9IChyYXdUaXRsZSA/PyBzZWN0aW9uLnNwbGl0KCdcXG4nKVswXT8ucmVwbGFjZSgvXiN7MiwzfVxccytQYXJ0XFxzK1tBLVpdOlxccyovLCAnJykgPz8gJycpLnRyaW0oKTtcbiAgICAgICAgY29uc3Qgc2x1ZyA9IGBwYXJ0LSR7KGxldHRlciA/PyAnYScpLnRvTG93ZXJDYXNlKCl9YDtcbiAgICAgICAgY29uc3QgcGFydEtleSA9IGBwYXJ0XyR7KGxldHRlciA/PyAnYScpLnRvTG93ZXJDYXNlKCl9YDtcbiAgICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgICAgICBzbHVnLFxuICAgICAgICAgICAgcGFydEtleSxcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgc29ydE9yZGVyOiBzb3J0T3JkZXIrKyxcbiAgICAgICAgICAgIG1hcmtkb3duOiBzZWN0aW9uLnRyaW0oKVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnRzO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgQnVzaW5lc3MgUmV2aWV3IGZyb20gY29tcHJlaGVuc2lvbiBkYXRhLlxuICogU2F2ZXMgcGFyc2VkIHBhcnRzIHRvIGJ1c2luZXNzX3Jldmlld19wYXJ0cyB2aWEgcGcuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlQnVzaW5lc3NSZXZpZXdTdGVwKGNvbXByZWhlbnNpb24sIGFwaUtleSwgZGJVcmwsIG1vZGVsID0gJ2dwdC00bycpIHtcbiAgICBjb25zdCBwcm9tcHQgPSBidWlsZEdlblByb21wdChjb21wcmVoZW5zaW9uLCAnYnVzaW5lc3NSZXZpZXcnKTtcbiAgICBsZXQgbWFya2Rvd247XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAnWW91IGFyZSBhIHByZWNpc2UgZmluYW5jaWFsIGFuYWx5c3QgYW5kIGJ1c2luZXNzIHdyaXRlci4gUmV0dXJuIE9OTFkgdmFsaWQgSlNPTi4nXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHByb21wdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgICAgICAgICAgICAgIG1heF90b2tlbnM6IDE2Mzg0LFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlX2Zvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnanNvbl9vYmplY3QnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgT3BlbkFJIEFQSSBlcnJvciAoJHtyZXNwb25zZS5zdGF0dXN9KWApO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGNvbnN0IHJlcGx5ID0gcmVzdWx0LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudCA/PyAnJztcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyZXBseSk7XG4gICAgICAgIG1hcmtkb3duID0gcGFyc2VkLmJ1c2luZXNzUmV2aWV3ID8/ICcnO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEJ1c2luZXNzIFJldmlldyBnZW5lcmF0aW9uIGZhaWxlZDogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgfVxuICAgIGlmICghbWFya2Rvd24udHJpbSgpKSByZXR1cm4gMDtcbiAgICBjb25zdCBwYXJ0cyA9IHBhcnNlUmV2aWV3UGFydHMobWFya2Rvd24pO1xuICAgIGxldCBzYXZlZCA9IDA7XG4gICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cyl7XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gYnVzaW5lc3NfcmV2aWV3X3BhcnRzIChpZCwgc2x1ZywgcGFydF9rZXksIHRpdGxlLCBzb3J0X29yZGVyLCBhdXRoX3RpZXIsIG1hcmtkb3duKVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICQyLCAkMywgJDQsICdnb29nbGUnLCAkNSlcbiAgICAgICAgIE9OIENPTkZMSUNUIChzbHVnKSBETyBVUERBVEUgU0VUXG4gICAgICAgICAgIHBhcnRfa2V5ID0gRVhDTFVERUQucGFydF9rZXksXG4gICAgICAgICAgIHRpdGxlID0gRVhDTFVERUQudGl0bGUsXG4gICAgICAgICAgIHNvcnRfb3JkZXIgPSBFWENMVURFRC5zb3J0X29yZGVyLFxuICAgICAgICAgICBtYXJrZG93biA9IEVYQ0xVREVELm1hcmtkb3duO2AsIFtcbiAgICAgICAgICAgICAgICBwYXJ0LnNsdWcsXG4gICAgICAgICAgICAgICAgcGFydC5wYXJ0S2V5LFxuICAgICAgICAgICAgICAgIHBhcnQudGl0bGUsXG4gICAgICAgICAgICAgICAgcGFydC5zb3J0T3JkZXIsXG4gICAgICAgICAgICAgICAgcGFydC5tYXJrZG93blxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBzYXZlZCsrO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHNhdmVkO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgRXhlY3V0aXZlIFN1bW1hcnkgZnJvbSBjb21wcmVoZW5zaW9uIGRhdGEuXG4gKiBTYXZlcyB0byBrbm93bGVkZ2Vfc25pcHBldHMgdmlhIHBnLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwKGNvbXByZWhlbnNpb24sIGFwaUtleSwgZGJVcmwsIG1vZGVsID0gJ2dwdC00bycpIHtcbiAgICBjb25zdCBwcm9tcHQgPSBidWlsZEdlblByb21wdChjb21wcmVoZW5zaW9uLCAnZXhlY3V0aXZlU3VtbWFyeScpO1xuICAgIGxldCBtYXJrZG93bjtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICdZb3UgYXJlIGEgcHJlY2lzZSBmaW5hbmNpYWwgYW5hbHlzdCBhbmQgYnVzaW5lc3Mgd3JpdGVyLiBSZXR1cm4gT05MWSB2YWxpZCBKU09OLidcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogcHJvbXB0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjMsXG4gICAgICAgICAgICAgICAgbWF4X3Rva2VuczogMTYzODQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VfZm9ybWF0OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdqc29uX29iamVjdCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBPcGVuQUkgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pYCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgY29uc3QgcmVwbHkgPSByZXN1bHQuY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50ID8/ICcnO1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJlcGx5KTtcbiAgICAgICAgbWFya2Rvd24gPSBwYXJzZWQuZXhlY3V0aXZlU3VtbWFyeSA/PyAnJztcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeGVjdXRpdmUgU3VtbWFyeSBnZW5lcmF0aW9uIGZhaWxlZDogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgfVxuICAgIGlmICghbWFya2Rvd24udHJpbSgpKSByZXR1cm4gZmFsc2U7XG4gICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBrbm93bGVkZ2Vfc25pcHBldHMgKGlkLCBrZXksIGNhdGVnb3J5LCBjb250ZW50KVxuICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICdleGVjdXRpdmVfc3VtbWFyeScsICdkb2N1bWVudCcsICQxKVxuICAgICAgIE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQ7YCwgW1xuICAgICAgICAgICAgbWFya2Rvd25cbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG59XG4vKipcbiAqIEdlbmVyYXRlIHRoZSBEYXNoYm9hcmQgRGF0YSBmcm9tIGNvbXByZWhlbnNpb24gZGF0YS5cbiAqIFNhdmVzIHRvIGtub3dsZWRnZV9zbmlwcGV0cyB2aWEgcGcuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRGFzaGJvYXJkU3RlcChjb21wcmVoZW5zaW9uLCBhcGlLZXksIGRiVXJsLCBtb2RlbCA9ICdncHQtNG8nKSB7XG4gICAgY29uc3QgcHJvbXB0ID0gYnVpbGRHZW5Qcm9tcHQoY29tcHJlaGVuc2lvbiwgJ2Rhc2hib2FyZERhdGEnKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICdZb3UgYXJlIGEgcHJlY2lzZSBmaW5hbmNpYWwgYW5hbHlzdC4gUmV0dXJuIE9OTFkgdmFsaWQgSlNPTiB3aXRoIGtleXMgXCJhY3Rpb25QaGFzZXNcIiwgXCJ0YXJnZXRSb3dzXCIsIGFuZCBcImxldmVyc1wiLidcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogcHJvbXB0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjMsXG4gICAgICAgICAgICAgICAgbWF4X3Rva2VuczogMTYzODQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VfZm9ybWF0OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdqc29uX29iamVjdCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBPcGVuQUkgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pYCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgY29uc3QgcmVwbHkgPSByZXN1bHQuY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50ID8/ICcnO1xuICAgICAgICBpZiAoIXJlcGx5KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmVwbHkpO1xuICAgICAgICBpZiAoIXBhcnNlZC5hY3Rpb25QaGFzZXMgJiYgIXBhcnNlZC50YXJnZXRSb3dzICYmICFwYXJzZWQubGV2ZXJzKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY2F0ZWdvcnksIGNvbnRlbnQpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAnZGFzaGJvYXJkX2RhdGEnLCAnZG9jdW1lbnQnLCAkMSlcbiAgICAgICAgIE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQ7YCwgW1xuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHBhcnNlZClcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAge1xuICAgICAgICAvLyBEYXNoYm9hcmQgaXMgbm9uLWNyaXRpY2FsIFx1MjAxNCBzd2FsbG93IGVycm9yc1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuLyoqXG4gKiBCdWlsZCBhIGdlbmVyYXRpb24gcHJvbXB0IGZyb20gdGhlIHdvcmtib29rIGNvbXByZWhlbnNpb24uXG4gKiBObyBleHRlcm5hbCBkZXBlbmRlbmNpZXMgXHUyMDE0IHB1cmUgY29tcHV0YXRpb24gZnJvbSB0aGUgY29tcHJlaGVuc2lvbiBzdGF0ZS5cbiAqLyBmdW5jdGlvbiBidWlsZEdlblByb21wdChjb21wcmVoZW5zaW9uLCB0YXJnZXQpIHtcbiAgICBjb25zdCB7IHdvcmtib29rLCBzaGVldHMsIHByb2plY3Rpb25zIH0gPSBjb21wcmVoZW5zaW9uO1xuICAgIGNvbnN0IGNvbnRleHQgPSBbXG4gICAgICAgIGAjIEdlbmVyYXRlZCBDb250ZW50OiAke3RhcmdldCA9PT0gJ2J1c2luZXNzUmV2aWV3JyA/ICdCdXNpbmVzcyBSZXZpZXcnIDogdGFyZ2V0ID09PSAnZXhlY3V0aXZlU3VtbWFyeScgPyAnRXhlY3V0aXZlIFN1bW1hcnknIDogJ0Rhc2hib2FyZCBEYXRhJ31gLFxuICAgICAgICAnJyxcbiAgICAgICAgYCMjIFdvcmtib29rIFN1bW1hcnlgLFxuICAgICAgICBgKipUaXRsZSoqOiAke3dvcmtib29rLnRpdGxlfWAsXG4gICAgICAgIGAqKkNvbXBhbnkqKjogJHt3b3JrYm9vay5jb21wYW55ID8/ICdOL0EnfWAsXG4gICAgICAgIGAqKlBlcmlvZCoqOiAke3dvcmtib29rLnBlcmlvZCA/PyAnTi9BJ31gLFxuICAgICAgICBgKipDdXJyZW5jeSoqOiAke3dvcmtib29rLmN1cnJlbmN5ID8/ICdJRFInfWAsXG4gICAgICAgIHdvcmtib29rLnN1bW1hcnksXG4gICAgICAgICcnLFxuICAgICAgICBgIyMgU2hlZXQgSW52ZW50b3J5ICgke3NoZWV0cy5sZW5ndGh9IHNoZWV0cylgLFxuICAgICAgICAuLi5zaGVldHMubWFwKChzKT0+YC0gKioke3MudGFiTmFtZX0qKiAoJHtzLmNhdGVnb3J5fSk6ICR7cy50aXRsZX0gXHUyMDE0ICR7cy5zdW1tYXJ5fSR7cy5wZXJpb2RIaW50ID8gYCBbJHtzLnBlcmlvZEhpbnR9XWAgOiAnJ31gKSxcbiAgICAgICAgJycsXG4gICAgICAgIGAjIyBDb25zb2xpZGF0ZWQgRmluYW5jaWFsIFByb2plY3Rpb25zYCxcbiAgICAgICAgJ2BgYGpzb24nLFxuICAgICAgICBKU09OLnN0cmluZ2lmeShwcm9qZWN0aW9ucywgbnVsbCwgMiksXG4gICAgICAgICdgYGAnXG4gICAgXS5qb2luKCdcXG4nKTtcbiAgICBpZiAodGFyZ2V0ID09PSAnYnVzaW5lc3NSZXZpZXcnKSB7XG4gICAgICAgIHJldHVybiBgJHtjb250ZXh0fVxcblxcbkdlbmVyYXRlIE9OTFkgYSBcImJ1c2luZXNzUmV2aWV3XCIgZG9jdW1lbnQgYXMgYSBKU09OIG9iamVjdCB3aXRoIGEgc2luZ2xlIGtleSBcImJ1c2luZXNzUmV2aWV3XCIgY29udGFpbmluZyBhIGNvbXByZWhlbnNpdmUgTWFya2Rvd24gYnVzaW5lc3MgcmV2aWV3LiBJbmNsdWRlIHNlY3Rpb25zIGZvciBlYWNoIHBhcnQgb2YgdGhlIGJ1c2luZXNzOiBQYXJ0IEE6IFJldmVudWUgJiBTYWxlcywgUGFydCBCOiBDb3N0cyAmIE1hcmdpbnMsIFBhcnQgQzogUHJvZml0YWJpbGl0eSAmIEVCSVREQSwgUGFydCBEOiBCcmVhay1FdmVuIEFuYWx5c2lzLCBQYXJ0IEU6IFRyZW5kcyAmIFByb2plY3Rpb25zLCBQYXJ0IEY6IFJpc2tzICYgUmVjb21tZW5kYXRpb25zLiBVc2UgIyMgUGFydCBYOiBUaXRsZSBoZWFkZXJzLiBJbmNsdWRlIGRhdGEgdGFibGVzIGZyb20gdGhlIHByb2plY3Rpb25zLmA7XG4gICAgfVxuICAgIGlmICh0YXJnZXQgPT09ICdleGVjdXRpdmVTdW1tYXJ5Jykge1xuICAgICAgICByZXR1cm4gYCR7Y29udGV4dH1cXG5cXG5HZW5lcmF0ZSBPTkxZIGFuIFwiZXhlY3V0aXZlU3VtbWFyeVwiIGRvY3VtZW50IGFzIGEgSlNPTiBvYmplY3Qgd2l0aCBhIHNpbmdsZSBrZXkgXCJleGVjdXRpdmVTdW1tYXJ5XCIgY29udGFpbmluZyBhIGNvbmNpc2UgTWFya2Rvd24gZXhlY3V0aXZlIHN1bW1hcnkgKDEtMiBwYWdlcykgaGlnaGxpZ2h0aW5nIHRoZSBrZXkgZmluYW5jaWFsIG1ldHJpY3MsIHRyZW5kcywgcmlza3MsIGFuZCBhY3Rpb25hYmxlIHJlY29tbWVuZGF0aW9ucyBmcm9tIHRoZSB3b3JrYm9vayBkYXRhLmA7XG4gICAgfVxuICAgIHJldHVybiBgJHtjb250ZXh0fVxcblxcbkdlbmVyYXRlIE9OTFkgYSBKU09OIG9iamVjdCB3aXRoIGtleXMgXCJhY3Rpb25QaGFzZXNcIiAoYXJyYXkgb2Yge3BoYXNlLCBkZXNjcmlwdGlvbn0pLCBcInRhcmdldFJvd3NcIiAoYXJyYXkgb2Yge2xhYmVsLCB2YWx1ZSwgdW5pdH0pLCBhbmQgXCJsZXZlcnNcIiAoYXJyYXkgb2Yge25hbWUsIGltcGFjdCwgYWN0aW9uc1tdfSkgYmFzZWQgb24gdGhlIGZpbmFuY2lhbCBkYXRhLiBGb2N1cyBvbiBhY3Rpb25hYmxlIG9wZXJhdGlvbmFsIHJlY29tbWVuZGF0aW9ucy5gO1xufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2xvYWRXb3JrYm9va1N0ZXBcIiwgbG9hZFdvcmtib29rU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZXh0cmFjdFNoZWV0c1N0ZXBcIiwgZXh0cmFjdFNoZWV0c1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2FuYWx5emVTaGVldHNTdGVwXCIsIGFuYWx5emVTaGVldHNTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zYXZlV29ya2Jvb2tGb3JtdWxhTWFwU3RlcFwiLCBzYXZlV29ya2Jvb2tGb3JtdWxhTWFwU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vY29tcHJlaGVuZFdvcmtib29rU3RlcFwiLCBjb21wcmVoZW5kV29ya2Jvb2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9lbWl0UHJvZ3Jlc3NTdGVwXCIsIGVtaXRQcm9ncmVzc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2Nsb3NlUHJvZ3Jlc3NTdGVwXCIsIGNsb3NlUHJvZ3Jlc3NTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9wb3B1bGF0ZVByb2plY3Rpb25zU3RlcFwiLCBwb3B1bGF0ZVByb2plY3Rpb25zU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vdXBzZXJ0U2hlZXRQYWdlc1N0ZXBcIiwgdXBzZXJ0U2hlZXRQYWdlc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NhdmVTbmlwcGV0c1N0ZXBcIiwgc2F2ZVNuaXBwZXRzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2VsZWN0VGVtcGxhdGVTdGVwXCIsIHNlbGVjdFRlbXBsYXRlU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vcmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwXCIsIHJlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXBcIiwgZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXBcIiwgZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVEYXNoYm9hcmRTdGVwXCIsIGdlbmVyYXRlRGFzaGJvYXJkU3RlcCk7XG4iLCAiLyoqXG4gKiBXb3JrYm9vayBTaGVldCBFeHRyYWN0aW9uIChkZXBlbmRlbmN5LWZyZWUpXG4gKlxuICogUHVyZSBzaGVldCBzZXJpYWxpemF0aW9uICsgc3RydWN0dXJhbCBzdGF0aXN0aWNzLiBUaGlzIG1vZHVsZSBpbnRlbnRpb25hbGx5XG4gKiBoYXMgTk8gYXBwbGljYXRpb24gYWxpYXNlcyAoYEAvLi4uYCksIG5vIHpvZCwgYW5kIG5vIE9wZW5BSSBpbXBvcnRzIHNvIHRoYXRcbiAqIGl0IGNhbiBiZSBidW5kbGVkIGludG8gVmVyY2VsIFdvcmtmbG93IHN0ZXAgYnVuZGxlcyAod29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdClcbiAqIHdpdGhvdXQgZHJhZ2dpbmcgdGhlIHdob2xlIGRvbWFpbiBsYXllciBhbG9uZy5cbiAqXG4gKiBUaGUgQUktZmlyc3QgcGlwZWxpbmUgc2VyaWFsaXplcyBldmVyeSBzaGVldCB0byBwbGFpbiB0ZXh0ICh0YWIgbmFtZSArIHJvd3MpXG4gKiBhbmQgbGV0cyB0aGUgbW9kZWwgZG8gdGhlIGNvbXByZWhlbnNpb24uIFRoZSBzdHJ1Y3R1cmFsIHN0YXRpc3RpY3MgcHJvZHVjZWRcbiAqIGhlcmUgZmVlZCBhIGRldGVybWluaXN0aWMgQU5BTFlaRSBwcmUtcGFzcyB0aGF0IGVucmljaGVzIHRoZSBBSSBwcm9tcHQuXG4gKi8gaW1wb3J0IHsgcmVhZCwgdXRpbHMgfSBmcm9tICd4bHN4JztcbmV4cG9ydCBjb25zdCBTSEVFVF9DQVRFR09SSUVTID0gW1xuICAgICdkYWlseV9zYWxlcycsXG4gICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgJ3RyaWFsX2JhbGFuY2UnLFxuICAgICdnZW5lcmFsX2xlZGdlcicsXG4gICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICdtb250aF9vbl9tb250aCcsXG4gICAgJ2JyZWFrX2V2ZW4nLFxuICAgICd2YXJpYW5jZScsXG4gICAgJ3N1bW1hcnlfcGwnLFxuICAgICdzdW1tYXJ5X2JzJyxcbiAgICAnb3RoZXInXG5dO1xuZXhwb3J0IGNvbnN0IE1BWF9TSEVFVF9ST1dTID0gNDA7XG5leHBvcnQgY29uc3QgTUFYX1NIRUVUX0NPTFMgPSAxNjtcbmV4cG9ydCBjb25zdCBNQVhfQ0VMTF9DSEFSUyA9IDgwO1xuZnVuY3Rpb24gZm9ybWF0Q2VsbCh2KSB7XG4gICAgaWYgKHYgPT0gbnVsbCkgcmV0dXJuICcnO1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgaWYgKE51bWJlci5pc0ludGVnZXIodikpIHJldHVybiBTdHJpbmcodik7XG4gICAgICAgIHJldHVybiB2LnRvRml4ZWQoMikucmVwbGFjZSgvXFwuMDAkLywgJycpO1xuICAgIH1cbiAgICBjb25zdCBzID0gU3RyaW5nKHYpLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCk7XG4gICAgcmV0dXJuIHMubGVuZ3RoID4gTUFYX0NFTExfQ0hBUlMgPyBzLnNsaWNlKDAsIE1BWF9DRUxMX0NIQVJTIC0gMSkgKyAnXHUyMDI2JyA6IHM7XG59XG5mdW5jdGlvbiByZWFkRnVsbEdyaWQoc2hlZXQpIHtcbiAgICByZXR1cm4gdXRpbHMuc2hlZXRfdG9fanNvbihzaGVldCwge1xuICAgICAgICBoZWFkZXI6IDEsXG4gICAgICAgIGRlZnZhbDogbnVsbCxcbiAgICAgICAgcmF3OiB0cnVlXG4gICAgfSk7XG59XG5mdW5jdGlvbiBjYXBHcmlkKGdyaWQsIG1heFJvd3MsIG1heENvbHMpIHtcbiAgICBjb25zdCBjYXBwZWQgPSBbXTtcbiAgICBmb3IobGV0IHIgPSAwOyByIDwgTWF0aC5taW4oZ3JpZC5sZW5ndGgsIG1heFJvd3MpOyByKyspe1xuICAgICAgICBjb25zdCByb3cgPSBncmlkW3JdID8/IFtdO1xuICAgICAgICBjb25zdCB0cmltbWVkID0gcm93LnNsaWNlKDAsIG1heENvbHMpO1xuICAgICAgICBpZiAodHJpbW1lZC5zb21lKChjKT0+YyAhPSBudWxsICYmIFN0cmluZyhjKS50cmltKCkgIT09ICcnKSkgY2FwcGVkLnB1c2godHJpbW1lZCk7XG4gICAgfVxuICAgIHJldHVybiBjYXBwZWQ7XG59XG5mdW5jdGlvbiBncmlkVG9UZXh0KGdyaWQpIHtcbiAgICBjb25zdCBsaW5lcyA9IGdyaWQubWFwKChyb3csIGkpPT57XG4gICAgICAgIGNvbnN0IGNlbGxzID0gcm93Lm1hcCgoYyk9PmZvcm1hdENlbGwoYykpO1xuICAgICAgICAvLyBUcmltIHRyYWlsaW5nIGVtcHRpZXMgZm9yIGNvbXBhY3RuZXNzXG4gICAgICAgIHdoaWxlKGNlbGxzLmxlbmd0aCA+IDAgJiYgY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV0gPT09ICcnKWNlbGxzLnBvcCgpO1xuICAgICAgICByZXR1cm4gYFIke2kgKyAxfTogJHtjZWxscy5qb2luKCcgfCAnKX1gO1xuICAgIH0pO1xuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVTdGF0cyh0YWJOYW1lLCBncmlkKSB7XG4gICAgbGV0IGNvbENvdW50ID0gMDtcbiAgICBsZXQgbnVtZXJpY0NlbGxzID0gMDtcbiAgICBsZXQgbm9uRW1wdHlDZWxscyA9IDA7XG4gICAgZm9yIChjb25zdCByb3cgb2YgZ3JpZCl7XG4gICAgICAgIGlmIChyb3cubGVuZ3RoID4gY29sQ291bnQpIGNvbENvdW50ID0gcm93Lmxlbmd0aDtcbiAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHJvdyl7XG4gICAgICAgICAgICBpZiAoY2VsbCA9PSBudWxsIHx8IFN0cmluZyhjZWxsKS50cmltKCkgPT09ICcnKSBjb250aW51ZTtcbiAgICAgICAgICAgIG5vbkVtcHR5Q2VsbHMrKztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2VsbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBudW1lcmljQ2VsbHMrKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGwgPT09ICdzdHJpbmcnICYmIC9eWy0rXT9cXGRbXFxkLixdKiQvLnRlc3QoY2VsbC50cmltKCkpKSB7XG4gICAgICAgICAgICAgICAgbnVtZXJpY0NlbGxzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGFiTmFtZSxcbiAgICAgICAgcm93Q291bnQ6IGdyaWQubGVuZ3RoLFxuICAgICAgICBjb2xDb3VudCxcbiAgICAgICAgbnVtZXJpY1JhdGlvOiBub25FbXB0eUNlbGxzID4gMCA/IG51bWVyaWNDZWxscyAvIG5vbkVtcHR5Q2VsbHMgOiAwLFxuICAgICAgICBub25FbXB0eUNlbGxzXG4gICAgfTtcbn1cbi8qKiBTZXJpYWxpemUgb25lIHdvcmtzaGVldCB0byB0ZXh0IChyb3ctbnVtYmVyZWQsIGNhcHBlZCkgZm9yIHRoZSBBSSBwcm9tcHQuICovIGV4cG9ydCBmdW5jdGlvbiByZW5kZXJTaGVldEZvckFpKHdiLCB0YWJOYW1lLCBtYXhSb3dzID0gTUFYX1NIRUVUX1JPV1MsIG1heENvbHMgPSBNQVhfU0hFRVRfQ09MUykge1xuICAgIGNvbnN0IHNoZWV0ID0gd2IuU2hlZXRzW3RhYk5hbWVdO1xuICAgIGlmICghc2hlZXQpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGdyaWQgPSBjYXBHcmlkKHJlYWRGdWxsR3JpZChzaGVldCksIG1heFJvd3MsIG1heENvbHMpO1xuICAgIGlmIChncmlkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGFiTmFtZSxcbiAgICAgICAgdGV4dDogZ3JpZFRvVGV4dChncmlkKVxuICAgIH07XG59XG4vKiogU2VyaWFsaXplIEFMTCBzaGVldHMgb2YgYSB3b3JrYm9vayB0byB0ZXh0IGJsb2Nrcy4gQWNjZXB0cyBVaW50OEFycmF5IG9yIEJ1ZmZlci4gKi8gZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckFsbFNoZWV0c0ZvckFpKGJ1Zikge1xuICAgIGNvbnN0IHdiID0gcmVhZChidWYsIHtcbiAgICAgICAgdHlwZTogJ2J1ZmZlcidcbiAgICB9KTtcbiAgICBjb25zdCBibG9ja3MgPSBbXTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygd2IuU2hlZXROYW1lcyA/PyBbXSl7XG4gICAgICAgIGNvbnN0IHJlbmRlcmVkID0gcmVuZGVyU2hlZXRGb3JBaSh3YiwgbmFtZSk7XG4gICAgICAgIGlmIChyZW5kZXJlZCkgYmxvY2tzLnB1c2gocmVuZGVyZWQpO1xuICAgIH1cbiAgICByZXR1cm4gYmxvY2tzO1xufVxuLyoqXG4gKiBTZXJpYWxpemUgQUxMIHNoZWV0cyBBTkQgY29tcHV0ZSBmdWxsLWdyaWQgc3RydWN0dXJhbCBzdGF0aXN0aWNzLlxuICogVGhpcyBpcyB0aGUgRVhUUkFDVCBvdXRwdXQgZm9yIHRoZSB3b3JrZmxvdyBwaXBlbGluZTogb25lIHBhcnNlIHBlclxuICogc2hlZXQgcHJvZHVjZXMgYm90aCB0aGUgQUkgcHJvbXB0IGJsb2NrIGFuZCB0aGUgQU5BTFlaRSBoaW50cy5cbiAqLyBleHBvcnQgZnVuY3Rpb24gZXh0cmFjdFNoZWV0c1dpdGhTdGF0cyhidWYpIHtcbiAgICBjb25zdCB3YiA9IHJlYWQoYnVmLCB7XG4gICAgICAgIHR5cGU6ICdidWZmZXInXG4gICAgfSk7XG4gICAgY29uc3Qgc2hlZXRzID0gW107XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHdiLlNoZWV0TmFtZXMgPz8gW10pe1xuICAgICAgICBjb25zdCBzaGVldCA9IHdiLlNoZWV0c1tuYW1lXTtcbiAgICAgICAgaWYgKCFzaGVldCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGZ1bGxHcmlkID0gcmVhZEZ1bGxHcmlkKHNoZWV0KTtcbiAgICAgICAgaWYgKGZ1bGxHcmlkLmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IHN0YXRzID0gY29tcHV0ZVN0YXRzKG5hbWUsIGZ1bGxHcmlkKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGdyaWRUb1RleHQoY2FwR3JpZChmdWxsR3JpZCwgTUFYX1NIRUVUX1JPV1MsIE1BWF9TSEVFVF9DT0xTKSk7XG4gICAgICAgIHNoZWV0cy5wdXNoKHtcbiAgICAgICAgICAgIHRhYk5hbWU6IG5hbWUsXG4gICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgc3RhdHNcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBzaGVldHM7XG59XG4iLCAiLyoqXG4gKiBXb3JrYm9vayBTaGVldCBBbmFseXNpcyAoZGV0ZXJtaW5pc3RpYyBwcmUtcGFzcylcbiAqXG4gKiBBIGRlcGVuZGVuY3ktZnJlZSBoZXVyaXN0aWMgcGFzcyBvdmVyIGV4dHJhY3RlZCBzaGVldHMgdGhhdCBwcm9kdWNlc1xuICogXCJBbmFseXNpc0hpbnRzXCIgXHUyMDE0IHN0cnVjdHVyZWQgY29udGV4dCB0aGF0OlxuICogICAtIGlzIGZlZCBpbnRvIHRoZSBDT01QUkVIRU5EIHByb21wdCB0byBiaWFzIHRoZSBtb2RlbCAoUGhhc2UgMiksXG4gKiAgIC0gZ2l2ZXMgdGhlIHJvdXRlIGxheWVyIGEgZmFzdCBwcmUtQUkgc3RhdHVzIChcIndlIHNlZSA0IHNoZWV0cywgbW9zdGx5XG4gKiAgICAgbnVtZXJpYywgbGlrZWx5IElEUiwgcGVyaW9kIGhpbnRzIDIwMjYtMDZcIikuXG4gKlxuICogTm8gYXBwbGljYXRpb24gYWxpYXNlcyBhbmQgbm8gZXh0ZXJuYWwgZGVwcyBcdTIwMTQgc2FmZSB0byBidW5kbGUgaW50byB0aGVcbiAqIFZlcmNlbCBXb3JrZmxvdyBzdGVwIGJ1bmRsZS5cbiAqLyBpbXBvcnQgeyBTSEVFVF9DQVRFR09SSUVTIH0gZnJvbSAnLi9leHRyYWN0LXNoZWV0cyc7XG4vLyBcdTI1MDBcdTI1MDAgSGV1cmlzdGljIHRhYmxlcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmNvbnN0IENVUlJFTkNZX1BBVFRFUk5TID0gW1xuICAgIFtcbiAgICAgICAgJ0lEUicsXG4gICAgICAgIC9cXGIoPzpJRFJ8UnBcXC4/fFJ1cGlhaClcXGIvaVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnVVNEJyxcbiAgICAgICAgL1xcYig/OlVTRHxcXCQpXFxiL1xuICAgIF0sXG4gICAgW1xuICAgICAgICAnRVVSJyxcbiAgICAgICAgL1xcYig/OkVVUnxcdTIwQUMpXFxiL1xuICAgIF0sXG4gICAgW1xuICAgICAgICAnR0JQJyxcbiAgICAgICAgL1xcYig/OkdCUHxcdTAwQTMpXFxiL1xuICAgIF1cbl07XG5jb25zdCBNT05USF9OQU1FUyA9IFtcbiAgICAnamFudWFyeScsXG4gICAgJ2ZlYnJ1YXJ5JyxcbiAgICAnbWFyY2gnLFxuICAgICdhcHJpbCcsXG4gICAgJ21heScsXG4gICAgJ2p1bmUnLFxuICAgICdqdWx5JyxcbiAgICAnYXVndXN0JyxcbiAgICAnc2VwdGVtYmVyJyxcbiAgICAnb2N0b2JlcicsXG4gICAgJ25vdmVtYmVyJyxcbiAgICAnZGVjZW1iZXInLFxuICAgICdqYW51YXJpJyxcbiAgICAnZmVicnVhcmknLFxuICAgICdtYXJldCcsXG4gICAgJ2FwcmlsJyxcbiAgICAnbWVpJyxcbiAgICAnanVuaScsXG4gICAgJ2p1bGknLFxuICAgICdhZ3VzdHVzJyxcbiAgICAnc2VwdGVtYmVyJyxcbiAgICAnb2t0b2JlcicsXG4gICAgJ25vdmVtYmVyJyxcbiAgICAnZGVzZW1iZXInXG5dO1xuZnVuY3Rpb24gcGVyaW9kUGF0dGVybnMoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgL1xcYigxOXwyMClcXGR7Mn1bLS9dKDA/WzEtOV18MVswLTJdKSg/OlstL11cXGR7MSwyfSk/XFxiL2csXG4gICAgICAgIC9cXGIoMD9bMS05XXwxWzAtMl0pWy0vXSgxOXwyMClcXGR7Mn1cXGIvZyxcbiAgICAgICAgbmV3IFJlZ0V4cChgXFxcXGIoPzoke01PTlRIX05BTUVTLmpvaW4oJ3wnKX0pXFxcXGJgLCAnZ2knKSxcbiAgICAgICAgL1xcYlFbMS00XVsgLV0/KD86MTl8MjApXFxkezJ9XFxiL2dpXG4gICAgXTtcbn1cbmNvbnN0IExBQkVMX0NBVEVHT1JZX01BUCA9IFtcbiAgICBbXG4gICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdQUk9GSVQgJiBMT1NTJyxcbiAgICAgICAgICAgICdQUk9GSVQgQU5EIExPU1MnLFxuICAgICAgICAgICAgJ0xhYmEgUnVnaScsXG4gICAgICAgICAgICAnSU5DT01FIFNUQVRFTUVOVCcsXG4gICAgICAgICAgICAnUCZMJyxcbiAgICAgICAgICAgICdFQklUREEnLFxuICAgICAgICAgICAgJ05FVCBQUk9GSVQnLFxuICAgICAgICAgICAgJ05FVCBJTkNPTUUnLFxuICAgICAgICAgICAgJ0xBQkEgQkVSU0lIJyxcbiAgICAgICAgICAgICdSVUdJJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ0JBTEFOQ0UgU0hFRVQnLFxuICAgICAgICAgICAgJ05FUkFDQScsXG4gICAgICAgICAgICAnQVNTRVQnLFxuICAgICAgICAgICAgJ0xJQUJJTElUJyxcbiAgICAgICAgICAgICdFS1VJVEFTJyxcbiAgICAgICAgICAgICdFUVVJVFknLFxuICAgICAgICAgICAgJ1RPVEFMIEFTU0VUUydcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAndHJpYWxfYmFsYW5jZScsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdUUklBTCBCQUxBTkNFJyxcbiAgICAgICAgICAgICdORVJBQ0EgU0FMRE8nXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ2dlbmVyYWxfbGVkZ2VyJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ0dFTkVSQUwgTEVER0VSJyxcbiAgICAgICAgICAgICdCVUtVIEJFU0FSJyxcbiAgICAgICAgICAgICdKVVJOQUwnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnQ09TVCBPRiBTQUxFUycsXG4gICAgICAgICAgICAnQ09HUycsXG4gICAgICAgICAgICAnSEFSR0EgUE9LT0snLFxuICAgICAgICAgICAgJ0ZPT0QgQ09TVCcsXG4gICAgICAgICAgICAnQkVWRVJBR0UgQ09TVCdcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnYnJlYWtfZXZlbicsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdCUkVBSyBFVkVOJyxcbiAgICAgICAgICAgICdCUkVBSy1FVkVOJyxcbiAgICAgICAgICAgICdCRVAnLFxuICAgICAgICAgICAgJ1RJVElLIElNUEFTJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdkYWlseV9zYWxlcycsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdEQUlMWSBTQUxFUycsXG4gICAgICAgICAgICAnUEVOSlVBTEFOIEhBUklBTicsXG4gICAgICAgICAgICAnT01aRVQnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ21vbnRoX29uX21vbnRoJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ01PTlRIIE9OIE1PTlRIJyxcbiAgICAgICAgICAgICdNT00nLFxuICAgICAgICAgICAgJ0JVTEFOQU4nXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ3ZhcmlhbmNlJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ1ZBUklBTkNFJyxcbiAgICAgICAgICAgICdWQVJJQU5TSScsXG4gICAgICAgICAgICAnU0VMSVNJSCcsXG4gICAgICAgICAgICAnQUNUVUFMIFZTIEJVREdFVCcsXG4gICAgICAgICAgICAnQUNUVUFMIFZTJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdzdW1tYXJ5X3BsJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ1NVTU1BUlkgUCZMJyxcbiAgICAgICAgICAgICdSSU5HS0FTQU4gTEFCQSBSVUdJJyxcbiAgICAgICAgICAgICdTVU1NQVJZIFBST0ZJVCdcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnc3VtbWFyeV9icycsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdTVU1NQVJZIEJBTEFOQ0UnLFxuICAgICAgICAgICAgJ1JJTkdLQVNBTiBORVJBQ0EnXG4gICAgICAgIF1cbiAgICBdXG5dO1xuZnVuY3Rpb24gY29sbGVjdEhpbnRzKHRleHQpIHtcbiAgICBjb25zdCBjdXJyZW5jeSA9IFtdO1xuICAgIGZvciAoY29uc3QgW25hbWUsIHJlXSBvZiBDVVJSRU5DWV9QQVRURVJOUyl7XG4gICAgICAgIGlmIChyZS50ZXN0KHRleHQpKSBjdXJyZW5jeS5wdXNoKG5hbWUpO1xuICAgIH1cbiAgICBjb25zdCBwZXJpb2RzID0gW107XG4gICAgZm9yIChjb25zdCByZSBvZiBwZXJpb2RQYXR0ZXJucygpKXtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHRleHQubWF0Y2gocmUpO1xuICAgICAgICBpZiAobWF0Y2hlcykgcGVyaW9kcy5wdXNoKC4uLm1hdGNoZXMpO1xuICAgIH1cbiAgICBjb25zdCBsYWJlbHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IFssIHRlcm1zXSBvZiBMQUJFTF9DQVRFR09SWV9NQVApe1xuICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybXMpe1xuICAgICAgICAgICAgaWYgKHRleHQudG9VcHBlckNhc2UoKS5pbmNsdWRlcyh0ZXJtLnRvVXBwZXJDYXNlKCkpKSBsYWJlbHMucHVzaCh0ZXJtKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW5jeSxcbiAgICAgICAgcGVyaW9kcyxcbiAgICAgICAgbGFiZWxzXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGd1ZXNzQ2F0ZWdvcnkobGFiZWxzKSB7XG4gICAgY29uc3Qgc2NvcmVzID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgW2NhdGVnb3J5LCB0ZXJtc10gb2YgTEFCRUxfQ0FURUdPUllfTUFQKXtcbiAgICAgICAgbGV0IHNjb3JlID0gMDtcbiAgICAgICAgZm9yIChjb25zdCB0ZXJtIG9mIHRlcm1zKXtcbiAgICAgICAgICAgIGlmIChsYWJlbHMuaW5jbHVkZXModGVybSkpIHNjb3JlICs9IHRlcm0ubGVuZ3RoOyAvLyBsb25nZXIgdGVybXMgYXJlIG1vcmUgc3BlY2lmaWNcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NvcmUgPiAwKSBzY29yZXMuc2V0KGNhdGVnb3J5LCBzY29yZSk7XG4gICAgfVxuICAgIGlmIChzY29yZXMuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3Qgc29ydGVkID0gW1xuICAgICAgICAuLi5zY29yZXMuZW50cmllcygpXG4gICAgXS5zb3J0KChhLCBiKT0+YlsxXSAtIGFbMV0pO1xuICAgIGlmIChzb3J0ZWQubGVuZ3RoID4gMSAmJiBzb3J0ZWRbMF1bMV0gPT09IHNvcnRlZFsxXVsxXSkgcmV0dXJuIG51bGw7IC8vIHRpZSBcdTIxOTIgYW1iaWd1b3VzXG4gICAgcmV0dXJuIHNvcnRlZFswXVswXTtcbn1cbmZ1bmN0aW9uIGJlc3RHdWVzcyh2YWx1ZXMpIHtcbiAgICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgY291bnRzID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgdiBvZiB2YWx1ZXMpY291bnRzLnNldCh2LCAoY291bnRzLmdldCh2KSA/PyAwKSArIDEpO1xuICAgIHJldHVybiBbXG4gICAgICAgIC4uLmNvdW50cy5lbnRyaWVzKClcbiAgICBdLnNvcnQoKGEsIGIpPT5iWzFdIC0gYVsxXSlbMF1bMF07XG59XG4vLyBcdTI1MDBcdTI1MDAgUHVibGljIEFQSSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8qKiBBbmFseXplIGV4dHJhY3RlZCBzaGVldHMgKEVYVFJBQ1Qgb3V0cHV0KSBpbnRvIGRldGVybWluaXN0aWMgaGludHMuICovIGV4cG9ydCBmdW5jdGlvbiBhbmFseXplU2hlZXRzKHNoZWV0cykge1xuICAgIGNvbnN0IHNoZWV0SGludHMgPSBzaGVldHMubWFwKChzKT0+e1xuICAgICAgICBjb25zdCB7IGN1cnJlbmN5LCBwZXJpb2RzLCBsYWJlbHMgfSA9IGNvbGxlY3RIaW50cyhzLnRleHQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGFiTmFtZTogcy50YWJOYW1lLFxuICAgICAgICAgICAgcm93Q291bnQ6IHMuc3RhdHMucm93Q291bnQsXG4gICAgICAgICAgICBjb2xDb3VudDogcy5zdGF0cy5jb2xDb3VudCxcbiAgICAgICAgICAgIG51bWVyaWNSYXRpbzogcy5zdGF0cy5udW1lcmljUmF0aW8sXG4gICAgICAgICAgICBjdXJyZW5jeUhpbnRzOiBjdXJyZW5jeSxcbiAgICAgICAgICAgIHBlcmlvZEhpbnRzOiBwZXJpb2RzLFxuICAgICAgICAgICAgbGFiZWxIaW50czogbGFiZWxzLFxuICAgICAgICAgICAgbGlrZWx5Q2F0ZWdvcnk6IGd1ZXNzQ2F0ZWdvcnkobGFiZWxzKVxuICAgICAgICB9O1xuICAgIH0pO1xuICAgIGNvbnN0IHRvdGFsUm93cyA9IHNoZWV0SGludHMucmVkdWNlKChhY2MsIHMpPT5hY2MgKyBzLnJvd0NvdW50LCAwKTtcbiAgICBjb25zdCB0b3RhbE5vbkVtcHR5Q2VsbHMgPSBzaGVldHMucmVkdWNlKChhY2MsIHMpPT5hY2MgKyBzLnN0YXRzLm5vbkVtcHR5Q2VsbHMsIDApO1xuICAgIGNvbnN0IHdlaWdodGVkTnVtZXJpYyA9IHNoZWV0cy5yZWR1Y2UoKGFjYywgcyk9PmFjYyArIHMuc3RhdHMubnVtZXJpY1JhdGlvICogcy5zdGF0cy5ub25FbXB0eUNlbGxzLCAwKTtcbiAgICBjb25zdCBhbGxDdXJyZW5jeSA9IHNoZWV0SGludHMuZmxhdE1hcCgocyk9PnMuY3VycmVuY3lIaW50cyk7XG4gICAgY29uc3QgYWxsUGVyaW9kcyA9IHNoZWV0SGludHMuZmxhdE1hcCgocyk9PnMucGVyaW9kSGludHMpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHdvcmtib29rOiB7XG4gICAgICAgICAgICBzaGVldENvdW50OiBzaGVldHMubGVuZ3RoLFxuICAgICAgICAgICAgdG90YWxSb3dzLFxuICAgICAgICAgICAgdG90YWxOb25FbXB0eUNlbGxzLFxuICAgICAgICAgICAgb3ZlcmFsbE51bWVyaWNSYXRpbzogdG90YWxOb25FbXB0eUNlbGxzID4gMCA/IHdlaWdodGVkTnVtZXJpYyAvIHRvdGFsTm9uRW1wdHlDZWxscyA6IDAsXG4gICAgICAgICAgICBjdXJyZW5jeUd1ZXNzOiBiZXN0R3Vlc3MoYWxsQ3VycmVuY3kpLFxuICAgICAgICAgICAgcGVyaW9kR3Vlc3M6IGJlc3RHdWVzcyhhbGxQZXJpb2RzKVxuICAgICAgICB9LFxuICAgICAgICBzaGVldHM6IHNoZWV0SGludHNcbiAgICB9O1xufVxuZXhwb3J0IHsgU0hFRVRfQ0FURUdPUklFUyB9O1xuIiwgIi8qKlxuICogV29ya2Jvb2sgQ29tcHJlaGVuc2lvbiBcdTIwMTQgYnVuZGxlLWxlYW4gT3BlbkFJIGNhbGxcbiAqXG4gKiBUaGlzIG1vZHVsZSBjb250YWlucyBPTkxZIHRoZSBjb21wcmVoZW5zaW9uIHJlcXVlc3QgcGF0aDogWm9kIHNjaGVtYXMsXG4gKiBwcm9tcHQgYnVpbGRpbmcgKGhpbnRzLWF3YXJlKSwgYSBzaW5nbGUtYXR0ZW1wdCBPcGVuQUkgY2FsbCB3aXRoIHR5cGVkXG4gKiBlcnJvcnMsIGFuZCByZXNwb25zZSBwYXJzaW5nLlxuICpcbiAqIEJ1bmRsZSBjb25zdHJhaW50czpcbiAqICAgLSBOTyBhcHBsaWNhdGlvbiBhbGlhc2VzIChgQC8uLi5gKSBcdTIwMTQgb25seSBgem9kYCArIHJlbGF0aXZlIGltcG9ydHMuXG4gKiAgIC0gTm8gREIgLyBzZWNyZXRzIC8gUHJpc21hIFx1MjAxNCB0aGUgQVBJIGtleSBpcyBwYXNzZWQgaW4gZXhwbGljaXRseS5cbiAqICAgLSBTYWZlIHRvIGJ1bmRsZSBpbnRvIFZlcmNlbCBXb3JrZmxvdyBzdGVwIGJ1bmRsZXMgKHdvcmtmbG93cy8qKS5cbiAqXG4gKiBUaGUgc3luYyBwaXBlbGluZSB3cmFwcGVyIChgY29tcHJlaGVuZFdvcmtib29rYCBpbiB3b3JrYm9vay1jb21wcmVoZW5zaW9uLnRzKVxuICoga2VlcHMgaXRzIG93biBrZXkgcmVzb2x1dGlvbiArIDItYXR0ZW1wdCByZXRyeSBsb29wIGZvciB0aGUgbm9uLXdvcmtmbG93XG4gKiBwYXRoOyB0aGlzIG1vZHVsZSBpcyB0aGUgc2hhcmVkIHNpbmdsZS1hdHRlbXB0IGNvcmUuXG4gKi8gaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBTSEVFVF9DQVRFR09SSUVTIH0gZnJvbSAnLi9leHRyYWN0LXNoZWV0cyc7XG4vLyBcdTI1MDBcdTI1MDAgWm9kIHZhbGlkYXRpb24gc2NoZW1hIGZvciB0aGUgQUkgc3RydWN0dXJlZCBvdXRwdXQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5leHBvcnQgY29uc3QgTWV0cmljU2NoZW1hID0gei5vYmplY3Qoe1xuICAgIC8qKiBQZXJpb2QgaW4gWVlZWS1NTSAoYW5udWFsIHRvdGFscyBtYXkgdXNlIFlZWVktMTIpLiAqLyBwZXJpb2Q6IHouc3RyaW5nKCkucmVnZXgoL15cXGR7NH0tXFxkezJ9JC8pLFxuICAgIGRhdGFUeXBlOiB6LmVudW0oW1xuICAgICAgICAnYWN0dWFsJyxcbiAgICAgICAgJ2ZvcmVjYXN0J1xuICAgIF0pLFxuICAgIHNjZW5hcmlvOiB6LmVudW0oW1xuICAgICAgICAnYWN0dWFsJyxcbiAgICAgICAgJ2NvbnNlcnZhdGl2ZScsXG4gICAgICAgICdyZWFsaXN0aWMnLFxuICAgICAgICAnYXNwaXJhdGlvbmFsJ1xuICAgIF0pLFxuICAgIHJldmVudWU6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgIGViaXRkYTogei5udW1iZXIoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgbmV0SW5jb21lOiB6Lm51bWJlcigpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICBndWVzdHM6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgIHN0YWZmQ29zdDogei5udW1iZXIoKS5udWxsYWJsZSgpLm9wdGlvbmFsKClcbn0pO1xuZXhwb3J0IGNvbnN0IFNoZWV0Q29tcHJlaGVuc2lvblNjaGVtYSA9IHoub2JqZWN0KHtcbiAgICAvKiogRXhhY3QgdGFiIG5hbWUgYXMgaXQgYXBwZWFycyBpbiB0aGUgd29ya2Jvb2suICovIHRhYk5hbWU6IHouc3RyaW5nKCksXG4gICAgY2F0ZWdvcnk6IHouZW51bShTSEVFVF9DQVRFR09SSUVTKSxcbiAgICAvKiogSHVtYW4tcmVhZGFibGUgdGl0bGUgZm9yIHRoZSBkeW5hbWljIHBhZ2UuICovIHRpdGxlOiB6LnN0cmluZygpLFxuICAgIC8qKiBPbmUtcGFyYWdyYXBoIGNvbXByZWhlbnNpb24gb2Ygd2hhdCB0aGlzIHNoZWV0IGNvbnRhaW5zLiAqLyBzdW1tYXJ5OiB6LnN0cmluZygpLFxuICAgIC8qKiBEZXRlY3RlZCBwZXJpb2QsIGUuZy4gXCJKdW5lIDIwMjZcIiBcdTIwMTQgbnVsbCB3aGVuIG5vdCBkZXRlY3RhYmxlLiAqLyBwZXJpb2RIaW50OiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAvKiogQ29sdW1uIGhlYWRlcnMgKGZpcnN0IG1lYW5pbmdmdWwgcm93KS4gKi8gY29sdW1uczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLFxuICAgIHJvd0NvdW50OiB6Lm51bWJlcigpLmludCgpLm5vbm5lZ2F0aXZlKCkub3B0aW9uYWwoKSxcbiAgICAvKiogUGVyLXBlcmlvZCBtZXRyaWNzIGZvdW5kIG9uIFRISVMgc2hlZXQuICovIG1ldHJpY3M6IHouYXJyYXkoTWV0cmljU2NoZW1hKS5vcHRpb25hbCgpXG59KTtcbmV4cG9ydCBjb25zdCBXb3JrYm9va0NvbXByZWhlbnNpb25TY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgd29ya2Jvb2s6IHoub2JqZWN0KHtcbiAgICAgICAgdGl0bGU6IHouc3RyaW5nKCksXG4gICAgICAgIGNvbXBhbnk6IHouc3RyaW5nKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgICAgICBwZXJpb2Q6IHouc3RyaW5nKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgICAgICBjdXJyZW5jeTogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgICAgIHN1bW1hcnk6IHouc3RyaW5nKClcbiAgICB9KSxcbiAgICBzaGVldHM6IHouYXJyYXkoU2hlZXRDb21wcmVoZW5zaW9uU2NoZW1hKSxcbiAgICAvKipcbiAgICogTm9ybWFsaXplZCBmaW5hbmNpYWwgcHJvamVjdGlvbnMgY29uc29saWRhdGVkIGFjcm9zcyBBTEwgc2hlZXRzLlxuICAgKiBUaGlzIGlzIHRoZSBzb3VyY2UgZm9yIHRoZSBmaW5hbmNpYWxfcHJvamVjdGlvbnMgdGFibGUuXG4gICAqLyBwcm9qZWN0aW9uczogei5hcnJheShNZXRyaWNTY2hlbWEpLFxuICAgIC8qKlxuICAgKiBUZW1wbGF0ZSBzdWdnZXN0aW9uIGZyb20gdGhlIGF2YWlsYWJsZSB0ZW1wbGF0ZSBjYXRhbG9nXG4gICAqIChURU1QTEFURV9DQVRBTE9HIGlkcywgZS5nLiBcImZpbmFuY2lhbC1hbmFseXRpY3NcIiwgXCJyZXN0YXVyYW50XCIpLlxuICAgKi8gdGVtcGxhdGU6IHoub2JqZWN0KHtcbiAgICAgICAgaWQ6IHouc3RyaW5nKCksXG4gICAgICAgIGNvbmZpZGVuY2U6IHoubnVtYmVyKCkubWluKDApLm1heCgxKS5vcHRpb25hbCgpLFxuICAgICAgICByZWFzb246IHouc3RyaW5nKCkub3B0aW9uYWwoKVxuICAgIH0pLm9wdGlvbmFsKClcbn0pO1xuLy8gXHUyNTAwXHUyNTAwIFR5cGVkIGVycm9ycyAobWFwcGVkIHRvIHRoZSB3b3JrZmxvdyByZXRyeSBwb2xpY3kgYnkgdGhlIGNhbGxlcikgXHUyNTAwXG5leHBvcnQgY2xhc3MgQ29tcHJlaGVuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG9wdGlvbnMpe1xuICAgICAgICBzdXBlcihtZXNzYWdlLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0NvbXByZWhlbmRFcnJvcic7XG4gICAgfVxufVxuLyoqIEhUVFAtbGV2ZWwgZmFpbHVyZSAobm9uLTJ4eCkuIENhcnJpZXMgc3RhdHVzICsgb3B0aW9uYWwgUmV0cnktQWZ0ZXIuICovIGV4cG9ydCBjbGFzcyBDb21wcmVoZW5kSHR0cEVycm9yIGV4dGVuZHMgQ29tcHJlaGVuZEVycm9yIHtcbiAgICBzdGF0dXM7XG4gICAgLyoqIFJldHJ5LUFmdGVyIGhlYWRlciB2YWx1ZSBpbiBzZWNvbmRzLCB3aGVuIHByZXNlbnQuICovIHJldHJ5QWZ0ZXJTZWNvbmRzO1xuICAgIGNvbnN0cnVjdG9yKHN0YXR1cywgbWVzc2FnZSwgcmV0cnlBZnRlclNlY29uZHMgPSBudWxsKXtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdDb21wcmVoZW5kSHR0cEVycm9yJztcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMucmV0cnlBZnRlclNlY29uZHMgPSByZXRyeUFmdGVyU2Vjb25kcztcbiAgICB9XG59XG4vKiogUmVzcG9uc2UgY291bGQgbm90IGJlIHBhcnNlZC92YWxpZGF0ZWQgKEpTT04gb3IgWm9kKS4gKi8gZXhwb3J0IGNsYXNzIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IgZXh0ZW5kcyBDb21wcmVoZW5kRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG9wdGlvbnMpe1xuICAgICAgICBzdXBlcihtZXNzYWdlLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0NvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3InO1xuICAgIH1cbn1cbi8vIFx1MjUwMFx1MjUwMCBQcm9tcHQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5jb25zdCBTWVNURU1fUFJPTVBUID0gJ1lvdSBhcmUgYSBwcmVjaXNlIGZpbmFuY2lhbCBhbmFseXN0IGFuZCB3b3JrYm9vayBpbnRlcnByZXRlci4gJyArICdZb3UgcmVhZCByYXcgc3ByZWFkc2hlZXQgZHVtcHMgYW5kIHJldHVybiBPTkxZIHZhbGlkIEpTT04gbWF0Y2hpbmcgdGhlIHJlcXVlc3RlZCBzY2hlbWEgZXhhY3RseS4gJyArICdOZXZlciBpbnZlbnQgZGF0YSB0aGF0IGlzIG5vdCBwcmVzZW50IGluIHRoZSBzaGVldHMgXHUyMDE0IGxlYXZlIG1ldHJpY3MgbnVsbCB3aGVuIGFic2VudC4nO1xuLyoqIFJlbmRlciB0aGUgZGV0ZXJtaW5pc3RpYyBBTkFMWVpFIGhpbnRzIGFzIGEgcHJvbXB0IHNlY3Rpb24uICovIGZ1bmN0aW9uIHJlbmRlckhpbnRzU2VjdGlvbihoaW50cykge1xuICAgIGNvbnN0IHdiID0gaGludHMud29ya2Jvb2s7XG4gICAgY29uc3QgbGluZXMgPSBbXG4gICAgICAgIGAtIFdvcmtib29rOiAke3diLnNoZWV0Q291bnR9IHNoZWV0KHMpLCAke3diLnRvdGFsUm93c30gdG90YWwgcm93cywgYCArIGAke01hdGgucm91bmQod2Iub3ZlcmFsbE51bWVyaWNSYXRpbyAqIDEwMCl9JSBudW1lcmljIGNlbGxzLmBcbiAgICBdO1xuICAgIGlmICh3Yi5jdXJyZW5jeUd1ZXNzKSBsaW5lcy5wdXNoKGAtIEN1cnJlbmN5IGd1ZXNzOiAke3diLmN1cnJlbmN5R3Vlc3N9YCk7XG4gICAgaWYgKHdiLnBlcmlvZEd1ZXNzKSBsaW5lcy5wdXNoKGAtIFBlcmlvZCBndWVzczogJHt3Yi5wZXJpb2RHdWVzc31gKTtcbiAgICBmb3IgKGNvbnN0IHMgb2YgaGludHMuc2hlZXRzKXtcbiAgICAgICAgY29uc3QgcGFydHMgPSBbXG4gICAgICAgICAgICBgXCIke3MudGFiTmFtZX1cIjogJHtzLnJvd0NvdW50fSByb3dzIFx1MDBENyAke3MuY29sQ291bnR9IGNvbHMsIGAgKyBgJHtNYXRoLnJvdW5kKHMubnVtZXJpY1JhdGlvICogMTAwKX0lIG51bWVyaWNgXG4gICAgICAgIF07XG4gICAgICAgIGlmIChzLmN1cnJlbmN5SGludHMubGVuZ3RoID4gMCkgcGFydHMucHVzaChgY3VycmVuY3kgWyR7cy5jdXJyZW5jeUhpbnRzLmpvaW4oJywnKX1dYCk7XG4gICAgICAgIGlmIChzLnBlcmlvZEhpbnRzLmxlbmd0aCA+IDApIHBhcnRzLnB1c2goYHBlcmlvZHMgWyR7cy5wZXJpb2RIaW50cy5qb2luKCcsICcpfV1gKTtcbiAgICAgICAgaWYgKHMubGFiZWxIaW50cy5sZW5ndGggPiAwKSBwYXJ0cy5wdXNoKGBsYWJlbHMgWyR7cy5sYWJlbEhpbnRzLmpvaW4oJywgJyl9XWApO1xuICAgICAgICBpZiAocy5saWtlbHlDYXRlZ29yeSkgcGFydHMucHVzaChgY2F0ZWdvcnktZ3Vlc3MgJHtzLmxpa2VseUNhdGVnb3J5fWApO1xuICAgICAgICBsaW5lcy5wdXNoKGAgIC0gU2hlZXQgJHtwYXJ0cy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59XG5leHBvcnQgZnVuY3Rpb24gYnVpbGRDb21wcmVoZW5zaW9uUHJvbXB0KGJsb2NrcywgaGludHMpIHtcbiAgICBjb25zdCBzaGVldEJsb2NrcyA9IGJsb2Nrcy5tYXAoKGIpPT5gPT09PT0gU0hFRVQ6ICR7Yi50YWJOYW1lfSA9PT09PVxcbiR7Yi50ZXh0fVxcbmApLmpvaW4oJ1xcbicpO1xuICAgIGNvbnN0IGhpbnRzU2VjdGlvbiA9IGhpbnRzID8gYERFVEVSTUlOSVNUSUMgUFJFLUFOQUxZU0lTIChnZW5lcmF0ZWQgYnkgY29kZSBcdTIwMTQgdXNlIGFzIHN0cm9uZyBwcmlvcnMsIGJ1dCBBTFdBWVMgdmVyaWZ5IGFnYWluc3QgdGhlIGFjdHVhbCBkdW1wOyBjYXRlZ29yeS1ndWVzcyBpcyBub3QgYXV0aG9yaXRhdGl2ZSk6XG4ke3JlbmRlckhpbnRzU2VjdGlvbihoaW50cyl9XG5cbmAgOiAnJztcbiAgICByZXR1cm4gYEFuYWx5emUgdGhlIGZvbGxvd2luZyB3b3JrYm9vay4gRXZlcnkgc2hlZXQgb2YgdGhlIHdvcmtib29rIGlzIGR1bXBlZCBiZWxvdyBhcyBcIlI8cm93PjogPGNlbGxzPlwiLlxuXG5UQVNLUzpcbjEuIFVuZGVyc3RhbmQgdGhlIHdvcmtib29rIGFzIGEgd2hvbGUgKGNvbXBhbnksIHBlcmlvZCwgY3VycmVuY3ksIHB1cnBvc2UpLlxuMi4gRm9yIEVBQ0ggc2hlZXQ6IGlkZW50aWZ5IGl0cyBjYXRlZ29yeSwgYSBodW1hbi1yZWFkYWJsZSB0aXRsZSwgYSBzaG9ydCBjb21wcmVoZW5zaW9uIHN1bW1hcnksIGRldGVjdGVkIHBlcmlvZCAoZS5nLiBcIkp1bmUgMjAyNlwiKSwgY29sdW1uIGhlYWRlcnMsIHJvdyBjb3VudCwgYW5kIGFueSBwZXItcGVyaW9kIGZpbmFuY2lhbCBtZXRyaWNzIChyZXZlbnVlLCBFQklUREEsIG5ldCBpbmNvbWUsIGd1ZXN0cywgc3RhZmYgY29zdCkgeW91IGNhbiByZWFkIGZyb20gdGhlIHNoZWV0LlxuMy4gQ29uc29saWRhdGUgQUxMIHBlcmlvZC1sZXZlbCBmaW5hbmNpYWwgZGF0YSBhY3Jvc3MgdGhlIHdob2xlIHdvcmtib29rIGludG8gYSBzaW5nbGUgXCJwcm9qZWN0aW9uc1wiIGFycmF5OiBvbmUgZW50cnkgcGVyIChwZXJpb2QgWVlZWS1NTSwgZGF0YVR5cGUgYWN0dWFsfGZvcmVjYXN0LCBzY2VuYXJpbyBhY3R1YWx8Y29uc2VydmF0aXZlfHJlYWxpc3RpY3xhc3BpcmF0aW9uYWwpLiBVc2UgdGhlIGJlc3Qgc291cmNlIGZvciBlYWNoIHBlcmlvZCAoZS5nLiBhIFAmTCBzdGF0ZW1lbnQgZm9yIGFjdHVhbHMsIGEgQkVQIHRhYmxlIG9yIGJ1ZGdldCBzaGVldCBmb3IgZm9yZWNhc3RzKS4gQW5udWFsIHRvdGFscyB1c2UgWVlZWS0xMi4gT25seSBpbmNsdWRlIGVudHJpZXMgd2hlcmUgYXQgbGVhc3Qgb25lIG1ldHJpYyBpcyBwcmVzZW50LlxuNC4gU3VnZ2VzdCB0aGUgbW9zdCBhcHByb3ByaWF0ZSBhcHAgdGVtcGxhdGUgaWQgZnJvbSB0aGlzIGF2YWlsYWJsZSBjYXRhbG9nOiBmaW5hbmNpYWwtYW5hbHl0aWNzLCByZXN0YXVyYW50LCBob3RlbCwgZWR1Y2F0aW9uLCBlY29tbWVyY2UtcmV0YWlsLCBoZWFsdGhjYXJlLCBtYW51ZmFjdHVyaW5nLCBwcm9mZXNzaW9uYWwtc2VydmljZXMsIHJlYWwtZXN0YXRlLCBzdXBwbHktY2hhaW4gKGNvbmZpZGVuY2UgMC4uMSkuXG5cblJVTEVTOlxuLSBwZXJpb2RzOiBZWVlZLU1NIG9ubHkgKGUuZy4gXCIyMDI2LTA2XCIsIFwiMjAyNS0xMlwiIGZvciBhbm51YWwpLlxuLSBkYXRhVHlwZSBcImFjdHVhbFwiIGZvciByZXBvcnRlZC9hY3R1YWwgZmlndXJlcywgXCJmb3JlY2FzdFwiIGZvciBwcm9qZWN0aW9ucy9idWRnZXRzLlxuLSBzY2VuYXJpbzogXCJhY3R1YWxcIiBmb3IgYWN0dWFsczsgXCJjb25zZXJ2YXRpdmVcIiBmb3IgYmFzZSBmb3JlY2FzdHM7IFwicmVhbGlzdGljXCIvXCJhc3BpcmF0aW9uYWxcIiB3aGVuIHRoZSBzaGVldCBleHBsaWNpdGx5IGxhYmVscyBzY2VuYXJpb3MuXG4tIEFtb3VudHMgYXJlIGZ1bGwgSURSIGludGVnZXJzIChubyBcIktcIiBzaG9ydGhhbmQpLiBSb3VuZCB0byBpbnRlZ2Vycy5cbi0gTGVhdmUgYSBtZXRyaWMgbnVsbCB3aGVuIHRoZSBzaGVldCBkb2VzIG5vdCBjb250YWluIGl0IGZvciB0aGF0IHBlcmlvZC5cbi0gY2F0ZWdvcnkgbXVzdCBiZSBvbmUgb2Y6ICR7U0hFRVRfQ0FURUdPUklFUy5qb2luKCcsICcpfS5cblxuJHtoaW50c1NlY3Rpb259V09SS0JPT0sgRFVNUDpcbiR7c2hlZXRCbG9ja3N9YDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcENvZGVGZW5jZShyZXBseSkge1xuICAgIGNvbnN0IG1hdGNoID0gcmVwbHkubWF0Y2goL2BgYCg/Ompzb24pP1xccyooW1xcc1xcU10qPylgYGAvKTtcbiAgICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6IHJlcGx5O1xufVxuLyoqXG4gKiBPTkUgT3BlbkFJIGNhbGwgdG8gY29tcHJlaGVuZCB0aGUgd29ya2Jvb2suIE5vIHJldHJ5IGxvb3AgXHUyMDE0IHRoZSBjYWxsZXJcbiAqIChzeW5jIHBpcGVsaW5lIG9yIHdvcmtmbG93IHN0ZXApIG93bnMgcmV0cnkgcG9saWN5LlxuICpcbiAqIFRocm93czpcbiAqICAgLSBDb21wcmVoZW5kSHR0cEVycm9yIChzdGF0dXMgNDI5IGNhcnJpZXMgcmV0cnlBZnRlclNlY29uZHMpXG4gKiAgIC0gQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvciAoYmFkIEpTT04gLyBab2QgcmVqZWN0aW9uKVxuICogICAtIENvbXByZWhlbmRFcnJvciAobmV0d29yayBldGMuIFx1MjAxNCB3cmFwcGVkIGZyb20gZmV0Y2ggZmFpbHVyZXMpXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXByZWhlbmRPbmNlKGJsb2Nrcywgb3B0aW9ucykge1xuICAgIGNvbnN0IHsgbW9kZWwgPSAnZ3B0LTRvJywgaGludHMsIGFwaUtleSwgYmFzZVVybCA9ICdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxJyB9ID0gb3B0aW9ucztcbiAgICBpZiAoYmxvY2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcignV29ya2Jvb2sgY29udGFpbnMgbm8gcmVhZGFibGUgc2hlZXRzJyk7XG4gICAgfVxuICAgIGNvbnN0IHByb21wdCA9IGJ1aWxkQ29tcHJlaGVuc2lvblByb21wdChibG9ja3MsIGhpbnRzKTtcbiAgICBsZXQgcmVzcG9uc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtiYXNlVXJsfS9jaGF0L2NvbXBsZXRpb25zYCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBTWVNURU1fUFJPTVBUXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHByb21wdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC4yLFxuICAgICAgICAgICAgICAgIG1heF90b2tlbnM6IDE2Mzg0LFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlX2Zvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnanNvbl9vYmplY3QnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kRXJyb3IoYE9wZW5BSSByZXF1ZXN0IGZhaWxlZDogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCwge1xuICAgICAgICAgICAgY2F1c2U6IGVyclxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zdCBlcnJCb2R5ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpLmNhdGNoKCgpPT4nVW5rbm93biBlcnJvcicpO1xuICAgICAgICBsZXQgcmV0cnlBZnRlclNlY29uZHMgPSBudWxsO1xuICAgICAgICBjb25zdCByZXRyeUFmdGVyID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ3JldHJ5LWFmdGVyJyk7XG4gICAgICAgIGlmIChyZXRyeUFmdGVyKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBOdW1iZXIocmV0cnlBZnRlcik7XG4gICAgICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHBhcnNlZCkgJiYgcGFyc2VkID49IDApIHJldHJ5QWZ0ZXJTZWNvbmRzID0gcGFyc2VkO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kSHR0cEVycm9yKHJlc3BvbnNlLnN0YXR1cywgYE9wZW5BSSBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSk6ICR7ZXJyQm9keX1gLCByZXRyeUFmdGVyU2Vjb25kcyk7XG4gICAgfVxuICAgIGxldCByZXN1bHQ7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcihgT3BlbkFJIHJlc3BvbnNlIHdhcyBub3QgdmFsaWQgSlNPTjogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgfVxuICAgIGNvbnN0IHJlcGx5ID0gcmVzdWx0LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudCA/PyAnJztcbiAgICBsZXQgcGFyc2VkO1xuICAgIHRyeSB7XG4gICAgICAgIHBhcnNlZCA9IEpTT04ucGFyc2Uoc3RyaXBDb2RlRmVuY2UocmVwbHkpKTtcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yKCdBSSByZXNwb25zZSB3YXMgbm90IHZhbGlkIEpTT046ICcgKyByZXBseS5zbGljZSgwLCA1MDApKTtcbiAgICB9XG4gICAgbGV0IGNvbXByZWhlbnNpb247XG4gICAgdHJ5IHtcbiAgICAgICAgY29tcHJlaGVuc2lvbiA9IFdvcmtib29rQ29tcHJlaGVuc2lvblNjaGVtYS5wYXJzZShwYXJzZWQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBmaXJzdCA9IGVyciBpbnN0YW5jZW9mIHouWm9kRXJyb3IgPyBlcnIuaXNzdWVzWzBdIDogbnVsbDtcbiAgICAgICAgY29uc3QgZGV0YWlsID0gZmlyc3QgPyBgJHtmaXJzdC5wYXRoLmpvaW4oJy4nKSB8fCAncm9vdCd9OiAke2ZpcnN0Lm1lc3NhZ2V9YCA6IFN0cmluZyhlcnIpO1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcihgQUkgcmVzcG9uc2UgZmFpbGVkIHNjaGVtYSB2YWxpZGF0aW9uOiAke2RldGFpbH1gLCB7XG4gICAgICAgICAgICBjYXVzZTogZXJyXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjb21wcmVoZW5zaW9uLFxuICAgICAgICBtb2RlbCxcbiAgICAgICAgcHJvbXB0TGVuZ3RoOiBwcm9tcHQubGVuZ3RoXG4gICAgfTtcbn1cbiIsICIvKipcbiAqIFByb2dyZXNzIGVtaXNzaW9uIGZvciB0aGUgd29ya2Jvb2staW5nZXN0IHdvcmtmbG93LlxuICpcbiAqIEZvbGxvd3MgdGhlIFNESyBzdHJlYW1pbmcgcGF0dGVybjpcbiAqICAgLSB0aGUgd29ya2Zsb3cgZnVuY3Rpb24gY2FsbHMgYGdldFdyaXRhYmxlKClgIGFuZCBwYXNzZXMgdGhlIHN0cmVhbSB0byBzdGVwcztcbiAqICAgLSBzdGVwcyBvYnRhaW4gYSB3cml0ZXIsIHdyaXRlIEpTT04gY2h1bmtzLCBhbmQgcmVsZWFzZSB0aGUgbG9jay5cbiAqXG4gKiBUaGUgd3JpdGFibGUgc3RyZWFtIGlzIHNlcmlhbGl6ZWQgYnkgcmVmZXJlbmNlIGFjcm9zcyBzdGVwIGJvdW5kYXJpZXNcbiAqIChzdHJlYW1Ub1N0cmVhbVJlZiksIHNvIHdlIGFsd2F5cyBwYXNzIHRoZSByYXcgV3JpdGFibGVTdHJlYW0gXHUyMDE0IG5ldmVyIGFcbiAqIHdyYXBwZXIgb2JqZWN0LlxuICovIC8qKlxuICogRW5jb2RlIGEgcHJvZ3Jlc3MgY2h1bmsgYXMgYSBKU09OIHN0cmluZyAoY2h1bmtzIGFyZSB3cml0dGVuIGFzIHRleHQpLlxuICovIGV4cG9ydCBmdW5jdGlvbiBlbmNvZGVDaHVuayhjaHVuaykge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShjaHVuayk7XG59XG4vKipcbiAqIFdyaXRlIG9uZSBwcm9ncmVzcyBjaHVuay4gQ2FsbCBmcm9tIHdpdGhpbiBhIHN0ZXA6XG4gKlxuICogICBhc3luYyBmdW5jdGlvbiBlbWl0UHJvZ3Jlc3NTdGVwKHdyaXRhYmxlOiBXcml0YWJsZVN0cmVhbSwgY2h1bms6IFByb2dyZXNzQ2h1bmspIHtcbiAqICAgICAndXNlIHN0ZXAnO1xuICogICAgIGF3YWl0IHdyaXRlUHJvZ3Jlc3NDaHVuayh3cml0YWJsZSwgY2h1bmspO1xuICogICB9XG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlUHJvZ3Jlc3NDaHVuayh3cml0YWJsZSwgY2h1bmspIHtcbiAgICBjb25zdCB3cml0ZXIgPSB3cml0YWJsZS5nZXRXcml0ZXIoKTtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCB3cml0ZXIud3JpdGUoY2h1bmspO1xuICAgIH0gZmluYWxseXtcbiAgICAgICAgd3JpdGVyLnJlbGVhc2VMb2NrKCk7XG4gICAgfVxufVxuLyoqIENsb3NlIHRoZSBzdHJlYW0gdG8gc2lnbmFsIGNvbXBsZXRpb24uIENhbGwgZnJvbSB3aXRoaW4gYSBzdGVwLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0cmVhbSh3cml0YWJsZSkge1xuICAgIGF3YWl0IHdyaXRhYmxlLmNsb3NlKCk7XG59XG4iLCAiLyoqXG4gKiBMaWdodHdlaWdodCBQb3N0Z3JlU1FMIGhlbHBlciBmb3Igd29ya2Zsb3cgc3RlcHMgKHBnIGRyaXZlciwgbm8gUHJpc21hKS5cbiAqXG4gKiBFYWNoIHN0ZXAgb3BlbnMgaXRzIG93biBzaG9ydC1saXZlZCBjb25uZWN0aW9uIFx1MjAxNCBmaW5lIGZvciB3b3JrZmxvdyBzdGVwc1xuICogd2hpY2ggYXJlIGFscmVhZHkgaW5kaXZpZHVhbGx5IGludm9pY2VkIFZlcmNlbCBGdW5jdGlvbiBpbnZvY2F0aW9ucy5cbiAqIFRoZSBwb29sL2Nvbm5lY3Rpb24tc3RyaW5nIGNvbWVzIGZyb20gYHByb2Nlc3MuZW52LlBPU1RHUkVTX1VSTGAgKHNldCBieVxuICogdGhlIFZlcmNlbC9OZW9uIGludGVncmF0aW9uIGFuZCBhdmFpbGFibGUgaW4gc3RlcCBydW50aW1lKS5cbiAqLyBpbXBvcnQgeyBDbGllbnQgfSBmcm9tICdwZyc7XG4vKipcbiAqIFJ1biBhIGNhbGxiYWNrIHdpdGggYSBzaG9ydC1saXZlZCBwZyBjb25uZWN0aW9uLlxuICogVGhlIGNvbm5lY3Rpb24gc3RyaW5nIGlzIHJlc29sdmVkIGJ5IHRoZSByb3V0ZSAocm9vdCBlbnYgXHUyMTkyIHRlbmFudCBkYl91cmwgbG9va3VwKVxuICogYW5kIHBhc3NlZCB0aHJvdWdoIHRoZSB3b3JrZmxvdyBpbnB1dCBcdTIwMTQgbmV2ZXIgcmVhZCBmcm9tIHByb2Nlc3MuZW52IGRpcmVjdGx5LlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3aXRoUGdDbGllbnQoY29ubmVjdGlvblN0cmluZywgZm4pIHtcbiAgICBpZiAoIWNvbm5lY3Rpb25TdHJpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkYXRhYmFzZSBjb25uZWN0aW9uIHN0cmluZyBwcm92aWRlZC4nKTtcbiAgICB9XG4gICAgY29uc3QgY2xpZW50ID0gbmV3IENsaWVudCh7XG4gICAgICAgIGNvbm5lY3Rpb25TdHJpbmdcbiAgICB9KTtcbiAgICBhd2FpdCBjbGllbnQuY29ubmVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBmbihjbGllbnQpO1xuICAgIH0gZmluYWxseXtcbiAgICAgICAgYXdhaXQgY2xpZW50LmVuZCgpO1xuICAgIH1cbn1cbi8qKiBSdW4gYSBzaW5nbGUgU1FMIHN0YXRlbWVudCBhbmQgcmV0dXJuIHRoZSByb3cgY291bnQgb3IgcmVzdWx0LiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZU9uZShjbGllbnQsIHNxbCwgcGFyYW1zID0gW10pIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQucXVlcnkoc3FsLCBwYXJhbXMpO1xuICAgIHJldHVybiByZXN1bHQucm93Q291bnQgPz8gMDtcbn1cbi8qKiBSdW4gU1FMIGFuZCByZXR1cm4gYWxsIHJvd3MuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBxdWVyeVJvd3MoY2xpZW50LCBzcWwsIHBhcmFtcyA9IFtdKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnF1ZXJ5KHNxbCwgcGFyYW1zKTtcbiAgICByZXR1cm4gcmVzdWx0LnJvd3M7XG59XG4iLCAiLyoqXG4gKiBJbXBvcnQtdGltZSBFeGNlbCBmb3JtdWxhIGV4dHJhY3Rpb24gKyByZWZlcmVuY2UgbWFwcGluZy5cbiAqXG4gKiBXaGVuIGEgd29ya2Jvb2sgaXMgaW1wb3J0ZWQgdGhlIHJhdyB4bHN4IGlzIGNhY2hlZCBpbiB0aGUgZGF0YWJhc2VcbiAqIChrbm93bGVkZ2Vfc25pcHBldHMud29ya2Jvb2tfZGF0YSkgYW5kIHNlcnZlZCB0byB0aGUgc2hlZXQgdmlld2VyIGFzIEpTT05cbiAqIHJvd3Mga2V5ZWQgYnkgY29sdW1uIGhlYWRlciB3aXRoIGEgZGV0ZWN0ZWQgaGVhZGVyIHJvdy4gVGhpcyBtb2R1bGUgd2Fsa3NcbiAqIGV2ZXJ5IHNoZWV0IG9mIHRoZSBpbXBvcnRlZCB3b3JrYm9vayBhbmQ6XG4gKlxuICogICAxLiBmaW5kcyBBTEwgZm9ybXVsYSBjZWxscyAoXCI9U1VNKFY0NjpWNTQpXCIsIFwiPVBMIUQ3XCIsIC4uLiksXG4gKiAgIDIuIG1hcHMgZWFjaCBmb3JtdWxhIGNlbGwgaXRzZWxmIHRvIHRoZSBEQi1zaGVldCBjb29yZGluYXRlcyB0aGVcbiAqICAgICAgYXBwbGljYXRpb24gZGlzcGxheXMgKGNvbHVtbiBrZXkgKyBkYXRhLXJvdyBvZmZzZXQgKyBhYnNvbHV0ZSBBMSksXG4gKiAgIDMuIG1hcHMgZXZlcnkgcmVmZXJlbmNlIGluc2lkZSB0aGUgZm9ybXVsYSB0byB0aGUgc2FtZSBjb29yZGluYXRlc1xuICogICAgICAoY3Jvc3Mtc2hlZXQgcmVmcyBpbmNsdWRlZCksIHNvIGEgZm9ybXVsYSBjYW4gYmUgY29tcHV0ZWQgYWdhaW5zdCB0aGVcbiAqICAgICAgREItc2F2ZWQgc2hlZXQgZGF0YSBldmVuIHdoZW4gcmF3IGdyaWQgcG9zaXRpb25zIHNoaWZ0IGJldHdlZW5cbiAqICAgICAgaW1wb3J0cyxcbiAqICAgNC4gY29tcHV0ZXMgYSBiZXN0LWVmZm9ydCB2YWx1ZSB3aXRoIHRoZSBzYW1lIGV2YWx1YXRvciB0aGUgQVBJIHVzZXNcbiAqICAgICAgKHNyYy9saWIvZXhjZWwtZm9ybXVsYS50cykgc28gY29uc3VtZXJzIGhhdmUgYW4gaW1wb3J0LXRpbWUgc25hcHNob3QuXG4gKlxuICogVGhlIHJlc3VsdGluZyBXb3JrYm9va0Zvcm11bGFNYXAgaXMgcGVyc2lzdGVkIGFzIGEga25vd2xlZGdlX3NuaXBwZXRzIEpTT05cbiAqIGVudHJ5IChrZXkgXCJ3b3JrYm9va19mb3JtdWxhc1wiKSBieSBib3RoIGltcG9ydCBwYXRocyAoc2VlZC1ydW5uZXIgYW5kIHRoZVxuICogd29ya2Jvb2staW5nZXN0IHdvcmtmbG93KS5cbiAqLyBpbXBvcnQgeyB1dGlscyB9IGZyb20gJ3hsc3gnO1xuaW1wb3J0IHsgZXZhbHVhdGVGb3JtdWxhLCBjb2xsZWN0UmVmZXJlbmNlcyB9IGZyb20gJ0AvbGliL2V4Y2VsLWZvcm11bGEnO1xuaW1wb3J0IHsgZmluZEhlYWRlclJvdywgYnVpbGRDb2x1bW5LZXlzIH0gZnJvbSAnQC9saWIvd29ya2Jvb2stbWFwcGluZyc7XG5mdW5jdGlvbiBpc0NlbGxBZGRyZXNzKGtleSkge1xuICAgIHJldHVybiAvXltBLVpdK1xcZCskLy50ZXN0KGtleSk7XG59XG4vKiogTWFwIG9uZSByYXcgcmVmZXJlbmNlIHRva2VuIHRvIERCIGNvb3JkaW5hdGVzICh0YXJnZXQgc2hlZXQgYXdhcmUpLiAqLyBmdW5jdGlvbiBtYXBSZWYocmVmLCBoZWFkZXJDYWNoZSwgd2IsIGZvcm11bGFTaGVldCkge1xuICAgIGNvbnN0IHRhcmdldCA9IHJlZi5zaGVldCA/PyBmb3JtdWxhU2hlZXQ7XG4gICAgY29uc3QgdGFyZ2V0V3MgPSB3Yi5TaGVldHNbdGFyZ2V0XTtcbiAgICAvLyBTYW1lLXNoZWV0IHJlZmVyZW5jZXMga2VlcCBzaGVldCAnJyAoY29tcGFjdCk7IGV4cGxpY2l0IG90aGVyd2lzZS5cbiAgICBjb25zdCBzaGVldCA9IHJlZi5zaGVldCA/PyAnJztcbiAgICBpZiAoIXRhcmdldFdzKSB7XG4gICAgICAgIC8vIFNoZWV0IHZhbmlzaGVkIFx1MjAxNCBrZWVwIHRoZSByYXcgYWRkcmVzcyBzbyBub3RoaW5nIGlzIGxvc3QuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzaGVldCxcbiAgICAgICAgICAgIGtpbmQ6ICdjZWxsJyxcbiAgICAgICAgICAgIGFic0NlbGw6IHJlZi5hZGRyXG4gICAgICAgIH07XG4gICAgfVxuICAgIGxldCBoZWFkZXIgPSBoZWFkZXJDYWNoZS5nZXQodGFyZ2V0KTtcbiAgICBpZiAoIWhlYWRlcikge1xuICAgICAgICBoZWFkZXIgPSBmaW5kSGVhZGVyUm93KHRhcmdldFdzKTtcbiAgICAgICAgaGVhZGVyQ2FjaGUuc2V0KHRhcmdldCwgaGVhZGVyKTtcbiAgICB9XG4gICAgY29uc3Qgc3RhcnQgPSBtYXBDZWxsVG9EYXRhUmVmKHRhcmdldFdzLCByZWYuYWRkciwgaGVhZGVyKTtcbiAgICBjb25zdCBtYXBwZWQgPSB7XG4gICAgICAgIHNoZWV0LFxuICAgICAgICBraW5kOiByZWYuZW5kID8gJ3JhbmdlJyA6ICdjZWxsJyxcbiAgICAgICAgY29sS2V5OiBzdGFydC5jb2xLZXksXG4gICAgICAgIHJlbFJvdzogc3RhcnQucmVsUm93LFxuICAgICAgICBhYnNDZWxsOiByZWYuYWRkclxuICAgIH07XG4gICAgaWYgKHJlZi5lbmQpIHtcbiAgICAgICAgY29uc3QgZW5kID0gbWFwQ2VsbFRvRGF0YVJlZih0YXJnZXRXcywgcmVmLmVuZCwgaGVhZGVyKTtcbiAgICAgICAgbWFwcGVkLmVuZCA9IHtcbiAgICAgICAgICAgIGNvbEtleTogZW5kLmNvbEtleSxcbiAgICAgICAgICAgIHJlbFJvdzogZW5kLnJlbFJvdyxcbiAgICAgICAgICAgIGFic0NlbGw6IHJlZi5lbmRcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcHBlZDtcbn1cbi8qKiBDb2x1bW4tb25seSAoQTpBKSBvciBmdWxsLWNlbGwgbWFwcGluZyB0byBEQiBjb29yZGluYXRlcy4gKi8gZnVuY3Rpb24gbWFwQ2VsbFRvRGF0YVJlZih3cywgYWRkciwgaGVhZGVyKSB7XG4gICAgY29uc3QgY2xlYW4gPSBhZGRyLnJlcGxhY2UoL1xcJC9nLCAnJyk7XG4gICAgaWYgKC9eW0EtWmEtel0rJC8udGVzdChjbGVhbikpIHtcbiAgICAgICAgLy8gV2hvbGUtY29sdW1uIHJlZmVyZW5jZTogY29sdW1uIG1hcHMgdG8gaXRzIGhlYWRlciBrZXksIHJvd3MgYXJlIHVuYm91bmRlZC5cbiAgICAgICAgY29uc3QgY29sSWR4ID0gdXRpbHMuZGVjb2RlX2NvbChjbGVhbik7XG4gICAgICAgIGNvbnN0IGNvbHVtbktleXMgPSBidWlsZENvbHVtbktleXMoaGVhZGVyLmhlYWRlcnMpO1xuICAgICAgICBjb25zdCByYXdIZWFkZXIgPSBoZWFkZXIuaGVhZGVyc1tjb2xJZHhdID8/ICcnO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29sS2V5OiByYXdIZWFkZXIudHJpbSgpID8gY29sdW1uS2V5c1tjb2xJZHhdIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgcmVsUm93OiB1bmRlZmluZWRcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZGVjb2RlZCA9IHV0aWxzLmRlY29kZV9jZWxsKGNsZWFuKTtcbiAgICBjb25zdCByZWxSb3cgPSBkZWNvZGVkLnIgLSBoZWFkZXIuaGVhZGVyUm93ICsgMTtcbiAgICBjb25zdCBjb2x1bW5LZXlzID0gYnVpbGRDb2x1bW5LZXlzKGhlYWRlci5oZWFkZXJzKTtcbiAgICBjb25zdCByYXdIZWFkZXIgPSBoZWFkZXIuaGVhZGVyc1tkZWNvZGVkLmNdID8/ICcnO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbEtleTogcmF3SGVhZGVyLnRyaW0oKSA/IGNvbHVtbktleXNbZGVjb2RlZC5jXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgcmVsUm93OiByZWxSb3cgPj0gMSA/IHJlbFJvdyA6IHVuZGVmaW5lZFxuICAgIH07XG59XG4vKipcbiAqIFdhbGsgZXZlcnkgc2hlZXQgYW5kIGJ1aWxkIHRoZSBmdWxsIGZvcm11bGEgaW52ZW50b3J5ICsgcmVmZXJlbmNlIG1hcHBpbmcuXG4gKlxuICogRXhwZWN0cyBgd2JgIHBhcnNlZCB3aXRoIGBjZWxsRm9ybXVsYTogdHJ1ZWAgKFNoZWV0SlMgb25seSBwb3B1bGF0ZXNcbiAqIGBjZWxsLmZgIHdoZW4gZm9ybXVsYSBzdHJpbmdzIGFyZSByZWFkKS5cbiAqLyBleHBvcnQgZnVuY3Rpb24gYnVpbGRXb3JrYm9va0Zvcm11bGFNYXAod2IpIHtcbiAgICBjb25zdCBtYXAgPSB7fTtcbiAgICBjb25zdCBoZWFkZXJDYWNoZSA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IHRhYk5hbWUgb2Ygd2IuU2hlZXROYW1lcyl7XG4gICAgICAgIGNvbnN0IHdzID0gd2IuU2hlZXRzW3RhYk5hbWVdO1xuICAgICAgICBjb25zdCBoZWFkZXIgPSBmaW5kSGVhZGVyUm93KHdzKTtcbiAgICAgICAgY29uc3QgY29sdW1uS2V5cyA9IGJ1aWxkQ29sdW1uS2V5cyhoZWFkZXIuaGVhZGVycyk7XG4gICAgICAgIGNvbnN0IGhlYWRlckNhY2hlS2V5ID0gdGFiTmFtZTtcbiAgICAgICAgaGVhZGVyQ2FjaGUuc2V0KGhlYWRlckNhY2hlS2V5LCBoZWFkZXIpO1xuICAgICAgICBjb25zdCBmb3JtdWxhcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh3cykpe1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJyFyZWYnIHx8IGtleSA9PT0gJyFtYXJnaW5zJyB8fCBrZXkgPT09ICchbWVyZ2VzJyB8fCBrZXkgPT09ICchY29scycgfHwga2V5ID09PSAnIXJvd3MnKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmICghaXNDZWxsQWRkcmVzcyhrZXkpKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGNlbGwgPSB3c1trZXldO1xuICAgICAgICAgICAgaWYgKCFjZWxsIHx8IHR5cGVvZiBjZWxsLmYgIT09ICdzdHJpbmcnIHx8IGNlbGwuZi50cmltKCkgPT09ICcnKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGZvcm11bGEgPSBjZWxsLmYudHJpbSgpLnN0YXJ0c1dpdGgoJz0nKSA/IGNlbGwuZi50cmltKCkgOiAnPScgKyBjZWxsLmYudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgZGVjb2RlZCA9IHV0aWxzLmRlY29kZV9jZWxsKGtleSk7XG4gICAgICAgICAgICBjb25zdCByZWxSb3cgPSBkZWNvZGVkLnIgLSBoZWFkZXIuaGVhZGVyUm93ICsgMTtcbiAgICAgICAgICAgIGNvbnN0IHJhd0hlYWRlciA9IGhlYWRlci5oZWFkZXJzW2RlY29kZWQuY10gPz8gJyc7XG4gICAgICAgICAgICBjb25zdCByZWZzID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJhd1JlZiBvZiBjb2xsZWN0UmVmZXJlbmNlcyhmb3JtdWxhKSl7XG4gICAgICAgICAgICAgICAgcmVmcy5wdXNoKG1hcFJlZihyYXdSZWYsIGhlYWRlckNhY2hlLCB3YiwgdGFiTmFtZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZXZhbHVhdGVGb3JtdWxhKHdiLCB3cywgZm9ybXVsYSwgMCwga2V5KTtcbiAgICAgICAgICAgIGZvcm11bGFzLnB1c2goe1xuICAgICAgICAgICAgICAgIGNlbGw6IGtleSxcbiAgICAgICAgICAgICAgICBmb3JtdWxhLFxuICAgICAgICAgICAgICAgIGNvbEtleTogcmF3SGVhZGVyLnRyaW0oKSA/IGNvbHVtbktleXNbZGVjb2RlZC5jXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICByZWxSb3c6IHJlbFJvdyA+PSAxID8gcmVsUm93IDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGFic1JvdzogZGVjb2RlZC5yICsgMSxcbiAgICAgICAgICAgICAgICBhYnNDb2w6IGRlY29kZWQuYyArIDEsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC51bmV2YWx1YWJsZSA/IHVuZGVmaW5lZCA6IHJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICB1bmV2YWx1YWJsZTogcmVzdWx0LnVuZXZhbHVhYmxlLFxuICAgICAgICAgICAgICAgIHJlZnNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIG1hcFt0YWJOYW1lXSA9IHtcbiAgICAgICAgICAgIGhlYWRlclJvdzogaGVhZGVyLmhlYWRlclJvdyxcbiAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlci5oZWFkZXJzLFxuICAgICAgICAgICAgY29sdW1uS2V5cyxcbiAgICAgICAgICAgIGZvcm11bGFzXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG4iLCAiLyoqXG4gKiBFeGNlbCBmb3JtdWxhIHN1cHBvcnQgZm9yIHRoZSBTaGVldCBWaWV3ZXIuXG4gKlxuICogVGhlIHdvcmtib29rIHN0b3JlcyBmb3JtdWxhcyAoZS5nLiBcIj1TVU0oRTEwOkUxMSlcIiwgXCI9SUYoRDY9MCxcXFwiXFxcIiwoRjYtRDYpL0Q2KVwiLFxuICogXCI9UEwhRDdcIikgd2l0aCBFeGNlbCdzIGNhY2hlZCBjYWxjdWxhdGVkIHZhbHVlcy4gVGhpcyBtb2R1bGU6XG4gKiAgLSBldmFsdWF0ZXMgYSBmb3JtdWxhIGFnYWluc3QgdGhlIHdvcmtib29rIChiZXN0LWVmZm9ydCkgc28gdGhlIERhdGFHcmlkIGNhblxuICogICAgc2hvdyB0aGUgY2FsY3VsYXRlZCByZXN1bHQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHVzZXIgYW1lbmRzIHRoZSBmb3JtdWxhLFxuICogIC0gbWFya3MgZm9ybXVsYXMgd2UgY2Fubm90IGV2YWx1YXRlIChleG90aWMgZnVuY3Rpb25zLCBldGMuKSBhc1xuICogICAgdW5ldmFsdWFibGUgXHUyMDE0IHRoZSBmb3JtdWxhIGlzIHN0aWxsIHN0b3JlZCBpbiB0aGUgd29ya2Jvb2sgYW5kIEV4Y2VsXG4gKiAgICByZWNhbGN1bGF0ZXMgaXQgb24gb3Blbi5cbiAqXG4gKiBTdXBwb3J0ZWQ6IGFyaXRobWV0aWMgKCsgLSAqIC8gXiAlKSwgcGFyZW5zLCBjZWxsIHJlZnMgKEExLCAkQSQxKSxcbiAqIGNyb3NzLXNoZWV0IHJlZnMgKFNoZWV0IUExLCAnU2hlZXQgTmFtZSchQTEpLCByYW5nZXMgKEExOkI1KSBhbmQgdGhlXG4gKiBmdW5jdGlvbnMgU1VNLCBBVkVSQUdFLCBNSU4sIE1BWCwgQ09VTlQsIENPVU5UQSwgUFJPRFVDVCwgQUJTLCBJTlQsIFNRUlQsXG4gKiBST1VORCwgUk9VTkRVUCwgUk9VTkRET1dOLCBNT0QsIFBPV0VSLCBJRiwgU1VCVE9UQUwgKGNvZGUgOS8xMDkgb25seSksXG4gKiBBTkQsIE9SLCBUUklNLCBQUk9QRVIsIENIT09TRSwgREFURSwgV0VFS0RBWSwgQ09MVU1OLCBTVU1JRiwgVkxPT0tVUCxcbiAqIE1BVENILCBJTkRFWCwgVEVYVCwgSUZFUlJPUi5cbiAqLyBpbXBvcnQgeyB1dGlscyB9IGZyb20gJ3hsc3gnO1xuY29uc3QgTUFYX0RFUFRIID0gMTI7XG5jb25zdCBNQVhfUkFOR0VfQ0VMTFMgPSAxMDBfMDAwO1xuZnVuY3Rpb24gaXNSYW5nZSh2KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2ICE9PSBudWxsICYmICdfX3JhbmdlJyBpbiB2O1xufVxuZnVuY3Rpb24gdG9rZW5pemUoc3JjKSB7XG4gICAgY29uc3QgdG9rZW5zID0gW107XG4gICAgbGV0IGkgPSAwO1xuICAgIGxldCBwcmV2VG9rZW47XG4gICAgd2hpbGUoaSA8IHNyYy5sZW5ndGgpe1xuICAgICAgICBjb25zdCBjaCA9IHNyY1tpXTtcbiAgICAgICAgaWYgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnIHx8IGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC9bXFxkLl0vLnRlc3QoY2gpKSB7XG4gICAgICAgICAgICBsZXQgaiA9IGk7XG4gICAgICAgICAgICB3aGlsZShqIDwgc3JjLmxlbmd0aCAmJiAvW1xcZC5dLy50ZXN0KHNyY1tqXSkpaisrO1xuICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdudW0nLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzcmMuc2xpY2UoaSwgailcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaSA9IGo7XG4gICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnXCInKSB7XG4gICAgICAgICAgICBsZXQgaiA9IGkgKyAxO1xuICAgICAgICAgICAgd2hpbGUoaiA8IHNyYy5sZW5ndGggJiYgc3JjW2pdICE9PSAnXCInKWorKztcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3RyJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogc3JjLnNsaWNlKGkgKyAxLCBqKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpID0gaiArIDE7XG4gICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSBcIidcIikge1xuICAgICAgICAgICAgbGV0IGogPSBpICsgMTtcbiAgICAgICAgICAgIHdoaWxlKGogPCBzcmMubGVuZ3RoICYmIHNyY1tqXSAhPT0gXCInXCIpaisrO1xuICAgICAgICAgICAgY29uc3Qgc2hlZXROYW1lID0gc3JjLnNsaWNlKGkgKyAxLCBqKTtcbiAgICAgICAgICAgIGkgPSBqICsgMTtcbiAgICAgICAgICAgIGlmIChzcmNbaV0gPT09ICchJykge1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3NoZWV0JyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHNoZWV0TmFtZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgcXVvdGVkIHRva2VuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC9bQS1aYS16XyRdLy50ZXN0KGNoKSkge1xuICAgICAgICAgICAgbGV0IGogPSBpO1xuICAgICAgICAgICAgd2hpbGUoaiA8IHNyYy5sZW5ndGggJiYgL1tBLVphLXowLTlfJC5dLy50ZXN0KHNyY1tqXSkpaisrO1xuICAgICAgICAgICAgY29uc3Qgd29yZCA9IHNyYy5zbGljZShpLCBqKTtcbiAgICAgICAgICAgIGlmIChzcmNbal0gPT09ICchJykge1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3NoZWV0JyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHdvcmRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpID0gaiArIDE7XG4gICAgICAgICAgICAgICAgcHJldlRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgvXlxcJD9bQS1aYS16XXsxLDN9XFwkP1xcZCskLy50ZXN0KHdvcmQpKSB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3JlZicsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHdvcmRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxzZSBpZiAoL15cXCQ/W0EtWmEtel17MSwzfSQvLnRlc3Qod29yZCkgJiYgKHNyY1tqXSA9PT0gJzonIHx8IHByZXZUb2tlbj8udHlwZSA9PT0gJ29wJyAmJiBwcmV2VG9rZW4udmFsdWUgPT09ICc6JykpIHtcbiAgICAgICAgICAgICAgICAvLyBXaG9sZS1jb2x1bW4gcmVmIChBOkEsICRDOiRBRykgXHUyMDE0IG9ubHkgbWVhbmluZ2Z1bCBpbnNpZGUgYSByYW5nZVxuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3JlZicsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB3b3JkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdvcmQgPT09ICdUUlVFJykgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ1RSVUUnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHdvcmQgPT09ICdGQUxTRScpIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdGQUxTRSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxzZSB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2lkZW50JyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogd29yZC50b1VwcGVyQ2FzZSgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGkgPSBqO1xuICAgICAgICAgICAgcHJldlRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR3byA9IHNyYy5zbGljZShpLCBpICsgMik7XG4gICAgICAgIGlmICh0d28gPT09ICc8PScgfHwgdHdvID09PSAnPj0nIHx8IHR3byA9PT0gJzw+Jykge1xuICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdvcCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHR3b1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCcrLSovXj08PigpLCU6Jy5pbmNsdWRlcyhjaCkpIHtcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnb3AnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBjaFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmV4cGVjdGVkIGNoYXI6ICcgKyBjaCk7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbnM7XG59XG5mdW5jdGlvbiB0b051bSh2KSB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsKSByZXR1cm4gMDsgLy8gRXhjZWw6IGVtcHR5IGNlbGwgaW4gbnVtZXJpYyBjb250ZXh0ID0gMFxuICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpIHJldHVybiB2O1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gdiA/IDEgOiAwO1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3QgbiA9IE51bWJlcih2LnRyaW0oKSk7XG4gICAgICAgIGlmIChpc0Zpbml0ZShuKSkgcmV0dXJuIG47XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignbm90IG51bWVyaWMnKTtcbn1cbmZ1bmN0aW9uIHRydXRoeSh2KSB7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHJldHVybiB2O1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpIHJldHVybiB2ICE9PSAwO1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHJldHVybiB2LnRyaW0oKSAhPT0gJyc7XG4gICAgaWYgKGlzUmFuZ2UodikpIHJldHVybiB2LnZhbHVlcy5zb21lKCh4KT0+dHJ1dGh5KHgpKTtcbiAgICByZXR1cm4gZmFsc2U7XG59XG5jbGFzcyBQYXJzZXIge1xuICAgIHdiO1xuICAgIHdzO1xuICAgIGRlcHRoO1xuICAgIGN1cnJlbnRDZWxsQWRkcjtcbiAgICB0b2tlbnM7XG4gICAgcG9zID0gMDtcbiAgICBjb25zdHJ1Y3Rvcih3Yiwgd3MsIHNyYywgZGVwdGggPSAwLCBjdXJyZW50Q2VsbEFkZHIpe1xuICAgICAgICB0aGlzLndiID0gd2I7XG4gICAgICAgIHRoaXMud3MgPSB3cztcbiAgICAgICAgdGhpcy5kZXB0aCA9IGRlcHRoO1xuICAgICAgICB0aGlzLmN1cnJlbnRDZWxsQWRkciA9IGN1cnJlbnRDZWxsQWRkcjtcbiAgICAgICAgdGhpcy50b2tlbnMgPSB0b2tlbml6ZShzcmMpO1xuICAgIH1cbiAgICBwYXJzZUV4cHIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlQ29tcGFyaXNvbigpO1xuICAgIH1cbiAgICAvKiogVHJ1ZSB3aGVuIHRoZSBmdWxsIHRva2VuIHN0cmVhbSBoYXMgYmVlbiBjb25zdW1lZC4gKi8gZmluaXNoZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvcyA+PSB0aGlzLnRva2Vucy5sZW5ndGg7XG4gICAgfVxuICAgIHBlZWsoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnBvc107XG4gICAgfVxuICAgIG5leHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnBvcysrXTtcbiAgICB9XG4gICAgZXhwZWN0T3Aob3ApIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMubmV4dCgpO1xuICAgICAgICBpZiAoIXQgfHwgdC50eXBlICE9PSAnb3AnIHx8IHQudmFsdWUgIT09IG9wKSB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkICcgKyBvcCk7XG4gICAgfVxuICAgIHBhcnNlQ29tcGFyaXNvbigpIHtcbiAgICAgICAgbGV0IGxlZnQgPSB0aGlzLnBhcnNlQWRkaXRpdmUoKTtcbiAgICAgICAgd2hpbGUodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiBbXG4gICAgICAgICAgICAnPScsXG4gICAgICAgICAgICAnPD4nLFxuICAgICAgICAgICAgJzwnLFxuICAgICAgICAgICAgJz4nLFxuICAgICAgICAgICAgJzw9JyxcbiAgICAgICAgICAgICc+PSdcbiAgICAgICAgXS5pbmNsdWRlcyh0aGlzLnBlZWsoKS52YWx1ZSkpe1xuICAgICAgICAgICAgY29uc3Qgb3AgPSB0aGlzLm5leHQoKS52YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZUFkZGl0aXZlKCk7XG4gICAgICAgICAgICBsZWZ0ID0gY29tcGFyZShvcCwgbGVmdCwgcmlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZWZ0O1xuICAgIH1cbiAgICBwYXJzZUFkZGl0aXZlKCkge1xuICAgICAgICBsZXQgbGVmdCA9IHRoaXMucGFyc2VNdWx0aXBsaWNhdGl2ZSgpO1xuICAgICAgICB3aGlsZSh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmICh0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJysnIHx8IHRoaXMucGVlaygpLnZhbHVlID09PSAnLScpKXtcbiAgICAgICAgICAgIGNvbnN0IG9wID0gdGhpcy5uZXh0KCkudmFsdWU7XG4gICAgICAgICAgICBjb25zdCByaWdodCA9IHRoaXMucGFyc2VNdWx0aXBsaWNhdGl2ZSgpO1xuICAgICAgICAgICAgbGVmdCA9IGFyaXRoKG9wLCBsZWZ0LCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxlZnQ7XG4gICAgfVxuICAgIHBhcnNlTXVsdGlwbGljYXRpdmUoKSB7XG4gICAgICAgIGxldCBsZWZ0ID0gdGhpcy5wYXJzZVVuYXJ5KCk7XG4gICAgICAgIHdoaWxlKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgKHRoaXMucGVlaygpLnZhbHVlID09PSAnKicgfHwgdGhpcy5wZWVrKCkudmFsdWUgPT09ICcvJykpe1xuICAgICAgICAgICAgY29uc3Qgb3AgPSB0aGlzLm5leHQoKS52YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZVVuYXJ5KCk7XG4gICAgICAgICAgICBsZWZ0ID0gYXJpdGgob3AsIGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVmdDtcbiAgICB9XG4gICAgcGFyc2VVbmFyeSgpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMucGVlaygpO1xuICAgICAgICBpZiAodCAmJiB0LnR5cGUgPT09ICdvcCcgJiYgKHQudmFsdWUgPT09ICctJyB8fCB0LnZhbHVlID09PSAnKycpKSB7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLnBhcnNlVW5hcnkoKTtcbiAgICAgICAgICAgIHJldHVybiB0LnZhbHVlID09PSAnLScgPyAtdG9OdW0odikgOiB0b051bSh2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVBvc3RmaXgoKTtcbiAgICB9XG4gICAgcGFyc2VQb3N0Zml4KCkge1xuICAgICAgICBsZXQgdiA9IHRoaXMucGFyc2VBdG9tKCk7XG4gICAgICAgIHdoaWxlKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgdGhpcy5wZWVrKCkudmFsdWUgPT09ICclJyl7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIHYgPSB0b051bSh2KSAvIDEwMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgcGFyc2VBdG9tKCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmICghdCkgdGhyb3cgbmV3IEVycm9yKCd1bmV4cGVjdGVkIGVuZCBvZiBmb3JtdWxhJyk7XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdudW0nKSByZXR1cm4gTnVtYmVyKHQudmFsdWUpO1xuICAgICAgICBpZiAodC50eXBlID09PSAnc3RyJykgcmV0dXJuIHQudmFsdWU7XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdib29sJykgcmV0dXJuIHQudmFsdWUgPT09ICdUUlVFJztcbiAgICAgICAgaWYgKHQudHlwZSA9PT0gJ3NoZWV0Jykge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICBpZiAoIXJlZiB8fCByZWYudHlwZSAhPT0gJ3JlZicpIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgY2VsbCByZWYgYWZ0ZXIgc2hlZXQnKTtcbiAgICAgICAgICAgIGNvbnN0IHNoZWV0V3MgPSB0aGlzLmdldFNoZWV0KHQudmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VSYW5nZU9yVmFsdWUoc2hlZXRXcywgcmVmLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodC50eXBlID09PSAncmVmJykgcmV0dXJuIHRoaXMucGFyc2VSYW5nZU9yVmFsdWUodGhpcy53cywgdC52YWx1ZSk7XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdpZGVudCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIHRoaXMucGVlaygpLnZhbHVlID09PSAnKCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jYWxsRnVuY3Rpb24odC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gaWRlbnRpZmllcjogJyArIHQudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdvcCcgJiYgdC52YWx1ZSA9PT0gJygnKSB7XG4gICAgICAgICAgICBjb25zdCB2ID0gdGhpcy5wYXJzZUV4cHIoKTtcbiAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJyknKTtcbiAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5leHBlY3RlZCB0b2tlbjogJyArIHQudmFsdWUpO1xuICAgIH1cbiAgICBwYXJzZVJhbmdlT3JWYWx1ZSh3cywgYWRkcikge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIGlmICh0ICYmIHQudHlwZSA9PT0gJ29wJyAmJiB0LnZhbHVlID09PSAnOicpIHtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgY29uc3QgZW5kID0gdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICBpZiAoIWVuZCB8fCBlbmQudHlwZSAhPT0gJ3JlZicpIHRocm93IG5ldyBFcnJvcignYmFkIHJhbmdlIGVuZCcpO1xuICAgICAgICAgICAgY29uc3QgY2VsbHMgPSB0aGlzLnJhbmdlQ2VsbHMod3MsIGFkZHIsIGVuZC52YWx1ZSk7XG4gICAgICAgICAgICBjb25zdCBjMSA9IHV0aWxzLmRlY29kZV9jZWxsKGFkZHIucmVwbGFjZSgvXFwkL2csICcnKSk7XG4gICAgICAgICAgICBjb25zdCBjMiA9IHV0aWxzLmRlY29kZV9jZWxsKGVuZC52YWx1ZS5yZXBsYWNlKC9cXCQvZywgJycpKTtcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gTWF0aC5hYnMoYzIuYyAtIGMxLmMpICsgMTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgX19yYW5nZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNlbGxzLm1hcCgoYyk9PnRoaXMucmVzb2x2ZUNlbGwoYy53cywgYy5hZGRyLCB0aGlzLmRlcHRoKSksXG4gICAgICAgICAgICAgICAgd2lkdGhcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucmVzb2x2ZUNlbGwod3MsIGFkZHIsIHRoaXMuZGVwdGgpO1xuICAgIH1cbiAgICBnZXRTaGVldChuYW1lKSB7XG4gICAgICAgIGNvbnN0IHNoZWV0ID0gdGhpcy53Yi5TaGVldHNbbmFtZV0gPz8gdGhpcy53Yi5TaGVldHNbdGhpcy53Yi5TaGVldE5hbWVzLmZpbmQoKG4pPT5uLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUudG9Mb3dlckNhc2UoKSkgPz8gJyddO1xuICAgICAgICBpZiAoIXNoZWV0KSB0aHJvdyBuZXcgRXJyb3IoJ3NoZWV0IG5vdCBmb3VuZDogJyArIG5hbWUpO1xuICAgICAgICByZXR1cm4gc2hlZXQ7XG4gICAgfVxuICAgIHJhbmdlQ2VsbHMod3MsIGEsIGIpIHtcbiAgICAgICAgY29uc3QgY2xlYW5BID0gYS5yZXBsYWNlKC9cXCQvZywgJycpO1xuICAgICAgICBjb25zdCBjbGVhbkIgPSBiLnJlcGxhY2UoL1xcJC9nLCAnJyk7XG4gICAgICAgIGNvbnN0IGNvbE9ubHkgPSAocyk9Pi9eW0EtWmEtel0rJC8udGVzdChzKTtcbiAgICAgICAgbGV0IHIxLCByMiwgY01pbiwgY01heDtcbiAgICAgICAgaWYgKGNvbE9ubHkoY2xlYW5BKSB8fCBjb2xPbmx5KGNsZWFuQikpIHtcbiAgICAgICAgICAgIC8vIFdob2xlLWNvbHVtbiByYW5nZSAoQTpBLCAkQzokQUcpOiBib3VuZCByb3dzIGJ5IHRoZSBzaGVldCdzIHVzZWQgcmFuZ2VcbiAgICAgICAgICAgIGNvbnN0IG1heFJvdyA9IHdzWychcmVmJ10gPyB1dGlscy5kZWNvZGVfcmFuZ2Uod3NbJyFyZWYnXSkuZS5yIDogMDtcbiAgICAgICAgICAgIGNvbnN0IGNvbEluZGV4ID0gKHMpPT57XG4gICAgICAgICAgICAgICAgbGV0IGMgPSAwO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2ggb2Ygcy50b1VwcGVyQ2FzZSgpKWMgPSBjICogMjYgKyAoY2guY2hhckNvZGVBdCgwKSAtIDY0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYyAtIDE7IC8vIDAtYmFzZWRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBjQSA9IGNvbE9ubHkoY2xlYW5BKSA/IGNvbEluZGV4KGNsZWFuQSkgOiB1dGlscy5kZWNvZGVfY2VsbChjbGVhbkEpLmM7XG4gICAgICAgICAgICBjb25zdCBjQiA9IGNvbE9ubHkoY2xlYW5CKSA/IGNvbEluZGV4KGNsZWFuQikgOiB1dGlscy5kZWNvZGVfY2VsbChjbGVhbkIpLmM7XG4gICAgICAgICAgICBjTWluID0gTWF0aC5taW4oY0EsIGNCKTtcbiAgICAgICAgICAgIGNNYXggPSBNYXRoLm1heChjQSwgY0IpO1xuICAgICAgICAgICAgcjEgPSAwO1xuICAgICAgICAgICAgcjIgPSBtYXhSb3c7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjMSA9IHV0aWxzLmRlY29kZV9jZWxsKGNsZWFuQSk7XG4gICAgICAgICAgICBjb25zdCBjMiA9IHV0aWxzLmRlY29kZV9jZWxsKGNsZWFuQik7XG4gICAgICAgICAgICByMSA9IE1hdGgubWluKGMxLnIsIGMyLnIpO1xuICAgICAgICAgICAgcjIgPSBNYXRoLm1heChjMS5yLCBjMi5yKTtcbiAgICAgICAgICAgIGNNaW4gPSBNYXRoLm1pbihjMS5jLCBjMi5jKTtcbiAgICAgICAgICAgIGNNYXggPSBNYXRoLm1heChjMS5jLCBjMi5jKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb3VudCA9IChyMiAtIHIxICsgMSkgKiAoY01heCAtIGNNaW4gKyAxKTtcbiAgICAgICAgaWYgKGNvdW50ID4gTUFYX1JBTkdFX0NFTExTKSB0aHJvdyBuZXcgRXJyb3IoJ3JhbmdlIHRvbyBsYXJnZScpO1xuICAgICAgICBjb25zdCBvdXQgPSBbXTtcbiAgICAgICAgZm9yKGxldCByID0gcjE7IHIgPD0gcjI7IHIrKyl7XG4gICAgICAgICAgICBmb3IobGV0IGMgPSBjTWluOyBjIDw9IGNNYXg7IGMrKyl7XG4gICAgICAgICAgICAgICAgb3V0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB3cyxcbiAgICAgICAgICAgICAgICAgICAgYWRkcjogdXRpbHMuZW5jb2RlX2NlbGwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgICByZXNvbHZlQ2VsbCh3cywgYWRkciwgZGVwdGgpIHtcbiAgICAgICAgaWYgKGRlcHRoID4gTUFYX0RFUFRIKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAvLyBBYnNvbHV0ZSByZWZzICgkQSQ3IC8gJEE3KSBtdXN0IGJlIHN0cmlwcGVkIGJlZm9yZSBrZXlpbmcgaW50byB0aGUgc2hlZXRcbiAgICAgICAgY29uc3QgY2xlYW4gPSBhZGRyLnJlcGxhY2UoL1xcJC9nLCAnJyk7XG4gICAgICAgIGNvbnN0IGNlbGwgPSB3c1tjbGVhbl07XG4gICAgICAgIC8vIEV4Y2VsIGNvZXJjZXMgcmVmZXJlbmNlcyB0byBlbXB0eS9taXNzaW5nIGNlbGxzIHRvIDAgaW4gbnVtZXJpYyBjb250ZXh0c1xuICAgICAgICAvLyAoaGFuZGxlZCBpbiB0b051bSkgYW5kIHRvIFwiXCIgaW4gdGV4dCBjb250ZXh0cyAoaGFuZGxlZCBpbiB0ZXh0IGhlbHBlcnMpLlxuICAgICAgICBpZiAoIWNlbGwpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChjZWxsLnYgIT09IHVuZGVmaW5lZCAmJiBjZWxsLnYgIT09IG51bGwpIHJldHVybiBjZWxsLnY7XG4gICAgICAgIGlmICh0eXBlb2YgY2VsbC5mID09PSAnc3RyaW5nJyAmJiBjZWxsLmYudHJpbSgpICE9PSAnJykge1xuICAgICAgICAgICAgLy8gT09YTUwgc3RvcmVzIGZvcm11bGFzIFdJVEhPVVQgdGhlIGxlYWRpbmcgJz0nOyBub3JtYWxpemUgYmVmb3JlIGV2YWx1YXRpbmdcbiAgICAgICAgICAgIGNvbnN0IGYgPSBjZWxsLmYudHJpbSgpLnN0YXJ0c1dpdGgoJz0nKSA/IGNlbGwuZi50cmltKCkgOiAnPScgKyBjZWxsLmYudHJpbSgpO1xuICAgICAgICAgICAgY29uc3Qgc3ViID0gZXZhbHVhdGVGb3JtdWxhKHRoaXMud2IsIHdzLCBmLCBkZXB0aCArIDEsIGNsZWFuKTtcbiAgICAgICAgICAgIC8vIEEgcmVmZXJlbmNlZCBjZWxsIHdob3NlIGZvcm11bGEgZmFpbHMgaXMgYSByZWFsIGVycm9yIGluIEV4Y2VsIHRvbyBcdTIwMTRcbiAgICAgICAgICAgIC8vIHByb3BhZ2F0ZSBpdCAoc28gSUZFUlJPUiBjYW4gY2F0Y2gsIGFuZCB0b3AtbGV2ZWwgc3RheXMgdW5ldmFsdWFibGUpXG4gICAgICAgICAgICAvLyBpbnN0ZWFkIG9mIHNpbGVudGx5IHRyZWF0aW5nIGl0IGFzIGFuIGVtcHR5IGNlbGwuXG4gICAgICAgICAgICBpZiAoc3ViLnVuZXZhbHVhYmxlKSB0aHJvdyBuZXcgRXJyb3IoJ3JlZmVyZW5jZWQgY2VsbCBmb3JtdWxhIHVuZXZhbHVhYmxlOiAnICsgY2xlYW4pO1xuICAgICAgICAgICAgcmV0dXJuIHN1Yi52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvKipcbiAgICogU2tpcCB0b2tlbnMgb2YgYW4gZXhwcmVzc2lvbiB3aXRob3V0IGV2YWx1YXRpbmcgKHVzZWQgZm9yIGxhenkgSUYnc1xuICAgKiB1bnRha2VuIGJyYW5jaCkuIFN0b3BzIGJlZm9yZSB0aGUgbmV4dCB0b3AtbGV2ZWwgJywnIG9yICcpJy5cbiAgICovIHNraXBFeHByKCkge1xuICAgICAgICBsZXQgZGVwdGggPSAwO1xuICAgICAgICB3aGlsZSh0aGlzLnBvcyA8IHRoaXMudG9rZW5zLmxlbmd0aCl7XG4gICAgICAgICAgICBjb25zdCB0ID0gdGhpcy50b2tlbnNbdGhpcy5wb3NdO1xuICAgICAgICAgICAgaWYgKHQudHlwZSA9PT0gJ29wJykge1xuICAgICAgICAgICAgICAgIGlmICh0LnZhbHVlID09PSAnKCcpIGRlcHRoKys7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodC52YWx1ZSA9PT0gJyknKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXB0aCA9PT0gMCkgcmV0dXJuOyAvLyBzdG9wcGVkIGJlZm9yZSAnKSdcbiAgICAgICAgICAgICAgICAgICAgZGVwdGgtLTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHQudmFsdWUgPT09ICcsJyAmJiBkZXB0aCA9PT0gMCkgcmV0dXJuOyAvLyBzdG9wcGVkIGJlZm9yZSAnLCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucG9zKys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2FsbEZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgLy8gSUYgaXMgbGF6eSBpbiBFeGNlbDogb25seSB0aGUgdGFrZW4gYnJhbmNoIGlzIGV2YWx1YXRlZCAoYXZvaWRzXG4gICAgICAgIC8vIGRpdmlkZS1ieS16ZXJvIGV0Yy4gb24gdGhlIHVudGFrZW4gYnJhbmNoKS5cbiAgICAgICAgaWYgKG5hbWUgPT09ICdJRicpIHtcbiAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJygnKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbmQgPSB0aGlzLnBhcnNlRXhwcigpO1xuICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnLCcpO1xuICAgICAgICAgICAgaWYgKHRydXRoeShjb25kKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLnBhcnNlRXhwcigpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnN1bWUgb3B0aW9uYWwgZWxzZSBicmFuY2ggd2l0aG91dCBldmFsdWF0aW5nIGl0XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgdGhpcy5wZWVrKCkudmFsdWUgPT09ICcsJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5za2lwRXhwcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmV4cGVjdE9wKCcpJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjb25kIGZhbHN5OiBza2lwIHRoZSB0aGVuLWJyYW5jaCwgZXZhbHVhdGUgdGhlIGVsc2UgYnJhbmNoXG4gICAgICAgICAgICB0aGlzLnNraXBFeHByKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJywnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMucGFyc2VFeHByKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKScpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKScpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIElGRVJST1IgZXZhbHVhdGVzIGl0cyBmaXJzdCBhcmd1bWVudCBpbiBcInNvZnRcIiBtb2RlOiBhbnkgZXJyb3IvdW5ldmFsdWFibGVcbiAgICAgICAgLy8gcmVzdWx0IGZhbGxzIGJhY2sgdG8gdGhlIHNlY29uZCBhcmd1bWVudCBpbnN0ZWFkIG9mIGZhaWxpbmcgdGhlIGZvcm11bGEuXG4gICAgICAgIGlmIChuYW1lID09PSAnSUZFUlJPUicpIHtcbiAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJygnKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0UG9zID0gdGhpcy5wb3M7XG4gICAgICAgICAgICBsZXQgZmlyc3Q7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZpcnN0ID0gdGhpcy5wYXJzZUV4cHIoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgICAgICAgICBmaXJzdCA9IHVuZGVmaW5lZDsgLy8gZXZhbHVhdGlvbiBlcnJvciAtPiB1c2UgZmFsbGJhY2tcbiAgICAgICAgICAgICAgICAvLyBPbiBhIG5lc3RlZCBlcnJvciB0aGUgY3Vyc29yIGlzIGxlZnQgbWlkLWV4cHJlc3Npb247IHNlZWsgZm9yd2FyZFxuICAgICAgICAgICAgICAgIC8vIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSB2YWx1ZSBhcmd1bWVudCB0byBpdHMgdG9wLWxldmVsICcsJyAodGhlXG4gICAgICAgICAgICAgICAgLy8gZmFsbGJhY2sgc2VwYXJhdG9yKSBvciB0byB0aGUgY2xvc2luZyAnKScgaWYgdGhlcmUgaXMgbm8gZmFsbGJhY2suXG4gICAgICAgICAgICAgICAgbGV0IGRlcHRoID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLnBvcyA9IHN0YXJ0UG9zO1xuICAgICAgICAgICAgICAgIHdoaWxlKHRoaXMucG9zIDwgdGhpcy50b2tlbnMubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdCA9IHRoaXMudG9rZW5zW3RoaXMucG9zXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQudHlwZSA9PT0gJ29wJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHQudmFsdWUgPT09ICcoJykgZGVwdGgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHQudmFsdWUgPT09ICcpJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXB0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IC8vIG5vIGZhbGxiYWNrOiBzdG9wIGF0IElGRVJST1IncyAnKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0LnZhbHVlID09PSAnLCcgJiYgZGVwdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcysrOyAvLyBjb25zdW1lIGZhbGxiYWNrIHNlcGFyYXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ29tbWEtc2VwYXJhdGVkIGZhbGxiYWNrIGFyZ3VtZW50XG4gICAgICAgICAgICBpZiAodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJywnKSB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIGNvbnN0IGZhbGxiYWNrID0gdGhpcy5wYXJzZUV4cHIoKTtcbiAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJyknKTtcbiAgICAgICAgICAgIHJldHVybiBmaXJzdCA9PT0gdW5kZWZpbmVkID8gZmFsbGJhY2sgOiBmaXJzdDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV4cGVjdE9wKCcoJyk7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBbXTtcbiAgICAgICAgaWYgKCEodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJyknKSkge1xuICAgICAgICAgICAgYXJncy5wdXNoKHRoaXMucGFyc2VFeHByKCkpO1xuICAgICAgICAgICAgd2hpbGUodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJywnKXtcbiAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2godGhpcy5wYXJzZUV4cHIoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5leHBlY3RPcCgnKScpO1xuICAgICAgICByZXR1cm4gYXBwbHlGdW5jdGlvbihuYW1lLCBhcmdzLCB0aGlzLmN1cnJlbnRDZWxsQWRkcik7XG4gICAgfVxufVxuZnVuY3Rpb24gY29tcGFyZShvcCwgYSwgYikge1xuICAgIGlmICh0eXBlb2YgYSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHN3aXRjaChvcCl7XG4gICAgICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgICAgICAgIGNhc2UgJzw+JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYSAhPT0gYjtcbiAgICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhIDwgYjtcbiAgICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhID4gYjtcbiAgICAgICAgICAgIGNhc2UgJzw9JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYSA8PSBiO1xuICAgICAgICAgICAgY2FzZSAnPj0nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhID49IGI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgeCA9IHRvTnVtKGEpLCB5ID0gdG9OdW0oYik7XG4gICAgc3dpdGNoKG9wKXtcbiAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICByZXR1cm4geCA9PT0geTtcbiAgICAgICAgY2FzZSAnPD4nOlxuICAgICAgICAgICAgcmV0dXJuIHggIT09IHk7XG4gICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgcmV0dXJuIHggPCB5O1xuICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgIHJldHVybiB4ID4geTtcbiAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgICAgcmV0dXJuIHggPD0geTtcbiAgICAgICAgY2FzZSAnPj0nOlxuICAgICAgICAgICAgcmV0dXJuIHggPj0geTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgY29tcGFyaXNvbicpO1xufVxuZnVuY3Rpb24gYXJpdGgob3AsIGEsIGIpIHtcbiAgICBjb25zdCB4ID0gdG9OdW0oYSksIHkgPSB0b051bShiKTtcbiAgICBzd2l0Y2gob3Ape1xuICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgIHJldHVybiB4ICsgeTtcbiAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICByZXR1cm4geCAtIHk7XG4gICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgcmV0dXJuIHggKiB5O1xuICAgICAgICBjYXNlICcvJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoeSA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdkaXZpZGUgYnkgemVybycpO1xuICAgICAgICAgICAgICAgIHJldHVybiB4IC8geTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnXic6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5wb3coeCwgeSk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignYmFkIG9wZXJhdG9yJyk7XG59XG5mdW5jdGlvbiBmbGF0dGVuKGFyZ3MpIHtcbiAgICBjb25zdCBvdXQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGEgb2YgYXJncyl7XG4gICAgICAgIGlmIChpc1JhbmdlKGEpKSBvdXQucHVzaCguLi5hLnZhbHVlcyk7XG4gICAgICAgIGVsc2Ugb3V0LnB1c2goYSk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59XG5mdW5jdGlvbiBudW1iZXJzKGFyZ3MpIHtcbiAgICBjb25zdCBvdXQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHYgb2YgZmxhdHRlbihhcmdzKSl7XG4gICAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpIG91dC5wdXNoKHYpO1xuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nKSBvdXQucHVzaCh2ID8gMSA6IDApO1xuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycgJiYgdi50cmltKCkgIT09ICcnKSB7XG4gICAgICAgICAgICBjb25zdCBuID0gTnVtYmVyKHYudHJpbSgpKTtcbiAgICAgICAgICAgIGlmIChpc0Zpbml0ZShuKSkgb3V0LnB1c2gobik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cbmZ1bmN0aW9uIHRvTnVtU2FmZSh2KSB7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykgcmV0dXJuIHY7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJyAmJiB2LnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgY29uc3QgbiA9IE51bWJlcih2LnRyaW0oKSk7XG4gICAgICAgIHJldHVybiBpc0Zpbml0ZShuKSA/IG4gOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG4vKiogQ29sbGFwc2Ugd2hpdGVzcGFjZSArIHRyaW0gKEV4Y2VsIFRSSU0pLiAqLyBmdW5jdGlvbiBleGNlbFRyaW0odikge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIFN0cmluZyh2ID8/ICcnKS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpO1xufVxuLyoqIEV4Y2VsIFBST1BFUjogdXBwZXJjYXNlIGZpcnN0IGxldHRlciBvZiBldmVyeSB3b3JkLCBsb3dlcmNhc2UgdGhlIHJlc3QuICovIGZ1bmN0aW9uIGV4Y2VsUHJvcGVyKHYpIHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiBcIlwiOyAvLyBFeGNlbDogZW1wdHkgY2VsbCBpbiB0ZXh0IGNvbnRleHRcbiAgICByZXR1cm4gU3RyaW5nKHYgPz8gJycpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvKF58W15BLVphLXowLTldKShbYS16XSkvZywgKF8sIHAsIGMpPT5wICsgYy50b1VwcGVyQ2FzZSgpKTtcbn1cbi8qKiBFeGNlbCBzZXJpYWwgZGF0ZSAtPiB7IHksIG0sIGQgfSBpbiB0aGUgMTkwMCBkYXRlIHN5c3RlbSAoaW5jbC4gZmFrZSAxOTAwLTAyLTI5KS4gKi8gZnVuY3Rpb24gc2VyaWFsVG9EYXRlKHNlcmlhbCkge1xuICAgIC8vIFNlcmlhbCAxID0gMTkwMC0wMS0wMTsgc2VyaWFsIDYwID0gZmFrZSAxOTAwLTAyLTI5OyBzZXJpYWwgPj0gNjEgb2Zmc2V0IGJ5IG9uZSBkYXkuXG4gICAgY29uc3QgZGF5cyA9IE1hdGguZmxvb3Ioc2VyaWFsKSArIChzZXJpYWwgPj0gNjAgPyAtMSA6IDApO1xuICAgIC8vIEV4Y2VsIHNlcmlhbCAxID0gMTkwMC0wMS0wMSA9IGJhc2UgKyAxIGRheTsgc2VyaWFsID49IDYxIGxvc2VzIHRoZSBmYWtlXG4gICAgLy8gMTkwMC0wMi0yOSAoc2VyaWFsIDYwKSwgc28gcmVhbCBlbGFwc2VkIGRheXMgPSBzZXJpYWwgLSAxLlxuICAgIGNvbnN0IG1zID0gZGF5cyAqIDg2NDAwMDAwO1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQygxODk5LCAxMSwgMzEpICsgbXMpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHk6IGRhdGUuZ2V0VVRDRnVsbFllYXIoKSxcbiAgICAgICAgbTogZGF0ZS5nZXRVVENNb250aCgpICsgMSxcbiAgICAgICAgZDogZGF0ZS5nZXRVVENEYXRlKClcbiAgICB9O1xufVxuLyoqIEJ1aWxkIGFuIEV4Y2VsIHNlcmlhbCBkYXRlIGZyb20geS9tL2QgKDE5MDAgc3lzdGVtLCBpbmNsLiBmYWtlIDE5MDAtMDItMjkpLiAqLyBmdW5jdGlvbiBkYXRlVG9TZXJpYWwoeSwgbSwgZCkge1xuICAgIGNvbnN0IGR0ID0gbmV3IERhdGUoRGF0ZS5VVEMoeSwgbSAtIDEsIGQpKTtcbiAgICBjb25zdCBzZXJpYWwgPSBNYXRoLmZsb29yKChkdC5nZXRUaW1lKCkgLSBEYXRlLlVUQygxODk5LCAxMSwgMzEpKSAvIDg2NDAwMDAwKTtcbiAgICByZXR1cm4gc2VyaWFsID49IDYwID8gc2VyaWFsICsgMSA6IHNlcmlhbDsgLy8gb2Zmc2V0IGZvciB0aGUgZmFrZSAxOTAwLTAyLTI5XG59XG4vKiogTWluaW1hbCBFeGNlbCBURVhUIGZvcm1hdHM6IG51bWVyaWMgKDAsIDAuMDAsICMsIyMwLCAjLCMjMC4wMCwgMCUsIDAuMCUpIGFuZCBkYXRlIHRva2VucyAoeXl5eSB5eSBtbW1tIG1tbSBtbSBtIGRkZGQgZGRkIGRkIGQgaGggaCBtbSBtIHNzIHMpLiBUaHJvd3Mgb24gdW5yZWNvZ25pemVkIGZvcm1hdHMuICovIGZ1bmN0aW9uIGV4Y2VsVGV4dEZvcm1hdCh2LCBmb3JtYXQpIHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIGNvbnN0IGZtdCA9IFN0cmluZyhmb3JtYXQpO1xuICAgIGNvbnN0IG51bSA9IHR5cGVvZiB2ID09PSAnbnVtYmVyJyA/IHYgOiBOdW1iZXIoU3RyaW5nKHYgPz8gJycpLnRyaW0oKSk7XG4gICAgY29uc3QgaXNEYXRlTGlrZSA9IC9beVlkRGhIbU1zU10vLnRlc3QoZm10LnJlcGxhY2UoL1teYS16QS1aXS9nLCAnJykpICYmIC95fGR8aHxzL2kudGVzdChmbXQpO1xuICAgIGlmIChpc0RhdGVMaWtlICYmIGlzRmluaXRlKG51bSkpIHtcbiAgICAgICAgY29uc3QgeyB5LCBtLCBkIH0gPSBzZXJpYWxUb0RhdGUobnVtKTtcbiAgICAgICAgY29uc3QgaG91cnMgPSBNYXRoLmZsb29yKG51bSAlIDEgKiAyNCk7XG4gICAgICAgIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKChudW0gJSAxICogMjQgLSBob3VycykgKiA2MCk7XG4gICAgICAgIGNvbnN0IHNlY29uZHMgPSBNYXRoLnJvdW5kKCgobnVtICUgMSAqIDI0IC0gaG91cnMpICogNjAgLSBtaW51dGVzKSAqIDYwKTtcbiAgICAgICAgY29uc3QgZGF5TmFtZXMgPSBbXG4gICAgICAgICAgICAnU3VuZGF5JyxcbiAgICAgICAgICAgICdNb25kYXknLFxuICAgICAgICAgICAgJ1R1ZXNkYXknLFxuICAgICAgICAgICAgJ1dlZG5lc2RheScsXG4gICAgICAgICAgICAnVGh1cnNkYXknLFxuICAgICAgICAgICAgJ0ZyaWRheScsXG4gICAgICAgICAgICAnU2F0dXJkYXknXG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IG1vbnRoTmFtZXMgPSBbXG4gICAgICAgICAgICAnSmFudWFyeScsXG4gICAgICAgICAgICAnRmVicnVhcnknLFxuICAgICAgICAgICAgJ01hcmNoJyxcbiAgICAgICAgICAgICdBcHJpbCcsXG4gICAgICAgICAgICAnTWF5JyxcbiAgICAgICAgICAgICdKdW5lJyxcbiAgICAgICAgICAgICdKdWx5JyxcbiAgICAgICAgICAgICdBdWd1c3QnLFxuICAgICAgICAgICAgJ1NlcHRlbWJlcicsXG4gICAgICAgICAgICAnT2N0b2JlcicsXG4gICAgICAgICAgICAnTm92ZW1iZXInLFxuICAgICAgICAgICAgJ0RlY2VtYmVyJ1xuICAgICAgICBdO1xuICAgICAgICBjb25zdCB3ZCA9IG5ldyBEYXRlKERhdGUuVVRDKHksIG0gLSAxLCBkKSkuZ2V0VVRDRGF5KCk7XG4gICAgICAgIGNvbnN0IHJlcCA9IHtcbiAgICAgICAgICAgICd5eXl5JzogU3RyaW5nKHkpLFxuICAgICAgICAgICAgJ3l5JzogU3RyaW5nKHkpLnNsaWNlKC0yKSxcbiAgICAgICAgICAgICdtbW1tJzogbW9udGhOYW1lc1ttIC0gMV0sXG4gICAgICAgICAgICAnbW1tJzogbW9udGhOYW1lc1ttIC0gMV0uc2xpY2UoMCwgMyksXG4gICAgICAgICAgICAnbW9uJzogU3RyaW5nKG0pLnBhZFN0YXJ0KDIsICcwJyksXG4gICAgICAgICAgICAnbW9uMSc6IFN0cmluZyhtKSxcbiAgICAgICAgICAgICdkZGRkJzogZGF5TmFtZXNbd2RdLFxuICAgICAgICAgICAgJ2RkZCc6IGRheU5hbWVzW3dkXS5zbGljZSgwLCAzKSxcbiAgICAgICAgICAgICdkZCc6IFN0cmluZyhkKS5wYWRTdGFydCgyLCAnMCcpLFxuICAgICAgICAgICAgJ2QnOiBTdHJpbmcoZCksXG4gICAgICAgICAgICAnaGgnOiBTdHJpbmcoaG91cnMpLnBhZFN0YXJ0KDIsICcwJyksXG4gICAgICAgICAgICAnaCc6IFN0cmluZyhob3VycyksXG4gICAgICAgICAgICAnbWluJzogU3RyaW5nKG1pbnV0ZXMpLnBhZFN0YXJ0KDIsICcwJyksXG4gICAgICAgICAgICAnbWluMSc6IFN0cmluZyhtaW51dGVzKSxcbiAgICAgICAgICAgICdzcyc6IFN0cmluZyhzZWNvbmRzKS5wYWRTdGFydCgyLCAnMCcpLFxuICAgICAgICAgICAgJ3MnOiBTdHJpbmcoc2Vjb25kcylcbiAgICAgICAgfTtcbiAgICAgICAgLy8gVG9rZW4tYmFzZWQgcmVwbGFjZSwgbG9uZ2VzdCBtYXRjaGVzIGZpcnN0LiBFeGNlbCBydWxlOiAnbW0nLydtJyBhcmVcbiAgICAgICAgLy8gTUlOVVRFUyB3aGVuIHRoZSBmb3JtYXQgY29udGFpbnMgYW4gaG91ciB0b2tlbiwgb3RoZXJ3aXNlIE1PTlRILlxuICAgICAgICBjb25zdCBoYXNIb3VyID0gL2gvaS50ZXN0KGZtdCk7XG4gICAgICAgIHJldHVybiBmbXQucmVwbGFjZSgveXl5eXx5eXxtbW1tfG1tbXxkZGRkfGRkZHxoaHxzc3xkZHxtbXxkfG18aHxzL2dpLCAodG9rKT0+e1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gdG9rLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnbW0nKSByZXR1cm4gaGFzSG91ciA/IHJlcFsnbWluJ10gOiByZXBbJ21vbiddO1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ20nKSByZXR1cm4gaGFzSG91ciA/IHJlcFsnbWluMSddIDogcmVwWydtb24xJ107XG4gICAgICAgICAgICByZXR1cm4gcmVwW2tleV0gPz8gdG9rO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCFpc0Zpbml0ZShudW0pKSByZXR1cm4gU3RyaW5nKHYgPz8gJycpO1xuICAgIGNvbnN0IHBjdCA9IGZtdC5pbmNsdWRlcygnJScpO1xuICAgIGNvbnN0IGRlY2ltYWxzID0gKGZtdC5tYXRjaCgvMCtcXC4oMCspLykgPz8gW10pWzFdPy5sZW5ndGggPz8gMDtcbiAgICBjb25zdCBncm91cGluZyA9IGZtdC5pbmNsdWRlcygnLCcpO1xuICAgIGNvbnN0IHZhbHVlID0gcGN0ID8gbnVtICogMTAwIDogbnVtO1xuICAgIGxldCBvdXQgPSB2YWx1ZS50b0ZpeGVkKGRlY2ltYWxzKTtcbiAgICBpZiAoZ3JvdXBpbmcpIHtcbiAgICAgICAgY29uc3QgW2ludCwgZGVjXSA9IG91dC5zcGxpdCgnLicpO1xuICAgICAgICBvdXQgPSBpbnQucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgJywnKSArIChkZWMgPyAnLicgKyBkZWMgOiAnJyk7XG4gICAgfVxuICAgIHJldHVybiBvdXQgKyAocGN0ID8gJyUnIDogJycpO1xufVxuLyoqIEV4Y2VsIG1hdGNoIGZvciBWTE9PS1VQL01BVENIOiBleGFjdCAoMCkgb3IgYXBwcm94aW1hdGUgKDEvLTEpLiBSZXR1cm5zIDEtYmFzZWQgaW5kZXggb3IgLTEuICovIGZ1bmN0aW9uIGZpbmRNYXRjaChsb29rdXAsIGFyciwgdHlwZSkge1xuICAgIGlmICh0eXBlID09PSAwKSB7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgY29uc3QgYSA9IGFycltpXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbG9va3VwID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgYSA9PT0gJ251bWJlcicgJiYgbG9va3VwID09PSBhKSByZXR1cm4gaSArIDE7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGxvb2t1cCA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGEgPT09ICdzdHJpbmcnICYmIGV4Y2VsVHJpbShsb29rdXApLnRvTG93ZXJDYXNlKCkgPT09IGV4Y2VsVHJpbShhKS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gaSArIDE7XG4gICAgICAgICAgICBpZiAoU3RyaW5nKGxvb2t1cCkudG9Mb3dlckNhc2UoKSA9PT0gU3RyaW5nKGEgPz8gJycpLnRvTG93ZXJDYXNlKCkpIHJldHVybiBpICsgMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIC8vIEFwcHJveGltYXRlOiBhc3N1bWUgYXNjZW5kaW5nICh0eXBlIDEpIC0+IGxhcmdlc3QgPD0gbG9va3VwOyBkZXNjZW5kaW5nICgtMSkgLT4gc21hbGxlc3QgPj0gbG9va3VwXG4gICAgbGV0IGJlc3QgPSAtMTtcbiAgICBpZiAodHlwZSA9PT0gMSkge1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGNvbnN0IGEgPSB0b051bVNhZmUoYXJyW2ldKTtcbiAgICAgICAgICAgIGNvbnN0IGwgPSB0b051bVNhZmUobG9va3VwKTtcbiAgICAgICAgICAgIGlmIChhICE9PSB1bmRlZmluZWQgJiYgbCAhPT0gdW5kZWZpbmVkICYmIGEgPD0gbCkgYmVzdCA9IGkgKyAxO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAtMSkge1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGNvbnN0IGEgPSB0b051bVNhZmUoYXJyW2ldKTtcbiAgICAgICAgICAgIGNvbnN0IGwgPSB0b051bVNhZmUobG9va3VwKTtcbiAgICAgICAgICAgIGlmIChhICE9PSB1bmRlZmluZWQgJiYgbCAhPT0gdW5kZWZpbmVkICYmIGEgPj0gbCAmJiAoYmVzdCA9PT0gLTEgfHwgYSA8PSB0b051bVNhZmUoYXJyW2Jlc3QgLSAxXSkpKSBiZXN0ID0gaSArIDE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJlc3Q7XG59XG4vKiogRXhjZWwgU1VNSUYgY3JpdGVyaWE6IG51bWJlciwgcGxhaW4gdGV4dCAod2lsZGNhcmRzICogPyBzdXBwb3J0ZWQpLCBvciBvcGVyYXRvci1wcmVmaXhlZCAoXCI8NVwiLCBcIj49MTAwXCIsIFwiPD4wXCIpLiAqLyBmdW5jdGlvbiBjcml0ZXJpYU1hdGNoZXModmFsdWUsIGNyaXRlcmlhKSB7XG4gICAgY29uc3QgdiA9IHZhbHVlID8/ICcnO1xuICAgIGlmICh0eXBlb2YgY3JpdGVyaWEgPT09ICdudW1iZXInKSByZXR1cm4gdHlwZW9mIHYgPT09ICdudW1iZXInID8gdiA9PT0gY3JpdGVyaWEgOiBOdW1iZXIoU3RyaW5nKHYpKSA9PT0gY3JpdGVyaWE7XG4gICAgY29uc3QgY3JpdCA9IGV4Y2VsVHJpbShjcml0ZXJpYSk7XG4gICAgaWYgKGNyaXQgPT09ICcnKSByZXR1cm4gdiA9PT0gJycgfHwgdiA9PT0gbnVsbCB8fCB2ID09PSB1bmRlZmluZWQ7XG4gICAgY29uc3QgbSA9IGNyaXQubWF0Y2goL14oPD18Pj18PD58PHw+fD0pPyguKikkL3MpO1xuICAgIGNvbnN0IG9wID0gbT8uWzFdID8/ICc9JztcbiAgICBsZXQgdGFyZ2V0ID0gbT8uWzJdID8/ICcnO1xuICAgIGNvbnN0IG51bWVyaWNUYXJnZXQgPSB0b051bVNhZmUodGFyZ2V0KTtcbiAgICBjb25zdCBudW1lcmljVmFsID0gdG9OdW1TYWZlKHYpO1xuICAgIGlmIChvcCAhPT0gJz0nICYmIG51bWVyaWNUYXJnZXQgIT09IHVuZGVmaW5lZCAmJiBudW1lcmljVmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3dpdGNoKG9wKXtcbiAgICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgICAgIHJldHVybiBudW1lcmljVmFsIDwgbnVtZXJpY1RhcmdldDtcbiAgICAgICAgICAgIGNhc2UgJzw9JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtZXJpY1ZhbCA8PSBudW1lcmljVGFyZ2V0O1xuICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bWVyaWNWYWwgPiBudW1lcmljVGFyZ2V0O1xuICAgICAgICAgICAgY2FzZSAnPj0nOlxuICAgICAgICAgICAgICAgIHJldHVybiBudW1lcmljVmFsID49IG51bWVyaWNUYXJnZXQ7XG4gICAgICAgICAgICBjYXNlICc8Pic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bWVyaWNWYWwgIT09IG51bWVyaWNUYXJnZXQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gV2lsZGNhcmQgbWF0Y2hpbmcgZm9yIGVxdWFsaXR5IChFeGNlbCAqIGFuZCA/KVxuICAgIGlmICh0YXJnZXQuaW5jbHVkZXMoJyonKSB8fCB0YXJnZXQuaW5jbHVkZXMoJz8nKSkge1xuICAgICAgICBjb25zdCByeCA9ICdeJyArIHRhcmdldC5yZXBsYWNlKC9bLiteJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKS5yZXBsYWNlKC9cXCovZywgJy4qJykucmVwbGFjZSgvXFw/L2csICcuJykgKyAnJCc7XG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKHJ4LCAnaScpLnRlc3QoU3RyaW5nKHYgPz8gJycpKTtcbiAgICB9XG4gICAgY29uc3QgczEgPSBTdHJpbmcodiA/PyAnJykudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgczIgPSB0YXJnZXQudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG9wID09PSAnPD4nKSByZXR1cm4gczEgIT09IHMyO1xuICAgIHJldHVybiBzMSA9PT0gczI7XG59XG5mdW5jdGlvbiBhcHBseUZ1bmN0aW9uKG5hbWUsIGFyZ3MsIHRoaXNDZWxsQWRkcikge1xuICAgIGNvbnN0IG51bXMgPSBudW1iZXJzKGFyZ3MpO1xuICAgIGNvbnN0IHN1bSA9ICgpPT5udW1zLnJlZHVjZSgocywgdik9PnMgKyB2LCAwKTtcbiAgICBzd2l0Y2gobmFtZSl7XG4gICAgICAgIGNhc2UgJ1NVTSc6XG4gICAgICAgICAgICByZXR1cm4gc3VtKCk7XG4gICAgICAgIGNhc2UgJ0FWRVJBR0UnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICghbnVtcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignQVZFUkFHRSBvZiBlbXB0eScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdW0oKSAvIG51bXMubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdNSU4nOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICghbnVtcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignTUlOIG9mIGVtcHR5Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWluKC4uLm51bXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdNQVgnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICghbnVtcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignTUFYIG9mIGVtcHR5Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KC4uLm51bXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdDT1VOVCc6XG4gICAgICAgICAgICByZXR1cm4gbnVtcy5sZW5ndGg7XG4gICAgICAgIGNhc2UgJ0NPVU5UQSc6XG4gICAgICAgICAgICByZXR1cm4gZmxhdHRlbihhcmdzKS5maWx0ZXIoKHYpPT52ICE9PSAnJyAmJiB2ICE9PSB1bmRlZmluZWQgJiYgdiAhPT0gbnVsbCkubGVuZ3RoO1xuICAgICAgICBjYXNlICdQUk9EVUNUJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoIW51bXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ1BST0RVQ1Qgb2YgZW1wdHknKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtcy5yZWR1Y2UoKHAsIHYpPT5wICogdiwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0FCUyc6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hYnModG9OdW0oYXJnc1swXSkpO1xuICAgICAgICBjYXNlICdJTlQnOlxuICAgICAgICAgICAgcmV0dXJuIE1hdGgudHJ1bmModG9OdW0oYXJnc1swXSkpO1xuICAgICAgICBjYXNlICdTUVJUJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdG9OdW0oYXJnc1swXSk7XG4gICAgICAgICAgICAgICAgaWYgKHYgPCAwKSB0aHJvdyBuZXcgRXJyb3IoJ1NRUlQgb2YgbmVnYXRpdmUnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHYpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdST1VORCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHRvTnVtKGFyZ3NbMF0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBhcmdzLmxlbmd0aCA+IDEgPyB0b051bShhcmdzWzFdKSA6IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgZiA9IE1hdGgucG93KDEwLCBkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh2ICogZikgLyBmO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdST1VORFVQJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdG9OdW0oYXJnc1swXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGFyZ3MubGVuZ3RoID4gMSA/IHRvTnVtKGFyZ3NbMV0pIDogMDtcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gTWF0aC5wb3coMTAsIGQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnNpZ24odikgKiBNYXRoLmNlaWwoTWF0aC5hYnModikgKiBmKSAvIGY7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1JPVU5ERE9XTic6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHRvTnVtKGFyZ3NbMF0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBhcmdzLmxlbmd0aCA+IDEgPyB0b051bShhcmdzWzFdKSA6IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgZiA9IE1hdGgucG93KDEwLCBkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5zaWduKHYpICogTWF0aC5mbG9vcihNYXRoLmFicyh2KSAqIGYpIC8gZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnTU9EJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhID0gdG9OdW0oYXJnc1swXSksIGIgPSB0b051bShhcmdzWzFdKTtcbiAgICAgICAgICAgICAgICBpZiAoYiA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdNT0QgYnkgemVybycpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhIC0gYiAqIE1hdGguZmxvb3IoYSAvIGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdQT1dFUic6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5wb3codG9OdW0oYXJnc1swXSksIHRvTnVtKGFyZ3NbMV0pKTtcbiAgICAgICAgY2FzZSAnSUYnOlxuICAgICAgICAgICAgcmV0dXJuIHRydXRoeShhcmdzWzBdKSA/IGFyZ3NbMV0gOiBhcmdzWzJdO1xuICAgICAgICBjYXNlICdTVUJUT1RBTCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gQ29kZSBpcyBhcmcgMCBcdTIwMTQgbXVzdCBOT1QgYmUgaW5jbHVkZWQgaW4gdGhlIHN1bSAoRXhjZWwgU1VCVE9UQUwoOSxybmcpID09IFNVTShybmcpKVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBNYXRoLmFicyh0b051bShhcmdzWzBdKSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvZGUgPT09IDkgfHwgY29kZSA9PT0gMTA5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhbmdlTnVtcyA9IG51bWJlcnMoYXJncy5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByYW5nZU51bXMucmVkdWNlKChzLCB2KT0+cyArIHYsIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NVQlRPVEFMIGNvZGUgJyArIGNvZGUgKyAnIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnQU5EJzpcbiAgICAgICAgICAgIHJldHVybiBmbGF0dGVuKGFyZ3MpLmV2ZXJ5KChhKT0+dHJ1dGh5KGEpKTtcbiAgICAgICAgY2FzZSAnT1InOlxuICAgICAgICAgICAgcmV0dXJuIGZsYXR0ZW4oYXJncykuc29tZSgoYSk9PnRydXRoeShhKSk7XG4gICAgICAgIGNhc2UgJ1RSSU0nOlxuICAgICAgICAgICAgcmV0dXJuIGV4Y2VsVHJpbShhcmdzWzBdKTtcbiAgICAgICAgY2FzZSAnUFJPUEVSJzpcbiAgICAgICAgICAgIHJldHVybiBleGNlbFByb3BlcihhcmdzWzBdKTtcbiAgICAgICAgY2FzZSAnQ0hPT1NFJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMF0pKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gZmxhdHRlbihhcmdzLnNsaWNlKDEpKTtcbiAgICAgICAgICAgICAgICBpZiAoaWR4IDwgMSB8fCBpZHggPiBjYW5kaWRhdGVzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdDSE9PU0UgaW5kZXggb3V0IG9mIHJhbmdlJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZXNbaWR4IC0gMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0RBVEUnOlxuICAgICAgICAgICAgcmV0dXJuIGRhdGVUb1NlcmlhbChNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMF0pKSwgTWF0aC5mbG9vcih0b051bShhcmdzWzFdKSksIE1hdGguZmxvb3IodG9OdW0oYXJnc1syXSkpKTtcbiAgICAgICAgY2FzZSAnV0VFS0RBWSc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VyaWFsID0gdG9OdW0oYXJnc1swXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IGFyZ3MubGVuZ3RoID4gMSA/IE1hdGguZmxvb3IodG9OdW0oYXJnc1sxXSkpIDogMTtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHksIG0sIGQgfSA9IHNlcmlhbFRvRGF0ZShzZXJpYWwpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGpzRGF5ID0gbmV3IERhdGUoRGF0ZS5VVEMoeSwgbSAtIDEsIGQpKS5nZXRVVENEYXkoKTsgLy8gMD1TdW5kYXlcbiAgICAgICAgICAgICAgICBzd2l0Y2godHlwZSl7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBqc0RheSArIDE7IC8vIDE9U3VuZGF5IC4uIDc9U2F0dXJkYXlcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGpzRGF5ID09PSAwID8gNyA6IGpzRGF5OyAvLyAxPU1vbmRheSAuLiA3PVN1bmRheVxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ganNEYXk7IC8vIDA9TW9uZGF5IC4uIDY9U3VuZGF5XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dFRUtEQVkgcmV0dXJuX3R5cGUgJyArIHR5cGUgKyAnIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0NPTFVNTic6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICBpZiAocmVmID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzQ2VsbEFkZHIpIHRocm93IG5ldyBFcnJvcignQ09MVU1OIHdpdGhvdXQgcmVmIG5lZWRzIGNlbGwgY29udGV4dCcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWNvZGVkID0gdXRpbHMuZGVjb2RlX2NlbGwodGhpc0NlbGxBZGRyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlY29kZWQuYyArIDE7IC8vIDEtYmFzZWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZWYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG0gPSByZWYubWF0Y2goL1tBLVphLXpdezEsM30vKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBDT0xVTU4gcmVmJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbFN0ciA9IG1bMF0udG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2ggb2YgY29sU3RyKWNvbCA9IGNvbCAqIDI2ICsgKGNoLmNoYXJDb2RlQXQoMCkgLSA2NCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2w7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ09MVU1OIG9mIHJhbmdlIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnU1VNSUYnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhbmdlQXJnID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjcml0ZXJpYSA9IGFyZ3NbMV07XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VtQXJnID0gYXJnc1syXSA/PyByYW5nZUFyZztcbiAgICAgICAgICAgICAgICBpZiAoIWlzUmFuZ2UocmFuZ2VBcmcpIHx8ICFpc1JhbmdlKHN1bUFyZykpIHRocm93IG5ldyBFcnJvcignU1VNSUYgbmVlZHMgcmFuZ2VzJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gcmFuZ2VBcmcudmFsdWVzO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1bXMgPSBzdW1BcmcudmFsdWVzO1xuICAgICAgICAgICAgICAgIGNvbnN0IG91dCA9IFtdO1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3JpdGVyaWFNYXRjaGVzKHZhbHVlc1tpXSwgY3JpdGVyaWEpKSBvdXQucHVzaCh0b051bVNhZmUoc3Vtc1tpXSA/PyAwKSA/PyAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dC5yZWR1Y2UoKHMsIHYpPT5zICsgdiwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1ZMT09LVVAnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvb2t1cCA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgY29uc3QgdGFibGUgPSBhcmdzWzFdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbElkeCA9IE1hdGguZmxvb3IodG9OdW0oYXJnc1syXSkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFwcHJveCA9IGFyZ3MubGVuZ3RoID4gMyA/IHRydXRoeShhcmdzWzNdKSA6IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1JhbmdlKHRhYmxlKSB8fCBjb2xJZHggPCAxIHx8IGNvbElkeCA+IHRhYmxlLndpZHRoKSB0aHJvdyBuZXcgRXJyb3IoJ1ZMT09LVVAgYmFkIHRhYmxlL2NvbCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0Q29sID0gW107XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93cyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvcihsZXQgciA9IDA7IHIgPCBNYXRoLmZsb29yKHRhYmxlLnZhbHVlcy5sZW5ndGggLyB0YWJsZS53aWR0aCk7IHIrKyl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9IHRhYmxlLnZhbHVlcy5zbGljZShyICogdGFibGUud2lkdGgsIChyICsgMSkgKiB0YWJsZS53aWR0aCk7XG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChyb3cpO1xuICAgICAgICAgICAgICAgICAgICBmaXJzdENvbC5wdXNoKHJvd1swXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGhpdCA9IGFwcHJveCA/IGZpbmRNYXRjaChsb29rdXAsIGZpcnN0Q29sLCAxKSA6IGZpbmRNYXRjaChsb29rdXAsIGZpcnN0Q29sLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAoaGl0ID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdWTE9PS1VQIG5vIG1hdGNoJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsID0gcm93c1toaXQgLSAxXVtjb2xJZHggLSAxXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsID09PSB1bmRlZmluZWQgPyAnJyA6IHZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnTUFUQ0gnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvb2t1cCA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgY29uc3QgYXJyID0gYXJnc1sxXTtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gYXJncy5sZW5ndGggPiAyID8gTWF0aC5mbG9vcih0b051bShhcmdzWzJdKSkgOiAxO1xuICAgICAgICAgICAgICAgIGlmICghaXNSYW5nZShhcnIpKSB0aHJvdyBuZXcgRXJyb3IoJ01BVENIIG5lZWRzIGEgcmFuZ2UnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBoaXQgPSBmaW5kTWF0Y2gobG9va3VwLCBhcnIudmFsdWVzLCB0eXBlKTtcbiAgICAgICAgICAgICAgICBpZiAoaGl0ID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdNQVRDSCBubyBtYXRjaCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBoaXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0lOREVYJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhcnIgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvd0lkeCA9IE1hdGguZmxvb3IodG9OdW0oYXJnc1sxXSkpO1xuICAgICAgICAgICAgICAgIGlmICghaXNSYW5nZShhcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByb3dJZHggPT09IDEgPyBhcnIgOiAoKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSU5ERVggb3V0IG9mIHJhbmdlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sSWR4ID0gTWF0aC5mbG9vcih0b051bShhcmdzWzJdKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IChyb3dJZHggLSAxKSAqIGFyci53aWR0aCArIChjb2xJZHggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvcyA8IDAgfHwgcG9zID49IGFyci52YWx1ZXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0lOREVYIG91dCBvZiByYW5nZScpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyLnZhbHVlc1twb3NdID8/IDA7IC8vIEV4Y2VsIGNvZXJjZXMgZW1wdHkgY2VsbHMgdG8gMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSByb3dJZHggLSAxO1xuICAgICAgICAgICAgICAgIGlmIChwb3MgPCAwIHx8IHBvcyA+PSBhcnIudmFsdWVzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdJTkRFWCBvdXQgb2YgcmFuZ2UnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyLnZhbHVlc1twb3NdID8/IDA7IC8vIEV4Y2VsIGNvZXJjZXMgZW1wdHkgY2VsbHMgdG8gMFxuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdURVhUJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmbXQgPSBTdHJpbmcoYXJnc1sxXSA/PyAnJyk7XG4gICAgICAgICAgICAgICAgaWYgKGlzUmFuZ2UoYXJnc1swXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQXJyYXkgY29udGV4dDogYXBwbHkgVEVYVCBlbGVtZW50LXdpc2UgKGUuZy4gYnVpbGRpbmcgYSBsb29rdXAgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIE1BVENIIGFnYWluc3QgYSBmb3JtYXR0ZWQgaGVhZGVyIHJvdykuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfX3JhbmdlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBhcmdzWzBdLnZhbHVlcy5tYXAoKHYpPT5leGNlbFRleHRGb3JtYXQodiwgZm10KSksXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYXJnc1swXS53aWR0aFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZXhjZWxUZXh0Rm9ybWF0KGFyZ3NbMF0sIGZtdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIGZ1bmN0aW9uOiAnICsgbmFtZSk7XG4gICAgfVxufVxuLyoqXG4gKiBSZWdleCBmYWxsYmFjayBmb3IgZm9ybXVsYXMgdGhlIHRva2VuaXplciBjYW5ub3QgcGFyc2UgKGV4b3RpYyBjaGFycykuXG4gKiBIYW5kbGVzOiBBMSwgJEEkMSwgQTE6QjUsIEE6QSwgU2hlZXQhRDcsICdTaGVldCAxJyFENy5cbiAqLyBmdW5jdGlvbiByZWdleFJlZnMoc3JjKSB7XG4gICAgY29uc3Qgb3V0ID0gW107XG4gICAgY29uc3QgcmUgPSAvKD86KD86JyhbXiddKyknfChbQS1aYS16X11bQS1aYS16MC05Xy5dKikpIT8pP1xcJD8oW0EtWmEtel17MSwzfSkoXFwkPykoXFxkKikoPzo6XFwkPyhbQS1aYS16XXsxLDN9KShcXCQ/KShcXGQqKSk/L2c7XG4gICAgbGV0IG07XG4gICAgd2hpbGUoKG0gPSByZS5leGVjKHNyYykpICE9PSBudWxsKXtcbiAgICAgICAgY29uc3QgWywgc2hlZXQsIHNoZWV0MiwgY29sLCAsIGRpZ2l0cywgZW5kQ29sLCAsIGVuZERpZ2l0c10gPSBtO1xuICAgICAgICBjb25zdCBuZXh0Q2ggPSBzcmNbbS5pbmRleCArIG1bMF0ubGVuZ3RoXTtcbiAgICAgICAgLy8gQ29sdW1uLW9ubHkgdG9rZW4gKG5vIGRpZ2l0cyk6IG9ubHkgbWVhbmluZ2Z1bCBhcyBhIHJhbmdlIHBhcnQgKEE6QSkuXG4gICAgICAgIC8vIEFsc28gc2tpcHMgaWRlbnRpZmllcnMgbGlrZSBcIlNVTUlGUyhcIiAobWF0Y2hlZCBhcyBcIlNVTVwiICsgXCJJRlMoXCIpLlxuICAgICAgICBpZiAoZGlnaXRzID09PSAnJykge1xuICAgICAgICAgICAgaWYgKG5leHRDaCAhPT0gJzonKSBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChuZXh0Q2ggPT09ICcoJykge1xuICAgICAgICAgICAgY29udGludWU7IC8vIGZ1bmN0aW9uIG5hbWUgZW5kaW5nIGluIGRpZ2l0cyAoTE9HMTAoLCBMT0cyKCwgLi4uKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFkZHIgPSBgJHtjb2x9JHtkaWdpdHN9YDtcbiAgICAgICAgaWYgKGVuZENvbCAmJiBlbmREaWdpdHMgIT09ICcnKSBvdXQucHVzaCh7XG4gICAgICAgICAgICBzaGVldDogc2hlZXQgPz8gc2hlZXQyLFxuICAgICAgICAgICAgYWRkcixcbiAgICAgICAgICAgIGVuZDogYCR7ZW5kQ29sfSR7ZW5kRGlnaXRzfWBcbiAgICAgICAgfSk7XG4gICAgICAgIGVsc2UgaWYgKGVuZENvbCkgb3V0LnB1c2goe1xuICAgICAgICAgICAgc2hlZXQ6IHNoZWV0ID8/IHNoZWV0MixcbiAgICAgICAgICAgIGFkZHIsXG4gICAgICAgICAgICBlbmQ6IGAke2VuZENvbH1gXG4gICAgICAgIH0pO1xuICAgICAgICBlbHNlIG91dC5wdXNoKHtcbiAgICAgICAgICAgIHNoZWV0OiBzaGVldCA/PyBzaGVldDIsXG4gICAgICAgICAgICBhZGRyXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDb2xsZWN0IGV2ZXJ5IGNlbGwvcmFuZ2UgcmVmZXJlbmNlIGZyb20gYSBmb3JtdWxhIHN0cmluZy5cbiAqXG4gKiBcIj1TVU0oVjQ2OlY1NClcIiAgICAgLT4gW3sgYWRkcjogXCJWNDZcIiwgZW5kOiBcIlY1NFwiIH1dXG4gKiBcIj1QTCFENyArIFBMIUQ4XCIgICAgLT4gW3sgc2hlZXQ6IFwiUExcIiwgYWRkcjogXCJEN1wiIH0sIHsgc2hlZXQ6IFwiUExcIiwgYWRkcjogXCJEOFwiIH1dXG4gKiBcIj1WNDYqMlwiICAgICAgICAgICAgLT4gW3sgYWRkcjogXCJWNDZcIiB9XVxuICpcbiAqIFVzZXMgdGhlIHNhbWUgdG9rZW5pemVyIGFzIGV2YWx1YXRlRm9ybXVsYSBzbyByZWZlcmVuY2UgZGV0ZWN0aW9uIHN0YXlzXG4gKiBjb25zaXN0ZW50IHdpdGggZXZhbHVhdGlvbjsgZmFsbHMgYmFjayB0byBhIHJlZ2V4IHBhc3Mgd2hlbiB0aGUgdG9rZW5pemVyXG4gKiByZWplY3RzIHRoZSBzdHJpbmcgKHVuZXZhbHVhYmxlIGZvcm11bGFzIHN0aWxsIGdldCB0aGVpciByZWZzIG1hcHBlZCkuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RSZWZlcmVuY2VzKHNyYykge1xuICAgIGNvbnN0IHRleHQgPSBzcmMucmVwbGFjZSgvXj0vLCAnJykudHJpbSgpO1xuICAgIGlmICghdGV4dCkgcmV0dXJuIFtdO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHRva2VucyA9IHRva2VuaXplKHRleHQpO1xuICAgICAgICBjb25zdCByZWZzID0gW107XG4gICAgICAgIGxldCBwZW5kaW5nU2hlZXQ7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgd2hpbGUoaSA8IHRva2Vucy5sZW5ndGgpe1xuICAgICAgICAgICAgY29uc3QgdCA9IHRva2Vuc1tpXTtcbiAgICAgICAgICAgIGlmICh0LnR5cGUgPT09ICdzaGVldCcpIHtcbiAgICAgICAgICAgICAgICBwZW5kaW5nU2hlZXQgPSB0LnZhbHVlO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0LnR5cGUgPT09ICdyZWYnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWRkciA9IHQudmFsdWUucmVwbGFjZSgvXFwkL2csICcnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBueHQgPSB0b2tlbnNbaSArIDFdO1xuICAgICAgICAgICAgICAgIC8vIEZ1bmN0aW9uLW5hbWUgZmFsc2UgcG9zaXRpdmVzIChMT0cxMCgsIExPRzIoKSBhcmUgdG9rZW5pemVkIGFzIHJlZnMpXG4gICAgICAgICAgICAgICAgaWYgKG54dCAmJiBueHQudHlwZSA9PT0gJ29wJyAmJiBueHQudmFsdWUgPT09ICcoJykge1xuICAgICAgICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdTaGVldCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChueHQgJiYgbnh0LnR5cGUgPT09ICdvcCcgJiYgbnh0LnZhbHVlID09PSAnOicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kVG9rID0gdG9rZW5zW2kgKyAyXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVuZFRvayAmJiBlbmRUb2sudHlwZSA9PT0gJ3JlZicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hlZXQ6IHBlbmRpbmdTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZDogZW5kVG9rLnZhbHVlLnJlcGxhY2UoL1xcJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ1NoZWV0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVmcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgc2hlZXQ6IHBlbmRpbmdTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgYWRkclxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBwZW5kaW5nU2hlZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlZnM7XG4gICAgfSBjYXRjaCAge1xuICAgICAgICByZXR1cm4gcmVnZXhSZWZzKHRleHQpO1xuICAgIH1cbn1cbi8qKlxuICogRXZhbHVhdGUgYW4gRXhjZWwgZm9ybXVsYSBzdHJpbmcgYWdhaW5zdCB0aGUgd29ya2Jvb2suXG4gKiBSZXR1cm5zIHsgdmFsdWUgfSBmb3IgZm9ybXVsYXMgd2UgY2FuIGNvbXB1dGUsIHsgdW5ldmFsdWFibGU6IHRydWUgfSBvdGhlcndpc2UuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlRm9ybXVsYSh3Yiwgd3MsIGZvcm11bGEsIGRlcHRoID0gMCwgY3VycmVudENlbGxBZGRyKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3JjID0gZm9ybXVsYS50cmltKCk7XG4gICAgICAgIGlmICghc3JjLnN0YXJ0c1dpdGgoJz0nKSkgcmV0dXJuIHtcbiAgICAgICAgICAgIHVuZXZhbHVhYmxlOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIod2IsIHdzLCBzcmMuc2xpY2UoMSksIGRlcHRoLCBjdXJyZW50Q2VsbEFkZHIpO1xuICAgICAgICBjb25zdCB2ID0gcGFyc2VyLnBhcnNlRXhwcigpO1xuICAgICAgICBpZiAoIXBhcnNlci5maW5pc2hlZCgpKSByZXR1cm4ge1xuICAgICAgICAgICAgdW5ldmFsdWFibGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgLy8gRXhjZWw6IGEgdG9wLWxldmVsIHJlZmVyZW5jZSB0byBhbiBlbXB0eS9taXNzaW5nIGNlbGwgZXZhbHVhdGVzIHRvIDAuXG4gICAgICAgIC8vIChSZWFsIGZhaWx1cmVzIFx1MjAxNCB1bnN1cHBvcnRlZC9lcnJvcmluZyByZWZlcmVuY2VkIGZvcm11bGFzIFx1MjAxNCB0aHJvdyBpblxuICAgICAgICAvLyByZXNvbHZlQ2VsbCBhbmQgYXJlIGNhdWdodCBhYm92ZSwgc28gdGhleSBzdGlsbCByZXR1cm4gdW5ldmFsdWFibGUuKVxuICAgICAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIHVuZXZhbHVhYmxlOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInICYmICFpc0Zpbml0ZSh2KSkgcmV0dXJuIHtcbiAgICAgICAgICAgIHVuZXZhbHVhYmxlOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIC8vIEJvb2xlYW5zIC0+IDEvMCBmb3IgbnVtZXJpYyBFeGNlbCBjZWxsc1xuICAgICAgICBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB2ID8gMSA6IDAsXG4gICAgICAgICAgICB1bmV2YWx1YWJsZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB2LFxuICAgICAgICAgICAgdW5ldmFsdWFibGU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfSBjYXRjaCAge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdW5ldmFsdWFibGU6IHRydWVcbiAgICAgICAgfTtcbiAgICB9XG59XG4iLCAiLyoqXG4gKiBXb3JrYm9vayBcdTIxOTIgREItc2hlZXQgbWFwcGluZyBoZWxwZXJzLlxuICpcbiAqIFRoZSBzaGVldCB2aWV3ZXIgc2VydmVzIHdvcmtib29rIGRhdGEgYXMgSlNPTiByb3dzIGtleWVkIGJ5IGNvbHVtbiBoZWFkZXJcbiAqIChkZWR1cGxpY2F0ZWQsIGUuZy4gXCJUb3RhbFwiLCBcIlRvdGFsXzJcIiksIHdpdGggYW4gYXV0b21hdGljYWxseSBkZXRlY3RlZFxuICogaGVhZGVyIHJvdy4gVGhlc2UgaGVscGVycyBhcmUgdGhlIHNpbmdsZSBzb3VyY2Ugb2YgdHJ1dGggZm9yIHRoYXQgbWFwcGluZyBcdTIwMTRcbiAqIHRoZSBzaGVldC1kYXRhIEFQSSByb3V0ZSwgdGhlIGZvcm11bGEtcmVmZXJlbmNlIG1hcHBlciwgYW5kIHRoZSBpbXBvcnQtdGltZVxuICogZm9ybXVsYSBleHRyYWN0aW9uIGFsbCB1c2UgdGhlbSBzbyBhIGZvcm11bGEgY2VsbCByZWZlcmVuY2UgKFwiVjQ2XCIpIG1hcHMgdG9cbiAqIHRoZSBleGFjdCBzYW1lIChjb2x1bW4ga2V5LCBkYXRhLXJvdyBvZmZzZXQpIHRoZSBhcHBsaWNhdGlvbiBkaXNwbGF5cy5cbiAqLyBpbXBvcnQgeyB1dGlscyB9IGZyb20gJ3hsc3gnO1xuLy8gSGVhZGVyIHJvdyBkZXRlY3Rpb24gKG1pcnJvcnMgdGhlIGxvZ2ljIGhpc3RvcmljYWxseSBkdXBsaWNhdGVkIGluIHRoZVxuLy8gc2hlZXQtZGF0YSByb3V0ZSBhbmQgd29ya2Jvb2stYW5hbHl6ZXIudHMpLlxuY29uc3QgSEVBREVSX0tFWVdPUkRTID0gL2Rlc2NyaXB0aW9ufGFtb3VudHx0b3RhbHxkYXRlfHJldmVudWV8YWNjb3VudHxuYW1lfHF0eXxwcmljZXxjb3N0fHNhbGVzfGluY29tZXxleHBlbnNlfGJhbGFuY2V8bnVtYmVyfHJlZnxwZXJpb2R8dHJhbnNhY3Rpb258ZGViaXR8Y3JlZGl0fHVuaXR8cmF0ZXxwY3R8bWFyZ2lufGJpbGxzfGNvdmVyc3xndWVzdHN8c3RhZmZ8Y29kZXx0eXBlfGNhdGVnb3J5fGl0ZW18cHJvZHVjdHxzZXJ2aWNlfGNoYXJnZXxkaXNjb3VudHx0YXh8c3VidG90YWx8bmV0fGdyb3NzL2k7XG5jb25zdCBUSVRMRV9LRVlXT1JEUyA9IC9eKHByb2ZpdFxccyomP1xccypsb3NzfGJhbGFuY2VcXHMqc2hlZXR8dHJpYWxcXHMqYmFsYW5jZXxnZW5lcmFsXFxzKmxlZGdlcnxwZXJpb2RlfHBlcmlvZHxtb250aFxccypvZnxpbnB1dFxccypkYXRhfGF1dG9cXHMqY2FsYykvaTtcbmV4cG9ydCBmdW5jdGlvbiBmaW5kSGVhZGVyUm93KHdzKSB7XG4gICAgY29uc3Qgcm93cyA9IHV0aWxzLnNoZWV0X3RvX2pzb24od3MsIHtcbiAgICAgICAgaGVhZGVyOiAxXG4gICAgfSk7XG4gICAgY29uc3QgbWF4U2NhbiA9IE1hdGgubWluKHJvd3MubGVuZ3RoLCAyMCk7XG4gICAgbGV0IGJlc3RSb3cgPSAwO1xuICAgIGxldCBiZXN0U2NvcmUgPSAwO1xuICAgIGxldCBiZXN0SGVhZGVycyA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBtYXhTY2FuOyBpKyspe1xuICAgICAgICBjb25zdCByb3cgPSByb3dzW2ldID8/IFtdO1xuICAgICAgICBjb25zdCBub25FbXB0eSA9IHJvdy5maWx0ZXIoKGMpPT5jICE9PSAnJyAmJiBjICE9PSB1bmRlZmluZWQgJiYgYyAhPT0gbnVsbCk7XG4gICAgICAgIGNvbnN0IG5vbkVtcHR5Q291bnQgPSBub25FbXB0eS5sZW5ndGg7XG4gICAgICAgIGlmIChub25FbXB0eUNvdW50ID09PSAwKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZmlyc3RDZWxsID0gU3RyaW5nKHJvd1swXSA/PyAnJykudHJpbSgpO1xuICAgICAgICBpZiAobm9uRW1wdHlDb3VudCA8PSAyICYmIFRJVExFX0tFWVdPUkRTLnRlc3QoZmlyc3RDZWxsKSkgY29udGludWU7XG4gICAgICAgIGxldCBoZWFkZXJMaWtlQ291bnQgPSAwO1xuICAgICAgICBsZXQgbnVtZXJpY0NvdW50ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIG5vbkVtcHR5KXtcbiAgICAgICAgICAgIGNvbnN0IHN0ciA9IFN0cmluZyhjZWxsKTtcbiAgICAgICAgICAgIGlmIChzdHIgPT09ICcjTi9BJyB8fCBzdHIgPT09ICcjUkVGIScgfHwgc3RyID09PSAnI1ZBTFVFIScpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKGNlbGwpO1xuICAgICAgICAgICAgY29uc3QgaXNOdW1lcmljID0gdHlwZW9mIGNlbGwgPT09ICdudW1iZXInIHx8IHR5cGVvZiBjZWxsID09PSAnc3RyaW5nJyAmJiAvXltcXGQsLlxcLV0rJC8udGVzdChzdHIudHJpbSgpKSAmJiBpc0Zpbml0ZShudW0pO1xuICAgICAgICAgICAgaWYgKGlzTnVtZXJpYyAmJiBNYXRoLmFicyhudW0pID4gMCkgbnVtZXJpY0NvdW50Kys7XG4gICAgICAgICAgICBlbHNlIGlmIChIRUFERVJfS0VZV09SRFMudGVzdChzdHIpKSBoZWFkZXJMaWtlQ291bnQrKztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0UmF0aW8gPSBub25FbXB0eUNvdW50ID4gMCA/IChub25FbXB0eUNvdW50IC0gbnVtZXJpY0NvdW50KSAvIG5vbkVtcHR5Q291bnQgOiAwO1xuICAgICAgICBjb25zdCBzY29yZSA9IGhlYWRlckxpa2VDb3VudCAqIDMgKyB0ZXh0UmF0aW8gKiAyICsgKG5vbkVtcHR5Q291bnQgPj0gMyA/IDEgOiAwKTtcbiAgICAgICAgaWYgKHNjb3JlID4gYmVzdFNjb3JlKSB7XG4gICAgICAgICAgICBiZXN0U2NvcmUgPSBzY29yZTtcbiAgICAgICAgICAgIGJlc3RSb3cgPSBpO1xuICAgICAgICAgICAgYmVzdEhlYWRlcnMgPSByb3cubWFwKChjKT0+U3RyaW5nKGMgPz8gJycpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYmVzdFNjb3JlIDwgMiAmJiByb3dzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgZmlyc3RSb3cgPSAocm93c1swXSA/PyBbXSkubWFwKChjKT0+U3RyaW5nKGMgPz8gJycpKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhlYWRlclJvdzogMSxcbiAgICAgICAgICAgIGhlYWRlcnM6IGZpcnN0Um93XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGhlYWRlclJvdzogYmVzdFJvdyArIDEsXG4gICAgICAgIGhlYWRlcnM6IGJlc3RIZWFkZXJzXG4gICAgfTtcbn1cbi8qKlxuICogQnVpbGQgdGhlIGRlZHVwbGljYXRlZCBEQiBjb2x1bW4ga2V5cyBmb3IgYSBoZWFkZXIgcm93IChcIlRvdGFsXCIsIFwiVG90YWxfMlwiLFxuICogZW1wdHkgaGVhZGVycyBiZWNvbWUgXCJfX2hpZGRlbl88bj5cIikgXHUyMDE0IGlkZW50aWNhbCB0byB0aGUgc2hlZXQtZGF0YSBHRVQuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ29sdW1uS2V5cyhoZWFkZXJzKSB7XG4gICAgY29uc3Qgc2VlbiA9IG5ldyBNYXAoKTtcbiAgICBsZXQgZW1wdHlDb2xJZHggPSAwO1xuICAgIHJldHVybiBoZWFkZXJzLm1hcCgoaCk9PntcbiAgICAgICAgY29uc3QgdHJpbW1lZCA9IChoIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgaWYgKCF0cmltbWVkKSByZXR1cm4gYF9faGlkZGVuXyR7ZW1wdHlDb2xJZHgrK31gO1xuICAgICAgICBjb25zdCBjb3VudCA9IHNlZW4uZ2V0KHRyaW1tZWQpID8/IDA7XG4gICAgICAgIHNlZW4uc2V0KHRyaW1tZWQsIGNvdW50ICsgMSk7XG4gICAgICAgIHJldHVybiBjb3VudCA+IDAgPyBgJHt0cmltbWVkfV8ke2NvdW50fWAgOiB0cmltbWVkO1xuICAgIH0pO1xufVxuLyoqXG4gKiBNYXAgYW4gRXhjZWwgY2VsbCBhZGRyZXNzIHRvIHRoZSBEQi1zaGVldCBjb29yZGluYXRlcy5cbiAqXG4gKiBAcGFyYW0gd3MgICAgICAgICAgdGhlIHdvcmtzaGVldCB0aGUgYWRkcmVzcyBiZWxvbmdzIHRvXG4gKiBAcGFyYW0gYWRkciAgICAgICAgQTEtc3R5bGUgYWRkcmVzcyAoXCJWNDZcIiwgXCIkQSQxXCIpXG4gKiBAcGFyYW0gaGVhZGVySW5mbyAgcHJlY29tcHV0ZWQgZmluZEhlYWRlclJvdyh3cykgcmVzdWx0IChyZWNvbXB1dGVkIHBlciBjYWxsXG4gKiAgICAgICAgICAgICAgICAgICAgaWYgb21pdHRlZCBcdTIwMTQgcGFzcyBpdCB3aGVuIG1hcHBpbmcgbWFueSBjZWxscylcbiAqLyBleHBvcnQgZnVuY3Rpb24gbWFwQ2VsbFRvRGF0YSh3cywgYWRkciwgaGVhZGVySW5mbykge1xuICAgIGNvbnN0IGNsZWFuID0gYWRkci5yZXBsYWNlKC9cXCQvZywgJycpO1xuICAgIGNvbnN0IGRlY29kZWQgPSB1dGlscy5kZWNvZGVfY2VsbChjbGVhbik7XG4gICAgY29uc3QgaW5mbyA9IGhlYWRlckluZm8gPz8gZmluZEhlYWRlclJvdyh3cyk7XG4gICAgLy8gRmlyc3QgZGF0YSByb3cgPSBoZWFkZXJSb3cgKyAxIFx1MjE5MiAxLWJhc2VkIGRhdGEgb2Zmc2V0OyByb3dzIGF0L2Fib3ZlIHRoZVxuICAgIC8vIGhlYWRlciAodGl0bGUgcm93cykgZ2V0IHJlbFJvdyA8PSAwIC8gdW5kZWZpbmVkICh0aGV5IGFyZSBub3QgZGF0YSkuXG4gICAgY29uc3QgcmVsUm93ID0gZGVjb2RlZC5yIC0gaW5mby5oZWFkZXJSb3cgKyAxO1xuICAgIGNvbnN0IGNvbHVtbktleXMgPSBidWlsZENvbHVtbktleXMoaW5mby5oZWFkZXJzKTtcbiAgICBjb25zdCByYXdIZWFkZXIgPSBpbmZvLmhlYWRlcnNbZGVjb2RlZC5jXSA/PyAnJztcbiAgICBjb25zdCBjb2xLZXkgPSByYXdIZWFkZXIudHJpbSgpID8gY29sdW1uS2V5c1tkZWNvZGVkLmNdIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbEtleSxcbiAgICAgICAgcmVsUm93OiByZWxSb3cgPj0gMSA/IHJlbFJvdyA6IHVuZGVmaW5lZCxcbiAgICAgICAgYWJzUm93OiBkZWNvZGVkLnIgKyAxLFxuICAgICAgICBhYnNDb2w6IGRlY29kZWQuYyArIDFcbiAgICB9O1xufVxuIiwgIi8qKlxuICogU2VyZGUgY29tcGxpYW5jZSBjaGVja2VyIGZvciB3b3JrZmxvdyBjdXN0b20gY2xhc3Mgc2VyaWFsaXphdGlvbi5cbiAqXG4gKiBBbmFseXplcyBzb3VyY2UgY29kZSB0byBkZXRlcm1pbmUgaWYgY2xhc3NlcyB3aXRoIFdPUktGTE9XX1NFUklBTElaRSAvXG4gKiBXT1JLRkxPV19ERVNFUklBTElaRSBhcmUgY29ycmVjdGx5IHNldCB1cCBmb3IgdGhlIHdvcmtmbG93IHNhbmRib3guXG4gKlxuICogVXNlZCBieTpcbiAqIC0gQ0xJIGB2YWxpZGF0ZWAgY29tbWFuZFxuICogLSBDTEkgYHRyYW5zZm9ybWAgY29tbWFuZCAoLS1jaGVjay1zZXJkZSlcbiAqIC0gU1dDIHBsYXlncm91bmQgc2VyZGUgYW5hbHlzaXMgcGFuZWxcbiAqIC0gQnVpbGQtdGltZSB3YXJuaW5ncyBpbiBCYXNlQnVpbGRlclxuICovXG5cbmltcG9ydCBidWlsdGluTW9kdWxlcyBmcm9tICdidWlsdGluLW1vZHVsZXMnO1xuaW1wb3J0IHR5cGUgeyBXb3JrZmxvd01hbmlmZXN0IH0gZnJvbSAnLi9hcHBseS1zd2MtdHJhbnNmb3JtLmpzJztcblxuLy8gQnVpbGQgYSByZWdleCB0aGF0IG1hdGNoZXMgTm9kZS5qcyBidWlsdC1pbiBtb2R1bGUgaW1wb3J0cyBpbiB0cmFuc2Zvcm1lZCBjb2RlLlxuLy8gSGFuZGxlcyBib3RoIEVTTSAoYGZyb20gJ2ZzJ2AsIGBmcm9tICdub2RlOmZzJ2ApIGFuZCBDSlMgKGByZXF1aXJlKCdmcycpYClcbmNvbnN0IG5vZGVCdWlsdGlucyA9IGJ1aWx0aW5Nb2R1bGVzLmpvaW4oJ3wnKTtcblxuLy8gUmVnZXggdG8gZXh0cmFjdCBzcGVjaWZpYyBtb2R1bGUgbmFtZXMgZnJvbSBpbXBvcnQvcmVxdWlyZSBzdGF0ZW1lbnRzXG5jb25zdCBub2RlSW1wb3J0RXh0cmFjdFJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgYCg/OmZyb21cXFxccytbJ1wiXSg/Om5vZGU6KT8oKD86JHtub2RlQnVpbHRpbnN9KSg/Oi9bXidcIl0qKT8pWydcIl1gICtcbiAgICBgfHJlcXVpcmVcXFxccypcXFxcKFxcXFxzKlsnXCJdKD86bm9kZTopPygoPzoke25vZGVCdWlsdGluc30pKD86L1teJ1wiXSopPylbJ1wiXVxcXFxzKlxcXFwpKWAsXG4gICdnJ1xuKTtcblxuLy8gUmVnZXggdG8gZGV0ZWN0IGNsYXNzIHJlZ2lzdHJhdGlvbiBJSUZFcyBnZW5lcmF0ZWQgYnkgdGhlIFNXQyBwbHVnaW5cbmNvbnN0IHJlZ2lzdHJhdGlvbklpZmVSZWdleCA9XG4gIC9TeW1ib2xcXC5mb3JcXHMqXFwoXFxzKltcIiddd29ya2Zsb3ctY2xhc3MtcmVnaXN0cnlbXCInXVxccypcXCkvO1xuXG4vKipcbiAqIFJlc3VsdCBvZiBjaGVja2luZyBhIHNpbmdsZSBjbGFzcyBmb3Igc2VyZGUgY29tcGxpYW5jZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJkZUNsYXNzQ2hlY2tSZXN1bHQge1xuICAvKiogVGhlIGNsYXNzIG5hbWUgYXMgZGV0ZWN0ZWQgaW4gdGhlIHNvdXJjZSAqL1xuICBjbGFzc05hbWU6IHN0cmluZztcbiAgLyoqIFRoZSBjbGFzc0lkIGFzc2lnbmVkIGJ5IHRoZSBTV0MgcGx1Z2luIChmcm9tIHRoZSBtYW5pZmVzdCkgKi9cbiAgY2xhc3NJZDogc3RyaW5nO1xuICAvKiogV2hldGhlciB0aGUgU1dDIHBsdWdpbiBkZXRlY3RlZCBzZXJkZSBzeW1ib2xzIG9uIHRoaXMgY2xhc3MgKi9cbiAgZGV0ZWN0ZWQ6IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIGEgcmVnaXN0cmF0aW9uIElJRkUgd2FzIGdlbmVyYXRlZCBpbiB0aGUgb3V0cHV0ICovXG4gIHJlZ2lzdGVyZWQ6IGJvb2xlYW47XG4gIC8qKlxuICAgKiBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBpbXBvcnRzIHJlbWFpbmluZyBpbiB0aGUgd29ya2Zsb3ctbW9kZSBvdXRwdXQuXG4gICAqIElmIG5vbi1lbXB0eSwgdGhlIGNsYXNzIGlzIE5PVCB3b3JrZmxvdy1zYW5kYm94IGNvbXBsaWFudC5cbiAgICovXG4gIG5vZGVJbXBvcnRzOiBzdHJpbmdbXTtcbiAgLyoqIFdoZXRoZXIgdGhlIGNsYXNzIHBhc3NlcyBhbGwgY29tcGxpYW5jZSBjaGVja3MgKi9cbiAgY29tcGxpYW50OiBib29sZWFuO1xuICAvKiogSHVtYW4tcmVhZGFibGUgZGVzY3JpcHRpb25zIG9mIGFueSBpc3N1ZXMgZm91bmQgKi9cbiAgaXNzdWVzOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBGdWxsIHJlc3VsdCBvZiBzZXJkZSBjb21wbGlhbmNlIGFuYWx5c2lzIGZvciBhIHNvdXJjZSBmaWxlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlcmRlQ2hlY2tSZXN1bHQge1xuICAvKiogUGVyLWNsYXNzIGFuYWx5c2lzIHJlc3VsdHMgKi9cbiAgY2xhc3NlczogU2VyZGVDbGFzc0NoZWNrUmVzdWx0W107XG4gIC8qKiBBbGwgTm9kZS5qcyBidWlsdC1pbiBpbXBvcnRzIGZvdW5kIGluIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dCAqL1xuICBnbG9iYWxOb2RlSW1wb3J0czogc3RyaW5nW107XG4gIC8qKiBXaGV0aGVyIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dCBjb250YWlucyBhbnkgc2VyZGUtcmVsYXRlZCBjbGFzc2VzICovXG4gIGhhc1NlcmRlQ2xhc3NlczogYm9vbGVhbjtcbiAgLyoqIFRoZSByYXcgd29ya2Zsb3cgbWFuaWZlc3QgZXh0cmFjdGVkIGZyb20gdGhlIFNXQyB0cmFuc2Zvcm0gKi9cbiAgbWFuaWZlc3Q6IFdvcmtmbG93TWFuaWZlc3Q7XG59XG5cbi8qKlxuICogTGlnaHR3ZWlnaHQgc2VyZGUgY29tcGxpYW5jZSBjaGVja2VyIHRoYXQgd29ya3Mgd2l0aCBwcmUtY29tcHV0ZWRcbiAqIFNXQyB0cmFuc2Zvcm0gcmVzdWx0cy4gVGhpcyBhdm9pZHMgcmUtcnVubmluZyB0aGUgU1dDIHRyYW5zZm9ybVxuICogd2hlbiB0aGUgY2FsbGVyIGFscmVhZHkgaGFzIHRoZSBvdXRwdXRzIChlLmcuLCB0aGUgcGxheWdyb3VuZCBvciBidWlsZGVyKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuYWx5emVTZXJkZUNvbXBsaWFuY2Uob3B0aW9uczoge1xuICAvKiogU291cmNlIGNvZGUgKHVzZWQgZm9yIHBhdHRlcm4gZGV0ZWN0aW9uKSAqL1xuICBzb3VyY2VDb2RlOiBzdHJpbmc7XG4gIC8qKiBXb3JrZmxvdy1tb2RlIHRyYW5zZm9ybWVkIG91dHB1dCAqL1xuICB3b3JrZmxvd0NvZGU6IHN0cmluZztcbiAgLyoqIE1hbmlmZXN0IGV4dHJhY3RlZCBmcm9tIHRoZSBTV0MgdHJhbnNmb3JtICovXG4gIG1hbmlmZXN0OiBXb3JrZmxvd01hbmlmZXN0O1xufSk6IFNlcmRlQ2hlY2tSZXN1bHQge1xuICBjb25zdCB7IHNvdXJjZUNvZGUsIHdvcmtmbG93Q29kZSwgbWFuaWZlc3QgfSA9IG9wdGlvbnM7XG5cbiAgLy8gMS4gRXh0cmFjdCBhbGwgTm9kZS5qcyBidWlsdC1pbiBpbXBvcnRzIGZyb20gdGhlIHdvcmtmbG93IG91dHB1dFxuICBjb25zdCBnbG9iYWxOb2RlSW1wb3J0cyA9IGV4dHJhY3ROb2RlSW1wb3J0cyh3b3JrZmxvd0NvZGUpO1xuXG4gIC8vIDIuIENoZWNrIGlmIHRoZSBtYW5pZmVzdCBjb250YWlucyBhbnkgc2VyZGUtcmVnaXN0ZXJlZCBjbGFzc2VzXG4gIGNvbnN0IGNsYXNzRW50cmllcyA9IGV4dHJhY3RDbGFzc0VudHJpZXMobWFuaWZlc3QpO1xuICBjb25zdCBoYXNTZXJkZUNsYXNzZXMgPSBjbGFzc0VudHJpZXMubGVuZ3RoID4gMDtcblxuICAvLyAzLiBDaGVjayBpZiB0aGUgd29ya2Zsb3cgb3V0cHV0IGNvbnRhaW5zIHJlZ2lzdHJhdGlvbiBJSUZFc1xuICBjb25zdCBoYXNSZWdpc3RyYXRpb24gPSByZWdpc3RyYXRpb25JaWZlUmVnZXgudGVzdCh3b3JrZmxvd0NvZGUpO1xuXG4gIC8vIDQuIEFuYWx5emUgZWFjaCBjbGFzc1xuICBjb25zdCBjbGFzc2VzOiBTZXJkZUNsYXNzQ2hlY2tSZXN1bHRbXSA9IGNsYXNzRW50cmllcy5tYXAoKGVudHJ5KSA9PiB7XG4gICAgY29uc3QgaXNzdWVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8gQ2hlY2sgZm9yIE5vZGUuanMgaW1wb3J0cyAodGhlc2Ugd2lsbCBmYWlsIGluIHRoZSB3b3JrZmxvdyBzYW5kYm94KVxuICAgIGlmIChnbG9iYWxOb2RlSW1wb3J0cy5sZW5ndGggPiAwKSB7XG4gICAgICBpc3N1ZXMucHVzaChcbiAgICAgICAgYFdvcmtmbG93IGJ1bmRsZSBjb250YWlucyBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHM6ICR7Z2xvYmFsTm9kZUltcG9ydHMuam9pbignLCAnKX0uIGAgK1xuICAgICAgICAgIGBUaGVzZSB3aWxsIGZhaWwgYXQgcnVudGltZSBpbiB0aGUgd29ya2Zsb3cgc2FuZGJveC4gYCArXG4gICAgICAgICAgYEFkZCBcInVzZSBzdGVwXCIgdG8gbWV0aG9kcyB0aGF0IGRlcGVuZCBvbiBOb2RlLmpzIEFQSXMgc28gdGhleSBhcmUgc3RyaXBwZWQgZnJvbSB0aGUgd29ya2Zsb3cgYnVuZGxlLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHJlZ2lzdHJhdGlvblxuICAgIGlmICghaGFzUmVnaXN0cmF0aW9uKSB7XG4gICAgICBpc3N1ZXMucHVzaChcbiAgICAgICAgYE5vIGNsYXNzIHJlZ2lzdHJhdGlvbiBJSUZFIHdhcyBnZW5lcmF0ZWQuIGAgK1xuICAgICAgICAgIGBFbnN1cmUgV09SS0ZMT1dfU0VSSUFMSVpFIGFuZCBXT1JLRkxPV19ERVNFUklBTElaRSBhcmUgZGVmaW5lZCBhcyBzdGF0aWMgbWV0aG9kcyBgICtcbiAgICAgICAgICBgaW5zaWRlIHRoZSBjbGFzcyBib2R5IHVzaW5nIGNvbXB1dGVkIHByb3BlcnR5IHN5bnRheDogc3RhdGljIFtXT1JLRkxPV19TRVJJQUxJWkVdKC4uLikgeyAuLi4gfWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNsYXNzTmFtZTogZW50cnkuY2xhc3NOYW1lLFxuICAgICAgY2xhc3NJZDogZW50cnkuY2xhc3NJZCxcbiAgICAgIGRldGVjdGVkOiB0cnVlLFxuICAgICAgcmVnaXN0ZXJlZDogaGFzUmVnaXN0cmF0aW9uLFxuICAgICAgbm9kZUltcG9ydHM6IGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgICAgY29tcGxpYW50OiBnbG9iYWxOb2RlSW1wb3J0cy5sZW5ndGggPT09IDAgJiYgaGFzUmVnaXN0cmF0aW9uLFxuICAgICAgaXNzdWVzLFxuICAgIH07XG4gIH0pO1xuXG4gIC8vIDUuIENoZWNrIGZvciBjbGFzc2VzIHRoYXQgaGF2ZSBzZXJkZSBwYXR0ZXJucyBpbiBzb3VyY2UgYnV0IHdlcmVuJ3QgZGV0ZWN0ZWQgYnkgU1dDXG4gIGNvbnN0IHNvdXJjZUhhc1NlcmRlUGF0dGVybnMgPVxuICAgIC9cXFtcXHMqV09SS0ZMT1dfKD86U0VSSUFMSVpFfERFU0VSSUFMSVpFKVxccypcXF0vLnRlc3Qoc291cmNlQ29kZSkgfHxcbiAgICAvU3ltYm9sXFwuZm9yXFxzKlxcKFxccypbJ1wiXXdvcmtmbG93LSg/OnNlcmlhbGl6ZXxkZXNlcmlhbGl6ZSlbJ1wiXVxccypcXCkvLnRlc3QoXG4gICAgICBzb3VyY2VDb2RlXG4gICAgKTtcblxuICBpZiAoc291cmNlSGFzU2VyZGVQYXR0ZXJucyAmJiBjbGFzc0VudHJpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgY2xhc3Nlcy5wdXNoKHtcbiAgICAgIGNsYXNzTmFtZTogJzx1bmtub3duPicsXG4gICAgICBjbGFzc0lkOiAnJyxcbiAgICAgIGRldGVjdGVkOiBmYWxzZSxcbiAgICAgIHJlZ2lzdGVyZWQ6IGZhbHNlLFxuICAgICAgbm9kZUltcG9ydHM6IGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgICAgY29tcGxpYW50OiBmYWxzZSxcbiAgICAgIGlzc3VlczogW1xuICAgICAgICBgU291cmNlIGNvZGUgY29udGFpbnMgV09SS0ZMT1dfU0VSSUFMSVpFL1dPUktGTE9XX0RFU0VSSUFMSVpFIHBhdHRlcm5zIGJ1dCBgICtcbiAgICAgICAgICBgdGhlIFNXQyBwbHVnaW4gZGlkIG5vdCBkZXRlY3QgYW55IHNlcmRlLWVuYWJsZWQgY2xhc3Nlcy4gYCArXG4gICAgICAgICAgYEVuc3VyZSB0aGUgc3ltYm9scyBhcmUgZGVmaW5lZCBhcyBzdGF0aWMgbWV0aG9kcyBJTlNJREUgdGhlIGNsYXNzIGJvZHksIGAgK1xuICAgICAgICAgIGBub3QgYXNzaWduZWQgZXh0ZXJuYWxseSAoZS5nLiwgKE15Q2xhc3MgYXMgYW55KVtXT1JLRkxPV19TRVJJQUxJWkVdID0gLi4uKS5gLFxuICAgICAgXSxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2xhc3NlcyxcbiAgICBnbG9iYWxOb2RlSW1wb3J0cyxcbiAgICBoYXNTZXJkZUNsYXNzZXMsXG4gICAgbWFuaWZlc3QsXG4gIH07XG59XG5cbi8qKlxuICogRXh0cmFjdCBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBuYW1lcyBmcm9tIHRyYW5zZm9ybWVkIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3ROb2RlSW1wb3J0cyhjb2RlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGltcG9ydHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgLy8gUmVzZXQgcmVnZXggc3RhdGVcbiAgbm9kZUltcG9ydEV4dHJhY3RSZWdleC5sYXN0SW5kZXggPSAwO1xuICBmb3IgKFxuICAgIGxldCBtYXRjaCA9IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXguZXhlYyhjb2RlKTtcbiAgICBtYXRjaCAhPT0gbnVsbDtcbiAgICBtYXRjaCA9IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXguZXhlYyhjb2RlKVxuICApIHtcbiAgICAvLyBtYXRjaFsxXSBpcyBmcm9tIHRoZSBFU00gcGF0dGVybiwgbWF0Y2hbMl0gaXMgZnJvbSB0aGUgQ0pTIHBhdHRlcm5cbiAgICBjb25zdCBtb2R1bGVOYW1lID0gbWF0Y2hbMV0gfHwgbWF0Y2hbMl07XG4gICAgaWYgKG1vZHVsZU5hbWUpIHtcbiAgICAgIC8vIE5vcm1hbGl6ZSB0byBiYXNlIG1vZHVsZSBuYW1lIChlLmcuLCAnZnMvcHJvbWlzZXMnIC0+ICdmcycpXG4gICAgICBpbXBvcnRzLmFkZChtb2R1bGVOYW1lLnNwbGl0KCcvJylbMF0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gWy4uLmltcG9ydHNdLnNvcnQoKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IGNsYXNzIGVudHJpZXMgZnJvbSBhIFdvcmtmbG93TWFuaWZlc3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0Q2xhc3NFbnRyaWVzKFxuICBtYW5pZmVzdDogV29ya2Zsb3dNYW5pZmVzdFxuKTogQXJyYXk8eyBjbGFzc05hbWU6IHN0cmluZzsgY2xhc3NJZDogc3RyaW5nOyBmaWxlTmFtZTogc3RyaW5nIH0+IHtcbiAgY29uc3QgZW50cmllczogQXJyYXk8e1xuICAgIGNsYXNzTmFtZTogc3RyaW5nO1xuICAgIGNsYXNzSWQ6IHN0cmluZztcbiAgICBmaWxlTmFtZTogc3RyaW5nO1xuICB9PiA9IFtdO1xuICBpZiAoIW1hbmlmZXN0LmNsYXNzZXMpIHJldHVybiBlbnRyaWVzO1xuXG4gIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjbGFzc2VzXSBvZiBPYmplY3QuZW50cmllcyhtYW5pZmVzdC5jbGFzc2VzKSkge1xuICAgIGZvciAoY29uc3QgW2NsYXNzTmFtZSwgeyBjbGFzc0lkIH1dIG9mIE9iamVjdC5lbnRyaWVzKGNsYXNzZXMpKSB7XG4gICAgICBlbnRyaWVzLnB1c2goeyBjbGFzc05hbWUsIGNsYXNzSWQsIGZpbGVOYW1lIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZW50cmllcztcbn1cbiIsICJpbXBvcnQge1xuICBDb3JydXB0ZWRFdmVudExvZ0Vycm9yLFxuICBFbnRpdHlDb25mbGljdEVycm9yLFxuICBQcmVjb25kaXRpb25GYWlsZWRFcnJvcixcbiAgUmVwbGF5RGl2ZXJnZW5jZUVycm9yLFxuICBSVU5fRVJST1JfQ09ERVMsXG4gIFJ1bkV4cGlyZWRFcnJvcixcbiAgV29ya2Zsb3dSdW50aW1lRXJyb3IsXG59IGZyb20gJ0B3b3JrZmxvdy9lcnJvcnMnO1xuaW1wb3J0IHsgc2V0V29ya2Zsb3dCYXNlUGF0aCB9IGZyb20gJ0B3b3JrZmxvdy91dGlscyc7XG5pbXBvcnQgeyBwYXJzZVdvcmtmbG93TmFtZSB9IGZyb20gJ0B3b3JrZmxvdy91dGlscy9wYXJzZS1uYW1lJztcbmltcG9ydCB7XG4gIHR5cGUgRXZlbnQsXG4gIGdldFF1ZXVlVG9waWNQcmVmaXgsXG4gIHJlc29sdmVRdWV1ZU5hbWVzcGFjZSxcbiAgU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gIFNQRUNfVkVSU0lPTl9MRUdBQ1ksXG4gIFdvcmtmbG93SW52b2tlUGF5bG9hZFNjaGVtYSxcbiAgdHlwZSBXb3JrZmxvd1J1bixcbn0gZnJvbSAnQHdvcmtmbG93L3dvcmxkJztcbmltcG9ydCB7XG4gIGNsYXNzaWZ5UnVuRXJyb3IsXG4gIGlzUmV0cnlhYmxlV29ybGRFcnJvcixcbiAgaXNXb3JsZENvbnRyYWN0RXJyb3IsXG59IGZyb20gJy4vY2xhc3NpZnktZXJyb3IuanMnO1xuaW1wb3J0IHsgaW1wb3J0S2V5IH0gZnJvbSAnLi9lbmNyeXB0aW9uLmpzJztcbmltcG9ydCB7IFdvcmtmbG93U3VzcGVuc2lvbiB9IGZyb20gJy4vZ2xvYmFsLmpzJztcbmltcG9ydCB7IHJ1bnRpbWVMb2dnZXIgfSBmcm9tICcuL2xvZ2dlci5qcyc7XG5pbXBvcnQge1xuICBNQVhfUVVFVUVfREVMSVZFUklFUyxcbiAgUkVQTEFZX0RJVkVSR0VOQ0VfTUFYX1JFVFJJRVMsXG4gIFJFUExBWV9USU1FT1VUX01BWF9SRVRSSUVTLFxuICBSRVBMQVlfVElNRU9VVF9NUyxcbn0gZnJvbSAnLi9ydW50aW1lL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQge1xuICBnZXRRdWV1ZU92ZXJoZWFkLFxuICBnZXRXb3JrZmxvd1F1ZXVlTmFtZSxcbiAgZ2V0V29ya2Zsb3dSdW5FdmVudHMsXG4gIGhhbmRsZUhlYWx0aENoZWNrTWVzc2FnZSxcbiAgdHlwZSBNdXRhYmxlRXZlbnRMb2csXG4gIHBhcnNlSGVhbHRoQ2hlY2tQYXlsb2FkLFxuICBxdWV1ZU1lc3NhZ2UsXG4gIHN0YXRlVXBkYXRlZEF0Rm9yQ3JlYXRlLFxuICB3aXRoSGVhbHRoQ2hlY2ssXG4gIHdpdGhQcmVjb25kaXRpb25SZXRyeSxcbn0gZnJvbSAnLi9ydW50aW1lL2hlbHBlcnMuanMnO1xuaW1wb3J0IHsgaGFuZGxlU3VzcGVuc2lvbiB9IGZyb20gJy4vcnVudGltZS9zdXNwZW5zaW9uLWhhbmRsZXIuanMnO1xuaW1wb3J0IHsgZ2V0V29ybGQsIGdldFdvcmxkSGFuZGxlcnMgfSBmcm9tICcuL3J1bnRpbWUvd29ybGQuanMnO1xuaW1wb3J0IHsgcmVtYXBFcnJvclN0YWNrIH0gZnJvbSAnLi9zb3VyY2UtbWFwLmpzJztcbmltcG9ydCAqIGFzIEF0dHJpYnV0ZSBmcm9tICcuL3RlbGVtZXRyeS9zZW1hbnRpYy1jb252ZW50aW9ucy5qcyc7XG5pbXBvcnQge1xuICBsaW5rVG9DdXJyZW50Q29udGV4dCxcbiAgdHJhY2UsXG4gIHdpdGhUcmFjZUNvbnRleHQsXG4gIHdpdGhXb3JrZmxvd0JhZ2dhZ2UsXG59IGZyb20gJy4vdGVsZW1ldHJ5LmpzJztcbmltcG9ydCB7IGdldEVycm9yTmFtZSwgZ2V0RXJyb3JTdGFjaywgbm9ybWFsaXplVW5rbm93bkVycm9yIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBidWlsZFdvcmtmbG93U3VzcGVuc2lvbk1lc3NhZ2UgfSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgcnVuV29ya2Zsb3cgfSBmcm9tICcuL3dvcmtmbG93LmpzJztcblxuZXhwb3J0IHR5cGUgeyBFdmVudCwgV29ya2Zsb3dSdW4gfTtcbmV4cG9ydCB7IFdvcmtmbG93U3VzcGVuc2lvbiB9IGZyb20gJy4vZ2xvYmFsLmpzJztcbmV4cG9ydCB7XG4gIHR5cGUgSGVhbHRoQ2hlY2tFbmRwb2ludCxcbiAgdHlwZSBIZWFsdGhDaGVja09wdGlvbnMsXG4gIHR5cGUgSGVhbHRoQ2hlY2tSZXN1bHQsXG4gIGhlYWx0aENoZWNrLFxufSBmcm9tICcuL3J1bnRpbWUvaGVscGVycy5qcyc7XG5leHBvcnQge1xuICBnZXRIb29rQnlUb2tlbixcbiAgcmVzdW1lSG9vayxcbiAgcmVzdW1lV2ViaG9vayxcbn0gZnJvbSAnLi9ydW50aW1lL3Jlc3VtZS1ob29rLmpzJztcbmV4cG9ydCB7XG4gIGdldFJ1bixcbiAgUnVuLFxuICB0eXBlIFdvcmtmbG93UmVhZGFibGVTdHJlYW0sXG4gIHR5cGUgV29ya2Zsb3dSZWFkYWJsZVN0cmVhbU9wdGlvbnMsXG59IGZyb20gJy4vcnVudGltZS9ydW4uanMnO1xuZXhwb3J0IHtcbiAgY2FuY2VsUnVuLFxuICBsaXN0U3RyZWFtcyxcbiAgdHlwZSBSZWFkU3RyZWFtT3B0aW9ucyxcbiAgdHlwZSBSZWNyZWF0ZVJ1bk9wdGlvbnMsXG4gIHJlYWRTdHJlYW0sXG4gIHJlY3JlYXRlUnVuRnJvbUV4aXN0aW5nLFxuICByZWVucXVldWVSdW4sXG4gIHR5cGUgU3RvcFNsZWVwT3B0aW9ucyxcbiAgdHlwZSBTdG9wU2xlZXBSZXN1bHQsXG4gIHdha2VVcFJ1bixcbn0gZnJvbSAnLi9ydW50aW1lL3J1bnMuanMnO1xuZXhwb3J0IHtcbiAgdHlwZSBTdGFydE9wdGlvbnMsXG4gIHR5cGUgU3RhcnRPcHRpb25zQmFzZSxcbiAgdHlwZSBTdGFydE9wdGlvbnNXaXRoRGVwbG95bWVudElkLFxuICB0eXBlIFN0YXJ0T3B0aW9uc1dpdGhvdXREZXBsb3ltZW50SWQsXG4gIHN0YXJ0LFxufSBmcm9tICcuL3J1bnRpbWUvc3RhcnQuanMnO1xuZXhwb3J0IHsgc3RlcEVudHJ5cG9pbnQgfSBmcm9tICcuL3J1bnRpbWUvc3RlcC1oYW5kbGVyLmpzJztcbmV4cG9ydCB7XG4gIGNyZWF0ZVdvcmxkLFxuICBnZXRXb3JsZCxcbiAgZ2V0V29ybGRIYW5kbGVycyxcbiAgc2V0V29ybGQsXG59IGZyb20gJy4vcnVudGltZS93b3JsZC5qcyc7XG5cbmZ1bmN0aW9uIGhhc1JlY29yZGVkVGVybWluYWxSdW5FdmVudChldmVudHM6IEV2ZW50W10sIHJ1bklkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgdGVybWluYWxFdmVudCA9IGV2ZW50cy5maW5kKFxuICAgIChldmVudCkgPT5cbiAgICAgIGV2ZW50LnJ1bklkID09PSBydW5JZCAmJlxuICAgICAgKGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9jb21wbGV0ZWQnIHx8XG4gICAgICAgIGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9mYWlsZWQnIHx8XG4gICAgICAgIGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9jYW5jZWxsZWQnKVxuICApO1xuXG4gIGlmICghdGVybWluYWxFdmVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAnV29ya2Zsb3cgZXZlbnQgbG9nIGFscmVhZHkgY29udGFpbnMgYSB0ZXJtaW5hbCBydW4gZXZlbnQsIHNraXBwaW5nIHJlcGxheScsXG4gICAge1xuICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICBldmVudFR5cGU6IHRlcm1pbmFsRXZlbnQuZXZlbnRUeXBlLFxuICAgICAgZXZlbnRJZDogdGVybWluYWxFdmVudC5ldmVudElkLFxuICAgIH1cbiAgKTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBjcmVhdGVzIGEgc2luZ2xlIHJvdXRlIHdoaWNoIGhhbmRsZXMgYW55IHdvcmtmbG93IGV4ZWN1dGlvblxuICogcmVxdWVzdCBhbmQgcm91dGVzIHRvIHRoZSBhcHByb3ByaWF0ZSB3b3JrZmxvdyBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gd29ya2Zsb3dDb2RlIC0gVGhlIHdvcmtmbG93IGJ1bmRsZSBjb2RlIGNvbnRhaW5pbmcgYWxsIHRoZSB3b3JrZmxvd1xuICogZnVuY3Rpb25zIGF0IHRoZSB0b3AgbGV2ZWwuXG4gKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgYXMgYSBWZXJjZWwgQVBJIHJvdXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd29ya2Zsb3dFbnRyeXBvaW50KFxuICB3b3JrZmxvd0NvZGU6IHN0cmluZyxcbiAgb3B0aW9ucz86IHsgbmFtZXNwYWNlPzogc3RyaW5nOyBiYXNlUGF0aD86IHN0cmluZyB9XG4pOiAocmVxOiBSZXF1ZXN0KSA9PiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIHNldFdvcmtmbG93QmFzZVBhdGgob3B0aW9ucz8uYmFzZVBhdGgpO1xuXG4gIGNvbnN0IG5hbWVzcGFjZSA9IHJlc29sdmVRdWV1ZU5hbWVzcGFjZShvcHRpb25zPy5uYW1lc3BhY2UpO1xuICBjb25zdCB3b3JrZmxvd1ByZWZpeCA9IGdldFF1ZXVlVG9waWNQcmVmaXgoJ3dvcmtmbG93JywgbmFtZXNwYWNlKTtcblxuICBjb25zdCB7IGNyZWF0ZVF1ZXVlSGFuZGxlciwgc3BlY1ZlcnNpb246IHdvcmxkU3BlY1ZlcnNpb24gfSA9XG4gICAgZ2V0V29ybGRIYW5kbGVycygpO1xuICBjb25zdCBoYW5kbGVyID0gY3JlYXRlUXVldWVIYW5kbGVyKFxuICAgIHdvcmtmbG93UHJlZml4LFxuICAgIGFzeW5jIChtZXNzYWdlXywgbWV0YWRhdGEpID0+IHtcbiAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYSBoZWFsdGggY2hlY2sgbWVzc2FnZVxuICAgICAgLy8gTk9URTogSGVhbHRoIGNoZWNrIG1lc3NhZ2VzIGFyZSBpbnRlbnRpb25hbGx5IHVuYXV0aGVudGljYXRlZCBmb3IgbW9uaXRvcmluZyBwdXJwb3Nlcy5cbiAgICAgIC8vIFRoZXkgb25seSB3cml0ZSBhIHNpbXBsZSBzdGF0dXMgcmVzcG9uc2UgdG8gYSBzdHJlYW0gYW5kIGRvIG5vdCBleHBvc2Ugc2Vuc2l0aXZlIGRhdGEuXG4gICAgICAvLyBUaGUgc3RyZWFtIG5hbWUgaW5jbHVkZXMgYSB1bmlxdWUgY29ycmVsYXRpb25JZCB0aGF0IG11c3QgYmUga25vd24gYnkgdGhlIGNhbGxlci5cbiAgICAgIGNvbnN0IGhlYWx0aENoZWNrID0gcGFyc2VIZWFsdGhDaGVja1BheWxvYWQobWVzc2FnZV8pO1xuICAgICAgaWYgKGhlYWx0aENoZWNrKSB7XG4gICAgICAgIGF3YWl0IGhhbmRsZUhlYWx0aENoZWNrTWVzc2FnZShcbiAgICAgICAgICBoZWFsdGhDaGVjayxcbiAgICAgICAgICAnd29ya2Zsb3cnLFxuICAgICAgICAgIHdvcmxkU3BlY1ZlcnNpb25cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7XG4gICAgICAgIHJ1bklkLFxuICAgICAgICB0cmFjZUNhcnJpZXI6IHRyYWNlQ29udGV4dCxcbiAgICAgICAgcmVxdWVzdGVkQXQsXG4gICAgICAgIHJlcGxheURpdmVyZ2VuY2UsXG4gICAgICAgIHJ1bklucHV0LFxuICAgICAgfSA9IFdvcmtmbG93SW52b2tlUGF5bG9hZFNjaGVtYS5wYXJzZShtZXNzYWdlXyk7XG4gICAgICBjb25zdCB7IHJlcXVlc3RJZCB9ID0gbWV0YWRhdGE7XG4gICAgICAvLyBFeHRyYWN0IHRoZSB3b3JrZmxvdyBuYW1lIGZyb20gdGhlIHRvcGljIG5hbWVcbiAgICAgIGNvbnN0IHdvcmtmbG93TmFtZSA9IG1ldGFkYXRhLnF1ZXVlTmFtZS5zbGljZSh3b3JrZmxvd1ByZWZpeC5sZW5ndGgpO1xuXG4gICAgICAvLyAtLS0gTWF4IGRlbGl2ZXJ5IGNoZWNrIC0tLVxuICAgICAgLy8gRW5mb3JjZSBtYXggZGVsaXZlcnkgbGltaXQgYmVmb3JlIGFueSBpbmZyYXN0cnVjdHVyZSBjYWxscy5cbiAgICAgIC8vIFRoaXMgcHJldmVudHMgcnVuYXdheSB3b3JrZmxvd3MgZnJvbSBjb25zdW1pbmcgaW5maW5pdGUgcXVldWUgZGVsaXZlcmllcy5cbiAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIHdlIHdhbnQgdG8gZG8gdGhlIG1pbmltYWwgYW1vdW50IG9mIHdvcmsgKG5vIGZldGNoaW5nXG4gICAgICAvLyBvZiB0aGUgd29ya2Zsb3cgZXZlbnRzLCBldGMuIFdlIHNpbXBseSBhdHRlbXB0IHRvIG1hcmsgdGhlIHJ1biBhcyBmYWlsZWRcbiAgICAgIC8vIGFuZCBpZiB0aGF0IGZhaWxzLCB0aGUgbWVzc2FnZSBpcyBzdGlsbCBjb25zdW1lZCBidXQgd2l0aCBhZGVxdWF0ZSBsb2dnaW5nXG4gICAgICAvLyB0aGF0IGFuIGVycm9yIG9jY3VycmVkIHByZXZlbnRpbmcgdXMgZnJvbSBmYWlsaW5nIHRoZSBydW4uXG4gICAgICBpZiAobWV0YWRhdGEuYXR0ZW1wdCA+IE1BWF9RVUVVRV9ERUxJVkVSSUVTKSB7XG4gICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgYFdvcmtmbG93IGhhbmRsZXIgZXhjZWVkZWQgbWF4IGRlbGl2ZXJpZXMgKCR7bWV0YWRhdGEuYXR0ZW1wdH0vJHtNQVhfUVVFVUVfREVMSVZFUklFU30pYCxcbiAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkLCB3b3JrZmxvd05hbWUsIGF0dGVtcHQ6IG1ldGFkYXRhLmF0dGVtcHQgfVxuICAgICAgICApO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHdvcmxkID0gZ2V0V29ybGQoKTtcbiAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgV29ya2Zsb3cgZXhjZWVkZWQgbWF4aW11bSBxdWV1ZSBkZWxpdmVyaWVzICgke21ldGFkYXRhLmF0dGVtcHR9LyR7TUFYX1FVRVVFX0RFTElWRVJJRVN9KWAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5NQVhfREVMSVZFUklFU19FWENFRURFRCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgaWYgKEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZXJyKSB8fCBSdW5FeHBpcmVkRXJyb3IuaXMoZXJyKSkge1xuICAgICAgICAgICAgLy8gUnVuIGFscmVhZHkgZmluaXNoZWQsIGNvbnN1bWUgdGhlIG1lc3NhZ2Ugc2lsZW50bHlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgIGBGYWlsZWQgdG8gbWFyayBydW4gYXMgZmFpbGVkIGFmdGVyICR7bWV0YWRhdGEuYXR0ZW1wdH0gZGVsaXZlcnkgYXR0ZW1wdHMuIGAgK1xuICAgICAgICAgICAgICBgQSBwZXJzaXN0ZW50IGVycm9yIGlzIHByZXZlbnRpbmcgdGhlIHJ1biBmcm9tIGJlaW5nIHRlcm1pbmF0ZWQuIGAgK1xuICAgICAgICAgICAgICBgVGhlIHJ1biB3aWxsIHJlbWFpbiBpbiBpdHMgY3VycmVudCBzdGF0ZSB1bnRpbCBtYW51YWxseSByZXNvbHZlZC4gYCArXG4gICAgICAgICAgICAgIGBUaGlzIGlzIG1vc3QgbGlrZWx5IGR1ZSB0byBhIHBlcnNpc3RlbnQgb3V0YWdlIG9mIHRoZSB3b3JrZmxvdyBiYWNrZW5kIGAgK1xuICAgICAgICAgICAgICBgb3IgYSBidWcgaW4gdGhlIHdvcmtmbG93IHJ1bnRpbWUgYW5kIHNob3VsZCBiZSByZXBvcnRlZCB0byB0aGUgV29ya2Zsb3cgdGVhbS5gLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgZXJyb3I6IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSxcbiAgICAgICAgICAgICAgYXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3BhbkxpbmtzID0gYXdhaXQgbGlua1RvQ3VycmVudENvbnRleHQoKTtcblxuICAgICAgLy8gLS0tIFJlcGxheSB0aW1lb3V0IGd1YXJkIC0tLVxuICAgICAgLy8gSWYgdGhlIHJlcGxheSB0YWtlcyBsb25nZXIgdGhhbiB0aGUgdGltZW91dCwgZmFpbCB0aGUgcnVuIGFuZCBleGl0LlxuICAgICAgLy8gVGhpcyBtdXN0IGJlIGxvd2VyIHRoYW4gdGhlIGZ1bmN0aW9uJ3MgbWF4RHVyYXRpb24gdG8gZW5zdXJlXG4gICAgICAvLyB0aGUgZmFpbHVyZSBpcyByZWNvcmRlZCBiZWZvcmUgdGhlIHBsYXRmb3JtIGtpbGxzIHRoZSBmdW5jdGlvbi5cbiAgICAgIGxldCByZXBsYXlUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IHVuZGVmaW5lZDtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5WRVJDRUxfVVJMICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVwbGF5VGltZW91dCA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoJ1dvcmtmbG93IHJlcGxheSBleGNlZWRlZCB0aW1lb3V0Jywge1xuICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICB0aW1lb3V0TXM6IFJFUExBWV9USU1FT1VUX01TLFxuICAgICAgICAgICAgYXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCxcbiAgICAgICAgICAgIG1heFJldHJpZXM6IFJFUExBWV9USU1FT1VUX01BWF9SRVRSSUVTLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gQWxsb3cgYSBmZXcgcmV0cmllcyBiZWZvcmUgcGVybWFuZW50bHkgZmFpbGluZyB0aGUgcnVuLlxuICAgICAgICAgIC8vIE9uIGVhcmx5IGF0dGVtcHRzLCBqdXN0IGV4aXQgc28gdGhlIHF1ZXVlIHJldHJpZXMgdGhlIG1lc3NhZ2UuXG4gICAgICAgICAgaWYgKG1ldGFkYXRhLmF0dGVtcHQgPD0gUkVQTEFZX1RJTUVPVVRfTUFYX1JFVFJJRVMpIHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgd29ybGQgPSBhd2FpdCBnZXRXb3JsZCgpO1xuICAgICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fZmFpbGVkJyxcbiAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgV29ya2Zsb3cgcmVwbGF5IGV4Y2VlZGVkIG1heGltdW0gZHVyYXRpb24gKCR7UkVQTEFZX1RJTUVPVVRfTVMgLyAxMDAwfXMpIGFmdGVyICR7bWV0YWRhdGEuYXR0ZW1wdH0gYXR0ZW1wdHNgLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLlJFUExBWV9USU1FT1VULFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBCZXN0IGVmZm9ydCDigJQgcHJvY2VzcyBleGl0cyByZWdhcmRsZXNzXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIGFsc28gcHJldmVudHMgdGhlIHJ1bnRpbWUgZnJvbSBhY2tpbmcgdGhlIHF1ZXVlIG1lc3NhZ2UsXG4gICAgICAgICAgLy8gc28gdGhlIHF1ZXVlIHdpbGwgY2FsbCBiYWNrIG9uY2UsIGFmdGVyIHdoaWNoIGEgNDEwIHdpbGwgZ2V0IGl0IHRvIGV4aXQgZWFybHkuXG4gICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9LCBSRVBMQVlfVElNRU9VVF9NUyk7XG4gICAgICAgIHJlcGxheVRpbWVvdXQudW5yZWYoKTtcbiAgICAgIH1cblxuICAgICAgLy8gSW52b2tlIHVzZXIgd29ya2Zsb3cgd2l0aGluIHRoZSBwcm9wYWdhdGVkIHRyYWNlIGNvbnRleHQgYW5kIGJhZ2dhZ2VcbiAgICAgIHJldHVybiBhd2FpdCB3aXRoVHJhY2VDb250ZXh0KHRyYWNlQ29udGV4dCwgYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBTZXQgd29ya2Zsb3cgY29udGV4dCBhcyBiYWdnYWdlIGZvciBhdXRvbWF0aWMgcHJvcGFnYXRpb25cbiAgICAgICAgcmV0dXJuIGF3YWl0IHdpdGhXb3JrZmxvd0JhZ2dhZ2UoXG4gICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCwgd29ya2Zsb3dOYW1lIH0sXG4gICAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgd29ybGQgPSBnZXRXb3JsZCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRyYWNlKFxuICAgICAgICAgICAgICBgV09SS0ZMT1cgJHt3b3JrZmxvd05hbWV9YCxcbiAgICAgICAgICAgICAgeyBsaW5rczogc3BhbkxpbmtzIH0sXG4gICAgICAgICAgICAgIGFzeW5jIChzcGFuKSA9PiB7XG4gICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dOYW1lKHdvcmtmbG93TmFtZSksXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dPcGVyYXRpb24oJ2V4ZWN1dGUnKSxcbiAgICAgICAgICAgICAgICAgIC8vIFN0YW5kYXJkIE9URUwgbWVzc2FnaW5nIGNvbnZlbnRpb25zXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuTWVzc2FnaW5nU3lzdGVtKCd2ZXJjZWwtcXVldWUnKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5NZXNzYWdpbmdEZXN0aW5hdGlvbk5hbWUobWV0YWRhdGEucXVldWVOYW1lKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5NZXNzYWdpbmdNZXNzYWdlSWQobWV0YWRhdGEubWVzc2FnZUlkKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5NZXNzYWdpbmdPcGVyYXRpb25UeXBlKCdwcm9jZXNzJyksXG4gICAgICAgICAgICAgICAgICAuLi5nZXRRdWV1ZU92ZXJoZWFkKHsgcmVxdWVzdGVkQXQgfSksXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiB2YWxpZGF0ZSBgd29ya2Zsb3dOYW1lYCBleGlzdHMgYmVmb3JlIGNvbnN1bWluZyBtZXNzYWdlP1xuXG4gICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5JZChydW5JZCksXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dUcmFjZVByb3BhZ2F0ZWQoISF0cmFjZUNvbnRleHQpLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbGV0IHdvcmtmbG93U3RhcnRlZEF0ID0gLTE7XG4gICAgICAgICAgICAgICAgbGV0IHdvcmtmbG93UnVuOiBXb3JrZmxvd1J1biB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAvLyBQcmUtbG9hZGVkIGV2ZW50cyBmcm9tIHRoZSBydW5fc3RhcnRlZCByZXNwb25zZS5cbiAgICAgICAgICAgICAgICAvLyBXaGVuIHByZXNlbnQsIHdlIHNraXAgdGhlIGV2ZW50cy5saXN0IGNhbGwuXG4gICAgICAgICAgICAgICAgbGV0IHByZWxvYWRlZEV2ZW50czogRXZlbnRbXSB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBsZXQgcHJlbG9hZGVkRXZlbnRzQ3Vyc29yOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgLy8gLS0tIEluZnJhc3RydWN0dXJlOiBwcmVwYXJlIHRoZSBydW4gc3RhdGUgLS0tXG4gICAgICAgICAgICAgICAgLy8gQWx3YXlzIGNhbGwgcnVuX3N0YXJ0ZWQgZGlyZWN0bHkg4oCUIHRoaXMgYm90aCB0cmFuc2l0aW9uc1xuICAgICAgICAgICAgICAgIC8vIHRoZSBydW4gdG8gJ3J1bm5pbmcnIEFORCByZXR1cm5zIHRoZSBydW4gZW50aXR5LCBzYXZpbmdcbiAgICAgICAgICAgICAgICAvLyBhIHNlcGFyYXRlIHJ1bnMuZ2V0IHJvdW5kLXRyaXAuXG4gICAgICAgICAgICAgICAgLy8gQ29udHJhY3Q6IGV2ZW50cy5jcmVhdGUoJ3J1bl9zdGFydGVkJykgbXVzdCBiZSBpZGVtcG90ZW50XG4gICAgICAgICAgICAgICAgLy8gZm9yIHJ1bnMgYWxyZWFkeSBpbiAncnVubmluZycgc3RhdHVzIChyZXR1cm4gdGhlIHJ1blxuICAgICAgICAgICAgICAgIC8vIHdpdGhvdXQgZXJyb3IpLCBub3QganVzdCBmb3IgcGVuZGluZyDihpIgcnVubmluZyB0cmFuc2l0aW9ucy5cbiAgICAgICAgICAgICAgICAvLyBOZXR3b3JrL3NlcnZlciBlcnJvcnMgcHJvcGFnYXRlIHRvIHRoZSBxdWV1ZSBoYW5kbGVyIGZvciByZXRyeS5cbiAgICAgICAgICAgICAgICAvLyBXb3JrZmxvd1J1bnRpbWVFcnJvciAoZGF0YSBpbnRlZ3JpdHkgaXNzdWVzKSBhcmUgZmF0YWwgYW5kXG4gICAgICAgICAgICAgICAgLy8gcHJvZHVjZSBydW5fZmFpbGVkIHNpbmNlIHJldHJ5aW5nIHdvbid0IGZpeCB0aGVtLlxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9zdGFydGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBVc2UgdGhlIHNwZWMgdmVyc2lvbiBmcm9tIHRoZSBvcmlnaW5hbCBzdGFydCgpIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAvLyB3aGVuIGF2YWlsYWJsZSwgc28gdGhlIHJlc2lsaWVudCBzdGFydCBwYXRoIGNyZWF0ZXNcbiAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgcnVuIHdpdGggdGhlIGNvcnJlY3QgdmVyc2lvbiAobm90IGFsd2F5cyBjdXJyZW50KS5cbiAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bklucHV0Py5zcGVjVmVyc2lvbiA/PyBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBQYXNzIHJ1biBpbnB1dCBmcm9tIHF1ZXVlIHNvIHRoZSBzZXJ2ZXIgY2FuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBydW4gaWYgcnVuX2NyZWF0ZWQgd2FzIG1pc3NlZC5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBVaW50OEFycmF5IHZhbHVlcyBzdXJ2aXZlIHRoZSBxdWV1ZSBuYXRpdmVseVxuICAgICAgICAgICAgICAgICAgICAgIC8vIChDQk9SIG9uIHdvcmxkLXZlcmNlbCwgSlNPTiByZXZpdmVyIG9uIHdvcmxkLWxvY2FsKS5cbiAgICAgICAgICAgICAgICAgICAgICAuLi4ocnVuSW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IHJ1bklucHV0LmlucHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95bWVudElkOiBydW5JbnB1dC5kZXBsb3ltZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd05hbWU6IHJ1bklucHV0LndvcmtmbG93TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWN1dGlvbkNvbnRleHQ6IHJ1bklucHV0LmV4ZWN1dGlvbkNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB7fSksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5ydW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgIGBFdmVudCBjcmVhdGlvbiBmb3IgJ3J1bl9zdGFydGVkJyBkaWQgbm90IHJldHVybiB0aGUgcnVuIGVudGl0eSBmb3IgcnVuIFwiJHtydW5JZH1cImBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuID0gcmVzdWx0LnJ1bjtcblxuICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJlc3BvbnNlIGluY2x1ZGVzIGV2ZW50cywgdXNlIHRoZW0gdG8gc2tpcFxuICAgICAgICAgICAgICAgICAgLy8gdGhlIGluaXRpYWwgZXZlbnRzLmxpc3QgY2FsbCBhbmQgcmVkdWNlIFRURkIuXG4gICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ldmVudHMgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmV2ZW50cy5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5oYXNNb3JlICE9PSB0cnVlXG4gICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZGVkRXZlbnRzID0gcmVzdWx0LmV2ZW50cztcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZGVkRXZlbnRzQ3Vyc29yID0gcmVzdWx0LmN1cnNvcjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYgKCF3b3JrZmxvd1J1bi5zdGFydGVkQXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgIGBXb3JrZmxvdyBydW4gXCIke3J1bklkfVwiIGhhcyBubyBcInN0YXJ0ZWRBdFwiIHRpbWVzdGFtcGBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFJ1biB3YXMgY29uY3VycmVudGx5IGNvbXBsZXRlZC9mYWlsZWQvY2FuY2VsbGVkXG4gICAgICAgICAgICAgICAgICBpZiAoRW50aXR5Q29uZmxpY3RFcnJvci5pcyhlcnIpIHx8IFJ1bkV4cGlyZWRFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEVudGl0eUNvbmZsaWN0RXJyb3I6IHJ1biB3YXMgY29uY3VycmVudGx5XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbXBsZXRlZC9mYWlsZWQvY2FuY2VsbGVkIGR1cmluZyBzZXR1cC5cbiAgICAgICAgICAgICAgICAgICAgLy8gUnVuRXhwaXJlZEVycm9yOiBydW4gYWxyZWFkeSBpbiB0ZXJtaW5hbCBzdGF0ZS5cbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gYm90aCBjYXNlcywgc2tpcCBwcm9jZXNzaW5nIHRoaXMgbWVzc2FnZS5cbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICdSdW4gYWxyZWFkeSBmaW5pc2hlZCBkdXJpbmcgc2V0dXAsIHNraXBwaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkLCBtZXNzYWdlOiBlcnIubWVzc2FnZSB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyIGluc3RhbmNlb2YgV29ya2Zsb3dSdW50aW1lRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgcnVudGltZSBlcnJvciBkdXJpbmcgd29ya2Zsb3cgc2V0dXAnLFxuICAgICAgICAgICAgICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQsIGVycm9yOiBlcnIubWVzc2FnZSB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fZmFpbGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogZXJyLnN0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuUlVOVElNRV9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZmFpbEVycikge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZmFpbEVycikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJ1bkV4cGlyZWRFcnJvci5pcyhmYWlsRXJyKVxuICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZmFpbEVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSByZWNvcmRpbmcgd29ya2Zsb3cgZmFpbHVyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxFcnIgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZhaWxFcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhmYWlsRXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZmFpbEVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzV29ybGRDb250cmFjdEVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgd29ybGQgY29udHJhY3QgZXJyb3IgZHVyaW5nIHdvcmtmbG93IHNldHVwJyxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZmFpbEVycikge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZmFpbEVycikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJ1bkV4cGlyZWRFcnJvci5pcyhmYWlsRXJyKVxuICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZmFpbEVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSByZWNvcmRpbmcgd29ya2Zsb3cgZmFpbHVyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxFcnIgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZhaWxFcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhmYWlsRXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZmFpbEVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd29ya2Zsb3dTdGFydGVkQXQgPSArd29ya2Zsb3dSdW4uc3RhcnRlZEF0O1xuXG4gICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5TdGF0dXMod29ya2Zsb3dSdW4uc3RhdHVzKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1N0YXJ0ZWRBdCh3b3JrZmxvd1N0YXJ0ZWRBdCksXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAod29ya2Zsb3dSdW4uc3RhdHVzICE9PSAncnVubmluZycpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFdvcmtmbG93IGhhcyBhbHJlYWR5IGNvbXBsZXRlZCBvciBmYWlsZWQsIHNvIHdlIGNhbiBza2lwIGl0XG4gICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICdXb3JrZmxvdyBhbHJlYWR5IGNvbXBsZXRlZCBvciBmYWlsZWQsIHNraXBwaW5nJyxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogd29ya2Zsb3dSdW4uc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAvLyBUT0RPOiBmb3IgYGNhbmNlbGAsIHdlIGFjdHVhbGx5IHdhbnQgdG8gcHJvcGFnYXRlIGEgV29ya2Zsb3dDYW5jZWxsZWQgZXZlbnRcbiAgICAgICAgICAgICAgICAgIC8vIGluc2lkZSB0aGUgd29ya2Zsb3cgY29udGV4dCBzbyB0aGUgdXNlciBjYW4gZ3JhY2VmdWxseSBleGl0LiB0aGlzIGlzIFNJR1RFUk1cbiAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGZ1cnRoZXJtb3JlLCB0aGVyZSBzaG91bGQgYmUgYSB0aW1lb3V0IG9yIGEgd2F5IHRvIGZvcmNlIGNhbmNlbCBTSUdLSUxMXG4gICAgICAgICAgICAgICAgICAvLyBzbyB0aGF0IHdlIGFjdHVhbGx5IGV4aXQgaGVyZSB3aXRob3V0IHJlcGxheWluZyB0aGUgd29ya2Zsb3cgYXQgYWxsLCBpbiB0aGUgY2FzZVxuICAgICAgICAgICAgICAgICAgLy8gdGhlIHJlcGxheWluZyB0aGUgd29ya2Zsb3cgaXMgaXRzZWxmIGZhaWxpbmcuXG5cbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBMb2FkIGFsbCBldmVudHMgaW50byBtZW1vcnkgYmVmb3JlIHJ1bm5pbmcuXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgZ290IHByZS1sb2FkZWQgZXZlbnRzIGZyb20gdGhlIHJ1bl9zdGFydGVkIHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIC8vIHNraXAgdGhlIGV2ZW50cy5saXN0IHJvdW5kLXRyaXAgdG8gcmVkdWNlIFRURkIuXG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50czogRXZlbnRbXTtcbiAgICAgICAgICAgICAgICBsZXQgZXZlbnRzQ3Vyc29yOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBpZiAocHJlbG9hZGVkRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cyA9IHByZWxvYWRlZEV2ZW50cztcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzQ3Vyc29yID0gcHJlbG9hZGVkRXZlbnRzQ3Vyc29yO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVkRXZlbnRzID0gYXdhaXQgZ2V0V29ya2Zsb3dSdW5FdmVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWRcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzID0gbG9hZGVkRXZlbnRzLmV2ZW50cztcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzQ3Vyc29yID0gbG9hZGVkRXZlbnRzLmN1cnNvcjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIGxvYWRpbmcgd29ya2Zsb3cgZXZlbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZmFpbEVycikge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZmFpbEVycikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJ1bkV4cGlyZWRFcnJvci5pcyhmYWlsRXJyKVxuICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZmFpbEVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSByZWNvcmRpbmcgd29ya2Zsb3cgZmFpbHVyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxFcnIgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZhaWxFcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhmYWlsRXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZmFpbEVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVGhlIG1hdGVyaWFsaXplZCBydW4gcmV0dXJuZWQgYnkgcnVuX3N0YXJ0ZWQgY2FuIHJhY2UgYVxuICAgICAgICAgICAgICAgIC8vIHRlcm1pbmFsIGV2ZW50IGluIHRoZSBsb2FkZWQgc25hcHNob3QuIERvIG5vdCByZXBsYXkgYSBydW5cbiAgICAgICAgICAgICAgICAvLyB3aG9zZSBldmVudCBsb2cgYWxyZWFkeSBlc3RhYmxpc2hlcyBpdHMgdGVybWluYWwgb3V0Y29tZS5cbiAgICAgICAgICAgICAgICBpZiAoaGFzUmVjb3JkZWRUZXJtaW5hbFJ1bkV2ZW50KGV2ZW50cywgcnVuSWQpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGFueSBlbGFwc2VkIHdhaXRzIGFuZCBjcmVhdGUgd2FpdF9jb21wbGV0ZWQgZXZlbnRzXG4gICAgICAgICAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblxuICAgICAgICAgICAgICAgIC8vIFByZS1jb21wdXRlIGNvbXBsZXRlZCBjb3JyZWxhdGlvbiBJRHMgZm9yIE8obikgbG9va3VwIGluc3RlYWQgb2YgTyhuwrIpXG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGxldGVkV2FpdElkcyA9IG5ldyBTZXQoXG4gICAgICAgICAgICAgICAgICBldmVudHNcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZSkgPT4gZS5ldmVudFR5cGUgPT09ICd3YWl0X2NvbXBsZXRlZCcpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGUpID0+IGUuY29ycmVsYXRpb25JZClcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gQ29sbGVjdCBhbGwgd2FpdHMgdGhhdCBuZWVkIGNvbXBsZXRpb25cbiAgICAgICAgICAgICAgICBjb25zdCB3YWl0c1RvQ29tcGxldGUgPSBldmVudHNcbiAgICAgICAgICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICBlXG4gICAgICAgICAgICAgICAgICAgICk6IGUgaXMgRXh0cmFjdDxFdmVudCwgeyBldmVudFR5cGU6ICd3YWl0X2NyZWF0ZWQnIH0+ICYge1xuICAgICAgICAgICAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQ6IHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgfSA9PlxuICAgICAgICAgICAgICAgICAgICAgIGUuZXZlbnRUeXBlID09PSAnd2FpdF9jcmVhdGVkJyAmJlxuICAgICAgICAgICAgICAgICAgICAgIGUuY29ycmVsYXRpb25JZCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgIWNvbXBsZXRlZFdhaXRJZHMuaGFzKGUuY29ycmVsYXRpb25JZCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICBub3cgPj0gKGUuZXZlbnREYXRhLnJlc3VtZUF0IGFzIERhdGUpLmdldFRpbWUoKVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgLm1hcCgoZSkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAnd2FpdF9jb21wbGV0ZWQnIGFzIGNvbnN0LFxuICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQ6IGUuY29ycmVsYXRpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdW1lQXQ6IGUuZXZlbnREYXRhLnJlc3VtZUF0LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFsbCB3YWl0X2NvbXBsZXRlZCBldmVudHNcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHdhaXRFdmVudCBvZiB3YWl0c1RvQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHdhaXRMb2c6IE11dGFibGVFdmVudExvZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6IGV2ZW50c0N1cnNvciA/PyBudWxsLFxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHdpdGhQcmVjb25kaXRpb25SZXRyeShcbiAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICB3YWl0TG9nLFxuICAgICAgICAgICAgICAgICAgICAgIChzdGF0ZVVwZGF0ZWRBdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmxkLmV2ZW50cy5jcmVhdGUocnVuSWQsIHdhaXRFdmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlVXBkYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoRW50aXR5Q29uZmxpY3RFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKCdXYWl0IGFscmVhZHkgY29tcGxldGVkLCBza2lwcGluZycsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29ycmVsYXRpb25JZDogd2FpdEV2ZW50LmNvcnJlbGF0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVsb2FkcyBpbnNpZGUgdGhlIGd1YXJkIG1heSBoYXZlIGFkdmFuY2VkIHRoZSBjdXJzb3IuXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50c0N1cnNvciA9IHdhaXRMb2cuY3Vyc29yO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh3YWl0c1RvQ29tcGxldGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhlIGV2ZW50IGxpc3QgYWJvdmUgbWF5IGJlIHN0YWxlIGJ5IHRoZSB0aW1lIGFuIGVsYXBzZWRcbiAgICAgICAgICAgICAgICAgIC8vIHdhaXQgaXMgY29tbWl0dGVkLiBMb2FkIG9ubHkgZXZlbnRzIGFmdGVyIHRoZSBvcmlnaW5hbFxuICAgICAgICAgICAgICAgICAgLy8gc25hcHNob3QgY3Vyc29yIHNvIGNvbmN1cnJlbnQgZHVyYWJsZSBldmVudHMsIHN1Y2ggYXNcbiAgICAgICAgICAgICAgICAgIC8vIGhvb2tfcmVjZWl2ZWQsIGtlZXAgdGhlaXIgb3JkZXJpbmcgcmVsYXRpdmUgdG9cbiAgICAgICAgICAgICAgICAgIC8vIHdhaXRfY29tcGxldGVkLiBGYWxsIGJhY2sgdG8gYSBmdWxsIHJlbG9hZCBmb3Igb2xkZXIgd29ybGRzXG4gICAgICAgICAgICAgICAgICAvLyB0aGF0IGNhbm5vdCBnaXZlIHVzIGEgc3RhYmxlIGN1cnNvci5cbiAgICAgICAgICAgICAgICAgIGlmIChldmVudHNDdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RXZlbnRzID0gYXdhaXQgZ2V0V29ya2Zsb3dSdW5FdmVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnRzQ3Vyc29yXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRlZFdhaXRJZHNBZnRlckN1cnNvciA9IG5ldyBTZXQoXG4gICAgICAgICAgICAgICAgICAgICAgbmV3RXZlbnRzLmV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZSkgPT4gZS5ldmVudFR5cGUgPT09ICd3YWl0X2NvbXBsZXRlZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKChlKSA9PiBlLmNvcnJlbGF0aW9uSWQpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhd0FsbFdhaXRDb21wbGV0aW9ucyA9IHdhaXRzVG9Db21wbGV0ZS5ldmVyeShcbiAgICAgICAgICAgICAgICAgICAgICAod2FpdEV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkV2FpdElkc0FmdGVyQ3Vyc29yLmhhcyh3YWl0RXZlbnQuY29ycmVsYXRpb25JZClcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2F3QWxsV2FpdENvbXBsZXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdJZHMgPSBuZXcgU2V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLm1hcCgoZXZlbnQpID0+IGV2ZW50LmV2ZW50SWQpXG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIG5ld0V2ZW50cy5ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RpbmdJZHMuaGFzKGV2ZW50LmV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nSWRzLmFkZChldmVudC5ldmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRFdmVudHMgPSBhd2FpdCBnZXRXb3JrZmxvd1J1bkV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuLnJ1bklkXG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudHMgPSBsb2FkZWRFdmVudHMuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRFdmVudHMgPSBhd2FpdCBnZXRXb3JrZmxvd1J1bkV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBldmVudHMgPSBsb2FkZWRFdmVudHMuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBBIGNvbmN1cnJlbnQgdGVybWluYWwgd3JpdGUgbWF5IGhhdmUgbGFuZGVkIHdoaWxlXG4gICAgICAgICAgICAgICAgICAvLyBjb21taXR0aW5nIGFuIGVsYXBzZWQgd2FpdCBhbmQgcmVmcmVzaGluZyB0aGUgc25hcHNob3QuXG4gICAgICAgICAgICAgICAgICBpZiAoaGFzUmVjb3JkZWRUZXJtaW5hbFJ1bkV2ZW50KGV2ZW50cywgcnVuSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBSZXNvbHZlIHRoZSBlbmNyeXB0aW9uIGtleSBmb3IgdGhpcyBydW4ncyBkZXBsb3ltZW50XG4gICAgICAgICAgICAgICAgY29uc3QgcmF3S2V5ID1cbiAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmdldEVuY3J5cHRpb25LZXlGb3JSdW4/Lih3b3JrZmxvd1J1bik7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5jcnlwdGlvbktleSA9IHJhd0tleVxuICAgICAgICAgICAgICAgICAgPyBhd2FpdCBpbXBvcnRLZXkocmF3S2V5KVxuICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAvLyAtLS0gVXNlciBjb2RlIGV4ZWN1dGlvbiAtLS1cbiAgICAgICAgICAgICAgICAvLyBPbmx5IGVycm9ycyBmcm9tIHJ1bldvcmtmbG93KCkgKHVzZXIgd29ya2Zsb3cgY29kZSkgc2hvdWxkXG4gICAgICAgICAgICAgICAgLy8gcHJvZHVjZSBydW5fZmFpbGVkLiBJbmZyYXN0cnVjdHVyZSBlcnJvcnMgKG5ldHdvcmssIHNlcnZlcilcbiAgICAgICAgICAgICAgICAvLyBtdXN0IHByb3BhZ2F0ZSB0byB0aGUgcXVldWUgaGFuZGxlciBmb3IgYXV0b21hdGljIHJldHJ5LlxuICAgICAgICAgICAgICAgIGxldCB3b3JrZmxvd1Jlc3VsdDogdW5rbm93bjtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSZXN1bHQgPSBhd2FpdCB0cmFjZShcbiAgICAgICAgICAgICAgICAgICAgJ3dvcmtmbG93LnJlcGxheScsXG4gICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICBhc3luYyAocmVwbGF5U3BhbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJlcGxheVNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXZlbnRzQ291bnQoZXZlbnRzLmxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHJ1bldvcmtmbG93KFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dDb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNyeXB0aW9uS2V5XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFdvcmtmbG93U3VzcGVuc2lvbiBpcyBub3JtYWwgY29udHJvbCBmbG93IOKAlCBub3QgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICAgIGlmIChXb3JrZmxvd1N1c3BlbnNpb24uaXMoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdXNwZW5zaW9uTWVzc2FnZSA9IGJ1aWxkV29ya2Zsb3dTdXNwZW5zaW9uTWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICBlcnIuc3RlcENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgIGVyci5ob29rQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgZXJyLndhaXRDb3VudFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3VzcGVuc2lvbk1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmRlYnVnKHN1c3BlbnNpb25NZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVhY2ggZXZlbnQgY3JlYXRpb24gaW5zaWRlIGhhbmRsZVN1c3BlbnNpb24gY2FycmllcyB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gbG9hZGVkIHNuYXBzaG90J3MgYHN0YXRlVXBkYXRlZEF0YDsgb24gYSBzdGFsZSAoNDEyKVxuICAgICAgICAgICAgICAgICAgICAvLyByZWplY3Rpb24gdGhlIGd1YXJkIHJlbG9hZHMgdGhpcyBsb2cgaW4gcGxhY2UgYW5kIHJldHJpZXMuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1c3BlbnNpb25Mb2c6IE11dGFibGVFdmVudExvZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiBldmVudHNDdXJzb3IgPz8gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdDogQXdhaXRlZDxSZXR1cm5UeXBlPHR5cGVvZiBoYW5kbGVTdXNwZW5zaW9uPj47XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgaGFuZGxlU3VzcGVuc2lvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdXNwZW5zaW9uOiBlcnIsXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bjogd29ya2Zsb3dSdW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRMb2c6IHN1c3BlbnNpb25Mb2csXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHN1c3BlbnNpb25FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBndWFyZCBleGhhdXN0ZWQgaXRzIHJlbG9hZHMgb24gYSBzdGFsZSBldmVudFxuICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0aW9uLiBTY2hlZHVsZSBhbiBleHBsaWNpdCBpbW1lZGlhdGUgcmUtaW52b2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgIC8vIChhIHJldGhyb3cgcmVsaWVzIG9uIHF1ZXVlIHJlZGVsaXZlcnkpIHNvIGEgZnJlc2hcbiAgICAgICAgICAgICAgICAgICAgICAvLyByZXBsYXkgb2JzZXJ2ZXMgdGhlIG5ld2VyIGV2ZW50LlxuICAgICAgICAgICAgICAgICAgICAgIGlmIChQcmVjb25kaXRpb25GYWlsZWRFcnJvci5pcyhzdXNwZW5zaW9uRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdTdXNwZW5zaW9uIGV2ZW50IGNyZWF0aW9uIGV4aGF1c3RlZCBwcmVjb25kaXRpb24gcmV0cmllczsgcmUtaW52b2tpbmcgd2l0aCBhIGZyZXNoIHJlcGxheScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRpbWVvdXRTZWNvbmRzOiAwIH07XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHRocm93IHN1c3BlbnNpb25FcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQudGltZW91dFNlY29uZHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRpbWVvdXRTZWNvbmRzOiByZXN1bHQudGltZW91dFNlY29uZHMgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFN1c3BlbnNpb24gaGFuZGxlZCwgbm8gZnVydGhlciB3b3JrIG5lZWRlZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIFRyYW5zaWVudCBpbmZyYXN0cnVjdHVyZSBmYWlsdXJlcyB0YWxraW5nIHRvIHRoZVxuICAgICAgICAgICAgICAgICAgLy8gd29ybGQgKHdvcmtmbG93LXNlcnZlcikg4oCUIGFuIGV4aGF1c3RlZCBSZXRyeUFnZW50XG4gICAgICAgICAgICAgICAgICAvLyAoVU5EX0VSUl9SRVFfUkVUUlkgZnJvbSBhIHN1c3RhaW5lZCA0MjkvNTAzIHN0b3JtKSxcbiAgICAgICAgICAgICAgICAgIC8vIGEgZHJvcHBlZCBzb2NrZXQsIGEgY29ubmVjdC9ETlMgZmFpbHVyZSwgb3IgYSBjbGllbnRcbiAgICAgICAgICAgICAgICAgIC8vIHRpbWVvdXQg4oCUIG11c3QgTk9UIGZhaWwgdGhlIHJ1bi4gUmV0aHJvdyBzbyB0aGUgcXVldWVcbiAgICAgICAgICAgICAgICAgIC8vIHJlZGVsaXZlcnMgYW5kIGEgZnJlc2ggaW52b2NhdGlvbiByZXRyaWVzIHRoZSByZXBsYXlcbiAgICAgICAgICAgICAgICAgIC8vIG9uY2UgdGhlIGJhY2tlbmQgcmVjb3ZlcnMuIFRoZSBAdmVyY2VsL3F1ZXVlIGhhbmRsZXJcbiAgICAgICAgICAgICAgICAgIC8vIGFwcGxpZXMgYSBmYXN0ICgxc+KGkjYwcykgYmFja29mZiBieSBkZWxpdmVyeSBjb3VudCxcbiAgICAgICAgICAgICAgICAgIC8vIGF2b2lkaW5nIHRoZSB+NW1pbiBkZWZhdWx0IHZpc2liaWxpdHktdGltZW91dCByZWRyaXZlXG4gICAgICAgICAgICAgICAgICAvLyAoYW5kIG5ldmVyIGtpbGxpbmcgdGhlIHByb2Nlc3MgdmlhIHJ1bl9mYWlsZWQpLlxuICAgICAgICAgICAgICAgICAgaWYgKGlzUmV0cnlhYmxlV29ybGRFcnJvcihlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAnVHJhbnNpZW50IHdvcmxkIGVycm9yIGR1cmluZyByZXBsYXk7IHJlZGVsaXZlcmluZyB2aWEgcXVldWUgaW5zdGVhZCBvZiBmYWlsaW5nIHRoZSBydW4nLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTmFtZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubmFtZSA6ICdVbmtub3duRXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVyciksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxpdmVyeUF0dGVtcHQ6IG1ldGFkYXRhLmF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGxldCB0ZXJtaW5hbEVycm9yID0gZXJyO1xuICAgICAgICAgICAgICAgICAgaWYgKFJlcGxheURpdmVyZ2VuY2VFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpdmVyZ2VuY2VDb3VudCA9IChyZXBsYXlEaXZlcmdlbmNlPy5jb3VudCA/PyAwKSArIDE7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpdmVyZ2VuY2VDb3VudCA8PSBSRVBMQVlfRElWRVJHRU5DRV9NQVhfUkVUUklFUykge1xuICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICdXb3JrZmxvdyByZXBsYXkgZGl2ZXJnZWQ7IHF1ZXVlaW5nIGEgcmVjb3ZlcnkgcmVwbGF5IGJlZm9yZSBkZWNsYXJpbmcgdGhlIGV2ZW50IGxvZyBjb3JydXB0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuUkVQTEFZX0RJVkVSR0VOQ0UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpdmVyZ2VuY2VFdmVudElkOiBlcnIuZXZlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpb3JEaXZlcmdlbmNlRXZlbnRJZDogcmVwbGF5RGl2ZXJnZW5jZT8uZXZlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGl2ZXJnZW5jZUNvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxpdmVyeUF0dGVtcHQ6IG1ldGFkYXRhLmF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1heFJlY292ZXJ5UmVwbGF5czogUkVQTEFZX0RJVkVSR0VOQ0VfTUFYX1JFVFJJRVMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBxdWV1ZU1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFdvcmtmbG93UXVldWVOYW1lKHdvcmtmbG93TmFtZSwgbmFtZXNwYWNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRyYWNlQ2FycmllcjogdHJhY2VDb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGF5RGl2ZXJnZW5jZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50SWQ6IGVyci5ldmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiBkaXZlcmdlbmNlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3ltZW50SWQ6IHdvcmtmbG93UnVuLmRlcGxveW1lbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4uc3BlY1ZlcnNpb24gPz8gU1BFQ19WRVJTSU9OX0xFR0FDWSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRlcm1pbmFsRXJyb3IgPSBuZXcgQ29ycnVwdGVkRXZlbnRMb2dFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgV29ya2Zsb3cgcmVwbGF5IGRpdmVyZ2VkICR7ZGl2ZXJnZW5jZUNvdW50fSB0aW1lcyBhZnRlciAke1JFUExBWV9ESVZFUkdFTkNFX01BWF9SRVRSSUVTfSByZWNvdmVyeSByZXBsYXlzOyBsYXRlc3QgZGl2ZXJnZW50IGV2ZW50IHdhcyAke2Vyci5ldmVudElkfS4gTGFzdCBkaXZlcmdlbmNlOiAke2Vyci5tZXNzYWdlfWAsXG4gICAgICAgICAgICAgICAgICAgICAgeyBjYXVzZTogZXJyIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIHVzZXIgY29kZSBlcnJvciBvciBhIHRlcm1pbmFsXG4gICAgICAgICAgICAgICAgICAvLyBXb3JrZmxvd1J1bnRpbWVFcnJvci4gRmFpbCB0aGUgd29ya2Zsb3cgcnVuLlxuXG4gICAgICAgICAgICAgICAgICAvLyBSZWNvcmQgZXhjZXB0aW9uIGZvciBPVEVMIGVycm9yIHRyYWNraW5nXG4gICAgICAgICAgICAgICAgICBpZiAodGVybWluYWxFcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwYW4/LnJlY29yZEV4Y2VwdGlvbj8uKHRlcm1pbmFsRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBjb25zdCBub3JtYWxpemVkRXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBub3JtYWxpemVVbmtub3duRXJyb3IodGVybWluYWxFcnJvcik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck5hbWUgPVxuICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkRXJyb3IubmFtZSB8fCBnZXRFcnJvck5hbWUodGVybWluYWxFcnJvcik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBub3JtYWxpemVkRXJyb3IubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgIGxldCBlcnJvclN0YWNrID1cbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZEVycm9yLnN0YWNrIHx8IGdldEVycm9yU3RhY2sodGVybWluYWxFcnJvcik7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFJlbWFwIGVycm9yIHN0YWNrIHVzaW5nIHNvdXJjZSBtYXBzIHRvIHNob3cgb3JpZ2luYWwgc291cmNlIGxvY2F0aW9uc1xuICAgICAgICAgICAgICAgICAgaWYgKGVycm9yU3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkTmFtZSA9IHBhcnNlV29ya2Zsb3dOYW1lKHdvcmtmbG93TmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVuYW1lID1cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZWROYW1lPy5tb2R1bGVTcGVjaWZpZXIgfHwgd29ya2Zsb3dOYW1lO1xuICAgICAgICAgICAgICAgICAgICBlcnJvclN0YWNrID0gcmVtYXBFcnJvclN0YWNrKFxuICAgICAgICAgICAgICAgICAgICAgIGVycm9yU3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dDb2RlXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIENsYXNzaWZ5IHRoZSBlcnJvcjogV29ya2Zsb3dSdW50aW1lRXJyb3IgaW5kaWNhdGVzXG4gICAgICAgICAgICAgICAgICAvLyBhbiBTREsvcnVudGltZSBpc3N1ZSwgYW5kIHNlbGVjdGVkIHN1YmNsYXNzZXMgdXNlXG4gICAgICAgICAgICAgICAgICAvLyBtb3JlIHNwZWNpZmljIGNvZGVzIGZvciBiYWNrZW5kIHRyYWNraW5nLlxuICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gY2xhc3NpZnlSdW5FcnJvcih0ZXJtaW5hbEVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgcnVubmluZyB3b3JrZmxvdycsIHtcbiAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JOYW1lLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclN0YWNrLFxuICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgIC8vIEZhaWwgdGhlIHdvcmtmbG93IHJ1biB2aWEgZXZlbnQgKGV2ZW50LXNvdXJjZWQgYXJjaGl0ZWN0dXJlKVxuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fZmFpbGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogZXJyb3JTdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGZhaWxFcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgIEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZmFpbEVycikgfHxcbiAgICAgICAgICAgICAgICAgICAgICBSdW5FeHBpcmVkRXJyb3IuaXMoZmFpbEVycilcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1RyaWVkIGZhaWxpbmcgd29ya2Zsb3cgcnVuLCBidXQgcnVuIGhhcyBhbHJlYWR5IGZpbmlzaGVkLicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBmYWlsRXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yQ29kZShlcnJvckNvZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JOYW1lKGVycm9yTmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvck1lc3NhZ2UoZXJyb3JNZXNzYWdlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5FcnJvclR5cGUoZXJyb3JOYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzV29ybGRDb250cmFjdEVycm9yKGZhaWxFcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSByZWNvcmRpbmcgd29ya2Zsb3cgZmFpbHVyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbEVyciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZhaWxFcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBTdHJpbmcoZmFpbEVyciksXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZmFpbEVycjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1blN0YXR1cygnZmFpbGVkJyksXG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yQ29kZShlcnJvckNvZGUpLFxuICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvck5hbWUoZXJyb3JOYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JNZXNzYWdlKGVycm9yTWVzc2FnZSksXG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5FcnJvclR5cGUoZXJyb3JOYW1lKSxcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIC0tLSBJbmZyYXN0cnVjdHVyZTogY29tcGxldGUgdGhlIHJ1biAtLS1cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIG91dHNpZGUgdGhlIHVzZXItY29kZSB0cnkvY2F0Y2ggc28gdGhhdCBmYWlsdXJlc1xuICAgICAgICAgICAgICAgIC8vIGhlcmUgKGUuZy4sIG5ldHdvcmsgZXJyb3JzKSBwcm9wYWdhdGUgdG8gdGhlIHF1ZXVlIGhhbmRsZXIuXG4gICAgICAgICAgICAgICAgLy8gcnVuX2NvbXBsZXRlZCBjYXJyaWVzIHRoZSBsb2FkZWQgc25hcHNob3QncyBgc3RhdGVVcGRhdGVkQXRgLFxuICAgICAgICAgICAgICAgIC8vIGJ1dCBpcyBpbnRlbnRpb25hbGx5IE5PVCByZXRyaWVkIGluIHBsYWNlIChub1xuICAgICAgICAgICAgICAgIC8vIHdpdGhQcmVjb25kaXRpb25SZXRyeSkgb24gYSBzdGFsZSAoNDEyKSByZWplY3Rpb246IGByZXN1bHRgXG4gICAgICAgICAgICAgICAgLy8gd2FzIGNvbXB1dGVkIGJ5IHRoaXMgcmVwbGF5LCBzbyBhIG5ld2VyIG91dC1vZi1iYW5kIGV2ZW50XG4gICAgICAgICAgICAgICAgLy8gbGFuZGluZyBhZnRlciB0aGUgc25hcHNob3QgbXVzdCBmb3JjZSBhICpmcmVzaCByZXBsYXkqXG4gICAgICAgICAgICAgICAgLy8gKHdoaWNoIG1heSBvYnNlcnZlIGl0IGFuZCBwcm9kdWNlIGEgZGlmZmVyZW50IHJlc3VsdCksIG5vdFxuICAgICAgICAgICAgICAgIC8vIHJlLWNvbW1pdCB0aGUgc3RhbGUgcmVzdWx0LiBPbiA0MTIgdGhlIGNhdGNoIGJlbG93IHNjaGVkdWxlc1xuICAgICAgICAgICAgICAgIC8vIGFuIGV4cGxpY2l0IGltbWVkaWF0ZSByZS1pbnZvY2F0aW9uIGluc3RlYWQuXG4gICAgICAgICAgICAgICAgLy8gKHJ1bl9mYWlsZWQgaXMgZGVsaWJlcmF0ZWx5IGxlZnQgdW5ndWFyZGVkIGFuZCBmYWlscyBvcGVuOlxuICAgICAgICAgICAgICAgIC8vIGEgc3B1cmlvdXMgcmUtcnVuIGlzIHNhZmUsIGEgc3B1cmlvdXMgY29tcGxldGlvbiBpcyBub3QsIGFuZFxuICAgICAgICAgICAgICAgIC8vIHRoZSBsb2FkZWQgZXZlbnQgbG9nIGlzIG5vdCBpbiBzY29wZSBvbiB0aGF0IGNhdGNoIHBhdGguKVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9jb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogd29ya2Zsb3dSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgICAgICAgICAgICBzdGF0ZVVwZGF0ZWRBdDogc3RhdGVVcGRhdGVkQXRGb3JDcmVhdGUoZXZlbnRzKSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChQcmVjb25kaXRpb25GYWlsZWRFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgICAncnVuX2NvbXBsZXRlZCByZWplY3RlZCBhcyBzdGFsZTsgcmUtaW52b2tpbmcgd2l0aCBhIGZyZXNoIHJlcGxheScsXG4gICAgICAgICAgICAgICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRpbWVvdXRTZWNvbmRzOiAwIH07XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoRW50aXR5Q29uZmxpY3RFcnJvci5pcyhlcnIpIHx8IFJ1bkV4cGlyZWRFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgICAnVHJpZWQgY29tcGxldGluZyB3b3JrZmxvdyBydW4sIGJ1dCBydW4gaGFzIGFscmVhZHkgZmluaXNoZWQuJyxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuU3RhdHVzKCdjb21wbGV0ZWQnKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0V2ZW50c0NvdW50KGV2ZW50cy5sZW5ndGgpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApOyAvLyBFbmQgdHJhY2VcbiAgICAgICAgICB9XG4gICAgICAgICk7IC8vIEVuZCB3aXRoV29ya2Zsb3dCYWdnYWdlXG4gICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgaWYgKHJlcGxheVRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQocmVwbGF5VGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgIH0pOyAvLyBFbmQgd2l0aFRyYWNlQ29udGV4dFxuICAgIH1cbiAgKTtcblxuICByZXR1cm4gd2l0aEhlYWx0aENoZWNrKGhhbmRsZXIsIHdvcmxkU3BlY1ZlcnNpb24pO1xufVxuXG4vLyB0aGlzIGlzIGEgbm8tb3AgcGxhY2Vob2xkZXIgYXMgdGhlIGNsaWVudCBpc1xuLy8gZXhwZWN0aW5nIHRoaXMgdG8gYmUgcHJlc2VudCBidXQgd2UgYXJlbid0IGFjdHVhbGx5IHVzaW5nIGl0XG5leHBvcnQgZnVuY3Rpb24gcnVuU3RlcCgpIHt9XG4iLCAiaW1wb3J0IHtcbiAgRVJST1JfU0xVR1MsXG4gIFJlcGxheURpdmVyZ2VuY2VFcnJvcixcbiAgV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3IsXG4gIFdvcmtmbG93UnVudGltZUVycm9yLFxufSBmcm9tICdAd29ya2Zsb3cvZXJyb3JzJztcbmltcG9ydCB7IGNyZWF0ZVdvcmtmbG93QmFzZVVybCwgd2l0aFJlc29sdmVycyB9IGZyb20gJ0B3b3JrZmxvdy91dGlscyc7XG5pbXBvcnQgeyBwYXJzZVdvcmtmbG93TmFtZSB9IGZyb20gJ0B3b3JrZmxvdy91dGlscy9wYXJzZS1uYW1lJztcbmltcG9ydCB0eXBlIHsgRXZlbnQsIFdvcmtmbG93UnVuIH0gZnJvbSAnQHdvcmtmbG93L3dvcmxkJztcbmltcG9ydCAqIGFzIG5hbm9pZCBmcm9tICduYW5vaWQnO1xuaW1wb3J0IHsgbW9ub3RvbmljRmFjdG9yeSB9IGZyb20gJ3VsaWQnO1xuaW1wb3J0IHR5cGUgeyBDcnlwdG9LZXkgfSBmcm9tICcuL2VuY3J5cHRpb24uanMnO1xuaW1wb3J0IHsgRXZlbnRDb25zdW1lclJlc3VsdCwgRXZlbnRzQ29uc3VtZXIgfSBmcm9tICcuL2V2ZW50cy1jb25zdW1lci5qcyc7XG5pbXBvcnQgdHlwZSB7IFF1ZXVlSXRlbSB9IGZyb20gJy4vZ2xvYmFsLmpzJztcbmltcG9ydCB7IEVOT1RTVVAsIFdvcmtmbG93U3VzcGVuc2lvbiB9IGZyb20gJy4vZ2xvYmFsLmpzJztcbmltcG9ydCB7IHJ1bnRpbWVMb2dnZXIgfSBmcm9tICcuL2xvZ2dlci5qcyc7XG5pbXBvcnQgdHlwZSB7IFdvcmtmbG93T3JjaGVzdHJhdG9yQ29udGV4dCB9IGZyb20gJy4vcHJpdmF0ZS5qcyc7XG5pbXBvcnQgeyBnZXRQb3J0TGF6eSB9IGZyb20gJy4vcnVudGltZS9nZXQtcG9ydC1sYXp5LmpzJztcbmltcG9ydCB7XG4gIGRlaHlkcmF0ZVdvcmtmbG93UmV0dXJuVmFsdWUsXG4gIGh5ZHJhdGVXb3JrZmxvd0FyZ3VtZW50cyxcbn0gZnJvbSAnLi9zZXJpYWxpemF0aW9uLmpzJztcbmltcG9ydCB7IGNyZWF0ZVVzZVN0ZXAgfSBmcm9tICcuL3N0ZXAuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGVwSHlkcmF0aW9uQ2FjaGUgfSBmcm9tICcuL3N0ZXAtaHlkcmF0aW9uLWNhY2hlLmpzJztcbmltcG9ydCB7XG4gIEJPRFlfSU5JVF9TWU1CT0wsXG4gIFNUQUJMRV9VTElELFxuICBXT1JLRkxPV19DUkVBVEVfSE9PSyxcbiAgV09SS0ZMT1dfR0VUX1NUUkVBTV9JRCxcbiAgV09SS0ZMT1dfU0xFRVAsXG4gIFdPUktGTE9XX1VTRV9TVEVQLFxufSBmcm9tICcuL3N5bWJvbHMuanMnO1xuaW1wb3J0ICogYXMgQXR0cmlidXRlIGZyb20gJy4vdGVsZW1ldHJ5L3NlbWFudGljLWNvbnZlbnRpb25zLmpzJztcbmltcG9ydCB7IHRyYWNlIH0gZnJvbSAnLi90ZWxlbWV0cnkuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2Zsb3dSdW5TdHJlYW1JZCB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVDb250ZXh0IH0gZnJvbSAnLi92bS9pbmRleC5qcyc7XG5pbXBvcnQgeyBydW5DYWNoZWRXb3JrZmxvd1NjcmlwdCB9IGZyb20gJy4vdm0vc2NyaXB0LWNhY2hlLmpzJztcbmltcG9ydCB0eXBlIHsgV29ya2Zsb3dNZXRhZGF0YSB9IGZyb20gJy4vd29ya2Zsb3cvZ2V0LXdvcmtmbG93LW1ldGFkYXRhLmpzJztcbmltcG9ydCB7IFdPUktGTE9XX0NPTlRFWFRfU1lNQk9MIH0gZnJvbSAnLi93b3JrZmxvdy9nZXQtd29ya2Zsb3ctbWV0YWRhdGEuanMnO1xuaW1wb3J0IHsgY3JlYXRlQ3JlYXRlSG9vayB9IGZyb20gJy4vd29ya2Zsb3cvaG9vay5qcyc7XG5pbXBvcnQgeyBjcmVhdGVTbGVlcCB9IGZyb20gJy4vd29ya2Zsb3cvc2xlZXAuanMnO1xuXG4vKipcbiAqIExvZ3MgYSB3YXJuaW5nIHdoZW4gYSB3b3JrZmxvdyBydW4gY29tcGxldGVzIG9yIGZhaWxzIHdpdGggdW5jb21taXR0ZWRcbiAqIG9wZXJhdGlvbnMgc3RpbGwgaW4gdGhlIGludm9jYXRpb25zIHF1ZXVlLiBUaGlzIHR5cGljYWxseSBpbmRpY2F0ZXMgdGhlXG4gKiB1c2VyIGZvcmdvdCB0byBgYXdhaXRgIGEgc3RlcCwgaG9vaywgb3Igc2xlZXAgY2FsbC5cbiAqL1xuZnVuY3Rpb24gd2FyblBlbmRpbmdRdWV1ZUl0ZW1zKFxuICBydW5JZDogc3RyaW5nLFxuICBwZW5kaW5nUXVldWU6IE1hcDxzdHJpbmcsIFF1ZXVlSXRlbT4sXG4gIG91dGNvbWU6ICdjb21wbGV0ZWQnIHwgJ2ZhaWxlZCdcbik6IHZvaWQge1xuICAvLyBGaWx0ZXIgb3V0IGhvb2tzIHRoYXQgYXJlIGVpdGhlciBhbHJlYWR5IGNyZWF0ZWQgKGFsaXZlLCB3YWl0aW5nIGZvciBwYXlsb2FkcylcbiAgLy8gb3IgZXhwbGljaXRseSBkaXNwb3NlZCDigJQgYm90aCBhcmUgYmVuaWduIHNpbmNlIHRoZSBiYWNrZW5kIGF1dG8tZGlzcG9zZXNcbiAgLy8gYWxsIGhvb2tzIHdoZW4gYSBydW4gcmVhY2hlcyBhIHRlcm1pbmFsIHN0YXRlXG4gIGNvbnN0IGl0ZW1zID0gWy4uLnBlbmRpbmdRdWV1ZS52YWx1ZXMoKV0uZmlsdGVyKFxuICAgIChpdGVtKSA9PiAhKGl0ZW0udHlwZSA9PT0gJ2hvb2snICYmIChpdGVtLmhhc0NyZWF0ZWRFdmVudCB8fCBpdGVtLmRpc3Bvc2VkKSlcbiAgKTtcbiAgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gIGNvbnN0IGRldGFpbHMgPSBpdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICBzd2l0Y2ggKGl0ZW0udHlwZSkge1xuICAgICAgY2FzZSAnc3RlcCc6XG4gICAgICAgIHJldHVybiBgc3RlcCBcIiR7aXRlbS5zdGVwTmFtZX1cImA7XG4gICAgICBjYXNlICdob29rJzpcbiAgICAgICAgcmV0dXJuIGBob29rIFwiJHtpdGVtLnRva2VufVwiYDtcbiAgICAgIGNhc2UgJ3dhaXQnOlxuICAgICAgICByZXR1cm4gJ3NsZWVwJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBgdW5rbm93biAoJHsoaXRlbSBhcyB7IHR5cGU6IHN0cmluZyB9KS50eXBlfSlgO1xuICAgIH1cbiAgfSk7XG5cbiAgcnVudGltZUxvZ2dlci53YXJuKFxuICAgIGBXb3JrZmxvdyBydW4gJHtvdXRjb21lfSB3aXRoICR7aXRlbXMubGVuZ3RofSB1bmNvbW1pdHRlZCBvcGVyYXRpb24ocyk6ICR7ZGV0YWlscy5qb2luKCcsICcpfS4gYCArXG4gICAgICAnRGlkIHlvdSBmb3JnZXQgdG8gYGF3YWl0YCBhIHN0ZXAsIGhvb2ssIG9yIHNsZWVwIGNhbGw/JyxcbiAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkIH1cbiAgKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bldvcmtmbG93KFxuICB3b3JrZmxvd0NvZGU6IHN0cmluZyxcbiAgd29ya2Zsb3dSdW46IFdvcmtmbG93UnVuLFxuICBldmVudHM6IEV2ZW50W10sXG4gIGVuY3J5cHRpb25LZXk6IENyeXB0b0tleSB8IHVuZGVmaW5lZCxcbiAgLyoqXG4gICAqIE9wdGlvbmFsIHBlci1ydW4gY2FjaGUgZm9yIGh5ZHJhdGVkIHN0ZXAgcmV0dXJuIHZhbHVlcywgb3duZWQgYnkgdGhlIGlubGluZVxuICAgKiByZXBsYXkgbG9vcCBzbyBpdCBzdXJ2aXZlcyBhY3Jvc3MgdGhlIGxvb3AncyBpdGVyYXRpb25zIChlYWNoIG9mIHdoaWNoXG4gICAqIGNyZWF0ZXMgYSBmcmVzaCBjb250ZXh0KS4gTWVtb2l6ZXMgdGhlIGRlY3J5cHQgKyBkZXZhbHVlLXBhcnNlIG9mIGNvbXBsZXRlZFxuICAgKiBzdGVwIHJlc3VsdHMgdG8gdHVybiBPKE7CsikgcmVwbGF5IGh5ZHJhdGlvbiBpbnRvIE8oTikuIE9taXR0ZWQgYnkgY2FsbGVyc1xuICAgKiB0aGF0IHJlcGxheSBvbmx5IG9uY2UgKHRoZW4gdGhlcmUgaXMgbm90aGluZyB0byByZXVzZSkuXG4gICAqL1xuICBzdGVwSHlkcmF0aW9uQ2FjaGU/OiBTdGVwSHlkcmF0aW9uQ2FjaGVcbik6IFByb21pc2U8VWludDhBcnJheSB8IHVua25vd24+IHtcbiAgcmV0dXJuIHRyYWNlKGB3b3JrZmxvdy5ydW4gJHt3b3JrZmxvd1J1bi53b3JrZmxvd05hbWV9YCwgYXN5bmMgKHNwYW4pID0+IHtcbiAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd05hbWUod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKSxcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1bklkKHdvcmtmbG93UnVuLnJ1bklkKSxcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1blN0YXR1cyh3b3JrZmxvd1J1bi5zdGF0dXMpLFxuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXZlbnRzQ291bnQoZXZlbnRzLmxlbmd0aCksXG4gICAgfSk7XG5cbiAgICBjb25zdCBzdGFydGVkQXQgPSB3b3JrZmxvd1J1bi5zdGFydGVkQXQ7XG4gICAgaWYgKCFzdGFydGVkQXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFdvcmtmbG93IHJ1biBcIiR7d29ya2Zsb3dSdW4ucnVuSWR9XCIgaGFzIG5vIFwic3RhcnRlZEF0XCIgdGltZXN0YW1wIChzaG91bGQgbm90IGhhcHBlbilgXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgcG9ydCBiZWZvcmUgY3JlYXRpbmcgVk0gY29udGV4dCB0byBhdm9pZCBhc3luYyBvcGVyYXRpb25zXG4gICAgLy8gYWZmZWN0aW5nIHRoZSBkZXRlcm1pbmlzdGljIHRpbWVzdGFtcFxuICAgIGNvbnN0IGlzVmVyY2VsID0gcHJvY2Vzcy5lbnYuVkVSQ0VMX1VSTCAhPT0gdW5kZWZpbmVkO1xuICAgIC8vIExvYWQgZ2V0UG9ydCBsYXppbHkgdG8gcHJldmVudCBUdXJib3BhY2sgZnJvbSB0cmFjaW5nIGdldC1wb3J0J3NcbiAgICAvLyBmcyBvcHMgKHJlYWRkaXIsIHJlYWRGaWxlKSBpbnRvIHRoZSBmbG93IHJvdXRlIGJ1bmRsZS4gVGhlIHJlc29sdmVkXG4gICAgLy8gcG9ydCBpcyBjYWNoZWQgcGVyIHByb2Nlc3MgKHNlZSBnZXQtcG9ydC1sYXp5LnRzKSwgc28gdGhpcyBpcyBjaGVhcFxuICAgIC8vIG9uIHJlcGxheXMgYWZ0ZXIgdGhlIGZpcnN0IOKAlCBgZ2V0UG9ydCgpYCBvdGhlcndpc2UgcmUtcnVucyBPUyBwb3J0XG4gICAgLy8gZGlzY292ZXJ5IChzcGF3bmluZyBgbHNvZmAgb24gbWFjT1MsIH42MG1zKSBvbiBldmVyeSByZXBsYXkuXG4gICAgY29uc3Qgd29ya2Zsb3dCYXNlVXJsID0gY3JlYXRlV29ya2Zsb3dCYXNlVXJsKFxuICAgICAgaXNWZXJjZWxcbiAgICAgICAgPyBgaHR0cHM6Ly8ke3Byb2Nlc3MuZW52LlZFUkNFTF9VUkx9YFxuICAgICAgICA6IGBodHRwOi8vbG9jYWxob3N0OiR7KGF3YWl0IGdldFBvcnRMYXp5KCkpID8/IDMwMDB9YFxuICAgICk7XG5cbiAgICBjb25zdCB7XG4gICAgICBjb250ZXh0LFxuICAgICAgZ2xvYmFsVGhpczogdm1HbG9iYWxUaGlzLFxuICAgICAgdXBkYXRlVGltZXN0YW1wLFxuICAgIH0gPSBjcmVhdGVDb250ZXh0KHtcbiAgICAgIHNlZWQ6IGAke3dvcmtmbG93UnVuLnJ1bklkfToke3dvcmtmbG93UnVuLndvcmtmbG93TmFtZX06JHsrc3RhcnRlZEF0fWAsXG4gICAgICBmaXhlZFRpbWVzdGFtcDogK3N0YXJ0ZWRBdCxcbiAgICB9KTtcblxuICAgIGNvbnN0IHdvcmtmbG93RGlzY29udGludWF0aW9uID0gd2l0aFJlc29sdmVyczx2b2lkPigpO1xuXG4gICAgY29uc3QgdWxpZCA9IG1vbm90b25pY0ZhY3RvcnkoKCkgPT4gdm1HbG9iYWxUaGlzLk1hdGgucmFuZG9tKCkpO1xuICAgIGNvbnN0IGdlbmVyYXRlTmFub2lkID0gbmFub2lkLmN1c3RvbVJhbmRvbShuYW5vaWQudXJsQWxwaGFiZXQsIDIxLCAoc2l6ZSkgPT5cbiAgICAgIG5ldyBVaW50OEFycmF5KHNpemUpLm1hcCgoKSA9PiAyNTYgKiB2bUdsb2JhbFRoaXMuTWF0aC5yYW5kb20oKSlcbiAgICApO1xuXG4gICAgLy8gQ3JlYXRlIGEgbXV0YWJsZSBob2xkZXIgZm9yIHRoZSBwcm9taXNlIHF1ZXVlIHNvIHRoZSBFdmVudHNDb25zdW1lclxuICAgIC8vIGNhbiBhY2Nlc3MgdGhlIGN1cnJlbnQgcXVldWUgc3RhdGUgdmlhIGEgZ2V0dGVyLiBUaGUgcXVldWUgaXMgbXV0YXRlZFxuICAgIC8vIGJ5IHN0ZXAvaG9vay9zbGVlcCBjYWxsYmFja3MgYXMgZXZlbnRzIGFyZSBwcm9jZXNzZWQuXG4gICAgY29uc3QgcHJvbWlzZVF1ZXVlSG9sZGVyID0geyBjdXJyZW50OiBQcm9taXNlLnJlc29sdmUoKSB9O1xuXG4gICAgY29uc3QgZXZlbnRzQ29uc3VtZXIgPSBuZXcgRXZlbnRzQ29uc3VtZXIoZXZlbnRzLCB7XG4gICAgICBvbkNvbnN1bWVkRXZlbnQ6IChldmVudCkgPT4ge1xuICAgICAgICB1cGRhdGVUaW1lc3RhbXAoK2V2ZW50LmNyZWF0ZWRBdCk7XG4gICAgICB9LFxuICAgICAgb25VbmNvbnN1bWVkRXZlbnQ6IChldmVudCkgPT4ge1xuICAgICAgICB3b3JrZmxvd0Rpc2NvbnRpbnVhdGlvbi5yZWplY3QoXG4gICAgICAgICAgbmV3IFJlcGxheURpdmVyZ2VuY2VFcnJvcihcbiAgICAgICAgICAgIGBSZXBsYXkgY291bGQgbm90IGNvbnN1bWUgZXZlbnQ6IGV2ZW50VHlwZT0ke2V2ZW50LmV2ZW50VHlwZX0sIGNvcnJlbGF0aW9uSWQ9JHtldmVudC5jb3JyZWxhdGlvbklkfSwgZXZlbnRJZD0ke2V2ZW50LmV2ZW50SWR9LmAsXG4gICAgICAgICAgICB7IGV2ZW50SWQ6IGV2ZW50LmV2ZW50SWQgfVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBnZXRQcm9taXNlUXVldWU6ICgpID0+IHByb21pc2VRdWV1ZUhvbGRlci5jdXJyZW50LFxuICAgIH0pO1xuXG4gICAgY29uc3Qgd29ya2Zsb3dDb250ZXh0OiBXb3JrZmxvd09yY2hlc3RyYXRvckNvbnRleHQgPSB7XG4gICAgICBydW5JZDogd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICBlbmNyeXB0aW9uS2V5LFxuICAgICAgZ2xvYmFsVGhpczogdm1HbG9iYWxUaGlzLFxuICAgICAgb25Xb3JrZmxvd0Vycm9yOiB3b3JrZmxvd0Rpc2NvbnRpbnVhdGlvbi5yZWplY3QsXG4gICAgICBldmVudHNDb25zdW1lcixcbiAgICAgIGdlbmVyYXRlVWxpZDogKCkgPT4gdWxpZCgrc3RhcnRlZEF0KSxcbiAgICAgIGdlbmVyYXRlTmFub2lkLFxuICAgICAgaW52b2NhdGlvbnNRdWV1ZTogbmV3IE1hcCgpLFxuICAgICAgLy8gVXNlIGdldHRlci9zZXR0ZXIgc28gdGhlIEV2ZW50c0NvbnN1bWVyJ3MgZ2V0UHJvbWlzZVF1ZXVlKCkgYWx3YXlzXG4gICAgICAvLyBzZWVzIHRoZSBsYXRlc3QgcXVldWUgc3RhdGUgYXMgaXQncyBtdXRhdGVkIGJ5IHN0ZXAvaG9vay9zbGVlcCBjYWxsYmFja3MuXG4gICAgICBnZXQgcHJvbWlzZVF1ZXVlKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZVF1ZXVlSG9sZGVyLmN1cnJlbnQ7XG4gICAgICB9LFxuICAgICAgc2V0IHByb21pc2VRdWV1ZSh2YWx1ZTogUHJvbWlzZTx2b2lkPikge1xuICAgICAgICBwcm9taXNlUXVldWVIb2xkZXIuY3VycmVudCA9IHZhbHVlO1xuICAgICAgfSxcbiAgICAgIHBlbmRpbmdEZWxpdmVyaWVzOiAwLFxuICAgICAgcGVuZGluZ0RlbGl2ZXJ5QmFycmllcnM6IG5ldyBNYXAoKSxcbiAgICAgIHN0ZXBIeWRyYXRpb25DYWNoZSxcbiAgICB9O1xuXG4gICAgLy8gQ29uc3VtZSBydW4gbGlmZWN5Y2xlIGV2ZW50cyAtIHRoZXNlIGFyZSBzdHJ1Y3R1cmFsIGV2ZW50cyB0aGF0IGRvbid0XG4gICAgLy8gbmVlZCBzcGVjaWFsIGhhbmRsaW5nIGluIHRoZSB3b3JrZmxvdywgYnV0IG11c3QgYmUgY29uc3VtZWQgdG8gYWR2YW5jZVxuICAgIC8vIHBhc3QgdGhlbSBpbiB0aGUgZXZlbnQgbG9nXG4gICAgd29ya2Zsb3dDb250ZXh0LmV2ZW50c0NvbnN1bWVyLnN1YnNjcmliZSgoZXZlbnQpID0+IHtcbiAgICAgIGlmICghZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIEV2ZW50Q29uc3VtZXJSZXN1bHQuTm90Q29uc3VtZWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnN1bWUgcnVuX2NyZWF0ZWQgLSBldmVyeSBydW4gaGFzIGV4YWN0bHkgb25lXG4gICAgICBpZiAoZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX2NyZWF0ZWQnKSB7XG4gICAgICAgIHJldHVybiBFdmVudENvbnN1bWVyUmVzdWx0LkNvbnN1bWVkO1xuICAgICAgfVxuXG4gICAgICAvLyBDb25zdW1lIHJ1bl9zdGFydGVkIC0gZXZlcnkgcnVuIGhhcyBleGFjdGx5IG9uZVxuICAgICAgaWYgKGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9zdGFydGVkJykge1xuICAgICAgICByZXR1cm4gRXZlbnRDb25zdW1lclJlc3VsdC5Db25zdW1lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIEV2ZW50Q29uc3VtZXJSZXN1bHQuTm90Q29uc3VtZWQ7XG4gICAgfSk7XG5cbiAgICBjb25zdCB1c2VTdGVwID0gY3JlYXRlVXNlU3RlcCh3b3JrZmxvd0NvbnRleHQpO1xuICAgIGNvbnN0IGNyZWF0ZUhvb2sgPSBjcmVhdGVDcmVhdGVIb29rKHdvcmtmbG93Q29udGV4dCk7XG4gICAgY29uc3Qgc2xlZXAgPSBjcmVhdGVTbGVlcCh3b3JrZmxvd0NvbnRleHQpO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX1VTRV9TVEVQXSA9IHVzZVN0ZXA7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX0NSRUFURV9IT09LXSA9IGNyZWF0ZUhvb2s7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX1NMRUVQXSA9IHNsZWVwO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tXT1JLRkxPV19HRVRfU1RSRUFNX0lEXSA9IChuYW1lc3BhY2U/OiBzdHJpbmcpID0+XG4gICAgICBnZXRXb3JrZmxvd1J1blN0cmVhbUlkKHdvcmtmbG93UnVuLnJ1bklkLCBuYW1lc3BhY2UpO1xuXG4gICAgLy8gRm9yIHRoZSB3b3JrZmxvdyBWTSwgd2Ugc3RvcmUgdGhlIGNvbnRleHQgaW4gYSBzeW1ib2wgb24gdGhlIGBnbG9iYWxUaGlzYCBvYmplY3RcbiAgICBjb25zdCBjdHg6IFdvcmtmbG93TWV0YWRhdGEgPSB7XG4gICAgICB3b3JrZmxvd05hbWU6IHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSxcbiAgICAgIHdvcmtmbG93UnVuSWQ6IHdvcmtmbG93UnVuLnJ1bklkLFxuICAgICAgd29ya2Zsb3dTdGFydGVkQXQ6IG5ldyB2bUdsb2JhbFRoaXMuRGF0ZSgrc3RhcnRlZEF0KSxcbiAgICAgIHVybDogd29ya2Zsb3dCYXNlVXJsLFxuICAgIH07XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfQ09OVEVYVF9TWU1CT0xdID0gY3R4O1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tTVEFCTEVfVUxJRF0gPSB1bGlkO1xuXG4gICAgLy8gTk9URTogV2lsbCBoYXZlIGEgY29uZmlnIG92ZXJyaWRlIHRvIHVzZSB0aGUgY3VzdG9tIGZldGNoIHN0ZXAuXG4gICAgLy8gICAgICAgRm9yIG5vdyBgZmV0Y2hgIG11c3QgYmUgZXhwbGljaXRseSBpbXBvcnRlZCBmcm9tIGB3b3JrZmxvd2AuXG4gICAgdm1HbG9iYWxUaGlzLmZldGNoID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IHZtR2xvYmFsVGhpcy5FcnJvcihcbiAgICAgICAgYEdsb2JhbCBcImZldGNoXCIgaXMgdW5hdmFpbGFibGUgaW4gd29ya2Zsb3cgZnVuY3Rpb25zLiBVc2UgdGhlIFwiZmV0Y2hcIiBzdGVwIGZ1bmN0aW9uIGZyb20gXCJ3b3JrZmxvd1wiIHRvIG1ha2UgSFRUUCByZXF1ZXN0cy5cXG5cXG5MZWFybiBtb3JlOiBodHRwczovL3VzZXdvcmtmbG93LmRldi9lcnIvJHtFUlJPUl9TTFVHUy5GRVRDSF9JTl9XT1JLRkxPV19GVU5DVElPTn1gXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyBPdmVycmlkZSB0aW1lb3V0L2ludGVydmFsIGZ1bmN0aW9ucyB0byB0aHJvdyBoZWxwZnVsIGVycm9yc1xuICAgIC8vIFRoZXNlIGFyZSBub3Qgc3VwcG9ydGVkIGluIHdvcmtmbG93IGZ1bmN0aW9ucyBiZWNhdXNlIHRoZXkgcmVseSBvblxuICAgIC8vIGFzeW5jaHJvbm91cyBzY2hlZHVsaW5nIHdoaWNoIGJyZWFrcyBkZXRlcm1pbmlzdGljIHJlcGxheVxuICAgIGNvbnN0IHRpbWVvdXRFcnJvck1lc3NhZ2UgPVxuICAgICAgJ1RpbWVvdXQgZnVuY3Rpb25zIGxpa2UgXCJzZXRUaW1lb3V0XCIgYW5kIFwic2V0SW50ZXJ2YWxcIiBhcmUgbm90IHN1cHBvcnRlZCBpbiB3b3JrZmxvdyBmdW5jdGlvbnMuIFVzZSB0aGUgXCJzbGVlcFwiIGZ1bmN0aW9uIGZyb20gXCJ3b3JrZmxvd1wiIGZvciB0aW1lLWJhc2VkIGRlbGF5cy4nO1xuXG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLnNldFRpbWVvdXQgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLnNldEludGVydmFsID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuVElNRU9VVF9GVU5DVElPTlNfSU5fV09SS0ZMT1csXG4gICAgICB9KTtcbiAgICB9O1xuICAgICh2bUdsb2JhbFRoaXMgYXMgYW55KS5jbGVhclRpbWVvdXQgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLmNsZWFySW50ZXJ2YWwgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLnNldEltbWVkaWF0ZSA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuY2xlYXJJbW1lZGlhdGUgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBgUmVxdWVzdGAgYW5kIGBSZXNwb25zZWAgYXJlIHNwZWNpYWwgYnVpbHQtaW4gY2xhc3NlcyB0aGF0IGludm9rZSBzdGVwc1xuICAgIC8vIGZvciB0aGUgYGpzb24oKWAsIGB0ZXh0KClgIGFuZCBgYXJyYXlCdWZmZXIoKWAgaW5zdGFuY2UgbWV0aG9kc1xuICAgIGNsYXNzIFJlcXVlc3QgaW1wbGVtZW50cyBnbG9iYWxUaGlzLlJlcXVlc3Qge1xuICAgICAgY2FjaGUhOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ2NhY2hlJ107XG4gICAgICBjcmVkZW50aWFscyE6IGdsb2JhbFRoaXMuUmVxdWVzdFsnY3JlZGVudGlhbHMnXTtcbiAgICAgIGRlc3RpbmF0aW9uITogZ2xvYmFsVGhpcy5SZXF1ZXN0WydkZXN0aW5hdGlvbiddO1xuICAgICAgaGVhZGVycyE6IEhlYWRlcnM7XG4gICAgICBpbnRlZ3JpdHkhOiBzdHJpbmc7XG4gICAgICBtZXRob2QhOiBzdHJpbmc7XG4gICAgICBtb2RlITogZ2xvYmFsVGhpcy5SZXF1ZXN0Wydtb2RlJ107XG4gICAgICByZWRpcmVjdCE6IGdsb2JhbFRoaXMuUmVxdWVzdFsncmVkaXJlY3QnXTtcbiAgICAgIHJlZmVycmVyITogc3RyaW5nO1xuICAgICAgcmVmZXJyZXJQb2xpY3khOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ3JlZmVycmVyUG9saWN5J107XG4gICAgICB1cmwhOiBzdHJpbmc7XG4gICAgICBrZWVwYWxpdmUhOiBib29sZWFuO1xuICAgICAgc2lnbmFsITogQWJvcnRTaWduYWw7XG4gICAgICBkdXBsZXghOiAnaGFsZic7XG4gICAgICBib2R5ITogUmVhZGFibGVTdHJlYW08YW55PiB8IG51bGw7XG5cbiAgICAgIGNvbnN0cnVjdG9yKGlucHV0OiBhbnksIGluaXQ/OiBSZXF1ZXN0SW5pdCkge1xuICAgICAgICAvLyBIYW5kbGUgVVJMIGlucHV0XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnIHx8IGlucHV0IGluc3RhbmNlb2Ygdm1HbG9iYWxUaGlzLlVSTCkge1xuICAgICAgICAgIGNvbnN0IHVybFN0cmluZyA9IFN0cmluZyhpbnB1dCk7XG4gICAgICAgICAgLy8gVmFsaWRhdGUgVVJMIGZvcm1hdFxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBuZXcgdm1HbG9iYWxUaGlzLlVSTCh1cmxTdHJpbmcpO1xuICAgICAgICAgICAgdGhpcy51cmwgPSB1cmxTdHJpbmc7XG4gICAgICAgICAgfSBjYXRjaCAoY2F1c2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEZhaWxlZCB0byBwYXJzZSBVUkwgZnJvbSAke3VybFN0cmluZ31gLCB7XG4gICAgICAgICAgICAgIGNhdXNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElucHV0IGlzIGEgUmVxdWVzdCBvYmplY3QgLSBjbG9uZSBpdHMgcHJvcGVydGllc1xuICAgICAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsO1xuICAgICAgICAgIGlmICghaW5pdCkge1xuICAgICAgICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2Q7XG4gICAgICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoaW5wdXQuaGVhZGVycyk7XG4gICAgICAgICAgICB0aGlzLmJvZHkgPSBpbnB1dC5ib2R5O1xuICAgICAgICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZTtcbiAgICAgICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFscztcbiAgICAgICAgICAgIHRoaXMuY2FjaGUgPSBpbnB1dC5jYWNoZTtcbiAgICAgICAgICAgIHRoaXMucmVkaXJlY3QgPSBpbnB1dC5yZWRpcmVjdDtcbiAgICAgICAgICAgIHRoaXMucmVmZXJyZXIgPSBpbnB1dC5yZWZlcnJlcjtcbiAgICAgICAgICAgIHRoaXMucmVmZXJyZXJQb2xpY3kgPSBpbnB1dC5yZWZlcnJlclBvbGljeTtcbiAgICAgICAgICAgIHRoaXMuaW50ZWdyaXR5ID0gaW5wdXQuaW50ZWdyaXR5O1xuICAgICAgICAgICAgdGhpcy5rZWVwYWxpdmUgPSBpbnB1dC5rZWVwYWxpdmU7XG4gICAgICAgICAgICB0aGlzLnNpZ25hbCA9IGlucHV0LnNpZ25hbDtcbiAgICAgICAgICAgIHRoaXMuZHVwbGV4ID0gaW5wdXQuZHVwbGV4O1xuICAgICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IGlucHV0LmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZiBpbml0IGlzIHByb3ZpZGVkLCBtZXJnZTogdXNlIHNvdXJjZSBwcm9wZXJ0aWVzLCB0aGVuIG92ZXJyaWRlIHdpdGggaW5pdFxuICAgICAgICAgIC8vIENvcHkgYWxsIHByb3BlcnRpZXMgZnJvbSB0aGUgc291cmNlIFJlcXVlc3QgZmlyc3RcbiAgICAgICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZDtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoaW5wdXQuaGVhZGVycyk7XG4gICAgICAgICAgdGhpcy5ib2R5ID0gaW5wdXQuYm9keTtcbiAgICAgICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlO1xuICAgICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFscztcbiAgICAgICAgICB0aGlzLmNhY2hlID0gaW5wdXQuY2FjaGU7XG4gICAgICAgICAgdGhpcy5yZWRpcmVjdCA9IGlucHV0LnJlZGlyZWN0O1xuICAgICAgICAgIHRoaXMucmVmZXJyZXIgPSBpbnB1dC5yZWZlcnJlcjtcbiAgICAgICAgICB0aGlzLnJlZmVycmVyUG9saWN5ID0gaW5wdXQucmVmZXJyZXJQb2xpY3k7XG4gICAgICAgICAgdGhpcy5pbnRlZ3JpdHkgPSBpbnB1dC5pbnRlZ3JpdHk7XG4gICAgICAgICAgdGhpcy5rZWVwYWxpdmUgPSBpbnB1dC5rZWVwYWxpdmU7XG4gICAgICAgICAgdGhpcy5zaWduYWwgPSBpbnB1dC5zaWduYWw7XG4gICAgICAgICAgdGhpcy5kdXBsZXggPSBpbnB1dC5kdXBsZXg7XG4gICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IGlucHV0LmRlc3RpbmF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3ZlcnJpZGUgd2l0aCBpbml0IG9wdGlvbnMgaWYgcHJvdmlkZWRcbiAgICAgICAgLy8gU2V0IG1ldGhvZFxuICAgICAgICBpZiAoaW5pdD8ubWV0aG9kKSB7XG4gICAgICAgICAgdGhpcy5tZXRob2QgPSBpbml0Lm1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLm1ldGhvZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBGYWxsYmFjayB0byBkZWZhdWx0IGZvciBzdHJpbmcgaW5wdXQgY2FzZVxuICAgICAgICAgIHRoaXMubWV0aG9kID0gJ0dFVCc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgaGVhZGVyc1xuICAgICAgICBpZiAoaW5pdD8uaGVhZGVycykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbml0LmhlYWRlcnMpO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgICBpbnB1dCBpbnN0YW5jZW9mIHZtR2xvYmFsVGhpcy5VUkxcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gRm9yIHN0cmluZy9VUkwgaW5wdXQsIGNyZWF0ZSBlbXB0eSBoZWFkZXJzXG4gICAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgb3RoZXIgcHJvcGVydGllcyB3aXRoIGluaXQgdmFsdWVzIG9yIGRlZmF1bHRzXG4gICAgICAgIGlmIChpbml0Py5tb2RlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLm1vZGUgPSBpbml0Lm1vZGU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMubW9kZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLm1vZGUgPSAnY29ycyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8uY3JlZGVudGlhbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbml0LmNyZWRlbnRpYWxzO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNyZWRlbnRpYWxzICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSAnc2FtZS1vcmlnaW4nO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYGFueWAgY2FzdCBoZXJlIGJlY2F1c2UgQHR5cGVzL25vZGUgdjIyIGRvZXMgbm90IHlldCBoYXZlIGBjYWNoZWBcbiAgICAgICAgaWYgKChpbml0IGFzIGFueSk/LmNhY2hlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLmNhY2hlID0gKGluaXQgYXMgYW55KS5jYWNoZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5jYWNoZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmNhY2hlID0gJ2RlZmF1bHQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LnJlZGlyZWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLnJlZGlyZWN0ID0gaW5pdC5yZWRpcmVjdDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZWRpcmVjdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLnJlZGlyZWN0ID0gJ2ZvbGxvdyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8ucmVmZXJyZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMucmVmZXJyZXIgPSBpbml0LnJlZmVycmVyO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnJlZmVycmVyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMucmVmZXJyZXIgPSAnYWJvdXQ6Y2xpZW50JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5yZWZlcnJlclBvbGljeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlclBvbGljeSA9IGluaXQucmVmZXJyZXJQb2xpY3k7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucmVmZXJyZXJQb2xpY3kgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlclBvbGljeSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LmludGVncml0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5pbnRlZ3JpdHkgPSBpbml0LmludGVncml0eTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5pbnRlZ3JpdHkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5pbnRlZ3JpdHkgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5rZWVwYWxpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMua2VlcGFsaXZlID0gaW5pdC5rZWVwYWxpdmU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMua2VlcGFsaXZlICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICB0aGlzLmtlZXBhbGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LnNpZ25hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEFib3J0U2lnbmFsIHN0dWJcbiAgICAgICAgICB0aGlzLnNpZ25hbCA9IGluaXQuc2lnbmFsO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnNpZ25hbCkge1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBBYm9ydFNpZ25hbCBzdHViXG4gICAgICAgICAgdGhpcy5zaWduYWwgPSB7IGFib3J0ZWQ6IGZhbHNlIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZHVwbGV4KSB7XG4gICAgICAgICAgdGhpcy5kdXBsZXggPSAnaGFsZic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZGVzdGluYXRpb24pIHtcbiAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gJ2RvY3VtZW50JztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJvZHkgPSBpbml0Py5ib2R5O1xuXG4gICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgR0VUL0hFQUQgbWV0aG9kcyBkb24ndCBoYXZlIGEgYm9keVxuICAgICAgICBpZiAoXG4gICAgICAgICAgYm9keSAhPT0gbnVsbCAmJlxuICAgICAgICAgIGJvZHkgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJylcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgUmVxdWVzdCB3aXRoIEdFVC9IRUFEIG1ldGhvZCBjYW5ub3QgaGF2ZSBib2R5LmApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RvcmUgdGhlIG9yaWdpbmFsIEJvZHlJbml0IGZvciBzZXJpYWxpemF0aW9uXG4gICAgICAgIGlmIChib2R5ICE9PSBudWxsICYmIGJvZHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIENyZWF0ZSBhIFwiZmFrZVwiIFJlYWRhYmxlU3RyZWFtIHRoYXQgc3RvcmVzIHRoZSBvcmlnaW5hbCBib2R5XG4gICAgICAgICAgLy8gVGhpcyBhdm9pZHMgZG9pbmcgYXN5bmMgd29yayBkdXJpbmcgd29ya2Zsb3cgcmVwbGF5XG4gICAgICAgICAgdGhpcy5ib2R5ID0gT2JqZWN0LmNyZWF0ZSh2bUdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW0ucHJvdG90eXBlLCB7XG4gICAgICAgICAgICBbQk9EWV9JTklUX1NZTUJPTF06IHtcbiAgICAgICAgICAgICAgdmFsdWU6IGJvZHksXG4gICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5ib2R5ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjbG9uZSgpOiBSZXF1ZXN0IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXQgYm9keVVzZWQoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogaW1wbGVtZW50IHRoZXNlXG4gICAgICBibG9iITogKCkgPT4gUHJvbWlzZTxCbG9iPjtcbiAgICAgIGZvcm1EYXRhITogKCkgPT4gUHJvbWlzZTxGb3JtRGF0YT47XG5cbiAgICAgIGFycmF5QnVmZmVyITogKCkgPT4gUHJvbWlzZTxBcnJheUJ1ZmZlcj47XG4gICAgICBqc29uITogKCkgPT4gUHJvbWlzZTxhbnk+O1xuICAgICAgdGV4dCE6ICgpID0+IFByb21pc2U8c3RyaW5nPjtcblxuICAgICAgYXN5bmMgYnl0ZXMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCB0aGlzLmFycmF5QnVmZmVyKCkpO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhSZXF1ZXN0LnByb3RvdHlwZSwge1xuICAgICAgYXJyYXlCdWZmZXI6IHtcbiAgICAgICAgdmFsdWU6IHVzZVN0ZXA8W10sIEFycmF5QnVmZmVyPignX19idWlsdGluX3Jlc3BvbnNlX2FycmF5X2J1ZmZlcicpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGpzb246IHtcbiAgICAgICAgdmFsdWU6IHVzZVN0ZXA8W10sIGFueT4oJ19fYnVpbHRpbl9yZXNwb25zZV9qc29uJyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgICAgdGV4dDoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgc3RyaW5nPignX19idWlsdGluX3Jlc3BvbnNlX3RleHQnKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjbGFzcyBSZXNwb25zZSBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuUmVzcG9uc2Uge1xuICAgICAgdHlwZSE6IGdsb2JhbFRoaXMuUmVzcG9uc2VbJ3R5cGUnXTtcbiAgICAgIHVybCE6IHN0cmluZztcbiAgICAgIHN0YXR1cyE6IG51bWJlcjtcbiAgICAgIHN0YXR1c1RleHQhOiBzdHJpbmc7XG4gICAgICBib2R5ITogUmVhZGFibGVTdHJlYW08VWludDhBcnJheT4gfCBudWxsO1xuICAgICAgaGVhZGVycyE6IEhlYWRlcnM7XG4gICAgICByZWRpcmVjdGVkITogYm9vbGVhbjtcblxuICAgICAgY29uc3RydWN0b3IoYm9keT86IGFueSwgaW5pdD86IFJlc3BvbnNlSW5pdCkge1xuICAgICAgICB0aGlzLnN0YXR1cyA9IGluaXQ/LnN0YXR1cyA/PyAyMDA7XG4gICAgICAgIHRoaXMuc3RhdHVzVGV4dCA9IGluaXQ/LnN0YXR1c1RleHQgPz8gJyc7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbml0Py5oZWFkZXJzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnO1xuICAgICAgICB0aGlzLnVybCA9ICcnO1xuICAgICAgICB0aGlzLnJlZGlyZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IG51bGwtYm9keSBzdGF0dXMgY29kZXMgZG9uJ3QgaGF2ZSBhIGJvZHlcbiAgICAgICAgLy8gUGVyIEhUVFAgc3BlYzogMjA0IChObyBDb250ZW50KSwgMjA1IChSZXNldCBDb250ZW50KSwgYW5kIDMwNCAoTm90IE1vZGlmaWVkKVxuICAgICAgICBpZiAoXG4gICAgICAgICAgYm9keSAhPT0gbnVsbCAmJlxuICAgICAgICAgIGJvZHkgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICh0aGlzLnN0YXR1cyA9PT0gMjA0IHx8IHRoaXMuc3RhdHVzID09PSAyMDUgfHwgdGhpcy5zdGF0dXMgPT09IDMwNClcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgIGBSZXNwb25zZSBjb25zdHJ1Y3RvcjogSW52YWxpZCByZXNwb25zZSBzdGF0dXMgY29kZSAke3RoaXMuc3RhdHVzfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RvcmUgdGhlIG9yaWdpbmFsIEJvZHlJbml0IGZvciBzZXJpYWxpemF0aW9uXG4gICAgICAgIGlmIChib2R5ICE9PSBudWxsICYmIGJvZHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIENyZWF0ZSBhIFwiZmFrZVwiIFJlYWRhYmxlU3RyZWFtIHRoYXQgc3RvcmVzIHRoZSBvcmlnaW5hbCBib2R5XG4gICAgICAgICAgLy8gVGhpcyBhdm9pZHMgZG9pbmcgYXN5bmMgd29yayBkdXJpbmcgd29ya2Zsb3cgcmVwbGF5XG4gICAgICAgICAgdGhpcy5ib2R5ID0gT2JqZWN0LmNyZWF0ZSh2bUdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW0ucHJvdG90eXBlLCB7XG4gICAgICAgICAgICBbQk9EWV9JTklUX1NZTUJPTF06IHtcbiAgICAgICAgICAgICAgdmFsdWU6IGJvZHksXG4gICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5ib2R5ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBpbXBsZW1lbnQgdGhlc2VcbiAgICAgIGNsb25lITogKCkgPT4gUmVzcG9uc2U7XG4gICAgICBibG9iITogKCkgPT4gUHJvbWlzZTxnbG9iYWxUaGlzLkJsb2I+O1xuICAgICAgZm9ybURhdGEhOiAoKSA9PiBQcm9taXNlPGdsb2JhbFRoaXMuRm9ybURhdGE+O1xuXG4gICAgICBnZXQgb2soKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDA7XG4gICAgICB9XG5cbiAgICAgIGdldCBib2R5VXNlZCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBhcnJheUJ1ZmZlciE6ICgpID0+IFByb21pc2U8QXJyYXlCdWZmZXI+O1xuICAgICAganNvbiE6ICgpID0+IFByb21pc2U8YW55PjtcbiAgICAgIHRleHQhOiAoKSA9PiBQcm9taXNlPHN0cmluZz47XG5cbiAgICAgIGFzeW5jIGJ5dGVzKCkge1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgdGhpcy5hcnJheUJ1ZmZlcigpKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGpzb24oZGF0YTogYW55LCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2Uge1xuICAgICAgICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoaW5pdD8uaGVhZGVycyk7XG4gICAgICAgIGlmICghaGVhZGVycy5oYXMoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgICAgaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShib2R5LCB7IC4uLmluaXQsIGhlYWRlcnMgfSk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBlcnJvcigpOiBSZXNwb25zZSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIHJlZGlyZWN0KHVybDogc3RyaW5nIHwgVVJMLCBzdGF0dXM6IG51bWJlciA9IDMwMik6IFJlc3BvbnNlIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgc3RhdHVzIGNvZGUgLSBvbmx5IHNwZWNpZmljIHJlZGlyZWN0IGNvZGVzIGFyZSBhbGxvd2VkXG4gICAgICAgIGlmICghWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XS5pbmNsdWRlcyhzdGF0dXMpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXG4gICAgICAgICAgICBgSW52YWxpZCByZWRpcmVjdCBzdGF0dXMgY29kZTogJHtzdGF0dXN9LiBNdXN0IGJlIG9uZSBvZjogMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSByZXNwb25zZSB3aXRoIExvY2F0aW9uIGhlYWRlclxuICAgICAgICBjb25zdCBoZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKCk7XG4gICAgICAgIGhlYWRlcnMuc2V0KCdMb2NhdGlvbicsIFN0cmluZyh1cmwpKTtcblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IE9iamVjdC5jcmVhdGUoUmVzcG9uc2UucHJvdG90eXBlKTtcbiAgICAgICAgcmVzcG9uc2Uuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICByZXNwb25zZS5zdGF0dXNUZXh0ID0gJyc7XG4gICAgICAgIHJlc3BvbnNlLmhlYWRlcnMgPSBoZWFkZXJzO1xuICAgICAgICByZXNwb25zZS5ib2R5ID0gbnVsbDtcbiAgICAgICAgcmVzcG9uc2UudHlwZSA9ICdkZWZhdWx0JztcbiAgICAgICAgcmVzcG9uc2UudXJsID0gJyc7XG4gICAgICAgIHJlc3BvbnNlLnJlZGlyZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHZtR2xvYmFsVGhpcy5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoUmVzcG9uc2UucHJvdG90eXBlLCB7XG4gICAgICBhcnJheUJ1ZmZlcjoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgQXJyYXlCdWZmZXI+KCdfX2J1aWx0aW5fcmVzcG9uc2VfYXJyYXlfYnVmZmVyJyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgICAganNvbjoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgYW55PignX19idWlsdGluX3Jlc3BvbnNlX2pzb24nKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICB0ZXh0OiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBzdHJpbmc+KCdfX2J1aWx0aW5fcmVzcG9uc2VfdGV4dCcpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNsYXNzIFJlYWRhYmxlU3RyZWFtPFQ+IGltcGxlbWVudHMgZ2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbTxUPiB7XG4gICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXQgbG9ja2VkKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGNhbmNlbCgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGdldFJlYWRlcigpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIHBpcGVUaHJvdWdoKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgcGlwZVRvKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgdGVlKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgdmFsdWVzKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGZyb20oKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdm1HbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtID0gUmVhZGFibGVTdHJlYW07XG5cbiAgICBjbGFzcyBXcml0YWJsZVN0cmVhbTxUPiBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW08VD4ge1xuICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgZ2V0IGxvY2tlZCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBhYm9ydCgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGNsb3NlKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgZ2V0V3JpdGVyKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdm1HbG9iYWxUaGlzLldyaXRhYmxlU3RyZWFtID0gV3JpdGFibGVTdHJlYW07XG5cbiAgICBjbGFzcyBUcmFuc2Zvcm1TdHJlYW08SSwgTz4gaW1wbGVtZW50cyBnbG9iYWxUaGlzLlRyYW5zZm9ybVN0cmVhbTxJLCBPPiB7XG4gICAgICByZWFkYWJsZTogZ2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbTxPPjtcbiAgICAgIHdyaXRhYmxlOiBnbG9iYWxUaGlzLldyaXRhYmxlU3RyZWFtPEk+O1xuXG4gICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuVHJhbnNmb3JtU3RyZWFtID0gVHJhbnNmb3JtU3RyZWFtO1xuXG4gICAgLy8gRXZlbnR1YWxseSB3ZSdsbCBwcm9iYWJseSB3YW50IHRvIHByb3ZpZGUgb3VyIG93biBgY29uc29sZWAgb2JqZWN0LFxuICAgIC8vIGJ1dCBmb3Igbm93IHdlJ2xsIGp1c3QgZXhwb3NlIHRoZSBnbG9iYWwgb25lLlxuICAgIHZtR2xvYmFsVGhpcy5jb25zb2xlID0gZ2xvYmFsVGhpcy5jb25zb2xlO1xuXG4gICAgLy8gSEFDSzogcHJvcGFnYXRlIHN5bWJvbCBuZWVkZWQgZm9yIEFJIGdhdGV3YXkgdXNhZ2VcbiAgICBjb25zdCBTWU1CT0xfRk9SX1JFUV9DT05URVhUID0gU3ltYm9sLmZvcignQHZlcmNlbC9yZXF1ZXN0LWNvbnRleHQnKTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbU1lNQk9MX0ZPUl9SRVFfQ09OVEVYVF0gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpW1xuICAgICAgU1lNQk9MX0ZPUl9SRVFfQ09OVEVYVFxuICAgIF07XG5cbiAgICAvLyBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIHVzZXItZGVmaW5lZCB3b3JrZmxvdyBmdW5jdGlvbi5cbiAgICAvLyBUaGUgZmlsZW5hbWUgcGFyYW1ldGVyIGVuc3VyZXMgc3RhY2sgdHJhY2VzIHNob3cgYSBtZWFuaW5nZnVsIG5hbWVcbiAgICAvLyAoZS5nLiwgXCJleGFtcGxlL3dvcmtmbG93cy85OV9lMmUudHNcIikgaW5zdGVhZCBvZiBcImV2YWxtYWNoaW5lLjxhbm9ueW1vdXM+XCIuXG4gICAgY29uc3QgcGFyc2VkTmFtZSA9IHBhcnNlV29ya2Zsb3dOYW1lKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSk7XG4gICAgY29uc3QgZmlsZW5hbWUgPSBwYXJzZWROYW1lPy5tb2R1bGVTcGVjaWZpZXIgfHwgd29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lO1xuXG4gICAgLy8gRXZhbHVhdGUgdGhlIHdvcmtmbG93IGJ1bmRsZSBhZ2FpbnN0IHRoZSBmcmVzaCBjb250ZXh0IHVzaW5nIGFcbiAgICAvLyBwcm9jZXNzLXdpZGUgY2FjaGUgb2YgdGhlIGNvbXBpbGVkIGB2bS5TY3JpcHRgLiBUaGUgYnVuZGxlIGlzIHRoZSBzYW1lXG4gICAgLy8gc3RyaW5nIGZvciBldmVyeSByZXBsYXkgYW5kIGV2ZXJ5IGludm9jYXRpb24gaW4gdGhpcyBwcm9jZXNzLCBhbmRcbiAgICAvLyBjb21waWxhdGlvbiBpcyBhIHB1cmUgZnVuY3Rpb24gb2YgYChjb2RlLCBmaWxlbmFtZSlgLCBzbyByZXVzaW5nIHRoZVxuICAgIC8vIGNvbXBpbGVkIFNjcmlwdCBhY3Jvc3MgcmVwbGF5cyBpcyBkZXRlcm1pbmlzbS1zYWZlOiBpdCBwcm9kdWNlcyB0aGUgc2FtZVxuICAgIC8vIHdvcmtmbG93IGZ1bmN0aW9uIGFuZCB0aGUgc2FtZSBgZmlsZW5hbWVgIHNvdXJjZSBhdHRyaWJ1dGlvbiBhc1xuICAgIC8vIHJlLXBhcnNpbmcgdGhlIGJ1bmRsZSBldmVyeSB0aW1lLCBidXQgc2tpcHMgdGhlIChleHBlbnNpdmUpIHJlLXBhcnNlLlxuICAgIC8vIEV2YWx1YXRpbmcgdGhlIGJ1bmRsZSByZWdpc3RlcnMgZXZlcnkgd29ya2Zsb3cgb25cbiAgICAvLyBgZ2xvYmFsVGhpcy5fX3ByaXZhdGVfd29ya2Zsb3dzYDsgdGhlIHRyYWlsaW5nIGxvb2t1cCBleHByZXNzaW9uIHRoZW5cbiAgICAvLyByZXRyaWV2ZXMgdGhlIHJlcXVlc3RlZCB3b3JrZmxvdyBmdW5jdGlvbi4gVGhlIGxvb2t1cCBpcyBldmFsdWF0ZWQgYXMgYVxuICAgIC8vIHNlcGFyYXRlIGNhY2hlZCBTY3JpcHQgdW5kZXIgdGhlIHNhbWUgYGZpbGVuYW1lYCwgc28gZXJyb3Igc3RhY2sgZnJhbWVzXG4gICAgLy8gc3RpbGwgYXR0cmlidXRlIHRvIHRoZSB3b3JrZmxvdydzIHNvdXJjZSBmaWxlIChgcmVtYXBFcnJvclN0YWNrYCBrZXlzIG9uXG4gICAgLy8gYGZpbGVuYW1lYCkuIFRoZSBvbmUgYmVoYXZpb3VyYWwgZGlmZmVyZW5jZSBmcm9tIHRoZSBwcmV2aW91c1xuICAgIC8vIHNpbmdsZS1jb21iaW5lZC1zdHJpbmcgYXBwcm9hY2ggaXMgdGhlICpsaW5lIG51bWJlciogb2YgYW4gZXJyb3IgdGhyb3duXG4gICAgLy8gYnkgdGhlIGxvb2t1cCBleHByZXNzaW9uIGl0c2VsZjogaXQgbm93IHJlcG9ydHMgbGluZSAxIG9mIHRoZSBsb29rdXBcbiAgICAvLyBTY3JpcHQgcmF0aGVyIHRoYW4gdGhlIGxpbmUganVzdCBwYXN0IHRoZSBlbmQgb2YgdGhlIGJ1bmRsZS4gVGhhdCBwYXRoXG4gICAgLy8gaXMgcmFyZSAoaXQgcmVxdWlyZXMgdGhlIGxvb2t1cCBgPy5nZXQoLi4uKWAgZXhwcmVzc2lvbiB0byB0aHJvdykgYW5kXG4gICAgLy8gZG9lcyBub3QgYWZmZWN0IHRoZSB3b3JrZmxvdyBmdW5jdGlvbiBvciByZXBsYXkgZGV0ZXJtaW5pc20uXG4gICAgcnVuQ2FjaGVkV29ya2Zsb3dTY3JpcHQod29ya2Zsb3dDb2RlLCBmaWxlbmFtZSwgY29udGV4dCk7XG4gICAgY29uc3Qgd29ya2Zsb3dGbiA9IHJ1bkNhY2hlZFdvcmtmbG93U2NyaXB0KFxuICAgICAgYGdsb2JhbFRoaXMuX19wcml2YXRlX3dvcmtmbG93cz8uZ2V0KCR7SlNPTi5zdHJpbmdpZnkod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKX0pYCxcbiAgICAgIGZpbGVuYW1lLFxuICAgICAgY29udGV4dFxuICAgICk7XG5cbiAgICBpZiAodHlwZW9mIHdvcmtmbG93Rm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd05vdFJlZ2lzdGVyZWRFcnJvcih3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpO1xuICAgIH1cblxuICAgIC8vIENoYWluIHdvcmtmbG93IGFyZ3VtZW50IGh5ZHJhdGlvbiBvbnRvIHRoZSBwcm9taXNlUXVldWUgc28gdGhhdCB0aGVcbiAgICAvLyB1bmNvbnN1bWVkIGV2ZW50IGNoZWNrICh3aGljaCB3YWl0cyBmb3IgdGhlIHF1ZXVlIHRvIGRyYWluKSBkb2Vzbid0XG4gICAgLy8gZmlyZSBkdXJpbmcgdGhlIGFzeW5jIGdhcCBiZXR3ZWVuIHJ1bl9zdGFydGVkIGNvbnN1bXB0aW9uIGFuZCB0aGVcbiAgICAvLyB3b3JrZmxvdyBmdW5jdGlvbiBzdWJzY3JpYmluZyBpdHMgZmlyc3Qgc3RlcCBjYWxsYmFja3MuXG4gICAgbGV0IGFyZ3M6IHVua25vd25bXSA9IFtdO1xuICAgIHdvcmtmbG93Q29udGV4dC5wcm9taXNlUXVldWUgPSB3b3JrZmxvd0NvbnRleHQucHJvbWlzZVF1ZXVlLnRoZW4oXG4gICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgIGFyZ3MgPSBhd2FpdCBoeWRyYXRlV29ya2Zsb3dBcmd1bWVudHMoXG4gICAgICAgICAgd29ya2Zsb3dSdW4uaW5wdXQsXG4gICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgICAgZW5jcnlwdGlvbktleSxcbiAgICAgICAgICB2bUdsb2JhbFRoaXNcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICApO1xuICAgIGF3YWl0IHdvcmtmbG93Q29udGV4dC5wcm9taXNlUXVldWU7XG5cbiAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0FyZ3VtZW50c0NvdW50KGFyZ3MubGVuZ3RoKSxcbiAgICB9KTtcblxuICAgIC8vIEludm9rZSB1c2VyIHdvcmtmbG93XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFByb21pc2UucmFjZShbXG4gICAgICAgIHdvcmtmbG93Rm4oLi4uYXJncyksXG4gICAgICAgIHdvcmtmbG93RGlzY29udGludWF0aW9uLnByb21pc2UsXG4gICAgICBdKTtcblxuICAgICAgY29uc3QgZGVoeWRyYXRlZCA9IGF3YWl0IGRlaHlkcmF0ZVdvcmtmbG93UmV0dXJuVmFsdWUoXG4gICAgICAgIHJlc3VsdCxcbiAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgIGVuY3J5cHRpb25LZXksXG4gICAgICAgIHZtR2xvYmFsVGhpc1xuICAgICAgKTtcblxuICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1Jlc3VsdFR5cGUodHlwZW9mIHJlc3VsdCksXG4gICAgICB9KTtcblxuICAgICAgd2FyblBlbmRpbmdRdWV1ZUl0ZW1zKFxuICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgd29ya2Zsb3dDb250ZXh0Lmludm9jYXRpb25zUXVldWUsXG4gICAgICAgICdjb21wbGV0ZWQnXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gZGVoeWRyYXRlZDtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIENvbnRyb2wtZmxvdyBzaWduYWxzIGFyZSBoYW5kbGVkIGJ5IHRoZSBydW50aW1lIGFuZCBkbyBub3QgbWVhbiB0aGVcbiAgICAgIC8vIHdvcmtmbG93IGhhcyB0ZXJtaW5hbGx5IGZhaWxlZC5cbiAgICAgIGlmIChXb3JrZmxvd1N1c3BlbnNpb24uaXMoZXJyKSB8fCBSZXBsYXlEaXZlcmdlbmNlRXJyb3IuaXMoZXJyKSkge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG5cbiAgICAgIHdhcm5QZW5kaW5nUXVldWVJdGVtcyhcbiAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgIHdvcmtmbG93Q29udGV4dC5pbnZvY2F0aW9uc1F1ZXVlLFxuICAgICAgICAnZmFpbGVkJ1xuICAgICAgKTtcblxuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfSk7XG59XG4iLCAiaW1wb3J0IHtcbiAgRVJST1JfU0xVR1MsXG4gIEhvb2tOb3RGb3VuZEVycm9yLFxuICBXb3JrZmxvd1J1bnRpbWVFcnJvcixcbn0gZnJvbSAnQHdvcmtmbG93L2Vycm9ycyc7XG5pbXBvcnQge1xuICB0eXBlIEhvb2ssXG4gIGlzTGVnYWN5U3BlY1ZlcnNpb24sXG4gIFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICBTUEVDX1ZFUlNJT05fTEVHQUNZLFxuICB0eXBlIFdvcmtmbG93SW52b2tlUGF5bG9hZCxcbiAgdHlwZSBXb3JrZmxvd1J1bixcbn0gZnJvbSAnQHdvcmtmbG93L3dvcmxkJztcbmltcG9ydCB7IGdldFJ1bkNhcGFiaWxpdGllcyB9IGZyb20gJy4uL2NhcGFiaWxpdGllcy5qcyc7XG5pbXBvcnQgeyB0eXBlIENyeXB0b0tleSwgaW1wb3J0S2V5IH0gZnJvbSAnLi4vZW5jcnlwdGlvbi5qcyc7XG5pbXBvcnQgeyBydW50aW1lTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyLmpzJztcbmltcG9ydCB7XG4gIGRlaHlkcmF0ZVN0ZXBSZXR1cm5WYWx1ZSxcbiAgaHlkcmF0ZVN0ZXBBcmd1bWVudHMsXG4gIFNlcmlhbGl6YXRpb25Gb3JtYXQsXG59IGZyb20gJy4uL3NlcmlhbGl6YXRpb24uanMnO1xuaW1wb3J0IHsgV0VCSE9PS19SRVNQT05TRV9XUklUQUJMRSB9IGZyb20gJy4uL3N5bWJvbHMuanMnO1xuaW1wb3J0ICogYXMgQXR0cmlidXRlIGZyb20gJy4uL3RlbGVtZXRyeS9zZW1hbnRpYy1jb252ZW50aW9ucy5qcyc7XG5pbXBvcnQgeyBnZXRTcGFuQ29udGV4dEZvclRyYWNlQ2FycmllciwgdHJhY2UgfSBmcm9tICcuLi90ZWxlbWV0cnkuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2Zsb3dRdWV1ZU5hbWUgfSBmcm9tICcuL2hlbHBlcnMuanMnO1xuaW1wb3J0IHsgc2FmZVdhaXRVbnRpbCwgd2FpdGVkVW50aWwgfSBmcm9tICcuL3dhaXQtdW50aWwuanMnO1xuaW1wb3J0IHsgZ2V0V29ybGQgfSBmcm9tICcuL3dvcmxkLmpzJztcblxuYXN5bmMgZnVuY3Rpb24gbWF0ZXJpYWxpemVSZXNwb25zZUJvZHkocmVzcG9uc2U6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICBpZiAoIXJlc3BvbnNlLmJvZHkpIHtcbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH1cblxuICBjb25zdCBib2R5ID0gYXdhaXQgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKTtcbiAgcmV0dXJuIG5ldyBSZXNwb25zZShib2R5LCB7XG4gICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICBoZWFkZXJzOiByZXNwb25zZS5oZWFkZXJzLFxuICB9KTtcbn1cblxuLyoqXG4gKiBJbnRlcm5hbCBoZWxwZXIgdGhhdCByZXR1cm5zIHRoZSBob29rLCB0aGUgYXNzb2NpYXRlZCB3b3JrZmxvdyBydW4sXG4gKiBhbmQgdGhlIHJlc29sdmVkIGVuY3J5cHRpb24ga2V5LlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRIb29rQnlUb2tlbldpdGhLZXkodG9rZW46IHN0cmluZyk6IFByb21pc2U8e1xuICBob29rOiBIb29rO1xuICBydW46IFdvcmtmbG93UnVuO1xuICBlbmNyeXB0aW9uS2V5OiBDcnlwdG9LZXkgfCB1bmRlZmluZWQ7XG59PiB7XG4gIGNvbnN0IHdvcmxkID0gZ2V0V29ybGQoKTtcbiAgY29uc3QgaG9vayA9IGF3YWl0IHdvcmxkLmhvb2tzLmdldEJ5VG9rZW4odG9rZW4pO1xuICBjb25zdCBydW4gPSBhd2FpdCB3b3JsZC5ydW5zLmdldChob29rLnJ1bklkKTtcbiAgY29uc3QgcmF3S2V5ID0gYXdhaXQgd29ybGQuZ2V0RW5jcnlwdGlvbktleUZvclJ1bj8uKHJ1bik7XG4gIGNvbnN0IGVuY3J5cHRpb25LZXkgPSByYXdLZXkgPyBhd2FpdCBpbXBvcnRLZXkocmF3S2V5KSA6IHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBob29rLm1ldGFkYXRhICE9PSAndW5kZWZpbmVkJykge1xuICAgIGhvb2subWV0YWRhdGEgPSBhd2FpdCBoeWRyYXRlU3RlcEFyZ3VtZW50cyhcbiAgICAgIGhvb2subWV0YWRhdGEgYXMgYW55LFxuICAgICAgaG9vay5ydW5JZCxcbiAgICAgIGVuY3J5cHRpb25LZXlcbiAgICApO1xuICB9XG4gIHJldHVybiB7IGhvb2ssIHJ1biwgZW5jcnlwdGlvbktleSB9O1xufVxuXG4vKipcbiAqIEdldCB0aGUgaG9vayBieSB0b2tlbiB0byBmaW5kIHRoZSBhc3NvY2lhdGVkIHdvcmtmbG93IHJ1bixcbiAqIGFuZCBoeWRyYXRlIHRoZSBgbWV0YWRhdGFgIHByb3BlcnR5IGlmIGl0IHdhcyBzZXQgZnJvbSB3aXRoaW5cbiAqIHRoZSB3b3JrZmxvdyBydW4uXG4gKlxuICogQHBhcmFtIHRva2VuIC0gVGhlIHVuaXF1ZSB0b2tlbiBpZGVudGlmeWluZyB0aGUgaG9va1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SG9va0J5VG9rZW4odG9rZW46IHN0cmluZyk6IFByb21pc2U8SG9vaz4ge1xuICBjb25zdCB7IGhvb2sgfSA9IGF3YWl0IGdldEhvb2tCeVRva2VuV2l0aEtleSh0b2tlbik7XG4gIHJldHVybiBob29rO1xufVxuXG4vKipcbiAqIFJlc3VtZXMgYSB3b3JrZmxvdyBydW4gYnkgc2VuZGluZyBhIHBheWxvYWQgdG8gYSBob29rIGlkZW50aWZpZWQgYnkgaXRzIHRva2VuLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGV4dGVybmFsbHkgKGUuZy4sIGZyb20gYW4gQVBJIHJvdXRlIG9yIHNlcnZlciBhY3Rpb24pXG4gKiB0byBzZW5kIGRhdGEgdG8gYSBob29rIGFuZCByZXN1bWUgdGhlIGFzc29jaWF0ZWQgd29ya2Zsb3cgcnVuLlxuICpcbiAqIEBwYXJhbSB0b2tlbk9ySG9vayAtIFRoZSB1bmlxdWUgdG9rZW4gaWRlbnRpZnlpbmcgdGhlIGhvb2ssIG9yIHRoZSBob29rIG9iamVjdCBpdHNlbGZcbiAqIEBwYXJhbSBwYXlsb2FkIC0gVGhlIGRhdGEgcGF5bG9hZCB0byBzZW5kIHRvIHRoZSBob29rXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byB0aGUgaG9va1xuICogQHRocm93cyBFcnJvciBpZiB0aGUgaG9vayBpcyBub3QgZm91bmQgb3IgaWYgdGhlcmUncyBhbiBlcnJvciBkdXJpbmcgdGhlIHByb2Nlc3NcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGBgYHRzXG4gKiAvLyBJbiBhbiBBUEkgcm91dGVcbiAqIGltcG9ydCB7IHJlc3VtZUhvb2sgfSBmcm9tICdAd29ya2Zsb3cvY29yZS9ydW50aW1lJztcbiAqXG4gKiBleHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gKiAgIGNvbnN0IHsgdG9rZW4sIGRhdGEgfSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuICpcbiAqICAgdHJ5IHtcbiAqICAgICBjb25zdCBob29rID0gYXdhaXQgcmVzdW1lSG9vayh0b2tlbiwgZGF0YSk7XG4gKiAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBydW5JZDogaG9vay5ydW5JZCB9KTtcbiAqICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdIb29rIG5vdCBmb3VuZCcsIHsgc3RhdHVzOiA0MDQgfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdW1lSG9vazxUID0gYW55PihcbiAgdG9rZW5Pckhvb2s6IHN0cmluZyB8IEhvb2ssXG4gIHBheWxvYWQ6IFQsXG4gIGVuY3J5cHRpb25LZXlPdmVycmlkZT86IENyeXB0b0tleVxuKTogUHJvbWlzZTxIb29rPiB7XG4gIHJldHVybiBhd2FpdCB3YWl0ZWRVbnRpbCgoKSA9PiB7XG4gICAgcmV0dXJuIHRyYWNlKCdob29rLnJlc3VtZScsIGFzeW5jIChzcGFuKSA9PiB7XG4gICAgICBjb25zdCB3b3JsZCA9IGdldFdvcmxkKCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBob29rOiBIb29rO1xuICAgICAgICBsZXQgd29ya2Zsb3dSdW46IFdvcmtmbG93UnVuO1xuICAgICAgICBsZXQgZW5jcnlwdGlvbktleTogQ3J5cHRvS2V5IHwgdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuT3JIb29rID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldEhvb2tCeVRva2VuV2l0aEtleSh0b2tlbk9ySG9vayk7XG4gICAgICAgICAgaG9vayA9IHJlc3VsdC5ob29rO1xuICAgICAgICAgIHdvcmtmbG93UnVuID0gcmVzdWx0LnJ1bjtcbiAgICAgICAgICBlbmNyeXB0aW9uS2V5ID0gZW5jcnlwdGlvbktleU92ZXJyaWRlID8/IHJlc3VsdC5lbmNyeXB0aW9uS2V5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhvb2sgPSB0b2tlbk9ySG9vaztcbiAgICAgICAgICB3b3JrZmxvd1J1biA9IGF3YWl0IHdvcmxkLnJ1bnMuZ2V0KGhvb2sucnVuSWQpO1xuICAgICAgICAgIGlmIChlbmNyeXB0aW9uS2V5T3ZlcnJpZGUpIHtcbiAgICAgICAgICAgIGVuY3J5cHRpb25LZXkgPSBlbmNyeXB0aW9uS2V5T3ZlcnJpZGU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJhd0tleSA9IGF3YWl0IHdvcmxkLmdldEVuY3J5cHRpb25LZXlGb3JSdW4/Lih3b3JrZmxvd1J1bik7XG4gICAgICAgICAgICBlbmNyeXB0aW9uS2V5ID0gcmF3S2V5ID8gYXdhaXQgaW1wb3J0S2V5KHJhd0tleSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgLi4uQXR0cmlidXRlLkhvb2tUb2tlbihob29rLnRva2VuKSxcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuSG9va0lkKGhvb2suaG9va0lkKSxcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5JZChob29rLnJ1bklkKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhlIHRhcmdldCBydW4ncyBjYXBhYmlsaXRpZXMgdG8gZW5zdXJlIHdlIGVuY29kZSB0aGVcbiAgICAgICAgLy8gcGF5bG9hZCBpbiBhIGZvcm1hdCB0aGUgcnVuJ3MgZGVwbG95bWVudCBjYW4gZGVjb2RlLiBGb3IgZXhhbXBsZSxcbiAgICAgICAgLy8gcnVucyBjcmVhdGVkIGJlZm9yZSBlbmNyeXB0aW9uIHN1cHBvcnQgd2FzIGFkZGVkIGNhbm5vdCBkZWNvZGVcbiAgICAgICAgLy8gdGhlICdlbmNyJyBzZXJpYWxpemF0aW9uIGZvcm1hdCwgYW5kIHJ1bnMgY3JlYXRlZCBiZWZvcmVcbiAgICAgICAgLy8gYnl0ZS1zdHJlYW0gZnJhbWluZyBzdXBwb3J0IGNhbm5vdCBkZWNvZGUgZnJhbWVkIGJ5dGUgc3RyZWFtcy5cbiAgICAgICAgY29uc3QgcmF3VmVyc2lvbiA9IHdvcmtmbG93UnVuLmV4ZWN1dGlvbkNvbnRleHQ/LndvcmtmbG93Q29yZVZlcnNpb247XG4gICAgICAgIGNvbnN0IGNhcGFiaWxpdGllcyA9IGdldFJ1bkNhcGFiaWxpdGllcyhcbiAgICAgICAgICB0eXBlb2YgcmF3VmVyc2lvbiA9PT0gJ3N0cmluZycgPyByYXdWZXJzaW9uIDogdW5kZWZpbmVkXG4gICAgICAgICk7XG4gICAgICAgIGlmICghY2FwYWJpbGl0aWVzLnN1cHBvcnRlZEZvcm1hdHMuaGFzKFNlcmlhbGl6YXRpb25Gb3JtYXQuRU5DUllQVEVEKSkge1xuICAgICAgICAgIGVuY3J5cHRpb25LZXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWh5ZHJhdGUgdGhlIHBheWxvYWQgZm9yIHN0b3JhZ2VcbiAgICAgICAgY29uc3Qgb3BzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuICAgICAgICBjb25zdCB2MUNvbXBhdCA9IGlzTGVnYWN5U3BlY1ZlcnNpb24oaG9vay5zcGVjVmVyc2lvbik7XG4gICAgICAgIGNvbnN0IGRlaHlkcmF0ZWRQYXlsb2FkID0gYXdhaXQgZGVoeWRyYXRlU3RlcFJldHVyblZhbHVlKFxuICAgICAgICAgIHBheWxvYWQsXG4gICAgICAgICAgaG9vay5ydW5JZCxcbiAgICAgICAgICBlbmNyeXB0aW9uS2V5LFxuICAgICAgICAgIG9wcyxcbiAgICAgICAgICBnbG9iYWxUaGlzLFxuICAgICAgICAgIHYxQ29tcGF0LFxuICAgICAgICAgIGNhcGFiaWxpdGllcy5mcmFtZWRCeXRlU3RyZWFtc1xuICAgICAgICApO1xuICAgICAgICAvLyBUaGVzZSBwYXlsb2FkLXN0cmVhbSBvcHMgYXJlIGZsdXNoZWQgaW4gdGhlIGJhY2tncm91bmQ7IHRoZVxuICAgICAgICAvLyBwcm9taXNlIGhhbmRlZCB0byB3YWl0VW50aWwgbXVzdCBuZXZlciByZWplY3QgKGFuIHVuY29uc3VtZWRcbiAgICAgICAgLy8gd2FpdFVudGlsIHJlamVjdGlvbiBjcmFzaGVzIHRoZSBwcm9jZXNzIGFzIHVuaGFuZGxlZFJlamVjdGlvbiksXG4gICAgICAgIC8vIHNvIHVuZXhwZWN0ZWQgZmFpbHVyZXMgYXJlIGxvZ2dlZCBpbnN0ZWFkLlxuICAgICAgICAvLyBOT1RFOiByZWplY3Rpb25zIHdpdGggYHVuZGVmaW5lZGAgYXJlIGFuIGV4cGVjdGVkIGFydGlmYWN0IG9mIHRoZVxuICAgICAgICAvLyB3ZWJob29rIGJ1bmRsZSBhbmQgYXJlIGlnbm9yZWQgZW50aXJlbHkuXG4gICAgICAgIHNhZmVXYWl0VW50aWwoUHJvbWlzZS5hbGwob3BzKSwgKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgIHJ1bnRpbWVMb2dnZXIud2FybignQmFja2dyb3VuZCBmbHVzaCBvZiBob29rIHBheWxvYWQgb3BzIGZhaWxlZCcsIHtcbiAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IGhvb2sucnVuSWQsXG4gICAgICAgICAgICBob29rSWQ6IGhvb2suaG9va0lkLFxuICAgICAgICAgICAgZXJyb3I6IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgaG9va19yZWNlaXZlZCBldmVudCB3aXRoIHRoZSBwYXlsb2FkXG4gICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgaG9vay5ydW5JZCxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBldmVudFR5cGU6ICdob29rX3JlY2VpdmVkJyxcbiAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQ6IGhvb2suaG9va0lkLFxuICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgIC4uLih2MUNvbXBhdCA/IHt9IDogeyB0b2tlbjogaG9vay50b2tlbiB9KSxcbiAgICAgICAgICAgICAgcGF5bG9hZDogZGVoeWRyYXRlZFBheWxvYWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgeyB2MUNvbXBhdCB9XG4gICAgICAgICk7XG5cbiAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93TmFtZSh3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB0cmFjZUNhcnJpZXIgPSB3b3JrZmxvd1J1bi5leGVjdXRpb25Db250ZXh0Py50cmFjZUNhcnJpZXI7XG5cbiAgICAgICAgaWYgKHRyYWNlQ2Fycmllcikge1xuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhd2FpdCBnZXRTcGFuQ29udGV4dEZvclRyYWNlQ2Fycmllcih0cmFjZUNhcnJpZXIpO1xuICAgICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgICBzcGFuPy5hZGRMaW5rPy4oeyBjb250ZXh0IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlLXRyaWdnZXIgdGhlIHdvcmtmbG93IGFnYWluc3QgdGhlIGRlcGxveW1lbnQgSUQgYXNzb2NpYXRlZFxuICAgICAgICAvLyB3aXRoIHRoZSB3b3JrZmxvdyBydW4gdGhhdCB0aGUgaG9vayBiZWxvbmdzIHRvXG4gICAgICAgIGF3YWl0IHdvcmxkLnF1ZXVlKFxuICAgICAgICAgIGdldFdvcmtmbG93UXVldWVOYW1lKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSksXG4gICAgICAgICAge1xuICAgICAgICAgICAgcnVuSWQ6IGhvb2sucnVuSWQsXG4gICAgICAgICAgICAvLyBhdHRhY2ggdGhlIHRyYWNlIGNhcnJpZXIgZnJvbSB0aGUgd29ya2Zsb3cgcnVuXG4gICAgICAgICAgICB0cmFjZUNhcnJpZXI6XG4gICAgICAgICAgICAgIHdvcmtmbG93UnVuLmV4ZWN1dGlvbkNvbnRleHQ/LnRyYWNlQ2FycmllciA/PyB1bmRlZmluZWQsXG4gICAgICAgICAgfSBzYXRpc2ZpZXMgV29ya2Zsb3dJbnZva2VQYXlsb2FkLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGRlcGxveW1lbnRJZDogd29ya2Zsb3dSdW4uZGVwbG95bWVudElkLFxuICAgICAgICAgICAgc3BlY1ZlcnNpb246IHdvcmtmbG93UnVuLnNwZWNWZXJzaW9uID8/IFNQRUNfVkVSU0lPTl9MRUdBQ1ksXG4gICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBob29rO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Ib29rVG9rZW4oXG4gICAgICAgICAgICB0eXBlb2YgdG9rZW5Pckhvb2sgPT09ICdzdHJpbmcnID8gdG9rZW5Pckhvb2sgOiB0b2tlbk9ySG9vay50b2tlblxuICAgICAgICAgICksXG4gICAgICAgICAgLi4uQXR0cmlidXRlLkhvb2tGb3VuZChmYWxzZSksXG4gICAgICAgIH0pO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJlc3VtZXMgYSB3ZWJob29rIGJ5IHNlbmRpbmcgYSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1JlcXVlc3QgfCBSZXF1ZXN0fVxuICogb2JqZWN0IHRvIGEgaG9vayBpZGVudGlmaWVkIGJ5IGl0cyB0b2tlbi5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBleHRlcm5hbGx5IChlLmcuLCBmcm9tIGFuIEFQSSByb3V0ZSBvciBzZXJ2ZXIgYWN0aW9uKVxuICogdG8gc2VuZCBhIHJlcXVlc3QgdG8gYSB3ZWJob29rIGFuZCByZXN1bWUgdGhlIGFzc29jaWF0ZWQgd29ya2Zsb3cgcnVuLlxuICpcbiAqIEBwYXJhbSB0b2tlbiAtIFRoZSB1bmlxdWUgdG9rZW4gaWRlbnRpZnlpbmcgdGhlIGhvb2tcbiAqIEBwYXJhbSByZXF1ZXN0IC0gVGhlIHJlcXVlc3QgdG8gc2VuZCB0byB0aGUgaG9va1xuICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gdGhlIHJlc3BvbnNlXG4gKiBAdGhyb3dzIEVycm9yIGlmIHRoZSBob29rIGlzIG5vdCBmb3VuZCBvciBpZiB0aGVyZSdzIGFuIGVycm9yIGR1cmluZyB0aGUgcHJvY2Vzc1xuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIC8vIEluIGFuIEFQSSByb3V0ZVxuICogaW1wb3J0IHsgcmVzdW1lV2ViaG9vayB9IGZyb20gJ0B3b3JrZmxvdy9jb3JlL3J1bnRpbWUnO1xuICpcbiAqIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IFJlcXVlc3QpIHtcbiAqICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXF1ZXN0LnVybCk7XG4gKiAgIGNvbnN0IHRva2VuID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ3Rva2VuJyk7XG4gKlxuICogICBpZiAoIXRva2VuKSB7XG4gKiAgICAgcmV0dXJuIG5ldyBSZXNwb25zZSgnTWlzc2luZyB0b2tlbicsIHsgc3RhdHVzOiA0MDAgfSk7XG4gKiAgIH1cbiAqXG4gKiAgIHRyeSB7XG4gKiAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXN1bWVXZWJob29rKHRva2VuLCByZXF1ZXN0KTtcbiAqICAgICByZXR1cm4gcmVzcG9uc2U7XG4gKiAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgICAgcmV0dXJuIG5ldyBSZXNwb25zZSgnV2ViaG9vayBub3QgZm91bmQnLCB7IHN0YXR1czogNDA0IH0pO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3VtZVdlYmhvb2soXG4gIHRva2VuOiBzdHJpbmcsXG4gIHJlcXVlc3Q6IFJlcXVlc3Rcbik6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgY29uc3QgeyBob29rLCBlbmNyeXB0aW9uS2V5IH0gPSBhd2FpdCBnZXRIb29rQnlUb2tlbldpdGhLZXkodG9rZW4pO1xuXG4gIC8vIE9ubHkgd2ViaG9va3MgY2FuIGJlIHJlc3VtZWQgdmlhIHRoZSBwdWJsaWMgZW5kcG9pbnQuXG4gIC8vIElmIHRoZSBob29rIHdhcyBjcmVhdGVkIHZpYSBjcmVhdGVIb29rKCkgKGlzV2ViaG9vayAhPT0gdHJ1ZSksXG4gIC8vIHRocm93IHRoZSBzYW1lIFwibm90IGZvdW5kXCIgZXJyb3IgdGhlIHdvcmxkIHdvdWxkIHRocm93IGZvciBhIG1pc3NpbmdcbiAgLy8gdG9rZW4uIFRoaXMgcHJldmVudHMgbGVha2luZyB0aGF0IHRoZSB0b2tlbiBpcyB2YWxpZC5cbiAgaWYgKGhvb2suaXNXZWJob29rID09PSBmYWxzZSkge1xuICAgIHRocm93IG5ldyBIb29rTm90Rm91bmRFcnJvcih0b2tlbik7XG4gIH1cblxuICBsZXQgcmVzcG9uc2U6IFJlc3BvbnNlIHwgdW5kZWZpbmVkO1xuICBsZXQgcmVzcG9uc2VSZWFkYWJsZTogUmVhZGFibGVTdHJlYW08UmVzcG9uc2U+IHwgdW5kZWZpbmVkO1xuICBpZiAoXG4gICAgaG9vay5tZXRhZGF0YSAmJlxuICAgIHR5cGVvZiBob29rLm1ldGFkYXRhID09PSAnb2JqZWN0JyAmJlxuICAgICdyZXNwb25kV2l0aCcgaW4gaG9vay5tZXRhZGF0YVxuICApIHtcbiAgICBpZiAoaG9vay5tZXRhZGF0YS5yZXNwb25kV2l0aCA9PT0gJ21hbnVhbCcpIHtcbiAgICAgIGNvbnN0IHsgcmVhZGFibGUsIHdyaXRhYmxlIH0gPSBuZXcgVHJhbnNmb3JtU3RyZWFtPFJlc3BvbnNlLCBSZXNwb25zZT4oKTtcbiAgICAgIHJlc3BvbnNlUmVhZGFibGUgPSByZWFkYWJsZTtcblxuICAgICAgLy8gVGhlIHJlcXVlc3QgaW5zdGFuY2UgaW5jbHVkZXMgdGhlIHdyaXRhYmxlIHN0cmVhbSB3aGljaCB3aWxsIGJlIHVzZWRcbiAgICAgIC8vIHRvIHdyaXRlIHRoZSByZXNwb25zZSB0byB0aGUgY2xpZW50IGZyb20gd2l0aGluIHRoZSB3b3JrZmxvdyBydW5cbiAgICAgIChyZXF1ZXN0IGFzIGFueSlbV0VCSE9PS19SRVNQT05TRV9XUklUQUJMRV0gPSB3cml0YWJsZTtcbiAgICB9IGVsc2UgaWYgKGhvb2subWV0YWRhdGEucmVzcG9uZFdpdGggaW5zdGFuY2VvZiBSZXNwb25zZSkge1xuICAgICAgcmVzcG9uc2UgPSBob29rLm1ldGFkYXRhLnJlc3BvbmRXaXRoO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIFxcYHJlc3BvbmRXaXRoXFxgIHZhbHVlOiAke2hvb2subWV0YWRhdGEucmVzcG9uZFdpdGh9YCxcbiAgICAgICAgeyBzbHVnOiBFUlJPUl9TTFVHUy5XRUJIT09LX0lOVkFMSURfUkVTUE9ORF9XSVRIX1ZBTFVFIH1cbiAgICAgICk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIE5vIGByZXNwb25kV2l0aGAgdmFsdWUgaW1wbGllcyB0aGUgZGVmYXVsdCBiZWhhdmlvciBvZiByZXR1cm5pbmcgYSAyMDJcbiAgICByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7IHN0YXR1czogMjAyIH0pO1xuICB9XG5cbiAgYXdhaXQgcmVzdW1lSG9vayhob29rLCByZXF1ZXN0LCBlbmNyeXB0aW9uS2V5KTtcblxuICBpZiAocmVzcG9uc2VSZWFkYWJsZSkge1xuICAgIC8vIFdhaXQgZm9yIHRoZSByZWFkYWJsZSBzdHJlYW0gdG8gZW1pdCBvbmUgY2h1bmssXG4gICAgLy8gd2hpY2ggaXMgdGhlIGBSZXNwb25zZWAgb2JqZWN0XG4gICAgY29uc3QgcmVhZGVyID0gcmVzcG9uc2VSZWFkYWJsZS5nZXRSZWFkZXIoKTtcbiAgICBjb25zdCBjaHVuayA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgaWYgKGNodW5rLnZhbHVlKSB7XG4gICAgICByZXNwb25zZSA9IGF3YWl0IG1hdGVyaWFsaXplUmVzcG9uc2VCb2R5KGNodW5rLnZhbHVlKTtcbiAgICB9XG4gICAgYXdhaXQgcmVhZGVyLmNhbmNlbCgpO1xuICB9XG5cbiAgaWYgKCFyZXNwb25zZSkge1xuICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcignV29ya2Zsb3cgcnVuIGRpZCBub3Qgc2VuZCBhIHJlc3BvbnNlJywge1xuICAgICAgc2x1ZzogRVJST1JfU0xVR1MuV0VCSE9PS19SRVNQT05TRV9OT1RfU0VOVCxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbURPLFNBQVMsc0JBQXNCLE9BQU87QUFDekMsa0JB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QUFBLEVBQ0E7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUNKO0FBQ0EsSUFBTSxjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKO0FBQ0EsU0FBUyxpQkFBaUI7QUFDdEIsU0FBTztBQUFBLElBQ0g7QUFBQSxJQUNBO0FBQUEsSUFDQSxJQUFJLE9BQU8sU0FBUyxZQUFZLEtBQUssR0FBRyxDQUFDLFFBQVEsSUFBSTtBQUFBLElBQ3JEO0FBQUEsRUFDSjtBQUNKO0FBUFM7QUFRVCxJQUFNLHFCQUFxQjtBQUFBLEVBQ3ZCO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0k7QUFB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bkIsWUFBWTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsTUFDQSxVQUFVO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBQ0EsWUFBWTtBQUFBLE1BQ1IsWUFBWTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0gsWUFBWTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsTUFDQSxVQUFVO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBQ0Esb0JBQW9CO0FBQUEsTUFDaEIsWUFBWTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsTUFDQSxVQUFVO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLFlBQVk7QUFBQSxNQUNSLFlBQVk7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsTUFDQSxVQUFVO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFB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aW9uIiwgImZldGNoIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInBhcnNlZCIsICJyZWFkIiwgInV0aWxzIiwgInV0aWxzIiwgInV0aWxzIiwgInBvcyIsICJ1dGlscyIsICJ1dGlscyIsICJzdGFydCIsICJ1dGlscyIsICJjb2x1bW5LZXlzIiwgInJhd0hlYWRlciIsICJyZWFkIiwgImNyZWF0ZWQiLCAic2V0RHluYW1pY1BhZ2VzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgIlJlcGxheURpdmVyZ2VuY2VFcnJvciIsICJXb3JrZmxvd1J1bnRpbWVFcnJvciIsICJwYXJzZVdvcmtmbG93TmFtZSIsICJTUEVDX1ZFUlNJT05fQ1VSUkVOVCIsICJTUEVDX1ZFUlNJT05fTEVHQUNZIiwgImltcG9ydEtleSIsICJXb3JrZmxvd1N1c3BlbnNpb24iLCAicnVudGltZUxvZ2dlciIsICJnZXRXb3JrZmxvd1F1ZXVlTmFtZSIsICJnZXRXb3JsZCIsICJBdHRyaWJ1dGUiLCAidHJhY2UiLCAiV29ya2Zsb3dTdXNwZW5zaW9uIiwgIkVSUk9SX1NMVUdTIiwgIldvcmtmbG93UnVudGltZUVycm9yIiwgInJ1bnRpbWVMb2dnZXIiLCAiQXR0cmlidXRlIiwgInRyYWNlIiwgImdldFdvcmxkIiwgImdldFdvcmxkSGFuZGxlcnMiXQp9Cg==
