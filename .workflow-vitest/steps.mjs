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
      ${p.blockTypes.map((bt) => `{ blockType: '${bt}' as BlockType, config: {} }`).join(",\n      ")}
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
function pluralizeModelName(name) {
  if (/s$/i.test(name) && !/(ss|us)$/i.test(name)) return name;
  if (/[sxz]$/i.test(name) || /(ch|sh)$/i.test(name)) return `${name}es`;
  if (/[^aeiou]y$/i.test(name)) return `${name.slice(0, -1)}ies`;
  return `${name}s`;
}
__name(pluralizeModelName, "pluralizeModelName");
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
  const aiPages = def.pages.map((p) => {
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
  });
  const modelPages = def.models.map((model) => {
    const title = pluralizeModelName(model.name);
    return {
      id: `page_${packId}_${def.appId}_model_${model.tableName}`,
      slug: `${packId}-${def.appId}-${model.tableName}`,
      title,
      authTier: "pin",
      navLabel: title,
      showInNav: true,
      tenantSlug,
      sections: [
        {
          blockType: "pack_table",
          config: {
            table: model.tableName,
            title: model.name
          }
        }
      ]
    };
  });
  const pages = [
    root,
    ...aiPages,
    ...modelPages
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
  def.models.forEach((model, i) => {
    const title = pluralizeModelName(model.name);
    nav.push({
      id: `nav_${packId}_${def.appId}_model_${model.tableName}`,
      title,
      path: `/${packId}-${def.appId}-${model.tableName}`,
      icon: "",
      requiredGroups: groupCode,
      isDynamic: true,
      sortOrder: def.nav.pages.length + i + 1,
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
var APP_PACK_ENUM_DDL = [
  `DO $$ BEGIN CREATE TYPE "AuthTier" AS ENUM ('public', 'pin', 'google'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "BlockType" AS ENUM ('hero', 'metric_grid', 'chart_financial', 'lever_accordion', 'action_checklist', 'doc_markdown', 'pnl_table', 'z_report_form', 'costs_form', 'calendar_import', 'chat_panel', 'kpi_cards', 'ops_admin_tabs', 'review_blocks', 'reports_rollup', 'sheet_viewer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  // Newer block types may be missing from pre-existing enums.
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'ops_admin_tabs'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'review_blocks'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'reports_rollup'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'sheet_viewer'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'pack_table'`
];
var APP_PACK_TABLE_DDL = [
  `CREATE TABLE IF NOT EXISTS security_groups (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS app_pages (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    auth_tier "AuthTier" NOT NULL DEFAULT 'public',
    sort_order INTEGER NOT NULL DEFAULT 0,
    nav_label TEXT,
    show_in_nav BOOLEAN NOT NULL DEFAULT true,
    tenant_slug TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS page_sections (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL REFERENCES app_pages(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    block_type "BlockType" NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'
  )`,
  `CREATE INDEX IF NOT EXISTS page_sections_page_id_sort_order_idx ON page_sections(page_id, sort_order)`,
  `CREATE TABLE IF NOT EXISTS navigation_items (
    id TEXT PRIMARY KEY,
    parent_id TEXT REFERENCES navigation_items(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    path TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT '',
    auth_tier TEXT NOT NULL DEFAULT 'public',
    tenant_slug TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    required_groups TEXT NOT NULL DEFAULT '',
    is_visible BOOLEAN NOT NULL DEFAULT true,
    is_dynamic BOOLEAN NOT NULL DEFAULT false,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS knowledge_snippets (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    category TEXT NOT NULL
  )`
];
var APP_PACK_TABLE_ALTERS = [
  `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS nav_label TEXT`,
  `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS show_in_nav BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS tenant_slug TEXT`,
  `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS tenant_slug TEXT`,
  `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false`
];
async function ensureAppPackTables(client) {
  for (const stmt of APP_PACK_ENUM_DDL) {
    await client.query(stmt);
  }
  for (const stmt of APP_PACK_TABLE_DDL) {
    await client.query(stmt);
  }
  for (const stmt of APP_PACK_TABLE_ALTERS) {
    try {
      await client.query(stmt);
    } catch {
    }
  }
}
__name(ensureAppPackTables, "ensureAppPackTables");
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
  await ensureAppPackTables(client);
  counts.groups = await upsertSecurityGroups(client, apps);
  const pageSlugPrefix = `${packId}-%`;
  await client.query(`DELETE FROM app_pages WHERE slug LIKE $1 AND tenant_slug = $2;`, [
    pageSlugPrefix,
    tenantSlug
  ]);
  await client.query(`DELETE FROM navigation_items WHERE id LIKE $1 AND tenant_slug = $2;`, [
    `nav_${packId}_%`,
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

// src/domain/app-pack/app-pack-schema-apply.ts
function mapSqlType(fieldType) {
  switch (fieldType) {
    case "string":
      return "TEXT";
    case "text":
      return "TEXT";
    case "integer":
      return "INTEGER";
    case "decimal":
      return "NUMERIC(14,2)";
    case "boolean":
      return "BOOLEAN";
    case "datetime":
      return "TIMESTAMP";
    case "date":
      return "DATE";
    case "time":
      return "TIME";
    case "enum":
      return "TEXT";
    case "json":
      return "JSONB";
    case "relation":
      return "TEXT";
    default:
      return "TEXT";
  }
}
__name(mapSqlType, "mapSqlType");
function mapSqlDefault(field) {
  const d = field.default;
  if (d === void 0 || d === null) return null;
  if (typeof d === "string") return `DEFAULT '${d.replace(/'/g, "''")}'`;
  if (typeof d === "boolean") return `DEFAULT ${d}`;
  if (typeof d === "number") return `DEFAULT ${d}`;
  return null;
}
__name(mapSqlDefault, "mapSqlDefault");
function compileTableDDL(model) {
  const columns = [
    "id TEXT PRIMARY KEY",
    "tenant_slug TEXT"
  ];
  for (const f of model.fields) {
    const type = mapSqlType(f.type);
    const nullable = f.required ? "NOT NULL" : "";
    const unique = f.unique ? "UNIQUE" : "";
    const def = mapSqlDefault(f);
    columns.push(`  ${f.name} ${type} ${nullable} ${unique} ${def ?? ""}`.replace(/\s+/g, " ").trim());
  }
  columns.push("created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
  columns.push("updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
  return `CREATE TABLE IF NOT EXISTS "${model.tableName}" (
${columns.join(",\n")}
);`;
}
__name(compileTableDDL, "compileTableDDL");
function compileTableAlters(model) {
  const alters = [];
  for (const f of model.fields) {
    const type = mapSqlType(f.type);
    const nullable = f.required ? "NOT NULL" : "";
    const def = mapSqlDefault(f);
    alters.push(`ALTER TABLE "${model.tableName}" ADD COLUMN IF NOT EXISTS ${f.name} ${type} ${nullable} ${def ?? ""}`.replace(/\s+/g, " ").trim());
  }
  return alters;
}
__name(compileTableAlters, "compileTableAlters");
function compilePackZModel(definitions) {
  const seen = /* @__PURE__ */ new Set();
  const models = definitions.flatMap((def) => def.models.map((m) => {
    let name = m.name;
    if (seen.has(name)) {
      name = `${name}_${def.appId.replace(/[^a-zA-Z0-9]/g, "")}`;
    }
    seen.add(name);
    return {
      ...m,
      name
    };
  }));
  const merged = {
    templateId: "app-pack",
    schemaOrgType: "LocalBusiness",
    models,
    useCases: definitions.flatMap((d) => d.useCases),
    pages: definitions.flatMap((d) => d.pages)
  };
  return compileToZModel(merged);
}
__name(compilePackZModel, "compilePackZModel");
async function applyPackSchema(client, definitions) {
  const startedAt = Date.now();
  const zmodel = compilePackZModel(definitions);
  for (const def of definitions) {
    for (const model of def.models) {
      await client.query(compileTableDDL(model));
      await client.query(`CREATE INDEX IF NOT EXISTS "${model.tableName}_tenant_slug_idx" ON "${model.tableName}" (tenant_slug);`);
      for (const alter of compileTableAlters(model)) {
        try {
          await client.query(alter);
        } catch {
        }
      }
    }
  }
  return {
    zmodel,
    applied: true,
    durationMs: Date.now() - startedAt
  };
}
__name(applyPackSchema, "applyPackSchema");

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
async function applyPackSchemaStep(input, definitions) {
  return withPgClient(input.dbUrl, (db) => applyPackSchema(db, definitions));
}
__name(applyPackSchemaStep, "applyPackSchemaStep");
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
registerStepFunction3("step//./workflows/app-pack-generate/steps//applyPackSchemaStep", applyPackSchemaStep);
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
      const isNumeric = typeof cell === "number" || typeof cell === "string" && /^[\d,.-]+$/.test(str.trim()) && isFinite(num);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2xpYi9wYWdlLWNhdGFsb2cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL3dvcmtmbG93L3NyYy9pbnRlcm5hbC9idWlsdGlucy50cyIsICIuLi9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL3N0ZGxpYi50cyIsICIuLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMudHMiLCAiLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1nZW5lcmF0b3IudHMiLCAiLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1zY2hlbWEudHMiLCAiLi4vc3JjL2RvbWFpbi9haS9zY2hlbWEtZ2VuZXJhdGlvbi1zY2hlbWEudHMiLCAiLi4vc3JjL2RvbWFpbi9haS96bW9kZWwtY29tcGlsZXIudHMiLCAiLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1jb21waWxlci50cyIsICIuLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLW1hdGVyaWFsaXplci50cyIsICIuLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLXNjaGVtYS1hcHBseS50cyIsICIuLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvcHJvZ3Jlc3MudHMiLCAiLi4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL2RiLnRzIiwgIi4uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMudHMiLCAiLi4vc3JjL2RvbWFpbi9haS13b3JrYm9vay9leHRyYWN0LXNoZWV0cy50cyIsICIuLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL3NoZWV0LWFuYWx5c2lzLnRzIiwgIi4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svY29tcHJlaGVuZC50cyIsICIuLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3Byb2dyZXNzLnRzIiwgIi4uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3QvZGIudHMiLCAiLi4vc3JjL2xpYi93b3JrYm9vay1mb3JtdWxhcy50cyIsICIuLi9zcmMvbGliL2V4Y2VsLWZvcm11bGEudHMiLCAiLi4vc3JjL2xpYi93b3JrYm9vay1tYXBwaW5nLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvYnVpbGRlcnMvc3JjL3NlcmRlLWNoZWNrZXIudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9ydW50aW1lLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvd29ya2Zsb3cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9ydW50aW1lL3Jlc3VtZS1ob29rLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIENvZGUtZmlyc3QgcGFnZSBjYXRhbG9nIFx1MjAxNCBydW50aW1lIFNTb1QgYXQgTVZQLlxuICogU3VwcG9ydHMgc3RhdGljIGNhdGFsb2cgZW50cmllcyBhbmQgZHluYW1pY2FsbHkgcmVnaXN0ZXJlZCBwYWdlc1xuICogKGUuZy4gZnJvbSB3b3JrYm9vayBhbmFseXNpcyBhZnRlciBhbiBFeGNlbCB1cGxvYWQpLlxuICpcbiAqIERCIEFwcFBhZ2UvUGFnZVNlY3Rpb24gc2VlZGVkIGluIFA2OyBjYXRhbG9nIHdpbnMgYXQgcnVudGltZS5cbiAqLyAvKiogUGFydHMgZnJvbSB0aGUgdXBsb2FkZWQgQnVzaW5lc3MgUmV2aWV3IFx1MjAxNCBwb3B1bGF0ZWQgZHluYW1pY2FsbHkgYXQgcmVuZGVyIHRpbWUuICovIC8qKiBTdGF0aWMgcGFydHMgQVx1MjAxM0cgZXhpc3QgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aCBsZWdhY3kgc2VlZGVkIGRvY3MuIER5bmFtaWMgcGFydHMgb3ZlcnJpZGUgdGhlc2UuICovIGNvbnN0IFNUQVRJQ19QQVJUUyA9IHtcbiAgICAncGFydC1hJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtYScsXG4gICAgICAgIHBhcnRLZXk6ICdBJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEE6IEN1cnJlbnQgU2l0dWF0aW9uIFx1MjAxNCBUaGUgTnVtYmVycycsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtYic6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWInLFxuICAgICAgICBwYXJ0S2V5OiAnQicsXG4gICAgICAgIHRpdGxlOiAnUGFydCBCOiBUaGUgMTAtWWVhciBHcm93dGggTW9kZWwnLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWMnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1jJyxcbiAgICAgICAgcGFydEtleTogJ0MnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgQzogUmV2ZW51ZSBPcHRpbWl6YXRpb24gU3RyYXRlZ3knLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWQnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1kJyxcbiAgICAgICAgcGFydEtleTogJ0QnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRDogQ29zdCBNYW5hZ2VtZW50JyxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnXG4gICAgfSxcbiAgICAncGFydC1lJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtZScsXG4gICAgICAgIHBhcnRLZXk6ICdFJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEU6IFJpc2sgUmVnaXN0ZXInLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWYnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1mJyxcbiAgICAgICAgcGFydEtleTogJ0YnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRjogU3RhcldPUkxEIE1lbWJlcnNoaXAgUHJvZ3JhbScsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtZyc6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWcnLFxuICAgICAgICBwYXJ0S2V5OiAnRycsXG4gICAgICAgIHRpdGxlOiAnUGFydCBHOiBJbW1lZGlhdGUgQWN0aW9ucyAoTmV4dCAzMCBEYXlzKScsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH1cbn07XG4vKiogRHluYW1pYyBwYXJ0cyBwb3B1bGF0ZWQgZnJvbSBwYXJzZWQgQnVzaW5lc3MgUmV2aWV3IE1EIHVwbG9hZGVkIHZpYSAvY29uZmlnLiAqLyBsZXQgRFlOQU1JQ19QQVJUUyA9IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIHNldER5bmFtaWNSZXZpZXdQYXJ0cyhwYXJ0cykge1xuICAgIERZTkFNSUNfUEFSVFMgPSBPYmplY3QuZnJvbUVudHJpZXMocGFydHMubWFwKChwKT0+W1xuICAgICAgICAgICAgcC5wYXJ0U2x1ZyxcbiAgICAgICAgICAgIHBcbiAgICAgICAgXSkpO1xufVxuLyoqXG4gKiBEeW5hbWljIGdldHRlciB0aGF0IG1lcmdlcyBzdGF0aWMgKyBhbnkgcnVudGltZS1yZWdpc3RlcmVkIHBhcnRzLlxuICogVXNlIGluc3RlYWQgb2YgUkVWSUVXX1BBUlRfQ0FUQUxPRyBzbyB0aGF0IHNldER5bmFtaWNSZXZpZXdQYXJ0cygpIGNhbGxzXG4gKiBhcmUgcmVmbGVjdGVkIGltbWVkaWF0ZWx5LlxuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5TVEFUSUNfUEFSVFMsXG4gICAgICAgIC4uLkRZTkFNSUNfUEFSVFNcbiAgICB9O1xufVxuLyoqIEBkZXByZWNhdGVkIFVzZSBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpIFx1MjAxNCB0aGlzIGNvbnN0IGlzIGZyb3plbiBhdCBtb2R1bGUgbG9hZCB0aW1lLiAqLyBleHBvcnQgY29uc3QgUkVWSUVXX1BBUlRfQ0FUQUxPRyA9IHtcbiAgICAuLi5TVEFUSUNfUEFSVFMsXG4gICAgLi4uRFlOQU1JQ19QQVJUU1xufTtcbi8qKiBEeW5hbWljIHBhZ2VzIHJlZ2lzdGVyZWQgYXQgcnVudGltZSAoZS5nLiBmcm9tIHdvcmtib29rIGFuYWx5c2lzIGFmdGVyIHJlc2VlZCkuICovIGxldCBEWU5BTUlDX1BBR0VTID0ge307XG4vKipcbiAqIFJlZ2lzdGVyIGR5bmFtaWNhbGx5IGdlbmVyYXRlZCBwYWdlcyBcdTIwMTQgY2FsbGVkIGFmdGVyIHdvcmtib29rIGFuYWx5c2lzXG4gKiBkdXJpbmcgdGhlIHJlc2VlZCBwaXBlbGluZSBzbyBzaGVldC1kZXJpdmVkIGFuYWx5dGljcyBwYWdlcyBhcHBlYXIgaW4gdGhlIG5hdi5cbiAqLyBleHBvcnQgZnVuY3Rpb24gc2V0RHluYW1pY1BhZ2VzKHBhZ2VzKSB7XG4gICAgRFlOQU1JQ19QQUdFUyA9IE9iamVjdC5mcm9tRW50cmllcyhwYWdlcy5tYXAoKHApPT5bXG4gICAgICAgICAgICBwLnNsdWcsXG4gICAgICAgICAgICBwXG4gICAgICAgIF0pKTtcbn1cbi8qKiBDb21iaW5lZCBzdGF0aWMgKyBkeW5hbWljIHBhZ2UgY2F0YWxvZyAoZXZhbHVhdGVkIGxhemlseSBzbyBkeW5hbWljIHBhZ2VzIGFyZSBpbmNsdWRlZCkuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRGdWxsQ2F0YWxvZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5QQUdFX0NBVEFMT0csXG4gICAgICAgIC4uLkRZTkFNSUNfUEFHRVNcbiAgICB9O1xufVxuZXhwb3J0IGNvbnN0IFBBR0VfQ0FUQUxPRyA9IHtcbiAgICBob21lOiB7XG4gICAgICAgIHNsdWc6ICdob21lJyxcbiAgICAgICAgdGl0bGU6ICdIb21lJyxcbiAgICAgICAgbmF2TGFiZWw6ICdIb21lJyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnaGVybycsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnV2VsY29tZScsXG4gICAgICAgICAgICAgICAgICAgIHN1YnRpdGxlOiAnWW91ciBidXNpbmVzcyBhcHBsaWNhdGlvbiBcdTIwMTQgY29uZmlndXJlIHBhZ2VzLCBkYXRhIGFuZCBicmFuZGluZyBmcm9tIHRoZSBBZG1pbiBhcmVhLicsXG4gICAgICAgICAgICAgICAgICAgIG1pblRpZXI6ICdwdWJsaWMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICBkYXNoYm9hcmQ6IHtcbiAgICAgICAgc2x1ZzogJ2Rhc2hib2FyZCcsXG4gICAgICAgIHRpdGxlOiAnRGFzaGJvYXJkJyxcbiAgICAgICAgbmF2TGFiZWw6ICdEYXNoYm9hcmQnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncHVibGljJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdoZXJvJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2U6ICdKdWx5IDIwMjYgXHUwMEI3IEV4aXQgVmlhYmlsaXR5IFJldmlldycsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnQnVzaW5lc3MgUmV2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgc3VidGl0bGU6ICdFeGl0LXZpYWJpbGl0eSBhc3Nlc3NtZW50IGZvciBQVCBUYW1hbiBCaW50YW5nIEJhbGkgXHUyMDE0IHJldmVudWUgdW5kZXIgcHJlc3N1cmUsIG1hcmdpbiBlcm9zaW9uIGRldGVjdGVkLCBzaGFyZWhvbGRlciBzZWVraW5nIHBhdGh3YXkgb3V0LicsXG4gICAgICAgICAgICAgICAgICAgIG1pblRpZXI6ICdwdWJsaWMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIC8vICAgY29uZmlnOiB7IHZhcmlhbnQ6ICdkYXNoYm9hcmQnLCBzY2VuYXJpbzogJ2NvbnNlcnZhdGl2ZScsIG1pblRpZXI6ICdnb29nbGUnIH0sXG4gICAgICAgICAgICAvLyB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2FjdGlvbl9jaGVja2xpc3QnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAncGluJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnbWV0cmljX2dyaWQnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAnZ29vZ2xlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnbGV2ZXJfYWNjb3JkaW9uJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdUaGUgNSBMZXZlcnMnLFxuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAnZ29vZ2xlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgc3VtbWFyeToge1xuICAgICAgICBzbHVnOiAnc3VtbWFyeScsXG4gICAgICAgIHRpdGxlOiAnRXhlY3V0aXZlIFN1bW1hcnknLFxuICAgICAgICBuYXZMYWJlbDogJ1N1bW1hcnknLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgcGRmRXhwb3J0OiB0cnVlLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ2V4ZWN1dGl2ZS1zdW1tYXJ5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ29wcy1hZG1pbic6IHtcbiAgICAgICAgc2x1ZzogJ29wcy1hZG1pbicsXG4gICAgICAgIHRpdGxlOiAnT3BzIEFkbWluJyxcbiAgICAgICAgbmF2TGFiZWw6ICdPcHMgQWRtaW4nLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgcmVxdWlyZWRHcm91cHM6IFtcbiAgICAgICAgICAgICdvcHMtYWRtaW4nXG4gICAgICAgIF0sXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnb3BzX2FkbWluX3RhYnMnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgcmV2aWV3OiB7XG4gICAgICAgIHNsdWc6ICdyZXZpZXcnLFxuICAgICAgICB0aXRsZTogJ0J1c2luZXNzIFJldmlldycsXG4gICAgICAgIG5hdkxhYmVsOiAnUmV2aWV3JyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZScsXG4gICAgICAgIHBkZkV4cG9ydDogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdyZXZpZXdfYmxvY2tzJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgICdvcHMtdHJhY2tpbmcnOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtdHJhY2tpbmcnLFxuICAgICAgICB0aXRsZTogJ0ZpbmFuY2lhbCBUcmFja2luZycsXG4gICAgICAgIG5hdkxhYmVsOiAnVHJhY2tpbmcnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdrcGlfY2FyZHMnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICB2YXJpYW50OiAnb3BzJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAncmVwb3J0c19yb2xsdXAnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudDogJ29wcydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ3BubF90YWJsZScsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICAnb3BzLWNoYXQnOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtY2hhdCcsXG4gICAgICAgIHRpdGxlOiAnQUkgQ2hhdCcsXG4gICAgICAgIG5hdkxhYmVsOiAnQUkgQ2hhdCcsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXRfcGFuZWwnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgdGFza3M6IHtcbiAgICAgICAgc2x1ZzogJ3Rhc2tzJyxcbiAgICAgICAgdGl0bGU6ICdFeGl0LVZpYWJpbGl0eSBUYXNrcycsXG4gICAgICAgIG5hdkxhYmVsOiAnVGFza3MnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICBhZG1pbjoge1xuICAgICAgICBzbHVnOiAnYWRtaW4nLFxuICAgICAgICB0aXRsZTogJ1BsYXRmb3JtIEFkbWluJyxcbiAgICAgICAgbmF2TGFiZWw6ICdBZG1pbicsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwaW4nLFxuICAgICAgICBzZWN0aW9uczogW11cbiAgICB9LFxuICAgIGNvbmZpZzoge1xuICAgICAgICBzbHVnOiAnY29uZmlnJyxcbiAgICAgICAgdGl0bGU6ICdTb3VyY2UgQ29uZmlnJyxcbiAgICAgICAgbmF2TGFiZWw6ICdDb25maWcnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICAndGVybXMtb2Ytc2VydmljZSc6IHtcbiAgICAgICAgc2x1ZzogJ3Rlcm1zLW9mLXNlcnZpY2UnLFxuICAgICAgICB0aXRsZTogJ1Rlcm1zIG9mIFNlcnZpY2UnLFxuICAgICAgICBzaG93SW5OYXY6IGZhbHNlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnZG9jX21hcmtkb3duJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAndGVybXMtb2Ytc2VydmljZS5odG1sJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ3ByaXZhY3ktcG9saWN5Jzoge1xuICAgICAgICBzbHVnOiAncHJpdmFjeS1wb2xpY3knLFxuICAgICAgICB0aXRsZTogJ1ByaXZhY3kgUG9saWN5JyxcbiAgICAgICAgc2hvd0luTmF2OiBmYWxzZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwdWJsaWMnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ3ByaXZhY3ktcG9saWN5Lmh0bWwnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfVxufTtcbmNvbnN0IFRJRVJfUkFOSyA9IHtcbiAgICBwdWJsaWM6IDAsXG4gICAgcGluOiAxLFxuICAgIGdvb2dsZTogMlxufTtcbmV4cG9ydCBmdW5jdGlvbiB0aWVyQWxsb3dzQWNjZXNzKGN1cnJlbnQsIHJlcXVpcmVkKSB7XG4gICAgcmV0dXJuIFRJRVJfUkFOS1tjdXJyZW50XSA+PSBUSUVSX1JBTktbcmVxdWlyZWRdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxpc3ROYXZQYWdlcyh0aWVyLCBncm91cHMgPSBbXSkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGdldEZ1bGxDYXRhbG9nKCkpLmZpbHRlcigocCk9PnAuc2hvd0luTmF2ICE9PSBmYWxzZSkuZmlsdGVyKChwKT0+dGllckFsbG93c0FjY2Vzcyh0aWVyLCBwLmF1dGhUaWVyKSkuZmlsdGVyKChwKT0+IXAucmVxdWlyZWRHcm91cHMgfHwgcC5yZXF1aXJlZEdyb3Vwcy5sZW5ndGggPT09IDAgfHwgZ3JvdXBzLmluY2x1ZGVzKCdwbGF0Zm9ybS1hZG1pbicpIHx8IHAucmVxdWlyZWRHcm91cHMuc29tZSgoZyk9Pmdyb3Vwcy5pbmNsdWRlcyhnKSkpLnNvcnQoKGEsIGIpPT5hLnRpdGxlLmxvY2FsZUNvbXBhcmUoYi50aXRsZSkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYWdlKHNsdWcpIHtcbiAgICByZXR1cm4gZ2V0RnVsbENhdGFsb2coKVtzbHVnXSA/PyBudWxsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVSZXZpZXdQYXJ0KHBhcnRTbHVnKSB7XG4gICAgcmV0dXJuIGdldFJldmlld1BhcnRDYXRhbG9nKClbcGFydFNsdWddID8/IG51bGw7XG59XG5leHBvcnQgZnVuY3Rpb24gbGlzdFJldmlld1BhcnRzKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGdldFJldmlld1BhcnRDYXRhbG9nKCkpLnNvcnQoKGEsIGIpPT5hLnBhcnRLZXkubG9jYWxlQ29tcGFyZShiLnBhcnRLZXkpKTtcbn1cbi8qKiBEZXNjcmlwdGl2ZSB0aXRsZSB3aXRob3V0IHRoZSBcIlBhcnQgWDogXCIgY2F0YWxvZyBwcmVmaXguICovIGV4cG9ydCBmdW5jdGlvbiBnZXRSZXZpZXdQYXJ0RGlzcGxheVRpdGxlKHRpdGxlKSB7XG4gICAgcmV0dXJuIHRpdGxlLnJlcGxhY2UoL15QYXJ0IFtBLU9dOiAvLCAnJyk7XG59XG4iLCAiLyoqXG4gKiBUaGVzZSBhcmUgdGhlIGJ1aWx0LWluIHN0ZXBzIHRoYXQgYXJlIFwiYXV0b21hdGljYWxseSBhdmFpbGFibGVcIiBpbiB0aGUgd29ya2Zsb3cgc2NvcGUuIFRoZXkgYXJlXG4gKiBzaW1pbGFyIHRvIFwic3RkbGliXCIgZXhjZXB0IHRoYXQgYXJlIG5vdCBtZWFudCB0byBiZSBpbXBvcnRlZCBieSB1c2VycywgYnV0IGFyZSBpbnN0ZWFkIFwianVzdCBhdmFpbGFibGVcIlxuICogYWxvbmdzaWRlIHVzZXIgZGVmaW5lZCBzdGVwcy4gVGhleSBhcmUgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBydW50aW1lXG4gKi9cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV9hcnJheV9idWZmZXIoXG4gIHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZVxuKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmFycmF5QnVmZmVyKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfanNvbih0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2UpIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIHRoaXMuanNvbigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX3RleHQodGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLnRleHQoKTtcbn1cbiIsICIvKipcbiAqIFRoaXMgaXMgdGhlIFwic3RhbmRhcmQgbGlicmFyeVwiIG9mIHN0ZXBzIHRoYXQgd2UgbWFrZSBhdmFpbGFibGUgdG8gYWxsIHdvcmtmbG93IHVzZXJzLlxuICogVGhlIGNhbiBiZSBpbXBvcnRlZCBsaWtlIHNvOiBgaW1wb3J0IHsgZmV0Y2ggfSBmcm9tICd3b3JrZmxvdydgLiBhbmQgdXNlZCBpbiB3b3JrZmxvdy5cbiAqIFRoZSBuZWVkIHRvIGJlIGV4cG9ydGVkIGRpcmVjdGx5IGluIHRoaXMgcGFja2FnZSBhbmQgY2Fubm90IGxpdmUgaW4gYGNvcmVgIHRvIHByZXZlbnRcbiAqIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBwb3N0LWNvbXBpbGF0aW9uLlxuICovXG5cbi8qKlxuICogQSBob2lzdGVkIGBmZXRjaCgpYCBmdW5jdGlvbiB0aGF0IGlzIGV4ZWN1dGVkIGFzIGEgXCJzdGVwXCIgZnVuY3Rpb24sXG4gKiBmb3IgdXNlIHdpdGhpbiB3b3JrZmxvdyBmdW5jdGlvbnMuXG4gKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRmV0Y2hfQVBJXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaCguLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBnbG9iYWxUaGlzLmZldGNoPikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gZ2xvYmFsVGhpcy5mZXRjaCguLi5hcmdzKTtcbn1cbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG4vKipcbiAqIFN0ZXAgZnVuY3Rpb25zIGZvciB0aGUgYXBwLXBhY2stZ2VuZXJhdGUgd29ya2Zsb3cuXG4gKlxuICogRWFjaCBleHBvcnRlZCBhc3luYyBmdW5jdGlvbiB3aXRoIHRoZSBgJ3VzZSBzdGVwJ2AgZGlyZWN0aXZlIGlzIGEgZHVyYWJsZVxuICogc3RlcDogaXRzIGFyZ3MgYW5kIHJlc3VsdCBhcmUgc2VyaWFsaXplZCB0byB0aGUgZXZlbnQgbG9nLCBhbmQgaXQgcmV0cmllc1xuICogYmVmb3JlIHRoZSBlcnJvciBidWJibGVzIHRvIHRoZSB3b3JrZmxvdy5cbiAqLyBpbXBvcnQgeyBGYXRhbEVycm9yIH0gZnJvbSAnd29ya2Zsb3cnO1xuaW1wb3J0IHsgZGVjb21wb3NlUGFja0Zyb21Qcm9tcHQsIGdlbmVyYXRlQXBwRGVmaW5pdGlvbiwgbW9ja0RlY29tcG9zZVBhY2ssIG1vY2tHZW5lcmF0ZUFwcERlZmluaXRpb24gfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLWdlbmVyYXRvcic7XG5pbXBvcnQgeyBjb21waWxlQXBwQXJ0aWZhY3RzIH0gZnJvbSAnLi4vLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1jb21waWxlcic7XG5pbXBvcnQgeyBtYXRlcmlhbGl6ZUFwcFBhY2sgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLW1hdGVyaWFsaXplcic7XG5pbXBvcnQgeyBhcHBseVBhY2tTY2hlbWEgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLXNjaGVtYS1hcHBseSc7XG5pbXBvcnQgeyB3cml0ZVByb2dyZXNzQ2h1bmssIGNsb3NlUHJvZ3Jlc3NTdHJlYW0gfSBmcm9tICcuL3Byb2dyZXNzJztcbmltcG9ydCB7IHdpdGhQZ0NsaWVudCwgcXVlcnlSb3dzIH0gZnJvbSAnLi9kYic7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wid29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLnRzXCI6e1wiYXBwbHlQYWNrU2NoZW1hU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2FwcGx5UGFja1NjaGVtYVN0ZXBcIn0sXCJjbG9zZVByb2dyZXNzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2Nsb3NlUHJvZ3Jlc3NTdGVwXCJ9LFwiY29tcGlsZUFwcFBhY2tTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vY29tcGlsZUFwcFBhY2tTdGVwXCJ9LFwiZGVjb21wb3NlUGFja1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9kZWNvbXBvc2VQYWNrU3RlcFwifSxcImVtaXRQcm9ncmVzc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9lbWl0UHJvZ3Jlc3NTdGVwXCJ9LFwiZ2VuZXJhdGVBcHBTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vZ2VuZXJhdGVBcHBTdGVwXCJ9LFwibG9hZEtub3dsZWRnZUJhc2VTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vbG9hZEtub3dsZWRnZUJhc2VTdGVwXCJ9LFwibWF0ZXJpYWxpemVBcHBQYWNrU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL21hdGVyaWFsaXplQXBwUGFja1N0ZXBcIn19fX0qLztcbi8qKiBEZXRlcm1pbmlzdGljIGZhbGxiYWNrIHBhY2sgaWQgaWYgdGhlIHJvdXRlIGRpZG4ndCBzdXBwbHkgb25lLiAqLyBleHBvcnQgZnVuY3Rpb24gZGVmYXVsdFBhY2tJZChwcm9tcHQpIHtcbiAgICByZXR1cm4gYHBhY2stJHtwcm9tcHQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJykucmVwbGFjZSgvXi0rfC0rJC9nLCAnJykuc2xpY2UoMCwgMzIpIHx8ICdjdXN0b20nfWA7XG59XG4vKipcbiAqIFN0YWdlIDE6IGRlY29tcG9zZSB0aGUgYWRtaW4ncyByZXF1aXJlbWVudCBpbnRvIHBlci1kZXBhcnRtZW50IGFwcCBicmllZnMuXG4gKiBEZXRlcm1pbmlzdGljIGluIG1vY2sgbW9kZS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjb21wb3NlUGFja1N0ZXAoaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQubW9jaykge1xuICAgICAgICByZXR1cm4gbW9ja0RlY29tcG9zZVBhY2soKTtcbiAgICB9XG4gICAgLy8gS25vd2xlZGdlIGdyb3VuZGluZyBpcyBsb2FkZWQgc2VwYXJhdGVseSAobG9hZEtub3dsZWRnZUJhc2VTdGVwKTsgdGhlXG4gICAgLy8gZ2VuZXJhdG9yIGNhbGwgaXMgd3JhcHBlZCBzbyBzdGVwIHJldHJpZXMgYXJlIHNhZmUuXG4gICAgY29uc3QgZGVjb21wb3NpdGlvbiA9IGF3YWl0IGRlY29tcG9zZVBhY2tGcm9tUHJvbXB0KGlucHV0LnByb21wdCk7XG4gICAgaWYgKCFkZWNvbXBvc2l0aW9uLmFwcHMubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdBSSBkZWNvbXBvc2l0aW9uIHJldHVybmVkIHplcm8gYXBwcyBcdTIwMTQgcGxlYXNlIHJlcGhyYXNlIHRoZSByZXF1aXJlbWVudC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY29tcG9zaXRpb247XG59XG4vKiogTG9hZCBrbm93bGVkZ2Ugc25pcHBldHMgZnJvbSB0aGUgdGVuYW50IERCIHRvIGdyb3VuZCB0aGUgZ2VuZXJhdGlvbi4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRLbm93bGVkZ2VCYXNlU3RlcChkYlVybCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBhd2FpdCBxdWVyeVJvd3MoZGIsIGBTRUxFQ1Qga2V5LCBjb250ZW50LCBjYXRlZ29yeSBGUk9NIGtub3dsZWRnZV9zbmlwcGV0cyBPUkRFUiBCWSBjYXRlZ29yeSwga2V5IExJTUlUIDIwMDtgKTtcbiAgICAgICAgICAgIGlmICghcm93cy5sZW5ndGgpIHJldHVybiAnJztcbiAgICAgICAgICAgIHJldHVybiByb3dzLm1hcCgocik9PmBbJHtyLmNhdGVnb3J5fV0gJHtyLmtleX06XFxuJHtyLmNvbnRlbnQuc2xpY2UoMCwgMjAwMCl9YCkuam9pbignXFxuXFxuLS0tXFxuXFxuJyk7XG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgLy8gS25vd2xlZGdlIGdyb3VuZGluZyBpcyBiZXN0LWVmZm9ydDsgZ2VuZXJhdGlvbiBzdGlsbCB3b3JrcyB3aXRob3V0IGl0LlxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxufVxuLyoqXG4gKiBTdGFnZSAyOiBnZW5lcmF0ZSB0aGUgZnVsbCBkZWZpbml0aW9uIG9mIG9uZSBhcHAgKFczIHNjaGVtYSwgbW9kZWxzLCB1c2VcbiAqIGNhc2VzLCBwYWdlcywgbmF2LCBVWCB3b3JrZmxvdywga25vd2xlZGdlIHNuaXBwZXRzKS4gQ0VPIE92ZXJ2aWV3IChsYXN0XG4gKiBicmllZikgZ2V0cyB0aGUgZGVjb21wb3NpdGlvbidzIHB1cnBvc2UgKyBjcm9zcy1kZXBhcnRtZW50IEtQSXMuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlQXBwU3RlcChpbnB1dCwgZGVjb21wb3NpdGlvbiwga25vd2xlZGdlQmFzZSwgaW5kZXgpIHtcbiAgICBjb25zdCBiID0gZGVjb21wb3NpdGlvbi5hcHBzW2luZGV4XTtcbiAgICBpZiAoIWIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYEFwcCBicmllZiBhdCBpbmRleCAke2luZGV4fSBtaXNzaW5nIGZyb20gZGVjb21wb3NpdGlvbi5gKTtcbiAgICB9XG4gICAgY29uc3QgaXNDZW8gPSBpbmRleCA9PT0gZGVjb21wb3NpdGlvbi5hcHBzLmxlbmd0aCAtIDE7XG4gICAgaWYgKGlucHV0Lm1vY2spIHtcbiAgICAgICAgcmV0dXJuIG1vY2tHZW5lcmF0ZUFwcERlZmluaXRpb24oYik7XG4gICAgfVxuICAgIHJldHVybiBnZW5lcmF0ZUFwcERlZmluaXRpb24oYiwgaXNDZW8gPyBkZWNvbXBvc2l0aW9uLmNlb092ZXJ2aWV3LnB1cnBvc2UgOiAnJywgaXNDZW8gPyBkZWNvbXBvc2l0aW9uLmNlb092ZXJ2aWV3LmtwaXMgOiBbXSwgZGVjb21wb3NpdGlvbi5hcHBzLCBrbm93bGVkZ2VCYXNlKTtcbn1cbi8qKiBTdGFnZSAzOiBkZXRlcm1pbmlzdGljIGNvbXBpbGF0aW9uIG9mIGRlZmluaXRpb25zIFx1MjE5MiBhcnRpZmFjdHMgKyBEQiByb3dzLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcGlsZUFwcFBhY2tTdGVwKGRlY29tcG9zaXRpb24sIGRlZmluaXRpb25zKSB7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zLm1hcCgoZGVmKT0+Y29tcGlsZUFwcEFydGlmYWN0cyhkZWYpKTtcbn1cbi8qKiBTdGFnZSA0OiBwZXJzaXN0IHBhZ2VzL25hdi9zbmlwcGV0cy9zZWN1cml0eSBncm91cHMgaW50byB0aGUgdGVuYW50IERCLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWF0ZXJpYWxpemVBcHBQYWNrU3RlcChpbnB1dCwgZGVjb21wb3NpdGlvbiwgZGVmaW5pdGlvbnMsIGFydGlmYWN0cykge1xuICAgIGNvbnN0IHBhY2tJZCA9IGlucHV0LnBhY2tJZCA/PyBkZWZhdWx0UGFja0lkKGlucHV0LnByb21wdCk7XG4gICAgY29uc3QgbWF0ZXJpYWxpemVJbnB1dCA9IHtcbiAgICAgICAgcGFja0lkLFxuICAgICAgICB0ZW5hbnRTbHVnOiBpbnB1dC50ZW5hbnRTbHVnLFxuICAgICAgICBkZWNvbXBvc2l0aW9uLFxuICAgICAgICBhcHBzOiBhcnRpZmFjdHMsXG4gICAgICAgIGRlZmluaXRpb25zXG4gICAgfTtcbiAgICByZXR1cm4gd2l0aFBnQ2xpZW50KGlucHV0LmRiVXJsLCAoZGIpPT5tYXRlcmlhbGl6ZUFwcFBhY2soZGIsIG1hdGVyaWFsaXplSW5wdXQpKTtcbn1cbi8qKlxuICogU3RhZ2UgNTogYXBwbHkgdGhlIHBhY2sncyBjb25zb2xpZGF0ZWQgWmVuU3RhY2sgc2NoZW1hIHRvIHRoZSB0ZW5hbnQgREIgc29cbiAqIHRoZSBnZW5lcmF0ZWQgbW9kZWxzIGJlY29tZSByZWFsIHRhYmxlcyAoYWRkaXRpdmUgRERMIFx1MjAxNCBuZXZlciBkcm9wcyBkYXRhKS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gYXBwbHlQYWNrU2NoZW1hU3RlcChpbnB1dCwgZGVmaW5pdGlvbnMpIHtcbiAgICByZXR1cm4gd2l0aFBnQ2xpZW50KGlucHV0LmRiVXJsLCAoZGIpPT5hcHBseVBhY2tTY2hlbWEoZGIsIGRlZmluaXRpb25zKSk7XG59XG4vKiogRW1pdCBvbmUgcHJvZ3Jlc3MgY2h1bmsgZnJvbSBhIHN0ZXAgY29udGV4dC4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVtaXRQcm9ncmVzc1N0ZXAod3JpdGFibGUsIGNodW5rKSB7XG4gICAgYXdhaXQgd3JpdGVQcm9ncmVzc0NodW5rKHdyaXRhYmxlLCBjaHVuayk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0ZXAod3JpdGFibGUpIHtcbiAgICBhd2FpdCBjbG9zZVByb2dyZXNzU3RyZWFtKHdyaXRhYmxlKTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2RlY29tcG9zZVBhY2tTdGVwXCIsIGRlY29tcG9zZVBhY2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2xvYWRLbm93bGVkZ2VCYXNlU3RlcFwiLCBsb2FkS25vd2xlZGdlQmFzZVN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vZ2VuZXJhdGVBcHBTdGVwXCIsIGdlbmVyYXRlQXBwU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9jb21waWxlQXBwUGFja1N0ZXBcIiwgY29tcGlsZUFwcFBhY2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL21hdGVyaWFsaXplQXBwUGFja1N0ZXBcIiwgbWF0ZXJpYWxpemVBcHBQYWNrU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9hcHBseVBhY2tTY2hlbWFTdGVwXCIsIGFwcGx5UGFja1NjaGVtYVN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vZW1pdFByb2dyZXNzU3RlcFwiLCBlbWl0UHJvZ3Jlc3NTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2Nsb3NlUHJvZ3Jlc3NTdGVwXCIsIGNsb3NlUHJvZ3Jlc3NTdGVwKTtcbiIsICIvKipcbiAqIEFwcCBQYWNrIFx1MjAxNCBBSSBHZW5lcmF0b3JcbiAqXG4gKiBUd28tc3RhZ2UgQUkgZ2VuZXJhdGlvbiB1c2luZyB0aGUgVmVyY2VsIEFJIFNESyBgZ2VuZXJhdGVPYmplY3QoKWA6XG4gKlxuICogICBTdGFnZSAxIFx1MjAxNCBERUNPTVBPU0U6IHRoZSBwbGF0Zm9ybSBhZG1pbidzIHJlcXVpcmVtZW50IGlzIHR1cm5lZCBpbnRvIGFcbiAqICAgICAgICAgICAgIHN0cnVjdHVyZWQgcGFjayBkZWZpbml0aW9uIChhcHBzIHBlciBkZXBhcnRtZW50ICsgQ0VPIG92ZXJ2aWV3KS5cbiAqICAgU3RhZ2UgMiBcdTIwMTQgR0VORVJBVEUgKHBlciBhcHApOiBlYWNoIGRlcGFydG1lbnQgYXBwIGdldHMgYSBmdWxsIGRlZmluaXRpb246XG4gKiAgICAgICAgICAgICBXM0MtYWxpZ25lZCBtb2RlbHMsIHVzZSBjYXNlcywgcGFnZXMsIG5hdiwgVVggd29ya2Zsb3cgYW5kXG4gKiAgICAgICAgICAgICBrbm93bGVkZ2Ugc25pcHBldHMgXHUyMDE0IGdyb3VuZGVkIGluIHRoZSBwbGF0Zm9ybSBrbm93bGVkZ2UgYmFzZSBhbmRcbiAqICAgICAgICAgICAgIHRoZSBXM0MgWFNEIHN0YW5kYXJkIGZvciBpdHMgdGVtcGxhdGUuXG4gKlxuICogYG1vY2sqYCB2YXJpYW50cyByZXR1cm4gZGV0ZXJtaW5pc3RpYyByZXN1bHRzIGZvciB0ZXN0aW5nIHdpdGhvdXQgYW4gQUkga2V5LlxuICovIGltcG9ydCB7IGdlbmVyYXRlT2JqZWN0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgYXBwUGFja0RlY29tcG9zaXRpb25ab2QsIGFwcFBhY2tBcHBEZWZpbml0aW9uWm9kIH0gZnJvbSAnLi9hcHAtcGFjay1zY2hlbWEnO1xuLy8gXHUyNTAwXHUyNTAwIFczQyBYU0QgU3RhbmRhcmRzICsgc2NoZW1hLm9yZyB0eXBlcyBwZXIgdGVtcGxhdGUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5jb25zdCBXM0NfU1RBTkRBUkRTID0ge1xuICAgICdmaW5hbmNpYWwtYW5hbHl0aWNzJzogJ0ZwTUwgKEZpbmFuY2lhbCBQcm9kdWN0cyBNYXJrdXAgTGFuZ3VhZ2UpIGZvciBkZXJpdmF0aXZlcyBhbmQgRklYTUwgZm9yIHJlYWwtdGltZSBmaW5hbmNpYWwgaW5mb3JtYXRpb24gZXhjaGFuZ2UnLFxuICAgIHJlc3RhdXJhbnQ6ICdVQkwgKFVuaXZlcnNhbCBCdXNpbmVzcyBMYW5ndWFnZSkgZm9yIGludm9pY2VzL29yZGVycyBhbmQgR1MxIGZvciBwcm9kdWN0L1NLVSBkYXRhJyxcbiAgICBob3RlbDogJ09UQSAoT3BlblRyYXZlbCBBbGxpYW5jZSkgZm9yIHJvb20gYm9va2luZ3MgYW5kIGF2YWlsYWJpbGl0eScsXG4gICAgJ2Vjb21tZXJjZS1yZXRhaWwnOiAnVUJMIGZvciBlbGVjdHJvbmljIG9yZGVycyBhbmQgSW52ZW50b3J5IEZlZWRzIGZvciBTS1UvcHJpY2luZyBjb25zdHJhaW50cycsXG4gICAgaGVhbHRoY2FyZTogJ0hMNy9DREEgZm9yIGVsZWN0cm9uaWMgaGVhbHRoIHJlY29yZHMgYW5kIGNsYWltcyBwcm9jZXNzaW5nIHZhbGlkYXRpb24nLFxuICAgICdzdXBwbHktY2hhaW4nOiAnVUJMIGZvciBzaGlwcGluZyBub3RpY2VzIGFuZCBCMkIgbG9naXN0aWNzIG1hbmlmZXN0IGRvY3VtZW50cycsXG4gICAgJ3JlYWwtZXN0YXRlJzogJ1JFVFMgKFJlYWwgRXN0YXRlIFRyYW5zYWN0aW9uIFN0YW5kYXJkKSBmb3IgcHJvcGVydHkgbGlzdGluZ3MnLFxuICAgIGVkdWNhdGlvbjogJ0lNUyBHbG9iYWwgKExUSSwgUVRJKSBmb3IgbGVhcm5pbmcgdG9vbHMgaW50ZXJvcGVyYWJpbGl0eSBhbmQgYXNzZXNzbWVudCcsXG4gICAgJ3Byb2Zlc3Npb25hbC1zZXJ2aWNlcyc6ICdVQkwgZm9yIGJpbGxpbmcvaW52b2ljZXMgYW5kIHByb2plY3QgbWFuYWdlbWVudCBkYXRhJyxcbiAgICBtYW51ZmFjdHVyaW5nOiAnQjJNTUwgKEJ1c2luZXNzIFRvIE1hbnVmYWN0dXJpbmcgTWFya3VwIExhbmd1YWdlKSBmb3IgcHJvZHVjdGlvbiBkYXRhJ1xufTtcbmNvbnN0IFNDSEVNQV9PUkdfVFlQRVMgPSB7XG4gICAgJ2ZpbmFuY2lhbC1hbmFseXRpY3MnOiAnRmluYW5jaWFsU2VydmljZScsXG4gICAgcmVzdGF1cmFudDogJ1Jlc3RhdXJhbnQnLFxuICAgIGhvdGVsOiAnSG90ZWwnLFxuICAgICdlY29tbWVyY2UtcmV0YWlsJzogJ1N0b3JlJyxcbiAgICBoZWFsdGhjYXJlOiAnTWVkaWNhbE9yZ2FuaXphdGlvbicsXG4gICAgJ3N1cHBseS1jaGFpbic6ICdEZWxpdmVyeUV2ZW50JyxcbiAgICAncmVhbC1lc3RhdGUnOiAnUmVhbEVzdGF0ZUFnZW50JyxcbiAgICBlZHVjYXRpb246ICdFZHVjYXRpb25hbE9yZ2FuaXphdGlvbicsXG4gICAgJ3Byb2Zlc3Npb25hbC1zZXJ2aWNlcyc6ICdQcm9mZXNzaW9uYWxTZXJ2aWNlJyxcbiAgICBtYW51ZmFjdHVyaW5nOiAnTWFudWZhY3R1cmVyJ1xufTtcbi8vIE5PVEU6IG11c3Qgc3RheSBhIHN1YnNldCBvZiB0aGUgWmVuU3RhY2sgQmxvY2tUeXBlIGVudW0gaW5cbi8vIHplbnN0YWNrL3NjaGVtYS56bW9kZWwgXHUyMDE0IGR5bmFtaWNfZm9ybSBpcyBOT1QgYSB2YWxpZCBlbnVtIHZhbHVlLCBzbyBtb2RlbFxuLy8gQ1JVRCBzdXJmYWNlcyBhcmUgZXhwcmVzc2VkIHdpdGggb3BzX2FkbWluX3RhYnMgLyBkb2NfbWFya2Rvd24gaW5zdGVhZC5cbmNvbnN0IEFWQUlMQUJMRV9CTE9DS1MgPSBbXG4gICAgJ2hlcm8nLFxuICAgICdrcGlfY2FyZHMnLFxuICAgICdtZXRyaWNfZ3JpZCcsXG4gICAgJ2NoYXJ0X2ZpbmFuY2lhbCcsXG4gICAgJ2xldmVyX2FjY29yZGlvbicsXG4gICAgJ2FjdGlvbl9jaGVja2xpc3QnLFxuICAgICdkb2NfbWFya2Rvd24nLFxuICAgICdwbmxfdGFibGUnLFxuICAgICdvcHNfYWRtaW5fdGFicycsXG4gICAgJ3pfcmVwb3J0X2Zvcm0nLFxuICAgICdjb3N0c19mb3JtJyxcbiAgICAnY2FsZW5kYXJfaW1wb3J0JyxcbiAgICAnY2hhdF9wYW5lbCcsXG4gICAgJ3Jldmlld19ibG9ja3MnLFxuICAgICdyZXBvcnRzX3JvbGx1cCcsXG4gICAgJ3NoZWV0X3ZpZXdlcidcbl07XG5jb25zdCBBVVRIX1RJRVJTID0gW1xuICAgICdwdWJsaWMnLFxuICAgICdwaW4nLFxuICAgICdnb29nbGUnXG5dO1xuY29uc3QgTU9ERUwgPSAnZ3B0LTUuNSc7XG4vLyBcdTI1MDBcdTI1MDAgU3RhZ2UgMTogZGVjb21wb3NlIHRoZSByZXF1aXJlbWVudCBpbnRvIGFwcHMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5mdW5jdGlvbiBidWlsZERlY29tcG9zZVN5c3RlbVByb21wdChfa25vd2xlZGdlQmFzZSkge1xuICAgIHJldHVybiBgWW91IGFyZSB0aGUgY2hpZWYgc29sdXRpb24gYXJjaGl0ZWN0IG9mIGEgdGVuYW50IGFwcGxpY2F0aW9uIHBsYXRmb3JtLlxuXG5BIHBsYXRmb3JtIGFkbWluaXN0cmF0b3Igd2lsbCBkZXNjcmliZSBhIGJ1c2luZXNzIG5lZWQuIERlY29tcG9zZSBpdCBpbnRvIGFcbmNvaGVyZW50IFwiYXBwbGljYXRpb24gcGFja1wiOiBvbmUgYXBwbGljYXRpb24gcGVyIGJ1c2luZXNzIGRlcGFydG1lbnQsIHBsdXMgYVxuQ0VPIE92ZXJ2aWV3IGFwcGxpY2F0aW9uIHRoYXQgc3BhbnMgYWxsIG9mIHRoZW0uXG5cbiMjIFJ1bGVzXG5cbjEuICoqQXBwcyBwZXIgZGVwYXJ0bWVudCoqOiBDcmVhdGUgb25lIGFwcCBmb3IgZXZlcnkgZGlzdGluY3QgZGVwYXJ0bWVudCBpbiB0aGVcbiAgIHJlcXVpcmVtZW50IChlLmcuIEhSLCBNYXJrZXRpbmcvTWVtYmVyc2hpcHMsIFNhbGVzIFJlcG9ydGluZywgRWNvbW1lcmNlXG4gICBNYXJrZXRwbGFjZSwgUmVmZXJyYWxzIE1hbmFnZW1lbnQsIEJhY2sgT2ZmaWNlIFJlcG9ydGluZywgTGVnYWwgQWRoZXJlbmNlLFxuICAgRmluYW5jZS9SZXBvcnRpbmcvVHJhY2tpbmcsIEJhY2sgT2ZmaWNlIE1hbmFnZW1lbnQsIENvbXBsaWFuY2UsIENFTyBPdmVydmlldykuXG4gICBJZiB0aGUgcmVxdWlyZW1lbnQgbmFtZXMgZGVwYXJ0bWVudHMgZXhwbGljaXRseSwgY292ZXIgQUxMIG9mIHRoZW0uXG4yLiAqKkFwcCBpZHMqKjoga2ViYWItY2FzZSwgc2hvcnQgKGUuZy4gXCJoclwiLCBcInNhbGVzLXJlcG9ydGluZ1wiLCBcImNlby1vdmVydmlld1wiKS5cbjMuICoqdGVtcGxhdGVJZCoqOiBwaWNrIHRoZSBiZXN0IGZpdCBmcm9tIHRoZSB0ZW1wbGF0ZSBjYXRhbG9nOlxuICAgJHtPYmplY3Qua2V5cyhXM0NfU1RBTkRBUkRTKS5qb2luKCcsICcpfVxuICAgQ0VPIE92ZXJ2aWV3IHNob3VsZCB1c2UgXCJmaW5hbmNpYWwtYW5hbHl0aWNzXCIgKGl0IGRyaXZlcyB0cmFuc3BhcmVuY3ksXG4gICBpbnNpZ2h0IGFuZCByZWFsdGltZSBhY3Rpb25hYmxlIGl0ZW1zIGZyb20gZXZlcnkgZGVwYXJ0bWVudCkuXG40LiAqKkNFTyBPdmVydmlldyBhcHAqKjogTVVTVCBiZSBpbmNsdWRlZCBhcyB0aGUgbGFzdCBhcHAuIEl0cyBzdW1tYXJ5IG11c3RcbiAgIHN0YXRlIHRoYXQgaXQgaGFzIGFjY2VzcyB0byBldmVyeSBkZXBhcnRtZW50IGFwcCdzIGtub3dsZWRnZSBiYXNlIGFuZFxuICAgc3VyZmFjZXMgY3Jvc3MtZGVwYXJ0bWVudCBLUElzLCB0cmFuc3BhcmVuY3ksIGVmZmljaWVuY3kgYW5kIGFjdGlvbmFibGVcbiAgIGluc2lnaHRzLlxuNS4gKipDb3ZlcmFnZSoqOiBUaGUgYXBwcyBtdXN0IHRvZ2V0aGVyIGNvdmVyIHRoZSBjb21wbGV0ZSByZXF1aXJlbWVudCBcdTIwMTQgbm9cbiAgIGRlcGFydG1lbnQgbWVudGlvbmVkIGluIHRoZSByZXF1aXJlbWVudCBtYXkgYmUgbWlzc2luZy5cbjYuICoqUGFjayBpZHMqKjoga2ViYWItY2FzZSwgZS5nLiBcIm9wcy1kZXBhcnRtZW50LXBhY2tcIi5cblxuIyMgT3V0cHV0XG5cblJldHVybiB0aGUgcGFjayBkZWNvbXBvc2l0aW9uOiBpZCwgbmFtZSwgZGVzY3JpcHRpb24sIHBlci1hcHAgYnJpZWZzIGFuZCB0aGVcbkNFTyBvdmVydmlldyBwdXJwb3NlICsgS1BJcy5gO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY29tcG9zZVBhY2tGcm9tUHJvbXB0KHVzZXJQcm9tcHQsIGtub3dsZWRnZUJhc2UpIHtcbiAgICBjb25zdCB7IG9iamVjdCB9ID0gYXdhaXQgZ2VuZXJhdGVPYmplY3Qoe1xuICAgICAgICBtb2RlbDogb3BlbmFpKE1PREVMKSxcbiAgICAgICAgc2NoZW1hOiBhcHBQYWNrRGVjb21wb3NpdGlvblpvZCxcbiAgICAgICAgc3lzdGVtOiBidWlsZERlY29tcG9zZVN5c3RlbVByb21wdChrbm93bGVkZ2VCYXNlKSxcbiAgICAgICAgcHJvbXB0OiB1c2VyUHJvbXB0LFxuICAgICAgICB0ZW1wZXJhdHVyZTogMC4yXG4gICAgfSk7XG4gICAgcmV0dXJuIG9iamVjdDtcbn1cbi8vIFx1MjUwMFx1MjUwMCBTdGFnZSAyOiBnZW5lcmF0ZSBhIGZ1bGwgZGVmaW5pdGlvbiBmb3Igb25lIGFwcCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmZ1bmN0aW9uIGJ1aWxkQXBwU3lzdGVtUHJvbXB0KGJyaWVmLCBjZW9QdXJwb3NlLCBjZW9LcGlzLCBhbGxBcHBzLCBrbm93bGVkZ2VCYXNlKSB7XG4gICAgY29uc3QgdzNjU3RhbmRhcmQgPSBXM0NfU1RBTkRBUkRTW2JyaWVmLnRlbXBsYXRlSWRdID8/ICdzY2hlbWEub3JnJztcbiAgICBjb25zdCBzY2hlbWFPcmdUeXBlID0gU0NIRU1BX09SR19UWVBFU1ticmllZi50ZW1wbGF0ZUlkXSA/PyAnTG9jYWxCdXNpbmVzcyc7XG4gICAgcmV0dXJuIGBZb3UgYXJlIGEgVzNDIHNjaGVtYSBhcmNoaXRlY3QsIFplblN0YWNrIE9STSBleHBlcnQgYW5kIHByb2R1Y3QgZGVzaWduZXIuXG5cbkRlc2lnbiB0aGUgXCIke2JyaWVmLm5hbWV9XCIgYXBwbGljYXRpb24gKGRlcGFydG1lbnQ6ICR7YnJpZWYuZGVwYXJ0bWVudH0pIGZvciBhXG50ZW5hbnQgYXBwIHBsYXRmb3JtLiBJdCBpcyBvbmUgYXBwIGluc2lkZSBhIHBhY2s7IHRoZSBwYWNrIGFsc28gY29udGFpbnM6XG4ke2FsbEFwcHMubWFwKChhKT0+YC0gJHthLm5hbWV9ICgke2EuZGVwYXJ0bWVudH0pYCkuam9pbignXFxuJyl9XG5cblRoZSBDRU8gT3ZlcnZpZXcgYXBwIGV4aXN0cyBzbyBsZWFkZXJzaGlwIGNhbiBzZWUgaW50byBldmVyeSBkZXBhcnRtZW50IFx1MjAxNFxuZGVzaWduIHRoaXMgYXBwIHNvIGl0cyBkYXRhLCBwYWdlcyBhbmQga25vd2xlZGdlIGZlZWQgdGhhdCB0cmFuc3BhcmVuY3kuXG5cbiMjIFJ1bGVzXG5cbjEuICoqVzNDIFhTRCoqOiBVc2UgJHt3M2NTdGFuZGFyZH0gZm9yIGZpZWxkIHR5cGVzIGFuZCB2YWxpZGF0aW9uIGNvbnN0cmFpbnRzLlxuMi4gKipzY2hlbWEub3JnIG1hcHBpbmcqKjogTWFwIGZpZWxkcyB0byBzY2hlbWEub3JnIHByb3BlcnRpZXMgKHNjaGVtYU9yZ1Byb3BlcnR5KS5cbjMuICoqQmFzZSBmaWVsZHMgYXV0by1hZGRlZCoqOiBpZCwgdGVuYW50U2x1ZywgY3JlYXRlZEF0LCB1cGRhdGVkQXQgYXJlIGFkZGVkXG4gICBhdXRvbWF0aWNhbGx5IFx1MjAxNCBuZXZlciBpbmNsdWRlIHRoZW0gaW4gdGhlIGZpZWxkcyBhcnJheS5cbjQuICoqTW9uZXRhcnkgdmFsdWVzKio6IGRlY2ltYWwgdHlwZSB3aXRoIHNjaGVtYU9yZ1Byb3BlcnR5IFwib2ZmZXJzLnByaWNlXCIuXG41LiAqKlN0YXR1cyBmaWVsZHMqKjogZW51bSB3aXRoIG1lYW5pbmdmdWwgZW51bVZhbHVlcyAocGVuZGluZywgYWN0aXZlLCAuLi4pLlxuNi4gKipNb2RlbHMqKjogMy04IG1vZGVscyBkZXBlbmRpbmcgb24gdGhlIGRlcGFydG1lbnQncyBjb21wbGV4aXR5LlxuNy4gKipVc2UgY2FzZXMqKjogVUMtWFhYLU5OIGZvcm1hdDsgYXV0aDogJHtBVVRIX1RJRVJTLmpvaW4oJy8nKX0gKHB1YmxpYyA9XG4gICBjdXN0b21lci1mYWNpbmcsIHBpbiA9IHN0YWZmL29wcywgZ29vZ2xlID0gZXhlYy9sZWFkZXJzaGlwKS5cbjguICoqUGFnZXMqKjogc2x1Z3MgcHJlZml4ZWQgd2l0aCB0aGUgYXBwIGlkIChlLmcuIFwiL2hyL2VtcGxveWVlc1wiKTsgYmxvY2tUeXBlc1xuICAgZnJvbTogJHtBVkFJTEFCTEVfQkxPQ0tTLmpvaW4oJywgJyl9LiBVc2UgXCJvcHNfYWRtaW5fdGFic1wiIGZvciBtb2RlbFxuICAgQ1JVRC9hZG1pbiBzdXJmYWNlcywgXCJrcGlfY2FyZHNcIi9cImNoYXJ0X2ZpbmFuY2lhbFwiL1wicmVwb3J0c19yb2xsdXBcIiBmb3JcbiAgIHJlcG9ydGluZywgXCJhY3Rpb25fY2hlY2tsaXN0XCIgZm9yIGFjdGlvbmFibGUgaXRlbXMsIFwiZG9jX21hcmtkb3duXCIgZm9yXG4gICBwb2xpY2llcywgXCJzaGVldF92aWV3ZXJcIiBmb3IgcmF3IGRhdGEuXG45LiAqKk5hdioqOiBvbmUgbmF2IHNlY3Rpb24gcGVyIGFwcCB3aXRoIGEgY2xlYXIgbGFiZWwgKyBpY29uIGhpbnQ7IHBhZ2VzIGxpc3QuXG4xMC4gKipVWCB3b3JrZmxvdyoqOiAyLTUgc3RhZ2VzIGRlc2NyaWJpbmcgdGhlIGVuZC10by1lbmQgdXNlciBqb3VybmV5IGluc2lkZVxuICAgIHRoZSBhcHAgKGUuZy4gT25ib2FyZGluZyBcdTIxOTIgRGFpbHkgT3BzIFx1MjE5MiBSZXZpZXcpLCBlYWNoIHdpdGggY29uY3JldGUgYWN0aW9uc1xuICAgIChjcmVhdGUvcmVhZC91cGRhdGUvYXBwcm92ZS9leHBvcnQvbm90aWZ5L3JldmlldykgcG9pbnRpbmcgYXQgcmVhbCBwYWdlcy5cbjExLiAqKktub3dsZWRnZSBzbmlwcGV0cyoqOiAzLTYgc25pcHBldHMgKGtleSwgdGl0bGUsIGNvbnRlbnQgaW4gbWFya2Rvd24pIFx1MjAxNFxuICAgIHBvbGljaWVzLCBzdGVwLWJ5LXN0ZXAgcHJvY2VkdXJlcywgZGVmaW5pdGlvbnMgYW5kIGd1aWRhbmNlIHNwZWNpZmljIHRvXG4gICAgdGhpcyBkZXBhcnRtZW50J3MgYXBwLiBUaGVzZSBmb3JtIHRoZSBhcHAncyBrbm93bGVkZ2UgYmFzZS5cbjEyLiAqKnNjaGVtYS5vcmcgdHlwZSoqOiBwcmltYXJ5IHR5cGUgaXMgXCIke3NjaGVtYU9yZ1R5cGV9XCIuXG4xMy4gKipUYWJsZSBuYW1lcyoqOiBzbmFrZV9jYXNlIHBsdXJhbDsgKipmaWVsZCBuYW1lcyoqOiBjYW1lbENhc2UuXG4xNC4gKipGaWVsZCB3aWR0aCoqOiAxMiBmdWxsLXdpZHRoLCA2IGhhbGYtd2lkdGgsIDQgdGhpcmQtd2lkdGguXG5cbiMjIEtub3dsZWRnZSBiYXNlIChwbGF0Zm9ybSBjb250ZXh0KVxuXG4ke2tub3dsZWRnZUJhc2UgPyBrbm93bGVkZ2VCYXNlIDogJyhub25lIHByb3ZpZGVkIFx1MjAxNCB1c2UgZ2VuZXJhbCBiZXN0IHByYWN0aWNlcyknfVxuXG4jIyBDRU8gY29udGV4dFxuXG5UaGUgQ0VPIE92ZXJ2aWV3IGFwcCBwdXJwb3NlOiAke2Nlb1B1cnBvc2V9XG5DRU8gS1BJcyAodGhpcyBhcHAncyBkYXRhIHNob3VsZCBzdXBwb3J0IHRoZXNlKTogJHtjZW9LcGlzLmpvaW4oJywgJyl9XG5cbiMjIE91dHB1dFxuXG5SZXR1cm4gdGhlIGNvbXBsZXRlIGFwcCBkZWZpbml0aW9uIChtb2RlbHMsIHVzZSBjYXNlcywgcGFnZXMsIG5hdiwgVVggd29ya2Zsb3csXG5rbm93bGVkZ2Ugc25pcHBldHMpLmA7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVBcHBEZWZpbml0aW9uKGJyaWVmLCBjZW9QdXJwb3NlLCBjZW9LcGlzLCBhbGxBcHBzLCBrbm93bGVkZ2VCYXNlKSB7XG4gICAgY29uc3QgeyBvYmplY3QgfSA9IGF3YWl0IGdlbmVyYXRlT2JqZWN0KHtcbiAgICAgICAgbW9kZWw6IG9wZW5haShNT0RFTCksXG4gICAgICAgIHNjaGVtYTogYXBwUGFja0FwcERlZmluaXRpb25ab2QsXG4gICAgICAgIHN5c3RlbTogYnVpbGRBcHBTeXN0ZW1Qcm9tcHQoYnJpZWYsIGNlb1B1cnBvc2UsIGNlb0twaXMsIGFsbEFwcHMsIGtub3dsZWRnZUJhc2UpLFxuICAgICAgICBwcm9tcHQ6IGBEZXNpZ24gdGhlIFwiJHticmllZi5uYW1lfVwiIGFwcGxpY2F0aW9uIGluIGZ1bGwgZGV0YWlsLmAsXG4gICAgICAgIHRlbXBlcmF0dXJlOiAwLjJcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqZWN0O1xufVxuLy8gXHUyNTAwXHUyNTAwIE1vY2sgdmFyaWFudHMgKGRldGVybWluaXN0aWMsIG5vIEFJIGtleSBuZWVkZWQpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZXhwb3J0IGZ1bmN0aW9uIG1vY2tEZWNvbXBvc2VQYWNrKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHBhY2tJZDogJ29wcy1kZXBhcnRtZW50LXBhY2snLFxuICAgICAgICBuYW1lOiAnT3BlcmF0aW9ucyBEZXBhcnRtZW50IFBhY2snLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ01vY2sgYXBwbGljYXRpb24gcGFjazogSFIsIFNhbGVzIFJlcG9ydGluZywgRmluYW5jZSBhbmQgYSBDRU8gT3ZlcnZpZXcgYXBwIHRoYXQgYWdncmVnYXRlcyBldmVyeSBkZXBhcnRtZW50LicsXG4gICAgICAgIGFwcHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ2hyJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnSFIgTWFuYWdlbWVudCcsXG4gICAgICAgICAgICAgICAgZGVwYXJ0bWVudDogJ0h1bWFuIFJlc291cmNlcycsXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogJ0VtcGxveWVlIHJlY29yZHMsIG9uYm9hcmRpbmcsIGxlYXZlIGFuZCBhdHRlbmRhbmNlIGZvciB0aGUgSFIgZGVwYXJ0bWVudC4nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlSWQ6ICdwcm9mZXNzaW9uYWwtc2VydmljZXMnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnc2FsZXMtcmVwb3J0aW5nJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnU2FsZXMgUmVwb3J0aW5nJyxcbiAgICAgICAgICAgICAgICBkZXBhcnRtZW50OiAnU2FsZXMnLFxuICAgICAgICAgICAgICAgIHN1bW1hcnk6ICdEYWlseSBzYWxlcyBjYXB0dXJlLCB0cmVuZCByZXBvcnRpbmcgYW5kIHRhcmdldCB0cmFja2luZyBmb3IgdGhlIFNhbGVzIGRlcGFydG1lbnQuJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUlkOiAncmVzdGF1cmFudCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICdmaW5hbmNlJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnRmluYW5jZSAvIFJlcG9ydGluZyAvIFRyYWNraW5nJyxcbiAgICAgICAgICAgICAgICBkZXBhcnRtZW50OiAnRmluYW5jZScsXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogJ1JldmVudWUsIGNvc3RzLCBjYXNoZmxvdyB0cmFja2luZyBhbmQgZmluYW5jaWFsIHJlcG9ydGluZyBmb3IgdGhlIEZpbmFuY2UgZGVwYXJ0bWVudC4nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlSWQ6ICdmaW5hbmNpYWwtYW5hbHl0aWNzJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ2Nlby1vdmVydmlldycsXG4gICAgICAgICAgICAgICAgbmFtZTogJ0NFTyBPdmVydmlldycsXG4gICAgICAgICAgICAgICAgZGVwYXJ0bWVudDogJ0V4ZWN1dGl2ZSBMZWFkZXJzaGlwJyxcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiAnQ3Jvc3MtZGVwYXJ0bWVudCB0cmFuc3BhcmVuY3kgZGFzaGJvYXJkIHdpdGggYWNjZXNzIHRvIGV2ZXJ5IGRlcGFydG1lbnQga25vd2xlZGdlIGJhc2UgYW5kIHJlYWx0aW1lIGFjdGlvbmFibGUgaXRlbXMuJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUlkOiAnZmluYW5jaWFsLWFuYWx5dGljcydcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgY2VvT3ZlcnZpZXc6IHtcbiAgICAgICAgICAgIHB1cnBvc2U6ICdBZ2dyZWdhdGUgS1BJcyBhbmQga25vd2xlZGdlIGZyb20gZXZlcnkgZGVwYXJ0bWVudCBhcHAgaW50byBhIHNpbmdsZSBsZWFkZXJzaGlwIG92ZXJ2aWV3IHdpdGggYWN0aW9uYWJsZSBpdGVtcy4nLFxuICAgICAgICAgICAga3BpczogW1xuICAgICAgICAgICAgICAgICdyZXZlbnVlJyxcbiAgICAgICAgICAgICAgICAnZ3Jvc3NNYXJnaW4nLFxuICAgICAgICAgICAgICAgICdoZWFkY291bnQnLFxuICAgICAgICAgICAgICAgICdzYWxlc1RhcmdldEFjaGlldmVtZW50JyxcbiAgICAgICAgICAgICAgICAnY2FzaGZsb3cnLFxuICAgICAgICAgICAgICAgICdjb21wbGlhbmNlU3RhdHVzJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBtb2NrR2VuZXJhdGVBcHBEZWZpbml0aW9uKGJyaWVmKSB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gYnJpZWYuaWQgPT09ICdocicgPyAnRW1wbG95ZWUnIDogYnJpZWYuaWQgPT09ICdzYWxlcy1yZXBvcnRpbmcnID8gJ0RhaWx5U2FsZScgOiBicmllZi5pZCA9PT0gJ2ZpbmFuY2UnID8gJ0ZpbmFuY2lhbFJlY29yZCcgOiAnRGVwYXJ0bWVudEtwaSc7XG4gICAgY29uc3QgdGFibGVOYW1lID0gYCR7bW9kZWxOYW1lLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMV8kMicpLnRvTG93ZXJDYXNlKCl9c2A7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYXBwSWQ6IGJyaWVmLmlkLFxuICAgICAgICBhcHBOYW1lOiBicmllZi5uYW1lLFxuICAgICAgICBkZXBhcnRtZW50OiBicmllZi5kZXBhcnRtZW50LFxuICAgICAgICB3M2NTdGFuZGFyZDogVzNDX1NUQU5EQVJEU1ticmllZi50ZW1wbGF0ZUlkXSA/PyAnc2NoZW1hLm9yZycsXG4gICAgICAgIHNjaGVtYU9yZ1R5cGU6IFNDSEVNQV9PUkdfVFlQRVNbYnJpZWYudGVtcGxhdGVJZF0gPz8gJ0xvY2FsQnVzaW5lc3MnLFxuICAgICAgICBtb2RlbHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBtb2RlbE5hbWUsXG4gICAgICAgICAgICAgICAgdGFibGVOYW1lLFxuICAgICAgICAgICAgICAgIGZpZWxkczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnbmFtZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hT3JnUHJvcGVydHk6ICduYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTmFtZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMTJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3N0YXR1cycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW51bScsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudW1WYWx1ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncGVuZGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FjdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FyY2hpdmVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiA2XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdub3RlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ05vdGVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxMlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICB1c2VDYXNlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiBgVUMtJHticmllZi5pZC50b1VwcGVyQ2FzZSgpLnNsaWNlKDAsIDQpfS0wMWAsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGBNYW5hZ2UgJHticmllZi5uYW1lfSByZWNvcmRzYCxcbiAgICAgICAgICAgICAgICBhdXRoOiAncGluJyxcbiAgICAgICAgICAgICAgICByb3V0ZTogYC8ke2JyaWVmLmlkfWAsXG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlczogW1xuICAgICAgICAgICAgICAgICAgICAnb3BzX2FkbWluX3RhYnMnXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBtb2RlbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWxOYW1lXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBwYWdlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNsdWc6IGAke2JyaWVmLmlkfWAsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGJyaWVmLm5hbWUsXG4gICAgICAgICAgICAgICAgYXV0aFRpZXI6ICdwaW4nLFxuICAgICAgICAgICAgICAgIGJsb2NrVHlwZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgJ2twaV9jYXJkcycsXG4gICAgICAgICAgICAgICAgICAgICdvcHNfYWRtaW5fdGFicydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIG5hdkxhYmVsOiBicmllZi5uYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIG5hdjoge1xuICAgICAgICAgICAgbGFiZWw6IGJyaWVmLm5hbWUsXG4gICAgICAgICAgICBpY29uOiAnRGFzaGJvYXJkJyxcbiAgICAgICAgICAgIHBhZ2VzOiBbXG4gICAgICAgICAgICAgICAgYnJpZWYuaWRcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgdXhXb3JrZmxvdzogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YWdlOiAnRGFpbHkgb3BlcmF0aW9ucycsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZWNvcmQgYW5kIHJldmlldyBkYWlseSBlbnRyaWVzJyxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogYE9wZW4gJHticmllZi5uYW1lfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYWdlOiBgLyR7YnJpZWYuaWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblR5cGU6ICduYXZpZ2F0ZSdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnQWRkIHJlY29yZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYWdlOiBgLyR7YnJpZWYuaWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1vZGVsOiBtb2RlbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25UeXBlOiAnY3JlYXRlJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdGFnZTogJ1JldmlldycsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZXZpZXcgYW5kIGFwcHJvdmUgZW50cmllcycsXG4gICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdBcHByb3ZlIGVudHJpZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UGFnZTogYC8ke2JyaWVmLmlkfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25UeXBlOiAnYXBwcm92ZSdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnRXhwb3J0IHJlcG9ydCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYWdlOiBgLyR7YnJpZWYuaWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblR5cGU6ICdleHBvcnQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGtub3dsZWRnZVNuaXBwZXRzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBgJHticmllZi5pZH0tb3ZlcnZpZXdgLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBgJHticmllZi5uYW1lfSBcdTIwMTQgT3ZlcnZpZXdgLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGAjICR7YnJpZWYubmFtZX1cXG5cXG5TdGFuZGFyZCBvcGVyYXRpbmcgZ3VpZGFuY2UgZm9yIHRoZSAke2JyaWVmLmRlcGFydG1lbnR9IGFwcDogcmVjb3JkIGVudHJpZXMgZGFpbHksIHJldmlldyB3ZWVrbHksIGVzY2FsYXRlIGV4Y2VwdGlvbnMgdG8gdGhlIENFTyBPdmVydmlldyBkYXNoYm9hcmQuYFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IGAke2JyaWVmLmlkfS1iZXN0LXByYWN0aWNlc2AsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGAke2JyaWVmLm5hbWV9IFx1MjAxNCBCZXN0IFByYWN0aWNlc2AsXG4gICAgICAgICAgICAgICAgY29udGVudDogYCMjIEJlc3QgUHJhY3RpY2VzXFxuXFxuMS4gS2VlcCByZWNvcmRzIGN1cnJlbnQgZGFpbHkuXFxuMi4gRmxhZyBhbm9tYWxpZXMgaW1tZWRpYXRlbHkuXFxuMy4gVXNlIHRoZSBhY3Rpb24gY2hlY2tsaXN0IGZvciBmb2xsb3ctdXBzLmBcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG59XG4iLCAiLyoqXG4gKiBBcHAgUGFjayBcdTIwMTQgWm9kIHNjaGVtYXMgZm9yIEFJLWdlbmVyYXRlZCBcImFwcGxpY2F0aW9uIHBhY2tcIiBkZWZpbml0aW9ucy5cbiAqXG4gKiBBbiBhcHBsaWNhdGlvbiBwYWNrIGlzIGEgY29sbGVjdGlvbiBvZiBkZXBhcnRtZW50IGFwcGxpY2F0aW9ucyAoSFIsXG4gKiBNYXJrZXRpbmcvTWVtYmVyc2hpcHMsIFNhbGVzIFJlcG9ydGluZywgRWNvbW1lcmNlIE1hcmtldHBsYWNlLCBSZWZlcnJhbHMsXG4gKiBCYWNrIE9mZmljZSwgTGVnYWwsIEZpbmFuY2UsIENvbXBsaWFuY2UsIENFTyBPdmVydmlldywgLi4uKS4gRWFjaCBhcHAgaXNcbiAqIGZ1bGx5IGRlcml2ZWQgYnkgQUkgZnJvbSBhIG5hdHVyYWwtbGFuZ3VhZ2UgcmVxdWlyZW1lbnQgYW5kIGNhcnJpZXM6XG4gKlxuICogICAxLiBVc2UgY2FzZXMgICAgICAgIFx1MjAxNCBVQy1YWFgtTk4gd2l0aCBhdXRoIHRpZXJzICsgcm91dGVzXG4gKiAgIDIuIFczIFNjaGVtYSAgICAgICAgXHUyMDE0IG1vZGVscyB3aXRoIFczQyBYU0QgZmllbGQgdHlwZXMgKyBzY2hlbWEub3JnIG1hcHBpbmdzXG4gKiAgIDMuIFplblN0YWNrICAgICAgICAgXHUyMDE0IGNvbXBpbGVkIGZyb20gdGhlIG1vZGVscyBhdCBidWlsZCB0aW1lICh6bW9kZWwpXG4gKiAgIDQuIFRlbXBsYXRlcyAgICAgICAgXHUyMDE0IHBhZ2UgYmxvY2sgdHlwZXMgKGR5bmFtaWNfZm9ybSwga3BpX2NhcmRzLCAuLi4pXG4gKiAgIDUuIE5hdmlnYXRpb25hbCBEeW5hbWljIFBhZ2VzIFx1MjAxNCBzbHVncywgbmF2IHNlY3Rpb25zLCBzZWN1cml0eSBncm91cHNcbiAqICAgNi4gVVggV29ya2Zsb3cgICAgICBcdTIwMTQgc3RhZ2VzICsgYWN0aW9ucyAod2hhdCB0aGUgdXNlciBkb2VzIGluIHRoZSBhcHApXG4gKiAgIDcuIEtub3dsZWRnZSBTbmlwcGV0cyBcdTIwMTQgcGVyLWFwcCBrbm93bGVkZ2UgYmFzZSBlbnRyaWVzXG4gKlxuICogVGhlIENFTyBPdmVydmlldyBhcHAgaXMgZ2VuZXJhdGVkIHdpdGggY3Jvc3MtYXBwIHZpc2liaWxpdHk6IGl0cyBwYWdlcyBhbmRcbiAqIGtub3dsZWRnZSByZWZlcmVuY2UgZXZlcnkgZGVwYXJ0bWVudCBhcHAgaW4gdGhlIHBhY2suXG4gKi8gaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBzY2hlbWFNb2RlbFpvZCwgdXNlQ2FzZVpvZCwgcGFnZVpvZCB9IGZyb20gJ0AvZG9tYWluL2FpL3NjaGVtYS1nZW5lcmF0aW9uLXNjaGVtYSc7XG4vLyBcdTI1MDBcdTI1MDAgUGFjay1sZXZlbCAoZGVjb21wb3NpdGlvbikgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5leHBvcnQgY29uc3QgYXBwUGFja0FwcEJyaWVmWm9kID0gei5vYmplY3Qoe1xuICAgIGlkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdBcHAgaWQgaW4ga2ViYWItY2FzZSwgZS5nLiBcImhyXCIgb3IgXCJzYWxlcy1yZXBvcnRpbmdcIicpLFxuICAgIG5hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0h1bWFuLXJlYWRhYmxlIGFwcCBuYW1lLCBlLmcuIFwiSFIgTWFuYWdlbWVudFwiJyksXG4gICAgZGVwYXJ0bWVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnQnVzaW5lc3MgZGVwYXJ0bWVudCB0aGlzIGFwcCBzZXJ2ZXMsIGUuZy4gXCJIdW1hbiBSZXNvdXJjZXNcIicpLFxuICAgIHN1bW1hcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ09uZS1wYXJhZ3JhcGggZGVzY3JpcHRpb24gb2Ygd2hhdCB0aGlzIGFwcCBkb2VzJyksXG4gICAgdGVtcGxhdGVJZDogei5zdHJpbmcoKS5kZXNjcmliZSgnQmVzdC1maXQgdGVtcGxhdGUgaWQgZnJvbTogZmluYW5jaWFsLWFuYWx5dGljcywgcmVzdGF1cmFudCwgaG90ZWwsIGVjb21tZXJjZS1yZXRhaWwsIGhlYWx0aGNhcmUsIHN1cHBseS1jaGFpbiwgcmVhbC1lc3RhdGUsIGVkdWNhdGlvbiwgcHJvZmVzc2lvbmFsLXNlcnZpY2VzLCBtYW51ZmFjdHVyaW5nJylcbn0pO1xuZXhwb3J0IGNvbnN0IGFwcFBhY2tEZWNvbXBvc2l0aW9uWm9kID0gei5vYmplY3Qoe1xuICAgIHBhY2tJZDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGFjayBpZCBpbiBrZWJhYi1jYXNlLCBlLmcuIFwib3BzLWRlcGFydG1lbnQtcGFja1wiJyksXG4gICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnUGFjayBkaXNwbGF5IG5hbWUnKSxcbiAgICBkZXNjcmlwdGlvbjogei5zdHJpbmcoKS5kZXNjcmliZSgnSGlnaC1sZXZlbCBkZXNjcmlwdGlvbiBvZiB0aGUgd2hvbGUgcGFjaycpLFxuICAgIGFwcHM6IHouYXJyYXkoYXBwUGFja0FwcEJyaWVmWm9kKS5kZXNjcmliZSgnT25lIGJyaWVmIHBlciBkZXBhcnRtZW50IGFwcGxpY2F0aW9uJyksXG4gICAgY2VvT3ZlcnZpZXc6IHoub2JqZWN0KHtcbiAgICAgICAgcHVycG9zZTogei5zdHJpbmcoKS5kZXNjcmliZSgnV2hhdCB0aGUgQ0VPIE92ZXJ2aWV3IGFwcCBkb2VzIGFjcm9zcyBhbGwgZGVwYXJ0bWVudHMnKSxcbiAgICAgICAga3Bpczogei5hcnJheSh6LnN0cmluZygpKS5kZXNjcmliZSgnQ3Jvc3MtZGVwYXJ0bWVudCBLUElzIHRoZSBDRU8gZGFzaGJvYXJkIHNob3VsZCBzdXJmYWNlJylcbiAgICB9KVxufSk7XG4vLyBcdTI1MDBcdTI1MDAgUGVyLWFwcCAoZGV0YWlsZWQgZGVmaW5pdGlvbikgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5leHBvcnQgY29uc3QgYXBwVXhBY3Rpb25ab2QgPSB6Lm9iamVjdCh7XG4gICAgYWN0aW9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdBY3Rpb24gbGFiZWwsIGUuZy4gXCJDcmVhdGUgbmV3IGVtcGxveWVlXCInKSxcbiAgICB0YXJnZXRQYWdlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdSb3V0ZSBwYXRoIHRoaXMgYWN0aW9uIG5hdmlnYXRlcyB0bycpLFxuICAgIHRhcmdldE1vZGVsOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1ByaW1hcnkgbW9kZWwgdGhlIGFjdGlvbiBvcGVyYXRlcyBvbicpLFxuICAgIGFjdGlvblR5cGU6IHouZW51bShbXG4gICAgICAgICdjcmVhdGUnLFxuICAgICAgICAncmVhZCcsXG4gICAgICAgICd1cGRhdGUnLFxuICAgICAgICAnZGVsZXRlJyxcbiAgICAgICAgJ2FwcHJvdmUnLFxuICAgICAgICAnZXhwb3J0JyxcbiAgICAgICAgJ25vdGlmeScsXG4gICAgICAgICduYXZpZ2F0ZScsXG4gICAgICAgICdyZXZpZXcnXG4gICAgXSkuZGVzY3JpYmUoJ0tpbmQgb2YgYWN0aW9uJylcbn0pO1xuZXhwb3J0IGNvbnN0IGFwcFV4U3RhZ2Vab2QgPSB6Lm9iamVjdCh7XG4gICAgc3RhZ2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1dvcmtmbG93IHN0YWdlIG5hbWUsIGUuZy4gXCJPbmJvYXJkaW5nXCInKSxcbiAgICBkZXNjcmlwdGlvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdXaGF0IHRoaXMgc3RhZ2UgYWNjb21wbGlzaGVzJyksXG4gICAgYWN0aW9uczogei5hcnJheShhcHBVeEFjdGlvblpvZCkuZGVzY3JpYmUoJ0FjdGlvbnMgYXZhaWxhYmxlIGluIHRoaXMgc3RhZ2UnKVxufSk7XG5leHBvcnQgY29uc3QgYXBwTmF2Wm9kID0gei5vYmplY3Qoe1xuICAgIGxhYmVsOiB6LnN0cmluZygpLmRlc2NyaWJlKCdOYXYgbWVudSBsYWJlbCBmb3IgdGhpcyBhcHAnKSxcbiAgICBpY29uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ01VSSBpY29uIG5hbWUgaGludCAoZS5nLiBcIlBlb3BsZVwiLCBcIlBheW1lbnRzXCIpJyksXG4gICAgcGFnZXM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVzY3JpYmUoJ1BhZ2Ugc2x1Z3MgZ3JvdXBlZCB1bmRlciB0aGlzIGFwcCBpbiB0aGUgbmF2Jylcbn0pO1xuZXhwb3J0IGNvbnN0IGFwcEtub3dsZWRnZVNuaXBwZXRab2QgPSB6Lm9iamVjdCh7XG4gICAga2V5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdTbmlwcGV0IGtleSBpbiBrZWJhYi1jYXNlLCBlLmcuIFwiaHItb25ib2FyZGluZy1zdGVwc1wiJyksXG4gICAgdGl0bGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NuaXBwZXQgdGl0bGUnKSxcbiAgICBjb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdLbm93bGVkZ2UgY29udGVudCAobWFya2Rvd24pIFx1MjAxNCBwb2xpY2llcywgc3RlcHMsIGd1aWRhbmNlJylcbn0pO1xuZXhwb3J0IGNvbnN0IGFwcFBhY2tBcHBEZWZpbml0aW9uWm9kID0gei5vYmplY3Qoe1xuICAgIGFwcElkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdBcHAgaWQgbWF0Y2hpbmcgdGhlIGRlY29tcG9zaXRpb24gYnJpZWYnKSxcbiAgICBhcHBOYW1lOiB6LnN0cmluZygpLFxuICAgIGRlcGFydG1lbnQ6IHouc3RyaW5nKCksXG4gICAgdzNjU3RhbmRhcmQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1czQyBYU0QgLyBkYXRhIHN0YW5kYXJkIGFwcGxpZWQgKGUuZy4gXCJVQkwgZm9yIGludm9pY2VzXCIpJyksXG4gICAgc2NoZW1hT3JnVHlwZTogei5zdHJpbmcoKS5kZXNjcmliZSgnUHJpbWFyeSBzY2hlbWEub3JnIHR5cGUnKSxcbiAgICBtb2RlbHM6IHNjaGVtYU1vZGVsWm9kLmFycmF5KCkuZGVzY3JpYmUoJzMtOCBaZW5TdGFjayBtb2RlbHMgKG5vIGlkL3RlbmFudFNsdWcvY3JlYXRlZEF0L3VwZGF0ZWRBdCBiYXNlIGZpZWxkcyknKSxcbiAgICB1c2VDYXNlczogdXNlQ2FzZVpvZC5hcnJheSgpLmRlc2NyaWJlKCdVc2UgY2FzZXMgZm9yIHRoaXMgYXBwIChVQy1YWFgtTk4pJyksXG4gICAgcGFnZXM6IHBhZ2Vab2QuYXJyYXkoKS5kZXNjcmliZSgnUGFnZXMgZm9yIHRoaXMgYXBwIChhdXRoIHRpZXJzOiBwdWJsaWMvcGluL2dvb2dsZSknKSxcbiAgICBuYXY6IGFwcE5hdlpvZCxcbiAgICB1eFdvcmtmbG93OiB6LmFycmF5KGFwcFV4U3RhZ2Vab2QpLmRlc2NyaWJlKCdFbmQtdG8tZW5kIFVYIHdvcmtmbG93IHN0YWdlcyBmb3IgdGhpcyBhcHAnKSxcbiAgICBrbm93bGVkZ2VTbmlwcGV0czogei5hcnJheShhcHBLbm93bGVkZ2VTbmlwcGV0Wm9kKS5kZXNjcmliZSgnS25vd2xlZGdlIHNuaXBwZXRzIGZvciB0aGlzIGFwcCcpXG59KTtcbi8vIFx1MjUwMFx1MjUwMCBNYXRlcmlhbGl6ZWQgcnVuIHJlc3VsdCAocGVyc2lzdGVkKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmV4cG9ydCBjb25zdCBhcHBQYWNrUnVuUmVzdWx0Wm9kID0gei5vYmplY3Qoe1xuICAgIHBhY2tJZDogei5zdHJpbmcoKSxcbiAgICBuYW1lOiB6LnN0cmluZygpLFxuICAgIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLFxuICAgIGNyZWF0ZWRBdDogei5zdHJpbmcoKSxcbiAgICBhcHBzOiB6LmFycmF5KGFwcFBhY2tBcHBEZWZpbml0aW9uWm9kKSxcbiAgICBjZW9PdmVydmlldzogei5vYmplY3Qoe1xuICAgICAgICBwdXJwb3NlOiB6LnN0cmluZygpLFxuICAgICAgICBrcGlzOiB6LmFycmF5KHouc3RyaW5nKCkpXG4gICAgfSksXG4gICAgbWF0ZXJpYWxpemVkOiB6Lm9iamVjdCh7XG4gICAgICAgIHBhZ2VzOiB6Lm51bWJlcigpLFxuICAgICAgICBuYXZJdGVtczogei5udW1iZXIoKSxcbiAgICAgICAgc25pcHBldHM6IHoubnVtYmVyKCksXG4gICAgICAgIGdyb3Vwczogei5udW1iZXIoKSxcbiAgICAgICAgem1vZGVsczogei5udW1iZXIoKVxuICAgIH0pXG59KTtcbiIsICIvKipcbiAqIFpvZCBzY2hlbWEgZm9yIEFJLWdlbmVyYXRlZCBXM0Mgc2NoZW1hIGRlZmluaXRpb25zLlxuICpcbiAqIFRoaXMgc2NoZW1hIGlzIHVzZWQgd2l0aCB0aGUgVmVyY2VsIEFJIFNESydzIGBnZW5lcmF0ZU9iamVjdCgpYCBmdW5jdGlvblxuICogdG8gZW5zdXJlIHRoZSBBSSByZXR1cm5zIGEgc3RydWN0dXJhbGx5IHZhbGlkIHNjaGVtYSBkZWZpbml0aW9uLlxuICovIGltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuZXhwb3J0IGNvbnN0IHNjaGVtYUZpZWxkWm9kID0gei5vYmplY3Qoe1xuICAgIG5hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0ZpZWxkIG5hbWUgaW4gY2FtZWxDYXNlJyksXG4gICAgdHlwZTogei5lbnVtKFtcbiAgICAgICAgJ3N0cmluZycsXG4gICAgICAgICd0ZXh0JyxcbiAgICAgICAgJ2ludGVnZXInLFxuICAgICAgICAnZGVjaW1hbCcsXG4gICAgICAgICdib29sZWFuJyxcbiAgICAgICAgJ2RhdGV0aW1lJyxcbiAgICAgICAgJ2RhdGUnLFxuICAgICAgICAndGltZScsXG4gICAgICAgICdlbnVtJyxcbiAgICAgICAgJ2pzb24nLFxuICAgICAgICAncmVsYXRpb24nXG4gICAgXSkuZGVzY3JpYmUoJ0ZpZWxkIHR5cGUgYWxpZ25lZCB3aXRoIFhTRCBkYXRhIHR5cGVzJyksXG4gICAgcmVxdWlyZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgIHVuaXF1ZTogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgICBkZWZhdWx0OiB6LnVua25vd24oKS5vcHRpb25hbCgpLFxuICAgIGVudW1WYWx1ZXM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKSxcbiAgICByZWxhdGlvblRvOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgcmVsYXRpb25UeXBlOiB6LmVudW0oW1xuICAgICAgICAnb25lLXRvLW1hbnknLFxuICAgICAgICAnbWFueS10by1vbmUnLFxuICAgICAgICAnbWFueS10by1tYW55J1xuICAgIF0pLm9wdGlvbmFsKCksXG4gICAgc2NoZW1hT3JnUHJvcGVydHk6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnc2NoZW1hLm9yZyBwcm9wZXJ0eSBtYXBwaW5nIChlLmcuLCBcIm9mZmVycy5wcmljZVwiKScpLFxuICAgIGxhYmVsOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0h1bWFuLXJlYWRhYmxlIGxhYmVsIGZvciBVSSBmb3JtcycpLFxuICAgIHdpZHRoOiB6LnVuaW9uKFtcbiAgICAgICAgei5saXRlcmFsKDQpLFxuICAgICAgICB6LmxpdGVyYWwoNiksXG4gICAgICAgIHoubGl0ZXJhbCg4KSxcbiAgICAgICAgei5saXRlcmFsKDEyKVxuICAgIF0pLm9wdGlvbmFsKClcbn0pO1xuZXhwb3J0IGNvbnN0IHNjaGVtYU1vZGVsWm9kID0gei5vYmplY3Qoe1xuICAgIG5hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ01vZGVsIG5hbWUgaW4gUGFzY2FsQ2FzZScpLFxuICAgIHRhYmxlTmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnRGF0YWJhc2UgdGFibGUgbmFtZSBpbiBzbmFrZV9jYXNlX3BsdXJhbCcpLFxuICAgIGZpZWxkczogei5hcnJheShzY2hlbWFGaWVsZFpvZCksXG4gICAgc2NoZW1hT3JnTWFwcGluZzogei5yZWNvcmQoei5zdHJpbmcoKSkub3B0aW9uYWwoKVxufSk7XG5leHBvcnQgY29uc3QgdXNlQ2FzZVpvZCA9IHoub2JqZWN0KHtcbiAgICBpZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVXNlIGNhc2UgSUQgaW4gZm9ybWF0IFVDLVhYWC1OTiAoZS5nLiwgVUMtUkVTVC0wMSknKSxcbiAgICB0aXRsZTogei5zdHJpbmcoKSxcbiAgICBhdXRoOiB6LmVudW0oW1xuICAgICAgICAncHVibGljJyxcbiAgICAgICAgJ3BpbicsXG4gICAgICAgICdnb29nbGUnXG4gICAgXSksXG4gICAgcm91dGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1JvdXRlIHBhdGggKGUuZy4sIFwiL21lbnVcIiknKSxcbiAgICBibG9ja1R5cGVzOiB6LmFycmF5KHouc3RyaW5nKCkpLFxuICAgIG1vZGVsczogei5hcnJheSh6LnN0cmluZygpKVxufSk7XG5leHBvcnQgY29uc3QgcGFnZVpvZCA9IHoub2JqZWN0KHtcbiAgICBzbHVnOiB6LnN0cmluZygpLFxuICAgIHRpdGxlOiB6LnN0cmluZygpLFxuICAgIGF1dGhUaWVyOiB6LmVudW0oW1xuICAgICAgICAncHVibGljJyxcbiAgICAgICAgJ3BpbicsXG4gICAgICAgICdnb29nbGUnXG4gICAgXSksXG4gICAgYmxvY2tUeXBlczogei5hcnJheSh6LnN0cmluZygpKSxcbiAgICBuYXZMYWJlbDogei5zdHJpbmcoKS5vcHRpb25hbCgpXG59KTtcbmV4cG9ydCBjb25zdCBzY2hlbWFHZW5lcmF0aW9uWm9kU2NoZW1hID0gei5vYmplY3Qoe1xuICAgIHRlbXBsYXRlSWQ6IHouc3RyaW5nKCksXG4gICAgc2NoZW1hT3JnVHlwZTogei5zdHJpbmcoKSxcbiAgICBtb2RlbHM6IHouYXJyYXkoc2NoZW1hTW9kZWxab2QpLFxuICAgIHVzZUNhc2VzOiB6LmFycmF5KHVzZUNhc2Vab2QpLFxuICAgIHBhZ2VzOiB6LmFycmF5KHBhZ2Vab2QpXG59KTtcbiIsICIvKipcbiAqIFplblN0YWNrIC56bW9kZWwgQ29tcGlsZXJcbiAqXG4gKiBUYWtlcyBhbiBBSS1nZW5lcmF0ZWQgU2NoZW1hR2VuZXJhdGlvblJlc3VsdCBhbmQgY29tcGlsZXMgaXRcbiAqIGludG8gYSB2YWxpZCBaZW5TdGFjayBzY2hlbWEuem1vZGVsIGZpbGUuXG4gKlxuICogVGhlIGdlbmVyYXRlZCAuem1vZGVsIGluY2x1ZGVzOlxuICogICAtIGRhdGFzb3VyY2UgKyBnZW5lcmF0b3IgYmxvY2tzXG4gKiAgIC0gQXV0aFRpZXIgZW51bVxuICogICAtIEFsbCBtb2RlbHMgd2l0aCBwcm9wZXIgZmllbGQgdHlwZXMsIGRlY29yYXRvcnMsIGFuZCBAQG1hcFxuICovIC8vIFx1MjUwMFx1MjUwMCBGaWVsZCB0eXBlIG1hcHBpbmcgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5mdW5jdGlvbiBtYXBGaWVsZFR5cGUoZmllbGQpIHtcbiAgICBzd2l0Y2goZmllbGQudHlwZSl7XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gJ1N0cmluZyc7XG4gICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgcmV0dXJuICdTdHJpbmcgQGRiLlRleHQnO1xuICAgICAgICBjYXNlICdpbnRlZ2VyJzpcbiAgICAgICAgICAgIHJldHVybiAnSW50JztcbiAgICAgICAgY2FzZSAnZGVjaW1hbCc6XG4gICAgICAgICAgICByZXR1cm4gJ0RlY2ltYWwgQGRiLkRlY2ltYWwoMTQsIDIpJztcbiAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICByZXR1cm4gJ0Jvb2xlYW4nO1xuICAgICAgICBjYXNlICdkYXRldGltZSc6XG4gICAgICAgICAgICByZXR1cm4gJ0RhdGVUaW1lJztcbiAgICAgICAgY2FzZSAnZGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4gJ0RhdGVUaW1lIEBkYi5EYXRlJztcbiAgICAgICAgY2FzZSAndGltZSc6XG4gICAgICAgICAgICByZXR1cm4gJ0RhdGVUaW1lIEBkYi5UaW1lJztcbiAgICAgICAgY2FzZSAnZW51bSc6XG4gICAgICAgICAgICByZXR1cm4gJ1N0cmluZyc7XG4gICAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICAgICAgcmV0dXJuICdKc29uJztcbiAgICAgICAgY2FzZSAncmVsYXRpb24nOlxuICAgICAgICAgICAgcmV0dXJuICdTdHJpbmcnO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICdTdHJpbmcnO1xuICAgIH1cbn1cbi8vIFx1MjUwMFx1MjUwMCBGaWVsZCBkZWNvcmF0b3IgbWFwcGluZyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmZ1bmN0aW9uIG1hcEZpZWxkRGVjb3JhdG9ycyhmaWVsZCkge1xuICAgIGNvbnN0IHBhcnRzID0gW107XG4gICAgaWYgKGZpZWxkLnVuaXF1ZSkgcGFydHMucHVzaCgnQHVuaXF1ZScpO1xuICAgIGlmIChmaWVsZC5kZWZhdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBmaWVsZC5kZWZhdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcGFydHMucHVzaChgQGRlZmF1bHQoXCIke2ZpZWxkLmRlZmF1bHR9XCIpYCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGZpZWxkLmRlZmF1bHQgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgcGFydHMucHVzaChgQGRlZmF1bHQoJHtmaWVsZC5kZWZhdWx0fSlgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZmllbGQuZGVmYXVsdCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHBhcnRzLnB1c2goYEBkZWZhdWx0KCR7ZmllbGQuZGVmYXVsdH0pYCk7XG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShmaWVsZC5kZWZhdWx0KSkge1xuICAgICAgICAgICAgcGFydHMucHVzaChgQGRlZmF1bHQoW10pYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGBAZGVmYXVsdChcInt9XCIpYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhcnRzLmxlbmd0aCA+IDAgPyAnICcgKyBwYXJ0cy5qb2luKCcgJykgOiAnJztcbn1cbi8vIFx1MjUwMFx1MjUwMCBGaWVsZCBjb21tZW50IChzY2hlbWEub3JnIG1hcHBpbmcpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gbWFwRmllbGRDb21tZW50KGZpZWxkKSB7XG4gICAgaWYgKCFmaWVsZC5zY2hlbWFPcmdQcm9wZXJ0eSkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIGAgIC8vLyBzY2hlbWEub3JnOiR7ZmllbGQuc2NoZW1hT3JnUHJvcGVydHl9YDtcbn1cbi8vIFx1MjUwMFx1MjUwMCBNb2RlbCBjb21waWxhdGlvbiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmZ1bmN0aW9uIGNvbXBpbGVNb2RlbChtb2RlbCkge1xuICAgIGNvbnN0IGZpZWxkc1N0ciA9IG1vZGVsLmZpZWxkcy5tYXAoKGYpPT57XG4gICAgICAgIGNvbnN0IHR5cGVTdHIgPSBtYXBGaWVsZFR5cGUoZik7XG4gICAgICAgIGNvbnN0IG9wdGlvbmFsID0gZi5yZXF1aXJlZCA/ICcnIDogJz8nO1xuICAgICAgICBjb25zdCBkZWNvcmF0b3JzID0gbWFwRmllbGREZWNvcmF0b3JzKGYpO1xuICAgICAgICBjb25zdCBjb21tZW50ID0gbWFwRmllbGRDb21tZW50KGYpO1xuICAgICAgICBjb25zdCBmaWVsZExpbmUgPSBgICAke2YubmFtZX0gJHt0eXBlU3RyfSR7b3B0aW9uYWx9JHtkZWNvcmF0b3JzfWA7XG4gICAgICAgIHJldHVybiBjb21tZW50ID8gYCR7Y29tbWVudH1cXG4ke2ZpZWxkTGluZX1gIDogZmllbGRMaW5lO1xuICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgIHJldHVybiBgXG5tb2RlbCAke21vZGVsLm5hbWV9IHtcbiAgaWQgICAgICAgICBTdHJpbmcgICBAaWQgQGRlZmF1bHQoY3VpZCgpKVxuICB0ZW5hbnRTbHVnIFN0cmluZz8gIEBtYXAoXCJ0ZW5hbnRfc2x1Z1wiKVxuJHtmaWVsZHNTdHJ9XG4gIGNyZWF0ZWRBdCAgRGF0ZVRpbWUgQGRlZmF1bHQobm93KCkpIEBtYXAoXCJjcmVhdGVkX2F0XCIpXG4gIHVwZGF0ZWRBdCAgRGF0ZVRpbWUgQHVwZGF0ZWRBdCBAbWFwKFwidXBkYXRlZF9hdFwiKVxuXG4gIEBAaW5kZXgoW3RlbmFudFNsdWddKVxuICBAQG1hcChcIiR7bW9kZWwudGFibGVOYW1lfVwiKVxufWA7XG59XG4vLyBcdTI1MDBcdTI1MDAgRnVsbCAuem1vZGVsIGNvbXBpbGF0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUb1pNb2RlbChzY2hlbWEpIHtcbiAgICBjb25zdCBoZWFkZXIgPSBgLy8gQXV0by1nZW5lcmF0ZWQgWmVuU3RhY2sgc2NoZW1hIGZvciAke3NjaGVtYS50ZW1wbGF0ZUlkfVxuLy8gR2VuZXJhdGVkIGJ5IFRPS0VOSVpNWUFQUCBBSSBTY2hlbWEgR2VuZXJhdG9yXG4vLyBzY2hlbWEub3JnIHR5cGU6ICR7c2NoZW1hLnNjaGVtYU9yZ1R5cGV9XG4vLyBXM0Mgc3RhbmRhcmQgYWxpZ25tZW50IGFwcGxpZWQgdG8gZmllbGQgdHlwZXNcblxuZGF0YXNvdXJjZSBkYiB7XG4gIHByb3ZpZGVyID0gXCJwb3N0Z3Jlc3FsXCJcbiAgdXJsICAgICAgPSBlbnYoXCJQT1NUR1JFU19VUkxcIilcbn1cblxuZ2VuZXJhdG9yIGNsaWVudCB7XG4gIHByb3ZpZGVyID0gXCJwcmlzbWEtY2xpZW50LWpzXCJcbiAgb3V0cHV0ICAgPSBcIi4uLy4uL3NyYy9nZW5lcmF0ZWQvcHJpc21hXCJcbiAgYmluYXJ5VGFyZ2V0cyA9IFtcIm5hdGl2ZVwiLCBcImxpbnV4LWFybTY0LW9wZW5zc2wtMy4wLnhcIl1cbn1cblxuZW51bSBBdXRoVGllciB7XG4gIHB1YmxpY1xuICBwaW5cbiAgZ29vZ2xlXG59XG5gO1xuICAgIGNvbnN0IG1vZGVscyA9IHNjaGVtYS5tb2RlbHMubWFwKGNvbXBpbGVNb2RlbCkuam9pbignXFxuJyk7XG4gICAgcmV0dXJuIGAke2hlYWRlcn1cXG4ke21vZGVsc31cXG5gO1xufVxuLy8gXHUyNTAwXHUyNTAwIFBhZ2UgY2F0YWxvZyBjb21waWxhdGlvbiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlVG9QYWdlQ2F0YWxvZyhzY2hlbWEpIHtcbiAgICBjb25zdCBwYWdlcyA9IHNjaGVtYS5wYWdlcy5tYXAoKHApPT5gICB7XG4gICAgc2x1ZzogJyR7cC5zbHVnfScsXG4gICAgdGl0bGU6ICcke3AudGl0bGV9JyxcbiAgICBhdXRoVGllcjogJyR7cC5hdXRoVGllcn0nLFxuICAgIG5hdkxhYmVsOiAnJHtwLm5hdkxhYmVsID8/IHAudGl0bGV9JyxcbiAgICBzZWN0aW9uczogW1xuICAgICAgJHtwLmJsb2NrVHlwZXMubWFwKChidCk9PmB7IGJsb2NrVHlwZTogJyR7YnR9JyBhcyBCbG9ja1R5cGUsIGNvbmZpZzoge30gfWApLmpvaW4oJyxcXG4gICAgICAnKX1cbiAgICBdLFxuICB9YCkuam9pbignLFxcbicpO1xuICAgIHJldHVybiBgLyoqXG4gKiBBdXRvLWdlbmVyYXRlZCBwYWdlIGNhdGFsb2cgZm9yICR7c2NoZW1hLnRlbXBsYXRlSWR9XG4gKiBHZW5lcmF0ZWQgYnkgVE9LRU5JWk1ZQVBQIEFJIFNjaGVtYSBHZW5lcmF0b3JcbiAqL1xuaW1wb3J0IHR5cGUgeyBQYWdlRGVmaW5pdGlvbiB9IGZyb20gJ0AvbGliL3BhZ2UtY2F0YWxvZyc7XG5cbmV4cG9ydCBjb25zdCBHRU5FUkFURURfUEFHRVM6IFBhZ2VEZWZpbml0aW9uW10gPSBbXG4ke3BhZ2VzfVxuXTtcbmA7XG59XG4iLCAiLyoqXG4gKiBBcHAgUGFjayBcdTIwMTQgQ29tcGlsZXJcbiAqXG4gKiBEZXRlcm1pbmlzdGljIGNvbXBpbGF0aW9uIG9mIEFJLWdlbmVyYXRlZCBhcHAgZGVmaW5pdGlvbnMgaW50byBhcnRpZmFjdHMgdGhlXG4gKiBwbGF0Zm9ybSBjYW4gbWF0ZXJpYWxpemU6XG4gKlxuICogICAtIFplblN0YWNrIC56bW9kZWwgc291cmNlIChwZXIgYXBwLCB2aWEgY29tcGlsZVRvWk1vZGVsKVxuICogICAtIFBhZ2UgY2F0YWxvZyBzb3VyY2UgKHBlciBhcHAsIHZpYSBjb21waWxlVG9QYWdlQ2F0YWxvZylcbiAqICAgLSBEQiByb3dzIGZvciBwYWdlcywgbmF2IGl0ZW1zLCBrbm93bGVkZ2Ugc25pcHBldHMgYW5kIHNlY3VyaXR5IGdyb3Vwc1xuICogICAtIFVYIHdvcmtmbG93IGRvY3VtZW50cyAoSlNPTilcbiAqLyBpbXBvcnQgeyBjb21waWxlVG9aTW9kZWwsIGNvbXBpbGVUb1BhZ2VDYXRhbG9nIH0gZnJvbSAnQC9kb21haW4vYWkvem1vZGVsLWNvbXBpbGVyJztcbmZ1bmN0aW9uIHRvU2NoZW1hR2VuZXJhdGlvblJlc3VsdChkZWYpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0ZW1wbGF0ZUlkOiBkZWYuYXBwSWQsXG4gICAgICAgIHNjaGVtYU9yZ1R5cGU6IGRlZi5zY2hlbWFPcmdUeXBlLFxuICAgICAgICBtb2RlbHM6IGRlZi5tb2RlbHMsXG4gICAgICAgIHVzZUNhc2VzOiBkZWYudXNlQ2FzZXMsXG4gICAgICAgIHBhZ2VzOiBkZWYucGFnZXNcbiAgICB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVBcHBBcnRpZmFjdHMoZGVmKSB7XG4gICAgY29uc3Qgc2NoZW1hID0gdG9TY2hlbWFHZW5lcmF0aW9uUmVzdWx0KGRlZik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYXBwSWQ6IGRlZi5hcHBJZCxcbiAgICAgICAgYXBwTmFtZTogZGVmLmFwcE5hbWUsXG4gICAgICAgIGRlcGFydG1lbnQ6IGRlZi5kZXBhcnRtZW50LFxuICAgICAgICB6bW9kZWw6IGNvbXBpbGVUb1pNb2RlbChzY2hlbWEpLFxuICAgICAgICBwYWdlQ2F0YWxvZzogY29tcGlsZVRvUGFnZUNhdGFsb2coc2NoZW1hKSxcbiAgICAgICAgc2VjdXJpdHlHcm91cENvZGU6IGBhcHBfJHtkZWYuYXBwSWR9YCxcbiAgICAgICAgc2VjdXJpdHlHcm91cE5hbWU6IGBBcHA6ICR7ZGVmLmFwcE5hbWV9YFxuICAgIH07XG59XG4vKiogTm9ybWFsaXplIGFuIEFJLWdlbmVyYXRlZCBwYWdlIHNsdWcgdG8gYSBzaW5nbGUgVVJMLXNhZmUgc2VnbWVudC4gKi8gZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplUGFnZVNsdWcoc2x1Zykge1xuICAgIHJldHVybiBzbHVnLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXlxcLysvLCAnJykucmVwbGFjZSgvW1xccy5dKy9nLCBcIi1cIikucmVwbGFjZSgvW15hLXowLTktX10vZywgJycpLnNsaWNlKDAsIDQ4KTtcbn1cbi8qKlxuICogUGx1cmFsaXplIGEgUGFzY2FsQ2FzZSBtb2RlbCBuYW1lIGZvciBDUlVEIHBhZ2UgdGl0bGVzIC8gbmF2IGxhYmVscy5cbiAqIFNpbXBsZSBFbmdsaXNoIGhldXJpc3RpYyAoZG9jdW1lbnRlZCwgbm90IGV4aGF1c3RpdmUpOlxuICogICAtIGFscmVhZHktcGx1cmFsIC8gdW5jb3VudGFibGUgbmFtZXMgZW5kaW5nIGluIFwic1wiIChTYWxlcywgTmV3cykgXHUyMTkyIGFzLWlzXG4gKiAgIC0gZW5kcyBpbiBzLCB4LCB6LCBjaCwgc2ggXHUyMTkyIGFwcGVuZCBcImVzXCIgIChTdGF0dXMgXHUyMTkyIFN0YXR1c2VzLCBCb3ggXHUyMTkyIEJveGVzKVxuICogICAtIGVuZHMgaW4gY29uc29uYW50ICsgXCJ5XCIgXHUyMTkyIGRyb3AgXCJ5XCIsIGFwcGVuZCBcImllc1wiICAoQ2F0ZWdvcnkgXHUyMTkyIENhdGVnb3JpZXMpXG4gKiAgIC0gb3RoZXJ3aXNlIFx1MjE5MiBhcHBlbmQgXCJzXCIgIChSZXNlcnZhdGlvbiBcdTIxOTIgUmVzZXJ2YXRpb25zKVxuICovIGZ1bmN0aW9uIHBsdXJhbGl6ZU1vZGVsTmFtZShuYW1lKSB7XG4gICAgaWYgKC9zJC9pLnRlc3QobmFtZSkgJiYgIS8oc3N8dXMpJC9pLnRlc3QobmFtZSkpIHJldHVybiBuYW1lO1xuICAgIGlmICgvW3N4el0kL2kudGVzdChuYW1lKSB8fCAvKGNofHNoKSQvaS50ZXN0KG5hbWUpKSByZXR1cm4gYCR7bmFtZX1lc2A7XG4gICAgaWYgKC9bXmFlaW91XXkkL2kudGVzdChuYW1lKSkgcmV0dXJuIGAke25hbWUuc2xpY2UoMCwgLTEpfWllc2A7XG4gICAgcmV0dXJuIGAke25hbWV9c2A7XG59XG4vKipcbiAqIEJ1aWxkIERCIHJvd3MgZm9yIG9uZSBhcHAuIFRoZSBkeW5hbWljIHJvdXRlciBpcyBhIHNpbmdsZS1sZXZlbCBgL1tzbHVnXWBcbiAqIHJvdXRlLCBzbyBwYWdlIHNsdWdzIGFyZSBGTEFUIGFuZCBwcmVmaXhlZCB3aXRoIHBhY2tJZCArIGFwcElkIHRvIHN0YXlcbiAqIGdsb2JhbGx5IHVuaXF1ZSAoYGFwcF9wYWdlcy5zbHVnYCBpcyBhIGdsb2JhbCB1bmlxdWUgY29sdW1uKS4gTmF2IGNsdXN0ZXJzXG4gKiB0aGUgYXBwJ3MgcGFnZXMgdW5kZXIgb25lIHBhcmVudCBpdGVtOyBhIGxhbmRpbmcgcGFnZSAoc2x1ZyBgPHBhY2tJZD4tPGFwcElkPmApXG4gKiBpcyBhbHdheXMgbWF0ZXJpYWxpemVkIHNvIHRoZSBwYXJlbnQgbmF2IGl0ZW0gaGFzIGEgcmVhbCBkZXN0aW5hdGlvbi5cbiAqLyBleHBvcnQgZnVuY3Rpb24gY29tcGlsZUFwcFJvd3MoZGVmLCB0ZW5hbnRTbHVnLCBwYWNrSWQpIHtcbiAgICBjb25zdCByb290U2x1ZyA9IGAke3BhY2tJZH0tJHtkZWYuYXBwSWR9YDtcbiAgICBjb25zdCByb290ID0ge1xuICAgICAgICBpZDogYHBhZ2VfJHtwYWNrSWR9XyR7ZGVmLmFwcElkfWAsXG4gICAgICAgIHNsdWc6IHJvb3RTbHVnLFxuICAgICAgICB0aXRsZTogZGVmLmFwcE5hbWUsXG4gICAgICAgIGF1dGhUaWVyOiBkZWYucGFnZXNbMF0/LmF1dGhUaWVyID8/ICdwaW4nLFxuICAgICAgICBuYXZMYWJlbDogbnVsbCxcbiAgICAgICAgc2hvd0luTmF2OiBmYWxzZSxcbiAgICAgICAgdGVuYW50U2x1ZyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdoZXJvJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRlZi5hcHBOYW1lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcbiAgICBjb25zdCBhaVBhZ2VzID0gZGVmLnBhZ2VzLm1hcCgocCk9PntcbiAgICAgICAgY29uc3Qgc2VnID0gc2FuaXRpemVQYWdlU2x1ZyhwLnNsdWcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IGBwYWdlXyR7cGFja0lkfV8ke2RlZi5hcHBJZH1fJHtzZWd9YCxcbiAgICAgICAgICAgIHNsdWc6IGAke3BhY2tJZH0tJHtkZWYuYXBwSWR9LSR7c2VnfWAsXG4gICAgICAgICAgICB0aXRsZTogcC50aXRsZSxcbiAgICAgICAgICAgIGF1dGhUaWVyOiBwLmF1dGhUaWVyLFxuICAgICAgICAgICAgbmF2TGFiZWw6IHAubmF2TGFiZWwgPz8gbnVsbCxcbiAgICAgICAgICAgIHNob3dJbk5hdjogcC5uYXZMYWJlbCAhPSBudWxsLFxuICAgICAgICAgICAgdGVuYW50U2x1ZyxcbiAgICAgICAgICAgIHNlY3Rpb25zOiBwLmJsb2NrVHlwZXMubWFwKChidCk9Pih7XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogYnQsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgfTtcbiAgICB9KTtcbiAgICAvLyBEZXRlcm1pbmlzdGljIENSVUQgcGFnZXM6IG9uZSBwZXIgbW9kZWwsIGFwcGVuZGVkIGFmdGVyIEFJIHBhZ2VzIHNvIGV2ZXJ5XG4gICAgLy8gbW9kZWwgZ2V0cyBhIHJ1bnRpbWUgQ1JVRCBzdXJmYWNlIHJlZ2FyZGxlc3Mgb2YgQUkgcGFnZSBjaG9pY2VzLiBTbHVncyBhcmVcbiAgICAvLyBmbGF0IGFuZCBwYWNrSWQrYXBwSWQrdGFibGVOYW1lLXByZWZpeGVkIHRvIHN0YXkgZ2xvYmFsbHkgdW5pcXVlXG4gICAgLy8gKGFwcF9wYWdlcy5zbHVnIGlzIGEgZ2xvYmFsIHVuaXF1ZSBjb2x1bW4pLlxuICAgIGNvbnN0IG1vZGVsUGFnZXMgPSBkZWYubW9kZWxzLm1hcCgobW9kZWwpPT57XG4gICAgICAgIGNvbnN0IHRpdGxlID0gcGx1cmFsaXplTW9kZWxOYW1lKG1vZGVsLm5hbWUpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IGBwYWdlXyR7cGFja0lkfV8ke2RlZi5hcHBJZH1fbW9kZWxfJHttb2RlbC50YWJsZU5hbWV9YCxcbiAgICAgICAgICAgIHNsdWc6IGAke3BhY2tJZH0tJHtkZWYuYXBwSWR9LSR7bW9kZWwudGFibGVOYW1lfWAsXG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgICAgIG5hdkxhYmVsOiB0aXRsZSxcbiAgICAgICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgICAgIHRlbmFudFNsdWcsXG4gICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAncGFja190YWJsZScsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFibGU6IG1vZGVsLnRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBtb2RlbC5uYW1lXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgY29uc3QgcGFnZXMgPSBbXG4gICAgICAgIHJvb3QsXG4gICAgICAgIC4uLmFpUGFnZXMsXG4gICAgICAgIC4uLm1vZGVsUGFnZXNcbiAgICBdO1xuICAgIC8vIE5hdjogb25lIHBhcmVudCBpdGVtIGZvciB0aGUgYXBwIHNlY3Rpb24gKyBjaGlsZHJlbiBwZXIgbmF2IHBhZ2UuXG4gICAgY29uc3QgZ3JvdXBDb2RlID0gYGFwcF8ke2RlZi5hcHBJZH1gO1xuICAgIGNvbnN0IG5hdiA9IFtdO1xuICAgIG5hdi5wdXNoKHtcbiAgICAgICAgaWQ6IGBuYXZfJHtwYWNrSWR9XyR7ZGVmLmFwcElkfWAsXG4gICAgICAgIHRpdGxlOiBkZWYubmF2LmxhYmVsLFxuICAgICAgICBwYXRoOiBgLyR7cm9vdFNsdWd9YCxcbiAgICAgICAgaWNvbjogZGVmLm5hdi5pY29uID8/ICdBcHBzJyxcbiAgICAgICAgcmVxdWlyZWRHcm91cHM6IGdyb3VwQ29kZSxcbiAgICAgICAgaXNEeW5hbWljOiB0cnVlLFxuICAgICAgICBzb3J0T3JkZXI6IDAsXG4gICAgICAgIHRlbmFudFNsdWdcbiAgICB9KTtcbiAgICBkZWYubmF2LnBhZ2VzLmZvckVhY2goKHNsdWcsIGkpPT57XG4gICAgICAgIGNvbnN0IHNlZyA9IHNhbml0aXplUGFnZVNsdWcoc2x1Zyk7XG4gICAgICAgIGNvbnN0IHBhZ2UgPSBwYWdlcy5maW5kKChwKT0+cC5zbHVnID09PSBgJHtwYWNrSWR9LSR7ZGVmLmFwcElkfS0ke3NlZ31gKTtcbiAgICAgICAgbmF2LnB1c2goe1xuICAgICAgICAgICAgaWQ6IGBuYXZfJHtwYWNrSWR9XyR7ZGVmLmFwcElkfV8ke3NlZ31gLFxuICAgICAgICAgICAgdGl0bGU6IHBhZ2U/Lm5hdkxhYmVsID8/IHBhZ2U/LnRpdGxlID8/IHNlZyxcbiAgICAgICAgICAgIHBhdGg6IGAvJHtwYWNrSWR9LSR7ZGVmLmFwcElkfS0ke3NlZ31gLFxuICAgICAgICAgICAgaWNvbjogJycsXG4gICAgICAgICAgICByZXF1aXJlZEdyb3VwczogZ3JvdXBDb2RlLFxuICAgICAgICAgICAgaXNEeW5hbWljOiB0cnVlLFxuICAgICAgICAgICAgc29ydE9yZGVyOiBpICsgMSxcbiAgICAgICAgICAgIHRlbmFudFNsdWdcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgLy8gTW9kZWwgQ1JVRCBuYXYgY2hpbGRyZW4gXHUyMDE0IHNvcnQgb3JkZXIgY29udGludWVzIGFmdGVyIHRoZSBBSSBuYXYgcGFnZXMuXG4gICAgZGVmLm1vZGVscy5mb3JFYWNoKChtb2RlbCwgaSk9PntcbiAgICAgICAgY29uc3QgdGl0bGUgPSBwbHVyYWxpemVNb2RlbE5hbWUobW9kZWwubmFtZSk7XG4gICAgICAgIG5hdi5wdXNoKHtcbiAgICAgICAgICAgIGlkOiBgbmF2XyR7cGFja0lkfV8ke2RlZi5hcHBJZH1fbW9kZWxfJHttb2RlbC50YWJsZU5hbWV9YCxcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgcGF0aDogYC8ke3BhY2tJZH0tJHtkZWYuYXBwSWR9LSR7bW9kZWwudGFibGVOYW1lfWAsXG4gICAgICAgICAgICBpY29uOiAnJyxcbiAgICAgICAgICAgIHJlcXVpcmVkR3JvdXBzOiBncm91cENvZGUsXG4gICAgICAgICAgICBpc0R5bmFtaWM6IHRydWUsXG4gICAgICAgICAgICBzb3J0T3JkZXI6IGRlZi5uYXYucGFnZXMubGVuZ3RoICsgaSArIDEsXG4gICAgICAgICAgICB0ZW5hbnRTbHVnXG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIGNvbnN0IHNuaXBwZXRzID0gZGVmLmtub3dsZWRnZVNuaXBwZXRzLm1hcCgocyk9Pih7XG4gICAgICAgICAgICBpZDogYHNuaXBfJHtwYWNrSWR9XyR7ZGVmLmFwcElkfV8ke3Mua2V5LnJlcGxhY2UoL1teYS16MC05LV0vZywgJ18nKX1gLFxuICAgICAgICAgICAga2V5OiBgJHtwYWNrSWR9LSR7cy5rZXl9YCxcbiAgICAgICAgICAgIGNvbnRlbnQ6IHMuY29udGVudCxcbiAgICAgICAgICAgIGNhdGVnb3J5OiBgYXBwXyR7ZGVmLmFwcElkfWBcbiAgICAgICAgfSkpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHBhZ2VzLFxuICAgICAgICBuYXYsXG4gICAgICAgIHNuaXBwZXRzLFxuICAgICAgICB1eDoge1xuICAgICAgICAgICAgYXBwSWQ6IGRlZi5hcHBJZCxcbiAgICAgICAgICAgIGFwcE5hbWU6IGRlZi5hcHBOYW1lLFxuICAgICAgICAgICAgZGVwYXJ0bWVudDogZGVmLmRlcGFydG1lbnQsXG4gICAgICAgICAgICBzdGFnZXM6IGRlZi51eFdvcmtmbG93XG4gICAgICAgIH1cbiAgICB9O1xufVxuLyoqXG4gKiBCdWlsZCB0aGUgQ0VPIE92ZXJ2aWV3IG5hdiArIHNuaXBwZXQgcm93czogdGhlIENFTyBhcHAgZ2V0cyBpdHMgb3duIHNlY3Rpb25cbiAqIHBsdXMgYSBrbm93bGVkZ2UgY2F0ZWdvcnkgdGhhdCBhZ2dyZWdhdGVzIGV2ZXJ5IGRlcGFydG1lbnQgYXBwJ3Mgc25pcHBldHMgc29cbiAqIHRoZSBDRU8ga25vd2xlZGdlIGJhc2Ugc3BhbnMgdGhlIHdob2xlIHBhY2suXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVDZW9Sb3dzKGRlY29tcG9zaXRpb24sIGNlb0RlZiwgdGVuYW50U2x1ZywgcGFja0lkKSB7XG4gICAgY29uc3QgZ3JvdXBDb2RlID0gYGFwcF8ke2Nlb0RlZi5hcHBJZH1gO1xuICAgIGNvbnN0IG5hdiA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6IGBuYXZfJHtwYWNrSWR9XyR7Y2VvRGVmLmFwcElkfWAsXG4gICAgICAgICAgICB0aXRsZTogY2VvRGVmLm5hdi5sYWJlbCxcbiAgICAgICAgICAgIHBhdGg6IGAvJHtwYWNrSWR9LSR7Y2VvRGVmLmFwcElkfWAsXG4gICAgICAgICAgICBpY29uOiBjZW9EZWYubmF2Lmljb24gPz8gJ0luc2lnaHRzJyxcbiAgICAgICAgICAgIHJlcXVpcmVkR3JvdXBzOiBncm91cENvZGUsXG4gICAgICAgICAgICBpc0R5bmFtaWM6IHRydWUsXG4gICAgICAgICAgICBzb3J0T3JkZXI6IDEwMCxcbiAgICAgICAgICAgIHRlbmFudFNsdWdcbiAgICAgICAgfVxuICAgIF07XG4gICAgY29uc3Qgc25pcHBldHMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiBgc25pcF8ke3BhY2tJZH1fJHtjZW9EZWYuYXBwSWR9X292ZXJ2aWV3YCxcbiAgICAgICAgICAgIGtleTogYCR7cGFja0lkfS0ke2Nlb0RlZi5hcHBJZH0tb3ZlcnZpZXdgLFxuICAgICAgICAgICAgY29udGVudDogYCMgJHtjZW9EZWYuYXBwTmFtZX1cXG5cXG4ke2RlY29tcG9zaXRpb24uY2VvT3ZlcnZpZXcucHVycG9zZX1gICsgYFxcblxcbkNyb3NzLWRlcGFydG1lbnQgS1BJczogJHtkZWNvbXBvc2l0aW9uLmNlb092ZXJ2aWV3LmtwaXMuam9pbignLCAnKX0uYCxcbiAgICAgICAgICAgIGNhdGVnb3J5OiBgYXBwXyR7Y2VvRGVmLmFwcElkfWBcbiAgICAgICAgfSxcbiAgICAgICAgLi4uZGVjb21wb3NpdGlvbi5hcHBzLmZpbHRlcigoYSk9PmEuaWQgIT09IGNlb0RlZi5hcHBJZCkubWFwKChhKT0+KHtcbiAgICAgICAgICAgICAgICBpZDogYHNuaXBfJHtwYWNrSWR9XyR7Y2VvRGVmLmFwcElkfV94cmVmXyR7YS5pZH1gLFxuICAgICAgICAgICAgICAgIGtleTogYCR7cGFja0lkfS0ke2Nlb0RlZi5hcHBJZH0teHJlZi0ke2EuaWR9YCxcbiAgICAgICAgICAgICAgICBjb250ZW50OiBgIyAke2EubmFtZX0gKCR7YS5kZXBhcnRtZW50fSlcXG5cXG4ke2Euc3VtbWFyeX1cXG5cXG5UaGlzIGRlcGFydG1lbnQgYXBwIGZlZWRzIHRoZSBDRU8gT3ZlcnZpZXcuIGAgKyBgUmVmZXIgdG8gaXRzIGtub3dsZWRnZSBjYXRlZ29yeSBcImFwcF8ke2EuaWR9XCIgZm9yIG9wZXJhdGluZyBkZXRhaWxzLmAsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGBhcHBfJHtjZW9EZWYuYXBwSWR9YFxuICAgICAgICAgICAgfSkpXG4gICAgXTtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYXYsXG4gICAgICAgIHNuaXBwZXRzLFxuICAgICAgICB1eDoge1xuICAgICAgICAgICAgYXBwSWQ6IGNlb0RlZi5hcHBJZCxcbiAgICAgICAgICAgIGFwcE5hbWU6IGNlb0RlZi5hcHBOYW1lLFxuICAgICAgICAgICAgZGVwYXJ0bWVudDogY2VvRGVmLmRlcGFydG1lbnQsXG4gICAgICAgICAgICBzdGFnZXM6IGNlb0RlZi51eFdvcmtmbG93XG4gICAgICAgIH1cbiAgICB9O1xufVxuIiwgIi8qKlxuICogQXBwIFBhY2sgXHUyMDE0IE1hdGVyaWFsaXplclxuICpcbiAqIFBlcnNpc3RzIGEgY29tcGlsZWQgYXBwIHBhY2sgaW50byB0aGUgdGVuYW50IERCIHZpYSByYXcgcGcgKHdvcmtmbG93IHN0ZXBzXG4gKiB1c2Ugc2hvcnQtbGl2ZWQgY29ubmVjdGlvbnMsIHNhbWUgYXMgd29ya2Jvb2staW5nZXN0KS4gQWxsIHdyaXRlcyBhcmVcbiAqIGlkZW1wb3RlbnQ6IHJvd3MgYXJlIHNjb3BlZCBieSBwYWNrSWQgcHJlZml4IGFuZCByZXBsYWNlZCBvbiByZS1ydW4uXG4gKlxuICogREIgY29uc3RyYWludHMgKGZyb20gemVuc3RhY2svc2NoZW1hLnptb2RlbCk6XG4gKiAgIC0gYXBwX3BhZ2VzLnNsdWcgaXMgVU5JUVVFIChnbG9iYWwpIFx1MjE5MiBmbGF0IHBhY2tJZC1wcmVmaXhlZCBzbHVnc1xuICogICAtIHBhZ2Vfc2VjdGlvbnMuYmxvY2tfdHlwZSBpcyBhIEJsb2NrVHlwZSBFTlVNIFx1MjE5MiBjYXN0IHJlcXVpcmVkXG4gKiAgIC0ga25vd2xlZGdlX3NuaXBwZXRzLmtleSBpcyBVTklRVUUgXHUyMTkyIHBhY2tJZC1wcmVmaXhlZCBrZXlzXG4gKiAgIC0gc2VjdXJpdHlfZ3JvdXBzLmNvZGUgaXMgVU5JUVVFIFx1MjE5MiB1cHNlcnQsIG5ldmVyIGRlbGV0ZSAocmVmZXJlbmNlZClcbiAqLyBpbXBvcnQgeyBjb21waWxlQXBwUm93cywgY29tcGlsZUNlb1Jvd3MgfSBmcm9tICcuL2FwcC1wYWNrLWNvbXBpbGVyJztcbi8vIFx1MjUwMFx1MjUwMCBJZGVtcG90ZW50IERETCBcdTIwMTQgZW5zdXJlcyB0aGUgdGFyZ2V0IERCIGhhcyB0aGUgdGFibGVzIHRoZSBtYXRlcmlhbGl6ZXJcbi8vIHdyaXRlcyB0by4gVGVuYW50IGRhdGFiYXNlcyAocGVyLXRlbmFudCBOZW9uIGJyYW5jaGVzKSBhcmUgcHJvdmlzaW9uZWQgZW1wdHlcbi8vIGFuZCBtYXkgbm90IGhhdmUgcnVuIHRoZSBaZW5TdGFjayBtaWdyYXRpb25zIG9yIHRoZSByb290IHNlZWQtcnVubmVyIERETCwgc29cbi8vIHRoZSBtYXRlcmlhbGl6ZXIgZ3VhcmFudGVlcyBpdHMgb3duIHNjaGVtYSBpbnN0ZWFkIG9mIGFzc3VtaW5nIGl0IGV4aXN0cy5cbi8vIENvbHVtbiBzaGFwZXMgbWlycm9yIHplbnN0YWNrL3NjaGVtYS56bW9kZWwgKyB0aGUgc2hhcmVkIHNlZWQgRERMLlxuY29uc3QgQVBQX1BBQ0tfRU5VTV9EREwgPSBbXG4gICAgYERPICQkIEJFR0lOIENSRUFURSBUWVBFIFwiQXV0aFRpZXJcIiBBUyBFTlVNICgncHVibGljJywgJ3BpbicsICdnb29nbGUnKTsgRVhDRVBUSU9OIFdIRU4gZHVwbGljYXRlX29iamVjdCBUSEVOIE5VTEw7IEVORCAkJGAsXG4gICAgYERPICQkIEJFR0lOIENSRUFURSBUWVBFIFwiQmxvY2tUeXBlXCIgQVMgRU5VTSAoJ2hlcm8nLCAnbWV0cmljX2dyaWQnLCAnY2hhcnRfZmluYW5jaWFsJywgJ2xldmVyX2FjY29yZGlvbicsICdhY3Rpb25fY2hlY2tsaXN0JywgJ2RvY19tYXJrZG93bicsICdwbmxfdGFibGUnLCAnel9yZXBvcnRfZm9ybScsICdjb3N0c19mb3JtJywgJ2NhbGVuZGFyX2ltcG9ydCcsICdjaGF0X3BhbmVsJywgJ2twaV9jYXJkcycsICdvcHNfYWRtaW5fdGFicycsICdyZXZpZXdfYmxvY2tzJywgJ3JlcG9ydHNfcm9sbHVwJywgJ3NoZWV0X3ZpZXdlcicpOyBFWENFUFRJT04gV0hFTiBkdXBsaWNhdGVfb2JqZWN0IFRIRU4gTlVMTDsgRU5EICQkYCxcbiAgICAvLyBOZXdlciBibG9jayB0eXBlcyBtYXkgYmUgbWlzc2luZyBmcm9tIHByZS1leGlzdGluZyBlbnVtcy5cbiAgICBgQUxURVIgVFlQRSBcIkJsb2NrVHlwZVwiIEFERCBWQUxVRSBJRiBOT1QgRVhJU1RTICdvcHNfYWRtaW5fdGFicydgLFxuICAgIGBBTFRFUiBUWVBFIFwiQmxvY2tUeXBlXCIgQUREIFZBTFVFIElGIE5PVCBFWElTVFMgJ3Jldmlld19ibG9ja3MnYCxcbiAgICBgQUxURVIgVFlQRSBcIkJsb2NrVHlwZVwiIEFERCBWQUxVRSBJRiBOT1QgRVhJU1RTICdyZXBvcnRzX3JvbGx1cCdgLFxuICAgIGBBTFRFUiBUWVBFIFwiQmxvY2tUeXBlXCIgQUREIFZBTFVFIElGIE5PVCBFWElTVFMgJ3NoZWV0X3ZpZXdlcidgLFxuICAgIGBBTFRFUiBUWVBFIFwiQmxvY2tUeXBlXCIgQUREIFZBTFVFIElGIE5PVCBFWElTVFMgJ3BhY2tfdGFibGUnYFxuXTtcbmNvbnN0IEFQUF9QQUNLX1RBQkxFX0RETCA9IFtcbiAgICBgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgc2VjdXJpdHlfZ3JvdXBzIChcbiAgICBpZCBURVhUIFBSSU1BUlkgS0VZIERFRkFVTFQgZ2VuX3JhbmRvbV91dWlkKCksXG4gICAgY29kZSBURVhUIE5PVCBOVUxMIFVOSVFVRSxcbiAgICBuYW1lIFRFWFQgTk9UIE5VTEwsXG4gICAgZGVzY3JpcHRpb24gVEVYVCxcbiAgICBpc19zeXN0ZW0gQk9PTEVBTiBOT1QgTlVMTCBERUZBVUxUIGZhbHNlLFxuICAgIHBlcm1pc3Npb25zIFRFWFRbXSBOT1QgTlVMTCBERUZBVUxUICd7fScsXG4gICAgY3JlYXRlZF9hdCBUSU1FU1RBTVAgV0lUSE9VVCBUSU1FIFpPTkUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUFxuICApYCxcbiAgICBgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgYXBwX3BhZ2VzIChcbiAgICBpZCBURVhUIFBSSU1BUlkgS0VZLFxuICAgIHNsdWcgVEVYVCBOT1QgTlVMTCBVTklRVUUsXG4gICAgdGl0bGUgVEVYVCBOT1QgTlVMTCxcbiAgICBhdXRoX3RpZXIgXCJBdXRoVGllclwiIE5PVCBOVUxMIERFRkFVTFQgJ3B1YmxpYycsXG4gICAgc29ydF9vcmRlciBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMCxcbiAgICBuYXZfbGFiZWwgVEVYVCxcbiAgICBzaG93X2luX25hdiBCT09MRUFOIE5PVCBOVUxMIERFRkFVTFQgdHJ1ZSxcbiAgICB0ZW5hbnRfc2x1ZyBURVhUXG4gIClgLFxuICAgIGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBwYWdlX3NlY3Rpb25zIChcbiAgICBpZCBURVhUIFBSSU1BUlkgS0VZLFxuICAgIHBhZ2VfaWQgVEVYVCBOT1QgTlVMTCBSRUZFUkVOQ0VTIGFwcF9wYWdlcyhpZCkgT04gREVMRVRFIENBU0NBREUsXG4gICAgc29ydF9vcmRlciBJTlRFR0VSIE5PVCBOVUxMLFxuICAgIGJsb2NrX3R5cGUgXCJCbG9ja1R5cGVcIiBOT1QgTlVMTCxcbiAgICBjb25maWcgSlNPTkIgTk9UIE5VTEwgREVGQVVMVCAne30nXG4gIClgLFxuICAgIGBDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBwYWdlX3NlY3Rpb25zX3BhZ2VfaWRfc29ydF9vcmRlcl9pZHggT04gcGFnZV9zZWN0aW9ucyhwYWdlX2lkLCBzb3J0X29yZGVyKWAsXG4gICAgYENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIG5hdmlnYXRpb25faXRlbXMgKFxuICAgIGlkIFRFWFQgUFJJTUFSWSBLRVksXG4gICAgcGFyZW50X2lkIFRFWFQgUkVGRVJFTkNFUyBuYXZpZ2F0aW9uX2l0ZW1zKGlkKSBPTiBERUxFVEUgU0VUIE5VTEwsXG4gICAgc29ydF9vcmRlciBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMCxcbiAgICB0aXRsZSBURVhUIE5PVCBOVUxMLFxuICAgIHBhdGggVEVYVCBOT1QgTlVMTCBERUZBVUxUICcnLFxuICAgIGljb24gVEVYVCBOT1QgTlVMTCBERUZBVUxUICcnLFxuICAgIGF1dGhfdGllciBURVhUIE5PVCBOVUxMIERFRkFVTFQgJ3B1YmxpYycsXG4gICAgdGVuYW50X3NsdWcgVEVYVCxcbiAgICBpc19hY3RpdmUgQk9PTEVBTiBOT1QgTlVMTCBERUZBVUxUIHRydWUsXG4gICAgcmVxdWlyZWRfZ3JvdXBzIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAnJyxcbiAgICBpc192aXNpYmxlIEJPT0xFQU4gTk9UIE5VTEwgREVGQVVMVCB0cnVlLFxuICAgIGlzX2R5bmFtaWMgQk9PTEVBTiBOT1QgTlVMTCBERUZBVUxUIGZhbHNlLFxuICAgIGlzX2RlZmF1bHQgQk9PTEVBTiBOT1QgTlVMTCBERUZBVUxUIGZhbHNlLFxuICAgIGNyZWF0ZWRfYXQgVElNRVNUQU1QIE5PVCBOVUxMIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgdXBkYXRlZF9hdCBUSU1FU1RBTVAgTk9UIE5VTEwgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUFxuICApYCxcbiAgICBgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMga25vd2xlZGdlX3NuaXBwZXRzIChcbiAgICBpZCBURVhUIFBSSU1BUlkgS0VZLFxuICAgIGtleSBURVhUIE5PVCBOVUxMIFVOSVFVRSxcbiAgICBjb250ZW50IFRFWFQgTk9UIE5VTEwsXG4gICAgY2F0ZWdvcnkgVEVYVCBOT1QgTlVMTFxuICApYFxuXTtcbi8qKiBDb2x1bW4gYmFja2ZpbGxzIGZvciBEQnMgd2hlcmUgdGhlIHRhYmxlcyBwcmUtZGF0ZSB0aGVzZSBjb2x1bW5zLiAqLyBjb25zdCBBUFBfUEFDS19UQUJMRV9BTFRFUlMgPSBbXG4gICAgYEFMVEVSIFRBQkxFIGFwcF9wYWdlcyBBREQgQ09MVU1OIElGIE5PVCBFWElTVFMgbmF2X2xhYmVsIFRFWFRgLFxuICAgIGBBTFRFUiBUQUJMRSBhcHBfcGFnZXMgQUREIENPTFVNTiBJRiBOT1QgRVhJU1RTIHNob3dfaW5fbmF2IEJPT0xFQU4gTk9UIE5VTEwgREVGQVVMVCB0cnVlYCxcbiAgICBgQUxURVIgVEFCTEUgYXBwX3BhZ2VzIEFERCBDT0xVTU4gSUYgTk9UIEVYSVNUUyB0ZW5hbnRfc2x1ZyBURVhUYCxcbiAgICBgQUxURVIgVEFCTEUgbmF2aWdhdGlvbl9pdGVtcyBBREQgQ09MVU1OIElGIE5PVCBFWElTVFMgdGVuYW50X3NsdWcgVEVYVGAsXG4gICAgYEFMVEVSIFRBQkxFIG5hdmlnYXRpb25faXRlbXMgQUREIENPTFVNTiBJRiBOT1QgRVhJU1RTIGlzX2FjdGl2ZSBCT09MRUFOIE5PVCBOVUxMIERFRkFVTFQgdHJ1ZWAsXG4gICAgYEFMVEVSIFRBQkxFIG5hdmlnYXRpb25faXRlbXMgQUREIENPTFVNTiBJRiBOT1QgRVhJU1RTIGlzX2R5bmFtaWMgQk9PTEVBTiBOT1QgTlVMTCBERUZBVUxUIGZhbHNlYCxcbiAgICBgQUxURVIgVEFCTEUgbmF2aWdhdGlvbl9pdGVtcyBBREQgQ09MVU1OIElGIE5PVCBFWElTVFMgaXNfZGVmYXVsdCBCT09MRUFOIE5PVCBOVUxMIERFRkFVTFQgZmFsc2VgXG5dO1xuLyoqIFJ1biBiZWZvcmUgbWF0ZXJpYWxpemF0aW9uIHNvIHdyaXRlcyBuZXZlciBoaXQgbWlzc2luZyB0YWJsZXMvY29sdW1ucy4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuc3VyZUFwcFBhY2tUYWJsZXMoY2xpZW50KSB7XG4gICAgZm9yIChjb25zdCBzdG10IG9mIEFQUF9QQUNLX0VOVU1fRERMKXtcbiAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KHN0bXQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHN0bXQgb2YgQVBQX1BBQ0tfVEFCTEVfRERMKXtcbiAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KHN0bXQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHN0bXQgb2YgQVBQX1BBQ0tfVEFCTEVfQUxURVJTKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShzdG10KTtcbiAgICAgICAgfSBjYXRjaCAge1xuICAgICAgICAvLyBDb2x1bW4gbWF5IGFscmVhZHkgZXhpc3Qgb3IgdGhlIHRhYmxlIG1heSBiZSBtaXNzaW5nIFx1MjAxNCBpZ25vcmUuXG4gICAgICAgIH1cbiAgICB9XG59XG4vKiogVXBzZXJ0IHRoZSBwZXItYXBwIHNlY3VyaXR5IGdyb3VwIChjb2RlID0gYXBwXzxhcHBJZD4pLiBOZXZlciBkZWxldGVzLiAqLyBhc3luYyBmdW5jdGlvbiB1cHNlcnRTZWN1cml0eUdyb3VwcyhjbGllbnQsIGFwcHMpIHtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGZvciAoY29uc3QgYXBwIG9mIGFwcHMpe1xuICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIHNlY3VyaXR5X2dyb3VwcyAoaWQsIGNvZGUsIG5hbWUsIGRlc2NyaXB0aW9uLCBpc19zeXN0ZW0sIHBlcm1pc3Npb25zLCBjcmVhdGVkX2F0KVxuICAgICAgIFZBTFVFUyAoJDEsICQyLCAkMywgJDQsIGZhbHNlLCBBUlJBWVtdOjp0ZXh0W10sIE5PVygpKVxuICAgICAgIE9OIENPTkZMSUNUIChjb2RlKSBETyBVUERBVEUgU0VUIG5hbWUgPSBFWENMVURFRC5uYW1lLCBkZXNjcmlwdGlvbiA9IEVYQ0xVREVELmRlc2NyaXB0aW9uO2AsIFtcbiAgICAgICAgICAgIGBzZ18ke2FwcC5hcHBJZH1gLFxuICAgICAgICAgICAgYXBwLnNlY3VyaXR5R3JvdXBDb2RlLFxuICAgICAgICAgICAgYXBwLnNlY3VyaXR5R3JvdXBOYW1lLFxuICAgICAgICAgICAgYE1lbWJlcnMgY2FuIGFjY2VzcyB0aGUgJHthcHAuYXBwTmFtZX0gYXBwLmBcbiAgICAgICAgXSk7XG4gICAgICAgIGNvdW50Kys7XG4gICAgfVxuICAgIHJldHVybiBjb3VudDtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYXRlcmlhbGl6ZUFwcFBhY2soY2xpZW50LCBpbnB1dCkge1xuICAgIGNvbnN0IHsgcGFja0lkLCB0ZW5hbnRTbHVnLCBkZWNvbXBvc2l0aW9uLCBhcHBzLCBkZWZpbml0aW9ucyB9ID0gaW5wdXQ7XG4gICAgY29uc3QgY291bnRzID0ge1xuICAgICAgICBhcHBzOiAwLFxuICAgICAgICBwYWdlczogMCxcbiAgICAgICAgc2VjdGlvbnM6IDAsXG4gICAgICAgIG5hdjogMCxcbiAgICAgICAgc25pcHBldHM6IDAsXG4gICAgICAgIGdyb3VwczogMFxuICAgIH07XG4gICAgLy8gR3VhcmFudGVlIHRoZSB0YXJnZXQgdGFibGVzIGV4aXN0ICh0ZW5hbnQgREJzIG1heSBiZSBwcm92aXNpb25lZCBlbXB0eSkuXG4gICAgYXdhaXQgZW5zdXJlQXBwUGFja1RhYmxlcyhjbGllbnQpO1xuICAgIC8vIDEuIFNlY3VyaXR5IGdyb3VwcyBmb3IgZXZlcnkgYXBwLlxuICAgIGNvdW50cy5ncm91cHMgPSBhd2FpdCB1cHNlcnRTZWN1cml0eUdyb3VwcyhjbGllbnQsIGFwcHMpO1xuICAgIC8vIDIuIFBhZ2VzICsgc2VjdGlvbnMgXHUyMDE0IHNjb3BlZCByZXBsYWNlIChwYWNrIHBhZ2VzIG9ubHkpLlxuICAgIGNvbnN0IHBhZ2VTbHVnUHJlZml4ID0gYCR7cGFja0lkfS0lYDtcbiAgICBhd2FpdCBjbGllbnQucXVlcnkoYERFTEVURSBGUk9NIGFwcF9wYWdlcyBXSEVSRSBzbHVnIExJS0UgJDEgQU5EIHRlbmFudF9zbHVnID0gJDI7YCwgW1xuICAgICAgICBwYWdlU2x1Z1ByZWZpeCxcbiAgICAgICAgdGVuYW50U2x1Z1xuICAgIF0pO1xuICAgIC8vIE5hdiBcdTIwMTQgc2NvcGVkIHJlcGxhY2UgKHBhY2sgbmF2IGl0ZW1zIG9ubHkpLiBOYXYgaWRzIGFyZSBkZXRlcm1pbmlzdGljXG4gICAgLy8gKG5hdl88cGFja0lkPl88YXBwSWQ+W188c2VnPl0pIGFuZCB0aGUgUEssIHNvIGEgcmUtcnVuIG9mIHRoZSBzYW1lIHBhY2tJZFxuICAgIC8vIHdvdWxkIG90aGVyd2lzZSBmYWlsIHdpdGggYSBkdXBsaWNhdGUta2V5IHZpb2xhdGlvbi5cbiAgICBhd2FpdCBjbGllbnQucXVlcnkoYERFTEVURSBGUk9NIG5hdmlnYXRpb25faXRlbXMgV0hFUkUgaWQgTElLRSAkMSBBTkQgdGVuYW50X3NsdWcgPSAkMjtgLCBbXG4gICAgICAgIGBuYXZfJHtwYWNrSWR9XyVgLFxuICAgICAgICB0ZW5hbnRTbHVnXG4gICAgXSk7XG4gICAgY29uc3QgZGVmcyA9IFtcbiAgICAgICAgLi4uZGVmaW5pdGlvbnNcbiAgICBdO1xuICAgIC8vIENFTyBPdmVydmlldyBkZWYgaXMgbGFzdCBpbiBkZWNvbXBvc2l0aW9uLmFwcHMgb3JkZXIgKGd1YXJhbnRlZWQgYnkgZ2VuZXJhdG9yKS5cbiAgICBjb25zdCBjZW9EZWYgPSBkZWZzW2RlZnMubGVuZ3RoIC0gMV07XG4gICAgY29uc3QgZGVwdERlZnMgPSBkZWZzLnNsaWNlKDAsIC0xKTtcbiAgICBmb3IgKGNvbnN0IGRlZiBvZiBkZXB0RGVmcyl7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBjb21waWxlQXBwUm93cyhkZWYsIHRlbmFudFNsdWcsIHBhY2tJZCk7XG4gICAgICAgIGZvciAoY29uc3QgcGFnZSBvZiByb3dzLnBhZ2VzKXtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8gYXBwX3BhZ2VzIChpZCwgc2x1ZywgdGl0bGUsIGF1dGhfdGllciwgc29ydF9vcmRlciwgbmF2X2xhYmVsLCBzaG93X2luX25hdiwgdGVuYW50X3NsdWcpXG4gICAgICAgICBWQUxVRVMgKCQxLCAkMiwgJDMsIENBU1QoJDQgQVMgXCJBdXRoVGllclwiKSwgJDUsICQ2LCAkNywgJDgpO2AsIFtcbiAgICAgICAgICAgICAgICBwYWdlLmlkLFxuICAgICAgICAgICAgICAgIHBhZ2Uuc2x1ZyxcbiAgICAgICAgICAgICAgICBwYWdlLnRpdGxlLFxuICAgICAgICAgICAgICAgIHBhZ2UuYXV0aFRpZXIsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBwYWdlLm5hdkxhYmVsLFxuICAgICAgICAgICAgICAgIHBhZ2Uuc2hvd0luTmF2LFxuICAgICAgICAgICAgICAgIHRlbmFudFNsdWdcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY291bnRzLnBhZ2VzKys7XG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgcGFnZS5zZWN0aW9ucy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBwYWdlX3NlY3Rpb25zIChpZCwgcGFnZV9pZCwgc29ydF9vcmRlciwgYmxvY2tfdHlwZSwgY29uZmlnKVxuICAgICAgICAgICBWQUxVRVMgKCQxLCAkMiwgJDMsIENBU1QoJDQgQVMgXCJCbG9ja1R5cGVcIiksIENBU1QoJDUgQVMganNvbmIpKTtgLCBbXG4gICAgICAgICAgICAgICAgICAgIGAke3BhZ2UuaWR9OnNlY3Rpb246JHtpfWAsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2UuaWQsXG4gICAgICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgICAgIHBhZ2Uuc2VjdGlvbnNbaV0uYmxvY2tUeXBlLFxuICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShwYWdlLnNlY3Rpb25zW2ldLmNvbmZpZylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICBjb3VudHMuc2VjdGlvbnMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBOYXYgZm9yIHRoaXMgYXBwLlxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2Ygcm93cy5uYXYpe1xuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBuYXZpZ2F0aW9uX2l0ZW1zIChpZCwgcGFyZW50X2lkLCBzb3J0X29yZGVyLCB0aXRsZSwgcGF0aCwgaWNvbiwgYXV0aF90aWVyLCB0ZW5hbnRfc2x1ZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZSwgcmVxdWlyZWRfZ3JvdXBzLCBpc192aXNpYmxlLCBpc19keW5hbWljLCBpc19kZWZhdWx0LCBjcmVhdGVkX2F0LCB1cGRhdGVkX2F0KVxuICAgICAgICAgVkFMVUVTICgkMSwgTlVMTCwgJDIsICQzLCAkNCwgJDUsIENBU1QoJ3BpbicgQVMgXCJBdXRoVGllclwiKSwgJDYsIHRydWUsICQ3LCB0cnVlLCAkOCwgZmFsc2UsIE5PVygpLCBOT1coKSk7YCwgW1xuICAgICAgICAgICAgICAgIGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgaXRlbS5zb3J0T3JkZXIsXG4gICAgICAgICAgICAgICAgaXRlbS50aXRsZSxcbiAgICAgICAgICAgICAgICBpdGVtLnBhdGgsXG4gICAgICAgICAgICAgICAgaXRlbS5pY29uLFxuICAgICAgICAgICAgICAgIHRlbmFudFNsdWcsXG4gICAgICAgICAgICAgICAgaXRlbS5yZXF1aXJlZEdyb3VwcyxcbiAgICAgICAgICAgICAgICBpdGVtLmlzRHluYW1pY1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudHMubmF2Kys7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU25pcHBldHMgZm9yIHRoaXMgYXBwLlxuICAgICAgICBmb3IgKGNvbnN0IHNuaXAgb2Ygcm93cy5zbmlwcGV0cyl7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY29udGVudCwgY2F0ZWdvcnkpIFZBTFVFUyAoJDEsICQyLCAkMywgJDQpXG4gICAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50LCBjYXRlZ29yeSA9IEVYQ0xVREVELmNhdGVnb3J5O2AsIFtcbiAgICAgICAgICAgICAgICBzbmlwLmlkLFxuICAgICAgICAgICAgICAgIHNuaXAua2V5LFxuICAgICAgICAgICAgICAgIHNuaXAuY29udGVudCxcbiAgICAgICAgICAgICAgICBzbmlwLmNhdGVnb3J5XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvdW50cy5zbmlwcGV0cysrO1xuICAgICAgICB9XG4gICAgICAgIGNvdW50cy5hcHBzKys7XG4gICAgfVxuICAgIC8vIDMuIENFTyBPdmVydmlldyAobGFzdCBhcHApOiBwYWdlcyArIG5hdiArIGNyb3NzLWRlcGFydG1lbnQgc25pcHBldHMuXG4gICAgY29uc3QgY2VvUm93cyA9IGNvbXBpbGVDZW9Sb3dzKGRlY29tcG9zaXRpb24sIGNlb0RlZiwgdGVuYW50U2x1ZywgcGFja0lkKTtcbiAgICBjb25zdCByb290U2x1ZyA9IGAke3BhY2tJZH0tJHtjZW9EZWYuYXBwSWR9YDtcbiAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIGFwcF9wYWdlcyAoaWQsIHNsdWcsIHRpdGxlLCBhdXRoX3RpZXIsIHNvcnRfb3JkZXIsIG5hdl9sYWJlbCwgc2hvd19pbl9uYXYsIHRlbmFudF9zbHVnKVxuICAgICBWQUxVRVMgKCQxLCAkMiwgJDMsIENBU1QoJDQgQVMgXCJBdXRoVGllclwiKSwgJDUsICQ2LCAkNywgJDgpO2AsIFtcbiAgICAgICAgYHBhZ2VfJHtwYWNrSWR9XyR7Y2VvRGVmLmFwcElkfWAsXG4gICAgICAgIHJvb3RTbHVnLFxuICAgICAgICBjZW9EZWYuYXBwTmFtZSxcbiAgICAgICAgJ3BpbicsXG4gICAgICAgIDAsXG4gICAgICAgIG51bGwsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICB0ZW5hbnRTbHVnXG4gICAgXSk7XG4gICAgY291bnRzLnBhZ2VzKys7XG4gICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBwYWdlX3NlY3Rpb25zIChpZCwgcGFnZV9pZCwgc29ydF9vcmRlciwgYmxvY2tfdHlwZSwgY29uZmlnKVxuICAgICBWQUxVRVMgKCQxLCAkMiwgJDMsIENBU1QoJDQgQVMgXCJCbG9ja1R5cGVcIiksIENBU1QoJDUgQVMganNvbmIpKTtgLCBbXG4gICAgICAgIGBwYWdlXyR7cGFja0lkfV8ke2Nlb0RlZi5hcHBJZH06c2VjdGlvbjowYCxcbiAgICAgICAgYHBhZ2VfJHtwYWNrSWR9XyR7Y2VvRGVmLmFwcElkfWAsXG4gICAgICAgIDAsXG4gICAgICAgICdoZXJvJyxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgdGl0bGU6IGNlb0RlZi5hcHBOYW1lXG4gICAgICAgIH0pXG4gICAgXSk7XG4gICAgY291bnRzLnNlY3Rpb25zKys7XG4gICAgZm9yIChjb25zdCBkZWYgb2YgW1xuICAgICAgICBjZW9EZWZcbiAgICBdKXtcbiAgICAgICAgY29uc3Qgcm93cyA9IGNvbXBpbGVBcHBSb3dzKGRlZiwgdGVuYW50U2x1ZywgcGFja0lkKTtcbiAgICAgICAgZm9yIChjb25zdCBwYWdlIG9mIHJvd3MucGFnZXMuc2xpY2UoMSkpe1xuICAgICAgICAgICAgLy8gQ0VPIHBhZ2VzIGJleW9uZCB0aGUgcm9vdC5cbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8gYXBwX3BhZ2VzIChpZCwgc2x1ZywgdGl0bGUsIGF1dGhfdGllciwgc29ydF9vcmRlciwgbmF2X2xhYmVsLCBzaG93X2luX25hdiwgdGVuYW50X3NsdWcpXG4gICAgICAgICBWQUxVRVMgKCQxLCAkMiwgJDMsIENBU1QoJDQgQVMgXCJBdXRoVGllclwiKSwgJDUsICQ2LCAkNywgJDgpO2AsIFtcbiAgICAgICAgICAgICAgICBwYWdlLmlkLFxuICAgICAgICAgICAgICAgIHBhZ2Uuc2x1ZyxcbiAgICAgICAgICAgICAgICBwYWdlLnRpdGxlLFxuICAgICAgICAgICAgICAgIHBhZ2UuYXV0aFRpZXIsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBwYWdlLm5hdkxhYmVsLFxuICAgICAgICAgICAgICAgIHBhZ2Uuc2hvd0luTmF2LFxuICAgICAgICAgICAgICAgIHRlbmFudFNsdWdcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY291bnRzLnBhZ2VzKys7XG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgcGFnZS5zZWN0aW9ucy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBwYWdlX3NlY3Rpb25zIChpZCwgcGFnZV9pZCwgc29ydF9vcmRlciwgYmxvY2tfdHlwZSwgY29uZmlnKVxuICAgICAgICAgICBWQUxVRVMgKCQxLCAkMiwgJDMsIENBU1QoJDQgQVMgXCJCbG9ja1R5cGVcIiksIENBU1QoJDUgQVMganNvbmIpKTtgLCBbXG4gICAgICAgICAgICAgICAgICAgIGAke3BhZ2UuaWR9OnNlY3Rpb246JHtpfWAsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2UuaWQsXG4gICAgICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgICAgIHBhZ2Uuc2VjdGlvbnNbaV0uYmxvY2tUeXBlLFxuICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShwYWdlLnNlY3Rpb25zW2ldLmNvbmZpZylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICBjb3VudHMuc2VjdGlvbnMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2Ygcm93cy5uYXYpe1xuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBuYXZpZ2F0aW9uX2l0ZW1zIChpZCwgcGFyZW50X2lkLCBzb3J0X29yZGVyLCB0aXRsZSwgcGF0aCwgaWNvbiwgYXV0aF90aWVyLCB0ZW5hbnRfc2x1ZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZSwgcmVxdWlyZWRfZ3JvdXBzLCBpc192aXNpYmxlLCBpc19keW5hbWljLCBpc19kZWZhdWx0LCBjcmVhdGVkX2F0LCB1cGRhdGVkX2F0KVxuICAgICAgICAgVkFMVUVTICgkMSwgTlVMTCwgJDIsICQzLCAkNCwgJDUsIENBU1QoJ3BpbicgQVMgXCJBdXRoVGllclwiKSwgJDYsIHRydWUsICQ3LCB0cnVlLCAkOCwgZmFsc2UsIE5PVygpLCBOT1coKSk7YCwgW1xuICAgICAgICAgICAgICAgIGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgaXRlbS5zb3J0T3JkZXIsXG4gICAgICAgICAgICAgICAgaXRlbS50aXRsZSxcbiAgICAgICAgICAgICAgICBpdGVtLnBhdGgsXG4gICAgICAgICAgICAgICAgaXRlbS5pY29uLFxuICAgICAgICAgICAgICAgIHRlbmFudFNsdWcsXG4gICAgICAgICAgICAgICAgaXRlbS5yZXF1aXJlZEdyb3VwcyxcbiAgICAgICAgICAgICAgICBpdGVtLmlzRHluYW1pY1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudHMubmF2Kys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBzbmlwIG9mIGNlb1Jvd3Muc25pcHBldHMpe1xuICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY29udGVudCwgY2F0ZWdvcnkpIFZBTFVFUyAoJDEsICQyLCAkMywgJDQpXG4gICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudCwgY2F0ZWdvcnkgPSBFWENMVURFRC5jYXRlZ29yeTtgLCBbXG4gICAgICAgICAgICBzbmlwLmlkLFxuICAgICAgICAgICAgc25pcC5rZXksXG4gICAgICAgICAgICBzbmlwLmNvbnRlbnQsXG4gICAgICAgICAgICBzbmlwLmNhdGVnb3J5XG4gICAgICAgIF0pO1xuICAgICAgICBjb3VudHMuc25pcHBldHMrKztcbiAgICB9XG4gICAgY291bnRzLmFwcHMrKztcbiAgICByZXR1cm4gY291bnRzO1xufVxuIiwgIi8qKlxuICogQXBwIFBhY2sgXHUyMDE0IFNjaGVtYSBBcHBseVxuICpcbiAqIENvbXBpbGVzIHRoZSBwYWNrJ3MgYXBwIGRlZmluaXRpb25zIGludG8gYSBzaW5nbGUgY29uc29saWRhdGVkIFplblN0YWNrXG4gKiB6bW9kZWwgKGF1ZGl0IHByZXZpZXcgLyByZXN1bHQgYXJ0aWZhY3QpIGFuZCBhcHBsaWVzIHRoZSBwYWNrJ3MgbW9kZWxzIHRvXG4gKiB0aGUgdGFyZ2V0IHRlbmFudCBkYXRhYmFzZSBhcyByZWFsIHRhYmxlcyB2aWEgYWRkaXRpdmUgcmF3IERETC5cbiAqXG4gKiBXaHkgcmF3IERETCBpbnN0ZWFkIG9mIGBydW5NaWdyYXRpb25zYCAoemVuc3RhY2sgZ2VuZXJhdGUgKyBwcmlzbWEgZGIgcHVzaCk/XG4gKiBgcHJpc21hIGRiIHB1c2ggLS1hY2NlcHQtZGF0YS1sb3NzYCBEUk9QUyB0YWJsZXMgdGhhdCBhcmUgbm90IHByZXNlbnQgaW5cbiAqIHRoZSBzY2hlbWEuIFRoZSBwYWNrIHptb2RlbCBjb250YWlucyBvbmx5IHRoZSBwYWNrJ3MgbW9kZWxzLCBzbyBwdXNoaW5nIGl0XG4gKiBhZ2FpbnN0IHRoZSByb290IERCIG9yIGEgZmFjdG9yeS1jcmVhdGVkIHRlbmFudCBEQiAod2hpY2ggYm90aCBob2xkIG1hbnlcbiAqIG90aGVyIHRhYmxlcykgd291bGQgZGVsZXRlIHRoZW0uIEFkZGl0aXZlIGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUU2BcbiAqIGNyZWF0ZXMgdGhlIHBhY2sncyB0YWJsZXMgd2l0aG91dCB0b3VjaGluZyBhbnl0aGluZyBlbHNlIFx1MjAxNCBzYWZlIGFnYWluc3RcbiAqIGV2ZXJ5IHRhcmdldCwgaWRlbXBvdGVudCBvbiByZS1ydW4sIGFuZCBjb25zaXN0ZW50IHdpdGggdGhlIG1hdGVyaWFsaXplci5cbiAqXG4gKiBDb2x1bW4gc2hhcGVzIG1pcnJvciB3aGF0IGNvbXBpbGVUb1pNb2RlbCBlbWl0cyAoZmllbGQgbmFtZXMgYXMtaXMsIGJhc2VcbiAqIGNvbHVtbnMgaWQvdGVuYW50X3NsdWcvY3JlYXRlZF9hdC91cGRhdGVkX2F0KSBzbyB0aGUgdGFibGVzIG1hdGNoIHRoZVxuICogem1vZGVsIHByZXZpZXcgYW5kIHRoZSBnZW5lcmF0ZWQgUHJpc21hIGNsaWVudC5cbiAqLyBpbXBvcnQgeyBjb21waWxlVG9aTW9kZWwgfSBmcm9tICdAL2RvbWFpbi9haS96bW9kZWwtY29tcGlsZXInO1xuLy8gXHUyNTAwXHUyNTAwIEZpZWxkIHR5cGUgbWFwcGluZyAobWlycm9ycyB6bW9kZWwtY29tcGlsZXIgbWFwRmllbGRUeXBlKSBcdTI1MDBcdTI1MDBcbmZ1bmN0aW9uIG1hcFNxbFR5cGUoZmllbGRUeXBlKSB7XG4gICAgc3dpdGNoKGZpZWxkVHlwZSl7XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gJ1RFWFQnO1xuICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgIHJldHVybiAnVEVYVCc7XG4gICAgICAgIGNhc2UgJ2ludGVnZXInOlxuICAgICAgICAgICAgcmV0dXJuICdJTlRFR0VSJztcbiAgICAgICAgY2FzZSAnZGVjaW1hbCc6XG4gICAgICAgICAgICByZXR1cm4gJ05VTUVSSUMoMTQsMiknO1xuICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgIHJldHVybiAnQk9PTEVBTic7XG4gICAgICAgIGNhc2UgJ2RhdGV0aW1lJzpcbiAgICAgICAgICAgIHJldHVybiAnVElNRVNUQU1QJztcbiAgICAgICAgY2FzZSAnZGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4gJ0RBVEUnO1xuICAgICAgICBjYXNlICd0aW1lJzpcbiAgICAgICAgICAgIHJldHVybiAnVElNRSc7XG4gICAgICAgIGNhc2UgJ2VudW0nOlxuICAgICAgICAgICAgcmV0dXJuICdURVhUJztcbiAgICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgICAgICByZXR1cm4gJ0pTT05CJztcbiAgICAgICAgY2FzZSAncmVsYXRpb24nOlxuICAgICAgICAgICAgcmV0dXJuICdURVhUJztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAnVEVYVCc7XG4gICAgfVxufVxuZnVuY3Rpb24gbWFwU3FsRGVmYXVsdChmaWVsZCkge1xuICAgIGNvbnN0IGQgPSBmaWVsZC5kZWZhdWx0O1xuICAgIGlmIChkID09PSB1bmRlZmluZWQgfHwgZCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgaWYgKHR5cGVvZiBkID09PSAnc3RyaW5nJykgcmV0dXJuIGBERUZBVUxUICcke2QucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgO1xuICAgIGlmICh0eXBlb2YgZCA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gYERFRkFVTFQgJHtkfWA7XG4gICAgaWYgKHR5cGVvZiBkID09PSAnbnVtYmVyJykgcmV0dXJuIGBERUZBVUxUICR7ZH1gO1xuICAgIHJldHVybiBudWxsOyAvLyBhcnJheXMvb2JqZWN0cyBcdTIwMTQgc2tpcCAoem1vZGVsIG1hcHMgdGhlbSB0byBTdHJpbmcgYW55d2F5KVxufVxuLyoqIEJ1aWxkIHRoZSBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBzdGF0ZW1lbnQgZm9yIG9uZSBtb2RlbC4gKi8gZnVuY3Rpb24gY29tcGlsZVRhYmxlRERMKG1vZGVsKSB7XG4gICAgY29uc3QgY29sdW1ucyA9IFtcbiAgICAgICAgJ2lkIFRFWFQgUFJJTUFSWSBLRVknLFxuICAgICAgICAndGVuYW50X3NsdWcgVEVYVCdcbiAgICBdO1xuICAgIGZvciAoY29uc3QgZiBvZiBtb2RlbC5maWVsZHMpe1xuICAgICAgICBjb25zdCB0eXBlID0gbWFwU3FsVHlwZShmLnR5cGUpO1xuICAgICAgICBjb25zdCBudWxsYWJsZSA9IGYucmVxdWlyZWQgPyAnTk9UIE5VTEwnIDogJyc7XG4gICAgICAgIGNvbnN0IHVuaXF1ZSA9IGYudW5pcXVlID8gJ1VOSVFVRScgOiAnJztcbiAgICAgICAgY29uc3QgZGVmID0gbWFwU3FsRGVmYXVsdChmKTtcbiAgICAgICAgY29sdW1ucy5wdXNoKGAgICR7Zi5uYW1lfSAke3R5cGV9ICR7bnVsbGFibGV9ICR7dW5pcXVlfSAke2RlZiA/PyAnJ31gLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCkpO1xuICAgIH1cbiAgICBjb2x1bW5zLnB1c2goJ2NyZWF0ZWRfYXQgVElNRVNUQU1QIE5PVCBOVUxMIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAnKTtcbiAgICBjb2x1bW5zLnB1c2goJ3VwZGF0ZWRfYXQgVElNRVNUQU1QIE5PVCBOVUxMIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAnKTtcbiAgICByZXR1cm4gYENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIFwiJHttb2RlbC50YWJsZU5hbWV9XCIgKFxcbiR7Y29sdW1ucy5qb2luKCcsXFxuJyl9XFxuKTtgO1xufVxuLyoqIENvbHVtbiBiYWNrZmlsbHMgZm9yIHRhYmxlcyB0aGF0IHByZS1kYXRlIHRoZSBwYWNrJ3MgY29sdW1ucy4gKi8gZnVuY3Rpb24gY29tcGlsZVRhYmxlQWx0ZXJzKG1vZGVsKSB7XG4gICAgY29uc3QgYWx0ZXJzID0gW107XG4gICAgZm9yIChjb25zdCBmIG9mIG1vZGVsLmZpZWxkcyl7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBtYXBTcWxUeXBlKGYudHlwZSk7XG4gICAgICAgIGNvbnN0IG51bGxhYmxlID0gZi5yZXF1aXJlZCA/ICdOT1QgTlVMTCcgOiAnJztcbiAgICAgICAgY29uc3QgZGVmID0gbWFwU3FsRGVmYXVsdChmKTtcbiAgICAgICAgYWx0ZXJzLnB1c2goYEFMVEVSIFRBQkxFIFwiJHttb2RlbC50YWJsZU5hbWV9XCIgQUREIENPTFVNTiBJRiBOT1QgRVhJU1RTICR7Zi5uYW1lfSAke3R5cGV9ICR7bnVsbGFibGV9ICR7ZGVmID8/ICcnfWAucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKSk7XG4gICAgfVxuICAgIHJldHVybiBhbHRlcnM7XG59XG4vKipcbiAqIEJ1aWxkIGEgc2luZ2xlIGNvbnNvbGlkYXRlZCB6bW9kZWwgZnJvbSBldmVyeSBhcHAgZGVmaW5pdGlvbiBcdTIwMTQgb25lXG4gKiBkYXRhc291cmNlL2dlbmVyYXRvci9lbnVtIGhlYWRlciBwbHVzIGFsbCBtb2RlbHMgXHUyMDE0IHJldXNpbmcgdGhlIHNoYXJlZFxuICogY29tcGlsZVRvWk1vZGVsLiBNb2RlbCBuYW1lcyBhcmUga2VwdCBhcyBnZW5lcmF0ZWQ7IG9uIGEgbmFtZSBjb2xsaXNpb25cbiAqIHRoZSBsYXRlciBtb2RlbCBpcyBzdWZmaXhlZCB3aXRoIGl0cyBhcHAgaWQgc28gdGhlIHNjaGVtYSBzdGF5cyB2YWxpZC5cbiAqLyBleHBvcnQgZnVuY3Rpb24gY29tcGlsZVBhY2taTW9kZWwoZGVmaW5pdGlvbnMpIHtcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldCgpO1xuICAgIGNvbnN0IG1vZGVscyA9IGRlZmluaXRpb25zLmZsYXRNYXAoKGRlZik9PmRlZi5tb2RlbHMubWFwKChtKT0+e1xuICAgICAgICAgICAgbGV0IG5hbWUgPSBtLm5hbWU7XG4gICAgICAgICAgICBpZiAoc2Vlbi5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gYCR7bmFtZX1fJHtkZWYuYXBwSWQucmVwbGFjZSgvW15hLXpBLVowLTldL2csICcnKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2Vlbi5hZGQobmFtZSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIC4uLm0sXG4gICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSkpO1xuICAgIGNvbnN0IG1lcmdlZCA9IHtcbiAgICAgICAgdGVtcGxhdGVJZDogJ2FwcC1wYWNrJyxcbiAgICAgICAgc2NoZW1hT3JnVHlwZTogJ0xvY2FsQnVzaW5lc3MnLFxuICAgICAgICBtb2RlbHMsXG4gICAgICAgIHVzZUNhc2VzOiBkZWZpbml0aW9ucy5mbGF0TWFwKChkKT0+ZC51c2VDYXNlcyksXG4gICAgICAgIHBhZ2VzOiBkZWZpbml0aW9ucy5mbGF0TWFwKChkKT0+ZC5wYWdlcylcbiAgICB9O1xuICAgIHJldHVybiBjb21waWxlVG9aTW9kZWwobWVyZ2VkKTtcbn1cbi8qKlxuICogQXBwbHkgdGhlIHBhY2sncyBtb2RlbHMgdG8gdGhlIHRhcmdldCBEQiBhcyByZWFsIHRhYmxlcy4gQWRkaXRpdmUgYW5kXG4gKiBpZGVtcG90ZW50OiBjcmVhdGVzIG1pc3NpbmcgdGFibGVzL2luZGV4ZXMsIGJhY2tmaWxscyBtaXNzaW5nIGNvbHVtbnMsXG4gKiBuZXZlciBkcm9wcyBvciBhbHRlcnMgZXhpc3RpbmcgZGF0YS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gYXBwbHlQYWNrU2NoZW1hKGNsaWVudCwgZGVmaW5pdGlvbnMpIHtcbiAgICBjb25zdCBzdGFydGVkQXQgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IHptb2RlbCA9IGNvbXBpbGVQYWNrWk1vZGVsKGRlZmluaXRpb25zKTtcbiAgICBmb3IgKGNvbnN0IGRlZiBvZiBkZWZpbml0aW9ucyl7XG4gICAgICAgIGZvciAoY29uc3QgbW9kZWwgb2YgZGVmLm1vZGVscyl7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoY29tcGlsZVRhYmxlRERMKG1vZGVsKSk7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYENSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIFwiJHttb2RlbC50YWJsZU5hbWV9X3RlbmFudF9zbHVnX2lkeFwiIE9OIFwiJHttb2RlbC50YWJsZU5hbWV9XCIgKHRlbmFudF9zbHVnKTtgKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYWx0ZXIgb2YgY29tcGlsZVRhYmxlQWx0ZXJzKG1vZGVsKSl7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGFsdGVyKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICB7XG4gICAgICAgICAgICAgICAgLy8gQ29sdW1uIG1heSBhbHJlYWR5IGV4aXN0IFx1MjAxNCBpZ25vcmUuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHptb2RlbCxcbiAgICAgICAgYXBwbGllZDogdHJ1ZSxcbiAgICAgICAgZHVyYXRpb25NczogRGF0ZS5ub3coKSAtIHN0YXJ0ZWRBdFxuICAgIH07XG59XG4iLCAiLyoqXG4gKiBQcm9ncmVzcyBlbWlzc2lvbiBmb3IgdGhlIGFwcC1wYWNrLWdlbmVyYXRlIHdvcmtmbG93LlxuICpcbiAqIEZvbGxvd3MgdGhlIFNESyBzdHJlYW1pbmcgcGF0dGVybiB1c2VkIGJ5IHdvcmtib29rLWluZ2VzdDogdGhlIHdvcmtmbG93XG4gKiBmdW5jdGlvbiBjYWxscyBgZ2V0V3JpdGFibGUoKWAgYW5kIHBhc3NlcyB0aGUgc3RyZWFtIHRvIHN0ZXBzOyBzdGVwcyBvYnRhaW5cbiAqIGEgd3JpdGVyLCB3cml0ZSBKU09OIGNodW5rcywgYW5kIHJlbGVhc2UgdGhlIGxvY2suXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlUHJvZ3Jlc3NDaHVuayh3cml0YWJsZSwgY2h1bmspIHtcbiAgICBjb25zdCB3cml0ZXIgPSB3cml0YWJsZS5nZXRXcml0ZXIoKTtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCB3cml0ZXIud3JpdGUoY2h1bmspO1xuICAgIH0gZmluYWxseXtcbiAgICAgICAgd3JpdGVyLnJlbGVhc2VMb2NrKCk7XG4gICAgfVxufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsb3NlUHJvZ3Jlc3NTdHJlYW0od3JpdGFibGUpIHtcbiAgICBhd2FpdCB3cml0YWJsZS5jbG9zZSgpO1xufVxuIiwgIi8qKlxuICogTGlnaHR3ZWlnaHQgUG9zdGdyZVNRTCBoZWxwZXIgZm9yIGFwcC1wYWNrIHdvcmtmbG93IHN0ZXBzIChwZyBkcml2ZXIsIG5vXG4gKiBQcmlzbWEpLiBNaXJyb3JzIHdvcmtmbG93cy93b3JrYm9vay1pbmdlc3QvZGIudHMgXHUyMDE0IGVhY2ggc3RlcCBvcGVucyBpdHMgb3duXG4gKiBzaG9ydC1saXZlZCBjb25uZWN0aW9uOyB0aGUgY29ubmVjdGlvbiBzdHJpbmcgaXMgcmVzb2x2ZWQgYnkgdGhlIHJvdXRlIGFuZFxuICogcGFzc2VkIHRocm91Z2ggdGhlIHdvcmtmbG93IGlucHV0LlxuICovIGltcG9ydCB7IENsaWVudCB9IGZyb20gJ3BnJztcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3aXRoUGdDbGllbnQoY29ubmVjdGlvblN0cmluZywgZm4pIHtcbiAgICBpZiAoIWNvbm5lY3Rpb25TdHJpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkYXRhYmFzZSBjb25uZWN0aW9uIHN0cmluZyBwcm92aWRlZC4nKTtcbiAgICB9XG4gICAgY29uc3QgY2xpZW50ID0gbmV3IENsaWVudCh7XG4gICAgICAgIGNvbm5lY3Rpb25TdHJpbmdcbiAgICB9KTtcbiAgICBhd2FpdCBjbGllbnQuY29ubmVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBmbihjbGllbnQpO1xuICAgIH0gZmluYWxseXtcbiAgICAgICAgYXdhaXQgY2xpZW50LmVuZCgpO1xuICAgIH1cbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBxdWVyeVJvd3MoY2xpZW50LCBzcWwsIHBhcmFtcyA9IFtdKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnF1ZXJ5KHNxbCwgcGFyYW1zKTtcbiAgICByZXR1cm4gcmVzdWx0LnJvd3M7XG59XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuLyoqXG4gKiBTdGVwIGZ1bmN0aW9ucyBmb3IgdGhlIHdvcmtib29rLWluZ2VzdCB3b3JrZmxvdy5cbiAqXG4gKiBFYWNoIGV4cG9ydGVkIGFzeW5jIGZ1bmN0aW9uIHdpdGggdGhlIGAndXNlIHN0ZXAnYCBkaXJlY3RpdmUgaXMgYSBkdXJhYmxlXG4gKiBzdGVwOiBpdHMgYXJncyBhbmQgcmVzdWx0IGFyZSBzZXJpYWxpemVkIHRvIHRoZSBldmVudCBsb2csIGFuZCBpdCByZXRyaWVzXG4gKiAobWF4IDMsIG9yIHBlciBSZXRyeWFibGVFcnJvcikgYmVmb3JlIHRoZSBlcnJvciBidWJibGVzIHRvIHRoZSB3b3JrZmxvdy5cbiAqLyBpbXBvcnQgeyBGYXRhbEVycm9yLCBSZXRyeWFibGVFcnJvciB9IGZyb20gJ3dvcmtmbG93JztcbmltcG9ydCB7IGV4dHJhY3RTaGVldHNXaXRoU3RhdHMgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL2V4dHJhY3Qtc2hlZXRzJztcbmltcG9ydCB7IGFuYWx5emVTaGVldHMgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL3NoZWV0LWFuYWx5c2lzJztcbmltcG9ydCB7IGNvbXByZWhlbmRPbmNlLCBDb21wcmVoZW5kSHR0cEVycm9yLCBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yIH0gZnJvbSAnLi4vLi4vc3JjL2RvbWFpbi9haS13b3JrYm9vay9jb21wcmVoZW5kJztcbmltcG9ydCB7IHdyaXRlUHJvZ3Jlc3NDaHVuaywgY2xvc2VQcm9ncmVzc1N0cmVhbSB9IGZyb20gJy4vcHJvZ3Jlc3MnO1xuaW1wb3J0IHsgd2l0aFBnQ2xpZW50LCBleGVjdXRlT25lLCBxdWVyeVJvd3MgfSBmcm9tICcuL2RiJztcbmltcG9ydCB7IHJlYWQgfSBmcm9tICd4bHN4JztcbmltcG9ydCB7IGJ1aWxkV29ya2Jvb2tGb3JtdWxhTWFwIH0gZnJvbSAnLi4vLi4vc3JjL2xpYi93b3JrYm9vay1mb3JtdWxhcyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wid29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy50c1wiOntcImFuYWx5emVTaGVldHNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2FuYWx5emVTaGVldHNTdGVwXCJ9LFwiY2xvc2VQcm9ncmVzc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vY2xvc2VQcm9ncmVzc1N0ZXBcIn0sXCJjb21wcmVoZW5kV29ya2Jvb2tTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2NvbXByZWhlbmRXb3JrYm9va1N0ZXBcIn0sXCJlbWl0UHJvZ3Jlc3NTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2VtaXRQcm9ncmVzc1N0ZXBcIn0sXCJleHRyYWN0U2hlZXRzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9leHRyYWN0U2hlZXRzU3RlcFwifSxcImdlbmVyYXRlQnVzaW5lc3NSZXZpZXdTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlQnVzaW5lc3NSZXZpZXdTdGVwXCJ9LFwiZ2VuZXJhdGVEYXNoYm9hcmRTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlRGFzaGJvYXJkU3RlcFwifSxcImdlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcFwifSxcImxvYWRXb3JrYm9va1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vbG9hZFdvcmtib29rU3RlcFwifSxcInBvcHVsYXRlUHJvamVjdGlvbnNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3BvcHVsYXRlUHJvamVjdGlvbnNTdGVwXCJ9LFwicmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3JlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcFwifSxcInNhdmVTbmlwcGV0c1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2F2ZVNuaXBwZXRzU3RlcFwifSxcInNhdmVXb3JrYm9va0Zvcm11bGFNYXBTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NhdmVXb3JrYm9va0Zvcm11bGFNYXBTdGVwXCJ9LFwic2VsZWN0VGVtcGxhdGVTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NlbGVjdFRlbXBsYXRlU3RlcFwifSxcInVwc2VydFNoZWV0UGFnZXNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3Vwc2VydFNoZWV0UGFnZXNTdGVwXCJ9fX19Ki87XG4vKiogRGV0ZWN0IHRoZSBmaWxlIHNpZ25hdHVyZXMgb2YgcmVhbCBzcHJlYWRzaGVldCBmaWxlcyAoemlwL3hsc3gsIEJJRkYveGxzKS4gKi8gZnVuY3Rpb24gaGFzU3ByZWFkc2hlZXRNYWdpYyhkYXRhKSB7XG4gICAgY29uc3QgYiA9IGRhdGE7XG4gICAgLy8gUEtcXHgwM1xceDA0ICh6aXAgXHUyMTkyIHhsc3gpIG9yIFBLXFx4MDVcXHgwNiAoZW1wdHkgemlwKVxuICAgIGlmIChiWzBdID09PSAweDUwICYmIGJbMV0gPT09IDB4NGIpIHJldHVybiB0cnVlO1xuICAgIC8vIEQwIENGIDExIEUwIEExIEIxIDFBIEUxIChPTEUyIGNvbXBvdW5kIFx1MjE5MiAueGxzKVxuICAgIGlmIChiWzBdID09PSAweGQwICYmIGJbMV0gPT09IDB4Y2YgJiYgYlsyXSA9PT0gMHgxMSAmJiBiWzNdID09PSAweGUwICYmIGJbNF0gPT09IDB4YTEgJiYgYls1XSA9PT0gMHhiMSAmJiBiWzZdID09PSAweDFhICYmIGJbN10gPT09IDB4ZTEpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbi8qKlxuICogQ29udmVydCByYXcgdXBsb2FkIGJ5dGVzIGludG8geGxzeCBidWZmZXJzLlxuICpcbiAqIFVpbnQ4QXJyYXkgaXMgc2VyaWFsaXphYmxlIGFjcm9zcyB0aGUgd29ya2Zsb3cgYm91bmRhcnk7IEJ1ZmZlciBpcyBub3RcbiAqIGd1YXJhbnRlZWQgaW4gd29ya2Zsb3cgc3RlcCBzYW5kYm94ZXMsIHNvIHdlIGtlZXAgVWludDhBcnJheSBldmVyeXdoZXJlXG4gKiBhbmQgaGFuZCBpdCBkaXJlY3RseSB0byBgeGxzeC5yZWFkKHsgdHlwZTogJ2J1ZmZlcicgfSlgLlxuICpcbiAqIFNoZWV0SlMgaXMgbGVuaWVudCB3aXRoIGFyYml0cmFyeSB0ZXh0IChpdCBwYXJzZXMgcGxhaW4gdGV4dCBhcyBhIDEtY29sdW1uXG4gKiBzaGVldCksIHNvIHdlIHZhbGlkYXRlIHRoZSBtYWdpYyBieXRlcyBCRUZPUkUgcGFyc2luZyB0byBjYXRjaCB1cGxvYWRzIG9mXG4gKiB0aGUgd3JvbmcgZmlsZSB0eXBlIHdpdGggYSBjbGVhbiBGYXRhbEVycm9yLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkV29ya2Jvb2tTdGVwKGZpbGVzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGZpbGVzKSB8fCBmaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoJ05vIHdvcmtib29rIGZpbGVzIHdlcmUgcHJvdmlkZWQuJyk7XG4gICAgfVxuICAgIHJldHVybiBmaWxlcy5tYXAoKGYpPT57XG4gICAgICAgIGlmICghZiB8fCB0eXBlb2YgZi5uYW1lICE9PSAnc3RyaW5nJyB8fCAhKGYuZGF0YSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcignSW52YWxpZCBmaWxlIGVudHJ5OiBleHBlY3RlZCB7IG5hbWUsIGRhdGE6IFVpbnQ4QXJyYXkgfS4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZi5kYXRhLmJ5dGVMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBXb3JrYm9vayBcIiR7Zi5uYW1lfVwiIGlzIGVtcHR5LmApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaGFzU3ByZWFkc2hlZXRNYWdpYyhmLmRhdGEpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgV29ya2Jvb2sgXCIke2YubmFtZX1cIiBpcyBub3QgYSByZWFkYWJsZSAueGxzeC8ueGxzIGZpbGUgKHVuZXhwZWN0ZWQgZmlsZSBzaWduYXR1cmUpLmApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmLmRhdGE7XG4gICAgfSk7XG59XG4vKiogRVhUUkFDVDogc2VyaWFsaXplIGV2ZXJ5IHNoZWV0IHRvIHRleHQgKyBzdHJ1Y3R1cmFsIHN0YXRzLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXh0cmFjdFNoZWV0c1N0ZXAoYnVmZmVycykge1xuICAgIGNvbnN0IGFsbCA9IFtdO1xuICAgIGZvciAoY29uc3QgYnVmIG9mIGJ1ZmZlcnMpe1xuICAgICAgICBsZXQgZXh0cmFjdGVkO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZXh0cmFjdGVkID0gZXh0cmFjdFNoZWV0c1dpdGhTdGF0cyhidWYpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBXb3JrYm9vayBpcyBub3QgYSByZWFkYWJsZSAueGxzeCBmaWxlOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gKTtcbiAgICAgICAgfVxuICAgICAgICBhbGwucHVzaCguLi5leHRyYWN0ZWQpO1xuICAgIH1cbiAgICBpZiAoYWxsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcignV29ya2Jvb2sgY29udGFpbnMgbm8gcmVhZGFibGUgc2hlZXRzLicpO1xuICAgIH1cbiAgICByZXR1cm4gYWxsO1xufVxuLyoqIEFOQUxZWkU6IGRldGVybWluaXN0aWMgcHJlLXBhc3MgcHJvZHVjaW5nIHN0cnVjdHVyZWQgaGludHMuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBhbmFseXplU2hlZXRzU3RlcChzaGVldHMpIHtcbiAgICByZXR1cm4gYW5hbHl6ZVNoZWV0cyhzaGVldHMpO1xufVxuLyoqXG4gKiBGT1JNVUxBIE1BUDogZmluZCBldmVyeSBmb3JtdWxhIGNlbGwgaW4gdGhlIGltcG9ydGVkIHdvcmtib29rIGFuZCBwZXJzaXN0XG4gKiBpdHMgcmVmZXJlbmNlcyBtYXBwZWQgdG8gdGhlIERCLXNoZWV0IGNvb3JkaW5hdGVzIChjb2x1bW4ga2V5ICsgZGF0YSByb3dcbiAqIG9mZnNldCkgdGhhdCB0aGUgc2hlZXQgdmlld2VyIHNlcnZlcywgc28gZm9ybXVsYXMgY2FuIGJlIGNvbXB1dGVkIGFnYWluc3RcbiAqIHRoZSBkYXRhYmFzZS1zYXZlZCBzaGVldCBkYXRhLiBJZGVtcG90ZW50OiBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVXb3JrYm9va0Zvcm11bGFNYXBTdGVwKGJ1ZmZlcnMsIGRiVXJsKSB7XG4gICAgbGV0IHRvdGFsID0gMDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB3YiA9IHJlYWQoYnVmZmVyc1swXSwge1xuICAgICAgICAgICAgdHlwZTogJ2J1ZmZlcicsXG4gICAgICAgICAgICBjZWxsRm9ybXVsYTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZm9ybXVsYU1hcCA9IGJ1aWxkV29ya2Jvb2tGb3JtdWxhTWFwKHdiKTtcbiAgICAgICAgdG90YWwgPSBPYmplY3QudmFsdWVzKGZvcm11bGFNYXApLnJlZHVjZSgobiwgcyk9Pm4gKyBzLmZvcm11bGFzLmxlbmd0aCwgMCk7XG4gICAgICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY2F0ZWdvcnksIGNvbnRlbnQpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJ2NhY2hlJywgJDIpXG4gICAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50O2AsIFtcbiAgICAgICAgICAgICAgICAnd29ya2Jvb2tfZm9ybXVsYXMnLFxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGZvcm11bGFNYXApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIE5vbi1mYXRhbDogdGhlIHdvcmtib29rX2RhdGEgc25pcHBldCByZW1haW5zIHRoZSBzb3VyY2Ugb2YgdHJ1dGggYW5kIHRoZVxuICAgICAgICAvLyBzaGVldC1kYXRhIEFQSSBjb21wdXRlcyBmb3JtdWxhIHZhbHVlcyBvbiByZWFkIHdoZW4gdGhpcyBpcyBtaXNzaW5nLlxuICAgICAgICBjb25zb2xlLndhcm4oJ1t3b3JrYm9vay1pbmdlc3RdIEZvcm11bGEgbWFwIHN0ZXAgc2tpcHBlZDonLCBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycikpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsO1xufVxuLyoqXG4gKiBDT01QUkVIRU5EOiBvbmUgT3BlbkFJIGNhbGwgKGdwdC00bywganNvbl9vYmplY3QsIFpvZC12YWxpZGF0ZWQpIHdpdGggdGhlXG4gKiBkZXRlcm1pbmlzdGljIEFOQUxZU0lTIGhpbnRzIGluamVjdGVkIGludG8gdGhlIHByb21wdC5cbiAqXG4gKiBSZXRyeSBwb2xpY3kgKFx1MDBBNzQuMiBvZiB0aGUgcm9hZG1hcCk6XG4gKiAgIC0gNDI5ICAgICAgICAgICAgXHUyMTkyIFJldHJ5YWJsZUVycm9yKHsgcmV0cnlBZnRlciB9KSB1c2luZyBSZXRyeS1BZnRlciBoZWFkZXIgKGZhbGxiYWNrIDFzKVxuICogICAtIDV4eCAvIG5ldHdvcmsgIFx1MjE5MiBwbGFpbiBFcnJvciBcdTIxOTIgU0RLIGF1dG8tcmV0cnkgKG1heCAzKVxuICogICAtIG1pc3Npbmcga2V5ICAgIFx1MjE5MiBGYXRhbEVycm9yIChwZXJtYW5lbnQsIG5vIHJldHJ5IHN0b3JtKVxuICogICAtIHNjaGVtYSByZWplY3RlZCBcdTIxOTIgcGxhaW4gRXJyb3IgXHUyMTkyIFNESyBhdXRvLXJldHJpZXMgKG1vZGVsIG91dHB1dCBpcyBzdG9jaGFzdGljXG4gKiAgICAgICAgICAgICAgICAgICAgICBhdCB0ZW1wZXJhdHVyZSAwLjIpOyBydW4gZmFpbHMgd2l0aCBhIGNsZWFyIG1lc3NhZ2UgYWZ0ZXJcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZSBTREsncyByZXRyeSBidWRnZXQgaXMgZXhoYXVzdGVkLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21wcmVoZW5kV29ya2Jvb2tTdGVwKHNoZWV0cywgaGludHMsIG1vZGVsID0gJ2dwdC00bycsIG9wZW5haUFwaUtleSkge1xuICAgIGNvbnN0IGFwaUtleSA9IG9wZW5haUFwaUtleSB8fCBwcm9jZXNzLmVudi5PUEVOQUlfQVBJX0tFWTtcbiAgICBpZiAoIWFwaUtleSkge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcignT3BlbkFJIEFQSSBrZXkgbm90IGNvbmZpZ3VyZWQuIFNldCBpdCBpbiBDb25maWcgPiBPcGVuQUkgS2V5ICh2aWEgdGhlIHJlc2VlZCByb3V0ZSkgb3Igc2V0IE9QRU5BSV9BUElfS0VZIGVudiB2YXIuJyk7XG4gICAgfVxuICAgIGNvbnN0IGJsb2NrcyA9IHNoZWV0cy5tYXAoKHsgdGFiTmFtZSwgdGV4dCB9KT0+KHtcbiAgICAgICAgICAgIHRhYk5hbWUsXG4gICAgICAgICAgICB0ZXh0XG4gICAgICAgIH0pKTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgY29tcHJlaGVuZE9uY2UoYmxvY2tzLCB7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIGhpbnRzLFxuICAgICAgICAgICAgYXBpS2V5XG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQ29tcHJlaGVuZEh0dHBFcnJvcikge1xuICAgICAgICAgICAgaWYgKGVyci5zdGF0dXMgPT09IDQyOSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldHJ5QWZ0ZXJTZWNvbmRzID0gZXJyLnJldHJ5QWZ0ZXJTZWNvbmRzID8/IDE7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJldHJ5YWJsZUVycm9yKGVyci5tZXNzYWdlLCB7XG4gICAgICAgICAgICAgICAgICAgIHJldHJ5QWZ0ZXI6IGAke3JldHJ5QWZ0ZXJTZWNvbmRzfXNgXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyA1eHggZXRjIFx1MjE5MiBwbGFpbiBFcnJvciBcdTIxOTIgU0RLIGF1dG8tcmV0cnkgKG1heCAzKVxuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yKSB7XG4gICAgICAgICAgICAvLyBTY2hlbWEvSlNPTiByZWplY3Rpb24gXHUyMDE0IHRoZSBtb2RlbCBtYXkgcHJvZHVjZSB2YWxpZCBvdXRwdXQgb24gcmV0cnkuXG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbn1cbi8qKlxuICogRW1pdCBhIHByb2dyZXNzIGNodW5rIHRvIHRoZSBydW4ncyB3cml0YWJsZSBzdHJlYW0gKFNTRSBwYXlsb2FkKS5cbiAqIE11c3QgYmUgYSBzdGVwOiB3b3JrZmxvdyBmdW5jdGlvbnMgY2Fubm90IGludGVyYWN0IHdpdGggdGhlIHN0cmVhbSBkaXJlY3RseS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZW1pdFByb2dyZXNzU3RlcCh3cml0YWJsZSwgY2h1bmspIHtcbiAgICBhd2FpdCB3cml0ZVByb2dyZXNzQ2h1bmsod3JpdGFibGUsIGNodW5rKTtcbn1cbi8qKlxuICogQ2xvc2UgdGhlIHJ1bidzIHdyaXRhYmxlIHN0cmVhbSwgc2lnbmFsaW5nIGNvbXBsZXRpb24gdG8gc3RyZWFtIHJlYWRlcnMuXG4gKiBNdXN0IGJlIGEgc3RlcDogd29ya2Zsb3cgZnVuY3Rpb25zIGNhbm5vdCBpbnRlcmFjdCB3aXRoIHRoZSBzdHJlYW0gZGlyZWN0bHkuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsb3NlUHJvZ3Jlc3NTdGVwKHdyaXRhYmxlKSB7XG4gICAgYXdhaXQgY2xvc2VQcm9ncmVzc1N0cmVhbSh3cml0YWJsZSk7XG59XG4vLyBcdTI1MDBcdTI1MDAgUGhhc2UgMzogUE9QVUxBVEUgc3RlcHMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vKipcbiAqIFVwc2VydCBmaW5hbmNpYWwgcHJvamVjdGlvbnMgZnJvbSB0aGUgQUkgY29tcHJlaGVuc2lvbi5cbiAqIElkZW1wb3RlbnQ6IE9OIENPTkZMSUNUIChwZXJpb2QsIGRhdGFfdHlwZSwgc2NlbmFyaW8pIERPIFVQREFURS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXAoY29tcHJlaGVuc2lvbiwgZGJVcmwpIHtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICBmb3IgKGNvbnN0IG1ldHJpYyBvZiBjb21wcmVoZW5zaW9uLnByb2plY3Rpb25zKXtcbiAgICAgICAgICAgIGNvbnN0IHllYXIgPSBOdW1iZXIobWV0cmljLnBlcmlvZC5zbGljZSgwLCA0KSk7XG4gICAgICAgICAgICBjb25zdCBtb250aCA9IE51bWJlcihtZXRyaWMucGVyaW9kLnNsaWNlKDUsIDcpKTtcbiAgICAgICAgICAgIGNvbnN0IHJldmVudWUgPSBNYXRoLnJvdW5kKG1ldHJpYy5yZXZlbnVlID8/IDApO1xuICAgICAgICAgICAgY29uc3QgZWJpdGRhID0gTWF0aC5yb3VuZChtZXRyaWMuZWJpdGRhID8/IDApO1xuICAgICAgICAgICAgY29uc3QgbmV0SW5jb21lID0gTWF0aC5yb3VuZChtZXRyaWMubmV0SW5jb21lID8/IDApO1xuICAgICAgICAgICAgY29uc3QgZ3Vlc3RzID0gTWF0aC5yb3VuZChtZXRyaWMuZ3Vlc3RzID8/IDApO1xuICAgICAgICAgICAgY29uc3Qgc3RhZmZDb3N0ID0gTWF0aC5yb3VuZChtZXRyaWMuc3RhZmZDb3N0ID8/IDApO1xuICAgICAgICAgICAgY29uc3QgcG5sTGluZXMgPSBKU09OLnN0cmluZ2lmeShbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdyZXZlbnVlJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdSZXZlbnVlJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJldmVudWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnZWJpdGRhJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFQklUREEnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZWJpdGRhXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ25ldF9pbmNvbWUnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ05ldCBJbmNvbWUnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbmV0SW5jb21lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ3N0YWZmX2Nvc3QnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1N0YWZmIENvc3QnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc3RhZmZDb3N0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ2d1ZXN0cycsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnR3Vlc3RzJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGd1ZXN0c1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGZpbmFuY2lhbF9wcm9qZWN0aW9ucyAocGVyaW9kLCB5ZWFyLCBtb250aCwgZGF0YV90eXBlLCBzY2VuYXJpbywgcmV2ZW51ZSwgZWJpdGRhLCBuZXRfaW5jb21lLCBndWVzdHMsIHN0YWZmX2Nvc3QsIHBubF9saW5lcylcbiAgICAgICAgIFZBTFVFUyAoJDEsICQyLCAkMywgJDQsICQ1LCAkNiwgJDcsICQ4LCAkOSwgJDEwLCAkMTE6Ompzb25iKVxuICAgICAgICAgT04gQ09ORkxJQ1QgKHBlcmlvZCwgZGF0YV90eXBlLCBzY2VuYXJpbylcbiAgICAgICAgIERPIFVQREFURSBTRVRcbiAgICAgICAgICAgcmV2ZW51ZSA9IEVYQ0xVREVELnJldmVudWUsXG4gICAgICAgICAgIGViaXRkYSA9IEVYQ0xVREVELmViaXRkYSxcbiAgICAgICAgICAgbmV0X2luY29tZSA9IEVYQ0xVREVELm5ldF9pbmNvbWUsXG4gICAgICAgICAgIGd1ZXN0cyA9IEVYQ0xVREVELmd1ZXN0cyxcbiAgICAgICAgICAgc3RhZmZfY29zdCA9IEVYQ0xVREVELnN0YWZmX2Nvc3QsXG4gICAgICAgICAgIHBubF9saW5lcyA9IEVYQ0xVREVELnBubF9saW5lcztgLCBbXG4gICAgICAgICAgICAgICAgbWV0cmljLnBlcmlvZCxcbiAgICAgICAgICAgICAgICB5ZWFyLFxuICAgICAgICAgICAgICAgIG1vbnRoLFxuICAgICAgICAgICAgICAgIG1ldHJpYy5kYXRhVHlwZSxcbiAgICAgICAgICAgICAgICBtZXRyaWMuc2NlbmFyaW8sXG4gICAgICAgICAgICAgICAgcmV2ZW51ZSxcbiAgICAgICAgICAgICAgICBlYml0ZGEsXG4gICAgICAgICAgICAgICAgbmV0SW5jb21lLFxuICAgICAgICAgICAgICAgIGd1ZXN0cyxcbiAgICAgICAgICAgICAgICBzdGFmZkNvc3QsXG4gICAgICAgICAgICAgICAgcG5sTGluZXNcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb3VudDtcbn1cbi8qKiBOb3JtYWxpemUgYSBzaGVldCB0YWIgbmFtZSBpbnRvIGEgVVJMLXNhZmUgc2x1Zy4gKi8gZnVuY3Rpb24gbm9ybWFsaXplU2x1ZyhuYW1lKSB7XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bJl0vZywgJ2FuZCcpLnJlcGxhY2UoL1tcXHNdKy9nLCAnLScpLnJlcGxhY2UoL1teYS16MC05LV0vZywgJycpLnJlcGxhY2UoLy0rL2csICctJykucmVwbGFjZSgvXi18LSQvZywgJycpO1xufVxuLyoqIFBhZ2UgYmxvY2tzIHBlciBzaGVldCBjYXRlZ29yeSAobWlycm9ycyBwaXBlbGluZS50cyBDQVRFR09SWV9CTE9DS1MpLiAqLyBjb25zdCBTSEVFVF9DQVRFR09SWV9CTE9DS1MgPSB7XG4gICAgZGFpbHlfc2FsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnRGFpbHkgU2FsZXMgXHUyMDE0IERhdGEnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXJ0X2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICB0aXRsZTogJ0RhaWx5IFNhbGVzIFx1MjAxNCBUcmVuZHMnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIHByb2ZpdF9sb3NzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3BubF90YWJsZScsXG4gICAgICAgICAgICB0aXRsZTogJ1Byb2ZpdCAmIExvc3MgXHUyMDE0IFN0YXRlbWVudCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnUHJvZml0ICYgTG9zcyBcdTIwMTQgVHJlbmRzJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBiYWxhbmNlX3NoZWV0OiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3NoZWV0X3ZpZXdlcicsXG4gICAgICAgICAgICB0aXRsZTogJ0JhbGFuY2UgU2hlZXQgXHUyMDE0IERhdGEnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIHRyaWFsX2JhbGFuY2U6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnVHJpYWwgQmFsYW5jZSBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgZ2VuZXJhbF9sZWRnZXI6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnR2VuZXJhbCBMZWRnZXIgXHUyMDE0IERhdGEnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIGNvc3Rfb2Zfc2FsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnQ29zdCBvZiBTYWxlcyBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgbW9udGhfb25fbW9udGg6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTW9udGggb24gTW9udGggXHUyMDE0IENvbXBhcmlzb24nXG4gICAgICAgIH1cbiAgICBdLFxuICAgIGJyZWFrX2V2ZW46IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAna3BpX2NhcmRzJyxcbiAgICAgICAgICAgIHRpdGxlOiAnQnJlYWstRXZlbiBcdTIwMTQgS1BJcydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnQnJlYWstRXZlbiBcdTIwMTQgVHJlbmQnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIHZhcmlhbmNlOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXJ0X2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICB0aXRsZTogJ01vbnRobHkgVmFyaWFuY2UgXHUyMDE0IEFuYWx5c2lzJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBzdW1tYXJ5X3BsOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXJ0X2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICB0aXRsZTogJ011bHRpLVllYXIgUCZMIFx1MjAxNCBUcmVuZCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAncG5sX3RhYmxlJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTXVsdGktWWVhciBQJkwgXHUyMDE0IFN0YXRlbWVudCdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgc3VtbWFyeV9iczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdNdWx0aS1ZZWFyIEJhbGFuY2UgU2hlZXQgXHUyMDE0IERhdGEnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIG90aGVyOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3NoZWV0X3ZpZXdlcicsXG4gICAgICAgICAgICB0aXRsZTogJ1NoZWV0IERhdGEnXG4gICAgICAgIH1cbiAgICBdXG59O1xuLyoqXG4gKiBDcmVhdGUvdXBkYXRlIGR5bmFtaWMgYXBwIHBhZ2VzICsgcGFnZSBzZWN0aW9ucyBmb3IgZWFjaCBjb21wcmVoZW5kZWQgc2hlZXQuXG4gKlxuICogXHUwMEE3Ny4xIEZJWDogT04gQ09ORkxJQ1QgKHNsdWcpIERPIFVQREFURSAuLi4gUkVUVVJOSU5HIGlkIGVuc3VyZXMgd2UgYWx3YXlzXG4gKiBoYXZlIHRoZSBjb3JyZWN0IHBhZ2UgSUQgKG5ldyBvciBleGlzdGluZykuIFBhZ2Ugc2VjdGlvbnMgYXJlIGRlbGV0ZWQgYW5kXG4gKiByZS1pbnNlcnRlZCBzY29wZWQgdG8gdGhhdCBpZCBcdTIwMTQgbm8gb3JwaGFuIEZLIHJlZmVyZW5jZXMuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwc2VydFNoZWV0UGFnZXNTdGVwKGNvbXByZWhlbnNpb24sIGRiVXJsLCB0ZW5hbnRTbHVnKSB7XG4gICAgY29uc3QgY3JlYXRlZCA9IFtdO1xuICAgIGxldCBzb3J0T3JkZXIgPSAxMDA7XG4gICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgIGZvciAoY29uc3Qgc2hlZXQgb2YgY29tcHJlaGVuc2lvbi5zaGVldHMpe1xuICAgICAgICAgICAgY29uc3Qgc2x1ZyA9IGBzaGVldC0ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YDtcbiAgICAgICAgICAgIGNvbnN0IGJsb2NrcyA9IFNIRUVUX0NBVEVHT1JZX0JMT0NLU1tzaGVldC5jYXRlZ29yeV0gPz8gU0hFRVRfQ0FURUdPUllfQkxPQ0tTLm90aGVyO1xuICAgICAgICAgICAgLy8gXHUwMEE3Ny4xIGZpeDogUkVUVVJOSU5HIGlkIGdpdmVzIHVzIHRoZSByZWFsIHBhZ2UgSUQgb24gaW5zZXJ0IE9SIGNvbmZsaWN0LlxuICAgICAgICAgICAgY29uc3QgcGFnZVJvd3MgPSBhd2FpdCBxdWVyeVJvd3MoZGIsIGBJTlNFUlQgSU5UTyBhcHBfcGFnZXMgKGlkLCBzbHVnLCB0aXRsZSwgYXV0aF90aWVyLCBzb3J0X29yZGVyLCBuYXZfbGFiZWwsIHNob3dfaW5fbmF2LCB0ZW5hbnRfc2x1ZylcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAkMiwgJ2dvb2dsZScsICQzLCAkNCwgdHJ1ZSwgJDUpXG4gICAgICAgICBPTiBDT05GTElDVCAoc2x1ZykgRE8gVVBEQVRFIFNFVFxuICAgICAgICAgICB0aXRsZSA9IEVYQ0xVREVELnRpdGxlLFxuICAgICAgICAgICBhdXRoX3RpZXIgPSBFWENMVURFRC5hdXRoX3RpZXIsXG4gICAgICAgICAgIHNvcnRfb3JkZXIgPSBFWENMVURFRC5zb3J0X29yZGVyLFxuICAgICAgICAgICBuYXZfbGFiZWwgPSBFWENMVURFRC5uYXZfbGFiZWwsXG4gICAgICAgICAgIHNob3dfaW5fbmF2ID0gRVhDTFVERUQuc2hvd19pbl9uYXYsXG4gICAgICAgICAgIHRlbmFudF9zbHVnID0gQ09BTEVTQ0UoRVhDTFVERUQudGVuYW50X3NsdWcsIGFwcF9wYWdlcy50ZW5hbnRfc2x1ZylcbiAgICAgICAgIFJFVFVSTklORyBpZDtgLCBbXG4gICAgICAgICAgICAgICAgc2x1ZyxcbiAgICAgICAgICAgICAgICBzaGVldC50aXRsZSxcbiAgICAgICAgICAgICAgICBzb3J0T3JkZXIrKyxcbiAgICAgICAgICAgICAgICBzaGVldC50aXRsZSxcbiAgICAgICAgICAgICAgICB0ZW5hbnRTbHVnID8/IG51bGxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY29uc3QgcGFnZUlkID0gcGFnZVJvd3NbMF0/LmlkO1xuICAgICAgICAgICAgaWYgKCFwYWdlSWQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgLy8gUmVwbGFjZSBzZWN0aW9ucyBmb3IgdGhpcyBwYWdlIChpZGVtcG90ZW50IG9uIHJldHJ5KS5cbiAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBERUxFVEUgRlJPTSBwYWdlX3NlY3Rpb25zIFdIRVJFIHBhZ2VfaWQgPSAkMTtgLCBbXG4gICAgICAgICAgICAgICAgcGFnZUlkXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnlNYXJrZG93biA9IFtcbiAgICAgICAgICAgICAgICBgIyAke3NoZWV0LnRpdGxlfWAsXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgc2hlZXQuc3VtbWFyeSxcbiAgICAgICAgICAgICAgICBzaGVldC5wZXJpb2RIaW50ID8gYFxcbioqUGVyaW9kKio6ICR7c2hlZXQucGVyaW9kSGludH1gIDogJycsXG4gICAgICAgICAgICAgICAgYCoqUm93cyoqOiAke3NoZWV0LnJvd0NvdW50ID8/ICdcdTIwMTQnfSAgfCAgKipDb2x1bW5zKio6ICR7KHNoZWV0LmNvbHVtbnMgPz8gW10pLmxlbmd0aCB8fCAnXHUyMDE0J31gLFxuICAgICAgICAgICAgICAgICcnXG4gICAgICAgICAgICBdLmZpbHRlcigobCk9PmwgIT09ICcnKS5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgIC8vIGRvY19tYXJrZG93biBibG9ja1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIHBhZ2Vfc2VjdGlvbnMgKGlkLCBwYWdlX2lkLCBzb3J0X29yZGVyLCBibG9ja190eXBlLCBjb25maWcpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgMCwgJ2RvY19tYXJrZG93bicsICQyOjpqc29uYik7YCwgW1xuICAgICAgICAgICAgICAgIHBhZ2VJZCxcbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQWJvdXQgdGhpcyBzaGVldCcsXG4gICAgICAgICAgICAgICAgICAgIG1hcmtkb3duOiBzdW1tYXJ5TWFya2Rvd25cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAvLyBDYXRlZ29yeS1zcGVjaWZpYyBibG9ja3NcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBibG9ja3MubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIGNvbnN0IGJsb2NrID0gYmxvY2tzW2ldO1xuICAgICAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBwYWdlX3NlY3Rpb25zIChpZCwgcGFnZV9pZCwgc29ydF9vcmRlciwgYmxvY2tfdHlwZSwgY29uZmlnKVxuICAgICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJDIsICQzLCAkNDo6anNvbmIpO2AsIFtcbiAgICAgICAgICAgICAgICAgICAgcGFnZUlkLFxuICAgICAgICAgICAgICAgICAgICBpICsgMSxcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suYmxvY2tUeXBlLFxuICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaGVldDogc2hlZXQudGFiTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBibG9jay50aXRsZVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3JlYXRlZC5wdXNoKHtcbiAgICAgICAgICAgICAgICBzbHVnLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBzaGVldC50aXRsZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXV0by1wb3B1bGF0ZSBuYXZpZ2F0aW9uX2l0ZW1zOiBhZGQgZWFjaCBzaGVldCBwYWdlIGFzIGEgY2hpbGQgb2YgdGhlIFwiRXhjZWxcIiBmb2xkZXIuXG4gICAgICAgIC8vIEZpbmQgdGhlIEV4Y2VsIGZvbGRlciBmaXJzdCwgb3IgY3JlYXRlIGl0IGlmIGl0IGRvZXNuJ3QgZXhpc3QgeWV0LlxuICAgICAgICBjb25zdCBleGNlbEZvbGRlciA9IGF3YWl0IHF1ZXJ5Um93cyhkYiwgYFNFTEVDVCBpZCBGUk9NIG5hdmlnYXRpb25faXRlbXMgV0hFUkUgdGl0bGUgPSAkMSBBTkQgcGFyZW50X2lkIElTIE5VTEwgTElNSVQgMWAsIFtcbiAgICAgICAgICAgICdFeGNlbCdcbiAgICAgICAgXSk7XG4gICAgICAgIGxldCBleGNlbElkID0gZXhjZWxGb2xkZXJbMF0/LmlkO1xuICAgICAgICBpZiAoIWV4Y2VsSWQpIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgRXhjZWwgZm9sZGVyIGlmIGl0IGRvZXNuJ3QgZXhpc3QgeWV0XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVkID0gYXdhaXQgcXVlcnlSb3dzKGRiLCBgSU5TRVJUIElOVE8gbmF2aWdhdGlvbl9pdGVtcyAoaWQsIHBhcmVudF9pZCwgc29ydF9vcmRlciwgdGl0bGUsIHBhdGgsIGljb24sIGF1dGhfdGllciwgcmVxdWlyZWRfZ3JvdXBzLCBpc192aXNpYmxlLCBpc19keW5hbWljKVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgTlVMTCwgKFNFTEVDVCBDT0FMRVNDRShNQVgoc29ydF9vcmRlciksIDApICsgMSBGUk9NIG5hdmlnYXRpb25faXRlbXMgV0hFUkUgcGFyZW50X2lkIElTIE5VTEwpLFxuICAgICAgICAgJ0V4Y2VsJywgJy9leGNlbCcsICdGb2xkZXInLCBDQVNUKCdnb29nbGUnIEFTIFwiQXV0aFRpZXJcIiksICd2aWV3ZXIsb3BzLWFkbWluLGZpbmFuY2UscGxhdGZvcm0tYWRtaW4nLCB0cnVlLCB0cnVlKVxuICAgICAgICAgUkVUVVJOSU5HIGlkYCk7XG4gICAgICAgICAgICBleGNlbElkID0gY3JlYXRlZFswXT8uaWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4Y2VsSWQpIHtcbiAgICAgICAgICAgIGxldCBuYXZTb3J0ID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2hlZXQgb2YgY29tcHJlaGVuc2lvbi5zaGVldHMpe1xuICAgICAgICAgICAgICAgIGNvbnN0IHNsdWcgPSBgc2hlZXQtJHtub3JtYWxpemVTbHVnKHNoZWV0LnRhYk5hbWUpfWA7XG4gICAgICAgICAgICAgICAgLy8gU2tpcCBpZiBhbHJlYWR5IHByZXNlbnRcbiAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IHF1ZXJ5Um93cyhkYiwgYFNFTEVDVCBpZCBGUk9NIG5hdmlnYXRpb25faXRlbXMgV0hFUkUgcGF0aCA9ICQxIEFORCBwYXJlbnRfaWQgPSAkMiBMSU1JVCAxYCwgW1xuICAgICAgICAgICAgICAgICAgICBgLyR7c2x1Z31gLFxuICAgICAgICAgICAgICAgICAgICBleGNlbElkXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gbmF2aWdhdGlvbl9pdGVtcyAoaWQsIHBhcmVudF9pZCwgc29ydF9vcmRlciwgdGl0bGUsIHBhdGgsIGljb24sIGF1dGhfdGllciwgcmVxdWlyZWRfZ3JvdXBzLCBpc192aXNpYmxlLCBpc19keW5hbWljKVxuICAgICAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAkMiwgJDMsICQ0LCAnRGVzY3JpcHRpb24nLCBDQVNUKCdnb29nbGUnIEFTIFwiQXV0aFRpZXJcIiksICcnLCB0cnVlLCB0cnVlKWAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2VsSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYXZTb3J0KyssXG4gICAgICAgICAgICAgICAgICAgICAgICBzaGVldC50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGAvJHtzbHVnfWBcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNyZWF0ZWQ7XG59XG4vKiogVXBzZXJ0IGtub3dsZWRnZSBzbmlwcGV0cyAoZnVsbCBjb21wcmVoZW5zaW9uICsgcGVyLXNoZWV0IG1hcmtkb3duKS4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVTbmlwcGV0c1N0ZXAoY29tcHJlaGVuc2lvbiwgbW9kZWwsIGRiVXJsKSB7XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgLy8gUmF3IGNvbXByZWhlbnNpb24gSlNPTiAodXNlZCBieSBBSSBjaGF0IC8gcmVwcm9jZXNzKS5cbiAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY2F0ZWdvcnksIGNvbnRlbnQpXG4gICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICdkb2N1bWVudCcsICQyKVxuICAgICAgIE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQ7YCwgW1xuICAgICAgICAgICAgJ3dvcmtib29rX2NvbXByZWhlbnNpb24nLFxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIGNvbXByZWhlbmRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgY29tcHJlaGVuc2lvblxuICAgICAgICAgICAgfSlcbiAgICAgICAgXSk7XG4gICAgICAgIGNvdW50Kys7XG4gICAgICAgIC8vIE9uZSBodW1hbi1yZWFkYWJsZSBzbmlwcGV0IHBlciBzaGVldC5cbiAgICAgICAgZm9yIChjb25zdCBzaGVldCBvZiBjb21wcmVoZW5zaW9uLnNoZWV0cyl7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBgc2hlZXRfJHtub3JtYWxpemVTbHVnKHNoZWV0LnRhYk5hbWUpfWA7XG4gICAgICAgICAgICBjb25zdCBtYXJrZG93biA9IFtcbiAgICAgICAgICAgICAgICBgIyAke3NoZWV0LnRpdGxlfWAsXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgc2hlZXQuc3VtbWFyeSxcbiAgICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgICBgKipDYXRlZ29yeSoqOiAke3NoZWV0LmNhdGVnb3J5fWAsXG4gICAgICAgICAgICAgICAgc2hlZXQucGVyaW9kSGludCA/IGAqKlBlcmlvZCoqOiAke3NoZWV0LnBlcmlvZEhpbnR9YCA6ICcnXG4gICAgICAgICAgICBdLmZpbHRlcigobCk9PmwgIT09ICcnKS5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBrbm93bGVkZ2Vfc25pcHBldHMgKGlkLCBrZXksIGNhdGVnb3J5LCBjb250ZW50KVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICdzaGVldCcsICQyKVxuICAgICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudDtgLCBbXG4gICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgIG1hcmtkb3duXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY291bnQ7XG59XG4vKipcbiAqIERldGVybWluaXN0aWMgdGVtcGxhdGUtZml0IHNjb3JpbmcgKFx1MDBBNzUuNSkuXG4gKlxuICogU2NvcmVzIHRoZSBBSS1zdWdnZXN0ZWQgdGVtcGxhdGUgYWdhaW5zdCB0aGUgY29tcHJlaGVuZGVkIHNoZWV0IGNhdGVnb3JpZXMuXG4gKiBObyBleHRlcm5hbCBpbXBvcnRzIFx1MjAxNCBhbGwgdGVtcGxhdGUgZGF0YSBpcyBoYXJkY29kZWQgdG8ga2VlcCB0aGUgYnVuZGxlIGxlYW4uXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbGVjdFRlbXBsYXRlU3RlcChjb21wcmVoZW5zaW9uKSB7XG4gICAgY29uc3QgYWlUZW1wbGF0ZSA9IGNvbXByZWhlbnNpb24udGVtcGxhdGU7XG4gICAgY29uc3QgYWlDb25maWRlbmNlID0gYWlUZW1wbGF0ZT8uY29uZmlkZW5jZSA/PyAwLjU7XG4gICAgY29uc3Qgc2hlZXRDYXRlZ29yaWVzID0gY29tcHJlaGVuc2lvbi5zaGVldHMubWFwKChzKT0+cy5jYXRlZ29yeSk7XG4gICAgLy8gQ2F0ZWdvcnkgcHJvZmlsZSBwZXIgdGVtcGxhdGUgKHdoaWNoIHNoZWV0IGNhdGVnb3JpZXMgbWF0Y2ggYmVzdCkuXG4gICAgY29uc3QgdGVtcGxhdGVQcm9maWxlcyA9IHtcbiAgICAgICAgJ2ZpbmFuY2lhbC1hbmFseXRpY3MnOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgICAgICAgICAgICAgJ2JyZWFrX2V2ZW4nLFxuICAgICAgICAgICAgICAgICd2YXJpYW5jZScsXG4gICAgICAgICAgICAgICAgJ3RyaWFsX2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdzdW1tYXJ5X3BsJyxcbiAgICAgICAgICAgICAgICAnc3VtbWFyeV9icydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdmaW5hbmNpYWwnLFxuICAgICAgICAgICAgICAgICdwbmwnLFxuICAgICAgICAgICAgICAgICdwcm9maXQnLFxuICAgICAgICAgICAgICAgICdsb3NzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2JyZWFrIGV2ZW4nLFxuICAgICAgICAgICAgICAgICdiZXAnLFxuICAgICAgICAgICAgICAgICd2YXJpYW5jZSdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgcmVzdGF1cmFudDoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdkYWlseV9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JyZWFrX2V2ZW4nLFxuICAgICAgICAgICAgICAgICdtb250aF9vbl9tb250aCdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdyZXN0YXVyYW50JyxcbiAgICAgICAgICAgICAgICAna2l0Y2hlbicsXG4gICAgICAgICAgICAgICAgJ21lbnUnLFxuICAgICAgICAgICAgICAgICdmb29kJyxcbiAgICAgICAgICAgICAgICAnYmV2ZXJhZ2UnLFxuICAgICAgICAgICAgICAgICdjb3ZlcnMnLFxuICAgICAgICAgICAgICAgICdndWVzdHMnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIGhvdGVsOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ2RhaWx5X3NhbGVzJyxcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdtb250aF9vbl9tb250aCcsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnaG90ZWwnLFxuICAgICAgICAgICAgICAgICdyb29tcycsXG4gICAgICAgICAgICAgICAgJ29jY3VwYW5jeScsXG4gICAgICAgICAgICAgICAgJ3JldnBhcicsXG4gICAgICAgICAgICAgICAgJ2hvdXNla2VlcGluZydcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgJ2Vjb21tZXJjZS1yZXRhaWwnOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ2RhaWx5X3NhbGVzJyxcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJyxcbiAgICAgICAgICAgICAgICAndmFyaWFuY2UnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnZWNvbW1lcmNlJyxcbiAgICAgICAgICAgICAgICAncmV0YWlsJyxcbiAgICAgICAgICAgICAgICAnb25saW5lJyxcbiAgICAgICAgICAgICAgICAnc2t1JyxcbiAgICAgICAgICAgICAgICAnY2FydCcsXG4gICAgICAgICAgICAgICAgJ2NvbnZlcnNpb24nXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIGhlYWx0aGNhcmU6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdoZWFsdGgnLFxuICAgICAgICAgICAgICAgICdwYXRpZW50JyxcbiAgICAgICAgICAgICAgICAnY2xpbmljJyxcbiAgICAgICAgICAgICAgICAnbWVkaWNhbCcsXG4gICAgICAgICAgICAgICAgJ3BoYXJtYWN5J1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICAnc3VwcGx5LWNoYWluJzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICAgICAgICAgICAgICd2YXJpYW5jZScsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnc3VwcGx5JyxcbiAgICAgICAgICAgICAgICAnbG9naXN0aWNzJyxcbiAgICAgICAgICAgICAgICAnaW52ZW50b3J5JyxcbiAgICAgICAgICAgICAgICAnd2FyZWhvdXNlJyxcbiAgICAgICAgICAgICAgICAnc2hpcHBpbmcnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgICdyZWFsLWVzdGF0ZSc6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgICAgICAgICAnc3VtbWFyeV9icydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdyZWFsIGVzdGF0ZScsXG4gICAgICAgICAgICAgICAgJ3Byb3BlcnR5JyxcbiAgICAgICAgICAgICAgICAnbGVhc2UnLFxuICAgICAgICAgICAgICAgICdyZW50JyxcbiAgICAgICAgICAgICAgICAnbW9ydGdhZ2UnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIGVkdWNhdGlvbjoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ21vbnRoX29uX21vbnRoJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2VkdWNhdGlvbicsXG4gICAgICAgICAgICAgICAgJ3N0dWRlbnQnLFxuICAgICAgICAgICAgICAgICd0dWl0aW9uJyxcbiAgICAgICAgICAgICAgICAnY291cnNlJyxcbiAgICAgICAgICAgICAgICAnZW5yb2xsbWVudCdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgJ3Byb2Zlc3Npb25hbC1zZXJ2aWNlcyc6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdjb25zdWx0aW5nJyxcbiAgICAgICAgICAgICAgICAnc2VydmljZXMnLFxuICAgICAgICAgICAgICAgICdiaWxsaW5nJyxcbiAgICAgICAgICAgICAgICAnY2xpZW50JyxcbiAgICAgICAgICAgICAgICAncHJvamVjdCdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgbWFudWZhY3R1cmluZzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgICAgICAgICAndmFyaWFuY2UnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnbWFudWZhY3R1cmluZycsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3Rpb24nLFxuICAgICAgICAgICAgICAgICdmYWN0b3J5JyxcbiAgICAgICAgICAgICAgICAnYmlsbCBvZiBtYXRlcmlhbHMnLFxuICAgICAgICAgICAgICAgICd3b3JrIG9yZGVyJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBjYXRlZ29yeU92ZXJsYXAodG1wbElkKSB7XG4gICAgICAgIGNvbnN0IHByb2ZpbGUgPSB0ZW1wbGF0ZVByb2ZpbGVzW3RtcGxJZF07XG4gICAgICAgIGlmICghcHJvZmlsZSkgcmV0dXJuIDA7XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBzaGVldENhdGVnb3JpZXMuZmlsdGVyKChjKT0+cHJvZmlsZS5jYXRlZ29yaWVzLmluY2x1ZGVzKGMpKTtcbiAgICAgICAgcmV0dXJuIHNoZWV0Q2F0ZWdvcmllcy5sZW5ndGggPiAwID8gbWF0Y2hlcy5sZW5ndGggLyBzaGVldENhdGVnb3JpZXMubGVuZ3RoIDogMDtcbiAgICB9XG4gICAgZnVuY3Rpb24ga2V5d29yZE1hdGNoKHRtcGxJZCkge1xuICAgICAgICBjb25zdCBwcm9maWxlID0gdGVtcGxhdGVQcm9maWxlc1t0bXBsSWRdO1xuICAgICAgICBpZiAoIXByb2ZpbGUpIHJldHVybiAwO1xuICAgICAgICBjb25zdCB0ZXh0ID0gW1xuICAgICAgICAgICAgY29tcHJlaGVuc2lvbi53b3JrYm9vay50aXRsZSxcbiAgICAgICAgICAgIGNvbXByZWhlbnNpb24ud29ya2Jvb2suc3VtbWFyeSxcbiAgICAgICAgICAgIGNvbXByZWhlbnNpb24ud29ya2Jvb2suY29tcGFueSA/PyAnJ1xuICAgICAgICBdLmpvaW4oJyAnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBtYXRjaGVzID0gcHJvZmlsZS5rZXl3b3Jkcy5maWx0ZXIoKGt3KT0+dGV4dC5pbmNsdWRlcyhrdykpO1xuICAgICAgICByZXR1cm4gcHJvZmlsZS5rZXl3b3Jkcy5sZW5ndGggPiAwID8gbWF0Y2hlcy5sZW5ndGggLyBwcm9maWxlLmtleXdvcmRzLmxlbmd0aCA6IDA7XG4gICAgfVxuICAgIC8vIFNjb3JlIHRoZSBBSS1zdWdnZXN0ZWQgdGVtcGxhdGUuXG4gICAgY29uc3Qgc3VnZ2VzdGVkU2NvcmUgPSBhaVRlbXBsYXRlPy5pZCA/IGFpQ29uZmlkZW5jZSAqIChjYXRlZ29yeU92ZXJsYXAoYWlUZW1wbGF0ZS5pZCkgKiAwLjcgKyBrZXl3b3JkTWF0Y2goYWlUZW1wbGF0ZS5pZCkgKiAwLjMpIDogLTE7XG4gICAgLy8gU2NvcmUgYWxsIHRlbXBsYXRlcyBmb3IgYWx0ZXJuYXRpdmVzLlxuICAgIGNvbnN0IGFsbFNjb3JlcyA9IE9iamVjdC5rZXlzKHRlbXBsYXRlUHJvZmlsZXMpLm1hcCgoaWQpPT4oe1xuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBzY29yZTogY2F0ZWdvcnlPdmVybGFwKGlkKSAqIDAuNyArIGtleXdvcmRNYXRjaChpZCkgKiAwLjMsXG4gICAgICAgICAgICByZWFzb246IGAke01hdGgucm91bmQoY2F0ZWdvcnlPdmVybGFwKGlkKSAqIDEwMCl9JSBjYXRlZ29yeSBtYXRjaCwgJHtNYXRoLnJvdW5kKGtleXdvcmRNYXRjaChpZCkgKiAxMDApfSUga2V5d29yZCBtYXRjaGBcbiAgICAgICAgfSkpO1xuICAgIGFsbFNjb3Jlcy5zb3J0KChhLCBiKT0+Yi5zY29yZSAtIGEuc2NvcmUpO1xuICAgIGNvbnN0IHJlY29tbWVuZGVkID0gc3VnZ2VzdGVkU2NvcmUgPiBhbGxTY29yZXNbMF0uc2NvcmUgPyBhaVRlbXBsYXRlLmlkIDogYWxsU2NvcmVzWzBdLmlkO1xuICAgIGNvbnN0IHJlY29tbWVuZGVkU2NvcmUgPSByZWNvbW1lbmRlZCA9PT0gYWlUZW1wbGF0ZT8uaWQgPyBzdWdnZXN0ZWRTY29yZSA6IGFsbFNjb3Jlc1swXS5zY29yZTtcbiAgICByZXR1cm4ge1xuICAgICAgICByZWNvbW1lbmRlZCxcbiAgICAgICAgYWlTdWdnZXN0aW9uOiBhaVRlbXBsYXRlPy5pZCA/PyBudWxsLFxuICAgICAgICBhaUNvbmZpZGVuY2UsXG4gICAgICAgIHNjb3JlOiBNYXRoLnJvdW5kKHJlY29tbWVuZGVkU2NvcmUgKiAxMDApIC8gMTAwLFxuICAgICAgICByZWFzb246IGFsbFNjb3Jlc1swXS5yZWFzb24sXG4gICAgICAgIGFsdGVybmF0aXZlczogYWxsU2NvcmVzLmZpbHRlcigocyk9PnMuaWQgIT09IHJlY29tbWVuZGVkKS5zbGljZSgwLCAzKS5tYXAoKHMpPT4oe1xuICAgICAgICAgICAgICAgIGlkOiBzLmlkLFxuICAgICAgICAgICAgICAgIHNjb3JlOiBNYXRoLnJvdW5kKHMuc2NvcmUgKiAxMDApIC8gMTAwXG4gICAgICAgICAgICB9KSlcbiAgICB9O1xufVxuLyoqIEJlc3QtZWZmb3J0IHJlZ2lzdGVyIGR5bmFtaWMgcGFnZXMgaW4gdGhlIHJ1bnRpbWUgY2F0YWxvZy4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcChjb21wcmVoZW5zaW9uKSB7XG4gICAgLy8gc2V0RHluYW1pY1BhZ2VzIGlzIGEgcnVudGltZS1zaWRlIGVmZmVjdDsgaW4gdGhlIHdvcmtmbG93IGNvbnRleHQgdGhlXG4gICAgLy8gY2F0YWxvZyByZWJ1aWxkcyBmcm9tIERCIGFwcF9wYWdlcyBvbiBuZXh0IHJlcXVlc3QuIEJlc3QtZWZmb3J0LlxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgc2V0RHluYW1pY1BhZ2VzIH0gPSBhd2FpdCBpbXBvcnQoJy4uLy4uL3NyYy9saWIvcGFnZS1jYXRhbG9nJyk7XG4gICAgICAgIGNvbnN0IHBhZ2VzID0gY29tcHJlaGVuc2lvbi5zaGVldHMubWFwKChzaGVldCk9Pih7XG4gICAgICAgICAgICAgICAgc2x1ZzogYHNoZWV0LSR7bm9ybWFsaXplU2x1ZyhzaGVldC50YWJOYW1lKX1gLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBzaGVldC50aXRsZSxcbiAgICAgICAgICAgICAgICBhdXRoVGllcjogJ2dvb2dsZScsXG4gICAgICAgICAgICAgICAgbmF2TGFiZWw6IHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdkb2NfbWFya2Rvd24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBgc2hlZXRfJHtub3JtYWxpemVTbHVnKHNoZWV0LnRhYk5hbWUpfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHNoZWV0LnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC4uLihTSEVFVF9DQVRFR09SWV9CTE9DS1Nbc2hlZXQuY2F0ZWdvcnldID8/IFNIRUVUX0NBVEVHT1JZX0JMT0NLUy5vdGhlcikubWFwKChiKT0+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9ja1R5cGU6IGIuYmxvY2tUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGVldDogc2hlZXQudGFiTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGIudGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIHNldER5bmFtaWNQYWdlcyhwYWdlcyk7XG4gICAgICAgIHJldHVybiBwYWdlcy5sZW5ndGg7XG4gICAgfSBjYXRjaCAge1xuICAgICAgICAvLyBSdW50aW1lIGNhdGFsb2cgdW5hdmFpbGFibGUgaW4gd29ya2Zsb3cgY29udGV4dCBcdTIwMTQgbm9uLWNyaXRpY2FsLlxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG59XG4vLyBcdTI1MDBcdTI1MDAgUGhhc2UgNTogR0VORVJBVEUgc3RlcHMgKE9wZW5BSSBcdTIxOTIgQlIgLyBFUyAvIERhc2hib2FyZCkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vKiogUGFyc2UgQnVzaW5lc3MgUmV2aWV3IG1hcmtkb3duIGludG8gcGFydCBzZWN0aW9ucyAobGlnaHR3ZWlnaHQgaW5saW5lIHBhcnNlcikuICovIGZ1bmN0aW9uIHBhcnNlUmV2aWV3UGFydHMobWFya2Rvd24pIHtcbiAgICBjb25zdCBwYXJ0cyA9IFtdO1xuICAgIGNvbnN0IGhlYWRlclJlID0gL14jezIsM31cXHMrUGFydFxccysoW0EtWl0pOlxccyooLispJC9tO1xuICAgIGNvbnN0IHNlY3Rpb25zID0gbWFya2Rvd24uc3BsaXQoL1xcbig/PSN7MiwzfVxccytQYXJ0XFxzK1tBLVpdOikvKTtcbiAgICBsZXQgc29ydE9yZGVyID0gMDtcbiAgICBmb3IgKGNvbnN0IHNlY3Rpb24gb2Ygc2VjdGlvbnMpe1xuICAgICAgICBjb25zdCBtYXRjaCA9IGhlYWRlclJlLmV4ZWMoc2VjdGlvbik7XG4gICAgICAgIGlmICghbWF0Y2gpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBbLCBsZXR0ZXIsIHJhd1RpdGxlXSA9IG1hdGNoO1xuICAgICAgICBjb25zdCB0aXRsZSA9IChyYXdUaXRsZSA/PyBzZWN0aW9uLnNwbGl0KCdcXG4nKVswXT8ucmVwbGFjZSgvXiN7MiwzfVxccytQYXJ0XFxzK1tBLVpdOlxccyovLCAnJykgPz8gJycpLnRyaW0oKTtcbiAgICAgICAgY29uc3Qgc2x1ZyA9IGBwYXJ0LSR7KGxldHRlciA/PyAnYScpLnRvTG93ZXJDYXNlKCl9YDtcbiAgICAgICAgY29uc3QgcGFydEtleSA9IGBwYXJ0XyR7KGxldHRlciA/PyAnYScpLnRvTG93ZXJDYXNlKCl9YDtcbiAgICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgICAgICBzbHVnLFxuICAgICAgICAgICAgcGFydEtleSxcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgc29ydE9yZGVyOiBzb3J0T3JkZXIrKyxcbiAgICAgICAgICAgIG1hcmtkb3duOiBzZWN0aW9uLnRyaW0oKVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnRzO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgQnVzaW5lc3MgUmV2aWV3IGZyb20gY29tcHJlaGVuc2lvbiBkYXRhLlxuICogU2F2ZXMgcGFyc2VkIHBhcnRzIHRvIGJ1c2luZXNzX3Jldmlld19wYXJ0cyB2aWEgcGcuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlQnVzaW5lc3NSZXZpZXdTdGVwKGNvbXByZWhlbnNpb24sIGFwaUtleSwgZGJVcmwsIG1vZGVsID0gJ2dwdC00bycpIHtcbiAgICBjb25zdCBwcm9tcHQgPSBidWlsZEdlblByb21wdChjb21wcmVoZW5zaW9uLCAnYnVzaW5lc3NSZXZpZXcnKTtcbiAgICBsZXQgbWFya2Rvd247XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAnWW91IGFyZSBhIHByZWNpc2UgZmluYW5jaWFsIGFuYWx5c3QgYW5kIGJ1c2luZXNzIHdyaXRlci4gUmV0dXJuIE9OTFkgdmFsaWQgSlNPTi4nXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHByb21wdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgICAgICAgICAgICAgIG1heF90b2tlbnM6IDE2Mzg0LFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlX2Zvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnanNvbl9vYmplY3QnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgT3BlbkFJIEFQSSBlcnJvciAoJHtyZXNwb25zZS5zdGF0dXN9KWApO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGNvbnN0IHJlcGx5ID0gcmVzdWx0LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudCA/PyAnJztcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyZXBseSk7XG4gICAgICAgIG1hcmtkb3duID0gcGFyc2VkLmJ1c2luZXNzUmV2aWV3ID8/ICcnO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEJ1c2luZXNzIFJldmlldyBnZW5lcmF0aW9uIGZhaWxlZDogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgfVxuICAgIGlmICghbWFya2Rvd24udHJpbSgpKSByZXR1cm4gMDtcbiAgICBjb25zdCBwYXJ0cyA9IHBhcnNlUmV2aWV3UGFydHMobWFya2Rvd24pO1xuICAgIGxldCBzYXZlZCA9IDA7XG4gICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cyl7XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gYnVzaW5lc3NfcmV2aWV3X3BhcnRzIChpZCwgc2x1ZywgcGFydF9rZXksIHRpdGxlLCBzb3J0X29yZGVyLCBhdXRoX3RpZXIsIG1hcmtkb3duKVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICQyLCAkMywgJDQsICdnb29nbGUnLCAkNSlcbiAgICAgICAgIE9OIENPTkZMSUNUIChzbHVnKSBETyBVUERBVEUgU0VUXG4gICAgICAgICAgIHBhcnRfa2V5ID0gRVhDTFVERUQucGFydF9rZXksXG4gICAgICAgICAgIHRpdGxlID0gRVhDTFVERUQudGl0bGUsXG4gICAgICAgICAgIHNvcnRfb3JkZXIgPSBFWENMVURFRC5zb3J0X29yZGVyLFxuICAgICAgICAgICBtYXJrZG93biA9IEVYQ0xVREVELm1hcmtkb3duO2AsIFtcbiAgICAgICAgICAgICAgICBwYXJ0LnNsdWcsXG4gICAgICAgICAgICAgICAgcGFydC5wYXJ0S2V5LFxuICAgICAgICAgICAgICAgIHBhcnQudGl0bGUsXG4gICAgICAgICAgICAgICAgcGFydC5zb3J0T3JkZXIsXG4gICAgICAgICAgICAgICAgcGFydC5tYXJrZG93blxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBzYXZlZCsrO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHNhdmVkO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgRXhlY3V0aXZlIFN1bW1hcnkgZnJvbSBjb21wcmVoZW5zaW9uIGRhdGEuXG4gKiBTYXZlcyB0byBrbm93bGVkZ2Vfc25pcHBldHMgdmlhIHBnLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwKGNvbXByZWhlbnNpb24sIGFwaUtleSwgZGJVcmwsIG1vZGVsID0gJ2dwdC00bycpIHtcbiAgICBjb25zdCBwcm9tcHQgPSBidWlsZEdlblByb21wdChjb21wcmVoZW5zaW9uLCAnZXhlY3V0aXZlU3VtbWFyeScpO1xuICAgIGxldCBtYXJrZG93bjtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICdZb3UgYXJlIGEgcHJlY2lzZSBmaW5hbmNpYWwgYW5hbHlzdCBhbmQgYnVzaW5lc3Mgd3JpdGVyLiBSZXR1cm4gT05MWSB2YWxpZCBKU09OLidcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogcHJvbXB0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjMsXG4gICAgICAgICAgICAgICAgbWF4X3Rva2VuczogMTYzODQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VfZm9ybWF0OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdqc29uX29iamVjdCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBPcGVuQUkgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pYCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgY29uc3QgcmVwbHkgPSByZXN1bHQuY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50ID8/ICcnO1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJlcGx5KTtcbiAgICAgICAgbWFya2Rvd24gPSBwYXJzZWQuZXhlY3V0aXZlU3VtbWFyeSA/PyAnJztcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeGVjdXRpdmUgU3VtbWFyeSBnZW5lcmF0aW9uIGZhaWxlZDogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgfVxuICAgIGlmICghbWFya2Rvd24udHJpbSgpKSByZXR1cm4gZmFsc2U7XG4gICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBrbm93bGVkZ2Vfc25pcHBldHMgKGlkLCBrZXksIGNhdGVnb3J5LCBjb250ZW50KVxuICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICdleGVjdXRpdmVfc3VtbWFyeScsICdkb2N1bWVudCcsICQxKVxuICAgICAgIE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQ7YCwgW1xuICAgICAgICAgICAgbWFya2Rvd25cbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG59XG4vKipcbiAqIEdlbmVyYXRlIHRoZSBEYXNoYm9hcmQgRGF0YSBmcm9tIGNvbXByZWhlbnNpb24gZGF0YS5cbiAqIFNhdmVzIHRvIGtub3dsZWRnZV9zbmlwcGV0cyB2aWEgcGcuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRGFzaGJvYXJkU3RlcChjb21wcmVoZW5zaW9uLCBhcGlLZXksIGRiVXJsLCBtb2RlbCA9ICdncHQtNG8nKSB7XG4gICAgY29uc3QgcHJvbXB0ID0gYnVpbGRHZW5Qcm9tcHQoY29tcHJlaGVuc2lvbiwgJ2Rhc2hib2FyZERhdGEnKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICdZb3UgYXJlIGEgcHJlY2lzZSBmaW5hbmNpYWwgYW5hbHlzdC4gUmV0dXJuIE9OTFkgdmFsaWQgSlNPTiB3aXRoIGtleXMgXCJhY3Rpb25QaGFzZXNcIiwgXCJ0YXJnZXRSb3dzXCIsIGFuZCBcImxldmVyc1wiLidcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogcHJvbXB0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjMsXG4gICAgICAgICAgICAgICAgbWF4X3Rva2VuczogMTYzODQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VfZm9ybWF0OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdqc29uX29iamVjdCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBPcGVuQUkgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pYCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgY29uc3QgcmVwbHkgPSByZXN1bHQuY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50ID8/ICcnO1xuICAgICAgICBpZiAoIXJlcGx5KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmVwbHkpO1xuICAgICAgICBpZiAoIXBhcnNlZC5hY3Rpb25QaGFzZXMgJiYgIXBhcnNlZC50YXJnZXRSb3dzICYmICFwYXJzZWQubGV2ZXJzKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY2F0ZWdvcnksIGNvbnRlbnQpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAnZGFzaGJvYXJkX2RhdGEnLCAnZG9jdW1lbnQnLCAkMSlcbiAgICAgICAgIE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQ7YCwgW1xuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHBhcnNlZClcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAge1xuICAgICAgICAvLyBEYXNoYm9hcmQgaXMgbm9uLWNyaXRpY2FsIFx1MjAxNCBzd2FsbG93IGVycm9yc1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuLyoqXG4gKiBCdWlsZCBhIGdlbmVyYXRpb24gcHJvbXB0IGZyb20gdGhlIHdvcmtib29rIGNvbXByZWhlbnNpb24uXG4gKiBObyBleHRlcm5hbCBkZXBlbmRlbmNpZXMgXHUyMDE0IHB1cmUgY29tcHV0YXRpb24gZnJvbSB0aGUgY29tcHJlaGVuc2lvbiBzdGF0ZS5cbiAqLyBmdW5jdGlvbiBidWlsZEdlblByb21wdChjb21wcmVoZW5zaW9uLCB0YXJnZXQpIHtcbiAgICBjb25zdCB7IHdvcmtib29rLCBzaGVldHMsIHByb2plY3Rpb25zIH0gPSBjb21wcmVoZW5zaW9uO1xuICAgIGNvbnN0IGNvbnRleHQgPSBbXG4gICAgICAgIGAjIEdlbmVyYXRlZCBDb250ZW50OiAke3RhcmdldCA9PT0gJ2J1c2luZXNzUmV2aWV3JyA/ICdCdXNpbmVzcyBSZXZpZXcnIDogdGFyZ2V0ID09PSAnZXhlY3V0aXZlU3VtbWFyeScgPyAnRXhlY3V0aXZlIFN1bW1hcnknIDogJ0Rhc2hib2FyZCBEYXRhJ31gLFxuICAgICAgICAnJyxcbiAgICAgICAgYCMjIFdvcmtib29rIFN1bW1hcnlgLFxuICAgICAgICBgKipUaXRsZSoqOiAke3dvcmtib29rLnRpdGxlfWAsXG4gICAgICAgIGAqKkNvbXBhbnkqKjogJHt3b3JrYm9vay5jb21wYW55ID8/ICdOL0EnfWAsXG4gICAgICAgIGAqKlBlcmlvZCoqOiAke3dvcmtib29rLnBlcmlvZCA/PyAnTi9BJ31gLFxuICAgICAgICBgKipDdXJyZW5jeSoqOiAke3dvcmtib29rLmN1cnJlbmN5ID8/ICdJRFInfWAsXG4gICAgICAgIHdvcmtib29rLnN1bW1hcnksXG4gICAgICAgICcnLFxuICAgICAgICBgIyMgU2hlZXQgSW52ZW50b3J5ICgke3NoZWV0cy5sZW5ndGh9IHNoZWV0cylgLFxuICAgICAgICAuLi5zaGVldHMubWFwKChzKT0+YC0gKioke3MudGFiTmFtZX0qKiAoJHtzLmNhdGVnb3J5fSk6ICR7cy50aXRsZX0gXHUyMDE0ICR7cy5zdW1tYXJ5fSR7cy5wZXJpb2RIaW50ID8gYCBbJHtzLnBlcmlvZEhpbnR9XWAgOiAnJ31gKSxcbiAgICAgICAgJycsXG4gICAgICAgIGAjIyBDb25zb2xpZGF0ZWQgRmluYW5jaWFsIFByb2plY3Rpb25zYCxcbiAgICAgICAgJ2BgYGpzb24nLFxuICAgICAgICBKU09OLnN0cmluZ2lmeShwcm9qZWN0aW9ucywgbnVsbCwgMiksXG4gICAgICAgICdgYGAnXG4gICAgXS5qb2luKCdcXG4nKTtcbiAgICBpZiAodGFyZ2V0ID09PSAnYnVzaW5lc3NSZXZpZXcnKSB7XG4gICAgICAgIHJldHVybiBgJHtjb250ZXh0fVxcblxcbkdlbmVyYXRlIE9OTFkgYSBcImJ1c2luZXNzUmV2aWV3XCIgZG9jdW1lbnQgYXMgYSBKU09OIG9iamVjdCB3aXRoIGEgc2luZ2xlIGtleSBcImJ1c2luZXNzUmV2aWV3XCIgY29udGFpbmluZyBhIGNvbXByZWhlbnNpdmUgTWFya2Rvd24gYnVzaW5lc3MgcmV2aWV3LiBJbmNsdWRlIHNlY3Rpb25zIGZvciBlYWNoIHBhcnQgb2YgdGhlIGJ1c2luZXNzOiBQYXJ0IEE6IFJldmVudWUgJiBTYWxlcywgUGFydCBCOiBDb3N0cyAmIE1hcmdpbnMsIFBhcnQgQzogUHJvZml0YWJpbGl0eSAmIEVCSVREQSwgUGFydCBEOiBCcmVhay1FdmVuIEFuYWx5c2lzLCBQYXJ0IEU6IFRyZW5kcyAmIFByb2plY3Rpb25zLCBQYXJ0IEY6IFJpc2tzICYgUmVjb21tZW5kYXRpb25zLiBVc2UgIyMgUGFydCBYOiBUaXRsZSBoZWFkZXJzLiBJbmNsdWRlIGRhdGEgdGFibGVzIGZyb20gdGhlIHByb2plY3Rpb25zLmA7XG4gICAgfVxuICAgIGlmICh0YXJnZXQgPT09ICdleGVjdXRpdmVTdW1tYXJ5Jykge1xuICAgICAgICByZXR1cm4gYCR7Y29udGV4dH1cXG5cXG5HZW5lcmF0ZSBPTkxZIGFuIFwiZXhlY3V0aXZlU3VtbWFyeVwiIGRvY3VtZW50IGFzIGEgSlNPTiBvYmplY3Qgd2l0aCBhIHNpbmdsZSBrZXkgXCJleGVjdXRpdmVTdW1tYXJ5XCIgY29udGFpbmluZyBhIGNvbmNpc2UgTWFya2Rvd24gZXhlY3V0aXZlIHN1bW1hcnkgKDEtMiBwYWdlcykgaGlnaGxpZ2h0aW5nIHRoZSBrZXkgZmluYW5jaWFsIG1ldHJpY3MsIHRyZW5kcywgcmlza3MsIGFuZCBhY3Rpb25hYmxlIHJlY29tbWVuZGF0aW9ucyBmcm9tIHRoZSB3b3JrYm9vayBkYXRhLmA7XG4gICAgfVxuICAgIHJldHVybiBgJHtjb250ZXh0fVxcblxcbkdlbmVyYXRlIE9OTFkgYSBKU09OIG9iamVjdCB3aXRoIGtleXMgXCJhY3Rpb25QaGFzZXNcIiAoYXJyYXkgb2Yge3BoYXNlLCBkZXNjcmlwdGlvbn0pLCBcInRhcmdldFJvd3NcIiAoYXJyYXkgb2Yge2xhYmVsLCB2YWx1ZSwgdW5pdH0pLCBhbmQgXCJsZXZlcnNcIiAoYXJyYXkgb2Yge25hbWUsIGltcGFjdCwgYWN0aW9uc1tdfSkgYmFzZWQgb24gdGhlIGZpbmFuY2lhbCBkYXRhLiBGb2N1cyBvbiBhY3Rpb25hYmxlIG9wZXJhdGlvbmFsIHJlY29tbWVuZGF0aW9ucy5gO1xufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2xvYWRXb3JrYm9va1N0ZXBcIiwgbG9hZFdvcmtib29rU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZXh0cmFjdFNoZWV0c1N0ZXBcIiwgZXh0cmFjdFNoZWV0c1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2FuYWx5emVTaGVldHNTdGVwXCIsIGFuYWx5emVTaGVldHNTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zYXZlV29ya2Jvb2tGb3JtdWxhTWFwU3RlcFwiLCBzYXZlV29ya2Jvb2tGb3JtdWxhTWFwU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vY29tcHJlaGVuZFdvcmtib29rU3RlcFwiLCBjb21wcmVoZW5kV29ya2Jvb2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9lbWl0UHJvZ3Jlc3NTdGVwXCIsIGVtaXRQcm9ncmVzc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2Nsb3NlUHJvZ3Jlc3NTdGVwXCIsIGNsb3NlUHJvZ3Jlc3NTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9wb3B1bGF0ZVByb2plY3Rpb25zU3RlcFwiLCBwb3B1bGF0ZVByb2plY3Rpb25zU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vdXBzZXJ0U2hlZXRQYWdlc1N0ZXBcIiwgdXBzZXJ0U2hlZXRQYWdlc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NhdmVTbmlwcGV0c1N0ZXBcIiwgc2F2ZVNuaXBwZXRzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2VsZWN0VGVtcGxhdGVTdGVwXCIsIHNlbGVjdFRlbXBsYXRlU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vcmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwXCIsIHJlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXBcIiwgZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXBcIiwgZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVEYXNoYm9hcmRTdGVwXCIsIGdlbmVyYXRlRGFzaGJvYXJkU3RlcCk7XG4iLCAiLyoqXG4gKiBXb3JrYm9vayBTaGVldCBFeHRyYWN0aW9uIChkZXBlbmRlbmN5LWZyZWUpXG4gKlxuICogUHVyZSBzaGVldCBzZXJpYWxpemF0aW9uICsgc3RydWN0dXJhbCBzdGF0aXN0aWNzLiBUaGlzIG1vZHVsZSBpbnRlbnRpb25hbGx5XG4gKiBoYXMgTk8gYXBwbGljYXRpb24gYWxpYXNlcyAoYEAvLi4uYCksIG5vIHpvZCwgYW5kIG5vIE9wZW5BSSBpbXBvcnRzIHNvIHRoYXRcbiAqIGl0IGNhbiBiZSBidW5kbGVkIGludG8gVmVyY2VsIFdvcmtmbG93IHN0ZXAgYnVuZGxlcyAod29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdClcbiAqIHdpdGhvdXQgZHJhZ2dpbmcgdGhlIHdob2xlIGRvbWFpbiBsYXllciBhbG9uZy5cbiAqXG4gKiBUaGUgQUktZmlyc3QgcGlwZWxpbmUgc2VyaWFsaXplcyBldmVyeSBzaGVldCB0byBwbGFpbiB0ZXh0ICh0YWIgbmFtZSArIHJvd3MpXG4gKiBhbmQgbGV0cyB0aGUgbW9kZWwgZG8gdGhlIGNvbXByZWhlbnNpb24uIFRoZSBzdHJ1Y3R1cmFsIHN0YXRpc3RpY3MgcHJvZHVjZWRcbiAqIGhlcmUgZmVlZCBhIGRldGVybWluaXN0aWMgQU5BTFlaRSBwcmUtcGFzcyB0aGF0IGVucmljaGVzIHRoZSBBSSBwcm9tcHQuXG4gKi8gaW1wb3J0IHsgcmVhZCwgdXRpbHMgfSBmcm9tICd4bHN4JztcbmV4cG9ydCBjb25zdCBTSEVFVF9DQVRFR09SSUVTID0gW1xuICAgICdkYWlseV9zYWxlcycsXG4gICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgJ3RyaWFsX2JhbGFuY2UnLFxuICAgICdnZW5lcmFsX2xlZGdlcicsXG4gICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICdtb250aF9vbl9tb250aCcsXG4gICAgJ2JyZWFrX2V2ZW4nLFxuICAgICd2YXJpYW5jZScsXG4gICAgJ3N1bW1hcnlfcGwnLFxuICAgICdzdW1tYXJ5X2JzJyxcbiAgICAnb3RoZXInXG5dO1xuZXhwb3J0IGNvbnN0IE1BWF9TSEVFVF9ST1dTID0gNDA7XG5leHBvcnQgY29uc3QgTUFYX1NIRUVUX0NPTFMgPSAxNjtcbmV4cG9ydCBjb25zdCBNQVhfQ0VMTF9DSEFSUyA9IDgwO1xuZnVuY3Rpb24gZm9ybWF0Q2VsbCh2KSB7XG4gICAgaWYgKHYgPT0gbnVsbCkgcmV0dXJuICcnO1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgaWYgKE51bWJlci5pc0ludGVnZXIodikpIHJldHVybiBTdHJpbmcodik7XG4gICAgICAgIHJldHVybiB2LnRvRml4ZWQoMikucmVwbGFjZSgvXFwuMDAkLywgJycpO1xuICAgIH1cbiAgICBjb25zdCBzID0gU3RyaW5nKHYpLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCk7XG4gICAgcmV0dXJuIHMubGVuZ3RoID4gTUFYX0NFTExfQ0hBUlMgPyBzLnNsaWNlKDAsIE1BWF9DRUxMX0NIQVJTIC0gMSkgKyAnXHUyMDI2JyA6IHM7XG59XG5mdW5jdGlvbiByZWFkRnVsbEdyaWQoc2hlZXQpIHtcbiAgICByZXR1cm4gdXRpbHMuc2hlZXRfdG9fanNvbihzaGVldCwge1xuICAgICAgICBoZWFkZXI6IDEsXG4gICAgICAgIGRlZnZhbDogbnVsbCxcbiAgICAgICAgcmF3OiB0cnVlXG4gICAgfSk7XG59XG5mdW5jdGlvbiBjYXBHcmlkKGdyaWQsIG1heFJvd3MsIG1heENvbHMpIHtcbiAgICBjb25zdCBjYXBwZWQgPSBbXTtcbiAgICBmb3IobGV0IHIgPSAwOyByIDwgTWF0aC5taW4oZ3JpZC5sZW5ndGgsIG1heFJvd3MpOyByKyspe1xuICAgICAgICBjb25zdCByb3cgPSBncmlkW3JdID8/IFtdO1xuICAgICAgICBjb25zdCB0cmltbWVkID0gcm93LnNsaWNlKDAsIG1heENvbHMpO1xuICAgICAgICBpZiAodHJpbW1lZC5zb21lKChjKT0+YyAhPSBudWxsICYmIFN0cmluZyhjKS50cmltKCkgIT09ICcnKSkgY2FwcGVkLnB1c2godHJpbW1lZCk7XG4gICAgfVxuICAgIHJldHVybiBjYXBwZWQ7XG59XG5mdW5jdGlvbiBncmlkVG9UZXh0KGdyaWQpIHtcbiAgICBjb25zdCBsaW5lcyA9IGdyaWQubWFwKChyb3csIGkpPT57XG4gICAgICAgIGNvbnN0IGNlbGxzID0gcm93Lm1hcCgoYyk9PmZvcm1hdENlbGwoYykpO1xuICAgICAgICAvLyBUcmltIHRyYWlsaW5nIGVtcHRpZXMgZm9yIGNvbXBhY3RuZXNzXG4gICAgICAgIHdoaWxlKGNlbGxzLmxlbmd0aCA+IDAgJiYgY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV0gPT09ICcnKWNlbGxzLnBvcCgpO1xuICAgICAgICByZXR1cm4gYFIke2kgKyAxfTogJHtjZWxscy5qb2luKCcgfCAnKX1gO1xuICAgIH0pO1xuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVTdGF0cyh0YWJOYW1lLCBncmlkKSB7XG4gICAgbGV0IGNvbENvdW50ID0gMDtcbiAgICBsZXQgbnVtZXJpY0NlbGxzID0gMDtcbiAgICBsZXQgbm9uRW1wdHlDZWxscyA9IDA7XG4gICAgZm9yIChjb25zdCByb3cgb2YgZ3JpZCl7XG4gICAgICAgIGlmIChyb3cubGVuZ3RoID4gY29sQ291bnQpIGNvbENvdW50ID0gcm93Lmxlbmd0aDtcbiAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHJvdyl7XG4gICAgICAgICAgICBpZiAoY2VsbCA9PSBudWxsIHx8IFN0cmluZyhjZWxsKS50cmltKCkgPT09ICcnKSBjb250aW51ZTtcbiAgICAgICAgICAgIG5vbkVtcHR5Q2VsbHMrKztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2VsbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBudW1lcmljQ2VsbHMrKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGwgPT09ICdzdHJpbmcnICYmIC9eWy0rXT9cXGRbXFxkLixdKiQvLnRlc3QoY2VsbC50cmltKCkpKSB7XG4gICAgICAgICAgICAgICAgbnVtZXJpY0NlbGxzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGFiTmFtZSxcbiAgICAgICAgcm93Q291bnQ6IGdyaWQubGVuZ3RoLFxuICAgICAgICBjb2xDb3VudCxcbiAgICAgICAgbnVtZXJpY1JhdGlvOiBub25FbXB0eUNlbGxzID4gMCA/IG51bWVyaWNDZWxscyAvIG5vbkVtcHR5Q2VsbHMgOiAwLFxuICAgICAgICBub25FbXB0eUNlbGxzXG4gICAgfTtcbn1cbi8qKiBTZXJpYWxpemUgb25lIHdvcmtzaGVldCB0byB0ZXh0IChyb3ctbnVtYmVyZWQsIGNhcHBlZCkgZm9yIHRoZSBBSSBwcm9tcHQuICovIGV4cG9ydCBmdW5jdGlvbiByZW5kZXJTaGVldEZvckFpKHdiLCB0YWJOYW1lLCBtYXhSb3dzID0gTUFYX1NIRUVUX1JPV1MsIG1heENvbHMgPSBNQVhfU0hFRVRfQ09MUykge1xuICAgIGNvbnN0IHNoZWV0ID0gd2IuU2hlZXRzW3RhYk5hbWVdO1xuICAgIGlmICghc2hlZXQpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGdyaWQgPSBjYXBHcmlkKHJlYWRGdWxsR3JpZChzaGVldCksIG1heFJvd3MsIG1heENvbHMpO1xuICAgIGlmIChncmlkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGFiTmFtZSxcbiAgICAgICAgdGV4dDogZ3JpZFRvVGV4dChncmlkKVxuICAgIH07XG59XG4vKiogU2VyaWFsaXplIEFMTCBzaGVldHMgb2YgYSB3b3JrYm9vayB0byB0ZXh0IGJsb2Nrcy4gQWNjZXB0cyBVaW50OEFycmF5IG9yIEJ1ZmZlci4gKi8gZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckFsbFNoZWV0c0ZvckFpKGJ1Zikge1xuICAgIGNvbnN0IHdiID0gcmVhZChidWYsIHtcbiAgICAgICAgdHlwZTogJ2J1ZmZlcidcbiAgICB9KTtcbiAgICBjb25zdCBibG9ja3MgPSBbXTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygd2IuU2hlZXROYW1lcyA/PyBbXSl7XG4gICAgICAgIGNvbnN0IHJlbmRlcmVkID0gcmVuZGVyU2hlZXRGb3JBaSh3YiwgbmFtZSk7XG4gICAgICAgIGlmIChyZW5kZXJlZCkgYmxvY2tzLnB1c2gocmVuZGVyZWQpO1xuICAgIH1cbiAgICByZXR1cm4gYmxvY2tzO1xufVxuLyoqXG4gKiBTZXJpYWxpemUgQUxMIHNoZWV0cyBBTkQgY29tcHV0ZSBmdWxsLWdyaWQgc3RydWN0dXJhbCBzdGF0aXN0aWNzLlxuICogVGhpcyBpcyB0aGUgRVhUUkFDVCBvdXRwdXQgZm9yIHRoZSB3b3JrZmxvdyBwaXBlbGluZTogb25lIHBhcnNlIHBlclxuICogc2hlZXQgcHJvZHVjZXMgYm90aCB0aGUgQUkgcHJvbXB0IGJsb2NrIGFuZCB0aGUgQU5BTFlaRSBoaW50cy5cbiAqLyBleHBvcnQgZnVuY3Rpb24gZXh0cmFjdFNoZWV0c1dpdGhTdGF0cyhidWYpIHtcbiAgICBjb25zdCB3YiA9IHJlYWQoYnVmLCB7XG4gICAgICAgIHR5cGU6ICdidWZmZXInXG4gICAgfSk7XG4gICAgY29uc3Qgc2hlZXRzID0gW107XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHdiLlNoZWV0TmFtZXMgPz8gW10pe1xuICAgICAgICBjb25zdCBzaGVldCA9IHdiLlNoZWV0c1tuYW1lXTtcbiAgICAgICAgaWYgKCFzaGVldCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGZ1bGxHcmlkID0gcmVhZEZ1bGxHcmlkKHNoZWV0KTtcbiAgICAgICAgaWYgKGZ1bGxHcmlkLmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IHN0YXRzID0gY29tcHV0ZVN0YXRzKG5hbWUsIGZ1bGxHcmlkKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGdyaWRUb1RleHQoY2FwR3JpZChmdWxsR3JpZCwgTUFYX1NIRUVUX1JPV1MsIE1BWF9TSEVFVF9DT0xTKSk7XG4gICAgICAgIHNoZWV0cy5wdXNoKHtcbiAgICAgICAgICAgIHRhYk5hbWU6IG5hbWUsXG4gICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgc3RhdHNcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBzaGVldHM7XG59XG4iLCAiLyoqXG4gKiBXb3JrYm9vayBTaGVldCBBbmFseXNpcyAoZGV0ZXJtaW5pc3RpYyBwcmUtcGFzcylcbiAqXG4gKiBBIGRlcGVuZGVuY3ktZnJlZSBoZXVyaXN0aWMgcGFzcyBvdmVyIGV4dHJhY3RlZCBzaGVldHMgdGhhdCBwcm9kdWNlc1xuICogXCJBbmFseXNpc0hpbnRzXCIgXHUyMDE0IHN0cnVjdHVyZWQgY29udGV4dCB0aGF0OlxuICogICAtIGlzIGZlZCBpbnRvIHRoZSBDT01QUkVIRU5EIHByb21wdCB0byBiaWFzIHRoZSBtb2RlbCAoUGhhc2UgMiksXG4gKiAgIC0gZ2l2ZXMgdGhlIHJvdXRlIGxheWVyIGEgZmFzdCBwcmUtQUkgc3RhdHVzIChcIndlIHNlZSA0IHNoZWV0cywgbW9zdGx5XG4gKiAgICAgbnVtZXJpYywgbGlrZWx5IElEUiwgcGVyaW9kIGhpbnRzIDIwMjYtMDZcIikuXG4gKlxuICogTm8gYXBwbGljYXRpb24gYWxpYXNlcyBhbmQgbm8gZXh0ZXJuYWwgZGVwcyBcdTIwMTQgc2FmZSB0byBidW5kbGUgaW50byB0aGVcbiAqIFZlcmNlbCBXb3JrZmxvdyBzdGVwIGJ1bmRsZS5cbiAqLyBpbXBvcnQgeyBTSEVFVF9DQVRFR09SSUVTIH0gZnJvbSAnLi9leHRyYWN0LXNoZWV0cyc7XG4vLyBcdTI1MDBcdTI1MDAgSGV1cmlzdGljIHRhYmxlcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmNvbnN0IENVUlJFTkNZX1BBVFRFUk5TID0gW1xuICAgIFtcbiAgICAgICAgJ0lEUicsXG4gICAgICAgIC9cXGIoPzpJRFJ8UnBcXC4/fFJ1cGlhaClcXGIvaVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnVVNEJyxcbiAgICAgICAgL1xcYig/OlVTRHxcXCQpXFxiL1xuICAgIF0sXG4gICAgW1xuICAgICAgICAnRVVSJyxcbiAgICAgICAgL1xcYig/OkVVUnxcdTIwQUMpXFxiL1xuICAgIF0sXG4gICAgW1xuICAgICAgICAnR0JQJyxcbiAgICAgICAgL1xcYig/OkdCUHxcdTAwQTMpXFxiL1xuICAgIF1cbl07XG5jb25zdCBNT05USF9OQU1FUyA9IFtcbiAgICAnamFudWFyeScsXG4gICAgJ2ZlYnJ1YXJ5JyxcbiAgICAnbWFyY2gnLFxuICAgICdhcHJpbCcsXG4gICAgJ21heScsXG4gICAgJ2p1bmUnLFxuICAgICdqdWx5JyxcbiAgICAnYXVndXN0JyxcbiAgICAnc2VwdGVtYmVyJyxcbiAgICAnb2N0b2JlcicsXG4gICAgJ25vdmVtYmVyJyxcbiAgICAnZGVjZW1iZXInLFxuICAgICdqYW51YXJpJyxcbiAgICAnZmVicnVhcmknLFxuICAgICdtYXJldCcsXG4gICAgJ2FwcmlsJyxcbiAgICAnbWVpJyxcbiAgICAnanVuaScsXG4gICAgJ2p1bGknLFxuICAgICdhZ3VzdHVzJyxcbiAgICAnc2VwdGVtYmVyJyxcbiAgICAnb2t0b2JlcicsXG4gICAgJ25vdmVtYmVyJyxcbiAgICAnZGVzZW1iZXInXG5dO1xuZnVuY3Rpb24gcGVyaW9kUGF0dGVybnMoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgL1xcYigxOXwyMClcXGR7Mn1bLS9dKDA/WzEtOV18MVswLTJdKSg/OlstL11cXGR7MSwyfSk/XFxiL2csXG4gICAgICAgIC9cXGIoMD9bMS05XXwxWzAtMl0pWy0vXSgxOXwyMClcXGR7Mn1cXGIvZyxcbiAgICAgICAgbmV3IFJlZ0V4cChgXFxcXGIoPzoke01PTlRIX05BTUVTLmpvaW4oJ3wnKX0pXFxcXGJgLCAnZ2knKSxcbiAgICAgICAgL1xcYlFbMS00XVsgLV0/KD86MTl8MjApXFxkezJ9XFxiL2dpXG4gICAgXTtcbn1cbmNvbnN0IExBQkVMX0NBVEVHT1JZX01BUCA9IFtcbiAgICBbXG4gICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdQUk9GSVQgJiBMT1NTJyxcbiAgICAgICAgICAgICdQUk9GSVQgQU5EIExPU1MnLFxuICAgICAgICAgICAgJ0xhYmEgUnVnaScsXG4gICAgICAgICAgICAnSU5DT01FIFNUQVRFTUVOVCcsXG4gICAgICAgICAgICAnUCZMJyxcbiAgICAgICAgICAgICdFQklUREEnLFxuICAgICAgICAgICAgJ05FVCBQUk9GSVQnLFxuICAgICAgICAgICAgJ05FVCBJTkNPTUUnLFxuICAgICAgICAgICAgJ0xBQkEgQkVSU0lIJyxcbiAgICAgICAgICAgICdSVUdJJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ0JBTEFOQ0UgU0hFRVQnLFxuICAgICAgICAgICAgJ05FUkFDQScsXG4gICAgICAgICAgICAnQVNTRVQnLFxuICAgICAgICAgICAgJ0xJQUJJTElUJyxcbiAgICAgICAgICAgICdFS1VJVEFTJyxcbiAgICAgICAgICAgICdFUVVJVFknLFxuICAgICAgICAgICAgJ1RPVEFMIEFTU0VUUydcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAndHJpYWxfYmFsYW5jZScsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdUUklBTCBCQUxBTkNFJyxcbiAgICAgICAgICAgICdORVJBQ0EgU0FMRE8nXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ2dlbmVyYWxfbGVkZ2VyJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ0dFTkVSQUwgTEVER0VSJyxcbiAgICAgICAgICAgICdCVUtVIEJFU0FSJyxcbiAgICAgICAgICAgICdKVVJOQUwnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnQ09TVCBPRiBTQUxFUycsXG4gICAgICAgICAgICAnQ09HUycsXG4gICAgICAgICAgICAnSEFSR0EgUE9LT0snLFxuICAgICAgICAgICAgJ0ZPT0QgQ09TVCcsXG4gICAgICAgICAgICAnQkVWRVJBR0UgQ09TVCdcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnYnJlYWtfZXZlbicsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdCUkVBSyBFVkVOJyxcbiAgICAgICAgICAgICdCUkVBSy1FVkVOJyxcbiAgICAgICAgICAgICdCRVAnLFxuICAgICAgICAgICAgJ1RJVElLIElNUEFTJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdkYWlseV9zYWxlcycsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdEQUlMWSBTQUxFUycsXG4gICAgICAgICAgICAnUEVOSlVBTEFOIEhBUklBTicsXG4gICAgICAgICAgICAnT01aRVQnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ21vbnRoX29uX21vbnRoJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ01PTlRIIE9OIE1PTlRIJyxcbiAgICAgICAgICAgICdNT00nLFxuICAgICAgICAgICAgJ0JVTEFOQU4nXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ3ZhcmlhbmNlJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ1ZBUklBTkNFJyxcbiAgICAgICAgICAgICdWQVJJQU5TSScsXG4gICAgICAgICAgICAnU0VMSVNJSCcsXG4gICAgICAgICAgICAnQUNUVUFMIFZTIEJVREdFVCcsXG4gICAgICAgICAgICAnQUNUVUFMIFZTJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdzdW1tYXJ5X3BsJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ1NVTU1BUlkgUCZMJyxcbiAgICAgICAgICAgICdSSU5HS0FTQU4gTEFCQSBSVUdJJyxcbiAgICAgICAgICAgICdTVU1NQVJZIFBST0ZJVCdcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnc3VtbWFyeV9icycsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdTVU1NQVJZIEJBTEFOQ0UnLFxuICAgICAgICAgICAgJ1JJTkdLQVNBTiBORVJBQ0EnXG4gICAgICAgIF1cbiAgICBdXG5dO1xuZnVuY3Rpb24gY29sbGVjdEhpbnRzKHRleHQpIHtcbiAgICBjb25zdCBjdXJyZW5jeSA9IFtdO1xuICAgIGZvciAoY29uc3QgW25hbWUsIHJlXSBvZiBDVVJSRU5DWV9QQVRURVJOUyl7XG4gICAgICAgIGlmIChyZS50ZXN0KHRleHQpKSBjdXJyZW5jeS5wdXNoKG5hbWUpO1xuICAgIH1cbiAgICBjb25zdCBwZXJpb2RzID0gW107XG4gICAgZm9yIChjb25zdCByZSBvZiBwZXJpb2RQYXR0ZXJucygpKXtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHRleHQubWF0Y2gocmUpO1xuICAgICAgICBpZiAobWF0Y2hlcykgcGVyaW9kcy5wdXNoKC4uLm1hdGNoZXMpO1xuICAgIH1cbiAgICBjb25zdCBsYWJlbHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IFssIHRlcm1zXSBvZiBMQUJFTF9DQVRFR09SWV9NQVApe1xuICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybXMpe1xuICAgICAgICAgICAgaWYgKHRleHQudG9VcHBlckNhc2UoKS5pbmNsdWRlcyh0ZXJtLnRvVXBwZXJDYXNlKCkpKSBsYWJlbHMucHVzaCh0ZXJtKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW5jeSxcbiAgICAgICAgcGVyaW9kcyxcbiAgICAgICAgbGFiZWxzXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGd1ZXNzQ2F0ZWdvcnkobGFiZWxzKSB7XG4gICAgY29uc3Qgc2NvcmVzID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgW2NhdGVnb3J5LCB0ZXJtc10gb2YgTEFCRUxfQ0FURUdPUllfTUFQKXtcbiAgICAgICAgbGV0IHNjb3JlID0gMDtcbiAgICAgICAgZm9yIChjb25zdCB0ZXJtIG9mIHRlcm1zKXtcbiAgICAgICAgICAgIGlmIChsYWJlbHMuaW5jbHVkZXModGVybSkpIHNjb3JlICs9IHRlcm0ubGVuZ3RoOyAvLyBsb25nZXIgdGVybXMgYXJlIG1vcmUgc3BlY2lmaWNcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NvcmUgPiAwKSBzY29yZXMuc2V0KGNhdGVnb3J5LCBzY29yZSk7XG4gICAgfVxuICAgIGlmIChzY29yZXMuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3Qgc29ydGVkID0gW1xuICAgICAgICAuLi5zY29yZXMuZW50cmllcygpXG4gICAgXS5zb3J0KChhLCBiKT0+YlsxXSAtIGFbMV0pO1xuICAgIGlmIChzb3J0ZWQubGVuZ3RoID4gMSAmJiBzb3J0ZWRbMF1bMV0gPT09IHNvcnRlZFsxXVsxXSkgcmV0dXJuIG51bGw7IC8vIHRpZSBcdTIxOTIgYW1iaWd1b3VzXG4gICAgcmV0dXJuIHNvcnRlZFswXVswXTtcbn1cbmZ1bmN0aW9uIGJlc3RHdWVzcyh2YWx1ZXMpIHtcbiAgICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgY291bnRzID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgdiBvZiB2YWx1ZXMpY291bnRzLnNldCh2LCAoY291bnRzLmdldCh2KSA/PyAwKSArIDEpO1xuICAgIHJldHVybiBbXG4gICAgICAgIC4uLmNvdW50cy5lbnRyaWVzKClcbiAgICBdLnNvcnQoKGEsIGIpPT5iWzFdIC0gYVsxXSlbMF1bMF07XG59XG4vLyBcdTI1MDBcdTI1MDAgUHVibGljIEFQSSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8qKiBBbmFseXplIGV4dHJhY3RlZCBzaGVldHMgKEVYVFJBQ1Qgb3V0cHV0KSBpbnRvIGRldGVybWluaXN0aWMgaGludHMuICovIGV4cG9ydCBmdW5jdGlvbiBhbmFseXplU2hlZXRzKHNoZWV0cykge1xuICAgIGNvbnN0IHNoZWV0SGludHMgPSBzaGVldHMubWFwKChzKT0+e1xuICAgICAgICBjb25zdCB7IGN1cnJlbmN5LCBwZXJpb2RzLCBsYWJlbHMgfSA9IGNvbGxlY3RIaW50cyhzLnRleHQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGFiTmFtZTogcy50YWJOYW1lLFxuICAgICAgICAgICAgcm93Q291bnQ6IHMuc3RhdHMucm93Q291bnQsXG4gICAgICAgICAgICBjb2xDb3VudDogcy5zdGF0cy5jb2xDb3VudCxcbiAgICAgICAgICAgIG51bWVyaWNSYXRpbzogcy5zdGF0cy5udW1lcmljUmF0aW8sXG4gICAgICAgICAgICBjdXJyZW5jeUhpbnRzOiBjdXJyZW5jeSxcbiAgICAgICAgICAgIHBlcmlvZEhpbnRzOiBwZXJpb2RzLFxuICAgICAgICAgICAgbGFiZWxIaW50czogbGFiZWxzLFxuICAgICAgICAgICAgbGlrZWx5Q2F0ZWdvcnk6IGd1ZXNzQ2F0ZWdvcnkobGFiZWxzKVxuICAgICAgICB9O1xuICAgIH0pO1xuICAgIGNvbnN0IHRvdGFsUm93cyA9IHNoZWV0SGludHMucmVkdWNlKChhY2MsIHMpPT5hY2MgKyBzLnJvd0NvdW50LCAwKTtcbiAgICBjb25zdCB0b3RhbE5vbkVtcHR5Q2VsbHMgPSBzaGVldHMucmVkdWNlKChhY2MsIHMpPT5hY2MgKyBzLnN0YXRzLm5vbkVtcHR5Q2VsbHMsIDApO1xuICAgIGNvbnN0IHdlaWdodGVkTnVtZXJpYyA9IHNoZWV0cy5yZWR1Y2UoKGFjYywgcyk9PmFjYyArIHMuc3RhdHMubnVtZXJpY1JhdGlvICogcy5zdGF0cy5ub25FbXB0eUNlbGxzLCAwKTtcbiAgICBjb25zdCBhbGxDdXJyZW5jeSA9IHNoZWV0SGludHMuZmxhdE1hcCgocyk9PnMuY3VycmVuY3lIaW50cyk7XG4gICAgY29uc3QgYWxsUGVyaW9kcyA9IHNoZWV0SGludHMuZmxhdE1hcCgocyk9PnMucGVyaW9kSGludHMpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHdvcmtib29rOiB7XG4gICAgICAgICAgICBzaGVldENvdW50OiBzaGVldHMubGVuZ3RoLFxuICAgICAgICAgICAgdG90YWxSb3dzLFxuICAgICAgICAgICAgdG90YWxOb25FbXB0eUNlbGxzLFxuICAgICAgICAgICAgb3ZlcmFsbE51bWVyaWNSYXRpbzogdG90YWxOb25FbXB0eUNlbGxzID4gMCA/IHdlaWdodGVkTnVtZXJpYyAvIHRvdGFsTm9uRW1wdHlDZWxscyA6IDAsXG4gICAgICAgICAgICBjdXJyZW5jeUd1ZXNzOiBiZXN0R3Vlc3MoYWxsQ3VycmVuY3kpLFxuICAgICAgICAgICAgcGVyaW9kR3Vlc3M6IGJlc3RHdWVzcyhhbGxQZXJpb2RzKVxuICAgICAgICB9LFxuICAgICAgICBzaGVldHM6IHNoZWV0SGludHNcbiAgICB9O1xufVxuZXhwb3J0IHsgU0hFRVRfQ0FURUdPUklFUyB9O1xuIiwgIi8qKlxuICogV29ya2Jvb2sgQ29tcHJlaGVuc2lvbiBcdTIwMTQgYnVuZGxlLWxlYW4gT3BlbkFJIGNhbGxcbiAqXG4gKiBUaGlzIG1vZHVsZSBjb250YWlucyBPTkxZIHRoZSBjb21wcmVoZW5zaW9uIHJlcXVlc3QgcGF0aDogWm9kIHNjaGVtYXMsXG4gKiBwcm9tcHQgYnVpbGRpbmcgKGhpbnRzLWF3YXJlKSwgYSBzaW5nbGUtYXR0ZW1wdCBPcGVuQUkgY2FsbCB3aXRoIHR5cGVkXG4gKiBlcnJvcnMsIGFuZCByZXNwb25zZSBwYXJzaW5nLlxuICpcbiAqIEJ1bmRsZSBjb25zdHJhaW50czpcbiAqICAgLSBOTyBhcHBsaWNhdGlvbiBhbGlhc2VzIChgQC8uLi5gKSBcdTIwMTQgb25seSBgem9kYCArIHJlbGF0aXZlIGltcG9ydHMuXG4gKiAgIC0gTm8gREIgLyBzZWNyZXRzIC8gUHJpc21hIFx1MjAxNCB0aGUgQVBJIGtleSBpcyBwYXNzZWQgaW4gZXhwbGljaXRseS5cbiAqICAgLSBTYWZlIHRvIGJ1bmRsZSBpbnRvIFZlcmNlbCBXb3JrZmxvdyBzdGVwIGJ1bmRsZXMgKHdvcmtmbG93cy8qKS5cbiAqXG4gKiBUaGUgc3luYyBwaXBlbGluZSB3cmFwcGVyIChgY29tcHJlaGVuZFdvcmtib29rYCBpbiB3b3JrYm9vay1jb21wcmVoZW5zaW9uLnRzKVxuICoga2VlcHMgaXRzIG93biBrZXkgcmVzb2x1dGlvbiArIDItYXR0ZW1wdCByZXRyeSBsb29wIGZvciB0aGUgbm9uLXdvcmtmbG93XG4gKiBwYXRoOyB0aGlzIG1vZHVsZSBpcyB0aGUgc2hhcmVkIHNpbmdsZS1hdHRlbXB0IGNvcmUuXG4gKi8gaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBTSEVFVF9DQVRFR09SSUVTIH0gZnJvbSAnLi9leHRyYWN0LXNoZWV0cyc7XG4vLyBcdTI1MDBcdTI1MDAgWm9kIHZhbGlkYXRpb24gc2NoZW1hIGZvciB0aGUgQUkgc3RydWN0dXJlZCBvdXRwdXQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5leHBvcnQgY29uc3QgTWV0cmljU2NoZW1hID0gei5vYmplY3Qoe1xuICAgIC8qKiBQZXJpb2QgaW4gWVlZWS1NTSAoYW5udWFsIHRvdGFscyBtYXkgdXNlIFlZWVktMTIpLiAqLyBwZXJpb2Q6IHouc3RyaW5nKCkucmVnZXgoL15cXGR7NH0tXFxkezJ9JC8pLFxuICAgIGRhdGFUeXBlOiB6LmVudW0oW1xuICAgICAgICAnYWN0dWFsJyxcbiAgICAgICAgJ2ZvcmVjYXN0J1xuICAgIF0pLFxuICAgIHNjZW5hcmlvOiB6LmVudW0oW1xuICAgICAgICAnYWN0dWFsJyxcbiAgICAgICAgJ2NvbnNlcnZhdGl2ZScsXG4gICAgICAgICdyZWFsaXN0aWMnLFxuICAgICAgICAnYXNwaXJhdGlvbmFsJ1xuICAgIF0pLFxuICAgIHJldmVudWU6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgIGViaXRkYTogei5udW1iZXIoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgbmV0SW5jb21lOiB6Lm51bWJlcigpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICBndWVzdHM6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgIHN0YWZmQ29zdDogei5udW1iZXIoKS5udWxsYWJsZSgpLm9wdGlvbmFsKClcbn0pO1xuZXhwb3J0IGNvbnN0IFNoZWV0Q29tcHJlaGVuc2lvblNjaGVtYSA9IHoub2JqZWN0KHtcbiAgICAvKiogRXhhY3QgdGFiIG5hbWUgYXMgaXQgYXBwZWFycyBpbiB0aGUgd29ya2Jvb2suICovIHRhYk5hbWU6IHouc3RyaW5nKCksXG4gICAgY2F0ZWdvcnk6IHouZW51bShTSEVFVF9DQVRFR09SSUVTKSxcbiAgICAvKiogSHVtYW4tcmVhZGFibGUgdGl0bGUgZm9yIHRoZSBkeW5hbWljIHBhZ2UuICovIHRpdGxlOiB6LnN0cmluZygpLFxuICAgIC8qKiBPbmUtcGFyYWdyYXBoIGNvbXByZWhlbnNpb24gb2Ygd2hhdCB0aGlzIHNoZWV0IGNvbnRhaW5zLiAqLyBzdW1tYXJ5OiB6LnN0cmluZygpLFxuICAgIC8qKiBEZXRlY3RlZCBwZXJpb2QsIGUuZy4gXCJKdW5lIDIwMjZcIiBcdTIwMTQgbnVsbCB3aGVuIG5vdCBkZXRlY3RhYmxlLiAqLyBwZXJpb2RIaW50OiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAvKiogQ29sdW1uIGhlYWRlcnMgKGZpcnN0IG1lYW5pbmdmdWwgcm93KS4gKi8gY29sdW1uczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLFxuICAgIHJvd0NvdW50OiB6Lm51bWJlcigpLmludCgpLm5vbm5lZ2F0aXZlKCkub3B0aW9uYWwoKSxcbiAgICAvKiogUGVyLXBlcmlvZCBtZXRyaWNzIGZvdW5kIG9uIFRISVMgc2hlZXQuICovIG1ldHJpY3M6IHouYXJyYXkoTWV0cmljU2NoZW1hKS5vcHRpb25hbCgpXG59KTtcbmV4cG9ydCBjb25zdCBXb3JrYm9va0NvbXByZWhlbnNpb25TY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgd29ya2Jvb2s6IHoub2JqZWN0KHtcbiAgICAgICAgdGl0bGU6IHouc3RyaW5nKCksXG4gICAgICAgIGNvbXBhbnk6IHouc3RyaW5nKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgICAgICBwZXJpb2Q6IHouc3RyaW5nKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgICAgICBjdXJyZW5jeTogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgICAgIHN1bW1hcnk6IHouc3RyaW5nKClcbiAgICB9KSxcbiAgICBzaGVldHM6IHouYXJyYXkoU2hlZXRDb21wcmVoZW5zaW9uU2NoZW1hKSxcbiAgICAvKipcbiAgICogTm9ybWFsaXplZCBmaW5hbmNpYWwgcHJvamVjdGlvbnMgY29uc29saWRhdGVkIGFjcm9zcyBBTEwgc2hlZXRzLlxuICAgKiBUaGlzIGlzIHRoZSBzb3VyY2UgZm9yIHRoZSBmaW5hbmNpYWxfcHJvamVjdGlvbnMgdGFibGUuXG4gICAqLyBwcm9qZWN0aW9uczogei5hcnJheShNZXRyaWNTY2hlbWEpLFxuICAgIC8qKlxuICAgKiBUZW1wbGF0ZSBzdWdnZXN0aW9uIGZyb20gdGhlIGF2YWlsYWJsZSB0ZW1wbGF0ZSBjYXRhbG9nXG4gICAqIChURU1QTEFURV9DQVRBTE9HIGlkcywgZS5nLiBcImZpbmFuY2lhbC1hbmFseXRpY3NcIiwgXCJyZXN0YXVyYW50XCIpLlxuICAgKi8gdGVtcGxhdGU6IHoub2JqZWN0KHtcbiAgICAgICAgaWQ6IHouc3RyaW5nKCksXG4gICAgICAgIGNvbmZpZGVuY2U6IHoubnVtYmVyKCkubWluKDApLm1heCgxKS5vcHRpb25hbCgpLFxuICAgICAgICByZWFzb246IHouc3RyaW5nKCkub3B0aW9uYWwoKVxuICAgIH0pLm9wdGlvbmFsKClcbn0pO1xuLy8gXHUyNTAwXHUyNTAwIFR5cGVkIGVycm9ycyAobWFwcGVkIHRvIHRoZSB3b3JrZmxvdyByZXRyeSBwb2xpY3kgYnkgdGhlIGNhbGxlcikgXHUyNTAwXG5leHBvcnQgY2xhc3MgQ29tcHJlaGVuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG9wdGlvbnMpe1xuICAgICAgICBzdXBlcihtZXNzYWdlLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0NvbXByZWhlbmRFcnJvcic7XG4gICAgfVxufVxuLyoqIEhUVFAtbGV2ZWwgZmFpbHVyZSAobm9uLTJ4eCkuIENhcnJpZXMgc3RhdHVzICsgb3B0aW9uYWwgUmV0cnktQWZ0ZXIuICovIGV4cG9ydCBjbGFzcyBDb21wcmVoZW5kSHR0cEVycm9yIGV4dGVuZHMgQ29tcHJlaGVuZEVycm9yIHtcbiAgICBzdGF0dXM7XG4gICAgLyoqIFJldHJ5LUFmdGVyIGhlYWRlciB2YWx1ZSBpbiBzZWNvbmRzLCB3aGVuIHByZXNlbnQuICovIHJldHJ5QWZ0ZXJTZWNvbmRzO1xuICAgIGNvbnN0cnVjdG9yKHN0YXR1cywgbWVzc2FnZSwgcmV0cnlBZnRlclNlY29uZHMgPSBudWxsKXtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdDb21wcmVoZW5kSHR0cEVycm9yJztcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMucmV0cnlBZnRlclNlY29uZHMgPSByZXRyeUFmdGVyU2Vjb25kcztcbiAgICB9XG59XG4vKiogUmVzcG9uc2UgY291bGQgbm90IGJlIHBhcnNlZC92YWxpZGF0ZWQgKEpTT04gb3IgWm9kKS4gKi8gZXhwb3J0IGNsYXNzIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IgZXh0ZW5kcyBDb21wcmVoZW5kRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG9wdGlvbnMpe1xuICAgICAgICBzdXBlcihtZXNzYWdlLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0NvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3InO1xuICAgIH1cbn1cbi8vIFx1MjUwMFx1MjUwMCBQcm9tcHQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5jb25zdCBTWVNURU1fUFJPTVBUID0gJ1lvdSBhcmUgYSBwcmVjaXNlIGZpbmFuY2lhbCBhbmFseXN0IGFuZCB3b3JrYm9vayBpbnRlcnByZXRlci4gJyArICdZb3UgcmVhZCByYXcgc3ByZWFkc2hlZXQgZHVtcHMgYW5kIHJldHVybiBPTkxZIHZhbGlkIEpTT04gbWF0Y2hpbmcgdGhlIHJlcXVlc3RlZCBzY2hlbWEgZXhhY3RseS4gJyArICdOZXZlciBpbnZlbnQgZGF0YSB0aGF0IGlzIG5vdCBwcmVzZW50IGluIHRoZSBzaGVldHMgXHUyMDE0IGxlYXZlIG1ldHJpY3MgbnVsbCB3aGVuIGFic2VudC4nO1xuLyoqIFJlbmRlciB0aGUgZGV0ZXJtaW5pc3RpYyBBTkFMWVpFIGhpbnRzIGFzIGEgcHJvbXB0IHNlY3Rpb24uICovIGZ1bmN0aW9uIHJlbmRlckhpbnRzU2VjdGlvbihoaW50cykge1xuICAgIGNvbnN0IHdiID0gaGludHMud29ya2Jvb2s7XG4gICAgY29uc3QgbGluZXMgPSBbXG4gICAgICAgIGAtIFdvcmtib29rOiAke3diLnNoZWV0Q291bnR9IHNoZWV0KHMpLCAke3diLnRvdGFsUm93c30gdG90YWwgcm93cywgYCArIGAke01hdGgucm91bmQod2Iub3ZlcmFsbE51bWVyaWNSYXRpbyAqIDEwMCl9JSBudW1lcmljIGNlbGxzLmBcbiAgICBdO1xuICAgIGlmICh3Yi5jdXJyZW5jeUd1ZXNzKSBsaW5lcy5wdXNoKGAtIEN1cnJlbmN5IGd1ZXNzOiAke3diLmN1cnJlbmN5R3Vlc3N9YCk7XG4gICAgaWYgKHdiLnBlcmlvZEd1ZXNzKSBsaW5lcy5wdXNoKGAtIFBlcmlvZCBndWVzczogJHt3Yi5wZXJpb2RHdWVzc31gKTtcbiAgICBmb3IgKGNvbnN0IHMgb2YgaGludHMuc2hlZXRzKXtcbiAgICAgICAgY29uc3QgcGFydHMgPSBbXG4gICAgICAgICAgICBgXCIke3MudGFiTmFtZX1cIjogJHtzLnJvd0NvdW50fSByb3dzIFx1MDBENyAke3MuY29sQ291bnR9IGNvbHMsIGAgKyBgJHtNYXRoLnJvdW5kKHMubnVtZXJpY1JhdGlvICogMTAwKX0lIG51bWVyaWNgXG4gICAgICAgIF07XG4gICAgICAgIGlmIChzLmN1cnJlbmN5SGludHMubGVuZ3RoID4gMCkgcGFydHMucHVzaChgY3VycmVuY3kgWyR7cy5jdXJyZW5jeUhpbnRzLmpvaW4oJywnKX1dYCk7XG4gICAgICAgIGlmIChzLnBlcmlvZEhpbnRzLmxlbmd0aCA+IDApIHBhcnRzLnB1c2goYHBlcmlvZHMgWyR7cy5wZXJpb2RIaW50cy5qb2luKCcsICcpfV1gKTtcbiAgICAgICAgaWYgKHMubGFiZWxIaW50cy5sZW5ndGggPiAwKSBwYXJ0cy5wdXNoKGBsYWJlbHMgWyR7cy5sYWJlbEhpbnRzLmpvaW4oJywgJyl9XWApO1xuICAgICAgICBpZiAocy5saWtlbHlDYXRlZ29yeSkgcGFydHMucHVzaChgY2F0ZWdvcnktZ3Vlc3MgJHtzLmxpa2VseUNhdGVnb3J5fWApO1xuICAgICAgICBsaW5lcy5wdXNoKGAgIC0gU2hlZXQgJHtwYXJ0cy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59XG5leHBvcnQgZnVuY3Rpb24gYnVpbGRDb21wcmVoZW5zaW9uUHJvbXB0KGJsb2NrcywgaGludHMpIHtcbiAgICBjb25zdCBzaGVldEJsb2NrcyA9IGJsb2Nrcy5tYXAoKGIpPT5gPT09PT0gU0hFRVQ6ICR7Yi50YWJOYW1lfSA9PT09PVxcbiR7Yi50ZXh0fVxcbmApLmpvaW4oJ1xcbicpO1xuICAgIGNvbnN0IGhpbnRzU2VjdGlvbiA9IGhpbnRzID8gYERFVEVSTUlOSVNUSUMgUFJFLUFOQUxZU0lTIChnZW5lcmF0ZWQgYnkgY29kZSBcdTIwMTQgdXNlIGFzIHN0cm9uZyBwcmlvcnMsIGJ1dCBBTFdBWVMgdmVyaWZ5IGFnYWluc3QgdGhlIGFjdHVhbCBkdW1wOyBjYXRlZ29yeS1ndWVzcyBpcyBub3QgYXV0aG9yaXRhdGl2ZSk6XG4ke3JlbmRlckhpbnRzU2VjdGlvbihoaW50cyl9XG5cbmAgOiAnJztcbiAgICByZXR1cm4gYEFuYWx5emUgdGhlIGZvbGxvd2luZyB3b3JrYm9vay4gRXZlcnkgc2hlZXQgb2YgdGhlIHdvcmtib29rIGlzIGR1bXBlZCBiZWxvdyBhcyBcIlI8cm93PjogPGNlbGxzPlwiLlxuXG5UQVNLUzpcbjEuIFVuZGVyc3RhbmQgdGhlIHdvcmtib29rIGFzIGEgd2hvbGUgKGNvbXBhbnksIHBlcmlvZCwgY3VycmVuY3ksIHB1cnBvc2UpLlxuMi4gRm9yIEVBQ0ggc2hlZXQ6IGlkZW50aWZ5IGl0cyBjYXRlZ29yeSwgYSBodW1hbi1yZWFkYWJsZSB0aXRsZSwgYSBzaG9ydCBjb21wcmVoZW5zaW9uIHN1bW1hcnksIGRldGVjdGVkIHBlcmlvZCAoZS5nLiBcIkp1bmUgMjAyNlwiKSwgY29sdW1uIGhlYWRlcnMsIHJvdyBjb3VudCwgYW5kIGFueSBwZXItcGVyaW9kIGZpbmFuY2lhbCBtZXRyaWNzIChyZXZlbnVlLCBFQklUREEsIG5ldCBpbmNvbWUsIGd1ZXN0cywgc3RhZmYgY29zdCkgeW91IGNhbiByZWFkIGZyb20gdGhlIHNoZWV0LlxuMy4gQ29uc29saWRhdGUgQUxMIHBlcmlvZC1sZXZlbCBmaW5hbmNpYWwgZGF0YSBhY3Jvc3MgdGhlIHdob2xlIHdvcmtib29rIGludG8gYSBzaW5nbGUgXCJwcm9qZWN0aW9uc1wiIGFycmF5OiBvbmUgZW50cnkgcGVyIChwZXJpb2QgWVlZWS1NTSwgZGF0YVR5cGUgYWN0dWFsfGZvcmVjYXN0LCBzY2VuYXJpbyBhY3R1YWx8Y29uc2VydmF0aXZlfHJlYWxpc3RpY3xhc3BpcmF0aW9uYWwpLiBVc2UgdGhlIGJlc3Qgc291cmNlIGZvciBlYWNoIHBlcmlvZCAoZS5nLiBhIFAmTCBzdGF0ZW1lbnQgZm9yIGFjdHVhbHMsIGEgQkVQIHRhYmxlIG9yIGJ1ZGdldCBzaGVldCBmb3IgZm9yZWNhc3RzKS4gQW5udWFsIHRvdGFscyB1c2UgWVlZWS0xMi4gT25seSBpbmNsdWRlIGVudHJpZXMgd2hlcmUgYXQgbGVhc3Qgb25lIG1ldHJpYyBpcyBwcmVzZW50LlxuNC4gU3VnZ2VzdCB0aGUgbW9zdCBhcHByb3ByaWF0ZSBhcHAgdGVtcGxhdGUgaWQgZnJvbSB0aGlzIGF2YWlsYWJsZSBjYXRhbG9nOiBmaW5hbmNpYWwtYW5hbHl0aWNzLCByZXN0YXVyYW50LCBob3RlbCwgZWR1Y2F0aW9uLCBlY29tbWVyY2UtcmV0YWlsLCBoZWFsdGhjYXJlLCBtYW51ZmFjdHVyaW5nLCBwcm9mZXNzaW9uYWwtc2VydmljZXMsIHJlYWwtZXN0YXRlLCBzdXBwbHktY2hhaW4gKGNvbmZpZGVuY2UgMC4uMSkuXG5cblJVTEVTOlxuLSBwZXJpb2RzOiBZWVlZLU1NIG9ubHkgKGUuZy4gXCIyMDI2LTA2XCIsIFwiMjAyNS0xMlwiIGZvciBhbm51YWwpLlxuLSBkYXRhVHlwZSBcImFjdHVhbFwiIGZvciByZXBvcnRlZC9hY3R1YWwgZmlndXJlcywgXCJmb3JlY2FzdFwiIGZvciBwcm9qZWN0aW9ucy9idWRnZXRzLlxuLSBzY2VuYXJpbzogXCJhY3R1YWxcIiBmb3IgYWN0dWFsczsgXCJjb25zZXJ2YXRpdmVcIiBmb3IgYmFzZSBmb3JlY2FzdHM7IFwicmVhbGlzdGljXCIvXCJhc3BpcmF0aW9uYWxcIiB3aGVuIHRoZSBzaGVldCBleHBsaWNpdGx5IGxhYmVscyBzY2VuYXJpb3MuXG4tIEFtb3VudHMgYXJlIGZ1bGwgSURSIGludGVnZXJzIChubyBcIktcIiBzaG9ydGhhbmQpLiBSb3VuZCB0byBpbnRlZ2Vycy5cbi0gTGVhdmUgYSBtZXRyaWMgbnVsbCB3aGVuIHRoZSBzaGVldCBkb2VzIG5vdCBjb250YWluIGl0IGZvciB0aGF0IHBlcmlvZC5cbi0gY2F0ZWdvcnkgbXVzdCBiZSBvbmUgb2Y6ICR7U0hFRVRfQ0FURUdPUklFUy5qb2luKCcsICcpfS5cblxuJHtoaW50c1NlY3Rpb259V09SS0JPT0sgRFVNUDpcbiR7c2hlZXRCbG9ja3N9YDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcENvZGVGZW5jZShyZXBseSkge1xuICAgIGNvbnN0IG1hdGNoID0gcmVwbHkubWF0Y2goL2BgYCg/Ompzb24pP1xccyooW1xcc1xcU10qPylgYGAvKTtcbiAgICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6IHJlcGx5O1xufVxuLyoqXG4gKiBPTkUgT3BlbkFJIGNhbGwgdG8gY29tcHJlaGVuZCB0aGUgd29ya2Jvb2suIE5vIHJldHJ5IGxvb3AgXHUyMDE0IHRoZSBjYWxsZXJcbiAqIChzeW5jIHBpcGVsaW5lIG9yIHdvcmtmbG93IHN0ZXApIG93bnMgcmV0cnkgcG9saWN5LlxuICpcbiAqIFRocm93czpcbiAqICAgLSBDb21wcmVoZW5kSHR0cEVycm9yIChzdGF0dXMgNDI5IGNhcnJpZXMgcmV0cnlBZnRlclNlY29uZHMpXG4gKiAgIC0gQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvciAoYmFkIEpTT04gLyBab2QgcmVqZWN0aW9uKVxuICogICAtIENvbXByZWhlbmRFcnJvciAobmV0d29yayBldGMuIFx1MjAxNCB3cmFwcGVkIGZyb20gZmV0Y2ggZmFpbHVyZXMpXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXByZWhlbmRPbmNlKGJsb2Nrcywgb3B0aW9ucykge1xuICAgIGNvbnN0IHsgbW9kZWwgPSAnZ3B0LTRvJywgaGludHMsIGFwaUtleSwgYmFzZVVybCA9ICdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxJyB9ID0gb3B0aW9ucztcbiAgICBpZiAoYmxvY2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcignV29ya2Jvb2sgY29udGFpbnMgbm8gcmVhZGFibGUgc2hlZXRzJyk7XG4gICAgfVxuICAgIGNvbnN0IHByb21wdCA9IGJ1aWxkQ29tcHJlaGVuc2lvblByb21wdChibG9ja3MsIGhpbnRzKTtcbiAgICBsZXQgcmVzcG9uc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtiYXNlVXJsfS9jaGF0L2NvbXBsZXRpb25zYCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBTWVNURU1fUFJPTVBUXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHByb21wdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC4yLFxuICAgICAgICAgICAgICAgIG1heF90b2tlbnM6IDE2Mzg0LFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlX2Zvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnanNvbl9vYmplY3QnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kRXJyb3IoYE9wZW5BSSByZXF1ZXN0IGZhaWxlZDogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCwge1xuICAgICAgICAgICAgY2F1c2U6IGVyclxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zdCBlcnJCb2R5ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpLmNhdGNoKCgpPT4nVW5rbm93biBlcnJvcicpO1xuICAgICAgICBsZXQgcmV0cnlBZnRlclNlY29uZHMgPSBudWxsO1xuICAgICAgICBjb25zdCByZXRyeUFmdGVyID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ3JldHJ5LWFmdGVyJyk7XG4gICAgICAgIGlmIChyZXRyeUFmdGVyKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBOdW1iZXIocmV0cnlBZnRlcik7XG4gICAgICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHBhcnNlZCkgJiYgcGFyc2VkID49IDApIHJldHJ5QWZ0ZXJTZWNvbmRzID0gcGFyc2VkO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kSHR0cEVycm9yKHJlc3BvbnNlLnN0YXR1cywgYE9wZW5BSSBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSk6ICR7ZXJyQm9keX1gLCByZXRyeUFmdGVyU2Vjb25kcyk7XG4gICAgfVxuICAgIGxldCByZXN1bHQ7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcihgT3BlbkFJIHJlc3BvbnNlIHdhcyBub3QgdmFsaWQgSlNPTjogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgfVxuICAgIGNvbnN0IHJlcGx5ID0gcmVzdWx0LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudCA/PyAnJztcbiAgICBsZXQgcGFyc2VkO1xuICAgIHRyeSB7XG4gICAgICAgIHBhcnNlZCA9IEpTT04ucGFyc2Uoc3RyaXBDb2RlRmVuY2UocmVwbHkpKTtcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yKCdBSSByZXNwb25zZSB3YXMgbm90IHZhbGlkIEpTT046ICcgKyByZXBseS5zbGljZSgwLCA1MDApKTtcbiAgICB9XG4gICAgbGV0IGNvbXByZWhlbnNpb247XG4gICAgdHJ5IHtcbiAgICAgICAgY29tcHJlaGVuc2lvbiA9IFdvcmtib29rQ29tcHJlaGVuc2lvblNjaGVtYS5wYXJzZShwYXJzZWQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBmaXJzdCA9IGVyciBpbnN0YW5jZW9mIHouWm9kRXJyb3IgPyBlcnIuaXNzdWVzWzBdIDogbnVsbDtcbiAgICAgICAgY29uc3QgZGV0YWlsID0gZmlyc3QgPyBgJHtmaXJzdC5wYXRoLmpvaW4oJy4nKSB8fCAncm9vdCd9OiAke2ZpcnN0Lm1lc3NhZ2V9YCA6IFN0cmluZyhlcnIpO1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcihgQUkgcmVzcG9uc2UgZmFpbGVkIHNjaGVtYSB2YWxpZGF0aW9uOiAke2RldGFpbH1gLCB7XG4gICAgICAgICAgICBjYXVzZTogZXJyXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjb21wcmVoZW5zaW9uLFxuICAgICAgICBtb2RlbCxcbiAgICAgICAgcHJvbXB0TGVuZ3RoOiBwcm9tcHQubGVuZ3RoXG4gICAgfTtcbn1cbiIsICIvKipcbiAqIFByb2dyZXNzIGVtaXNzaW9uIGZvciB0aGUgd29ya2Jvb2staW5nZXN0IHdvcmtmbG93LlxuICpcbiAqIEZvbGxvd3MgdGhlIFNESyBzdHJlYW1pbmcgcGF0dGVybjpcbiAqICAgLSB0aGUgd29ya2Zsb3cgZnVuY3Rpb24gY2FsbHMgYGdldFdyaXRhYmxlKClgIGFuZCBwYXNzZXMgdGhlIHN0cmVhbSB0byBzdGVwcztcbiAqICAgLSBzdGVwcyBvYnRhaW4gYSB3cml0ZXIsIHdyaXRlIEpTT04gY2h1bmtzLCBhbmQgcmVsZWFzZSB0aGUgbG9jay5cbiAqXG4gKiBUaGUgd3JpdGFibGUgc3RyZWFtIGlzIHNlcmlhbGl6ZWQgYnkgcmVmZXJlbmNlIGFjcm9zcyBzdGVwIGJvdW5kYXJpZXNcbiAqIChzdHJlYW1Ub1N0cmVhbVJlZiksIHNvIHdlIGFsd2F5cyBwYXNzIHRoZSByYXcgV3JpdGFibGVTdHJlYW0gXHUyMDE0IG5ldmVyIGFcbiAqIHdyYXBwZXIgb2JqZWN0LlxuICovIC8qKlxuICogRW5jb2RlIGEgcHJvZ3Jlc3MgY2h1bmsgYXMgYSBKU09OIHN0cmluZyAoY2h1bmtzIGFyZSB3cml0dGVuIGFzIHRleHQpLlxuICovIGV4cG9ydCBmdW5jdGlvbiBlbmNvZGVDaHVuayhjaHVuaykge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShjaHVuayk7XG59XG4vKipcbiAqIFdyaXRlIG9uZSBwcm9ncmVzcyBjaHVuay4gQ2FsbCBmcm9tIHdpdGhpbiBhIHN0ZXA6XG4gKlxuICogICBhc3luYyBmdW5jdGlvbiBlbWl0UHJvZ3Jlc3NTdGVwKHdyaXRhYmxlOiBXcml0YWJsZVN0cmVhbSwgY2h1bms6IFByb2dyZXNzQ2h1bmspIHtcbiAqICAgICAndXNlIHN0ZXAnO1xuICogICAgIGF3YWl0IHdyaXRlUHJvZ3Jlc3NDaHVuayh3cml0YWJsZSwgY2h1bmspO1xuICogICB9XG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlUHJvZ3Jlc3NDaHVuayh3cml0YWJsZSwgY2h1bmspIHtcbiAgICBjb25zdCB3cml0ZXIgPSB3cml0YWJsZS5nZXRXcml0ZXIoKTtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCB3cml0ZXIud3JpdGUoY2h1bmspO1xuICAgIH0gZmluYWxseXtcbiAgICAgICAgd3JpdGVyLnJlbGVhc2VMb2NrKCk7XG4gICAgfVxufVxuLyoqIENsb3NlIHRoZSBzdHJlYW0gdG8gc2lnbmFsIGNvbXBsZXRpb24uIENhbGwgZnJvbSB3aXRoaW4gYSBzdGVwLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0cmVhbSh3cml0YWJsZSkge1xuICAgIGF3YWl0IHdyaXRhYmxlLmNsb3NlKCk7XG59XG4iLCAiLyoqXG4gKiBMaWdodHdlaWdodCBQb3N0Z3JlU1FMIGhlbHBlciBmb3Igd29ya2Zsb3cgc3RlcHMgKHBnIGRyaXZlciwgbm8gUHJpc21hKS5cbiAqXG4gKiBFYWNoIHN0ZXAgb3BlbnMgaXRzIG93biBzaG9ydC1saXZlZCBjb25uZWN0aW9uIFx1MjAxNCBmaW5lIGZvciB3b3JrZmxvdyBzdGVwc1xuICogd2hpY2ggYXJlIGFscmVhZHkgaW5kaXZpZHVhbGx5IGludm9pY2VkIFZlcmNlbCBGdW5jdGlvbiBpbnZvY2F0aW9ucy5cbiAqIFRoZSBwb29sL2Nvbm5lY3Rpb24tc3RyaW5nIGNvbWVzIGZyb20gYHByb2Nlc3MuZW52LlBPU1RHUkVTX1VSTGAgKHNldCBieVxuICogdGhlIFZlcmNlbC9OZW9uIGludGVncmF0aW9uIGFuZCBhdmFpbGFibGUgaW4gc3RlcCBydW50aW1lKS5cbiAqLyBpbXBvcnQgeyBDbGllbnQgfSBmcm9tICdwZyc7XG4vKipcbiAqIFJ1biBhIGNhbGxiYWNrIHdpdGggYSBzaG9ydC1saXZlZCBwZyBjb25uZWN0aW9uLlxuICogVGhlIGNvbm5lY3Rpb24gc3RyaW5nIGlzIHJlc29sdmVkIGJ5IHRoZSByb3V0ZSAocm9vdCBlbnYgXHUyMTkyIHRlbmFudCBkYl91cmwgbG9va3VwKVxuICogYW5kIHBhc3NlZCB0aHJvdWdoIHRoZSB3b3JrZmxvdyBpbnB1dCBcdTIwMTQgbmV2ZXIgcmVhZCBmcm9tIHByb2Nlc3MuZW52IGRpcmVjdGx5LlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3aXRoUGdDbGllbnQoY29ubmVjdGlvblN0cmluZywgZm4pIHtcbiAgICBpZiAoIWNvbm5lY3Rpb25TdHJpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkYXRhYmFzZSBjb25uZWN0aW9uIHN0cmluZyBwcm92aWRlZC4nKTtcbiAgICB9XG4gICAgY29uc3QgY2xpZW50ID0gbmV3IENsaWVudCh7XG4gICAgICAgIGNvbm5lY3Rpb25TdHJpbmdcbiAgICB9KTtcbiAgICBhd2FpdCBjbGllbnQuY29ubmVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBmbihjbGllbnQpO1xuICAgIH0gZmluYWxseXtcbiAgICAgICAgYXdhaXQgY2xpZW50LmVuZCgpO1xuICAgIH1cbn1cbi8qKiBSdW4gYSBzaW5nbGUgU1FMIHN0YXRlbWVudCBhbmQgcmV0dXJuIHRoZSByb3cgY291bnQgb3IgcmVzdWx0LiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZU9uZShjbGllbnQsIHNxbCwgcGFyYW1zID0gW10pIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQucXVlcnkoc3FsLCBwYXJhbXMpO1xuICAgIHJldHVybiByZXN1bHQucm93Q291bnQgPz8gMDtcbn1cbi8qKiBSdW4gU1FMIGFuZCByZXR1cm4gYWxsIHJvd3MuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBxdWVyeVJvd3MoY2xpZW50LCBzcWwsIHBhcmFtcyA9IFtdKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnF1ZXJ5KHNxbCwgcGFyYW1zKTtcbiAgICByZXR1cm4gcmVzdWx0LnJvd3M7XG59XG4iLCAiLyoqXG4gKiBJbXBvcnQtdGltZSBFeGNlbCBmb3JtdWxhIGV4dHJhY3Rpb24gKyByZWZlcmVuY2UgbWFwcGluZy5cbiAqXG4gKiBXaGVuIGEgd29ya2Jvb2sgaXMgaW1wb3J0ZWQgdGhlIHJhdyB4bHN4IGlzIGNhY2hlZCBpbiB0aGUgZGF0YWJhc2VcbiAqIChrbm93bGVkZ2Vfc25pcHBldHMud29ya2Jvb2tfZGF0YSkgYW5kIHNlcnZlZCB0byB0aGUgc2hlZXQgdmlld2VyIGFzIEpTT05cbiAqIHJvd3Mga2V5ZWQgYnkgY29sdW1uIGhlYWRlciB3aXRoIGEgZGV0ZWN0ZWQgaGVhZGVyIHJvdy4gVGhpcyBtb2R1bGUgd2Fsa3NcbiAqIGV2ZXJ5IHNoZWV0IG9mIHRoZSBpbXBvcnRlZCB3b3JrYm9vayBhbmQ6XG4gKlxuICogICAxLiBmaW5kcyBBTEwgZm9ybXVsYSBjZWxscyAoXCI9U1VNKFY0NjpWNTQpXCIsIFwiPVBMIUQ3XCIsIC4uLiksXG4gKiAgIDIuIG1hcHMgZWFjaCBmb3JtdWxhIGNlbGwgaXRzZWxmIHRvIHRoZSBEQi1zaGVldCBjb29yZGluYXRlcyB0aGVcbiAqICAgICAgYXBwbGljYXRpb24gZGlzcGxheXMgKGNvbHVtbiBrZXkgKyBkYXRhLXJvdyBvZmZzZXQgKyBhYnNvbHV0ZSBBMSksXG4gKiAgIDMuIG1hcHMgZXZlcnkgcmVmZXJlbmNlIGluc2lkZSB0aGUgZm9ybXVsYSB0byB0aGUgc2FtZSBjb29yZGluYXRlc1xuICogICAgICAoY3Jvc3Mtc2hlZXQgcmVmcyBpbmNsdWRlZCksIHNvIGEgZm9ybXVsYSBjYW4gYmUgY29tcHV0ZWQgYWdhaW5zdCB0aGVcbiAqICAgICAgREItc2F2ZWQgc2hlZXQgZGF0YSBldmVuIHdoZW4gcmF3IGdyaWQgcG9zaXRpb25zIHNoaWZ0IGJldHdlZW5cbiAqICAgICAgaW1wb3J0cyxcbiAqICAgNC4gY29tcHV0ZXMgYSBiZXN0LWVmZm9ydCB2YWx1ZSB3aXRoIHRoZSBzYW1lIGV2YWx1YXRvciB0aGUgQVBJIHVzZXNcbiAqICAgICAgKHNyYy9saWIvZXhjZWwtZm9ybXVsYS50cykgc28gY29uc3VtZXJzIGhhdmUgYW4gaW1wb3J0LXRpbWUgc25hcHNob3QuXG4gKlxuICogVGhlIHJlc3VsdGluZyBXb3JrYm9va0Zvcm11bGFNYXAgaXMgcGVyc2lzdGVkIGFzIGEga25vd2xlZGdlX3NuaXBwZXRzIEpTT05cbiAqIGVudHJ5IChrZXkgXCJ3b3JrYm9va19mb3JtdWxhc1wiKSBieSBib3RoIGltcG9ydCBwYXRocyAoc2VlZC1ydW5uZXIgYW5kIHRoZVxuICogd29ya2Jvb2staW5nZXN0IHdvcmtmbG93KS5cbiAqLyBpbXBvcnQgeyB1dGlscyB9IGZyb20gJ3hsc3gnO1xuaW1wb3J0IHsgZXZhbHVhdGVGb3JtdWxhLCBjb2xsZWN0UmVmZXJlbmNlcyB9IGZyb20gJ0AvbGliL2V4Y2VsLWZvcm11bGEnO1xuaW1wb3J0IHsgZmluZEhlYWRlclJvdywgYnVpbGRDb2x1bW5LZXlzIH0gZnJvbSAnQC9saWIvd29ya2Jvb2stbWFwcGluZyc7XG5mdW5jdGlvbiBpc0NlbGxBZGRyZXNzKGtleSkge1xuICAgIHJldHVybiAvXltBLVpdK1xcZCskLy50ZXN0KGtleSk7XG59XG4vKiogTWFwIG9uZSByYXcgcmVmZXJlbmNlIHRva2VuIHRvIERCIGNvb3JkaW5hdGVzICh0YXJnZXQgc2hlZXQgYXdhcmUpLiAqLyBmdW5jdGlvbiBtYXBSZWYocmVmLCBoZWFkZXJDYWNoZSwgd2IsIGZvcm11bGFTaGVldCkge1xuICAgIGNvbnN0IHRhcmdldCA9IHJlZi5zaGVldCA/PyBmb3JtdWxhU2hlZXQ7XG4gICAgY29uc3QgdGFyZ2V0V3MgPSB3Yi5TaGVldHNbdGFyZ2V0XTtcbiAgICAvLyBTYW1lLXNoZWV0IHJlZmVyZW5jZXMga2VlcCBzaGVldCAnJyAoY29tcGFjdCk7IGV4cGxpY2l0IG90aGVyd2lzZS5cbiAgICBjb25zdCBzaGVldCA9IHJlZi5zaGVldCA/PyAnJztcbiAgICBpZiAoIXRhcmdldFdzKSB7XG4gICAgICAgIC8vIFNoZWV0IHZhbmlzaGVkIFx1MjAxNCBrZWVwIHRoZSByYXcgYWRkcmVzcyBzbyBub3RoaW5nIGlzIGxvc3QuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzaGVldCxcbiAgICAgICAgICAgIGtpbmQ6ICdjZWxsJyxcbiAgICAgICAgICAgIGFic0NlbGw6IHJlZi5hZGRyXG4gICAgICAgIH07XG4gICAgfVxuICAgIGxldCBoZWFkZXIgPSBoZWFkZXJDYWNoZS5nZXQodGFyZ2V0KTtcbiAgICBpZiAoIWhlYWRlcikge1xuICAgICAgICBoZWFkZXIgPSBmaW5kSGVhZGVyUm93KHRhcmdldFdzKTtcbiAgICAgICAgaGVhZGVyQ2FjaGUuc2V0KHRhcmdldCwgaGVhZGVyKTtcbiAgICB9XG4gICAgY29uc3Qgc3RhcnQgPSBtYXBDZWxsVG9EYXRhUmVmKHRhcmdldFdzLCByZWYuYWRkciwgaGVhZGVyKTtcbiAgICBjb25zdCBtYXBwZWQgPSB7XG4gICAgICAgIHNoZWV0LFxuICAgICAgICBraW5kOiByZWYuZW5kID8gJ3JhbmdlJyA6ICdjZWxsJyxcbiAgICAgICAgY29sS2V5OiBzdGFydC5jb2xLZXksXG4gICAgICAgIHJlbFJvdzogc3RhcnQucmVsUm93LFxuICAgICAgICBhYnNDZWxsOiByZWYuYWRkclxuICAgIH07XG4gICAgaWYgKHJlZi5lbmQpIHtcbiAgICAgICAgY29uc3QgZW5kID0gbWFwQ2VsbFRvRGF0YVJlZih0YXJnZXRXcywgcmVmLmVuZCwgaGVhZGVyKTtcbiAgICAgICAgbWFwcGVkLmVuZCA9IHtcbiAgICAgICAgICAgIGNvbEtleTogZW5kLmNvbEtleSxcbiAgICAgICAgICAgIHJlbFJvdzogZW5kLnJlbFJvdyxcbiAgICAgICAgICAgIGFic0NlbGw6IHJlZi5lbmRcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcHBlZDtcbn1cbi8qKiBDb2x1bW4tb25seSAoQTpBKSBvciBmdWxsLWNlbGwgbWFwcGluZyB0byBEQiBjb29yZGluYXRlcy4gKi8gZnVuY3Rpb24gbWFwQ2VsbFRvRGF0YVJlZih3cywgYWRkciwgaGVhZGVyKSB7XG4gICAgY29uc3QgY2xlYW4gPSBhZGRyLnJlcGxhY2UoL1xcJC9nLCAnJyk7XG4gICAgaWYgKC9eW0EtWmEtel0rJC8udGVzdChjbGVhbikpIHtcbiAgICAgICAgLy8gV2hvbGUtY29sdW1uIHJlZmVyZW5jZTogY29sdW1uIG1hcHMgdG8gaXRzIGhlYWRlciBrZXksIHJvd3MgYXJlIHVuYm91bmRlZC5cbiAgICAgICAgY29uc3QgY29sSWR4ID0gdXRpbHMuZGVjb2RlX2NvbChjbGVhbik7XG4gICAgICAgIGNvbnN0IGNvbHVtbktleXMgPSBidWlsZENvbHVtbktleXMoaGVhZGVyLmhlYWRlcnMpO1xuICAgICAgICBjb25zdCByYXdIZWFkZXIgPSBoZWFkZXIuaGVhZGVyc1tjb2xJZHhdID8/ICcnO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29sS2V5OiByYXdIZWFkZXIudHJpbSgpID8gY29sdW1uS2V5c1tjb2xJZHhdIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgcmVsUm93OiB1bmRlZmluZWRcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZGVjb2RlZCA9IHV0aWxzLmRlY29kZV9jZWxsKGNsZWFuKTtcbiAgICBjb25zdCByZWxSb3cgPSBkZWNvZGVkLnIgLSBoZWFkZXIuaGVhZGVyUm93ICsgMTtcbiAgICBjb25zdCBjb2x1bW5LZXlzID0gYnVpbGRDb2x1bW5LZXlzKGhlYWRlci5oZWFkZXJzKTtcbiAgICBjb25zdCByYXdIZWFkZXIgPSBoZWFkZXIuaGVhZGVyc1tkZWNvZGVkLmNdID8/ICcnO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbEtleTogcmF3SGVhZGVyLnRyaW0oKSA/IGNvbHVtbktleXNbZGVjb2RlZC5jXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgcmVsUm93OiByZWxSb3cgPj0gMSA/IHJlbFJvdyA6IHVuZGVmaW5lZFxuICAgIH07XG59XG4vKipcbiAqIFdhbGsgZXZlcnkgc2hlZXQgYW5kIGJ1aWxkIHRoZSBmdWxsIGZvcm11bGEgaW52ZW50b3J5ICsgcmVmZXJlbmNlIG1hcHBpbmcuXG4gKlxuICogRXhwZWN0cyBgd2JgIHBhcnNlZCB3aXRoIGBjZWxsRm9ybXVsYTogdHJ1ZWAgKFNoZWV0SlMgb25seSBwb3B1bGF0ZXNcbiAqIGBjZWxsLmZgIHdoZW4gZm9ybXVsYSBzdHJpbmdzIGFyZSByZWFkKS5cbiAqLyBleHBvcnQgZnVuY3Rpb24gYnVpbGRXb3JrYm9va0Zvcm11bGFNYXAod2IpIHtcbiAgICBjb25zdCBtYXAgPSB7fTtcbiAgICBjb25zdCBoZWFkZXJDYWNoZSA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IHRhYk5hbWUgb2Ygd2IuU2hlZXROYW1lcyl7XG4gICAgICAgIGNvbnN0IHdzID0gd2IuU2hlZXRzW3RhYk5hbWVdO1xuICAgICAgICBjb25zdCBoZWFkZXIgPSBmaW5kSGVhZGVyUm93KHdzKTtcbiAgICAgICAgY29uc3QgY29sdW1uS2V5cyA9IGJ1aWxkQ29sdW1uS2V5cyhoZWFkZXIuaGVhZGVycyk7XG4gICAgICAgIGNvbnN0IGhlYWRlckNhY2hlS2V5ID0gdGFiTmFtZTtcbiAgICAgICAgaGVhZGVyQ2FjaGUuc2V0KGhlYWRlckNhY2hlS2V5LCBoZWFkZXIpO1xuICAgICAgICBjb25zdCBmb3JtdWxhcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh3cykpe1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJyFyZWYnIHx8IGtleSA9PT0gJyFtYXJnaW5zJyB8fCBrZXkgPT09ICchbWVyZ2VzJyB8fCBrZXkgPT09ICchY29scycgfHwga2V5ID09PSAnIXJvd3MnKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmICghaXNDZWxsQWRkcmVzcyhrZXkpKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGNlbGwgPSB3c1trZXldO1xuICAgICAgICAgICAgaWYgKCFjZWxsIHx8IHR5cGVvZiBjZWxsLmYgIT09ICdzdHJpbmcnIHx8IGNlbGwuZi50cmltKCkgPT09ICcnKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGZvcm11bGEgPSBjZWxsLmYudHJpbSgpLnN0YXJ0c1dpdGgoJz0nKSA/IGNlbGwuZi50cmltKCkgOiAnPScgKyBjZWxsLmYudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgZGVjb2RlZCA9IHV0aWxzLmRlY29kZV9jZWxsKGtleSk7XG4gICAgICAgICAgICBjb25zdCByZWxSb3cgPSBkZWNvZGVkLnIgLSBoZWFkZXIuaGVhZGVyUm93ICsgMTtcbiAgICAgICAgICAgIGNvbnN0IHJhd0hlYWRlciA9IGhlYWRlci5oZWFkZXJzW2RlY29kZWQuY10gPz8gJyc7XG4gICAgICAgICAgICBjb25zdCByZWZzID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJhd1JlZiBvZiBjb2xsZWN0UmVmZXJlbmNlcyhmb3JtdWxhKSl7XG4gICAgICAgICAgICAgICAgcmVmcy5wdXNoKG1hcFJlZihyYXdSZWYsIGhlYWRlckNhY2hlLCB3YiwgdGFiTmFtZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZXZhbHVhdGVGb3JtdWxhKHdiLCB3cywgZm9ybXVsYSwgMCwga2V5KTtcbiAgICAgICAgICAgIGZvcm11bGFzLnB1c2goe1xuICAgICAgICAgICAgICAgIGNlbGw6IGtleSxcbiAgICAgICAgICAgICAgICBmb3JtdWxhLFxuICAgICAgICAgICAgICAgIGNvbEtleTogcmF3SGVhZGVyLnRyaW0oKSA/IGNvbHVtbktleXNbZGVjb2RlZC5jXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICByZWxSb3c6IHJlbFJvdyA+PSAxID8gcmVsUm93IDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGFic1JvdzogZGVjb2RlZC5yICsgMSxcbiAgICAgICAgICAgICAgICBhYnNDb2w6IGRlY29kZWQuYyArIDEsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC51bmV2YWx1YWJsZSA/IHVuZGVmaW5lZCA6IHJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICB1bmV2YWx1YWJsZTogcmVzdWx0LnVuZXZhbHVhYmxlLFxuICAgICAgICAgICAgICAgIHJlZnNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIG1hcFt0YWJOYW1lXSA9IHtcbiAgICAgICAgICAgIGhlYWRlclJvdzogaGVhZGVyLmhlYWRlclJvdyxcbiAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlci5oZWFkZXJzLFxuICAgICAgICAgICAgY29sdW1uS2V5cyxcbiAgICAgICAgICAgIGZvcm11bGFzXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG4iLCAiLyoqXG4gKiBFeGNlbCBmb3JtdWxhIHN1cHBvcnQgZm9yIHRoZSBTaGVldCBWaWV3ZXIuXG4gKlxuICogVGhlIHdvcmtib29rIHN0b3JlcyBmb3JtdWxhcyAoZS5nLiBcIj1TVU0oRTEwOkUxMSlcIiwgXCI9SUYoRDY9MCxcXFwiXFxcIiwoRjYtRDYpL0Q2KVwiLFxuICogXCI9UEwhRDdcIikgd2l0aCBFeGNlbCdzIGNhY2hlZCBjYWxjdWxhdGVkIHZhbHVlcy4gVGhpcyBtb2R1bGU6XG4gKiAgLSBldmFsdWF0ZXMgYSBmb3JtdWxhIGFnYWluc3QgdGhlIHdvcmtib29rIChiZXN0LWVmZm9ydCkgc28gdGhlIERhdGFHcmlkIGNhblxuICogICAgc2hvdyB0aGUgY2FsY3VsYXRlZCByZXN1bHQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHVzZXIgYW1lbmRzIHRoZSBmb3JtdWxhLFxuICogIC0gbWFya3MgZm9ybXVsYXMgd2UgY2Fubm90IGV2YWx1YXRlIChleG90aWMgZnVuY3Rpb25zLCBldGMuKSBhc1xuICogICAgdW5ldmFsdWFibGUgXHUyMDE0IHRoZSBmb3JtdWxhIGlzIHN0aWxsIHN0b3JlZCBpbiB0aGUgd29ya2Jvb2sgYW5kIEV4Y2VsXG4gKiAgICByZWNhbGN1bGF0ZXMgaXQgb24gb3Blbi5cbiAqXG4gKiBTdXBwb3J0ZWQ6IGFyaXRobWV0aWMgKCsgLSAqIC8gXiAlKSwgcGFyZW5zLCBjZWxsIHJlZnMgKEExLCAkQSQxKSxcbiAqIGNyb3NzLXNoZWV0IHJlZnMgKFNoZWV0IUExLCAnU2hlZXQgTmFtZSchQTEpLCByYW5nZXMgKEExOkI1KSBhbmQgdGhlXG4gKiBmdW5jdGlvbnMgU1VNLCBBVkVSQUdFLCBNSU4sIE1BWCwgQ09VTlQsIENPVU5UQSwgUFJPRFVDVCwgQUJTLCBJTlQsIFNRUlQsXG4gKiBST1VORCwgUk9VTkRVUCwgUk9VTkRET1dOLCBNT0QsIFBPV0VSLCBJRiwgU1VCVE9UQUwgKGNvZGUgOS8xMDkgb25seSksXG4gKiBBTkQsIE9SLCBUUklNLCBQUk9QRVIsIENIT09TRSwgREFURSwgV0VFS0RBWSwgQ09MVU1OLCBTVU1JRiwgVkxPT0tVUCxcbiAqIE1BVENILCBJTkRFWCwgVEVYVCwgSUZFUlJPUi5cbiAqLyBpbXBvcnQgeyB1dGlscyB9IGZyb20gJ3hsc3gnO1xuY29uc3QgTUFYX0RFUFRIID0gMTI7XG5jb25zdCBNQVhfUkFOR0VfQ0VMTFMgPSAxMDBfMDAwO1xuZnVuY3Rpb24gaXNSYW5nZSh2KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2ICE9PSBudWxsICYmICdfX3JhbmdlJyBpbiB2O1xufVxuZnVuY3Rpb24gdG9rZW5pemUoc3JjKSB7XG4gICAgY29uc3QgdG9rZW5zID0gW107XG4gICAgbGV0IGkgPSAwO1xuICAgIGxldCBwcmV2VG9rZW47XG4gICAgd2hpbGUoaSA8IHNyYy5sZW5ndGgpe1xuICAgICAgICBjb25zdCBjaCA9IHNyY1tpXTtcbiAgICAgICAgaWYgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnIHx8IGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC9bXFxkLl0vLnRlc3QoY2gpKSB7XG4gICAgICAgICAgICBsZXQgaiA9IGk7XG4gICAgICAgICAgICB3aGlsZShqIDwgc3JjLmxlbmd0aCAmJiAvW1xcZC5dLy50ZXN0KHNyY1tqXSkpaisrO1xuICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdudW0nLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzcmMuc2xpY2UoaSwgailcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaSA9IGo7XG4gICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnXCInKSB7XG4gICAgICAgICAgICBsZXQgaiA9IGkgKyAxO1xuICAgICAgICAgICAgd2hpbGUoaiA8IHNyYy5sZW5ndGggJiYgc3JjW2pdICE9PSAnXCInKWorKztcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3RyJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogc3JjLnNsaWNlKGkgKyAxLCBqKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpID0gaiArIDE7XG4gICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSBcIidcIikge1xuICAgICAgICAgICAgbGV0IGogPSBpICsgMTtcbiAgICAgICAgICAgIHdoaWxlKGogPCBzcmMubGVuZ3RoICYmIHNyY1tqXSAhPT0gXCInXCIpaisrO1xuICAgICAgICAgICAgY29uc3Qgc2hlZXROYW1lID0gc3JjLnNsaWNlKGkgKyAxLCBqKTtcbiAgICAgICAgICAgIGkgPSBqICsgMTtcbiAgICAgICAgICAgIGlmIChzcmNbaV0gPT09ICchJykge1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3NoZWV0JyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHNoZWV0TmFtZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgcXVvdGVkIHRva2VuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC9bQS1aYS16XyRdLy50ZXN0KGNoKSkge1xuICAgICAgICAgICAgbGV0IGogPSBpO1xuICAgICAgICAgICAgd2hpbGUoaiA8IHNyYy5sZW5ndGggJiYgL1tBLVphLXowLTlfJC5dLy50ZXN0KHNyY1tqXSkpaisrO1xuICAgICAgICAgICAgY29uc3Qgd29yZCA9IHNyYy5zbGljZShpLCBqKTtcbiAgICAgICAgICAgIGlmIChzcmNbal0gPT09ICchJykge1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3NoZWV0JyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHdvcmRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpID0gaiArIDE7XG4gICAgICAgICAgICAgICAgcHJldlRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgvXlxcJD9bQS1aYS16XXsxLDN9XFwkP1xcZCskLy50ZXN0KHdvcmQpKSB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3JlZicsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHdvcmRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxzZSBpZiAoL15cXCQ/W0EtWmEtel17MSwzfSQvLnRlc3Qod29yZCkgJiYgKHNyY1tqXSA9PT0gJzonIHx8IHByZXZUb2tlbj8udHlwZSA9PT0gJ29wJyAmJiBwcmV2VG9rZW4udmFsdWUgPT09ICc6JykpIHtcbiAgICAgICAgICAgICAgICAvLyBXaG9sZS1jb2x1bW4gcmVmIChBOkEsICRDOiRBRykgXHUyMDE0IG9ubHkgbWVhbmluZ2Z1bCBpbnNpZGUgYSByYW5nZVxuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3JlZicsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB3b3JkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdvcmQgPT09ICdUUlVFJykgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ1RSVUUnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHdvcmQgPT09ICdGQUxTRScpIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdGQUxTRSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxzZSB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2lkZW50JyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogd29yZC50b1VwcGVyQ2FzZSgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGkgPSBqO1xuICAgICAgICAgICAgcHJldlRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR3byA9IHNyYy5zbGljZShpLCBpICsgMik7XG4gICAgICAgIGlmICh0d28gPT09ICc8PScgfHwgdHdvID09PSAnPj0nIHx8IHR3byA9PT0gJzw+Jykge1xuICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdvcCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHR3b1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCcrLSovXj08PigpLCU6Jy5pbmNsdWRlcyhjaCkpIHtcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnb3AnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBjaFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmV4cGVjdGVkIGNoYXI6ICcgKyBjaCk7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbnM7XG59XG5mdW5jdGlvbiB0b051bSh2KSB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsKSByZXR1cm4gMDsgLy8gRXhjZWw6IGVtcHR5IGNlbGwgaW4gbnVtZXJpYyBjb250ZXh0ID0gMFxuICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpIHJldHVybiB2O1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gdiA/IDEgOiAwO1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3QgbiA9IE51bWJlcih2LnRyaW0oKSk7XG4gICAgICAgIGlmIChpc0Zpbml0ZShuKSkgcmV0dXJuIG47XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignbm90IG51bWVyaWMnKTtcbn1cbmZ1bmN0aW9uIHRydXRoeSh2KSB7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHJldHVybiB2O1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpIHJldHVybiB2ICE9PSAwO1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHJldHVybiB2LnRyaW0oKSAhPT0gJyc7XG4gICAgaWYgKGlzUmFuZ2UodikpIHJldHVybiB2LnZhbHVlcy5zb21lKCh4KT0+dHJ1dGh5KHgpKTtcbiAgICByZXR1cm4gZmFsc2U7XG59XG5jbGFzcyBQYXJzZXIge1xuICAgIHdiO1xuICAgIHdzO1xuICAgIGRlcHRoO1xuICAgIGN1cnJlbnRDZWxsQWRkcjtcbiAgICB0b2tlbnM7XG4gICAgcG9zID0gMDtcbiAgICBjb25zdHJ1Y3Rvcih3Yiwgd3MsIHNyYywgZGVwdGggPSAwLCBjdXJyZW50Q2VsbEFkZHIpe1xuICAgICAgICB0aGlzLndiID0gd2I7XG4gICAgICAgIHRoaXMud3MgPSB3cztcbiAgICAgICAgdGhpcy5kZXB0aCA9IGRlcHRoO1xuICAgICAgICB0aGlzLmN1cnJlbnRDZWxsQWRkciA9IGN1cnJlbnRDZWxsQWRkcjtcbiAgICAgICAgdGhpcy50b2tlbnMgPSB0b2tlbml6ZShzcmMpO1xuICAgIH1cbiAgICBwYXJzZUV4cHIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlQ29tcGFyaXNvbigpO1xuICAgIH1cbiAgICAvKiogVHJ1ZSB3aGVuIHRoZSBmdWxsIHRva2VuIHN0cmVhbSBoYXMgYmVlbiBjb25zdW1lZC4gKi8gZmluaXNoZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvcyA+PSB0aGlzLnRva2Vucy5sZW5ndGg7XG4gICAgfVxuICAgIHBlZWsoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnBvc107XG4gICAgfVxuICAgIG5leHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnBvcysrXTtcbiAgICB9XG4gICAgZXhwZWN0T3Aob3ApIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMubmV4dCgpO1xuICAgICAgICBpZiAoIXQgfHwgdC50eXBlICE9PSAnb3AnIHx8IHQudmFsdWUgIT09IG9wKSB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkICcgKyBvcCk7XG4gICAgfVxuICAgIHBhcnNlQ29tcGFyaXNvbigpIHtcbiAgICAgICAgbGV0IGxlZnQgPSB0aGlzLnBhcnNlQWRkaXRpdmUoKTtcbiAgICAgICAgd2hpbGUodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiBbXG4gICAgICAgICAgICAnPScsXG4gICAgICAgICAgICAnPD4nLFxuICAgICAgICAgICAgJzwnLFxuICAgICAgICAgICAgJz4nLFxuICAgICAgICAgICAgJzw9JyxcbiAgICAgICAgICAgICc+PSdcbiAgICAgICAgXS5pbmNsdWRlcyh0aGlzLnBlZWsoKS52YWx1ZSkpe1xuICAgICAgICAgICAgY29uc3Qgb3AgPSB0aGlzLm5leHQoKS52YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZUFkZGl0aXZlKCk7XG4gICAgICAgICAgICBsZWZ0ID0gY29tcGFyZShvcCwgbGVmdCwgcmlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZWZ0O1xuICAgIH1cbiAgICBwYXJzZUFkZGl0aXZlKCkge1xuICAgICAgICBsZXQgbGVmdCA9IHRoaXMucGFyc2VNdWx0aXBsaWNhdGl2ZSgpO1xuICAgICAgICB3aGlsZSh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmICh0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJysnIHx8IHRoaXMucGVlaygpLnZhbHVlID09PSAnLScpKXtcbiAgICAgICAgICAgIGNvbnN0IG9wID0gdGhpcy5uZXh0KCkudmFsdWU7XG4gICAgICAgICAgICBjb25zdCByaWdodCA9IHRoaXMucGFyc2VNdWx0aXBsaWNhdGl2ZSgpO1xuICAgICAgICAgICAgbGVmdCA9IGFyaXRoKG9wLCBsZWZ0LCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxlZnQ7XG4gICAgfVxuICAgIHBhcnNlTXVsdGlwbGljYXRpdmUoKSB7XG4gICAgICAgIGxldCBsZWZ0ID0gdGhpcy5wYXJzZVVuYXJ5KCk7XG4gICAgICAgIHdoaWxlKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgKHRoaXMucGVlaygpLnZhbHVlID09PSAnKicgfHwgdGhpcy5wZWVrKCkudmFsdWUgPT09ICcvJykpe1xuICAgICAgICAgICAgY29uc3Qgb3AgPSB0aGlzLm5leHQoKS52YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZVVuYXJ5KCk7XG4gICAgICAgICAgICBsZWZ0ID0gYXJpdGgob3AsIGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVmdDtcbiAgICB9XG4gICAgcGFyc2VVbmFyeSgpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMucGVlaygpO1xuICAgICAgICBpZiAodCAmJiB0LnR5cGUgPT09ICdvcCcgJiYgKHQudmFsdWUgPT09ICctJyB8fCB0LnZhbHVlID09PSAnKycpKSB7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLnBhcnNlVW5hcnkoKTtcbiAgICAgICAgICAgIHJldHVybiB0LnZhbHVlID09PSAnLScgPyAtdG9OdW0odikgOiB0b051bSh2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVBvc3RmaXgoKTtcbiAgICB9XG4gICAgcGFyc2VQb3N0Zml4KCkge1xuICAgICAgICBsZXQgdiA9IHRoaXMucGFyc2VBdG9tKCk7XG4gICAgICAgIHdoaWxlKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgdGhpcy5wZWVrKCkudmFsdWUgPT09ICclJyl7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIHYgPSB0b051bSh2KSAvIDEwMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgcGFyc2VBdG9tKCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmICghdCkgdGhyb3cgbmV3IEVycm9yKCd1bmV4cGVjdGVkIGVuZCBvZiBmb3JtdWxhJyk7XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdudW0nKSByZXR1cm4gTnVtYmVyKHQudmFsdWUpO1xuICAgICAgICBpZiAodC50eXBlID09PSAnc3RyJykgcmV0dXJuIHQudmFsdWU7XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdib29sJykgcmV0dXJuIHQudmFsdWUgPT09ICdUUlVFJztcbiAgICAgICAgaWYgKHQudHlwZSA9PT0gJ3NoZWV0Jykge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICBpZiAoIXJlZiB8fCByZWYudHlwZSAhPT0gJ3JlZicpIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgY2VsbCByZWYgYWZ0ZXIgc2hlZXQnKTtcbiAgICAgICAgICAgIGNvbnN0IHNoZWV0V3MgPSB0aGlzLmdldFNoZWV0KHQudmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VSYW5nZU9yVmFsdWUoc2hlZXRXcywgcmVmLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodC50eXBlID09PSAncmVmJykgcmV0dXJuIHRoaXMucGFyc2VSYW5nZU9yVmFsdWUodGhpcy53cywgdC52YWx1ZSk7XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdpZGVudCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIHRoaXMucGVlaygpLnZhbHVlID09PSAnKCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jYWxsRnVuY3Rpb24odC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gaWRlbnRpZmllcjogJyArIHQudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdvcCcgJiYgdC52YWx1ZSA9PT0gJygnKSB7XG4gICAgICAgICAgICBjb25zdCB2ID0gdGhpcy5wYXJzZUV4cHIoKTtcbiAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJyknKTtcbiAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5leHBlY3RlZCB0b2tlbjogJyArIHQudmFsdWUpO1xuICAgIH1cbiAgICBwYXJzZVJhbmdlT3JWYWx1ZSh3cywgYWRkcikge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIGlmICh0ICYmIHQudHlwZSA9PT0gJ29wJyAmJiB0LnZhbHVlID09PSAnOicpIHtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgY29uc3QgZW5kID0gdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICBpZiAoIWVuZCB8fCBlbmQudHlwZSAhPT0gJ3JlZicpIHRocm93IG5ldyBFcnJvcignYmFkIHJhbmdlIGVuZCcpO1xuICAgICAgICAgICAgY29uc3QgY2VsbHMgPSB0aGlzLnJhbmdlQ2VsbHMod3MsIGFkZHIsIGVuZC52YWx1ZSk7XG4gICAgICAgICAgICBjb25zdCBjMSA9IHV0aWxzLmRlY29kZV9jZWxsKGFkZHIucmVwbGFjZSgvXFwkL2csICcnKSk7XG4gICAgICAgICAgICBjb25zdCBjMiA9IHV0aWxzLmRlY29kZV9jZWxsKGVuZC52YWx1ZS5yZXBsYWNlKC9cXCQvZywgJycpKTtcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gTWF0aC5hYnMoYzIuYyAtIGMxLmMpICsgMTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgX19yYW5nZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNlbGxzLm1hcCgoYyk9PnRoaXMucmVzb2x2ZUNlbGwoYy53cywgYy5hZGRyLCB0aGlzLmRlcHRoKSksXG4gICAgICAgICAgICAgICAgd2lkdGhcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucmVzb2x2ZUNlbGwod3MsIGFkZHIsIHRoaXMuZGVwdGgpO1xuICAgIH1cbiAgICBnZXRTaGVldChuYW1lKSB7XG4gICAgICAgIGNvbnN0IHNoZWV0ID0gdGhpcy53Yi5TaGVldHNbbmFtZV0gPz8gdGhpcy53Yi5TaGVldHNbdGhpcy53Yi5TaGVldE5hbWVzLmZpbmQoKG4pPT5uLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUudG9Mb3dlckNhc2UoKSkgPz8gJyddO1xuICAgICAgICBpZiAoIXNoZWV0KSB0aHJvdyBuZXcgRXJyb3IoJ3NoZWV0IG5vdCBmb3VuZDogJyArIG5hbWUpO1xuICAgICAgICByZXR1cm4gc2hlZXQ7XG4gICAgfVxuICAgIHJhbmdlQ2VsbHMod3MsIGEsIGIpIHtcbiAgICAgICAgY29uc3QgY2xlYW5BID0gYS5yZXBsYWNlKC9cXCQvZywgJycpO1xuICAgICAgICBjb25zdCBjbGVhbkIgPSBiLnJlcGxhY2UoL1xcJC9nLCAnJyk7XG4gICAgICAgIGNvbnN0IGNvbE9ubHkgPSAocyk9Pi9eW0EtWmEtel0rJC8udGVzdChzKTtcbiAgICAgICAgbGV0IHIxLCByMiwgY01pbiwgY01heDtcbiAgICAgICAgaWYgKGNvbE9ubHkoY2xlYW5BKSB8fCBjb2xPbmx5KGNsZWFuQikpIHtcbiAgICAgICAgICAgIC8vIFdob2xlLWNvbHVtbiByYW5nZSAoQTpBLCAkQzokQUcpOiBib3VuZCByb3dzIGJ5IHRoZSBzaGVldCdzIHVzZWQgcmFuZ2VcbiAgICAgICAgICAgIGNvbnN0IG1heFJvdyA9IHdzWychcmVmJ10gPyB1dGlscy5kZWNvZGVfcmFuZ2Uod3NbJyFyZWYnXSkuZS5yIDogMDtcbiAgICAgICAgICAgIGNvbnN0IGNvbEluZGV4ID0gKHMpPT57XG4gICAgICAgICAgICAgICAgbGV0IGMgPSAwO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2ggb2Ygcy50b1VwcGVyQ2FzZSgpKWMgPSBjICogMjYgKyAoY2guY2hhckNvZGVBdCgwKSAtIDY0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYyAtIDE7IC8vIDAtYmFzZWRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBjQSA9IGNvbE9ubHkoY2xlYW5BKSA/IGNvbEluZGV4KGNsZWFuQSkgOiB1dGlscy5kZWNvZGVfY2VsbChjbGVhbkEpLmM7XG4gICAgICAgICAgICBjb25zdCBjQiA9IGNvbE9ubHkoY2xlYW5CKSA/IGNvbEluZGV4KGNsZWFuQikgOiB1dGlscy5kZWNvZGVfY2VsbChjbGVhbkIpLmM7XG4gICAgICAgICAgICBjTWluID0gTWF0aC5taW4oY0EsIGNCKTtcbiAgICAgICAgICAgIGNNYXggPSBNYXRoLm1heChjQSwgY0IpO1xuICAgICAgICAgICAgcjEgPSAwO1xuICAgICAgICAgICAgcjIgPSBtYXhSb3c7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjMSA9IHV0aWxzLmRlY29kZV9jZWxsKGNsZWFuQSk7XG4gICAgICAgICAgICBjb25zdCBjMiA9IHV0aWxzLmRlY29kZV9jZWxsKGNsZWFuQik7XG4gICAgICAgICAgICByMSA9IE1hdGgubWluKGMxLnIsIGMyLnIpO1xuICAgICAgICAgICAgcjIgPSBNYXRoLm1heChjMS5yLCBjMi5yKTtcbiAgICAgICAgICAgIGNNaW4gPSBNYXRoLm1pbihjMS5jLCBjMi5jKTtcbiAgICAgICAgICAgIGNNYXggPSBNYXRoLm1heChjMS5jLCBjMi5jKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb3VudCA9IChyMiAtIHIxICsgMSkgKiAoY01heCAtIGNNaW4gKyAxKTtcbiAgICAgICAgaWYgKGNvdW50ID4gTUFYX1JBTkdFX0NFTExTKSB0aHJvdyBuZXcgRXJyb3IoJ3JhbmdlIHRvbyBsYXJnZScpO1xuICAgICAgICBjb25zdCBvdXQgPSBbXTtcbiAgICAgICAgZm9yKGxldCByID0gcjE7IHIgPD0gcjI7IHIrKyl7XG4gICAgICAgICAgICBmb3IobGV0IGMgPSBjTWluOyBjIDw9IGNNYXg7IGMrKyl7XG4gICAgICAgICAgICAgICAgb3V0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB3cyxcbiAgICAgICAgICAgICAgICAgICAgYWRkcjogdXRpbHMuZW5jb2RlX2NlbGwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgICByZXNvbHZlQ2VsbCh3cywgYWRkciwgZGVwdGgpIHtcbiAgICAgICAgaWYgKGRlcHRoID4gTUFYX0RFUFRIKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAvLyBBYnNvbHV0ZSByZWZzICgkQSQ3IC8gJEE3KSBtdXN0IGJlIHN0cmlwcGVkIGJlZm9yZSBrZXlpbmcgaW50byB0aGUgc2hlZXRcbiAgICAgICAgY29uc3QgY2xlYW4gPSBhZGRyLnJlcGxhY2UoL1xcJC9nLCAnJyk7XG4gICAgICAgIGNvbnN0IGNlbGwgPSB3c1tjbGVhbl07XG4gICAgICAgIC8vIEV4Y2VsIGNvZXJjZXMgcmVmZXJlbmNlcyB0byBlbXB0eS9taXNzaW5nIGNlbGxzIHRvIDAgaW4gbnVtZXJpYyBjb250ZXh0c1xuICAgICAgICAvLyAoaGFuZGxlZCBpbiB0b051bSkgYW5kIHRvIFwiXCIgaW4gdGV4dCBjb250ZXh0cyAoaGFuZGxlZCBpbiB0ZXh0IGhlbHBlcnMpLlxuICAgICAgICBpZiAoIWNlbGwpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChjZWxsLnYgIT09IHVuZGVmaW5lZCAmJiBjZWxsLnYgIT09IG51bGwpIHJldHVybiBjZWxsLnY7XG4gICAgICAgIGlmICh0eXBlb2YgY2VsbC5mID09PSAnc3RyaW5nJyAmJiBjZWxsLmYudHJpbSgpICE9PSAnJykge1xuICAgICAgICAgICAgLy8gT09YTUwgc3RvcmVzIGZvcm11bGFzIFdJVEhPVVQgdGhlIGxlYWRpbmcgJz0nOyBub3JtYWxpemUgYmVmb3JlIGV2YWx1YXRpbmdcbiAgICAgICAgICAgIGNvbnN0IGYgPSBjZWxsLmYudHJpbSgpLnN0YXJ0c1dpdGgoJz0nKSA/IGNlbGwuZi50cmltKCkgOiAnPScgKyBjZWxsLmYudHJpbSgpO1xuICAgICAgICAgICAgY29uc3Qgc3ViID0gZXZhbHVhdGVGb3JtdWxhKHRoaXMud2IsIHdzLCBmLCBkZXB0aCArIDEsIGNsZWFuKTtcbiAgICAgICAgICAgIC8vIEEgcmVmZXJlbmNlZCBjZWxsIHdob3NlIGZvcm11bGEgZmFpbHMgaXMgYSByZWFsIGVycm9yIGluIEV4Y2VsIHRvbyBcdTIwMTRcbiAgICAgICAgICAgIC8vIHByb3BhZ2F0ZSBpdCAoc28gSUZFUlJPUiBjYW4gY2F0Y2gsIGFuZCB0b3AtbGV2ZWwgc3RheXMgdW5ldmFsdWFibGUpXG4gICAgICAgICAgICAvLyBpbnN0ZWFkIG9mIHNpbGVudGx5IHRyZWF0aW5nIGl0IGFzIGFuIGVtcHR5IGNlbGwuXG4gICAgICAgICAgICBpZiAoc3ViLnVuZXZhbHVhYmxlKSB0aHJvdyBuZXcgRXJyb3IoJ3JlZmVyZW5jZWQgY2VsbCBmb3JtdWxhIHVuZXZhbHVhYmxlOiAnICsgY2xlYW4pO1xuICAgICAgICAgICAgcmV0dXJuIHN1Yi52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvKipcbiAgICogU2tpcCB0b2tlbnMgb2YgYW4gZXhwcmVzc2lvbiB3aXRob3V0IGV2YWx1YXRpbmcgKHVzZWQgZm9yIGxhenkgSUYnc1xuICAgKiB1bnRha2VuIGJyYW5jaCkuIFN0b3BzIGJlZm9yZSB0aGUgbmV4dCB0b3AtbGV2ZWwgJywnIG9yICcpJy5cbiAgICovIHNraXBFeHByKCkge1xuICAgICAgICBsZXQgZGVwdGggPSAwO1xuICAgICAgICB3aGlsZSh0aGlzLnBvcyA8IHRoaXMudG9rZW5zLmxlbmd0aCl7XG4gICAgICAgICAgICBjb25zdCB0ID0gdGhpcy50b2tlbnNbdGhpcy5wb3NdO1xuICAgICAgICAgICAgaWYgKHQudHlwZSA9PT0gJ29wJykge1xuICAgICAgICAgICAgICAgIGlmICh0LnZhbHVlID09PSAnKCcpIGRlcHRoKys7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodC52YWx1ZSA9PT0gJyknKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXB0aCA9PT0gMCkgcmV0dXJuOyAvLyBzdG9wcGVkIGJlZm9yZSAnKSdcbiAgICAgICAgICAgICAgICAgICAgZGVwdGgtLTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHQudmFsdWUgPT09ICcsJyAmJiBkZXB0aCA9PT0gMCkgcmV0dXJuOyAvLyBzdG9wcGVkIGJlZm9yZSAnLCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucG9zKys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2FsbEZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgLy8gSUYgaXMgbGF6eSBpbiBFeGNlbDogb25seSB0aGUgdGFrZW4gYnJhbmNoIGlzIGV2YWx1YXRlZCAoYXZvaWRzXG4gICAgICAgIC8vIGRpdmlkZS1ieS16ZXJvIGV0Yy4gb24gdGhlIHVudGFrZW4gYnJhbmNoKS5cbiAgICAgICAgaWYgKG5hbWUgPT09ICdJRicpIHtcbiAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJygnKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbmQgPSB0aGlzLnBhcnNlRXhwcigpO1xuICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnLCcpO1xuICAgICAgICAgICAgaWYgKHRydXRoeShjb25kKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLnBhcnNlRXhwcigpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnN1bWUgb3B0aW9uYWwgZWxzZSBicmFuY2ggd2l0aG91dCBldmFsdWF0aW5nIGl0XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgdGhpcy5wZWVrKCkudmFsdWUgPT09ICcsJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5za2lwRXhwcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmV4cGVjdE9wKCcpJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjb25kIGZhbHN5OiBza2lwIHRoZSB0aGVuLWJyYW5jaCwgZXZhbHVhdGUgdGhlIGVsc2UgYnJhbmNoXG4gICAgICAgICAgICB0aGlzLnNraXBFeHByKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJywnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMucGFyc2VFeHByKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKScpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKScpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIElGRVJST1IgZXZhbHVhdGVzIGl0cyBmaXJzdCBhcmd1bWVudCBpbiBcInNvZnRcIiBtb2RlOiBhbnkgZXJyb3IvdW5ldmFsdWFibGVcbiAgICAgICAgLy8gcmVzdWx0IGZhbGxzIGJhY2sgdG8gdGhlIHNlY29uZCBhcmd1bWVudCBpbnN0ZWFkIG9mIGZhaWxpbmcgdGhlIGZvcm11bGEuXG4gICAgICAgIGlmIChuYW1lID09PSAnSUZFUlJPUicpIHtcbiAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJygnKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0UG9zID0gdGhpcy5wb3M7XG4gICAgICAgICAgICBsZXQgZmlyc3Q7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZpcnN0ID0gdGhpcy5wYXJzZUV4cHIoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgICAgICAgICBmaXJzdCA9IHVuZGVmaW5lZDsgLy8gZXZhbHVhdGlvbiBlcnJvciAtPiB1c2UgZmFsbGJhY2tcbiAgICAgICAgICAgICAgICAvLyBPbiBhIG5lc3RlZCBlcnJvciB0aGUgY3Vyc29yIGlzIGxlZnQgbWlkLWV4cHJlc3Npb247IHNlZWsgZm9yd2FyZFxuICAgICAgICAgICAgICAgIC8vIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSB2YWx1ZSBhcmd1bWVudCB0byBpdHMgdG9wLWxldmVsICcsJyAodGhlXG4gICAgICAgICAgICAgICAgLy8gZmFsbGJhY2sgc2VwYXJhdG9yKSBvciB0byB0aGUgY2xvc2luZyAnKScgaWYgdGhlcmUgaXMgbm8gZmFsbGJhY2suXG4gICAgICAgICAgICAgICAgbGV0IGRlcHRoID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLnBvcyA9IHN0YXJ0UG9zO1xuICAgICAgICAgICAgICAgIHdoaWxlKHRoaXMucG9zIDwgdGhpcy50b2tlbnMubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdCA9IHRoaXMudG9rZW5zW3RoaXMucG9zXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQudHlwZSA9PT0gJ29wJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHQudmFsdWUgPT09ICcoJykgZGVwdGgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHQudmFsdWUgPT09ICcpJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXB0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IC8vIG5vIGZhbGxiYWNrOiBzdG9wIGF0IElGRVJST1IncyAnKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0LnZhbHVlID09PSAnLCcgJiYgZGVwdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcysrOyAvLyBjb25zdW1lIGZhbGxiYWNrIHNlcGFyYXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ29tbWEtc2VwYXJhdGVkIGZhbGxiYWNrIGFyZ3VtZW50XG4gICAgICAgICAgICBpZiAodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJywnKSB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIGNvbnN0IGZhbGxiYWNrID0gdGhpcy5wYXJzZUV4cHIoKTtcbiAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJyknKTtcbiAgICAgICAgICAgIHJldHVybiBmaXJzdCA9PT0gdW5kZWZpbmVkID8gZmFsbGJhY2sgOiBmaXJzdDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV4cGVjdE9wKCcoJyk7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBbXTtcbiAgICAgICAgaWYgKCEodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJyknKSkge1xuICAgICAgICAgICAgYXJncy5wdXNoKHRoaXMucGFyc2VFeHByKCkpO1xuICAgICAgICAgICAgd2hpbGUodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJywnKXtcbiAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2godGhpcy5wYXJzZUV4cHIoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5leHBlY3RPcCgnKScpO1xuICAgICAgICByZXR1cm4gYXBwbHlGdW5jdGlvbihuYW1lLCBhcmdzLCB0aGlzLmN1cnJlbnRDZWxsQWRkcik7XG4gICAgfVxufVxuZnVuY3Rpb24gY29tcGFyZShvcCwgYSwgYikge1xuICAgIGlmICh0eXBlb2YgYSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHN3aXRjaChvcCl7XG4gICAgICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgICAgICAgIGNhc2UgJzw+JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYSAhPT0gYjtcbiAgICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhIDwgYjtcbiAgICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhID4gYjtcbiAgICAgICAgICAgIGNhc2UgJzw9JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYSA8PSBiO1xuICAgICAgICAgICAgY2FzZSAnPj0nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhID49IGI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgeCA9IHRvTnVtKGEpLCB5ID0gdG9OdW0oYik7XG4gICAgc3dpdGNoKG9wKXtcbiAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICByZXR1cm4geCA9PT0geTtcbiAgICAgICAgY2FzZSAnPD4nOlxuICAgICAgICAgICAgcmV0dXJuIHggIT09IHk7XG4gICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgcmV0dXJuIHggPCB5O1xuICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgIHJldHVybiB4ID4geTtcbiAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgICAgcmV0dXJuIHggPD0geTtcbiAgICAgICAgY2FzZSAnPj0nOlxuICAgICAgICAgICAgcmV0dXJuIHggPj0geTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgY29tcGFyaXNvbicpO1xufVxuZnVuY3Rpb24gYXJpdGgob3AsIGEsIGIpIHtcbiAgICBjb25zdCB4ID0gdG9OdW0oYSksIHkgPSB0b051bShiKTtcbiAgICBzd2l0Y2gob3Ape1xuICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgIHJldHVybiB4ICsgeTtcbiAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICByZXR1cm4geCAtIHk7XG4gICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgcmV0dXJuIHggKiB5O1xuICAgICAgICBjYXNlICcvJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoeSA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdkaXZpZGUgYnkgemVybycpO1xuICAgICAgICAgICAgICAgIHJldHVybiB4IC8geTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnXic6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5wb3coeCwgeSk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignYmFkIG9wZXJhdG9yJyk7XG59XG5mdW5jdGlvbiBmbGF0dGVuKGFyZ3MpIHtcbiAgICBjb25zdCBvdXQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGEgb2YgYXJncyl7XG4gICAgICAgIGlmIChpc1JhbmdlKGEpKSBvdXQucHVzaCguLi5hLnZhbHVlcyk7XG4gICAgICAgIGVsc2Ugb3V0LnB1c2goYSk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59XG5mdW5jdGlvbiBudW1iZXJzKGFyZ3MpIHtcbiAgICBjb25zdCBvdXQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHYgb2YgZmxhdHRlbihhcmdzKSl7XG4gICAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpIG91dC5wdXNoKHYpO1xuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nKSBvdXQucHVzaCh2ID8gMSA6IDApO1xuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycgJiYgdi50cmltKCkgIT09ICcnKSB7XG4gICAgICAgICAgICBjb25zdCBuID0gTnVtYmVyKHYudHJpbSgpKTtcbiAgICAgICAgICAgIGlmIChpc0Zpbml0ZShuKSkgb3V0LnB1c2gobik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cbmZ1bmN0aW9uIHRvTnVtU2FmZSh2KSB7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykgcmV0dXJuIHY7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJyAmJiB2LnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgY29uc3QgbiA9IE51bWJlcih2LnRyaW0oKSk7XG4gICAgICAgIHJldHVybiBpc0Zpbml0ZShuKSA/IG4gOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG4vKiogQ29sbGFwc2Ugd2hpdGVzcGFjZSArIHRyaW0gKEV4Y2VsIFRSSU0pLiAqLyBmdW5jdGlvbiBleGNlbFRyaW0odikge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIFN0cmluZyh2ID8/ICcnKS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpO1xufVxuLyoqIEV4Y2VsIFBST1BFUjogdXBwZXJjYXNlIGZpcnN0IGxldHRlciBvZiBldmVyeSB3b3JkLCBsb3dlcmNhc2UgdGhlIHJlc3QuICovIGZ1bmN0aW9uIGV4Y2VsUHJvcGVyKHYpIHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiBcIlwiOyAvLyBFeGNlbDogZW1wdHkgY2VsbCBpbiB0ZXh0IGNvbnRleHRcbiAgICByZXR1cm4gU3RyaW5nKHYgPz8gJycpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvKF58W15BLVphLXowLTldKShbYS16XSkvZywgKF8sIHAsIGMpPT5wICsgYy50b1VwcGVyQ2FzZSgpKTtcbn1cbi8qKiBFeGNlbCBzZXJpYWwgZGF0ZSAtPiB7IHksIG0sIGQgfSBpbiB0aGUgMTkwMCBkYXRlIHN5c3RlbSAoaW5jbC4gZmFrZSAxOTAwLTAyLTI5KS4gKi8gZnVuY3Rpb24gc2VyaWFsVG9EYXRlKHNlcmlhbCkge1xuICAgIC8vIFNlcmlhbCAxID0gMTkwMC0wMS0wMTsgc2VyaWFsIDYwID0gZmFrZSAxOTAwLTAyLTI5OyBzZXJpYWwgPj0gNjEgb2Zmc2V0IGJ5IG9uZSBkYXkuXG4gICAgY29uc3QgZGF5cyA9IE1hdGguZmxvb3Ioc2VyaWFsKSArIChzZXJpYWwgPj0gNjAgPyAtMSA6IDApO1xuICAgIC8vIEV4Y2VsIHNlcmlhbCAxID0gMTkwMC0wMS0wMSA9IGJhc2UgKyAxIGRheTsgc2VyaWFsID49IDYxIGxvc2VzIHRoZSBmYWtlXG4gICAgLy8gMTkwMC0wMi0yOSAoc2VyaWFsIDYwKSwgc28gcmVhbCBlbGFwc2VkIGRheXMgPSBzZXJpYWwgLSAxLlxuICAgIGNvbnN0IG1zID0gZGF5cyAqIDg2NDAwMDAwO1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQygxODk5LCAxMSwgMzEpICsgbXMpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHk6IGRhdGUuZ2V0VVRDRnVsbFllYXIoKSxcbiAgICAgICAgbTogZGF0ZS5nZXRVVENNb250aCgpICsgMSxcbiAgICAgICAgZDogZGF0ZS5nZXRVVENEYXRlKClcbiAgICB9O1xufVxuLyoqIEJ1aWxkIGFuIEV4Y2VsIHNlcmlhbCBkYXRlIGZyb20geS9tL2QgKDE5MDAgc3lzdGVtLCBpbmNsLiBmYWtlIDE5MDAtMDItMjkpLiAqLyBmdW5jdGlvbiBkYXRlVG9TZXJpYWwoeSwgbSwgZCkge1xuICAgIGNvbnN0IGR0ID0gbmV3IERhdGUoRGF0ZS5VVEMoeSwgbSAtIDEsIGQpKTtcbiAgICBjb25zdCBzZXJpYWwgPSBNYXRoLmZsb29yKChkdC5nZXRUaW1lKCkgLSBEYXRlLlVUQygxODk5LCAxMSwgMzEpKSAvIDg2NDAwMDAwKTtcbiAgICByZXR1cm4gc2VyaWFsID49IDYwID8gc2VyaWFsICsgMSA6IHNlcmlhbDsgLy8gb2Zmc2V0IGZvciB0aGUgZmFrZSAxOTAwLTAyLTI5XG59XG4vKiogTWluaW1hbCBFeGNlbCBURVhUIGZvcm1hdHM6IG51bWVyaWMgKDAsIDAuMDAsICMsIyMwLCAjLCMjMC4wMCwgMCUsIDAuMCUpIGFuZCBkYXRlIHRva2VucyAoeXl5eSB5eSBtbW1tIG1tbSBtbSBtIGRkZGQgZGRkIGRkIGQgaGggaCBtbSBtIHNzIHMpLiBUaHJvd3Mgb24gdW5yZWNvZ25pemVkIGZvcm1hdHMuICovIGZ1bmN0aW9uIGV4Y2VsVGV4dEZvcm1hdCh2LCBmb3JtYXQpIHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIGNvbnN0IGZtdCA9IFN0cmluZyhmb3JtYXQpO1xuICAgIGNvbnN0IG51bSA9IHR5cGVvZiB2ID09PSAnbnVtYmVyJyA/IHYgOiBOdW1iZXIoU3RyaW5nKHYgPz8gJycpLnRyaW0oKSk7XG4gICAgY29uc3QgaXNEYXRlTGlrZSA9IC9beVlkRGhIbU1zU10vLnRlc3QoZm10LnJlcGxhY2UoL1teYS16QS1aXS9nLCAnJykpICYmIC95fGR8aHxzL2kudGVzdChmbXQpO1xuICAgIGlmIChpc0RhdGVMaWtlICYmIGlzRmluaXRlKG51bSkpIHtcbiAgICAgICAgY29uc3QgeyB5LCBtLCBkIH0gPSBzZXJpYWxUb0RhdGUobnVtKTtcbiAgICAgICAgY29uc3QgaG91cnMgPSBNYXRoLmZsb29yKG51bSAlIDEgKiAyNCk7XG4gICAgICAgIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKChudW0gJSAxICogMjQgLSBob3VycykgKiA2MCk7XG4gICAgICAgIGNvbnN0IHNlY29uZHMgPSBNYXRoLnJvdW5kKCgobnVtICUgMSAqIDI0IC0gaG91cnMpICogNjAgLSBtaW51dGVzKSAqIDYwKTtcbiAgICAgICAgY29uc3QgZGF5TmFtZXMgPSBbXG4gICAgICAgICAgICAnU3VuZGF5JyxcbiAgICAgICAgICAgICdNb25kYXknLFxuICAgICAgICAgICAgJ1R1ZXNkYXknLFxuICAgICAgICAgICAgJ1dlZG5lc2RheScsXG4gICAgICAgICAgICAnVGh1cnNkYXknLFxuICAgICAgICAgICAgJ0ZyaWRheScsXG4gICAgICAgICAgICAnU2F0dXJkYXknXG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IG1vbnRoTmFtZXMgPSBbXG4gICAgICAgICAgICAnSmFudWFyeScsXG4gICAgICAgICAgICAnRmVicnVhcnknLFxuICAgICAgICAgICAgJ01hcmNoJyxcbiAgICAgICAgICAgICdBcHJpbCcsXG4gICAgICAgICAgICAnTWF5JyxcbiAgICAgICAgICAgICdKdW5lJyxcbiAgICAgICAgICAgICdKdWx5JyxcbiAgICAgICAgICAgICdBdWd1c3QnLFxuICAgICAgICAgICAgJ1NlcHRlbWJlcicsXG4gICAgICAgICAgICAnT2N0b2JlcicsXG4gICAgICAgICAgICAnTm92ZW1iZXInLFxuICAgICAgICAgICAgJ0RlY2VtYmVyJ1xuICAgICAgICBdO1xuICAgICAgICBjb25zdCB3ZCA9IG5ldyBEYXRlKERhdGUuVVRDKHksIG0gLSAxLCBkKSkuZ2V0VVRDRGF5KCk7XG4gICAgICAgIGNvbnN0IHJlcCA9IHtcbiAgICAgICAgICAgICd5eXl5JzogU3RyaW5nKHkpLFxuICAgICAgICAgICAgJ3l5JzogU3RyaW5nKHkpLnNsaWNlKC0yKSxcbiAgICAgICAgICAgICdtbW1tJzogbW9udGhOYW1lc1ttIC0gMV0sXG4gICAgICAgICAgICAnbW1tJzogbW9udGhOYW1lc1ttIC0gMV0uc2xpY2UoMCwgMyksXG4gICAgICAgICAgICAnbW9uJzogU3RyaW5nKG0pLnBhZFN0YXJ0KDIsICcwJyksXG4gICAgICAgICAgICAnbW9uMSc6IFN0cmluZyhtKSxcbiAgICAgICAgICAgICdkZGRkJzogZGF5TmFtZXNbd2RdLFxuICAgICAgICAgICAgJ2RkZCc6IGRheU5hbWVzW3dkXS5zbGljZSgwLCAzKSxcbiAgICAgICAgICAgICdkZCc6IFN0cmluZyhkKS5wYWRTdGFydCgyLCAnMCcpLFxuICAgICAgICAgICAgJ2QnOiBTdHJpbmcoZCksXG4gICAgICAgICAgICAnaGgnOiBTdHJpbmcoaG91cnMpLnBhZFN0YXJ0KDIsICcwJyksXG4gICAgICAgICAgICAnaCc6IFN0cmluZyhob3VycyksXG4gICAgICAgICAgICAnbWluJzogU3RyaW5nKG1pbnV0ZXMpLnBhZFN0YXJ0KDIsICcwJyksXG4gICAgICAgICAgICAnbWluMSc6IFN0cmluZyhtaW51dGVzKSxcbiAgICAgICAgICAgICdzcyc6IFN0cmluZyhzZWNvbmRzKS5wYWRTdGFydCgyLCAnMCcpLFxuICAgICAgICAgICAgJ3MnOiBTdHJpbmcoc2Vjb25kcylcbiAgICAgICAgfTtcbiAgICAgICAgLy8gVG9rZW4tYmFzZWQgcmVwbGFjZSwgbG9uZ2VzdCBtYXRjaGVzIGZpcnN0LiBFeGNlbCBydWxlOiAnbW0nLydtJyBhcmVcbiAgICAgICAgLy8gTUlOVVRFUyB3aGVuIHRoZSBmb3JtYXQgY29udGFpbnMgYW4gaG91ciB0b2tlbiwgb3RoZXJ3aXNlIE1PTlRILlxuICAgICAgICBjb25zdCBoYXNIb3VyID0gL2gvaS50ZXN0KGZtdCk7XG4gICAgICAgIHJldHVybiBmbXQucmVwbGFjZSgveXl5eXx5eXxtbW1tfG1tbXxkZGRkfGRkZHxoaHxzc3xkZHxtbXxkfG18aHxzL2dpLCAodG9rKT0+e1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gdG9rLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnbW0nKSByZXR1cm4gaGFzSG91ciA/IHJlcFsnbWluJ10gOiByZXBbJ21vbiddO1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ20nKSByZXR1cm4gaGFzSG91ciA/IHJlcFsnbWluMSddIDogcmVwWydtb24xJ107XG4gICAgICAgICAgICByZXR1cm4gcmVwW2tleV0gPz8gdG9rO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCFpc0Zpbml0ZShudW0pKSByZXR1cm4gU3RyaW5nKHYgPz8gJycpO1xuICAgIGNvbnN0IHBjdCA9IGZtdC5pbmNsdWRlcygnJScpO1xuICAgIGNvbnN0IGRlY2ltYWxzID0gKGZtdC5tYXRjaCgvMCtcXC4oMCspLykgPz8gW10pWzFdPy5sZW5ndGggPz8gMDtcbiAgICBjb25zdCBncm91cGluZyA9IGZtdC5pbmNsdWRlcygnLCcpO1xuICAgIGNvbnN0IHZhbHVlID0gcGN0ID8gbnVtICogMTAwIDogbnVtO1xuICAgIGxldCBvdXQgPSB2YWx1ZS50b0ZpeGVkKGRlY2ltYWxzKTtcbiAgICBpZiAoZ3JvdXBpbmcpIHtcbiAgICAgICAgY29uc3QgW2ludCwgZGVjXSA9IG91dC5zcGxpdCgnLicpO1xuICAgICAgICBvdXQgPSBpbnQucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgJywnKSArIChkZWMgPyAnLicgKyBkZWMgOiAnJyk7XG4gICAgfVxuICAgIHJldHVybiBvdXQgKyAocGN0ID8gJyUnIDogJycpO1xufVxuLyoqIEV4Y2VsIG1hdGNoIGZvciBWTE9PS1VQL01BVENIOiBleGFjdCAoMCkgb3IgYXBwcm94aW1hdGUgKDEvLTEpLiBSZXR1cm5zIDEtYmFzZWQgaW5kZXggb3IgLTEuICovIGZ1bmN0aW9uIGZpbmRNYXRjaChsb29rdXAsIGFyciwgdHlwZSkge1xuICAgIGlmICh0eXBlID09PSAwKSB7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgY29uc3QgYSA9IGFycltpXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbG9va3VwID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgYSA9PT0gJ251bWJlcicgJiYgbG9va3VwID09PSBhKSByZXR1cm4gaSArIDE7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGxvb2t1cCA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGEgPT09ICdzdHJpbmcnICYmIGV4Y2VsVHJpbShsb29rdXApLnRvTG93ZXJDYXNlKCkgPT09IGV4Y2VsVHJpbShhKS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gaSArIDE7XG4gICAgICAgICAgICBpZiAoU3RyaW5nKGxvb2t1cCkudG9Mb3dlckNhc2UoKSA9PT0gU3RyaW5nKGEgPz8gJycpLnRvTG93ZXJDYXNlKCkpIHJldHVybiBpICsgMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIC8vIEFwcHJveGltYXRlOiBhc3N1bWUgYXNjZW5kaW5nICh0eXBlIDEpIC0+IGxhcmdlc3QgPD0gbG9va3VwOyBkZXNjZW5kaW5nICgtMSkgLT4gc21hbGxlc3QgPj0gbG9va3VwXG4gICAgbGV0IGJlc3QgPSAtMTtcbiAgICBpZiAodHlwZSA9PT0gMSkge1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGNvbnN0IGEgPSB0b051bVNhZmUoYXJyW2ldKTtcbiAgICAgICAgICAgIGNvbnN0IGwgPSB0b051bVNhZmUobG9va3VwKTtcbiAgICAgICAgICAgIGlmIChhICE9PSB1bmRlZmluZWQgJiYgbCAhPT0gdW5kZWZpbmVkICYmIGEgPD0gbCkgYmVzdCA9IGkgKyAxO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAtMSkge1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGNvbnN0IGEgPSB0b051bVNhZmUoYXJyW2ldKTtcbiAgICAgICAgICAgIGNvbnN0IGwgPSB0b051bVNhZmUobG9va3VwKTtcbiAgICAgICAgICAgIGlmIChhICE9PSB1bmRlZmluZWQgJiYgbCAhPT0gdW5kZWZpbmVkICYmIGEgPj0gbCAmJiAoYmVzdCA9PT0gLTEgfHwgYSA8PSB0b051bVNhZmUoYXJyW2Jlc3QgLSAxXSkpKSBiZXN0ID0gaSArIDE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJlc3Q7XG59XG4vKiogRXhjZWwgU1VNSUYgY3JpdGVyaWE6IG51bWJlciwgcGxhaW4gdGV4dCAod2lsZGNhcmRzICogPyBzdXBwb3J0ZWQpLCBvciBvcGVyYXRvci1wcmVmaXhlZCAoXCI8NVwiLCBcIj49MTAwXCIsIFwiPD4wXCIpLiAqLyBmdW5jdGlvbiBjcml0ZXJpYU1hdGNoZXModmFsdWUsIGNyaXRlcmlhKSB7XG4gICAgY29uc3QgdiA9IHZhbHVlID8/ICcnO1xuICAgIGlmICh0eXBlb2YgY3JpdGVyaWEgPT09ICdudW1iZXInKSByZXR1cm4gdHlwZW9mIHYgPT09ICdudW1iZXInID8gdiA9PT0gY3JpdGVyaWEgOiBOdW1iZXIoU3RyaW5nKHYpKSA9PT0gY3JpdGVyaWE7XG4gICAgY29uc3QgY3JpdCA9IGV4Y2VsVHJpbShjcml0ZXJpYSk7XG4gICAgaWYgKGNyaXQgPT09ICcnKSByZXR1cm4gdiA9PT0gJycgfHwgdiA9PT0gbnVsbCB8fCB2ID09PSB1bmRlZmluZWQ7XG4gICAgY29uc3QgbSA9IGNyaXQubWF0Y2goL14oPD18Pj18PD58PHw+fD0pPyguKikkL3MpO1xuICAgIGNvbnN0IG9wID0gbT8uWzFdID8/ICc9JztcbiAgICBsZXQgdGFyZ2V0ID0gbT8uWzJdID8/ICcnO1xuICAgIGNvbnN0IG51bWVyaWNUYXJnZXQgPSB0b051bVNhZmUodGFyZ2V0KTtcbiAgICBjb25zdCBudW1lcmljVmFsID0gdG9OdW1TYWZlKHYpO1xuICAgIGlmIChvcCAhPT0gJz0nICYmIG51bWVyaWNUYXJnZXQgIT09IHVuZGVmaW5lZCAmJiBudW1lcmljVmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3dpdGNoKG9wKXtcbiAgICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgICAgIHJldHVybiBudW1lcmljVmFsIDwgbnVtZXJpY1RhcmdldDtcbiAgICAgICAgICAgIGNhc2UgJzw9JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtZXJpY1ZhbCA8PSBudW1lcmljVGFyZ2V0O1xuICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bWVyaWNWYWwgPiBudW1lcmljVGFyZ2V0O1xuICAgICAgICAgICAgY2FzZSAnPj0nOlxuICAgICAgICAgICAgICAgIHJldHVybiBudW1lcmljVmFsID49IG51bWVyaWNUYXJnZXQ7XG4gICAgICAgICAgICBjYXNlICc8Pic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bWVyaWNWYWwgIT09IG51bWVyaWNUYXJnZXQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gV2lsZGNhcmQgbWF0Y2hpbmcgZm9yIGVxdWFsaXR5IChFeGNlbCAqIGFuZCA/KVxuICAgIGlmICh0YXJnZXQuaW5jbHVkZXMoJyonKSB8fCB0YXJnZXQuaW5jbHVkZXMoJz8nKSkge1xuICAgICAgICBjb25zdCByeCA9ICdeJyArIHRhcmdldC5yZXBsYWNlKC9bLiteJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKS5yZXBsYWNlKC9cXCovZywgJy4qJykucmVwbGFjZSgvXFw/L2csICcuJykgKyAnJCc7XG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKHJ4LCAnaScpLnRlc3QoU3RyaW5nKHYgPz8gJycpKTtcbiAgICB9XG4gICAgY29uc3QgczEgPSBTdHJpbmcodiA/PyAnJykudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgczIgPSB0YXJnZXQudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG9wID09PSAnPD4nKSByZXR1cm4gczEgIT09IHMyO1xuICAgIHJldHVybiBzMSA9PT0gczI7XG59XG5mdW5jdGlvbiBhcHBseUZ1bmN0aW9uKG5hbWUsIGFyZ3MsIHRoaXNDZWxsQWRkcikge1xuICAgIGNvbnN0IG51bXMgPSBudW1iZXJzKGFyZ3MpO1xuICAgIGNvbnN0IHN1bSA9ICgpPT5udW1zLnJlZHVjZSgocywgdik9PnMgKyB2LCAwKTtcbiAgICBzd2l0Y2gobmFtZSl7XG4gICAgICAgIGNhc2UgJ1NVTSc6XG4gICAgICAgICAgICByZXR1cm4gc3VtKCk7XG4gICAgICAgIGNhc2UgJ0FWRVJBR0UnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICghbnVtcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignQVZFUkFHRSBvZiBlbXB0eScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdW0oKSAvIG51bXMubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdNSU4nOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICghbnVtcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignTUlOIG9mIGVtcHR5Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWluKC4uLm51bXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdNQVgnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICghbnVtcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignTUFYIG9mIGVtcHR5Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KC4uLm51bXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdDT1VOVCc6XG4gICAgICAgICAgICByZXR1cm4gbnVtcy5sZW5ndGg7XG4gICAgICAgIGNhc2UgJ0NPVU5UQSc6XG4gICAgICAgICAgICByZXR1cm4gZmxhdHRlbihhcmdzKS5maWx0ZXIoKHYpPT52ICE9PSAnJyAmJiB2ICE9PSB1bmRlZmluZWQgJiYgdiAhPT0gbnVsbCkubGVuZ3RoO1xuICAgICAgICBjYXNlICdQUk9EVUNUJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoIW51bXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ1BST0RVQ1Qgb2YgZW1wdHknKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtcy5yZWR1Y2UoKHAsIHYpPT5wICogdiwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0FCUyc6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hYnModG9OdW0oYXJnc1swXSkpO1xuICAgICAgICBjYXNlICdJTlQnOlxuICAgICAgICAgICAgcmV0dXJuIE1hdGgudHJ1bmModG9OdW0oYXJnc1swXSkpO1xuICAgICAgICBjYXNlICdTUVJUJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdG9OdW0oYXJnc1swXSk7XG4gICAgICAgICAgICAgICAgaWYgKHYgPCAwKSB0aHJvdyBuZXcgRXJyb3IoJ1NRUlQgb2YgbmVnYXRpdmUnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHYpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdST1VORCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHRvTnVtKGFyZ3NbMF0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBhcmdzLmxlbmd0aCA+IDEgPyB0b051bShhcmdzWzFdKSA6IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgZiA9IE1hdGgucG93KDEwLCBkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh2ICogZikgLyBmO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdST1VORFVQJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdG9OdW0oYXJnc1swXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGFyZ3MubGVuZ3RoID4gMSA/IHRvTnVtKGFyZ3NbMV0pIDogMDtcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gTWF0aC5wb3coMTAsIGQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnNpZ24odikgKiBNYXRoLmNlaWwoTWF0aC5hYnModikgKiBmKSAvIGY7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1JPVU5ERE9XTic6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHRvTnVtKGFyZ3NbMF0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBhcmdzLmxlbmd0aCA+IDEgPyB0b051bShhcmdzWzFdKSA6IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgZiA9IE1hdGgucG93KDEwLCBkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5zaWduKHYpICogTWF0aC5mbG9vcihNYXRoLmFicyh2KSAqIGYpIC8gZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnTU9EJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhID0gdG9OdW0oYXJnc1swXSksIGIgPSB0b051bShhcmdzWzFdKTtcbiAgICAgICAgICAgICAgICBpZiAoYiA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdNT0QgYnkgemVybycpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhIC0gYiAqIE1hdGguZmxvb3IoYSAvIGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdQT1dFUic6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5wb3codG9OdW0oYXJnc1swXSksIHRvTnVtKGFyZ3NbMV0pKTtcbiAgICAgICAgY2FzZSAnSUYnOlxuICAgICAgICAgICAgcmV0dXJuIHRydXRoeShhcmdzWzBdKSA/IGFyZ3NbMV0gOiBhcmdzWzJdO1xuICAgICAgICBjYXNlICdTVUJUT1RBTCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gQ29kZSBpcyBhcmcgMCBcdTIwMTQgbXVzdCBOT1QgYmUgaW5jbHVkZWQgaW4gdGhlIHN1bSAoRXhjZWwgU1VCVE9UQUwoOSxybmcpID09IFNVTShybmcpKVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBNYXRoLmFicyh0b051bShhcmdzWzBdKSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvZGUgPT09IDkgfHwgY29kZSA9PT0gMTA5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhbmdlTnVtcyA9IG51bWJlcnMoYXJncy5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByYW5nZU51bXMucmVkdWNlKChzLCB2KT0+cyArIHYsIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NVQlRPVEFMIGNvZGUgJyArIGNvZGUgKyAnIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnQU5EJzpcbiAgICAgICAgICAgIHJldHVybiBmbGF0dGVuKGFyZ3MpLmV2ZXJ5KChhKT0+dHJ1dGh5KGEpKTtcbiAgICAgICAgY2FzZSAnT1InOlxuICAgICAgICAgICAgcmV0dXJuIGZsYXR0ZW4oYXJncykuc29tZSgoYSk9PnRydXRoeShhKSk7XG4gICAgICAgIGNhc2UgJ1RSSU0nOlxuICAgICAgICAgICAgcmV0dXJuIGV4Y2VsVHJpbShhcmdzWzBdKTtcbiAgICAgICAgY2FzZSAnUFJPUEVSJzpcbiAgICAgICAgICAgIHJldHVybiBleGNlbFByb3BlcihhcmdzWzBdKTtcbiAgICAgICAgY2FzZSAnQ0hPT1NFJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMF0pKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gZmxhdHRlbihhcmdzLnNsaWNlKDEpKTtcbiAgICAgICAgICAgICAgICBpZiAoaWR4IDwgMSB8fCBpZHggPiBjYW5kaWRhdGVzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdDSE9PU0UgaW5kZXggb3V0IG9mIHJhbmdlJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZXNbaWR4IC0gMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0RBVEUnOlxuICAgICAgICAgICAgcmV0dXJuIGRhdGVUb1NlcmlhbChNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMF0pKSwgTWF0aC5mbG9vcih0b051bShhcmdzWzFdKSksIE1hdGguZmxvb3IodG9OdW0oYXJnc1syXSkpKTtcbiAgICAgICAgY2FzZSAnV0VFS0RBWSc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VyaWFsID0gdG9OdW0oYXJnc1swXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IGFyZ3MubGVuZ3RoID4gMSA/IE1hdGguZmxvb3IodG9OdW0oYXJnc1sxXSkpIDogMTtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHksIG0sIGQgfSA9IHNlcmlhbFRvRGF0ZShzZXJpYWwpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGpzRGF5ID0gbmV3IERhdGUoRGF0ZS5VVEMoeSwgbSAtIDEsIGQpKS5nZXRVVENEYXkoKTsgLy8gMD1TdW5kYXlcbiAgICAgICAgICAgICAgICBzd2l0Y2godHlwZSl7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBqc0RheSArIDE7IC8vIDE9U3VuZGF5IC4uIDc9U2F0dXJkYXlcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGpzRGF5ID09PSAwID8gNyA6IGpzRGF5OyAvLyAxPU1vbmRheSAuLiA3PVN1bmRheVxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ganNEYXk7IC8vIDA9TW9uZGF5IC4uIDY9U3VuZGF5XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dFRUtEQVkgcmV0dXJuX3R5cGUgJyArIHR5cGUgKyAnIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0NPTFVNTic6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICBpZiAocmVmID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzQ2VsbEFkZHIpIHRocm93IG5ldyBFcnJvcignQ09MVU1OIHdpdGhvdXQgcmVmIG5lZWRzIGNlbGwgY29udGV4dCcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWNvZGVkID0gdXRpbHMuZGVjb2RlX2NlbGwodGhpc0NlbGxBZGRyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlY29kZWQuYyArIDE7IC8vIDEtYmFzZWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZWYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG0gPSByZWYubWF0Y2goL1tBLVphLXpdezEsM30vKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBDT0xVTU4gcmVmJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbFN0ciA9IG1bMF0udG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2ggb2YgY29sU3RyKWNvbCA9IGNvbCAqIDI2ICsgKGNoLmNoYXJDb2RlQXQoMCkgLSA2NCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2w7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ09MVU1OIG9mIHJhbmdlIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnU1VNSUYnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhbmdlQXJnID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjcml0ZXJpYSA9IGFyZ3NbMV07XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VtQXJnID0gYXJnc1syXSA/PyByYW5nZUFyZztcbiAgICAgICAgICAgICAgICBpZiAoIWlzUmFuZ2UocmFuZ2VBcmcpIHx8ICFpc1JhbmdlKHN1bUFyZykpIHRocm93IG5ldyBFcnJvcignU1VNSUYgbmVlZHMgcmFuZ2VzJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gcmFuZ2VBcmcudmFsdWVzO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1bXMgPSBzdW1BcmcudmFsdWVzO1xuICAgICAgICAgICAgICAgIGNvbnN0IG91dCA9IFtdO1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3JpdGVyaWFNYXRjaGVzKHZhbHVlc1tpXSwgY3JpdGVyaWEpKSBvdXQucHVzaCh0b051bVNhZmUoc3Vtc1tpXSA/PyAwKSA/PyAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dC5yZWR1Y2UoKHMsIHYpPT5zICsgdiwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1ZMT09LVVAnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvb2t1cCA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgY29uc3QgdGFibGUgPSBhcmdzWzFdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbElkeCA9IE1hdGguZmxvb3IodG9OdW0oYXJnc1syXSkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFwcHJveCA9IGFyZ3MubGVuZ3RoID4gMyA/IHRydXRoeShhcmdzWzNdKSA6IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1JhbmdlKHRhYmxlKSB8fCBjb2xJZHggPCAxIHx8IGNvbElkeCA+IHRhYmxlLndpZHRoKSB0aHJvdyBuZXcgRXJyb3IoJ1ZMT09LVVAgYmFkIHRhYmxlL2NvbCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0Q29sID0gW107XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93cyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvcihsZXQgciA9IDA7IHIgPCBNYXRoLmZsb29yKHRhYmxlLnZhbHVlcy5sZW5ndGggLyB0YWJsZS53aWR0aCk7IHIrKyl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9IHRhYmxlLnZhbHVlcy5zbGljZShyICogdGFibGUud2lkdGgsIChyICsgMSkgKiB0YWJsZS53aWR0aCk7XG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChyb3cpO1xuICAgICAgICAgICAgICAgICAgICBmaXJzdENvbC5wdXNoKHJvd1swXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGhpdCA9IGFwcHJveCA/IGZpbmRNYXRjaChsb29rdXAsIGZpcnN0Q29sLCAxKSA6IGZpbmRNYXRjaChsb29rdXAsIGZpcnN0Q29sLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAoaGl0ID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdWTE9PS1VQIG5vIG1hdGNoJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsID0gcm93c1toaXQgLSAxXVtjb2xJZHggLSAxXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsID09PSB1bmRlZmluZWQgPyAnJyA6IHZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnTUFUQ0gnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvb2t1cCA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgY29uc3QgYXJyID0gYXJnc1sxXTtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gYXJncy5sZW5ndGggPiAyID8gTWF0aC5mbG9vcih0b051bShhcmdzWzJdKSkgOiAxO1xuICAgICAgICAgICAgICAgIGlmICghaXNSYW5nZShhcnIpKSB0aHJvdyBuZXcgRXJyb3IoJ01BVENIIG5lZWRzIGEgcmFuZ2UnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBoaXQgPSBmaW5kTWF0Y2gobG9va3VwLCBhcnIudmFsdWVzLCB0eXBlKTtcbiAgICAgICAgICAgICAgICBpZiAoaGl0ID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdNQVRDSCBubyBtYXRjaCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBoaXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0lOREVYJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhcnIgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvd0lkeCA9IE1hdGguZmxvb3IodG9OdW0oYXJnc1sxXSkpO1xuICAgICAgICAgICAgICAgIGlmICghaXNSYW5nZShhcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByb3dJZHggPT09IDEgPyBhcnIgOiAoKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSU5ERVggb3V0IG9mIHJhbmdlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sSWR4ID0gTWF0aC5mbG9vcih0b051bShhcmdzWzJdKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IChyb3dJZHggLSAxKSAqIGFyci53aWR0aCArIChjb2xJZHggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvcyA8IDAgfHwgcG9zID49IGFyci52YWx1ZXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0lOREVYIG91dCBvZiByYW5nZScpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyLnZhbHVlc1twb3NdID8/IDA7IC8vIEV4Y2VsIGNvZXJjZXMgZW1wdHkgY2VsbHMgdG8gMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSByb3dJZHggLSAxO1xuICAgICAgICAgICAgICAgIGlmIChwb3MgPCAwIHx8IHBvcyA+PSBhcnIudmFsdWVzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdJTkRFWCBvdXQgb2YgcmFuZ2UnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyLnZhbHVlc1twb3NdID8/IDA7IC8vIEV4Y2VsIGNvZXJjZXMgZW1wdHkgY2VsbHMgdG8gMFxuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdURVhUJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmbXQgPSBTdHJpbmcoYXJnc1sxXSA/PyAnJyk7XG4gICAgICAgICAgICAgICAgaWYgKGlzUmFuZ2UoYXJnc1swXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQXJyYXkgY29udGV4dDogYXBwbHkgVEVYVCBlbGVtZW50LXdpc2UgKGUuZy4gYnVpbGRpbmcgYSBsb29rdXAgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIE1BVENIIGFnYWluc3QgYSBmb3JtYXR0ZWQgaGVhZGVyIHJvdykuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfX3JhbmdlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBhcmdzWzBdLnZhbHVlcy5tYXAoKHYpPT5leGNlbFRleHRGb3JtYXQodiwgZm10KSksXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYXJnc1swXS53aWR0aFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZXhjZWxUZXh0Rm9ybWF0KGFyZ3NbMF0sIGZtdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIGZ1bmN0aW9uOiAnICsgbmFtZSk7XG4gICAgfVxufVxuLyoqXG4gKiBSZWdleCBmYWxsYmFjayBmb3IgZm9ybXVsYXMgdGhlIHRva2VuaXplciBjYW5ub3QgcGFyc2UgKGV4b3RpYyBjaGFycykuXG4gKiBIYW5kbGVzOiBBMSwgJEEkMSwgQTE6QjUsIEE6QSwgU2hlZXQhRDcsICdTaGVldCAxJyFENy5cbiAqLyBmdW5jdGlvbiByZWdleFJlZnMoc3JjKSB7XG4gICAgY29uc3Qgb3V0ID0gW107XG4gICAgY29uc3QgcmUgPSAvKD86KD86JyhbXiddKyknfChbQS1aYS16X11bQS1aYS16MC05Xy5dKikpIT8pP1xcJD8oW0EtWmEtel17MSwzfSkoXFwkPykoXFxkKikoPzo6XFwkPyhbQS1aYS16XXsxLDN9KShcXCQ/KShcXGQqKSk/L2c7XG4gICAgbGV0IG07XG4gICAgd2hpbGUoKG0gPSByZS5leGVjKHNyYykpICE9PSBudWxsKXtcbiAgICAgICAgY29uc3QgWywgc2hlZXQsIHNoZWV0MiwgY29sLCAsIGRpZ2l0cywgZW5kQ29sLCAsIGVuZERpZ2l0c10gPSBtO1xuICAgICAgICBjb25zdCBuZXh0Q2ggPSBzcmNbbS5pbmRleCArIG1bMF0ubGVuZ3RoXTtcbiAgICAgICAgLy8gQ29sdW1uLW9ubHkgdG9rZW4gKG5vIGRpZ2l0cyk6IG9ubHkgbWVhbmluZ2Z1bCBhcyBhIHJhbmdlIHBhcnQgKEE6QSkuXG4gICAgICAgIC8vIEFsc28gc2tpcHMgaWRlbnRpZmllcnMgbGlrZSBcIlNVTUlGUyhcIiAobWF0Y2hlZCBhcyBcIlNVTVwiICsgXCJJRlMoXCIpLlxuICAgICAgICBpZiAoZGlnaXRzID09PSAnJykge1xuICAgICAgICAgICAgaWYgKG5leHRDaCAhPT0gJzonKSBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChuZXh0Q2ggPT09ICcoJykge1xuICAgICAgICAgICAgY29udGludWU7IC8vIGZ1bmN0aW9uIG5hbWUgZW5kaW5nIGluIGRpZ2l0cyAoTE9HMTAoLCBMT0cyKCwgLi4uKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFkZHIgPSBgJHtjb2x9JHtkaWdpdHN9YDtcbiAgICAgICAgaWYgKGVuZENvbCAmJiBlbmREaWdpdHMgIT09ICcnKSBvdXQucHVzaCh7XG4gICAgICAgICAgICBzaGVldDogc2hlZXQgPz8gc2hlZXQyLFxuICAgICAgICAgICAgYWRkcixcbiAgICAgICAgICAgIGVuZDogYCR7ZW5kQ29sfSR7ZW5kRGlnaXRzfWBcbiAgICAgICAgfSk7XG4gICAgICAgIGVsc2UgaWYgKGVuZENvbCkgb3V0LnB1c2goe1xuICAgICAgICAgICAgc2hlZXQ6IHNoZWV0ID8/IHNoZWV0MixcbiAgICAgICAgICAgIGFkZHIsXG4gICAgICAgICAgICBlbmQ6IGAke2VuZENvbH1gXG4gICAgICAgIH0pO1xuICAgICAgICBlbHNlIG91dC5wdXNoKHtcbiAgICAgICAgICAgIHNoZWV0OiBzaGVldCA/PyBzaGVldDIsXG4gICAgICAgICAgICBhZGRyXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDb2xsZWN0IGV2ZXJ5IGNlbGwvcmFuZ2UgcmVmZXJlbmNlIGZyb20gYSBmb3JtdWxhIHN0cmluZy5cbiAqXG4gKiBcIj1TVU0oVjQ2OlY1NClcIiAgICAgLT4gW3sgYWRkcjogXCJWNDZcIiwgZW5kOiBcIlY1NFwiIH1dXG4gKiBcIj1QTCFENyArIFBMIUQ4XCIgICAgLT4gW3sgc2hlZXQ6IFwiUExcIiwgYWRkcjogXCJEN1wiIH0sIHsgc2hlZXQ6IFwiUExcIiwgYWRkcjogXCJEOFwiIH1dXG4gKiBcIj1WNDYqMlwiICAgICAgICAgICAgLT4gW3sgYWRkcjogXCJWNDZcIiB9XVxuICpcbiAqIFVzZXMgdGhlIHNhbWUgdG9rZW5pemVyIGFzIGV2YWx1YXRlRm9ybXVsYSBzbyByZWZlcmVuY2UgZGV0ZWN0aW9uIHN0YXlzXG4gKiBjb25zaXN0ZW50IHdpdGggZXZhbHVhdGlvbjsgZmFsbHMgYmFjayB0byBhIHJlZ2V4IHBhc3Mgd2hlbiB0aGUgdG9rZW5pemVyXG4gKiByZWplY3RzIHRoZSBzdHJpbmcgKHVuZXZhbHVhYmxlIGZvcm11bGFzIHN0aWxsIGdldCB0aGVpciByZWZzIG1hcHBlZCkuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RSZWZlcmVuY2VzKHNyYykge1xuICAgIGNvbnN0IHRleHQgPSBzcmMucmVwbGFjZSgvXj0vLCAnJykudHJpbSgpO1xuICAgIGlmICghdGV4dCkgcmV0dXJuIFtdO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHRva2VucyA9IHRva2VuaXplKHRleHQpO1xuICAgICAgICBjb25zdCByZWZzID0gW107XG4gICAgICAgIGxldCBwZW5kaW5nU2hlZXQ7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgd2hpbGUoaSA8IHRva2Vucy5sZW5ndGgpe1xuICAgICAgICAgICAgY29uc3QgdCA9IHRva2Vuc1tpXTtcbiAgICAgICAgICAgIGlmICh0LnR5cGUgPT09ICdzaGVldCcpIHtcbiAgICAgICAgICAgICAgICBwZW5kaW5nU2hlZXQgPSB0LnZhbHVlO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0LnR5cGUgPT09ICdyZWYnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWRkciA9IHQudmFsdWUucmVwbGFjZSgvXFwkL2csICcnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBueHQgPSB0b2tlbnNbaSArIDFdO1xuICAgICAgICAgICAgICAgIC8vIEZ1bmN0aW9uLW5hbWUgZmFsc2UgcG9zaXRpdmVzIChMT0cxMCgsIExPRzIoKSBhcmUgdG9rZW5pemVkIGFzIHJlZnMpXG4gICAgICAgICAgICAgICAgaWYgKG54dCAmJiBueHQudHlwZSA9PT0gJ29wJyAmJiBueHQudmFsdWUgPT09ICcoJykge1xuICAgICAgICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdTaGVldCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChueHQgJiYgbnh0LnR5cGUgPT09ICdvcCcgJiYgbnh0LnZhbHVlID09PSAnOicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kVG9rID0gdG9rZW5zW2kgKyAyXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVuZFRvayAmJiBlbmRUb2sudHlwZSA9PT0gJ3JlZicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hlZXQ6IHBlbmRpbmdTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZDogZW5kVG9rLnZhbHVlLnJlcGxhY2UoL1xcJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ1NoZWV0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVmcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgc2hlZXQ6IHBlbmRpbmdTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgYWRkclxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBwZW5kaW5nU2hlZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlZnM7XG4gICAgfSBjYXRjaCAge1xuICAgICAgICByZXR1cm4gcmVnZXhSZWZzKHRleHQpO1xuICAgIH1cbn1cbi8qKlxuICogRXZhbHVhdGUgYW4gRXhjZWwgZm9ybXVsYSBzdHJpbmcgYWdhaW5zdCB0aGUgd29ya2Jvb2suXG4gKiBSZXR1cm5zIHsgdmFsdWUgfSBmb3IgZm9ybXVsYXMgd2UgY2FuIGNvbXB1dGUsIHsgdW5ldmFsdWFibGU6IHRydWUgfSBvdGhlcndpc2UuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlRm9ybXVsYSh3Yiwgd3MsIGZvcm11bGEsIGRlcHRoID0gMCwgY3VycmVudENlbGxBZGRyKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3JjID0gZm9ybXVsYS50cmltKCk7XG4gICAgICAgIGlmICghc3JjLnN0YXJ0c1dpdGgoJz0nKSkgcmV0dXJuIHtcbiAgICAgICAgICAgIHVuZXZhbHVhYmxlOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIod2IsIHdzLCBzcmMuc2xpY2UoMSksIGRlcHRoLCBjdXJyZW50Q2VsbEFkZHIpO1xuICAgICAgICBjb25zdCB2ID0gcGFyc2VyLnBhcnNlRXhwcigpO1xuICAgICAgICBpZiAoIXBhcnNlci5maW5pc2hlZCgpKSByZXR1cm4ge1xuICAgICAgICAgICAgdW5ldmFsdWFibGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgLy8gRXhjZWw6IGEgdG9wLWxldmVsIHJlZmVyZW5jZSB0byBhbiBlbXB0eS9taXNzaW5nIGNlbGwgZXZhbHVhdGVzIHRvIDAuXG4gICAgICAgIC8vIChSZWFsIGZhaWx1cmVzIFx1MjAxNCB1bnN1cHBvcnRlZC9lcnJvcmluZyByZWZlcmVuY2VkIGZvcm11bGFzIFx1MjAxNCB0aHJvdyBpblxuICAgICAgICAvLyByZXNvbHZlQ2VsbCBhbmQgYXJlIGNhdWdodCBhYm92ZSwgc28gdGhleSBzdGlsbCByZXR1cm4gdW5ldmFsdWFibGUuKVxuICAgICAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIHVuZXZhbHVhYmxlOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInICYmICFpc0Zpbml0ZSh2KSkgcmV0dXJuIHtcbiAgICAgICAgICAgIHVuZXZhbHVhYmxlOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIC8vIEJvb2xlYW5zIC0+IDEvMCBmb3IgbnVtZXJpYyBFeGNlbCBjZWxsc1xuICAgICAgICBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB2ID8gMSA6IDAsXG4gICAgICAgICAgICB1bmV2YWx1YWJsZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB2LFxuICAgICAgICAgICAgdW5ldmFsdWFibGU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfSBjYXRjaCAge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdW5ldmFsdWFibGU6IHRydWVcbiAgICAgICAgfTtcbiAgICB9XG59XG4iLCAiLyoqXG4gKiBXb3JrYm9vayBcdTIxOTIgREItc2hlZXQgbWFwcGluZyBoZWxwZXJzLlxuICpcbiAqIFRoZSBzaGVldCB2aWV3ZXIgc2VydmVzIHdvcmtib29rIGRhdGEgYXMgSlNPTiByb3dzIGtleWVkIGJ5IGNvbHVtbiBoZWFkZXJcbiAqIChkZWR1cGxpY2F0ZWQsIGUuZy4gXCJUb3RhbFwiLCBcIlRvdGFsXzJcIiksIHdpdGggYW4gYXV0b21hdGljYWxseSBkZXRlY3RlZFxuICogaGVhZGVyIHJvdy4gVGhlc2UgaGVscGVycyBhcmUgdGhlIHNpbmdsZSBzb3VyY2Ugb2YgdHJ1dGggZm9yIHRoYXQgbWFwcGluZyBcdTIwMTRcbiAqIHRoZSBzaGVldC1kYXRhIEFQSSByb3V0ZSwgdGhlIGZvcm11bGEtcmVmZXJlbmNlIG1hcHBlciwgYW5kIHRoZSBpbXBvcnQtdGltZVxuICogZm9ybXVsYSBleHRyYWN0aW9uIGFsbCB1c2UgdGhlbSBzbyBhIGZvcm11bGEgY2VsbCByZWZlcmVuY2UgKFwiVjQ2XCIpIG1hcHMgdG9cbiAqIHRoZSBleGFjdCBzYW1lIChjb2x1bW4ga2V5LCBkYXRhLXJvdyBvZmZzZXQpIHRoZSBhcHBsaWNhdGlvbiBkaXNwbGF5cy5cbiAqLyBpbXBvcnQgeyB1dGlscyB9IGZyb20gJ3hsc3gnO1xuLy8gSGVhZGVyIHJvdyBkZXRlY3Rpb24gKG1pcnJvcnMgdGhlIGxvZ2ljIGhpc3RvcmljYWxseSBkdXBsaWNhdGVkIGluIHRoZVxuLy8gc2hlZXQtZGF0YSByb3V0ZSBhbmQgd29ya2Jvb2stYW5hbHl6ZXIudHMpLlxuY29uc3QgSEVBREVSX0tFWVdPUkRTID0gL2Rlc2NyaXB0aW9ufGFtb3VudHx0b3RhbHxkYXRlfHJldmVudWV8YWNjb3VudHxuYW1lfHF0eXxwcmljZXxjb3N0fHNhbGVzfGluY29tZXxleHBlbnNlfGJhbGFuY2V8bnVtYmVyfHJlZnxwZXJpb2R8dHJhbnNhY3Rpb258ZGViaXR8Y3JlZGl0fHVuaXR8cmF0ZXxwY3R8bWFyZ2lufGJpbGxzfGNvdmVyc3xndWVzdHN8c3RhZmZ8Y29kZXx0eXBlfGNhdGVnb3J5fGl0ZW18cHJvZHVjdHxzZXJ2aWNlfGNoYXJnZXxkaXNjb3VudHx0YXh8c3VidG90YWx8bmV0fGdyb3NzL2k7XG5jb25zdCBUSVRMRV9LRVlXT1JEUyA9IC9eKHByb2ZpdFxccyomP1xccypsb3NzfGJhbGFuY2VcXHMqc2hlZXR8dHJpYWxcXHMqYmFsYW5jZXxnZW5lcmFsXFxzKmxlZGdlcnxwZXJpb2RlfHBlcmlvZHxtb250aFxccypvZnxpbnB1dFxccypkYXRhfGF1dG9cXHMqY2FsYykvaTtcbmV4cG9ydCBmdW5jdGlvbiBmaW5kSGVhZGVyUm93KHdzKSB7XG4gICAgY29uc3Qgcm93cyA9IHV0aWxzLnNoZWV0X3RvX2pzb24od3MsIHtcbiAgICAgICAgaGVhZGVyOiAxXG4gICAgfSk7XG4gICAgY29uc3QgbWF4U2NhbiA9IE1hdGgubWluKHJvd3MubGVuZ3RoLCAyMCk7XG4gICAgbGV0IGJlc3RSb3cgPSAwO1xuICAgIGxldCBiZXN0U2NvcmUgPSAwO1xuICAgIGxldCBiZXN0SGVhZGVycyA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBtYXhTY2FuOyBpKyspe1xuICAgICAgICBjb25zdCByb3cgPSByb3dzW2ldID8/IFtdO1xuICAgICAgICBjb25zdCBub25FbXB0eSA9IHJvdy5maWx0ZXIoKGMpPT5jICE9PSAnJyAmJiBjICE9PSB1bmRlZmluZWQgJiYgYyAhPT0gbnVsbCk7XG4gICAgICAgIGNvbnN0IG5vbkVtcHR5Q291bnQgPSBub25FbXB0eS5sZW5ndGg7XG4gICAgICAgIGlmIChub25FbXB0eUNvdW50ID09PSAwKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZmlyc3RDZWxsID0gU3RyaW5nKHJvd1swXSA/PyAnJykudHJpbSgpO1xuICAgICAgICBpZiAobm9uRW1wdHlDb3VudCA8PSAyICYmIFRJVExFX0tFWVdPUkRTLnRlc3QoZmlyc3RDZWxsKSkgY29udGludWU7XG4gICAgICAgIGxldCBoZWFkZXJMaWtlQ291bnQgPSAwO1xuICAgICAgICBsZXQgbnVtZXJpY0NvdW50ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIG5vbkVtcHR5KXtcbiAgICAgICAgICAgIGNvbnN0IHN0ciA9IFN0cmluZyhjZWxsKTtcbiAgICAgICAgICAgIGlmIChzdHIgPT09ICcjTi9BJyB8fCBzdHIgPT09ICcjUkVGIScgfHwgc3RyID09PSAnI1ZBTFVFIScpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKGNlbGwpO1xuICAgICAgICAgICAgY29uc3QgaXNOdW1lcmljID0gdHlwZW9mIGNlbGwgPT09ICdudW1iZXInIHx8IHR5cGVvZiBjZWxsID09PSAnc3RyaW5nJyAmJiAvXltcXGQsLi1dKyQvLnRlc3Qoc3RyLnRyaW0oKSkgJiYgaXNGaW5pdGUobnVtKTtcbiAgICAgICAgICAgIGlmIChpc051bWVyaWMgJiYgTWF0aC5hYnMobnVtKSA+IDApIG51bWVyaWNDb3VudCsrO1xuICAgICAgICAgICAgZWxzZSBpZiAoSEVBREVSX0tFWVdPUkRTLnRlc3Qoc3RyKSkgaGVhZGVyTGlrZUNvdW50Kys7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGV4dFJhdGlvID0gbm9uRW1wdHlDb3VudCA+IDAgPyAobm9uRW1wdHlDb3VudCAtIG51bWVyaWNDb3VudCkgLyBub25FbXB0eUNvdW50IDogMDtcbiAgICAgICAgY29uc3Qgc2NvcmUgPSBoZWFkZXJMaWtlQ291bnQgKiAzICsgdGV4dFJhdGlvICogMiArIChub25FbXB0eUNvdW50ID49IDMgPyAxIDogMCk7XG4gICAgICAgIGlmIChzY29yZSA+IGJlc3RTY29yZSkge1xuICAgICAgICAgICAgYmVzdFNjb3JlID0gc2NvcmU7XG4gICAgICAgICAgICBiZXN0Um93ID0gaTtcbiAgICAgICAgICAgIGJlc3RIZWFkZXJzID0gcm93Lm1hcCgoYyk9PlN0cmluZyhjID8/ICcnKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJlc3RTY29yZSA8IDIgJiYgcm93cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0Um93ID0gKHJvd3NbMF0gPz8gW10pLm1hcCgoYyk9PlN0cmluZyhjID8/ICcnKSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBoZWFkZXJSb3c6IDEsXG4gICAgICAgICAgICBoZWFkZXJzOiBmaXJzdFJvd1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBoZWFkZXJSb3c6IGJlc3RSb3cgKyAxLFxuICAgICAgICBoZWFkZXJzOiBiZXN0SGVhZGVyc1xuICAgIH07XG59XG4vKipcbiAqIEJ1aWxkIHRoZSBkZWR1cGxpY2F0ZWQgREIgY29sdW1uIGtleXMgZm9yIGEgaGVhZGVyIHJvdyAoXCJUb3RhbFwiLCBcIlRvdGFsXzJcIixcbiAqIGVtcHR5IGhlYWRlcnMgYmVjb21lIFwiX19oaWRkZW5fPG4+XCIpIFx1MjAxNCBpZGVudGljYWwgdG8gdGhlIHNoZWV0LWRhdGEgR0VULlxuICovIGV4cG9ydCBmdW5jdGlvbiBidWlsZENvbHVtbktleXMoaGVhZGVycykge1xuICAgIGNvbnN0IHNlZW4gPSBuZXcgTWFwKCk7XG4gICAgbGV0IGVtcHR5Q29sSWR4ID0gMDtcbiAgICByZXR1cm4gaGVhZGVycy5tYXAoKGgpPT57XG4gICAgICAgIGNvbnN0IHRyaW1tZWQgPSAoaCB8fCAnJykudG9TdHJpbmcoKS50cmltKCk7XG4gICAgICAgIGlmICghdHJpbW1lZCkgcmV0dXJuIGBfX2hpZGRlbl8ke2VtcHR5Q29sSWR4Kyt9YDtcbiAgICAgICAgY29uc3QgY291bnQgPSBzZWVuLmdldCh0cmltbWVkKSA/PyAwO1xuICAgICAgICBzZWVuLnNldCh0cmltbWVkLCBjb3VudCArIDEpO1xuICAgICAgICByZXR1cm4gY291bnQgPiAwID8gYCR7dHJpbW1lZH1fJHtjb3VudH1gIDogdHJpbW1lZDtcbiAgICB9KTtcbn1cbi8qKlxuICogTWFwIGFuIEV4Y2VsIGNlbGwgYWRkcmVzcyB0byB0aGUgREItc2hlZXQgY29vcmRpbmF0ZXMuXG4gKlxuICogQHBhcmFtIHdzICAgICAgICAgIHRoZSB3b3Jrc2hlZXQgdGhlIGFkZHJlc3MgYmVsb25ncyB0b1xuICogQHBhcmFtIGFkZHIgICAgICAgIEExLXN0eWxlIGFkZHJlc3MgKFwiVjQ2XCIsIFwiJEEkMVwiKVxuICogQHBhcmFtIGhlYWRlckluZm8gIHByZWNvbXB1dGVkIGZpbmRIZWFkZXJSb3cod3MpIHJlc3VsdCAocmVjb21wdXRlZCBwZXIgY2FsbFxuICogICAgICAgICAgICAgICAgICAgIGlmIG9taXR0ZWQgXHUyMDE0IHBhc3MgaXQgd2hlbiBtYXBwaW5nIG1hbnkgY2VsbHMpXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIG1hcENlbGxUb0RhdGEod3MsIGFkZHIsIGhlYWRlckluZm8pIHtcbiAgICBjb25zdCBjbGVhbiA9IGFkZHIucmVwbGFjZSgvXFwkL2csICcnKTtcbiAgICBjb25zdCBkZWNvZGVkID0gdXRpbHMuZGVjb2RlX2NlbGwoY2xlYW4pO1xuICAgIGNvbnN0IGluZm8gPSBoZWFkZXJJbmZvID8/IGZpbmRIZWFkZXJSb3cod3MpO1xuICAgIC8vIEZpcnN0IGRhdGEgcm93ID0gaGVhZGVyUm93ICsgMSBcdTIxOTIgMS1iYXNlZCBkYXRhIG9mZnNldDsgcm93cyBhdC9hYm92ZSB0aGVcbiAgICAvLyBoZWFkZXIgKHRpdGxlIHJvd3MpIGdldCByZWxSb3cgPD0gMCAvIHVuZGVmaW5lZCAodGhleSBhcmUgbm90IGRhdGEpLlxuICAgIGNvbnN0IHJlbFJvdyA9IGRlY29kZWQuciAtIGluZm8uaGVhZGVyUm93ICsgMTtcbiAgICBjb25zdCBjb2x1bW5LZXlzID0gYnVpbGRDb2x1bW5LZXlzKGluZm8uaGVhZGVycyk7XG4gICAgY29uc3QgcmF3SGVhZGVyID0gaW5mby5oZWFkZXJzW2RlY29kZWQuY10gPz8gJyc7XG4gICAgY29uc3QgY29sS2V5ID0gcmF3SGVhZGVyLnRyaW0oKSA/IGNvbHVtbktleXNbZGVjb2RlZC5jXSA6IHVuZGVmaW5lZDtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb2xLZXksXG4gICAgICAgIHJlbFJvdzogcmVsUm93ID49IDEgPyByZWxSb3cgOiB1bmRlZmluZWQsXG4gICAgICAgIGFic1JvdzogZGVjb2RlZC5yICsgMSxcbiAgICAgICAgYWJzQ29sOiBkZWNvZGVkLmMgKyAxXG4gICAgfTtcbn1cbiIsICIvKipcbiAqIFNlcmRlIGNvbXBsaWFuY2UgY2hlY2tlciBmb3Igd29ya2Zsb3cgY3VzdG9tIGNsYXNzIHNlcmlhbGl6YXRpb24uXG4gKlxuICogQW5hbHl6ZXMgc291cmNlIGNvZGUgdG8gZGV0ZXJtaW5lIGlmIGNsYXNzZXMgd2l0aCBXT1JLRkxPV19TRVJJQUxJWkUgL1xuICogV09SS0ZMT1dfREVTRVJJQUxJWkUgYXJlIGNvcnJlY3RseSBzZXQgdXAgZm9yIHRoZSB3b3JrZmxvdyBzYW5kYm94LlxuICpcbiAqIFVzZWQgYnk6XG4gKiAtIENMSSBgdmFsaWRhdGVgIGNvbW1hbmRcbiAqIC0gQ0xJIGB0cmFuc2Zvcm1gIGNvbW1hbmQgKC0tY2hlY2stc2VyZGUpXG4gKiAtIFNXQyBwbGF5Z3JvdW5kIHNlcmRlIGFuYWx5c2lzIHBhbmVsXG4gKiAtIEJ1aWxkLXRpbWUgd2FybmluZ3MgaW4gQmFzZUJ1aWxkZXJcbiAqL1xuXG5pbXBvcnQgYnVpbHRpbk1vZHVsZXMgZnJvbSAnYnVpbHRpbi1tb2R1bGVzJztcbmltcG9ydCB0eXBlIHsgV29ya2Zsb3dNYW5pZmVzdCB9IGZyb20gJy4vYXBwbHktc3djLXRyYW5zZm9ybS5qcyc7XG5cbi8vIEJ1aWxkIGEgcmVnZXggdGhhdCBtYXRjaGVzIE5vZGUuanMgYnVpbHQtaW4gbW9kdWxlIGltcG9ydHMgaW4gdHJhbnNmb3JtZWQgY29kZS5cbi8vIEhhbmRsZXMgYm90aCBFU00gKGBmcm9tICdmcydgLCBgZnJvbSAnbm9kZTpmcydgKSBhbmQgQ0pTIChgcmVxdWlyZSgnZnMnKWApXG5jb25zdCBub2RlQnVpbHRpbnMgPSBidWlsdGluTW9kdWxlcy5qb2luKCd8Jyk7XG5cbi8vIFJlZ2V4IHRvIGV4dHJhY3Qgc3BlY2lmaWMgbW9kdWxlIG5hbWVzIGZyb20gaW1wb3J0L3JlcXVpcmUgc3RhdGVtZW50c1xuY29uc3Qgbm9kZUltcG9ydEV4dHJhY3RSZWdleCA9IG5ldyBSZWdFeHAoXG4gIGAoPzpmcm9tXFxcXHMrWydcIl0oPzpub2RlOik/KCg/OiR7bm9kZUJ1aWx0aW5zfSkoPzovW14nXCJdKik/KVsnXCJdYCArXG4gICAgYHxyZXF1aXJlXFxcXHMqXFxcXChcXFxccypbJ1wiXSg/Om5vZGU6KT8oKD86JHtub2RlQnVpbHRpbnN9KSg/Oi9bXidcIl0qKT8pWydcIl1cXFxccypcXFxcKSlgLFxuICAnZydcbik7XG5cbi8vIFJlZ2V4IHRvIGRldGVjdCBjbGFzcyByZWdpc3RyYXRpb24gSUlGRXMgZ2VuZXJhdGVkIGJ5IHRoZSBTV0MgcGx1Z2luXG5jb25zdCByZWdpc3RyYXRpb25JaWZlUmVnZXggPVxuICAvU3ltYm9sXFwuZm9yXFxzKlxcKFxccypbXCInXXdvcmtmbG93LWNsYXNzLXJlZ2lzdHJ5W1wiJ11cXHMqXFwpLztcblxuLyoqXG4gKiBSZXN1bHQgb2YgY2hlY2tpbmcgYSBzaW5nbGUgY2xhc3MgZm9yIHNlcmRlIGNvbXBsaWFuY2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VyZGVDbGFzc0NoZWNrUmVzdWx0IHtcbiAgLyoqIFRoZSBjbGFzcyBuYW1lIGFzIGRldGVjdGVkIGluIHRoZSBzb3VyY2UgKi9cbiAgY2xhc3NOYW1lOiBzdHJpbmc7XG4gIC8qKiBUaGUgY2xhc3NJZCBhc3NpZ25lZCBieSB0aGUgU1dDIHBsdWdpbiAoZnJvbSB0aGUgbWFuaWZlc3QpICovXG4gIGNsYXNzSWQ6IHN0cmluZztcbiAgLyoqIFdoZXRoZXIgdGhlIFNXQyBwbHVnaW4gZGV0ZWN0ZWQgc2VyZGUgc3ltYm9scyBvbiB0aGlzIGNsYXNzICovXG4gIGRldGVjdGVkOiBib29sZWFuO1xuICAvKiogV2hldGhlciBhIHJlZ2lzdHJhdGlvbiBJSUZFIHdhcyBnZW5lcmF0ZWQgaW4gdGhlIG91dHB1dCAqL1xuICByZWdpc3RlcmVkOiBib29sZWFuO1xuICAvKipcbiAgICogTm9kZS5qcyBidWlsdC1pbiBtb2R1bGUgaW1wb3J0cyByZW1haW5pbmcgaW4gdGhlIHdvcmtmbG93LW1vZGUgb3V0cHV0LlxuICAgKiBJZiBub24tZW1wdHksIHRoZSBjbGFzcyBpcyBOT1Qgd29ya2Zsb3ctc2FuZGJveCBjb21wbGlhbnQuXG4gICAqL1xuICBub2RlSW1wb3J0czogc3RyaW5nW107XG4gIC8qKiBXaGV0aGVyIHRoZSBjbGFzcyBwYXNzZXMgYWxsIGNvbXBsaWFuY2UgY2hlY2tzICovXG4gIGNvbXBsaWFudDogYm9vbGVhbjtcbiAgLyoqIEh1bWFuLXJlYWRhYmxlIGRlc2NyaXB0aW9ucyBvZiBhbnkgaXNzdWVzIGZvdW5kICovXG4gIGlzc3Vlczogc3RyaW5nW107XG59XG5cbi8qKlxuICogRnVsbCByZXN1bHQgb2Ygc2VyZGUgY29tcGxpYW5jZSBhbmFseXNpcyBmb3IgYSBzb3VyY2UgZmlsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJkZUNoZWNrUmVzdWx0IHtcbiAgLyoqIFBlci1jbGFzcyBhbmFseXNpcyByZXN1bHRzICovXG4gIGNsYXNzZXM6IFNlcmRlQ2xhc3NDaGVja1Jlc3VsdFtdO1xuICAvKiogQWxsIE5vZGUuanMgYnVpbHQtaW4gaW1wb3J0cyBmb3VuZCBpbiB0aGUgd29ya2Zsb3ctbW9kZSBvdXRwdXQgKi9cbiAgZ2xvYmFsTm9kZUltcG9ydHM6IHN0cmluZ1tdO1xuICAvKiogV2hldGhlciB0aGUgd29ya2Zsb3ctbW9kZSBvdXRwdXQgY29udGFpbnMgYW55IHNlcmRlLXJlbGF0ZWQgY2xhc3NlcyAqL1xuICBoYXNTZXJkZUNsYXNzZXM6IGJvb2xlYW47XG4gIC8qKiBUaGUgcmF3IHdvcmtmbG93IG1hbmlmZXN0IGV4dHJhY3RlZCBmcm9tIHRoZSBTV0MgdHJhbnNmb3JtICovXG4gIG1hbmlmZXN0OiBXb3JrZmxvd01hbmlmZXN0O1xufVxuXG4vKipcbiAqIExpZ2h0d2VpZ2h0IHNlcmRlIGNvbXBsaWFuY2UgY2hlY2tlciB0aGF0IHdvcmtzIHdpdGggcHJlLWNvbXB1dGVkXG4gKiBTV0MgdHJhbnNmb3JtIHJlc3VsdHMuIFRoaXMgYXZvaWRzIHJlLXJ1bm5pbmcgdGhlIFNXQyB0cmFuc2Zvcm1cbiAqIHdoZW4gdGhlIGNhbGxlciBhbHJlYWR5IGhhcyB0aGUgb3V0cHV0cyAoZS5nLiwgdGhlIHBsYXlncm91bmQgb3IgYnVpbGRlcikuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmFseXplU2VyZGVDb21wbGlhbmNlKG9wdGlvbnM6IHtcbiAgLyoqIFNvdXJjZSBjb2RlICh1c2VkIGZvciBwYXR0ZXJuIGRldGVjdGlvbikgKi9cbiAgc291cmNlQ29kZTogc3RyaW5nO1xuICAvKiogV29ya2Zsb3ctbW9kZSB0cmFuc2Zvcm1lZCBvdXRwdXQgKi9cbiAgd29ya2Zsb3dDb2RlOiBzdHJpbmc7XG4gIC8qKiBNYW5pZmVzdCBleHRyYWN0ZWQgZnJvbSB0aGUgU1dDIHRyYW5zZm9ybSAqL1xuICBtYW5pZmVzdDogV29ya2Zsb3dNYW5pZmVzdDtcbn0pOiBTZXJkZUNoZWNrUmVzdWx0IHtcbiAgY29uc3QgeyBzb3VyY2VDb2RlLCB3b3JrZmxvd0NvZGUsIG1hbmlmZXN0IH0gPSBvcHRpb25zO1xuXG4gIC8vIDEuIEV4dHJhY3QgYWxsIE5vZGUuanMgYnVpbHQtaW4gaW1wb3J0cyBmcm9tIHRoZSB3b3JrZmxvdyBvdXRwdXRcbiAgY29uc3QgZ2xvYmFsTm9kZUltcG9ydHMgPSBleHRyYWN0Tm9kZUltcG9ydHMod29ya2Zsb3dDb2RlKTtcblxuICAvLyAyLiBDaGVjayBpZiB0aGUgbWFuaWZlc3QgY29udGFpbnMgYW55IHNlcmRlLXJlZ2lzdGVyZWQgY2xhc3Nlc1xuICBjb25zdCBjbGFzc0VudHJpZXMgPSBleHRyYWN0Q2xhc3NFbnRyaWVzKG1hbmlmZXN0KTtcbiAgY29uc3QgaGFzU2VyZGVDbGFzc2VzID0gY2xhc3NFbnRyaWVzLmxlbmd0aCA+IDA7XG5cbiAgLy8gMy4gQ2hlY2sgaWYgdGhlIHdvcmtmbG93IG91dHB1dCBjb250YWlucyByZWdpc3RyYXRpb24gSUlGRXNcbiAgY29uc3QgaGFzUmVnaXN0cmF0aW9uID0gcmVnaXN0cmF0aW9uSWlmZVJlZ2V4LnRlc3Qod29ya2Zsb3dDb2RlKTtcblxuICAvLyA0LiBBbmFseXplIGVhY2ggY2xhc3NcbiAgY29uc3QgY2xhc3NlczogU2VyZGVDbGFzc0NoZWNrUmVzdWx0W10gPSBjbGFzc0VudHJpZXMubWFwKChlbnRyeSkgPT4ge1xuICAgIGNvbnN0IGlzc3Vlczogc3RyaW5nW10gPSBbXTtcblxuICAgIC8vIENoZWNrIGZvciBOb2RlLmpzIGltcG9ydHMgKHRoZXNlIHdpbGwgZmFpbCBpbiB0aGUgd29ya2Zsb3cgc2FuZGJveClcbiAgICBpZiAoZ2xvYmFsTm9kZUltcG9ydHMubGVuZ3RoID4gMCkge1xuICAgICAgaXNzdWVzLnB1c2goXG4gICAgICAgIGBXb3JrZmxvdyBidW5kbGUgY29udGFpbnMgTm9kZS5qcyBidWlsdC1pbiBpbXBvcnRzOiAke2dsb2JhbE5vZGVJbXBvcnRzLmpvaW4oJywgJyl9LiBgICtcbiAgICAgICAgICBgVGhlc2Ugd2lsbCBmYWlsIGF0IHJ1bnRpbWUgaW4gdGhlIHdvcmtmbG93IHNhbmRib3guIGAgK1xuICAgICAgICAgIGBBZGQgXCJ1c2Ugc3RlcFwiIHRvIG1ldGhvZHMgdGhhdCBkZXBlbmQgb24gTm9kZS5qcyBBUElzIHNvIHRoZXkgYXJlIHN0cmlwcGVkIGZyb20gdGhlIHdvcmtmbG93IGJ1bmRsZS5gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciByZWdpc3RyYXRpb25cbiAgICBpZiAoIWhhc1JlZ2lzdHJhdGlvbikge1xuICAgICAgaXNzdWVzLnB1c2goXG4gICAgICAgIGBObyBjbGFzcyByZWdpc3RyYXRpb24gSUlGRSB3YXMgZ2VuZXJhdGVkLiBgICtcbiAgICAgICAgICBgRW5zdXJlIFdPUktGTE9XX1NFUklBTElaRSBhbmQgV09SS0ZMT1dfREVTRVJJQUxJWkUgYXJlIGRlZmluZWQgYXMgc3RhdGljIG1ldGhvZHMgYCArXG4gICAgICAgICAgYGluc2lkZSB0aGUgY2xhc3MgYm9keSB1c2luZyBjb21wdXRlZCBwcm9wZXJ0eSBzeW50YXg6IHN0YXRpYyBbV09SS0ZMT1dfU0VSSUFMSVpFXSguLi4pIHsgLi4uIH1gXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjbGFzc05hbWU6IGVudHJ5LmNsYXNzTmFtZSxcbiAgICAgIGNsYXNzSWQ6IGVudHJ5LmNsYXNzSWQsXG4gICAgICBkZXRlY3RlZDogdHJ1ZSxcbiAgICAgIHJlZ2lzdGVyZWQ6IGhhc1JlZ2lzdHJhdGlvbixcbiAgICAgIG5vZGVJbXBvcnRzOiBnbG9iYWxOb2RlSW1wb3J0cyxcbiAgICAgIGNvbXBsaWFudDogZ2xvYmFsTm9kZUltcG9ydHMubGVuZ3RoID09PSAwICYmIGhhc1JlZ2lzdHJhdGlvbixcbiAgICAgIGlzc3VlcyxcbiAgICB9O1xuICB9KTtcblxuICAvLyA1LiBDaGVjayBmb3IgY2xhc3NlcyB0aGF0IGhhdmUgc2VyZGUgcGF0dGVybnMgaW4gc291cmNlIGJ1dCB3ZXJlbid0IGRldGVjdGVkIGJ5IFNXQ1xuICBjb25zdCBzb3VyY2VIYXNTZXJkZVBhdHRlcm5zID1cbiAgICAvXFxbXFxzKldPUktGTE9XXyg/OlNFUklBTElaRXxERVNFUklBTElaRSlcXHMqXFxdLy50ZXN0KHNvdXJjZUNvZGUpIHx8XG4gICAgL1N5bWJvbFxcLmZvclxccypcXChcXHMqWydcIl13b3JrZmxvdy0oPzpzZXJpYWxpemV8ZGVzZXJpYWxpemUpWydcIl1cXHMqXFwpLy50ZXN0KFxuICAgICAgc291cmNlQ29kZVxuICAgICk7XG5cbiAgaWYgKHNvdXJjZUhhc1NlcmRlUGF0dGVybnMgJiYgY2xhc3NFbnRyaWVzLmxlbmd0aCA9PT0gMCkge1xuICAgIGNsYXNzZXMucHVzaCh7XG4gICAgICBjbGFzc05hbWU6ICc8dW5rbm93bj4nLFxuICAgICAgY2xhc3NJZDogJycsXG4gICAgICBkZXRlY3RlZDogZmFsc2UsXG4gICAgICByZWdpc3RlcmVkOiBmYWxzZSxcbiAgICAgIG5vZGVJbXBvcnRzOiBnbG9iYWxOb2RlSW1wb3J0cyxcbiAgICAgIGNvbXBsaWFudDogZmFsc2UsXG4gICAgICBpc3N1ZXM6IFtcbiAgICAgICAgYFNvdXJjZSBjb2RlIGNvbnRhaW5zIFdPUktGTE9XX1NFUklBTElaRS9XT1JLRkxPV19ERVNFUklBTElaRSBwYXR0ZXJucyBidXQgYCArXG4gICAgICAgICAgYHRoZSBTV0MgcGx1Z2luIGRpZCBub3QgZGV0ZWN0IGFueSBzZXJkZS1lbmFibGVkIGNsYXNzZXMuIGAgK1xuICAgICAgICAgIGBFbnN1cmUgdGhlIHN5bWJvbHMgYXJlIGRlZmluZWQgYXMgc3RhdGljIG1ldGhvZHMgSU5TSURFIHRoZSBjbGFzcyBib2R5LCBgICtcbiAgICAgICAgICBgbm90IGFzc2lnbmVkIGV4dGVybmFsbHkgKGUuZy4sIChNeUNsYXNzIGFzIGFueSlbV09SS0ZMT1dfU0VSSUFMSVpFXSA9IC4uLikuYCxcbiAgICAgIF0sXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNsYXNzZXMsXG4gICAgZ2xvYmFsTm9kZUltcG9ydHMsXG4gICAgaGFzU2VyZGVDbGFzc2VzLFxuICAgIG1hbmlmZXN0LFxuICB9O1xufVxuXG4vKipcbiAqIEV4dHJhY3QgTm9kZS5qcyBidWlsdC1pbiBtb2R1bGUgbmFtZXMgZnJvbSB0cmFuc2Zvcm1lZCBjb2RlLlxuICovXG5mdW5jdGlvbiBleHRyYWN0Tm9kZUltcG9ydHMoY29kZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICBjb25zdCBpbXBvcnRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIC8vIFJlc2V0IHJlZ2V4IHN0YXRlXG4gIG5vZGVJbXBvcnRFeHRyYWN0UmVnZXgubGFzdEluZGV4ID0gMDtcbiAgZm9yIChcbiAgICBsZXQgbWF0Y2ggPSBub2RlSW1wb3J0RXh0cmFjdFJlZ2V4LmV4ZWMoY29kZSk7XG4gICAgbWF0Y2ggIT09IG51bGw7XG4gICAgbWF0Y2ggPSBub2RlSW1wb3J0RXh0cmFjdFJlZ2V4LmV4ZWMoY29kZSlcbiAgKSB7XG4gICAgLy8gbWF0Y2hbMV0gaXMgZnJvbSB0aGUgRVNNIHBhdHRlcm4sIG1hdGNoWzJdIGlzIGZyb20gdGhlIENKUyBwYXR0ZXJuXG4gICAgY29uc3QgbW9kdWxlTmFtZSA9IG1hdGNoWzFdIHx8IG1hdGNoWzJdO1xuICAgIGlmIChtb2R1bGVOYW1lKSB7XG4gICAgICAvLyBOb3JtYWxpemUgdG8gYmFzZSBtb2R1bGUgbmFtZSAoZS5nLiwgJ2ZzL3Byb21pc2VzJyAtPiAnZnMnKVxuICAgICAgaW1wb3J0cy5hZGQobW9kdWxlTmFtZS5zcGxpdCgnLycpWzBdKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFsuLi5pbXBvcnRzXS5zb3J0KCk7XG59XG5cbi8qKlxuICogRXh0cmFjdCBjbGFzcyBlbnRyaWVzIGZyb20gYSBXb3JrZmxvd01hbmlmZXN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdENsYXNzRW50cmllcyhcbiAgbWFuaWZlc3Q6IFdvcmtmbG93TWFuaWZlc3Rcbik6IEFycmF5PHsgY2xhc3NOYW1lOiBzdHJpbmc7IGNsYXNzSWQ6IHN0cmluZzsgZmlsZU5hbWU6IHN0cmluZyB9PiB7XG4gIGNvbnN0IGVudHJpZXM6IEFycmF5PHtcbiAgICBjbGFzc05hbWU6IHN0cmluZztcbiAgICBjbGFzc0lkOiBzdHJpbmc7XG4gICAgZmlsZU5hbWU6IHN0cmluZztcbiAgfT4gPSBbXTtcbiAgaWYgKCFtYW5pZmVzdC5jbGFzc2VzKSByZXR1cm4gZW50cmllcztcblxuICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2xhc3Nlc10gb2YgT2JqZWN0LmVudHJpZXMobWFuaWZlc3QuY2xhc3NlcykpIHtcbiAgICBmb3IgKGNvbnN0IFtjbGFzc05hbWUsIHsgY2xhc3NJZCB9XSBvZiBPYmplY3QuZW50cmllcyhjbGFzc2VzKSkge1xuICAgICAgZW50cmllcy5wdXNoKHsgY2xhc3NOYW1lLCBjbGFzc0lkLCBmaWxlTmFtZSB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGVudHJpZXM7XG59XG4iLCAiaW1wb3J0IHtcbiAgQ29ycnVwdGVkRXZlbnRMb2dFcnJvcixcbiAgRW50aXR5Q29uZmxpY3RFcnJvcixcbiAgUHJlY29uZGl0aW9uRmFpbGVkRXJyb3IsXG4gIFJlcGxheURpdmVyZ2VuY2VFcnJvcixcbiAgUlVOX0VSUk9SX0NPREVTLFxuICBSdW5FeHBpcmVkRXJyb3IsXG4gIFdvcmtmbG93UnVudGltZUVycm9yLFxufSBmcm9tICdAd29ya2Zsb3cvZXJyb3JzJztcbmltcG9ydCB7IHNldFdvcmtmbG93QmFzZVBhdGggfSBmcm9tICdAd29ya2Zsb3cvdXRpbHMnO1xuaW1wb3J0IHsgcGFyc2VXb3JrZmxvd05hbWUgfSBmcm9tICdAd29ya2Zsb3cvdXRpbHMvcGFyc2UtbmFtZSc7XG5pbXBvcnQge1xuICB0eXBlIEV2ZW50LFxuICBnZXRRdWV1ZVRvcGljUHJlZml4LFxuICByZXNvbHZlUXVldWVOYW1lc3BhY2UsXG4gIFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICBTUEVDX1ZFUlNJT05fTEVHQUNZLFxuICBXb3JrZmxvd0ludm9rZVBheWxvYWRTY2hlbWEsXG4gIHR5cGUgV29ya2Zsb3dSdW4sXG59IGZyb20gJ0B3b3JrZmxvdy93b3JsZCc7XG5pbXBvcnQge1xuICBjbGFzc2lmeVJ1bkVycm9yLFxuICBpc1JldHJ5YWJsZVdvcmxkRXJyb3IsXG4gIGlzV29ybGRDb250cmFjdEVycm9yLFxufSBmcm9tICcuL2NsYXNzaWZ5LWVycm9yLmpzJztcbmltcG9ydCB7IGltcG9ydEtleSB9IGZyb20gJy4vZW5jcnlwdGlvbi5qcyc7XG5pbXBvcnQgeyBXb3JrZmxvd1N1c3BlbnNpb24gfSBmcm9tICcuL2dsb2JhbC5qcyc7XG5pbXBvcnQgeyBydW50aW1lTG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXIuanMnO1xuaW1wb3J0IHtcbiAgTUFYX1FVRVVFX0RFTElWRVJJRVMsXG4gIFJFUExBWV9ESVZFUkdFTkNFX01BWF9SRVRSSUVTLFxuICBSRVBMQVlfVElNRU9VVF9NQVhfUkVUUklFUyxcbiAgUkVQTEFZX1RJTUVPVVRfTVMsXG59IGZyb20gJy4vcnVudGltZS9jb25zdGFudHMuanMnO1xuaW1wb3J0IHtcbiAgZ2V0UXVldWVPdmVyaGVhZCxcbiAgZ2V0V29ya2Zsb3dRdWV1ZU5hbWUsXG4gIGdldFdvcmtmbG93UnVuRXZlbnRzLFxuICBoYW5kbGVIZWFsdGhDaGVja01lc3NhZ2UsXG4gIHR5cGUgTXV0YWJsZUV2ZW50TG9nLFxuICBwYXJzZUhlYWx0aENoZWNrUGF5bG9hZCxcbiAgcXVldWVNZXNzYWdlLFxuICBzdGF0ZVVwZGF0ZWRBdEZvckNyZWF0ZSxcbiAgd2l0aEhlYWx0aENoZWNrLFxuICB3aXRoUHJlY29uZGl0aW9uUmV0cnksXG59IGZyb20gJy4vcnVudGltZS9oZWxwZXJzLmpzJztcbmltcG9ydCB7IGhhbmRsZVN1c3BlbnNpb24gfSBmcm9tICcuL3J1bnRpbWUvc3VzcGVuc2lvbi1oYW5kbGVyLmpzJztcbmltcG9ydCB7IGdldFdvcmxkLCBnZXRXb3JsZEhhbmRsZXJzIH0gZnJvbSAnLi9ydW50aW1lL3dvcmxkLmpzJztcbmltcG9ydCB7IHJlbWFwRXJyb3JTdGFjayB9IGZyb20gJy4vc291cmNlLW1hcC5qcyc7XG5pbXBvcnQgKiBhcyBBdHRyaWJ1dGUgZnJvbSAnLi90ZWxlbWV0cnkvc2VtYW50aWMtY29udmVudGlvbnMuanMnO1xuaW1wb3J0IHtcbiAgbGlua1RvQ3VycmVudENvbnRleHQsXG4gIHRyYWNlLFxuICB3aXRoVHJhY2VDb250ZXh0LFxuICB3aXRoV29ya2Zsb3dCYWdnYWdlLFxufSBmcm9tICcuL3RlbGVtZXRyeS5qcyc7XG5pbXBvcnQgeyBnZXRFcnJvck5hbWUsIGdldEVycm9yU3RhY2ssIG5vcm1hbGl6ZVVua25vd25FcnJvciB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgYnVpbGRXb3JrZmxvd1N1c3BlbnNpb25NZXNzYWdlIH0gZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IHJ1bldvcmtmbG93IH0gZnJvbSAnLi93b3JrZmxvdy5qcyc7XG5cbmV4cG9ydCB0eXBlIHsgRXZlbnQsIFdvcmtmbG93UnVuIH07XG5leHBvcnQgeyBXb3JrZmxvd1N1c3BlbnNpb24gfSBmcm9tICcuL2dsb2JhbC5qcyc7XG5leHBvcnQge1xuICB0eXBlIEhlYWx0aENoZWNrRW5kcG9pbnQsXG4gIHR5cGUgSGVhbHRoQ2hlY2tPcHRpb25zLFxuICB0eXBlIEhlYWx0aENoZWNrUmVzdWx0LFxuICBoZWFsdGhDaGVjayxcbn0gZnJvbSAnLi9ydW50aW1lL2hlbHBlcnMuanMnO1xuZXhwb3J0IHtcbiAgZ2V0SG9va0J5VG9rZW4sXG4gIHJlc3VtZUhvb2ssXG4gIHJlc3VtZVdlYmhvb2ssXG59IGZyb20gJy4vcnVudGltZS9yZXN1bWUtaG9vay5qcyc7XG5leHBvcnQge1xuICBnZXRSdW4sXG4gIFJ1bixcbiAgdHlwZSBXb3JrZmxvd1JlYWRhYmxlU3RyZWFtLFxuICB0eXBlIFdvcmtmbG93UmVhZGFibGVTdHJlYW1PcHRpb25zLFxufSBmcm9tICcuL3J1bnRpbWUvcnVuLmpzJztcbmV4cG9ydCB7XG4gIGNhbmNlbFJ1bixcbiAgbGlzdFN0cmVhbXMsXG4gIHR5cGUgUmVhZFN0cmVhbU9wdGlvbnMsXG4gIHR5cGUgUmVjcmVhdGVSdW5PcHRpb25zLFxuICByZWFkU3RyZWFtLFxuICByZWNyZWF0ZVJ1bkZyb21FeGlzdGluZyxcbiAgcmVlbnF1ZXVlUnVuLFxuICB0eXBlIFN0b3BTbGVlcE9wdGlvbnMsXG4gIHR5cGUgU3RvcFNsZWVwUmVzdWx0LFxuICB3YWtlVXBSdW4sXG59IGZyb20gJy4vcnVudGltZS9ydW5zLmpzJztcbmV4cG9ydCB7XG4gIHR5cGUgU3RhcnRPcHRpb25zLFxuICB0eXBlIFN0YXJ0T3B0aW9uc0Jhc2UsXG4gIHR5cGUgU3RhcnRPcHRpb25zV2l0aERlcGxveW1lbnRJZCxcbiAgdHlwZSBTdGFydE9wdGlvbnNXaXRob3V0RGVwbG95bWVudElkLFxuICBzdGFydCxcbn0gZnJvbSAnLi9ydW50aW1lL3N0YXJ0LmpzJztcbmV4cG9ydCB7IHN0ZXBFbnRyeXBvaW50IH0gZnJvbSAnLi9ydW50aW1lL3N0ZXAtaGFuZGxlci5qcyc7XG5leHBvcnQge1xuICBjcmVhdGVXb3JsZCxcbiAgZ2V0V29ybGQsXG4gIGdldFdvcmxkSGFuZGxlcnMsXG4gIHNldFdvcmxkLFxufSBmcm9tICcuL3J1bnRpbWUvd29ybGQuanMnO1xuXG5mdW5jdGlvbiBoYXNSZWNvcmRlZFRlcm1pbmFsUnVuRXZlbnQoZXZlbnRzOiBFdmVudFtdLCBydW5JZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IHRlcm1pbmFsRXZlbnQgPSBldmVudHMuZmluZChcbiAgICAoZXZlbnQpID0+XG4gICAgICBldmVudC5ydW5JZCA9PT0gcnVuSWQgJiZcbiAgICAgIChldmVudC5ldmVudFR5cGUgPT09ICdydW5fY29tcGxldGVkJyB8fFxuICAgICAgICBldmVudC5ldmVudFR5cGUgPT09ICdydW5fZmFpbGVkJyB8fFxuICAgICAgICBldmVudC5ldmVudFR5cGUgPT09ICdydW5fY2FuY2VsbGVkJylcbiAgKTtcblxuICBpZiAoIXRlcm1pbmFsRXZlbnQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgJ1dvcmtmbG93IGV2ZW50IGxvZyBhbHJlYWR5IGNvbnRhaW5zIGEgdGVybWluYWwgcnVuIGV2ZW50LCBza2lwcGluZyByZXBsYXknLFxuICAgIHtcbiAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgZXZlbnRUeXBlOiB0ZXJtaW5hbEV2ZW50LmV2ZW50VHlwZSxcbiAgICAgIGV2ZW50SWQ6IHRlcm1pbmFsRXZlbnQuZXZlbnRJZCxcbiAgICB9XG4gICk7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhIHNpbmdsZSByb3V0ZSB3aGljaCBoYW5kbGVzIGFueSB3b3JrZmxvdyBleGVjdXRpb25cbiAqIHJlcXVlc3QgYW5kIHJvdXRlcyB0byB0aGUgYXBwcm9wcmlhdGUgd29ya2Zsb3cgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHdvcmtmbG93Q29kZSAtIFRoZSB3b3JrZmxvdyBidW5kbGUgY29kZSBjb250YWluaW5nIGFsbCB0aGUgd29ya2Zsb3dcbiAqIGZ1bmN0aW9ucyBhdCB0aGUgdG9wIGxldmVsLlxuICogQHJldHVybnMgQSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIGFzIGEgVmVyY2VsIEFQSSByb3V0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdvcmtmbG93RW50cnlwb2ludChcbiAgd29ya2Zsb3dDb2RlOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiB7IG5hbWVzcGFjZT86IHN0cmluZzsgYmFzZVBhdGg/OiBzdHJpbmcgfVxuKTogKHJlcTogUmVxdWVzdCkgPT4gUHJvbWlzZTxSZXNwb25zZT4ge1xuICBzZXRXb3JrZmxvd0Jhc2VQYXRoKG9wdGlvbnM/LmJhc2VQYXRoKTtcblxuICBjb25zdCBuYW1lc3BhY2UgPSByZXNvbHZlUXVldWVOYW1lc3BhY2Uob3B0aW9ucz8ubmFtZXNwYWNlKTtcbiAgY29uc3Qgd29ya2Zsb3dQcmVmaXggPSBnZXRRdWV1ZVRvcGljUHJlZml4KCd3b3JrZmxvdycsIG5hbWVzcGFjZSk7XG5cbiAgY29uc3QgeyBjcmVhdGVRdWV1ZUhhbmRsZXIsIHNwZWNWZXJzaW9uOiB3b3JsZFNwZWNWZXJzaW9uIH0gPVxuICAgIGdldFdvcmxkSGFuZGxlcnMoKTtcbiAgY29uc3QgaGFuZGxlciA9IGNyZWF0ZVF1ZXVlSGFuZGxlcihcbiAgICB3b3JrZmxvd1ByZWZpeCxcbiAgICBhc3luYyAobWVzc2FnZV8sIG1ldGFkYXRhKSA9PiB7XG4gICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgaGVhbHRoIGNoZWNrIG1lc3NhZ2VcbiAgICAgIC8vIE5PVEU6IEhlYWx0aCBjaGVjayBtZXNzYWdlcyBhcmUgaW50ZW50aW9uYWxseSB1bmF1dGhlbnRpY2F0ZWQgZm9yIG1vbml0b3JpbmcgcHVycG9zZXMuXG4gICAgICAvLyBUaGV5IG9ubHkgd3JpdGUgYSBzaW1wbGUgc3RhdHVzIHJlc3BvbnNlIHRvIGEgc3RyZWFtIGFuZCBkbyBub3QgZXhwb3NlIHNlbnNpdGl2ZSBkYXRhLlxuICAgICAgLy8gVGhlIHN0cmVhbSBuYW1lIGluY2x1ZGVzIGEgdW5pcXVlIGNvcnJlbGF0aW9uSWQgdGhhdCBtdXN0IGJlIGtub3duIGJ5IHRoZSBjYWxsZXIuXG4gICAgICBjb25zdCBoZWFsdGhDaGVjayA9IHBhcnNlSGVhbHRoQ2hlY2tQYXlsb2FkKG1lc3NhZ2VfKTtcbiAgICAgIGlmIChoZWFsdGhDaGVjaykge1xuICAgICAgICBhd2FpdCBoYW5kbGVIZWFsdGhDaGVja01lc3NhZ2UoXG4gICAgICAgICAgaGVhbHRoQ2hlY2ssXG4gICAgICAgICAgJ3dvcmtmbG93JyxcbiAgICAgICAgICB3b3JsZFNwZWNWZXJzaW9uXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qge1xuICAgICAgICBydW5JZCxcbiAgICAgICAgdHJhY2VDYXJyaWVyOiB0cmFjZUNvbnRleHQsXG4gICAgICAgIHJlcXVlc3RlZEF0LFxuICAgICAgICByZXBsYXlEaXZlcmdlbmNlLFxuICAgICAgICBydW5JbnB1dCxcbiAgICAgIH0gPSBXb3JrZmxvd0ludm9rZVBheWxvYWRTY2hlbWEucGFyc2UobWVzc2FnZV8pO1xuICAgICAgY29uc3QgeyByZXF1ZXN0SWQgfSA9IG1ldGFkYXRhO1xuICAgICAgLy8gRXh0cmFjdCB0aGUgd29ya2Zsb3cgbmFtZSBmcm9tIHRoZSB0b3BpYyBuYW1lXG4gICAgICBjb25zdCB3b3JrZmxvd05hbWUgPSBtZXRhZGF0YS5xdWV1ZU5hbWUuc2xpY2Uod29ya2Zsb3dQcmVmaXgubGVuZ3RoKTtcblxuICAgICAgLy8gLS0tIE1heCBkZWxpdmVyeSBjaGVjayAtLS1cbiAgICAgIC8vIEVuZm9yY2UgbWF4IGRlbGl2ZXJ5IGxpbWl0IGJlZm9yZSBhbnkgaW5mcmFzdHJ1Y3R1cmUgY2FsbHMuXG4gICAgICAvLyBUaGlzIHByZXZlbnRzIHJ1bmF3YXkgd29ya2Zsb3dzIGZyb20gY29uc3VtaW5nIGluZmluaXRlIHF1ZXVlIGRlbGl2ZXJpZXMuXG4gICAgICAvLyBBdCB0aGlzIHBvaW50LCB3ZSB3YW50IHRvIGRvIHRoZSBtaW5pbWFsIGFtb3VudCBvZiB3b3JrIChubyBmZXRjaGluZ1xuICAgICAgLy8gb2YgdGhlIHdvcmtmbG93IGV2ZW50cywgZXRjLiBXZSBzaW1wbHkgYXR0ZW1wdCB0byBtYXJrIHRoZSBydW4gYXMgZmFpbGVkXG4gICAgICAvLyBhbmQgaWYgdGhhdCBmYWlscywgdGhlIG1lc3NhZ2UgaXMgc3RpbGwgY29uc3VtZWQgYnV0IHdpdGggYWRlcXVhdGUgbG9nZ2luZ1xuICAgICAgLy8gdGhhdCBhbiBlcnJvciBvY2N1cnJlZCBwcmV2ZW50aW5nIHVzIGZyb20gZmFpbGluZyB0aGUgcnVuLlxuICAgICAgaWYgKG1ldGFkYXRhLmF0dGVtcHQgPiBNQVhfUVVFVUVfREVMSVZFUklFUykge1xuICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgIGBXb3JrZmxvdyBoYW5kbGVyIGV4Y2VlZGVkIG1heCBkZWxpdmVyaWVzICgke21ldGFkYXRhLmF0dGVtcHR9LyR7TUFYX1FVRVVFX0RFTElWRVJJRVN9KWAsXG4gICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCwgd29ya2Zsb3dOYW1lLCBhdHRlbXB0OiBtZXRhZGF0YS5hdHRlbXB0IH1cbiAgICAgICAgKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB3b3JsZCA9IGdldFdvcmxkKCk7XG4gICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fZmFpbGVkJyxcbiAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYFdvcmtmbG93IGV4Y2VlZGVkIG1heGltdW0gcXVldWUgZGVsaXZlcmllcyAoJHttZXRhZGF0YS5hdHRlbXB0fS8ke01BWF9RVUVVRV9ERUxJVkVSSUVTfSlgLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuTUFYX0RFTElWRVJJRVNfRVhDRUVERUQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGlmIChFbnRpdHlDb25mbGljdEVycm9yLmlzKGVycikgfHwgUnVuRXhwaXJlZEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgIC8vIFJ1biBhbHJlYWR5IGZpbmlzaGVkLCBjb25zdW1lIHRoZSBtZXNzYWdlIHNpbGVudGx5XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICBgRmFpbGVkIHRvIG1hcmsgcnVuIGFzIGZhaWxlZCBhZnRlciAke21ldGFkYXRhLmF0dGVtcHR9IGRlbGl2ZXJ5IGF0dGVtcHRzLiBgICtcbiAgICAgICAgICAgICAgYEEgcGVyc2lzdGVudCBlcnJvciBpcyBwcmV2ZW50aW5nIHRoZSBydW4gZnJvbSBiZWluZyB0ZXJtaW5hdGVkLiBgICtcbiAgICAgICAgICAgICAgYFRoZSBydW4gd2lsbCByZW1haW4gaW4gaXRzIGN1cnJlbnQgc3RhdGUgdW50aWwgbWFudWFsbHkgcmVzb2x2ZWQuIGAgK1xuICAgICAgICAgICAgICBgVGhpcyBpcyBtb3N0IGxpa2VseSBkdWUgdG8gYSBwZXJzaXN0ZW50IG91dGFnZSBvZiB0aGUgd29ya2Zsb3cgYmFja2VuZCBgICtcbiAgICAgICAgICAgICAgYG9yIGEgYnVnIGluIHRoZSB3b3JrZmxvdyBydW50aW1lIGFuZCBzaG91bGQgYmUgcmVwb3J0ZWQgdG8gdGhlIFdvcmtmbG93IHRlYW0uYCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgIGVycm9yOiBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVyciksXG4gICAgICAgICAgICAgIGF0dGVtcHQ6IG1ldGFkYXRhLmF0dGVtcHQsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNwYW5MaW5rcyA9IGF3YWl0IGxpbmtUb0N1cnJlbnRDb250ZXh0KCk7XG5cbiAgICAgIC8vIC0tLSBSZXBsYXkgdGltZW91dCBndWFyZCAtLS1cbiAgICAgIC8vIElmIHRoZSByZXBsYXkgdGFrZXMgbG9uZ2VyIHRoYW4gdGhlIHRpbWVvdXQsIGZhaWwgdGhlIHJ1biBhbmQgZXhpdC5cbiAgICAgIC8vIFRoaXMgbXVzdCBiZSBsb3dlciB0aGFuIHRoZSBmdW5jdGlvbidzIG1heER1cmF0aW9uIHRvIGVuc3VyZVxuICAgICAgLy8gdGhlIGZhaWx1cmUgaXMgcmVjb3JkZWQgYmVmb3JlIHRoZSBwbGF0Zm9ybSBraWxscyB0aGUgZnVuY3Rpb24uXG4gICAgICBsZXQgcmVwbGF5VGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCB1bmRlZmluZWQ7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuVkVSQ0VMX1VSTCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJlcGxheVRpbWVvdXQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKCdXb3JrZmxvdyByZXBsYXkgZXhjZWVkZWQgdGltZW91dCcsIHtcbiAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgdGltZW91dE1zOiBSRVBMQVlfVElNRU9VVF9NUyxcbiAgICAgICAgICAgIGF0dGVtcHQ6IG1ldGFkYXRhLmF0dGVtcHQsXG4gICAgICAgICAgICBtYXhSZXRyaWVzOiBSRVBMQVlfVElNRU9VVF9NQVhfUkVUUklFUyxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIEFsbG93IGEgZmV3IHJldHJpZXMgYmVmb3JlIHBlcm1hbmVudGx5IGZhaWxpbmcgdGhlIHJ1bi5cbiAgICAgICAgICAvLyBPbiBlYXJseSBhdHRlbXB0cywganVzdCBleGl0IHNvIHRoZSBxdWV1ZSByZXRyaWVzIHRoZSBtZXNzYWdlLlxuICAgICAgICAgIGlmIChtZXRhZGF0YS5hdHRlbXB0IDw9IFJFUExBWV9USU1FT1VUX01BWF9SRVRSSUVTKSB7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHdvcmxkID0gYXdhaXQgZ2V0V29ybGQoKTtcbiAgICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2ZhaWxlZCcsXG4gICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYFdvcmtmbG93IHJlcGxheSBleGNlZWRlZCBtYXhpbXVtIGR1cmF0aW9uICgke1JFUExBWV9USU1FT1VUX01TIC8gMTAwMH1zKSBhZnRlciAke21ldGFkYXRhLmF0dGVtcHR9IGF0dGVtcHRzYCxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5SRVBMQVlfVElNRU9VVCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gQmVzdCBlZmZvcnQg4oCUIHByb2Nlc3MgZXhpdHMgcmVnYXJkbGVzc1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBOb3RlIHRoYXQgdGhpcyBhbHNvIHByZXZlbnRzIHRoZSBydW50aW1lIGZyb20gYWNraW5nIHRoZSBxdWV1ZSBtZXNzYWdlLFxuICAgICAgICAgIC8vIHNvIHRoZSBxdWV1ZSB3aWxsIGNhbGwgYmFjayBvbmNlLCBhZnRlciB3aGljaCBhIDQxMCB3aWxsIGdldCBpdCB0byBleGl0IGVhcmx5LlxuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfSwgUkVQTEFZX1RJTUVPVVRfTVMpO1xuICAgICAgICByZXBsYXlUaW1lb3V0LnVucmVmKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEludm9rZSB1c2VyIHdvcmtmbG93IHdpdGhpbiB0aGUgcHJvcGFnYXRlZCB0cmFjZSBjb250ZXh0IGFuZCBiYWdnYWdlXG4gICAgICByZXR1cm4gYXdhaXQgd2l0aFRyYWNlQ29udGV4dCh0cmFjZUNvbnRleHQsIGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gU2V0IHdvcmtmbG93IGNvbnRleHQgYXMgYmFnZ2FnZSBmb3IgYXV0b21hdGljIHByb3BhZ2F0aW9uXG4gICAgICAgIHJldHVybiBhd2FpdCB3aXRoV29ya2Zsb3dCYWdnYWdlKFxuICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQsIHdvcmtmbG93TmFtZSB9LFxuICAgICAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHdvcmxkID0gZ2V0V29ybGQoKTtcbiAgICAgICAgICAgIHJldHVybiB0cmFjZShcbiAgICAgICAgICAgICAgYFdPUktGTE9XICR7d29ya2Zsb3dOYW1lfWAsXG4gICAgICAgICAgICAgIHsgbGlua3M6IHNwYW5MaW5rcyB9LFxuICAgICAgICAgICAgICBhc3luYyAoc3BhbikgPT4ge1xuICAgICAgICAgICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93TmFtZSh3b3JrZmxvd05hbWUpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93T3BlcmF0aW9uKCdleGVjdXRlJyksXG4gICAgICAgICAgICAgICAgICAvLyBTdGFuZGFyZCBPVEVMIG1lc3NhZ2luZyBjb252ZW50aW9uc1xuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLk1lc3NhZ2luZ1N5c3RlbSgndmVyY2VsLXF1ZXVlJyksXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuTWVzc2FnaW5nRGVzdGluYXRpb25OYW1lKG1ldGFkYXRhLnF1ZXVlTmFtZSksXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuTWVzc2FnaW5nTWVzc2FnZUlkKG1ldGFkYXRhLm1lc3NhZ2VJZCksXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuTWVzc2FnaW5nT3BlcmF0aW9uVHlwZSgncHJvY2VzcycpLFxuICAgICAgICAgICAgICAgICAgLi4uZ2V0UXVldWVPdmVyaGVhZCh7IHJlcXVlc3RlZEF0IH0pLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogdmFsaWRhdGUgYHdvcmtmbG93TmFtZWAgZXhpc3RzIGJlZm9yZSBjb25zdW1pbmcgbWVzc2FnZT9cblxuICAgICAgICAgICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuSWQocnVuSWQpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93VHJhY2VQcm9wYWdhdGVkKCEhdHJhY2VDb250ZXh0KSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGxldCB3b3JrZmxvd1N0YXJ0ZWRBdCA9IC0xO1xuICAgICAgICAgICAgICAgIGxldCB3b3JrZmxvd1J1bjogV29ya2Zsb3dSdW4gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgLy8gUHJlLWxvYWRlZCBldmVudHMgZnJvbSB0aGUgcnVuX3N0YXJ0ZWQgcmVzcG9uc2UuXG4gICAgICAgICAgICAgICAgLy8gV2hlbiBwcmVzZW50LCB3ZSBza2lwIHRoZSBldmVudHMubGlzdCBjYWxsLlxuICAgICAgICAgICAgICAgIGxldCBwcmVsb2FkZWRFdmVudHM6IEV2ZW50W10gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgbGV0IHByZWxvYWRlZEV2ZW50c0N1cnNvcjogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgIC8vIC0tLSBJbmZyYXN0cnVjdHVyZTogcHJlcGFyZSB0aGUgcnVuIHN0YXRlIC0tLVxuICAgICAgICAgICAgICAgIC8vIEFsd2F5cyBjYWxsIHJ1bl9zdGFydGVkIGRpcmVjdGx5IOKAlCB0aGlzIGJvdGggdHJhbnNpdGlvbnNcbiAgICAgICAgICAgICAgICAvLyB0aGUgcnVuIHRvICdydW5uaW5nJyBBTkQgcmV0dXJucyB0aGUgcnVuIGVudGl0eSwgc2F2aW5nXG4gICAgICAgICAgICAgICAgLy8gYSBzZXBhcmF0ZSBydW5zLmdldCByb3VuZC10cmlwLlxuICAgICAgICAgICAgICAgIC8vIENvbnRyYWN0OiBldmVudHMuY3JlYXRlKCdydW5fc3RhcnRlZCcpIG11c3QgYmUgaWRlbXBvdGVudFxuICAgICAgICAgICAgICAgIC8vIGZvciBydW5zIGFscmVhZHkgaW4gJ3J1bm5pbmcnIHN0YXR1cyAocmV0dXJuIHRoZSBydW5cbiAgICAgICAgICAgICAgICAvLyB3aXRob3V0IGVycm9yKSwgbm90IGp1c3QgZm9yIHBlbmRpbmcg4oaSIHJ1bm5pbmcgdHJhbnNpdGlvbnMuXG4gICAgICAgICAgICAgICAgLy8gTmV0d29yay9zZXJ2ZXIgZXJyb3JzIHByb3BhZ2F0ZSB0byB0aGUgcXVldWUgaGFuZGxlciBmb3IgcmV0cnkuXG4gICAgICAgICAgICAgICAgLy8gV29ya2Zsb3dSdW50aW1lRXJyb3IgKGRhdGEgaW50ZWdyaXR5IGlzc3VlcykgYXJlIGZhdGFsIGFuZFxuICAgICAgICAgICAgICAgIC8vIHByb2R1Y2UgcnVuX2ZhaWxlZCBzaW5jZSByZXRyeWluZyB3b24ndCBmaXggdGhlbS5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fc3RhcnRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gVXNlIHRoZSBzcGVjIHZlcnNpb24gZnJvbSB0aGUgb3JpZ2luYWwgc3RhcnQoKSBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gd2hlbiBhdmFpbGFibGUsIHNvIHRoZSByZXNpbGllbnQgc3RhcnQgcGF0aCBjcmVhdGVzXG4gICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHJ1biB3aXRoIHRoZSBjb3JyZWN0IHZlcnNpb24gKG5vdCBhbHdheXMgY3VycmVudCkuXG4gICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5JbnB1dD8uc3BlY1ZlcnNpb24gPz8gU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gUGFzcyBydW4gaW5wdXQgZnJvbSBxdWV1ZSBzbyB0aGUgc2VydmVyIGNhblxuICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgcnVuIGlmIHJ1bl9jcmVhdGVkIHdhcyBtaXNzZWQuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gVWludDhBcnJheSB2YWx1ZXMgc3Vydml2ZSB0aGUgcXVldWUgbmF0aXZlbHlcbiAgICAgICAgICAgICAgICAgICAgICAvLyAoQ0JPUiBvbiB3b3JsZC12ZXJjZWwsIEpTT04gcmV2aXZlciBvbiB3b3JsZC1sb2NhbCkuXG4gICAgICAgICAgICAgICAgICAgICAgLi4uKHJ1bklucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBydW5JbnB1dC5pbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveW1lbnRJZDogcnVuSW5wdXQuZGVwbG95bWVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiBydW5JbnB1dC53b3JrZmxvd05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRpb25Db250ZXh0OiBydW5JbnB1dC5leGVjdXRpb25Db250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDoge30pLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQucnVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgRXZlbnQgY3JlYXRpb24gZm9yICdydW5fc3RhcnRlZCcgZGlkIG5vdCByZXR1cm4gdGhlIHJ1biBlbnRpdHkgZm9yIHJ1biBcIiR7cnVuSWR9XCJgXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1biA9IHJlc3VsdC5ydW47XG5cbiAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSByZXNwb25zZSBpbmNsdWRlcyBldmVudHMsIHVzZSB0aGVtIHRvIHNraXBcbiAgICAgICAgICAgICAgICAgIC8vIHRoZSBpbml0aWFsIGV2ZW50cy5saXN0IGNhbGwgYW5kIHJlZHVjZSBUVEZCLlxuICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZXZlbnRzICYmXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ldmVudHMubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuaGFzTW9yZSAhPT0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWRlZEV2ZW50cyA9IHJlc3VsdC5ldmVudHM7XG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWRlZEV2ZW50c0N1cnNvciA9IHJlc3VsdC5jdXJzb3I7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmICghd29ya2Zsb3dSdW4uc3RhcnRlZEF0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgV29ya2Zsb3cgcnVuIFwiJHtydW5JZH1cIiBoYXMgbm8gXCJzdGFydGVkQXRcIiB0aW1lc3RhbXBgXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAvLyBSdW4gd2FzIGNvbmN1cnJlbnRseSBjb21wbGV0ZWQvZmFpbGVkL2NhbmNlbGxlZFxuICAgICAgICAgICAgICAgICAgaWYgKEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZXJyKSB8fCBSdW5FeHBpcmVkRXJyb3IuaXMoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBFbnRpdHlDb25mbGljdEVycm9yOiBydW4gd2FzIGNvbmN1cnJlbnRseVxuICAgICAgICAgICAgICAgICAgICAvLyBjb21wbGV0ZWQvZmFpbGVkL2NhbmNlbGxlZCBkdXJpbmcgc2V0dXAuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJ1bkV4cGlyZWRFcnJvcjogcnVuIGFscmVhZHkgaW4gdGVybWluYWwgc3RhdGUuXG4gICAgICAgICAgICAgICAgICAgIC8vIEluIGJvdGggY2FzZXMsIHNraXAgcHJvY2Vzc2luZyB0aGlzIG1lc3NhZ2UuXG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgICAnUnVuIGFscmVhZHkgZmluaXNoZWQgZHVyaW5nIHNldHVwLCBza2lwcGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCwgbWVzc2FnZTogZXJyLm1lc3NhZ2UgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVyciBpbnN0YW5jZW9mIFdvcmtmbG93UnVudGltZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHJ1bnRpbWUgZXJyb3IgZHVyaW5nIHdvcmtmbG93IHNldHVwJyxcbiAgICAgICAgICAgICAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkLCBlcnJvcjogZXJyLm1lc3NhZ2UgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2ZhaWxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLlJVTlRJTUVfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGZhaWxFcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBFbnRpdHlDb25mbGljdEVycm9yLmlzKGZhaWxFcnIpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBSdW5FeHBpcmVkRXJyb3IuaXMoZmFpbEVycilcbiAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGlzV29ybGRDb250cmFjdEVycm9yKGZhaWxFcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgd29ybGQgY29udHJhY3QgZXJyb3Igd2hpbGUgcmVjb3JkaW5nIHdvcmtmbG93IGZhaWx1cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuV09STERfQ09OVFJBQ1RfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsRXJyIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBmYWlsRXJyLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBTdHJpbmcoZmFpbEVyciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHRocm93IGZhaWxFcnI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIGR1cmluZyB3b3JrZmxvdyBzZXR1cCcsXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fZmFpbGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogZXJyLnN0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuV09STERfQ09OVFJBQ1RfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGZhaWxFcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBFbnRpdHlDb25mbGljdEVycm9yLmlzKGZhaWxFcnIpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBSdW5FeHBpcmVkRXJyb3IuaXMoZmFpbEVycilcbiAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGlzV29ybGRDb250cmFjdEVycm9yKGZhaWxFcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgd29ybGQgY29udHJhY3QgZXJyb3Igd2hpbGUgcmVjb3JkaW5nIHdvcmtmbG93IGZhaWx1cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuV09STERfQ09OVFJBQ1RfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsRXJyIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBmYWlsRXJyLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBTdHJpbmcoZmFpbEVyciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHRocm93IGZhaWxFcnI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdvcmtmbG93U3RhcnRlZEF0ID0gK3dvcmtmbG93UnVuLnN0YXJ0ZWRBdDtcblxuICAgICAgICAgICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuU3RhdHVzKHdvcmtmbG93UnVuLnN0YXR1cyksXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dTdGFydGVkQXQod29ya2Zsb3dTdGFydGVkQXQpLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtmbG93UnVuLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgICAvLyBXb3JrZmxvdyBoYXMgYWxyZWFkeSBjb21wbGV0ZWQgb3IgZmFpbGVkLCBzbyB3ZSBjYW4gc2tpcCBpdFxuICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAnV29ya2Zsb3cgYWxyZWFkeSBjb21wbGV0ZWQgb3IgZmFpbGVkLCBza2lwcGluZycsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHdvcmtmbG93UnVuLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgLy8gVE9ETzogZm9yIGBjYW5jZWxgLCB3ZSBhY3R1YWxseSB3YW50IHRvIHByb3BhZ2F0ZSBhIFdvcmtmbG93Q2FuY2VsbGVkIGV2ZW50XG4gICAgICAgICAgICAgICAgICAvLyBpbnNpZGUgdGhlIHdvcmtmbG93IGNvbnRleHQgc28gdGhlIHVzZXIgY2FuIGdyYWNlZnVsbHkgZXhpdC4gdGhpcyBpcyBTSUdURVJNXG4gICAgICAgICAgICAgICAgICAvLyBUT0RPOiBmdXJ0aGVybW9yZSwgdGhlcmUgc2hvdWxkIGJlIGEgdGltZW91dCBvciBhIHdheSB0byBmb3JjZSBjYW5jZWwgU0lHS0lMTFxuICAgICAgICAgICAgICAgICAgLy8gc28gdGhhdCB3ZSBhY3R1YWxseSBleGl0IGhlcmUgd2l0aG91dCByZXBsYXlpbmcgdGhlIHdvcmtmbG93IGF0IGFsbCwgaW4gdGhlIGNhc2VcbiAgICAgICAgICAgICAgICAgIC8vIHRoZSByZXBsYXlpbmcgdGhlIHdvcmtmbG93IGlzIGl0c2VsZiBmYWlsaW5nLlxuXG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTG9hZCBhbGwgZXZlbnRzIGludG8gbWVtb3J5IGJlZm9yZSBydW5uaW5nLlxuICAgICAgICAgICAgICAgIC8vIElmIHdlIGdvdCBwcmUtbG9hZGVkIGV2ZW50cyBmcm9tIHRoZSBydW5fc3RhcnRlZCByZXNwb25zZSxcbiAgICAgICAgICAgICAgICAvLyBza2lwIHRoZSBldmVudHMubGlzdCByb3VuZC10cmlwIHRvIHJlZHVjZSBUVEZCLlxuICAgICAgICAgICAgICAgIGxldCBldmVudHM6IEV2ZW50W107XG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50c0N1cnNvcjogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgaWYgKHByZWxvYWRlZEV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBldmVudHMgPSBwcmVsb2FkZWRFdmVudHM7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50c0N1cnNvciA9IHByZWxvYWRlZEV2ZW50c0N1cnNvcjtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlZEV2ZW50cyA9IGF3YWl0IGdldFdvcmtmbG93UnVuRXZlbnRzKFxuICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuLnJ1bklkXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cyA9IGxvYWRlZEV2ZW50cy5ldmVudHM7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50c0N1cnNvciA9IGxvYWRlZEV2ZW50cy5jdXJzb3I7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSBsb2FkaW5nIHdvcmtmbG93IGV2ZW50cycsXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fZmFpbGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogZXJyLnN0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuV09STERfQ09OVFJBQ1RfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGZhaWxFcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBFbnRpdHlDb25mbGljdEVycm9yLmlzKGZhaWxFcnIpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBSdW5FeHBpcmVkRXJyb3IuaXMoZmFpbEVycilcbiAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGlzV29ybGRDb250cmFjdEVycm9yKGZhaWxFcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgd29ybGQgY29udHJhY3QgZXJyb3Igd2hpbGUgcmVjb3JkaW5nIHdvcmtmbG93IGZhaWx1cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuV09STERfQ09OVFJBQ1RfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsRXJyIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBmYWlsRXJyLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBTdHJpbmcoZmFpbEVyciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHRocm93IGZhaWxFcnI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFRoZSBtYXRlcmlhbGl6ZWQgcnVuIHJldHVybmVkIGJ5IHJ1bl9zdGFydGVkIGNhbiByYWNlIGFcbiAgICAgICAgICAgICAgICAvLyB0ZXJtaW5hbCBldmVudCBpbiB0aGUgbG9hZGVkIHNuYXBzaG90LiBEbyBub3QgcmVwbGF5IGEgcnVuXG4gICAgICAgICAgICAgICAgLy8gd2hvc2UgZXZlbnQgbG9nIGFscmVhZHkgZXN0YWJsaXNoZXMgaXRzIHRlcm1pbmFsIG91dGNvbWUuXG4gICAgICAgICAgICAgICAgaWYgKGhhc1JlY29yZGVkVGVybWluYWxSdW5FdmVudChldmVudHMsIHJ1bklkKSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBhbnkgZWxhcHNlZCB3YWl0cyBhbmQgY3JlYXRlIHdhaXRfY29tcGxldGVkIGV2ZW50c1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAgICAgICAvLyBQcmUtY29tcHV0ZSBjb21wbGV0ZWQgY29ycmVsYXRpb24gSURzIGZvciBPKG4pIGxvb2t1cCBpbnN0ZWFkIG9mIE8obsKyKVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRlZFdhaXRJZHMgPSBuZXcgU2V0KFxuICAgICAgICAgICAgICAgICAgZXZlbnRzXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGUpID0+IGUuZXZlbnRUeXBlID09PSAnd2FpdF9jb21wbGV0ZWQnKVxuICAgICAgICAgICAgICAgICAgICAubWFwKChlKSA9PiBlLmNvcnJlbGF0aW9uSWQpXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIC8vIENvbGxlY3QgYWxsIHdhaXRzIHRoYXQgbmVlZCBjb21wbGV0aW9uXG4gICAgICAgICAgICAgICAgY29uc3Qgd2FpdHNUb0NvbXBsZXRlID0gZXZlbnRzXG4gICAgICAgICAgICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgICAgICAgZVxuICAgICAgICAgICAgICAgICAgICApOiBlIGlzIEV4dHJhY3Q8RXZlbnQsIHsgZXZlbnRUeXBlOiAnd2FpdF9jcmVhdGVkJyB9PiAmIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb3JyZWxhdGlvbklkOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIH0gPT5cbiAgICAgICAgICAgICAgICAgICAgICBlLmV2ZW50VHlwZSA9PT0gJ3dhaXRfY3JlYXRlZCcgJiZcbiAgICAgICAgICAgICAgICAgICAgICBlLmNvcnJlbGF0aW9uSWQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICFjb21wbGV0ZWRXYWl0SWRzLmhhcyhlLmNvcnJlbGF0aW9uSWQpICYmXG4gICAgICAgICAgICAgICAgICAgICAgbm93ID49IChlLmV2ZW50RGF0YS5yZXN1bWVBdCBhcyBEYXRlKS5nZXRUaW1lKClcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIC5tYXAoKGUpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3dhaXRfY29tcGxldGVkJyBhcyBjb25zdCxcbiAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICBjb3JyZWxhdGlvbklkOiBlLmNvcnJlbGF0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgIHJlc3VtZUF0OiBlLmV2ZW50RGF0YS5yZXN1bWVBdCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhbGwgd2FpdF9jb21wbGV0ZWQgZXZlbnRzXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB3YWl0RXZlbnQgb2Ygd2FpdHNUb0NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCB3YWl0TG9nOiBNdXRhYmxlRXZlbnRMb2cgPSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiBldmVudHNDdXJzb3IgPz8gbnVsbCxcbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB3aXRoUHJlY29uZGl0aW9uUmV0cnkoXG4gICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgd2FpdExvZyxcbiAgICAgICAgICAgICAgICAgICAgICAoc3RhdGVVcGRhdGVkQXQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JsZC5ldmVudHMuY3JlYXRlKHJ1bklkLCB3YWl0RXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZVVwZGF0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbygnV2FpdCBhbHJlYWR5IGNvbXBsZXRlZCwgc2tpcHBpbmcnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQ6IHdhaXRFdmVudC5jb3JyZWxhdGlvbklkLFxuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbG9hZHMgaW5zaWRlIHRoZSBndWFyZCBtYXkgaGF2ZSBhZHZhbmNlZCB0aGUgY3Vyc29yLlxuICAgICAgICAgICAgICAgICAgICBldmVudHNDdXJzb3IgPSB3YWl0TG9nLmN1cnNvcjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAod2FpdHNUb0NvbXBsZXRlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgIC8vIFRoZSBldmVudCBsaXN0IGFib3ZlIG1heSBiZSBzdGFsZSBieSB0aGUgdGltZSBhbiBlbGFwc2VkXG4gICAgICAgICAgICAgICAgICAvLyB3YWl0IGlzIGNvbW1pdHRlZC4gTG9hZCBvbmx5IGV2ZW50cyBhZnRlciB0aGUgb3JpZ2luYWxcbiAgICAgICAgICAgICAgICAgIC8vIHNuYXBzaG90IGN1cnNvciBzbyBjb25jdXJyZW50IGR1cmFibGUgZXZlbnRzLCBzdWNoIGFzXG4gICAgICAgICAgICAgICAgICAvLyBob29rX3JlY2VpdmVkLCBrZWVwIHRoZWlyIG9yZGVyaW5nIHJlbGF0aXZlIHRvXG4gICAgICAgICAgICAgICAgICAvLyB3YWl0X2NvbXBsZXRlZC4gRmFsbCBiYWNrIHRvIGEgZnVsbCByZWxvYWQgZm9yIG9sZGVyIHdvcmxkc1xuICAgICAgICAgICAgICAgICAgLy8gdGhhdCBjYW5ub3QgZ2l2ZSB1cyBhIHN0YWJsZSBjdXJzb3IuXG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnRzQ3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0V2ZW50cyA9IGF3YWl0IGdldFdvcmtmbG93UnVuRXZlbnRzKFxuICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuLnJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50c0N1cnNvclxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21wbGV0ZWRXYWl0SWRzQWZ0ZXJDdXJzb3IgPSBuZXcgU2V0KFxuICAgICAgICAgICAgICAgICAgICAgIG5ld0V2ZW50cy5ldmVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGUpID0+IGUuZXZlbnRUeXBlID09PSAnd2FpdF9jb21wbGV0ZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoZSkgPT4gZS5jb3JyZWxhdGlvbklkKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzYXdBbGxXYWl0Q29tcGxldGlvbnMgPSB3YWl0c1RvQ29tcGxldGUuZXZlcnkoXG4gICAgICAgICAgICAgICAgICAgICAgKHdhaXRFdmVudCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZFdhaXRJZHNBZnRlckN1cnNvci5oYXMod2FpdEV2ZW50LmNvcnJlbGF0aW9uSWQpXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNhd0FsbFdhaXRDb21wbGV0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nSWRzID0gbmV3IFNldChcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5tYXAoKGV2ZW50KSA9PiBldmVudC5ldmVudElkKVxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBldmVudCBvZiBuZXdFdmVudHMuZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWV4aXN0aW5nSWRzLmhhcyhldmVudC5ldmVudElkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ0lkcy5hZGQoZXZlbnQuZXZlbnRJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVkRXZlbnRzID0gYXdhaXQgZ2V0V29ya2Zsb3dSdW5FdmVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZFxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnRzID0gbG9hZGVkRXZlbnRzLmV2ZW50cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVkRXZlbnRzID0gYXdhaXQgZ2V0V29ya2Zsb3dSdW5FdmVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWRcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzID0gbG9hZGVkRXZlbnRzLmV2ZW50cztcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gQSBjb25jdXJyZW50IHRlcm1pbmFsIHdyaXRlIG1heSBoYXZlIGxhbmRlZCB3aGlsZVxuICAgICAgICAgICAgICAgICAgLy8gY29tbWl0dGluZyBhbiBlbGFwc2VkIHdhaXQgYW5kIHJlZnJlc2hpbmcgdGhlIHNuYXBzaG90LlxuICAgICAgICAgICAgICAgICAgaWYgKGhhc1JlY29yZGVkVGVybWluYWxSdW5FdmVudChldmVudHMsIHJ1bklkKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUmVzb2x2ZSB0aGUgZW5jcnlwdGlvbiBrZXkgZm9yIHRoaXMgcnVuJ3MgZGVwbG95bWVudFxuICAgICAgICAgICAgICAgIGNvbnN0IHJhd0tleSA9XG4gICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5nZXRFbmNyeXB0aW9uS2V5Rm9yUnVuPy4od29ya2Zsb3dSdW4pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuY3J5cHRpb25LZXkgPSByYXdLZXlcbiAgICAgICAgICAgICAgICAgID8gYXdhaXQgaW1wb3J0S2V5KHJhd0tleSlcbiAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgLy8gLS0tIFVzZXIgY29kZSBleGVjdXRpb24gLS0tXG4gICAgICAgICAgICAgICAgLy8gT25seSBlcnJvcnMgZnJvbSBydW5Xb3JrZmxvdygpICh1c2VyIHdvcmtmbG93IGNvZGUpIHNob3VsZFxuICAgICAgICAgICAgICAgIC8vIHByb2R1Y2UgcnVuX2ZhaWxlZC4gSW5mcmFzdHJ1Y3R1cmUgZXJyb3JzIChuZXR3b3JrLCBzZXJ2ZXIpXG4gICAgICAgICAgICAgICAgLy8gbXVzdCBwcm9wYWdhdGUgdG8gdGhlIHF1ZXVlIGhhbmRsZXIgZm9yIGF1dG9tYXRpYyByZXRyeS5cbiAgICAgICAgICAgICAgICBsZXQgd29ya2Zsb3dSZXN1bHQ6IHVua25vd247XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIHdvcmtmbG93UmVzdWx0ID0gYXdhaXQgdHJhY2UoXG4gICAgICAgICAgICAgICAgICAgICd3b3JrZmxvdy5yZXBsYXknLFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMgKHJlcGxheVNwYW4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXBsYXlTcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0V2ZW50c0NvdW50KGV2ZW50cy5sZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBydW5Xb3JrZmxvdyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93Q29kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5jcnlwdGlvbktleVxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAvLyBXb3JrZmxvd1N1c3BlbnNpb24gaXMgbm9ybWFsIGNvbnRyb2wgZmxvdyDigJQgbm90IGFuIGVycm9yXG4gICAgICAgICAgICAgICAgICBpZiAoV29ya2Zsb3dTdXNwZW5zaW9uLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VzcGVuc2lvbk1lc3NhZ2UgPSBidWlsZFdvcmtmbG93U3VzcGVuc2lvbk1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgZXJyLnN0ZXBDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICBlcnIuaG9va0NvdW50LFxuICAgICAgICAgICAgICAgICAgICAgIGVyci53YWl0Q291bnRcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1c3BlbnNpb25NZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5kZWJ1ZyhzdXNwZW5zaW9uTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBFYWNoIGV2ZW50IGNyZWF0aW9uIGluc2lkZSBoYW5kbGVTdXNwZW5zaW9uIGNhcnJpZXMgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIGxvYWRlZCBzbmFwc2hvdCdzIGBzdGF0ZVVwZGF0ZWRBdGA7IG9uIGEgc3RhbGUgKDQxMilcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVqZWN0aW9uIHRoZSBndWFyZCByZWxvYWRzIHRoaXMgbG9nIGluIHBsYWNlIGFuZCByZXRyaWVzLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdXNwZW5zaW9uTG9nOiBNdXRhYmxlRXZlbnRMb2cgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogZXZlbnRzQ3Vyc29yID8/IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHQ6IEF3YWl0ZWQ8UmV0dXJuVHlwZTx0eXBlb2YgaGFuZGxlU3VzcGVuc2lvbj4+O1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IGhhbmRsZVN1c3BlbnNpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VzcGVuc2lvbjogZXJyLFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ybGQsXG4gICAgICAgICAgICAgICAgICAgICAgICBydW46IHdvcmtmbG93UnVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TG9nOiBzdXNwZW5zaW9uTG9nLFxuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChzdXNwZW5zaW9uRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZ3VhcmQgZXhoYXVzdGVkIGl0cyByZWxvYWRzIG9uIGEgc3RhbGUgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGlvbi4gU2NoZWR1bGUgYW4gZXhwbGljaXQgaW1tZWRpYXRlIHJlLWludm9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAvLyAoYSByZXRocm93IHJlbGllcyBvbiBxdWV1ZSByZWRlbGl2ZXJ5KSBzbyBhIGZyZXNoXG4gICAgICAgICAgICAgICAgICAgICAgLy8gcmVwbGF5IG9ic2VydmVzIHRoZSBuZXdlciBldmVudC5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoUHJlY29uZGl0aW9uRmFpbGVkRXJyb3IuaXMoc3VzcGVuc2lvbkVycm9yKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAnU3VzcGVuc2lvbiBldmVudCBjcmVhdGlvbiBleGhhdXN0ZWQgcHJlY29uZGl0aW9uIHJldHJpZXM7IHJlLWludm9raW5nIHdpdGggYSBmcmVzaCByZXBsYXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB0aW1lb3V0U2Vjb25kczogMCB9O1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBzdXNwZW5zaW9uRXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnRpbWVvdXRTZWNvbmRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB0aW1lb3V0U2Vjb25kczogcmVzdWx0LnRpbWVvdXRTZWNvbmRzIH07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBTdXNwZW5zaW9uIGhhbmRsZWQsIG5vIGZ1cnRoZXIgd29yayBuZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBUcmFuc2llbnQgaW5mcmFzdHJ1Y3R1cmUgZmFpbHVyZXMgdGFsa2luZyB0byB0aGVcbiAgICAgICAgICAgICAgICAgIC8vIHdvcmxkICh3b3JrZmxvdy1zZXJ2ZXIpIOKAlCBhbiBleGhhdXN0ZWQgUmV0cnlBZ2VudFxuICAgICAgICAgICAgICAgICAgLy8gKFVORF9FUlJfUkVRX1JFVFJZIGZyb20gYSBzdXN0YWluZWQgNDI5LzUwMyBzdG9ybSksXG4gICAgICAgICAgICAgICAgICAvLyBhIGRyb3BwZWQgc29ja2V0LCBhIGNvbm5lY3QvRE5TIGZhaWx1cmUsIG9yIGEgY2xpZW50XG4gICAgICAgICAgICAgICAgICAvLyB0aW1lb3V0IOKAlCBtdXN0IE5PVCBmYWlsIHRoZSBydW4uIFJldGhyb3cgc28gdGhlIHF1ZXVlXG4gICAgICAgICAgICAgICAgICAvLyByZWRlbGl2ZXJzIGFuZCBhIGZyZXNoIGludm9jYXRpb24gcmV0cmllcyB0aGUgcmVwbGF5XG4gICAgICAgICAgICAgICAgICAvLyBvbmNlIHRoZSBiYWNrZW5kIHJlY292ZXJzLiBUaGUgQHZlcmNlbC9xdWV1ZSBoYW5kbGVyXG4gICAgICAgICAgICAgICAgICAvLyBhcHBsaWVzIGEgZmFzdCAoMXPihpI2MHMpIGJhY2tvZmYgYnkgZGVsaXZlcnkgY291bnQsXG4gICAgICAgICAgICAgICAgICAvLyBhdm9pZGluZyB0aGUgfjVtaW4gZGVmYXVsdCB2aXNpYmlsaXR5LXRpbWVvdXQgcmVkcml2ZVxuICAgICAgICAgICAgICAgICAgLy8gKGFuZCBuZXZlciBraWxsaW5nIHRoZSBwcm9jZXNzIHZpYSBydW5fZmFpbGVkKS5cbiAgICAgICAgICAgICAgICAgIGlmIChpc1JldHJ5YWJsZVdvcmxkRXJyb3IoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgJ1RyYW5zaWVudCB3b3JsZCBlcnJvciBkdXJpbmcgcmVwbGF5OyByZWRlbGl2ZXJpbmcgdmlhIHF1ZXVlIGluc3RlYWQgb2YgZmFpbGluZyB0aGUgcnVuJyxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck5hbWU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm5hbWUgOiAnVW5rbm93bkVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsaXZlcnlBdHRlbXB0OiBtZXRhZGF0YS5hdHRlbXB0LFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBsZXQgdGVybWluYWxFcnJvciA9IGVycjtcbiAgICAgICAgICAgICAgICAgIGlmIChSZXBsYXlEaXZlcmdlbmNlRXJyb3IuaXMoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXZlcmdlbmNlQ291bnQgPSAocmVwbGF5RGl2ZXJnZW5jZT8uY291bnQgPz8gMCkgKyAxO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXZlcmdlbmNlQ291bnQgPD0gUkVQTEFZX0RJVkVSR0VOQ0VfTUFYX1JFVFJJRVMpIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAnV29ya2Zsb3cgcmVwbGF5IGRpdmVyZ2VkOyBxdWV1ZWluZyBhIHJlY292ZXJ5IHJlcGxheSBiZWZvcmUgZGVjbGFyaW5nIHRoZSBldmVudCBsb2cgY29ycnVwdGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLlJFUExBWV9ESVZFUkdFTkNFLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkaXZlcmdlbmNlRXZlbnRJZDogZXJyLmV2ZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHByaW9yRGl2ZXJnZW5jZUV2ZW50SWQ6IHJlcGxheURpdmVyZ2VuY2U/LmV2ZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpdmVyZ2VuY2VDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsaXZlcnlBdHRlbXB0OiBtZXRhZGF0YS5hdHRlbXB0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhSZWNvdmVyeVJlcGxheXM6IFJFUExBWV9ESVZFUkdFTkNFX01BWF9SRVRSSUVTLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgYXdhaXQgcXVldWVNZXNzYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ybGQsXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRXb3JrZmxvd1F1ZXVlTmFtZSh3b3JrZmxvd05hbWUsIG5hbWVzcGFjZSksXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFjZUNhcnJpZXI6IHRyYWNlQ29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxheURpdmVyZ2VuY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudElkOiBlcnIuZXZlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogZGl2ZXJnZW5jZUNvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95bWVudElkOiB3b3JrZmxvd1J1bi5kZXBsb3ltZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuLnNwZWNWZXJzaW9uID8/IFNQRUNfVkVSU0lPTl9MRUdBQ1ksXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0ZXJtaW5hbEVycm9yID0gbmV3IENvcnJ1cHRlZEV2ZW50TG9nRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYFdvcmtmbG93IHJlcGxheSBkaXZlcmdlZCAke2RpdmVyZ2VuY2VDb3VudH0gdGltZXMgYWZ0ZXIgJHtSRVBMQVlfRElWRVJHRU5DRV9NQVhfUkVUUklFU30gcmVjb3ZlcnkgcmVwbGF5czsgbGF0ZXN0IGRpdmVyZ2VudCBldmVudCB3YXMgJHtlcnIuZXZlbnRJZH0uIExhc3QgZGl2ZXJnZW5jZTogJHtlcnIubWVzc2FnZX1gLFxuICAgICAgICAgICAgICAgICAgICAgIHsgY2F1c2U6IGVyciB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYSB1c2VyIGNvZGUgZXJyb3Igb3IgYSB0ZXJtaW5hbFxuICAgICAgICAgICAgICAgICAgLy8gV29ya2Zsb3dSdW50aW1lRXJyb3IuIEZhaWwgdGhlIHdvcmtmbG93IHJ1bi5cblxuICAgICAgICAgICAgICAgICAgLy8gUmVjb3JkIGV4Y2VwdGlvbiBmb3IgT1RFTCBlcnJvciB0cmFja2luZ1xuICAgICAgICAgICAgICAgICAgaWYgKHRlcm1pbmFsRXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBzcGFuPy5yZWNvcmRFeGNlcHRpb24/Lih0ZXJtaW5hbEVycm9yKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZEVycm9yID1cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgbm9ybWFsaXplVW5rbm93bkVycm9yKHRlcm1pbmFsRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JOYW1lID1cbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZEVycm9yLm5hbWUgfHwgZ2V0RXJyb3JOYW1lKHRlcm1pbmFsRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gbm9ybWFsaXplZEVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICBsZXQgZXJyb3JTdGFjayA9XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRFcnJvci5zdGFjayB8fCBnZXRFcnJvclN0YWNrKHRlcm1pbmFsRXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgICAvLyBSZW1hcCBlcnJvciBzdGFjayB1c2luZyBzb3VyY2UgbWFwcyB0byBzaG93IG9yaWdpbmFsIHNvdXJjZSBsb2NhdGlvbnNcbiAgICAgICAgICAgICAgICAgIGlmIChlcnJvclN0YWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZE5hbWUgPSBwYXJzZVdvcmtmbG93TmFtZSh3b3JrZmxvd05hbWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlbmFtZSA9XG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VkTmFtZT8ubW9kdWxlU3BlY2lmaWVyIHx8IHdvcmtmbG93TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JTdGFjayA9IHJlbWFwRXJyb3JTdGFjayhcbiAgICAgICAgICAgICAgICAgICAgICBlcnJvclN0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93Q29kZVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBDbGFzc2lmeSB0aGUgZXJyb3I6IFdvcmtmbG93UnVudGltZUVycm9yIGluZGljYXRlc1xuICAgICAgICAgICAgICAgICAgLy8gYW4gU0RLL3J1bnRpbWUgaXNzdWUsIGFuZCBzZWxlY3RlZCBzdWJjbGFzc2VzIHVzZVxuICAgICAgICAgICAgICAgICAgLy8gbW9yZSBzcGVjaWZpYyBjb2RlcyBmb3IgYmFja2VuZCB0cmFja2luZy5cbiAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IGNsYXNzaWZ5UnVuRXJyb3IodGVybWluYWxFcnJvcik7XG5cbiAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIHJ1bm5pbmcgd29ya2Zsb3cnLCB7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JTdGFjayxcbiAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAvLyBGYWlsIHRoZSB3b3JrZmxvdyBydW4gdmlhIGV2ZW50IChldmVudC1zb3VyY2VkIGFyY2hpdGVjdHVyZSlcbiAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2ZhaWxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2s6IGVycm9yU3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9IGNhdGNoIChmYWlsRXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICBFbnRpdHlDb25mbGljdEVycm9yLmlzKGZhaWxFcnIpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgUnVuRXhwaXJlZEVycm9yLmlzKGZhaWxFcnIpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgICAgICdUcmllZCBmYWlsaW5nIHdvcmtmbG93IHJ1biwgYnV0IHJ1biBoYXMgYWxyZWFkeSBmaW5pc2hlZC4nLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZmFpbEVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvckNvZGUoZXJyb3JDb2RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yTmFtZShlcnJvck5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JNZXNzYWdlKGVycm9yTWVzc2FnZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuRXJyb3JUeXBlKGVycm9yTmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihmYWlsRXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgd29ybGQgY29udHJhY3QgZXJyb3Igd2hpbGUgcmVjb3JkaW5nIHdvcmtmbG93IGZhaWx1cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuV09STERfQ09OVFJBQ1RfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxFcnIgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBmYWlsRXJyLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogU3RyaW5nKGZhaWxFcnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGZhaWxFcnI7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5TdGF0dXMoJ2ZhaWxlZCcpLFxuICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvckNvZGUoZXJyb3JDb2RlKSxcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JOYW1lKGVycm9yTmFtZSksXG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yTWVzc2FnZShlcnJvck1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuRXJyb3JUeXBlKGVycm9yTmFtZSksXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyAtLS0gSW5mcmFzdHJ1Y3R1cmU6IGNvbXBsZXRlIHRoZSBydW4gLS0tXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBvdXRzaWRlIHRoZSB1c2VyLWNvZGUgdHJ5L2NhdGNoIHNvIHRoYXQgZmFpbHVyZXNcbiAgICAgICAgICAgICAgICAvLyBoZXJlIChlLmcuLCBuZXR3b3JrIGVycm9ycykgcHJvcGFnYXRlIHRvIHRoZSBxdWV1ZSBoYW5kbGVyLlxuICAgICAgICAgICAgICAgIC8vIHJ1bl9jb21wbGV0ZWQgY2FycmllcyB0aGUgbG9hZGVkIHNuYXBzaG90J3MgYHN0YXRlVXBkYXRlZEF0YCxcbiAgICAgICAgICAgICAgICAvLyBidXQgaXMgaW50ZW50aW9uYWxseSBOT1QgcmV0cmllZCBpbiBwbGFjZSAobm9cbiAgICAgICAgICAgICAgICAvLyB3aXRoUHJlY29uZGl0aW9uUmV0cnkpIG9uIGEgc3RhbGUgKDQxMikgcmVqZWN0aW9uOiBgcmVzdWx0YFxuICAgICAgICAgICAgICAgIC8vIHdhcyBjb21wdXRlZCBieSB0aGlzIHJlcGxheSwgc28gYSBuZXdlciBvdXQtb2YtYmFuZCBldmVudFxuICAgICAgICAgICAgICAgIC8vIGxhbmRpbmcgYWZ0ZXIgdGhlIHNuYXBzaG90IG11c3QgZm9yY2UgYSAqZnJlc2ggcmVwbGF5KlxuICAgICAgICAgICAgICAgIC8vICh3aGljaCBtYXkgb2JzZXJ2ZSBpdCBhbmQgcHJvZHVjZSBhIGRpZmZlcmVudCByZXN1bHQpLCBub3RcbiAgICAgICAgICAgICAgICAvLyByZS1jb21taXQgdGhlIHN0YWxlIHJlc3VsdC4gT24gNDEyIHRoZSBjYXRjaCBiZWxvdyBzY2hlZHVsZXNcbiAgICAgICAgICAgICAgICAvLyBhbiBleHBsaWNpdCBpbW1lZGlhdGUgcmUtaW52b2NhdGlvbiBpbnN0ZWFkLlxuICAgICAgICAgICAgICAgIC8vIChydW5fZmFpbGVkIGlzIGRlbGliZXJhdGVseSBsZWZ0IHVuZ3VhcmRlZCBhbmQgZmFpbHMgb3BlbjpcbiAgICAgICAgICAgICAgICAvLyBhIHNwdXJpb3VzIHJlLXJ1biBpcyBzYWZlLCBhIHNwdXJpb3VzIGNvbXBsZXRpb24gaXMgbm90LCBhbmRcbiAgICAgICAgICAgICAgICAvLyB0aGUgbG9hZGVkIGV2ZW50IGxvZyBpcyBub3QgaW4gc2NvcGUgb24gdGhhdCBjYXRjaCBwYXRoLilcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQ6IHdvcmtmbG93UmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICAgICAgICAgICAgc3RhdGVVcGRhdGVkQXQ6IHN0YXRlVXBkYXRlZEF0Rm9yQ3JlYXRlKGV2ZW50cyksXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoUHJlY29uZGl0aW9uRmFpbGVkRXJyb3IuaXMoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgJ3J1bl9jb21wbGV0ZWQgcmVqZWN0ZWQgYXMgc3RhbGU7IHJlLWludm9raW5nIHdpdGggYSBmcmVzaCByZXBsYXknLFxuICAgICAgICAgICAgICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB0aW1lb3V0U2Vjb25kczogMCB9O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZXJyKSB8fCBSdW5FeHBpcmVkRXJyb3IuaXMoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgJ1RyaWVkIGNvbXBsZXRpbmcgd29ya2Zsb3cgcnVuLCBidXQgcnVuIGhhcyBhbHJlYWR5IGZpbmlzaGVkLicsXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1blN0YXR1cygnY29tcGxldGVkJyksXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFdmVudHNDb3VudChldmVudHMubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTsgLy8gRW5kIHRyYWNlXG4gICAgICAgICAgfVxuICAgICAgICApOyAvLyBFbmQgd2l0aFdvcmtmbG93QmFnZ2FnZVxuICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgIGlmIChyZXBsYXlUaW1lb3V0KSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHJlcGxheVRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICB9KTsgLy8gRW5kIHdpdGhUcmFjZUNvbnRleHRcbiAgICB9XG4gICk7XG5cbiAgcmV0dXJuIHdpdGhIZWFsdGhDaGVjayhoYW5kbGVyLCB3b3JsZFNwZWNWZXJzaW9uKTtcbn1cblxuLy8gdGhpcyBpcyBhIG5vLW9wIHBsYWNlaG9sZGVyIGFzIHRoZSBjbGllbnQgaXNcbi8vIGV4cGVjdGluZyB0aGlzIHRvIGJlIHByZXNlbnQgYnV0IHdlIGFyZW4ndCBhY3R1YWxseSB1c2luZyBpdFxuZXhwb3J0IGZ1bmN0aW9uIHJ1blN0ZXAoKSB7fVxuIiwgImltcG9ydCB7XG4gIEVSUk9SX1NMVUdTLFxuICBSZXBsYXlEaXZlcmdlbmNlRXJyb3IsXG4gIFdvcmtmbG93Tm90UmVnaXN0ZXJlZEVycm9yLFxuICBXb3JrZmxvd1J1bnRpbWVFcnJvcixcbn0gZnJvbSAnQHdvcmtmbG93L2Vycm9ycyc7XG5pbXBvcnQgeyBjcmVhdGVXb3JrZmxvd0Jhc2VVcmwsIHdpdGhSZXNvbHZlcnMgfSBmcm9tICdAd29ya2Zsb3cvdXRpbHMnO1xuaW1wb3J0IHsgcGFyc2VXb3JrZmxvd05hbWUgfSBmcm9tICdAd29ya2Zsb3cvdXRpbHMvcGFyc2UtbmFtZSc7XG5pbXBvcnQgdHlwZSB7IEV2ZW50LCBXb3JrZmxvd1J1biB9IGZyb20gJ0B3b3JrZmxvdy93b3JsZCc7XG5pbXBvcnQgKiBhcyBuYW5vaWQgZnJvbSAnbmFub2lkJztcbmltcG9ydCB7IG1vbm90b25pY0ZhY3RvcnkgfSBmcm9tICd1bGlkJztcbmltcG9ydCB0eXBlIHsgQ3J5cHRvS2V5IH0gZnJvbSAnLi9lbmNyeXB0aW9uLmpzJztcbmltcG9ydCB7IEV2ZW50Q29uc3VtZXJSZXN1bHQsIEV2ZW50c0NvbnN1bWVyIH0gZnJvbSAnLi9ldmVudHMtY29uc3VtZXIuanMnO1xuaW1wb3J0IHR5cGUgeyBRdWV1ZUl0ZW0gfSBmcm9tICcuL2dsb2JhbC5qcyc7XG5pbXBvcnQgeyBFTk9UU1VQLCBXb3JrZmxvd1N1c3BlbnNpb24gfSBmcm9tICcuL2dsb2JhbC5qcyc7XG5pbXBvcnQgeyBydW50aW1lTG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXIuanMnO1xuaW1wb3J0IHR5cGUgeyBXb3JrZmxvd09yY2hlc3RyYXRvckNvbnRleHQgfSBmcm9tICcuL3ByaXZhdGUuanMnO1xuaW1wb3J0IHsgZ2V0UG9ydExhenkgfSBmcm9tICcuL3J1bnRpbWUvZ2V0LXBvcnQtbGF6eS5qcyc7XG5pbXBvcnQge1xuICBkZWh5ZHJhdGVXb3JrZmxvd1JldHVyblZhbHVlLFxuICBoeWRyYXRlV29ya2Zsb3dBcmd1bWVudHMsXG59IGZyb20gJy4vc2VyaWFsaXphdGlvbi5qcyc7XG5pbXBvcnQgeyBjcmVhdGVVc2VTdGVwIH0gZnJvbSAnLi9zdGVwLmpzJztcbmltcG9ydCB0eXBlIHsgU3RlcEh5ZHJhdGlvbkNhY2hlIH0gZnJvbSAnLi9zdGVwLWh5ZHJhdGlvbi1jYWNoZS5qcyc7XG5pbXBvcnQge1xuICBCT0RZX0lOSVRfU1lNQk9MLFxuICBTVEFCTEVfVUxJRCxcbiAgV09SS0ZMT1dfQ1JFQVRFX0hPT0ssXG4gIFdPUktGTE9XX0dFVF9TVFJFQU1fSUQsXG4gIFdPUktGTE9XX1NMRUVQLFxuICBXT1JLRkxPV19VU0VfU1RFUCxcbn0gZnJvbSAnLi9zeW1ib2xzLmpzJztcbmltcG9ydCAqIGFzIEF0dHJpYnV0ZSBmcm9tICcuL3RlbGVtZXRyeS9zZW1hbnRpYy1jb252ZW50aW9ucy5qcyc7XG5pbXBvcnQgeyB0cmFjZSB9IGZyb20gJy4vdGVsZW1ldHJ5LmpzJztcbmltcG9ydCB7IGdldFdvcmtmbG93UnVuU3RyZWFtSWQgfSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgY3JlYXRlQ29udGV4dCB9IGZyb20gJy4vdm0vaW5kZXguanMnO1xuaW1wb3J0IHsgcnVuQ2FjaGVkV29ya2Zsb3dTY3JpcHQgfSBmcm9tICcuL3ZtL3NjcmlwdC1jYWNoZS5qcyc7XG5pbXBvcnQgdHlwZSB7IFdvcmtmbG93TWV0YWRhdGEgfSBmcm9tICcuL3dvcmtmbG93L2dldC13b3JrZmxvdy1tZXRhZGF0YS5qcyc7XG5pbXBvcnQgeyBXT1JLRkxPV19DT05URVhUX1NZTUJPTCB9IGZyb20gJy4vd29ya2Zsb3cvZ2V0LXdvcmtmbG93LW1ldGFkYXRhLmpzJztcbmltcG9ydCB7IGNyZWF0ZUNyZWF0ZUhvb2sgfSBmcm9tICcuL3dvcmtmbG93L2hvb2suanMnO1xuaW1wb3J0IHsgY3JlYXRlU2xlZXAgfSBmcm9tICcuL3dvcmtmbG93L3NsZWVwLmpzJztcblxuLyoqXG4gKiBMb2dzIGEgd2FybmluZyB3aGVuIGEgd29ya2Zsb3cgcnVuIGNvbXBsZXRlcyBvciBmYWlscyB3aXRoIHVuY29tbWl0dGVkXG4gKiBvcGVyYXRpb25zIHN0aWxsIGluIHRoZSBpbnZvY2F0aW9ucyBxdWV1ZS4gVGhpcyB0eXBpY2FsbHkgaW5kaWNhdGVzIHRoZVxuICogdXNlciBmb3Jnb3QgdG8gYGF3YWl0YCBhIHN0ZXAsIGhvb2ssIG9yIHNsZWVwIGNhbGwuXG4gKi9cbmZ1bmN0aW9uIHdhcm5QZW5kaW5nUXVldWVJdGVtcyhcbiAgcnVuSWQ6IHN0cmluZyxcbiAgcGVuZGluZ1F1ZXVlOiBNYXA8c3RyaW5nLCBRdWV1ZUl0ZW0+LFxuICBvdXRjb21lOiAnY29tcGxldGVkJyB8ICdmYWlsZWQnXG4pOiB2b2lkIHtcbiAgLy8gRmlsdGVyIG91dCBob29rcyB0aGF0IGFyZSBlaXRoZXIgYWxyZWFkeSBjcmVhdGVkIChhbGl2ZSwgd2FpdGluZyBmb3IgcGF5bG9hZHMpXG4gIC8vIG9yIGV4cGxpY2l0bHkgZGlzcG9zZWQg4oCUIGJvdGggYXJlIGJlbmlnbiBzaW5jZSB0aGUgYmFja2VuZCBhdXRvLWRpc3Bvc2VzXG4gIC8vIGFsbCBob29rcyB3aGVuIGEgcnVuIHJlYWNoZXMgYSB0ZXJtaW5hbCBzdGF0ZVxuICBjb25zdCBpdGVtcyA9IFsuLi5wZW5kaW5nUXVldWUudmFsdWVzKCldLmZpbHRlcihcbiAgICAoaXRlbSkgPT4gIShpdGVtLnR5cGUgPT09ICdob29rJyAmJiAoaXRlbS5oYXNDcmVhdGVkRXZlbnQgfHwgaXRlbS5kaXNwb3NlZCkpXG4gICk7XG4gIGlmIChpdGVtcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICBjb25zdCBkZXRhaWxzID0gaXRlbXMubWFwKChpdGVtKSA9PiB7XG4gICAgc3dpdGNoIChpdGVtLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3N0ZXAnOlxuICAgICAgICByZXR1cm4gYHN0ZXAgXCIke2l0ZW0uc3RlcE5hbWV9XCJgO1xuICAgICAgY2FzZSAnaG9vayc6XG4gICAgICAgIHJldHVybiBgaG9vayBcIiR7aXRlbS50b2tlbn1cImA7XG4gICAgICBjYXNlICd3YWl0JzpcbiAgICAgICAgcmV0dXJuICdzbGVlcCc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gYHVua25vd24gKCR7KGl0ZW0gYXMgeyB0eXBlOiBzdHJpbmcgfSkudHlwZX0pYDtcbiAgICB9XG4gIH0pO1xuXG4gIHJ1bnRpbWVMb2dnZXIud2FybihcbiAgICBgV29ya2Zsb3cgcnVuICR7b3V0Y29tZX0gd2l0aCAke2l0ZW1zLmxlbmd0aH0gdW5jb21taXR0ZWQgb3BlcmF0aW9uKHMpOiAke2RldGFpbHMuam9pbignLCAnKX0uIGAgK1xuICAgICAgJ0RpZCB5b3UgZm9yZ2V0IHRvIGBhd2FpdGAgYSBzdGVwLCBob29rLCBvciBzbGVlcCBjYWxsPycsXG4gICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCB9XG4gICk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Xb3JrZmxvdyhcbiAgd29ya2Zsb3dDb2RlOiBzdHJpbmcsXG4gIHdvcmtmbG93UnVuOiBXb3JrZmxvd1J1bixcbiAgZXZlbnRzOiBFdmVudFtdLFxuICBlbmNyeXB0aW9uS2V5OiBDcnlwdG9LZXkgfCB1bmRlZmluZWQsXG4gIC8qKlxuICAgKiBPcHRpb25hbCBwZXItcnVuIGNhY2hlIGZvciBoeWRyYXRlZCBzdGVwIHJldHVybiB2YWx1ZXMsIG93bmVkIGJ5IHRoZSBpbmxpbmVcbiAgICogcmVwbGF5IGxvb3Agc28gaXQgc3Vydml2ZXMgYWNyb3NzIHRoZSBsb29wJ3MgaXRlcmF0aW9ucyAoZWFjaCBvZiB3aGljaFxuICAgKiBjcmVhdGVzIGEgZnJlc2ggY29udGV4dCkuIE1lbW9pemVzIHRoZSBkZWNyeXB0ICsgZGV2YWx1ZS1wYXJzZSBvZiBjb21wbGV0ZWRcbiAgICogc3RlcCByZXN1bHRzIHRvIHR1cm4gTyhOwrIpIHJlcGxheSBoeWRyYXRpb24gaW50byBPKE4pLiBPbWl0dGVkIGJ5IGNhbGxlcnNcbiAgICogdGhhdCByZXBsYXkgb25seSBvbmNlICh0aGVuIHRoZXJlIGlzIG5vdGhpbmcgdG8gcmV1c2UpLlxuICAgKi9cbiAgc3RlcEh5ZHJhdGlvbkNhY2hlPzogU3RlcEh5ZHJhdGlvbkNhY2hlXG4pOiBQcm9taXNlPFVpbnQ4QXJyYXkgfCB1bmtub3duPiB7XG4gIHJldHVybiB0cmFjZShgd29ya2Zsb3cucnVuICR7d29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lfWAsIGFzeW5jIChzcGFuKSA9PiB7XG4gICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dOYW1lKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSksXG4gICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5JZCh3b3JrZmxvd1J1bi5ydW5JZCksXG4gICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5TdGF0dXMod29ya2Zsb3dSdW4uc3RhdHVzKSxcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0V2ZW50c0NvdW50KGV2ZW50cy5sZW5ndGgpLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgc3RhcnRlZEF0ID0gd29ya2Zsb3dSdW4uc3RhcnRlZEF0O1xuICAgIGlmICghc3RhcnRlZEF0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBXb3JrZmxvdyBydW4gXCIke3dvcmtmbG93UnVuLnJ1bklkfVwiIGhhcyBubyBcInN0YXJ0ZWRBdFwiIHRpbWVzdGFtcCAoc2hvdWxkIG5vdCBoYXBwZW4pYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIHBvcnQgYmVmb3JlIGNyZWF0aW5nIFZNIGNvbnRleHQgdG8gYXZvaWQgYXN5bmMgb3BlcmF0aW9uc1xuICAgIC8vIGFmZmVjdGluZyB0aGUgZGV0ZXJtaW5pc3RpYyB0aW1lc3RhbXBcbiAgICBjb25zdCBpc1ZlcmNlbCA9IHByb2Nlc3MuZW52LlZFUkNFTF9VUkwgIT09IHVuZGVmaW5lZDtcbiAgICAvLyBMb2FkIGdldFBvcnQgbGF6aWx5IHRvIHByZXZlbnQgVHVyYm9wYWNrIGZyb20gdHJhY2luZyBnZXQtcG9ydCdzXG4gICAgLy8gZnMgb3BzIChyZWFkZGlyLCByZWFkRmlsZSkgaW50byB0aGUgZmxvdyByb3V0ZSBidW5kbGUuIFRoZSByZXNvbHZlZFxuICAgIC8vIHBvcnQgaXMgY2FjaGVkIHBlciBwcm9jZXNzIChzZWUgZ2V0LXBvcnQtbGF6eS50cyksIHNvIHRoaXMgaXMgY2hlYXBcbiAgICAvLyBvbiByZXBsYXlzIGFmdGVyIHRoZSBmaXJzdCDigJQgYGdldFBvcnQoKWAgb3RoZXJ3aXNlIHJlLXJ1bnMgT1MgcG9ydFxuICAgIC8vIGRpc2NvdmVyeSAoc3Bhd25pbmcgYGxzb2ZgIG9uIG1hY09TLCB+NjBtcykgb24gZXZlcnkgcmVwbGF5LlxuICAgIGNvbnN0IHdvcmtmbG93QmFzZVVybCA9IGNyZWF0ZVdvcmtmbG93QmFzZVVybChcbiAgICAgIGlzVmVyY2VsXG4gICAgICAgID8gYGh0dHBzOi8vJHtwcm9jZXNzLmVudi5WRVJDRUxfVVJMfWBcbiAgICAgICAgOiBgaHR0cDovL2xvY2FsaG9zdDokeyhhd2FpdCBnZXRQb3J0TGF6eSgpKSA/PyAzMDAwfWBcbiAgICApO1xuXG4gICAgY29uc3Qge1xuICAgICAgY29udGV4dCxcbiAgICAgIGdsb2JhbFRoaXM6IHZtR2xvYmFsVGhpcyxcbiAgICAgIHVwZGF0ZVRpbWVzdGFtcCxcbiAgICB9ID0gY3JlYXRlQ29udGV4dCh7XG4gICAgICBzZWVkOiBgJHt3b3JrZmxvd1J1bi5ydW5JZH06JHt3b3JrZmxvd1J1bi53b3JrZmxvd05hbWV9OiR7K3N0YXJ0ZWRBdH1gLFxuICAgICAgZml4ZWRUaW1lc3RhbXA6ICtzdGFydGVkQXQsXG4gICAgfSk7XG5cbiAgICBjb25zdCB3b3JrZmxvd0Rpc2NvbnRpbnVhdGlvbiA9IHdpdGhSZXNvbHZlcnM8dm9pZD4oKTtcblxuICAgIGNvbnN0IHVsaWQgPSBtb25vdG9uaWNGYWN0b3J5KCgpID0+IHZtR2xvYmFsVGhpcy5NYXRoLnJhbmRvbSgpKTtcbiAgICBjb25zdCBnZW5lcmF0ZU5hbm9pZCA9IG5hbm9pZC5jdXN0b21SYW5kb20obmFub2lkLnVybEFscGhhYmV0LCAyMSwgKHNpemUpID0+XG4gICAgICBuZXcgVWludDhBcnJheShzaXplKS5tYXAoKCkgPT4gMjU2ICogdm1HbG9iYWxUaGlzLk1hdGgucmFuZG9tKCkpXG4gICAgKTtcblxuICAgIC8vIENyZWF0ZSBhIG11dGFibGUgaG9sZGVyIGZvciB0aGUgcHJvbWlzZSBxdWV1ZSBzbyB0aGUgRXZlbnRzQ29uc3VtZXJcbiAgICAvLyBjYW4gYWNjZXNzIHRoZSBjdXJyZW50IHF1ZXVlIHN0YXRlIHZpYSBhIGdldHRlci4gVGhlIHF1ZXVlIGlzIG11dGF0ZWRcbiAgICAvLyBieSBzdGVwL2hvb2svc2xlZXAgY2FsbGJhY2tzIGFzIGV2ZW50cyBhcmUgcHJvY2Vzc2VkLlxuICAgIGNvbnN0IHByb21pc2VRdWV1ZUhvbGRlciA9IHsgY3VycmVudDogUHJvbWlzZS5yZXNvbHZlKCkgfTtcblxuICAgIGNvbnN0IGV2ZW50c0NvbnN1bWVyID0gbmV3IEV2ZW50c0NvbnN1bWVyKGV2ZW50cywge1xuICAgICAgb25Db25zdW1lZEV2ZW50OiAoZXZlbnQpID0+IHtcbiAgICAgICAgdXBkYXRlVGltZXN0YW1wKCtldmVudC5jcmVhdGVkQXQpO1xuICAgICAgfSxcbiAgICAgIG9uVW5jb25zdW1lZEV2ZW50OiAoZXZlbnQpID0+IHtcbiAgICAgICAgd29ya2Zsb3dEaXNjb250aW51YXRpb24ucmVqZWN0KFxuICAgICAgICAgIG5ldyBSZXBsYXlEaXZlcmdlbmNlRXJyb3IoXG4gICAgICAgICAgICBgUmVwbGF5IGNvdWxkIG5vdCBjb25zdW1lIGV2ZW50OiBldmVudFR5cGU9JHtldmVudC5ldmVudFR5cGV9LCBjb3JyZWxhdGlvbklkPSR7ZXZlbnQuY29ycmVsYXRpb25JZH0sIGV2ZW50SWQ9JHtldmVudC5ldmVudElkfS5gLFxuICAgICAgICAgICAgeyBldmVudElkOiBldmVudC5ldmVudElkIH1cbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgZ2V0UHJvbWlzZVF1ZXVlOiAoKSA9PiBwcm9taXNlUXVldWVIb2xkZXIuY3VycmVudCxcbiAgICB9KTtcblxuICAgIGNvbnN0IHdvcmtmbG93Q29udGV4dDogV29ya2Zsb3dPcmNoZXN0cmF0b3JDb250ZXh0ID0ge1xuICAgICAgcnVuSWQ6IHdvcmtmbG93UnVuLnJ1bklkLFxuICAgICAgZW5jcnlwdGlvbktleSxcbiAgICAgIGdsb2JhbFRoaXM6IHZtR2xvYmFsVGhpcyxcbiAgICAgIG9uV29ya2Zsb3dFcnJvcjogd29ya2Zsb3dEaXNjb250aW51YXRpb24ucmVqZWN0LFxuICAgICAgZXZlbnRzQ29uc3VtZXIsXG4gICAgICBnZW5lcmF0ZVVsaWQ6ICgpID0+IHVsaWQoK3N0YXJ0ZWRBdCksXG4gICAgICBnZW5lcmF0ZU5hbm9pZCxcbiAgICAgIGludm9jYXRpb25zUXVldWU6IG5ldyBNYXAoKSxcbiAgICAgIC8vIFVzZSBnZXR0ZXIvc2V0dGVyIHNvIHRoZSBFdmVudHNDb25zdW1lcidzIGdldFByb21pc2VRdWV1ZSgpIGFsd2F5c1xuICAgICAgLy8gc2VlcyB0aGUgbGF0ZXN0IHF1ZXVlIHN0YXRlIGFzIGl0J3MgbXV0YXRlZCBieSBzdGVwL2hvb2svc2xlZXAgY2FsbGJhY2tzLlxuICAgICAgZ2V0IHByb21pc2VRdWV1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2VRdWV1ZUhvbGRlci5jdXJyZW50O1xuICAgICAgfSxcbiAgICAgIHNldCBwcm9taXNlUXVldWUodmFsdWU6IFByb21pc2U8dm9pZD4pIHtcbiAgICAgICAgcHJvbWlzZVF1ZXVlSG9sZGVyLmN1cnJlbnQgPSB2YWx1ZTtcbiAgICAgIH0sXG4gICAgICBwZW5kaW5nRGVsaXZlcmllczogMCxcbiAgICAgIHBlbmRpbmdEZWxpdmVyeUJhcnJpZXJzOiBuZXcgTWFwKCksXG4gICAgICBzdGVwSHlkcmF0aW9uQ2FjaGUsXG4gICAgfTtcblxuICAgIC8vIENvbnN1bWUgcnVuIGxpZmVjeWNsZSBldmVudHMgLSB0aGVzZSBhcmUgc3RydWN0dXJhbCBldmVudHMgdGhhdCBkb24ndFxuICAgIC8vIG5lZWQgc3BlY2lhbCBoYW5kbGluZyBpbiB0aGUgd29ya2Zsb3csIGJ1dCBtdXN0IGJlIGNvbnN1bWVkIHRvIGFkdmFuY2VcbiAgICAvLyBwYXN0IHRoZW0gaW4gdGhlIGV2ZW50IGxvZ1xuICAgIHdvcmtmbG93Q29udGV4dC5ldmVudHNDb25zdW1lci5zdWJzY3JpYmUoKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50KSB7XG4gICAgICAgIHJldHVybiBFdmVudENvbnN1bWVyUmVzdWx0Lk5vdENvbnN1bWVkO1xuICAgICAgfVxuXG4gICAgICAvLyBDb25zdW1lIHJ1bl9jcmVhdGVkIC0gZXZlcnkgcnVuIGhhcyBleGFjdGx5IG9uZVxuICAgICAgaWYgKGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9jcmVhdGVkJykge1xuICAgICAgICByZXR1cm4gRXZlbnRDb25zdW1lclJlc3VsdC5Db25zdW1lZDtcbiAgICAgIH1cblxuICAgICAgLy8gQ29uc3VtZSBydW5fc3RhcnRlZCAtIGV2ZXJ5IHJ1biBoYXMgZXhhY3RseSBvbmVcbiAgICAgIGlmIChldmVudC5ldmVudFR5cGUgPT09ICdydW5fc3RhcnRlZCcpIHtcbiAgICAgICAgcmV0dXJuIEV2ZW50Q29uc3VtZXJSZXN1bHQuQ29uc3VtZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBFdmVudENvbnN1bWVyUmVzdWx0Lk5vdENvbnN1bWVkO1xuICAgIH0pO1xuXG4gICAgY29uc3QgdXNlU3RlcCA9IGNyZWF0ZVVzZVN0ZXAod29ya2Zsb3dDb250ZXh0KTtcbiAgICBjb25zdCBjcmVhdGVIb29rID0gY3JlYXRlQ3JlYXRlSG9vayh3b3JrZmxvd0NvbnRleHQpO1xuICAgIGNvbnN0IHNsZWVwID0gY3JlYXRlU2xlZXAod29ya2Zsb3dDb250ZXh0KTtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tXT1JLRkxPV19VU0VfU1RFUF0gPSB1c2VTdGVwO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tXT1JLRkxPV19DUkVBVEVfSE9PS10gPSBjcmVhdGVIb29rO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tXT1JLRkxPV19TTEVFUF0gPSBzbGVlcDtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfR0VUX1NUUkVBTV9JRF0gPSAobmFtZXNwYWNlPzogc3RyaW5nKSA9PlxuICAgICAgZ2V0V29ya2Zsb3dSdW5TdHJlYW1JZCh3b3JrZmxvd1J1bi5ydW5JZCwgbmFtZXNwYWNlKTtcblxuICAgIC8vIEZvciB0aGUgd29ya2Zsb3cgVk0sIHdlIHN0b3JlIHRoZSBjb250ZXh0IGluIGEgc3ltYm9sIG9uIHRoZSBgZ2xvYmFsVGhpc2Agb2JqZWN0XG4gICAgY29uc3QgY3R4OiBXb3JrZmxvd01ldGFkYXRhID0ge1xuICAgICAgd29ya2Zsb3dOYW1lOiB3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUsXG4gICAgICB3b3JrZmxvd1J1bklkOiB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgIHdvcmtmbG93U3RhcnRlZEF0OiBuZXcgdm1HbG9iYWxUaGlzLkRhdGUoK3N0YXJ0ZWRBdCksXG4gICAgICB1cmw6IHdvcmtmbG93QmFzZVVybCxcbiAgICB9O1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX0NPTlRFWFRfU1lNQk9MXSA9IGN0eDtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbU1RBQkxFX1VMSURdID0gdWxpZDtcblxuICAgIC8vIE5PVEU6IFdpbGwgaGF2ZSBhIGNvbmZpZyBvdmVycmlkZSB0byB1c2UgdGhlIGN1c3RvbSBmZXRjaCBzdGVwLlxuICAgIC8vICAgICAgIEZvciBub3cgYGZldGNoYCBtdXN0IGJlIGV4cGxpY2l0bHkgaW1wb3J0ZWQgZnJvbSBgd29ya2Zsb3dgLlxuICAgIHZtR2xvYmFsVGhpcy5mZXRjaCA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyB2bUdsb2JhbFRoaXMuRXJyb3IoXG4gICAgICAgIGBHbG9iYWwgXCJmZXRjaFwiIGlzIHVuYXZhaWxhYmxlIGluIHdvcmtmbG93IGZ1bmN0aW9ucy4gVXNlIHRoZSBcImZldGNoXCIgc3RlcCBmdW5jdGlvbiBmcm9tIFwid29ya2Zsb3dcIiB0byBtYWtlIEhUVFAgcmVxdWVzdHMuXFxuXFxuTGVhcm4gbW9yZTogaHR0cHM6Ly91c2V3b3JrZmxvdy5kZXYvZXJyLyR7RVJST1JfU0xVR1MuRkVUQ0hfSU5fV09SS0ZMT1dfRlVOQ1RJT059YFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gT3ZlcnJpZGUgdGltZW91dC9pbnRlcnZhbCBmdW5jdGlvbnMgdG8gdGhyb3cgaGVscGZ1bCBlcnJvcnNcbiAgICAvLyBUaGVzZSBhcmUgbm90IHN1cHBvcnRlZCBpbiB3b3JrZmxvdyBmdW5jdGlvbnMgYmVjYXVzZSB0aGV5IHJlbHkgb25cbiAgICAvLyBhc3luY2hyb25vdXMgc2NoZWR1bGluZyB3aGljaCBicmVha3MgZGV0ZXJtaW5pc3RpYyByZXBsYXlcbiAgICBjb25zdCB0aW1lb3V0RXJyb3JNZXNzYWdlID1cbiAgICAgICdUaW1lb3V0IGZ1bmN0aW9ucyBsaWtlIFwic2V0VGltZW91dFwiIGFuZCBcInNldEludGVydmFsXCIgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gd29ya2Zsb3cgZnVuY3Rpb25zLiBVc2UgdGhlIFwic2xlZXBcIiBmdW5jdGlvbiBmcm9tIFwid29ya2Zsb3dcIiBmb3IgdGltZS1iYXNlZCBkZWxheXMuJztcblxuICAgICh2bUdsb2JhbFRoaXMgYXMgYW55KS5zZXRUaW1lb3V0ID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuVElNRU9VVF9GVU5DVElPTlNfSU5fV09SS0ZMT1csXG4gICAgICB9KTtcbiAgICB9O1xuICAgICh2bUdsb2JhbFRoaXMgYXMgYW55KS5zZXRJbnRlcnZhbCA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuY2xlYXJUaW1lb3V0ID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuVElNRU9VVF9GVU5DVElPTlNfSU5fV09SS0ZMT1csXG4gICAgICB9KTtcbiAgICB9O1xuICAgICh2bUdsb2JhbFRoaXMgYXMgYW55KS5jbGVhckludGVydmFsID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuVElNRU9VVF9GVU5DVElPTlNfSU5fV09SS0ZMT1csXG4gICAgICB9KTtcbiAgICB9O1xuICAgICh2bUdsb2JhbFRoaXMgYXMgYW55KS5zZXRJbW1lZGlhdGUgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLmNsZWFySW1tZWRpYXRlID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuVElNRU9VVF9GVU5DVElPTlNfSU5fV09SS0ZMT1csXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gYFJlcXVlc3RgIGFuZCBgUmVzcG9uc2VgIGFyZSBzcGVjaWFsIGJ1aWx0LWluIGNsYXNzZXMgdGhhdCBpbnZva2Ugc3RlcHNcbiAgICAvLyBmb3IgdGhlIGBqc29uKClgLCBgdGV4dCgpYCBhbmQgYGFycmF5QnVmZmVyKClgIGluc3RhbmNlIG1ldGhvZHNcbiAgICBjbGFzcyBSZXF1ZXN0IGltcGxlbWVudHMgZ2xvYmFsVGhpcy5SZXF1ZXN0IHtcbiAgICAgIGNhY2hlITogZ2xvYmFsVGhpcy5SZXF1ZXN0WydjYWNoZSddO1xuICAgICAgY3JlZGVudGlhbHMhOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ2NyZWRlbnRpYWxzJ107XG4gICAgICBkZXN0aW5hdGlvbiE6IGdsb2JhbFRoaXMuUmVxdWVzdFsnZGVzdGluYXRpb24nXTtcbiAgICAgIGhlYWRlcnMhOiBIZWFkZXJzO1xuICAgICAgaW50ZWdyaXR5ITogc3RyaW5nO1xuICAgICAgbWV0aG9kITogc3RyaW5nO1xuICAgICAgbW9kZSE6IGdsb2JhbFRoaXMuUmVxdWVzdFsnbW9kZSddO1xuICAgICAgcmVkaXJlY3QhOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ3JlZGlyZWN0J107XG4gICAgICByZWZlcnJlciE6IHN0cmluZztcbiAgICAgIHJlZmVycmVyUG9saWN5ITogZ2xvYmFsVGhpcy5SZXF1ZXN0WydyZWZlcnJlclBvbGljeSddO1xuICAgICAgdXJsITogc3RyaW5nO1xuICAgICAga2VlcGFsaXZlITogYm9vbGVhbjtcbiAgICAgIHNpZ25hbCE6IEFib3J0U2lnbmFsO1xuICAgICAgZHVwbGV4ITogJ2hhbGYnO1xuICAgICAgYm9keSE6IFJlYWRhYmxlU3RyZWFtPGFueT4gfCBudWxsO1xuXG4gICAgICBjb25zdHJ1Y3RvcihpbnB1dDogYW55LCBpbml0PzogUmVxdWVzdEluaXQpIHtcbiAgICAgICAgLy8gSGFuZGxlIFVSTCBpbnB1dFxuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyB8fCBpbnB1dCBpbnN0YW5jZW9mIHZtR2xvYmFsVGhpcy5VUkwpIHtcbiAgICAgICAgICBjb25zdCB1cmxTdHJpbmcgPSBTdHJpbmcoaW5wdXQpO1xuICAgICAgICAgIC8vIFZhbGlkYXRlIFVSTCBmb3JtYXRcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbmV3IHZtR2xvYmFsVGhpcy5VUkwodXJsU3RyaW5nKTtcbiAgICAgICAgICAgIHRoaXMudXJsID0gdXJsU3RyaW5nO1xuICAgICAgICAgIH0gY2F0Y2ggKGNhdXNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBGYWlsZWQgdG8gcGFyc2UgVVJMIGZyb20gJHt1cmxTdHJpbmd9YCwge1xuICAgICAgICAgICAgICBjYXVzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJbnB1dCBpcyBhIFJlcXVlc3Qgb2JqZWN0IC0gY2xvbmUgaXRzIHByb3BlcnRpZXNcbiAgICAgICAgICB0aGlzLnVybCA9IGlucHV0LnVybDtcbiAgICAgICAgICBpZiAoIWluaXQpIHtcbiAgICAgICAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kO1xuICAgICAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKGlucHV0LmhlYWRlcnMpO1xuICAgICAgICAgICAgdGhpcy5ib2R5ID0gaW5wdXQuYm9keTtcbiAgICAgICAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGU7XG4gICAgICAgICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHM7XG4gICAgICAgICAgICB0aGlzLmNhY2hlID0gaW5wdXQuY2FjaGU7XG4gICAgICAgICAgICB0aGlzLnJlZGlyZWN0ID0gaW5wdXQucmVkaXJlY3Q7XG4gICAgICAgICAgICB0aGlzLnJlZmVycmVyID0gaW5wdXQucmVmZXJyZXI7XG4gICAgICAgICAgICB0aGlzLnJlZmVycmVyUG9saWN5ID0gaW5wdXQucmVmZXJyZXJQb2xpY3k7XG4gICAgICAgICAgICB0aGlzLmludGVncml0eSA9IGlucHV0LmludGVncml0eTtcbiAgICAgICAgICAgIHRoaXMua2VlcGFsaXZlID0gaW5wdXQua2VlcGFsaXZlO1xuICAgICAgICAgICAgdGhpcy5zaWduYWwgPSBpbnB1dC5zaWduYWw7XG4gICAgICAgICAgICB0aGlzLmR1cGxleCA9IGlucHV0LmR1cGxleDtcbiAgICAgICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSBpbnB1dC5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSWYgaW5pdCBpcyBwcm92aWRlZCwgbWVyZ2U6IHVzZSBzb3VyY2UgcHJvcGVydGllcywgdGhlbiBvdmVycmlkZSB3aXRoIGluaXRcbiAgICAgICAgICAvLyBDb3B5IGFsbCBwcm9wZXJ0aWVzIGZyb20gdGhlIHNvdXJjZSBSZXF1ZXN0IGZpcnN0XG4gICAgICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2Q7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKGlucHV0LmhlYWRlcnMpO1xuICAgICAgICAgIHRoaXMuYm9keSA9IGlucHV0LmJvZHk7XG4gICAgICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZTtcbiAgICAgICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHM7XG4gICAgICAgICAgdGhpcy5jYWNoZSA9IGlucHV0LmNhY2hlO1xuICAgICAgICAgIHRoaXMucmVkaXJlY3QgPSBpbnB1dC5yZWRpcmVjdDtcbiAgICAgICAgICB0aGlzLnJlZmVycmVyID0gaW5wdXQucmVmZXJyZXI7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlclBvbGljeSA9IGlucHV0LnJlZmVycmVyUG9saWN5O1xuICAgICAgICAgIHRoaXMuaW50ZWdyaXR5ID0gaW5wdXQuaW50ZWdyaXR5O1xuICAgICAgICAgIHRoaXMua2VlcGFsaXZlID0gaW5wdXQua2VlcGFsaXZlO1xuICAgICAgICAgIHRoaXMuc2lnbmFsID0gaW5wdXQuc2lnbmFsO1xuICAgICAgICAgIHRoaXMuZHVwbGV4ID0gaW5wdXQuZHVwbGV4O1xuICAgICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSBpbnB1dC5kZXN0aW5hdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE92ZXJyaWRlIHdpdGggaW5pdCBvcHRpb25zIGlmIHByb3ZpZGVkXG4gICAgICAgIC8vIFNldCBtZXRob2RcbiAgICAgICAgaWYgKGluaXQ/Lm1ldGhvZCkge1xuICAgICAgICAgIHRoaXMubWV0aG9kID0gaW5pdC5tZXRob2QudG9VcHBlckNhc2UoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5tZXRob2QgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgLy8gRmFsbGJhY2sgdG8gZGVmYXVsdCBmb3Igc3RyaW5nIGlucHV0IGNhc2VcbiAgICAgICAgICB0aGlzLm1ldGhvZCA9ICdHRVQnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IGhlYWRlcnNcbiAgICAgICAgaWYgKGluaXQ/LmhlYWRlcnMpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoaW5pdC5oZWFkZXJzKTtcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICB0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICAgaW5wdXQgaW5zdGFuY2VvZiB2bUdsb2JhbFRoaXMuVVJMXG4gICAgICAgICkge1xuICAgICAgICAgIC8vIEZvciBzdHJpbmcvVVJMIGlucHV0LCBjcmVhdGUgZW1wdHkgaGVhZGVyc1xuICAgICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IG90aGVyIHByb3BlcnRpZXMgd2l0aCBpbml0IHZhbHVlcyBvciBkZWZhdWx0c1xuICAgICAgICBpZiAoaW5pdD8ubW9kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5tb2RlID0gaW5pdC5tb2RlO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLm1vZGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5tb2RlID0gJ2NvcnMnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LmNyZWRlbnRpYWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5pdC5jcmVkZW50aWFscztcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5jcmVkZW50aWFscyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmNyZWRlbnRpYWxzID0gJ3NhbWUtb3JpZ2luJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGBhbnlgIGNhc3QgaGVyZSBiZWNhdXNlIEB0eXBlcy9ub2RlIHYyMiBkb2VzIG5vdCB5ZXQgaGF2ZSBgY2FjaGVgXG4gICAgICAgIGlmICgoaW5pdCBhcyBhbnkpPy5jYWNoZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5jYWNoZSA9IChpbml0IGFzIGFueSkuY2FjaGU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuY2FjaGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5jYWNoZSA9ICdkZWZhdWx0JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5yZWRpcmVjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5yZWRpcmVjdCA9IGluaXQucmVkaXJlY3Q7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucmVkaXJlY3QgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5yZWRpcmVjdCA9ICdmb2xsb3cnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LnJlZmVycmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLnJlZmVycmVyID0gaW5pdC5yZWZlcnJlcjtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZWZlcnJlciAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLnJlZmVycmVyID0gJ2Fib3V0OmNsaWVudCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8ucmVmZXJyZXJQb2xpY3kgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMucmVmZXJyZXJQb2xpY3kgPSBpbml0LnJlZmVycmVyUG9saWN5O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnJlZmVycmVyUG9saWN5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMucmVmZXJyZXJQb2xpY3kgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5pbnRlZ3JpdHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuaW50ZWdyaXR5ID0gaW5pdC5pbnRlZ3JpdHk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuaW50ZWdyaXR5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaW50ZWdyaXR5ID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8ua2VlcGFsaXZlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLmtlZXBhbGl2ZSA9IGluaXQua2VlcGFsaXZlO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmtlZXBhbGl2ZSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgdGhpcy5rZWVwYWxpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5zaWduYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBBYm9ydFNpZ25hbCBzdHViXG4gICAgICAgICAgdGhpcy5zaWduYWwgPSBpbml0LnNpZ25hbDtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5zaWduYWwpIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gQWJvcnRTaWduYWwgc3R1YlxuICAgICAgICAgIHRoaXMuc2lnbmFsID0geyBhYm9ydGVkOiBmYWxzZSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmR1cGxleCkge1xuICAgICAgICAgIHRoaXMuZHVwbGV4ID0gJ2hhbGYnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmRlc3RpbmF0aW9uKSB7XG4gICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9ICdkb2N1bWVudCc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBib2R5ID0gaW5pdD8uYm9keTtcblxuICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IEdFVC9IRUFEIG1ldGhvZHMgZG9uJ3QgaGF2ZSBhIGJvZHlcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGJvZHkgIT09IG51bGwgJiZcbiAgICAgICAgICBib2R5ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpXG4gICAgICAgICkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFJlcXVlc3Qgd2l0aCBHRVQvSEVBRCBtZXRob2QgY2Fubm90IGhhdmUgYm9keS5gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0b3JlIHRoZSBvcmlnaW5hbCBCb2R5SW5pdCBmb3Igc2VyaWFsaXphdGlvblxuICAgICAgICBpZiAoYm9keSAhPT0gbnVsbCAmJiBib2R5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBDcmVhdGUgYSBcImZha2VcIiBSZWFkYWJsZVN0cmVhbSB0aGF0IHN0b3JlcyB0aGUgb3JpZ2luYWwgYm9keVxuICAgICAgICAgIC8vIFRoaXMgYXZvaWRzIGRvaW5nIGFzeW5jIHdvcmsgZHVyaW5nIHdvcmtmbG93IHJlcGxheVxuICAgICAgICAgIHRoaXMuYm9keSA9IE9iamVjdC5jcmVhdGUodm1HbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtLnByb3RvdHlwZSwge1xuICAgICAgICAgICAgW0JPRFlfSU5JVF9TWU1CT0xdOiB7XG4gICAgICAgICAgICAgIHZhbHVlOiBib2R5LFxuICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuYm9keSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2xvbmUoKTogUmVxdWVzdCB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgZ2V0IGJvZHlVc2VkKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IGltcGxlbWVudCB0aGVzZVxuICAgICAgYmxvYiE6ICgpID0+IFByb21pc2U8QmxvYj47XG4gICAgICBmb3JtRGF0YSE6ICgpID0+IFByb21pc2U8Rm9ybURhdGE+O1xuXG4gICAgICBhcnJheUJ1ZmZlciE6ICgpID0+IFByb21pc2U8QXJyYXlCdWZmZXI+O1xuICAgICAganNvbiE6ICgpID0+IFByb21pc2U8YW55PjtcbiAgICAgIHRleHQhOiAoKSA9PiBQcm9taXNlPHN0cmluZz47XG5cbiAgICAgIGFzeW5jIGJ5dGVzKCkge1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgdGhpcy5hcnJheUJ1ZmZlcigpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdm1HbG9iYWxUaGlzLlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoUmVxdWVzdC5wcm90b3R5cGUsIHtcbiAgICAgIGFycmF5QnVmZmVyOiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBBcnJheUJ1ZmZlcj4oJ19fYnVpbHRpbl9yZXNwb25zZV9hcnJheV9idWZmZXInKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBqc29uOiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBhbnk+KCdfX2J1aWx0aW5fcmVzcG9uc2VfanNvbicpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHRleHQ6IHtcbiAgICAgICAgdmFsdWU6IHVzZVN0ZXA8W10sIHN0cmluZz4oJ19fYnVpbHRpbl9yZXNwb25zZV90ZXh0JyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY2xhc3MgUmVzcG9uc2UgaW1wbGVtZW50cyBnbG9iYWxUaGlzLlJlc3BvbnNlIHtcbiAgICAgIHR5cGUhOiBnbG9iYWxUaGlzLlJlc3BvbnNlWyd0eXBlJ107XG4gICAgICB1cmwhOiBzdHJpbmc7XG4gICAgICBzdGF0dXMhOiBudW1iZXI7XG4gICAgICBzdGF0dXNUZXh0ITogc3RyaW5nO1xuICAgICAgYm9keSE6IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+IHwgbnVsbDtcbiAgICAgIGhlYWRlcnMhOiBIZWFkZXJzO1xuICAgICAgcmVkaXJlY3RlZCE6IGJvb2xlYW47XG5cbiAgICAgIGNvbnN0cnVjdG9yKGJvZHk/OiBhbnksIGluaXQ/OiBSZXNwb25zZUluaXQpIHtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBpbml0Py5zdGF0dXMgPz8gMjAwO1xuICAgICAgICB0aGlzLnN0YXR1c1RleHQgPSBpbml0Py5zdGF0dXNUZXh0ID8/ICcnO1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoaW5pdD8uaGVhZGVycyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0JztcbiAgICAgICAgdGhpcy51cmwgPSAnJztcbiAgICAgICAgdGhpcy5yZWRpcmVjdGVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCBudWxsLWJvZHkgc3RhdHVzIGNvZGVzIGRvbid0IGhhdmUgYSBib2R5XG4gICAgICAgIC8vIFBlciBIVFRQIHNwZWM6IDIwNCAoTm8gQ29udGVudCksIDIwNSAoUmVzZXQgQ29udGVudCksIGFuZCAzMDQgKE5vdCBNb2RpZmllZClcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGJvZHkgIT09IG51bGwgJiZcbiAgICAgICAgICBib2R5ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAodGhpcy5zdGF0dXMgPT09IDIwNCB8fCB0aGlzLnN0YXR1cyA9PT0gMjA1IHx8IHRoaXMuc3RhdHVzID09PSAzMDQpXG4gICAgICAgICkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICBgUmVzcG9uc2UgY29uc3RydWN0b3I6IEludmFsaWQgcmVzcG9uc2Ugc3RhdHVzIGNvZGUgJHt0aGlzLnN0YXR1c31gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0b3JlIHRoZSBvcmlnaW5hbCBCb2R5SW5pdCBmb3Igc2VyaWFsaXphdGlvblxuICAgICAgICBpZiAoYm9keSAhPT0gbnVsbCAmJiBib2R5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBDcmVhdGUgYSBcImZha2VcIiBSZWFkYWJsZVN0cmVhbSB0aGF0IHN0b3JlcyB0aGUgb3JpZ2luYWwgYm9keVxuICAgICAgICAgIC8vIFRoaXMgYXZvaWRzIGRvaW5nIGFzeW5jIHdvcmsgZHVyaW5nIHdvcmtmbG93IHJlcGxheVxuICAgICAgICAgIHRoaXMuYm9keSA9IE9iamVjdC5jcmVhdGUodm1HbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtLnByb3RvdHlwZSwge1xuICAgICAgICAgICAgW0JPRFlfSU5JVF9TWU1CT0xdOiB7XG4gICAgICAgICAgICAgIHZhbHVlOiBib2R5LFxuICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuYm9keSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogaW1wbGVtZW50IHRoZXNlXG4gICAgICBjbG9uZSE6ICgpID0+IFJlc3BvbnNlO1xuICAgICAgYmxvYiE6ICgpID0+IFByb21pc2U8Z2xvYmFsVGhpcy5CbG9iPjtcbiAgICAgIGZvcm1EYXRhITogKCkgPT4gUHJvbWlzZTxnbG9iYWxUaGlzLkZvcm1EYXRhPjtcblxuICAgICAgZ2V0IG9rKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwO1xuICAgICAgfVxuXG4gICAgICBnZXQgYm9keVVzZWQoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgYXJyYXlCdWZmZXIhOiAoKSA9PiBQcm9taXNlPEFycmF5QnVmZmVyPjtcbiAgICAgIGpzb24hOiAoKSA9PiBQcm9taXNlPGFueT47XG4gICAgICB0ZXh0ITogKCkgPT4gUHJvbWlzZTxzdHJpbmc+O1xuXG4gICAgICBhc3luYyBieXRlcygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGF3YWl0IHRoaXMuYXJyYXlCdWZmZXIoKSk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBqc29uKGRhdGE6IGFueSwgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlIHtcbiAgICAgICAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKGluaXQ/LmhlYWRlcnMpO1xuICAgICAgICBpZiAoIWhlYWRlcnMuaGFzKCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICAgIGhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgeyAuLi5pbml0LCBoZWFkZXJzIH0pO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgZXJyb3IoKTogUmVzcG9uc2Uge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyByZWRpcmVjdCh1cmw6IHN0cmluZyB8IFVSTCwgc3RhdHVzOiBudW1iZXIgPSAzMDIpOiBSZXNwb25zZSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIHN0YXR1cyBjb2RlIC0gb25seSBzcGVjaWZpYyByZWRpcmVjdCBjb2RlcyBhcmUgYWxsb3dlZFxuICAgICAgICBpZiAoIVszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF0uaW5jbHVkZXMoc3RhdHVzKSkge1xuICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxuICAgICAgICAgICAgYEludmFsaWQgcmVkaXJlY3Qgc3RhdHVzIGNvZGU6ICR7c3RhdHVzfS4gTXVzdCBiZSBvbmUgb2Y6IDMwMSwgMzAyLCAzMDMsIDMwNywgMzA4YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgcmVzcG9uc2Ugd2l0aCBMb2NhdGlvbiBoZWFkZXJcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycygpO1xuICAgICAgICBoZWFkZXJzLnNldCgnTG9jYXRpb24nLCBTdHJpbmcodXJsKSk7XG5cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBPYmplY3QuY3JlYXRlKFJlc3BvbnNlLnByb3RvdHlwZSk7XG4gICAgICAgIHJlc3BvbnNlLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgcmVzcG9uc2Uuc3RhdHVzVGV4dCA9ICcnO1xuICAgICAgICByZXNwb25zZS5oZWFkZXJzID0gaGVhZGVycztcbiAgICAgICAgcmVzcG9uc2UuYm9keSA9IG51bGw7XG4gICAgICAgIHJlc3BvbnNlLnR5cGUgPSAnZGVmYXVsdCc7XG4gICAgICAgIHJlc3BvbnNlLnVybCA9ICcnO1xuICAgICAgICByZXNwb25zZS5yZWRpcmVjdGVkID0gZmFsc2U7XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFJlc3BvbnNlLnByb3RvdHlwZSwge1xuICAgICAgYXJyYXlCdWZmZXI6IHtcbiAgICAgICAgdmFsdWU6IHVzZVN0ZXA8W10sIEFycmF5QnVmZmVyPignX19idWlsdGluX3Jlc3BvbnNlX2FycmF5X2J1ZmZlcicpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGpzb246IHtcbiAgICAgICAgdmFsdWU6IHVzZVN0ZXA8W10sIGFueT4oJ19fYnVpbHRpbl9yZXNwb25zZV9qc29uJyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgICAgdGV4dDoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgc3RyaW5nPignX19idWlsdGluX3Jlc3BvbnNlX3RleHQnKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjbGFzcyBSZWFkYWJsZVN0cmVhbTxUPiBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW08VD4ge1xuICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgZ2V0IGxvY2tlZCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBjYW5jZWwoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXRSZWFkZXIoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBwaXBlVGhyb3VnaCgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIHBpcGVUbygpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIHRlZSgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIHZhbHVlcygpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBmcm9tKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHZtR2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbSA9IFJlYWRhYmxlU3RyZWFtO1xuXG4gICAgY2xhc3MgV3JpdGFibGVTdHJlYW08VD4gaW1wbGVtZW50cyBnbG9iYWxUaGlzLldyaXRhYmxlU3RyZWFtPFQ+IHtcbiAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGdldCBsb2NrZWQoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgYWJvcnQoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBjbG9zZSgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGdldFdyaXRlcigpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHZtR2xvYmFsVGhpcy5Xcml0YWJsZVN0cmVhbSA9IFdyaXRhYmxlU3RyZWFtO1xuXG4gICAgY2xhc3MgVHJhbnNmb3JtU3RyZWFtPEksIE8+IGltcGxlbWVudHMgZ2xvYmFsVGhpcy5UcmFuc2Zvcm1TdHJlYW08SSwgTz4ge1xuICAgICAgcmVhZGFibGU6IGdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW08Tz47XG4gICAgICB3cml0YWJsZTogZ2xvYmFsVGhpcy5Xcml0YWJsZVN0cmVhbTxJPjtcblxuICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdm1HbG9iYWxUaGlzLlRyYW5zZm9ybVN0cmVhbSA9IFRyYW5zZm9ybVN0cmVhbTtcblxuICAgIC8vIEV2ZW50dWFsbHkgd2UnbGwgcHJvYmFibHkgd2FudCB0byBwcm92aWRlIG91ciBvd24gYGNvbnNvbGVgIG9iamVjdCxcbiAgICAvLyBidXQgZm9yIG5vdyB3ZSdsbCBqdXN0IGV4cG9zZSB0aGUgZ2xvYmFsIG9uZS5cbiAgICB2bUdsb2JhbFRoaXMuY29uc29sZSA9IGdsb2JhbFRoaXMuY29uc29sZTtcblxuICAgIC8vIEhBQ0s6IHByb3BhZ2F0ZSBzeW1ib2wgbmVlZGVkIGZvciBBSSBnYXRld2F5IHVzYWdlXG4gICAgY29uc3QgU1lNQk9MX0ZPUl9SRVFfQ09OVEVYVCA9IFN5bWJvbC5mb3IoJ0B2ZXJjZWwvcmVxdWVzdC1jb250ZXh0Jyk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1NZTUJPTF9GT1JfUkVRX0NPTlRFWFRdID0gKGdsb2JhbFRoaXMgYXMgYW55KVtcbiAgICAgIFNZTUJPTF9GT1JfUkVRX0NPTlRFWFRcbiAgICBdO1xuXG4gICAgLy8gR2V0IGEgcmVmZXJlbmNlIHRvIHRoZSB1c2VyLWRlZmluZWQgd29ya2Zsb3cgZnVuY3Rpb24uXG4gICAgLy8gVGhlIGZpbGVuYW1lIHBhcmFtZXRlciBlbnN1cmVzIHN0YWNrIHRyYWNlcyBzaG93IGEgbWVhbmluZ2Z1bCBuYW1lXG4gICAgLy8gKGUuZy4sIFwiZXhhbXBsZS93b3JrZmxvd3MvOTlfZTJlLnRzXCIpIGluc3RlYWQgb2YgXCJldmFsbWFjaGluZS48YW5vbnltb3VzPlwiLlxuICAgIGNvbnN0IHBhcnNlZE5hbWUgPSBwYXJzZVdvcmtmbG93TmFtZSh3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpO1xuICAgIGNvbnN0IGZpbGVuYW1lID0gcGFyc2VkTmFtZT8ubW9kdWxlU3BlY2lmaWVyIHx8IHdvcmtmbG93UnVuLndvcmtmbG93TmFtZTtcblxuICAgIC8vIEV2YWx1YXRlIHRoZSB3b3JrZmxvdyBidW5kbGUgYWdhaW5zdCB0aGUgZnJlc2ggY29udGV4dCB1c2luZyBhXG4gICAgLy8gcHJvY2Vzcy13aWRlIGNhY2hlIG9mIHRoZSBjb21waWxlZCBgdm0uU2NyaXB0YC4gVGhlIGJ1bmRsZSBpcyB0aGUgc2FtZVxuICAgIC8vIHN0cmluZyBmb3IgZXZlcnkgcmVwbGF5IGFuZCBldmVyeSBpbnZvY2F0aW9uIGluIHRoaXMgcHJvY2VzcywgYW5kXG4gICAgLy8gY29tcGlsYXRpb24gaXMgYSBwdXJlIGZ1bmN0aW9uIG9mIGAoY29kZSwgZmlsZW5hbWUpYCwgc28gcmV1c2luZyB0aGVcbiAgICAvLyBjb21waWxlZCBTY3JpcHQgYWNyb3NzIHJlcGxheXMgaXMgZGV0ZXJtaW5pc20tc2FmZTogaXQgcHJvZHVjZXMgdGhlIHNhbWVcbiAgICAvLyB3b3JrZmxvdyBmdW5jdGlvbiBhbmQgdGhlIHNhbWUgYGZpbGVuYW1lYCBzb3VyY2UgYXR0cmlidXRpb24gYXNcbiAgICAvLyByZS1wYXJzaW5nIHRoZSBidW5kbGUgZXZlcnkgdGltZSwgYnV0IHNraXBzIHRoZSAoZXhwZW5zaXZlKSByZS1wYXJzZS5cbiAgICAvLyBFdmFsdWF0aW5nIHRoZSBidW5kbGUgcmVnaXN0ZXJzIGV2ZXJ5IHdvcmtmbG93IG9uXG4gICAgLy8gYGdsb2JhbFRoaXMuX19wcml2YXRlX3dvcmtmbG93c2A7IHRoZSB0cmFpbGluZyBsb29rdXAgZXhwcmVzc2lvbiB0aGVuXG4gICAgLy8gcmV0cmlldmVzIHRoZSByZXF1ZXN0ZWQgd29ya2Zsb3cgZnVuY3Rpb24uIFRoZSBsb29rdXAgaXMgZXZhbHVhdGVkIGFzIGFcbiAgICAvLyBzZXBhcmF0ZSBjYWNoZWQgU2NyaXB0IHVuZGVyIHRoZSBzYW1lIGBmaWxlbmFtZWAsIHNvIGVycm9yIHN0YWNrIGZyYW1lc1xuICAgIC8vIHN0aWxsIGF0dHJpYnV0ZSB0byB0aGUgd29ya2Zsb3cncyBzb3VyY2UgZmlsZSAoYHJlbWFwRXJyb3JTdGFja2Aga2V5cyBvblxuICAgIC8vIGBmaWxlbmFtZWApLiBUaGUgb25lIGJlaGF2aW91cmFsIGRpZmZlcmVuY2UgZnJvbSB0aGUgcHJldmlvdXNcbiAgICAvLyBzaW5nbGUtY29tYmluZWQtc3RyaW5nIGFwcHJvYWNoIGlzIHRoZSAqbGluZSBudW1iZXIqIG9mIGFuIGVycm9yIHRocm93blxuICAgIC8vIGJ5IHRoZSBsb29rdXAgZXhwcmVzc2lvbiBpdHNlbGY6IGl0IG5vdyByZXBvcnRzIGxpbmUgMSBvZiB0aGUgbG9va3VwXG4gICAgLy8gU2NyaXB0IHJhdGhlciB0aGFuIHRoZSBsaW5lIGp1c3QgcGFzdCB0aGUgZW5kIG9mIHRoZSBidW5kbGUuIFRoYXQgcGF0aFxuICAgIC8vIGlzIHJhcmUgKGl0IHJlcXVpcmVzIHRoZSBsb29rdXAgYD8uZ2V0KC4uLilgIGV4cHJlc3Npb24gdG8gdGhyb3cpIGFuZFxuICAgIC8vIGRvZXMgbm90IGFmZmVjdCB0aGUgd29ya2Zsb3cgZnVuY3Rpb24gb3IgcmVwbGF5IGRldGVybWluaXNtLlxuICAgIHJ1bkNhY2hlZFdvcmtmbG93U2NyaXB0KHdvcmtmbG93Q29kZSwgZmlsZW5hbWUsIGNvbnRleHQpO1xuICAgIGNvbnN0IHdvcmtmbG93Rm4gPSBydW5DYWNoZWRXb3JrZmxvd1NjcmlwdChcbiAgICAgIGBnbG9iYWxUaGlzLl9fcHJpdmF0ZV93b3JrZmxvd3M/LmdldCgke0pTT04uc3RyaW5naWZ5KHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSl9KWAsXG4gICAgICBmaWxlbmFtZSxcbiAgICAgIGNvbnRleHRcbiAgICApO1xuXG4gICAgaWYgKHR5cGVvZiB3b3JrZmxvd0ZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3Iod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKTtcbiAgICB9XG5cbiAgICAvLyBDaGFpbiB3b3JrZmxvdyBhcmd1bWVudCBoeWRyYXRpb24gb250byB0aGUgcHJvbWlzZVF1ZXVlIHNvIHRoYXQgdGhlXG4gICAgLy8gdW5jb25zdW1lZCBldmVudCBjaGVjayAod2hpY2ggd2FpdHMgZm9yIHRoZSBxdWV1ZSB0byBkcmFpbikgZG9lc24ndFxuICAgIC8vIGZpcmUgZHVyaW5nIHRoZSBhc3luYyBnYXAgYmV0d2VlbiBydW5fc3RhcnRlZCBjb25zdW1wdGlvbiBhbmQgdGhlXG4gICAgLy8gd29ya2Zsb3cgZnVuY3Rpb24gc3Vic2NyaWJpbmcgaXRzIGZpcnN0IHN0ZXAgY2FsbGJhY2tzLlxuICAgIGxldCBhcmdzOiB1bmtub3duW10gPSBbXTtcbiAgICB3b3JrZmxvd0NvbnRleHQucHJvbWlzZVF1ZXVlID0gd29ya2Zsb3dDb250ZXh0LnByb21pc2VRdWV1ZS50aGVuKFxuICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhcmdzID0gYXdhaXQgaHlkcmF0ZVdvcmtmbG93QXJndW1lbnRzKFxuICAgICAgICAgIHdvcmtmbG93UnVuLmlucHV0LFxuICAgICAgICAgIHdvcmtmbG93UnVuLnJ1bklkLFxuICAgICAgICAgIGVuY3J5cHRpb25LZXksXG4gICAgICAgICAgdm1HbG9iYWxUaGlzXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcbiAgICBhd2FpdCB3b3JrZmxvd0NvbnRleHQucHJvbWlzZVF1ZXVlO1xuXG4gICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dBcmd1bWVudHNDb3VudChhcmdzLmxlbmd0aCksXG4gICAgfSk7XG5cbiAgICAvLyBJbnZva2UgdXNlciB3b3JrZmxvd1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBQcm9taXNlLnJhY2UoW1xuICAgICAgICB3b3JrZmxvd0ZuKC4uLmFyZ3MpLFxuICAgICAgICB3b3JrZmxvd0Rpc2NvbnRpbnVhdGlvbi5wcm9taXNlLFxuICAgICAgXSk7XG5cbiAgICAgIGNvbnN0IGRlaHlkcmF0ZWQgPSBhd2FpdCBkZWh5ZHJhdGVXb3JrZmxvd1JldHVyblZhbHVlKFxuICAgICAgICByZXN1bHQsXG4gICAgICAgIHdvcmtmbG93UnVuLnJ1bklkLFxuICAgICAgICBlbmNyeXB0aW9uS2V5LFxuICAgICAgICB2bUdsb2JhbFRoaXNcbiAgICAgICk7XG5cbiAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSZXN1bHRUeXBlKHR5cGVvZiByZXN1bHQpLFxuICAgICAgfSk7XG5cbiAgICAgIHdhcm5QZW5kaW5nUXVldWVJdGVtcyhcbiAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgIHdvcmtmbG93Q29udGV4dC5pbnZvY2F0aW9uc1F1ZXVlLFxuICAgICAgICAnY29tcGxldGVkJ1xuICAgICAgKTtcblxuICAgICAgcmV0dXJuIGRlaHlkcmF0ZWQ7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBDb250cm9sLWZsb3cgc2lnbmFscyBhcmUgaGFuZGxlZCBieSB0aGUgcnVudGltZSBhbmQgZG8gbm90IG1lYW4gdGhlXG4gICAgICAvLyB3b3JrZmxvdyBoYXMgdGVybWluYWxseSBmYWlsZWQuXG4gICAgICBpZiAoV29ya2Zsb3dTdXNwZW5zaW9uLmlzKGVycikgfHwgUmVwbGF5RGl2ZXJnZW5jZUVycm9yLmlzKGVycikpIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuXG4gICAgICB3YXJuUGVuZGluZ1F1ZXVlSXRlbXMoXG4gICAgICAgIHdvcmtmbG93UnVuLnJ1bklkLFxuICAgICAgICB3b3JrZmxvd0NvbnRleHQuaW52b2NhdGlvbnNRdWV1ZSxcbiAgICAgICAgJ2ZhaWxlZCdcbiAgICAgICk7XG5cbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH0pO1xufVxuIiwgImltcG9ydCB7XG4gIEVSUk9SX1NMVUdTLFxuICBIb29rTm90Rm91bmRFcnJvcixcbiAgV29ya2Zsb3dSdW50aW1lRXJyb3IsXG59IGZyb20gJ0B3b3JrZmxvdy9lcnJvcnMnO1xuaW1wb3J0IHtcbiAgdHlwZSBIb29rLFxuICBpc0xlZ2FjeVNwZWNWZXJzaW9uLFxuICBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgU1BFQ19WRVJTSU9OX0xFR0FDWSxcbiAgdHlwZSBXb3JrZmxvd0ludm9rZVBheWxvYWQsXG4gIHR5cGUgV29ya2Zsb3dSdW4sXG59IGZyb20gJ0B3b3JrZmxvdy93b3JsZCc7XG5pbXBvcnQgeyBnZXRSdW5DYXBhYmlsaXRpZXMgfSBmcm9tICcuLi9jYXBhYmlsaXRpZXMuanMnO1xuaW1wb3J0IHsgdHlwZSBDcnlwdG9LZXksIGltcG9ydEtleSB9IGZyb20gJy4uL2VuY3J5cHRpb24uanMnO1xuaW1wb3J0IHsgcnVudGltZUxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlci5qcyc7XG5pbXBvcnQge1xuICBkZWh5ZHJhdGVTdGVwUmV0dXJuVmFsdWUsXG4gIGh5ZHJhdGVTdGVwQXJndW1lbnRzLFxuICBTZXJpYWxpemF0aW9uRm9ybWF0LFxufSBmcm9tICcuLi9zZXJpYWxpemF0aW9uLmpzJztcbmltcG9ydCB7IFdFQkhPT0tfUkVTUE9OU0VfV1JJVEFCTEUgfSBmcm9tICcuLi9zeW1ib2xzLmpzJztcbmltcG9ydCAqIGFzIEF0dHJpYnV0ZSBmcm9tICcuLi90ZWxlbWV0cnkvc2VtYW50aWMtY29udmVudGlvbnMuanMnO1xuaW1wb3J0IHsgZ2V0U3BhbkNvbnRleHRGb3JUcmFjZUNhcnJpZXIsIHRyYWNlIH0gZnJvbSAnLi4vdGVsZW1ldHJ5LmpzJztcbmltcG9ydCB7IGdldFdvcmtmbG93UXVldWVOYW1lIH0gZnJvbSAnLi9oZWxwZXJzLmpzJztcbmltcG9ydCB7IHNhZmVXYWl0VW50aWwsIHdhaXRlZFVudGlsIH0gZnJvbSAnLi93YWl0LXVudGlsLmpzJztcbmltcG9ydCB7IGdldFdvcmxkIH0gZnJvbSAnLi93b3JsZC5qcyc7XG5cbmFzeW5jIGZ1bmN0aW9uIG1hdGVyaWFsaXplUmVzcG9uc2VCb2R5KHJlc3BvbnNlOiBSZXNwb25zZSk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgaWYgKCFyZXNwb25zZS5ib2R5KSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9XG5cbiAgY29uc3QgYm9keSA9IGF3YWl0IHJlc3BvbnNlLmFycmF5QnVmZmVyKCk7XG4gIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwge1xuICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgIHN0YXR1c1RleHQ6IHJlc3BvbnNlLnN0YXR1c1RleHQsXG4gICAgaGVhZGVyczogcmVzcG9uc2UuaGVhZGVycyxcbiAgfSk7XG59XG5cbi8qKlxuICogSW50ZXJuYWwgaGVscGVyIHRoYXQgcmV0dXJucyB0aGUgaG9vaywgdGhlIGFzc29jaWF0ZWQgd29ya2Zsb3cgcnVuLFxuICogYW5kIHRoZSByZXNvbHZlZCBlbmNyeXB0aW9uIGtleS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0SG9va0J5VG9rZW5XaXRoS2V5KHRva2VuOiBzdHJpbmcpOiBQcm9taXNlPHtcbiAgaG9vazogSG9vaztcbiAgcnVuOiBXb3JrZmxvd1J1bjtcbiAgZW5jcnlwdGlvbktleTogQ3J5cHRvS2V5IHwgdW5kZWZpbmVkO1xufT4ge1xuICBjb25zdCB3b3JsZCA9IGdldFdvcmxkKCk7XG4gIGNvbnN0IGhvb2sgPSBhd2FpdCB3b3JsZC5ob29rcy5nZXRCeVRva2VuKHRva2VuKTtcbiAgY29uc3QgcnVuID0gYXdhaXQgd29ybGQucnVucy5nZXQoaG9vay5ydW5JZCk7XG4gIGNvbnN0IHJhd0tleSA9IGF3YWl0IHdvcmxkLmdldEVuY3J5cHRpb25LZXlGb3JSdW4/LihydW4pO1xuICBjb25zdCBlbmNyeXB0aW9uS2V5ID0gcmF3S2V5ID8gYXdhaXQgaW1wb3J0S2V5KHJhd0tleSkgOiB1bmRlZmluZWQ7XG4gIGlmICh0eXBlb2YgaG9vay5tZXRhZGF0YSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBob29rLm1ldGFkYXRhID0gYXdhaXQgaHlkcmF0ZVN0ZXBBcmd1bWVudHMoXG4gICAgICBob29rLm1ldGFkYXRhIGFzIGFueSxcbiAgICAgIGhvb2sucnVuSWQsXG4gICAgICBlbmNyeXB0aW9uS2V5XG4gICAgKTtcbiAgfVxuICByZXR1cm4geyBob29rLCBydW4sIGVuY3J5cHRpb25LZXkgfTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGhvb2sgYnkgdG9rZW4gdG8gZmluZCB0aGUgYXNzb2NpYXRlZCB3b3JrZmxvdyBydW4sXG4gKiBhbmQgaHlkcmF0ZSB0aGUgYG1ldGFkYXRhYCBwcm9wZXJ0eSBpZiBpdCB3YXMgc2V0IGZyb20gd2l0aGluXG4gKiB0aGUgd29ya2Zsb3cgcnVuLlxuICpcbiAqIEBwYXJhbSB0b2tlbiAtIFRoZSB1bmlxdWUgdG9rZW4gaWRlbnRpZnlpbmcgdGhlIGhvb2tcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEhvb2tCeVRva2VuKHRva2VuOiBzdHJpbmcpOiBQcm9taXNlPEhvb2s+IHtcbiAgY29uc3QgeyBob29rIH0gPSBhd2FpdCBnZXRIb29rQnlUb2tlbldpdGhLZXkodG9rZW4pO1xuICByZXR1cm4gaG9vaztcbn1cblxuLyoqXG4gKiBSZXN1bWVzIGEgd29ya2Zsb3cgcnVuIGJ5IHNlbmRpbmcgYSBwYXlsb2FkIHRvIGEgaG9vayBpZGVudGlmaWVkIGJ5IGl0cyB0b2tlbi5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBleHRlcm5hbGx5IChlLmcuLCBmcm9tIGFuIEFQSSByb3V0ZSBvciBzZXJ2ZXIgYWN0aW9uKVxuICogdG8gc2VuZCBkYXRhIHRvIGEgaG9vayBhbmQgcmVzdW1lIHRoZSBhc3NvY2lhdGVkIHdvcmtmbG93IHJ1bi5cbiAqXG4gKiBAcGFyYW0gdG9rZW5Pckhvb2sgLSBUaGUgdW5pcXVlIHRva2VuIGlkZW50aWZ5aW5nIHRoZSBob29rLCBvciB0aGUgaG9vayBvYmplY3QgaXRzZWxmXG4gKiBAcGFyYW0gcGF5bG9hZCAtIFRoZSBkYXRhIHBheWxvYWQgdG8gc2VuZCB0byB0aGUgaG9va1xuICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gdGhlIGhvb2tcbiAqIEB0aHJvd3MgRXJyb3IgaWYgdGhlIGhvb2sgaXMgbm90IGZvdW5kIG9yIGlmIHRoZXJlJ3MgYW4gZXJyb3IgZHVyaW5nIHRoZSBwcm9jZXNzXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBgYGB0c1xuICogLy8gSW4gYW4gQVBJIHJvdXRlXG4gKiBpbXBvcnQgeyByZXN1bWVIb29rIH0gZnJvbSAnQHdvcmtmbG93L2NvcmUvcnVudGltZSc7XG4gKlxuICogZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogUmVxdWVzdCkge1xuICogICBjb25zdCB7IHRva2VuLCBkYXRhIH0gPSBhd2FpdCByZXF1ZXN0Lmpzb24oKTtcbiAqXG4gKiAgIHRyeSB7XG4gKiAgICAgY29uc3QgaG9vayA9IGF3YWl0IHJlc3VtZUhvb2sodG9rZW4sIGRhdGEpO1xuICogICAgIHJldHVybiBSZXNwb25zZS5qc29uKHsgcnVuSWQ6IGhvb2sucnVuSWQgfSk7XG4gKiAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgICAgcmV0dXJuIG5ldyBSZXNwb25zZSgnSG9vayBub3QgZm91bmQnLCB7IHN0YXR1czogNDA0IH0pO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3VtZUhvb2s8VCA9IGFueT4oXG4gIHRva2VuT3JIb29rOiBzdHJpbmcgfCBIb29rLFxuICBwYXlsb2FkOiBULFxuICBlbmNyeXB0aW9uS2V5T3ZlcnJpZGU/OiBDcnlwdG9LZXlcbik6IFByb21pc2U8SG9vaz4ge1xuICByZXR1cm4gYXdhaXQgd2FpdGVkVW50aWwoKCkgPT4ge1xuICAgIHJldHVybiB0cmFjZSgnaG9vay5yZXN1bWUnLCBhc3luYyAoc3BhbikgPT4ge1xuICAgICAgY29uc3Qgd29ybGQgPSBnZXRXb3JsZCgpO1xuXG4gICAgICB0cnkge1xuICAgICAgICBsZXQgaG9vazogSG9vaztcbiAgICAgICAgbGV0IHdvcmtmbG93UnVuOiBXb3JrZmxvd1J1bjtcbiAgICAgICAgbGV0IGVuY3J5cHRpb25LZXk6IENyeXB0b0tleSB8IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHR5cGVvZiB0b2tlbk9ySG9vayA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnZXRIb29rQnlUb2tlbldpdGhLZXkodG9rZW5Pckhvb2spO1xuICAgICAgICAgIGhvb2sgPSByZXN1bHQuaG9vaztcbiAgICAgICAgICB3b3JrZmxvd1J1biA9IHJlc3VsdC5ydW47XG4gICAgICAgICAgZW5jcnlwdGlvbktleSA9IGVuY3J5cHRpb25LZXlPdmVycmlkZSA/PyByZXN1bHQuZW5jcnlwdGlvbktleTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBob29rID0gdG9rZW5Pckhvb2s7XG4gICAgICAgICAgd29ya2Zsb3dSdW4gPSBhd2FpdCB3b3JsZC5ydW5zLmdldChob29rLnJ1bklkKTtcbiAgICAgICAgICBpZiAoZW5jcnlwdGlvbktleU92ZXJyaWRlKSB7XG4gICAgICAgICAgICBlbmNyeXB0aW9uS2V5ID0gZW5jcnlwdGlvbktleU92ZXJyaWRlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCByYXdLZXkgPSBhd2FpdCB3b3JsZC5nZXRFbmNyeXB0aW9uS2V5Rm9yUnVuPy4od29ya2Zsb3dSdW4pO1xuICAgICAgICAgICAgZW5jcnlwdGlvbktleSA9IHJhd0tleSA/IGF3YWl0IGltcG9ydEtleShyYXdLZXkpIDogdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Ib29rVG9rZW4oaG9vay50b2tlbiksXG4gICAgICAgICAgLi4uQXR0cmlidXRlLkhvb2tJZChob29rLmhvb2tJZCksXG4gICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuSWQoaG9vay5ydW5JZCksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENoZWNrIHRoZSB0YXJnZXQgcnVuJ3MgY2FwYWJpbGl0aWVzIHRvIGVuc3VyZSB3ZSBlbmNvZGUgdGhlXG4gICAgICAgIC8vIHBheWxvYWQgaW4gYSBmb3JtYXQgdGhlIHJ1bidzIGRlcGxveW1lbnQgY2FuIGRlY29kZS4gRm9yIGV4YW1wbGUsXG4gICAgICAgIC8vIHJ1bnMgY3JlYXRlZCBiZWZvcmUgZW5jcnlwdGlvbiBzdXBwb3J0IHdhcyBhZGRlZCBjYW5ub3QgZGVjb2RlXG4gICAgICAgIC8vIHRoZSAnZW5jcicgc2VyaWFsaXphdGlvbiBmb3JtYXQsIGFuZCBydW5zIGNyZWF0ZWQgYmVmb3JlXG4gICAgICAgIC8vIGJ5dGUtc3RyZWFtIGZyYW1pbmcgc3VwcG9ydCBjYW5ub3QgZGVjb2RlIGZyYW1lZCBieXRlIHN0cmVhbXMuXG4gICAgICAgIGNvbnN0IHJhd1ZlcnNpb24gPSB3b3JrZmxvd1J1bi5leGVjdXRpb25Db250ZXh0Py53b3JrZmxvd0NvcmVWZXJzaW9uO1xuICAgICAgICBjb25zdCBjYXBhYmlsaXRpZXMgPSBnZXRSdW5DYXBhYmlsaXRpZXMoXG4gICAgICAgICAgdHlwZW9mIHJhd1ZlcnNpb24gPT09ICdzdHJpbmcnID8gcmF3VmVyc2lvbiA6IHVuZGVmaW5lZFxuICAgICAgICApO1xuICAgICAgICBpZiAoIWNhcGFiaWxpdGllcy5zdXBwb3J0ZWRGb3JtYXRzLmhhcyhTZXJpYWxpemF0aW9uRm9ybWF0LkVOQ1JZUFRFRCkpIHtcbiAgICAgICAgICBlbmNyeXB0aW9uS2V5ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVoeWRyYXRlIHRoZSBwYXlsb2FkIGZvciBzdG9yYWdlXG4gICAgICAgIGNvbnN0IG9wczogUHJvbWlzZTxhbnk+W10gPSBbXTtcbiAgICAgICAgY29uc3QgdjFDb21wYXQgPSBpc0xlZ2FjeVNwZWNWZXJzaW9uKGhvb2suc3BlY1ZlcnNpb24pO1xuICAgICAgICBjb25zdCBkZWh5ZHJhdGVkUGF5bG9hZCA9IGF3YWl0IGRlaHlkcmF0ZVN0ZXBSZXR1cm5WYWx1ZShcbiAgICAgICAgICBwYXlsb2FkLFxuICAgICAgICAgIGhvb2sucnVuSWQsXG4gICAgICAgICAgZW5jcnlwdGlvbktleSxcbiAgICAgICAgICBvcHMsXG4gICAgICAgICAgZ2xvYmFsVGhpcyxcbiAgICAgICAgICB2MUNvbXBhdCxcbiAgICAgICAgICBjYXBhYmlsaXRpZXMuZnJhbWVkQnl0ZVN0cmVhbXNcbiAgICAgICAgKTtcbiAgICAgICAgLy8gVGhlc2UgcGF5bG9hZC1zdHJlYW0gb3BzIGFyZSBmbHVzaGVkIGluIHRoZSBiYWNrZ3JvdW5kOyB0aGVcbiAgICAgICAgLy8gcHJvbWlzZSBoYW5kZWQgdG8gd2FpdFVudGlsIG11c3QgbmV2ZXIgcmVqZWN0IChhbiB1bmNvbnN1bWVkXG4gICAgICAgIC8vIHdhaXRVbnRpbCByZWplY3Rpb24gY3Jhc2hlcyB0aGUgcHJvY2VzcyBhcyB1bmhhbmRsZWRSZWplY3Rpb24pLFxuICAgICAgICAvLyBzbyB1bmV4cGVjdGVkIGZhaWx1cmVzIGFyZSBsb2dnZWQgaW5zdGVhZC5cbiAgICAgICAgLy8gTk9URTogcmVqZWN0aW9ucyB3aXRoIGB1bmRlZmluZWRgIGFyZSBhbiBleHBlY3RlZCBhcnRpZmFjdCBvZiB0aGVcbiAgICAgICAgLy8gd2ViaG9vayBidW5kbGUgYW5kIGFyZSBpZ25vcmVkIGVudGlyZWx5LlxuICAgICAgICBzYWZlV2FpdFVudGlsKFByb21pc2UuYWxsKG9wcyksIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgICBydW50aW1lTG9nZ2VyLndhcm4oJ0JhY2tncm91bmQgZmx1c2ggb2YgaG9vayBwYXlsb2FkIG9wcyBmYWlsZWQnLCB7XG4gICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBob29rLnJ1bklkLFxuICAgICAgICAgICAgaG9va0lkOiBob29rLmhvb2tJZCxcbiAgICAgICAgICAgIGVycm9yOiBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVyciksXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIGhvb2tfcmVjZWl2ZWQgZXZlbnQgd2l0aCB0aGUgcGF5bG9hZFxuICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgIGhvb2sucnVuSWQsXG4gICAgICAgICAge1xuICAgICAgICAgICAgZXZlbnRUeXBlOiAnaG9va19yZWNlaXZlZCcsXG4gICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICBjb3JyZWxhdGlvbklkOiBob29rLmhvb2tJZCxcbiAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAuLi4odjFDb21wYXQgPyB7fSA6IHsgdG9rZW46IGhvb2sudG9rZW4gfSksXG4gICAgICAgICAgICAgIHBheWxvYWQ6IGRlaHlkcmF0ZWRQYXlsb2FkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHsgdjFDb21wYXQgfVxuICAgICAgICApO1xuXG4gICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd05hbWUod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgdHJhY2VDYXJyaWVyID0gd29ya2Zsb3dSdW4uZXhlY3V0aW9uQ29udGV4dD8udHJhY2VDYXJyaWVyO1xuXG4gICAgICAgIGlmICh0cmFjZUNhcnJpZXIpIHtcbiAgICAgICAgICBjb25zdCBjb250ZXh0ID0gYXdhaXQgZ2V0U3BhbkNvbnRleHRGb3JUcmFjZUNhcnJpZXIodHJhY2VDYXJyaWVyKTtcbiAgICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgc3Bhbj8uYWRkTGluaz8uKHsgY29udGV4dCB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZS10cmlnZ2VyIHRoZSB3b3JrZmxvdyBhZ2FpbnN0IHRoZSBkZXBsb3ltZW50IElEIGFzc29jaWF0ZWRcbiAgICAgICAgLy8gd2l0aCB0aGUgd29ya2Zsb3cgcnVuIHRoYXQgdGhlIGhvb2sgYmVsb25ncyB0b1xuICAgICAgICBhd2FpdCB3b3JsZC5xdWV1ZShcbiAgICAgICAgICBnZXRXb3JrZmxvd1F1ZXVlTmFtZSh3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHJ1bklkOiBob29rLnJ1bklkLFxuICAgICAgICAgICAgLy8gYXR0YWNoIHRoZSB0cmFjZSBjYXJyaWVyIGZyb20gdGhlIHdvcmtmbG93IHJ1blxuICAgICAgICAgICAgdHJhY2VDYXJyaWVyOlxuICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5leGVjdXRpb25Db250ZXh0Py50cmFjZUNhcnJpZXIgPz8gdW5kZWZpbmVkLFxuICAgICAgICAgIH0gc2F0aXNmaWVzIFdvcmtmbG93SW52b2tlUGF5bG9hZCxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBkZXBsb3ltZW50SWQ6IHdvcmtmbG93UnVuLmRlcGxveW1lbnRJZCxcbiAgICAgICAgICAgIHNwZWNWZXJzaW9uOiB3b3JrZmxvd1J1bi5zcGVjVmVyc2lvbiA/PyBTUEVDX1ZFUlNJT05fTEVHQUNZLFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gaG9vaztcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuSG9va1Rva2VuKFxuICAgICAgICAgICAgdHlwZW9mIHRva2VuT3JIb29rID09PSAnc3RyaW5nJyA/IHRva2VuT3JIb29rIDogdG9rZW5Pckhvb2sudG9rZW5cbiAgICAgICAgICApLFxuICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Ib29rRm91bmQoZmFsc2UpLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXN1bWVzIGEgd2ViaG9vayBieSBzZW5kaW5nIGEge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9SZXF1ZXN0IHwgUmVxdWVzdH1cbiAqIG9iamVjdCB0byBhIGhvb2sgaWRlbnRpZmllZCBieSBpdHMgdG9rZW4uXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgZXh0ZXJuYWxseSAoZS5nLiwgZnJvbSBhbiBBUEkgcm91dGUgb3Igc2VydmVyIGFjdGlvbilcbiAqIHRvIHNlbmQgYSByZXF1ZXN0IHRvIGEgd2ViaG9vayBhbmQgcmVzdW1lIHRoZSBhc3NvY2lhdGVkIHdvcmtmbG93IHJ1bi5cbiAqXG4gKiBAcGFyYW0gdG9rZW4gLSBUaGUgdW5pcXVlIHRva2VuIGlkZW50aWZ5aW5nIHRoZSBob29rXG4gKiBAcGFyYW0gcmVxdWVzdCAtIFRoZSByZXF1ZXN0IHRvIHNlbmQgdG8gdGhlIGhvb2tcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHRoZSByZXNwb25zZVxuICogQHRocm93cyBFcnJvciBpZiB0aGUgaG9vayBpcyBub3QgZm91bmQgb3IgaWYgdGhlcmUncyBhbiBlcnJvciBkdXJpbmcgdGhlIHByb2Nlc3NcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGBgYHRzXG4gKiAvLyBJbiBhbiBBUEkgcm91dGVcbiAqIGltcG9ydCB7IHJlc3VtZVdlYmhvb2sgfSBmcm9tICdAd29ya2Zsb3cvY29yZS9ydW50aW1lJztcbiAqXG4gKiBleHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gKiAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxdWVzdC51cmwpO1xuICogICBjb25zdCB0b2tlbiA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCd0b2tlbicpO1xuICpcbiAqICAgaWYgKCF0b2tlbikge1xuICogICAgIHJldHVybiBuZXcgUmVzcG9uc2UoJ01pc3NpbmcgdG9rZW4nLCB7IHN0YXR1czogNDAwIH0pO1xuICogICB9XG4gKlxuICogICB0cnkge1xuICogICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVzdW1lV2ViaG9vayh0b2tlbiwgcmVxdWVzdCk7XG4gKiAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICogICB9IGNhdGNoIChlcnJvcikge1xuICogICAgIHJldHVybiBuZXcgUmVzcG9uc2UoJ1dlYmhvb2sgbm90IGZvdW5kJywgeyBzdGF0dXM6IDQwNCB9KTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXN1bWVXZWJob29rKFxuICB0b2tlbjogc3RyaW5nLFxuICByZXF1ZXN0OiBSZXF1ZXN0XG4pOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGNvbnN0IHsgaG9vaywgZW5jcnlwdGlvbktleSB9ID0gYXdhaXQgZ2V0SG9va0J5VG9rZW5XaXRoS2V5KHRva2VuKTtcblxuICAvLyBPbmx5IHdlYmhvb2tzIGNhbiBiZSByZXN1bWVkIHZpYSB0aGUgcHVibGljIGVuZHBvaW50LlxuICAvLyBJZiB0aGUgaG9vayB3YXMgY3JlYXRlZCB2aWEgY3JlYXRlSG9vaygpIChpc1dlYmhvb2sgIT09IHRydWUpLFxuICAvLyB0aHJvdyB0aGUgc2FtZSBcIm5vdCBmb3VuZFwiIGVycm9yIHRoZSB3b3JsZCB3b3VsZCB0aHJvdyBmb3IgYSBtaXNzaW5nXG4gIC8vIHRva2VuLiBUaGlzIHByZXZlbnRzIGxlYWtpbmcgdGhhdCB0aGUgdG9rZW4gaXMgdmFsaWQuXG4gIGlmIChob29rLmlzV2ViaG9vayA9PT0gZmFsc2UpIHtcbiAgICB0aHJvdyBuZXcgSG9va05vdEZvdW5kRXJyb3IodG9rZW4pO1xuICB9XG5cbiAgbGV0IHJlc3BvbnNlOiBSZXNwb25zZSB8IHVuZGVmaW5lZDtcbiAgbGV0IHJlc3BvbnNlUmVhZGFibGU6IFJlYWRhYmxlU3RyZWFtPFJlc3BvbnNlPiB8IHVuZGVmaW5lZDtcbiAgaWYgKFxuICAgIGhvb2subWV0YWRhdGEgJiZcbiAgICB0eXBlb2YgaG9vay5tZXRhZGF0YSA9PT0gJ29iamVjdCcgJiZcbiAgICAncmVzcG9uZFdpdGgnIGluIGhvb2subWV0YWRhdGFcbiAgKSB7XG4gICAgaWYgKGhvb2subWV0YWRhdGEucmVzcG9uZFdpdGggPT09ICdtYW51YWwnKSB7XG4gICAgICBjb25zdCB7IHJlYWRhYmxlLCB3cml0YWJsZSB9ID0gbmV3IFRyYW5zZm9ybVN0cmVhbTxSZXNwb25zZSwgUmVzcG9uc2U+KCk7XG4gICAgICByZXNwb25zZVJlYWRhYmxlID0gcmVhZGFibGU7XG5cbiAgICAgIC8vIFRoZSByZXF1ZXN0IGluc3RhbmNlIGluY2x1ZGVzIHRoZSB3cml0YWJsZSBzdHJlYW0gd2hpY2ggd2lsbCBiZSB1c2VkXG4gICAgICAvLyB0byB3cml0ZSB0aGUgcmVzcG9uc2UgdG8gdGhlIGNsaWVudCBmcm9tIHdpdGhpbiB0aGUgd29ya2Zsb3cgcnVuXG4gICAgICAocmVxdWVzdCBhcyBhbnkpW1dFQkhPT0tfUkVTUE9OU0VfV1JJVEFCTEVdID0gd3JpdGFibGU7XG4gICAgfSBlbHNlIGlmIChob29rLm1ldGFkYXRhLnJlc3BvbmRXaXRoIGluc3RhbmNlb2YgUmVzcG9uc2UpIHtcbiAgICAgIHJlc3BvbnNlID0gaG9vay5tZXRhZGF0YS5yZXNwb25kV2l0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKFxuICAgICAgICBgSW52YWxpZCBcXGByZXNwb25kV2l0aFxcYCB2YWx1ZTogJHtob29rLm1ldGFkYXRhLnJlc3BvbmRXaXRofWAsXG4gICAgICAgIHsgc2x1ZzogRVJST1JfU0xVR1MuV0VCSE9PS19JTlZBTElEX1JFU1BPTkRfV0lUSF9WQUxVRSB9XG4gICAgICApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBObyBgcmVzcG9uZFdpdGhgIHZhbHVlIGltcGxpZXMgdGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgcmV0dXJuaW5nIGEgMjAyXG4gICAgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwgeyBzdGF0dXM6IDIwMiB9KTtcbiAgfVxuXG4gIGF3YWl0IHJlc3VtZUhvb2soaG9vaywgcmVxdWVzdCwgZW5jcnlwdGlvbktleSk7XG5cbiAgaWYgKHJlc3BvbnNlUmVhZGFibGUpIHtcbiAgICAvLyBXYWl0IGZvciB0aGUgcmVhZGFibGUgc3RyZWFtIHRvIGVtaXQgb25lIGNodW5rLFxuICAgIC8vIHdoaWNoIGlzIHRoZSBgUmVzcG9uc2VgIG9iamVjdFxuICAgIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlUmVhZGFibGUuZ2V0UmVhZGVyKCk7XG4gICAgY29uc3QgY2h1bmsgPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgIGlmIChjaHVuay52YWx1ZSkge1xuICAgICAgcmVzcG9uc2UgPSBhd2FpdCBtYXRlcmlhbGl6ZVJlc3BvbnNlQm9keShjaHVuay52YWx1ZSk7XG4gICAgfVxuICAgIGF3YWl0IHJlYWRlci5jYW5jZWwoKTtcbiAgfVxuXG4gIGlmICghcmVzcG9uc2UpIHtcbiAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IoJ1dvcmtmbG93IHJ1biBkaWQgbm90IHNlbmQgYSByZXNwb25zZScsIHtcbiAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLldFQkhPT0tfUkVTUE9OU0VfTk9UX1NFTlQsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzcG9uc2U7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW1ETyxTQUFTLHNCQUFzQixPQUFPO0FBQ3pDLGtCQUFnQixPQUFPLFlBQVksTUFBTSxJQUFJLENBQUMsTUFBSTtBQUFBLElBQzFDLEVBQUU7QUFBQSxJQUNGO0FBQUEsRUFDSixDQUFDLENBQUM7QUFDVjtBQUtXLFNBQVMsdUJBQXVCO0FBQ3ZDLFNBQU87QUFBQSxJQUNILEdBQUc7QUFBQSxJQUNILEdBQUc7QUFBQSxFQUNQO0FBQ0o7QUFTVyxTQUFTLGdCQUFnQixPQUFPO0FBQ3ZDLGtCQUFnQixPQUFPLFlBQVksTUFBTSxJQUFJLENBQUMsTUFBSTtBQUFBLElBQzFDLEVBQUU7QUFBQSxJQUNGO0FBQUEsRUFDSixDQUFDLENBQUM7QUFDVjtBQUN1RyxTQUFTLGlCQUFpQjtBQUM3SCxTQUFPO0FBQUEsSUFDSCxHQUFHO0FBQUEsSUFDSCxHQUFHO0FBQUEsRUFDUDtBQUNKO0FBOE1PLFNBQVMsaUJBQWlCLFNBQVMsVUFBVTtBQUNoRCxTQUFPLFVBQVUsT0FBTyxLQUFLLFVBQVUsUUFBUTtBQUNuRDtBQUNPLFNBQVMsYUFBYSxNQUFNLFNBQVMsQ0FBQyxHQUFHO0FBQzVDLFNBQU8sT0FBTyxPQUFPLGVBQWUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFJLEVBQUUsY0FBYyxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQUksaUJBQWlCLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBSSxDQUFDLEVBQUUsa0JBQWtCLEVBQUUsZUFBZSxXQUFXLEtBQUssT0FBTyxTQUFTLGdCQUFnQixLQUFLLEVBQUUs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QUFBLElBQ0E7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUFBLEVBQ0E7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQ0o7QUFDQSxJQUFNLGNBQWM7QUFBQSxFQUNoQjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7QUFDQSxTQUFTLGlCQUFpQjtBQUN0QixTQUFPO0FBQUEsSUFDSDtBQUFBLElBQ0E7QUFBQSxJQUNBLElBQUksT0FBTyxTQUFTLFlBQVksS0FBSyxHQUFHLENBQUMsUUFBUSxJQUFJO0FBQUEsSUFDckQ7QUFBQSxFQUNKO0FBQ0o7QUFQUztBQVFULElBQU0scUJBQXFCO0FBQUEsRUFDdkI7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0E7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0E7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFB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QUFBQSxJQUNBLFlBQVk7QUFBQSxNQUNSLFlBQVk7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsTUFDQSxVQUFVO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBQ0EsZ0JBQWdCO0FBQUEsTUFDWixZQUFZO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNOO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDWCxZQUFZO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNQLFlBQVk7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNOO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFDQSx5QkFBeUI7QUFBQSxNQUNyQixZQUFZO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNYLFlBQVk7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEs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LFFBQ0EsV0FHRDtBQUNELFNBQ0UsV0FDQSxhQUdBLFlBQ0EseUJBQ0EsY0FHQSxpQkFDRDtBQUNELFNBS0UsYUFDRDtBQUNELFNBQVMsc0JBQXNCO0FBQy9CLFNBQ0UsYUFDQSxZQUFBQyxXQUNBLG9CQUFBQyxtQkFDQSxnQkFDRDsiLAogICJuYW1lcyI6IFsicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZmV0Y2giLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAieiIsICJ6IiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgIkZhdGFsRXJyb3IiLCAieiIsICJ6IiwgInBhcnNlZCIsICJ3cml0ZVByb2dyZXNzQ2h1bmsiLCAiY2xvc2VQcm9ncmVzc1N0cmVhbSIsICJDbGllbnQiLCAid2l0aFBnQ2xpZW50IiwgIkNsaWVudCIsICJxdWVyeVJvd3MiLCAicmVhZCIsICJ1dGlscyIsICJ1dGlscyIsICJ1dGlscyIsICJwb3MiLCAidXRpbHMiLCAidXRpbHMiLCAic3RhcnQiLCAidXRpbHMiLCAiY29sdW1uS2V5cyIsICJyYXdIZWFkZXIiLCAiRmF0YWxFcnJvciIsICJyZWFkIiwgIndpdGhQZ0NsaWVudCIsICJlbWl0UHJvZ3Jlc3NTdGVwIiwgIndyaXRlUHJvZ3Jlc3NDaHVuayIsICJjbG9zZVByb2dyZXNzU3RlcCIsICJjbG9zZVByb2dyZXNzU3RyZWFtIiwgInF1ZXJ5Um93cyIsICJjcmVhdGVkIiwgInNldER5bmFtaWNQYWdlcyIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJSZXBsYXlEaXZlcmdlbmNlRXJyb3IiLCAiV29ya2Zsb3dSdW50aW1lRXJyb3IiLCAicGFyc2VXb3JrZmxvd05hbWUiLCAiU1BFQ19WRVJTSU9OX0NVUlJFTlQiLCAiU1BFQ19WRVJTSU9OX0xFR0FDWSIsICJpbXBvcnRLZXkiLCAiV29ya2Zsb3dTdXNwZW5zaW9uIiwgInJ1bnRpbWVMb2dnZXIiLCAiZ2V0V29ya2Zsb3dRdWV1ZU5hbWUiLCAiZ2V0V29ybGQiLCAiQXR0cmlidXRlIiwgInRyYWNlIiwgIldvcmtmbG93U3VzcGVuc2lvbiIsICJFUlJPUl9TTFVHUyIsICJXb3JrZmxvd1J1bnRpbWVFcnJvciIsICJydW50aW1lTG9nZ2VyIiwgIkF0dHJpYnV0ZSIsICJ0cmFjZSIsICJnZXRXb3JsZCIsICJnZXRXb3JsZEhhbmRsZXJzIl0KfQo=
