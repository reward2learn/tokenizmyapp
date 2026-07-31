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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2xpYi9wYWdlLWNhdGFsb2cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL3dvcmtmbG93L3NyYy9pbnRlcm5hbC9idWlsdGlucy50cyIsICIuLi9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL3N0ZGxpYi50cyIsICIuLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLnRzIiwgIi4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svZXh0cmFjdC1zaGVldHMudHMiLCAiLi4vc3JjL2RvbWFpbi9haS13b3JrYm9vay9zaGVldC1hbmFseXNpcy50cyIsICIuLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL2NvbXByZWhlbmQudHMiLCAiLi4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9wcm9ncmVzcy50cyIsICIuLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L2RiLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvYnVpbGRlcnMvc3JjL3NlcmRlLWNoZWNrZXIudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9ydW50aW1lLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvd29ya2Zsb3cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9ydW50aW1lL3Jlc3VtZS1ob29rLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIENvZGUtZmlyc3QgcGFnZSBjYXRhbG9nIFx1MjAxNCBydW50aW1lIFNTb1QgYXQgTVZQLlxuICogU3VwcG9ydHMgc3RhdGljIGNhdGFsb2cgZW50cmllcyBhbmQgZHluYW1pY2FsbHkgcmVnaXN0ZXJlZCBwYWdlc1xuICogKGUuZy4gZnJvbSB3b3JrYm9vayBhbmFseXNpcyBhZnRlciBhbiBFeGNlbCB1cGxvYWQpLlxuICpcbiAqIERCIEFwcFBhZ2UvUGFnZVNlY3Rpb24gc2VlZGVkIGluIFA2OyBjYXRhbG9nIHdpbnMgYXQgcnVudGltZS5cbiAqLyAvKiogUGFydHMgZnJvbSB0aGUgdXBsb2FkZWQgQnVzaW5lc3MgUmV2aWV3IFx1MjAxNCBwb3B1bGF0ZWQgZHluYW1pY2FsbHkgYXQgcmVuZGVyIHRpbWUuICovIC8qKiBTdGF0aWMgcGFydHMgQVx1MjAxM0cgZXhpc3QgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aCBsZWdhY3kgc2VlZGVkIGRvY3MuIER5bmFtaWMgcGFydHMgb3ZlcnJpZGUgdGhlc2UuICovIGNvbnN0IFNUQVRJQ19QQVJUUyA9IHtcbiAgICAncGFydC1hJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtYScsXG4gICAgICAgIHBhcnRLZXk6ICdBJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEE6IEN1cnJlbnQgU2l0dWF0aW9uIFx1MjAxNCBUaGUgTnVtYmVycycsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtYic6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWInLFxuICAgICAgICBwYXJ0S2V5OiAnQicsXG4gICAgICAgIHRpdGxlOiAnUGFydCBCOiBUaGUgMTAtWWVhciBHcm93dGggTW9kZWwnLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWMnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1jJyxcbiAgICAgICAgcGFydEtleTogJ0MnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgQzogUmV2ZW51ZSBPcHRpbWl6YXRpb24gU3RyYXRlZ3knLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWQnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1kJyxcbiAgICAgICAgcGFydEtleTogJ0QnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRDogQ29zdCBNYW5hZ2VtZW50JyxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnXG4gICAgfSxcbiAgICAncGFydC1lJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtZScsXG4gICAgICAgIHBhcnRLZXk6ICdFJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEU6IFJpc2sgUmVnaXN0ZXInLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWYnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1mJyxcbiAgICAgICAgcGFydEtleTogJ0YnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRjogU3RhcldPUkxEIE1lbWJlcnNoaXAgUHJvZ3JhbScsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtZyc6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWcnLFxuICAgICAgICBwYXJ0S2V5OiAnRycsXG4gICAgICAgIHRpdGxlOiAnUGFydCBHOiBJbW1lZGlhdGUgQWN0aW9ucyAoTmV4dCAzMCBEYXlzKScsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH1cbn07XG4vKiogRHluYW1pYyBwYXJ0cyBwb3B1bGF0ZWQgZnJvbSBwYXJzZWQgQnVzaW5lc3MgUmV2aWV3IE1EIHVwbG9hZGVkIHZpYSAvY29uZmlnLiAqLyBsZXQgRFlOQU1JQ19QQVJUUyA9IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIHNldER5bmFtaWNSZXZpZXdQYXJ0cyhwYXJ0cykge1xuICAgIERZTkFNSUNfUEFSVFMgPSBPYmplY3QuZnJvbUVudHJpZXMocGFydHMubWFwKChwKT0+W1xuICAgICAgICAgICAgcC5wYXJ0U2x1ZyxcbiAgICAgICAgICAgIHBcbiAgICAgICAgXSkpO1xufVxuLyoqXG4gKiBEeW5hbWljIGdldHRlciB0aGF0IG1lcmdlcyBzdGF0aWMgKyBhbnkgcnVudGltZS1yZWdpc3RlcmVkIHBhcnRzLlxuICogVXNlIGluc3RlYWQgb2YgUkVWSUVXX1BBUlRfQ0FUQUxPRyBzbyB0aGF0IHNldER5bmFtaWNSZXZpZXdQYXJ0cygpIGNhbGxzXG4gKiBhcmUgcmVmbGVjdGVkIGltbWVkaWF0ZWx5LlxuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5TVEFUSUNfUEFSVFMsXG4gICAgICAgIC4uLkRZTkFNSUNfUEFSVFNcbiAgICB9O1xufVxuLyoqIEBkZXByZWNhdGVkIFVzZSBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpIFx1MjAxNCB0aGlzIGNvbnN0IGlzIGZyb3plbiBhdCBtb2R1bGUgbG9hZCB0aW1lLiAqLyBleHBvcnQgY29uc3QgUkVWSUVXX1BBUlRfQ0FUQUxPRyA9IHtcbiAgICAuLi5TVEFUSUNfUEFSVFMsXG4gICAgLi4uRFlOQU1JQ19QQVJUU1xufTtcbi8qKiBEeW5hbWljIHBhZ2VzIHJlZ2lzdGVyZWQgYXQgcnVudGltZSAoZS5nLiBmcm9tIHdvcmtib29rIGFuYWx5c2lzIGFmdGVyIHJlc2VlZCkuICovIGxldCBEWU5BTUlDX1BBR0VTID0ge307XG4vKipcbiAqIFJlZ2lzdGVyIGR5bmFtaWNhbGx5IGdlbmVyYXRlZCBwYWdlcyBcdTIwMTQgY2FsbGVkIGFmdGVyIHdvcmtib29rIGFuYWx5c2lzXG4gKiBkdXJpbmcgdGhlIHJlc2VlZCBwaXBlbGluZSBzbyBzaGVldC1kZXJpdmVkIGFuYWx5dGljcyBwYWdlcyBhcHBlYXIgaW4gdGhlIG5hdi5cbiAqLyBleHBvcnQgZnVuY3Rpb24gc2V0RHluYW1pY1BhZ2VzKHBhZ2VzKSB7XG4gICAgRFlOQU1JQ19QQUdFUyA9IE9iamVjdC5mcm9tRW50cmllcyhwYWdlcy5tYXAoKHApPT5bXG4gICAgICAgICAgICBwLnNsdWcsXG4gICAgICAgICAgICBwXG4gICAgICAgIF0pKTtcbn1cbi8qKiBDb21iaW5lZCBzdGF0aWMgKyBkeW5hbWljIHBhZ2UgY2F0YWxvZyAoZXZhbHVhdGVkIGxhemlseSBzbyBkeW5hbWljIHBhZ2VzIGFyZSBpbmNsdWRlZCkuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRGdWxsQ2F0YWxvZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5QQUdFX0NBVEFMT0csXG4gICAgICAgIC4uLkRZTkFNSUNfUEFHRVNcbiAgICB9O1xufVxuZXhwb3J0IGNvbnN0IFBBR0VfQ0FUQUxPRyA9IHtcbiAgICBob21lOiB7XG4gICAgICAgIHNsdWc6ICdob21lJyxcbiAgICAgICAgdGl0bGU6ICdIb21lJyxcbiAgICAgICAgbmF2TGFiZWw6ICdIb21lJyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnaGVybycsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnV2VsY29tZScsXG4gICAgICAgICAgICAgICAgICAgIHN1YnRpdGxlOiAnWW91ciBidXNpbmVzcyBhcHBsaWNhdGlvbiBcdTIwMTQgY29uZmlndXJlIHBhZ2VzLCBkYXRhIGFuZCBicmFuZGluZyBmcm9tIHRoZSBBZG1pbiBhcmVhLicsXG4gICAgICAgICAgICAgICAgICAgIG1pblRpZXI6ICdwdWJsaWMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICBkYXNoYm9hcmQ6IHtcbiAgICAgICAgc2x1ZzogJ2Rhc2hib2FyZCcsXG4gICAgICAgIHRpdGxlOiAnRGFzaGJvYXJkJyxcbiAgICAgICAgbmF2TGFiZWw6ICdEYXNoYm9hcmQnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncHVibGljJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdoZXJvJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2U6ICdKdWx5IDIwMjYgXHUwMEI3IEV4aXQgVmlhYmlsaXR5IFJldmlldycsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnQnVzaW5lc3MgUmV2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgc3VidGl0bGU6ICdFeGl0LXZpYWJpbGl0eSBhc3Nlc3NtZW50IGZvciBQVCBUYW1hbiBCaW50YW5nIEJhbGkgXHUyMDE0IHJldmVudWUgdW5kZXIgcHJlc3N1cmUsIG1hcmdpbiBlcm9zaW9uIGRldGVjdGVkLCBzaGFyZWhvbGRlciBzZWVraW5nIHBhdGh3YXkgb3V0LicsXG4gICAgICAgICAgICAgICAgICAgIG1pblRpZXI6ICdwdWJsaWMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIC8vICAgY29uZmlnOiB7IHZhcmlhbnQ6ICdkYXNoYm9hcmQnLCBzY2VuYXJpbzogJ2NvbnNlcnZhdGl2ZScsIG1pblRpZXI6ICdnb29nbGUnIH0sXG4gICAgICAgICAgICAvLyB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2FjdGlvbl9jaGVja2xpc3QnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAncGluJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnbWV0cmljX2dyaWQnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAnZ29vZ2xlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnbGV2ZXJfYWNjb3JkaW9uJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdUaGUgNSBMZXZlcnMnLFxuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAnZ29vZ2xlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgc3VtbWFyeToge1xuICAgICAgICBzbHVnOiAnc3VtbWFyeScsXG4gICAgICAgIHRpdGxlOiAnRXhlY3V0aXZlIFN1bW1hcnknLFxuICAgICAgICBuYXZMYWJlbDogJ1N1bW1hcnknLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgcGRmRXhwb3J0OiB0cnVlLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ2V4ZWN1dGl2ZS1zdW1tYXJ5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ29wcy1hZG1pbic6IHtcbiAgICAgICAgc2x1ZzogJ29wcy1hZG1pbicsXG4gICAgICAgIHRpdGxlOiAnT3BzIEFkbWluJyxcbiAgICAgICAgbmF2TGFiZWw6ICdPcHMgQWRtaW4nLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgcmVxdWlyZWRHcm91cHM6IFtcbiAgICAgICAgICAgICdvcHMtYWRtaW4nXG4gICAgICAgIF0sXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnb3BzX2FkbWluX3RhYnMnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgcmV2aWV3OiB7XG4gICAgICAgIHNsdWc6ICdyZXZpZXcnLFxuICAgICAgICB0aXRsZTogJ0J1c2luZXNzIFJldmlldycsXG4gICAgICAgIG5hdkxhYmVsOiAnUmV2aWV3JyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZScsXG4gICAgICAgIHBkZkV4cG9ydDogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdyZXZpZXdfYmxvY2tzJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgICdvcHMtdHJhY2tpbmcnOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtdHJhY2tpbmcnLFxuICAgICAgICB0aXRsZTogJ0ZpbmFuY2lhbCBUcmFja2luZycsXG4gICAgICAgIG5hdkxhYmVsOiAnVHJhY2tpbmcnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdrcGlfY2FyZHMnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICB2YXJpYW50OiAnb3BzJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAncmVwb3J0c19yb2xsdXAnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudDogJ29wcydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ3BubF90YWJsZScsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICAnb3BzLWNoYXQnOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtY2hhdCcsXG4gICAgICAgIHRpdGxlOiAnQUkgQ2hhdCcsXG4gICAgICAgIG5hdkxhYmVsOiAnQUkgQ2hhdCcsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXRfcGFuZWwnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgdGFza3M6IHtcbiAgICAgICAgc2x1ZzogJ3Rhc2tzJyxcbiAgICAgICAgdGl0bGU6ICdFeGl0LVZpYWJpbGl0eSBUYXNrcycsXG4gICAgICAgIG5hdkxhYmVsOiAnVGFza3MnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICBhZG1pbjoge1xuICAgICAgICBzbHVnOiAnYWRtaW4nLFxuICAgICAgICB0aXRsZTogJ1BsYXRmb3JtIEFkbWluJyxcbiAgICAgICAgbmF2TGFiZWw6ICdBZG1pbicsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwaW4nLFxuICAgICAgICBzZWN0aW9uczogW11cbiAgICB9LFxuICAgIGNvbmZpZzoge1xuICAgICAgICBzbHVnOiAnY29uZmlnJyxcbiAgICAgICAgdGl0bGU6ICdTb3VyY2UgQ29uZmlnJyxcbiAgICAgICAgbmF2TGFiZWw6ICdDb25maWcnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICAndGVybXMtb2Ytc2VydmljZSc6IHtcbiAgICAgICAgc2x1ZzogJ3Rlcm1zLW9mLXNlcnZpY2UnLFxuICAgICAgICB0aXRsZTogJ1Rlcm1zIG9mIFNlcnZpY2UnLFxuICAgICAgICBzaG93SW5OYXY6IGZhbHNlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnZG9jX21hcmtkb3duJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAndGVybXMtb2Ytc2VydmljZS5odG1sJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ3ByaXZhY3ktcG9saWN5Jzoge1xuICAgICAgICBzbHVnOiAncHJpdmFjeS1wb2xpY3knLFxuICAgICAgICB0aXRsZTogJ1ByaXZhY3kgUG9saWN5JyxcbiAgICAgICAgc2hvd0luTmF2OiBmYWxzZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwdWJsaWMnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ3ByaXZhY3ktcG9saWN5Lmh0bWwnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfVxufTtcbmNvbnN0IFRJRVJfUkFOSyA9IHtcbiAgICBwdWJsaWM6IDAsXG4gICAgcGluOiAxLFxuICAgIGdvb2dsZTogMlxufTtcbmV4cG9ydCBmdW5jdGlvbiB0aWVyQWxsb3dzQWNjZXNzKGN1cnJlbnQsIHJlcXVpcmVkKSB7XG4gICAgcmV0dXJuIFRJRVJfUkFOS1tjdXJyZW50XSA+PSBUSUVSX1JBTktbcmVxdWlyZWRdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxpc3ROYXZQYWdlcyh0aWVyLCBncm91cHMgPSBbXSkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGdldEZ1bGxDYXRhbG9nKCkpLmZpbHRlcigocCk9PnAuc2hvd0luTmF2ICE9PSBmYWxzZSkuZmlsdGVyKChwKT0+dGllckFsbG93c0FjY2Vzcyh0aWVyLCBwLmF1dGhUaWVyKSkuZmlsdGVyKChwKT0+IXAucmVxdWlyZWRHcm91cHMgfHwgcC5yZXF1aXJlZEdyb3Vwcy5sZW5ndGggPT09IDAgfHwgZ3JvdXBzLmluY2x1ZGVzKCdwbGF0Zm9ybS1hZG1pbicpIHx8IHAucmVxdWlyZWRHcm91cHMuc29tZSgoZyk9Pmdyb3Vwcy5pbmNsdWRlcyhnKSkpLnNvcnQoKGEsIGIpPT5hLnRpdGxlLmxvY2FsZUNvbXBhcmUoYi50aXRsZSkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYWdlKHNsdWcpIHtcbiAgICByZXR1cm4gZ2V0RnVsbENhdGFsb2coKVtzbHVnXSA/PyBudWxsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVSZXZpZXdQYXJ0KHBhcnRTbHVnKSB7XG4gICAgcmV0dXJuIGdldFJldmlld1BhcnRDYXRhbG9nKClbcGFydFNsdWddID8/IG51bGw7XG59XG5leHBvcnQgZnVuY3Rpb24gbGlzdFJldmlld1BhcnRzKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGdldFJldmlld1BhcnRDYXRhbG9nKCkpLnNvcnQoKGEsIGIpPT5hLnBhcnRLZXkubG9jYWxlQ29tcGFyZShiLnBhcnRLZXkpKTtcbn1cbi8qKiBEZXNjcmlwdGl2ZSB0aXRsZSB3aXRob3V0IHRoZSBcIlBhcnQgWDogXCIgY2F0YWxvZyBwcmVmaXguICovIGV4cG9ydCBmdW5jdGlvbiBnZXRSZXZpZXdQYXJ0RGlzcGxheVRpdGxlKHRpdGxlKSB7XG4gICAgcmV0dXJuIHRpdGxlLnJlcGxhY2UoL15QYXJ0IFtBLU9dOiAvLCAnJyk7XG59XG4iLCAiLyoqXG4gKiBUaGVzZSBhcmUgdGhlIGJ1aWx0LWluIHN0ZXBzIHRoYXQgYXJlIFwiYXV0b21hdGljYWxseSBhdmFpbGFibGVcIiBpbiB0aGUgd29ya2Zsb3cgc2NvcGUuIFRoZXkgYXJlXG4gKiBzaW1pbGFyIHRvIFwic3RkbGliXCIgZXhjZXB0IHRoYXQgYXJlIG5vdCBtZWFudCB0byBiZSBpbXBvcnRlZCBieSB1c2VycywgYnV0IGFyZSBpbnN0ZWFkIFwianVzdCBhdmFpbGFibGVcIlxuICogYWxvbmdzaWRlIHVzZXIgZGVmaW5lZCBzdGVwcy4gVGhleSBhcmUgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBydW50aW1lXG4gKi9cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV9hcnJheV9idWZmZXIoXG4gIHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZVxuKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmFycmF5QnVmZmVyKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfanNvbih0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2UpIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIHRoaXMuanNvbigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX3RleHQodGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLnRleHQoKTtcbn1cbiIsICIvKipcbiAqIFRoaXMgaXMgdGhlIFwic3RhbmRhcmQgbGlicmFyeVwiIG9mIHN0ZXBzIHRoYXQgd2UgbWFrZSBhdmFpbGFibGUgdG8gYWxsIHdvcmtmbG93IHVzZXJzLlxuICogVGhlIGNhbiBiZSBpbXBvcnRlZCBsaWtlIHNvOiBgaW1wb3J0IHsgZmV0Y2ggfSBmcm9tICd3b3JrZmxvdydgLiBhbmQgdXNlZCBpbiB3b3JrZmxvdy5cbiAqIFRoZSBuZWVkIHRvIGJlIGV4cG9ydGVkIGRpcmVjdGx5IGluIHRoaXMgcGFja2FnZSBhbmQgY2Fubm90IGxpdmUgaW4gYGNvcmVgIHRvIHByZXZlbnRcbiAqIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBwb3N0LWNvbXBpbGF0aW9uLlxuICovXG5cbi8qKlxuICogQSBob2lzdGVkIGBmZXRjaCgpYCBmdW5jdGlvbiB0aGF0IGlzIGV4ZWN1dGVkIGFzIGEgXCJzdGVwXCIgZnVuY3Rpb24sXG4gKiBmb3IgdXNlIHdpdGhpbiB3b3JrZmxvdyBmdW5jdGlvbnMuXG4gKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRmV0Y2hfQVBJXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaCguLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBnbG9iYWxUaGlzLmZldGNoPikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gZ2xvYmFsVGhpcy5mZXRjaCguLi5hcmdzKTtcbn1cbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG4vKipcbiAqIFN0ZXAgZnVuY3Rpb25zIGZvciB0aGUgd29ya2Jvb2staW5nZXN0IHdvcmtmbG93LlxuICpcbiAqIEVhY2ggZXhwb3J0ZWQgYXN5bmMgZnVuY3Rpb24gd2l0aCB0aGUgYCd1c2Ugc3RlcCdgIGRpcmVjdGl2ZSBpcyBhIGR1cmFibGVcbiAqIHN0ZXA6IGl0cyBhcmdzIGFuZCByZXN1bHQgYXJlIHNlcmlhbGl6ZWQgdG8gdGhlIGV2ZW50IGxvZywgYW5kIGl0IHJldHJpZXNcbiAqIChtYXggMywgb3IgcGVyIFJldHJ5YWJsZUVycm9yKSBiZWZvcmUgdGhlIGVycm9yIGJ1YmJsZXMgdG8gdGhlIHdvcmtmbG93LlxuICovIGltcG9ydCB7IEZhdGFsRXJyb3IsIFJldHJ5YWJsZUVycm9yIH0gZnJvbSAnd29ya2Zsb3cnO1xuaW1wb3J0IHsgZXh0cmFjdFNoZWV0c1dpdGhTdGF0cyB9IGZyb20gJy4uLy4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svZXh0cmFjdC1zaGVldHMnO1xuaW1wb3J0IHsgYW5hbHl6ZVNoZWV0cyB9IGZyb20gJy4uLy4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svc2hlZXQtYW5hbHlzaXMnO1xuaW1wb3J0IHsgY29tcHJlaGVuZE9uY2UsIENvbXByZWhlbmRIdHRwRXJyb3IsIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL2NvbXByZWhlbmQnO1xuaW1wb3J0IHsgd3JpdGVQcm9ncmVzc0NodW5rLCBjbG9zZVByb2dyZXNzU3RyZWFtIH0gZnJvbSAnLi9wcm9ncmVzcyc7XG5pbXBvcnQgeyB3aXRoUGdDbGllbnQsIGV4ZWN1dGVPbmUsIHF1ZXJ5Um93cyB9IGZyb20gJy4vZGInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcIndvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMudHNcIjp7XCJhbmFseXplU2hlZXRzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9hbmFseXplU2hlZXRzU3RlcFwifSxcImNsb3NlUHJvZ3Jlc3NTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2Nsb3NlUHJvZ3Jlc3NTdGVwXCJ9LFwiY29tcHJlaGVuZFdvcmtib29rU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9jb21wcmVoZW5kV29ya2Jvb2tTdGVwXCJ9LFwiZW1pdFByb2dyZXNzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9lbWl0UHJvZ3Jlc3NTdGVwXCJ9LFwiZXh0cmFjdFNoZWV0c1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZXh0cmFjdFNoZWV0c1N0ZXBcIn0sXCJnZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcFwifSxcImdlbmVyYXRlRGFzaGJvYXJkU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZURhc2hib2FyZFN0ZXBcIn0sXCJnZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXBcIn0sXCJsb2FkV29ya2Jvb2tTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2xvYWRXb3JrYm9va1N0ZXBcIn0sXCJwb3B1bGF0ZVByb2plY3Rpb25zU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9wb3B1bGF0ZVByb2plY3Rpb25zU3RlcFwifSxcInJlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9yZWdpc3RlckR5bmFtaWNQYWdlc1N0ZXBcIn0sXCJzYXZlU25pcHBldHNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NhdmVTbmlwcGV0c1N0ZXBcIn0sXCJzZWxlY3RUZW1wbGF0ZVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2VsZWN0VGVtcGxhdGVTdGVwXCJ9LFwidXBzZXJ0U2hlZXRQYWdlc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vdXBzZXJ0U2hlZXRQYWdlc1N0ZXBcIn19fX0qLztcbi8qKiBEZXRlY3QgdGhlIGZpbGUgc2lnbmF0dXJlcyBvZiByZWFsIHNwcmVhZHNoZWV0IGZpbGVzICh6aXAveGxzeCwgQklGRi94bHMpLiAqLyBmdW5jdGlvbiBoYXNTcHJlYWRzaGVldE1hZ2ljKGRhdGEpIHtcbiAgICBjb25zdCBiID0gZGF0YTtcbiAgICAvLyBQS1xceDAzXFx4MDQgKHppcCBcdTIxOTIgeGxzeCkgb3IgUEtcXHgwNVxceDA2IChlbXB0eSB6aXApXG4gICAgaWYgKGJbMF0gPT09IDB4NTAgJiYgYlsxXSA9PT0gMHg0YikgcmV0dXJuIHRydWU7XG4gICAgLy8gRDAgQ0YgMTEgRTAgQTEgQjEgMUEgRTEgKE9MRTIgY29tcG91bmQgXHUyMTkyIC54bHMpXG4gICAgaWYgKGJbMF0gPT09IDB4ZDAgJiYgYlsxXSA9PT0gMHhjZiAmJiBiWzJdID09PSAweDExICYmIGJbM10gPT09IDB4ZTAgJiYgYls0XSA9PT0gMHhhMSAmJiBiWzVdID09PSAweGIxICYmIGJbNl0gPT09IDB4MWEgJiYgYls3XSA9PT0gMHhlMSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuLyoqXG4gKiBDb252ZXJ0IHJhdyB1cGxvYWQgYnl0ZXMgaW50byB4bHN4IGJ1ZmZlcnMuXG4gKlxuICogVWludDhBcnJheSBpcyBzZXJpYWxpemFibGUgYWNyb3NzIHRoZSB3b3JrZmxvdyBib3VuZGFyeTsgQnVmZmVyIGlzIG5vdFxuICogZ3VhcmFudGVlZCBpbiB3b3JrZmxvdyBzdGVwIHNhbmRib3hlcywgc28gd2Uga2VlcCBVaW50OEFycmF5IGV2ZXJ5d2hlcmVcbiAqIGFuZCBoYW5kIGl0IGRpcmVjdGx5IHRvIGB4bHN4LnJlYWQoeyB0eXBlOiAnYnVmZmVyJyB9KWAuXG4gKlxuICogU2hlZXRKUyBpcyBsZW5pZW50IHdpdGggYXJiaXRyYXJ5IHRleHQgKGl0IHBhcnNlcyBwbGFpbiB0ZXh0IGFzIGEgMS1jb2x1bW5cbiAqIHNoZWV0KSwgc28gd2UgdmFsaWRhdGUgdGhlIG1hZ2ljIGJ5dGVzIEJFRk9SRSBwYXJzaW5nIHRvIGNhdGNoIHVwbG9hZHMgb2ZcbiAqIHRoZSB3cm9uZyBmaWxlIHR5cGUgd2l0aCBhIGNsZWFuIEZhdGFsRXJyb3IuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRXb3JrYm9va1N0ZXAoZmlsZXMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZmlsZXMpIHx8IGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcignTm8gd29ya2Jvb2sgZmlsZXMgd2VyZSBwcm92aWRlZC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGVzLm1hcCgoZik9PntcbiAgICAgICAgaWYgKCFmIHx8IHR5cGVvZiBmLm5hbWUgIT09ICdzdHJpbmcnIHx8ICEoZi5kYXRhIGluc3RhbmNlb2YgVWludDhBcnJheSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdJbnZhbGlkIGZpbGUgZW50cnk6IGV4cGVjdGVkIHsgbmFtZSwgZGF0YTogVWludDhBcnJheSB9LicpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmLmRhdGEuYnl0ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYFdvcmtib29rIFwiJHtmLm5hbWV9XCIgaXMgZW1wdHkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYXNTcHJlYWRzaGVldE1hZ2ljKGYuZGF0YSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBXb3JrYm9vayBcIiR7Zi5uYW1lfVwiIGlzIG5vdCBhIHJlYWRhYmxlIC54bHN4Ly54bHMgZmlsZSAodW5leHBlY3RlZCBmaWxlIHNpZ25hdHVyZSkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGYuZGF0YTtcbiAgICB9KTtcbn1cbi8qKiBFWFRSQUNUOiBzZXJpYWxpemUgZXZlcnkgc2hlZXQgdG8gdGV4dCArIHN0cnVjdHVyYWwgc3RhdHMuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHRyYWN0U2hlZXRzU3RlcChidWZmZXJzKSB7XG4gICAgY29uc3QgYWxsID0gW107XG4gICAgZm9yIChjb25zdCBidWYgb2YgYnVmZmVycyl7XG4gICAgICAgIGxldCBleHRyYWN0ZWQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBleHRyYWN0ZWQgPSBleHRyYWN0U2hlZXRzV2l0aFN0YXRzKGJ1Zik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYFdvcmtib29rIGlzIG5vdCBhIHJlYWRhYmxlIC54bHN4IGZpbGU6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgICAgICB9XG4gICAgICAgIGFsbC5wdXNoKC4uLmV4dHJhY3RlZCk7XG4gICAgfVxuICAgIGlmIChhbGwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdXb3JrYm9vayBjb250YWlucyBubyByZWFkYWJsZSBzaGVldHMuJyk7XG4gICAgfVxuICAgIHJldHVybiBhbGw7XG59XG4vKiogQU5BTFlaRTogZGV0ZXJtaW5pc3RpYyBwcmUtcGFzcyBwcm9kdWNpbmcgc3RydWN0dXJlZCBoaW50cy4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFuYWx5emVTaGVldHNTdGVwKHNoZWV0cykge1xuICAgIHJldHVybiBhbmFseXplU2hlZXRzKHNoZWV0cyk7XG59XG4vKipcbiAqIENPTVBSRUhFTkQ6IG9uZSBPcGVuQUkgY2FsbCAoZ3B0LTRvLCBqc29uX29iamVjdCwgWm9kLXZhbGlkYXRlZCkgd2l0aCB0aGVcbiAqIGRldGVybWluaXN0aWMgQU5BTFlTSVMgaGludHMgaW5qZWN0ZWQgaW50byB0aGUgcHJvbXB0LlxuICpcbiAqIFJldHJ5IHBvbGljeSAoXHUwMEE3NC4yIG9mIHRoZSByb2FkbWFwKTpcbiAqICAgLSA0MjkgICAgICAgICAgICBcdTIxOTIgUmV0cnlhYmxlRXJyb3IoeyByZXRyeUFmdGVyIH0pIHVzaW5nIFJldHJ5LUFmdGVyIGhlYWRlciAoZmFsbGJhY2sgMXMpXG4gKiAgIC0gNXh4IC8gbmV0d29yayAgXHUyMTkyIHBsYWluIEVycm9yIFx1MjE5MiBTREsgYXV0by1yZXRyeSAobWF4IDMpXG4gKiAgIC0gbWlzc2luZyBrZXkgICAgXHUyMTkyIEZhdGFsRXJyb3IgKHBlcm1hbmVudCwgbm8gcmV0cnkgc3Rvcm0pXG4gKiAgIC0gc2NoZW1hIHJlamVjdGVkIFx1MjE5MiBwbGFpbiBFcnJvciBcdTIxOTIgU0RLIGF1dG8tcmV0cmllcyAobW9kZWwgb3V0cHV0IGlzIHN0b2NoYXN0aWNcbiAqICAgICAgICAgICAgICAgICAgICAgIGF0IHRlbXBlcmF0dXJlIDAuMik7IHJ1biBmYWlscyB3aXRoIGEgY2xlYXIgbWVzc2FnZSBhZnRlclxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIFNESydzIHJldHJ5IGJ1ZGdldCBpcyBleGhhdXN0ZWQuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXByZWhlbmRXb3JrYm9va1N0ZXAoc2hlZXRzLCBoaW50cywgbW9kZWwgPSAnZ3B0LTRvJywgb3BlbmFpQXBpS2V5KSB7XG4gICAgY29uc3QgYXBpS2V5ID0gb3BlbmFpQXBpS2V5IHx8IHByb2Nlc3MuZW52Lk9QRU5BSV9BUElfS0VZO1xuICAgIGlmICghYXBpS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdPcGVuQUkgQVBJIGtleSBub3QgY29uZmlndXJlZC4gU2V0IGl0IGluIENvbmZpZyA+IE9wZW5BSSBLZXkgKHZpYSB0aGUgcmVzZWVkIHJvdXRlKSBvciBzZXQgT1BFTkFJX0FQSV9LRVkgZW52IHZhci4nKTtcbiAgICB9XG4gICAgY29uc3QgYmxvY2tzID0gc2hlZXRzLm1hcCgoeyB0YWJOYW1lLCB0ZXh0IH0pPT4oe1xuICAgICAgICAgICAgdGFiTmFtZSxcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgfSkpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjb21wcmVoZW5kT25jZShibG9ja3MsIHtcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgaGludHMsXG4gICAgICAgICAgICBhcGlLZXlcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDb21wcmVoZW5kSHR0cEVycm9yKSB7XG4gICAgICAgICAgICBpZiAoZXJyLnN0YXR1cyA9PT0gNDI5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0cnlBZnRlclNlY29uZHMgPSBlcnIucmV0cnlBZnRlclNlY29uZHMgPz8gMTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmV0cnlhYmxlRXJyb3IoZXJyLm1lc3NhZ2UsIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0cnlBZnRlcjogYCR7cmV0cnlBZnRlclNlY29uZHN9c2BcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIDV4eCBldGMgXHUyMTkyIHBsYWluIEVycm9yIFx1MjE5MiBTREsgYXV0by1yZXRyeSAobWF4IDMpXG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFNjaGVtYS9KU09OIHJlamVjdGlvbiBcdTIwMTQgdGhlIG1vZGVsIG1heSBwcm9kdWNlIHZhbGlkIG91dHB1dCBvbiByZXRyeS5cbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgfVxufVxuLyoqXG4gKiBFbWl0IGEgcHJvZ3Jlc3MgY2h1bmsgdG8gdGhlIHJ1bidzIHdyaXRhYmxlIHN0cmVhbSAoU1NFIHBheWxvYWQpLlxuICogTXVzdCBiZSBhIHN0ZXA6IHdvcmtmbG93IGZ1bmN0aW9ucyBjYW5ub3QgaW50ZXJhY3Qgd2l0aCB0aGUgc3RyZWFtIGRpcmVjdGx5LlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbWl0UHJvZ3Jlc3NTdGVwKHdyaXRhYmxlLCBjaHVuaykge1xuICAgIGF3YWl0IHdyaXRlUHJvZ3Jlc3NDaHVuayh3cml0YWJsZSwgY2h1bmspO1xufVxuLyoqXG4gKiBDbG9zZSB0aGUgcnVuJ3Mgd3JpdGFibGUgc3RyZWFtLCBzaWduYWxpbmcgY29tcGxldGlvbiB0byBzdHJlYW0gcmVhZGVycy5cbiAqIE11c3QgYmUgYSBzdGVwOiB3b3JrZmxvdyBmdW5jdGlvbnMgY2Fubm90IGludGVyYWN0IHdpdGggdGhlIHN0cmVhbSBkaXJlY3RseS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0ZXAod3JpdGFibGUpIHtcbiAgICBhd2FpdCBjbG9zZVByb2dyZXNzU3RyZWFtKHdyaXRhYmxlKTtcbn1cbi8vIFx1MjUwMFx1MjUwMCBQaGFzZSAzOiBQT1BVTEFURSBzdGVwcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8qKlxuICogVXBzZXJ0IGZpbmFuY2lhbCBwcm9qZWN0aW9ucyBmcm9tIHRoZSBBSSBjb21wcmVoZW5zaW9uLlxuICogSWRlbXBvdGVudDogT04gQ09ORkxJQ1QgKHBlcmlvZCwgZGF0YV90eXBlLCBzY2VuYXJpbykgRE8gVVBEQVRFLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBwb3B1bGF0ZVByb2plY3Rpb25zU3RlcChjb21wcmVoZW5zaW9uLCBkYlVybCkge1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgIGZvciAoY29uc3QgbWV0cmljIG9mIGNvbXByZWhlbnNpb24ucHJvamVjdGlvbnMpe1xuICAgICAgICAgICAgY29uc3QgeWVhciA9IE51bWJlcihtZXRyaWMucGVyaW9kLnNsaWNlKDAsIDQpKTtcbiAgICAgICAgICAgIGNvbnN0IG1vbnRoID0gTnVtYmVyKG1ldHJpYy5wZXJpb2Quc2xpY2UoNSwgNykpO1xuICAgICAgICAgICAgY29uc3QgcmV2ZW51ZSA9IE1hdGgucm91bmQobWV0cmljLnJldmVudWUgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBlYml0ZGEgPSBNYXRoLnJvdW5kKG1ldHJpYy5lYml0ZGEgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBuZXRJbmNvbWUgPSBNYXRoLnJvdW5kKG1ldHJpYy5uZXRJbmNvbWUgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBndWVzdHMgPSBNYXRoLnJvdW5kKG1ldHJpYy5ndWVzdHMgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBzdGFmZkNvc3QgPSBNYXRoLnJvdW5kKG1ldHJpYy5zdGFmZkNvc3QgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBwbmxMaW5lcyA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ3JldmVudWUnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1JldmVudWUnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmV2ZW51ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdlYml0ZGEnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VCSVREQScsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBlYml0ZGFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnbmV0X2luY29tZScsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTmV0IEluY29tZScsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBuZXRJbmNvbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnc3RhZmZfY29zdCcsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU3RhZmYgQ29zdCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzdGFmZkNvc3RcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnZ3Vlc3RzJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdHdWVzdHMnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZ3Vlc3RzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gZmluYW5jaWFsX3Byb2plY3Rpb25zIChwZXJpb2QsIHllYXIsIG1vbnRoLCBkYXRhX3R5cGUsIHNjZW5hcmlvLCByZXZlbnVlLCBlYml0ZGEsIG5ldF9pbmNvbWUsIGd1ZXN0cywgc3RhZmZfY29zdCwgcG5sX2xpbmVzKVxuICAgICAgICAgVkFMVUVTICgkMSwgJDIsICQzLCAkNCwgJDUsICQ2LCAkNywgJDgsICQ5LCAkMTAsICQxMTo6anNvbmIpXG4gICAgICAgICBPTiBDT05GTElDVCAocGVyaW9kLCBkYXRhX3R5cGUsIHNjZW5hcmlvKVxuICAgICAgICAgRE8gVVBEQVRFIFNFVFxuICAgICAgICAgICByZXZlbnVlID0gRVhDTFVERUQucmV2ZW51ZSxcbiAgICAgICAgICAgZWJpdGRhID0gRVhDTFVERUQuZWJpdGRhLFxuICAgICAgICAgICBuZXRfaW5jb21lID0gRVhDTFVERUQubmV0X2luY29tZSxcbiAgICAgICAgICAgZ3Vlc3RzID0gRVhDTFVERUQuZ3Vlc3RzLFxuICAgICAgICAgICBzdGFmZl9jb3N0ID0gRVhDTFVERUQuc3RhZmZfY29zdCxcbiAgICAgICAgICAgcG5sX2xpbmVzID0gRVhDTFVERUQucG5sX2xpbmVzO2AsIFtcbiAgICAgICAgICAgICAgICBtZXRyaWMucGVyaW9kLFxuICAgICAgICAgICAgICAgIHllYXIsXG4gICAgICAgICAgICAgICAgbW9udGgsXG4gICAgICAgICAgICAgICAgbWV0cmljLmRhdGFUeXBlLFxuICAgICAgICAgICAgICAgIG1ldHJpYy5zY2VuYXJpbyxcbiAgICAgICAgICAgICAgICByZXZlbnVlLFxuICAgICAgICAgICAgICAgIGViaXRkYSxcbiAgICAgICAgICAgICAgICBuZXRJbmNvbWUsXG4gICAgICAgICAgICAgICAgZ3Vlc3RzLFxuICAgICAgICAgICAgICAgIHN0YWZmQ29zdCxcbiAgICAgICAgICAgICAgICBwbmxMaW5lc1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvdW50O1xufVxuLyoqIE5vcm1hbGl6ZSBhIHNoZWV0IHRhYiBuYW1lIGludG8gYSBVUkwtc2FmZSBzbHVnLiAqLyBmdW5jdGlvbiBub3JtYWxpemVTbHVnKG5hbWUpIHtcbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1smXS9nLCAnYW5kJykucmVwbGFjZSgvW1xcc10rL2csICctJykucmVwbGFjZSgvW15hLXowLTktXS9nLCAnJykucmVwbGFjZSgvLSsvZywgJy0nKS5yZXBsYWNlKC9eLXwtJC9nLCAnJyk7XG59XG4vKiogUGFnZSBibG9ja3MgcGVyIHNoZWV0IGNhdGVnb3J5IChtaXJyb3JzIHBpcGVsaW5lLnRzIENBVEVHT1JZX0JMT0NLUykuICovIGNvbnN0IFNIRUVUX0NBVEVHT1JZX0JMT0NLUyA9IHtcbiAgICBkYWlseV9zYWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdEYWlseSBTYWxlcyBcdTIwMTQgRGF0YSdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnRGFpbHkgU2FsZXMgXHUyMDE0IFRyZW5kcydcbiAgICAgICAgfVxuICAgIF0sXG4gICAgcHJvZml0X2xvc3M6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAncG5sX3RhYmxlJyxcbiAgICAgICAgICAgIHRpdGxlOiAnUHJvZml0ICYgTG9zcyBcdTIwMTQgU3RhdGVtZW50J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdQcm9maXQgJiBMb3NzIFx1MjAxNCBUcmVuZHMnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIGJhbGFuY2Vfc2hlZXQ6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnQmFsYW5jZSBTaGVldCBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgdHJpYWxfYmFsYW5jZTogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdUcmlhbCBCYWxhbmNlIFx1MjAxNCBEYXRhJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBnZW5lcmFsX2xlZGdlcjogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdHZW5lcmFsIExlZGdlciBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgY29zdF9vZl9zYWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdDb3N0IG9mIFNhbGVzIFx1MjAxNCBEYXRhJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBtb250aF9vbl9tb250aDogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdNb250aCBvbiBNb250aCBcdTIwMTQgQ29tcGFyaXNvbidcbiAgICAgICAgfVxuICAgIF0sXG4gICAgYnJlYWtfZXZlbjogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdrcGlfY2FyZHMnLFxuICAgICAgICAgICAgdGl0bGU6ICdCcmVhay1FdmVuIFx1MjAxNCBLUElzJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdCcmVhay1FdmVuIFx1MjAxNCBUcmVuZCdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgdmFyaWFuY2U6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTW9udGhseSBWYXJpYW5jZSBcdTIwMTQgQW5hbHlzaXMnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIHN1bW1hcnlfcGw6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTXVsdGktWWVhciBQJkwgXHUyMDE0IFRyZW5kJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdwbmxfdGFibGUnLFxuICAgICAgICAgICAgdGl0bGU6ICdNdWx0aS1ZZWFyIFAmTCBcdTIwMTQgU3RhdGVtZW50J1xuICAgICAgICB9XG4gICAgXSxcbiAgICBzdW1tYXJ5X2JzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3NoZWV0X3ZpZXdlcicsXG4gICAgICAgICAgICB0aXRsZTogJ011bHRpLVllYXIgQmFsYW5jZSBTaGVldCBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgb3RoZXI6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnU2hlZXQgRGF0YSdcbiAgICAgICAgfVxuICAgIF1cbn07XG4vKipcbiAqIENyZWF0ZS91cGRhdGUgZHluYW1pYyBhcHAgcGFnZXMgKyBwYWdlIHNlY3Rpb25zIGZvciBlYWNoIGNvbXByZWhlbmRlZCBzaGVldC5cbiAqXG4gKiBcdTAwQTc3LjEgRklYOiBPTiBDT05GTElDVCAoc2x1ZykgRE8gVVBEQVRFIC4uLiBSRVRVUk5JTkcgaWQgZW5zdXJlcyB3ZSBhbHdheXNcbiAqIGhhdmUgdGhlIGNvcnJlY3QgcGFnZSBJRCAobmV3IG9yIGV4aXN0aW5nKS4gUGFnZSBzZWN0aW9ucyBhcmUgZGVsZXRlZCBhbmRcbiAqIHJlLWluc2VydGVkIHNjb3BlZCB0byB0aGF0IGlkIFx1MjAxNCBubyBvcnBoYW4gRksgcmVmZXJlbmNlcy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBzZXJ0U2hlZXRQYWdlc1N0ZXAoY29tcHJlaGVuc2lvbiwgZGJVcmwsIHRlbmFudFNsdWcpIHtcbiAgICBjb25zdCBjcmVhdGVkID0gW107XG4gICAgbGV0IHNvcnRPcmRlciA9IDEwMDtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgZm9yIChjb25zdCBzaGVldCBvZiBjb21wcmVoZW5zaW9uLnNoZWV0cyl7XG4gICAgICAgICAgICBjb25zdCBzbHVnID0gYHNoZWV0LSR7bm9ybWFsaXplU2x1ZyhzaGVldC50YWJOYW1lKX1gO1xuICAgICAgICAgICAgY29uc3QgYmxvY2tzID0gU0hFRVRfQ0FURUdPUllfQkxPQ0tTW3NoZWV0LmNhdGVnb3J5XSA/PyBTSEVFVF9DQVRFR09SWV9CTE9DS1Mub3RoZXI7XG4gICAgICAgICAgICAvLyBcdTAwQTc3LjEgZml4OiBSRVRVUk5JTkcgaWQgZ2l2ZXMgdXMgdGhlIHJlYWwgcGFnZSBJRCBvbiBpbnNlcnQgT1IgY29uZmxpY3QuXG4gICAgICAgICAgICBjb25zdCBwYWdlUm93cyA9IGF3YWl0IHF1ZXJ5Um93cyhkYiwgYElOU0VSVCBJTlRPIGFwcF9wYWdlcyAoaWQsIHNsdWcsIHRpdGxlLCBhdXRoX3RpZXIsIHNvcnRfb3JkZXIsIG5hdl9sYWJlbCwgc2hvd19pbl9uYXYsIHRlbmFudF9zbHVnKVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICQyLCAnZ29vZ2xlJywgJDMsICQ0LCB0cnVlLCAkNSlcbiAgICAgICAgIE9OIENPTkZMSUNUIChzbHVnKSBETyBVUERBVEUgU0VUXG4gICAgICAgICAgIHRpdGxlID0gRVhDTFVERUQudGl0bGUsXG4gICAgICAgICAgIGF1dGhfdGllciA9IEVYQ0xVREVELmF1dGhfdGllcixcbiAgICAgICAgICAgc29ydF9vcmRlciA9IEVYQ0xVREVELnNvcnRfb3JkZXIsXG4gICAgICAgICAgIG5hdl9sYWJlbCA9IEVYQ0xVREVELm5hdl9sYWJlbCxcbiAgICAgICAgICAgc2hvd19pbl9uYXYgPSBFWENMVURFRC5zaG93X2luX25hdixcbiAgICAgICAgICAgdGVuYW50X3NsdWcgPSBDT0FMRVNDRShFWENMVURFRC50ZW5hbnRfc2x1ZywgYXBwX3BhZ2VzLnRlbmFudF9zbHVnKVxuICAgICAgICAgUkVUVVJOSU5HIGlkO2AsIFtcbiAgICAgICAgICAgICAgICBzbHVnLFxuICAgICAgICAgICAgICAgIHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgIHNvcnRPcmRlcisrLFxuICAgICAgICAgICAgICAgIHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgIHRlbmFudFNsdWcgPz8gbnVsbFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb25zdCBwYWdlSWQgPSBwYWdlUm93c1swXT8uaWQ7XG4gICAgICAgICAgICBpZiAoIXBhZ2VJZCkgY29udGludWU7XG4gICAgICAgICAgICAvLyBSZXBsYWNlIHNlY3Rpb25zIGZvciB0aGlzIHBhZ2UgKGlkZW1wb3RlbnQgb24gcmV0cnkpLlxuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYERFTEVURSBGUk9NIHBhZ2Vfc2VjdGlvbnMgV0hFUkUgcGFnZV9pZCA9ICQxO2AsIFtcbiAgICAgICAgICAgICAgICBwYWdlSWRcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeU1hcmtkb3duID0gW1xuICAgICAgICAgICAgICAgIGAjICR7c2hlZXQudGl0bGV9YCxcbiAgICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgICBzaGVldC5zdW1tYXJ5LFxuICAgICAgICAgICAgICAgIHNoZWV0LnBlcmlvZEhpbnQgPyBgXFxuKipQZXJpb2QqKjogJHtzaGVldC5wZXJpb2RIaW50fWAgOiAnJyxcbiAgICAgICAgICAgICAgICBgKipSb3dzKio6ICR7c2hlZXQucm93Q291bnQgPz8gJ1x1MjAxNCd9ICB8ICAqKkNvbHVtbnMqKjogJHsoc2hlZXQuY29sdW1ucyA/PyBbXSkubGVuZ3RoIHx8ICdcdTIwMTQnfWAsXG4gICAgICAgICAgICAgICAgJydcbiAgICAgICAgICAgIF0uZmlsdGVyKChsKT0+bCAhPT0gJycpLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgLy8gZG9jX21hcmtkb3duIGJsb2NrXG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gcGFnZV9zZWN0aW9ucyAoaWQsIHBhZ2VfaWQsIHNvcnRfb3JkZXIsIGJsb2NrX3R5cGUsIGNvbmZpZylcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAwLCAnZG9jX21hcmtkb3duJywgJDI6Ompzb25iKTtgLCBbXG4gICAgICAgICAgICAgICAgcGFnZUlkLFxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdBYm91dCB0aGlzIHNoZWV0JyxcbiAgICAgICAgICAgICAgICAgICAgbWFya2Rvd246IHN1bW1hcnlNYXJrZG93blxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIC8vIENhdGVnb3J5LXNwZWNpZmljIGJsb2Nrc1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgY29uc3QgYmxvY2sgPSBibG9ja3NbaV07XG4gICAgICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIHBhZ2Vfc2VjdGlvbnMgKGlkLCBwYWdlX2lkLCBzb3J0X29yZGVyLCBibG9ja190eXBlLCBjb25maWcpXG4gICAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAkMiwgJDMsICQ0Ojpqc29uYik7YCwgW1xuICAgICAgICAgICAgICAgICAgICBwYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgIGkgKyAxLFxuICAgICAgICAgICAgICAgICAgICBibG9jay5ibG9ja1R5cGUsXG4gICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWV0OiBzaGVldC50YWJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGJsb2NrLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjcmVhdGVkLnB1c2goe1xuICAgICAgICAgICAgICAgIHNsdWcsXG4gICAgICAgICAgICAgICAgdGl0bGU6IHNoZWV0LnRpdGxlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBdXRvLXBvcHVsYXRlIG5hdmlnYXRpb25faXRlbXM6IGFkZCBlYWNoIHNoZWV0IHBhZ2UgYXMgYSBjaGlsZCBvZiB0aGUgXCJFeGNlbFwiIGZvbGRlci5cbiAgICAgICAgLy8gRmluZCB0aGUgRXhjZWwgZm9sZGVyIGZpcnN0LCBvciBjcmVhdGUgaXQgaWYgaXQgZG9lc24ndCBleGlzdCB5ZXQuXG4gICAgICAgIGNvbnN0IGV4Y2VsRm9sZGVyID0gYXdhaXQgcXVlcnlSb3dzKGRiLCBgU0VMRUNUIGlkIEZST00gbmF2aWdhdGlvbl9pdGVtcyBXSEVSRSB0aXRsZSA9ICQxIEFORCBwYXJlbnRfaWQgSVMgTlVMTCBMSU1JVCAxYCwgW1xuICAgICAgICAgICAgJ0V4Y2VsJ1xuICAgICAgICBdKTtcbiAgICAgICAgbGV0IGV4Y2VsSWQgPSBleGNlbEZvbGRlclswXT8uaWQ7XG4gICAgICAgIGlmICghZXhjZWxJZCkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBFeGNlbCBmb2xkZXIgaWYgaXQgZG9lc24ndCBleGlzdCB5ZXRcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCBxdWVyeVJvd3MoZGIsIGBJTlNFUlQgSU5UTyBuYXZpZ2F0aW9uX2l0ZW1zIChpZCwgcGFyZW50X2lkLCBzb3J0X29yZGVyLCB0aXRsZSwgcGF0aCwgaWNvbiwgYXV0aF90aWVyLCByZXF1aXJlZF9ncm91cHMsIGlzX3Zpc2libGUsIGlzX2R5bmFtaWMpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCBOVUxMLCAoU0VMRUNUIENPQUxFU0NFKE1BWChzb3J0X29yZGVyKSwgMCkgKyAxIEZST00gbmF2aWdhdGlvbl9pdGVtcyBXSEVSRSBwYXJlbnRfaWQgSVMgTlVMTCksXG4gICAgICAgICAnRXhjZWwnLCAnL2V4Y2VsJywgJ0ZvbGRlcicsIENBU1QoJ2dvb2dsZScgQVMgXCJBdXRoVGllclwiKSwgJ3ZpZXdlcixvcHMtYWRtaW4sZmluYW5jZSxwbGF0Zm9ybS1hZG1pbicsIHRydWUsIHRydWUpXG4gICAgICAgICBSRVRVUk5JTkcgaWRgKTtcbiAgICAgICAgICAgIGV4Y2VsSWQgPSBjcmVhdGVkWzBdPy5pZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXhjZWxJZCkge1xuICAgICAgICAgICAgbGV0IG5hdlNvcnQgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzaGVldCBvZiBjb21wcmVoZW5zaW9uLnNoZWV0cyl7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2x1ZyA9IGBzaGVldC0ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YDtcbiAgICAgICAgICAgICAgICAvLyBTa2lwIGlmIGFscmVhZHkgcHJlc2VudFxuICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgcXVlcnlSb3dzKGRiLCBgU0VMRUNUIGlkIEZST00gbmF2aWdhdGlvbl9pdGVtcyBXSEVSRSBwYXRoID0gJDEgQU5EIHBhcmVudF9pZCA9ICQyIExJTUlUIDFgLCBbXG4gICAgICAgICAgICAgICAgICAgIGAvJHtzbHVnfWAsXG4gICAgICAgICAgICAgICAgICAgIGV4Y2VsSWRcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBuYXZpZ2F0aW9uX2l0ZW1zIChpZCwgcGFyZW50X2lkLCBzb3J0X29yZGVyLCB0aXRsZSwgcGF0aCwgaWNvbiwgYXV0aF90aWVyLCByZXF1aXJlZF9ncm91cHMsIGlzX3Zpc2libGUsIGlzX2R5bmFtaWMpXG4gICAgICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICQyLCAkMywgJDQsICdEZXNjcmlwdGlvbicsIENBU1QoJ2dvb2dsZScgQVMgXCJBdXRoVGllclwiKSwgJycsIHRydWUsIHRydWUpYCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhjZWxJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hdlNvcnQrKyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYC8ke3NsdWd9YFxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY3JlYXRlZDtcbn1cbi8qKiBVcHNlcnQga25vd2xlZGdlIHNuaXBwZXRzIChmdWxsIGNvbXByZWhlbnNpb24gKyBwZXItc2hlZXQgbWFya2Rvd24pLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVNuaXBwZXRzU3RlcChjb21wcmVoZW5zaW9uLCBtb2RlbCwgZGJVcmwpIHtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICAvLyBSYXcgY29tcHJlaGVuc2lvbiBKU09OICh1c2VkIGJ5IEFJIGNoYXQgLyByZXByb2Nlc3MpLlxuICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjYXRlZ29yeSwgY29udGVudClcbiAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJ2RvY3VtZW50JywgJDIpXG4gICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudDtgLCBbXG4gICAgICAgICAgICAnd29ya2Jvb2tfY29tcHJlaGVuc2lvbicsXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgY29tcHJlaGVuZGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBjb21wcmVoZW5zaW9uXG4gICAgICAgICAgICB9KVxuICAgICAgICBdKTtcbiAgICAgICAgY291bnQrKztcbiAgICAgICAgLy8gT25lIGh1bWFuLXJlYWRhYmxlIHNuaXBwZXQgcGVyIHNoZWV0LlxuICAgICAgICBmb3IgKGNvbnN0IHNoZWV0IG9mIGNvbXByZWhlbnNpb24uc2hlZXRzKXtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGBzaGVldF8ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YDtcbiAgICAgICAgICAgIGNvbnN0IG1hcmtkb3duID0gW1xuICAgICAgICAgICAgICAgIGAjICR7c2hlZXQudGl0bGV9YCxcbiAgICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgICBzaGVldC5zdW1tYXJ5LFxuICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgIGAqKkNhdGVnb3J5Kio6ICR7c2hlZXQuY2F0ZWdvcnl9YCxcbiAgICAgICAgICAgICAgICBzaGVldC5wZXJpb2RIaW50ID8gYCoqUGVyaW9kKio6ICR7c2hlZXQucGVyaW9kSGludH1gIDogJydcbiAgICAgICAgICAgIF0uZmlsdGVyKChsKT0+bCAhPT0gJycpLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY2F0ZWdvcnksIGNvbnRlbnQpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJ3NoZWV0JywgJDIpXG4gICAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50O2AsIFtcbiAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgbWFya2Rvd25cbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb3VudDtcbn1cbi8qKlxuICogRGV0ZXJtaW5pc3RpYyB0ZW1wbGF0ZS1maXQgc2NvcmluZyAoXHUwMEE3NS41KS5cbiAqXG4gKiBTY29yZXMgdGhlIEFJLXN1Z2dlc3RlZCB0ZW1wbGF0ZSBhZ2FpbnN0IHRoZSBjb21wcmVoZW5kZWQgc2hlZXQgY2F0ZWdvcmllcy5cbiAqIE5vIGV4dGVybmFsIGltcG9ydHMgXHUyMDE0IGFsbCB0ZW1wbGF0ZSBkYXRhIGlzIGhhcmRjb2RlZCB0byBrZWVwIHRoZSBidW5kbGUgbGVhbi5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VsZWN0VGVtcGxhdGVTdGVwKGNvbXByZWhlbnNpb24pIHtcbiAgICBjb25zdCBhaVRlbXBsYXRlID0gY29tcHJlaGVuc2lvbi50ZW1wbGF0ZTtcbiAgICBjb25zdCBhaUNvbmZpZGVuY2UgPSBhaVRlbXBsYXRlPy5jb25maWRlbmNlID8/IDAuNTtcbiAgICBjb25zdCBzaGVldENhdGVnb3JpZXMgPSBjb21wcmVoZW5zaW9uLnNoZWV0cy5tYXAoKHMpPT5zLmNhdGVnb3J5KTtcbiAgICAvLyBDYXRlZ29yeSBwcm9maWxlIHBlciB0ZW1wbGF0ZSAod2hpY2ggc2hlZXQgY2F0ZWdvcmllcyBtYXRjaCBiZXN0KS5cbiAgICBjb25zdCB0ZW1wbGF0ZVByb2ZpbGVzID0ge1xuICAgICAgICAnZmluYW5jaWFsLWFuYWx5dGljcyc6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgICAgICAgICAnYnJlYWtfZXZlbicsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJyxcbiAgICAgICAgICAgICAgICAndHJpYWxfYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ3N1bW1hcnlfcGwnLFxuICAgICAgICAgICAgICAgICdzdW1tYXJ5X2JzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICAgICAgJ3BubCcsXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdCcsXG4gICAgICAgICAgICAgICAgJ2xvc3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnYnJlYWsgZXZlbicsXG4gICAgICAgICAgICAgICAgJ2JlcCcsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICByZXN0YXVyYW50OiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ2RhaWx5X3NhbGVzJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnYnJlYWtfZXZlbicsXG4gICAgICAgICAgICAgICAgJ21vbnRoX29uX21vbnRoJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ3Jlc3RhdXJhbnQnLFxuICAgICAgICAgICAgICAgICdraXRjaGVuJyxcbiAgICAgICAgICAgICAgICAnbWVudScsXG4gICAgICAgICAgICAgICAgJ2Zvb2QnLFxuICAgICAgICAgICAgICAgICdiZXZlcmFnZScsXG4gICAgICAgICAgICAgICAgJ2NvdmVycycsXG4gICAgICAgICAgICAgICAgJ2d1ZXN0cydcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgaG90ZWw6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAnZGFpbHlfc2FsZXMnLFxuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ21vbnRoX29uX21vbnRoJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdob3RlbCcsXG4gICAgICAgICAgICAgICAgJ3Jvb21zJyxcbiAgICAgICAgICAgICAgICAnb2NjdXBhbmN5JyxcbiAgICAgICAgICAgICAgICAncmV2cGFyJyxcbiAgICAgICAgICAgICAgICAnaG91c2VrZWVwaW5nJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICAnZWNvbW1lcmNlLXJldGFpbCc6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAnZGFpbHlfc2FsZXMnLFxuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICAgICAgICAgICAgICd2YXJpYW5jZSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdlY29tbWVyY2UnLFxuICAgICAgICAgICAgICAgICdyZXRhaWwnLFxuICAgICAgICAgICAgICAgICdvbmxpbmUnLFxuICAgICAgICAgICAgICAgICdza3UnLFxuICAgICAgICAgICAgICAgICdjYXJ0JyxcbiAgICAgICAgICAgICAgICAnY29udmVyc2lvbidcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgaGVhbHRoY2FyZToge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2hlYWx0aCcsXG4gICAgICAgICAgICAgICAgJ3BhdGllbnQnLFxuICAgICAgICAgICAgICAgICdjbGluaWMnLFxuICAgICAgICAgICAgICAgICdtZWRpY2FsJyxcbiAgICAgICAgICAgICAgICAncGhhcm1hY3knXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgICdzdXBwbHktY2hhaW4nOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdzdXBwbHknLFxuICAgICAgICAgICAgICAgICdsb2dpc3RpY3MnLFxuICAgICAgICAgICAgICAgICdpbnZlbnRvcnknLFxuICAgICAgICAgICAgICAgICd3YXJlaG91c2UnLFxuICAgICAgICAgICAgICAgICdzaGlwcGluZydcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgJ3JlYWwtZXN0YXRlJzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICdzdW1tYXJ5X2JzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ3JlYWwgZXN0YXRlJyxcbiAgICAgICAgICAgICAgICAncHJvcGVydHknLFxuICAgICAgICAgICAgICAgICdsZWFzZScsXG4gICAgICAgICAgICAgICAgJ3JlbnQnLFxuICAgICAgICAgICAgICAgICdtb3J0Z2FnZSdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgZWR1Y2F0aW9uOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnbW9udGhfb25fbW9udGgnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnZWR1Y2F0aW9uJyxcbiAgICAgICAgICAgICAgICAnc3R1ZGVudCcsXG4gICAgICAgICAgICAgICAgJ3R1aXRpb24nLFxuICAgICAgICAgICAgICAgICdjb3Vyc2UnLFxuICAgICAgICAgICAgICAgICdlbnJvbGxtZW50J1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICAncHJvZmVzc2lvbmFsLXNlcnZpY2VzJzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2NvbnN1bHRpbmcnLFxuICAgICAgICAgICAgICAgICdzZXJ2aWNlcycsXG4gICAgICAgICAgICAgICAgJ2JpbGxpbmcnLFxuICAgICAgICAgICAgICAgICdjbGllbnQnLFxuICAgICAgICAgICAgICAgICdwcm9qZWN0J1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBtYW51ZmFjdHVyaW5nOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICd2YXJpYW5jZSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdtYW51ZmFjdHVyaW5nJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdGlvbicsXG4gICAgICAgICAgICAgICAgJ2ZhY3RvcnknLFxuICAgICAgICAgICAgICAgICdiaWxsIG9mIG1hdGVyaWFscycsXG4gICAgICAgICAgICAgICAgJ3dvcmsgb3JkZXInXG4gICAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIGNhdGVnb3J5T3ZlcmxhcCh0bXBsSWQpIHtcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IHRlbXBsYXRlUHJvZmlsZXNbdG1wbElkXTtcbiAgICAgICAgaWYgKCFwcm9maWxlKSByZXR1cm4gMDtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHNoZWV0Q2F0ZWdvcmllcy5maWx0ZXIoKGMpPT5wcm9maWxlLmNhdGVnb3JpZXMuaW5jbHVkZXMoYykpO1xuICAgICAgICByZXR1cm4gc2hlZXRDYXRlZ29yaWVzLmxlbmd0aCA+IDAgPyBtYXRjaGVzLmxlbmd0aCAvIHNoZWV0Q2F0ZWdvcmllcy5sZW5ndGggOiAwO1xuICAgIH1cbiAgICBmdW5jdGlvbiBrZXl3b3JkTWF0Y2godG1wbElkKSB7XG4gICAgICAgIGNvbnN0IHByb2ZpbGUgPSB0ZW1wbGF0ZVByb2ZpbGVzW3RtcGxJZF07XG4gICAgICAgIGlmICghcHJvZmlsZSkgcmV0dXJuIDA7XG4gICAgICAgIGNvbnN0IHRleHQgPSBbXG4gICAgICAgICAgICBjb21wcmVoZW5zaW9uLndvcmtib29rLnRpdGxlLFxuICAgICAgICAgICAgY29tcHJlaGVuc2lvbi53b3JrYm9vay5zdW1tYXJ5LFxuICAgICAgICAgICAgY29tcHJlaGVuc2lvbi53b3JrYm9vay5jb21wYW55ID8/ICcnXG4gICAgICAgIF0uam9pbignICcpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBwcm9maWxlLmtleXdvcmRzLmZpbHRlcigoa3cpPT50ZXh0LmluY2x1ZGVzKGt3KSk7XG4gICAgICAgIHJldHVybiBwcm9maWxlLmtleXdvcmRzLmxlbmd0aCA+IDAgPyBtYXRjaGVzLmxlbmd0aCAvIHByb2ZpbGUua2V5d29yZHMubGVuZ3RoIDogMDtcbiAgICB9XG4gICAgLy8gU2NvcmUgdGhlIEFJLXN1Z2dlc3RlZCB0ZW1wbGF0ZS5cbiAgICBjb25zdCBzdWdnZXN0ZWRTY29yZSA9IGFpVGVtcGxhdGU/LmlkID8gYWlDb25maWRlbmNlICogKGNhdGVnb3J5T3ZlcmxhcChhaVRlbXBsYXRlLmlkKSAqIDAuNyArIGtleXdvcmRNYXRjaChhaVRlbXBsYXRlLmlkKSAqIDAuMykgOiAtMTtcbiAgICAvLyBTY29yZSBhbGwgdGVtcGxhdGVzIGZvciBhbHRlcm5hdGl2ZXMuXG4gICAgY29uc3QgYWxsU2NvcmVzID0gT2JqZWN0LmtleXModGVtcGxhdGVQcm9maWxlcykubWFwKChpZCk9Pih7XG4gICAgICAgICAgICBpZCxcbiAgICAgICAgICAgIHNjb3JlOiBjYXRlZ29yeU92ZXJsYXAoaWQpICogMC43ICsga2V5d29yZE1hdGNoKGlkKSAqIDAuMyxcbiAgICAgICAgICAgIHJlYXNvbjogYCR7TWF0aC5yb3VuZChjYXRlZ29yeU92ZXJsYXAoaWQpICogMTAwKX0lIGNhdGVnb3J5IG1hdGNoLCAke01hdGgucm91bmQoa2V5d29yZE1hdGNoKGlkKSAqIDEwMCl9JSBrZXl3b3JkIG1hdGNoYFxuICAgICAgICB9KSk7XG4gICAgYWxsU2NvcmVzLnNvcnQoKGEsIGIpPT5iLnNjb3JlIC0gYS5zY29yZSk7XG4gICAgY29uc3QgcmVjb21tZW5kZWQgPSBzdWdnZXN0ZWRTY29yZSA+IGFsbFNjb3Jlc1swXS5zY29yZSA/IGFpVGVtcGxhdGUuaWQgOiBhbGxTY29yZXNbMF0uaWQ7XG4gICAgY29uc3QgcmVjb21tZW5kZWRTY29yZSA9IHJlY29tbWVuZGVkID09PSBhaVRlbXBsYXRlPy5pZCA/IHN1Z2dlc3RlZFNjb3JlIDogYWxsU2NvcmVzWzBdLnNjb3JlO1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlY29tbWVuZGVkLFxuICAgICAgICBhaVN1Z2dlc3Rpb246IGFpVGVtcGxhdGU/LmlkID8/IG51bGwsXG4gICAgICAgIGFpQ29uZmlkZW5jZSxcbiAgICAgICAgc2NvcmU6IE1hdGgucm91bmQocmVjb21tZW5kZWRTY29yZSAqIDEwMCkgLyAxMDAsXG4gICAgICAgIHJlYXNvbjogYWxsU2NvcmVzWzBdLnJlYXNvbixcbiAgICAgICAgYWx0ZXJuYXRpdmVzOiBhbGxTY29yZXMuZmlsdGVyKChzKT0+cy5pZCAhPT0gcmVjb21tZW5kZWQpLnNsaWNlKDAsIDMpLm1hcCgocyk9Pih7XG4gICAgICAgICAgICAgICAgaWQ6IHMuaWQsXG4gICAgICAgICAgICAgICAgc2NvcmU6IE1hdGgucm91bmQocy5zY29yZSAqIDEwMCkgLyAxMDBcbiAgICAgICAgICAgIH0pKVxuICAgIH07XG59XG4vKiogQmVzdC1lZmZvcnQgcmVnaXN0ZXIgZHluYW1pYyBwYWdlcyBpbiB0aGUgcnVudGltZSBjYXRhbG9nLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwKGNvbXByZWhlbnNpb24pIHtcbiAgICAvLyBzZXREeW5hbWljUGFnZXMgaXMgYSBydW50aW1lLXNpZGUgZWZmZWN0OyBpbiB0aGUgd29ya2Zsb3cgY29udGV4dCB0aGVcbiAgICAvLyBjYXRhbG9nIHJlYnVpbGRzIGZyb20gREIgYXBwX3BhZ2VzIG9uIG5leHQgcmVxdWVzdC4gQmVzdC1lZmZvcnQuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBzZXREeW5hbWljUGFnZXMgfSA9IGF3YWl0IGltcG9ydCgnLi4vLi4vc3JjL2xpYi9wYWdlLWNhdGFsb2cnKTtcbiAgICAgICAgY29uc3QgcGFnZXMgPSBjb21wcmVoZW5zaW9uLnNoZWV0cy5tYXAoKHNoZWV0KT0+KHtcbiAgICAgICAgICAgICAgICBzbHVnOiBgc2hlZXQtJHtub3JtYWxpemVTbHVnKHNoZWV0LnRhYk5hbWUpfWAsXG4gICAgICAgICAgICAgICAgdGl0bGU6IHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgICAgICAgICBuYXZMYWJlbDogc2hlZXQudGl0bGUsXG4gICAgICAgICAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGBzaGVldF8ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogc2hlZXQudGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKFNIRUVUX0NBVEVHT1JZX0JMT0NLU1tzaGVldC5jYXRlZ29yeV0gPz8gU0hFRVRfQ0FURUdPUllfQkxPQ0tTLm90aGVyKS5tYXAoKGIpPT4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogYi5ibG9ja1R5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoZWV0OiBzaGVldC50YWJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogYi50aXRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgc2V0RHluYW1pY1BhZ2VzKHBhZ2VzKTtcbiAgICAgICAgcmV0dXJuIHBhZ2VzLmxlbmd0aDtcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIC8vIFJ1bnRpbWUgY2F0YWxvZyB1bmF2YWlsYWJsZSBpbiB3b3JrZmxvdyBjb250ZXh0IFx1MjAxNCBub24tY3JpdGljYWwuXG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbn1cbi8vIFx1MjUwMFx1MjUwMCBQaGFzZSA1OiBHRU5FUkFURSBzdGVwcyAoT3BlbkFJIFx1MjE5MiBCUiAvIEVTIC8gRGFzaGJvYXJkKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8qKiBQYXJzZSBCdXNpbmVzcyBSZXZpZXcgbWFya2Rvd24gaW50byBwYXJ0IHNlY3Rpb25zIChsaWdodHdlaWdodCBpbmxpbmUgcGFyc2VyKS4gKi8gZnVuY3Rpb24gcGFyc2VSZXZpZXdQYXJ0cyhtYXJrZG93bikge1xuICAgIGNvbnN0IHBhcnRzID0gW107XG4gICAgY29uc3QgaGVhZGVyUmUgPSAvXiN7MiwzfVxccytQYXJ0XFxzKyhbQS1aXSk6XFxzKiguKykkL207XG4gICAgY29uc3Qgc2VjdGlvbnMgPSBtYXJrZG93bi5zcGxpdCgvXFxuKD89I3syLDN9XFxzK1BhcnRcXHMrW0EtWl06KS8pO1xuICAgIGxldCBzb3J0T3JkZXIgPSAwO1xuICAgIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBzZWN0aW9ucyl7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gaGVhZGVyUmUuZXhlYyhzZWN0aW9uKTtcbiAgICAgICAgaWYgKCFtYXRjaCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IFssIGxldHRlciwgcmF3VGl0bGVdID0gbWF0Y2g7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gKHJhd1RpdGxlID8/IHNlY3Rpb24uc3BsaXQoJ1xcbicpWzBdPy5yZXBsYWNlKC9eI3syLDN9XFxzK1BhcnRcXHMrW0EtWl06XFxzKi8sICcnKSA/PyAnJykudHJpbSgpO1xuICAgICAgICBjb25zdCBzbHVnID0gYHBhcnQtJHsobGV0dGVyID8/ICdhJykudG9Mb3dlckNhc2UoKX1gO1xuICAgICAgICBjb25zdCBwYXJ0S2V5ID0gYHBhcnRfJHsobGV0dGVyID8/ICdhJykudG9Mb3dlckNhc2UoKX1gO1xuICAgICAgICBwYXJ0cy5wdXNoKHtcbiAgICAgICAgICAgIHNsdWcsXG4gICAgICAgICAgICBwYXJ0S2V5LFxuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBzb3J0T3JkZXI6IHNvcnRPcmRlcisrLFxuICAgICAgICAgICAgbWFya2Rvd246IHNlY3Rpb24udHJpbSgpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcGFydHM7XG59XG4vKipcbiAqIEdlbmVyYXRlIHRoZSBCdXNpbmVzcyBSZXZpZXcgZnJvbSBjb21wcmVoZW5zaW9uIGRhdGEuXG4gKiBTYXZlcyBwYXJzZWQgcGFydHMgdG8gYnVzaW5lc3NfcmV2aWV3X3BhcnRzIHZpYSBwZy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXAoY29tcHJlaGVuc2lvbiwgYXBpS2V5LCBkYlVybCwgbW9kZWwgPSAnZ3B0LTRvJykge1xuICAgIGNvbnN0IHByb21wdCA9IGJ1aWxkR2VuUHJvbXB0KGNvbXByZWhlbnNpb24sICdidXNpbmVzc1JldmlldycpO1xuICAgIGxldCBtYXJrZG93bjtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICdZb3UgYXJlIGEgcHJlY2lzZSBmaW5hbmNpYWwgYW5hbHlzdCBhbmQgYnVzaW5lc3Mgd3JpdGVyLiBSZXR1cm4gT05MWSB2YWxpZCBKU09OLidcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogcHJvbXB0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjMsXG4gICAgICAgICAgICAgICAgbWF4X3Rva2VuczogMTYzODQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VfZm9ybWF0OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdqc29uX29iamVjdCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBPcGVuQUkgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pYCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgY29uc3QgcmVwbHkgPSByZXN1bHQuY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50ID8/ICcnO1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJlcGx5KTtcbiAgICAgICAgbWFya2Rvd24gPSBwYXJzZWQuYnVzaW5lc3NSZXZpZXcgPz8gJyc7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQnVzaW5lc3MgUmV2aWV3IGdlbmVyYXRpb24gZmFpbGVkOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gKTtcbiAgICB9XG4gICAgaWYgKCFtYXJrZG93bi50cmltKCkpIHJldHVybiAwO1xuICAgIGNvbnN0IHBhcnRzID0gcGFyc2VSZXZpZXdQYXJ0cyhtYXJrZG93bik7XG4gICAgbGV0IHNhdmVkID0gMDtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHBhcnRzKXtcbiAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBidXNpbmVzc19yZXZpZXdfcGFydHMgKGlkLCBzbHVnLCBwYXJ0X2tleSwgdGl0bGUsIHNvcnRfb3JkZXIsIGF1dGhfdGllciwgbWFya2Rvd24pXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJDIsICQzLCAkNCwgJ2dvb2dsZScsICQ1KVxuICAgICAgICAgT04gQ09ORkxJQ1QgKHNsdWcpIERPIFVQREFURSBTRVRcbiAgICAgICAgICAgcGFydF9rZXkgPSBFWENMVURFRC5wYXJ0X2tleSxcbiAgICAgICAgICAgdGl0bGUgPSBFWENMVURFRC50aXRsZSxcbiAgICAgICAgICAgc29ydF9vcmRlciA9IEVYQ0xVREVELnNvcnRfb3JkZXIsXG4gICAgICAgICAgIG1hcmtkb3duID0gRVhDTFVERUQubWFya2Rvd247YCwgW1xuICAgICAgICAgICAgICAgIHBhcnQuc2x1ZyxcbiAgICAgICAgICAgICAgICBwYXJ0LnBhcnRLZXksXG4gICAgICAgICAgICAgICAgcGFydC50aXRsZSxcbiAgICAgICAgICAgICAgICBwYXJ0LnNvcnRPcmRlcixcbiAgICAgICAgICAgICAgICBwYXJ0Lm1hcmtkb3duXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIHNhdmVkKys7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc2F2ZWQ7XG59XG4vKipcbiAqIEdlbmVyYXRlIHRoZSBFeGVjdXRpdmUgU3VtbWFyeSBmcm9tIGNvbXByZWhlbnNpb24gZGF0YS5cbiAqIFNhdmVzIHRvIGtub3dsZWRnZV9zbmlwcGV0cyB2aWEgcGcuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXAoY29tcHJlaGVuc2lvbiwgYXBpS2V5LCBkYlVybCwgbW9kZWwgPSAnZ3B0LTRvJykge1xuICAgIGNvbnN0IHByb21wdCA9IGJ1aWxkR2VuUHJvbXB0KGNvbXByZWhlbnNpb24sICdleGVjdXRpdmVTdW1tYXJ5Jyk7XG4gICAgbGV0IG1hcmtkb3duO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJ1lvdSBhcmUgYSBwcmVjaXNlIGZpbmFuY2lhbCBhbmFseXN0IGFuZCBidXNpbmVzcyB3cml0ZXIuIFJldHVybiBPTkxZIHZhbGlkIEpTT04uJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuMyxcbiAgICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAxNjM4NCxcbiAgICAgICAgICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2pzb25fb2JqZWN0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYE9wZW5BSSBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSlgKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBjb25zdCByZXBseSA9IHJlc3VsdC5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgPz8gJyc7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmVwbHkpO1xuICAgICAgICBtYXJrZG93biA9IHBhcnNlZC5leGVjdXRpdmVTdW1tYXJ5ID8/ICcnO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4ZWN1dGl2ZSBTdW1tYXJ5IGdlbmVyYXRpb24gZmFpbGVkOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gKTtcbiAgICB9XG4gICAgaWYgKCFtYXJrZG93bi50cmltKCkpIHJldHVybiBmYWxzZTtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY2F0ZWdvcnksIGNvbnRlbnQpXG4gICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJ2V4ZWN1dGl2ZV9zdW1tYXJ5JywgJ2RvY3VtZW50JywgJDEpXG4gICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudDtgLCBbXG4gICAgICAgICAgICBtYXJrZG93blxuICAgICAgICBdKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbi8qKlxuICogR2VuZXJhdGUgdGhlIERhc2hib2FyZCBEYXRhIGZyb20gY29tcHJlaGVuc2lvbiBkYXRhLlxuICogU2F2ZXMgdG8ga25vd2xlZGdlX3NuaXBwZXRzIHZpYSBwZy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVEYXNoYm9hcmRTdGVwKGNvbXByZWhlbnNpb24sIGFwaUtleSwgZGJVcmwsIG1vZGVsID0gJ2dwdC00bycpIHtcbiAgICBjb25zdCBwcm9tcHQgPSBidWlsZEdlblByb21wdChjb21wcmVoZW5zaW9uLCAnZGFzaGJvYXJkRGF0YScpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJ1lvdSBhcmUgYSBwcmVjaXNlIGZpbmFuY2lhbCBhbmFseXN0LiBSZXR1cm4gT05MWSB2YWxpZCBKU09OIHdpdGgga2V5cyBcImFjdGlvblBoYXNlc1wiLCBcInRhcmdldFJvd3NcIiwgYW5kIFwibGV2ZXJzXCIuJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuMyxcbiAgICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAxNjM4NCxcbiAgICAgICAgICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2pzb25fb2JqZWN0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYE9wZW5BSSBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSlgKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBjb25zdCByZXBseSA9IHJlc3VsdC5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgPz8gJyc7XG4gICAgICAgIGlmICghcmVwbHkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyZXBseSk7XG4gICAgICAgIGlmICghcGFyc2VkLmFjdGlvblBoYXNlcyAmJiAhcGFyc2VkLnRhcmdldFJvd3MgJiYgIXBhcnNlZC5sZXZlcnMpIHJldHVybiBmYWxzZTtcbiAgICAgICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjYXRlZ29yeSwgY29udGVudClcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICdkYXNoYm9hcmRfZGF0YScsICdkb2N1bWVudCcsICQxKVxuICAgICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudDtgLCBbXG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkocGFyc2VkKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIC8vIERhc2hib2FyZCBpcyBub24tY3JpdGljYWwgXHUyMDE0IHN3YWxsb3cgZXJyb3JzXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4vKipcbiAqIEJ1aWxkIGEgZ2VuZXJhdGlvbiBwcm9tcHQgZnJvbSB0aGUgd29ya2Jvb2sgY29tcHJlaGVuc2lvbi5cbiAqIE5vIGV4dGVybmFsIGRlcGVuZGVuY2llcyBcdTIwMTQgcHVyZSBjb21wdXRhdGlvbiBmcm9tIHRoZSBjb21wcmVoZW5zaW9uIHN0YXRlLlxuICovIGZ1bmN0aW9uIGJ1aWxkR2VuUHJvbXB0KGNvbXByZWhlbnNpb24sIHRhcmdldCkge1xuICAgIGNvbnN0IHsgd29ya2Jvb2ssIHNoZWV0cywgcHJvamVjdGlvbnMgfSA9IGNvbXByZWhlbnNpb247XG4gICAgY29uc3QgY29udGV4dCA9IFtcbiAgICAgICAgYCMgR2VuZXJhdGVkIENvbnRlbnQ6ICR7dGFyZ2V0ID09PSAnYnVzaW5lc3NSZXZpZXcnID8gJ0J1c2luZXNzIFJldmlldycgOiB0YXJnZXQgPT09ICdleGVjdXRpdmVTdW1tYXJ5JyA/ICdFeGVjdXRpdmUgU3VtbWFyeScgOiAnRGFzaGJvYXJkIERhdGEnfWAsXG4gICAgICAgICcnLFxuICAgICAgICBgIyMgV29ya2Jvb2sgU3VtbWFyeWAsXG4gICAgICAgIGAqKlRpdGxlKio6ICR7d29ya2Jvb2sudGl0bGV9YCxcbiAgICAgICAgYCoqQ29tcGFueSoqOiAke3dvcmtib29rLmNvbXBhbnkgPz8gJ04vQSd9YCxcbiAgICAgICAgYCoqUGVyaW9kKio6ICR7d29ya2Jvb2sucGVyaW9kID8/ICdOL0EnfWAsXG4gICAgICAgIGAqKkN1cnJlbmN5Kio6ICR7d29ya2Jvb2suY3VycmVuY3kgPz8gJ0lEUid9YCxcbiAgICAgICAgd29ya2Jvb2suc3VtbWFyeSxcbiAgICAgICAgJycsXG4gICAgICAgIGAjIyBTaGVldCBJbnZlbnRvcnkgKCR7c2hlZXRzLmxlbmd0aH0gc2hlZXRzKWAsXG4gICAgICAgIC4uLnNoZWV0cy5tYXAoKHMpPT5gLSAqKiR7cy50YWJOYW1lfSoqICgke3MuY2F0ZWdvcnl9KTogJHtzLnRpdGxlfSBcdTIwMTQgJHtzLnN1bW1hcnl9JHtzLnBlcmlvZEhpbnQgPyBgIFske3MucGVyaW9kSGludH1dYCA6ICcnfWApLFxuICAgICAgICAnJyxcbiAgICAgICAgYCMjIENvbnNvbGlkYXRlZCBGaW5hbmNpYWwgUHJvamVjdGlvbnNgLFxuICAgICAgICAnYGBganNvbicsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHByb2plY3Rpb25zLCBudWxsLCAyKSxcbiAgICAgICAgJ2BgYCdcbiAgICBdLmpvaW4oJ1xcbicpO1xuICAgIGlmICh0YXJnZXQgPT09ICdidXNpbmVzc1JldmlldycpIHtcbiAgICAgICAgcmV0dXJuIGAke2NvbnRleHR9XFxuXFxuR2VuZXJhdGUgT05MWSBhIFwiYnVzaW5lc3NSZXZpZXdcIiBkb2N1bWVudCBhcyBhIEpTT04gb2JqZWN0IHdpdGggYSBzaW5nbGUga2V5IFwiYnVzaW5lc3NSZXZpZXdcIiBjb250YWluaW5nIGEgY29tcHJlaGVuc2l2ZSBNYXJrZG93biBidXNpbmVzcyByZXZpZXcuIEluY2x1ZGUgc2VjdGlvbnMgZm9yIGVhY2ggcGFydCBvZiB0aGUgYnVzaW5lc3M6IFBhcnQgQTogUmV2ZW51ZSAmIFNhbGVzLCBQYXJ0IEI6IENvc3RzICYgTWFyZ2lucywgUGFydCBDOiBQcm9maXRhYmlsaXR5ICYgRUJJVERBLCBQYXJ0IEQ6IEJyZWFrLUV2ZW4gQW5hbHlzaXMsIFBhcnQgRTogVHJlbmRzICYgUHJvamVjdGlvbnMsIFBhcnQgRjogUmlza3MgJiBSZWNvbW1lbmRhdGlvbnMuIFVzZSAjIyBQYXJ0IFg6IFRpdGxlIGhlYWRlcnMuIEluY2x1ZGUgZGF0YSB0YWJsZXMgZnJvbSB0aGUgcHJvamVjdGlvbnMuYDtcbiAgICB9XG4gICAgaWYgKHRhcmdldCA9PT0gJ2V4ZWN1dGl2ZVN1bW1hcnknKSB7XG4gICAgICAgIHJldHVybiBgJHtjb250ZXh0fVxcblxcbkdlbmVyYXRlIE9OTFkgYW4gXCJleGVjdXRpdmVTdW1tYXJ5XCIgZG9jdW1lbnQgYXMgYSBKU09OIG9iamVjdCB3aXRoIGEgc2luZ2xlIGtleSBcImV4ZWN1dGl2ZVN1bW1hcnlcIiBjb250YWluaW5nIGEgY29uY2lzZSBNYXJrZG93biBleGVjdXRpdmUgc3VtbWFyeSAoMS0yIHBhZ2VzKSBoaWdobGlnaHRpbmcgdGhlIGtleSBmaW5hbmNpYWwgbWV0cmljcywgdHJlbmRzLCByaXNrcywgYW5kIGFjdGlvbmFibGUgcmVjb21tZW5kYXRpb25zIGZyb20gdGhlIHdvcmtib29rIGRhdGEuYDtcbiAgICB9XG4gICAgcmV0dXJuIGAke2NvbnRleHR9XFxuXFxuR2VuZXJhdGUgT05MWSBhIEpTT04gb2JqZWN0IHdpdGgga2V5cyBcImFjdGlvblBoYXNlc1wiIChhcnJheSBvZiB7cGhhc2UsIGRlc2NyaXB0aW9ufSksIFwidGFyZ2V0Um93c1wiIChhcnJheSBvZiB7bGFiZWwsIHZhbHVlLCB1bml0fSksIGFuZCBcImxldmVyc1wiIChhcnJheSBvZiB7bmFtZSwgaW1wYWN0LCBhY3Rpb25zW119KSBiYXNlZCBvbiB0aGUgZmluYW5jaWFsIGRhdGEuIEZvY3VzIG9uIGFjdGlvbmFibGUgb3BlcmF0aW9uYWwgcmVjb21tZW5kYXRpb25zLmA7XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vbG9hZFdvcmtib29rU3RlcFwiLCBsb2FkV29ya2Jvb2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9leHRyYWN0U2hlZXRzU3RlcFwiLCBleHRyYWN0U2hlZXRzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vYW5hbHl6ZVNoZWV0c1N0ZXBcIiwgYW5hbHl6ZVNoZWV0c1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2NvbXByZWhlbmRXb3JrYm9va1N0ZXBcIiwgY29tcHJlaGVuZFdvcmtib29rU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZW1pdFByb2dyZXNzU3RlcFwiLCBlbWl0UHJvZ3Jlc3NTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9jbG9zZVByb2dyZXNzU3RlcFwiLCBjbG9zZVByb2dyZXNzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vcG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXBcIiwgcG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3Vwc2VydFNoZWV0UGFnZXNTdGVwXCIsIHVwc2VydFNoZWV0UGFnZXNTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zYXZlU25pcHBldHNTdGVwXCIsIHNhdmVTbmlwcGV0c1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NlbGVjdFRlbXBsYXRlU3RlcFwiLCBzZWxlY3RUZW1wbGF0ZVN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3JlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcFwiLCByZWdpc3RlckR5bmFtaWNQYWdlc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlQnVzaW5lc3NSZXZpZXdTdGVwXCIsIGdlbmVyYXRlQnVzaW5lc3NSZXZpZXdTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwXCIsIGdlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlRGFzaGJvYXJkU3RlcFwiLCBnZW5lcmF0ZURhc2hib2FyZFN0ZXApO1xuIiwgIi8qKlxuICogV29ya2Jvb2sgU2hlZXQgRXh0cmFjdGlvbiAoZGVwZW5kZW5jeS1mcmVlKVxuICpcbiAqIFB1cmUgc2hlZXQgc2VyaWFsaXphdGlvbiArIHN0cnVjdHVyYWwgc3RhdGlzdGljcy4gVGhpcyBtb2R1bGUgaW50ZW50aW9uYWxseVxuICogaGFzIE5PIGFwcGxpY2F0aW9uIGFsaWFzZXMgKGBALy4uLmApLCBubyB6b2QsIGFuZCBubyBPcGVuQUkgaW1wb3J0cyBzbyB0aGF0XG4gKiBpdCBjYW4gYmUgYnVuZGxlZCBpbnRvIFZlcmNlbCBXb3JrZmxvdyBzdGVwIGJ1bmRsZXMgKHdvcmtmbG93cy93b3JrYm9vay1pbmdlc3QpXG4gKiB3aXRob3V0IGRyYWdnaW5nIHRoZSB3aG9sZSBkb21haW4gbGF5ZXIgYWxvbmcuXG4gKlxuICogVGhlIEFJLWZpcnN0IHBpcGVsaW5lIHNlcmlhbGl6ZXMgZXZlcnkgc2hlZXQgdG8gcGxhaW4gdGV4dCAodGFiIG5hbWUgKyByb3dzKVxuICogYW5kIGxldHMgdGhlIG1vZGVsIGRvIHRoZSBjb21wcmVoZW5zaW9uLiBUaGUgc3RydWN0dXJhbCBzdGF0aXN0aWNzIHByb2R1Y2VkXG4gKiBoZXJlIGZlZWQgYSBkZXRlcm1pbmlzdGljIEFOQUxZWkUgcHJlLXBhc3MgdGhhdCBlbnJpY2hlcyB0aGUgQUkgcHJvbXB0LlxuICovIGltcG9ydCB7IHJlYWQsIHV0aWxzIH0gZnJvbSAneGxzeCc7XG5leHBvcnQgY29uc3QgU0hFRVRfQ0FURUdPUklFUyA9IFtcbiAgICAnZGFpbHlfc2FsZXMnLFxuICAgICdwcm9maXRfbG9zcycsXG4gICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICd0cmlhbF9iYWxhbmNlJyxcbiAgICAnZ2VuZXJhbF9sZWRnZXInLFxuICAgICdjb3N0X29mX3NhbGVzJyxcbiAgICAnbW9udGhfb25fbW9udGgnLFxuICAgICdicmVha19ldmVuJyxcbiAgICAndmFyaWFuY2UnLFxuICAgICdzdW1tYXJ5X3BsJyxcbiAgICAnc3VtbWFyeV9icycsXG4gICAgJ290aGVyJ1xuXTtcbmV4cG9ydCBjb25zdCBNQVhfU0hFRVRfUk9XUyA9IDQwO1xuZXhwb3J0IGNvbnN0IE1BWF9TSEVFVF9DT0xTID0gMTY7XG5leHBvcnQgY29uc3QgTUFYX0NFTExfQ0hBUlMgPSA4MDtcbmZ1bmN0aW9uIGZvcm1hdENlbGwodikge1xuICAgIGlmICh2ID09IG51bGwpIHJldHVybiAnJztcbiAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGlmIChOdW1iZXIuaXNJbnRlZ2VyKHYpKSByZXR1cm4gU3RyaW5nKHYpO1xuICAgICAgICByZXR1cm4gdi50b0ZpeGVkKDIpLnJlcGxhY2UoL1xcLjAwJC8sICcnKTtcbiAgICB9XG4gICAgY29uc3QgcyA9IFN0cmluZyh2KS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpO1xuICAgIHJldHVybiBzLmxlbmd0aCA+IE1BWF9DRUxMX0NIQVJTID8gcy5zbGljZSgwLCBNQVhfQ0VMTF9DSEFSUyAtIDEpICsgJ1x1MjAyNicgOiBzO1xufVxuZnVuY3Rpb24gcmVhZEZ1bGxHcmlkKHNoZWV0KSB7XG4gICAgcmV0dXJuIHV0aWxzLnNoZWV0X3RvX2pzb24oc2hlZXQsIHtcbiAgICAgICAgaGVhZGVyOiAxLFxuICAgICAgICBkZWZ2YWw6IG51bGwsXG4gICAgICAgIHJhdzogdHJ1ZVxuICAgIH0pO1xufVxuZnVuY3Rpb24gY2FwR3JpZChncmlkLCBtYXhSb3dzLCBtYXhDb2xzKSB7XG4gICAgY29uc3QgY2FwcGVkID0gW107XG4gICAgZm9yKGxldCByID0gMDsgciA8IE1hdGgubWluKGdyaWQubGVuZ3RoLCBtYXhSb3dzKTsgcisrKXtcbiAgICAgICAgY29uc3Qgcm93ID0gZ3JpZFtyXSA/PyBbXTtcbiAgICAgICAgY29uc3QgdHJpbW1lZCA9IHJvdy5zbGljZSgwLCBtYXhDb2xzKTtcbiAgICAgICAgaWYgKHRyaW1tZWQuc29tZSgoYyk9PmMgIT0gbnVsbCAmJiBTdHJpbmcoYykudHJpbSgpICE9PSAnJykpIGNhcHBlZC5wdXNoKHRyaW1tZWQpO1xuICAgIH1cbiAgICByZXR1cm4gY2FwcGVkO1xufVxuZnVuY3Rpb24gZ3JpZFRvVGV4dChncmlkKSB7XG4gICAgY29uc3QgbGluZXMgPSBncmlkLm1hcCgocm93LCBpKT0+e1xuICAgICAgICBjb25zdCBjZWxscyA9IHJvdy5tYXAoKGMpPT5mb3JtYXRDZWxsKGMpKTtcbiAgICAgICAgLy8gVHJpbSB0cmFpbGluZyBlbXB0aWVzIGZvciBjb21wYWN0bmVzc1xuICAgICAgICB3aGlsZShjZWxscy5sZW5ndGggPiAwICYmIGNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdID09PSAnJyljZWxscy5wb3AoKTtcbiAgICAgICAgcmV0dXJuIGBSJHtpICsgMX06ICR7Y2VsbHMuam9pbignIHwgJyl9YDtcbiAgICB9KTtcbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59XG5mdW5jdGlvbiBjb21wdXRlU3RhdHModGFiTmFtZSwgZ3JpZCkge1xuICAgIGxldCBjb2xDb3VudCA9IDA7XG4gICAgbGV0IG51bWVyaWNDZWxscyA9IDA7XG4gICAgbGV0IG5vbkVtcHR5Q2VsbHMgPSAwO1xuICAgIGZvciAoY29uc3Qgcm93IG9mIGdyaWQpe1xuICAgICAgICBpZiAocm93Lmxlbmd0aCA+IGNvbENvdW50KSBjb2xDb3VudCA9IHJvdy5sZW5ndGg7XG4gICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiByb3cpe1xuICAgICAgICAgICAgaWYgKGNlbGwgPT0gbnVsbCB8fCBTdHJpbmcoY2VsbCkudHJpbSgpID09PSAnJykgY29udGludWU7XG4gICAgICAgICAgICBub25FbXB0eUNlbGxzKys7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNlbGwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgbnVtZXJpY0NlbGxzKys7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjZWxsID09PSAnc3RyaW5nJyAmJiAvXlstK10/XFxkW1xcZC4sXSokLy50ZXN0KGNlbGwudHJpbSgpKSkge1xuICAgICAgICAgICAgICAgIG51bWVyaWNDZWxscysrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHRhYk5hbWUsXG4gICAgICAgIHJvd0NvdW50OiBncmlkLmxlbmd0aCxcbiAgICAgICAgY29sQ291bnQsXG4gICAgICAgIG51bWVyaWNSYXRpbzogbm9uRW1wdHlDZWxscyA+IDAgPyBudW1lcmljQ2VsbHMgLyBub25FbXB0eUNlbGxzIDogMCxcbiAgICAgICAgbm9uRW1wdHlDZWxsc1xuICAgIH07XG59XG4vKiogU2VyaWFsaXplIG9uZSB3b3Jrc2hlZXQgdG8gdGV4dCAocm93LW51bWJlcmVkLCBjYXBwZWQpIGZvciB0aGUgQUkgcHJvbXB0LiAqLyBleHBvcnQgZnVuY3Rpb24gcmVuZGVyU2hlZXRGb3JBaSh3YiwgdGFiTmFtZSwgbWF4Um93cyA9IE1BWF9TSEVFVF9ST1dTLCBtYXhDb2xzID0gTUFYX1NIRUVUX0NPTFMpIHtcbiAgICBjb25zdCBzaGVldCA9IHdiLlNoZWV0c1t0YWJOYW1lXTtcbiAgICBpZiAoIXNoZWV0KSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBncmlkID0gY2FwR3JpZChyZWFkRnVsbEdyaWQoc2hlZXQpLCBtYXhSb3dzLCBtYXhDb2xzKTtcbiAgICBpZiAoZ3JpZC5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAgIHRhYk5hbWUsXG4gICAgICAgIHRleHQ6IGdyaWRUb1RleHQoZ3JpZClcbiAgICB9O1xufVxuLyoqIFNlcmlhbGl6ZSBBTEwgc2hlZXRzIG9mIGEgd29ya2Jvb2sgdG8gdGV4dCBibG9ja3MuIEFjY2VwdHMgVWludDhBcnJheSBvciBCdWZmZXIuICovIGV4cG9ydCBmdW5jdGlvbiByZW5kZXJBbGxTaGVldHNGb3JBaShidWYpIHtcbiAgICBjb25zdCB3YiA9IHJlYWQoYnVmLCB7XG4gICAgICAgIHR5cGU6ICdidWZmZXInXG4gICAgfSk7XG4gICAgY29uc3QgYmxvY2tzID0gW107XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHdiLlNoZWV0TmFtZXMgPz8gW10pe1xuICAgICAgICBjb25zdCByZW5kZXJlZCA9IHJlbmRlclNoZWV0Rm9yQWkod2IsIG5hbWUpO1xuICAgICAgICBpZiAocmVuZGVyZWQpIGJsb2Nrcy5wdXNoKHJlbmRlcmVkKTtcbiAgICB9XG4gICAgcmV0dXJuIGJsb2Nrcztcbn1cbi8qKlxuICogU2VyaWFsaXplIEFMTCBzaGVldHMgQU5EIGNvbXB1dGUgZnVsbC1ncmlkIHN0cnVjdHVyYWwgc3RhdGlzdGljcy5cbiAqIFRoaXMgaXMgdGhlIEVYVFJBQ1Qgb3V0cHV0IGZvciB0aGUgd29ya2Zsb3cgcGlwZWxpbmU6IG9uZSBwYXJzZSBwZXJcbiAqIHNoZWV0IHByb2R1Y2VzIGJvdGggdGhlIEFJIHByb21wdCBibG9jayBhbmQgdGhlIEFOQUxZWkUgaGludHMuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RTaGVldHNXaXRoU3RhdHMoYnVmKSB7XG4gICAgY29uc3Qgd2IgPSByZWFkKGJ1Ziwge1xuICAgICAgICB0eXBlOiAnYnVmZmVyJ1xuICAgIH0pO1xuICAgIGNvbnN0IHNoZWV0cyA9IFtdO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiB3Yi5TaGVldE5hbWVzID8/IFtdKXtcbiAgICAgICAgY29uc3Qgc2hlZXQgPSB3Yi5TaGVldHNbbmFtZV07XG4gICAgICAgIGlmICghc2hlZXQpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmdWxsR3JpZCA9IHJlYWRGdWxsR3JpZChzaGVldCk7XG4gICAgICAgIGlmIChmdWxsR3JpZC5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBzdGF0cyA9IGNvbXB1dGVTdGF0cyhuYW1lLCBmdWxsR3JpZCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBncmlkVG9UZXh0KGNhcEdyaWQoZnVsbEdyaWQsIE1BWF9TSEVFVF9ST1dTLCBNQVhfU0hFRVRfQ09MUykpO1xuICAgICAgICBzaGVldHMucHVzaCh7XG4gICAgICAgICAgICB0YWJOYW1lOiBuYW1lLFxuICAgICAgICAgICAgdGV4dCxcbiAgICAgICAgICAgIHN0YXRzXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gc2hlZXRzO1xufVxuIiwgIi8qKlxuICogV29ya2Jvb2sgU2hlZXQgQW5hbHlzaXMgKGRldGVybWluaXN0aWMgcHJlLXBhc3MpXG4gKlxuICogQSBkZXBlbmRlbmN5LWZyZWUgaGV1cmlzdGljIHBhc3Mgb3ZlciBleHRyYWN0ZWQgc2hlZXRzIHRoYXQgcHJvZHVjZXNcbiAqIFwiQW5hbHlzaXNIaW50c1wiIFx1MjAxNCBzdHJ1Y3R1cmVkIGNvbnRleHQgdGhhdDpcbiAqICAgLSBpcyBmZWQgaW50byB0aGUgQ09NUFJFSEVORCBwcm9tcHQgdG8gYmlhcyB0aGUgbW9kZWwgKFBoYXNlIDIpLFxuICogICAtIGdpdmVzIHRoZSByb3V0ZSBsYXllciBhIGZhc3QgcHJlLUFJIHN0YXR1cyAoXCJ3ZSBzZWUgNCBzaGVldHMsIG1vc3RseVxuICogICAgIG51bWVyaWMsIGxpa2VseSBJRFIsIHBlcmlvZCBoaW50cyAyMDI2LTA2XCIpLlxuICpcbiAqIE5vIGFwcGxpY2F0aW9uIGFsaWFzZXMgYW5kIG5vIGV4dGVybmFsIGRlcHMgXHUyMDE0IHNhZmUgdG8gYnVuZGxlIGludG8gdGhlXG4gKiBWZXJjZWwgV29ya2Zsb3cgc3RlcCBidW5kbGUuXG4gKi8gaW1wb3J0IHsgU0hFRVRfQ0FURUdPUklFUyB9IGZyb20gJy4vZXh0cmFjdC1zaGVldHMnO1xuLy8gXHUyNTAwXHUyNTAwIEhldXJpc3RpYyB0YWJsZXMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5jb25zdCBDVVJSRU5DWV9QQVRURVJOUyA9IFtcbiAgICBbXG4gICAgICAgICdJRFInLFxuICAgICAgICAvXFxiKD86SURSfFJwXFwuP3xSdXBpYWgpXFxiL2lcbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ1VTRCcsXG4gICAgICAgIC9cXGIoPzpVU0R8XFwkKVxcYi9cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ0VVUicsXG4gICAgICAgIC9cXGIoPzpFVVJ8XHUyMEFDKVxcYi9cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ0dCUCcsXG4gICAgICAgIC9cXGIoPzpHQlB8XHUwMEEzKVxcYi9cbiAgICBdXG5dO1xuY29uc3QgTU9OVEhfTkFNRVMgPSBbXG4gICAgJ2phbnVhcnknLFxuICAgICdmZWJydWFyeScsXG4gICAgJ21hcmNoJyxcbiAgICAnYXByaWwnLFxuICAgICdtYXknLFxuICAgICdqdW5lJyxcbiAgICAnanVseScsXG4gICAgJ2F1Z3VzdCcsXG4gICAgJ3NlcHRlbWJlcicsXG4gICAgJ29jdG9iZXInLFxuICAgICdub3ZlbWJlcicsXG4gICAgJ2RlY2VtYmVyJyxcbiAgICAnamFudWFyaScsXG4gICAgJ2ZlYnJ1YXJpJyxcbiAgICAnbWFyZXQnLFxuICAgICdhcHJpbCcsXG4gICAgJ21laScsXG4gICAgJ2p1bmknLFxuICAgICdqdWxpJyxcbiAgICAnYWd1c3R1cycsXG4gICAgJ3NlcHRlbWJlcicsXG4gICAgJ29rdG9iZXInLFxuICAgICdub3ZlbWJlcicsXG4gICAgJ2Rlc2VtYmVyJ1xuXTtcbmZ1bmN0aW9uIHBlcmlvZFBhdHRlcm5zKCkge1xuICAgIHJldHVybiBbXG4gICAgICAgIC9cXGIoMTl8MjApXFxkezJ9Wy0vXSgwP1sxLTldfDFbMC0yXSkoPzpbLS9dXFxkezEsMn0pP1xcYi9nLFxuICAgICAgICAvXFxiKDA/WzEtOV18MVswLTJdKVstL10oMTl8MjApXFxkezJ9XFxiL2csXG4gICAgICAgIG5ldyBSZWdFeHAoYFxcXFxiKD86JHtNT05USF9OQU1FUy5qb2luKCd8Jyl9KVxcXFxiYCwgJ2dpJyksXG4gICAgICAgIC9cXGJRWzEtNF1bIC1dPyg/OjE5fDIwKVxcZHsyfVxcYi9naVxuICAgIF07XG59XG5jb25zdCBMQUJFTF9DQVRFR09SWV9NQVAgPSBbXG4gICAgW1xuICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnUFJPRklUICYgTE9TUycsXG4gICAgICAgICAgICAnUFJPRklUIEFORCBMT1NTJyxcbiAgICAgICAgICAgICdMYWJhIFJ1Z2knLFxuICAgICAgICAgICAgJ0lOQ09NRSBTVEFURU1FTlQnLFxuICAgICAgICAgICAgJ1AmTCcsXG4gICAgICAgICAgICAnRUJJVERBJyxcbiAgICAgICAgICAgICdORVQgUFJPRklUJyxcbiAgICAgICAgICAgICdORVQgSU5DT01FJyxcbiAgICAgICAgICAgICdMQUJBIEJFUlNJSCcsXG4gICAgICAgICAgICAnUlVHSSdcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdCQUxBTkNFIFNIRUVUJyxcbiAgICAgICAgICAgICdORVJBQ0EnLFxuICAgICAgICAgICAgJ0FTU0VUJyxcbiAgICAgICAgICAgICdMSUFCSUxJVCcsXG4gICAgICAgICAgICAnRUtVSVRBUycsXG4gICAgICAgICAgICAnRVFVSVRZJyxcbiAgICAgICAgICAgICdUT1RBTCBBU1NFVFMnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ3RyaWFsX2JhbGFuY2UnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnVFJJQUwgQkFMQU5DRScsXG4gICAgICAgICAgICAnTkVSQUNBIFNBTERPJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdnZW5lcmFsX2xlZGdlcicsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdHRU5FUkFMIExFREdFUicsXG4gICAgICAgICAgICAnQlVLVSBCRVNBUicsXG4gICAgICAgICAgICAnSlVSTkFMJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdjb3N0X29mX3NhbGVzJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ0NPU1QgT0YgU0FMRVMnLFxuICAgICAgICAgICAgJ0NPR1MnLFxuICAgICAgICAgICAgJ0hBUkdBIFBPS09LJyxcbiAgICAgICAgICAgICdGT09EIENPU1QnLFxuICAgICAgICAgICAgJ0JFVkVSQUdFIENPU1QnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ2JyZWFrX2V2ZW4nLFxuICAgICAgICBbXG4gICAgICAgICAgICAnQlJFQUsgRVZFTicsXG4gICAgICAgICAgICAnQlJFQUstRVZFTicsXG4gICAgICAgICAgICAnQkVQJyxcbiAgICAgICAgICAgICdUSVRJSyBJTVBBUydcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnZGFpbHlfc2FsZXMnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnREFJTFkgU0FMRVMnLFxuICAgICAgICAgICAgJ1BFTkpVQUxBTiBIQVJJQU4nLFxuICAgICAgICAgICAgJ09NWkVUJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdtb250aF9vbl9tb250aCcsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdNT05USCBPTiBNT05USCcsXG4gICAgICAgICAgICAnTU9NJyxcbiAgICAgICAgICAgICdCVUxBTkFOJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICd2YXJpYW5jZScsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdWQVJJQU5DRScsXG4gICAgICAgICAgICAnVkFSSUFOU0knLFxuICAgICAgICAgICAgJ1NFTElTSUgnLFxuICAgICAgICAgICAgJ0FDVFVBTCBWUyBCVURHRVQnLFxuICAgICAgICAgICAgJ0FDVFVBTCBWUydcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnc3VtbWFyeV9wbCcsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdTVU1NQVJZIFAmTCcsXG4gICAgICAgICAgICAnUklOR0tBU0FOIExBQkEgUlVHSScsXG4gICAgICAgICAgICAnU1VNTUFSWSBQUk9GSVQnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ3N1bW1hcnlfYnMnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnU1VNTUFSWSBCQUxBTkNFJyxcbiAgICAgICAgICAgICdSSU5HS0FTQU4gTkVSQUNBJ1xuICAgICAgICBdXG4gICAgXVxuXTtcbmZ1bmN0aW9uIGNvbGxlY3RIaW50cyh0ZXh0KSB7XG4gICAgY29uc3QgY3VycmVuY3kgPSBbXTtcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCByZV0gb2YgQ1VSUkVOQ1lfUEFUVEVSTlMpe1xuICAgICAgICBpZiAocmUudGVzdCh0ZXh0KSkgY3VycmVuY3kucHVzaChuYW1lKTtcbiAgICB9XG4gICAgY29uc3QgcGVyaW9kcyA9IFtdO1xuICAgIGZvciAoY29uc3QgcmUgb2YgcGVyaW9kUGF0dGVybnMoKSl7XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKHJlKTtcbiAgICAgICAgaWYgKG1hdGNoZXMpIHBlcmlvZHMucHVzaCguLi5tYXRjaGVzKTtcbiAgICB9XG4gICAgY29uc3QgbGFiZWxzID0gW107XG4gICAgZm9yIChjb25zdCBbLCB0ZXJtc10gb2YgTEFCRUxfQ0FURUdPUllfTUFQKXtcbiAgICAgICAgZm9yIChjb25zdCB0ZXJtIG9mIHRlcm1zKXtcbiAgICAgICAgICAgIGlmICh0ZXh0LnRvVXBwZXJDYXNlKCkuaW5jbHVkZXModGVybS50b1VwcGVyQ2FzZSgpKSkgbGFiZWxzLnB1c2godGVybSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY3VycmVuY3ksXG4gICAgICAgIHBlcmlvZHMsXG4gICAgICAgIGxhYmVsc1xuICAgIH07XG59XG5mdW5jdGlvbiBndWVzc0NhdGVnb3J5KGxhYmVscykge1xuICAgIGNvbnN0IHNjb3JlcyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IFtjYXRlZ29yeSwgdGVybXNdIG9mIExBQkVMX0NBVEVHT1JZX01BUCl7XG4gICAgICAgIGxldCBzY29yZSA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgdGVybSBvZiB0ZXJtcyl7XG4gICAgICAgICAgICBpZiAobGFiZWxzLmluY2x1ZGVzKHRlcm0pKSBzY29yZSArPSB0ZXJtLmxlbmd0aDsgLy8gbG9uZ2VyIHRlcm1zIGFyZSBtb3JlIHNwZWNpZmljXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjb3JlID4gMCkgc2NvcmVzLnNldChjYXRlZ29yeSwgc2NvcmUpO1xuICAgIH1cbiAgICBpZiAoc2NvcmVzLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICAgIGNvbnN0IHNvcnRlZCA9IFtcbiAgICAgICAgLi4uc2NvcmVzLmVudHJpZXMoKVxuICAgIF0uc29ydCgoYSwgYik9PmJbMV0gLSBhWzFdKTtcbiAgICBpZiAoc29ydGVkLmxlbmd0aCA+IDEgJiYgc29ydGVkWzBdWzFdID09PSBzb3J0ZWRbMV1bMV0pIHJldHVybiBudWxsOyAvLyB0aWUgXHUyMTkyIGFtYmlndW91c1xuICAgIHJldHVybiBzb3J0ZWRbMF1bMF07XG59XG5mdW5jdGlvbiBiZXN0R3Vlc3ModmFsdWVzKSB7XG4gICAgaWYgKHZhbHVlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGNvdW50cyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IHYgb2YgdmFsdWVzKWNvdW50cy5zZXQodiwgKGNvdW50cy5nZXQodikgPz8gMCkgKyAxKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAuLi5jb3VudHMuZW50cmllcygpXG4gICAgXS5zb3J0KChhLCBiKT0+YlsxXSAtIGFbMV0pWzBdWzBdO1xufVxuLy8gXHUyNTAwXHUyNTAwIFB1YmxpYyBBUEkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vKiogQW5hbHl6ZSBleHRyYWN0ZWQgc2hlZXRzIChFWFRSQUNUIG91dHB1dCkgaW50byBkZXRlcm1pbmlzdGljIGhpbnRzLiAqLyBleHBvcnQgZnVuY3Rpb24gYW5hbHl6ZVNoZWV0cyhzaGVldHMpIHtcbiAgICBjb25zdCBzaGVldEhpbnRzID0gc2hlZXRzLm1hcCgocyk9PntcbiAgICAgICAgY29uc3QgeyBjdXJyZW5jeSwgcGVyaW9kcywgbGFiZWxzIH0gPSBjb2xsZWN0SGludHMocy50ZXh0KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRhYk5hbWU6IHMudGFiTmFtZSxcbiAgICAgICAgICAgIHJvd0NvdW50OiBzLnN0YXRzLnJvd0NvdW50LFxuICAgICAgICAgICAgY29sQ291bnQ6IHMuc3RhdHMuY29sQ291bnQsXG4gICAgICAgICAgICBudW1lcmljUmF0aW86IHMuc3RhdHMubnVtZXJpY1JhdGlvLFxuICAgICAgICAgICAgY3VycmVuY3lIaW50czogY3VycmVuY3ksXG4gICAgICAgICAgICBwZXJpb2RIaW50czogcGVyaW9kcyxcbiAgICAgICAgICAgIGxhYmVsSGludHM6IGxhYmVscyxcbiAgICAgICAgICAgIGxpa2VseUNhdGVnb3J5OiBndWVzc0NhdGVnb3J5KGxhYmVscylcbiAgICAgICAgfTtcbiAgICB9KTtcbiAgICBjb25zdCB0b3RhbFJvd3MgPSBzaGVldEhpbnRzLnJlZHVjZSgoYWNjLCBzKT0+YWNjICsgcy5yb3dDb3VudCwgMCk7XG4gICAgY29uc3QgdG90YWxOb25FbXB0eUNlbGxzID0gc2hlZXRzLnJlZHVjZSgoYWNjLCBzKT0+YWNjICsgcy5zdGF0cy5ub25FbXB0eUNlbGxzLCAwKTtcbiAgICBjb25zdCB3ZWlnaHRlZE51bWVyaWMgPSBzaGVldHMucmVkdWNlKChhY2MsIHMpPT5hY2MgKyBzLnN0YXRzLm51bWVyaWNSYXRpbyAqIHMuc3RhdHMubm9uRW1wdHlDZWxscywgMCk7XG4gICAgY29uc3QgYWxsQ3VycmVuY3kgPSBzaGVldEhpbnRzLmZsYXRNYXAoKHMpPT5zLmN1cnJlbmN5SGludHMpO1xuICAgIGNvbnN0IGFsbFBlcmlvZHMgPSBzaGVldEhpbnRzLmZsYXRNYXAoKHMpPT5zLnBlcmlvZEhpbnRzKTtcbiAgICByZXR1cm4ge1xuICAgICAgICB3b3JrYm9vazoge1xuICAgICAgICAgICAgc2hlZXRDb3VudDogc2hlZXRzLmxlbmd0aCxcbiAgICAgICAgICAgIHRvdGFsUm93cyxcbiAgICAgICAgICAgIHRvdGFsTm9uRW1wdHlDZWxscyxcbiAgICAgICAgICAgIG92ZXJhbGxOdW1lcmljUmF0aW86IHRvdGFsTm9uRW1wdHlDZWxscyA+IDAgPyB3ZWlnaHRlZE51bWVyaWMgLyB0b3RhbE5vbkVtcHR5Q2VsbHMgOiAwLFxuICAgICAgICAgICAgY3VycmVuY3lHdWVzczogYmVzdEd1ZXNzKGFsbEN1cnJlbmN5KSxcbiAgICAgICAgICAgIHBlcmlvZEd1ZXNzOiBiZXN0R3Vlc3MoYWxsUGVyaW9kcylcbiAgICAgICAgfSxcbiAgICAgICAgc2hlZXRzOiBzaGVldEhpbnRzXG4gICAgfTtcbn1cbmV4cG9ydCB7IFNIRUVUX0NBVEVHT1JJRVMgfTtcbiIsICIvKipcbiAqIFdvcmtib29rIENvbXByZWhlbnNpb24gXHUyMDE0IGJ1bmRsZS1sZWFuIE9wZW5BSSBjYWxsXG4gKlxuICogVGhpcyBtb2R1bGUgY29udGFpbnMgT05MWSB0aGUgY29tcHJlaGVuc2lvbiByZXF1ZXN0IHBhdGg6IFpvZCBzY2hlbWFzLFxuICogcHJvbXB0IGJ1aWxkaW5nIChoaW50cy1hd2FyZSksIGEgc2luZ2xlLWF0dGVtcHQgT3BlbkFJIGNhbGwgd2l0aCB0eXBlZFxuICogZXJyb3JzLCBhbmQgcmVzcG9uc2UgcGFyc2luZy5cbiAqXG4gKiBCdW5kbGUgY29uc3RyYWludHM6XG4gKiAgIC0gTk8gYXBwbGljYXRpb24gYWxpYXNlcyAoYEAvLi4uYCkgXHUyMDE0IG9ubHkgYHpvZGAgKyByZWxhdGl2ZSBpbXBvcnRzLlxuICogICAtIE5vIERCIC8gc2VjcmV0cyAvIFByaXNtYSBcdTIwMTQgdGhlIEFQSSBrZXkgaXMgcGFzc2VkIGluIGV4cGxpY2l0bHkuXG4gKiAgIC0gU2FmZSB0byBidW5kbGUgaW50byBWZXJjZWwgV29ya2Zsb3cgc3RlcCBidW5kbGVzICh3b3JrZmxvd3MvKikuXG4gKlxuICogVGhlIHN5bmMgcGlwZWxpbmUgd3JhcHBlciAoYGNvbXByZWhlbmRXb3JrYm9va2AgaW4gd29ya2Jvb2stY29tcHJlaGVuc2lvbi50cylcbiAqIGtlZXBzIGl0cyBvd24ga2V5IHJlc29sdXRpb24gKyAyLWF0dGVtcHQgcmV0cnkgbG9vcCBmb3IgdGhlIG5vbi13b3JrZmxvd1xuICogcGF0aDsgdGhpcyBtb2R1bGUgaXMgdGhlIHNoYXJlZCBzaW5nbGUtYXR0ZW1wdCBjb3JlLlxuICovIGltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgU0hFRVRfQ0FURUdPUklFUyB9IGZyb20gJy4vZXh0cmFjdC1zaGVldHMnO1xuLy8gXHUyNTAwXHUyNTAwIFpvZCB2YWxpZGF0aW9uIHNjaGVtYSBmb3IgdGhlIEFJIHN0cnVjdHVyZWQgb3V0cHV0IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZXhwb3J0IGNvbnN0IE1ldHJpY1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgICAvKiogUGVyaW9kIGluIFlZWVktTU0gKGFubnVhbCB0b3RhbHMgbWF5IHVzZSBZWVlZLTEyKS4gKi8gcGVyaW9kOiB6LnN0cmluZygpLnJlZ2V4KC9eXFxkezR9LVxcZHsyfSQvKSxcbiAgICBkYXRhVHlwZTogei5lbnVtKFtcbiAgICAgICAgJ2FjdHVhbCcsXG4gICAgICAgICdmb3JlY2FzdCdcbiAgICBdKSxcbiAgICBzY2VuYXJpbzogei5lbnVtKFtcbiAgICAgICAgJ2FjdHVhbCcsXG4gICAgICAgICdjb25zZXJ2YXRpdmUnLFxuICAgICAgICAncmVhbGlzdGljJyxcbiAgICAgICAgJ2FzcGlyYXRpb25hbCdcbiAgICBdKSxcbiAgICByZXZlbnVlOiB6Lm51bWJlcigpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICBlYml0ZGE6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgIG5ldEluY29tZTogei5udW1iZXIoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgZ3Vlc3RzOiB6Lm51bWJlcigpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICBzdGFmZkNvc3Q6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpXG59KTtcbmV4cG9ydCBjb25zdCBTaGVldENvbXByZWhlbnNpb25TY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgLyoqIEV4YWN0IHRhYiBuYW1lIGFzIGl0IGFwcGVhcnMgaW4gdGhlIHdvcmtib29rLiAqLyB0YWJOYW1lOiB6LnN0cmluZygpLFxuICAgIGNhdGVnb3J5OiB6LmVudW0oU0hFRVRfQ0FURUdPUklFUyksXG4gICAgLyoqIEh1bWFuLXJlYWRhYmxlIHRpdGxlIGZvciB0aGUgZHluYW1pYyBwYWdlLiAqLyB0aXRsZTogei5zdHJpbmcoKSxcbiAgICAvKiogT25lLXBhcmFncmFwaCBjb21wcmVoZW5zaW9uIG9mIHdoYXQgdGhpcyBzaGVldCBjb250YWlucy4gKi8gc3VtbWFyeTogei5zdHJpbmcoKSxcbiAgICAvKiogRGV0ZWN0ZWQgcGVyaW9kLCBlLmcuIFwiSnVuZSAyMDI2XCIgXHUyMDE0IG51bGwgd2hlbiBub3QgZGV0ZWN0YWJsZS4gKi8gcGVyaW9kSGludDogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgLyoqIENvbHVtbiBoZWFkZXJzIChmaXJzdCBtZWFuaW5nZnVsIHJvdykuICovIGNvbHVtbnM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKSxcbiAgICByb3dDb3VudDogei5udW1iZXIoKS5pbnQoKS5ub25uZWdhdGl2ZSgpLm9wdGlvbmFsKCksXG4gICAgLyoqIFBlci1wZXJpb2QgbWV0cmljcyBmb3VuZCBvbiBUSElTIHNoZWV0LiAqLyBtZXRyaWNzOiB6LmFycmF5KE1ldHJpY1NjaGVtYSkub3B0aW9uYWwoKVxufSk7XG5leHBvcnQgY29uc3QgV29ya2Jvb2tDb21wcmVoZW5zaW9uU2NoZW1hID0gei5vYmplY3Qoe1xuICAgIHdvcmtib29rOiB6Lm9iamVjdCh7XG4gICAgICAgIHRpdGxlOiB6LnN0cmluZygpLFxuICAgICAgICBjb21wYW55OiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgcGVyaW9kOiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgY3VycmVuY3k6IHouc3RyaW5nKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgICAgICBzdW1tYXJ5OiB6LnN0cmluZygpXG4gICAgfSksXG4gICAgc2hlZXRzOiB6LmFycmF5KFNoZWV0Q29tcHJlaGVuc2lvblNjaGVtYSksXG4gICAgLyoqXG4gICAqIE5vcm1hbGl6ZWQgZmluYW5jaWFsIHByb2plY3Rpb25zIGNvbnNvbGlkYXRlZCBhY3Jvc3MgQUxMIHNoZWV0cy5cbiAgICogVGhpcyBpcyB0aGUgc291cmNlIGZvciB0aGUgZmluYW5jaWFsX3Byb2plY3Rpb25zIHRhYmxlLlxuICAgKi8gcHJvamVjdGlvbnM6IHouYXJyYXkoTWV0cmljU2NoZW1hKSxcbiAgICAvKipcbiAgICogVGVtcGxhdGUgc3VnZ2VzdGlvbiBmcm9tIHRoZSBhdmFpbGFibGUgdGVtcGxhdGUgY2F0YWxvZ1xuICAgKiAoVEVNUExBVEVfQ0FUQUxPRyBpZHMsIGUuZy4gXCJmaW5hbmNpYWwtYW5hbHl0aWNzXCIsIFwicmVzdGF1cmFudFwiKS5cbiAgICovIHRlbXBsYXRlOiB6Lm9iamVjdCh7XG4gICAgICAgIGlkOiB6LnN0cmluZygpLFxuICAgICAgICBjb25maWRlbmNlOiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMSkub3B0aW9uYWwoKSxcbiAgICAgICAgcmVhc29uOiB6LnN0cmluZygpLm9wdGlvbmFsKClcbiAgICB9KS5vcHRpb25hbCgpXG59KTtcbi8vIFx1MjUwMFx1MjUwMCBUeXBlZCBlcnJvcnMgKG1hcHBlZCB0byB0aGUgd29ya2Zsb3cgcmV0cnkgcG9saWN5IGJ5IHRoZSBjYWxsZXIpIFx1MjUwMFxuZXhwb3J0IGNsYXNzIENvbXByZWhlbmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBvcHRpb25zKXtcbiAgICAgICAgc3VwZXIobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdDb21wcmVoZW5kRXJyb3InO1xuICAgIH1cbn1cbi8qKiBIVFRQLWxldmVsIGZhaWx1cmUgKG5vbi0yeHgpLiBDYXJyaWVzIHN0YXR1cyArIG9wdGlvbmFsIFJldHJ5LUFmdGVyLiAqLyBleHBvcnQgY2xhc3MgQ29tcHJlaGVuZEh0dHBFcnJvciBleHRlbmRzIENvbXByZWhlbmRFcnJvciB7XG4gICAgc3RhdHVzO1xuICAgIC8qKiBSZXRyeS1BZnRlciBoZWFkZXIgdmFsdWUgaW4gc2Vjb25kcywgd2hlbiBwcmVzZW50LiAqLyByZXRyeUFmdGVyU2Vjb25kcztcbiAgICBjb25zdHJ1Y3RvcihzdGF0dXMsIG1lc3NhZ2UsIHJldHJ5QWZ0ZXJTZWNvbmRzID0gbnVsbCl7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnQ29tcHJlaGVuZEh0dHBFcnJvcic7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLnJldHJ5QWZ0ZXJTZWNvbmRzID0gcmV0cnlBZnRlclNlY29uZHM7XG4gICAgfVxufVxuLyoqIFJlc3BvbnNlIGNvdWxkIG5vdCBiZSBwYXJzZWQvdmFsaWRhdGVkIChKU09OIG9yIFpvZCkuICovIGV4cG9ydCBjbGFzcyBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgQ29tcHJlaGVuZEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBvcHRpb25zKXtcbiAgICAgICAgc3VwZXIobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yJztcbiAgICB9XG59XG4vLyBcdTI1MDBcdTI1MDAgUHJvbXB0IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuY29uc3QgU1lTVEVNX1BST01QVCA9ICdZb3UgYXJlIGEgcHJlY2lzZSBmaW5hbmNpYWwgYW5hbHlzdCBhbmQgd29ya2Jvb2sgaW50ZXJwcmV0ZXIuICcgKyAnWW91IHJlYWQgcmF3IHNwcmVhZHNoZWV0IGR1bXBzIGFuZCByZXR1cm4gT05MWSB2YWxpZCBKU09OIG1hdGNoaW5nIHRoZSByZXF1ZXN0ZWQgc2NoZW1hIGV4YWN0bHkuICcgKyAnTmV2ZXIgaW52ZW50IGRhdGEgdGhhdCBpcyBub3QgcHJlc2VudCBpbiB0aGUgc2hlZXRzIFx1MjAxNCBsZWF2ZSBtZXRyaWNzIG51bGwgd2hlbiBhYnNlbnQuJztcbi8qKiBSZW5kZXIgdGhlIGRldGVybWluaXN0aWMgQU5BTFlaRSBoaW50cyBhcyBhIHByb21wdCBzZWN0aW9uLiAqLyBmdW5jdGlvbiByZW5kZXJIaW50c1NlY3Rpb24oaGludHMpIHtcbiAgICBjb25zdCB3YiA9IGhpbnRzLndvcmtib29rO1xuICAgIGNvbnN0IGxpbmVzID0gW1xuICAgICAgICBgLSBXb3JrYm9vazogJHt3Yi5zaGVldENvdW50fSBzaGVldChzKSwgJHt3Yi50b3RhbFJvd3N9IHRvdGFsIHJvd3MsIGAgKyBgJHtNYXRoLnJvdW5kKHdiLm92ZXJhbGxOdW1lcmljUmF0aW8gKiAxMDApfSUgbnVtZXJpYyBjZWxscy5gXG4gICAgXTtcbiAgICBpZiAod2IuY3VycmVuY3lHdWVzcykgbGluZXMucHVzaChgLSBDdXJyZW5jeSBndWVzczogJHt3Yi5jdXJyZW5jeUd1ZXNzfWApO1xuICAgIGlmICh3Yi5wZXJpb2RHdWVzcykgbGluZXMucHVzaChgLSBQZXJpb2QgZ3Vlc3M6ICR7d2IucGVyaW9kR3Vlc3N9YCk7XG4gICAgZm9yIChjb25zdCBzIG9mIGhpbnRzLnNoZWV0cyl7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gW1xuICAgICAgICAgICAgYFwiJHtzLnRhYk5hbWV9XCI6ICR7cy5yb3dDb3VudH0gcm93cyBcdTAwRDcgJHtzLmNvbENvdW50fSBjb2xzLCBgICsgYCR7TWF0aC5yb3VuZChzLm51bWVyaWNSYXRpbyAqIDEwMCl9JSBudW1lcmljYFxuICAgICAgICBdO1xuICAgICAgICBpZiAocy5jdXJyZW5jeUhpbnRzLmxlbmd0aCA+IDApIHBhcnRzLnB1c2goYGN1cnJlbmN5IFske3MuY3VycmVuY3lIaW50cy5qb2luKCcsJyl9XWApO1xuICAgICAgICBpZiAocy5wZXJpb2RIaW50cy5sZW5ndGggPiAwKSBwYXJ0cy5wdXNoKGBwZXJpb2RzIFske3MucGVyaW9kSGludHMuam9pbignLCAnKX1dYCk7XG4gICAgICAgIGlmIChzLmxhYmVsSGludHMubGVuZ3RoID4gMCkgcGFydHMucHVzaChgbGFiZWxzIFske3MubGFiZWxIaW50cy5qb2luKCcsICcpfV1gKTtcbiAgICAgICAgaWYgKHMubGlrZWx5Q2F0ZWdvcnkpIHBhcnRzLnB1c2goYGNhdGVnb3J5LWd1ZXNzICR7cy5saWtlbHlDYXRlZ29yeX1gKTtcbiAgICAgICAgbGluZXMucHVzaChgICAtIFNoZWV0ICR7cGFydHMuam9pbignOyAnKX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ29tcHJlaGVuc2lvblByb21wdChibG9ja3MsIGhpbnRzKSB7XG4gICAgY29uc3Qgc2hlZXRCbG9ja3MgPSBibG9ja3MubWFwKChiKT0+YD09PT09IFNIRUVUOiAke2IudGFiTmFtZX0gPT09PT1cXG4ke2IudGV4dH1cXG5gKS5qb2luKCdcXG4nKTtcbiAgICBjb25zdCBoaW50c1NlY3Rpb24gPSBoaW50cyA/IGBERVRFUk1JTklTVElDIFBSRS1BTkFMWVNJUyAoZ2VuZXJhdGVkIGJ5IGNvZGUgXHUyMDE0IHVzZSBhcyBzdHJvbmcgcHJpb3JzLCBidXQgQUxXQVlTIHZlcmlmeSBhZ2FpbnN0IHRoZSBhY3R1YWwgZHVtcDsgY2F0ZWdvcnktZ3Vlc3MgaXMgbm90IGF1dGhvcml0YXRpdmUpOlxuJHtyZW5kZXJIaW50c1NlY3Rpb24oaGludHMpfVxuXG5gIDogJyc7XG4gICAgcmV0dXJuIGBBbmFseXplIHRoZSBmb2xsb3dpbmcgd29ya2Jvb2suIEV2ZXJ5IHNoZWV0IG9mIHRoZSB3b3JrYm9vayBpcyBkdW1wZWQgYmVsb3cgYXMgXCJSPHJvdz46IDxjZWxscz5cIi5cblxuVEFTS1M6XG4xLiBVbmRlcnN0YW5kIHRoZSB3b3JrYm9vayBhcyBhIHdob2xlIChjb21wYW55LCBwZXJpb2QsIGN1cnJlbmN5LCBwdXJwb3NlKS5cbjIuIEZvciBFQUNIIHNoZWV0OiBpZGVudGlmeSBpdHMgY2F0ZWdvcnksIGEgaHVtYW4tcmVhZGFibGUgdGl0bGUsIGEgc2hvcnQgY29tcHJlaGVuc2lvbiBzdW1tYXJ5LCBkZXRlY3RlZCBwZXJpb2QgKGUuZy4gXCJKdW5lIDIwMjZcIiksIGNvbHVtbiBoZWFkZXJzLCByb3cgY291bnQsIGFuZCBhbnkgcGVyLXBlcmlvZCBmaW5hbmNpYWwgbWV0cmljcyAocmV2ZW51ZSwgRUJJVERBLCBuZXQgaW5jb21lLCBndWVzdHMsIHN0YWZmIGNvc3QpIHlvdSBjYW4gcmVhZCBmcm9tIHRoZSBzaGVldC5cbjMuIENvbnNvbGlkYXRlIEFMTCBwZXJpb2QtbGV2ZWwgZmluYW5jaWFsIGRhdGEgYWNyb3NzIHRoZSB3aG9sZSB3b3JrYm9vayBpbnRvIGEgc2luZ2xlIFwicHJvamVjdGlvbnNcIiBhcnJheTogb25lIGVudHJ5IHBlciAocGVyaW9kIFlZWVktTU0sIGRhdGFUeXBlIGFjdHVhbHxmb3JlY2FzdCwgc2NlbmFyaW8gYWN0dWFsfGNvbnNlcnZhdGl2ZXxyZWFsaXN0aWN8YXNwaXJhdGlvbmFsKS4gVXNlIHRoZSBiZXN0IHNvdXJjZSBmb3IgZWFjaCBwZXJpb2QgKGUuZy4gYSBQJkwgc3RhdGVtZW50IGZvciBhY3R1YWxzLCBhIEJFUCB0YWJsZSBvciBidWRnZXQgc2hlZXQgZm9yIGZvcmVjYXN0cykuIEFubnVhbCB0b3RhbHMgdXNlIFlZWVktMTIuIE9ubHkgaW5jbHVkZSBlbnRyaWVzIHdoZXJlIGF0IGxlYXN0IG9uZSBtZXRyaWMgaXMgcHJlc2VudC5cbjQuIFN1Z2dlc3QgdGhlIG1vc3QgYXBwcm9wcmlhdGUgYXBwIHRlbXBsYXRlIGlkIGZyb20gdGhpcyBhdmFpbGFibGUgY2F0YWxvZzogZmluYW5jaWFsLWFuYWx5dGljcywgcmVzdGF1cmFudCwgaG90ZWwsIGVkdWNhdGlvbiwgZWNvbW1lcmNlLXJldGFpbCwgaGVhbHRoY2FyZSwgbWFudWZhY3R1cmluZywgcHJvZmVzc2lvbmFsLXNlcnZpY2VzLCByZWFsLWVzdGF0ZSwgc3VwcGx5LWNoYWluIChjb25maWRlbmNlIDAuLjEpLlxuXG5SVUxFUzpcbi0gcGVyaW9kczogWVlZWS1NTSBvbmx5IChlLmcuIFwiMjAyNi0wNlwiLCBcIjIwMjUtMTJcIiBmb3IgYW5udWFsKS5cbi0gZGF0YVR5cGUgXCJhY3R1YWxcIiBmb3IgcmVwb3J0ZWQvYWN0dWFsIGZpZ3VyZXMsIFwiZm9yZWNhc3RcIiBmb3IgcHJvamVjdGlvbnMvYnVkZ2V0cy5cbi0gc2NlbmFyaW86IFwiYWN0dWFsXCIgZm9yIGFjdHVhbHM7IFwiY29uc2VydmF0aXZlXCIgZm9yIGJhc2UgZm9yZWNhc3RzOyBcInJlYWxpc3RpY1wiL1wiYXNwaXJhdGlvbmFsXCIgd2hlbiB0aGUgc2hlZXQgZXhwbGljaXRseSBsYWJlbHMgc2NlbmFyaW9zLlxuLSBBbW91bnRzIGFyZSBmdWxsIElEUiBpbnRlZ2VycyAobm8gXCJLXCIgc2hvcnRoYW5kKS4gUm91bmQgdG8gaW50ZWdlcnMuXG4tIExlYXZlIGEgbWV0cmljIG51bGwgd2hlbiB0aGUgc2hlZXQgZG9lcyBub3QgY29udGFpbiBpdCBmb3IgdGhhdCBwZXJpb2QuXG4tIGNhdGVnb3J5IG11c3QgYmUgb25lIG9mOiAke1NIRUVUX0NBVEVHT1JJRVMuam9pbignLCAnKX0uXG5cbiR7aGludHNTZWN0aW9ufVdPUktCT09LIERVTVA6XG4ke3NoZWV0QmxvY2tzfWA7XG59XG5leHBvcnQgZnVuY3Rpb24gc3RyaXBDb2RlRmVuY2UocmVwbHkpIHtcbiAgICBjb25zdCBtYXRjaCA9IHJlcGx5Lm1hdGNoKC9gYGAoPzpqc29uKT9cXHMqKFtcXHNcXFNdKj8pYGBgLyk7XG4gICAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiByZXBseTtcbn1cbi8qKlxuICogT05FIE9wZW5BSSBjYWxsIHRvIGNvbXByZWhlbmQgdGhlIHdvcmtib29rLiBObyByZXRyeSBsb29wIFx1MjAxNCB0aGUgY2FsbGVyXG4gKiAoc3luYyBwaXBlbGluZSBvciB3b3JrZmxvdyBzdGVwKSBvd25zIHJldHJ5IHBvbGljeS5cbiAqXG4gKiBUaHJvd3M6XG4gKiAgIC0gQ29tcHJlaGVuZEh0dHBFcnJvciAoc3RhdHVzIDQyOSBjYXJyaWVzIHJldHJ5QWZ0ZXJTZWNvbmRzKVxuICogICAtIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IgKGJhZCBKU09OIC8gWm9kIHJlamVjdGlvbilcbiAqICAgLSBDb21wcmVoZW5kRXJyb3IgKG5ldHdvcmsgZXRjLiBcdTIwMTQgd3JhcHBlZCBmcm9tIGZldGNoIGZhaWx1cmVzKVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21wcmVoZW5kT25jZShibG9ja3MsIG9wdGlvbnMpIHtcbiAgICBjb25zdCB7IG1vZGVsID0gJ2dwdC00bycsIGhpbnRzLCBhcGlLZXksIGJhc2VVcmwgPSAnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MScgfSA9IG9wdGlvbnM7XG4gICAgaWYgKGJsb2Nrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IoJ1dvcmtib29rIGNvbnRhaW5zIG5vIHJlYWRhYmxlIHNoZWV0cycpO1xuICAgIH1cbiAgICBjb25zdCBwcm9tcHQgPSBidWlsZENvbXByZWhlbnNpb25Qcm9tcHQoYmxvY2tzLCBoaW50cyk7XG4gICAgbGV0IHJlc3BvbnNlO1xuICAgIHRyeSB7XG4gICAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YmFzZVVybH0vY2hhdC9jb21wbGV0aW9uc2AsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogU1lTVEVNX1BST01QVFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuMixcbiAgICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAxNjM4NCxcbiAgICAgICAgICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2pzb25fb2JqZWN0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZEVycm9yKGBPcGVuQUkgcmVxdWVzdCBmYWlsZWQ6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWAsIHtcbiAgICAgICAgICAgIGNhdXNlOiBlcnJcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyQm9keSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKS5jYXRjaCgoKT0+J1Vua25vd24gZXJyb3InKTtcbiAgICAgICAgbGV0IHJldHJ5QWZ0ZXJTZWNvbmRzID0gbnVsbDtcbiAgICAgICAgY29uc3QgcmV0cnlBZnRlciA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdyZXRyeS1hZnRlcicpO1xuICAgICAgICBpZiAocmV0cnlBZnRlcikge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gTnVtYmVyKHJldHJ5QWZ0ZXIpO1xuICAgICAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZShwYXJzZWQpICYmIHBhcnNlZCA+PSAwKSByZXRyeUFmdGVyU2Vjb25kcyA9IHBhcnNlZDtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZEh0dHBFcnJvcihyZXNwb25zZS5zdGF0dXMsIGBPcGVuQUkgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pOiAke2VyckJvZHl9YCwgcmV0cnlBZnRlclNlY29uZHMpO1xuICAgIH1cbiAgICBsZXQgcmVzdWx0O1xuICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhyb3cgbmV3IENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IoYE9wZW5BSSByZXNwb25zZSB3YXMgbm90IHZhbGlkIEpTT046ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgIH1cbiAgICBjb25zdCByZXBseSA9IHJlc3VsdC5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgPz8gJyc7XG4gICAgbGV0IHBhcnNlZDtcbiAgICB0cnkge1xuICAgICAgICBwYXJzZWQgPSBKU09OLnBhcnNlKHN0cmlwQ29kZUZlbmNlKHJlcGx5KSk7XG4gICAgfSBjYXRjaCAge1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcignQUkgcmVzcG9uc2Ugd2FzIG5vdCB2YWxpZCBKU09OOiAnICsgcmVwbHkuc2xpY2UoMCwgNTAwKSk7XG4gICAgfVxuICAgIGxldCBjb21wcmVoZW5zaW9uO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbXByZWhlbnNpb24gPSBXb3JrYm9va0NvbXByZWhlbnNpb25TY2hlbWEucGFyc2UocGFyc2VkKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZmlyc3QgPSBlcnIgaW5zdGFuY2VvZiB6LlpvZEVycm9yID8gZXJyLmlzc3Vlc1swXSA6IG51bGw7XG4gICAgICAgIGNvbnN0IGRldGFpbCA9IGZpcnN0ID8gYCR7Zmlyc3QucGF0aC5qb2luKCcuJykgfHwgJ3Jvb3QnfTogJHtmaXJzdC5tZXNzYWdlfWAgOiBTdHJpbmcoZXJyKTtcbiAgICAgICAgdGhyb3cgbmV3IENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IoYEFJIHJlc3BvbnNlIGZhaWxlZCBzY2hlbWEgdmFsaWRhdGlvbjogJHtkZXRhaWx9YCwge1xuICAgICAgICAgICAgY2F1c2U6IGVyclxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29tcHJlaGVuc2lvbixcbiAgICAgICAgbW9kZWwsXG4gICAgICAgIHByb21wdExlbmd0aDogcHJvbXB0Lmxlbmd0aFxuICAgIH07XG59XG4iLCAiLyoqXG4gKiBQcm9ncmVzcyBlbWlzc2lvbiBmb3IgdGhlIHdvcmtib29rLWluZ2VzdCB3b3JrZmxvdy5cbiAqXG4gKiBGb2xsb3dzIHRoZSBTREsgc3RyZWFtaW5nIHBhdHRlcm46XG4gKiAgIC0gdGhlIHdvcmtmbG93IGZ1bmN0aW9uIGNhbGxzIGBnZXRXcml0YWJsZSgpYCBhbmQgcGFzc2VzIHRoZSBzdHJlYW0gdG8gc3RlcHM7XG4gKiAgIC0gc3RlcHMgb2J0YWluIGEgd3JpdGVyLCB3cml0ZSBKU09OIGNodW5rcywgYW5kIHJlbGVhc2UgdGhlIGxvY2suXG4gKlxuICogVGhlIHdyaXRhYmxlIHN0cmVhbSBpcyBzZXJpYWxpemVkIGJ5IHJlZmVyZW5jZSBhY3Jvc3Mgc3RlcCBib3VuZGFyaWVzXG4gKiAoc3RyZWFtVG9TdHJlYW1SZWYpLCBzbyB3ZSBhbHdheXMgcGFzcyB0aGUgcmF3IFdyaXRhYmxlU3RyZWFtIFx1MjAxNCBuZXZlciBhXG4gKiB3cmFwcGVyIG9iamVjdC5cbiAqLyAvKipcbiAqIEVuY29kZSBhIHByb2dyZXNzIGNodW5rIGFzIGEgSlNPTiBzdHJpbmcgKGNodW5rcyBhcmUgd3JpdHRlbiBhcyB0ZXh0KS5cbiAqLyBleHBvcnQgZnVuY3Rpb24gZW5jb2RlQ2h1bmsoY2h1bmspIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoY2h1bmspO1xufVxuLyoqXG4gKiBXcml0ZSBvbmUgcHJvZ3Jlc3MgY2h1bmsuIENhbGwgZnJvbSB3aXRoaW4gYSBzdGVwOlxuICpcbiAqICAgYXN5bmMgZnVuY3Rpb24gZW1pdFByb2dyZXNzU3RlcCh3cml0YWJsZTogV3JpdGFibGVTdHJlYW0sIGNodW5rOiBQcm9ncmVzc0NodW5rKSB7XG4gKiAgICAgJ3VzZSBzdGVwJztcbiAqICAgICBhd2FpdCB3cml0ZVByb2dyZXNzQ2h1bmsod3JpdGFibGUsIGNodW5rKTtcbiAqICAgfVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZVByb2dyZXNzQ2h1bmsod3JpdGFibGUsIGNodW5rKSB7XG4gICAgY29uc3Qgd3JpdGVyID0gd3JpdGFibGUuZ2V0V3JpdGVyKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgd3JpdGVyLndyaXRlKGNodW5rKTtcbiAgICB9IGZpbmFsbHl7XG4gICAgICAgIHdyaXRlci5yZWxlYXNlTG9jaygpO1xuICAgIH1cbn1cbi8qKiBDbG9zZSB0aGUgc3RyZWFtIHRvIHNpZ25hbCBjb21wbGV0aW9uLiBDYWxsIGZyb20gd2l0aGluIGEgc3RlcC4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsb3NlUHJvZ3Jlc3NTdHJlYW0od3JpdGFibGUpIHtcbiAgICBhd2FpdCB3cml0YWJsZS5jbG9zZSgpO1xufVxuIiwgIi8qKlxuICogTGlnaHR3ZWlnaHQgUG9zdGdyZVNRTCBoZWxwZXIgZm9yIHdvcmtmbG93IHN0ZXBzIChwZyBkcml2ZXIsIG5vIFByaXNtYSkuXG4gKlxuICogRWFjaCBzdGVwIG9wZW5zIGl0cyBvd24gc2hvcnQtbGl2ZWQgY29ubmVjdGlvbiBcdTIwMTQgZmluZSBmb3Igd29ya2Zsb3cgc3RlcHNcbiAqIHdoaWNoIGFyZSBhbHJlYWR5IGluZGl2aWR1YWxseSBpbnZvaWNlZCBWZXJjZWwgRnVuY3Rpb24gaW52b2NhdGlvbnMuXG4gKiBUaGUgcG9vbC9jb25uZWN0aW9uLXN0cmluZyBjb21lcyBmcm9tIGBwcm9jZXNzLmVudi5QT1NUR1JFU19VUkxgIChzZXQgYnlcbiAqIHRoZSBWZXJjZWwvTmVvbiBpbnRlZ3JhdGlvbiBhbmQgYXZhaWxhYmxlIGluIHN0ZXAgcnVudGltZSkuXG4gKi8gaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSAncGcnO1xuLyoqXG4gKiBSdW4gYSBjYWxsYmFjayB3aXRoIGEgc2hvcnQtbGl2ZWQgcGcgY29ubmVjdGlvbi5cbiAqIFRoZSBjb25uZWN0aW9uIHN0cmluZyBpcyByZXNvbHZlZCBieSB0aGUgcm91dGUgKHJvb3QgZW52IFx1MjE5MiB0ZW5hbnQgZGJfdXJsIGxvb2t1cClcbiAqIGFuZCBwYXNzZWQgdGhyb3VnaCB0aGUgd29ya2Zsb3cgaW5wdXQgXHUyMDE0IG5ldmVyIHJlYWQgZnJvbSBwcm9jZXNzLmVudiBkaXJlY3RseS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gd2l0aFBnQ2xpZW50KGNvbm5lY3Rpb25TdHJpbmcsIGZuKSB7XG4gICAgaWYgKCFjb25uZWN0aW9uU3RyaW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZGF0YWJhc2UgY29ubmVjdGlvbiBzdHJpbmcgcHJvdmlkZWQuJyk7XG4gICAgfVxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoe1xuICAgICAgICBjb25uZWN0aW9uU3RyaW5nXG4gICAgfSk7XG4gICAgYXdhaXQgY2xpZW50LmNvbm5lY3QoKTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgZm4oY2xpZW50KTtcbiAgICB9IGZpbmFsbHl7XG4gICAgICAgIGF3YWl0IGNsaWVudC5lbmQoKTtcbiAgICB9XG59XG4vKiogUnVuIGEgc2luZ2xlIFNRTCBzdGF0ZW1lbnQgYW5kIHJldHVybiB0aGUgcm93IGNvdW50IG9yIHJlc3VsdC4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVPbmUoY2xpZW50LCBzcWwsIHBhcmFtcyA9IFtdKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnF1ZXJ5KHNxbCwgcGFyYW1zKTtcbiAgICByZXR1cm4gcmVzdWx0LnJvd0NvdW50ID8/IDA7XG59XG4vKiogUnVuIFNRTCBhbmQgcmV0dXJuIGFsbCByb3dzLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcXVlcnlSb3dzKGNsaWVudCwgc3FsLCBwYXJhbXMgPSBbXSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5xdWVyeShzcWwsIHBhcmFtcyk7XG4gICAgcmV0dXJuIHJlc3VsdC5yb3dzO1xufVxuIiwgIi8qKlxuICogU2VyZGUgY29tcGxpYW5jZSBjaGVja2VyIGZvciB3b3JrZmxvdyBjdXN0b20gY2xhc3Mgc2VyaWFsaXphdGlvbi5cbiAqXG4gKiBBbmFseXplcyBzb3VyY2UgY29kZSB0byBkZXRlcm1pbmUgaWYgY2xhc3NlcyB3aXRoIFdPUktGTE9XX1NFUklBTElaRSAvXG4gKiBXT1JLRkxPV19ERVNFUklBTElaRSBhcmUgY29ycmVjdGx5IHNldCB1cCBmb3IgdGhlIHdvcmtmbG93IHNhbmRib3guXG4gKlxuICogVXNlZCBieTpcbiAqIC0gQ0xJIGB2YWxpZGF0ZWAgY29tbWFuZFxuICogLSBDTEkgYHRyYW5zZm9ybWAgY29tbWFuZCAoLS1jaGVjay1zZXJkZSlcbiAqIC0gU1dDIHBsYXlncm91bmQgc2VyZGUgYW5hbHlzaXMgcGFuZWxcbiAqIC0gQnVpbGQtdGltZSB3YXJuaW5ncyBpbiBCYXNlQnVpbGRlclxuICovXG5cbmltcG9ydCBidWlsdGluTW9kdWxlcyBmcm9tICdidWlsdGluLW1vZHVsZXMnO1xuaW1wb3J0IHR5cGUgeyBXb3JrZmxvd01hbmlmZXN0IH0gZnJvbSAnLi9hcHBseS1zd2MtdHJhbnNmb3JtLmpzJztcblxuLy8gQnVpbGQgYSByZWdleCB0aGF0IG1hdGNoZXMgTm9kZS5qcyBidWlsdC1pbiBtb2R1bGUgaW1wb3J0cyBpbiB0cmFuc2Zvcm1lZCBjb2RlLlxuLy8gSGFuZGxlcyBib3RoIEVTTSAoYGZyb20gJ2ZzJ2AsIGBmcm9tICdub2RlOmZzJ2ApIGFuZCBDSlMgKGByZXF1aXJlKCdmcycpYClcbmNvbnN0IG5vZGVCdWlsdGlucyA9IGJ1aWx0aW5Nb2R1bGVzLmpvaW4oJ3wnKTtcblxuLy8gUmVnZXggdG8gZXh0cmFjdCBzcGVjaWZpYyBtb2R1bGUgbmFtZXMgZnJvbSBpbXBvcnQvcmVxdWlyZSBzdGF0ZW1lbnRzXG5jb25zdCBub2RlSW1wb3J0RXh0cmFjdFJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgYCg/OmZyb21cXFxccytbJ1wiXSg/Om5vZGU6KT8oKD86JHtub2RlQnVpbHRpbnN9KSg/Oi9bXidcIl0qKT8pWydcIl1gICtcbiAgICBgfHJlcXVpcmVcXFxccypcXFxcKFxcXFxzKlsnXCJdKD86bm9kZTopPygoPzoke25vZGVCdWlsdGluc30pKD86L1teJ1wiXSopPylbJ1wiXVxcXFxzKlxcXFwpKWAsXG4gICdnJ1xuKTtcblxuLy8gUmVnZXggdG8gZGV0ZWN0IGNsYXNzIHJlZ2lzdHJhdGlvbiBJSUZFcyBnZW5lcmF0ZWQgYnkgdGhlIFNXQyBwbHVnaW5cbmNvbnN0IHJlZ2lzdHJhdGlvbklpZmVSZWdleCA9XG4gIC9TeW1ib2xcXC5mb3JcXHMqXFwoXFxzKltcIiddd29ya2Zsb3ctY2xhc3MtcmVnaXN0cnlbXCInXVxccypcXCkvO1xuXG4vKipcbiAqIFJlc3VsdCBvZiBjaGVja2luZyBhIHNpbmdsZSBjbGFzcyBmb3Igc2VyZGUgY29tcGxpYW5jZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJkZUNsYXNzQ2hlY2tSZXN1bHQge1xuICAvKiogVGhlIGNsYXNzIG5hbWUgYXMgZGV0ZWN0ZWQgaW4gdGhlIHNvdXJjZSAqL1xuICBjbGFzc05hbWU6IHN0cmluZztcbiAgLyoqIFRoZSBjbGFzc0lkIGFzc2lnbmVkIGJ5IHRoZSBTV0MgcGx1Z2luIChmcm9tIHRoZSBtYW5pZmVzdCkgKi9cbiAgY2xhc3NJZDogc3RyaW5nO1xuICAvKiogV2hldGhlciB0aGUgU1dDIHBsdWdpbiBkZXRlY3RlZCBzZXJkZSBzeW1ib2xzIG9uIHRoaXMgY2xhc3MgKi9cbiAgZGV0ZWN0ZWQ6IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIGEgcmVnaXN0cmF0aW9uIElJRkUgd2FzIGdlbmVyYXRlZCBpbiB0aGUgb3V0cHV0ICovXG4gIHJlZ2lzdGVyZWQ6IGJvb2xlYW47XG4gIC8qKlxuICAgKiBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBpbXBvcnRzIHJlbWFpbmluZyBpbiB0aGUgd29ya2Zsb3ctbW9kZSBvdXRwdXQuXG4gICAqIElmIG5vbi1lbXB0eSwgdGhlIGNsYXNzIGlzIE5PVCB3b3JrZmxvdy1zYW5kYm94IGNvbXBsaWFudC5cbiAgICovXG4gIG5vZGVJbXBvcnRzOiBzdHJpbmdbXTtcbiAgLyoqIFdoZXRoZXIgdGhlIGNsYXNzIHBhc3NlcyBhbGwgY29tcGxpYW5jZSBjaGVja3MgKi9cbiAgY29tcGxpYW50OiBib29sZWFuO1xuICAvKiogSHVtYW4tcmVhZGFibGUgZGVzY3JpcHRpb25zIG9mIGFueSBpc3N1ZXMgZm91bmQgKi9cbiAgaXNzdWVzOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBGdWxsIHJlc3VsdCBvZiBzZXJkZSBjb21wbGlhbmNlIGFuYWx5c2lzIGZvciBhIHNvdXJjZSBmaWxlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlcmRlQ2hlY2tSZXN1bHQge1xuICAvKiogUGVyLWNsYXNzIGFuYWx5c2lzIHJlc3VsdHMgKi9cbiAgY2xhc3NlczogU2VyZGVDbGFzc0NoZWNrUmVzdWx0W107XG4gIC8qKiBBbGwgTm9kZS5qcyBidWlsdC1pbiBpbXBvcnRzIGZvdW5kIGluIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dCAqL1xuICBnbG9iYWxOb2RlSW1wb3J0czogc3RyaW5nW107XG4gIC8qKiBXaGV0aGVyIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dCBjb250YWlucyBhbnkgc2VyZGUtcmVsYXRlZCBjbGFzc2VzICovXG4gIGhhc1NlcmRlQ2xhc3NlczogYm9vbGVhbjtcbiAgLyoqIFRoZSByYXcgd29ya2Zsb3cgbWFuaWZlc3QgZXh0cmFjdGVkIGZyb20gdGhlIFNXQyB0cmFuc2Zvcm0gKi9cbiAgbWFuaWZlc3Q6IFdvcmtmbG93TWFuaWZlc3Q7XG59XG5cbi8qKlxuICogTGlnaHR3ZWlnaHQgc2VyZGUgY29tcGxpYW5jZSBjaGVja2VyIHRoYXQgd29ya3Mgd2l0aCBwcmUtY29tcHV0ZWRcbiAqIFNXQyB0cmFuc2Zvcm0gcmVzdWx0cy4gVGhpcyBhdm9pZHMgcmUtcnVubmluZyB0aGUgU1dDIHRyYW5zZm9ybVxuICogd2hlbiB0aGUgY2FsbGVyIGFscmVhZHkgaGFzIHRoZSBvdXRwdXRzIChlLmcuLCB0aGUgcGxheWdyb3VuZCBvciBidWlsZGVyKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuYWx5emVTZXJkZUNvbXBsaWFuY2Uob3B0aW9uczoge1xuICAvKiogU291cmNlIGNvZGUgKHVzZWQgZm9yIHBhdHRlcm4gZGV0ZWN0aW9uKSAqL1xuICBzb3VyY2VDb2RlOiBzdHJpbmc7XG4gIC8qKiBXb3JrZmxvdy1tb2RlIHRyYW5zZm9ybWVkIG91dHB1dCAqL1xuICB3b3JrZmxvd0NvZGU6IHN0cmluZztcbiAgLyoqIE1hbmlmZXN0IGV4dHJhY3RlZCBmcm9tIHRoZSBTV0MgdHJhbnNmb3JtICovXG4gIG1hbmlmZXN0OiBXb3JrZmxvd01hbmlmZXN0O1xufSk6IFNlcmRlQ2hlY2tSZXN1bHQge1xuICBjb25zdCB7IHNvdXJjZUNvZGUsIHdvcmtmbG93Q29kZSwgbWFuaWZlc3QgfSA9IG9wdGlvbnM7XG5cbiAgLy8gMS4gRXh0cmFjdCBhbGwgTm9kZS5qcyBidWlsdC1pbiBpbXBvcnRzIGZyb20gdGhlIHdvcmtmbG93IG91dHB1dFxuICBjb25zdCBnbG9iYWxOb2RlSW1wb3J0cyA9IGV4dHJhY3ROb2RlSW1wb3J0cyh3b3JrZmxvd0NvZGUpO1xuXG4gIC8vIDIuIENoZWNrIGlmIHRoZSBtYW5pZmVzdCBjb250YWlucyBhbnkgc2VyZGUtcmVnaXN0ZXJlZCBjbGFzc2VzXG4gIGNvbnN0IGNsYXNzRW50cmllcyA9IGV4dHJhY3RDbGFzc0VudHJpZXMobWFuaWZlc3QpO1xuICBjb25zdCBoYXNTZXJkZUNsYXNzZXMgPSBjbGFzc0VudHJpZXMubGVuZ3RoID4gMDtcblxuICAvLyAzLiBDaGVjayBpZiB0aGUgd29ya2Zsb3cgb3V0cHV0IGNvbnRhaW5zIHJlZ2lzdHJhdGlvbiBJSUZFc1xuICBjb25zdCBoYXNSZWdpc3RyYXRpb24gPSByZWdpc3RyYXRpb25JaWZlUmVnZXgudGVzdCh3b3JrZmxvd0NvZGUpO1xuXG4gIC8vIDQuIEFuYWx5emUgZWFjaCBjbGFzc1xuICBjb25zdCBjbGFzc2VzOiBTZXJkZUNsYXNzQ2hlY2tSZXN1bHRbXSA9IGNsYXNzRW50cmllcy5tYXAoKGVudHJ5KSA9PiB7XG4gICAgY29uc3QgaXNzdWVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8gQ2hlY2sgZm9yIE5vZGUuanMgaW1wb3J0cyAodGhlc2Ugd2lsbCBmYWlsIGluIHRoZSB3b3JrZmxvdyBzYW5kYm94KVxuICAgIGlmIChnbG9iYWxOb2RlSW1wb3J0cy5sZW5ndGggPiAwKSB7XG4gICAgICBpc3N1ZXMucHVzaChcbiAgICAgICAgYFdvcmtmbG93IGJ1bmRsZSBjb250YWlucyBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHM6ICR7Z2xvYmFsTm9kZUltcG9ydHMuam9pbignLCAnKX0uIGAgK1xuICAgICAgICAgIGBUaGVzZSB3aWxsIGZhaWwgYXQgcnVudGltZSBpbiB0aGUgd29ya2Zsb3cgc2FuZGJveC4gYCArXG4gICAgICAgICAgYEFkZCBcInVzZSBzdGVwXCIgdG8gbWV0aG9kcyB0aGF0IGRlcGVuZCBvbiBOb2RlLmpzIEFQSXMgc28gdGhleSBhcmUgc3RyaXBwZWQgZnJvbSB0aGUgd29ya2Zsb3cgYnVuZGxlLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHJlZ2lzdHJhdGlvblxuICAgIGlmICghaGFzUmVnaXN0cmF0aW9uKSB7XG4gICAgICBpc3N1ZXMucHVzaChcbiAgICAgICAgYE5vIGNsYXNzIHJlZ2lzdHJhdGlvbiBJSUZFIHdhcyBnZW5lcmF0ZWQuIGAgK1xuICAgICAgICAgIGBFbnN1cmUgV09SS0ZMT1dfU0VSSUFMSVpFIGFuZCBXT1JLRkxPV19ERVNFUklBTElaRSBhcmUgZGVmaW5lZCBhcyBzdGF0aWMgbWV0aG9kcyBgICtcbiAgICAgICAgICBgaW5zaWRlIHRoZSBjbGFzcyBib2R5IHVzaW5nIGNvbXB1dGVkIHByb3BlcnR5IHN5bnRheDogc3RhdGljIFtXT1JLRkxPV19TRVJJQUxJWkVdKC4uLikgeyAuLi4gfWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNsYXNzTmFtZTogZW50cnkuY2xhc3NOYW1lLFxuICAgICAgY2xhc3NJZDogZW50cnkuY2xhc3NJZCxcbiAgICAgIGRldGVjdGVkOiB0cnVlLFxuICAgICAgcmVnaXN0ZXJlZDogaGFzUmVnaXN0cmF0aW9uLFxuICAgICAgbm9kZUltcG9ydHM6IGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgICAgY29tcGxpYW50OiBnbG9iYWxOb2RlSW1wb3J0cy5sZW5ndGggPT09IDAgJiYgaGFzUmVnaXN0cmF0aW9uLFxuICAgICAgaXNzdWVzLFxuICAgIH07XG4gIH0pO1xuXG4gIC8vIDUuIENoZWNrIGZvciBjbGFzc2VzIHRoYXQgaGF2ZSBzZXJkZSBwYXR0ZXJucyBpbiBzb3VyY2UgYnV0IHdlcmVuJ3QgZGV0ZWN0ZWQgYnkgU1dDXG4gIGNvbnN0IHNvdXJjZUhhc1NlcmRlUGF0dGVybnMgPVxuICAgIC9cXFtcXHMqV09SS0ZMT1dfKD86U0VSSUFMSVpFfERFU0VSSUFMSVpFKVxccypcXF0vLnRlc3Qoc291cmNlQ29kZSkgfHxcbiAgICAvU3ltYm9sXFwuZm9yXFxzKlxcKFxccypbJ1wiXXdvcmtmbG93LSg/OnNlcmlhbGl6ZXxkZXNlcmlhbGl6ZSlbJ1wiXVxccypcXCkvLnRlc3QoXG4gICAgICBzb3VyY2VDb2RlXG4gICAgKTtcblxuICBpZiAoc291cmNlSGFzU2VyZGVQYXR0ZXJucyAmJiBjbGFzc0VudHJpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgY2xhc3Nlcy5wdXNoKHtcbiAgICAgIGNsYXNzTmFtZTogJzx1bmtub3duPicsXG4gICAgICBjbGFzc0lkOiAnJyxcbiAgICAgIGRldGVjdGVkOiBmYWxzZSxcbiAgICAgIHJlZ2lzdGVyZWQ6IGZhbHNlLFxuICAgICAgbm9kZUltcG9ydHM6IGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgICAgY29tcGxpYW50OiBmYWxzZSxcbiAgICAgIGlzc3VlczogW1xuICAgICAgICBgU291cmNlIGNvZGUgY29udGFpbnMgV09SS0ZMT1dfU0VSSUFMSVpFL1dPUktGTE9XX0RFU0VSSUFMSVpFIHBhdHRlcm5zIGJ1dCBgICtcbiAgICAgICAgICBgdGhlIFNXQyBwbHVnaW4gZGlkIG5vdCBkZXRlY3QgYW55IHNlcmRlLWVuYWJsZWQgY2xhc3Nlcy4gYCArXG4gICAgICAgICAgYEVuc3VyZSB0aGUgc3ltYm9scyBhcmUgZGVmaW5lZCBhcyBzdGF0aWMgbWV0aG9kcyBJTlNJREUgdGhlIGNsYXNzIGJvZHksIGAgK1xuICAgICAgICAgIGBub3QgYXNzaWduZWQgZXh0ZXJuYWxseSAoZS5nLiwgKE15Q2xhc3MgYXMgYW55KVtXT1JLRkxPV19TRVJJQUxJWkVdID0gLi4uKS5gLFxuICAgICAgXSxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2xhc3NlcyxcbiAgICBnbG9iYWxOb2RlSW1wb3J0cyxcbiAgICBoYXNTZXJkZUNsYXNzZXMsXG4gICAgbWFuaWZlc3QsXG4gIH07XG59XG5cbi8qKlxuICogRXh0cmFjdCBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBuYW1lcyBmcm9tIHRyYW5zZm9ybWVkIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3ROb2RlSW1wb3J0cyhjb2RlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGltcG9ydHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgLy8gUmVzZXQgcmVnZXggc3RhdGVcbiAgbm9kZUltcG9ydEV4dHJhY3RSZWdleC5sYXN0SW5kZXggPSAwO1xuICBmb3IgKFxuICAgIGxldCBtYXRjaCA9IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXguZXhlYyhjb2RlKTtcbiAgICBtYXRjaCAhPT0gbnVsbDtcbiAgICBtYXRjaCA9IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXguZXhlYyhjb2RlKVxuICApIHtcbiAgICAvLyBtYXRjaFsxXSBpcyBmcm9tIHRoZSBFU00gcGF0dGVybiwgbWF0Y2hbMl0gaXMgZnJvbSB0aGUgQ0pTIHBhdHRlcm5cbiAgICBjb25zdCBtb2R1bGVOYW1lID0gbWF0Y2hbMV0gfHwgbWF0Y2hbMl07XG4gICAgaWYgKG1vZHVsZU5hbWUpIHtcbiAgICAgIC8vIE5vcm1hbGl6ZSB0byBiYXNlIG1vZHVsZSBuYW1lIChlLmcuLCAnZnMvcHJvbWlzZXMnIC0+ICdmcycpXG4gICAgICBpbXBvcnRzLmFkZChtb2R1bGVOYW1lLnNwbGl0KCcvJylbMF0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gWy4uLmltcG9ydHNdLnNvcnQoKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IGNsYXNzIGVudHJpZXMgZnJvbSBhIFdvcmtmbG93TWFuaWZlc3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0Q2xhc3NFbnRyaWVzKFxuICBtYW5pZmVzdDogV29ya2Zsb3dNYW5pZmVzdFxuKTogQXJyYXk8eyBjbGFzc05hbWU6IHN0cmluZzsgY2xhc3NJZDogc3RyaW5nOyBmaWxlTmFtZTogc3RyaW5nIH0+IHtcbiAgY29uc3QgZW50cmllczogQXJyYXk8e1xuICAgIGNsYXNzTmFtZTogc3RyaW5nO1xuICAgIGNsYXNzSWQ6IHN0cmluZztcbiAgICBmaWxlTmFtZTogc3RyaW5nO1xuICB9PiA9IFtdO1xuICBpZiAoIW1hbmlmZXN0LmNsYXNzZXMpIHJldHVybiBlbnRyaWVzO1xuXG4gIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjbGFzc2VzXSBvZiBPYmplY3QuZW50cmllcyhtYW5pZmVzdC5jbGFzc2VzKSkge1xuICAgIGZvciAoY29uc3QgW2NsYXNzTmFtZSwgeyBjbGFzc0lkIH1dIG9mIE9iamVjdC5lbnRyaWVzKGNsYXNzZXMpKSB7XG4gICAgICBlbnRyaWVzLnB1c2goeyBjbGFzc05hbWUsIGNsYXNzSWQsIGZpbGVOYW1lIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZW50cmllcztcbn1cbiIsICJpbXBvcnQge1xuICBDb3JydXB0ZWRFdmVudExvZ0Vycm9yLFxuICBFbnRpdHlDb25mbGljdEVycm9yLFxuICBQcmVjb25kaXRpb25GYWlsZWRFcnJvcixcbiAgUmVwbGF5RGl2ZXJnZW5jZUVycm9yLFxuICBSVU5fRVJST1JfQ09ERVMsXG4gIFJ1bkV4cGlyZWRFcnJvcixcbiAgV29ya2Zsb3dSdW50aW1lRXJyb3IsXG59IGZyb20gJ0B3b3JrZmxvdy9lcnJvcnMnO1xuaW1wb3J0IHsgc2V0V29ya2Zsb3dCYXNlUGF0aCB9IGZyb20gJ0B3b3JrZmxvdy91dGlscyc7XG5pbXBvcnQgeyBwYXJzZVdvcmtmbG93TmFtZSB9IGZyb20gJ0B3b3JrZmxvdy91dGlscy9wYXJzZS1uYW1lJztcbmltcG9ydCB7XG4gIHR5cGUgRXZlbnQsXG4gIGdldFF1ZXVlVG9waWNQcmVmaXgsXG4gIHJlc29sdmVRdWV1ZU5hbWVzcGFjZSxcbiAgU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gIFNQRUNfVkVSU0lPTl9MRUdBQ1ksXG4gIFdvcmtmbG93SW52b2tlUGF5bG9hZFNjaGVtYSxcbiAgdHlwZSBXb3JrZmxvd1J1bixcbn0gZnJvbSAnQHdvcmtmbG93L3dvcmxkJztcbmltcG9ydCB7XG4gIGNsYXNzaWZ5UnVuRXJyb3IsXG4gIGlzUmV0cnlhYmxlV29ybGRFcnJvcixcbiAgaXNXb3JsZENvbnRyYWN0RXJyb3IsXG59IGZyb20gJy4vY2xhc3NpZnktZXJyb3IuanMnO1xuaW1wb3J0IHsgaW1wb3J0S2V5IH0gZnJvbSAnLi9lbmNyeXB0aW9uLmpzJztcbmltcG9ydCB7IFdvcmtmbG93U3VzcGVuc2lvbiB9IGZyb20gJy4vZ2xvYmFsLmpzJztcbmltcG9ydCB7IHJ1bnRpbWVMb2dnZXIgfSBmcm9tICcuL2xvZ2dlci5qcyc7XG5pbXBvcnQge1xuICBNQVhfUVVFVUVfREVMSVZFUklFUyxcbiAgUkVQTEFZX0RJVkVSR0VOQ0VfTUFYX1JFVFJJRVMsXG4gIFJFUExBWV9USU1FT1VUX01BWF9SRVRSSUVTLFxuICBSRVBMQVlfVElNRU9VVF9NUyxcbn0gZnJvbSAnLi9ydW50aW1lL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQge1xuICBnZXRRdWV1ZU92ZXJoZWFkLFxuICBnZXRXb3JrZmxvd1F1ZXVlTmFtZSxcbiAgZ2V0V29ya2Zsb3dSdW5FdmVudHMsXG4gIGhhbmRsZUhlYWx0aENoZWNrTWVzc2FnZSxcbiAgdHlwZSBNdXRhYmxlRXZlbnRMb2csXG4gIHBhcnNlSGVhbHRoQ2hlY2tQYXlsb2FkLFxuICBxdWV1ZU1lc3NhZ2UsXG4gIHN0YXRlVXBkYXRlZEF0Rm9yQ3JlYXRlLFxuICB3aXRoSGVhbHRoQ2hlY2ssXG4gIHdpdGhQcmVjb25kaXRpb25SZXRyeSxcbn0gZnJvbSAnLi9ydW50aW1lL2hlbHBlcnMuanMnO1xuaW1wb3J0IHsgaGFuZGxlU3VzcGVuc2lvbiB9IGZyb20gJy4vcnVudGltZS9zdXNwZW5zaW9uLWhhbmRsZXIuanMnO1xuaW1wb3J0IHsgZ2V0V29ybGQsIGdldFdvcmxkSGFuZGxlcnMgfSBmcm9tICcuL3J1bnRpbWUvd29ybGQuanMnO1xuaW1wb3J0IHsgcmVtYXBFcnJvclN0YWNrIH0gZnJvbSAnLi9zb3VyY2UtbWFwLmpzJztcbmltcG9ydCAqIGFzIEF0dHJpYnV0ZSBmcm9tICcuL3RlbGVtZXRyeS9zZW1hbnRpYy1jb252ZW50aW9ucy5qcyc7XG5pbXBvcnQge1xuICBsaW5rVG9DdXJyZW50Q29udGV4dCxcbiAgdHJhY2UsXG4gIHdpdGhUcmFjZUNvbnRleHQsXG4gIHdpdGhXb3JrZmxvd0JhZ2dhZ2UsXG59IGZyb20gJy4vdGVsZW1ldHJ5LmpzJztcbmltcG9ydCB7IGdldEVycm9yTmFtZSwgZ2V0RXJyb3JTdGFjaywgbm9ybWFsaXplVW5rbm93bkVycm9yIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBidWlsZFdvcmtmbG93U3VzcGVuc2lvbk1lc3NhZ2UgfSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgcnVuV29ya2Zsb3cgfSBmcm9tICcuL3dvcmtmbG93LmpzJztcblxuZXhwb3J0IHR5cGUgeyBFdmVudCwgV29ya2Zsb3dSdW4gfTtcbmV4cG9ydCB7IFdvcmtmbG93U3VzcGVuc2lvbiB9IGZyb20gJy4vZ2xvYmFsLmpzJztcbmV4cG9ydCB7XG4gIHR5cGUgSGVhbHRoQ2hlY2tFbmRwb2ludCxcbiAgdHlwZSBIZWFsdGhDaGVja09wdGlvbnMsXG4gIHR5cGUgSGVhbHRoQ2hlY2tSZXN1bHQsXG4gIGhlYWx0aENoZWNrLFxufSBmcm9tICcuL3J1bnRpbWUvaGVscGVycy5qcyc7XG5leHBvcnQge1xuICBnZXRIb29rQnlUb2tlbixcbiAgcmVzdW1lSG9vayxcbiAgcmVzdW1lV2ViaG9vayxcbn0gZnJvbSAnLi9ydW50aW1lL3Jlc3VtZS1ob29rLmpzJztcbmV4cG9ydCB7XG4gIGdldFJ1bixcbiAgUnVuLFxuICB0eXBlIFdvcmtmbG93UmVhZGFibGVTdHJlYW0sXG4gIHR5cGUgV29ya2Zsb3dSZWFkYWJsZVN0cmVhbU9wdGlvbnMsXG59IGZyb20gJy4vcnVudGltZS9ydW4uanMnO1xuZXhwb3J0IHtcbiAgY2FuY2VsUnVuLFxuICBsaXN0U3RyZWFtcyxcbiAgdHlwZSBSZWFkU3RyZWFtT3B0aW9ucyxcbiAgdHlwZSBSZWNyZWF0ZVJ1bk9wdGlvbnMsXG4gIHJlYWRTdHJlYW0sXG4gIHJlY3JlYXRlUnVuRnJvbUV4aXN0aW5nLFxuICByZWVucXVldWVSdW4sXG4gIHR5cGUgU3RvcFNsZWVwT3B0aW9ucyxcbiAgdHlwZSBTdG9wU2xlZXBSZXN1bHQsXG4gIHdha2VVcFJ1bixcbn0gZnJvbSAnLi9ydW50aW1lL3J1bnMuanMnO1xuZXhwb3J0IHtcbiAgdHlwZSBTdGFydE9wdGlvbnMsXG4gIHR5cGUgU3RhcnRPcHRpb25zQmFzZSxcbiAgdHlwZSBTdGFydE9wdGlvbnNXaXRoRGVwbG95bWVudElkLFxuICB0eXBlIFN0YXJ0T3B0aW9uc1dpdGhvdXREZXBsb3ltZW50SWQsXG4gIHN0YXJ0LFxufSBmcm9tICcuL3J1bnRpbWUvc3RhcnQuanMnO1xuZXhwb3J0IHsgc3RlcEVudHJ5cG9pbnQgfSBmcm9tICcuL3J1bnRpbWUvc3RlcC1oYW5kbGVyLmpzJztcbmV4cG9ydCB7XG4gIGNyZWF0ZVdvcmxkLFxuICBnZXRXb3JsZCxcbiAgZ2V0V29ybGRIYW5kbGVycyxcbiAgc2V0V29ybGQsXG59IGZyb20gJy4vcnVudGltZS93b3JsZC5qcyc7XG5cbmZ1bmN0aW9uIGhhc1JlY29yZGVkVGVybWluYWxSdW5FdmVudChldmVudHM6IEV2ZW50W10sIHJ1bklkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgdGVybWluYWxFdmVudCA9IGV2ZW50cy5maW5kKFxuICAgIChldmVudCkgPT5cbiAgICAgIGV2ZW50LnJ1bklkID09PSBydW5JZCAmJlxuICAgICAgKGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9jb21wbGV0ZWQnIHx8XG4gICAgICAgIGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9mYWlsZWQnIHx8XG4gICAgICAgIGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9jYW5jZWxsZWQnKVxuICApO1xuXG4gIGlmICghdGVybWluYWxFdmVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAnV29ya2Zsb3cgZXZlbnQgbG9nIGFscmVhZHkgY29udGFpbnMgYSB0ZXJtaW5hbCBydW4gZXZlbnQsIHNraXBwaW5nIHJlcGxheScsXG4gICAge1xuICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICBldmVudFR5cGU6IHRlcm1pbmFsRXZlbnQuZXZlbnRUeXBlLFxuICAgICAgZXZlbnRJZDogdGVybWluYWxFdmVudC5ldmVudElkLFxuICAgIH1cbiAgKTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBjcmVhdGVzIGEgc2luZ2xlIHJvdXRlIHdoaWNoIGhhbmRsZXMgYW55IHdvcmtmbG93IGV4ZWN1dGlvblxuICogcmVxdWVzdCBhbmQgcm91dGVzIHRvIHRoZSBhcHByb3ByaWF0ZSB3b3JrZmxvdyBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gd29ya2Zsb3dDb2RlIC0gVGhlIHdvcmtmbG93IGJ1bmRsZSBjb2RlIGNvbnRhaW5pbmcgYWxsIHRoZSB3b3JrZmxvd1xuICogZnVuY3Rpb25zIGF0IHRoZSB0b3AgbGV2ZWwuXG4gKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgYXMgYSBWZXJjZWwgQVBJIHJvdXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd29ya2Zsb3dFbnRyeXBvaW50KFxuICB3b3JrZmxvd0NvZGU6IHN0cmluZyxcbiAgb3B0aW9ucz86IHsgbmFtZXNwYWNlPzogc3RyaW5nOyBiYXNlUGF0aD86IHN0cmluZyB9XG4pOiAocmVxOiBSZXF1ZXN0KSA9PiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIHNldFdvcmtmbG93QmFzZVBhdGgob3B0aW9ucz8uYmFzZVBhdGgpO1xuXG4gIGNvbnN0IG5hbWVzcGFjZSA9IHJlc29sdmVRdWV1ZU5hbWVzcGFjZShvcHRpb25zPy5uYW1lc3BhY2UpO1xuICBjb25zdCB3b3JrZmxvd1ByZWZpeCA9IGdldFF1ZXVlVG9waWNQcmVmaXgoJ3dvcmtmbG93JywgbmFtZXNwYWNlKTtcblxuICBjb25zdCB7IGNyZWF0ZVF1ZXVlSGFuZGxlciwgc3BlY1ZlcnNpb246IHdvcmxkU3BlY1ZlcnNpb24gfSA9XG4gICAgZ2V0V29ybGRIYW5kbGVycygpO1xuICBjb25zdCBoYW5kbGVyID0gY3JlYXRlUXVldWVIYW5kbGVyKFxuICAgIHdvcmtmbG93UHJlZml4LFxuICAgIGFzeW5jIChtZXNzYWdlXywgbWV0YWRhdGEpID0+IHtcbiAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYSBoZWFsdGggY2hlY2sgbWVzc2FnZVxuICAgICAgLy8gTk9URTogSGVhbHRoIGNoZWNrIG1lc3NhZ2VzIGFyZSBpbnRlbnRpb25hbGx5IHVuYXV0aGVudGljYXRlZCBmb3IgbW9uaXRvcmluZyBwdXJwb3Nlcy5cbiAgICAgIC8vIFRoZXkgb25seSB3cml0ZSBhIHNpbXBsZSBzdGF0dXMgcmVzcG9uc2UgdG8gYSBzdHJlYW0gYW5kIGRvIG5vdCBleHBvc2Ugc2Vuc2l0aXZlIGRhdGEuXG4gICAgICAvLyBUaGUgc3RyZWFtIG5hbWUgaW5jbHVkZXMgYSB1bmlxdWUgY29ycmVsYXRpb25JZCB0aGF0IG11c3QgYmUga25vd24gYnkgdGhlIGNhbGxlci5cbiAgICAgIGNvbnN0IGhlYWx0aENoZWNrID0gcGFyc2VIZWFsdGhDaGVja1BheWxvYWQobWVzc2FnZV8pO1xuICAgICAgaWYgKGhlYWx0aENoZWNrKSB7XG4gICAgICAgIGF3YWl0IGhhbmRsZUhlYWx0aENoZWNrTWVzc2FnZShcbiAgICAgICAgICBoZWFsdGhDaGVjayxcbiAgICAgICAgICAnd29ya2Zsb3cnLFxuICAgICAgICAgIHdvcmxkU3BlY1ZlcnNpb25cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7XG4gICAgICAgIHJ1bklkLFxuICAgICAgICB0cmFjZUNhcnJpZXI6IHRyYWNlQ29udGV4dCxcbiAgICAgICAgcmVxdWVzdGVkQXQsXG4gICAgICAgIHJlcGxheURpdmVyZ2VuY2UsXG4gICAgICAgIHJ1bklucHV0LFxuICAgICAgfSA9IFdvcmtmbG93SW52b2tlUGF5bG9hZFNjaGVtYS5wYXJzZShtZXNzYWdlXyk7XG4gICAgICBjb25zdCB7IHJlcXVlc3RJZCB9ID0gbWV0YWRhdGE7XG4gICAgICAvLyBFeHRyYWN0IHRoZSB3b3JrZmxvdyBuYW1lIGZyb20gdGhlIHRvcGljIG5hbWVcbiAgICAgIGNvbnN0IHdvcmtmbG93TmFtZSA9IG1ldGFkYXRhLnF1ZXVlTmFtZS5zbGljZSh3b3JrZmxvd1ByZWZpeC5sZW5ndGgpO1xuXG4gICAgICAvLyAtLS0gTWF4IGRlbGl2ZXJ5IGNoZWNrIC0tLVxuICAgICAgLy8gRW5mb3JjZSBtYXggZGVsaXZlcnkgbGltaXQgYmVmb3JlIGFueSBpbmZyYXN0cnVjdHVyZSBjYWxscy5cbiAgICAgIC8vIFRoaXMgcHJldmVudHMgcnVuYXdheSB3b3JrZmxvd3MgZnJvbSBjb25zdW1pbmcgaW5maW5pdGUgcXVldWUgZGVsaXZlcmllcy5cbiAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIHdlIHdhbnQgdG8gZG8gdGhlIG1pbmltYWwgYW1vdW50IG9mIHdvcmsgKG5vIGZldGNoaW5nXG4gICAgICAvLyBvZiB0aGUgd29ya2Zsb3cgZXZlbnRzLCBldGMuIFdlIHNpbXBseSBhdHRlbXB0IHRvIG1hcmsgdGhlIHJ1biBhcyBmYWlsZWRcbiAgICAgIC8vIGFuZCBpZiB0aGF0IGZhaWxzLCB0aGUgbWVzc2FnZSBpcyBzdGlsbCBjb25zdW1lZCBidXQgd2l0aCBhZGVxdWF0ZSBsb2dnaW5nXG4gICAgICAvLyB0aGF0IGFuIGVycm9yIG9jY3VycmVkIHByZXZlbnRpbmcgdXMgZnJvbSBmYWlsaW5nIHRoZSBydW4uXG4gICAgICBpZiAobWV0YWRhdGEuYXR0ZW1wdCA+IE1BWF9RVUVVRV9ERUxJVkVSSUVTKSB7XG4gICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgYFdvcmtmbG93IGhhbmRsZXIgZXhjZWVkZWQgbWF4IGRlbGl2ZXJpZXMgKCR7bWV0YWRhdGEuYXR0ZW1wdH0vJHtNQVhfUVVFVUVfREVMSVZFUklFU30pYCxcbiAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkLCB3b3JrZmxvd05hbWUsIGF0dGVtcHQ6IG1ldGFkYXRhLmF0dGVtcHQgfVxuICAgICAgICApO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHdvcmxkID0gZ2V0V29ybGQoKTtcbiAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgV29ya2Zsb3cgZXhjZWVkZWQgbWF4aW11bSBxdWV1ZSBkZWxpdmVyaWVzICgke21ldGFkYXRhLmF0dGVtcHR9LyR7TUFYX1FVRVVFX0RFTElWRVJJRVN9KWAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5NQVhfREVMSVZFUklFU19FWENFRURFRCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgaWYgKEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZXJyKSB8fCBSdW5FeHBpcmVkRXJyb3IuaXMoZXJyKSkge1xuICAgICAgICAgICAgLy8gUnVuIGFscmVhZHkgZmluaXNoZWQsIGNvbnN1bWUgdGhlIG1lc3NhZ2Ugc2lsZW50bHlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgIGBGYWlsZWQgdG8gbWFyayBydW4gYXMgZmFpbGVkIGFmdGVyICR7bWV0YWRhdGEuYXR0ZW1wdH0gZGVsaXZlcnkgYXR0ZW1wdHMuIGAgK1xuICAgICAgICAgICAgICBgQSBwZXJzaXN0ZW50IGVycm9yIGlzIHByZXZlbnRpbmcgdGhlIHJ1biBmcm9tIGJlaW5nIHRlcm1pbmF0ZWQuIGAgK1xuICAgICAgICAgICAgICBgVGhlIHJ1biB3aWxsIHJlbWFpbiBpbiBpdHMgY3VycmVudCBzdGF0ZSB1bnRpbCBtYW51YWxseSByZXNvbHZlZC4gYCArXG4gICAgICAgICAgICAgIGBUaGlzIGlzIG1vc3QgbGlrZWx5IGR1ZSB0byBhIHBlcnNpc3RlbnQgb3V0YWdlIG9mIHRoZSB3b3JrZmxvdyBiYWNrZW5kIGAgK1xuICAgICAgICAgICAgICBgb3IgYSBidWcgaW4gdGhlIHdvcmtmbG93IHJ1bnRpbWUgYW5kIHNob3VsZCBiZSByZXBvcnRlZCB0byB0aGUgV29ya2Zsb3cgdGVhbS5gLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgZXJyb3I6IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSxcbiAgICAgICAgICAgICAgYXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3BhbkxpbmtzID0gYXdhaXQgbGlua1RvQ3VycmVudENvbnRleHQoKTtcblxuICAgICAgLy8gLS0tIFJlcGxheSB0aW1lb3V0IGd1YXJkIC0tLVxuICAgICAgLy8gSWYgdGhlIHJlcGxheSB0YWtlcyBsb25nZXIgdGhhbiB0aGUgdGltZW91dCwgZmFpbCB0aGUgcnVuIGFuZCBleGl0LlxuICAgICAgLy8gVGhpcyBtdXN0IGJlIGxvd2VyIHRoYW4gdGhlIGZ1bmN0aW9uJ3MgbWF4RHVyYXRpb24gdG8gZW5zdXJlXG4gICAgICAvLyB0aGUgZmFpbHVyZSBpcyByZWNvcmRlZCBiZWZvcmUgdGhlIHBsYXRmb3JtIGtpbGxzIHRoZSBmdW5jdGlvbi5cbiAgICAgIGxldCByZXBsYXlUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IHVuZGVmaW5lZDtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5WRVJDRUxfVVJMICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVwbGF5VGltZW91dCA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoJ1dvcmtmbG93IHJlcGxheSBleGNlZWRlZCB0aW1lb3V0Jywge1xuICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICB0aW1lb3V0TXM6IFJFUExBWV9USU1FT1VUX01TLFxuICAgICAgICAgICAgYXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCxcbiAgICAgICAgICAgIG1heFJldHJpZXM6IFJFUExBWV9USU1FT1VUX01BWF9SRVRSSUVTLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gQWxsb3cgYSBmZXcgcmV0cmllcyBiZWZvcmUgcGVybWFuZW50bHkgZmFpbGluZyB0aGUgcnVuLlxuICAgICAgICAgIC8vIE9uIGVhcmx5IGF0dGVtcHRzLCBqdXN0IGV4aXQgc28gdGhlIHF1ZXVlIHJldHJpZXMgdGhlIG1lc3NhZ2UuXG4gICAgICAgICAgaWYgKG1ldGFkYXRhLmF0dGVtcHQgPD0gUkVQTEFZX1RJTUVPVVRfTUFYX1JFVFJJRVMpIHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgd29ybGQgPSBhd2FpdCBnZXRXb3JsZCgpO1xuICAgICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fZmFpbGVkJyxcbiAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgV29ya2Zsb3cgcmVwbGF5IGV4Y2VlZGVkIG1heGltdW0gZHVyYXRpb24gKCR7UkVQTEFZX1RJTUVPVVRfTVMgLyAxMDAwfXMpIGFmdGVyICR7bWV0YWRhdGEuYXR0ZW1wdH0gYXR0ZW1wdHNgLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLlJFUExBWV9USU1FT1VULFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBCZXN0IGVmZm9ydCDigJQgcHJvY2VzcyBleGl0cyByZWdhcmRsZXNzXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIGFsc28gcHJldmVudHMgdGhlIHJ1bnRpbWUgZnJvbSBhY2tpbmcgdGhlIHF1ZXVlIG1lc3NhZ2UsXG4gICAgICAgICAgLy8gc28gdGhlIHF1ZXVlIHdpbGwgY2FsbCBiYWNrIG9uY2UsIGFmdGVyIHdoaWNoIGEgNDEwIHdpbGwgZ2V0IGl0IHRvIGV4aXQgZWFybHkuXG4gICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9LCBSRVBMQVlfVElNRU9VVF9NUyk7XG4gICAgICAgIHJlcGxheVRpbWVvdXQudW5yZWYoKTtcbiAgICAgIH1cblxuICAgICAgLy8gSW52b2tlIHVzZXIgd29ya2Zsb3cgd2l0aGluIHRoZSBwcm9wYWdhdGVkIHRyYWNlIGNvbnRleHQgYW5kIGJhZ2dhZ2VcbiAgICAgIHJldHVybiBhd2FpdCB3aXRoVHJhY2VDb250ZXh0KHRyYWNlQ29udGV4dCwgYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBTZXQgd29ya2Zsb3cgY29udGV4dCBhcyBiYWdnYWdlIGZvciBhdXRvbWF0aWMgcHJvcGFnYXRpb25cbiAgICAgICAgcmV0dXJuIGF3YWl0IHdpdGhXb3JrZmxvd0JhZ2dhZ2UoXG4gICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCwgd29ya2Zsb3dOYW1lIH0sXG4gICAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgd29ybGQgPSBnZXRXb3JsZCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRyYWNlKFxuICAgICAgICAgICAgICBgV09SS0ZMT1cgJHt3b3JrZmxvd05hbWV9YCxcbiAgICAgICAgICAgICAgeyBsaW5rczogc3BhbkxpbmtzIH0sXG4gICAgICAgICAgICAgIGFzeW5jIChzcGFuKSA9PiB7XG4gICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dOYW1lKHdvcmtmbG93TmFtZSksXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dPcGVyYXRpb24oJ2V4ZWN1dGUnKSxcbiAgICAgICAgICAgICAgICAgIC8vIFN0YW5kYXJkIE9URUwgbWVzc2FnaW5nIGNvbnZlbnRpb25zXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuTWVzc2FnaW5nU3lzdGVtKCd2ZXJjZWwtcXVldWUnKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5NZXNzYWdpbmdEZXN0aW5hdGlvbk5hbWUobWV0YWRhdGEucXVldWVOYW1lKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5NZXNzYWdpbmdNZXNzYWdlSWQobWV0YWRhdGEubWVzc2FnZUlkKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5NZXNzYWdpbmdPcGVyYXRpb25UeXBlKCdwcm9jZXNzJyksXG4gICAgICAgICAgICAgICAgICAuLi5nZXRRdWV1ZU92ZXJoZWFkKHsgcmVxdWVzdGVkQXQgfSksXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiB2YWxpZGF0ZSBgd29ya2Zsb3dOYW1lYCBleGlzdHMgYmVmb3JlIGNvbnN1bWluZyBtZXNzYWdlP1xuXG4gICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5JZChydW5JZCksXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dUcmFjZVByb3BhZ2F0ZWQoISF0cmFjZUNvbnRleHQpLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbGV0IHdvcmtmbG93U3RhcnRlZEF0ID0gLTE7XG4gICAgICAgICAgICAgICAgbGV0IHdvcmtmbG93UnVuOiBXb3JrZmxvd1J1biB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAvLyBQcmUtbG9hZGVkIGV2ZW50cyBmcm9tIHRoZSBydW5fc3RhcnRlZCByZXNwb25zZS5cbiAgICAgICAgICAgICAgICAvLyBXaGVuIHByZXNlbnQsIHdlIHNraXAgdGhlIGV2ZW50cy5saXN0IGNhbGwuXG4gICAgICAgICAgICAgICAgbGV0IHByZWxvYWRlZEV2ZW50czogRXZlbnRbXSB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBsZXQgcHJlbG9hZGVkRXZlbnRzQ3Vyc29yOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgLy8gLS0tIEluZnJhc3RydWN0dXJlOiBwcmVwYXJlIHRoZSBydW4gc3RhdGUgLS0tXG4gICAgICAgICAgICAgICAgLy8gQWx3YXlzIGNhbGwgcnVuX3N0YXJ0ZWQgZGlyZWN0bHkg4oCUIHRoaXMgYm90aCB0cmFuc2l0aW9uc1xuICAgICAgICAgICAgICAgIC8vIHRoZSBydW4gdG8gJ3J1bm5pbmcnIEFORCByZXR1cm5zIHRoZSBydW4gZW50aXR5LCBzYXZpbmdcbiAgICAgICAgICAgICAgICAvLyBhIHNlcGFyYXRlIHJ1bnMuZ2V0IHJvdW5kLXRyaXAuXG4gICAgICAgICAgICAgICAgLy8gQ29udHJhY3Q6IGV2ZW50cy5jcmVhdGUoJ3J1bl9zdGFydGVkJykgbXVzdCBiZSBpZGVtcG90ZW50XG4gICAgICAgICAgICAgICAgLy8gZm9yIHJ1bnMgYWxyZWFkeSBpbiAncnVubmluZycgc3RhdHVzIChyZXR1cm4gdGhlIHJ1blxuICAgICAgICAgICAgICAgIC8vIHdpdGhvdXQgZXJyb3IpLCBub3QganVzdCBmb3IgcGVuZGluZyDihpIgcnVubmluZyB0cmFuc2l0aW9ucy5cbiAgICAgICAgICAgICAgICAvLyBOZXR3b3JrL3NlcnZlciBlcnJvcnMgcHJvcGFnYXRlIHRvIHRoZSBxdWV1ZSBoYW5kbGVyIGZvciByZXRyeS5cbiAgICAgICAgICAgICAgICAvLyBXb3JrZmxvd1J1bnRpbWVFcnJvciAoZGF0YSBpbnRlZ3JpdHkgaXNzdWVzKSBhcmUgZmF0YWwgYW5kXG4gICAgICAgICAgICAgICAgLy8gcHJvZHVjZSBydW5fZmFpbGVkIHNpbmNlIHJldHJ5aW5nIHdvbid0IGZpeCB0aGVtLlxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9zdGFydGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBVc2UgdGhlIHNwZWMgdmVyc2lvbiBmcm9tIHRoZSBvcmlnaW5hbCBzdGFydCgpIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAvLyB3aGVuIGF2YWlsYWJsZSwgc28gdGhlIHJlc2lsaWVudCBzdGFydCBwYXRoIGNyZWF0ZXNcbiAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgcnVuIHdpdGggdGhlIGNvcnJlY3QgdmVyc2lvbiAobm90IGFsd2F5cyBjdXJyZW50KS5cbiAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bklucHV0Py5zcGVjVmVyc2lvbiA/PyBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBQYXNzIHJ1biBpbnB1dCBmcm9tIHF1ZXVlIHNvIHRoZSBzZXJ2ZXIgY2FuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBydW4gaWYgcnVuX2NyZWF0ZWQgd2FzIG1pc3NlZC5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBVaW50OEFycmF5IHZhbHVlcyBzdXJ2aXZlIHRoZSBxdWV1ZSBuYXRpdmVseVxuICAgICAgICAgICAgICAgICAgICAgIC8vIChDQk9SIG9uIHdvcmxkLXZlcmNlbCwgSlNPTiByZXZpdmVyIG9uIHdvcmxkLWxvY2FsKS5cbiAgICAgICAgICAgICAgICAgICAgICAuLi4ocnVuSW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IHJ1bklucHV0LmlucHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95bWVudElkOiBydW5JbnB1dC5kZXBsb3ltZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd05hbWU6IHJ1bklucHV0LndvcmtmbG93TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWN1dGlvbkNvbnRleHQ6IHJ1bklucHV0LmV4ZWN1dGlvbkNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB7fSksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5ydW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgIGBFdmVudCBjcmVhdGlvbiBmb3IgJ3J1bl9zdGFydGVkJyBkaWQgbm90IHJldHVybiB0aGUgcnVuIGVudGl0eSBmb3IgcnVuIFwiJHtydW5JZH1cImBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuID0gcmVzdWx0LnJ1bjtcblxuICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJlc3BvbnNlIGluY2x1ZGVzIGV2ZW50cywgdXNlIHRoZW0gdG8gc2tpcFxuICAgICAgICAgICAgICAgICAgLy8gdGhlIGluaXRpYWwgZXZlbnRzLmxpc3QgY2FsbCBhbmQgcmVkdWNlIFRURkIuXG4gICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ldmVudHMgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmV2ZW50cy5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5oYXNNb3JlICE9PSB0cnVlXG4gICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZGVkRXZlbnRzID0gcmVzdWx0LmV2ZW50cztcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZGVkRXZlbnRzQ3Vyc29yID0gcmVzdWx0LmN1cnNvcjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYgKCF3b3JrZmxvd1J1bi5zdGFydGVkQXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgIGBXb3JrZmxvdyBydW4gXCIke3J1bklkfVwiIGhhcyBubyBcInN0YXJ0ZWRBdFwiIHRpbWVzdGFtcGBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFJ1biB3YXMgY29uY3VycmVudGx5IGNvbXBsZXRlZC9mYWlsZWQvY2FuY2VsbGVkXG4gICAgICAgICAgICAgICAgICBpZiAoRW50aXR5Q29uZmxpY3RFcnJvci5pcyhlcnIpIHx8IFJ1bkV4cGlyZWRFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEVudGl0eUNvbmZsaWN0RXJyb3I6IHJ1biB3YXMgY29uY3VycmVudGx5XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbXBsZXRlZC9mYWlsZWQvY2FuY2VsbGVkIGR1cmluZyBzZXR1cC5cbiAgICAgICAgICAgICAgICAgICAgLy8gUnVuRXhwaXJlZEVycm9yOiBydW4gYWxyZWFkeSBpbiB0ZXJtaW5hbCBzdGF0ZS5cbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gYm90aCBjYXNlcywgc2tpcCBwcm9jZXNzaW5nIHRoaXMgbWVzc2FnZS5cbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICdSdW4gYWxyZWFkeSBmaW5pc2hlZCBkdXJpbmcgc2V0dXAsIHNraXBwaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkLCBtZXNzYWdlOiBlcnIubWVzc2FnZSB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyIGluc3RhbmNlb2YgV29ya2Zsb3dSdW50aW1lRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgcnVudGltZSBlcnJvciBkdXJpbmcgd29ya2Zsb3cgc2V0dXAnLFxuICAgICAgICAgICAgICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQsIGVycm9yOiBlcnIubWVzc2FnZSB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fZmFpbGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogZXJyLnN0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuUlVOVElNRV9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZmFpbEVycikge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZmFpbEVycikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJ1bkV4cGlyZWRFcnJvci5pcyhmYWlsRXJyKVxuICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZmFpbEVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSByZWNvcmRpbmcgd29ya2Zsb3cgZmFpbHVyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxFcnIgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZhaWxFcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhmYWlsRXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZmFpbEVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzV29ybGRDb250cmFjdEVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgd29ybGQgY29udHJhY3QgZXJyb3IgZHVyaW5nIHdvcmtmbG93IHNldHVwJyxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZmFpbEVycikge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZmFpbEVycikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJ1bkV4cGlyZWRFcnJvci5pcyhmYWlsRXJyKVxuICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZmFpbEVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSByZWNvcmRpbmcgd29ya2Zsb3cgZmFpbHVyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxFcnIgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZhaWxFcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhmYWlsRXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZmFpbEVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd29ya2Zsb3dTdGFydGVkQXQgPSArd29ya2Zsb3dSdW4uc3RhcnRlZEF0O1xuXG4gICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5TdGF0dXMod29ya2Zsb3dSdW4uc3RhdHVzKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1N0YXJ0ZWRBdCh3b3JrZmxvd1N0YXJ0ZWRBdCksXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAod29ya2Zsb3dSdW4uc3RhdHVzICE9PSAncnVubmluZycpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFdvcmtmbG93IGhhcyBhbHJlYWR5IGNvbXBsZXRlZCBvciBmYWlsZWQsIHNvIHdlIGNhbiBza2lwIGl0XG4gICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICdXb3JrZmxvdyBhbHJlYWR5IGNvbXBsZXRlZCBvciBmYWlsZWQsIHNraXBwaW5nJyxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogd29ya2Zsb3dSdW4uc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAvLyBUT0RPOiBmb3IgYGNhbmNlbGAsIHdlIGFjdHVhbGx5IHdhbnQgdG8gcHJvcGFnYXRlIGEgV29ya2Zsb3dDYW5jZWxsZWQgZXZlbnRcbiAgICAgICAgICAgICAgICAgIC8vIGluc2lkZSB0aGUgd29ya2Zsb3cgY29udGV4dCBzbyB0aGUgdXNlciBjYW4gZ3JhY2VmdWxseSBleGl0LiB0aGlzIGlzIFNJR1RFUk1cbiAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGZ1cnRoZXJtb3JlLCB0aGVyZSBzaG91bGQgYmUgYSB0aW1lb3V0IG9yIGEgd2F5IHRvIGZvcmNlIGNhbmNlbCBTSUdLSUxMXG4gICAgICAgICAgICAgICAgICAvLyBzbyB0aGF0IHdlIGFjdHVhbGx5IGV4aXQgaGVyZSB3aXRob3V0IHJlcGxheWluZyB0aGUgd29ya2Zsb3cgYXQgYWxsLCBpbiB0aGUgY2FzZVxuICAgICAgICAgICAgICAgICAgLy8gdGhlIHJlcGxheWluZyB0aGUgd29ya2Zsb3cgaXMgaXRzZWxmIGZhaWxpbmcuXG5cbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBMb2FkIGFsbCBldmVudHMgaW50byBtZW1vcnkgYmVmb3JlIHJ1bm5pbmcuXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgZ290IHByZS1sb2FkZWQgZXZlbnRzIGZyb20gdGhlIHJ1bl9zdGFydGVkIHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIC8vIHNraXAgdGhlIGV2ZW50cy5saXN0IHJvdW5kLXRyaXAgdG8gcmVkdWNlIFRURkIuXG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50czogRXZlbnRbXTtcbiAgICAgICAgICAgICAgICBsZXQgZXZlbnRzQ3Vyc29yOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBpZiAocHJlbG9hZGVkRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cyA9IHByZWxvYWRlZEV2ZW50cztcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzQ3Vyc29yID0gcHJlbG9hZGVkRXZlbnRzQ3Vyc29yO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVkRXZlbnRzID0gYXdhaXQgZ2V0V29ya2Zsb3dSdW5FdmVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWRcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzID0gbG9hZGVkRXZlbnRzLmV2ZW50cztcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzQ3Vyc29yID0gbG9hZGVkRXZlbnRzLmN1cnNvcjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIGxvYWRpbmcgd29ya2Zsb3cgZXZlbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZmFpbEVycikge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZmFpbEVycikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJ1bkV4cGlyZWRFcnJvci5pcyhmYWlsRXJyKVxuICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZmFpbEVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSByZWNvcmRpbmcgd29ya2Zsb3cgZmFpbHVyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxFcnIgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZhaWxFcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhmYWlsRXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZmFpbEVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVGhlIG1hdGVyaWFsaXplZCBydW4gcmV0dXJuZWQgYnkgcnVuX3N0YXJ0ZWQgY2FuIHJhY2UgYVxuICAgICAgICAgICAgICAgIC8vIHRlcm1pbmFsIGV2ZW50IGluIHRoZSBsb2FkZWQgc25hcHNob3QuIERvIG5vdCByZXBsYXkgYSBydW5cbiAgICAgICAgICAgICAgICAvLyB3aG9zZSBldmVudCBsb2cgYWxyZWFkeSBlc3RhYmxpc2hlcyBpdHMgdGVybWluYWwgb3V0Y29tZS5cbiAgICAgICAgICAgICAgICBpZiAoaGFzUmVjb3JkZWRUZXJtaW5hbFJ1bkV2ZW50KGV2ZW50cywgcnVuSWQpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGFueSBlbGFwc2VkIHdhaXRzIGFuZCBjcmVhdGUgd2FpdF9jb21wbGV0ZWQgZXZlbnRzXG4gICAgICAgICAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblxuICAgICAgICAgICAgICAgIC8vIFByZS1jb21wdXRlIGNvbXBsZXRlZCBjb3JyZWxhdGlvbiBJRHMgZm9yIE8obikgbG9va3VwIGluc3RlYWQgb2YgTyhuwrIpXG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGxldGVkV2FpdElkcyA9IG5ldyBTZXQoXG4gICAgICAgICAgICAgICAgICBldmVudHNcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZSkgPT4gZS5ldmVudFR5cGUgPT09ICd3YWl0X2NvbXBsZXRlZCcpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGUpID0+IGUuY29ycmVsYXRpb25JZClcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gQ29sbGVjdCBhbGwgd2FpdHMgdGhhdCBuZWVkIGNvbXBsZXRpb25cbiAgICAgICAgICAgICAgICBjb25zdCB3YWl0c1RvQ29tcGxldGUgPSBldmVudHNcbiAgICAgICAgICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICBlXG4gICAgICAgICAgICAgICAgICAgICk6IGUgaXMgRXh0cmFjdDxFdmVudCwgeyBldmVudFR5cGU6ICd3YWl0X2NyZWF0ZWQnIH0+ICYge1xuICAgICAgICAgICAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQ6IHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgfSA9PlxuICAgICAgICAgICAgICAgICAgICAgIGUuZXZlbnRUeXBlID09PSAnd2FpdF9jcmVhdGVkJyAmJlxuICAgICAgICAgICAgICAgICAgICAgIGUuY29ycmVsYXRpb25JZCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgIWNvbXBsZXRlZFdhaXRJZHMuaGFzKGUuY29ycmVsYXRpb25JZCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICBub3cgPj0gKGUuZXZlbnREYXRhLnJlc3VtZUF0IGFzIERhdGUpLmdldFRpbWUoKVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgLm1hcCgoZSkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAnd2FpdF9jb21wbGV0ZWQnIGFzIGNvbnN0LFxuICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQ6IGUuY29ycmVsYXRpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdW1lQXQ6IGUuZXZlbnREYXRhLnJlc3VtZUF0LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFsbCB3YWl0X2NvbXBsZXRlZCBldmVudHNcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHdhaXRFdmVudCBvZiB3YWl0c1RvQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHdhaXRMb2c6IE11dGFibGVFdmVudExvZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6IGV2ZW50c0N1cnNvciA/PyBudWxsLFxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHdpdGhQcmVjb25kaXRpb25SZXRyeShcbiAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICB3YWl0TG9nLFxuICAgICAgICAgICAgICAgICAgICAgIChzdGF0ZVVwZGF0ZWRBdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmxkLmV2ZW50cy5jcmVhdGUocnVuSWQsIHdhaXRFdmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlVXBkYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoRW50aXR5Q29uZmxpY3RFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKCdXYWl0IGFscmVhZHkgY29tcGxldGVkLCBza2lwcGluZycsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29ycmVsYXRpb25JZDogd2FpdEV2ZW50LmNvcnJlbGF0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVsb2FkcyBpbnNpZGUgdGhlIGd1YXJkIG1heSBoYXZlIGFkdmFuY2VkIHRoZSBjdXJzb3IuXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50c0N1cnNvciA9IHdhaXRMb2cuY3Vyc29yO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh3YWl0c1RvQ29tcGxldGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhlIGV2ZW50IGxpc3QgYWJvdmUgbWF5IGJlIHN0YWxlIGJ5IHRoZSB0aW1lIGFuIGVsYXBzZWRcbiAgICAgICAgICAgICAgICAgIC8vIHdhaXQgaXMgY29tbWl0dGVkLiBMb2FkIG9ubHkgZXZlbnRzIGFmdGVyIHRoZSBvcmlnaW5hbFxuICAgICAgICAgICAgICAgICAgLy8gc25hcHNob3QgY3Vyc29yIHNvIGNvbmN1cnJlbnQgZHVyYWJsZSBldmVudHMsIHN1Y2ggYXNcbiAgICAgICAgICAgICAgICAgIC8vIGhvb2tfcmVjZWl2ZWQsIGtlZXAgdGhlaXIgb3JkZXJpbmcgcmVsYXRpdmUgdG9cbiAgICAgICAgICAgICAgICAgIC8vIHdhaXRfY29tcGxldGVkLiBGYWxsIGJhY2sgdG8gYSBmdWxsIHJlbG9hZCBmb3Igb2xkZXIgd29ybGRzXG4gICAgICAgICAgICAgICAgICAvLyB0aGF0IGNhbm5vdCBnaXZlIHVzIGEgc3RhYmxlIGN1cnNvci5cbiAgICAgICAgICAgICAgICAgIGlmIChldmVudHNDdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RXZlbnRzID0gYXdhaXQgZ2V0V29ya2Zsb3dSdW5FdmVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnRzQ3Vyc29yXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRlZFdhaXRJZHNBZnRlckN1cnNvciA9IG5ldyBTZXQoXG4gICAgICAgICAgICAgICAgICAgICAgbmV3RXZlbnRzLmV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZSkgPT4gZS5ldmVudFR5cGUgPT09ICd3YWl0X2NvbXBsZXRlZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKChlKSA9PiBlLmNvcnJlbGF0aW9uSWQpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhd0FsbFdhaXRDb21wbGV0aW9ucyA9IHdhaXRzVG9Db21wbGV0ZS5ldmVyeShcbiAgICAgICAgICAgICAgICAgICAgICAod2FpdEV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkV2FpdElkc0FmdGVyQ3Vyc29yLmhhcyh3YWl0RXZlbnQuY29ycmVsYXRpb25JZClcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2F3QWxsV2FpdENvbXBsZXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdJZHMgPSBuZXcgU2V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLm1hcCgoZXZlbnQpID0+IGV2ZW50LmV2ZW50SWQpXG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIG5ld0V2ZW50cy5ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RpbmdJZHMuaGFzKGV2ZW50LmV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nSWRzLmFkZChldmVudC5ldmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRFdmVudHMgPSBhd2FpdCBnZXRXb3JrZmxvd1J1bkV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuLnJ1bklkXG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudHMgPSBsb2FkZWRFdmVudHMuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRFdmVudHMgPSBhd2FpdCBnZXRXb3JrZmxvd1J1bkV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBldmVudHMgPSBsb2FkZWRFdmVudHMuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBBIGNvbmN1cnJlbnQgdGVybWluYWwgd3JpdGUgbWF5IGhhdmUgbGFuZGVkIHdoaWxlXG4gICAgICAgICAgICAgICAgICAvLyBjb21taXR0aW5nIGFuIGVsYXBzZWQgd2FpdCBhbmQgcmVmcmVzaGluZyB0aGUgc25hcHNob3QuXG4gICAgICAgICAgICAgICAgICBpZiAoaGFzUmVjb3JkZWRUZXJtaW5hbFJ1bkV2ZW50KGV2ZW50cywgcnVuSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBSZXNvbHZlIHRoZSBlbmNyeXB0aW9uIGtleSBmb3IgdGhpcyBydW4ncyBkZXBsb3ltZW50XG4gICAgICAgICAgICAgICAgY29uc3QgcmF3S2V5ID1cbiAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmdldEVuY3J5cHRpb25LZXlGb3JSdW4/Lih3b3JrZmxvd1J1bik7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5jcnlwdGlvbktleSA9IHJhd0tleVxuICAgICAgICAgICAgICAgICAgPyBhd2FpdCBpbXBvcnRLZXkocmF3S2V5KVxuICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAvLyAtLS0gVXNlciBjb2RlIGV4ZWN1dGlvbiAtLS1cbiAgICAgICAgICAgICAgICAvLyBPbmx5IGVycm9ycyBmcm9tIHJ1bldvcmtmbG93KCkgKHVzZXIgd29ya2Zsb3cgY29kZSkgc2hvdWxkXG4gICAgICAgICAgICAgICAgLy8gcHJvZHVjZSBydW5fZmFpbGVkLiBJbmZyYXN0cnVjdHVyZSBlcnJvcnMgKG5ldHdvcmssIHNlcnZlcilcbiAgICAgICAgICAgICAgICAvLyBtdXN0IHByb3BhZ2F0ZSB0byB0aGUgcXVldWUgaGFuZGxlciBmb3IgYXV0b21hdGljIHJldHJ5LlxuICAgICAgICAgICAgICAgIGxldCB3b3JrZmxvd1Jlc3VsdDogdW5rbm93bjtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSZXN1bHQgPSBhd2FpdCB0cmFjZShcbiAgICAgICAgICAgICAgICAgICAgJ3dvcmtmbG93LnJlcGxheScsXG4gICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICBhc3luYyAocmVwbGF5U3BhbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJlcGxheVNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXZlbnRzQ291bnQoZXZlbnRzLmxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHJ1bldvcmtmbG93KFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dDb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNyeXB0aW9uS2V5XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFdvcmtmbG93U3VzcGVuc2lvbiBpcyBub3JtYWwgY29udHJvbCBmbG93IOKAlCBub3QgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICAgIGlmIChXb3JrZmxvd1N1c3BlbnNpb24uaXMoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdXNwZW5zaW9uTWVzc2FnZSA9IGJ1aWxkV29ya2Zsb3dTdXNwZW5zaW9uTWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICBlcnIuc3RlcENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgIGVyci5ob29rQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgZXJyLndhaXRDb3VudFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3VzcGVuc2lvbk1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmRlYnVnKHN1c3BlbnNpb25NZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVhY2ggZXZlbnQgY3JlYXRpb24gaW5zaWRlIGhhbmRsZVN1c3BlbnNpb24gY2FycmllcyB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gbG9hZGVkIHNuYXBzaG90J3MgYHN0YXRlVXBkYXRlZEF0YDsgb24gYSBzdGFsZSAoNDEyKVxuICAgICAgICAgICAgICAgICAgICAvLyByZWplY3Rpb24gdGhlIGd1YXJkIHJlbG9hZHMgdGhpcyBsb2cgaW4gcGxhY2UgYW5kIHJldHJpZXMuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1c3BlbnNpb25Mb2c6IE11dGFibGVFdmVudExvZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiBldmVudHNDdXJzb3IgPz8gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdDogQXdhaXRlZDxSZXR1cm5UeXBlPHR5cGVvZiBoYW5kbGVTdXNwZW5zaW9uPj47XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgaGFuZGxlU3VzcGVuc2lvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdXNwZW5zaW9uOiBlcnIsXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bjogd29ya2Zsb3dSdW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRMb2c6IHN1c3BlbnNpb25Mb2csXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHN1c3BlbnNpb25FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBndWFyZCBleGhhdXN0ZWQgaXRzIHJlbG9hZHMgb24gYSBzdGFsZSBldmVudFxuICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0aW9uLiBTY2hlZHVsZSBhbiBleHBsaWNpdCBpbW1lZGlhdGUgcmUtaW52b2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgIC8vIChhIHJldGhyb3cgcmVsaWVzIG9uIHF1ZXVlIHJlZGVsaXZlcnkpIHNvIGEgZnJlc2hcbiAgICAgICAgICAgICAgICAgICAgICAvLyByZXBsYXkgb2JzZXJ2ZXMgdGhlIG5ld2VyIGV2ZW50LlxuICAgICAgICAgICAgICAgICAgICAgIGlmIChQcmVjb25kaXRpb25GYWlsZWRFcnJvci5pcyhzdXNwZW5zaW9uRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdTdXNwZW5zaW9uIGV2ZW50IGNyZWF0aW9uIGV4aGF1c3RlZCBwcmVjb25kaXRpb24gcmV0cmllczsgcmUtaW52b2tpbmcgd2l0aCBhIGZyZXNoIHJlcGxheScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRpbWVvdXRTZWNvbmRzOiAwIH07XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHRocm93IHN1c3BlbnNpb25FcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQudGltZW91dFNlY29uZHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRpbWVvdXRTZWNvbmRzOiByZXN1bHQudGltZW91dFNlY29uZHMgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFN1c3BlbnNpb24gaGFuZGxlZCwgbm8gZnVydGhlciB3b3JrIG5lZWRlZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIFRyYW5zaWVudCBpbmZyYXN0cnVjdHVyZSBmYWlsdXJlcyB0YWxraW5nIHRvIHRoZVxuICAgICAgICAgICAgICAgICAgLy8gd29ybGQgKHdvcmtmbG93LXNlcnZlcikg4oCUIGFuIGV4aGF1c3RlZCBSZXRyeUFnZW50XG4gICAgICAgICAgICAgICAgICAvLyAoVU5EX0VSUl9SRVFfUkVUUlkgZnJvbSBhIHN1c3RhaW5lZCA0MjkvNTAzIHN0b3JtKSxcbiAgICAgICAgICAgICAgICAgIC8vIGEgZHJvcHBlZCBzb2NrZXQsIGEgY29ubmVjdC9ETlMgZmFpbHVyZSwgb3IgYSBjbGllbnRcbiAgICAgICAgICAgICAgICAgIC8vIHRpbWVvdXQg4oCUIG11c3QgTk9UIGZhaWwgdGhlIHJ1bi4gUmV0aHJvdyBzbyB0aGUgcXVldWVcbiAgICAgICAgICAgICAgICAgIC8vIHJlZGVsaXZlcnMgYW5kIGEgZnJlc2ggaW52b2NhdGlvbiByZXRyaWVzIHRoZSByZXBsYXlcbiAgICAgICAgICAgICAgICAgIC8vIG9uY2UgdGhlIGJhY2tlbmQgcmVjb3ZlcnMuIFRoZSBAdmVyY2VsL3F1ZXVlIGhhbmRsZXJcbiAgICAgICAgICAgICAgICAgIC8vIGFwcGxpZXMgYSBmYXN0ICgxc+KGkjYwcykgYmFja29mZiBieSBkZWxpdmVyeSBjb3VudCxcbiAgICAgICAgICAgICAgICAgIC8vIGF2b2lkaW5nIHRoZSB+NW1pbiBkZWZhdWx0IHZpc2liaWxpdHktdGltZW91dCByZWRyaXZlXG4gICAgICAgICAgICAgICAgICAvLyAoYW5kIG5ldmVyIGtpbGxpbmcgdGhlIHByb2Nlc3MgdmlhIHJ1bl9mYWlsZWQpLlxuICAgICAgICAgICAgICAgICAgaWYgKGlzUmV0cnlhYmxlV29ybGRFcnJvcihlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAnVHJhbnNpZW50IHdvcmxkIGVycm9yIGR1cmluZyByZXBsYXk7IHJlZGVsaXZlcmluZyB2aWEgcXVldWUgaW5zdGVhZCBvZiBmYWlsaW5nIHRoZSBydW4nLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTmFtZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubmFtZSA6ICdVbmtub3duRXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVyciksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxpdmVyeUF0dGVtcHQ6IG1ldGFkYXRhLmF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGxldCB0ZXJtaW5hbEVycm9yID0gZXJyO1xuICAgICAgICAgICAgICAgICAgaWYgKFJlcGxheURpdmVyZ2VuY2VFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpdmVyZ2VuY2VDb3VudCA9IChyZXBsYXlEaXZlcmdlbmNlPy5jb3VudCA/PyAwKSArIDE7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpdmVyZ2VuY2VDb3VudCA8PSBSRVBMQVlfRElWRVJHRU5DRV9NQVhfUkVUUklFUykge1xuICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICdXb3JrZmxvdyByZXBsYXkgZGl2ZXJnZWQ7IHF1ZXVlaW5nIGEgcmVjb3ZlcnkgcmVwbGF5IGJlZm9yZSBkZWNsYXJpbmcgdGhlIGV2ZW50IGxvZyBjb3JydXB0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuUkVQTEFZX0RJVkVSR0VOQ0UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpdmVyZ2VuY2VFdmVudElkOiBlcnIuZXZlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpb3JEaXZlcmdlbmNlRXZlbnRJZDogcmVwbGF5RGl2ZXJnZW5jZT8uZXZlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGl2ZXJnZW5jZUNvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxpdmVyeUF0dGVtcHQ6IG1ldGFkYXRhLmF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1heFJlY292ZXJ5UmVwbGF5czogUkVQTEFZX0RJVkVSR0VOQ0VfTUFYX1JFVFJJRVMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBxdWV1ZU1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFdvcmtmbG93UXVldWVOYW1lKHdvcmtmbG93TmFtZSwgbmFtZXNwYWNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRyYWNlQ2FycmllcjogdHJhY2VDb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGF5RGl2ZXJnZW5jZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50SWQ6IGVyci5ldmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiBkaXZlcmdlbmNlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3ltZW50SWQ6IHdvcmtmbG93UnVuLmRlcGxveW1lbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4uc3BlY1ZlcnNpb24gPz8gU1BFQ19WRVJTSU9OX0xFR0FDWSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRlcm1pbmFsRXJyb3IgPSBuZXcgQ29ycnVwdGVkRXZlbnRMb2dFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgV29ya2Zsb3cgcmVwbGF5IGRpdmVyZ2VkICR7ZGl2ZXJnZW5jZUNvdW50fSB0aW1lcyBhZnRlciAke1JFUExBWV9ESVZFUkdFTkNFX01BWF9SRVRSSUVTfSByZWNvdmVyeSByZXBsYXlzOyBsYXRlc3QgZGl2ZXJnZW50IGV2ZW50IHdhcyAke2Vyci5ldmVudElkfS4gTGFzdCBkaXZlcmdlbmNlOiAke2Vyci5tZXNzYWdlfWAsXG4gICAgICAgICAgICAgICAgICAgICAgeyBjYXVzZTogZXJyIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIHVzZXIgY29kZSBlcnJvciBvciBhIHRlcm1pbmFsXG4gICAgICAgICAgICAgICAgICAvLyBXb3JrZmxvd1J1bnRpbWVFcnJvci4gRmFpbCB0aGUgd29ya2Zsb3cgcnVuLlxuXG4gICAgICAgICAgICAgICAgICAvLyBSZWNvcmQgZXhjZXB0aW9uIGZvciBPVEVMIGVycm9yIHRyYWNraW5nXG4gICAgICAgICAgICAgICAgICBpZiAodGVybWluYWxFcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwYW4/LnJlY29yZEV4Y2VwdGlvbj8uKHRlcm1pbmFsRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBjb25zdCBub3JtYWxpemVkRXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBub3JtYWxpemVVbmtub3duRXJyb3IodGVybWluYWxFcnJvcik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck5hbWUgPVxuICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkRXJyb3IubmFtZSB8fCBnZXRFcnJvck5hbWUodGVybWluYWxFcnJvcik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBub3JtYWxpemVkRXJyb3IubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgIGxldCBlcnJvclN0YWNrID1cbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZEVycm9yLnN0YWNrIHx8IGdldEVycm9yU3RhY2sodGVybWluYWxFcnJvcik7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFJlbWFwIGVycm9yIHN0YWNrIHVzaW5nIHNvdXJjZSBtYXBzIHRvIHNob3cgb3JpZ2luYWwgc291cmNlIGxvY2F0aW9uc1xuICAgICAgICAgICAgICAgICAgaWYgKGVycm9yU3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkTmFtZSA9IHBhcnNlV29ya2Zsb3dOYW1lKHdvcmtmbG93TmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVuYW1lID1cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZWROYW1lPy5tb2R1bGVTcGVjaWZpZXIgfHwgd29ya2Zsb3dOYW1lO1xuICAgICAgICAgICAgICAgICAgICBlcnJvclN0YWNrID0gcmVtYXBFcnJvclN0YWNrKFxuICAgICAgICAgICAgICAgICAgICAgIGVycm9yU3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dDb2RlXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIENsYXNzaWZ5IHRoZSBlcnJvcjogV29ya2Zsb3dSdW50aW1lRXJyb3IgaW5kaWNhdGVzXG4gICAgICAgICAgICAgICAgICAvLyBhbiBTREsvcnVudGltZSBpc3N1ZSwgYW5kIHNlbGVjdGVkIHN1YmNsYXNzZXMgdXNlXG4gICAgICAgICAgICAgICAgICAvLyBtb3JlIHNwZWNpZmljIGNvZGVzIGZvciBiYWNrZW5kIHRyYWNraW5nLlxuICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gY2xhc3NpZnlSdW5FcnJvcih0ZXJtaW5hbEVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgcnVubmluZyB3b3JrZmxvdycsIHtcbiAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JOYW1lLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclN0YWNrLFxuICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgIC8vIEZhaWwgdGhlIHdvcmtmbG93IHJ1biB2aWEgZXZlbnQgKGV2ZW50LXNvdXJjZWQgYXJjaGl0ZWN0dXJlKVxuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fZmFpbGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogZXJyb3JTdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGZhaWxFcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgIEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZmFpbEVycikgfHxcbiAgICAgICAgICAgICAgICAgICAgICBSdW5FeHBpcmVkRXJyb3IuaXMoZmFpbEVycilcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1RyaWVkIGZhaWxpbmcgd29ya2Zsb3cgcnVuLCBidXQgcnVuIGhhcyBhbHJlYWR5IGZpbmlzaGVkLicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBmYWlsRXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yQ29kZShlcnJvckNvZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JOYW1lKGVycm9yTmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvck1lc3NhZ2UoZXJyb3JNZXNzYWdlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5FcnJvclR5cGUoZXJyb3JOYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzV29ybGRDb250cmFjdEVycm9yKGZhaWxFcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSByZWNvcmRpbmcgd29ya2Zsb3cgZmFpbHVyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbEVyciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZhaWxFcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBTdHJpbmcoZmFpbEVyciksXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZmFpbEVycjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1blN0YXR1cygnZmFpbGVkJyksXG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yQ29kZShlcnJvckNvZGUpLFxuICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvck5hbWUoZXJyb3JOYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JNZXNzYWdlKGVycm9yTWVzc2FnZSksXG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5FcnJvclR5cGUoZXJyb3JOYW1lKSxcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIC0tLSBJbmZyYXN0cnVjdHVyZTogY29tcGxldGUgdGhlIHJ1biAtLS1cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIG91dHNpZGUgdGhlIHVzZXItY29kZSB0cnkvY2F0Y2ggc28gdGhhdCBmYWlsdXJlc1xuICAgICAgICAgICAgICAgIC8vIGhlcmUgKGUuZy4sIG5ldHdvcmsgZXJyb3JzKSBwcm9wYWdhdGUgdG8gdGhlIHF1ZXVlIGhhbmRsZXIuXG4gICAgICAgICAgICAgICAgLy8gcnVuX2NvbXBsZXRlZCBjYXJyaWVzIHRoZSBsb2FkZWQgc25hcHNob3QncyBgc3RhdGVVcGRhdGVkQXRgLFxuICAgICAgICAgICAgICAgIC8vIGJ1dCBpcyBpbnRlbnRpb25hbGx5IE5PVCByZXRyaWVkIGluIHBsYWNlIChub1xuICAgICAgICAgICAgICAgIC8vIHdpdGhQcmVjb25kaXRpb25SZXRyeSkgb24gYSBzdGFsZSAoNDEyKSByZWplY3Rpb246IGByZXN1bHRgXG4gICAgICAgICAgICAgICAgLy8gd2FzIGNvbXB1dGVkIGJ5IHRoaXMgcmVwbGF5LCBzbyBhIG5ld2VyIG91dC1vZi1iYW5kIGV2ZW50XG4gICAgICAgICAgICAgICAgLy8gbGFuZGluZyBhZnRlciB0aGUgc25hcHNob3QgbXVzdCBmb3JjZSBhICpmcmVzaCByZXBsYXkqXG4gICAgICAgICAgICAgICAgLy8gKHdoaWNoIG1heSBvYnNlcnZlIGl0IGFuZCBwcm9kdWNlIGEgZGlmZmVyZW50IHJlc3VsdCksIG5vdFxuICAgICAgICAgICAgICAgIC8vIHJlLWNvbW1pdCB0aGUgc3RhbGUgcmVzdWx0LiBPbiA0MTIgdGhlIGNhdGNoIGJlbG93IHNjaGVkdWxlc1xuICAgICAgICAgICAgICAgIC8vIGFuIGV4cGxpY2l0IGltbWVkaWF0ZSByZS1pbnZvY2F0aW9uIGluc3RlYWQuXG4gICAgICAgICAgICAgICAgLy8gKHJ1bl9mYWlsZWQgaXMgZGVsaWJlcmF0ZWx5IGxlZnQgdW5ndWFyZGVkIGFuZCBmYWlscyBvcGVuOlxuICAgICAgICAgICAgICAgIC8vIGEgc3B1cmlvdXMgcmUtcnVuIGlzIHNhZmUsIGEgc3B1cmlvdXMgY29tcGxldGlvbiBpcyBub3QsIGFuZFxuICAgICAgICAgICAgICAgIC8vIHRoZSBsb2FkZWQgZXZlbnQgbG9nIGlzIG5vdCBpbiBzY29wZSBvbiB0aGF0IGNhdGNoIHBhdGguKVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9jb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogd29ya2Zsb3dSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgICAgICAgICAgICBzdGF0ZVVwZGF0ZWRBdDogc3RhdGVVcGRhdGVkQXRGb3JDcmVhdGUoZXZlbnRzKSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChQcmVjb25kaXRpb25GYWlsZWRFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgICAncnVuX2NvbXBsZXRlZCByZWplY3RlZCBhcyBzdGFsZTsgcmUtaW52b2tpbmcgd2l0aCBhIGZyZXNoIHJlcGxheScsXG4gICAgICAgICAgICAgICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRpbWVvdXRTZWNvbmRzOiAwIH07XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoRW50aXR5Q29uZmxpY3RFcnJvci5pcyhlcnIpIHx8IFJ1bkV4cGlyZWRFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgICAnVHJpZWQgY29tcGxldGluZyB3b3JrZmxvdyBydW4sIGJ1dCBydW4gaGFzIGFscmVhZHkgZmluaXNoZWQuJyxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuU3RhdHVzKCdjb21wbGV0ZWQnKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0V2ZW50c0NvdW50KGV2ZW50cy5sZW5ndGgpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApOyAvLyBFbmQgdHJhY2VcbiAgICAgICAgICB9XG4gICAgICAgICk7IC8vIEVuZCB3aXRoV29ya2Zsb3dCYWdnYWdlXG4gICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgaWYgKHJlcGxheVRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQocmVwbGF5VGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgIH0pOyAvLyBFbmQgd2l0aFRyYWNlQ29udGV4dFxuICAgIH1cbiAgKTtcblxuICByZXR1cm4gd2l0aEhlYWx0aENoZWNrKGhhbmRsZXIsIHdvcmxkU3BlY1ZlcnNpb24pO1xufVxuXG4vLyB0aGlzIGlzIGEgbm8tb3AgcGxhY2Vob2xkZXIgYXMgdGhlIGNsaWVudCBpc1xuLy8gZXhwZWN0aW5nIHRoaXMgdG8gYmUgcHJlc2VudCBidXQgd2UgYXJlbid0IGFjdHVhbGx5IHVzaW5nIGl0XG5leHBvcnQgZnVuY3Rpb24gcnVuU3RlcCgpIHt9XG4iLCAiaW1wb3J0IHtcbiAgRVJST1JfU0xVR1MsXG4gIFJlcGxheURpdmVyZ2VuY2VFcnJvcixcbiAgV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3IsXG4gIFdvcmtmbG93UnVudGltZUVycm9yLFxufSBmcm9tICdAd29ya2Zsb3cvZXJyb3JzJztcbmltcG9ydCB7IGNyZWF0ZVdvcmtmbG93QmFzZVVybCwgd2l0aFJlc29sdmVycyB9IGZyb20gJ0B3b3JrZmxvdy91dGlscyc7XG5pbXBvcnQgeyBwYXJzZVdvcmtmbG93TmFtZSB9IGZyb20gJ0B3b3JrZmxvdy91dGlscy9wYXJzZS1uYW1lJztcbmltcG9ydCB0eXBlIHsgRXZlbnQsIFdvcmtmbG93UnVuIH0gZnJvbSAnQHdvcmtmbG93L3dvcmxkJztcbmltcG9ydCAqIGFzIG5hbm9pZCBmcm9tICduYW5vaWQnO1xuaW1wb3J0IHsgbW9ub3RvbmljRmFjdG9yeSB9IGZyb20gJ3VsaWQnO1xuaW1wb3J0IHR5cGUgeyBDcnlwdG9LZXkgfSBmcm9tICcuL2VuY3J5cHRpb24uanMnO1xuaW1wb3J0IHsgRXZlbnRDb25zdW1lclJlc3VsdCwgRXZlbnRzQ29uc3VtZXIgfSBmcm9tICcuL2V2ZW50cy1jb25zdW1lci5qcyc7XG5pbXBvcnQgdHlwZSB7IFF1ZXVlSXRlbSB9IGZyb20gJy4vZ2xvYmFsLmpzJztcbmltcG9ydCB7IEVOT1RTVVAsIFdvcmtmbG93U3VzcGVuc2lvbiB9IGZyb20gJy4vZ2xvYmFsLmpzJztcbmltcG9ydCB7IHJ1bnRpbWVMb2dnZXIgfSBmcm9tICcuL2xvZ2dlci5qcyc7XG5pbXBvcnQgdHlwZSB7IFdvcmtmbG93T3JjaGVzdHJhdG9yQ29udGV4dCB9IGZyb20gJy4vcHJpdmF0ZS5qcyc7XG5pbXBvcnQgeyBnZXRQb3J0TGF6eSB9IGZyb20gJy4vcnVudGltZS9nZXQtcG9ydC1sYXp5LmpzJztcbmltcG9ydCB7XG4gIGRlaHlkcmF0ZVdvcmtmbG93UmV0dXJuVmFsdWUsXG4gIGh5ZHJhdGVXb3JrZmxvd0FyZ3VtZW50cyxcbn0gZnJvbSAnLi9zZXJpYWxpemF0aW9uLmpzJztcbmltcG9ydCB7IGNyZWF0ZVVzZVN0ZXAgfSBmcm9tICcuL3N0ZXAuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGVwSHlkcmF0aW9uQ2FjaGUgfSBmcm9tICcuL3N0ZXAtaHlkcmF0aW9uLWNhY2hlLmpzJztcbmltcG9ydCB7XG4gIEJPRFlfSU5JVF9TWU1CT0wsXG4gIFNUQUJMRV9VTElELFxuICBXT1JLRkxPV19DUkVBVEVfSE9PSyxcbiAgV09SS0ZMT1dfR0VUX1NUUkVBTV9JRCxcbiAgV09SS0ZMT1dfU0xFRVAsXG4gIFdPUktGTE9XX1VTRV9TVEVQLFxufSBmcm9tICcuL3N5bWJvbHMuanMnO1xuaW1wb3J0ICogYXMgQXR0cmlidXRlIGZyb20gJy4vdGVsZW1ldHJ5L3NlbWFudGljLWNvbnZlbnRpb25zLmpzJztcbmltcG9ydCB7IHRyYWNlIH0gZnJvbSAnLi90ZWxlbWV0cnkuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2Zsb3dSdW5TdHJlYW1JZCB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVDb250ZXh0IH0gZnJvbSAnLi92bS9pbmRleC5qcyc7XG5pbXBvcnQgeyBydW5DYWNoZWRXb3JrZmxvd1NjcmlwdCB9IGZyb20gJy4vdm0vc2NyaXB0LWNhY2hlLmpzJztcbmltcG9ydCB0eXBlIHsgV29ya2Zsb3dNZXRhZGF0YSB9IGZyb20gJy4vd29ya2Zsb3cvZ2V0LXdvcmtmbG93LW1ldGFkYXRhLmpzJztcbmltcG9ydCB7IFdPUktGTE9XX0NPTlRFWFRfU1lNQk9MIH0gZnJvbSAnLi93b3JrZmxvdy9nZXQtd29ya2Zsb3ctbWV0YWRhdGEuanMnO1xuaW1wb3J0IHsgY3JlYXRlQ3JlYXRlSG9vayB9IGZyb20gJy4vd29ya2Zsb3cvaG9vay5qcyc7XG5pbXBvcnQgeyBjcmVhdGVTbGVlcCB9IGZyb20gJy4vd29ya2Zsb3cvc2xlZXAuanMnO1xuXG4vKipcbiAqIExvZ3MgYSB3YXJuaW5nIHdoZW4gYSB3b3JrZmxvdyBydW4gY29tcGxldGVzIG9yIGZhaWxzIHdpdGggdW5jb21taXR0ZWRcbiAqIG9wZXJhdGlvbnMgc3RpbGwgaW4gdGhlIGludm9jYXRpb25zIHF1ZXVlLiBUaGlzIHR5cGljYWxseSBpbmRpY2F0ZXMgdGhlXG4gKiB1c2VyIGZvcmdvdCB0byBgYXdhaXRgIGEgc3RlcCwgaG9vaywgb3Igc2xlZXAgY2FsbC5cbiAqL1xuZnVuY3Rpb24gd2FyblBlbmRpbmdRdWV1ZUl0ZW1zKFxuICBydW5JZDogc3RyaW5nLFxuICBwZW5kaW5nUXVldWU6IE1hcDxzdHJpbmcsIFF1ZXVlSXRlbT4sXG4gIG91dGNvbWU6ICdjb21wbGV0ZWQnIHwgJ2ZhaWxlZCdcbik6IHZvaWQge1xuICAvLyBGaWx0ZXIgb3V0IGhvb2tzIHRoYXQgYXJlIGVpdGhlciBhbHJlYWR5IGNyZWF0ZWQgKGFsaXZlLCB3YWl0aW5nIGZvciBwYXlsb2FkcylcbiAgLy8gb3IgZXhwbGljaXRseSBkaXNwb3NlZCDigJQgYm90aCBhcmUgYmVuaWduIHNpbmNlIHRoZSBiYWNrZW5kIGF1dG8tZGlzcG9zZXNcbiAgLy8gYWxsIGhvb2tzIHdoZW4gYSBydW4gcmVhY2hlcyBhIHRlcm1pbmFsIHN0YXRlXG4gIGNvbnN0IGl0ZW1zID0gWy4uLnBlbmRpbmdRdWV1ZS52YWx1ZXMoKV0uZmlsdGVyKFxuICAgIChpdGVtKSA9PiAhKGl0ZW0udHlwZSA9PT0gJ2hvb2snICYmIChpdGVtLmhhc0NyZWF0ZWRFdmVudCB8fCBpdGVtLmRpc3Bvc2VkKSlcbiAgKTtcbiAgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gIGNvbnN0IGRldGFpbHMgPSBpdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICBzd2l0Y2ggKGl0ZW0udHlwZSkge1xuICAgICAgY2FzZSAnc3RlcCc6XG4gICAgICAgIHJldHVybiBgc3RlcCBcIiR7aXRlbS5zdGVwTmFtZX1cImA7XG4gICAgICBjYXNlICdob29rJzpcbiAgICAgICAgcmV0dXJuIGBob29rIFwiJHtpdGVtLnRva2VufVwiYDtcbiAgICAgIGNhc2UgJ3dhaXQnOlxuICAgICAgICByZXR1cm4gJ3NsZWVwJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBgdW5rbm93biAoJHsoaXRlbSBhcyB7IHR5cGU6IHN0cmluZyB9KS50eXBlfSlgO1xuICAgIH1cbiAgfSk7XG5cbiAgcnVudGltZUxvZ2dlci53YXJuKFxuICAgIGBXb3JrZmxvdyBydW4gJHtvdXRjb21lfSB3aXRoICR7aXRlbXMubGVuZ3RofSB1bmNvbW1pdHRlZCBvcGVyYXRpb24ocyk6ICR7ZGV0YWlscy5qb2luKCcsICcpfS4gYCArXG4gICAgICAnRGlkIHlvdSBmb3JnZXQgdG8gYGF3YWl0YCBhIHN0ZXAsIGhvb2ssIG9yIHNsZWVwIGNhbGw/JyxcbiAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkIH1cbiAgKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bldvcmtmbG93KFxuICB3b3JrZmxvd0NvZGU6IHN0cmluZyxcbiAgd29ya2Zsb3dSdW46IFdvcmtmbG93UnVuLFxuICBldmVudHM6IEV2ZW50W10sXG4gIGVuY3J5cHRpb25LZXk6IENyeXB0b0tleSB8IHVuZGVmaW5lZCxcbiAgLyoqXG4gICAqIE9wdGlvbmFsIHBlci1ydW4gY2FjaGUgZm9yIGh5ZHJhdGVkIHN0ZXAgcmV0dXJuIHZhbHVlcywgb3duZWQgYnkgdGhlIGlubGluZVxuICAgKiByZXBsYXkgbG9vcCBzbyBpdCBzdXJ2aXZlcyBhY3Jvc3MgdGhlIGxvb3AncyBpdGVyYXRpb25zIChlYWNoIG9mIHdoaWNoXG4gICAqIGNyZWF0ZXMgYSBmcmVzaCBjb250ZXh0KS4gTWVtb2l6ZXMgdGhlIGRlY3J5cHQgKyBkZXZhbHVlLXBhcnNlIG9mIGNvbXBsZXRlZFxuICAgKiBzdGVwIHJlc3VsdHMgdG8gdHVybiBPKE7CsikgcmVwbGF5IGh5ZHJhdGlvbiBpbnRvIE8oTikuIE9taXR0ZWQgYnkgY2FsbGVyc1xuICAgKiB0aGF0IHJlcGxheSBvbmx5IG9uY2UgKHRoZW4gdGhlcmUgaXMgbm90aGluZyB0byByZXVzZSkuXG4gICAqL1xuICBzdGVwSHlkcmF0aW9uQ2FjaGU/OiBTdGVwSHlkcmF0aW9uQ2FjaGVcbik6IFByb21pc2U8VWludDhBcnJheSB8IHVua25vd24+IHtcbiAgcmV0dXJuIHRyYWNlKGB3b3JrZmxvdy5ydW4gJHt3b3JrZmxvd1J1bi53b3JrZmxvd05hbWV9YCwgYXN5bmMgKHNwYW4pID0+IHtcbiAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd05hbWUod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKSxcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1bklkKHdvcmtmbG93UnVuLnJ1bklkKSxcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1blN0YXR1cyh3b3JrZmxvd1J1bi5zdGF0dXMpLFxuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXZlbnRzQ291bnQoZXZlbnRzLmxlbmd0aCksXG4gICAgfSk7XG5cbiAgICBjb25zdCBzdGFydGVkQXQgPSB3b3JrZmxvd1J1bi5zdGFydGVkQXQ7XG4gICAgaWYgKCFzdGFydGVkQXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFdvcmtmbG93IHJ1biBcIiR7d29ya2Zsb3dSdW4ucnVuSWR9XCIgaGFzIG5vIFwic3RhcnRlZEF0XCIgdGltZXN0YW1wIChzaG91bGQgbm90IGhhcHBlbilgXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgcG9ydCBiZWZvcmUgY3JlYXRpbmcgVk0gY29udGV4dCB0byBhdm9pZCBhc3luYyBvcGVyYXRpb25zXG4gICAgLy8gYWZmZWN0aW5nIHRoZSBkZXRlcm1pbmlzdGljIHRpbWVzdGFtcFxuICAgIGNvbnN0IGlzVmVyY2VsID0gcHJvY2Vzcy5lbnYuVkVSQ0VMX1VSTCAhPT0gdW5kZWZpbmVkO1xuICAgIC8vIExvYWQgZ2V0UG9ydCBsYXppbHkgdG8gcHJldmVudCBUdXJib3BhY2sgZnJvbSB0cmFjaW5nIGdldC1wb3J0J3NcbiAgICAvLyBmcyBvcHMgKHJlYWRkaXIsIHJlYWRGaWxlKSBpbnRvIHRoZSBmbG93IHJvdXRlIGJ1bmRsZS4gVGhlIHJlc29sdmVkXG4gICAgLy8gcG9ydCBpcyBjYWNoZWQgcGVyIHByb2Nlc3MgKHNlZSBnZXQtcG9ydC1sYXp5LnRzKSwgc28gdGhpcyBpcyBjaGVhcFxuICAgIC8vIG9uIHJlcGxheXMgYWZ0ZXIgdGhlIGZpcnN0IOKAlCBgZ2V0UG9ydCgpYCBvdGhlcndpc2UgcmUtcnVucyBPUyBwb3J0XG4gICAgLy8gZGlzY292ZXJ5IChzcGF3bmluZyBgbHNvZmAgb24gbWFjT1MsIH42MG1zKSBvbiBldmVyeSByZXBsYXkuXG4gICAgY29uc3Qgd29ya2Zsb3dCYXNlVXJsID0gY3JlYXRlV29ya2Zsb3dCYXNlVXJsKFxuICAgICAgaXNWZXJjZWxcbiAgICAgICAgPyBgaHR0cHM6Ly8ke3Byb2Nlc3MuZW52LlZFUkNFTF9VUkx9YFxuICAgICAgICA6IGBodHRwOi8vbG9jYWxob3N0OiR7KGF3YWl0IGdldFBvcnRMYXp5KCkpID8/IDMwMDB9YFxuICAgICk7XG5cbiAgICBjb25zdCB7XG4gICAgICBjb250ZXh0LFxuICAgICAgZ2xvYmFsVGhpczogdm1HbG9iYWxUaGlzLFxuICAgICAgdXBkYXRlVGltZXN0YW1wLFxuICAgIH0gPSBjcmVhdGVDb250ZXh0KHtcbiAgICAgIHNlZWQ6IGAke3dvcmtmbG93UnVuLnJ1bklkfToke3dvcmtmbG93UnVuLndvcmtmbG93TmFtZX06JHsrc3RhcnRlZEF0fWAsXG4gICAgICBmaXhlZFRpbWVzdGFtcDogK3N0YXJ0ZWRBdCxcbiAgICB9KTtcblxuICAgIGNvbnN0IHdvcmtmbG93RGlzY29udGludWF0aW9uID0gd2l0aFJlc29sdmVyczx2b2lkPigpO1xuXG4gICAgY29uc3QgdWxpZCA9IG1vbm90b25pY0ZhY3RvcnkoKCkgPT4gdm1HbG9iYWxUaGlzLk1hdGgucmFuZG9tKCkpO1xuICAgIGNvbnN0IGdlbmVyYXRlTmFub2lkID0gbmFub2lkLmN1c3RvbVJhbmRvbShuYW5vaWQudXJsQWxwaGFiZXQsIDIxLCAoc2l6ZSkgPT5cbiAgICAgIG5ldyBVaW50OEFycmF5KHNpemUpLm1hcCgoKSA9PiAyNTYgKiB2bUdsb2JhbFRoaXMuTWF0aC5yYW5kb20oKSlcbiAgICApO1xuXG4gICAgLy8gQ3JlYXRlIGEgbXV0YWJsZSBob2xkZXIgZm9yIHRoZSBwcm9taXNlIHF1ZXVlIHNvIHRoZSBFdmVudHNDb25zdW1lclxuICAgIC8vIGNhbiBhY2Nlc3MgdGhlIGN1cnJlbnQgcXVldWUgc3RhdGUgdmlhIGEgZ2V0dGVyLiBUaGUgcXVldWUgaXMgbXV0YXRlZFxuICAgIC8vIGJ5IHN0ZXAvaG9vay9zbGVlcCBjYWxsYmFja3MgYXMgZXZlbnRzIGFyZSBwcm9jZXNzZWQuXG4gICAgY29uc3QgcHJvbWlzZVF1ZXVlSG9sZGVyID0geyBjdXJyZW50OiBQcm9taXNlLnJlc29sdmUoKSB9O1xuXG4gICAgY29uc3QgZXZlbnRzQ29uc3VtZXIgPSBuZXcgRXZlbnRzQ29uc3VtZXIoZXZlbnRzLCB7XG4gICAgICBvbkNvbnN1bWVkRXZlbnQ6IChldmVudCkgPT4ge1xuICAgICAgICB1cGRhdGVUaW1lc3RhbXAoK2V2ZW50LmNyZWF0ZWRBdCk7XG4gICAgICB9LFxuICAgICAgb25VbmNvbnN1bWVkRXZlbnQ6IChldmVudCkgPT4ge1xuICAgICAgICB3b3JrZmxvd0Rpc2NvbnRpbnVhdGlvbi5yZWplY3QoXG4gICAgICAgICAgbmV3IFJlcGxheURpdmVyZ2VuY2VFcnJvcihcbiAgICAgICAgICAgIGBSZXBsYXkgY291bGQgbm90IGNvbnN1bWUgZXZlbnQ6IGV2ZW50VHlwZT0ke2V2ZW50LmV2ZW50VHlwZX0sIGNvcnJlbGF0aW9uSWQ9JHtldmVudC5jb3JyZWxhdGlvbklkfSwgZXZlbnRJZD0ke2V2ZW50LmV2ZW50SWR9LmAsXG4gICAgICAgICAgICB7IGV2ZW50SWQ6IGV2ZW50LmV2ZW50SWQgfVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBnZXRQcm9taXNlUXVldWU6ICgpID0+IHByb21pc2VRdWV1ZUhvbGRlci5jdXJyZW50LFxuICAgIH0pO1xuXG4gICAgY29uc3Qgd29ya2Zsb3dDb250ZXh0OiBXb3JrZmxvd09yY2hlc3RyYXRvckNvbnRleHQgPSB7XG4gICAgICBydW5JZDogd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICBlbmNyeXB0aW9uS2V5LFxuICAgICAgZ2xvYmFsVGhpczogdm1HbG9iYWxUaGlzLFxuICAgICAgb25Xb3JrZmxvd0Vycm9yOiB3b3JrZmxvd0Rpc2NvbnRpbnVhdGlvbi5yZWplY3QsXG4gICAgICBldmVudHNDb25zdW1lcixcbiAgICAgIGdlbmVyYXRlVWxpZDogKCkgPT4gdWxpZCgrc3RhcnRlZEF0KSxcbiAgICAgIGdlbmVyYXRlTmFub2lkLFxuICAgICAgaW52b2NhdGlvbnNRdWV1ZTogbmV3IE1hcCgpLFxuICAgICAgLy8gVXNlIGdldHRlci9zZXR0ZXIgc28gdGhlIEV2ZW50c0NvbnN1bWVyJ3MgZ2V0UHJvbWlzZVF1ZXVlKCkgYWx3YXlzXG4gICAgICAvLyBzZWVzIHRoZSBsYXRlc3QgcXVldWUgc3RhdGUgYXMgaXQncyBtdXRhdGVkIGJ5IHN0ZXAvaG9vay9zbGVlcCBjYWxsYmFja3MuXG4gICAgICBnZXQgcHJvbWlzZVF1ZXVlKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZVF1ZXVlSG9sZGVyLmN1cnJlbnQ7XG4gICAgICB9LFxuICAgICAgc2V0IHByb21pc2VRdWV1ZSh2YWx1ZTogUHJvbWlzZTx2b2lkPikge1xuICAgICAgICBwcm9taXNlUXVldWVIb2xkZXIuY3VycmVudCA9IHZhbHVlO1xuICAgICAgfSxcbiAgICAgIHBlbmRpbmdEZWxpdmVyaWVzOiAwLFxuICAgICAgcGVuZGluZ0RlbGl2ZXJ5QmFycmllcnM6IG5ldyBNYXAoKSxcbiAgICAgIHN0ZXBIeWRyYXRpb25DYWNoZSxcbiAgICB9O1xuXG4gICAgLy8gQ29uc3VtZSBydW4gbGlmZWN5Y2xlIGV2ZW50cyAtIHRoZXNlIGFyZSBzdHJ1Y3R1cmFsIGV2ZW50cyB0aGF0IGRvbid0XG4gICAgLy8gbmVlZCBzcGVjaWFsIGhhbmRsaW5nIGluIHRoZSB3b3JrZmxvdywgYnV0IG11c3QgYmUgY29uc3VtZWQgdG8gYWR2YW5jZVxuICAgIC8vIHBhc3QgdGhlbSBpbiB0aGUgZXZlbnQgbG9nXG4gICAgd29ya2Zsb3dDb250ZXh0LmV2ZW50c0NvbnN1bWVyLnN1YnNjcmliZSgoZXZlbnQpID0+IHtcbiAgICAgIGlmICghZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIEV2ZW50Q29uc3VtZXJSZXN1bHQuTm90Q29uc3VtZWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnN1bWUgcnVuX2NyZWF0ZWQgLSBldmVyeSBydW4gaGFzIGV4YWN0bHkgb25lXG4gICAgICBpZiAoZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX2NyZWF0ZWQnKSB7XG4gICAgICAgIHJldHVybiBFdmVudENvbnN1bWVyUmVzdWx0LkNvbnN1bWVkO1xuICAgICAgfVxuXG4gICAgICAvLyBDb25zdW1lIHJ1bl9zdGFydGVkIC0gZXZlcnkgcnVuIGhhcyBleGFjdGx5IG9uZVxuICAgICAgaWYgKGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9zdGFydGVkJykge1xuICAgICAgICByZXR1cm4gRXZlbnRDb25zdW1lclJlc3VsdC5Db25zdW1lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIEV2ZW50Q29uc3VtZXJSZXN1bHQuTm90Q29uc3VtZWQ7XG4gICAgfSk7XG5cbiAgICBjb25zdCB1c2VTdGVwID0gY3JlYXRlVXNlU3RlcCh3b3JrZmxvd0NvbnRleHQpO1xuICAgIGNvbnN0IGNyZWF0ZUhvb2sgPSBjcmVhdGVDcmVhdGVIb29rKHdvcmtmbG93Q29udGV4dCk7XG4gICAgY29uc3Qgc2xlZXAgPSBjcmVhdGVTbGVlcCh3b3JrZmxvd0NvbnRleHQpO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX1VTRV9TVEVQXSA9IHVzZVN0ZXA7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX0NSRUFURV9IT09LXSA9IGNyZWF0ZUhvb2s7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX1NMRUVQXSA9IHNsZWVwO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tXT1JLRkxPV19HRVRfU1RSRUFNX0lEXSA9IChuYW1lc3BhY2U/OiBzdHJpbmcpID0+XG4gICAgICBnZXRXb3JrZmxvd1J1blN0cmVhbUlkKHdvcmtmbG93UnVuLnJ1bklkLCBuYW1lc3BhY2UpO1xuXG4gICAgLy8gRm9yIHRoZSB3b3JrZmxvdyBWTSwgd2Ugc3RvcmUgdGhlIGNvbnRleHQgaW4gYSBzeW1ib2wgb24gdGhlIGBnbG9iYWxUaGlzYCBvYmplY3RcbiAgICBjb25zdCBjdHg6IFdvcmtmbG93TWV0YWRhdGEgPSB7XG4gICAgICB3b3JrZmxvd05hbWU6IHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSxcbiAgICAgIHdvcmtmbG93UnVuSWQ6IHdvcmtmbG93UnVuLnJ1bklkLFxuICAgICAgd29ya2Zsb3dTdGFydGVkQXQ6IG5ldyB2bUdsb2JhbFRoaXMuRGF0ZSgrc3RhcnRlZEF0KSxcbiAgICAgIHVybDogd29ya2Zsb3dCYXNlVXJsLFxuICAgIH07XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfQ09OVEVYVF9TWU1CT0xdID0gY3R4O1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tTVEFCTEVfVUxJRF0gPSB1bGlkO1xuXG4gICAgLy8gTk9URTogV2lsbCBoYXZlIGEgY29uZmlnIG92ZXJyaWRlIHRvIHVzZSB0aGUgY3VzdG9tIGZldGNoIHN0ZXAuXG4gICAgLy8gICAgICAgRm9yIG5vdyBgZmV0Y2hgIG11c3QgYmUgZXhwbGljaXRseSBpbXBvcnRlZCBmcm9tIGB3b3JrZmxvd2AuXG4gICAgdm1HbG9iYWxUaGlzLmZldGNoID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IHZtR2xvYmFsVGhpcy5FcnJvcihcbiAgICAgICAgYEdsb2JhbCBcImZldGNoXCIgaXMgdW5hdmFpbGFibGUgaW4gd29ya2Zsb3cgZnVuY3Rpb25zLiBVc2UgdGhlIFwiZmV0Y2hcIiBzdGVwIGZ1bmN0aW9uIGZyb20gXCJ3b3JrZmxvd1wiIHRvIG1ha2UgSFRUUCByZXF1ZXN0cy5cXG5cXG5MZWFybiBtb3JlOiBodHRwczovL3VzZXdvcmtmbG93LmRldi9lcnIvJHtFUlJPUl9TTFVHUy5GRVRDSF9JTl9XT1JLRkxPV19GVU5DVElPTn1gXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyBPdmVycmlkZSB0aW1lb3V0L2ludGVydmFsIGZ1bmN0aW9ucyB0byB0aHJvdyBoZWxwZnVsIGVycm9yc1xuICAgIC8vIFRoZXNlIGFyZSBub3Qgc3VwcG9ydGVkIGluIHdvcmtmbG93IGZ1bmN0aW9ucyBiZWNhdXNlIHRoZXkgcmVseSBvblxuICAgIC8vIGFzeW5jaHJvbm91cyBzY2hlZHVsaW5nIHdoaWNoIGJyZWFrcyBkZXRlcm1pbmlzdGljIHJlcGxheVxuICAgIGNvbnN0IHRpbWVvdXRFcnJvck1lc3NhZ2UgPVxuICAgICAgJ1RpbWVvdXQgZnVuY3Rpb25zIGxpa2UgXCJzZXRUaW1lb3V0XCIgYW5kIFwic2V0SW50ZXJ2YWxcIiBhcmUgbm90IHN1cHBvcnRlZCBpbiB3b3JrZmxvdyBmdW5jdGlvbnMuIFVzZSB0aGUgXCJzbGVlcFwiIGZ1bmN0aW9uIGZyb20gXCJ3b3JrZmxvd1wiIGZvciB0aW1lLWJhc2VkIGRlbGF5cy4nO1xuXG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLnNldFRpbWVvdXQgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLnNldEludGVydmFsID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuVElNRU9VVF9GVU5DVElPTlNfSU5fV09SS0ZMT1csXG4gICAgICB9KTtcbiAgICB9O1xuICAgICh2bUdsb2JhbFRoaXMgYXMgYW55KS5jbGVhclRpbWVvdXQgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLmNsZWFySW50ZXJ2YWwgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLnNldEltbWVkaWF0ZSA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuY2xlYXJJbW1lZGlhdGUgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBgUmVxdWVzdGAgYW5kIGBSZXNwb25zZWAgYXJlIHNwZWNpYWwgYnVpbHQtaW4gY2xhc3NlcyB0aGF0IGludm9rZSBzdGVwc1xuICAgIC8vIGZvciB0aGUgYGpzb24oKWAsIGB0ZXh0KClgIGFuZCBgYXJyYXlCdWZmZXIoKWAgaW5zdGFuY2UgbWV0aG9kc1xuICAgIGNsYXNzIFJlcXVlc3QgaW1wbGVtZW50cyBnbG9iYWxUaGlzLlJlcXVlc3Qge1xuICAgICAgY2FjaGUhOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ2NhY2hlJ107XG4gICAgICBjcmVkZW50aWFscyE6IGdsb2JhbFRoaXMuUmVxdWVzdFsnY3JlZGVudGlhbHMnXTtcbiAgICAgIGRlc3RpbmF0aW9uITogZ2xvYmFsVGhpcy5SZXF1ZXN0WydkZXN0aW5hdGlvbiddO1xuICAgICAgaGVhZGVycyE6IEhlYWRlcnM7XG4gICAgICBpbnRlZ3JpdHkhOiBzdHJpbmc7XG4gICAgICBtZXRob2QhOiBzdHJpbmc7XG4gICAgICBtb2RlITogZ2xvYmFsVGhpcy5SZXF1ZXN0Wydtb2RlJ107XG4gICAgICByZWRpcmVjdCE6IGdsb2JhbFRoaXMuUmVxdWVzdFsncmVkaXJlY3QnXTtcbiAgICAgIHJlZmVycmVyITogc3RyaW5nO1xuICAgICAgcmVmZXJyZXJQb2xpY3khOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ3JlZmVycmVyUG9saWN5J107XG4gICAgICB1cmwhOiBzdHJpbmc7XG4gICAgICBrZWVwYWxpdmUhOiBib29sZWFuO1xuICAgICAgc2lnbmFsITogQWJvcnRTaWduYWw7XG4gICAgICBkdXBsZXghOiAnaGFsZic7XG4gICAgICBib2R5ITogUmVhZGFibGVTdHJlYW08YW55PiB8IG51bGw7XG5cbiAgICAgIGNvbnN0cnVjdG9yKGlucHV0OiBhbnksIGluaXQ/OiBSZXF1ZXN0SW5pdCkge1xuICAgICAgICAvLyBIYW5kbGUgVVJMIGlucHV0XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnIHx8IGlucHV0IGluc3RhbmNlb2Ygdm1HbG9iYWxUaGlzLlVSTCkge1xuICAgICAgICAgIGNvbnN0IHVybFN0cmluZyA9IFN0cmluZyhpbnB1dCk7XG4gICAgICAgICAgLy8gVmFsaWRhdGUgVVJMIGZvcm1hdFxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBuZXcgdm1HbG9iYWxUaGlzLlVSTCh1cmxTdHJpbmcpO1xuICAgICAgICAgICAgdGhpcy51cmwgPSB1cmxTdHJpbmc7XG4gICAgICAgICAgfSBjYXRjaCAoY2F1c2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEZhaWxlZCB0byBwYXJzZSBVUkwgZnJvbSAke3VybFN0cmluZ31gLCB7XG4gICAgICAgICAgICAgIGNhdXNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElucHV0IGlzIGEgUmVxdWVzdCBvYmplY3QgLSBjbG9uZSBpdHMgcHJvcGVydGllc1xuICAgICAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsO1xuICAgICAgICAgIGlmICghaW5pdCkge1xuICAgICAgICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2Q7XG4gICAgICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoaW5wdXQuaGVhZGVycyk7XG4gICAgICAgICAgICB0aGlzLmJvZHkgPSBpbnB1dC5ib2R5O1xuICAgICAgICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZTtcbiAgICAgICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFscztcbiAgICAgICAgICAgIHRoaXMuY2FjaGUgPSBpbnB1dC5jYWNoZTtcbiAgICAgICAgICAgIHRoaXMucmVkaXJlY3QgPSBpbnB1dC5yZWRpcmVjdDtcbiAgICAgICAgICAgIHRoaXMucmVmZXJyZXIgPSBpbnB1dC5yZWZlcnJlcjtcbiAgICAgICAgICAgIHRoaXMucmVmZXJyZXJQb2xpY3kgPSBpbnB1dC5yZWZlcnJlclBvbGljeTtcbiAgICAgICAgICAgIHRoaXMuaW50ZWdyaXR5ID0gaW5wdXQuaW50ZWdyaXR5O1xuICAgICAgICAgICAgdGhpcy5rZWVwYWxpdmUgPSBpbnB1dC5rZWVwYWxpdmU7XG4gICAgICAgICAgICB0aGlzLnNpZ25hbCA9IGlucHV0LnNpZ25hbDtcbiAgICAgICAgICAgIHRoaXMuZHVwbGV4ID0gaW5wdXQuZHVwbGV4O1xuICAgICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IGlucHV0LmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZiBpbml0IGlzIHByb3ZpZGVkLCBtZXJnZTogdXNlIHNvdXJjZSBwcm9wZXJ0aWVzLCB0aGVuIG92ZXJyaWRlIHdpdGggaW5pdFxuICAgICAgICAgIC8vIENvcHkgYWxsIHByb3BlcnRpZXMgZnJvbSB0aGUgc291cmNlIFJlcXVlc3QgZmlyc3RcbiAgICAgICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZDtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoaW5wdXQuaGVhZGVycyk7XG4gICAgICAgICAgdGhpcy5ib2R5ID0gaW5wdXQuYm9keTtcbiAgICAgICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlO1xuICAgICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFscztcbiAgICAgICAgICB0aGlzLmNhY2hlID0gaW5wdXQuY2FjaGU7XG4gICAgICAgICAgdGhpcy5yZWRpcmVjdCA9IGlucHV0LnJlZGlyZWN0O1xuICAgICAgICAgIHRoaXMucmVmZXJyZXIgPSBpbnB1dC5yZWZlcnJlcjtcbiAgICAgICAgICB0aGlzLnJlZmVycmVyUG9saWN5ID0gaW5wdXQucmVmZXJyZXJQb2xpY3k7XG4gICAgICAgICAgdGhpcy5pbnRlZ3JpdHkgPSBpbnB1dC5pbnRlZ3JpdHk7XG4gICAgICAgICAgdGhpcy5rZWVwYWxpdmUgPSBpbnB1dC5rZWVwYWxpdmU7XG4gICAgICAgICAgdGhpcy5zaWduYWwgPSBpbnB1dC5zaWduYWw7XG4gICAgICAgICAgdGhpcy5kdXBsZXggPSBpbnB1dC5kdXBsZXg7XG4gICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IGlucHV0LmRlc3RpbmF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3ZlcnJpZGUgd2l0aCBpbml0IG9wdGlvbnMgaWYgcHJvdmlkZWRcbiAgICAgICAgLy8gU2V0IG1ldGhvZFxuICAgICAgICBpZiAoaW5pdD8ubWV0aG9kKSB7XG4gICAgICAgICAgdGhpcy5tZXRob2QgPSBpbml0Lm1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLm1ldGhvZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBGYWxsYmFjayB0byBkZWZhdWx0IGZvciBzdHJpbmcgaW5wdXQgY2FzZVxuICAgICAgICAgIHRoaXMubWV0aG9kID0gJ0dFVCc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgaGVhZGVyc1xuICAgICAgICBpZiAoaW5pdD8uaGVhZGVycykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbml0LmhlYWRlcnMpO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgICBpbnB1dCBpbnN0YW5jZW9mIHZtR2xvYmFsVGhpcy5VUkxcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gRm9yIHN0cmluZy9VUkwgaW5wdXQsIGNyZWF0ZSBlbXB0eSBoZWFkZXJzXG4gICAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgb3RoZXIgcHJvcGVydGllcyB3aXRoIGluaXQgdmFsdWVzIG9yIGRlZmF1bHRzXG4gICAgICAgIGlmIChpbml0Py5tb2RlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLm1vZGUgPSBpbml0Lm1vZGU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMubW9kZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLm1vZGUgPSAnY29ycyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8uY3JlZGVudGlhbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbml0LmNyZWRlbnRpYWxzO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNyZWRlbnRpYWxzICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSAnc2FtZS1vcmlnaW4nO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYGFueWAgY2FzdCBoZXJlIGJlY2F1c2UgQHR5cGVzL25vZGUgdjIyIGRvZXMgbm90IHlldCBoYXZlIGBjYWNoZWBcbiAgICAgICAgaWYgKChpbml0IGFzIGFueSk/LmNhY2hlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLmNhY2hlID0gKGluaXQgYXMgYW55KS5jYWNoZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5jYWNoZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmNhY2hlID0gJ2RlZmF1bHQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LnJlZGlyZWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLnJlZGlyZWN0ID0gaW5pdC5yZWRpcmVjdDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZWRpcmVjdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLnJlZGlyZWN0ID0gJ2ZvbGxvdyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8ucmVmZXJyZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMucmVmZXJyZXIgPSBpbml0LnJlZmVycmVyO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnJlZmVycmVyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMucmVmZXJyZXIgPSAnYWJvdXQ6Y2xpZW50JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5yZWZlcnJlclBvbGljeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlclBvbGljeSA9IGluaXQucmVmZXJyZXJQb2xpY3k7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucmVmZXJyZXJQb2xpY3kgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlclBvbGljeSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LmludGVncml0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5pbnRlZ3JpdHkgPSBpbml0LmludGVncml0eTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5pbnRlZ3JpdHkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5pbnRlZ3JpdHkgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5rZWVwYWxpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMua2VlcGFsaXZlID0gaW5pdC5rZWVwYWxpdmU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMua2VlcGFsaXZlICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICB0aGlzLmtlZXBhbGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LnNpZ25hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEFib3J0U2lnbmFsIHN0dWJcbiAgICAgICAgICB0aGlzLnNpZ25hbCA9IGluaXQuc2lnbmFsO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnNpZ25hbCkge1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBBYm9ydFNpZ25hbCBzdHViXG4gICAgICAgICAgdGhpcy5zaWduYWwgPSB7IGFib3J0ZWQ6IGZhbHNlIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZHVwbGV4KSB7XG4gICAgICAgICAgdGhpcy5kdXBsZXggPSAnaGFsZic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZGVzdGluYXRpb24pIHtcbiAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gJ2RvY3VtZW50JztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJvZHkgPSBpbml0Py5ib2R5O1xuXG4gICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgR0VUL0hFQUQgbWV0aG9kcyBkb24ndCBoYXZlIGEgYm9keVxuICAgICAgICBpZiAoXG4gICAgICAgICAgYm9keSAhPT0gbnVsbCAmJlxuICAgICAgICAgIGJvZHkgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJylcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgUmVxdWVzdCB3aXRoIEdFVC9IRUFEIG1ldGhvZCBjYW5ub3QgaGF2ZSBib2R5LmApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RvcmUgdGhlIG9yaWdpbmFsIEJvZHlJbml0IGZvciBzZXJpYWxpemF0aW9uXG4gICAgICAgIGlmIChib2R5ICE9PSBudWxsICYmIGJvZHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIENyZWF0ZSBhIFwiZmFrZVwiIFJlYWRhYmxlU3RyZWFtIHRoYXQgc3RvcmVzIHRoZSBvcmlnaW5hbCBib2R5XG4gICAgICAgICAgLy8gVGhpcyBhdm9pZHMgZG9pbmcgYXN5bmMgd29yayBkdXJpbmcgd29ya2Zsb3cgcmVwbGF5XG4gICAgICAgICAgdGhpcy5ib2R5ID0gT2JqZWN0LmNyZWF0ZSh2bUdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW0ucHJvdG90eXBlLCB7XG4gICAgICAgICAgICBbQk9EWV9JTklUX1NZTUJPTF06IHtcbiAgICAgICAgICAgICAgdmFsdWU6IGJvZHksXG4gICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5ib2R5ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjbG9uZSgpOiBSZXF1ZXN0IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXQgYm9keVVzZWQoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogaW1wbGVtZW50IHRoZXNlXG4gICAgICBibG9iITogKCkgPT4gUHJvbWlzZTxCbG9iPjtcbiAgICAgIGZvcm1EYXRhITogKCkgPT4gUHJvbWlzZTxGb3JtRGF0YT47XG5cbiAgICAgIGFycmF5QnVmZmVyITogKCkgPT4gUHJvbWlzZTxBcnJheUJ1ZmZlcj47XG4gICAgICBqc29uITogKCkgPT4gUHJvbWlzZTxhbnk+O1xuICAgICAgdGV4dCE6ICgpID0+IFByb21pc2U8c3RyaW5nPjtcblxuICAgICAgYXN5bmMgYnl0ZXMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCB0aGlzLmFycmF5QnVmZmVyKCkpO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhSZXF1ZXN0LnByb3RvdHlwZSwge1xuICAgICAgYXJyYXlCdWZmZXI6IHtcbiAgICAgICAgdmFsdWU6IHVzZVN0ZXA8W10sIEFycmF5QnVmZmVyPignX19idWlsdGluX3Jlc3BvbnNlX2FycmF5X2J1ZmZlcicpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGpzb246IHtcbiAgICAgICAgdmFsdWU6IHVzZVN0ZXA8W10sIGFueT4oJ19fYnVpbHRpbl9yZXNwb25zZV9qc29uJyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgICAgdGV4dDoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgc3RyaW5nPignX19idWlsdGluX3Jlc3BvbnNlX3RleHQnKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjbGFzcyBSZXNwb25zZSBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuUmVzcG9uc2Uge1xuICAgICAgdHlwZSE6IGdsb2JhbFRoaXMuUmVzcG9uc2VbJ3R5cGUnXTtcbiAgICAgIHVybCE6IHN0cmluZztcbiAgICAgIHN0YXR1cyE6IG51bWJlcjtcbiAgICAgIHN0YXR1c1RleHQhOiBzdHJpbmc7XG4gICAgICBib2R5ITogUmVhZGFibGVTdHJlYW08VWludDhBcnJheT4gfCBudWxsO1xuICAgICAgaGVhZGVycyE6IEhlYWRlcnM7XG4gICAgICByZWRpcmVjdGVkITogYm9vbGVhbjtcblxuICAgICAgY29uc3RydWN0b3IoYm9keT86IGFueSwgaW5pdD86IFJlc3BvbnNlSW5pdCkge1xuICAgICAgICB0aGlzLnN0YXR1cyA9IGluaXQ/LnN0YXR1cyA/PyAyMDA7XG4gICAgICAgIHRoaXMuc3RhdHVzVGV4dCA9IGluaXQ/LnN0YXR1c1RleHQgPz8gJyc7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbml0Py5oZWFkZXJzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnO1xuICAgICAgICB0aGlzLnVybCA9ICcnO1xuICAgICAgICB0aGlzLnJlZGlyZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IG51bGwtYm9keSBzdGF0dXMgY29kZXMgZG9uJ3QgaGF2ZSBhIGJvZHlcbiAgICAgICAgLy8gUGVyIEhUVFAgc3BlYzogMjA0IChObyBDb250ZW50KSwgMjA1IChSZXNldCBDb250ZW50KSwgYW5kIDMwNCAoTm90IE1vZGlmaWVkKVxuICAgICAgICBpZiAoXG4gICAgICAgICAgYm9keSAhPT0gbnVsbCAmJlxuICAgICAgICAgIGJvZHkgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICh0aGlzLnN0YXR1cyA9PT0gMjA0IHx8IHRoaXMuc3RhdHVzID09PSAyMDUgfHwgdGhpcy5zdGF0dXMgPT09IDMwNClcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgIGBSZXNwb25zZSBjb25zdHJ1Y3RvcjogSW52YWxpZCByZXNwb25zZSBzdGF0dXMgY29kZSAke3RoaXMuc3RhdHVzfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RvcmUgdGhlIG9yaWdpbmFsIEJvZHlJbml0IGZvciBzZXJpYWxpemF0aW9uXG4gICAgICAgIGlmIChib2R5ICE9PSBudWxsICYmIGJvZHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIENyZWF0ZSBhIFwiZmFrZVwiIFJlYWRhYmxlU3RyZWFtIHRoYXQgc3RvcmVzIHRoZSBvcmlnaW5hbCBib2R5XG4gICAgICAgICAgLy8gVGhpcyBhdm9pZHMgZG9pbmcgYXN5bmMgd29yayBkdXJpbmcgd29ya2Zsb3cgcmVwbGF5XG4gICAgICAgICAgdGhpcy5ib2R5ID0gT2JqZWN0LmNyZWF0ZSh2bUdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW0ucHJvdG90eXBlLCB7XG4gICAgICAgICAgICBbQk9EWV9JTklUX1NZTUJPTF06IHtcbiAgICAgICAgICAgICAgdmFsdWU6IGJvZHksXG4gICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5ib2R5ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBpbXBsZW1lbnQgdGhlc2VcbiAgICAgIGNsb25lITogKCkgPT4gUmVzcG9uc2U7XG4gICAgICBibG9iITogKCkgPT4gUHJvbWlzZTxnbG9iYWxUaGlzLkJsb2I+O1xuICAgICAgZm9ybURhdGEhOiAoKSA9PiBQcm9taXNlPGdsb2JhbFRoaXMuRm9ybURhdGE+O1xuXG4gICAgICBnZXQgb2soKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDA7XG4gICAgICB9XG5cbiAgICAgIGdldCBib2R5VXNlZCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBhcnJheUJ1ZmZlciE6ICgpID0+IFByb21pc2U8QXJyYXlCdWZmZXI+O1xuICAgICAganNvbiE6ICgpID0+IFByb21pc2U8YW55PjtcbiAgICAgIHRleHQhOiAoKSA9PiBQcm9taXNlPHN0cmluZz47XG5cbiAgICAgIGFzeW5jIGJ5dGVzKCkge1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgdGhpcy5hcnJheUJ1ZmZlcigpKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGpzb24oZGF0YTogYW55LCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2Uge1xuICAgICAgICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoaW5pdD8uaGVhZGVycyk7XG4gICAgICAgIGlmICghaGVhZGVycy5oYXMoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgICAgaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShib2R5LCB7IC4uLmluaXQsIGhlYWRlcnMgfSk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBlcnJvcigpOiBSZXNwb25zZSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIHJlZGlyZWN0KHVybDogc3RyaW5nIHwgVVJMLCBzdGF0dXM6IG51bWJlciA9IDMwMik6IFJlc3BvbnNlIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgc3RhdHVzIGNvZGUgLSBvbmx5IHNwZWNpZmljIHJlZGlyZWN0IGNvZGVzIGFyZSBhbGxvd2VkXG4gICAgICAgIGlmICghWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XS5pbmNsdWRlcyhzdGF0dXMpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXG4gICAgICAgICAgICBgSW52YWxpZCByZWRpcmVjdCBzdGF0dXMgY29kZTogJHtzdGF0dXN9LiBNdXN0IGJlIG9uZSBvZjogMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSByZXNwb25zZSB3aXRoIExvY2F0aW9uIGhlYWRlclxuICAgICAgICBjb25zdCBoZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKCk7XG4gICAgICAgIGhlYWRlcnMuc2V0KCdMb2NhdGlvbicsIFN0cmluZyh1cmwpKTtcblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IE9iamVjdC5jcmVhdGUoUmVzcG9uc2UucHJvdG90eXBlKTtcbiAgICAgICAgcmVzcG9uc2Uuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICByZXNwb25zZS5zdGF0dXNUZXh0ID0gJyc7XG4gICAgICAgIHJlc3BvbnNlLmhlYWRlcnMgPSBoZWFkZXJzO1xuICAgICAgICByZXNwb25zZS5ib2R5ID0gbnVsbDtcbiAgICAgICAgcmVzcG9uc2UudHlwZSA9ICdkZWZhdWx0JztcbiAgICAgICAgcmVzcG9uc2UudXJsID0gJyc7XG4gICAgICAgIHJlc3BvbnNlLnJlZGlyZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHZtR2xvYmFsVGhpcy5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoUmVzcG9uc2UucHJvdG90eXBlLCB7XG4gICAgICBhcnJheUJ1ZmZlcjoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgQXJyYXlCdWZmZXI+KCdfX2J1aWx0aW5fcmVzcG9uc2VfYXJyYXlfYnVmZmVyJyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgICAganNvbjoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgYW55PignX19idWlsdGluX3Jlc3BvbnNlX2pzb24nKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICB0ZXh0OiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBzdHJpbmc+KCdfX2J1aWx0aW5fcmVzcG9uc2VfdGV4dCcpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNsYXNzIFJlYWRhYmxlU3RyZWFtPFQ+IGltcGxlbWVudHMgZ2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbTxUPiB7XG4gICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXQgbG9ja2VkKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGNhbmNlbCgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGdldFJlYWRlcigpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIHBpcGVUaHJvdWdoKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgcGlwZVRvKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgdGVlKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgdmFsdWVzKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGZyb20oKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdm1HbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtID0gUmVhZGFibGVTdHJlYW07XG5cbiAgICBjbGFzcyBXcml0YWJsZVN0cmVhbTxUPiBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW08VD4ge1xuICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgZ2V0IGxvY2tlZCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBhYm9ydCgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGNsb3NlKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgZ2V0V3JpdGVyKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdm1HbG9iYWxUaGlzLldyaXRhYmxlU3RyZWFtID0gV3JpdGFibGVTdHJlYW07XG5cbiAgICBjbGFzcyBUcmFuc2Zvcm1TdHJlYW08SSwgTz4gaW1wbGVtZW50cyBnbG9iYWxUaGlzLlRyYW5zZm9ybVN0cmVhbTxJLCBPPiB7XG4gICAgICByZWFkYWJsZTogZ2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbTxPPjtcbiAgICAgIHdyaXRhYmxlOiBnbG9iYWxUaGlzLldyaXRhYmxlU3RyZWFtPEk+O1xuXG4gICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuVHJhbnNmb3JtU3RyZWFtID0gVHJhbnNmb3JtU3RyZWFtO1xuXG4gICAgLy8gRXZlbnR1YWxseSB3ZSdsbCBwcm9iYWJseSB3YW50IHRvIHByb3ZpZGUgb3VyIG93biBgY29uc29sZWAgb2JqZWN0LFxuICAgIC8vIGJ1dCBmb3Igbm93IHdlJ2xsIGp1c3QgZXhwb3NlIHRoZSBnbG9iYWwgb25lLlxuICAgIHZtR2xvYmFsVGhpcy5jb25zb2xlID0gZ2xvYmFsVGhpcy5jb25zb2xlO1xuXG4gICAgLy8gSEFDSzogcHJvcGFnYXRlIHN5bWJvbCBuZWVkZWQgZm9yIEFJIGdhdGV3YXkgdXNhZ2VcbiAgICBjb25zdCBTWU1CT0xfRk9SX1JFUV9DT05URVhUID0gU3ltYm9sLmZvcignQHZlcmNlbC9yZXF1ZXN0LWNvbnRleHQnKTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbU1lNQk9MX0ZPUl9SRVFfQ09OVEVYVF0gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpW1xuICAgICAgU1lNQk9MX0ZPUl9SRVFfQ09OVEVYVFxuICAgIF07XG5cbiAgICAvLyBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIHVzZXItZGVmaW5lZCB3b3JrZmxvdyBmdW5jdGlvbi5cbiAgICAvLyBUaGUgZmlsZW5hbWUgcGFyYW1ldGVyIGVuc3VyZXMgc3RhY2sgdHJhY2VzIHNob3cgYSBtZWFuaW5nZnVsIG5hbWVcbiAgICAvLyAoZS5nLiwgXCJleGFtcGxlL3dvcmtmbG93cy85OV9lMmUudHNcIikgaW5zdGVhZCBvZiBcImV2YWxtYWNoaW5lLjxhbm9ueW1vdXM+XCIuXG4gICAgY29uc3QgcGFyc2VkTmFtZSA9IHBhcnNlV29ya2Zsb3dOYW1lKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSk7XG4gICAgY29uc3QgZmlsZW5hbWUgPSBwYXJzZWROYW1lPy5tb2R1bGVTcGVjaWZpZXIgfHwgd29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lO1xuXG4gICAgLy8gRXZhbHVhdGUgdGhlIHdvcmtmbG93IGJ1bmRsZSBhZ2FpbnN0IHRoZSBmcmVzaCBjb250ZXh0IHVzaW5nIGFcbiAgICAvLyBwcm9jZXNzLXdpZGUgY2FjaGUgb2YgdGhlIGNvbXBpbGVkIGB2bS5TY3JpcHRgLiBUaGUgYnVuZGxlIGlzIHRoZSBzYW1lXG4gICAgLy8gc3RyaW5nIGZvciBldmVyeSByZXBsYXkgYW5kIGV2ZXJ5IGludm9jYXRpb24gaW4gdGhpcyBwcm9jZXNzLCBhbmRcbiAgICAvLyBjb21waWxhdGlvbiBpcyBhIHB1cmUgZnVuY3Rpb24gb2YgYChjb2RlLCBmaWxlbmFtZSlgLCBzbyByZXVzaW5nIHRoZVxuICAgIC8vIGNvbXBpbGVkIFNjcmlwdCBhY3Jvc3MgcmVwbGF5cyBpcyBkZXRlcm1pbmlzbS1zYWZlOiBpdCBwcm9kdWNlcyB0aGUgc2FtZVxuICAgIC8vIHdvcmtmbG93IGZ1bmN0aW9uIGFuZCB0aGUgc2FtZSBgZmlsZW5hbWVgIHNvdXJjZSBhdHRyaWJ1dGlvbiBhc1xuICAgIC8vIHJlLXBhcnNpbmcgdGhlIGJ1bmRsZSBldmVyeSB0aW1lLCBidXQgc2tpcHMgdGhlIChleHBlbnNpdmUpIHJlLXBhcnNlLlxuICAgIC8vIEV2YWx1YXRpbmcgdGhlIGJ1bmRsZSByZWdpc3RlcnMgZXZlcnkgd29ya2Zsb3cgb25cbiAgICAvLyBgZ2xvYmFsVGhpcy5fX3ByaXZhdGVfd29ya2Zsb3dzYDsgdGhlIHRyYWlsaW5nIGxvb2t1cCBleHByZXNzaW9uIHRoZW5cbiAgICAvLyByZXRyaWV2ZXMgdGhlIHJlcXVlc3RlZCB3b3JrZmxvdyBmdW5jdGlvbi4gVGhlIGxvb2t1cCBpcyBldmFsdWF0ZWQgYXMgYVxuICAgIC8vIHNlcGFyYXRlIGNhY2hlZCBTY3JpcHQgdW5kZXIgdGhlIHNhbWUgYGZpbGVuYW1lYCwgc28gZXJyb3Igc3RhY2sgZnJhbWVzXG4gICAgLy8gc3RpbGwgYXR0cmlidXRlIHRvIHRoZSB3b3JrZmxvdydzIHNvdXJjZSBmaWxlIChgcmVtYXBFcnJvclN0YWNrYCBrZXlzIG9uXG4gICAgLy8gYGZpbGVuYW1lYCkuIFRoZSBvbmUgYmVoYXZpb3VyYWwgZGlmZmVyZW5jZSBmcm9tIHRoZSBwcmV2aW91c1xuICAgIC8vIHNpbmdsZS1jb21iaW5lZC1zdHJpbmcgYXBwcm9hY2ggaXMgdGhlICpsaW5lIG51bWJlciogb2YgYW4gZXJyb3IgdGhyb3duXG4gICAgLy8gYnkgdGhlIGxvb2t1cCBleHByZXNzaW9uIGl0c2VsZjogaXQgbm93IHJlcG9ydHMgbGluZSAxIG9mIHRoZSBsb29rdXBcbiAgICAvLyBTY3JpcHQgcmF0aGVyIHRoYW4gdGhlIGxpbmUganVzdCBwYXN0IHRoZSBlbmQgb2YgdGhlIGJ1bmRsZS4gVGhhdCBwYXRoXG4gICAgLy8gaXMgcmFyZSAoaXQgcmVxdWlyZXMgdGhlIGxvb2t1cCBgPy5nZXQoLi4uKWAgZXhwcmVzc2lvbiB0byB0aHJvdykgYW5kXG4gICAgLy8gZG9lcyBub3QgYWZmZWN0IHRoZSB3b3JrZmxvdyBmdW5jdGlvbiBvciByZXBsYXkgZGV0ZXJtaW5pc20uXG4gICAgcnVuQ2FjaGVkV29ya2Zsb3dTY3JpcHQod29ya2Zsb3dDb2RlLCBmaWxlbmFtZSwgY29udGV4dCk7XG4gICAgY29uc3Qgd29ya2Zsb3dGbiA9IHJ1bkNhY2hlZFdvcmtmbG93U2NyaXB0KFxuICAgICAgYGdsb2JhbFRoaXMuX19wcml2YXRlX3dvcmtmbG93cz8uZ2V0KCR7SlNPTi5zdHJpbmdpZnkod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKX0pYCxcbiAgICAgIGZpbGVuYW1lLFxuICAgICAgY29udGV4dFxuICAgICk7XG5cbiAgICBpZiAodHlwZW9mIHdvcmtmbG93Rm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd05vdFJlZ2lzdGVyZWRFcnJvcih3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpO1xuICAgIH1cblxuICAgIC8vIENoYWluIHdvcmtmbG93IGFyZ3VtZW50IGh5ZHJhdGlvbiBvbnRvIHRoZSBwcm9taXNlUXVldWUgc28gdGhhdCB0aGVcbiAgICAvLyB1bmNvbnN1bWVkIGV2ZW50IGNoZWNrICh3aGljaCB3YWl0cyBmb3IgdGhlIHF1ZXVlIHRvIGRyYWluKSBkb2Vzbid0XG4gICAgLy8gZmlyZSBkdXJpbmcgdGhlIGFzeW5jIGdhcCBiZXR3ZWVuIHJ1bl9zdGFydGVkIGNvbnN1bXB0aW9uIGFuZCB0aGVcbiAgICAvLyB3b3JrZmxvdyBmdW5jdGlvbiBzdWJzY3JpYmluZyBpdHMgZmlyc3Qgc3RlcCBjYWxsYmFja3MuXG4gICAgbGV0IGFyZ3M6IHVua25vd25bXSA9IFtdO1xuICAgIHdvcmtmbG93Q29udGV4dC5wcm9taXNlUXVldWUgPSB3b3JrZmxvd0NvbnRleHQucHJvbWlzZVF1ZXVlLnRoZW4oXG4gICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgIGFyZ3MgPSBhd2FpdCBoeWRyYXRlV29ya2Zsb3dBcmd1bWVudHMoXG4gICAgICAgICAgd29ya2Zsb3dSdW4uaW5wdXQsXG4gICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgICAgZW5jcnlwdGlvbktleSxcbiAgICAgICAgICB2bUdsb2JhbFRoaXNcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICApO1xuICAgIGF3YWl0IHdvcmtmbG93Q29udGV4dC5wcm9taXNlUXVldWU7XG5cbiAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0FyZ3VtZW50c0NvdW50KGFyZ3MubGVuZ3RoKSxcbiAgICB9KTtcblxuICAgIC8vIEludm9rZSB1c2VyIHdvcmtmbG93XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFByb21pc2UucmFjZShbXG4gICAgICAgIHdvcmtmbG93Rm4oLi4uYXJncyksXG4gICAgICAgIHdvcmtmbG93RGlzY29udGludWF0aW9uLnByb21pc2UsXG4gICAgICBdKTtcblxuICAgICAgY29uc3QgZGVoeWRyYXRlZCA9IGF3YWl0IGRlaHlkcmF0ZVdvcmtmbG93UmV0dXJuVmFsdWUoXG4gICAgICAgIHJlc3VsdCxcbiAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgIGVuY3J5cHRpb25LZXksXG4gICAgICAgIHZtR2xvYmFsVGhpc1xuICAgICAgKTtcblxuICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1Jlc3VsdFR5cGUodHlwZW9mIHJlc3VsdCksXG4gICAgICB9KTtcblxuICAgICAgd2FyblBlbmRpbmdRdWV1ZUl0ZW1zKFxuICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgd29ya2Zsb3dDb250ZXh0Lmludm9jYXRpb25zUXVldWUsXG4gICAgICAgICdjb21wbGV0ZWQnXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gZGVoeWRyYXRlZDtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIENvbnRyb2wtZmxvdyBzaWduYWxzIGFyZSBoYW5kbGVkIGJ5IHRoZSBydW50aW1lIGFuZCBkbyBub3QgbWVhbiB0aGVcbiAgICAgIC8vIHdvcmtmbG93IGhhcyB0ZXJtaW5hbGx5IGZhaWxlZC5cbiAgICAgIGlmIChXb3JrZmxvd1N1c3BlbnNpb24uaXMoZXJyKSB8fCBSZXBsYXlEaXZlcmdlbmNlRXJyb3IuaXMoZXJyKSkge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG5cbiAgICAgIHdhcm5QZW5kaW5nUXVldWVJdGVtcyhcbiAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgIHdvcmtmbG93Q29udGV4dC5pbnZvY2F0aW9uc1F1ZXVlLFxuICAgICAgICAnZmFpbGVkJ1xuICAgICAgKTtcblxuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfSk7XG59XG4iLCAiaW1wb3J0IHtcbiAgRVJST1JfU0xVR1MsXG4gIEhvb2tOb3RGb3VuZEVycm9yLFxuICBXb3JrZmxvd1J1bnRpbWVFcnJvcixcbn0gZnJvbSAnQHdvcmtmbG93L2Vycm9ycyc7XG5pbXBvcnQge1xuICB0eXBlIEhvb2ssXG4gIGlzTGVnYWN5U3BlY1ZlcnNpb24sXG4gIFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICBTUEVDX1ZFUlNJT05fTEVHQUNZLFxuICB0eXBlIFdvcmtmbG93SW52b2tlUGF5bG9hZCxcbiAgdHlwZSBXb3JrZmxvd1J1bixcbn0gZnJvbSAnQHdvcmtmbG93L3dvcmxkJztcbmltcG9ydCB7IGdldFJ1bkNhcGFiaWxpdGllcyB9IGZyb20gJy4uL2NhcGFiaWxpdGllcy5qcyc7XG5pbXBvcnQgeyB0eXBlIENyeXB0b0tleSwgaW1wb3J0S2V5IH0gZnJvbSAnLi4vZW5jcnlwdGlvbi5qcyc7XG5pbXBvcnQgeyBydW50aW1lTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyLmpzJztcbmltcG9ydCB7XG4gIGRlaHlkcmF0ZVN0ZXBSZXR1cm5WYWx1ZSxcbiAgaHlkcmF0ZVN0ZXBBcmd1bWVudHMsXG4gIFNlcmlhbGl6YXRpb25Gb3JtYXQsXG59IGZyb20gJy4uL3NlcmlhbGl6YXRpb24uanMnO1xuaW1wb3J0IHsgV0VCSE9PS19SRVNQT05TRV9XUklUQUJMRSB9IGZyb20gJy4uL3N5bWJvbHMuanMnO1xuaW1wb3J0ICogYXMgQXR0cmlidXRlIGZyb20gJy4uL3RlbGVtZXRyeS9zZW1hbnRpYy1jb252ZW50aW9ucy5qcyc7XG5pbXBvcnQgeyBnZXRTcGFuQ29udGV4dEZvclRyYWNlQ2FycmllciwgdHJhY2UgfSBmcm9tICcuLi90ZWxlbWV0cnkuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2Zsb3dRdWV1ZU5hbWUgfSBmcm9tICcuL2hlbHBlcnMuanMnO1xuaW1wb3J0IHsgc2FmZVdhaXRVbnRpbCwgd2FpdGVkVW50aWwgfSBmcm9tICcuL3dhaXQtdW50aWwuanMnO1xuaW1wb3J0IHsgZ2V0V29ybGQgfSBmcm9tICcuL3dvcmxkLmpzJztcblxuYXN5bmMgZnVuY3Rpb24gbWF0ZXJpYWxpemVSZXNwb25zZUJvZHkocmVzcG9uc2U6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICBpZiAoIXJlc3BvbnNlLmJvZHkpIHtcbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH1cblxuICBjb25zdCBib2R5ID0gYXdhaXQgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKTtcbiAgcmV0dXJuIG5ldyBSZXNwb25zZShib2R5LCB7XG4gICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICBoZWFkZXJzOiByZXNwb25zZS5oZWFkZXJzLFxuICB9KTtcbn1cblxuLyoqXG4gKiBJbnRlcm5hbCBoZWxwZXIgdGhhdCByZXR1cm5zIHRoZSBob29rLCB0aGUgYXNzb2NpYXRlZCB3b3JrZmxvdyBydW4sXG4gKiBhbmQgdGhlIHJlc29sdmVkIGVuY3J5cHRpb24ga2V5LlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRIb29rQnlUb2tlbldpdGhLZXkodG9rZW46IHN0cmluZyk6IFByb21pc2U8e1xuICBob29rOiBIb29rO1xuICBydW46IFdvcmtmbG93UnVuO1xuICBlbmNyeXB0aW9uS2V5OiBDcnlwdG9LZXkgfCB1bmRlZmluZWQ7XG59PiB7XG4gIGNvbnN0IHdvcmxkID0gZ2V0V29ybGQoKTtcbiAgY29uc3QgaG9vayA9IGF3YWl0IHdvcmxkLmhvb2tzLmdldEJ5VG9rZW4odG9rZW4pO1xuICBjb25zdCBydW4gPSBhd2FpdCB3b3JsZC5ydW5zLmdldChob29rLnJ1bklkKTtcbiAgY29uc3QgcmF3S2V5ID0gYXdhaXQgd29ybGQuZ2V0RW5jcnlwdGlvbktleUZvclJ1bj8uKHJ1bik7XG4gIGNvbnN0IGVuY3J5cHRpb25LZXkgPSByYXdLZXkgPyBhd2FpdCBpbXBvcnRLZXkocmF3S2V5KSA6IHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBob29rLm1ldGFkYXRhICE9PSAndW5kZWZpbmVkJykge1xuICAgIGhvb2subWV0YWRhdGEgPSBhd2FpdCBoeWRyYXRlU3RlcEFyZ3VtZW50cyhcbiAgICAgIGhvb2subWV0YWRhdGEgYXMgYW55LFxuICAgICAgaG9vay5ydW5JZCxcbiAgICAgIGVuY3J5cHRpb25LZXlcbiAgICApO1xuICB9XG4gIHJldHVybiB7IGhvb2ssIHJ1biwgZW5jcnlwdGlvbktleSB9O1xufVxuXG4vKipcbiAqIEdldCB0aGUgaG9vayBieSB0b2tlbiB0byBmaW5kIHRoZSBhc3NvY2lhdGVkIHdvcmtmbG93IHJ1bixcbiAqIGFuZCBoeWRyYXRlIHRoZSBgbWV0YWRhdGFgIHByb3BlcnR5IGlmIGl0IHdhcyBzZXQgZnJvbSB3aXRoaW5cbiAqIHRoZSB3b3JrZmxvdyBydW4uXG4gKlxuICogQHBhcmFtIHRva2VuIC0gVGhlIHVuaXF1ZSB0b2tlbiBpZGVudGlmeWluZyB0aGUgaG9va1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SG9va0J5VG9rZW4odG9rZW46IHN0cmluZyk6IFByb21pc2U8SG9vaz4ge1xuICBjb25zdCB7IGhvb2sgfSA9IGF3YWl0IGdldEhvb2tCeVRva2VuV2l0aEtleSh0b2tlbik7XG4gIHJldHVybiBob29rO1xufVxuXG4vKipcbiAqIFJlc3VtZXMgYSB3b3JrZmxvdyBydW4gYnkgc2VuZGluZyBhIHBheWxvYWQgdG8gYSBob29rIGlkZW50aWZpZWQgYnkgaXRzIHRva2VuLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGV4dGVybmFsbHkgKGUuZy4sIGZyb20gYW4gQVBJIHJvdXRlIG9yIHNlcnZlciBhY3Rpb24pXG4gKiB0byBzZW5kIGRhdGEgdG8gYSBob29rIGFuZCByZXN1bWUgdGhlIGFzc29jaWF0ZWQgd29ya2Zsb3cgcnVuLlxuICpcbiAqIEBwYXJhbSB0b2tlbk9ySG9vayAtIFRoZSB1bmlxdWUgdG9rZW4gaWRlbnRpZnlpbmcgdGhlIGhvb2ssIG9yIHRoZSBob29rIG9iamVjdCBpdHNlbGZcbiAqIEBwYXJhbSBwYXlsb2FkIC0gVGhlIGRhdGEgcGF5bG9hZCB0byBzZW5kIHRvIHRoZSBob29rXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byB0aGUgaG9va1xuICogQHRocm93cyBFcnJvciBpZiB0aGUgaG9vayBpcyBub3QgZm91bmQgb3IgaWYgdGhlcmUncyBhbiBlcnJvciBkdXJpbmcgdGhlIHByb2Nlc3NcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGBgYHRzXG4gKiAvLyBJbiBhbiBBUEkgcm91dGVcbiAqIGltcG9ydCB7IHJlc3VtZUhvb2sgfSBmcm9tICdAd29ya2Zsb3cvY29yZS9ydW50aW1lJztcbiAqXG4gKiBleHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gKiAgIGNvbnN0IHsgdG9rZW4sIGRhdGEgfSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuICpcbiAqICAgdHJ5IHtcbiAqICAgICBjb25zdCBob29rID0gYXdhaXQgcmVzdW1lSG9vayh0b2tlbiwgZGF0YSk7XG4gKiAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBydW5JZDogaG9vay5ydW5JZCB9KTtcbiAqICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdIb29rIG5vdCBmb3VuZCcsIHsgc3RhdHVzOiA0MDQgfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdW1lSG9vazxUID0gYW55PihcbiAgdG9rZW5Pckhvb2s6IHN0cmluZyB8IEhvb2ssXG4gIHBheWxvYWQ6IFQsXG4gIGVuY3J5cHRpb25LZXlPdmVycmlkZT86IENyeXB0b0tleVxuKTogUHJvbWlzZTxIb29rPiB7XG4gIHJldHVybiBhd2FpdCB3YWl0ZWRVbnRpbCgoKSA9PiB7XG4gICAgcmV0dXJuIHRyYWNlKCdob29rLnJlc3VtZScsIGFzeW5jIChzcGFuKSA9PiB7XG4gICAgICBjb25zdCB3b3JsZCA9IGdldFdvcmxkKCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBob29rOiBIb29rO1xuICAgICAgICBsZXQgd29ya2Zsb3dSdW46IFdvcmtmbG93UnVuO1xuICAgICAgICBsZXQgZW5jcnlwdGlvbktleTogQ3J5cHRvS2V5IHwgdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuT3JIb29rID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldEhvb2tCeVRva2VuV2l0aEtleSh0b2tlbk9ySG9vayk7XG4gICAgICAgICAgaG9vayA9IHJlc3VsdC5ob29rO1xuICAgICAgICAgIHdvcmtmbG93UnVuID0gcmVzdWx0LnJ1bjtcbiAgICAgICAgICBlbmNyeXB0aW9uS2V5ID0gZW5jcnlwdGlvbktleU92ZXJyaWRlID8/IHJlc3VsdC5lbmNyeXB0aW9uS2V5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhvb2sgPSB0b2tlbk9ySG9vaztcbiAgICAgICAgICB3b3JrZmxvd1J1biA9IGF3YWl0IHdvcmxkLnJ1bnMuZ2V0KGhvb2sucnVuSWQpO1xuICAgICAgICAgIGlmIChlbmNyeXB0aW9uS2V5T3ZlcnJpZGUpIHtcbiAgICAgICAgICAgIGVuY3J5cHRpb25LZXkgPSBlbmNyeXB0aW9uS2V5T3ZlcnJpZGU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJhd0tleSA9IGF3YWl0IHdvcmxkLmdldEVuY3J5cHRpb25LZXlGb3JSdW4/Lih3b3JrZmxvd1J1bik7XG4gICAgICAgICAgICBlbmNyeXB0aW9uS2V5ID0gcmF3S2V5ID8gYXdhaXQgaW1wb3J0S2V5KHJhd0tleSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgLi4uQXR0cmlidXRlLkhvb2tUb2tlbihob29rLnRva2VuKSxcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuSG9va0lkKGhvb2suaG9va0lkKSxcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5JZChob29rLnJ1bklkKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhlIHRhcmdldCBydW4ncyBjYXBhYmlsaXRpZXMgdG8gZW5zdXJlIHdlIGVuY29kZSB0aGVcbiAgICAgICAgLy8gcGF5bG9hZCBpbiBhIGZvcm1hdCB0aGUgcnVuJ3MgZGVwbG95bWVudCBjYW4gZGVjb2RlLiBGb3IgZXhhbXBsZSxcbiAgICAgICAgLy8gcnVucyBjcmVhdGVkIGJlZm9yZSBlbmNyeXB0aW9uIHN1cHBvcnQgd2FzIGFkZGVkIGNhbm5vdCBkZWNvZGVcbiAgICAgICAgLy8gdGhlICdlbmNyJyBzZXJpYWxpemF0aW9uIGZvcm1hdCwgYW5kIHJ1bnMgY3JlYXRlZCBiZWZvcmVcbiAgICAgICAgLy8gYnl0ZS1zdHJlYW0gZnJhbWluZyBzdXBwb3J0IGNhbm5vdCBkZWNvZGUgZnJhbWVkIGJ5dGUgc3RyZWFtcy5cbiAgICAgICAgY29uc3QgcmF3VmVyc2lvbiA9IHdvcmtmbG93UnVuLmV4ZWN1dGlvbkNvbnRleHQ/LndvcmtmbG93Q29yZVZlcnNpb247XG4gICAgICAgIGNvbnN0IGNhcGFiaWxpdGllcyA9IGdldFJ1bkNhcGFiaWxpdGllcyhcbiAgICAgICAgICB0eXBlb2YgcmF3VmVyc2lvbiA9PT0gJ3N0cmluZycgPyByYXdWZXJzaW9uIDogdW5kZWZpbmVkXG4gICAgICAgICk7XG4gICAgICAgIGlmICghY2FwYWJpbGl0aWVzLnN1cHBvcnRlZEZvcm1hdHMuaGFzKFNlcmlhbGl6YXRpb25Gb3JtYXQuRU5DUllQVEVEKSkge1xuICAgICAgICAgIGVuY3J5cHRpb25LZXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWh5ZHJhdGUgdGhlIHBheWxvYWQgZm9yIHN0b3JhZ2VcbiAgICAgICAgY29uc3Qgb3BzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuICAgICAgICBjb25zdCB2MUNvbXBhdCA9IGlzTGVnYWN5U3BlY1ZlcnNpb24oaG9vay5zcGVjVmVyc2lvbik7XG4gICAgICAgIGNvbnN0IGRlaHlkcmF0ZWRQYXlsb2FkID0gYXdhaXQgZGVoeWRyYXRlU3RlcFJldHVyblZhbHVlKFxuICAgICAgICAgIHBheWxvYWQsXG4gICAgICAgICAgaG9vay5ydW5JZCxcbiAgICAgICAgICBlbmNyeXB0aW9uS2V5LFxuICAgICAgICAgIG9wcyxcbiAgICAgICAgICBnbG9iYWxUaGlzLFxuICAgICAgICAgIHYxQ29tcGF0LFxuICAgICAgICAgIGNhcGFiaWxpdGllcy5mcmFtZWRCeXRlU3RyZWFtc1xuICAgICAgICApO1xuICAgICAgICAvLyBUaGVzZSBwYXlsb2FkLXN0cmVhbSBvcHMgYXJlIGZsdXNoZWQgaW4gdGhlIGJhY2tncm91bmQ7IHRoZVxuICAgICAgICAvLyBwcm9taXNlIGhhbmRlZCB0byB3YWl0VW50aWwgbXVzdCBuZXZlciByZWplY3QgKGFuIHVuY29uc3VtZWRcbiAgICAgICAgLy8gd2FpdFVudGlsIHJlamVjdGlvbiBjcmFzaGVzIHRoZSBwcm9jZXNzIGFzIHVuaGFuZGxlZFJlamVjdGlvbiksXG4gICAgICAgIC8vIHNvIHVuZXhwZWN0ZWQgZmFpbHVyZXMgYXJlIGxvZ2dlZCBpbnN0ZWFkLlxuICAgICAgICAvLyBOT1RFOiByZWplY3Rpb25zIHdpdGggYHVuZGVmaW5lZGAgYXJlIGFuIGV4cGVjdGVkIGFydGlmYWN0IG9mIHRoZVxuICAgICAgICAvLyB3ZWJob29rIGJ1bmRsZSBhbmQgYXJlIGlnbm9yZWQgZW50aXJlbHkuXG4gICAgICAgIHNhZmVXYWl0VW50aWwoUHJvbWlzZS5hbGwob3BzKSwgKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgIHJ1bnRpbWVMb2dnZXIud2FybignQmFja2dyb3VuZCBmbHVzaCBvZiBob29rIHBheWxvYWQgb3BzIGZhaWxlZCcsIHtcbiAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IGhvb2sucnVuSWQsXG4gICAgICAgICAgICBob29rSWQ6IGhvb2suaG9va0lkLFxuICAgICAgICAgICAgZXJyb3I6IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgaG9va19yZWNlaXZlZCBldmVudCB3aXRoIHRoZSBwYXlsb2FkXG4gICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgaG9vay5ydW5JZCxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBldmVudFR5cGU6ICdob29rX3JlY2VpdmVkJyxcbiAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQ6IGhvb2suaG9va0lkLFxuICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgIC4uLih2MUNvbXBhdCA/IHt9IDogeyB0b2tlbjogaG9vay50b2tlbiB9KSxcbiAgICAgICAgICAgICAgcGF5bG9hZDogZGVoeWRyYXRlZFBheWxvYWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgeyB2MUNvbXBhdCB9XG4gICAgICAgICk7XG5cbiAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93TmFtZSh3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB0cmFjZUNhcnJpZXIgPSB3b3JrZmxvd1J1bi5leGVjdXRpb25Db250ZXh0Py50cmFjZUNhcnJpZXI7XG5cbiAgICAgICAgaWYgKHRyYWNlQ2Fycmllcikge1xuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhd2FpdCBnZXRTcGFuQ29udGV4dEZvclRyYWNlQ2Fycmllcih0cmFjZUNhcnJpZXIpO1xuICAgICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgICBzcGFuPy5hZGRMaW5rPy4oeyBjb250ZXh0IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlLXRyaWdnZXIgdGhlIHdvcmtmbG93IGFnYWluc3QgdGhlIGRlcGxveW1lbnQgSUQgYXNzb2NpYXRlZFxuICAgICAgICAvLyB3aXRoIHRoZSB3b3JrZmxvdyBydW4gdGhhdCB0aGUgaG9vayBiZWxvbmdzIHRvXG4gICAgICAgIGF3YWl0IHdvcmxkLnF1ZXVlKFxuICAgICAgICAgIGdldFdvcmtmbG93UXVldWVOYW1lKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSksXG4gICAgICAgICAge1xuICAgICAgICAgICAgcnVuSWQ6IGhvb2sucnVuSWQsXG4gICAgICAgICAgICAvLyBhdHRhY2ggdGhlIHRyYWNlIGNhcnJpZXIgZnJvbSB0aGUgd29ya2Zsb3cgcnVuXG4gICAgICAgICAgICB0cmFjZUNhcnJpZXI6XG4gICAgICAgICAgICAgIHdvcmtmbG93UnVuLmV4ZWN1dGlvbkNvbnRleHQ/LnRyYWNlQ2FycmllciA/PyB1bmRlZmluZWQsXG4gICAgICAgICAgfSBzYXRpc2ZpZXMgV29ya2Zsb3dJbnZva2VQYXlsb2FkLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGRlcGxveW1lbnRJZDogd29ya2Zsb3dSdW4uZGVwbG95bWVudElkLFxuICAgICAgICAgICAgc3BlY1ZlcnNpb246IHdvcmtmbG93UnVuLnNwZWNWZXJzaW9uID8/IFNQRUNfVkVSU0lPTl9MRUdBQ1ksXG4gICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBob29rO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Ib29rVG9rZW4oXG4gICAgICAgICAgICB0eXBlb2YgdG9rZW5Pckhvb2sgPT09ICdzdHJpbmcnID8gdG9rZW5Pckhvb2sgOiB0b2tlbk9ySG9vay50b2tlblxuICAgICAgICAgICksXG4gICAgICAgICAgLi4uQXR0cmlidXRlLkhvb2tGb3VuZChmYWxzZSksXG4gICAgICAgIH0pO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJlc3VtZXMgYSB3ZWJob29rIGJ5IHNlbmRpbmcgYSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1JlcXVlc3QgfCBSZXF1ZXN0fVxuICogb2JqZWN0IHRvIGEgaG9vayBpZGVudGlmaWVkIGJ5IGl0cyB0b2tlbi5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBleHRlcm5hbGx5IChlLmcuLCBmcm9tIGFuIEFQSSByb3V0ZSBvciBzZXJ2ZXIgYWN0aW9uKVxuICogdG8gc2VuZCBhIHJlcXVlc3QgdG8gYSB3ZWJob29rIGFuZCByZXN1bWUgdGhlIGFzc29jaWF0ZWQgd29ya2Zsb3cgcnVuLlxuICpcbiAqIEBwYXJhbSB0b2tlbiAtIFRoZSB1bmlxdWUgdG9rZW4gaWRlbnRpZnlpbmcgdGhlIGhvb2tcbiAqIEBwYXJhbSByZXF1ZXN0IC0gVGhlIHJlcXVlc3QgdG8gc2VuZCB0byB0aGUgaG9va1xuICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gdGhlIHJlc3BvbnNlXG4gKiBAdGhyb3dzIEVycm9yIGlmIHRoZSBob29rIGlzIG5vdCBmb3VuZCBvciBpZiB0aGVyZSdzIGFuIGVycm9yIGR1cmluZyB0aGUgcHJvY2Vzc1xuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIC8vIEluIGFuIEFQSSByb3V0ZVxuICogaW1wb3J0IHsgcmVzdW1lV2ViaG9vayB9IGZyb20gJ0B3b3JrZmxvdy9jb3JlL3J1bnRpbWUnO1xuICpcbiAqIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IFJlcXVlc3QpIHtcbiAqICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXF1ZXN0LnVybCk7XG4gKiAgIGNvbnN0IHRva2VuID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ3Rva2VuJyk7XG4gKlxuICogICBpZiAoIXRva2VuKSB7XG4gKiAgICAgcmV0dXJuIG5ldyBSZXNwb25zZSgnTWlzc2luZyB0b2tlbicsIHsgc3RhdHVzOiA0MDAgfSk7XG4gKiAgIH1cbiAqXG4gKiAgIHRyeSB7XG4gKiAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXN1bWVXZWJob29rKHRva2VuLCByZXF1ZXN0KTtcbiAqICAgICByZXR1cm4gcmVzcG9uc2U7XG4gKiAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgICAgcmV0dXJuIG5ldyBSZXNwb25zZSgnV2ViaG9vayBub3QgZm91bmQnLCB7IHN0YXR1czogNDA0IH0pO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3VtZVdlYmhvb2soXG4gIHRva2VuOiBzdHJpbmcsXG4gIHJlcXVlc3Q6IFJlcXVlc3Rcbik6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgY29uc3QgeyBob29rLCBlbmNyeXB0aW9uS2V5IH0gPSBhd2FpdCBnZXRIb29rQnlUb2tlbldpdGhLZXkodG9rZW4pO1xuXG4gIC8vIE9ubHkgd2ViaG9va3MgY2FuIGJlIHJlc3VtZWQgdmlhIHRoZSBwdWJsaWMgZW5kcG9pbnQuXG4gIC8vIElmIHRoZSBob29rIHdhcyBjcmVhdGVkIHZpYSBjcmVhdGVIb29rKCkgKGlzV2ViaG9vayAhPT0gdHJ1ZSksXG4gIC8vIHRocm93IHRoZSBzYW1lIFwibm90IGZvdW5kXCIgZXJyb3IgdGhlIHdvcmxkIHdvdWxkIHRocm93IGZvciBhIG1pc3NpbmdcbiAgLy8gdG9rZW4uIFRoaXMgcHJldmVudHMgbGVha2luZyB0aGF0IHRoZSB0b2tlbiBpcyB2YWxpZC5cbiAgaWYgKGhvb2suaXNXZWJob29rID09PSBmYWxzZSkge1xuICAgIHRocm93IG5ldyBIb29rTm90Rm91bmRFcnJvcih0b2tlbik7XG4gIH1cblxuICBsZXQgcmVzcG9uc2U6IFJlc3BvbnNlIHwgdW5kZWZpbmVkO1xuICBsZXQgcmVzcG9uc2VSZWFkYWJsZTogUmVhZGFibGVTdHJlYW08UmVzcG9uc2U+IHwgdW5kZWZpbmVkO1xuICBpZiAoXG4gICAgaG9vay5tZXRhZGF0YSAmJlxuICAgIHR5cGVvZiBob29rLm1ldGFkYXRhID09PSAnb2JqZWN0JyAmJlxuICAgICdyZXNwb25kV2l0aCcgaW4gaG9vay5tZXRhZGF0YVxuICApIHtcbiAgICBpZiAoaG9vay5tZXRhZGF0YS5yZXNwb25kV2l0aCA9PT0gJ21hbnVhbCcpIHtcbiAgICAgIGNvbnN0IHsgcmVhZGFibGUsIHdyaXRhYmxlIH0gPSBuZXcgVHJhbnNmb3JtU3RyZWFtPFJlc3BvbnNlLCBSZXNwb25zZT4oKTtcbiAgICAgIHJlc3BvbnNlUmVhZGFibGUgPSByZWFkYWJsZTtcblxuICAgICAgLy8gVGhlIHJlcXVlc3QgaW5zdGFuY2UgaW5jbHVkZXMgdGhlIHdyaXRhYmxlIHN0cmVhbSB3aGljaCB3aWxsIGJlIHVzZWRcbiAgICAgIC8vIHRvIHdyaXRlIHRoZSByZXNwb25zZSB0byB0aGUgY2xpZW50IGZyb20gd2l0aGluIHRoZSB3b3JrZmxvdyBydW5cbiAgICAgIChyZXF1ZXN0IGFzIGFueSlbV0VCSE9PS19SRVNQT05TRV9XUklUQUJMRV0gPSB3cml0YWJsZTtcbiAgICB9IGVsc2UgaWYgKGhvb2subWV0YWRhdGEucmVzcG9uZFdpdGggaW5zdGFuY2VvZiBSZXNwb25zZSkge1xuICAgICAgcmVzcG9uc2UgPSBob29rLm1ldGFkYXRhLnJlc3BvbmRXaXRoO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIFxcYHJlc3BvbmRXaXRoXFxgIHZhbHVlOiAke2hvb2subWV0YWRhdGEucmVzcG9uZFdpdGh9YCxcbiAgICAgICAgeyBzbHVnOiBFUlJPUl9TTFVHUy5XRUJIT09LX0lOVkFMSURfUkVTUE9ORF9XSVRIX1ZBTFVFIH1cbiAgICAgICk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIE5vIGByZXNwb25kV2l0aGAgdmFsdWUgaW1wbGllcyB0aGUgZGVmYXVsdCBiZWhhdmlvciBvZiByZXR1cm5pbmcgYSAyMDJcbiAgICByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7IHN0YXR1czogMjAyIH0pO1xuICB9XG5cbiAgYXdhaXQgcmVzdW1lSG9vayhob29rLCByZXF1ZXN0LCBlbmNyeXB0aW9uS2V5KTtcblxuICBpZiAocmVzcG9uc2VSZWFkYWJsZSkge1xuICAgIC8vIFdhaXQgZm9yIHRoZSByZWFkYWJsZSBzdHJlYW0gdG8gZW1pdCBvbmUgY2h1bmssXG4gICAgLy8gd2hpY2ggaXMgdGhlIGBSZXNwb25zZWAgb2JqZWN0XG4gICAgY29uc3QgcmVhZGVyID0gcmVzcG9uc2VSZWFkYWJsZS5nZXRSZWFkZXIoKTtcbiAgICBjb25zdCBjaHVuayA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgaWYgKGNodW5rLnZhbHVlKSB7XG4gICAgICByZXNwb25zZSA9IGF3YWl0IG1hdGVyaWFsaXplUmVzcG9uc2VCb2R5KGNodW5rLnZhbHVlKTtcbiAgICB9XG4gICAgYXdhaXQgcmVhZGVyLmNhbmNlbCgpO1xuICB9XG5cbiAgaWYgKCFyZXNwb25zZSkge1xuICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcignV29ya2Zsb3cgcnVuIGRpZCBub3Qgc2VuZCBhIHJlc3BvbnNlJywge1xuICAgICAgc2x1ZzogRVJST1JfU0xVR1MuV0VCSE9PS19SRVNQT05TRV9OT1RfU0VOVCxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbURPLFNBQVMsc0JBQXNCLE9BQU87QUFDekMsa0JBQWdCLE9BQU8sWUFBWSxNQUFNLElBQUksQ0FBQyxNQUFJO0FBQUEsSUFDMUMsRUFBRTtBQUFBLElBQ0Y7QUFBQSxFQUNKLENBQUMsQ0FBQztBQUNWO0FBS1csU0FBUyx1QkFBdUI7QUFDdkMsU0FBTztBQUFBLElBQ0gsR0FBRztBQUFBLElBQ0gsR0FBRztBQUFBLEVBQ1A7QUFDSjtBQVNXLFNB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RUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKO0FBQ0EsU0FBUyxpQkFBaUI7QUFDdEIsU0FBTztBQUFBLElBQ0g7QUFBQSxJQUNBO0FBQUEsSUFDQSxJQUFJLE9BQU8sU0FBUyxZQUFZLEtBQUssR0FBRyxDQUFDLFFBQVEsSUFBSTtBQUFBLElBQ3JEO0FBQUEsRUFDSjtBQUNKO0FBUFM7QUFRVCxJQUFNLHFCQUFxQjtBQUFBLEVBQ3ZCO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsTUFDSTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFD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RDtBQUNELFNBRUUscUJBQ0Esc0JBQ0EsMkJBR0Q7QUFDRCxTQUFTLDBCQUEwQjtBQUNuQyxTQUF5QixpQkFBaUI7QUFDMUMsU0FBUyxpQkFBQUMsc0JBQXFCO0FBQzlCLFNBQ0UsMEJBQ0Esc0JBQ0EsMkJBQ0Q7QUFDRCxTQUFTLGlDQUFpQztBQUMxQyxZQUFZQyxnQkFBZTtBQUMzQixTQUFTLCtCQUErQixTQUFBQyxjQUFhO0FBQ3JELFNBQVMsNEJBQTRCO0FBQ3JDLFNBQVMsZUFBZSxtQkFBbUI7QUFDM0MsU0FBUyxnQkFBZ0I7OztBRitDekIsU0FDRSxRQUNBLFdBR0Q7QUFDRCxTQUNFLFdBQ0EsYUFHQSxZQUNBLHlCQUNBLGNBR0EsaUJBQ0Q7QUFDRCxTQUtFLGFBQ0Q7QUFDRCxTQUFTLHNCQUFzQjtBQUMvQixTQUNFLGFBQ0EsWUFBQUMsV0FDQSxvQkFBQUMsbUJBQ0EsZ0JBQ0Q7IiwKICAibmFtZXMiOiBbInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImZldGNoIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInBhcnNlZCIsICJjcmVhdGVkIiwgInNldER5bmFtaWNQYWdlcyIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJSZXBsYXlEaXZlcmdlbmNlRXJyb3IiLCAiV29ya2Zsb3dSdW50aW1lRXJyb3IiLCAicGFyc2VXb3JrZmxvd05hbWUiLCAiU1BFQ19WRVJTSU9OX0NVUlJFTlQiLCAiU1BFQ19WRVJTSU9OX0xFR0FDWSIsICJpbXBvcnRLZXkiLCAiV29ya2Zsb3dTdXNwZW5zaW9uIiwgInJ1bnRpbWVMb2dnZXIiLCAiZ2V0V29ya2Zsb3dRdWV1ZU5hbWUiLCAiZ2V0V29ybGQiLCAiQXR0cmlidXRlIiwgInRyYWNlIiwgIldvcmtmbG93U3VzcGVuc2lvbiIsICJFUlJPUl9TTFVHUyIsICJXb3JrZmxvd1J1bnRpbWVFcnJvciIsICJydW50aW1lTG9nZ2VyIiwgIkF0dHJpYnV0ZSIsICJ0cmFjZSIsICJnZXRXb3JsZCIsICJnZXRXb3JsZEhhbmRsZXJzIl0KfQo=
