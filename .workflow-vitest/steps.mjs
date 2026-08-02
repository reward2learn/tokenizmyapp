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

// workflows/app-pack-generate/steps.ts
import { registerStepFunction as registerStepFunction3 } from "workflow/internal/private";
import { FatalError } from "workflow";

// src/domain/app-pack/app-pack-generator.ts
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

// src/domain/app-pack/app-pack-schema.ts
import { z as z2 } from "zod";

// src/domain/ai/schema-generation-schema.ts
import { z } from "zod";
var schemaFieldZod = z.object({
  name: z.string().describe("Field name in camelCase"),
  type: z.enum([
    "string",
    "text",
    "integer",
    "decimal",
    "boolean",
    "datetime",
    "date",
    "time",
    "enum",
    "json",
    "relation"
  ]).describe("Field type aligned with XSD data types"),
  required: z.boolean().default(false),
  unique: z.boolean().optional(),
  default: z.unknown().optional(),
  enumValues: z.array(z.string()).optional(),
  relationTo: z.string().optional(),
  relationType: z.enum([
    "one-to-many",
    "many-to-one",
    "many-to-many"
  ]).optional(),
  schemaOrgProperty: z.string().optional().describe('schema.org property mapping (e.g., "offers.price")'),
  label: z.string().optional().describe("Human-readable label for UI forms"),
  width: z.union([
    z.literal(4),
    z.literal(6),
    z.literal(8),
    z.literal(12)
  ]).optional()
});
var schemaModelZod = z.object({
  name: z.string().describe("Model name in PascalCase"),
  tableName: z.string().describe("Database table name in snake_case_plural"),
  fields: z.array(schemaFieldZod),
  schemaOrgMapping: z.record(z.string()).optional()
});
var useCaseZod = z.object({
  id: z.string().describe("Use case ID in format UC-XXX-NN (e.g., UC-REST-01)"),
  title: z.string(),
  auth: z.enum([
    "public",
    "pin",
    "google"
  ]),
  route: z.string().describe('Route path (e.g., "/menu")'),
  blockTypes: z.array(z.string()),
  models: z.array(z.string())
});
var pageZod = z.object({
  slug: z.string(),
  title: z.string(),
  authTier: z.enum([
    "public",
    "pin",
    "google"
  ]),
  blockTypes: z.array(z.string()),
  navLabel: z.string().optional()
});
var schemaGenerationZodSchema = z.object({
  templateId: z.string(),
  schemaOrgType: z.string(),
  models: z.array(schemaModelZod),
  useCases: z.array(useCaseZod),
  pages: z.array(pageZod)
});

// src/domain/app-pack/app-pack-schema.ts
var appPackAppBriefZod = z2.object({
  id: z2.string().describe('App id in kebab-case, e.g. "hr" or "sales-reporting"'),
  name: z2.string().describe('Human-readable app name, e.g. "HR Management"'),
  department: z2.string().describe('Business department this app serves, e.g. "Human Resources"'),
  summary: z2.string().describe("One-paragraph description of what this app does"),
  templateId: z2.string().describe("Best-fit template id from: financial-analytics, restaurant, hotel, ecommerce-retail, healthcare, supply-chain, real-estate, education, professional-services, manufacturing")
});
var appPackDecompositionZod = z2.object({
  packId: z2.string().describe('Pack id in kebab-case, e.g. "ops-department-pack"'),
  name: z2.string().describe("Pack display name"),
  description: z2.string().describe("High-level description of the whole pack"),
  apps: z2.array(appPackAppBriefZod).describe("One brief per department application"),
  ceoOverview: z2.object({
    purpose: z2.string().describe("What the CEO Overview app does across all departments"),
    kpis: z2.array(z2.string()).describe("Cross-department KPIs the CEO dashboard should surface")
  })
});
var appUxActionZod = z2.object({
  action: z2.string().describe('Action label, e.g. "Create new employee"'),
  targetPage: z2.string().describe("Route path this action navigates to"),
  targetModel: z2.string().optional().describe("Primary model the action operates on"),
  actionType: z2.enum([
    "create",
    "read",
    "update",
    "delete",
    "approve",
    "export",
    "notify",
    "navigate",
    "review"
  ]).describe("Kind of action")
});
var appUxStageZod = z2.object({
  stage: z2.string().describe('Workflow stage name, e.g. "Onboarding"'),
  description: z2.string().optional().describe("What this stage accomplishes"),
  actions: z2.array(appUxActionZod).describe("Actions available in this stage")
});
var appNavZod = z2.object({
  label: z2.string().describe("Nav menu label for this app"),
  icon: z2.string().optional().describe('MUI icon name hint (e.g. "People", "Payments")'),
  pages: z2.array(z2.string()).describe("Page slugs grouped under this app in the nav")
});
var appKnowledgeSnippetZod = z2.object({
  key: z2.string().describe('Snippet key in kebab-case, e.g. "hr-onboarding-steps"'),
  title: z2.string().describe("Snippet title"),
  content: z2.string().describe("Knowledge content (markdown) \u2014 policies, steps, guidance")
});
var appPackAppDefinitionZod = z2.object({
  appId: z2.string().describe("App id matching the decomposition brief"),
  appName: z2.string(),
  department: z2.string(),
  w3cStandard: z2.string().describe('W3C XSD / data standard applied (e.g. "UBL for invoices")'),
  schemaOrgType: z2.string().describe("Primary schema.org type"),
  models: schemaModelZod.array().describe("3-8 ZenStack models (no id/tenantSlug/createdAt/updatedAt base fields)"),
  useCases: useCaseZod.array().describe("Use cases for this app (UC-XXX-NN)"),
  pages: pageZod.array().describe("Pages for this app (auth tiers: public/pin/google)"),
  nav: appNavZod,
  uxWorkflow: z2.array(appUxStageZod).describe("End-to-end UX workflow stages for this app"),
  knowledgeSnippets: z2.array(appKnowledgeSnippetZod).describe("Knowledge snippets for this app")
});
var appPackRunResultZod = z2.object({
  packId: z2.string(),
  name: z2.string(),
  description: z2.string(),
  createdAt: z2.string(),
  apps: z2.array(appPackAppDefinitionZod),
  ceoOverview: z2.object({
    purpose: z2.string(),
    kpis: z2.array(z2.string())
  }),
  materialized: z2.object({
    pages: z2.number(),
    navItems: z2.number(),
    snippets: z2.number(),
    groups: z2.number(),
    zmodels: z2.number()
  })
});

// src/domain/app-pack/app-pack-generator.ts
var W3C_STANDARDS = {
  "financial-analytics": "FpML (Financial Products Markup Language) for derivatives and FIXML for real-time financial information exchange",
  restaurant: "UBL (Universal Business Language) for invoices/orders and GS1 for product/SKU data",
  hotel: "OTA (OpenTravel Alliance) for room bookings and availability",
  "ecommerce-retail": "UBL for electronic orders and Inventory Feeds for SKU/pricing constraints",
  healthcare: "HL7/CDA for electronic health records and claims processing validation",
  "supply-chain": "UBL for shipping notices and B2B logistics manifest documents",
  "real-estate": "RETS (Real Estate Transaction Standard) for property listings",
  education: "IMS Global (LTI, QTI) for learning tools interoperability and assessment",
  "professional-services": "UBL for billing/invoices and project management data",
  manufacturing: "B2MML (Business To Manufacturing Markup Language) for production data"
};
var SCHEMA_ORG_TYPES = {
  "financial-analytics": "FinancialService",
  restaurant: "Restaurant",
  hotel: "Hotel",
  "ecommerce-retail": "Store",
  healthcare: "MedicalOrganization",
  "supply-chain": "DeliveryEvent",
  "real-estate": "RealEstateAgent",
  education: "EducationalOrganization",
  "professional-services": "ProfessionalService",
  manufacturing: "Manufacturer"
};
var AVAILABLE_BLOCKS = [
  "hero",
  "kpi_cards",
  "metric_grid",
  "chart_financial",
  "lever_accordion",
  "action_checklist",
  "doc_markdown",
  "pnl_table",
  "ops_admin_tabs",
  "z_report_form",
  "costs_form",
  "calendar_import",
  "chat_panel",
  "review_blocks",
  "reports_rollup",
  "sheet_viewer"
];
var AUTH_TIERS = [
  "public",
  "pin",
  "google"
];
var MODEL = "gpt-5.5";
function buildDecomposeSystemPrompt(_knowledgeBase) {
  return `You are the chief solution architect of a tenant application platform.

A platform administrator will describe a business need. Decompose it into a
coherent "application pack": one application per business department, plus a
CEO Overview application that spans all of them.

## Rules

1. **Apps per department**: Create one app for every distinct department in the
   requirement (e.g. HR, Marketing/Memberships, Sales Reporting, Ecommerce
   Marketplace, Referrals Management, Back Office Reporting, Legal Adherence,
   Finance/Reporting/Tracking, Back Office Management, Compliance, CEO Overview).
   If the requirement names departments explicitly, cover ALL of them.
2. **App ids**: kebab-case, short (e.g. "hr", "sales-reporting", "ceo-overview").
3. **templateId**: pick the best fit from the template catalog:
   ${Object.keys(W3C_STANDARDS).join(", ")}
   CEO Overview should use "financial-analytics" (it drives transparency,
   insight and realtime actionable items from every department).
4. **CEO Overview app**: MUST be included as the last app. Its summary must
   state that it has access to every department app's knowledge base and
   surfaces cross-department KPIs, transparency, efficiency and actionable
   insights.
5. **Coverage**: The apps must together cover the complete requirement \u2014 no
   department mentioned in the requirement may be missing.
6. **Pack ids**: kebab-case, e.g. "ops-department-pack".

## Output

Return the pack decomposition: id, name, description, per-app briefs and the
CEO overview purpose + KPIs.`;
}
__name(buildDecomposeSystemPrompt, "buildDecomposeSystemPrompt");
async function decomposePackFromPrompt(userPrompt, knowledgeBase) {
  const { object } = await generateObject({
    model: openai(MODEL),
    schema: appPackDecompositionZod,
    system: buildDecomposeSystemPrompt(knowledgeBase),
    prompt: userPrompt,
    temperature: 0.2
  });
  return object;
}
__name(decomposePackFromPrompt, "decomposePackFromPrompt");
function buildAppSystemPrompt(brief, ceoPurpose, ceoKpis, allApps, knowledgeBase) {
  const w3cStandard = W3C_STANDARDS[brief.templateId] ?? "schema.org";
  const schemaOrgType = SCHEMA_ORG_TYPES[brief.templateId] ?? "LocalBusiness";
  return `You are a W3C schema architect, ZenStack ORM expert and product designer.

Design the "${brief.name}" application (department: ${brief.department}) for a
tenant app platform. It is one app inside a pack; the pack also contains:
${allApps.map((a) => `- ${a.name} (${a.department})`).join("\n")}

The CEO Overview app exists so leadership can see into every department \u2014
design this app so its data, pages and knowledge feed that transparency.

## Rules

1. **W3C XSD**: Use ${w3cStandard} for field types and validation constraints.
2. **schema.org mapping**: Map fields to schema.org properties (schemaOrgProperty).
3. **Base fields auto-added**: id, tenantSlug, createdAt, updatedAt are added
   automatically \u2014 never include them in the fields array.
4. **Monetary values**: decimal type with schemaOrgProperty "offers.price".
5. **Status fields**: enum with meaningful enumValues (pending, active, ...).
6. **Models**: 3-8 models depending on the department's complexity.
7. **Use cases**: UC-XXX-NN format; auth: ${AUTH_TIERS.join("/")} (public =
   customer-facing, pin = staff/ops, google = exec/leadership).
8. **Pages**: slugs prefixed with the app id (e.g. "/hr/employees"); blockTypes
   from: ${AVAILABLE_BLOCKS.join(", ")}. Use "ops_admin_tabs" for model
   CRUD/admin surfaces, "kpi_cards"/"chart_financial"/"reports_rollup" for
   reporting, "action_checklist" for actionable items, "doc_markdown" for
   policies, "sheet_viewer" for raw data.
9. **Nav**: one nav section per app with a clear label + icon hint; pages list.
10. **UX workflow**: 2-5 stages describing the end-to-end user journey inside
    the app (e.g. Onboarding \u2192 Daily Ops \u2192 Review), each with concrete actions
    (create/read/update/approve/export/notify/review) pointing at real pages.
11. **Knowledge snippets**: 3-6 snippets (key, title, content in markdown) \u2014
    policies, step-by-step procedures, definitions and guidance specific to
    this department's app. These form the app's knowledge base.
12. **schema.org type**: primary type is "${schemaOrgType}".
13. **Table names**: snake_case plural; **field names**: camelCase.
14. **Field width**: 12 full-width, 6 half-width, 4 third-width.

## Knowledge base (platform context)

${knowledgeBase ? knowledgeBase : "(none provided \u2014 use general best practices)"}

## CEO context

The CEO Overview app purpose: ${ceoPurpose}
CEO KPIs (this app's data should support these): ${ceoKpis.join(", ")}

## Output

Return the complete app definition (models, use cases, pages, nav, UX workflow,
knowledge snippets).`;
}
__name(buildAppSystemPrompt, "buildAppSystemPrompt");
async function generateAppDefinition(brief, ceoPurpose, ceoKpis, allApps, knowledgeBase) {
  const { object } = await generateObject({
    model: openai(MODEL),
    schema: appPackAppDefinitionZod,
    system: buildAppSystemPrompt(brief, ceoPurpose, ceoKpis, allApps, knowledgeBase),
    prompt: `Design the "${brief.name}" application in full detail.`,
    temperature: 0.2
  });
  return object;
}
__name(generateAppDefinition, "generateAppDefinition");
function mockDecomposePack() {
  return {
    packId: "ops-department-pack",
    name: "Operations Department Pack",
    description: "Mock application pack: HR, Sales Reporting, Finance and a CEO Overview app that aggregates every department.",
    apps: [
      {
        id: "hr",
        name: "HR Management",
        department: "Human Resources",
        summary: "Employee records, onboarding, leave and attendance for the HR department.",
        templateId: "professional-services"
      },
      {
        id: "sales-reporting",
        name: "Sales Reporting",
        department: "Sales",
        summary: "Daily sales capture, trend reporting and target tracking for the Sales department.",
        templateId: "restaurant"
      },
      {
        id: "finance",
        name: "Finance / Reporting / Tracking",
        department: "Finance",
        summary: "Revenue, costs, cashflow tracking and financial reporting for the Finance department.",
        templateId: "financial-analytics"
      },
      {
        id: "ceo-overview",
        name: "CEO Overview",
        department: "Executive Leadership",
        summary: "Cross-department transparency dashboard with access to every department knowledge base and realtime actionable items.",
        templateId: "financial-analytics"
      }
    ],
    ceoOverview: {
      purpose: "Aggregate KPIs and knowledge from every department app into a single leadership overview with actionable items.",
      kpis: [
        "revenue",
        "grossMargin",
        "headcount",
        "salesTargetAchievement",
        "cashflow",
        "complianceStatus"
      ]
    }
  };
}
__name(mockDecomposePack, "mockDecomposePack");
function mockGenerateAppDefinition(brief) {
  const modelName = brief.id === "hr" ? "Employee" : brief.id === "sales-reporting" ? "DailySale" : brief.id === "finance" ? "FinancialRecord" : "DepartmentKpi";
  const tableName = `${modelName.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()}s`;
  return {
    appId: brief.id,
    appName: brief.name,
    department: brief.department,
    w3cStandard: W3C_STANDARDS[brief.templateId] ?? "schema.org",
    schemaOrgType: SCHEMA_ORG_TYPES[brief.templateId] ?? "LocalBusiness",
    models: [
      {
        name: modelName,
        tableName,
        fields: [
          {
            name: "name",
            type: "string",
            required: true,
            schemaOrgProperty: "name",
            label: "Name",
            width: 12
          },
          {
            name: "status",
            type: "enum",
            required: true,
            enumValues: [
              "pending",
              "active",
              "archived"
            ],
            label: "Status",
            width: 6
          },
          {
            name: "notes",
            type: "text",
            required: false,
            label: "Notes",
            width: 12
          }
        ]
      }
    ],
    useCases: [
      {
        id: `UC-${brief.id.toUpperCase().slice(0, 4)}-01`,
        title: `Manage ${brief.name} records`,
        auth: "pin",
        route: `/${brief.id}`,
        blockTypes: [
          "ops_admin_tabs"
        ],
        models: [
          modelName
        ]
      }
    ],
    pages: [
      {
        slug: `${brief.id}`,
        title: brief.name,
        authTier: "pin",
        blockTypes: [
          "kpi_cards",
          "ops_admin_tabs"
        ],
        navLabel: brief.name
      }
    ],
    nav: {
      label: brief.name,
      icon: "Dashboard",
      pages: [
        brief.id
      ]
    },
    uxWorkflow: [
      {
        stage: "Daily operations",
        description: "Record and review daily entries",
        actions: [
          {
            action: `Open ${brief.name}`,
            targetPage: `/${brief.id}`,
            actionType: "navigate"
          },
          {
            action: "Add record",
            targetPage: `/${brief.id}`,
            targetModel: modelName,
            actionType: "create"
          }
        ]
      },
      {
        stage: "Review",
        description: "Review and approve entries",
        actions: [
          {
            action: "Approve entries",
            targetPage: `/${brief.id}`,
            actionType: "approve"
          },
          {
            action: "Export report",
            targetPage: `/${brief.id}`,
            actionType: "export"
          }
        ]
      }
    ],
    knowledgeSnippets: [
      {
        key: `${brief.id}-overview`,
        title: `${brief.name} \u2014 Overview`,
        content: `# ${brief.name}

Standard operating guidance for the ${brief.department} app: record entries daily, review weekly, escalate exceptions to the CEO Overview dashboard.`
      },
      {
        key: `${brief.id}-best-practices`,
        title: `${brief.name} \u2014 Best Practices`,
        content: `## Best Practices

1. Keep records current daily.
2. Flag anomalies immediately.
3. Use the action checklist for follow-ups.`
      }
    ]
  };
}
__name(mockGenerateAppDefinition, "mockGenerateAppDefinition");

// src/domain/ai/zmodel-compiler.ts
function mapFieldType(field) {
  switch (field.type) {
    case "string":
      return "String";
    case "text":
      return "String @db.Text";
    case "integer":
      return "Int";
    case "decimal":
      return "Decimal @db.Decimal(14, 2)";
    case "boolean":
      return "Boolean";
    case "datetime":
      return "DateTime";
    case "date":
      return "DateTime @db.Date";
    case "time":
      return "DateTime @db.Time";
    case "enum":
      return "String";
    case "json":
      return "Json";
    case "relation":
      return "String";
    default:
      return "String";
  }
}
__name(mapFieldType, "mapFieldType");
function mapFieldDecorators(field) {
  const parts = [];
  if (field.unique) parts.push("@unique");
  if (field.default !== void 0) {
    if (typeof field.default === "string") {
      parts.push(`@default("${field.default}")`);
    } else if (typeof field.default === "boolean") {
      parts.push(`@default(${field.default})`);
    } else if (typeof field.default === "number") {
      parts.push(`@default(${field.default})`);
    } else if (Array.isArray(field.default)) {
      parts.push(`@default([])`);
    } else {
      parts.push(`@default("{}")`);
    }
  }
  return parts.length > 0 ? " " + parts.join(" ") : "";
}
__name(mapFieldDecorators, "mapFieldDecorators");
function mapFieldComment(field) {
  if (!field.schemaOrgProperty) return null;
  return `  /// schema.org:${field.schemaOrgProperty}`;
}
__name(mapFieldComment, "mapFieldComment");
function compileModel(model) {
  const fieldsStr = model.fields.map((f) => {
    const typeStr = mapFieldType(f);
    const optional = f.required ? "" : "?";
    const decorators = mapFieldDecorators(f);
    const comment = mapFieldComment(f);
    const fieldLine = `  ${f.name} ${typeStr}${optional}${decorators}`;
    return comment ? `${comment}
${fieldLine}` : fieldLine;
  }).join("\n");
  return `
model ${model.name} {
  id         String   @id @default(cuid())
  tenantSlug String?  @map("tenant_slug")
${fieldsStr}
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@index([tenantSlug])
  @@map("${model.tableName}")
}`;
}
__name(compileModel, "compileModel");
function compileToZModel(schema) {
  const header = `// Auto-generated ZenStack schema for ${schema.templateId}
// Generated by TOKENIZMYAPP AI Schema Generator
// schema.org type: ${schema.schemaOrgType}
// W3C standard alignment applied to field types

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../../src/generated/prisma"
  binaryTargets = ["native", "linux-arm64-openssl-3.0.x"]
}

enum AuthTier {
  public
  pin
  google
}
`;
  const models = schema.models.map(compileModel).join("\n");
  return `${header}
${models}
`;
}
__name(compileToZModel, "compileToZModel");
function compileToPageCatalog(schema) {
  const pages = schema.pages.map((p) => `  {
    slug: '${p.slug}',
    title: '${p.title}',
    authTier: '${p.authTier}',
    navLabel: '${p.navLabel ?? p.title}',
    sections: [
      ${p.blockTypes.map((bt, i) => `{ blockType: '${bt}' as BlockType, config: {} }`).join(",\n      ")}
    ],
  }`).join(",\n");
  return `/**
 * Auto-generated page catalog for ${schema.templateId}
 * Generated by TOKENIZMYAPP AI Schema Generator
 */
import type { PageDefinition } from '@/lib/page-catalog';

export const GENERATED_PAGES: PageDefinition[] = [
${pages}
];
`;
}
__name(compileToPageCatalog, "compileToPageCatalog");

// src/domain/app-pack/app-pack-compiler.ts
function toSchemaGenerationResult(def) {
  return {
    templateId: def.appId,
    schemaOrgType: def.schemaOrgType,
    models: def.models,
    useCases: def.useCases,
    pages: def.pages
  };
}
__name(toSchemaGenerationResult, "toSchemaGenerationResult");
function compileAppArtifacts(def) {
  const schema = toSchemaGenerationResult(def);
  return {
    appId: def.appId,
    appName: def.appName,
    department: def.department,
    zmodel: compileToZModel(schema),
    pageCatalog: compileToPageCatalog(schema),
    securityGroupCode: `app_${def.appId}`,
    securityGroupName: `App: ${def.appName}`
  };
}
__name(compileAppArtifacts, "compileAppArtifacts");
function sanitizePageSlug(slug) {
  return slug.toLowerCase().replace(/^\/+/, "").replace(/[\s.]+/g, "-").replace(/[^a-z0-9-_]/g, "").slice(0, 48);
}
__name(sanitizePageSlug, "sanitizePageSlug");
function compileAppRows(def, tenantSlug, packId) {
  const rootSlug = `${packId}-${def.appId}`;
  const root = {
    id: `page_${packId}_${def.appId}`,
    slug: rootSlug,
    title: def.appName,
    authTier: def.pages[0]?.authTier ?? "pin",
    navLabel: null,
    showInNav: false,
    tenantSlug,
    sections: [
      {
        blockType: "hero",
        config: {
          title: def.appName
        }
      }
    ]
  };
  const pages = [
    root,
    ...def.pages.map((p) => {
      const seg = sanitizePageSlug(p.slug);
      return {
        id: `page_${packId}_${def.appId}_${seg}`,
        slug: `${packId}-${def.appId}-${seg}`,
        title: p.title,
        authTier: p.authTier,
        navLabel: p.navLabel ?? null,
        showInNav: p.navLabel != null,
        tenantSlug,
        sections: p.blockTypes.map((bt) => ({
          blockType: bt,
          config: {}
        }))
      };
    })
  ];
  const groupCode = `app_${def.appId}`;
  const nav = [];
  nav.push({
    id: `nav_${packId}_${def.appId}`,
    title: def.nav.label,
    path: `/${rootSlug}`,
    icon: def.nav.icon ?? "Apps",
    requiredGroups: groupCode,
    isDynamic: true,
    sortOrder: 0,
    tenantSlug
  });
  def.nav.pages.forEach((slug, i) => {
    const seg = sanitizePageSlug(slug);
    const page = pages.find((p) => p.slug === `${packId}-${def.appId}-${seg}`);
    nav.push({
      id: `nav_${packId}_${def.appId}_${seg}`,
      title: page?.navLabel ?? page?.title ?? seg,
      path: `/${packId}-${def.appId}-${seg}`,
      icon: "",
      requiredGroups: groupCode,
      isDynamic: true,
      sortOrder: i + 1,
      tenantSlug
    });
  });
  const snippets = def.knowledgeSnippets.map((s) => ({
    id: `snip_${packId}_${def.appId}_${s.key.replace(/[^a-z0-9-]/g, "_")}`,
    key: `${packId}-${s.key}`,
    content: s.content,
    category: `app_${def.appId}`
  }));
  return {
    pages,
    nav,
    snippets,
    ux: {
      appId: def.appId,
      appName: def.appName,
      department: def.department,
      stages: def.uxWorkflow
    }
  };
}
__name(compileAppRows, "compileAppRows");
function compileCeoRows(decomposition, ceoDef, tenantSlug, packId) {
  const groupCode = `app_${ceoDef.appId}`;
  const nav = [
    {
      id: `nav_${packId}_${ceoDef.appId}`,
      title: ceoDef.nav.label,
      path: `/${packId}-${ceoDef.appId}`,
      icon: ceoDef.nav.icon ?? "Insights",
      requiredGroups: groupCode,
      isDynamic: true,
      sortOrder: 100,
      tenantSlug
    }
  ];
  const snippets = [
    {
      id: `snip_${packId}_${ceoDef.appId}_overview`,
      key: `${packId}-${ceoDef.appId}-overview`,
      content: `# ${ceoDef.appName}

${decomposition.ceoOverview.purpose}

Cross-department KPIs: ${decomposition.ceoOverview.kpis.join(", ")}.`,
      category: `app_${ceoDef.appId}`
    },
    ...decomposition.apps.filter((a) => a.id !== ceoDef.appId).map((a) => ({
      id: `snip_${packId}_${ceoDef.appId}_xref_${a.id}`,
      key: `${packId}-${ceoDef.appId}-xref-${a.id}`,
      content: `# ${a.name} (${a.department})

${a.summary}

This department app feeds the CEO Overview. Refer to its knowledge category "app_${a.id}" for operating details.`,
      category: `app_${ceoDef.appId}`
    }))
  ];
  return {
    nav,
    snippets,
    ux: {
      appId: ceoDef.appId,
      appName: ceoDef.appName,
      department: ceoDef.department,
      stages: ceoDef.uxWorkflow
    }
  };
}
__name(compileCeoRows, "compileCeoRows");

// src/domain/app-pack/app-pack-materializer.ts
async function upsertSecurityGroups(client, apps) {
  let count = 0;
  for (const app of apps) {
    await client.query(`INSERT INTO security_groups (id, code, name, description, is_system, permissions, created_at)
       VALUES ($1, $2, $3, $4, false, ARRAY[]::text[], NOW())
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;`, [
      `sg_${app.appId}`,
      app.securityGroupCode,
      app.securityGroupName,
      `Members can access the ${app.appName} app.`
    ]);
    count++;
  }
  return count;
}
__name(upsertSecurityGroups, "upsertSecurityGroups");
async function materializeAppPack(client, input) {
  const { packId, tenantSlug, decomposition, apps, definitions } = input;
  const counts = {
    apps: 0,
    pages: 0,
    sections: 0,
    nav: 0,
    snippets: 0,
    groups: 0
  };
  counts.groups = await upsertSecurityGroups(client, apps);
  const pageSlugPrefix = `${packId}-%`;
  await client.query(`DELETE FROM app_pages WHERE slug LIKE $1 AND tenant_slug = $2;`, [
    pageSlugPrefix,
    tenantSlug
  ]);
  const defs = [
    ...definitions
  ];
  const ceoDef = defs[defs.length - 1];
  const deptDefs = defs.slice(0, -1);
  for (const def of deptDefs) {
    const rows = compileAppRows(def, tenantSlug, packId);
    for (const page of rows.pages) {
      await client.query(`INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug)
         VALUES ($1, $2, $3, CAST($4 AS "AuthTier"), $5, $6, $7, $8);`, [
        page.id,
        page.slug,
        page.title,
        page.authTier,
        0,
        page.navLabel,
        page.showInNav,
        tenantSlug
      ]);
      counts.pages++;
      for (let i = 0; i < page.sections.length; i++) {
        await client.query(`INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
           VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb));`, [
          `${page.id}:section:${i}`,
          page.id,
          i,
          page.sections[i].blockType,
          JSON.stringify(page.sections[i].config)
        ]);
        counts.sections++;
      }
    }
    for (const item of rows.nav) {
      await client.query(`INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, tenant_slug,
                                       is_active, required_groups, is_visible, is_dynamic, is_default, created_at, updated_at)
         VALUES ($1, NULL, $2, $3, $4, $5, CAST('pin' AS "AuthTier"), $6, true, $7, true, $8, false, NOW(), NOW());`, [
        item.id,
        item.sortOrder,
        item.title,
        item.path,
        item.icon,
        tenantSlug,
        item.requiredGroups,
        item.isDynamic
      ]);
      counts.nav++;
    }
    for (const snip of rows.snippets) {
      await client.query(`INSERT INTO knowledge_snippets (id, key, content, category) VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content, category = EXCLUDED.category;`, [
        snip.id,
        snip.key,
        snip.content,
        snip.category
      ]);
      counts.snippets++;
    }
    counts.apps++;
  }
  const ceoRows = compileCeoRows(decomposition, ceoDef, tenantSlug, packId);
  const rootSlug = `${packId}-${ceoDef.appId}`;
  await client.query(`INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug)
     VALUES ($1, $2, $3, CAST($4 AS "AuthTier"), $5, $6, $7, $8);`, [
    `page_${packId}_${ceoDef.appId}`,
    rootSlug,
    ceoDef.appName,
    "pin",
    0,
    null,
    false,
    tenantSlug
  ]);
  counts.pages++;
  await client.query(`INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
     VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb));`, [
    `page_${packId}_${ceoDef.appId}:section:0`,
    `page_${packId}_${ceoDef.appId}`,
    0,
    "hero",
    JSON.stringify({
      title: ceoDef.appName
    })
  ]);
  counts.sections++;
  for (const def of [
    ceoDef
  ]) {
    const rows = compileAppRows(def, tenantSlug, packId);
    for (const page of rows.pages.slice(1)) {
      await client.query(`INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug)
         VALUES ($1, $2, $3, CAST($4 AS "AuthTier"), $5, $6, $7, $8);`, [
        page.id,
        page.slug,
        page.title,
        page.authTier,
        0,
        page.navLabel,
        page.showInNav,
        tenantSlug
      ]);
      counts.pages++;
      for (let i = 0; i < page.sections.length; i++) {
        await client.query(`INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
           VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb));`, [
          `${page.id}:section:${i}`,
          page.id,
          i,
          page.sections[i].blockType,
          JSON.stringify(page.sections[i].config)
        ]);
        counts.sections++;
      }
    }
    for (const item of rows.nav) {
      await client.query(`INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, tenant_slug,
                                       is_active, required_groups, is_visible, is_dynamic, is_default, created_at, updated_at)
         VALUES ($1, NULL, $2, $3, $4, $5, CAST('pin' AS "AuthTier"), $6, true, $7, true, $8, false, NOW(), NOW());`, [
        item.id,
        item.sortOrder,
        item.title,
        item.path,
        item.icon,
        tenantSlug,
        item.requiredGroups,
        item.isDynamic
      ]);
      counts.nav++;
    }
  }
  for (const snip of ceoRows.snippets) {
    await client.query(`INSERT INTO knowledge_snippets (id, key, content, category) VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content, category = EXCLUDED.category;`, [
      snip.id,
      snip.key,
      snip.content,
      snip.category
    ]);
    counts.snippets++;
  }
  counts.apps++;
  return counts;
}
__name(materializeAppPack, "materializeAppPack");

// workflows/app-pack-generate/progress.ts
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

// workflows/app-pack-generate/db.ts
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
async function queryRows(client, sql, params = []) {
  const result = await client.query(sql, params);
  return result.rows;
}
__name(queryRows, "queryRows");

// workflows/app-pack-generate/steps.ts
function defaultPackId(prompt) {
  return `pack-${prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "custom"}`;
}
__name(defaultPackId, "defaultPackId");
async function decomposePackStep(input) {
  if (input.mock) {
    return mockDecomposePack();
  }
  const decomposition = await decomposePackFromPrompt(input.prompt);
  if (!decomposition.apps.length) {
    throw new FatalError("AI decomposition returned zero apps \u2014 please rephrase the requirement.");
  }
  return decomposition;
}
__name(decomposePackStep, "decomposePackStep");
async function loadKnowledgeBaseStep(dbUrl) {
  try {
    return await withPgClient(dbUrl, async (db) => {
      const rows = await queryRows(db, `SELECT key, content, category FROM knowledge_snippets ORDER BY category, key LIMIT 200;`);
      if (!rows.length) return "";
      return rows.map((r) => `[${r.category}] ${r.key}:
${r.content.slice(0, 2e3)}`).join("\n\n---\n\n");
    });
  } catch {
    return "";
  }
}
__name(loadKnowledgeBaseStep, "loadKnowledgeBaseStep");
async function generateAppStep(input, decomposition, knowledgeBase, index) {
  const b = decomposition.apps[index];
  if (!b) {
    throw new FatalError(`App brief at index ${index} missing from decomposition.`);
  }
  const isCeo = index === decomposition.apps.length - 1;
  if (input.mock) {
    return mockGenerateAppDefinition(b);
  }
  return generateAppDefinition(b, isCeo ? decomposition.ceoOverview.purpose : "", isCeo ? decomposition.ceoOverview.kpis : [], decomposition.apps, knowledgeBase);
}
__name(generateAppStep, "generateAppStep");
async function compileAppPackStep(decomposition, definitions) {
  return definitions.map((def) => compileAppArtifacts(def));
}
__name(compileAppPackStep, "compileAppPackStep");
async function materializeAppPackStep(input, decomposition, definitions, artifacts) {
  const packId = input.packId ?? defaultPackId(input.prompt);
  const materializeInput = {
    packId,
    tenantSlug: input.tenantSlug,
    decomposition,
    apps: artifacts,
    definitions
  };
  return withPgClient(input.dbUrl, (db) => materializeAppPack(db, materializeInput));
}
__name(materializeAppPackStep, "materializeAppPackStep");
async function emitProgressStep(writable, chunk) {
  await writeProgressChunk(writable, chunk);
}
__name(emitProgressStep, "emitProgressStep");
async function closeProgressStep(writable) {
  await closeProgressStream(writable);
}
__name(closeProgressStep, "closeProgressStep");
registerStepFunction3("step//./workflows/app-pack-generate/steps//decomposePackStep", decomposePackStep);
registerStepFunction3("step//./workflows/app-pack-generate/steps//loadKnowledgeBaseStep", loadKnowledgeBaseStep);
registerStepFunction3("step//./workflows/app-pack-generate/steps//generateAppStep", generateAppStep);
registerStepFunction3("step//./workflows/app-pack-generate/steps//compileAppPackStep", compileAppPackStep);
registerStepFunction3("step//./workflows/app-pack-generate/steps//materializeAppPackStep", materializeAppPackStep);
registerStepFunction3("step//./workflows/app-pack-generate/steps//emitProgressStep", emitProgressStep);
registerStepFunction3("step//./workflows/app-pack-generate/steps//closeProgressStep", closeProgressStep);

// workflows/workbook-ingest/steps.ts
import { registerStepFunction as registerStepFunction4 } from "workflow/internal/private";
import { FatalError as FatalError2, RetryableError } from "workflow";

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
import { z as z3 } from "zod";
var MetricSchema = z3.object({
  /** Period in YYYY-MM (annual totals may use YYYY-12). */
  period: z3.string().regex(/^\d{4}-\d{2}$/),
  dataType: z3.enum([
    "actual",
    "forecast"
  ]),
  scenario: z3.enum([
    "actual",
    "conservative",
    "realistic",
    "aspirational"
  ]),
  revenue: z3.number().nullable().optional(),
  ebitda: z3.number().nullable().optional(),
  netIncome: z3.number().nullable().optional(),
  guests: z3.number().nullable().optional(),
  staffCost: z3.number().nullable().optional()
});
var SheetComprehensionSchema = z3.object({
  /** Exact tab name as it appears in the workbook. */
  tabName: z3.string(),
  category: z3.enum(SHEET_CATEGORIES),
  /** Human-readable title for the dynamic page. */
  title: z3.string(),
  /** One-paragraph comprehension of what this sheet contains. */
  summary: z3.string(),
  /** Detected period, e.g. "June 2026" — null when not detectable. */
  periodHint: z3.string().nullable().optional(),
  /** Column headers (first meaningful row). */
  columns: z3.array(z3.string()).optional(),
  rowCount: z3.number().int().nonnegative().optional(),
  /** Per-period metrics found on THIS sheet. */
  metrics: z3.array(MetricSchema).optional()
});
var WorkbookComprehensionSchema = z3.object({
  workbook: z3.object({
    title: z3.string(),
    company: z3.string().nullable().optional(),
    period: z3.string().nullable().optional(),
    currency: z3.string().nullable().optional(),
    summary: z3.string()
  }),
  sheets: z3.array(SheetComprehensionSchema),
  /**
  * Normalized financial projections consolidated across ALL sheets.
  * This is the source for the financial_projections table.
  */
  projections: z3.array(MetricSchema),
  /**
  * Template suggestion from the available template catalog
  * (TEMPLATE_CATALOG ids, e.g. "financial-analytics", "restaurant").
  */
  template: z3.object({
    id: z3.string(),
    confidence: z3.number().min(0).max(1).optional(),
    reason: z3.string().optional()
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
    const first = err instanceof z3.ZodError ? err.issues[0] : null;
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
async function writeProgressChunk2(writable, chunk) {
  const writer = writable.getWriter();
  try {
    await writer.write(chunk);
  } finally {
    writer.releaseLock();
  }
}
__name(writeProgressChunk2, "writeProgressChunk");
async function closeProgressStream2(writable) {
  await writable.close();
}
__name(closeProgressStream2, "closeProgressStream");

// workflows/workbook-ingest/db.ts
import { Client as Client2 } from "pg";
async function withPgClient2(connectionString, fn) {
  if (!connectionString) {
    throw new Error("No database connection string provided.");
  }
  const client = new Client2({
    connectionString
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}
__name(withPgClient2, "withPgClient");
async function executeOne(client, sql, params = []) {
  const result = await client.query(sql, params);
  return result.rowCount ?? 0;
}
__name(executeOne, "executeOne");
async function queryRows2(client, sql, params = []) {
  const result = await client.query(sql, params);
  return result.rows;
}
__name(queryRows2, "queryRows");

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
    throw new FatalError2("No workbook files were provided.");
  }
  return files.map((f) => {
    if (!f || typeof f.name !== "string" || !(f.data instanceof Uint8Array)) {
      throw new FatalError2("Invalid file entry: expected { name, data: Uint8Array }.");
    }
    if (f.data.byteLength === 0) {
      throw new FatalError2(`Workbook "${f.name}" is empty.`);
    }
    if (!hasSpreadsheetMagic(f.data)) {
      throw new FatalError2(`Workbook "${f.name}" is not a readable .xlsx/.xls file (unexpected file signature).`);
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
      throw new FatalError2(`Workbook is not a readable .xlsx file: ${err instanceof Error ? err.message : String(err)}`);
    }
    all.push(...extracted);
  }
  if (all.length === 0) {
    throw new FatalError2("Workbook contains no readable sheets.");
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
    await withPgClient2(dbUrl, async (db) => {
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
    throw new FatalError2("OpenAI API key not configured. Set it in Config > OpenAI Key (via the reseed route) or set OPENAI_API_KEY env var.");
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
async function emitProgressStep2(writable, chunk) {
  await writeProgressChunk2(writable, chunk);
}
__name(emitProgressStep2, "emitProgressStep");
async function closeProgressStep2(writable) {
  await closeProgressStream2(writable);
}
__name(closeProgressStep2, "closeProgressStep");
async function populateProjectionsStep(comprehension, dbUrl) {
  let count = 0;
  await withPgClient2(dbUrl, async (db) => {
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
  await withPgClient2(dbUrl, async (db) => {
    for (const sheet of comprehension.sheets) {
      const slug = `sheet-${normalizeSlug(sheet.tabName)}`;
      const blocks = SHEET_CATEGORY_BLOCKS[sheet.category] ?? SHEET_CATEGORY_BLOCKS.other;
      const pageRows = await queryRows2(db, `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug)
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
    const excelFolder = await queryRows2(db, `SELECT id FROM navigation_items WHERE title = $1 AND parent_id IS NULL LIMIT 1`, [
      "Excel"
    ]);
    let excelId = excelFolder[0]?.id;
    if (!excelId) {
      const created2 = await queryRows2(db, `INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, required_groups, is_visible, is_dynamic)
         VALUES (gen_random_uuid()::TEXT, NULL, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM navigation_items WHERE parent_id IS NULL),
         'Excel', '/excel', 'Folder', CAST('google' AS "AuthTier"), 'viewer,ops-admin,finance,platform-admin', true, true)
         RETURNING id`);
      excelId = created2[0]?.id;
    }
    if (excelId) {
      let navSort = 0;
      for (const sheet of comprehension.sheets) {
        const slug = `sheet-${normalizeSlug(sheet.tabName)}`;
        const existing = await queryRows2(db, `SELECT id FROM navigation_items WHERE path = $1 AND parent_id = $2 LIMIT 1`, [
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
  await withPgClient2(dbUrl, async (db) => {
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
  await withPgClient2(dbUrl, async (db) => {
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
  await withPgClient2(dbUrl, async (db) => {
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
    await withPgClient2(dbUrl, async (db) => {
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
registerStepFunction4("step//./workflows/workbook-ingest/steps//loadWorkbookStep", loadWorkbookStep);
registerStepFunction4("step//./workflows/workbook-ingest/steps//extractSheetsStep", extractSheetsStep);
registerStepFunction4("step//./workflows/workbook-ingest/steps//analyzeSheetsStep", analyzeSheetsStep);
registerStepFunction4("step//./workflows/workbook-ingest/steps//saveWorkbookFormulaMapStep", saveWorkbookFormulaMapStep);
registerStepFunction4("step//./workflows/workbook-ingest/steps//comprehendWorkbookStep", comprehendWorkbookStep);
registerStepFunction4("step//./workflows/workbook-ingest/steps//emitProgressStep", emitProgressStep2);
registerStepFunction4("step//./workflows/workbook-ingest/steps//closeProgressStep", closeProgressStep2);
registerStepFunction4("step//./workflows/workbook-ingest/steps//populateProjectionsStep", populateProjectionsStep);
registerStepFunction4("step//./workflows/workbook-ingest/steps//upsertSheetPagesStep", upsertSheetPagesStep);
registerStepFunction4("step//./workflows/workbook-ingest/steps//saveSnippetsStep", saveSnippetsStep);
registerStepFunction4("step//./workflows/workbook-ingest/steps//selectTemplateStep", selectTemplateStep);
registerStepFunction4("step//./workflows/workbook-ingest/steps//registerDynamicPagesStep", registerDynamicPagesStep);
registerStepFunction4("step//./workflows/workbook-ingest/steps//generateBusinessReviewStep", generateBusinessReviewStep);
registerStepFunction4("step//./workflows/workbook-ingest/steps//generateExecutiveSummaryStep", generateExecutiveSummaryStep);
registerStepFunction4("step//./workflows/workbook-ingest/steps//generateDashboardStep", generateDashboardStep);

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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2xpYi9wYWdlLWNhdGFsb2cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL3dvcmtmbG93L3NyYy9pbnRlcm5hbC9idWlsdGlucy50cyIsICIuLi9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL3N0ZGxpYi50cyIsICIuLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMudHMiLCAiLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1nZW5lcmF0b3IudHMiLCAiLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1zY2hlbWEudHMiLCAiLi4vc3JjL2RvbWFpbi9haS9zY2hlbWEtZ2VuZXJhdGlvbi1zY2hlbWEudHMiLCAiLi4vc3JjL2RvbWFpbi9haS96bW9kZWwtY29tcGlsZXIudHMiLCAiLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1jb21waWxlci50cyIsICIuLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLW1hdGVyaWFsaXplci50cyIsICIuLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvcHJvZ3Jlc3MudHMiLCAiLi4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL2RiLnRzIiwgIi4uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMudHMiLCAiLi4vc3JjL2RvbWFpbi9haS13b3JrYm9vay9leHRyYWN0LXNoZWV0cy50cyIsICIuLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL3NoZWV0LWFuYWx5c2lzLnRzIiwgIi4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svY29tcHJlaGVuZC50cyIsICIuLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3Byb2dyZXNzLnRzIiwgIi4uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3QvZGIudHMiLCAiLi4vc3JjL2xpYi93b3JrYm9vay1mb3JtdWxhcy50cyIsICIuLi9zcmMvbGliL2V4Y2VsLWZvcm11bGEudHMiLCAiLi4vc3JjL2xpYi93b3JrYm9vay1tYXBwaW5nLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvYnVpbGRlcnMvc3JjL3NlcmRlLWNoZWNrZXIudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9ydW50aW1lLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvd29ya2Zsb3cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9ydW50aW1lL3Jlc3VtZS1ob29rLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIENvZGUtZmlyc3QgcGFnZSBjYXRhbG9nIFx1MjAxNCBydW50aW1lIFNTb1QgYXQgTVZQLlxuICogU3VwcG9ydHMgc3RhdGljIGNhdGFsb2cgZW50cmllcyBhbmQgZHluYW1pY2FsbHkgcmVnaXN0ZXJlZCBwYWdlc1xuICogKGUuZy4gZnJvbSB3b3JrYm9vayBhbmFseXNpcyBhZnRlciBhbiBFeGNlbCB1cGxvYWQpLlxuICpcbiAqIERCIEFwcFBhZ2UvUGFnZVNlY3Rpb24gc2VlZGVkIGluIFA2OyBjYXRhbG9nIHdpbnMgYXQgcnVudGltZS5cbiAqLyAvKiogUGFydHMgZnJvbSB0aGUgdXBsb2FkZWQgQnVzaW5lc3MgUmV2aWV3IFx1MjAxNCBwb3B1bGF0ZWQgZHluYW1pY2FsbHkgYXQgcmVuZGVyIHRpbWUuICovIC8qKiBTdGF0aWMgcGFydHMgQVx1MjAxM0cgZXhpc3QgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aCBsZWdhY3kgc2VlZGVkIGRvY3MuIER5bmFtaWMgcGFydHMgb3ZlcnJpZGUgdGhlc2UuICovIGNvbnN0IFNUQVRJQ19QQVJUUyA9IHtcbiAgICAncGFydC1hJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtYScsXG4gICAgICAgIHBhcnRLZXk6ICdBJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEE6IEN1cnJlbnQgU2l0dWF0aW9uIFx1MjAxNCBUaGUgTnVtYmVycycsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtYic6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWInLFxuICAgICAgICBwYXJ0S2V5OiAnQicsXG4gICAgICAgIHRpdGxlOiAnUGFydCBCOiBUaGUgMTAtWWVhciBHcm93dGggTW9kZWwnLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWMnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1jJyxcbiAgICAgICAgcGFydEtleTogJ0MnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgQzogUmV2ZW51ZSBPcHRpbWl6YXRpb24gU3RyYXRlZ3knLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWQnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1kJyxcbiAgICAgICAgcGFydEtleTogJ0QnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRDogQ29zdCBNYW5hZ2VtZW50JyxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnXG4gICAgfSxcbiAgICAncGFydC1lJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtZScsXG4gICAgICAgIHBhcnRLZXk6ICdFJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEU6IFJpc2sgUmVnaXN0ZXInLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWYnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1mJyxcbiAgICAgICAgcGFydEtleTogJ0YnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRjogU3RhcldPUkxEIE1lbWJlcnNoaXAgUHJvZ3JhbScsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtZyc6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWcnLFxuICAgICAgICBwYXJ0S2V5OiAnRycsXG4gICAgICAgIHRpdGxlOiAnUGFydCBHOiBJbW1lZGlhdGUgQWN0aW9ucyAoTmV4dCAzMCBEYXlzKScsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH1cbn07XG4vKiogRHluYW1pYyBwYXJ0cyBwb3B1bGF0ZWQgZnJvbSBwYXJzZWQgQnVzaW5lc3MgUmV2aWV3IE1EIHVwbG9hZGVkIHZpYSAvY29uZmlnLiAqLyBsZXQgRFlOQU1JQ19QQVJUUyA9IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIHNldER5bmFtaWNSZXZpZXdQYXJ0cyhwYXJ0cykge1xuICAgIERZTkFNSUNfUEFSVFMgPSBPYmplY3QuZnJvbUVudHJpZXMocGFydHMubWFwKChwKT0+W1xuICAgICAgICAgICAgcC5wYXJ0U2x1ZyxcbiAgICAgICAgICAgIHBcbiAgICAgICAgXSkpO1xufVxuLyoqXG4gKiBEeW5hbWljIGdldHRlciB0aGF0IG1lcmdlcyBzdGF0aWMgKyBhbnkgcnVudGltZS1yZWdpc3RlcmVkIHBhcnRzLlxuICogVXNlIGluc3RlYWQgb2YgUkVWSUVXX1BBUlRfQ0FUQUxPRyBzbyB0aGF0IHNldER5bmFtaWNSZXZpZXdQYXJ0cygpIGNhbGxzXG4gKiBhcmUgcmVmbGVjdGVkIGltbWVkaWF0ZWx5LlxuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5TVEFUSUNfUEFSVFMsXG4gICAgICAgIC4uLkRZTkFNSUNfUEFSVFNcbiAgICB9O1xufVxuLyoqIEBkZXByZWNhdGVkIFVzZSBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpIFx1MjAxNCB0aGlzIGNvbnN0IGlzIGZyb3plbiBhdCBtb2R1bGUgbG9hZCB0aW1lLiAqLyBleHBvcnQgY29uc3QgUkVWSUVXX1BBUlRfQ0FUQUxPRyA9IHtcbiAgICAuLi5TVEFUSUNfUEFSVFMsXG4gICAgLi4uRFlOQU1JQ19QQVJUU1xufTtcbi8qKiBEeW5hbWljIHBhZ2VzIHJlZ2lzdGVyZWQgYXQgcnVudGltZSAoZS5nLiBmcm9tIHdvcmtib29rIGFuYWx5c2lzIGFmdGVyIHJlc2VlZCkuICovIGxldCBEWU5BTUlDX1BBR0VTID0ge307XG4vKipcbiAqIFJlZ2lzdGVyIGR5bmFtaWNhbGx5IGdlbmVyYXRlZCBwYWdlcyBcdTIwMTQgY2FsbGVkIGFmdGVyIHdvcmtib29rIGFuYWx5c2lzXG4gKiBkdXJpbmcgdGhlIHJlc2VlZCBwaXBlbGluZSBzbyBzaGVldC1kZXJpdmVkIGFuYWx5dGljcyBwYWdlcyBhcHBlYXIgaW4gdGhlIG5hdi5cbiAqLyBleHBvcnQgZnVuY3Rpb24gc2V0RHluYW1pY1BhZ2VzKHBhZ2VzKSB7XG4gICAgRFlOQU1JQ19QQUdFUyA9IE9iamVjdC5mcm9tRW50cmllcyhwYWdlcy5tYXAoKHApPT5bXG4gICAgICAgICAgICBwLnNsdWcsXG4gICAgICAgICAgICBwXG4gICAgICAgIF0pKTtcbn1cbi8qKiBDb21iaW5lZCBzdGF0aWMgKyBkeW5hbWljIHBhZ2UgY2F0YWxvZyAoZXZhbHVhdGVkIGxhemlseSBzbyBkeW5hbWljIHBhZ2VzIGFyZSBpbmNsdWRlZCkuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRGdWxsQ2F0YWxvZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5QQUdFX0NBVEFMT0csXG4gICAgICAgIC4uLkRZTkFNSUNfUEFHRVNcbiAgICB9O1xufVxuZXhwb3J0IGNvbnN0IFBBR0VfQ0FUQUxPRyA9IHtcbiAgICBob21lOiB7XG4gICAgICAgIHNsdWc6ICdob21lJyxcbiAgICAgICAgdGl0bGU6ICdIb21lJyxcbiAgICAgICAgbmF2TGFiZWw6ICdIb21lJyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnaGVybycsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnV2VsY29tZScsXG4gICAgICAgICAgICAgICAgICAgIHN1YnRpdGxlOiAnWW91ciBidXNpbmVzcyBhcHBsaWNhdGlvbiBcdTIwMTQgY29uZmlndXJlIHBhZ2VzLCBkYXRhIGFuZCBicmFuZGluZyBmcm9tIHRoZSBBZG1pbiBhcmVhLicsXG4gICAgICAgICAgICAgICAgICAgIG1pblRpZXI6ICdwdWJsaWMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICBkYXNoYm9hcmQ6IHtcbiAgICAgICAgc2x1ZzogJ2Rhc2hib2FyZCcsXG4gICAgICAgIHRpdGxlOiAnRGFzaGJvYXJkJyxcbiAgICAgICAgbmF2TGFiZWw6ICdEYXNoYm9hcmQnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncHVibGljJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdoZXJvJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2U6ICdKdWx5IDIwMjYgXHUwMEI3IEV4aXQgVmlhYmlsaXR5IFJldmlldycsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnQnVzaW5lc3MgUmV2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgc3VidGl0bGU6ICdFeGl0LXZpYWJpbGl0eSBhc3Nlc3NtZW50IGZvciBQVCBUYW1hbiBCaW50YW5nIEJhbGkgXHUyMDE0IHJldmVudWUgdW5kZXIgcHJlc3N1cmUsIG1hcmdpbiBlcm9zaW9uIGRldGVjdGVkLCBzaGFyZWhvbGRlciBzZWVraW5nIHBhdGh3YXkgb3V0LicsXG4gICAgICAgICAgICAgICAgICAgIG1pblRpZXI6ICdwdWJsaWMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIC8vICAgY29uZmlnOiB7IHZhcmlhbnQ6ICdkYXNoYm9hcmQnLCBzY2VuYXJpbzogJ2NvbnNlcnZhdGl2ZScsIG1pblRpZXI6ICdnb29nbGUnIH0sXG4gICAgICAgICAgICAvLyB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2FjdGlvbl9jaGVja2xpc3QnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAncGluJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnbWV0cmljX2dyaWQnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAnZ29vZ2xlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnbGV2ZXJfYWNjb3JkaW9uJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdUaGUgNSBMZXZlcnMnLFxuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAnZ29vZ2xlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgc3VtbWFyeToge1xuICAgICAgICBzbHVnOiAnc3VtbWFyeScsXG4gICAgICAgIHRpdGxlOiAnRXhlY3V0aXZlIFN1bW1hcnknLFxuICAgICAgICBuYXZMYWJlbDogJ1N1bW1hcnknLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgcGRmRXhwb3J0OiB0cnVlLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ2V4ZWN1dGl2ZS1zdW1tYXJ5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ29wcy1hZG1pbic6IHtcbiAgICAgICAgc2x1ZzogJ29wcy1hZG1pbicsXG4gICAgICAgIHRpdGxlOiAnT3BzIEFkbWluJyxcbiAgICAgICAgbmF2TGFiZWw6ICdPcHMgQWRtaW4nLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgcmVxdWlyZWRHcm91cHM6IFtcbiAgICAgICAgICAgICdvcHMtYWRtaW4nXG4gICAgICAgIF0sXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnb3BzX2FkbWluX3RhYnMnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgcmV2aWV3OiB7XG4gICAgICAgIHNsdWc6ICdyZXZpZXcnLFxuICAgICAgICB0aXRsZTogJ0J1c2luZXNzIFJldmlldycsXG4gICAgICAgIG5hdkxhYmVsOiAnUmV2aWV3JyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZScsXG4gICAgICAgIHBkZkV4cG9ydDogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdyZXZpZXdfYmxvY2tzJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgICdvcHMtdHJhY2tpbmcnOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtdHJhY2tpbmcnLFxuICAgICAgICB0aXRsZTogJ0ZpbmFuY2lhbCBUcmFja2luZycsXG4gICAgICAgIG5hdkxhYmVsOiAnVHJhY2tpbmcnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdrcGlfY2FyZHMnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICB2YXJpYW50OiAnb3BzJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAncmVwb3J0c19yb2xsdXAnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudDogJ29wcydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ3BubF90YWJsZScsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICAnb3BzLWNoYXQnOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtY2hhdCcsXG4gICAgICAgIHRpdGxlOiAnQUkgQ2hhdCcsXG4gICAgICAgIG5hdkxhYmVsOiAnQUkgQ2hhdCcsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXRfcGFuZWwnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgdGFza3M6IHtcbiAgICAgICAgc2x1ZzogJ3Rhc2tzJyxcbiAgICAgICAgdGl0bGU6ICdFeGl0LVZpYWJpbGl0eSBUYXNrcycsXG4gICAgICAgIG5hdkxhYmVsOiAnVGFza3MnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICBhZG1pbjoge1xuICAgICAgICBzbHVnOiAnYWRtaW4nLFxuICAgICAgICB0aXRsZTogJ1BsYXRmb3JtIEFkbWluJyxcbiAgICAgICAgbmF2TGFiZWw6ICdBZG1pbicsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwaW4nLFxuICAgICAgICBzZWN0aW9uczogW11cbiAgICB9LFxuICAgIGNvbmZpZzoge1xuICAgICAgICBzbHVnOiAnY29uZmlnJyxcbiAgICAgICAgdGl0bGU6ICdTb3VyY2UgQ29uZmlnJyxcbiAgICAgICAgbmF2TGFiZWw6ICdDb25maWcnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICAndGVybXMtb2Ytc2VydmljZSc6IHtcbiAgICAgICAgc2x1ZzogJ3Rlcm1zLW9mLXNlcnZpY2UnLFxuICAgICAgICB0aXRsZTogJ1Rlcm1zIG9mIFNlcnZpY2UnLFxuICAgICAgICBzaG93SW5OYXY6IGZhbHNlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnZG9jX21hcmtkb3duJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAndGVybXMtb2Ytc2VydmljZS5odG1sJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ3ByaXZhY3ktcG9saWN5Jzoge1xuICAgICAgICBzbHVnOiAncHJpdmFjeS1wb2xpY3knLFxuICAgICAgICB0aXRsZTogJ1ByaXZhY3kgUG9saWN5JyxcbiAgICAgICAgc2hvd0luTmF2OiBmYWxzZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwdWJsaWMnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ3ByaXZhY3ktcG9saWN5Lmh0bWwnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfVxufTtcbmNvbnN0IFRJRVJfUkFOSyA9IHtcbiAgICBwdWJsaWM6IDAsXG4gICAgcGluOiAxLFxuICAgIGdvb2dsZTogMlxufTtcbmV4cG9ydCBmdW5jdGlvbiB0aWVyQWxsb3dzQWNjZXNzKGN1cnJlbnQsIHJlcXVpcmVkKSB7XG4gICAgcmV0dXJuIFRJRVJfUkFOS1tjdXJyZW50XSA+PSBUSUVSX1JBTktbcmVxdWlyZWRdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxpc3ROYXZQYWdlcyh0aWVyLCBncm91cHMgPSBbXSkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGdldEZ1bGxDYXRhbG9nKCkpLmZpbHRlcigocCk9PnAuc2hvd0luTmF2ICE9PSBmYWxzZSkuZmlsdGVyKChwKT0+dGllckFsbG93c0FjY2Vzcyh0aWVyLCBwLmF1dGhUaWVyKSkuZmlsdGVyKChwKT0+IXAucmVxdWlyZWRHcm91cHMgfHwgcC5yZXF1aXJlZEdyb3Vwcy5sZW5ndGggPT09IDAgfHwgZ3JvdXBzLmluY2x1ZGVzKCdwbGF0Zm9ybS1hZG1pbicpIHx8IHAucmVxdWlyZWRHcm91cHMuc29tZSgoZyk9Pmdyb3Vwcy5pbmNsdWRlcyhnKSkpLnNvcnQoKGEsIGIpPT5hLnRpdGxlLmxvY2FsZUNvbXBhcmUoYi50aXRsZSkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYWdlKHNsdWcpIHtcbiAgICByZXR1cm4gZ2V0RnVsbENhdGFsb2coKVtzbHVnXSA/PyBudWxsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVSZXZpZXdQYXJ0KHBhcnRTbHVnKSB7XG4gICAgcmV0dXJuIGdldFJldmlld1BhcnRDYXRhbG9nKClbcGFydFNsdWddID8/IG51bGw7XG59XG5leHBvcnQgZnVuY3Rpb24gbGlzdFJldmlld1BhcnRzKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGdldFJldmlld1BhcnRDYXRhbG9nKCkpLnNvcnQoKGEsIGIpPT5hLnBhcnRLZXkubG9jYWxlQ29tcGFyZShiLnBhcnRLZXkpKTtcbn1cbi8qKiBEZXNjcmlwdGl2ZSB0aXRsZSB3aXRob3V0IHRoZSBcIlBhcnQgWDogXCIgY2F0YWxvZyBwcmVmaXguICovIGV4cG9ydCBmdW5jdGlvbiBnZXRSZXZpZXdQYXJ0RGlzcGxheVRpdGxlKHRpdGxlKSB7XG4gICAgcmV0dXJuIHRpdGxlLnJlcGxhY2UoL15QYXJ0IFtBLU9dOiAvLCAnJyk7XG59XG4iLCAiLyoqXG4gKiBUaGVzZSBhcmUgdGhlIGJ1aWx0LWluIHN0ZXBzIHRoYXQgYXJlIFwiYXV0b21hdGljYWxseSBhdmFpbGFibGVcIiBpbiB0aGUgd29ya2Zsb3cgc2NvcGUuIFRoZXkgYXJlXG4gKiBzaW1pbGFyIHRvIFwic3RkbGliXCIgZXhjZXB0IHRoYXQgYXJlIG5vdCBtZWFudCB0byBiZSBpbXBvcnRlZCBieSB1c2VycywgYnV0IGFyZSBpbnN0ZWFkIFwianVzdCBhdmFpbGFibGVcIlxuICogYWxvbmdzaWRlIHVzZXIgZGVmaW5lZCBzdGVwcy4gVGhleSBhcmUgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBydW50aW1lXG4gKi9cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV9hcnJheV9idWZmZXIoXG4gIHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZVxuKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmFycmF5QnVmZmVyKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfanNvbih0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2UpIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIHRoaXMuanNvbigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX3RleHQodGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLnRleHQoKTtcbn1cbiIsICIvKipcbiAqIFRoaXMgaXMgdGhlIFwic3RhbmRhcmQgbGlicmFyeVwiIG9mIHN0ZXBzIHRoYXQgd2UgbWFrZSBhdmFpbGFibGUgdG8gYWxsIHdvcmtmbG93IHVzZXJzLlxuICogVGhlIGNhbiBiZSBpbXBvcnRlZCBsaWtlIHNvOiBgaW1wb3J0IHsgZmV0Y2ggfSBmcm9tICd3b3JrZmxvdydgLiBhbmQgdXNlZCBpbiB3b3JrZmxvdy5cbiAqIFRoZSBuZWVkIHRvIGJlIGV4cG9ydGVkIGRpcmVjdGx5IGluIHRoaXMgcGFja2FnZSBhbmQgY2Fubm90IGxpdmUgaW4gYGNvcmVgIHRvIHByZXZlbnRcbiAqIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBwb3N0LWNvbXBpbGF0aW9uLlxuICovXG5cbi8qKlxuICogQSBob2lzdGVkIGBmZXRjaCgpYCBmdW5jdGlvbiB0aGF0IGlzIGV4ZWN1dGVkIGFzIGEgXCJzdGVwXCIgZnVuY3Rpb24sXG4gKiBmb3IgdXNlIHdpdGhpbiB3b3JrZmxvdyBmdW5jdGlvbnMuXG4gKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRmV0Y2hfQVBJXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaCguLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBnbG9iYWxUaGlzLmZldGNoPikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gZ2xvYmFsVGhpcy5mZXRjaCguLi5hcmdzKTtcbn1cbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG4vKipcbiAqIFN0ZXAgZnVuY3Rpb25zIGZvciB0aGUgYXBwLXBhY2stZ2VuZXJhdGUgd29ya2Zsb3cuXG4gKlxuICogRWFjaCBleHBvcnRlZCBhc3luYyBmdW5jdGlvbiB3aXRoIHRoZSBgJ3VzZSBzdGVwJ2AgZGlyZWN0aXZlIGlzIGEgZHVyYWJsZVxuICogc3RlcDogaXRzIGFyZ3MgYW5kIHJlc3VsdCBhcmUgc2VyaWFsaXplZCB0byB0aGUgZXZlbnQgbG9nLCBhbmQgaXQgcmV0cmllc1xuICogYmVmb3JlIHRoZSBlcnJvciBidWJibGVzIHRvIHRoZSB3b3JrZmxvdy5cbiAqLyBpbXBvcnQgeyBGYXRhbEVycm9yIH0gZnJvbSAnd29ya2Zsb3cnO1xuaW1wb3J0IHsgZGVjb21wb3NlUGFja0Zyb21Qcm9tcHQsIGdlbmVyYXRlQXBwRGVmaW5pdGlvbiwgbW9ja0RlY29tcG9zZVBhY2ssIG1vY2tHZW5lcmF0ZUFwcERlZmluaXRpb24gfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLWdlbmVyYXRvcic7XG5pbXBvcnQgeyBjb21waWxlQXBwQXJ0aWZhY3RzIH0gZnJvbSAnLi4vLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1jb21waWxlcic7XG5pbXBvcnQgeyBtYXRlcmlhbGl6ZUFwcFBhY2sgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLW1hdGVyaWFsaXplcic7XG5pbXBvcnQgeyB3cml0ZVByb2dyZXNzQ2h1bmssIGNsb3NlUHJvZ3Jlc3NTdHJlYW0gfSBmcm9tICcuL3Byb2dyZXNzJztcbmltcG9ydCB7IHdpdGhQZ0NsaWVudCwgcXVlcnlSb3dzIH0gZnJvbSAnLi9kYic7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wid29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLnRzXCI6e1wiY2xvc2VQcm9ncmVzc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9jbG9zZVByb2dyZXNzU3RlcFwifSxcImNvbXBpbGVBcHBQYWNrU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2NvbXBpbGVBcHBQYWNrU3RlcFwifSxcImRlY29tcG9zZVBhY2tTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vZGVjb21wb3NlUGFja1N0ZXBcIn0sXCJlbWl0UHJvZ3Jlc3NTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vZW1pdFByb2dyZXNzU3RlcFwifSxcImdlbmVyYXRlQXBwU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2dlbmVyYXRlQXBwU3RlcFwifSxcImxvYWRLbm93bGVkZ2VCYXNlU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2xvYWRLbm93bGVkZ2VCYXNlU3RlcFwifSxcIm1hdGVyaWFsaXplQXBwUGFja1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9tYXRlcmlhbGl6ZUFwcFBhY2tTdGVwXCJ9fX19Ki87XG4vKiogRGV0ZXJtaW5pc3RpYyBmYWxsYmFjayBwYWNrIGlkIGlmIHRoZSByb3V0ZSBkaWRuJ3Qgc3VwcGx5IG9uZS4gKi8gZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRQYWNrSWQocHJvbXB0KSB7XG4gICAgcmV0dXJuIGBwYWNrLSR7cHJvbXB0LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpLnJlcGxhY2UoL14tK3wtKyQvZywgJycpLnNsaWNlKDAsIDMyKSB8fCAnY3VzdG9tJ31gO1xufVxuLyoqXG4gKiBTdGFnZSAxOiBkZWNvbXBvc2UgdGhlIGFkbWluJ3MgcmVxdWlyZW1lbnQgaW50byBwZXItZGVwYXJ0bWVudCBhcHAgYnJpZWZzLlxuICogRGV0ZXJtaW5pc3RpYyBpbiBtb2NrIG1vZGUuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY29tcG9zZVBhY2tTdGVwKGlucHV0KSB7XG4gICAgaWYgKGlucHV0Lm1vY2spIHtcbiAgICAgICAgcmV0dXJuIG1vY2tEZWNvbXBvc2VQYWNrKCk7XG4gICAgfVxuICAgIC8vIEtub3dsZWRnZSBncm91bmRpbmcgaXMgbG9hZGVkIHNlcGFyYXRlbHkgKGxvYWRLbm93bGVkZ2VCYXNlU3RlcCk7IHRoZVxuICAgIC8vIGdlbmVyYXRvciBjYWxsIGlzIHdyYXBwZWQgc28gc3RlcCByZXRyaWVzIGFyZSBzYWZlLlxuICAgIGNvbnN0IGRlY29tcG9zaXRpb24gPSBhd2FpdCBkZWNvbXBvc2VQYWNrRnJvbVByb21wdChpbnB1dC5wcm9tcHQpO1xuICAgIGlmICghZGVjb21wb3NpdGlvbi5hcHBzLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcignQUkgZGVjb21wb3NpdGlvbiByZXR1cm5lZCB6ZXJvIGFwcHMgXHUyMDE0IHBsZWFzZSByZXBocmFzZSB0aGUgcmVxdWlyZW1lbnQuJyk7XG4gICAgfVxuICAgIHJldHVybiBkZWNvbXBvc2l0aW9uO1xufVxuLyoqIExvYWQga25vd2xlZGdlIHNuaXBwZXRzIGZyb20gdGhlIHRlbmFudCBEQiB0byBncm91bmQgdGhlIGdlbmVyYXRpb24uICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkS25vd2xlZGdlQmFzZVN0ZXAoZGJVcmwpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgICAgICBjb25zdCByb3dzID0gYXdhaXQgcXVlcnlSb3dzKGRiLCBgU0VMRUNUIGtleSwgY29udGVudCwgY2F0ZWdvcnkgRlJPTSBrbm93bGVkZ2Vfc25pcHBldHMgT1JERVIgQlkgY2F0ZWdvcnksIGtleSBMSU1JVCAyMDA7YCk7XG4gICAgICAgICAgICBpZiAoIXJvd3MubGVuZ3RoKSByZXR1cm4gJyc7XG4gICAgICAgICAgICByZXR1cm4gcm93cy5tYXAoKHIpPT5gWyR7ci5jYXRlZ29yeX1dICR7ci5rZXl9OlxcbiR7ci5jb250ZW50LnNsaWNlKDAsIDIwMDApfWApLmpvaW4oJ1xcblxcbi0tLVxcblxcbicpO1xuICAgICAgICB9KTtcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIC8vIEtub3dsZWRnZSBncm91bmRpbmcgaXMgYmVzdC1lZmZvcnQ7IGdlbmVyYXRpb24gc3RpbGwgd29ya3Mgd2l0aG91dCBpdC5cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn1cbi8qKlxuICogU3RhZ2UgMjogZ2VuZXJhdGUgdGhlIGZ1bGwgZGVmaW5pdGlvbiBvZiBvbmUgYXBwIChXMyBzY2hlbWEsIG1vZGVscywgdXNlXG4gKiBjYXNlcywgcGFnZXMsIG5hdiwgVVggd29ya2Zsb3csIGtub3dsZWRnZSBzbmlwcGV0cykuIENFTyBPdmVydmlldyAobGFzdFxuICogYnJpZWYpIGdldHMgdGhlIGRlY29tcG9zaXRpb24ncyBwdXJwb3NlICsgY3Jvc3MtZGVwYXJ0bWVudCBLUElzLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUFwcFN0ZXAoaW5wdXQsIGRlY29tcG9zaXRpb24sIGtub3dsZWRnZUJhc2UsIGluZGV4KSB7XG4gICAgY29uc3QgYiA9IGRlY29tcG9zaXRpb24uYXBwc1tpbmRleF07XG4gICAgaWYgKCFiKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBBcHAgYnJpZWYgYXQgaW5kZXggJHtpbmRleH0gbWlzc2luZyBmcm9tIGRlY29tcG9zaXRpb24uYCk7XG4gICAgfVxuICAgIGNvbnN0IGlzQ2VvID0gaW5kZXggPT09IGRlY29tcG9zaXRpb24uYXBwcy5sZW5ndGggLSAxO1xuICAgIGlmIChpbnB1dC5tb2NrKSB7XG4gICAgICAgIHJldHVybiBtb2NrR2VuZXJhdGVBcHBEZWZpbml0aW9uKGIpO1xuICAgIH1cbiAgICByZXR1cm4gZ2VuZXJhdGVBcHBEZWZpbml0aW9uKGIsIGlzQ2VvID8gZGVjb21wb3NpdGlvbi5jZW9PdmVydmlldy5wdXJwb3NlIDogJycsIGlzQ2VvID8gZGVjb21wb3NpdGlvbi5jZW9PdmVydmlldy5rcGlzIDogW10sIGRlY29tcG9zaXRpb24uYXBwcywga25vd2xlZGdlQmFzZSk7XG59XG4vKiogU3RhZ2UgMzogZGV0ZXJtaW5pc3RpYyBjb21waWxhdGlvbiBvZiBkZWZpbml0aW9ucyBcdTIxOTIgYXJ0aWZhY3RzICsgREIgcm93cy4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXBpbGVBcHBQYWNrU3RlcChkZWNvbXBvc2l0aW9uLCBkZWZpbml0aW9ucykge1xuICAgIHJldHVybiBkZWZpbml0aW9ucy5tYXAoKGRlZik9PmNvbXBpbGVBcHBBcnRpZmFjdHMoZGVmKSk7XG59XG4vKiogU3RhZ2UgNDogcGVyc2lzdCBwYWdlcy9uYXYvc25pcHBldHMvc2VjdXJpdHkgZ3JvdXBzIGludG8gdGhlIHRlbmFudCBEQi4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1hdGVyaWFsaXplQXBwUGFja1N0ZXAoaW5wdXQsIGRlY29tcG9zaXRpb24sIGRlZmluaXRpb25zLCBhcnRpZmFjdHMpIHtcbiAgICBjb25zdCBwYWNrSWQgPSBpbnB1dC5wYWNrSWQgPz8gZGVmYXVsdFBhY2tJZChpbnB1dC5wcm9tcHQpO1xuICAgIGNvbnN0IG1hdGVyaWFsaXplSW5wdXQgPSB7XG4gICAgICAgIHBhY2tJZCxcbiAgICAgICAgdGVuYW50U2x1ZzogaW5wdXQudGVuYW50U2x1ZyxcbiAgICAgICAgZGVjb21wb3NpdGlvbixcbiAgICAgICAgYXBwczogYXJ0aWZhY3RzLFxuICAgICAgICBkZWZpbml0aW9uc1xuICAgIH07XG4gICAgcmV0dXJuIHdpdGhQZ0NsaWVudChpbnB1dC5kYlVybCwgKGRiKT0+bWF0ZXJpYWxpemVBcHBQYWNrKGRiLCBtYXRlcmlhbGl6ZUlucHV0KSk7XG59XG4vKiogRW1pdCBvbmUgcHJvZ3Jlc3MgY2h1bmsgZnJvbSBhIHN0ZXAgY29udGV4dC4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVtaXRQcm9ncmVzc1N0ZXAod3JpdGFibGUsIGNodW5rKSB7XG4gICAgYXdhaXQgd3JpdGVQcm9ncmVzc0NodW5rKHdyaXRhYmxlLCBjaHVuayk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0ZXAod3JpdGFibGUpIHtcbiAgICBhd2FpdCBjbG9zZVByb2dyZXNzU3RyZWFtKHdyaXRhYmxlKTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2RlY29tcG9zZVBhY2tTdGVwXCIsIGRlY29tcG9zZVBhY2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2xvYWRLbm93bGVkZ2VCYXNlU3RlcFwiLCBsb2FkS25vd2xlZGdlQmFzZVN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vZ2VuZXJhdGVBcHBTdGVwXCIsIGdlbmVyYXRlQXBwU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9jb21waWxlQXBwUGFja1N0ZXBcIiwgY29tcGlsZUFwcFBhY2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL21hdGVyaWFsaXplQXBwUGFja1N0ZXBcIiwgbWF0ZXJpYWxpemVBcHBQYWNrU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9lbWl0UHJvZ3Jlc3NTdGVwXCIsIGVtaXRQcm9ncmVzc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vY2xvc2VQcm9ncmVzc1N0ZXBcIiwgY2xvc2VQcm9ncmVzc1N0ZXApO1xuIiwgIi8qKlxuICogQXBwIFBhY2sgXHUyMDE0IEFJIEdlbmVyYXRvclxuICpcbiAqIFR3by1zdGFnZSBBSSBnZW5lcmF0aW9uIHVzaW5nIHRoZSBWZXJjZWwgQUkgU0RLIGBnZW5lcmF0ZU9iamVjdCgpYDpcbiAqXG4gKiAgIFN0YWdlIDEgXHUyMDE0IERFQ09NUE9TRTogdGhlIHBsYXRmb3JtIGFkbWluJ3MgcmVxdWlyZW1lbnQgaXMgdHVybmVkIGludG8gYVxuICogICAgICAgICAgICAgc3RydWN0dXJlZCBwYWNrIGRlZmluaXRpb24gKGFwcHMgcGVyIGRlcGFydG1lbnQgKyBDRU8gb3ZlcnZpZXcpLlxuICogICBTdGFnZSAyIFx1MjAxNCBHRU5FUkFURSAocGVyIGFwcCk6IGVhY2ggZGVwYXJ0bWVudCBhcHAgZ2V0cyBhIGZ1bGwgZGVmaW5pdGlvbjpcbiAqICAgICAgICAgICAgIFczQy1hbGlnbmVkIG1vZGVscywgdXNlIGNhc2VzLCBwYWdlcywgbmF2LCBVWCB3b3JrZmxvdyBhbmRcbiAqICAgICAgICAgICAgIGtub3dsZWRnZSBzbmlwcGV0cyBcdTIwMTQgZ3JvdW5kZWQgaW4gdGhlIHBsYXRmb3JtIGtub3dsZWRnZSBiYXNlIGFuZFxuICogICAgICAgICAgICAgdGhlIFczQyBYU0Qgc3RhbmRhcmQgZm9yIGl0cyB0ZW1wbGF0ZS5cbiAqXG4gKiBgbW9jaypgIHZhcmlhbnRzIHJldHVybiBkZXRlcm1pbmlzdGljIHJlc3VsdHMgZm9yIHRlc3Rpbmcgd2l0aG91dCBhbiBBSSBrZXkuXG4gKi8gaW1wb3J0IHsgZ2VuZXJhdGVPYmplY3QgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyBhcHBQYWNrRGVjb21wb3NpdGlvblpvZCwgYXBwUGFja0FwcERlZmluaXRpb25ab2QgfSBmcm9tICcuL2FwcC1wYWNrLXNjaGVtYSc7XG4vLyBcdTI1MDBcdTI1MDAgVzNDIFhTRCBTdGFuZGFyZHMgKyBzY2hlbWEub3JnIHR5cGVzIHBlciB0ZW1wbGF0ZSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmNvbnN0IFczQ19TVEFOREFSRFMgPSB7XG4gICAgJ2ZpbmFuY2lhbC1hbmFseXRpY3MnOiAnRnBNTCAoRmluYW5jaWFsIFByb2R1Y3RzIE1hcmt1cCBMYW5ndWFnZSkgZm9yIGRlcml2YXRpdmVzIGFuZCBGSVhNTCBmb3IgcmVhbC10aW1lIGZpbmFuY2lhbCBpbmZvcm1hdGlvbiBleGNoYW5nZScsXG4gICAgcmVzdGF1cmFudDogJ1VCTCAoVW5pdmVyc2FsIEJ1c2luZXNzIExhbmd1YWdlKSBmb3IgaW52b2ljZXMvb3JkZXJzIGFuZCBHUzEgZm9yIHByb2R1Y3QvU0tVIGRhdGEnLFxuICAgIGhvdGVsOiAnT1RBIChPcGVuVHJhdmVsIEFsbGlhbmNlKSBmb3Igcm9vbSBib29raW5ncyBhbmQgYXZhaWxhYmlsaXR5JyxcbiAgICAnZWNvbW1lcmNlLXJldGFpbCc6ICdVQkwgZm9yIGVsZWN0cm9uaWMgb3JkZXJzIGFuZCBJbnZlbnRvcnkgRmVlZHMgZm9yIFNLVS9wcmljaW5nIGNvbnN0cmFpbnRzJyxcbiAgICBoZWFsdGhjYXJlOiAnSEw3L0NEQSBmb3IgZWxlY3Ryb25pYyBoZWFsdGggcmVjb3JkcyBhbmQgY2xhaW1zIHByb2Nlc3NpbmcgdmFsaWRhdGlvbicsXG4gICAgJ3N1cHBseS1jaGFpbic6ICdVQkwgZm9yIHNoaXBwaW5nIG5vdGljZXMgYW5kIEIyQiBsb2dpc3RpY3MgbWFuaWZlc3QgZG9jdW1lbnRzJyxcbiAgICAncmVhbC1lc3RhdGUnOiAnUkVUUyAoUmVhbCBFc3RhdGUgVHJhbnNhY3Rpb24gU3RhbmRhcmQpIGZvciBwcm9wZXJ0eSBsaXN0aW5ncycsXG4gICAgZWR1Y2F0aW9uOiAnSU1TIEdsb2JhbCAoTFRJLCBRVEkpIGZvciBsZWFybmluZyB0b29scyBpbnRlcm9wZXJhYmlsaXR5IGFuZCBhc3Nlc3NtZW50JyxcbiAgICAncHJvZmVzc2lvbmFsLXNlcnZpY2VzJzogJ1VCTCBmb3IgYmlsbGluZy9pbnZvaWNlcyBhbmQgcHJvamVjdCBtYW5hZ2VtZW50IGRhdGEnLFxuICAgIG1hbnVmYWN0dXJpbmc6ICdCMk1NTCAoQnVzaW5lc3MgVG8gTWFudWZhY3R1cmluZyBNYXJrdXAgTGFuZ3VhZ2UpIGZvciBwcm9kdWN0aW9uIGRhdGEnXG59O1xuY29uc3QgU0NIRU1BX09SR19UWVBFUyA9IHtcbiAgICAnZmluYW5jaWFsLWFuYWx5dGljcyc6ICdGaW5hbmNpYWxTZXJ2aWNlJyxcbiAgICByZXN0YXVyYW50OiAnUmVzdGF1cmFudCcsXG4gICAgaG90ZWw6ICdIb3RlbCcsXG4gICAgJ2Vjb21tZXJjZS1yZXRhaWwnOiAnU3RvcmUnLFxuICAgIGhlYWx0aGNhcmU6ICdNZWRpY2FsT3JnYW5pemF0aW9uJyxcbiAgICAnc3VwcGx5LWNoYWluJzogJ0RlbGl2ZXJ5RXZlbnQnLFxuICAgICdyZWFsLWVzdGF0ZSc6ICdSZWFsRXN0YXRlQWdlbnQnLFxuICAgIGVkdWNhdGlvbjogJ0VkdWNhdGlvbmFsT3JnYW5pemF0aW9uJyxcbiAgICAncHJvZmVzc2lvbmFsLXNlcnZpY2VzJzogJ1Byb2Zlc3Npb25hbFNlcnZpY2UnLFxuICAgIG1hbnVmYWN0dXJpbmc6ICdNYW51ZmFjdHVyZXInXG59O1xuLy8gTk9URTogbXVzdCBzdGF5IGEgc3Vic2V0IG9mIHRoZSBaZW5TdGFjayBCbG9ja1R5cGUgZW51bSBpblxuLy8gemVuc3RhY2svc2NoZW1hLnptb2RlbCBcdTIwMTQgZHluYW1pY19mb3JtIGlzIE5PVCBhIHZhbGlkIGVudW0gdmFsdWUsIHNvIG1vZGVsXG4vLyBDUlVEIHN1cmZhY2VzIGFyZSBleHByZXNzZWQgd2l0aCBvcHNfYWRtaW5fdGFicyAvIGRvY19tYXJrZG93biBpbnN0ZWFkLlxuY29uc3QgQVZBSUxBQkxFX0JMT0NLUyA9IFtcbiAgICAnaGVybycsXG4gICAgJ2twaV9jYXJkcycsXG4gICAgJ21ldHJpY19ncmlkJyxcbiAgICAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAnbGV2ZXJfYWNjb3JkaW9uJyxcbiAgICAnYWN0aW9uX2NoZWNrbGlzdCcsXG4gICAgJ2RvY19tYXJrZG93bicsXG4gICAgJ3BubF90YWJsZScsXG4gICAgJ29wc19hZG1pbl90YWJzJyxcbiAgICAnel9yZXBvcnRfZm9ybScsXG4gICAgJ2Nvc3RzX2Zvcm0nLFxuICAgICdjYWxlbmRhcl9pbXBvcnQnLFxuICAgICdjaGF0X3BhbmVsJyxcbiAgICAncmV2aWV3X2Jsb2NrcycsXG4gICAgJ3JlcG9ydHNfcm9sbHVwJyxcbiAgICAnc2hlZXRfdmlld2VyJ1xuXTtcbmNvbnN0IEFVVEhfVElFUlMgPSBbXG4gICAgJ3B1YmxpYycsXG4gICAgJ3BpbicsXG4gICAgJ2dvb2dsZSdcbl07XG5jb25zdCBNT0RFTCA9ICdncHQtNS41Jztcbi8vIFx1MjUwMFx1MjUwMCBTdGFnZSAxOiBkZWNvbXBvc2UgdGhlIHJlcXVpcmVtZW50IGludG8gYXBwcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmZ1bmN0aW9uIGJ1aWxkRGVjb21wb3NlU3lzdGVtUHJvbXB0KF9rbm93bGVkZ2VCYXNlKSB7XG4gICAgcmV0dXJuIGBZb3UgYXJlIHRoZSBjaGllZiBzb2x1dGlvbiBhcmNoaXRlY3Qgb2YgYSB0ZW5hbnQgYXBwbGljYXRpb24gcGxhdGZvcm0uXG5cbkEgcGxhdGZvcm0gYWRtaW5pc3RyYXRvciB3aWxsIGRlc2NyaWJlIGEgYnVzaW5lc3MgbmVlZC4gRGVjb21wb3NlIGl0IGludG8gYVxuY29oZXJlbnQgXCJhcHBsaWNhdGlvbiBwYWNrXCI6IG9uZSBhcHBsaWNhdGlvbiBwZXIgYnVzaW5lc3MgZGVwYXJ0bWVudCwgcGx1cyBhXG5DRU8gT3ZlcnZpZXcgYXBwbGljYXRpb24gdGhhdCBzcGFucyBhbGwgb2YgdGhlbS5cblxuIyMgUnVsZXNcblxuMS4gKipBcHBzIHBlciBkZXBhcnRtZW50Kio6IENyZWF0ZSBvbmUgYXBwIGZvciBldmVyeSBkaXN0aW5jdCBkZXBhcnRtZW50IGluIHRoZVxuICAgcmVxdWlyZW1lbnQgKGUuZy4gSFIsIE1hcmtldGluZy9NZW1iZXJzaGlwcywgU2FsZXMgUmVwb3J0aW5nLCBFY29tbWVyY2VcbiAgIE1hcmtldHBsYWNlLCBSZWZlcnJhbHMgTWFuYWdlbWVudCwgQmFjayBPZmZpY2UgUmVwb3J0aW5nLCBMZWdhbCBBZGhlcmVuY2UsXG4gICBGaW5hbmNlL1JlcG9ydGluZy9UcmFja2luZywgQmFjayBPZmZpY2UgTWFuYWdlbWVudCwgQ29tcGxpYW5jZSwgQ0VPIE92ZXJ2aWV3KS5cbiAgIElmIHRoZSByZXF1aXJlbWVudCBuYW1lcyBkZXBhcnRtZW50cyBleHBsaWNpdGx5LCBjb3ZlciBBTEwgb2YgdGhlbS5cbjIuICoqQXBwIGlkcyoqOiBrZWJhYi1jYXNlLCBzaG9ydCAoZS5nLiBcImhyXCIsIFwic2FsZXMtcmVwb3J0aW5nXCIsIFwiY2VvLW92ZXJ2aWV3XCIpLlxuMy4gKip0ZW1wbGF0ZUlkKio6IHBpY2sgdGhlIGJlc3QgZml0IGZyb20gdGhlIHRlbXBsYXRlIGNhdGFsb2c6XG4gICAke09iamVjdC5rZXlzKFczQ19TVEFOREFSRFMpLmpvaW4oJywgJyl9XG4gICBDRU8gT3ZlcnZpZXcgc2hvdWxkIHVzZSBcImZpbmFuY2lhbC1hbmFseXRpY3NcIiAoaXQgZHJpdmVzIHRyYW5zcGFyZW5jeSxcbiAgIGluc2lnaHQgYW5kIHJlYWx0aW1lIGFjdGlvbmFibGUgaXRlbXMgZnJvbSBldmVyeSBkZXBhcnRtZW50KS5cbjQuICoqQ0VPIE92ZXJ2aWV3IGFwcCoqOiBNVVNUIGJlIGluY2x1ZGVkIGFzIHRoZSBsYXN0IGFwcC4gSXRzIHN1bW1hcnkgbXVzdFxuICAgc3RhdGUgdGhhdCBpdCBoYXMgYWNjZXNzIHRvIGV2ZXJ5IGRlcGFydG1lbnQgYXBwJ3Mga25vd2xlZGdlIGJhc2UgYW5kXG4gICBzdXJmYWNlcyBjcm9zcy1kZXBhcnRtZW50IEtQSXMsIHRyYW5zcGFyZW5jeSwgZWZmaWNpZW5jeSBhbmQgYWN0aW9uYWJsZVxuICAgaW5zaWdodHMuXG41LiAqKkNvdmVyYWdlKio6IFRoZSBhcHBzIG11c3QgdG9nZXRoZXIgY292ZXIgdGhlIGNvbXBsZXRlIHJlcXVpcmVtZW50IFx1MjAxNCBub1xuICAgZGVwYXJ0bWVudCBtZW50aW9uZWQgaW4gdGhlIHJlcXVpcmVtZW50IG1heSBiZSBtaXNzaW5nLlxuNi4gKipQYWNrIGlkcyoqOiBrZWJhYi1jYXNlLCBlLmcuIFwib3BzLWRlcGFydG1lbnQtcGFja1wiLlxuXG4jIyBPdXRwdXRcblxuUmV0dXJuIHRoZSBwYWNrIGRlY29tcG9zaXRpb246IGlkLCBuYW1lLCBkZXNjcmlwdGlvbiwgcGVyLWFwcCBicmllZnMgYW5kIHRoZVxuQ0VPIG92ZXJ2aWV3IHB1cnBvc2UgKyBLUElzLmA7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjb21wb3NlUGFja0Zyb21Qcm9tcHQodXNlclByb21wdCwga25vd2xlZGdlQmFzZSkge1xuICAgIGNvbnN0IHsgb2JqZWN0IH0gPSBhd2FpdCBnZW5lcmF0ZU9iamVjdCh7XG4gICAgICAgIG1vZGVsOiBvcGVuYWkoTU9ERUwpLFxuICAgICAgICBzY2hlbWE6IGFwcFBhY2tEZWNvbXBvc2l0aW9uWm9kLFxuICAgICAgICBzeXN0ZW06IGJ1aWxkRGVjb21wb3NlU3lzdGVtUHJvbXB0KGtub3dsZWRnZUJhc2UpLFxuICAgICAgICBwcm9tcHQ6IHVzZXJQcm9tcHQsXG4gICAgICAgIHRlbXBlcmF0dXJlOiAwLjJcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqZWN0O1xufVxuLy8gXHUyNTAwXHUyNTAwIFN0YWdlIDI6IGdlbmVyYXRlIGEgZnVsbCBkZWZpbml0aW9uIGZvciBvbmUgYXBwIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gYnVpbGRBcHBTeXN0ZW1Qcm9tcHQoYnJpZWYsIGNlb1B1cnBvc2UsIGNlb0twaXMsIGFsbEFwcHMsIGtub3dsZWRnZUJhc2UpIHtcbiAgICBjb25zdCB3M2NTdGFuZGFyZCA9IFczQ19TVEFOREFSRFNbYnJpZWYudGVtcGxhdGVJZF0gPz8gJ3NjaGVtYS5vcmcnO1xuICAgIGNvbnN0IHNjaGVtYU9yZ1R5cGUgPSBTQ0hFTUFfT1JHX1RZUEVTW2JyaWVmLnRlbXBsYXRlSWRdID8/ICdMb2NhbEJ1c2luZXNzJztcbiAgICByZXR1cm4gYFlvdSBhcmUgYSBXM0Mgc2NoZW1hIGFyY2hpdGVjdCwgWmVuU3RhY2sgT1JNIGV4cGVydCBhbmQgcHJvZHVjdCBkZXNpZ25lci5cblxuRGVzaWduIHRoZSBcIiR7YnJpZWYubmFtZX1cIiBhcHBsaWNhdGlvbiAoZGVwYXJ0bWVudDogJHticmllZi5kZXBhcnRtZW50fSkgZm9yIGFcbnRlbmFudCBhcHAgcGxhdGZvcm0uIEl0IGlzIG9uZSBhcHAgaW5zaWRlIGEgcGFjazsgdGhlIHBhY2sgYWxzbyBjb250YWluczpcbiR7YWxsQXBwcy5tYXAoKGEpPT5gLSAke2EubmFtZX0gKCR7YS5kZXBhcnRtZW50fSlgKS5qb2luKCdcXG4nKX1cblxuVGhlIENFTyBPdmVydmlldyBhcHAgZXhpc3RzIHNvIGxlYWRlcnNoaXAgY2FuIHNlZSBpbnRvIGV2ZXJ5IGRlcGFydG1lbnQgXHUyMDE0XG5kZXNpZ24gdGhpcyBhcHAgc28gaXRzIGRhdGEsIHBhZ2VzIGFuZCBrbm93bGVkZ2UgZmVlZCB0aGF0IHRyYW5zcGFyZW5jeS5cblxuIyMgUnVsZXNcblxuMS4gKipXM0MgWFNEKio6IFVzZSAke3czY1N0YW5kYXJkfSBmb3IgZmllbGQgdHlwZXMgYW5kIHZhbGlkYXRpb24gY29uc3RyYWludHMuXG4yLiAqKnNjaGVtYS5vcmcgbWFwcGluZyoqOiBNYXAgZmllbGRzIHRvIHNjaGVtYS5vcmcgcHJvcGVydGllcyAoc2NoZW1hT3JnUHJvcGVydHkpLlxuMy4gKipCYXNlIGZpZWxkcyBhdXRvLWFkZGVkKio6IGlkLCB0ZW5hbnRTbHVnLCBjcmVhdGVkQXQsIHVwZGF0ZWRBdCBhcmUgYWRkZWRcbiAgIGF1dG9tYXRpY2FsbHkgXHUyMDE0IG5ldmVyIGluY2x1ZGUgdGhlbSBpbiB0aGUgZmllbGRzIGFycmF5LlxuNC4gKipNb25ldGFyeSB2YWx1ZXMqKjogZGVjaW1hbCB0eXBlIHdpdGggc2NoZW1hT3JnUHJvcGVydHkgXCJvZmZlcnMucHJpY2VcIi5cbjUuICoqU3RhdHVzIGZpZWxkcyoqOiBlbnVtIHdpdGggbWVhbmluZ2Z1bCBlbnVtVmFsdWVzIChwZW5kaW5nLCBhY3RpdmUsIC4uLikuXG42LiAqKk1vZGVscyoqOiAzLTggbW9kZWxzIGRlcGVuZGluZyBvbiB0aGUgZGVwYXJ0bWVudCdzIGNvbXBsZXhpdHkuXG43LiAqKlVzZSBjYXNlcyoqOiBVQy1YWFgtTk4gZm9ybWF0OyBhdXRoOiAke0FVVEhfVElFUlMuam9pbignLycpfSAocHVibGljID1cbiAgIGN1c3RvbWVyLWZhY2luZywgcGluID0gc3RhZmYvb3BzLCBnb29nbGUgPSBleGVjL2xlYWRlcnNoaXApLlxuOC4gKipQYWdlcyoqOiBzbHVncyBwcmVmaXhlZCB3aXRoIHRoZSBhcHAgaWQgKGUuZy4gXCIvaHIvZW1wbG95ZWVzXCIpOyBibG9ja1R5cGVzXG4gICBmcm9tOiAke0FWQUlMQUJMRV9CTE9DS1Muam9pbignLCAnKX0uIFVzZSBcIm9wc19hZG1pbl90YWJzXCIgZm9yIG1vZGVsXG4gICBDUlVEL2FkbWluIHN1cmZhY2VzLCBcImtwaV9jYXJkc1wiL1wiY2hhcnRfZmluYW5jaWFsXCIvXCJyZXBvcnRzX3JvbGx1cFwiIGZvclxuICAgcmVwb3J0aW5nLCBcImFjdGlvbl9jaGVja2xpc3RcIiBmb3IgYWN0aW9uYWJsZSBpdGVtcywgXCJkb2NfbWFya2Rvd25cIiBmb3JcbiAgIHBvbGljaWVzLCBcInNoZWV0X3ZpZXdlclwiIGZvciByYXcgZGF0YS5cbjkuICoqTmF2Kio6IG9uZSBuYXYgc2VjdGlvbiBwZXIgYXBwIHdpdGggYSBjbGVhciBsYWJlbCArIGljb24gaGludDsgcGFnZXMgbGlzdC5cbjEwLiAqKlVYIHdvcmtmbG93Kio6IDItNSBzdGFnZXMgZGVzY3JpYmluZyB0aGUgZW5kLXRvLWVuZCB1c2VyIGpvdXJuZXkgaW5zaWRlXG4gICAgdGhlIGFwcCAoZS5nLiBPbmJvYXJkaW5nIFx1MjE5MiBEYWlseSBPcHMgXHUyMTkyIFJldmlldyksIGVhY2ggd2l0aCBjb25jcmV0ZSBhY3Rpb25zXG4gICAgKGNyZWF0ZS9yZWFkL3VwZGF0ZS9hcHByb3ZlL2V4cG9ydC9ub3RpZnkvcmV2aWV3KSBwb2ludGluZyBhdCByZWFsIHBhZ2VzLlxuMTEuICoqS25vd2xlZGdlIHNuaXBwZXRzKio6IDMtNiBzbmlwcGV0cyAoa2V5LCB0aXRsZSwgY29udGVudCBpbiBtYXJrZG93bikgXHUyMDE0XG4gICAgcG9saWNpZXMsIHN0ZXAtYnktc3RlcCBwcm9jZWR1cmVzLCBkZWZpbml0aW9ucyBhbmQgZ3VpZGFuY2Ugc3BlY2lmaWMgdG9cbiAgICB0aGlzIGRlcGFydG1lbnQncyBhcHAuIFRoZXNlIGZvcm0gdGhlIGFwcCdzIGtub3dsZWRnZSBiYXNlLlxuMTIuICoqc2NoZW1hLm9yZyB0eXBlKio6IHByaW1hcnkgdHlwZSBpcyBcIiR7c2NoZW1hT3JnVHlwZX1cIi5cbjEzLiAqKlRhYmxlIG5hbWVzKio6IHNuYWtlX2Nhc2UgcGx1cmFsOyAqKmZpZWxkIG5hbWVzKio6IGNhbWVsQ2FzZS5cbjE0LiAqKkZpZWxkIHdpZHRoKio6IDEyIGZ1bGwtd2lkdGgsIDYgaGFsZi13aWR0aCwgNCB0aGlyZC13aWR0aC5cblxuIyMgS25vd2xlZGdlIGJhc2UgKHBsYXRmb3JtIGNvbnRleHQpXG5cbiR7a25vd2xlZGdlQmFzZSA/IGtub3dsZWRnZUJhc2UgOiAnKG5vbmUgcHJvdmlkZWQgXHUyMDE0IHVzZSBnZW5lcmFsIGJlc3QgcHJhY3RpY2VzKSd9XG5cbiMjIENFTyBjb250ZXh0XG5cblRoZSBDRU8gT3ZlcnZpZXcgYXBwIHB1cnBvc2U6ICR7Y2VvUHVycG9zZX1cbkNFTyBLUElzICh0aGlzIGFwcCdzIGRhdGEgc2hvdWxkIHN1cHBvcnQgdGhlc2UpOiAke2Nlb0twaXMuam9pbignLCAnKX1cblxuIyMgT3V0cHV0XG5cblJldHVybiB0aGUgY29tcGxldGUgYXBwIGRlZmluaXRpb24gKG1vZGVscywgdXNlIGNhc2VzLCBwYWdlcywgbmF2LCBVWCB3b3JrZmxvdyxcbmtub3dsZWRnZSBzbmlwcGV0cykuYDtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUFwcERlZmluaXRpb24oYnJpZWYsIGNlb1B1cnBvc2UsIGNlb0twaXMsIGFsbEFwcHMsIGtub3dsZWRnZUJhc2UpIHtcbiAgICBjb25zdCB7IG9iamVjdCB9ID0gYXdhaXQgZ2VuZXJhdGVPYmplY3Qoe1xuICAgICAgICBtb2RlbDogb3BlbmFpKE1PREVMKSxcbiAgICAgICAgc2NoZW1hOiBhcHBQYWNrQXBwRGVmaW5pdGlvblpvZCxcbiAgICAgICAgc3lzdGVtOiBidWlsZEFwcFN5c3RlbVByb21wdChicmllZiwgY2VvUHVycG9zZSwgY2VvS3BpcywgYWxsQXBwcywga25vd2xlZGdlQmFzZSksXG4gICAgICAgIHByb21wdDogYERlc2lnbiB0aGUgXCIke2JyaWVmLm5hbWV9XCIgYXBwbGljYXRpb24gaW4gZnVsbCBkZXRhaWwuYCxcbiAgICAgICAgdGVtcGVyYXR1cmU6IDAuMlxuICAgIH0pO1xuICAgIHJldHVybiBvYmplY3Q7XG59XG4vLyBcdTI1MDBcdTI1MDAgTW9jayB2YXJpYW50cyAoZGV0ZXJtaW5pc3RpYywgbm8gQUkga2V5IG5lZWRlZCkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5leHBvcnQgZnVuY3Rpb24gbW9ja0RlY29tcG9zZVBhY2soKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFja0lkOiAnb3BzLWRlcGFydG1lbnQtcGFjaycsXG4gICAgICAgIG5hbWU6ICdPcGVyYXRpb25zIERlcGFydG1lbnQgUGFjaycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTW9jayBhcHBsaWNhdGlvbiBwYWNrOiBIUiwgU2FsZXMgUmVwb3J0aW5nLCBGaW5hbmNlIGFuZCBhIENFTyBPdmVydmlldyBhcHAgdGhhdCBhZ2dyZWdhdGVzIGV2ZXJ5IGRlcGFydG1lbnQuJyxcbiAgICAgICAgYXBwczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnaHInLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdIUiBNYW5hZ2VtZW50JyxcbiAgICAgICAgICAgICAgICBkZXBhcnRtZW50OiAnSHVtYW4gUmVzb3VyY2VzJyxcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiAnRW1wbG95ZWUgcmVjb3Jkcywgb25ib2FyZGluZywgbGVhdmUgYW5kIGF0dGVuZGFuY2UgZm9yIHRoZSBIUiBkZXBhcnRtZW50LicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVJZDogJ3Byb2Zlc3Npb25hbC1zZXJ2aWNlcydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICdzYWxlcy1yZXBvcnRpbmcnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdTYWxlcyBSZXBvcnRpbmcnLFxuICAgICAgICAgICAgICAgIGRlcGFydG1lbnQ6ICdTYWxlcycsXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogJ0RhaWx5IHNhbGVzIGNhcHR1cmUsIHRyZW5kIHJlcG9ydGluZyBhbmQgdGFyZ2V0IHRyYWNraW5nIGZvciB0aGUgU2FsZXMgZGVwYXJ0bWVudC4nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlSWQ6ICdyZXN0YXVyYW50J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ2ZpbmFuY2UnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdGaW5hbmNlIC8gUmVwb3J0aW5nIC8gVHJhY2tpbmcnLFxuICAgICAgICAgICAgICAgIGRlcGFydG1lbnQ6ICdGaW5hbmNlJyxcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiAnUmV2ZW51ZSwgY29zdHMsIGNhc2hmbG93IHRyYWNraW5nIGFuZCBmaW5hbmNpYWwgcmVwb3J0aW5nIGZvciB0aGUgRmluYW5jZSBkZXBhcnRtZW50LicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVJZDogJ2ZpbmFuY2lhbC1hbmFseXRpY3MnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnY2VvLW92ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnQ0VPIE92ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICBkZXBhcnRtZW50OiAnRXhlY3V0aXZlIExlYWRlcnNoaXAnLFxuICAgICAgICAgICAgICAgIHN1bW1hcnk6ICdDcm9zcy1kZXBhcnRtZW50IHRyYW5zcGFyZW5jeSBkYXNoYm9hcmQgd2l0aCBhY2Nlc3MgdG8gZXZlcnkgZGVwYXJ0bWVudCBrbm93bGVkZ2UgYmFzZSBhbmQgcmVhbHRpbWUgYWN0aW9uYWJsZSBpdGVtcy4nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlSWQ6ICdmaW5hbmNpYWwtYW5hbHl0aWNzJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBjZW9PdmVydmlldzoge1xuICAgICAgICAgICAgcHVycG9zZTogJ0FnZ3JlZ2F0ZSBLUElzIGFuZCBrbm93bGVkZ2UgZnJvbSBldmVyeSBkZXBhcnRtZW50IGFwcCBpbnRvIGEgc2luZ2xlIGxlYWRlcnNoaXAgb3ZlcnZpZXcgd2l0aCBhY3Rpb25hYmxlIGl0ZW1zLicsXG4gICAgICAgICAgICBrcGlzOiBbXG4gICAgICAgICAgICAgICAgJ3JldmVudWUnLFxuICAgICAgICAgICAgICAgICdncm9zc01hcmdpbicsXG4gICAgICAgICAgICAgICAgJ2hlYWRjb3VudCcsXG4gICAgICAgICAgICAgICAgJ3NhbGVzVGFyZ2V0QWNoaWV2ZW1lbnQnLFxuICAgICAgICAgICAgICAgICdjYXNoZmxvdycsXG4gICAgICAgICAgICAgICAgJ2NvbXBsaWFuY2VTdGF0dXMnXG4gICAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIG1vY2tHZW5lcmF0ZUFwcERlZmluaXRpb24oYnJpZWYpIHtcbiAgICBjb25zdCBtb2RlbE5hbWUgPSBicmllZi5pZCA9PT0gJ2hyJyA/ICdFbXBsb3llZScgOiBicmllZi5pZCA9PT0gJ3NhbGVzLXJlcG9ydGluZycgPyAnRGFpbHlTYWxlJyA6IGJyaWVmLmlkID09PSAnZmluYW5jZScgPyAnRmluYW5jaWFsUmVjb3JkJyA6ICdEZXBhcnRtZW50S3BpJztcbiAgICBjb25zdCB0YWJsZU5hbWUgPSBgJHttb2RlbE5hbWUucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxXyQyJykudG9Mb3dlckNhc2UoKX1zYDtcbiAgICByZXR1cm4ge1xuICAgICAgICBhcHBJZDogYnJpZWYuaWQsXG4gICAgICAgIGFwcE5hbWU6IGJyaWVmLm5hbWUsXG4gICAgICAgIGRlcGFydG1lbnQ6IGJyaWVmLmRlcGFydG1lbnQsXG4gICAgICAgIHczY1N0YW5kYXJkOiBXM0NfU1RBTkRBUkRTW2JyaWVmLnRlbXBsYXRlSWRdID8/ICdzY2hlbWEub3JnJyxcbiAgICAgICAgc2NoZW1hT3JnVHlwZTogU0NIRU1BX09SR19UWVBFU1ticmllZi50ZW1wbGF0ZUlkXSA/PyAnTG9jYWxCdXNpbmVzcycsXG4gICAgICAgIG1vZGVsczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6IG1vZGVsTmFtZSxcbiAgICAgICAgICAgICAgICB0YWJsZU5hbWUsXG4gICAgICAgICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICduYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2hlbWFPcmdQcm9wZXJ0eTogJ25hbWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdOYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxMlxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbnVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW51bVZhbHVlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXJjaGl2ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdGF0dXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDZcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ25vdGVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTm90ZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEyXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHVzZUNhc2VzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6IGBVQy0ke2JyaWVmLmlkLnRvVXBwZXJDYXNlKCkuc2xpY2UoMCwgNCl9LTAxYCxcbiAgICAgICAgICAgICAgICB0aXRsZTogYE1hbmFnZSAke2JyaWVmLm5hbWV9IHJlY29yZHNgLFxuICAgICAgICAgICAgICAgIGF1dGg6ICdwaW4nLFxuICAgICAgICAgICAgICAgIHJvdXRlOiBgLyR7YnJpZWYuaWR9YCxcbiAgICAgICAgICAgICAgICBibG9ja1R5cGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICdvcHNfYWRtaW5fdGFicydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIG1vZGVsczogW1xuICAgICAgICAgICAgICAgICAgICBtb2RlbE5hbWVcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHBhZ2VzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc2x1ZzogYCR7YnJpZWYuaWR9YCxcbiAgICAgICAgICAgICAgICB0aXRsZTogYnJpZWYubmFtZSxcbiAgICAgICAgICAgICAgICBhdXRoVGllcjogJ3BpbicsXG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlczogW1xuICAgICAgICAgICAgICAgICAgICAna3BpX2NhcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgJ29wc19hZG1pbl90YWJzJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgbmF2TGFiZWw6IGJyaWVmLm5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgbmF2OiB7XG4gICAgICAgICAgICBsYWJlbDogYnJpZWYubmFtZSxcbiAgICAgICAgICAgIGljb246ICdEYXNoYm9hcmQnLFxuICAgICAgICAgICAgcGFnZXM6IFtcbiAgICAgICAgICAgICAgICBicmllZi5pZFxuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB1eFdvcmtmbG93OiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3RhZ2U6ICdEYWlseSBvcGVyYXRpb25zJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlY29yZCBhbmQgcmV2aWV3IGRhaWx5IGVudHJpZXMnLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBgT3BlbiAke2JyaWVmLm5hbWV9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhZ2U6IGAvJHticmllZi5pZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uVHlwZTogJ25hdmlnYXRlJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdBZGQgcmVjb3JkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhZ2U6IGAvJHticmllZi5pZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TW9kZWw6IG1vZGVsTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblR5cGU6ICdjcmVhdGUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YWdlOiAnUmV2aWV3JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JldmlldyBhbmQgYXBwcm92ZSBlbnRyaWVzJyxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ0FwcHJvdmUgZW50cmllcycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYWdlOiBgLyR7YnJpZWYuaWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblR5cGU6ICdhcHByb3ZlJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdFeHBvcnQgcmVwb3J0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhZ2U6IGAvJHticmllZi5pZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uVHlwZTogJ2V4cG9ydCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAga25vd2xlZGdlU25pcHBldHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IGAke2JyaWVmLmlkfS1vdmVydmlld2AsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGAke2JyaWVmLm5hbWV9IFx1MjAxNCBPdmVydmlld2AsXG4gICAgICAgICAgICAgICAgY29udGVudDogYCMgJHticmllZi5uYW1lfVxcblxcblN0YW5kYXJkIG9wZXJhdGluZyBndWlkYW5jZSBmb3IgdGhlICR7YnJpZWYuZGVwYXJ0bWVudH0gYXBwOiByZWNvcmQgZW50cmllcyBkYWlseSwgcmV2aWV3IHdlZWtseSwgZXNjYWxhdGUgZXhjZXB0aW9ucyB0byB0aGUgQ0VPIE92ZXJ2aWV3IGRhc2hib2FyZC5gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogYCR7YnJpZWYuaWR9LWJlc3QtcHJhY3RpY2VzYCxcbiAgICAgICAgICAgICAgICB0aXRsZTogYCR7YnJpZWYubmFtZX0gXHUyMDE0IEJlc3QgUHJhY3RpY2VzYCxcbiAgICAgICAgICAgICAgICBjb250ZW50OiBgIyMgQmVzdCBQcmFjdGljZXNcXG5cXG4xLiBLZWVwIHJlY29yZHMgY3VycmVudCBkYWlseS5cXG4yLiBGbGFnIGFub21hbGllcyBpbW1lZGlhdGVseS5cXG4zLiBVc2UgdGhlIGFjdGlvbiBjaGVja2xpc3QgZm9yIGZvbGxvdy11cHMuYFxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcbn1cbiIsICIvKipcbiAqIEFwcCBQYWNrIFx1MjAxNCBab2Qgc2NoZW1hcyBmb3IgQUktZ2VuZXJhdGVkIFwiYXBwbGljYXRpb24gcGFja1wiIGRlZmluaXRpb25zLlxuICpcbiAqIEFuIGFwcGxpY2F0aW9uIHBhY2sgaXMgYSBjb2xsZWN0aW9uIG9mIGRlcGFydG1lbnQgYXBwbGljYXRpb25zIChIUixcbiAqIE1hcmtldGluZy9NZW1iZXJzaGlwcywgU2FsZXMgUmVwb3J0aW5nLCBFY29tbWVyY2UgTWFya2V0cGxhY2UsIFJlZmVycmFscyxcbiAqIEJhY2sgT2ZmaWNlLCBMZWdhbCwgRmluYW5jZSwgQ29tcGxpYW5jZSwgQ0VPIE92ZXJ2aWV3LCAuLi4pLiBFYWNoIGFwcCBpc1xuICogZnVsbHkgZGVyaXZlZCBieSBBSSBmcm9tIGEgbmF0dXJhbC1sYW5ndWFnZSByZXF1aXJlbWVudCBhbmQgY2FycmllczpcbiAqXG4gKiAgIDEuIFVzZSBjYXNlcyAgICAgICAgXHUyMDE0IFVDLVhYWC1OTiB3aXRoIGF1dGggdGllcnMgKyByb3V0ZXNcbiAqICAgMi4gVzMgU2NoZW1hICAgICAgICBcdTIwMTQgbW9kZWxzIHdpdGggVzNDIFhTRCBmaWVsZCB0eXBlcyArIHNjaGVtYS5vcmcgbWFwcGluZ3NcbiAqICAgMy4gWmVuU3RhY2sgICAgICAgICBcdTIwMTQgY29tcGlsZWQgZnJvbSB0aGUgbW9kZWxzIGF0IGJ1aWxkIHRpbWUgKHptb2RlbClcbiAqICAgNC4gVGVtcGxhdGVzICAgICAgICBcdTIwMTQgcGFnZSBibG9jayB0eXBlcyAoZHluYW1pY19mb3JtLCBrcGlfY2FyZHMsIC4uLilcbiAqICAgNS4gTmF2aWdhdGlvbmFsIER5bmFtaWMgUGFnZXMgXHUyMDE0IHNsdWdzLCBuYXYgc2VjdGlvbnMsIHNlY3VyaXR5IGdyb3Vwc1xuICogICA2LiBVWCBXb3JrZmxvdyAgICAgIFx1MjAxNCBzdGFnZXMgKyBhY3Rpb25zICh3aGF0IHRoZSB1c2VyIGRvZXMgaW4gdGhlIGFwcClcbiAqICAgNy4gS25vd2xlZGdlIFNuaXBwZXRzIFx1MjAxNCBwZXItYXBwIGtub3dsZWRnZSBiYXNlIGVudHJpZXNcbiAqXG4gKiBUaGUgQ0VPIE92ZXJ2aWV3IGFwcCBpcyBnZW5lcmF0ZWQgd2l0aCBjcm9zcy1hcHAgdmlzaWJpbGl0eTogaXRzIHBhZ2VzIGFuZFxuICoga25vd2xlZGdlIHJlZmVyZW5jZSBldmVyeSBkZXBhcnRtZW50IGFwcCBpbiB0aGUgcGFjay5cbiAqLyBpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNjaGVtYU1vZGVsWm9kLCB1c2VDYXNlWm9kLCBwYWdlWm9kIH0gZnJvbSAnQC9kb21haW4vYWkvc2NoZW1hLWdlbmVyYXRpb24tc2NoZW1hJztcbi8vIFx1MjUwMFx1MjUwMCBQYWNrLWxldmVsIChkZWNvbXBvc2l0aW9uKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmV4cG9ydCBjb25zdCBhcHBQYWNrQXBwQnJpZWZab2QgPSB6Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0FwcCBpZCBpbiBrZWJhYi1jYXNlLCBlLmcuIFwiaHJcIiBvciBcInNhbGVzLXJlcG9ydGluZ1wiJyksXG4gICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnSHVtYW4tcmVhZGFibGUgYXBwIG5hbWUsIGUuZy4gXCJIUiBNYW5hZ2VtZW50XCInKSxcbiAgICBkZXBhcnRtZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdCdXNpbmVzcyBkZXBhcnRtZW50IHRoaXMgYXBwIHNlcnZlcywgZS5nLiBcIkh1bWFuIFJlc291cmNlc1wiJyksXG4gICAgc3VtbWFyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnT25lLXBhcmFncmFwaCBkZXNjcmlwdGlvbiBvZiB3aGF0IHRoaXMgYXBwIGRvZXMnKSxcbiAgICB0ZW1wbGF0ZUlkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdCZXN0LWZpdCB0ZW1wbGF0ZSBpZCBmcm9tOiBmaW5hbmNpYWwtYW5hbHl0aWNzLCByZXN0YXVyYW50LCBob3RlbCwgZWNvbW1lcmNlLXJldGFpbCwgaGVhbHRoY2FyZSwgc3VwcGx5LWNoYWluLCByZWFsLWVzdGF0ZSwgZWR1Y2F0aW9uLCBwcm9mZXNzaW9uYWwtc2VydmljZXMsIG1hbnVmYWN0dXJpbmcnKVxufSk7XG5leHBvcnQgY29uc3QgYXBwUGFja0RlY29tcG9zaXRpb25ab2QgPSB6Lm9iamVjdCh7XG4gICAgcGFja0lkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYWNrIGlkIGluIGtlYmFiLWNhc2UsIGUuZy4gXCJvcHMtZGVwYXJ0bWVudC1wYWNrXCInKSxcbiAgICBuYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYWNrIGRpc3BsYXkgbmFtZScpLFxuICAgIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdIaWdoLWxldmVsIGRlc2NyaXB0aW9uIG9mIHRoZSB3aG9sZSBwYWNrJyksXG4gICAgYXBwczogei5hcnJheShhcHBQYWNrQXBwQnJpZWZab2QpLmRlc2NyaWJlKCdPbmUgYnJpZWYgcGVyIGRlcGFydG1lbnQgYXBwbGljYXRpb24nKSxcbiAgICBjZW9PdmVydmlldzogei5vYmplY3Qoe1xuICAgICAgICBwdXJwb3NlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdXaGF0IHRoZSBDRU8gT3ZlcnZpZXcgYXBwIGRvZXMgYWNyb3NzIGFsbCBkZXBhcnRtZW50cycpLFxuICAgICAgICBrcGlzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlc2NyaWJlKCdDcm9zcy1kZXBhcnRtZW50IEtQSXMgdGhlIENFTyBkYXNoYm9hcmQgc2hvdWxkIHN1cmZhY2UnKVxuICAgIH0pXG59KTtcbi8vIFx1MjUwMFx1MjUwMCBQZXItYXBwIChkZXRhaWxlZCBkZWZpbml0aW9uKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmV4cG9ydCBjb25zdCBhcHBVeEFjdGlvblpvZCA9IHoub2JqZWN0KHtcbiAgICBhY3Rpb246IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0FjdGlvbiBsYWJlbCwgZS5nLiBcIkNyZWF0ZSBuZXcgZW1wbG95ZWVcIicpLFxuICAgIHRhcmdldFBhZ2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1JvdXRlIHBhdGggdGhpcyBhY3Rpb24gbmF2aWdhdGVzIHRvJyksXG4gICAgdGFyZ2V0TW9kZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnUHJpbWFyeSBtb2RlbCB0aGUgYWN0aW9uIG9wZXJhdGVzIG9uJyksXG4gICAgYWN0aW9uVHlwZTogei5lbnVtKFtcbiAgICAgICAgJ2NyZWF0ZScsXG4gICAgICAgICdyZWFkJyxcbiAgICAgICAgJ3VwZGF0ZScsXG4gICAgICAgICdkZWxldGUnLFxuICAgICAgICAnYXBwcm92ZScsXG4gICAgICAgICdleHBvcnQnLFxuICAgICAgICAnbm90aWZ5JyxcbiAgICAgICAgJ25hdmlnYXRlJyxcbiAgICAgICAgJ3JldmlldydcbiAgICBdKS5kZXNjcmliZSgnS2luZCBvZiBhY3Rpb24nKVxufSk7XG5leHBvcnQgY29uc3QgYXBwVXhTdGFnZVpvZCA9IHoub2JqZWN0KHtcbiAgICBzdGFnZTogei5zdHJpbmcoKS5kZXNjcmliZSgnV29ya2Zsb3cgc3RhZ2UgbmFtZSwgZS5nLiBcIk9uYm9hcmRpbmdcIicpLFxuICAgIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1doYXQgdGhpcyBzdGFnZSBhY2NvbXBsaXNoZXMnKSxcbiAgICBhY3Rpb25zOiB6LmFycmF5KGFwcFV4QWN0aW9uWm9kKS5kZXNjcmliZSgnQWN0aW9ucyBhdmFpbGFibGUgaW4gdGhpcyBzdGFnZScpXG59KTtcbmV4cG9ydCBjb25zdCBhcHBOYXZab2QgPSB6Lm9iamVjdCh7XG4gICAgbGFiZWw6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ05hdiBtZW51IGxhYmVsIGZvciB0aGlzIGFwcCcpLFxuICAgIGljb246IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnTVVJIGljb24gbmFtZSBoaW50IChlLmcuIFwiUGVvcGxlXCIsIFwiUGF5bWVudHNcIiknKSxcbiAgICBwYWdlczogei5hcnJheSh6LnN0cmluZygpKS5kZXNjcmliZSgnUGFnZSBzbHVncyBncm91cGVkIHVuZGVyIHRoaXMgYXBwIGluIHRoZSBuYXYnKVxufSk7XG5leHBvcnQgY29uc3QgYXBwS25vd2xlZGdlU25pcHBldFpvZCA9IHoub2JqZWN0KHtcbiAgICBrZXk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NuaXBwZXQga2V5IGluIGtlYmFiLWNhc2UsIGUuZy4gXCJoci1vbmJvYXJkaW5nLXN0ZXBzXCInKSxcbiAgICB0aXRsZTogei5zdHJpbmcoKS5kZXNjcmliZSgnU25pcHBldCB0aXRsZScpLFxuICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0tub3dsZWRnZSBjb250ZW50IChtYXJrZG93bikgXHUyMDE0IHBvbGljaWVzLCBzdGVwcywgZ3VpZGFuY2UnKVxufSk7XG5leHBvcnQgY29uc3QgYXBwUGFja0FwcERlZmluaXRpb25ab2QgPSB6Lm9iamVjdCh7XG4gICAgYXBwSWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0FwcCBpZCBtYXRjaGluZyB0aGUgZGVjb21wb3NpdGlvbiBicmllZicpLFxuICAgIGFwcE5hbWU6IHouc3RyaW5nKCksXG4gICAgZGVwYXJ0bWVudDogei5zdHJpbmcoKSxcbiAgICB3M2NTdGFuZGFyZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVzNDIFhTRCAvIGRhdGEgc3RhbmRhcmQgYXBwbGllZCAoZS5nLiBcIlVCTCBmb3IgaW52b2ljZXNcIiknKSxcbiAgICBzY2hlbWFPcmdUeXBlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQcmltYXJ5IHNjaGVtYS5vcmcgdHlwZScpLFxuICAgIG1vZGVsczogc2NoZW1hTW9kZWxab2QuYXJyYXkoKS5kZXNjcmliZSgnMy04IFplblN0YWNrIG1vZGVscyAobm8gaWQvdGVuYW50U2x1Zy9jcmVhdGVkQXQvdXBkYXRlZEF0IGJhc2UgZmllbGRzKScpLFxuICAgIHVzZUNhc2VzOiB1c2VDYXNlWm9kLmFycmF5KCkuZGVzY3JpYmUoJ1VzZSBjYXNlcyBmb3IgdGhpcyBhcHAgKFVDLVhYWC1OTiknKSxcbiAgICBwYWdlczogcGFnZVpvZC5hcnJheSgpLmRlc2NyaWJlKCdQYWdlcyBmb3IgdGhpcyBhcHAgKGF1dGggdGllcnM6IHB1YmxpYy9waW4vZ29vZ2xlKScpLFxuICAgIG5hdjogYXBwTmF2Wm9kLFxuICAgIHV4V29ya2Zsb3c6IHouYXJyYXkoYXBwVXhTdGFnZVpvZCkuZGVzY3JpYmUoJ0VuZC10by1lbmQgVVggd29ya2Zsb3cgc3RhZ2VzIGZvciB0aGlzIGFwcCcpLFxuICAgIGtub3dsZWRnZVNuaXBwZXRzOiB6LmFycmF5KGFwcEtub3dsZWRnZVNuaXBwZXRab2QpLmRlc2NyaWJlKCdLbm93bGVkZ2Ugc25pcHBldHMgZm9yIHRoaXMgYXBwJylcbn0pO1xuLy8gXHUyNTAwXHUyNTAwIE1hdGVyaWFsaXplZCBydW4gcmVzdWx0IChwZXJzaXN0ZWQpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZXhwb3J0IGNvbnN0IGFwcFBhY2tSdW5SZXN1bHRab2QgPSB6Lm9iamVjdCh7XG4gICAgcGFja0lkOiB6LnN0cmluZygpLFxuICAgIG5hbWU6IHouc3RyaW5nKCksXG4gICAgZGVzY3JpcHRpb246IHouc3RyaW5nKCksXG4gICAgY3JlYXRlZEF0OiB6LnN0cmluZygpLFxuICAgIGFwcHM6IHouYXJyYXkoYXBwUGFja0FwcERlZmluaXRpb25ab2QpLFxuICAgIGNlb092ZXJ2aWV3OiB6Lm9iamVjdCh7XG4gICAgICAgIHB1cnBvc2U6IHouc3RyaW5nKCksXG4gICAgICAgIGtwaXM6IHouYXJyYXkoei5zdHJpbmcoKSlcbiAgICB9KSxcbiAgICBtYXRlcmlhbGl6ZWQ6IHoub2JqZWN0KHtcbiAgICAgICAgcGFnZXM6IHoubnVtYmVyKCksXG4gICAgICAgIG5hdkl0ZW1zOiB6Lm51bWJlcigpLFxuICAgICAgICBzbmlwcGV0czogei5udW1iZXIoKSxcbiAgICAgICAgZ3JvdXBzOiB6Lm51bWJlcigpLFxuICAgICAgICB6bW9kZWxzOiB6Lm51bWJlcigpXG4gICAgfSlcbn0pO1xuIiwgIi8qKlxuICogWm9kIHNjaGVtYSBmb3IgQUktZ2VuZXJhdGVkIFczQyBzY2hlbWEgZGVmaW5pdGlvbnMuXG4gKlxuICogVGhpcyBzY2hlbWEgaXMgdXNlZCB3aXRoIHRoZSBWZXJjZWwgQUkgU0RLJ3MgYGdlbmVyYXRlT2JqZWN0KClgIGZ1bmN0aW9uXG4gKiB0byBlbnN1cmUgdGhlIEFJIHJldHVybnMgYSBzdHJ1Y3R1cmFsbHkgdmFsaWQgc2NoZW1hIGRlZmluaXRpb24uXG4gKi8gaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5leHBvcnQgY29uc3Qgc2NoZW1hRmllbGRab2QgPSB6Lm9iamVjdCh7XG4gICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnRmllbGQgbmFtZSBpbiBjYW1lbENhc2UnKSxcbiAgICB0eXBlOiB6LmVudW0oW1xuICAgICAgICAnc3RyaW5nJyxcbiAgICAgICAgJ3RleHQnLFxuICAgICAgICAnaW50ZWdlcicsXG4gICAgICAgICdkZWNpbWFsJyxcbiAgICAgICAgJ2Jvb2xlYW4nLFxuICAgICAgICAnZGF0ZXRpbWUnLFxuICAgICAgICAnZGF0ZScsXG4gICAgICAgICd0aW1lJyxcbiAgICAgICAgJ2VudW0nLFxuICAgICAgICAnanNvbicsXG4gICAgICAgICdyZWxhdGlvbidcbiAgICBdKS5kZXNjcmliZSgnRmllbGQgdHlwZSBhbGlnbmVkIHdpdGggWFNEIGRhdGEgdHlwZXMnKSxcbiAgICByZXF1aXJlZDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gICAgdW5pcXVlOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICAgIGRlZmF1bHQ6IHoudW5rbm93bigpLm9wdGlvbmFsKCksXG4gICAgZW51bVZhbHVlczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLFxuICAgIHJlbGF0aW9uVG86IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICByZWxhdGlvblR5cGU6IHouZW51bShbXG4gICAgICAgICdvbmUtdG8tbWFueScsXG4gICAgICAgICdtYW55LXRvLW9uZScsXG4gICAgICAgICdtYW55LXRvLW1hbnknXG4gICAgXSkub3B0aW9uYWwoKSxcbiAgICBzY2hlbWFPcmdQcm9wZXJ0eTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdzY2hlbWEub3JnIHByb3BlcnR5IG1hcHBpbmcgKGUuZy4sIFwib2ZmZXJzLnByaWNlXCIpJyksXG4gICAgbGFiZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnSHVtYW4tcmVhZGFibGUgbGFiZWwgZm9yIFVJIGZvcm1zJyksXG4gICAgd2lkdGg6IHoudW5pb24oW1xuICAgICAgICB6LmxpdGVyYWwoNCksXG4gICAgICAgIHoubGl0ZXJhbCg2KSxcbiAgICAgICAgei5saXRlcmFsKDgpLFxuICAgICAgICB6LmxpdGVyYWwoMTIpXG4gICAgXSkub3B0aW9uYWwoKVxufSk7XG5leHBvcnQgY29uc3Qgc2NoZW1hTW9kZWxab2QgPSB6Lm9iamVjdCh7XG4gICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTW9kZWwgbmFtZSBpbiBQYXNjYWxDYXNlJyksXG4gICAgdGFibGVOYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdEYXRhYmFzZSB0YWJsZSBuYW1lIGluIHNuYWtlX2Nhc2VfcGx1cmFsJyksXG4gICAgZmllbGRzOiB6LmFycmF5KHNjaGVtYUZpZWxkWm9kKSxcbiAgICBzY2hlbWFPcmdNYXBwaW5nOiB6LnJlY29yZCh6LnN0cmluZygpKS5vcHRpb25hbCgpXG59KTtcbmV4cG9ydCBjb25zdCB1c2VDYXNlWm9kID0gei5vYmplY3Qoe1xuICAgIGlkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdVc2UgY2FzZSBJRCBpbiBmb3JtYXQgVUMtWFhYLU5OIChlLmcuLCBVQy1SRVNULTAxKScpLFxuICAgIHRpdGxlOiB6LnN0cmluZygpLFxuICAgIGF1dGg6IHouZW51bShbXG4gICAgICAgICdwdWJsaWMnLFxuICAgICAgICAncGluJyxcbiAgICAgICAgJ2dvb2dsZSdcbiAgICBdKSxcbiAgICByb3V0ZTogei5zdHJpbmcoKS5kZXNjcmliZSgnUm91dGUgcGF0aCAoZS5nLiwgXCIvbWVudVwiKScpLFxuICAgIGJsb2NrVHlwZXM6IHouYXJyYXkoei5zdHJpbmcoKSksXG4gICAgbW9kZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpXG59KTtcbmV4cG9ydCBjb25zdCBwYWdlWm9kID0gei5vYmplY3Qoe1xuICAgIHNsdWc6IHouc3RyaW5nKCksXG4gICAgdGl0bGU6IHouc3RyaW5nKCksXG4gICAgYXV0aFRpZXI6IHouZW51bShbXG4gICAgICAgICdwdWJsaWMnLFxuICAgICAgICAncGluJyxcbiAgICAgICAgJ2dvb2dsZSdcbiAgICBdKSxcbiAgICBibG9ja1R5cGVzOiB6LmFycmF5KHouc3RyaW5nKCkpLFxuICAgIG5hdkxhYmVsOiB6LnN0cmluZygpLm9wdGlvbmFsKClcbn0pO1xuZXhwb3J0IGNvbnN0IHNjaGVtYUdlbmVyYXRpb25ab2RTY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgdGVtcGxhdGVJZDogei5zdHJpbmcoKSxcbiAgICBzY2hlbWFPcmdUeXBlOiB6LnN0cmluZygpLFxuICAgIG1vZGVsczogei5hcnJheShzY2hlbWFNb2RlbFpvZCksXG4gICAgdXNlQ2FzZXM6IHouYXJyYXkodXNlQ2FzZVpvZCksXG4gICAgcGFnZXM6IHouYXJyYXkocGFnZVpvZClcbn0pO1xuIiwgIi8qKlxuICogWmVuU3RhY2sgLnptb2RlbCBDb21waWxlclxuICpcbiAqIFRha2VzIGFuIEFJLWdlbmVyYXRlZCBTY2hlbWFHZW5lcmF0aW9uUmVzdWx0IGFuZCBjb21waWxlcyBpdFxuICogaW50byBhIHZhbGlkIFplblN0YWNrIHNjaGVtYS56bW9kZWwgZmlsZS5cbiAqXG4gKiBUaGUgZ2VuZXJhdGVkIC56bW9kZWwgaW5jbHVkZXM6XG4gKiAgIC0gZGF0YXNvdXJjZSArIGdlbmVyYXRvciBibG9ja3NcbiAqICAgLSBBdXRoVGllciBlbnVtXG4gKiAgIC0gQWxsIG1vZGVscyB3aXRoIHByb3BlciBmaWVsZCB0eXBlcywgZGVjb3JhdG9ycywgYW5kIEBAbWFwXG4gKi8gLy8gXHUyNTAwXHUyNTAwIEZpZWxkIHR5cGUgbWFwcGluZyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmZ1bmN0aW9uIG1hcEZpZWxkVHlwZShmaWVsZCkge1xuICAgIHN3aXRjaChmaWVsZC50eXBlKXtcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIHJldHVybiAnU3RyaW5nJztcbiAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgICAgICByZXR1cm4gJ1N0cmluZyBAZGIuVGV4dCc7XG4gICAgICAgIGNhc2UgJ2ludGVnZXInOlxuICAgICAgICAgICAgcmV0dXJuICdJbnQnO1xuICAgICAgICBjYXNlICdkZWNpbWFsJzpcbiAgICAgICAgICAgIHJldHVybiAnRGVjaW1hbCBAZGIuRGVjaW1hbCgxNCwgMiknO1xuICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgIHJldHVybiAnQm9vbGVhbic7XG4gICAgICAgIGNhc2UgJ2RhdGV0aW1lJzpcbiAgICAgICAgICAgIHJldHVybiAnRGF0ZVRpbWUnO1xuICAgICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiAnRGF0ZVRpbWUgQGRiLkRhdGUnO1xuICAgICAgICBjYXNlICd0aW1lJzpcbiAgICAgICAgICAgIHJldHVybiAnRGF0ZVRpbWUgQGRiLlRpbWUnO1xuICAgICAgICBjYXNlICdlbnVtJzpcbiAgICAgICAgICAgIHJldHVybiAnU3RyaW5nJztcbiAgICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgICAgICByZXR1cm4gJ0pzb24nO1xuICAgICAgICBjYXNlICdyZWxhdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gJ1N0cmluZyc7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJ1N0cmluZyc7XG4gICAgfVxufVxuLy8gXHUyNTAwXHUyNTAwIEZpZWxkIGRlY29yYXRvciBtYXBwaW5nIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gbWFwRmllbGREZWNvcmF0b3JzKGZpZWxkKSB7XG4gICAgY29uc3QgcGFydHMgPSBbXTtcbiAgICBpZiAoZmllbGQudW5pcXVlKSBwYXJ0cy5wdXNoKCdAdW5pcXVlJyk7XG4gICAgaWYgKGZpZWxkLmRlZmF1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAodHlwZW9mIGZpZWxkLmRlZmF1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGBAZGVmYXVsdChcIiR7ZmllbGQuZGVmYXVsdH1cIilgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZmllbGQuZGVmYXVsdCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGBAZGVmYXVsdCgke2ZpZWxkLmRlZmF1bHR9KWApO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBmaWVsZC5kZWZhdWx0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcGFydHMucHVzaChgQGRlZmF1bHQoJHtmaWVsZC5kZWZhdWx0fSlgKTtcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGZpZWxkLmRlZmF1bHQpKSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGBAZGVmYXVsdChbXSlgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcnRzLnB1c2goYEBkZWZhdWx0KFwie31cIilgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGFydHMubGVuZ3RoID4gMCA/ICcgJyArIHBhcnRzLmpvaW4oJyAnKSA6ICcnO1xufVxuLy8gXHUyNTAwXHUyNTAwIEZpZWxkIGNvbW1lbnQgKHNjaGVtYS5vcmcgbWFwcGluZykgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5mdW5jdGlvbiBtYXBGaWVsZENvbW1lbnQoZmllbGQpIHtcbiAgICBpZiAoIWZpZWxkLnNjaGVtYU9yZ1Byb3BlcnR5KSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gYCAgLy8vIHNjaGVtYS5vcmc6JHtmaWVsZC5zY2hlbWFPcmdQcm9wZXJ0eX1gO1xufVxuLy8gXHUyNTAwXHUyNTAwIE1vZGVsIGNvbXBpbGF0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gY29tcGlsZU1vZGVsKG1vZGVsKSB7XG4gICAgY29uc3QgZmllbGRzU3RyID0gbW9kZWwuZmllbGRzLm1hcCgoZik9PntcbiAgICAgICAgY29uc3QgdHlwZVN0ciA9IG1hcEZpZWxkVHlwZShmKTtcbiAgICAgICAgY29uc3Qgb3B0aW9uYWwgPSBmLnJlcXVpcmVkID8gJycgOiAnPyc7XG4gICAgICAgIGNvbnN0IGRlY29yYXRvcnMgPSBtYXBGaWVsZERlY29yYXRvcnMoZik7XG4gICAgICAgIGNvbnN0IGNvbW1lbnQgPSBtYXBGaWVsZENvbW1lbnQoZik7XG4gICAgICAgIGNvbnN0IGZpZWxkTGluZSA9IGAgICR7Zi5uYW1lfSAke3R5cGVTdHJ9JHtvcHRpb25hbH0ke2RlY29yYXRvcnN9YDtcbiAgICAgICAgcmV0dXJuIGNvbW1lbnQgPyBgJHtjb21tZW50fVxcbiR7ZmllbGRMaW5lfWAgOiBmaWVsZExpbmU7XG4gICAgfSkuam9pbignXFxuJyk7XG4gICAgcmV0dXJuIGBcbm1vZGVsICR7bW9kZWwubmFtZX0ge1xuICBpZCAgICAgICAgIFN0cmluZyAgIEBpZCBAZGVmYXVsdChjdWlkKCkpXG4gIHRlbmFudFNsdWcgU3RyaW5nPyAgQG1hcChcInRlbmFudF9zbHVnXCIpXG4ke2ZpZWxkc1N0cn1cbiAgY3JlYXRlZEF0ICBEYXRlVGltZSBAZGVmYXVsdChub3coKSkgQG1hcChcImNyZWF0ZWRfYXRcIilcbiAgdXBkYXRlZEF0ICBEYXRlVGltZSBAdXBkYXRlZEF0IEBtYXAoXCJ1cGRhdGVkX2F0XCIpXG5cbiAgQEBpbmRleChbdGVuYW50U2x1Z10pXG4gIEBAbWFwKFwiJHttb2RlbC50YWJsZU5hbWV9XCIpXG59YDtcbn1cbi8vIFx1MjUwMFx1MjUwMCBGdWxsIC56bW9kZWwgY29tcGlsYXRpb24gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRvWk1vZGVsKHNjaGVtYSkge1xuICAgIGNvbnN0IGhlYWRlciA9IGAvLyBBdXRvLWdlbmVyYXRlZCBaZW5TdGFjayBzY2hlbWEgZm9yICR7c2NoZW1hLnRlbXBsYXRlSWR9XG4vLyBHZW5lcmF0ZWQgYnkgVE9LRU5JWk1ZQVBQIEFJIFNjaGVtYSBHZW5lcmF0b3Jcbi8vIHNjaGVtYS5vcmcgdHlwZTogJHtzY2hlbWEuc2NoZW1hT3JnVHlwZX1cbi8vIFczQyBzdGFuZGFyZCBhbGlnbm1lbnQgYXBwbGllZCB0byBmaWVsZCB0eXBlc1xuXG5kYXRhc291cmNlIGRiIHtcbiAgcHJvdmlkZXIgPSBcInBvc3RncmVzcWxcIlxuICB1cmwgICAgICA9IGVudihcIlBPU1RHUkVTX1VSTFwiKVxufVxuXG5nZW5lcmF0b3IgY2xpZW50IHtcbiAgcHJvdmlkZXIgPSBcInByaXNtYS1jbGllbnQtanNcIlxuICBvdXRwdXQgICA9IFwiLi4vLi4vc3JjL2dlbmVyYXRlZC9wcmlzbWFcIlxuICBiaW5hcnlUYXJnZXRzID0gW1wibmF0aXZlXCIsIFwibGludXgtYXJtNjQtb3BlbnNzbC0zLjAueFwiXVxufVxuXG5lbnVtIEF1dGhUaWVyIHtcbiAgcHVibGljXG4gIHBpblxuICBnb29nbGVcbn1cbmA7XG4gICAgY29uc3QgbW9kZWxzID0gc2NoZW1hLm1vZGVscy5tYXAoY29tcGlsZU1vZGVsKS5qb2luKCdcXG4nKTtcbiAgICByZXR1cm4gYCR7aGVhZGVyfVxcbiR7bW9kZWxzfVxcbmA7XG59XG4vLyBcdTI1MDBcdTI1MDAgUGFnZSBjYXRhbG9nIGNvbXBpbGF0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUb1BhZ2VDYXRhbG9nKHNjaGVtYSkge1xuICAgIGNvbnN0IHBhZ2VzID0gc2NoZW1hLnBhZ2VzLm1hcCgocCk9PmAgIHtcbiAgICBzbHVnOiAnJHtwLnNsdWd9JyxcbiAgICB0aXRsZTogJyR7cC50aXRsZX0nLFxuICAgIGF1dGhUaWVyOiAnJHtwLmF1dGhUaWVyfScsXG4gICAgbmF2TGFiZWw6ICcke3AubmF2TGFiZWwgPz8gcC50aXRsZX0nLFxuICAgIHNlY3Rpb25zOiBbXG4gICAgICAke3AuYmxvY2tUeXBlcy5tYXAoKGJ0LCBpKT0+YHsgYmxvY2tUeXBlOiAnJHtidH0nIGFzIEJsb2NrVHlwZSwgY29uZmlnOiB7fSB9YCkuam9pbignLFxcbiAgICAgICcpfVxuICAgIF0sXG4gIH1gKS5qb2luKCcsXFxuJyk7XG4gICAgcmV0dXJuIGAvKipcbiAqIEF1dG8tZ2VuZXJhdGVkIHBhZ2UgY2F0YWxvZyBmb3IgJHtzY2hlbWEudGVtcGxhdGVJZH1cbiAqIEdlbmVyYXRlZCBieSBUT0tFTklaTVlBUFAgQUkgU2NoZW1hIEdlbmVyYXRvclxuICovXG5pbXBvcnQgdHlwZSB7IFBhZ2VEZWZpbml0aW9uIH0gZnJvbSAnQC9saWIvcGFnZS1jYXRhbG9nJztcblxuZXhwb3J0IGNvbnN0IEdFTkVSQVRFRF9QQUdFUzogUGFnZURlZmluaXRpb25bXSA9IFtcbiR7cGFnZXN9XG5dO1xuYDtcbn1cbiIsICIvKipcbiAqIEFwcCBQYWNrIFx1MjAxNCBDb21waWxlclxuICpcbiAqIERldGVybWluaXN0aWMgY29tcGlsYXRpb24gb2YgQUktZ2VuZXJhdGVkIGFwcCBkZWZpbml0aW9ucyBpbnRvIGFydGlmYWN0cyB0aGVcbiAqIHBsYXRmb3JtIGNhbiBtYXRlcmlhbGl6ZTpcbiAqXG4gKiAgIC0gWmVuU3RhY2sgLnptb2RlbCBzb3VyY2UgKHBlciBhcHAsIHZpYSBjb21waWxlVG9aTW9kZWwpXG4gKiAgIC0gUGFnZSBjYXRhbG9nIHNvdXJjZSAocGVyIGFwcCwgdmlhIGNvbXBpbGVUb1BhZ2VDYXRhbG9nKVxuICogICAtIERCIHJvd3MgZm9yIHBhZ2VzLCBuYXYgaXRlbXMsIGtub3dsZWRnZSBzbmlwcGV0cyBhbmQgc2VjdXJpdHkgZ3JvdXBzXG4gKiAgIC0gVVggd29ya2Zsb3cgZG9jdW1lbnRzIChKU09OKVxuICovIGltcG9ydCB7IGNvbXBpbGVUb1pNb2RlbCwgY29tcGlsZVRvUGFnZUNhdGFsb2cgfSBmcm9tICdAL2RvbWFpbi9haS96bW9kZWwtY29tcGlsZXInO1xuZnVuY3Rpb24gdG9TY2hlbWFHZW5lcmF0aW9uUmVzdWx0KGRlZikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlSWQ6IGRlZi5hcHBJZCxcbiAgICAgICAgc2NoZW1hT3JnVHlwZTogZGVmLnNjaGVtYU9yZ1R5cGUsXG4gICAgICAgIG1vZGVsczogZGVmLm1vZGVscyxcbiAgICAgICAgdXNlQ2FzZXM6IGRlZi51c2VDYXNlcyxcbiAgICAgICAgcGFnZXM6IGRlZi5wYWdlc1xuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUFwcEFydGlmYWN0cyhkZWYpIHtcbiAgICBjb25zdCBzY2hlbWEgPSB0b1NjaGVtYUdlbmVyYXRpb25SZXN1bHQoZGVmKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBhcHBJZDogZGVmLmFwcElkLFxuICAgICAgICBhcHBOYW1lOiBkZWYuYXBwTmFtZSxcbiAgICAgICAgZGVwYXJ0bWVudDogZGVmLmRlcGFydG1lbnQsXG4gICAgICAgIHptb2RlbDogY29tcGlsZVRvWk1vZGVsKHNjaGVtYSksXG4gICAgICAgIHBhZ2VDYXRhbG9nOiBjb21waWxlVG9QYWdlQ2F0YWxvZyhzY2hlbWEpLFxuICAgICAgICBzZWN1cml0eUdyb3VwQ29kZTogYGFwcF8ke2RlZi5hcHBJZH1gLFxuICAgICAgICBzZWN1cml0eUdyb3VwTmFtZTogYEFwcDogJHtkZWYuYXBwTmFtZX1gXG4gICAgfTtcbn1cbi8qKiBOb3JtYWxpemUgYW4gQUktZ2VuZXJhdGVkIHBhZ2Ugc2x1ZyB0byBhIHNpbmdsZSBVUkwtc2FmZSBzZWdtZW50LiAqLyBleHBvcnQgZnVuY3Rpb24gc2FuaXRpemVQYWdlU2x1ZyhzbHVnKSB7XG4gICAgcmV0dXJuIHNsdWcudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9eXFwvKy8sICcnKS5yZXBsYWNlKC9bXFxzLl0rL2csIFwiLVwiKS5yZXBsYWNlKC9bXmEtejAtOS1fXS9nLCAnJykuc2xpY2UoMCwgNDgpO1xufVxuLyoqXG4gKiBCdWlsZCBEQiByb3dzIGZvciBvbmUgYXBwLiBUaGUgZHluYW1pYyByb3V0ZXIgaXMgYSBzaW5nbGUtbGV2ZWwgYC9bc2x1Z11gXG4gKiByb3V0ZSwgc28gcGFnZSBzbHVncyBhcmUgRkxBVCBhbmQgcHJlZml4ZWQgd2l0aCBwYWNrSWQgKyBhcHBJZCB0byBzdGF5XG4gKiBnbG9iYWxseSB1bmlxdWUgKGBhcHBfcGFnZXMuc2x1Z2AgaXMgYSBnbG9iYWwgdW5pcXVlIGNvbHVtbikuIE5hdiBjbHVzdGVyc1xuICogdGhlIGFwcCdzIHBhZ2VzIHVuZGVyIG9uZSBwYXJlbnQgaXRlbTsgYSBsYW5kaW5nIHBhZ2UgKHNsdWcgYDxwYWNrSWQ+LTxhcHBJZD5gKVxuICogaXMgYWx3YXlzIG1hdGVyaWFsaXplZCBzbyB0aGUgcGFyZW50IG5hdiBpdGVtIGhhcyBhIHJlYWwgZGVzdGluYXRpb24uXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVBcHBSb3dzKGRlZiwgdGVuYW50U2x1ZywgcGFja0lkKSB7XG4gICAgY29uc3Qgcm9vdFNsdWcgPSBgJHtwYWNrSWR9LSR7ZGVmLmFwcElkfWA7XG4gICAgY29uc3Qgcm9vdCA9IHtcbiAgICAgICAgaWQ6IGBwYWdlXyR7cGFja0lkfV8ke2RlZi5hcHBJZH1gLFxuICAgICAgICBzbHVnOiByb290U2x1ZyxcbiAgICAgICAgdGl0bGU6IGRlZi5hcHBOYW1lLFxuICAgICAgICBhdXRoVGllcjogZGVmLnBhZ2VzWzBdPy5hdXRoVGllciA/PyAncGluJyxcbiAgICAgICAgbmF2TGFiZWw6IG51bGwsXG4gICAgICAgIHNob3dJbk5hdjogZmFsc2UsXG4gICAgICAgIHRlbmFudFNsdWcsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnaGVybycsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkZWYuYXBwTmFtZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG4gICAgY29uc3QgcGFnZXMgPSBbXG4gICAgICAgIHJvb3QsXG4gICAgICAgIC4uLmRlZi5wYWdlcy5tYXAoKHApPT57XG4gICAgICAgICAgICBjb25zdCBzZWcgPSBzYW5pdGl6ZVBhZ2VTbHVnKHAuc2x1Zyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBgcGFnZV8ke3BhY2tJZH1fJHtkZWYuYXBwSWR9XyR7c2VnfWAsXG4gICAgICAgICAgICAgICAgc2x1ZzogYCR7cGFja0lkfS0ke2RlZi5hcHBJZH0tJHtzZWd9YCxcbiAgICAgICAgICAgICAgICB0aXRsZTogcC50aXRsZSxcbiAgICAgICAgICAgICAgICBhdXRoVGllcjogcC5hdXRoVGllcixcbiAgICAgICAgICAgICAgICBuYXZMYWJlbDogcC5uYXZMYWJlbCA/PyBudWxsLFxuICAgICAgICAgICAgICAgIHNob3dJbk5hdjogcC5uYXZMYWJlbCAhPSBudWxsLFxuICAgICAgICAgICAgICAgIHRlbmFudFNsdWcsXG4gICAgICAgICAgICAgICAgc2VjdGlvbnM6IHAuYmxvY2tUeXBlcy5tYXAoKGJ0KT0+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogYnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IHt9XG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSlcbiAgICBdO1xuICAgIC8vIE5hdjogb25lIHBhcmVudCBpdGVtIGZvciB0aGUgYXBwIHNlY3Rpb24gKyBjaGlsZHJlbiBwZXIgbmF2IHBhZ2UuXG4gICAgY29uc3QgZ3JvdXBDb2RlID0gYGFwcF8ke2RlZi5hcHBJZH1gO1xuICAgIGNvbnN0IG5hdiA9IFtdO1xuICAgIG5hdi5wdXNoKHtcbiAgICAgICAgaWQ6IGBuYXZfJHtwYWNrSWR9XyR7ZGVmLmFwcElkfWAsXG4gICAgICAgIHRpdGxlOiBkZWYubmF2LmxhYmVsLFxuICAgICAgICBwYXRoOiBgLyR7cm9vdFNsdWd9YCxcbiAgICAgICAgaWNvbjogZGVmLm5hdi5pY29uID8/ICdBcHBzJyxcbiAgICAgICAgcmVxdWlyZWRHcm91cHM6IGdyb3VwQ29kZSxcbiAgICAgICAgaXNEeW5hbWljOiB0cnVlLFxuICAgICAgICBzb3J0T3JkZXI6IDAsXG4gICAgICAgIHRlbmFudFNsdWdcbiAgICB9KTtcbiAgICBkZWYubmF2LnBhZ2VzLmZvckVhY2goKHNsdWcsIGkpPT57XG4gICAgICAgIGNvbnN0IHNlZyA9IHNhbml0aXplUGFnZVNsdWcoc2x1Zyk7XG4gICAgICAgIGNvbnN0IHBhZ2UgPSBwYWdlcy5maW5kKChwKT0+cC5zbHVnID09PSBgJHtwYWNrSWR9LSR7ZGVmLmFwcElkfS0ke3NlZ31gKTtcbiAgICAgICAgbmF2LnB1c2goe1xuICAgICAgICAgICAgaWQ6IGBuYXZfJHtwYWNrSWR9XyR7ZGVmLmFwcElkfV8ke3NlZ31gLFxuICAgICAgICAgICAgdGl0bGU6IHBhZ2U/Lm5hdkxhYmVsID8/IHBhZ2U/LnRpdGxlID8/IHNlZyxcbiAgICAgICAgICAgIHBhdGg6IGAvJHtwYWNrSWR9LSR7ZGVmLmFwcElkfS0ke3NlZ31gLFxuICAgICAgICAgICAgaWNvbjogJycsXG4gICAgICAgICAgICByZXF1aXJlZEdyb3VwczogZ3JvdXBDb2RlLFxuICAgICAgICAgICAgaXNEeW5hbWljOiB0cnVlLFxuICAgICAgICAgICAgc29ydE9yZGVyOiBpICsgMSxcbiAgICAgICAgICAgIHRlbmFudFNsdWdcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29uc3Qgc25pcHBldHMgPSBkZWYua25vd2xlZGdlU25pcHBldHMubWFwKChzKT0+KHtcbiAgICAgICAgICAgIGlkOiBgc25pcF8ke3BhY2tJZH1fJHtkZWYuYXBwSWR9XyR7cy5rZXkucmVwbGFjZSgvW15hLXowLTktXS9nLCAnXycpfWAsXG4gICAgICAgICAgICBrZXk6IGAke3BhY2tJZH0tJHtzLmtleX1gLFxuICAgICAgICAgICAgY29udGVudDogcy5jb250ZW50LFxuICAgICAgICAgICAgY2F0ZWdvcnk6IGBhcHBfJHtkZWYuYXBwSWR9YFxuICAgICAgICB9KSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFnZXMsXG4gICAgICAgIG5hdixcbiAgICAgICAgc25pcHBldHMsXG4gICAgICAgIHV4OiB7XG4gICAgICAgICAgICBhcHBJZDogZGVmLmFwcElkLFxuICAgICAgICAgICAgYXBwTmFtZTogZGVmLmFwcE5hbWUsXG4gICAgICAgICAgICBkZXBhcnRtZW50OiBkZWYuZGVwYXJ0bWVudCxcbiAgICAgICAgICAgIHN0YWdlczogZGVmLnV4V29ya2Zsb3dcbiAgICAgICAgfVxuICAgIH07XG59XG4vKipcbiAqIEJ1aWxkIHRoZSBDRU8gT3ZlcnZpZXcgbmF2ICsgc25pcHBldCByb3dzOiB0aGUgQ0VPIGFwcCBnZXRzIGl0cyBvd24gc2VjdGlvblxuICogcGx1cyBhIGtub3dsZWRnZSBjYXRlZ29yeSB0aGF0IGFnZ3JlZ2F0ZXMgZXZlcnkgZGVwYXJ0bWVudCBhcHAncyBzbmlwcGV0cyBzb1xuICogdGhlIENFTyBrbm93bGVkZ2UgYmFzZSBzcGFucyB0aGUgd2hvbGUgcGFjay5cbiAqLyBleHBvcnQgZnVuY3Rpb24gY29tcGlsZUNlb1Jvd3MoZGVjb21wb3NpdGlvbiwgY2VvRGVmLCB0ZW5hbnRTbHVnLCBwYWNrSWQpIHtcbiAgICBjb25zdCBncm91cENvZGUgPSBgYXBwXyR7Y2VvRGVmLmFwcElkfWA7XG4gICAgY29uc3QgbmF2ID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogYG5hdl8ke3BhY2tJZH1fJHtjZW9EZWYuYXBwSWR9YCxcbiAgICAgICAgICAgIHRpdGxlOiBjZW9EZWYubmF2LmxhYmVsLFxuICAgICAgICAgICAgcGF0aDogYC8ke3BhY2tJZH0tJHtjZW9EZWYuYXBwSWR9YCxcbiAgICAgICAgICAgIGljb246IGNlb0RlZi5uYXYuaWNvbiA/PyAnSW5zaWdodHMnLFxuICAgICAgICAgICAgcmVxdWlyZWRHcm91cHM6IGdyb3VwQ29kZSxcbiAgICAgICAgICAgIGlzRHluYW1pYzogdHJ1ZSxcbiAgICAgICAgICAgIHNvcnRPcmRlcjogMTAwLFxuICAgICAgICAgICAgdGVuYW50U2x1Z1xuICAgICAgICB9XG4gICAgXTtcbiAgICBjb25zdCBzbmlwcGV0cyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6IGBzbmlwXyR7cGFja0lkfV8ke2Nlb0RlZi5hcHBJZH1fb3ZlcnZpZXdgLFxuICAgICAgICAgICAga2V5OiBgJHtwYWNrSWR9LSR7Y2VvRGVmLmFwcElkfS1vdmVydmlld2AsXG4gICAgICAgICAgICBjb250ZW50OiBgIyAke2Nlb0RlZi5hcHBOYW1lfVxcblxcbiR7ZGVjb21wb3NpdGlvbi5jZW9PdmVydmlldy5wdXJwb3NlfWAgKyBgXFxuXFxuQ3Jvc3MtZGVwYXJ0bWVudCBLUElzOiAke2RlY29tcG9zaXRpb24uY2VvT3ZlcnZpZXcua3Bpcy5qb2luKCcsICcpfS5gLFxuICAgICAgICAgICAgY2F0ZWdvcnk6IGBhcHBfJHtjZW9EZWYuYXBwSWR9YFxuICAgICAgICB9LFxuICAgICAgICAuLi5kZWNvbXBvc2l0aW9uLmFwcHMuZmlsdGVyKChhKT0+YS5pZCAhPT0gY2VvRGVmLmFwcElkKS5tYXAoKGEpPT4oe1xuICAgICAgICAgICAgICAgIGlkOiBgc25pcF8ke3BhY2tJZH1fJHtjZW9EZWYuYXBwSWR9X3hyZWZfJHthLmlkfWAsXG4gICAgICAgICAgICAgICAga2V5OiBgJHtwYWNrSWR9LSR7Y2VvRGVmLmFwcElkfS14cmVmLSR7YS5pZH1gLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGAjICR7YS5uYW1lfSAoJHthLmRlcGFydG1lbnR9KVxcblxcbiR7YS5zdW1tYXJ5fVxcblxcblRoaXMgZGVwYXJ0bWVudCBhcHAgZmVlZHMgdGhlIENFTyBPdmVydmlldy4gYCArIGBSZWZlciB0byBpdHMga25vd2xlZGdlIGNhdGVnb3J5IFwiYXBwXyR7YS5pZH1cIiBmb3Igb3BlcmF0aW5nIGRldGFpbHMuYCxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYGFwcF8ke2Nlb0RlZi5hcHBJZH1gXG4gICAgICAgICAgICB9KSlcbiAgICBdO1xuICAgIHJldHVybiB7XG4gICAgICAgIG5hdixcbiAgICAgICAgc25pcHBldHMsXG4gICAgICAgIHV4OiB7XG4gICAgICAgICAgICBhcHBJZDogY2VvRGVmLmFwcElkLFxuICAgICAgICAgICAgYXBwTmFtZTogY2VvRGVmLmFwcE5hbWUsXG4gICAgICAgICAgICBkZXBhcnRtZW50OiBjZW9EZWYuZGVwYXJ0bWVudCxcbiAgICAgICAgICAgIHN0YWdlczogY2VvRGVmLnV4V29ya2Zsb3dcbiAgICAgICAgfVxuICAgIH07XG59XG4iLCAiLyoqXG4gKiBBcHAgUGFjayBcdTIwMTQgTWF0ZXJpYWxpemVyXG4gKlxuICogUGVyc2lzdHMgYSBjb21waWxlZCBhcHAgcGFjayBpbnRvIHRoZSB0ZW5hbnQgREIgdmlhIHJhdyBwZyAod29ya2Zsb3cgc3RlcHNcbiAqIHVzZSBzaG9ydC1saXZlZCBjb25uZWN0aW9ucywgc2FtZSBhcyB3b3JrYm9vay1pbmdlc3QpLiBBbGwgd3JpdGVzIGFyZVxuICogaWRlbXBvdGVudDogcm93cyBhcmUgc2NvcGVkIGJ5IHBhY2tJZCBwcmVmaXggYW5kIHJlcGxhY2VkIG9uIHJlLXJ1bi5cbiAqXG4gKiBEQiBjb25zdHJhaW50cyAoZnJvbSB6ZW5zdGFjay9zY2hlbWEuem1vZGVsKTpcbiAqICAgLSBhcHBfcGFnZXMuc2x1ZyBpcyBVTklRVUUgKGdsb2JhbCkgXHUyMTkyIGZsYXQgcGFja0lkLXByZWZpeGVkIHNsdWdzXG4gKiAgIC0gcGFnZV9zZWN0aW9ucy5ibG9ja190eXBlIGlzIGEgQmxvY2tUeXBlIEVOVU0gXHUyMTkyIGNhc3QgcmVxdWlyZWRcbiAqICAgLSBrbm93bGVkZ2Vfc25pcHBldHMua2V5IGlzIFVOSVFVRSBcdTIxOTIgcGFja0lkLXByZWZpeGVkIGtleXNcbiAqICAgLSBzZWN1cml0eV9ncm91cHMuY29kZSBpcyBVTklRVUUgXHUyMTkyIHVwc2VydCwgbmV2ZXIgZGVsZXRlIChyZWZlcmVuY2VkKVxuICovIGltcG9ydCB7IGNvbXBpbGVBcHBSb3dzLCBjb21waWxlQ2VvUm93cyB9IGZyb20gJy4vYXBwLXBhY2stY29tcGlsZXInO1xuLyoqIFVwc2VydCB0aGUgcGVyLWFwcCBzZWN1cml0eSBncm91cCAoY29kZSA9IGFwcF88YXBwSWQ+KS4gTmV2ZXIgZGVsZXRlcy4gKi8gYXN5bmMgZnVuY3Rpb24gdXBzZXJ0U2VjdXJpdHlHcm91cHMoY2xpZW50LCBhcHBzKSB7XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBmb3IgKGNvbnN0IGFwcCBvZiBhcHBzKXtcbiAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBzZWN1cml0eV9ncm91cHMgKGlkLCBjb2RlLCBuYW1lLCBkZXNjcmlwdGlvbiwgaXNfc3lzdGVtLCBwZXJtaXNzaW9ucywgY3JlYXRlZF9hdClcbiAgICAgICBWQUxVRVMgKCQxLCAkMiwgJDMsICQ0LCBmYWxzZSwgQVJSQVlbXTo6dGV4dFtdLCBOT1coKSlcbiAgICAgICBPTiBDT05GTElDVCAoY29kZSkgRE8gVVBEQVRFIFNFVCBuYW1lID0gRVhDTFVERUQubmFtZSwgZGVzY3JpcHRpb24gPSBFWENMVURFRC5kZXNjcmlwdGlvbjtgLCBbXG4gICAgICAgICAgICBgc2dfJHthcHAuYXBwSWR9YCxcbiAgICAgICAgICAgIGFwcC5zZWN1cml0eUdyb3VwQ29kZSxcbiAgICAgICAgICAgIGFwcC5zZWN1cml0eUdyb3VwTmFtZSxcbiAgICAgICAgICAgIGBNZW1iZXJzIGNhbiBhY2Nlc3MgdGhlICR7YXBwLmFwcE5hbWV9IGFwcC5gXG4gICAgICAgIF0pO1xuICAgICAgICBjb3VudCsrO1xuICAgIH1cbiAgICByZXR1cm4gY291bnQ7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWF0ZXJpYWxpemVBcHBQYWNrKGNsaWVudCwgaW5wdXQpIHtcbiAgICBjb25zdCB7IHBhY2tJZCwgdGVuYW50U2x1ZywgZGVjb21wb3NpdGlvbiwgYXBwcywgZGVmaW5pdGlvbnMgfSA9IGlucHV0O1xuICAgIGNvbnN0IGNvdW50cyA9IHtcbiAgICAgICAgYXBwczogMCxcbiAgICAgICAgcGFnZXM6IDAsXG4gICAgICAgIHNlY3Rpb25zOiAwLFxuICAgICAgICBuYXY6IDAsXG4gICAgICAgIHNuaXBwZXRzOiAwLFxuICAgICAgICBncm91cHM6IDBcbiAgICB9O1xuICAgIC8vIDEuIFNlY3VyaXR5IGdyb3VwcyBmb3IgZXZlcnkgYXBwLlxuICAgIGNvdW50cy5ncm91cHMgPSBhd2FpdCB1cHNlcnRTZWN1cml0eUdyb3VwcyhjbGllbnQsIGFwcHMpO1xuICAgIC8vIDIuIFBhZ2VzICsgc2VjdGlvbnMgXHUyMDE0IHNjb3BlZCByZXBsYWNlIChwYWNrIHBhZ2VzIG9ubHkpLlxuICAgIGNvbnN0IHBhZ2VTbHVnUHJlZml4ID0gYCR7cGFja0lkfS0lYDtcbiAgICBhd2FpdCBjbGllbnQucXVlcnkoYERFTEVURSBGUk9NIGFwcF9wYWdlcyBXSEVSRSBzbHVnIExJS0UgJDEgQU5EIHRlbmFudF9zbHVnID0gJDI7YCwgW1xuICAgICAgICBwYWdlU2x1Z1ByZWZpeCxcbiAgICAgICAgdGVuYW50U2x1Z1xuICAgIF0pO1xuICAgIGNvbnN0IGRlZnMgPSBbXG4gICAgICAgIC4uLmRlZmluaXRpb25zXG4gICAgXTtcbiAgICAvLyBDRU8gT3ZlcnZpZXcgZGVmIGlzIGxhc3QgaW4gZGVjb21wb3NpdGlvbi5hcHBzIG9yZGVyIChndWFyYW50ZWVkIGJ5IGdlbmVyYXRvcikuXG4gICAgY29uc3QgY2VvRGVmID0gZGVmc1tkZWZzLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGRlcHREZWZzID0gZGVmcy5zbGljZSgwLCAtMSk7XG4gICAgZm9yIChjb25zdCBkZWYgb2YgZGVwdERlZnMpe1xuICAgICAgICBjb25zdCByb3dzID0gY29tcGlsZUFwcFJvd3MoZGVmLCB0ZW5hbnRTbHVnLCBwYWNrSWQpO1xuICAgICAgICBmb3IgKGNvbnN0IHBhZ2Ugb2Ygcm93cy5wYWdlcyl7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIGFwcF9wYWdlcyAoaWQsIHNsdWcsIHRpdGxlLCBhdXRoX3RpZXIsIHNvcnRfb3JkZXIsIG5hdl9sYWJlbCwgc2hvd19pbl9uYXYsIHRlbmFudF9zbHVnKVxuICAgICAgICAgVkFMVUVTICgkMSwgJDIsICQzLCBDQVNUKCQ0IEFTIFwiQXV0aFRpZXJcIiksICQ1LCAkNiwgJDcsICQ4KTtgLCBbXG4gICAgICAgICAgICAgICAgcGFnZS5pZCxcbiAgICAgICAgICAgICAgICBwYWdlLnNsdWcsXG4gICAgICAgICAgICAgICAgcGFnZS50aXRsZSxcbiAgICAgICAgICAgICAgICBwYWdlLmF1dGhUaWVyLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgcGFnZS5uYXZMYWJlbCxcbiAgICAgICAgICAgICAgICBwYWdlLnNob3dJbk5hdixcbiAgICAgICAgICAgICAgICB0ZW5hbnRTbHVnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvdW50cy5wYWdlcysrO1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHBhZ2Uuc2VjdGlvbnMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8gcGFnZV9zZWN0aW9ucyAoaWQsIHBhZ2VfaWQsIHNvcnRfb3JkZXIsIGJsb2NrX3R5cGUsIGNvbmZpZylcbiAgICAgICAgICAgVkFMVUVTICgkMSwgJDIsICQzLCBDQVNUKCQ0IEFTIFwiQmxvY2tUeXBlXCIpLCBDQVNUKCQ1IEFTIGpzb25iKSk7YCwgW1xuICAgICAgICAgICAgICAgICAgICBgJHtwYWdlLmlkfTpzZWN0aW9uOiR7aX1gLFxuICAgICAgICAgICAgICAgICAgICBwYWdlLmlkLFxuICAgICAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgICAgICBwYWdlLnNlY3Rpb25zW2ldLmJsb2NrVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkocGFnZS5zZWN0aW9uc1tpXS5jb25maWcpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgY291bnRzLnNlY3Rpb25zKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gTmF2IGZvciB0aGlzIGFwcC5cbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHJvd3MubmF2KXtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8gbmF2aWdhdGlvbl9pdGVtcyAoaWQsIHBhcmVudF9pZCwgc29ydF9vcmRlciwgdGl0bGUsIHBhdGgsIGljb24sIGF1dGhfdGllciwgdGVuYW50X3NsdWcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmUsIHJlcXVpcmVkX2dyb3VwcywgaXNfdmlzaWJsZSwgaXNfZHluYW1pYywgaXNfZGVmYXVsdCwgY3JlYXRlZF9hdCwgdXBkYXRlZF9hdClcbiAgICAgICAgIFZBTFVFUyAoJDEsIE5VTEwsICQyLCAkMywgJDQsICQ1LCBDQVNUKCdwaW4nIEFTIFwiQXV0aFRpZXJcIiksICQ2LCB0cnVlLCAkNywgdHJ1ZSwgJDgsIGZhbHNlLCBOT1coKSwgTk9XKCkpO2AsIFtcbiAgICAgICAgICAgICAgICBpdGVtLmlkLFxuICAgICAgICAgICAgICAgIGl0ZW0uc29ydE9yZGVyLFxuICAgICAgICAgICAgICAgIGl0ZW0udGl0bGUsXG4gICAgICAgICAgICAgICAgaXRlbS5wYXRoLFxuICAgICAgICAgICAgICAgIGl0ZW0uaWNvbixcbiAgICAgICAgICAgICAgICB0ZW5hbnRTbHVnLFxuICAgICAgICAgICAgICAgIGl0ZW0ucmVxdWlyZWRHcm91cHMsXG4gICAgICAgICAgICAgICAgaXRlbS5pc0R5bmFtaWNcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY291bnRzLm5hdisrO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNuaXBwZXRzIGZvciB0aGlzIGFwcC5cbiAgICAgICAgZm9yIChjb25zdCBzbmlwIG9mIHJvd3Muc25pcHBldHMpe1xuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBrbm93bGVkZ2Vfc25pcHBldHMgKGlkLCBrZXksIGNvbnRlbnQsIGNhdGVnb3J5KSBWQUxVRVMgKCQxLCAkMiwgJDMsICQ0KVxuICAgICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudCwgY2F0ZWdvcnkgPSBFWENMVURFRC5jYXRlZ29yeTtgLCBbXG4gICAgICAgICAgICAgICAgc25pcC5pZCxcbiAgICAgICAgICAgICAgICBzbmlwLmtleSxcbiAgICAgICAgICAgICAgICBzbmlwLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgc25pcC5jYXRlZ29yeVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudHMuc25pcHBldHMrKztcbiAgICAgICAgfVxuICAgICAgICBjb3VudHMuYXBwcysrO1xuICAgIH1cbiAgICAvLyAzLiBDRU8gT3ZlcnZpZXcgKGxhc3QgYXBwKTogcGFnZXMgKyBuYXYgKyBjcm9zcy1kZXBhcnRtZW50IHNuaXBwZXRzLlxuICAgIGNvbnN0IGNlb1Jvd3MgPSBjb21waWxlQ2VvUm93cyhkZWNvbXBvc2l0aW9uLCBjZW9EZWYsIHRlbmFudFNsdWcsIHBhY2tJZCk7XG4gICAgY29uc3Qgcm9vdFNsdWcgPSBgJHtwYWNrSWR9LSR7Y2VvRGVmLmFwcElkfWA7XG4gICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBhcHBfcGFnZXMgKGlkLCBzbHVnLCB0aXRsZSwgYXV0aF90aWVyLCBzb3J0X29yZGVyLCBuYXZfbGFiZWwsIHNob3dfaW5fbmF2LCB0ZW5hbnRfc2x1ZylcbiAgICAgVkFMVUVTICgkMSwgJDIsICQzLCBDQVNUKCQ0IEFTIFwiQXV0aFRpZXJcIiksICQ1LCAkNiwgJDcsICQ4KTtgLCBbXG4gICAgICAgIGBwYWdlXyR7cGFja0lkfV8ke2Nlb0RlZi5hcHBJZH1gLFxuICAgICAgICByb290U2x1ZyxcbiAgICAgICAgY2VvRGVmLmFwcE5hbWUsXG4gICAgICAgICdwaW4nLFxuICAgICAgICAwLFxuICAgICAgICBudWxsLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgdGVuYW50U2x1Z1xuICAgIF0pO1xuICAgIGNvdW50cy5wYWdlcysrO1xuICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8gcGFnZV9zZWN0aW9ucyAoaWQsIHBhZ2VfaWQsIHNvcnRfb3JkZXIsIGJsb2NrX3R5cGUsIGNvbmZpZylcbiAgICAgVkFMVUVTICgkMSwgJDIsICQzLCBDQVNUKCQ0IEFTIFwiQmxvY2tUeXBlXCIpLCBDQVNUKCQ1IEFTIGpzb25iKSk7YCwgW1xuICAgICAgICBgcGFnZV8ke3BhY2tJZH1fJHtjZW9EZWYuYXBwSWR9OnNlY3Rpb246MGAsXG4gICAgICAgIGBwYWdlXyR7cGFja0lkfV8ke2Nlb0RlZi5hcHBJZH1gLFxuICAgICAgICAwLFxuICAgICAgICAnaGVybycsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIHRpdGxlOiBjZW9EZWYuYXBwTmFtZVxuICAgICAgICB9KVxuICAgIF0pO1xuICAgIGNvdW50cy5zZWN0aW9ucysrO1xuICAgIGZvciAoY29uc3QgZGVmIG9mIFtcbiAgICAgICAgY2VvRGVmXG4gICAgXSl7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBjb21waWxlQXBwUm93cyhkZWYsIHRlbmFudFNsdWcsIHBhY2tJZCk7XG4gICAgICAgIGZvciAoY29uc3QgcGFnZSBvZiByb3dzLnBhZ2VzLnNsaWNlKDEpKXtcbiAgICAgICAgICAgIC8vIENFTyBwYWdlcyBiZXlvbmQgdGhlIHJvb3QuXG4gICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIGFwcF9wYWdlcyAoaWQsIHNsdWcsIHRpdGxlLCBhdXRoX3RpZXIsIHNvcnRfb3JkZXIsIG5hdl9sYWJlbCwgc2hvd19pbl9uYXYsIHRlbmFudF9zbHVnKVxuICAgICAgICAgVkFMVUVTICgkMSwgJDIsICQzLCBDQVNUKCQ0IEFTIFwiQXV0aFRpZXJcIiksICQ1LCAkNiwgJDcsICQ4KTtgLCBbXG4gICAgICAgICAgICAgICAgcGFnZS5pZCxcbiAgICAgICAgICAgICAgICBwYWdlLnNsdWcsXG4gICAgICAgICAgICAgICAgcGFnZS50aXRsZSxcbiAgICAgICAgICAgICAgICBwYWdlLmF1dGhUaWVyLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgcGFnZS5uYXZMYWJlbCxcbiAgICAgICAgICAgICAgICBwYWdlLnNob3dJbk5hdixcbiAgICAgICAgICAgICAgICB0ZW5hbnRTbHVnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvdW50cy5wYWdlcysrO1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHBhZ2Uuc2VjdGlvbnMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8gcGFnZV9zZWN0aW9ucyAoaWQsIHBhZ2VfaWQsIHNvcnRfb3JkZXIsIGJsb2NrX3R5cGUsIGNvbmZpZylcbiAgICAgICAgICAgVkFMVUVTICgkMSwgJDIsICQzLCBDQVNUKCQ0IEFTIFwiQmxvY2tUeXBlXCIpLCBDQVNUKCQ1IEFTIGpzb25iKSk7YCwgW1xuICAgICAgICAgICAgICAgICAgICBgJHtwYWdlLmlkfTpzZWN0aW9uOiR7aX1gLFxuICAgICAgICAgICAgICAgICAgICBwYWdlLmlkLFxuICAgICAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgICAgICBwYWdlLnNlY3Rpb25zW2ldLmJsb2NrVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkocGFnZS5zZWN0aW9uc1tpXS5jb25maWcpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgY291bnRzLnNlY3Rpb25zKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHJvd3MubmF2KXtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8gbmF2aWdhdGlvbl9pdGVtcyAoaWQsIHBhcmVudF9pZCwgc29ydF9vcmRlciwgdGl0bGUsIHBhdGgsIGljb24sIGF1dGhfdGllciwgdGVuYW50X3NsdWcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmUsIHJlcXVpcmVkX2dyb3VwcywgaXNfdmlzaWJsZSwgaXNfZHluYW1pYywgaXNfZGVmYXVsdCwgY3JlYXRlZF9hdCwgdXBkYXRlZF9hdClcbiAgICAgICAgIFZBTFVFUyAoJDEsIE5VTEwsICQyLCAkMywgJDQsICQ1LCBDQVNUKCdwaW4nIEFTIFwiQXV0aFRpZXJcIiksICQ2LCB0cnVlLCAkNywgdHJ1ZSwgJDgsIGZhbHNlLCBOT1coKSwgTk9XKCkpO2AsIFtcbiAgICAgICAgICAgICAgICBpdGVtLmlkLFxuICAgICAgICAgICAgICAgIGl0ZW0uc29ydE9yZGVyLFxuICAgICAgICAgICAgICAgIGl0ZW0udGl0bGUsXG4gICAgICAgICAgICAgICAgaXRlbS5wYXRoLFxuICAgICAgICAgICAgICAgIGl0ZW0uaWNvbixcbiAgICAgICAgICAgICAgICB0ZW5hbnRTbHVnLFxuICAgICAgICAgICAgICAgIGl0ZW0ucmVxdWlyZWRHcm91cHMsXG4gICAgICAgICAgICAgICAgaXRlbS5pc0R5bmFtaWNcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY291bnRzLm5hdisrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3Qgc25pcCBvZiBjZW9Sb3dzLnNuaXBwZXRzKXtcbiAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBrbm93bGVkZ2Vfc25pcHBldHMgKGlkLCBrZXksIGNvbnRlbnQsIGNhdGVnb3J5KSBWQUxVRVMgKCQxLCAkMiwgJDMsICQ0KVxuICAgICAgIE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQsIGNhdGVnb3J5ID0gRVhDTFVERUQuY2F0ZWdvcnk7YCwgW1xuICAgICAgICAgICAgc25pcC5pZCxcbiAgICAgICAgICAgIHNuaXAua2V5LFxuICAgICAgICAgICAgc25pcC5jb250ZW50LFxuICAgICAgICAgICAgc25pcC5jYXRlZ29yeVxuICAgICAgICBdKTtcbiAgICAgICAgY291bnRzLnNuaXBwZXRzKys7XG4gICAgfVxuICAgIGNvdW50cy5hcHBzKys7XG4gICAgcmV0dXJuIGNvdW50cztcbn1cbiIsICIvKipcbiAqIFByb2dyZXNzIGVtaXNzaW9uIGZvciB0aGUgYXBwLXBhY2stZ2VuZXJhdGUgd29ya2Zsb3cuXG4gKlxuICogRm9sbG93cyB0aGUgU0RLIHN0cmVhbWluZyBwYXR0ZXJuIHVzZWQgYnkgd29ya2Jvb2staW5nZXN0OiB0aGUgd29ya2Zsb3dcbiAqIGZ1bmN0aW9uIGNhbGxzIGBnZXRXcml0YWJsZSgpYCBhbmQgcGFzc2VzIHRoZSBzdHJlYW0gdG8gc3RlcHM7IHN0ZXBzIG9idGFpblxuICogYSB3cml0ZXIsIHdyaXRlIEpTT04gY2h1bmtzLCBhbmQgcmVsZWFzZSB0aGUgbG9jay5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGVQcm9ncmVzc0NodW5rKHdyaXRhYmxlLCBjaHVuaykge1xuICAgIGNvbnN0IHdyaXRlciA9IHdyaXRhYmxlLmdldFdyaXRlcigpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHdyaXRlci53cml0ZShjaHVuayk7XG4gICAgfSBmaW5hbGx5e1xuICAgICAgICB3cml0ZXIucmVsZWFzZUxvY2soKTtcbiAgICB9XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0cmVhbSh3cml0YWJsZSkge1xuICAgIGF3YWl0IHdyaXRhYmxlLmNsb3NlKCk7XG59XG4iLCAiLyoqXG4gKiBMaWdodHdlaWdodCBQb3N0Z3JlU1FMIGhlbHBlciBmb3IgYXBwLXBhY2sgd29ya2Zsb3cgc3RlcHMgKHBnIGRyaXZlciwgbm9cbiAqIFByaXNtYSkuIE1pcnJvcnMgd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9kYi50cyBcdTIwMTQgZWFjaCBzdGVwIG9wZW5zIGl0cyBvd25cbiAqIHNob3J0LWxpdmVkIGNvbm5lY3Rpb247IHRoZSBjb25uZWN0aW9uIHN0cmluZyBpcyByZXNvbHZlZCBieSB0aGUgcm91dGUgYW5kXG4gKiBwYXNzZWQgdGhyb3VnaCB0aGUgd29ya2Zsb3cgaW5wdXQuXG4gKi8gaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSAncGcnO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdpdGhQZ0NsaWVudChjb25uZWN0aW9uU3RyaW5nLCBmbikge1xuICAgIGlmICghY29ubmVjdGlvblN0cmluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGRhdGFiYXNlIGNvbm5lY3Rpb24gc3RyaW5nIHByb3ZpZGVkLicpO1xuICAgIH1cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xpZW50KHtcbiAgICAgICAgY29ubmVjdGlvblN0cmluZ1xuICAgIH0pO1xuICAgIGF3YWl0IGNsaWVudC5jb25uZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IGZuKGNsaWVudCk7XG4gICAgfSBmaW5hbGx5e1xuICAgICAgICBhd2FpdCBjbGllbnQuZW5kKCk7XG4gICAgfVxufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHF1ZXJ5Um93cyhjbGllbnQsIHNxbCwgcGFyYW1zID0gW10pIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQucXVlcnkoc3FsLCBwYXJhbXMpO1xuICAgIHJldHVybiByZXN1bHQucm93cztcbn1cbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG4vKipcbiAqIFN0ZXAgZnVuY3Rpb25zIGZvciB0aGUgd29ya2Jvb2staW5nZXN0IHdvcmtmbG93LlxuICpcbiAqIEVhY2ggZXhwb3J0ZWQgYXN5bmMgZnVuY3Rpb24gd2l0aCB0aGUgYCd1c2Ugc3RlcCdgIGRpcmVjdGl2ZSBpcyBhIGR1cmFibGVcbiAqIHN0ZXA6IGl0cyBhcmdzIGFuZCByZXN1bHQgYXJlIHNlcmlhbGl6ZWQgdG8gdGhlIGV2ZW50IGxvZywgYW5kIGl0IHJldHJpZXNcbiAqIChtYXggMywgb3IgcGVyIFJldHJ5YWJsZUVycm9yKSBiZWZvcmUgdGhlIGVycm9yIGJ1YmJsZXMgdG8gdGhlIHdvcmtmbG93LlxuICovIGltcG9ydCB7IEZhdGFsRXJyb3IsIFJldHJ5YWJsZUVycm9yIH0gZnJvbSAnd29ya2Zsb3cnO1xuaW1wb3J0IHsgZXh0cmFjdFNoZWV0c1dpdGhTdGF0cyB9IGZyb20gJy4uLy4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svZXh0cmFjdC1zaGVldHMnO1xuaW1wb3J0IHsgYW5hbHl6ZVNoZWV0cyB9IGZyb20gJy4uLy4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svc2hlZXQtYW5hbHlzaXMnO1xuaW1wb3J0IHsgY29tcHJlaGVuZE9uY2UsIENvbXByZWhlbmRIdHRwRXJyb3IsIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL2NvbXByZWhlbmQnO1xuaW1wb3J0IHsgd3JpdGVQcm9ncmVzc0NodW5rLCBjbG9zZVByb2dyZXNzU3RyZWFtIH0gZnJvbSAnLi9wcm9ncmVzcyc7XG5pbXBvcnQgeyB3aXRoUGdDbGllbnQsIGV4ZWN1dGVPbmUsIHF1ZXJ5Um93cyB9IGZyb20gJy4vZGInO1xuaW1wb3J0IHsgcmVhZCB9IGZyb20gJ3hsc3gnO1xuaW1wb3J0IHsgYnVpbGRXb3JrYm9va0Zvcm11bGFNYXAgfSBmcm9tICcuLi8uLi9zcmMvbGliL3dvcmtib29rLWZvcm11bGFzJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJ3b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLnRzXCI6e1wiYW5hbHl6ZVNoZWV0c1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vYW5hbHl6ZVNoZWV0c1N0ZXBcIn0sXCJjbG9zZVByb2dyZXNzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9jbG9zZVByb2dyZXNzU3RlcFwifSxcImNvbXByZWhlbmRXb3JrYm9va1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vY29tcHJlaGVuZFdvcmtib29rU3RlcFwifSxcImVtaXRQcm9ncmVzc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZW1pdFByb2dyZXNzU3RlcFwifSxcImV4dHJhY3RTaGVldHNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2V4dHJhY3RTaGVldHNTdGVwXCJ9LFwiZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXBcIn0sXCJnZW5lcmF0ZURhc2hib2FyZFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVEYXNoYm9hcmRTdGVwXCJ9LFwiZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwXCJ9LFwibG9hZFdvcmtib29rU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9sb2FkV29ya2Jvb2tTdGVwXCJ9LFwicG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vcG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXBcIn0sXCJyZWdpc3RlckR5bmFtaWNQYWdlc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vcmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwXCJ9LFwic2F2ZVNuaXBwZXRzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zYXZlU25pcHBldHNTdGVwXCJ9LFwic2F2ZVdvcmtib29rRm9ybXVsYU1hcFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2F2ZVdvcmtib29rRm9ybXVsYU1hcFN0ZXBcIn0sXCJzZWxlY3RUZW1wbGF0ZVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2VsZWN0VGVtcGxhdGVTdGVwXCJ9LFwidXBzZXJ0U2hlZXRQYWdlc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vdXBzZXJ0U2hlZXRQYWdlc1N0ZXBcIn19fX0qLztcbi8qKiBEZXRlY3QgdGhlIGZpbGUgc2lnbmF0dXJlcyBvZiByZWFsIHNwcmVhZHNoZWV0IGZpbGVzICh6aXAveGxzeCwgQklGRi94bHMpLiAqLyBmdW5jdGlvbiBoYXNTcHJlYWRzaGVldE1hZ2ljKGRhdGEpIHtcbiAgICBjb25zdCBiID0gZGF0YTtcbiAgICAvLyBQS1xceDAzXFx4MDQgKHppcCBcdTIxOTIgeGxzeCkgb3IgUEtcXHgwNVxceDA2IChlbXB0eSB6aXApXG4gICAgaWYgKGJbMF0gPT09IDB4NTAgJiYgYlsxXSA9PT0gMHg0YikgcmV0dXJuIHRydWU7XG4gICAgLy8gRDAgQ0YgMTEgRTAgQTEgQjEgMUEgRTEgKE9MRTIgY29tcG91bmQgXHUyMTkyIC54bHMpXG4gICAgaWYgKGJbMF0gPT09IDB4ZDAgJiYgYlsxXSA9PT0gMHhjZiAmJiBiWzJdID09PSAweDExICYmIGJbM10gPT09IDB4ZTAgJiYgYls0XSA9PT0gMHhhMSAmJiBiWzVdID09PSAweGIxICYmIGJbNl0gPT09IDB4MWEgJiYgYls3XSA9PT0gMHhlMSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuLyoqXG4gKiBDb252ZXJ0IHJhdyB1cGxvYWQgYnl0ZXMgaW50byB4bHN4IGJ1ZmZlcnMuXG4gKlxuICogVWludDhBcnJheSBpcyBzZXJpYWxpemFibGUgYWNyb3NzIHRoZSB3b3JrZmxvdyBib3VuZGFyeTsgQnVmZmVyIGlzIG5vdFxuICogZ3VhcmFudGVlZCBpbiB3b3JrZmxvdyBzdGVwIHNhbmRib3hlcywgc28gd2Uga2VlcCBVaW50OEFycmF5IGV2ZXJ5d2hlcmVcbiAqIGFuZCBoYW5kIGl0IGRpcmVjdGx5IHRvIGB4bHN4LnJlYWQoeyB0eXBlOiAnYnVmZmVyJyB9KWAuXG4gKlxuICogU2hlZXRKUyBpcyBsZW5pZW50IHdpdGggYXJiaXRyYXJ5IHRleHQgKGl0IHBhcnNlcyBwbGFpbiB0ZXh0IGFzIGEgMS1jb2x1bW5cbiAqIHNoZWV0KSwgc28gd2UgdmFsaWRhdGUgdGhlIG1hZ2ljIGJ5dGVzIEJFRk9SRSBwYXJzaW5nIHRvIGNhdGNoIHVwbG9hZHMgb2ZcbiAqIHRoZSB3cm9uZyBmaWxlIHR5cGUgd2l0aCBhIGNsZWFuIEZhdGFsRXJyb3IuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRXb3JrYm9va1N0ZXAoZmlsZXMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZmlsZXMpIHx8IGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcignTm8gd29ya2Jvb2sgZmlsZXMgd2VyZSBwcm92aWRlZC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGVzLm1hcCgoZik9PntcbiAgICAgICAgaWYgKCFmIHx8IHR5cGVvZiBmLm5hbWUgIT09ICdzdHJpbmcnIHx8ICEoZi5kYXRhIGluc3RhbmNlb2YgVWludDhBcnJheSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdJbnZhbGlkIGZpbGUgZW50cnk6IGV4cGVjdGVkIHsgbmFtZSwgZGF0YTogVWludDhBcnJheSB9LicpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmLmRhdGEuYnl0ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYFdvcmtib29rIFwiJHtmLm5hbWV9XCIgaXMgZW1wdHkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYXNTcHJlYWRzaGVldE1hZ2ljKGYuZGF0YSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBXb3JrYm9vayBcIiR7Zi5uYW1lfVwiIGlzIG5vdCBhIHJlYWRhYmxlIC54bHN4Ly54bHMgZmlsZSAodW5leHBlY3RlZCBmaWxlIHNpZ25hdHVyZSkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGYuZGF0YTtcbiAgICB9KTtcbn1cbi8qKiBFWFRSQUNUOiBzZXJpYWxpemUgZXZlcnkgc2hlZXQgdG8gdGV4dCArIHN0cnVjdHVyYWwgc3RhdHMuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHRyYWN0U2hlZXRzU3RlcChidWZmZXJzKSB7XG4gICAgY29uc3QgYWxsID0gW107XG4gICAgZm9yIChjb25zdCBidWYgb2YgYnVmZmVycyl7XG4gICAgICAgIGxldCBleHRyYWN0ZWQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBleHRyYWN0ZWQgPSBleHRyYWN0U2hlZXRzV2l0aFN0YXRzKGJ1Zik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYFdvcmtib29rIGlzIG5vdCBhIHJlYWRhYmxlIC54bHN4IGZpbGU6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgICAgICB9XG4gICAgICAgIGFsbC5wdXNoKC4uLmV4dHJhY3RlZCk7XG4gICAgfVxuICAgIGlmIChhbGwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdXb3JrYm9vayBjb250YWlucyBubyByZWFkYWJsZSBzaGVldHMuJyk7XG4gICAgfVxuICAgIHJldHVybiBhbGw7XG59XG4vKiogQU5BTFlaRTogZGV0ZXJtaW5pc3RpYyBwcmUtcGFzcyBwcm9kdWNpbmcgc3RydWN0dXJlZCBoaW50cy4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFuYWx5emVTaGVldHNTdGVwKHNoZWV0cykge1xuICAgIHJldHVybiBhbmFseXplU2hlZXRzKHNoZWV0cyk7XG59XG4vKipcbiAqIEZPUk1VTEEgTUFQOiBmaW5kIGV2ZXJ5IGZvcm11bGEgY2VsbCBpbiB0aGUgaW1wb3J0ZWQgd29ya2Jvb2sgYW5kIHBlcnNpc3RcbiAqIGl0cyByZWZlcmVuY2VzIG1hcHBlZCB0byB0aGUgREItc2hlZXQgY29vcmRpbmF0ZXMgKGNvbHVtbiBrZXkgKyBkYXRhIHJvd1xuICogb2Zmc2V0KSB0aGF0IHRoZSBzaGVldCB2aWV3ZXIgc2VydmVzLCBzbyBmb3JtdWxhcyBjYW4gYmUgY29tcHV0ZWQgYWdhaW5zdFxuICogdGhlIGRhdGFiYXNlLXNhdmVkIHNoZWV0IGRhdGEuIElkZW1wb3RlbnQ6IE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVdvcmtib29rRm9ybXVsYU1hcFN0ZXAoYnVmZmVycywgZGJVcmwpIHtcbiAgICBsZXQgdG90YWwgPSAwO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHdiID0gcmVhZChidWZmZXJzWzBdLCB7XG4gICAgICAgICAgICB0eXBlOiAnYnVmZmVyJyxcbiAgICAgICAgICAgIGNlbGxGb3JtdWxhOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBmb3JtdWxhTWFwID0gYnVpbGRXb3JrYm9va0Zvcm11bGFNYXAod2IpO1xuICAgICAgICB0b3RhbCA9IE9iamVjdC52YWx1ZXMoZm9ybXVsYU1hcCkucmVkdWNlKChuLCBzKT0+biArIHMuZm9ybXVsYXMubGVuZ3RoLCAwKTtcbiAgICAgICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjYXRlZ29yeSwgY29udGVudClcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAnY2FjaGUnLCAkMilcbiAgICAgICAgIE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQ7YCwgW1xuICAgICAgICAgICAgICAgICd3b3JrYm9va19mb3JtdWxhcycsXG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoZm9ybXVsYU1hcClcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gTm9uLWZhdGFsOiB0aGUgd29ya2Jvb2tfZGF0YSBzbmlwcGV0IHJlbWFpbnMgdGhlIHNvdXJjZSBvZiB0cnV0aCBhbmQgdGhlXG4gICAgICAgIC8vIHNoZWV0LWRhdGEgQVBJIGNvbXB1dGVzIGZvcm11bGEgdmFsdWVzIG9uIHJlYWQgd2hlbiB0aGlzIGlzIG1pc3NpbmcuXG4gICAgICAgIGNvbnNvbGUud2FybignW3dvcmtib29rLWluZ2VzdF0gRm9ybXVsYSBtYXAgc3RlcCBza2lwcGVkOicsIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSk7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICByZXR1cm4gdG90YWw7XG59XG4vKipcbiAqIENPTVBSRUhFTkQ6IG9uZSBPcGVuQUkgY2FsbCAoZ3B0LTRvLCBqc29uX29iamVjdCwgWm9kLXZhbGlkYXRlZCkgd2l0aCB0aGVcbiAqIGRldGVybWluaXN0aWMgQU5BTFlTSVMgaGludHMgaW5qZWN0ZWQgaW50byB0aGUgcHJvbXB0LlxuICpcbiAqIFJldHJ5IHBvbGljeSAoXHUwMEE3NC4yIG9mIHRoZSByb2FkbWFwKTpcbiAqICAgLSA0MjkgICAgICAgICAgICBcdTIxOTIgUmV0cnlhYmxlRXJyb3IoeyByZXRyeUFmdGVyIH0pIHVzaW5nIFJldHJ5LUFmdGVyIGhlYWRlciAoZmFsbGJhY2sgMXMpXG4gKiAgIC0gNXh4IC8gbmV0d29yayAgXHUyMTkyIHBsYWluIEVycm9yIFx1MjE5MiBTREsgYXV0by1yZXRyeSAobWF4IDMpXG4gKiAgIC0gbWlzc2luZyBrZXkgICAgXHUyMTkyIEZhdGFsRXJyb3IgKHBlcm1hbmVudCwgbm8gcmV0cnkgc3Rvcm0pXG4gKiAgIC0gc2NoZW1hIHJlamVjdGVkIFx1MjE5MiBwbGFpbiBFcnJvciBcdTIxOTIgU0RLIGF1dG8tcmV0cmllcyAobW9kZWwgb3V0cHV0IGlzIHN0b2NoYXN0aWNcbiAqICAgICAgICAgICAgICAgICAgICAgIGF0IHRlbXBlcmF0dXJlIDAuMik7IHJ1biBmYWlscyB3aXRoIGEgY2xlYXIgbWVzc2FnZSBhZnRlclxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIFNESydzIHJldHJ5IGJ1ZGdldCBpcyBleGhhdXN0ZWQuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXByZWhlbmRXb3JrYm9va1N0ZXAoc2hlZXRzLCBoaW50cywgbW9kZWwgPSAnZ3B0LTRvJywgb3BlbmFpQXBpS2V5KSB7XG4gICAgY29uc3QgYXBpS2V5ID0gb3BlbmFpQXBpS2V5IHx8IHByb2Nlc3MuZW52Lk9QRU5BSV9BUElfS0VZO1xuICAgIGlmICghYXBpS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdPcGVuQUkgQVBJIGtleSBub3QgY29uZmlndXJlZC4gU2V0IGl0IGluIENvbmZpZyA+IE9wZW5BSSBLZXkgKHZpYSB0aGUgcmVzZWVkIHJvdXRlKSBvciBzZXQgT1BFTkFJX0FQSV9LRVkgZW52IHZhci4nKTtcbiAgICB9XG4gICAgY29uc3QgYmxvY2tzID0gc2hlZXRzLm1hcCgoeyB0YWJOYW1lLCB0ZXh0IH0pPT4oe1xuICAgICAgICAgICAgdGFiTmFtZSxcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgfSkpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjb21wcmVoZW5kT25jZShibG9ja3MsIHtcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgaGludHMsXG4gICAgICAgICAgICBhcGlLZXlcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDb21wcmVoZW5kSHR0cEVycm9yKSB7XG4gICAgICAgICAgICBpZiAoZXJyLnN0YXR1cyA9PT0gNDI5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0cnlBZnRlclNlY29uZHMgPSBlcnIucmV0cnlBZnRlclNlY29uZHMgPz8gMTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmV0cnlhYmxlRXJyb3IoZXJyLm1lc3NhZ2UsIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0cnlBZnRlcjogYCR7cmV0cnlBZnRlclNlY29uZHN9c2BcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIDV4eCBldGMgXHUyMTkyIHBsYWluIEVycm9yIFx1MjE5MiBTREsgYXV0by1yZXRyeSAobWF4IDMpXG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFNjaGVtYS9KU09OIHJlamVjdGlvbiBcdTIwMTQgdGhlIG1vZGVsIG1heSBwcm9kdWNlIHZhbGlkIG91dHB1dCBvbiByZXRyeS5cbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgfVxufVxuLyoqXG4gKiBFbWl0IGEgcHJvZ3Jlc3MgY2h1bmsgdG8gdGhlIHJ1bidzIHdyaXRhYmxlIHN0cmVhbSAoU1NFIHBheWxvYWQpLlxuICogTXVzdCBiZSBhIHN0ZXA6IHdvcmtmbG93IGZ1bmN0aW9ucyBjYW5ub3QgaW50ZXJhY3Qgd2l0aCB0aGUgc3RyZWFtIGRpcmVjdGx5LlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbWl0UHJvZ3Jlc3NTdGVwKHdyaXRhYmxlLCBjaHVuaykge1xuICAgIGF3YWl0IHdyaXRlUHJvZ3Jlc3NDaHVuayh3cml0YWJsZSwgY2h1bmspO1xufVxuLyoqXG4gKiBDbG9zZSB0aGUgcnVuJ3Mgd3JpdGFibGUgc3RyZWFtLCBzaWduYWxpbmcgY29tcGxldGlvbiB0byBzdHJlYW0gcmVhZGVycy5cbiAqIE11c3QgYmUgYSBzdGVwOiB3b3JrZmxvdyBmdW5jdGlvbnMgY2Fubm90IGludGVyYWN0IHdpdGggdGhlIHN0cmVhbSBkaXJlY3RseS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0ZXAod3JpdGFibGUpIHtcbiAgICBhd2FpdCBjbG9zZVByb2dyZXNzU3RyZWFtKHdyaXRhYmxlKTtcbn1cbi8vIFx1MjUwMFx1MjUwMCBQaGFzZSAzOiBQT1BVTEFURSBzdGVwcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8qKlxuICogVXBzZXJ0IGZpbmFuY2lhbCBwcm9qZWN0aW9ucyBmcm9tIHRoZSBBSSBjb21wcmVoZW5zaW9uLlxuICogSWRlbXBvdGVudDogT04gQ09ORkxJQ1QgKHBlcmlvZCwgZGF0YV90eXBlLCBzY2VuYXJpbykgRE8gVVBEQVRFLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBwb3B1bGF0ZVByb2plY3Rpb25zU3RlcChjb21wcmVoZW5zaW9uLCBkYlVybCkge1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgIGZvciAoY29uc3QgbWV0cmljIG9mIGNvbXByZWhlbnNpb24ucHJvamVjdGlvbnMpe1xuICAgICAgICAgICAgY29uc3QgeWVhciA9IE51bWJlcihtZXRyaWMucGVyaW9kLnNsaWNlKDAsIDQpKTtcbiAgICAgICAgICAgIGNvbnN0IG1vbnRoID0gTnVtYmVyKG1ldHJpYy5wZXJpb2Quc2xpY2UoNSwgNykpO1xuICAgICAgICAgICAgY29uc3QgcmV2ZW51ZSA9IE1hdGgucm91bmQobWV0cmljLnJldmVudWUgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBlYml0ZGEgPSBNYXRoLnJvdW5kKG1ldHJpYy5lYml0ZGEgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBuZXRJbmNvbWUgPSBNYXRoLnJvdW5kKG1ldHJpYy5uZXRJbmNvbWUgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBndWVzdHMgPSBNYXRoLnJvdW5kKG1ldHJpYy5ndWVzdHMgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBzdGFmZkNvc3QgPSBNYXRoLnJvdW5kKG1ldHJpYy5zdGFmZkNvc3QgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBwbmxMaW5lcyA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ3JldmVudWUnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1JldmVudWUnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmV2ZW51ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdlYml0ZGEnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VCSVREQScsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBlYml0ZGFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnbmV0X2luY29tZScsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTmV0IEluY29tZScsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBuZXRJbmNvbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnc3RhZmZfY29zdCcsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU3RhZmYgQ29zdCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzdGFmZkNvc3RcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnZ3Vlc3RzJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdHdWVzdHMnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZ3Vlc3RzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gZmluYW5jaWFsX3Byb2plY3Rpb25zIChwZXJpb2QsIHllYXIsIG1vbnRoLCBkYXRhX3R5cGUsIHNjZW5hcmlvLCByZXZlbnVlLCBlYml0ZGEsIG5ldF9pbmNvbWUsIGd1ZXN0cywgc3RhZmZfY29zdCwgcG5sX2xpbmVzKVxuICAgICAgICAgVkFMVUVTICgkMSwgJDIsICQzLCAkNCwgJDUsICQ2LCAkNywgJDgsICQ5LCAkMTAsICQxMTo6anNvbmIpXG4gICAgICAgICBPTiBDT05GTElDVCAocGVyaW9kLCBkYXRhX3R5cGUsIHNjZW5hcmlvKVxuICAgICAgICAgRE8gVVBEQVRFIFNFVFxuICAgICAgICAgICByZXZlbnVlID0gRVhDTFVERUQucmV2ZW51ZSxcbiAgICAgICAgICAgZWJpdGRhID0gRVhDTFVERUQuZWJpdGRhLFxuICAgICAgICAgICBuZXRfaW5jb21lID0gRVhDTFVERUQubmV0X2luY29tZSxcbiAgICAgICAgICAgZ3Vlc3RzID0gRVhDTFVERUQuZ3Vlc3RzLFxuICAgICAgICAgICBzdGFmZl9jb3N0ID0gRVhDTFVERUQuc3RhZmZfY29zdCxcbiAgICAgICAgICAgcG5sX2xpbmVzID0gRVhDTFVERUQucG5sX2xpbmVzO2AsIFtcbiAgICAgICAgICAgICAgICBtZXRyaWMucGVyaW9kLFxuICAgICAgICAgICAgICAgIHllYXIsXG4gICAgICAgICAgICAgICAgbW9udGgsXG4gICAgICAgICAgICAgICAgbWV0cmljLmRhdGFUeXBlLFxuICAgICAgICAgICAgICAgIG1ldHJpYy5zY2VuYXJpbyxcbiAgICAgICAgICAgICAgICByZXZlbnVlLFxuICAgICAgICAgICAgICAgIGViaXRkYSxcbiAgICAgICAgICAgICAgICBuZXRJbmNvbWUsXG4gICAgICAgICAgICAgICAgZ3Vlc3RzLFxuICAgICAgICAgICAgICAgIHN0YWZmQ29zdCxcbiAgICAgICAgICAgICAgICBwbmxMaW5lc1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvdW50O1xufVxuLyoqIE5vcm1hbGl6ZSBhIHNoZWV0IHRhYiBuYW1lIGludG8gYSBVUkwtc2FmZSBzbHVnLiAqLyBmdW5jdGlvbiBub3JtYWxpemVTbHVnKG5hbWUpIHtcbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1smXS9nLCAnYW5kJykucmVwbGFjZSgvW1xcc10rL2csICctJykucmVwbGFjZSgvW15hLXowLTktXS9nLCAnJykucmVwbGFjZSgvLSsvZywgJy0nKS5yZXBsYWNlKC9eLXwtJC9nLCAnJyk7XG59XG4vKiogUGFnZSBibG9ja3MgcGVyIHNoZWV0IGNhdGVnb3J5IChtaXJyb3JzIHBpcGVsaW5lLnRzIENBVEVHT1JZX0JMT0NLUykuICovIGNvbnN0IFNIRUVUX0NBVEVHT1JZX0JMT0NLUyA9IHtcbiAgICBkYWlseV9zYWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdEYWlseSBTYWxlcyBcdTIwMTQgRGF0YSdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnRGFpbHkgU2FsZXMgXHUyMDE0IFRyZW5kcydcbiAgICAgICAgfVxuICAgIF0sXG4gICAgcHJvZml0X2xvc3M6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAncG5sX3RhYmxlJyxcbiAgICAgICAgICAgIHRpdGxlOiAnUHJvZml0ICYgTG9zcyBcdTIwMTQgU3RhdGVtZW50J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdQcm9maXQgJiBMb3NzIFx1MjAxNCBUcmVuZHMnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIGJhbGFuY2Vfc2hlZXQ6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnQmFsYW5jZSBTaGVldCBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgdHJpYWxfYmFsYW5jZTogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdUcmlhbCBCYWxhbmNlIFx1MjAxNCBEYXRhJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBnZW5lcmFsX2xlZGdlcjogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdHZW5lcmFsIExlZGdlciBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgY29zdF9vZl9zYWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdDb3N0IG9mIFNhbGVzIFx1MjAxNCBEYXRhJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBtb250aF9vbl9tb250aDogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdNb250aCBvbiBNb250aCBcdTIwMTQgQ29tcGFyaXNvbidcbiAgICAgICAgfVxuICAgIF0sXG4gICAgYnJlYWtfZXZlbjogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdrcGlfY2FyZHMnLFxuICAgICAgICAgICAgdGl0bGU6ICdCcmVhay1FdmVuIFx1MjAxNCBLUElzJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdCcmVhay1FdmVuIFx1MjAxNCBUcmVuZCdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgdmFyaWFuY2U6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTW9udGhseSBWYXJpYW5jZSBcdTIwMTQgQW5hbHlzaXMnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIHN1bW1hcnlfcGw6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTXVsdGktWWVhciBQJkwgXHUyMDE0IFRyZW5kJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdwbmxfdGFibGUnLFxuICAgICAgICAgICAgdGl0bGU6ICdNdWx0aS1ZZWFyIFAmTCBcdTIwMTQgU3RhdGVtZW50J1xuICAgICAgICB9XG4gICAgXSxcbiAgICBzdW1tYXJ5X2JzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3NoZWV0X3ZpZXdlcicsXG4gICAgICAgICAgICB0aXRsZTogJ011bHRpLVllYXIgQmFsYW5jZSBTaGVldCBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgb3RoZXI6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnU2hlZXQgRGF0YSdcbiAgICAgICAgfVxuICAgIF1cbn07XG4vKipcbiAqIENyZWF0ZS91cGRhdGUgZHluYW1pYyBhcHAgcGFnZXMgKyBwYWdlIHNlY3Rpb25zIGZvciBlYWNoIGNvbXByZWhlbmRlZCBzaGVldC5cbiAqXG4gKiBcdTAwQTc3LjEgRklYOiBPTiBDT05GTElDVCAoc2x1ZykgRE8gVVBEQVRFIC4uLiBSRVRVUk5JTkcgaWQgZW5zdXJlcyB3ZSBhbHdheXNcbiAqIGhhdmUgdGhlIGNvcnJlY3QgcGFnZSBJRCAobmV3IG9yIGV4aXN0aW5nKS4gUGFnZSBzZWN0aW9ucyBhcmUgZGVsZXRlZCBhbmRcbiAqIHJlLWluc2VydGVkIHNjb3BlZCB0byB0aGF0IGlkIFx1MjAxNCBubyBvcnBoYW4gRksgcmVmZXJlbmNlcy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBzZXJ0U2hlZXRQYWdlc1N0ZXAoY29tcHJlaGVuc2lvbiwgZGJVcmwsIHRlbmFudFNsdWcpIHtcbiAgICBjb25zdCBjcmVhdGVkID0gW107XG4gICAgbGV0IHNvcnRPcmRlciA9IDEwMDtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgZm9yIChjb25zdCBzaGVldCBvZiBjb21wcmVoZW5zaW9uLnNoZWV0cyl7XG4gICAgICAgICAgICBjb25zdCBzbHVnID0gYHNoZWV0LSR7bm9ybWFsaXplU2x1ZyhzaGVldC50YWJOYW1lKX1gO1xuICAgICAgICAgICAgY29uc3QgYmxvY2tzID0gU0hFRVRfQ0FURUdPUllfQkxPQ0tTW3NoZWV0LmNhdGVnb3J5XSA/PyBTSEVFVF9DQVRFR09SWV9CTE9DS1Mub3RoZXI7XG4gICAgICAgICAgICAvLyBcdTAwQTc3LjEgZml4OiBSRVRVUk5JTkcgaWQgZ2l2ZXMgdXMgdGhlIHJlYWwgcGFnZSBJRCBvbiBpbnNlcnQgT1IgY29uZmxpY3QuXG4gICAgICAgICAgICBjb25zdCBwYWdlUm93cyA9IGF3YWl0IHF1ZXJ5Um93cyhkYiwgYElOU0VSVCBJTlRPIGFwcF9wYWdlcyAoaWQsIHNsdWcsIHRpdGxlLCBhdXRoX3RpZXIsIHNvcnRfb3JkZXIsIG5hdl9sYWJlbCwgc2hvd19pbl9uYXYsIHRlbmFudF9zbHVnKVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICQyLCAnZ29vZ2xlJywgJDMsICQ0LCB0cnVlLCAkNSlcbiAgICAgICAgIE9OIENPTkZMSUNUIChzbHVnKSBETyBVUERBVEUgU0VUXG4gICAgICAgICAgIHRpdGxlID0gRVhDTFVERUQudGl0bGUsXG4gICAgICAgICAgIGF1dGhfdGllciA9IEVYQ0xVREVELmF1dGhfdGllcixcbiAgICAgICAgICAgc29ydF9vcmRlciA9IEVYQ0xVREVELnNvcnRfb3JkZXIsXG4gICAgICAgICAgIG5hdl9sYWJlbCA9IEVYQ0xVREVELm5hdl9sYWJlbCxcbiAgICAgICAgICAgc2hvd19pbl9uYXYgPSBFWENMVURFRC5zaG93X2luX25hdixcbiAgICAgICAgICAgdGVuYW50X3NsdWcgPSBDT0FMRVNDRShFWENMVURFRC50ZW5hbnRfc2x1ZywgYXBwX3BhZ2VzLnRlbmFudF9zbHVnKVxuICAgICAgICAgUkVUVVJOSU5HIGlkO2AsIFtcbiAgICAgICAgICAgICAgICBzbHVnLFxuICAgICAgICAgICAgICAgIHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgIHNvcnRPcmRlcisrLFxuICAgICAgICAgICAgICAgIHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgIHRlbmFudFNsdWcgPz8gbnVsbFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb25zdCBwYWdlSWQgPSBwYWdlUm93c1swXT8uaWQ7XG4gICAgICAgICAgICBpZiAoIXBhZ2VJZCkgY29udGludWU7XG4gICAgICAgICAgICAvLyBSZXBsYWNlIHNlY3Rpb25zIGZvciB0aGlzIHBhZ2UgKGlkZW1wb3RlbnQgb24gcmV0cnkpLlxuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYERFTEVURSBGUk9NIHBhZ2Vfc2VjdGlvbnMgV0hFUkUgcGFnZV9pZCA9ICQxO2AsIFtcbiAgICAgICAgICAgICAgICBwYWdlSWRcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeU1hcmtkb3duID0gW1xuICAgICAgICAgICAgICAgIGAjICR7c2hlZXQudGl0bGV9YCxcbiAgICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgICBzaGVldC5zdW1tYXJ5LFxuICAgICAgICAgICAgICAgIHNoZWV0LnBlcmlvZEhpbnQgPyBgXFxuKipQZXJpb2QqKjogJHtzaGVldC5wZXJpb2RIaW50fWAgOiAnJyxcbiAgICAgICAgICAgICAgICBgKipSb3dzKio6ICR7c2hlZXQucm93Q291bnQgPz8gJ1x1MjAxNCd9ICB8ICAqKkNvbHVtbnMqKjogJHsoc2hlZXQuY29sdW1ucyA/PyBbXSkubGVuZ3RoIHx8ICdcdTIwMTQnfWAsXG4gICAgICAgICAgICAgICAgJydcbiAgICAgICAgICAgIF0uZmlsdGVyKChsKT0+bCAhPT0gJycpLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgLy8gZG9jX21hcmtkb3duIGJsb2NrXG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gcGFnZV9zZWN0aW9ucyAoaWQsIHBhZ2VfaWQsIHNvcnRfb3JkZXIsIGJsb2NrX3R5cGUsIGNvbmZpZylcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAwLCAnZG9jX21hcmtkb3duJywgJDI6Ompzb25iKTtgLCBbXG4gICAgICAgICAgICAgICAgcGFnZUlkLFxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdBYm91dCB0aGlzIHNoZWV0JyxcbiAgICAgICAgICAgICAgICAgICAgbWFya2Rvd246IHN1bW1hcnlNYXJrZG93blxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIC8vIENhdGVnb3J5LXNwZWNpZmljIGJsb2Nrc1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgY29uc3QgYmxvY2sgPSBibG9ja3NbaV07XG4gICAgICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIHBhZ2Vfc2VjdGlvbnMgKGlkLCBwYWdlX2lkLCBzb3J0X29yZGVyLCBibG9ja190eXBlLCBjb25maWcpXG4gICAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAkMiwgJDMsICQ0Ojpqc29uYik7YCwgW1xuICAgICAgICAgICAgICAgICAgICBwYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgIGkgKyAxLFxuICAgICAgICAgICAgICAgICAgICBibG9jay5ibG9ja1R5cGUsXG4gICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWV0OiBzaGVldC50YWJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGJsb2NrLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjcmVhdGVkLnB1c2goe1xuICAgICAgICAgICAgICAgIHNsdWcsXG4gICAgICAgICAgICAgICAgdGl0bGU6IHNoZWV0LnRpdGxlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBdXRvLXBvcHVsYXRlIG5hdmlnYXRpb25faXRlbXM6IGFkZCBlYWNoIHNoZWV0IHBhZ2UgYXMgYSBjaGlsZCBvZiB0aGUgXCJFeGNlbFwiIGZvbGRlci5cbiAgICAgICAgLy8gRmluZCB0aGUgRXhjZWwgZm9sZGVyIGZpcnN0LCBvciBjcmVhdGUgaXQgaWYgaXQgZG9lc24ndCBleGlzdCB5ZXQuXG4gICAgICAgIGNvbnN0IGV4Y2VsRm9sZGVyID0gYXdhaXQgcXVlcnlSb3dzKGRiLCBgU0VMRUNUIGlkIEZST00gbmF2aWdhdGlvbl9pdGVtcyBXSEVSRSB0aXRsZSA9ICQxIEFORCBwYXJlbnRfaWQgSVMgTlVMTCBMSU1JVCAxYCwgW1xuICAgICAgICAgICAgJ0V4Y2VsJ1xuICAgICAgICBdKTtcbiAgICAgICAgbGV0IGV4Y2VsSWQgPSBleGNlbEZvbGRlclswXT8uaWQ7XG4gICAgICAgIGlmICghZXhjZWxJZCkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBFeGNlbCBmb2xkZXIgaWYgaXQgZG9lc24ndCBleGlzdCB5ZXRcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCBxdWVyeVJvd3MoZGIsIGBJTlNFUlQgSU5UTyBuYXZpZ2F0aW9uX2l0ZW1zIChpZCwgcGFyZW50X2lkLCBzb3J0X29yZGVyLCB0aXRsZSwgcGF0aCwgaWNvbiwgYXV0aF90aWVyLCByZXF1aXJlZF9ncm91cHMsIGlzX3Zpc2libGUsIGlzX2R5bmFtaWMpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCBOVUxMLCAoU0VMRUNUIENPQUxFU0NFKE1BWChzb3J0X29yZGVyKSwgMCkgKyAxIEZST00gbmF2aWdhdGlvbl9pdGVtcyBXSEVSRSBwYXJlbnRfaWQgSVMgTlVMTCksXG4gICAgICAgICAnRXhjZWwnLCAnL2V4Y2VsJywgJ0ZvbGRlcicsIENBU1QoJ2dvb2dsZScgQVMgXCJBdXRoVGllclwiKSwgJ3ZpZXdlcixvcHMtYWRtaW4sZmluYW5jZSxwbGF0Zm9ybS1hZG1pbicsIHRydWUsIHRydWUpXG4gICAgICAgICBSRVRVUk5JTkcgaWRgKTtcbiAgICAgICAgICAgIGV4Y2VsSWQgPSBjcmVhdGVkWzBdPy5pZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXhjZWxJZCkge1xuICAgICAgICAgICAgbGV0IG5hdlNvcnQgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzaGVldCBvZiBjb21wcmVoZW5zaW9uLnNoZWV0cyl7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2x1ZyA9IGBzaGVldC0ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YDtcbiAgICAgICAgICAgICAgICAvLyBTa2lwIGlmIGFscmVhZHkgcHJlc2VudFxuICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgcXVlcnlSb3dzKGRiLCBgU0VMRUNUIGlkIEZST00gbmF2aWdhdGlvbl9pdGVtcyBXSEVSRSBwYXRoID0gJDEgQU5EIHBhcmVudF9pZCA9ICQyIExJTUlUIDFgLCBbXG4gICAgICAgICAgICAgICAgICAgIGAvJHtzbHVnfWAsXG4gICAgICAgICAgICAgICAgICAgIGV4Y2VsSWRcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBuYXZpZ2F0aW9uX2l0ZW1zIChpZCwgcGFyZW50X2lkLCBzb3J0X29yZGVyLCB0aXRsZSwgcGF0aCwgaWNvbiwgYXV0aF90aWVyLCByZXF1aXJlZF9ncm91cHMsIGlzX3Zpc2libGUsIGlzX2R5bmFtaWMpXG4gICAgICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICQyLCAkMywgJDQsICdEZXNjcmlwdGlvbicsIENBU1QoJ2dvb2dsZScgQVMgXCJBdXRoVGllclwiKSwgJycsIHRydWUsIHRydWUpYCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhjZWxJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hdlNvcnQrKyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYC8ke3NsdWd9YFxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY3JlYXRlZDtcbn1cbi8qKiBVcHNlcnQga25vd2xlZGdlIHNuaXBwZXRzIChmdWxsIGNvbXByZWhlbnNpb24gKyBwZXItc2hlZXQgbWFya2Rvd24pLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVNuaXBwZXRzU3RlcChjb21wcmVoZW5zaW9uLCBtb2RlbCwgZGJVcmwpIHtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICAvLyBSYXcgY29tcHJlaGVuc2lvbiBKU09OICh1c2VkIGJ5IEFJIGNoYXQgLyByZXByb2Nlc3MpLlxuICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjYXRlZ29yeSwgY29udGVudClcbiAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJ2RvY3VtZW50JywgJDIpXG4gICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudDtgLCBbXG4gICAgICAgICAgICAnd29ya2Jvb2tfY29tcHJlaGVuc2lvbicsXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgY29tcHJlaGVuZGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBjb21wcmVoZW5zaW9uXG4gICAgICAgICAgICB9KVxuICAgICAgICBdKTtcbiAgICAgICAgY291bnQrKztcbiAgICAgICAgLy8gT25lIGh1bWFuLXJlYWRhYmxlIHNuaXBwZXQgcGVyIHNoZWV0LlxuICAgICAgICBmb3IgKGNvbnN0IHNoZWV0IG9mIGNvbXByZWhlbnNpb24uc2hlZXRzKXtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGBzaGVldF8ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YDtcbiAgICAgICAgICAgIGNvbnN0IG1hcmtkb3duID0gW1xuICAgICAgICAgICAgICAgIGAjICR7c2hlZXQudGl0bGV9YCxcbiAgICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgICBzaGVldC5zdW1tYXJ5LFxuICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgIGAqKkNhdGVnb3J5Kio6ICR7c2hlZXQuY2F0ZWdvcnl9YCxcbiAgICAgICAgICAgICAgICBzaGVldC5wZXJpb2RIaW50ID8gYCoqUGVyaW9kKio6ICR7c2hlZXQucGVyaW9kSGludH1gIDogJydcbiAgICAgICAgICAgIF0uZmlsdGVyKChsKT0+bCAhPT0gJycpLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY2F0ZWdvcnksIGNvbnRlbnQpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJ3NoZWV0JywgJDIpXG4gICAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50O2AsIFtcbiAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgbWFya2Rvd25cbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb3VudDtcbn1cbi8qKlxuICogRGV0ZXJtaW5pc3RpYyB0ZW1wbGF0ZS1maXQgc2NvcmluZyAoXHUwMEE3NS41KS5cbiAqXG4gKiBTY29yZXMgdGhlIEFJLXN1Z2dlc3RlZCB0ZW1wbGF0ZSBhZ2FpbnN0IHRoZSBjb21wcmVoZW5kZWQgc2hlZXQgY2F0ZWdvcmllcy5cbiAqIE5vIGV4dGVybmFsIGltcG9ydHMgXHUyMDE0IGFsbCB0ZW1wbGF0ZSBkYXRhIGlzIGhhcmRjb2RlZCB0byBrZWVwIHRoZSBidW5kbGUgbGVhbi5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VsZWN0VGVtcGxhdGVTdGVwKGNvbXByZWhlbnNpb24pIHtcbiAgICBjb25zdCBhaVRlbXBsYXRlID0gY29tcHJlaGVuc2lvbi50ZW1wbGF0ZTtcbiAgICBjb25zdCBhaUNvbmZpZGVuY2UgPSBhaVRlbXBsYXRlPy5jb25maWRlbmNlID8/IDAuNTtcbiAgICBjb25zdCBzaGVldENhdGVnb3JpZXMgPSBjb21wcmVoZW5zaW9uLnNoZWV0cy5tYXAoKHMpPT5zLmNhdGVnb3J5KTtcbiAgICAvLyBDYXRlZ29yeSBwcm9maWxlIHBlciB0ZW1wbGF0ZSAod2hpY2ggc2hlZXQgY2F0ZWdvcmllcyBtYXRjaCBiZXN0KS5cbiAgICBjb25zdCB0ZW1wbGF0ZVByb2ZpbGVzID0ge1xuICAgICAgICAnZmluYW5jaWFsLWFuYWx5dGljcyc6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgICAgICAgICAnYnJlYWtfZXZlbicsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJyxcbiAgICAgICAgICAgICAgICAndHJpYWxfYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ3N1bW1hcnlfcGwnLFxuICAgICAgICAgICAgICAgICdzdW1tYXJ5X2JzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICAgICAgJ3BubCcsXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdCcsXG4gICAgICAgICAgICAgICAgJ2xvc3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnYnJlYWsgZXZlbicsXG4gICAgICAgICAgICAgICAgJ2JlcCcsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICByZXN0YXVyYW50OiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ2RhaWx5X3NhbGVzJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnYnJlYWtfZXZlbicsXG4gICAgICAgICAgICAgICAgJ21vbnRoX29uX21vbnRoJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ3Jlc3RhdXJhbnQnLFxuICAgICAgICAgICAgICAgICdraXRjaGVuJyxcbiAgICAgICAgICAgICAgICAnbWVudScsXG4gICAgICAgICAgICAgICAgJ2Zvb2QnLFxuICAgICAgICAgICAgICAgICdiZXZlcmFnZScsXG4gICAgICAgICAgICAgICAgJ2NvdmVycycsXG4gICAgICAgICAgICAgICAgJ2d1ZXN0cydcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgaG90ZWw6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAnZGFpbHlfc2FsZXMnLFxuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ21vbnRoX29uX21vbnRoJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdob3RlbCcsXG4gICAgICAgICAgICAgICAgJ3Jvb21zJyxcbiAgICAgICAgICAgICAgICAnb2NjdXBhbmN5JyxcbiAgICAgICAgICAgICAgICAncmV2cGFyJyxcbiAgICAgICAgICAgICAgICAnaG91c2VrZWVwaW5nJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICAnZWNvbW1lcmNlLXJldGFpbCc6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAnZGFpbHlfc2FsZXMnLFxuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICAgICAgICAgICAgICd2YXJpYW5jZSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdlY29tbWVyY2UnLFxuICAgICAgICAgICAgICAgICdyZXRhaWwnLFxuICAgICAgICAgICAgICAgICdvbmxpbmUnLFxuICAgICAgICAgICAgICAgICdza3UnLFxuICAgICAgICAgICAgICAgICdjYXJ0JyxcbiAgICAgICAgICAgICAgICAnY29udmVyc2lvbidcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgaGVhbHRoY2FyZToge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2hlYWx0aCcsXG4gICAgICAgICAgICAgICAgJ3BhdGllbnQnLFxuICAgICAgICAgICAgICAgICdjbGluaWMnLFxuICAgICAgICAgICAgICAgICdtZWRpY2FsJyxcbiAgICAgICAgICAgICAgICAncGhhcm1hY3knXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgICdzdXBwbHktY2hhaW4nOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdzdXBwbHknLFxuICAgICAgICAgICAgICAgICdsb2dpc3RpY3MnLFxuICAgICAgICAgICAgICAgICdpbnZlbnRvcnknLFxuICAgICAgICAgICAgICAgICd3YXJlaG91c2UnLFxuICAgICAgICAgICAgICAgICdzaGlwcGluZydcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgJ3JlYWwtZXN0YXRlJzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICdzdW1tYXJ5X2JzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ3JlYWwgZXN0YXRlJyxcbiAgICAgICAgICAgICAgICAncHJvcGVydHknLFxuICAgICAgICAgICAgICAgICdsZWFzZScsXG4gICAgICAgICAgICAgICAgJ3JlbnQnLFxuICAgICAgICAgICAgICAgICdtb3J0Z2FnZSdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgZWR1Y2F0aW9uOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnbW9udGhfb25fbW9udGgnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnZWR1Y2F0aW9uJyxcbiAgICAgICAgICAgICAgICAnc3R1ZGVudCcsXG4gICAgICAgICAgICAgICAgJ3R1aXRpb24nLFxuICAgICAgICAgICAgICAgICdjb3Vyc2UnLFxuICAgICAgICAgICAgICAgICdlbnJvbGxtZW50J1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICAncHJvZmVzc2lvbmFsLXNlcnZpY2VzJzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2NvbnN1bHRpbmcnLFxuICAgICAgICAgICAgICAgICdzZXJ2aWNlcycsXG4gICAgICAgICAgICAgICAgJ2JpbGxpbmcnLFxuICAgICAgICAgICAgICAgICdjbGllbnQnLFxuICAgICAgICAgICAgICAgICdwcm9qZWN0J1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBtYW51ZmFjdHVyaW5nOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICd2YXJpYW5jZSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdtYW51ZmFjdHVyaW5nJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdGlvbicsXG4gICAgICAgICAgICAgICAgJ2ZhY3RvcnknLFxuICAgICAgICAgICAgICAgICdiaWxsIG9mIG1hdGVyaWFscycsXG4gICAgICAgICAgICAgICAgJ3dvcmsgb3JkZXInXG4gICAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIGNhdGVnb3J5T3ZlcmxhcCh0bXBsSWQpIHtcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IHRlbXBsYXRlUHJvZmlsZXNbdG1wbElkXTtcbiAgICAgICAgaWYgKCFwcm9maWxlKSByZXR1cm4gMDtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHNoZWV0Q2F0ZWdvcmllcy5maWx0ZXIoKGMpPT5wcm9maWxlLmNhdGVnb3JpZXMuaW5jbHVkZXMoYykpO1xuICAgICAgICByZXR1cm4gc2hlZXRDYXRlZ29yaWVzLmxlbmd0aCA+IDAgPyBtYXRjaGVzLmxlbmd0aCAvIHNoZWV0Q2F0ZWdvcmllcy5sZW5ndGggOiAwO1xuICAgIH1cbiAgICBmdW5jdGlvbiBrZXl3b3JkTWF0Y2godG1wbElkKSB7XG4gICAgICAgIGNvbnN0IHByb2ZpbGUgPSB0ZW1wbGF0ZVByb2ZpbGVzW3RtcGxJZF07XG4gICAgICAgIGlmICghcHJvZmlsZSkgcmV0dXJuIDA7XG4gICAgICAgIGNvbnN0IHRleHQgPSBbXG4gICAgICAgICAgICBjb21wcmVoZW5zaW9uLndvcmtib29rLnRpdGxlLFxuICAgICAgICAgICAgY29tcHJlaGVuc2lvbi53b3JrYm9vay5zdW1tYXJ5LFxuICAgICAgICAgICAgY29tcHJlaGVuc2lvbi53b3JrYm9vay5jb21wYW55ID8/ICcnXG4gICAgICAgIF0uam9pbignICcpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBwcm9maWxlLmtleXdvcmRzLmZpbHRlcigoa3cpPT50ZXh0LmluY2x1ZGVzKGt3KSk7XG4gICAgICAgIHJldHVybiBwcm9maWxlLmtleXdvcmRzLmxlbmd0aCA+IDAgPyBtYXRjaGVzLmxlbmd0aCAvIHByb2ZpbGUua2V5d29yZHMubGVuZ3RoIDogMDtcbiAgICB9XG4gICAgLy8gU2NvcmUgdGhlIEFJLXN1Z2dlc3RlZCB0ZW1wbGF0ZS5cbiAgICBjb25zdCBzdWdnZXN0ZWRTY29yZSA9IGFpVGVtcGxhdGU/LmlkID8gYWlDb25maWRlbmNlICogKGNhdGVnb3J5T3ZlcmxhcChhaVRlbXBsYXRlLmlkKSAqIDAuNyArIGtleXdvcmRNYXRjaChhaVRlbXBsYXRlLmlkKSAqIDAuMykgOiAtMTtcbiAgICAvLyBTY29yZSBhbGwgdGVtcGxhdGVzIGZvciBhbHRlcm5hdGl2ZXMuXG4gICAgY29uc3QgYWxsU2NvcmVzID0gT2JqZWN0LmtleXModGVtcGxhdGVQcm9maWxlcykubWFwKChpZCk9Pih7XG4gICAgICAgICAgICBpZCxcbiAgICAgICAgICAgIHNjb3JlOiBjYXRlZ29yeU92ZXJsYXAoaWQpICogMC43ICsga2V5d29yZE1hdGNoKGlkKSAqIDAuMyxcbiAgICAgICAgICAgIHJlYXNvbjogYCR7TWF0aC5yb3VuZChjYXRlZ29yeU92ZXJsYXAoaWQpICogMTAwKX0lIGNhdGVnb3J5IG1hdGNoLCAke01hdGgucm91bmQoa2V5d29yZE1hdGNoKGlkKSAqIDEwMCl9JSBrZXl3b3JkIG1hdGNoYFxuICAgICAgICB9KSk7XG4gICAgYWxsU2NvcmVzLnNvcnQoKGEsIGIpPT5iLnNjb3JlIC0gYS5zY29yZSk7XG4gICAgY29uc3QgcmVjb21tZW5kZWQgPSBzdWdnZXN0ZWRTY29yZSA+IGFsbFNjb3Jlc1swXS5zY29yZSA/IGFpVGVtcGxhdGUuaWQgOiBhbGxTY29yZXNbMF0uaWQ7XG4gICAgY29uc3QgcmVjb21tZW5kZWRTY29yZSA9IHJlY29tbWVuZGVkID09PSBhaVRlbXBsYXRlPy5pZCA/IHN1Z2dlc3RlZFNjb3JlIDogYWxsU2NvcmVzWzBdLnNjb3JlO1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlY29tbWVuZGVkLFxuICAgICAgICBhaVN1Z2dlc3Rpb246IGFpVGVtcGxhdGU/LmlkID8/IG51bGwsXG4gICAgICAgIGFpQ29uZmlkZW5jZSxcbiAgICAgICAgc2NvcmU6IE1hdGgucm91bmQocmVjb21tZW5kZWRTY29yZSAqIDEwMCkgLyAxMDAsXG4gICAgICAgIHJlYXNvbjogYWxsU2NvcmVzWzBdLnJlYXNvbixcbiAgICAgICAgYWx0ZXJuYXRpdmVzOiBhbGxTY29yZXMuZmlsdGVyKChzKT0+cy5pZCAhPT0gcmVjb21tZW5kZWQpLnNsaWNlKDAsIDMpLm1hcCgocyk9Pih7XG4gICAgICAgICAgICAgICAgaWQ6IHMuaWQsXG4gICAgICAgICAgICAgICAgc2NvcmU6IE1hdGgucm91bmQocy5zY29yZSAqIDEwMCkgLyAxMDBcbiAgICAgICAgICAgIH0pKVxuICAgIH07XG59XG4vKiogQmVzdC1lZmZvcnQgcmVnaXN0ZXIgZHluYW1pYyBwYWdlcyBpbiB0aGUgcnVudGltZSBjYXRhbG9nLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwKGNvbXByZWhlbnNpb24pIHtcbiAgICAvLyBzZXREeW5hbWljUGFnZXMgaXMgYSBydW50aW1lLXNpZGUgZWZmZWN0OyBpbiB0aGUgd29ya2Zsb3cgY29udGV4dCB0aGVcbiAgICAvLyBjYXRhbG9nIHJlYnVpbGRzIGZyb20gREIgYXBwX3BhZ2VzIG9uIG5leHQgcmVxdWVzdC4gQmVzdC1lZmZvcnQuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBzZXREeW5hbWljUGFnZXMgfSA9IGF3YWl0IGltcG9ydCgnLi4vLi4vc3JjL2xpYi9wYWdlLWNhdGFsb2cnKTtcbiAgICAgICAgY29uc3QgcGFnZXMgPSBjb21wcmVoZW5zaW9uLnNoZWV0cy5tYXAoKHNoZWV0KT0+KHtcbiAgICAgICAgICAgICAgICBzbHVnOiBgc2hlZXQtJHtub3JtYWxpemVTbHVnKHNoZWV0LnRhYk5hbWUpfWAsXG4gICAgICAgICAgICAgICAgdGl0bGU6IHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgICAgICAgICBuYXZMYWJlbDogc2hlZXQudGl0bGUsXG4gICAgICAgICAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGBzaGVldF8ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogc2hlZXQudGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKFNIRUVUX0NBVEVHT1JZX0JMT0NLU1tzaGVldC5jYXRlZ29yeV0gPz8gU0hFRVRfQ0FURUdPUllfQkxPQ0tTLm90aGVyKS5tYXAoKGIpPT4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogYi5ibG9ja1R5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoZWV0OiBzaGVldC50YWJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogYi50aXRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgc2V0RHluYW1pY1BhZ2VzKHBhZ2VzKTtcbiAgICAgICAgcmV0dXJuIHBhZ2VzLmxlbmd0aDtcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIC8vIFJ1bnRpbWUgY2F0YWxvZyB1bmF2YWlsYWJsZSBpbiB3b3JrZmxvdyBjb250ZXh0IFx1MjAxNCBub24tY3JpdGljYWwuXG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbn1cbi8vIFx1MjUwMFx1MjUwMCBQaGFzZSA1OiBHRU5FUkFURSBzdGVwcyAoT3BlbkFJIFx1MjE5MiBCUiAvIEVTIC8gRGFzaGJvYXJkKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8qKiBQYXJzZSBCdXNpbmVzcyBSZXZpZXcgbWFya2Rvd24gaW50byBwYXJ0IHNlY3Rpb25zIChsaWdodHdlaWdodCBpbmxpbmUgcGFyc2VyKS4gKi8gZnVuY3Rpb24gcGFyc2VSZXZpZXdQYXJ0cyhtYXJrZG93bikge1xuICAgIGNvbnN0IHBhcnRzID0gW107XG4gICAgY29uc3QgaGVhZGVyUmUgPSAvXiN7MiwzfVxccytQYXJ0XFxzKyhbQS1aXSk6XFxzKiguKykkL207XG4gICAgY29uc3Qgc2VjdGlvbnMgPSBtYXJrZG93bi5zcGxpdCgvXFxuKD89I3syLDN9XFxzK1BhcnRcXHMrW0EtWl06KS8pO1xuICAgIGxldCBzb3J0T3JkZXIgPSAwO1xuICAgIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBzZWN0aW9ucyl7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gaGVhZGVyUmUuZXhlYyhzZWN0aW9uKTtcbiAgICAgICAgaWYgKCFtYXRjaCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IFssIGxldHRlciwgcmF3VGl0bGVdID0gbWF0Y2g7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gKHJhd1RpdGxlID8/IHNlY3Rpb24uc3BsaXQoJ1xcbicpWzBdPy5yZXBsYWNlKC9eI3syLDN9XFxzK1BhcnRcXHMrW0EtWl06XFxzKi8sICcnKSA/PyAnJykudHJpbSgpO1xuICAgICAgICBjb25zdCBzbHVnID0gYHBhcnQtJHsobGV0dGVyID8/ICdhJykudG9Mb3dlckNhc2UoKX1gO1xuICAgICAgICBjb25zdCBwYXJ0S2V5ID0gYHBhcnRfJHsobGV0dGVyID8/ICdhJykudG9Mb3dlckNhc2UoKX1gO1xuICAgICAgICBwYXJ0cy5wdXNoKHtcbiAgICAgICAgICAgIHNsdWcsXG4gICAgICAgICAgICBwYXJ0S2V5LFxuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBzb3J0T3JkZXI6IHNvcnRPcmRlcisrLFxuICAgICAgICAgICAgbWFya2Rvd246IHNlY3Rpb24udHJpbSgpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcGFydHM7XG59XG4vKipcbiAqIEdlbmVyYXRlIHRoZSBCdXNpbmVzcyBSZXZpZXcgZnJvbSBjb21wcmVoZW5zaW9uIGRhdGEuXG4gKiBTYXZlcyBwYXJzZWQgcGFydHMgdG8gYnVzaW5lc3NfcmV2aWV3X3BhcnRzIHZpYSBwZy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXAoY29tcHJlaGVuc2lvbiwgYXBpS2V5LCBkYlVybCwgbW9kZWwgPSAnZ3B0LTRvJykge1xuICAgIGNvbnN0IHByb21wdCA9IGJ1aWxkR2VuUHJvbXB0KGNvbXByZWhlbnNpb24sICdidXNpbmVzc1JldmlldycpO1xuICAgIGxldCBtYXJrZG93bjtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICdZb3UgYXJlIGEgcHJlY2lzZSBmaW5hbmNpYWwgYW5hbHlzdCBhbmQgYnVzaW5lc3Mgd3JpdGVyLiBSZXR1cm4gT05MWSB2YWxpZCBKU09OLidcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogcHJvbXB0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjMsXG4gICAgICAgICAgICAgICAgbWF4X3Rva2VuczogMTYzODQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VfZm9ybWF0OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdqc29uX29iamVjdCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBPcGVuQUkgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pYCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgY29uc3QgcmVwbHkgPSByZXN1bHQuY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50ID8/ICcnO1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJlcGx5KTtcbiAgICAgICAgbWFya2Rvd24gPSBwYXJzZWQuYnVzaW5lc3NSZXZpZXcgPz8gJyc7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQnVzaW5lc3MgUmV2aWV3IGdlbmVyYXRpb24gZmFpbGVkOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gKTtcbiAgICB9XG4gICAgaWYgKCFtYXJrZG93bi50cmltKCkpIHJldHVybiAwO1xuICAgIGNvbnN0IHBhcnRzID0gcGFyc2VSZXZpZXdQYXJ0cyhtYXJrZG93bik7XG4gICAgbGV0IHNhdmVkID0gMDtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHBhcnRzKXtcbiAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBidXNpbmVzc19yZXZpZXdfcGFydHMgKGlkLCBzbHVnLCBwYXJ0X2tleSwgdGl0bGUsIHNvcnRfb3JkZXIsIGF1dGhfdGllciwgbWFya2Rvd24pXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJDIsICQzLCAkNCwgJ2dvb2dsZScsICQ1KVxuICAgICAgICAgT04gQ09ORkxJQ1QgKHNsdWcpIERPIFVQREFURSBTRVRcbiAgICAgICAgICAgcGFydF9rZXkgPSBFWENMVURFRC5wYXJ0X2tleSxcbiAgICAgICAgICAgdGl0bGUgPSBFWENMVURFRC50aXRsZSxcbiAgICAgICAgICAgc29ydF9vcmRlciA9IEVYQ0xVREVELnNvcnRfb3JkZXIsXG4gICAgICAgICAgIG1hcmtkb3duID0gRVhDTFVERUQubWFya2Rvd247YCwgW1xuICAgICAgICAgICAgICAgIHBhcnQuc2x1ZyxcbiAgICAgICAgICAgICAgICBwYXJ0LnBhcnRLZXksXG4gICAgICAgICAgICAgICAgcGFydC50aXRsZSxcbiAgICAgICAgICAgICAgICBwYXJ0LnNvcnRPcmRlcixcbiAgICAgICAgICAgICAgICBwYXJ0Lm1hcmtkb3duXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIHNhdmVkKys7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc2F2ZWQ7XG59XG4vKipcbiAqIEdlbmVyYXRlIHRoZSBFeGVjdXRpdmUgU3VtbWFyeSBmcm9tIGNvbXByZWhlbnNpb24gZGF0YS5cbiAqIFNhdmVzIHRvIGtub3dsZWRnZV9zbmlwcGV0cyB2aWEgcGcuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXAoY29tcHJlaGVuc2lvbiwgYXBpS2V5LCBkYlVybCwgbW9kZWwgPSAnZ3B0LTRvJykge1xuICAgIGNvbnN0IHByb21wdCA9IGJ1aWxkR2VuUHJvbXB0KGNvbXByZWhlbnNpb24sICdleGVjdXRpdmVTdW1tYXJ5Jyk7XG4gICAgbGV0IG1hcmtkb3duO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJ1lvdSBhcmUgYSBwcmVjaXNlIGZpbmFuY2lhbCBhbmFseXN0IGFuZCBidXNpbmVzcyB3cml0ZXIuIFJldHVybiBPTkxZIHZhbGlkIEpTT04uJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuMyxcbiAgICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAxNjM4NCxcbiAgICAgICAgICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2pzb25fb2JqZWN0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYE9wZW5BSSBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSlgKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBjb25zdCByZXBseSA9IHJlc3VsdC5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgPz8gJyc7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmVwbHkpO1xuICAgICAgICBtYXJrZG93biA9IHBhcnNlZC5leGVjdXRpdmVTdW1tYXJ5ID8/ICcnO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4ZWN1dGl2ZSBTdW1tYXJ5IGdlbmVyYXRpb24gZmFpbGVkOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gKTtcbiAgICB9XG4gICAgaWYgKCFtYXJrZG93bi50cmltKCkpIHJldHVybiBmYWxzZTtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY2F0ZWdvcnksIGNvbnRlbnQpXG4gICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJ2V4ZWN1dGl2ZV9zdW1tYXJ5JywgJ2RvY3VtZW50JywgJDEpXG4gICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudDtgLCBbXG4gICAgICAgICAgICBtYXJrZG93blxuICAgICAgICBdKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbi8qKlxuICogR2VuZXJhdGUgdGhlIERhc2hib2FyZCBEYXRhIGZyb20gY29tcHJlaGVuc2lvbiBkYXRhLlxuICogU2F2ZXMgdG8ga25vd2xlZGdlX3NuaXBwZXRzIHZpYSBwZy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVEYXNoYm9hcmRTdGVwKGNvbXByZWhlbnNpb24sIGFwaUtleSwgZGJVcmwsIG1vZGVsID0gJ2dwdC00bycpIHtcbiAgICBjb25zdCBwcm9tcHQgPSBidWlsZEdlblByb21wdChjb21wcmVoZW5zaW9uLCAnZGFzaGJvYXJkRGF0YScpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJ1lvdSBhcmUgYSBwcmVjaXNlIGZpbmFuY2lhbCBhbmFseXN0LiBSZXR1cm4gT05MWSB2YWxpZCBKU09OIHdpdGgga2V5cyBcImFjdGlvblBoYXNlc1wiLCBcInRhcmdldFJvd3NcIiwgYW5kIFwibGV2ZXJzXCIuJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuMyxcbiAgICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAxNjM4NCxcbiAgICAgICAgICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2pzb25fb2JqZWN0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYE9wZW5BSSBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSlgKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBjb25zdCByZXBseSA9IHJlc3VsdC5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgPz8gJyc7XG4gICAgICAgIGlmICghcmVwbHkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyZXBseSk7XG4gICAgICAgIGlmICghcGFyc2VkLmFjdGlvblBoYXNlcyAmJiAhcGFyc2VkLnRhcmdldFJvd3MgJiYgIXBhcnNlZC5sZXZlcnMpIHJldHVybiBmYWxzZTtcbiAgICAgICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjYXRlZ29yeSwgY29udGVudClcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICdkYXNoYm9hcmRfZGF0YScsICdkb2N1bWVudCcsICQxKVxuICAgICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudDtgLCBbXG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkocGFyc2VkKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIC8vIERhc2hib2FyZCBpcyBub24tY3JpdGljYWwgXHUyMDE0IHN3YWxsb3cgZXJyb3JzXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4vKipcbiAqIEJ1aWxkIGEgZ2VuZXJhdGlvbiBwcm9tcHQgZnJvbSB0aGUgd29ya2Jvb2sgY29tcHJlaGVuc2lvbi5cbiAqIE5vIGV4dGVybmFsIGRlcGVuZGVuY2llcyBcdTIwMTQgcHVyZSBjb21wdXRhdGlvbiBmcm9tIHRoZSBjb21wcmVoZW5zaW9uIHN0YXRlLlxuICovIGZ1bmN0aW9uIGJ1aWxkR2VuUHJvbXB0KGNvbXByZWhlbnNpb24sIHRhcmdldCkge1xuICAgIGNvbnN0IHsgd29ya2Jvb2ssIHNoZWV0cywgcHJvamVjdGlvbnMgfSA9IGNvbXByZWhlbnNpb247XG4gICAgY29uc3QgY29udGV4dCA9IFtcbiAgICAgICAgYCMgR2VuZXJhdGVkIENvbnRlbnQ6ICR7dGFyZ2V0ID09PSAnYnVzaW5lc3NSZXZpZXcnID8gJ0J1c2luZXNzIFJldmlldycgOiB0YXJnZXQgPT09ICdleGVjdXRpdmVTdW1tYXJ5JyA/ICdFeGVjdXRpdmUgU3VtbWFyeScgOiAnRGFzaGJvYXJkIERhdGEnfWAsXG4gICAgICAgICcnLFxuICAgICAgICBgIyMgV29ya2Jvb2sgU3VtbWFyeWAsXG4gICAgICAgIGAqKlRpdGxlKio6ICR7d29ya2Jvb2sudGl0bGV9YCxcbiAgICAgICAgYCoqQ29tcGFueSoqOiAke3dvcmtib29rLmNvbXBhbnkgPz8gJ04vQSd9YCxcbiAgICAgICAgYCoqUGVyaW9kKio6ICR7d29ya2Jvb2sucGVyaW9kID8/ICdOL0EnfWAsXG4gICAgICAgIGAqKkN1cnJlbmN5Kio6ICR7d29ya2Jvb2suY3VycmVuY3kgPz8gJ0lEUid9YCxcbiAgICAgICAgd29ya2Jvb2suc3VtbWFyeSxcbiAgICAgICAgJycsXG4gICAgICAgIGAjIyBTaGVldCBJbnZlbnRvcnkgKCR7c2hlZXRzLmxlbmd0aH0gc2hlZXRzKWAsXG4gICAgICAgIC4uLnNoZWV0cy5tYXAoKHMpPT5gLSAqKiR7cy50YWJOYW1lfSoqICgke3MuY2F0ZWdvcnl9KTogJHtzLnRpdGxlfSBcdTIwMTQgJHtzLnN1bW1hcnl9JHtzLnBlcmlvZEhpbnQgPyBgIFske3MucGVyaW9kSGludH1dYCA6ICcnfWApLFxuICAgICAgICAnJyxcbiAgICAgICAgYCMjIENvbnNvbGlkYXRlZCBGaW5hbmNpYWwgUHJvamVjdGlvbnNgLFxuICAgICAgICAnYGBganNvbicsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHByb2plY3Rpb25zLCBudWxsLCAyKSxcbiAgICAgICAgJ2BgYCdcbiAgICBdLmpvaW4oJ1xcbicpO1xuICAgIGlmICh0YXJnZXQgPT09ICdidXNpbmVzc1JldmlldycpIHtcbiAgICAgICAgcmV0dXJuIGAke2NvbnRleHR9XFxuXFxuR2VuZXJhdGUgT05MWSBhIFwiYnVzaW5lc3NSZXZpZXdcIiBkb2N1bWVudCBhcyBhIEpTT04gb2JqZWN0IHdpdGggYSBzaW5nbGUga2V5IFwiYnVzaW5lc3NSZXZpZXdcIiBjb250YWluaW5nIGEgY29tcHJlaGVuc2l2ZSBNYXJrZG93biBidXNpbmVzcyByZXZpZXcuIEluY2x1ZGUgc2VjdGlvbnMgZm9yIGVhY2ggcGFydCBvZiB0aGUgYnVzaW5lc3M6IFBhcnQgQTogUmV2ZW51ZSAmIFNhbGVzLCBQYXJ0IEI6IENvc3RzICYgTWFyZ2lucywgUGFydCBDOiBQcm9maXRhYmlsaXR5ICYgRUJJVERBLCBQYXJ0IEQ6IEJyZWFrLUV2ZW4gQW5hbHlzaXMsIFBhcnQgRTogVHJlbmRzICYgUHJvamVjdGlvbnMsIFBhcnQgRjogUmlza3MgJiBSZWNvbW1lbmRhdGlvbnMuIFVzZSAjIyBQYXJ0IFg6IFRpdGxlIGhlYWRlcnMuIEluY2x1ZGUgZGF0YSB0YWJsZXMgZnJvbSB0aGUgcHJvamVjdGlvbnMuYDtcbiAgICB9XG4gICAgaWYgKHRhcmdldCA9PT0gJ2V4ZWN1dGl2ZVN1bW1hcnknKSB7XG4gICAgICAgIHJldHVybiBgJHtjb250ZXh0fVxcblxcbkdlbmVyYXRlIE9OTFkgYW4gXCJleGVjdXRpdmVTdW1tYXJ5XCIgZG9jdW1lbnQgYXMgYSBKU09OIG9iamVjdCB3aXRoIGEgc2luZ2xlIGtleSBcImV4ZWN1dGl2ZVN1bW1hcnlcIiBjb250YWluaW5nIGEgY29uY2lzZSBNYXJrZG93biBleGVjdXRpdmUgc3VtbWFyeSAoMS0yIHBhZ2VzKSBoaWdobGlnaHRpbmcgdGhlIGtleSBmaW5hbmNpYWwgbWV0cmljcywgdHJlbmRzLCByaXNrcywgYW5kIGFjdGlvbmFibGUgcmVjb21tZW5kYXRpb25zIGZyb20gdGhlIHdvcmtib29rIGRhdGEuYDtcbiAgICB9XG4gICAgcmV0dXJuIGAke2NvbnRleHR9XFxuXFxuR2VuZXJhdGUgT05MWSBhIEpTT04gb2JqZWN0IHdpdGgga2V5cyBcImFjdGlvblBoYXNlc1wiIChhcnJheSBvZiB7cGhhc2UsIGRlc2NyaXB0aW9ufSksIFwidGFyZ2V0Um93c1wiIChhcnJheSBvZiB7bGFiZWwsIHZhbHVlLCB1bml0fSksIGFuZCBcImxldmVyc1wiIChhcnJheSBvZiB7bmFtZSwgaW1wYWN0LCBhY3Rpb25zW119KSBiYXNlZCBvbiB0aGUgZmluYW5jaWFsIGRhdGEuIEZvY3VzIG9uIGFjdGlvbmFibGUgb3BlcmF0aW9uYWwgcmVjb21tZW5kYXRpb25zLmA7XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vbG9hZFdvcmtib29rU3RlcFwiLCBsb2FkV29ya2Jvb2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9leHRyYWN0U2hlZXRzU3RlcFwiLCBleHRyYWN0U2hlZXRzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vYW5hbHl6ZVNoZWV0c1N0ZXBcIiwgYW5hbHl6ZVNoZWV0c1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NhdmVXb3JrYm9va0Zvcm11bGFNYXBTdGVwXCIsIHNhdmVXb3JrYm9va0Zvcm11bGFNYXBTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9jb21wcmVoZW5kV29ya2Jvb2tTdGVwXCIsIGNvbXByZWhlbmRXb3JrYm9va1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2VtaXRQcm9ncmVzc1N0ZXBcIiwgZW1pdFByb2dyZXNzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vY2xvc2VQcm9ncmVzc1N0ZXBcIiwgY2xvc2VQcm9ncmVzc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3BvcHVsYXRlUHJvamVjdGlvbnNTdGVwXCIsIHBvcHVsYXRlUHJvamVjdGlvbnNTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy91cHNlcnRTaGVldFBhZ2VzU3RlcFwiLCB1cHNlcnRTaGVldFBhZ2VzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2F2ZVNuaXBwZXRzU3RlcFwiLCBzYXZlU25pcHBldHNTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zZWxlY3RUZW1wbGF0ZVN0ZXBcIiwgc2VsZWN0VGVtcGxhdGVTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9yZWdpc3RlckR5bmFtaWNQYWdlc1N0ZXBcIiwgcmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcFwiLCBnZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcFwiLCBnZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZURhc2hib2FyZFN0ZXBcIiwgZ2VuZXJhdGVEYXNoYm9hcmRTdGVwKTtcbiIsICIvKipcbiAqIFdvcmtib29rIFNoZWV0IEV4dHJhY3Rpb24gKGRlcGVuZGVuY3ktZnJlZSlcbiAqXG4gKiBQdXJlIHNoZWV0IHNlcmlhbGl6YXRpb24gKyBzdHJ1Y3R1cmFsIHN0YXRpc3RpY3MuIFRoaXMgbW9kdWxlIGludGVudGlvbmFsbHlcbiAqIGhhcyBOTyBhcHBsaWNhdGlvbiBhbGlhc2VzIChgQC8uLi5gKSwgbm8gem9kLCBhbmQgbm8gT3BlbkFJIGltcG9ydHMgc28gdGhhdFxuICogaXQgY2FuIGJlIGJ1bmRsZWQgaW50byBWZXJjZWwgV29ya2Zsb3cgc3RlcCBidW5kbGVzICh3b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0KVxuICogd2l0aG91dCBkcmFnZ2luZyB0aGUgd2hvbGUgZG9tYWluIGxheWVyIGFsb25nLlxuICpcbiAqIFRoZSBBSS1maXJzdCBwaXBlbGluZSBzZXJpYWxpemVzIGV2ZXJ5IHNoZWV0IHRvIHBsYWluIHRleHQgKHRhYiBuYW1lICsgcm93cylcbiAqIGFuZCBsZXRzIHRoZSBtb2RlbCBkbyB0aGUgY29tcHJlaGVuc2lvbi4gVGhlIHN0cnVjdHVyYWwgc3RhdGlzdGljcyBwcm9kdWNlZFxuICogaGVyZSBmZWVkIGEgZGV0ZXJtaW5pc3RpYyBBTkFMWVpFIHByZS1wYXNzIHRoYXQgZW5yaWNoZXMgdGhlIEFJIHByb21wdC5cbiAqLyBpbXBvcnQgeyByZWFkLCB1dGlscyB9IGZyb20gJ3hsc3gnO1xuZXhwb3J0IGNvbnN0IFNIRUVUX0NBVEVHT1JJRVMgPSBbXG4gICAgJ2RhaWx5X3NhbGVzJyxcbiAgICAncHJvZml0X2xvc3MnLFxuICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAndHJpYWxfYmFsYW5jZScsXG4gICAgJ2dlbmVyYWxfbGVkZ2VyJyxcbiAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgJ21vbnRoX29uX21vbnRoJyxcbiAgICAnYnJlYWtfZXZlbicsXG4gICAgJ3ZhcmlhbmNlJyxcbiAgICAnc3VtbWFyeV9wbCcsXG4gICAgJ3N1bW1hcnlfYnMnLFxuICAgICdvdGhlcidcbl07XG5leHBvcnQgY29uc3QgTUFYX1NIRUVUX1JPV1MgPSA0MDtcbmV4cG9ydCBjb25zdCBNQVhfU0hFRVRfQ09MUyA9IDE2O1xuZXhwb3J0IGNvbnN0IE1BWF9DRUxMX0NIQVJTID0gODA7XG5mdW5jdGlvbiBmb3JtYXRDZWxsKHYpIHtcbiAgICBpZiAodiA9PSBudWxsKSByZXR1cm4gJyc7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoTnVtYmVyLmlzSW50ZWdlcih2KSkgcmV0dXJuIFN0cmluZyh2KTtcbiAgICAgICAgcmV0dXJuIHYudG9GaXhlZCgyKS5yZXBsYWNlKC9cXC4wMCQvLCAnJyk7XG4gICAgfVxuICAgIGNvbnN0IHMgPSBTdHJpbmcodikucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKTtcbiAgICByZXR1cm4gcy5sZW5ndGggPiBNQVhfQ0VMTF9DSEFSUyA/IHMuc2xpY2UoMCwgTUFYX0NFTExfQ0hBUlMgLSAxKSArICdcdTIwMjYnIDogcztcbn1cbmZ1bmN0aW9uIHJlYWRGdWxsR3JpZChzaGVldCkge1xuICAgIHJldHVybiB1dGlscy5zaGVldF90b19qc29uKHNoZWV0LCB7XG4gICAgICAgIGhlYWRlcjogMSxcbiAgICAgICAgZGVmdmFsOiBudWxsLFxuICAgICAgICByYXc6IHRydWVcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGNhcEdyaWQoZ3JpZCwgbWF4Um93cywgbWF4Q29scykge1xuICAgIGNvbnN0IGNhcHBlZCA9IFtdO1xuICAgIGZvcihsZXQgciA9IDA7IHIgPCBNYXRoLm1pbihncmlkLmxlbmd0aCwgbWF4Um93cyk7IHIrKyl7XG4gICAgICAgIGNvbnN0IHJvdyA9IGdyaWRbcl0gPz8gW107XG4gICAgICAgIGNvbnN0IHRyaW1tZWQgPSByb3cuc2xpY2UoMCwgbWF4Q29scyk7XG4gICAgICAgIGlmICh0cmltbWVkLnNvbWUoKGMpPT5jICE9IG51bGwgJiYgU3RyaW5nKGMpLnRyaW0oKSAhPT0gJycpKSBjYXBwZWQucHVzaCh0cmltbWVkKTtcbiAgICB9XG4gICAgcmV0dXJuIGNhcHBlZDtcbn1cbmZ1bmN0aW9uIGdyaWRUb1RleHQoZ3JpZCkge1xuICAgIGNvbnN0IGxpbmVzID0gZ3JpZC5tYXAoKHJvdywgaSk9PntcbiAgICAgICAgY29uc3QgY2VsbHMgPSByb3cubWFwKChjKT0+Zm9ybWF0Q2VsbChjKSk7XG4gICAgICAgIC8vIFRyaW0gdHJhaWxpbmcgZW1wdGllcyBmb3IgY29tcGFjdG5lc3NcbiAgICAgICAgd2hpbGUoY2VsbHMubGVuZ3RoID4gMCAmJiBjZWxsc1tjZWxscy5sZW5ndGggLSAxXSA9PT0gJycpY2VsbHMucG9wKCk7XG4gICAgICAgIHJldHVybiBgUiR7aSArIDF9OiAke2NlbGxzLmpvaW4oJyB8ICcpfWA7XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xufVxuZnVuY3Rpb24gY29tcHV0ZVN0YXRzKHRhYk5hbWUsIGdyaWQpIHtcbiAgICBsZXQgY29sQ291bnQgPSAwO1xuICAgIGxldCBudW1lcmljQ2VsbHMgPSAwO1xuICAgIGxldCBub25FbXB0eUNlbGxzID0gMDtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBncmlkKXtcbiAgICAgICAgaWYgKHJvdy5sZW5ndGggPiBjb2xDb3VudCkgY29sQ291bnQgPSByb3cubGVuZ3RoO1xuICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2Ygcm93KXtcbiAgICAgICAgICAgIGlmIChjZWxsID09IG51bGwgfHwgU3RyaW5nKGNlbGwpLnRyaW0oKSA9PT0gJycpIGNvbnRpbnVlO1xuICAgICAgICAgICAgbm9uRW1wdHlDZWxscysrO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjZWxsID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIG51bWVyaWNDZWxscysrO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbCA9PT0gJ3N0cmluZycgJiYgL15bLStdP1xcZFtcXGQuLF0qJC8udGVzdChjZWxsLnRyaW0oKSkpIHtcbiAgICAgICAgICAgICAgICBudW1lcmljQ2VsbHMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICB0YWJOYW1lLFxuICAgICAgICByb3dDb3VudDogZ3JpZC5sZW5ndGgsXG4gICAgICAgIGNvbENvdW50LFxuICAgICAgICBudW1lcmljUmF0aW86IG5vbkVtcHR5Q2VsbHMgPiAwID8gbnVtZXJpY0NlbGxzIC8gbm9uRW1wdHlDZWxscyA6IDAsXG4gICAgICAgIG5vbkVtcHR5Q2VsbHNcbiAgICB9O1xufVxuLyoqIFNlcmlhbGl6ZSBvbmUgd29ya3NoZWV0IHRvIHRleHQgKHJvdy1udW1iZXJlZCwgY2FwcGVkKSBmb3IgdGhlIEFJIHByb21wdC4gKi8gZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclNoZWV0Rm9yQWkod2IsIHRhYk5hbWUsIG1heFJvd3MgPSBNQVhfU0hFRVRfUk9XUywgbWF4Q29scyA9IE1BWF9TSEVFVF9DT0xTKSB7XG4gICAgY29uc3Qgc2hlZXQgPSB3Yi5TaGVldHNbdGFiTmFtZV07XG4gICAgaWYgKCFzaGVldCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgZ3JpZCA9IGNhcEdyaWQocmVhZEZ1bGxHcmlkKHNoZWV0KSwgbWF4Um93cywgbWF4Q29scyk7XG4gICAgaWYgKGdyaWQubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgICB0YWJOYW1lLFxuICAgICAgICB0ZXh0OiBncmlkVG9UZXh0KGdyaWQpXG4gICAgfTtcbn1cbi8qKiBTZXJpYWxpemUgQUxMIHNoZWV0cyBvZiBhIHdvcmtib29rIHRvIHRleHQgYmxvY2tzLiBBY2NlcHRzIFVpbnQ4QXJyYXkgb3IgQnVmZmVyLiAqLyBleHBvcnQgZnVuY3Rpb24gcmVuZGVyQWxsU2hlZXRzRm9yQWkoYnVmKSB7XG4gICAgY29uc3Qgd2IgPSByZWFkKGJ1Ziwge1xuICAgICAgICB0eXBlOiAnYnVmZmVyJ1xuICAgIH0pO1xuICAgIGNvbnN0IGJsb2NrcyA9IFtdO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiB3Yi5TaGVldE5hbWVzID8/IFtdKXtcbiAgICAgICAgY29uc3QgcmVuZGVyZWQgPSByZW5kZXJTaGVldEZvckFpKHdiLCBuYW1lKTtcbiAgICAgICAgaWYgKHJlbmRlcmVkKSBibG9ja3MucHVzaChyZW5kZXJlZCk7XG4gICAgfVxuICAgIHJldHVybiBibG9ja3M7XG59XG4vKipcbiAqIFNlcmlhbGl6ZSBBTEwgc2hlZXRzIEFORCBjb21wdXRlIGZ1bGwtZ3JpZCBzdHJ1Y3R1cmFsIHN0YXRpc3RpY3MuXG4gKiBUaGlzIGlzIHRoZSBFWFRSQUNUIG91dHB1dCBmb3IgdGhlIHdvcmtmbG93IHBpcGVsaW5lOiBvbmUgcGFyc2UgcGVyXG4gKiBzaGVldCBwcm9kdWNlcyBib3RoIHRoZSBBSSBwcm9tcHQgYmxvY2sgYW5kIHRoZSBBTkFMWVpFIGhpbnRzLlxuICovIGV4cG9ydCBmdW5jdGlvbiBleHRyYWN0U2hlZXRzV2l0aFN0YXRzKGJ1Zikge1xuICAgIGNvbnN0IHdiID0gcmVhZChidWYsIHtcbiAgICAgICAgdHlwZTogJ2J1ZmZlcidcbiAgICB9KTtcbiAgICBjb25zdCBzaGVldHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygd2IuU2hlZXROYW1lcyA/PyBbXSl7XG4gICAgICAgIGNvbnN0IHNoZWV0ID0gd2IuU2hlZXRzW25hbWVdO1xuICAgICAgICBpZiAoIXNoZWV0KSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZnVsbEdyaWQgPSByZWFkRnVsbEdyaWQoc2hlZXQpO1xuICAgICAgICBpZiAoZnVsbEdyaWQubGVuZ3RoID09PSAwKSBjb250aW51ZTtcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBjb21wdXRlU3RhdHMobmFtZSwgZnVsbEdyaWQpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gZ3JpZFRvVGV4dChjYXBHcmlkKGZ1bGxHcmlkLCBNQVhfU0hFRVRfUk9XUywgTUFYX1NIRUVUX0NPTFMpKTtcbiAgICAgICAgc2hlZXRzLnB1c2goe1xuICAgICAgICAgICAgdGFiTmFtZTogbmFtZSxcbiAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICBzdGF0c1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHNoZWV0cztcbn1cbiIsICIvKipcbiAqIFdvcmtib29rIFNoZWV0IEFuYWx5c2lzIChkZXRlcm1pbmlzdGljIHByZS1wYXNzKVxuICpcbiAqIEEgZGVwZW5kZW5jeS1mcmVlIGhldXJpc3RpYyBwYXNzIG92ZXIgZXh0cmFjdGVkIHNoZWV0cyB0aGF0IHByb2R1Y2VzXG4gKiBcIkFuYWx5c2lzSGludHNcIiBcdTIwMTQgc3RydWN0dXJlZCBjb250ZXh0IHRoYXQ6XG4gKiAgIC0gaXMgZmVkIGludG8gdGhlIENPTVBSRUhFTkQgcHJvbXB0IHRvIGJpYXMgdGhlIG1vZGVsIChQaGFzZSAyKSxcbiAqICAgLSBnaXZlcyB0aGUgcm91dGUgbGF5ZXIgYSBmYXN0IHByZS1BSSBzdGF0dXMgKFwid2Ugc2VlIDQgc2hlZXRzLCBtb3N0bHlcbiAqICAgICBudW1lcmljLCBsaWtlbHkgSURSLCBwZXJpb2QgaGludHMgMjAyNi0wNlwiKS5cbiAqXG4gKiBObyBhcHBsaWNhdGlvbiBhbGlhc2VzIGFuZCBubyBleHRlcm5hbCBkZXBzIFx1MjAxNCBzYWZlIHRvIGJ1bmRsZSBpbnRvIHRoZVxuICogVmVyY2VsIFdvcmtmbG93IHN0ZXAgYnVuZGxlLlxuICovIGltcG9ydCB7IFNIRUVUX0NBVEVHT1JJRVMgfSBmcm9tICcuL2V4dHJhY3Qtc2hlZXRzJztcbi8vIFx1MjUwMFx1MjUwMCBIZXVyaXN0aWMgdGFibGVzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuY29uc3QgQ1VSUkVOQ1lfUEFUVEVSTlMgPSBbXG4gICAgW1xuICAgICAgICAnSURSJyxcbiAgICAgICAgL1xcYig/OklEUnxScFxcLj98UnVwaWFoKVxcYi9pXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdVU0QnLFxuICAgICAgICAvXFxiKD86VVNEfFxcJClcXGIvXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdFVVInLFxuICAgICAgICAvXFxiKD86RVVSfFx1MjBBQylcXGIvXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdHQlAnLFxuICAgICAgICAvXFxiKD86R0JQfFx1MDBBMylcXGIvXG4gICAgXVxuXTtcbmNvbnN0IE1PTlRIX05BTUVTID0gW1xuICAgICdqYW51YXJ5JyxcbiAgICAnZmVicnVhcnknLFxuICAgICdtYXJjaCcsXG4gICAgJ2FwcmlsJyxcbiAgICAnbWF5JyxcbiAgICAnanVuZScsXG4gICAgJ2p1bHknLFxuICAgICdhdWd1c3QnLFxuICAgICdzZXB0ZW1iZXInLFxuICAgICdvY3RvYmVyJyxcbiAgICAnbm92ZW1iZXInLFxuICAgICdkZWNlbWJlcicsXG4gICAgJ2phbnVhcmknLFxuICAgICdmZWJydWFyaScsXG4gICAgJ21hcmV0JyxcbiAgICAnYXByaWwnLFxuICAgICdtZWknLFxuICAgICdqdW5pJyxcbiAgICAnanVsaScsXG4gICAgJ2FndXN0dXMnLFxuICAgICdzZXB0ZW1iZXInLFxuICAgICdva3RvYmVyJyxcbiAgICAnbm92ZW1iZXInLFxuICAgICdkZXNlbWJlcidcbl07XG5mdW5jdGlvbiBwZXJpb2RQYXR0ZXJucygpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAvXFxiKDE5fDIwKVxcZHsyfVstL10oMD9bMS05XXwxWzAtMl0pKD86Wy0vXVxcZHsxLDJ9KT9cXGIvZyxcbiAgICAgICAgL1xcYigwP1sxLTldfDFbMC0yXSlbLS9dKDE5fDIwKVxcZHsyfVxcYi9nLFxuICAgICAgICBuZXcgUmVnRXhwKGBcXFxcYig/OiR7TU9OVEhfTkFNRVMuam9pbignfCcpfSlcXFxcYmAsICdnaScpLFxuICAgICAgICAvXFxiUVsxLTRdWyAtXT8oPzoxOXwyMClcXGR7Mn1cXGIvZ2lcbiAgICBdO1xufVxuY29uc3QgTEFCRUxfQ0FURUdPUllfTUFQID0gW1xuICAgIFtcbiAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ1BST0ZJVCAmIExPU1MnLFxuICAgICAgICAgICAgJ1BST0ZJVCBBTkQgTE9TUycsXG4gICAgICAgICAgICAnTGFiYSBSdWdpJyxcbiAgICAgICAgICAgICdJTkNPTUUgU1RBVEVNRU5UJyxcbiAgICAgICAgICAgICdQJkwnLFxuICAgICAgICAgICAgJ0VCSVREQScsXG4gICAgICAgICAgICAnTkVUIFBST0ZJVCcsXG4gICAgICAgICAgICAnTkVUIElOQ09NRScsXG4gICAgICAgICAgICAnTEFCQSBCRVJTSUgnLFxuICAgICAgICAgICAgJ1JVR0knXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnQkFMQU5DRSBTSEVFVCcsXG4gICAgICAgICAgICAnTkVSQUNBJyxcbiAgICAgICAgICAgICdBU1NFVCcsXG4gICAgICAgICAgICAnTElBQklMSVQnLFxuICAgICAgICAgICAgJ0VLVUlUQVMnLFxuICAgICAgICAgICAgJ0VRVUlUWScsXG4gICAgICAgICAgICAnVE9UQUwgQVNTRVRTJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICd0cmlhbF9iYWxhbmNlJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ1RSSUFMIEJBTEFOQ0UnLFxuICAgICAgICAgICAgJ05FUkFDQSBTQUxETydcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnZ2VuZXJhbF9sZWRnZXInLFxuICAgICAgICBbXG4gICAgICAgICAgICAnR0VORVJBTCBMRURHRVInLFxuICAgICAgICAgICAgJ0JVS1UgQkVTQVInLFxuICAgICAgICAgICAgJ0pVUk5BTCdcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdDT1NUIE9GIFNBTEVTJyxcbiAgICAgICAgICAgICdDT0dTJyxcbiAgICAgICAgICAgICdIQVJHQSBQT0tPSycsXG4gICAgICAgICAgICAnRk9PRCBDT1NUJyxcbiAgICAgICAgICAgICdCRVZFUkFHRSBDT1NUJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdicmVha19ldmVuJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ0JSRUFLIEVWRU4nLFxuICAgICAgICAgICAgJ0JSRUFLLUVWRU4nLFxuICAgICAgICAgICAgJ0JFUCcsXG4gICAgICAgICAgICAnVElUSUsgSU1QQVMnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ2RhaWx5X3NhbGVzJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ0RBSUxZIFNBTEVTJyxcbiAgICAgICAgICAgICdQRU5KVUFMQU4gSEFSSUFOJyxcbiAgICAgICAgICAgICdPTVpFVCdcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnbW9udGhfb25fbW9udGgnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnTU9OVEggT04gTU9OVEgnLFxuICAgICAgICAgICAgJ01PTScsXG4gICAgICAgICAgICAnQlVMQU5BTidcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAndmFyaWFuY2UnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnVkFSSUFOQ0UnLFxuICAgICAgICAgICAgJ1ZBUklBTlNJJyxcbiAgICAgICAgICAgICdTRUxJU0lIJyxcbiAgICAgICAgICAgICdBQ1RVQUwgVlMgQlVER0VUJyxcbiAgICAgICAgICAgICdBQ1RVQUwgVlMnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ3N1bW1hcnlfcGwnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnU1VNTUFSWSBQJkwnLFxuICAgICAgICAgICAgJ1JJTkdLQVNBTiBMQUJBIFJVR0knLFxuICAgICAgICAgICAgJ1NVTU1BUlkgUFJPRklUJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdzdW1tYXJ5X2JzJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ1NVTU1BUlkgQkFMQU5DRScsXG4gICAgICAgICAgICAnUklOR0tBU0FOIE5FUkFDQSdcbiAgICAgICAgXVxuICAgIF1cbl07XG5mdW5jdGlvbiBjb2xsZWN0SGludHModGV4dCkge1xuICAgIGNvbnN0IGN1cnJlbmN5ID0gW107XG4gICAgZm9yIChjb25zdCBbbmFtZSwgcmVdIG9mIENVUlJFTkNZX1BBVFRFUk5TKXtcbiAgICAgICAgaWYgKHJlLnRlc3QodGV4dCkpIGN1cnJlbmN5LnB1c2gobmFtZSk7XG4gICAgfVxuICAgIGNvbnN0IHBlcmlvZHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHJlIG9mIHBlcmlvZFBhdHRlcm5zKCkpe1xuICAgICAgICBjb25zdCBtYXRjaGVzID0gdGV4dC5tYXRjaChyZSk7XG4gICAgICAgIGlmIChtYXRjaGVzKSBwZXJpb2RzLnB1c2goLi4ubWF0Y2hlcyk7XG4gICAgfVxuICAgIGNvbnN0IGxhYmVscyA9IFtdO1xuICAgIGZvciAoY29uc3QgWywgdGVybXNdIG9mIExBQkVMX0NBVEVHT1JZX01BUCl7XG4gICAgICAgIGZvciAoY29uc3QgdGVybSBvZiB0ZXJtcyl7XG4gICAgICAgICAgICBpZiAodGV4dC50b1VwcGVyQ2FzZSgpLmluY2x1ZGVzKHRlcm0udG9VcHBlckNhc2UoKSkpIGxhYmVscy5wdXNoKHRlcm0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGN1cnJlbmN5LFxuICAgICAgICBwZXJpb2RzLFxuICAgICAgICBsYWJlbHNcbiAgICB9O1xufVxuZnVuY3Rpb24gZ3Vlc3NDYXRlZ29yeShsYWJlbHMpIHtcbiAgICBjb25zdCBzY29yZXMgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBbY2F0ZWdvcnksIHRlcm1zXSBvZiBMQUJFTF9DQVRFR09SWV9NQVApe1xuICAgICAgICBsZXQgc2NvcmUgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybXMpe1xuICAgICAgICAgICAgaWYgKGxhYmVscy5pbmNsdWRlcyh0ZXJtKSkgc2NvcmUgKz0gdGVybS5sZW5ndGg7IC8vIGxvbmdlciB0ZXJtcyBhcmUgbW9yZSBzcGVjaWZpY1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY29yZSA+IDApIHNjb3Jlcy5zZXQoY2F0ZWdvcnksIHNjb3JlKTtcbiAgICB9XG4gICAgaWYgKHNjb3Jlcy5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBzb3J0ZWQgPSBbXG4gICAgICAgIC4uLnNjb3Jlcy5lbnRyaWVzKClcbiAgICBdLnNvcnQoKGEsIGIpPT5iWzFdIC0gYVsxXSk7XG4gICAgaWYgKHNvcnRlZC5sZW5ndGggPiAxICYmIHNvcnRlZFswXVsxXSA9PT0gc29ydGVkWzFdWzFdKSByZXR1cm4gbnVsbDsgLy8gdGllIFx1MjE5MiBhbWJpZ3VvdXNcbiAgICByZXR1cm4gc29ydGVkWzBdWzBdO1xufVxuZnVuY3Rpb24gYmVzdEd1ZXNzKHZhbHVlcykge1xuICAgIGlmICh2YWx1ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBjb3VudHMgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCB2IG9mIHZhbHVlcyljb3VudHMuc2V0KHYsIChjb3VudHMuZ2V0KHYpID8/IDApICsgMSk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgLi4uY291bnRzLmVudHJpZXMoKVxuICAgIF0uc29ydCgoYSwgYik9PmJbMV0gLSBhWzFdKVswXVswXTtcbn1cbi8vIFx1MjUwMFx1MjUwMCBQdWJsaWMgQVBJIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuLyoqIEFuYWx5emUgZXh0cmFjdGVkIHNoZWV0cyAoRVhUUkFDVCBvdXRwdXQpIGludG8gZGV0ZXJtaW5pc3RpYyBoaW50cy4gKi8gZXhwb3J0IGZ1bmN0aW9uIGFuYWx5emVTaGVldHMoc2hlZXRzKSB7XG4gICAgY29uc3Qgc2hlZXRIaW50cyA9IHNoZWV0cy5tYXAoKHMpPT57XG4gICAgICAgIGNvbnN0IHsgY3VycmVuY3ksIHBlcmlvZHMsIGxhYmVscyB9ID0gY29sbGVjdEhpbnRzKHMudGV4dCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0YWJOYW1lOiBzLnRhYk5hbWUsXG4gICAgICAgICAgICByb3dDb3VudDogcy5zdGF0cy5yb3dDb3VudCxcbiAgICAgICAgICAgIGNvbENvdW50OiBzLnN0YXRzLmNvbENvdW50LFxuICAgICAgICAgICAgbnVtZXJpY1JhdGlvOiBzLnN0YXRzLm51bWVyaWNSYXRpbyxcbiAgICAgICAgICAgIGN1cnJlbmN5SGludHM6IGN1cnJlbmN5LFxuICAgICAgICAgICAgcGVyaW9kSGludHM6IHBlcmlvZHMsXG4gICAgICAgICAgICBsYWJlbEhpbnRzOiBsYWJlbHMsXG4gICAgICAgICAgICBsaWtlbHlDYXRlZ29yeTogZ3Vlc3NDYXRlZ29yeShsYWJlbHMpXG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgY29uc3QgdG90YWxSb3dzID0gc2hlZXRIaW50cy5yZWR1Y2UoKGFjYywgcyk9PmFjYyArIHMucm93Q291bnQsIDApO1xuICAgIGNvbnN0IHRvdGFsTm9uRW1wdHlDZWxscyA9IHNoZWV0cy5yZWR1Y2UoKGFjYywgcyk9PmFjYyArIHMuc3RhdHMubm9uRW1wdHlDZWxscywgMCk7XG4gICAgY29uc3Qgd2VpZ2h0ZWROdW1lcmljID0gc2hlZXRzLnJlZHVjZSgoYWNjLCBzKT0+YWNjICsgcy5zdGF0cy5udW1lcmljUmF0aW8gKiBzLnN0YXRzLm5vbkVtcHR5Q2VsbHMsIDApO1xuICAgIGNvbnN0IGFsbEN1cnJlbmN5ID0gc2hlZXRIaW50cy5mbGF0TWFwKChzKT0+cy5jdXJyZW5jeUhpbnRzKTtcbiAgICBjb25zdCBhbGxQZXJpb2RzID0gc2hlZXRIaW50cy5mbGF0TWFwKChzKT0+cy5wZXJpb2RIaW50cyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgd29ya2Jvb2s6IHtcbiAgICAgICAgICAgIHNoZWV0Q291bnQ6IHNoZWV0cy5sZW5ndGgsXG4gICAgICAgICAgICB0b3RhbFJvd3MsXG4gICAgICAgICAgICB0b3RhbE5vbkVtcHR5Q2VsbHMsXG4gICAgICAgICAgICBvdmVyYWxsTnVtZXJpY1JhdGlvOiB0b3RhbE5vbkVtcHR5Q2VsbHMgPiAwID8gd2VpZ2h0ZWROdW1lcmljIC8gdG90YWxOb25FbXB0eUNlbGxzIDogMCxcbiAgICAgICAgICAgIGN1cnJlbmN5R3Vlc3M6IGJlc3RHdWVzcyhhbGxDdXJyZW5jeSksXG4gICAgICAgICAgICBwZXJpb2RHdWVzczogYmVzdEd1ZXNzKGFsbFBlcmlvZHMpXG4gICAgICAgIH0sXG4gICAgICAgIHNoZWV0czogc2hlZXRIaW50c1xuICAgIH07XG59XG5leHBvcnQgeyBTSEVFVF9DQVRFR09SSUVTIH07XG4iLCAiLyoqXG4gKiBXb3JrYm9vayBDb21wcmVoZW5zaW9uIFx1MjAxNCBidW5kbGUtbGVhbiBPcGVuQUkgY2FsbFxuICpcbiAqIFRoaXMgbW9kdWxlIGNvbnRhaW5zIE9OTFkgdGhlIGNvbXByZWhlbnNpb24gcmVxdWVzdCBwYXRoOiBab2Qgc2NoZW1hcyxcbiAqIHByb21wdCBidWlsZGluZyAoaGludHMtYXdhcmUpLCBhIHNpbmdsZS1hdHRlbXB0IE9wZW5BSSBjYWxsIHdpdGggdHlwZWRcbiAqIGVycm9ycywgYW5kIHJlc3BvbnNlIHBhcnNpbmcuXG4gKlxuICogQnVuZGxlIGNvbnN0cmFpbnRzOlxuICogICAtIE5PIGFwcGxpY2F0aW9uIGFsaWFzZXMgKGBALy4uLmApIFx1MjAxNCBvbmx5IGB6b2RgICsgcmVsYXRpdmUgaW1wb3J0cy5cbiAqICAgLSBObyBEQiAvIHNlY3JldHMgLyBQcmlzbWEgXHUyMDE0IHRoZSBBUEkga2V5IGlzIHBhc3NlZCBpbiBleHBsaWNpdGx5LlxuICogICAtIFNhZmUgdG8gYnVuZGxlIGludG8gVmVyY2VsIFdvcmtmbG93IHN0ZXAgYnVuZGxlcyAod29ya2Zsb3dzLyopLlxuICpcbiAqIFRoZSBzeW5jIHBpcGVsaW5lIHdyYXBwZXIgKGBjb21wcmVoZW5kV29ya2Jvb2tgIGluIHdvcmtib29rLWNvbXByZWhlbnNpb24udHMpXG4gKiBrZWVwcyBpdHMgb3duIGtleSByZXNvbHV0aW9uICsgMi1hdHRlbXB0IHJldHJ5IGxvb3AgZm9yIHRoZSBub24td29ya2Zsb3dcbiAqIHBhdGg7IHRoaXMgbW9kdWxlIGlzIHRoZSBzaGFyZWQgc2luZ2xlLWF0dGVtcHQgY29yZS5cbiAqLyBpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IFNIRUVUX0NBVEVHT1JJRVMgfSBmcm9tICcuL2V4dHJhY3Qtc2hlZXRzJztcbi8vIFx1MjUwMFx1MjUwMCBab2QgdmFsaWRhdGlvbiBzY2hlbWEgZm9yIHRoZSBBSSBzdHJ1Y3R1cmVkIG91dHB1dCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmV4cG9ydCBjb25zdCBNZXRyaWNTY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgLyoqIFBlcmlvZCBpbiBZWVlZLU1NIChhbm51YWwgdG90YWxzIG1heSB1c2UgWVlZWS0xMikuICovIHBlcmlvZDogei5zdHJpbmcoKS5yZWdleCgvXlxcZHs0fS1cXGR7Mn0kLyksXG4gICAgZGF0YVR5cGU6IHouZW51bShbXG4gICAgICAgICdhY3R1YWwnLFxuICAgICAgICAnZm9yZWNhc3QnXG4gICAgXSksXG4gICAgc2NlbmFyaW86IHouZW51bShbXG4gICAgICAgICdhY3R1YWwnLFxuICAgICAgICAnY29uc2VydmF0aXZlJyxcbiAgICAgICAgJ3JlYWxpc3RpYycsXG4gICAgICAgICdhc3BpcmF0aW9uYWwnXG4gICAgXSksXG4gICAgcmV2ZW51ZTogei5udW1iZXIoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgZWJpdGRhOiB6Lm51bWJlcigpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICBuZXRJbmNvbWU6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgIGd1ZXN0czogei5udW1iZXIoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgc3RhZmZDb3N0OiB6Lm51bWJlcigpLm51bGxhYmxlKCkub3B0aW9uYWwoKVxufSk7XG5leHBvcnQgY29uc3QgU2hlZXRDb21wcmVoZW5zaW9uU2NoZW1hID0gei5vYmplY3Qoe1xuICAgIC8qKiBFeGFjdCB0YWIgbmFtZSBhcyBpdCBhcHBlYXJzIGluIHRoZSB3b3JrYm9vay4gKi8gdGFiTmFtZTogei5zdHJpbmcoKSxcbiAgICBjYXRlZ29yeTogei5lbnVtKFNIRUVUX0NBVEVHT1JJRVMpLFxuICAgIC8qKiBIdW1hbi1yZWFkYWJsZSB0aXRsZSBmb3IgdGhlIGR5bmFtaWMgcGFnZS4gKi8gdGl0bGU6IHouc3RyaW5nKCksXG4gICAgLyoqIE9uZS1wYXJhZ3JhcGggY29tcHJlaGVuc2lvbiBvZiB3aGF0IHRoaXMgc2hlZXQgY29udGFpbnMuICovIHN1bW1hcnk6IHouc3RyaW5nKCksXG4gICAgLyoqIERldGVjdGVkIHBlcmlvZCwgZS5nLiBcIkp1bmUgMjAyNlwiIFx1MjAxNCBudWxsIHdoZW4gbm90IGRldGVjdGFibGUuICovIHBlcmlvZEhpbnQ6IHouc3RyaW5nKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgIC8qKiBDb2x1bW4gaGVhZGVycyAoZmlyc3QgbWVhbmluZ2Z1bCByb3cpLiAqLyBjb2x1bW5zOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gICAgcm93Q291bnQ6IHoubnVtYmVyKCkuaW50KCkubm9ubmVnYXRpdmUoKS5vcHRpb25hbCgpLFxuICAgIC8qKiBQZXItcGVyaW9kIG1ldHJpY3MgZm91bmQgb24gVEhJUyBzaGVldC4gKi8gbWV0cmljczogei5hcnJheShNZXRyaWNTY2hlbWEpLm9wdGlvbmFsKClcbn0pO1xuZXhwb3J0IGNvbnN0IFdvcmtib29rQ29tcHJlaGVuc2lvblNjaGVtYSA9IHoub2JqZWN0KHtcbiAgICB3b3JrYm9vazogei5vYmplY3Qoe1xuICAgICAgICB0aXRsZTogei5zdHJpbmcoKSxcbiAgICAgICAgY29tcGFueTogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgICAgIHBlcmlvZDogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgICAgIGN1cnJlbmN5OiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgc3VtbWFyeTogei5zdHJpbmcoKVxuICAgIH0pLFxuICAgIHNoZWV0czogei5hcnJheShTaGVldENvbXByZWhlbnNpb25TY2hlbWEpLFxuICAgIC8qKlxuICAgKiBOb3JtYWxpemVkIGZpbmFuY2lhbCBwcm9qZWN0aW9ucyBjb25zb2xpZGF0ZWQgYWNyb3NzIEFMTCBzaGVldHMuXG4gICAqIFRoaXMgaXMgdGhlIHNvdXJjZSBmb3IgdGhlIGZpbmFuY2lhbF9wcm9qZWN0aW9ucyB0YWJsZS5cbiAgICovIHByb2plY3Rpb25zOiB6LmFycmF5KE1ldHJpY1NjaGVtYSksXG4gICAgLyoqXG4gICAqIFRlbXBsYXRlIHN1Z2dlc3Rpb24gZnJvbSB0aGUgYXZhaWxhYmxlIHRlbXBsYXRlIGNhdGFsb2dcbiAgICogKFRFTVBMQVRFX0NBVEFMT0cgaWRzLCBlLmcuIFwiZmluYW5jaWFsLWFuYWx5dGljc1wiLCBcInJlc3RhdXJhbnRcIikuXG4gICAqLyB0ZW1wbGF0ZTogei5vYmplY3Qoe1xuICAgICAgICBpZDogei5zdHJpbmcoKSxcbiAgICAgICAgY29uZmlkZW5jZTogei5udW1iZXIoKS5taW4oMCkubWF4KDEpLm9wdGlvbmFsKCksXG4gICAgICAgIHJlYXNvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpXG4gICAgfSkub3B0aW9uYWwoKVxufSk7XG4vLyBcdTI1MDBcdTI1MDAgVHlwZWQgZXJyb3JzIChtYXBwZWQgdG8gdGhlIHdvcmtmbG93IHJldHJ5IHBvbGljeSBieSB0aGUgY2FsbGVyKSBcdTI1MDBcbmV4cG9ydCBjbGFzcyBDb21wcmVoZW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgb3B0aW9ucyl7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnQ29tcHJlaGVuZEVycm9yJztcbiAgICB9XG59XG4vKiogSFRUUC1sZXZlbCBmYWlsdXJlIChub24tMnh4KS4gQ2FycmllcyBzdGF0dXMgKyBvcHRpb25hbCBSZXRyeS1BZnRlci4gKi8gZXhwb3J0IGNsYXNzIENvbXByZWhlbmRIdHRwRXJyb3IgZXh0ZW5kcyBDb21wcmVoZW5kRXJyb3Ige1xuICAgIHN0YXR1cztcbiAgICAvKiogUmV0cnktQWZ0ZXIgaGVhZGVyIHZhbHVlIGluIHNlY29uZHMsIHdoZW4gcHJlc2VudC4gKi8gcmV0cnlBZnRlclNlY29uZHM7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBtZXNzYWdlLCByZXRyeUFmdGVyU2Vjb25kcyA9IG51bGwpe1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0NvbXByZWhlbmRIdHRwRXJyb3InO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy5yZXRyeUFmdGVyU2Vjb25kcyA9IHJldHJ5QWZ0ZXJTZWNvbmRzO1xuICAgIH1cbn1cbi8qKiBSZXNwb25zZSBjb3VsZCBub3QgYmUgcGFyc2VkL3ZhbGlkYXRlZCAoSlNPTiBvciBab2QpLiAqLyBleHBvcnQgY2xhc3MgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvciBleHRlbmRzIENvbXByZWhlbmRFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgb3B0aW9ucyl7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcic7XG4gICAgfVxufVxuLy8gXHUyNTAwXHUyNTAwIFByb21wdCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmNvbnN0IFNZU1RFTV9QUk9NUFQgPSAnWW91IGFyZSBhIHByZWNpc2UgZmluYW5jaWFsIGFuYWx5c3QgYW5kIHdvcmtib29rIGludGVycHJldGVyLiAnICsgJ1lvdSByZWFkIHJhdyBzcHJlYWRzaGVldCBkdW1wcyBhbmQgcmV0dXJuIE9OTFkgdmFsaWQgSlNPTiBtYXRjaGluZyB0aGUgcmVxdWVzdGVkIHNjaGVtYSBleGFjdGx5LiAnICsgJ05ldmVyIGludmVudCBkYXRhIHRoYXQgaXMgbm90IHByZXNlbnQgaW4gdGhlIHNoZWV0cyBcdTIwMTQgbGVhdmUgbWV0cmljcyBudWxsIHdoZW4gYWJzZW50Lic7XG4vKiogUmVuZGVyIHRoZSBkZXRlcm1pbmlzdGljIEFOQUxZWkUgaGludHMgYXMgYSBwcm9tcHQgc2VjdGlvbi4gKi8gZnVuY3Rpb24gcmVuZGVySGludHNTZWN0aW9uKGhpbnRzKSB7XG4gICAgY29uc3Qgd2IgPSBoaW50cy53b3JrYm9vaztcbiAgICBjb25zdCBsaW5lcyA9IFtcbiAgICAgICAgYC0gV29ya2Jvb2s6ICR7d2Iuc2hlZXRDb3VudH0gc2hlZXQocyksICR7d2IudG90YWxSb3dzfSB0b3RhbCByb3dzLCBgICsgYCR7TWF0aC5yb3VuZCh3Yi5vdmVyYWxsTnVtZXJpY1JhdGlvICogMTAwKX0lIG51bWVyaWMgY2VsbHMuYFxuICAgIF07XG4gICAgaWYgKHdiLmN1cnJlbmN5R3Vlc3MpIGxpbmVzLnB1c2goYC0gQ3VycmVuY3kgZ3Vlc3M6ICR7d2IuY3VycmVuY3lHdWVzc31gKTtcbiAgICBpZiAod2IucGVyaW9kR3Vlc3MpIGxpbmVzLnB1c2goYC0gUGVyaW9kIGd1ZXNzOiAke3diLnBlcmlvZEd1ZXNzfWApO1xuICAgIGZvciAoY29uc3QgcyBvZiBoaW50cy5zaGVldHMpe1xuICAgICAgICBjb25zdCBwYXJ0cyA9IFtcbiAgICAgICAgICAgIGBcIiR7cy50YWJOYW1lfVwiOiAke3Mucm93Q291bnR9IHJvd3MgXHUwMEQ3ICR7cy5jb2xDb3VudH0gY29scywgYCArIGAke01hdGgucm91bmQocy5udW1lcmljUmF0aW8gKiAxMDApfSUgbnVtZXJpY2BcbiAgICAgICAgXTtcbiAgICAgICAgaWYgKHMuY3VycmVuY3lIaW50cy5sZW5ndGggPiAwKSBwYXJ0cy5wdXNoKGBjdXJyZW5jeSBbJHtzLmN1cnJlbmN5SGludHMuam9pbignLCcpfV1gKTtcbiAgICAgICAgaWYgKHMucGVyaW9kSGludHMubGVuZ3RoID4gMCkgcGFydHMucHVzaChgcGVyaW9kcyBbJHtzLnBlcmlvZEhpbnRzLmpvaW4oJywgJyl9XWApO1xuICAgICAgICBpZiAocy5sYWJlbEhpbnRzLmxlbmd0aCA+IDApIHBhcnRzLnB1c2goYGxhYmVscyBbJHtzLmxhYmVsSGludHMuam9pbignLCAnKX1dYCk7XG4gICAgICAgIGlmIChzLmxpa2VseUNhdGVnb3J5KSBwYXJ0cy5wdXNoKGBjYXRlZ29yeS1ndWVzcyAke3MubGlrZWx5Q2F0ZWdvcnl9YCk7XG4gICAgICAgIGxpbmVzLnB1c2goYCAgLSBTaGVldCAke3BhcnRzLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENvbXByZWhlbnNpb25Qcm9tcHQoYmxvY2tzLCBoaW50cykge1xuICAgIGNvbnN0IHNoZWV0QmxvY2tzID0gYmxvY2tzLm1hcCgoYik9PmA9PT09PSBTSEVFVDogJHtiLnRhYk5hbWV9ID09PT09XFxuJHtiLnRleHR9XFxuYCkuam9pbignXFxuJyk7XG4gICAgY29uc3QgaGludHNTZWN0aW9uID0gaGludHMgPyBgREVURVJNSU5JU1RJQyBQUkUtQU5BTFlTSVMgKGdlbmVyYXRlZCBieSBjb2RlIFx1MjAxNCB1c2UgYXMgc3Ryb25nIHByaW9ycywgYnV0IEFMV0FZUyB2ZXJpZnkgYWdhaW5zdCB0aGUgYWN0dWFsIGR1bXA7IGNhdGVnb3J5LWd1ZXNzIGlzIG5vdCBhdXRob3JpdGF0aXZlKTpcbiR7cmVuZGVySGludHNTZWN0aW9uKGhpbnRzKX1cblxuYCA6ICcnO1xuICAgIHJldHVybiBgQW5hbHl6ZSB0aGUgZm9sbG93aW5nIHdvcmtib29rLiBFdmVyeSBzaGVldCBvZiB0aGUgd29ya2Jvb2sgaXMgZHVtcGVkIGJlbG93IGFzIFwiUjxyb3c+OiA8Y2VsbHM+XCIuXG5cblRBU0tTOlxuMS4gVW5kZXJzdGFuZCB0aGUgd29ya2Jvb2sgYXMgYSB3aG9sZSAoY29tcGFueSwgcGVyaW9kLCBjdXJyZW5jeSwgcHVycG9zZSkuXG4yLiBGb3IgRUFDSCBzaGVldDogaWRlbnRpZnkgaXRzIGNhdGVnb3J5LCBhIGh1bWFuLXJlYWRhYmxlIHRpdGxlLCBhIHNob3J0IGNvbXByZWhlbnNpb24gc3VtbWFyeSwgZGV0ZWN0ZWQgcGVyaW9kIChlLmcuIFwiSnVuZSAyMDI2XCIpLCBjb2x1bW4gaGVhZGVycywgcm93IGNvdW50LCBhbmQgYW55IHBlci1wZXJpb2QgZmluYW5jaWFsIG1ldHJpY3MgKHJldmVudWUsIEVCSVREQSwgbmV0IGluY29tZSwgZ3Vlc3RzLCBzdGFmZiBjb3N0KSB5b3UgY2FuIHJlYWQgZnJvbSB0aGUgc2hlZXQuXG4zLiBDb25zb2xpZGF0ZSBBTEwgcGVyaW9kLWxldmVsIGZpbmFuY2lhbCBkYXRhIGFjcm9zcyB0aGUgd2hvbGUgd29ya2Jvb2sgaW50byBhIHNpbmdsZSBcInByb2plY3Rpb25zXCIgYXJyYXk6IG9uZSBlbnRyeSBwZXIgKHBlcmlvZCBZWVlZLU1NLCBkYXRhVHlwZSBhY3R1YWx8Zm9yZWNhc3QsIHNjZW5hcmlvIGFjdHVhbHxjb25zZXJ2YXRpdmV8cmVhbGlzdGljfGFzcGlyYXRpb25hbCkuIFVzZSB0aGUgYmVzdCBzb3VyY2UgZm9yIGVhY2ggcGVyaW9kIChlLmcuIGEgUCZMIHN0YXRlbWVudCBmb3IgYWN0dWFscywgYSBCRVAgdGFibGUgb3IgYnVkZ2V0IHNoZWV0IGZvciBmb3JlY2FzdHMpLiBBbm51YWwgdG90YWxzIHVzZSBZWVlZLTEyLiBPbmx5IGluY2x1ZGUgZW50cmllcyB3aGVyZSBhdCBsZWFzdCBvbmUgbWV0cmljIGlzIHByZXNlbnQuXG40LiBTdWdnZXN0IHRoZSBtb3N0IGFwcHJvcHJpYXRlIGFwcCB0ZW1wbGF0ZSBpZCBmcm9tIHRoaXMgYXZhaWxhYmxlIGNhdGFsb2c6IGZpbmFuY2lhbC1hbmFseXRpY3MsIHJlc3RhdXJhbnQsIGhvdGVsLCBlZHVjYXRpb24sIGVjb21tZXJjZS1yZXRhaWwsIGhlYWx0aGNhcmUsIG1hbnVmYWN0dXJpbmcsIHByb2Zlc3Npb25hbC1zZXJ2aWNlcywgcmVhbC1lc3RhdGUsIHN1cHBseS1jaGFpbiAoY29uZmlkZW5jZSAwLi4xKS5cblxuUlVMRVM6XG4tIHBlcmlvZHM6IFlZWVktTU0gb25seSAoZS5nLiBcIjIwMjYtMDZcIiwgXCIyMDI1LTEyXCIgZm9yIGFubnVhbCkuXG4tIGRhdGFUeXBlIFwiYWN0dWFsXCIgZm9yIHJlcG9ydGVkL2FjdHVhbCBmaWd1cmVzLCBcImZvcmVjYXN0XCIgZm9yIHByb2plY3Rpb25zL2J1ZGdldHMuXG4tIHNjZW5hcmlvOiBcImFjdHVhbFwiIGZvciBhY3R1YWxzOyBcImNvbnNlcnZhdGl2ZVwiIGZvciBiYXNlIGZvcmVjYXN0czsgXCJyZWFsaXN0aWNcIi9cImFzcGlyYXRpb25hbFwiIHdoZW4gdGhlIHNoZWV0IGV4cGxpY2l0bHkgbGFiZWxzIHNjZW5hcmlvcy5cbi0gQW1vdW50cyBhcmUgZnVsbCBJRFIgaW50ZWdlcnMgKG5vIFwiS1wiIHNob3J0aGFuZCkuIFJvdW5kIHRvIGludGVnZXJzLlxuLSBMZWF2ZSBhIG1ldHJpYyBudWxsIHdoZW4gdGhlIHNoZWV0IGRvZXMgbm90IGNvbnRhaW4gaXQgZm9yIHRoYXQgcGVyaW9kLlxuLSBjYXRlZ29yeSBtdXN0IGJlIG9uZSBvZjogJHtTSEVFVF9DQVRFR09SSUVTLmpvaW4oJywgJyl9LlxuXG4ke2hpbnRzU2VjdGlvbn1XT1JLQk9PSyBEVU1QOlxuJHtzaGVldEJsb2Nrc31gO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwQ29kZUZlbmNlKHJlcGx5KSB7XG4gICAgY29uc3QgbWF0Y2ggPSByZXBseS5tYXRjaCgvYGBgKD86anNvbik/XFxzKihbXFxzXFxTXSo/KWBgYC8pO1xuICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogcmVwbHk7XG59XG4vKipcbiAqIE9ORSBPcGVuQUkgY2FsbCB0byBjb21wcmVoZW5kIHRoZSB3b3JrYm9vay4gTm8gcmV0cnkgbG9vcCBcdTIwMTQgdGhlIGNhbGxlclxuICogKHN5bmMgcGlwZWxpbmUgb3Igd29ya2Zsb3cgc3RlcCkgb3ducyByZXRyeSBwb2xpY3kuXG4gKlxuICogVGhyb3dzOlxuICogICAtIENvbXByZWhlbmRIdHRwRXJyb3IgKHN0YXR1cyA0MjkgY2FycmllcyByZXRyeUFmdGVyU2Vjb25kcylcbiAqICAgLSBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yIChiYWQgSlNPTiAvIFpvZCByZWplY3Rpb24pXG4gKiAgIC0gQ29tcHJlaGVuZEVycm9yIChuZXR3b3JrIGV0Yy4gXHUyMDE0IHdyYXBwZWQgZnJvbSBmZXRjaCBmYWlsdXJlcylcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcHJlaGVuZE9uY2UoYmxvY2tzLCBvcHRpb25zKSB7XG4gICAgY29uc3QgeyBtb2RlbCA9ICdncHQtNG8nLCBoaW50cywgYXBpS2V5LCBiYXNlVXJsID0gJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEnIH0gPSBvcHRpb25zO1xuICAgIGlmIChibG9ja3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yKCdXb3JrYm9vayBjb250YWlucyBubyByZWFkYWJsZSBzaGVldHMnKTtcbiAgICB9XG4gICAgY29uc3QgcHJvbXB0ID0gYnVpbGRDb21wcmVoZW5zaW9uUHJvbXB0KGJsb2NrcywgaGludHMpO1xuICAgIGxldCByZXNwb25zZTtcbiAgICB0cnkge1xuICAgICAgICByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2Jhc2VVcmx9L2NoYXQvY29tcGxldGlvbnNgLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IFNZU1RFTV9QUk9NUFRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogcHJvbXB0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjIsXG4gICAgICAgICAgICAgICAgbWF4X3Rva2VuczogMTYzODQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VfZm9ybWF0OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdqc29uX29iamVjdCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhyb3cgbmV3IENvbXByZWhlbmRFcnJvcihgT3BlbkFJIHJlcXVlc3QgZmFpbGVkOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gLCB7XG4gICAgICAgICAgICBjYXVzZTogZXJyXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVyckJvZHkgPSBhd2FpdCByZXNwb25zZS50ZXh0KCkuY2F0Y2goKCk9PidVbmtub3duIGVycm9yJyk7XG4gICAgICAgIGxldCByZXRyeUFmdGVyU2Vjb25kcyA9IG51bGw7XG4gICAgICAgIGNvbnN0IHJldHJ5QWZ0ZXIgPSByZXNwb25zZS5oZWFkZXJzLmdldCgncmV0cnktYWZ0ZXInKTtcbiAgICAgICAgaWYgKHJldHJ5QWZ0ZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IE51bWJlcihyZXRyeUFmdGVyKTtcbiAgICAgICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUocGFyc2VkKSAmJiBwYXJzZWQgPj0gMCkgcmV0cnlBZnRlclNlY29uZHMgPSBwYXJzZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IENvbXByZWhlbmRIdHRwRXJyb3IocmVzcG9uc2Uuc3RhdHVzLCBgT3BlbkFJIEFQSSBlcnJvciAoJHtyZXNwb25zZS5zdGF0dXN9KTogJHtlcnJCb2R5fWAsIHJldHJ5QWZ0ZXJTZWNvbmRzKTtcbiAgICB9XG4gICAgbGV0IHJlc3VsdDtcbiAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yKGBPcGVuQUkgcmVzcG9uc2Ugd2FzIG5vdCB2YWxpZCBKU09OOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gKTtcbiAgICB9XG4gICAgY29uc3QgcmVwbHkgPSByZXN1bHQuY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50ID8/ICcnO1xuICAgIGxldCBwYXJzZWQ7XG4gICAgdHJ5IHtcbiAgICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShzdHJpcENvZGVGZW5jZShyZXBseSkpO1xuICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgdGhyb3cgbmV3IENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IoJ0FJIHJlc3BvbnNlIHdhcyBub3QgdmFsaWQgSlNPTjogJyArIHJlcGx5LnNsaWNlKDAsIDUwMCkpO1xuICAgIH1cbiAgICBsZXQgY29tcHJlaGVuc2lvbjtcbiAgICB0cnkge1xuICAgICAgICBjb21wcmVoZW5zaW9uID0gV29ya2Jvb2tDb21wcmVoZW5zaW9uU2NoZW1hLnBhcnNlKHBhcnNlZCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0ID0gZXJyIGluc3RhbmNlb2Ygei5ab2RFcnJvciA/IGVyci5pc3N1ZXNbMF0gOiBudWxsO1xuICAgICAgICBjb25zdCBkZXRhaWwgPSBmaXJzdCA/IGAke2ZpcnN0LnBhdGguam9pbignLicpIHx8ICdyb290J306ICR7Zmlyc3QubWVzc2FnZX1gIDogU3RyaW5nKGVycik7XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yKGBBSSByZXNwb25zZSBmYWlsZWQgc2NoZW1hIHZhbGlkYXRpb246ICR7ZGV0YWlsfWAsIHtcbiAgICAgICAgICAgIGNhdXNlOiBlcnJcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbXByZWhlbnNpb24sXG4gICAgICAgIG1vZGVsLFxuICAgICAgICBwcm9tcHRMZW5ndGg6IHByb21wdC5sZW5ndGhcbiAgICB9O1xufVxuIiwgIi8qKlxuICogUHJvZ3Jlc3MgZW1pc3Npb24gZm9yIHRoZSB3b3JrYm9vay1pbmdlc3Qgd29ya2Zsb3cuXG4gKlxuICogRm9sbG93cyB0aGUgU0RLIHN0cmVhbWluZyBwYXR0ZXJuOlxuICogICAtIHRoZSB3b3JrZmxvdyBmdW5jdGlvbiBjYWxscyBgZ2V0V3JpdGFibGUoKWAgYW5kIHBhc3NlcyB0aGUgc3RyZWFtIHRvIHN0ZXBzO1xuICogICAtIHN0ZXBzIG9idGFpbiBhIHdyaXRlciwgd3JpdGUgSlNPTiBjaHVua3MsIGFuZCByZWxlYXNlIHRoZSBsb2NrLlxuICpcbiAqIFRoZSB3cml0YWJsZSBzdHJlYW0gaXMgc2VyaWFsaXplZCBieSByZWZlcmVuY2UgYWNyb3NzIHN0ZXAgYm91bmRhcmllc1xuICogKHN0cmVhbVRvU3RyZWFtUmVmKSwgc28gd2UgYWx3YXlzIHBhc3MgdGhlIHJhdyBXcml0YWJsZVN0cmVhbSBcdTIwMTQgbmV2ZXIgYVxuICogd3JhcHBlciBvYmplY3QuXG4gKi8gLyoqXG4gKiBFbmNvZGUgYSBwcm9ncmVzcyBjaHVuayBhcyBhIEpTT04gc3RyaW5nIChjaHVua3MgYXJlIHdyaXR0ZW4gYXMgdGV4dCkuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUNodW5rKGNodW5rKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGNodW5rKTtcbn1cbi8qKlxuICogV3JpdGUgb25lIHByb2dyZXNzIGNodW5rLiBDYWxsIGZyb20gd2l0aGluIGEgc3RlcDpcbiAqXG4gKiAgIGFzeW5jIGZ1bmN0aW9uIGVtaXRQcm9ncmVzc1N0ZXAod3JpdGFibGU6IFdyaXRhYmxlU3RyZWFtLCBjaHVuazogUHJvZ3Jlc3NDaHVuaykge1xuICogICAgICd1c2Ugc3RlcCc7XG4gKiAgICAgYXdhaXQgd3JpdGVQcm9ncmVzc0NodW5rKHdyaXRhYmxlLCBjaHVuayk7XG4gKiAgIH1cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGVQcm9ncmVzc0NodW5rKHdyaXRhYmxlLCBjaHVuaykge1xuICAgIGNvbnN0IHdyaXRlciA9IHdyaXRhYmxlLmdldFdyaXRlcigpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHdyaXRlci53cml0ZShjaHVuayk7XG4gICAgfSBmaW5hbGx5e1xuICAgICAgICB3cml0ZXIucmVsZWFzZUxvY2soKTtcbiAgICB9XG59XG4vKiogQ2xvc2UgdGhlIHN0cmVhbSB0byBzaWduYWwgY29tcGxldGlvbi4gQ2FsbCBmcm9tIHdpdGhpbiBhIHN0ZXAuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbG9zZVByb2dyZXNzU3RyZWFtKHdyaXRhYmxlKSB7XG4gICAgYXdhaXQgd3JpdGFibGUuY2xvc2UoKTtcbn1cbiIsICIvKipcbiAqIExpZ2h0d2VpZ2h0IFBvc3RncmVTUUwgaGVscGVyIGZvciB3b3JrZmxvdyBzdGVwcyAocGcgZHJpdmVyLCBubyBQcmlzbWEpLlxuICpcbiAqIEVhY2ggc3RlcCBvcGVucyBpdHMgb3duIHNob3J0LWxpdmVkIGNvbm5lY3Rpb24gXHUyMDE0IGZpbmUgZm9yIHdvcmtmbG93IHN0ZXBzXG4gKiB3aGljaCBhcmUgYWxyZWFkeSBpbmRpdmlkdWFsbHkgaW52b2ljZWQgVmVyY2VsIEZ1bmN0aW9uIGludm9jYXRpb25zLlxuICogVGhlIHBvb2wvY29ubmVjdGlvbi1zdHJpbmcgY29tZXMgZnJvbSBgcHJvY2Vzcy5lbnYuUE9TVEdSRVNfVVJMYCAoc2V0IGJ5XG4gKiB0aGUgVmVyY2VsL05lb24gaW50ZWdyYXRpb24gYW5kIGF2YWlsYWJsZSBpbiBzdGVwIHJ1bnRpbWUpLlxuICovIGltcG9ydCB7IENsaWVudCB9IGZyb20gJ3BnJztcbi8qKlxuICogUnVuIGEgY2FsbGJhY2sgd2l0aCBhIHNob3J0LWxpdmVkIHBnIGNvbm5lY3Rpb24uXG4gKiBUaGUgY29ubmVjdGlvbiBzdHJpbmcgaXMgcmVzb2x2ZWQgYnkgdGhlIHJvdXRlIChyb290IGVudiBcdTIxOTIgdGVuYW50IGRiX3VybCBsb29rdXApXG4gKiBhbmQgcGFzc2VkIHRocm91Z2ggdGhlIHdvcmtmbG93IGlucHV0IFx1MjAxNCBuZXZlciByZWFkIGZyb20gcHJvY2Vzcy5lbnYgZGlyZWN0bHkuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdpdGhQZ0NsaWVudChjb25uZWN0aW9uU3RyaW5nLCBmbikge1xuICAgIGlmICghY29ubmVjdGlvblN0cmluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGRhdGFiYXNlIGNvbm5lY3Rpb24gc3RyaW5nIHByb3ZpZGVkLicpO1xuICAgIH1cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xpZW50KHtcbiAgICAgICAgY29ubmVjdGlvblN0cmluZ1xuICAgIH0pO1xuICAgIGF3YWl0IGNsaWVudC5jb25uZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IGZuKGNsaWVudCk7XG4gICAgfSBmaW5hbGx5e1xuICAgICAgICBhd2FpdCBjbGllbnQuZW5kKCk7XG4gICAgfVxufVxuLyoqIFJ1biBhIHNpbmdsZSBTUUwgc3RhdGVtZW50IGFuZCByZXR1cm4gdGhlIHJvdyBjb3VudCBvciByZXN1bHQuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlT25lKGNsaWVudCwgc3FsLCBwYXJhbXMgPSBbXSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5xdWVyeShzcWwsIHBhcmFtcyk7XG4gICAgcmV0dXJuIHJlc3VsdC5yb3dDb3VudCA/PyAwO1xufVxuLyoqIFJ1biBTUUwgYW5kIHJldHVybiBhbGwgcm93cy4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHF1ZXJ5Um93cyhjbGllbnQsIHNxbCwgcGFyYW1zID0gW10pIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQucXVlcnkoc3FsLCBwYXJhbXMpO1xuICAgIHJldHVybiByZXN1bHQucm93cztcbn1cbiIsICIvKipcbiAqIEltcG9ydC10aW1lIEV4Y2VsIGZvcm11bGEgZXh0cmFjdGlvbiArIHJlZmVyZW5jZSBtYXBwaW5nLlxuICpcbiAqIFdoZW4gYSB3b3JrYm9vayBpcyBpbXBvcnRlZCB0aGUgcmF3IHhsc3ggaXMgY2FjaGVkIGluIHRoZSBkYXRhYmFzZVxuICogKGtub3dsZWRnZV9zbmlwcGV0cy53b3JrYm9va19kYXRhKSBhbmQgc2VydmVkIHRvIHRoZSBzaGVldCB2aWV3ZXIgYXMgSlNPTlxuICogcm93cyBrZXllZCBieSBjb2x1bW4gaGVhZGVyIHdpdGggYSBkZXRlY3RlZCBoZWFkZXIgcm93LiBUaGlzIG1vZHVsZSB3YWxrc1xuICogZXZlcnkgc2hlZXQgb2YgdGhlIGltcG9ydGVkIHdvcmtib29rIGFuZDpcbiAqXG4gKiAgIDEuIGZpbmRzIEFMTCBmb3JtdWxhIGNlbGxzIChcIj1TVU0oVjQ2OlY1NClcIiwgXCI9UEwhRDdcIiwgLi4uKSxcbiAqICAgMi4gbWFwcyBlYWNoIGZvcm11bGEgY2VsbCBpdHNlbGYgdG8gdGhlIERCLXNoZWV0IGNvb3JkaW5hdGVzIHRoZVxuICogICAgICBhcHBsaWNhdGlvbiBkaXNwbGF5cyAoY29sdW1uIGtleSArIGRhdGEtcm93IG9mZnNldCArIGFic29sdXRlIEExKSxcbiAqICAgMy4gbWFwcyBldmVyeSByZWZlcmVuY2UgaW5zaWRlIHRoZSBmb3JtdWxhIHRvIHRoZSBzYW1lIGNvb3JkaW5hdGVzXG4gKiAgICAgIChjcm9zcy1zaGVldCByZWZzIGluY2x1ZGVkKSwgc28gYSBmb3JtdWxhIGNhbiBiZSBjb21wdXRlZCBhZ2FpbnN0IHRoZVxuICogICAgICBEQi1zYXZlZCBzaGVldCBkYXRhIGV2ZW4gd2hlbiByYXcgZ3JpZCBwb3NpdGlvbnMgc2hpZnQgYmV0d2VlblxuICogICAgICBpbXBvcnRzLFxuICogICA0LiBjb21wdXRlcyBhIGJlc3QtZWZmb3J0IHZhbHVlIHdpdGggdGhlIHNhbWUgZXZhbHVhdG9yIHRoZSBBUEkgdXNlc1xuICogICAgICAoc3JjL2xpYi9leGNlbC1mb3JtdWxhLnRzKSBzbyBjb25zdW1lcnMgaGF2ZSBhbiBpbXBvcnQtdGltZSBzbmFwc2hvdC5cbiAqXG4gKiBUaGUgcmVzdWx0aW5nIFdvcmtib29rRm9ybXVsYU1hcCBpcyBwZXJzaXN0ZWQgYXMgYSBrbm93bGVkZ2Vfc25pcHBldHMgSlNPTlxuICogZW50cnkgKGtleSBcIndvcmtib29rX2Zvcm11bGFzXCIpIGJ5IGJvdGggaW1wb3J0IHBhdGhzIChzZWVkLXJ1bm5lciBhbmQgdGhlXG4gKiB3b3JrYm9vay1pbmdlc3Qgd29ya2Zsb3cpLlxuICovIGltcG9ydCB7IHV0aWxzIH0gZnJvbSAneGxzeCc7XG5pbXBvcnQgeyBldmFsdWF0ZUZvcm11bGEsIGNvbGxlY3RSZWZlcmVuY2VzIH0gZnJvbSAnQC9saWIvZXhjZWwtZm9ybXVsYSc7XG5pbXBvcnQgeyBmaW5kSGVhZGVyUm93LCBidWlsZENvbHVtbktleXMgfSBmcm9tICdAL2xpYi93b3JrYm9vay1tYXBwaW5nJztcbmZ1bmN0aW9uIGlzQ2VsbEFkZHJlc3Moa2V5KSB7XG4gICAgcmV0dXJuIC9eW0EtWl0rXFxkKyQvLnRlc3Qoa2V5KTtcbn1cbi8qKiBNYXAgb25lIHJhdyByZWZlcmVuY2UgdG9rZW4gdG8gREIgY29vcmRpbmF0ZXMgKHRhcmdldCBzaGVldCBhd2FyZSkuICovIGZ1bmN0aW9uIG1hcFJlZihyZWYsIGhlYWRlckNhY2hlLCB3YiwgZm9ybXVsYVNoZWV0KSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gcmVmLnNoZWV0ID8/IGZvcm11bGFTaGVldDtcbiAgICBjb25zdCB0YXJnZXRXcyA9IHdiLlNoZWV0c1t0YXJnZXRdO1xuICAgIC8vIFNhbWUtc2hlZXQgcmVmZXJlbmNlcyBrZWVwIHNoZWV0ICcnIChjb21wYWN0KTsgZXhwbGljaXQgb3RoZXJ3aXNlLlxuICAgIGNvbnN0IHNoZWV0ID0gcmVmLnNoZWV0ID8/ICcnO1xuICAgIGlmICghdGFyZ2V0V3MpIHtcbiAgICAgICAgLy8gU2hlZXQgdmFuaXNoZWQgXHUyMDE0IGtlZXAgdGhlIHJhdyBhZGRyZXNzIHNvIG5vdGhpbmcgaXMgbG9zdC5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNoZWV0LFxuICAgICAgICAgICAga2luZDogJ2NlbGwnLFxuICAgICAgICAgICAgYWJzQ2VsbDogcmVmLmFkZHJcbiAgICAgICAgfTtcbiAgICB9XG4gICAgbGV0IGhlYWRlciA9IGhlYWRlckNhY2hlLmdldCh0YXJnZXQpO1xuICAgIGlmICghaGVhZGVyKSB7XG4gICAgICAgIGhlYWRlciA9IGZpbmRIZWFkZXJSb3codGFyZ2V0V3MpO1xuICAgICAgICBoZWFkZXJDYWNoZS5zZXQodGFyZ2V0LCBoZWFkZXIpO1xuICAgIH1cbiAgICBjb25zdCBzdGFydCA9IG1hcENlbGxUb0RhdGFSZWYodGFyZ2V0V3MsIHJlZi5hZGRyLCBoZWFkZXIpO1xuICAgIGNvbnN0IG1hcHBlZCA9IHtcbiAgICAgICAgc2hlZXQsXG4gICAgICAgIGtpbmQ6IHJlZi5lbmQgPyAncmFuZ2UnIDogJ2NlbGwnLFxuICAgICAgICBjb2xLZXk6IHN0YXJ0LmNvbEtleSxcbiAgICAgICAgcmVsUm93OiBzdGFydC5yZWxSb3csXG4gICAgICAgIGFic0NlbGw6IHJlZi5hZGRyXG4gICAgfTtcbiAgICBpZiAocmVmLmVuZCkge1xuICAgICAgICBjb25zdCBlbmQgPSBtYXBDZWxsVG9EYXRhUmVmKHRhcmdldFdzLCByZWYuZW5kLCBoZWFkZXIpO1xuICAgICAgICBtYXBwZWQuZW5kID0ge1xuICAgICAgICAgICAgY29sS2V5OiBlbmQuY29sS2V5LFxuICAgICAgICAgICAgcmVsUm93OiBlbmQucmVsUm93LFxuICAgICAgICAgICAgYWJzQ2VsbDogcmVmLmVuZFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gbWFwcGVkO1xufVxuLyoqIENvbHVtbi1vbmx5IChBOkEpIG9yIGZ1bGwtY2VsbCBtYXBwaW5nIHRvIERCIGNvb3JkaW5hdGVzLiAqLyBmdW5jdGlvbiBtYXBDZWxsVG9EYXRhUmVmKHdzLCBhZGRyLCBoZWFkZXIpIHtcbiAgICBjb25zdCBjbGVhbiA9IGFkZHIucmVwbGFjZSgvXFwkL2csICcnKTtcbiAgICBpZiAoL15bQS1aYS16XSskLy50ZXN0KGNsZWFuKSkge1xuICAgICAgICAvLyBXaG9sZS1jb2x1bW4gcmVmZXJlbmNlOiBjb2x1bW4gbWFwcyB0byBpdHMgaGVhZGVyIGtleSwgcm93cyBhcmUgdW5ib3VuZGVkLlxuICAgICAgICBjb25zdCBjb2xJZHggPSB1dGlscy5kZWNvZGVfY29sKGNsZWFuKTtcbiAgICAgICAgY29uc3QgY29sdW1uS2V5cyA9IGJ1aWxkQ29sdW1uS2V5cyhoZWFkZXIuaGVhZGVycyk7XG4gICAgICAgIGNvbnN0IHJhd0hlYWRlciA9IGhlYWRlci5oZWFkZXJzW2NvbElkeF0gPz8gJyc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb2xLZXk6IHJhd0hlYWRlci50cmltKCkgPyBjb2x1bW5LZXlzW2NvbElkeF0gOiB1bmRlZmluZWQsXG4gICAgICAgICAgICByZWxSb3c6IHVuZGVmaW5lZFxuICAgICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBkZWNvZGVkID0gdXRpbHMuZGVjb2RlX2NlbGwoY2xlYW4pO1xuICAgIGNvbnN0IHJlbFJvdyA9IGRlY29kZWQuciAtIGhlYWRlci5oZWFkZXJSb3cgKyAxO1xuICAgIGNvbnN0IGNvbHVtbktleXMgPSBidWlsZENvbHVtbktleXMoaGVhZGVyLmhlYWRlcnMpO1xuICAgIGNvbnN0IHJhd0hlYWRlciA9IGhlYWRlci5oZWFkZXJzW2RlY29kZWQuY10gPz8gJyc7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29sS2V5OiByYXdIZWFkZXIudHJpbSgpID8gY29sdW1uS2V5c1tkZWNvZGVkLmNdIDogdW5kZWZpbmVkLFxuICAgICAgICByZWxSb3c6IHJlbFJvdyA+PSAxID8gcmVsUm93IDogdW5kZWZpbmVkXG4gICAgfTtcbn1cbi8qKlxuICogV2FsayBldmVyeSBzaGVldCBhbmQgYnVpbGQgdGhlIGZ1bGwgZm9ybXVsYSBpbnZlbnRvcnkgKyByZWZlcmVuY2UgbWFwcGluZy5cbiAqXG4gKiBFeHBlY3RzIGB3YmAgcGFyc2VkIHdpdGggYGNlbGxGb3JtdWxhOiB0cnVlYCAoU2hlZXRKUyBvbmx5IHBvcHVsYXRlc1xuICogYGNlbGwuZmAgd2hlbiBmb3JtdWxhIHN0cmluZ3MgYXJlIHJlYWQpLlxuICovIGV4cG9ydCBmdW5jdGlvbiBidWlsZFdvcmtib29rRm9ybXVsYU1hcCh3Yikge1xuICAgIGNvbnN0IG1hcCA9IHt9O1xuICAgIGNvbnN0IGhlYWRlckNhY2hlID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgdGFiTmFtZSBvZiB3Yi5TaGVldE5hbWVzKXtcbiAgICAgICAgY29uc3Qgd3MgPSB3Yi5TaGVldHNbdGFiTmFtZV07XG4gICAgICAgIGNvbnN0IGhlYWRlciA9IGZpbmRIZWFkZXJSb3cod3MpO1xuICAgICAgICBjb25zdCBjb2x1bW5LZXlzID0gYnVpbGRDb2x1bW5LZXlzKGhlYWRlci5oZWFkZXJzKTtcbiAgICAgICAgY29uc3QgaGVhZGVyQ2FjaGVLZXkgPSB0YWJOYW1lO1xuICAgICAgICBoZWFkZXJDYWNoZS5zZXQoaGVhZGVyQ2FjaGVLZXksIGhlYWRlcik7XG4gICAgICAgIGNvbnN0IGZvcm11bGFzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHdzKSl7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnIXJlZicgfHwga2V5ID09PSAnIW1hcmdpbnMnIHx8IGtleSA9PT0gJyFtZXJnZXMnIHx8IGtleSA9PT0gJyFjb2xzJyB8fCBrZXkgPT09ICchcm93cycpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKCFpc0NlbGxBZGRyZXNzKGtleSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgY2VsbCA9IHdzW2tleV07XG4gICAgICAgICAgICBpZiAoIWNlbGwgfHwgdHlwZW9mIGNlbGwuZiAhPT0gJ3N0cmluZycgfHwgY2VsbC5mLnRyaW0oKSA9PT0gJycpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgZm9ybXVsYSA9IGNlbGwuZi50cmltKCkuc3RhcnRzV2l0aCgnPScpID8gY2VsbC5mLnRyaW0oKSA6ICc9JyArIGNlbGwuZi50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBkZWNvZGVkID0gdXRpbHMuZGVjb2RlX2NlbGwoa2V5KTtcbiAgICAgICAgICAgIGNvbnN0IHJlbFJvdyA9IGRlY29kZWQuciAtIGhlYWRlci5oZWFkZXJSb3cgKyAxO1xuICAgICAgICAgICAgY29uc3QgcmF3SGVhZGVyID0gaGVhZGVyLmhlYWRlcnNbZGVjb2RlZC5jXSA/PyAnJztcbiAgICAgICAgICAgIGNvbnN0IHJlZnMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmF3UmVmIG9mIGNvbGxlY3RSZWZlcmVuY2VzKGZvcm11bGEpKXtcbiAgICAgICAgICAgICAgICByZWZzLnB1c2gobWFwUmVmKHJhd1JlZiwgaGVhZGVyQ2FjaGUsIHdiLCB0YWJOYW1lKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBldmFsdWF0ZUZvcm11bGEod2IsIHdzLCBmb3JtdWxhLCAwLCBrZXkpO1xuICAgICAgICAgICAgZm9ybXVsYXMucHVzaCh7XG4gICAgICAgICAgICAgICAgY2VsbDoga2V5LFxuICAgICAgICAgICAgICAgIGZvcm11bGEsXG4gICAgICAgICAgICAgICAgY29sS2V5OiByYXdIZWFkZXIudHJpbSgpID8gY29sdW1uS2V5c1tkZWNvZGVkLmNdIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHJlbFJvdzogcmVsUm93ID49IDEgPyByZWxSb3cgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgYWJzUm93OiBkZWNvZGVkLnIgKyAxLFxuICAgICAgICAgICAgICAgIGFic0NvbDogZGVjb2RlZC5jICsgMSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnVuZXZhbHVhYmxlID8gdW5kZWZpbmVkIDogcmVzdWx0LnZhbHVlLFxuICAgICAgICAgICAgICAgIHVuZXZhbHVhYmxlOiByZXN1bHQudW5ldmFsdWFibGUsXG4gICAgICAgICAgICAgICAgcmVmc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgbWFwW3RhYk5hbWVdID0ge1xuICAgICAgICAgICAgaGVhZGVyUm93OiBoZWFkZXIuaGVhZGVyUm93LFxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVyLmhlYWRlcnMsXG4gICAgICAgICAgICBjb2x1bW5LZXlzLFxuICAgICAgICAgICAgZm9ybXVsYXNcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbiIsICIvKipcbiAqIEV4Y2VsIGZvcm11bGEgc3VwcG9ydCBmb3IgdGhlIFNoZWV0IFZpZXdlci5cbiAqXG4gKiBUaGUgd29ya2Jvb2sgc3RvcmVzIGZvcm11bGFzIChlLmcuIFwiPVNVTShFMTA6RTExKVwiLCBcIj1JRihENj0wLFxcXCJcXFwiLChGNi1ENikvRDYpXCIsXG4gKiBcIj1QTCFEN1wiKSB3aXRoIEV4Y2VsJ3MgY2FjaGVkIGNhbGN1bGF0ZWQgdmFsdWVzLiBUaGlzIG1vZHVsZTpcbiAqICAtIGV2YWx1YXRlcyBhIGZvcm11bGEgYWdhaW5zdCB0aGUgd29ya2Jvb2sgKGJlc3QtZWZmb3J0KSBzbyB0aGUgRGF0YUdyaWQgY2FuXG4gKiAgICBzaG93IHRoZSBjYWxjdWxhdGVkIHJlc3VsdCBpbW1lZGlhdGVseSBhZnRlciB0aGUgdXNlciBhbWVuZHMgdGhlIGZvcm11bGEsXG4gKiAgLSBtYXJrcyBmb3JtdWxhcyB3ZSBjYW5ub3QgZXZhbHVhdGUgKGV4b3RpYyBmdW5jdGlvbnMsIGV0Yy4pIGFzXG4gKiAgICB1bmV2YWx1YWJsZSBcdTIwMTQgdGhlIGZvcm11bGEgaXMgc3RpbGwgc3RvcmVkIGluIHRoZSB3b3JrYm9vayBhbmQgRXhjZWxcbiAqICAgIHJlY2FsY3VsYXRlcyBpdCBvbiBvcGVuLlxuICpcbiAqIFN1cHBvcnRlZDogYXJpdGhtZXRpYyAoKyAtICogLyBeICUpLCBwYXJlbnMsIGNlbGwgcmVmcyAoQTEsICRBJDEpLFxuICogY3Jvc3Mtc2hlZXQgcmVmcyAoU2hlZXQhQTEsICdTaGVldCBOYW1lJyFBMSksIHJhbmdlcyAoQTE6QjUpIGFuZCB0aGVcbiAqIGZ1bmN0aW9ucyBTVU0sIEFWRVJBR0UsIE1JTiwgTUFYLCBDT1VOVCwgQ09VTlRBLCBQUk9EVUNULCBBQlMsIElOVCwgU1FSVCxcbiAqIFJPVU5ELCBST1VORFVQLCBST1VORERPV04sIE1PRCwgUE9XRVIsIElGLCBTVUJUT1RBTCAoY29kZSA5LzEwOSBvbmx5KSxcbiAqIEFORCwgT1IsIFRSSU0sIFBST1BFUiwgQ0hPT1NFLCBEQVRFLCBXRUVLREFZLCBDT0xVTU4sIFNVTUlGLCBWTE9PS1VQLFxuICogTUFUQ0gsIElOREVYLCBURVhULCBJRkVSUk9SLlxuICovIGltcG9ydCB7IHV0aWxzIH0gZnJvbSAneGxzeCc7XG5jb25zdCBNQVhfREVQVEggPSAxMjtcbmNvbnN0IE1BWF9SQU5HRV9DRUxMUyA9IDEwMF8wMDA7XG5mdW5jdGlvbiBpc1JhbmdlKHYpIHtcbiAgICByZXR1cm4gdHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYgIT09IG51bGwgJiYgJ19fcmFuZ2UnIGluIHY7XG59XG5mdW5jdGlvbiB0b2tlbml6ZShzcmMpIHtcbiAgICBjb25zdCB0b2tlbnMgPSBbXTtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IHByZXZUb2tlbjtcbiAgICB3aGlsZShpIDwgc3JjLmxlbmd0aCl7XG4gICAgICAgIGNvbnN0IGNoID0gc3JjW2ldO1xuICAgICAgICBpZiAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcgfHwgY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoL1tcXGQuXS8udGVzdChjaCkpIHtcbiAgICAgICAgICAgIGxldCBqID0gaTtcbiAgICAgICAgICAgIHdoaWxlKGogPCBzcmMubGVuZ3RoICYmIC9bXFxkLl0vLnRlc3Qoc3JjW2pdKSlqKys7XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ251bScsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHNyYy5zbGljZShpLCBqKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpID0gajtcbiAgICAgICAgICAgIHByZXZUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09ICdcIicpIHtcbiAgICAgICAgICAgIGxldCBqID0gaSArIDE7XG4gICAgICAgICAgICB3aGlsZShqIDwgc3JjLmxlbmd0aCAmJiBzcmNbal0gIT09ICdcIicpaisrO1xuICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdzdHInLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzcmMuc2xpY2UoaSArIDEsIGopXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGkgPSBqICsgMTtcbiAgICAgICAgICAgIHByZXZUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09IFwiJ1wiKSB7XG4gICAgICAgICAgICBsZXQgaiA9IGkgKyAxO1xuICAgICAgICAgICAgd2hpbGUoaiA8IHNyYy5sZW5ndGggJiYgc3JjW2pdICE9PSBcIidcIilqKys7XG4gICAgICAgICAgICBjb25zdCBzaGVldE5hbWUgPSBzcmMuc2xpY2UoaSArIDEsIGopO1xuICAgICAgICAgICAgaSA9IGogKyAxO1xuICAgICAgICAgICAgaWYgKHNyY1tpXSA9PT0gJyEnKSB7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc2hlZXQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc2hlZXROYW1lXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHByZXZUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBxdW90ZWQgdG9rZW4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoL1tBLVphLXpfJF0vLnRlc3QoY2gpKSB7XG4gICAgICAgICAgICBsZXQgaiA9IGk7XG4gICAgICAgICAgICB3aGlsZShqIDwgc3JjLmxlbmd0aCAmJiAvW0EtWmEtejAtOV8kLl0vLnRlc3Qoc3JjW2pdKSlqKys7XG4gICAgICAgICAgICBjb25zdCB3b3JkID0gc3JjLnNsaWNlKGksIGopO1xuICAgICAgICAgICAgaWYgKHNyY1tqXSA9PT0gJyEnKSB7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc2hlZXQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogd29yZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGkgPSBqICsgMTtcbiAgICAgICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKC9eXFwkP1tBLVphLXpdezEsM31cXCQ/XFxkKyQvLnRlc3Qod29yZCkpIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncmVmJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogd29yZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbHNlIGlmICgvXlxcJD9bQS1aYS16XXsxLDN9JC8udGVzdCh3b3JkKSAmJiAoc3JjW2pdID09PSAnOicgfHwgcHJldlRva2VuPy50eXBlID09PSAnb3AnICYmIHByZXZUb2tlbi52YWx1ZSA9PT0gJzonKSkge1xuICAgICAgICAgICAgICAgIC8vIFdob2xlLWNvbHVtbiByZWYgKEE6QSwgJEM6JEFHKSBcdTIwMTQgb25seSBtZWFuaW5nZnVsIGluc2lkZSBhIHJhbmdlXG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncmVmJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHdvcmRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod29yZCA9PT0gJ1RSVUUnKSB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2wnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnVFJVRSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxzZSBpZiAod29yZCA9PT0gJ0ZBTFNFJykgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ0ZBTFNFJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbHNlIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnaWRlbnQnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB3b3JkLnRvVXBwZXJDYXNlKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaSA9IGo7XG4gICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHdvID0gc3JjLnNsaWNlKGksIGkgKyAyKTtcbiAgICAgICAgaWYgKHR3byA9PT0gJzw9JyB8fCB0d28gPT09ICc+PScgfHwgdHdvID09PSAnPD4nKSB7XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ29wJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdHdvXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgIHByZXZUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoJystKi9ePTw+KCksJTonLmluY2x1ZGVzKGNoKSkge1xuICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdvcCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHByZXZUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuZXhwZWN0ZWQgY2hhcjogJyArIGNoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRva2Vucztcbn1cbmZ1bmN0aW9uIHRvTnVtKHYpIHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiAwOyAvLyBFeGNlbDogZW1wdHkgY2VsbCBpbiBudW1lcmljIGNvbnRleHQgPSAwXG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykgcmV0dXJuIHY7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHJldHVybiB2ID8gMSA6IDA7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb25zdCBuID0gTnVtYmVyKHYudHJpbSgpKTtcbiAgICAgICAgaWYgKGlzRmluaXRlKG4pKSByZXR1cm4gbjtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdub3QgbnVtZXJpYycpO1xufVxuZnVuY3Rpb24gdHJ1dGh5KHYpIHtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykgcmV0dXJuIHY7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykgcmV0dXJuIHYgIT09IDA7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJykgcmV0dXJuIHYudHJpbSgpICE9PSAnJztcbiAgICBpZiAoaXNSYW5nZSh2KSkgcmV0dXJuIHYudmFsdWVzLnNvbWUoKHgpPT50cnV0aHkoeCkpO1xuICAgIHJldHVybiBmYWxzZTtcbn1cbmNsYXNzIFBhcnNlciB7XG4gICAgd2I7XG4gICAgd3M7XG4gICAgZGVwdGg7XG4gICAgY3VycmVudENlbGxBZGRyO1xuICAgIHRva2VucztcbiAgICBwb3MgPSAwO1xuICAgIGNvbnN0cnVjdG9yKHdiLCB3cywgc3JjLCBkZXB0aCA9IDAsIGN1cnJlbnRDZWxsQWRkcil7XG4gICAgICAgIHRoaXMud2IgPSB3YjtcbiAgICAgICAgdGhpcy53cyA9IHdzO1xuICAgICAgICB0aGlzLmRlcHRoID0gZGVwdGg7XG4gICAgICAgIHRoaXMuY3VycmVudENlbGxBZGRyID0gY3VycmVudENlbGxBZGRyO1xuICAgICAgICB0aGlzLnRva2VucyA9IHRva2VuaXplKHNyYyk7XG4gICAgfVxuICAgIHBhcnNlRXhwcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VDb21wYXJpc29uKCk7XG4gICAgfVxuICAgIC8qKiBUcnVlIHdoZW4gdGhlIGZ1bGwgdG9rZW4gc3RyZWFtIGhhcyBiZWVuIGNvbnN1bWVkLiAqLyBmaW5pc2hlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9zID49IHRoaXMudG9rZW5zLmxlbmd0aDtcbiAgICB9XG4gICAgcGVlaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9rZW5zW3RoaXMucG9zXTtcbiAgICB9XG4gICAgbmV4dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9rZW5zW3RoaXMucG9zKytdO1xuICAgIH1cbiAgICBleHBlY3RPcChvcCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmICghdCB8fCB0LnR5cGUgIT09ICdvcCcgfHwgdC52YWx1ZSAhPT0gb3ApIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgJyArIG9wKTtcbiAgICB9XG4gICAgcGFyc2VDb21wYXJpc29uKCkge1xuICAgICAgICBsZXQgbGVmdCA9IHRoaXMucGFyc2VBZGRpdGl2ZSgpO1xuICAgICAgICB3aGlsZSh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIFtcbiAgICAgICAgICAgICc9JyxcbiAgICAgICAgICAgICc8PicsXG4gICAgICAgICAgICAnPCcsXG4gICAgICAgICAgICAnPicsXG4gICAgICAgICAgICAnPD0nLFxuICAgICAgICAgICAgJz49J1xuICAgICAgICBdLmluY2x1ZGVzKHRoaXMucGVlaygpLnZhbHVlKSl7XG4gICAgICAgICAgICBjb25zdCBvcCA9IHRoaXMubmV4dCgpLnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLnBhcnNlQWRkaXRpdmUoKTtcbiAgICAgICAgICAgIGxlZnQgPSBjb21wYXJlKG9wLCBsZWZ0LCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxlZnQ7XG4gICAgfVxuICAgIHBhcnNlQWRkaXRpdmUoKSB7XG4gICAgICAgIGxldCBsZWZ0ID0gdGhpcy5wYXJzZU11bHRpcGxpY2F0aXZlKCk7XG4gICAgICAgIHdoaWxlKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgKHRoaXMucGVlaygpLnZhbHVlID09PSAnKycgfHwgdGhpcy5wZWVrKCkudmFsdWUgPT09ICctJykpe1xuICAgICAgICAgICAgY29uc3Qgb3AgPSB0aGlzLm5leHQoKS52YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZU11bHRpcGxpY2F0aXZlKCk7XG4gICAgICAgICAgICBsZWZ0ID0gYXJpdGgob3AsIGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVmdDtcbiAgICB9XG4gICAgcGFyc2VNdWx0aXBsaWNhdGl2ZSgpIHtcbiAgICAgICAgbGV0IGxlZnQgPSB0aGlzLnBhcnNlVW5hcnkoKTtcbiAgICAgICAgd2hpbGUodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiAodGhpcy5wZWVrKCkudmFsdWUgPT09ICcqJyB8fCB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJy8nKSl7XG4gICAgICAgICAgICBjb25zdCBvcCA9IHRoaXMubmV4dCgpLnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLnBhcnNlVW5hcnkoKTtcbiAgICAgICAgICAgIGxlZnQgPSBhcml0aChvcCwgbGVmdCwgcmlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZWZ0O1xuICAgIH1cbiAgICBwYXJzZVVuYXJ5KCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIGlmICh0ICYmIHQudHlwZSA9PT0gJ29wJyAmJiAodC52YWx1ZSA9PT0gJy0nIHx8IHQudmFsdWUgPT09ICcrJykpIHtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMucGFyc2VVbmFyeSgpO1xuICAgICAgICAgICAgcmV0dXJuIHQudmFsdWUgPT09ICctJyA/IC10b051bSh2KSA6IHRvTnVtKHYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlUG9zdGZpeCgpO1xuICAgIH1cbiAgICBwYXJzZVBvc3RmaXgoKSB7XG4gICAgICAgIGxldCB2ID0gdGhpcy5wYXJzZUF0b20oKTtcbiAgICAgICAgd2hpbGUodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJyUnKXtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgdiA9IHRvTnVtKHYpIC8gMTAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbiAgICBwYXJzZUF0b20oKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLm5leHQoKTtcbiAgICAgICAgaWYgKCF0KSB0aHJvdyBuZXcgRXJyb3IoJ3VuZXhwZWN0ZWQgZW5kIG9mIGZvcm11bGEnKTtcbiAgICAgICAgaWYgKHQudHlwZSA9PT0gJ251bScpIHJldHVybiBOdW1iZXIodC52YWx1ZSk7XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdzdHInKSByZXR1cm4gdC52YWx1ZTtcbiAgICAgICAgaWYgKHQudHlwZSA9PT0gJ2Jvb2wnKSByZXR1cm4gdC52YWx1ZSA9PT0gJ1RSVUUnO1xuICAgICAgICBpZiAodC50eXBlID09PSAnc2hlZXQnKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIGlmICghcmVmIHx8IHJlZi50eXBlICE9PSAncmVmJykgdGhyb3cgbmV3IEVycm9yKCdleHBlY3RlZCBjZWxsIHJlZiBhZnRlciBzaGVldCcpO1xuICAgICAgICAgICAgY29uc3Qgc2hlZXRXcyA9IHRoaXMuZ2V0U2hlZXQodC52YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVJhbmdlT3JWYWx1ZShzaGVldFdzLCByZWYudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdyZWYnKSByZXR1cm4gdGhpcy5wYXJzZVJhbmdlT3JWYWx1ZSh0aGlzLndzLCB0LnZhbHVlKTtcbiAgICAgICAgaWYgKHQudHlwZSA9PT0gJ2lkZW50Jykge1xuICAgICAgICAgICAgaWYgKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgdGhpcy5wZWVrKCkudmFsdWUgPT09ICcoJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxGdW5jdGlvbih0LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBpZGVudGlmaWVyOiAnICsgdC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQudHlwZSA9PT0gJ29wJyAmJiB0LnZhbHVlID09PSAnKCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLnBhcnNlRXhwcigpO1xuICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKScpO1xuICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmV4cGVjdGVkIHRva2VuOiAnICsgdC52YWx1ZSk7XG4gICAgfVxuICAgIHBhcnNlUmFuZ2VPclZhbHVlKHdzLCBhZGRyKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgaWYgKHQgJiYgdC50eXBlID09PSAnb3AnICYmIHQudmFsdWUgPT09ICc6Jykge1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICBjb25zdCBlbmQgPSB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIGlmICghZW5kIHx8IGVuZC50eXBlICE9PSAncmVmJykgdGhyb3cgbmV3IEVycm9yKCdiYWQgcmFuZ2UgZW5kJyk7XG4gICAgICAgICAgICBjb25zdCBjZWxscyA9IHRoaXMucmFuZ2VDZWxscyh3cywgYWRkciwgZW5kLnZhbHVlKTtcbiAgICAgICAgICAgIGNvbnN0IGMxID0gdXRpbHMuZGVjb2RlX2NlbGwoYWRkci5yZXBsYWNlKC9cXCQvZywgJycpKTtcbiAgICAgICAgICAgIGNvbnN0IGMyID0gdXRpbHMuZGVjb2RlX2NlbGwoZW5kLnZhbHVlLnJlcGxhY2UoL1xcJC9nLCAnJykpO1xuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBNYXRoLmFicyhjMi5jIC0gYzEuYykgKyAxO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBfX3JhbmdlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHZhbHVlczogY2VsbHMubWFwKChjKT0+dGhpcy5yZXNvbHZlQ2VsbChjLndzLCBjLmFkZHIsIHRoaXMuZGVwdGgpKSxcbiAgICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5yZXNvbHZlQ2VsbCh3cywgYWRkciwgdGhpcy5kZXB0aCk7XG4gICAgfVxuICAgIGdldFNoZWV0KG5hbWUpIHtcbiAgICAgICAgY29uc3Qgc2hlZXQgPSB0aGlzLndiLlNoZWV0c1tuYW1lXSA/PyB0aGlzLndiLlNoZWV0c1t0aGlzLndiLlNoZWV0TmFtZXMuZmluZCgobik9Pm4udG9Mb3dlckNhc2UoKSA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpKSA/PyAnJ107XG4gICAgICAgIGlmICghc2hlZXQpIHRocm93IG5ldyBFcnJvcignc2hlZXQgbm90IGZvdW5kOiAnICsgbmFtZSk7XG4gICAgICAgIHJldHVybiBzaGVldDtcbiAgICB9XG4gICAgcmFuZ2VDZWxscyh3cywgYSwgYikge1xuICAgICAgICBjb25zdCBjbGVhbkEgPSBhLnJlcGxhY2UoL1xcJC9nLCAnJyk7XG4gICAgICAgIGNvbnN0IGNsZWFuQiA9IGIucmVwbGFjZSgvXFwkL2csICcnKTtcbiAgICAgICAgY29uc3QgY29sT25seSA9IChzKT0+L15bQS1aYS16XSskLy50ZXN0KHMpO1xuICAgICAgICBsZXQgcjEsIHIyLCBjTWluLCBjTWF4O1xuICAgICAgICBpZiAoY29sT25seShjbGVhbkEpIHx8IGNvbE9ubHkoY2xlYW5CKSkge1xuICAgICAgICAgICAgLy8gV2hvbGUtY29sdW1uIHJhbmdlIChBOkEsICRDOiRBRyk6IGJvdW5kIHJvd3MgYnkgdGhlIHNoZWV0J3MgdXNlZCByYW5nZVxuICAgICAgICAgICAgY29uc3QgbWF4Um93ID0gd3NbJyFyZWYnXSA/IHV0aWxzLmRlY29kZV9yYW5nZSh3c1snIXJlZiddKS5lLnIgOiAwO1xuICAgICAgICAgICAgY29uc3QgY29sSW5kZXggPSAocyk9PntcbiAgICAgICAgICAgICAgICBsZXQgYyA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaCBvZiBzLnRvVXBwZXJDYXNlKCkpYyA9IGMgKiAyNiArIChjaC5jaGFyQ29kZUF0KDApIC0gNjQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjIC0gMTsgLy8gMC1iYXNlZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGNBID0gY29sT25seShjbGVhbkEpID8gY29sSW5kZXgoY2xlYW5BKSA6IHV0aWxzLmRlY29kZV9jZWxsKGNsZWFuQSkuYztcbiAgICAgICAgICAgIGNvbnN0IGNCID0gY29sT25seShjbGVhbkIpID8gY29sSW5kZXgoY2xlYW5CKSA6IHV0aWxzLmRlY29kZV9jZWxsKGNsZWFuQikuYztcbiAgICAgICAgICAgIGNNaW4gPSBNYXRoLm1pbihjQSwgY0IpO1xuICAgICAgICAgICAgY01heCA9IE1hdGgubWF4KGNBLCBjQik7XG4gICAgICAgICAgICByMSA9IDA7XG4gICAgICAgICAgICByMiA9IG1heFJvdztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGMxID0gdXRpbHMuZGVjb2RlX2NlbGwoY2xlYW5BKTtcbiAgICAgICAgICAgIGNvbnN0IGMyID0gdXRpbHMuZGVjb2RlX2NlbGwoY2xlYW5CKTtcbiAgICAgICAgICAgIHIxID0gTWF0aC5taW4oYzEuciwgYzIucik7XG4gICAgICAgICAgICByMiA9IE1hdGgubWF4KGMxLnIsIGMyLnIpO1xuICAgICAgICAgICAgY01pbiA9IE1hdGgubWluKGMxLmMsIGMyLmMpO1xuICAgICAgICAgICAgY01heCA9IE1hdGgubWF4KGMxLmMsIGMyLmMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvdW50ID0gKHIyIC0gcjEgKyAxKSAqIChjTWF4IC0gY01pbiArIDEpO1xuICAgICAgICBpZiAoY291bnQgPiBNQVhfUkFOR0VfQ0VMTFMpIHRocm93IG5ldyBFcnJvcigncmFuZ2UgdG9vIGxhcmdlJyk7XG4gICAgICAgIGNvbnN0IG91dCA9IFtdO1xuICAgICAgICBmb3IobGV0IHIgPSByMTsgciA8PSByMjsgcisrKXtcbiAgICAgICAgICAgIGZvcihsZXQgYyA9IGNNaW47IGMgPD0gY01heDsgYysrKXtcbiAgICAgICAgICAgICAgICBvdXQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHdzLFxuICAgICAgICAgICAgICAgICAgICBhZGRyOiB1dGlscy5lbmNvZGVfY2VsbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByLFxuICAgICAgICAgICAgICAgICAgICAgICAgY1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICAgIHJlc29sdmVDZWxsKHdzLCBhZGRyLCBkZXB0aCkge1xuICAgICAgICBpZiAoZGVwdGggPiBNQVhfREVQVEgpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIC8vIEFic29sdXRlIHJlZnMgKCRBJDcgLyAkQTcpIG11c3QgYmUgc3RyaXBwZWQgYmVmb3JlIGtleWluZyBpbnRvIHRoZSBzaGVldFxuICAgICAgICBjb25zdCBjbGVhbiA9IGFkZHIucmVwbGFjZSgvXFwkL2csICcnKTtcbiAgICAgICAgY29uc3QgY2VsbCA9IHdzW2NsZWFuXTtcbiAgICAgICAgLy8gRXhjZWwgY29lcmNlcyByZWZlcmVuY2VzIHRvIGVtcHR5L21pc3NpbmcgY2VsbHMgdG8gMCBpbiBudW1lcmljIGNvbnRleHRzXG4gICAgICAgIC8vIChoYW5kbGVkIGluIHRvTnVtKSBhbmQgdG8gXCJcIiBpbiB0ZXh0IGNvbnRleHRzIChoYW5kbGVkIGluIHRleHQgaGVscGVycykuXG4gICAgICAgIGlmICghY2VsbCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGNlbGwudiAhPT0gdW5kZWZpbmVkICYmIGNlbGwudiAhPT0gbnVsbCkgcmV0dXJuIGNlbGwudjtcbiAgICAgICAgaWYgKHR5cGVvZiBjZWxsLmYgPT09ICdzdHJpbmcnICYmIGNlbGwuZi50cmltKCkgIT09ICcnKSB7XG4gICAgICAgICAgICAvLyBPT1hNTCBzdG9yZXMgZm9ybXVsYXMgV0lUSE9VVCB0aGUgbGVhZGluZyAnPSc7IG5vcm1hbGl6ZSBiZWZvcmUgZXZhbHVhdGluZ1xuICAgICAgICAgICAgY29uc3QgZiA9IGNlbGwuZi50cmltKCkuc3RhcnRzV2l0aCgnPScpID8gY2VsbC5mLnRyaW0oKSA6ICc9JyArIGNlbGwuZi50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBzdWIgPSBldmFsdWF0ZUZvcm11bGEodGhpcy53Yiwgd3MsIGYsIGRlcHRoICsgMSwgY2xlYW4pO1xuICAgICAgICAgICAgLy8gQSByZWZlcmVuY2VkIGNlbGwgd2hvc2UgZm9ybXVsYSBmYWlscyBpcyBhIHJlYWwgZXJyb3IgaW4gRXhjZWwgdG9vIFx1MjAxNFxuICAgICAgICAgICAgLy8gcHJvcGFnYXRlIGl0IChzbyBJRkVSUk9SIGNhbiBjYXRjaCwgYW5kIHRvcC1sZXZlbCBzdGF5cyB1bmV2YWx1YWJsZSlcbiAgICAgICAgICAgIC8vIGluc3RlYWQgb2Ygc2lsZW50bHkgdHJlYXRpbmcgaXQgYXMgYW4gZW1wdHkgY2VsbC5cbiAgICAgICAgICAgIGlmIChzdWIudW5ldmFsdWFibGUpIHRocm93IG5ldyBFcnJvcigncmVmZXJlbmNlZCBjZWxsIGZvcm11bGEgdW5ldmFsdWFibGU6ICcgKyBjbGVhbik7XG4gICAgICAgICAgICByZXR1cm4gc3ViLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8qKlxuICAgKiBTa2lwIHRva2VucyBvZiBhbiBleHByZXNzaW9uIHdpdGhvdXQgZXZhbHVhdGluZyAodXNlZCBmb3IgbGF6eSBJRidzXG4gICAqIHVudGFrZW4gYnJhbmNoKS4gU3RvcHMgYmVmb3JlIHRoZSBuZXh0IHRvcC1sZXZlbCAnLCcgb3IgJyknLlxuICAgKi8gc2tpcEV4cHIoKSB7XG4gICAgICAgIGxldCBkZXB0aCA9IDA7XG4gICAgICAgIHdoaWxlKHRoaXMucG9zIDwgdGhpcy50b2tlbnMubGVuZ3RoKXtcbiAgICAgICAgICAgIGNvbnN0IHQgPSB0aGlzLnRva2Vuc1t0aGlzLnBvc107XG4gICAgICAgICAgICBpZiAodC50eXBlID09PSAnb3AnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHQudmFsdWUgPT09ICcoJykgZGVwdGgrKztcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0LnZhbHVlID09PSAnKScpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlcHRoID09PSAwKSByZXR1cm47IC8vIHN0b3BwZWQgYmVmb3JlICcpJ1xuICAgICAgICAgICAgICAgICAgICBkZXB0aC0tO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodC52YWx1ZSA9PT0gJywnICYmIGRlcHRoID09PSAwKSByZXR1cm47IC8vIHN0b3BwZWQgYmVmb3JlICcsJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wb3MrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYWxsRnVuY3Rpb24obmFtZSkge1xuICAgICAgICAvLyBJRiBpcyBsYXp5IGluIEV4Y2VsOiBvbmx5IHRoZSB0YWtlbiBicmFuY2ggaXMgZXZhbHVhdGVkIChhdm9pZHNcbiAgICAgICAgLy8gZGl2aWRlLWJ5LXplcm8gZXRjLiBvbiB0aGUgdW50YWtlbiBicmFuY2gpLlxuICAgICAgICBpZiAobmFtZSA9PT0gJ0lGJykge1xuICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKCcpO1xuICAgICAgICAgICAgY29uc3QgY29uZCA9IHRoaXMucGFyc2VFeHByKCk7XG4gICAgICAgICAgICB0aGlzLmV4cGVjdE9wKCcsJyk7XG4gICAgICAgICAgICBpZiAodHJ1dGh5KGNvbmQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMucGFyc2VFeHByKCk7XG4gICAgICAgICAgICAgICAgLy8gY29uc3VtZSBvcHRpb25hbCBlbHNlIGJyYW5jaCB3aXRob3V0IGV2YWx1YXRpbmcgaXRcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJywnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNraXBFeHByKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJyknKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvbmQgZmFsc3k6IHNraXAgdGhlIHRoZW4tYnJhbmNoLCBldmFsdWF0ZSB0aGUgZWxzZSBicmFuY2hcbiAgICAgICAgICAgIHRoaXMuc2tpcEV4cHIoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIHRoaXMucGVlaygpLnZhbHVlID09PSAnLCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdGhpcy5wYXJzZUV4cHIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGVjdE9wKCcpJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmV4cGVjdE9wKCcpJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSUZFUlJPUiBldmFsdWF0ZXMgaXRzIGZpcnN0IGFyZ3VtZW50IGluIFwic29mdFwiIG1vZGU6IGFueSBlcnJvci91bmV2YWx1YWJsZVxuICAgICAgICAvLyByZXN1bHQgZmFsbHMgYmFjayB0byB0aGUgc2Vjb25kIGFyZ3VtZW50IGluc3RlYWQgb2YgZmFpbGluZyB0aGUgZm9ybXVsYS5cbiAgICAgICAgaWYgKG5hbWUgPT09ICdJRkVSUk9SJykge1xuICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKCcpO1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRQb3MgPSB0aGlzLnBvcztcbiAgICAgICAgICAgIGxldCBmaXJzdDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZmlyc3QgPSB0aGlzLnBhcnNlRXhwcigpO1xuICAgICAgICAgICAgfSBjYXRjaCAge1xuICAgICAgICAgICAgICAgIGZpcnN0ID0gdW5kZWZpbmVkOyAvLyBldmFsdWF0aW9uIGVycm9yIC0+IHVzZSBmYWxsYmFja1xuICAgICAgICAgICAgICAgIC8vIE9uIGEgbmVzdGVkIGVycm9yIHRoZSBjdXJzb3IgaXMgbGVmdCBtaWQtZXhwcmVzc2lvbjsgc2VlayBmb3J3YXJkXG4gICAgICAgICAgICAgICAgLy8gZnJvbSB0aGUgc3RhcnQgb2YgdGhlIHZhbHVlIGFyZ3VtZW50IHRvIGl0cyB0b3AtbGV2ZWwgJywnICh0aGVcbiAgICAgICAgICAgICAgICAvLyBmYWxsYmFjayBzZXBhcmF0b3IpIG9yIHRvIHRoZSBjbG9zaW5nICcpJyBpZiB0aGVyZSBpcyBubyBmYWxsYmFjay5cbiAgICAgICAgICAgICAgICBsZXQgZGVwdGggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMucG9zID0gc3RhcnRQb3M7XG4gICAgICAgICAgICAgICAgd2hpbGUodGhpcy5wb3MgPCB0aGlzLnRva2Vucy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ID0gdGhpcy50b2tlbnNbdGhpcy5wb3NdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodC50eXBlID09PSAnb3AnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodC52YWx1ZSA9PT0gJygnKSBkZXB0aCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodC52YWx1ZSA9PT0gJyknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gLy8gbm8gZmFsbGJhY2s6IHN0b3AgYXQgSUZFUlJPUidzICcpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHQudmFsdWUgPT09ICcsJyAmJiBkZXB0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zKys7IC8vIGNvbnN1bWUgZmFsbGJhY2sgc2VwYXJhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDb21tYS1zZXBhcmF0ZWQgZmFsbGJhY2sgYXJndW1lbnRcbiAgICAgICAgICAgIGlmICh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIHRoaXMucGVlaygpLnZhbHVlID09PSAnLCcpIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgY29uc3QgZmFsbGJhY2sgPSB0aGlzLnBhcnNlRXhwcigpO1xuICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKScpO1xuICAgICAgICAgICAgcmV0dXJuIGZpcnN0ID09PSB1bmRlZmluZWQgPyBmYWxsYmFjayA6IGZpcnN0O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXhwZWN0T3AoJygnKTtcbiAgICAgICAgY29uc3QgYXJncyA9IFtdO1xuICAgICAgICBpZiAoISh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIHRoaXMucGVlaygpLnZhbHVlID09PSAnKScpKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2godGhpcy5wYXJzZUV4cHIoKSk7XG4gICAgICAgICAgICB3aGlsZSh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIHRoaXMucGVlaygpLnZhbHVlID09PSAnLCcpe1xuICAgICAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh0aGlzLnBhcnNlRXhwcigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV4cGVjdE9wKCcpJyk7XG4gICAgICAgIHJldHVybiBhcHBseUZ1bmN0aW9uKG5hbWUsIGFyZ3MsIHRoaXMuY3VycmVudENlbGxBZGRyKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjb21wYXJlKG9wLCBhLCBiKSB7XG4gICAgaWYgKHR5cGVvZiBhID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgc3dpdGNoKG9wKXtcbiAgICAgICAgICAgIGNhc2UgJz0nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhID09PSBiO1xuICAgICAgICAgICAgY2FzZSAnPD4nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhICE9PSBiO1xuICAgICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPCBiO1xuICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPiBiO1xuICAgICAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhIDw9IGI7XG4gICAgICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPj0gYjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB4ID0gdG9OdW0oYSksIHkgPSB0b051bShiKTtcbiAgICBzd2l0Y2gob3Ape1xuICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgIHJldHVybiB4ID09PSB5O1xuICAgICAgICBjYXNlICc8Pic6XG4gICAgICAgICAgICByZXR1cm4geCAhPT0geTtcbiAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICByZXR1cm4geCA8IHk7XG4gICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgcmV0dXJuIHggPiB5O1xuICAgICAgICBjYXNlICc8PSc6XG4gICAgICAgICAgICByZXR1cm4geCA8PSB5O1xuICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgICByZXR1cm4geCA+PSB5O1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBjb21wYXJpc29uJyk7XG59XG5mdW5jdGlvbiBhcml0aChvcCwgYSwgYikge1xuICAgIGNvbnN0IHggPSB0b051bShhKSwgeSA9IHRvTnVtKGIpO1xuICAgIHN3aXRjaChvcCl7XG4gICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgcmV0dXJuIHggKyB5O1xuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgIHJldHVybiB4IC0geTtcbiAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICByZXR1cm4geCAqIHk7XG4gICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICh5ID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ2RpdmlkZSBieSB6ZXJvJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHggLyB5O1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdeJzpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnBvdyh4LCB5KTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgb3BlcmF0b3InKTtcbn1cbmZ1bmN0aW9uIGZsYXR0ZW4oYXJncykge1xuICAgIGNvbnN0IG91dCA9IFtdO1xuICAgIGZvciAoY29uc3QgYSBvZiBhcmdzKXtcbiAgICAgICAgaWYgKGlzUmFuZ2UoYSkpIG91dC5wdXNoKC4uLmEudmFsdWVzKTtcbiAgICAgICAgZWxzZSBvdXQucHVzaChhKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cbmZ1bmN0aW9uIG51bWJlcnMoYXJncykge1xuICAgIGNvbnN0IG91dCA9IFtdO1xuICAgIGZvciAoY29uc3QgdiBvZiBmbGF0dGVuKGFyZ3MpKXtcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykgb3V0LnB1c2godik7XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIG91dC5wdXNoKHYgPyAxIDogMCk7XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJyAmJiB2LnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBOdW1iZXIodi50cmltKCkpO1xuICAgICAgICAgICAgaWYgKGlzRmluaXRlKG4pKSBvdXQucHVzaChuKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufVxuZnVuY3Rpb24gdG9OdW1TYWZlKHYpIHtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInKSByZXR1cm4gdjtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdzdHJpbmcnICYmIHYudHJpbSgpICE9PSAnJykge1xuICAgICAgICBjb25zdCBuID0gTnVtYmVyKHYudHJpbSgpKTtcbiAgICAgICAgcmV0dXJuIGlzRmluaXRlKG4pID8gbiA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbi8qKiBDb2xsYXBzZSB3aGl0ZXNwYWNlICsgdHJpbSAoRXhjZWwgVFJJTSkuICovIGZ1bmN0aW9uIGV4Y2VsVHJpbSh2KSB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gU3RyaW5nKHYgPz8gJycpLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCk7XG59XG4vKiogRXhjZWwgUFJPUEVSOiB1cHBlcmNhc2UgZmlyc3QgbGV0dGVyIG9mIGV2ZXJ5IHdvcmQsIGxvd2VyY2FzZSB0aGUgcmVzdC4gKi8gZnVuY3Rpb24gZXhjZWxQcm9wZXIodikge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCkgcmV0dXJuIFwiXCI7IC8vIEV4Y2VsOiBlbXB0eSBjZWxsIGluIHRleHQgY29udGV4dFxuICAgIHJldHVybiBTdHJpbmcodiA/PyAnJykudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8oXnxbXkEtWmEtejAtOV0pKFthLXpdKS9nLCAoXywgcCwgYyk9PnAgKyBjLnRvVXBwZXJDYXNlKCkpO1xufVxuLyoqIEV4Y2VsIHNlcmlhbCBkYXRlIC0+IHsgeSwgbSwgZCB9IGluIHRoZSAxOTAwIGRhdGUgc3lzdGVtIChpbmNsLiBmYWtlIDE5MDAtMDItMjkpLiAqLyBmdW5jdGlvbiBzZXJpYWxUb0RhdGUoc2VyaWFsKSB7XG4gICAgLy8gU2VyaWFsIDEgPSAxOTAwLTAxLTAxOyBzZXJpYWwgNjAgPSBmYWtlIDE5MDAtMDItMjk7IHNlcmlhbCA+PSA2MSBvZmZzZXQgYnkgb25lIGRheS5cbiAgICBjb25zdCBkYXlzID0gTWF0aC5mbG9vcihzZXJpYWwpICsgKHNlcmlhbCA+PSA2MCA/IC0xIDogMCk7XG4gICAgLy8gRXhjZWwgc2VyaWFsIDEgPSAxOTAwLTAxLTAxID0gYmFzZSArIDEgZGF5OyBzZXJpYWwgPj0gNjEgbG9zZXMgdGhlIGZha2VcbiAgICAvLyAxOTAwLTAyLTI5IChzZXJpYWwgNjApLCBzbyByZWFsIGVsYXBzZWQgZGF5cyA9IHNlcmlhbCAtIDEuXG4gICAgY29uc3QgbXMgPSBkYXlzICogODY0MDAwMDA7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKDE4OTksIDExLCAzMSkgKyBtcyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeTogZGF0ZS5nZXRVVENGdWxsWWVhcigpLFxuICAgICAgICBtOiBkYXRlLmdldFVUQ01vbnRoKCkgKyAxLFxuICAgICAgICBkOiBkYXRlLmdldFVUQ0RhdGUoKVxuICAgIH07XG59XG4vKiogQnVpbGQgYW4gRXhjZWwgc2VyaWFsIGRhdGUgZnJvbSB5L20vZCAoMTkwMCBzeXN0ZW0sIGluY2wuIGZha2UgMTkwMC0wMi0yOSkuICovIGZ1bmN0aW9uIGRhdGVUb1NlcmlhbCh5LCBtLCBkKSB7XG4gICAgY29uc3QgZHQgPSBuZXcgRGF0ZShEYXRlLlVUQyh5LCBtIC0gMSwgZCkpO1xuICAgIGNvbnN0IHNlcmlhbCA9IE1hdGguZmxvb3IoKGR0LmdldFRpbWUoKSAtIERhdGUuVVRDKDE4OTksIDExLCAzMSkpIC8gODY0MDAwMDApO1xuICAgIHJldHVybiBzZXJpYWwgPj0gNjAgPyBzZXJpYWwgKyAxIDogc2VyaWFsOyAvLyBvZmZzZXQgZm9yIHRoZSBmYWtlIDE5MDAtMDItMjlcbn1cbi8qKiBNaW5pbWFsIEV4Y2VsIFRFWFQgZm9ybWF0czogbnVtZXJpYyAoMCwgMC4wMCwgIywjIzAsICMsIyMwLjAwLCAwJSwgMC4wJSkgYW5kIGRhdGUgdG9rZW5zICh5eXl5IHl5IG1tbW0gbW1tIG1tIG0gZGRkZCBkZGQgZGQgZCBoaCBoIG1tIG0gc3MgcykuIFRocm93cyBvbiB1bnJlY29nbml6ZWQgZm9ybWF0cy4gKi8gZnVuY3Rpb24gZXhjZWxUZXh0Rm9ybWF0KHYsIGZvcm1hdCkge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgY29uc3QgZm10ID0gU3RyaW5nKGZvcm1hdCk7XG4gICAgY29uc3QgbnVtID0gdHlwZW9mIHYgPT09ICdudW1iZXInID8gdiA6IE51bWJlcihTdHJpbmcodiA/PyAnJykudHJpbSgpKTtcbiAgICBjb25zdCBpc0RhdGVMaWtlID0gL1t5WWREaEhtTXNTXS8udGVzdChmbXQucmVwbGFjZSgvW15hLXpBLVpdL2csICcnKSkgJiYgL3l8ZHxofHMvaS50ZXN0KGZtdCk7XG4gICAgaWYgKGlzRGF0ZUxpa2UgJiYgaXNGaW5pdGUobnVtKSkge1xuICAgICAgICBjb25zdCB7IHksIG0sIGQgfSA9IHNlcmlhbFRvRGF0ZShudW0pO1xuICAgICAgICBjb25zdCBob3VycyA9IE1hdGguZmxvb3IobnVtICUgMSAqIDI0KTtcbiAgICAgICAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IoKG51bSAlIDEgKiAyNCAtIGhvdXJzKSAqIDYwKTtcbiAgICAgICAgY29uc3Qgc2Vjb25kcyA9IE1hdGgucm91bmQoKChudW0gJSAxICogMjQgLSBob3VycykgKiA2MCAtIG1pbnV0ZXMpICogNjApO1xuICAgICAgICBjb25zdCBkYXlOYW1lcyA9IFtcbiAgICAgICAgICAgICdTdW5kYXknLFxuICAgICAgICAgICAgJ01vbmRheScsXG4gICAgICAgICAgICAnVHVlc2RheScsXG4gICAgICAgICAgICAnV2VkbmVzZGF5JyxcbiAgICAgICAgICAgICdUaHVyc2RheScsXG4gICAgICAgICAgICAnRnJpZGF5JyxcbiAgICAgICAgICAgICdTYXR1cmRheSdcbiAgICAgICAgXTtcbiAgICAgICAgY29uc3QgbW9udGhOYW1lcyA9IFtcbiAgICAgICAgICAgICdKYW51YXJ5JyxcbiAgICAgICAgICAgICdGZWJydWFyeScsXG4gICAgICAgICAgICAnTWFyY2gnLFxuICAgICAgICAgICAgJ0FwcmlsJyxcbiAgICAgICAgICAgICdNYXknLFxuICAgICAgICAgICAgJ0p1bmUnLFxuICAgICAgICAgICAgJ0p1bHknLFxuICAgICAgICAgICAgJ0F1Z3VzdCcsXG4gICAgICAgICAgICAnU2VwdGVtYmVyJyxcbiAgICAgICAgICAgICdPY3RvYmVyJyxcbiAgICAgICAgICAgICdOb3ZlbWJlcicsXG4gICAgICAgICAgICAnRGVjZW1iZXInXG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IHdkID0gbmV3IERhdGUoRGF0ZS5VVEMoeSwgbSAtIDEsIGQpKS5nZXRVVENEYXkoKTtcbiAgICAgICAgY29uc3QgcmVwID0ge1xuICAgICAgICAgICAgJ3l5eXknOiBTdHJpbmcoeSksXG4gICAgICAgICAgICAneXknOiBTdHJpbmcoeSkuc2xpY2UoLTIpLFxuICAgICAgICAgICAgJ21tbW0nOiBtb250aE5hbWVzW20gLSAxXSxcbiAgICAgICAgICAgICdtbW0nOiBtb250aE5hbWVzW20gLSAxXS5zbGljZSgwLCAzKSxcbiAgICAgICAgICAgICdtb24nOiBTdHJpbmcobSkucGFkU3RhcnQoMiwgJzAnKSxcbiAgICAgICAgICAgICdtb24xJzogU3RyaW5nKG0pLFxuICAgICAgICAgICAgJ2RkZGQnOiBkYXlOYW1lc1t3ZF0sXG4gICAgICAgICAgICAnZGRkJzogZGF5TmFtZXNbd2RdLnNsaWNlKDAsIDMpLFxuICAgICAgICAgICAgJ2RkJzogU3RyaW5nKGQpLnBhZFN0YXJ0KDIsICcwJyksXG4gICAgICAgICAgICAnZCc6IFN0cmluZyhkKSxcbiAgICAgICAgICAgICdoaCc6IFN0cmluZyhob3VycykucGFkU3RhcnQoMiwgJzAnKSxcbiAgICAgICAgICAgICdoJzogU3RyaW5nKGhvdXJzKSxcbiAgICAgICAgICAgICdtaW4nOiBTdHJpbmcobWludXRlcykucGFkU3RhcnQoMiwgJzAnKSxcbiAgICAgICAgICAgICdtaW4xJzogU3RyaW5nKG1pbnV0ZXMpLFxuICAgICAgICAgICAgJ3NzJzogU3RyaW5nKHNlY29uZHMpLnBhZFN0YXJ0KDIsICcwJyksXG4gICAgICAgICAgICAncyc6IFN0cmluZyhzZWNvbmRzKVxuICAgICAgICB9O1xuICAgICAgICAvLyBUb2tlbi1iYXNlZCByZXBsYWNlLCBsb25nZXN0IG1hdGNoZXMgZmlyc3QuIEV4Y2VsIHJ1bGU6ICdtbScvJ20nIGFyZVxuICAgICAgICAvLyBNSU5VVEVTIHdoZW4gdGhlIGZvcm1hdCBjb250YWlucyBhbiBob3VyIHRva2VuLCBvdGhlcndpc2UgTU9OVEguXG4gICAgICAgIGNvbnN0IGhhc0hvdXIgPSAvaC9pLnRlc3QoZm10KTtcbiAgICAgICAgcmV0dXJuIGZtdC5yZXBsYWNlKC95eXl5fHl5fG1tbW18bW1tfGRkZGR8ZGRkfGhofHNzfGRkfG1tfGR8bXxofHMvZ2ksICh0b2spPT57XG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0b2sudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdtbScpIHJldHVybiBoYXNIb3VyID8gcmVwWydtaW4nXSA6IHJlcFsnbW9uJ107XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnbScpIHJldHVybiBoYXNIb3VyID8gcmVwWydtaW4xJ10gOiByZXBbJ21vbjEnXTtcbiAgICAgICAgICAgIHJldHVybiByZXBba2V5XSA/PyB0b2s7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIWlzRmluaXRlKG51bSkpIHJldHVybiBTdHJpbmcodiA/PyAnJyk7XG4gICAgY29uc3QgcGN0ID0gZm10LmluY2x1ZGVzKCclJyk7XG4gICAgY29uc3QgZGVjaW1hbHMgPSAoZm10Lm1hdGNoKC8wK1xcLigwKykvKSA/PyBbXSlbMV0/Lmxlbmd0aCA/PyAwO1xuICAgIGNvbnN0IGdyb3VwaW5nID0gZm10LmluY2x1ZGVzKCcsJyk7XG4gICAgY29uc3QgdmFsdWUgPSBwY3QgPyBudW0gKiAxMDAgOiBudW07XG4gICAgbGV0IG91dCA9IHZhbHVlLnRvRml4ZWQoZGVjaW1hbHMpO1xuICAgIGlmIChncm91cGluZykge1xuICAgICAgICBjb25zdCBbaW50LCBkZWNdID0gb3V0LnNwbGl0KCcuJyk7XG4gICAgICAgIG91dCA9IGludC5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnLCcpICsgKGRlYyA/ICcuJyArIGRlYyA6ICcnKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dCArIChwY3QgPyAnJScgOiAnJyk7XG59XG4vKiogRXhjZWwgbWF0Y2ggZm9yIFZMT09LVVAvTUFUQ0g6IGV4YWN0ICgwKSBvciBhcHByb3hpbWF0ZSAoMS8tMSkuIFJldHVybnMgMS1iYXNlZCBpbmRleCBvciAtMS4gKi8gZnVuY3Rpb24gZmluZE1hdGNoKGxvb2t1cCwgYXJyLCB0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT09IDApIHtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBjb25zdCBhID0gYXJyW2ldO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBsb29rdXAgPT09ICdudW1iZXInICYmIHR5cGVvZiBhID09PSAnbnVtYmVyJyAmJiBsb29rdXAgPT09IGEpIHJldHVybiBpICsgMTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbG9va3VwID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYSA9PT0gJ3N0cmluZycgJiYgZXhjZWxUcmltKGxvb2t1cCkudG9Mb3dlckNhc2UoKSA9PT0gZXhjZWxUcmltKGEpLnRvTG93ZXJDYXNlKCkpIHJldHVybiBpICsgMTtcbiAgICAgICAgICAgIGlmIChTdHJpbmcobG9va3VwKS50b0xvd2VyQ2FzZSgpID09PSBTdHJpbmcoYSA/PyAnJykudG9Mb3dlckNhc2UoKSkgcmV0dXJuIGkgKyAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgLy8gQXBwcm94aW1hdGU6IGFzc3VtZSBhc2NlbmRpbmcgKHR5cGUgMSkgLT4gbGFyZ2VzdCA8PSBsb29rdXA7IGRlc2NlbmRpbmcgKC0xKSAtPiBzbWFsbGVzdCA+PSBsb29rdXBcbiAgICBsZXQgYmVzdCA9IC0xO1xuICAgIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgY29uc3QgYSA9IHRvTnVtU2FmZShhcnJbaV0pO1xuICAgICAgICAgICAgY29uc3QgbCA9IHRvTnVtU2FmZShsb29rdXApO1xuICAgICAgICAgICAgaWYgKGEgIT09IHVuZGVmaW5lZCAmJiBsICE9PSB1bmRlZmluZWQgJiYgYSA8PSBsKSBiZXN0ID0gaSArIDE7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IC0xKSB7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgY29uc3QgYSA9IHRvTnVtU2FmZShhcnJbaV0pO1xuICAgICAgICAgICAgY29uc3QgbCA9IHRvTnVtU2FmZShsb29rdXApO1xuICAgICAgICAgICAgaWYgKGEgIT09IHVuZGVmaW5lZCAmJiBsICE9PSB1bmRlZmluZWQgJiYgYSA+PSBsICYmIChiZXN0ID09PSAtMSB8fCBhIDw9IHRvTnVtU2FmZShhcnJbYmVzdCAtIDFdKSkpIGJlc3QgPSBpICsgMTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmVzdDtcbn1cbi8qKiBFeGNlbCBTVU1JRiBjcml0ZXJpYTogbnVtYmVyLCBwbGFpbiB0ZXh0ICh3aWxkY2FyZHMgKiA/IHN1cHBvcnRlZCksIG9yIG9wZXJhdG9yLXByZWZpeGVkIChcIjw1XCIsIFwiPj0xMDBcIiwgXCI8PjBcIikuICovIGZ1bmN0aW9uIGNyaXRlcmlhTWF0Y2hlcyh2YWx1ZSwgY3JpdGVyaWEpIHtcbiAgICBjb25zdCB2ID0gdmFsdWUgPz8gJyc7XG4gICAgaWYgKHR5cGVvZiBjcml0ZXJpYSA9PT0gJ251bWJlcicpIHJldHVybiB0eXBlb2YgdiA9PT0gJ251bWJlcicgPyB2ID09PSBjcml0ZXJpYSA6IE51bWJlcihTdHJpbmcodikpID09PSBjcml0ZXJpYTtcbiAgICBjb25zdCBjcml0ID0gZXhjZWxUcmltKGNyaXRlcmlhKTtcbiAgICBpZiAoY3JpdCA9PT0gJycpIHJldHVybiB2ID09PSAnJyB8fCB2ID09PSBudWxsIHx8IHYgPT09IHVuZGVmaW5lZDtcbiAgICBjb25zdCBtID0gY3JpdC5tYXRjaCgvXig8PXw+PXw8Pnw8fD58PSk/KC4qKSQvcyk7XG4gICAgY29uc3Qgb3AgPSBtPy5bMV0gPz8gJz0nO1xuICAgIGxldCB0YXJnZXQgPSBtPy5bMl0gPz8gJyc7XG4gICAgY29uc3QgbnVtZXJpY1RhcmdldCA9IHRvTnVtU2FmZSh0YXJnZXQpO1xuICAgIGNvbnN0IG51bWVyaWNWYWwgPSB0b051bVNhZmUodik7XG4gICAgaWYgKG9wICE9PSAnPScgJiYgbnVtZXJpY1RhcmdldCAhPT0gdW5kZWZpbmVkICYmIG51bWVyaWNWYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzd2l0Y2gob3Ape1xuICAgICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bWVyaWNWYWwgPCBudW1lcmljVGFyZ2V0O1xuICAgICAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgICAgICAgIHJldHVybiBudW1lcmljVmFsIDw9IG51bWVyaWNUYXJnZXQ7XG4gICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtZXJpY1ZhbCA+IG51bWVyaWNUYXJnZXQ7XG4gICAgICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bWVyaWNWYWwgPj0gbnVtZXJpY1RhcmdldDtcbiAgICAgICAgICAgIGNhc2UgJzw+JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtZXJpY1ZhbCAhPT0gbnVtZXJpY1RhcmdldDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBXaWxkY2FyZCBtYXRjaGluZyBmb3IgZXF1YWxpdHkgKEV4Y2VsICogYW5kID8pXG4gICAgaWYgKHRhcmdldC5pbmNsdWRlcygnKicpIHx8IHRhcmdldC5pbmNsdWRlcygnPycpKSB7XG4gICAgICAgIGNvbnN0IHJ4ID0gJ14nICsgdGFyZ2V0LnJlcGxhY2UoL1suK14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpLnJlcGxhY2UoL1xcKi9nLCAnLionKS5yZXBsYWNlKC9cXD8vZywgJy4nKSArICckJztcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAocngsICdpJykudGVzdChTdHJpbmcodiA/PyAnJykpO1xuICAgIH1cbiAgICBjb25zdCBzMSA9IFN0cmluZyh2ID8/ICcnKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICBjb25zdCBzMiA9IHRhcmdldC50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAob3AgPT09ICc8PicpIHJldHVybiBzMSAhPT0gczI7XG4gICAgcmV0dXJuIHMxID09PSBzMjtcbn1cbmZ1bmN0aW9uIGFwcGx5RnVuY3Rpb24obmFtZSwgYXJncywgdGhpc0NlbGxBZGRyKSB7XG4gICAgY29uc3QgbnVtcyA9IG51bWJlcnMoYXJncyk7XG4gICAgY29uc3Qgc3VtID0gKCk9Pm51bXMucmVkdWNlKChzLCB2KT0+cyArIHYsIDApO1xuICAgIHN3aXRjaChuYW1lKXtcbiAgICAgICAgY2FzZSAnU1VNJzpcbiAgICAgICAgICAgIHJldHVybiBzdW0oKTtcbiAgICAgICAgY2FzZSAnQVZFUkFHRSc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1zLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdBVkVSQUdFIG9mIGVtcHR5Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1bSgpIC8gbnVtcy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ01JTic6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1zLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdNSU4gb2YgZW1wdHknKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5taW4oLi4ubnVtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ01BWCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1zLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdNQVggb2YgZW1wdHknKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5tYXgoLi4ubnVtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0NPVU5UJzpcbiAgICAgICAgICAgIHJldHVybiBudW1zLmxlbmd0aDtcbiAgICAgICAgY2FzZSAnQ09VTlRBJzpcbiAgICAgICAgICAgIHJldHVybiBmbGF0dGVuKGFyZ3MpLmZpbHRlcigodik9PnYgIT09ICcnICYmIHYgIT09IHVuZGVmaW5lZCAmJiB2ICE9PSBudWxsKS5sZW5ndGg7XG4gICAgICAgIGNhc2UgJ1BST0RVQ1QnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICghbnVtcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignUFJPRFVDVCBvZiBlbXB0eScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBudW1zLnJlZHVjZSgocCwgdik9PnAgKiB2LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnQUJTJzpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyh0b051bShhcmdzWzBdKSk7XG4gICAgICAgIGNhc2UgJ0lOVCc6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC50cnVuYyh0b051bShhcmdzWzBdKSk7XG4gICAgICAgIGNhc2UgJ1NRUlQnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB0b051bShhcmdzWzBdKTtcbiAgICAgICAgICAgICAgICBpZiAodiA8IDApIHRocm93IG5ldyBFcnJvcignU1FSVCBvZiBuZWdhdGl2ZScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodik7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1JPVU5EJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdG9OdW0oYXJnc1swXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGFyZ3MubGVuZ3RoID4gMSA/IHRvTnVtKGFyZ3NbMV0pIDogMDtcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gTWF0aC5wb3coMTAsIGQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHYgKiBmKSAvIGY7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1JPVU5EVVAnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB0b051bShhcmdzWzBdKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gYXJncy5sZW5ndGggPiAxID8gdG9OdW0oYXJnc1sxXSkgOiAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IGYgPSBNYXRoLnBvdygxMCwgZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc2lnbih2KSAqIE1hdGguY2VpbChNYXRoLmFicyh2KSAqIGYpIC8gZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnUk9VTkRET1dOJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdG9OdW0oYXJnc1swXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGFyZ3MubGVuZ3RoID4gMSA/IHRvTnVtKGFyZ3NbMV0pIDogMDtcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gTWF0aC5wb3coMTAsIGQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnNpZ24odikgKiBNYXRoLmZsb29yKE1hdGguYWJzKHYpICogZikgLyBmO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdNT0QnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGEgPSB0b051bShhcmdzWzBdKSwgYiA9IHRvTnVtKGFyZ3NbMV0pO1xuICAgICAgICAgICAgICAgIGlmIChiID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ01PRCBieSB6ZXJvJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgLSBiICogTWF0aC5mbG9vcihhIC8gYik7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1BPV0VSJzpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnBvdyh0b051bShhcmdzWzBdKSwgdG9OdW0oYXJnc1sxXSkpO1xuICAgICAgICBjYXNlICdJRic6XG4gICAgICAgICAgICByZXR1cm4gdHJ1dGh5KGFyZ3NbMF0pID8gYXJnc1sxXSA6IGFyZ3NbMl07XG4gICAgICAgIGNhc2UgJ1NVQlRPVEFMJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBDb2RlIGlzIGFyZyAwIFx1MjAxNCBtdXN0IE5PVCBiZSBpbmNsdWRlZCBpbiB0aGUgc3VtIChFeGNlbCBTVUJUT1RBTCg5LHJuZykgPT0gU1VNKHJuZykpXG4gICAgICAgICAgICAgICAgY29uc3QgY29kZSA9IE1hdGguYWJzKHRvTnVtKGFyZ3NbMF0pKTtcbiAgICAgICAgICAgICAgICBpZiAoY29kZSA9PT0gOSB8fCBjb2RlID09PSAxMDkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmFuZ2VOdW1zID0gbnVtYmVycyhhcmdzLnNsaWNlKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhbmdlTnVtcy5yZWR1Y2UoKHMsIHYpPT5zICsgdiwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU1VCVE9UQUwgY29kZSAnICsgY29kZSArICcgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdBTkQnOlxuICAgICAgICAgICAgcmV0dXJuIGZsYXR0ZW4oYXJncykuZXZlcnkoKGEpPT50cnV0aHkoYSkpO1xuICAgICAgICBjYXNlICdPUic6XG4gICAgICAgICAgICByZXR1cm4gZmxhdHRlbihhcmdzKS5zb21lKChhKT0+dHJ1dGh5KGEpKTtcbiAgICAgICAgY2FzZSAnVFJJTSc6XG4gICAgICAgICAgICByZXR1cm4gZXhjZWxUcmltKGFyZ3NbMF0pO1xuICAgICAgICBjYXNlICdQUk9QRVInOlxuICAgICAgICAgICAgcmV0dXJuIGV4Y2VsUHJvcGVyKGFyZ3NbMF0pO1xuICAgICAgICBjYXNlICdDSE9PU0UnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IE1hdGguZmxvb3IodG9OdW0oYXJnc1swXSkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBmbGF0dGVuKGFyZ3Muc2xpY2UoMSkpO1xuICAgICAgICAgICAgICAgIGlmIChpZHggPCAxIHx8IGlkeCA+IGNhbmRpZGF0ZXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0NIT09TRSBpbmRleCBvdXQgb2YgcmFuZ2UnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlc1tpZHggLSAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnREFURSc6XG4gICAgICAgICAgICByZXR1cm4gZGF0ZVRvU2VyaWFsKE1hdGguZmxvb3IodG9OdW0oYXJnc1swXSkpLCBNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMV0pKSwgTWF0aC5mbG9vcih0b051bShhcmdzWzJdKSkpO1xuICAgICAgICBjYXNlICdXRUVLREFZJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZXJpYWwgPSB0b051bShhcmdzWzBdKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gYXJncy5sZW5ndGggPiAxID8gTWF0aC5mbG9vcih0b051bShhcmdzWzFdKSkgOiAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgeSwgbSwgZCB9ID0gc2VyaWFsVG9EYXRlKHNlcmlhbCk7XG4gICAgICAgICAgICAgICAgY29uc3QganNEYXkgPSBuZXcgRGF0ZShEYXRlLlVUQyh5LCBtIC0gMSwgZCkpLmdldFVUQ0RheSgpOyAvLyAwPVN1bmRheVxuICAgICAgICAgICAgICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGpzRGF5ICsgMTsgLy8gMT1TdW5kYXkgLi4gNz1TYXR1cmRheVxuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ganNEYXkgPT09IDAgPyA3IDoganNEYXk7IC8vIDE9TW9uZGF5IC4uIDc9U3VuZGF5XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBqc0RheTsgLy8gMD1Nb25kYXkgLi4gNj1TdW5kYXlcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignV0VFS0RBWSByZXR1cm5fdHlwZSAnICsgdHlwZSArICcgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnQ09MVU1OJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWYgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIGlmIChyZWYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXNDZWxsQWRkcikgdGhyb3cgbmV3IEVycm9yKCdDT0xVTU4gd2l0aG91dCByZWYgbmVlZHMgY2VsbCBjb250ZXh0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlY29kZWQgPSB1dGlscy5kZWNvZGVfY2VsbCh0aGlzQ2VsbEFkZHIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2RlZC5jICsgMTsgLy8gMS1iYXNlZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlZiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbSA9IHJlZi5tYXRjaCgvW0EtWmEtel17MSwzfS8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW0pIHRocm93IG5ldyBFcnJvcignYmFkIENPTFVNTiByZWYnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sU3RyID0gbVswXS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29sID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaCBvZiBjb2xTdHIpY29sID0gY29sICogMjYgKyAoY2guY2hhckNvZGVBdCgwKSAtIDY0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDT0xVTU4gb2YgcmFuZ2Ugbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdTVU1JRic6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmFuZ2VBcmcgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyaXRlcmlhID0gYXJnc1sxXTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdW1BcmcgPSBhcmdzWzJdID8/IHJhbmdlQXJnO1xuICAgICAgICAgICAgICAgIGlmICghaXNSYW5nZShyYW5nZUFyZykgfHwgIWlzUmFuZ2Uoc3VtQXJnKSkgdGhyb3cgbmV3IEVycm9yKCdTVU1JRiBuZWVkcyByYW5nZXMnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSByYW5nZUFyZy52YWx1ZXM7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VtcyA9IHN1bUFyZy52YWx1ZXM7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3V0ID0gW107XG4gICAgICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjcml0ZXJpYU1hdGNoZXModmFsdWVzW2ldLCBjcml0ZXJpYSkpIG91dC5wdXNoKHRvTnVtU2FmZShzdW1zW2ldID8/IDApID8/IDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gb3V0LnJlZHVjZSgocywgdik9PnMgKyB2LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnVkxPT0tVUCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9va3VwID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICBjb25zdCB0YWJsZSA9IGFyZ3NbMV07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sSWR4ID0gTWF0aC5mbG9vcih0b051bShhcmdzWzJdKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYXBwcm94ID0gYXJncy5sZW5ndGggPiAzID8gdHJ1dGh5KGFyZ3NbM10pIDogdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzUmFuZ2UodGFibGUpIHx8IGNvbElkeCA8IDEgfHwgY29sSWR4ID4gdGFibGUud2lkdGgpIHRocm93IG5ldyBFcnJvcignVkxPT0tVUCBiYWQgdGFibGUvY29sJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RDb2wgPSBbXTtcbiAgICAgICAgICAgICAgICBjb25zdCByb3dzID0gW107XG4gICAgICAgICAgICAgICAgZm9yKGxldCByID0gMDsgciA8IE1hdGguZmxvb3IodGFibGUudmFsdWVzLmxlbmd0aCAvIHRhYmxlLndpZHRoKTsgcisrKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gdGFibGUudmFsdWVzLnNsaWNlKHIgKiB0YWJsZS53aWR0aCwgKHIgKyAxKSAqIHRhYmxlLndpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKHJvdyk7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0Q29sLnB1c2gocm93WzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgaGl0ID0gYXBwcm94ID8gZmluZE1hdGNoKGxvb2t1cCwgZmlyc3RDb2wsIDEpIDogZmluZE1hdGNoKGxvb2t1cCwgZmlyc3RDb2wsIDApO1xuICAgICAgICAgICAgICAgIGlmIChoaXQgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ1ZMT09LVVAgbm8gbWF0Y2gnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWwgPSByb3dzW2hpdCAtIDFdW2NvbElkeCAtIDFdO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgPT09IHVuZGVmaW5lZCA/ICcnIDogdmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdNQVRDSCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9va3VwID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICBjb25zdCBhcnIgPSBhcmdzWzFdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBhcmdzLmxlbmd0aCA+IDIgPyBNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMl0pKSA6IDE7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1JhbmdlKGFycikpIHRocm93IG5ldyBFcnJvcignTUFUQ0ggbmVlZHMgYSByYW5nZScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGhpdCA9IGZpbmRNYXRjaChsb29rdXAsIGFyci52YWx1ZXMsIHR5cGUpO1xuICAgICAgICAgICAgICAgIGlmIChoaXQgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ01BVENIIG5vIG1hdGNoJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhpdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnSU5ERVgnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyciA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93SWR4ID0gTWF0aC5mbG9vcih0b051bShhcmdzWzFdKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1JhbmdlKGFycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvd0lkeCA9PT0gMSA/IGFyciA6ICgoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJTkRFWCBvdXQgb2YgcmFuZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xJZHggPSBNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMl0pKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zID0gKHJvd0lkeCAtIDEpICogYXJyLndpZHRoICsgKGNvbElkeCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocG9zIDwgMCB8fCBwb3MgPj0gYXJyLnZhbHVlcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignSU5ERVggb3V0IG9mIHJhbmdlJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnIudmFsdWVzW3Bvc10gPz8gMDsgLy8gRXhjZWwgY29lcmNlcyBlbXB0eSBjZWxscyB0byAwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IHJvd0lkeCAtIDE7XG4gICAgICAgICAgICAgICAgaWYgKHBvcyA8IDAgfHwgcG9zID49IGFyci52YWx1ZXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0lOREVYIG91dCBvZiByYW5nZScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhcnIudmFsdWVzW3Bvc10gPz8gMDsgLy8gRXhjZWwgY29lcmNlcyBlbXB0eSBjZWxscyB0byAwXG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1RFWFQnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZtdCA9IFN0cmluZyhhcmdzWzFdID8/ICcnKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNSYW5nZShhcmdzWzBdKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBcnJheSBjb250ZXh0OiBhcHBseSBURVhUIGVsZW1lbnQtd2lzZSAoZS5nLiBidWlsZGluZyBhIGxvb2t1cCBhcnJheVxuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgTUFUQ0ggYWdhaW5zdCBhIGZvcm1hdHRlZCBoZWFkZXIgcm93KS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9fcmFuZ2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGFyZ3NbMF0udmFsdWVzLm1hcCgodik9PmV4Y2VsVGV4dEZvcm1hdCh2LCBmbXQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBhcmdzWzBdLndpZHRoXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBleGNlbFRleHRGb3JtYXQoYXJnc1swXSwgZm10KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgZnVuY3Rpb246ICcgKyBuYW1lKTtcbiAgICB9XG59XG4vKipcbiAqIFJlZ2V4IGZhbGxiYWNrIGZvciBmb3JtdWxhcyB0aGUgdG9rZW5pemVyIGNhbm5vdCBwYXJzZSAoZXhvdGljIGNoYXJzKS5cbiAqIEhhbmRsZXM6IEExLCAkQSQxLCBBMTpCNSwgQTpBLCBTaGVldCFENywgJ1NoZWV0IDEnIUQ3LlxuICovIGZ1bmN0aW9uIHJlZ2V4UmVmcyhzcmMpIHtcbiAgICBjb25zdCBvdXQgPSBbXTtcbiAgICBjb25zdCByZSA9IC8oPzooPzonKFteJ10rKSd8KFtBLVphLXpfXVtBLVphLXowLTlfLl0qKSkhPyk/XFwkPyhbQS1aYS16XXsxLDN9KShcXCQ/KShcXGQqKSg/OjpcXCQ/KFtBLVphLXpdezEsM30pKFxcJD8pKFxcZCopKT8vZztcbiAgICBsZXQgbTtcbiAgICB3aGlsZSgobSA9IHJlLmV4ZWMoc3JjKSkgIT09IG51bGwpe1xuICAgICAgICBjb25zdCBbLCBzaGVldCwgc2hlZXQyLCBjb2wsICwgZGlnaXRzLCBlbmRDb2wsICwgZW5kRGlnaXRzXSA9IG07XG4gICAgICAgIGNvbnN0IG5leHRDaCA9IHNyY1ttLmluZGV4ICsgbVswXS5sZW5ndGhdO1xuICAgICAgICAvLyBDb2x1bW4tb25seSB0b2tlbiAobm8gZGlnaXRzKTogb25seSBtZWFuaW5nZnVsIGFzIGEgcmFuZ2UgcGFydCAoQTpBKS5cbiAgICAgICAgLy8gQWxzbyBza2lwcyBpZGVudGlmaWVycyBsaWtlIFwiU1VNSUZTKFwiIChtYXRjaGVkIGFzIFwiU1VNXCIgKyBcIklGUyhcIikuXG4gICAgICAgIGlmIChkaWdpdHMgPT09ICcnKSB7XG4gICAgICAgICAgICBpZiAobmV4dENoICE9PSAnOicpIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKG5leHRDaCA9PT0gJygnKSB7XG4gICAgICAgICAgICBjb250aW51ZTsgLy8gZnVuY3Rpb24gbmFtZSBlbmRpbmcgaW4gZGlnaXRzIChMT0cxMCgsIExPRzIoLCAuLi4pXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYWRkciA9IGAke2NvbH0ke2RpZ2l0c31gO1xuICAgICAgICBpZiAoZW5kQ29sICYmIGVuZERpZ2l0cyAhPT0gJycpIG91dC5wdXNoKHtcbiAgICAgICAgICAgIHNoZWV0OiBzaGVldCA/PyBzaGVldDIsXG4gICAgICAgICAgICBhZGRyLFxuICAgICAgICAgICAgZW5kOiBgJHtlbmRDb2x9JHtlbmREaWdpdHN9YFxuICAgICAgICB9KTtcbiAgICAgICAgZWxzZSBpZiAoZW5kQ29sKSBvdXQucHVzaCh7XG4gICAgICAgICAgICBzaGVldDogc2hlZXQgPz8gc2hlZXQyLFxuICAgICAgICAgICAgYWRkcixcbiAgICAgICAgICAgIGVuZDogYCR7ZW5kQ29sfWBcbiAgICAgICAgfSk7XG4gICAgICAgIGVsc2Ugb3V0LnB1c2goe1xuICAgICAgICAgICAgc2hlZXQ6IHNoZWV0ID8/IHNoZWV0MixcbiAgICAgICAgICAgIGFkZHJcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENvbGxlY3QgZXZlcnkgY2VsbC9yYW5nZSByZWZlcmVuY2UgZnJvbSBhIGZvcm11bGEgc3RyaW5nLlxuICpcbiAqIFwiPVNVTShWNDY6VjU0KVwiICAgICAtPiBbeyBhZGRyOiBcIlY0NlwiLCBlbmQ6IFwiVjU0XCIgfV1cbiAqIFwiPVBMIUQ3ICsgUEwhRDhcIiAgICAtPiBbeyBzaGVldDogXCJQTFwiLCBhZGRyOiBcIkQ3XCIgfSwgeyBzaGVldDogXCJQTFwiLCBhZGRyOiBcIkQ4XCIgfV1cbiAqIFwiPVY0NioyXCIgICAgICAgICAgICAtPiBbeyBhZGRyOiBcIlY0NlwiIH1dXG4gKlxuICogVXNlcyB0aGUgc2FtZSB0b2tlbml6ZXIgYXMgZXZhbHVhdGVGb3JtdWxhIHNvIHJlZmVyZW5jZSBkZXRlY3Rpb24gc3RheXNcbiAqIGNvbnNpc3RlbnQgd2l0aCBldmFsdWF0aW9uOyBmYWxscyBiYWNrIHRvIGEgcmVnZXggcGFzcyB3aGVuIHRoZSB0b2tlbml6ZXJcbiAqIHJlamVjdHMgdGhlIHN0cmluZyAodW5ldmFsdWFibGUgZm9ybXVsYXMgc3RpbGwgZ2V0IHRoZWlyIHJlZnMgbWFwcGVkKS5cbiAqLyBleHBvcnQgZnVuY3Rpb24gY29sbGVjdFJlZmVyZW5jZXMoc3JjKSB7XG4gICAgY29uc3QgdGV4dCA9IHNyYy5yZXBsYWNlKC9ePS8sICcnKS50cmltKCk7XG4gICAgaWYgKCF0ZXh0KSByZXR1cm4gW107XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdG9rZW5zID0gdG9rZW5pemUodGV4dCk7XG4gICAgICAgIGNvbnN0IHJlZnMgPSBbXTtcbiAgICAgICAgbGV0IHBlbmRpbmdTaGVldDtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICB3aGlsZShpIDwgdG9rZW5zLmxlbmd0aCl7XG4gICAgICAgICAgICBjb25zdCB0ID0gdG9rZW5zW2ldO1xuICAgICAgICAgICAgaWYgKHQudHlwZSA9PT0gJ3NoZWV0Jykge1xuICAgICAgICAgICAgICAgIHBlbmRpbmdTaGVldCA9IHQudmFsdWU7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHQudHlwZSA9PT0gJ3JlZicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhZGRyID0gdC52YWx1ZS5yZXBsYWNlKC9cXCQvZywgJycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG54dCA9IHRva2Vuc1tpICsgMV07XG4gICAgICAgICAgICAgICAgLy8gRnVuY3Rpb24tbmFtZSBmYWxzZSBwb3NpdGl2ZXMgKExPRzEwKCwgTE9HMigpIGFyZSB0b2tlbml6ZWQgYXMgcmVmcylcbiAgICAgICAgICAgICAgICBpZiAobnh0ICYmIG54dC50eXBlID09PSAnb3AnICYmIG54dC52YWx1ZSA9PT0gJygnKSB7XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ1NoZWV0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG54dCAmJiBueHQudHlwZSA9PT0gJ29wJyAmJiBueHQudmFsdWUgPT09ICc6Jykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmRUb2sgPSB0b2tlbnNbaSArIDJdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW5kVG9rICYmIGVuZFRvay50eXBlID09PSAncmVmJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGVldDogcGVuZGluZ1NoZWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZHIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kOiBlbmRUb2sudmFsdWUucmVwbGFjZSgvXFwkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nU2hlZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWZzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBzaGVldDogcGVuZGluZ1NoZWV0LFxuICAgICAgICAgICAgICAgICAgICBhZGRyXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHBlbmRpbmdTaGVldCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVmcztcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIHJldHVybiByZWdleFJlZnModGV4dCk7XG4gICAgfVxufVxuLyoqXG4gKiBFdmFsdWF0ZSBhbiBFeGNlbCBmb3JtdWxhIHN0cmluZyBhZ2FpbnN0IHRoZSB3b3JrYm9vay5cbiAqIFJldHVybnMgeyB2YWx1ZSB9IGZvciBmb3JtdWxhcyB3ZSBjYW4gY29tcHV0ZSwgeyB1bmV2YWx1YWJsZTogdHJ1ZSB9IG90aGVyd2lzZS5cbiAqLyBleHBvcnQgZnVuY3Rpb24gZXZhbHVhdGVGb3JtdWxhKHdiLCB3cywgZm9ybXVsYSwgZGVwdGggPSAwLCBjdXJyZW50Q2VsbEFkZHIpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzcmMgPSBmb3JtdWxhLnRyaW0oKTtcbiAgICAgICAgaWYgKCFzcmMuc3RhcnRzV2l0aCgnPScpKSByZXR1cm4ge1xuICAgICAgICAgICAgdW5ldmFsdWFibGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcih3Yiwgd3MsIHNyYy5zbGljZSgxKSwgZGVwdGgsIGN1cnJlbnRDZWxsQWRkcik7XG4gICAgICAgIGNvbnN0IHYgPSBwYXJzZXIucGFyc2VFeHByKCk7XG4gICAgICAgIGlmICghcGFyc2VyLmZpbmlzaGVkKCkpIHJldHVybiB7XG4gICAgICAgICAgICB1bmV2YWx1YWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICAvLyBFeGNlbDogYSB0b3AtbGV2ZWwgcmVmZXJlbmNlIHRvIGFuIGVtcHR5L21pc3NpbmcgY2VsbCBldmFsdWF0ZXMgdG8gMC5cbiAgICAgICAgLy8gKFJlYWwgZmFpbHVyZXMgXHUyMDE0IHVuc3VwcG9ydGVkL2Vycm9yaW5nIHJlZmVyZW5jZWQgZm9ybXVsYXMgXHUyMDE0IHRocm93IGluXG4gICAgICAgIC8vIHJlc29sdmVDZWxsIGFuZCBhcmUgY2F1Z2h0IGFib3ZlLCBzbyB0aGV5IHN0aWxsIHJldHVybiB1bmV2YWx1YWJsZS4pXG4gICAgICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCkgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgdW5ldmFsdWFibGU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicgJiYgIWlzRmluaXRlKHYpKSByZXR1cm4ge1xuICAgICAgICAgICAgdW5ldmFsdWFibGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQm9vbGVhbnMgLT4gMS8wIGZvciBudW1lcmljIEV4Y2VsIGNlbGxzXG4gICAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHYgPyAxIDogMCxcbiAgICAgICAgICAgIHVuZXZhbHVhYmxlOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHYsXG4gICAgICAgICAgICB1bmV2YWx1YWJsZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB1bmV2YWx1YWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgIH1cbn1cbiIsICIvKipcbiAqIFdvcmtib29rIFx1MjE5MiBEQi1zaGVldCBtYXBwaW5nIGhlbHBlcnMuXG4gKlxuICogVGhlIHNoZWV0IHZpZXdlciBzZXJ2ZXMgd29ya2Jvb2sgZGF0YSBhcyBKU09OIHJvd3Mga2V5ZWQgYnkgY29sdW1uIGhlYWRlclxuICogKGRlZHVwbGljYXRlZCwgZS5nLiBcIlRvdGFsXCIsIFwiVG90YWxfMlwiKSwgd2l0aCBhbiBhdXRvbWF0aWNhbGx5IGRldGVjdGVkXG4gKiBoZWFkZXIgcm93LiBUaGVzZSBoZWxwZXJzIGFyZSB0aGUgc2luZ2xlIHNvdXJjZSBvZiB0cnV0aCBmb3IgdGhhdCBtYXBwaW5nIFx1MjAxNFxuICogdGhlIHNoZWV0LWRhdGEgQVBJIHJvdXRlLCB0aGUgZm9ybXVsYS1yZWZlcmVuY2UgbWFwcGVyLCBhbmQgdGhlIGltcG9ydC10aW1lXG4gKiBmb3JtdWxhIGV4dHJhY3Rpb24gYWxsIHVzZSB0aGVtIHNvIGEgZm9ybXVsYSBjZWxsIHJlZmVyZW5jZSAoXCJWNDZcIikgbWFwcyB0b1xuICogdGhlIGV4YWN0IHNhbWUgKGNvbHVtbiBrZXksIGRhdGEtcm93IG9mZnNldCkgdGhlIGFwcGxpY2F0aW9uIGRpc3BsYXlzLlxuICovIGltcG9ydCB7IHV0aWxzIH0gZnJvbSAneGxzeCc7XG4vLyBIZWFkZXIgcm93IGRldGVjdGlvbiAobWlycm9ycyB0aGUgbG9naWMgaGlzdG9yaWNhbGx5IGR1cGxpY2F0ZWQgaW4gdGhlXG4vLyBzaGVldC1kYXRhIHJvdXRlIGFuZCB3b3JrYm9vay1hbmFseXplci50cykuXG5jb25zdCBIRUFERVJfS0VZV09SRFMgPSAvZGVzY3JpcHRpb258YW1vdW50fHRvdGFsfGRhdGV8cmV2ZW51ZXxhY2NvdW50fG5hbWV8cXR5fHByaWNlfGNvc3R8c2FsZXN8aW5jb21lfGV4cGVuc2V8YmFsYW5jZXxudW1iZXJ8cmVmfHBlcmlvZHx0cmFuc2FjdGlvbnxkZWJpdHxjcmVkaXR8dW5pdHxyYXRlfHBjdHxtYXJnaW58YmlsbHN8Y292ZXJzfGd1ZXN0c3xzdGFmZnxjb2RlfHR5cGV8Y2F0ZWdvcnl8aXRlbXxwcm9kdWN0fHNlcnZpY2V8Y2hhcmdlfGRpc2NvdW50fHRheHxzdWJ0b3RhbHxuZXR8Z3Jvc3MvaTtcbmNvbnN0IFRJVExFX0tFWVdPUkRTID0gL14ocHJvZml0XFxzKiY/XFxzKmxvc3N8YmFsYW5jZVxccypzaGVldHx0cmlhbFxccypiYWxhbmNlfGdlbmVyYWxcXHMqbGVkZ2VyfHBlcmlvZGV8cGVyaW9kfG1vbnRoXFxzKm9mfGlucHV0XFxzKmRhdGF8YXV0b1xccypjYWxjKS9pO1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRIZWFkZXJSb3cod3MpIHtcbiAgICBjb25zdCByb3dzID0gdXRpbHMuc2hlZXRfdG9fanNvbih3cywge1xuICAgICAgICBoZWFkZXI6IDFcbiAgICB9KTtcbiAgICBjb25zdCBtYXhTY2FuID0gTWF0aC5taW4ocm93cy5sZW5ndGgsIDIwKTtcbiAgICBsZXQgYmVzdFJvdyA9IDA7XG4gICAgbGV0IGJlc3RTY29yZSA9IDA7XG4gICAgbGV0IGJlc3RIZWFkZXJzID0gW107XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IG1heFNjYW47IGkrKyl7XG4gICAgICAgIGNvbnN0IHJvdyA9IHJvd3NbaV0gPz8gW107XG4gICAgICAgIGNvbnN0IG5vbkVtcHR5ID0gcm93LmZpbHRlcigoYyk9PmMgIT09ICcnICYmIGMgIT09IHVuZGVmaW5lZCAmJiBjICE9PSBudWxsKTtcbiAgICAgICAgY29uc3Qgbm9uRW1wdHlDb3VudCA9IG5vbkVtcHR5Lmxlbmd0aDtcbiAgICAgICAgaWYgKG5vbkVtcHR5Q291bnQgPT09IDApIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmaXJzdENlbGwgPSBTdHJpbmcocm93WzBdID8/ICcnKS50cmltKCk7XG4gICAgICAgIGlmIChub25FbXB0eUNvdW50IDw9IDIgJiYgVElUTEVfS0VZV09SRFMudGVzdChmaXJzdENlbGwpKSBjb250aW51ZTtcbiAgICAgICAgbGV0IGhlYWRlckxpa2VDb3VudCA9IDA7XG4gICAgICAgIGxldCBudW1lcmljQ291bnQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2Ygbm9uRW1wdHkpe1xuICAgICAgICAgICAgY29uc3Qgc3RyID0gU3RyaW5nKGNlbGwpO1xuICAgICAgICAgICAgaWYgKHN0ciA9PT0gJyNOL0EnIHx8IHN0ciA9PT0gJyNSRUYhJyB8fCBzdHIgPT09ICcjVkFMVUUhJykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIoY2VsbCk7XG4gICAgICAgICAgICBjb25zdCBpc051bWVyaWMgPSB0eXBlb2YgY2VsbCA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGNlbGwgPT09ICdzdHJpbmcnICYmIC9eW1xcZCwuXFwtXSskLy50ZXN0KHN0ci50cmltKCkpICYmIGlzRmluaXRlKG51bSk7XG4gICAgICAgICAgICBpZiAoaXNOdW1lcmljICYmIE1hdGguYWJzKG51bSkgPiAwKSBudW1lcmljQ291bnQrKztcbiAgICAgICAgICAgIGVsc2UgaWYgKEhFQURFUl9LRVlXT1JEUy50ZXN0KHN0cikpIGhlYWRlckxpa2VDb3VudCsrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRleHRSYXRpbyA9IG5vbkVtcHR5Q291bnQgPiAwID8gKG5vbkVtcHR5Q291bnQgLSBudW1lcmljQ291bnQpIC8gbm9uRW1wdHlDb3VudCA6IDA7XG4gICAgICAgIGNvbnN0IHNjb3JlID0gaGVhZGVyTGlrZUNvdW50ICogMyArIHRleHRSYXRpbyAqIDIgKyAobm9uRW1wdHlDb3VudCA+PSAzID8gMSA6IDApO1xuICAgICAgICBpZiAoc2NvcmUgPiBiZXN0U2NvcmUpIHtcbiAgICAgICAgICAgIGJlc3RTY29yZSA9IHNjb3JlO1xuICAgICAgICAgICAgYmVzdFJvdyA9IGk7XG4gICAgICAgICAgICBiZXN0SGVhZGVycyA9IHJvdy5tYXAoKGMpPT5TdHJpbmcoYyA/PyAnJykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChiZXN0U2NvcmUgPCAyICYmIHJvd3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBmaXJzdFJvdyA9IChyb3dzWzBdID8/IFtdKS5tYXAoKGMpPT5TdHJpbmcoYyA/PyAnJykpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaGVhZGVyUm93OiAxLFxuICAgICAgICAgICAgaGVhZGVyczogZmlyc3RSb3dcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaGVhZGVyUm93OiBiZXN0Um93ICsgMSxcbiAgICAgICAgaGVhZGVyczogYmVzdEhlYWRlcnNcbiAgICB9O1xufVxuLyoqXG4gKiBCdWlsZCB0aGUgZGVkdXBsaWNhdGVkIERCIGNvbHVtbiBrZXlzIGZvciBhIGhlYWRlciByb3cgKFwiVG90YWxcIiwgXCJUb3RhbF8yXCIsXG4gKiBlbXB0eSBoZWFkZXJzIGJlY29tZSBcIl9faGlkZGVuXzxuPlwiKSBcdTIwMTQgaWRlbnRpY2FsIHRvIHRoZSBzaGVldC1kYXRhIEdFVC5cbiAqLyBleHBvcnQgZnVuY3Rpb24gYnVpbGRDb2x1bW5LZXlzKGhlYWRlcnMpIHtcbiAgICBjb25zdCBzZWVuID0gbmV3IE1hcCgpO1xuICAgIGxldCBlbXB0eUNvbElkeCA9IDA7XG4gICAgcmV0dXJuIGhlYWRlcnMubWFwKChoKT0+e1xuICAgICAgICBjb25zdCB0cmltbWVkID0gKGggfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpO1xuICAgICAgICBpZiAoIXRyaW1tZWQpIHJldHVybiBgX19oaWRkZW5fJHtlbXB0eUNvbElkeCsrfWA7XG4gICAgICAgIGNvbnN0IGNvdW50ID0gc2Vlbi5nZXQodHJpbW1lZCkgPz8gMDtcbiAgICAgICAgc2Vlbi5zZXQodHJpbW1lZCwgY291bnQgKyAxKTtcbiAgICAgICAgcmV0dXJuIGNvdW50ID4gMCA/IGAke3RyaW1tZWR9XyR7Y291bnR9YCA6IHRyaW1tZWQ7XG4gICAgfSk7XG59XG4vKipcbiAqIE1hcCBhbiBFeGNlbCBjZWxsIGFkZHJlc3MgdG8gdGhlIERCLXNoZWV0IGNvb3JkaW5hdGVzLlxuICpcbiAqIEBwYXJhbSB3cyAgICAgICAgICB0aGUgd29ya3NoZWV0IHRoZSBhZGRyZXNzIGJlbG9uZ3MgdG9cbiAqIEBwYXJhbSBhZGRyICAgICAgICBBMS1zdHlsZSBhZGRyZXNzIChcIlY0NlwiLCBcIiRBJDFcIilcbiAqIEBwYXJhbSBoZWFkZXJJbmZvICBwcmVjb21wdXRlZCBmaW5kSGVhZGVyUm93KHdzKSByZXN1bHQgKHJlY29tcHV0ZWQgcGVyIGNhbGxcbiAqICAgICAgICAgICAgICAgICAgICBpZiBvbWl0dGVkIFx1MjAxNCBwYXNzIGl0IHdoZW4gbWFwcGluZyBtYW55IGNlbGxzKVxuICovIGV4cG9ydCBmdW5jdGlvbiBtYXBDZWxsVG9EYXRhKHdzLCBhZGRyLCBoZWFkZXJJbmZvKSB7XG4gICAgY29uc3QgY2xlYW4gPSBhZGRyLnJlcGxhY2UoL1xcJC9nLCAnJyk7XG4gICAgY29uc3QgZGVjb2RlZCA9IHV0aWxzLmRlY29kZV9jZWxsKGNsZWFuKTtcbiAgICBjb25zdCBpbmZvID0gaGVhZGVySW5mbyA/PyBmaW5kSGVhZGVyUm93KHdzKTtcbiAgICAvLyBGaXJzdCBkYXRhIHJvdyA9IGhlYWRlclJvdyArIDEgXHUyMTkyIDEtYmFzZWQgZGF0YSBvZmZzZXQ7IHJvd3MgYXQvYWJvdmUgdGhlXG4gICAgLy8gaGVhZGVyICh0aXRsZSByb3dzKSBnZXQgcmVsUm93IDw9IDAgLyB1bmRlZmluZWQgKHRoZXkgYXJlIG5vdCBkYXRhKS5cbiAgICBjb25zdCByZWxSb3cgPSBkZWNvZGVkLnIgLSBpbmZvLmhlYWRlclJvdyArIDE7XG4gICAgY29uc3QgY29sdW1uS2V5cyA9IGJ1aWxkQ29sdW1uS2V5cyhpbmZvLmhlYWRlcnMpO1xuICAgIGNvbnN0IHJhd0hlYWRlciA9IGluZm8uaGVhZGVyc1tkZWNvZGVkLmNdID8/ICcnO1xuICAgIGNvbnN0IGNvbEtleSA9IHJhd0hlYWRlci50cmltKCkgPyBjb2x1bW5LZXlzW2RlY29kZWQuY10gOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29sS2V5LFxuICAgICAgICByZWxSb3c6IHJlbFJvdyA+PSAxID8gcmVsUm93IDogdW5kZWZpbmVkLFxuICAgICAgICBhYnNSb3c6IGRlY29kZWQuciArIDEsXG4gICAgICAgIGFic0NvbDogZGVjb2RlZC5jICsgMVxuICAgIH07XG59XG4iLCAiLyoqXG4gKiBTZXJkZSBjb21wbGlhbmNlIGNoZWNrZXIgZm9yIHdvcmtmbG93IGN1c3RvbSBjbGFzcyBzZXJpYWxpemF0aW9uLlxuICpcbiAqIEFuYWx5emVzIHNvdXJjZSBjb2RlIHRvIGRldGVybWluZSBpZiBjbGFzc2VzIHdpdGggV09SS0ZMT1dfU0VSSUFMSVpFIC9cbiAqIFdPUktGTE9XX0RFU0VSSUFMSVpFIGFyZSBjb3JyZWN0bHkgc2V0IHVwIGZvciB0aGUgd29ya2Zsb3cgc2FuZGJveC5cbiAqXG4gKiBVc2VkIGJ5OlxuICogLSBDTEkgYHZhbGlkYXRlYCBjb21tYW5kXG4gKiAtIENMSSBgdHJhbnNmb3JtYCBjb21tYW5kICgtLWNoZWNrLXNlcmRlKVxuICogLSBTV0MgcGxheWdyb3VuZCBzZXJkZSBhbmFseXNpcyBwYW5lbFxuICogLSBCdWlsZC10aW1lIHdhcm5pbmdzIGluIEJhc2VCdWlsZGVyXG4gKi9cblxuaW1wb3J0IGJ1aWx0aW5Nb2R1bGVzIGZyb20gJ2J1aWx0aW4tbW9kdWxlcyc7XG5pbXBvcnQgdHlwZSB7IFdvcmtmbG93TWFuaWZlc3QgfSBmcm9tICcuL2FwcGx5LXN3Yy10cmFuc2Zvcm0uanMnO1xuXG4vLyBCdWlsZCBhIHJlZ2V4IHRoYXQgbWF0Y2hlcyBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBpbXBvcnRzIGluIHRyYW5zZm9ybWVkIGNvZGUuXG4vLyBIYW5kbGVzIGJvdGggRVNNIChgZnJvbSAnZnMnYCwgYGZyb20gJ25vZGU6ZnMnYCkgYW5kIENKUyAoYHJlcXVpcmUoJ2ZzJylgKVxuY29uc3Qgbm9kZUJ1aWx0aW5zID0gYnVpbHRpbk1vZHVsZXMuam9pbignfCcpO1xuXG4vLyBSZWdleCB0byBleHRyYWN0IHNwZWNpZmljIG1vZHVsZSBuYW1lcyBmcm9tIGltcG9ydC9yZXF1aXJlIHN0YXRlbWVudHNcbmNvbnN0IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXggPSBuZXcgUmVnRXhwKFxuICBgKD86ZnJvbVxcXFxzK1snXCJdKD86bm9kZTopPygoPzoke25vZGVCdWlsdGluc30pKD86L1teJ1wiXSopPylbJ1wiXWAgK1xuICAgIGB8cmVxdWlyZVxcXFxzKlxcXFwoXFxcXHMqWydcIl0oPzpub2RlOik/KCg/OiR7bm9kZUJ1aWx0aW5zfSkoPzovW14nXCJdKik/KVsnXCJdXFxcXHMqXFxcXCkpYCxcbiAgJ2cnXG4pO1xuXG4vLyBSZWdleCB0byBkZXRlY3QgY2xhc3MgcmVnaXN0cmF0aW9uIElJRkVzIGdlbmVyYXRlZCBieSB0aGUgU1dDIHBsdWdpblxuY29uc3QgcmVnaXN0cmF0aW9uSWlmZVJlZ2V4ID1cbiAgL1N5bWJvbFxcLmZvclxccypcXChcXHMqW1wiJ113b3JrZmxvdy1jbGFzcy1yZWdpc3RyeVtcIiddXFxzKlxcKS87XG5cbi8qKlxuICogUmVzdWx0IG9mIGNoZWNraW5nIGEgc2luZ2xlIGNsYXNzIGZvciBzZXJkZSBjb21wbGlhbmNlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlcmRlQ2xhc3NDaGVja1Jlc3VsdCB7XG4gIC8qKiBUaGUgY2xhc3MgbmFtZSBhcyBkZXRlY3RlZCBpbiB0aGUgc291cmNlICovXG4gIGNsYXNzTmFtZTogc3RyaW5nO1xuICAvKiogVGhlIGNsYXNzSWQgYXNzaWduZWQgYnkgdGhlIFNXQyBwbHVnaW4gKGZyb20gdGhlIG1hbmlmZXN0KSAqL1xuICBjbGFzc0lkOiBzdHJpbmc7XG4gIC8qKiBXaGV0aGVyIHRoZSBTV0MgcGx1Z2luIGRldGVjdGVkIHNlcmRlIHN5bWJvbHMgb24gdGhpcyBjbGFzcyAqL1xuICBkZXRlY3RlZDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgYSByZWdpc3RyYXRpb24gSUlGRSB3YXMgZ2VuZXJhdGVkIGluIHRoZSBvdXRwdXQgKi9cbiAgcmVnaXN0ZXJlZDogYm9vbGVhbjtcbiAgLyoqXG4gICAqIE5vZGUuanMgYnVpbHQtaW4gbW9kdWxlIGltcG9ydHMgcmVtYWluaW5nIGluIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dC5cbiAgICogSWYgbm9uLWVtcHR5LCB0aGUgY2xhc3MgaXMgTk9UIHdvcmtmbG93LXNhbmRib3ggY29tcGxpYW50LlxuICAgKi9cbiAgbm9kZUltcG9ydHM6IHN0cmluZ1tdO1xuICAvKiogV2hldGhlciB0aGUgY2xhc3MgcGFzc2VzIGFsbCBjb21wbGlhbmNlIGNoZWNrcyAqL1xuICBjb21wbGlhbnQ6IGJvb2xlYW47XG4gIC8qKiBIdW1hbi1yZWFkYWJsZSBkZXNjcmlwdGlvbnMgb2YgYW55IGlzc3VlcyBmb3VuZCAqL1xuICBpc3N1ZXM6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIEZ1bGwgcmVzdWx0IG9mIHNlcmRlIGNvbXBsaWFuY2UgYW5hbHlzaXMgZm9yIGEgc291cmNlIGZpbGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VyZGVDaGVja1Jlc3VsdCB7XG4gIC8qKiBQZXItY2xhc3MgYW5hbHlzaXMgcmVzdWx0cyAqL1xuICBjbGFzc2VzOiBTZXJkZUNsYXNzQ2hlY2tSZXN1bHRbXTtcbiAgLyoqIEFsbCBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHMgZm91bmQgaW4gdGhlIHdvcmtmbG93LW1vZGUgb3V0cHV0ICovXG4gIGdsb2JhbE5vZGVJbXBvcnRzOiBzdHJpbmdbXTtcbiAgLyoqIFdoZXRoZXIgdGhlIHdvcmtmbG93LW1vZGUgb3V0cHV0IGNvbnRhaW5zIGFueSBzZXJkZS1yZWxhdGVkIGNsYXNzZXMgKi9cbiAgaGFzU2VyZGVDbGFzc2VzOiBib29sZWFuO1xuICAvKiogVGhlIHJhdyB3b3JrZmxvdyBtYW5pZmVzdCBleHRyYWN0ZWQgZnJvbSB0aGUgU1dDIHRyYW5zZm9ybSAqL1xuICBtYW5pZmVzdDogV29ya2Zsb3dNYW5pZmVzdDtcbn1cblxuLyoqXG4gKiBMaWdodHdlaWdodCBzZXJkZSBjb21wbGlhbmNlIGNoZWNrZXIgdGhhdCB3b3JrcyB3aXRoIHByZS1jb21wdXRlZFxuICogU1dDIHRyYW5zZm9ybSByZXN1bHRzLiBUaGlzIGF2b2lkcyByZS1ydW5uaW5nIHRoZSBTV0MgdHJhbnNmb3JtXG4gKiB3aGVuIHRoZSBjYWxsZXIgYWxyZWFkeSBoYXMgdGhlIG91dHB1dHMgKGUuZy4sIHRoZSBwbGF5Z3JvdW5kIG9yIGJ1aWxkZXIpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5hbHl6ZVNlcmRlQ29tcGxpYW5jZShvcHRpb25zOiB7XG4gIC8qKiBTb3VyY2UgY29kZSAodXNlZCBmb3IgcGF0dGVybiBkZXRlY3Rpb24pICovXG4gIHNvdXJjZUNvZGU6IHN0cmluZztcbiAgLyoqIFdvcmtmbG93LW1vZGUgdHJhbnNmb3JtZWQgb3V0cHV0ICovXG4gIHdvcmtmbG93Q29kZTogc3RyaW5nO1xuICAvKiogTWFuaWZlc3QgZXh0cmFjdGVkIGZyb20gdGhlIFNXQyB0cmFuc2Zvcm0gKi9cbiAgbWFuaWZlc3Q6IFdvcmtmbG93TWFuaWZlc3Q7XG59KTogU2VyZGVDaGVja1Jlc3VsdCB7XG4gIGNvbnN0IHsgc291cmNlQ29kZSwgd29ya2Zsb3dDb2RlLCBtYW5pZmVzdCB9ID0gb3B0aW9ucztcblxuICAvLyAxLiBFeHRyYWN0IGFsbCBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHMgZnJvbSB0aGUgd29ya2Zsb3cgb3V0cHV0XG4gIGNvbnN0IGdsb2JhbE5vZGVJbXBvcnRzID0gZXh0cmFjdE5vZGVJbXBvcnRzKHdvcmtmbG93Q29kZSk7XG5cbiAgLy8gMi4gQ2hlY2sgaWYgdGhlIG1hbmlmZXN0IGNvbnRhaW5zIGFueSBzZXJkZS1yZWdpc3RlcmVkIGNsYXNzZXNcbiAgY29uc3QgY2xhc3NFbnRyaWVzID0gZXh0cmFjdENsYXNzRW50cmllcyhtYW5pZmVzdCk7XG4gIGNvbnN0IGhhc1NlcmRlQ2xhc3NlcyA9IGNsYXNzRW50cmllcy5sZW5ndGggPiAwO1xuXG4gIC8vIDMuIENoZWNrIGlmIHRoZSB3b3JrZmxvdyBvdXRwdXQgY29udGFpbnMgcmVnaXN0cmF0aW9uIElJRkVzXG4gIGNvbnN0IGhhc1JlZ2lzdHJhdGlvbiA9IHJlZ2lzdHJhdGlvbklpZmVSZWdleC50ZXN0KHdvcmtmbG93Q29kZSk7XG5cbiAgLy8gNC4gQW5hbHl6ZSBlYWNoIGNsYXNzXG4gIGNvbnN0IGNsYXNzZXM6IFNlcmRlQ2xhc3NDaGVja1Jlc3VsdFtdID0gY2xhc3NFbnRyaWVzLm1hcCgoZW50cnkpID0+IHtcbiAgICBjb25zdCBpc3N1ZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyBDaGVjayBmb3IgTm9kZS5qcyBpbXBvcnRzICh0aGVzZSB3aWxsIGZhaWwgaW4gdGhlIHdvcmtmbG93IHNhbmRib3gpXG4gICAgaWYgKGdsb2JhbE5vZGVJbXBvcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlzc3Vlcy5wdXNoKFxuICAgICAgICBgV29ya2Zsb3cgYnVuZGxlIGNvbnRhaW5zIE5vZGUuanMgYnVpbHQtaW4gaW1wb3J0czogJHtnbG9iYWxOb2RlSW1wb3J0cy5qb2luKCcsICcpfS4gYCArXG4gICAgICAgICAgYFRoZXNlIHdpbGwgZmFpbCBhdCBydW50aW1lIGluIHRoZSB3b3JrZmxvdyBzYW5kYm94LiBgICtcbiAgICAgICAgICBgQWRkIFwidXNlIHN0ZXBcIiB0byBtZXRob2RzIHRoYXQgZGVwZW5kIG9uIE5vZGUuanMgQVBJcyBzbyB0aGV5IGFyZSBzdHJpcHBlZCBmcm9tIHRoZSB3b3JrZmxvdyBidW5kbGUuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgcmVnaXN0cmF0aW9uXG4gICAgaWYgKCFoYXNSZWdpc3RyYXRpb24pIHtcbiAgICAgIGlzc3Vlcy5wdXNoKFxuICAgICAgICBgTm8gY2xhc3MgcmVnaXN0cmF0aW9uIElJRkUgd2FzIGdlbmVyYXRlZC4gYCArXG4gICAgICAgICAgYEVuc3VyZSBXT1JLRkxPV19TRVJJQUxJWkUgYW5kIFdPUktGTE9XX0RFU0VSSUFMSVpFIGFyZSBkZWZpbmVkIGFzIHN0YXRpYyBtZXRob2RzIGAgK1xuICAgICAgICAgIGBpbnNpZGUgdGhlIGNsYXNzIGJvZHkgdXNpbmcgY29tcHV0ZWQgcHJvcGVydHkgc3ludGF4OiBzdGF0aWMgW1dPUktGTE9XX1NFUklBTElaRV0oLi4uKSB7IC4uLiB9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2xhc3NOYW1lOiBlbnRyeS5jbGFzc05hbWUsXG4gICAgICBjbGFzc0lkOiBlbnRyeS5jbGFzc0lkLFxuICAgICAgZGV0ZWN0ZWQ6IHRydWUsXG4gICAgICByZWdpc3RlcmVkOiBoYXNSZWdpc3RyYXRpb24sXG4gICAgICBub2RlSW1wb3J0czogZ2xvYmFsTm9kZUltcG9ydHMsXG4gICAgICBjb21wbGlhbnQ6IGdsb2JhbE5vZGVJbXBvcnRzLmxlbmd0aCA9PT0gMCAmJiBoYXNSZWdpc3RyYXRpb24sXG4gICAgICBpc3N1ZXMsXG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gNS4gQ2hlY2sgZm9yIGNsYXNzZXMgdGhhdCBoYXZlIHNlcmRlIHBhdHRlcm5zIGluIHNvdXJjZSBidXQgd2VyZW4ndCBkZXRlY3RlZCBieSBTV0NcbiAgY29uc3Qgc291cmNlSGFzU2VyZGVQYXR0ZXJucyA9XG4gICAgL1xcW1xccypXT1JLRkxPV18oPzpTRVJJQUxJWkV8REVTRVJJQUxJWkUpXFxzKlxcXS8udGVzdChzb3VyY2VDb2RlKSB8fFxuICAgIC9TeW1ib2xcXC5mb3JcXHMqXFwoXFxzKlsnXCJdd29ya2Zsb3ctKD86c2VyaWFsaXplfGRlc2VyaWFsaXplKVsnXCJdXFxzKlxcKS8udGVzdChcbiAgICAgIHNvdXJjZUNvZGVcbiAgICApO1xuXG4gIGlmIChzb3VyY2VIYXNTZXJkZVBhdHRlcm5zICYmIGNsYXNzRW50cmllcy5sZW5ndGggPT09IDApIHtcbiAgICBjbGFzc2VzLnB1c2goe1xuICAgICAgY2xhc3NOYW1lOiAnPHVua25vd24+JyxcbiAgICAgIGNsYXNzSWQ6ICcnLFxuICAgICAgZGV0ZWN0ZWQ6IGZhbHNlLFxuICAgICAgcmVnaXN0ZXJlZDogZmFsc2UsXG4gICAgICBub2RlSW1wb3J0czogZ2xvYmFsTm9kZUltcG9ydHMsXG4gICAgICBjb21wbGlhbnQ6IGZhbHNlLFxuICAgICAgaXNzdWVzOiBbXG4gICAgICAgIGBTb3VyY2UgY29kZSBjb250YWlucyBXT1JLRkxPV19TRVJJQUxJWkUvV09SS0ZMT1dfREVTRVJJQUxJWkUgcGF0dGVybnMgYnV0IGAgK1xuICAgICAgICAgIGB0aGUgU1dDIHBsdWdpbiBkaWQgbm90IGRldGVjdCBhbnkgc2VyZGUtZW5hYmxlZCBjbGFzc2VzLiBgICtcbiAgICAgICAgICBgRW5zdXJlIHRoZSBzeW1ib2xzIGFyZSBkZWZpbmVkIGFzIHN0YXRpYyBtZXRob2RzIElOU0lERSB0aGUgY2xhc3MgYm9keSwgYCArXG4gICAgICAgICAgYG5vdCBhc3NpZ25lZCBleHRlcm5hbGx5IChlLmcuLCAoTXlDbGFzcyBhcyBhbnkpW1dPUktGTE9XX1NFUklBTElaRV0gPSAuLi4pLmAsXG4gICAgICBdLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjbGFzc2VzLFxuICAgIGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgIGhhc1NlcmRlQ2xhc3NlcyxcbiAgICBtYW5pZmVzdCxcbiAgfTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IE5vZGUuanMgYnVpbHQtaW4gbW9kdWxlIG5hbWVzIGZyb20gdHJhbnNmb3JtZWQgY29kZS5cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdE5vZGVJbXBvcnRzKGNvZGU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgaW1wb3J0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAvLyBSZXNldCByZWdleCBzdGF0ZVxuICBub2RlSW1wb3J0RXh0cmFjdFJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gIGZvciAoXG4gICAgbGV0IG1hdGNoID0gbm9kZUltcG9ydEV4dHJhY3RSZWdleC5leGVjKGNvZGUpO1xuICAgIG1hdGNoICE9PSBudWxsO1xuICAgIG1hdGNoID0gbm9kZUltcG9ydEV4dHJhY3RSZWdleC5leGVjKGNvZGUpXG4gICkge1xuICAgIC8vIG1hdGNoWzFdIGlzIGZyb20gdGhlIEVTTSBwYXR0ZXJuLCBtYXRjaFsyXSBpcyBmcm9tIHRoZSBDSlMgcGF0dGVyblxuICAgIGNvbnN0IG1vZHVsZU5hbWUgPSBtYXRjaFsxXSB8fCBtYXRjaFsyXTtcbiAgICBpZiAobW9kdWxlTmFtZSkge1xuICAgICAgLy8gTm9ybWFsaXplIHRvIGJhc2UgbW9kdWxlIG5hbWUgKGUuZy4sICdmcy9wcm9taXNlcycgLT4gJ2ZzJylcbiAgICAgIGltcG9ydHMuYWRkKG1vZHVsZU5hbWUuc3BsaXQoJy8nKVswXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBbLi4uaW1wb3J0c10uc29ydCgpO1xufVxuXG4vKipcbiAqIEV4dHJhY3QgY2xhc3MgZW50cmllcyBmcm9tIGEgV29ya2Zsb3dNYW5pZmVzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RDbGFzc0VudHJpZXMoXG4gIG1hbmlmZXN0OiBXb3JrZmxvd01hbmlmZXN0XG4pOiBBcnJheTx7IGNsYXNzTmFtZTogc3RyaW5nOyBjbGFzc0lkOiBzdHJpbmc7IGZpbGVOYW1lOiBzdHJpbmcgfT4ge1xuICBjb25zdCBlbnRyaWVzOiBBcnJheTx7XG4gICAgY2xhc3NOYW1lOiBzdHJpbmc7XG4gICAgY2xhc3NJZDogc3RyaW5nO1xuICAgIGZpbGVOYW1lOiBzdHJpbmc7XG4gIH0+ID0gW107XG4gIGlmICghbWFuaWZlc3QuY2xhc3NlcykgcmV0dXJuIGVudHJpZXM7XG5cbiAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNsYXNzZXNdIG9mIE9iamVjdC5lbnRyaWVzKG1hbmlmZXN0LmNsYXNzZXMpKSB7XG4gICAgZm9yIChjb25zdCBbY2xhc3NOYW1lLCB7IGNsYXNzSWQgfV0gb2YgT2JqZWN0LmVudHJpZXMoY2xhc3NlcykpIHtcbiAgICAgIGVudHJpZXMucHVzaCh7IGNsYXNzTmFtZSwgY2xhc3NJZCwgZmlsZU5hbWUgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBlbnRyaWVzO1xufVxuIiwgImltcG9ydCB7XG4gIENvcnJ1cHRlZEV2ZW50TG9nRXJyb3IsXG4gIEVudGl0eUNvbmZsaWN0RXJyb3IsXG4gIFByZWNvbmRpdGlvbkZhaWxlZEVycm9yLFxuICBSZXBsYXlEaXZlcmdlbmNlRXJyb3IsXG4gIFJVTl9FUlJPUl9DT0RFUyxcbiAgUnVuRXhwaXJlZEVycm9yLFxuICBXb3JrZmxvd1J1bnRpbWVFcnJvcixcbn0gZnJvbSAnQHdvcmtmbG93L2Vycm9ycyc7XG5pbXBvcnQgeyBzZXRXb3JrZmxvd0Jhc2VQYXRoIH0gZnJvbSAnQHdvcmtmbG93L3V0aWxzJztcbmltcG9ydCB7IHBhcnNlV29ya2Zsb3dOYW1lIH0gZnJvbSAnQHdvcmtmbG93L3V0aWxzL3BhcnNlLW5hbWUnO1xuaW1wb3J0IHtcbiAgdHlwZSBFdmVudCxcbiAgZ2V0UXVldWVUb3BpY1ByZWZpeCxcbiAgcmVzb2x2ZVF1ZXVlTmFtZXNwYWNlLFxuICBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgU1BFQ19WRVJTSU9OX0xFR0FDWSxcbiAgV29ya2Zsb3dJbnZva2VQYXlsb2FkU2NoZW1hLFxuICB0eXBlIFdvcmtmbG93UnVuLFxufSBmcm9tICdAd29ya2Zsb3cvd29ybGQnO1xuaW1wb3J0IHtcbiAgY2xhc3NpZnlSdW5FcnJvcixcbiAgaXNSZXRyeWFibGVXb3JsZEVycm9yLFxuICBpc1dvcmxkQ29udHJhY3RFcnJvcixcbn0gZnJvbSAnLi9jbGFzc2lmeS1lcnJvci5qcyc7XG5pbXBvcnQgeyBpbXBvcnRLZXkgfSBmcm9tICcuL2VuY3J5cHRpb24uanMnO1xuaW1wb3J0IHsgV29ya2Zsb3dTdXNwZW5zaW9uIH0gZnJvbSAnLi9nbG9iYWwuanMnO1xuaW1wb3J0IHsgcnVudGltZUxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyLmpzJztcbmltcG9ydCB7XG4gIE1BWF9RVUVVRV9ERUxJVkVSSUVTLFxuICBSRVBMQVlfRElWRVJHRU5DRV9NQVhfUkVUUklFUyxcbiAgUkVQTEFZX1RJTUVPVVRfTUFYX1JFVFJJRVMsXG4gIFJFUExBWV9USU1FT1VUX01TLFxufSBmcm9tICcuL3J1bnRpbWUvY29uc3RhbnRzLmpzJztcbmltcG9ydCB7XG4gIGdldFF1ZXVlT3ZlcmhlYWQsXG4gIGdldFdvcmtmbG93UXVldWVOYW1lLFxuICBnZXRXb3JrZmxvd1J1bkV2ZW50cyxcbiAgaGFuZGxlSGVhbHRoQ2hlY2tNZXNzYWdlLFxuICB0eXBlIE11dGFibGVFdmVudExvZyxcbiAgcGFyc2VIZWFsdGhDaGVja1BheWxvYWQsXG4gIHF1ZXVlTWVzc2FnZSxcbiAgc3RhdGVVcGRhdGVkQXRGb3JDcmVhdGUsXG4gIHdpdGhIZWFsdGhDaGVjayxcbiAgd2l0aFByZWNvbmRpdGlvblJldHJ5LFxufSBmcm9tICcuL3J1bnRpbWUvaGVscGVycy5qcyc7XG5pbXBvcnQgeyBoYW5kbGVTdXNwZW5zaW9uIH0gZnJvbSAnLi9ydW50aW1lL3N1c3BlbnNpb24taGFuZGxlci5qcyc7XG5pbXBvcnQgeyBnZXRXb3JsZCwgZ2V0V29ybGRIYW5kbGVycyB9IGZyb20gJy4vcnVudGltZS93b3JsZC5qcyc7XG5pbXBvcnQgeyByZW1hcEVycm9yU3RhY2sgfSBmcm9tICcuL3NvdXJjZS1tYXAuanMnO1xuaW1wb3J0ICogYXMgQXR0cmlidXRlIGZyb20gJy4vdGVsZW1ldHJ5L3NlbWFudGljLWNvbnZlbnRpb25zLmpzJztcbmltcG9ydCB7XG4gIGxpbmtUb0N1cnJlbnRDb250ZXh0LFxuICB0cmFjZSxcbiAgd2l0aFRyYWNlQ29udGV4dCxcbiAgd2l0aFdvcmtmbG93QmFnZ2FnZSxcbn0gZnJvbSAnLi90ZWxlbWV0cnkuanMnO1xuaW1wb3J0IHsgZ2V0RXJyb3JOYW1lLCBnZXRFcnJvclN0YWNrLCBub3JtYWxpemVVbmtub3duRXJyb3IgfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGJ1aWxkV29ya2Zsb3dTdXNwZW5zaW9uTWVzc2FnZSB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBydW5Xb3JrZmxvdyB9IGZyb20gJy4vd29ya2Zsb3cuanMnO1xuXG5leHBvcnQgdHlwZSB7IEV2ZW50LCBXb3JrZmxvd1J1biB9O1xuZXhwb3J0IHsgV29ya2Zsb3dTdXNwZW5zaW9uIH0gZnJvbSAnLi9nbG9iYWwuanMnO1xuZXhwb3J0IHtcbiAgdHlwZSBIZWFsdGhDaGVja0VuZHBvaW50LFxuICB0eXBlIEhlYWx0aENoZWNrT3B0aW9ucyxcbiAgdHlwZSBIZWFsdGhDaGVja1Jlc3VsdCxcbiAgaGVhbHRoQ2hlY2ssXG59IGZyb20gJy4vcnVudGltZS9oZWxwZXJzLmpzJztcbmV4cG9ydCB7XG4gIGdldEhvb2tCeVRva2VuLFxuICByZXN1bWVIb29rLFxuICByZXN1bWVXZWJob29rLFxufSBmcm9tICcuL3J1bnRpbWUvcmVzdW1lLWhvb2suanMnO1xuZXhwb3J0IHtcbiAgZ2V0UnVuLFxuICBSdW4sXG4gIHR5cGUgV29ya2Zsb3dSZWFkYWJsZVN0cmVhbSxcbiAgdHlwZSBXb3JrZmxvd1JlYWRhYmxlU3RyZWFtT3B0aW9ucyxcbn0gZnJvbSAnLi9ydW50aW1lL3J1bi5qcyc7XG5leHBvcnQge1xuICBjYW5jZWxSdW4sXG4gIGxpc3RTdHJlYW1zLFxuICB0eXBlIFJlYWRTdHJlYW1PcHRpb25zLFxuICB0eXBlIFJlY3JlYXRlUnVuT3B0aW9ucyxcbiAgcmVhZFN0cmVhbSxcbiAgcmVjcmVhdGVSdW5Gcm9tRXhpc3RpbmcsXG4gIHJlZW5xdWV1ZVJ1bixcbiAgdHlwZSBTdG9wU2xlZXBPcHRpb25zLFxuICB0eXBlIFN0b3BTbGVlcFJlc3VsdCxcbiAgd2FrZVVwUnVuLFxufSBmcm9tICcuL3J1bnRpbWUvcnVucy5qcyc7XG5leHBvcnQge1xuICB0eXBlIFN0YXJ0T3B0aW9ucyxcbiAgdHlwZSBTdGFydE9wdGlvbnNCYXNlLFxuICB0eXBlIFN0YXJ0T3B0aW9uc1dpdGhEZXBsb3ltZW50SWQsXG4gIHR5cGUgU3RhcnRPcHRpb25zV2l0aG91dERlcGxveW1lbnRJZCxcbiAgc3RhcnQsXG59IGZyb20gJy4vcnVudGltZS9zdGFydC5qcyc7XG5leHBvcnQgeyBzdGVwRW50cnlwb2ludCB9IGZyb20gJy4vcnVudGltZS9zdGVwLWhhbmRsZXIuanMnO1xuZXhwb3J0IHtcbiAgY3JlYXRlV29ybGQsXG4gIGdldFdvcmxkLFxuICBnZXRXb3JsZEhhbmRsZXJzLFxuICBzZXRXb3JsZCxcbn0gZnJvbSAnLi9ydW50aW1lL3dvcmxkLmpzJztcblxuZnVuY3Rpb24gaGFzUmVjb3JkZWRUZXJtaW5hbFJ1bkV2ZW50KGV2ZW50czogRXZlbnRbXSwgcnVuSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCB0ZXJtaW5hbEV2ZW50ID0gZXZlbnRzLmZpbmQoXG4gICAgKGV2ZW50KSA9PlxuICAgICAgZXZlbnQucnVuSWQgPT09IHJ1bklkICYmXG4gICAgICAoZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX2NvbXBsZXRlZCcgfHxcbiAgICAgICAgZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX2ZhaWxlZCcgfHxcbiAgICAgICAgZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX2NhbmNlbGxlZCcpXG4gICk7XG5cbiAgaWYgKCF0ZXJtaW5hbEV2ZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICdXb3JrZmxvdyBldmVudCBsb2cgYWxyZWFkeSBjb250YWlucyBhIHRlcm1pbmFsIHJ1biBldmVudCwgc2tpcHBpbmcgcmVwbGF5JyxcbiAgICB7XG4gICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgIGV2ZW50VHlwZTogdGVybWluYWxFdmVudC5ldmVudFR5cGUsXG4gICAgICBldmVudElkOiB0ZXJtaW5hbEV2ZW50LmV2ZW50SWQsXG4gICAgfVxuICApO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYSBzaW5nbGUgcm91dGUgd2hpY2ggaGFuZGxlcyBhbnkgd29ya2Zsb3cgZXhlY3V0aW9uXG4gKiByZXF1ZXN0IGFuZCByb3V0ZXMgdG8gdGhlIGFwcHJvcHJpYXRlIHdvcmtmbG93IGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB3b3JrZmxvd0NvZGUgLSBUaGUgd29ya2Zsb3cgYnVuZGxlIGNvZGUgY29udGFpbmluZyBhbGwgdGhlIHdvcmtmbG93XG4gKiBmdW5jdGlvbnMgYXQgdGhlIHRvcCBsZXZlbC5cbiAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCBhcyBhIFZlcmNlbCBBUEkgcm91dGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZmxvd0VudHJ5cG9pbnQoXG4gIHdvcmtmbG93Q29kZTogc3RyaW5nLFxuICBvcHRpb25zPzogeyBuYW1lc3BhY2U/OiBzdHJpbmc7IGJhc2VQYXRoPzogc3RyaW5nIH1cbik6IChyZXE6IFJlcXVlc3QpID0+IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgc2V0V29ya2Zsb3dCYXNlUGF0aChvcHRpb25zPy5iYXNlUGF0aCk7XG5cbiAgY29uc3QgbmFtZXNwYWNlID0gcmVzb2x2ZVF1ZXVlTmFtZXNwYWNlKG9wdGlvbnM/Lm5hbWVzcGFjZSk7XG4gIGNvbnN0IHdvcmtmbG93UHJlZml4ID0gZ2V0UXVldWVUb3BpY1ByZWZpeCgnd29ya2Zsb3cnLCBuYW1lc3BhY2UpO1xuXG4gIGNvbnN0IHsgY3JlYXRlUXVldWVIYW5kbGVyLCBzcGVjVmVyc2lvbjogd29ybGRTcGVjVmVyc2lvbiB9ID1cbiAgICBnZXRXb3JsZEhhbmRsZXJzKCk7XG4gIGNvbnN0IGhhbmRsZXIgPSBjcmVhdGVRdWV1ZUhhbmRsZXIoXG4gICAgd29ya2Zsb3dQcmVmaXgsXG4gICAgYXN5bmMgKG1lc3NhZ2VfLCBtZXRhZGF0YSkgPT4ge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIGhlYWx0aCBjaGVjayBtZXNzYWdlXG4gICAgICAvLyBOT1RFOiBIZWFsdGggY2hlY2sgbWVzc2FnZXMgYXJlIGludGVudGlvbmFsbHkgdW5hdXRoZW50aWNhdGVkIGZvciBtb25pdG9yaW5nIHB1cnBvc2VzLlxuICAgICAgLy8gVGhleSBvbmx5IHdyaXRlIGEgc2ltcGxlIHN0YXR1cyByZXNwb25zZSB0byBhIHN0cmVhbSBhbmQgZG8gbm90IGV4cG9zZSBzZW5zaXRpdmUgZGF0YS5cbiAgICAgIC8vIFRoZSBzdHJlYW0gbmFtZSBpbmNsdWRlcyBhIHVuaXF1ZSBjb3JyZWxhdGlvbklkIHRoYXQgbXVzdCBiZSBrbm93biBieSB0aGUgY2FsbGVyLlxuICAgICAgY29uc3QgaGVhbHRoQ2hlY2sgPSBwYXJzZUhlYWx0aENoZWNrUGF5bG9hZChtZXNzYWdlXyk7XG4gICAgICBpZiAoaGVhbHRoQ2hlY2spIHtcbiAgICAgICAgYXdhaXQgaGFuZGxlSGVhbHRoQ2hlY2tNZXNzYWdlKFxuICAgICAgICAgIGhlYWx0aENoZWNrLFxuICAgICAgICAgICd3b3JrZmxvdycsXG4gICAgICAgICAgd29ybGRTcGVjVmVyc2lvblxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcnVuSWQsXG4gICAgICAgIHRyYWNlQ2FycmllcjogdHJhY2VDb250ZXh0LFxuICAgICAgICByZXF1ZXN0ZWRBdCxcbiAgICAgICAgcmVwbGF5RGl2ZXJnZW5jZSxcbiAgICAgICAgcnVuSW5wdXQsXG4gICAgICB9ID0gV29ya2Zsb3dJbnZva2VQYXlsb2FkU2NoZW1hLnBhcnNlKG1lc3NhZ2VfKTtcbiAgICAgIGNvbnN0IHsgcmVxdWVzdElkIH0gPSBtZXRhZGF0YTtcbiAgICAgIC8vIEV4dHJhY3QgdGhlIHdvcmtmbG93IG5hbWUgZnJvbSB0aGUgdG9waWMgbmFtZVxuICAgICAgY29uc3Qgd29ya2Zsb3dOYW1lID0gbWV0YWRhdGEucXVldWVOYW1lLnNsaWNlKHdvcmtmbG93UHJlZml4Lmxlbmd0aCk7XG5cbiAgICAgIC8vIC0tLSBNYXggZGVsaXZlcnkgY2hlY2sgLS0tXG4gICAgICAvLyBFbmZvcmNlIG1heCBkZWxpdmVyeSBsaW1pdCBiZWZvcmUgYW55IGluZnJhc3RydWN0dXJlIGNhbGxzLlxuICAgICAgLy8gVGhpcyBwcmV2ZW50cyBydW5hd2F5IHdvcmtmbG93cyBmcm9tIGNvbnN1bWluZyBpbmZpbml0ZSBxdWV1ZSBkZWxpdmVyaWVzLlxuICAgICAgLy8gQXQgdGhpcyBwb2ludCwgd2Ugd2FudCB0byBkbyB0aGUgbWluaW1hbCBhbW91bnQgb2Ygd29yayAobm8gZmV0Y2hpbmdcbiAgICAgIC8vIG9mIHRoZSB3b3JrZmxvdyBldmVudHMsIGV0Yy4gV2Ugc2ltcGx5IGF0dGVtcHQgdG8gbWFyayB0aGUgcnVuIGFzIGZhaWxlZFxuICAgICAgLy8gYW5kIGlmIHRoYXQgZmFpbHMsIHRoZSBtZXNzYWdlIGlzIHN0aWxsIGNvbnN1bWVkIGJ1dCB3aXRoIGFkZXF1YXRlIGxvZ2dpbmdcbiAgICAgIC8vIHRoYXQgYW4gZXJyb3Igb2NjdXJyZWQgcHJldmVudGluZyB1cyBmcm9tIGZhaWxpbmcgdGhlIHJ1bi5cbiAgICAgIGlmIChtZXRhZGF0YS5hdHRlbXB0ID4gTUFYX1FVRVVFX0RFTElWRVJJRVMpIHtcbiAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICBgV29ya2Zsb3cgaGFuZGxlciBleGNlZWRlZCBtYXggZGVsaXZlcmllcyAoJHttZXRhZGF0YS5hdHRlbXB0fS8ke01BWF9RVUVVRV9ERUxJVkVSSUVTfSlgLFxuICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQsIHdvcmtmbG93TmFtZSwgYXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCB9XG4gICAgICAgICk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgd29ybGQgPSBnZXRXb3JsZCgpO1xuICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2ZhaWxlZCcsXG4gICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBXb3JrZmxvdyBleGNlZWRlZCBtYXhpbXVtIHF1ZXVlIGRlbGl2ZXJpZXMgKCR7bWV0YWRhdGEuYXR0ZW1wdH0vJHtNQVhfUVVFVUVfREVMSVZFUklFU30pYCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLk1BWF9ERUxJVkVSSUVTX0VYQ0VFREVELFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBpZiAoRW50aXR5Q29uZmxpY3RFcnJvci5pcyhlcnIpIHx8IFJ1bkV4cGlyZWRFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAvLyBSdW4gYWxyZWFkeSBmaW5pc2hlZCwgY29uc3VtZSB0aGUgbWVzc2FnZSBzaWxlbnRseVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgYEZhaWxlZCB0byBtYXJrIHJ1biBhcyBmYWlsZWQgYWZ0ZXIgJHttZXRhZGF0YS5hdHRlbXB0fSBkZWxpdmVyeSBhdHRlbXB0cy4gYCArXG4gICAgICAgICAgICAgIGBBIHBlcnNpc3RlbnQgZXJyb3IgaXMgcHJldmVudGluZyB0aGUgcnVuIGZyb20gYmVpbmcgdGVybWluYXRlZC4gYCArXG4gICAgICAgICAgICAgIGBUaGUgcnVuIHdpbGwgcmVtYWluIGluIGl0cyBjdXJyZW50IHN0YXRlIHVudGlsIG1hbnVhbGx5IHJlc29sdmVkLiBgICtcbiAgICAgICAgICAgICAgYFRoaXMgaXMgbW9zdCBsaWtlbHkgZHVlIHRvIGEgcGVyc2lzdGVudCBvdXRhZ2Ugb2YgdGhlIHdvcmtmbG93IGJhY2tlbmQgYCArXG4gICAgICAgICAgICAgIGBvciBhIGJ1ZyBpbiB0aGUgd29ya2Zsb3cgcnVudGltZSBhbmQgc2hvdWxkIGJlIHJlcG9ydGVkIHRvIHRoZSBXb3JrZmxvdyB0ZWFtLmAsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICBlcnJvcjogZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpLFxuICAgICAgICAgICAgICBhdHRlbXB0OiBtZXRhZGF0YS5hdHRlbXB0LFxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzcGFuTGlua3MgPSBhd2FpdCBsaW5rVG9DdXJyZW50Q29udGV4dCgpO1xuXG4gICAgICAvLyAtLS0gUmVwbGF5IHRpbWVvdXQgZ3VhcmQgLS0tXG4gICAgICAvLyBJZiB0aGUgcmVwbGF5IHRha2VzIGxvbmdlciB0aGFuIHRoZSB0aW1lb3V0LCBmYWlsIHRoZSBydW4gYW5kIGV4aXQuXG4gICAgICAvLyBUaGlzIG11c3QgYmUgbG93ZXIgdGhhbiB0aGUgZnVuY3Rpb24ncyBtYXhEdXJhdGlvbiB0byBlbnN1cmVcbiAgICAgIC8vIHRoZSBmYWlsdXJlIGlzIHJlY29yZGVkIGJlZm9yZSB0aGUgcGxhdGZvcm0ga2lsbHMgdGhlIGZ1bmN0aW9uLlxuICAgICAgbGV0IHJlcGxheVRpbWVvdXQ6IE5vZGVKUy5UaW1lb3V0IHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKHByb2Nlc3MuZW52LlZFUkNFTF9VUkwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXBsYXlUaW1lb3V0ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcignV29ya2Zsb3cgcmVwbGF5IGV4Y2VlZGVkIHRpbWVvdXQnLCB7XG4gICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgIHRpbWVvdXRNczogUkVQTEFZX1RJTUVPVVRfTVMsXG4gICAgICAgICAgICBhdHRlbXB0OiBtZXRhZGF0YS5hdHRlbXB0LFxuICAgICAgICAgICAgbWF4UmV0cmllczogUkVQTEFZX1RJTUVPVVRfTUFYX1JFVFJJRVMsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBBbGxvdyBhIGZldyByZXRyaWVzIGJlZm9yZSBwZXJtYW5lbnRseSBmYWlsaW5nIHRoZSBydW4uXG4gICAgICAgICAgLy8gT24gZWFybHkgYXR0ZW1wdHMsIGp1c3QgZXhpdCBzbyB0aGUgcXVldWUgcmV0cmllcyB0aGUgbWVzc2FnZS5cbiAgICAgICAgICBpZiAobWV0YWRhdGEuYXR0ZW1wdCA8PSBSRVBMQVlfVElNRU9VVF9NQVhfUkVUUklFUykge1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB3b3JsZCA9IGF3YWl0IGdldFdvcmxkKCk7XG4gICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBXb3JrZmxvdyByZXBsYXkgZXhjZWVkZWQgbWF4aW11bSBkdXJhdGlvbiAoJHtSRVBMQVlfVElNRU9VVF9NUyAvIDEwMDB9cykgYWZ0ZXIgJHttZXRhZGF0YS5hdHRlbXB0fSBhdHRlbXB0c2AsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuUkVQTEFZX1RJTUVPVVQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIEJlc3QgZWZmb3J0IOKAlCBwcm9jZXNzIGV4aXRzIHJlZ2FyZGxlc3NcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgYWxzbyBwcmV2ZW50cyB0aGUgcnVudGltZSBmcm9tIGFja2luZyB0aGUgcXVldWUgbWVzc2FnZSxcbiAgICAgICAgICAvLyBzbyB0aGUgcXVldWUgd2lsbCBjYWxsIGJhY2sgb25jZSwgYWZ0ZXIgd2hpY2ggYSA0MTAgd2lsbCBnZXQgaXQgdG8gZXhpdCBlYXJseS5cbiAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH0sIFJFUExBWV9USU1FT1VUX01TKTtcbiAgICAgICAgcmVwbGF5VGltZW91dC51bnJlZigpO1xuICAgICAgfVxuXG4gICAgICAvLyBJbnZva2UgdXNlciB3b3JrZmxvdyB3aXRoaW4gdGhlIHByb3BhZ2F0ZWQgdHJhY2UgY29udGV4dCBhbmQgYmFnZ2FnZVxuICAgICAgcmV0dXJuIGF3YWl0IHdpdGhUcmFjZUNvbnRleHQodHJhY2VDb250ZXh0LCBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIFNldCB3b3JrZmxvdyBjb250ZXh0IGFzIGJhZ2dhZ2UgZm9yIGF1dG9tYXRpYyBwcm9wYWdhdGlvblxuICAgICAgICByZXR1cm4gYXdhaXQgd2l0aFdvcmtmbG93QmFnZ2FnZShcbiAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkLCB3b3JrZmxvd05hbWUgfSxcbiAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB3b3JsZCA9IGdldFdvcmxkKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJhY2UoXG4gICAgICAgICAgICAgIGBXT1JLRkxPVyAke3dvcmtmbG93TmFtZX1gLFxuICAgICAgICAgICAgICB7IGxpbmtzOiBzcGFuTGlua3MgfSxcbiAgICAgICAgICAgICAgYXN5bmMgKHNwYW4pID0+IHtcbiAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd05hbWUod29ya2Zsb3dOYW1lKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd09wZXJhdGlvbignZXhlY3V0ZScpLFxuICAgICAgICAgICAgICAgICAgLy8gU3RhbmRhcmQgT1RFTCBtZXNzYWdpbmcgY29udmVudGlvbnNcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5NZXNzYWdpbmdTeXN0ZW0oJ3ZlcmNlbC1xdWV1ZScpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLk1lc3NhZ2luZ0Rlc3RpbmF0aW9uTmFtZShtZXRhZGF0YS5xdWV1ZU5hbWUpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLk1lc3NhZ2luZ01lc3NhZ2VJZChtZXRhZGF0YS5tZXNzYWdlSWQpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLk1lc3NhZ2luZ09wZXJhdGlvblR5cGUoJ3Byb2Nlc3MnKSxcbiAgICAgICAgICAgICAgICAgIC4uLmdldFF1ZXVlT3ZlcmhlYWQoeyByZXF1ZXN0ZWRBdCB9KSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIFRPRE86IHZhbGlkYXRlIGB3b3JrZmxvd05hbWVgIGV4aXN0cyBiZWZvcmUgY29uc3VtaW5nIG1lc3NhZ2U/XG5cbiAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1bklkKHJ1bklkKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1RyYWNlUHJvcGFnYXRlZCghIXRyYWNlQ29udGV4dCksXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgd29ya2Zsb3dTdGFydGVkQXQgPSAtMTtcbiAgICAgICAgICAgICAgICBsZXQgd29ya2Zsb3dSdW46IFdvcmtmbG93UnVuIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIC8vIFByZS1sb2FkZWQgZXZlbnRzIGZyb20gdGhlIHJ1bl9zdGFydGVkIHJlc3BvbnNlLlxuICAgICAgICAgICAgICAgIC8vIFdoZW4gcHJlc2VudCwgd2Ugc2tpcCB0aGUgZXZlbnRzLmxpc3QgY2FsbC5cbiAgICAgICAgICAgICAgICBsZXQgcHJlbG9hZGVkRXZlbnRzOiBFdmVudFtdIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGxldCBwcmVsb2FkZWRFdmVudHNDdXJzb3I6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAvLyAtLS0gSW5mcmFzdHJ1Y3R1cmU6IHByZXBhcmUgdGhlIHJ1biBzdGF0ZSAtLS1cbiAgICAgICAgICAgICAgICAvLyBBbHdheXMgY2FsbCBydW5fc3RhcnRlZCBkaXJlY3RseSDigJQgdGhpcyBib3RoIHRyYW5zaXRpb25zXG4gICAgICAgICAgICAgICAgLy8gdGhlIHJ1biB0byAncnVubmluZycgQU5EIHJldHVybnMgdGhlIHJ1biBlbnRpdHksIHNhdmluZ1xuICAgICAgICAgICAgICAgIC8vIGEgc2VwYXJhdGUgcnVucy5nZXQgcm91bmQtdHJpcC5cbiAgICAgICAgICAgICAgICAvLyBDb250cmFjdDogZXZlbnRzLmNyZWF0ZSgncnVuX3N0YXJ0ZWQnKSBtdXN0IGJlIGlkZW1wb3RlbnRcbiAgICAgICAgICAgICAgICAvLyBmb3IgcnVucyBhbHJlYWR5IGluICdydW5uaW5nJyBzdGF0dXMgKHJldHVybiB0aGUgcnVuXG4gICAgICAgICAgICAgICAgLy8gd2l0aG91dCBlcnJvciksIG5vdCBqdXN0IGZvciBwZW5kaW5nIOKGkiBydW5uaW5nIHRyYW5zaXRpb25zLlxuICAgICAgICAgICAgICAgIC8vIE5ldHdvcmsvc2VydmVyIGVycm9ycyBwcm9wYWdhdGUgdG8gdGhlIHF1ZXVlIGhhbmRsZXIgZm9yIHJldHJ5LlxuICAgICAgICAgICAgICAgIC8vIFdvcmtmbG93UnVudGltZUVycm9yIChkYXRhIGludGVncml0eSBpc3N1ZXMpIGFyZSBmYXRhbCBhbmRcbiAgICAgICAgICAgICAgICAvLyBwcm9kdWNlIHJ1bl9mYWlsZWQgc2luY2UgcmV0cnlpbmcgd29uJ3QgZml4IHRoZW0uXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX3N0YXJ0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIFVzZSB0aGUgc3BlYyB2ZXJzaW9uIGZyb20gdGhlIG9yaWdpbmFsIHN0YXJ0KCkgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gYXZhaWxhYmxlLCBzbyB0aGUgcmVzaWxpZW50IHN0YXJ0IHBhdGggY3JlYXRlc1xuICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBydW4gd2l0aCB0aGUgY29ycmVjdCB2ZXJzaW9uIChub3QgYWx3YXlzIGN1cnJlbnQpLlxuICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOlxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuSW5wdXQ/LnNwZWNWZXJzaW9uID8/IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgIC8vIFBhc3MgcnVuIGlucHV0IGZyb20gcXVldWUgc28gdGhlIHNlcnZlciBjYW5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHJ1biBpZiBydW5fY3JlYXRlZCB3YXMgbWlzc2VkLlxuICAgICAgICAgICAgICAgICAgICAgIC8vIFVpbnQ4QXJyYXkgdmFsdWVzIHN1cnZpdmUgdGhlIHF1ZXVlIG5hdGl2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgLy8gKENCT1Igb24gd29ybGQtdmVyY2VsLCBKU09OIHJldml2ZXIgb24gd29ybGQtbG9jYWwpLlxuICAgICAgICAgICAgICAgICAgICAgIC4uLihydW5JbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogcnVuSW5wdXQuaW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3ltZW50SWQ6IHJ1bklucHV0LmRlcGxveW1lbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogcnVuSW5wdXQud29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhlY3V0aW9uQ29udGV4dDogcnVuSW5wdXQuZXhlY3V0aW9uQ29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICA6IHt9KSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LnJ1bikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYEV2ZW50IGNyZWF0aW9uIGZvciAncnVuX3N0YXJ0ZWQnIGRpZCBub3QgcmV0dXJuIHRoZSBydW4gZW50aXR5IGZvciBydW4gXCIke3J1bklkfVwiYFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4gPSByZXN1bHQucnVuO1xuXG4gICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcmVzcG9uc2UgaW5jbHVkZXMgZXZlbnRzLCB1c2UgdGhlbSB0byBza2lwXG4gICAgICAgICAgICAgICAgICAvLyB0aGUgaW5pdGlhbCBldmVudHMubGlzdCBjYWxsIGFuZCByZWR1Y2UgVFRGQi5cbiAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmV2ZW50cyAmJlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZXZlbnRzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhhc01vcmUgIT09IHRydWVcbiAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkZWRFdmVudHMgPSByZXN1bHQuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkZWRFdmVudHNDdXJzb3IgPSByZXN1bHQuY3Vyc29yO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZiAoIXdvcmtmbG93UnVuLnN0YXJ0ZWRBdCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYFdvcmtmbG93IHJ1biBcIiR7cnVuSWR9XCIgaGFzIG5vIFwic3RhcnRlZEF0XCIgdGltZXN0YW1wYFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgLy8gUnVuIHdhcyBjb25jdXJyZW50bHkgY29tcGxldGVkL2ZhaWxlZC9jYW5jZWxsZWRcbiAgICAgICAgICAgICAgICAgIGlmIChFbnRpdHlDb25mbGljdEVycm9yLmlzKGVycikgfHwgUnVuRXhwaXJlZEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRW50aXR5Q29uZmxpY3RFcnJvcjogcnVuIHdhcyBjb25jdXJyZW50bHlcbiAgICAgICAgICAgICAgICAgICAgLy8gY29tcGxldGVkL2ZhaWxlZC9jYW5jZWxsZWQgZHVyaW5nIHNldHVwLlxuICAgICAgICAgICAgICAgICAgICAvLyBSdW5FeHBpcmVkRXJyb3I6IHJ1biBhbHJlYWR5IGluIHRlcm1pbmFsIHN0YXRlLlxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBib3RoIGNhc2VzLCBza2lwIHByb2Nlc3NpbmcgdGhpcyBtZXNzYWdlLlxuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgJ1J1biBhbHJlYWR5IGZpbmlzaGVkIGR1cmluZyBzZXR1cCwgc2tpcHBpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQsIG1lc3NhZ2U6IGVyci5tZXNzYWdlIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIgaW5zdGFuY2VvZiBXb3JrZmxvd1J1bnRpbWVFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCBydW50aW1lIGVycm9yIGR1cmluZyB3b3JrZmxvdyBzZXR1cCcsXG4gICAgICAgICAgICAgICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCwgZXJyb3I6IGVyci5tZXNzYWdlIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5SVU5USU1FX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChmYWlsRXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgRW50aXR5Q29uZmxpY3RFcnJvci5pcyhmYWlsRXJyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgUnVuRXhwaXJlZEVycm9yLmlzKGZhaWxFcnIpXG4gICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihmYWlsRXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIHJlY29yZGluZyB3b3JrZmxvdyBmYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbEVyciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZmFpbEVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogU3RyaW5nKGZhaWxFcnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBmYWlsRXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciBkdXJpbmcgd29ya2Zsb3cgc2V0dXAnLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuV09STERfQ09OVFJBQ1RfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2ZhaWxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChmYWlsRXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgRW50aXR5Q29uZmxpY3RFcnJvci5pcyhmYWlsRXJyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgUnVuRXhwaXJlZEVycm9yLmlzKGZhaWxFcnIpXG4gICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihmYWlsRXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIHJlY29yZGluZyB3b3JrZmxvdyBmYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbEVyciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZmFpbEVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogU3RyaW5nKGZhaWxFcnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBmYWlsRXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3b3JrZmxvd1N0YXJ0ZWRBdCA9ICt3b3JrZmxvd1J1bi5zdGFydGVkQXQ7XG5cbiAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1blN0YXR1cyh3b3JrZmxvd1J1bi5zdGF0dXMpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93U3RhcnRlZEF0KHdvcmtmbG93U3RhcnRlZEF0KSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmICh3b3JrZmxvd1J1bi5zdGF0dXMgIT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgICAgICAgLy8gV29ya2Zsb3cgaGFzIGFscmVhZHkgY29tcGxldGVkIG9yIGZhaWxlZCwgc28gd2UgY2FuIHNraXAgaXRcbiAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgJ1dvcmtmbG93IGFscmVhZHkgY29tcGxldGVkIG9yIGZhaWxlZCwgc2tpcHBpbmcnLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB3b3JrZmxvd1J1bi5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGZvciBgY2FuY2VsYCwgd2UgYWN0dWFsbHkgd2FudCB0byBwcm9wYWdhdGUgYSBXb3JrZmxvd0NhbmNlbGxlZCBldmVudFxuICAgICAgICAgICAgICAgICAgLy8gaW5zaWRlIHRoZSB3b3JrZmxvdyBjb250ZXh0IHNvIHRoZSB1c2VyIGNhbiBncmFjZWZ1bGx5IGV4aXQuIHRoaXMgaXMgU0lHVEVSTVxuICAgICAgICAgICAgICAgICAgLy8gVE9ETzogZnVydGhlcm1vcmUsIHRoZXJlIHNob3VsZCBiZSBhIHRpbWVvdXQgb3IgYSB3YXkgdG8gZm9yY2UgY2FuY2VsIFNJR0tJTExcbiAgICAgICAgICAgICAgICAgIC8vIHNvIHRoYXQgd2UgYWN0dWFsbHkgZXhpdCBoZXJlIHdpdGhvdXQgcmVwbGF5aW5nIHRoZSB3b3JrZmxvdyBhdCBhbGwsIGluIHRoZSBjYXNlXG4gICAgICAgICAgICAgICAgICAvLyB0aGUgcmVwbGF5aW5nIHRoZSB3b3JrZmxvdyBpcyBpdHNlbGYgZmFpbGluZy5cblxuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIExvYWQgYWxsIGV2ZW50cyBpbnRvIG1lbW9yeSBiZWZvcmUgcnVubmluZy5cbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSBnb3QgcHJlLWxvYWRlZCBldmVudHMgZnJvbSB0aGUgcnVuX3N0YXJ0ZWQgcmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgLy8gc2tpcCB0aGUgZXZlbnRzLmxpc3Qgcm91bmQtdHJpcCB0byByZWR1Y2UgVFRGQi5cbiAgICAgICAgICAgICAgICBsZXQgZXZlbnRzOiBFdmVudFtdO1xuICAgICAgICAgICAgICAgIGxldCBldmVudHNDdXJzb3I6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGlmIChwcmVsb2FkZWRFdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzID0gcHJlbG9hZGVkRXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICBldmVudHNDdXJzb3IgPSBwcmVsb2FkZWRFdmVudHNDdXJzb3I7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRFdmVudHMgPSBhd2FpdCBnZXRXb3JrZmxvd1J1bkV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBldmVudHMgPSBsb2FkZWRFdmVudHMuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICBldmVudHNDdXJzb3IgPSBsb2FkZWRFdmVudHMuY3Vyc29yO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgaWYgKGlzV29ybGRDb250cmFjdEVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgd29ybGQgY29udHJhY3QgZXJyb3Igd2hpbGUgbG9hZGluZyB3b3JrZmxvdyBldmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuV09STERfQ09OVFJBQ1RfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2ZhaWxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChmYWlsRXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgRW50aXR5Q29uZmxpY3RFcnJvci5pcyhmYWlsRXJyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgUnVuRXhwaXJlZEVycm9yLmlzKGZhaWxFcnIpXG4gICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihmYWlsRXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIHJlY29yZGluZyB3b3JrZmxvdyBmYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbEVyciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZmFpbEVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogU3RyaW5nKGZhaWxFcnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBmYWlsRXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUaGUgbWF0ZXJpYWxpemVkIHJ1biByZXR1cm5lZCBieSBydW5fc3RhcnRlZCBjYW4gcmFjZSBhXG4gICAgICAgICAgICAgICAgLy8gdGVybWluYWwgZXZlbnQgaW4gdGhlIGxvYWRlZCBzbmFwc2hvdC4gRG8gbm90IHJlcGxheSBhIHJ1blxuICAgICAgICAgICAgICAgIC8vIHdob3NlIGV2ZW50IGxvZyBhbHJlYWR5IGVzdGFibGlzaGVzIGl0cyB0ZXJtaW5hbCBvdXRjb21lLlxuICAgICAgICAgICAgICAgIGlmIChoYXNSZWNvcmRlZFRlcm1pbmFsUnVuRXZlbnQoZXZlbnRzLCBydW5JZCkpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgYW55IGVsYXBzZWQgd2FpdHMgYW5kIGNyZWF0ZSB3YWl0X2NvbXBsZXRlZCBldmVudHNcbiAgICAgICAgICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgICAgICAgICAgLy8gUHJlLWNvbXB1dGUgY29tcGxldGVkIGNvcnJlbGF0aW9uIElEcyBmb3IgTyhuKSBsb29rdXAgaW5zdGVhZCBvZiBPKG7CsilcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wbGV0ZWRXYWl0SWRzID0gbmV3IFNldChcbiAgICAgICAgICAgICAgICAgIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChlKSA9PiBlLmV2ZW50VHlwZSA9PT0gJ3dhaXRfY29tcGxldGVkJylcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoZSkgPT4gZS5jb3JyZWxhdGlvbklkKVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAvLyBDb2xsZWN0IGFsbCB3YWl0cyB0aGF0IG5lZWQgY29tcGxldGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IHdhaXRzVG9Db21wbGV0ZSA9IGV2ZW50c1xuICAgICAgICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAgIGVcbiAgICAgICAgICAgICAgICAgICAgKTogZSBpcyBFeHRyYWN0PEV2ZW50LCB7IGV2ZW50VHlwZTogJ3dhaXRfY3JlYXRlZCcgfT4gJiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29ycmVsYXRpb25JZDogc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICB9ID0+XG4gICAgICAgICAgICAgICAgICAgICAgZS5ldmVudFR5cGUgPT09ICd3YWl0X2NyZWF0ZWQnICYmXG4gICAgICAgICAgICAgICAgICAgICAgZS5jb3JyZWxhdGlvbklkICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAhY29tcGxldGVkV2FpdElkcy5oYXMoZS5jb3JyZWxhdGlvbklkKSAmJlxuICAgICAgICAgICAgICAgICAgICAgIG5vdyA+PSAoZS5ldmVudERhdGEucmVzdW1lQXQgYXMgRGF0ZSkuZ2V0VGltZSgpXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAubWFwKChlKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICd3YWl0X2NvbXBsZXRlZCcgYXMgY29uc3QsXG4gICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgY29ycmVsYXRpb25JZDogZS5jb3JyZWxhdGlvbklkLFxuICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bWVBdDogZS5ldmVudERhdGEucmVzdW1lQXQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYWxsIHdhaXRfY29tcGxldGVkIGV2ZW50c1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgd2FpdEV2ZW50IG9mIHdhaXRzVG9Db21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgY29uc3Qgd2FpdExvZzogTXV0YWJsZUV2ZW50TG9nID0ge1xuICAgICAgICAgICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogZXZlbnRzQ3Vyc29yID8/IG51bGwsXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgd2l0aFByZWNvbmRpdGlvblJldHJ5KFxuICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIHdhaXRMb2csXG4gICAgICAgICAgICAgICAgICAgICAgKHN0YXRlVXBkYXRlZEF0KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgd29ybGQuZXZlbnRzLmNyZWF0ZShydW5JZCwgd2FpdEV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVVcGRhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChFbnRpdHlDb25mbGljdEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oJ1dhaXQgYWxyZWFkeSBjb21wbGV0ZWQsIHNraXBwaW5nJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3JyZWxhdGlvbklkOiB3YWl0RXZlbnQuY29ycmVsYXRpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZWxvYWRzIGluc2lkZSB0aGUgZ3VhcmQgbWF5IGhhdmUgYWR2YW5jZWQgdGhlIGN1cnNvci5cbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzQ3Vyc29yID0gd2FpdExvZy5jdXJzb3I7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHdhaXRzVG9Db21wbGV0ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGUgZXZlbnQgbGlzdCBhYm92ZSBtYXkgYmUgc3RhbGUgYnkgdGhlIHRpbWUgYW4gZWxhcHNlZFxuICAgICAgICAgICAgICAgICAgLy8gd2FpdCBpcyBjb21taXR0ZWQuIExvYWQgb25seSBldmVudHMgYWZ0ZXIgdGhlIG9yaWdpbmFsXG4gICAgICAgICAgICAgICAgICAvLyBzbmFwc2hvdCBjdXJzb3Igc28gY29uY3VycmVudCBkdXJhYmxlIGV2ZW50cywgc3VjaCBhc1xuICAgICAgICAgICAgICAgICAgLy8gaG9va19yZWNlaXZlZCwga2VlcCB0aGVpciBvcmRlcmluZyByZWxhdGl2ZSB0b1xuICAgICAgICAgICAgICAgICAgLy8gd2FpdF9jb21wbGV0ZWQuIEZhbGwgYmFjayB0byBhIGZ1bGwgcmVsb2FkIGZvciBvbGRlciB3b3JsZHNcbiAgICAgICAgICAgICAgICAgIC8vIHRoYXQgY2Fubm90IGdpdmUgdXMgYSBzdGFibGUgY3Vyc29yLlxuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50c0N1cnNvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdFdmVudHMgPSBhd2FpdCBnZXRXb3JrZmxvd1J1bkV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICBldmVudHNDdXJzb3JcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcGxldGVkV2FpdElkc0FmdGVyQ3Vyc29yID0gbmV3IFNldChcbiAgICAgICAgICAgICAgICAgICAgICBuZXdFdmVudHMuZXZlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChlKSA9PiBlLmV2ZW50VHlwZSA9PT0gJ3dhaXRfY29tcGxldGVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGUpID0+IGUuY29ycmVsYXRpb25JZClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2F3QWxsV2FpdENvbXBsZXRpb25zID0gd2FpdHNUb0NvbXBsZXRlLmV2ZXJ5KFxuICAgICAgICAgICAgICAgICAgICAgICh3YWl0RXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWRXYWl0SWRzQWZ0ZXJDdXJzb3IuaGFzKHdhaXRFdmVudC5jb3JyZWxhdGlvbklkKVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzYXdBbGxXYWl0Q29tcGxldGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ0lkcyA9IG5ldyBTZXQoXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMubWFwKChldmVudCkgPT4gZXZlbnQuZXZlbnRJZClcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgbmV3RXZlbnRzLmV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFleGlzdGluZ0lkcy5oYXMoZXZlbnQuZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdJZHMuYWRkKGV2ZW50LmV2ZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlZEV2ZW50cyA9IGF3YWl0IGdldFdvcmtmbG93UnVuRXZlbnRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWRcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cyA9IGxvYWRlZEV2ZW50cy5ldmVudHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlZEV2ZW50cyA9IGF3YWl0IGdldFdvcmtmbG93UnVuRXZlbnRzKFxuICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuLnJ1bklkXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cyA9IGxvYWRlZEV2ZW50cy5ldmVudHM7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIEEgY29uY3VycmVudCB0ZXJtaW5hbCB3cml0ZSBtYXkgaGF2ZSBsYW5kZWQgd2hpbGVcbiAgICAgICAgICAgICAgICAgIC8vIGNvbW1pdHRpbmcgYW4gZWxhcHNlZCB3YWl0IGFuZCByZWZyZXNoaW5nIHRoZSBzbmFwc2hvdC5cbiAgICAgICAgICAgICAgICAgIGlmIChoYXNSZWNvcmRlZFRlcm1pbmFsUnVuRXZlbnQoZXZlbnRzLCBydW5JZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFJlc29sdmUgdGhlIGVuY3J5cHRpb24ga2V5IGZvciB0aGlzIHJ1bidzIGRlcGxveW1lbnRcbiAgICAgICAgICAgICAgICBjb25zdCByYXdLZXkgPVxuICAgICAgICAgICAgICAgICAgYXdhaXQgd29ybGQuZ2V0RW5jcnlwdGlvbktleUZvclJ1bj8uKHdvcmtmbG93UnVuKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmNyeXB0aW9uS2V5ID0gcmF3S2V5XG4gICAgICAgICAgICAgICAgICA/IGF3YWl0IGltcG9ydEtleShyYXdLZXkpXG4gICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgIC8vIC0tLSBVc2VyIGNvZGUgZXhlY3V0aW9uIC0tLVxuICAgICAgICAgICAgICAgIC8vIE9ubHkgZXJyb3JzIGZyb20gcnVuV29ya2Zsb3coKSAodXNlciB3b3JrZmxvdyBjb2RlKSBzaG91bGRcbiAgICAgICAgICAgICAgICAvLyBwcm9kdWNlIHJ1bl9mYWlsZWQuIEluZnJhc3RydWN0dXJlIGVycm9ycyAobmV0d29yaywgc2VydmVyKVxuICAgICAgICAgICAgICAgIC8vIG11c3QgcHJvcGFnYXRlIHRvIHRoZSBxdWV1ZSBoYW5kbGVyIGZvciBhdXRvbWF0aWMgcmV0cnkuXG4gICAgICAgICAgICAgICAgbGV0IHdvcmtmbG93UmVzdWx0OiB1bmtub3duO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICB3b3JrZmxvd1Jlc3VsdCA9IGF3YWl0IHRyYWNlKFxuICAgICAgICAgICAgICAgICAgICAnd29ya2Zsb3cucmVwbGF5JyxcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIGFzeW5jIChyZXBsYXlTcGFuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVwbGF5U3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFdmVudHNDb3VudChldmVudHMubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcnVuV29ya2Zsb3coXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd0NvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bixcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY3J5cHRpb25LZXlcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgLy8gV29ya2Zsb3dTdXNwZW5zaW9uIGlzIG5vcm1hbCBjb250cm9sIGZsb3cg4oCUIG5vdCBhbiBlcnJvclxuICAgICAgICAgICAgICAgICAgaWYgKFdvcmtmbG93U3VzcGVuc2lvbi5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1c3BlbnNpb25NZXNzYWdlID0gYnVpbGRXb3JrZmxvd1N1c3BlbnNpb25NZXNzYWdlKFxuICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIGVyci5zdGVwQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgZXJyLmhvb2tDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICBlcnIud2FpdENvdW50XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdXNwZW5zaW9uTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZGVidWcoc3VzcGVuc2lvbk1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRWFjaCBldmVudCBjcmVhdGlvbiBpbnNpZGUgaGFuZGxlU3VzcGVuc2lvbiBjYXJyaWVzIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBsb2FkZWQgc25hcHNob3QncyBgc3RhdGVVcGRhdGVkQXRgOyBvbiBhIHN0YWxlICg0MTIpXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlamVjdGlvbiB0aGUgZ3VhcmQgcmVsb2FkcyB0aGlzIGxvZyBpbiBwbGFjZSBhbmQgcmV0cmllcy5cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VzcGVuc2lvbkxvZzogTXV0YWJsZUV2ZW50TG9nID0ge1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6IGV2ZW50c0N1cnNvciA/PyBudWxsLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBBd2FpdGVkPFJldHVyblR5cGU8dHlwZW9mIGhhbmRsZVN1c3BlbnNpb24+PjtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBhd2FpdCBoYW5kbGVTdXNwZW5zaW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1c3BlbnNpb246IGVycixcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuOiB3b3JrZmxvd1J1bixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudExvZzogc3VzcGVuc2lvbkxvZyxcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoc3VzcGVuc2lvbkVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGd1YXJkIGV4aGF1c3RlZCBpdHMgcmVsb2FkcyBvbiBhIHN0YWxlIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRpb24uIFNjaGVkdWxlIGFuIGV4cGxpY2l0IGltbWVkaWF0ZSByZS1pbnZvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgLy8gKGEgcmV0aHJvdyByZWxpZXMgb24gcXVldWUgcmVkZWxpdmVyeSkgc28gYSBmcmVzaFxuICAgICAgICAgICAgICAgICAgICAgIC8vIHJlcGxheSBvYnNlcnZlcyB0aGUgbmV3ZXIgZXZlbnQuXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFByZWNvbmRpdGlvbkZhaWxlZEVycm9yLmlzKHN1c3BlbnNpb25FcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ1N1c3BlbnNpb24gZXZlbnQgY3JlYXRpb24gZXhoYXVzdGVkIHByZWNvbmRpdGlvbiByZXRyaWVzOyByZS1pbnZva2luZyB3aXRoIGEgZnJlc2ggcmVwbGF5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdGltZW91dFNlY29uZHM6IDAgfTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgc3VzcGVuc2lvbkVycm9yO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC50aW1lb3V0U2Vjb25kcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdGltZW91dFNlY29uZHM6IHJlc3VsdC50aW1lb3V0U2Vjb25kcyB9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU3VzcGVuc2lvbiBoYW5kbGVkLCBubyBmdXJ0aGVyIHdvcmsgbmVlZGVkXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gVHJhbnNpZW50IGluZnJhc3RydWN0dXJlIGZhaWx1cmVzIHRhbGtpbmcgdG8gdGhlXG4gICAgICAgICAgICAgICAgICAvLyB3b3JsZCAod29ya2Zsb3ctc2VydmVyKSDigJQgYW4gZXhoYXVzdGVkIFJldHJ5QWdlbnRcbiAgICAgICAgICAgICAgICAgIC8vIChVTkRfRVJSX1JFUV9SRVRSWSBmcm9tIGEgc3VzdGFpbmVkIDQyOS81MDMgc3Rvcm0pLFxuICAgICAgICAgICAgICAgICAgLy8gYSBkcm9wcGVkIHNvY2tldCwgYSBjb25uZWN0L0ROUyBmYWlsdXJlLCBvciBhIGNsaWVudFxuICAgICAgICAgICAgICAgICAgLy8gdGltZW91dCDigJQgbXVzdCBOT1QgZmFpbCB0aGUgcnVuLiBSZXRocm93IHNvIHRoZSBxdWV1ZVxuICAgICAgICAgICAgICAgICAgLy8gcmVkZWxpdmVycyBhbmQgYSBmcmVzaCBpbnZvY2F0aW9uIHJldHJpZXMgdGhlIHJlcGxheVxuICAgICAgICAgICAgICAgICAgLy8gb25jZSB0aGUgYmFja2VuZCByZWNvdmVycy4gVGhlIEB2ZXJjZWwvcXVldWUgaGFuZGxlclxuICAgICAgICAgICAgICAgICAgLy8gYXBwbGllcyBhIGZhc3QgKDFz4oaSNjBzKSBiYWNrb2ZmIGJ5IGRlbGl2ZXJ5IGNvdW50LFxuICAgICAgICAgICAgICAgICAgLy8gYXZvaWRpbmcgdGhlIH41bWluIGRlZmF1bHQgdmlzaWJpbGl0eS10aW1lb3V0IHJlZHJpdmVcbiAgICAgICAgICAgICAgICAgIC8vIChhbmQgbmV2ZXIga2lsbGluZyB0aGUgcHJvY2VzcyB2aWEgcnVuX2ZhaWxlZCkuXG4gICAgICAgICAgICAgICAgICBpZiAoaXNSZXRyeWFibGVXb3JsZEVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICdUcmFuc2llbnQgd29ybGQgZXJyb3IgZHVyaW5nIHJlcGxheTsgcmVkZWxpdmVyaW5nIHZpYSBxdWV1ZSBpbnN0ZWFkIG9mIGZhaWxpbmcgdGhlIHJ1bicsXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JOYW1lOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5uYW1lIDogJ1Vua25vd25FcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGl2ZXJ5QXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgbGV0IHRlcm1pbmFsRXJyb3IgPSBlcnI7XG4gICAgICAgICAgICAgICAgICBpZiAoUmVwbGF5RGl2ZXJnZW5jZUVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGl2ZXJnZW5jZUNvdW50ID0gKHJlcGxheURpdmVyZ2VuY2U/LmNvdW50ID8/IDApICsgMTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGl2ZXJnZW5jZUNvdW50IDw9IFJFUExBWV9ESVZFUkdFTkNFX01BWF9SRVRSSUVTKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1dvcmtmbG93IHJlcGxheSBkaXZlcmdlZDsgcXVldWVpbmcgYSByZWNvdmVyeSByZXBsYXkgYmVmb3JlIGRlY2xhcmluZyB0aGUgZXZlbnQgbG9nIGNvcnJ1cHRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5SRVBMQVlfRElWRVJHRU5DRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGl2ZXJnZW5jZUV2ZW50SWQ6IGVyci5ldmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwcmlvckRpdmVyZ2VuY2VFdmVudElkOiByZXBsYXlEaXZlcmdlbmNlPy5ldmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkaXZlcmdlbmNlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGl2ZXJ5QXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4UmVjb3ZlcnlSZXBsYXlzOiBSRVBMQVlfRElWRVJHRU5DRV9NQVhfUkVUUklFUyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHF1ZXVlTWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0V29ya2Zsb3dRdWV1ZU5hbWUod29ya2Zsb3dOYW1lLCBuYW1lc3BhY2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhY2VDYXJyaWVyOiB0cmFjZUNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsYXlEaXZlcmdlbmNlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRJZDogZXJyLmV2ZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IGRpdmVyZ2VuY2VDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveW1lbnRJZDogd29ya2Zsb3dSdW4uZGVwbG95bWVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5zcGVjVmVyc2lvbiA/PyBTUEVDX1ZFUlNJT05fTEVHQUNZLFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGVybWluYWxFcnJvciA9IG5ldyBDb3JydXB0ZWRFdmVudExvZ0Vycm9yKFxuICAgICAgICAgICAgICAgICAgICAgIGBXb3JrZmxvdyByZXBsYXkgZGl2ZXJnZWQgJHtkaXZlcmdlbmNlQ291bnR9IHRpbWVzIGFmdGVyICR7UkVQTEFZX0RJVkVSR0VOQ0VfTUFYX1JFVFJJRVN9IHJlY292ZXJ5IHJlcGxheXM7IGxhdGVzdCBkaXZlcmdlbnQgZXZlbnQgd2FzICR7ZXJyLmV2ZW50SWR9LiBMYXN0IGRpdmVyZ2VuY2U6ICR7ZXJyLm1lc3NhZ2V9YCxcbiAgICAgICAgICAgICAgICAgICAgICB7IGNhdXNlOiBlcnIgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgdXNlciBjb2RlIGVycm9yIG9yIGEgdGVybWluYWxcbiAgICAgICAgICAgICAgICAgIC8vIFdvcmtmbG93UnVudGltZUVycm9yLiBGYWlsIHRoZSB3b3JrZmxvdyBydW4uXG5cbiAgICAgICAgICAgICAgICAgIC8vIFJlY29yZCBleGNlcHRpb24gZm9yIE9URUwgZXJyb3IgdHJhY2tpbmdcbiAgICAgICAgICAgICAgICAgIGlmICh0ZXJtaW5hbEVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgc3Bhbj8ucmVjb3JkRXhjZXB0aW9uPy4odGVybWluYWxFcnJvcik7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRFcnJvciA9XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG5vcm1hbGl6ZVVua25vd25FcnJvcih0ZXJtaW5hbEVycm9yKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTmFtZSA9XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRFcnJvci5uYW1lIHx8IGdldEVycm9yTmFtZSh0ZXJtaW5hbEVycm9yKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IG5vcm1hbGl6ZWRFcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgbGV0IGVycm9yU3RhY2sgPVxuICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkRXJyb3Iuc3RhY2sgfHwgZ2V0RXJyb3JTdGFjayh0ZXJtaW5hbEVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgLy8gUmVtYXAgZXJyb3Igc3RhY2sgdXNpbmcgc291cmNlIG1hcHMgdG8gc2hvdyBvcmlnaW5hbCBzb3VyY2UgbG9jYXRpb25zXG4gICAgICAgICAgICAgICAgICBpZiAoZXJyb3JTdGFjaykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWROYW1lID0gcGFyc2VXb3JrZmxvd05hbWUod29ya2Zsb3dOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZW5hbWUgPVxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZE5hbWU/Lm1vZHVsZVNwZWNpZmllciB8fCB3b3JrZmxvd05hbWU7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yU3RhY2sgPSByZW1hcEVycm9yU3RhY2soXG4gICAgICAgICAgICAgICAgICAgICAgZXJyb3JTdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd0NvZGVcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gQ2xhc3NpZnkgdGhlIGVycm9yOiBXb3JrZmxvd1J1bnRpbWVFcnJvciBpbmRpY2F0ZXNcbiAgICAgICAgICAgICAgICAgIC8vIGFuIFNESy9ydW50aW1lIGlzc3VlLCBhbmQgc2VsZWN0ZWQgc3ViY2xhc3NlcyB1c2VcbiAgICAgICAgICAgICAgICAgIC8vIG1vcmUgc3BlY2lmaWMgY29kZXMgZm9yIGJhY2tlbmQgdHJhY2tpbmcuXG4gICAgICAgICAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPSBjbGFzc2lmeVJ1bkVycm9yKHRlcm1pbmFsRXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBydW5uaW5nIHdvcmtmbG93Jywge1xuICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yU3RhY2ssXG4gICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgLy8gRmFpbCB0aGUgd29ya2Zsb3cgcnVuIHZpYSBldmVudCAoZXZlbnQtc291cmNlZCBhcmNoaXRlY3R1cmUpXG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnJvclN0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZmFpbEVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgRW50aXR5Q29uZmxpY3RFcnJvci5pcyhmYWlsRXJyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgIFJ1bkV4cGlyZWRFcnJvci5pcyhmYWlsRXJyKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgICAnVHJpZWQgZmFpbGluZyB3b3JrZmxvdyBydW4sIGJ1dCBydW4gaGFzIGFscmVhZHkgZmluaXNoZWQuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGZhaWxFcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JDb2RlKGVycm9yQ29kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvck5hbWUoZXJyb3JOYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yTWVzc2FnZShlcnJvck1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLkVycm9yVHlwZShlcnJvck5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZmFpbEVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIHJlY29yZGluZyB3b3JrZmxvdyBmYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsRXJyIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZmFpbEVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhmYWlsRXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBmYWlsRXJyO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuU3RhdHVzKCdmYWlsZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JDb2RlKGVycm9yQ29kZSksXG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yTmFtZShlcnJvck5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvck1lc3NhZ2UoZXJyb3JNZXNzYWdlKSxcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLkVycm9yVHlwZShlcnJvck5hbWUpLFxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gLS0tIEluZnJhc3RydWN0dXJlOiBjb21wbGV0ZSB0aGUgcnVuIC0tLVxuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgb3V0c2lkZSB0aGUgdXNlci1jb2RlIHRyeS9jYXRjaCBzbyB0aGF0IGZhaWx1cmVzXG4gICAgICAgICAgICAgICAgLy8gaGVyZSAoZS5nLiwgbmV0d29yayBlcnJvcnMpIHByb3BhZ2F0ZSB0byB0aGUgcXVldWUgaGFuZGxlci5cbiAgICAgICAgICAgICAgICAvLyBydW5fY29tcGxldGVkIGNhcnJpZXMgdGhlIGxvYWRlZCBzbmFwc2hvdCdzIGBzdGF0ZVVwZGF0ZWRBdGAsXG4gICAgICAgICAgICAgICAgLy8gYnV0IGlzIGludGVudGlvbmFsbHkgTk9UIHJldHJpZWQgaW4gcGxhY2UgKG5vXG4gICAgICAgICAgICAgICAgLy8gd2l0aFByZWNvbmRpdGlvblJldHJ5KSBvbiBhIHN0YWxlICg0MTIpIHJlamVjdGlvbjogYHJlc3VsdGBcbiAgICAgICAgICAgICAgICAvLyB3YXMgY29tcHV0ZWQgYnkgdGhpcyByZXBsYXksIHNvIGEgbmV3ZXIgb3V0LW9mLWJhbmQgZXZlbnRcbiAgICAgICAgICAgICAgICAvLyBsYW5kaW5nIGFmdGVyIHRoZSBzbmFwc2hvdCBtdXN0IGZvcmNlIGEgKmZyZXNoIHJlcGxheSpcbiAgICAgICAgICAgICAgICAvLyAod2hpY2ggbWF5IG9ic2VydmUgaXQgYW5kIHByb2R1Y2UgYSBkaWZmZXJlbnQgcmVzdWx0KSwgbm90XG4gICAgICAgICAgICAgICAgLy8gcmUtY29tbWl0IHRoZSBzdGFsZSByZXN1bHQuIE9uIDQxMiB0aGUgY2F0Y2ggYmVsb3cgc2NoZWR1bGVzXG4gICAgICAgICAgICAgICAgLy8gYW4gZXhwbGljaXQgaW1tZWRpYXRlIHJlLWludm9jYXRpb24gaW5zdGVhZC5cbiAgICAgICAgICAgICAgICAvLyAocnVuX2ZhaWxlZCBpcyBkZWxpYmVyYXRlbHkgbGVmdCB1bmd1YXJkZWQgYW5kIGZhaWxzIG9wZW46XG4gICAgICAgICAgICAgICAgLy8gYSBzcHVyaW91cyByZS1ydW4gaXMgc2FmZSwgYSBzcHVyaW91cyBjb21wbGV0aW9uIGlzIG5vdCwgYW5kXG4gICAgICAgICAgICAgICAgLy8gdGhlIGxvYWRlZCBldmVudCBsb2cgaXMgbm90IGluIHNjb3BlIG9uIHRoYXQgY2F0Y2ggcGF0aC4pXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiB3b3JrZmxvd1Jlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgICAgICAgIHN0YXRlVXBkYXRlZEF0OiBzdGF0ZVVwZGF0ZWRBdEZvckNyZWF0ZShldmVudHMpLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgaWYgKFByZWNvbmRpdGlvbkZhaWxlZEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICdydW5fY29tcGxldGVkIHJlamVjdGVkIGFzIHN0YWxlOyByZS1pbnZva2luZyB3aXRoIGEgZnJlc2ggcmVwbGF5JyxcbiAgICAgICAgICAgICAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdGltZW91dFNlY29uZHM6IDAgfTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmIChFbnRpdHlDb25mbGljdEVycm9yLmlzKGVycikgfHwgUnVuRXhwaXJlZEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICdUcmllZCBjb21wbGV0aW5nIHdvcmtmbG93IHJ1biwgYnV0IHJ1biBoYXMgYWxyZWFkeSBmaW5pc2hlZC4nLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5TdGF0dXMoJ2NvbXBsZXRlZCcpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXZlbnRzQ291bnQoZXZlbnRzLmxlbmd0aCksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7IC8vIEVuZCB0cmFjZVxuICAgICAgICAgIH1cbiAgICAgICAgKTsgLy8gRW5kIHdpdGhXb3JrZmxvd0JhZ2dhZ2VcbiAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICBpZiAocmVwbGF5VGltZW91dCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChyZXBsYXlUaW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgfSk7IC8vIEVuZCB3aXRoVHJhY2VDb250ZXh0XG4gICAgfVxuICApO1xuXG4gIHJldHVybiB3aXRoSGVhbHRoQ2hlY2soaGFuZGxlciwgd29ybGRTcGVjVmVyc2lvbik7XG59XG5cbi8vIHRoaXMgaXMgYSBuby1vcCBwbGFjZWhvbGRlciBhcyB0aGUgY2xpZW50IGlzXG4vLyBleHBlY3RpbmcgdGhpcyB0byBiZSBwcmVzZW50IGJ1dCB3ZSBhcmVuJ3QgYWN0dWFsbHkgdXNpbmcgaXRcbmV4cG9ydCBmdW5jdGlvbiBydW5TdGVwKCkge31cbiIsICJpbXBvcnQge1xuICBFUlJPUl9TTFVHUyxcbiAgUmVwbGF5RGl2ZXJnZW5jZUVycm9yLFxuICBXb3JrZmxvd05vdFJlZ2lzdGVyZWRFcnJvcixcbiAgV29ya2Zsb3dSdW50aW1lRXJyb3IsXG59IGZyb20gJ0B3b3JrZmxvdy9lcnJvcnMnO1xuaW1wb3J0IHsgY3JlYXRlV29ya2Zsb3dCYXNlVXJsLCB3aXRoUmVzb2x2ZXJzIH0gZnJvbSAnQHdvcmtmbG93L3V0aWxzJztcbmltcG9ydCB7IHBhcnNlV29ya2Zsb3dOYW1lIH0gZnJvbSAnQHdvcmtmbG93L3V0aWxzL3BhcnNlLW5hbWUnO1xuaW1wb3J0IHR5cGUgeyBFdmVudCwgV29ya2Zsb3dSdW4gfSBmcm9tICdAd29ya2Zsb3cvd29ybGQnO1xuaW1wb3J0ICogYXMgbmFub2lkIGZyb20gJ25hbm9pZCc7XG5pbXBvcnQgeyBtb25vdG9uaWNGYWN0b3J5IH0gZnJvbSAndWxpZCc7XG5pbXBvcnQgdHlwZSB7IENyeXB0b0tleSB9IGZyb20gJy4vZW5jcnlwdGlvbi5qcyc7XG5pbXBvcnQgeyBFdmVudENvbnN1bWVyUmVzdWx0LCBFdmVudHNDb25zdW1lciB9IGZyb20gJy4vZXZlbnRzLWNvbnN1bWVyLmpzJztcbmltcG9ydCB0eXBlIHsgUXVldWVJdGVtIH0gZnJvbSAnLi9nbG9iYWwuanMnO1xuaW1wb3J0IHsgRU5PVFNVUCwgV29ya2Zsb3dTdXNwZW5zaW9uIH0gZnJvbSAnLi9nbG9iYWwuanMnO1xuaW1wb3J0IHsgcnVudGltZUxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyLmpzJztcbmltcG9ydCB0eXBlIHsgV29ya2Zsb3dPcmNoZXN0cmF0b3JDb250ZXh0IH0gZnJvbSAnLi9wcml2YXRlLmpzJztcbmltcG9ydCB7IGdldFBvcnRMYXp5IH0gZnJvbSAnLi9ydW50aW1lL2dldC1wb3J0LWxhenkuanMnO1xuaW1wb3J0IHtcbiAgZGVoeWRyYXRlV29ya2Zsb3dSZXR1cm5WYWx1ZSxcbiAgaHlkcmF0ZVdvcmtmbG93QXJndW1lbnRzLFxufSBmcm9tICcuL3NlcmlhbGl6YXRpb24uanMnO1xuaW1wb3J0IHsgY3JlYXRlVXNlU3RlcCB9IGZyb20gJy4vc3RlcC5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0ZXBIeWRyYXRpb25DYWNoZSB9IGZyb20gJy4vc3RlcC1oeWRyYXRpb24tY2FjaGUuanMnO1xuaW1wb3J0IHtcbiAgQk9EWV9JTklUX1NZTUJPTCxcbiAgU1RBQkxFX1VMSUQsXG4gIFdPUktGTE9XX0NSRUFURV9IT09LLFxuICBXT1JLRkxPV19HRVRfU1RSRUFNX0lELFxuICBXT1JLRkxPV19TTEVFUCxcbiAgV09SS0ZMT1dfVVNFX1NURVAsXG59IGZyb20gJy4vc3ltYm9scy5qcyc7XG5pbXBvcnQgKiBhcyBBdHRyaWJ1dGUgZnJvbSAnLi90ZWxlbWV0cnkvc2VtYW50aWMtY29udmVudGlvbnMuanMnO1xuaW1wb3J0IHsgdHJhY2UgfSBmcm9tICcuL3RlbGVtZXRyeS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JrZmxvd1J1blN0cmVhbUlkIH0gZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IGNyZWF0ZUNvbnRleHQgfSBmcm9tICcuL3ZtL2luZGV4LmpzJztcbmltcG9ydCB7IHJ1bkNhY2hlZFdvcmtmbG93U2NyaXB0IH0gZnJvbSAnLi92bS9zY3JpcHQtY2FjaGUuanMnO1xuaW1wb3J0IHR5cGUgeyBXb3JrZmxvd01ldGFkYXRhIH0gZnJvbSAnLi93b3JrZmxvdy9nZXQtd29ya2Zsb3ctbWV0YWRhdGEuanMnO1xuaW1wb3J0IHsgV09SS0ZMT1dfQ09OVEVYVF9TWU1CT0wgfSBmcm9tICcuL3dvcmtmbG93L2dldC13b3JrZmxvdy1tZXRhZGF0YS5qcyc7XG5pbXBvcnQgeyBjcmVhdGVDcmVhdGVIb29rIH0gZnJvbSAnLi93b3JrZmxvdy9ob29rLmpzJztcbmltcG9ydCB7IGNyZWF0ZVNsZWVwIH0gZnJvbSAnLi93b3JrZmxvdy9zbGVlcC5qcyc7XG5cbi8qKlxuICogTG9ncyBhIHdhcm5pbmcgd2hlbiBhIHdvcmtmbG93IHJ1biBjb21wbGV0ZXMgb3IgZmFpbHMgd2l0aCB1bmNvbW1pdHRlZFxuICogb3BlcmF0aW9ucyBzdGlsbCBpbiB0aGUgaW52b2NhdGlvbnMgcXVldWUuIFRoaXMgdHlwaWNhbGx5IGluZGljYXRlcyB0aGVcbiAqIHVzZXIgZm9yZ290IHRvIGBhd2FpdGAgYSBzdGVwLCBob29rLCBvciBzbGVlcCBjYWxsLlxuICovXG5mdW5jdGlvbiB3YXJuUGVuZGluZ1F1ZXVlSXRlbXMoXG4gIHJ1bklkOiBzdHJpbmcsXG4gIHBlbmRpbmdRdWV1ZTogTWFwPHN0cmluZywgUXVldWVJdGVtPixcbiAgb3V0Y29tZTogJ2NvbXBsZXRlZCcgfCAnZmFpbGVkJ1xuKTogdm9pZCB7XG4gIC8vIEZpbHRlciBvdXQgaG9va3MgdGhhdCBhcmUgZWl0aGVyIGFscmVhZHkgY3JlYXRlZCAoYWxpdmUsIHdhaXRpbmcgZm9yIHBheWxvYWRzKVxuICAvLyBvciBleHBsaWNpdGx5IGRpc3Bvc2VkIOKAlCBib3RoIGFyZSBiZW5pZ24gc2luY2UgdGhlIGJhY2tlbmQgYXV0by1kaXNwb3Nlc1xuICAvLyBhbGwgaG9va3Mgd2hlbiBhIHJ1biByZWFjaGVzIGEgdGVybWluYWwgc3RhdGVcbiAgY29uc3QgaXRlbXMgPSBbLi4ucGVuZGluZ1F1ZXVlLnZhbHVlcygpXS5maWx0ZXIoXG4gICAgKGl0ZW0pID0+ICEoaXRlbS50eXBlID09PSAnaG9vaycgJiYgKGl0ZW0uaGFzQ3JlYXRlZEV2ZW50IHx8IGl0ZW0uZGlzcG9zZWQpKVxuICApO1xuICBpZiAoaXRlbXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgY29uc3QgZGV0YWlscyA9IGl0ZW1zLm1hcCgoaXRlbSkgPT4ge1xuICAgIHN3aXRjaCAoaXRlbS50eXBlKSB7XG4gICAgICBjYXNlICdzdGVwJzpcbiAgICAgICAgcmV0dXJuIGBzdGVwIFwiJHtpdGVtLnN0ZXBOYW1lfVwiYDtcbiAgICAgIGNhc2UgJ2hvb2snOlxuICAgICAgICByZXR1cm4gYGhvb2sgXCIke2l0ZW0udG9rZW59XCJgO1xuICAgICAgY2FzZSAnd2FpdCc6XG4gICAgICAgIHJldHVybiAnc2xlZXAnO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGB1bmtub3duICgkeyhpdGVtIGFzIHsgdHlwZTogc3RyaW5nIH0pLnR5cGV9KWA7XG4gICAgfVxuICB9KTtcblxuICBydW50aW1lTG9nZ2VyLndhcm4oXG4gICAgYFdvcmtmbG93IHJ1biAke291dGNvbWV9IHdpdGggJHtpdGVtcy5sZW5ndGh9IHVuY29tbWl0dGVkIG9wZXJhdGlvbihzKTogJHtkZXRhaWxzLmpvaW4oJywgJyl9LiBgICtcbiAgICAgICdEaWQgeW91IGZvcmdldCB0byBgYXdhaXRgIGEgc3RlcCwgaG9vaywgb3Igc2xlZXAgY2FsbD8nLFxuICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQgfVxuICApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuV29ya2Zsb3coXG4gIHdvcmtmbG93Q29kZTogc3RyaW5nLFxuICB3b3JrZmxvd1J1bjogV29ya2Zsb3dSdW4sXG4gIGV2ZW50czogRXZlbnRbXSxcbiAgZW5jcnlwdGlvbktleTogQ3J5cHRvS2V5IHwgdW5kZWZpbmVkLFxuICAvKipcbiAgICogT3B0aW9uYWwgcGVyLXJ1biBjYWNoZSBmb3IgaHlkcmF0ZWQgc3RlcCByZXR1cm4gdmFsdWVzLCBvd25lZCBieSB0aGUgaW5saW5lXG4gICAqIHJlcGxheSBsb29wIHNvIGl0IHN1cnZpdmVzIGFjcm9zcyB0aGUgbG9vcCdzIGl0ZXJhdGlvbnMgKGVhY2ggb2Ygd2hpY2hcbiAgICogY3JlYXRlcyBhIGZyZXNoIGNvbnRleHQpLiBNZW1vaXplcyB0aGUgZGVjcnlwdCArIGRldmFsdWUtcGFyc2Ugb2YgY29tcGxldGVkXG4gICAqIHN0ZXAgcmVzdWx0cyB0byB0dXJuIE8oTsKyKSByZXBsYXkgaHlkcmF0aW9uIGludG8gTyhOKS4gT21pdHRlZCBieSBjYWxsZXJzXG4gICAqIHRoYXQgcmVwbGF5IG9ubHkgb25jZSAodGhlbiB0aGVyZSBpcyBub3RoaW5nIHRvIHJldXNlKS5cbiAgICovXG4gIHN0ZXBIeWRyYXRpb25DYWNoZT86IFN0ZXBIeWRyYXRpb25DYWNoZVxuKTogUHJvbWlzZTxVaW50OEFycmF5IHwgdW5rbm93bj4ge1xuICByZXR1cm4gdHJhY2UoYHdvcmtmbG93LnJ1biAke3dvcmtmbG93UnVuLndvcmtmbG93TmFtZX1gLCBhc3luYyAoc3BhbikgPT4ge1xuICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93TmFtZSh3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpLFxuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuSWQod29ya2Zsb3dSdW4ucnVuSWQpLFxuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuU3RhdHVzKHdvcmtmbG93UnVuLnN0YXR1cyksXG4gICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFdmVudHNDb3VudChldmVudHMubGVuZ3RoKSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHN0YXJ0ZWRBdCA9IHdvcmtmbG93UnVuLnN0YXJ0ZWRBdDtcbiAgICBpZiAoIXN0YXJ0ZWRBdCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgV29ya2Zsb3cgcnVuIFwiJHt3b3JrZmxvd1J1bi5ydW5JZH1cIiBoYXMgbm8gXCJzdGFydGVkQXRcIiB0aW1lc3RhbXAgKHNob3VsZCBub3QgaGFwcGVuKWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBwb3J0IGJlZm9yZSBjcmVhdGluZyBWTSBjb250ZXh0IHRvIGF2b2lkIGFzeW5jIG9wZXJhdGlvbnNcbiAgICAvLyBhZmZlY3RpbmcgdGhlIGRldGVybWluaXN0aWMgdGltZXN0YW1wXG4gICAgY29uc3QgaXNWZXJjZWwgPSBwcm9jZXNzLmVudi5WRVJDRUxfVVJMICE9PSB1bmRlZmluZWQ7XG4gICAgLy8gTG9hZCBnZXRQb3J0IGxhemlseSB0byBwcmV2ZW50IFR1cmJvcGFjayBmcm9tIHRyYWNpbmcgZ2V0LXBvcnQnc1xuICAgIC8vIGZzIG9wcyAocmVhZGRpciwgcmVhZEZpbGUpIGludG8gdGhlIGZsb3cgcm91dGUgYnVuZGxlLiBUaGUgcmVzb2x2ZWRcbiAgICAvLyBwb3J0IGlzIGNhY2hlZCBwZXIgcHJvY2VzcyAoc2VlIGdldC1wb3J0LWxhenkudHMpLCBzbyB0aGlzIGlzIGNoZWFwXG4gICAgLy8gb24gcmVwbGF5cyBhZnRlciB0aGUgZmlyc3Qg4oCUIGBnZXRQb3J0KClgIG90aGVyd2lzZSByZS1ydW5zIE9TIHBvcnRcbiAgICAvLyBkaXNjb3ZlcnkgKHNwYXduaW5nIGBsc29mYCBvbiBtYWNPUywgfjYwbXMpIG9uIGV2ZXJ5IHJlcGxheS5cbiAgICBjb25zdCB3b3JrZmxvd0Jhc2VVcmwgPSBjcmVhdGVXb3JrZmxvd0Jhc2VVcmwoXG4gICAgICBpc1ZlcmNlbFxuICAgICAgICA/IGBodHRwczovLyR7cHJvY2Vzcy5lbnYuVkVSQ0VMX1VSTH1gXG4gICAgICAgIDogYGh0dHA6Ly9sb2NhbGhvc3Q6JHsoYXdhaXQgZ2V0UG9ydExhenkoKSkgPz8gMzAwMH1gXG4gICAgKTtcblxuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQsXG4gICAgICBnbG9iYWxUaGlzOiB2bUdsb2JhbFRoaXMsXG4gICAgICB1cGRhdGVUaW1lc3RhbXAsXG4gICAgfSA9IGNyZWF0ZUNvbnRleHQoe1xuICAgICAgc2VlZDogYCR7d29ya2Zsb3dSdW4ucnVuSWR9OiR7d29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lfTokeytzdGFydGVkQXR9YCxcbiAgICAgIGZpeGVkVGltZXN0YW1wOiArc3RhcnRlZEF0LFxuICAgIH0pO1xuXG4gICAgY29uc3Qgd29ya2Zsb3dEaXNjb250aW51YXRpb24gPSB3aXRoUmVzb2x2ZXJzPHZvaWQ+KCk7XG5cbiAgICBjb25zdCB1bGlkID0gbW9ub3RvbmljRmFjdG9yeSgoKSA9PiB2bUdsb2JhbFRoaXMuTWF0aC5yYW5kb20oKSk7XG4gICAgY29uc3QgZ2VuZXJhdGVOYW5vaWQgPSBuYW5vaWQuY3VzdG9tUmFuZG9tKG5hbm9pZC51cmxBbHBoYWJldCwgMjEsIChzaXplKSA9PlxuICAgICAgbmV3IFVpbnQ4QXJyYXkoc2l6ZSkubWFwKCgpID0+IDI1NiAqIHZtR2xvYmFsVGhpcy5NYXRoLnJhbmRvbSgpKVxuICAgICk7XG5cbiAgICAvLyBDcmVhdGUgYSBtdXRhYmxlIGhvbGRlciBmb3IgdGhlIHByb21pc2UgcXVldWUgc28gdGhlIEV2ZW50c0NvbnN1bWVyXG4gICAgLy8gY2FuIGFjY2VzcyB0aGUgY3VycmVudCBxdWV1ZSBzdGF0ZSB2aWEgYSBnZXR0ZXIuIFRoZSBxdWV1ZSBpcyBtdXRhdGVkXG4gICAgLy8gYnkgc3RlcC9ob29rL3NsZWVwIGNhbGxiYWNrcyBhcyBldmVudHMgYXJlIHByb2Nlc3NlZC5cbiAgICBjb25zdCBwcm9taXNlUXVldWVIb2xkZXIgPSB7IGN1cnJlbnQ6IFByb21pc2UucmVzb2x2ZSgpIH07XG5cbiAgICBjb25zdCBldmVudHNDb25zdW1lciA9IG5ldyBFdmVudHNDb25zdW1lcihldmVudHMsIHtcbiAgICAgIG9uQ29uc3VtZWRFdmVudDogKGV2ZW50KSA9PiB7XG4gICAgICAgIHVwZGF0ZVRpbWVzdGFtcCgrZXZlbnQuY3JlYXRlZEF0KTtcbiAgICAgIH0sXG4gICAgICBvblVuY29uc3VtZWRFdmVudDogKGV2ZW50KSA9PiB7XG4gICAgICAgIHdvcmtmbG93RGlzY29udGludWF0aW9uLnJlamVjdChcbiAgICAgICAgICBuZXcgUmVwbGF5RGl2ZXJnZW5jZUVycm9yKFxuICAgICAgICAgICAgYFJlcGxheSBjb3VsZCBub3QgY29uc3VtZSBldmVudDogZXZlbnRUeXBlPSR7ZXZlbnQuZXZlbnRUeXBlfSwgY29ycmVsYXRpb25JZD0ke2V2ZW50LmNvcnJlbGF0aW9uSWR9LCBldmVudElkPSR7ZXZlbnQuZXZlbnRJZH0uYCxcbiAgICAgICAgICAgIHsgZXZlbnRJZDogZXZlbnQuZXZlbnRJZCB9XG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIGdldFByb21pc2VRdWV1ZTogKCkgPT4gcHJvbWlzZVF1ZXVlSG9sZGVyLmN1cnJlbnQsXG4gICAgfSk7XG5cbiAgICBjb25zdCB3b3JrZmxvd0NvbnRleHQ6IFdvcmtmbG93T3JjaGVzdHJhdG9yQ29udGV4dCA9IHtcbiAgICAgIHJ1bklkOiB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgIGVuY3J5cHRpb25LZXksXG4gICAgICBnbG9iYWxUaGlzOiB2bUdsb2JhbFRoaXMsXG4gICAgICBvbldvcmtmbG93RXJyb3I6IHdvcmtmbG93RGlzY29udGludWF0aW9uLnJlamVjdCxcbiAgICAgIGV2ZW50c0NvbnN1bWVyLFxuICAgICAgZ2VuZXJhdGVVbGlkOiAoKSA9PiB1bGlkKCtzdGFydGVkQXQpLFxuICAgICAgZ2VuZXJhdGVOYW5vaWQsXG4gICAgICBpbnZvY2F0aW9uc1F1ZXVlOiBuZXcgTWFwKCksXG4gICAgICAvLyBVc2UgZ2V0dGVyL3NldHRlciBzbyB0aGUgRXZlbnRzQ29uc3VtZXIncyBnZXRQcm9taXNlUXVldWUoKSBhbHdheXNcbiAgICAgIC8vIHNlZXMgdGhlIGxhdGVzdCBxdWV1ZSBzdGF0ZSBhcyBpdCdzIG11dGF0ZWQgYnkgc3RlcC9ob29rL3NsZWVwIGNhbGxiYWNrcy5cbiAgICAgIGdldCBwcm9taXNlUXVldWUoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlUXVldWVIb2xkZXIuY3VycmVudDtcbiAgICAgIH0sXG4gICAgICBzZXQgcHJvbWlzZVF1ZXVlKHZhbHVlOiBQcm9taXNlPHZvaWQ+KSB7XG4gICAgICAgIHByb21pc2VRdWV1ZUhvbGRlci5jdXJyZW50ID0gdmFsdWU7XG4gICAgICB9LFxuICAgICAgcGVuZGluZ0RlbGl2ZXJpZXM6IDAsXG4gICAgICBwZW5kaW5nRGVsaXZlcnlCYXJyaWVyczogbmV3IE1hcCgpLFxuICAgICAgc3RlcEh5ZHJhdGlvbkNhY2hlLFxuICAgIH07XG5cbiAgICAvLyBDb25zdW1lIHJ1biBsaWZlY3ljbGUgZXZlbnRzIC0gdGhlc2UgYXJlIHN0cnVjdHVyYWwgZXZlbnRzIHRoYXQgZG9uJ3RcbiAgICAvLyBuZWVkIHNwZWNpYWwgaGFuZGxpbmcgaW4gdGhlIHdvcmtmbG93LCBidXQgbXVzdCBiZSBjb25zdW1lZCB0byBhZHZhbmNlXG4gICAgLy8gcGFzdCB0aGVtIGluIHRoZSBldmVudCBsb2dcbiAgICB3b3JrZmxvd0NvbnRleHQuZXZlbnRzQ29uc3VtZXIuc3Vic2NyaWJlKChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudCkge1xuICAgICAgICByZXR1cm4gRXZlbnRDb25zdW1lclJlc3VsdC5Ob3RDb25zdW1lZDtcbiAgICAgIH1cblxuICAgICAgLy8gQ29uc3VtZSBydW5fY3JlYXRlZCAtIGV2ZXJ5IHJ1biBoYXMgZXhhY3RseSBvbmVcbiAgICAgIGlmIChldmVudC5ldmVudFR5cGUgPT09ICdydW5fY3JlYXRlZCcpIHtcbiAgICAgICAgcmV0dXJuIEV2ZW50Q29uc3VtZXJSZXN1bHQuQ29uc3VtZWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnN1bWUgcnVuX3N0YXJ0ZWQgLSBldmVyeSBydW4gaGFzIGV4YWN0bHkgb25lXG4gICAgICBpZiAoZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX3N0YXJ0ZWQnKSB7XG4gICAgICAgIHJldHVybiBFdmVudENvbnN1bWVyUmVzdWx0LkNvbnN1bWVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gRXZlbnRDb25zdW1lclJlc3VsdC5Ob3RDb25zdW1lZDtcbiAgICB9KTtcblxuICAgIGNvbnN0IHVzZVN0ZXAgPSBjcmVhdGVVc2VTdGVwKHdvcmtmbG93Q29udGV4dCk7XG4gICAgY29uc3QgY3JlYXRlSG9vayA9IGNyZWF0ZUNyZWF0ZUhvb2sod29ya2Zsb3dDb250ZXh0KTtcbiAgICBjb25zdCBzbGVlcCA9IGNyZWF0ZVNsZWVwKHdvcmtmbG93Q29udGV4dCk7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfVVNFX1NURVBdID0gdXNlU3RlcDtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfQ1JFQVRFX0hPT0tdID0gY3JlYXRlSG9vaztcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfU0xFRVBdID0gc2xlZXA7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX0dFVF9TVFJFQU1fSURdID0gKG5hbWVzcGFjZT86IHN0cmluZykgPT5cbiAgICAgIGdldFdvcmtmbG93UnVuU3RyZWFtSWQod29ya2Zsb3dSdW4ucnVuSWQsIG5hbWVzcGFjZSk7XG5cbiAgICAvLyBGb3IgdGhlIHdvcmtmbG93IFZNLCB3ZSBzdG9yZSB0aGUgY29udGV4dCBpbiBhIHN5bWJvbCBvbiB0aGUgYGdsb2JhbFRoaXNgIG9iamVjdFxuICAgIGNvbnN0IGN0eDogV29ya2Zsb3dNZXRhZGF0YSA9IHtcbiAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lLFxuICAgICAgd29ya2Zsb3dSdW5JZDogd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICB3b3JrZmxvd1N0YXJ0ZWRBdDogbmV3IHZtR2xvYmFsVGhpcy5EYXRlKCtzdGFydGVkQXQpLFxuICAgICAgdXJsOiB3b3JrZmxvd0Jhc2VVcmwsXG4gICAgfTtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tXT1JLRkxPV19DT05URVhUX1NZTUJPTF0gPSBjdHg7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1NUQUJMRV9VTElEXSA9IHVsaWQ7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGhhdmUgYSBjb25maWcgb3ZlcnJpZGUgdG8gdXNlIHRoZSBjdXN0b20gZmV0Y2ggc3RlcC5cbiAgICAvLyAgICAgICBGb3Igbm93IGBmZXRjaGAgbXVzdCBiZSBleHBsaWNpdGx5IGltcG9ydGVkIGZyb20gYHdvcmtmbG93YC5cbiAgICB2bUdsb2JhbFRoaXMuZmV0Y2ggPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgdm1HbG9iYWxUaGlzLkVycm9yKFxuICAgICAgICBgR2xvYmFsIFwiZmV0Y2hcIiBpcyB1bmF2YWlsYWJsZSBpbiB3b3JrZmxvdyBmdW5jdGlvbnMuIFVzZSB0aGUgXCJmZXRjaFwiIHN0ZXAgZnVuY3Rpb24gZnJvbSBcIndvcmtmbG93XCIgdG8gbWFrZSBIVFRQIHJlcXVlc3RzLlxcblxcbkxlYXJuIG1vcmU6IGh0dHBzOi8vdXNld29ya2Zsb3cuZGV2L2Vyci8ke0VSUk9SX1NMVUdTLkZFVENIX0lOX1dPUktGTE9XX0ZVTkNUSU9OfWBcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIE92ZXJyaWRlIHRpbWVvdXQvaW50ZXJ2YWwgZnVuY3Rpb25zIHRvIHRocm93IGhlbHBmdWwgZXJyb3JzXG4gICAgLy8gVGhlc2UgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gd29ya2Zsb3cgZnVuY3Rpb25zIGJlY2F1c2UgdGhleSByZWx5IG9uXG4gICAgLy8gYXN5bmNocm9ub3VzIHNjaGVkdWxpbmcgd2hpY2ggYnJlYWtzIGRldGVybWluaXN0aWMgcmVwbGF5XG4gICAgY29uc3QgdGltZW91dEVycm9yTWVzc2FnZSA9XG4gICAgICAnVGltZW91dCBmdW5jdGlvbnMgbGlrZSBcInNldFRpbWVvdXRcIiBhbmQgXCJzZXRJbnRlcnZhbFwiIGFyZSBub3Qgc3VwcG9ydGVkIGluIHdvcmtmbG93IGZ1bmN0aW9ucy4gVXNlIHRoZSBcInNsZWVwXCIgZnVuY3Rpb24gZnJvbSBcIndvcmtmbG93XCIgZm9yIHRpbWUtYmFzZWQgZGVsYXlzLic7XG5cbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuc2V0VGltZW91dCA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuc2V0SW50ZXJ2YWwgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLmNsZWFyVGltZW91dCA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuY2xlYXJJbnRlcnZhbCA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuc2V0SW1tZWRpYXRlID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuVElNRU9VVF9GVU5DVElPTlNfSU5fV09SS0ZMT1csXG4gICAgICB9KTtcbiAgICB9O1xuICAgICh2bUdsb2JhbFRoaXMgYXMgYW55KS5jbGVhckltbWVkaWF0ZSA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIGBSZXF1ZXN0YCBhbmQgYFJlc3BvbnNlYCBhcmUgc3BlY2lhbCBidWlsdC1pbiBjbGFzc2VzIHRoYXQgaW52b2tlIHN0ZXBzXG4gICAgLy8gZm9yIHRoZSBganNvbigpYCwgYHRleHQoKWAgYW5kIGBhcnJheUJ1ZmZlcigpYCBpbnN0YW5jZSBtZXRob2RzXG4gICAgY2xhc3MgUmVxdWVzdCBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuUmVxdWVzdCB7XG4gICAgICBjYWNoZSE6IGdsb2JhbFRoaXMuUmVxdWVzdFsnY2FjaGUnXTtcbiAgICAgIGNyZWRlbnRpYWxzITogZ2xvYmFsVGhpcy5SZXF1ZXN0WydjcmVkZW50aWFscyddO1xuICAgICAgZGVzdGluYXRpb24hOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ2Rlc3RpbmF0aW9uJ107XG4gICAgICBoZWFkZXJzITogSGVhZGVycztcbiAgICAgIGludGVncml0eSE6IHN0cmluZztcbiAgICAgIG1ldGhvZCE6IHN0cmluZztcbiAgICAgIG1vZGUhOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ21vZGUnXTtcbiAgICAgIHJlZGlyZWN0ITogZ2xvYmFsVGhpcy5SZXF1ZXN0WydyZWRpcmVjdCddO1xuICAgICAgcmVmZXJyZXIhOiBzdHJpbmc7XG4gICAgICByZWZlcnJlclBvbGljeSE6IGdsb2JhbFRoaXMuUmVxdWVzdFsncmVmZXJyZXJQb2xpY3knXTtcbiAgICAgIHVybCE6IHN0cmluZztcbiAgICAgIGtlZXBhbGl2ZSE6IGJvb2xlYW47XG4gICAgICBzaWduYWwhOiBBYm9ydFNpZ25hbDtcbiAgICAgIGR1cGxleCE6ICdoYWxmJztcbiAgICAgIGJvZHkhOiBSZWFkYWJsZVN0cmVhbTxhbnk+IHwgbnVsbDtcblxuICAgICAgY29uc3RydWN0b3IoaW5wdXQ6IGFueSwgaW5pdD86IFJlcXVlc3RJbml0KSB7XG4gICAgICAgIC8vIEhhbmRsZSBVUkwgaW5wdXRcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgfHwgaW5wdXQgaW5zdGFuY2VvZiB2bUdsb2JhbFRoaXMuVVJMKSB7XG4gICAgICAgICAgY29uc3QgdXJsU3RyaW5nID0gU3RyaW5nKGlucHV0KTtcbiAgICAgICAgICAvLyBWYWxpZGF0ZSBVUkwgZm9ybWF0XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG5ldyB2bUdsb2JhbFRoaXMuVVJMKHVybFN0cmluZyk7XG4gICAgICAgICAgICB0aGlzLnVybCA9IHVybFN0cmluZztcbiAgICAgICAgICB9IGNhdGNoIChjYXVzZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRmFpbGVkIHRvIHBhcnNlIFVSTCBmcm9tICR7dXJsU3RyaW5nfWAsIHtcbiAgICAgICAgICAgICAgY2F1c2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSW5wdXQgaXMgYSBSZXF1ZXN0IG9iamVjdCAtIGNsb25lIGl0cyBwcm9wZXJ0aWVzXG4gICAgICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmw7XG4gICAgICAgICAgaWYgKCFpbml0KSB7XG4gICAgICAgICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZDtcbiAgICAgICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbnB1dC5oZWFkZXJzKTtcbiAgICAgICAgICAgIHRoaXMuYm9keSA9IGlucHV0LmJvZHk7XG4gICAgICAgICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlO1xuICAgICAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzO1xuICAgICAgICAgICAgdGhpcy5jYWNoZSA9IGlucHV0LmNhY2hlO1xuICAgICAgICAgICAgdGhpcy5yZWRpcmVjdCA9IGlucHV0LnJlZGlyZWN0O1xuICAgICAgICAgICAgdGhpcy5yZWZlcnJlciA9IGlucHV0LnJlZmVycmVyO1xuICAgICAgICAgICAgdGhpcy5yZWZlcnJlclBvbGljeSA9IGlucHV0LnJlZmVycmVyUG9saWN5O1xuICAgICAgICAgICAgdGhpcy5pbnRlZ3JpdHkgPSBpbnB1dC5pbnRlZ3JpdHk7XG4gICAgICAgICAgICB0aGlzLmtlZXBhbGl2ZSA9IGlucHV0LmtlZXBhbGl2ZTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFsID0gaW5wdXQuc2lnbmFsO1xuICAgICAgICAgICAgdGhpcy5kdXBsZXggPSBpbnB1dC5kdXBsZXg7XG4gICAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gaW5wdXQuZGVzdGluYXRpb247XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElmIGluaXQgaXMgcHJvdmlkZWQsIG1lcmdlOiB1c2Ugc291cmNlIHByb3BlcnRpZXMsIHRoZW4gb3ZlcnJpZGUgd2l0aCBpbml0XG4gICAgICAgICAgLy8gQ29weSBhbGwgcHJvcGVydGllcyBmcm9tIHRoZSBzb3VyY2UgUmVxdWVzdCBmaXJzdFxuICAgICAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kO1xuICAgICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbnB1dC5oZWFkZXJzKTtcbiAgICAgICAgICB0aGlzLmJvZHkgPSBpbnB1dC5ib2R5O1xuICAgICAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGU7XG4gICAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzO1xuICAgICAgICAgIHRoaXMuY2FjaGUgPSBpbnB1dC5jYWNoZTtcbiAgICAgICAgICB0aGlzLnJlZGlyZWN0ID0gaW5wdXQucmVkaXJlY3Q7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlciA9IGlucHV0LnJlZmVycmVyO1xuICAgICAgICAgIHRoaXMucmVmZXJyZXJQb2xpY3kgPSBpbnB1dC5yZWZlcnJlclBvbGljeTtcbiAgICAgICAgICB0aGlzLmludGVncml0eSA9IGlucHV0LmludGVncml0eTtcbiAgICAgICAgICB0aGlzLmtlZXBhbGl2ZSA9IGlucHV0LmtlZXBhbGl2ZTtcbiAgICAgICAgICB0aGlzLnNpZ25hbCA9IGlucHV0LnNpZ25hbDtcbiAgICAgICAgICB0aGlzLmR1cGxleCA9IGlucHV0LmR1cGxleDtcbiAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gaW5wdXQuZGVzdGluYXRpb247XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPdmVycmlkZSB3aXRoIGluaXQgb3B0aW9ucyBpZiBwcm92aWRlZFxuICAgICAgICAvLyBTZXQgbWV0aG9kXG4gICAgICAgIGlmIChpbml0Py5tZXRob2QpIHtcbiAgICAgICAgICB0aGlzLm1ldGhvZCA9IGluaXQubWV0aG9kLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMubWV0aG9kICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIEZhbGxiYWNrIHRvIGRlZmF1bHQgZm9yIHN0cmluZyBpbnB1dCBjYXNlXG4gICAgICAgICAgdGhpcy5tZXRob2QgPSAnR0VUJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBoZWFkZXJzXG4gICAgICAgIGlmIChpbml0Py5oZWFkZXJzKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKGluaXQuaGVhZGVycyk7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgIGlucHV0IGluc3RhbmNlb2Ygdm1HbG9iYWxUaGlzLlVSTFxuICAgICAgICApIHtcbiAgICAgICAgICAvLyBGb3Igc3RyaW5nL1VSTCBpbnB1dCwgY3JlYXRlIGVtcHR5IGhlYWRlcnNcbiAgICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBvdGhlciBwcm9wZXJ0aWVzIHdpdGggaW5pdCB2YWx1ZXMgb3IgZGVmYXVsdHNcbiAgICAgICAgaWYgKGluaXQ/Lm1vZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMubW9kZSA9IGluaXQubW9kZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5tb2RlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMubW9kZSA9ICdjb3JzJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5jcmVkZW50aWFscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGluaXQuY3JlZGVudGlhbHM7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuY3JlZGVudGlhbHMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9ICdzYW1lLW9yaWdpbic7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBgYW55YCBjYXN0IGhlcmUgYmVjYXVzZSBAdHlwZXMvbm9kZSB2MjIgZG9lcyBub3QgeWV0IGhhdmUgYGNhY2hlYFxuICAgICAgICBpZiAoKGluaXQgYXMgYW55KT8uY2FjaGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuY2FjaGUgPSAoaW5pdCBhcyBhbnkpLmNhY2hlO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNhY2hlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuY2FjaGUgPSAnZGVmYXVsdCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8ucmVkaXJlY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMucmVkaXJlY3QgPSBpbml0LnJlZGlyZWN0O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnJlZGlyZWN0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMucmVkaXJlY3QgPSAnZm9sbG93JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5yZWZlcnJlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlciA9IGluaXQucmVmZXJyZXI7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucmVmZXJyZXIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlciA9ICdhYm91dDpjbGllbnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LnJlZmVycmVyUG9saWN5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLnJlZmVycmVyUG9saWN5ID0gaW5pdC5yZWZlcnJlclBvbGljeTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZWZlcnJlclBvbGljeSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLnJlZmVycmVyUG9saWN5ID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8uaW50ZWdyaXR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLmludGVncml0eSA9IGluaXQuaW50ZWdyaXR5O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmludGVncml0eSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmludGVncml0eSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LmtlZXBhbGl2ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5rZWVwYWxpdmUgPSBpbml0LmtlZXBhbGl2ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5rZWVwYWxpdmUgIT09ICdib29sZWFuJykge1xuICAgICAgICAgIHRoaXMua2VlcGFsaXZlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8uc2lnbmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gQWJvcnRTaWduYWwgc3R1YlxuICAgICAgICAgIHRoaXMuc2lnbmFsID0gaW5pdC5zaWduYWw7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc2lnbmFsKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEFib3J0U2lnbmFsIHN0dWJcbiAgICAgICAgICB0aGlzLnNpZ25hbCA9IHsgYWJvcnRlZDogZmFsc2UgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5kdXBsZXgpIHtcbiAgICAgICAgICB0aGlzLmR1cGxleCA9ICdoYWxmJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5kZXN0aW5hdGlvbikge1xuICAgICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSAnZG9jdW1lbnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYm9keSA9IGluaXQ/LmJvZHk7XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCBHRVQvSEVBRCBtZXRob2RzIGRvbid0IGhhdmUgYSBib2R5XG4gICAgICAgIGlmIChcbiAgICAgICAgICBib2R5ICE9PSBudWxsICYmXG4gICAgICAgICAgYm9keSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBSZXF1ZXN0IHdpdGggR0VUL0hFQUQgbWV0aG9kIGNhbm5vdCBoYXZlIGJvZHkuYCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdG9yZSB0aGUgb3JpZ2luYWwgQm9keUluaXQgZm9yIHNlcmlhbGl6YXRpb25cbiAgICAgICAgaWYgKGJvZHkgIT09IG51bGwgJiYgYm9keSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQ3JlYXRlIGEgXCJmYWtlXCIgUmVhZGFibGVTdHJlYW0gdGhhdCBzdG9yZXMgdGhlIG9yaWdpbmFsIGJvZHlcbiAgICAgICAgICAvLyBUaGlzIGF2b2lkcyBkb2luZyBhc3luYyB3b3JrIGR1cmluZyB3b3JrZmxvdyByZXBsYXlcbiAgICAgICAgICB0aGlzLmJvZHkgPSBPYmplY3QuY3JlYXRlKHZtR2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbS5wcm90b3R5cGUsIHtcbiAgICAgICAgICAgIFtCT0RZX0lOSVRfU1lNQk9MXToge1xuICAgICAgICAgICAgICB2YWx1ZTogYm9keSxcbiAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmJvZHkgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNsb25lKCk6IFJlcXVlc3Qge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGdldCBib2R5VXNlZCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBpbXBsZW1lbnQgdGhlc2VcbiAgICAgIGJsb2IhOiAoKSA9PiBQcm9taXNlPEJsb2I+O1xuICAgICAgZm9ybURhdGEhOiAoKSA9PiBQcm9taXNlPEZvcm1EYXRhPjtcblxuICAgICAgYXJyYXlCdWZmZXIhOiAoKSA9PiBQcm9taXNlPEFycmF5QnVmZmVyPjtcbiAgICAgIGpzb24hOiAoKSA9PiBQcm9taXNlPGFueT47XG4gICAgICB0ZXh0ITogKCkgPT4gUHJvbWlzZTxzdHJpbmc+O1xuXG4gICAgICBhc3luYyBieXRlcygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGF3YWl0IHRoaXMuYXJyYXlCdWZmZXIoKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHZtR2xvYmFsVGhpcy5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFJlcXVlc3QucHJvdG90eXBlLCB7XG4gICAgICBhcnJheUJ1ZmZlcjoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgQXJyYXlCdWZmZXI+KCdfX2J1aWx0aW5fcmVzcG9uc2VfYXJyYXlfYnVmZmVyJyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgICAganNvbjoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgYW55PignX19idWlsdGluX3Jlc3BvbnNlX2pzb24nKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICB0ZXh0OiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBzdHJpbmc+KCdfX2J1aWx0aW5fcmVzcG9uc2VfdGV4dCcpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNsYXNzIFJlc3BvbnNlIGltcGxlbWVudHMgZ2xvYmFsVGhpcy5SZXNwb25zZSB7XG4gICAgICB0eXBlITogZ2xvYmFsVGhpcy5SZXNwb25zZVsndHlwZSddO1xuICAgICAgdXJsITogc3RyaW5nO1xuICAgICAgc3RhdHVzITogbnVtYmVyO1xuICAgICAgc3RhdHVzVGV4dCE6IHN0cmluZztcbiAgICAgIGJvZHkhOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PiB8IG51bGw7XG4gICAgICBoZWFkZXJzITogSGVhZGVycztcbiAgICAgIHJlZGlyZWN0ZWQhOiBib29sZWFuO1xuXG4gICAgICBjb25zdHJ1Y3Rvcihib2R5PzogYW55LCBpbml0PzogUmVzcG9uc2VJbml0KSB7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gaW5pdD8uc3RhdHVzID8/IDIwMDtcbiAgICAgICAgdGhpcy5zdGF0dXNUZXh0ID0gaW5pdD8uc3RhdHVzVGV4dCA/PyAnJztcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKGluaXQ/LmhlYWRlcnMpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCc7XG4gICAgICAgIHRoaXMudXJsID0gJyc7XG4gICAgICAgIHRoaXMucmVkaXJlY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgbnVsbC1ib2R5IHN0YXR1cyBjb2RlcyBkb24ndCBoYXZlIGEgYm9keVxuICAgICAgICAvLyBQZXIgSFRUUCBzcGVjOiAyMDQgKE5vIENvbnRlbnQpLCAyMDUgKFJlc2V0IENvbnRlbnQpLCBhbmQgMzA0IChOb3QgTW9kaWZpZWQpXG4gICAgICAgIGlmIChcbiAgICAgICAgICBib2R5ICE9PSBudWxsICYmXG4gICAgICAgICAgYm9keSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgKHRoaXMuc3RhdHVzID09PSAyMDQgfHwgdGhpcy5zdGF0dXMgPT09IDIwNSB8fCB0aGlzLnN0YXR1cyA9PT0gMzA0KVxuICAgICAgICApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgYFJlc3BvbnNlIGNvbnN0cnVjdG9yOiBJbnZhbGlkIHJlc3BvbnNlIHN0YXR1cyBjb2RlICR7dGhpcy5zdGF0dXN9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdG9yZSB0aGUgb3JpZ2luYWwgQm9keUluaXQgZm9yIHNlcmlhbGl6YXRpb25cbiAgICAgICAgaWYgKGJvZHkgIT09IG51bGwgJiYgYm9keSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQ3JlYXRlIGEgXCJmYWtlXCIgUmVhZGFibGVTdHJlYW0gdGhhdCBzdG9yZXMgdGhlIG9yaWdpbmFsIGJvZHlcbiAgICAgICAgICAvLyBUaGlzIGF2b2lkcyBkb2luZyBhc3luYyB3b3JrIGR1cmluZyB3b3JrZmxvdyByZXBsYXlcbiAgICAgICAgICB0aGlzLmJvZHkgPSBPYmplY3QuY3JlYXRlKHZtR2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbS5wcm90b3R5cGUsIHtcbiAgICAgICAgICAgIFtCT0RZX0lOSVRfU1lNQk9MXToge1xuICAgICAgICAgICAgICB2YWx1ZTogYm9keSxcbiAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmJvZHkgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IGltcGxlbWVudCB0aGVzZVxuICAgICAgY2xvbmUhOiAoKSA9PiBSZXNwb25zZTtcbiAgICAgIGJsb2IhOiAoKSA9PiBQcm9taXNlPGdsb2JhbFRoaXMuQmxvYj47XG4gICAgICBmb3JtRGF0YSE6ICgpID0+IFByb21pc2U8Z2xvYmFsVGhpcy5Gb3JtRGF0YT47XG5cbiAgICAgIGdldCBvaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMDtcbiAgICAgIH1cblxuICAgICAgZ2V0IGJvZHlVc2VkKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGFycmF5QnVmZmVyITogKCkgPT4gUHJvbWlzZTxBcnJheUJ1ZmZlcj47XG4gICAgICBqc29uITogKCkgPT4gUHJvbWlzZTxhbnk+O1xuICAgICAgdGV4dCE6ICgpID0+IFByb21pc2U8c3RyaW5nPjtcblxuICAgICAgYXN5bmMgYnl0ZXMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCB0aGlzLmFycmF5QnVmZmVyKCkpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMganNvbihkYXRhOiBhbnksIGluaXQ/OiBSZXNwb25zZUluaXQpOiBSZXNwb25zZSB7XG4gICAgICAgIGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbml0Py5oZWFkZXJzKTtcbiAgICAgICAgaWYgKCFoZWFkZXJzLmhhcygnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgICBoZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHsgLi4uaW5pdCwgaGVhZGVycyB9KTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGVycm9yKCk6IFJlc3BvbnNlIHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgcmVkaXJlY3QodXJsOiBzdHJpbmcgfCBVUkwsIHN0YXR1czogbnVtYmVyID0gMzAyKTogUmVzcG9uc2Uge1xuICAgICAgICAvLyBWYWxpZGF0ZSBzdGF0dXMgY29kZSAtIG9ubHkgc3BlY2lmaWMgcmVkaXJlY3QgY29kZXMgYXJlIGFsbG93ZWRcbiAgICAgICAgaWYgKCFbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdLmluY2x1ZGVzKHN0YXR1cykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcbiAgICAgICAgICAgIGBJbnZhbGlkIHJlZGlyZWN0IHN0YXR1cyBjb2RlOiAke3N0YXR1c30uIE11c3QgYmUgb25lIG9mOiAzMDEsIDMwMiwgMzAzLCAzMDcsIDMwOGBcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIHJlc3BvbnNlIHdpdGggTG9jYXRpb24gaGVhZGVyXG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoKTtcbiAgICAgICAgaGVhZGVycy5zZXQoJ0xvY2F0aW9uJywgU3RyaW5nKHVybCkpO1xuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gT2JqZWN0LmNyZWF0ZShSZXNwb25zZS5wcm90b3R5cGUpO1xuICAgICAgICByZXNwb25zZS5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHJlc3BvbnNlLnN0YXR1c1RleHQgPSAnJztcbiAgICAgICAgcmVzcG9uc2UuaGVhZGVycyA9IGhlYWRlcnM7XG4gICAgICAgIHJlc3BvbnNlLmJvZHkgPSBudWxsO1xuICAgICAgICByZXNwb25zZS50eXBlID0gJ2RlZmF1bHQnO1xuICAgICAgICByZXNwb25zZS51cmwgPSAnJztcbiAgICAgICAgcmVzcG9uc2UucmVkaXJlY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdm1HbG9iYWxUaGlzLlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhSZXNwb25zZS5wcm90b3R5cGUsIHtcbiAgICAgIGFycmF5QnVmZmVyOiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBBcnJheUJ1ZmZlcj4oJ19fYnVpbHRpbl9yZXNwb25zZV9hcnJheV9idWZmZXInKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBqc29uOiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBhbnk+KCdfX2J1aWx0aW5fcmVzcG9uc2VfanNvbicpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHRleHQ6IHtcbiAgICAgICAgdmFsdWU6IHVzZVN0ZXA8W10sIHN0cmluZz4oJ19fYnVpbHRpbl9yZXNwb25zZV90ZXh0JyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY2xhc3MgUmVhZGFibGVTdHJlYW08VD4gaW1wbGVtZW50cyBnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtPFQ+IHtcbiAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGdldCBsb2NrZWQoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgY2FuY2VsKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgZ2V0UmVhZGVyKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgcGlwZVRocm91Z2goKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBwaXBlVG8oKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICB0ZWUoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZXMoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgZnJvbSgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW0gPSBSZWFkYWJsZVN0cmVhbTtcblxuICAgIGNsYXNzIFdyaXRhYmxlU3RyZWFtPFQ+IGltcGxlbWVudHMgZ2xvYmFsVGhpcy5Xcml0YWJsZVN0cmVhbTxUPiB7XG4gICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXQgbG9ja2VkKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGFib3J0KCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgY2xvc2UoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXRXcml0ZXIoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW0gPSBXcml0YWJsZVN0cmVhbTtcblxuICAgIGNsYXNzIFRyYW5zZm9ybVN0cmVhbTxJLCBPPiBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuVHJhbnNmb3JtU3RyZWFtPEksIE8+IHtcbiAgICAgIHJlYWRhYmxlOiBnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtPE8+O1xuICAgICAgd3JpdGFibGU6IGdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW08ST47XG5cbiAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHZtR2xvYmFsVGhpcy5UcmFuc2Zvcm1TdHJlYW0gPSBUcmFuc2Zvcm1TdHJlYW07XG5cbiAgICAvLyBFdmVudHVhbGx5IHdlJ2xsIHByb2JhYmx5IHdhbnQgdG8gcHJvdmlkZSBvdXIgb3duIGBjb25zb2xlYCBvYmplY3QsXG4gICAgLy8gYnV0IGZvciBub3cgd2UnbGwganVzdCBleHBvc2UgdGhlIGdsb2JhbCBvbmUuXG4gICAgdm1HbG9iYWxUaGlzLmNvbnNvbGUgPSBnbG9iYWxUaGlzLmNvbnNvbGU7XG5cbiAgICAvLyBIQUNLOiBwcm9wYWdhdGUgc3ltYm9sIG5lZWRlZCBmb3IgQUkgZ2F0ZXdheSB1c2FnZVxuICAgIGNvbnN0IFNZTUJPTF9GT1JfUkVRX0NPTlRFWFQgPSBTeW1ib2wuZm9yKCdAdmVyY2VsL3JlcXVlc3QtY29udGV4dCcpO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tTWU1CT0xfRk9SX1JFUV9DT05URVhUXSA9IChnbG9iYWxUaGlzIGFzIGFueSlbXG4gICAgICBTWU1CT0xfRk9SX1JFUV9DT05URVhUXG4gICAgXTtcblxuICAgIC8vIEdldCBhIHJlZmVyZW5jZSB0byB0aGUgdXNlci1kZWZpbmVkIHdvcmtmbG93IGZ1bmN0aW9uLlxuICAgIC8vIFRoZSBmaWxlbmFtZSBwYXJhbWV0ZXIgZW5zdXJlcyBzdGFjayB0cmFjZXMgc2hvdyBhIG1lYW5pbmdmdWwgbmFtZVxuICAgIC8vIChlLmcuLCBcImV4YW1wbGUvd29ya2Zsb3dzLzk5X2UyZS50c1wiKSBpbnN0ZWFkIG9mIFwiZXZhbG1hY2hpbmUuPGFub255bW91cz5cIi5cbiAgICBjb25zdCBwYXJzZWROYW1lID0gcGFyc2VXb3JrZmxvd05hbWUod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKTtcbiAgICBjb25zdCBmaWxlbmFtZSA9IHBhcnNlZE5hbWU/Lm1vZHVsZVNwZWNpZmllciB8fCB3b3JrZmxvd1J1bi53b3JrZmxvd05hbWU7XG5cbiAgICAvLyBFdmFsdWF0ZSB0aGUgd29ya2Zsb3cgYnVuZGxlIGFnYWluc3QgdGhlIGZyZXNoIGNvbnRleHQgdXNpbmcgYVxuICAgIC8vIHByb2Nlc3Mtd2lkZSBjYWNoZSBvZiB0aGUgY29tcGlsZWQgYHZtLlNjcmlwdGAuIFRoZSBidW5kbGUgaXMgdGhlIHNhbWVcbiAgICAvLyBzdHJpbmcgZm9yIGV2ZXJ5IHJlcGxheSBhbmQgZXZlcnkgaW52b2NhdGlvbiBpbiB0aGlzIHByb2Nlc3MsIGFuZFxuICAgIC8vIGNvbXBpbGF0aW9uIGlzIGEgcHVyZSBmdW5jdGlvbiBvZiBgKGNvZGUsIGZpbGVuYW1lKWAsIHNvIHJldXNpbmcgdGhlXG4gICAgLy8gY29tcGlsZWQgU2NyaXB0IGFjcm9zcyByZXBsYXlzIGlzIGRldGVybWluaXNtLXNhZmU6IGl0IHByb2R1Y2VzIHRoZSBzYW1lXG4gICAgLy8gd29ya2Zsb3cgZnVuY3Rpb24gYW5kIHRoZSBzYW1lIGBmaWxlbmFtZWAgc291cmNlIGF0dHJpYnV0aW9uIGFzXG4gICAgLy8gcmUtcGFyc2luZyB0aGUgYnVuZGxlIGV2ZXJ5IHRpbWUsIGJ1dCBza2lwcyB0aGUgKGV4cGVuc2l2ZSkgcmUtcGFyc2UuXG4gICAgLy8gRXZhbHVhdGluZyB0aGUgYnVuZGxlIHJlZ2lzdGVycyBldmVyeSB3b3JrZmxvdyBvblxuICAgIC8vIGBnbG9iYWxUaGlzLl9fcHJpdmF0ZV93b3JrZmxvd3NgOyB0aGUgdHJhaWxpbmcgbG9va3VwIGV4cHJlc3Npb24gdGhlblxuICAgIC8vIHJldHJpZXZlcyB0aGUgcmVxdWVzdGVkIHdvcmtmbG93IGZ1bmN0aW9uLiBUaGUgbG9va3VwIGlzIGV2YWx1YXRlZCBhcyBhXG4gICAgLy8gc2VwYXJhdGUgY2FjaGVkIFNjcmlwdCB1bmRlciB0aGUgc2FtZSBgZmlsZW5hbWVgLCBzbyBlcnJvciBzdGFjayBmcmFtZXNcbiAgICAvLyBzdGlsbCBhdHRyaWJ1dGUgdG8gdGhlIHdvcmtmbG93J3Mgc291cmNlIGZpbGUgKGByZW1hcEVycm9yU3RhY2tgIGtleXMgb25cbiAgICAvLyBgZmlsZW5hbWVgKS4gVGhlIG9uZSBiZWhhdmlvdXJhbCBkaWZmZXJlbmNlIGZyb20gdGhlIHByZXZpb3VzXG4gICAgLy8gc2luZ2xlLWNvbWJpbmVkLXN0cmluZyBhcHByb2FjaCBpcyB0aGUgKmxpbmUgbnVtYmVyKiBvZiBhbiBlcnJvciB0aHJvd25cbiAgICAvLyBieSB0aGUgbG9va3VwIGV4cHJlc3Npb24gaXRzZWxmOiBpdCBub3cgcmVwb3J0cyBsaW5lIDEgb2YgdGhlIGxvb2t1cFxuICAgIC8vIFNjcmlwdCByYXRoZXIgdGhhbiB0aGUgbGluZSBqdXN0IHBhc3QgdGhlIGVuZCBvZiB0aGUgYnVuZGxlLiBUaGF0IHBhdGhcbiAgICAvLyBpcyByYXJlIChpdCByZXF1aXJlcyB0aGUgbG9va3VwIGA/LmdldCguLi4pYCBleHByZXNzaW9uIHRvIHRocm93KSBhbmRcbiAgICAvLyBkb2VzIG5vdCBhZmZlY3QgdGhlIHdvcmtmbG93IGZ1bmN0aW9uIG9yIHJlcGxheSBkZXRlcm1pbmlzbS5cbiAgICBydW5DYWNoZWRXb3JrZmxvd1NjcmlwdCh3b3JrZmxvd0NvZGUsIGZpbGVuYW1lLCBjb250ZXh0KTtcbiAgICBjb25zdCB3b3JrZmxvd0ZuID0gcnVuQ2FjaGVkV29ya2Zsb3dTY3JpcHQoXG4gICAgICBgZ2xvYmFsVGhpcy5fX3ByaXZhdGVfd29ya2Zsb3dzPy5nZXQoJHtKU09OLnN0cmluZ2lmeSh3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpfSlgLFxuICAgICAgZmlsZW5hbWUsXG4gICAgICBjb250ZXh0XG4gICAgKTtcblxuICAgIGlmICh0eXBlb2Ygd29ya2Zsb3dGbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93Tm90UmVnaXN0ZXJlZEVycm9yKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSk7XG4gICAgfVxuXG4gICAgLy8gQ2hhaW4gd29ya2Zsb3cgYXJndW1lbnQgaHlkcmF0aW9uIG9udG8gdGhlIHByb21pc2VRdWV1ZSBzbyB0aGF0IHRoZVxuICAgIC8vIHVuY29uc3VtZWQgZXZlbnQgY2hlY2sgKHdoaWNoIHdhaXRzIGZvciB0aGUgcXVldWUgdG8gZHJhaW4pIGRvZXNuJ3RcbiAgICAvLyBmaXJlIGR1cmluZyB0aGUgYXN5bmMgZ2FwIGJldHdlZW4gcnVuX3N0YXJ0ZWQgY29uc3VtcHRpb24gYW5kIHRoZVxuICAgIC8vIHdvcmtmbG93IGZ1bmN0aW9uIHN1YnNjcmliaW5nIGl0cyBmaXJzdCBzdGVwIGNhbGxiYWNrcy5cbiAgICBsZXQgYXJnczogdW5rbm93bltdID0gW107XG4gICAgd29ya2Zsb3dDb250ZXh0LnByb21pc2VRdWV1ZSA9IHdvcmtmbG93Q29udGV4dC5wcm9taXNlUXVldWUudGhlbihcbiAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXJncyA9IGF3YWl0IGh5ZHJhdGVXb3JrZmxvd0FyZ3VtZW50cyhcbiAgICAgICAgICB3b3JrZmxvd1J1bi5pbnB1dCxcbiAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgICBlbmNyeXB0aW9uS2V5LFxuICAgICAgICAgIHZtR2xvYmFsVGhpc1xuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gICAgYXdhaXQgd29ya2Zsb3dDb250ZXh0LnByb21pc2VRdWV1ZTtcblxuICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93QXJndW1lbnRzQ291bnQoYXJncy5sZW5ndGgpLFxuICAgIH0pO1xuXG4gICAgLy8gSW52b2tlIHVzZXIgd29ya2Zsb3dcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUHJvbWlzZS5yYWNlKFtcbiAgICAgICAgd29ya2Zsb3dGbiguLi5hcmdzKSxcbiAgICAgICAgd29ya2Zsb3dEaXNjb250aW51YXRpb24ucHJvbWlzZSxcbiAgICAgIF0pO1xuXG4gICAgICBjb25zdCBkZWh5ZHJhdGVkID0gYXdhaXQgZGVoeWRyYXRlV29ya2Zsb3dSZXR1cm5WYWx1ZShcbiAgICAgICAgcmVzdWx0LFxuICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgZW5jcnlwdGlvbktleSxcbiAgICAgICAgdm1HbG9iYWxUaGlzXG4gICAgICApO1xuXG4gICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UmVzdWx0VHlwZSh0eXBlb2YgcmVzdWx0KSxcbiAgICAgIH0pO1xuXG4gICAgICB3YXJuUGVuZGluZ1F1ZXVlSXRlbXMoXG4gICAgICAgIHdvcmtmbG93UnVuLnJ1bklkLFxuICAgICAgICB3b3JrZmxvd0NvbnRleHQuaW52b2NhdGlvbnNRdWV1ZSxcbiAgICAgICAgJ2NvbXBsZXRlZCdcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkZWh5ZHJhdGVkO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gQ29udHJvbC1mbG93IHNpZ25hbHMgYXJlIGhhbmRsZWQgYnkgdGhlIHJ1bnRpbWUgYW5kIGRvIG5vdCBtZWFuIHRoZVxuICAgICAgLy8gd29ya2Zsb3cgaGFzIHRlcm1pbmFsbHkgZmFpbGVkLlxuICAgICAgaWYgKFdvcmtmbG93U3VzcGVuc2lvbi5pcyhlcnIpIHx8IFJlcGxheURpdmVyZ2VuY2VFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cblxuICAgICAgd2FyblBlbmRpbmdRdWV1ZUl0ZW1zKFxuICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgd29ya2Zsb3dDb250ZXh0Lmludm9jYXRpb25zUXVldWUsXG4gICAgICAgICdmYWlsZWQnXG4gICAgICApO1xuXG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9KTtcbn1cbiIsICJpbXBvcnQge1xuICBFUlJPUl9TTFVHUyxcbiAgSG9va05vdEZvdW5kRXJyb3IsXG4gIFdvcmtmbG93UnVudGltZUVycm9yLFxufSBmcm9tICdAd29ya2Zsb3cvZXJyb3JzJztcbmltcG9ydCB7XG4gIHR5cGUgSG9vayxcbiAgaXNMZWdhY3lTcGVjVmVyc2lvbixcbiAgU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gIFNQRUNfVkVSU0lPTl9MRUdBQ1ksXG4gIHR5cGUgV29ya2Zsb3dJbnZva2VQYXlsb2FkLFxuICB0eXBlIFdvcmtmbG93UnVuLFxufSBmcm9tICdAd29ya2Zsb3cvd29ybGQnO1xuaW1wb3J0IHsgZ2V0UnVuQ2FwYWJpbGl0aWVzIH0gZnJvbSAnLi4vY2FwYWJpbGl0aWVzLmpzJztcbmltcG9ydCB7IHR5cGUgQ3J5cHRvS2V5LCBpbXBvcnRLZXkgfSBmcm9tICcuLi9lbmNyeXB0aW9uLmpzJztcbmltcG9ydCB7IHJ1bnRpbWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIuanMnO1xuaW1wb3J0IHtcbiAgZGVoeWRyYXRlU3RlcFJldHVyblZhbHVlLFxuICBoeWRyYXRlU3RlcEFyZ3VtZW50cyxcbiAgU2VyaWFsaXphdGlvbkZvcm1hdCxcbn0gZnJvbSAnLi4vc2VyaWFsaXphdGlvbi5qcyc7XG5pbXBvcnQgeyBXRUJIT09LX1JFU1BPTlNFX1dSSVRBQkxFIH0gZnJvbSAnLi4vc3ltYm9scy5qcyc7XG5pbXBvcnQgKiBhcyBBdHRyaWJ1dGUgZnJvbSAnLi4vdGVsZW1ldHJ5L3NlbWFudGljLWNvbnZlbnRpb25zLmpzJztcbmltcG9ydCB7IGdldFNwYW5Db250ZXh0Rm9yVHJhY2VDYXJyaWVyLCB0cmFjZSB9IGZyb20gJy4uL3RlbGVtZXRyeS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JrZmxvd1F1ZXVlTmFtZSB9IGZyb20gJy4vaGVscGVycy5qcyc7XG5pbXBvcnQgeyBzYWZlV2FpdFVudGlsLCB3YWl0ZWRVbnRpbCB9IGZyb20gJy4vd2FpdC11bnRpbC5qcyc7XG5pbXBvcnQgeyBnZXRXb3JsZCB9IGZyb20gJy4vd29ybGQuanMnO1xuXG5hc3luYyBmdW5jdGlvbiBtYXRlcmlhbGl6ZVJlc3BvbnNlQm9keShyZXNwb25zZTogUmVzcG9uc2UpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGlmICghcmVzcG9uc2UuYm9keSkge1xuICAgIHJldHVybiByZXNwb25zZTtcbiAgfVxuXG4gIGNvbnN0IGJvZHkgPSBhd2FpdCByZXNwb25zZS5hcnJheUJ1ZmZlcigpO1xuICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHtcbiAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgIGhlYWRlcnM6IHJlc3BvbnNlLmhlYWRlcnMsXG4gIH0pO1xufVxuXG4vKipcbiAqIEludGVybmFsIGhlbHBlciB0aGF0IHJldHVybnMgdGhlIGhvb2ssIHRoZSBhc3NvY2lhdGVkIHdvcmtmbG93IHJ1bixcbiAqIGFuZCB0aGUgcmVzb2x2ZWQgZW5jcnlwdGlvbiBrZXkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEhvb2tCeVRva2VuV2l0aEtleSh0b2tlbjogc3RyaW5nKTogUHJvbWlzZTx7XG4gIGhvb2s6IEhvb2s7XG4gIHJ1bjogV29ya2Zsb3dSdW47XG4gIGVuY3J5cHRpb25LZXk6IENyeXB0b0tleSB8IHVuZGVmaW5lZDtcbn0+IHtcbiAgY29uc3Qgd29ybGQgPSBnZXRXb3JsZCgpO1xuICBjb25zdCBob29rID0gYXdhaXQgd29ybGQuaG9va3MuZ2V0QnlUb2tlbih0b2tlbik7XG4gIGNvbnN0IHJ1biA9IGF3YWl0IHdvcmxkLnJ1bnMuZ2V0KGhvb2sucnVuSWQpO1xuICBjb25zdCByYXdLZXkgPSBhd2FpdCB3b3JsZC5nZXRFbmNyeXB0aW9uS2V5Rm9yUnVuPy4ocnVuKTtcbiAgY29uc3QgZW5jcnlwdGlvbktleSA9IHJhd0tleSA/IGF3YWl0IGltcG9ydEtleShyYXdLZXkpIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIGhvb2subWV0YWRhdGEgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaG9vay5tZXRhZGF0YSA9IGF3YWl0IGh5ZHJhdGVTdGVwQXJndW1lbnRzKFxuICAgICAgaG9vay5tZXRhZGF0YSBhcyBhbnksXG4gICAgICBob29rLnJ1bklkLFxuICAgICAgZW5jcnlwdGlvbktleVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHsgaG9vaywgcnVuLCBlbmNyeXB0aW9uS2V5IH07XG59XG5cbi8qKlxuICogR2V0IHRoZSBob29rIGJ5IHRva2VuIHRvIGZpbmQgdGhlIGFzc29jaWF0ZWQgd29ya2Zsb3cgcnVuLFxuICogYW5kIGh5ZHJhdGUgdGhlIGBtZXRhZGF0YWAgcHJvcGVydHkgaWYgaXQgd2FzIHNldCBmcm9tIHdpdGhpblxuICogdGhlIHdvcmtmbG93IHJ1bi5cbiAqXG4gKiBAcGFyYW0gdG9rZW4gLSBUaGUgdW5pcXVlIHRva2VuIGlkZW50aWZ5aW5nIHRoZSBob29rXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRIb29rQnlUb2tlbih0b2tlbjogc3RyaW5nKTogUHJvbWlzZTxIb29rPiB7XG4gIGNvbnN0IHsgaG9vayB9ID0gYXdhaXQgZ2V0SG9va0J5VG9rZW5XaXRoS2V5KHRva2VuKTtcbiAgcmV0dXJuIGhvb2s7XG59XG5cbi8qKlxuICogUmVzdW1lcyBhIHdvcmtmbG93IHJ1biBieSBzZW5kaW5nIGEgcGF5bG9hZCB0byBhIGhvb2sgaWRlbnRpZmllZCBieSBpdHMgdG9rZW4uXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgZXh0ZXJuYWxseSAoZS5nLiwgZnJvbSBhbiBBUEkgcm91dGUgb3Igc2VydmVyIGFjdGlvbilcbiAqIHRvIHNlbmQgZGF0YSB0byBhIGhvb2sgYW5kIHJlc3VtZSB0aGUgYXNzb2NpYXRlZCB3b3JrZmxvdyBydW4uXG4gKlxuICogQHBhcmFtIHRva2VuT3JIb29rIC0gVGhlIHVuaXF1ZSB0b2tlbiBpZGVudGlmeWluZyB0aGUgaG9vaywgb3IgdGhlIGhvb2sgb2JqZWN0IGl0c2VsZlxuICogQHBhcmFtIHBheWxvYWQgLSBUaGUgZGF0YSBwYXlsb2FkIHRvIHNlbmQgdG8gdGhlIGhvb2tcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHRoZSBob29rXG4gKiBAdGhyb3dzIEVycm9yIGlmIHRoZSBob29rIGlzIG5vdCBmb3VuZCBvciBpZiB0aGVyZSdzIGFuIGVycm9yIGR1cmluZyB0aGUgcHJvY2Vzc1xuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIC8vIEluIGFuIEFQSSByb3V0ZVxuICogaW1wb3J0IHsgcmVzdW1lSG9vayB9IGZyb20gJ0B3b3JrZmxvdy9jb3JlL3J1bnRpbWUnO1xuICpcbiAqIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IFJlcXVlc3QpIHtcbiAqICAgY29uc3QgeyB0b2tlbiwgZGF0YSB9ID0gYXdhaXQgcmVxdWVzdC5qc29uKCk7XG4gKlxuICogICB0cnkge1xuICogICAgIGNvbnN0IGhvb2sgPSBhd2FpdCByZXN1bWVIb29rKHRva2VuLCBkYXRhKTtcbiAqICAgICByZXR1cm4gUmVzcG9uc2UuanNvbih7IHJ1bklkOiBob29rLnJ1bklkIH0pO1xuICogICB9IGNhdGNoIChlcnJvcikge1xuICogICAgIHJldHVybiBuZXcgUmVzcG9uc2UoJ0hvb2sgbm90IGZvdW5kJywgeyBzdGF0dXM6IDQwNCB9KTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXN1bWVIb29rPFQgPSBhbnk+KFxuICB0b2tlbk9ySG9vazogc3RyaW5nIHwgSG9vayxcbiAgcGF5bG9hZDogVCxcbiAgZW5jcnlwdGlvbktleU92ZXJyaWRlPzogQ3J5cHRvS2V5XG4pOiBQcm9taXNlPEhvb2s+IHtcbiAgcmV0dXJuIGF3YWl0IHdhaXRlZFVudGlsKCgpID0+IHtcbiAgICByZXR1cm4gdHJhY2UoJ2hvb2sucmVzdW1lJywgYXN5bmMgKHNwYW4pID0+IHtcbiAgICAgIGNvbnN0IHdvcmxkID0gZ2V0V29ybGQoKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IGhvb2s6IEhvb2s7XG4gICAgICAgIGxldCB3b3JrZmxvd1J1bjogV29ya2Zsb3dSdW47XG4gICAgICAgIGxldCBlbmNyeXB0aW9uS2V5OiBDcnlwdG9LZXkgfCB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW5Pckhvb2sgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZ2V0SG9va0J5VG9rZW5XaXRoS2V5KHRva2VuT3JIb29rKTtcbiAgICAgICAgICBob29rID0gcmVzdWx0Lmhvb2s7XG4gICAgICAgICAgd29ya2Zsb3dSdW4gPSByZXN1bHQucnVuO1xuICAgICAgICAgIGVuY3J5cHRpb25LZXkgPSBlbmNyeXB0aW9uS2V5T3ZlcnJpZGUgPz8gcmVzdWx0LmVuY3J5cHRpb25LZXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaG9vayA9IHRva2VuT3JIb29rO1xuICAgICAgICAgIHdvcmtmbG93UnVuID0gYXdhaXQgd29ybGQucnVucy5nZXQoaG9vay5ydW5JZCk7XG4gICAgICAgICAgaWYgKGVuY3J5cHRpb25LZXlPdmVycmlkZSkge1xuICAgICAgICAgICAgZW5jcnlwdGlvbktleSA9IGVuY3J5cHRpb25LZXlPdmVycmlkZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcmF3S2V5ID0gYXdhaXQgd29ybGQuZ2V0RW5jcnlwdGlvbktleUZvclJ1bj8uKHdvcmtmbG93UnVuKTtcbiAgICAgICAgICAgIGVuY3J5cHRpb25LZXkgPSByYXdLZXkgPyBhd2FpdCBpbXBvcnRLZXkocmF3S2V5KSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuSG9va1Rva2VuKGhvb2sudG9rZW4pLFxuICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Ib29rSWQoaG9vay5ob29rSWQpLFxuICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1bklkKGhvb2sucnVuSWQpLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDaGVjayB0aGUgdGFyZ2V0IHJ1bidzIGNhcGFiaWxpdGllcyB0byBlbnN1cmUgd2UgZW5jb2RlIHRoZVxuICAgICAgICAvLyBwYXlsb2FkIGluIGEgZm9ybWF0IHRoZSBydW4ncyBkZXBsb3ltZW50IGNhbiBkZWNvZGUuIEZvciBleGFtcGxlLFxuICAgICAgICAvLyBydW5zIGNyZWF0ZWQgYmVmb3JlIGVuY3J5cHRpb24gc3VwcG9ydCB3YXMgYWRkZWQgY2Fubm90IGRlY29kZVxuICAgICAgICAvLyB0aGUgJ2VuY3InIHNlcmlhbGl6YXRpb24gZm9ybWF0LCBhbmQgcnVucyBjcmVhdGVkIGJlZm9yZVxuICAgICAgICAvLyBieXRlLXN0cmVhbSBmcmFtaW5nIHN1cHBvcnQgY2Fubm90IGRlY29kZSBmcmFtZWQgYnl0ZSBzdHJlYW1zLlxuICAgICAgICBjb25zdCByYXdWZXJzaW9uID0gd29ya2Zsb3dSdW4uZXhlY3V0aW9uQ29udGV4dD8ud29ya2Zsb3dDb3JlVmVyc2lvbjtcbiAgICAgICAgY29uc3QgY2FwYWJpbGl0aWVzID0gZ2V0UnVuQ2FwYWJpbGl0aWVzKFxuICAgICAgICAgIHR5cGVvZiByYXdWZXJzaW9uID09PSAnc3RyaW5nJyA/IHJhd1ZlcnNpb24gOiB1bmRlZmluZWRcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKCFjYXBhYmlsaXRpZXMuc3VwcG9ydGVkRm9ybWF0cy5oYXMoU2VyaWFsaXphdGlvbkZvcm1hdC5FTkNSWVBURUQpKSB7XG4gICAgICAgICAgZW5jcnlwdGlvbktleSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlaHlkcmF0ZSB0aGUgcGF5bG9hZCBmb3Igc3RvcmFnZVxuICAgICAgICBjb25zdCBvcHM6IFByb21pc2U8YW55PltdID0gW107XG4gICAgICAgIGNvbnN0IHYxQ29tcGF0ID0gaXNMZWdhY3lTcGVjVmVyc2lvbihob29rLnNwZWNWZXJzaW9uKTtcbiAgICAgICAgY29uc3QgZGVoeWRyYXRlZFBheWxvYWQgPSBhd2FpdCBkZWh5ZHJhdGVTdGVwUmV0dXJuVmFsdWUoXG4gICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICBob29rLnJ1bklkLFxuICAgICAgICAgIGVuY3J5cHRpb25LZXksXG4gICAgICAgICAgb3BzLFxuICAgICAgICAgIGdsb2JhbFRoaXMsXG4gICAgICAgICAgdjFDb21wYXQsXG4gICAgICAgICAgY2FwYWJpbGl0aWVzLmZyYW1lZEJ5dGVTdHJlYW1zXG4gICAgICAgICk7XG4gICAgICAgIC8vIFRoZXNlIHBheWxvYWQtc3RyZWFtIG9wcyBhcmUgZmx1c2hlZCBpbiB0aGUgYmFja2dyb3VuZDsgdGhlXG4gICAgICAgIC8vIHByb21pc2UgaGFuZGVkIHRvIHdhaXRVbnRpbCBtdXN0IG5ldmVyIHJlamVjdCAoYW4gdW5jb25zdW1lZFxuICAgICAgICAvLyB3YWl0VW50aWwgcmVqZWN0aW9uIGNyYXNoZXMgdGhlIHByb2Nlc3MgYXMgdW5oYW5kbGVkUmVqZWN0aW9uKSxcbiAgICAgICAgLy8gc28gdW5leHBlY3RlZCBmYWlsdXJlcyBhcmUgbG9nZ2VkIGluc3RlYWQuXG4gICAgICAgIC8vIE5PVEU6IHJlamVjdGlvbnMgd2l0aCBgdW5kZWZpbmVkYCBhcmUgYW4gZXhwZWN0ZWQgYXJ0aWZhY3Qgb2YgdGhlXG4gICAgICAgIC8vIHdlYmhvb2sgYnVuZGxlIGFuZCBhcmUgaWdub3JlZCBlbnRpcmVseS5cbiAgICAgICAgc2FmZVdhaXRVbnRpbChQcm9taXNlLmFsbChvcHMpLCAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVyciA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgcnVudGltZUxvZ2dlci53YXJuKCdCYWNrZ3JvdW5kIGZsdXNoIG9mIGhvb2sgcGF5bG9hZCBvcHMgZmFpbGVkJywge1xuICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogaG9vay5ydW5JZCxcbiAgICAgICAgICAgIGhvb2tJZDogaG9vay5ob29rSWQsXG4gICAgICAgICAgICBlcnJvcjogZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDcmVhdGUgYSBob29rX3JlY2VpdmVkIGV2ZW50IHdpdGggdGhlIHBheWxvYWRcbiAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICBob29rLnJ1bklkLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGV2ZW50VHlwZTogJ2hvb2tfcmVjZWl2ZWQnLFxuICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgY29ycmVsYXRpb25JZDogaG9vay5ob29rSWQsXG4gICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgLi4uKHYxQ29tcGF0ID8ge30gOiB7IHRva2VuOiBob29rLnRva2VuIH0pLFxuICAgICAgICAgICAgICBwYXlsb2FkOiBkZWh5ZHJhdGVkUGF5bG9hZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7IHYxQ29tcGF0IH1cbiAgICAgICAgKTtcblxuICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dOYW1lKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHRyYWNlQ2FycmllciA9IHdvcmtmbG93UnVuLmV4ZWN1dGlvbkNvbnRleHQ/LnRyYWNlQ2FycmllcjtcblxuICAgICAgICBpZiAodHJhY2VDYXJyaWVyKSB7XG4gICAgICAgICAgY29uc3QgY29udGV4dCA9IGF3YWl0IGdldFNwYW5Db250ZXh0Rm9yVHJhY2VDYXJyaWVyKHRyYWNlQ2Fycmllcik7XG4gICAgICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgICAgIHNwYW4/LmFkZExpbms/Lih7IGNvbnRleHQgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmUtdHJpZ2dlciB0aGUgd29ya2Zsb3cgYWdhaW5zdCB0aGUgZGVwbG95bWVudCBJRCBhc3NvY2lhdGVkXG4gICAgICAgIC8vIHdpdGggdGhlIHdvcmtmbG93IHJ1biB0aGF0IHRoZSBob29rIGJlbG9uZ3MgdG9cbiAgICAgICAgYXdhaXQgd29ybGQucXVldWUoXG4gICAgICAgICAgZ2V0V29ya2Zsb3dRdWV1ZU5hbWUod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBydW5JZDogaG9vay5ydW5JZCxcbiAgICAgICAgICAgIC8vIGF0dGFjaCB0aGUgdHJhY2UgY2FycmllciBmcm9tIHRoZSB3b3JrZmxvdyBydW5cbiAgICAgICAgICAgIHRyYWNlQ2FycmllcjpcbiAgICAgICAgICAgICAgd29ya2Zsb3dSdW4uZXhlY3V0aW9uQ29udGV4dD8udHJhY2VDYXJyaWVyID8/IHVuZGVmaW5lZCxcbiAgICAgICAgICB9IHNhdGlzZmllcyBXb3JrZmxvd0ludm9rZVBheWxvYWQsXG4gICAgICAgICAge1xuICAgICAgICAgICAgZGVwbG95bWVudElkOiB3b3JrZmxvd1J1bi5kZXBsb3ltZW50SWQsXG4gICAgICAgICAgICBzcGVjVmVyc2lvbjogd29ya2Zsb3dSdW4uc3BlY1ZlcnNpb24gPz8gU1BFQ19WRVJTSU9OX0xFR0FDWSxcbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIGhvb2s7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgLi4uQXR0cmlidXRlLkhvb2tUb2tlbihcbiAgICAgICAgICAgIHR5cGVvZiB0b2tlbk9ySG9vayA9PT0gJ3N0cmluZycgPyB0b2tlbk9ySG9vayA6IHRva2VuT3JIb29rLnRva2VuXG4gICAgICAgICAgKSxcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuSG9va0ZvdW5kKGZhbHNlKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmVzdW1lcyBhIHdlYmhvb2sgYnkgc2VuZGluZyBhIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvUmVxdWVzdCB8IFJlcXVlc3R9XG4gKiBvYmplY3QgdG8gYSBob29rIGlkZW50aWZpZWQgYnkgaXRzIHRva2VuLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGV4dGVybmFsbHkgKGUuZy4sIGZyb20gYW4gQVBJIHJvdXRlIG9yIHNlcnZlciBhY3Rpb24pXG4gKiB0byBzZW5kIGEgcmVxdWVzdCB0byBhIHdlYmhvb2sgYW5kIHJlc3VtZSB0aGUgYXNzb2NpYXRlZCB3b3JrZmxvdyBydW4uXG4gKlxuICogQHBhcmFtIHRva2VuIC0gVGhlIHVuaXF1ZSB0b2tlbiBpZGVudGlmeWluZyB0aGUgaG9va1xuICogQHBhcmFtIHJlcXVlc3QgLSBUaGUgcmVxdWVzdCB0byBzZW5kIHRvIHRoZSBob29rXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byB0aGUgcmVzcG9uc2VcbiAqIEB0aHJvd3MgRXJyb3IgaWYgdGhlIGhvb2sgaXMgbm90IGZvdW5kIG9yIGlmIHRoZXJlJ3MgYW4gZXJyb3IgZHVyaW5nIHRoZSBwcm9jZXNzXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBgYGB0c1xuICogLy8gSW4gYW4gQVBJIHJvdXRlXG4gKiBpbXBvcnQgeyByZXN1bWVXZWJob29rIH0gZnJvbSAnQHdvcmtmbG93L2NvcmUvcnVudGltZSc7XG4gKlxuICogZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogUmVxdWVzdCkge1xuICogICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlcXVlc3QudXJsKTtcbiAqICAgY29uc3QgdG9rZW4gPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgndG9rZW4nKTtcbiAqXG4gKiAgIGlmICghdG9rZW4pIHtcbiAqICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdNaXNzaW5nIHRva2VuJywgeyBzdGF0dXM6IDQwMCB9KTtcbiAqICAgfVxuICpcbiAqICAgdHJ5IHtcbiAqICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlc3VtZVdlYmhvb2sodG9rZW4sIHJlcXVlc3QpO1xuICogICAgIHJldHVybiByZXNwb25zZTtcbiAqICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdXZWJob29rIG5vdCBmb3VuZCcsIHsgc3RhdHVzOiA0MDQgfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdW1lV2ViaG9vayhcbiAgdG9rZW46IHN0cmluZyxcbiAgcmVxdWVzdDogUmVxdWVzdFxuKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICBjb25zdCB7IGhvb2ssIGVuY3J5cHRpb25LZXkgfSA9IGF3YWl0IGdldEhvb2tCeVRva2VuV2l0aEtleSh0b2tlbik7XG5cbiAgLy8gT25seSB3ZWJob29rcyBjYW4gYmUgcmVzdW1lZCB2aWEgdGhlIHB1YmxpYyBlbmRwb2ludC5cbiAgLy8gSWYgdGhlIGhvb2sgd2FzIGNyZWF0ZWQgdmlhIGNyZWF0ZUhvb2soKSAoaXNXZWJob29rICE9PSB0cnVlKSxcbiAgLy8gdGhyb3cgdGhlIHNhbWUgXCJub3QgZm91bmRcIiBlcnJvciB0aGUgd29ybGQgd291bGQgdGhyb3cgZm9yIGEgbWlzc2luZ1xuICAvLyB0b2tlbi4gVGhpcyBwcmV2ZW50cyBsZWFraW5nIHRoYXQgdGhlIHRva2VuIGlzIHZhbGlkLlxuICBpZiAoaG9vay5pc1dlYmhvb2sgPT09IGZhbHNlKSB7XG4gICAgdGhyb3cgbmV3IEhvb2tOb3RGb3VuZEVycm9yKHRva2VuKTtcbiAgfVxuXG4gIGxldCByZXNwb25zZTogUmVzcG9uc2UgfCB1bmRlZmluZWQ7XG4gIGxldCByZXNwb25zZVJlYWRhYmxlOiBSZWFkYWJsZVN0cmVhbTxSZXNwb25zZT4gfCB1bmRlZmluZWQ7XG4gIGlmIChcbiAgICBob29rLm1ldGFkYXRhICYmXG4gICAgdHlwZW9mIGhvb2subWV0YWRhdGEgPT09ICdvYmplY3QnICYmXG4gICAgJ3Jlc3BvbmRXaXRoJyBpbiBob29rLm1ldGFkYXRhXG4gICkge1xuICAgIGlmIChob29rLm1ldGFkYXRhLnJlc3BvbmRXaXRoID09PSAnbWFudWFsJykge1xuICAgICAgY29uc3QgeyByZWFkYWJsZSwgd3JpdGFibGUgfSA9IG5ldyBUcmFuc2Zvcm1TdHJlYW08UmVzcG9uc2UsIFJlc3BvbnNlPigpO1xuICAgICAgcmVzcG9uc2VSZWFkYWJsZSA9IHJlYWRhYmxlO1xuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBpbnN0YW5jZSBpbmNsdWRlcyB0aGUgd3JpdGFibGUgc3RyZWFtIHdoaWNoIHdpbGwgYmUgdXNlZFxuICAgICAgLy8gdG8gd3JpdGUgdGhlIHJlc3BvbnNlIHRvIHRoZSBjbGllbnQgZnJvbSB3aXRoaW4gdGhlIHdvcmtmbG93IHJ1blxuICAgICAgKHJlcXVlc3QgYXMgYW55KVtXRUJIT09LX1JFU1BPTlNFX1dSSVRBQkxFXSA9IHdyaXRhYmxlO1xuICAgIH0gZWxzZSBpZiAoaG9vay5tZXRhZGF0YS5yZXNwb25kV2l0aCBpbnN0YW5jZW9mIFJlc3BvbnNlKSB7XG4gICAgICByZXNwb25zZSA9IGhvb2subWV0YWRhdGEucmVzcG9uZFdpdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcihcbiAgICAgICAgYEludmFsaWQgXFxgcmVzcG9uZFdpdGhcXGAgdmFsdWU6ICR7aG9vay5tZXRhZGF0YS5yZXNwb25kV2l0aH1gLFxuICAgICAgICB7IHNsdWc6IEVSUk9SX1NMVUdTLldFQkhPT0tfSU5WQUxJRF9SRVNQT05EX1dJVEhfVkFMVUUgfVxuICAgICAgKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gTm8gYHJlc3BvbmRXaXRoYCB2YWx1ZSBpbXBsaWVzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mIHJldHVybmluZyBhIDIwMlxuICAgIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHsgc3RhdHVzOiAyMDIgfSk7XG4gIH1cblxuICBhd2FpdCByZXN1bWVIb29rKGhvb2ssIHJlcXVlc3QsIGVuY3J5cHRpb25LZXkpO1xuXG4gIGlmIChyZXNwb25zZVJlYWRhYmxlKSB7XG4gICAgLy8gV2FpdCBmb3IgdGhlIHJlYWRhYmxlIHN0cmVhbSB0byBlbWl0IG9uZSBjaHVuayxcbiAgICAvLyB3aGljaCBpcyB0aGUgYFJlc3BvbnNlYCBvYmplY3RcbiAgICBjb25zdCByZWFkZXIgPSByZXNwb25zZVJlYWRhYmxlLmdldFJlYWRlcigpO1xuICAgIGNvbnN0IGNodW5rID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICBpZiAoY2h1bmsudmFsdWUpIHtcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgbWF0ZXJpYWxpemVSZXNwb25zZUJvZHkoY2h1bmsudmFsdWUpO1xuICAgIH1cbiAgICBhd2FpdCByZWFkZXIuY2FuY2VsKCk7XG4gIH1cblxuICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKCdXb3JrZmxvdyBydW4gZGlkIG5vdCBzZW5kIGEgcmVzcG9uc2UnLCB7XG4gICAgICBzbHVnOiBFUlJPUl9TTFVHUy5XRUJIT09LX1JFU1BPTlNFX05PVF9TRU5ULFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7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bUJBQW1CO0FBQzNDLFNBQVMsZ0JBQWdCOzs7QUYrQ3pCLFNBQ0UsUUFDQSxXQUdEO0FBQ0QsU0FDRSxXQUNBLGFBR0EsWUFDQSx5QkFDQSxjQUdBLGlCQUNEO0FBQ0QsU0FLRSxhQUNEO0FBQ0QsU0FBUyxzQkFBc0I7QUFDL0IsU0FDRSxhQUNBLFlBQUFDLFdBQ0Esb0JBQUFDLG1CQUNBLGdCQUNEOyIsCiAgIm5hbWVzIjogWyJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJmZXRjaCIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJ6IiwgInoiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiRmF0YWxFcnJvciIsICJ6IiwgInoiLCAicGFyc2VkIiwgIndyaXRlUHJvZ3Jlc3NDaHVuayIsICJjbG9zZVByb2dyZXNzU3RyZWFtIiwgIkNsaWVudCIsICJ3aXRoUGdDbGllbnQiLCAiQ2xpZW50IiwgInF1ZXJ5Um93cyIsICJyZWFkIiwgInV0aWxzIiwgInV0aWxzIiwgInV0aWxzIiwgInBvcyIsICJ1dGlscyIsICJ1dGlscyIsICJzdGFydCIsICJ1dGlscyIsICJjb2x1bW5LZXlzIiwgInJhd0hlYWRlciIsICJGYXRhbEVycm9yIiwgInJlYWQiLCAid2l0aFBnQ2xpZW50IiwgImVtaXRQcm9ncmVzc1N0ZXAiLCAid3JpdGVQcm9ncmVzc0NodW5rIiwgImNsb3NlUHJvZ3Jlc3NTdGVwIiwgImNsb3NlUHJvZ3Jlc3NTdHJlYW0iLCAicXVlcnlSb3dzIiwgImNyZWF0ZWQiLCAic2V0RHluYW1pY1BhZ2VzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgIlJlcGxheURpdmVyZ2VuY2VFcnJvciIsICJXb3JrZmxvd1J1bnRpbWVFcnJvciIsICJwYXJzZVdvcmtmbG93TmFtZSIsICJTUEVDX1ZFUlNJT05fQ1VSUkVOVCIsICJTUEVDX1ZFUlNJT05fTEVHQUNZIiwgImltcG9ydEtleSIsICJXb3JrZmxvd1N1c3BlbnNpb24iLCAicnVudGltZUxvZ2dlciIsICJnZXRXb3JrZmxvd1F1ZXVlTmFtZSIsICJnZXRXb3JsZCIsICJBdHRyaWJ1dGUiLCAidHJhY2UiLCAiV29ya2Zsb3dTdXNwZW5zaW9uIiwgIkVSUk9SX1NMVUdTIiwgIldvcmtmbG93UnVudGltZUVycm9yIiwgInJ1bnRpbWVMb2dnZXIiLCAiQXR0cmlidXRlIiwgInRyYWNlIiwgImdldFdvcmxkIiwgImdldFdvcmxkSGFuZGxlcnMiXQp9Cg==
