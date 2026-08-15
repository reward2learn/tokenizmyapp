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
  manufacturing: "B2MML (Business To Manufacturing Markup Language) for production data",
  "spas-and-wellness": "HL7 for appointment scheduling and client health records, ISO 19011 for wellness service quality management"
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
  manufacturing: "Manufacturer",
  "spas-and-wellness": "HealthAndBeautyBusiness"
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
    packId: "massage-operations-pack",
    name: "Massage Spa Operations Pack",
    description: "Massage spa operations app pack: Appointments & Booking, Client Records, Therapist Management, Spa Finance, and Owner Dashboard with cross-department KPIs.",
    apps: [
      {
        id: "appointments-booking",
        name: "Appointments & Booking",
        department: "Operations",
        summary: "Schedule and manage massage appointments with clients.",
        templateId: "spas-and-wellness"
      },
      {
        id: "client-records",
        name: "Client Records",
        department: "Operations",
        summary: "Maintain client profiles, preferences, and service history.",
        templateId: "spas-and-wellness"
      },
      {
        id: "therapist-management",
        name: "Therapist Management",
        department: "Operations",
        summary: "Manage therapist schedules, qualifications, and performance.",
        templateId: "spas-and-wellness"
      },
      {
        id: "spa-finance",
        name: "Spa Finance",
        department: "Finance",
        summary: "Track spa revenue, expenses, and financial reports.",
        templateId: "financial-analytics"
      },
      {
        id: "owner-dashboard",
        name: "Owner Dashboard",
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
  const modelName = brief.id === "appointments-booking" ? "Appointment" : brief.id === "client-records" ? "Client" : brief.id === "therapist-management" ? "Therapist" : brief.id === "spa-finance" ? "FinancialRecord" : "DepartmentKpi";
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
      sections: p.blockTypes.map((bt) => {
        const config = {};
        if (bt === "doc_markdown" && def.knowledgeSnippets.length > 0) {
          config.source = `${packId}-${def.knowledgeSnippets[0].key}`;
        }
        return {
          blockType: bt,
          config
        };
      })
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
    key TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    app_id TEXT NOT NULL DEFAULT '',
    UNIQUE (key, app_id)
  )`
];
var APP_PACK_TABLE_ALTERS = [
  `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS nav_label TEXT`,
  `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS show_in_nav BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS tenant_slug TEXT`,
  `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS tenant_slug TEXT`,
  `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE knowledge_snippets ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT ''`,
  `CREATE UNIQUE INDEX IF NOT EXISTS knowledge_snippets_key_app_id_key ON knowledge_snippets (key, app_id)`
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
      await client.query(`INSERT INTO knowledge_snippets (id, key, content, category, app_id) VALUES ($1, $2, $3, $4, '')
         ON CONFLICT (key, app_id) DO UPDATE SET content = EXCLUDED.content, category = EXCLUDED.category;`, [
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
    await client.query(`INSERT INTO knowledge_snippets (id, key, content, category, app_id) VALUES ($1, $2, $3, $4, '')
       ON CONFLICT (key, app_id) DO UPDATE SET content = EXCLUDED.content, category = EXCLUDED.category;`, [
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2xpYi9wYWdlLWNhdGFsb2cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL3dvcmtmbG93L3NyYy9pbnRlcm5hbC9idWlsdGlucy50cyIsICIuLi9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL3N0ZGxpYi50cyIsICIuLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMudHMiLCAiLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1nZW5lcmF0b3IudHMiLCAiLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1zY2hlbWEudHMiLCAiLi4vc3JjL2RvbWFpbi9haS9zY2hlbWEtZ2VuZXJhdGlvbi1zY2hlbWEudHMiLCAiLi4vc3JjL2RvbWFpbi9haS96bW9kZWwtY29tcGlsZXIudHMiLCAiLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1jb21waWxlci50cyIsICIuLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLW1hdGVyaWFsaXplci50cyIsICIuLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLXNjaGVtYS1hcHBseS50cyIsICIuLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvcHJvZ3Jlc3MudHMiLCAiLi4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL2RiLnRzIiwgIi4uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMudHMiLCAiLi4vc3JjL2RvbWFpbi9haS13b3JrYm9vay9leHRyYWN0LXNoZWV0cy50cyIsICIuLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL3NoZWV0LWFuYWx5c2lzLnRzIiwgIi4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svY29tcHJlaGVuZC50cyIsICIuLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3Byb2dyZXNzLnRzIiwgIi4uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3QvZGIudHMiLCAiLi4vc3JjL2xpYi93b3JrYm9vay1mb3JtdWxhcy50cyIsICIuLi9zcmMvbGliL2V4Y2VsLWZvcm11bGEudHMiLCAiLi4vc3JjL2xpYi93b3JrYm9vay1tYXBwaW5nLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvYnVpbGRlcnMvc3JjL3NlcmRlLWNoZWNrZXIudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9ydW50aW1lLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvd29ya2Zsb3cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9ydW50aW1lL3Jlc3VtZS1ob29rLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIENvZGUtZmlyc3QgcGFnZSBjYXRhbG9nIFx1MjAxNCBydW50aW1lIFNTb1QgYXQgTVZQLlxuICogU3VwcG9ydHMgc3RhdGljIGNhdGFsb2cgZW50cmllcyBhbmQgZHluYW1pY2FsbHkgcmVnaXN0ZXJlZCBwYWdlc1xuICogKGUuZy4gZnJvbSB3b3JrYm9vayBhbmFseXNpcyBhZnRlciBhbiBFeGNlbCB1cGxvYWQpLlxuICpcbiAqIERCIEFwcFBhZ2UvUGFnZVNlY3Rpb24gc2VlZGVkIGluIFA2OyBjYXRhbG9nIHdpbnMgYXQgcnVudGltZS5cbiAqLyAvKiogUGFydHMgZnJvbSB0aGUgdXBsb2FkZWQgQnVzaW5lc3MgUmV2aWV3IFx1MjAxNCBwb3B1bGF0ZWQgZHluYW1pY2FsbHkgYXQgcmVuZGVyIHRpbWUuICovIC8qKiBTdGF0aWMgcGFydHMgQVx1MjAxM0cgZXhpc3QgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aCBsZWdhY3kgc2VlZGVkIGRvY3MuIER5bmFtaWMgcGFydHMgb3ZlcnJpZGUgdGhlc2UuICovIGNvbnN0IFNUQVRJQ19QQVJUUyA9IHtcbiAgICAncGFydC1hJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtYScsXG4gICAgICAgIHBhcnRLZXk6ICdBJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEE6IEN1cnJlbnQgU2l0dWF0aW9uIFx1MjAxNCBUaGUgTnVtYmVycycsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtYic6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWInLFxuICAgICAgICBwYXJ0S2V5OiAnQicsXG4gICAgICAgIHRpdGxlOiAnUGFydCBCOiBUaGUgMTAtWWVhciBHcm93dGggTW9kZWwnLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWMnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1jJyxcbiAgICAgICAgcGFydEtleTogJ0MnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgQzogUmV2ZW51ZSBPcHRpbWl6YXRpb24gU3RyYXRlZ3knLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWQnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1kJyxcbiAgICAgICAgcGFydEtleTogJ0QnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRDogQ29zdCBNYW5hZ2VtZW50JyxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnXG4gICAgfSxcbiAgICAncGFydC1lJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtZScsXG4gICAgICAgIHBhcnRLZXk6ICdFJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEU6IFJpc2sgUmVnaXN0ZXInLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWYnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1mJyxcbiAgICAgICAgcGFydEtleTogJ0YnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRjogU3RhcldPUkxEIE1lbWJlcnNoaXAgUHJvZ3JhbScsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtZyc6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWcnLFxuICAgICAgICBwYXJ0S2V5OiAnRycsXG4gICAgICAgIHRpdGxlOiAnUGFydCBHOiBJbW1lZGlhdGUgQWN0aW9ucyAoTmV4dCAzMCBEYXlzKScsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH1cbn07XG4vKiogRHluYW1pYyBwYXJ0cyBwb3B1bGF0ZWQgZnJvbSBwYXJzZWQgQnVzaW5lc3MgUmV2aWV3IE1EIHVwbG9hZGVkIHZpYSAvY29uZmlnLiAqLyBsZXQgRFlOQU1JQ19QQVJUUyA9IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIHNldER5bmFtaWNSZXZpZXdQYXJ0cyhwYXJ0cykge1xuICAgIERZTkFNSUNfUEFSVFMgPSBPYmplY3QuZnJvbUVudHJpZXMocGFydHMubWFwKChwKT0+W1xuICAgICAgICAgICAgcC5wYXJ0U2x1ZyxcbiAgICAgICAgICAgIHBcbiAgICAgICAgXSkpO1xufVxuLyoqXG4gKiBEeW5hbWljIGdldHRlciB0aGF0IG1lcmdlcyBzdGF0aWMgKyBhbnkgcnVudGltZS1yZWdpc3RlcmVkIHBhcnRzLlxuICogVXNlIGluc3RlYWQgb2YgUkVWSUVXX1BBUlRfQ0FUQUxPRyBzbyB0aGF0IHNldER5bmFtaWNSZXZpZXdQYXJ0cygpIGNhbGxzXG4gKiBhcmUgcmVmbGVjdGVkIGltbWVkaWF0ZWx5LlxuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5TVEFUSUNfUEFSVFMsXG4gICAgICAgIC4uLkRZTkFNSUNfUEFSVFNcbiAgICB9O1xufVxuLyoqIEBkZXByZWNhdGVkIFVzZSBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpIFx1MjAxNCB0aGlzIGNvbnN0IGlzIGZyb3plbiBhdCBtb2R1bGUgbG9hZCB0aW1lLiAqLyBleHBvcnQgY29uc3QgUkVWSUVXX1BBUlRfQ0FUQUxPRyA9IHtcbiAgICAuLi5TVEFUSUNfUEFSVFMsXG4gICAgLi4uRFlOQU1JQ19QQVJUU1xufTtcbi8qKiBEeW5hbWljIHBhZ2VzIHJlZ2lzdGVyZWQgYXQgcnVudGltZSAoZS5nLiBmcm9tIHdvcmtib29rIGFuYWx5c2lzIGFmdGVyIHJlc2VlZCkuICovIGxldCBEWU5BTUlDX1BBR0VTID0ge307XG4vKipcbiAqIFJlZ2lzdGVyIGR5bmFtaWNhbGx5IGdlbmVyYXRlZCBwYWdlcyBcdTIwMTQgY2FsbGVkIGFmdGVyIHdvcmtib29rIGFuYWx5c2lzXG4gKiBkdXJpbmcgdGhlIHJlc2VlZCBwaXBlbGluZSBzbyBzaGVldC1kZXJpdmVkIGFuYWx5dGljcyBwYWdlcyBhcHBlYXIgaW4gdGhlIG5hdi5cbiAqLyBleHBvcnQgZnVuY3Rpb24gc2V0RHluYW1pY1BhZ2VzKHBhZ2VzKSB7XG4gICAgRFlOQU1JQ19QQUdFUyA9IE9iamVjdC5mcm9tRW50cmllcyhwYWdlcy5tYXAoKHApPT5bXG4gICAgICAgICAgICBwLnNsdWcsXG4gICAgICAgICAgICBwXG4gICAgICAgIF0pKTtcbn1cbi8qKiBDb21iaW5lZCBzdGF0aWMgKyBkeW5hbWljIHBhZ2UgY2F0YWxvZyAoZXZhbHVhdGVkIGxhemlseSBzbyBkeW5hbWljIHBhZ2VzIGFyZSBpbmNsdWRlZCkuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRGdWxsQ2F0YWxvZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5QQUdFX0NBVEFMT0csXG4gICAgICAgIC4uLkRZTkFNSUNfUEFHRVNcbiAgICB9O1xufVxuZXhwb3J0IGNvbnN0IFBBR0VfQ0FUQUxPRyA9IHtcbiAgICBob21lOiB7XG4gICAgICAgIHNsdWc6ICdob21lJyxcbiAgICAgICAgdGl0bGU6ICdIb21lJyxcbiAgICAgICAgbmF2TGFiZWw6ICdIb21lJyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnaGVybycsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnV2VsY29tZScsXG4gICAgICAgICAgICAgICAgICAgIHN1YnRpdGxlOiAnWW91ciBidXNpbmVzcyBhcHBsaWNhdGlvbiBcdTIwMTQgY29uZmlndXJlIHBhZ2VzLCBkYXRhIGFuZCBicmFuZGluZyBmcm9tIHRoZSBBZG1pbiBhcmVhLicsXG4gICAgICAgICAgICAgICAgICAgIG1pblRpZXI6ICdwdWJsaWMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICBkYXNoYm9hcmQ6IHtcbiAgICAgICAgc2x1ZzogJ2Rhc2hib2FyZCcsXG4gICAgICAgIHRpdGxlOiAnRGFzaGJvYXJkJyxcbiAgICAgICAgbmF2TGFiZWw6ICdEYXNoYm9hcmQnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncHVibGljJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdoZXJvJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2U6ICdKdWx5IDIwMjYgXHUwMEI3IEV4aXQgVmlhYmlsaXR5IFJldmlldycsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnQnVzaW5lc3MgUmV2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgc3VidGl0bGU6ICdFeGl0LXZpYWJpbGl0eSBhc3Nlc3NtZW50IGZvciBQVCBUYW1hbiBCaW50YW5nIEJhbGkgXHUyMDE0IHJldmVudWUgdW5kZXIgcHJlc3N1cmUsIG1hcmdpbiBlcm9zaW9uIGRldGVjdGVkLCBzaGFyZWhvbGRlciBzZWVraW5nIHBhdGh3YXkgb3V0LicsXG4gICAgICAgICAgICAgICAgICAgIG1pblRpZXI6ICdwdWJsaWMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIC8vICAgY29uZmlnOiB7IHZhcmlhbnQ6ICdkYXNoYm9hcmQnLCBzY2VuYXJpbzogJ2NvbnNlcnZhdGl2ZScsIG1pblRpZXI6ICdnb29nbGUnIH0sXG4gICAgICAgICAgICAvLyB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2FjdGlvbl9jaGVja2xpc3QnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAncGluJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnbWV0cmljX2dyaWQnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAnZ29vZ2xlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnbGV2ZXJfYWNjb3JkaW9uJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdUaGUgNSBMZXZlcnMnLFxuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAnZ29vZ2xlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgc3VtbWFyeToge1xuICAgICAgICBzbHVnOiAnc3VtbWFyeScsXG4gICAgICAgIHRpdGxlOiAnRXhlY3V0aXZlIFN1bW1hcnknLFxuICAgICAgICBuYXZMYWJlbDogJ1N1bW1hcnknLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgcGRmRXhwb3J0OiB0cnVlLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ2V4ZWN1dGl2ZS1zdW1tYXJ5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ29wcy1hZG1pbic6IHtcbiAgICAgICAgc2x1ZzogJ29wcy1hZG1pbicsXG4gICAgICAgIHRpdGxlOiAnT3BzIEFkbWluJyxcbiAgICAgICAgbmF2TGFiZWw6ICdPcHMgQWRtaW4nLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgcmVxdWlyZWRHcm91cHM6IFtcbiAgICAgICAgICAgICdvcHMtYWRtaW4nXG4gICAgICAgIF0sXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnb3BzX2FkbWluX3RhYnMnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgcmV2aWV3OiB7XG4gICAgICAgIHNsdWc6ICdyZXZpZXcnLFxuICAgICAgICB0aXRsZTogJ0J1c2luZXNzIFJldmlldycsXG4gICAgICAgIG5hdkxhYmVsOiAnUmV2aWV3JyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZScsXG4gICAgICAgIHBkZkV4cG9ydDogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdyZXZpZXdfYmxvY2tzJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgICdvcHMtdHJhY2tpbmcnOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtdHJhY2tpbmcnLFxuICAgICAgICB0aXRsZTogJ0ZpbmFuY2lhbCBUcmFja2luZycsXG4gICAgICAgIG5hdkxhYmVsOiAnVHJhY2tpbmcnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdrcGlfY2FyZHMnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICB2YXJpYW50OiAnb3BzJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAncmVwb3J0c19yb2xsdXAnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudDogJ29wcydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ3BubF90YWJsZScsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICAnb3BzLWNoYXQnOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtY2hhdCcsXG4gICAgICAgIHRpdGxlOiAnQUkgQ2hhdCcsXG4gICAgICAgIG5hdkxhYmVsOiAnQUkgQ2hhdCcsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXRfcGFuZWwnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgdGFza3M6IHtcbiAgICAgICAgc2x1ZzogJ3Rhc2tzJyxcbiAgICAgICAgdGl0bGU6ICdFeGl0LVZpYWJpbGl0eSBUYXNrcycsXG4gICAgICAgIG5hdkxhYmVsOiAnVGFza3MnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICBhZG1pbjoge1xuICAgICAgICBzbHVnOiAnYWRtaW4nLFxuICAgICAgICB0aXRsZTogJ1BsYXRmb3JtIEFkbWluJyxcbiAgICAgICAgbmF2TGFiZWw6ICdBZG1pbicsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwaW4nLFxuICAgICAgICBzZWN0aW9uczogW11cbiAgICB9LFxuICAgIGNvbmZpZzoge1xuICAgICAgICBzbHVnOiAnY29uZmlnJyxcbiAgICAgICAgdGl0bGU6ICdTb3VyY2UgQ29uZmlnJyxcbiAgICAgICAgbmF2TGFiZWw6ICdDb25maWcnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICAndGVybXMtb2Ytc2VydmljZSc6IHtcbiAgICAgICAgc2x1ZzogJ3Rlcm1zLW9mLXNlcnZpY2UnLFxuICAgICAgICB0aXRsZTogJ1Rlcm1zIG9mIFNlcnZpY2UnLFxuICAgICAgICBzaG93SW5OYXY6IGZhbHNlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnZG9jX21hcmtkb3duJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAndGVybXMtb2Ytc2VydmljZS5odG1sJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ3ByaXZhY3ktcG9saWN5Jzoge1xuICAgICAgICBzbHVnOiAncHJpdmFjeS1wb2xpY3knLFxuICAgICAgICB0aXRsZTogJ1ByaXZhY3kgUG9saWN5JyxcbiAgICAgICAgc2hvd0luTmF2OiBmYWxzZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwdWJsaWMnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ3ByaXZhY3ktcG9saWN5Lmh0bWwnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfVxufTtcbmNvbnN0IFRJRVJfUkFOSyA9IHtcbiAgICBwdWJsaWM6IDAsXG4gICAgcGluOiAxLFxuICAgIGdvb2dsZTogMlxufTtcbmV4cG9ydCBmdW5jdGlvbiB0aWVyQWxsb3dzQWNjZXNzKGN1cnJlbnQsIHJlcXVpcmVkKSB7XG4gICAgcmV0dXJuIFRJRVJfUkFOS1tjdXJyZW50XSA+PSBUSUVSX1JBTktbcmVxdWlyZWRdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxpc3ROYXZQYWdlcyh0aWVyLCBncm91cHMgPSBbXSkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGdldEZ1bGxDYXRhbG9nKCkpLmZpbHRlcigocCk9PnAuc2hvd0luTmF2ICE9PSBmYWxzZSkuZmlsdGVyKChwKT0+dGllckFsbG93c0FjY2Vzcyh0aWVyLCBwLmF1dGhUaWVyKSkuZmlsdGVyKChwKT0+IXAucmVxdWlyZWRHcm91cHMgfHwgcC5yZXF1aXJlZEdyb3Vwcy5sZW5ndGggPT09IDAgfHwgZ3JvdXBzLmluY2x1ZGVzKCdwbGF0Zm9ybS1hZG1pbicpIHx8IHAucmVxdWlyZWRHcm91cHMuc29tZSgoZyk9Pmdyb3Vwcy5pbmNsdWRlcyhnKSkpLnNvcnQoKGEsIGIpPT5hLnRpdGxlLmxvY2FsZUNvbXBhcmUoYi50aXRsZSkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYWdlKHNsdWcpIHtcbiAgICByZXR1cm4gZ2V0RnVsbENhdGFsb2coKVtzbHVnXSA/PyBudWxsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVSZXZpZXdQYXJ0KHBhcnRTbHVnKSB7XG4gICAgcmV0dXJuIGdldFJldmlld1BhcnRDYXRhbG9nKClbcGFydFNsdWddID8/IG51bGw7XG59XG5leHBvcnQgZnVuY3Rpb24gbGlzdFJldmlld1BhcnRzKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGdldFJldmlld1BhcnRDYXRhbG9nKCkpLnNvcnQoKGEsIGIpPT5hLnBhcnRLZXkubG9jYWxlQ29tcGFyZShiLnBhcnRLZXkpKTtcbn1cbi8qKiBEZXNjcmlwdGl2ZSB0aXRsZSB3aXRob3V0IHRoZSBcIlBhcnQgWDogXCIgY2F0YWxvZyBwcmVmaXguICovIGV4cG9ydCBmdW5jdGlvbiBnZXRSZXZpZXdQYXJ0RGlzcGxheVRpdGxlKHRpdGxlKSB7XG4gICAgcmV0dXJuIHRpdGxlLnJlcGxhY2UoL15QYXJ0IFtBLU9dOiAvLCAnJyk7XG59XG4iLCAiLyoqXG4gKiBUaGVzZSBhcmUgdGhlIGJ1aWx0LWluIHN0ZXBzIHRoYXQgYXJlIFwiYXV0b21hdGljYWxseSBhdmFpbGFibGVcIiBpbiB0aGUgd29ya2Zsb3cgc2NvcGUuIFRoZXkgYXJlXG4gKiBzaW1pbGFyIHRvIFwic3RkbGliXCIgZXhjZXB0IHRoYXQgYXJlIG5vdCBtZWFudCB0byBiZSBpbXBvcnRlZCBieSB1c2VycywgYnV0IGFyZSBpbnN0ZWFkIFwianVzdCBhdmFpbGFibGVcIlxuICogYWxvbmdzaWRlIHVzZXIgZGVmaW5lZCBzdGVwcy4gVGhleSBhcmUgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBydW50aW1lXG4gKi9cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV9hcnJheV9idWZmZXIoXG4gIHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZVxuKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmFycmF5QnVmZmVyKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfanNvbih0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2UpIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIHRoaXMuanNvbigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX3RleHQodGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLnRleHQoKTtcbn1cbiIsICIvKipcbiAqIFRoaXMgaXMgdGhlIFwic3RhbmRhcmQgbGlicmFyeVwiIG9mIHN0ZXBzIHRoYXQgd2UgbWFrZSBhdmFpbGFibGUgdG8gYWxsIHdvcmtmbG93IHVzZXJzLlxuICogVGhlIGNhbiBiZSBpbXBvcnRlZCBsaWtlIHNvOiBgaW1wb3J0IHsgZmV0Y2ggfSBmcm9tICd3b3JrZmxvdydgLiBhbmQgdXNlZCBpbiB3b3JrZmxvdy5cbiAqIFRoZSBuZWVkIHRvIGJlIGV4cG9ydGVkIGRpcmVjdGx5IGluIHRoaXMgcGFja2FnZSBhbmQgY2Fubm90IGxpdmUgaW4gYGNvcmVgIHRvIHByZXZlbnRcbiAqIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBwb3N0LWNvbXBpbGF0aW9uLlxuICovXG5cbi8qKlxuICogQSBob2lzdGVkIGBmZXRjaCgpYCBmdW5jdGlvbiB0aGF0IGlzIGV4ZWN1dGVkIGFzIGEgXCJzdGVwXCIgZnVuY3Rpb24sXG4gKiBmb3IgdXNlIHdpdGhpbiB3b3JrZmxvdyBmdW5jdGlvbnMuXG4gKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRmV0Y2hfQVBJXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaCguLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBnbG9iYWxUaGlzLmZldGNoPikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gZ2xvYmFsVGhpcy5mZXRjaCguLi5hcmdzKTtcbn1cbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG4vKipcbiAqIFN0ZXAgZnVuY3Rpb25zIGZvciB0aGUgYXBwLXBhY2stZ2VuZXJhdGUgd29ya2Zsb3cuXG4gKlxuICogRWFjaCBleHBvcnRlZCBhc3luYyBmdW5jdGlvbiB3aXRoIHRoZSBgJ3VzZSBzdGVwJ2AgZGlyZWN0aXZlIGlzIGEgZHVyYWJsZVxuICogc3RlcDogaXRzIGFyZ3MgYW5kIHJlc3VsdCBhcmUgc2VyaWFsaXplZCB0byB0aGUgZXZlbnQgbG9nLCBhbmQgaXQgcmV0cmllc1xuICogYmVmb3JlIHRoZSBlcnJvciBidWJibGVzIHRvIHRoZSB3b3JrZmxvdy5cbiAqLyBpbXBvcnQgeyBGYXRhbEVycm9yIH0gZnJvbSAnd29ya2Zsb3cnO1xuaW1wb3J0IHsgZGVjb21wb3NlUGFja0Zyb21Qcm9tcHQsIGdlbmVyYXRlQXBwRGVmaW5pdGlvbiwgbW9ja0RlY29tcG9zZVBhY2ssIG1vY2tHZW5lcmF0ZUFwcERlZmluaXRpb24gfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLWdlbmVyYXRvcic7XG5pbXBvcnQgeyBjb21waWxlQXBwQXJ0aWZhY3RzIH0gZnJvbSAnLi4vLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1jb21waWxlcic7XG5pbXBvcnQgeyBtYXRlcmlhbGl6ZUFwcFBhY2sgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLW1hdGVyaWFsaXplcic7XG5pbXBvcnQgeyBhcHBseVBhY2tTY2hlbWEgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLXNjaGVtYS1hcHBseSc7XG5pbXBvcnQgeyB3cml0ZVByb2dyZXNzQ2h1bmssIGNsb3NlUHJvZ3Jlc3NTdHJlYW0gfSBmcm9tICcuL3Byb2dyZXNzJztcbmltcG9ydCB7IHdpdGhQZ0NsaWVudCwgcXVlcnlSb3dzIH0gZnJvbSAnLi9kYic7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wid29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLnRzXCI6e1wiYXBwbHlQYWNrU2NoZW1hU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2FwcGx5UGFja1NjaGVtYVN0ZXBcIn0sXCJjbG9zZVByb2dyZXNzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2Nsb3NlUHJvZ3Jlc3NTdGVwXCJ9LFwiY29tcGlsZUFwcFBhY2tTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vY29tcGlsZUFwcFBhY2tTdGVwXCJ9LFwiZGVjb21wb3NlUGFja1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9kZWNvbXBvc2VQYWNrU3RlcFwifSxcImVtaXRQcm9ncmVzc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9lbWl0UHJvZ3Jlc3NTdGVwXCJ9LFwiZ2VuZXJhdGVBcHBTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vZ2VuZXJhdGVBcHBTdGVwXCJ9LFwibG9hZEtub3dsZWRnZUJhc2VTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vbG9hZEtub3dsZWRnZUJhc2VTdGVwXCJ9LFwibWF0ZXJpYWxpemVBcHBQYWNrU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL21hdGVyaWFsaXplQXBwUGFja1N0ZXBcIn19fX0qLztcbi8qKiBEZXRlcm1pbmlzdGljIGZhbGxiYWNrIHBhY2sgaWQgaWYgdGhlIHJvdXRlIGRpZG4ndCBzdXBwbHkgb25lLiAqLyBleHBvcnQgZnVuY3Rpb24gZGVmYXVsdFBhY2tJZChwcm9tcHQpIHtcbiAgICByZXR1cm4gYHBhY2stJHtwcm9tcHQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJykucmVwbGFjZSgvXi0rfC0rJC9nLCAnJykuc2xpY2UoMCwgMzIpIHx8ICdjdXN0b20nfWA7XG59XG4vKipcbiAqIFN0YWdlIDE6IGRlY29tcG9zZSB0aGUgYWRtaW4ncyByZXF1aXJlbWVudCBpbnRvIHBlci1kZXBhcnRtZW50IGFwcCBicmllZnMuXG4gKiBEZXRlcm1pbmlzdGljIGluIG1vY2sgbW9kZS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjb21wb3NlUGFja1N0ZXAoaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQubW9jaykge1xuICAgICAgICByZXR1cm4gbW9ja0RlY29tcG9zZVBhY2soKTtcbiAgICB9XG4gICAgLy8gS25vd2xlZGdlIGdyb3VuZGluZyBpcyBsb2FkZWQgc2VwYXJhdGVseSAobG9hZEtub3dsZWRnZUJhc2VTdGVwKTsgdGhlXG4gICAgLy8gZ2VuZXJhdG9yIGNhbGwgaXMgd3JhcHBlZCBzbyBzdGVwIHJldHJpZXMgYXJlIHNhZmUuXG4gICAgY29uc3QgZGVjb21wb3NpdGlvbiA9IGF3YWl0IGRlY29tcG9zZVBhY2tGcm9tUHJvbXB0KGlucHV0LnByb21wdCk7XG4gICAgaWYgKCFkZWNvbXBvc2l0aW9uLmFwcHMubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdBSSBkZWNvbXBvc2l0aW9uIHJldHVybmVkIHplcm8gYXBwcyBcdTIwMTQgcGxlYXNlIHJlcGhyYXNlIHRoZSByZXF1aXJlbWVudC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY29tcG9zaXRpb247XG59XG4vKiogTG9hZCBrbm93bGVkZ2Ugc25pcHBldHMgZnJvbSB0aGUgdGVuYW50IERCIHRvIGdyb3VuZCB0aGUgZ2VuZXJhdGlvbi4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRLbm93bGVkZ2VCYXNlU3RlcChkYlVybCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBhd2FpdCBxdWVyeVJvd3MoZGIsIGBTRUxFQ1Qga2V5LCBjb250ZW50LCBjYXRlZ29yeSBGUk9NIGtub3dsZWRnZV9zbmlwcGV0cyBPUkRFUiBCWSBjYXRlZ29yeSwga2V5IExJTUlUIDIwMDtgKTtcbiAgICAgICAgICAgIGlmICghcm93cy5sZW5ndGgpIHJldHVybiAnJztcbiAgICAgICAgICAgIHJldHVybiByb3dzLm1hcCgocik9PmBbJHtyLmNhdGVnb3J5fV0gJHtyLmtleX06XFxuJHtyLmNvbnRlbnQuc2xpY2UoMCwgMjAwMCl9YCkuam9pbignXFxuXFxuLS0tXFxuXFxuJyk7XG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgLy8gS25vd2xlZGdlIGdyb3VuZGluZyBpcyBiZXN0LWVmZm9ydDsgZ2VuZXJhdGlvbiBzdGlsbCB3b3JrcyB3aXRob3V0IGl0LlxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxufVxuLyoqXG4gKiBTdGFnZSAyOiBnZW5lcmF0ZSB0aGUgZnVsbCBkZWZpbml0aW9uIG9mIG9uZSBhcHAgKFczIHNjaGVtYSwgbW9kZWxzLCB1c2VcbiAqIGNhc2VzLCBwYWdlcywgbmF2LCBVWCB3b3JrZmxvdywga25vd2xlZGdlIHNuaXBwZXRzKS4gQ0VPIE92ZXJ2aWV3IChsYXN0XG4gKiBicmllZikgZ2V0cyB0aGUgZGVjb21wb3NpdGlvbidzIHB1cnBvc2UgKyBjcm9zcy1kZXBhcnRtZW50IEtQSXMuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlQXBwU3RlcChpbnB1dCwgZGVjb21wb3NpdGlvbiwga25vd2xlZGdlQmFzZSwgaW5kZXgpIHtcbiAgICBjb25zdCBiID0gZGVjb21wb3NpdGlvbi5hcHBzW2luZGV4XTtcbiAgICBpZiAoIWIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYEFwcCBicmllZiBhdCBpbmRleCAke2luZGV4fSBtaXNzaW5nIGZyb20gZGVjb21wb3NpdGlvbi5gKTtcbiAgICB9XG4gICAgY29uc3QgaXNDZW8gPSBpbmRleCA9PT0gZGVjb21wb3NpdGlvbi5hcHBzLmxlbmd0aCAtIDE7XG4gICAgaWYgKGlucHV0Lm1vY2spIHtcbiAgICAgICAgcmV0dXJuIG1vY2tHZW5lcmF0ZUFwcERlZmluaXRpb24oYik7XG4gICAgfVxuICAgIHJldHVybiBnZW5lcmF0ZUFwcERlZmluaXRpb24oYiwgaXNDZW8gPyBkZWNvbXBvc2l0aW9uLmNlb092ZXJ2aWV3LnB1cnBvc2UgOiAnJywgaXNDZW8gPyBkZWNvbXBvc2l0aW9uLmNlb092ZXJ2aWV3LmtwaXMgOiBbXSwgZGVjb21wb3NpdGlvbi5hcHBzLCBrbm93bGVkZ2VCYXNlKTtcbn1cbi8qKiBTdGFnZSAzOiBkZXRlcm1pbmlzdGljIGNvbXBpbGF0aW9uIG9mIGRlZmluaXRpb25zIFx1MjE5MiBhcnRpZmFjdHMgKyBEQiByb3dzLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcGlsZUFwcFBhY2tTdGVwKGRlY29tcG9zaXRpb24sIGRlZmluaXRpb25zKSB7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zLm1hcCgoZGVmKT0+Y29tcGlsZUFwcEFydGlmYWN0cyhkZWYpKTtcbn1cbi8qKiBTdGFnZSA0OiBwZXJzaXN0IHBhZ2VzL25hdi9zbmlwcGV0cy9zZWN1cml0eSBncm91cHMgaW50byB0aGUgdGVuYW50IERCLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWF0ZXJpYWxpemVBcHBQYWNrU3RlcChpbnB1dCwgZGVjb21wb3NpdGlvbiwgZGVmaW5pdGlvbnMsIGFydGlmYWN0cykge1xuICAgIGNvbnN0IHBhY2tJZCA9IGlucHV0LnBhY2tJZCA/PyBkZWZhdWx0UGFja0lkKGlucHV0LnByb21wdCk7XG4gICAgY29uc3QgbWF0ZXJpYWxpemVJbnB1dCA9IHtcbiAgICAgICAgcGFja0lkLFxuICAgICAgICB0ZW5hbnRTbHVnOiBpbnB1dC50ZW5hbnRTbHVnLFxuICAgICAgICBkZWNvbXBvc2l0aW9uLFxuICAgICAgICBhcHBzOiBhcnRpZmFjdHMsXG4gICAgICAgIGRlZmluaXRpb25zXG4gICAgfTtcbiAgICByZXR1cm4gd2l0aFBnQ2xpZW50KGlucHV0LmRiVXJsLCAoZGIpPT5tYXRlcmlhbGl6ZUFwcFBhY2soZGIsIG1hdGVyaWFsaXplSW5wdXQpKTtcbn1cbi8qKlxuICogU3RhZ2UgNTogYXBwbHkgdGhlIHBhY2sncyBjb25zb2xpZGF0ZWQgWmVuU3RhY2sgc2NoZW1hIHRvIHRoZSB0ZW5hbnQgREIgc29cbiAqIHRoZSBnZW5lcmF0ZWQgbW9kZWxzIGJlY29tZSByZWFsIHRhYmxlcyAoYWRkaXRpdmUgRERMIFx1MjAxNCBuZXZlciBkcm9wcyBkYXRhKS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gYXBwbHlQYWNrU2NoZW1hU3RlcChpbnB1dCwgZGVmaW5pdGlvbnMpIHtcbiAgICByZXR1cm4gd2l0aFBnQ2xpZW50KGlucHV0LmRiVXJsLCAoZGIpPT5hcHBseVBhY2tTY2hlbWEoZGIsIGRlZmluaXRpb25zKSk7XG59XG4vKiogRW1pdCBvbmUgcHJvZ3Jlc3MgY2h1bmsgZnJvbSBhIHN0ZXAgY29udGV4dC4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVtaXRQcm9ncmVzc1N0ZXAod3JpdGFibGUsIGNodW5rKSB7XG4gICAgYXdhaXQgd3JpdGVQcm9ncmVzc0NodW5rKHdyaXRhYmxlLCBjaHVuayk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0ZXAod3JpdGFibGUpIHtcbiAgICBhd2FpdCBjbG9zZVByb2dyZXNzU3RyZWFtKHdyaXRhYmxlKTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2RlY29tcG9zZVBhY2tTdGVwXCIsIGRlY29tcG9zZVBhY2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2xvYWRLbm93bGVkZ2VCYXNlU3RlcFwiLCBsb2FkS25vd2xlZGdlQmFzZVN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vZ2VuZXJhdGVBcHBTdGVwXCIsIGdlbmVyYXRlQXBwU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9jb21waWxlQXBwUGFja1N0ZXBcIiwgY29tcGlsZUFwcFBhY2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL21hdGVyaWFsaXplQXBwUGFja1N0ZXBcIiwgbWF0ZXJpYWxpemVBcHBQYWNrU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9hcHBseVBhY2tTY2hlbWFTdGVwXCIsIGFwcGx5UGFja1NjaGVtYVN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vZW1pdFByb2dyZXNzU3RlcFwiLCBlbWl0UHJvZ3Jlc3NTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2Nsb3NlUHJvZ3Jlc3NTdGVwXCIsIGNsb3NlUHJvZ3Jlc3NTdGVwKTtcbiIsICIvKipcbiAqIEFwcCBQYWNrIFx1MjAxNCBBSSBHZW5lcmF0b3JcbiAqXG4gKiBUd28tc3RhZ2UgQUkgZ2VuZXJhdGlvbiB1c2luZyB0aGUgVmVyY2VsIEFJIFNESyBgZ2VuZXJhdGVPYmplY3QoKWA6XG4gKlxuICogICBTdGFnZSAxIFx1MjAxNCBERUNPTVBPU0U6IHRoZSBwbGF0Zm9ybSBhZG1pbidzIHJlcXVpcmVtZW50IGlzIHR1cm5lZCBpbnRvIGFcbiAqICAgICAgICAgICAgIHN0cnVjdHVyZWQgcGFjayBkZWZpbml0aW9uIChhcHBzIHBlciBkZXBhcnRtZW50ICsgQ0VPIG92ZXJ2aWV3KS5cbiAqICAgU3RhZ2UgMiBcdTIwMTQgR0VORVJBVEUgKHBlciBhcHApOiBlYWNoIGRlcGFydG1lbnQgYXBwIGdldHMgYSBmdWxsIGRlZmluaXRpb246XG4gKiAgICAgICAgICAgICBXM0MtYWxpZ25lZCBtb2RlbHMsIHVzZSBjYXNlcywgcGFnZXMsIG5hdiwgVVggd29ya2Zsb3cgYW5kXG4gKiAgICAgICAgICAgICBrbm93bGVkZ2Ugc25pcHBldHMgXHUyMDE0IGdyb3VuZGVkIGluIHRoZSBwbGF0Zm9ybSBrbm93bGVkZ2UgYmFzZSBhbmRcbiAqICAgICAgICAgICAgIHRoZSBXM0MgWFNEIHN0YW5kYXJkIGZvciBpdHMgdGVtcGxhdGUuXG4gKlxuICogYG1vY2sqYCB2YXJpYW50cyByZXR1cm4gZGV0ZXJtaW5pc3RpYyByZXN1bHRzIGZvciB0ZXN0aW5nIHdpdGhvdXQgYW4gQUkga2V5LlxuICovIGltcG9ydCB7IGdlbmVyYXRlT2JqZWN0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgYXBwUGFja0RlY29tcG9zaXRpb25ab2QsIGFwcFBhY2tBcHBEZWZpbml0aW9uWm9kIH0gZnJvbSAnLi9hcHAtcGFjay1zY2hlbWEnO1xuLy8gXHUyNTAwXHUyNTAwIFczQyBYU0QgU3RhbmRhcmRzICsgc2NoZW1hLm9yZyB0eXBlcyBwZXIgdGVtcGxhdGUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5jb25zdCBXM0NfU1RBTkRBUkRTID0ge1xuICAgICdmaW5hbmNpYWwtYW5hbHl0aWNzJzogJ0ZwTUwgKEZpbmFuY2lhbCBQcm9kdWN0cyBNYXJrdXAgTGFuZ3VhZ2UpIGZvciBkZXJpdmF0aXZlcyBhbmQgRklYTUwgZm9yIHJlYWwtdGltZSBmaW5hbmNpYWwgaW5mb3JtYXRpb24gZXhjaGFuZ2UnLFxuICAgIHJlc3RhdXJhbnQ6ICdVQkwgKFVuaXZlcnNhbCBCdXNpbmVzcyBMYW5ndWFnZSkgZm9yIGludm9pY2VzL29yZGVycyBhbmQgR1MxIGZvciBwcm9kdWN0L1NLVSBkYXRhJyxcbiAgICBob3RlbDogJ09UQSAoT3BlblRyYXZlbCBBbGxpYW5jZSkgZm9yIHJvb20gYm9va2luZ3MgYW5kIGF2YWlsYWJpbGl0eScsXG4gICAgJ2Vjb21tZXJjZS1yZXRhaWwnOiAnVUJMIGZvciBlbGVjdHJvbmljIG9yZGVycyBhbmQgSW52ZW50b3J5IEZlZWRzIGZvciBTS1UvcHJpY2luZyBjb25zdHJhaW50cycsXG4gICAgaGVhbHRoY2FyZTogJ0hMNy9DREEgZm9yIGVsZWN0cm9uaWMgaGVhbHRoIHJlY29yZHMgYW5kIGNsYWltcyBwcm9jZXNzaW5nIHZhbGlkYXRpb24nLFxuICAgICdzdXBwbHktY2hhaW4nOiAnVUJMIGZvciBzaGlwcGluZyBub3RpY2VzIGFuZCBCMkIgbG9naXN0aWNzIG1hbmlmZXN0IGRvY3VtZW50cycsXG4gICAgJ3JlYWwtZXN0YXRlJzogJ1JFVFMgKFJlYWwgRXN0YXRlIFRyYW5zYWN0aW9uIFN0YW5kYXJkKSBmb3IgcHJvcGVydHkgbGlzdGluZ3MnLFxuICAgIGVkdWNhdGlvbjogJ0lNUyBHbG9iYWwgKExUSSwgUVRJKSBmb3IgbGVhcm5pbmcgdG9vbHMgaW50ZXJvcGVyYWJpbGl0eSBhbmQgYXNzZXNzbWVudCcsXG4gICAgJ3Byb2Zlc3Npb25hbC1zZXJ2aWNlcyc6ICdVQkwgZm9yIGJpbGxpbmcvaW52b2ljZXMgYW5kIHByb2plY3QgbWFuYWdlbWVudCBkYXRhJyxcbiAgICBtYW51ZmFjdHVyaW5nOiAnQjJNTUwgKEJ1c2luZXNzIFRvIE1hbnVmYWN0dXJpbmcgTWFya3VwIExhbmd1YWdlKSBmb3IgcHJvZHVjdGlvbiBkYXRhJyxcbiAgICAnc3Bhcy1hbmQtd2VsbG5lc3MnOiAnSEw3IGZvciBhcHBvaW50bWVudCBzY2hlZHVsaW5nIGFuZCBjbGllbnQgaGVhbHRoIHJlY29yZHMsIElTTyAxOTAxMSBmb3Igd2VsbG5lc3Mgc2VydmljZSBxdWFsaXR5IG1hbmFnZW1lbnQnXG59O1xuY29uc3QgU0NIRU1BX09SR19UWVBFUyA9IHtcbiAgICAnZmluYW5jaWFsLWFuYWx5dGljcyc6ICdGaW5hbmNpYWxTZXJ2aWNlJyxcbiAgICByZXN0YXVyYW50OiAnUmVzdGF1cmFudCcsXG4gICAgaG90ZWw6ICdIb3RlbCcsXG4gICAgJ2Vjb21tZXJjZS1yZXRhaWwnOiAnU3RvcmUnLFxuICAgIGhlYWx0aGNhcmU6ICdNZWRpY2FsT3JnYW5pemF0aW9uJyxcbiAgICAnc3VwcGx5LWNoYWluJzogJ0RlbGl2ZXJ5RXZlbnQnLFxuICAgICdyZWFsLWVzdGF0ZSc6ICdSZWFsRXN0YXRlQWdlbnQnLFxuICAgIGVkdWNhdGlvbjogJ0VkdWNhdGlvbmFsT3JnYW5pemF0aW9uJyxcbiAgICAncHJvZmVzc2lvbmFsLXNlcnZpY2VzJzogJ1Byb2Zlc3Npb25hbFNlcnZpY2UnLFxuICAgIG1hbnVmYWN0dXJpbmc6ICdNYW51ZmFjdHVyZXInLFxuICAgICdzcGFzLWFuZC13ZWxsbmVzcyc6ICdIZWFsdGhBbmRCZWF1dHlCdXNpbmVzcydcbn07XG4vLyBOT1RFOiBtdXN0IHN0YXkgYSBzdWJzZXQgb2YgdGhlIFplblN0YWNrIEJsb2NrVHlwZSBlbnVtIGluXG4vLyB6ZW5zdGFjay9zY2hlbWEuem1vZGVsIFx1MjAxNCBkeW5hbWljX2Zvcm0gaXMgTk9UIGEgdmFsaWQgZW51bSB2YWx1ZSwgc28gbW9kZWxcbi8vIENSVUQgc3VyZmFjZXMgYXJlIGV4cHJlc3NlZCB3aXRoIG9wc19hZG1pbl90YWJzIC8gZG9jX21hcmtkb3duIGluc3RlYWQuXG5jb25zdCBBVkFJTEFCTEVfQkxPQ0tTID0gW1xuICAgICdoZXJvJyxcbiAgICAna3BpX2NhcmRzJyxcbiAgICAnbWV0cmljX2dyaWQnLFxuICAgICdjaGFydF9maW5hbmNpYWwnLFxuICAgICdsZXZlcl9hY2NvcmRpb24nLFxuICAgICdhY3Rpb25fY2hlY2tsaXN0JyxcbiAgICAnZG9jX21hcmtkb3duJyxcbiAgICAncG5sX3RhYmxlJyxcbiAgICAnb3BzX2FkbWluX3RhYnMnLFxuICAgICd6X3JlcG9ydF9mb3JtJyxcbiAgICAnY29zdHNfZm9ybScsXG4gICAgJ2NhbGVuZGFyX2ltcG9ydCcsXG4gICAgJ2NoYXRfcGFuZWwnLFxuICAgICdyZXZpZXdfYmxvY2tzJyxcbiAgICAncmVwb3J0c19yb2xsdXAnLFxuICAgICdzaGVldF92aWV3ZXInXG5dO1xuY29uc3QgQVVUSF9USUVSUyA9IFtcbiAgICAncHVibGljJyxcbiAgICAncGluJyxcbiAgICAnZ29vZ2xlJ1xuXTtcbmNvbnN0IE1PREVMID0gJ2dwdC01LjUnO1xuLy8gXHUyNTAwXHUyNTAwIFN0YWdlIDE6IGRlY29tcG9zZSB0aGUgcmVxdWlyZW1lbnQgaW50byBhcHBzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gYnVpbGREZWNvbXBvc2VTeXN0ZW1Qcm9tcHQoX2tub3dsZWRnZUJhc2UpIHtcbiAgICByZXR1cm4gYFlvdSBhcmUgdGhlIGNoaWVmIHNvbHV0aW9uIGFyY2hpdGVjdCBvZiBhIHRlbmFudCBhcHBsaWNhdGlvbiBwbGF0Zm9ybS5cblxuQSBwbGF0Zm9ybSBhZG1pbmlzdHJhdG9yIHdpbGwgZGVzY3JpYmUgYSBidXNpbmVzcyBuZWVkLiBEZWNvbXBvc2UgaXQgaW50byBhXG5jb2hlcmVudCBcImFwcGxpY2F0aW9uIHBhY2tcIjogb25lIGFwcGxpY2F0aW9uIHBlciBidXNpbmVzcyBkZXBhcnRtZW50LCBwbHVzIGFcbkNFTyBPdmVydmlldyBhcHBsaWNhdGlvbiB0aGF0IHNwYW5zIGFsbCBvZiB0aGVtLlxuXG4jIyBSdWxlc1xuXG4xLiAqKkFwcHMgcGVyIGRlcGFydG1lbnQqKjogQ3JlYXRlIG9uZSBhcHAgZm9yIGV2ZXJ5IGRpc3RpbmN0IGRlcGFydG1lbnQgaW4gdGhlXG4gICByZXF1aXJlbWVudCAoZS5nLiBIUiwgTWFya2V0aW5nL01lbWJlcnNoaXBzLCBTYWxlcyBSZXBvcnRpbmcsIEVjb21tZXJjZVxuICAgTWFya2V0cGxhY2UsIFJlZmVycmFscyBNYW5hZ2VtZW50LCBCYWNrIE9mZmljZSBSZXBvcnRpbmcsIExlZ2FsIEFkaGVyZW5jZSxcbiAgIEZpbmFuY2UvUmVwb3J0aW5nL1RyYWNraW5nLCBCYWNrIE9mZmljZSBNYW5hZ2VtZW50LCBDb21wbGlhbmNlLCBDRU8gT3ZlcnZpZXcpLlxuICAgSWYgdGhlIHJlcXVpcmVtZW50IG5hbWVzIGRlcGFydG1lbnRzIGV4cGxpY2l0bHksIGNvdmVyIEFMTCBvZiB0aGVtLlxuMi4gKipBcHAgaWRzKio6IGtlYmFiLWNhc2UsIHNob3J0IChlLmcuIFwiaHJcIiwgXCJzYWxlcy1yZXBvcnRpbmdcIiwgXCJjZW8tb3ZlcnZpZXdcIikuXG4zLiAqKnRlbXBsYXRlSWQqKjogcGljayB0aGUgYmVzdCBmaXQgZnJvbSB0aGUgdGVtcGxhdGUgY2F0YWxvZzpcbiAgICR7T2JqZWN0LmtleXMoVzNDX1NUQU5EQVJEUykuam9pbignLCAnKX1cbiAgIENFTyBPdmVydmlldyBzaG91bGQgdXNlIFwiZmluYW5jaWFsLWFuYWx5dGljc1wiIChpdCBkcml2ZXMgdHJhbnNwYXJlbmN5LFxuICAgaW5zaWdodCBhbmQgcmVhbHRpbWUgYWN0aW9uYWJsZSBpdGVtcyBmcm9tIGV2ZXJ5IGRlcGFydG1lbnQpLlxuNC4gKipDRU8gT3ZlcnZpZXcgYXBwKio6IE1VU1QgYmUgaW5jbHVkZWQgYXMgdGhlIGxhc3QgYXBwLiBJdHMgc3VtbWFyeSBtdXN0XG4gICBzdGF0ZSB0aGF0IGl0IGhhcyBhY2Nlc3MgdG8gZXZlcnkgZGVwYXJ0bWVudCBhcHAncyBrbm93bGVkZ2UgYmFzZSBhbmRcbiAgIHN1cmZhY2VzIGNyb3NzLWRlcGFydG1lbnQgS1BJcywgdHJhbnNwYXJlbmN5LCBlZmZpY2llbmN5IGFuZCBhY3Rpb25hYmxlXG4gICBpbnNpZ2h0cy5cbjUuICoqQ292ZXJhZ2UqKjogVGhlIGFwcHMgbXVzdCB0b2dldGhlciBjb3ZlciB0aGUgY29tcGxldGUgcmVxdWlyZW1lbnQgXHUyMDE0IG5vXG4gICBkZXBhcnRtZW50IG1lbnRpb25lZCBpbiB0aGUgcmVxdWlyZW1lbnQgbWF5IGJlIG1pc3NpbmcuXG42LiAqKlBhY2sgaWRzKio6IGtlYmFiLWNhc2UsIGUuZy4gXCJvcHMtZGVwYXJ0bWVudC1wYWNrXCIuXG5cbiMjIE91dHB1dFxuXG5SZXR1cm4gdGhlIHBhY2sgZGVjb21wb3NpdGlvbjogaWQsIG5hbWUsIGRlc2NyaXB0aW9uLCBwZXItYXBwIGJyaWVmcyBhbmQgdGhlXG5DRU8gb3ZlcnZpZXcgcHVycG9zZSArIEtQSXMuYDtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNvbXBvc2VQYWNrRnJvbVByb21wdCh1c2VyUHJvbXB0LCBrbm93bGVkZ2VCYXNlKSB7XG4gICAgY29uc3QgeyBvYmplY3QgfSA9IGF3YWl0IGdlbmVyYXRlT2JqZWN0KHtcbiAgICAgICAgbW9kZWw6IG9wZW5haShNT0RFTCksXG4gICAgICAgIHNjaGVtYTogYXBwUGFja0RlY29tcG9zaXRpb25ab2QsXG4gICAgICAgIHN5c3RlbTogYnVpbGREZWNvbXBvc2VTeXN0ZW1Qcm9tcHQoa25vd2xlZGdlQmFzZSksXG4gICAgICAgIHByb21wdDogdXNlclByb21wdCxcbiAgICAgICAgdGVtcGVyYXR1cmU6IDAuMlxuICAgIH0pO1xuICAgIHJldHVybiBvYmplY3Q7XG59XG4vLyBcdTI1MDBcdTI1MDAgU3RhZ2UgMjogZ2VuZXJhdGUgYSBmdWxsIGRlZmluaXRpb24gZm9yIG9uZSBhcHAgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5mdW5jdGlvbiBidWlsZEFwcFN5c3RlbVByb21wdChicmllZiwgY2VvUHVycG9zZSwgY2VvS3BpcywgYWxsQXBwcywga25vd2xlZGdlQmFzZSkge1xuICAgIGNvbnN0IHczY1N0YW5kYXJkID0gVzNDX1NUQU5EQVJEU1ticmllZi50ZW1wbGF0ZUlkXSA/PyAnc2NoZW1hLm9yZyc7XG4gICAgY29uc3Qgc2NoZW1hT3JnVHlwZSA9IFNDSEVNQV9PUkdfVFlQRVNbYnJpZWYudGVtcGxhdGVJZF0gPz8gJ0xvY2FsQnVzaW5lc3MnO1xuICAgIHJldHVybiBgWW91IGFyZSBhIFczQyBzY2hlbWEgYXJjaGl0ZWN0LCBaZW5TdGFjayBPUk0gZXhwZXJ0IGFuZCBwcm9kdWN0IGRlc2lnbmVyLlxuXG5EZXNpZ24gdGhlIFwiJHticmllZi5uYW1lfVwiIGFwcGxpY2F0aW9uIChkZXBhcnRtZW50OiAke2JyaWVmLmRlcGFydG1lbnR9KSBmb3IgYVxudGVuYW50IGFwcCBwbGF0Zm9ybS4gSXQgaXMgb25lIGFwcCBpbnNpZGUgYSBwYWNrOyB0aGUgcGFjayBhbHNvIGNvbnRhaW5zOlxuJHthbGxBcHBzLm1hcCgoYSk9PmAtICR7YS5uYW1lfSAoJHthLmRlcGFydG1lbnR9KWApLmpvaW4oJ1xcbicpfVxuXG5UaGUgQ0VPIE92ZXJ2aWV3IGFwcCBleGlzdHMgc28gbGVhZGVyc2hpcCBjYW4gc2VlIGludG8gZXZlcnkgZGVwYXJ0bWVudCBcdTIwMTRcbmRlc2lnbiB0aGlzIGFwcCBzbyBpdHMgZGF0YSwgcGFnZXMgYW5kIGtub3dsZWRnZSBmZWVkIHRoYXQgdHJhbnNwYXJlbmN5LlxuXG4jIyBSdWxlc1xuXG4xLiAqKlczQyBYU0QqKjogVXNlICR7dzNjU3RhbmRhcmR9IGZvciBmaWVsZCB0eXBlcyBhbmQgdmFsaWRhdGlvbiBjb25zdHJhaW50cy5cbjIuICoqc2NoZW1hLm9yZyBtYXBwaW5nKio6IE1hcCBmaWVsZHMgdG8gc2NoZW1hLm9yZyBwcm9wZXJ0aWVzIChzY2hlbWFPcmdQcm9wZXJ0eSkuXG4zLiAqKkJhc2UgZmllbGRzIGF1dG8tYWRkZWQqKjogaWQsIHRlbmFudFNsdWcsIGNyZWF0ZWRBdCwgdXBkYXRlZEF0IGFyZSBhZGRlZFxuICAgYXV0b21hdGljYWxseSBcdTIwMTQgbmV2ZXIgaW5jbHVkZSB0aGVtIGluIHRoZSBmaWVsZHMgYXJyYXkuXG40LiAqKk1vbmV0YXJ5IHZhbHVlcyoqOiBkZWNpbWFsIHR5cGUgd2l0aCBzY2hlbWFPcmdQcm9wZXJ0eSBcIm9mZmVycy5wcmljZVwiLlxuNS4gKipTdGF0dXMgZmllbGRzKio6IGVudW0gd2l0aCBtZWFuaW5nZnVsIGVudW1WYWx1ZXMgKHBlbmRpbmcsIGFjdGl2ZSwgLi4uKS5cbjYuICoqTW9kZWxzKio6IDMtOCBtb2RlbHMgZGVwZW5kaW5nIG9uIHRoZSBkZXBhcnRtZW50J3MgY29tcGxleGl0eS5cbjcuICoqVXNlIGNhc2VzKio6IFVDLVhYWC1OTiBmb3JtYXQ7IGF1dGg6ICR7QVVUSF9USUVSUy5qb2luKCcvJyl9IChwdWJsaWMgPVxuICAgY3VzdG9tZXItZmFjaW5nLCBwaW4gPSBzdGFmZi9vcHMsIGdvb2dsZSA9IGV4ZWMvbGVhZGVyc2hpcCkuXG44LiAqKlBhZ2VzKio6IHNsdWdzIHByZWZpeGVkIHdpdGggdGhlIGFwcCBpZCAoZS5nLiBcIi9oci9lbXBsb3llZXNcIik7IGJsb2NrVHlwZXNcbiAgIGZyb206ICR7QVZBSUxBQkxFX0JMT0NLUy5qb2luKCcsICcpfS4gVXNlIFwib3BzX2FkbWluX3RhYnNcIiBmb3IgbW9kZWxcbiAgIENSVUQvYWRtaW4gc3VyZmFjZXMsIFwia3BpX2NhcmRzXCIvXCJjaGFydF9maW5hbmNpYWxcIi9cInJlcG9ydHNfcm9sbHVwXCIgZm9yXG4gICByZXBvcnRpbmcsIFwiYWN0aW9uX2NoZWNrbGlzdFwiIGZvciBhY3Rpb25hYmxlIGl0ZW1zLCBcImRvY19tYXJrZG93blwiIGZvclxuICAgcG9saWNpZXMsIFwic2hlZXRfdmlld2VyXCIgZm9yIHJhdyBkYXRhLlxuOS4gKipOYXYqKjogb25lIG5hdiBzZWN0aW9uIHBlciBhcHAgd2l0aCBhIGNsZWFyIGxhYmVsICsgaWNvbiBoaW50OyBwYWdlcyBsaXN0LlxuMTAuICoqVVggd29ya2Zsb3cqKjogMi01IHN0YWdlcyBkZXNjcmliaW5nIHRoZSBlbmQtdG8tZW5kIHVzZXIgam91cm5leSBpbnNpZGVcbiAgICB0aGUgYXBwIChlLmcuIE9uYm9hcmRpbmcgXHUyMTkyIERhaWx5IE9wcyBcdTIxOTIgUmV2aWV3KSwgZWFjaCB3aXRoIGNvbmNyZXRlIGFjdGlvbnNcbiAgICAoY3JlYXRlL3JlYWQvdXBkYXRlL2FwcHJvdmUvZXhwb3J0L25vdGlmeS9yZXZpZXcpIHBvaW50aW5nIGF0IHJlYWwgcGFnZXMuXG4xMS4gKipLbm93bGVkZ2Ugc25pcHBldHMqKjogMy02IHNuaXBwZXRzIChrZXksIHRpdGxlLCBjb250ZW50IGluIG1hcmtkb3duKSBcdTIwMTRcbiAgICBwb2xpY2llcywgc3RlcC1ieS1zdGVwIHByb2NlZHVyZXMsIGRlZmluaXRpb25zIGFuZCBndWlkYW5jZSBzcGVjaWZpYyB0b1xuICAgIHRoaXMgZGVwYXJ0bWVudCdzIGFwcC4gVGhlc2UgZm9ybSB0aGUgYXBwJ3Mga25vd2xlZGdlIGJhc2UuXG4xMi4gKipzY2hlbWEub3JnIHR5cGUqKjogcHJpbWFyeSB0eXBlIGlzIFwiJHtzY2hlbWFPcmdUeXBlfVwiLlxuMTMuICoqVGFibGUgbmFtZXMqKjogc25ha2VfY2FzZSBwbHVyYWw7ICoqZmllbGQgbmFtZXMqKjogY2FtZWxDYXNlLlxuMTQuICoqRmllbGQgd2lkdGgqKjogMTIgZnVsbC13aWR0aCwgNiBoYWxmLXdpZHRoLCA0IHRoaXJkLXdpZHRoLlxuXG4jIyBLbm93bGVkZ2UgYmFzZSAocGxhdGZvcm0gY29udGV4dClcblxuJHtrbm93bGVkZ2VCYXNlID8ga25vd2xlZGdlQmFzZSA6ICcobm9uZSBwcm92aWRlZCBcdTIwMTQgdXNlIGdlbmVyYWwgYmVzdCBwcmFjdGljZXMpJ31cblxuIyMgQ0VPIGNvbnRleHRcblxuVGhlIENFTyBPdmVydmlldyBhcHAgcHVycG9zZTogJHtjZW9QdXJwb3NlfVxuQ0VPIEtQSXMgKHRoaXMgYXBwJ3MgZGF0YSBzaG91bGQgc3VwcG9ydCB0aGVzZSk6ICR7Y2VvS3Bpcy5qb2luKCcsICcpfVxuXG4jIyBPdXRwdXRcblxuUmV0dXJuIHRoZSBjb21wbGV0ZSBhcHAgZGVmaW5pdGlvbiAobW9kZWxzLCB1c2UgY2FzZXMsIHBhZ2VzLCBuYXYsIFVYIHdvcmtmbG93LFxua25vd2xlZGdlIHNuaXBwZXRzKS5gO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlQXBwRGVmaW5pdGlvbihicmllZiwgY2VvUHVycG9zZSwgY2VvS3BpcywgYWxsQXBwcywga25vd2xlZGdlQmFzZSkge1xuICAgIGNvbnN0IHsgb2JqZWN0IH0gPSBhd2FpdCBnZW5lcmF0ZU9iamVjdCh7XG4gICAgICAgIG1vZGVsOiBvcGVuYWkoTU9ERUwpLFxuICAgICAgICBzY2hlbWE6IGFwcFBhY2tBcHBEZWZpbml0aW9uWm9kLFxuICAgICAgICBzeXN0ZW06IGJ1aWxkQXBwU3lzdGVtUHJvbXB0KGJyaWVmLCBjZW9QdXJwb3NlLCBjZW9LcGlzLCBhbGxBcHBzLCBrbm93bGVkZ2VCYXNlKSxcbiAgICAgICAgcHJvbXB0OiBgRGVzaWduIHRoZSBcIiR7YnJpZWYubmFtZX1cIiBhcHBsaWNhdGlvbiBpbiBmdWxsIGRldGFpbC5gLFxuICAgICAgICB0ZW1wZXJhdHVyZTogMC4yXG4gICAgfSk7XG4gICAgcmV0dXJuIG9iamVjdDtcbn1cbi8vIFx1MjUwMFx1MjUwMCBNb2NrIHZhcmlhbnRzIChkZXRlcm1pbmlzdGljLCBubyBBSSBrZXkgbmVlZGVkKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmV4cG9ydCBmdW5jdGlvbiBtb2NrRGVjb21wb3NlUGFjaygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwYWNrSWQ6ICdtYXNzYWdlLW9wZXJhdGlvbnMtcGFjaycsXG4gICAgICAgIG5hbWU6ICdNYXNzYWdlIFNwYSBPcGVyYXRpb25zIFBhY2snLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ01hc3NhZ2Ugc3BhIG9wZXJhdGlvbnMgYXBwIHBhY2s6IEFwcG9pbnRtZW50cyAmIEJvb2tpbmcsIENsaWVudCBSZWNvcmRzLCBUaGVyYXBpc3QgTWFuYWdlbWVudCwgU3BhIEZpbmFuY2UsIGFuZCBPd25lciBEYXNoYm9hcmQgd2l0aCBjcm9zcy1kZXBhcnRtZW50IEtQSXMuJyxcbiAgICAgICAgYXBwczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnYXBwb2ludG1lbnRzLWJvb2tpbmcnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdBcHBvaW50bWVudHMgJiBCb29raW5nJyxcbiAgICAgICAgICAgICAgICBkZXBhcnRtZW50OiAnT3BlcmF0aW9ucycsXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogJ1NjaGVkdWxlIGFuZCBtYW5hZ2UgbWFzc2FnZSBhcHBvaW50bWVudHMgd2l0aCBjbGllbnRzLicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVJZDogJ3NwYXMtYW5kLXdlbGxuZXNzJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ2NsaWVudC1yZWNvcmRzJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnQ2xpZW50IFJlY29yZHMnLFxuICAgICAgICAgICAgICAgIGRlcGFydG1lbnQ6ICdPcGVyYXRpb25zJyxcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiAnTWFpbnRhaW4gY2xpZW50IHByb2ZpbGVzLCBwcmVmZXJlbmNlcywgYW5kIHNlcnZpY2UgaGlzdG9yeS4nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlSWQ6ICdzcGFzLWFuZC13ZWxsbmVzcydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICd0aGVyYXBpc3QtbWFuYWdlbWVudCcsXG4gICAgICAgICAgICAgICAgbmFtZTogJ1RoZXJhcGlzdCBNYW5hZ2VtZW50JyxcbiAgICAgICAgICAgICAgICBkZXBhcnRtZW50OiAnT3BlcmF0aW9ucycsXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogJ01hbmFnZSB0aGVyYXBpc3Qgc2NoZWR1bGVzLCBxdWFsaWZpY2F0aW9ucywgYW5kIHBlcmZvcm1hbmNlLicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVJZDogJ3NwYXMtYW5kLXdlbGxuZXNzJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ3NwYS1maW5hbmNlJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnU3BhIEZpbmFuY2UnLFxuICAgICAgICAgICAgICAgIGRlcGFydG1lbnQ6ICdGaW5hbmNlJyxcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiAnVHJhY2sgc3BhIHJldmVudWUsIGV4cGVuc2VzLCBhbmQgZmluYW5jaWFsIHJlcG9ydHMuJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUlkOiAnZmluYW5jaWFsLWFuYWx5dGljcydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICdvd25lci1kYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdPd25lciBEYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgIGRlcGFydG1lbnQ6ICdFeGVjdXRpdmUgTGVhZGVyc2hpcCcsXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogJ0Nyb3NzLWRlcGFydG1lbnQgdHJhbnNwYXJlbmN5IGRhc2hib2FyZCB3aXRoIGFjY2VzcyB0byBldmVyeSBkZXBhcnRtZW50IGtub3dsZWRnZSBiYXNlIGFuZCByZWFsdGltZSBhY3Rpb25hYmxlIGl0ZW1zLicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVJZDogJ2ZpbmFuY2lhbC1hbmFseXRpY3MnXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGNlb092ZXJ2aWV3OiB7XG4gICAgICAgICAgICBwdXJwb3NlOiAnQWdncmVnYXRlIEtQSXMgYW5kIGtub3dsZWRnZSBmcm9tIGV2ZXJ5IGRlcGFydG1lbnQgYXBwIGludG8gYSBzaW5nbGUgbGVhZGVyc2hpcCBvdmVydmlldyB3aXRoIGFjdGlvbmFibGUgaXRlbXMuJyxcbiAgICAgICAgICAgIGtwaXM6IFtcbiAgICAgICAgICAgICAgICAncmV2ZW51ZScsXG4gICAgICAgICAgICAgICAgJ2dyb3NzTWFyZ2luJyxcbiAgICAgICAgICAgICAgICAnaGVhZGNvdW50JyxcbiAgICAgICAgICAgICAgICAnc2FsZXNUYXJnZXRBY2hpZXZlbWVudCcsXG4gICAgICAgICAgICAgICAgJ2Nhc2hmbG93JyxcbiAgICAgICAgICAgICAgICAnY29tcGxpYW5jZVN0YXR1cydcbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gbW9ja0dlbmVyYXRlQXBwRGVmaW5pdGlvbihicmllZikge1xuICAgIGNvbnN0IG1vZGVsTmFtZSA9IGJyaWVmLmlkID09PSAnYXBwb2ludG1lbnRzLWJvb2tpbmcnID8gJ0FwcG9pbnRtZW50JyA6IGJyaWVmLmlkID09PSAnY2xpZW50LXJlY29yZHMnID8gJ0NsaWVudCcgOiBicmllZi5pZCA9PT0gJ3RoZXJhcGlzdC1tYW5hZ2VtZW50JyA/ICdUaGVyYXBpc3QnIDogYnJpZWYuaWQgPT09ICdzcGEtZmluYW5jZScgPyAnRmluYW5jaWFsUmVjb3JkJyA6ICdEZXBhcnRtZW50S3BpJztcbiAgICBjb25zdCB0YWJsZU5hbWUgPSBgJHttb2RlbE5hbWUucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxXyQyJykudG9Mb3dlckNhc2UoKX1zYDtcbiAgICByZXR1cm4ge1xuICAgICAgICBhcHBJZDogYnJpZWYuaWQsXG4gICAgICAgIGFwcE5hbWU6IGJyaWVmLm5hbWUsXG4gICAgICAgIGRlcGFydG1lbnQ6IGJyaWVmLmRlcGFydG1lbnQsXG4gICAgICAgIHczY1N0YW5kYXJkOiBXM0NfU1RBTkRBUkRTW2JyaWVmLnRlbXBsYXRlSWRdID8/ICdzY2hlbWEub3JnJyxcbiAgICAgICAgc2NoZW1hT3JnVHlwZTogU0NIRU1BX09SR19UWVBFU1ticmllZi50ZW1wbGF0ZUlkXSA/PyAnTG9jYWxCdXNpbmVzcycsXG4gICAgICAgIG1vZGVsczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6IG1vZGVsTmFtZSxcbiAgICAgICAgICAgICAgICB0YWJsZU5hbWUsXG4gICAgICAgICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICduYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2hlbWFPcmdQcm9wZXJ0eTogJ25hbWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdOYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxMlxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbnVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW51bVZhbHVlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXJjaGl2ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdGF0dXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDZcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ25vdGVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTm90ZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEyXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHVzZUNhc2VzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6IGBVQy0ke2JyaWVmLmlkLnRvVXBwZXJDYXNlKCkuc2xpY2UoMCwgNCl9LTAxYCxcbiAgICAgICAgICAgICAgICB0aXRsZTogYE1hbmFnZSAke2JyaWVmLm5hbWV9IHJlY29yZHNgLFxuICAgICAgICAgICAgICAgIGF1dGg6ICdwaW4nLFxuICAgICAgICAgICAgICAgIHJvdXRlOiBgLyR7YnJpZWYuaWR9YCxcbiAgICAgICAgICAgICAgICBibG9ja1R5cGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICdvcHNfYWRtaW5fdGFicydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIG1vZGVsczogW1xuICAgICAgICAgICAgICAgICAgICBtb2RlbE5hbWVcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHBhZ2VzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc2x1ZzogYCR7YnJpZWYuaWR9YCxcbiAgICAgICAgICAgICAgICB0aXRsZTogYnJpZWYubmFtZSxcbiAgICAgICAgICAgICAgICBhdXRoVGllcjogJ3BpbicsXG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlczogW1xuICAgICAgICAgICAgICAgICAgICAna3BpX2NhcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgJ29wc19hZG1pbl90YWJzJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgbmF2TGFiZWw6IGJyaWVmLm5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgbmF2OiB7XG4gICAgICAgICAgICBsYWJlbDogYnJpZWYubmFtZSxcbiAgICAgICAgICAgIGljb246ICdEYXNoYm9hcmQnLFxuICAgICAgICAgICAgcGFnZXM6IFtcbiAgICAgICAgICAgICAgICBicmllZi5pZFxuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB1eFdvcmtmbG93OiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3RhZ2U6ICdEYWlseSBvcGVyYXRpb25zJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlY29yZCBhbmQgcmV2aWV3IGRhaWx5IGVudHJpZXMnLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBgT3BlbiAke2JyaWVmLm5hbWV9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhZ2U6IGAvJHticmllZi5pZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uVHlwZTogJ25hdmlnYXRlJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdBZGQgcmVjb3JkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhZ2U6IGAvJHticmllZi5pZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TW9kZWw6IG1vZGVsTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblR5cGU6ICdjcmVhdGUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YWdlOiAnUmV2aWV3JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JldmlldyBhbmQgYXBwcm92ZSBlbnRyaWVzJyxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ0FwcHJvdmUgZW50cmllcycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYWdlOiBgLyR7YnJpZWYuaWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblR5cGU6ICdhcHByb3ZlJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdFeHBvcnQgcmVwb3J0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhZ2U6IGAvJHticmllZi5pZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uVHlwZTogJ2V4cG9ydCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAga25vd2xlZGdlU25pcHBldHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IGAke2JyaWVmLmlkfS1vdmVydmlld2AsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGAke2JyaWVmLm5hbWV9IFx1MjAxNCBPdmVydmlld2AsXG4gICAgICAgICAgICAgICAgY29udGVudDogYCMgJHticmllZi5uYW1lfVxcblxcblN0YW5kYXJkIG9wZXJhdGluZyBndWlkYW5jZSBmb3IgdGhlICR7YnJpZWYuZGVwYXJ0bWVudH0gYXBwOiByZWNvcmQgZW50cmllcyBkYWlseSwgcmV2aWV3IHdlZWtseSwgZXNjYWxhdGUgZXhjZXB0aW9ucyB0byB0aGUgQ0VPIE92ZXJ2aWV3IGRhc2hib2FyZC5gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogYCR7YnJpZWYuaWR9LWJlc3QtcHJhY3RpY2VzYCxcbiAgICAgICAgICAgICAgICB0aXRsZTogYCR7YnJpZWYubmFtZX0gXHUyMDE0IEJlc3QgUHJhY3RpY2VzYCxcbiAgICAgICAgICAgICAgICBjb250ZW50OiBgIyMgQmVzdCBQcmFjdGljZXNcXG5cXG4xLiBLZWVwIHJlY29yZHMgY3VycmVudCBkYWlseS5cXG4yLiBGbGFnIGFub21hbGllcyBpbW1lZGlhdGVseS5cXG4zLiBVc2UgdGhlIGFjdGlvbiBjaGVja2xpc3QgZm9yIGZvbGxvdy11cHMuYFxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcbn1cbiIsICIvKipcbiAqIEFwcCBQYWNrIFx1MjAxNCBab2Qgc2NoZW1hcyBmb3IgQUktZ2VuZXJhdGVkIFwiYXBwbGljYXRpb24gcGFja1wiIGRlZmluaXRpb25zLlxuICpcbiAqIEFuIGFwcGxpY2F0aW9uIHBhY2sgaXMgYSBjb2xsZWN0aW9uIG9mIGRlcGFydG1lbnQgYXBwbGljYXRpb25zIChIUixcbiAqIE1hcmtldGluZy9NZW1iZXJzaGlwcywgU2FsZXMgUmVwb3J0aW5nLCBFY29tbWVyY2UgTWFya2V0cGxhY2UsIFJlZmVycmFscyxcbiAqIEJhY2sgT2ZmaWNlLCBMZWdhbCwgRmluYW5jZSwgQ29tcGxpYW5jZSwgQ0VPIE92ZXJ2aWV3LCAuLi4pLiBFYWNoIGFwcCBpc1xuICogZnVsbHkgZGVyaXZlZCBieSBBSSBmcm9tIGEgbmF0dXJhbC1sYW5ndWFnZSByZXF1aXJlbWVudCBhbmQgY2FycmllczpcbiAqXG4gKiAgIDEuIFVzZSBjYXNlcyAgICAgICAgXHUyMDE0IFVDLVhYWC1OTiB3aXRoIGF1dGggdGllcnMgKyByb3V0ZXNcbiAqICAgMi4gVzMgU2NoZW1hICAgICAgICBcdTIwMTQgbW9kZWxzIHdpdGggVzNDIFhTRCBmaWVsZCB0eXBlcyArIHNjaGVtYS5vcmcgbWFwcGluZ3NcbiAqICAgMy4gWmVuU3RhY2sgICAgICAgICBcdTIwMTQgY29tcGlsZWQgZnJvbSB0aGUgbW9kZWxzIGF0IGJ1aWxkIHRpbWUgKHptb2RlbClcbiAqICAgNC4gVGVtcGxhdGVzICAgICAgICBcdTIwMTQgcGFnZSBibG9jayB0eXBlcyAoZHluYW1pY19mb3JtLCBrcGlfY2FyZHMsIC4uLilcbiAqICAgNS4gTmF2aWdhdGlvbmFsIER5bmFtaWMgUGFnZXMgXHUyMDE0IHNsdWdzLCBuYXYgc2VjdGlvbnMsIHNlY3VyaXR5IGdyb3Vwc1xuICogICA2LiBVWCBXb3JrZmxvdyAgICAgIFx1MjAxNCBzdGFnZXMgKyBhY3Rpb25zICh3aGF0IHRoZSB1c2VyIGRvZXMgaW4gdGhlIGFwcClcbiAqICAgNy4gS25vd2xlZGdlIFNuaXBwZXRzIFx1MjAxNCBwZXItYXBwIGtub3dsZWRnZSBiYXNlIGVudHJpZXNcbiAqXG4gKiBUaGUgQ0VPIE92ZXJ2aWV3IGFwcCBpcyBnZW5lcmF0ZWQgd2l0aCBjcm9zcy1hcHAgdmlzaWJpbGl0eTogaXRzIHBhZ2VzIGFuZFxuICoga25vd2xlZGdlIHJlZmVyZW5jZSBldmVyeSBkZXBhcnRtZW50IGFwcCBpbiB0aGUgcGFjay5cbiAqLyBpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNjaGVtYU1vZGVsWm9kLCB1c2VDYXNlWm9kLCBwYWdlWm9kIH0gZnJvbSAnQC9kb21haW4vYWkvc2NoZW1hLWdlbmVyYXRpb24tc2NoZW1hJztcbi8vIFx1MjUwMFx1MjUwMCBQYWNrLWxldmVsIChkZWNvbXBvc2l0aW9uKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmV4cG9ydCBjb25zdCBhcHBQYWNrQXBwQnJpZWZab2QgPSB6Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0FwcCBpZCBpbiBrZWJhYi1jYXNlLCBlLmcuIFwiaHJcIiBvciBcInNhbGVzLXJlcG9ydGluZ1wiJyksXG4gICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnSHVtYW4tcmVhZGFibGUgYXBwIG5hbWUsIGUuZy4gXCJIUiBNYW5hZ2VtZW50XCInKSxcbiAgICBkZXBhcnRtZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdCdXNpbmVzcyBkZXBhcnRtZW50IHRoaXMgYXBwIHNlcnZlcywgZS5nLiBcIkh1bWFuIFJlc291cmNlc1wiJyksXG4gICAgc3VtbWFyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnT25lLXBhcmFncmFwaCBkZXNjcmlwdGlvbiBvZiB3aGF0IHRoaXMgYXBwIGRvZXMnKSxcbiAgICB0ZW1wbGF0ZUlkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdCZXN0LWZpdCB0ZW1wbGF0ZSBpZCBmcm9tOiBmaW5hbmNpYWwtYW5hbHl0aWNzLCByZXN0YXVyYW50LCBob3RlbCwgZWNvbW1lcmNlLXJldGFpbCwgaGVhbHRoY2FyZSwgc3VwcGx5LWNoYWluLCByZWFsLWVzdGF0ZSwgZWR1Y2F0aW9uLCBwcm9mZXNzaW9uYWwtc2VydmljZXMsIG1hbnVmYWN0dXJpbmcnKVxufSk7XG5leHBvcnQgY29uc3QgYXBwUGFja0RlY29tcG9zaXRpb25ab2QgPSB6Lm9iamVjdCh7XG4gICAgcGFja0lkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYWNrIGlkIGluIGtlYmFiLWNhc2UsIGUuZy4gXCJvcHMtZGVwYXJ0bWVudC1wYWNrXCInKSxcbiAgICBuYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYWNrIGRpc3BsYXkgbmFtZScpLFxuICAgIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdIaWdoLWxldmVsIGRlc2NyaXB0aW9uIG9mIHRoZSB3aG9sZSBwYWNrJyksXG4gICAgYXBwczogei5hcnJheShhcHBQYWNrQXBwQnJpZWZab2QpLmRlc2NyaWJlKCdPbmUgYnJpZWYgcGVyIGRlcGFydG1lbnQgYXBwbGljYXRpb24nKSxcbiAgICBjZW9PdmVydmlldzogei5vYmplY3Qoe1xuICAgICAgICBwdXJwb3NlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdXaGF0IHRoZSBDRU8gT3ZlcnZpZXcgYXBwIGRvZXMgYWNyb3NzIGFsbCBkZXBhcnRtZW50cycpLFxuICAgICAgICBrcGlzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlc2NyaWJlKCdDcm9zcy1kZXBhcnRtZW50IEtQSXMgdGhlIENFTyBkYXNoYm9hcmQgc2hvdWxkIHN1cmZhY2UnKVxuICAgIH0pXG59KTtcbi8vIFx1MjUwMFx1MjUwMCBQZXItYXBwIChkZXRhaWxlZCBkZWZpbml0aW9uKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmV4cG9ydCBjb25zdCBhcHBVeEFjdGlvblpvZCA9IHoub2JqZWN0KHtcbiAgICBhY3Rpb246IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0FjdGlvbiBsYWJlbCwgZS5nLiBcIkNyZWF0ZSBuZXcgZW1wbG95ZWVcIicpLFxuICAgIHRhcmdldFBhZ2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1JvdXRlIHBhdGggdGhpcyBhY3Rpb24gbmF2aWdhdGVzIHRvJyksXG4gICAgdGFyZ2V0TW9kZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnUHJpbWFyeSBtb2RlbCB0aGUgYWN0aW9uIG9wZXJhdGVzIG9uJyksXG4gICAgYWN0aW9uVHlwZTogei5lbnVtKFtcbiAgICAgICAgJ2NyZWF0ZScsXG4gICAgICAgICdyZWFkJyxcbiAgICAgICAgJ3VwZGF0ZScsXG4gICAgICAgICdkZWxldGUnLFxuICAgICAgICAnYXBwcm92ZScsXG4gICAgICAgICdleHBvcnQnLFxuICAgICAgICAnbm90aWZ5JyxcbiAgICAgICAgJ25hdmlnYXRlJyxcbiAgICAgICAgJ3JldmlldydcbiAgICBdKS5kZXNjcmliZSgnS2luZCBvZiBhY3Rpb24nKVxufSk7XG5leHBvcnQgY29uc3QgYXBwVXhTdGFnZVpvZCA9IHoub2JqZWN0KHtcbiAgICBzdGFnZTogei5zdHJpbmcoKS5kZXNjcmliZSgnV29ya2Zsb3cgc3RhZ2UgbmFtZSwgZS5nLiBcIk9uYm9hcmRpbmdcIicpLFxuICAgIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1doYXQgdGhpcyBzdGFnZSBhY2NvbXBsaXNoZXMnKSxcbiAgICBhY3Rpb25zOiB6LmFycmF5KGFwcFV4QWN0aW9uWm9kKS5kZXNjcmliZSgnQWN0aW9ucyBhdmFpbGFibGUgaW4gdGhpcyBzdGFnZScpXG59KTtcbmV4cG9ydCBjb25zdCBhcHBOYXZab2QgPSB6Lm9iamVjdCh7XG4gICAgbGFiZWw6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ05hdiBtZW51IGxhYmVsIGZvciB0aGlzIGFwcCcpLFxuICAgIGljb246IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnTVVJIGljb24gbmFtZSBoaW50IChlLmcuIFwiUGVvcGxlXCIsIFwiUGF5bWVudHNcIiknKSxcbiAgICBwYWdlczogei5hcnJheSh6LnN0cmluZygpKS5kZXNjcmliZSgnUGFnZSBzbHVncyBncm91cGVkIHVuZGVyIHRoaXMgYXBwIGluIHRoZSBuYXYnKVxufSk7XG5leHBvcnQgY29uc3QgYXBwS25vd2xlZGdlU25pcHBldFpvZCA9IHoub2JqZWN0KHtcbiAgICBrZXk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NuaXBwZXQga2V5IGluIGtlYmFiLWNhc2UsIGUuZy4gXCJoci1vbmJvYXJkaW5nLXN0ZXBzXCInKSxcbiAgICB0aXRsZTogei5zdHJpbmcoKS5kZXNjcmliZSgnU25pcHBldCB0aXRsZScpLFxuICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0tub3dsZWRnZSBjb250ZW50IChtYXJrZG93bikgXHUyMDE0IHBvbGljaWVzLCBzdGVwcywgZ3VpZGFuY2UnKVxufSk7XG5leHBvcnQgY29uc3QgYXBwUGFja0FwcERlZmluaXRpb25ab2QgPSB6Lm9iamVjdCh7XG4gICAgYXBwSWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0FwcCBpZCBtYXRjaGluZyB0aGUgZGVjb21wb3NpdGlvbiBicmllZicpLFxuICAgIGFwcE5hbWU6IHouc3RyaW5nKCksXG4gICAgZGVwYXJ0bWVudDogei5zdHJpbmcoKSxcbiAgICB3M2NTdGFuZGFyZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVzNDIFhTRCAvIGRhdGEgc3RhbmRhcmQgYXBwbGllZCAoZS5nLiBcIlVCTCBmb3IgaW52b2ljZXNcIiknKSxcbiAgICBzY2hlbWFPcmdUeXBlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQcmltYXJ5IHNjaGVtYS5vcmcgdHlwZScpLFxuICAgIG1vZGVsczogc2NoZW1hTW9kZWxab2QuYXJyYXkoKS5kZXNjcmliZSgnMy04IFplblN0YWNrIG1vZGVscyAobm8gaWQvdGVuYW50U2x1Zy9jcmVhdGVkQXQvdXBkYXRlZEF0IGJhc2UgZmllbGRzKScpLFxuICAgIHVzZUNhc2VzOiB1c2VDYXNlWm9kLmFycmF5KCkuZGVzY3JpYmUoJ1VzZSBjYXNlcyBmb3IgdGhpcyBhcHAgKFVDLVhYWC1OTiknKSxcbiAgICBwYWdlczogcGFnZVpvZC5hcnJheSgpLmRlc2NyaWJlKCdQYWdlcyBmb3IgdGhpcyBhcHAgKGF1dGggdGllcnM6IHB1YmxpYy9waW4vZ29vZ2xlKScpLFxuICAgIG5hdjogYXBwTmF2Wm9kLFxuICAgIHV4V29ya2Zsb3c6IHouYXJyYXkoYXBwVXhTdGFnZVpvZCkuZGVzY3JpYmUoJ0VuZC10by1lbmQgVVggd29ya2Zsb3cgc3RhZ2VzIGZvciB0aGlzIGFwcCcpLFxuICAgIGtub3dsZWRnZVNuaXBwZXRzOiB6LmFycmF5KGFwcEtub3dsZWRnZVNuaXBwZXRab2QpLmRlc2NyaWJlKCdLbm93bGVkZ2Ugc25pcHBldHMgZm9yIHRoaXMgYXBwJylcbn0pO1xuLy8gXHUyNTAwXHUyNTAwIE1hdGVyaWFsaXplZCBydW4gcmVzdWx0IChwZXJzaXN0ZWQpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZXhwb3J0IGNvbnN0IGFwcFBhY2tSdW5SZXN1bHRab2QgPSB6Lm9iamVjdCh7XG4gICAgcGFja0lkOiB6LnN0cmluZygpLFxuICAgIG5hbWU6IHouc3RyaW5nKCksXG4gICAgZGVzY3JpcHRpb246IHouc3RyaW5nKCksXG4gICAgY3JlYXRlZEF0OiB6LnN0cmluZygpLFxuICAgIGFwcHM6IHouYXJyYXkoYXBwUGFja0FwcERlZmluaXRpb25ab2QpLFxuICAgIGNlb092ZXJ2aWV3OiB6Lm9iamVjdCh7XG4gICAgICAgIHB1cnBvc2U6IHouc3RyaW5nKCksXG4gICAgICAgIGtwaXM6IHouYXJyYXkoei5zdHJpbmcoKSlcbiAgICB9KSxcbiAgICBtYXRlcmlhbGl6ZWQ6IHoub2JqZWN0KHtcbiAgICAgICAgcGFnZXM6IHoubnVtYmVyKCksXG4gICAgICAgIG5hdkl0ZW1zOiB6Lm51bWJlcigpLFxuICAgICAgICBzbmlwcGV0czogei5udW1iZXIoKSxcbiAgICAgICAgZ3JvdXBzOiB6Lm51bWJlcigpLFxuICAgICAgICB6bW9kZWxzOiB6Lm51bWJlcigpXG4gICAgfSlcbn0pO1xuIiwgIi8qKlxuICogWm9kIHNjaGVtYSBmb3IgQUktZ2VuZXJhdGVkIFczQyBzY2hlbWEgZGVmaW5pdGlvbnMuXG4gKlxuICogVGhpcyBzY2hlbWEgaXMgdXNlZCB3aXRoIHRoZSBWZXJjZWwgQUkgU0RLJ3MgYGdlbmVyYXRlT2JqZWN0KClgIGZ1bmN0aW9uXG4gKiB0byBlbnN1cmUgdGhlIEFJIHJldHVybnMgYSBzdHJ1Y3R1cmFsbHkgdmFsaWQgc2NoZW1hIGRlZmluaXRpb24uXG4gKi8gaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5leHBvcnQgY29uc3Qgc2NoZW1hRmllbGRab2QgPSB6Lm9iamVjdCh7XG4gICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnRmllbGQgbmFtZSBpbiBjYW1lbENhc2UnKSxcbiAgICB0eXBlOiB6LmVudW0oW1xuICAgICAgICAnc3RyaW5nJyxcbiAgICAgICAgJ3RleHQnLFxuICAgICAgICAnaW50ZWdlcicsXG4gICAgICAgICdkZWNpbWFsJyxcbiAgICAgICAgJ2Jvb2xlYW4nLFxuICAgICAgICAnZGF0ZXRpbWUnLFxuICAgICAgICAnZGF0ZScsXG4gICAgICAgICd0aW1lJyxcbiAgICAgICAgJ2VudW0nLFxuICAgICAgICAnanNvbicsXG4gICAgICAgICdyZWxhdGlvbidcbiAgICBdKS5kZXNjcmliZSgnRmllbGQgdHlwZSBhbGlnbmVkIHdpdGggWFNEIGRhdGEgdHlwZXMnKSxcbiAgICByZXF1aXJlZDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gICAgdW5pcXVlOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICAgIGRlZmF1bHQ6IHoudW5rbm93bigpLm9wdGlvbmFsKCksXG4gICAgZW51bVZhbHVlczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLFxuICAgIHJlbGF0aW9uVG86IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICByZWxhdGlvblR5cGU6IHouZW51bShbXG4gICAgICAgICdvbmUtdG8tbWFueScsXG4gICAgICAgICdtYW55LXRvLW9uZScsXG4gICAgICAgICdtYW55LXRvLW1hbnknXG4gICAgXSkub3B0aW9uYWwoKSxcbiAgICBzY2hlbWFPcmdQcm9wZXJ0eTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdzY2hlbWEub3JnIHByb3BlcnR5IG1hcHBpbmcgKGUuZy4sIFwib2ZmZXJzLnByaWNlXCIpJyksXG4gICAgbGFiZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnSHVtYW4tcmVhZGFibGUgbGFiZWwgZm9yIFVJIGZvcm1zJyksXG4gICAgd2lkdGg6IHoudW5pb24oW1xuICAgICAgICB6LmxpdGVyYWwoNCksXG4gICAgICAgIHoubGl0ZXJhbCg2KSxcbiAgICAgICAgei5saXRlcmFsKDgpLFxuICAgICAgICB6LmxpdGVyYWwoMTIpXG4gICAgXSkub3B0aW9uYWwoKVxufSk7XG5leHBvcnQgY29uc3Qgc2NoZW1hTW9kZWxab2QgPSB6Lm9iamVjdCh7XG4gICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTW9kZWwgbmFtZSBpbiBQYXNjYWxDYXNlJyksXG4gICAgdGFibGVOYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdEYXRhYmFzZSB0YWJsZSBuYW1lIGluIHNuYWtlX2Nhc2VfcGx1cmFsJyksXG4gICAgZmllbGRzOiB6LmFycmF5KHNjaGVtYUZpZWxkWm9kKSxcbiAgICBzY2hlbWFPcmdNYXBwaW5nOiB6LnJlY29yZCh6LnN0cmluZygpKS5vcHRpb25hbCgpXG59KTtcbmV4cG9ydCBjb25zdCB1c2VDYXNlWm9kID0gei5vYmplY3Qoe1xuICAgIGlkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdVc2UgY2FzZSBJRCBpbiBmb3JtYXQgVUMtWFhYLU5OIChlLmcuLCBVQy1SRVNULTAxKScpLFxuICAgIHRpdGxlOiB6LnN0cmluZygpLFxuICAgIGF1dGg6IHouZW51bShbXG4gICAgICAgICdwdWJsaWMnLFxuICAgICAgICAncGluJyxcbiAgICAgICAgJ2dvb2dsZSdcbiAgICBdKSxcbiAgICByb3V0ZTogei5zdHJpbmcoKS5kZXNjcmliZSgnUm91dGUgcGF0aCAoZS5nLiwgXCIvbWVudVwiKScpLFxuICAgIGJsb2NrVHlwZXM6IHouYXJyYXkoei5zdHJpbmcoKSksXG4gICAgbW9kZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpXG59KTtcbmV4cG9ydCBjb25zdCBwYWdlWm9kID0gei5vYmplY3Qoe1xuICAgIHNsdWc6IHouc3RyaW5nKCksXG4gICAgdGl0bGU6IHouc3RyaW5nKCksXG4gICAgYXV0aFRpZXI6IHouZW51bShbXG4gICAgICAgICdwdWJsaWMnLFxuICAgICAgICAncGluJyxcbiAgICAgICAgJ2dvb2dsZSdcbiAgICBdKSxcbiAgICBibG9ja1R5cGVzOiB6LmFycmF5KHouc3RyaW5nKCkpLFxuICAgIG5hdkxhYmVsOiB6LnN0cmluZygpLm9wdGlvbmFsKClcbn0pO1xuZXhwb3J0IGNvbnN0IHNjaGVtYUdlbmVyYXRpb25ab2RTY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgdGVtcGxhdGVJZDogei5zdHJpbmcoKSxcbiAgICBzY2hlbWFPcmdUeXBlOiB6LnN0cmluZygpLFxuICAgIG1vZGVsczogei5hcnJheShzY2hlbWFNb2RlbFpvZCksXG4gICAgdXNlQ2FzZXM6IHouYXJyYXkodXNlQ2FzZVpvZCksXG4gICAgcGFnZXM6IHouYXJyYXkocGFnZVpvZClcbn0pO1xuIiwgIi8qKlxuICogWmVuU3RhY2sgLnptb2RlbCBDb21waWxlclxuICpcbiAqIFRha2VzIGFuIEFJLWdlbmVyYXRlZCBTY2hlbWFHZW5lcmF0aW9uUmVzdWx0IGFuZCBjb21waWxlcyBpdFxuICogaW50byBhIHZhbGlkIFplblN0YWNrIHNjaGVtYS56bW9kZWwgZmlsZS5cbiAqXG4gKiBUaGUgZ2VuZXJhdGVkIC56bW9kZWwgaW5jbHVkZXM6XG4gKiAgIC0gZGF0YXNvdXJjZSArIGdlbmVyYXRvciBibG9ja3NcbiAqICAgLSBBdXRoVGllciBlbnVtXG4gKiAgIC0gQWxsIG1vZGVscyB3aXRoIHByb3BlciBmaWVsZCB0eXBlcywgZGVjb3JhdG9ycywgYW5kIEBAbWFwXG4gKi8gLy8gXHUyNTAwXHUyNTAwIEZpZWxkIHR5cGUgbWFwcGluZyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmZ1bmN0aW9uIG1hcEZpZWxkVHlwZShmaWVsZCkge1xuICAgIHN3aXRjaChmaWVsZC50eXBlKXtcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIHJldHVybiAnU3RyaW5nJztcbiAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgICAgICByZXR1cm4gJ1N0cmluZyBAZGIuVGV4dCc7XG4gICAgICAgIGNhc2UgJ2ludGVnZXInOlxuICAgICAgICAgICAgcmV0dXJuICdJbnQnO1xuICAgICAgICBjYXNlICdkZWNpbWFsJzpcbiAgICAgICAgICAgIHJldHVybiAnRGVjaW1hbCBAZGIuRGVjaW1hbCgxNCwgMiknO1xuICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgIHJldHVybiAnQm9vbGVhbic7XG4gICAgICAgIGNhc2UgJ2RhdGV0aW1lJzpcbiAgICAgICAgICAgIHJldHVybiAnRGF0ZVRpbWUnO1xuICAgICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiAnRGF0ZVRpbWUgQGRiLkRhdGUnO1xuICAgICAgICBjYXNlICd0aW1lJzpcbiAgICAgICAgICAgIHJldHVybiAnRGF0ZVRpbWUgQGRiLlRpbWUnO1xuICAgICAgICBjYXNlICdlbnVtJzpcbiAgICAgICAgICAgIHJldHVybiAnU3RyaW5nJztcbiAgICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgICAgICByZXR1cm4gJ0pzb24nO1xuICAgICAgICBjYXNlICdyZWxhdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gJ1N0cmluZyc7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJ1N0cmluZyc7XG4gICAgfVxufVxuLy8gXHUyNTAwXHUyNTAwIEZpZWxkIGRlY29yYXRvciBtYXBwaW5nIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gbWFwRmllbGREZWNvcmF0b3JzKGZpZWxkKSB7XG4gICAgY29uc3QgcGFydHMgPSBbXTtcbiAgICBpZiAoZmllbGQudW5pcXVlKSBwYXJ0cy5wdXNoKCdAdW5pcXVlJyk7XG4gICAgaWYgKGZpZWxkLmRlZmF1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAodHlwZW9mIGZpZWxkLmRlZmF1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGBAZGVmYXVsdChcIiR7ZmllbGQuZGVmYXVsdH1cIilgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZmllbGQuZGVmYXVsdCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGBAZGVmYXVsdCgke2ZpZWxkLmRlZmF1bHR9KWApO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBmaWVsZC5kZWZhdWx0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcGFydHMucHVzaChgQGRlZmF1bHQoJHtmaWVsZC5kZWZhdWx0fSlgKTtcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGZpZWxkLmRlZmF1bHQpKSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGBAZGVmYXVsdChbXSlgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcnRzLnB1c2goYEBkZWZhdWx0KFwie31cIilgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGFydHMubGVuZ3RoID4gMCA/ICcgJyArIHBhcnRzLmpvaW4oJyAnKSA6ICcnO1xufVxuLy8gXHUyNTAwXHUyNTAwIEZpZWxkIGNvbW1lbnQgKHNjaGVtYS5vcmcgbWFwcGluZykgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5mdW5jdGlvbiBtYXBGaWVsZENvbW1lbnQoZmllbGQpIHtcbiAgICBpZiAoIWZpZWxkLnNjaGVtYU9yZ1Byb3BlcnR5KSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gYCAgLy8vIHNjaGVtYS5vcmc6JHtmaWVsZC5zY2hlbWFPcmdQcm9wZXJ0eX1gO1xufVxuLy8gXHUyNTAwXHUyNTAwIE1vZGVsIGNvbXBpbGF0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gY29tcGlsZU1vZGVsKG1vZGVsKSB7XG4gICAgY29uc3QgZmllbGRzU3RyID0gbW9kZWwuZmllbGRzLm1hcCgoZik9PntcbiAgICAgICAgY29uc3QgdHlwZVN0ciA9IG1hcEZpZWxkVHlwZShmKTtcbiAgICAgICAgY29uc3Qgb3B0aW9uYWwgPSBmLnJlcXVpcmVkID8gJycgOiAnPyc7XG4gICAgICAgIGNvbnN0IGRlY29yYXRvcnMgPSBtYXBGaWVsZERlY29yYXRvcnMoZik7XG4gICAgICAgIGNvbnN0IGNvbW1lbnQgPSBtYXBGaWVsZENvbW1lbnQoZik7XG4gICAgICAgIGNvbnN0IGZpZWxkTGluZSA9IGAgICR7Zi5uYW1lfSAke3R5cGVTdHJ9JHtvcHRpb25hbH0ke2RlY29yYXRvcnN9YDtcbiAgICAgICAgcmV0dXJuIGNvbW1lbnQgPyBgJHtjb21tZW50fVxcbiR7ZmllbGRMaW5lfWAgOiBmaWVsZExpbmU7XG4gICAgfSkuam9pbignXFxuJyk7XG4gICAgcmV0dXJuIGBcbm1vZGVsICR7bW9kZWwubmFtZX0ge1xuICBpZCAgICAgICAgIFN0cmluZyAgIEBpZCBAZGVmYXVsdChjdWlkKCkpXG4gIHRlbmFudFNsdWcgU3RyaW5nPyAgQG1hcChcInRlbmFudF9zbHVnXCIpXG4ke2ZpZWxkc1N0cn1cbiAgY3JlYXRlZEF0ICBEYXRlVGltZSBAZGVmYXVsdChub3coKSkgQG1hcChcImNyZWF0ZWRfYXRcIilcbiAgdXBkYXRlZEF0ICBEYXRlVGltZSBAdXBkYXRlZEF0IEBtYXAoXCJ1cGRhdGVkX2F0XCIpXG5cbiAgQEBpbmRleChbdGVuYW50U2x1Z10pXG4gIEBAbWFwKFwiJHttb2RlbC50YWJsZU5hbWV9XCIpXG59YDtcbn1cbi8vIFx1MjUwMFx1MjUwMCBGdWxsIC56bW9kZWwgY29tcGlsYXRpb24gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRvWk1vZGVsKHNjaGVtYSkge1xuICAgIGNvbnN0IGhlYWRlciA9IGAvLyBBdXRvLWdlbmVyYXRlZCBaZW5TdGFjayBzY2hlbWEgZm9yICR7c2NoZW1hLnRlbXBsYXRlSWR9XG4vLyBHZW5lcmF0ZWQgYnkgVE9LRU5JWk1ZQVBQIEFJIFNjaGVtYSBHZW5lcmF0b3Jcbi8vIHNjaGVtYS5vcmcgdHlwZTogJHtzY2hlbWEuc2NoZW1hT3JnVHlwZX1cbi8vIFczQyBzdGFuZGFyZCBhbGlnbm1lbnQgYXBwbGllZCB0byBmaWVsZCB0eXBlc1xuXG5kYXRhc291cmNlIGRiIHtcbiAgcHJvdmlkZXIgPSBcInBvc3RncmVzcWxcIlxuICB1cmwgICAgICA9IGVudihcIlBPU1RHUkVTX1VSTFwiKVxufVxuXG5nZW5lcmF0b3IgY2xpZW50IHtcbiAgcHJvdmlkZXIgPSBcInByaXNtYS1jbGllbnQtanNcIlxuICBvdXRwdXQgICA9IFwiLi4vLi4vc3JjL2dlbmVyYXRlZC9wcmlzbWFcIlxuICBiaW5hcnlUYXJnZXRzID0gW1wibmF0aXZlXCIsIFwibGludXgtYXJtNjQtb3BlbnNzbC0zLjAueFwiXVxufVxuXG5lbnVtIEF1dGhUaWVyIHtcbiAgcHVibGljXG4gIHBpblxuICBnb29nbGVcbn1cbmA7XG4gICAgY29uc3QgbW9kZWxzID0gc2NoZW1hLm1vZGVscy5tYXAoY29tcGlsZU1vZGVsKS5qb2luKCdcXG4nKTtcbiAgICByZXR1cm4gYCR7aGVhZGVyfVxcbiR7bW9kZWxzfVxcbmA7XG59XG4vLyBcdTI1MDBcdTI1MDAgUGFnZSBjYXRhbG9nIGNvbXBpbGF0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUb1BhZ2VDYXRhbG9nKHNjaGVtYSkge1xuICAgIGNvbnN0IHBhZ2VzID0gc2NoZW1hLnBhZ2VzLm1hcCgocCk9PmAgIHtcbiAgICBzbHVnOiAnJHtwLnNsdWd9JyxcbiAgICB0aXRsZTogJyR7cC50aXRsZX0nLFxuICAgIGF1dGhUaWVyOiAnJHtwLmF1dGhUaWVyfScsXG4gICAgbmF2TGFiZWw6ICcke3AubmF2TGFiZWwgPz8gcC50aXRsZX0nLFxuICAgIHNlY3Rpb25zOiBbXG4gICAgICAke3AuYmxvY2tUeXBlcy5tYXAoKGJ0KT0+YHsgYmxvY2tUeXBlOiAnJHtidH0nIGFzIEJsb2NrVHlwZSwgY29uZmlnOiB7fSB9YCkuam9pbignLFxcbiAgICAgICcpfVxuICAgIF0sXG4gIH1gKS5qb2luKCcsXFxuJyk7XG4gICAgcmV0dXJuIGAvKipcbiAqIEF1dG8tZ2VuZXJhdGVkIHBhZ2UgY2F0YWxvZyBmb3IgJHtzY2hlbWEudGVtcGxhdGVJZH1cbiAqIEdlbmVyYXRlZCBieSBUT0tFTklaTVlBUFAgQUkgU2NoZW1hIEdlbmVyYXRvclxuICovXG5pbXBvcnQgdHlwZSB7IFBhZ2VEZWZpbml0aW9uIH0gZnJvbSAnQC9saWIvcGFnZS1jYXRhbG9nJztcblxuZXhwb3J0IGNvbnN0IEdFTkVSQVRFRF9QQUdFUzogUGFnZURlZmluaXRpb25bXSA9IFtcbiR7cGFnZXN9XG5dO1xuYDtcbn1cbiIsICIvKipcbiAqIEFwcCBQYWNrIFx1MjAxNCBDb21waWxlclxuICpcbiAqIERldGVybWluaXN0aWMgY29tcGlsYXRpb24gb2YgQUktZ2VuZXJhdGVkIGFwcCBkZWZpbml0aW9ucyBpbnRvIGFydGlmYWN0cyB0aGVcbiAqIHBsYXRmb3JtIGNhbiBtYXRlcmlhbGl6ZTpcbiAqXG4gKiAgIC0gWmVuU3RhY2sgLnptb2RlbCBzb3VyY2UgKHBlciBhcHAsIHZpYSBjb21waWxlVG9aTW9kZWwpXG4gKiAgIC0gUGFnZSBjYXRhbG9nIHNvdXJjZSAocGVyIGFwcCwgdmlhIGNvbXBpbGVUb1BhZ2VDYXRhbG9nKVxuICogICAtIERCIHJvd3MgZm9yIHBhZ2VzLCBuYXYgaXRlbXMsIGtub3dsZWRnZSBzbmlwcGV0cyBhbmQgc2VjdXJpdHkgZ3JvdXBzXG4gKiAgIC0gVVggd29ya2Zsb3cgZG9jdW1lbnRzIChKU09OKVxuICovIGltcG9ydCB7IGNvbXBpbGVUb1pNb2RlbCwgY29tcGlsZVRvUGFnZUNhdGFsb2cgfSBmcm9tICdAL2RvbWFpbi9haS96bW9kZWwtY29tcGlsZXInO1xuZnVuY3Rpb24gdG9TY2hlbWFHZW5lcmF0aW9uUmVzdWx0KGRlZikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlSWQ6IGRlZi5hcHBJZCxcbiAgICAgICAgc2NoZW1hT3JnVHlwZTogZGVmLnNjaGVtYU9yZ1R5cGUsXG4gICAgICAgIG1vZGVsczogZGVmLm1vZGVscyxcbiAgICAgICAgdXNlQ2FzZXM6IGRlZi51c2VDYXNlcyxcbiAgICAgICAgcGFnZXM6IGRlZi5wYWdlc1xuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUFwcEFydGlmYWN0cyhkZWYpIHtcbiAgICBjb25zdCBzY2hlbWEgPSB0b1NjaGVtYUdlbmVyYXRpb25SZXN1bHQoZGVmKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBhcHBJZDogZGVmLmFwcElkLFxuICAgICAgICBhcHBOYW1lOiBkZWYuYXBwTmFtZSxcbiAgICAgICAgZGVwYXJ0bWVudDogZGVmLmRlcGFydG1lbnQsXG4gICAgICAgIHptb2RlbDogY29tcGlsZVRvWk1vZGVsKHNjaGVtYSksXG4gICAgICAgIHBhZ2VDYXRhbG9nOiBjb21waWxlVG9QYWdlQ2F0YWxvZyhzY2hlbWEpLFxuICAgICAgICBzZWN1cml0eUdyb3VwQ29kZTogYGFwcF8ke2RlZi5hcHBJZH1gLFxuICAgICAgICBzZWN1cml0eUdyb3VwTmFtZTogYEFwcDogJHtkZWYuYXBwTmFtZX1gXG4gICAgfTtcbn1cbi8qKiBOb3JtYWxpemUgYW4gQUktZ2VuZXJhdGVkIHBhZ2Ugc2x1ZyB0byBhIHNpbmdsZSBVUkwtc2FmZSBzZWdtZW50LiAqLyBleHBvcnQgZnVuY3Rpb24gc2FuaXRpemVQYWdlU2x1ZyhzbHVnKSB7XG4gICAgcmV0dXJuIHNsdWcudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9eXFwvKy8sICcnKS5yZXBsYWNlKC9bXFxzLl0rL2csIFwiLVwiKS5yZXBsYWNlKC9bXmEtejAtOS1fXS9nLCAnJykuc2xpY2UoMCwgNDgpO1xufVxuLyoqXG4gKiBQbHVyYWxpemUgYSBQYXNjYWxDYXNlIG1vZGVsIG5hbWUgZm9yIENSVUQgcGFnZSB0aXRsZXMgLyBuYXYgbGFiZWxzLlxuICogU2ltcGxlIEVuZ2xpc2ggaGV1cmlzdGljIChkb2N1bWVudGVkLCBub3QgZXhoYXVzdGl2ZSk6XG4gKiAgIC0gYWxyZWFkeS1wbHVyYWwgLyB1bmNvdW50YWJsZSBuYW1lcyBlbmRpbmcgaW4gXCJzXCIgKFNhbGVzLCBOZXdzKSBcdTIxOTIgYXMtaXNcbiAqICAgLSBlbmRzIGluIHMsIHgsIHosIGNoLCBzaCBcdTIxOTIgYXBwZW5kIFwiZXNcIiAgKFN0YXR1cyBcdTIxOTIgU3RhdHVzZXMsIEJveCBcdTIxOTIgQm94ZXMpXG4gKiAgIC0gZW5kcyBpbiBjb25zb25hbnQgKyBcInlcIiBcdTIxOTIgZHJvcCBcInlcIiwgYXBwZW5kIFwiaWVzXCIgIChDYXRlZ29yeSBcdTIxOTIgQ2F0ZWdvcmllcylcbiAqICAgLSBvdGhlcndpc2UgXHUyMTkyIGFwcGVuZCBcInNcIiAgKFJlc2VydmF0aW9uIFx1MjE5MiBSZXNlcnZhdGlvbnMpXG4gKi8gZnVuY3Rpb24gcGx1cmFsaXplTW9kZWxOYW1lKG5hbWUpIHtcbiAgICBpZiAoL3MkL2kudGVzdChuYW1lKSAmJiAhLyhzc3x1cykkL2kudGVzdChuYW1lKSkgcmV0dXJuIG5hbWU7XG4gICAgaWYgKC9bc3h6XSQvaS50ZXN0KG5hbWUpIHx8IC8oY2h8c2gpJC9pLnRlc3QobmFtZSkpIHJldHVybiBgJHtuYW1lfWVzYDtcbiAgICBpZiAoL1teYWVpb3VdeSQvaS50ZXN0KG5hbWUpKSByZXR1cm4gYCR7bmFtZS5zbGljZSgwLCAtMSl9aWVzYDtcbiAgICByZXR1cm4gYCR7bmFtZX1zYDtcbn1cbi8qKlxuICogQnVpbGQgREIgcm93cyBmb3Igb25lIGFwcC4gVGhlIGR5bmFtaWMgcm91dGVyIGlzIGEgc2luZ2xlLWxldmVsIGAvW3NsdWddYFxuICogcm91dGUsIHNvIHBhZ2Ugc2x1Z3MgYXJlIEZMQVQgYW5kIHByZWZpeGVkIHdpdGggcGFja0lkICsgYXBwSWQgdG8gc3RheVxuICogZ2xvYmFsbHkgdW5pcXVlIChgYXBwX3BhZ2VzLnNsdWdgIGlzIGEgZ2xvYmFsIHVuaXF1ZSBjb2x1bW4pLiBOYXYgY2x1c3RlcnNcbiAqIHRoZSBhcHAncyBwYWdlcyB1bmRlciBvbmUgcGFyZW50IGl0ZW07IGEgbGFuZGluZyBwYWdlIChzbHVnIGA8cGFja0lkPi08YXBwSWQ+YClcbiAqIGlzIGFsd2F5cyBtYXRlcmlhbGl6ZWQgc28gdGhlIHBhcmVudCBuYXYgaXRlbSBoYXMgYSByZWFsIGRlc3RpbmF0aW9uLlxuICovIGV4cG9ydCBmdW5jdGlvbiBjb21waWxlQXBwUm93cyhkZWYsIHRlbmFudFNsdWcsIHBhY2tJZCkge1xuICAgIGNvbnN0IHJvb3RTbHVnID0gYCR7cGFja0lkfS0ke2RlZi5hcHBJZH1gO1xuICAgIGNvbnN0IHJvb3QgPSB7XG4gICAgICAgIGlkOiBgcGFnZV8ke3BhY2tJZH1fJHtkZWYuYXBwSWR9YCxcbiAgICAgICAgc2x1Zzogcm9vdFNsdWcsXG4gICAgICAgIHRpdGxlOiBkZWYuYXBwTmFtZSxcbiAgICAgICAgYXV0aFRpZXI6IGRlZi5wYWdlc1swXT8uYXV0aFRpZXIgPz8gJ3BpbicsXG4gICAgICAgIG5hdkxhYmVsOiBudWxsLFxuICAgICAgICBzaG93SW5OYXY6IGZhbHNlLFxuICAgICAgICB0ZW5hbnRTbHVnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2hlcm8nLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGVmLmFwcE5hbWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuICAgIGNvbnN0IGFpUGFnZXMgPSBkZWYucGFnZXMubWFwKChwKT0+e1xuICAgICAgICBjb25zdCBzZWcgPSBzYW5pdGl6ZVBhZ2VTbHVnKHAuc2x1Zyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogYHBhZ2VfJHtwYWNrSWR9XyR7ZGVmLmFwcElkfV8ke3NlZ31gLFxuICAgICAgICAgICAgc2x1ZzogYCR7cGFja0lkfS0ke2RlZi5hcHBJZH0tJHtzZWd9YCxcbiAgICAgICAgICAgIHRpdGxlOiBwLnRpdGxlLFxuICAgICAgICAgICAgYXV0aFRpZXI6IHAuYXV0aFRpZXIsXG4gICAgICAgICAgICBuYXZMYWJlbDogcC5uYXZMYWJlbCA/PyBudWxsLFxuICAgICAgICAgICAgc2hvd0luTmF2OiBwLm5hdkxhYmVsICE9IG51bGwsXG4gICAgICAgICAgICB0ZW5hbnRTbHVnLFxuICAgICAgICAgICAgc2VjdGlvbnM6IHAuYmxvY2tUeXBlcy5tYXAoKGJ0KT0+e1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgIC8vIGRvY19tYXJrZG93biByZXF1aXJlcyBhIGNvbnRlbnQgc291cmNlIFx1MjAxNCBwb2ludCBpdCBhdCB0aGUgYXBwJ3MgZmlyc3RcbiAgICAgICAgICAgICAgICAvLyBrbm93bGVkZ2Ugc25pcHBldCAocG9saWNpZXMvZ3VpZGFuY2UpIHNvIHRoZSBibG9jayByZW5kZXJzIGNvbnRlbnQuXG4gICAgICAgICAgICAgICAgaWYgKGJ0ID09PSAnZG9jX21hcmtkb3duJyAmJiBkZWYua25vd2xlZGdlU25pcHBldHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuc291cmNlID0gYCR7cGFja0lkfS0ke2RlZi5rbm93bGVkZ2VTbmlwcGV0c1swXS5rZXl9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2tUeXBlOiBidCxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgLy8gRGV0ZXJtaW5pc3RpYyBDUlVEIHBhZ2VzOiBvbmUgcGVyIG1vZGVsLCBhcHBlbmRlZCBhZnRlciBBSSBwYWdlcyBzbyBldmVyeVxuICAgIC8vIG1vZGVsIGdldHMgYSBydW50aW1lIENSVUQgc3VyZmFjZSByZWdhcmRsZXNzIG9mIEFJIHBhZ2UgY2hvaWNlcy4gU2x1Z3MgYXJlXG4gICAgLy8gZmxhdCBhbmQgcGFja0lkK2FwcElkK3RhYmxlTmFtZS1wcmVmaXhlZCB0byBzdGF5IGdsb2JhbGx5IHVuaXF1ZVxuICAgIC8vIChhcHBfcGFnZXMuc2x1ZyBpcyBhIGdsb2JhbCB1bmlxdWUgY29sdW1uKS5cbiAgICBjb25zdCBtb2RlbFBhZ2VzID0gZGVmLm1vZGVscy5tYXAoKG1vZGVsKT0+e1xuICAgICAgICBjb25zdCB0aXRsZSA9IHBsdXJhbGl6ZU1vZGVsTmFtZShtb2RlbC5uYW1lKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiBgcGFnZV8ke3BhY2tJZH1fJHtkZWYuYXBwSWR9X21vZGVsXyR7bW9kZWwudGFibGVOYW1lfWAsXG4gICAgICAgICAgICBzbHVnOiBgJHtwYWNrSWR9LSR7ZGVmLmFwcElkfS0ke21vZGVsLnRhYmxlTmFtZX1gLFxuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBhdXRoVGllcjogJ3BpbicsXG4gICAgICAgICAgICBuYXZMYWJlbDogdGl0bGUsXG4gICAgICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgICAgICB0ZW5hbnRTbHVnLFxuICAgICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ3BhY2tfdGFibGUnLFxuICAgICAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlOiBtb2RlbC50YWJsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbW9kZWwubmFtZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9O1xuICAgIH0pO1xuICAgIGNvbnN0IHBhZ2VzID0gW1xuICAgICAgICByb290LFxuICAgICAgICAuLi5haVBhZ2VzLFxuICAgICAgICAuLi5tb2RlbFBhZ2VzXG4gICAgXTtcbiAgICAvLyBOYXY6IG9uZSBwYXJlbnQgaXRlbSBmb3IgdGhlIGFwcCBzZWN0aW9uICsgY2hpbGRyZW4gcGVyIG5hdiBwYWdlLlxuICAgIGNvbnN0IGdyb3VwQ29kZSA9IGBhcHBfJHtkZWYuYXBwSWR9YDtcbiAgICBjb25zdCBuYXYgPSBbXTtcbiAgICBuYXYucHVzaCh7XG4gICAgICAgIGlkOiBgbmF2XyR7cGFja0lkfV8ke2RlZi5hcHBJZH1gLFxuICAgICAgICB0aXRsZTogZGVmLm5hdi5sYWJlbCxcbiAgICAgICAgcGF0aDogYC8ke3Jvb3RTbHVnfWAsXG4gICAgICAgIGljb246IGRlZi5uYXYuaWNvbiA/PyAnQXBwcycsXG4gICAgICAgIHJlcXVpcmVkR3JvdXBzOiBncm91cENvZGUsXG4gICAgICAgIGlzRHluYW1pYzogdHJ1ZSxcbiAgICAgICAgc29ydE9yZGVyOiAwLFxuICAgICAgICB0ZW5hbnRTbHVnXG4gICAgfSk7XG4gICAgZGVmLm5hdi5wYWdlcy5mb3JFYWNoKChzbHVnLCBpKT0+e1xuICAgICAgICBjb25zdCBzZWcgPSBzYW5pdGl6ZVBhZ2VTbHVnKHNsdWcpO1xuICAgICAgICBjb25zdCBwYWdlID0gcGFnZXMuZmluZCgocCk9PnAuc2x1ZyA9PT0gYCR7cGFja0lkfS0ke2RlZi5hcHBJZH0tJHtzZWd9YCk7XG4gICAgICAgIG5hdi5wdXNoKHtcbiAgICAgICAgICAgIGlkOiBgbmF2XyR7cGFja0lkfV8ke2RlZi5hcHBJZH1fJHtzZWd9YCxcbiAgICAgICAgICAgIHRpdGxlOiBwYWdlPy5uYXZMYWJlbCA/PyBwYWdlPy50aXRsZSA/PyBzZWcsXG4gICAgICAgICAgICBwYXRoOiBgLyR7cGFja0lkfS0ke2RlZi5hcHBJZH0tJHtzZWd9YCxcbiAgICAgICAgICAgIGljb246ICcnLFxuICAgICAgICAgICAgcmVxdWlyZWRHcm91cHM6IGdyb3VwQ29kZSxcbiAgICAgICAgICAgIGlzRHluYW1pYzogdHJ1ZSxcbiAgICAgICAgICAgIHNvcnRPcmRlcjogaSArIDEsXG4gICAgICAgICAgICB0ZW5hbnRTbHVnXG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIC8vIE1vZGVsIENSVUQgbmF2IGNoaWxkcmVuIFx1MjAxNCBzb3J0IG9yZGVyIGNvbnRpbnVlcyBhZnRlciB0aGUgQUkgbmF2IHBhZ2VzLlxuICAgIGRlZi5tb2RlbHMuZm9yRWFjaCgobW9kZWwsIGkpPT57XG4gICAgICAgIGNvbnN0IHRpdGxlID0gcGx1cmFsaXplTW9kZWxOYW1lKG1vZGVsLm5hbWUpO1xuICAgICAgICBuYXYucHVzaCh7XG4gICAgICAgICAgICBpZDogYG5hdl8ke3BhY2tJZH1fJHtkZWYuYXBwSWR9X21vZGVsXyR7bW9kZWwudGFibGVOYW1lfWAsXG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIHBhdGg6IGAvJHtwYWNrSWR9LSR7ZGVmLmFwcElkfS0ke21vZGVsLnRhYmxlTmFtZX1gLFxuICAgICAgICAgICAgaWNvbjogJycsXG4gICAgICAgICAgICByZXF1aXJlZEdyb3VwczogZ3JvdXBDb2RlLFxuICAgICAgICAgICAgaXNEeW5hbWljOiB0cnVlLFxuICAgICAgICAgICAgc29ydE9yZGVyOiBkZWYubmF2LnBhZ2VzLmxlbmd0aCArIGkgKyAxLFxuICAgICAgICAgICAgdGVuYW50U2x1Z1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBjb25zdCBzbmlwcGV0cyA9IGRlZi5rbm93bGVkZ2VTbmlwcGV0cy5tYXAoKHMpPT4oe1xuICAgICAgICAgICAgaWQ6IGBzbmlwXyR7cGFja0lkfV8ke2RlZi5hcHBJZH1fJHtzLmtleS5yZXBsYWNlKC9bXmEtejAtOS1dL2csICdfJyl9YCxcbiAgICAgICAgICAgIGtleTogYCR7cGFja0lkfS0ke3Mua2V5fWAsXG4gICAgICAgICAgICBjb250ZW50OiBzLmNvbnRlbnQsXG4gICAgICAgICAgICBjYXRlZ29yeTogYGFwcF8ke2RlZi5hcHBJZH1gXG4gICAgICAgIH0pKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwYWdlcyxcbiAgICAgICAgbmF2LFxuICAgICAgICBzbmlwcGV0cyxcbiAgICAgICAgdXg6IHtcbiAgICAgICAgICAgIGFwcElkOiBkZWYuYXBwSWQsXG4gICAgICAgICAgICBhcHBOYW1lOiBkZWYuYXBwTmFtZSxcbiAgICAgICAgICAgIGRlcGFydG1lbnQ6IGRlZi5kZXBhcnRtZW50LFxuICAgICAgICAgICAgc3RhZ2VzOiBkZWYudXhXb3JrZmxvd1xuICAgICAgICB9XG4gICAgfTtcbn1cbi8qKlxuICogQnVpbGQgdGhlIENFTyBPdmVydmlldyBuYXYgKyBzbmlwcGV0IHJvd3M6IHRoZSBDRU8gYXBwIGdldHMgaXRzIG93biBzZWN0aW9uXG4gKiBwbHVzIGEga25vd2xlZGdlIGNhdGVnb3J5IHRoYXQgYWdncmVnYXRlcyBldmVyeSBkZXBhcnRtZW50IGFwcCdzIHNuaXBwZXRzIHNvXG4gKiB0aGUgQ0VPIGtub3dsZWRnZSBiYXNlIHNwYW5zIHRoZSB3aG9sZSBwYWNrLlxuICovIGV4cG9ydCBmdW5jdGlvbiBjb21waWxlQ2VvUm93cyhkZWNvbXBvc2l0aW9uLCBjZW9EZWYsIHRlbmFudFNsdWcsIHBhY2tJZCkge1xuICAgIGNvbnN0IGdyb3VwQ29kZSA9IGBhcHBfJHtjZW9EZWYuYXBwSWR9YDtcbiAgICBjb25zdCBuYXYgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiBgbmF2XyR7cGFja0lkfV8ke2Nlb0RlZi5hcHBJZH1gLFxuICAgICAgICAgICAgdGl0bGU6IGNlb0RlZi5uYXYubGFiZWwsXG4gICAgICAgICAgICBwYXRoOiBgLyR7cGFja0lkfS0ke2Nlb0RlZi5hcHBJZH1gLFxuICAgICAgICAgICAgaWNvbjogY2VvRGVmLm5hdi5pY29uID8/ICdJbnNpZ2h0cycsXG4gICAgICAgICAgICByZXF1aXJlZEdyb3VwczogZ3JvdXBDb2RlLFxuICAgICAgICAgICAgaXNEeW5hbWljOiB0cnVlLFxuICAgICAgICAgICAgc29ydE9yZGVyOiAxMDAsXG4gICAgICAgICAgICB0ZW5hbnRTbHVnXG4gICAgICAgIH1cbiAgICBdO1xuICAgIGNvbnN0IHNuaXBwZXRzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogYHNuaXBfJHtwYWNrSWR9XyR7Y2VvRGVmLmFwcElkfV9vdmVydmlld2AsXG4gICAgICAgICAgICBrZXk6IGAke3BhY2tJZH0tJHtjZW9EZWYuYXBwSWR9LW92ZXJ2aWV3YCxcbiAgICAgICAgICAgIGNvbnRlbnQ6IGAjICR7Y2VvRGVmLmFwcE5hbWV9XFxuXFxuJHtkZWNvbXBvc2l0aW9uLmNlb092ZXJ2aWV3LnB1cnBvc2V9YCArIGBcXG5cXG5Dcm9zcy1kZXBhcnRtZW50IEtQSXM6ICR7ZGVjb21wb3NpdGlvbi5jZW9PdmVydmlldy5rcGlzLmpvaW4oJywgJyl9LmAsXG4gICAgICAgICAgICBjYXRlZ29yeTogYGFwcF8ke2Nlb0RlZi5hcHBJZH1gXG4gICAgICAgIH0sXG4gICAgICAgIC4uLmRlY29tcG9zaXRpb24uYXBwcy5maWx0ZXIoKGEpPT5hLmlkICE9PSBjZW9EZWYuYXBwSWQpLm1hcCgoYSk9Pih7XG4gICAgICAgICAgICAgICAgaWQ6IGBzbmlwXyR7cGFja0lkfV8ke2Nlb0RlZi5hcHBJZH1feHJlZl8ke2EuaWR9YCxcbiAgICAgICAgICAgICAgICBrZXk6IGAke3BhY2tJZH0tJHtjZW9EZWYuYXBwSWR9LXhyZWYtJHthLmlkfWAsXG4gICAgICAgICAgICAgICAgY29udGVudDogYCMgJHthLm5hbWV9ICgke2EuZGVwYXJ0bWVudH0pXFxuXFxuJHthLnN1bW1hcnl9XFxuXFxuVGhpcyBkZXBhcnRtZW50IGFwcCBmZWVkcyB0aGUgQ0VPIE92ZXJ2aWV3LiBgICsgYFJlZmVyIHRvIGl0cyBrbm93bGVkZ2UgY2F0ZWdvcnkgXCJhcHBfJHthLmlkfVwiIGZvciBvcGVyYXRpbmcgZGV0YWlscy5gLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBgYXBwXyR7Y2VvRGVmLmFwcElkfWBcbiAgICAgICAgICAgIH0pKVxuICAgIF07XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmF2LFxuICAgICAgICBzbmlwcGV0cyxcbiAgICAgICAgdXg6IHtcbiAgICAgICAgICAgIGFwcElkOiBjZW9EZWYuYXBwSWQsXG4gICAgICAgICAgICBhcHBOYW1lOiBjZW9EZWYuYXBwTmFtZSxcbiAgICAgICAgICAgIGRlcGFydG1lbnQ6IGNlb0RlZi5kZXBhcnRtZW50LFxuICAgICAgICAgICAgc3RhZ2VzOiBjZW9EZWYudXhXb3JrZmxvd1xuICAgICAgICB9XG4gICAgfTtcbn1cbiIsICIvKipcbiAqIEFwcCBQYWNrIFx1MjAxNCBNYXRlcmlhbGl6ZXJcbiAqXG4gKiBQZXJzaXN0cyBhIGNvbXBpbGVkIGFwcCBwYWNrIGludG8gdGhlIHRlbmFudCBEQiB2aWEgcmF3IHBnICh3b3JrZmxvdyBzdGVwc1xuICogdXNlIHNob3J0LWxpdmVkIGNvbm5lY3Rpb25zLCBzYW1lIGFzIHdvcmtib29rLWluZ2VzdCkuIEFsbCB3cml0ZXMgYXJlXG4gKiBpZGVtcG90ZW50OiByb3dzIGFyZSBzY29wZWQgYnkgcGFja0lkIHByZWZpeCBhbmQgcmVwbGFjZWQgb24gcmUtcnVuLlxuICpcbiAqIERCIGNvbnN0cmFpbnRzIChmcm9tIHplbnN0YWNrL3NjaGVtYS56bW9kZWwpOlxuICogICAtIGFwcF9wYWdlcy5zbHVnIGlzIFVOSVFVRSAoZ2xvYmFsKSBcdTIxOTIgZmxhdCBwYWNrSWQtcHJlZml4ZWQgc2x1Z3NcbiAqICAgLSBwYWdlX3NlY3Rpb25zLmJsb2NrX3R5cGUgaXMgYSBCbG9ja1R5cGUgRU5VTSBcdTIxOTIgY2FzdCByZXF1aXJlZFxuICogICAtIGtub3dsZWRnZV9zbmlwcGV0cyAoa2V5LCBhcHBfaWQpIGlzIFVOSVFVRSBcdTIxOTIgcGFja0lkLXByZWZpeGVkIGtleXMsIGFwcF9pZCAnJ1xuICogICAtIHNlY3VyaXR5X2dyb3Vwcy5jb2RlIGlzIFVOSVFVRSBcdTIxOTIgdXBzZXJ0LCBuZXZlciBkZWxldGUgKHJlZmVyZW5jZWQpXG4gKi8gaW1wb3J0IHsgY29tcGlsZUFwcFJvd3MsIGNvbXBpbGVDZW9Sb3dzIH0gZnJvbSAnLi9hcHAtcGFjay1jb21waWxlcic7XG4vLyBcdTI1MDBcdTI1MDAgSWRlbXBvdGVudCBEREwgXHUyMDE0IGVuc3VyZXMgdGhlIHRhcmdldCBEQiBoYXMgdGhlIHRhYmxlcyB0aGUgbWF0ZXJpYWxpemVyXG4vLyB3cml0ZXMgdG8uIFRlbmFudCBkYXRhYmFzZXMgKHBlci10ZW5hbnQgTmVvbiBicmFuY2hlcykgYXJlIHByb3Zpc2lvbmVkIGVtcHR5XG4vLyBhbmQgbWF5IG5vdCBoYXZlIHJ1biB0aGUgWmVuU3RhY2sgbWlncmF0aW9ucyBvciB0aGUgcm9vdCBzZWVkLXJ1bm5lciBEREwsIHNvXG4vLyB0aGUgbWF0ZXJpYWxpemVyIGd1YXJhbnRlZXMgaXRzIG93biBzY2hlbWEgaW5zdGVhZCBvZiBhc3N1bWluZyBpdCBleGlzdHMuXG4vLyBDb2x1bW4gc2hhcGVzIG1pcnJvciB6ZW5zdGFjay9zY2hlbWEuem1vZGVsICsgdGhlIHNoYXJlZCBzZWVkIERETC5cbmNvbnN0IEFQUF9QQUNLX0VOVU1fRERMID0gW1xuICAgIGBETyAkJCBCRUdJTiBDUkVBVEUgVFlQRSBcIkF1dGhUaWVyXCIgQVMgRU5VTSAoJ3B1YmxpYycsICdwaW4nLCAnZ29vZ2xlJyk7IEVYQ0VQVElPTiBXSEVOIGR1cGxpY2F0ZV9vYmplY3QgVEhFTiBOVUxMOyBFTkQgJCRgLFxuICAgIGBETyAkJCBCRUdJTiBDUkVBVEUgVFlQRSBcIkJsb2NrVHlwZVwiIEFTIEVOVU0gKCdoZXJvJywgJ21ldHJpY19ncmlkJywgJ2NoYXJ0X2ZpbmFuY2lhbCcsICdsZXZlcl9hY2NvcmRpb24nLCAnYWN0aW9uX2NoZWNrbGlzdCcsICdkb2NfbWFya2Rvd24nLCAncG5sX3RhYmxlJywgJ3pfcmVwb3J0X2Zvcm0nLCAnY29zdHNfZm9ybScsICdjYWxlbmRhcl9pbXBvcnQnLCAnY2hhdF9wYW5lbCcsICdrcGlfY2FyZHMnLCAnb3BzX2FkbWluX3RhYnMnLCAncmV2aWV3X2Jsb2NrcycsICdyZXBvcnRzX3JvbGx1cCcsICdzaGVldF92aWV3ZXInKTsgRVhDRVBUSU9OIFdIRU4gZHVwbGljYXRlX29iamVjdCBUSEVOIE5VTEw7IEVORCAkJGAsXG4gICAgLy8gTmV3ZXIgYmxvY2sgdHlwZXMgbWF5IGJlIG1pc3NpbmcgZnJvbSBwcmUtZXhpc3RpbmcgZW51bXMuXG4gICAgYEFMVEVSIFRZUEUgXCJCbG9ja1R5cGVcIiBBREQgVkFMVUUgSUYgTk9UIEVYSVNUUyAnb3BzX2FkbWluX3RhYnMnYCxcbiAgICBgQUxURVIgVFlQRSBcIkJsb2NrVHlwZVwiIEFERCBWQUxVRSBJRiBOT1QgRVhJU1RTICdyZXZpZXdfYmxvY2tzJ2AsXG4gICAgYEFMVEVSIFRZUEUgXCJCbG9ja1R5cGVcIiBBREQgVkFMVUUgSUYgTk9UIEVYSVNUUyAncmVwb3J0c19yb2xsdXAnYCxcbiAgICBgQUxURVIgVFlQRSBcIkJsb2NrVHlwZVwiIEFERCBWQUxVRSBJRiBOT1QgRVhJU1RTICdzaGVldF92aWV3ZXInYCxcbiAgICBgQUxURVIgVFlQRSBcIkJsb2NrVHlwZVwiIEFERCBWQUxVRSBJRiBOT1QgRVhJU1RTICdwYWNrX3RhYmxlJ2Bcbl07XG5jb25zdCBBUFBfUEFDS19UQUJMRV9EREwgPSBbXG4gICAgYENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHNlY3VyaXR5X2dyb3VwcyAoXG4gICAgaWQgVEVYVCBQUklNQVJZIEtFWSBERUZBVUxUIGdlbl9yYW5kb21fdXVpZCgpLFxuICAgIGNvZGUgVEVYVCBOT1QgTlVMTCBVTklRVUUsXG4gICAgbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgIGRlc2NyaXB0aW9uIFRFWFQsXG4gICAgaXNfc3lzdGVtIEJPT0xFQU4gTk9UIE5VTEwgREVGQVVMVCBmYWxzZSxcbiAgICBwZXJtaXNzaW9ucyBURVhUW10gTk9UIE5VTEwgREVGQVVMVCAne30nLFxuICAgIGNyZWF0ZWRfYXQgVElNRVNUQU1QIFdJVEhPVVQgVElNRSBaT05FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVBcbiAgKWAsXG4gICAgYENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGFwcF9wYWdlcyAoXG4gICAgaWQgVEVYVCBQUklNQVJZIEtFWSxcbiAgICBzbHVnIFRFWFQgTk9UIE5VTEwgVU5JUVVFLFxuICAgIHRpdGxlIFRFWFQgTk9UIE5VTEwsXG4gICAgYXV0aF90aWVyIFwiQXV0aFRpZXJcIiBOT1QgTlVMTCBERUZBVUxUICdwdWJsaWMnLFxuICAgIHNvcnRfb3JkZXIgSU5URUdFUiBOT1QgTlVMTCBERUZBVUxUIDAsXG4gICAgbmF2X2xhYmVsIFRFWFQsXG4gICAgc2hvd19pbl9uYXYgQk9PTEVBTiBOT1QgTlVMTCBERUZBVUxUIHRydWUsXG4gICAgdGVuYW50X3NsdWcgVEVYVFxuICApYCxcbiAgICBgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgcGFnZV9zZWN0aW9ucyAoXG4gICAgaWQgVEVYVCBQUklNQVJZIEtFWSxcbiAgICBwYWdlX2lkIFRFWFQgTk9UIE5VTEwgUkVGRVJFTkNFUyBhcHBfcGFnZXMoaWQpIE9OIERFTEVURSBDQVNDQURFLFxuICAgIHNvcnRfb3JkZXIgSU5URUdFUiBOT1QgTlVMTCxcbiAgICBibG9ja190eXBlIFwiQmxvY2tUeXBlXCIgTk9UIE5VTEwsXG4gICAgY29uZmlnIEpTT05CIE5PVCBOVUxMIERFRkFVTFQgJ3t9J1xuICApYCxcbiAgICBgQ1JFQVRFIElOREVYIElGIE5PVCBFWElTVFMgcGFnZV9zZWN0aW9uc19wYWdlX2lkX3NvcnRfb3JkZXJfaWR4IE9OIHBhZ2Vfc2VjdGlvbnMocGFnZV9pZCwgc29ydF9vcmRlcilgLFxuICAgIGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBuYXZpZ2F0aW9uX2l0ZW1zIChcbiAgICBpZCBURVhUIFBSSU1BUlkgS0VZLFxuICAgIHBhcmVudF9pZCBURVhUIFJFRkVSRU5DRVMgbmF2aWdhdGlvbl9pdGVtcyhpZCkgT04gREVMRVRFIFNFVCBOVUxMLFxuICAgIHNvcnRfb3JkZXIgSU5URUdFUiBOT1QgTlVMTCBERUZBVUxUIDAsXG4gICAgdGl0bGUgVEVYVCBOT1QgTlVMTCxcbiAgICBwYXRoIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAnJyxcbiAgICBpY29uIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAnJyxcbiAgICBhdXRoX3RpZXIgVEVYVCBOT1QgTlVMTCBERUZBVUxUICdwdWJsaWMnLFxuICAgIHRlbmFudF9zbHVnIFRFWFQsXG4gICAgaXNfYWN0aXZlIEJPT0xFQU4gTk9UIE5VTEwgREVGQVVMVCB0cnVlLFxuICAgIHJlcXVpcmVkX2dyb3VwcyBURVhUIE5PVCBOVUxMIERFRkFVTFQgJycsXG4gICAgaXNfdmlzaWJsZSBCT09MRUFOIE5PVCBOVUxMIERFRkFVTFQgdHJ1ZSxcbiAgICBpc19keW5hbWljIEJPT0xFQU4gTk9UIE5VTEwgREVGQVVMVCBmYWxzZSxcbiAgICBpc19kZWZhdWx0IEJPT0xFQU4gTk9UIE5VTEwgREVGQVVMVCBmYWxzZSxcbiAgICBjcmVhdGVkX2F0IFRJTUVTVEFNUCBOT1QgTlVMTCBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgIHVwZGF0ZWRfYXQgVElNRVNUQU1QIE5PVCBOVUxMIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVBcbiAgKWAsXG4gICAgYENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGtub3dsZWRnZV9zbmlwcGV0cyAoXG4gICAgaWQgVEVYVCBQUklNQVJZIEtFWSxcbiAgICBrZXkgVEVYVCBOT1QgTlVMTCxcbiAgICBjb250ZW50IFRFWFQgTk9UIE5VTEwsXG4gICAgY2F0ZWdvcnkgVEVYVCBOT1QgTlVMTCxcbiAgICBhcHBfaWQgVEVYVCBOT1QgTlVMTCBERUZBVUxUICcnLFxuICAgIFVOSVFVRSAoa2V5LCBhcHBfaWQpXG4gIClgXG5dO1xuLyoqIENvbHVtbiBiYWNrZmlsbHMgZm9yIERCcyB3aGVyZSB0aGUgdGFibGVzIHByZS1kYXRlIHRoZXNlIGNvbHVtbnMuICovIGNvbnN0IEFQUF9QQUNLX1RBQkxFX0FMVEVSUyA9IFtcbiAgICBgQUxURVIgVEFCTEUgYXBwX3BhZ2VzIEFERCBDT0xVTU4gSUYgTk9UIEVYSVNUUyBuYXZfbGFiZWwgVEVYVGAsXG4gICAgYEFMVEVSIFRBQkxFIGFwcF9wYWdlcyBBREQgQ09MVU1OIElGIE5PVCBFWElTVFMgc2hvd19pbl9uYXYgQk9PTEVBTiBOT1QgTlVMTCBERUZBVUxUIHRydWVgLFxuICAgIGBBTFRFUiBUQUJMRSBhcHBfcGFnZXMgQUREIENPTFVNTiBJRiBOT1QgRVhJU1RTIHRlbmFudF9zbHVnIFRFWFRgLFxuICAgIGBBTFRFUiBUQUJMRSBuYXZpZ2F0aW9uX2l0ZW1zIEFERCBDT0xVTU4gSUYgTk9UIEVYSVNUUyB0ZW5hbnRfc2x1ZyBURVhUYCxcbiAgICBgQUxURVIgVEFCTEUgbmF2aWdhdGlvbl9pdGVtcyBBREQgQ09MVU1OIElGIE5PVCBFWElTVFMgaXNfYWN0aXZlIEJPT0xFQU4gTk9UIE5VTEwgREVGQVVMVCB0cnVlYCxcbiAgICBgQUxURVIgVEFCTEUgbmF2aWdhdGlvbl9pdGVtcyBBREQgQ09MVU1OIElGIE5PVCBFWElTVFMgaXNfZHluYW1pYyBCT09MRUFOIE5PVCBOVUxMIERFRkFVTFQgZmFsc2VgLFxuICAgIGBBTFRFUiBUQUJMRSBuYXZpZ2F0aW9uX2l0ZW1zIEFERCBDT0xVTU4gSUYgTk9UIEVYSVNUUyBpc19kZWZhdWx0IEJPT0xFQU4gTk9UIE5VTEwgREVGQVVMVCBmYWxzZWAsXG4gICAgYEFMVEVSIFRBQkxFIGtub3dsZWRnZV9zbmlwcGV0cyBBREQgQ09MVU1OIElGIE5PVCBFWElTVFMgYXBwX2lkIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAnJ2AsXG4gICAgYENSRUFURSBVTklRVUUgSU5ERVggSUYgTk9UIEVYSVNUUyBrbm93bGVkZ2Vfc25pcHBldHNfa2V5X2FwcF9pZF9rZXkgT04ga25vd2xlZGdlX3NuaXBwZXRzIChrZXksIGFwcF9pZClgXG5dO1xuLyoqIFJ1biBiZWZvcmUgbWF0ZXJpYWxpemF0aW9uIHNvIHdyaXRlcyBuZXZlciBoaXQgbWlzc2luZyB0YWJsZXMvY29sdW1ucy4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuc3VyZUFwcFBhY2tUYWJsZXMoY2xpZW50KSB7XG4gICAgZm9yIChjb25zdCBzdG10IG9mIEFQUF9QQUNLX0VOVU1fRERMKXtcbiAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KHN0bXQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHN0bXQgb2YgQVBQX1BBQ0tfVEFCTEVfRERMKXtcbiAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KHN0bXQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHN0bXQgb2YgQVBQX1BBQ0tfVEFCTEVfQUxURVJTKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShzdG10KTtcbiAgICAgICAgfSBjYXRjaCAge1xuICAgICAgICAvLyBDb2x1bW4gbWF5IGFscmVhZHkgZXhpc3Qgb3IgdGhlIHRhYmxlIG1heSBiZSBtaXNzaW5nIFx1MjAxNCBpZ25vcmUuXG4gICAgICAgIH1cbiAgICB9XG59XG4vKiogVXBzZXJ0IHRoZSBwZXItYXBwIHNlY3VyaXR5IGdyb3VwIChjb2RlID0gYXBwXzxhcHBJZD4pLiBOZXZlciBkZWxldGVzLiAqLyBhc3luYyBmdW5jdGlvbiB1cHNlcnRTZWN1cml0eUdyb3VwcyhjbGllbnQsIGFwcHMpIHtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGZvciAoY29uc3QgYXBwIG9mIGFwcHMpe1xuICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIHNlY3VyaXR5X2dyb3VwcyAoaWQsIGNvZGUsIG5hbWUsIGRlc2NyaXB0aW9uLCBpc19zeXN0ZW0sIHBlcm1pc3Npb25zLCBjcmVhdGVkX2F0KVxuICAgICAgIFZBTFVFUyAoJDEsICQyLCAkMywgJDQsIGZhbHNlLCBBUlJBWVtdOjp0ZXh0W10sIE5PVygpKVxuICAgICAgIE9OIENPTkZMSUNUIChjb2RlKSBETyBVUERBVEUgU0VUIG5hbWUgPSBFWENMVURFRC5uYW1lLCBkZXNjcmlwdGlvbiA9IEVYQ0xVREVELmRlc2NyaXB0aW9uO2AsIFtcbiAgICAgICAgICAgIGBzZ18ke2FwcC5hcHBJZH1gLFxuICAgICAgICAgICAgYXBwLnNlY3VyaXR5R3JvdXBDb2RlLFxuICAgICAgICAgICAgYXBwLnNlY3VyaXR5R3JvdXBOYW1lLFxuICAgICAgICAgICAgYE1lbWJlcnMgY2FuIGFjY2VzcyB0aGUgJHthcHAuYXBwTmFtZX0gYXBwLmBcbiAgICAgICAgXSk7XG4gICAgICAgIGNvdW50Kys7XG4gICAgfVxuICAgIHJldHVybiBjb3VudDtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYXRlcmlhbGl6ZUFwcFBhY2soY2xpZW50LCBpbnB1dCkge1xuICAgIGNvbnN0IHsgcGFja0lkLCB0ZW5hbnRTbHVnLCBkZWNvbXBvc2l0aW9uLCBhcHBzLCBkZWZpbml0aW9ucyB9ID0gaW5wdXQ7XG4gICAgY29uc3QgY291bnRzID0ge1xuICAgICAgICBhcHBzOiAwLFxuICAgICAgICBwYWdlczogMCxcbiAgICAgICAgc2VjdGlvbnM6IDAsXG4gICAgICAgIG5hdjogMCxcbiAgICAgICAgc25pcHBldHM6IDAsXG4gICAgICAgIGdyb3VwczogMFxuICAgIH07XG4gICAgLy8gR3VhcmFudGVlIHRoZSB0YXJnZXQgdGFibGVzIGV4aXN0ICh0ZW5hbnQgREJzIG1heSBiZSBwcm92aXNpb25lZCBlbXB0eSkuXG4gICAgYXdhaXQgZW5zdXJlQXBwUGFja1RhYmxlcyhjbGllbnQpO1xuICAgIC8vIDEuIFNlY3VyaXR5IGdyb3VwcyBmb3IgZXZlcnkgYXBwLlxuICAgIGNvdW50cy5ncm91cHMgPSBhd2FpdCB1cHNlcnRTZWN1cml0eUdyb3VwcyhjbGllbnQsIGFwcHMpO1xuICAgIC8vIDIuIFBhZ2VzICsgc2VjdGlvbnMgXHUyMDE0IHNjb3BlZCByZXBsYWNlIChwYWNrIHBhZ2VzIG9ubHkpLlxuICAgIGNvbnN0IHBhZ2VTbHVnUHJlZml4ID0gYCR7cGFja0lkfS0lYDtcbiAgICBhd2FpdCBjbGllbnQucXVlcnkoYERFTEVURSBGUk9NIGFwcF9wYWdlcyBXSEVSRSBzbHVnIExJS0UgJDEgQU5EIHRlbmFudF9zbHVnID0gJDI7YCwgW1xuICAgICAgICBwYWdlU2x1Z1ByZWZpeCxcbiAgICAgICAgdGVuYW50U2x1Z1xuICAgIF0pO1xuICAgIC8vIE5hdiBcdTIwMTQgc2NvcGVkIHJlcGxhY2UgKHBhY2sgbmF2IGl0ZW1zIG9ubHkpLiBOYXYgaWRzIGFyZSBkZXRlcm1pbmlzdGljXG4gICAgLy8gKG5hdl88cGFja0lkPl88YXBwSWQ+W188c2VnPl0pIGFuZCB0aGUgUEssIHNvIGEgcmUtcnVuIG9mIHRoZSBzYW1lIHBhY2tJZFxuICAgIC8vIHdvdWxkIG90aGVyd2lzZSBmYWlsIHdpdGggYSBkdXBsaWNhdGUta2V5IHZpb2xhdGlvbi5cbiAgICBhd2FpdCBjbGllbnQucXVlcnkoYERFTEVURSBGUk9NIG5hdmlnYXRpb25faXRlbXMgV0hFUkUgaWQgTElLRSAkMSBBTkQgdGVuYW50X3NsdWcgPSAkMjtgLCBbXG4gICAgICAgIGBuYXZfJHtwYWNrSWR9XyVgLFxuICAgICAgICB0ZW5hbnRTbHVnXG4gICAgXSk7XG4gICAgY29uc3QgZGVmcyA9IFtcbiAgICAgICAgLi4uZGVmaW5pdGlvbnNcbiAgICBdO1xuICAgIC8vIENFTyBPdmVydmlldyBkZWYgaXMgbGFzdCBpbiBkZWNvbXBvc2l0aW9uLmFwcHMgb3JkZXIgKGd1YXJhbnRlZWQgYnkgZ2VuZXJhdG9yKS5cbiAgICBjb25zdCBjZW9EZWYgPSBkZWZzW2RlZnMubGVuZ3RoIC0gMV07XG4gICAgY29uc3QgZGVwdERlZnMgPSBkZWZzLnNsaWNlKDAsIC0xKTtcbiAgICBmb3IgKGNvbnN0IGRlZiBvZiBkZXB0RGVmcyl7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBjb21waWxlQXBwUm93cyhkZWYsIHRlbmFudFNsdWcsIHBhY2tJZCk7XG4gICAgICAgIGZvciAoY29uc3QgcGFnZSBvZiByb3dzLnBhZ2VzKXtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8gYXBwX3BhZ2VzIChpZCwgc2x1ZywgdGl0bGUsIGF1dGhfdGllciwgc29ydF9vcmRlciwgbmF2X2xhYmVsLCBzaG93X2luX25hdiwgdGVuYW50X3NsdWcpXG4gICAgICAgICBWQUxVRVMgKCQxLCAkMiwgJDMsIENBU1QoJDQgQVMgXCJBdXRoVGllclwiKSwgJDUsICQ2LCAkNywgJDgpO2AsIFtcbiAgICAgICAgICAgICAgICBwYWdlLmlkLFxuICAgICAgICAgICAgICAgIHBhZ2Uuc2x1ZyxcbiAgICAgICAgICAgICAgICBwYWdlLnRpdGxlLFxuICAgICAgICAgICAgICAgIHBhZ2UuYXV0aFRpZXIsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBwYWdlLm5hdkxhYmVsLFxuICAgICAgICAgICAgICAgIHBhZ2Uuc2hvd0luTmF2LFxuICAgICAgICAgICAgICAgIHRlbmFudFNsdWdcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY291bnRzLnBhZ2VzKys7XG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgcGFnZS5zZWN0aW9ucy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBwYWdlX3NlY3Rpb25zIChpZCwgcGFnZV9pZCwgc29ydF9vcmRlciwgYmxvY2tfdHlwZSwgY29uZmlnKVxuICAgICAgICAgICBWQUxVRVMgKCQxLCAkMiwgJDMsIENBU1QoJDQgQVMgXCJCbG9ja1R5cGVcIiksIENBU1QoJDUgQVMganNvbmIpKTtgLCBbXG4gICAgICAgICAgICAgICAgICAgIGAke3BhZ2UuaWR9OnNlY3Rpb246JHtpfWAsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2UuaWQsXG4gICAgICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgICAgIHBhZ2Uuc2VjdGlvbnNbaV0uYmxvY2tUeXBlLFxuICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShwYWdlLnNlY3Rpb25zW2ldLmNvbmZpZylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICBjb3VudHMuc2VjdGlvbnMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBOYXYgZm9yIHRoaXMgYXBwLlxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2Ygcm93cy5uYXYpe1xuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBuYXZpZ2F0aW9uX2l0ZW1zIChpZCwgcGFyZW50X2lkLCBzb3J0X29yZGVyLCB0aXRsZSwgcGF0aCwgaWNvbiwgYXV0aF90aWVyLCB0ZW5hbnRfc2x1ZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZSwgcmVxdWlyZWRfZ3JvdXBzLCBpc192aXNpYmxlLCBpc19keW5hbWljLCBpc19kZWZhdWx0LCBjcmVhdGVkX2F0LCB1cGRhdGVkX2F0KVxuICAgICAgICAgVkFMVUVTICgkMSwgTlVMTCwgJDIsICQzLCAkNCwgJDUsIENBU1QoJ3BpbicgQVMgXCJBdXRoVGllclwiKSwgJDYsIHRydWUsICQ3LCB0cnVlLCAkOCwgZmFsc2UsIE5PVygpLCBOT1coKSk7YCwgW1xuICAgICAgICAgICAgICAgIGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgaXRlbS5zb3J0T3JkZXIsXG4gICAgICAgICAgICAgICAgaXRlbS50aXRsZSxcbiAgICAgICAgICAgICAgICBpdGVtLnBhdGgsXG4gICAgICAgICAgICAgICAgaXRlbS5pY29uLFxuICAgICAgICAgICAgICAgIHRlbmFudFNsdWcsXG4gICAgICAgICAgICAgICAgaXRlbS5yZXF1aXJlZEdyb3VwcyxcbiAgICAgICAgICAgICAgICBpdGVtLmlzRHluYW1pY1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudHMubmF2Kys7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU25pcHBldHMgZm9yIHRoaXMgYXBwLlxuICAgICAgICBmb3IgKGNvbnN0IHNuaXAgb2Ygcm93cy5zbmlwcGV0cyl7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY29udGVudCwgY2F0ZWdvcnksIGFwcF9pZCkgVkFMVUVTICgkMSwgJDIsICQzLCAkNCwgJycpXG4gICAgICAgICBPTiBDT05GTElDVCAoa2V5LCBhcHBfaWQpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQsIGNhdGVnb3J5ID0gRVhDTFVERUQuY2F0ZWdvcnk7YCwgW1xuICAgICAgICAgICAgICAgIHNuaXAuaWQsXG4gICAgICAgICAgICAgICAgc25pcC5rZXksXG4gICAgICAgICAgICAgICAgc25pcC5jb250ZW50LFxuICAgICAgICAgICAgICAgIHNuaXAuY2F0ZWdvcnlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY291bnRzLnNuaXBwZXRzKys7XG4gICAgICAgIH1cbiAgICAgICAgY291bnRzLmFwcHMrKztcbiAgICB9XG4gICAgLy8gMy4gQ0VPIE92ZXJ2aWV3IChsYXN0IGFwcCk6IHBhZ2VzICsgbmF2ICsgY3Jvc3MtZGVwYXJ0bWVudCBzbmlwcGV0cy5cbiAgICBjb25zdCBjZW9Sb3dzID0gY29tcGlsZUNlb1Jvd3MoZGVjb21wb3NpdGlvbiwgY2VvRGVmLCB0ZW5hbnRTbHVnLCBwYWNrSWQpO1xuICAgIGNvbnN0IHJvb3RTbHVnID0gYCR7cGFja0lkfS0ke2Nlb0RlZi5hcHBJZH1gO1xuICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8gYXBwX3BhZ2VzIChpZCwgc2x1ZywgdGl0bGUsIGF1dGhfdGllciwgc29ydF9vcmRlciwgbmF2X2xhYmVsLCBzaG93X2luX25hdiwgdGVuYW50X3NsdWcpXG4gICAgIFZBTFVFUyAoJDEsICQyLCAkMywgQ0FTVCgkNCBBUyBcIkF1dGhUaWVyXCIpLCAkNSwgJDYsICQ3LCAkOCk7YCwgW1xuICAgICAgICBgcGFnZV8ke3BhY2tJZH1fJHtjZW9EZWYuYXBwSWR9YCxcbiAgICAgICAgcm9vdFNsdWcsXG4gICAgICAgIGNlb0RlZi5hcHBOYW1lLFxuICAgICAgICAncGluJyxcbiAgICAgICAgMCxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIHRlbmFudFNsdWdcbiAgICBdKTtcbiAgICBjb3VudHMucGFnZXMrKztcbiAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIHBhZ2Vfc2VjdGlvbnMgKGlkLCBwYWdlX2lkLCBzb3J0X29yZGVyLCBibG9ja190eXBlLCBjb25maWcpXG4gICAgIFZBTFVFUyAoJDEsICQyLCAkMywgQ0FTVCgkNCBBUyBcIkJsb2NrVHlwZVwiKSwgQ0FTVCgkNSBBUyBqc29uYikpO2AsIFtcbiAgICAgICAgYHBhZ2VfJHtwYWNrSWR9XyR7Y2VvRGVmLmFwcElkfTpzZWN0aW9uOjBgLFxuICAgICAgICBgcGFnZV8ke3BhY2tJZH1fJHtjZW9EZWYuYXBwSWR9YCxcbiAgICAgICAgMCxcbiAgICAgICAgJ2hlcm8nLFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICB0aXRsZTogY2VvRGVmLmFwcE5hbWVcbiAgICAgICAgfSlcbiAgICBdKTtcbiAgICBjb3VudHMuc2VjdGlvbnMrKztcbiAgICBmb3IgKGNvbnN0IGRlZiBvZiBbXG4gICAgICAgIGNlb0RlZlxuICAgIF0pe1xuICAgICAgICBjb25zdCByb3dzID0gY29tcGlsZUFwcFJvd3MoZGVmLCB0ZW5hbnRTbHVnLCBwYWNrSWQpO1xuICAgICAgICBmb3IgKGNvbnN0IHBhZ2Ugb2Ygcm93cy5wYWdlcy5zbGljZSgxKSl7XG4gICAgICAgICAgICAvLyBDRU8gcGFnZXMgYmV5b25kIHRoZSByb290LlxuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBhcHBfcGFnZXMgKGlkLCBzbHVnLCB0aXRsZSwgYXV0aF90aWVyLCBzb3J0X29yZGVyLCBuYXZfbGFiZWwsIHNob3dfaW5fbmF2LCB0ZW5hbnRfc2x1ZylcbiAgICAgICAgIFZBTFVFUyAoJDEsICQyLCAkMywgQ0FTVCgkNCBBUyBcIkF1dGhUaWVyXCIpLCAkNSwgJDYsICQ3LCAkOCk7YCwgW1xuICAgICAgICAgICAgICAgIHBhZ2UuaWQsXG4gICAgICAgICAgICAgICAgcGFnZS5zbHVnLFxuICAgICAgICAgICAgICAgIHBhZ2UudGl0bGUsXG4gICAgICAgICAgICAgICAgcGFnZS5hdXRoVGllcixcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIHBhZ2UubmF2TGFiZWwsXG4gICAgICAgICAgICAgICAgcGFnZS5zaG93SW5OYXYsXG4gICAgICAgICAgICAgICAgdGVuYW50U2x1Z1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudHMucGFnZXMrKztcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBwYWdlLnNlY3Rpb25zLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIHBhZ2Vfc2VjdGlvbnMgKGlkLCBwYWdlX2lkLCBzb3J0X29yZGVyLCBibG9ja190eXBlLCBjb25maWcpXG4gICAgICAgICAgIFZBTFVFUyAoJDEsICQyLCAkMywgQ0FTVCgkNCBBUyBcIkJsb2NrVHlwZVwiKSwgQ0FTVCgkNSBBUyBqc29uYikpO2AsIFtcbiAgICAgICAgICAgICAgICAgICAgYCR7cGFnZS5pZH06c2VjdGlvbjoke2l9YCxcbiAgICAgICAgICAgICAgICAgICAgcGFnZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgICAgcGFnZS5zZWN0aW9uc1tpXS5ibG9ja1R5cGUsXG4gICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHBhZ2Uuc2VjdGlvbnNbaV0uY29uZmlnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIGNvdW50cy5zZWN0aW9ucysrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByb3dzLm5hdil7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIG5hdmlnYXRpb25faXRlbXMgKGlkLCBwYXJlbnRfaWQsIHNvcnRfb3JkZXIsIHRpdGxlLCBwYXRoLCBpY29uLCBhdXRoX3RpZXIsIHRlbmFudF9zbHVnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlLCByZXF1aXJlZF9ncm91cHMsIGlzX3Zpc2libGUsIGlzX2R5bmFtaWMsIGlzX2RlZmF1bHQsIGNyZWF0ZWRfYXQsIHVwZGF0ZWRfYXQpXG4gICAgICAgICBWQUxVRVMgKCQxLCBOVUxMLCAkMiwgJDMsICQ0LCAkNSwgQ0FTVCgncGluJyBBUyBcIkF1dGhUaWVyXCIpLCAkNiwgdHJ1ZSwgJDcsIHRydWUsICQ4LCBmYWxzZSwgTk9XKCksIE5PVygpKTtgLCBbXG4gICAgICAgICAgICAgICAgaXRlbS5pZCxcbiAgICAgICAgICAgICAgICBpdGVtLnNvcnRPcmRlcixcbiAgICAgICAgICAgICAgICBpdGVtLnRpdGxlLFxuICAgICAgICAgICAgICAgIGl0ZW0ucGF0aCxcbiAgICAgICAgICAgICAgICBpdGVtLmljb24sXG4gICAgICAgICAgICAgICAgdGVuYW50U2x1ZyxcbiAgICAgICAgICAgICAgICBpdGVtLnJlcXVpcmVkR3JvdXBzLFxuICAgICAgICAgICAgICAgIGl0ZW0uaXNEeW5hbWljXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvdW50cy5uYXYrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IHNuaXAgb2YgY2VvUm93cy5zbmlwcGV0cyl7XG4gICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjb250ZW50LCBjYXRlZ29yeSwgYXBwX2lkKSBWQUxVRVMgKCQxLCAkMiwgJDMsICQ0LCAnJylcbiAgICAgICBPTiBDT05GTElDVCAoa2V5LCBhcHBfaWQpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQsIGNhdGVnb3J5ID0gRVhDTFVERUQuY2F0ZWdvcnk7YCwgW1xuICAgICAgICAgICAgc25pcC5pZCxcbiAgICAgICAgICAgIHNuaXAua2V5LFxuICAgICAgICAgICAgc25pcC5jb250ZW50LFxuICAgICAgICAgICAgc25pcC5jYXRlZ29yeVxuICAgICAgICBdKTtcbiAgICAgICAgY291bnRzLnNuaXBwZXRzKys7XG4gICAgfVxuICAgIGNvdW50cy5hcHBzKys7XG4gICAgcmV0dXJuIGNvdW50cztcbn1cbiIsICIvKipcbiAqIEFwcCBQYWNrIFx1MjAxNCBTY2hlbWEgQXBwbHlcbiAqXG4gKiBDb21waWxlcyB0aGUgcGFjaydzIGFwcCBkZWZpbml0aW9ucyBpbnRvIGEgc2luZ2xlIGNvbnNvbGlkYXRlZCBaZW5TdGFja1xuICogem1vZGVsIChhdWRpdCBwcmV2aWV3IC8gcmVzdWx0IGFydGlmYWN0KSBhbmQgYXBwbGllcyB0aGUgcGFjaydzIG1vZGVscyB0b1xuICogdGhlIHRhcmdldCB0ZW5hbnQgZGF0YWJhc2UgYXMgcmVhbCB0YWJsZXMgdmlhIGFkZGl0aXZlIHJhdyBEREwuXG4gKlxuICogV2h5IHJhdyBEREwgaW5zdGVhZCBvZiBgcnVuTWlncmF0aW9uc2AgKHplbnN0YWNrIGdlbmVyYXRlICsgcHJpc21hIGRiIHB1c2gpP1xuICogYHByaXNtYSBkYiBwdXNoIC0tYWNjZXB0LWRhdGEtbG9zc2AgRFJPUFMgdGFibGVzIHRoYXQgYXJlIG5vdCBwcmVzZW50IGluXG4gKiB0aGUgc2NoZW1hLiBUaGUgcGFjayB6bW9kZWwgY29udGFpbnMgb25seSB0aGUgcGFjaydzIG1vZGVscywgc28gcHVzaGluZyBpdFxuICogYWdhaW5zdCB0aGUgcm9vdCBEQiBvciBhIGZhY3RvcnktY3JlYXRlZCB0ZW5hbnQgREIgKHdoaWNoIGJvdGggaG9sZCBtYW55XG4gKiBvdGhlciB0YWJsZXMpIHdvdWxkIGRlbGV0ZSB0aGVtLiBBZGRpdGl2ZSBgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFNgXG4gKiBjcmVhdGVzIHRoZSBwYWNrJ3MgdGFibGVzIHdpdGhvdXQgdG91Y2hpbmcgYW55dGhpbmcgZWxzZSBcdTIwMTQgc2FmZSBhZ2FpbnN0XG4gKiBldmVyeSB0YXJnZXQsIGlkZW1wb3RlbnQgb24gcmUtcnVuLCBhbmQgY29uc2lzdGVudCB3aXRoIHRoZSBtYXRlcmlhbGl6ZXIuXG4gKlxuICogQ29sdW1uIHNoYXBlcyBtaXJyb3Igd2hhdCBjb21waWxlVG9aTW9kZWwgZW1pdHMgKGZpZWxkIG5hbWVzIGFzLWlzLCBiYXNlXG4gKiBjb2x1bW5zIGlkL3RlbmFudF9zbHVnL2NyZWF0ZWRfYXQvdXBkYXRlZF9hdCkgc28gdGhlIHRhYmxlcyBtYXRjaCB0aGVcbiAqIHptb2RlbCBwcmV2aWV3IGFuZCB0aGUgZ2VuZXJhdGVkIFByaXNtYSBjbGllbnQuXG4gKi8gaW1wb3J0IHsgY29tcGlsZVRvWk1vZGVsIH0gZnJvbSAnQC9kb21haW4vYWkvem1vZGVsLWNvbXBpbGVyJztcbi8vIFx1MjUwMFx1MjUwMCBGaWVsZCB0eXBlIG1hcHBpbmcgKG1pcnJvcnMgem1vZGVsLWNvbXBpbGVyIG1hcEZpZWxkVHlwZSkgXHUyNTAwXHUyNTAwXG5mdW5jdGlvbiBtYXBTcWxUeXBlKGZpZWxkVHlwZSkge1xuICAgIHN3aXRjaChmaWVsZFR5cGUpe1xuICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgcmV0dXJuICdURVhUJztcbiAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgICAgICByZXR1cm4gJ1RFWFQnO1xuICAgICAgICBjYXNlICdpbnRlZ2VyJzpcbiAgICAgICAgICAgIHJldHVybiAnSU5URUdFUic7XG4gICAgICAgIGNhc2UgJ2RlY2ltYWwnOlxuICAgICAgICAgICAgcmV0dXJuICdOVU1FUklDKDE0LDIpJztcbiAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICByZXR1cm4gJ0JPT0xFQU4nO1xuICAgICAgICBjYXNlICdkYXRldGltZSc6XG4gICAgICAgICAgICByZXR1cm4gJ1RJTUVTVEFNUCc7XG4gICAgICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgICAgICAgcmV0dXJuICdEQVRFJztcbiAgICAgICAgY2FzZSAndGltZSc6XG4gICAgICAgICAgICByZXR1cm4gJ1RJTUUnO1xuICAgICAgICBjYXNlICdlbnVtJzpcbiAgICAgICAgICAgIHJldHVybiAnVEVYVCc7XG4gICAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICAgICAgcmV0dXJuICdKU09OQic7XG4gICAgICAgIGNhc2UgJ3JlbGF0aW9uJzpcbiAgICAgICAgICAgIHJldHVybiAnVEVYVCc7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJ1RFWFQnO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG1hcFNxbERlZmF1bHQoZmllbGQpIHtcbiAgICBjb25zdCBkID0gZmllbGQuZGVmYXVsdDtcbiAgICBpZiAoZCA9PT0gdW5kZWZpbmVkIHx8IGQgPT09IG51bGwpIHJldHVybiBudWxsO1xuICAgIGlmICh0eXBlb2YgZCA9PT0gJ3N0cmluZycpIHJldHVybiBgREVGQVVMVCAnJHtkLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYDtcbiAgICBpZiAodHlwZW9mIGQgPT09ICdib29sZWFuJykgcmV0dXJuIGBERUZBVUxUICR7ZH1gO1xuICAgIGlmICh0eXBlb2YgZCA9PT0gJ251bWJlcicpIHJldHVybiBgREVGQVVMVCAke2R9YDtcbiAgICByZXR1cm4gbnVsbDsgLy8gYXJyYXlzL29iamVjdHMgXHUyMDE0IHNraXAgKHptb2RlbCBtYXBzIHRoZW0gdG8gU3RyaW5nIGFueXdheSlcbn1cbi8qKiBCdWlsZCB0aGUgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgc3RhdGVtZW50IGZvciBvbmUgbW9kZWwuICovIGZ1bmN0aW9uIGNvbXBpbGVUYWJsZURETChtb2RlbCkge1xuICAgIGNvbnN0IGNvbHVtbnMgPSBbXG4gICAgICAgICdpZCBURVhUIFBSSU1BUlkgS0VZJyxcbiAgICAgICAgJ3RlbmFudF9zbHVnIFRFWFQnXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IGYgb2YgbW9kZWwuZmllbGRzKXtcbiAgICAgICAgY29uc3QgdHlwZSA9IG1hcFNxbFR5cGUoZi50eXBlKTtcbiAgICAgICAgY29uc3QgbnVsbGFibGUgPSBmLnJlcXVpcmVkID8gJ05PVCBOVUxMJyA6ICcnO1xuICAgICAgICBjb25zdCB1bmlxdWUgPSBmLnVuaXF1ZSA/ICdVTklRVUUnIDogJyc7XG4gICAgICAgIGNvbnN0IGRlZiA9IG1hcFNxbERlZmF1bHQoZik7XG4gICAgICAgIGNvbHVtbnMucHVzaChgICAke2YubmFtZX0gJHt0eXBlfSAke251bGxhYmxlfSAke3VuaXF1ZX0gJHtkZWYgPz8gJyd9YC5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpKTtcbiAgICB9XG4gICAgY29sdW1ucy5wdXNoKCdjcmVhdGVkX2F0IFRJTUVTVEFNUCBOT1QgTlVMTCBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QJyk7XG4gICAgY29sdW1ucy5wdXNoKCd1cGRhdGVkX2F0IFRJTUVTVEFNUCBOT1QgTlVMTCBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QJyk7XG4gICAgcmV0dXJuIGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBcIiR7bW9kZWwudGFibGVOYW1lfVwiIChcXG4ke2NvbHVtbnMuam9pbignLFxcbicpfVxcbik7YDtcbn1cbi8qKiBDb2x1bW4gYmFja2ZpbGxzIGZvciB0YWJsZXMgdGhhdCBwcmUtZGF0ZSB0aGUgcGFjaydzIGNvbHVtbnMuICovIGZ1bmN0aW9uIGNvbXBpbGVUYWJsZUFsdGVycyhtb2RlbCkge1xuICAgIGNvbnN0IGFsdGVycyA9IFtdO1xuICAgIGZvciAoY29uc3QgZiBvZiBtb2RlbC5maWVsZHMpe1xuICAgICAgICBjb25zdCB0eXBlID0gbWFwU3FsVHlwZShmLnR5cGUpO1xuICAgICAgICBjb25zdCBudWxsYWJsZSA9IGYucmVxdWlyZWQgPyAnTk9UIE5VTEwnIDogJyc7XG4gICAgICAgIGNvbnN0IGRlZiA9IG1hcFNxbERlZmF1bHQoZik7XG4gICAgICAgIGFsdGVycy5wdXNoKGBBTFRFUiBUQUJMRSBcIiR7bW9kZWwudGFibGVOYW1lfVwiIEFERCBDT0xVTU4gSUYgTk9UIEVYSVNUUyAke2YubmFtZX0gJHt0eXBlfSAke251bGxhYmxlfSAke2RlZiA/PyAnJ31gLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCkpO1xuICAgIH1cbiAgICByZXR1cm4gYWx0ZXJzO1xufVxuLyoqXG4gKiBCdWlsZCBhIHNpbmdsZSBjb25zb2xpZGF0ZWQgem1vZGVsIGZyb20gZXZlcnkgYXBwIGRlZmluaXRpb24gXHUyMDE0IG9uZVxuICogZGF0YXNvdXJjZS9nZW5lcmF0b3IvZW51bSBoZWFkZXIgcGx1cyBhbGwgbW9kZWxzIFx1MjAxNCByZXVzaW5nIHRoZSBzaGFyZWRcbiAqIGNvbXBpbGVUb1pNb2RlbC4gTW9kZWwgbmFtZXMgYXJlIGtlcHQgYXMgZ2VuZXJhdGVkOyBvbiBhIG5hbWUgY29sbGlzaW9uXG4gKiB0aGUgbGF0ZXIgbW9kZWwgaXMgc3VmZml4ZWQgd2l0aCBpdHMgYXBwIGlkIHNvIHRoZSBzY2hlbWEgc3RheXMgdmFsaWQuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVQYWNrWk1vZGVsKGRlZmluaXRpb25zKSB7XG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQoKTtcbiAgICBjb25zdCBtb2RlbHMgPSBkZWZpbml0aW9ucy5mbGF0TWFwKChkZWYpPT5kZWYubW9kZWxzLm1hcCgobSk9PntcbiAgICAgICAgICAgIGxldCBuYW1lID0gbS5uYW1lO1xuICAgICAgICAgICAgaWYgKHNlZW4uaGFzKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IGAke25hbWV9XyR7ZGVmLmFwcElkLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCAnJyl9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlZW4uYWRkKG5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAuLi5tLFxuICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pKTtcbiAgICBjb25zdCBtZXJnZWQgPSB7XG4gICAgICAgIHRlbXBsYXRlSWQ6ICdhcHAtcGFjaycsXG4gICAgICAgIHNjaGVtYU9yZ1R5cGU6ICdMb2NhbEJ1c2luZXNzJyxcbiAgICAgICAgbW9kZWxzLFxuICAgICAgICB1c2VDYXNlczogZGVmaW5pdGlvbnMuZmxhdE1hcCgoZCk9PmQudXNlQ2FzZXMpLFxuICAgICAgICBwYWdlczogZGVmaW5pdGlvbnMuZmxhdE1hcCgoZCk9PmQucGFnZXMpXG4gICAgfTtcbiAgICByZXR1cm4gY29tcGlsZVRvWk1vZGVsKG1lcmdlZCk7XG59XG4vKipcbiAqIEFwcGx5IHRoZSBwYWNrJ3MgbW9kZWxzIHRvIHRoZSB0YXJnZXQgREIgYXMgcmVhbCB0YWJsZXMuIEFkZGl0aXZlIGFuZFxuICogaWRlbXBvdGVudDogY3JlYXRlcyBtaXNzaW5nIHRhYmxlcy9pbmRleGVzLCBiYWNrZmlsbHMgbWlzc2luZyBjb2x1bW5zLFxuICogbmV2ZXIgZHJvcHMgb3IgYWx0ZXJzIGV4aXN0aW5nIGRhdGEuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcGx5UGFja1NjaGVtYShjbGllbnQsIGRlZmluaXRpb25zKSB7XG4gICAgY29uc3Qgc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCB6bW9kZWwgPSBjb21waWxlUGFja1pNb2RlbChkZWZpbml0aW9ucyk7XG4gICAgZm9yIChjb25zdCBkZWYgb2YgZGVmaW5pdGlvbnMpe1xuICAgICAgICBmb3IgKGNvbnN0IG1vZGVsIG9mIGRlZi5tb2RlbHMpe1xuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGNvbXBpbGVUYWJsZURETChtb2RlbCkpO1xuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBcIiR7bW9kZWwudGFibGVOYW1lfV90ZW5hbnRfc2x1Z19pZHhcIiBPTiBcIiR7bW9kZWwudGFibGVOYW1lfVwiICh0ZW5hbnRfc2x1Zyk7YCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGFsdGVyIG9mIGNvbXBpbGVUYWJsZUFsdGVycyhtb2RlbCkpe1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShhbHRlcik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAge1xuICAgICAgICAgICAgICAgIC8vIENvbHVtbiBtYXkgYWxyZWFkeSBleGlzdCBcdTIwMTQgaWdub3JlLlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICB6bW9kZWwsXG4gICAgICAgIGFwcGxpZWQ6IHRydWUsXG4gICAgICAgIGR1cmF0aW9uTXM6IERhdGUubm93KCkgLSBzdGFydGVkQXRcbiAgICB9O1xufVxuIiwgIi8qKlxuICogUHJvZ3Jlc3MgZW1pc3Npb24gZm9yIHRoZSBhcHAtcGFjay1nZW5lcmF0ZSB3b3JrZmxvdy5cbiAqXG4gKiBGb2xsb3dzIHRoZSBTREsgc3RyZWFtaW5nIHBhdHRlcm4gdXNlZCBieSB3b3JrYm9vay1pbmdlc3Q6IHRoZSB3b3JrZmxvd1xuICogZnVuY3Rpb24gY2FsbHMgYGdldFdyaXRhYmxlKClgIGFuZCBwYXNzZXMgdGhlIHN0cmVhbSB0byBzdGVwczsgc3RlcHMgb2J0YWluXG4gKiBhIHdyaXRlciwgd3JpdGUgSlNPTiBjaHVua3MsIGFuZCByZWxlYXNlIHRoZSBsb2NrLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZVByb2dyZXNzQ2h1bmsod3JpdGFibGUsIGNodW5rKSB7XG4gICAgY29uc3Qgd3JpdGVyID0gd3JpdGFibGUuZ2V0V3JpdGVyKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgd3JpdGVyLndyaXRlKGNodW5rKTtcbiAgICB9IGZpbmFsbHl7XG4gICAgICAgIHdyaXRlci5yZWxlYXNlTG9jaygpO1xuICAgIH1cbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbG9zZVByb2dyZXNzU3RyZWFtKHdyaXRhYmxlKSB7XG4gICAgYXdhaXQgd3JpdGFibGUuY2xvc2UoKTtcbn1cbiIsICIvKipcbiAqIExpZ2h0d2VpZ2h0IFBvc3RncmVTUUwgaGVscGVyIGZvciBhcHAtcGFjayB3b3JrZmxvdyBzdGVwcyAocGcgZHJpdmVyLCBub1xuICogUHJpc21hKS4gTWlycm9ycyB3b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L2RiLnRzIFx1MjAxNCBlYWNoIHN0ZXAgb3BlbnMgaXRzIG93blxuICogc2hvcnQtbGl2ZWQgY29ubmVjdGlvbjsgdGhlIGNvbm5lY3Rpb24gc3RyaW5nIGlzIHJlc29sdmVkIGJ5IHRoZSByb3V0ZSBhbmRcbiAqIHBhc3NlZCB0aHJvdWdoIHRoZSB3b3JrZmxvdyBpbnB1dC5cbiAqLyBpbXBvcnQgeyBDbGllbnQgfSBmcm9tICdwZyc7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd2l0aFBnQ2xpZW50KGNvbm5lY3Rpb25TdHJpbmcsIGZuKSB7XG4gICAgaWYgKCFjb25uZWN0aW9uU3RyaW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZGF0YWJhc2UgY29ubmVjdGlvbiBzdHJpbmcgcHJvdmlkZWQuJyk7XG4gICAgfVxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoe1xuICAgICAgICBjb25uZWN0aW9uU3RyaW5nXG4gICAgfSk7XG4gICAgYXdhaXQgY2xpZW50LmNvbm5lY3QoKTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgZm4oY2xpZW50KTtcbiAgICB9IGZpbmFsbHl7XG4gICAgICAgIGF3YWl0IGNsaWVudC5lbmQoKTtcbiAgICB9XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcXVlcnlSb3dzKGNsaWVudCwgc3FsLCBwYXJhbXMgPSBbXSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5xdWVyeShzcWwsIHBhcmFtcyk7XG4gICAgcmV0dXJuIHJlc3VsdC5yb3dzO1xufVxuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbi8qKlxuICogU3RlcCBmdW5jdGlvbnMgZm9yIHRoZSB3b3JrYm9vay1pbmdlc3Qgd29ya2Zsb3cuXG4gKlxuICogRWFjaCBleHBvcnRlZCBhc3luYyBmdW5jdGlvbiB3aXRoIHRoZSBgJ3VzZSBzdGVwJ2AgZGlyZWN0aXZlIGlzIGEgZHVyYWJsZVxuICogc3RlcDogaXRzIGFyZ3MgYW5kIHJlc3VsdCBhcmUgc2VyaWFsaXplZCB0byB0aGUgZXZlbnQgbG9nLCBhbmQgaXQgcmV0cmllc1xuICogKG1heCAzLCBvciBwZXIgUmV0cnlhYmxlRXJyb3IpIGJlZm9yZSB0aGUgZXJyb3IgYnViYmxlcyB0byB0aGUgd29ya2Zsb3cuXG4gKi8gaW1wb3J0IHsgRmF0YWxFcnJvciwgUmV0cnlhYmxlRXJyb3IgfSBmcm9tICd3b3JrZmxvdyc7XG5pbXBvcnQgeyBleHRyYWN0U2hlZXRzV2l0aFN0YXRzIH0gZnJvbSAnLi4vLi4vc3JjL2RvbWFpbi9haS13b3JrYm9vay9leHRyYWN0LXNoZWV0cyc7XG5pbXBvcnQgeyBhbmFseXplU2hlZXRzIH0gZnJvbSAnLi4vLi4vc3JjL2RvbWFpbi9haS13b3JrYm9vay9zaGVldC1hbmFseXNpcyc7XG5pbXBvcnQgeyBjb21wcmVoZW5kT25jZSwgQ29tcHJlaGVuZEh0dHBFcnJvciwgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvciB9IGZyb20gJy4uLy4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svY29tcHJlaGVuZCc7XG5pbXBvcnQgeyB3cml0ZVByb2dyZXNzQ2h1bmssIGNsb3NlUHJvZ3Jlc3NTdHJlYW0gfSBmcm9tICcuL3Byb2dyZXNzJztcbmltcG9ydCB7IHdpdGhQZ0NsaWVudCwgZXhlY3V0ZU9uZSwgcXVlcnlSb3dzIH0gZnJvbSAnLi9kYic7XG5pbXBvcnQgeyByZWFkIH0gZnJvbSAneGxzeCc7XG5pbXBvcnQgeyBidWlsZFdvcmtib29rRm9ybXVsYU1hcCB9IGZyb20gJy4uLy4uL3NyYy9saWIvd29ya2Jvb2stZm9ybXVsYXMnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcIndvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMudHNcIjp7XCJhbmFseXplU2hlZXRzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9hbmFseXplU2hlZXRzU3RlcFwifSxcImNsb3NlUHJvZ3Jlc3NTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2Nsb3NlUHJvZ3Jlc3NTdGVwXCJ9LFwiY29tcHJlaGVuZFdvcmtib29rU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9jb21wcmVoZW5kV29ya2Jvb2tTdGVwXCJ9LFwiZW1pdFByb2dyZXNzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9lbWl0UHJvZ3Jlc3NTdGVwXCJ9LFwiZXh0cmFjdFNoZWV0c1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZXh0cmFjdFNoZWV0c1N0ZXBcIn0sXCJnZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcFwifSxcImdlbmVyYXRlRGFzaGJvYXJkU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZURhc2hib2FyZFN0ZXBcIn0sXCJnZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXBcIn0sXCJsb2FkV29ya2Jvb2tTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2xvYWRXb3JrYm9va1N0ZXBcIn0sXCJwb3B1bGF0ZVByb2plY3Rpb25zU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9wb3B1bGF0ZVByb2plY3Rpb25zU3RlcFwifSxcInJlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9yZWdpc3RlckR5bmFtaWNQYWdlc1N0ZXBcIn0sXCJzYXZlU25pcHBldHNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NhdmVTbmlwcGV0c1N0ZXBcIn0sXCJzYXZlV29ya2Jvb2tGb3JtdWxhTWFwU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zYXZlV29ya2Jvb2tGb3JtdWxhTWFwU3RlcFwifSxcInNlbGVjdFRlbXBsYXRlU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zZWxlY3RUZW1wbGF0ZVN0ZXBcIn0sXCJ1cHNlcnRTaGVldFBhZ2VzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy91cHNlcnRTaGVldFBhZ2VzU3RlcFwifX19fSovO1xuLyoqIERldGVjdCB0aGUgZmlsZSBzaWduYXR1cmVzIG9mIHJlYWwgc3ByZWFkc2hlZXQgZmlsZXMgKHppcC94bHN4LCBCSUZGL3hscykuICovIGZ1bmN0aW9uIGhhc1NwcmVhZHNoZWV0TWFnaWMoZGF0YSkge1xuICAgIGNvbnN0IGIgPSBkYXRhO1xuICAgIC8vIFBLXFx4MDNcXHgwNCAoemlwIFx1MjE5MiB4bHN4KSBvciBQS1xceDA1XFx4MDYgKGVtcHR5IHppcClcbiAgICBpZiAoYlswXSA9PT0gMHg1MCAmJiBiWzFdID09PSAweDRiKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBEMCBDRiAxMSBFMCBBMSBCMSAxQSBFMSAoT0xFMiBjb21wb3VuZCBcdTIxOTIgLnhscylcbiAgICBpZiAoYlswXSA9PT0gMHhkMCAmJiBiWzFdID09PSAweGNmICYmIGJbMl0gPT09IDB4MTEgJiYgYlszXSA9PT0gMHhlMCAmJiBiWzRdID09PSAweGExICYmIGJbNV0gPT09IDB4YjEgJiYgYls2XSA9PT0gMHgxYSAmJiBiWzddID09PSAweGUxKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG4vKipcbiAqIENvbnZlcnQgcmF3IHVwbG9hZCBieXRlcyBpbnRvIHhsc3ggYnVmZmVycy5cbiAqXG4gKiBVaW50OEFycmF5IGlzIHNlcmlhbGl6YWJsZSBhY3Jvc3MgdGhlIHdvcmtmbG93IGJvdW5kYXJ5OyBCdWZmZXIgaXMgbm90XG4gKiBndWFyYW50ZWVkIGluIHdvcmtmbG93IHN0ZXAgc2FuZGJveGVzLCBzbyB3ZSBrZWVwIFVpbnQ4QXJyYXkgZXZlcnl3aGVyZVxuICogYW5kIGhhbmQgaXQgZGlyZWN0bHkgdG8gYHhsc3gucmVhZCh7IHR5cGU6ICdidWZmZXInIH0pYC5cbiAqXG4gKiBTaGVldEpTIGlzIGxlbmllbnQgd2l0aCBhcmJpdHJhcnkgdGV4dCAoaXQgcGFyc2VzIHBsYWluIHRleHQgYXMgYSAxLWNvbHVtblxuICogc2hlZXQpLCBzbyB3ZSB2YWxpZGF0ZSB0aGUgbWFnaWMgYnl0ZXMgQkVGT1JFIHBhcnNpbmcgdG8gY2F0Y2ggdXBsb2FkcyBvZlxuICogdGhlIHdyb25nIGZpbGUgdHlwZSB3aXRoIGEgY2xlYW4gRmF0YWxFcnJvci5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFdvcmtib29rU3RlcChmaWxlcykge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShmaWxlcykgfHwgZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdObyB3b3JrYm9vayBmaWxlcyB3ZXJlIHByb3ZpZGVkLicpO1xuICAgIH1cbiAgICByZXR1cm4gZmlsZXMubWFwKChmKT0+e1xuICAgICAgICBpZiAoIWYgfHwgdHlwZW9mIGYubmFtZSAhPT0gJ3N0cmluZycgfHwgIShmLmRhdGEgaW5zdGFuY2VvZiBVaW50OEFycmF5KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoJ0ludmFsaWQgZmlsZSBlbnRyeTogZXhwZWN0ZWQgeyBuYW1lLCBkYXRhOiBVaW50OEFycmF5IH0uJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGYuZGF0YS5ieXRlTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgV29ya2Jvb2sgXCIke2YubmFtZX1cIiBpcyBlbXB0eS5gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWhhc1NwcmVhZHNoZWV0TWFnaWMoZi5kYXRhKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYFdvcmtib29rIFwiJHtmLm5hbWV9XCIgaXMgbm90IGEgcmVhZGFibGUgLnhsc3gvLnhscyBmaWxlICh1bmV4cGVjdGVkIGZpbGUgc2lnbmF0dXJlKS5gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZi5kYXRhO1xuICAgIH0pO1xufVxuLyoqIEVYVFJBQ1Q6IHNlcmlhbGl6ZSBldmVyeSBzaGVldCB0byB0ZXh0ICsgc3RydWN0dXJhbCBzdGF0cy4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4dHJhY3RTaGVldHNTdGVwKGJ1ZmZlcnMpIHtcbiAgICBjb25zdCBhbGwgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGJ1ZiBvZiBidWZmZXJzKXtcbiAgICAgICAgbGV0IGV4dHJhY3RlZDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGV4dHJhY3RlZCA9IGV4dHJhY3RTaGVldHNXaXRoU3RhdHMoYnVmKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgV29ya2Jvb2sgaXMgbm90IGEgcmVhZGFibGUgLnhsc3ggZmlsZTogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgICAgIH1cbiAgICAgICAgYWxsLnB1c2goLi4uZXh0cmFjdGVkKTtcbiAgICB9XG4gICAgaWYgKGFsbC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoJ1dvcmtib29rIGNvbnRhaW5zIG5vIHJlYWRhYmxlIHNoZWV0cy4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGFsbDtcbn1cbi8qKiBBTkFMWVpFOiBkZXRlcm1pbmlzdGljIHByZS1wYXNzIHByb2R1Y2luZyBzdHJ1Y3R1cmVkIGhpbnRzLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gYW5hbHl6ZVNoZWV0c1N0ZXAoc2hlZXRzKSB7XG4gICAgcmV0dXJuIGFuYWx5emVTaGVldHMoc2hlZXRzKTtcbn1cbi8qKlxuICogRk9STVVMQSBNQVA6IGZpbmQgZXZlcnkgZm9ybXVsYSBjZWxsIGluIHRoZSBpbXBvcnRlZCB3b3JrYm9vayBhbmQgcGVyc2lzdFxuICogaXRzIHJlZmVyZW5jZXMgbWFwcGVkIHRvIHRoZSBEQi1zaGVldCBjb29yZGluYXRlcyAoY29sdW1uIGtleSArIGRhdGEgcm93XG4gKiBvZmZzZXQpIHRoYXQgdGhlIHNoZWV0IHZpZXdlciBzZXJ2ZXMsIHNvIGZvcm11bGFzIGNhbiBiZSBjb21wdXRlZCBhZ2FpbnN0XG4gKiB0aGUgZGF0YWJhc2Utc2F2ZWQgc2hlZXQgZGF0YS4gSWRlbXBvdGVudDogT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlV29ya2Jvb2tGb3JtdWxhTWFwU3RlcChidWZmZXJzLCBkYlVybCkge1xuICAgIGxldCB0b3RhbCA9IDA7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgd2IgPSByZWFkKGJ1ZmZlcnNbMF0sIHtcbiAgICAgICAgICAgIHR5cGU6ICdidWZmZXInLFxuICAgICAgICAgICAgY2VsbEZvcm11bGE6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGZvcm11bGFNYXAgPSBidWlsZFdvcmtib29rRm9ybXVsYU1hcCh3Yik7XG4gICAgICAgIHRvdGFsID0gT2JqZWN0LnZhbHVlcyhmb3JtdWxhTWFwKS5yZWR1Y2UoKG4sIHMpPT5uICsgcy5mb3JtdWxhcy5sZW5ndGgsIDApO1xuICAgICAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBrbm93bGVkZ2Vfc25pcHBldHMgKGlkLCBrZXksIGNhdGVnb3J5LCBjb250ZW50KVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICdjYWNoZScsICQyKVxuICAgICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudDtgLCBbXG4gICAgICAgICAgICAgICAgJ3dvcmtib29rX2Zvcm11bGFzJyxcbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShmb3JtdWxhTWFwKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBOb24tZmF0YWw6IHRoZSB3b3JrYm9va19kYXRhIHNuaXBwZXQgcmVtYWlucyB0aGUgc291cmNlIG9mIHRydXRoIGFuZCB0aGVcbiAgICAgICAgLy8gc2hlZXQtZGF0YSBBUEkgY29tcHV0ZXMgZm9ybXVsYSB2YWx1ZXMgb24gcmVhZCB3aGVuIHRoaXMgaXMgbWlzc2luZy5cbiAgICAgICAgY29uc29sZS53YXJuKCdbd29ya2Jvb2staW5nZXN0XSBGb3JtdWxhIG1hcCBzdGVwIHNraXBwZWQ6JywgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiB0b3RhbDtcbn1cbi8qKlxuICogQ09NUFJFSEVORDogb25lIE9wZW5BSSBjYWxsIChncHQtNG8sIGpzb25fb2JqZWN0LCBab2QtdmFsaWRhdGVkKSB3aXRoIHRoZVxuICogZGV0ZXJtaW5pc3RpYyBBTkFMWVNJUyBoaW50cyBpbmplY3RlZCBpbnRvIHRoZSBwcm9tcHQuXG4gKlxuICogUmV0cnkgcG9saWN5IChcdTAwQTc0LjIgb2YgdGhlIHJvYWRtYXApOlxuICogICAtIDQyOSAgICAgICAgICAgIFx1MjE5MiBSZXRyeWFibGVFcnJvcih7IHJldHJ5QWZ0ZXIgfSkgdXNpbmcgUmV0cnktQWZ0ZXIgaGVhZGVyIChmYWxsYmFjayAxcylcbiAqICAgLSA1eHggLyBuZXR3b3JrICBcdTIxOTIgcGxhaW4gRXJyb3IgXHUyMTkyIFNESyBhdXRvLXJldHJ5IChtYXggMylcbiAqICAgLSBtaXNzaW5nIGtleSAgICBcdTIxOTIgRmF0YWxFcnJvciAocGVybWFuZW50LCBubyByZXRyeSBzdG9ybSlcbiAqICAgLSBzY2hlbWEgcmVqZWN0ZWQgXHUyMTkyIHBsYWluIEVycm9yIFx1MjE5MiBTREsgYXV0by1yZXRyaWVzIChtb2RlbCBvdXRwdXQgaXMgc3RvY2hhc3RpY1xuICogICAgICAgICAgICAgICAgICAgICAgYXQgdGVtcGVyYXR1cmUgMC4yKTsgcnVuIGZhaWxzIHdpdGggYSBjbGVhciBtZXNzYWdlIGFmdGVyXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgU0RLJ3MgcmV0cnkgYnVkZ2V0IGlzIGV4aGF1c3RlZC5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcHJlaGVuZFdvcmtib29rU3RlcChzaGVldHMsIGhpbnRzLCBtb2RlbCA9ICdncHQtNG8nLCBvcGVuYWlBcGlLZXkpIHtcbiAgICBjb25zdCBhcGlLZXkgPSBvcGVuYWlBcGlLZXkgfHwgcHJvY2Vzcy5lbnYuT1BFTkFJX0FQSV9LRVk7XG4gICAgaWYgKCFhcGlLZXkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoJ09wZW5BSSBBUEkga2V5IG5vdCBjb25maWd1cmVkLiBTZXQgaXQgaW4gQ29uZmlnID4gT3BlbkFJIEtleSAodmlhIHRoZSByZXNlZWQgcm91dGUpIG9yIHNldCBPUEVOQUlfQVBJX0tFWSBlbnYgdmFyLicpO1xuICAgIH1cbiAgICBjb25zdCBibG9ja3MgPSBzaGVldHMubWFwKCh7IHRhYk5hbWUsIHRleHQgfSk9Pih7XG4gICAgICAgICAgICB0YWJOYW1lLFxuICAgICAgICAgICAgdGV4dFxuICAgICAgICB9KSk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IGNvbXByZWhlbmRPbmNlKGJsb2Nrcywge1xuICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICBoaW50cyxcbiAgICAgICAgICAgIGFwaUtleVxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIENvbXByZWhlbmRIdHRwRXJyb3IpIHtcbiAgICAgICAgICAgIGlmIChlcnIuc3RhdHVzID09PSA0MjkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXRyeUFmdGVyU2Vjb25kcyA9IGVyci5yZXRyeUFmdGVyU2Vjb25kcyA/PyAxO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSZXRyeWFibGVFcnJvcihlcnIubWVzc2FnZSwge1xuICAgICAgICAgICAgICAgICAgICByZXRyeUFmdGVyOiBgJHtyZXRyeUFmdGVyU2Vjb25kc31zYFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gNXh4IGV0YyBcdTIxOTIgcGxhaW4gRXJyb3IgXHUyMTkyIFNESyBhdXRvLXJldHJ5IChtYXggMylcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcikge1xuICAgICAgICAgICAgLy8gU2NoZW1hL0pTT04gcmVqZWN0aW9uIFx1MjAxNCB0aGUgbW9kZWwgbWF5IHByb2R1Y2UgdmFsaWQgb3V0cHV0IG9uIHJldHJ5LlxuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGVycjtcbiAgICB9XG59XG4vKipcbiAqIEVtaXQgYSBwcm9ncmVzcyBjaHVuayB0byB0aGUgcnVuJ3Mgd3JpdGFibGUgc3RyZWFtIChTU0UgcGF5bG9hZCkuXG4gKiBNdXN0IGJlIGEgc3RlcDogd29ya2Zsb3cgZnVuY3Rpb25zIGNhbm5vdCBpbnRlcmFjdCB3aXRoIHRoZSBzdHJlYW0gZGlyZWN0bHkuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVtaXRQcm9ncmVzc1N0ZXAod3JpdGFibGUsIGNodW5rKSB7XG4gICAgYXdhaXQgd3JpdGVQcm9ncmVzc0NodW5rKHdyaXRhYmxlLCBjaHVuayk7XG59XG4vKipcbiAqIENsb3NlIHRoZSBydW4ncyB3cml0YWJsZSBzdHJlYW0sIHNpZ25hbGluZyBjb21wbGV0aW9uIHRvIHN0cmVhbSByZWFkZXJzLlxuICogTXVzdCBiZSBhIHN0ZXA6IHdvcmtmbG93IGZ1bmN0aW9ucyBjYW5ub3QgaW50ZXJhY3Qgd2l0aCB0aGUgc3RyZWFtIGRpcmVjdGx5LlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbG9zZVByb2dyZXNzU3RlcCh3cml0YWJsZSkge1xuICAgIGF3YWl0IGNsb3NlUHJvZ3Jlc3NTdHJlYW0od3JpdGFibGUpO1xufVxuLy8gXHUyNTAwXHUyNTAwIFBoYXNlIDM6IFBPUFVMQVRFIHN0ZXBzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuLyoqXG4gKiBVcHNlcnQgZmluYW5jaWFsIHByb2plY3Rpb25zIGZyb20gdGhlIEFJIGNvbXByZWhlbnNpb24uXG4gKiBJZGVtcG90ZW50OiBPTiBDT05GTElDVCAocGVyaW9kLCBkYXRhX3R5cGUsIHNjZW5hcmlvKSBETyBVUERBVEUuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvcHVsYXRlUHJvamVjdGlvbnNTdGVwKGNvbXByZWhlbnNpb24sIGRiVXJsKSB7XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgZm9yIChjb25zdCBtZXRyaWMgb2YgY29tcHJlaGVuc2lvbi5wcm9qZWN0aW9ucyl7XG4gICAgICAgICAgICBjb25zdCB5ZWFyID0gTnVtYmVyKG1ldHJpYy5wZXJpb2Quc2xpY2UoMCwgNCkpO1xuICAgICAgICAgICAgY29uc3QgbW9udGggPSBOdW1iZXIobWV0cmljLnBlcmlvZC5zbGljZSg1LCA3KSk7XG4gICAgICAgICAgICBjb25zdCByZXZlbnVlID0gTWF0aC5yb3VuZChtZXRyaWMucmV2ZW51ZSA/PyAwKTtcbiAgICAgICAgICAgIGNvbnN0IGViaXRkYSA9IE1hdGgucm91bmQobWV0cmljLmViaXRkYSA/PyAwKTtcbiAgICAgICAgICAgIGNvbnN0IG5ldEluY29tZSA9IE1hdGgucm91bmQobWV0cmljLm5ldEluY29tZSA/PyAwKTtcbiAgICAgICAgICAgIGNvbnN0IGd1ZXN0cyA9IE1hdGgucm91bmQobWV0cmljLmd1ZXN0cyA/PyAwKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YWZmQ29zdCA9IE1hdGgucm91bmQobWV0cmljLnN0YWZmQ29zdCA/PyAwKTtcbiAgICAgICAgICAgIGNvbnN0IHBubExpbmVzID0gSlNPTi5zdHJpbmdpZnkoW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAncmV2ZW51ZScsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUmV2ZW51ZScsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZXZlbnVlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ2ViaXRkYScsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRUJJVERBJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGViaXRkYVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICduZXRfaW5jb21lJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdOZXQgSW5jb21lJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG5ldEluY29tZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdzdGFmZl9jb3N0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdGFmZiBDb3N0JyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHN0YWZmQ29zdFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdndWVzdHMnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0d1ZXN0cycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBndWVzdHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBmaW5hbmNpYWxfcHJvamVjdGlvbnMgKHBlcmlvZCwgeWVhciwgbW9udGgsIGRhdGFfdHlwZSwgc2NlbmFyaW8sIHJldmVudWUsIGViaXRkYSwgbmV0X2luY29tZSwgZ3Vlc3RzLCBzdGFmZl9jb3N0LCBwbmxfbGluZXMpXG4gICAgICAgICBWQUxVRVMgKCQxLCAkMiwgJDMsICQ0LCAkNSwgJDYsICQ3LCAkOCwgJDksICQxMCwgJDExOjpqc29uYilcbiAgICAgICAgIE9OIENPTkZMSUNUIChwZXJpb2QsIGRhdGFfdHlwZSwgc2NlbmFyaW8pXG4gICAgICAgICBETyBVUERBVEUgU0VUXG4gICAgICAgICAgIHJldmVudWUgPSBFWENMVURFRC5yZXZlbnVlLFxuICAgICAgICAgICBlYml0ZGEgPSBFWENMVURFRC5lYml0ZGEsXG4gICAgICAgICAgIG5ldF9pbmNvbWUgPSBFWENMVURFRC5uZXRfaW5jb21lLFxuICAgICAgICAgICBndWVzdHMgPSBFWENMVURFRC5ndWVzdHMsXG4gICAgICAgICAgIHN0YWZmX2Nvc3QgPSBFWENMVURFRC5zdGFmZl9jb3N0LFxuICAgICAgICAgICBwbmxfbGluZXMgPSBFWENMVURFRC5wbmxfbGluZXM7YCwgW1xuICAgICAgICAgICAgICAgIG1ldHJpYy5wZXJpb2QsXG4gICAgICAgICAgICAgICAgeWVhcixcbiAgICAgICAgICAgICAgICBtb250aCxcbiAgICAgICAgICAgICAgICBtZXRyaWMuZGF0YVR5cGUsXG4gICAgICAgICAgICAgICAgbWV0cmljLnNjZW5hcmlvLFxuICAgICAgICAgICAgICAgIHJldmVudWUsXG4gICAgICAgICAgICAgICAgZWJpdGRhLFxuICAgICAgICAgICAgICAgIG5ldEluY29tZSxcbiAgICAgICAgICAgICAgICBndWVzdHMsXG4gICAgICAgICAgICAgICAgc3RhZmZDb3N0LFxuICAgICAgICAgICAgICAgIHBubExpbmVzXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY291bnQ7XG59XG4vKiogTm9ybWFsaXplIGEgc2hlZXQgdGFiIG5hbWUgaW50byBhIFVSTC1zYWZlIHNsdWcuICovIGZ1bmN0aW9uIG5vcm1hbGl6ZVNsdWcobmFtZSkge1xuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvWyZdL2csICdhbmQnKS5yZXBsYWNlKC9bXFxzXSsvZywgJy0nKS5yZXBsYWNlKC9bXmEtejAtOS1dL2csICcnKS5yZXBsYWNlKC8tKy9nLCAnLScpLnJlcGxhY2UoL14tfC0kL2csICcnKTtcbn1cbi8qKiBQYWdlIGJsb2NrcyBwZXIgc2hlZXQgY2F0ZWdvcnkgKG1pcnJvcnMgcGlwZWxpbmUudHMgQ0FURUdPUllfQkxPQ0tTKS4gKi8gY29uc3QgU0hFRVRfQ0FURUdPUllfQkxPQ0tTID0ge1xuICAgIGRhaWx5X3NhbGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3NoZWV0X3ZpZXdlcicsXG4gICAgICAgICAgICB0aXRsZTogJ0RhaWx5IFNhbGVzIFx1MjAxNCBEYXRhJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdEYWlseSBTYWxlcyBcdTIwMTQgVHJlbmRzJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBwcm9maXRfbG9zczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdwbmxfdGFibGUnLFxuICAgICAgICAgICAgdGl0bGU6ICdQcm9maXQgJiBMb3NzIFx1MjAxNCBTdGF0ZW1lbnQnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXJ0X2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICB0aXRsZTogJ1Byb2ZpdCAmIExvc3MgXHUyMDE0IFRyZW5kcydcbiAgICAgICAgfVxuICAgIF0sXG4gICAgYmFsYW5jZV9zaGVldDogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdCYWxhbmNlIFNoZWV0IFx1MjAxNCBEYXRhJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICB0cmlhbF9iYWxhbmNlOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3NoZWV0X3ZpZXdlcicsXG4gICAgICAgICAgICB0aXRsZTogJ1RyaWFsIEJhbGFuY2UgXHUyMDE0IERhdGEnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIGdlbmVyYWxfbGVkZ2VyOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3NoZWV0X3ZpZXdlcicsXG4gICAgICAgICAgICB0aXRsZTogJ0dlbmVyYWwgTGVkZ2VyIFx1MjAxNCBEYXRhJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBjb3N0X29mX3NhbGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3NoZWV0X3ZpZXdlcicsXG4gICAgICAgICAgICB0aXRsZTogJ0Nvc3Qgb2YgU2FsZXMgXHUyMDE0IERhdGEnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIG1vbnRoX29uX21vbnRoOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXJ0X2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICB0aXRsZTogJ01vbnRoIG9uIE1vbnRoIFx1MjAxNCBDb21wYXJpc29uJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBicmVha19ldmVuOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ2twaV9jYXJkcycsXG4gICAgICAgICAgICB0aXRsZTogJ0JyZWFrLUV2ZW4gXHUyMDE0IEtQSXMnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXJ0X2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICB0aXRsZTogJ0JyZWFrLUV2ZW4gXHUyMDE0IFRyZW5kJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICB2YXJpYW5jZTogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdNb250aGx5IFZhcmlhbmNlIFx1MjAxNCBBbmFseXNpcydcbiAgICAgICAgfVxuICAgIF0sXG4gICAgc3VtbWFyeV9wbDogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdNdWx0aS1ZZWFyIFAmTCBcdTIwMTQgVHJlbmQnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3BubF90YWJsZScsXG4gICAgICAgICAgICB0aXRsZTogJ011bHRpLVllYXIgUCZMIFx1MjAxNCBTdGF0ZW1lbnQnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIHN1bW1hcnlfYnM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTXVsdGktWWVhciBCYWxhbmNlIFNoZWV0IFx1MjAxNCBEYXRhJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBvdGhlcjogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdTaGVldCBEYXRhJ1xuICAgICAgICB9XG4gICAgXVxufTtcbi8qKlxuICogQ3JlYXRlL3VwZGF0ZSBkeW5hbWljIGFwcCBwYWdlcyArIHBhZ2Ugc2VjdGlvbnMgZm9yIGVhY2ggY29tcHJlaGVuZGVkIHNoZWV0LlxuICpcbiAqIFx1MDBBNzcuMSBGSVg6IE9OIENPTkZMSUNUIChzbHVnKSBETyBVUERBVEUgLi4uIFJFVFVSTklORyBpZCBlbnN1cmVzIHdlIGFsd2F5c1xuICogaGF2ZSB0aGUgY29ycmVjdCBwYWdlIElEIChuZXcgb3IgZXhpc3RpbmcpLiBQYWdlIHNlY3Rpb25zIGFyZSBkZWxldGVkIGFuZFxuICogcmUtaW5zZXJ0ZWQgc2NvcGVkIHRvIHRoYXQgaWQgXHUyMDE0IG5vIG9ycGhhbiBGSyByZWZlcmVuY2VzLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cHNlcnRTaGVldFBhZ2VzU3RlcChjb21wcmVoZW5zaW9uLCBkYlVybCwgdGVuYW50U2x1Zykge1xuICAgIGNvbnN0IGNyZWF0ZWQgPSBbXTtcbiAgICBsZXQgc29ydE9yZGVyID0gMTAwO1xuICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICBmb3IgKGNvbnN0IHNoZWV0IG9mIGNvbXByZWhlbnNpb24uc2hlZXRzKXtcbiAgICAgICAgICAgIGNvbnN0IHNsdWcgPSBgc2hlZXQtJHtub3JtYWxpemVTbHVnKHNoZWV0LnRhYk5hbWUpfWA7XG4gICAgICAgICAgICBjb25zdCBibG9ja3MgPSBTSEVFVF9DQVRFR09SWV9CTE9DS1Nbc2hlZXQuY2F0ZWdvcnldID8/IFNIRUVUX0NBVEVHT1JZX0JMT0NLUy5vdGhlcjtcbiAgICAgICAgICAgIC8vIFx1MDBBNzcuMSBmaXg6IFJFVFVSTklORyBpZCBnaXZlcyB1cyB0aGUgcmVhbCBwYWdlIElEIG9uIGluc2VydCBPUiBjb25mbGljdC5cbiAgICAgICAgICAgIGNvbnN0IHBhZ2VSb3dzID0gYXdhaXQgcXVlcnlSb3dzKGRiLCBgSU5TRVJUIElOVE8gYXBwX3BhZ2VzIChpZCwgc2x1ZywgdGl0bGUsIGF1dGhfdGllciwgc29ydF9vcmRlciwgbmF2X2xhYmVsLCBzaG93X2luX25hdiwgdGVuYW50X3NsdWcpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJDIsICdnb29nbGUnLCAkMywgJDQsIHRydWUsICQ1KVxuICAgICAgICAgT04gQ09ORkxJQ1QgKHNsdWcpIERPIFVQREFURSBTRVRcbiAgICAgICAgICAgdGl0bGUgPSBFWENMVURFRC50aXRsZSxcbiAgICAgICAgICAgYXV0aF90aWVyID0gRVhDTFVERUQuYXV0aF90aWVyLFxuICAgICAgICAgICBzb3J0X29yZGVyID0gRVhDTFVERUQuc29ydF9vcmRlcixcbiAgICAgICAgICAgbmF2X2xhYmVsID0gRVhDTFVERUQubmF2X2xhYmVsLFxuICAgICAgICAgICBzaG93X2luX25hdiA9IEVYQ0xVREVELnNob3dfaW5fbmF2LFxuICAgICAgICAgICB0ZW5hbnRfc2x1ZyA9IENPQUxFU0NFKEVYQ0xVREVELnRlbmFudF9zbHVnLCBhcHBfcGFnZXMudGVuYW50X3NsdWcpXG4gICAgICAgICBSRVRVUk5JTkcgaWQ7YCwgW1xuICAgICAgICAgICAgICAgIHNsdWcsXG4gICAgICAgICAgICAgICAgc2hlZXQudGl0bGUsXG4gICAgICAgICAgICAgICAgc29ydE9yZGVyKyssXG4gICAgICAgICAgICAgICAgc2hlZXQudGl0bGUsXG4gICAgICAgICAgICAgICAgdGVuYW50U2x1ZyA/PyBudWxsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvbnN0IHBhZ2VJZCA9IHBhZ2VSb3dzWzBdPy5pZDtcbiAgICAgICAgICAgIGlmICghcGFnZUlkKSBjb250aW51ZTtcbiAgICAgICAgICAgIC8vIFJlcGxhY2Ugc2VjdGlvbnMgZm9yIHRoaXMgcGFnZSAoaWRlbXBvdGVudCBvbiByZXRyeSkuXG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgREVMRVRFIEZST00gcGFnZV9zZWN0aW9ucyBXSEVSRSBwYWdlX2lkID0gJDE7YCwgW1xuICAgICAgICAgICAgICAgIHBhZ2VJZFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb25zdCBzdW1tYXJ5TWFya2Rvd24gPSBbXG4gICAgICAgICAgICAgICAgYCMgJHtzaGVldC50aXRsZX1gLFxuICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgIHNoZWV0LnN1bW1hcnksXG4gICAgICAgICAgICAgICAgc2hlZXQucGVyaW9kSGludCA/IGBcXG4qKlBlcmlvZCoqOiAke3NoZWV0LnBlcmlvZEhpbnR9YCA6ICcnLFxuICAgICAgICAgICAgICAgIGAqKlJvd3MqKjogJHtzaGVldC5yb3dDb3VudCA/PyAnXHUyMDE0J30gIHwgICoqQ29sdW1ucyoqOiAkeyhzaGVldC5jb2x1bW5zID8/IFtdKS5sZW5ndGggfHwgJ1x1MjAxNCd9YCxcbiAgICAgICAgICAgICAgICAnJ1xuICAgICAgICAgICAgXS5maWx0ZXIoKGwpPT5sICE9PSAnJykuam9pbignXFxuJyk7XG4gICAgICAgICAgICAvLyBkb2NfbWFya2Rvd24gYmxvY2tcbiAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBwYWdlX3NlY3Rpb25zIChpZCwgcGFnZV9pZCwgc29ydF9vcmRlciwgYmxvY2tfdHlwZSwgY29uZmlnKVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsIDAsICdkb2NfbWFya2Rvd24nLCAkMjo6anNvbmIpO2AsIFtcbiAgICAgICAgICAgICAgICBwYWdlSWQsXG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0Fib3V0IHRoaXMgc2hlZXQnLFxuICAgICAgICAgICAgICAgICAgICBtYXJrZG93bjogc3VtbWFyeU1hcmtkb3duXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgLy8gQ2F0ZWdvcnktc3BlY2lmaWMgYmxvY2tzXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgYmxvY2tzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICBjb25zdCBibG9jayA9IGJsb2Nrc1tpXTtcbiAgICAgICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gcGFnZV9zZWN0aW9ucyAoaWQsIHBhZ2VfaWQsIHNvcnRfb3JkZXIsIGJsb2NrX3R5cGUsIGNvbmZpZylcbiAgICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICQyLCAkMywgJDQ6Ompzb25iKTtgLCBbXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgaSArIDEsXG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLmJsb2NrVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hlZXQ6IHNoZWV0LnRhYk5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogYmxvY2sudGl0bGVcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNyZWF0ZWQucHVzaCh7XG4gICAgICAgICAgICAgICAgc2x1ZyxcbiAgICAgICAgICAgICAgICB0aXRsZTogc2hlZXQudGl0bGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIEF1dG8tcG9wdWxhdGUgbmF2aWdhdGlvbl9pdGVtczogYWRkIGVhY2ggc2hlZXQgcGFnZSBhcyBhIGNoaWxkIG9mIHRoZSBcIkV4Y2VsXCIgZm9sZGVyLlxuICAgICAgICAvLyBGaW5kIHRoZSBFeGNlbCBmb2xkZXIgZmlyc3QsIG9yIGNyZWF0ZSBpdCBpZiBpdCBkb2Vzbid0IGV4aXN0IHlldC5cbiAgICAgICAgY29uc3QgZXhjZWxGb2xkZXIgPSBhd2FpdCBxdWVyeVJvd3MoZGIsIGBTRUxFQ1QgaWQgRlJPTSBuYXZpZ2F0aW9uX2l0ZW1zIFdIRVJFIHRpdGxlID0gJDEgQU5EIHBhcmVudF9pZCBJUyBOVUxMIExJTUlUIDFgLCBbXG4gICAgICAgICAgICAnRXhjZWwnXG4gICAgICAgIF0pO1xuICAgICAgICBsZXQgZXhjZWxJZCA9IGV4Y2VsRm9sZGVyWzBdPy5pZDtcbiAgICAgICAgaWYgKCFleGNlbElkKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIEV4Y2VsIGZvbGRlciBpZiBpdCBkb2Vzbid0IGV4aXN0IHlldFxuICAgICAgICAgICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IHF1ZXJ5Um93cyhkYiwgYElOU0VSVCBJTlRPIG5hdmlnYXRpb25faXRlbXMgKGlkLCBwYXJlbnRfaWQsIHNvcnRfb3JkZXIsIHRpdGxlLCBwYXRoLCBpY29uLCBhdXRoX3RpZXIsIHJlcXVpcmVkX2dyb3VwcywgaXNfdmlzaWJsZSwgaXNfZHluYW1pYylcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsIE5VTEwsIChTRUxFQ1QgQ09BTEVTQ0UoTUFYKHNvcnRfb3JkZXIpLCAwKSArIDEgRlJPTSBuYXZpZ2F0aW9uX2l0ZW1zIFdIRVJFIHBhcmVudF9pZCBJUyBOVUxMKSxcbiAgICAgICAgICdFeGNlbCcsICcvZXhjZWwnLCAnRm9sZGVyJywgQ0FTVCgnZ29vZ2xlJyBBUyBcIkF1dGhUaWVyXCIpLCAndmlld2VyLG9wcy1hZG1pbixmaW5hbmNlLHBsYXRmb3JtLWFkbWluJywgdHJ1ZSwgdHJ1ZSlcbiAgICAgICAgIFJFVFVSTklORyBpZGApO1xuICAgICAgICAgICAgZXhjZWxJZCA9IGNyZWF0ZWRbMF0/LmlkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChleGNlbElkKSB7XG4gICAgICAgICAgICBsZXQgbmF2U29ydCA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNoZWV0IG9mIGNvbXByZWhlbnNpb24uc2hlZXRzKXtcbiAgICAgICAgICAgICAgICBjb25zdCBzbHVnID0gYHNoZWV0LSR7bm9ybWFsaXplU2x1ZyhzaGVldC50YWJOYW1lKX1gO1xuICAgICAgICAgICAgICAgIC8vIFNraXAgaWYgYWxyZWFkeSBwcmVzZW50XG4gICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBxdWVyeVJvd3MoZGIsIGBTRUxFQ1QgaWQgRlJPTSBuYXZpZ2F0aW9uX2l0ZW1zIFdIRVJFIHBhdGggPSAkMSBBTkQgcGFyZW50X2lkID0gJDIgTElNSVQgMWAsIFtcbiAgICAgICAgICAgICAgICAgICAgYC8ke3NsdWd9YCxcbiAgICAgICAgICAgICAgICAgICAgZXhjZWxJZFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIGlmIChleGlzdGluZy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIG5hdmlnYXRpb25faXRlbXMgKGlkLCBwYXJlbnRfaWQsIHNvcnRfb3JkZXIsIHRpdGxlLCBwYXRoLCBpY29uLCBhdXRoX3RpZXIsIHJlcXVpcmVkX2dyb3VwcywgaXNfdmlzaWJsZSwgaXNfZHluYW1pYylcbiAgICAgICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJDIsICQzLCAkNCwgJ0Rlc2NyaXB0aW9uJywgQ0FTVCgnZ29vZ2xlJyBBUyBcIkF1dGhUaWVyXCIpLCAnJywgdHJ1ZSwgdHJ1ZSlgLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBleGNlbElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmF2U29ydCsrLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hlZXQudGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBgLyR7c2x1Z31gXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjcmVhdGVkO1xufVxuLyoqIFVwc2VydCBrbm93bGVkZ2Ugc25pcHBldHMgKGZ1bGwgY29tcHJlaGVuc2lvbiArIHBlci1zaGVldCBtYXJrZG93bikuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlU25pcHBldHNTdGVwKGNvbXByZWhlbnNpb24sIG1vZGVsLCBkYlVybCkge1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgIC8vIFJhdyBjb21wcmVoZW5zaW9uIEpTT04gKHVzZWQgYnkgQUkgY2hhdCAvIHJlcHJvY2VzcykuXG4gICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBrbm93bGVkZ2Vfc25pcHBldHMgKGlkLCBrZXksIGNhdGVnb3J5LCBjb250ZW50KVxuICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAnZG9jdW1lbnQnLCAkMilcbiAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50O2AsIFtcbiAgICAgICAgICAgICd3b3JrYm9va19jb21wcmVoZW5zaW9uJyxcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBjb21wcmVoZW5kZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIGNvbXByZWhlbnNpb25cbiAgICAgICAgICAgIH0pXG4gICAgICAgIF0pO1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICAvLyBPbmUgaHVtYW4tcmVhZGFibGUgc25pcHBldCBwZXIgc2hlZXQuXG4gICAgICAgIGZvciAoY29uc3Qgc2hlZXQgb2YgY29tcHJlaGVuc2lvbi5zaGVldHMpe1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYHNoZWV0XyR7bm9ybWFsaXplU2x1ZyhzaGVldC50YWJOYW1lKX1gO1xuICAgICAgICAgICAgY29uc3QgbWFya2Rvd24gPSBbXG4gICAgICAgICAgICAgICAgYCMgJHtzaGVldC50aXRsZX1gLFxuICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgIHNoZWV0LnN1bW1hcnksXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgYCoqQ2F0ZWdvcnkqKjogJHtzaGVldC5jYXRlZ29yeX1gLFxuICAgICAgICAgICAgICAgIHNoZWV0LnBlcmlvZEhpbnQgPyBgKipQZXJpb2QqKjogJHtzaGVldC5wZXJpb2RIaW50fWAgOiAnJ1xuICAgICAgICAgICAgXS5maWx0ZXIoKGwpPT5sICE9PSAnJykuam9pbignXFxuJyk7XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjYXRlZ29yeSwgY29udGVudClcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAnc2hlZXQnLCAkMilcbiAgICAgICAgIE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQ7YCwgW1xuICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICBtYXJrZG93blxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvdW50O1xufVxuLyoqXG4gKiBEZXRlcm1pbmlzdGljIHRlbXBsYXRlLWZpdCBzY29yaW5nIChcdTAwQTc1LjUpLlxuICpcbiAqIFNjb3JlcyB0aGUgQUktc3VnZ2VzdGVkIHRlbXBsYXRlIGFnYWluc3QgdGhlIGNvbXByZWhlbmRlZCBzaGVldCBjYXRlZ29yaWVzLlxuICogTm8gZXh0ZXJuYWwgaW1wb3J0cyBcdTIwMTQgYWxsIHRlbXBsYXRlIGRhdGEgaXMgaGFyZGNvZGVkIHRvIGtlZXAgdGhlIGJ1bmRsZSBsZWFuLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWxlY3RUZW1wbGF0ZVN0ZXAoY29tcHJlaGVuc2lvbikge1xuICAgIGNvbnN0IGFpVGVtcGxhdGUgPSBjb21wcmVoZW5zaW9uLnRlbXBsYXRlO1xuICAgIGNvbnN0IGFpQ29uZmlkZW5jZSA9IGFpVGVtcGxhdGU/LmNvbmZpZGVuY2UgPz8gMC41O1xuICAgIGNvbnN0IHNoZWV0Q2F0ZWdvcmllcyA9IGNvbXByZWhlbnNpb24uc2hlZXRzLm1hcCgocyk9PnMuY2F0ZWdvcnkpO1xuICAgIC8vIENhdGVnb3J5IHByb2ZpbGUgcGVyIHRlbXBsYXRlICh3aGljaCBzaGVldCBjYXRlZ29yaWVzIG1hdGNoIGJlc3QpLlxuICAgIGNvbnN0IHRlbXBsYXRlUHJvZmlsZXMgPSB7XG4gICAgICAgICdmaW5hbmNpYWwtYW5hbHl0aWNzJzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICdicmVha19ldmVuJyxcbiAgICAgICAgICAgICAgICAndmFyaWFuY2UnLFxuICAgICAgICAgICAgICAgICd0cmlhbF9iYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnc3VtbWFyeV9wbCcsXG4gICAgICAgICAgICAgICAgJ3N1bW1hcnlfYnMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnZmluYW5jaWFsJyxcbiAgICAgICAgICAgICAgICAncG5sJyxcbiAgICAgICAgICAgICAgICAncHJvZml0JyxcbiAgICAgICAgICAgICAgICAnbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdicmVhayBldmVuJyxcbiAgICAgICAgICAgICAgICAnYmVwJyxcbiAgICAgICAgICAgICAgICAndmFyaWFuY2UnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3RhdXJhbnQ6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAnZGFpbHlfc2FsZXMnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJyxcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdicmVha19ldmVuJyxcbiAgICAgICAgICAgICAgICAnbW9udGhfb25fbW9udGgnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAncmVzdGF1cmFudCcsXG4gICAgICAgICAgICAgICAgJ2tpdGNoZW4nLFxuICAgICAgICAgICAgICAgICdtZW51JyxcbiAgICAgICAgICAgICAgICAnZm9vZCcsXG4gICAgICAgICAgICAgICAgJ2JldmVyYWdlJyxcbiAgICAgICAgICAgICAgICAnY292ZXJzJyxcbiAgICAgICAgICAgICAgICAnZ3Vlc3RzJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBob3RlbDoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdkYWlseV9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnbW9udGhfb25fbW9udGgnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2hvdGVsJyxcbiAgICAgICAgICAgICAgICAncm9vbXMnLFxuICAgICAgICAgICAgICAgICdvY2N1cGFuY3knLFxuICAgICAgICAgICAgICAgICdyZXZwYXInLFxuICAgICAgICAgICAgICAgICdob3VzZWtlZXBpbmcnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgICdlY29tbWVyY2UtcmV0YWlsJzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdkYWlseV9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2Vjb21tZXJjZScsXG4gICAgICAgICAgICAgICAgJ3JldGFpbCcsXG4gICAgICAgICAgICAgICAgJ29ubGluZScsXG4gICAgICAgICAgICAgICAgJ3NrdScsXG4gICAgICAgICAgICAgICAgJ2NhcnQnLFxuICAgICAgICAgICAgICAgICdjb252ZXJzaW9uJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBoZWFsdGhjYXJlOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnaGVhbHRoJyxcbiAgICAgICAgICAgICAgICAncGF0aWVudCcsXG4gICAgICAgICAgICAgICAgJ2NsaW5pYycsXG4gICAgICAgICAgICAgICAgJ21lZGljYWwnLFxuICAgICAgICAgICAgICAgICdwaGFybWFjeSdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgJ3N1cHBseS1jaGFpbic6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJyxcbiAgICAgICAgICAgICAgICAndmFyaWFuY2UnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0J1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ3N1cHBseScsXG4gICAgICAgICAgICAgICAgJ2xvZ2lzdGljcycsXG4gICAgICAgICAgICAgICAgJ2ludmVudG9yeScsXG4gICAgICAgICAgICAgICAgJ3dhcmVob3VzZScsXG4gICAgICAgICAgICAgICAgJ3NoaXBwaW5nJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICAncmVhbC1lc3RhdGUnOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgICAgICAgICAgICAgJ3N1bW1hcnlfYnMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAncmVhbCBlc3RhdGUnLFxuICAgICAgICAgICAgICAgICdwcm9wZXJ0eScsXG4gICAgICAgICAgICAgICAgJ2xlYXNlJyxcbiAgICAgICAgICAgICAgICAncmVudCcsXG4gICAgICAgICAgICAgICAgJ21vcnRnYWdlJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBlZHVjYXRpb246IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdtb250aF9vbl9tb250aCdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdlZHVjYXRpb24nLFxuICAgICAgICAgICAgICAgICdzdHVkZW50JyxcbiAgICAgICAgICAgICAgICAndHVpdGlvbicsXG4gICAgICAgICAgICAgICAgJ2NvdXJzZScsXG4gICAgICAgICAgICAgICAgJ2Vucm9sbG1lbnQnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgICdwcm9mZXNzaW9uYWwtc2VydmljZXMnOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnY29uc3VsdGluZycsXG4gICAgICAgICAgICAgICAgJ3NlcnZpY2VzJyxcbiAgICAgICAgICAgICAgICAnYmlsbGluZycsXG4gICAgICAgICAgICAgICAgJ2NsaWVudCcsXG4gICAgICAgICAgICAgICAgJ3Byb2plY3QnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIG1hbnVmYWN0dXJpbmc6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ21hbnVmYWN0dXJpbmcnLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0aW9uJyxcbiAgICAgICAgICAgICAgICAnZmFjdG9yeScsXG4gICAgICAgICAgICAgICAgJ2JpbGwgb2YgbWF0ZXJpYWxzJyxcbiAgICAgICAgICAgICAgICAnd29yayBvcmRlcidcbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgIH07XG4gICAgZnVuY3Rpb24gY2F0ZWdvcnlPdmVybGFwKHRtcGxJZCkge1xuICAgICAgICBjb25zdCBwcm9maWxlID0gdGVtcGxhdGVQcm9maWxlc1t0bXBsSWRdO1xuICAgICAgICBpZiAoIXByb2ZpbGUpIHJldHVybiAwO1xuICAgICAgICBjb25zdCBtYXRjaGVzID0gc2hlZXRDYXRlZ29yaWVzLmZpbHRlcigoYyk9PnByb2ZpbGUuY2F0ZWdvcmllcy5pbmNsdWRlcyhjKSk7XG4gICAgICAgIHJldHVybiBzaGVldENhdGVnb3JpZXMubGVuZ3RoID4gMCA/IG1hdGNoZXMubGVuZ3RoIC8gc2hlZXRDYXRlZ29yaWVzLmxlbmd0aCA6IDA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGtleXdvcmRNYXRjaCh0bXBsSWQpIHtcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IHRlbXBsYXRlUHJvZmlsZXNbdG1wbElkXTtcbiAgICAgICAgaWYgKCFwcm9maWxlKSByZXR1cm4gMDtcbiAgICAgICAgY29uc3QgdGV4dCA9IFtcbiAgICAgICAgICAgIGNvbXByZWhlbnNpb24ud29ya2Jvb2sudGl0bGUsXG4gICAgICAgICAgICBjb21wcmVoZW5zaW9uLndvcmtib29rLnN1bW1hcnksXG4gICAgICAgICAgICBjb21wcmVoZW5zaW9uLndvcmtib29rLmNvbXBhbnkgPz8gJydcbiAgICAgICAgXS5qb2luKCcgJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHByb2ZpbGUua2V5d29yZHMuZmlsdGVyKChrdyk9PnRleHQuaW5jbHVkZXMoa3cpKTtcbiAgICAgICAgcmV0dXJuIHByb2ZpbGUua2V5d29yZHMubGVuZ3RoID4gMCA/IG1hdGNoZXMubGVuZ3RoIC8gcHJvZmlsZS5rZXl3b3Jkcy5sZW5ndGggOiAwO1xuICAgIH1cbiAgICAvLyBTY29yZSB0aGUgQUktc3VnZ2VzdGVkIHRlbXBsYXRlLlxuICAgIGNvbnN0IHN1Z2dlc3RlZFNjb3JlID0gYWlUZW1wbGF0ZT8uaWQgPyBhaUNvbmZpZGVuY2UgKiAoY2F0ZWdvcnlPdmVybGFwKGFpVGVtcGxhdGUuaWQpICogMC43ICsga2V5d29yZE1hdGNoKGFpVGVtcGxhdGUuaWQpICogMC4zKSA6IC0xO1xuICAgIC8vIFNjb3JlIGFsbCB0ZW1wbGF0ZXMgZm9yIGFsdGVybmF0aXZlcy5cbiAgICBjb25zdCBhbGxTY29yZXMgPSBPYmplY3Qua2V5cyh0ZW1wbGF0ZVByb2ZpbGVzKS5tYXAoKGlkKT0+KHtcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgc2NvcmU6IGNhdGVnb3J5T3ZlcmxhcChpZCkgKiAwLjcgKyBrZXl3b3JkTWF0Y2goaWQpICogMC4zLFxuICAgICAgICAgICAgcmVhc29uOiBgJHtNYXRoLnJvdW5kKGNhdGVnb3J5T3ZlcmxhcChpZCkgKiAxMDApfSUgY2F0ZWdvcnkgbWF0Y2gsICR7TWF0aC5yb3VuZChrZXl3b3JkTWF0Y2goaWQpICogMTAwKX0lIGtleXdvcmQgbWF0Y2hgXG4gICAgICAgIH0pKTtcbiAgICBhbGxTY29yZXMuc29ydCgoYSwgYik9PmIuc2NvcmUgLSBhLnNjb3JlKTtcbiAgICBjb25zdCByZWNvbW1lbmRlZCA9IHN1Z2dlc3RlZFNjb3JlID4gYWxsU2NvcmVzWzBdLnNjb3JlID8gYWlUZW1wbGF0ZS5pZCA6IGFsbFNjb3Jlc1swXS5pZDtcbiAgICBjb25zdCByZWNvbW1lbmRlZFNjb3JlID0gcmVjb21tZW5kZWQgPT09IGFpVGVtcGxhdGU/LmlkID8gc3VnZ2VzdGVkU2NvcmUgOiBhbGxTY29yZXNbMF0uc2NvcmU7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVjb21tZW5kZWQsXG4gICAgICAgIGFpU3VnZ2VzdGlvbjogYWlUZW1wbGF0ZT8uaWQgPz8gbnVsbCxcbiAgICAgICAgYWlDb25maWRlbmNlLFxuICAgICAgICBzY29yZTogTWF0aC5yb3VuZChyZWNvbW1lbmRlZFNjb3JlICogMTAwKSAvIDEwMCxcbiAgICAgICAgcmVhc29uOiBhbGxTY29yZXNbMF0ucmVhc29uLFxuICAgICAgICBhbHRlcm5hdGl2ZXM6IGFsbFNjb3Jlcy5maWx0ZXIoKHMpPT5zLmlkICE9PSByZWNvbW1lbmRlZCkuc2xpY2UoMCwgMykubWFwKChzKT0+KHtcbiAgICAgICAgICAgICAgICBpZDogcy5pZCxcbiAgICAgICAgICAgICAgICBzY29yZTogTWF0aC5yb3VuZChzLnNjb3JlICogMTAwKSAvIDEwMFxuICAgICAgICAgICAgfSkpXG4gICAgfTtcbn1cbi8qKiBCZXN0LWVmZm9ydCByZWdpc3RlciBkeW5hbWljIHBhZ2VzIGluIHRoZSBydW50aW1lIGNhdGFsb2cuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWdpc3RlckR5bmFtaWNQYWdlc1N0ZXAoY29tcHJlaGVuc2lvbikge1xuICAgIC8vIHNldER5bmFtaWNQYWdlcyBpcyBhIHJ1bnRpbWUtc2lkZSBlZmZlY3Q7IGluIHRoZSB3b3JrZmxvdyBjb250ZXh0IHRoZVxuICAgIC8vIGNhdGFsb2cgcmVidWlsZHMgZnJvbSBEQiBhcHBfcGFnZXMgb24gbmV4dCByZXF1ZXN0LiBCZXN0LWVmZm9ydC5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHNldER5bmFtaWNQYWdlcyB9ID0gYXdhaXQgaW1wb3J0KCcuLi8uLi9zcmMvbGliL3BhZ2UtY2F0YWxvZycpO1xuICAgICAgICBjb25zdCBwYWdlcyA9IGNvbXByZWhlbnNpb24uc2hlZXRzLm1hcCgoc2hlZXQpPT4oe1xuICAgICAgICAgICAgICAgIHNsdWc6IGBzaGVldC0ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YCxcbiAgICAgICAgICAgICAgICB0aXRsZTogc2hlZXQudGl0bGUsXG4gICAgICAgICAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnLFxuICAgICAgICAgICAgICAgIG5hdkxhYmVsOiBzaGVldC50aXRsZSxcbiAgICAgICAgICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnZG9jX21hcmtkb3duJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogYHNoZWV0XyR7bm9ybWFsaXplU2x1ZyhzaGVldC50YWJOYW1lKX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBzaGVldC50aXRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAuLi4oU0hFRVRfQ0FURUdPUllfQkxPQ0tTW3NoZWV0LmNhdGVnb3J5XSA/PyBTSEVFVF9DQVRFR09SWV9CTE9DS1Mub3RoZXIpLm1hcCgoYik9Pih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tUeXBlOiBiLmJsb2NrVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hlZXQ6IHNoZWV0LnRhYk5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBiLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICBzZXREeW5hbWljUGFnZXMocGFnZXMpO1xuICAgICAgICByZXR1cm4gcGFnZXMubGVuZ3RoO1xuICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgLy8gUnVudGltZSBjYXRhbG9nIHVuYXZhaWxhYmxlIGluIHdvcmtmbG93IGNvbnRleHQgXHUyMDE0IG5vbi1jcml0aWNhbC5cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxufVxuLy8gXHUyNTAwXHUyNTAwIFBoYXNlIDU6IEdFTkVSQVRFIHN0ZXBzIChPcGVuQUkgXHUyMTkyIEJSIC8gRVMgLyBEYXNoYm9hcmQpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuLyoqIFBhcnNlIEJ1c2luZXNzIFJldmlldyBtYXJrZG93biBpbnRvIHBhcnQgc2VjdGlvbnMgKGxpZ2h0d2VpZ2h0IGlubGluZSBwYXJzZXIpLiAqLyBmdW5jdGlvbiBwYXJzZVJldmlld1BhcnRzKG1hcmtkb3duKSB7XG4gICAgY29uc3QgcGFydHMgPSBbXTtcbiAgICBjb25zdCBoZWFkZXJSZSA9IC9eI3syLDN9XFxzK1BhcnRcXHMrKFtBLVpdKTpcXHMqKC4rKSQvbTtcbiAgICBjb25zdCBzZWN0aW9ucyA9IG1hcmtkb3duLnNwbGl0KC9cXG4oPz0jezIsM31cXHMrUGFydFxccytbQS1aXTopLyk7XG4gICAgbGV0IHNvcnRPcmRlciA9IDA7XG4gICAgZm9yIChjb25zdCBzZWN0aW9uIG9mIHNlY3Rpb25zKXtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBoZWFkZXJSZS5leGVjKHNlY3Rpb24pO1xuICAgICAgICBpZiAoIW1hdGNoKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgWywgbGV0dGVyLCByYXdUaXRsZV0gPSBtYXRjaDtcbiAgICAgICAgY29uc3QgdGl0bGUgPSAocmF3VGl0bGUgPz8gc2VjdGlvbi5zcGxpdCgnXFxuJylbMF0/LnJlcGxhY2UoL14jezIsM31cXHMrUGFydFxccytbQS1aXTpcXHMqLywgJycpID8/ICcnKS50cmltKCk7XG4gICAgICAgIGNvbnN0IHNsdWcgPSBgcGFydC0keyhsZXR0ZXIgPz8gJ2EnKS50b0xvd2VyQ2FzZSgpfWA7XG4gICAgICAgIGNvbnN0IHBhcnRLZXkgPSBgcGFydF8keyhsZXR0ZXIgPz8gJ2EnKS50b0xvd2VyQ2FzZSgpfWA7XG4gICAgICAgIHBhcnRzLnB1c2goe1xuICAgICAgICAgICAgc2x1ZyxcbiAgICAgICAgICAgIHBhcnRLZXksXG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIHNvcnRPcmRlcjogc29ydE9yZGVyKyssXG4gICAgICAgICAgICBtYXJrZG93bjogc2VjdGlvbi50cmltKClcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwYXJ0cztcbn1cbi8qKlxuICogR2VuZXJhdGUgdGhlIEJ1c2luZXNzIFJldmlldyBmcm9tIGNvbXByZWhlbnNpb24gZGF0YS5cbiAqIFNhdmVzIHBhcnNlZCBwYXJ0cyB0byBidXNpbmVzc19yZXZpZXdfcGFydHMgdmlhIHBnLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcChjb21wcmVoZW5zaW9uLCBhcGlLZXksIGRiVXJsLCBtb2RlbCA9ICdncHQtNG8nKSB7XG4gICAgY29uc3QgcHJvbXB0ID0gYnVpbGRHZW5Qcm9tcHQoY29tcHJlaGVuc2lvbiwgJ2J1c2luZXNzUmV2aWV3Jyk7XG4gICAgbGV0IG1hcmtkb3duO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJ1lvdSBhcmUgYSBwcmVjaXNlIGZpbmFuY2lhbCBhbmFseXN0IGFuZCBidXNpbmVzcyB3cml0ZXIuIFJldHVybiBPTkxZIHZhbGlkIEpTT04uJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuMyxcbiAgICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAxNjM4NCxcbiAgICAgICAgICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2pzb25fb2JqZWN0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYE9wZW5BSSBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSlgKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBjb25zdCByZXBseSA9IHJlc3VsdC5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgPz8gJyc7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmVwbHkpO1xuICAgICAgICBtYXJrZG93biA9IHBhcnNlZC5idXNpbmVzc1JldmlldyA/PyAnJztcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCdXNpbmVzcyBSZXZpZXcgZ2VuZXJhdGlvbiBmYWlsZWQ6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgIH1cbiAgICBpZiAoIW1hcmtkb3duLnRyaW0oKSkgcmV0dXJuIDA7XG4gICAgY29uc3QgcGFydHMgPSBwYXJzZVJldmlld1BhcnRzKG1hcmtkb3duKTtcbiAgICBsZXQgc2F2ZWQgPSAwO1xuICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpe1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGJ1c2luZXNzX3Jldmlld19wYXJ0cyAoaWQsIHNsdWcsIHBhcnRfa2V5LCB0aXRsZSwgc29ydF9vcmRlciwgYXV0aF90aWVyLCBtYXJrZG93bilcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAkMiwgJDMsICQ0LCAnZ29vZ2xlJywgJDUpXG4gICAgICAgICBPTiBDT05GTElDVCAoc2x1ZykgRE8gVVBEQVRFIFNFVFxuICAgICAgICAgICBwYXJ0X2tleSA9IEVYQ0xVREVELnBhcnRfa2V5LFxuICAgICAgICAgICB0aXRsZSA9IEVYQ0xVREVELnRpdGxlLFxuICAgICAgICAgICBzb3J0X29yZGVyID0gRVhDTFVERUQuc29ydF9vcmRlcixcbiAgICAgICAgICAgbWFya2Rvd24gPSBFWENMVURFRC5tYXJrZG93bjtgLCBbXG4gICAgICAgICAgICAgICAgcGFydC5zbHVnLFxuICAgICAgICAgICAgICAgIHBhcnQucGFydEtleSxcbiAgICAgICAgICAgICAgICBwYXJ0LnRpdGxlLFxuICAgICAgICAgICAgICAgIHBhcnQuc29ydE9yZGVyLFxuICAgICAgICAgICAgICAgIHBhcnQubWFya2Rvd25cbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgc2F2ZWQrKztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzYXZlZDtcbn1cbi8qKlxuICogR2VuZXJhdGUgdGhlIEV4ZWN1dGl2ZSBTdW1tYXJ5IGZyb20gY29tcHJlaGVuc2lvbiBkYXRhLlxuICogU2F2ZXMgdG8ga25vd2xlZGdlX3NuaXBwZXRzIHZpYSBwZy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcChjb21wcmVoZW5zaW9uLCBhcGlLZXksIGRiVXJsLCBtb2RlbCA9ICdncHQtNG8nKSB7XG4gICAgY29uc3QgcHJvbXB0ID0gYnVpbGRHZW5Qcm9tcHQoY29tcHJlaGVuc2lvbiwgJ2V4ZWN1dGl2ZVN1bW1hcnknKTtcbiAgICBsZXQgbWFya2Rvd247XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAnWW91IGFyZSBhIHByZWNpc2UgZmluYW5jaWFsIGFuYWx5c3QgYW5kIGJ1c2luZXNzIHdyaXRlci4gUmV0dXJuIE9OTFkgdmFsaWQgSlNPTi4nXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHByb21wdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgICAgICAgICAgICAgIG1heF90b2tlbnM6IDE2Mzg0LFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlX2Zvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnanNvbl9vYmplY3QnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgT3BlbkFJIEFQSSBlcnJvciAoJHtyZXNwb25zZS5zdGF0dXN9KWApO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGNvbnN0IHJlcGx5ID0gcmVzdWx0LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudCA/PyAnJztcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyZXBseSk7XG4gICAgICAgIG1hcmtkb3duID0gcGFyc2VkLmV4ZWN1dGl2ZVN1bW1hcnkgPz8gJyc7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhlY3V0aXZlIFN1bW1hcnkgZ2VuZXJhdGlvbiBmYWlsZWQ6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgIH1cbiAgICBpZiAoIW1hcmtkb3duLnRyaW0oKSkgcmV0dXJuIGZhbHNlO1xuICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjYXRlZ29yeSwgY29udGVudClcbiAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAnZXhlY3V0aXZlX3N1bW1hcnknLCAnZG9jdW1lbnQnLCAkMSlcbiAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50O2AsIFtcbiAgICAgICAgICAgIG1hcmtkb3duXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgRGFzaGJvYXJkIERhdGEgZnJvbSBjb21wcmVoZW5zaW9uIGRhdGEuXG4gKiBTYXZlcyB0byBrbm93bGVkZ2Vfc25pcHBldHMgdmlhIHBnLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURhc2hib2FyZFN0ZXAoY29tcHJlaGVuc2lvbiwgYXBpS2V5LCBkYlVybCwgbW9kZWwgPSAnZ3B0LTRvJykge1xuICAgIGNvbnN0IHByb21wdCA9IGJ1aWxkR2VuUHJvbXB0KGNvbXByZWhlbnNpb24sICdkYXNoYm9hcmREYXRhJyk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAnWW91IGFyZSBhIHByZWNpc2UgZmluYW5jaWFsIGFuYWx5c3QuIFJldHVybiBPTkxZIHZhbGlkIEpTT04gd2l0aCBrZXlzIFwiYWN0aW9uUGhhc2VzXCIsIFwidGFyZ2V0Um93c1wiLCBhbmQgXCJsZXZlcnNcIi4nXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHByb21wdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgICAgICAgICAgICAgIG1heF90b2tlbnM6IDE2Mzg0LFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlX2Zvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnanNvbl9vYmplY3QnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgT3BlbkFJIEFQSSBlcnJvciAoJHtyZXNwb25zZS5zdGF0dXN9KWApO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGNvbnN0IHJlcGx5ID0gcmVzdWx0LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudCA/PyAnJztcbiAgICAgICAgaWYgKCFyZXBseSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJlcGx5KTtcbiAgICAgICAgaWYgKCFwYXJzZWQuYWN0aW9uUGhhc2VzICYmICFwYXJzZWQudGFyZ2V0Um93cyAmJiAhcGFyc2VkLmxldmVycykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBrbm93bGVkZ2Vfc25pcHBldHMgKGlkLCBrZXksIGNhdGVnb3J5LCBjb250ZW50KVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJ2Rhc2hib2FyZF9kYXRhJywgJ2RvY3VtZW50JywgJDEpXG4gICAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50O2AsIFtcbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShwYXJzZWQpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgLy8gRGFzaGJvYXJkIGlzIG5vbi1jcml0aWNhbCBcdTIwMTQgc3dhbGxvdyBlcnJvcnNcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbi8qKlxuICogQnVpbGQgYSBnZW5lcmF0aW9uIHByb21wdCBmcm9tIHRoZSB3b3JrYm9vayBjb21wcmVoZW5zaW9uLlxuICogTm8gZXh0ZXJuYWwgZGVwZW5kZW5jaWVzIFx1MjAxNCBwdXJlIGNvbXB1dGF0aW9uIGZyb20gdGhlIGNvbXByZWhlbnNpb24gc3RhdGUuXG4gKi8gZnVuY3Rpb24gYnVpbGRHZW5Qcm9tcHQoY29tcHJlaGVuc2lvbiwgdGFyZ2V0KSB7XG4gICAgY29uc3QgeyB3b3JrYm9vaywgc2hlZXRzLCBwcm9qZWN0aW9ucyB9ID0gY29tcHJlaGVuc2lvbjtcbiAgICBjb25zdCBjb250ZXh0ID0gW1xuICAgICAgICBgIyBHZW5lcmF0ZWQgQ29udGVudDogJHt0YXJnZXQgPT09ICdidXNpbmVzc1JldmlldycgPyAnQnVzaW5lc3MgUmV2aWV3JyA6IHRhcmdldCA9PT0gJ2V4ZWN1dGl2ZVN1bW1hcnknID8gJ0V4ZWN1dGl2ZSBTdW1tYXJ5JyA6ICdEYXNoYm9hcmQgRGF0YSd9YCxcbiAgICAgICAgJycsXG4gICAgICAgIGAjIyBXb3JrYm9vayBTdW1tYXJ5YCxcbiAgICAgICAgYCoqVGl0bGUqKjogJHt3b3JrYm9vay50aXRsZX1gLFxuICAgICAgICBgKipDb21wYW55Kio6ICR7d29ya2Jvb2suY29tcGFueSA/PyAnTi9BJ31gLFxuICAgICAgICBgKipQZXJpb2QqKjogJHt3b3JrYm9vay5wZXJpb2QgPz8gJ04vQSd9YCxcbiAgICAgICAgYCoqQ3VycmVuY3kqKjogJHt3b3JrYm9vay5jdXJyZW5jeSA/PyAnSURSJ31gLFxuICAgICAgICB3b3JrYm9vay5zdW1tYXJ5LFxuICAgICAgICAnJyxcbiAgICAgICAgYCMjIFNoZWV0IEludmVudG9yeSAoJHtzaGVldHMubGVuZ3RofSBzaGVldHMpYCxcbiAgICAgICAgLi4uc2hlZXRzLm1hcCgocyk9PmAtICoqJHtzLnRhYk5hbWV9KiogKCR7cy5jYXRlZ29yeX0pOiAke3MudGl0bGV9IFx1MjAxNCAke3Muc3VtbWFyeX0ke3MucGVyaW9kSGludCA/IGAgWyR7cy5wZXJpb2RIaW50fV1gIDogJyd9YCksXG4gICAgICAgICcnLFxuICAgICAgICBgIyMgQ29uc29saWRhdGVkIEZpbmFuY2lhbCBQcm9qZWN0aW9uc2AsXG4gICAgICAgICdgYGBqc29uJyxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkocHJvamVjdGlvbnMsIG51bGwsIDIpLFxuICAgICAgICAnYGBgJ1xuICAgIF0uam9pbignXFxuJyk7XG4gICAgaWYgKHRhcmdldCA9PT0gJ2J1c2luZXNzUmV2aWV3Jykge1xuICAgICAgICByZXR1cm4gYCR7Y29udGV4dH1cXG5cXG5HZW5lcmF0ZSBPTkxZIGEgXCJidXNpbmVzc1Jldmlld1wiIGRvY3VtZW50IGFzIGEgSlNPTiBvYmplY3Qgd2l0aCBhIHNpbmdsZSBrZXkgXCJidXNpbmVzc1Jldmlld1wiIGNvbnRhaW5pbmcgYSBjb21wcmVoZW5zaXZlIE1hcmtkb3duIGJ1c2luZXNzIHJldmlldy4gSW5jbHVkZSBzZWN0aW9ucyBmb3IgZWFjaCBwYXJ0IG9mIHRoZSBidXNpbmVzczogUGFydCBBOiBSZXZlbnVlICYgU2FsZXMsIFBhcnQgQjogQ29zdHMgJiBNYXJnaW5zLCBQYXJ0IEM6IFByb2ZpdGFiaWxpdHkgJiBFQklUREEsIFBhcnQgRDogQnJlYWstRXZlbiBBbmFseXNpcywgUGFydCBFOiBUcmVuZHMgJiBQcm9qZWN0aW9ucywgUGFydCBGOiBSaXNrcyAmIFJlY29tbWVuZGF0aW9ucy4gVXNlICMjIFBhcnQgWDogVGl0bGUgaGVhZGVycy4gSW5jbHVkZSBkYXRhIHRhYmxlcyBmcm9tIHRoZSBwcm9qZWN0aW9ucy5gO1xuICAgIH1cbiAgICBpZiAodGFyZ2V0ID09PSAnZXhlY3V0aXZlU3VtbWFyeScpIHtcbiAgICAgICAgcmV0dXJuIGAke2NvbnRleHR9XFxuXFxuR2VuZXJhdGUgT05MWSBhbiBcImV4ZWN1dGl2ZVN1bW1hcnlcIiBkb2N1bWVudCBhcyBhIEpTT04gb2JqZWN0IHdpdGggYSBzaW5nbGUga2V5IFwiZXhlY3V0aXZlU3VtbWFyeVwiIGNvbnRhaW5pbmcgYSBjb25jaXNlIE1hcmtkb3duIGV4ZWN1dGl2ZSBzdW1tYXJ5ICgxLTIgcGFnZXMpIGhpZ2hsaWdodGluZyB0aGUga2V5IGZpbmFuY2lhbCBtZXRyaWNzLCB0cmVuZHMsIHJpc2tzLCBhbmQgYWN0aW9uYWJsZSByZWNvbW1lbmRhdGlvbnMgZnJvbSB0aGUgd29ya2Jvb2sgZGF0YS5gO1xuICAgIH1cbiAgICByZXR1cm4gYCR7Y29udGV4dH1cXG5cXG5HZW5lcmF0ZSBPTkxZIGEgSlNPTiBvYmplY3Qgd2l0aCBrZXlzIFwiYWN0aW9uUGhhc2VzXCIgKGFycmF5IG9mIHtwaGFzZSwgZGVzY3JpcHRpb259KSwgXCJ0YXJnZXRSb3dzXCIgKGFycmF5IG9mIHtsYWJlbCwgdmFsdWUsIHVuaXR9KSwgYW5kIFwibGV2ZXJzXCIgKGFycmF5IG9mIHtuYW1lLCBpbXBhY3QsIGFjdGlvbnNbXX0pIGJhc2VkIG9uIHRoZSBmaW5hbmNpYWwgZGF0YS4gRm9jdXMgb24gYWN0aW9uYWJsZSBvcGVyYXRpb25hbCByZWNvbW1lbmRhdGlvbnMuYDtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9sb2FkV29ya2Jvb2tTdGVwXCIsIGxvYWRXb3JrYm9va1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2V4dHJhY3RTaGVldHNTdGVwXCIsIGV4dHJhY3RTaGVldHNTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9hbmFseXplU2hlZXRzU3RlcFwiLCBhbmFseXplU2hlZXRzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2F2ZVdvcmtib29rRm9ybXVsYU1hcFN0ZXBcIiwgc2F2ZVdvcmtib29rRm9ybXVsYU1hcFN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2NvbXByZWhlbmRXb3JrYm9va1N0ZXBcIiwgY29tcHJlaGVuZFdvcmtib29rU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZW1pdFByb2dyZXNzU3RlcFwiLCBlbWl0UHJvZ3Jlc3NTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9jbG9zZVByb2dyZXNzU3RlcFwiLCBjbG9zZVByb2dyZXNzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vcG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXBcIiwgcG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3Vwc2VydFNoZWV0UGFnZXNTdGVwXCIsIHVwc2VydFNoZWV0UGFnZXNTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zYXZlU25pcHBldHNTdGVwXCIsIHNhdmVTbmlwcGV0c1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NlbGVjdFRlbXBsYXRlU3RlcFwiLCBzZWxlY3RUZW1wbGF0ZVN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3JlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcFwiLCByZWdpc3RlckR5bmFtaWNQYWdlc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlQnVzaW5lc3NSZXZpZXdTdGVwXCIsIGdlbmVyYXRlQnVzaW5lc3NSZXZpZXdTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwXCIsIGdlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2dlbmVyYXRlRGFzaGJvYXJkU3RlcFwiLCBnZW5lcmF0ZURhc2hib2FyZFN0ZXApO1xuIiwgIi8qKlxuICogV29ya2Jvb2sgU2hlZXQgRXh0cmFjdGlvbiAoZGVwZW5kZW5jeS1mcmVlKVxuICpcbiAqIFB1cmUgc2hlZXQgc2VyaWFsaXphdGlvbiArIHN0cnVjdHVyYWwgc3RhdGlzdGljcy4gVGhpcyBtb2R1bGUgaW50ZW50aW9uYWxseVxuICogaGFzIE5PIGFwcGxpY2F0aW9uIGFsaWFzZXMgKGBALy4uLmApLCBubyB6b2QsIGFuZCBubyBPcGVuQUkgaW1wb3J0cyBzbyB0aGF0XG4gKiBpdCBjYW4gYmUgYnVuZGxlZCBpbnRvIFZlcmNlbCBXb3JrZmxvdyBzdGVwIGJ1bmRsZXMgKHdvcmtmbG93cy93b3JrYm9vay1pbmdlc3QpXG4gKiB3aXRob3V0IGRyYWdnaW5nIHRoZSB3aG9sZSBkb21haW4gbGF5ZXIgYWxvbmcuXG4gKlxuICogVGhlIEFJLWZpcnN0IHBpcGVsaW5lIHNlcmlhbGl6ZXMgZXZlcnkgc2hlZXQgdG8gcGxhaW4gdGV4dCAodGFiIG5hbWUgKyByb3dzKVxuICogYW5kIGxldHMgdGhlIG1vZGVsIGRvIHRoZSBjb21wcmVoZW5zaW9uLiBUaGUgc3RydWN0dXJhbCBzdGF0aXN0aWNzIHByb2R1Y2VkXG4gKiBoZXJlIGZlZWQgYSBkZXRlcm1pbmlzdGljIEFOQUxZWkUgcHJlLXBhc3MgdGhhdCBlbnJpY2hlcyB0aGUgQUkgcHJvbXB0LlxuICovIGltcG9ydCB7IHJlYWQsIHV0aWxzIH0gZnJvbSAneGxzeCc7XG5leHBvcnQgY29uc3QgU0hFRVRfQ0FURUdPUklFUyA9IFtcbiAgICAnZGFpbHlfc2FsZXMnLFxuICAgICdwcm9maXRfbG9zcycsXG4gICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICd0cmlhbF9iYWxhbmNlJyxcbiAgICAnZ2VuZXJhbF9sZWRnZXInLFxuICAgICdjb3N0X29mX3NhbGVzJyxcbiAgICAnbW9udGhfb25fbW9udGgnLFxuICAgICdicmVha19ldmVuJyxcbiAgICAndmFyaWFuY2UnLFxuICAgICdzdW1tYXJ5X3BsJyxcbiAgICAnc3VtbWFyeV9icycsXG4gICAgJ290aGVyJ1xuXTtcbmV4cG9ydCBjb25zdCBNQVhfU0hFRVRfUk9XUyA9IDQwO1xuZXhwb3J0IGNvbnN0IE1BWF9TSEVFVF9DT0xTID0gMTY7XG5leHBvcnQgY29uc3QgTUFYX0NFTExfQ0hBUlMgPSA4MDtcbmZ1bmN0aW9uIGZvcm1hdENlbGwodikge1xuICAgIGlmICh2ID09IG51bGwpIHJldHVybiAnJztcbiAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGlmIChOdW1iZXIuaXNJbnRlZ2VyKHYpKSByZXR1cm4gU3RyaW5nKHYpO1xuICAgICAgICByZXR1cm4gdi50b0ZpeGVkKDIpLnJlcGxhY2UoL1xcLjAwJC8sICcnKTtcbiAgICB9XG4gICAgY29uc3QgcyA9IFN0cmluZyh2KS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpO1xuICAgIHJldHVybiBzLmxlbmd0aCA+IE1BWF9DRUxMX0NIQVJTID8gcy5zbGljZSgwLCBNQVhfQ0VMTF9DSEFSUyAtIDEpICsgJ1x1MjAyNicgOiBzO1xufVxuZnVuY3Rpb24gcmVhZEZ1bGxHcmlkKHNoZWV0KSB7XG4gICAgcmV0dXJuIHV0aWxzLnNoZWV0X3RvX2pzb24oc2hlZXQsIHtcbiAgICAgICAgaGVhZGVyOiAxLFxuICAgICAgICBkZWZ2YWw6IG51bGwsXG4gICAgICAgIHJhdzogdHJ1ZVxuICAgIH0pO1xufVxuZnVuY3Rpb24gY2FwR3JpZChncmlkLCBtYXhSb3dzLCBtYXhDb2xzKSB7XG4gICAgY29uc3QgY2FwcGVkID0gW107XG4gICAgZm9yKGxldCByID0gMDsgciA8IE1hdGgubWluKGdyaWQubGVuZ3RoLCBtYXhSb3dzKTsgcisrKXtcbiAgICAgICAgY29uc3Qgcm93ID0gZ3JpZFtyXSA/PyBbXTtcbiAgICAgICAgY29uc3QgdHJpbW1lZCA9IHJvdy5zbGljZSgwLCBtYXhDb2xzKTtcbiAgICAgICAgaWYgKHRyaW1tZWQuc29tZSgoYyk9PmMgIT0gbnVsbCAmJiBTdHJpbmcoYykudHJpbSgpICE9PSAnJykpIGNhcHBlZC5wdXNoKHRyaW1tZWQpO1xuICAgIH1cbiAgICByZXR1cm4gY2FwcGVkO1xufVxuZnVuY3Rpb24gZ3JpZFRvVGV4dChncmlkKSB7XG4gICAgY29uc3QgbGluZXMgPSBncmlkLm1hcCgocm93LCBpKT0+e1xuICAgICAgICBjb25zdCBjZWxscyA9IHJvdy5tYXAoKGMpPT5mb3JtYXRDZWxsKGMpKTtcbiAgICAgICAgLy8gVHJpbSB0cmFpbGluZyBlbXB0aWVzIGZvciBjb21wYWN0bmVzc1xuICAgICAgICB3aGlsZShjZWxscy5sZW5ndGggPiAwICYmIGNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdID09PSAnJyljZWxscy5wb3AoKTtcbiAgICAgICAgcmV0dXJuIGBSJHtpICsgMX06ICR7Y2VsbHMuam9pbignIHwgJyl9YDtcbiAgICB9KTtcbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59XG5mdW5jdGlvbiBjb21wdXRlU3RhdHModGFiTmFtZSwgZ3JpZCkge1xuICAgIGxldCBjb2xDb3VudCA9IDA7XG4gICAgbGV0IG51bWVyaWNDZWxscyA9IDA7XG4gICAgbGV0IG5vbkVtcHR5Q2VsbHMgPSAwO1xuICAgIGZvciAoY29uc3Qgcm93IG9mIGdyaWQpe1xuICAgICAgICBpZiAocm93Lmxlbmd0aCA+IGNvbENvdW50KSBjb2xDb3VudCA9IHJvdy5sZW5ndGg7XG4gICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiByb3cpe1xuICAgICAgICAgICAgaWYgKGNlbGwgPT0gbnVsbCB8fCBTdHJpbmcoY2VsbCkudHJpbSgpID09PSAnJykgY29udGludWU7XG4gICAgICAgICAgICBub25FbXB0eUNlbGxzKys7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNlbGwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgbnVtZXJpY0NlbGxzKys7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjZWxsID09PSAnc3RyaW5nJyAmJiAvXlstK10/XFxkW1xcZC4sXSokLy50ZXN0KGNlbGwudHJpbSgpKSkge1xuICAgICAgICAgICAgICAgIG51bWVyaWNDZWxscysrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHRhYk5hbWUsXG4gICAgICAgIHJvd0NvdW50OiBncmlkLmxlbmd0aCxcbiAgICAgICAgY29sQ291bnQsXG4gICAgICAgIG51bWVyaWNSYXRpbzogbm9uRW1wdHlDZWxscyA+IDAgPyBudW1lcmljQ2VsbHMgLyBub25FbXB0eUNlbGxzIDogMCxcbiAgICAgICAgbm9uRW1wdHlDZWxsc1xuICAgIH07XG59XG4vKiogU2VyaWFsaXplIG9uZSB3b3Jrc2hlZXQgdG8gdGV4dCAocm93LW51bWJlcmVkLCBjYXBwZWQpIGZvciB0aGUgQUkgcHJvbXB0LiAqLyBleHBvcnQgZnVuY3Rpb24gcmVuZGVyU2hlZXRGb3JBaSh3YiwgdGFiTmFtZSwgbWF4Um93cyA9IE1BWF9TSEVFVF9ST1dTLCBtYXhDb2xzID0gTUFYX1NIRUVUX0NPTFMpIHtcbiAgICBjb25zdCBzaGVldCA9IHdiLlNoZWV0c1t0YWJOYW1lXTtcbiAgICBpZiAoIXNoZWV0KSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBncmlkID0gY2FwR3JpZChyZWFkRnVsbEdyaWQoc2hlZXQpLCBtYXhSb3dzLCBtYXhDb2xzKTtcbiAgICBpZiAoZ3JpZC5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAgIHRhYk5hbWUsXG4gICAgICAgIHRleHQ6IGdyaWRUb1RleHQoZ3JpZClcbiAgICB9O1xufVxuLyoqIFNlcmlhbGl6ZSBBTEwgc2hlZXRzIG9mIGEgd29ya2Jvb2sgdG8gdGV4dCBibG9ja3MuIEFjY2VwdHMgVWludDhBcnJheSBvciBCdWZmZXIuICovIGV4cG9ydCBmdW5jdGlvbiByZW5kZXJBbGxTaGVldHNGb3JBaShidWYpIHtcbiAgICBjb25zdCB3YiA9IHJlYWQoYnVmLCB7XG4gICAgICAgIHR5cGU6ICdidWZmZXInXG4gICAgfSk7XG4gICAgY29uc3QgYmxvY2tzID0gW107XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHdiLlNoZWV0TmFtZXMgPz8gW10pe1xuICAgICAgICBjb25zdCByZW5kZXJlZCA9IHJlbmRlclNoZWV0Rm9yQWkod2IsIG5hbWUpO1xuICAgICAgICBpZiAocmVuZGVyZWQpIGJsb2Nrcy5wdXNoKHJlbmRlcmVkKTtcbiAgICB9XG4gICAgcmV0dXJuIGJsb2Nrcztcbn1cbi8qKlxuICogU2VyaWFsaXplIEFMTCBzaGVldHMgQU5EIGNvbXB1dGUgZnVsbC1ncmlkIHN0cnVjdHVyYWwgc3RhdGlzdGljcy5cbiAqIFRoaXMgaXMgdGhlIEVYVFJBQ1Qgb3V0cHV0IGZvciB0aGUgd29ya2Zsb3cgcGlwZWxpbmU6IG9uZSBwYXJzZSBwZXJcbiAqIHNoZWV0IHByb2R1Y2VzIGJvdGggdGhlIEFJIHByb21wdCBibG9jayBhbmQgdGhlIEFOQUxZWkUgaGludHMuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RTaGVldHNXaXRoU3RhdHMoYnVmKSB7XG4gICAgY29uc3Qgd2IgPSByZWFkKGJ1Ziwge1xuICAgICAgICB0eXBlOiAnYnVmZmVyJ1xuICAgIH0pO1xuICAgIGNvbnN0IHNoZWV0cyA9IFtdO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiB3Yi5TaGVldE5hbWVzID8/IFtdKXtcbiAgICAgICAgY29uc3Qgc2hlZXQgPSB3Yi5TaGVldHNbbmFtZV07XG4gICAgICAgIGlmICghc2hlZXQpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmdWxsR3JpZCA9IHJlYWRGdWxsR3JpZChzaGVldCk7XG4gICAgICAgIGlmIChmdWxsR3JpZC5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBzdGF0cyA9IGNvbXB1dGVTdGF0cyhuYW1lLCBmdWxsR3JpZCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBncmlkVG9UZXh0KGNhcEdyaWQoZnVsbEdyaWQsIE1BWF9TSEVFVF9ST1dTLCBNQVhfU0hFRVRfQ09MUykpO1xuICAgICAgICBzaGVldHMucHVzaCh7XG4gICAgICAgICAgICB0YWJOYW1lOiBuYW1lLFxuICAgICAgICAgICAgdGV4dCxcbiAgICAgICAgICAgIHN0YXRzXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gc2hlZXRzO1xufVxuIiwgIi8qKlxuICogV29ya2Jvb2sgU2hlZXQgQW5hbHlzaXMgKGRldGVybWluaXN0aWMgcHJlLXBhc3MpXG4gKlxuICogQSBkZXBlbmRlbmN5LWZyZWUgaGV1cmlzdGljIHBhc3Mgb3ZlciBleHRyYWN0ZWQgc2hlZXRzIHRoYXQgcHJvZHVjZXNcbiAqIFwiQW5hbHlzaXNIaW50c1wiIFx1MjAxNCBzdHJ1Y3R1cmVkIGNvbnRleHQgdGhhdDpcbiAqICAgLSBpcyBmZWQgaW50byB0aGUgQ09NUFJFSEVORCBwcm9tcHQgdG8gYmlhcyB0aGUgbW9kZWwgKFBoYXNlIDIpLFxuICogICAtIGdpdmVzIHRoZSByb3V0ZSBsYXllciBhIGZhc3QgcHJlLUFJIHN0YXR1cyAoXCJ3ZSBzZWUgNCBzaGVldHMsIG1vc3RseVxuICogICAgIG51bWVyaWMsIGxpa2VseSBJRFIsIHBlcmlvZCBoaW50cyAyMDI2LTA2XCIpLlxuICpcbiAqIE5vIGFwcGxpY2F0aW9uIGFsaWFzZXMgYW5kIG5vIGV4dGVybmFsIGRlcHMgXHUyMDE0IHNhZmUgdG8gYnVuZGxlIGludG8gdGhlXG4gKiBWZXJjZWwgV29ya2Zsb3cgc3RlcCBidW5kbGUuXG4gKi8gaW1wb3J0IHsgU0hFRVRfQ0FURUdPUklFUyB9IGZyb20gJy4vZXh0cmFjdC1zaGVldHMnO1xuLy8gXHUyNTAwXHUyNTAwIEhldXJpc3RpYyB0YWJsZXMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5jb25zdCBDVVJSRU5DWV9QQVRURVJOUyA9IFtcbiAgICBbXG4gICAgICAgICdJRFInLFxuICAgICAgICAvXFxiKD86SURSfFJwXFwuP3xSdXBpYWgpXFxiL2lcbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ1VTRCcsXG4gICAgICAgIC9cXGIoPzpVU0R8XFwkKVxcYi9cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ0VVUicsXG4gICAgICAgIC9cXGIoPzpFVVJ8XHUyMEFDKVxcYi9cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ0dCUCcsXG4gICAgICAgIC9cXGIoPzpHQlB8XHUwMEEzKVxcYi9cbiAgICBdXG5dO1xuY29uc3QgTU9OVEhfTkFNRVMgPSBbXG4gICAgJ2phbnVhcnknLFxuICAgICdmZWJydWFyeScsXG4gICAgJ21hcmNoJyxcbiAgICAnYXByaWwnLFxuICAgICdtYXknLFxuICAgICdqdW5lJyxcbiAgICAnanVseScsXG4gICAgJ2F1Z3VzdCcsXG4gICAgJ3NlcHRlbWJlcicsXG4gICAgJ29jdG9iZXInLFxuICAgICdub3ZlbWJlcicsXG4gICAgJ2RlY2VtYmVyJyxcbiAgICAnamFudWFyaScsXG4gICAgJ2ZlYnJ1YXJpJyxcbiAgICAnbWFyZXQnLFxuICAgICdhcHJpbCcsXG4gICAgJ21laScsXG4gICAgJ2p1bmknLFxuICAgICdqdWxpJyxcbiAgICAnYWd1c3R1cycsXG4gICAgJ3NlcHRlbWJlcicsXG4gICAgJ29rdG9iZXInLFxuICAgICdub3ZlbWJlcicsXG4gICAgJ2Rlc2VtYmVyJ1xuXTtcbmZ1bmN0aW9uIHBlcmlvZFBhdHRlcm5zKCkge1xuICAgIHJldHVybiBbXG4gICAgICAgIC9cXGIoMTl8MjApXFxkezJ9Wy0vXSgwP1sxLTldfDFbMC0yXSkoPzpbLS9dXFxkezEsMn0pP1xcYi9nLFxuICAgICAgICAvXFxiKDA/WzEtOV18MVswLTJdKVstL10oMTl8MjApXFxkezJ9XFxiL2csXG4gICAgICAgIG5ldyBSZWdFeHAoYFxcXFxiKD86JHtNT05USF9OQU1FUy5qb2luKCd8Jyl9KVxcXFxiYCwgJ2dpJyksXG4gICAgICAgIC9cXGJRWzEtNF1bIC1dPyg/OjE5fDIwKVxcZHsyfVxcYi9naVxuICAgIF07XG59XG5jb25zdCBMQUJFTF9DQVRFR09SWV9NQVAgPSBbXG4gICAgW1xuICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnUFJPRklUICYgTE9TUycsXG4gICAgICAgICAgICAnUFJPRklUIEFORCBMT1NTJyxcbiAgICAgICAgICAgICdMYWJhIFJ1Z2knLFxuICAgICAgICAgICAgJ0lOQ09NRSBTVEFURU1FTlQnLFxuICAgICAgICAgICAgJ1AmTCcsXG4gICAgICAgICAgICAnRUJJVERBJyxcbiAgICAgICAgICAgICdORVQgUFJPRklUJyxcbiAgICAgICAgICAgICdORVQgSU5DT01FJyxcbiAgICAgICAgICAgICdMQUJBIEJFUlNJSCcsXG4gICAgICAgICAgICAnUlVHSSdcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnYmFsYW5jZV9zaGVldCcsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdCQUxBTkNFIFNIRUVUJyxcbiAgICAgICAgICAgICdORVJBQ0EnLFxuICAgICAgICAgICAgJ0FTU0VUJyxcbiAgICAgICAgICAgICdMSUFCSUxJVCcsXG4gICAgICAgICAgICAnRUtVSVRBUycsXG4gICAgICAgICAgICAnRVFVSVRZJyxcbiAgICAgICAgICAgICdUT1RBTCBBU1NFVFMnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ3RyaWFsX2JhbGFuY2UnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnVFJJQUwgQkFMQU5DRScsXG4gICAgICAgICAgICAnTkVSQUNBIFNBTERPJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdnZW5lcmFsX2xlZGdlcicsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdHRU5FUkFMIExFREdFUicsXG4gICAgICAgICAgICAnQlVLVSBCRVNBUicsXG4gICAgICAgICAgICAnSlVSTkFMJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdjb3N0X29mX3NhbGVzJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ0NPU1QgT0YgU0FMRVMnLFxuICAgICAgICAgICAgJ0NPR1MnLFxuICAgICAgICAgICAgJ0hBUkdBIFBPS09LJyxcbiAgICAgICAgICAgICdGT09EIENPU1QnLFxuICAgICAgICAgICAgJ0JFVkVSQUdFIENPU1QnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ2JyZWFrX2V2ZW4nLFxuICAgICAgICBbXG4gICAgICAgICAgICAnQlJFQUsgRVZFTicsXG4gICAgICAgICAgICAnQlJFQUstRVZFTicsXG4gICAgICAgICAgICAnQkVQJyxcbiAgICAgICAgICAgICdUSVRJSyBJTVBBUydcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnZGFpbHlfc2FsZXMnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnREFJTFkgU0FMRVMnLFxuICAgICAgICAgICAgJ1BFTkpVQUxBTiBIQVJJQU4nLFxuICAgICAgICAgICAgJ09NWkVUJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdtb250aF9vbl9tb250aCcsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdNT05USCBPTiBNT05USCcsXG4gICAgICAgICAgICAnTU9NJyxcbiAgICAgICAgICAgICdCVUxBTkFOJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICd2YXJpYW5jZScsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdWQVJJQU5DRScsXG4gICAgICAgICAgICAnVkFSSUFOU0knLFxuICAgICAgICAgICAgJ1NFTElTSUgnLFxuICAgICAgICAgICAgJ0FDVFVBTCBWUyBCVURHRVQnLFxuICAgICAgICAgICAgJ0FDVFVBTCBWUydcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnc3VtbWFyeV9wbCcsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdTVU1NQVJZIFAmTCcsXG4gICAgICAgICAgICAnUklOR0tBU0FOIExBQkEgUlVHSScsXG4gICAgICAgICAgICAnU1VNTUFSWSBQUk9GSVQnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ3N1bW1hcnlfYnMnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnU1VNTUFSWSBCQUxBTkNFJyxcbiAgICAgICAgICAgICdSSU5HS0FTQU4gTkVSQUNBJ1xuICAgICAgICBdXG4gICAgXVxuXTtcbmZ1bmN0aW9uIGNvbGxlY3RIaW50cyh0ZXh0KSB7XG4gICAgY29uc3QgY3VycmVuY3kgPSBbXTtcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCByZV0gb2YgQ1VSUkVOQ1lfUEFUVEVSTlMpe1xuICAgICAgICBpZiAocmUudGVzdCh0ZXh0KSkgY3VycmVuY3kucHVzaChuYW1lKTtcbiAgICB9XG4gICAgY29uc3QgcGVyaW9kcyA9IFtdO1xuICAgIGZvciAoY29uc3QgcmUgb2YgcGVyaW9kUGF0dGVybnMoKSl7XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKHJlKTtcbiAgICAgICAgaWYgKG1hdGNoZXMpIHBlcmlvZHMucHVzaCguLi5tYXRjaGVzKTtcbiAgICB9XG4gICAgY29uc3QgbGFiZWxzID0gW107XG4gICAgZm9yIChjb25zdCBbLCB0ZXJtc10gb2YgTEFCRUxfQ0FURUdPUllfTUFQKXtcbiAgICAgICAgZm9yIChjb25zdCB0ZXJtIG9mIHRlcm1zKXtcbiAgICAgICAgICAgIGlmICh0ZXh0LnRvVXBwZXJDYXNlKCkuaW5jbHVkZXModGVybS50b1VwcGVyQ2FzZSgpKSkgbGFiZWxzLnB1c2godGVybSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY3VycmVuY3ksXG4gICAgICAgIHBlcmlvZHMsXG4gICAgICAgIGxhYmVsc1xuICAgIH07XG59XG5mdW5jdGlvbiBndWVzc0NhdGVnb3J5KGxhYmVscykge1xuICAgIGNvbnN0IHNjb3JlcyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IFtjYXRlZ29yeSwgdGVybXNdIG9mIExBQkVMX0NBVEVHT1JZX01BUCl7XG4gICAgICAgIGxldCBzY29yZSA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgdGVybSBvZiB0ZXJtcyl7XG4gICAgICAgICAgICBpZiAobGFiZWxzLmluY2x1ZGVzKHRlcm0pKSBzY29yZSArPSB0ZXJtLmxlbmd0aDsgLy8gbG9uZ2VyIHRlcm1zIGFyZSBtb3JlIHNwZWNpZmljXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjb3JlID4gMCkgc2NvcmVzLnNldChjYXRlZ29yeSwgc2NvcmUpO1xuICAgIH1cbiAgICBpZiAoc2NvcmVzLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICAgIGNvbnN0IHNvcnRlZCA9IFtcbiAgICAgICAgLi4uc2NvcmVzLmVudHJpZXMoKVxuICAgIF0uc29ydCgoYSwgYik9PmJbMV0gLSBhWzFdKTtcbiAgICBpZiAoc29ydGVkLmxlbmd0aCA+IDEgJiYgc29ydGVkWzBdWzFdID09PSBzb3J0ZWRbMV1bMV0pIHJldHVybiBudWxsOyAvLyB0aWUgXHUyMTkyIGFtYmlndW91c1xuICAgIHJldHVybiBzb3J0ZWRbMF1bMF07XG59XG5mdW5jdGlvbiBiZXN0R3Vlc3ModmFsdWVzKSB7XG4gICAgaWYgKHZhbHVlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGNvdW50cyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IHYgb2YgdmFsdWVzKWNvdW50cy5zZXQodiwgKGNvdW50cy5nZXQodikgPz8gMCkgKyAxKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAuLi5jb3VudHMuZW50cmllcygpXG4gICAgXS5zb3J0KChhLCBiKT0+YlsxXSAtIGFbMV0pWzBdWzBdO1xufVxuLy8gXHUyNTAwXHUyNTAwIFB1YmxpYyBBUEkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vKiogQW5hbHl6ZSBleHRyYWN0ZWQgc2hlZXRzIChFWFRSQUNUIG91dHB1dCkgaW50byBkZXRlcm1pbmlzdGljIGhpbnRzLiAqLyBleHBvcnQgZnVuY3Rpb24gYW5hbHl6ZVNoZWV0cyhzaGVldHMpIHtcbiAgICBjb25zdCBzaGVldEhpbnRzID0gc2hlZXRzLm1hcCgocyk9PntcbiAgICAgICAgY29uc3QgeyBjdXJyZW5jeSwgcGVyaW9kcywgbGFiZWxzIH0gPSBjb2xsZWN0SGludHMocy50ZXh0KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRhYk5hbWU6IHMudGFiTmFtZSxcbiAgICAgICAgICAgIHJvd0NvdW50OiBzLnN0YXRzLnJvd0NvdW50LFxuICAgICAgICAgICAgY29sQ291bnQ6IHMuc3RhdHMuY29sQ291bnQsXG4gICAgICAgICAgICBudW1lcmljUmF0aW86IHMuc3RhdHMubnVtZXJpY1JhdGlvLFxuICAgICAgICAgICAgY3VycmVuY3lIaW50czogY3VycmVuY3ksXG4gICAgICAgICAgICBwZXJpb2RIaW50czogcGVyaW9kcyxcbiAgICAgICAgICAgIGxhYmVsSGludHM6IGxhYmVscyxcbiAgICAgICAgICAgIGxpa2VseUNhdGVnb3J5OiBndWVzc0NhdGVnb3J5KGxhYmVscylcbiAgICAgICAgfTtcbiAgICB9KTtcbiAgICBjb25zdCB0b3RhbFJvd3MgPSBzaGVldEhpbnRzLnJlZHVjZSgoYWNjLCBzKT0+YWNjICsgcy5yb3dDb3VudCwgMCk7XG4gICAgY29uc3QgdG90YWxOb25FbXB0eUNlbGxzID0gc2hlZXRzLnJlZHVjZSgoYWNjLCBzKT0+YWNjICsgcy5zdGF0cy5ub25FbXB0eUNlbGxzLCAwKTtcbiAgICBjb25zdCB3ZWlnaHRlZE51bWVyaWMgPSBzaGVldHMucmVkdWNlKChhY2MsIHMpPT5hY2MgKyBzLnN0YXRzLm51bWVyaWNSYXRpbyAqIHMuc3RhdHMubm9uRW1wdHlDZWxscywgMCk7XG4gICAgY29uc3QgYWxsQ3VycmVuY3kgPSBzaGVldEhpbnRzLmZsYXRNYXAoKHMpPT5zLmN1cnJlbmN5SGludHMpO1xuICAgIGNvbnN0IGFsbFBlcmlvZHMgPSBzaGVldEhpbnRzLmZsYXRNYXAoKHMpPT5zLnBlcmlvZEhpbnRzKTtcbiAgICByZXR1cm4ge1xuICAgICAgICB3b3JrYm9vazoge1xuICAgICAgICAgICAgc2hlZXRDb3VudDogc2hlZXRzLmxlbmd0aCxcbiAgICAgICAgICAgIHRvdGFsUm93cyxcbiAgICAgICAgICAgIHRvdGFsTm9uRW1wdHlDZWxscyxcbiAgICAgICAgICAgIG92ZXJhbGxOdW1lcmljUmF0aW86IHRvdGFsTm9uRW1wdHlDZWxscyA+IDAgPyB3ZWlnaHRlZE51bWVyaWMgLyB0b3RhbE5vbkVtcHR5Q2VsbHMgOiAwLFxuICAgICAgICAgICAgY3VycmVuY3lHdWVzczogYmVzdEd1ZXNzKGFsbEN1cnJlbmN5KSxcbiAgICAgICAgICAgIHBlcmlvZEd1ZXNzOiBiZXN0R3Vlc3MoYWxsUGVyaW9kcylcbiAgICAgICAgfSxcbiAgICAgICAgc2hlZXRzOiBzaGVldEhpbnRzXG4gICAgfTtcbn1cbmV4cG9ydCB7IFNIRUVUX0NBVEVHT1JJRVMgfTtcbiIsICIvKipcbiAqIFdvcmtib29rIENvbXByZWhlbnNpb24gXHUyMDE0IGJ1bmRsZS1sZWFuIE9wZW5BSSBjYWxsXG4gKlxuICogVGhpcyBtb2R1bGUgY29udGFpbnMgT05MWSB0aGUgY29tcHJlaGVuc2lvbiByZXF1ZXN0IHBhdGg6IFpvZCBzY2hlbWFzLFxuICogcHJvbXB0IGJ1aWxkaW5nIChoaW50cy1hd2FyZSksIGEgc2luZ2xlLWF0dGVtcHQgT3BlbkFJIGNhbGwgd2l0aCB0eXBlZFxuICogZXJyb3JzLCBhbmQgcmVzcG9uc2UgcGFyc2luZy5cbiAqXG4gKiBCdW5kbGUgY29uc3RyYWludHM6XG4gKiAgIC0gTk8gYXBwbGljYXRpb24gYWxpYXNlcyAoYEAvLi4uYCkgXHUyMDE0IG9ubHkgYHpvZGAgKyByZWxhdGl2ZSBpbXBvcnRzLlxuICogICAtIE5vIERCIC8gc2VjcmV0cyAvIFByaXNtYSBcdTIwMTQgdGhlIEFQSSBrZXkgaXMgcGFzc2VkIGluIGV4cGxpY2l0bHkuXG4gKiAgIC0gU2FmZSB0byBidW5kbGUgaW50byBWZXJjZWwgV29ya2Zsb3cgc3RlcCBidW5kbGVzICh3b3JrZmxvd3MvKikuXG4gKlxuICogVGhlIHN5bmMgcGlwZWxpbmUgd3JhcHBlciAoYGNvbXByZWhlbmRXb3JrYm9va2AgaW4gd29ya2Jvb2stY29tcHJlaGVuc2lvbi50cylcbiAqIGtlZXBzIGl0cyBvd24ga2V5IHJlc29sdXRpb24gKyAyLWF0dGVtcHQgcmV0cnkgbG9vcCBmb3IgdGhlIG5vbi13b3JrZmxvd1xuICogcGF0aDsgdGhpcyBtb2R1bGUgaXMgdGhlIHNoYXJlZCBzaW5nbGUtYXR0ZW1wdCBjb3JlLlxuICovIGltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgU0hFRVRfQ0FURUdPUklFUyB9IGZyb20gJy4vZXh0cmFjdC1zaGVldHMnO1xuLy8gXHUyNTAwXHUyNTAwIFpvZCB2YWxpZGF0aW9uIHNjaGVtYSBmb3IgdGhlIEFJIHN0cnVjdHVyZWQgb3V0cHV0IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZXhwb3J0IGNvbnN0IE1ldHJpY1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgICAvKiogUGVyaW9kIGluIFlZWVktTU0gKGFubnVhbCB0b3RhbHMgbWF5IHVzZSBZWVlZLTEyKS4gKi8gcGVyaW9kOiB6LnN0cmluZygpLnJlZ2V4KC9eXFxkezR9LVxcZHsyfSQvKSxcbiAgICBkYXRhVHlwZTogei5lbnVtKFtcbiAgICAgICAgJ2FjdHVhbCcsXG4gICAgICAgICdmb3JlY2FzdCdcbiAgICBdKSxcbiAgICBzY2VuYXJpbzogei5lbnVtKFtcbiAgICAgICAgJ2FjdHVhbCcsXG4gICAgICAgICdjb25zZXJ2YXRpdmUnLFxuICAgICAgICAncmVhbGlzdGljJyxcbiAgICAgICAgJ2FzcGlyYXRpb25hbCdcbiAgICBdKSxcbiAgICByZXZlbnVlOiB6Lm51bWJlcigpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICBlYml0ZGE6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgIG5ldEluY29tZTogei5udW1iZXIoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgZ3Vlc3RzOiB6Lm51bWJlcigpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICBzdGFmZkNvc3Q6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpXG59KTtcbmV4cG9ydCBjb25zdCBTaGVldENvbXByZWhlbnNpb25TY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgLyoqIEV4YWN0IHRhYiBuYW1lIGFzIGl0IGFwcGVhcnMgaW4gdGhlIHdvcmtib29rLiAqLyB0YWJOYW1lOiB6LnN0cmluZygpLFxuICAgIGNhdGVnb3J5OiB6LmVudW0oU0hFRVRfQ0FURUdPUklFUyksXG4gICAgLyoqIEh1bWFuLXJlYWRhYmxlIHRpdGxlIGZvciB0aGUgZHluYW1pYyBwYWdlLiAqLyB0aXRsZTogei5zdHJpbmcoKSxcbiAgICAvKiogT25lLXBhcmFncmFwaCBjb21wcmVoZW5zaW9uIG9mIHdoYXQgdGhpcyBzaGVldCBjb250YWlucy4gKi8gc3VtbWFyeTogei5zdHJpbmcoKSxcbiAgICAvKiogRGV0ZWN0ZWQgcGVyaW9kLCBlLmcuIFwiSnVuZSAyMDI2XCIgXHUyMDE0IG51bGwgd2hlbiBub3QgZGV0ZWN0YWJsZS4gKi8gcGVyaW9kSGludDogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgLyoqIENvbHVtbiBoZWFkZXJzIChmaXJzdCBtZWFuaW5nZnVsIHJvdykuICovIGNvbHVtbnM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKSxcbiAgICByb3dDb3VudDogei5udW1iZXIoKS5pbnQoKS5ub25uZWdhdGl2ZSgpLm9wdGlvbmFsKCksXG4gICAgLyoqIFBlci1wZXJpb2QgbWV0cmljcyBmb3VuZCBvbiBUSElTIHNoZWV0LiAqLyBtZXRyaWNzOiB6LmFycmF5KE1ldHJpY1NjaGVtYSkub3B0aW9uYWwoKVxufSk7XG5leHBvcnQgY29uc3QgV29ya2Jvb2tDb21wcmVoZW5zaW9uU2NoZW1hID0gei5vYmplY3Qoe1xuICAgIHdvcmtib29rOiB6Lm9iamVjdCh7XG4gICAgICAgIHRpdGxlOiB6LnN0cmluZygpLFxuICAgICAgICBjb21wYW55OiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgcGVyaW9kOiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgY3VycmVuY3k6IHouc3RyaW5nKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgICAgICBzdW1tYXJ5OiB6LnN0cmluZygpXG4gICAgfSksXG4gICAgc2hlZXRzOiB6LmFycmF5KFNoZWV0Q29tcHJlaGVuc2lvblNjaGVtYSksXG4gICAgLyoqXG4gICAqIE5vcm1hbGl6ZWQgZmluYW5jaWFsIHByb2plY3Rpb25zIGNvbnNvbGlkYXRlZCBhY3Jvc3MgQUxMIHNoZWV0cy5cbiAgICogVGhpcyBpcyB0aGUgc291cmNlIGZvciB0aGUgZmluYW5jaWFsX3Byb2plY3Rpb25zIHRhYmxlLlxuICAgKi8gcHJvamVjdGlvbnM6IHouYXJyYXkoTWV0cmljU2NoZW1hKSxcbiAgICAvKipcbiAgICogVGVtcGxhdGUgc3VnZ2VzdGlvbiBmcm9tIHRoZSBhdmFpbGFibGUgdGVtcGxhdGUgY2F0YWxvZ1xuICAgKiAoVEVNUExBVEVfQ0FUQUxPRyBpZHMsIGUuZy4gXCJmaW5hbmNpYWwtYW5hbHl0aWNzXCIsIFwicmVzdGF1cmFudFwiKS5cbiAgICovIHRlbXBsYXRlOiB6Lm9iamVjdCh7XG4gICAgICAgIGlkOiB6LnN0cmluZygpLFxuICAgICAgICBjb25maWRlbmNlOiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMSkub3B0aW9uYWwoKSxcbiAgICAgICAgcmVhc29uOiB6LnN0cmluZygpLm9wdGlvbmFsKClcbiAgICB9KS5vcHRpb25hbCgpXG59KTtcbi8vIFx1MjUwMFx1MjUwMCBUeXBlZCBlcnJvcnMgKG1hcHBlZCB0byB0aGUgd29ya2Zsb3cgcmV0cnkgcG9saWN5IGJ5IHRoZSBjYWxsZXIpIFx1MjUwMFxuZXhwb3J0IGNsYXNzIENvbXByZWhlbmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBvcHRpb25zKXtcbiAgICAgICAgc3VwZXIobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdDb21wcmVoZW5kRXJyb3InO1xuICAgIH1cbn1cbi8qKiBIVFRQLWxldmVsIGZhaWx1cmUgKG5vbi0yeHgpLiBDYXJyaWVzIHN0YXR1cyArIG9wdGlvbmFsIFJldHJ5LUFmdGVyLiAqLyBleHBvcnQgY2xhc3MgQ29tcHJlaGVuZEh0dHBFcnJvciBleHRlbmRzIENvbXByZWhlbmRFcnJvciB7XG4gICAgc3RhdHVzO1xuICAgIC8qKiBSZXRyeS1BZnRlciBoZWFkZXIgdmFsdWUgaW4gc2Vjb25kcywgd2hlbiBwcmVzZW50LiAqLyByZXRyeUFmdGVyU2Vjb25kcztcbiAgICBjb25zdHJ1Y3RvcihzdGF0dXMsIG1lc3NhZ2UsIHJldHJ5QWZ0ZXJTZWNvbmRzID0gbnVsbCl7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnQ29tcHJlaGVuZEh0dHBFcnJvcic7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLnJldHJ5QWZ0ZXJTZWNvbmRzID0gcmV0cnlBZnRlclNlY29uZHM7XG4gICAgfVxufVxuLyoqIFJlc3BvbnNlIGNvdWxkIG5vdCBiZSBwYXJzZWQvdmFsaWRhdGVkIChKU09OIG9yIFpvZCkuICovIGV4cG9ydCBjbGFzcyBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgQ29tcHJlaGVuZEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBvcHRpb25zKXtcbiAgICAgICAgc3VwZXIobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yJztcbiAgICB9XG59XG4vLyBcdTI1MDBcdTI1MDAgUHJvbXB0IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuY29uc3QgU1lTVEVNX1BST01QVCA9ICdZb3UgYXJlIGEgcHJlY2lzZSBmaW5hbmNpYWwgYW5hbHlzdCBhbmQgd29ya2Jvb2sgaW50ZXJwcmV0ZXIuICcgKyAnWW91IHJlYWQgcmF3IHNwcmVhZHNoZWV0IGR1bXBzIGFuZCByZXR1cm4gT05MWSB2YWxpZCBKU09OIG1hdGNoaW5nIHRoZSByZXF1ZXN0ZWQgc2NoZW1hIGV4YWN0bHkuICcgKyAnTmV2ZXIgaW52ZW50IGRhdGEgdGhhdCBpcyBub3QgcHJlc2VudCBpbiB0aGUgc2hlZXRzIFx1MjAxNCBsZWF2ZSBtZXRyaWNzIG51bGwgd2hlbiBhYnNlbnQuJztcbi8qKiBSZW5kZXIgdGhlIGRldGVybWluaXN0aWMgQU5BTFlaRSBoaW50cyBhcyBhIHByb21wdCBzZWN0aW9uLiAqLyBmdW5jdGlvbiByZW5kZXJIaW50c1NlY3Rpb24oaGludHMpIHtcbiAgICBjb25zdCB3YiA9IGhpbnRzLndvcmtib29rO1xuICAgIGNvbnN0IGxpbmVzID0gW1xuICAgICAgICBgLSBXb3JrYm9vazogJHt3Yi5zaGVldENvdW50fSBzaGVldChzKSwgJHt3Yi50b3RhbFJvd3N9IHRvdGFsIHJvd3MsIGAgKyBgJHtNYXRoLnJvdW5kKHdiLm92ZXJhbGxOdW1lcmljUmF0aW8gKiAxMDApfSUgbnVtZXJpYyBjZWxscy5gXG4gICAgXTtcbiAgICBpZiAod2IuY3VycmVuY3lHdWVzcykgbGluZXMucHVzaChgLSBDdXJyZW5jeSBndWVzczogJHt3Yi5jdXJyZW5jeUd1ZXNzfWApO1xuICAgIGlmICh3Yi5wZXJpb2RHdWVzcykgbGluZXMucHVzaChgLSBQZXJpb2QgZ3Vlc3M6ICR7d2IucGVyaW9kR3Vlc3N9YCk7XG4gICAgZm9yIChjb25zdCBzIG9mIGhpbnRzLnNoZWV0cyl7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gW1xuICAgICAgICAgICAgYFwiJHtzLnRhYk5hbWV9XCI6ICR7cy5yb3dDb3VudH0gcm93cyBcdTAwRDcgJHtzLmNvbENvdW50fSBjb2xzLCBgICsgYCR7TWF0aC5yb3VuZChzLm51bWVyaWNSYXRpbyAqIDEwMCl9JSBudW1lcmljYFxuICAgICAgICBdO1xuICAgICAgICBpZiAocy5jdXJyZW5jeUhpbnRzLmxlbmd0aCA+IDApIHBhcnRzLnB1c2goYGN1cnJlbmN5IFske3MuY3VycmVuY3lIaW50cy5qb2luKCcsJyl9XWApO1xuICAgICAgICBpZiAocy5wZXJpb2RIaW50cy5sZW5ndGggPiAwKSBwYXJ0cy5wdXNoKGBwZXJpb2RzIFske3MucGVyaW9kSGludHMuam9pbignLCAnKX1dYCk7XG4gICAgICAgIGlmIChzLmxhYmVsSGludHMubGVuZ3RoID4gMCkgcGFydHMucHVzaChgbGFiZWxzIFske3MubGFiZWxIaW50cy5qb2luKCcsICcpfV1gKTtcbiAgICAgICAgaWYgKHMubGlrZWx5Q2F0ZWdvcnkpIHBhcnRzLnB1c2goYGNhdGVnb3J5LWd1ZXNzICR7cy5saWtlbHlDYXRlZ29yeX1gKTtcbiAgICAgICAgbGluZXMucHVzaChgICAtIFNoZWV0ICR7cGFydHMuam9pbignOyAnKX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ29tcHJlaGVuc2lvblByb21wdChibG9ja3MsIGhpbnRzKSB7XG4gICAgY29uc3Qgc2hlZXRCbG9ja3MgPSBibG9ja3MubWFwKChiKT0+YD09PT09IFNIRUVUOiAke2IudGFiTmFtZX0gPT09PT1cXG4ke2IudGV4dH1cXG5gKS5qb2luKCdcXG4nKTtcbiAgICBjb25zdCBoaW50c1NlY3Rpb24gPSBoaW50cyA/IGBERVRFUk1JTklTVElDIFBSRS1BTkFMWVNJUyAoZ2VuZXJhdGVkIGJ5IGNvZGUgXHUyMDE0IHVzZSBhcyBzdHJvbmcgcHJpb3JzLCBidXQgQUxXQVlTIHZlcmlmeSBhZ2FpbnN0IHRoZSBhY3R1YWwgZHVtcDsgY2F0ZWdvcnktZ3Vlc3MgaXMgbm90IGF1dGhvcml0YXRpdmUpOlxuJHtyZW5kZXJIaW50c1NlY3Rpb24oaGludHMpfVxuXG5gIDogJyc7XG4gICAgcmV0dXJuIGBBbmFseXplIHRoZSBmb2xsb3dpbmcgd29ya2Jvb2suIEV2ZXJ5IHNoZWV0IG9mIHRoZSB3b3JrYm9vayBpcyBkdW1wZWQgYmVsb3cgYXMgXCJSPHJvdz46IDxjZWxscz5cIi5cblxuVEFTS1M6XG4xLiBVbmRlcnN0YW5kIHRoZSB3b3JrYm9vayBhcyBhIHdob2xlIChjb21wYW55LCBwZXJpb2QsIGN1cnJlbmN5LCBwdXJwb3NlKS5cbjIuIEZvciBFQUNIIHNoZWV0OiBpZGVudGlmeSBpdHMgY2F0ZWdvcnksIGEgaHVtYW4tcmVhZGFibGUgdGl0bGUsIGEgc2hvcnQgY29tcHJlaGVuc2lvbiBzdW1tYXJ5LCBkZXRlY3RlZCBwZXJpb2QgKGUuZy4gXCJKdW5lIDIwMjZcIiksIGNvbHVtbiBoZWFkZXJzLCByb3cgY291bnQsIGFuZCBhbnkgcGVyLXBlcmlvZCBmaW5hbmNpYWwgbWV0cmljcyAocmV2ZW51ZSwgRUJJVERBLCBuZXQgaW5jb21lLCBndWVzdHMsIHN0YWZmIGNvc3QpIHlvdSBjYW4gcmVhZCBmcm9tIHRoZSBzaGVldC5cbjMuIENvbnNvbGlkYXRlIEFMTCBwZXJpb2QtbGV2ZWwgZmluYW5jaWFsIGRhdGEgYWNyb3NzIHRoZSB3aG9sZSB3b3JrYm9vayBpbnRvIGEgc2luZ2xlIFwicHJvamVjdGlvbnNcIiBhcnJheTogb25lIGVudHJ5IHBlciAocGVyaW9kIFlZWVktTU0sIGRhdGFUeXBlIGFjdHVhbHxmb3JlY2FzdCwgc2NlbmFyaW8gYWN0dWFsfGNvbnNlcnZhdGl2ZXxyZWFsaXN0aWN8YXNwaXJhdGlvbmFsKS4gVXNlIHRoZSBiZXN0IHNvdXJjZSBmb3IgZWFjaCBwZXJpb2QgKGUuZy4gYSBQJkwgc3RhdGVtZW50IGZvciBhY3R1YWxzLCBhIEJFUCB0YWJsZSBvciBidWRnZXQgc2hlZXQgZm9yIGZvcmVjYXN0cykuIEFubnVhbCB0b3RhbHMgdXNlIFlZWVktMTIuIE9ubHkgaW5jbHVkZSBlbnRyaWVzIHdoZXJlIGF0IGxlYXN0IG9uZSBtZXRyaWMgaXMgcHJlc2VudC5cbjQuIFN1Z2dlc3QgdGhlIG1vc3QgYXBwcm9wcmlhdGUgYXBwIHRlbXBsYXRlIGlkIGZyb20gdGhpcyBhdmFpbGFibGUgY2F0YWxvZzogZmluYW5jaWFsLWFuYWx5dGljcywgcmVzdGF1cmFudCwgaG90ZWwsIGVkdWNhdGlvbiwgZWNvbW1lcmNlLXJldGFpbCwgaGVhbHRoY2FyZSwgbWFudWZhY3R1cmluZywgcHJvZmVzc2lvbmFsLXNlcnZpY2VzLCByZWFsLWVzdGF0ZSwgc3VwcGx5LWNoYWluIChjb25maWRlbmNlIDAuLjEpLlxuXG5SVUxFUzpcbi0gcGVyaW9kczogWVlZWS1NTSBvbmx5IChlLmcuIFwiMjAyNi0wNlwiLCBcIjIwMjUtMTJcIiBmb3IgYW5udWFsKS5cbi0gZGF0YVR5cGUgXCJhY3R1YWxcIiBmb3IgcmVwb3J0ZWQvYWN0dWFsIGZpZ3VyZXMsIFwiZm9yZWNhc3RcIiBmb3IgcHJvamVjdGlvbnMvYnVkZ2V0cy5cbi0gc2NlbmFyaW86IFwiYWN0dWFsXCIgZm9yIGFjdHVhbHM7IFwiY29uc2VydmF0aXZlXCIgZm9yIGJhc2UgZm9yZWNhc3RzOyBcInJlYWxpc3RpY1wiL1wiYXNwaXJhdGlvbmFsXCIgd2hlbiB0aGUgc2hlZXQgZXhwbGljaXRseSBsYWJlbHMgc2NlbmFyaW9zLlxuLSBBbW91bnRzIGFyZSBmdWxsIElEUiBpbnRlZ2VycyAobm8gXCJLXCIgc2hvcnRoYW5kKS4gUm91bmQgdG8gaW50ZWdlcnMuXG4tIExlYXZlIGEgbWV0cmljIG51bGwgd2hlbiB0aGUgc2hlZXQgZG9lcyBub3QgY29udGFpbiBpdCBmb3IgdGhhdCBwZXJpb2QuXG4tIGNhdGVnb3J5IG11c3QgYmUgb25lIG9mOiAke1NIRUVUX0NBVEVHT1JJRVMuam9pbignLCAnKX0uXG5cbiR7aGludHNTZWN0aW9ufVdPUktCT09LIERVTVA6XG4ke3NoZWV0QmxvY2tzfWA7XG59XG5leHBvcnQgZnVuY3Rpb24gc3RyaXBDb2RlRmVuY2UocmVwbHkpIHtcbiAgICBjb25zdCBtYXRjaCA9IHJlcGx5Lm1hdGNoKC9gYGAoPzpqc29uKT9cXHMqKFtcXHNcXFNdKj8pYGBgLyk7XG4gICAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiByZXBseTtcbn1cbi8qKlxuICogT05FIE9wZW5BSSBjYWxsIHRvIGNvbXByZWhlbmQgdGhlIHdvcmtib29rLiBObyByZXRyeSBsb29wIFx1MjAxNCB0aGUgY2FsbGVyXG4gKiAoc3luYyBwaXBlbGluZSBvciB3b3JrZmxvdyBzdGVwKSBvd25zIHJldHJ5IHBvbGljeS5cbiAqXG4gKiBUaHJvd3M6XG4gKiAgIC0gQ29tcHJlaGVuZEh0dHBFcnJvciAoc3RhdHVzIDQyOSBjYXJyaWVzIHJldHJ5QWZ0ZXJTZWNvbmRzKVxuICogICAtIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IgKGJhZCBKU09OIC8gWm9kIHJlamVjdGlvbilcbiAqICAgLSBDb21wcmVoZW5kRXJyb3IgKG5ldHdvcmsgZXRjLiBcdTIwMTQgd3JhcHBlZCBmcm9tIGZldGNoIGZhaWx1cmVzKVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21wcmVoZW5kT25jZShibG9ja3MsIG9wdGlvbnMpIHtcbiAgICBjb25zdCB7IG1vZGVsID0gJ2dwdC00bycsIGhpbnRzLCBhcGlLZXksIGJhc2VVcmwgPSAnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MScgfSA9IG9wdGlvbnM7XG4gICAgaWYgKGJsb2Nrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IoJ1dvcmtib29rIGNvbnRhaW5zIG5vIHJlYWRhYmxlIHNoZWV0cycpO1xuICAgIH1cbiAgICBjb25zdCBwcm9tcHQgPSBidWlsZENvbXByZWhlbnNpb25Qcm9tcHQoYmxvY2tzLCBoaW50cyk7XG4gICAgbGV0IHJlc3BvbnNlO1xuICAgIHRyeSB7XG4gICAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YmFzZVVybH0vY2hhdC9jb21wbGV0aW9uc2AsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogU1lTVEVNX1BST01QVFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuMixcbiAgICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAxNjM4NCxcbiAgICAgICAgICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2pzb25fb2JqZWN0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZEVycm9yKGBPcGVuQUkgcmVxdWVzdCBmYWlsZWQ6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWAsIHtcbiAgICAgICAgICAgIGNhdXNlOiBlcnJcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyQm9keSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKS5jYXRjaCgoKT0+J1Vua25vd24gZXJyb3InKTtcbiAgICAgICAgbGV0IHJldHJ5QWZ0ZXJTZWNvbmRzID0gbnVsbDtcbiAgICAgICAgY29uc3QgcmV0cnlBZnRlciA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdyZXRyeS1hZnRlcicpO1xuICAgICAgICBpZiAocmV0cnlBZnRlcikge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gTnVtYmVyKHJldHJ5QWZ0ZXIpO1xuICAgICAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZShwYXJzZWQpICYmIHBhcnNlZCA+PSAwKSByZXRyeUFmdGVyU2Vjb25kcyA9IHBhcnNlZDtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZEh0dHBFcnJvcihyZXNwb25zZS5zdGF0dXMsIGBPcGVuQUkgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pOiAke2VyckJvZHl9YCwgcmV0cnlBZnRlclNlY29uZHMpO1xuICAgIH1cbiAgICBsZXQgcmVzdWx0O1xuICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhyb3cgbmV3IENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IoYE9wZW5BSSByZXNwb25zZSB3YXMgbm90IHZhbGlkIEpTT046ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgIH1cbiAgICBjb25zdCByZXBseSA9IHJlc3VsdC5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgPz8gJyc7XG4gICAgbGV0IHBhcnNlZDtcbiAgICB0cnkge1xuICAgICAgICBwYXJzZWQgPSBKU09OLnBhcnNlKHN0cmlwQ29kZUZlbmNlKHJlcGx5KSk7XG4gICAgfSBjYXRjaCAge1xuICAgICAgICB0aHJvdyBuZXcgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcignQUkgcmVzcG9uc2Ugd2FzIG5vdCB2YWxpZCBKU09OOiAnICsgcmVwbHkuc2xpY2UoMCwgNTAwKSk7XG4gICAgfVxuICAgIGxldCBjb21wcmVoZW5zaW9uO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbXByZWhlbnNpb24gPSBXb3JrYm9va0NvbXByZWhlbnNpb25TY2hlbWEucGFyc2UocGFyc2VkKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZmlyc3QgPSBlcnIgaW5zdGFuY2VvZiB6LlpvZEVycm9yID8gZXJyLmlzc3Vlc1swXSA6IG51bGw7XG4gICAgICAgIGNvbnN0IGRldGFpbCA9IGZpcnN0ID8gYCR7Zmlyc3QucGF0aC5qb2luKCcuJykgfHwgJ3Jvb3QnfTogJHtmaXJzdC5tZXNzYWdlfWAgOiBTdHJpbmcoZXJyKTtcbiAgICAgICAgdGhyb3cgbmV3IENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IoYEFJIHJlc3BvbnNlIGZhaWxlZCBzY2hlbWEgdmFsaWRhdGlvbjogJHtkZXRhaWx9YCwge1xuICAgICAgICAgICAgY2F1c2U6IGVyclxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29tcHJlaGVuc2lvbixcbiAgICAgICAgbW9kZWwsXG4gICAgICAgIHByb21wdExlbmd0aDogcHJvbXB0Lmxlbmd0aFxuICAgIH07XG59XG4iLCAiLyoqXG4gKiBQcm9ncmVzcyBlbWlzc2lvbiBmb3IgdGhlIHdvcmtib29rLWluZ2VzdCB3b3JrZmxvdy5cbiAqXG4gKiBGb2xsb3dzIHRoZSBTREsgc3RyZWFtaW5nIHBhdHRlcm46XG4gKiAgIC0gdGhlIHdvcmtmbG93IGZ1bmN0aW9uIGNhbGxzIGBnZXRXcml0YWJsZSgpYCBhbmQgcGFzc2VzIHRoZSBzdHJlYW0gdG8gc3RlcHM7XG4gKiAgIC0gc3RlcHMgb2J0YWluIGEgd3JpdGVyLCB3cml0ZSBKU09OIGNodW5rcywgYW5kIHJlbGVhc2UgdGhlIGxvY2suXG4gKlxuICogVGhlIHdyaXRhYmxlIHN0cmVhbSBpcyBzZXJpYWxpemVkIGJ5IHJlZmVyZW5jZSBhY3Jvc3Mgc3RlcCBib3VuZGFyaWVzXG4gKiAoc3RyZWFtVG9TdHJlYW1SZWYpLCBzbyB3ZSBhbHdheXMgcGFzcyB0aGUgcmF3IFdyaXRhYmxlU3RyZWFtIFx1MjAxNCBuZXZlciBhXG4gKiB3cmFwcGVyIG9iamVjdC5cbiAqLyAvKipcbiAqIEVuY29kZSBhIHByb2dyZXNzIGNodW5rIGFzIGEgSlNPTiBzdHJpbmcgKGNodW5rcyBhcmUgd3JpdHRlbiBhcyB0ZXh0KS5cbiAqLyBleHBvcnQgZnVuY3Rpb24gZW5jb2RlQ2h1bmsoY2h1bmspIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoY2h1bmspO1xufVxuLyoqXG4gKiBXcml0ZSBvbmUgcHJvZ3Jlc3MgY2h1bmsuIENhbGwgZnJvbSB3aXRoaW4gYSBzdGVwOlxuICpcbiAqICAgYXN5bmMgZnVuY3Rpb24gZW1pdFByb2dyZXNzU3RlcCh3cml0YWJsZTogV3JpdGFibGVTdHJlYW0sIGNodW5rOiBQcm9ncmVzc0NodW5rKSB7XG4gKiAgICAgJ3VzZSBzdGVwJztcbiAqICAgICBhd2FpdCB3cml0ZVByb2dyZXNzQ2h1bmsod3JpdGFibGUsIGNodW5rKTtcbiAqICAgfVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZVByb2dyZXNzQ2h1bmsod3JpdGFibGUsIGNodW5rKSB7XG4gICAgY29uc3Qgd3JpdGVyID0gd3JpdGFibGUuZ2V0V3JpdGVyKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgd3JpdGVyLndyaXRlKGNodW5rKTtcbiAgICB9IGZpbmFsbHl7XG4gICAgICAgIHdyaXRlci5yZWxlYXNlTG9jaygpO1xuICAgIH1cbn1cbi8qKiBDbG9zZSB0aGUgc3RyZWFtIHRvIHNpZ25hbCBjb21wbGV0aW9uLiBDYWxsIGZyb20gd2l0aGluIGEgc3RlcC4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsb3NlUHJvZ3Jlc3NTdHJlYW0od3JpdGFibGUpIHtcbiAgICBhd2FpdCB3cml0YWJsZS5jbG9zZSgpO1xufVxuIiwgIi8qKlxuICogTGlnaHR3ZWlnaHQgUG9zdGdyZVNRTCBoZWxwZXIgZm9yIHdvcmtmbG93IHN0ZXBzIChwZyBkcml2ZXIsIG5vIFByaXNtYSkuXG4gKlxuICogRWFjaCBzdGVwIG9wZW5zIGl0cyBvd24gc2hvcnQtbGl2ZWQgY29ubmVjdGlvbiBcdTIwMTQgZmluZSBmb3Igd29ya2Zsb3cgc3RlcHNcbiAqIHdoaWNoIGFyZSBhbHJlYWR5IGluZGl2aWR1YWxseSBpbnZvaWNlZCBWZXJjZWwgRnVuY3Rpb24gaW52b2NhdGlvbnMuXG4gKiBUaGUgcG9vbC9jb25uZWN0aW9uLXN0cmluZyBjb21lcyBmcm9tIGBwcm9jZXNzLmVudi5QT1NUR1JFU19VUkxgIChzZXQgYnlcbiAqIHRoZSBWZXJjZWwvTmVvbiBpbnRlZ3JhdGlvbiBhbmQgYXZhaWxhYmxlIGluIHN0ZXAgcnVudGltZSkuXG4gKi8gaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSAncGcnO1xuLyoqXG4gKiBSdW4gYSBjYWxsYmFjayB3aXRoIGEgc2hvcnQtbGl2ZWQgcGcgY29ubmVjdGlvbi5cbiAqIFRoZSBjb25uZWN0aW9uIHN0cmluZyBpcyByZXNvbHZlZCBieSB0aGUgcm91dGUgKHJvb3QgZW52IFx1MjE5MiB0ZW5hbnQgZGJfdXJsIGxvb2t1cClcbiAqIGFuZCBwYXNzZWQgdGhyb3VnaCB0aGUgd29ya2Zsb3cgaW5wdXQgXHUyMDE0IG5ldmVyIHJlYWQgZnJvbSBwcm9jZXNzLmVudiBkaXJlY3RseS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gd2l0aFBnQ2xpZW50KGNvbm5lY3Rpb25TdHJpbmcsIGZuKSB7XG4gICAgaWYgKCFjb25uZWN0aW9uU3RyaW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZGF0YWJhc2UgY29ubmVjdGlvbiBzdHJpbmcgcHJvdmlkZWQuJyk7XG4gICAgfVxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoe1xuICAgICAgICBjb25uZWN0aW9uU3RyaW5nXG4gICAgfSk7XG4gICAgYXdhaXQgY2xpZW50LmNvbm5lY3QoKTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgZm4oY2xpZW50KTtcbiAgICB9IGZpbmFsbHl7XG4gICAgICAgIGF3YWl0IGNsaWVudC5lbmQoKTtcbiAgICB9XG59XG4vKiogUnVuIGEgc2luZ2xlIFNRTCBzdGF0ZW1lbnQgYW5kIHJldHVybiB0aGUgcm93IGNvdW50IG9yIHJlc3VsdC4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVPbmUoY2xpZW50LCBzcWwsIHBhcmFtcyA9IFtdKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnF1ZXJ5KHNxbCwgcGFyYW1zKTtcbiAgICByZXR1cm4gcmVzdWx0LnJvd0NvdW50ID8/IDA7XG59XG4vKiogUnVuIFNRTCBhbmQgcmV0dXJuIGFsbCByb3dzLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcXVlcnlSb3dzKGNsaWVudCwgc3FsLCBwYXJhbXMgPSBbXSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5xdWVyeShzcWwsIHBhcmFtcyk7XG4gICAgcmV0dXJuIHJlc3VsdC5yb3dzO1xufVxuIiwgIi8qKlxuICogSW1wb3J0LXRpbWUgRXhjZWwgZm9ybXVsYSBleHRyYWN0aW9uICsgcmVmZXJlbmNlIG1hcHBpbmcuXG4gKlxuICogV2hlbiBhIHdvcmtib29rIGlzIGltcG9ydGVkIHRoZSByYXcgeGxzeCBpcyBjYWNoZWQgaW4gdGhlIGRhdGFiYXNlXG4gKiAoa25vd2xlZGdlX3NuaXBwZXRzLndvcmtib29rX2RhdGEpIGFuZCBzZXJ2ZWQgdG8gdGhlIHNoZWV0IHZpZXdlciBhcyBKU09OXG4gKiByb3dzIGtleWVkIGJ5IGNvbHVtbiBoZWFkZXIgd2l0aCBhIGRldGVjdGVkIGhlYWRlciByb3cuIFRoaXMgbW9kdWxlIHdhbGtzXG4gKiBldmVyeSBzaGVldCBvZiB0aGUgaW1wb3J0ZWQgd29ya2Jvb2sgYW5kOlxuICpcbiAqICAgMS4gZmluZHMgQUxMIGZvcm11bGEgY2VsbHMgKFwiPVNVTShWNDY6VjU0KVwiLCBcIj1QTCFEN1wiLCAuLi4pLFxuICogICAyLiBtYXBzIGVhY2ggZm9ybXVsYSBjZWxsIGl0c2VsZiB0byB0aGUgREItc2hlZXQgY29vcmRpbmF0ZXMgdGhlXG4gKiAgICAgIGFwcGxpY2F0aW9uIGRpc3BsYXlzIChjb2x1bW4ga2V5ICsgZGF0YS1yb3cgb2Zmc2V0ICsgYWJzb2x1dGUgQTEpLFxuICogICAzLiBtYXBzIGV2ZXJ5IHJlZmVyZW5jZSBpbnNpZGUgdGhlIGZvcm11bGEgdG8gdGhlIHNhbWUgY29vcmRpbmF0ZXNcbiAqICAgICAgKGNyb3NzLXNoZWV0IHJlZnMgaW5jbHVkZWQpLCBzbyBhIGZvcm11bGEgY2FuIGJlIGNvbXB1dGVkIGFnYWluc3QgdGhlXG4gKiAgICAgIERCLXNhdmVkIHNoZWV0IGRhdGEgZXZlbiB3aGVuIHJhdyBncmlkIHBvc2l0aW9ucyBzaGlmdCBiZXR3ZWVuXG4gKiAgICAgIGltcG9ydHMsXG4gKiAgIDQuIGNvbXB1dGVzIGEgYmVzdC1lZmZvcnQgdmFsdWUgd2l0aCB0aGUgc2FtZSBldmFsdWF0b3IgdGhlIEFQSSB1c2VzXG4gKiAgICAgIChzcmMvbGliL2V4Y2VsLWZvcm11bGEudHMpIHNvIGNvbnN1bWVycyBoYXZlIGFuIGltcG9ydC10aW1lIHNuYXBzaG90LlxuICpcbiAqIFRoZSByZXN1bHRpbmcgV29ya2Jvb2tGb3JtdWxhTWFwIGlzIHBlcnNpc3RlZCBhcyBhIGtub3dsZWRnZV9zbmlwcGV0cyBKU09OXG4gKiBlbnRyeSAoa2V5IFwid29ya2Jvb2tfZm9ybXVsYXNcIikgYnkgYm90aCBpbXBvcnQgcGF0aHMgKHNlZWQtcnVubmVyIGFuZCB0aGVcbiAqIHdvcmtib29rLWluZ2VzdCB3b3JrZmxvdykuXG4gKi8gaW1wb3J0IHsgdXRpbHMgfSBmcm9tICd4bHN4JztcbmltcG9ydCB7IGV2YWx1YXRlRm9ybXVsYSwgY29sbGVjdFJlZmVyZW5jZXMgfSBmcm9tICdAL2xpYi9leGNlbC1mb3JtdWxhJztcbmltcG9ydCB7IGZpbmRIZWFkZXJSb3csIGJ1aWxkQ29sdW1uS2V5cyB9IGZyb20gJ0AvbGliL3dvcmtib29rLW1hcHBpbmcnO1xuZnVuY3Rpb24gaXNDZWxsQWRkcmVzcyhrZXkpIHtcbiAgICByZXR1cm4gL15bQS1aXStcXGQrJC8udGVzdChrZXkpO1xufVxuLyoqIE1hcCBvbmUgcmF3IHJlZmVyZW5jZSB0b2tlbiB0byBEQiBjb29yZGluYXRlcyAodGFyZ2V0IHNoZWV0IGF3YXJlKS4gKi8gZnVuY3Rpb24gbWFwUmVmKHJlZiwgaGVhZGVyQ2FjaGUsIHdiLCBmb3JtdWxhU2hlZXQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSByZWYuc2hlZXQgPz8gZm9ybXVsYVNoZWV0O1xuICAgIGNvbnN0IHRhcmdldFdzID0gd2IuU2hlZXRzW3RhcmdldF07XG4gICAgLy8gU2FtZS1zaGVldCByZWZlcmVuY2VzIGtlZXAgc2hlZXQgJycgKGNvbXBhY3QpOyBleHBsaWNpdCBvdGhlcndpc2UuXG4gICAgY29uc3Qgc2hlZXQgPSByZWYuc2hlZXQgPz8gJyc7XG4gICAgaWYgKCF0YXJnZXRXcykge1xuICAgICAgICAvLyBTaGVldCB2YW5pc2hlZCBcdTIwMTQga2VlcCB0aGUgcmF3IGFkZHJlc3Mgc28gbm90aGluZyBpcyBsb3N0LlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2hlZXQsXG4gICAgICAgICAgICBraW5kOiAnY2VsbCcsXG4gICAgICAgICAgICBhYnNDZWxsOiByZWYuYWRkclxuICAgICAgICB9O1xuICAgIH1cbiAgICBsZXQgaGVhZGVyID0gaGVhZGVyQ2FjaGUuZ2V0KHRhcmdldCk7XG4gICAgaWYgKCFoZWFkZXIpIHtcbiAgICAgICAgaGVhZGVyID0gZmluZEhlYWRlclJvdyh0YXJnZXRXcyk7XG4gICAgICAgIGhlYWRlckNhY2hlLnNldCh0YXJnZXQsIGhlYWRlcik7XG4gICAgfVxuICAgIGNvbnN0IHN0YXJ0ID0gbWFwQ2VsbFRvRGF0YVJlZih0YXJnZXRXcywgcmVmLmFkZHIsIGhlYWRlcik7XG4gICAgY29uc3QgbWFwcGVkID0ge1xuICAgICAgICBzaGVldCxcbiAgICAgICAga2luZDogcmVmLmVuZCA/ICdyYW5nZScgOiAnY2VsbCcsXG4gICAgICAgIGNvbEtleTogc3RhcnQuY29sS2V5LFxuICAgICAgICByZWxSb3c6IHN0YXJ0LnJlbFJvdyxcbiAgICAgICAgYWJzQ2VsbDogcmVmLmFkZHJcbiAgICB9O1xuICAgIGlmIChyZWYuZW5kKSB7XG4gICAgICAgIGNvbnN0IGVuZCA9IG1hcENlbGxUb0RhdGFSZWYodGFyZ2V0V3MsIHJlZi5lbmQsIGhlYWRlcik7XG4gICAgICAgIG1hcHBlZC5lbmQgPSB7XG4gICAgICAgICAgICBjb2xLZXk6IGVuZC5jb2xLZXksXG4gICAgICAgICAgICByZWxSb3c6IGVuZC5yZWxSb3csXG4gICAgICAgICAgICBhYnNDZWxsOiByZWYuZW5kXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBtYXBwZWQ7XG59XG4vKiogQ29sdW1uLW9ubHkgKEE6QSkgb3IgZnVsbC1jZWxsIG1hcHBpbmcgdG8gREIgY29vcmRpbmF0ZXMuICovIGZ1bmN0aW9uIG1hcENlbGxUb0RhdGFSZWYod3MsIGFkZHIsIGhlYWRlcikge1xuICAgIGNvbnN0IGNsZWFuID0gYWRkci5yZXBsYWNlKC9cXCQvZywgJycpO1xuICAgIGlmICgvXltBLVphLXpdKyQvLnRlc3QoY2xlYW4pKSB7XG4gICAgICAgIC8vIFdob2xlLWNvbHVtbiByZWZlcmVuY2U6IGNvbHVtbiBtYXBzIHRvIGl0cyBoZWFkZXIga2V5LCByb3dzIGFyZSB1bmJvdW5kZWQuXG4gICAgICAgIGNvbnN0IGNvbElkeCA9IHV0aWxzLmRlY29kZV9jb2woY2xlYW4pO1xuICAgICAgICBjb25zdCBjb2x1bW5LZXlzID0gYnVpbGRDb2x1bW5LZXlzKGhlYWRlci5oZWFkZXJzKTtcbiAgICAgICAgY29uc3QgcmF3SGVhZGVyID0gaGVhZGVyLmhlYWRlcnNbY29sSWR4XSA/PyAnJztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbEtleTogcmF3SGVhZGVyLnRyaW0oKSA/IGNvbHVtbktleXNbY29sSWR4XSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHJlbFJvdzogdW5kZWZpbmVkXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGRlY29kZWQgPSB1dGlscy5kZWNvZGVfY2VsbChjbGVhbik7XG4gICAgY29uc3QgcmVsUm93ID0gZGVjb2RlZC5yIC0gaGVhZGVyLmhlYWRlclJvdyArIDE7XG4gICAgY29uc3QgY29sdW1uS2V5cyA9IGJ1aWxkQ29sdW1uS2V5cyhoZWFkZXIuaGVhZGVycyk7XG4gICAgY29uc3QgcmF3SGVhZGVyID0gaGVhZGVyLmhlYWRlcnNbZGVjb2RlZC5jXSA/PyAnJztcbiAgICByZXR1cm4ge1xuICAgICAgICBjb2xLZXk6IHJhd0hlYWRlci50cmltKCkgPyBjb2x1bW5LZXlzW2RlY29kZWQuY10gOiB1bmRlZmluZWQsXG4gICAgICAgIHJlbFJvdzogcmVsUm93ID49IDEgPyByZWxSb3cgOiB1bmRlZmluZWRcbiAgICB9O1xufVxuLyoqXG4gKiBXYWxrIGV2ZXJ5IHNoZWV0IGFuZCBidWlsZCB0aGUgZnVsbCBmb3JtdWxhIGludmVudG9yeSArIHJlZmVyZW5jZSBtYXBwaW5nLlxuICpcbiAqIEV4cGVjdHMgYHdiYCBwYXJzZWQgd2l0aCBgY2VsbEZvcm11bGE6IHRydWVgIChTaGVldEpTIG9ubHkgcG9wdWxhdGVzXG4gKiBgY2VsbC5mYCB3aGVuIGZvcm11bGEgc3RyaW5ncyBhcmUgcmVhZCkuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkV29ya2Jvb2tGb3JtdWxhTWFwKHdiKSB7XG4gICAgY29uc3QgbWFwID0ge307XG4gICAgY29uc3QgaGVhZGVyQ2FjaGUgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCB0YWJOYW1lIG9mIHdiLlNoZWV0TmFtZXMpe1xuICAgICAgICBjb25zdCB3cyA9IHdiLlNoZWV0c1t0YWJOYW1lXTtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gZmluZEhlYWRlclJvdyh3cyk7XG4gICAgICAgIGNvbnN0IGNvbHVtbktleXMgPSBidWlsZENvbHVtbktleXMoaGVhZGVyLmhlYWRlcnMpO1xuICAgICAgICBjb25zdCBoZWFkZXJDYWNoZUtleSA9IHRhYk5hbWU7XG4gICAgICAgIGhlYWRlckNhY2hlLnNldChoZWFkZXJDYWNoZUtleSwgaGVhZGVyKTtcbiAgICAgICAgY29uc3QgZm9ybXVsYXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMod3MpKXtcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICchcmVmJyB8fCBrZXkgPT09ICchbWFyZ2lucycgfHwga2V5ID09PSAnIW1lcmdlcycgfHwga2V5ID09PSAnIWNvbHMnIHx8IGtleSA9PT0gJyFyb3dzJykgY29udGludWU7XG4gICAgICAgICAgICBpZiAoIWlzQ2VsbEFkZHJlc3Moa2V5KSkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBjZWxsID0gd3Nba2V5XTtcbiAgICAgICAgICAgIGlmICghY2VsbCB8fCB0eXBlb2YgY2VsbC5mICE9PSAnc3RyaW5nJyB8fCBjZWxsLmYudHJpbSgpID09PSAnJykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBmb3JtdWxhID0gY2VsbC5mLnRyaW0oKS5zdGFydHNXaXRoKCc9JykgPyBjZWxsLmYudHJpbSgpIDogJz0nICsgY2VsbC5mLnRyaW0oKTtcbiAgICAgICAgICAgIGNvbnN0IGRlY29kZWQgPSB1dGlscy5kZWNvZGVfY2VsbChrZXkpO1xuICAgICAgICAgICAgY29uc3QgcmVsUm93ID0gZGVjb2RlZC5yIC0gaGVhZGVyLmhlYWRlclJvdyArIDE7XG4gICAgICAgICAgICBjb25zdCByYXdIZWFkZXIgPSBoZWFkZXIuaGVhZGVyc1tkZWNvZGVkLmNdID8/ICcnO1xuICAgICAgICAgICAgY29uc3QgcmVmcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCByYXdSZWYgb2YgY29sbGVjdFJlZmVyZW5jZXMoZm9ybXVsYSkpe1xuICAgICAgICAgICAgICAgIHJlZnMucHVzaChtYXBSZWYocmF3UmVmLCBoZWFkZXJDYWNoZSwgd2IsIHRhYk5hbWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGV2YWx1YXRlRm9ybXVsYSh3Yiwgd3MsIGZvcm11bGEsIDAsIGtleSk7XG4gICAgICAgICAgICBmb3JtdWxhcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjZWxsOiBrZXksXG4gICAgICAgICAgICAgICAgZm9ybXVsYSxcbiAgICAgICAgICAgICAgICBjb2xLZXk6IHJhd0hlYWRlci50cmltKCkgPyBjb2x1bW5LZXlzW2RlY29kZWQuY10gOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgcmVsUm93OiByZWxSb3cgPj0gMSA/IHJlbFJvdyA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBhYnNSb3c6IGRlY29kZWQuciArIDEsXG4gICAgICAgICAgICAgICAgYWJzQ29sOiBkZWNvZGVkLmMgKyAxLFxuICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQudW5ldmFsdWFibGUgPyB1bmRlZmluZWQgOiByZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgdW5ldmFsdWFibGU6IHJlc3VsdC51bmV2YWx1YWJsZSxcbiAgICAgICAgICAgICAgICByZWZzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBtYXBbdGFiTmFtZV0gPSB7XG4gICAgICAgICAgICBoZWFkZXJSb3c6IGhlYWRlci5oZWFkZXJSb3csXG4gICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXIuaGVhZGVycyxcbiAgICAgICAgICAgIGNvbHVtbktleXMsXG4gICAgICAgICAgICBmb3JtdWxhc1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufVxuIiwgIi8qKlxuICogRXhjZWwgZm9ybXVsYSBzdXBwb3J0IGZvciB0aGUgU2hlZXQgVmlld2VyLlxuICpcbiAqIFRoZSB3b3JrYm9vayBzdG9yZXMgZm9ybXVsYXMgKGUuZy4gXCI9U1VNKEUxMDpFMTEpXCIsIFwiPUlGKEQ2PTAsXFxcIlxcXCIsKEY2LUQ2KS9ENilcIixcbiAqIFwiPVBMIUQ3XCIpIHdpdGggRXhjZWwncyBjYWNoZWQgY2FsY3VsYXRlZCB2YWx1ZXMuIFRoaXMgbW9kdWxlOlxuICogIC0gZXZhbHVhdGVzIGEgZm9ybXVsYSBhZ2FpbnN0IHRoZSB3b3JrYm9vayAoYmVzdC1lZmZvcnQpIHNvIHRoZSBEYXRhR3JpZCBjYW5cbiAqICAgIHNob3cgdGhlIGNhbGN1bGF0ZWQgcmVzdWx0IGltbWVkaWF0ZWx5IGFmdGVyIHRoZSB1c2VyIGFtZW5kcyB0aGUgZm9ybXVsYSxcbiAqICAtIG1hcmtzIGZvcm11bGFzIHdlIGNhbm5vdCBldmFsdWF0ZSAoZXhvdGljIGZ1bmN0aW9ucywgZXRjLikgYXNcbiAqICAgIHVuZXZhbHVhYmxlIFx1MjAxNCB0aGUgZm9ybXVsYSBpcyBzdGlsbCBzdG9yZWQgaW4gdGhlIHdvcmtib29rIGFuZCBFeGNlbFxuICogICAgcmVjYWxjdWxhdGVzIGl0IG9uIG9wZW4uXG4gKlxuICogU3VwcG9ydGVkOiBhcml0aG1ldGljICgrIC0gKiAvIF4gJSksIHBhcmVucywgY2VsbCByZWZzIChBMSwgJEEkMSksXG4gKiBjcm9zcy1zaGVldCByZWZzIChTaGVldCFBMSwgJ1NoZWV0IE5hbWUnIUExKSwgcmFuZ2VzIChBMTpCNSkgYW5kIHRoZVxuICogZnVuY3Rpb25zIFNVTSwgQVZFUkFHRSwgTUlOLCBNQVgsIENPVU5ULCBDT1VOVEEsIFBST0RVQ1QsIEFCUywgSU5ULCBTUVJULFxuICogUk9VTkQsIFJPVU5EVVAsIFJPVU5ERE9XTiwgTU9ELCBQT1dFUiwgSUYsIFNVQlRPVEFMIChjb2RlIDkvMTA5IG9ubHkpLFxuICogQU5ELCBPUiwgVFJJTSwgUFJPUEVSLCBDSE9PU0UsIERBVEUsIFdFRUtEQVksIENPTFVNTiwgU1VNSUYsIFZMT09LVVAsXG4gKiBNQVRDSCwgSU5ERVgsIFRFWFQsIElGRVJST1IuXG4gKi8gaW1wb3J0IHsgdXRpbHMgfSBmcm9tICd4bHN4JztcbmNvbnN0IE1BWF9ERVBUSCA9IDEyO1xuY29uc3QgTUFYX1JBTkdFX0NFTExTID0gMTAwXzAwMDtcbmZ1bmN0aW9uIGlzUmFuZ2Uodikge1xuICAgIHJldHVybiB0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdiAhPT0gbnVsbCAmJiAnX19yYW5nZScgaW4gdjtcbn1cbmZ1bmN0aW9uIHRva2VuaXplKHNyYykge1xuICAgIGNvbnN0IHRva2VucyA9IFtdO1xuICAgIGxldCBpID0gMDtcbiAgICBsZXQgcHJldlRva2VuO1xuICAgIHdoaWxlKGkgPCBzcmMubGVuZ3RoKXtcbiAgICAgICAgY29uc3QgY2ggPSBzcmNbaV07XG4gICAgICAgIGlmIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0JyB8fCBjaCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvW1xcZC5dLy50ZXN0KGNoKSkge1xuICAgICAgICAgICAgbGV0IGogPSBpO1xuICAgICAgICAgICAgd2hpbGUoaiA8IHNyYy5sZW5ndGggJiYgL1tcXGQuXS8udGVzdChzcmNbal0pKWorKztcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbnVtJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogc3JjLnNsaWNlKGksIGopXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGkgPSBqO1xuICAgICAgICAgICAgcHJldlRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaCA9PT0gJ1wiJykge1xuICAgICAgICAgICAgbGV0IGogPSBpICsgMTtcbiAgICAgICAgICAgIHdoaWxlKGogPCBzcmMubGVuZ3RoICYmIHNyY1tqXSAhPT0gJ1wiJylqKys7XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3N0cicsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHNyYy5zbGljZShpICsgMSwgailcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaSA9IGogKyAxO1xuICAgICAgICAgICAgcHJldlRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaCA9PT0gXCInXCIpIHtcbiAgICAgICAgICAgIGxldCBqID0gaSArIDE7XG4gICAgICAgICAgICB3aGlsZShqIDwgc3JjLmxlbmd0aCAmJiBzcmNbal0gIT09IFwiJ1wiKWorKztcbiAgICAgICAgICAgIGNvbnN0IHNoZWV0TmFtZSA9IHNyYy5zbGljZShpICsgMSwgaik7XG4gICAgICAgICAgICBpID0gaiArIDE7XG4gICAgICAgICAgICBpZiAoc3JjW2ldID09PSAnIScpIHtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzaGVldCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzaGVldE5hbWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcHJldlRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYmFkIHF1b3RlZCB0b2tlbicpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvW0EtWmEtel8kXS8udGVzdChjaCkpIHtcbiAgICAgICAgICAgIGxldCBqID0gaTtcbiAgICAgICAgICAgIHdoaWxlKGogPCBzcmMubGVuZ3RoICYmIC9bQS1aYS16MC05XyQuXS8udGVzdChzcmNbal0pKWorKztcbiAgICAgICAgICAgIGNvbnN0IHdvcmQgPSBzcmMuc2xpY2UoaSwgaik7XG4gICAgICAgICAgICBpZiAoc3JjW2pdID09PSAnIScpIHtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzaGVldCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB3b3JkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaSA9IGogKyAxO1xuICAgICAgICAgICAgICAgIHByZXZUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoL15cXCQ/W0EtWmEtel17MSwzfVxcJD9cXGQrJC8udGVzdCh3b3JkKSkgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdyZWYnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB3b3JkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsc2UgaWYgKC9eXFwkP1tBLVphLXpdezEsM30kLy50ZXN0KHdvcmQpICYmIChzcmNbal0gPT09ICc6JyB8fCBwcmV2VG9rZW4/LnR5cGUgPT09ICdvcCcgJiYgcHJldlRva2VuLnZhbHVlID09PSAnOicpKSB7XG4gICAgICAgICAgICAgICAgLy8gV2hvbGUtY29sdW1uIHJlZiAoQTpBLCAkQzokQUcpIFx1MjAxNCBvbmx5IG1lYW5pbmdmdWwgaW5zaWRlIGEgcmFuZ2VcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdyZWYnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogd29yZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh3b3JkID09PSAnVFJVRScpIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdUUlVFJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbHNlIGlmICh3b3JkID09PSAnRkFMU0UnKSB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2wnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnRkFMU0UnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsc2UgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdpZGVudCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHdvcmQudG9VcHBlckNhc2UoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpID0gajtcbiAgICAgICAgICAgIHByZXZUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0d28gPSBzcmMuc2xpY2UoaSwgaSArIDIpO1xuICAgICAgICBpZiAodHdvID09PSAnPD0nIHx8IHR3byA9PT0gJz49JyB8fCB0d28gPT09ICc8PicpIHtcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnb3AnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0d29cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaSArPSAyO1xuICAgICAgICAgICAgcHJldlRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgnKy0qL149PD4oKSwlOicuaW5jbHVkZXMoY2gpKSB7XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ29wJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2hcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgcHJldlRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5leHBlY3RlZCBjaGFyOiAnICsgY2gpO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW5zO1xufVxuZnVuY3Rpb24gdG9OdW0odikge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCkgcmV0dXJuIDA7IC8vIEV4Y2VsOiBlbXB0eSBjZWxsIGluIG51bWVyaWMgY29udGV4dCA9IDBcbiAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInKSByZXR1cm4gdjtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykgcmV0dXJuIHYgPyAxIDogMDtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnN0IG4gPSBOdW1iZXIodi50cmltKCkpO1xuICAgICAgICBpZiAoaXNGaW5pdGUobikpIHJldHVybiBuO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBudW1lcmljJyk7XG59XG5mdW5jdGlvbiB0cnV0aHkodikge1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gdjtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInKSByZXR1cm4gdiAhPT0gMDtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdzdHJpbmcnKSByZXR1cm4gdi50cmltKCkgIT09ICcnO1xuICAgIGlmIChpc1JhbmdlKHYpKSByZXR1cm4gdi52YWx1ZXMuc29tZSgoeCk9PnRydXRoeSh4KSk7XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuY2xhc3MgUGFyc2VyIHtcbiAgICB3YjtcbiAgICB3cztcbiAgICBkZXB0aDtcbiAgICBjdXJyZW50Q2VsbEFkZHI7XG4gICAgdG9rZW5zO1xuICAgIHBvcyA9IDA7XG4gICAgY29uc3RydWN0b3Iod2IsIHdzLCBzcmMsIGRlcHRoID0gMCwgY3VycmVudENlbGxBZGRyKXtcbiAgICAgICAgdGhpcy53YiA9IHdiO1xuICAgICAgICB0aGlzLndzID0gd3M7XG4gICAgICAgIHRoaXMuZGVwdGggPSBkZXB0aDtcbiAgICAgICAgdGhpcy5jdXJyZW50Q2VsbEFkZHIgPSBjdXJyZW50Q2VsbEFkZHI7XG4gICAgICAgIHRoaXMudG9rZW5zID0gdG9rZW5pemUoc3JjKTtcbiAgICB9XG4gICAgcGFyc2VFeHByKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUNvbXBhcmlzb24oKTtcbiAgICB9XG4gICAgLyoqIFRydWUgd2hlbiB0aGUgZnVsbCB0b2tlbiBzdHJlYW0gaGFzIGJlZW4gY29uc3VtZWQuICovIGZpbmlzaGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb3MgPj0gdGhpcy50b2tlbnMubGVuZ3RoO1xuICAgIH1cbiAgICBwZWVrKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy5wb3NdO1xuICAgIH1cbiAgICBuZXh0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy5wb3MrK107XG4gICAgfVxuICAgIGV4cGVjdE9wKG9wKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLm5leHQoKTtcbiAgICAgICAgaWYgKCF0IHx8IHQudHlwZSAhPT0gJ29wJyB8fCB0LnZhbHVlICE9PSBvcCkgdGhyb3cgbmV3IEVycm9yKCdleHBlY3RlZCAnICsgb3ApO1xuICAgIH1cbiAgICBwYXJzZUNvbXBhcmlzb24oKSB7XG4gICAgICAgIGxldCBsZWZ0ID0gdGhpcy5wYXJzZUFkZGl0aXZlKCk7XG4gICAgICAgIHdoaWxlKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgW1xuICAgICAgICAgICAgJz0nLFxuICAgICAgICAgICAgJzw+JyxcbiAgICAgICAgICAgICc8JyxcbiAgICAgICAgICAgICc+JyxcbiAgICAgICAgICAgICc8PScsXG4gICAgICAgICAgICAnPj0nXG4gICAgICAgIF0uaW5jbHVkZXModGhpcy5wZWVrKCkudmFsdWUpKXtcbiAgICAgICAgICAgIGNvbnN0IG9wID0gdGhpcy5uZXh0KCkudmFsdWU7XG4gICAgICAgICAgICBjb25zdCByaWdodCA9IHRoaXMucGFyc2VBZGRpdGl2ZSgpO1xuICAgICAgICAgICAgbGVmdCA9IGNvbXBhcmUob3AsIGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVmdDtcbiAgICB9XG4gICAgcGFyc2VBZGRpdGl2ZSgpIHtcbiAgICAgICAgbGV0IGxlZnQgPSB0aGlzLnBhcnNlTXVsdGlwbGljYXRpdmUoKTtcbiAgICAgICAgd2hpbGUodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiAodGhpcy5wZWVrKCkudmFsdWUgPT09ICcrJyB8fCB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJy0nKSl7XG4gICAgICAgICAgICBjb25zdCBvcCA9IHRoaXMubmV4dCgpLnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLnBhcnNlTXVsdGlwbGljYXRpdmUoKTtcbiAgICAgICAgICAgIGxlZnQgPSBhcml0aChvcCwgbGVmdCwgcmlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZWZ0O1xuICAgIH1cbiAgICBwYXJzZU11bHRpcGxpY2F0aXZlKCkge1xuICAgICAgICBsZXQgbGVmdCA9IHRoaXMucGFyc2VVbmFyeSgpO1xuICAgICAgICB3aGlsZSh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmICh0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJyonIHx8IHRoaXMucGVlaygpLnZhbHVlID09PSAnLycpKXtcbiAgICAgICAgICAgIGNvbnN0IG9wID0gdGhpcy5uZXh0KCkudmFsdWU7XG4gICAgICAgICAgICBjb25zdCByaWdodCA9IHRoaXMucGFyc2VVbmFyeSgpO1xuICAgICAgICAgICAgbGVmdCA9IGFyaXRoKG9wLCBsZWZ0LCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxlZnQ7XG4gICAgfVxuICAgIHBhcnNlVW5hcnkoKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgaWYgKHQgJiYgdC50eXBlID09PSAnb3AnICYmICh0LnZhbHVlID09PSAnLScgfHwgdC52YWx1ZSA9PT0gJysnKSkge1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICBjb25zdCB2ID0gdGhpcy5wYXJzZVVuYXJ5KCk7XG4gICAgICAgICAgICByZXR1cm4gdC52YWx1ZSA9PT0gJy0nID8gLXRvTnVtKHYpIDogdG9OdW0odik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VQb3N0Zml4KCk7XG4gICAgfVxuICAgIHBhcnNlUG9zdGZpeCgpIHtcbiAgICAgICAgbGV0IHYgPSB0aGlzLnBhcnNlQXRvbSgpO1xuICAgICAgICB3aGlsZSh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIHRoaXMucGVlaygpLnZhbHVlID09PSAnJScpe1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICB2ID0gdG9OdW0odikgLyAxMDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIHBhcnNlQXRvbSgpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMubmV4dCgpO1xuICAgICAgICBpZiAoIXQpIHRocm93IG5ldyBFcnJvcigndW5leHBlY3RlZCBlbmQgb2YgZm9ybXVsYScpO1xuICAgICAgICBpZiAodC50eXBlID09PSAnbnVtJykgcmV0dXJuIE51bWJlcih0LnZhbHVlKTtcbiAgICAgICAgaWYgKHQudHlwZSA9PT0gJ3N0cicpIHJldHVybiB0LnZhbHVlO1xuICAgICAgICBpZiAodC50eXBlID09PSAnYm9vbCcpIHJldHVybiB0LnZhbHVlID09PSAnVFJVRSc7XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdzaGVldCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgaWYgKCFyZWYgfHwgcmVmLnR5cGUgIT09ICdyZWYnKSB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkIGNlbGwgcmVmIGFmdGVyIHNoZWV0Jyk7XG4gICAgICAgICAgICBjb25zdCBzaGVldFdzID0gdGhpcy5nZXRTaGVldCh0LnZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlUmFuZ2VPclZhbHVlKHNoZWV0V3MsIHJlZi52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQudHlwZSA9PT0gJ3JlZicpIHJldHVybiB0aGlzLnBhcnNlUmFuZ2VPclZhbHVlKHRoaXMud3MsIHQudmFsdWUpO1xuICAgICAgICBpZiAodC50eXBlID09PSAnaWRlbnQnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJygnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbEZ1bmN0aW9uKHQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIGlkZW50aWZpZXI6ICcgKyB0LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodC50eXBlID09PSAnb3AnICYmIHQudmFsdWUgPT09ICcoJykge1xuICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMucGFyc2VFeHByKCk7XG4gICAgICAgICAgICB0aGlzLmV4cGVjdE9wKCcpJyk7XG4gICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuZXhwZWN0ZWQgdG9rZW46ICcgKyB0LnZhbHVlKTtcbiAgICB9XG4gICAgcGFyc2VSYW5nZU9yVmFsdWUod3MsIGFkZHIpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMucGVlaygpO1xuICAgICAgICBpZiAodCAmJiB0LnR5cGUgPT09ICdvcCcgJiYgdC52YWx1ZSA9PT0gJzonKSB7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIGNvbnN0IGVuZCA9IHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgaWYgKCFlbmQgfHwgZW5kLnR5cGUgIT09ICdyZWYnKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCByYW5nZSBlbmQnKTtcbiAgICAgICAgICAgIGNvbnN0IGNlbGxzID0gdGhpcy5yYW5nZUNlbGxzKHdzLCBhZGRyLCBlbmQudmFsdWUpO1xuICAgICAgICAgICAgY29uc3QgYzEgPSB1dGlscy5kZWNvZGVfY2VsbChhZGRyLnJlcGxhY2UoL1xcJC9nLCAnJykpO1xuICAgICAgICAgICAgY29uc3QgYzIgPSB1dGlscy5kZWNvZGVfY2VsbChlbmQudmFsdWUucmVwbGFjZSgvXFwkL2csICcnKSk7XG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IE1hdGguYWJzKGMyLmMgLSBjMS5jKSArIDE7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIF9fcmFuZ2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjZWxscy5tYXAoKGMpPT50aGlzLnJlc29sdmVDZWxsKGMud3MsIGMuYWRkciwgdGhpcy5kZXB0aCkpLFxuICAgICAgICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnJlc29sdmVDZWxsKHdzLCBhZGRyLCB0aGlzLmRlcHRoKTtcbiAgICB9XG4gICAgZ2V0U2hlZXQobmFtZSkge1xuICAgICAgICBjb25zdCBzaGVldCA9IHRoaXMud2IuU2hlZXRzW25hbWVdID8/IHRoaXMud2IuU2hlZXRzW3RoaXMud2IuU2hlZXROYW1lcy5maW5kKChuKT0+bi50b0xvd2VyQ2FzZSgpID09PSBuYW1lLnRvTG93ZXJDYXNlKCkpID8/ICcnXTtcbiAgICAgICAgaWYgKCFzaGVldCkgdGhyb3cgbmV3IEVycm9yKCdzaGVldCBub3QgZm91bmQ6ICcgKyBuYW1lKTtcbiAgICAgICAgcmV0dXJuIHNoZWV0O1xuICAgIH1cbiAgICByYW5nZUNlbGxzKHdzLCBhLCBiKSB7XG4gICAgICAgIGNvbnN0IGNsZWFuQSA9IGEucmVwbGFjZSgvXFwkL2csICcnKTtcbiAgICAgICAgY29uc3QgY2xlYW5CID0gYi5yZXBsYWNlKC9cXCQvZywgJycpO1xuICAgICAgICBjb25zdCBjb2xPbmx5ID0gKHMpPT4vXltBLVphLXpdKyQvLnRlc3Qocyk7XG4gICAgICAgIGxldCByMSwgcjIsIGNNaW4sIGNNYXg7XG4gICAgICAgIGlmIChjb2xPbmx5KGNsZWFuQSkgfHwgY29sT25seShjbGVhbkIpKSB7XG4gICAgICAgICAgICAvLyBXaG9sZS1jb2x1bW4gcmFuZ2UgKEE6QSwgJEM6JEFHKTogYm91bmQgcm93cyBieSB0aGUgc2hlZXQncyB1c2VkIHJhbmdlXG4gICAgICAgICAgICBjb25zdCBtYXhSb3cgPSB3c1snIXJlZiddID8gdXRpbHMuZGVjb2RlX3JhbmdlKHdzWychcmVmJ10pLmUuciA6IDA7XG4gICAgICAgICAgICBjb25zdCBjb2xJbmRleCA9IChzKT0+e1xuICAgICAgICAgICAgICAgIGxldCBjID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHMudG9VcHBlckNhc2UoKSljID0gYyAqIDI2ICsgKGNoLmNoYXJDb2RlQXQoMCkgLSA2NCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMgLSAxOyAvLyAwLWJhc2VkXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgY0EgPSBjb2xPbmx5KGNsZWFuQSkgPyBjb2xJbmRleChjbGVhbkEpIDogdXRpbHMuZGVjb2RlX2NlbGwoY2xlYW5BKS5jO1xuICAgICAgICAgICAgY29uc3QgY0IgPSBjb2xPbmx5KGNsZWFuQikgPyBjb2xJbmRleChjbGVhbkIpIDogdXRpbHMuZGVjb2RlX2NlbGwoY2xlYW5CKS5jO1xuICAgICAgICAgICAgY01pbiA9IE1hdGgubWluKGNBLCBjQik7XG4gICAgICAgICAgICBjTWF4ID0gTWF0aC5tYXgoY0EsIGNCKTtcbiAgICAgICAgICAgIHIxID0gMDtcbiAgICAgICAgICAgIHIyID0gbWF4Um93O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgYzEgPSB1dGlscy5kZWNvZGVfY2VsbChjbGVhbkEpO1xuICAgICAgICAgICAgY29uc3QgYzIgPSB1dGlscy5kZWNvZGVfY2VsbChjbGVhbkIpO1xuICAgICAgICAgICAgcjEgPSBNYXRoLm1pbihjMS5yLCBjMi5yKTtcbiAgICAgICAgICAgIHIyID0gTWF0aC5tYXgoYzEuciwgYzIucik7XG4gICAgICAgICAgICBjTWluID0gTWF0aC5taW4oYzEuYywgYzIuYyk7XG4gICAgICAgICAgICBjTWF4ID0gTWF0aC5tYXgoYzEuYywgYzIuYyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY291bnQgPSAocjIgLSByMSArIDEpICogKGNNYXggLSBjTWluICsgMSk7XG4gICAgICAgIGlmIChjb3VudCA+IE1BWF9SQU5HRV9DRUxMUykgdGhyb3cgbmV3IEVycm9yKCdyYW5nZSB0b28gbGFyZ2UnKTtcbiAgICAgICAgY29uc3Qgb3V0ID0gW107XG4gICAgICAgIGZvcihsZXQgciA9IHIxOyByIDw9IHIyOyByKyspe1xuICAgICAgICAgICAgZm9yKGxldCBjID0gY01pbjsgYyA8PSBjTWF4OyBjKyspe1xuICAgICAgICAgICAgICAgIG91dC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgd3MsXG4gICAgICAgICAgICAgICAgICAgIGFkZHI6IHV0aWxzLmVuY29kZV9jZWxsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgcmVzb2x2ZUNlbGwod3MsIGFkZHIsIGRlcHRoKSB7XG4gICAgICAgIGlmIChkZXB0aCA+IE1BWF9ERVBUSCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgLy8gQWJzb2x1dGUgcmVmcyAoJEEkNyAvICRBNykgbXVzdCBiZSBzdHJpcHBlZCBiZWZvcmUga2V5aW5nIGludG8gdGhlIHNoZWV0XG4gICAgICAgIGNvbnN0IGNsZWFuID0gYWRkci5yZXBsYWNlKC9cXCQvZywgJycpO1xuICAgICAgICBjb25zdCBjZWxsID0gd3NbY2xlYW5dO1xuICAgICAgICAvLyBFeGNlbCBjb2VyY2VzIHJlZmVyZW5jZXMgdG8gZW1wdHkvbWlzc2luZyBjZWxscyB0byAwIGluIG51bWVyaWMgY29udGV4dHNcbiAgICAgICAgLy8gKGhhbmRsZWQgaW4gdG9OdW0pIGFuZCB0byBcIlwiIGluIHRleHQgY29udGV4dHMgKGhhbmRsZWQgaW4gdGV4dCBoZWxwZXJzKS5cbiAgICAgICAgaWYgKCFjZWxsKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoY2VsbC52ICE9PSB1bmRlZmluZWQgJiYgY2VsbC52ICE9PSBudWxsKSByZXR1cm4gY2VsbC52O1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwuZiA9PT0gJ3N0cmluZycgJiYgY2VsbC5mLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgICAgIC8vIE9PWE1MIHN0b3JlcyBmb3JtdWxhcyBXSVRIT1VUIHRoZSBsZWFkaW5nICc9Jzsgbm9ybWFsaXplIGJlZm9yZSBldmFsdWF0aW5nXG4gICAgICAgICAgICBjb25zdCBmID0gY2VsbC5mLnRyaW0oKS5zdGFydHNXaXRoKCc9JykgPyBjZWxsLmYudHJpbSgpIDogJz0nICsgY2VsbC5mLnRyaW0oKTtcbiAgICAgICAgICAgIGNvbnN0IHN1YiA9IGV2YWx1YXRlRm9ybXVsYSh0aGlzLndiLCB3cywgZiwgZGVwdGggKyAxLCBjbGVhbik7XG4gICAgICAgICAgICAvLyBBIHJlZmVyZW5jZWQgY2VsbCB3aG9zZSBmb3JtdWxhIGZhaWxzIGlzIGEgcmVhbCBlcnJvciBpbiBFeGNlbCB0b28gXHUyMDE0XG4gICAgICAgICAgICAvLyBwcm9wYWdhdGUgaXQgKHNvIElGRVJST1IgY2FuIGNhdGNoLCBhbmQgdG9wLWxldmVsIHN0YXlzIHVuZXZhbHVhYmxlKVxuICAgICAgICAgICAgLy8gaW5zdGVhZCBvZiBzaWxlbnRseSB0cmVhdGluZyBpdCBhcyBhbiBlbXB0eSBjZWxsLlxuICAgICAgICAgICAgaWYgKHN1Yi51bmV2YWx1YWJsZSkgdGhyb3cgbmV3IEVycm9yKCdyZWZlcmVuY2VkIGNlbGwgZm9ybXVsYSB1bmV2YWx1YWJsZTogJyArIGNsZWFuKTtcbiAgICAgICAgICAgIHJldHVybiBzdWIudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLyoqXG4gICAqIFNraXAgdG9rZW5zIG9mIGFuIGV4cHJlc3Npb24gd2l0aG91dCBldmFsdWF0aW5nICh1c2VkIGZvciBsYXp5IElGJ3NcbiAgICogdW50YWtlbiBicmFuY2gpLiBTdG9wcyBiZWZvcmUgdGhlIG5leHQgdG9wLWxldmVsICcsJyBvciAnKScuXG4gICAqLyBza2lwRXhwcigpIHtcbiAgICAgICAgbGV0IGRlcHRoID0gMDtcbiAgICAgICAgd2hpbGUodGhpcy5wb3MgPCB0aGlzLnRva2Vucy5sZW5ndGgpe1xuICAgICAgICAgICAgY29uc3QgdCA9IHRoaXMudG9rZW5zW3RoaXMucG9zXTtcbiAgICAgICAgICAgIGlmICh0LnR5cGUgPT09ICdvcCcpIHtcbiAgICAgICAgICAgICAgICBpZiAodC52YWx1ZSA9PT0gJygnKSBkZXB0aCsrO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHQudmFsdWUgPT09ICcpJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVwdGggPT09IDApIHJldHVybjsgLy8gc3RvcHBlZCBiZWZvcmUgJyknXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoLS07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0LnZhbHVlID09PSAnLCcgJiYgZGVwdGggPT09IDApIHJldHVybjsgLy8gc3RvcHBlZCBiZWZvcmUgJywnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnBvcysrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhbGxGdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIC8vIElGIGlzIGxhenkgaW4gRXhjZWw6IG9ubHkgdGhlIHRha2VuIGJyYW5jaCBpcyBldmFsdWF0ZWQgKGF2b2lkc1xuICAgICAgICAvLyBkaXZpZGUtYnktemVybyBldGMuIG9uIHRoZSB1bnRha2VuIGJyYW5jaCkuXG4gICAgICAgIGlmIChuYW1lID09PSAnSUYnKSB7XG4gICAgICAgICAgICB0aGlzLmV4cGVjdE9wKCcoJyk7XG4gICAgICAgICAgICBjb25zdCBjb25kID0gdGhpcy5wYXJzZUV4cHIoKTtcbiAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJywnKTtcbiAgICAgICAgICAgIGlmICh0cnV0aHkoY29uZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdGhpcy5wYXJzZUV4cHIoKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zdW1lIG9wdGlvbmFsIGVsc2UgYnJhbmNoIHdpdGhvdXQgZXZhbHVhdGluZyBpdFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIHRoaXMucGVlaygpLnZhbHVlID09PSAnLCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2tpcEV4cHIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKScpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29uZCBmYWxzeTogc2tpcCB0aGUgdGhlbi1icmFuY2gsIGV2YWx1YXRlIHRoZSBlbHNlIGJyYW5jaFxuICAgICAgICAgICAgdGhpcy5za2lwRXhwcigpO1xuICAgICAgICAgICAgaWYgKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgdGhpcy5wZWVrKCkudmFsdWUgPT09ICcsJykge1xuICAgICAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLnBhcnNlRXhwcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJyknKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJyknKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJRkVSUk9SIGV2YWx1YXRlcyBpdHMgZmlyc3QgYXJndW1lbnQgaW4gXCJzb2Z0XCIgbW9kZTogYW55IGVycm9yL3VuZXZhbHVhYmxlXG4gICAgICAgIC8vIHJlc3VsdCBmYWxscyBiYWNrIHRvIHRoZSBzZWNvbmQgYXJndW1lbnQgaW5zdGVhZCBvZiBmYWlsaW5nIHRoZSBmb3JtdWxhLlxuICAgICAgICBpZiAobmFtZSA9PT0gJ0lGRVJST1InKSB7XG4gICAgICAgICAgICB0aGlzLmV4cGVjdE9wKCcoJyk7XG4gICAgICAgICAgICBjb25zdCBzdGFydFBvcyA9IHRoaXMucG9zO1xuICAgICAgICAgICAgbGV0IGZpcnN0O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmaXJzdCA9IHRoaXMucGFyc2VFeHByKCk7XG4gICAgICAgICAgICB9IGNhdGNoICB7XG4gICAgICAgICAgICAgICAgZmlyc3QgPSB1bmRlZmluZWQ7IC8vIGV2YWx1YXRpb24gZXJyb3IgLT4gdXNlIGZhbGxiYWNrXG4gICAgICAgICAgICAgICAgLy8gT24gYSBuZXN0ZWQgZXJyb3IgdGhlIGN1cnNvciBpcyBsZWZ0IG1pZC1leHByZXNzaW9uOyBzZWVrIGZvcndhcmRcbiAgICAgICAgICAgICAgICAvLyBmcm9tIHRoZSBzdGFydCBvZiB0aGUgdmFsdWUgYXJndW1lbnQgdG8gaXRzIHRvcC1sZXZlbCAnLCcgKHRoZVxuICAgICAgICAgICAgICAgIC8vIGZhbGxiYWNrIHNlcGFyYXRvcikgb3IgdG8gdGhlIGNsb3NpbmcgJyknIGlmIHRoZXJlIGlzIG5vIGZhbGxiYWNrLlxuICAgICAgICAgICAgICAgIGxldCBkZXB0aCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3MgPSBzdGFydFBvcztcbiAgICAgICAgICAgICAgICB3aGlsZSh0aGlzLnBvcyA8IHRoaXMudG9rZW5zLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSB0aGlzLnRva2Vuc1t0aGlzLnBvc107XG4gICAgICAgICAgICAgICAgICAgIGlmICh0LnR5cGUgPT09ICdvcCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0LnZhbHVlID09PSAnKCcpIGRlcHRoKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0LnZhbHVlID09PSAnKScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVwdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSAvLyBubyBmYWxsYmFjazogc3RvcCBhdCBJRkVSUk9SJ3MgJyknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGgtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodC52YWx1ZSA9PT0gJywnICYmIGRlcHRoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MrKzsgLy8gY29uc3VtZSBmYWxsYmFjayBzZXBhcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcysrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENvbW1hLXNlcGFyYXRlZCBmYWxsYmFjayBhcmd1bWVudFxuICAgICAgICAgICAgaWYgKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgdGhpcy5wZWVrKCkudmFsdWUgPT09ICcsJykgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICBjb25zdCBmYWxsYmFjayA9IHRoaXMucGFyc2VFeHByKCk7XG4gICAgICAgICAgICB0aGlzLmV4cGVjdE9wKCcpJyk7XG4gICAgICAgICAgICByZXR1cm4gZmlyc3QgPT09IHVuZGVmaW5lZCA/IGZhbGxiYWNrIDogZmlyc3Q7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5leHBlY3RPcCgnKCcpO1xuICAgICAgICBjb25zdCBhcmdzID0gW107XG4gICAgICAgIGlmICghKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgdGhpcy5wZWVrKCkudmFsdWUgPT09ICcpJykpIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaCh0aGlzLnBhcnNlRXhwcigpKTtcbiAgICAgICAgICAgIHdoaWxlKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgdGhpcy5wZWVrKCkudmFsdWUgPT09ICcsJyl7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKHRoaXMucGFyc2VFeHByKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXhwZWN0T3AoJyknKTtcbiAgICAgICAgcmV0dXJuIGFwcGx5RnVuY3Rpb24obmFtZSwgYXJncywgdGhpcy5jdXJyZW50Q2VsbEFkZHIpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNvbXBhcmUob3AsIGEsIGIpIHtcbiAgICBpZiAodHlwZW9mIGEgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBiID09PSAnc3RyaW5nJykge1xuICAgICAgICBzd2l0Y2gob3Ape1xuICAgICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgICAgICAgICBjYXNlICc8Pic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgIT09IGI7XG4gICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYSA8IGI7XG4gICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYSA+IGI7XG4gICAgICAgICAgICBjYXNlICc8PSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPD0gYjtcbiAgICAgICAgICAgIGNhc2UgJz49JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYSA+PSBiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHggPSB0b051bShhKSwgeSA9IHRvTnVtKGIpO1xuICAgIHN3aXRjaChvcCl7XG4gICAgICAgIGNhc2UgJz0nOlxuICAgICAgICAgICAgcmV0dXJuIHggPT09IHk7XG4gICAgICAgIGNhc2UgJzw+JzpcbiAgICAgICAgICAgIHJldHVybiB4ICE9PSB5O1xuICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgIHJldHVybiB4IDwgeTtcbiAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICByZXR1cm4geCA+IHk7XG4gICAgICAgIGNhc2UgJzw9JzpcbiAgICAgICAgICAgIHJldHVybiB4IDw9IHk7XG4gICAgICAgIGNhc2UgJz49JzpcbiAgICAgICAgICAgIHJldHVybiB4ID49IHk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignYmFkIGNvbXBhcmlzb24nKTtcbn1cbmZ1bmN0aW9uIGFyaXRoKG9wLCBhLCBiKSB7XG4gICAgY29uc3QgeCA9IHRvTnVtKGEpLCB5ID0gdG9OdW0oYik7XG4gICAgc3dpdGNoKG9wKXtcbiAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICByZXR1cm4geCArIHk7XG4gICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgcmV0dXJuIHggLSB5O1xuICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgIHJldHVybiB4ICogeTtcbiAgICAgICAgY2FzZSAnLyc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKHkgPT09IDApIHRocm93IG5ldyBFcnJvcignZGl2aWRlIGJ5IHplcm8nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geCAvIHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ14nOlxuICAgICAgICAgICAgcmV0dXJuIE1hdGgucG93KHgsIHkpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBvcGVyYXRvcicpO1xufVxuZnVuY3Rpb24gZmxhdHRlbihhcmdzKSB7XG4gICAgY29uc3Qgb3V0ID0gW107XG4gICAgZm9yIChjb25zdCBhIG9mIGFyZ3Mpe1xuICAgICAgICBpZiAoaXNSYW5nZShhKSkgb3V0LnB1c2goLi4uYS52YWx1ZXMpO1xuICAgICAgICBlbHNlIG91dC5wdXNoKGEpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufVxuZnVuY3Rpb24gbnVtYmVycyhhcmdzKSB7XG4gICAgY29uc3Qgb3V0ID0gW107XG4gICAgZm9yIChjb25zdCB2IG9mIGZsYXR0ZW4oYXJncykpe1xuICAgICAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInKSBvdXQucHVzaCh2KTtcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykgb3V0LnB1c2godiA/IDEgOiAwKTtcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHYgPT09ICdzdHJpbmcnICYmIHYudHJpbSgpICE9PSAnJykge1xuICAgICAgICAgICAgY29uc3QgbiA9IE51bWJlcih2LnRyaW0oKSk7XG4gICAgICAgICAgICBpZiAoaXNGaW5pdGUobikpIG91dC5wdXNoKG4pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59XG5mdW5jdGlvbiB0b051bVNhZmUodikge1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpIHJldHVybiB2O1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycgJiYgdi50cmltKCkgIT09ICcnKSB7XG4gICAgICAgIGNvbnN0IG4gPSBOdW1iZXIodi50cmltKCkpO1xuICAgICAgICByZXR1cm4gaXNGaW5pdGUobikgPyBuIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuLyoqIENvbGxhcHNlIHdoaXRlc3BhY2UgKyB0cmltIChFeGNlbCBUUklNKS4gKi8gZnVuY3Rpb24gZXhjZWxUcmltKHYpIHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiBcIlwiO1xuICAgIHJldHVybiBTdHJpbmcodiA/PyAnJykucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKTtcbn1cbi8qKiBFeGNlbCBQUk9QRVI6IHVwcGVyY2FzZSBmaXJzdCBsZXR0ZXIgb2YgZXZlcnkgd29yZCwgbG93ZXJjYXNlIHRoZSByZXN0LiAqLyBmdW5jdGlvbiBleGNlbFByb3Blcih2KSB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsKSByZXR1cm4gXCJcIjsgLy8gRXhjZWw6IGVtcHR5IGNlbGwgaW4gdGV4dCBjb250ZXh0XG4gICAgcmV0dXJuIFN0cmluZyh2ID8/ICcnKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLyhefFteQS1aYS16MC05XSkoW2Etel0pL2csIChfLCBwLCBjKT0+cCArIGMudG9VcHBlckNhc2UoKSk7XG59XG4vKiogRXhjZWwgc2VyaWFsIGRhdGUgLT4geyB5LCBtLCBkIH0gaW4gdGhlIDE5MDAgZGF0ZSBzeXN0ZW0gKGluY2wuIGZha2UgMTkwMC0wMi0yOSkuICovIGZ1bmN0aW9uIHNlcmlhbFRvRGF0ZShzZXJpYWwpIHtcbiAgICAvLyBTZXJpYWwgMSA9IDE5MDAtMDEtMDE7IHNlcmlhbCA2MCA9IGZha2UgMTkwMC0wMi0yOTsgc2VyaWFsID49IDYxIG9mZnNldCBieSBvbmUgZGF5LlxuICAgIGNvbnN0IGRheXMgPSBNYXRoLmZsb29yKHNlcmlhbCkgKyAoc2VyaWFsID49IDYwID8gLTEgOiAwKTtcbiAgICAvLyBFeGNlbCBzZXJpYWwgMSA9IDE5MDAtMDEtMDEgPSBiYXNlICsgMSBkYXk7IHNlcmlhbCA+PSA2MSBsb3NlcyB0aGUgZmFrZVxuICAgIC8vIDE5MDAtMDItMjkgKHNlcmlhbCA2MCksIHNvIHJlYWwgZWxhcHNlZCBkYXlzID0gc2VyaWFsIC0gMS5cbiAgICBjb25zdCBtcyA9IGRheXMgKiA4NjQwMDAwMDtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoMTg5OSwgMTEsIDMxKSArIG1zKTtcbiAgICByZXR1cm4ge1xuICAgICAgICB5OiBkYXRlLmdldFVUQ0Z1bGxZZWFyKCksXG4gICAgICAgIG06IGRhdGUuZ2V0VVRDTW9udGgoKSArIDEsXG4gICAgICAgIGQ6IGRhdGUuZ2V0VVRDRGF0ZSgpXG4gICAgfTtcbn1cbi8qKiBCdWlsZCBhbiBFeGNlbCBzZXJpYWwgZGF0ZSBmcm9tIHkvbS9kICgxOTAwIHN5c3RlbSwgaW5jbC4gZmFrZSAxOTAwLTAyLTI5KS4gKi8gZnVuY3Rpb24gZGF0ZVRvU2VyaWFsKHksIG0sIGQpIHtcbiAgICBjb25zdCBkdCA9IG5ldyBEYXRlKERhdGUuVVRDKHksIG0gLSAxLCBkKSk7XG4gICAgY29uc3Qgc2VyaWFsID0gTWF0aC5mbG9vcigoZHQuZ2V0VGltZSgpIC0gRGF0ZS5VVEMoMTg5OSwgMTEsIDMxKSkgLyA4NjQwMDAwMCk7XG4gICAgcmV0dXJuIHNlcmlhbCA+PSA2MCA/IHNlcmlhbCArIDEgOiBzZXJpYWw7IC8vIG9mZnNldCBmb3IgdGhlIGZha2UgMTkwMC0wMi0yOVxufVxuLyoqIE1pbmltYWwgRXhjZWwgVEVYVCBmb3JtYXRzOiBudW1lcmljICgwLCAwLjAwLCAjLCMjMCwgIywjIzAuMDAsIDAlLCAwLjAlKSBhbmQgZGF0ZSB0b2tlbnMgKHl5eXkgeXkgbW1tbSBtbW0gbW0gbSBkZGRkIGRkZCBkZCBkIGhoIGggbW0gbSBzcyBzKS4gVGhyb3dzIG9uIHVucmVjb2duaXplZCBmb3JtYXRzLiAqLyBmdW5jdGlvbiBleGNlbFRleHRGb3JtYXQodiwgZm9ybWF0KSB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICBjb25zdCBmbXQgPSBTdHJpbmcoZm9ybWF0KTtcbiAgICBjb25zdCBudW0gPSB0eXBlb2YgdiA9PT0gJ251bWJlcicgPyB2IDogTnVtYmVyKFN0cmluZyh2ID8/ICcnKS50cmltKCkpO1xuICAgIGNvbnN0IGlzRGF0ZUxpa2UgPSAvW3lZZERoSG1Nc1NdLy50ZXN0KGZtdC5yZXBsYWNlKC9bXmEtekEtWl0vZywgJycpKSAmJiAveXxkfGh8cy9pLnRlc3QoZm10KTtcbiAgICBpZiAoaXNEYXRlTGlrZSAmJiBpc0Zpbml0ZShudW0pKSB7XG4gICAgICAgIGNvbnN0IHsgeSwgbSwgZCB9ID0gc2VyaWFsVG9EYXRlKG51bSk7XG4gICAgICAgIGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihudW0gJSAxICogMjQpO1xuICAgICAgICBjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcigobnVtICUgMSAqIDI0IC0gaG91cnMpICogNjApO1xuICAgICAgICBjb25zdCBzZWNvbmRzID0gTWF0aC5yb3VuZCgoKG51bSAlIDEgKiAyNCAtIGhvdXJzKSAqIDYwIC0gbWludXRlcykgKiA2MCk7XG4gICAgICAgIGNvbnN0IGRheU5hbWVzID0gW1xuICAgICAgICAgICAgJ1N1bmRheScsXG4gICAgICAgICAgICAnTW9uZGF5JyxcbiAgICAgICAgICAgICdUdWVzZGF5JyxcbiAgICAgICAgICAgICdXZWRuZXNkYXknLFxuICAgICAgICAgICAgJ1RodXJzZGF5JyxcbiAgICAgICAgICAgICdGcmlkYXknLFxuICAgICAgICAgICAgJ1NhdHVyZGF5J1xuICAgICAgICBdO1xuICAgICAgICBjb25zdCBtb250aE5hbWVzID0gW1xuICAgICAgICAgICAgJ0phbnVhcnknLFxuICAgICAgICAgICAgJ0ZlYnJ1YXJ5JyxcbiAgICAgICAgICAgICdNYXJjaCcsXG4gICAgICAgICAgICAnQXByaWwnLFxuICAgICAgICAgICAgJ01heScsXG4gICAgICAgICAgICAnSnVuZScsXG4gICAgICAgICAgICAnSnVseScsXG4gICAgICAgICAgICAnQXVndXN0JyxcbiAgICAgICAgICAgICdTZXB0ZW1iZXInLFxuICAgICAgICAgICAgJ09jdG9iZXInLFxuICAgICAgICAgICAgJ05vdmVtYmVyJyxcbiAgICAgICAgICAgICdEZWNlbWJlcidcbiAgICAgICAgXTtcbiAgICAgICAgY29uc3Qgd2QgPSBuZXcgRGF0ZShEYXRlLlVUQyh5LCBtIC0gMSwgZCkpLmdldFVUQ0RheSgpO1xuICAgICAgICBjb25zdCByZXAgPSB7XG4gICAgICAgICAgICAneXl5eSc6IFN0cmluZyh5KSxcbiAgICAgICAgICAgICd5eSc6IFN0cmluZyh5KS5zbGljZSgtMiksXG4gICAgICAgICAgICAnbW1tbSc6IG1vbnRoTmFtZXNbbSAtIDFdLFxuICAgICAgICAgICAgJ21tbSc6IG1vbnRoTmFtZXNbbSAtIDFdLnNsaWNlKDAsIDMpLFxuICAgICAgICAgICAgJ21vbic6IFN0cmluZyhtKS5wYWRTdGFydCgyLCAnMCcpLFxuICAgICAgICAgICAgJ21vbjEnOiBTdHJpbmcobSksXG4gICAgICAgICAgICAnZGRkZCc6IGRheU5hbWVzW3dkXSxcbiAgICAgICAgICAgICdkZGQnOiBkYXlOYW1lc1t3ZF0uc2xpY2UoMCwgMyksXG4gICAgICAgICAgICAnZGQnOiBTdHJpbmcoZCkucGFkU3RhcnQoMiwgJzAnKSxcbiAgICAgICAgICAgICdkJzogU3RyaW5nKGQpLFxuICAgICAgICAgICAgJ2hoJzogU3RyaW5nKGhvdXJzKS5wYWRTdGFydCgyLCAnMCcpLFxuICAgICAgICAgICAgJ2gnOiBTdHJpbmcoaG91cnMpLFxuICAgICAgICAgICAgJ21pbic6IFN0cmluZyhtaW51dGVzKS5wYWRTdGFydCgyLCAnMCcpLFxuICAgICAgICAgICAgJ21pbjEnOiBTdHJpbmcobWludXRlcyksXG4gICAgICAgICAgICAnc3MnOiBTdHJpbmcoc2Vjb25kcykucGFkU3RhcnQoMiwgJzAnKSxcbiAgICAgICAgICAgICdzJzogU3RyaW5nKHNlY29uZHMpXG4gICAgICAgIH07XG4gICAgICAgIC8vIFRva2VuLWJhc2VkIHJlcGxhY2UsIGxvbmdlc3QgbWF0Y2hlcyBmaXJzdC4gRXhjZWwgcnVsZTogJ21tJy8nbScgYXJlXG4gICAgICAgIC8vIE1JTlVURVMgd2hlbiB0aGUgZm9ybWF0IGNvbnRhaW5zIGFuIGhvdXIgdG9rZW4sIG90aGVyd2lzZSBNT05USC5cbiAgICAgICAgY29uc3QgaGFzSG91ciA9IC9oL2kudGVzdChmbXQpO1xuICAgICAgICByZXR1cm4gZm10LnJlcGxhY2UoL3l5eXl8eXl8bW1tbXxtbW18ZGRkZHxkZGR8aGh8c3N8ZGR8bW18ZHxtfGh8cy9naSwgKHRvayk9PntcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRvay50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ21tJykgcmV0dXJuIGhhc0hvdXIgPyByZXBbJ21pbiddIDogcmVwWydtb24nXTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdtJykgcmV0dXJuIGhhc0hvdXIgPyByZXBbJ21pbjEnXSA6IHJlcFsnbW9uMSddO1xuICAgICAgICAgICAgcmV0dXJuIHJlcFtrZXldID8/IHRvaztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmICghaXNGaW5pdGUobnVtKSkgcmV0dXJuIFN0cmluZyh2ID8/ICcnKTtcbiAgICBjb25zdCBwY3QgPSBmbXQuaW5jbHVkZXMoJyUnKTtcbiAgICBjb25zdCBkZWNpbWFscyA9IChmbXQubWF0Y2goLzArXFwuKDArKS8pID8/IFtdKVsxXT8ubGVuZ3RoID8/IDA7XG4gICAgY29uc3QgZ3JvdXBpbmcgPSBmbXQuaW5jbHVkZXMoJywnKTtcbiAgICBjb25zdCB2YWx1ZSA9IHBjdCA/IG51bSAqIDEwMCA6IG51bTtcbiAgICBsZXQgb3V0ID0gdmFsdWUudG9GaXhlZChkZWNpbWFscyk7XG4gICAgaWYgKGdyb3VwaW5nKSB7XG4gICAgICAgIGNvbnN0IFtpbnQsIGRlY10gPSBvdXQuc3BsaXQoJy4nKTtcbiAgICAgICAgb3V0ID0gaW50LnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csICcsJykgKyAoZGVjID8gJy4nICsgZGVjIDogJycpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0ICsgKHBjdCA/ICclJyA6ICcnKTtcbn1cbi8qKiBFeGNlbCBtYXRjaCBmb3IgVkxPT0tVUC9NQVRDSDogZXhhY3QgKDApIG9yIGFwcHJveGltYXRlICgxLy0xKS4gUmV0dXJucyAxLWJhc2VkIGluZGV4IG9yIC0xLiAqLyBmdW5jdGlvbiBmaW5kTWF0Y2gobG9va3VwLCBhcnIsIHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PT0gMCkge1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGNvbnN0IGEgPSBhcnJbaV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGxvb2t1cCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGEgPT09ICdudW1iZXInICYmIGxvb2t1cCA9PT0gYSkgcmV0dXJuIGkgKyAxO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBsb29rdXAgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBhID09PSAnc3RyaW5nJyAmJiBleGNlbFRyaW0obG9va3VwKS50b0xvd2VyQ2FzZSgpID09PSBleGNlbFRyaW0oYSkudG9Mb3dlckNhc2UoKSkgcmV0dXJuIGkgKyAxO1xuICAgICAgICAgICAgaWYgKFN0cmluZyhsb29rdXApLnRvTG93ZXJDYXNlKCkgPT09IFN0cmluZyhhID8/ICcnKS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gaSArIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICAvLyBBcHByb3hpbWF0ZTogYXNzdW1lIGFzY2VuZGluZyAodHlwZSAxKSAtPiBsYXJnZXN0IDw9IGxvb2t1cDsgZGVzY2VuZGluZyAoLTEpIC0+IHNtYWxsZXN0ID49IGxvb2t1cFxuICAgIGxldCBiZXN0ID0gLTE7XG4gICAgaWYgKHR5cGUgPT09IDEpIHtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBjb25zdCBhID0gdG9OdW1TYWZlKGFycltpXSk7XG4gICAgICAgICAgICBjb25zdCBsID0gdG9OdW1TYWZlKGxvb2t1cCk7XG4gICAgICAgICAgICBpZiAoYSAhPT0gdW5kZWZpbmVkICYmIGwgIT09IHVuZGVmaW5lZCAmJiBhIDw9IGwpIGJlc3QgPSBpICsgMTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gLTEpIHtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBjb25zdCBhID0gdG9OdW1TYWZlKGFycltpXSk7XG4gICAgICAgICAgICBjb25zdCBsID0gdG9OdW1TYWZlKGxvb2t1cCk7XG4gICAgICAgICAgICBpZiAoYSAhPT0gdW5kZWZpbmVkICYmIGwgIT09IHVuZGVmaW5lZCAmJiBhID49IGwgJiYgKGJlc3QgPT09IC0xIHx8IGEgPD0gdG9OdW1TYWZlKGFycltiZXN0IC0gMV0pKSkgYmVzdCA9IGkgKyAxO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXN0O1xufVxuLyoqIEV4Y2VsIFNVTUlGIGNyaXRlcmlhOiBudW1iZXIsIHBsYWluIHRleHQgKHdpbGRjYXJkcyAqID8gc3VwcG9ydGVkKSwgb3Igb3BlcmF0b3ItcHJlZml4ZWQgKFwiPDVcIiwgXCI+PTEwMFwiLCBcIjw+MFwiKS4gKi8gZnVuY3Rpb24gY3JpdGVyaWFNYXRjaGVzKHZhbHVlLCBjcml0ZXJpYSkge1xuICAgIGNvbnN0IHYgPSB2YWx1ZSA/PyAnJztcbiAgICBpZiAodHlwZW9mIGNyaXRlcmlhID09PSAnbnVtYmVyJykgcmV0dXJuIHR5cGVvZiB2ID09PSAnbnVtYmVyJyA/IHYgPT09IGNyaXRlcmlhIDogTnVtYmVyKFN0cmluZyh2KSkgPT09IGNyaXRlcmlhO1xuICAgIGNvbnN0IGNyaXQgPSBleGNlbFRyaW0oY3JpdGVyaWEpO1xuICAgIGlmIChjcml0ID09PSAnJykgcmV0dXJuIHYgPT09ICcnIHx8IHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IG0gPSBjcml0Lm1hdGNoKC9eKDw9fD49fDw+fDx8Pnw9KT8oLiopJC9zKTtcbiAgICBjb25zdCBvcCA9IG0/LlsxXSA/PyAnPSc7XG4gICAgbGV0IHRhcmdldCA9IG0/LlsyXSA/PyAnJztcbiAgICBjb25zdCBudW1lcmljVGFyZ2V0ID0gdG9OdW1TYWZlKHRhcmdldCk7XG4gICAgY29uc3QgbnVtZXJpY1ZhbCA9IHRvTnVtU2FmZSh2KTtcbiAgICBpZiAob3AgIT09ICc9JyAmJiBudW1lcmljVGFyZ2V0ICE9PSB1bmRlZmluZWQgJiYgbnVtZXJpY1ZhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN3aXRjaChvcCl7XG4gICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtZXJpY1ZhbCA8IG51bWVyaWNUYXJnZXQ7XG4gICAgICAgICAgICBjYXNlICc8PSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bWVyaWNWYWwgPD0gbnVtZXJpY1RhcmdldDtcbiAgICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgICAgIHJldHVybiBudW1lcmljVmFsID4gbnVtZXJpY1RhcmdldDtcbiAgICAgICAgICAgIGNhc2UgJz49JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtZXJpY1ZhbCA+PSBudW1lcmljVGFyZ2V0O1xuICAgICAgICAgICAgY2FzZSAnPD4nOlxuICAgICAgICAgICAgICAgIHJldHVybiBudW1lcmljVmFsICE9PSBudW1lcmljVGFyZ2V0O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFdpbGRjYXJkIG1hdGNoaW5nIGZvciBlcXVhbGl0eSAoRXhjZWwgKiBhbmQgPylcbiAgICBpZiAodGFyZ2V0LmluY2x1ZGVzKCcqJykgfHwgdGFyZ2V0LmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgY29uc3QgcnggPSAnXicgKyB0YXJnZXQucmVwbGFjZSgvWy4rXiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJykucmVwbGFjZSgvXFwqL2csICcuKicpLnJlcGxhY2UoL1xcPy9nLCAnLicpICsgJyQnO1xuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChyeCwgJ2knKS50ZXN0KFN0cmluZyh2ID8/ICcnKSk7XG4gICAgfVxuICAgIGNvbnN0IHMxID0gU3RyaW5nKHYgPz8gJycpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IHMyID0gdGFyZ2V0LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChvcCA9PT0gJzw+JykgcmV0dXJuIHMxICE9PSBzMjtcbiAgICByZXR1cm4gczEgPT09IHMyO1xufVxuZnVuY3Rpb24gYXBwbHlGdW5jdGlvbihuYW1lLCBhcmdzLCB0aGlzQ2VsbEFkZHIpIHtcbiAgICBjb25zdCBudW1zID0gbnVtYmVycyhhcmdzKTtcbiAgICBjb25zdCBzdW0gPSAoKT0+bnVtcy5yZWR1Y2UoKHMsIHYpPT5zICsgdiwgMCk7XG4gICAgc3dpdGNoKG5hbWUpe1xuICAgICAgICBjYXNlICdTVU0nOlxuICAgICAgICAgICAgcmV0dXJuIHN1bSgpO1xuICAgICAgICBjYXNlICdBVkVSQUdFJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoIW51bXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0FWRVJBR0Ugb2YgZW1wdHknKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VtKCkgLyBudW1zLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnTUlOJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoIW51bXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ01JTiBvZiBlbXB0eScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLm1pbiguLi5udW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnTUFYJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoIW51bXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ01BWCBvZiBlbXB0eScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLm1heCguLi5udW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnQ09VTlQnOlxuICAgICAgICAgICAgcmV0dXJuIG51bXMubGVuZ3RoO1xuICAgICAgICBjYXNlICdDT1VOVEEnOlxuICAgICAgICAgICAgcmV0dXJuIGZsYXR0ZW4oYXJncykuZmlsdGVyKCh2KT0+diAhPT0gJycgJiYgdiAhPT0gdW5kZWZpbmVkICYmIHYgIT09IG51bGwpLmxlbmd0aDtcbiAgICAgICAgY2FzZSAnUFJPRFVDVCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1zLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdQUk9EVUNUIG9mIGVtcHR5Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bXMucmVkdWNlKChwLCB2KT0+cCAqIHYsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdBQlMnOlxuICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKHRvTnVtKGFyZ3NbMF0pKTtcbiAgICAgICAgY2FzZSAnSU5UJzpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnRydW5jKHRvTnVtKGFyZ3NbMF0pKTtcbiAgICAgICAgY2FzZSAnU1FSVCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHRvTnVtKGFyZ3NbMF0pO1xuICAgICAgICAgICAgICAgIGlmICh2IDwgMCkgdGhyb3cgbmV3IEVycm9yKCdTUVJUIG9mIG5lZ2F0aXZlJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnUk9VTkQnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB0b051bShhcmdzWzBdKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gYXJncy5sZW5ndGggPiAxID8gdG9OdW0oYXJnc1sxXSkgOiAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IGYgPSBNYXRoLnBvdygxMCwgZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodiAqIGYpIC8gZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnUk9VTkRVUCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHRvTnVtKGFyZ3NbMF0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBhcmdzLmxlbmd0aCA+IDEgPyB0b051bShhcmdzWzFdKSA6IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgZiA9IE1hdGgucG93KDEwLCBkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5zaWduKHYpICogTWF0aC5jZWlsKE1hdGguYWJzKHYpICogZikgLyBmO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdST1VORERPV04nOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB0b051bShhcmdzWzBdKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gYXJncy5sZW5ndGggPiAxID8gdG9OdW0oYXJnc1sxXSkgOiAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IGYgPSBNYXRoLnBvdygxMCwgZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc2lnbih2KSAqIE1hdGguZmxvb3IoTWF0aC5hYnModikgKiBmKSAvIGY7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ01PRCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgYSA9IHRvTnVtKGFyZ3NbMF0pLCBiID0gdG9OdW0oYXJnc1sxXSk7XG4gICAgICAgICAgICAgICAgaWYgKGIgPT09IDApIHRocm93IG5ldyBFcnJvcignTU9EIGJ5IHplcm8nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYSAtIGIgKiBNYXRoLmZsb29yKGEgLyBiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnUE9XRVInOlxuICAgICAgICAgICAgcmV0dXJuIE1hdGgucG93KHRvTnVtKGFyZ3NbMF0pLCB0b051bShhcmdzWzFdKSk7XG4gICAgICAgIGNhc2UgJ0lGJzpcbiAgICAgICAgICAgIHJldHVybiB0cnV0aHkoYXJnc1swXSkgPyBhcmdzWzFdIDogYXJnc1syXTtcbiAgICAgICAgY2FzZSAnU1VCVE9UQUwnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIENvZGUgaXMgYXJnIDAgXHUyMDE0IG11c3QgTk9UIGJlIGluY2x1ZGVkIGluIHRoZSBzdW0gKEV4Y2VsIFNVQlRPVEFMKDkscm5nKSA9PSBTVU0ocm5nKSlcbiAgICAgICAgICAgICAgICBjb25zdCBjb2RlID0gTWF0aC5hYnModG9OdW0oYXJnc1swXSkpO1xuICAgICAgICAgICAgICAgIGlmIChjb2RlID09PSA5IHx8IGNvZGUgPT09IDEwOSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByYW5nZU51bXMgPSBudW1iZXJzKGFyZ3Muc2xpY2UoMSkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmFuZ2VOdW1zLnJlZHVjZSgocywgdik9PnMgKyB2LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTVUJUT1RBTCBjb2RlICcgKyBjb2RlICsgJyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0FORCc6XG4gICAgICAgICAgICByZXR1cm4gZmxhdHRlbihhcmdzKS5ldmVyeSgoYSk9PnRydXRoeShhKSk7XG4gICAgICAgIGNhc2UgJ09SJzpcbiAgICAgICAgICAgIHJldHVybiBmbGF0dGVuKGFyZ3MpLnNvbWUoKGEpPT50cnV0aHkoYSkpO1xuICAgICAgICBjYXNlICdUUklNJzpcbiAgICAgICAgICAgIHJldHVybiBleGNlbFRyaW0oYXJnc1swXSk7XG4gICAgICAgIGNhc2UgJ1BST1BFUic6XG4gICAgICAgICAgICByZXR1cm4gZXhjZWxQcm9wZXIoYXJnc1swXSk7XG4gICAgICAgIGNhc2UgJ0NIT09TRSc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gTWF0aC5mbG9vcih0b051bShhcmdzWzBdKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IGZsYXR0ZW4oYXJncy5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgaWYgKGlkeCA8IDEgfHwgaWR4ID4gY2FuZGlkYXRlcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignQ0hPT1NFIGluZGV4IG91dCBvZiByYW5nZScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYW5kaWRhdGVzW2lkeCAtIDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdEQVRFJzpcbiAgICAgICAgICAgIHJldHVybiBkYXRlVG9TZXJpYWwoTWF0aC5mbG9vcih0b051bShhcmdzWzBdKSksIE1hdGguZmxvb3IodG9OdW0oYXJnc1sxXSkpLCBNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMl0pKSk7XG4gICAgICAgIGNhc2UgJ1dFRUtEQVknOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlcmlhbCA9IHRvTnVtKGFyZ3NbMF0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBhcmdzLmxlbmd0aCA+IDEgPyBNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMV0pKSA6IDE7XG4gICAgICAgICAgICAgICAgY29uc3QgeyB5LCBtLCBkIH0gPSBzZXJpYWxUb0RhdGUoc2VyaWFsKTtcbiAgICAgICAgICAgICAgICBjb25zdCBqc0RheSA9IG5ldyBEYXRlKERhdGUuVVRDKHksIG0gLSAxLCBkKSkuZ2V0VVRDRGF5KCk7IC8vIDA9U3VuZGF5XG4gICAgICAgICAgICAgICAgc3dpdGNoKHR5cGUpe1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ganNEYXkgKyAxOyAvLyAxPVN1bmRheSAuLiA3PVNhdHVyZGF5XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBqc0RheSA9PT0gMCA/IDcgOiBqc0RheTsgLy8gMT1Nb25kYXkgLi4gNz1TdW5kYXlcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGpzRGF5OyAvLyAwPU1vbmRheSAuLiA2PVN1bmRheVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXRUVLREFZIHJldHVybl90eXBlICcgKyB0eXBlICsgJyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdDT0xVTU4nOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgaWYgKHJlZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpc0NlbGxBZGRyKSB0aHJvdyBuZXcgRXJyb3IoJ0NPTFVNTiB3aXRob3V0IHJlZiBuZWVkcyBjZWxsIGNvbnRleHQnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVjb2RlZCA9IHV0aWxzLmRlY29kZV9jZWxsKHRoaXNDZWxsQWRkcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWNvZGVkLmMgKyAxOyAvLyAxLWJhc2VkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVmID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtID0gcmVmLm1hdGNoKC9bQS1aYS16XXsxLDN9Lyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgQ09MVU1OIHJlZicpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xTdHIgPSBtWzBdLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb2wgPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIGNvbFN0ciljb2wgPSBjb2wgKiAyNiArIChjaC5jaGFyQ29kZUF0KDApIC0gNjQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NPTFVNTiBvZiByYW5nZSBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1NVTUlGJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCByYW5nZUFyZyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgY29uc3QgY3JpdGVyaWEgPSBhcmdzWzFdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1bUFyZyA9IGFyZ3NbMl0gPz8gcmFuZ2VBcmc7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1JhbmdlKHJhbmdlQXJnKSB8fCAhaXNSYW5nZShzdW1BcmcpKSB0aHJvdyBuZXcgRXJyb3IoJ1NVTUlGIG5lZWRzIHJhbmdlcycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IHJhbmdlQXJnLnZhbHVlcztcbiAgICAgICAgICAgICAgICBjb25zdCBzdW1zID0gc3VtQXJnLnZhbHVlcztcbiAgICAgICAgICAgICAgICBjb25zdCBvdXQgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNyaXRlcmlhTWF0Y2hlcyh2YWx1ZXNbaV0sIGNyaXRlcmlhKSkgb3V0LnB1c2godG9OdW1TYWZlKHN1bXNbaV0gPz8gMCkgPz8gMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvdXQucmVkdWNlKChzLCB2KT0+cyArIHYsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdWTE9PS1VQJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb29rdXAgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhYmxlID0gYXJnc1sxXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xJZHggPSBNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMl0pKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhcHByb3ggPSBhcmdzLmxlbmd0aCA+IDMgPyB0cnV0aHkoYXJnc1szXSkgOiB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICghaXNSYW5nZSh0YWJsZSkgfHwgY29sSWR4IDwgMSB8fCBjb2xJZHggPiB0YWJsZS53aWR0aCkgdGhyb3cgbmV3IEVycm9yKCdWTE9PS1VQIGJhZCB0YWJsZS9jb2wnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBmaXJzdENvbCA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IobGV0IHIgPSAwOyByIDwgTWF0aC5mbG9vcih0YWJsZS52YWx1ZXMubGVuZ3RoIC8gdGFibGUud2lkdGgpOyByKyspe1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByb3cgPSB0YWJsZS52YWx1ZXMuc2xpY2UociAqIHRhYmxlLndpZHRoLCAociArIDEpICogdGFibGUud2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICByb3dzLnB1c2gocm93KTtcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RDb2wucHVzaChyb3dbMF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBoaXQgPSBhcHByb3ggPyBmaW5kTWF0Y2gobG9va3VwLCBmaXJzdENvbCwgMSkgOiBmaW5kTWF0Y2gobG9va3VwLCBmaXJzdENvbCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKGhpdCA9PT0gLTEpIHRocm93IG5ldyBFcnJvcignVkxPT0tVUCBubyBtYXRjaCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbCA9IHJvd3NbaGl0IC0gMV1bY29sSWR4IC0gMV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbCA9PT0gdW5kZWZpbmVkID8gJycgOiB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ01BVENIJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb29rdXAgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyciA9IGFyZ3NbMV07XG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IGFyZ3MubGVuZ3RoID4gMiA/IE1hdGguZmxvb3IodG9OdW0oYXJnc1syXSkpIDogMTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzUmFuZ2UoYXJyKSkgdGhyb3cgbmV3IEVycm9yKCdNQVRDSCBuZWVkcyBhIHJhbmdlJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgaGl0ID0gZmluZE1hdGNoKGxvb2t1cCwgYXJyLnZhbHVlcywgdHlwZSk7XG4gICAgICAgICAgICAgICAgaWYgKGhpdCA9PT0gLTEpIHRocm93IG5ldyBFcnJvcignTUFUQ0ggbm8gbWF0Y2gnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGl0O1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdJTkRFWCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJyID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICBjb25zdCByb3dJZHggPSBNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMV0pKTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzUmFuZ2UoYXJyKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm93SWR4ID09PSAxID8gYXJyIDogKCgpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lOREVYIG91dCBvZiByYW5nZScpO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbElkeCA9IE1hdGguZmxvb3IodG9OdW0oYXJnc1syXSkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSAocm93SWR4IC0gMSkgKiBhcnIud2lkdGggKyAoY29sSWR4IC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3MgPCAwIHx8IHBvcyA+PSBhcnIudmFsdWVzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdJTkRFWCBvdXQgb2YgcmFuZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyci52YWx1ZXNbcG9zXSA/PyAwOyAvLyBFeGNlbCBjb2VyY2VzIGVtcHR5IGNlbGxzIHRvIDBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgcG9zID0gcm93SWR4IC0gMTtcbiAgICAgICAgICAgICAgICBpZiAocG9zIDwgMCB8fCBwb3MgPj0gYXJyLnZhbHVlcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignSU5ERVggb3V0IG9mIHJhbmdlJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyci52YWx1ZXNbcG9zXSA/PyAwOyAvLyBFeGNlbCBjb2VyY2VzIGVtcHR5IGNlbGxzIHRvIDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnVEVYVCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgZm10ID0gU3RyaW5nKGFyZ3NbMV0gPz8gJycpO1xuICAgICAgICAgICAgICAgIGlmIChpc1JhbmdlKGFyZ3NbMF0pKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFycmF5IGNvbnRleHQ6IGFwcGx5IFRFWFQgZWxlbWVudC13aXNlIChlLmcuIGJ1aWxkaW5nIGEgbG9va3VwIGFycmF5XG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBNQVRDSCBhZ2FpbnN0IGEgZm9ybWF0dGVkIGhlYWRlciByb3cpLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgX19yYW5nZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczogYXJnc1swXS52YWx1ZXMubWFwKCh2KT0+ZXhjZWxUZXh0Rm9ybWF0KHYsIGZtdCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGFyZ3NbMF0ud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4Y2VsVGV4dEZvcm1hdChhcmdzWzBdLCBmbXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBmdW5jdGlvbjogJyArIG5hbWUpO1xuICAgIH1cbn1cbi8qKlxuICogUmVnZXggZmFsbGJhY2sgZm9yIGZvcm11bGFzIHRoZSB0b2tlbml6ZXIgY2Fubm90IHBhcnNlIChleG90aWMgY2hhcnMpLlxuICogSGFuZGxlczogQTEsICRBJDEsIEExOkI1LCBBOkEsIFNoZWV0IUQ3LCAnU2hlZXQgMSchRDcuXG4gKi8gZnVuY3Rpb24gcmVnZXhSZWZzKHNyYykge1xuICAgIGNvbnN0IG91dCA9IFtdO1xuICAgIGNvbnN0IHJlID0gLyg/Oig/OicoW14nXSspJ3woW0EtWmEtel9dW0EtWmEtejAtOV8uXSopKSE/KT9cXCQ/KFtBLVphLXpdezEsM30pKFxcJD8pKFxcZCopKD86OlxcJD8oW0EtWmEtel17MSwzfSkoXFwkPykoXFxkKikpPy9nO1xuICAgIGxldCBtO1xuICAgIHdoaWxlKChtID0gcmUuZXhlYyhzcmMpKSAhPT0gbnVsbCl7XG4gICAgICAgIGNvbnN0IFssIHNoZWV0LCBzaGVldDIsIGNvbCwgLCBkaWdpdHMsIGVuZENvbCwgLCBlbmREaWdpdHNdID0gbTtcbiAgICAgICAgY29uc3QgbmV4dENoID0gc3JjW20uaW5kZXggKyBtWzBdLmxlbmd0aF07XG4gICAgICAgIC8vIENvbHVtbi1vbmx5IHRva2VuIChubyBkaWdpdHMpOiBvbmx5IG1lYW5pbmdmdWwgYXMgYSByYW5nZSBwYXJ0IChBOkEpLlxuICAgICAgICAvLyBBbHNvIHNraXBzIGlkZW50aWZpZXJzIGxpa2UgXCJTVU1JRlMoXCIgKG1hdGNoZWQgYXMgXCJTVU1cIiArIFwiSUZTKFwiKS5cbiAgICAgICAgaWYgKGRpZ2l0cyA9PT0gJycpIHtcbiAgICAgICAgICAgIGlmIChuZXh0Q2ggIT09ICc6JykgY29udGludWU7XG4gICAgICAgIH0gZWxzZSBpZiAobmV4dENoID09PSAnKCcpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBmdW5jdGlvbiBuYW1lIGVuZGluZyBpbiBkaWdpdHMgKExPRzEwKCwgTE9HMigsIC4uLilcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhZGRyID0gYCR7Y29sfSR7ZGlnaXRzfWA7XG4gICAgICAgIGlmIChlbmRDb2wgJiYgZW5kRGlnaXRzICE9PSAnJykgb3V0LnB1c2goe1xuICAgICAgICAgICAgc2hlZXQ6IHNoZWV0ID8/IHNoZWV0MixcbiAgICAgICAgICAgIGFkZHIsXG4gICAgICAgICAgICBlbmQ6IGAke2VuZENvbH0ke2VuZERpZ2l0c31gXG4gICAgICAgIH0pO1xuICAgICAgICBlbHNlIGlmIChlbmRDb2wpIG91dC5wdXNoKHtcbiAgICAgICAgICAgIHNoZWV0OiBzaGVldCA/PyBzaGVldDIsXG4gICAgICAgICAgICBhZGRyLFxuICAgICAgICAgICAgZW5kOiBgJHtlbmRDb2x9YFxuICAgICAgICB9KTtcbiAgICAgICAgZWxzZSBvdXQucHVzaCh7XG4gICAgICAgICAgICBzaGVldDogc2hlZXQgPz8gc2hlZXQyLFxuICAgICAgICAgICAgYWRkclxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ29sbGVjdCBldmVyeSBjZWxsL3JhbmdlIHJlZmVyZW5jZSBmcm9tIGEgZm9ybXVsYSBzdHJpbmcuXG4gKlxuICogXCI9U1VNKFY0NjpWNTQpXCIgICAgIC0+IFt7IGFkZHI6IFwiVjQ2XCIsIGVuZDogXCJWNTRcIiB9XVxuICogXCI9UEwhRDcgKyBQTCFEOFwiICAgIC0+IFt7IHNoZWV0OiBcIlBMXCIsIGFkZHI6IFwiRDdcIiB9LCB7IHNoZWV0OiBcIlBMXCIsIGFkZHI6IFwiRDhcIiB9XVxuICogXCI9VjQ2KjJcIiAgICAgICAgICAgIC0+IFt7IGFkZHI6IFwiVjQ2XCIgfV1cbiAqXG4gKiBVc2VzIHRoZSBzYW1lIHRva2VuaXplciBhcyBldmFsdWF0ZUZvcm11bGEgc28gcmVmZXJlbmNlIGRldGVjdGlvbiBzdGF5c1xuICogY29uc2lzdGVudCB3aXRoIGV2YWx1YXRpb247IGZhbGxzIGJhY2sgdG8gYSByZWdleCBwYXNzIHdoZW4gdGhlIHRva2VuaXplclxuICogcmVqZWN0cyB0aGUgc3RyaW5nICh1bmV2YWx1YWJsZSBmb3JtdWxhcyBzdGlsbCBnZXQgdGhlaXIgcmVmcyBtYXBwZWQpLlxuICovIGV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0UmVmZXJlbmNlcyhzcmMpIHtcbiAgICBjb25zdCB0ZXh0ID0gc3JjLnJlcGxhY2UoL149LywgJycpLnRyaW0oKTtcbiAgICBpZiAoIXRleHQpIHJldHVybiBbXTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB0b2tlbnMgPSB0b2tlbml6ZSh0ZXh0KTtcbiAgICAgICAgY29uc3QgcmVmcyA9IFtdO1xuICAgICAgICBsZXQgcGVuZGluZ1NoZWV0O1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIHdoaWxlKGkgPCB0b2tlbnMubGVuZ3RoKXtcbiAgICAgICAgICAgIGNvbnN0IHQgPSB0b2tlbnNbaV07XG4gICAgICAgICAgICBpZiAodC50eXBlID09PSAnc2hlZXQnKSB7XG4gICAgICAgICAgICAgICAgcGVuZGluZ1NoZWV0ID0gdC52YWx1ZTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodC50eXBlID09PSAncmVmJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFkZHIgPSB0LnZhbHVlLnJlcGxhY2UoL1xcJC9nLCAnJyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgbnh0ID0gdG9rZW5zW2kgKyAxXTtcbiAgICAgICAgICAgICAgICAvLyBGdW5jdGlvbi1uYW1lIGZhbHNlIHBvc2l0aXZlcyAoTE9HMTAoLCBMT0cyKCkgYXJlIHRva2VuaXplZCBhcyByZWZzKVxuICAgICAgICAgICAgICAgIGlmIChueHQgJiYgbnh0LnR5cGUgPT09ICdvcCcgJiYgbnh0LnZhbHVlID09PSAnKCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaSArPSAyO1xuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nU2hlZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobnh0ICYmIG54dC50eXBlID09PSAnb3AnICYmIG54dC52YWx1ZSA9PT0gJzonKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZFRvayA9IHRva2Vuc1tpICsgMl07XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbmRUb2sgJiYgZW5kVG9rLnR5cGUgPT09ICdyZWYnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWZzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoZWV0OiBwZW5kaW5nU2hlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQ6IGVuZFRvay52YWx1ZS5yZXBsYWNlKC9cXCQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdTaGVldCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlZnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHNoZWV0OiBwZW5kaW5nU2hlZXQsXG4gICAgICAgICAgICAgICAgICAgIGFkZHJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcGVuZGluZ1NoZWV0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWZzO1xuICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgcmV0dXJuIHJlZ2V4UmVmcyh0ZXh0KTtcbiAgICB9XG59XG4vKipcbiAqIEV2YWx1YXRlIGFuIEV4Y2VsIGZvcm11bGEgc3RyaW5nIGFnYWluc3QgdGhlIHdvcmtib29rLlxuICogUmV0dXJucyB7IHZhbHVlIH0gZm9yIGZvcm11bGFzIHdlIGNhbiBjb21wdXRlLCB7IHVuZXZhbHVhYmxlOiB0cnVlIH0gb3RoZXJ3aXNlLlxuICovIGV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZUZvcm11bGEod2IsIHdzLCBmb3JtdWxhLCBkZXB0aCA9IDAsIGN1cnJlbnRDZWxsQWRkcikge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNyYyA9IGZvcm11bGEudHJpbSgpO1xuICAgICAgICBpZiAoIXNyYy5zdGFydHNXaXRoKCc9JykpIHJldHVybiB7XG4gICAgICAgICAgICB1bmV2YWx1YWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKHdiLCB3cywgc3JjLnNsaWNlKDEpLCBkZXB0aCwgY3VycmVudENlbGxBZGRyKTtcbiAgICAgICAgY29uc3QgdiA9IHBhcnNlci5wYXJzZUV4cHIoKTtcbiAgICAgICAgaWYgKCFwYXJzZXIuZmluaXNoZWQoKSkgcmV0dXJuIHtcbiAgICAgICAgICAgIHVuZXZhbHVhYmxlOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIC8vIEV4Y2VsOiBhIHRvcC1sZXZlbCByZWZlcmVuY2UgdG8gYW4gZW1wdHkvbWlzc2luZyBjZWxsIGV2YWx1YXRlcyB0byAwLlxuICAgICAgICAvLyAoUmVhbCBmYWlsdXJlcyBcdTIwMTQgdW5zdXBwb3J0ZWQvZXJyb3JpbmcgcmVmZXJlbmNlZCBmb3JtdWxhcyBcdTIwMTQgdGhyb3cgaW5cbiAgICAgICAgLy8gcmVzb2x2ZUNlbGwgYW5kIGFyZSBjYXVnaHQgYWJvdmUsIHNvIHRoZXkgc3RpbGwgcmV0dXJuIHVuZXZhbHVhYmxlLilcbiAgICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsKSByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICB1bmV2YWx1YWJsZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJyAmJiAhaXNGaW5pdGUodikpIHJldHVybiB7XG4gICAgICAgICAgICB1bmV2YWx1YWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICAvLyBCb29sZWFucyAtPiAxLzAgZm9yIG51bWVyaWMgRXhjZWwgY2VsbHNcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogdiA/IDEgOiAwLFxuICAgICAgICAgICAgdW5ldmFsdWFibGU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogdixcbiAgICAgICAgICAgIHVuZXZhbHVhYmxlOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHVuZXZhbHVhYmxlOiB0cnVlXG4gICAgICAgIH07XG4gICAgfVxufVxuIiwgIi8qKlxuICogV29ya2Jvb2sgXHUyMTkyIERCLXNoZWV0IG1hcHBpbmcgaGVscGVycy5cbiAqXG4gKiBUaGUgc2hlZXQgdmlld2VyIHNlcnZlcyB3b3JrYm9vayBkYXRhIGFzIEpTT04gcm93cyBrZXllZCBieSBjb2x1bW4gaGVhZGVyXG4gKiAoZGVkdXBsaWNhdGVkLCBlLmcuIFwiVG90YWxcIiwgXCJUb3RhbF8yXCIpLCB3aXRoIGFuIGF1dG9tYXRpY2FsbHkgZGV0ZWN0ZWRcbiAqIGhlYWRlciByb3cuIFRoZXNlIGhlbHBlcnMgYXJlIHRoZSBzaW5nbGUgc291cmNlIG9mIHRydXRoIGZvciB0aGF0IG1hcHBpbmcgXHUyMDE0XG4gKiB0aGUgc2hlZXQtZGF0YSBBUEkgcm91dGUsIHRoZSBmb3JtdWxhLXJlZmVyZW5jZSBtYXBwZXIsIGFuZCB0aGUgaW1wb3J0LXRpbWVcbiAqIGZvcm11bGEgZXh0cmFjdGlvbiBhbGwgdXNlIHRoZW0gc28gYSBmb3JtdWxhIGNlbGwgcmVmZXJlbmNlIChcIlY0NlwiKSBtYXBzIHRvXG4gKiB0aGUgZXhhY3Qgc2FtZSAoY29sdW1uIGtleSwgZGF0YS1yb3cgb2Zmc2V0KSB0aGUgYXBwbGljYXRpb24gZGlzcGxheXMuXG4gKi8gaW1wb3J0IHsgdXRpbHMgfSBmcm9tICd4bHN4Jztcbi8vIEhlYWRlciByb3cgZGV0ZWN0aW9uIChtaXJyb3JzIHRoZSBsb2dpYyBoaXN0b3JpY2FsbHkgZHVwbGljYXRlZCBpbiB0aGVcbi8vIHNoZWV0LWRhdGEgcm91dGUgYW5kIHdvcmtib29rLWFuYWx5emVyLnRzKS5cbmNvbnN0IEhFQURFUl9LRVlXT1JEUyA9IC9kZXNjcmlwdGlvbnxhbW91bnR8dG90YWx8ZGF0ZXxyZXZlbnVlfGFjY291bnR8bmFtZXxxdHl8cHJpY2V8Y29zdHxzYWxlc3xpbmNvbWV8ZXhwZW5zZXxiYWxhbmNlfG51bWJlcnxyZWZ8cGVyaW9kfHRyYW5zYWN0aW9ufGRlYml0fGNyZWRpdHx1bml0fHJhdGV8cGN0fG1hcmdpbnxiaWxsc3xjb3ZlcnN8Z3Vlc3RzfHN0YWZmfGNvZGV8dHlwZXxjYXRlZ29yeXxpdGVtfHByb2R1Y3R8c2VydmljZXxjaGFyZ2V8ZGlzY291bnR8dGF4fHN1YnRvdGFsfG5ldHxncm9zcy9pO1xuY29uc3QgVElUTEVfS0VZV09SRFMgPSAvXihwcm9maXRcXHMqJj9cXHMqbG9zc3xiYWxhbmNlXFxzKnNoZWV0fHRyaWFsXFxzKmJhbGFuY2V8Z2VuZXJhbFxccypsZWRnZXJ8cGVyaW9kZXxwZXJpb2R8bW9udGhcXHMqb2Z8aW5wdXRcXHMqZGF0YXxhdXRvXFxzKmNhbGMpL2k7XG5leHBvcnQgZnVuY3Rpb24gZmluZEhlYWRlclJvdyh3cykge1xuICAgIGNvbnN0IHJvd3MgPSB1dGlscy5zaGVldF90b19qc29uKHdzLCB7XG4gICAgICAgIGhlYWRlcjogMVxuICAgIH0pO1xuICAgIGNvbnN0IG1heFNjYW4gPSBNYXRoLm1pbihyb3dzLmxlbmd0aCwgMjApO1xuICAgIGxldCBiZXN0Um93ID0gMDtcbiAgICBsZXQgYmVzdFNjb3JlID0gMDtcbiAgICBsZXQgYmVzdEhlYWRlcnMgPSBbXTtcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgbWF4U2NhbjsgaSsrKXtcbiAgICAgICAgY29uc3Qgcm93ID0gcm93c1tpXSA/PyBbXTtcbiAgICAgICAgY29uc3Qgbm9uRW1wdHkgPSByb3cuZmlsdGVyKChjKT0+YyAhPT0gJycgJiYgYyAhPT0gdW5kZWZpbmVkICYmIGMgIT09IG51bGwpO1xuICAgICAgICBjb25zdCBub25FbXB0eUNvdW50ID0gbm9uRW1wdHkubGVuZ3RoO1xuICAgICAgICBpZiAobm9uRW1wdHlDb3VudCA9PT0gMCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGZpcnN0Q2VsbCA9IFN0cmluZyhyb3dbMF0gPz8gJycpLnRyaW0oKTtcbiAgICAgICAgaWYgKG5vbkVtcHR5Q291bnQgPD0gMiAmJiBUSVRMRV9LRVlXT1JEUy50ZXN0KGZpcnN0Q2VsbCkpIGNvbnRpbnVlO1xuICAgICAgICBsZXQgaGVhZGVyTGlrZUNvdW50ID0gMDtcbiAgICAgICAgbGV0IG51bWVyaWNDb3VudCA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiBub25FbXB0eSl7XG4gICAgICAgICAgICBjb25zdCBzdHIgPSBTdHJpbmcoY2VsbCk7XG4gICAgICAgICAgICBpZiAoc3RyID09PSAnI04vQScgfHwgc3RyID09PSAnI1JFRiEnIHx8IHN0ciA9PT0gJyNWQUxVRSEnKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IG51bSA9IE51bWJlcihjZWxsKTtcbiAgICAgICAgICAgIGNvbnN0IGlzTnVtZXJpYyA9IHR5cGVvZiBjZWxsID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgY2VsbCA9PT0gJ3N0cmluZycgJiYgL15bXFxkLC4tXSskLy50ZXN0KHN0ci50cmltKCkpICYmIGlzRmluaXRlKG51bSk7XG4gICAgICAgICAgICBpZiAoaXNOdW1lcmljICYmIE1hdGguYWJzKG51bSkgPiAwKSBudW1lcmljQ291bnQrKztcbiAgICAgICAgICAgIGVsc2UgaWYgKEhFQURFUl9LRVlXT1JEUy50ZXN0KHN0cikpIGhlYWRlckxpa2VDb3VudCsrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRleHRSYXRpbyA9IG5vbkVtcHR5Q291bnQgPiAwID8gKG5vbkVtcHR5Q291bnQgLSBudW1lcmljQ291bnQpIC8gbm9uRW1wdHlDb3VudCA6IDA7XG4gICAgICAgIGNvbnN0IHNjb3JlID0gaGVhZGVyTGlrZUNvdW50ICogMyArIHRleHRSYXRpbyAqIDIgKyAobm9uRW1wdHlDb3VudCA+PSAzID8gMSA6IDApO1xuICAgICAgICBpZiAoc2NvcmUgPiBiZXN0U2NvcmUpIHtcbiAgICAgICAgICAgIGJlc3RTY29yZSA9IHNjb3JlO1xuICAgICAgICAgICAgYmVzdFJvdyA9IGk7XG4gICAgICAgICAgICBiZXN0SGVhZGVycyA9IHJvdy5tYXAoKGMpPT5TdHJpbmcoYyA/PyAnJykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChiZXN0U2NvcmUgPCAyICYmIHJvd3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBmaXJzdFJvdyA9IChyb3dzWzBdID8/IFtdKS5tYXAoKGMpPT5TdHJpbmcoYyA/PyAnJykpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaGVhZGVyUm93OiAxLFxuICAgICAgICAgICAgaGVhZGVyczogZmlyc3RSb3dcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaGVhZGVyUm93OiBiZXN0Um93ICsgMSxcbiAgICAgICAgaGVhZGVyczogYmVzdEhlYWRlcnNcbiAgICB9O1xufVxuLyoqXG4gKiBCdWlsZCB0aGUgZGVkdXBsaWNhdGVkIERCIGNvbHVtbiBrZXlzIGZvciBhIGhlYWRlciByb3cgKFwiVG90YWxcIiwgXCJUb3RhbF8yXCIsXG4gKiBlbXB0eSBoZWFkZXJzIGJlY29tZSBcIl9faGlkZGVuXzxuPlwiKSBcdTIwMTQgaWRlbnRpY2FsIHRvIHRoZSBzaGVldC1kYXRhIEdFVC5cbiAqLyBleHBvcnQgZnVuY3Rpb24gYnVpbGRDb2x1bW5LZXlzKGhlYWRlcnMpIHtcbiAgICBjb25zdCBzZWVuID0gbmV3IE1hcCgpO1xuICAgIGxldCBlbXB0eUNvbElkeCA9IDA7XG4gICAgcmV0dXJuIGhlYWRlcnMubWFwKChoKT0+e1xuICAgICAgICBjb25zdCB0cmltbWVkID0gKGggfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpO1xuICAgICAgICBpZiAoIXRyaW1tZWQpIHJldHVybiBgX19oaWRkZW5fJHtlbXB0eUNvbElkeCsrfWA7XG4gICAgICAgIGNvbnN0IGNvdW50ID0gc2Vlbi5nZXQodHJpbW1lZCkgPz8gMDtcbiAgICAgICAgc2Vlbi5zZXQodHJpbW1lZCwgY291bnQgKyAxKTtcbiAgICAgICAgcmV0dXJuIGNvdW50ID4gMCA/IGAke3RyaW1tZWR9XyR7Y291bnR9YCA6IHRyaW1tZWQ7XG4gICAgfSk7XG59XG4vKipcbiAqIE1hcCBhbiBFeGNlbCBjZWxsIGFkZHJlc3MgdG8gdGhlIERCLXNoZWV0IGNvb3JkaW5hdGVzLlxuICpcbiAqIEBwYXJhbSB3cyAgICAgICAgICB0aGUgd29ya3NoZWV0IHRoZSBhZGRyZXNzIGJlbG9uZ3MgdG9cbiAqIEBwYXJhbSBhZGRyICAgICAgICBBMS1zdHlsZSBhZGRyZXNzIChcIlY0NlwiLCBcIiRBJDFcIilcbiAqIEBwYXJhbSBoZWFkZXJJbmZvICBwcmVjb21wdXRlZCBmaW5kSGVhZGVyUm93KHdzKSByZXN1bHQgKHJlY29tcHV0ZWQgcGVyIGNhbGxcbiAqICAgICAgICAgICAgICAgICAgICBpZiBvbWl0dGVkIFx1MjAxNCBwYXNzIGl0IHdoZW4gbWFwcGluZyBtYW55IGNlbGxzKVxuICovIGV4cG9ydCBmdW5jdGlvbiBtYXBDZWxsVG9EYXRhKHdzLCBhZGRyLCBoZWFkZXJJbmZvKSB7XG4gICAgY29uc3QgY2xlYW4gPSBhZGRyLnJlcGxhY2UoL1xcJC9nLCAnJyk7XG4gICAgY29uc3QgZGVjb2RlZCA9IHV0aWxzLmRlY29kZV9jZWxsKGNsZWFuKTtcbiAgICBjb25zdCBpbmZvID0gaGVhZGVySW5mbyA/PyBmaW5kSGVhZGVyUm93KHdzKTtcbiAgICAvLyBGaXJzdCBkYXRhIHJvdyA9IGhlYWRlclJvdyArIDEgXHUyMTkyIDEtYmFzZWQgZGF0YSBvZmZzZXQ7IHJvd3MgYXQvYWJvdmUgdGhlXG4gICAgLy8gaGVhZGVyICh0aXRsZSByb3dzKSBnZXQgcmVsUm93IDw9IDAgLyB1bmRlZmluZWQgKHRoZXkgYXJlIG5vdCBkYXRhKS5cbiAgICBjb25zdCByZWxSb3cgPSBkZWNvZGVkLnIgLSBpbmZvLmhlYWRlclJvdyArIDE7XG4gICAgY29uc3QgY29sdW1uS2V5cyA9IGJ1aWxkQ29sdW1uS2V5cyhpbmZvLmhlYWRlcnMpO1xuICAgIGNvbnN0IHJhd0hlYWRlciA9IGluZm8uaGVhZGVyc1tkZWNvZGVkLmNdID8/ICcnO1xuICAgIGNvbnN0IGNvbEtleSA9IHJhd0hlYWRlci50cmltKCkgPyBjb2x1bW5LZXlzW2RlY29kZWQuY10gOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29sS2V5LFxuICAgICAgICByZWxSb3c6IHJlbFJvdyA+PSAxID8gcmVsUm93IDogdW5kZWZpbmVkLFxuICAgICAgICBhYnNSb3c6IGRlY29kZWQuciArIDEsXG4gICAgICAgIGFic0NvbDogZGVjb2RlZC5jICsgMVxuICAgIH07XG59XG4iLCAiLyoqXG4gKiBTZXJkZSBjb21wbGlhbmNlIGNoZWNrZXIgZm9yIHdvcmtmbG93IGN1c3RvbSBjbGFzcyBzZXJpYWxpemF0aW9uLlxuICpcbiAqIEFuYWx5emVzIHNvdXJjZSBjb2RlIHRvIGRldGVybWluZSBpZiBjbGFzc2VzIHdpdGggV09SS0ZMT1dfU0VSSUFMSVpFIC9cbiAqIFdPUktGTE9XX0RFU0VSSUFMSVpFIGFyZSBjb3JyZWN0bHkgc2V0IHVwIGZvciB0aGUgd29ya2Zsb3cgc2FuZGJveC5cbiAqXG4gKiBVc2VkIGJ5OlxuICogLSBDTEkgYHZhbGlkYXRlYCBjb21tYW5kXG4gKiAtIENMSSBgdHJhbnNmb3JtYCBjb21tYW5kICgtLWNoZWNrLXNlcmRlKVxuICogLSBTV0MgcGxheWdyb3VuZCBzZXJkZSBhbmFseXNpcyBwYW5lbFxuICogLSBCdWlsZC10aW1lIHdhcm5pbmdzIGluIEJhc2VCdWlsZGVyXG4gKi9cblxuaW1wb3J0IGJ1aWx0aW5Nb2R1bGVzIGZyb20gJ2J1aWx0aW4tbW9kdWxlcyc7XG5pbXBvcnQgdHlwZSB7IFdvcmtmbG93TWFuaWZlc3QgfSBmcm9tICcuL2FwcGx5LXN3Yy10cmFuc2Zvcm0uanMnO1xuXG4vLyBCdWlsZCBhIHJlZ2V4IHRoYXQgbWF0Y2hlcyBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBpbXBvcnRzIGluIHRyYW5zZm9ybWVkIGNvZGUuXG4vLyBIYW5kbGVzIGJvdGggRVNNIChgZnJvbSAnZnMnYCwgYGZyb20gJ25vZGU6ZnMnYCkgYW5kIENKUyAoYHJlcXVpcmUoJ2ZzJylgKVxuY29uc3Qgbm9kZUJ1aWx0aW5zID0gYnVpbHRpbk1vZHVsZXMuam9pbignfCcpO1xuXG4vLyBSZWdleCB0byBleHRyYWN0IHNwZWNpZmljIG1vZHVsZSBuYW1lcyBmcm9tIGltcG9ydC9yZXF1aXJlIHN0YXRlbWVudHNcbmNvbnN0IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXggPSBuZXcgUmVnRXhwKFxuICBgKD86ZnJvbVxcXFxzK1snXCJdKD86bm9kZTopPygoPzoke25vZGVCdWlsdGluc30pKD86L1teJ1wiXSopPylbJ1wiXWAgK1xuICAgIGB8cmVxdWlyZVxcXFxzKlxcXFwoXFxcXHMqWydcIl0oPzpub2RlOik/KCg/OiR7bm9kZUJ1aWx0aW5zfSkoPzovW14nXCJdKik/KVsnXCJdXFxcXHMqXFxcXCkpYCxcbiAgJ2cnXG4pO1xuXG4vLyBSZWdleCB0byBkZXRlY3QgY2xhc3MgcmVnaXN0cmF0aW9uIElJRkVzIGdlbmVyYXRlZCBieSB0aGUgU1dDIHBsdWdpblxuY29uc3QgcmVnaXN0cmF0aW9uSWlmZVJlZ2V4ID1cbiAgL1N5bWJvbFxcLmZvclxccypcXChcXHMqW1wiJ113b3JrZmxvdy1jbGFzcy1yZWdpc3RyeVtcIiddXFxzKlxcKS87XG5cbi8qKlxuICogUmVzdWx0IG9mIGNoZWNraW5nIGEgc2luZ2xlIGNsYXNzIGZvciBzZXJkZSBjb21wbGlhbmNlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlcmRlQ2xhc3NDaGVja1Jlc3VsdCB7XG4gIC8qKiBUaGUgY2xhc3MgbmFtZSBhcyBkZXRlY3RlZCBpbiB0aGUgc291cmNlICovXG4gIGNsYXNzTmFtZTogc3RyaW5nO1xuICAvKiogVGhlIGNsYXNzSWQgYXNzaWduZWQgYnkgdGhlIFNXQyBwbHVnaW4gKGZyb20gdGhlIG1hbmlmZXN0KSAqL1xuICBjbGFzc0lkOiBzdHJpbmc7XG4gIC8qKiBXaGV0aGVyIHRoZSBTV0MgcGx1Z2luIGRldGVjdGVkIHNlcmRlIHN5bWJvbHMgb24gdGhpcyBjbGFzcyAqL1xuICBkZXRlY3RlZDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgYSByZWdpc3RyYXRpb24gSUlGRSB3YXMgZ2VuZXJhdGVkIGluIHRoZSBvdXRwdXQgKi9cbiAgcmVnaXN0ZXJlZDogYm9vbGVhbjtcbiAgLyoqXG4gICAqIE5vZGUuanMgYnVpbHQtaW4gbW9kdWxlIGltcG9ydHMgcmVtYWluaW5nIGluIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dC5cbiAgICogSWYgbm9uLWVtcHR5LCB0aGUgY2xhc3MgaXMgTk9UIHdvcmtmbG93LXNhbmRib3ggY29tcGxpYW50LlxuICAgKi9cbiAgbm9kZUltcG9ydHM6IHN0cmluZ1tdO1xuICAvKiogV2hldGhlciB0aGUgY2xhc3MgcGFzc2VzIGFsbCBjb21wbGlhbmNlIGNoZWNrcyAqL1xuICBjb21wbGlhbnQ6IGJvb2xlYW47XG4gIC8qKiBIdW1hbi1yZWFkYWJsZSBkZXNjcmlwdGlvbnMgb2YgYW55IGlzc3VlcyBmb3VuZCAqL1xuICBpc3N1ZXM6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIEZ1bGwgcmVzdWx0IG9mIHNlcmRlIGNvbXBsaWFuY2UgYW5hbHlzaXMgZm9yIGEgc291cmNlIGZpbGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VyZGVDaGVja1Jlc3VsdCB7XG4gIC8qKiBQZXItY2xhc3MgYW5hbHlzaXMgcmVzdWx0cyAqL1xuICBjbGFzc2VzOiBTZXJkZUNsYXNzQ2hlY2tSZXN1bHRbXTtcbiAgLyoqIEFsbCBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHMgZm91bmQgaW4gdGhlIHdvcmtmbG93LW1vZGUgb3V0cHV0ICovXG4gIGdsb2JhbE5vZGVJbXBvcnRzOiBzdHJpbmdbXTtcbiAgLyoqIFdoZXRoZXIgdGhlIHdvcmtmbG93LW1vZGUgb3V0cHV0IGNvbnRhaW5zIGFueSBzZXJkZS1yZWxhdGVkIGNsYXNzZXMgKi9cbiAgaGFzU2VyZGVDbGFzc2VzOiBib29sZWFuO1xuICAvKiogVGhlIHJhdyB3b3JrZmxvdyBtYW5pZmVzdCBleHRyYWN0ZWQgZnJvbSB0aGUgU1dDIHRyYW5zZm9ybSAqL1xuICBtYW5pZmVzdDogV29ya2Zsb3dNYW5pZmVzdDtcbn1cblxuLyoqXG4gKiBMaWdodHdlaWdodCBzZXJkZSBjb21wbGlhbmNlIGNoZWNrZXIgdGhhdCB3b3JrcyB3aXRoIHByZS1jb21wdXRlZFxuICogU1dDIHRyYW5zZm9ybSByZXN1bHRzLiBUaGlzIGF2b2lkcyByZS1ydW5uaW5nIHRoZSBTV0MgdHJhbnNmb3JtXG4gKiB3aGVuIHRoZSBjYWxsZXIgYWxyZWFkeSBoYXMgdGhlIG91dHB1dHMgKGUuZy4sIHRoZSBwbGF5Z3JvdW5kIG9yIGJ1aWxkZXIpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5hbHl6ZVNlcmRlQ29tcGxpYW5jZShvcHRpb25zOiB7XG4gIC8qKiBTb3VyY2UgY29kZSAodXNlZCBmb3IgcGF0dGVybiBkZXRlY3Rpb24pICovXG4gIHNvdXJjZUNvZGU6IHN0cmluZztcbiAgLyoqIFdvcmtmbG93LW1vZGUgdHJhbnNmb3JtZWQgb3V0cHV0ICovXG4gIHdvcmtmbG93Q29kZTogc3RyaW5nO1xuICAvKiogTWFuaWZlc3QgZXh0cmFjdGVkIGZyb20gdGhlIFNXQyB0cmFuc2Zvcm0gKi9cbiAgbWFuaWZlc3Q6IFdvcmtmbG93TWFuaWZlc3Q7XG59KTogU2VyZGVDaGVja1Jlc3VsdCB7XG4gIGNvbnN0IHsgc291cmNlQ29kZSwgd29ya2Zsb3dDb2RlLCBtYW5pZmVzdCB9ID0gb3B0aW9ucztcblxuICAvLyAxLiBFeHRyYWN0IGFsbCBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHMgZnJvbSB0aGUgd29ya2Zsb3cgb3V0cHV0XG4gIGNvbnN0IGdsb2JhbE5vZGVJbXBvcnRzID0gZXh0cmFjdE5vZGVJbXBvcnRzKHdvcmtmbG93Q29kZSk7XG5cbiAgLy8gMi4gQ2hlY2sgaWYgdGhlIG1hbmlmZXN0IGNvbnRhaW5zIGFueSBzZXJkZS1yZWdpc3RlcmVkIGNsYXNzZXNcbiAgY29uc3QgY2xhc3NFbnRyaWVzID0gZXh0cmFjdENsYXNzRW50cmllcyhtYW5pZmVzdCk7XG4gIGNvbnN0IGhhc1NlcmRlQ2xhc3NlcyA9IGNsYXNzRW50cmllcy5sZW5ndGggPiAwO1xuXG4gIC8vIDMuIENoZWNrIGlmIHRoZSB3b3JrZmxvdyBvdXRwdXQgY29udGFpbnMgcmVnaXN0cmF0aW9uIElJRkVzXG4gIGNvbnN0IGhhc1JlZ2lzdHJhdGlvbiA9IHJlZ2lzdHJhdGlvbklpZmVSZWdleC50ZXN0KHdvcmtmbG93Q29kZSk7XG5cbiAgLy8gNC4gQW5hbHl6ZSBlYWNoIGNsYXNzXG4gIGNvbnN0IGNsYXNzZXM6IFNlcmRlQ2xhc3NDaGVja1Jlc3VsdFtdID0gY2xhc3NFbnRyaWVzLm1hcCgoZW50cnkpID0+IHtcbiAgICBjb25zdCBpc3N1ZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyBDaGVjayBmb3IgTm9kZS5qcyBpbXBvcnRzICh0aGVzZSB3aWxsIGZhaWwgaW4gdGhlIHdvcmtmbG93IHNhbmRib3gpXG4gICAgaWYgKGdsb2JhbE5vZGVJbXBvcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlzc3Vlcy5wdXNoKFxuICAgICAgICBgV29ya2Zsb3cgYnVuZGxlIGNvbnRhaW5zIE5vZGUuanMgYnVpbHQtaW4gaW1wb3J0czogJHtnbG9iYWxOb2RlSW1wb3J0cy5qb2luKCcsICcpfS4gYCArXG4gICAgICAgICAgYFRoZXNlIHdpbGwgZmFpbCBhdCBydW50aW1lIGluIHRoZSB3b3JrZmxvdyBzYW5kYm94LiBgICtcbiAgICAgICAgICBgQWRkIFwidXNlIHN0ZXBcIiB0byBtZXRob2RzIHRoYXQgZGVwZW5kIG9uIE5vZGUuanMgQVBJcyBzbyB0aGV5IGFyZSBzdHJpcHBlZCBmcm9tIHRoZSB3b3JrZmxvdyBidW5kbGUuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgcmVnaXN0cmF0aW9uXG4gICAgaWYgKCFoYXNSZWdpc3RyYXRpb24pIHtcbiAgICAgIGlzc3Vlcy5wdXNoKFxuICAgICAgICBgTm8gY2xhc3MgcmVnaXN0cmF0aW9uIElJRkUgd2FzIGdlbmVyYXRlZC4gYCArXG4gICAgICAgICAgYEVuc3VyZSBXT1JLRkxPV19TRVJJQUxJWkUgYW5kIFdPUktGTE9XX0RFU0VSSUFMSVpFIGFyZSBkZWZpbmVkIGFzIHN0YXRpYyBtZXRob2RzIGAgK1xuICAgICAgICAgIGBpbnNpZGUgdGhlIGNsYXNzIGJvZHkgdXNpbmcgY29tcHV0ZWQgcHJvcGVydHkgc3ludGF4OiBzdGF0aWMgW1dPUktGTE9XX1NFUklBTElaRV0oLi4uKSB7IC4uLiB9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2xhc3NOYW1lOiBlbnRyeS5jbGFzc05hbWUsXG4gICAgICBjbGFzc0lkOiBlbnRyeS5jbGFzc0lkLFxuICAgICAgZGV0ZWN0ZWQ6IHRydWUsXG4gICAgICByZWdpc3RlcmVkOiBoYXNSZWdpc3RyYXRpb24sXG4gICAgICBub2RlSW1wb3J0czogZ2xvYmFsTm9kZUltcG9ydHMsXG4gICAgICBjb21wbGlhbnQ6IGdsb2JhbE5vZGVJbXBvcnRzLmxlbmd0aCA9PT0gMCAmJiBoYXNSZWdpc3RyYXRpb24sXG4gICAgICBpc3N1ZXMsXG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gNS4gQ2hlY2sgZm9yIGNsYXNzZXMgdGhhdCBoYXZlIHNlcmRlIHBhdHRlcm5zIGluIHNvdXJjZSBidXQgd2VyZW4ndCBkZXRlY3RlZCBieSBTV0NcbiAgY29uc3Qgc291cmNlSGFzU2VyZGVQYXR0ZXJucyA9XG4gICAgL1xcW1xccypXT1JLRkxPV18oPzpTRVJJQUxJWkV8REVTRVJJQUxJWkUpXFxzKlxcXS8udGVzdChzb3VyY2VDb2RlKSB8fFxuICAgIC9TeW1ib2xcXC5mb3JcXHMqXFwoXFxzKlsnXCJdd29ya2Zsb3ctKD86c2VyaWFsaXplfGRlc2VyaWFsaXplKVsnXCJdXFxzKlxcKS8udGVzdChcbiAgICAgIHNvdXJjZUNvZGVcbiAgICApO1xuXG4gIGlmIChzb3VyY2VIYXNTZXJkZVBhdHRlcm5zICYmIGNsYXNzRW50cmllcy5sZW5ndGggPT09IDApIHtcbiAgICBjbGFzc2VzLnB1c2goe1xuICAgICAgY2xhc3NOYW1lOiAnPHVua25vd24+JyxcbiAgICAgIGNsYXNzSWQ6ICcnLFxuICAgICAgZGV0ZWN0ZWQ6IGZhbHNlLFxuICAgICAgcmVnaXN0ZXJlZDogZmFsc2UsXG4gICAgICBub2RlSW1wb3J0czogZ2xvYmFsTm9kZUltcG9ydHMsXG4gICAgICBjb21wbGlhbnQ6IGZhbHNlLFxuICAgICAgaXNzdWVzOiBbXG4gICAgICAgIGBTb3VyY2UgY29kZSBjb250YWlucyBXT1JLRkxPV19TRVJJQUxJWkUvV09SS0ZMT1dfREVTRVJJQUxJWkUgcGF0dGVybnMgYnV0IGAgK1xuICAgICAgICAgIGB0aGUgU1dDIHBsdWdpbiBkaWQgbm90IGRldGVjdCBhbnkgc2VyZGUtZW5hYmxlZCBjbGFzc2VzLiBgICtcbiAgICAgICAgICBgRW5zdXJlIHRoZSBzeW1ib2xzIGFyZSBkZWZpbmVkIGFzIHN0YXRpYyBtZXRob2RzIElOU0lERSB0aGUgY2xhc3MgYm9keSwgYCArXG4gICAgICAgICAgYG5vdCBhc3NpZ25lZCBleHRlcm5hbGx5IChlLmcuLCAoTXlDbGFzcyBhcyBhbnkpW1dPUktGTE9XX1NFUklBTElaRV0gPSAuLi4pLmAsXG4gICAgICBdLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjbGFzc2VzLFxuICAgIGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgIGhhc1NlcmRlQ2xhc3NlcyxcbiAgICBtYW5pZmVzdCxcbiAgfTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IE5vZGUuanMgYnVpbHQtaW4gbW9kdWxlIG5hbWVzIGZyb20gdHJhbnNmb3JtZWQgY29kZS5cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdE5vZGVJbXBvcnRzKGNvZGU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgaW1wb3J0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAvLyBSZXNldCByZWdleCBzdGF0ZVxuICBub2RlSW1wb3J0RXh0cmFjdFJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gIGZvciAoXG4gICAgbGV0IG1hdGNoID0gbm9kZUltcG9ydEV4dHJhY3RSZWdleC5leGVjKGNvZGUpO1xuICAgIG1hdGNoICE9PSBudWxsO1xuICAgIG1hdGNoID0gbm9kZUltcG9ydEV4dHJhY3RSZWdleC5leGVjKGNvZGUpXG4gICkge1xuICAgIC8vIG1hdGNoWzFdIGlzIGZyb20gdGhlIEVTTSBwYXR0ZXJuLCBtYXRjaFsyXSBpcyBmcm9tIHRoZSBDSlMgcGF0dGVyblxuICAgIGNvbnN0IG1vZHVsZU5hbWUgPSBtYXRjaFsxXSB8fCBtYXRjaFsyXTtcbiAgICBpZiAobW9kdWxlTmFtZSkge1xuICAgICAgLy8gTm9ybWFsaXplIHRvIGJhc2UgbW9kdWxlIG5hbWUgKGUuZy4sICdmcy9wcm9taXNlcycgLT4gJ2ZzJylcbiAgICAgIGltcG9ydHMuYWRkKG1vZHVsZU5hbWUuc3BsaXQoJy8nKVswXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBbLi4uaW1wb3J0c10uc29ydCgpO1xufVxuXG4vKipcbiAqIEV4dHJhY3QgY2xhc3MgZW50cmllcyBmcm9tIGEgV29ya2Zsb3dNYW5pZmVzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RDbGFzc0VudHJpZXMoXG4gIG1hbmlmZXN0OiBXb3JrZmxvd01hbmlmZXN0XG4pOiBBcnJheTx7IGNsYXNzTmFtZTogc3RyaW5nOyBjbGFzc0lkOiBzdHJpbmc7IGZpbGVOYW1lOiBzdHJpbmcgfT4ge1xuICBjb25zdCBlbnRyaWVzOiBBcnJheTx7XG4gICAgY2xhc3NOYW1lOiBzdHJpbmc7XG4gICAgY2xhc3NJZDogc3RyaW5nO1xuICAgIGZpbGVOYW1lOiBzdHJpbmc7XG4gIH0+ID0gW107XG4gIGlmICghbWFuaWZlc3QuY2xhc3NlcykgcmV0dXJuIGVudHJpZXM7XG5cbiAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNsYXNzZXNdIG9mIE9iamVjdC5lbnRyaWVzKG1hbmlmZXN0LmNsYXNzZXMpKSB7XG4gICAgZm9yIChjb25zdCBbY2xhc3NOYW1lLCB7IGNsYXNzSWQgfV0gb2YgT2JqZWN0LmVudHJpZXMoY2xhc3NlcykpIHtcbiAgICAgIGVudHJpZXMucHVzaCh7IGNsYXNzTmFtZSwgY2xhc3NJZCwgZmlsZU5hbWUgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBlbnRyaWVzO1xufVxuIiwgImltcG9ydCB7XG4gIENvcnJ1cHRlZEV2ZW50TG9nRXJyb3IsXG4gIEVudGl0eUNvbmZsaWN0RXJyb3IsXG4gIFByZWNvbmRpdGlvbkZhaWxlZEVycm9yLFxuICBSZXBsYXlEaXZlcmdlbmNlRXJyb3IsXG4gIFJVTl9FUlJPUl9DT0RFUyxcbiAgUnVuRXhwaXJlZEVycm9yLFxuICBXb3JrZmxvd1J1bnRpbWVFcnJvcixcbn0gZnJvbSAnQHdvcmtmbG93L2Vycm9ycyc7XG5pbXBvcnQgeyBzZXRXb3JrZmxvd0Jhc2VQYXRoIH0gZnJvbSAnQHdvcmtmbG93L3V0aWxzJztcbmltcG9ydCB7IHBhcnNlV29ya2Zsb3dOYW1lIH0gZnJvbSAnQHdvcmtmbG93L3V0aWxzL3BhcnNlLW5hbWUnO1xuaW1wb3J0IHtcbiAgdHlwZSBFdmVudCxcbiAgZ2V0UXVldWVUb3BpY1ByZWZpeCxcbiAgcmVzb2x2ZVF1ZXVlTmFtZXNwYWNlLFxuICBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgU1BFQ19WRVJTSU9OX0xFR0FDWSxcbiAgV29ya2Zsb3dJbnZva2VQYXlsb2FkU2NoZW1hLFxuICB0eXBlIFdvcmtmbG93UnVuLFxufSBmcm9tICdAd29ya2Zsb3cvd29ybGQnO1xuaW1wb3J0IHtcbiAgY2xhc3NpZnlSdW5FcnJvcixcbiAgaXNSZXRyeWFibGVXb3JsZEVycm9yLFxuICBpc1dvcmxkQ29udHJhY3RFcnJvcixcbn0gZnJvbSAnLi9jbGFzc2lmeS1lcnJvci5qcyc7XG5pbXBvcnQgeyBpbXBvcnRLZXkgfSBmcm9tICcuL2VuY3J5cHRpb24uanMnO1xuaW1wb3J0IHsgV29ya2Zsb3dTdXNwZW5zaW9uIH0gZnJvbSAnLi9nbG9iYWwuanMnO1xuaW1wb3J0IHsgcnVudGltZUxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyLmpzJztcbmltcG9ydCB7XG4gIE1BWF9RVUVVRV9ERUxJVkVSSUVTLFxuICBSRVBMQVlfRElWRVJHRU5DRV9NQVhfUkVUUklFUyxcbiAgUkVQTEFZX1RJTUVPVVRfTUFYX1JFVFJJRVMsXG4gIFJFUExBWV9USU1FT1VUX01TLFxufSBmcm9tICcuL3J1bnRpbWUvY29uc3RhbnRzLmpzJztcbmltcG9ydCB7XG4gIGdldFF1ZXVlT3ZlcmhlYWQsXG4gIGdldFdvcmtmbG93UXVldWVOYW1lLFxuICBnZXRXb3JrZmxvd1J1bkV2ZW50cyxcbiAgaGFuZGxlSGVhbHRoQ2hlY2tNZXNzYWdlLFxuICB0eXBlIE11dGFibGVFdmVudExvZyxcbiAgcGFyc2VIZWFsdGhDaGVja1BheWxvYWQsXG4gIHF1ZXVlTWVzc2FnZSxcbiAgc3RhdGVVcGRhdGVkQXRGb3JDcmVhdGUsXG4gIHdpdGhIZWFsdGhDaGVjayxcbiAgd2l0aFByZWNvbmRpdGlvblJldHJ5LFxufSBmcm9tICcuL3J1bnRpbWUvaGVscGVycy5qcyc7XG5pbXBvcnQgeyBoYW5kbGVTdXNwZW5zaW9uIH0gZnJvbSAnLi9ydW50aW1lL3N1c3BlbnNpb24taGFuZGxlci5qcyc7XG5pbXBvcnQgeyBnZXRXb3JsZCwgZ2V0V29ybGRIYW5kbGVycyB9IGZyb20gJy4vcnVudGltZS93b3JsZC5qcyc7XG5pbXBvcnQgeyByZW1hcEVycm9yU3RhY2sgfSBmcm9tICcuL3NvdXJjZS1tYXAuanMnO1xuaW1wb3J0ICogYXMgQXR0cmlidXRlIGZyb20gJy4vdGVsZW1ldHJ5L3NlbWFudGljLWNvbnZlbnRpb25zLmpzJztcbmltcG9ydCB7XG4gIGxpbmtUb0N1cnJlbnRDb250ZXh0LFxuICB0cmFjZSxcbiAgd2l0aFRyYWNlQ29udGV4dCxcbiAgd2l0aFdvcmtmbG93QmFnZ2FnZSxcbn0gZnJvbSAnLi90ZWxlbWV0cnkuanMnO1xuaW1wb3J0IHsgZ2V0RXJyb3JOYW1lLCBnZXRFcnJvclN0YWNrLCBub3JtYWxpemVVbmtub3duRXJyb3IgfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGJ1aWxkV29ya2Zsb3dTdXNwZW5zaW9uTWVzc2FnZSB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBydW5Xb3JrZmxvdyB9IGZyb20gJy4vd29ya2Zsb3cuanMnO1xuXG5leHBvcnQgdHlwZSB7IEV2ZW50LCBXb3JrZmxvd1J1biB9O1xuZXhwb3J0IHsgV29ya2Zsb3dTdXNwZW5zaW9uIH0gZnJvbSAnLi9nbG9iYWwuanMnO1xuZXhwb3J0IHtcbiAgdHlwZSBIZWFsdGhDaGVja0VuZHBvaW50LFxuICB0eXBlIEhlYWx0aENoZWNrT3B0aW9ucyxcbiAgdHlwZSBIZWFsdGhDaGVja1Jlc3VsdCxcbiAgaGVhbHRoQ2hlY2ssXG59IGZyb20gJy4vcnVudGltZS9oZWxwZXJzLmpzJztcbmV4cG9ydCB7XG4gIGdldEhvb2tCeVRva2VuLFxuICByZXN1bWVIb29rLFxuICByZXN1bWVXZWJob29rLFxufSBmcm9tICcuL3J1bnRpbWUvcmVzdW1lLWhvb2suanMnO1xuZXhwb3J0IHtcbiAgZ2V0UnVuLFxuICBSdW4sXG4gIHR5cGUgV29ya2Zsb3dSZWFkYWJsZVN0cmVhbSxcbiAgdHlwZSBXb3JrZmxvd1JlYWRhYmxlU3RyZWFtT3B0aW9ucyxcbn0gZnJvbSAnLi9ydW50aW1lL3J1bi5qcyc7XG5leHBvcnQge1xuICBjYW5jZWxSdW4sXG4gIGxpc3RTdHJlYW1zLFxuICB0eXBlIFJlYWRTdHJlYW1PcHRpb25zLFxuICB0eXBlIFJlY3JlYXRlUnVuT3B0aW9ucyxcbiAgcmVhZFN0cmVhbSxcbiAgcmVjcmVhdGVSdW5Gcm9tRXhpc3RpbmcsXG4gIHJlZW5xdWV1ZVJ1bixcbiAgdHlwZSBTdG9wU2xlZXBPcHRpb25zLFxuICB0eXBlIFN0b3BTbGVlcFJlc3VsdCxcbiAgd2FrZVVwUnVuLFxufSBmcm9tICcuL3J1bnRpbWUvcnVucy5qcyc7XG5leHBvcnQge1xuICB0eXBlIFN0YXJ0T3B0aW9ucyxcbiAgdHlwZSBTdGFydE9wdGlvbnNCYXNlLFxuICB0eXBlIFN0YXJ0T3B0aW9uc1dpdGhEZXBsb3ltZW50SWQsXG4gIHR5cGUgU3RhcnRPcHRpb25zV2l0aG91dERlcGxveW1lbnRJZCxcbiAgc3RhcnQsXG59IGZyb20gJy4vcnVudGltZS9zdGFydC5qcyc7XG5leHBvcnQgeyBzdGVwRW50cnlwb2ludCB9IGZyb20gJy4vcnVudGltZS9zdGVwLWhhbmRsZXIuanMnO1xuZXhwb3J0IHtcbiAgY3JlYXRlV29ybGQsXG4gIGdldFdvcmxkLFxuICBnZXRXb3JsZEhhbmRsZXJzLFxuICBzZXRXb3JsZCxcbn0gZnJvbSAnLi9ydW50aW1lL3dvcmxkLmpzJztcblxuZnVuY3Rpb24gaGFzUmVjb3JkZWRUZXJtaW5hbFJ1bkV2ZW50KGV2ZW50czogRXZlbnRbXSwgcnVuSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCB0ZXJtaW5hbEV2ZW50ID0gZXZlbnRzLmZpbmQoXG4gICAgKGV2ZW50KSA9PlxuICAgICAgZXZlbnQucnVuSWQgPT09IHJ1bklkICYmXG4gICAgICAoZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX2NvbXBsZXRlZCcgfHxcbiAgICAgICAgZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX2ZhaWxlZCcgfHxcbiAgICAgICAgZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX2NhbmNlbGxlZCcpXG4gICk7XG5cbiAgaWYgKCF0ZXJtaW5hbEV2ZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICdXb3JrZmxvdyBldmVudCBsb2cgYWxyZWFkeSBjb250YWlucyBhIHRlcm1pbmFsIHJ1biBldmVudCwgc2tpcHBpbmcgcmVwbGF5JyxcbiAgICB7XG4gICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgIGV2ZW50VHlwZTogdGVybWluYWxFdmVudC5ldmVudFR5cGUsXG4gICAgICBldmVudElkOiB0ZXJtaW5hbEV2ZW50LmV2ZW50SWQsXG4gICAgfVxuICApO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYSBzaW5nbGUgcm91dGUgd2hpY2ggaGFuZGxlcyBhbnkgd29ya2Zsb3cgZXhlY3V0aW9uXG4gKiByZXF1ZXN0IGFuZCByb3V0ZXMgdG8gdGhlIGFwcHJvcHJpYXRlIHdvcmtmbG93IGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB3b3JrZmxvd0NvZGUgLSBUaGUgd29ya2Zsb3cgYnVuZGxlIGNvZGUgY29udGFpbmluZyBhbGwgdGhlIHdvcmtmbG93XG4gKiBmdW5jdGlvbnMgYXQgdGhlIHRvcCBsZXZlbC5cbiAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCBhcyBhIFZlcmNlbCBBUEkgcm91dGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZmxvd0VudHJ5cG9pbnQoXG4gIHdvcmtmbG93Q29kZTogc3RyaW5nLFxuICBvcHRpb25zPzogeyBuYW1lc3BhY2U/OiBzdHJpbmc7IGJhc2VQYXRoPzogc3RyaW5nIH1cbik6IChyZXE6IFJlcXVlc3QpID0+IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgc2V0V29ya2Zsb3dCYXNlUGF0aChvcHRpb25zPy5iYXNlUGF0aCk7XG5cbiAgY29uc3QgbmFtZXNwYWNlID0gcmVzb2x2ZVF1ZXVlTmFtZXNwYWNlKG9wdGlvbnM/Lm5hbWVzcGFjZSk7XG4gIGNvbnN0IHdvcmtmbG93UHJlZml4ID0gZ2V0UXVldWVUb3BpY1ByZWZpeCgnd29ya2Zsb3cnLCBuYW1lc3BhY2UpO1xuXG4gIGNvbnN0IHsgY3JlYXRlUXVldWVIYW5kbGVyLCBzcGVjVmVyc2lvbjogd29ybGRTcGVjVmVyc2lvbiB9ID1cbiAgICBnZXRXb3JsZEhhbmRsZXJzKCk7XG4gIGNvbnN0IGhhbmRsZXIgPSBjcmVhdGVRdWV1ZUhhbmRsZXIoXG4gICAgd29ya2Zsb3dQcmVmaXgsXG4gICAgYXN5bmMgKG1lc3NhZ2VfLCBtZXRhZGF0YSkgPT4ge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIGhlYWx0aCBjaGVjayBtZXNzYWdlXG4gICAgICAvLyBOT1RFOiBIZWFsdGggY2hlY2sgbWVzc2FnZXMgYXJlIGludGVudGlvbmFsbHkgdW5hdXRoZW50aWNhdGVkIGZvciBtb25pdG9yaW5nIHB1cnBvc2VzLlxuICAgICAgLy8gVGhleSBvbmx5IHdyaXRlIGEgc2ltcGxlIHN0YXR1cyByZXNwb25zZSB0byBhIHN0cmVhbSBhbmQgZG8gbm90IGV4cG9zZSBzZW5zaXRpdmUgZGF0YS5cbiAgICAgIC8vIFRoZSBzdHJlYW0gbmFtZSBpbmNsdWRlcyBhIHVuaXF1ZSBjb3JyZWxhdGlvbklkIHRoYXQgbXVzdCBiZSBrbm93biBieSB0aGUgY2FsbGVyLlxuICAgICAgY29uc3QgaGVhbHRoQ2hlY2sgPSBwYXJzZUhlYWx0aENoZWNrUGF5bG9hZChtZXNzYWdlXyk7XG4gICAgICBpZiAoaGVhbHRoQ2hlY2spIHtcbiAgICAgICAgYXdhaXQgaGFuZGxlSGVhbHRoQ2hlY2tNZXNzYWdlKFxuICAgICAgICAgIGhlYWx0aENoZWNrLFxuICAgICAgICAgICd3b3JrZmxvdycsXG4gICAgICAgICAgd29ybGRTcGVjVmVyc2lvblxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcnVuSWQsXG4gICAgICAgIHRyYWNlQ2FycmllcjogdHJhY2VDb250ZXh0LFxuICAgICAgICByZXF1ZXN0ZWRBdCxcbiAgICAgICAgcmVwbGF5RGl2ZXJnZW5jZSxcbiAgICAgICAgcnVuSW5wdXQsXG4gICAgICB9ID0gV29ya2Zsb3dJbnZva2VQYXlsb2FkU2NoZW1hLnBhcnNlKG1lc3NhZ2VfKTtcbiAgICAgIGNvbnN0IHsgcmVxdWVzdElkIH0gPSBtZXRhZGF0YTtcbiAgICAgIC8vIEV4dHJhY3QgdGhlIHdvcmtmbG93IG5hbWUgZnJvbSB0aGUgdG9waWMgbmFtZVxuICAgICAgY29uc3Qgd29ya2Zsb3dOYW1lID0gbWV0YWRhdGEucXVldWVOYW1lLnNsaWNlKHdvcmtmbG93UHJlZml4Lmxlbmd0aCk7XG5cbiAgICAgIC8vIC0tLSBNYXggZGVsaXZlcnkgY2hlY2sgLS0tXG4gICAgICAvLyBFbmZvcmNlIG1heCBkZWxpdmVyeSBsaW1pdCBiZWZvcmUgYW55IGluZnJhc3RydWN0dXJlIGNhbGxzLlxuICAgICAgLy8gVGhpcyBwcmV2ZW50cyBydW5hd2F5IHdvcmtmbG93cyBmcm9tIGNvbnN1bWluZyBpbmZpbml0ZSBxdWV1ZSBkZWxpdmVyaWVzLlxuICAgICAgLy8gQXQgdGhpcyBwb2ludCwgd2Ugd2FudCB0byBkbyB0aGUgbWluaW1hbCBhbW91bnQgb2Ygd29yayAobm8gZmV0Y2hpbmdcbiAgICAgIC8vIG9mIHRoZSB3b3JrZmxvdyBldmVudHMsIGV0Yy4gV2Ugc2ltcGx5IGF0dGVtcHQgdG8gbWFyayB0aGUgcnVuIGFzIGZhaWxlZFxuICAgICAgLy8gYW5kIGlmIHRoYXQgZmFpbHMsIHRoZSBtZXNzYWdlIGlzIHN0aWxsIGNvbnN1bWVkIGJ1dCB3aXRoIGFkZXF1YXRlIGxvZ2dpbmdcbiAgICAgIC8vIHRoYXQgYW4gZXJyb3Igb2NjdXJyZWQgcHJldmVudGluZyB1cyBmcm9tIGZhaWxpbmcgdGhlIHJ1bi5cbiAgICAgIGlmIChtZXRhZGF0YS5hdHRlbXB0ID4gTUFYX1FVRVVFX0RFTElWRVJJRVMpIHtcbiAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICBgV29ya2Zsb3cgaGFuZGxlciBleGNlZWRlZCBtYXggZGVsaXZlcmllcyAoJHttZXRhZGF0YS5hdHRlbXB0fS8ke01BWF9RVUVVRV9ERUxJVkVSSUVTfSlgLFxuICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQsIHdvcmtmbG93TmFtZSwgYXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCB9XG4gICAgICAgICk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgd29ybGQgPSBnZXRXb3JsZCgpO1xuICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2ZhaWxlZCcsXG4gICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBXb3JrZmxvdyBleGNlZWRlZCBtYXhpbXVtIHF1ZXVlIGRlbGl2ZXJpZXMgKCR7bWV0YWRhdGEuYXR0ZW1wdH0vJHtNQVhfUVVFVUVfREVMSVZFUklFU30pYCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLk1BWF9ERUxJVkVSSUVTX0VYQ0VFREVELFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBpZiAoRW50aXR5Q29uZmxpY3RFcnJvci5pcyhlcnIpIHx8IFJ1bkV4cGlyZWRFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAvLyBSdW4gYWxyZWFkeSBmaW5pc2hlZCwgY29uc3VtZSB0aGUgbWVzc2FnZSBzaWxlbnRseVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgYEZhaWxlZCB0byBtYXJrIHJ1biBhcyBmYWlsZWQgYWZ0ZXIgJHttZXRhZGF0YS5hdHRlbXB0fSBkZWxpdmVyeSBhdHRlbXB0cy4gYCArXG4gICAgICAgICAgICAgIGBBIHBlcnNpc3RlbnQgZXJyb3IgaXMgcHJldmVudGluZyB0aGUgcnVuIGZyb20gYmVpbmcgdGVybWluYXRlZC4gYCArXG4gICAgICAgICAgICAgIGBUaGUgcnVuIHdpbGwgcmVtYWluIGluIGl0cyBjdXJyZW50IHN0YXRlIHVudGlsIG1hbnVhbGx5IHJlc29sdmVkLiBgICtcbiAgICAgICAgICAgICAgYFRoaXMgaXMgbW9zdCBsaWtlbHkgZHVlIHRvIGEgcGVyc2lzdGVudCBvdXRhZ2Ugb2YgdGhlIHdvcmtmbG93IGJhY2tlbmQgYCArXG4gICAgICAgICAgICAgIGBvciBhIGJ1ZyBpbiB0aGUgd29ya2Zsb3cgcnVudGltZSBhbmQgc2hvdWxkIGJlIHJlcG9ydGVkIHRvIHRoZSBXb3JrZmxvdyB0ZWFtLmAsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICBlcnJvcjogZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpLFxuICAgICAgICAgICAgICBhdHRlbXB0OiBtZXRhZGF0YS5hdHRlbXB0LFxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzcGFuTGlua3MgPSBhd2FpdCBsaW5rVG9DdXJyZW50Q29udGV4dCgpO1xuXG4gICAgICAvLyAtLS0gUmVwbGF5IHRpbWVvdXQgZ3VhcmQgLS0tXG4gICAgICAvLyBJZiB0aGUgcmVwbGF5IHRha2VzIGxvbmdlciB0aGFuIHRoZSB0aW1lb3V0LCBmYWlsIHRoZSBydW4gYW5kIGV4aXQuXG4gICAgICAvLyBUaGlzIG11c3QgYmUgbG93ZXIgdGhhbiB0aGUgZnVuY3Rpb24ncyBtYXhEdXJhdGlvbiB0byBlbnN1cmVcbiAgICAgIC8vIHRoZSBmYWlsdXJlIGlzIHJlY29yZGVkIGJlZm9yZSB0aGUgcGxhdGZvcm0ga2lsbHMgdGhlIGZ1bmN0aW9uLlxuICAgICAgbGV0IHJlcGxheVRpbWVvdXQ6IE5vZGVKUy5UaW1lb3V0IHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKHByb2Nlc3MuZW52LlZFUkNFTF9VUkwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXBsYXlUaW1lb3V0ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcignV29ya2Zsb3cgcmVwbGF5IGV4Y2VlZGVkIHRpbWVvdXQnLCB7XG4gICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgIHRpbWVvdXRNczogUkVQTEFZX1RJTUVPVVRfTVMsXG4gICAgICAgICAgICBhdHRlbXB0OiBtZXRhZGF0YS5hdHRlbXB0LFxuICAgICAgICAgICAgbWF4UmV0cmllczogUkVQTEFZX1RJTUVPVVRfTUFYX1JFVFJJRVMsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBBbGxvdyBhIGZldyByZXRyaWVzIGJlZm9yZSBwZXJtYW5lbnRseSBmYWlsaW5nIHRoZSBydW4uXG4gICAgICAgICAgLy8gT24gZWFybHkgYXR0ZW1wdHMsIGp1c3QgZXhpdCBzbyB0aGUgcXVldWUgcmV0cmllcyB0aGUgbWVzc2FnZS5cbiAgICAgICAgICBpZiAobWV0YWRhdGEuYXR0ZW1wdCA8PSBSRVBMQVlfVElNRU9VVF9NQVhfUkVUUklFUykge1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB3b3JsZCA9IGF3YWl0IGdldFdvcmxkKCk7XG4gICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBXb3JrZmxvdyByZXBsYXkgZXhjZWVkZWQgbWF4aW11bSBkdXJhdGlvbiAoJHtSRVBMQVlfVElNRU9VVF9NUyAvIDEwMDB9cykgYWZ0ZXIgJHttZXRhZGF0YS5hdHRlbXB0fSBhdHRlbXB0c2AsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuUkVQTEFZX1RJTUVPVVQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIEJlc3QgZWZmb3J0IOKAlCBwcm9jZXNzIGV4aXRzIHJlZ2FyZGxlc3NcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgYWxzbyBwcmV2ZW50cyB0aGUgcnVudGltZSBmcm9tIGFja2luZyB0aGUgcXVldWUgbWVzc2FnZSxcbiAgICAgICAgICAvLyBzbyB0aGUgcXVldWUgd2lsbCBjYWxsIGJhY2sgb25jZSwgYWZ0ZXIgd2hpY2ggYSA0MTAgd2lsbCBnZXQgaXQgdG8gZXhpdCBlYXJseS5cbiAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH0sIFJFUExBWV9USU1FT1VUX01TKTtcbiAgICAgICAgcmVwbGF5VGltZW91dC51bnJlZigpO1xuICAgICAgfVxuXG4gICAgICAvLyBJbnZva2UgdXNlciB3b3JrZmxvdyB3aXRoaW4gdGhlIHByb3BhZ2F0ZWQgdHJhY2UgY29udGV4dCBhbmQgYmFnZ2FnZVxuICAgICAgcmV0dXJuIGF3YWl0IHdpdGhUcmFjZUNvbnRleHQodHJhY2VDb250ZXh0LCBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIFNldCB3b3JrZmxvdyBjb250ZXh0IGFzIGJhZ2dhZ2UgZm9yIGF1dG9tYXRpYyBwcm9wYWdhdGlvblxuICAgICAgICByZXR1cm4gYXdhaXQgd2l0aFdvcmtmbG93QmFnZ2FnZShcbiAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkLCB3b3JrZmxvd05hbWUgfSxcbiAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB3b3JsZCA9IGdldFdvcmxkKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJhY2UoXG4gICAgICAgICAgICAgIGBXT1JLRkxPVyAke3dvcmtmbG93TmFtZX1gLFxuICAgICAgICAgICAgICB7IGxpbmtzOiBzcGFuTGlua3MgfSxcbiAgICAgICAgICAgICAgYXN5bmMgKHNwYW4pID0+IHtcbiAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd05hbWUod29ya2Zsb3dOYW1lKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd09wZXJhdGlvbignZXhlY3V0ZScpLFxuICAgICAgICAgICAgICAgICAgLy8gU3RhbmRhcmQgT1RFTCBtZXNzYWdpbmcgY29udmVudGlvbnNcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5NZXNzYWdpbmdTeXN0ZW0oJ3ZlcmNlbC1xdWV1ZScpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLk1lc3NhZ2luZ0Rlc3RpbmF0aW9uTmFtZShtZXRhZGF0YS5xdWV1ZU5hbWUpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLk1lc3NhZ2luZ01lc3NhZ2VJZChtZXRhZGF0YS5tZXNzYWdlSWQpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLk1lc3NhZ2luZ09wZXJhdGlvblR5cGUoJ3Byb2Nlc3MnKSxcbiAgICAgICAgICAgICAgICAgIC4uLmdldFF1ZXVlT3ZlcmhlYWQoeyByZXF1ZXN0ZWRBdCB9KSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIFRPRE86IHZhbGlkYXRlIGB3b3JrZmxvd05hbWVgIGV4aXN0cyBiZWZvcmUgY29uc3VtaW5nIG1lc3NhZ2U/XG5cbiAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1bklkKHJ1bklkKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1RyYWNlUHJvcGFnYXRlZCghIXRyYWNlQ29udGV4dCksXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgd29ya2Zsb3dTdGFydGVkQXQgPSAtMTtcbiAgICAgICAgICAgICAgICBsZXQgd29ya2Zsb3dSdW46IFdvcmtmbG93UnVuIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIC8vIFByZS1sb2FkZWQgZXZlbnRzIGZyb20gdGhlIHJ1bl9zdGFydGVkIHJlc3BvbnNlLlxuICAgICAgICAgICAgICAgIC8vIFdoZW4gcHJlc2VudCwgd2Ugc2tpcCB0aGUgZXZlbnRzLmxpc3QgY2FsbC5cbiAgICAgICAgICAgICAgICBsZXQgcHJlbG9hZGVkRXZlbnRzOiBFdmVudFtdIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGxldCBwcmVsb2FkZWRFdmVudHNDdXJzb3I6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAvLyAtLS0gSW5mcmFzdHJ1Y3R1cmU6IHByZXBhcmUgdGhlIHJ1biBzdGF0ZSAtLS1cbiAgICAgICAgICAgICAgICAvLyBBbHdheXMgY2FsbCBydW5fc3RhcnRlZCBkaXJlY3RseSDigJQgdGhpcyBib3RoIHRyYW5zaXRpb25zXG4gICAgICAgICAgICAgICAgLy8gdGhlIHJ1biB0byAncnVubmluZycgQU5EIHJldHVybnMgdGhlIHJ1biBlbnRpdHksIHNhdmluZ1xuICAgICAgICAgICAgICAgIC8vIGEgc2VwYXJhdGUgcnVucy5nZXQgcm91bmQtdHJpcC5cbiAgICAgICAgICAgICAgICAvLyBDb250cmFjdDogZXZlbnRzLmNyZWF0ZSgncnVuX3N0YXJ0ZWQnKSBtdXN0IGJlIGlkZW1wb3RlbnRcbiAgICAgICAgICAgICAgICAvLyBmb3IgcnVucyBhbHJlYWR5IGluICdydW5uaW5nJyBzdGF0dXMgKHJldHVybiB0aGUgcnVuXG4gICAgICAgICAgICAgICAgLy8gd2l0aG91dCBlcnJvciksIG5vdCBqdXN0IGZvciBwZW5kaW5nIOKGkiBydW5uaW5nIHRyYW5zaXRpb25zLlxuICAgICAgICAgICAgICAgIC8vIE5ldHdvcmsvc2VydmVyIGVycm9ycyBwcm9wYWdhdGUgdG8gdGhlIHF1ZXVlIGhhbmRsZXIgZm9yIHJldHJ5LlxuICAgICAgICAgICAgICAgIC8vIFdvcmtmbG93UnVudGltZUVycm9yIChkYXRhIGludGVncml0eSBpc3N1ZXMpIGFyZSBmYXRhbCBhbmRcbiAgICAgICAgICAgICAgICAvLyBwcm9kdWNlIHJ1bl9mYWlsZWQgc2luY2UgcmV0cnlpbmcgd29uJ3QgZml4IHRoZW0uXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX3N0YXJ0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIFVzZSB0aGUgc3BlYyB2ZXJzaW9uIGZyb20gdGhlIG9yaWdpbmFsIHN0YXJ0KCkgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gYXZhaWxhYmxlLCBzbyB0aGUgcmVzaWxpZW50IHN0YXJ0IHBhdGggY3JlYXRlc1xuICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBydW4gd2l0aCB0aGUgY29ycmVjdCB2ZXJzaW9uIChub3QgYWx3YXlzIGN1cnJlbnQpLlxuICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOlxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuSW5wdXQ/LnNwZWNWZXJzaW9uID8/IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgIC8vIFBhc3MgcnVuIGlucHV0IGZyb20gcXVldWUgc28gdGhlIHNlcnZlciBjYW5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHJ1biBpZiBydW5fY3JlYXRlZCB3YXMgbWlzc2VkLlxuICAgICAgICAgICAgICAgICAgICAgIC8vIFVpbnQ4QXJyYXkgdmFsdWVzIHN1cnZpdmUgdGhlIHF1ZXVlIG5hdGl2ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgLy8gKENCT1Igb24gd29ybGQtdmVyY2VsLCBKU09OIHJldml2ZXIgb24gd29ybGQtbG9jYWwpLlxuICAgICAgICAgICAgICAgICAgICAgIC4uLihydW5JbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogcnVuSW5wdXQuaW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3ltZW50SWQ6IHJ1bklucHV0LmRlcGxveW1lbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogcnVuSW5wdXQud29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhlY3V0aW9uQ29udGV4dDogcnVuSW5wdXQuZXhlY3V0aW9uQ29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICA6IHt9KSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LnJ1bikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYEV2ZW50IGNyZWF0aW9uIGZvciAncnVuX3N0YXJ0ZWQnIGRpZCBub3QgcmV0dXJuIHRoZSBydW4gZW50aXR5IGZvciBydW4gXCIke3J1bklkfVwiYFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4gPSByZXN1bHQucnVuO1xuXG4gICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcmVzcG9uc2UgaW5jbHVkZXMgZXZlbnRzLCB1c2UgdGhlbSB0byBza2lwXG4gICAgICAgICAgICAgICAgICAvLyB0aGUgaW5pdGlhbCBldmVudHMubGlzdCBjYWxsIGFuZCByZWR1Y2UgVFRGQi5cbiAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmV2ZW50cyAmJlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZXZlbnRzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhhc01vcmUgIT09IHRydWVcbiAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkZWRFdmVudHMgPSByZXN1bHQuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkZWRFdmVudHNDdXJzb3IgPSByZXN1bHQuY3Vyc29yO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZiAoIXdvcmtmbG93UnVuLnN0YXJ0ZWRBdCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYFdvcmtmbG93IHJ1biBcIiR7cnVuSWR9XCIgaGFzIG5vIFwic3RhcnRlZEF0XCIgdGltZXN0YW1wYFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgLy8gUnVuIHdhcyBjb25jdXJyZW50bHkgY29tcGxldGVkL2ZhaWxlZC9jYW5jZWxsZWRcbiAgICAgICAgICAgICAgICAgIGlmIChFbnRpdHlDb25mbGljdEVycm9yLmlzKGVycikgfHwgUnVuRXhwaXJlZEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRW50aXR5Q29uZmxpY3RFcnJvcjogcnVuIHdhcyBjb25jdXJyZW50bHlcbiAgICAgICAgICAgICAgICAgICAgLy8gY29tcGxldGVkL2ZhaWxlZC9jYW5jZWxsZWQgZHVyaW5nIHNldHVwLlxuICAgICAgICAgICAgICAgICAgICAvLyBSdW5FeHBpcmVkRXJyb3I6IHJ1biBhbHJlYWR5IGluIHRlcm1pbmFsIHN0YXRlLlxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBib3RoIGNhc2VzLCBza2lwIHByb2Nlc3NpbmcgdGhpcyBtZXNzYWdlLlxuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgJ1J1biBhbHJlYWR5IGZpbmlzaGVkIGR1cmluZyBzZXR1cCwgc2tpcHBpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQsIG1lc3NhZ2U6IGVyci5tZXNzYWdlIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIgaW5zdGFuY2VvZiBXb3JrZmxvd1J1bnRpbWVFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCBydW50aW1lIGVycm9yIGR1cmluZyB3b3JrZmxvdyBzZXR1cCcsXG4gICAgICAgICAgICAgICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCwgZXJyb3I6IGVyci5tZXNzYWdlIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5SVU5USU1FX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChmYWlsRXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgRW50aXR5Q29uZmxpY3RFcnJvci5pcyhmYWlsRXJyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgUnVuRXhwaXJlZEVycm9yLmlzKGZhaWxFcnIpXG4gICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihmYWlsRXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIHJlY29yZGluZyB3b3JrZmxvdyBmYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbEVyciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZmFpbEVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogU3RyaW5nKGZhaWxFcnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBmYWlsRXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciBkdXJpbmcgd29ya2Zsb3cgc2V0dXAnLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuV09STERfQ09OVFJBQ1RfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2ZhaWxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChmYWlsRXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgRW50aXR5Q29uZmxpY3RFcnJvci5pcyhmYWlsRXJyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgUnVuRXhwaXJlZEVycm9yLmlzKGZhaWxFcnIpXG4gICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihmYWlsRXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIHJlY29yZGluZyB3b3JrZmxvdyBmYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbEVyciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZmFpbEVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogU3RyaW5nKGZhaWxFcnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBmYWlsRXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3b3JrZmxvd1N0YXJ0ZWRBdCA9ICt3b3JrZmxvd1J1bi5zdGFydGVkQXQ7XG5cbiAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1blN0YXR1cyh3b3JrZmxvd1J1bi5zdGF0dXMpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93U3RhcnRlZEF0KHdvcmtmbG93U3RhcnRlZEF0KSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmICh3b3JrZmxvd1J1bi5zdGF0dXMgIT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgICAgICAgLy8gV29ya2Zsb3cgaGFzIGFscmVhZHkgY29tcGxldGVkIG9yIGZhaWxlZCwgc28gd2UgY2FuIHNraXAgaXRcbiAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgJ1dvcmtmbG93IGFscmVhZHkgY29tcGxldGVkIG9yIGZhaWxlZCwgc2tpcHBpbmcnLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB3b3JrZmxvd1J1bi5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGZvciBgY2FuY2VsYCwgd2UgYWN0dWFsbHkgd2FudCB0byBwcm9wYWdhdGUgYSBXb3JrZmxvd0NhbmNlbGxlZCBldmVudFxuICAgICAgICAgICAgICAgICAgLy8gaW5zaWRlIHRoZSB3b3JrZmxvdyBjb250ZXh0IHNvIHRoZSB1c2VyIGNhbiBncmFjZWZ1bGx5IGV4aXQuIHRoaXMgaXMgU0lHVEVSTVxuICAgICAgICAgICAgICAgICAgLy8gVE9ETzogZnVydGhlcm1vcmUsIHRoZXJlIHNob3VsZCBiZSBhIHRpbWVvdXQgb3IgYSB3YXkgdG8gZm9yY2UgY2FuY2VsIFNJR0tJTExcbiAgICAgICAgICAgICAgICAgIC8vIHNvIHRoYXQgd2UgYWN0dWFsbHkgZXhpdCBoZXJlIHdpdGhvdXQgcmVwbGF5aW5nIHRoZSB3b3JrZmxvdyBhdCBhbGwsIGluIHRoZSBjYXNlXG4gICAgICAgICAgICAgICAgICAvLyB0aGUgcmVwbGF5aW5nIHRoZSB3b3JrZmxvdyBpcyBpdHNlbGYgZmFpbGluZy5cblxuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIExvYWQgYWxsIGV2ZW50cyBpbnRvIG1lbW9yeSBiZWZvcmUgcnVubmluZy5cbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSBnb3QgcHJlLWxvYWRlZCBldmVudHMgZnJvbSB0aGUgcnVuX3N0YXJ0ZWQgcmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgLy8gc2tpcCB0aGUgZXZlbnRzLmxpc3Qgcm91bmQtdHJpcCB0byByZWR1Y2UgVFRGQi5cbiAgICAgICAgICAgICAgICBsZXQgZXZlbnRzOiBFdmVudFtdO1xuICAgICAgICAgICAgICAgIGxldCBldmVudHNDdXJzb3I6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGlmIChwcmVsb2FkZWRFdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzID0gcHJlbG9hZGVkRXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICBldmVudHNDdXJzb3IgPSBwcmVsb2FkZWRFdmVudHNDdXJzb3I7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRFdmVudHMgPSBhd2FpdCBnZXRXb3JrZmxvd1J1bkV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBldmVudHMgPSBsb2FkZWRFdmVudHMuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICBldmVudHNDdXJzb3IgPSBsb2FkZWRFdmVudHMuY3Vyc29yO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgaWYgKGlzV29ybGRDb250cmFjdEVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgd29ybGQgY29udHJhY3QgZXJyb3Igd2hpbGUgbG9hZGluZyB3b3JrZmxvdyBldmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuV09STERfQ09OVFJBQ1RfRVJST1IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2ZhaWxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChmYWlsRXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgRW50aXR5Q29uZmxpY3RFcnJvci5pcyhmYWlsRXJyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgUnVuRXhwaXJlZEVycm9yLmlzKGZhaWxFcnIpXG4gICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihmYWlsRXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIHJlY29yZGluZyB3b3JrZmxvdyBmYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbEVyciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZmFpbEVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogU3RyaW5nKGZhaWxFcnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBmYWlsRXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUaGUgbWF0ZXJpYWxpemVkIHJ1biByZXR1cm5lZCBieSBydW5fc3RhcnRlZCBjYW4gcmFjZSBhXG4gICAgICAgICAgICAgICAgLy8gdGVybWluYWwgZXZlbnQgaW4gdGhlIGxvYWRlZCBzbmFwc2hvdC4gRG8gbm90IHJlcGxheSBhIHJ1blxuICAgICAgICAgICAgICAgIC8vIHdob3NlIGV2ZW50IGxvZyBhbHJlYWR5IGVzdGFibGlzaGVzIGl0cyB0ZXJtaW5hbCBvdXRjb21lLlxuICAgICAgICAgICAgICAgIGlmIChoYXNSZWNvcmRlZFRlcm1pbmFsUnVuRXZlbnQoZXZlbnRzLCBydW5JZCkpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgYW55IGVsYXBzZWQgd2FpdHMgYW5kIGNyZWF0ZSB3YWl0X2NvbXBsZXRlZCBldmVudHNcbiAgICAgICAgICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgICAgICAgICAgLy8gUHJlLWNvbXB1dGUgY29tcGxldGVkIGNvcnJlbGF0aW9uIElEcyBmb3IgTyhuKSBsb29rdXAgaW5zdGVhZCBvZiBPKG7CsilcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wbGV0ZWRXYWl0SWRzID0gbmV3IFNldChcbiAgICAgICAgICAgICAgICAgIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChlKSA9PiBlLmV2ZW50VHlwZSA9PT0gJ3dhaXRfY29tcGxldGVkJylcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoZSkgPT4gZS5jb3JyZWxhdGlvbklkKVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAvLyBDb2xsZWN0IGFsbCB3YWl0cyB0aGF0IG5lZWQgY29tcGxldGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IHdhaXRzVG9Db21wbGV0ZSA9IGV2ZW50c1xuICAgICAgICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAgIGVcbiAgICAgICAgICAgICAgICAgICAgKTogZSBpcyBFeHRyYWN0PEV2ZW50LCB7IGV2ZW50VHlwZTogJ3dhaXRfY3JlYXRlZCcgfT4gJiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29ycmVsYXRpb25JZDogc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICB9ID0+XG4gICAgICAgICAgICAgICAgICAgICAgZS5ldmVudFR5cGUgPT09ICd3YWl0X2NyZWF0ZWQnICYmXG4gICAgICAgICAgICAgICAgICAgICAgZS5jb3JyZWxhdGlvbklkICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAhY29tcGxldGVkV2FpdElkcy5oYXMoZS5jb3JyZWxhdGlvbklkKSAmJlxuICAgICAgICAgICAgICAgICAgICAgIG5vdyA+PSAoZS5ldmVudERhdGEucmVzdW1lQXQgYXMgRGF0ZSkuZ2V0VGltZSgpXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAubWFwKChlKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICd3YWl0X2NvbXBsZXRlZCcgYXMgY29uc3QsXG4gICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgY29ycmVsYXRpb25JZDogZS5jb3JyZWxhdGlvbklkLFxuICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bWVBdDogZS5ldmVudERhdGEucmVzdW1lQXQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYWxsIHdhaXRfY29tcGxldGVkIGV2ZW50c1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgd2FpdEV2ZW50IG9mIHdhaXRzVG9Db21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgY29uc3Qgd2FpdExvZzogTXV0YWJsZUV2ZW50TG9nID0ge1xuICAgICAgICAgICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogZXZlbnRzQ3Vyc29yID8/IG51bGwsXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgd2l0aFByZWNvbmRpdGlvblJldHJ5KFxuICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIHdhaXRMb2csXG4gICAgICAgICAgICAgICAgICAgICAgKHN0YXRlVXBkYXRlZEF0KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgd29ybGQuZXZlbnRzLmNyZWF0ZShydW5JZCwgd2FpdEV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVVcGRhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChFbnRpdHlDb25mbGljdEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oJ1dhaXQgYWxyZWFkeSBjb21wbGV0ZWQsIHNraXBwaW5nJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3JyZWxhdGlvbklkOiB3YWl0RXZlbnQuY29ycmVsYXRpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZWxvYWRzIGluc2lkZSB0aGUgZ3VhcmQgbWF5IGhhdmUgYWR2YW5jZWQgdGhlIGN1cnNvci5cbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzQ3Vyc29yID0gd2FpdExvZy5jdXJzb3I7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHdhaXRzVG9Db21wbGV0ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGUgZXZlbnQgbGlzdCBhYm92ZSBtYXkgYmUgc3RhbGUgYnkgdGhlIHRpbWUgYW4gZWxhcHNlZFxuICAgICAgICAgICAgICAgICAgLy8gd2FpdCBpcyBjb21taXR0ZWQuIExvYWQgb25seSBldmVudHMgYWZ0ZXIgdGhlIG9yaWdpbmFsXG4gICAgICAgICAgICAgICAgICAvLyBzbmFwc2hvdCBjdXJzb3Igc28gY29uY3VycmVudCBkdXJhYmxlIGV2ZW50cywgc3VjaCBhc1xuICAgICAgICAgICAgICAgICAgLy8gaG9va19yZWNlaXZlZCwga2VlcCB0aGVpciBvcmRlcmluZyByZWxhdGl2ZSB0b1xuICAgICAgICAgICAgICAgICAgLy8gd2FpdF9jb21wbGV0ZWQuIEZhbGwgYmFjayB0byBhIGZ1bGwgcmVsb2FkIGZvciBvbGRlciB3b3JsZHNcbiAgICAgICAgICAgICAgICAgIC8vIHRoYXQgY2Fubm90IGdpdmUgdXMgYSBzdGFibGUgY3Vyc29yLlxuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50c0N1cnNvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdFdmVudHMgPSBhd2FpdCBnZXRXb3JrZmxvd1J1bkV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICBldmVudHNDdXJzb3JcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcGxldGVkV2FpdElkc0FmdGVyQ3Vyc29yID0gbmV3IFNldChcbiAgICAgICAgICAgICAgICAgICAgICBuZXdFdmVudHMuZXZlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChlKSA9PiBlLmV2ZW50VHlwZSA9PT0gJ3dhaXRfY29tcGxldGVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGUpID0+IGUuY29ycmVsYXRpb25JZClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2F3QWxsV2FpdENvbXBsZXRpb25zID0gd2FpdHNUb0NvbXBsZXRlLmV2ZXJ5KFxuICAgICAgICAgICAgICAgICAgICAgICh3YWl0RXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWRXYWl0SWRzQWZ0ZXJDdXJzb3IuaGFzKHdhaXRFdmVudC5jb3JyZWxhdGlvbklkKVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzYXdBbGxXYWl0Q29tcGxldGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ0lkcyA9IG5ldyBTZXQoXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMubWFwKChldmVudCkgPT4gZXZlbnQuZXZlbnRJZClcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgbmV3RXZlbnRzLmV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFleGlzdGluZ0lkcy5oYXMoZXZlbnQuZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdJZHMuYWRkKGV2ZW50LmV2ZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlZEV2ZW50cyA9IGF3YWl0IGdldFdvcmtmbG93UnVuRXZlbnRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWRcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cyA9IGxvYWRlZEV2ZW50cy5ldmVudHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlZEV2ZW50cyA9IGF3YWl0IGdldFdvcmtmbG93UnVuRXZlbnRzKFxuICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuLnJ1bklkXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cyA9IGxvYWRlZEV2ZW50cy5ldmVudHM7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIEEgY29uY3VycmVudCB0ZXJtaW5hbCB3cml0ZSBtYXkgaGF2ZSBsYW5kZWQgd2hpbGVcbiAgICAgICAgICAgICAgICAgIC8vIGNvbW1pdHRpbmcgYW4gZWxhcHNlZCB3YWl0IGFuZCByZWZyZXNoaW5nIHRoZSBzbmFwc2hvdC5cbiAgICAgICAgICAgICAgICAgIGlmIChoYXNSZWNvcmRlZFRlcm1pbmFsUnVuRXZlbnQoZXZlbnRzLCBydW5JZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFJlc29sdmUgdGhlIGVuY3J5cHRpb24ga2V5IGZvciB0aGlzIHJ1bidzIGRlcGxveW1lbnRcbiAgICAgICAgICAgICAgICBjb25zdCByYXdLZXkgPVxuICAgICAgICAgICAgICAgICAgYXdhaXQgd29ybGQuZ2V0RW5jcnlwdGlvbktleUZvclJ1bj8uKHdvcmtmbG93UnVuKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmNyeXB0aW9uS2V5ID0gcmF3S2V5XG4gICAgICAgICAgICAgICAgICA/IGF3YWl0IGltcG9ydEtleShyYXdLZXkpXG4gICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgIC8vIC0tLSBVc2VyIGNvZGUgZXhlY3V0aW9uIC0tLVxuICAgICAgICAgICAgICAgIC8vIE9ubHkgZXJyb3JzIGZyb20gcnVuV29ya2Zsb3coKSAodXNlciB3b3JrZmxvdyBjb2RlKSBzaG91bGRcbiAgICAgICAgICAgICAgICAvLyBwcm9kdWNlIHJ1bl9mYWlsZWQuIEluZnJhc3RydWN0dXJlIGVycm9ycyAobmV0d29yaywgc2VydmVyKVxuICAgICAgICAgICAgICAgIC8vIG11c3QgcHJvcGFnYXRlIHRvIHRoZSBxdWV1ZSBoYW5kbGVyIGZvciBhdXRvbWF0aWMgcmV0cnkuXG4gICAgICAgICAgICAgICAgbGV0IHdvcmtmbG93UmVzdWx0OiB1bmtub3duO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICB3b3JrZmxvd1Jlc3VsdCA9IGF3YWl0IHRyYWNlKFxuICAgICAgICAgICAgICAgICAgICAnd29ya2Zsb3cucmVwbGF5JyxcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIGFzeW5jIChyZXBsYXlTcGFuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVwbGF5U3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFdmVudHNDb3VudChldmVudHMubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcnVuV29ya2Zsb3coXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd0NvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bixcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY3J5cHRpb25LZXlcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgLy8gV29ya2Zsb3dTdXNwZW5zaW9uIGlzIG5vcm1hbCBjb250cm9sIGZsb3cg4oCUIG5vdCBhbiBlcnJvclxuICAgICAgICAgICAgICAgICAgaWYgKFdvcmtmbG93U3VzcGVuc2lvbi5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1c3BlbnNpb25NZXNzYWdlID0gYnVpbGRXb3JrZmxvd1N1c3BlbnNpb25NZXNzYWdlKFxuICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIGVyci5zdGVwQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgZXJyLmhvb2tDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICBlcnIud2FpdENvdW50XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdXNwZW5zaW9uTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZGVidWcoc3VzcGVuc2lvbk1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRWFjaCBldmVudCBjcmVhdGlvbiBpbnNpZGUgaGFuZGxlU3VzcGVuc2lvbiBjYXJyaWVzIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBsb2FkZWQgc25hcHNob3QncyBgc3RhdGVVcGRhdGVkQXRgOyBvbiBhIHN0YWxlICg0MTIpXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlamVjdGlvbiB0aGUgZ3VhcmQgcmVsb2FkcyB0aGlzIGxvZyBpbiBwbGFjZSBhbmQgcmV0cmllcy5cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VzcGVuc2lvbkxvZzogTXV0YWJsZUV2ZW50TG9nID0ge1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6IGV2ZW50c0N1cnNvciA/PyBudWxsLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBBd2FpdGVkPFJldHVyblR5cGU8dHlwZW9mIGhhbmRsZVN1c3BlbnNpb24+PjtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBhd2FpdCBoYW5kbGVTdXNwZW5zaW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1c3BlbnNpb246IGVycixcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuOiB3b3JrZmxvd1J1bixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudExvZzogc3VzcGVuc2lvbkxvZyxcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoc3VzcGVuc2lvbkVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGd1YXJkIGV4aGF1c3RlZCBpdHMgcmVsb2FkcyBvbiBhIHN0YWxlIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRpb24uIFNjaGVkdWxlIGFuIGV4cGxpY2l0IGltbWVkaWF0ZSByZS1pbnZvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgLy8gKGEgcmV0aHJvdyByZWxpZXMgb24gcXVldWUgcmVkZWxpdmVyeSkgc28gYSBmcmVzaFxuICAgICAgICAgICAgICAgICAgICAgIC8vIHJlcGxheSBvYnNlcnZlcyB0aGUgbmV3ZXIgZXZlbnQuXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFByZWNvbmRpdGlvbkZhaWxlZEVycm9yLmlzKHN1c3BlbnNpb25FcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ1N1c3BlbnNpb24gZXZlbnQgY3JlYXRpb24gZXhoYXVzdGVkIHByZWNvbmRpdGlvbiByZXRyaWVzOyByZS1pbnZva2luZyB3aXRoIGEgZnJlc2ggcmVwbGF5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdGltZW91dFNlY29uZHM6IDAgfTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgc3VzcGVuc2lvbkVycm9yO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC50aW1lb3V0U2Vjb25kcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdGltZW91dFNlY29uZHM6IHJlc3VsdC50aW1lb3V0U2Vjb25kcyB9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU3VzcGVuc2lvbiBoYW5kbGVkLCBubyBmdXJ0aGVyIHdvcmsgbmVlZGVkXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gVHJhbnNpZW50IGluZnJhc3RydWN0dXJlIGZhaWx1cmVzIHRhbGtpbmcgdG8gdGhlXG4gICAgICAgICAgICAgICAgICAvLyB3b3JsZCAod29ya2Zsb3ctc2VydmVyKSDigJQgYW4gZXhoYXVzdGVkIFJldHJ5QWdlbnRcbiAgICAgICAgICAgICAgICAgIC8vIChVTkRfRVJSX1JFUV9SRVRSWSBmcm9tIGEgc3VzdGFpbmVkIDQyOS81MDMgc3Rvcm0pLFxuICAgICAgICAgICAgICAgICAgLy8gYSBkcm9wcGVkIHNvY2tldCwgYSBjb25uZWN0L0ROUyBmYWlsdXJlLCBvciBhIGNsaWVudFxuICAgICAgICAgICAgICAgICAgLy8gdGltZW91dCDigJQgbXVzdCBOT1QgZmFpbCB0aGUgcnVuLiBSZXRocm93IHNvIHRoZSBxdWV1ZVxuICAgICAgICAgICAgICAgICAgLy8gcmVkZWxpdmVycyBhbmQgYSBmcmVzaCBpbnZvY2F0aW9uIHJldHJpZXMgdGhlIHJlcGxheVxuICAgICAgICAgICAgICAgICAgLy8gb25jZSB0aGUgYmFja2VuZCByZWNvdmVycy4gVGhlIEB2ZXJjZWwvcXVldWUgaGFuZGxlclxuICAgICAgICAgICAgICAgICAgLy8gYXBwbGllcyBhIGZhc3QgKDFz4oaSNjBzKSBiYWNrb2ZmIGJ5IGRlbGl2ZXJ5IGNvdW50LFxuICAgICAgICAgICAgICAgICAgLy8gYXZvaWRpbmcgdGhlIH41bWluIGRlZmF1bHQgdmlzaWJpbGl0eS10aW1lb3V0IHJlZHJpdmVcbiAgICAgICAgICAgICAgICAgIC8vIChhbmQgbmV2ZXIga2lsbGluZyB0aGUgcHJvY2VzcyB2aWEgcnVuX2ZhaWxlZCkuXG4gICAgICAgICAgICAgICAgICBpZiAoaXNSZXRyeWFibGVXb3JsZEVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICdUcmFuc2llbnQgd29ybGQgZXJyb3IgZHVyaW5nIHJlcGxheTsgcmVkZWxpdmVyaW5nIHZpYSBxdWV1ZSBpbnN0ZWFkIG9mIGZhaWxpbmcgdGhlIHJ1bicsXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JOYW1lOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5uYW1lIDogJ1Vua25vd25FcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGl2ZXJ5QXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgbGV0IHRlcm1pbmFsRXJyb3IgPSBlcnI7XG4gICAgICAgICAgICAgICAgICBpZiAoUmVwbGF5RGl2ZXJnZW5jZUVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGl2ZXJnZW5jZUNvdW50ID0gKHJlcGxheURpdmVyZ2VuY2U/LmNvdW50ID8/IDApICsgMTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGl2ZXJnZW5jZUNvdW50IDw9IFJFUExBWV9ESVZFUkdFTkNFX01BWF9SRVRSSUVTKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1dvcmtmbG93IHJlcGxheSBkaXZlcmdlZDsgcXVldWVpbmcgYSByZWNvdmVyeSByZXBsYXkgYmVmb3JlIGRlY2xhcmluZyB0aGUgZXZlbnQgbG9nIGNvcnJ1cHRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5SRVBMQVlfRElWRVJHRU5DRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGl2ZXJnZW5jZUV2ZW50SWQ6IGVyci5ldmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwcmlvckRpdmVyZ2VuY2VFdmVudElkOiByZXBsYXlEaXZlcmdlbmNlPy5ldmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkaXZlcmdlbmNlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGl2ZXJ5QXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4UmVjb3ZlcnlSZXBsYXlzOiBSRVBMQVlfRElWRVJHRU5DRV9NQVhfUkVUUklFUyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHF1ZXVlTWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0V29ya2Zsb3dRdWV1ZU5hbWUod29ya2Zsb3dOYW1lLCBuYW1lc3BhY2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhY2VDYXJyaWVyOiB0cmFjZUNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsYXlEaXZlcmdlbmNlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRJZDogZXJyLmV2ZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IGRpdmVyZ2VuY2VDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveW1lbnRJZDogd29ya2Zsb3dSdW4uZGVwbG95bWVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5zcGVjVmVyc2lvbiA/PyBTUEVDX1ZFUlNJT05fTEVHQUNZLFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGVybWluYWxFcnJvciA9IG5ldyBDb3JydXB0ZWRFdmVudExvZ0Vycm9yKFxuICAgICAgICAgICAgICAgICAgICAgIGBXb3JrZmxvdyByZXBsYXkgZGl2ZXJnZWQgJHtkaXZlcmdlbmNlQ291bnR9IHRpbWVzIGFmdGVyICR7UkVQTEFZX0RJVkVSR0VOQ0VfTUFYX1JFVFJJRVN9IHJlY292ZXJ5IHJlcGxheXM7IGxhdGVzdCBkaXZlcmdlbnQgZXZlbnQgd2FzICR7ZXJyLmV2ZW50SWR9LiBMYXN0IGRpdmVyZ2VuY2U6ICR7ZXJyLm1lc3NhZ2V9YCxcbiAgICAgICAgICAgICAgICAgICAgICB7IGNhdXNlOiBlcnIgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgdXNlciBjb2RlIGVycm9yIG9yIGEgdGVybWluYWxcbiAgICAgICAgICAgICAgICAgIC8vIFdvcmtmbG93UnVudGltZUVycm9yLiBGYWlsIHRoZSB3b3JrZmxvdyBydW4uXG5cbiAgICAgICAgICAgICAgICAgIC8vIFJlY29yZCBleGNlcHRpb24gZm9yIE9URUwgZXJyb3IgdHJhY2tpbmdcbiAgICAgICAgICAgICAgICAgIGlmICh0ZXJtaW5hbEVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgc3Bhbj8ucmVjb3JkRXhjZXB0aW9uPy4odGVybWluYWxFcnJvcik7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRFcnJvciA9XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG5vcm1hbGl6ZVVua25vd25FcnJvcih0ZXJtaW5hbEVycm9yKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTmFtZSA9XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRFcnJvci5uYW1lIHx8IGdldEVycm9yTmFtZSh0ZXJtaW5hbEVycm9yKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IG5vcm1hbGl6ZWRFcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgbGV0IGVycm9yU3RhY2sgPVxuICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkRXJyb3Iuc3RhY2sgfHwgZ2V0RXJyb3JTdGFjayh0ZXJtaW5hbEVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgLy8gUmVtYXAgZXJyb3Igc3RhY2sgdXNpbmcgc291cmNlIG1hcHMgdG8gc2hvdyBvcmlnaW5hbCBzb3VyY2UgbG9jYXRpb25zXG4gICAgICAgICAgICAgICAgICBpZiAoZXJyb3JTdGFjaykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWROYW1lID0gcGFyc2VXb3JrZmxvd05hbWUod29ya2Zsb3dOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZW5hbWUgPVxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZE5hbWU/Lm1vZHVsZVNwZWNpZmllciB8fCB3b3JrZmxvd05hbWU7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yU3RhY2sgPSByZW1hcEVycm9yU3RhY2soXG4gICAgICAgICAgICAgICAgICAgICAgZXJyb3JTdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd0NvZGVcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gQ2xhc3NpZnkgdGhlIGVycm9yOiBXb3JrZmxvd1J1bnRpbWVFcnJvciBpbmRpY2F0ZXNcbiAgICAgICAgICAgICAgICAgIC8vIGFuIFNESy9ydW50aW1lIGlzc3VlLCBhbmQgc2VsZWN0ZWQgc3ViY2xhc3NlcyB1c2VcbiAgICAgICAgICAgICAgICAgIC8vIG1vcmUgc3BlY2lmaWMgY29kZXMgZm9yIGJhY2tlbmQgdHJhY2tpbmcuXG4gICAgICAgICAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPSBjbGFzc2lmeVJ1bkVycm9yKHRlcm1pbmFsRXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBydW5uaW5nIHdvcmtmbG93Jywge1xuICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yU3RhY2ssXG4gICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgLy8gRmFpbCB0aGUgd29ya2Zsb3cgcnVuIHZpYSBldmVudCAoZXZlbnQtc291cmNlZCBhcmNoaXRlY3R1cmUpXG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnJvclN0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgeyByZXF1ZXN0SWQgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZmFpbEVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgRW50aXR5Q29uZmxpY3RFcnJvci5pcyhmYWlsRXJyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgIFJ1bkV4cGlyZWRFcnJvci5pcyhmYWlsRXJyKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgICAnVHJpZWQgZmFpbGluZyB3b3JrZmxvdyBydW4sIGJ1dCBydW4gaGFzIGFscmVhZHkgZmluaXNoZWQuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGZhaWxFcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JDb2RlKGVycm9yQ29kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvck5hbWUoZXJyb3JOYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yTWVzc2FnZShlcnJvck1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLkVycm9yVHlwZShlcnJvck5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZmFpbEVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIHJlY29yZGluZyB3b3JrZmxvdyBmYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsRXJyIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZmFpbEVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhmYWlsRXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBmYWlsRXJyO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuU3RhdHVzKCdmYWlsZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JDb2RlKGVycm9yQ29kZSksXG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yTmFtZShlcnJvck5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvck1lc3NhZ2UoZXJyb3JNZXNzYWdlKSxcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLkVycm9yVHlwZShlcnJvck5hbWUpLFxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gLS0tIEluZnJhc3RydWN0dXJlOiBjb21wbGV0ZSB0aGUgcnVuIC0tLVxuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgb3V0c2lkZSB0aGUgdXNlci1jb2RlIHRyeS9jYXRjaCBzbyB0aGF0IGZhaWx1cmVzXG4gICAgICAgICAgICAgICAgLy8gaGVyZSAoZS5nLiwgbmV0d29yayBlcnJvcnMpIHByb3BhZ2F0ZSB0byB0aGUgcXVldWUgaGFuZGxlci5cbiAgICAgICAgICAgICAgICAvLyBydW5fY29tcGxldGVkIGNhcnJpZXMgdGhlIGxvYWRlZCBzbmFwc2hvdCdzIGBzdGF0ZVVwZGF0ZWRBdGAsXG4gICAgICAgICAgICAgICAgLy8gYnV0IGlzIGludGVudGlvbmFsbHkgTk9UIHJldHJpZWQgaW4gcGxhY2UgKG5vXG4gICAgICAgICAgICAgICAgLy8gd2l0aFByZWNvbmRpdGlvblJldHJ5KSBvbiBhIHN0YWxlICg0MTIpIHJlamVjdGlvbjogYHJlc3VsdGBcbiAgICAgICAgICAgICAgICAvLyB3YXMgY29tcHV0ZWQgYnkgdGhpcyByZXBsYXksIHNvIGEgbmV3ZXIgb3V0LW9mLWJhbmQgZXZlbnRcbiAgICAgICAgICAgICAgICAvLyBsYW5kaW5nIGFmdGVyIHRoZSBzbmFwc2hvdCBtdXN0IGZvcmNlIGEgKmZyZXNoIHJlcGxheSpcbiAgICAgICAgICAgICAgICAvLyAod2hpY2ggbWF5IG9ic2VydmUgaXQgYW5kIHByb2R1Y2UgYSBkaWZmZXJlbnQgcmVzdWx0KSwgbm90XG4gICAgICAgICAgICAgICAgLy8gcmUtY29tbWl0IHRoZSBzdGFsZSByZXN1bHQuIE9uIDQxMiB0aGUgY2F0Y2ggYmVsb3cgc2NoZWR1bGVzXG4gICAgICAgICAgICAgICAgLy8gYW4gZXhwbGljaXQgaW1tZWRpYXRlIHJlLWludm9jYXRpb24gaW5zdGVhZC5cbiAgICAgICAgICAgICAgICAvLyAocnVuX2ZhaWxlZCBpcyBkZWxpYmVyYXRlbHkgbGVmdCB1bmd1YXJkZWQgYW5kIGZhaWxzIG9wZW46XG4gICAgICAgICAgICAgICAgLy8gYSBzcHVyaW91cyByZS1ydW4gaXMgc2FmZSwgYSBzcHVyaW91cyBjb21wbGV0aW9uIGlzIG5vdCwgYW5kXG4gICAgICAgICAgICAgICAgLy8gdGhlIGxvYWRlZCBldmVudCBsb2cgaXMgbm90IGluIHNjb3BlIG9uIHRoYXQgY2F0Y2ggcGF0aC4pXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAncnVuX2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiB3b3JrZmxvd1Jlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgICAgICAgIHN0YXRlVXBkYXRlZEF0OiBzdGF0ZVVwZGF0ZWRBdEZvckNyZWF0ZShldmVudHMpLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgaWYgKFByZWNvbmRpdGlvbkZhaWxlZEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICdydW5fY29tcGxldGVkIHJlamVjdGVkIGFzIHN0YWxlOyByZS1pbnZva2luZyB3aXRoIGEgZnJlc2ggcmVwbGF5JyxcbiAgICAgICAgICAgICAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdGltZW91dFNlY29uZHM6IDAgfTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmIChFbnRpdHlDb25mbGljdEVycm9yLmlzKGVycikgfHwgUnVuRXhwaXJlZEVycm9yLmlzKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICdUcmllZCBjb21wbGV0aW5nIHdvcmtmbG93IHJ1biwgYnV0IHJ1biBoYXMgYWxyZWFkeSBmaW5pc2hlZC4nLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5TdGF0dXMoJ2NvbXBsZXRlZCcpLFxuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXZlbnRzQ291bnQoZXZlbnRzLmxlbmd0aCksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7IC8vIEVuZCB0cmFjZVxuICAgICAgICAgIH1cbiAgICAgICAgKTsgLy8gRW5kIHdpdGhXb3JrZmxvd0JhZ2dhZ2VcbiAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICBpZiAocmVwbGF5VGltZW91dCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChyZXBsYXlUaW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgfSk7IC8vIEVuZCB3aXRoVHJhY2VDb250ZXh0XG4gICAgfVxuICApO1xuXG4gIHJldHVybiB3aXRoSGVhbHRoQ2hlY2soaGFuZGxlciwgd29ybGRTcGVjVmVyc2lvbik7XG59XG5cbi8vIHRoaXMgaXMgYSBuby1vcCBwbGFjZWhvbGRlciBhcyB0aGUgY2xpZW50IGlzXG4vLyBleHBlY3RpbmcgdGhpcyB0byBiZSBwcmVzZW50IGJ1dCB3ZSBhcmVuJ3QgYWN0dWFsbHkgdXNpbmcgaXRcbmV4cG9ydCBmdW5jdGlvbiBydW5TdGVwKCkge31cbiIsICJpbXBvcnQge1xuICBFUlJPUl9TTFVHUyxcbiAgUmVwbGF5RGl2ZXJnZW5jZUVycm9yLFxuICBXb3JrZmxvd05vdFJlZ2lzdGVyZWRFcnJvcixcbiAgV29ya2Zsb3dSdW50aW1lRXJyb3IsXG59IGZyb20gJ0B3b3JrZmxvdy9lcnJvcnMnO1xuaW1wb3J0IHsgY3JlYXRlV29ya2Zsb3dCYXNlVXJsLCB3aXRoUmVzb2x2ZXJzIH0gZnJvbSAnQHdvcmtmbG93L3V0aWxzJztcbmltcG9ydCB7IHBhcnNlV29ya2Zsb3dOYW1lIH0gZnJvbSAnQHdvcmtmbG93L3V0aWxzL3BhcnNlLW5hbWUnO1xuaW1wb3J0IHR5cGUgeyBFdmVudCwgV29ya2Zsb3dSdW4gfSBmcm9tICdAd29ya2Zsb3cvd29ybGQnO1xuaW1wb3J0ICogYXMgbmFub2lkIGZyb20gJ25hbm9pZCc7XG5pbXBvcnQgeyBtb25vdG9uaWNGYWN0b3J5IH0gZnJvbSAndWxpZCc7XG5pbXBvcnQgdHlwZSB7IENyeXB0b0tleSB9IGZyb20gJy4vZW5jcnlwdGlvbi5qcyc7XG5pbXBvcnQgeyBFdmVudENvbnN1bWVyUmVzdWx0LCBFdmVudHNDb25zdW1lciB9IGZyb20gJy4vZXZlbnRzLWNvbnN1bWVyLmpzJztcbmltcG9ydCB0eXBlIHsgUXVldWVJdGVtIH0gZnJvbSAnLi9nbG9iYWwuanMnO1xuaW1wb3J0IHsgRU5PVFNVUCwgV29ya2Zsb3dTdXNwZW5zaW9uIH0gZnJvbSAnLi9nbG9iYWwuanMnO1xuaW1wb3J0IHsgcnVudGltZUxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyLmpzJztcbmltcG9ydCB0eXBlIHsgV29ya2Zsb3dPcmNoZXN0cmF0b3JDb250ZXh0IH0gZnJvbSAnLi9wcml2YXRlLmpzJztcbmltcG9ydCB7IGdldFBvcnRMYXp5IH0gZnJvbSAnLi9ydW50aW1lL2dldC1wb3J0LWxhenkuanMnO1xuaW1wb3J0IHtcbiAgZGVoeWRyYXRlV29ya2Zsb3dSZXR1cm5WYWx1ZSxcbiAgaHlkcmF0ZVdvcmtmbG93QXJndW1lbnRzLFxufSBmcm9tICcuL3NlcmlhbGl6YXRpb24uanMnO1xuaW1wb3J0IHsgY3JlYXRlVXNlU3RlcCB9IGZyb20gJy4vc3RlcC5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0ZXBIeWRyYXRpb25DYWNoZSB9IGZyb20gJy4vc3RlcC1oeWRyYXRpb24tY2FjaGUuanMnO1xuaW1wb3J0IHtcbiAgQk9EWV9JTklUX1NZTUJPTCxcbiAgU1RBQkxFX1VMSUQsXG4gIFdPUktGTE9XX0NSRUFURV9IT09LLFxuICBXT1JLRkxPV19HRVRfU1RSRUFNX0lELFxuICBXT1JLRkxPV19TTEVFUCxcbiAgV09SS0ZMT1dfVVNFX1NURVAsXG59IGZyb20gJy4vc3ltYm9scy5qcyc7XG5pbXBvcnQgKiBhcyBBdHRyaWJ1dGUgZnJvbSAnLi90ZWxlbWV0cnkvc2VtYW50aWMtY29udmVudGlvbnMuanMnO1xuaW1wb3J0IHsgdHJhY2UgfSBmcm9tICcuL3RlbGVtZXRyeS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JrZmxvd1J1blN0cmVhbUlkIH0gZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IGNyZWF0ZUNvbnRleHQgfSBmcm9tICcuL3ZtL2luZGV4LmpzJztcbmltcG9ydCB7IHJ1bkNhY2hlZFdvcmtmbG93U2NyaXB0IH0gZnJvbSAnLi92bS9zY3JpcHQtY2FjaGUuanMnO1xuaW1wb3J0IHR5cGUgeyBXb3JrZmxvd01ldGFkYXRhIH0gZnJvbSAnLi93b3JrZmxvdy9nZXQtd29ya2Zsb3ctbWV0YWRhdGEuanMnO1xuaW1wb3J0IHsgV09SS0ZMT1dfQ09OVEVYVF9TWU1CT0wgfSBmcm9tICcuL3dvcmtmbG93L2dldC13b3JrZmxvdy1tZXRhZGF0YS5qcyc7XG5pbXBvcnQgeyBjcmVhdGVDcmVhdGVIb29rIH0gZnJvbSAnLi93b3JrZmxvdy9ob29rLmpzJztcbmltcG9ydCB7IGNyZWF0ZVNsZWVwIH0gZnJvbSAnLi93b3JrZmxvdy9zbGVlcC5qcyc7XG5cbi8qKlxuICogTG9ncyBhIHdhcm5pbmcgd2hlbiBhIHdvcmtmbG93IHJ1biBjb21wbGV0ZXMgb3IgZmFpbHMgd2l0aCB1bmNvbW1pdHRlZFxuICogb3BlcmF0aW9ucyBzdGlsbCBpbiB0aGUgaW52b2NhdGlvbnMgcXVldWUuIFRoaXMgdHlwaWNhbGx5IGluZGljYXRlcyB0aGVcbiAqIHVzZXIgZm9yZ290IHRvIGBhd2FpdGAgYSBzdGVwLCBob29rLCBvciBzbGVlcCBjYWxsLlxuICovXG5mdW5jdGlvbiB3YXJuUGVuZGluZ1F1ZXVlSXRlbXMoXG4gIHJ1bklkOiBzdHJpbmcsXG4gIHBlbmRpbmdRdWV1ZTogTWFwPHN0cmluZywgUXVldWVJdGVtPixcbiAgb3V0Y29tZTogJ2NvbXBsZXRlZCcgfCAnZmFpbGVkJ1xuKTogdm9pZCB7XG4gIC8vIEZpbHRlciBvdXQgaG9va3MgdGhhdCBhcmUgZWl0aGVyIGFscmVhZHkgY3JlYXRlZCAoYWxpdmUsIHdhaXRpbmcgZm9yIHBheWxvYWRzKVxuICAvLyBvciBleHBsaWNpdGx5IGRpc3Bvc2VkIOKAlCBib3RoIGFyZSBiZW5pZ24gc2luY2UgdGhlIGJhY2tlbmQgYXV0by1kaXNwb3Nlc1xuICAvLyBhbGwgaG9va3Mgd2hlbiBhIHJ1biByZWFjaGVzIGEgdGVybWluYWwgc3RhdGVcbiAgY29uc3QgaXRlbXMgPSBbLi4ucGVuZGluZ1F1ZXVlLnZhbHVlcygpXS5maWx0ZXIoXG4gICAgKGl0ZW0pID0+ICEoaXRlbS50eXBlID09PSAnaG9vaycgJiYgKGl0ZW0uaGFzQ3JlYXRlZEV2ZW50IHx8IGl0ZW0uZGlzcG9zZWQpKVxuICApO1xuICBpZiAoaXRlbXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgY29uc3QgZGV0YWlscyA9IGl0ZW1zLm1hcCgoaXRlbSkgPT4ge1xuICAgIHN3aXRjaCAoaXRlbS50eXBlKSB7XG4gICAgICBjYXNlICdzdGVwJzpcbiAgICAgICAgcmV0dXJuIGBzdGVwIFwiJHtpdGVtLnN0ZXBOYW1lfVwiYDtcbiAgICAgIGNhc2UgJ2hvb2snOlxuICAgICAgICByZXR1cm4gYGhvb2sgXCIke2l0ZW0udG9rZW59XCJgO1xuICAgICAgY2FzZSAnd2FpdCc6XG4gICAgICAgIHJldHVybiAnc2xlZXAnO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGB1bmtub3duICgkeyhpdGVtIGFzIHsgdHlwZTogc3RyaW5nIH0pLnR5cGV9KWA7XG4gICAgfVxuICB9KTtcblxuICBydW50aW1lTG9nZ2VyLndhcm4oXG4gICAgYFdvcmtmbG93IHJ1biAke291dGNvbWV9IHdpdGggJHtpdGVtcy5sZW5ndGh9IHVuY29tbWl0dGVkIG9wZXJhdGlvbihzKTogJHtkZXRhaWxzLmpvaW4oJywgJyl9LiBgICtcbiAgICAgICdEaWQgeW91IGZvcmdldCB0byBgYXdhaXRgIGEgc3RlcCwgaG9vaywgb3Igc2xlZXAgY2FsbD8nLFxuICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQgfVxuICApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuV29ya2Zsb3coXG4gIHdvcmtmbG93Q29kZTogc3RyaW5nLFxuICB3b3JrZmxvd1J1bjogV29ya2Zsb3dSdW4sXG4gIGV2ZW50czogRXZlbnRbXSxcbiAgZW5jcnlwdGlvbktleTogQ3J5cHRvS2V5IHwgdW5kZWZpbmVkLFxuICAvKipcbiAgICogT3B0aW9uYWwgcGVyLXJ1biBjYWNoZSBmb3IgaHlkcmF0ZWQgc3RlcCByZXR1cm4gdmFsdWVzLCBvd25lZCBieSB0aGUgaW5saW5lXG4gICAqIHJlcGxheSBsb29wIHNvIGl0IHN1cnZpdmVzIGFjcm9zcyB0aGUgbG9vcCdzIGl0ZXJhdGlvbnMgKGVhY2ggb2Ygd2hpY2hcbiAgICogY3JlYXRlcyBhIGZyZXNoIGNvbnRleHQpLiBNZW1vaXplcyB0aGUgZGVjcnlwdCArIGRldmFsdWUtcGFyc2Ugb2YgY29tcGxldGVkXG4gICAqIHN0ZXAgcmVzdWx0cyB0byB0dXJuIE8oTsKyKSByZXBsYXkgaHlkcmF0aW9uIGludG8gTyhOKS4gT21pdHRlZCBieSBjYWxsZXJzXG4gICAqIHRoYXQgcmVwbGF5IG9ubHkgb25jZSAodGhlbiB0aGVyZSBpcyBub3RoaW5nIHRvIHJldXNlKS5cbiAgICovXG4gIHN0ZXBIeWRyYXRpb25DYWNoZT86IFN0ZXBIeWRyYXRpb25DYWNoZVxuKTogUHJvbWlzZTxVaW50OEFycmF5IHwgdW5rbm93bj4ge1xuICByZXR1cm4gdHJhY2UoYHdvcmtmbG93LnJ1biAke3dvcmtmbG93UnVuLndvcmtmbG93TmFtZX1gLCBhc3luYyAoc3BhbikgPT4ge1xuICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93TmFtZSh3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpLFxuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuSWQod29ya2Zsb3dSdW4ucnVuSWQpLFxuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuU3RhdHVzKHdvcmtmbG93UnVuLnN0YXR1cyksXG4gICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFdmVudHNDb3VudChldmVudHMubGVuZ3RoKSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHN0YXJ0ZWRBdCA9IHdvcmtmbG93UnVuLnN0YXJ0ZWRBdDtcbiAgICBpZiAoIXN0YXJ0ZWRBdCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgV29ya2Zsb3cgcnVuIFwiJHt3b3JrZmxvd1J1bi5ydW5JZH1cIiBoYXMgbm8gXCJzdGFydGVkQXRcIiB0aW1lc3RhbXAgKHNob3VsZCBub3QgaGFwcGVuKWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBwb3J0IGJlZm9yZSBjcmVhdGluZyBWTSBjb250ZXh0IHRvIGF2b2lkIGFzeW5jIG9wZXJhdGlvbnNcbiAgICAvLyBhZmZlY3RpbmcgdGhlIGRldGVybWluaXN0aWMgdGltZXN0YW1wXG4gICAgY29uc3QgaXNWZXJjZWwgPSBwcm9jZXNzLmVudi5WRVJDRUxfVVJMICE9PSB1bmRlZmluZWQ7XG4gICAgLy8gTG9hZCBnZXRQb3J0IGxhemlseSB0byBwcmV2ZW50IFR1cmJvcGFjayBmcm9tIHRyYWNpbmcgZ2V0LXBvcnQnc1xuICAgIC8vIGZzIG9wcyAocmVhZGRpciwgcmVhZEZpbGUpIGludG8gdGhlIGZsb3cgcm91dGUgYnVuZGxlLiBUaGUgcmVzb2x2ZWRcbiAgICAvLyBwb3J0IGlzIGNhY2hlZCBwZXIgcHJvY2VzcyAoc2VlIGdldC1wb3J0LWxhenkudHMpLCBzbyB0aGlzIGlzIGNoZWFwXG4gICAgLy8gb24gcmVwbGF5cyBhZnRlciB0aGUgZmlyc3Qg4oCUIGBnZXRQb3J0KClgIG90aGVyd2lzZSByZS1ydW5zIE9TIHBvcnRcbiAgICAvLyBkaXNjb3ZlcnkgKHNwYXduaW5nIGBsc29mYCBvbiBtYWNPUywgfjYwbXMpIG9uIGV2ZXJ5IHJlcGxheS5cbiAgICBjb25zdCB3b3JrZmxvd0Jhc2VVcmwgPSBjcmVhdGVXb3JrZmxvd0Jhc2VVcmwoXG4gICAgICBpc1ZlcmNlbFxuICAgICAgICA/IGBodHRwczovLyR7cHJvY2Vzcy5lbnYuVkVSQ0VMX1VSTH1gXG4gICAgICAgIDogYGh0dHA6Ly9sb2NhbGhvc3Q6JHsoYXdhaXQgZ2V0UG9ydExhenkoKSkgPz8gMzAwMH1gXG4gICAgKTtcblxuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQsXG4gICAgICBnbG9iYWxUaGlzOiB2bUdsb2JhbFRoaXMsXG4gICAgICB1cGRhdGVUaW1lc3RhbXAsXG4gICAgfSA9IGNyZWF0ZUNvbnRleHQoe1xuICAgICAgc2VlZDogYCR7d29ya2Zsb3dSdW4ucnVuSWR9OiR7d29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lfTokeytzdGFydGVkQXR9YCxcbiAgICAgIGZpeGVkVGltZXN0YW1wOiArc3RhcnRlZEF0LFxuICAgIH0pO1xuXG4gICAgY29uc3Qgd29ya2Zsb3dEaXNjb250aW51YXRpb24gPSB3aXRoUmVzb2x2ZXJzPHZvaWQ+KCk7XG5cbiAgICBjb25zdCB1bGlkID0gbW9ub3RvbmljRmFjdG9yeSgoKSA9PiB2bUdsb2JhbFRoaXMuTWF0aC5yYW5kb20oKSk7XG4gICAgY29uc3QgZ2VuZXJhdGVOYW5vaWQgPSBuYW5vaWQuY3VzdG9tUmFuZG9tKG5hbm9pZC51cmxBbHBoYWJldCwgMjEsIChzaXplKSA9PlxuICAgICAgbmV3IFVpbnQ4QXJyYXkoc2l6ZSkubWFwKCgpID0+IDI1NiAqIHZtR2xvYmFsVGhpcy5NYXRoLnJhbmRvbSgpKVxuICAgICk7XG5cbiAgICAvLyBDcmVhdGUgYSBtdXRhYmxlIGhvbGRlciBmb3IgdGhlIHByb21pc2UgcXVldWUgc28gdGhlIEV2ZW50c0NvbnN1bWVyXG4gICAgLy8gY2FuIGFjY2VzcyB0aGUgY3VycmVudCBxdWV1ZSBzdGF0ZSB2aWEgYSBnZXR0ZXIuIFRoZSBxdWV1ZSBpcyBtdXRhdGVkXG4gICAgLy8gYnkgc3RlcC9ob29rL3NsZWVwIGNhbGxiYWNrcyBhcyBldmVudHMgYXJlIHByb2Nlc3NlZC5cbiAgICBjb25zdCBwcm9taXNlUXVldWVIb2xkZXIgPSB7IGN1cnJlbnQ6IFByb21pc2UucmVzb2x2ZSgpIH07XG5cbiAgICBjb25zdCBldmVudHNDb25zdW1lciA9IG5ldyBFdmVudHNDb25zdW1lcihldmVudHMsIHtcbiAgICAgIG9uQ29uc3VtZWRFdmVudDogKGV2ZW50KSA9PiB7XG4gICAgICAgIHVwZGF0ZVRpbWVzdGFtcCgrZXZlbnQuY3JlYXRlZEF0KTtcbiAgICAgIH0sXG4gICAgICBvblVuY29uc3VtZWRFdmVudDogKGV2ZW50KSA9PiB7XG4gICAgICAgIHdvcmtmbG93RGlzY29udGludWF0aW9uLnJlamVjdChcbiAgICAgICAgICBuZXcgUmVwbGF5RGl2ZXJnZW5jZUVycm9yKFxuICAgICAgICAgICAgYFJlcGxheSBjb3VsZCBub3QgY29uc3VtZSBldmVudDogZXZlbnRUeXBlPSR7ZXZlbnQuZXZlbnRUeXBlfSwgY29ycmVsYXRpb25JZD0ke2V2ZW50LmNvcnJlbGF0aW9uSWR9LCBldmVudElkPSR7ZXZlbnQuZXZlbnRJZH0uYCxcbiAgICAgICAgICAgIHsgZXZlbnRJZDogZXZlbnQuZXZlbnRJZCB9XG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIGdldFByb21pc2VRdWV1ZTogKCkgPT4gcHJvbWlzZVF1ZXVlSG9sZGVyLmN1cnJlbnQsXG4gICAgfSk7XG5cbiAgICBjb25zdCB3b3JrZmxvd0NvbnRleHQ6IFdvcmtmbG93T3JjaGVzdHJhdG9yQ29udGV4dCA9IHtcbiAgICAgIHJ1bklkOiB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgIGVuY3J5cHRpb25LZXksXG4gICAgICBnbG9iYWxUaGlzOiB2bUdsb2JhbFRoaXMsXG4gICAgICBvbldvcmtmbG93RXJyb3I6IHdvcmtmbG93RGlzY29udGludWF0aW9uLnJlamVjdCxcbiAgICAgIGV2ZW50c0NvbnN1bWVyLFxuICAgICAgZ2VuZXJhdGVVbGlkOiAoKSA9PiB1bGlkKCtzdGFydGVkQXQpLFxuICAgICAgZ2VuZXJhdGVOYW5vaWQsXG4gICAgICBpbnZvY2F0aW9uc1F1ZXVlOiBuZXcgTWFwKCksXG4gICAgICAvLyBVc2UgZ2V0dGVyL3NldHRlciBzbyB0aGUgRXZlbnRzQ29uc3VtZXIncyBnZXRQcm9taXNlUXVldWUoKSBhbHdheXNcbiAgICAgIC8vIHNlZXMgdGhlIGxhdGVzdCBxdWV1ZSBzdGF0ZSBhcyBpdCdzIG11dGF0ZWQgYnkgc3RlcC9ob29rL3NsZWVwIGNhbGxiYWNrcy5cbiAgICAgIGdldCBwcm9taXNlUXVldWUoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlUXVldWVIb2xkZXIuY3VycmVudDtcbiAgICAgIH0sXG4gICAgICBzZXQgcHJvbWlzZVF1ZXVlKHZhbHVlOiBQcm9taXNlPHZvaWQ+KSB7XG4gICAgICAgIHByb21pc2VRdWV1ZUhvbGRlci5jdXJyZW50ID0gdmFsdWU7XG4gICAgICB9LFxuICAgICAgcGVuZGluZ0RlbGl2ZXJpZXM6IDAsXG4gICAgICBwZW5kaW5nRGVsaXZlcnlCYXJyaWVyczogbmV3IE1hcCgpLFxuICAgICAgc3RlcEh5ZHJhdGlvbkNhY2hlLFxuICAgIH07XG5cbiAgICAvLyBDb25zdW1lIHJ1biBsaWZlY3ljbGUgZXZlbnRzIC0gdGhlc2UgYXJlIHN0cnVjdHVyYWwgZXZlbnRzIHRoYXQgZG9uJ3RcbiAgICAvLyBuZWVkIHNwZWNpYWwgaGFuZGxpbmcgaW4gdGhlIHdvcmtmbG93LCBidXQgbXVzdCBiZSBjb25zdW1lZCB0byBhZHZhbmNlXG4gICAgLy8gcGFzdCB0aGVtIGluIHRoZSBldmVudCBsb2dcbiAgICB3b3JrZmxvd0NvbnRleHQuZXZlbnRzQ29uc3VtZXIuc3Vic2NyaWJlKChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudCkge1xuICAgICAgICByZXR1cm4gRXZlbnRDb25zdW1lclJlc3VsdC5Ob3RDb25zdW1lZDtcbiAgICAgIH1cblxuICAgICAgLy8gQ29uc3VtZSBydW5fY3JlYXRlZCAtIGV2ZXJ5IHJ1biBoYXMgZXhhY3RseSBvbmVcbiAgICAgIGlmIChldmVudC5ldmVudFR5cGUgPT09ICdydW5fY3JlYXRlZCcpIHtcbiAgICAgICAgcmV0dXJuIEV2ZW50Q29uc3VtZXJSZXN1bHQuQ29uc3VtZWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnN1bWUgcnVuX3N0YXJ0ZWQgLSBldmVyeSBydW4gaGFzIGV4YWN0bHkgb25lXG4gICAgICBpZiAoZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX3N0YXJ0ZWQnKSB7XG4gICAgICAgIHJldHVybiBFdmVudENvbnN1bWVyUmVzdWx0LkNvbnN1bWVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gRXZlbnRDb25zdW1lclJlc3VsdC5Ob3RDb25zdW1lZDtcbiAgICB9KTtcblxuICAgIGNvbnN0IHVzZVN0ZXAgPSBjcmVhdGVVc2VTdGVwKHdvcmtmbG93Q29udGV4dCk7XG4gICAgY29uc3QgY3JlYXRlSG9vayA9IGNyZWF0ZUNyZWF0ZUhvb2sod29ya2Zsb3dDb250ZXh0KTtcbiAgICBjb25zdCBzbGVlcCA9IGNyZWF0ZVNsZWVwKHdvcmtmbG93Q29udGV4dCk7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfVVNFX1NURVBdID0gdXNlU3RlcDtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfQ1JFQVRFX0hPT0tdID0gY3JlYXRlSG9vaztcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfU0xFRVBdID0gc2xlZXA7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX0dFVF9TVFJFQU1fSURdID0gKG5hbWVzcGFjZT86IHN0cmluZykgPT5cbiAgICAgIGdldFdvcmtmbG93UnVuU3RyZWFtSWQod29ya2Zsb3dSdW4ucnVuSWQsIG5hbWVzcGFjZSk7XG5cbiAgICAvLyBGb3IgdGhlIHdvcmtmbG93IFZNLCB3ZSBzdG9yZSB0aGUgY29udGV4dCBpbiBhIHN5bWJvbCBvbiB0aGUgYGdsb2JhbFRoaXNgIG9iamVjdFxuICAgIGNvbnN0IGN0eDogV29ya2Zsb3dNZXRhZGF0YSA9IHtcbiAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lLFxuICAgICAgd29ya2Zsb3dSdW5JZDogd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICB3b3JrZmxvd1N0YXJ0ZWRBdDogbmV3IHZtR2xvYmFsVGhpcy5EYXRlKCtzdGFydGVkQXQpLFxuICAgICAgdXJsOiB3b3JrZmxvd0Jhc2VVcmwsXG4gICAgfTtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tXT1JLRkxPV19DT05URVhUX1NZTUJPTF0gPSBjdHg7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1NUQUJMRV9VTElEXSA9IHVsaWQ7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGhhdmUgYSBjb25maWcgb3ZlcnJpZGUgdG8gdXNlIHRoZSBjdXN0b20gZmV0Y2ggc3RlcC5cbiAgICAvLyAgICAgICBGb3Igbm93IGBmZXRjaGAgbXVzdCBiZSBleHBsaWNpdGx5IGltcG9ydGVkIGZyb20gYHdvcmtmbG93YC5cbiAgICB2bUdsb2JhbFRoaXMuZmV0Y2ggPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgdm1HbG9iYWxUaGlzLkVycm9yKFxuICAgICAgICBgR2xvYmFsIFwiZmV0Y2hcIiBpcyB1bmF2YWlsYWJsZSBpbiB3b3JrZmxvdyBmdW5jdGlvbnMuIFVzZSB0aGUgXCJmZXRjaFwiIHN0ZXAgZnVuY3Rpb24gZnJvbSBcIndvcmtmbG93XCIgdG8gbWFrZSBIVFRQIHJlcXVlc3RzLlxcblxcbkxlYXJuIG1vcmU6IGh0dHBzOi8vdXNld29ya2Zsb3cuZGV2L2Vyci8ke0VSUk9SX1NMVUdTLkZFVENIX0lOX1dPUktGTE9XX0ZVTkNUSU9OfWBcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIE92ZXJyaWRlIHRpbWVvdXQvaW50ZXJ2YWwgZnVuY3Rpb25zIHRvIHRocm93IGhlbHBmdWwgZXJyb3JzXG4gICAgLy8gVGhlc2UgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gd29ya2Zsb3cgZnVuY3Rpb25zIGJlY2F1c2UgdGhleSByZWx5IG9uXG4gICAgLy8gYXN5bmNocm9ub3VzIHNjaGVkdWxpbmcgd2hpY2ggYnJlYWtzIGRldGVybWluaXN0aWMgcmVwbGF5XG4gICAgY29uc3QgdGltZW91dEVycm9yTWVzc2FnZSA9XG4gICAgICAnVGltZW91dCBmdW5jdGlvbnMgbGlrZSBcInNldFRpbWVvdXRcIiBhbmQgXCJzZXRJbnRlcnZhbFwiIGFyZSBub3Qgc3VwcG9ydGVkIGluIHdvcmtmbG93IGZ1bmN0aW9ucy4gVXNlIHRoZSBcInNsZWVwXCIgZnVuY3Rpb24gZnJvbSBcIndvcmtmbG93XCIgZm9yIHRpbWUtYmFzZWQgZGVsYXlzLic7XG5cbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuc2V0VGltZW91dCA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuc2V0SW50ZXJ2YWwgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLmNsZWFyVGltZW91dCA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuY2xlYXJJbnRlcnZhbCA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuc2V0SW1tZWRpYXRlID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuVElNRU9VVF9GVU5DVElPTlNfSU5fV09SS0ZMT1csXG4gICAgICB9KTtcbiAgICB9O1xuICAgICh2bUdsb2JhbFRoaXMgYXMgYW55KS5jbGVhckltbWVkaWF0ZSA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIGBSZXF1ZXN0YCBhbmQgYFJlc3BvbnNlYCBhcmUgc3BlY2lhbCBidWlsdC1pbiBjbGFzc2VzIHRoYXQgaW52b2tlIHN0ZXBzXG4gICAgLy8gZm9yIHRoZSBganNvbigpYCwgYHRleHQoKWAgYW5kIGBhcnJheUJ1ZmZlcigpYCBpbnN0YW5jZSBtZXRob2RzXG4gICAgY2xhc3MgUmVxdWVzdCBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuUmVxdWVzdCB7XG4gICAgICBjYWNoZSE6IGdsb2JhbFRoaXMuUmVxdWVzdFsnY2FjaGUnXTtcbiAgICAgIGNyZWRlbnRpYWxzITogZ2xvYmFsVGhpcy5SZXF1ZXN0WydjcmVkZW50aWFscyddO1xuICAgICAgZGVzdGluYXRpb24hOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ2Rlc3RpbmF0aW9uJ107XG4gICAgICBoZWFkZXJzITogSGVhZGVycztcbiAgICAgIGludGVncml0eSE6IHN0cmluZztcbiAgICAgIG1ldGhvZCE6IHN0cmluZztcbiAgICAgIG1vZGUhOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ21vZGUnXTtcbiAgICAgIHJlZGlyZWN0ITogZ2xvYmFsVGhpcy5SZXF1ZXN0WydyZWRpcmVjdCddO1xuICAgICAgcmVmZXJyZXIhOiBzdHJpbmc7XG4gICAgICByZWZlcnJlclBvbGljeSE6IGdsb2JhbFRoaXMuUmVxdWVzdFsncmVmZXJyZXJQb2xpY3knXTtcbiAgICAgIHVybCE6IHN0cmluZztcbiAgICAgIGtlZXBhbGl2ZSE6IGJvb2xlYW47XG4gICAgICBzaWduYWwhOiBBYm9ydFNpZ25hbDtcbiAgICAgIGR1cGxleCE6ICdoYWxmJztcbiAgICAgIGJvZHkhOiBSZWFkYWJsZVN0cmVhbTxhbnk+IHwgbnVsbDtcblxuICAgICAgY29uc3RydWN0b3IoaW5wdXQ6IGFueSwgaW5pdD86IFJlcXVlc3RJbml0KSB7XG4gICAgICAgIC8vIEhhbmRsZSBVUkwgaW5wdXRcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgfHwgaW5wdXQgaW5zdGFuY2VvZiB2bUdsb2JhbFRoaXMuVVJMKSB7XG4gICAgICAgICAgY29uc3QgdXJsU3RyaW5nID0gU3RyaW5nKGlucHV0KTtcbiAgICAgICAgICAvLyBWYWxpZGF0ZSBVUkwgZm9ybWF0XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG5ldyB2bUdsb2JhbFRoaXMuVVJMKHVybFN0cmluZyk7XG4gICAgICAgICAgICB0aGlzLnVybCA9IHVybFN0cmluZztcbiAgICAgICAgICB9IGNhdGNoIChjYXVzZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRmFpbGVkIHRvIHBhcnNlIFVSTCBmcm9tICR7dXJsU3RyaW5nfWAsIHtcbiAgICAgICAgICAgICAgY2F1c2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSW5wdXQgaXMgYSBSZXF1ZXN0IG9iamVjdCAtIGNsb25lIGl0cyBwcm9wZXJ0aWVzXG4gICAgICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmw7XG4gICAgICAgICAgaWYgKCFpbml0KSB7XG4gICAgICAgICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZDtcbiAgICAgICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbnB1dC5oZWFkZXJzKTtcbiAgICAgICAgICAgIHRoaXMuYm9keSA9IGlucHV0LmJvZHk7XG4gICAgICAgICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlO1xuICAgICAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzO1xuICAgICAgICAgICAgdGhpcy5jYWNoZSA9IGlucHV0LmNhY2hlO1xuICAgICAgICAgICAgdGhpcy5yZWRpcmVjdCA9IGlucHV0LnJlZGlyZWN0O1xuICAgICAgICAgICAgdGhpcy5yZWZlcnJlciA9IGlucHV0LnJlZmVycmVyO1xuICAgICAgICAgICAgdGhpcy5yZWZlcnJlclBvbGljeSA9IGlucHV0LnJlZmVycmVyUG9saWN5O1xuICAgICAgICAgICAgdGhpcy5pbnRlZ3JpdHkgPSBpbnB1dC5pbnRlZ3JpdHk7XG4gICAgICAgICAgICB0aGlzLmtlZXBhbGl2ZSA9IGlucHV0LmtlZXBhbGl2ZTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFsID0gaW5wdXQuc2lnbmFsO1xuICAgICAgICAgICAgdGhpcy5kdXBsZXggPSBpbnB1dC5kdXBsZXg7XG4gICAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gaW5wdXQuZGVzdGluYXRpb247XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElmIGluaXQgaXMgcHJvdmlkZWQsIG1lcmdlOiB1c2Ugc291cmNlIHByb3BlcnRpZXMsIHRoZW4gb3ZlcnJpZGUgd2l0aCBpbml0XG4gICAgICAgICAgLy8gQ29weSBhbGwgcHJvcGVydGllcyBmcm9tIHRoZSBzb3VyY2UgUmVxdWVzdCBmaXJzdFxuICAgICAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kO1xuICAgICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbnB1dC5oZWFkZXJzKTtcbiAgICAgICAgICB0aGlzLmJvZHkgPSBpbnB1dC5ib2R5O1xuICAgICAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGU7XG4gICAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzO1xuICAgICAgICAgIHRoaXMuY2FjaGUgPSBpbnB1dC5jYWNoZTtcbiAgICAgICAgICB0aGlzLnJlZGlyZWN0ID0gaW5wdXQucmVkaXJlY3Q7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlciA9IGlucHV0LnJlZmVycmVyO1xuICAgICAgICAgIHRoaXMucmVmZXJyZXJQb2xpY3kgPSBpbnB1dC5yZWZlcnJlclBvbGljeTtcbiAgICAgICAgICB0aGlzLmludGVncml0eSA9IGlucHV0LmludGVncml0eTtcbiAgICAgICAgICB0aGlzLmtlZXBhbGl2ZSA9IGlucHV0LmtlZXBhbGl2ZTtcbiAgICAgICAgICB0aGlzLnNpZ25hbCA9IGlucHV0LnNpZ25hbDtcbiAgICAgICAgICB0aGlzLmR1cGxleCA9IGlucHV0LmR1cGxleDtcbiAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gaW5wdXQuZGVzdGluYXRpb247XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPdmVycmlkZSB3aXRoIGluaXQgb3B0aW9ucyBpZiBwcm92aWRlZFxuICAgICAgICAvLyBTZXQgbWV0aG9kXG4gICAgICAgIGlmIChpbml0Py5tZXRob2QpIHtcbiAgICAgICAgICB0aGlzLm1ldGhvZCA9IGluaXQubWV0aG9kLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMubWV0aG9kICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIEZhbGxiYWNrIHRvIGRlZmF1bHQgZm9yIHN0cmluZyBpbnB1dCBjYXNlXG4gICAgICAgICAgdGhpcy5tZXRob2QgPSAnR0VUJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBoZWFkZXJzXG4gICAgICAgIGlmIChpbml0Py5oZWFkZXJzKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKGluaXQuaGVhZGVycyk7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgIGlucHV0IGluc3RhbmNlb2Ygdm1HbG9iYWxUaGlzLlVSTFxuICAgICAgICApIHtcbiAgICAgICAgICAvLyBGb3Igc3RyaW5nL1VSTCBpbnB1dCwgY3JlYXRlIGVtcHR5IGhlYWRlcnNcbiAgICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBvdGhlciBwcm9wZXJ0aWVzIHdpdGggaW5pdCB2YWx1ZXMgb3IgZGVmYXVsdHNcbiAgICAgICAgaWYgKGluaXQ/Lm1vZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMubW9kZSA9IGluaXQubW9kZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5tb2RlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMubW9kZSA9ICdjb3JzJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5jcmVkZW50aWFscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGluaXQuY3JlZGVudGlhbHM7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuY3JlZGVudGlhbHMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9ICdzYW1lLW9yaWdpbic7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBgYW55YCBjYXN0IGhlcmUgYmVjYXVzZSBAdHlwZXMvbm9kZSB2MjIgZG9lcyBub3QgeWV0IGhhdmUgYGNhY2hlYFxuICAgICAgICBpZiAoKGluaXQgYXMgYW55KT8uY2FjaGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuY2FjaGUgPSAoaW5pdCBhcyBhbnkpLmNhY2hlO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNhY2hlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuY2FjaGUgPSAnZGVmYXVsdCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8ucmVkaXJlY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMucmVkaXJlY3QgPSBpbml0LnJlZGlyZWN0O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnJlZGlyZWN0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMucmVkaXJlY3QgPSAnZm9sbG93JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5yZWZlcnJlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlciA9IGluaXQucmVmZXJyZXI7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucmVmZXJyZXIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlciA9ICdhYm91dDpjbGllbnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LnJlZmVycmVyUG9saWN5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLnJlZmVycmVyUG9saWN5ID0gaW5pdC5yZWZlcnJlclBvbGljeTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZWZlcnJlclBvbGljeSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLnJlZmVycmVyUG9saWN5ID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8uaW50ZWdyaXR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLmludGVncml0eSA9IGluaXQuaW50ZWdyaXR5O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmludGVncml0eSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmludGVncml0eSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LmtlZXBhbGl2ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5rZWVwYWxpdmUgPSBpbml0LmtlZXBhbGl2ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5rZWVwYWxpdmUgIT09ICdib29sZWFuJykge1xuICAgICAgICAgIHRoaXMua2VlcGFsaXZlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8uc2lnbmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gQWJvcnRTaWduYWwgc3R1YlxuICAgICAgICAgIHRoaXMuc2lnbmFsID0gaW5pdC5zaWduYWw7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc2lnbmFsKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEFib3J0U2lnbmFsIHN0dWJcbiAgICAgICAgICB0aGlzLnNpZ25hbCA9IHsgYWJvcnRlZDogZmFsc2UgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5kdXBsZXgpIHtcbiAgICAgICAgICB0aGlzLmR1cGxleCA9ICdoYWxmJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5kZXN0aW5hdGlvbikge1xuICAgICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSAnZG9jdW1lbnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYm9keSA9IGluaXQ/LmJvZHk7XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCBHRVQvSEVBRCBtZXRob2RzIGRvbid0IGhhdmUgYSBib2R5XG4gICAgICAgIGlmIChcbiAgICAgICAgICBib2R5ICE9PSBudWxsICYmXG4gICAgICAgICAgYm9keSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBSZXF1ZXN0IHdpdGggR0VUL0hFQUQgbWV0aG9kIGNhbm5vdCBoYXZlIGJvZHkuYCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdG9yZSB0aGUgb3JpZ2luYWwgQm9keUluaXQgZm9yIHNlcmlhbGl6YXRpb25cbiAgICAgICAgaWYgKGJvZHkgIT09IG51bGwgJiYgYm9keSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQ3JlYXRlIGEgXCJmYWtlXCIgUmVhZGFibGVTdHJlYW0gdGhhdCBzdG9yZXMgdGhlIG9yaWdpbmFsIGJvZHlcbiAgICAgICAgICAvLyBUaGlzIGF2b2lkcyBkb2luZyBhc3luYyB3b3JrIGR1cmluZyB3b3JrZmxvdyByZXBsYXlcbiAgICAgICAgICB0aGlzLmJvZHkgPSBPYmplY3QuY3JlYXRlKHZtR2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbS5wcm90b3R5cGUsIHtcbiAgICAgICAgICAgIFtCT0RZX0lOSVRfU1lNQk9MXToge1xuICAgICAgICAgICAgICB2YWx1ZTogYm9keSxcbiAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmJvZHkgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNsb25lKCk6IFJlcXVlc3Qge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGdldCBib2R5VXNlZCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBpbXBsZW1lbnQgdGhlc2VcbiAgICAgIGJsb2IhOiAoKSA9PiBQcm9taXNlPEJsb2I+O1xuICAgICAgZm9ybURhdGEhOiAoKSA9PiBQcm9taXNlPEZvcm1EYXRhPjtcblxuICAgICAgYXJyYXlCdWZmZXIhOiAoKSA9PiBQcm9taXNlPEFycmF5QnVmZmVyPjtcbiAgICAgIGpzb24hOiAoKSA9PiBQcm9taXNlPGFueT47XG4gICAgICB0ZXh0ITogKCkgPT4gUHJvbWlzZTxzdHJpbmc+O1xuXG4gICAgICBhc3luYyBieXRlcygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGF3YWl0IHRoaXMuYXJyYXlCdWZmZXIoKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHZtR2xvYmFsVGhpcy5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFJlcXVlc3QucHJvdG90eXBlLCB7XG4gICAgICBhcnJheUJ1ZmZlcjoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgQXJyYXlCdWZmZXI+KCdfX2J1aWx0aW5fcmVzcG9uc2VfYXJyYXlfYnVmZmVyJyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgICAganNvbjoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgYW55PignX19idWlsdGluX3Jlc3BvbnNlX2pzb24nKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICB0ZXh0OiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBzdHJpbmc+KCdfX2J1aWx0aW5fcmVzcG9uc2VfdGV4dCcpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNsYXNzIFJlc3BvbnNlIGltcGxlbWVudHMgZ2xvYmFsVGhpcy5SZXNwb25zZSB7XG4gICAgICB0eXBlITogZ2xvYmFsVGhpcy5SZXNwb25zZVsndHlwZSddO1xuICAgICAgdXJsITogc3RyaW5nO1xuICAgICAgc3RhdHVzITogbnVtYmVyO1xuICAgICAgc3RhdHVzVGV4dCE6IHN0cmluZztcbiAgICAgIGJvZHkhOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PiB8IG51bGw7XG4gICAgICBoZWFkZXJzITogSGVhZGVycztcbiAgICAgIHJlZGlyZWN0ZWQhOiBib29sZWFuO1xuXG4gICAgICBjb25zdHJ1Y3Rvcihib2R5PzogYW55LCBpbml0PzogUmVzcG9uc2VJbml0KSB7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gaW5pdD8uc3RhdHVzID8/IDIwMDtcbiAgICAgICAgdGhpcy5zdGF0dXNUZXh0ID0gaW5pdD8uc3RhdHVzVGV4dCA/PyAnJztcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKGluaXQ/LmhlYWRlcnMpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCc7XG4gICAgICAgIHRoaXMudXJsID0gJyc7XG4gICAgICAgIHRoaXMucmVkaXJlY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgbnVsbC1ib2R5IHN0YXR1cyBjb2RlcyBkb24ndCBoYXZlIGEgYm9keVxuICAgICAgICAvLyBQZXIgSFRUUCBzcGVjOiAyMDQgKE5vIENvbnRlbnQpLCAyMDUgKFJlc2V0IENvbnRlbnQpLCBhbmQgMzA0IChOb3QgTW9kaWZpZWQpXG4gICAgICAgIGlmIChcbiAgICAgICAgICBib2R5ICE9PSBudWxsICYmXG4gICAgICAgICAgYm9keSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgKHRoaXMuc3RhdHVzID09PSAyMDQgfHwgdGhpcy5zdGF0dXMgPT09IDIwNSB8fCB0aGlzLnN0YXR1cyA9PT0gMzA0KVxuICAgICAgICApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgYFJlc3BvbnNlIGNvbnN0cnVjdG9yOiBJbnZhbGlkIHJlc3BvbnNlIHN0YXR1cyBjb2RlICR7dGhpcy5zdGF0dXN9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdG9yZSB0aGUgb3JpZ2luYWwgQm9keUluaXQgZm9yIHNlcmlhbGl6YXRpb25cbiAgICAgICAgaWYgKGJvZHkgIT09IG51bGwgJiYgYm9keSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQ3JlYXRlIGEgXCJmYWtlXCIgUmVhZGFibGVTdHJlYW0gdGhhdCBzdG9yZXMgdGhlIG9yaWdpbmFsIGJvZHlcbiAgICAgICAgICAvLyBUaGlzIGF2b2lkcyBkb2luZyBhc3luYyB3b3JrIGR1cmluZyB3b3JrZmxvdyByZXBsYXlcbiAgICAgICAgICB0aGlzLmJvZHkgPSBPYmplY3QuY3JlYXRlKHZtR2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbS5wcm90b3R5cGUsIHtcbiAgICAgICAgICAgIFtCT0RZX0lOSVRfU1lNQk9MXToge1xuICAgICAgICAgICAgICB2YWx1ZTogYm9keSxcbiAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmJvZHkgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IGltcGxlbWVudCB0aGVzZVxuICAgICAgY2xvbmUhOiAoKSA9PiBSZXNwb25zZTtcbiAgICAgIGJsb2IhOiAoKSA9PiBQcm9taXNlPGdsb2JhbFRoaXMuQmxvYj47XG4gICAgICBmb3JtRGF0YSE6ICgpID0+IFByb21pc2U8Z2xvYmFsVGhpcy5Gb3JtRGF0YT47XG5cbiAgICAgIGdldCBvaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMDtcbiAgICAgIH1cblxuICAgICAgZ2V0IGJvZHlVc2VkKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGFycmF5QnVmZmVyITogKCkgPT4gUHJvbWlzZTxBcnJheUJ1ZmZlcj47XG4gICAgICBqc29uITogKCkgPT4gUHJvbWlzZTxhbnk+O1xuICAgICAgdGV4dCE6ICgpID0+IFByb21pc2U8c3RyaW5nPjtcblxuICAgICAgYXN5bmMgYnl0ZXMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCB0aGlzLmFycmF5QnVmZmVyKCkpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMganNvbihkYXRhOiBhbnksIGluaXQ/OiBSZXNwb25zZUluaXQpOiBSZXNwb25zZSB7XG4gICAgICAgIGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbml0Py5oZWFkZXJzKTtcbiAgICAgICAgaWYgKCFoZWFkZXJzLmhhcygnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgICBoZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHsgLi4uaW5pdCwgaGVhZGVycyB9KTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGVycm9yKCk6IFJlc3BvbnNlIHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgcmVkaXJlY3QodXJsOiBzdHJpbmcgfCBVUkwsIHN0YXR1czogbnVtYmVyID0gMzAyKTogUmVzcG9uc2Uge1xuICAgICAgICAvLyBWYWxpZGF0ZSBzdGF0dXMgY29kZSAtIG9ubHkgc3BlY2lmaWMgcmVkaXJlY3QgY29kZXMgYXJlIGFsbG93ZWRcbiAgICAgICAgaWYgKCFbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdLmluY2x1ZGVzKHN0YXR1cykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcbiAgICAgICAgICAgIGBJbnZhbGlkIHJlZGlyZWN0IHN0YXR1cyBjb2RlOiAke3N0YXR1c30uIE11c3QgYmUgb25lIG9mOiAzMDEsIDMwMiwgMzAzLCAzMDcsIDMwOGBcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIHJlc3BvbnNlIHdpdGggTG9jYXRpb24gaGVhZGVyXG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoKTtcbiAgICAgICAgaGVhZGVycy5zZXQoJ0xvY2F0aW9uJywgU3RyaW5nKHVybCkpO1xuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gT2JqZWN0LmNyZWF0ZShSZXNwb25zZS5wcm90b3R5cGUpO1xuICAgICAgICByZXNwb25zZS5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHJlc3BvbnNlLnN0YXR1c1RleHQgPSAnJztcbiAgICAgICAgcmVzcG9uc2UuaGVhZGVycyA9IGhlYWRlcnM7XG4gICAgICAgIHJlc3BvbnNlLmJvZHkgPSBudWxsO1xuICAgICAgICByZXNwb25zZS50eXBlID0gJ2RlZmF1bHQnO1xuICAgICAgICByZXNwb25zZS51cmwgPSAnJztcbiAgICAgICAgcmVzcG9uc2UucmVkaXJlY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdm1HbG9iYWxUaGlzLlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhSZXNwb25zZS5wcm90b3R5cGUsIHtcbiAgICAgIGFycmF5QnVmZmVyOiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBBcnJheUJ1ZmZlcj4oJ19fYnVpbHRpbl9yZXNwb25zZV9hcnJheV9idWZmZXInKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBqc29uOiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBhbnk+KCdfX2J1aWx0aW5fcmVzcG9uc2VfanNvbicpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHRleHQ6IHtcbiAgICAgICAgdmFsdWU6IHVzZVN0ZXA8W10sIHN0cmluZz4oJ19fYnVpbHRpbl9yZXNwb25zZV90ZXh0JyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY2xhc3MgUmVhZGFibGVTdHJlYW08VD4gaW1wbGVtZW50cyBnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtPFQ+IHtcbiAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGdldCBsb2NrZWQoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgY2FuY2VsKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgZ2V0UmVhZGVyKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgcGlwZVRocm91Z2goKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBwaXBlVG8oKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICB0ZWUoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZXMoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgZnJvbSgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW0gPSBSZWFkYWJsZVN0cmVhbTtcblxuICAgIGNsYXNzIFdyaXRhYmxlU3RyZWFtPFQ+IGltcGxlbWVudHMgZ2xvYmFsVGhpcy5Xcml0YWJsZVN0cmVhbTxUPiB7XG4gICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXQgbG9ja2VkKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGFib3J0KCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgY2xvc2UoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXRXcml0ZXIoKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW0gPSBXcml0YWJsZVN0cmVhbTtcblxuICAgIGNsYXNzIFRyYW5zZm9ybVN0cmVhbTxJLCBPPiBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuVHJhbnNmb3JtU3RyZWFtPEksIE8+IHtcbiAgICAgIHJlYWRhYmxlOiBnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtPE8+O1xuICAgICAgd3JpdGFibGU6IGdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW08ST47XG5cbiAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHZtR2xvYmFsVGhpcy5UcmFuc2Zvcm1TdHJlYW0gPSBUcmFuc2Zvcm1TdHJlYW07XG5cbiAgICAvLyBFdmVudHVhbGx5IHdlJ2xsIHByb2JhYmx5IHdhbnQgdG8gcHJvdmlkZSBvdXIgb3duIGBjb25zb2xlYCBvYmplY3QsXG4gICAgLy8gYnV0IGZvciBub3cgd2UnbGwganVzdCBleHBvc2UgdGhlIGdsb2JhbCBvbmUuXG4gICAgdm1HbG9iYWxUaGlzLmNvbnNvbGUgPSBnbG9iYWxUaGlzLmNvbnNvbGU7XG5cbiAgICAvLyBIQUNLOiBwcm9wYWdhdGUgc3ltYm9sIG5lZWRlZCBmb3IgQUkgZ2F0ZXdheSB1c2FnZVxuICAgIGNvbnN0IFNZTUJPTF9GT1JfUkVRX0NPTlRFWFQgPSBTeW1ib2wuZm9yKCdAdmVyY2VsL3JlcXVlc3QtY29udGV4dCcpO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tTWU1CT0xfRk9SX1JFUV9DT05URVhUXSA9IChnbG9iYWxUaGlzIGFzIGFueSlbXG4gICAgICBTWU1CT0xfRk9SX1JFUV9DT05URVhUXG4gICAgXTtcblxuICAgIC8vIEdldCBhIHJlZmVyZW5jZSB0byB0aGUgdXNlci1kZWZpbmVkIHdvcmtmbG93IGZ1bmN0aW9uLlxuICAgIC8vIFRoZSBmaWxlbmFtZSBwYXJhbWV0ZXIgZW5zdXJlcyBzdGFjayB0cmFjZXMgc2hvdyBhIG1lYW5pbmdmdWwgbmFtZVxuICAgIC8vIChlLmcuLCBcImV4YW1wbGUvd29ya2Zsb3dzLzk5X2UyZS50c1wiKSBpbnN0ZWFkIG9mIFwiZXZhbG1hY2hpbmUuPGFub255bW91cz5cIi5cbiAgICBjb25zdCBwYXJzZWROYW1lID0gcGFyc2VXb3JrZmxvd05hbWUod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKTtcbiAgICBjb25zdCBmaWxlbmFtZSA9IHBhcnNlZE5hbWU/Lm1vZHVsZVNwZWNpZmllciB8fCB3b3JrZmxvd1J1bi53b3JrZmxvd05hbWU7XG5cbiAgICAvLyBFdmFsdWF0ZSB0aGUgd29ya2Zsb3cgYnVuZGxlIGFnYWluc3QgdGhlIGZyZXNoIGNvbnRleHQgdXNpbmcgYVxuICAgIC8vIHByb2Nlc3Mtd2lkZSBjYWNoZSBvZiB0aGUgY29tcGlsZWQgYHZtLlNjcmlwdGAuIFRoZSBidW5kbGUgaXMgdGhlIHNhbWVcbiAgICAvLyBzdHJpbmcgZm9yIGV2ZXJ5IHJlcGxheSBhbmQgZXZlcnkgaW52b2NhdGlvbiBpbiB0aGlzIHByb2Nlc3MsIGFuZFxuICAgIC8vIGNvbXBpbGF0aW9uIGlzIGEgcHVyZSBmdW5jdGlvbiBvZiBgKGNvZGUsIGZpbGVuYW1lKWAsIHNvIHJldXNpbmcgdGhlXG4gICAgLy8gY29tcGlsZWQgU2NyaXB0IGFjcm9zcyByZXBsYXlzIGlzIGRldGVybWluaXNtLXNhZmU6IGl0IHByb2R1Y2VzIHRoZSBzYW1lXG4gICAgLy8gd29ya2Zsb3cgZnVuY3Rpb24gYW5kIHRoZSBzYW1lIGBmaWxlbmFtZWAgc291cmNlIGF0dHJpYnV0aW9uIGFzXG4gICAgLy8gcmUtcGFyc2luZyB0aGUgYnVuZGxlIGV2ZXJ5IHRpbWUsIGJ1dCBza2lwcyB0aGUgKGV4cGVuc2l2ZSkgcmUtcGFyc2UuXG4gICAgLy8gRXZhbHVhdGluZyB0aGUgYnVuZGxlIHJlZ2lzdGVycyBldmVyeSB3b3JrZmxvdyBvblxuICAgIC8vIGBnbG9iYWxUaGlzLl9fcHJpdmF0ZV93b3JrZmxvd3NgOyB0aGUgdHJhaWxpbmcgbG9va3VwIGV4cHJlc3Npb24gdGhlblxuICAgIC8vIHJldHJpZXZlcyB0aGUgcmVxdWVzdGVkIHdvcmtmbG93IGZ1bmN0aW9uLiBUaGUgbG9va3VwIGlzIGV2YWx1YXRlZCBhcyBhXG4gICAgLy8gc2VwYXJhdGUgY2FjaGVkIFNjcmlwdCB1bmRlciB0aGUgc2FtZSBgZmlsZW5hbWVgLCBzbyBlcnJvciBzdGFjayBmcmFtZXNcbiAgICAvLyBzdGlsbCBhdHRyaWJ1dGUgdG8gdGhlIHdvcmtmbG93J3Mgc291cmNlIGZpbGUgKGByZW1hcEVycm9yU3RhY2tgIGtleXMgb25cbiAgICAvLyBgZmlsZW5hbWVgKS4gVGhlIG9uZSBiZWhhdmlvdXJhbCBkaWZmZXJlbmNlIGZyb20gdGhlIHByZXZpb3VzXG4gICAgLy8gc2luZ2xlLWNvbWJpbmVkLXN0cmluZyBhcHByb2FjaCBpcyB0aGUgKmxpbmUgbnVtYmVyKiBvZiBhbiBlcnJvciB0aHJvd25cbiAgICAvLyBieSB0aGUgbG9va3VwIGV4cHJlc3Npb24gaXRzZWxmOiBpdCBub3cgcmVwb3J0cyBsaW5lIDEgb2YgdGhlIGxvb2t1cFxuICAgIC8vIFNjcmlwdCByYXRoZXIgdGhhbiB0aGUgbGluZSBqdXN0IHBhc3QgdGhlIGVuZCBvZiB0aGUgYnVuZGxlLiBUaGF0IHBhdGhcbiAgICAvLyBpcyByYXJlIChpdCByZXF1aXJlcyB0aGUgbG9va3VwIGA/LmdldCguLi4pYCBleHByZXNzaW9uIHRvIHRocm93KSBhbmRcbiAgICAvLyBkb2VzIG5vdCBhZmZlY3QgdGhlIHdvcmtmbG93IGZ1bmN0aW9uIG9yIHJlcGxheSBkZXRlcm1pbmlzbS5cbiAgICBydW5DYWNoZWRXb3JrZmxvd1NjcmlwdCh3b3JrZmxvd0NvZGUsIGZpbGVuYW1lLCBjb250ZXh0KTtcbiAgICBjb25zdCB3b3JrZmxvd0ZuID0gcnVuQ2FjaGVkV29ya2Zsb3dTY3JpcHQoXG4gICAgICBgZ2xvYmFsVGhpcy5fX3ByaXZhdGVfd29ya2Zsb3dzPy5nZXQoJHtKU09OLnN0cmluZ2lmeSh3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpfSlgLFxuICAgICAgZmlsZW5hbWUsXG4gICAgICBjb250ZXh0XG4gICAgKTtcblxuICAgIGlmICh0eXBlb2Ygd29ya2Zsb3dGbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93Tm90UmVnaXN0ZXJlZEVycm9yKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSk7XG4gICAgfVxuXG4gICAgLy8gQ2hhaW4gd29ya2Zsb3cgYXJndW1lbnQgaHlkcmF0aW9uIG9udG8gdGhlIHByb21pc2VRdWV1ZSBzbyB0aGF0IHRoZVxuICAgIC8vIHVuY29uc3VtZWQgZXZlbnQgY2hlY2sgKHdoaWNoIHdhaXRzIGZvciB0aGUgcXVldWUgdG8gZHJhaW4pIGRvZXNuJ3RcbiAgICAvLyBmaXJlIGR1cmluZyB0aGUgYXN5bmMgZ2FwIGJldHdlZW4gcnVuX3N0YXJ0ZWQgY29uc3VtcHRpb24gYW5kIHRoZVxuICAgIC8vIHdvcmtmbG93IGZ1bmN0aW9uIHN1YnNjcmliaW5nIGl0cyBmaXJzdCBzdGVwIGNhbGxiYWNrcy5cbiAgICBsZXQgYXJnczogdW5rbm93bltdID0gW107XG4gICAgd29ya2Zsb3dDb250ZXh0LnByb21pc2VRdWV1ZSA9IHdvcmtmbG93Q29udGV4dC5wcm9taXNlUXVldWUudGhlbihcbiAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXJncyA9IGF3YWl0IGh5ZHJhdGVXb3JrZmxvd0FyZ3VtZW50cyhcbiAgICAgICAgICB3b3JrZmxvd1J1bi5pbnB1dCxcbiAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgICBlbmNyeXB0aW9uS2V5LFxuICAgICAgICAgIHZtR2xvYmFsVGhpc1xuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gICAgYXdhaXQgd29ya2Zsb3dDb250ZXh0LnByb21pc2VRdWV1ZTtcblxuICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93QXJndW1lbnRzQ291bnQoYXJncy5sZW5ndGgpLFxuICAgIH0pO1xuXG4gICAgLy8gSW52b2tlIHVzZXIgd29ya2Zsb3dcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUHJvbWlzZS5yYWNlKFtcbiAgICAgICAgd29ya2Zsb3dGbiguLi5hcmdzKSxcbiAgICAgICAgd29ya2Zsb3dEaXNjb250aW51YXRpb24ucHJvbWlzZSxcbiAgICAgIF0pO1xuXG4gICAgICBjb25zdCBkZWh5ZHJhdGVkID0gYXdhaXQgZGVoeWRyYXRlV29ya2Zsb3dSZXR1cm5WYWx1ZShcbiAgICAgICAgcmVzdWx0LFxuICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgZW5jcnlwdGlvbktleSxcbiAgICAgICAgdm1HbG9iYWxUaGlzXG4gICAgICApO1xuXG4gICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UmVzdWx0VHlwZSh0eXBlb2YgcmVzdWx0KSxcbiAgICAgIH0pO1xuXG4gICAgICB3YXJuUGVuZGluZ1F1ZXVlSXRlbXMoXG4gICAgICAgIHdvcmtmbG93UnVuLnJ1bklkLFxuICAgICAgICB3b3JrZmxvd0NvbnRleHQuaW52b2NhdGlvbnNRdWV1ZSxcbiAgICAgICAgJ2NvbXBsZXRlZCdcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkZWh5ZHJhdGVkO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gQ29udHJvbC1mbG93IHNpZ25hbHMgYXJlIGhhbmRsZWQgYnkgdGhlIHJ1bnRpbWUgYW5kIGRvIG5vdCBtZWFuIHRoZVxuICAgICAgLy8gd29ya2Zsb3cgaGFzIHRlcm1pbmFsbHkgZmFpbGVkLlxuICAgICAgaWYgKFdvcmtmbG93U3VzcGVuc2lvbi5pcyhlcnIpIHx8IFJlcGxheURpdmVyZ2VuY2VFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cblxuICAgICAgd2FyblBlbmRpbmdRdWV1ZUl0ZW1zKFxuICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgd29ya2Zsb3dDb250ZXh0Lmludm9jYXRpb25zUXVldWUsXG4gICAgICAgICdmYWlsZWQnXG4gICAgICApO1xuXG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9KTtcbn1cbiIsICJpbXBvcnQge1xuICBFUlJPUl9TTFVHUyxcbiAgSG9va05vdEZvdW5kRXJyb3IsXG4gIFdvcmtmbG93UnVudGltZUVycm9yLFxufSBmcm9tICdAd29ya2Zsb3cvZXJyb3JzJztcbmltcG9ydCB7XG4gIHR5cGUgSG9vayxcbiAgaXNMZWdhY3lTcGVjVmVyc2lvbixcbiAgU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gIFNQRUNfVkVSU0lPTl9MRUdBQ1ksXG4gIHR5cGUgV29ya2Zsb3dJbnZva2VQYXlsb2FkLFxuICB0eXBlIFdvcmtmbG93UnVuLFxufSBmcm9tICdAd29ya2Zsb3cvd29ybGQnO1xuaW1wb3J0IHsgZ2V0UnVuQ2FwYWJpbGl0aWVzIH0gZnJvbSAnLi4vY2FwYWJpbGl0aWVzLmpzJztcbmltcG9ydCB7IHR5cGUgQ3J5cHRvS2V5LCBpbXBvcnRLZXkgfSBmcm9tICcuLi9lbmNyeXB0aW9uLmpzJztcbmltcG9ydCB7IHJ1bnRpbWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIuanMnO1xuaW1wb3J0IHtcbiAgZGVoeWRyYXRlU3RlcFJldHVyblZhbHVlLFxuICBoeWRyYXRlU3RlcEFyZ3VtZW50cyxcbiAgU2VyaWFsaXphdGlvbkZvcm1hdCxcbn0gZnJvbSAnLi4vc2VyaWFsaXphdGlvbi5qcyc7XG5pbXBvcnQgeyBXRUJIT09LX1JFU1BPTlNFX1dSSVRBQkxFIH0gZnJvbSAnLi4vc3ltYm9scy5qcyc7XG5pbXBvcnQgKiBhcyBBdHRyaWJ1dGUgZnJvbSAnLi4vdGVsZW1ldHJ5L3NlbWFudGljLWNvbnZlbnRpb25zLmpzJztcbmltcG9ydCB7IGdldFNwYW5Db250ZXh0Rm9yVHJhY2VDYXJyaWVyLCB0cmFjZSB9IGZyb20gJy4uL3RlbGVtZXRyeS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JrZmxvd1F1ZXVlTmFtZSB9IGZyb20gJy4vaGVscGVycy5qcyc7XG5pbXBvcnQgeyBzYWZlV2FpdFVudGlsLCB3YWl0ZWRVbnRpbCB9IGZyb20gJy4vd2FpdC11bnRpbC5qcyc7XG5pbXBvcnQgeyBnZXRXb3JsZCB9IGZyb20gJy4vd29ybGQuanMnO1xuXG5hc3luYyBmdW5jdGlvbiBtYXRlcmlhbGl6ZVJlc3BvbnNlQm9keShyZXNwb25zZTogUmVzcG9uc2UpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGlmICghcmVzcG9uc2UuYm9keSkge1xuICAgIHJldHVybiByZXNwb25zZTtcbiAgfVxuXG4gIGNvbnN0IGJvZHkgPSBhd2FpdCByZXNwb25zZS5hcnJheUJ1ZmZlcigpO1xuICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHtcbiAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgIGhlYWRlcnM6IHJlc3BvbnNlLmhlYWRlcnMsXG4gIH0pO1xufVxuXG4vKipcbiAqIEludGVybmFsIGhlbHBlciB0aGF0IHJldHVybnMgdGhlIGhvb2ssIHRoZSBhc3NvY2lhdGVkIHdvcmtmbG93IHJ1bixcbiAqIGFuZCB0aGUgcmVzb2x2ZWQgZW5jcnlwdGlvbiBrZXkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEhvb2tCeVRva2VuV2l0aEtleSh0b2tlbjogc3RyaW5nKTogUHJvbWlzZTx7XG4gIGhvb2s6IEhvb2s7XG4gIHJ1bjogV29ya2Zsb3dSdW47XG4gIGVuY3J5cHRpb25LZXk6IENyeXB0b0tleSB8IHVuZGVmaW5lZDtcbn0+IHtcbiAgY29uc3Qgd29ybGQgPSBnZXRXb3JsZCgpO1xuICBjb25zdCBob29rID0gYXdhaXQgd29ybGQuaG9va3MuZ2V0QnlUb2tlbih0b2tlbik7XG4gIGNvbnN0IHJ1biA9IGF3YWl0IHdvcmxkLnJ1bnMuZ2V0KGhvb2sucnVuSWQpO1xuICBjb25zdCByYXdLZXkgPSBhd2FpdCB3b3JsZC5nZXRFbmNyeXB0aW9uS2V5Rm9yUnVuPy4ocnVuKTtcbiAgY29uc3QgZW5jcnlwdGlvbktleSA9IHJhd0tleSA/IGF3YWl0IGltcG9ydEtleShyYXdLZXkpIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIGhvb2subWV0YWRhdGEgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaG9vay5tZXRhZGF0YSA9IGF3YWl0IGh5ZHJhdGVTdGVwQXJndW1lbnRzKFxuICAgICAgaG9vay5tZXRhZGF0YSBhcyBhbnksXG4gICAgICBob29rLnJ1bklkLFxuICAgICAgZW5jcnlwdGlvbktleVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHsgaG9vaywgcnVuLCBlbmNyeXB0aW9uS2V5IH07XG59XG5cbi8qKlxuICogR2V0IHRoZSBob29rIGJ5IHRva2VuIHRvIGZpbmQgdGhlIGFzc29jaWF0ZWQgd29ya2Zsb3cgcnVuLFxuICogYW5kIGh5ZHJhdGUgdGhlIGBtZXRhZGF0YWAgcHJvcGVydHkgaWYgaXQgd2FzIHNldCBmcm9tIHdpdGhpblxuICogdGhlIHdvcmtmbG93IHJ1bi5cbiAqXG4gKiBAcGFyYW0gdG9rZW4gLSBUaGUgdW5pcXVlIHRva2VuIGlkZW50aWZ5aW5nIHRoZSBob29rXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRIb29rQnlUb2tlbih0b2tlbjogc3RyaW5nKTogUHJvbWlzZTxIb29rPiB7XG4gIGNvbnN0IHsgaG9vayB9ID0gYXdhaXQgZ2V0SG9va0J5VG9rZW5XaXRoS2V5KHRva2VuKTtcbiAgcmV0dXJuIGhvb2s7XG59XG5cbi8qKlxuICogUmVzdW1lcyBhIHdvcmtmbG93IHJ1biBieSBzZW5kaW5nIGEgcGF5bG9hZCB0byBhIGhvb2sgaWRlbnRpZmllZCBieSBpdHMgdG9rZW4uXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgZXh0ZXJuYWxseSAoZS5nLiwgZnJvbSBhbiBBUEkgcm91dGUgb3Igc2VydmVyIGFjdGlvbilcbiAqIHRvIHNlbmQgZGF0YSB0byBhIGhvb2sgYW5kIHJlc3VtZSB0aGUgYXNzb2NpYXRlZCB3b3JrZmxvdyBydW4uXG4gKlxuICogQHBhcmFtIHRva2VuT3JIb29rIC0gVGhlIHVuaXF1ZSB0b2tlbiBpZGVudGlmeWluZyB0aGUgaG9vaywgb3IgdGhlIGhvb2sgb2JqZWN0IGl0c2VsZlxuICogQHBhcmFtIHBheWxvYWQgLSBUaGUgZGF0YSBwYXlsb2FkIHRvIHNlbmQgdG8gdGhlIGhvb2tcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHRoZSBob29rXG4gKiBAdGhyb3dzIEVycm9yIGlmIHRoZSBob29rIGlzIG5vdCBmb3VuZCBvciBpZiB0aGVyZSdzIGFuIGVycm9yIGR1cmluZyB0aGUgcHJvY2Vzc1xuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIC8vIEluIGFuIEFQSSByb3V0ZVxuICogaW1wb3J0IHsgcmVzdW1lSG9vayB9IGZyb20gJ0B3b3JrZmxvdy9jb3JlL3J1bnRpbWUnO1xuICpcbiAqIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IFJlcXVlc3QpIHtcbiAqICAgY29uc3QgeyB0b2tlbiwgZGF0YSB9ID0gYXdhaXQgcmVxdWVzdC5qc29uKCk7XG4gKlxuICogICB0cnkge1xuICogICAgIGNvbnN0IGhvb2sgPSBhd2FpdCByZXN1bWVIb29rKHRva2VuLCBkYXRhKTtcbiAqICAgICByZXR1cm4gUmVzcG9uc2UuanNvbih7IHJ1bklkOiBob29rLnJ1bklkIH0pO1xuICogICB9IGNhdGNoIChlcnJvcikge1xuICogICAgIHJldHVybiBuZXcgUmVzcG9uc2UoJ0hvb2sgbm90IGZvdW5kJywgeyBzdGF0dXM6IDQwNCB9KTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXN1bWVIb29rPFQgPSBhbnk+KFxuICB0b2tlbk9ySG9vazogc3RyaW5nIHwgSG9vayxcbiAgcGF5bG9hZDogVCxcbiAgZW5jcnlwdGlvbktleU92ZXJyaWRlPzogQ3J5cHRvS2V5XG4pOiBQcm9taXNlPEhvb2s+IHtcbiAgcmV0dXJuIGF3YWl0IHdhaXRlZFVudGlsKCgpID0+IHtcbiAgICByZXR1cm4gdHJhY2UoJ2hvb2sucmVzdW1lJywgYXN5bmMgKHNwYW4pID0+IHtcbiAgICAgIGNvbnN0IHdvcmxkID0gZ2V0V29ybGQoKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IGhvb2s6IEhvb2s7XG4gICAgICAgIGxldCB3b3JrZmxvd1J1bjogV29ya2Zsb3dSdW47XG4gICAgICAgIGxldCBlbmNyeXB0aW9uS2V5OiBDcnlwdG9LZXkgfCB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW5Pckhvb2sgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZ2V0SG9va0J5VG9rZW5XaXRoS2V5KHRva2VuT3JIb29rKTtcbiAgICAgICAgICBob29rID0gcmVzdWx0Lmhvb2s7XG4gICAgICAgICAgd29ya2Zsb3dSdW4gPSByZXN1bHQucnVuO1xuICAgICAgICAgIGVuY3J5cHRpb25LZXkgPSBlbmNyeXB0aW9uS2V5T3ZlcnJpZGUgPz8gcmVzdWx0LmVuY3J5cHRpb25LZXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaG9vayA9IHRva2VuT3JIb29rO1xuICAgICAgICAgIHdvcmtmbG93UnVuID0gYXdhaXQgd29ybGQucnVucy5nZXQoaG9vay5ydW5JZCk7XG4gICAgICAgICAgaWYgKGVuY3J5cHRpb25LZXlPdmVycmlkZSkge1xuICAgICAgICAgICAgZW5jcnlwdGlvbktleSA9IGVuY3J5cHRpb25LZXlPdmVycmlkZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcmF3S2V5ID0gYXdhaXQgd29ybGQuZ2V0RW5jcnlwdGlvbktleUZvclJ1bj8uKHdvcmtmbG93UnVuKTtcbiAgICAgICAgICAgIGVuY3J5cHRpb25LZXkgPSByYXdLZXkgPyBhd2FpdCBpbXBvcnRLZXkocmF3S2V5KSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuSG9va1Rva2VuKGhvb2sudG9rZW4pLFxuICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Ib29rSWQoaG9vay5ob29rSWQpLFxuICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1bklkKGhvb2sucnVuSWQpLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDaGVjayB0aGUgdGFyZ2V0IHJ1bidzIGNhcGFiaWxpdGllcyB0byBlbnN1cmUgd2UgZW5jb2RlIHRoZVxuICAgICAgICAvLyBwYXlsb2FkIGluIGEgZm9ybWF0IHRoZSBydW4ncyBkZXBsb3ltZW50IGNhbiBkZWNvZGUuIEZvciBleGFtcGxlLFxuICAgICAgICAvLyBydW5zIGNyZWF0ZWQgYmVmb3JlIGVuY3J5cHRpb24gc3VwcG9ydCB3YXMgYWRkZWQgY2Fubm90IGRlY29kZVxuICAgICAgICAvLyB0aGUgJ2VuY3InIHNlcmlhbGl6YXRpb24gZm9ybWF0LCBhbmQgcnVucyBjcmVhdGVkIGJlZm9yZVxuICAgICAgICAvLyBieXRlLXN0cmVhbSBmcmFtaW5nIHN1cHBvcnQgY2Fubm90IGRlY29kZSBmcmFtZWQgYnl0ZSBzdHJlYW1zLlxuICAgICAgICBjb25zdCByYXdWZXJzaW9uID0gd29ya2Zsb3dSdW4uZXhlY3V0aW9uQ29udGV4dD8ud29ya2Zsb3dDb3JlVmVyc2lvbjtcbiAgICAgICAgY29uc3QgY2FwYWJpbGl0aWVzID0gZ2V0UnVuQ2FwYWJpbGl0aWVzKFxuICAgICAgICAgIHR5cGVvZiByYXdWZXJzaW9uID09PSAnc3RyaW5nJyA/IHJhd1ZlcnNpb24gOiB1bmRlZmluZWRcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKCFjYXBhYmlsaXRpZXMuc3VwcG9ydGVkRm9ybWF0cy5oYXMoU2VyaWFsaXphdGlvbkZvcm1hdC5FTkNSWVBURUQpKSB7XG4gICAgICAgICAgZW5jcnlwdGlvbktleSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlaHlkcmF0ZSB0aGUgcGF5bG9hZCBmb3Igc3RvcmFnZVxuICAgICAgICBjb25zdCBvcHM6IFByb21pc2U8YW55PltdID0gW107XG4gICAgICAgIGNvbnN0IHYxQ29tcGF0ID0gaXNMZWdhY3lTcGVjVmVyc2lvbihob29rLnNwZWNWZXJzaW9uKTtcbiAgICAgICAgY29uc3QgZGVoeWRyYXRlZFBheWxvYWQgPSBhd2FpdCBkZWh5ZHJhdGVTdGVwUmV0dXJuVmFsdWUoXG4gICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICBob29rLnJ1bklkLFxuICAgICAgICAgIGVuY3J5cHRpb25LZXksXG4gICAgICAgICAgb3BzLFxuICAgICAgICAgIGdsb2JhbFRoaXMsXG4gICAgICAgICAgdjFDb21wYXQsXG4gICAgICAgICAgY2FwYWJpbGl0aWVzLmZyYW1lZEJ5dGVTdHJlYW1zXG4gICAgICAgICk7XG4gICAgICAgIC8vIFRoZXNlIHBheWxvYWQtc3RyZWFtIG9wcyBhcmUgZmx1c2hlZCBpbiB0aGUgYmFja2dyb3VuZDsgdGhlXG4gICAgICAgIC8vIHByb21pc2UgaGFuZGVkIHRvIHdhaXRVbnRpbCBtdXN0IG5ldmVyIHJlamVjdCAoYW4gdW5jb25zdW1lZFxuICAgICAgICAvLyB3YWl0VW50aWwgcmVqZWN0aW9uIGNyYXNoZXMgdGhlIHByb2Nlc3MgYXMgdW5oYW5kbGVkUmVqZWN0aW9uKSxcbiAgICAgICAgLy8gc28gdW5leHBlY3RlZCBmYWlsdXJlcyBhcmUgbG9nZ2VkIGluc3RlYWQuXG4gICAgICAgIC8vIE5PVEU6IHJlamVjdGlvbnMgd2l0aCBgdW5kZWZpbmVkYCBhcmUgYW4gZXhwZWN0ZWQgYXJ0aWZhY3Qgb2YgdGhlXG4gICAgICAgIC8vIHdlYmhvb2sgYnVuZGxlIGFuZCBhcmUgaWdub3JlZCBlbnRpcmVseS5cbiAgICAgICAgc2FmZVdhaXRVbnRpbChQcm9taXNlLmFsbChvcHMpLCAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVyciA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgcnVudGltZUxvZ2dlci53YXJuKCdCYWNrZ3JvdW5kIGZsdXNoIG9mIGhvb2sgcGF5bG9hZCBvcHMgZmFpbGVkJywge1xuICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogaG9vay5ydW5JZCxcbiAgICAgICAgICAgIGhvb2tJZDogaG9vay5ob29rSWQsXG4gICAgICAgICAgICBlcnJvcjogZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDcmVhdGUgYSBob29rX3JlY2VpdmVkIGV2ZW50IHdpdGggdGhlIHBheWxvYWRcbiAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICBob29rLnJ1bklkLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGV2ZW50VHlwZTogJ2hvb2tfcmVjZWl2ZWQnLFxuICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgY29ycmVsYXRpb25JZDogaG9vay5ob29rSWQsXG4gICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgLi4uKHYxQ29tcGF0ID8ge30gOiB7IHRva2VuOiBob29rLnRva2VuIH0pLFxuICAgICAgICAgICAgICBwYXlsb2FkOiBkZWh5ZHJhdGVkUGF5bG9hZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7IHYxQ29tcGF0IH1cbiAgICAgICAgKTtcblxuICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dOYW1lKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHRyYWNlQ2FycmllciA9IHdvcmtmbG93UnVuLmV4ZWN1dGlvbkNvbnRleHQ/LnRyYWNlQ2FycmllcjtcblxuICAgICAgICBpZiAodHJhY2VDYXJyaWVyKSB7XG4gICAgICAgICAgY29uc3QgY29udGV4dCA9IGF3YWl0IGdldFNwYW5Db250ZXh0Rm9yVHJhY2VDYXJyaWVyKHRyYWNlQ2Fycmllcik7XG4gICAgICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgICAgIHNwYW4/LmFkZExpbms/Lih7IGNvbnRleHQgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmUtdHJpZ2dlciB0aGUgd29ya2Zsb3cgYWdhaW5zdCB0aGUgZGVwbG95bWVudCBJRCBhc3NvY2lhdGVkXG4gICAgICAgIC8vIHdpdGggdGhlIHdvcmtmbG93IHJ1biB0aGF0IHRoZSBob29rIGJlbG9uZ3MgdG9cbiAgICAgICAgYXdhaXQgd29ybGQucXVldWUoXG4gICAgICAgICAgZ2V0V29ya2Zsb3dRdWV1ZU5hbWUod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBydW5JZDogaG9vay5ydW5JZCxcbiAgICAgICAgICAgIC8vIGF0dGFjaCB0aGUgdHJhY2UgY2FycmllciBmcm9tIHRoZSB3b3JrZmxvdyBydW5cbiAgICAgICAgICAgIHRyYWNlQ2FycmllcjpcbiAgICAgICAgICAgICAgd29ya2Zsb3dSdW4uZXhlY3V0aW9uQ29udGV4dD8udHJhY2VDYXJyaWVyID8/IHVuZGVmaW5lZCxcbiAgICAgICAgICB9IHNhdGlzZmllcyBXb3JrZmxvd0ludm9rZVBheWxvYWQsXG4gICAgICAgICAge1xuICAgICAgICAgICAgZGVwbG95bWVudElkOiB3b3JrZmxvd1J1bi5kZXBsb3ltZW50SWQsXG4gICAgICAgICAgICBzcGVjVmVyc2lvbjogd29ya2Zsb3dSdW4uc3BlY1ZlcnNpb24gPz8gU1BFQ19WRVJTSU9OX0xFR0FDWSxcbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIGhvb2s7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgLi4uQXR0cmlidXRlLkhvb2tUb2tlbihcbiAgICAgICAgICAgIHR5cGVvZiB0b2tlbk9ySG9vayA9PT0gJ3N0cmluZycgPyB0b2tlbk9ySG9vayA6IHRva2VuT3JIb29rLnRva2VuXG4gICAgICAgICAgKSxcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuSG9va0ZvdW5kKGZhbHNlKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmVzdW1lcyBhIHdlYmhvb2sgYnkgc2VuZGluZyBhIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvUmVxdWVzdCB8IFJlcXVlc3R9XG4gKiBvYmplY3QgdG8gYSBob29rIGlkZW50aWZpZWQgYnkgaXRzIHRva2VuLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGV4dGVybmFsbHkgKGUuZy4sIGZyb20gYW4gQVBJIHJvdXRlIG9yIHNlcnZlciBhY3Rpb24pXG4gKiB0byBzZW5kIGEgcmVxdWVzdCB0byBhIHdlYmhvb2sgYW5kIHJlc3VtZSB0aGUgYXNzb2NpYXRlZCB3b3JrZmxvdyBydW4uXG4gKlxuICogQHBhcmFtIHRva2VuIC0gVGhlIHVuaXF1ZSB0b2tlbiBpZGVudGlmeWluZyB0aGUgaG9va1xuICogQHBhcmFtIHJlcXVlc3QgLSBUaGUgcmVxdWVzdCB0byBzZW5kIHRvIHRoZSBob29rXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byB0aGUgcmVzcG9uc2VcbiAqIEB0aHJvd3MgRXJyb3IgaWYgdGhlIGhvb2sgaXMgbm90IGZvdW5kIG9yIGlmIHRoZXJlJ3MgYW4gZXJyb3IgZHVyaW5nIHRoZSBwcm9jZXNzXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBgYGB0c1xuICogLy8gSW4gYW4gQVBJIHJvdXRlXG4gKiBpbXBvcnQgeyByZXN1bWVXZWJob29rIH0gZnJvbSAnQHdvcmtmbG93L2NvcmUvcnVudGltZSc7XG4gKlxuICogZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogUmVxdWVzdCkge1xuICogICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlcXVlc3QudXJsKTtcbiAqICAgY29uc3QgdG9rZW4gPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgndG9rZW4nKTtcbiAqXG4gKiAgIGlmICghdG9rZW4pIHtcbiAqICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdNaXNzaW5nIHRva2VuJywgeyBzdGF0dXM6IDQwMCB9KTtcbiAqICAgfVxuICpcbiAqICAgdHJ5IHtcbiAqICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlc3VtZVdlYmhvb2sodG9rZW4sIHJlcXVlc3QpO1xuICogICAgIHJldHVybiByZXNwb25zZTtcbiAqICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdXZWJob29rIG5vdCBmb3VuZCcsIHsgc3RhdHVzOiA0MDQgfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdW1lV2ViaG9vayhcbiAgdG9rZW46IHN0cmluZyxcbiAgcmVxdWVzdDogUmVxdWVzdFxuKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICBjb25zdCB7IGhvb2ssIGVuY3J5cHRpb25LZXkgfSA9IGF3YWl0IGdldEhvb2tCeVRva2VuV2l0aEtleSh0b2tlbik7XG5cbiAgLy8gT25seSB3ZWJob29rcyBjYW4gYmUgcmVzdW1lZCB2aWEgdGhlIHB1YmxpYyBlbmRwb2ludC5cbiAgLy8gSWYgdGhlIGhvb2sgd2FzIGNyZWF0ZWQgdmlhIGNyZWF0ZUhvb2soKSAoaXNXZWJob29rICE9PSB0cnVlKSxcbiAgLy8gdGhyb3cgdGhlIHNhbWUgXCJub3QgZm91bmRcIiBlcnJvciB0aGUgd29ybGQgd291bGQgdGhyb3cgZm9yIGEgbWlzc2luZ1xuICAvLyB0b2tlbi4gVGhpcyBwcmV2ZW50cyBsZWFraW5nIHRoYXQgdGhlIHRva2VuIGlzIHZhbGlkLlxuICBpZiAoaG9vay5pc1dlYmhvb2sgPT09IGZhbHNlKSB7XG4gICAgdGhyb3cgbmV3IEhvb2tOb3RGb3VuZEVycm9yKHRva2VuKTtcbiAgfVxuXG4gIGxldCByZXNwb25zZTogUmVzcG9uc2UgfCB1bmRlZmluZWQ7XG4gIGxldCByZXNwb25zZVJlYWRhYmxlOiBSZWFkYWJsZVN0cmVhbTxSZXNwb25zZT4gfCB1bmRlZmluZWQ7XG4gIGlmIChcbiAgICBob29rLm1ldGFkYXRhICYmXG4gICAgdHlwZW9mIGhvb2subWV0YWRhdGEgPT09ICdvYmplY3QnICYmXG4gICAgJ3Jlc3BvbmRXaXRoJyBpbiBob29rLm1ldGFkYXRhXG4gICkge1xuICAgIGlmIChob29rLm1ldGFkYXRhLnJlc3BvbmRXaXRoID09PSAnbWFudWFsJykge1xuICAgICAgY29uc3QgeyByZWFkYWJsZSwgd3JpdGFibGUgfSA9IG5ldyBUcmFuc2Zvcm1TdHJlYW08UmVzcG9uc2UsIFJlc3BvbnNlPigpO1xuICAgICAgcmVzcG9uc2VSZWFkYWJsZSA9IHJlYWRhYmxlO1xuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBpbnN0YW5jZSBpbmNsdWRlcyB0aGUgd3JpdGFibGUgc3RyZWFtIHdoaWNoIHdpbGwgYmUgdXNlZFxuICAgICAgLy8gdG8gd3JpdGUgdGhlIHJlc3BvbnNlIHRvIHRoZSBjbGllbnQgZnJvbSB3aXRoaW4gdGhlIHdvcmtmbG93IHJ1blxuICAgICAgKHJlcXVlc3QgYXMgYW55KVtXRUJIT09LX1JFU1BPTlNFX1dSSVRBQkxFXSA9IHdyaXRhYmxlO1xuICAgIH0gZWxzZSBpZiAoaG9vay5tZXRhZGF0YS5yZXNwb25kV2l0aCBpbnN0YW5jZW9mIFJlc3BvbnNlKSB7XG4gICAgICByZXNwb25zZSA9IGhvb2subWV0YWRhdGEucmVzcG9uZFdpdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcihcbiAgICAgICAgYEludmFsaWQgXFxgcmVzcG9uZFdpdGhcXGAgdmFsdWU6ICR7aG9vay5tZXRhZGF0YS5yZXNwb25kV2l0aH1gLFxuICAgICAgICB7IHNsdWc6IEVSUk9SX1NMVUdTLldFQkhPT0tfSU5WQUxJRF9SRVNQT05EX1dJVEhfVkFMVUUgfVxuICAgICAgKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gTm8gYHJlc3BvbmRXaXRoYCB2YWx1ZSBpbXBsaWVzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mIHJldHVybmluZyBhIDIwMlxuICAgIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHsgc3RhdHVzOiAyMDIgfSk7XG4gIH1cblxuICBhd2FpdCByZXN1bWVIb29rKGhvb2ssIHJlcXVlc3QsIGVuY3J5cHRpb25LZXkpO1xuXG4gIGlmIChyZXNwb25zZVJlYWRhYmxlKSB7XG4gICAgLy8gV2FpdCBmb3IgdGhlIHJlYWRhYmxlIHN0cmVhbSB0byBlbWl0IG9uZSBjaHVuayxcbiAgICAvLyB3aGljaCBpcyB0aGUgYFJlc3BvbnNlYCBvYmplY3RcbiAgICBjb25zdCByZWFkZXIgPSByZXNwb25zZVJlYWRhYmxlLmdldFJlYWRlcigpO1xuICAgIGNvbnN0IGNodW5rID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICBpZiAoY2h1bmsudmFsdWUpIHtcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgbWF0ZXJpYWxpemVSZXNwb25zZUJvZHkoY2h1bmsudmFsdWUpO1xuICAgIH1cbiAgICBhd2FpdCByZWFkZXIuY2FuY2VsKCk7XG4gIH1cblxuICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKCdXb3JrZmxvdyBydW4gZGlkIG5vdCBzZW5kIGEgcmVzcG9uc2UnLCB7XG4gICAgICBzbHVnOiBFUlJPUl9TTFVHUy5XRUJIT09LX1JFU1BPTlNFX05PVF9TRU5ULFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFtRE8sU0FBUyxzQkFBc0IsT0FBTztBQUN6QyxrQkFBZ0IsT0FBTyxZQUFZLE1BQU0sSUFBSSxDQUFDLE1BQUk7QUFBQSxJQUMxQyxFQUFFO0FBQUEsSUFDRjtBQUFBLEVBQ0osQ0FBQyxDQUFDO0FBQ1Y7QUFLVyxTQUFTLHVCQUF1QjtBQUN2QyxTQUFPO0FBQUEsSUFDSCxHQUFHO0FBQUEsSUFDSCxHQUFHO0FBQUEsRUFDUDtBQUNKO0FBU1csU0FBUyxnQkFBZ0IsT0FBTztBQUN2QyxrQkFBZ0IsT0FBTyxZQUFZLE1BQU0sSUFBSSxDQUFDLE1BQUk7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QUNKO0FBQ0EsSUFBTSxjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKO0FBQ0EsU0FBUyxpQkFBaUI7QUFDdEIsU0FBTztBQUFBLElBQ0g7QUFBQSxJQUNBO0FBQUEsSUFDQSxJQUFJLE9BQU8sU0FBUyxZQUFZLEtBQUssR0FBRyxDQUFDLFFBQVEsSUFBSTtBQUFBLElBQ3JEO0FBQUEsRUFDSjtBQUNKO0FBUFM7QUFRVCxJQUFNLHFCQUFxQjtBQUFBLEVBQ3ZCO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsTUFDSTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFB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Q3JCLHVCQUF1QjtBQUFBLE1BQ25CLFlBQVk7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLFlBQVk7QUFBQSxNQUNSLFlBQVk7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNOO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNILFlBQVk7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLG9CQUFvQjtBQUFBLE1BQ2hCLFlBQVk7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFDQSxZQUFZO0FBQUEsTUFDUixZQUFZO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEs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ZXMiOiBbInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImZldGNoIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInoiLCAieiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJGYXRhbEVycm9yIiwgInoiLCAieiIsICJwYXJzZWQiLCAid3JpdGVQcm9ncmVzc0NodW5rIiwgImNsb3NlUHJvZ3Jlc3NTdHJlYW0iLCAiQ2xpZW50IiwgIndpdGhQZ0NsaWVudCIsICJDbGllbnQiLCAicXVlcnlSb3dzIiwgInJlYWQiLCAidXRpbHMiLCAidXRpbHMiLCAidXRpbHMiLCAicG9zIiwgInV0aWxzIiwgInV0aWxzIiwgInN0YXJ0IiwgInV0aWxzIiwgImNvbHVtbktleXMiLCAicmF3SGVhZGVyIiwgIkZhdGFsRXJyb3IiLCAicmVhZCIsICJ3aXRoUGdDbGllbnQiLCAiZW1pdFByb2dyZXNzU3RlcCIsICJ3cml0ZVByb2dyZXNzQ2h1bmsiLCAiY2xvc2VQcm9ncmVzc1N0ZXAiLCAiY2xvc2VQcm9ncmVzc1N0cmVhbSIsICJxdWVyeVJvd3MiLCAiY3JlYXRlZCIsICJzZXREeW5hbWljUGFnZXMiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiUmVwbGF5RGl2ZXJnZW5jZUVycm9yIiwgIldvcmtmbG93UnVudGltZUVycm9yIiwgInBhcnNlV29ya2Zsb3dOYW1lIiwgIlNQRUNfVkVSU0lPTl9DVVJSRU5UIiwgIlNQRUNfVkVSU0lPTl9MRUdBQ1kiLCAiaW1wb3J0S2V5IiwgIldvcmtmbG93U3VzcGVuc2lvbiIsICJydW50aW1lTG9nZ2VyIiwgImdldFdvcmtmbG93UXVldWVOYW1lIiwgImdldFdvcmxkIiwgIkF0dHJpYnV0ZSIsICJ0cmFjZSIsICJXb3JrZmxvd1N1c3BlbnNpb24iLCAiRVJST1JfU0xVR1MiLCAiV29ya2Zsb3dSdW50aW1lRXJyb3IiLCAicnVudGltZUxvZ2dlciIsICJBdHRyaWJ1dGUiLCAidHJhY2UiLCAiZ2V0V29ybGQiLCAiZ2V0V29ybGRIYW5kbGVycyJdCn0K
