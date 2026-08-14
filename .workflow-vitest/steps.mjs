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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2xpYi9wYWdlLWNhdGFsb2cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL3dvcmtmbG93L3NyYy9pbnRlcm5hbC9idWlsdGlucy50cyIsICIuLi9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL3N0ZGxpYi50cyIsICIuLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMudHMiLCAiLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1nZW5lcmF0b3IudHMiLCAiLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1zY2hlbWEudHMiLCAiLi4vc3JjL2RvbWFpbi9haS9zY2hlbWEtZ2VuZXJhdGlvbi1zY2hlbWEudHMiLCAiLi4vc3JjL2RvbWFpbi9haS96bW9kZWwtY29tcGlsZXIudHMiLCAiLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1jb21waWxlci50cyIsICIuLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLW1hdGVyaWFsaXplci50cyIsICIuLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLXNjaGVtYS1hcHBseS50cyIsICIuLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvcHJvZ3Jlc3MudHMiLCAiLi4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL2RiLnRzIiwgIi4uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMudHMiLCAiLi4vc3JjL2RvbWFpbi9haS13b3JrYm9vay9leHRyYWN0LXNoZWV0cy50cyIsICIuLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL3NoZWV0LWFuYWx5c2lzLnRzIiwgIi4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svY29tcHJlaGVuZC50cyIsICIuLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3Byb2dyZXNzLnRzIiwgIi4uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3QvZGIudHMiLCAiLi4vc3JjL2xpYi93b3JrYm9vay1mb3JtdWxhcy50cyIsICIuLi9zcmMvbGliL2V4Y2VsLWZvcm11bGEudHMiLCAiLi4vc3JjL2xpYi93b3JrYm9vay1tYXBwaW5nLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvYnVpbGRlcnMvc3JjL3NlcmRlLWNoZWNrZXIudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9ydW50aW1lLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvd29ya2Zsb3cudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9ydW50aW1lL3Jlc3VtZS1ob29rLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIENvZGUtZmlyc3QgcGFnZSBjYXRhbG9nIFx1MjAxNCBydW50aW1lIFNTb1QgYXQgTVZQLlxuICogU3VwcG9ydHMgc3RhdGljIGNhdGFsb2cgZW50cmllcyBhbmQgZHluYW1pY2FsbHkgcmVnaXN0ZXJlZCBwYWdlc1xuICogKGUuZy4gZnJvbSB3b3JrYm9vayBhbmFseXNpcyBhZnRlciBhbiBFeGNlbCB1cGxvYWQpLlxuICpcbiAqIERCIEFwcFBhZ2UvUGFnZVNlY3Rpb24gc2VlZGVkIGluIFA2OyBjYXRhbG9nIHdpbnMgYXQgcnVudGltZS5cbiAqLyAvKiogUGFydHMgZnJvbSB0aGUgdXBsb2FkZWQgQnVzaW5lc3MgUmV2aWV3IFx1MjAxNCBwb3B1bGF0ZWQgZHluYW1pY2FsbHkgYXQgcmVuZGVyIHRpbWUuICovIC8qKiBTdGF0aWMgcGFydHMgQVx1MjAxM0cgZXhpc3QgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aCBsZWdhY3kgc2VlZGVkIGRvY3MuIER5bmFtaWMgcGFydHMgb3ZlcnJpZGUgdGhlc2UuICovIGNvbnN0IFNUQVRJQ19QQVJUUyA9IHtcbiAgICAncGFydC1hJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtYScsXG4gICAgICAgIHBhcnRLZXk6ICdBJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEE6IEN1cnJlbnQgU2l0dWF0aW9uIFx1MjAxNCBUaGUgTnVtYmVycycsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtYic6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWInLFxuICAgICAgICBwYXJ0S2V5OiAnQicsXG4gICAgICAgIHRpdGxlOiAnUGFydCBCOiBUaGUgMTAtWWVhciBHcm93dGggTW9kZWwnLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWMnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1jJyxcbiAgICAgICAgcGFydEtleTogJ0MnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgQzogUmV2ZW51ZSBPcHRpbWl6YXRpb24gU3RyYXRlZ3knLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWQnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1kJyxcbiAgICAgICAgcGFydEtleTogJ0QnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRDogQ29zdCBNYW5hZ2VtZW50JyxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnXG4gICAgfSxcbiAgICAncGFydC1lJzoge1xuICAgICAgICBwYXJ0U2x1ZzogJ3BhcnQtZScsXG4gICAgICAgIHBhcnRLZXk6ICdFJyxcbiAgICAgICAgdGl0bGU6ICdQYXJ0IEU6IFJpc2sgUmVnaXN0ZXInLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZSdcbiAgICB9LFxuICAgICdwYXJ0LWYnOiB7XG4gICAgICAgIHBhcnRTbHVnOiAncGFydC1mJyxcbiAgICAgICAgcGFydEtleTogJ0YnLFxuICAgICAgICB0aXRsZTogJ1BhcnQgRjogU3RhcldPUkxEIE1lbWJlcnNoaXAgUHJvZ3JhbScsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH0sXG4gICAgJ3BhcnQtZyc6IHtcbiAgICAgICAgcGFydFNsdWc6ICdwYXJ0LWcnLFxuICAgICAgICBwYXJ0S2V5OiAnRycsXG4gICAgICAgIHRpdGxlOiAnUGFydCBHOiBJbW1lZGlhdGUgQWN0aW9ucyAoTmV4dCAzMCBEYXlzKScsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJ1xuICAgIH1cbn07XG4vKiogRHluYW1pYyBwYXJ0cyBwb3B1bGF0ZWQgZnJvbSBwYXJzZWQgQnVzaW5lc3MgUmV2aWV3IE1EIHVwbG9hZGVkIHZpYSAvY29uZmlnLiAqLyBsZXQgRFlOQU1JQ19QQVJUUyA9IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIHNldER5bmFtaWNSZXZpZXdQYXJ0cyhwYXJ0cykge1xuICAgIERZTkFNSUNfUEFSVFMgPSBPYmplY3QuZnJvbUVudHJpZXMocGFydHMubWFwKChwKT0+W1xuICAgICAgICAgICAgcC5wYXJ0U2x1ZyxcbiAgICAgICAgICAgIHBcbiAgICAgICAgXSkpO1xufVxuLyoqXG4gKiBEeW5hbWljIGdldHRlciB0aGF0IG1lcmdlcyBzdGF0aWMgKyBhbnkgcnVudGltZS1yZWdpc3RlcmVkIHBhcnRzLlxuICogVXNlIGluc3RlYWQgb2YgUkVWSUVXX1BBUlRfQ0FUQUxPRyBzbyB0aGF0IHNldER5bmFtaWNSZXZpZXdQYXJ0cygpIGNhbGxzXG4gKiBhcmUgcmVmbGVjdGVkIGltbWVkaWF0ZWx5LlxuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5TVEFUSUNfUEFSVFMsXG4gICAgICAgIC4uLkRZTkFNSUNfUEFSVFNcbiAgICB9O1xufVxuLyoqIEBkZXByZWNhdGVkIFVzZSBnZXRSZXZpZXdQYXJ0Q2F0YWxvZygpIFx1MjAxNCB0aGlzIGNvbnN0IGlzIGZyb3plbiBhdCBtb2R1bGUgbG9hZCB0aW1lLiAqLyBleHBvcnQgY29uc3QgUkVWSUVXX1BBUlRfQ0FUQUxPRyA9IHtcbiAgICAuLi5TVEFUSUNfUEFSVFMsXG4gICAgLi4uRFlOQU1JQ19QQVJUU1xufTtcbi8qKiBEeW5hbWljIHBhZ2VzIHJlZ2lzdGVyZWQgYXQgcnVudGltZSAoZS5nLiBmcm9tIHdvcmtib29rIGFuYWx5c2lzIGFmdGVyIHJlc2VlZCkuICovIGxldCBEWU5BTUlDX1BBR0VTID0ge307XG4vKipcbiAqIFJlZ2lzdGVyIGR5bmFtaWNhbGx5IGdlbmVyYXRlZCBwYWdlcyBcdTIwMTQgY2FsbGVkIGFmdGVyIHdvcmtib29rIGFuYWx5c2lzXG4gKiBkdXJpbmcgdGhlIHJlc2VlZCBwaXBlbGluZSBzbyBzaGVldC1kZXJpdmVkIGFuYWx5dGljcyBwYWdlcyBhcHBlYXIgaW4gdGhlIG5hdi5cbiAqLyBleHBvcnQgZnVuY3Rpb24gc2V0RHluYW1pY1BhZ2VzKHBhZ2VzKSB7XG4gICAgRFlOQU1JQ19QQUdFUyA9IE9iamVjdC5mcm9tRW50cmllcyhwYWdlcy5tYXAoKHApPT5bXG4gICAgICAgICAgICBwLnNsdWcsXG4gICAgICAgICAgICBwXG4gICAgICAgIF0pKTtcbn1cbi8qKiBDb21iaW5lZCBzdGF0aWMgKyBkeW5hbWljIHBhZ2UgY2F0YWxvZyAoZXZhbHVhdGVkIGxhemlseSBzbyBkeW5hbWljIHBhZ2VzIGFyZSBpbmNsdWRlZCkuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRGdWxsQ2F0YWxvZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5QQUdFX0NBVEFMT0csXG4gICAgICAgIC4uLkRZTkFNSUNfUEFHRVNcbiAgICB9O1xufVxuZXhwb3J0IGNvbnN0IFBBR0VfQ0FUQUxPRyA9IHtcbiAgICBob21lOiB7XG4gICAgICAgIHNsdWc6ICdob21lJyxcbiAgICAgICAgdGl0bGU6ICdIb21lJyxcbiAgICAgICAgbmF2TGFiZWw6ICdIb21lJyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnaGVybycsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnV2VsY29tZScsXG4gICAgICAgICAgICAgICAgICAgIHN1YnRpdGxlOiAnWW91ciBidXNpbmVzcyBhcHBsaWNhdGlvbiBcdTIwMTQgY29uZmlndXJlIHBhZ2VzLCBkYXRhIGFuZCBicmFuZGluZyBmcm9tIHRoZSBBZG1pbiBhcmVhLicsXG4gICAgICAgICAgICAgICAgICAgIG1pblRpZXI6ICdwdWJsaWMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICBkYXNoYm9hcmQ6IHtcbiAgICAgICAgc2x1ZzogJ2Rhc2hib2FyZCcsXG4gICAgICAgIHRpdGxlOiAnRGFzaGJvYXJkJyxcbiAgICAgICAgbmF2TGFiZWw6ICdEYXNoYm9hcmQnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncHVibGljJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdoZXJvJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2U6ICdKdWx5IDIwMjYgXHUwMEI3IEV4aXQgVmlhYmlsaXR5IFJldmlldycsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnQnVzaW5lc3MgUmV2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgc3VidGl0bGU6ICdFeGl0LXZpYWJpbGl0eSBhc3Nlc3NtZW50IGZvciBQVCBUYW1hbiBCaW50YW5nIEJhbGkgXHUyMDE0IHJldmVudWUgdW5kZXIgcHJlc3N1cmUsIG1hcmdpbiBlcm9zaW9uIGRldGVjdGVkLCBzaGFyZWhvbGRlciBzZWVraW5nIHBhdGh3YXkgb3V0LicsXG4gICAgICAgICAgICAgICAgICAgIG1pblRpZXI6ICdwdWJsaWMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIC8vICAgY29uZmlnOiB7IHZhcmlhbnQ6ICdkYXNoYm9hcmQnLCBzY2VuYXJpbzogJ2NvbnNlcnZhdGl2ZScsIG1pblRpZXI6ICdnb29nbGUnIH0sXG4gICAgICAgICAgICAvLyB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2FjdGlvbl9jaGVja2xpc3QnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAncGluJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnbWV0cmljX2dyaWQnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAnZ29vZ2xlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnbGV2ZXJfYWNjb3JkaW9uJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdUaGUgNSBMZXZlcnMnLFxuICAgICAgICAgICAgICAgICAgICBtaW5UaWVyOiAnZ29vZ2xlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgc3VtbWFyeToge1xuICAgICAgICBzbHVnOiAnc3VtbWFyeScsXG4gICAgICAgIHRpdGxlOiAnRXhlY3V0aXZlIFN1bW1hcnknLFxuICAgICAgICBuYXZMYWJlbDogJ1N1bW1hcnknLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgcGRmRXhwb3J0OiB0cnVlLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ2V4ZWN1dGl2ZS1zdW1tYXJ5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ29wcy1hZG1pbic6IHtcbiAgICAgICAgc2x1ZzogJ29wcy1hZG1pbicsXG4gICAgICAgIHRpdGxlOiAnT3BzIEFkbWluJyxcbiAgICAgICAgbmF2TGFiZWw6ICdPcHMgQWRtaW4nLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgcmVxdWlyZWRHcm91cHM6IFtcbiAgICAgICAgICAgICdvcHMtYWRtaW4nXG4gICAgICAgIF0sXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnb3BzX2FkbWluX3RhYnMnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgcmV2aWV3OiB7XG4gICAgICAgIHNsdWc6ICdyZXZpZXcnLFxuICAgICAgICB0aXRsZTogJ0J1c2luZXNzIFJldmlldycsXG4gICAgICAgIG5hdkxhYmVsOiAnUmV2aWV3JyxcbiAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICBhdXRoVGllcjogJ2dvb2dsZScsXG4gICAgICAgIHBkZkV4cG9ydDogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdyZXZpZXdfYmxvY2tzJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgICdvcHMtdHJhY2tpbmcnOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtdHJhY2tpbmcnLFxuICAgICAgICB0aXRsZTogJ0ZpbmFuY2lhbCBUcmFja2luZycsXG4gICAgICAgIG5hdkxhYmVsOiAnVHJhY2tpbmcnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdrcGlfY2FyZHMnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICB2YXJpYW50OiAnb3BzJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAncmVwb3J0c19yb2xsdXAnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudDogJ29wcydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ3BubF90YWJsZScsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSxcbiAgICAnb3BzLWNoYXQnOiB7XG4gICAgICAgIHNsdWc6ICdvcHMtY2hhdCcsXG4gICAgICAgIHRpdGxlOiAnQUkgQ2hhdCcsXG4gICAgICAgIG5hdkxhYmVsOiAnQUkgQ2hhdCcsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdnb29nbGUnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2NoYXRfcGFuZWwnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgdGFza3M6IHtcbiAgICAgICAgc2x1ZzogJ3Rhc2tzJyxcbiAgICAgICAgdGl0bGU6ICdFeGl0LVZpYWJpbGl0eSBUYXNrcycsXG4gICAgICAgIG5hdkxhYmVsOiAnVGFza3MnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICBhZG1pbjoge1xuICAgICAgICBzbHVnOiAnYWRtaW4nLFxuICAgICAgICB0aXRsZTogJ1BsYXRmb3JtIEFkbWluJyxcbiAgICAgICAgbmF2TGFiZWw6ICdBZG1pbicsXG4gICAgICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwaW4nLFxuICAgICAgICBzZWN0aW9uczogW11cbiAgICB9LFxuICAgIGNvbmZpZzoge1xuICAgICAgICBzbHVnOiAnY29uZmlnJyxcbiAgICAgICAgdGl0bGU6ICdTb3VyY2UgQ29uZmlnJyxcbiAgICAgICAgbmF2TGFiZWw6ICdDb25maWcnLFxuICAgICAgICBzaG93SW5OYXY6IHRydWUsXG4gICAgICAgIGF1dGhUaWVyOiAncGluJyxcbiAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgfSxcbiAgICAndGVybXMtb2Ytc2VydmljZSc6IHtcbiAgICAgICAgc2x1ZzogJ3Rlcm1zLW9mLXNlcnZpY2UnLFxuICAgICAgICB0aXRsZTogJ1Rlcm1zIG9mIFNlcnZpY2UnLFxuICAgICAgICBzaG93SW5OYXY6IGZhbHNlLFxuICAgICAgICBhdXRoVGllcjogJ3B1YmxpYycsXG4gICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlOiAnZG9jX21hcmtkb3duJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAndGVybXMtb2Ytc2VydmljZS5odG1sJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgJ3ByaXZhY3ktcG9saWN5Jzoge1xuICAgICAgICBzbHVnOiAncHJpdmFjeS1wb2xpY3knLFxuICAgICAgICB0aXRsZTogJ1ByaXZhY3kgUG9saWN5JyxcbiAgICAgICAgc2hvd0luTmF2OiBmYWxzZSxcbiAgICAgICAgYXV0aFRpZXI6ICdwdWJsaWMnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ3ByaXZhY3ktcG9saWN5Lmh0bWwnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfVxufTtcbmNvbnN0IFRJRVJfUkFOSyA9IHtcbiAgICBwdWJsaWM6IDAsXG4gICAgcGluOiAxLFxuICAgIGdvb2dsZTogMlxufTtcbmV4cG9ydCBmdW5jdGlvbiB0aWVyQWxsb3dzQWNjZXNzKGN1cnJlbnQsIHJlcXVpcmVkKSB7XG4gICAgcmV0dXJuIFRJRVJfUkFOS1tjdXJyZW50XSA+PSBUSUVSX1JBTktbcmVxdWlyZWRdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxpc3ROYXZQYWdlcyh0aWVyLCBncm91cHMgPSBbXSkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGdldEZ1bGxDYXRhbG9nKCkpLmZpbHRlcigocCk9PnAuc2hvd0luTmF2ICE9PSBmYWxzZSkuZmlsdGVyKChwKT0+dGllckFsbG93c0FjY2Vzcyh0aWVyLCBwLmF1dGhUaWVyKSkuZmlsdGVyKChwKT0+IXAucmVxdWlyZWRHcm91cHMgfHwgcC5yZXF1aXJlZEdyb3Vwcy5sZW5ndGggPT09IDAgfHwgZ3JvdXBzLmluY2x1ZGVzKCdwbGF0Zm9ybS1hZG1pbicpIHx8IHAucmVxdWlyZWRHcm91cHMuc29tZSgoZyk9Pmdyb3Vwcy5pbmNsdWRlcyhnKSkpLnNvcnQoKGEsIGIpPT5hLnRpdGxlLmxvY2FsZUNvbXBhcmUoYi50aXRsZSkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYWdlKHNsdWcpIHtcbiAgICByZXR1cm4gZ2V0RnVsbENhdGFsb2coKVtzbHVnXSA/PyBudWxsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVSZXZpZXdQYXJ0KHBhcnRTbHVnKSB7XG4gICAgcmV0dXJuIGdldFJldmlld1BhcnRDYXRhbG9nKClbcGFydFNsdWddID8/IG51bGw7XG59XG5leHBvcnQgZnVuY3Rpb24gbGlzdFJldmlld1BhcnRzKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGdldFJldmlld1BhcnRDYXRhbG9nKCkpLnNvcnQoKGEsIGIpPT5hLnBhcnRLZXkubG9jYWxlQ29tcGFyZShiLnBhcnRLZXkpKTtcbn1cbi8qKiBEZXNjcmlwdGl2ZSB0aXRsZSB3aXRob3V0IHRoZSBcIlBhcnQgWDogXCIgY2F0YWxvZyBwcmVmaXguICovIGV4cG9ydCBmdW5jdGlvbiBnZXRSZXZpZXdQYXJ0RGlzcGxheVRpdGxlKHRpdGxlKSB7XG4gICAgcmV0dXJuIHRpdGxlLnJlcGxhY2UoL15QYXJ0IFtBLU9dOiAvLCAnJyk7XG59XG4iLCAiLyoqXG4gKiBUaGVzZSBhcmUgdGhlIGJ1aWx0LWluIHN0ZXBzIHRoYXQgYXJlIFwiYXV0b21hdGljYWxseSBhdmFpbGFibGVcIiBpbiB0aGUgd29ya2Zsb3cgc2NvcGUuIFRoZXkgYXJlXG4gKiBzaW1pbGFyIHRvIFwic3RkbGliXCIgZXhjZXB0IHRoYXQgYXJlIG5vdCBtZWFudCB0byBiZSBpbXBvcnRlZCBieSB1c2VycywgYnV0IGFyZSBpbnN0ZWFkIFwianVzdCBhdmFpbGFibGVcIlxuICogYWxvbmdzaWRlIHVzZXIgZGVmaW5lZCBzdGVwcy4gVGhleSBhcmUgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBydW50aW1lXG4gKi9cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV9hcnJheV9idWZmZXIoXG4gIHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZVxuKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmFycmF5QnVmZmVyKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfanNvbih0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2UpIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIHRoaXMuanNvbigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX3RleHQodGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLnRleHQoKTtcbn1cbiIsICIvKipcbiAqIFRoaXMgaXMgdGhlIFwic3RhbmRhcmQgbGlicmFyeVwiIG9mIHN0ZXBzIHRoYXQgd2UgbWFrZSBhdmFpbGFibGUgdG8gYWxsIHdvcmtmbG93IHVzZXJzLlxuICogVGhlIGNhbiBiZSBpbXBvcnRlZCBsaWtlIHNvOiBgaW1wb3J0IHsgZmV0Y2ggfSBmcm9tICd3b3JrZmxvdydgLiBhbmQgdXNlZCBpbiB3b3JrZmxvdy5cbiAqIFRoZSBuZWVkIHRvIGJlIGV4cG9ydGVkIGRpcmVjdGx5IGluIHRoaXMgcGFja2FnZSBhbmQgY2Fubm90IGxpdmUgaW4gYGNvcmVgIHRvIHByZXZlbnRcbiAqIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBwb3N0LWNvbXBpbGF0aW9uLlxuICovXG5cbi8qKlxuICogQSBob2lzdGVkIGBmZXRjaCgpYCBmdW5jdGlvbiB0aGF0IGlzIGV4ZWN1dGVkIGFzIGEgXCJzdGVwXCIgZnVuY3Rpb24sXG4gKiBmb3IgdXNlIHdpdGhpbiB3b3JrZmxvdyBmdW5jdGlvbnMuXG4gKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRmV0Y2hfQVBJXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaCguLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBnbG9iYWxUaGlzLmZldGNoPikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gZ2xvYmFsVGhpcy5mZXRjaCguLi5hcmdzKTtcbn1cbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG4vKipcbiAqIFN0ZXAgZnVuY3Rpb25zIGZvciB0aGUgYXBwLXBhY2stZ2VuZXJhdGUgd29ya2Zsb3cuXG4gKlxuICogRWFjaCBleHBvcnRlZCBhc3luYyBmdW5jdGlvbiB3aXRoIHRoZSBgJ3VzZSBzdGVwJ2AgZGlyZWN0aXZlIGlzIGEgZHVyYWJsZVxuICogc3RlcDogaXRzIGFyZ3MgYW5kIHJlc3VsdCBhcmUgc2VyaWFsaXplZCB0byB0aGUgZXZlbnQgbG9nLCBhbmQgaXQgcmV0cmllc1xuICogYmVmb3JlIHRoZSBlcnJvciBidWJibGVzIHRvIHRoZSB3b3JrZmxvdy5cbiAqLyBpbXBvcnQgeyBGYXRhbEVycm9yIH0gZnJvbSAnd29ya2Zsb3cnO1xuaW1wb3J0IHsgZGVjb21wb3NlUGFja0Zyb21Qcm9tcHQsIGdlbmVyYXRlQXBwRGVmaW5pdGlvbiwgbW9ja0RlY29tcG9zZVBhY2ssIG1vY2tHZW5lcmF0ZUFwcERlZmluaXRpb24gfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLWdlbmVyYXRvcic7XG5pbXBvcnQgeyBjb21waWxlQXBwQXJ0aWZhY3RzIH0gZnJvbSAnLi4vLi4vc3JjL2RvbWFpbi9hcHAtcGFjay9hcHAtcGFjay1jb21waWxlcic7XG5pbXBvcnQgeyBtYXRlcmlhbGl6ZUFwcFBhY2sgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLW1hdGVyaWFsaXplcic7XG5pbXBvcnQgeyBhcHBseVBhY2tTY2hlbWEgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FwcC1wYWNrL2FwcC1wYWNrLXNjaGVtYS1hcHBseSc7XG5pbXBvcnQgeyB3cml0ZVByb2dyZXNzQ2h1bmssIGNsb3NlUHJvZ3Jlc3NTdHJlYW0gfSBmcm9tICcuL3Byb2dyZXNzJztcbmltcG9ydCB7IHdpdGhQZ0NsaWVudCwgcXVlcnlSb3dzIH0gZnJvbSAnLi9kYic7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wid29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLnRzXCI6e1wiYXBwbHlQYWNrU2NoZW1hU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2FwcGx5UGFja1NjaGVtYVN0ZXBcIn0sXCJjbG9zZVByb2dyZXNzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2Nsb3NlUHJvZ3Jlc3NTdGVwXCJ9LFwiY29tcGlsZUFwcFBhY2tTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vY29tcGlsZUFwcFBhY2tTdGVwXCJ9LFwiZGVjb21wb3NlUGFja1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9kZWNvbXBvc2VQYWNrU3RlcFwifSxcImVtaXRQcm9ncmVzc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9lbWl0UHJvZ3Jlc3NTdGVwXCJ9LFwiZ2VuZXJhdGVBcHBTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vZ2VuZXJhdGVBcHBTdGVwXCJ9LFwibG9hZEtub3dsZWRnZUJhc2VTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vbG9hZEtub3dsZWRnZUJhc2VTdGVwXCJ9LFwibWF0ZXJpYWxpemVBcHBQYWNrU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL21hdGVyaWFsaXplQXBwUGFja1N0ZXBcIn19fX0qLztcbi8qKiBEZXRlcm1pbmlzdGljIGZhbGxiYWNrIHBhY2sgaWQgaWYgdGhlIHJvdXRlIGRpZG4ndCBzdXBwbHkgb25lLiAqLyBleHBvcnQgZnVuY3Rpb24gZGVmYXVsdFBhY2tJZChwcm9tcHQpIHtcbiAgICByZXR1cm4gYHBhY2stJHtwcm9tcHQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJykucmVwbGFjZSgvXi0rfC0rJC9nLCAnJykuc2xpY2UoMCwgMzIpIHx8ICdjdXN0b20nfWA7XG59XG4vKipcbiAqIFN0YWdlIDE6IGRlY29tcG9zZSB0aGUgYWRtaW4ncyByZXF1aXJlbWVudCBpbnRvIHBlci1kZXBhcnRtZW50IGFwcCBicmllZnMuXG4gKiBEZXRlcm1pbmlzdGljIGluIG1vY2sgbW9kZS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjb21wb3NlUGFja1N0ZXAoaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQubW9jaykge1xuICAgICAgICByZXR1cm4gbW9ja0RlY29tcG9zZVBhY2soKTtcbiAgICB9XG4gICAgLy8gS25vd2xlZGdlIGdyb3VuZGluZyBpcyBsb2FkZWQgc2VwYXJhdGVseSAobG9hZEtub3dsZWRnZUJhc2VTdGVwKTsgdGhlXG4gICAgLy8gZ2VuZXJhdG9yIGNhbGwgaXMgd3JhcHBlZCBzbyBzdGVwIHJldHJpZXMgYXJlIHNhZmUuXG4gICAgY29uc3QgZGVjb21wb3NpdGlvbiA9IGF3YWl0IGRlY29tcG9zZVBhY2tGcm9tUHJvbXB0KGlucHV0LnByb21wdCk7XG4gICAgaWYgKCFkZWNvbXBvc2l0aW9uLmFwcHMubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdBSSBkZWNvbXBvc2l0aW9uIHJldHVybmVkIHplcm8gYXBwcyBcdTIwMTQgcGxlYXNlIHJlcGhyYXNlIHRoZSByZXF1aXJlbWVudC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY29tcG9zaXRpb247XG59XG4vKiogTG9hZCBrbm93bGVkZ2Ugc25pcHBldHMgZnJvbSB0aGUgdGVuYW50IERCIHRvIGdyb3VuZCB0aGUgZ2VuZXJhdGlvbi4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRLbm93bGVkZ2VCYXNlU3RlcChkYlVybCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBhd2FpdCBxdWVyeVJvd3MoZGIsIGBTRUxFQ1Qga2V5LCBjb250ZW50LCBjYXRlZ29yeSBGUk9NIGtub3dsZWRnZV9zbmlwcGV0cyBPUkRFUiBCWSBjYXRlZ29yeSwga2V5IExJTUlUIDIwMDtgKTtcbiAgICAgICAgICAgIGlmICghcm93cy5sZW5ndGgpIHJldHVybiAnJztcbiAgICAgICAgICAgIHJldHVybiByb3dzLm1hcCgocik9PmBbJHtyLmNhdGVnb3J5fV0gJHtyLmtleX06XFxuJHtyLmNvbnRlbnQuc2xpY2UoMCwgMjAwMCl9YCkuam9pbignXFxuXFxuLS0tXFxuXFxuJyk7XG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgLy8gS25vd2xlZGdlIGdyb3VuZGluZyBpcyBiZXN0LWVmZm9ydDsgZ2VuZXJhdGlvbiBzdGlsbCB3b3JrcyB3aXRob3V0IGl0LlxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxufVxuLyoqXG4gKiBTdGFnZSAyOiBnZW5lcmF0ZSB0aGUgZnVsbCBkZWZpbml0aW9uIG9mIG9uZSBhcHAgKFczIHNjaGVtYSwgbW9kZWxzLCB1c2VcbiAqIGNhc2VzLCBwYWdlcywgbmF2LCBVWCB3b3JrZmxvdywga25vd2xlZGdlIHNuaXBwZXRzKS4gQ0VPIE92ZXJ2aWV3IChsYXN0XG4gKiBicmllZikgZ2V0cyB0aGUgZGVjb21wb3NpdGlvbidzIHB1cnBvc2UgKyBjcm9zcy1kZXBhcnRtZW50IEtQSXMuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlQXBwU3RlcChpbnB1dCwgZGVjb21wb3NpdGlvbiwga25vd2xlZGdlQmFzZSwgaW5kZXgpIHtcbiAgICBjb25zdCBiID0gZGVjb21wb3NpdGlvbi5hcHBzW2luZGV4XTtcbiAgICBpZiAoIWIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYEFwcCBicmllZiBhdCBpbmRleCAke2luZGV4fSBtaXNzaW5nIGZyb20gZGVjb21wb3NpdGlvbi5gKTtcbiAgICB9XG4gICAgY29uc3QgaXNDZW8gPSBpbmRleCA9PT0gZGVjb21wb3NpdGlvbi5hcHBzLmxlbmd0aCAtIDE7XG4gICAgaWYgKGlucHV0Lm1vY2spIHtcbiAgICAgICAgcmV0dXJuIG1vY2tHZW5lcmF0ZUFwcERlZmluaXRpb24oYik7XG4gICAgfVxuICAgIHJldHVybiBnZW5lcmF0ZUFwcERlZmluaXRpb24oYiwgaXNDZW8gPyBkZWNvbXBvc2l0aW9uLmNlb092ZXJ2aWV3LnB1cnBvc2UgOiAnJywgaXNDZW8gPyBkZWNvbXBvc2l0aW9uLmNlb092ZXJ2aWV3LmtwaXMgOiBbXSwgZGVjb21wb3NpdGlvbi5hcHBzLCBrbm93bGVkZ2VCYXNlKTtcbn1cbi8qKiBTdGFnZSAzOiBkZXRlcm1pbmlzdGljIGNvbXBpbGF0aW9uIG9mIGRlZmluaXRpb25zIFx1MjE5MiBhcnRpZmFjdHMgKyBEQiByb3dzLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcGlsZUFwcFBhY2tTdGVwKGRlY29tcG9zaXRpb24sIGRlZmluaXRpb25zKSB7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zLm1hcCgoZGVmKT0+Y29tcGlsZUFwcEFydGlmYWN0cyhkZWYpKTtcbn1cbi8qKiBTdGFnZSA0OiBwZXJzaXN0IHBhZ2VzL25hdi9zbmlwcGV0cy9zZWN1cml0eSBncm91cHMgaW50byB0aGUgdGVuYW50IERCLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWF0ZXJpYWxpemVBcHBQYWNrU3RlcChpbnB1dCwgZGVjb21wb3NpdGlvbiwgZGVmaW5pdGlvbnMsIGFydGlmYWN0cykge1xuICAgIGNvbnN0IHBhY2tJZCA9IGlucHV0LnBhY2tJZCA/PyBkZWZhdWx0UGFja0lkKGlucHV0LnByb21wdCk7XG4gICAgY29uc3QgbWF0ZXJpYWxpemVJbnB1dCA9IHtcbiAgICAgICAgcGFja0lkLFxuICAgICAgICB0ZW5hbnRTbHVnOiBpbnB1dC50ZW5hbnRTbHVnLFxuICAgICAgICBkZWNvbXBvc2l0aW9uLFxuICAgICAgICBhcHBzOiBhcnRpZmFjdHMsXG4gICAgICAgIGRlZmluaXRpb25zXG4gICAgfTtcbiAgICByZXR1cm4gd2l0aFBnQ2xpZW50KGlucHV0LmRiVXJsLCAoZGIpPT5tYXRlcmlhbGl6ZUFwcFBhY2soZGIsIG1hdGVyaWFsaXplSW5wdXQpKTtcbn1cbi8qKlxuICogU3RhZ2UgNTogYXBwbHkgdGhlIHBhY2sncyBjb25zb2xpZGF0ZWQgWmVuU3RhY2sgc2NoZW1hIHRvIHRoZSB0ZW5hbnQgREIgc29cbiAqIHRoZSBnZW5lcmF0ZWQgbW9kZWxzIGJlY29tZSByZWFsIHRhYmxlcyAoYWRkaXRpdmUgRERMIFx1MjAxNCBuZXZlciBkcm9wcyBkYXRhKS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gYXBwbHlQYWNrU2NoZW1hU3RlcChpbnB1dCwgZGVmaW5pdGlvbnMpIHtcbiAgICByZXR1cm4gd2l0aFBnQ2xpZW50KGlucHV0LmRiVXJsLCAoZGIpPT5hcHBseVBhY2tTY2hlbWEoZGIsIGRlZmluaXRpb25zKSk7XG59XG4vKiogRW1pdCBvbmUgcHJvZ3Jlc3MgY2h1bmsgZnJvbSBhIHN0ZXAgY29udGV4dC4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVtaXRQcm9ncmVzc1N0ZXAod3JpdGFibGUsIGNodW5rKSB7XG4gICAgYXdhaXQgd3JpdGVQcm9ncmVzc0NodW5rKHdyaXRhYmxlLCBjaHVuayk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0ZXAod3JpdGFibGUpIHtcbiAgICBhd2FpdCBjbG9zZVByb2dyZXNzU3RyZWFtKHdyaXRhYmxlKTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2RlY29tcG9zZVBhY2tTdGVwXCIsIGRlY29tcG9zZVBhY2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2xvYWRLbm93bGVkZ2VCYXNlU3RlcFwiLCBsb2FkS25vd2xlZGdlQmFzZVN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vZ2VuZXJhdGVBcHBTdGVwXCIsIGdlbmVyYXRlQXBwU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9jb21waWxlQXBwUGFja1N0ZXBcIiwgY29tcGlsZUFwcFBhY2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL21hdGVyaWFsaXplQXBwUGFja1N0ZXBcIiwgbWF0ZXJpYWxpemVBcHBQYWNrU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL2FwcC1wYWNrLWdlbmVyYXRlL3N0ZXBzLy9hcHBseVBhY2tTY2hlbWFTdGVwXCIsIGFwcGx5UGFja1NjaGVtYVN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy9hcHAtcGFjay1nZW5lcmF0ZS9zdGVwcy8vZW1pdFByb2dyZXNzU3RlcFwiLCBlbWl0UHJvZ3Jlc3NTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3MvYXBwLXBhY2stZ2VuZXJhdGUvc3RlcHMvL2Nsb3NlUHJvZ3Jlc3NTdGVwXCIsIGNsb3NlUHJvZ3Jlc3NTdGVwKTtcbiIsICIvKipcbiAqIEFwcCBQYWNrIFx1MjAxNCBBSSBHZW5lcmF0b3JcbiAqXG4gKiBUd28tc3RhZ2UgQUkgZ2VuZXJhdGlvbiB1c2luZyB0aGUgVmVyY2VsIEFJIFNESyBgZ2VuZXJhdGVPYmplY3QoKWA6XG4gKlxuICogICBTdGFnZSAxIFx1MjAxNCBERUNPTVBPU0U6IHRoZSBwbGF0Zm9ybSBhZG1pbidzIHJlcXVpcmVtZW50IGlzIHR1cm5lZCBpbnRvIGFcbiAqICAgICAgICAgICAgIHN0cnVjdHVyZWQgcGFjayBkZWZpbml0aW9uIChhcHBzIHBlciBkZXBhcnRtZW50ICsgQ0VPIG92ZXJ2aWV3KS5cbiAqICAgU3RhZ2UgMiBcdTIwMTQgR0VORVJBVEUgKHBlciBhcHApOiBlYWNoIGRlcGFydG1lbnQgYXBwIGdldHMgYSBmdWxsIGRlZmluaXRpb246XG4gKiAgICAgICAgICAgICBXM0MtYWxpZ25lZCBtb2RlbHMsIHVzZSBjYXNlcywgcGFnZXMsIG5hdiwgVVggd29ya2Zsb3cgYW5kXG4gKiAgICAgICAgICAgICBrbm93bGVkZ2Ugc25pcHBldHMgXHUyMDE0IGdyb3VuZGVkIGluIHRoZSBwbGF0Zm9ybSBrbm93bGVkZ2UgYmFzZSBhbmRcbiAqICAgICAgICAgICAgIHRoZSBXM0MgWFNEIHN0YW5kYXJkIGZvciBpdHMgdGVtcGxhdGUuXG4gKlxuICogYG1vY2sqYCB2YXJpYW50cyByZXR1cm4gZGV0ZXJtaW5pc3RpYyByZXN1bHRzIGZvciB0ZXN0aW5nIHdpdGhvdXQgYW4gQUkga2V5LlxuICovIGltcG9ydCB7IGdlbmVyYXRlT2JqZWN0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgYXBwUGFja0RlY29tcG9zaXRpb25ab2QsIGFwcFBhY2tBcHBEZWZpbml0aW9uWm9kIH0gZnJvbSAnLi9hcHAtcGFjay1zY2hlbWEnO1xuLy8gXHUyNTAwXHUyNTAwIFczQyBYU0QgU3RhbmRhcmRzICsgc2NoZW1hLm9yZyB0eXBlcyBwZXIgdGVtcGxhdGUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5jb25zdCBXM0NfU1RBTkRBUkRTID0ge1xuICAgICdmaW5hbmNpYWwtYW5hbHl0aWNzJzogJ0ZwTUwgKEZpbmFuY2lhbCBQcm9kdWN0cyBNYXJrdXAgTGFuZ3VhZ2UpIGZvciBkZXJpdmF0aXZlcyBhbmQgRklYTUwgZm9yIHJlYWwtdGltZSBmaW5hbmNpYWwgaW5mb3JtYXRpb24gZXhjaGFuZ2UnLFxuICAgIHJlc3RhdXJhbnQ6ICdVQkwgKFVuaXZlcnNhbCBCdXNpbmVzcyBMYW5ndWFnZSkgZm9yIGludm9pY2VzL29yZGVycyBhbmQgR1MxIGZvciBwcm9kdWN0L1NLVSBkYXRhJyxcbiAgICBob3RlbDogJ09UQSAoT3BlblRyYXZlbCBBbGxpYW5jZSkgZm9yIHJvb20gYm9va2luZ3MgYW5kIGF2YWlsYWJpbGl0eScsXG4gICAgJ2Vjb21tZXJjZS1yZXRhaWwnOiAnVUJMIGZvciBlbGVjdHJvbmljIG9yZGVycyBhbmQgSW52ZW50b3J5IEZlZWRzIGZvciBTS1UvcHJpY2luZyBjb25zdHJhaW50cycsXG4gICAgaGVhbHRoY2FyZTogJ0hMNy9DREEgZm9yIGVsZWN0cm9uaWMgaGVhbHRoIHJlY29yZHMgYW5kIGNsYWltcyBwcm9jZXNzaW5nIHZhbGlkYXRpb24nLFxuICAgICdzdXBwbHktY2hhaW4nOiAnVUJMIGZvciBzaGlwcGluZyBub3RpY2VzIGFuZCBCMkIgbG9naXN0aWNzIG1hbmlmZXN0IGRvY3VtZW50cycsXG4gICAgJ3JlYWwtZXN0YXRlJzogJ1JFVFMgKFJlYWwgRXN0YXRlIFRyYW5zYWN0aW9uIFN0YW5kYXJkKSBmb3IgcHJvcGVydHkgbGlzdGluZ3MnLFxuICAgIGVkdWNhdGlvbjogJ0lNUyBHbG9iYWwgKExUSSwgUVRJKSBmb3IgbGVhcm5pbmcgdG9vbHMgaW50ZXJvcGVyYWJpbGl0eSBhbmQgYXNzZXNzbWVudCcsXG4gICAgJ3Byb2Zlc3Npb25hbC1zZXJ2aWNlcyc6ICdVQkwgZm9yIGJpbGxpbmcvaW52b2ljZXMgYW5kIHByb2plY3QgbWFuYWdlbWVudCBkYXRhJyxcbiAgICBtYW51ZmFjdHVyaW5nOiAnQjJNTUwgKEJ1c2luZXNzIFRvIE1hbnVmYWN0dXJpbmcgTWFya3VwIExhbmd1YWdlKSBmb3IgcHJvZHVjdGlvbiBkYXRhJyxcbiAgICAnc3Bhcy1hbmQtd2VsbG5lc3MnOiAnSEw3IGZvciBhcHBvaW50bWVudCBzY2hlZHVsaW5nIGFuZCBjbGllbnQgaGVhbHRoIHJlY29yZHMsIElTTyAxOTAxMSBmb3Igd2VsbG5lc3Mgc2VydmljZSBxdWFsaXR5IG1hbmFnZW1lbnQnXG59O1xuY29uc3QgU0NIRU1BX09SR19UWVBFUyA9IHtcbiAgICAnZmluYW5jaWFsLWFuYWx5dGljcyc6ICdGaW5hbmNpYWxTZXJ2aWNlJyxcbiAgICByZXN0YXVyYW50OiAnUmVzdGF1cmFudCcsXG4gICAgaG90ZWw6ICdIb3RlbCcsXG4gICAgJ2Vjb21tZXJjZS1yZXRhaWwnOiAnU3RvcmUnLFxuICAgIGhlYWx0aGNhcmU6ICdNZWRpY2FsT3JnYW5pemF0aW9uJyxcbiAgICAnc3VwcGx5LWNoYWluJzogJ0RlbGl2ZXJ5RXZlbnQnLFxuICAgICdyZWFsLWVzdGF0ZSc6ICdSZWFsRXN0YXRlQWdlbnQnLFxuICAgIGVkdWNhdGlvbjogJ0VkdWNhdGlvbmFsT3JnYW5pemF0aW9uJyxcbiAgICAncHJvZmVzc2lvbmFsLXNlcnZpY2VzJzogJ1Byb2Zlc3Npb25hbFNlcnZpY2UnLFxuICAgIG1hbnVmYWN0dXJpbmc6ICdNYW51ZmFjdHVyZXInLFxuICAgICdzcGFzLWFuZC13ZWxsbmVzcyc6ICdIZWFsdGhBbmRCZWF1dHlCdXNpbmVzcydcbn07XG4vLyBOT1RFOiBtdXN0IHN0YXkgYSBzdWJzZXQgb2YgdGhlIFplblN0YWNrIEJsb2NrVHlwZSBlbnVtIGluXG4vLyB6ZW5zdGFjay9zY2hlbWEuem1vZGVsIFx1MjAxNCBkeW5hbWljX2Zvcm0gaXMgTk9UIGEgdmFsaWQgZW51bSB2YWx1ZSwgc28gbW9kZWxcbi8vIENSVUQgc3VyZmFjZXMgYXJlIGV4cHJlc3NlZCB3aXRoIG9wc19hZG1pbl90YWJzIC8gZG9jX21hcmtkb3duIGluc3RlYWQuXG5jb25zdCBBVkFJTEFCTEVfQkxPQ0tTID0gW1xuICAgICdoZXJvJyxcbiAgICAna3BpX2NhcmRzJyxcbiAgICAnbWV0cmljX2dyaWQnLFxuICAgICdjaGFydF9maW5hbmNpYWwnLFxuICAgICdsZXZlcl9hY2NvcmRpb24nLFxuICAgICdhY3Rpb25fY2hlY2tsaXN0JyxcbiAgICAnZG9jX21hcmtkb3duJyxcbiAgICAncG5sX3RhYmxlJyxcbiAgICAnb3BzX2FkbWluX3RhYnMnLFxuICAgICd6X3JlcG9ydF9mb3JtJyxcbiAgICAnY29zdHNfZm9ybScsXG4gICAgJ2NhbGVuZGFyX2ltcG9ydCcsXG4gICAgJ2NoYXRfcGFuZWwnLFxuICAgICdyZXZpZXdfYmxvY2tzJyxcbiAgICAncmVwb3J0c19yb2xsdXAnLFxuICAgICdzaGVldF92aWV3ZXInXG5dO1xuY29uc3QgQVVUSF9USUVSUyA9IFtcbiAgICAncHVibGljJyxcbiAgICAncGluJyxcbiAgICAnZ29vZ2xlJ1xuXTtcbmNvbnN0IE1PREVMID0gJ2dwdC01LjUnO1xuLy8gXHUyNTAwXHUyNTAwIFN0YWdlIDE6IGRlY29tcG9zZSB0aGUgcmVxdWlyZW1lbnQgaW50byBhcHBzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gYnVpbGREZWNvbXBvc2VTeXN0ZW1Qcm9tcHQoX2tub3dsZWRnZUJhc2UpIHtcbiAgICByZXR1cm4gYFlvdSBhcmUgdGhlIGNoaWVmIHNvbHV0aW9uIGFyY2hpdGVjdCBvZiBhIHRlbmFudCBhcHBsaWNhdGlvbiBwbGF0Zm9ybS5cblxuQSBwbGF0Zm9ybSBhZG1pbmlzdHJhdG9yIHdpbGwgZGVzY3JpYmUgYSBidXNpbmVzcyBuZWVkLiBEZWNvbXBvc2UgaXQgaW50byBhXG5jb2hlcmVudCBcImFwcGxpY2F0aW9uIHBhY2tcIjogb25lIGFwcGxpY2F0aW9uIHBlciBidXNpbmVzcyBkZXBhcnRtZW50LCBwbHVzIGFcbkNFTyBPdmVydmlldyBhcHBsaWNhdGlvbiB0aGF0IHNwYW5zIGFsbCBvZiB0aGVtLlxuXG4jIyBSdWxlc1xuXG4xLiAqKkFwcHMgcGVyIGRlcGFydG1lbnQqKjogQ3JlYXRlIG9uZSBhcHAgZm9yIGV2ZXJ5IGRpc3RpbmN0IGRlcGFydG1lbnQgaW4gdGhlXG4gICByZXF1aXJlbWVudCAoZS5nLiBIUiwgTWFya2V0aW5nL01lbWJlcnNoaXBzLCBTYWxlcyBSZXBvcnRpbmcsIEVjb21tZXJjZVxuICAgTWFya2V0cGxhY2UsIFJlZmVycmFscyBNYW5hZ2VtZW50LCBCYWNrIE9mZmljZSBSZXBvcnRpbmcsIExlZ2FsIEFkaGVyZW5jZSxcbiAgIEZpbmFuY2UvUmVwb3J0aW5nL1RyYWNraW5nLCBCYWNrIE9mZmljZSBNYW5hZ2VtZW50LCBDb21wbGlhbmNlLCBDRU8gT3ZlcnZpZXcpLlxuICAgSWYgdGhlIHJlcXVpcmVtZW50IG5hbWVzIGRlcGFydG1lbnRzIGV4cGxpY2l0bHksIGNvdmVyIEFMTCBvZiB0aGVtLlxuMi4gKipBcHAgaWRzKio6IGtlYmFiLWNhc2UsIHNob3J0IChlLmcuIFwiaHJcIiwgXCJzYWxlcy1yZXBvcnRpbmdcIiwgXCJjZW8tb3ZlcnZpZXdcIikuXG4zLiAqKnRlbXBsYXRlSWQqKjogcGljayB0aGUgYmVzdCBmaXQgZnJvbSB0aGUgdGVtcGxhdGUgY2F0YWxvZzpcbiAgICR7T2JqZWN0LmtleXMoVzNDX1NUQU5EQVJEUykuam9pbignLCAnKX1cbiAgIENFTyBPdmVydmlldyBzaG91bGQgdXNlIFwiZmluYW5jaWFsLWFuYWx5dGljc1wiIChpdCBkcml2ZXMgdHJhbnNwYXJlbmN5LFxuICAgaW5zaWdodCBhbmQgcmVhbHRpbWUgYWN0aW9uYWJsZSBpdGVtcyBmcm9tIGV2ZXJ5IGRlcGFydG1lbnQpLlxuNC4gKipDRU8gT3ZlcnZpZXcgYXBwKio6IE1VU1QgYmUgaW5jbHVkZWQgYXMgdGhlIGxhc3QgYXBwLiBJdHMgc3VtbWFyeSBtdXN0XG4gICBzdGF0ZSB0aGF0IGl0IGhhcyBhY2Nlc3MgdG8gZXZlcnkgZGVwYXJ0bWVudCBhcHAncyBrbm93bGVkZ2UgYmFzZSBhbmRcbiAgIHN1cmZhY2VzIGNyb3NzLWRlcGFydG1lbnQgS1BJcywgdHJhbnNwYXJlbmN5LCBlZmZpY2llbmN5IGFuZCBhY3Rpb25hYmxlXG4gICBpbnNpZ2h0cy5cbjUuICoqQ292ZXJhZ2UqKjogVGhlIGFwcHMgbXVzdCB0b2dldGhlciBjb3ZlciB0aGUgY29tcGxldGUgcmVxdWlyZW1lbnQgXHUyMDE0IG5vXG4gICBkZXBhcnRtZW50IG1lbnRpb25lZCBpbiB0aGUgcmVxdWlyZW1lbnQgbWF5IGJlIG1pc3NpbmcuXG42LiAqKlBhY2sgaWRzKio6IGtlYmFiLWNhc2UsIGUuZy4gXCJvcHMtZGVwYXJ0bWVudC1wYWNrXCIuXG5cbiMjIE91dHB1dFxuXG5SZXR1cm4gdGhlIHBhY2sgZGVjb21wb3NpdGlvbjogaWQsIG5hbWUsIGRlc2NyaXB0aW9uLCBwZXItYXBwIGJyaWVmcyBhbmQgdGhlXG5DRU8gb3ZlcnZpZXcgcHVycG9zZSArIEtQSXMuYDtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNvbXBvc2VQYWNrRnJvbVByb21wdCh1c2VyUHJvbXB0LCBrbm93bGVkZ2VCYXNlKSB7XG4gICAgY29uc3QgeyBvYmplY3QgfSA9IGF3YWl0IGdlbmVyYXRlT2JqZWN0KHtcbiAgICAgICAgbW9kZWw6IG9wZW5haShNT0RFTCksXG4gICAgICAgIHNjaGVtYTogYXBwUGFja0RlY29tcG9zaXRpb25ab2QsXG4gICAgICAgIHN5c3RlbTogYnVpbGREZWNvbXBvc2VTeXN0ZW1Qcm9tcHQoa25vd2xlZGdlQmFzZSksXG4gICAgICAgIHByb21wdDogdXNlclByb21wdCxcbiAgICAgICAgdGVtcGVyYXR1cmU6IDAuMlxuICAgIH0pO1xuICAgIHJldHVybiBvYmplY3Q7XG59XG4vLyBcdTI1MDBcdTI1MDAgU3RhZ2UgMjogZ2VuZXJhdGUgYSBmdWxsIGRlZmluaXRpb24gZm9yIG9uZSBhcHAgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5mdW5jdGlvbiBidWlsZEFwcFN5c3RlbVByb21wdChicmllZiwgY2VvUHVycG9zZSwgY2VvS3BpcywgYWxsQXBwcywga25vd2xlZGdlQmFzZSkge1xuICAgIGNvbnN0IHczY1N0YW5kYXJkID0gVzNDX1NUQU5EQVJEU1ticmllZi50ZW1wbGF0ZUlkXSA/PyAnc2NoZW1hLm9yZyc7XG4gICAgY29uc3Qgc2NoZW1hT3JnVHlwZSA9IFNDSEVNQV9PUkdfVFlQRVNbYnJpZWYudGVtcGxhdGVJZF0gPz8gJ0xvY2FsQnVzaW5lc3MnO1xuICAgIHJldHVybiBgWW91IGFyZSBhIFczQyBzY2hlbWEgYXJjaGl0ZWN0LCBaZW5TdGFjayBPUk0gZXhwZXJ0IGFuZCBwcm9kdWN0IGRlc2lnbmVyLlxuXG5EZXNpZ24gdGhlIFwiJHticmllZi5uYW1lfVwiIGFwcGxpY2F0aW9uIChkZXBhcnRtZW50OiAke2JyaWVmLmRlcGFydG1lbnR9KSBmb3IgYVxudGVuYW50IGFwcCBwbGF0Zm9ybS4gSXQgaXMgb25lIGFwcCBpbnNpZGUgYSBwYWNrOyB0aGUgcGFjayBhbHNvIGNvbnRhaW5zOlxuJHthbGxBcHBzLm1hcCgoYSk9PmAtICR7YS5uYW1lfSAoJHthLmRlcGFydG1lbnR9KWApLmpvaW4oJ1xcbicpfVxuXG5UaGUgQ0VPIE92ZXJ2aWV3IGFwcCBleGlzdHMgc28gbGVhZGVyc2hpcCBjYW4gc2VlIGludG8gZXZlcnkgZGVwYXJ0bWVudCBcdTIwMTRcbmRlc2lnbiB0aGlzIGFwcCBzbyBpdHMgZGF0YSwgcGFnZXMgYW5kIGtub3dsZWRnZSBmZWVkIHRoYXQgdHJhbnNwYXJlbmN5LlxuXG4jIyBSdWxlc1xuXG4xLiAqKlczQyBYU0QqKjogVXNlICR7dzNjU3RhbmRhcmR9IGZvciBmaWVsZCB0eXBlcyBhbmQgdmFsaWRhdGlvbiBjb25zdHJhaW50cy5cbjIuICoqc2NoZW1hLm9yZyBtYXBwaW5nKio6IE1hcCBmaWVsZHMgdG8gc2NoZW1hLm9yZyBwcm9wZXJ0aWVzIChzY2hlbWFPcmdQcm9wZXJ0eSkuXG4zLiAqKkJhc2UgZmllbGRzIGF1dG8tYWRkZWQqKjogaWQsIHRlbmFudFNsdWcsIGNyZWF0ZWRBdCwgdXBkYXRlZEF0IGFyZSBhZGRlZFxuICAgYXV0b21hdGljYWxseSBcdTIwMTQgbmV2ZXIgaW5jbHVkZSB0aGVtIGluIHRoZSBmaWVsZHMgYXJyYXkuXG40LiAqKk1vbmV0YXJ5IHZhbHVlcyoqOiBkZWNpbWFsIHR5cGUgd2l0aCBzY2hlbWFPcmdQcm9wZXJ0eSBcIm9mZmVycy5wcmljZVwiLlxuNS4gKipTdGF0dXMgZmllbGRzKio6IGVudW0gd2l0aCBtZWFuaW5nZnVsIGVudW1WYWx1ZXMgKHBlbmRpbmcsIGFjdGl2ZSwgLi4uKS5cbjYuICoqTW9kZWxzKio6IDMtOCBtb2RlbHMgZGVwZW5kaW5nIG9uIHRoZSBkZXBhcnRtZW50J3MgY29tcGxleGl0eS5cbjcuICoqVXNlIGNhc2VzKio6IFVDLVhYWC1OTiBmb3JtYXQ7IGF1dGg6ICR7QVVUSF9USUVSUy5qb2luKCcvJyl9IChwdWJsaWMgPVxuICAgY3VzdG9tZXItZmFjaW5nLCBwaW4gPSBzdGFmZi9vcHMsIGdvb2dsZSA9IGV4ZWMvbGVhZGVyc2hpcCkuXG44LiAqKlBhZ2VzKio6IHNsdWdzIHByZWZpeGVkIHdpdGggdGhlIGFwcCBpZCAoZS5nLiBcIi9oci9lbXBsb3llZXNcIik7IGJsb2NrVHlwZXNcbiAgIGZyb206ICR7QVZBSUxBQkxFX0JMT0NLUy5qb2luKCcsICcpfS4gVXNlIFwib3BzX2FkbWluX3RhYnNcIiBmb3IgbW9kZWxcbiAgIENSVUQvYWRtaW4gc3VyZmFjZXMsIFwia3BpX2NhcmRzXCIvXCJjaGFydF9maW5hbmNpYWxcIi9cInJlcG9ydHNfcm9sbHVwXCIgZm9yXG4gICByZXBvcnRpbmcsIFwiYWN0aW9uX2NoZWNrbGlzdFwiIGZvciBhY3Rpb25hYmxlIGl0ZW1zLCBcImRvY19tYXJrZG93blwiIGZvclxuICAgcG9saWNpZXMsIFwic2hlZXRfdmlld2VyXCIgZm9yIHJhdyBkYXRhLlxuOS4gKipOYXYqKjogb25lIG5hdiBzZWN0aW9uIHBlciBhcHAgd2l0aCBhIGNsZWFyIGxhYmVsICsgaWNvbiBoaW50OyBwYWdlcyBsaXN0LlxuMTAuICoqVVggd29ya2Zsb3cqKjogMi01IHN0YWdlcyBkZXNjcmliaW5nIHRoZSBlbmQtdG8tZW5kIHVzZXIgam91cm5leSBpbnNpZGVcbiAgICB0aGUgYXBwIChlLmcuIE9uYm9hcmRpbmcgXHUyMTkyIERhaWx5IE9wcyBcdTIxOTIgUmV2aWV3KSwgZWFjaCB3aXRoIGNvbmNyZXRlIGFjdGlvbnNcbiAgICAoY3JlYXRlL3JlYWQvdXBkYXRlL2FwcHJvdmUvZXhwb3J0L25vdGlmeS9yZXZpZXcpIHBvaW50aW5nIGF0IHJlYWwgcGFnZXMuXG4xMS4gKipLbm93bGVkZ2Ugc25pcHBldHMqKjogMy02IHNuaXBwZXRzIChrZXksIHRpdGxlLCBjb250ZW50IGluIG1hcmtkb3duKSBcdTIwMTRcbiAgICBwb2xpY2llcywgc3RlcC1ieS1zdGVwIHByb2NlZHVyZXMsIGRlZmluaXRpb25zIGFuZCBndWlkYW5jZSBzcGVjaWZpYyB0b1xuICAgIHRoaXMgZGVwYXJ0bWVudCdzIGFwcC4gVGhlc2UgZm9ybSB0aGUgYXBwJ3Mga25vd2xlZGdlIGJhc2UuXG4xMi4gKipzY2hlbWEub3JnIHR5cGUqKjogcHJpbWFyeSB0eXBlIGlzIFwiJHtzY2hlbWFPcmdUeXBlfVwiLlxuMTMuICoqVGFibGUgbmFtZXMqKjogc25ha2VfY2FzZSBwbHVyYWw7ICoqZmllbGQgbmFtZXMqKjogY2FtZWxDYXNlLlxuMTQuICoqRmllbGQgd2lkdGgqKjogMTIgZnVsbC13aWR0aCwgNiBoYWxmLXdpZHRoLCA0IHRoaXJkLXdpZHRoLlxuXG4jIyBLbm93bGVkZ2UgYmFzZSAocGxhdGZvcm0gY29udGV4dClcblxuJHtrbm93bGVkZ2VCYXNlID8ga25vd2xlZGdlQmFzZSA6ICcobm9uZSBwcm92aWRlZCBcdTIwMTQgdXNlIGdlbmVyYWwgYmVzdCBwcmFjdGljZXMpJ31cblxuIyMgQ0VPIGNvbnRleHRcblxuVGhlIENFTyBPdmVydmlldyBhcHAgcHVycG9zZTogJHtjZW9QdXJwb3NlfVxuQ0VPIEtQSXMgKHRoaXMgYXBwJ3MgZGF0YSBzaG91bGQgc3VwcG9ydCB0aGVzZSk6ICR7Y2VvS3Bpcy5qb2luKCcsICcpfVxuXG4jIyBPdXRwdXRcblxuUmV0dXJuIHRoZSBjb21wbGV0ZSBhcHAgZGVmaW5pdGlvbiAobW9kZWxzLCB1c2UgY2FzZXMsIHBhZ2VzLCBuYXYsIFVYIHdvcmtmbG93LFxua25vd2xlZGdlIHNuaXBwZXRzKS5gO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlQXBwRGVmaW5pdGlvbihicmllZiwgY2VvUHVycG9zZSwgY2VvS3BpcywgYWxsQXBwcywga25vd2xlZGdlQmFzZSkge1xuICAgIGNvbnN0IHsgb2JqZWN0IH0gPSBhd2FpdCBnZW5lcmF0ZU9iamVjdCh7XG4gICAgICAgIG1vZGVsOiBvcGVuYWkoTU9ERUwpLFxuICAgICAgICBzY2hlbWE6IGFwcFBhY2tBcHBEZWZpbml0aW9uWm9kLFxuICAgICAgICBzeXN0ZW06IGJ1aWxkQXBwU3lzdGVtUHJvbXB0KGJyaWVmLCBjZW9QdXJwb3NlLCBjZW9LcGlzLCBhbGxBcHBzLCBrbm93bGVkZ2VCYXNlKSxcbiAgICAgICAgcHJvbXB0OiBgRGVzaWduIHRoZSBcIiR7YnJpZWYubmFtZX1cIiBhcHBsaWNhdGlvbiBpbiBmdWxsIGRldGFpbC5gLFxuICAgICAgICB0ZW1wZXJhdHVyZTogMC4yXG4gICAgfSk7XG4gICAgcmV0dXJuIG9iamVjdDtcbn1cbi8vIFx1MjUwMFx1MjUwMCBNb2NrIHZhcmlhbnRzIChkZXRlcm1pbmlzdGljLCBubyBBSSBrZXkgbmVlZGVkKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmV4cG9ydCBmdW5jdGlvbiBtb2NrRGVjb21wb3NlUGFjaygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwYWNrSWQ6ICdtYXNzYWdlLW9wZXJhdGlvbnMtcGFjaycsXG4gICAgICAgIG5hbWU6ICdNYXNzYWdlIFNwYSBPcGVyYXRpb25zIFBhY2snLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ01hc3NhZ2Ugc3BhIG9wZXJhdGlvbnMgYXBwIHBhY2s6IEFwcG9pbnRtZW50cyAmIEJvb2tpbmcsIENsaWVudCBSZWNvcmRzLCBUaGVyYXBpc3QgTWFuYWdlbWVudCwgU3BhIEZpbmFuY2UsIGFuZCBPd25lciBEYXNoYm9hcmQgd2l0aCBjcm9zcy1kZXBhcnRtZW50IEtQSXMuJyxcbiAgICAgICAgYXBwczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnYXBwb2ludG1lbnRzLWJvb2tpbmcnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdBcHBvaW50bWVudHMgJiBCb29raW5nJyxcbiAgICAgICAgICAgICAgICBkZXBhcnRtZW50OiAnT3BlcmF0aW9ucycsXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogJ1NjaGVkdWxlIGFuZCBtYW5hZ2UgbWFzc2FnZSBhcHBvaW50bWVudHMgd2l0aCBjbGllbnRzLicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVJZDogJ3NwYXMtYW5kLXdlbGxuZXNzJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ2NsaWVudC1yZWNvcmRzJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnQ2xpZW50IFJlY29yZHMnLFxuICAgICAgICAgICAgICAgIGRlcGFydG1lbnQ6ICdPcGVyYXRpb25zJyxcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiAnTWFpbnRhaW4gY2xpZW50IHByb2ZpbGVzLCBwcmVmZXJlbmNlcywgYW5kIHNlcnZpY2UgaGlzdG9yeS4nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlSWQ6ICdzcGFzLWFuZC13ZWxsbmVzcydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICd0aGVyYXBpc3QtbWFuYWdlbWVudCcsXG4gICAgICAgICAgICAgICAgbmFtZTogJ1RoZXJhcGlzdCBNYW5hZ2VtZW50JyxcbiAgICAgICAgICAgICAgICBkZXBhcnRtZW50OiAnT3BlcmF0aW9ucycsXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogJ01hbmFnZSB0aGVyYXBpc3Qgc2NoZWR1bGVzLCBxdWFsaWZpY2F0aW9ucywgYW5kIHBlcmZvcm1hbmNlLicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVJZDogJ3NwYXMtYW5kLXdlbGxuZXNzJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ3NwYS1maW5hbmNlJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnU3BhIEZpbmFuY2UnLFxuICAgICAgICAgICAgICAgIGRlcGFydG1lbnQ6ICdGaW5hbmNlJyxcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiAnVHJhY2sgc3BhIHJldmVudWUsIGV4cGVuc2VzLCBhbmQgZmluYW5jaWFsIHJlcG9ydHMuJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUlkOiAnZmluYW5jaWFsLWFuYWx5dGljcydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICdvd25lci1kYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdPd25lciBEYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgIGRlcGFydG1lbnQ6ICdFeGVjdXRpdmUgTGVhZGVyc2hpcCcsXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogJ0Nyb3NzLWRlcGFydG1lbnQgdHJhbnNwYXJlbmN5IGRhc2hib2FyZCB3aXRoIGFjY2VzcyB0byBldmVyeSBkZXBhcnRtZW50IGtub3dsZWRnZSBiYXNlIGFuZCByZWFsdGltZSBhY3Rpb25hYmxlIGl0ZW1zLicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVJZDogJ2ZpbmFuY2lhbC1hbmFseXRpY3MnXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGNlb092ZXJ2aWV3OiB7XG4gICAgICAgICAgICBwdXJwb3NlOiAnQWdncmVnYXRlIEtQSXMgYW5kIGtub3dsZWRnZSBmcm9tIGV2ZXJ5IGRlcGFydG1lbnQgYXBwIGludG8gYSBzaW5nbGUgbGVhZGVyc2hpcCBvdmVydmlldyB3aXRoIGFjdGlvbmFibGUgaXRlbXMuJyxcbiAgICAgICAgICAgIGtwaXM6IFtcbiAgICAgICAgICAgICAgICAncmV2ZW51ZScsXG4gICAgICAgICAgICAgICAgJ2dyb3NzTWFyZ2luJyxcbiAgICAgICAgICAgICAgICAnaGVhZGNvdW50JyxcbiAgICAgICAgICAgICAgICAnc2FsZXNUYXJnZXRBY2hpZXZlbWVudCcsXG4gICAgICAgICAgICAgICAgJ2Nhc2hmbG93JyxcbiAgICAgICAgICAgICAgICAnY29tcGxpYW5jZVN0YXR1cydcbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gbW9ja0dlbmVyYXRlQXBwRGVmaW5pdGlvbihicmllZikge1xuICAgIGNvbnN0IG1vZGVsTmFtZSA9IGJyaWVmLmlkID09PSAnYXBwb2ludG1lbnRzLWJvb2tpbmcnID8gJ0FwcG9pbnRtZW50JyA6IGJyaWVmLmlkID09PSAnY2xpZW50LXJlY29yZHMnID8gJ0NsaWVudCcgOiBicmllZi5pZCA9PT0gJ3RoZXJhcGlzdC1tYW5hZ2VtZW50JyA/ICdUaGVyYXBpc3QnIDogYnJpZWYuaWQgPT09ICdzcGEtZmluYW5jZScgPyAnRmluYW5jaWFsUmVjb3JkJyA6ICdEZXBhcnRtZW50S3BpJztcbiAgICBjb25zdCB0YWJsZU5hbWUgPSBgJHttb2RlbE5hbWUucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxXyQyJykudG9Mb3dlckNhc2UoKX1zYDtcbiAgICByZXR1cm4ge1xuICAgICAgICBhcHBJZDogYnJpZWYuaWQsXG4gICAgICAgIGFwcE5hbWU6IGJyaWVmLm5hbWUsXG4gICAgICAgIGRlcGFydG1lbnQ6IGJyaWVmLmRlcGFydG1lbnQsXG4gICAgICAgIHczY1N0YW5kYXJkOiBXM0NfU1RBTkRBUkRTW2JyaWVmLnRlbXBsYXRlSWRdID8/ICdzY2hlbWEub3JnJyxcbiAgICAgICAgc2NoZW1hT3JnVHlwZTogU0NIRU1BX09SR19UWVBFU1ticmllZi50ZW1wbGF0ZUlkXSA/PyAnTG9jYWxCdXNpbmVzcycsXG4gICAgICAgIG1vZGVsczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6IG1vZGVsTmFtZSxcbiAgICAgICAgICAgICAgICB0YWJsZU5hbWUsXG4gICAgICAgICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICduYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2hlbWFPcmdQcm9wZXJ0eTogJ25hbWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdOYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxMlxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbnVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW51bVZhbHVlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXJjaGl2ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdGF0dXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDZcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ25vdGVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTm90ZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEyXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHVzZUNhc2VzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6IGBVQy0ke2JyaWVmLmlkLnRvVXBwZXJDYXNlKCkuc2xpY2UoMCwgNCl9LTAxYCxcbiAgICAgICAgICAgICAgICB0aXRsZTogYE1hbmFnZSAke2JyaWVmLm5hbWV9IHJlY29yZHNgLFxuICAgICAgICAgICAgICAgIGF1dGg6ICdwaW4nLFxuICAgICAgICAgICAgICAgIHJvdXRlOiBgLyR7YnJpZWYuaWR9YCxcbiAgICAgICAgICAgICAgICBibG9ja1R5cGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICdvcHNfYWRtaW5fdGFicydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIG1vZGVsczogW1xuICAgICAgICAgICAgICAgICAgICBtb2RlbE5hbWVcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHBhZ2VzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc2x1ZzogYCR7YnJpZWYuaWR9YCxcbiAgICAgICAgICAgICAgICB0aXRsZTogYnJpZWYubmFtZSxcbiAgICAgICAgICAgICAgICBhdXRoVGllcjogJ3BpbicsXG4gICAgICAgICAgICAgICAgYmxvY2tUeXBlczogW1xuICAgICAgICAgICAgICAgICAgICAna3BpX2NhcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgJ29wc19hZG1pbl90YWJzJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgbmF2TGFiZWw6IGJyaWVmLm5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgbmF2OiB7XG4gICAgICAgICAgICBsYWJlbDogYnJpZWYubmFtZSxcbiAgICAgICAgICAgIGljb246ICdEYXNoYm9hcmQnLFxuICAgICAgICAgICAgcGFnZXM6IFtcbiAgICAgICAgICAgICAgICBicmllZi5pZFxuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB1eFdvcmtmbG93OiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3RhZ2U6ICdEYWlseSBvcGVyYXRpb25zJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlY29yZCBhbmQgcmV2aWV3IGRhaWx5IGVudHJpZXMnLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBgT3BlbiAke2JyaWVmLm5hbWV9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhZ2U6IGAvJHticmllZi5pZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uVHlwZTogJ25hdmlnYXRlJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdBZGQgcmVjb3JkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhZ2U6IGAvJHticmllZi5pZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TW9kZWw6IG1vZGVsTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblR5cGU6ICdjcmVhdGUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YWdlOiAnUmV2aWV3JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JldmlldyBhbmQgYXBwcm92ZSBlbnRyaWVzJyxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ0FwcHJvdmUgZW50cmllcycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYWdlOiBgLyR7YnJpZWYuaWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblR5cGU6ICdhcHByb3ZlJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdFeHBvcnQgcmVwb3J0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhZ2U6IGAvJHticmllZi5pZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uVHlwZTogJ2V4cG9ydCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAga25vd2xlZGdlU25pcHBldHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IGAke2JyaWVmLmlkfS1vdmVydmlld2AsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGAke2JyaWVmLm5hbWV9IFx1MjAxNCBPdmVydmlld2AsXG4gICAgICAgICAgICAgICAgY29udGVudDogYCMgJHticmllZi5uYW1lfVxcblxcblN0YW5kYXJkIG9wZXJhdGluZyBndWlkYW5jZSBmb3IgdGhlICR7YnJpZWYuZGVwYXJ0bWVudH0gYXBwOiByZWNvcmQgZW50cmllcyBkYWlseSwgcmV2aWV3IHdlZWtseSwgZXNjYWxhdGUgZXhjZXB0aW9ucyB0byB0aGUgQ0VPIE92ZXJ2aWV3IGRhc2hib2FyZC5gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogYCR7YnJpZWYuaWR9LWJlc3QtcHJhY3RpY2VzYCxcbiAgICAgICAgICAgICAgICB0aXRsZTogYCR7YnJpZWYubmFtZX0gXHUyMDE0IEJlc3QgUHJhY3RpY2VzYCxcbiAgICAgICAgICAgICAgICBjb250ZW50OiBgIyMgQmVzdCBQcmFjdGljZXNcXG5cXG4xLiBLZWVwIHJlY29yZHMgY3VycmVudCBkYWlseS5cXG4yLiBGbGFnIGFub21hbGllcyBpbW1lZGlhdGVseS5cXG4zLiBVc2UgdGhlIGFjdGlvbiBjaGVja2xpc3QgZm9yIGZvbGxvdy11cHMuYFxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcbn1cbiIsICIvKipcbiAqIEFwcCBQYWNrIFx1MjAxNCBab2Qgc2NoZW1hcyBmb3IgQUktZ2VuZXJhdGVkIFwiYXBwbGljYXRpb24gcGFja1wiIGRlZmluaXRpb25zLlxuICpcbiAqIEFuIGFwcGxpY2F0aW9uIHBhY2sgaXMgYSBjb2xsZWN0aW9uIG9mIGRlcGFydG1lbnQgYXBwbGljYXRpb25zIChIUixcbiAqIE1hcmtldGluZy9NZW1iZXJzaGlwcywgU2FsZXMgUmVwb3J0aW5nLCBFY29tbWVyY2UgTWFya2V0cGxhY2UsIFJlZmVycmFscyxcbiAqIEJhY2sgT2ZmaWNlLCBMZWdhbCwgRmluYW5jZSwgQ29tcGxpYW5jZSwgQ0VPIE92ZXJ2aWV3LCAuLi4pLiBFYWNoIGFwcCBpc1xuICogZnVsbHkgZGVyaXZlZCBieSBBSSBmcm9tIGEgbmF0dXJhbC1sYW5ndWFnZSByZXF1aXJlbWVudCBhbmQgY2FycmllczpcbiAqXG4gKiAgIDEuIFVzZSBjYXNlcyAgICAgICAgXHUyMDE0IFVDLVhYWC1OTiB3aXRoIGF1dGggdGllcnMgKyByb3V0ZXNcbiAqICAgMi4gVzMgU2NoZW1hICAgICAgICBcdTIwMTQgbW9kZWxzIHdpdGggVzNDIFhTRCBmaWVsZCB0eXBlcyArIHNjaGVtYS5vcmcgbWFwcGluZ3NcbiAqICAgMy4gWmVuU3RhY2sgICAgICAgICBcdTIwMTQgY29tcGlsZWQgZnJvbSB0aGUgbW9kZWxzIGF0IGJ1aWxkIHRpbWUgKHptb2RlbClcbiAqICAgNC4gVGVtcGxhdGVzICAgICAgICBcdTIwMTQgcGFnZSBibG9jayB0eXBlcyAoZHluYW1pY19mb3JtLCBrcGlfY2FyZHMsIC4uLilcbiAqICAgNS4gTmF2aWdhdGlvbmFsIER5bmFtaWMgUGFnZXMgXHUyMDE0IHNsdWdzLCBuYXYgc2VjdGlvbnMsIHNlY3VyaXR5IGdyb3Vwc1xuICogICA2LiBVWCBXb3JrZmxvdyAgICAgIFx1MjAxNCBzdGFnZXMgKyBhY3Rpb25zICh3aGF0IHRoZSB1c2VyIGRvZXMgaW4gdGhlIGFwcClcbiAqICAgNy4gS25vd2xlZGdlIFNuaXBwZXRzIFx1MjAxNCBwZXItYXBwIGtub3dsZWRnZSBiYXNlIGVudHJpZXNcbiAqXG4gKiBUaGUgQ0VPIE92ZXJ2aWV3IGFwcCBpcyBnZW5lcmF0ZWQgd2l0aCBjcm9zcy1hcHAgdmlzaWJpbGl0eTogaXRzIHBhZ2VzIGFuZFxuICoga25vd2xlZGdlIHJlZmVyZW5jZSBldmVyeSBkZXBhcnRtZW50IGFwcCBpbiB0aGUgcGFjay5cbiAqLyBpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNjaGVtYU1vZGVsWm9kLCB1c2VDYXNlWm9kLCBwYWdlWm9kIH0gZnJvbSAnQC9kb21haW4vYWkvc2NoZW1hLWdlbmVyYXRpb24tc2NoZW1hJztcbi8vIFx1MjUwMFx1MjUwMCBQYWNrLWxldmVsIChkZWNvbXBvc2l0aW9uKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmV4cG9ydCBjb25zdCBhcHBQYWNrQXBwQnJpZWZab2QgPSB6Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0FwcCBpZCBpbiBrZWJhYi1jYXNlLCBlLmcuIFwiaHJcIiBvciBcInNhbGVzLXJlcG9ydGluZ1wiJyksXG4gICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnSHVtYW4tcmVhZGFibGUgYXBwIG5hbWUsIGUuZy4gXCJIUiBNYW5hZ2VtZW50XCInKSxcbiAgICBkZXBhcnRtZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdCdXNpbmVzcyBkZXBhcnRtZW50IHRoaXMgYXBwIHNlcnZlcywgZS5nLiBcIkh1bWFuIFJlc291cmNlc1wiJyksXG4gICAgc3VtbWFyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnT25lLXBhcmFncmFwaCBkZXNjcmlwdGlvbiBvZiB3aGF0IHRoaXMgYXBwIGRvZXMnKSxcbiAgICB0ZW1wbGF0ZUlkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdCZXN0LWZpdCB0ZW1wbGF0ZSBpZCBmcm9tOiBmaW5hbmNpYWwtYW5hbHl0aWNzLCByZXN0YXVyYW50LCBob3RlbCwgZWNvbW1lcmNlLXJldGFpbCwgaGVhbHRoY2FyZSwgc3VwcGx5LWNoYWluLCByZWFsLWVzdGF0ZSwgZWR1Y2F0aW9uLCBwcm9mZXNzaW9uYWwtc2VydmljZXMsIG1hbnVmYWN0dXJpbmcnKVxufSk7XG5leHBvcnQgY29uc3QgYXBwUGFja0RlY29tcG9zaXRpb25ab2QgPSB6Lm9iamVjdCh7XG4gICAgcGFja0lkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYWNrIGlkIGluIGtlYmFiLWNhc2UsIGUuZy4gXCJvcHMtZGVwYXJ0bWVudC1wYWNrXCInKSxcbiAgICBuYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYWNrIGRpc3BsYXkgbmFtZScpLFxuICAgIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdIaWdoLWxldmVsIGRlc2NyaXB0aW9uIG9mIHRoZSB3aG9sZSBwYWNrJyksXG4gICAgYXBwczogei5hcnJheShhcHBQYWNrQXBwQnJpZWZab2QpLmRlc2NyaWJlKCdPbmUgYnJpZWYgcGVyIGRlcGFydG1lbnQgYXBwbGljYXRpb24nKSxcbiAgICBjZW9PdmVydmlldzogei5vYmplY3Qoe1xuICAgICAgICBwdXJwb3NlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdXaGF0IHRoZSBDRU8gT3ZlcnZpZXcgYXBwIGRvZXMgYWNyb3NzIGFsbCBkZXBhcnRtZW50cycpLFxuICAgICAgICBrcGlzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlc2NyaWJlKCdDcm9zcy1kZXBhcnRtZW50IEtQSXMgdGhlIENFTyBkYXNoYm9hcmQgc2hvdWxkIHN1cmZhY2UnKVxuICAgIH0pXG59KTtcbi8vIFx1MjUwMFx1MjUwMCBQZXItYXBwIChkZXRhaWxlZCBkZWZpbml0aW9uKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmV4cG9ydCBjb25zdCBhcHBVeEFjdGlvblpvZCA9IHoub2JqZWN0KHtcbiAgICBhY3Rpb246IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0FjdGlvbiBsYWJlbCwgZS5nLiBcIkNyZWF0ZSBuZXcgZW1wbG95ZWVcIicpLFxuICAgIHRhcmdldFBhZ2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1JvdXRlIHBhdGggdGhpcyBhY3Rpb24gbmF2aWdhdGVzIHRvJyksXG4gICAgdGFyZ2V0TW9kZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnUHJpbWFyeSBtb2RlbCB0aGUgYWN0aW9uIG9wZXJhdGVzIG9uJyksXG4gICAgYWN0aW9uVHlwZTogei5lbnVtKFtcbiAgICAgICAgJ2NyZWF0ZScsXG4gICAgICAgICdyZWFkJyxcbiAgICAgICAgJ3VwZGF0ZScsXG4gICAgICAgICdkZWxldGUnLFxuICAgICAgICAnYXBwcm92ZScsXG4gICAgICAgICdleHBvcnQnLFxuICAgICAgICAnbm90aWZ5JyxcbiAgICAgICAgJ25hdmlnYXRlJyxcbiAgICAgICAgJ3JldmlldydcbiAgICBdKS5kZXNjcmliZSgnS2luZCBvZiBhY3Rpb24nKVxufSk7XG5leHBvcnQgY29uc3QgYXBwVXhTdGFnZVpvZCA9IHoub2JqZWN0KHtcbiAgICBzdGFnZTogei5zdHJpbmcoKS5kZXNjcmliZSgnV29ya2Zsb3cgc3RhZ2UgbmFtZSwgZS5nLiBcIk9uYm9hcmRpbmdcIicpLFxuICAgIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1doYXQgdGhpcyBzdGFnZSBhY2NvbXBsaXNoZXMnKSxcbiAgICBhY3Rpb25zOiB6LmFycmF5KGFwcFV4QWN0aW9uWm9kKS5kZXNjcmliZSgnQWN0aW9ucyBhdmFpbGFibGUgaW4gdGhpcyBzdGFnZScpXG59KTtcbmV4cG9ydCBjb25zdCBhcHBOYXZab2QgPSB6Lm9iamVjdCh7XG4gICAgbGFiZWw6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ05hdiBtZW51IGxhYmVsIGZvciB0aGlzIGFwcCcpLFxuICAgIGljb246IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnTVVJIGljb24gbmFtZSBoaW50IChlLmcuIFwiUGVvcGxlXCIsIFwiUGF5bWVudHNcIiknKSxcbiAgICBwYWdlczogei5hcnJheSh6LnN0cmluZygpKS5kZXNjcmliZSgnUGFnZSBzbHVncyBncm91cGVkIHVuZGVyIHRoaXMgYXBwIGluIHRoZSBuYXYnKVxufSk7XG5leHBvcnQgY29uc3QgYXBwS25vd2xlZGdlU25pcHBldFpvZCA9IHoub2JqZWN0KHtcbiAgICBrZXk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NuaXBwZXQga2V5IGluIGtlYmFiLWNhc2UsIGUuZy4gXCJoci1vbmJvYXJkaW5nLXN0ZXBzXCInKSxcbiAgICB0aXRsZTogei5zdHJpbmcoKS5kZXNjcmliZSgnU25pcHBldCB0aXRsZScpLFxuICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0tub3dsZWRnZSBjb250ZW50IChtYXJrZG93bikgXHUyMDE0IHBvbGljaWVzLCBzdGVwcywgZ3VpZGFuY2UnKVxufSk7XG5leHBvcnQgY29uc3QgYXBwUGFja0FwcERlZmluaXRpb25ab2QgPSB6Lm9iamVjdCh7XG4gICAgYXBwSWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0FwcCBpZCBtYXRjaGluZyB0aGUgZGVjb21wb3NpdGlvbiBicmllZicpLFxuICAgIGFwcE5hbWU6IHouc3RyaW5nKCksXG4gICAgZGVwYXJ0bWVudDogei5zdHJpbmcoKSxcbiAgICB3M2NTdGFuZGFyZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVzNDIFhTRCAvIGRhdGEgc3RhbmRhcmQgYXBwbGllZCAoZS5nLiBcIlVCTCBmb3IgaW52b2ljZXNcIiknKSxcbiAgICBzY2hlbWFPcmdUeXBlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQcmltYXJ5IHNjaGVtYS5vcmcgdHlwZScpLFxuICAgIG1vZGVsczogc2NoZW1hTW9kZWxab2QuYXJyYXkoKS5kZXNjcmliZSgnMy04IFplblN0YWNrIG1vZGVscyAobm8gaWQvdGVuYW50U2x1Zy9jcmVhdGVkQXQvdXBkYXRlZEF0IGJhc2UgZmllbGRzKScpLFxuICAgIHVzZUNhc2VzOiB1c2VDYXNlWm9kLmFycmF5KCkuZGVzY3JpYmUoJ1VzZSBjYXNlcyBmb3IgdGhpcyBhcHAgKFVDLVhYWC1OTiknKSxcbiAgICBwYWdlczogcGFnZVpvZC5hcnJheSgpLmRlc2NyaWJlKCdQYWdlcyBmb3IgdGhpcyBhcHAgKGF1dGggdGllcnM6IHB1YmxpYy9waW4vZ29vZ2xlKScpLFxuICAgIG5hdjogYXBwTmF2Wm9kLFxuICAgIHV4V29ya2Zsb3c6IHouYXJyYXkoYXBwVXhTdGFnZVpvZCkuZGVzY3JpYmUoJ0VuZC10by1lbmQgVVggd29ya2Zsb3cgc3RhZ2VzIGZvciB0aGlzIGFwcCcpLFxuICAgIGtub3dsZWRnZVNuaXBwZXRzOiB6LmFycmF5KGFwcEtub3dsZWRnZVNuaXBwZXRab2QpLmRlc2NyaWJlKCdLbm93bGVkZ2Ugc25pcHBldHMgZm9yIHRoaXMgYXBwJylcbn0pO1xuLy8gXHUyNTAwXHUyNTAwIE1hdGVyaWFsaXplZCBydW4gcmVzdWx0IChwZXJzaXN0ZWQpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZXhwb3J0IGNvbnN0IGFwcFBhY2tSdW5SZXN1bHRab2QgPSB6Lm9iamVjdCh7XG4gICAgcGFja0lkOiB6LnN0cmluZygpLFxuICAgIG5hbWU6IHouc3RyaW5nKCksXG4gICAgZGVzY3JpcHRpb246IHouc3RyaW5nKCksXG4gICAgY3JlYXRlZEF0OiB6LnN0cmluZygpLFxuICAgIGFwcHM6IHouYXJyYXkoYXBwUGFja0FwcERlZmluaXRpb25ab2QpLFxuICAgIGNlb092ZXJ2aWV3OiB6Lm9iamVjdCh7XG4gICAgICAgIHB1cnBvc2U6IHouc3RyaW5nKCksXG4gICAgICAgIGtwaXM6IHouYXJyYXkoei5zdHJpbmcoKSlcbiAgICB9KSxcbiAgICBtYXRlcmlhbGl6ZWQ6IHoub2JqZWN0KHtcbiAgICAgICAgcGFnZXM6IHoubnVtYmVyKCksXG4gICAgICAgIG5hdkl0ZW1zOiB6Lm51bWJlcigpLFxuICAgICAgICBzbmlwcGV0czogei5udW1iZXIoKSxcbiAgICAgICAgZ3JvdXBzOiB6Lm51bWJlcigpLFxuICAgICAgICB6bW9kZWxzOiB6Lm51bWJlcigpXG4gICAgfSlcbn0pO1xuIiwgIi8qKlxuICogWm9kIHNjaGVtYSBmb3IgQUktZ2VuZXJhdGVkIFczQyBzY2hlbWEgZGVmaW5pdGlvbnMuXG4gKlxuICogVGhpcyBzY2hlbWEgaXMgdXNlZCB3aXRoIHRoZSBWZXJjZWwgQUkgU0RLJ3MgYGdlbmVyYXRlT2JqZWN0KClgIGZ1bmN0aW9uXG4gKiB0byBlbnN1cmUgdGhlIEFJIHJldHVybnMgYSBzdHJ1Y3R1cmFsbHkgdmFsaWQgc2NoZW1hIGRlZmluaXRpb24uXG4gKi8gaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5leHBvcnQgY29uc3Qgc2NoZW1hRmllbGRab2QgPSB6Lm9iamVjdCh7XG4gICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnRmllbGQgbmFtZSBpbiBjYW1lbENhc2UnKSxcbiAgICB0eXBlOiB6LmVudW0oW1xuICAgICAgICAnc3RyaW5nJyxcbiAgICAgICAgJ3RleHQnLFxuICAgICAgICAnaW50ZWdlcicsXG4gICAgICAgICdkZWNpbWFsJyxcbiAgICAgICAgJ2Jvb2xlYW4nLFxuICAgICAgICAnZGF0ZXRpbWUnLFxuICAgICAgICAnZGF0ZScsXG4gICAgICAgICd0aW1lJyxcbiAgICAgICAgJ2VudW0nLFxuICAgICAgICAnanNvbicsXG4gICAgICAgICdyZWxhdGlvbidcbiAgICBdKS5kZXNjcmliZSgnRmllbGQgdHlwZSBhbGlnbmVkIHdpdGggWFNEIGRhdGEgdHlwZXMnKSxcbiAgICByZXF1aXJlZDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gICAgdW5pcXVlOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICAgIGRlZmF1bHQ6IHoudW5rbm93bigpLm9wdGlvbmFsKCksXG4gICAgZW51bVZhbHVlczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLFxuICAgIHJlbGF0aW9uVG86IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICByZWxhdGlvblR5cGU6IHouZW51bShbXG4gICAgICAgICdvbmUtdG8tbWFueScsXG4gICAgICAgICdtYW55LXRvLW9uZScsXG4gICAgICAgICdtYW55LXRvLW1hbnknXG4gICAgXSkub3B0aW9uYWwoKSxcbiAgICBzY2hlbWFPcmdQcm9wZXJ0eTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdzY2hlbWEub3JnIHByb3BlcnR5IG1hcHBpbmcgKGUuZy4sIFwib2ZmZXJzLnByaWNlXCIpJyksXG4gICAgbGFiZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnSHVtYW4tcmVhZGFibGUgbGFiZWwgZm9yIFVJIGZvcm1zJyksXG4gICAgd2lkdGg6IHoudW5pb24oW1xuICAgICAgICB6LmxpdGVyYWwoNCksXG4gICAgICAgIHoubGl0ZXJhbCg2KSxcbiAgICAgICAgei5saXRlcmFsKDgpLFxuICAgICAgICB6LmxpdGVyYWwoMTIpXG4gICAgXSkub3B0aW9uYWwoKVxufSk7XG5leHBvcnQgY29uc3Qgc2NoZW1hTW9kZWxab2QgPSB6Lm9iamVjdCh7XG4gICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTW9kZWwgbmFtZSBpbiBQYXNjYWxDYXNlJyksXG4gICAgdGFibGVOYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdEYXRhYmFzZSB0YWJsZSBuYW1lIGluIHNuYWtlX2Nhc2VfcGx1cmFsJyksXG4gICAgZmllbGRzOiB6LmFycmF5KHNjaGVtYUZpZWxkWm9kKSxcbiAgICBzY2hlbWFPcmdNYXBwaW5nOiB6LnJlY29yZCh6LnN0cmluZygpKS5vcHRpb25hbCgpXG59KTtcbmV4cG9ydCBjb25zdCB1c2VDYXNlWm9kID0gei5vYmplY3Qoe1xuICAgIGlkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdVc2UgY2FzZSBJRCBpbiBmb3JtYXQgVUMtWFhYLU5OIChlLmcuLCBVQy1SRVNULTAxKScpLFxuICAgIHRpdGxlOiB6LnN0cmluZygpLFxuICAgIGF1dGg6IHouZW51bShbXG4gICAgICAgICdwdWJsaWMnLFxuICAgICAgICAncGluJyxcbiAgICAgICAgJ2dvb2dsZSdcbiAgICBdKSxcbiAgICByb3V0ZTogei5zdHJpbmcoKS5kZXNjcmliZSgnUm91dGUgcGF0aCAoZS5nLiwgXCIvbWVudVwiKScpLFxuICAgIGJsb2NrVHlwZXM6IHouYXJyYXkoei5zdHJpbmcoKSksXG4gICAgbW9kZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpXG59KTtcbmV4cG9ydCBjb25zdCBwYWdlWm9kID0gei5vYmplY3Qoe1xuICAgIHNsdWc6IHouc3RyaW5nKCksXG4gICAgdGl0bGU6IHouc3RyaW5nKCksXG4gICAgYXV0aFRpZXI6IHouZW51bShbXG4gICAgICAgICdwdWJsaWMnLFxuICAgICAgICAncGluJyxcbiAgICAgICAgJ2dvb2dsZSdcbiAgICBdKSxcbiAgICBibG9ja1R5cGVzOiB6LmFycmF5KHouc3RyaW5nKCkpLFxuICAgIG5hdkxhYmVsOiB6LnN0cmluZygpLm9wdGlvbmFsKClcbn0pO1xuZXhwb3J0IGNvbnN0IHNjaGVtYUdlbmVyYXRpb25ab2RTY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgdGVtcGxhdGVJZDogei5zdHJpbmcoKSxcbiAgICBzY2hlbWFPcmdUeXBlOiB6LnN0cmluZygpLFxuICAgIG1vZGVsczogei5hcnJheShzY2hlbWFNb2RlbFpvZCksXG4gICAgdXNlQ2FzZXM6IHouYXJyYXkodXNlQ2FzZVpvZCksXG4gICAgcGFnZXM6IHouYXJyYXkocGFnZVpvZClcbn0pO1xuIiwgIi8qKlxuICogWmVuU3RhY2sgLnptb2RlbCBDb21waWxlclxuICpcbiAqIFRha2VzIGFuIEFJLWdlbmVyYXRlZCBTY2hlbWFHZW5lcmF0aW9uUmVzdWx0IGFuZCBjb21waWxlcyBpdFxuICogaW50byBhIHZhbGlkIFplblN0YWNrIHNjaGVtYS56bW9kZWwgZmlsZS5cbiAqXG4gKiBUaGUgZ2VuZXJhdGVkIC56bW9kZWwgaW5jbHVkZXM6XG4gKiAgIC0gZGF0YXNvdXJjZSArIGdlbmVyYXRvciBibG9ja3NcbiAqICAgLSBBdXRoVGllciBlbnVtXG4gKiAgIC0gQWxsIG1vZGVscyB3aXRoIHByb3BlciBmaWVsZCB0eXBlcywgZGVjb3JhdG9ycywgYW5kIEBAbWFwXG4gKi8gLy8gXHUyNTAwXHUyNTAwIEZpZWxkIHR5cGUgbWFwcGluZyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmZ1bmN0aW9uIG1hcEZpZWxkVHlwZShmaWVsZCkge1xuICAgIHN3aXRjaChmaWVsZC50eXBlKXtcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIHJldHVybiAnU3RyaW5nJztcbiAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgICAgICByZXR1cm4gJ1N0cmluZyBAZGIuVGV4dCc7XG4gICAgICAgIGNhc2UgJ2ludGVnZXInOlxuICAgICAgICAgICAgcmV0dXJuICdJbnQnO1xuICAgICAgICBjYXNlICdkZWNpbWFsJzpcbiAgICAgICAgICAgIHJldHVybiAnRGVjaW1hbCBAZGIuRGVjaW1hbCgxNCwgMiknO1xuICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgIHJldHVybiAnQm9vbGVhbic7XG4gICAgICAgIGNhc2UgJ2RhdGV0aW1lJzpcbiAgICAgICAgICAgIHJldHVybiAnRGF0ZVRpbWUnO1xuICAgICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiAnRGF0ZVRpbWUgQGRiLkRhdGUnO1xuICAgICAgICBjYXNlICd0aW1lJzpcbiAgICAgICAgICAgIHJldHVybiAnRGF0ZVRpbWUgQGRiLlRpbWUnO1xuICAgICAgICBjYXNlICdlbnVtJzpcbiAgICAgICAgICAgIHJldHVybiAnU3RyaW5nJztcbiAgICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgICAgICByZXR1cm4gJ0pzb24nO1xuICAgICAgICBjYXNlICdyZWxhdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gJ1N0cmluZyc7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJ1N0cmluZyc7XG4gICAgfVxufVxuLy8gXHUyNTAwXHUyNTAwIEZpZWxkIGRlY29yYXRvciBtYXBwaW5nIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gbWFwRmllbGREZWNvcmF0b3JzKGZpZWxkKSB7XG4gICAgY29uc3QgcGFydHMgPSBbXTtcbiAgICBpZiAoZmllbGQudW5pcXVlKSBwYXJ0cy5wdXNoKCdAdW5pcXVlJyk7XG4gICAgaWYgKGZpZWxkLmRlZmF1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAodHlwZW9mIGZpZWxkLmRlZmF1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGBAZGVmYXVsdChcIiR7ZmllbGQuZGVmYXVsdH1cIilgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZmllbGQuZGVmYXVsdCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGBAZGVmYXVsdCgke2ZpZWxkLmRlZmF1bHR9KWApO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBmaWVsZC5kZWZhdWx0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcGFydHMucHVzaChgQGRlZmF1bHQoJHtmaWVsZC5kZWZhdWx0fSlgKTtcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGZpZWxkLmRlZmF1bHQpKSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGBAZGVmYXVsdChbXSlgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcnRzLnB1c2goYEBkZWZhdWx0KFwie31cIilgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGFydHMubGVuZ3RoID4gMCA/ICcgJyArIHBhcnRzLmpvaW4oJyAnKSA6ICcnO1xufVxuLy8gXHUyNTAwXHUyNTAwIEZpZWxkIGNvbW1lbnQgKHNjaGVtYS5vcmcgbWFwcGluZykgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5mdW5jdGlvbiBtYXBGaWVsZENvbW1lbnQoZmllbGQpIHtcbiAgICBpZiAoIWZpZWxkLnNjaGVtYU9yZ1Byb3BlcnR5KSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gYCAgLy8vIHNjaGVtYS5vcmc6JHtmaWVsZC5zY2hlbWFPcmdQcm9wZXJ0eX1gO1xufVxuLy8gXHUyNTAwXHUyNTAwIE1vZGVsIGNvbXBpbGF0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gY29tcGlsZU1vZGVsKG1vZGVsKSB7XG4gICAgY29uc3QgZmllbGRzU3RyID0gbW9kZWwuZmllbGRzLm1hcCgoZik9PntcbiAgICAgICAgY29uc3QgdHlwZVN0ciA9IG1hcEZpZWxkVHlwZShmKTtcbiAgICAgICAgY29uc3Qgb3B0aW9uYWwgPSBmLnJlcXVpcmVkID8gJycgOiAnPyc7XG4gICAgICAgIGNvbnN0IGRlY29yYXRvcnMgPSBtYXBGaWVsZERlY29yYXRvcnMoZik7XG4gICAgICAgIGNvbnN0IGNvbW1lbnQgPSBtYXBGaWVsZENvbW1lbnQoZik7XG4gICAgICAgIGNvbnN0IGZpZWxkTGluZSA9IGAgICR7Zi5uYW1lfSAke3R5cGVTdHJ9JHtvcHRpb25hbH0ke2RlY29yYXRvcnN9YDtcbiAgICAgICAgcmV0dXJuIGNvbW1lbnQgPyBgJHtjb21tZW50fVxcbiR7ZmllbGRMaW5lfWAgOiBmaWVsZExpbmU7XG4gICAgfSkuam9pbignXFxuJyk7XG4gICAgcmV0dXJuIGBcbm1vZGVsICR7bW9kZWwubmFtZX0ge1xuICBpZCAgICAgICAgIFN0cmluZyAgIEBpZCBAZGVmYXVsdChjdWlkKCkpXG4gIHRlbmFudFNsdWcgU3RyaW5nPyAgQG1hcChcInRlbmFudF9zbHVnXCIpXG4ke2ZpZWxkc1N0cn1cbiAgY3JlYXRlZEF0ICBEYXRlVGltZSBAZGVmYXVsdChub3coKSkgQG1hcChcImNyZWF0ZWRfYXRcIilcbiAgdXBkYXRlZEF0ICBEYXRlVGltZSBAdXBkYXRlZEF0IEBtYXAoXCJ1cGRhdGVkX2F0XCIpXG5cbiAgQEBpbmRleChbdGVuYW50U2x1Z10pXG4gIEBAbWFwKFwiJHttb2RlbC50YWJsZU5hbWV9XCIpXG59YDtcbn1cbi8vIFx1MjUwMFx1MjUwMCBGdWxsIC56bW9kZWwgY29tcGlsYXRpb24gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRvWk1vZGVsKHNjaGVtYSkge1xuICAgIGNvbnN0IGhlYWRlciA9IGAvLyBBdXRvLWdlbmVyYXRlZCBaZW5TdGFjayBzY2hlbWEgZm9yICR7c2NoZW1hLnRlbXBsYXRlSWR9XG4vLyBHZW5lcmF0ZWQgYnkgVE9LRU5JWk1ZQVBQIEFJIFNjaGVtYSBHZW5lcmF0b3Jcbi8vIHNjaGVtYS5vcmcgdHlwZTogJHtzY2hlbWEuc2NoZW1hT3JnVHlwZX1cbi8vIFczQyBzdGFuZGFyZCBhbGlnbm1lbnQgYXBwbGllZCB0byBmaWVsZCB0eXBlc1xuXG5kYXRhc291cmNlIGRiIHtcbiAgcHJvdmlkZXIgPSBcInBvc3RncmVzcWxcIlxuICB1cmwgICAgICA9IGVudihcIlBPU1RHUkVTX1VSTFwiKVxufVxuXG5nZW5lcmF0b3IgY2xpZW50IHtcbiAgcHJvdmlkZXIgPSBcInByaXNtYS1jbGllbnQtanNcIlxuICBvdXRwdXQgICA9IFwiLi4vLi4vc3JjL2dlbmVyYXRlZC9wcmlzbWFcIlxuICBiaW5hcnlUYXJnZXRzID0gW1wibmF0aXZlXCIsIFwibGludXgtYXJtNjQtb3BlbnNzbC0zLjAueFwiXVxufVxuXG5lbnVtIEF1dGhUaWVyIHtcbiAgcHVibGljXG4gIHBpblxuICBnb29nbGVcbn1cbmA7XG4gICAgY29uc3QgbW9kZWxzID0gc2NoZW1hLm1vZGVscy5tYXAoY29tcGlsZU1vZGVsKS5qb2luKCdcXG4nKTtcbiAgICByZXR1cm4gYCR7aGVhZGVyfVxcbiR7bW9kZWxzfVxcbmA7XG59XG4vLyBcdTI1MDBcdTI1MDAgUGFnZSBjYXRhbG9nIGNvbXBpbGF0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUb1BhZ2VDYXRhbG9nKHNjaGVtYSkge1xuICAgIGNvbnN0IHBhZ2VzID0gc2NoZW1hLnBhZ2VzLm1hcCgocCk9PmAgIHtcbiAgICBzbHVnOiAnJHtwLnNsdWd9JyxcbiAgICB0aXRsZTogJyR7cC50aXRsZX0nLFxuICAgIGF1dGhUaWVyOiAnJHtwLmF1dGhUaWVyfScsXG4gICAgbmF2TGFiZWw6ICcke3AubmF2TGFiZWwgPz8gcC50aXRsZX0nLFxuICAgIHNlY3Rpb25zOiBbXG4gICAgICAke3AuYmxvY2tUeXBlcy5tYXAoKGJ0KT0+YHsgYmxvY2tUeXBlOiAnJHtidH0nIGFzIEJsb2NrVHlwZSwgY29uZmlnOiB7fSB9YCkuam9pbignLFxcbiAgICAgICcpfVxuICAgIF0sXG4gIH1gKS5qb2luKCcsXFxuJyk7XG4gICAgcmV0dXJuIGAvKipcbiAqIEF1dG8tZ2VuZXJhdGVkIHBhZ2UgY2F0YWxvZyBmb3IgJHtzY2hlbWEudGVtcGxhdGVJZH1cbiAqIEdlbmVyYXRlZCBieSBUT0tFTklaTVlBUFAgQUkgU2NoZW1hIEdlbmVyYXRvclxuICovXG5pbXBvcnQgdHlwZSB7IFBhZ2VEZWZpbml0aW9uIH0gZnJvbSAnQC9saWIvcGFnZS1jYXRhbG9nJztcblxuZXhwb3J0IGNvbnN0IEdFTkVSQVRFRF9QQUdFUzogUGFnZURlZmluaXRpb25bXSA9IFtcbiR7cGFnZXN9XG5dO1xuYDtcbn1cbiIsICIvKipcbiAqIEFwcCBQYWNrIFx1MjAxNCBDb21waWxlclxuICpcbiAqIERldGVybWluaXN0aWMgY29tcGlsYXRpb24gb2YgQUktZ2VuZXJhdGVkIGFwcCBkZWZpbml0aW9ucyBpbnRvIGFydGlmYWN0cyB0aGVcbiAqIHBsYXRmb3JtIGNhbiBtYXRlcmlhbGl6ZTpcbiAqXG4gKiAgIC0gWmVuU3RhY2sgLnptb2RlbCBzb3VyY2UgKHBlciBhcHAsIHZpYSBjb21waWxlVG9aTW9kZWwpXG4gKiAgIC0gUGFnZSBjYXRhbG9nIHNvdXJjZSAocGVyIGFwcCwgdmlhIGNvbXBpbGVUb1BhZ2VDYXRhbG9nKVxuICogICAtIERCIHJvd3MgZm9yIHBhZ2VzLCBuYXYgaXRlbXMsIGtub3dsZWRnZSBzbmlwcGV0cyBhbmQgc2VjdXJpdHkgZ3JvdXBzXG4gKiAgIC0gVVggd29ya2Zsb3cgZG9jdW1lbnRzIChKU09OKVxuICovIGltcG9ydCB7IGNvbXBpbGVUb1pNb2RlbCwgY29tcGlsZVRvUGFnZUNhdGFsb2cgfSBmcm9tICdAL2RvbWFpbi9haS96bW9kZWwtY29tcGlsZXInO1xuZnVuY3Rpb24gdG9TY2hlbWFHZW5lcmF0aW9uUmVzdWx0KGRlZikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlSWQ6IGRlZi5hcHBJZCxcbiAgICAgICAgc2NoZW1hT3JnVHlwZTogZGVmLnNjaGVtYU9yZ1R5cGUsXG4gICAgICAgIG1vZGVsczogZGVmLm1vZGVscyxcbiAgICAgICAgdXNlQ2FzZXM6IGRlZi51c2VDYXNlcyxcbiAgICAgICAgcGFnZXM6IGRlZi5wYWdlc1xuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUFwcEFydGlmYWN0cyhkZWYpIHtcbiAgICBjb25zdCBzY2hlbWEgPSB0b1NjaGVtYUdlbmVyYXRpb25SZXN1bHQoZGVmKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBhcHBJZDogZGVmLmFwcElkLFxuICAgICAgICBhcHBOYW1lOiBkZWYuYXBwTmFtZSxcbiAgICAgICAgZGVwYXJ0bWVudDogZGVmLmRlcGFydG1lbnQsXG4gICAgICAgIHptb2RlbDogY29tcGlsZVRvWk1vZGVsKHNjaGVtYSksXG4gICAgICAgIHBhZ2VDYXRhbG9nOiBjb21waWxlVG9QYWdlQ2F0YWxvZyhzY2hlbWEpLFxuICAgICAgICBzZWN1cml0eUdyb3VwQ29kZTogYGFwcF8ke2RlZi5hcHBJZH1gLFxuICAgICAgICBzZWN1cml0eUdyb3VwTmFtZTogYEFwcDogJHtkZWYuYXBwTmFtZX1gXG4gICAgfTtcbn1cbi8qKiBOb3JtYWxpemUgYW4gQUktZ2VuZXJhdGVkIHBhZ2Ugc2x1ZyB0byBhIHNpbmdsZSBVUkwtc2FmZSBzZWdtZW50LiAqLyBleHBvcnQgZnVuY3Rpb24gc2FuaXRpemVQYWdlU2x1ZyhzbHVnKSB7XG4gICAgcmV0dXJuIHNsdWcudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9eXFwvKy8sICcnKS5yZXBsYWNlKC9bXFxzLl0rL2csIFwiLVwiKS5yZXBsYWNlKC9bXmEtejAtOS1fXS9nLCAnJykuc2xpY2UoMCwgNDgpO1xufVxuLyoqXG4gKiBQbHVyYWxpemUgYSBQYXNjYWxDYXNlIG1vZGVsIG5hbWUgZm9yIENSVUQgcGFnZSB0aXRsZXMgLyBuYXYgbGFiZWxzLlxuICogU2ltcGxlIEVuZ2xpc2ggaGV1cmlzdGljIChkb2N1bWVudGVkLCBub3QgZXhoYXVzdGl2ZSk6XG4gKiAgIC0gYWxyZWFkeS1wbHVyYWwgLyB1bmNvdW50YWJsZSBuYW1lcyBlbmRpbmcgaW4gXCJzXCIgKFNhbGVzLCBOZXdzKSBcdTIxOTIgYXMtaXNcbiAqICAgLSBlbmRzIGluIHMsIHgsIHosIGNoLCBzaCBcdTIxOTIgYXBwZW5kIFwiZXNcIiAgKFN0YXR1cyBcdTIxOTIgU3RhdHVzZXMsIEJveCBcdTIxOTIgQm94ZXMpXG4gKiAgIC0gZW5kcyBpbiBjb25zb25hbnQgKyBcInlcIiBcdTIxOTIgZHJvcCBcInlcIiwgYXBwZW5kIFwiaWVzXCIgIChDYXRlZ29yeSBcdTIxOTIgQ2F0ZWdvcmllcylcbiAqICAgLSBvdGhlcndpc2UgXHUyMTkyIGFwcGVuZCBcInNcIiAgKFJlc2VydmF0aW9uIFx1MjE5MiBSZXNlcnZhdGlvbnMpXG4gKi8gZnVuY3Rpb24gcGx1cmFsaXplTW9kZWxOYW1lKG5hbWUpIHtcbiAgICBpZiAoL3MkL2kudGVzdChuYW1lKSAmJiAhLyhzc3x1cykkL2kudGVzdChuYW1lKSkgcmV0dXJuIG5hbWU7XG4gICAgaWYgKC9bc3h6XSQvaS50ZXN0KG5hbWUpIHx8IC8oY2h8c2gpJC9pLnRlc3QobmFtZSkpIHJldHVybiBgJHtuYW1lfWVzYDtcbiAgICBpZiAoL1teYWVpb3VdeSQvaS50ZXN0KG5hbWUpKSByZXR1cm4gYCR7bmFtZS5zbGljZSgwLCAtMSl9aWVzYDtcbiAgICByZXR1cm4gYCR7bmFtZX1zYDtcbn1cbi8qKlxuICogQnVpbGQgREIgcm93cyBmb3Igb25lIGFwcC4gVGhlIGR5bmFtaWMgcm91dGVyIGlzIGEgc2luZ2xlLWxldmVsIGAvW3NsdWddYFxuICogcm91dGUsIHNvIHBhZ2Ugc2x1Z3MgYXJlIEZMQVQgYW5kIHByZWZpeGVkIHdpdGggcGFja0lkICsgYXBwSWQgdG8gc3RheVxuICogZ2xvYmFsbHkgdW5pcXVlIChgYXBwX3BhZ2VzLnNsdWdgIGlzIGEgZ2xvYmFsIHVuaXF1ZSBjb2x1bW4pLiBOYXYgY2x1c3RlcnNcbiAqIHRoZSBhcHAncyBwYWdlcyB1bmRlciBvbmUgcGFyZW50IGl0ZW07IGEgbGFuZGluZyBwYWdlIChzbHVnIGA8cGFja0lkPi08YXBwSWQ+YClcbiAqIGlzIGFsd2F5cyBtYXRlcmlhbGl6ZWQgc28gdGhlIHBhcmVudCBuYXYgaXRlbSBoYXMgYSByZWFsIGRlc3RpbmF0aW9uLlxuICovIGV4cG9ydCBmdW5jdGlvbiBjb21waWxlQXBwUm93cyhkZWYsIHRlbmFudFNsdWcsIHBhY2tJZCkge1xuICAgIGNvbnN0IHJvb3RTbHVnID0gYCR7cGFja0lkfS0ke2RlZi5hcHBJZH1gO1xuICAgIGNvbnN0IHJvb3QgPSB7XG4gICAgICAgIGlkOiBgcGFnZV8ke3BhY2tJZH1fJHtkZWYuYXBwSWR9YCxcbiAgICAgICAgc2x1Zzogcm9vdFNsdWcsXG4gICAgICAgIHRpdGxlOiBkZWYuYXBwTmFtZSxcbiAgICAgICAgYXV0aFRpZXI6IGRlZi5wYWdlc1swXT8uYXV0aFRpZXIgPz8gJ3BpbicsXG4gICAgICAgIG5hdkxhYmVsOiBudWxsLFxuICAgICAgICBzaG93SW5OYXY6IGZhbHNlLFxuICAgICAgICB0ZW5hbnRTbHVnLFxuICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2hlcm8nLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGVmLmFwcE5hbWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuICAgIGNvbnN0IGFpUGFnZXMgPSBkZWYucGFnZXMubWFwKChwKT0+e1xuICAgICAgICBjb25zdCBzZWcgPSBzYW5pdGl6ZVBhZ2VTbHVnKHAuc2x1Zyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogYHBhZ2VfJHtwYWNrSWR9XyR7ZGVmLmFwcElkfV8ke3NlZ31gLFxuICAgICAgICAgICAgc2x1ZzogYCR7cGFja0lkfS0ke2RlZi5hcHBJZH0tJHtzZWd9YCxcbiAgICAgICAgICAgIHRpdGxlOiBwLnRpdGxlLFxuICAgICAgICAgICAgYXV0aFRpZXI6IHAuYXV0aFRpZXIsXG4gICAgICAgICAgICBuYXZMYWJlbDogcC5uYXZMYWJlbCA/PyBudWxsLFxuICAgICAgICAgICAgc2hvd0luTmF2OiBwLm5hdkxhYmVsICE9IG51bGwsXG4gICAgICAgICAgICB0ZW5hbnRTbHVnLFxuICAgICAgICAgICAgc2VjdGlvbnM6IHAuYmxvY2tUeXBlcy5tYXAoKGJ0KT0+KHtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2tUeXBlOiBidCxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiB7fVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICB9O1xuICAgIH0pO1xuICAgIC8vIERldGVybWluaXN0aWMgQ1JVRCBwYWdlczogb25lIHBlciBtb2RlbCwgYXBwZW5kZWQgYWZ0ZXIgQUkgcGFnZXMgc28gZXZlcnlcbiAgICAvLyBtb2RlbCBnZXRzIGEgcnVudGltZSBDUlVEIHN1cmZhY2UgcmVnYXJkbGVzcyBvZiBBSSBwYWdlIGNob2ljZXMuIFNsdWdzIGFyZVxuICAgIC8vIGZsYXQgYW5kIHBhY2tJZCthcHBJZCt0YWJsZU5hbWUtcHJlZml4ZWQgdG8gc3RheSBnbG9iYWxseSB1bmlxdWVcbiAgICAvLyAoYXBwX3BhZ2VzLnNsdWcgaXMgYSBnbG9iYWwgdW5pcXVlIGNvbHVtbikuXG4gICAgY29uc3QgbW9kZWxQYWdlcyA9IGRlZi5tb2RlbHMubWFwKChtb2RlbCk9PntcbiAgICAgICAgY29uc3QgdGl0bGUgPSBwbHVyYWxpemVNb2RlbE5hbWUobW9kZWwubmFtZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogYHBhZ2VfJHtwYWNrSWR9XyR7ZGVmLmFwcElkfV9tb2RlbF8ke21vZGVsLnRhYmxlTmFtZX1gLFxuICAgICAgICAgICAgc2x1ZzogYCR7cGFja0lkfS0ke2RlZi5hcHBJZH0tJHttb2RlbC50YWJsZU5hbWV9YCxcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgYXV0aFRpZXI6ICdwaW4nLFxuICAgICAgICAgICAgbmF2TGFiZWw6IHRpdGxlLFxuICAgICAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICAgICAgdGVuYW50U2x1ZyxcbiAgICAgICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBibG9ja1R5cGU6ICdwYWNrX3RhYmxlJyxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJsZTogbW9kZWwudGFibGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG1vZGVsLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICB9KTtcbiAgICBjb25zdCBwYWdlcyA9IFtcbiAgICAgICAgcm9vdCxcbiAgICAgICAgLi4uYWlQYWdlcyxcbiAgICAgICAgLi4ubW9kZWxQYWdlc1xuICAgIF07XG4gICAgLy8gTmF2OiBvbmUgcGFyZW50IGl0ZW0gZm9yIHRoZSBhcHAgc2VjdGlvbiArIGNoaWxkcmVuIHBlciBuYXYgcGFnZS5cbiAgICBjb25zdCBncm91cENvZGUgPSBgYXBwXyR7ZGVmLmFwcElkfWA7XG4gICAgY29uc3QgbmF2ID0gW107XG4gICAgbmF2LnB1c2goe1xuICAgICAgICBpZDogYG5hdl8ke3BhY2tJZH1fJHtkZWYuYXBwSWR9YCxcbiAgICAgICAgdGl0bGU6IGRlZi5uYXYubGFiZWwsXG4gICAgICAgIHBhdGg6IGAvJHtyb290U2x1Z31gLFxuICAgICAgICBpY29uOiBkZWYubmF2Lmljb24gPz8gJ0FwcHMnLFxuICAgICAgICByZXF1aXJlZEdyb3VwczogZ3JvdXBDb2RlLFxuICAgICAgICBpc0R5bmFtaWM6IHRydWUsXG4gICAgICAgIHNvcnRPcmRlcjogMCxcbiAgICAgICAgdGVuYW50U2x1Z1xuICAgIH0pO1xuICAgIGRlZi5uYXYucGFnZXMuZm9yRWFjaCgoc2x1ZywgaSk9PntcbiAgICAgICAgY29uc3Qgc2VnID0gc2FuaXRpemVQYWdlU2x1ZyhzbHVnKTtcbiAgICAgICAgY29uc3QgcGFnZSA9IHBhZ2VzLmZpbmQoKHApPT5wLnNsdWcgPT09IGAke3BhY2tJZH0tJHtkZWYuYXBwSWR9LSR7c2VnfWApO1xuICAgICAgICBuYXYucHVzaCh7XG4gICAgICAgICAgICBpZDogYG5hdl8ke3BhY2tJZH1fJHtkZWYuYXBwSWR9XyR7c2VnfWAsXG4gICAgICAgICAgICB0aXRsZTogcGFnZT8ubmF2TGFiZWwgPz8gcGFnZT8udGl0bGUgPz8gc2VnLFxuICAgICAgICAgICAgcGF0aDogYC8ke3BhY2tJZH0tJHtkZWYuYXBwSWR9LSR7c2VnfWAsXG4gICAgICAgICAgICBpY29uOiAnJyxcbiAgICAgICAgICAgIHJlcXVpcmVkR3JvdXBzOiBncm91cENvZGUsXG4gICAgICAgICAgICBpc0R5bmFtaWM6IHRydWUsXG4gICAgICAgICAgICBzb3J0T3JkZXI6IGkgKyAxLFxuICAgICAgICAgICAgdGVuYW50U2x1Z1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICAvLyBNb2RlbCBDUlVEIG5hdiBjaGlsZHJlbiBcdTIwMTQgc29ydCBvcmRlciBjb250aW51ZXMgYWZ0ZXIgdGhlIEFJIG5hdiBwYWdlcy5cbiAgICBkZWYubW9kZWxzLmZvckVhY2goKG1vZGVsLCBpKT0+e1xuICAgICAgICBjb25zdCB0aXRsZSA9IHBsdXJhbGl6ZU1vZGVsTmFtZShtb2RlbC5uYW1lKTtcbiAgICAgICAgbmF2LnB1c2goe1xuICAgICAgICAgICAgaWQ6IGBuYXZfJHtwYWNrSWR9XyR7ZGVmLmFwcElkfV9tb2RlbF8ke21vZGVsLnRhYmxlTmFtZX1gLFxuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBwYXRoOiBgLyR7cGFja0lkfS0ke2RlZi5hcHBJZH0tJHttb2RlbC50YWJsZU5hbWV9YCxcbiAgICAgICAgICAgIGljb246ICcnLFxuICAgICAgICAgICAgcmVxdWlyZWRHcm91cHM6IGdyb3VwQ29kZSxcbiAgICAgICAgICAgIGlzRHluYW1pYzogdHJ1ZSxcbiAgICAgICAgICAgIHNvcnRPcmRlcjogZGVmLm5hdi5wYWdlcy5sZW5ndGggKyBpICsgMSxcbiAgICAgICAgICAgIHRlbmFudFNsdWdcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29uc3Qgc25pcHBldHMgPSBkZWYua25vd2xlZGdlU25pcHBldHMubWFwKChzKT0+KHtcbiAgICAgICAgICAgIGlkOiBgc25pcF8ke3BhY2tJZH1fJHtkZWYuYXBwSWR9XyR7cy5rZXkucmVwbGFjZSgvW15hLXowLTktXS9nLCAnXycpfWAsXG4gICAgICAgICAgICBrZXk6IGAke3BhY2tJZH0tJHtzLmtleX1gLFxuICAgICAgICAgICAgY29udGVudDogcy5jb250ZW50LFxuICAgICAgICAgICAgY2F0ZWdvcnk6IGBhcHBfJHtkZWYuYXBwSWR9YFxuICAgICAgICB9KSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFnZXMsXG4gICAgICAgIG5hdixcbiAgICAgICAgc25pcHBldHMsXG4gICAgICAgIHV4OiB7XG4gICAgICAgICAgICBhcHBJZDogZGVmLmFwcElkLFxuICAgICAgICAgICAgYXBwTmFtZTogZGVmLmFwcE5hbWUsXG4gICAgICAgICAgICBkZXBhcnRtZW50OiBkZWYuZGVwYXJ0bWVudCxcbiAgICAgICAgICAgIHN0YWdlczogZGVmLnV4V29ya2Zsb3dcbiAgICAgICAgfVxuICAgIH07XG59XG4vKipcbiAqIEJ1aWxkIHRoZSBDRU8gT3ZlcnZpZXcgbmF2ICsgc25pcHBldCByb3dzOiB0aGUgQ0VPIGFwcCBnZXRzIGl0cyBvd24gc2VjdGlvblxuICogcGx1cyBhIGtub3dsZWRnZSBjYXRlZ29yeSB0aGF0IGFnZ3JlZ2F0ZXMgZXZlcnkgZGVwYXJ0bWVudCBhcHAncyBzbmlwcGV0cyBzb1xuICogdGhlIENFTyBrbm93bGVkZ2UgYmFzZSBzcGFucyB0aGUgd2hvbGUgcGFjay5cbiAqLyBleHBvcnQgZnVuY3Rpb24gY29tcGlsZUNlb1Jvd3MoZGVjb21wb3NpdGlvbiwgY2VvRGVmLCB0ZW5hbnRTbHVnLCBwYWNrSWQpIHtcbiAgICBjb25zdCBncm91cENvZGUgPSBgYXBwXyR7Y2VvRGVmLmFwcElkfWA7XG4gICAgY29uc3QgbmF2ID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogYG5hdl8ke3BhY2tJZH1fJHtjZW9EZWYuYXBwSWR9YCxcbiAgICAgICAgICAgIHRpdGxlOiBjZW9EZWYubmF2LmxhYmVsLFxuICAgICAgICAgICAgcGF0aDogYC8ke3BhY2tJZH0tJHtjZW9EZWYuYXBwSWR9YCxcbiAgICAgICAgICAgIGljb246IGNlb0RlZi5uYXYuaWNvbiA/PyAnSW5zaWdodHMnLFxuICAgICAgICAgICAgcmVxdWlyZWRHcm91cHM6IGdyb3VwQ29kZSxcbiAgICAgICAgICAgIGlzRHluYW1pYzogdHJ1ZSxcbiAgICAgICAgICAgIHNvcnRPcmRlcjogMTAwLFxuICAgICAgICAgICAgdGVuYW50U2x1Z1xuICAgICAgICB9XG4gICAgXTtcbiAgICBjb25zdCBzbmlwcGV0cyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6IGBzbmlwXyR7cGFja0lkfV8ke2Nlb0RlZi5hcHBJZH1fb3ZlcnZpZXdgLFxuICAgICAgICAgICAga2V5OiBgJHtwYWNrSWR9LSR7Y2VvRGVmLmFwcElkfS1vdmVydmlld2AsXG4gICAgICAgICAgICBjb250ZW50OiBgIyAke2Nlb0RlZi5hcHBOYW1lfVxcblxcbiR7ZGVjb21wb3NpdGlvbi5jZW9PdmVydmlldy5wdXJwb3NlfWAgKyBgXFxuXFxuQ3Jvc3MtZGVwYXJ0bWVudCBLUElzOiAke2RlY29tcG9zaXRpb24uY2VvT3ZlcnZpZXcua3Bpcy5qb2luKCcsICcpfS5gLFxuICAgICAgICAgICAgY2F0ZWdvcnk6IGBhcHBfJHtjZW9EZWYuYXBwSWR9YFxuICAgICAgICB9LFxuICAgICAgICAuLi5kZWNvbXBvc2l0aW9uLmFwcHMuZmlsdGVyKChhKT0+YS5pZCAhPT0gY2VvRGVmLmFwcElkKS5tYXAoKGEpPT4oe1xuICAgICAgICAgICAgICAgIGlkOiBgc25pcF8ke3BhY2tJZH1fJHtjZW9EZWYuYXBwSWR9X3hyZWZfJHthLmlkfWAsXG4gICAgICAgICAgICAgICAga2V5OiBgJHtwYWNrSWR9LSR7Y2VvRGVmLmFwcElkfS14cmVmLSR7YS5pZH1gLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGAjICR7YS5uYW1lfSAoJHthLmRlcGFydG1lbnR9KVxcblxcbiR7YS5zdW1tYXJ5fVxcblxcblRoaXMgZGVwYXJ0bWVudCBhcHAgZmVlZHMgdGhlIENFTyBPdmVydmlldy4gYCArIGBSZWZlciB0byBpdHMga25vd2xlZGdlIGNhdGVnb3J5IFwiYXBwXyR7YS5pZH1cIiBmb3Igb3BlcmF0aW5nIGRldGFpbHMuYCxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYGFwcF8ke2Nlb0RlZi5hcHBJZH1gXG4gICAgICAgICAgICB9KSlcbiAgICBdO1xuICAgIHJldHVybiB7XG4gICAgICAgIG5hdixcbiAgICAgICAgc25pcHBldHMsXG4gICAgICAgIHV4OiB7XG4gICAgICAgICAgICBhcHBJZDogY2VvRGVmLmFwcElkLFxuICAgICAgICAgICAgYXBwTmFtZTogY2VvRGVmLmFwcE5hbWUsXG4gICAgICAgICAgICBkZXBhcnRtZW50OiBjZW9EZWYuZGVwYXJ0bWVudCxcbiAgICAgICAgICAgIHN0YWdlczogY2VvRGVmLnV4V29ya2Zsb3dcbiAgICAgICAgfVxuICAgIH07XG59XG4iLCAiLyoqXG4gKiBBcHAgUGFjayBcdTIwMTQgTWF0ZXJpYWxpemVyXG4gKlxuICogUGVyc2lzdHMgYSBjb21waWxlZCBhcHAgcGFjayBpbnRvIHRoZSB0ZW5hbnQgREIgdmlhIHJhdyBwZyAod29ya2Zsb3cgc3RlcHNcbiAqIHVzZSBzaG9ydC1saXZlZCBjb25uZWN0aW9ucywgc2FtZSBhcyB3b3JrYm9vay1pbmdlc3QpLiBBbGwgd3JpdGVzIGFyZVxuICogaWRlbXBvdGVudDogcm93cyBhcmUgc2NvcGVkIGJ5IHBhY2tJZCBwcmVmaXggYW5kIHJlcGxhY2VkIG9uIHJlLXJ1bi5cbiAqXG4gKiBEQiBjb25zdHJhaW50cyAoZnJvbSB6ZW5zdGFjay9zY2hlbWEuem1vZGVsKTpcbiAqICAgLSBhcHBfcGFnZXMuc2x1ZyBpcyBVTklRVUUgKGdsb2JhbCkgXHUyMTkyIGZsYXQgcGFja0lkLXByZWZpeGVkIHNsdWdzXG4gKiAgIC0gcGFnZV9zZWN0aW9ucy5ibG9ja190eXBlIGlzIGEgQmxvY2tUeXBlIEVOVU0gXHUyMTkyIGNhc3QgcmVxdWlyZWRcbiAqICAgLSBrbm93bGVkZ2Vfc25pcHBldHMua2V5IGlzIFVOSVFVRSBcdTIxOTIgcGFja0lkLXByZWZpeGVkIGtleXNcbiAqICAgLSBzZWN1cml0eV9ncm91cHMuY29kZSBpcyBVTklRVUUgXHUyMTkyIHVwc2VydCwgbmV2ZXIgZGVsZXRlIChyZWZlcmVuY2VkKVxuICovIGltcG9ydCB7IGNvbXBpbGVBcHBSb3dzLCBjb21waWxlQ2VvUm93cyB9IGZyb20gJy4vYXBwLXBhY2stY29tcGlsZXInO1xuLy8gXHUyNTAwXHUyNTAwIElkZW1wb3RlbnQgRERMIFx1MjAxNCBlbnN1cmVzIHRoZSB0YXJnZXQgREIgaGFzIHRoZSB0YWJsZXMgdGhlIG1hdGVyaWFsaXplclxuLy8gd3JpdGVzIHRvLiBUZW5hbnQgZGF0YWJhc2VzIChwZXItdGVuYW50IE5lb24gYnJhbmNoZXMpIGFyZSBwcm92aXNpb25lZCBlbXB0eVxuLy8gYW5kIG1heSBub3QgaGF2ZSBydW4gdGhlIFplblN0YWNrIG1pZ3JhdGlvbnMgb3IgdGhlIHJvb3Qgc2VlZC1ydW5uZXIgRERMLCBzb1xuLy8gdGhlIG1hdGVyaWFsaXplciBndWFyYW50ZWVzIGl0cyBvd24gc2NoZW1hIGluc3RlYWQgb2YgYXNzdW1pbmcgaXQgZXhpc3RzLlxuLy8gQ29sdW1uIHNoYXBlcyBtaXJyb3IgemVuc3RhY2svc2NoZW1hLnptb2RlbCArIHRoZSBzaGFyZWQgc2VlZCBEREwuXG5jb25zdCBBUFBfUEFDS19FTlVNX0RETCA9IFtcbiAgICBgRE8gJCQgQkVHSU4gQ1JFQVRFIFRZUEUgXCJBdXRoVGllclwiIEFTIEVOVU0gKCdwdWJsaWMnLCAncGluJywgJ2dvb2dsZScpOyBFWENFUFRJT04gV0hFTiBkdXBsaWNhdGVfb2JqZWN0IFRIRU4gTlVMTDsgRU5EICQkYCxcbiAgICBgRE8gJCQgQkVHSU4gQ1JFQVRFIFRZUEUgXCJCbG9ja1R5cGVcIiBBUyBFTlVNICgnaGVybycsICdtZXRyaWNfZ3JpZCcsICdjaGFydF9maW5hbmNpYWwnLCAnbGV2ZXJfYWNjb3JkaW9uJywgJ2FjdGlvbl9jaGVja2xpc3QnLCAnZG9jX21hcmtkb3duJywgJ3BubF90YWJsZScsICd6X3JlcG9ydF9mb3JtJywgJ2Nvc3RzX2Zvcm0nLCAnY2FsZW5kYXJfaW1wb3J0JywgJ2NoYXRfcGFuZWwnLCAna3BpX2NhcmRzJywgJ29wc19hZG1pbl90YWJzJywgJ3Jldmlld19ibG9ja3MnLCAncmVwb3J0c19yb2xsdXAnLCAnc2hlZXRfdmlld2VyJyk7IEVYQ0VQVElPTiBXSEVOIGR1cGxpY2F0ZV9vYmplY3QgVEhFTiBOVUxMOyBFTkQgJCRgLFxuICAgIC8vIE5ld2VyIGJsb2NrIHR5cGVzIG1heSBiZSBtaXNzaW5nIGZyb20gcHJlLWV4aXN0aW5nIGVudW1zLlxuICAgIGBBTFRFUiBUWVBFIFwiQmxvY2tUeXBlXCIgQUREIFZBTFVFIElGIE5PVCBFWElTVFMgJ29wc19hZG1pbl90YWJzJ2AsXG4gICAgYEFMVEVSIFRZUEUgXCJCbG9ja1R5cGVcIiBBREQgVkFMVUUgSUYgTk9UIEVYSVNUUyAncmV2aWV3X2Jsb2NrcydgLFxuICAgIGBBTFRFUiBUWVBFIFwiQmxvY2tUeXBlXCIgQUREIFZBTFVFIElGIE5PVCBFWElTVFMgJ3JlcG9ydHNfcm9sbHVwJ2AsXG4gICAgYEFMVEVSIFRZUEUgXCJCbG9ja1R5cGVcIiBBREQgVkFMVUUgSUYgTk9UIEVYSVNUUyAnc2hlZXRfdmlld2VyJ2AsXG4gICAgYEFMVEVSIFRZUEUgXCJCbG9ja1R5cGVcIiBBREQgVkFMVUUgSUYgTk9UIEVYSVNUUyAncGFja190YWJsZSdgXG5dO1xuY29uc3QgQVBQX1BBQ0tfVEFCTEVfRERMID0gW1xuICAgIGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBzZWN1cml0eV9ncm91cHMgKFxuICAgIGlkIFRFWFQgUFJJTUFSWSBLRVkgREVGQVVMVCBnZW5fcmFuZG9tX3V1aWQoKSxcbiAgICBjb2RlIFRFWFQgTk9UIE5VTEwgVU5JUVVFLFxuICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICBkZXNjcmlwdGlvbiBURVhULFxuICAgIGlzX3N5c3RlbSBCT09MRUFOIE5PVCBOVUxMIERFRkFVTFQgZmFsc2UsXG4gICAgcGVybWlzc2lvbnMgVEVYVFtdIE5PVCBOVUxMIERFRkFVTFQgJ3t9JyxcbiAgICBjcmVhdGVkX2F0IFRJTUVTVEFNUCBXSVRIT1VUIFRJTUUgWk9ORSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gIClgLFxuICAgIGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBhcHBfcGFnZXMgKFxuICAgIGlkIFRFWFQgUFJJTUFSWSBLRVksXG4gICAgc2x1ZyBURVhUIE5PVCBOVUxMIFVOSVFVRSxcbiAgICB0aXRsZSBURVhUIE5PVCBOVUxMLFxuICAgIGF1dGhfdGllciBcIkF1dGhUaWVyXCIgTk9UIE5VTEwgREVGQVVMVCAncHVibGljJyxcbiAgICBzb3J0X29yZGVyIElOVEVHRVIgTk9UIE5VTEwgREVGQVVMVCAwLFxuICAgIG5hdl9sYWJlbCBURVhULFxuICAgIHNob3dfaW5fbmF2IEJPT0xFQU4gTk9UIE5VTEwgREVGQVVMVCB0cnVlLFxuICAgIHRlbmFudF9zbHVnIFRFWFRcbiAgKWAsXG4gICAgYENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHBhZ2Vfc2VjdGlvbnMgKFxuICAgIGlkIFRFWFQgUFJJTUFSWSBLRVksXG4gICAgcGFnZV9pZCBURVhUIE5PVCBOVUxMIFJFRkVSRU5DRVMgYXBwX3BhZ2VzKGlkKSBPTiBERUxFVEUgQ0FTQ0FERSxcbiAgICBzb3J0X29yZGVyIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgYmxvY2tfdHlwZSBcIkJsb2NrVHlwZVwiIE5PVCBOVUxMLFxuICAgIGNvbmZpZyBKU09OQiBOT1QgTlVMTCBERUZBVUxUICd7fSdcbiAgKWAsXG4gICAgYENSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIHBhZ2Vfc2VjdGlvbnNfcGFnZV9pZF9zb3J0X29yZGVyX2lkeCBPTiBwYWdlX3NlY3Rpb25zKHBhZ2VfaWQsIHNvcnRfb3JkZXIpYCxcbiAgICBgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgbmF2aWdhdGlvbl9pdGVtcyAoXG4gICAgaWQgVEVYVCBQUklNQVJZIEtFWSxcbiAgICBwYXJlbnRfaWQgVEVYVCBSRUZFUkVOQ0VTIG5hdmlnYXRpb25faXRlbXMoaWQpIE9OIERFTEVURSBTRVQgTlVMTCxcbiAgICBzb3J0X29yZGVyIElOVEVHRVIgTk9UIE5VTEwgREVGQVVMVCAwLFxuICAgIHRpdGxlIFRFWFQgTk9UIE5VTEwsXG4gICAgcGF0aCBURVhUIE5PVCBOVUxMIERFRkFVTFQgJycsXG4gICAgaWNvbiBURVhUIE5PVCBOVUxMIERFRkFVTFQgJycsXG4gICAgYXV0aF90aWVyIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAncHVibGljJyxcbiAgICB0ZW5hbnRfc2x1ZyBURVhULFxuICAgIGlzX2FjdGl2ZSBCT09MRUFOIE5PVCBOVUxMIERFRkFVTFQgdHJ1ZSxcbiAgICByZXF1aXJlZF9ncm91cHMgVEVYVCBOT1QgTlVMTCBERUZBVUxUICcnLFxuICAgIGlzX3Zpc2libGUgQk9PTEVBTiBOT1QgTlVMTCBERUZBVUxUIHRydWUsXG4gICAgaXNfZHluYW1pYyBCT09MRUFOIE5PVCBOVUxMIERFRkFVTFQgZmFsc2UsXG4gICAgaXNfZGVmYXVsdCBCT09MRUFOIE5PVCBOVUxMIERFRkFVTFQgZmFsc2UsXG4gICAgY3JlYXRlZF9hdCBUSU1FU1RBTVAgTk9UIE5VTEwgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICB1cGRhdGVkX2F0IFRJTUVTVEFNUCBOT1QgTlVMTCBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gIClgLFxuICAgIGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBrbm93bGVkZ2Vfc25pcHBldHMgKFxuICAgIGlkIFRFWFQgUFJJTUFSWSBLRVksXG4gICAga2V5IFRFWFQgTk9UIE5VTEwgVU5JUVVFLFxuICAgIGNvbnRlbnQgVEVYVCBOT1QgTlVMTCxcbiAgICBjYXRlZ29yeSBURVhUIE5PVCBOVUxMXG4gIClgXG5dO1xuLyoqIENvbHVtbiBiYWNrZmlsbHMgZm9yIERCcyB3aGVyZSB0aGUgdGFibGVzIHByZS1kYXRlIHRoZXNlIGNvbHVtbnMuICovIGNvbnN0IEFQUF9QQUNLX1RBQkxFX0FMVEVSUyA9IFtcbiAgICBgQUxURVIgVEFCTEUgYXBwX3BhZ2VzIEFERCBDT0xVTU4gSUYgTk9UIEVYSVNUUyBuYXZfbGFiZWwgVEVYVGAsXG4gICAgYEFMVEVSIFRBQkxFIGFwcF9wYWdlcyBBREQgQ09MVU1OIElGIE5PVCBFWElTVFMgc2hvd19pbl9uYXYgQk9PTEVBTiBOT1QgTlVMTCBERUZBVUxUIHRydWVgLFxuICAgIGBBTFRFUiBUQUJMRSBhcHBfcGFnZXMgQUREIENPTFVNTiBJRiBOT1QgRVhJU1RTIHRlbmFudF9zbHVnIFRFWFRgLFxuICAgIGBBTFRFUiBUQUJMRSBuYXZpZ2F0aW9uX2l0ZW1zIEFERCBDT0xVTU4gSUYgTk9UIEVYSVNUUyB0ZW5hbnRfc2x1ZyBURVhUYCxcbiAgICBgQUxURVIgVEFCTEUgbmF2aWdhdGlvbl9pdGVtcyBBREQgQ09MVU1OIElGIE5PVCBFWElTVFMgaXNfYWN0aXZlIEJPT0xFQU4gTk9UIE5VTEwgREVGQVVMVCB0cnVlYCxcbiAgICBgQUxURVIgVEFCTEUgbmF2aWdhdGlvbl9pdGVtcyBBREQgQ09MVU1OIElGIE5PVCBFWElTVFMgaXNfZHluYW1pYyBCT09MRUFOIE5PVCBOVUxMIERFRkFVTFQgZmFsc2VgLFxuICAgIGBBTFRFUiBUQUJMRSBuYXZpZ2F0aW9uX2l0ZW1zIEFERCBDT0xVTU4gSUYgTk9UIEVYSVNUUyBpc19kZWZhdWx0IEJPT0xFQU4gTk9UIE5VTEwgREVGQVVMVCBmYWxzZWBcbl07XG4vKiogUnVuIGJlZm9yZSBtYXRlcmlhbGl6YXRpb24gc28gd3JpdGVzIG5ldmVyIGhpdCBtaXNzaW5nIHRhYmxlcy9jb2x1bW5zLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5zdXJlQXBwUGFja1RhYmxlcyhjbGllbnQpIHtcbiAgICBmb3IgKGNvbnN0IHN0bXQgb2YgQVBQX1BBQ0tfRU5VTV9EREwpe1xuICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoc3RtdCk7XG4gICAgfVxuICAgIGZvciAoY29uc3Qgc3RtdCBvZiBBUFBfUEFDS19UQUJMRV9EREwpe1xuICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoc3RtdCk7XG4gICAgfVxuICAgIGZvciAoY29uc3Qgc3RtdCBvZiBBUFBfUEFDS19UQUJMRV9BTFRFUlMpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KHN0bXQpO1xuICAgICAgICB9IGNhdGNoICB7XG4gICAgICAgIC8vIENvbHVtbiBtYXkgYWxyZWFkeSBleGlzdCBvciB0aGUgdGFibGUgbWF5IGJlIG1pc3NpbmcgXHUyMDE0IGlnbm9yZS5cbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKiBVcHNlcnQgdGhlIHBlci1hcHAgc2VjdXJpdHkgZ3JvdXAgKGNvZGUgPSBhcHBfPGFwcElkPikuIE5ldmVyIGRlbGV0ZXMuICovIGFzeW5jIGZ1bmN0aW9uIHVwc2VydFNlY3VyaXR5R3JvdXBzKGNsaWVudCwgYXBwcykge1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgZm9yIChjb25zdCBhcHAgb2YgYXBwcyl7XG4gICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8gc2VjdXJpdHlfZ3JvdXBzIChpZCwgY29kZSwgbmFtZSwgZGVzY3JpcHRpb24sIGlzX3N5c3RlbSwgcGVybWlzc2lvbnMsIGNyZWF0ZWRfYXQpXG4gICAgICAgVkFMVUVTICgkMSwgJDIsICQzLCAkNCwgZmFsc2UsIEFSUkFZW106OnRleHRbXSwgTk9XKCkpXG4gICAgICAgT04gQ09ORkxJQ1QgKGNvZGUpIERPIFVQREFURSBTRVQgbmFtZSA9IEVYQ0xVREVELm5hbWUsIGRlc2NyaXB0aW9uID0gRVhDTFVERUQuZGVzY3JpcHRpb247YCwgW1xuICAgICAgICAgICAgYHNnXyR7YXBwLmFwcElkfWAsXG4gICAgICAgICAgICBhcHAuc2VjdXJpdHlHcm91cENvZGUsXG4gICAgICAgICAgICBhcHAuc2VjdXJpdHlHcm91cE5hbWUsXG4gICAgICAgICAgICBgTWVtYmVycyBjYW4gYWNjZXNzIHRoZSAke2FwcC5hcHBOYW1lfSBhcHAuYFxuICAgICAgICBdKTtcbiAgICAgICAgY291bnQrKztcbiAgICB9XG4gICAgcmV0dXJuIGNvdW50O1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1hdGVyaWFsaXplQXBwUGFjayhjbGllbnQsIGlucHV0KSB7XG4gICAgY29uc3QgeyBwYWNrSWQsIHRlbmFudFNsdWcsIGRlY29tcG9zaXRpb24sIGFwcHMsIGRlZmluaXRpb25zIH0gPSBpbnB1dDtcbiAgICBjb25zdCBjb3VudHMgPSB7XG4gICAgICAgIGFwcHM6IDAsXG4gICAgICAgIHBhZ2VzOiAwLFxuICAgICAgICBzZWN0aW9uczogMCxcbiAgICAgICAgbmF2OiAwLFxuICAgICAgICBzbmlwcGV0czogMCxcbiAgICAgICAgZ3JvdXBzOiAwXG4gICAgfTtcbiAgICAvLyBHdWFyYW50ZWUgdGhlIHRhcmdldCB0YWJsZXMgZXhpc3QgKHRlbmFudCBEQnMgbWF5IGJlIHByb3Zpc2lvbmVkIGVtcHR5KS5cbiAgICBhd2FpdCBlbnN1cmVBcHBQYWNrVGFibGVzKGNsaWVudCk7XG4gICAgLy8gMS4gU2VjdXJpdHkgZ3JvdXBzIGZvciBldmVyeSBhcHAuXG4gICAgY291bnRzLmdyb3VwcyA9IGF3YWl0IHVwc2VydFNlY3VyaXR5R3JvdXBzKGNsaWVudCwgYXBwcyk7XG4gICAgLy8gMi4gUGFnZXMgKyBzZWN0aW9ucyBcdTIwMTQgc2NvcGVkIHJlcGxhY2UgKHBhY2sgcGFnZXMgb25seSkuXG4gICAgY29uc3QgcGFnZVNsdWdQcmVmaXggPSBgJHtwYWNrSWR9LSVgO1xuICAgIGF3YWl0IGNsaWVudC5xdWVyeShgREVMRVRFIEZST00gYXBwX3BhZ2VzIFdIRVJFIHNsdWcgTElLRSAkMSBBTkQgdGVuYW50X3NsdWcgPSAkMjtgLCBbXG4gICAgICAgIHBhZ2VTbHVnUHJlZml4LFxuICAgICAgICB0ZW5hbnRTbHVnXG4gICAgXSk7XG4gICAgLy8gTmF2IFx1MjAxNCBzY29wZWQgcmVwbGFjZSAocGFjayBuYXYgaXRlbXMgb25seSkuIE5hdiBpZHMgYXJlIGRldGVybWluaXN0aWNcbiAgICAvLyAobmF2XzxwYWNrSWQ+XzxhcHBJZD5bXzxzZWc+XSkgYW5kIHRoZSBQSywgc28gYSByZS1ydW4gb2YgdGhlIHNhbWUgcGFja0lkXG4gICAgLy8gd291bGQgb3RoZXJ3aXNlIGZhaWwgd2l0aCBhIGR1cGxpY2F0ZS1rZXkgdmlvbGF0aW9uLlxuICAgIGF3YWl0IGNsaWVudC5xdWVyeShgREVMRVRFIEZST00gbmF2aWdhdGlvbl9pdGVtcyBXSEVSRSBpZCBMSUtFICQxIEFORCB0ZW5hbnRfc2x1ZyA9ICQyO2AsIFtcbiAgICAgICAgYG5hdl8ke3BhY2tJZH1fJWAsXG4gICAgICAgIHRlbmFudFNsdWdcbiAgICBdKTtcbiAgICBjb25zdCBkZWZzID0gW1xuICAgICAgICAuLi5kZWZpbml0aW9uc1xuICAgIF07XG4gICAgLy8gQ0VPIE92ZXJ2aWV3IGRlZiBpcyBsYXN0IGluIGRlY29tcG9zaXRpb24uYXBwcyBvcmRlciAoZ3VhcmFudGVlZCBieSBnZW5lcmF0b3IpLlxuICAgIGNvbnN0IGNlb0RlZiA9IGRlZnNbZGVmcy5sZW5ndGggLSAxXTtcbiAgICBjb25zdCBkZXB0RGVmcyA9IGRlZnMuc2xpY2UoMCwgLTEpO1xuICAgIGZvciAoY29uc3QgZGVmIG9mIGRlcHREZWZzKXtcbiAgICAgICAgY29uc3Qgcm93cyA9IGNvbXBpbGVBcHBSb3dzKGRlZiwgdGVuYW50U2x1ZywgcGFja0lkKTtcbiAgICAgICAgZm9yIChjb25zdCBwYWdlIG9mIHJvd3MucGFnZXMpe1xuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBhcHBfcGFnZXMgKGlkLCBzbHVnLCB0aXRsZSwgYXV0aF90aWVyLCBzb3J0X29yZGVyLCBuYXZfbGFiZWwsIHNob3dfaW5fbmF2LCB0ZW5hbnRfc2x1ZylcbiAgICAgICAgIFZBTFVFUyAoJDEsICQyLCAkMywgQ0FTVCgkNCBBUyBcIkF1dGhUaWVyXCIpLCAkNSwgJDYsICQ3LCAkOCk7YCwgW1xuICAgICAgICAgICAgICAgIHBhZ2UuaWQsXG4gICAgICAgICAgICAgICAgcGFnZS5zbHVnLFxuICAgICAgICAgICAgICAgIHBhZ2UudGl0bGUsXG4gICAgICAgICAgICAgICAgcGFnZS5hdXRoVGllcixcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIHBhZ2UubmF2TGFiZWwsXG4gICAgICAgICAgICAgICAgcGFnZS5zaG93SW5OYXYsXG4gICAgICAgICAgICAgICAgdGVuYW50U2x1Z1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudHMucGFnZXMrKztcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBwYWdlLnNlY3Rpb25zLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIHBhZ2Vfc2VjdGlvbnMgKGlkLCBwYWdlX2lkLCBzb3J0X29yZGVyLCBibG9ja190eXBlLCBjb25maWcpXG4gICAgICAgICAgIFZBTFVFUyAoJDEsICQyLCAkMywgQ0FTVCgkNCBBUyBcIkJsb2NrVHlwZVwiKSwgQ0FTVCgkNSBBUyBqc29uYikpO2AsIFtcbiAgICAgICAgICAgICAgICAgICAgYCR7cGFnZS5pZH06c2VjdGlvbjoke2l9YCxcbiAgICAgICAgICAgICAgICAgICAgcGFnZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgICAgcGFnZS5zZWN0aW9uc1tpXS5ibG9ja1R5cGUsXG4gICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHBhZ2Uuc2VjdGlvbnNbaV0uY29uZmlnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIGNvdW50cy5zZWN0aW9ucysrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE5hdiBmb3IgdGhpcyBhcHAuXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByb3dzLm5hdil7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIG5hdmlnYXRpb25faXRlbXMgKGlkLCBwYXJlbnRfaWQsIHNvcnRfb3JkZXIsIHRpdGxlLCBwYXRoLCBpY29uLCBhdXRoX3RpZXIsIHRlbmFudF9zbHVnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlLCByZXF1aXJlZF9ncm91cHMsIGlzX3Zpc2libGUsIGlzX2R5bmFtaWMsIGlzX2RlZmF1bHQsIGNyZWF0ZWRfYXQsIHVwZGF0ZWRfYXQpXG4gICAgICAgICBWQUxVRVMgKCQxLCBOVUxMLCAkMiwgJDMsICQ0LCAkNSwgQ0FTVCgncGluJyBBUyBcIkF1dGhUaWVyXCIpLCAkNiwgdHJ1ZSwgJDcsIHRydWUsICQ4LCBmYWxzZSwgTk9XKCksIE5PVygpKTtgLCBbXG4gICAgICAgICAgICAgICAgaXRlbS5pZCxcbiAgICAgICAgICAgICAgICBpdGVtLnNvcnRPcmRlcixcbiAgICAgICAgICAgICAgICBpdGVtLnRpdGxlLFxuICAgICAgICAgICAgICAgIGl0ZW0ucGF0aCxcbiAgICAgICAgICAgICAgICBpdGVtLmljb24sXG4gICAgICAgICAgICAgICAgdGVuYW50U2x1ZyxcbiAgICAgICAgICAgICAgICBpdGVtLnJlcXVpcmVkR3JvdXBzLFxuICAgICAgICAgICAgICAgIGl0ZW0uaXNEeW5hbWljXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvdW50cy5uYXYrKztcbiAgICAgICAgfVxuICAgICAgICAvLyBTbmlwcGV0cyBmb3IgdGhpcyBhcHAuXG4gICAgICAgIGZvciAoY29uc3Qgc25pcCBvZiByb3dzLnNuaXBwZXRzKXtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjb250ZW50LCBjYXRlZ29yeSkgVkFMVUVTICgkMSwgJDIsICQzLCAkNClcbiAgICAgICAgIE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQsIGNhdGVnb3J5ID0gRVhDTFVERUQuY2F0ZWdvcnk7YCwgW1xuICAgICAgICAgICAgICAgIHNuaXAuaWQsXG4gICAgICAgICAgICAgICAgc25pcC5rZXksXG4gICAgICAgICAgICAgICAgc25pcC5jb250ZW50LFxuICAgICAgICAgICAgICAgIHNuaXAuY2F0ZWdvcnlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY291bnRzLnNuaXBwZXRzKys7XG4gICAgICAgIH1cbiAgICAgICAgY291bnRzLmFwcHMrKztcbiAgICB9XG4gICAgLy8gMy4gQ0VPIE92ZXJ2aWV3IChsYXN0IGFwcCk6IHBhZ2VzICsgbmF2ICsgY3Jvc3MtZGVwYXJ0bWVudCBzbmlwcGV0cy5cbiAgICBjb25zdCBjZW9Sb3dzID0gY29tcGlsZUNlb1Jvd3MoZGVjb21wb3NpdGlvbiwgY2VvRGVmLCB0ZW5hbnRTbHVnLCBwYWNrSWQpO1xuICAgIGNvbnN0IHJvb3RTbHVnID0gYCR7cGFja0lkfS0ke2Nlb0RlZi5hcHBJZH1gO1xuICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8gYXBwX3BhZ2VzIChpZCwgc2x1ZywgdGl0bGUsIGF1dGhfdGllciwgc29ydF9vcmRlciwgbmF2X2xhYmVsLCBzaG93X2luX25hdiwgdGVuYW50X3NsdWcpXG4gICAgIFZBTFVFUyAoJDEsICQyLCAkMywgQ0FTVCgkNCBBUyBcIkF1dGhUaWVyXCIpLCAkNSwgJDYsICQ3LCAkOCk7YCwgW1xuICAgICAgICBgcGFnZV8ke3BhY2tJZH1fJHtjZW9EZWYuYXBwSWR9YCxcbiAgICAgICAgcm9vdFNsdWcsXG4gICAgICAgIGNlb0RlZi5hcHBOYW1lLFxuICAgICAgICAncGluJyxcbiAgICAgICAgMCxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIHRlbmFudFNsdWdcbiAgICBdKTtcbiAgICBjb3VudHMucGFnZXMrKztcbiAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIHBhZ2Vfc2VjdGlvbnMgKGlkLCBwYWdlX2lkLCBzb3J0X29yZGVyLCBibG9ja190eXBlLCBjb25maWcpXG4gICAgIFZBTFVFUyAoJDEsICQyLCAkMywgQ0FTVCgkNCBBUyBcIkJsb2NrVHlwZVwiKSwgQ0FTVCgkNSBBUyBqc29uYikpO2AsIFtcbiAgICAgICAgYHBhZ2VfJHtwYWNrSWR9XyR7Y2VvRGVmLmFwcElkfTpzZWN0aW9uOjBgLFxuICAgICAgICBgcGFnZV8ke3BhY2tJZH1fJHtjZW9EZWYuYXBwSWR9YCxcbiAgICAgICAgMCxcbiAgICAgICAgJ2hlcm8nLFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICB0aXRsZTogY2VvRGVmLmFwcE5hbWVcbiAgICAgICAgfSlcbiAgICBdKTtcbiAgICBjb3VudHMuc2VjdGlvbnMrKztcbiAgICBmb3IgKGNvbnN0IGRlZiBvZiBbXG4gICAgICAgIGNlb0RlZlxuICAgIF0pe1xuICAgICAgICBjb25zdCByb3dzID0gY29tcGlsZUFwcFJvd3MoZGVmLCB0ZW5hbnRTbHVnLCBwYWNrSWQpO1xuICAgICAgICBmb3IgKGNvbnN0IHBhZ2Ugb2Ygcm93cy5wYWdlcy5zbGljZSgxKSl7XG4gICAgICAgICAgICAvLyBDRU8gcGFnZXMgYmV5b25kIHRoZSByb290LlxuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KGBJTlNFUlQgSU5UTyBhcHBfcGFnZXMgKGlkLCBzbHVnLCB0aXRsZSwgYXV0aF90aWVyLCBzb3J0X29yZGVyLCBuYXZfbGFiZWwsIHNob3dfaW5fbmF2LCB0ZW5hbnRfc2x1ZylcbiAgICAgICAgIFZBTFVFUyAoJDEsICQyLCAkMywgQ0FTVCgkNCBBUyBcIkF1dGhUaWVyXCIpLCAkNSwgJDYsICQ3LCAkOCk7YCwgW1xuICAgICAgICAgICAgICAgIHBhZ2UuaWQsXG4gICAgICAgICAgICAgICAgcGFnZS5zbHVnLFxuICAgICAgICAgICAgICAgIHBhZ2UudGl0bGUsXG4gICAgICAgICAgICAgICAgcGFnZS5hdXRoVGllcixcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIHBhZ2UubmF2TGFiZWwsXG4gICAgICAgICAgICAgICAgcGFnZS5zaG93SW5OYXYsXG4gICAgICAgICAgICAgICAgdGVuYW50U2x1Z1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudHMucGFnZXMrKztcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBwYWdlLnNlY3Rpb25zLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIHBhZ2Vfc2VjdGlvbnMgKGlkLCBwYWdlX2lkLCBzb3J0X29yZGVyLCBibG9ja190eXBlLCBjb25maWcpXG4gICAgICAgICAgIFZBTFVFUyAoJDEsICQyLCAkMywgQ0FTVCgkNCBBUyBcIkJsb2NrVHlwZVwiKSwgQ0FTVCgkNSBBUyBqc29uYikpO2AsIFtcbiAgICAgICAgICAgICAgICAgICAgYCR7cGFnZS5pZH06c2VjdGlvbjoke2l9YCxcbiAgICAgICAgICAgICAgICAgICAgcGFnZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgICAgcGFnZS5zZWN0aW9uc1tpXS5ibG9ja1R5cGUsXG4gICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHBhZ2Uuc2VjdGlvbnNbaV0uY29uZmlnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIGNvdW50cy5zZWN0aW9ucysrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByb3dzLm5hdil7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYElOU0VSVCBJTlRPIG5hdmlnYXRpb25faXRlbXMgKGlkLCBwYXJlbnRfaWQsIHNvcnRfb3JkZXIsIHRpdGxlLCBwYXRoLCBpY29uLCBhdXRoX3RpZXIsIHRlbmFudF9zbHVnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlLCByZXF1aXJlZF9ncm91cHMsIGlzX3Zpc2libGUsIGlzX2R5bmFtaWMsIGlzX2RlZmF1bHQsIGNyZWF0ZWRfYXQsIHVwZGF0ZWRfYXQpXG4gICAgICAgICBWQUxVRVMgKCQxLCBOVUxMLCAkMiwgJDMsICQ0LCAkNSwgQ0FTVCgncGluJyBBUyBcIkF1dGhUaWVyXCIpLCAkNiwgdHJ1ZSwgJDcsIHRydWUsICQ4LCBmYWxzZSwgTk9XKCksIE5PVygpKTtgLCBbXG4gICAgICAgICAgICAgICAgaXRlbS5pZCxcbiAgICAgICAgICAgICAgICBpdGVtLnNvcnRPcmRlcixcbiAgICAgICAgICAgICAgICBpdGVtLnRpdGxlLFxuICAgICAgICAgICAgICAgIGl0ZW0ucGF0aCxcbiAgICAgICAgICAgICAgICBpdGVtLmljb24sXG4gICAgICAgICAgICAgICAgdGVuYW50U2x1ZyxcbiAgICAgICAgICAgICAgICBpdGVtLnJlcXVpcmVkR3JvdXBzLFxuICAgICAgICAgICAgICAgIGl0ZW0uaXNEeW5hbWljXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvdW50cy5uYXYrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IHNuaXAgb2YgY2VvUm93cy5zbmlwcGV0cyl7XG4gICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjb250ZW50LCBjYXRlZ29yeSkgVkFMVUVTICgkMSwgJDIsICQzLCAkNClcbiAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50LCBjYXRlZ29yeSA9IEVYQ0xVREVELmNhdGVnb3J5O2AsIFtcbiAgICAgICAgICAgIHNuaXAuaWQsXG4gICAgICAgICAgICBzbmlwLmtleSxcbiAgICAgICAgICAgIHNuaXAuY29udGVudCxcbiAgICAgICAgICAgIHNuaXAuY2F0ZWdvcnlcbiAgICAgICAgXSk7XG4gICAgICAgIGNvdW50cy5zbmlwcGV0cysrO1xuICAgIH1cbiAgICBjb3VudHMuYXBwcysrO1xuICAgIHJldHVybiBjb3VudHM7XG59XG4iLCAiLyoqXG4gKiBBcHAgUGFjayBcdTIwMTQgU2NoZW1hIEFwcGx5XG4gKlxuICogQ29tcGlsZXMgdGhlIHBhY2sncyBhcHAgZGVmaW5pdGlvbnMgaW50byBhIHNpbmdsZSBjb25zb2xpZGF0ZWQgWmVuU3RhY2tcbiAqIHptb2RlbCAoYXVkaXQgcHJldmlldyAvIHJlc3VsdCBhcnRpZmFjdCkgYW5kIGFwcGxpZXMgdGhlIHBhY2sncyBtb2RlbHMgdG9cbiAqIHRoZSB0YXJnZXQgdGVuYW50IGRhdGFiYXNlIGFzIHJlYWwgdGFibGVzIHZpYSBhZGRpdGl2ZSByYXcgRERMLlxuICpcbiAqIFdoeSByYXcgRERMIGluc3RlYWQgb2YgYHJ1bk1pZ3JhdGlvbnNgICh6ZW5zdGFjayBnZW5lcmF0ZSArIHByaXNtYSBkYiBwdXNoKT9cbiAqIGBwcmlzbWEgZGIgcHVzaCAtLWFjY2VwdC1kYXRhLWxvc3NgIERST1BTIHRhYmxlcyB0aGF0IGFyZSBub3QgcHJlc2VudCBpblxuICogdGhlIHNjaGVtYS4gVGhlIHBhY2sgem1vZGVsIGNvbnRhaW5zIG9ubHkgdGhlIHBhY2sncyBtb2RlbHMsIHNvIHB1c2hpbmcgaXRcbiAqIGFnYWluc3QgdGhlIHJvb3QgREIgb3IgYSBmYWN0b3J5LWNyZWF0ZWQgdGVuYW50IERCICh3aGljaCBib3RoIGhvbGQgbWFueVxuICogb3RoZXIgdGFibGVzKSB3b3VsZCBkZWxldGUgdGhlbS4gQWRkaXRpdmUgYENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTYFxuICogY3JlYXRlcyB0aGUgcGFjaydzIHRhYmxlcyB3aXRob3V0IHRvdWNoaW5nIGFueXRoaW5nIGVsc2UgXHUyMDE0IHNhZmUgYWdhaW5zdFxuICogZXZlcnkgdGFyZ2V0LCBpZGVtcG90ZW50IG9uIHJlLXJ1biwgYW5kIGNvbnNpc3RlbnQgd2l0aCB0aGUgbWF0ZXJpYWxpemVyLlxuICpcbiAqIENvbHVtbiBzaGFwZXMgbWlycm9yIHdoYXQgY29tcGlsZVRvWk1vZGVsIGVtaXRzIChmaWVsZCBuYW1lcyBhcy1pcywgYmFzZVxuICogY29sdW1ucyBpZC90ZW5hbnRfc2x1Zy9jcmVhdGVkX2F0L3VwZGF0ZWRfYXQpIHNvIHRoZSB0YWJsZXMgbWF0Y2ggdGhlXG4gKiB6bW9kZWwgcHJldmlldyBhbmQgdGhlIGdlbmVyYXRlZCBQcmlzbWEgY2xpZW50LlxuICovIGltcG9ydCB7IGNvbXBpbGVUb1pNb2RlbCB9IGZyb20gJ0AvZG9tYWluL2FpL3ptb2RlbC1jb21waWxlcic7XG4vLyBcdTI1MDBcdTI1MDAgRmllbGQgdHlwZSBtYXBwaW5nIChtaXJyb3JzIHptb2RlbC1jb21waWxlciBtYXBGaWVsZFR5cGUpIFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gbWFwU3FsVHlwZShmaWVsZFR5cGUpIHtcbiAgICBzd2l0Y2goZmllbGRUeXBlKXtcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIHJldHVybiAnVEVYVCc7XG4gICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgcmV0dXJuICdURVhUJztcbiAgICAgICAgY2FzZSAnaW50ZWdlcic6XG4gICAgICAgICAgICByZXR1cm4gJ0lOVEVHRVInO1xuICAgICAgICBjYXNlICdkZWNpbWFsJzpcbiAgICAgICAgICAgIHJldHVybiAnTlVNRVJJQygxNCwyKSc7XG4gICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgcmV0dXJuICdCT09MRUFOJztcbiAgICAgICAgY2FzZSAnZGF0ZXRpbWUnOlxuICAgICAgICAgICAgcmV0dXJuICdUSU1FU1RBTVAnO1xuICAgICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiAnREFURSc7XG4gICAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgICAgICAgcmV0dXJuICdUSU1FJztcbiAgICAgICAgY2FzZSAnZW51bSc6XG4gICAgICAgICAgICByZXR1cm4gJ1RFWFQnO1xuICAgICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgICAgIHJldHVybiAnSlNPTkInO1xuICAgICAgICBjYXNlICdyZWxhdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gJ1RFWFQnO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICdURVhUJztcbiAgICB9XG59XG5mdW5jdGlvbiBtYXBTcWxEZWZhdWx0KGZpZWxkKSB7XG4gICAgY29uc3QgZCA9IGZpZWxkLmRlZmF1bHQ7XG4gICAgaWYgKGQgPT09IHVuZGVmaW5lZCB8fCBkID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICBpZiAodHlwZW9mIGQgPT09ICdzdHJpbmcnKSByZXR1cm4gYERFRkFVTFQgJyR7ZC5yZXBsYWNlKC8nL2csIFwiJydcIil9J2A7XG4gICAgaWYgKHR5cGVvZiBkID09PSAnYm9vbGVhbicpIHJldHVybiBgREVGQVVMVCAke2R9YDtcbiAgICBpZiAodHlwZW9mIGQgPT09ICdudW1iZXInKSByZXR1cm4gYERFRkFVTFQgJHtkfWA7XG4gICAgcmV0dXJuIG51bGw7IC8vIGFycmF5cy9vYmplY3RzIFx1MjAxNCBza2lwICh6bW9kZWwgbWFwcyB0aGVtIHRvIFN0cmluZyBhbnl3YXkpXG59XG4vKiogQnVpbGQgdGhlIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHN0YXRlbWVudCBmb3Igb25lIG1vZGVsLiAqLyBmdW5jdGlvbiBjb21waWxlVGFibGVEREwobW9kZWwpIHtcbiAgICBjb25zdCBjb2x1bW5zID0gW1xuICAgICAgICAnaWQgVEVYVCBQUklNQVJZIEtFWScsXG4gICAgICAgICd0ZW5hbnRfc2x1ZyBURVhUJ1xuICAgIF07XG4gICAgZm9yIChjb25zdCBmIG9mIG1vZGVsLmZpZWxkcyl7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBtYXBTcWxUeXBlKGYudHlwZSk7XG4gICAgICAgIGNvbnN0IG51bGxhYmxlID0gZi5yZXF1aXJlZCA/ICdOT1QgTlVMTCcgOiAnJztcbiAgICAgICAgY29uc3QgdW5pcXVlID0gZi51bmlxdWUgPyAnVU5JUVVFJyA6ICcnO1xuICAgICAgICBjb25zdCBkZWYgPSBtYXBTcWxEZWZhdWx0KGYpO1xuICAgICAgICBjb2x1bW5zLnB1c2goYCAgJHtmLm5hbWV9ICR7dHlwZX0gJHtudWxsYWJsZX0gJHt1bmlxdWV9ICR7ZGVmID8/ICcnfWAucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKSk7XG4gICAgfVxuICAgIGNvbHVtbnMucHVzaCgnY3JlYXRlZF9hdCBUSU1FU1RBTVAgTk9UIE5VTEwgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCcpO1xuICAgIGNvbHVtbnMucHVzaCgndXBkYXRlZF9hdCBUSU1FU1RBTVAgTk9UIE5VTEwgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCcpO1xuICAgIHJldHVybiBgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgXCIke21vZGVsLnRhYmxlTmFtZX1cIiAoXFxuJHtjb2x1bW5zLmpvaW4oJyxcXG4nKX1cXG4pO2A7XG59XG4vKiogQ29sdW1uIGJhY2tmaWxscyBmb3IgdGFibGVzIHRoYXQgcHJlLWRhdGUgdGhlIHBhY2sncyBjb2x1bW5zLiAqLyBmdW5jdGlvbiBjb21waWxlVGFibGVBbHRlcnMobW9kZWwpIHtcbiAgICBjb25zdCBhbHRlcnMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGYgb2YgbW9kZWwuZmllbGRzKXtcbiAgICAgICAgY29uc3QgdHlwZSA9IG1hcFNxbFR5cGUoZi50eXBlKTtcbiAgICAgICAgY29uc3QgbnVsbGFibGUgPSBmLnJlcXVpcmVkID8gJ05PVCBOVUxMJyA6ICcnO1xuICAgICAgICBjb25zdCBkZWYgPSBtYXBTcWxEZWZhdWx0KGYpO1xuICAgICAgICBhbHRlcnMucHVzaChgQUxURVIgVEFCTEUgXCIke21vZGVsLnRhYmxlTmFtZX1cIiBBREQgQ09MVU1OIElGIE5PVCBFWElTVFMgJHtmLm5hbWV9ICR7dHlwZX0gJHtudWxsYWJsZX0gJHtkZWYgPz8gJyd9YC5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFsdGVycztcbn1cbi8qKlxuICogQnVpbGQgYSBzaW5nbGUgY29uc29saWRhdGVkIHptb2RlbCBmcm9tIGV2ZXJ5IGFwcCBkZWZpbml0aW9uIFx1MjAxNCBvbmVcbiAqIGRhdGFzb3VyY2UvZ2VuZXJhdG9yL2VudW0gaGVhZGVyIHBsdXMgYWxsIG1vZGVscyBcdTIwMTQgcmV1c2luZyB0aGUgc2hhcmVkXG4gKiBjb21waWxlVG9aTW9kZWwuIE1vZGVsIG5hbWVzIGFyZSBrZXB0IGFzIGdlbmVyYXRlZDsgb24gYSBuYW1lIGNvbGxpc2lvblxuICogdGhlIGxhdGVyIG1vZGVsIGlzIHN1ZmZpeGVkIHdpdGggaXRzIGFwcCBpZCBzbyB0aGUgc2NoZW1hIHN0YXlzIHZhbGlkLlxuICovIGV4cG9ydCBmdW5jdGlvbiBjb21waWxlUGFja1pNb2RlbChkZWZpbml0aW9ucykge1xuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgbW9kZWxzID0gZGVmaW5pdGlvbnMuZmxhdE1hcCgoZGVmKT0+ZGVmLm1vZGVscy5tYXAoKG0pPT57XG4gICAgICAgICAgICBsZXQgbmFtZSA9IG0ubmFtZTtcbiAgICAgICAgICAgIGlmIChzZWVuLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBgJHtuYW1lfV8ke2RlZi5hcHBJZC5yZXBsYWNlKC9bXmEtekEtWjAtOV0vZywgJycpfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWVuLmFkZChuYW1lKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgLi4ubSxcbiAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSk7XG4gICAgY29uc3QgbWVyZ2VkID0ge1xuICAgICAgICB0ZW1wbGF0ZUlkOiAnYXBwLXBhY2snLFxuICAgICAgICBzY2hlbWFPcmdUeXBlOiAnTG9jYWxCdXNpbmVzcycsXG4gICAgICAgIG1vZGVscyxcbiAgICAgICAgdXNlQ2FzZXM6IGRlZmluaXRpb25zLmZsYXRNYXAoKGQpPT5kLnVzZUNhc2VzKSxcbiAgICAgICAgcGFnZXM6IGRlZmluaXRpb25zLmZsYXRNYXAoKGQpPT5kLnBhZ2VzKVxuICAgIH07XG4gICAgcmV0dXJuIGNvbXBpbGVUb1pNb2RlbChtZXJnZWQpO1xufVxuLyoqXG4gKiBBcHBseSB0aGUgcGFjaydzIG1vZGVscyB0byB0aGUgdGFyZ2V0IERCIGFzIHJlYWwgdGFibGVzLiBBZGRpdGl2ZSBhbmRcbiAqIGlkZW1wb3RlbnQ6IGNyZWF0ZXMgbWlzc2luZyB0YWJsZXMvaW5kZXhlcywgYmFja2ZpbGxzIG1pc3NpbmcgY29sdW1ucyxcbiAqIG5ldmVyIGRyb3BzIG9yIGFsdGVycyBleGlzdGluZyBkYXRhLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBhcHBseVBhY2tTY2hlbWEoY2xpZW50LCBkZWZpbml0aW9ucykge1xuICAgIGNvbnN0IHN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgY29uc3Qgem1vZGVsID0gY29tcGlsZVBhY2taTW9kZWwoZGVmaW5pdGlvbnMpO1xuICAgIGZvciAoY29uc3QgZGVmIG9mIGRlZmluaXRpb25zKXtcbiAgICAgICAgZm9yIChjb25zdCBtb2RlbCBvZiBkZWYubW9kZWxzKXtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShjb21waWxlVGFibGVEREwobW9kZWwpKTtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgQ1JFQVRFIElOREVYIElGIE5PVCBFWElTVFMgXCIke21vZGVsLnRhYmxlTmFtZX1fdGVuYW50X3NsdWdfaWR4XCIgT04gXCIke21vZGVsLnRhYmxlTmFtZX1cIiAodGVuYW50X3NsdWcpO2ApO1xuICAgICAgICAgICAgZm9yIChjb25zdCBhbHRlciBvZiBjb21waWxlVGFibGVBbHRlcnMobW9kZWwpKXtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoYWx0ZXIpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgICAgICAgICAvLyBDb2x1bW4gbWF5IGFscmVhZHkgZXhpc3QgXHUyMDE0IGlnbm9yZS5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgem1vZGVsLFxuICAgICAgICBhcHBsaWVkOiB0cnVlLFxuICAgICAgICBkdXJhdGlvbk1zOiBEYXRlLm5vdygpIC0gc3RhcnRlZEF0XG4gICAgfTtcbn1cbiIsICIvKipcbiAqIFByb2dyZXNzIGVtaXNzaW9uIGZvciB0aGUgYXBwLXBhY2stZ2VuZXJhdGUgd29ya2Zsb3cuXG4gKlxuICogRm9sbG93cyB0aGUgU0RLIHN0cmVhbWluZyBwYXR0ZXJuIHVzZWQgYnkgd29ya2Jvb2staW5nZXN0OiB0aGUgd29ya2Zsb3dcbiAqIGZ1bmN0aW9uIGNhbGxzIGBnZXRXcml0YWJsZSgpYCBhbmQgcGFzc2VzIHRoZSBzdHJlYW0gdG8gc3RlcHM7IHN0ZXBzIG9idGFpblxuICogYSB3cml0ZXIsIHdyaXRlIEpTT04gY2h1bmtzLCBhbmQgcmVsZWFzZSB0aGUgbG9jay5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGVQcm9ncmVzc0NodW5rKHdyaXRhYmxlLCBjaHVuaykge1xuICAgIGNvbnN0IHdyaXRlciA9IHdyaXRhYmxlLmdldFdyaXRlcigpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHdyaXRlci53cml0ZShjaHVuayk7XG4gICAgfSBmaW5hbGx5e1xuICAgICAgICB3cml0ZXIucmVsZWFzZUxvY2soKTtcbiAgICB9XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0cmVhbSh3cml0YWJsZSkge1xuICAgIGF3YWl0IHdyaXRhYmxlLmNsb3NlKCk7XG59XG4iLCAiLyoqXG4gKiBMaWdodHdlaWdodCBQb3N0Z3JlU1FMIGhlbHBlciBmb3IgYXBwLXBhY2sgd29ya2Zsb3cgc3RlcHMgKHBnIGRyaXZlciwgbm9cbiAqIFByaXNtYSkuIE1pcnJvcnMgd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9kYi50cyBcdTIwMTQgZWFjaCBzdGVwIG9wZW5zIGl0cyBvd25cbiAqIHNob3J0LWxpdmVkIGNvbm5lY3Rpb247IHRoZSBjb25uZWN0aW9uIHN0cmluZyBpcyByZXNvbHZlZCBieSB0aGUgcm91dGUgYW5kXG4gKiBwYXNzZWQgdGhyb3VnaCB0aGUgd29ya2Zsb3cgaW5wdXQuXG4gKi8gaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSAncGcnO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdpdGhQZ0NsaWVudChjb25uZWN0aW9uU3RyaW5nLCBmbikge1xuICAgIGlmICghY29ubmVjdGlvblN0cmluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGRhdGFiYXNlIGNvbm5lY3Rpb24gc3RyaW5nIHByb3ZpZGVkLicpO1xuICAgIH1cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xpZW50KHtcbiAgICAgICAgY29ubmVjdGlvblN0cmluZ1xuICAgIH0pO1xuICAgIGF3YWl0IGNsaWVudC5jb25uZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IGZuKGNsaWVudCk7XG4gICAgfSBmaW5hbGx5e1xuICAgICAgICBhd2FpdCBjbGllbnQuZW5kKCk7XG4gICAgfVxufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHF1ZXJ5Um93cyhjbGllbnQsIHNxbCwgcGFyYW1zID0gW10pIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQucXVlcnkoc3FsLCBwYXJhbXMpO1xuICAgIHJldHVybiByZXN1bHQucm93cztcbn1cbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG4vKipcbiAqIFN0ZXAgZnVuY3Rpb25zIGZvciB0aGUgd29ya2Jvb2staW5nZXN0IHdvcmtmbG93LlxuICpcbiAqIEVhY2ggZXhwb3J0ZWQgYXN5bmMgZnVuY3Rpb24gd2l0aCB0aGUgYCd1c2Ugc3RlcCdgIGRpcmVjdGl2ZSBpcyBhIGR1cmFibGVcbiAqIHN0ZXA6IGl0cyBhcmdzIGFuZCByZXN1bHQgYXJlIHNlcmlhbGl6ZWQgdG8gdGhlIGV2ZW50IGxvZywgYW5kIGl0IHJldHJpZXNcbiAqIChtYXggMywgb3IgcGVyIFJldHJ5YWJsZUVycm9yKSBiZWZvcmUgdGhlIGVycm9yIGJ1YmJsZXMgdG8gdGhlIHdvcmtmbG93LlxuICovIGltcG9ydCB7IEZhdGFsRXJyb3IsIFJldHJ5YWJsZUVycm9yIH0gZnJvbSAnd29ya2Zsb3cnO1xuaW1wb3J0IHsgZXh0cmFjdFNoZWV0c1dpdGhTdGF0cyB9IGZyb20gJy4uLy4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svZXh0cmFjdC1zaGVldHMnO1xuaW1wb3J0IHsgYW5hbHl6ZVNoZWV0cyB9IGZyb20gJy4uLy4uL3NyYy9kb21haW4vYWktd29ya2Jvb2svc2hlZXQtYW5hbHlzaXMnO1xuaW1wb3J0IHsgY29tcHJlaGVuZE9uY2UsIENvbXByZWhlbmRIdHRwRXJyb3IsIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IgfSBmcm9tICcuLi8uLi9zcmMvZG9tYWluL2FpLXdvcmtib29rL2NvbXByZWhlbmQnO1xuaW1wb3J0IHsgd3JpdGVQcm9ncmVzc0NodW5rLCBjbG9zZVByb2dyZXNzU3RyZWFtIH0gZnJvbSAnLi9wcm9ncmVzcyc7XG5pbXBvcnQgeyB3aXRoUGdDbGllbnQsIGV4ZWN1dGVPbmUsIHF1ZXJ5Um93cyB9IGZyb20gJy4vZGInO1xuaW1wb3J0IHsgcmVhZCB9IGZyb20gJ3hsc3gnO1xuaW1wb3J0IHsgYnVpbGRXb3JrYm9va0Zvcm11bGFNYXAgfSBmcm9tICcuLi8uLi9zcmMvbGliL3dvcmtib29rLWZvcm11bGFzJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJ3b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLnRzXCI6e1wiYW5hbHl6ZVNoZWV0c1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vYW5hbHl6ZVNoZWV0c1N0ZXBcIn0sXCJjbG9zZVByb2dyZXNzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9jbG9zZVByb2dyZXNzU3RlcFwifSxcImNvbXByZWhlbmRXb3JrYm9va1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vY29tcHJlaGVuZFdvcmtib29rU3RlcFwifSxcImVtaXRQcm9ncmVzc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZW1pdFByb2dyZXNzU3RlcFwifSxcImV4dHJhY3RTaGVldHNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2V4dHJhY3RTaGVldHNTdGVwXCJ9LFwiZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXBcIn0sXCJnZW5lcmF0ZURhc2hib2FyZFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVEYXNoYm9hcmRTdGVwXCJ9LFwiZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwXCJ9LFwibG9hZFdvcmtib29rU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9sb2FkV29ya2Jvb2tTdGVwXCJ9LFwicG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vcG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXBcIn0sXCJyZWdpc3RlckR5bmFtaWNQYWdlc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vcmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwXCJ9LFwic2F2ZVNuaXBwZXRzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zYXZlU25pcHBldHNTdGVwXCJ9LFwic2F2ZVdvcmtib29rRm9ybXVsYU1hcFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2F2ZVdvcmtib29rRm9ybXVsYU1hcFN0ZXBcIn0sXCJzZWxlY3RUZW1wbGF0ZVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2VsZWN0VGVtcGxhdGVTdGVwXCJ9LFwidXBzZXJ0U2hlZXRQYWdlc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vdXBzZXJ0U2hlZXRQYWdlc1N0ZXBcIn19fX0qLztcbi8qKiBEZXRlY3QgdGhlIGZpbGUgc2lnbmF0dXJlcyBvZiByZWFsIHNwcmVhZHNoZWV0IGZpbGVzICh6aXAveGxzeCwgQklGRi94bHMpLiAqLyBmdW5jdGlvbiBoYXNTcHJlYWRzaGVldE1hZ2ljKGRhdGEpIHtcbiAgICBjb25zdCBiID0gZGF0YTtcbiAgICAvLyBQS1xceDAzXFx4MDQgKHppcCBcdTIxOTIgeGxzeCkgb3IgUEtcXHgwNVxceDA2IChlbXB0eSB6aXApXG4gICAgaWYgKGJbMF0gPT09IDB4NTAgJiYgYlsxXSA9PT0gMHg0YikgcmV0dXJuIHRydWU7XG4gICAgLy8gRDAgQ0YgMTEgRTAgQTEgQjEgMUEgRTEgKE9MRTIgY29tcG91bmQgXHUyMTkyIC54bHMpXG4gICAgaWYgKGJbMF0gPT09IDB4ZDAgJiYgYlsxXSA9PT0gMHhjZiAmJiBiWzJdID09PSAweDExICYmIGJbM10gPT09IDB4ZTAgJiYgYls0XSA9PT0gMHhhMSAmJiBiWzVdID09PSAweGIxICYmIGJbNl0gPT09IDB4MWEgJiYgYls3XSA9PT0gMHhlMSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuLyoqXG4gKiBDb252ZXJ0IHJhdyB1cGxvYWQgYnl0ZXMgaW50byB4bHN4IGJ1ZmZlcnMuXG4gKlxuICogVWludDhBcnJheSBpcyBzZXJpYWxpemFibGUgYWNyb3NzIHRoZSB3b3JrZmxvdyBib3VuZGFyeTsgQnVmZmVyIGlzIG5vdFxuICogZ3VhcmFudGVlZCBpbiB3b3JrZmxvdyBzdGVwIHNhbmRib3hlcywgc28gd2Uga2VlcCBVaW50OEFycmF5IGV2ZXJ5d2hlcmVcbiAqIGFuZCBoYW5kIGl0IGRpcmVjdGx5IHRvIGB4bHN4LnJlYWQoeyB0eXBlOiAnYnVmZmVyJyB9KWAuXG4gKlxuICogU2hlZXRKUyBpcyBsZW5pZW50IHdpdGggYXJiaXRyYXJ5IHRleHQgKGl0IHBhcnNlcyBwbGFpbiB0ZXh0IGFzIGEgMS1jb2x1bW5cbiAqIHNoZWV0KSwgc28gd2UgdmFsaWRhdGUgdGhlIG1hZ2ljIGJ5dGVzIEJFRk9SRSBwYXJzaW5nIHRvIGNhdGNoIHVwbG9hZHMgb2ZcbiAqIHRoZSB3cm9uZyBmaWxlIHR5cGUgd2l0aCBhIGNsZWFuIEZhdGFsRXJyb3IuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRXb3JrYm9va1N0ZXAoZmlsZXMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZmlsZXMpIHx8IGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcignTm8gd29ya2Jvb2sgZmlsZXMgd2VyZSBwcm92aWRlZC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGVzLm1hcCgoZik9PntcbiAgICAgICAgaWYgKCFmIHx8IHR5cGVvZiBmLm5hbWUgIT09ICdzdHJpbmcnIHx8ICEoZi5kYXRhIGluc3RhbmNlb2YgVWludDhBcnJheSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdJbnZhbGlkIGZpbGUgZW50cnk6IGV4cGVjdGVkIHsgbmFtZSwgZGF0YTogVWludDhBcnJheSB9LicpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmLmRhdGEuYnl0ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYFdvcmtib29rIFwiJHtmLm5hbWV9XCIgaXMgZW1wdHkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYXNTcHJlYWRzaGVldE1hZ2ljKGYuZGF0YSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBXb3JrYm9vayBcIiR7Zi5uYW1lfVwiIGlzIG5vdCBhIHJlYWRhYmxlIC54bHN4Ly54bHMgZmlsZSAodW5leHBlY3RlZCBmaWxlIHNpZ25hdHVyZSkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGYuZGF0YTtcbiAgICB9KTtcbn1cbi8qKiBFWFRSQUNUOiBzZXJpYWxpemUgZXZlcnkgc2hlZXQgdG8gdGV4dCArIHN0cnVjdHVyYWwgc3RhdHMuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHRyYWN0U2hlZXRzU3RlcChidWZmZXJzKSB7XG4gICAgY29uc3QgYWxsID0gW107XG4gICAgZm9yIChjb25zdCBidWYgb2YgYnVmZmVycyl7XG4gICAgICAgIGxldCBleHRyYWN0ZWQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBleHRyYWN0ZWQgPSBleHRyYWN0U2hlZXRzV2l0aFN0YXRzKGJ1Zik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYFdvcmtib29rIGlzIG5vdCBhIHJlYWRhYmxlIC54bHN4IGZpbGU6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgICAgICB9XG4gICAgICAgIGFsbC5wdXNoKC4uLmV4dHJhY3RlZCk7XG4gICAgfVxuICAgIGlmIChhbGwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdXb3JrYm9vayBjb250YWlucyBubyByZWFkYWJsZSBzaGVldHMuJyk7XG4gICAgfVxuICAgIHJldHVybiBhbGw7XG59XG4vKiogQU5BTFlaRTogZGV0ZXJtaW5pc3RpYyBwcmUtcGFzcyBwcm9kdWNpbmcgc3RydWN0dXJlZCBoaW50cy4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFuYWx5emVTaGVldHNTdGVwKHNoZWV0cykge1xuICAgIHJldHVybiBhbmFseXplU2hlZXRzKHNoZWV0cyk7XG59XG4vKipcbiAqIEZPUk1VTEEgTUFQOiBmaW5kIGV2ZXJ5IGZvcm11bGEgY2VsbCBpbiB0aGUgaW1wb3J0ZWQgd29ya2Jvb2sgYW5kIHBlcnNpc3RcbiAqIGl0cyByZWZlcmVuY2VzIG1hcHBlZCB0byB0aGUgREItc2hlZXQgY29vcmRpbmF0ZXMgKGNvbHVtbiBrZXkgKyBkYXRhIHJvd1xuICogb2Zmc2V0KSB0aGF0IHRoZSBzaGVldCB2aWV3ZXIgc2VydmVzLCBzbyBmb3JtdWxhcyBjYW4gYmUgY29tcHV0ZWQgYWdhaW5zdFxuICogdGhlIGRhdGFiYXNlLXNhdmVkIHNoZWV0IGRhdGEuIElkZW1wb3RlbnQ6IE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVdvcmtib29rRm9ybXVsYU1hcFN0ZXAoYnVmZmVycywgZGJVcmwpIHtcbiAgICBsZXQgdG90YWwgPSAwO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHdiID0gcmVhZChidWZmZXJzWzBdLCB7XG4gICAgICAgICAgICB0eXBlOiAnYnVmZmVyJyxcbiAgICAgICAgICAgIGNlbGxGb3JtdWxhOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBmb3JtdWxhTWFwID0gYnVpbGRXb3JrYm9va0Zvcm11bGFNYXAod2IpO1xuICAgICAgICB0b3RhbCA9IE9iamVjdC52YWx1ZXMoZm9ybXVsYU1hcCkucmVkdWNlKChuLCBzKT0+biArIHMuZm9ybXVsYXMubGVuZ3RoLCAwKTtcbiAgICAgICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjYXRlZ29yeSwgY29udGVudClcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAnY2FjaGUnLCAkMilcbiAgICAgICAgIE9OIENPTkZMSUNUIChrZXkpIERPIFVQREFURSBTRVQgY29udGVudCA9IEVYQ0xVREVELmNvbnRlbnQ7YCwgW1xuICAgICAgICAgICAgICAgICd3b3JrYm9va19mb3JtdWxhcycsXG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoZm9ybXVsYU1hcClcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gTm9uLWZhdGFsOiB0aGUgd29ya2Jvb2tfZGF0YSBzbmlwcGV0IHJlbWFpbnMgdGhlIHNvdXJjZSBvZiB0cnV0aCBhbmQgdGhlXG4gICAgICAgIC8vIHNoZWV0LWRhdGEgQVBJIGNvbXB1dGVzIGZvcm11bGEgdmFsdWVzIG9uIHJlYWQgd2hlbiB0aGlzIGlzIG1pc3NpbmcuXG4gICAgICAgIGNvbnNvbGUud2FybignW3dvcmtib29rLWluZ2VzdF0gRm9ybXVsYSBtYXAgc3RlcCBza2lwcGVkOicsIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSk7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICByZXR1cm4gdG90YWw7XG59XG4vKipcbiAqIENPTVBSRUhFTkQ6IG9uZSBPcGVuQUkgY2FsbCAoZ3B0LTRvLCBqc29uX29iamVjdCwgWm9kLXZhbGlkYXRlZCkgd2l0aCB0aGVcbiAqIGRldGVybWluaXN0aWMgQU5BTFlTSVMgaGludHMgaW5qZWN0ZWQgaW50byB0aGUgcHJvbXB0LlxuICpcbiAqIFJldHJ5IHBvbGljeSAoXHUwMEE3NC4yIG9mIHRoZSByb2FkbWFwKTpcbiAqICAgLSA0MjkgICAgICAgICAgICBcdTIxOTIgUmV0cnlhYmxlRXJyb3IoeyByZXRyeUFmdGVyIH0pIHVzaW5nIFJldHJ5LUFmdGVyIGhlYWRlciAoZmFsbGJhY2sgMXMpXG4gKiAgIC0gNXh4IC8gbmV0d29yayAgXHUyMTkyIHBsYWluIEVycm9yIFx1MjE5MiBTREsgYXV0by1yZXRyeSAobWF4IDMpXG4gKiAgIC0gbWlzc2luZyBrZXkgICAgXHUyMTkyIEZhdGFsRXJyb3IgKHBlcm1hbmVudCwgbm8gcmV0cnkgc3Rvcm0pXG4gKiAgIC0gc2NoZW1hIHJlamVjdGVkIFx1MjE5MiBwbGFpbiBFcnJvciBcdTIxOTIgU0RLIGF1dG8tcmV0cmllcyAobW9kZWwgb3V0cHV0IGlzIHN0b2NoYXN0aWNcbiAqICAgICAgICAgICAgICAgICAgICAgIGF0IHRlbXBlcmF0dXJlIDAuMik7IHJ1biBmYWlscyB3aXRoIGEgY2xlYXIgbWVzc2FnZSBhZnRlclxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIFNESydzIHJldHJ5IGJ1ZGdldCBpcyBleGhhdXN0ZWQuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXByZWhlbmRXb3JrYm9va1N0ZXAoc2hlZXRzLCBoaW50cywgbW9kZWwgPSAnZ3B0LTRvJywgb3BlbmFpQXBpS2V5KSB7XG4gICAgY29uc3QgYXBpS2V5ID0gb3BlbmFpQXBpS2V5IHx8IHByb2Nlc3MuZW52Lk9QRU5BSV9BUElfS0VZO1xuICAgIGlmICghYXBpS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKCdPcGVuQUkgQVBJIGtleSBub3QgY29uZmlndXJlZC4gU2V0IGl0IGluIENvbmZpZyA+IE9wZW5BSSBLZXkgKHZpYSB0aGUgcmVzZWVkIHJvdXRlKSBvciBzZXQgT1BFTkFJX0FQSV9LRVkgZW52IHZhci4nKTtcbiAgICB9XG4gICAgY29uc3QgYmxvY2tzID0gc2hlZXRzLm1hcCgoeyB0YWJOYW1lLCB0ZXh0IH0pPT4oe1xuICAgICAgICAgICAgdGFiTmFtZSxcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgfSkpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjb21wcmVoZW5kT25jZShibG9ja3MsIHtcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgaGludHMsXG4gICAgICAgICAgICBhcGlLZXlcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDb21wcmVoZW5kSHR0cEVycm9yKSB7XG4gICAgICAgICAgICBpZiAoZXJyLnN0YXR1cyA9PT0gNDI5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0cnlBZnRlclNlY29uZHMgPSBlcnIucmV0cnlBZnRlclNlY29uZHMgPz8gMTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmV0cnlhYmxlRXJyb3IoZXJyLm1lc3NhZ2UsIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0cnlBZnRlcjogYCR7cmV0cnlBZnRlclNlY29uZHN9c2BcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIDV4eCBldGMgXHUyMTkyIHBsYWluIEVycm9yIFx1MjE5MiBTREsgYXV0by1yZXRyeSAobWF4IDMpXG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFNjaGVtYS9KU09OIHJlamVjdGlvbiBcdTIwMTQgdGhlIG1vZGVsIG1heSBwcm9kdWNlIHZhbGlkIG91dHB1dCBvbiByZXRyeS5cbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgfVxufVxuLyoqXG4gKiBFbWl0IGEgcHJvZ3Jlc3MgY2h1bmsgdG8gdGhlIHJ1bidzIHdyaXRhYmxlIHN0cmVhbSAoU1NFIHBheWxvYWQpLlxuICogTXVzdCBiZSBhIHN0ZXA6IHdvcmtmbG93IGZ1bmN0aW9ucyBjYW5ub3QgaW50ZXJhY3Qgd2l0aCB0aGUgc3RyZWFtIGRpcmVjdGx5LlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbWl0UHJvZ3Jlc3NTdGVwKHdyaXRhYmxlLCBjaHVuaykge1xuICAgIGF3YWl0IHdyaXRlUHJvZ3Jlc3NDaHVuayh3cml0YWJsZSwgY2h1bmspO1xufVxuLyoqXG4gKiBDbG9zZSB0aGUgcnVuJ3Mgd3JpdGFibGUgc3RyZWFtLCBzaWduYWxpbmcgY29tcGxldGlvbiB0byBzdHJlYW0gcmVhZGVycy5cbiAqIE11c3QgYmUgYSBzdGVwOiB3b3JrZmxvdyBmdW5jdGlvbnMgY2Fubm90IGludGVyYWN0IHdpdGggdGhlIHN0cmVhbSBkaXJlY3RseS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VQcm9ncmVzc1N0ZXAod3JpdGFibGUpIHtcbiAgICBhd2FpdCBjbG9zZVByb2dyZXNzU3RyZWFtKHdyaXRhYmxlKTtcbn1cbi8vIFx1MjUwMFx1MjUwMCBQaGFzZSAzOiBQT1BVTEFURSBzdGVwcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8qKlxuICogVXBzZXJ0IGZpbmFuY2lhbCBwcm9qZWN0aW9ucyBmcm9tIHRoZSBBSSBjb21wcmVoZW5zaW9uLlxuICogSWRlbXBvdGVudDogT04gQ09ORkxJQ1QgKHBlcmlvZCwgZGF0YV90eXBlLCBzY2VuYXJpbykgRE8gVVBEQVRFLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBwb3B1bGF0ZVByb2plY3Rpb25zU3RlcChjb21wcmVoZW5zaW9uLCBkYlVybCkge1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgIGZvciAoY29uc3QgbWV0cmljIG9mIGNvbXByZWhlbnNpb24ucHJvamVjdGlvbnMpe1xuICAgICAgICAgICAgY29uc3QgeWVhciA9IE51bWJlcihtZXRyaWMucGVyaW9kLnNsaWNlKDAsIDQpKTtcbiAgICAgICAgICAgIGNvbnN0IG1vbnRoID0gTnVtYmVyKG1ldHJpYy5wZXJpb2Quc2xpY2UoNSwgNykpO1xuICAgICAgICAgICAgY29uc3QgcmV2ZW51ZSA9IE1hdGgucm91bmQobWV0cmljLnJldmVudWUgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBlYml0ZGEgPSBNYXRoLnJvdW5kKG1ldHJpYy5lYml0ZGEgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBuZXRJbmNvbWUgPSBNYXRoLnJvdW5kKG1ldHJpYy5uZXRJbmNvbWUgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBndWVzdHMgPSBNYXRoLnJvdW5kKG1ldHJpYy5ndWVzdHMgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBzdGFmZkNvc3QgPSBNYXRoLnJvdW5kKG1ldHJpYy5zdGFmZkNvc3QgPz8gMCk7XG4gICAgICAgICAgICBjb25zdCBwbmxMaW5lcyA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ3JldmVudWUnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1JldmVudWUnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmV2ZW51ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdlYml0ZGEnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VCSVREQScsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBlYml0ZGFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnbmV0X2luY29tZScsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTmV0IEluY29tZScsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBuZXRJbmNvbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnc3RhZmZfY29zdCcsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU3RhZmYgQ29zdCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzdGFmZkNvc3RcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnZ3Vlc3RzJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdHdWVzdHMnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZ3Vlc3RzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gZmluYW5jaWFsX3Byb2plY3Rpb25zIChwZXJpb2QsIHllYXIsIG1vbnRoLCBkYXRhX3R5cGUsIHNjZW5hcmlvLCByZXZlbnVlLCBlYml0ZGEsIG5ldF9pbmNvbWUsIGd1ZXN0cywgc3RhZmZfY29zdCwgcG5sX2xpbmVzKVxuICAgICAgICAgVkFMVUVTICgkMSwgJDIsICQzLCAkNCwgJDUsICQ2LCAkNywgJDgsICQ5LCAkMTAsICQxMTo6anNvbmIpXG4gICAgICAgICBPTiBDT05GTElDVCAocGVyaW9kLCBkYXRhX3R5cGUsIHNjZW5hcmlvKVxuICAgICAgICAgRE8gVVBEQVRFIFNFVFxuICAgICAgICAgICByZXZlbnVlID0gRVhDTFVERUQucmV2ZW51ZSxcbiAgICAgICAgICAgZWJpdGRhID0gRVhDTFVERUQuZWJpdGRhLFxuICAgICAgICAgICBuZXRfaW5jb21lID0gRVhDTFVERUQubmV0X2luY29tZSxcbiAgICAgICAgICAgZ3Vlc3RzID0gRVhDTFVERUQuZ3Vlc3RzLFxuICAgICAgICAgICBzdGFmZl9jb3N0ID0gRVhDTFVERUQuc3RhZmZfY29zdCxcbiAgICAgICAgICAgcG5sX2xpbmVzID0gRVhDTFVERUQucG5sX2xpbmVzO2AsIFtcbiAgICAgICAgICAgICAgICBtZXRyaWMucGVyaW9kLFxuICAgICAgICAgICAgICAgIHllYXIsXG4gICAgICAgICAgICAgICAgbW9udGgsXG4gICAgICAgICAgICAgICAgbWV0cmljLmRhdGFUeXBlLFxuICAgICAgICAgICAgICAgIG1ldHJpYy5zY2VuYXJpbyxcbiAgICAgICAgICAgICAgICByZXZlbnVlLFxuICAgICAgICAgICAgICAgIGViaXRkYSxcbiAgICAgICAgICAgICAgICBuZXRJbmNvbWUsXG4gICAgICAgICAgICAgICAgZ3Vlc3RzLFxuICAgICAgICAgICAgICAgIHN0YWZmQ29zdCxcbiAgICAgICAgICAgICAgICBwbmxMaW5lc1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvdW50O1xufVxuLyoqIE5vcm1hbGl6ZSBhIHNoZWV0IHRhYiBuYW1lIGludG8gYSBVUkwtc2FmZSBzbHVnLiAqLyBmdW5jdGlvbiBub3JtYWxpemVTbHVnKG5hbWUpIHtcbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1smXS9nLCAnYW5kJykucmVwbGFjZSgvW1xcc10rL2csICctJykucmVwbGFjZSgvW15hLXowLTktXS9nLCAnJykucmVwbGFjZSgvLSsvZywgJy0nKS5yZXBsYWNlKC9eLXwtJC9nLCAnJyk7XG59XG4vKiogUGFnZSBibG9ja3MgcGVyIHNoZWV0IGNhdGVnb3J5IChtaXJyb3JzIHBpcGVsaW5lLnRzIENBVEVHT1JZX0JMT0NLUykuICovIGNvbnN0IFNIRUVUX0NBVEVHT1JZX0JMT0NLUyA9IHtcbiAgICBkYWlseV9zYWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdEYWlseSBTYWxlcyBcdTIwMTQgRGF0YSdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnRGFpbHkgU2FsZXMgXHUyMDE0IFRyZW5kcydcbiAgICAgICAgfVxuICAgIF0sXG4gICAgcHJvZml0X2xvc3M6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAncG5sX3RhYmxlJyxcbiAgICAgICAgICAgIHRpdGxlOiAnUHJvZml0ICYgTG9zcyBcdTIwMTQgU3RhdGVtZW50J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdQcm9maXQgJiBMb3NzIFx1MjAxNCBUcmVuZHMnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIGJhbGFuY2Vfc2hlZXQ6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnQmFsYW5jZSBTaGVldCBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgdHJpYWxfYmFsYW5jZTogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdUcmlhbCBCYWxhbmNlIFx1MjAxNCBEYXRhJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBnZW5lcmFsX2xlZGdlcjogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdHZW5lcmFsIExlZGdlciBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgY29zdF9vZl9zYWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdzaGVldF92aWV3ZXInLFxuICAgICAgICAgICAgdGl0bGU6ICdDb3N0IG9mIFNhbGVzIFx1MjAxNCBEYXRhJ1xuICAgICAgICB9XG4gICAgXSxcbiAgICBtb250aF9vbl9tb250aDogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdNb250aCBvbiBNb250aCBcdTIwMTQgQ29tcGFyaXNvbidcbiAgICAgICAgfVxuICAgIF0sXG4gICAgYnJlYWtfZXZlbjogW1xuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdrcGlfY2FyZHMnLFxuICAgICAgICAgICAgdGl0bGU6ICdCcmVhay1FdmVuIFx1MjAxNCBLUElzJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdjaGFydF9maW5hbmNpYWwnLFxuICAgICAgICAgICAgdGl0bGU6ICdCcmVhay1FdmVuIFx1MjAxNCBUcmVuZCdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgdmFyaWFuY2U6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTW9udGhseSBWYXJpYW5jZSBcdTIwMTQgQW5hbHlzaXMnXG4gICAgICAgIH1cbiAgICBdLFxuICAgIHN1bW1hcnlfcGw6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnY2hhcnRfZmluYW5jaWFsJyxcbiAgICAgICAgICAgIHRpdGxlOiAnTXVsdGktWWVhciBQJkwgXHUyMDE0IFRyZW5kJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBibG9ja1R5cGU6ICdwbmxfdGFibGUnLFxuICAgICAgICAgICAgdGl0bGU6ICdNdWx0aS1ZZWFyIFAmTCBcdTIwMTQgU3RhdGVtZW50J1xuICAgICAgICB9XG4gICAgXSxcbiAgICBzdW1tYXJ5X2JzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJsb2NrVHlwZTogJ3NoZWV0X3ZpZXdlcicsXG4gICAgICAgICAgICB0aXRsZTogJ011bHRpLVllYXIgQmFsYW5jZSBTaGVldCBcdTIwMTQgRGF0YSdcbiAgICAgICAgfVxuICAgIF0sXG4gICAgb3RoZXI6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmxvY2tUeXBlOiAnc2hlZXRfdmlld2VyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnU2hlZXQgRGF0YSdcbiAgICAgICAgfVxuICAgIF1cbn07XG4vKipcbiAqIENyZWF0ZS91cGRhdGUgZHluYW1pYyBhcHAgcGFnZXMgKyBwYWdlIHNlY3Rpb25zIGZvciBlYWNoIGNvbXByZWhlbmRlZCBzaGVldC5cbiAqXG4gKiBcdTAwQTc3LjEgRklYOiBPTiBDT05GTElDVCAoc2x1ZykgRE8gVVBEQVRFIC4uLiBSRVRVUk5JTkcgaWQgZW5zdXJlcyB3ZSBhbHdheXNcbiAqIGhhdmUgdGhlIGNvcnJlY3QgcGFnZSBJRCAobmV3IG9yIGV4aXN0aW5nKS4gUGFnZSBzZWN0aW9ucyBhcmUgZGVsZXRlZCBhbmRcbiAqIHJlLWluc2VydGVkIHNjb3BlZCB0byB0aGF0IGlkIFx1MjAxNCBubyBvcnBoYW4gRksgcmVmZXJlbmNlcy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBzZXJ0U2hlZXRQYWdlc1N0ZXAoY29tcHJlaGVuc2lvbiwgZGJVcmwsIHRlbmFudFNsdWcpIHtcbiAgICBjb25zdCBjcmVhdGVkID0gW107XG4gICAgbGV0IHNvcnRPcmRlciA9IDEwMDtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgZm9yIChjb25zdCBzaGVldCBvZiBjb21wcmVoZW5zaW9uLnNoZWV0cyl7XG4gICAgICAgICAgICBjb25zdCBzbHVnID0gYHNoZWV0LSR7bm9ybWFsaXplU2x1ZyhzaGVldC50YWJOYW1lKX1gO1xuICAgICAgICAgICAgY29uc3QgYmxvY2tzID0gU0hFRVRfQ0FURUdPUllfQkxPQ0tTW3NoZWV0LmNhdGVnb3J5XSA/PyBTSEVFVF9DQVRFR09SWV9CTE9DS1Mub3RoZXI7XG4gICAgICAgICAgICAvLyBcdTAwQTc3LjEgZml4OiBSRVRVUk5JTkcgaWQgZ2l2ZXMgdXMgdGhlIHJlYWwgcGFnZSBJRCBvbiBpbnNlcnQgT1IgY29uZmxpY3QuXG4gICAgICAgICAgICBjb25zdCBwYWdlUm93cyA9IGF3YWl0IHF1ZXJ5Um93cyhkYiwgYElOU0VSVCBJTlRPIGFwcF9wYWdlcyAoaWQsIHNsdWcsIHRpdGxlLCBhdXRoX3RpZXIsIHNvcnRfb3JkZXIsIG5hdl9sYWJlbCwgc2hvd19pbl9uYXYsIHRlbmFudF9zbHVnKVxuICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICQyLCAnZ29vZ2xlJywgJDMsICQ0LCB0cnVlLCAkNSlcbiAgICAgICAgIE9OIENPTkZMSUNUIChzbHVnKSBETyBVUERBVEUgU0VUXG4gICAgICAgICAgIHRpdGxlID0gRVhDTFVERUQudGl0bGUsXG4gICAgICAgICAgIGF1dGhfdGllciA9IEVYQ0xVREVELmF1dGhfdGllcixcbiAgICAgICAgICAgc29ydF9vcmRlciA9IEVYQ0xVREVELnNvcnRfb3JkZXIsXG4gICAgICAgICAgIG5hdl9sYWJlbCA9IEVYQ0xVREVELm5hdl9sYWJlbCxcbiAgICAgICAgICAgc2hvd19pbl9uYXYgPSBFWENMVURFRC5zaG93X2luX25hdixcbiAgICAgICAgICAgdGVuYW50X3NsdWcgPSBDT0FMRVNDRShFWENMVURFRC50ZW5hbnRfc2x1ZywgYXBwX3BhZ2VzLnRlbmFudF9zbHVnKVxuICAgICAgICAgUkVUVVJOSU5HIGlkO2AsIFtcbiAgICAgICAgICAgICAgICBzbHVnLFxuICAgICAgICAgICAgICAgIHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgIHNvcnRPcmRlcisrLFxuICAgICAgICAgICAgICAgIHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgIHRlbmFudFNsdWcgPz8gbnVsbFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb25zdCBwYWdlSWQgPSBwYWdlUm93c1swXT8uaWQ7XG4gICAgICAgICAgICBpZiAoIXBhZ2VJZCkgY29udGludWU7XG4gICAgICAgICAgICAvLyBSZXBsYWNlIHNlY3Rpb25zIGZvciB0aGlzIHBhZ2UgKGlkZW1wb3RlbnQgb24gcmV0cnkpLlxuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYERFTEVURSBGUk9NIHBhZ2Vfc2VjdGlvbnMgV0hFUkUgcGFnZV9pZCA9ICQxO2AsIFtcbiAgICAgICAgICAgICAgICBwYWdlSWRcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeU1hcmtkb3duID0gW1xuICAgICAgICAgICAgICAgIGAjICR7c2hlZXQudGl0bGV9YCxcbiAgICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgICBzaGVldC5zdW1tYXJ5LFxuICAgICAgICAgICAgICAgIHNoZWV0LnBlcmlvZEhpbnQgPyBgXFxuKipQZXJpb2QqKjogJHtzaGVldC5wZXJpb2RIaW50fWAgOiAnJyxcbiAgICAgICAgICAgICAgICBgKipSb3dzKio6ICR7c2hlZXQucm93Q291bnQgPz8gJ1x1MjAxNCd9ICB8ICAqKkNvbHVtbnMqKjogJHsoc2hlZXQuY29sdW1ucyA/PyBbXSkubGVuZ3RoIHx8ICdcdTIwMTQnfWAsXG4gICAgICAgICAgICAgICAgJydcbiAgICAgICAgICAgIF0uZmlsdGVyKChsKT0+bCAhPT0gJycpLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgLy8gZG9jX21hcmtkb3duIGJsb2NrXG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8gcGFnZV9zZWN0aW9ucyAoaWQsIHBhZ2VfaWQsIHNvcnRfb3JkZXIsIGJsb2NrX3R5cGUsIGNvbmZpZylcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAwLCAnZG9jX21hcmtkb3duJywgJDI6Ompzb25iKTtgLCBbXG4gICAgICAgICAgICAgICAgcGFnZUlkLFxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdBYm91dCB0aGlzIHNoZWV0JyxcbiAgICAgICAgICAgICAgICAgICAgbWFya2Rvd246IHN1bW1hcnlNYXJrZG93blxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIC8vIENhdGVnb3J5LXNwZWNpZmljIGJsb2Nrc1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgY29uc3QgYmxvY2sgPSBibG9ja3NbaV07XG4gICAgICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIHBhZ2Vfc2VjdGlvbnMgKGlkLCBwYWdlX2lkLCBzb3J0X29yZGVyLCBibG9ja190eXBlLCBjb25maWcpXG4gICAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICQxLCAkMiwgJDMsICQ0Ojpqc29uYik7YCwgW1xuICAgICAgICAgICAgICAgICAgICBwYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgIGkgKyAxLFxuICAgICAgICAgICAgICAgICAgICBibG9jay5ibG9ja1R5cGUsXG4gICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWV0OiBzaGVldC50YWJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGJsb2NrLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjcmVhdGVkLnB1c2goe1xuICAgICAgICAgICAgICAgIHNsdWcsXG4gICAgICAgICAgICAgICAgdGl0bGU6IHNoZWV0LnRpdGxlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBdXRvLXBvcHVsYXRlIG5hdmlnYXRpb25faXRlbXM6IGFkZCBlYWNoIHNoZWV0IHBhZ2UgYXMgYSBjaGlsZCBvZiB0aGUgXCJFeGNlbFwiIGZvbGRlci5cbiAgICAgICAgLy8gRmluZCB0aGUgRXhjZWwgZm9sZGVyIGZpcnN0LCBvciBjcmVhdGUgaXQgaWYgaXQgZG9lc24ndCBleGlzdCB5ZXQuXG4gICAgICAgIGNvbnN0IGV4Y2VsRm9sZGVyID0gYXdhaXQgcXVlcnlSb3dzKGRiLCBgU0VMRUNUIGlkIEZST00gbmF2aWdhdGlvbl9pdGVtcyBXSEVSRSB0aXRsZSA9ICQxIEFORCBwYXJlbnRfaWQgSVMgTlVMTCBMSU1JVCAxYCwgW1xuICAgICAgICAgICAgJ0V4Y2VsJ1xuICAgICAgICBdKTtcbiAgICAgICAgbGV0IGV4Y2VsSWQgPSBleGNlbEZvbGRlclswXT8uaWQ7XG4gICAgICAgIGlmICghZXhjZWxJZCkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBFeGNlbCBmb2xkZXIgaWYgaXQgZG9lc24ndCBleGlzdCB5ZXRcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCBxdWVyeVJvd3MoZGIsIGBJTlNFUlQgSU5UTyBuYXZpZ2F0aW9uX2l0ZW1zIChpZCwgcGFyZW50X2lkLCBzb3J0X29yZGVyLCB0aXRsZSwgcGF0aCwgaWNvbiwgYXV0aF90aWVyLCByZXF1aXJlZF9ncm91cHMsIGlzX3Zpc2libGUsIGlzX2R5bmFtaWMpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCBOVUxMLCAoU0VMRUNUIENPQUxFU0NFKE1BWChzb3J0X29yZGVyKSwgMCkgKyAxIEZST00gbmF2aWdhdGlvbl9pdGVtcyBXSEVSRSBwYXJlbnRfaWQgSVMgTlVMTCksXG4gICAgICAgICAnRXhjZWwnLCAnL2V4Y2VsJywgJ0ZvbGRlcicsIENBU1QoJ2dvb2dsZScgQVMgXCJBdXRoVGllclwiKSwgJ3ZpZXdlcixvcHMtYWRtaW4sZmluYW5jZSxwbGF0Zm9ybS1hZG1pbicsIHRydWUsIHRydWUpXG4gICAgICAgICBSRVRVUk5JTkcgaWRgKTtcbiAgICAgICAgICAgIGV4Y2VsSWQgPSBjcmVhdGVkWzBdPy5pZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXhjZWxJZCkge1xuICAgICAgICAgICAgbGV0IG5hdlNvcnQgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzaGVldCBvZiBjb21wcmVoZW5zaW9uLnNoZWV0cyl7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2x1ZyA9IGBzaGVldC0ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YDtcbiAgICAgICAgICAgICAgICAvLyBTa2lwIGlmIGFscmVhZHkgcHJlc2VudFxuICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgcXVlcnlSb3dzKGRiLCBgU0VMRUNUIGlkIEZST00gbmF2aWdhdGlvbl9pdGVtcyBXSEVSRSBwYXRoID0gJDEgQU5EIHBhcmVudF9pZCA9ICQyIExJTUlUIDFgLCBbXG4gICAgICAgICAgICAgICAgICAgIGAvJHtzbHVnfWAsXG4gICAgICAgICAgICAgICAgICAgIGV4Y2VsSWRcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBuYXZpZ2F0aW9uX2l0ZW1zIChpZCwgcGFyZW50X2lkLCBzb3J0X29yZGVyLCB0aXRsZSwgcGF0aCwgaWNvbiwgYXV0aF90aWVyLCByZXF1aXJlZF9ncm91cHMsIGlzX3Zpc2libGUsIGlzX2R5bmFtaWMpXG4gICAgICAgICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJDEsICQyLCAkMywgJDQsICdEZXNjcmlwdGlvbicsIENBU1QoJ2dvb2dsZScgQVMgXCJBdXRoVGllclwiKSwgJycsIHRydWUsIHRydWUpYCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhjZWxJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hdlNvcnQrKyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYC8ke3NsdWd9YFxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY3JlYXRlZDtcbn1cbi8qKiBVcHNlcnQga25vd2xlZGdlIHNuaXBwZXRzIChmdWxsIGNvbXByZWhlbnNpb24gKyBwZXItc2hlZXQgbWFya2Rvd24pLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVNuaXBwZXRzU3RlcChjb21wcmVoZW5zaW9uLCBtb2RlbCwgZGJVcmwpIHtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGF3YWl0IHdpdGhQZ0NsaWVudChkYlVybCwgYXN5bmMgKGRiKT0+e1xuICAgICAgICAvLyBSYXcgY29tcHJlaGVuc2lvbiBKU09OICh1c2VkIGJ5IEFJIGNoYXQgLyByZXByb2Nlc3MpLlxuICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjYXRlZ29yeSwgY29udGVudClcbiAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJ2RvY3VtZW50JywgJDIpXG4gICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudDtgLCBbXG4gICAgICAgICAgICAnd29ya2Jvb2tfY29tcHJlaGVuc2lvbicsXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgY29tcHJlaGVuZGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBjb21wcmVoZW5zaW9uXG4gICAgICAgICAgICB9KVxuICAgICAgICBdKTtcbiAgICAgICAgY291bnQrKztcbiAgICAgICAgLy8gT25lIGh1bWFuLXJlYWRhYmxlIHNuaXBwZXQgcGVyIHNoZWV0LlxuICAgICAgICBmb3IgKGNvbnN0IHNoZWV0IG9mIGNvbXByZWhlbnNpb24uc2hlZXRzKXtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGBzaGVldF8ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YDtcbiAgICAgICAgICAgIGNvbnN0IG1hcmtkb3duID0gW1xuICAgICAgICAgICAgICAgIGAjICR7c2hlZXQudGl0bGV9YCxcbiAgICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgICBzaGVldC5zdW1tYXJ5LFxuICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgIGAqKkNhdGVnb3J5Kio6ICR7c2hlZXQuY2F0ZWdvcnl9YCxcbiAgICAgICAgICAgICAgICBzaGVldC5wZXJpb2RIaW50ID8gYCoqUGVyaW9kKio6ICR7c2hlZXQucGVyaW9kSGludH1gIDogJydcbiAgICAgICAgICAgIF0uZmlsdGVyKChsKT0+bCAhPT0gJycpLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY2F0ZWdvcnksIGNvbnRlbnQpXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJ3NoZWV0JywgJDIpXG4gICAgICAgICBPTiBDT05GTElDVCAoa2V5KSBETyBVUERBVEUgU0VUIGNvbnRlbnQgPSBFWENMVURFRC5jb250ZW50O2AsIFtcbiAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgbWFya2Rvd25cbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb3VudDtcbn1cbi8qKlxuICogRGV0ZXJtaW5pc3RpYyB0ZW1wbGF0ZS1maXQgc2NvcmluZyAoXHUwMEE3NS41KS5cbiAqXG4gKiBTY29yZXMgdGhlIEFJLXN1Z2dlc3RlZCB0ZW1wbGF0ZSBhZ2FpbnN0IHRoZSBjb21wcmVoZW5kZWQgc2hlZXQgY2F0ZWdvcmllcy5cbiAqIE5vIGV4dGVybmFsIGltcG9ydHMgXHUyMDE0IGFsbCB0ZW1wbGF0ZSBkYXRhIGlzIGhhcmRjb2RlZCB0byBrZWVwIHRoZSBidW5kbGUgbGVhbi5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VsZWN0VGVtcGxhdGVTdGVwKGNvbXByZWhlbnNpb24pIHtcbiAgICBjb25zdCBhaVRlbXBsYXRlID0gY29tcHJlaGVuc2lvbi50ZW1wbGF0ZTtcbiAgICBjb25zdCBhaUNvbmZpZGVuY2UgPSBhaVRlbXBsYXRlPy5jb25maWRlbmNlID8/IDAuNTtcbiAgICBjb25zdCBzaGVldENhdGVnb3JpZXMgPSBjb21wcmVoZW5zaW9uLnNoZWV0cy5tYXAoKHMpPT5zLmNhdGVnb3J5KTtcbiAgICAvLyBDYXRlZ29yeSBwcm9maWxlIHBlciB0ZW1wbGF0ZSAod2hpY2ggc2hlZXQgY2F0ZWdvcmllcyBtYXRjaCBiZXN0KS5cbiAgICBjb25zdCB0ZW1wbGF0ZVByb2ZpbGVzID0ge1xuICAgICAgICAnZmluYW5jaWFsLWFuYWx5dGljcyc6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAncHJvZml0X2xvc3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAgICAgICAgICAgICAnYnJlYWtfZXZlbicsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJyxcbiAgICAgICAgICAgICAgICAndHJpYWxfYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ3N1bW1hcnlfcGwnLFxuICAgICAgICAgICAgICAgICdzdW1tYXJ5X2JzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2ZpbmFuY2lhbCcsXG4gICAgICAgICAgICAgICAgJ3BubCcsXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdCcsXG4gICAgICAgICAgICAgICAgJ2xvc3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnYnJlYWsgZXZlbicsXG4gICAgICAgICAgICAgICAgJ2JlcCcsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICByZXN0YXVyYW50OiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ2RhaWx5X3NhbGVzJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnYnJlYWtfZXZlbicsXG4gICAgICAgICAgICAgICAgJ21vbnRoX29uX21vbnRoJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ3Jlc3RhdXJhbnQnLFxuICAgICAgICAgICAgICAgICdraXRjaGVuJyxcbiAgICAgICAgICAgICAgICAnbWVudScsXG4gICAgICAgICAgICAgICAgJ2Zvb2QnLFxuICAgICAgICAgICAgICAgICdiZXZlcmFnZScsXG4gICAgICAgICAgICAgICAgJ2NvdmVycycsXG4gICAgICAgICAgICAgICAgJ2d1ZXN0cydcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgaG90ZWw6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAnZGFpbHlfc2FsZXMnLFxuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ21vbnRoX29uX21vbnRoJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdob3RlbCcsXG4gICAgICAgICAgICAgICAgJ3Jvb21zJyxcbiAgICAgICAgICAgICAgICAnb2NjdXBhbmN5JyxcbiAgICAgICAgICAgICAgICAncmV2cGFyJyxcbiAgICAgICAgICAgICAgICAnaG91c2VrZWVwaW5nJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICAnZWNvbW1lcmNlLXJldGFpbCc6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtcbiAgICAgICAgICAgICAgICAnZGFpbHlfc2FsZXMnLFxuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2Nvc3Rfb2Zfc2FsZXMnLFxuICAgICAgICAgICAgICAgICd2YXJpYW5jZSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdlY29tbWVyY2UnLFxuICAgICAgICAgICAgICAgICdyZXRhaWwnLFxuICAgICAgICAgICAgICAgICdvbmxpbmUnLFxuICAgICAgICAgICAgICAgICdza3UnLFxuICAgICAgICAgICAgICAgICdjYXJ0JyxcbiAgICAgICAgICAgICAgICAnY29udmVyc2lvbidcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgaGVhbHRoY2FyZToge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2hlYWx0aCcsXG4gICAgICAgICAgICAgICAgJ3BhdGllbnQnLFxuICAgICAgICAgICAgICAgICdjbGluaWMnLFxuICAgICAgICAgICAgICAgICdtZWRpY2FsJyxcbiAgICAgICAgICAgICAgICAncGhhcm1hY3knXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgICdzdXBwbHktY2hhaW4nOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ3ZhcmlhbmNlJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZV9zaGVldCdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdzdXBwbHknLFxuICAgICAgICAgICAgICAgICdsb2dpc3RpY3MnLFxuICAgICAgICAgICAgICAgICdpbnZlbnRvcnknLFxuICAgICAgICAgICAgICAgICd3YXJlaG91c2UnLFxuICAgICAgICAgICAgICAgICdzaGlwcGluZydcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgJ3JlYWwtZXN0YXRlJzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICdzdW1tYXJ5X2JzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ3JlYWwgZXN0YXRlJyxcbiAgICAgICAgICAgICAgICAncHJvcGVydHknLFxuICAgICAgICAgICAgICAgICdsZWFzZScsXG4gICAgICAgICAgICAgICAgJ3JlbnQnLFxuICAgICAgICAgICAgICAgICdtb3J0Z2FnZSdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgZWR1Y2F0aW9uOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnbW9udGhfb25fbW9udGgnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAga2V5d29yZHM6IFtcbiAgICAgICAgICAgICAgICAnZWR1Y2F0aW9uJyxcbiAgICAgICAgICAgICAgICAnc3R1ZGVudCcsXG4gICAgICAgICAgICAgICAgJ3R1aXRpb24nLFxuICAgICAgICAgICAgICAgICdjb3Vyc2UnLFxuICAgICAgICAgICAgICAgICdlbnJvbGxtZW50J1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICAncHJvZmVzc2lvbmFsLXNlcnZpY2VzJzoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW1xuICAgICAgICAgICAgICAgICdwcm9maXRfbG9zcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICdjb3N0X29mX3NhbGVzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgICAgICAgICAgJ2NvbnN1bHRpbmcnLFxuICAgICAgICAgICAgICAgICdzZXJ2aWNlcycsXG4gICAgICAgICAgICAgICAgJ2JpbGxpbmcnLFxuICAgICAgICAgICAgICAgICdjbGllbnQnLFxuICAgICAgICAgICAgICAgICdwcm9qZWN0J1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBtYW51ZmFjdHVyaW5nOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICAgICAgICAgICd2YXJpYW5jZSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBrZXl3b3JkczogW1xuICAgICAgICAgICAgICAgICdtYW51ZmFjdHVyaW5nJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdGlvbicsXG4gICAgICAgICAgICAgICAgJ2ZhY3RvcnknLFxuICAgICAgICAgICAgICAgICdiaWxsIG9mIG1hdGVyaWFscycsXG4gICAgICAgICAgICAgICAgJ3dvcmsgb3JkZXInXG4gICAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIGNhdGVnb3J5T3ZlcmxhcCh0bXBsSWQpIHtcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IHRlbXBsYXRlUHJvZmlsZXNbdG1wbElkXTtcbiAgICAgICAgaWYgKCFwcm9maWxlKSByZXR1cm4gMDtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHNoZWV0Q2F0ZWdvcmllcy5maWx0ZXIoKGMpPT5wcm9maWxlLmNhdGVnb3JpZXMuaW5jbHVkZXMoYykpO1xuICAgICAgICByZXR1cm4gc2hlZXRDYXRlZ29yaWVzLmxlbmd0aCA+IDAgPyBtYXRjaGVzLmxlbmd0aCAvIHNoZWV0Q2F0ZWdvcmllcy5sZW5ndGggOiAwO1xuICAgIH1cbiAgICBmdW5jdGlvbiBrZXl3b3JkTWF0Y2godG1wbElkKSB7XG4gICAgICAgIGNvbnN0IHByb2ZpbGUgPSB0ZW1wbGF0ZVByb2ZpbGVzW3RtcGxJZF07XG4gICAgICAgIGlmICghcHJvZmlsZSkgcmV0dXJuIDA7XG4gICAgICAgIGNvbnN0IHRleHQgPSBbXG4gICAgICAgICAgICBjb21wcmVoZW5zaW9uLndvcmtib29rLnRpdGxlLFxuICAgICAgICAgICAgY29tcHJlaGVuc2lvbi53b3JrYm9vay5zdW1tYXJ5LFxuICAgICAgICAgICAgY29tcHJlaGVuc2lvbi53b3JrYm9vay5jb21wYW55ID8/ICcnXG4gICAgICAgIF0uam9pbignICcpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBwcm9maWxlLmtleXdvcmRzLmZpbHRlcigoa3cpPT50ZXh0LmluY2x1ZGVzKGt3KSk7XG4gICAgICAgIHJldHVybiBwcm9maWxlLmtleXdvcmRzLmxlbmd0aCA+IDAgPyBtYXRjaGVzLmxlbmd0aCAvIHByb2ZpbGUua2V5d29yZHMubGVuZ3RoIDogMDtcbiAgICB9XG4gICAgLy8gU2NvcmUgdGhlIEFJLXN1Z2dlc3RlZCB0ZW1wbGF0ZS5cbiAgICBjb25zdCBzdWdnZXN0ZWRTY29yZSA9IGFpVGVtcGxhdGU/LmlkID8gYWlDb25maWRlbmNlICogKGNhdGVnb3J5T3ZlcmxhcChhaVRlbXBsYXRlLmlkKSAqIDAuNyArIGtleXdvcmRNYXRjaChhaVRlbXBsYXRlLmlkKSAqIDAuMykgOiAtMTtcbiAgICAvLyBTY29yZSBhbGwgdGVtcGxhdGVzIGZvciBhbHRlcm5hdGl2ZXMuXG4gICAgY29uc3QgYWxsU2NvcmVzID0gT2JqZWN0LmtleXModGVtcGxhdGVQcm9maWxlcykubWFwKChpZCk9Pih7XG4gICAgICAgICAgICBpZCxcbiAgICAgICAgICAgIHNjb3JlOiBjYXRlZ29yeU92ZXJsYXAoaWQpICogMC43ICsga2V5d29yZE1hdGNoKGlkKSAqIDAuMyxcbiAgICAgICAgICAgIHJlYXNvbjogYCR7TWF0aC5yb3VuZChjYXRlZ29yeU92ZXJsYXAoaWQpICogMTAwKX0lIGNhdGVnb3J5IG1hdGNoLCAke01hdGgucm91bmQoa2V5d29yZE1hdGNoKGlkKSAqIDEwMCl9JSBrZXl3b3JkIG1hdGNoYFxuICAgICAgICB9KSk7XG4gICAgYWxsU2NvcmVzLnNvcnQoKGEsIGIpPT5iLnNjb3JlIC0gYS5zY29yZSk7XG4gICAgY29uc3QgcmVjb21tZW5kZWQgPSBzdWdnZXN0ZWRTY29yZSA+IGFsbFNjb3Jlc1swXS5zY29yZSA/IGFpVGVtcGxhdGUuaWQgOiBhbGxTY29yZXNbMF0uaWQ7XG4gICAgY29uc3QgcmVjb21tZW5kZWRTY29yZSA9IHJlY29tbWVuZGVkID09PSBhaVRlbXBsYXRlPy5pZCA/IHN1Z2dlc3RlZFNjb3JlIDogYWxsU2NvcmVzWzBdLnNjb3JlO1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlY29tbWVuZGVkLFxuICAgICAgICBhaVN1Z2dlc3Rpb246IGFpVGVtcGxhdGU/LmlkID8/IG51bGwsXG4gICAgICAgIGFpQ29uZmlkZW5jZSxcbiAgICAgICAgc2NvcmU6IE1hdGgucm91bmQocmVjb21tZW5kZWRTY29yZSAqIDEwMCkgLyAxMDAsXG4gICAgICAgIHJlYXNvbjogYWxsU2NvcmVzWzBdLnJlYXNvbixcbiAgICAgICAgYWx0ZXJuYXRpdmVzOiBhbGxTY29yZXMuZmlsdGVyKChzKT0+cy5pZCAhPT0gcmVjb21tZW5kZWQpLnNsaWNlKDAsIDMpLm1hcCgocyk9Pih7XG4gICAgICAgICAgICAgICAgaWQ6IHMuaWQsXG4gICAgICAgICAgICAgICAgc2NvcmU6IE1hdGgucm91bmQocy5zY29yZSAqIDEwMCkgLyAxMDBcbiAgICAgICAgICAgIH0pKVxuICAgIH07XG59XG4vKiogQmVzdC1lZmZvcnQgcmVnaXN0ZXIgZHluYW1pYyBwYWdlcyBpbiB0aGUgcnVudGltZSBjYXRhbG9nLiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwKGNvbXByZWhlbnNpb24pIHtcbiAgICAvLyBzZXREeW5hbWljUGFnZXMgaXMgYSBydW50aW1lLXNpZGUgZWZmZWN0OyBpbiB0aGUgd29ya2Zsb3cgY29udGV4dCB0aGVcbiAgICAvLyBjYXRhbG9nIHJlYnVpbGRzIGZyb20gREIgYXBwX3BhZ2VzIG9uIG5leHQgcmVxdWVzdC4gQmVzdC1lZmZvcnQuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBzZXREeW5hbWljUGFnZXMgfSA9IGF3YWl0IGltcG9ydCgnLi4vLi4vc3JjL2xpYi9wYWdlLWNhdGFsb2cnKTtcbiAgICAgICAgY29uc3QgcGFnZXMgPSBjb21wcmVoZW5zaW9uLnNoZWV0cy5tYXAoKHNoZWV0KT0+KHtcbiAgICAgICAgICAgICAgICBzbHVnOiBgc2hlZXQtJHtub3JtYWxpemVTbHVnKHNoZWV0LnRhYk5hbWUpfWAsXG4gICAgICAgICAgICAgICAgdGl0bGU6IHNoZWV0LnRpdGxlLFxuICAgICAgICAgICAgICAgIGF1dGhUaWVyOiAnZ29vZ2xlJyxcbiAgICAgICAgICAgICAgICBuYXZMYWJlbDogc2hlZXQudGl0bGUsXG4gICAgICAgICAgICAgICAgc2hvd0luTmF2OiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogJ2RvY19tYXJrZG93bicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGBzaGVldF8ke25vcm1hbGl6ZVNsdWcoc2hlZXQudGFiTmFtZSl9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogc2hlZXQudGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKFNIRUVUX0NBVEVHT1JZX0JMT0NLU1tzaGVldC5jYXRlZ29yeV0gPz8gU0hFRVRfQ0FURUdPUllfQkxPQ0tTLm90aGVyKS5tYXAoKGIpPT4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrVHlwZTogYi5ibG9ja1R5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoZWV0OiBzaGVldC50YWJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogYi50aXRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgc2V0RHluYW1pY1BhZ2VzKHBhZ2VzKTtcbiAgICAgICAgcmV0dXJuIHBhZ2VzLmxlbmd0aDtcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIC8vIFJ1bnRpbWUgY2F0YWxvZyB1bmF2YWlsYWJsZSBpbiB3b3JrZmxvdyBjb250ZXh0IFx1MjAxNCBub24tY3JpdGljYWwuXG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbn1cbi8vIFx1MjUwMFx1MjUwMCBQaGFzZSA1OiBHRU5FUkFURSBzdGVwcyAoT3BlbkFJIFx1MjE5MiBCUiAvIEVTIC8gRGFzaGJvYXJkKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8qKiBQYXJzZSBCdXNpbmVzcyBSZXZpZXcgbWFya2Rvd24gaW50byBwYXJ0IHNlY3Rpb25zIChsaWdodHdlaWdodCBpbmxpbmUgcGFyc2VyKS4gKi8gZnVuY3Rpb24gcGFyc2VSZXZpZXdQYXJ0cyhtYXJrZG93bikge1xuICAgIGNvbnN0IHBhcnRzID0gW107XG4gICAgY29uc3QgaGVhZGVyUmUgPSAvXiN7MiwzfVxccytQYXJ0XFxzKyhbQS1aXSk6XFxzKiguKykkL207XG4gICAgY29uc3Qgc2VjdGlvbnMgPSBtYXJrZG93bi5zcGxpdCgvXFxuKD89I3syLDN9XFxzK1BhcnRcXHMrW0EtWl06KS8pO1xuICAgIGxldCBzb3J0T3JkZXIgPSAwO1xuICAgIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBzZWN0aW9ucyl7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gaGVhZGVyUmUuZXhlYyhzZWN0aW9uKTtcbiAgICAgICAgaWYgKCFtYXRjaCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IFssIGxldHRlciwgcmF3VGl0bGVdID0gbWF0Y2g7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gKHJhd1RpdGxlID8/IHNlY3Rpb24uc3BsaXQoJ1xcbicpWzBdPy5yZXBsYWNlKC9eI3syLDN9XFxzK1BhcnRcXHMrW0EtWl06XFxzKi8sICcnKSA/PyAnJykudHJpbSgpO1xuICAgICAgICBjb25zdCBzbHVnID0gYHBhcnQtJHsobGV0dGVyID8/ICdhJykudG9Mb3dlckNhc2UoKX1gO1xuICAgICAgICBjb25zdCBwYXJ0S2V5ID0gYHBhcnRfJHsobGV0dGVyID8/ICdhJykudG9Mb3dlckNhc2UoKX1gO1xuICAgICAgICBwYXJ0cy5wdXNoKHtcbiAgICAgICAgICAgIHNsdWcsXG4gICAgICAgICAgICBwYXJ0S2V5LFxuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBzb3J0T3JkZXI6IHNvcnRPcmRlcisrLFxuICAgICAgICAgICAgbWFya2Rvd246IHNlY3Rpb24udHJpbSgpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcGFydHM7XG59XG4vKipcbiAqIEdlbmVyYXRlIHRoZSBCdXNpbmVzcyBSZXZpZXcgZnJvbSBjb21wcmVoZW5zaW9uIGRhdGEuXG4gKiBTYXZlcyBwYXJzZWQgcGFydHMgdG8gYnVzaW5lc3NfcmV2aWV3X3BhcnRzIHZpYSBwZy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXAoY29tcHJlaGVuc2lvbiwgYXBpS2V5LCBkYlVybCwgbW9kZWwgPSAnZ3B0LTRvJykge1xuICAgIGNvbnN0IHByb21wdCA9IGJ1aWxkR2VuUHJvbXB0KGNvbXByZWhlbnNpb24sICdidXNpbmVzc1JldmlldycpO1xuICAgIGxldCBtYXJrZG93bjtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICdZb3UgYXJlIGEgcHJlY2lzZSBmaW5hbmNpYWwgYW5hbHlzdCBhbmQgYnVzaW5lc3Mgd3JpdGVyLiBSZXR1cm4gT05MWSB2YWxpZCBKU09OLidcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogcHJvbXB0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjMsXG4gICAgICAgICAgICAgICAgbWF4X3Rva2VuczogMTYzODQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VfZm9ybWF0OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdqc29uX29iamVjdCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBPcGVuQUkgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pYCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgY29uc3QgcmVwbHkgPSByZXN1bHQuY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50ID8/ICcnO1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJlcGx5KTtcbiAgICAgICAgbWFya2Rvd24gPSBwYXJzZWQuYnVzaW5lc3NSZXZpZXcgPz8gJyc7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQnVzaW5lc3MgUmV2aWV3IGdlbmVyYXRpb24gZmFpbGVkOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gKTtcbiAgICB9XG4gICAgaWYgKCFtYXJrZG93bi50cmltKCkpIHJldHVybiAwO1xuICAgIGNvbnN0IHBhcnRzID0gcGFyc2VSZXZpZXdQYXJ0cyhtYXJrZG93bik7XG4gICAgbGV0IHNhdmVkID0gMDtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHBhcnRzKXtcbiAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGVPbmUoZGIsIGBJTlNFUlQgSU5UTyBidXNpbmVzc19yZXZpZXdfcGFydHMgKGlkLCBzbHVnLCBwYXJ0X2tleSwgdGl0bGUsIHNvcnRfb3JkZXIsIGF1dGhfdGllciwgbWFya2Rvd24pXG4gICAgICAgICBWQUxVRVMgKGdlbl9yYW5kb21fdXVpZCgpOjpURVhULCAkMSwgJDIsICQzLCAkNCwgJ2dvb2dsZScsICQ1KVxuICAgICAgICAgT04gQ09ORkxJQ1QgKHNsdWcpIERPIFVQREFURSBTRVRcbiAgICAgICAgICAgcGFydF9rZXkgPSBFWENMVURFRC5wYXJ0X2tleSxcbiAgICAgICAgICAgdGl0bGUgPSBFWENMVURFRC50aXRsZSxcbiAgICAgICAgICAgc29ydF9vcmRlciA9IEVYQ0xVREVELnNvcnRfb3JkZXIsXG4gICAgICAgICAgIG1hcmtkb3duID0gRVhDTFVERUQubWFya2Rvd247YCwgW1xuICAgICAgICAgICAgICAgIHBhcnQuc2x1ZyxcbiAgICAgICAgICAgICAgICBwYXJ0LnBhcnRLZXksXG4gICAgICAgICAgICAgICAgcGFydC50aXRsZSxcbiAgICAgICAgICAgICAgICBwYXJ0LnNvcnRPcmRlcixcbiAgICAgICAgICAgICAgICBwYXJ0Lm1hcmtkb3duXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIHNhdmVkKys7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc2F2ZWQ7XG59XG4vKipcbiAqIEdlbmVyYXRlIHRoZSBFeGVjdXRpdmUgU3VtbWFyeSBmcm9tIGNvbXByZWhlbnNpb24gZGF0YS5cbiAqIFNhdmVzIHRvIGtub3dsZWRnZV9zbmlwcGV0cyB2aWEgcGcuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXAoY29tcHJlaGVuc2lvbiwgYXBpS2V5LCBkYlVybCwgbW9kZWwgPSAnZ3B0LTRvJykge1xuICAgIGNvbnN0IHByb21wdCA9IGJ1aWxkR2VuUHJvbXB0KGNvbXByZWhlbnNpb24sICdleGVjdXRpdmVTdW1tYXJ5Jyk7XG4gICAgbGV0IG1hcmtkb3duO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJ1lvdSBhcmUgYSBwcmVjaXNlIGZpbmFuY2lhbCBhbmFseXN0IGFuZCBidXNpbmVzcyB3cml0ZXIuIFJldHVybiBPTkxZIHZhbGlkIEpTT04uJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuMyxcbiAgICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAxNjM4NCxcbiAgICAgICAgICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2pzb25fb2JqZWN0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYE9wZW5BSSBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSlgKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBjb25zdCByZXBseSA9IHJlc3VsdC5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgPz8gJyc7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmVwbHkpO1xuICAgICAgICBtYXJrZG93biA9IHBhcnNlZC5leGVjdXRpdmVTdW1tYXJ5ID8/ICcnO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4ZWN1dGl2ZSBTdW1tYXJ5IGdlbmVyYXRpb24gZmFpbGVkOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gKTtcbiAgICB9XG4gICAgaWYgKCFtYXJrZG93bi50cmltKCkpIHJldHVybiBmYWxzZTtcbiAgICBhd2FpdCB3aXRoUGdDbGllbnQoZGJVcmwsIGFzeW5jIChkYik9PntcbiAgICAgICAgYXdhaXQgZXhlY3V0ZU9uZShkYiwgYElOU0VSVCBJTlRPIGtub3dsZWRnZV9zbmlwcGV0cyAoaWQsIGtleSwgY2F0ZWdvcnksIGNvbnRlbnQpXG4gICAgICAgVkFMVUVTIChnZW5fcmFuZG9tX3V1aWQoKTo6VEVYVCwgJ2V4ZWN1dGl2ZV9zdW1tYXJ5JywgJ2RvY3VtZW50JywgJDEpXG4gICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudDtgLCBbXG4gICAgICAgICAgICBtYXJrZG93blxuICAgICAgICBdKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbi8qKlxuICogR2VuZXJhdGUgdGhlIERhc2hib2FyZCBEYXRhIGZyb20gY29tcHJlaGVuc2lvbiBkYXRhLlxuICogU2F2ZXMgdG8ga25vd2xlZGdlX3NuaXBwZXRzIHZpYSBwZy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVEYXNoYm9hcmRTdGVwKGNvbXByZWhlbnNpb24sIGFwaUtleSwgZGJVcmwsIG1vZGVsID0gJ2dwdC00bycpIHtcbiAgICBjb25zdCBwcm9tcHQgPSBidWlsZEdlblByb21wdChjb21wcmVoZW5zaW9uLCAnZGFzaGJvYXJkRGF0YScpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJ1lvdSBhcmUgYSBwcmVjaXNlIGZpbmFuY2lhbCBhbmFseXN0LiBSZXR1cm4gT05MWSB2YWxpZCBKU09OIHdpdGgga2V5cyBcImFjdGlvblBoYXNlc1wiLCBcInRhcmdldFJvd3NcIiwgYW5kIFwibGV2ZXJzXCIuJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuMyxcbiAgICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAxNjM4NCxcbiAgICAgICAgICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2pzb25fb2JqZWN0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYE9wZW5BSSBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSlgKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBjb25zdCByZXBseSA9IHJlc3VsdC5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgPz8gJyc7XG4gICAgICAgIGlmICghcmVwbHkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyZXBseSk7XG4gICAgICAgIGlmICghcGFyc2VkLmFjdGlvblBoYXNlcyAmJiAhcGFyc2VkLnRhcmdldFJvd3MgJiYgIXBhcnNlZC5sZXZlcnMpIHJldHVybiBmYWxzZTtcbiAgICAgICAgYXdhaXQgd2l0aFBnQ2xpZW50KGRiVXJsLCBhc3luYyAoZGIpPT57XG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlT25lKGRiLCBgSU5TRVJUIElOVE8ga25vd2xlZGdlX3NuaXBwZXRzIChpZCwga2V5LCBjYXRlZ29yeSwgY29udGVudClcbiAgICAgICAgIFZBTFVFUyAoZ2VuX3JhbmRvbV91dWlkKCk6OlRFWFQsICdkYXNoYm9hcmRfZGF0YScsICdkb2N1bWVudCcsICQxKVxuICAgICAgICAgT04gQ09ORkxJQ1QgKGtleSkgRE8gVVBEQVRFIFNFVCBjb250ZW50ID0gRVhDTFVERUQuY29udGVudDtgLCBbXG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkocGFyc2VkKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIC8vIERhc2hib2FyZCBpcyBub24tY3JpdGljYWwgXHUyMDE0IHN3YWxsb3cgZXJyb3JzXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4vKipcbiAqIEJ1aWxkIGEgZ2VuZXJhdGlvbiBwcm9tcHQgZnJvbSB0aGUgd29ya2Jvb2sgY29tcHJlaGVuc2lvbi5cbiAqIE5vIGV4dGVybmFsIGRlcGVuZGVuY2llcyBcdTIwMTQgcHVyZSBjb21wdXRhdGlvbiBmcm9tIHRoZSBjb21wcmVoZW5zaW9uIHN0YXRlLlxuICovIGZ1bmN0aW9uIGJ1aWxkR2VuUHJvbXB0KGNvbXByZWhlbnNpb24sIHRhcmdldCkge1xuICAgIGNvbnN0IHsgd29ya2Jvb2ssIHNoZWV0cywgcHJvamVjdGlvbnMgfSA9IGNvbXByZWhlbnNpb247XG4gICAgY29uc3QgY29udGV4dCA9IFtcbiAgICAgICAgYCMgR2VuZXJhdGVkIENvbnRlbnQ6ICR7dGFyZ2V0ID09PSAnYnVzaW5lc3NSZXZpZXcnID8gJ0J1c2luZXNzIFJldmlldycgOiB0YXJnZXQgPT09ICdleGVjdXRpdmVTdW1tYXJ5JyA/ICdFeGVjdXRpdmUgU3VtbWFyeScgOiAnRGFzaGJvYXJkIERhdGEnfWAsXG4gICAgICAgICcnLFxuICAgICAgICBgIyMgV29ya2Jvb2sgU3VtbWFyeWAsXG4gICAgICAgIGAqKlRpdGxlKio6ICR7d29ya2Jvb2sudGl0bGV9YCxcbiAgICAgICAgYCoqQ29tcGFueSoqOiAke3dvcmtib29rLmNvbXBhbnkgPz8gJ04vQSd9YCxcbiAgICAgICAgYCoqUGVyaW9kKio6ICR7d29ya2Jvb2sucGVyaW9kID8/ICdOL0EnfWAsXG4gICAgICAgIGAqKkN1cnJlbmN5Kio6ICR7d29ya2Jvb2suY3VycmVuY3kgPz8gJ0lEUid9YCxcbiAgICAgICAgd29ya2Jvb2suc3VtbWFyeSxcbiAgICAgICAgJycsXG4gICAgICAgIGAjIyBTaGVldCBJbnZlbnRvcnkgKCR7c2hlZXRzLmxlbmd0aH0gc2hlZXRzKWAsXG4gICAgICAgIC4uLnNoZWV0cy5tYXAoKHMpPT5gLSAqKiR7cy50YWJOYW1lfSoqICgke3MuY2F0ZWdvcnl9KTogJHtzLnRpdGxlfSBcdTIwMTQgJHtzLnN1bW1hcnl9JHtzLnBlcmlvZEhpbnQgPyBgIFske3MucGVyaW9kSGludH1dYCA6ICcnfWApLFxuICAgICAgICAnJyxcbiAgICAgICAgYCMjIENvbnNvbGlkYXRlZCBGaW5hbmNpYWwgUHJvamVjdGlvbnNgLFxuICAgICAgICAnYGBganNvbicsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHByb2plY3Rpb25zLCBudWxsLCAyKSxcbiAgICAgICAgJ2BgYCdcbiAgICBdLmpvaW4oJ1xcbicpO1xuICAgIGlmICh0YXJnZXQgPT09ICdidXNpbmVzc1JldmlldycpIHtcbiAgICAgICAgcmV0dXJuIGAke2NvbnRleHR9XFxuXFxuR2VuZXJhdGUgT05MWSBhIFwiYnVzaW5lc3NSZXZpZXdcIiBkb2N1bWVudCBhcyBhIEpTT04gb2JqZWN0IHdpdGggYSBzaW5nbGUga2V5IFwiYnVzaW5lc3NSZXZpZXdcIiBjb250YWluaW5nIGEgY29tcHJlaGVuc2l2ZSBNYXJrZG93biBidXNpbmVzcyByZXZpZXcuIEluY2x1ZGUgc2VjdGlvbnMgZm9yIGVhY2ggcGFydCBvZiB0aGUgYnVzaW5lc3M6IFBhcnQgQTogUmV2ZW51ZSAmIFNhbGVzLCBQYXJ0IEI6IENvc3RzICYgTWFyZ2lucywgUGFydCBDOiBQcm9maXRhYmlsaXR5ICYgRUJJVERBLCBQYXJ0IEQ6IEJyZWFrLUV2ZW4gQW5hbHlzaXMsIFBhcnQgRTogVHJlbmRzICYgUHJvamVjdGlvbnMsIFBhcnQgRjogUmlza3MgJiBSZWNvbW1lbmRhdGlvbnMuIFVzZSAjIyBQYXJ0IFg6IFRpdGxlIGhlYWRlcnMuIEluY2x1ZGUgZGF0YSB0YWJsZXMgZnJvbSB0aGUgcHJvamVjdGlvbnMuYDtcbiAgICB9XG4gICAgaWYgKHRhcmdldCA9PT0gJ2V4ZWN1dGl2ZVN1bW1hcnknKSB7XG4gICAgICAgIHJldHVybiBgJHtjb250ZXh0fVxcblxcbkdlbmVyYXRlIE9OTFkgYW4gXCJleGVjdXRpdmVTdW1tYXJ5XCIgZG9jdW1lbnQgYXMgYSBKU09OIG9iamVjdCB3aXRoIGEgc2luZ2xlIGtleSBcImV4ZWN1dGl2ZVN1bW1hcnlcIiBjb250YWluaW5nIGEgY29uY2lzZSBNYXJrZG93biBleGVjdXRpdmUgc3VtbWFyeSAoMS0yIHBhZ2VzKSBoaWdobGlnaHRpbmcgdGhlIGtleSBmaW5hbmNpYWwgbWV0cmljcywgdHJlbmRzLCByaXNrcywgYW5kIGFjdGlvbmFibGUgcmVjb21tZW5kYXRpb25zIGZyb20gdGhlIHdvcmtib29rIGRhdGEuYDtcbiAgICB9XG4gICAgcmV0dXJuIGAke2NvbnRleHR9XFxuXFxuR2VuZXJhdGUgT05MWSBhIEpTT04gb2JqZWN0IHdpdGgga2V5cyBcImFjdGlvblBoYXNlc1wiIChhcnJheSBvZiB7cGhhc2UsIGRlc2NyaXB0aW9ufSksIFwidGFyZ2V0Um93c1wiIChhcnJheSBvZiB7bGFiZWwsIHZhbHVlLCB1bml0fSksIGFuZCBcImxldmVyc1wiIChhcnJheSBvZiB7bmFtZSwgaW1wYWN0LCBhY3Rpb25zW119KSBiYXNlZCBvbiB0aGUgZmluYW5jaWFsIGRhdGEuIEZvY3VzIG9uIGFjdGlvbmFibGUgb3BlcmF0aW9uYWwgcmVjb21tZW5kYXRpb25zLmA7XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vbG9hZFdvcmtib29rU3RlcFwiLCBsb2FkV29ya2Jvb2tTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9leHRyYWN0U2hlZXRzU3RlcFwiLCBleHRyYWN0U2hlZXRzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vYW5hbHl6ZVNoZWV0c1N0ZXBcIiwgYW5hbHl6ZVNoZWV0c1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NhdmVXb3JrYm9va0Zvcm11bGFNYXBTdGVwXCIsIHNhdmVXb3JrYm9va0Zvcm11bGFNYXBTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9jb21wcmVoZW5kV29ya2Jvb2tTdGVwXCIsIGNvbXByZWhlbmRXb3JrYm9va1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2VtaXRQcm9ncmVzc1N0ZXBcIiwgZW1pdFByb2dyZXNzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vY2xvc2VQcm9ncmVzc1N0ZXBcIiwgY2xvc2VQcm9ncmVzc1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3BvcHVsYXRlUHJvamVjdGlvbnNTdGVwXCIsIHBvcHVsYXRlUHJvamVjdGlvbnNTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy91cHNlcnRTaGVldFBhZ2VzU3RlcFwiLCB1cHNlcnRTaGVldFBhZ2VzU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vc2F2ZVNuaXBwZXRzU3RlcFwiLCBzYXZlU25pcHBldHNTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zZWxlY3RUZW1wbGF0ZVN0ZXBcIiwgc2VsZWN0VGVtcGxhdGVTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9yZWdpc3RlckR5bmFtaWNQYWdlc1N0ZXBcIiwgcmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcFwiLCBnZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcFwiLCBnZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZURhc2hib2FyZFN0ZXBcIiwgZ2VuZXJhdGVEYXNoYm9hcmRTdGVwKTtcbiIsICIvKipcbiAqIFdvcmtib29rIFNoZWV0IEV4dHJhY3Rpb24gKGRlcGVuZGVuY3ktZnJlZSlcbiAqXG4gKiBQdXJlIHNoZWV0IHNlcmlhbGl6YXRpb24gKyBzdHJ1Y3R1cmFsIHN0YXRpc3RpY3MuIFRoaXMgbW9kdWxlIGludGVudGlvbmFsbHlcbiAqIGhhcyBOTyBhcHBsaWNhdGlvbiBhbGlhc2VzIChgQC8uLi5gKSwgbm8gem9kLCBhbmQgbm8gT3BlbkFJIGltcG9ydHMgc28gdGhhdFxuICogaXQgY2FuIGJlIGJ1bmRsZWQgaW50byBWZXJjZWwgV29ya2Zsb3cgc3RlcCBidW5kbGVzICh3b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0KVxuICogd2l0aG91dCBkcmFnZ2luZyB0aGUgd2hvbGUgZG9tYWluIGxheWVyIGFsb25nLlxuICpcbiAqIFRoZSBBSS1maXJzdCBwaXBlbGluZSBzZXJpYWxpemVzIGV2ZXJ5IHNoZWV0IHRvIHBsYWluIHRleHQgKHRhYiBuYW1lICsgcm93cylcbiAqIGFuZCBsZXRzIHRoZSBtb2RlbCBkbyB0aGUgY29tcHJlaGVuc2lvbi4gVGhlIHN0cnVjdHVyYWwgc3RhdGlzdGljcyBwcm9kdWNlZFxuICogaGVyZSBmZWVkIGEgZGV0ZXJtaW5pc3RpYyBBTkFMWVpFIHByZS1wYXNzIHRoYXQgZW5yaWNoZXMgdGhlIEFJIHByb21wdC5cbiAqLyBpbXBvcnQgeyByZWFkLCB1dGlscyB9IGZyb20gJ3hsc3gnO1xuZXhwb3J0IGNvbnN0IFNIRUVUX0NBVEVHT1JJRVMgPSBbXG4gICAgJ2RhaWx5X3NhbGVzJyxcbiAgICAncHJvZml0X2xvc3MnLFxuICAgICdiYWxhbmNlX3NoZWV0JyxcbiAgICAndHJpYWxfYmFsYW5jZScsXG4gICAgJ2dlbmVyYWxfbGVkZ2VyJyxcbiAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgJ21vbnRoX29uX21vbnRoJyxcbiAgICAnYnJlYWtfZXZlbicsXG4gICAgJ3ZhcmlhbmNlJyxcbiAgICAnc3VtbWFyeV9wbCcsXG4gICAgJ3N1bW1hcnlfYnMnLFxuICAgICdvdGhlcidcbl07XG5leHBvcnQgY29uc3QgTUFYX1NIRUVUX1JPV1MgPSA0MDtcbmV4cG9ydCBjb25zdCBNQVhfU0hFRVRfQ09MUyA9IDE2O1xuZXhwb3J0IGNvbnN0IE1BWF9DRUxMX0NIQVJTID0gODA7XG5mdW5jdGlvbiBmb3JtYXRDZWxsKHYpIHtcbiAgICBpZiAodiA9PSBudWxsKSByZXR1cm4gJyc7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoTnVtYmVyLmlzSW50ZWdlcih2KSkgcmV0dXJuIFN0cmluZyh2KTtcbiAgICAgICAgcmV0dXJuIHYudG9GaXhlZCgyKS5yZXBsYWNlKC9cXC4wMCQvLCAnJyk7XG4gICAgfVxuICAgIGNvbnN0IHMgPSBTdHJpbmcodikucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKTtcbiAgICByZXR1cm4gcy5sZW5ndGggPiBNQVhfQ0VMTF9DSEFSUyA/IHMuc2xpY2UoMCwgTUFYX0NFTExfQ0hBUlMgLSAxKSArICdcdTIwMjYnIDogcztcbn1cbmZ1bmN0aW9uIHJlYWRGdWxsR3JpZChzaGVldCkge1xuICAgIHJldHVybiB1dGlscy5zaGVldF90b19qc29uKHNoZWV0LCB7XG4gICAgICAgIGhlYWRlcjogMSxcbiAgICAgICAgZGVmdmFsOiBudWxsLFxuICAgICAgICByYXc6IHRydWVcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGNhcEdyaWQoZ3JpZCwgbWF4Um93cywgbWF4Q29scykge1xuICAgIGNvbnN0IGNhcHBlZCA9IFtdO1xuICAgIGZvcihsZXQgciA9IDA7IHIgPCBNYXRoLm1pbihncmlkLmxlbmd0aCwgbWF4Um93cyk7IHIrKyl7XG4gICAgICAgIGNvbnN0IHJvdyA9IGdyaWRbcl0gPz8gW107XG4gICAgICAgIGNvbnN0IHRyaW1tZWQgPSByb3cuc2xpY2UoMCwgbWF4Q29scyk7XG4gICAgICAgIGlmICh0cmltbWVkLnNvbWUoKGMpPT5jICE9IG51bGwgJiYgU3RyaW5nKGMpLnRyaW0oKSAhPT0gJycpKSBjYXBwZWQucHVzaCh0cmltbWVkKTtcbiAgICB9XG4gICAgcmV0dXJuIGNhcHBlZDtcbn1cbmZ1bmN0aW9uIGdyaWRUb1RleHQoZ3JpZCkge1xuICAgIGNvbnN0IGxpbmVzID0gZ3JpZC5tYXAoKHJvdywgaSk9PntcbiAgICAgICAgY29uc3QgY2VsbHMgPSByb3cubWFwKChjKT0+Zm9ybWF0Q2VsbChjKSk7XG4gICAgICAgIC8vIFRyaW0gdHJhaWxpbmcgZW1wdGllcyBmb3IgY29tcGFjdG5lc3NcbiAgICAgICAgd2hpbGUoY2VsbHMubGVuZ3RoID4gMCAmJiBjZWxsc1tjZWxscy5sZW5ndGggLSAxXSA9PT0gJycpY2VsbHMucG9wKCk7XG4gICAgICAgIHJldHVybiBgUiR7aSArIDF9OiAke2NlbGxzLmpvaW4oJyB8ICcpfWA7XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xufVxuZnVuY3Rpb24gY29tcHV0ZVN0YXRzKHRhYk5hbWUsIGdyaWQpIHtcbiAgICBsZXQgY29sQ291bnQgPSAwO1xuICAgIGxldCBudW1lcmljQ2VsbHMgPSAwO1xuICAgIGxldCBub25FbXB0eUNlbGxzID0gMDtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBncmlkKXtcbiAgICAgICAgaWYgKHJvdy5sZW5ndGggPiBjb2xDb3VudCkgY29sQ291bnQgPSByb3cubGVuZ3RoO1xuICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2Ygcm93KXtcbiAgICAgICAgICAgIGlmIChjZWxsID09IG51bGwgfHwgU3RyaW5nKGNlbGwpLnRyaW0oKSA9PT0gJycpIGNvbnRpbnVlO1xuICAgICAgICAgICAgbm9uRW1wdHlDZWxscysrO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjZWxsID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIG51bWVyaWNDZWxscysrO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbCA9PT0gJ3N0cmluZycgJiYgL15bLStdP1xcZFtcXGQuLF0qJC8udGVzdChjZWxsLnRyaW0oKSkpIHtcbiAgICAgICAgICAgICAgICBudW1lcmljQ2VsbHMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICB0YWJOYW1lLFxuICAgICAgICByb3dDb3VudDogZ3JpZC5sZW5ndGgsXG4gICAgICAgIGNvbENvdW50LFxuICAgICAgICBudW1lcmljUmF0aW86IG5vbkVtcHR5Q2VsbHMgPiAwID8gbnVtZXJpY0NlbGxzIC8gbm9uRW1wdHlDZWxscyA6IDAsXG4gICAgICAgIG5vbkVtcHR5Q2VsbHNcbiAgICB9O1xufVxuLyoqIFNlcmlhbGl6ZSBvbmUgd29ya3NoZWV0IHRvIHRleHQgKHJvdy1udW1iZXJlZCwgY2FwcGVkKSBmb3IgdGhlIEFJIHByb21wdC4gKi8gZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclNoZWV0Rm9yQWkod2IsIHRhYk5hbWUsIG1heFJvd3MgPSBNQVhfU0hFRVRfUk9XUywgbWF4Q29scyA9IE1BWF9TSEVFVF9DT0xTKSB7XG4gICAgY29uc3Qgc2hlZXQgPSB3Yi5TaGVldHNbdGFiTmFtZV07XG4gICAgaWYgKCFzaGVldCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgZ3JpZCA9IGNhcEdyaWQocmVhZEZ1bGxHcmlkKHNoZWV0KSwgbWF4Um93cywgbWF4Q29scyk7XG4gICAgaWYgKGdyaWQubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgICB0YWJOYW1lLFxuICAgICAgICB0ZXh0OiBncmlkVG9UZXh0KGdyaWQpXG4gICAgfTtcbn1cbi8qKiBTZXJpYWxpemUgQUxMIHNoZWV0cyBvZiBhIHdvcmtib29rIHRvIHRleHQgYmxvY2tzLiBBY2NlcHRzIFVpbnQ4QXJyYXkgb3IgQnVmZmVyLiAqLyBleHBvcnQgZnVuY3Rpb24gcmVuZGVyQWxsU2hlZXRzRm9yQWkoYnVmKSB7XG4gICAgY29uc3Qgd2IgPSByZWFkKGJ1Ziwge1xuICAgICAgICB0eXBlOiAnYnVmZmVyJ1xuICAgIH0pO1xuICAgIGNvbnN0IGJsb2NrcyA9IFtdO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiB3Yi5TaGVldE5hbWVzID8/IFtdKXtcbiAgICAgICAgY29uc3QgcmVuZGVyZWQgPSByZW5kZXJTaGVldEZvckFpKHdiLCBuYW1lKTtcbiAgICAgICAgaWYgKHJlbmRlcmVkKSBibG9ja3MucHVzaChyZW5kZXJlZCk7XG4gICAgfVxuICAgIHJldHVybiBibG9ja3M7XG59XG4vKipcbiAqIFNlcmlhbGl6ZSBBTEwgc2hlZXRzIEFORCBjb21wdXRlIGZ1bGwtZ3JpZCBzdHJ1Y3R1cmFsIHN0YXRpc3RpY3MuXG4gKiBUaGlzIGlzIHRoZSBFWFRSQUNUIG91dHB1dCBmb3IgdGhlIHdvcmtmbG93IHBpcGVsaW5lOiBvbmUgcGFyc2UgcGVyXG4gKiBzaGVldCBwcm9kdWNlcyBib3RoIHRoZSBBSSBwcm9tcHQgYmxvY2sgYW5kIHRoZSBBTkFMWVpFIGhpbnRzLlxuICovIGV4cG9ydCBmdW5jdGlvbiBleHRyYWN0U2hlZXRzV2l0aFN0YXRzKGJ1Zikge1xuICAgIGNvbnN0IHdiID0gcmVhZChidWYsIHtcbiAgICAgICAgdHlwZTogJ2J1ZmZlcidcbiAgICB9KTtcbiAgICBjb25zdCBzaGVldHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygd2IuU2hlZXROYW1lcyA/PyBbXSl7XG4gICAgICAgIGNvbnN0IHNoZWV0ID0gd2IuU2hlZXRzW25hbWVdO1xuICAgICAgICBpZiAoIXNoZWV0KSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZnVsbEdyaWQgPSByZWFkRnVsbEdyaWQoc2hlZXQpO1xuICAgICAgICBpZiAoZnVsbEdyaWQubGVuZ3RoID09PSAwKSBjb250aW51ZTtcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBjb21wdXRlU3RhdHMobmFtZSwgZnVsbEdyaWQpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gZ3JpZFRvVGV4dChjYXBHcmlkKGZ1bGxHcmlkLCBNQVhfU0hFRVRfUk9XUywgTUFYX1NIRUVUX0NPTFMpKTtcbiAgICAgICAgc2hlZXRzLnB1c2goe1xuICAgICAgICAgICAgdGFiTmFtZTogbmFtZSxcbiAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICBzdGF0c1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHNoZWV0cztcbn1cbiIsICIvKipcbiAqIFdvcmtib29rIFNoZWV0IEFuYWx5c2lzIChkZXRlcm1pbmlzdGljIHByZS1wYXNzKVxuICpcbiAqIEEgZGVwZW5kZW5jeS1mcmVlIGhldXJpc3RpYyBwYXNzIG92ZXIgZXh0cmFjdGVkIHNoZWV0cyB0aGF0IHByb2R1Y2VzXG4gKiBcIkFuYWx5c2lzSGludHNcIiBcdTIwMTQgc3RydWN0dXJlZCBjb250ZXh0IHRoYXQ6XG4gKiAgIC0gaXMgZmVkIGludG8gdGhlIENPTVBSRUhFTkQgcHJvbXB0IHRvIGJpYXMgdGhlIG1vZGVsIChQaGFzZSAyKSxcbiAqICAgLSBnaXZlcyB0aGUgcm91dGUgbGF5ZXIgYSBmYXN0IHByZS1BSSBzdGF0dXMgKFwid2Ugc2VlIDQgc2hlZXRzLCBtb3N0bHlcbiAqICAgICBudW1lcmljLCBsaWtlbHkgSURSLCBwZXJpb2QgaGludHMgMjAyNi0wNlwiKS5cbiAqXG4gKiBObyBhcHBsaWNhdGlvbiBhbGlhc2VzIGFuZCBubyBleHRlcm5hbCBkZXBzIFx1MjAxNCBzYWZlIHRvIGJ1bmRsZSBpbnRvIHRoZVxuICogVmVyY2VsIFdvcmtmbG93IHN0ZXAgYnVuZGxlLlxuICovIGltcG9ydCB7IFNIRUVUX0NBVEVHT1JJRVMgfSBmcm9tICcuL2V4dHJhY3Qtc2hlZXRzJztcbi8vIFx1MjUwMFx1MjUwMCBIZXVyaXN0aWMgdGFibGVzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuY29uc3QgQ1VSUkVOQ1lfUEFUVEVSTlMgPSBbXG4gICAgW1xuICAgICAgICAnSURSJyxcbiAgICAgICAgL1xcYig/OklEUnxScFxcLj98UnVwaWFoKVxcYi9pXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdVU0QnLFxuICAgICAgICAvXFxiKD86VVNEfFxcJClcXGIvXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdFVVInLFxuICAgICAgICAvXFxiKD86RVVSfFx1MjBBQylcXGIvXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdHQlAnLFxuICAgICAgICAvXFxiKD86R0JQfFx1MDBBMylcXGIvXG4gICAgXVxuXTtcbmNvbnN0IE1PTlRIX05BTUVTID0gW1xuICAgICdqYW51YXJ5JyxcbiAgICAnZmVicnVhcnknLFxuICAgICdtYXJjaCcsXG4gICAgJ2FwcmlsJyxcbiAgICAnbWF5JyxcbiAgICAnanVuZScsXG4gICAgJ2p1bHknLFxuICAgICdhdWd1c3QnLFxuICAgICdzZXB0ZW1iZXInLFxuICAgICdvY3RvYmVyJyxcbiAgICAnbm92ZW1iZXInLFxuICAgICdkZWNlbWJlcicsXG4gICAgJ2phbnVhcmknLFxuICAgICdmZWJydWFyaScsXG4gICAgJ21hcmV0JyxcbiAgICAnYXByaWwnLFxuICAgICdtZWknLFxuICAgICdqdW5pJyxcbiAgICAnanVsaScsXG4gICAgJ2FndXN0dXMnLFxuICAgICdzZXB0ZW1iZXInLFxuICAgICdva3RvYmVyJyxcbiAgICAnbm92ZW1iZXInLFxuICAgICdkZXNlbWJlcidcbl07XG5mdW5jdGlvbiBwZXJpb2RQYXR0ZXJucygpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAvXFxiKDE5fDIwKVxcZHsyfVstL10oMD9bMS05XXwxWzAtMl0pKD86Wy0vXVxcZHsxLDJ9KT9cXGIvZyxcbiAgICAgICAgL1xcYigwP1sxLTldfDFbMC0yXSlbLS9dKDE5fDIwKVxcZHsyfVxcYi9nLFxuICAgICAgICBuZXcgUmVnRXhwKGBcXFxcYig/OiR7TU9OVEhfTkFNRVMuam9pbignfCcpfSlcXFxcYmAsICdnaScpLFxuICAgICAgICAvXFxiUVsxLTRdWyAtXT8oPzoxOXwyMClcXGR7Mn1cXGIvZ2lcbiAgICBdO1xufVxuY29uc3QgTEFCRUxfQ0FURUdPUllfTUFQID0gW1xuICAgIFtcbiAgICAgICAgJ3Byb2ZpdF9sb3NzJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ1BST0ZJVCAmIExPU1MnLFxuICAgICAgICAgICAgJ1BST0ZJVCBBTkQgTE9TUycsXG4gICAgICAgICAgICAnTGFiYSBSdWdpJyxcbiAgICAgICAgICAgICdJTkNPTUUgU1RBVEVNRU5UJyxcbiAgICAgICAgICAgICdQJkwnLFxuICAgICAgICAgICAgJ0VCSVREQScsXG4gICAgICAgICAgICAnTkVUIFBST0ZJVCcsXG4gICAgICAgICAgICAnTkVUIElOQ09NRScsXG4gICAgICAgICAgICAnTEFCQSBCRVJTSUgnLFxuICAgICAgICAgICAgJ1JVR0knXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ2JhbGFuY2Vfc2hlZXQnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnQkFMQU5DRSBTSEVFVCcsXG4gICAgICAgICAgICAnTkVSQUNBJyxcbiAgICAgICAgICAgICdBU1NFVCcsXG4gICAgICAgICAgICAnTElBQklMSVQnLFxuICAgICAgICAgICAgJ0VLVUlUQVMnLFxuICAgICAgICAgICAgJ0VRVUlUWScsXG4gICAgICAgICAgICAnVE9UQUwgQVNTRVRTJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICd0cmlhbF9iYWxhbmNlJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ1RSSUFMIEJBTEFOQ0UnLFxuICAgICAgICAgICAgJ05FUkFDQSBTQUxETydcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnZ2VuZXJhbF9sZWRnZXInLFxuICAgICAgICBbXG4gICAgICAgICAgICAnR0VORVJBTCBMRURHRVInLFxuICAgICAgICAgICAgJ0JVS1UgQkVTQVInLFxuICAgICAgICAgICAgJ0pVUk5BTCdcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnY29zdF9vZl9zYWxlcycsXG4gICAgICAgIFtcbiAgICAgICAgICAgICdDT1NUIE9GIFNBTEVTJyxcbiAgICAgICAgICAgICdDT0dTJyxcbiAgICAgICAgICAgICdIQVJHQSBQT0tPSycsXG4gICAgICAgICAgICAnRk9PRCBDT1NUJyxcbiAgICAgICAgICAgICdCRVZFUkFHRSBDT1NUJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdicmVha19ldmVuJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ0JSRUFLIEVWRU4nLFxuICAgICAgICAgICAgJ0JSRUFLLUVWRU4nLFxuICAgICAgICAgICAgJ0JFUCcsXG4gICAgICAgICAgICAnVElUSUsgSU1QQVMnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ2RhaWx5X3NhbGVzJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ0RBSUxZIFNBTEVTJyxcbiAgICAgICAgICAgICdQRU5KVUFMQU4gSEFSSUFOJyxcbiAgICAgICAgICAgICdPTVpFVCdcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAnbW9udGhfb25fbW9udGgnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnTU9OVEggT04gTU9OVEgnLFxuICAgICAgICAgICAgJ01PTScsXG4gICAgICAgICAgICAnQlVMQU5BTidcbiAgICAgICAgXVxuICAgIF0sXG4gICAgW1xuICAgICAgICAndmFyaWFuY2UnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnVkFSSUFOQ0UnLFxuICAgICAgICAgICAgJ1ZBUklBTlNJJyxcbiAgICAgICAgICAgICdTRUxJU0lIJyxcbiAgICAgICAgICAgICdBQ1RVQUwgVlMgQlVER0VUJyxcbiAgICAgICAgICAgICdBQ1RVQUwgVlMnXG4gICAgICAgIF1cbiAgICBdLFxuICAgIFtcbiAgICAgICAgJ3N1bW1hcnlfcGwnLFxuICAgICAgICBbXG4gICAgICAgICAgICAnU1VNTUFSWSBQJkwnLFxuICAgICAgICAgICAgJ1JJTkdLQVNBTiBMQUJBIFJVR0knLFxuICAgICAgICAgICAgJ1NVTU1BUlkgUFJPRklUJ1xuICAgICAgICBdXG4gICAgXSxcbiAgICBbXG4gICAgICAgICdzdW1tYXJ5X2JzJyxcbiAgICAgICAgW1xuICAgICAgICAgICAgJ1NVTU1BUlkgQkFMQU5DRScsXG4gICAgICAgICAgICAnUklOR0tBU0FOIE5FUkFDQSdcbiAgICAgICAgXVxuICAgIF1cbl07XG5mdW5jdGlvbiBjb2xsZWN0SGludHModGV4dCkge1xuICAgIGNvbnN0IGN1cnJlbmN5ID0gW107XG4gICAgZm9yIChjb25zdCBbbmFtZSwgcmVdIG9mIENVUlJFTkNZX1BBVFRFUk5TKXtcbiAgICAgICAgaWYgKHJlLnRlc3QodGV4dCkpIGN1cnJlbmN5LnB1c2gobmFtZSk7XG4gICAgfVxuICAgIGNvbnN0IHBlcmlvZHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHJlIG9mIHBlcmlvZFBhdHRlcm5zKCkpe1xuICAgICAgICBjb25zdCBtYXRjaGVzID0gdGV4dC5tYXRjaChyZSk7XG4gICAgICAgIGlmIChtYXRjaGVzKSBwZXJpb2RzLnB1c2goLi4ubWF0Y2hlcyk7XG4gICAgfVxuICAgIGNvbnN0IGxhYmVscyA9IFtdO1xuICAgIGZvciAoY29uc3QgWywgdGVybXNdIG9mIExBQkVMX0NBVEVHT1JZX01BUCl7XG4gICAgICAgIGZvciAoY29uc3QgdGVybSBvZiB0ZXJtcyl7XG4gICAgICAgICAgICBpZiAodGV4dC50b1VwcGVyQ2FzZSgpLmluY2x1ZGVzKHRlcm0udG9VcHBlckNhc2UoKSkpIGxhYmVscy5wdXNoKHRlcm0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGN1cnJlbmN5LFxuICAgICAgICBwZXJpb2RzLFxuICAgICAgICBsYWJlbHNcbiAgICB9O1xufVxuZnVuY3Rpb24gZ3Vlc3NDYXRlZ29yeShsYWJlbHMpIHtcbiAgICBjb25zdCBzY29yZXMgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBbY2F0ZWdvcnksIHRlcm1zXSBvZiBMQUJFTF9DQVRFR09SWV9NQVApe1xuICAgICAgICBsZXQgc2NvcmUgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybXMpe1xuICAgICAgICAgICAgaWYgKGxhYmVscy5pbmNsdWRlcyh0ZXJtKSkgc2NvcmUgKz0gdGVybS5sZW5ndGg7IC8vIGxvbmdlciB0ZXJtcyBhcmUgbW9yZSBzcGVjaWZpY1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY29yZSA+IDApIHNjb3Jlcy5zZXQoY2F0ZWdvcnksIHNjb3JlKTtcbiAgICB9XG4gICAgaWYgKHNjb3Jlcy5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBzb3J0ZWQgPSBbXG4gICAgICAgIC4uLnNjb3Jlcy5lbnRyaWVzKClcbiAgICBdLnNvcnQoKGEsIGIpPT5iWzFdIC0gYVsxXSk7XG4gICAgaWYgKHNvcnRlZC5sZW5ndGggPiAxICYmIHNvcnRlZFswXVsxXSA9PT0gc29ydGVkWzFdWzFdKSByZXR1cm4gbnVsbDsgLy8gdGllIFx1MjE5MiBhbWJpZ3VvdXNcbiAgICByZXR1cm4gc29ydGVkWzBdWzBdO1xufVxuZnVuY3Rpb24gYmVzdEd1ZXNzKHZhbHVlcykge1xuICAgIGlmICh2YWx1ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBjb3VudHMgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCB2IG9mIHZhbHVlcyljb3VudHMuc2V0KHYsIChjb3VudHMuZ2V0KHYpID8/IDApICsgMSk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgLi4uY291bnRzLmVudHJpZXMoKVxuICAgIF0uc29ydCgoYSwgYik9PmJbMV0gLSBhWzFdKVswXVswXTtcbn1cbi8vIFx1MjUwMFx1MjUwMCBQdWJsaWMgQVBJIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuLyoqIEFuYWx5emUgZXh0cmFjdGVkIHNoZWV0cyAoRVhUUkFDVCBvdXRwdXQpIGludG8gZGV0ZXJtaW5pc3RpYyBoaW50cy4gKi8gZXhwb3J0IGZ1bmN0aW9uIGFuYWx5emVTaGVldHMoc2hlZXRzKSB7XG4gICAgY29uc3Qgc2hlZXRIaW50cyA9IHNoZWV0cy5tYXAoKHMpPT57XG4gICAgICAgIGNvbnN0IHsgY3VycmVuY3ksIHBlcmlvZHMsIGxhYmVscyB9ID0gY29sbGVjdEhpbnRzKHMudGV4dCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0YWJOYW1lOiBzLnRhYk5hbWUsXG4gICAgICAgICAgICByb3dDb3VudDogcy5zdGF0cy5yb3dDb3VudCxcbiAgICAgICAgICAgIGNvbENvdW50OiBzLnN0YXRzLmNvbENvdW50LFxuICAgICAgICAgICAgbnVtZXJpY1JhdGlvOiBzLnN0YXRzLm51bWVyaWNSYXRpbyxcbiAgICAgICAgICAgIGN1cnJlbmN5SGludHM6IGN1cnJlbmN5LFxuICAgICAgICAgICAgcGVyaW9kSGludHM6IHBlcmlvZHMsXG4gICAgICAgICAgICBsYWJlbEhpbnRzOiBsYWJlbHMsXG4gICAgICAgICAgICBsaWtlbHlDYXRlZ29yeTogZ3Vlc3NDYXRlZ29yeShsYWJlbHMpXG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgY29uc3QgdG90YWxSb3dzID0gc2hlZXRIaW50cy5yZWR1Y2UoKGFjYywgcyk9PmFjYyArIHMucm93Q291bnQsIDApO1xuICAgIGNvbnN0IHRvdGFsTm9uRW1wdHlDZWxscyA9IHNoZWV0cy5yZWR1Y2UoKGFjYywgcyk9PmFjYyArIHMuc3RhdHMubm9uRW1wdHlDZWxscywgMCk7XG4gICAgY29uc3Qgd2VpZ2h0ZWROdW1lcmljID0gc2hlZXRzLnJlZHVjZSgoYWNjLCBzKT0+YWNjICsgcy5zdGF0cy5udW1lcmljUmF0aW8gKiBzLnN0YXRzLm5vbkVtcHR5Q2VsbHMsIDApO1xuICAgIGNvbnN0IGFsbEN1cnJlbmN5ID0gc2hlZXRIaW50cy5mbGF0TWFwKChzKT0+cy5jdXJyZW5jeUhpbnRzKTtcbiAgICBjb25zdCBhbGxQZXJpb2RzID0gc2hlZXRIaW50cy5mbGF0TWFwKChzKT0+cy5wZXJpb2RIaW50cyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgd29ya2Jvb2s6IHtcbiAgICAgICAgICAgIHNoZWV0Q291bnQ6IHNoZWV0cy5sZW5ndGgsXG4gICAgICAgICAgICB0b3RhbFJvd3MsXG4gICAgICAgICAgICB0b3RhbE5vbkVtcHR5Q2VsbHMsXG4gICAgICAgICAgICBvdmVyYWxsTnVtZXJpY1JhdGlvOiB0b3RhbE5vbkVtcHR5Q2VsbHMgPiAwID8gd2VpZ2h0ZWROdW1lcmljIC8gdG90YWxOb25FbXB0eUNlbGxzIDogMCxcbiAgICAgICAgICAgIGN1cnJlbmN5R3Vlc3M6IGJlc3RHdWVzcyhhbGxDdXJyZW5jeSksXG4gICAgICAgICAgICBwZXJpb2RHdWVzczogYmVzdEd1ZXNzKGFsbFBlcmlvZHMpXG4gICAgICAgIH0sXG4gICAgICAgIHNoZWV0czogc2hlZXRIaW50c1xuICAgIH07XG59XG5leHBvcnQgeyBTSEVFVF9DQVRFR09SSUVTIH07XG4iLCAiLyoqXG4gKiBXb3JrYm9vayBDb21wcmVoZW5zaW9uIFx1MjAxNCBidW5kbGUtbGVhbiBPcGVuQUkgY2FsbFxuICpcbiAqIFRoaXMgbW9kdWxlIGNvbnRhaW5zIE9OTFkgdGhlIGNvbXByZWhlbnNpb24gcmVxdWVzdCBwYXRoOiBab2Qgc2NoZW1hcyxcbiAqIHByb21wdCBidWlsZGluZyAoaGludHMtYXdhcmUpLCBhIHNpbmdsZS1hdHRlbXB0IE9wZW5BSSBjYWxsIHdpdGggdHlwZWRcbiAqIGVycm9ycywgYW5kIHJlc3BvbnNlIHBhcnNpbmcuXG4gKlxuICogQnVuZGxlIGNvbnN0cmFpbnRzOlxuICogICAtIE5PIGFwcGxpY2F0aW9uIGFsaWFzZXMgKGBALy4uLmApIFx1MjAxNCBvbmx5IGB6b2RgICsgcmVsYXRpdmUgaW1wb3J0cy5cbiAqICAgLSBObyBEQiAvIHNlY3JldHMgLyBQcmlzbWEgXHUyMDE0IHRoZSBBUEkga2V5IGlzIHBhc3NlZCBpbiBleHBsaWNpdGx5LlxuICogICAtIFNhZmUgdG8gYnVuZGxlIGludG8gVmVyY2VsIFdvcmtmbG93IHN0ZXAgYnVuZGxlcyAod29ya2Zsb3dzLyopLlxuICpcbiAqIFRoZSBzeW5jIHBpcGVsaW5lIHdyYXBwZXIgKGBjb21wcmVoZW5kV29ya2Jvb2tgIGluIHdvcmtib29rLWNvbXByZWhlbnNpb24udHMpXG4gKiBrZWVwcyBpdHMgb3duIGtleSByZXNvbHV0aW9uICsgMi1hdHRlbXB0IHJldHJ5IGxvb3AgZm9yIHRoZSBub24td29ya2Zsb3dcbiAqIHBhdGg7IHRoaXMgbW9kdWxlIGlzIHRoZSBzaGFyZWQgc2luZ2xlLWF0dGVtcHQgY29yZS5cbiAqLyBpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IFNIRUVUX0NBVEVHT1JJRVMgfSBmcm9tICcuL2V4dHJhY3Qtc2hlZXRzJztcbi8vIFx1MjUwMFx1MjUwMCBab2QgdmFsaWRhdGlvbiBzY2hlbWEgZm9yIHRoZSBBSSBzdHJ1Y3R1cmVkIG91dHB1dCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmV4cG9ydCBjb25zdCBNZXRyaWNTY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgLyoqIFBlcmlvZCBpbiBZWVlZLU1NIChhbm51YWwgdG90YWxzIG1heSB1c2UgWVlZWS0xMikuICovIHBlcmlvZDogei5zdHJpbmcoKS5yZWdleCgvXlxcZHs0fS1cXGR7Mn0kLyksXG4gICAgZGF0YVR5cGU6IHouZW51bShbXG4gICAgICAgICdhY3R1YWwnLFxuICAgICAgICAnZm9yZWNhc3QnXG4gICAgXSksXG4gICAgc2NlbmFyaW86IHouZW51bShbXG4gICAgICAgICdhY3R1YWwnLFxuICAgICAgICAnY29uc2VydmF0aXZlJyxcbiAgICAgICAgJ3JlYWxpc3RpYycsXG4gICAgICAgICdhc3BpcmF0aW9uYWwnXG4gICAgXSksXG4gICAgcmV2ZW51ZTogei5udW1iZXIoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgZWJpdGRhOiB6Lm51bWJlcigpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICBuZXRJbmNvbWU6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgIGd1ZXN0czogei5udW1iZXIoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgc3RhZmZDb3N0OiB6Lm51bWJlcigpLm51bGxhYmxlKCkub3B0aW9uYWwoKVxufSk7XG5leHBvcnQgY29uc3QgU2hlZXRDb21wcmVoZW5zaW9uU2NoZW1hID0gei5vYmplY3Qoe1xuICAgIC8qKiBFeGFjdCB0YWIgbmFtZSBhcyBpdCBhcHBlYXJzIGluIHRoZSB3b3JrYm9vay4gKi8gdGFiTmFtZTogei5zdHJpbmcoKSxcbiAgICBjYXRlZ29yeTogei5lbnVtKFNIRUVUX0NBVEVHT1JJRVMpLFxuICAgIC8qKiBIdW1hbi1yZWFkYWJsZSB0aXRsZSBmb3IgdGhlIGR5bmFtaWMgcGFnZS4gKi8gdGl0bGU6IHouc3RyaW5nKCksXG4gICAgLyoqIE9uZS1wYXJhZ3JhcGggY29tcHJlaGVuc2lvbiBvZiB3aGF0IHRoaXMgc2hlZXQgY29udGFpbnMuICovIHN1bW1hcnk6IHouc3RyaW5nKCksXG4gICAgLyoqIERldGVjdGVkIHBlcmlvZCwgZS5nLiBcIkp1bmUgMjAyNlwiIFx1MjAxNCBudWxsIHdoZW4gbm90IGRldGVjdGFibGUuICovIHBlcmlvZEhpbnQ6IHouc3RyaW5nKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgIC8qKiBDb2x1bW4gaGVhZGVycyAoZmlyc3QgbWVhbmluZ2Z1bCByb3cpLiAqLyBjb2x1bW5zOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gICAgcm93Q291bnQ6IHoubnVtYmVyKCkuaW50KCkubm9ubmVnYXRpdmUoKS5vcHRpb25hbCgpLFxuICAgIC8qKiBQZXItcGVyaW9kIG1ldHJpY3MgZm91bmQgb24gVEhJUyBzaGVldC4gKi8gbWV0cmljczogei5hcnJheShNZXRyaWNTY2hlbWEpLm9wdGlvbmFsKClcbn0pO1xuZXhwb3J0IGNvbnN0IFdvcmtib29rQ29tcHJlaGVuc2lvblNjaGVtYSA9IHoub2JqZWN0KHtcbiAgICB3b3JrYm9vazogei5vYmplY3Qoe1xuICAgICAgICB0aXRsZTogei5zdHJpbmcoKSxcbiAgICAgICAgY29tcGFueTogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgICAgIHBlcmlvZDogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgICAgIGN1cnJlbmN5OiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgc3VtbWFyeTogei5zdHJpbmcoKVxuICAgIH0pLFxuICAgIHNoZWV0czogei5hcnJheShTaGVldENvbXByZWhlbnNpb25TY2hlbWEpLFxuICAgIC8qKlxuICAgKiBOb3JtYWxpemVkIGZpbmFuY2lhbCBwcm9qZWN0aW9ucyBjb25zb2xpZGF0ZWQgYWNyb3NzIEFMTCBzaGVldHMuXG4gICAqIFRoaXMgaXMgdGhlIHNvdXJjZSBmb3IgdGhlIGZpbmFuY2lhbF9wcm9qZWN0aW9ucyB0YWJsZS5cbiAgICovIHByb2plY3Rpb25zOiB6LmFycmF5KE1ldHJpY1NjaGVtYSksXG4gICAgLyoqXG4gICAqIFRlbXBsYXRlIHN1Z2dlc3Rpb24gZnJvbSB0aGUgYXZhaWxhYmxlIHRlbXBsYXRlIGNhdGFsb2dcbiAgICogKFRFTVBMQVRFX0NBVEFMT0cgaWRzLCBlLmcuIFwiZmluYW5jaWFsLWFuYWx5dGljc1wiLCBcInJlc3RhdXJhbnRcIikuXG4gICAqLyB0ZW1wbGF0ZTogei5vYmplY3Qoe1xuICAgICAgICBpZDogei5zdHJpbmcoKSxcbiAgICAgICAgY29uZmlkZW5jZTogei5udW1iZXIoKS5taW4oMCkubWF4KDEpLm9wdGlvbmFsKCksXG4gICAgICAgIHJlYXNvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpXG4gICAgfSkub3B0aW9uYWwoKVxufSk7XG4vLyBcdTI1MDBcdTI1MDAgVHlwZWQgZXJyb3JzIChtYXBwZWQgdG8gdGhlIHdvcmtmbG93IHJldHJ5IHBvbGljeSBieSB0aGUgY2FsbGVyKSBcdTI1MDBcbmV4cG9ydCBjbGFzcyBDb21wcmVoZW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgb3B0aW9ucyl7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnQ29tcHJlaGVuZEVycm9yJztcbiAgICB9XG59XG4vKiogSFRUUC1sZXZlbCBmYWlsdXJlIChub24tMnh4KS4gQ2FycmllcyBzdGF0dXMgKyBvcHRpb25hbCBSZXRyeS1BZnRlci4gKi8gZXhwb3J0IGNsYXNzIENvbXByZWhlbmRIdHRwRXJyb3IgZXh0ZW5kcyBDb21wcmVoZW5kRXJyb3Ige1xuICAgIHN0YXR1cztcbiAgICAvKiogUmV0cnktQWZ0ZXIgaGVhZGVyIHZhbHVlIGluIHNlY29uZHMsIHdoZW4gcHJlc2VudC4gKi8gcmV0cnlBZnRlclNlY29uZHM7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBtZXNzYWdlLCByZXRyeUFmdGVyU2Vjb25kcyA9IG51bGwpe1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0NvbXByZWhlbmRIdHRwRXJyb3InO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy5yZXRyeUFmdGVyU2Vjb25kcyA9IHJldHJ5QWZ0ZXJTZWNvbmRzO1xuICAgIH1cbn1cbi8qKiBSZXNwb25zZSBjb3VsZCBub3QgYmUgcGFyc2VkL3ZhbGlkYXRlZCAoSlNPTiBvciBab2QpLiAqLyBleHBvcnQgY2xhc3MgQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvciBleHRlbmRzIENvbXByZWhlbmRFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgb3B0aW9ucyl7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnQ29tcHJlaGVuZFZhbGlkYXRpb25FcnJvcic7XG4gICAgfVxufVxuLy8gXHUyNTAwXHUyNTAwIFByb21wdCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbmNvbnN0IFNZU1RFTV9QUk9NUFQgPSAnWW91IGFyZSBhIHByZWNpc2UgZmluYW5jaWFsIGFuYWx5c3QgYW5kIHdvcmtib29rIGludGVycHJldGVyLiAnICsgJ1lvdSByZWFkIHJhdyBzcHJlYWRzaGVldCBkdW1wcyBhbmQgcmV0dXJuIE9OTFkgdmFsaWQgSlNPTiBtYXRjaGluZyB0aGUgcmVxdWVzdGVkIHNjaGVtYSBleGFjdGx5LiAnICsgJ05ldmVyIGludmVudCBkYXRhIHRoYXQgaXMgbm90IHByZXNlbnQgaW4gdGhlIHNoZWV0cyBcdTIwMTQgbGVhdmUgbWV0cmljcyBudWxsIHdoZW4gYWJzZW50Lic7XG4vKiogUmVuZGVyIHRoZSBkZXRlcm1pbmlzdGljIEFOQUxZWkUgaGludHMgYXMgYSBwcm9tcHQgc2VjdGlvbi4gKi8gZnVuY3Rpb24gcmVuZGVySGludHNTZWN0aW9uKGhpbnRzKSB7XG4gICAgY29uc3Qgd2IgPSBoaW50cy53b3JrYm9vaztcbiAgICBjb25zdCBsaW5lcyA9IFtcbiAgICAgICAgYC0gV29ya2Jvb2s6ICR7d2Iuc2hlZXRDb3VudH0gc2hlZXQocyksICR7d2IudG90YWxSb3dzfSB0b3RhbCByb3dzLCBgICsgYCR7TWF0aC5yb3VuZCh3Yi5vdmVyYWxsTnVtZXJpY1JhdGlvICogMTAwKX0lIG51bWVyaWMgY2VsbHMuYFxuICAgIF07XG4gICAgaWYgKHdiLmN1cnJlbmN5R3Vlc3MpIGxpbmVzLnB1c2goYC0gQ3VycmVuY3kgZ3Vlc3M6ICR7d2IuY3VycmVuY3lHdWVzc31gKTtcbiAgICBpZiAod2IucGVyaW9kR3Vlc3MpIGxpbmVzLnB1c2goYC0gUGVyaW9kIGd1ZXNzOiAke3diLnBlcmlvZEd1ZXNzfWApO1xuICAgIGZvciAoY29uc3QgcyBvZiBoaW50cy5zaGVldHMpe1xuICAgICAgICBjb25zdCBwYXJ0cyA9IFtcbiAgICAgICAgICAgIGBcIiR7cy50YWJOYW1lfVwiOiAke3Mucm93Q291bnR9IHJvd3MgXHUwMEQ3ICR7cy5jb2xDb3VudH0gY29scywgYCArIGAke01hdGgucm91bmQocy5udW1lcmljUmF0aW8gKiAxMDApfSUgbnVtZXJpY2BcbiAgICAgICAgXTtcbiAgICAgICAgaWYgKHMuY3VycmVuY3lIaW50cy5sZW5ndGggPiAwKSBwYXJ0cy5wdXNoKGBjdXJyZW5jeSBbJHtzLmN1cnJlbmN5SGludHMuam9pbignLCcpfV1gKTtcbiAgICAgICAgaWYgKHMucGVyaW9kSGludHMubGVuZ3RoID4gMCkgcGFydHMucHVzaChgcGVyaW9kcyBbJHtzLnBlcmlvZEhpbnRzLmpvaW4oJywgJyl9XWApO1xuICAgICAgICBpZiAocy5sYWJlbEhpbnRzLmxlbmd0aCA+IDApIHBhcnRzLnB1c2goYGxhYmVscyBbJHtzLmxhYmVsSGludHMuam9pbignLCAnKX1dYCk7XG4gICAgICAgIGlmIChzLmxpa2VseUNhdGVnb3J5KSBwYXJ0cy5wdXNoKGBjYXRlZ29yeS1ndWVzcyAke3MubGlrZWx5Q2F0ZWdvcnl9YCk7XG4gICAgICAgIGxpbmVzLnB1c2goYCAgLSBTaGVldCAke3BhcnRzLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENvbXByZWhlbnNpb25Qcm9tcHQoYmxvY2tzLCBoaW50cykge1xuICAgIGNvbnN0IHNoZWV0QmxvY2tzID0gYmxvY2tzLm1hcCgoYik9PmA9PT09PSBTSEVFVDogJHtiLnRhYk5hbWV9ID09PT09XFxuJHtiLnRleHR9XFxuYCkuam9pbignXFxuJyk7XG4gICAgY29uc3QgaGludHNTZWN0aW9uID0gaGludHMgPyBgREVURVJNSU5JU1RJQyBQUkUtQU5BTFlTSVMgKGdlbmVyYXRlZCBieSBjb2RlIFx1MjAxNCB1c2UgYXMgc3Ryb25nIHByaW9ycywgYnV0IEFMV0FZUyB2ZXJpZnkgYWdhaW5zdCB0aGUgYWN0dWFsIGR1bXA7IGNhdGVnb3J5LWd1ZXNzIGlzIG5vdCBhdXRob3JpdGF0aXZlKTpcbiR7cmVuZGVySGludHNTZWN0aW9uKGhpbnRzKX1cblxuYCA6ICcnO1xuICAgIHJldHVybiBgQW5hbHl6ZSB0aGUgZm9sbG93aW5nIHdvcmtib29rLiBFdmVyeSBzaGVldCBvZiB0aGUgd29ya2Jvb2sgaXMgZHVtcGVkIGJlbG93IGFzIFwiUjxyb3c+OiA8Y2VsbHM+XCIuXG5cblRBU0tTOlxuMS4gVW5kZXJzdGFuZCB0aGUgd29ya2Jvb2sgYXMgYSB3aG9sZSAoY29tcGFueSwgcGVyaW9kLCBjdXJyZW5jeSwgcHVycG9zZSkuXG4yLiBGb3IgRUFDSCBzaGVldDogaWRlbnRpZnkgaXRzIGNhdGVnb3J5LCBhIGh1bWFuLXJlYWRhYmxlIHRpdGxlLCBhIHNob3J0IGNvbXByZWhlbnNpb24gc3VtbWFyeSwgZGV0ZWN0ZWQgcGVyaW9kIChlLmcuIFwiSnVuZSAyMDI2XCIpLCBjb2x1bW4gaGVhZGVycywgcm93IGNvdW50LCBhbmQgYW55IHBlci1wZXJpb2QgZmluYW5jaWFsIG1ldHJpY3MgKHJldmVudWUsIEVCSVREQSwgbmV0IGluY29tZSwgZ3Vlc3RzLCBzdGFmZiBjb3N0KSB5b3UgY2FuIHJlYWQgZnJvbSB0aGUgc2hlZXQuXG4zLiBDb25zb2xpZGF0ZSBBTEwgcGVyaW9kLWxldmVsIGZpbmFuY2lhbCBkYXRhIGFjcm9zcyB0aGUgd2hvbGUgd29ya2Jvb2sgaW50byBhIHNpbmdsZSBcInByb2plY3Rpb25zXCIgYXJyYXk6IG9uZSBlbnRyeSBwZXIgKHBlcmlvZCBZWVlZLU1NLCBkYXRhVHlwZSBhY3R1YWx8Zm9yZWNhc3QsIHNjZW5hcmlvIGFjdHVhbHxjb25zZXJ2YXRpdmV8cmVhbGlzdGljfGFzcGlyYXRpb25hbCkuIFVzZSB0aGUgYmVzdCBzb3VyY2UgZm9yIGVhY2ggcGVyaW9kIChlLmcuIGEgUCZMIHN0YXRlbWVudCBmb3IgYWN0dWFscywgYSBCRVAgdGFibGUgb3IgYnVkZ2V0IHNoZWV0IGZvciBmb3JlY2FzdHMpLiBBbm51YWwgdG90YWxzIHVzZSBZWVlZLTEyLiBPbmx5IGluY2x1ZGUgZW50cmllcyB3aGVyZSBhdCBsZWFzdCBvbmUgbWV0cmljIGlzIHByZXNlbnQuXG40LiBTdWdnZXN0IHRoZSBtb3N0IGFwcHJvcHJpYXRlIGFwcCB0ZW1wbGF0ZSBpZCBmcm9tIHRoaXMgYXZhaWxhYmxlIGNhdGFsb2c6IGZpbmFuY2lhbC1hbmFseXRpY3MsIHJlc3RhdXJhbnQsIGhvdGVsLCBlZHVjYXRpb24sIGVjb21tZXJjZS1yZXRhaWwsIGhlYWx0aGNhcmUsIG1hbnVmYWN0dXJpbmcsIHByb2Zlc3Npb25hbC1zZXJ2aWNlcywgcmVhbC1lc3RhdGUsIHN1cHBseS1jaGFpbiAoY29uZmlkZW5jZSAwLi4xKS5cblxuUlVMRVM6XG4tIHBlcmlvZHM6IFlZWVktTU0gb25seSAoZS5nLiBcIjIwMjYtMDZcIiwgXCIyMDI1LTEyXCIgZm9yIGFubnVhbCkuXG4tIGRhdGFUeXBlIFwiYWN0dWFsXCIgZm9yIHJlcG9ydGVkL2FjdHVhbCBmaWd1cmVzLCBcImZvcmVjYXN0XCIgZm9yIHByb2plY3Rpb25zL2J1ZGdldHMuXG4tIHNjZW5hcmlvOiBcImFjdHVhbFwiIGZvciBhY3R1YWxzOyBcImNvbnNlcnZhdGl2ZVwiIGZvciBiYXNlIGZvcmVjYXN0czsgXCJyZWFsaXN0aWNcIi9cImFzcGlyYXRpb25hbFwiIHdoZW4gdGhlIHNoZWV0IGV4cGxpY2l0bHkgbGFiZWxzIHNjZW5hcmlvcy5cbi0gQW1vdW50cyBhcmUgZnVsbCBJRFIgaW50ZWdlcnMgKG5vIFwiS1wiIHNob3J0aGFuZCkuIFJvdW5kIHRvIGludGVnZXJzLlxuLSBMZWF2ZSBhIG1ldHJpYyBudWxsIHdoZW4gdGhlIHNoZWV0IGRvZXMgbm90IGNvbnRhaW4gaXQgZm9yIHRoYXQgcGVyaW9kLlxuLSBjYXRlZ29yeSBtdXN0IGJlIG9uZSBvZjogJHtTSEVFVF9DQVRFR09SSUVTLmpvaW4oJywgJyl9LlxuXG4ke2hpbnRzU2VjdGlvbn1XT1JLQk9PSyBEVU1QOlxuJHtzaGVldEJsb2Nrc31gO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwQ29kZUZlbmNlKHJlcGx5KSB7XG4gICAgY29uc3QgbWF0Y2ggPSByZXBseS5tYXRjaCgvYGBgKD86anNvbik/XFxzKihbXFxzXFxTXSo/KWBgYC8pO1xuICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogcmVwbHk7XG59XG4vKipcbiAqIE9ORSBPcGVuQUkgY2FsbCB0byBjb21wcmVoZW5kIHRoZSB3b3JrYm9vay4gTm8gcmV0cnkgbG9vcCBcdTIwMTQgdGhlIGNhbGxlclxuICogKHN5bmMgcGlwZWxpbmUgb3Igd29ya2Zsb3cgc3RlcCkgb3ducyByZXRyeSBwb2xpY3kuXG4gKlxuICogVGhyb3dzOlxuICogICAtIENvbXByZWhlbmRIdHRwRXJyb3IgKHN0YXR1cyA0MjkgY2FycmllcyByZXRyeUFmdGVyU2Vjb25kcylcbiAqICAgLSBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yIChiYWQgSlNPTiAvIFpvZCByZWplY3Rpb24pXG4gKiAgIC0gQ29tcHJlaGVuZEVycm9yIChuZXR3b3JrIGV0Yy4gXHUyMDE0IHdyYXBwZWQgZnJvbSBmZXRjaCBmYWlsdXJlcylcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcHJlaGVuZE9uY2UoYmxvY2tzLCBvcHRpb25zKSB7XG4gICAgY29uc3QgeyBtb2RlbCA9ICdncHQtNG8nLCBoaW50cywgYXBpS2V5LCBiYXNlVXJsID0gJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEnIH0gPSBvcHRpb25zO1xuICAgIGlmIChibG9ja3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yKCdXb3JrYm9vayBjb250YWlucyBubyByZWFkYWJsZSBzaGVldHMnKTtcbiAgICB9XG4gICAgY29uc3QgcHJvbXB0ID0gYnVpbGRDb21wcmVoZW5zaW9uUHJvbXB0KGJsb2NrcywgaGludHMpO1xuICAgIGxldCByZXNwb25zZTtcbiAgICB0cnkge1xuICAgICAgICByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2Jhc2VVcmx9L2NoYXQvY29tcGxldGlvbnNgLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IFNZU1RFTV9QUk9NUFRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogcHJvbXB0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjIsXG4gICAgICAgICAgICAgICAgbWF4X3Rva2VuczogMTYzODQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VfZm9ybWF0OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdqc29uX29iamVjdCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhyb3cgbmV3IENvbXByZWhlbmRFcnJvcihgT3BlbkFJIHJlcXVlc3QgZmFpbGVkOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gLCB7XG4gICAgICAgICAgICBjYXVzZTogZXJyXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVyckJvZHkgPSBhd2FpdCByZXNwb25zZS50ZXh0KCkuY2F0Y2goKCk9PidVbmtub3duIGVycm9yJyk7XG4gICAgICAgIGxldCByZXRyeUFmdGVyU2Vjb25kcyA9IG51bGw7XG4gICAgICAgIGNvbnN0IHJldHJ5QWZ0ZXIgPSByZXNwb25zZS5oZWFkZXJzLmdldCgncmV0cnktYWZ0ZXInKTtcbiAgICAgICAgaWYgKHJldHJ5QWZ0ZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IE51bWJlcihyZXRyeUFmdGVyKTtcbiAgICAgICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUocGFyc2VkKSAmJiBwYXJzZWQgPj0gMCkgcmV0cnlBZnRlclNlY29uZHMgPSBwYXJzZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IENvbXByZWhlbmRIdHRwRXJyb3IocmVzcG9uc2Uuc3RhdHVzLCBgT3BlbkFJIEFQSSBlcnJvciAoJHtyZXNwb25zZS5zdGF0dXN9KTogJHtlcnJCb2R5fWAsIHJldHJ5QWZ0ZXJTZWNvbmRzKTtcbiAgICB9XG4gICAgbGV0IHJlc3VsdDtcbiAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yKGBPcGVuQUkgcmVzcG9uc2Ugd2FzIG5vdCB2YWxpZCBKU09OOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gKTtcbiAgICB9XG4gICAgY29uc3QgcmVwbHkgPSByZXN1bHQuY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50ID8/ICcnO1xuICAgIGxldCBwYXJzZWQ7XG4gICAgdHJ5IHtcbiAgICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShzdHJpcENvZGVGZW5jZShyZXBseSkpO1xuICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgdGhyb3cgbmV3IENvbXByZWhlbmRWYWxpZGF0aW9uRXJyb3IoJ0FJIHJlc3BvbnNlIHdhcyBub3QgdmFsaWQgSlNPTjogJyArIHJlcGx5LnNsaWNlKDAsIDUwMCkpO1xuICAgIH1cbiAgICBsZXQgY29tcHJlaGVuc2lvbjtcbiAgICB0cnkge1xuICAgICAgICBjb21wcmVoZW5zaW9uID0gV29ya2Jvb2tDb21wcmVoZW5zaW9uU2NoZW1hLnBhcnNlKHBhcnNlZCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0ID0gZXJyIGluc3RhbmNlb2Ygei5ab2RFcnJvciA/IGVyci5pc3N1ZXNbMF0gOiBudWxsO1xuICAgICAgICBjb25zdCBkZXRhaWwgPSBmaXJzdCA/IGAke2ZpcnN0LnBhdGguam9pbignLicpIHx8ICdyb290J306ICR7Zmlyc3QubWVzc2FnZX1gIDogU3RyaW5nKGVycik7XG4gICAgICAgIHRocm93IG5ldyBDb21wcmVoZW5kVmFsaWRhdGlvbkVycm9yKGBBSSByZXNwb25zZSBmYWlsZWQgc2NoZW1hIHZhbGlkYXRpb246ICR7ZGV0YWlsfWAsIHtcbiAgICAgICAgICAgIGNhdXNlOiBlcnJcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbXByZWhlbnNpb24sXG4gICAgICAgIG1vZGVsLFxuICAgICAgICBwcm9tcHRMZW5ndGg6IHByb21wdC5sZW5ndGhcbiAgICB9O1xufVxuIiwgIi8qKlxuICogUHJvZ3Jlc3MgZW1pc3Npb24gZm9yIHRoZSB3b3JrYm9vay1pbmdlc3Qgd29ya2Zsb3cuXG4gKlxuICogRm9sbG93cyB0aGUgU0RLIHN0cmVhbWluZyBwYXR0ZXJuOlxuICogICAtIHRoZSB3b3JrZmxvdyBmdW5jdGlvbiBjYWxscyBgZ2V0V3JpdGFibGUoKWAgYW5kIHBhc3NlcyB0aGUgc3RyZWFtIHRvIHN0ZXBzO1xuICogICAtIHN0ZXBzIG9idGFpbiBhIHdyaXRlciwgd3JpdGUgSlNPTiBjaHVua3MsIGFuZCByZWxlYXNlIHRoZSBsb2NrLlxuICpcbiAqIFRoZSB3cml0YWJsZSBzdHJlYW0gaXMgc2VyaWFsaXplZCBieSByZWZlcmVuY2UgYWNyb3NzIHN0ZXAgYm91bmRhcmllc1xuICogKHN0cmVhbVRvU3RyZWFtUmVmKSwgc28gd2UgYWx3YXlzIHBhc3MgdGhlIHJhdyBXcml0YWJsZVN0cmVhbSBcdTIwMTQgbmV2ZXIgYVxuICogd3JhcHBlciBvYmplY3QuXG4gKi8gLyoqXG4gKiBFbmNvZGUgYSBwcm9ncmVzcyBjaHVuayBhcyBhIEpTT04gc3RyaW5nIChjaHVua3MgYXJlIHdyaXR0ZW4gYXMgdGV4dCkuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUNodW5rKGNodW5rKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGNodW5rKTtcbn1cbi8qKlxuICogV3JpdGUgb25lIHByb2dyZXNzIGNodW5rLiBDYWxsIGZyb20gd2l0aGluIGEgc3RlcDpcbiAqXG4gKiAgIGFzeW5jIGZ1bmN0aW9uIGVtaXRQcm9ncmVzc1N0ZXAod3JpdGFibGU6IFdyaXRhYmxlU3RyZWFtLCBjaHVuazogUHJvZ3Jlc3NDaHVuaykge1xuICogICAgICd1c2Ugc3RlcCc7XG4gKiAgICAgYXdhaXQgd3JpdGVQcm9ncmVzc0NodW5rKHdyaXRhYmxlLCBjaHVuayk7XG4gKiAgIH1cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGVQcm9ncmVzc0NodW5rKHdyaXRhYmxlLCBjaHVuaykge1xuICAgIGNvbnN0IHdyaXRlciA9IHdyaXRhYmxlLmdldFdyaXRlcigpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHdyaXRlci53cml0ZShjaHVuayk7XG4gICAgfSBmaW5hbGx5e1xuICAgICAgICB3cml0ZXIucmVsZWFzZUxvY2soKTtcbiAgICB9XG59XG4vKiogQ2xvc2UgdGhlIHN0cmVhbSB0byBzaWduYWwgY29tcGxldGlvbi4gQ2FsbCBmcm9tIHdpdGhpbiBhIHN0ZXAuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbG9zZVByb2dyZXNzU3RyZWFtKHdyaXRhYmxlKSB7XG4gICAgYXdhaXQgd3JpdGFibGUuY2xvc2UoKTtcbn1cbiIsICIvKipcbiAqIExpZ2h0d2VpZ2h0IFBvc3RncmVTUUwgaGVscGVyIGZvciB3b3JrZmxvdyBzdGVwcyAocGcgZHJpdmVyLCBubyBQcmlzbWEpLlxuICpcbiAqIEVhY2ggc3RlcCBvcGVucyBpdHMgb3duIHNob3J0LWxpdmVkIGNvbm5lY3Rpb24gXHUyMDE0IGZpbmUgZm9yIHdvcmtmbG93IHN0ZXBzXG4gKiB3aGljaCBhcmUgYWxyZWFkeSBpbmRpdmlkdWFsbHkgaW52b2ljZWQgVmVyY2VsIEZ1bmN0aW9uIGludm9jYXRpb25zLlxuICogVGhlIHBvb2wvY29ubmVjdGlvbi1zdHJpbmcgY29tZXMgZnJvbSBgcHJvY2Vzcy5lbnYuUE9TVEdSRVNfVVJMYCAoc2V0IGJ5XG4gKiB0aGUgVmVyY2VsL05lb24gaW50ZWdyYXRpb24gYW5kIGF2YWlsYWJsZSBpbiBzdGVwIHJ1bnRpbWUpLlxuICovIGltcG9ydCB7IENsaWVudCB9IGZyb20gJ3BnJztcbi8qKlxuICogUnVuIGEgY2FsbGJhY2sgd2l0aCBhIHNob3J0LWxpdmVkIHBnIGNvbm5lY3Rpb24uXG4gKiBUaGUgY29ubmVjdGlvbiBzdHJpbmcgaXMgcmVzb2x2ZWQgYnkgdGhlIHJvdXRlIChyb290IGVudiBcdTIxOTIgdGVuYW50IGRiX3VybCBsb29rdXApXG4gKiBhbmQgcGFzc2VkIHRocm91Z2ggdGhlIHdvcmtmbG93IGlucHV0IFx1MjAxNCBuZXZlciByZWFkIGZyb20gcHJvY2Vzcy5lbnYgZGlyZWN0bHkuXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdpdGhQZ0NsaWVudChjb25uZWN0aW9uU3RyaW5nLCBmbikge1xuICAgIGlmICghY29ubmVjdGlvblN0cmluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGRhdGFiYXNlIGNvbm5lY3Rpb24gc3RyaW5nIHByb3ZpZGVkLicpO1xuICAgIH1cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xpZW50KHtcbiAgICAgICAgY29ubmVjdGlvblN0cmluZ1xuICAgIH0pO1xuICAgIGF3YWl0IGNsaWVudC5jb25uZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IGZuKGNsaWVudCk7XG4gICAgfSBmaW5hbGx5e1xuICAgICAgICBhd2FpdCBjbGllbnQuZW5kKCk7XG4gICAgfVxufVxuLyoqIFJ1biBhIHNpbmdsZSBTUUwgc3RhdGVtZW50IGFuZCByZXR1cm4gdGhlIHJvdyBjb3VudCBvciByZXN1bHQuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlT25lKGNsaWVudCwgc3FsLCBwYXJhbXMgPSBbXSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5xdWVyeShzcWwsIHBhcmFtcyk7XG4gICAgcmV0dXJuIHJlc3VsdC5yb3dDb3VudCA/PyAwO1xufVxuLyoqIFJ1biBTUUwgYW5kIHJldHVybiBhbGwgcm93cy4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHF1ZXJ5Um93cyhjbGllbnQsIHNxbCwgcGFyYW1zID0gW10pIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQucXVlcnkoc3FsLCBwYXJhbXMpO1xuICAgIHJldHVybiByZXN1bHQucm93cztcbn1cbiIsICIvKipcbiAqIEltcG9ydC10aW1lIEV4Y2VsIGZvcm11bGEgZXh0cmFjdGlvbiArIHJlZmVyZW5jZSBtYXBwaW5nLlxuICpcbiAqIFdoZW4gYSB3b3JrYm9vayBpcyBpbXBvcnRlZCB0aGUgcmF3IHhsc3ggaXMgY2FjaGVkIGluIHRoZSBkYXRhYmFzZVxuICogKGtub3dsZWRnZV9zbmlwcGV0cy53b3JrYm9va19kYXRhKSBhbmQgc2VydmVkIHRvIHRoZSBzaGVldCB2aWV3ZXIgYXMgSlNPTlxuICogcm93cyBrZXllZCBieSBjb2x1bW4gaGVhZGVyIHdpdGggYSBkZXRlY3RlZCBoZWFkZXIgcm93LiBUaGlzIG1vZHVsZSB3YWxrc1xuICogZXZlcnkgc2hlZXQgb2YgdGhlIGltcG9ydGVkIHdvcmtib29rIGFuZDpcbiAqXG4gKiAgIDEuIGZpbmRzIEFMTCBmb3JtdWxhIGNlbGxzIChcIj1TVU0oVjQ2OlY1NClcIiwgXCI9UEwhRDdcIiwgLi4uKSxcbiAqICAgMi4gbWFwcyBlYWNoIGZvcm11bGEgY2VsbCBpdHNlbGYgdG8gdGhlIERCLXNoZWV0IGNvb3JkaW5hdGVzIHRoZVxuICogICAgICBhcHBsaWNhdGlvbiBkaXNwbGF5cyAoY29sdW1uIGtleSArIGRhdGEtcm93IG9mZnNldCArIGFic29sdXRlIEExKSxcbiAqICAgMy4gbWFwcyBldmVyeSByZWZlcmVuY2UgaW5zaWRlIHRoZSBmb3JtdWxhIHRvIHRoZSBzYW1lIGNvb3JkaW5hdGVzXG4gKiAgICAgIChjcm9zcy1zaGVldCByZWZzIGluY2x1ZGVkKSwgc28gYSBmb3JtdWxhIGNhbiBiZSBjb21wdXRlZCBhZ2FpbnN0IHRoZVxuICogICAgICBEQi1zYXZlZCBzaGVldCBkYXRhIGV2ZW4gd2hlbiByYXcgZ3JpZCBwb3NpdGlvbnMgc2hpZnQgYmV0d2VlblxuICogICAgICBpbXBvcnRzLFxuICogICA0LiBjb21wdXRlcyBhIGJlc3QtZWZmb3J0IHZhbHVlIHdpdGggdGhlIHNhbWUgZXZhbHVhdG9yIHRoZSBBUEkgdXNlc1xuICogICAgICAoc3JjL2xpYi9leGNlbC1mb3JtdWxhLnRzKSBzbyBjb25zdW1lcnMgaGF2ZSBhbiBpbXBvcnQtdGltZSBzbmFwc2hvdC5cbiAqXG4gKiBUaGUgcmVzdWx0aW5nIFdvcmtib29rRm9ybXVsYU1hcCBpcyBwZXJzaXN0ZWQgYXMgYSBrbm93bGVkZ2Vfc25pcHBldHMgSlNPTlxuICogZW50cnkgKGtleSBcIndvcmtib29rX2Zvcm11bGFzXCIpIGJ5IGJvdGggaW1wb3J0IHBhdGhzIChzZWVkLXJ1bm5lciBhbmQgdGhlXG4gKiB3b3JrYm9vay1pbmdlc3Qgd29ya2Zsb3cpLlxuICovIGltcG9ydCB7IHV0aWxzIH0gZnJvbSAneGxzeCc7XG5pbXBvcnQgeyBldmFsdWF0ZUZvcm11bGEsIGNvbGxlY3RSZWZlcmVuY2VzIH0gZnJvbSAnQC9saWIvZXhjZWwtZm9ybXVsYSc7XG5pbXBvcnQgeyBmaW5kSGVhZGVyUm93LCBidWlsZENvbHVtbktleXMgfSBmcm9tICdAL2xpYi93b3JrYm9vay1tYXBwaW5nJztcbmZ1bmN0aW9uIGlzQ2VsbEFkZHJlc3Moa2V5KSB7XG4gICAgcmV0dXJuIC9eW0EtWl0rXFxkKyQvLnRlc3Qoa2V5KTtcbn1cbi8qKiBNYXAgb25lIHJhdyByZWZlcmVuY2UgdG9rZW4gdG8gREIgY29vcmRpbmF0ZXMgKHRhcmdldCBzaGVldCBhd2FyZSkuICovIGZ1bmN0aW9uIG1hcFJlZihyZWYsIGhlYWRlckNhY2hlLCB3YiwgZm9ybXVsYVNoZWV0KSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gcmVmLnNoZWV0ID8/IGZvcm11bGFTaGVldDtcbiAgICBjb25zdCB0YXJnZXRXcyA9IHdiLlNoZWV0c1t0YXJnZXRdO1xuICAgIC8vIFNhbWUtc2hlZXQgcmVmZXJlbmNlcyBrZWVwIHNoZWV0ICcnIChjb21wYWN0KTsgZXhwbGljaXQgb3RoZXJ3aXNlLlxuICAgIGNvbnN0IHNoZWV0ID0gcmVmLnNoZWV0ID8/ICcnO1xuICAgIGlmICghdGFyZ2V0V3MpIHtcbiAgICAgICAgLy8gU2hlZXQgdmFuaXNoZWQgXHUyMDE0IGtlZXAgdGhlIHJhdyBhZGRyZXNzIHNvIG5vdGhpbmcgaXMgbG9zdC5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNoZWV0LFxuICAgICAgICAgICAga2luZDogJ2NlbGwnLFxuICAgICAgICAgICAgYWJzQ2VsbDogcmVmLmFkZHJcbiAgICAgICAgfTtcbiAgICB9XG4gICAgbGV0IGhlYWRlciA9IGhlYWRlckNhY2hlLmdldCh0YXJnZXQpO1xuICAgIGlmICghaGVhZGVyKSB7XG4gICAgICAgIGhlYWRlciA9IGZpbmRIZWFkZXJSb3codGFyZ2V0V3MpO1xuICAgICAgICBoZWFkZXJDYWNoZS5zZXQodGFyZ2V0LCBoZWFkZXIpO1xuICAgIH1cbiAgICBjb25zdCBzdGFydCA9IG1hcENlbGxUb0RhdGFSZWYodGFyZ2V0V3MsIHJlZi5hZGRyLCBoZWFkZXIpO1xuICAgIGNvbnN0IG1hcHBlZCA9IHtcbiAgICAgICAgc2hlZXQsXG4gICAgICAgIGtpbmQ6IHJlZi5lbmQgPyAncmFuZ2UnIDogJ2NlbGwnLFxuICAgICAgICBjb2xLZXk6IHN0YXJ0LmNvbEtleSxcbiAgICAgICAgcmVsUm93OiBzdGFydC5yZWxSb3csXG4gICAgICAgIGFic0NlbGw6IHJlZi5hZGRyXG4gICAgfTtcbiAgICBpZiAocmVmLmVuZCkge1xuICAgICAgICBjb25zdCBlbmQgPSBtYXBDZWxsVG9EYXRhUmVmKHRhcmdldFdzLCByZWYuZW5kLCBoZWFkZXIpO1xuICAgICAgICBtYXBwZWQuZW5kID0ge1xuICAgICAgICAgICAgY29sS2V5OiBlbmQuY29sS2V5LFxuICAgICAgICAgICAgcmVsUm93OiBlbmQucmVsUm93LFxuICAgICAgICAgICAgYWJzQ2VsbDogcmVmLmVuZFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gbWFwcGVkO1xufVxuLyoqIENvbHVtbi1vbmx5IChBOkEpIG9yIGZ1bGwtY2VsbCBtYXBwaW5nIHRvIERCIGNvb3JkaW5hdGVzLiAqLyBmdW5jdGlvbiBtYXBDZWxsVG9EYXRhUmVmKHdzLCBhZGRyLCBoZWFkZXIpIHtcbiAgICBjb25zdCBjbGVhbiA9IGFkZHIucmVwbGFjZSgvXFwkL2csICcnKTtcbiAgICBpZiAoL15bQS1aYS16XSskLy50ZXN0KGNsZWFuKSkge1xuICAgICAgICAvLyBXaG9sZS1jb2x1bW4gcmVmZXJlbmNlOiBjb2x1bW4gbWFwcyB0byBpdHMgaGVhZGVyIGtleSwgcm93cyBhcmUgdW5ib3VuZGVkLlxuICAgICAgICBjb25zdCBjb2xJZHggPSB1dGlscy5kZWNvZGVfY29sKGNsZWFuKTtcbiAgICAgICAgY29uc3QgY29sdW1uS2V5cyA9IGJ1aWxkQ29sdW1uS2V5cyhoZWFkZXIuaGVhZGVycyk7XG4gICAgICAgIGNvbnN0IHJhd0hlYWRlciA9IGhlYWRlci5oZWFkZXJzW2NvbElkeF0gPz8gJyc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb2xLZXk6IHJhd0hlYWRlci50cmltKCkgPyBjb2x1bW5LZXlzW2NvbElkeF0gOiB1bmRlZmluZWQsXG4gICAgICAgICAgICByZWxSb3c6IHVuZGVmaW5lZFxuICAgICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBkZWNvZGVkID0gdXRpbHMuZGVjb2RlX2NlbGwoY2xlYW4pO1xuICAgIGNvbnN0IHJlbFJvdyA9IGRlY29kZWQuciAtIGhlYWRlci5oZWFkZXJSb3cgKyAxO1xuICAgIGNvbnN0IGNvbHVtbktleXMgPSBidWlsZENvbHVtbktleXMoaGVhZGVyLmhlYWRlcnMpO1xuICAgIGNvbnN0IHJhd0hlYWRlciA9IGhlYWRlci5oZWFkZXJzW2RlY29kZWQuY10gPz8gJyc7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29sS2V5OiByYXdIZWFkZXIudHJpbSgpID8gY29sdW1uS2V5c1tkZWNvZGVkLmNdIDogdW5kZWZpbmVkLFxuICAgICAgICByZWxSb3c6IHJlbFJvdyA+PSAxID8gcmVsUm93IDogdW5kZWZpbmVkXG4gICAgfTtcbn1cbi8qKlxuICogV2FsayBldmVyeSBzaGVldCBhbmQgYnVpbGQgdGhlIGZ1bGwgZm9ybXVsYSBpbnZlbnRvcnkgKyByZWZlcmVuY2UgbWFwcGluZy5cbiAqXG4gKiBFeHBlY3RzIGB3YmAgcGFyc2VkIHdpdGggYGNlbGxGb3JtdWxhOiB0cnVlYCAoU2hlZXRKUyBvbmx5IHBvcHVsYXRlc1xuICogYGNlbGwuZmAgd2hlbiBmb3JtdWxhIHN0cmluZ3MgYXJlIHJlYWQpLlxuICovIGV4cG9ydCBmdW5jdGlvbiBidWlsZFdvcmtib29rRm9ybXVsYU1hcCh3Yikge1xuICAgIGNvbnN0IG1hcCA9IHt9O1xuICAgIGNvbnN0IGhlYWRlckNhY2hlID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgdGFiTmFtZSBvZiB3Yi5TaGVldE5hbWVzKXtcbiAgICAgICAgY29uc3Qgd3MgPSB3Yi5TaGVldHNbdGFiTmFtZV07XG4gICAgICAgIGNvbnN0IGhlYWRlciA9IGZpbmRIZWFkZXJSb3cod3MpO1xuICAgICAgICBjb25zdCBjb2x1bW5LZXlzID0gYnVpbGRDb2x1bW5LZXlzKGhlYWRlci5oZWFkZXJzKTtcbiAgICAgICAgY29uc3QgaGVhZGVyQ2FjaGVLZXkgPSB0YWJOYW1lO1xuICAgICAgICBoZWFkZXJDYWNoZS5zZXQoaGVhZGVyQ2FjaGVLZXksIGhlYWRlcik7XG4gICAgICAgIGNvbnN0IGZvcm11bGFzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHdzKSl7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnIXJlZicgfHwga2V5ID09PSAnIW1hcmdpbnMnIHx8IGtleSA9PT0gJyFtZXJnZXMnIHx8IGtleSA9PT0gJyFjb2xzJyB8fCBrZXkgPT09ICchcm93cycpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKCFpc0NlbGxBZGRyZXNzKGtleSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgY2VsbCA9IHdzW2tleV07XG4gICAgICAgICAgICBpZiAoIWNlbGwgfHwgdHlwZW9mIGNlbGwuZiAhPT0gJ3N0cmluZycgfHwgY2VsbC5mLnRyaW0oKSA9PT0gJycpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgZm9ybXVsYSA9IGNlbGwuZi50cmltKCkuc3RhcnRzV2l0aCgnPScpID8gY2VsbC5mLnRyaW0oKSA6ICc9JyArIGNlbGwuZi50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBkZWNvZGVkID0gdXRpbHMuZGVjb2RlX2NlbGwoa2V5KTtcbiAgICAgICAgICAgIGNvbnN0IHJlbFJvdyA9IGRlY29kZWQuciAtIGhlYWRlci5oZWFkZXJSb3cgKyAxO1xuICAgICAgICAgICAgY29uc3QgcmF3SGVhZGVyID0gaGVhZGVyLmhlYWRlcnNbZGVjb2RlZC5jXSA/PyAnJztcbiAgICAgICAgICAgIGNvbnN0IHJlZnMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmF3UmVmIG9mIGNvbGxlY3RSZWZlcmVuY2VzKGZvcm11bGEpKXtcbiAgICAgICAgICAgICAgICByZWZzLnB1c2gobWFwUmVmKHJhd1JlZiwgaGVhZGVyQ2FjaGUsIHdiLCB0YWJOYW1lKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBldmFsdWF0ZUZvcm11bGEod2IsIHdzLCBmb3JtdWxhLCAwLCBrZXkpO1xuICAgICAgICAgICAgZm9ybXVsYXMucHVzaCh7XG4gICAgICAgICAgICAgICAgY2VsbDoga2V5LFxuICAgICAgICAgICAgICAgIGZvcm11bGEsXG4gICAgICAgICAgICAgICAgY29sS2V5OiByYXdIZWFkZXIudHJpbSgpID8gY29sdW1uS2V5c1tkZWNvZGVkLmNdIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHJlbFJvdzogcmVsUm93ID49IDEgPyByZWxSb3cgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgYWJzUm93OiBkZWNvZGVkLnIgKyAxLFxuICAgICAgICAgICAgICAgIGFic0NvbDogZGVjb2RlZC5jICsgMSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnVuZXZhbHVhYmxlID8gdW5kZWZpbmVkIDogcmVzdWx0LnZhbHVlLFxuICAgICAgICAgICAgICAgIHVuZXZhbHVhYmxlOiByZXN1bHQudW5ldmFsdWFibGUsXG4gICAgICAgICAgICAgICAgcmVmc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgbWFwW3RhYk5hbWVdID0ge1xuICAgICAgICAgICAgaGVhZGVyUm93OiBoZWFkZXIuaGVhZGVyUm93LFxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVyLmhlYWRlcnMsXG4gICAgICAgICAgICBjb2x1bW5LZXlzLFxuICAgICAgICAgICAgZm9ybXVsYXNcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbiIsICIvKipcbiAqIEV4Y2VsIGZvcm11bGEgc3VwcG9ydCBmb3IgdGhlIFNoZWV0IFZpZXdlci5cbiAqXG4gKiBUaGUgd29ya2Jvb2sgc3RvcmVzIGZvcm11bGFzIChlLmcuIFwiPVNVTShFMTA6RTExKVwiLCBcIj1JRihENj0wLFxcXCJcXFwiLChGNi1ENikvRDYpXCIsXG4gKiBcIj1QTCFEN1wiKSB3aXRoIEV4Y2VsJ3MgY2FjaGVkIGNhbGN1bGF0ZWQgdmFsdWVzLiBUaGlzIG1vZHVsZTpcbiAqICAtIGV2YWx1YXRlcyBhIGZvcm11bGEgYWdhaW5zdCB0aGUgd29ya2Jvb2sgKGJlc3QtZWZmb3J0KSBzbyB0aGUgRGF0YUdyaWQgY2FuXG4gKiAgICBzaG93IHRoZSBjYWxjdWxhdGVkIHJlc3VsdCBpbW1lZGlhdGVseSBhZnRlciB0aGUgdXNlciBhbWVuZHMgdGhlIGZvcm11bGEsXG4gKiAgLSBtYXJrcyBmb3JtdWxhcyB3ZSBjYW5ub3QgZXZhbHVhdGUgKGV4b3RpYyBmdW5jdGlvbnMsIGV0Yy4pIGFzXG4gKiAgICB1bmV2YWx1YWJsZSBcdTIwMTQgdGhlIGZvcm11bGEgaXMgc3RpbGwgc3RvcmVkIGluIHRoZSB3b3JrYm9vayBhbmQgRXhjZWxcbiAqICAgIHJlY2FsY3VsYXRlcyBpdCBvbiBvcGVuLlxuICpcbiAqIFN1cHBvcnRlZDogYXJpdGhtZXRpYyAoKyAtICogLyBeICUpLCBwYXJlbnMsIGNlbGwgcmVmcyAoQTEsICRBJDEpLFxuICogY3Jvc3Mtc2hlZXQgcmVmcyAoU2hlZXQhQTEsICdTaGVldCBOYW1lJyFBMSksIHJhbmdlcyAoQTE6QjUpIGFuZCB0aGVcbiAqIGZ1bmN0aW9ucyBTVU0sIEFWRVJBR0UsIE1JTiwgTUFYLCBDT1VOVCwgQ09VTlRBLCBQUk9EVUNULCBBQlMsIElOVCwgU1FSVCxcbiAqIFJPVU5ELCBST1VORFVQLCBST1VORERPV04sIE1PRCwgUE9XRVIsIElGLCBTVUJUT1RBTCAoY29kZSA5LzEwOSBvbmx5KSxcbiAqIEFORCwgT1IsIFRSSU0sIFBST1BFUiwgQ0hPT1NFLCBEQVRFLCBXRUVLREFZLCBDT0xVTU4sIFNVTUlGLCBWTE9PS1VQLFxuICogTUFUQ0gsIElOREVYLCBURVhULCBJRkVSUk9SLlxuICovIGltcG9ydCB7IHV0aWxzIH0gZnJvbSAneGxzeCc7XG5jb25zdCBNQVhfREVQVEggPSAxMjtcbmNvbnN0IE1BWF9SQU5HRV9DRUxMUyA9IDEwMF8wMDA7XG5mdW5jdGlvbiBpc1JhbmdlKHYpIHtcbiAgICByZXR1cm4gdHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYgIT09IG51bGwgJiYgJ19fcmFuZ2UnIGluIHY7XG59XG5mdW5jdGlvbiB0b2tlbml6ZShzcmMpIHtcbiAgICBjb25zdCB0b2tlbnMgPSBbXTtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IHByZXZUb2tlbjtcbiAgICB3aGlsZShpIDwgc3JjLmxlbmd0aCl7XG4gICAgICAgIGNvbnN0IGNoID0gc3JjW2ldO1xuICAgICAgICBpZiAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcgfHwgY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoL1tcXGQuXS8udGVzdChjaCkpIHtcbiAgICAgICAgICAgIGxldCBqID0gaTtcbiAgICAgICAgICAgIHdoaWxlKGogPCBzcmMubGVuZ3RoICYmIC9bXFxkLl0vLnRlc3Qoc3JjW2pdKSlqKys7XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ251bScsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHNyYy5zbGljZShpLCBqKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpID0gajtcbiAgICAgICAgICAgIHByZXZUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09ICdcIicpIHtcbiAgICAgICAgICAgIGxldCBqID0gaSArIDE7XG4gICAgICAgICAgICB3aGlsZShqIDwgc3JjLmxlbmd0aCAmJiBzcmNbal0gIT09ICdcIicpaisrO1xuICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdzdHInLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzcmMuc2xpY2UoaSArIDEsIGopXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGkgPSBqICsgMTtcbiAgICAgICAgICAgIHByZXZUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09IFwiJ1wiKSB7XG4gICAgICAgICAgICBsZXQgaiA9IGkgKyAxO1xuICAgICAgICAgICAgd2hpbGUoaiA8IHNyYy5sZW5ndGggJiYgc3JjW2pdICE9PSBcIidcIilqKys7XG4gICAgICAgICAgICBjb25zdCBzaGVldE5hbWUgPSBzcmMuc2xpY2UoaSArIDEsIGopO1xuICAgICAgICAgICAgaSA9IGogKyAxO1xuICAgICAgICAgICAgaWYgKHNyY1tpXSA9PT0gJyEnKSB7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc2hlZXQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc2hlZXROYW1lXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHByZXZUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBxdW90ZWQgdG9rZW4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoL1tBLVphLXpfJF0vLnRlc3QoY2gpKSB7XG4gICAgICAgICAgICBsZXQgaiA9IGk7XG4gICAgICAgICAgICB3aGlsZShqIDwgc3JjLmxlbmd0aCAmJiAvW0EtWmEtejAtOV8kLl0vLnRlc3Qoc3JjW2pdKSlqKys7XG4gICAgICAgICAgICBjb25zdCB3b3JkID0gc3JjLnNsaWNlKGksIGopO1xuICAgICAgICAgICAgaWYgKHNyY1tqXSA9PT0gJyEnKSB7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc2hlZXQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogd29yZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGkgPSBqICsgMTtcbiAgICAgICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKC9eXFwkP1tBLVphLXpdezEsM31cXCQ/XFxkKyQvLnRlc3Qod29yZCkpIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncmVmJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogd29yZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbHNlIGlmICgvXlxcJD9bQS1aYS16XXsxLDN9JC8udGVzdCh3b3JkKSAmJiAoc3JjW2pdID09PSAnOicgfHwgcHJldlRva2VuPy50eXBlID09PSAnb3AnICYmIHByZXZUb2tlbi52YWx1ZSA9PT0gJzonKSkge1xuICAgICAgICAgICAgICAgIC8vIFdob2xlLWNvbHVtbiByZWYgKEE6QSwgJEM6JEFHKSBcdTIwMTQgb25seSBtZWFuaW5nZnVsIGluc2lkZSBhIHJhbmdlXG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncmVmJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHdvcmRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod29yZCA9PT0gJ1RSVUUnKSB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2wnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnVFJVRSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxzZSBpZiAod29yZCA9PT0gJ0ZBTFNFJykgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ0ZBTFNFJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbHNlIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnaWRlbnQnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB3b3JkLnRvVXBwZXJDYXNlKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaSA9IGo7XG4gICAgICAgICAgICBwcmV2VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHdvID0gc3JjLnNsaWNlKGksIGkgKyAyKTtcbiAgICAgICAgaWYgKHR3byA9PT0gJzw9JyB8fCB0d28gPT09ICc+PScgfHwgdHdvID09PSAnPD4nKSB7XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ29wJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdHdvXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgIHByZXZUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoJystKi9ePTw+KCksJTonLmluY2x1ZGVzKGNoKSkge1xuICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdvcCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHByZXZUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuZXhwZWN0ZWQgY2hhcjogJyArIGNoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRva2Vucztcbn1cbmZ1bmN0aW9uIHRvTnVtKHYpIHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiAwOyAvLyBFeGNlbDogZW1wdHkgY2VsbCBpbiBudW1lcmljIGNvbnRleHQgPSAwXG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykgcmV0dXJuIHY7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHJldHVybiB2ID8gMSA6IDA7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb25zdCBuID0gTnVtYmVyKHYudHJpbSgpKTtcbiAgICAgICAgaWYgKGlzRmluaXRlKG4pKSByZXR1cm4gbjtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdub3QgbnVtZXJpYycpO1xufVxuZnVuY3Rpb24gdHJ1dGh5KHYpIHtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykgcmV0dXJuIHY7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykgcmV0dXJuIHYgIT09IDA7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJykgcmV0dXJuIHYudHJpbSgpICE9PSAnJztcbiAgICBpZiAoaXNSYW5nZSh2KSkgcmV0dXJuIHYudmFsdWVzLnNvbWUoKHgpPT50cnV0aHkoeCkpO1xuICAgIHJldHVybiBmYWxzZTtcbn1cbmNsYXNzIFBhcnNlciB7XG4gICAgd2I7XG4gICAgd3M7XG4gICAgZGVwdGg7XG4gICAgY3VycmVudENlbGxBZGRyO1xuICAgIHRva2VucztcbiAgICBwb3MgPSAwO1xuICAgIGNvbnN0cnVjdG9yKHdiLCB3cywgc3JjLCBkZXB0aCA9IDAsIGN1cnJlbnRDZWxsQWRkcil7XG4gICAgICAgIHRoaXMud2IgPSB3YjtcbiAgICAgICAgdGhpcy53cyA9IHdzO1xuICAgICAgICB0aGlzLmRlcHRoID0gZGVwdGg7XG4gICAgICAgIHRoaXMuY3VycmVudENlbGxBZGRyID0gY3VycmVudENlbGxBZGRyO1xuICAgICAgICB0aGlzLnRva2VucyA9IHRva2VuaXplKHNyYyk7XG4gICAgfVxuICAgIHBhcnNlRXhwcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VDb21wYXJpc29uKCk7XG4gICAgfVxuICAgIC8qKiBUcnVlIHdoZW4gdGhlIGZ1bGwgdG9rZW4gc3RyZWFtIGhhcyBiZWVuIGNvbnN1bWVkLiAqLyBmaW5pc2hlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9zID49IHRoaXMudG9rZW5zLmxlbmd0aDtcbiAgICB9XG4gICAgcGVlaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9rZW5zW3RoaXMucG9zXTtcbiAgICB9XG4gICAgbmV4dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9rZW5zW3RoaXMucG9zKytdO1xuICAgIH1cbiAgICBleHBlY3RPcChvcCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmICghdCB8fCB0LnR5cGUgIT09ICdvcCcgfHwgdC52YWx1ZSAhPT0gb3ApIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgJyArIG9wKTtcbiAgICB9XG4gICAgcGFyc2VDb21wYXJpc29uKCkge1xuICAgICAgICBsZXQgbGVmdCA9IHRoaXMucGFyc2VBZGRpdGl2ZSgpO1xuICAgICAgICB3aGlsZSh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIFtcbiAgICAgICAgICAgICc9JyxcbiAgICAgICAgICAgICc8PicsXG4gICAgICAgICAgICAnPCcsXG4gICAgICAgICAgICAnPicsXG4gICAgICAgICAgICAnPD0nLFxuICAgICAgICAgICAgJz49J1xuICAgICAgICBdLmluY2x1ZGVzKHRoaXMucGVlaygpLnZhbHVlKSl7XG4gICAgICAgICAgICBjb25zdCBvcCA9IHRoaXMubmV4dCgpLnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLnBhcnNlQWRkaXRpdmUoKTtcbiAgICAgICAgICAgIGxlZnQgPSBjb21wYXJlKG9wLCBsZWZ0LCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxlZnQ7XG4gICAgfVxuICAgIHBhcnNlQWRkaXRpdmUoKSB7XG4gICAgICAgIGxldCBsZWZ0ID0gdGhpcy5wYXJzZU11bHRpcGxpY2F0aXZlKCk7XG4gICAgICAgIHdoaWxlKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgKHRoaXMucGVlaygpLnZhbHVlID09PSAnKycgfHwgdGhpcy5wZWVrKCkudmFsdWUgPT09ICctJykpe1xuICAgICAgICAgICAgY29uc3Qgb3AgPSB0aGlzLm5leHQoKS52YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZU11bHRpcGxpY2F0aXZlKCk7XG4gICAgICAgICAgICBsZWZ0ID0gYXJpdGgob3AsIGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVmdDtcbiAgICB9XG4gICAgcGFyc2VNdWx0aXBsaWNhdGl2ZSgpIHtcbiAgICAgICAgbGV0IGxlZnQgPSB0aGlzLnBhcnNlVW5hcnkoKTtcbiAgICAgICAgd2hpbGUodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiAodGhpcy5wZWVrKCkudmFsdWUgPT09ICcqJyB8fCB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJy8nKSl7XG4gICAgICAgICAgICBjb25zdCBvcCA9IHRoaXMubmV4dCgpLnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLnBhcnNlVW5hcnkoKTtcbiAgICAgICAgICAgIGxlZnQgPSBhcml0aChvcCwgbGVmdCwgcmlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZWZ0O1xuICAgIH1cbiAgICBwYXJzZVVuYXJ5KCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIGlmICh0ICYmIHQudHlwZSA9PT0gJ29wJyAmJiAodC52YWx1ZSA9PT0gJy0nIHx8IHQudmFsdWUgPT09ICcrJykpIHtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMucGFyc2VVbmFyeSgpO1xuICAgICAgICAgICAgcmV0dXJuIHQudmFsdWUgPT09ICctJyA/IC10b051bSh2KSA6IHRvTnVtKHYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlUG9zdGZpeCgpO1xuICAgIH1cbiAgICBwYXJzZVBvc3RmaXgoKSB7XG4gICAgICAgIGxldCB2ID0gdGhpcy5wYXJzZUF0b20oKTtcbiAgICAgICAgd2hpbGUodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJyUnKXtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgdiA9IHRvTnVtKHYpIC8gMTAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbiAgICBwYXJzZUF0b20oKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLm5leHQoKTtcbiAgICAgICAgaWYgKCF0KSB0aHJvdyBuZXcgRXJyb3IoJ3VuZXhwZWN0ZWQgZW5kIG9mIGZvcm11bGEnKTtcbiAgICAgICAgaWYgKHQudHlwZSA9PT0gJ251bScpIHJldHVybiBOdW1iZXIodC52YWx1ZSk7XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdzdHInKSByZXR1cm4gdC52YWx1ZTtcbiAgICAgICAgaWYgKHQudHlwZSA9PT0gJ2Jvb2wnKSByZXR1cm4gdC52YWx1ZSA9PT0gJ1RSVUUnO1xuICAgICAgICBpZiAodC50eXBlID09PSAnc2hlZXQnKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIGlmICghcmVmIHx8IHJlZi50eXBlICE9PSAncmVmJykgdGhyb3cgbmV3IEVycm9yKCdleHBlY3RlZCBjZWxsIHJlZiBhZnRlciBzaGVldCcpO1xuICAgICAgICAgICAgY29uc3Qgc2hlZXRXcyA9IHRoaXMuZ2V0U2hlZXQodC52YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVJhbmdlT3JWYWx1ZShzaGVldFdzLCByZWYudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0LnR5cGUgPT09ICdyZWYnKSByZXR1cm4gdGhpcy5wYXJzZVJhbmdlT3JWYWx1ZSh0aGlzLndzLCB0LnZhbHVlKTtcbiAgICAgICAgaWYgKHQudHlwZSA9PT0gJ2lkZW50Jykge1xuICAgICAgICAgICAgaWYgKHRoaXMucGVlaygpICYmIHRoaXMucGVlaygpLnR5cGUgPT09ICdvcCcgJiYgdGhpcy5wZWVrKCkudmFsdWUgPT09ICcoJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxGdW5jdGlvbih0LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBpZGVudGlmaWVyOiAnICsgdC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQudHlwZSA9PT0gJ29wJyAmJiB0LnZhbHVlID09PSAnKCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLnBhcnNlRXhwcigpO1xuICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKScpO1xuICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmV4cGVjdGVkIHRva2VuOiAnICsgdC52YWx1ZSk7XG4gICAgfVxuICAgIHBhcnNlUmFuZ2VPclZhbHVlKHdzLCBhZGRyKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgaWYgKHQgJiYgdC50eXBlID09PSAnb3AnICYmIHQudmFsdWUgPT09ICc6Jykge1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICBjb25zdCBlbmQgPSB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIGlmICghZW5kIHx8IGVuZC50eXBlICE9PSAncmVmJykgdGhyb3cgbmV3IEVycm9yKCdiYWQgcmFuZ2UgZW5kJyk7XG4gICAgICAgICAgICBjb25zdCBjZWxscyA9IHRoaXMucmFuZ2VDZWxscyh3cywgYWRkciwgZW5kLnZhbHVlKTtcbiAgICAgICAgICAgIGNvbnN0IGMxID0gdXRpbHMuZGVjb2RlX2NlbGwoYWRkci5yZXBsYWNlKC9cXCQvZywgJycpKTtcbiAgICAgICAgICAgIGNvbnN0IGMyID0gdXRpbHMuZGVjb2RlX2NlbGwoZW5kLnZhbHVlLnJlcGxhY2UoL1xcJC9nLCAnJykpO1xuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBNYXRoLmFicyhjMi5jIC0gYzEuYykgKyAxO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBfX3JhbmdlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHZhbHVlczogY2VsbHMubWFwKChjKT0+dGhpcy5yZXNvbHZlQ2VsbChjLndzLCBjLmFkZHIsIHRoaXMuZGVwdGgpKSxcbiAgICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5yZXNvbHZlQ2VsbCh3cywgYWRkciwgdGhpcy5kZXB0aCk7XG4gICAgfVxuICAgIGdldFNoZWV0KG5hbWUpIHtcbiAgICAgICAgY29uc3Qgc2hlZXQgPSB0aGlzLndiLlNoZWV0c1tuYW1lXSA/PyB0aGlzLndiLlNoZWV0c1t0aGlzLndiLlNoZWV0TmFtZXMuZmluZCgobik9Pm4udG9Mb3dlckNhc2UoKSA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpKSA/PyAnJ107XG4gICAgICAgIGlmICghc2hlZXQpIHRocm93IG5ldyBFcnJvcignc2hlZXQgbm90IGZvdW5kOiAnICsgbmFtZSk7XG4gICAgICAgIHJldHVybiBzaGVldDtcbiAgICB9XG4gICAgcmFuZ2VDZWxscyh3cywgYSwgYikge1xuICAgICAgICBjb25zdCBjbGVhbkEgPSBhLnJlcGxhY2UoL1xcJC9nLCAnJyk7XG4gICAgICAgIGNvbnN0IGNsZWFuQiA9IGIucmVwbGFjZSgvXFwkL2csICcnKTtcbiAgICAgICAgY29uc3QgY29sT25seSA9IChzKT0+L15bQS1aYS16XSskLy50ZXN0KHMpO1xuICAgICAgICBsZXQgcjEsIHIyLCBjTWluLCBjTWF4O1xuICAgICAgICBpZiAoY29sT25seShjbGVhbkEpIHx8IGNvbE9ubHkoY2xlYW5CKSkge1xuICAgICAgICAgICAgLy8gV2hvbGUtY29sdW1uIHJhbmdlIChBOkEsICRDOiRBRyk6IGJvdW5kIHJvd3MgYnkgdGhlIHNoZWV0J3MgdXNlZCByYW5nZVxuICAgICAgICAgICAgY29uc3QgbWF4Um93ID0gd3NbJyFyZWYnXSA/IHV0aWxzLmRlY29kZV9yYW5nZSh3c1snIXJlZiddKS5lLnIgOiAwO1xuICAgICAgICAgICAgY29uc3QgY29sSW5kZXggPSAocyk9PntcbiAgICAgICAgICAgICAgICBsZXQgYyA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaCBvZiBzLnRvVXBwZXJDYXNlKCkpYyA9IGMgKiAyNiArIChjaC5jaGFyQ29kZUF0KDApIC0gNjQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjIC0gMTsgLy8gMC1iYXNlZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGNBID0gY29sT25seShjbGVhbkEpID8gY29sSW5kZXgoY2xlYW5BKSA6IHV0aWxzLmRlY29kZV9jZWxsKGNsZWFuQSkuYztcbiAgICAgICAgICAgIGNvbnN0IGNCID0gY29sT25seShjbGVhbkIpID8gY29sSW5kZXgoY2xlYW5CKSA6IHV0aWxzLmRlY29kZV9jZWxsKGNsZWFuQikuYztcbiAgICAgICAgICAgIGNNaW4gPSBNYXRoLm1pbihjQSwgY0IpO1xuICAgICAgICAgICAgY01heCA9IE1hdGgubWF4KGNBLCBjQik7XG4gICAgICAgICAgICByMSA9IDA7XG4gICAgICAgICAgICByMiA9IG1heFJvdztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGMxID0gdXRpbHMuZGVjb2RlX2NlbGwoY2xlYW5BKTtcbiAgICAgICAgICAgIGNvbnN0IGMyID0gdXRpbHMuZGVjb2RlX2NlbGwoY2xlYW5CKTtcbiAgICAgICAgICAgIHIxID0gTWF0aC5taW4oYzEuciwgYzIucik7XG4gICAgICAgICAgICByMiA9IE1hdGgubWF4KGMxLnIsIGMyLnIpO1xuICAgICAgICAgICAgY01pbiA9IE1hdGgubWluKGMxLmMsIGMyLmMpO1xuICAgICAgICAgICAgY01heCA9IE1hdGgubWF4KGMxLmMsIGMyLmMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvdW50ID0gKHIyIC0gcjEgKyAxKSAqIChjTWF4IC0gY01pbiArIDEpO1xuICAgICAgICBpZiAoY291bnQgPiBNQVhfUkFOR0VfQ0VMTFMpIHRocm93IG5ldyBFcnJvcigncmFuZ2UgdG9vIGxhcmdlJyk7XG4gICAgICAgIGNvbnN0IG91dCA9IFtdO1xuICAgICAgICBmb3IobGV0IHIgPSByMTsgciA8PSByMjsgcisrKXtcbiAgICAgICAgICAgIGZvcihsZXQgYyA9IGNNaW47IGMgPD0gY01heDsgYysrKXtcbiAgICAgICAgICAgICAgICBvdXQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHdzLFxuICAgICAgICAgICAgICAgICAgICBhZGRyOiB1dGlscy5lbmNvZGVfY2VsbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByLFxuICAgICAgICAgICAgICAgICAgICAgICAgY1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICAgIHJlc29sdmVDZWxsKHdzLCBhZGRyLCBkZXB0aCkge1xuICAgICAgICBpZiAoZGVwdGggPiBNQVhfREVQVEgpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIC8vIEFic29sdXRlIHJlZnMgKCRBJDcgLyAkQTcpIG11c3QgYmUgc3RyaXBwZWQgYmVmb3JlIGtleWluZyBpbnRvIHRoZSBzaGVldFxuICAgICAgICBjb25zdCBjbGVhbiA9IGFkZHIucmVwbGFjZSgvXFwkL2csICcnKTtcbiAgICAgICAgY29uc3QgY2VsbCA9IHdzW2NsZWFuXTtcbiAgICAgICAgLy8gRXhjZWwgY29lcmNlcyByZWZlcmVuY2VzIHRvIGVtcHR5L21pc3NpbmcgY2VsbHMgdG8gMCBpbiBudW1lcmljIGNvbnRleHRzXG4gICAgICAgIC8vIChoYW5kbGVkIGluIHRvTnVtKSBhbmQgdG8gXCJcIiBpbiB0ZXh0IGNvbnRleHRzIChoYW5kbGVkIGluIHRleHQgaGVscGVycykuXG4gICAgICAgIGlmICghY2VsbCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGNlbGwudiAhPT0gdW5kZWZpbmVkICYmIGNlbGwudiAhPT0gbnVsbCkgcmV0dXJuIGNlbGwudjtcbiAgICAgICAgaWYgKHR5cGVvZiBjZWxsLmYgPT09ICdzdHJpbmcnICYmIGNlbGwuZi50cmltKCkgIT09ICcnKSB7XG4gICAgICAgICAgICAvLyBPT1hNTCBzdG9yZXMgZm9ybXVsYXMgV0lUSE9VVCB0aGUgbGVhZGluZyAnPSc7IG5vcm1hbGl6ZSBiZWZvcmUgZXZhbHVhdGluZ1xuICAgICAgICAgICAgY29uc3QgZiA9IGNlbGwuZi50cmltKCkuc3RhcnRzV2l0aCgnPScpID8gY2VsbC5mLnRyaW0oKSA6ICc9JyArIGNlbGwuZi50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBzdWIgPSBldmFsdWF0ZUZvcm11bGEodGhpcy53Yiwgd3MsIGYsIGRlcHRoICsgMSwgY2xlYW4pO1xuICAgICAgICAgICAgLy8gQSByZWZlcmVuY2VkIGNlbGwgd2hvc2UgZm9ybXVsYSBmYWlscyBpcyBhIHJlYWwgZXJyb3IgaW4gRXhjZWwgdG9vIFx1MjAxNFxuICAgICAgICAgICAgLy8gcHJvcGFnYXRlIGl0IChzbyBJRkVSUk9SIGNhbiBjYXRjaCwgYW5kIHRvcC1sZXZlbCBzdGF5cyB1bmV2YWx1YWJsZSlcbiAgICAgICAgICAgIC8vIGluc3RlYWQgb2Ygc2lsZW50bHkgdHJlYXRpbmcgaXQgYXMgYW4gZW1wdHkgY2VsbC5cbiAgICAgICAgICAgIGlmIChzdWIudW5ldmFsdWFibGUpIHRocm93IG5ldyBFcnJvcigncmVmZXJlbmNlZCBjZWxsIGZvcm11bGEgdW5ldmFsdWFibGU6ICcgKyBjbGVhbik7XG4gICAgICAgICAgICByZXR1cm4gc3ViLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8qKlxuICAgKiBTa2lwIHRva2VucyBvZiBhbiBleHByZXNzaW9uIHdpdGhvdXQgZXZhbHVhdGluZyAodXNlZCBmb3IgbGF6eSBJRidzXG4gICAqIHVudGFrZW4gYnJhbmNoKS4gU3RvcHMgYmVmb3JlIHRoZSBuZXh0IHRvcC1sZXZlbCAnLCcgb3IgJyknLlxuICAgKi8gc2tpcEV4cHIoKSB7XG4gICAgICAgIGxldCBkZXB0aCA9IDA7XG4gICAgICAgIHdoaWxlKHRoaXMucG9zIDwgdGhpcy50b2tlbnMubGVuZ3RoKXtcbiAgICAgICAgICAgIGNvbnN0IHQgPSB0aGlzLnRva2Vuc1t0aGlzLnBvc107XG4gICAgICAgICAgICBpZiAodC50eXBlID09PSAnb3AnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHQudmFsdWUgPT09ICcoJykgZGVwdGgrKztcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0LnZhbHVlID09PSAnKScpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlcHRoID09PSAwKSByZXR1cm47IC8vIHN0b3BwZWQgYmVmb3JlICcpJ1xuICAgICAgICAgICAgICAgICAgICBkZXB0aC0tO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodC52YWx1ZSA9PT0gJywnICYmIGRlcHRoID09PSAwKSByZXR1cm47IC8vIHN0b3BwZWQgYmVmb3JlICcsJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wb3MrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYWxsRnVuY3Rpb24obmFtZSkge1xuICAgICAgICAvLyBJRiBpcyBsYXp5IGluIEV4Y2VsOiBvbmx5IHRoZSB0YWtlbiBicmFuY2ggaXMgZXZhbHVhdGVkIChhdm9pZHNcbiAgICAgICAgLy8gZGl2aWRlLWJ5LXplcm8gZXRjLiBvbiB0aGUgdW50YWtlbiBicmFuY2gpLlxuICAgICAgICBpZiAobmFtZSA9PT0gJ0lGJykge1xuICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKCcpO1xuICAgICAgICAgICAgY29uc3QgY29uZCA9IHRoaXMucGFyc2VFeHByKCk7XG4gICAgICAgICAgICB0aGlzLmV4cGVjdE9wKCcsJyk7XG4gICAgICAgICAgICBpZiAodHJ1dGh5KGNvbmQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMucGFyc2VFeHByKCk7XG4gICAgICAgICAgICAgICAgLy8gY29uc3VtZSBvcHRpb25hbCBlbHNlIGJyYW5jaCB3aXRob3V0IGV2YWx1YXRpbmcgaXRcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wZWVrKCkgJiYgdGhpcy5wZWVrKCkudHlwZSA9PT0gJ29wJyAmJiB0aGlzLnBlZWsoKS52YWx1ZSA9PT0gJywnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNraXBFeHByKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZXhwZWN0T3AoJyknKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvbmQgZmFsc3k6IHNraXAgdGhlIHRoZW4tYnJhbmNoLCBldmFsdWF0ZSB0aGUgZWxzZSBicmFuY2hcbiAgICAgICAgICAgIHRoaXMuc2tpcEV4cHIoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIHRoaXMucGVlaygpLnZhbHVlID09PSAnLCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdGhpcy5wYXJzZUV4cHIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGVjdE9wKCcpJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmV4cGVjdE9wKCcpJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSUZFUlJPUiBldmFsdWF0ZXMgaXRzIGZpcnN0IGFyZ3VtZW50IGluIFwic29mdFwiIG1vZGU6IGFueSBlcnJvci91bmV2YWx1YWJsZVxuICAgICAgICAvLyByZXN1bHQgZmFsbHMgYmFjayB0byB0aGUgc2Vjb25kIGFyZ3VtZW50IGluc3RlYWQgb2YgZmFpbGluZyB0aGUgZm9ybXVsYS5cbiAgICAgICAgaWYgKG5hbWUgPT09ICdJRkVSUk9SJykge1xuICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKCcpO1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRQb3MgPSB0aGlzLnBvcztcbiAgICAgICAgICAgIGxldCBmaXJzdDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZmlyc3QgPSB0aGlzLnBhcnNlRXhwcigpO1xuICAgICAgICAgICAgfSBjYXRjaCAge1xuICAgICAgICAgICAgICAgIGZpcnN0ID0gdW5kZWZpbmVkOyAvLyBldmFsdWF0aW9uIGVycm9yIC0+IHVzZSBmYWxsYmFja1xuICAgICAgICAgICAgICAgIC8vIE9uIGEgbmVzdGVkIGVycm9yIHRoZSBjdXJzb3IgaXMgbGVmdCBtaWQtZXhwcmVzc2lvbjsgc2VlayBmb3J3YXJkXG4gICAgICAgICAgICAgICAgLy8gZnJvbSB0aGUgc3RhcnQgb2YgdGhlIHZhbHVlIGFyZ3VtZW50IHRvIGl0cyB0b3AtbGV2ZWwgJywnICh0aGVcbiAgICAgICAgICAgICAgICAvLyBmYWxsYmFjayBzZXBhcmF0b3IpIG9yIHRvIHRoZSBjbG9zaW5nICcpJyBpZiB0aGVyZSBpcyBubyBmYWxsYmFjay5cbiAgICAgICAgICAgICAgICBsZXQgZGVwdGggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMucG9zID0gc3RhcnRQb3M7XG4gICAgICAgICAgICAgICAgd2hpbGUodGhpcy5wb3MgPCB0aGlzLnRva2Vucy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ID0gdGhpcy50b2tlbnNbdGhpcy5wb3NdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodC50eXBlID09PSAnb3AnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodC52YWx1ZSA9PT0gJygnKSBkZXB0aCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodC52YWx1ZSA9PT0gJyknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gLy8gbm8gZmFsbGJhY2s6IHN0b3AgYXQgSUZFUlJPUidzICcpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHQudmFsdWUgPT09ICcsJyAmJiBkZXB0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zKys7IC8vIGNvbnN1bWUgZmFsbGJhY2sgc2VwYXJhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDb21tYS1zZXBhcmF0ZWQgZmFsbGJhY2sgYXJndW1lbnRcbiAgICAgICAgICAgIGlmICh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIHRoaXMucGVlaygpLnZhbHVlID09PSAnLCcpIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgY29uc3QgZmFsbGJhY2sgPSB0aGlzLnBhcnNlRXhwcigpO1xuICAgICAgICAgICAgdGhpcy5leHBlY3RPcCgnKScpO1xuICAgICAgICAgICAgcmV0dXJuIGZpcnN0ID09PSB1bmRlZmluZWQgPyBmYWxsYmFjayA6IGZpcnN0O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXhwZWN0T3AoJygnKTtcbiAgICAgICAgY29uc3QgYXJncyA9IFtdO1xuICAgICAgICBpZiAoISh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIHRoaXMucGVlaygpLnZhbHVlID09PSAnKScpKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2godGhpcy5wYXJzZUV4cHIoKSk7XG4gICAgICAgICAgICB3aGlsZSh0aGlzLnBlZWsoKSAmJiB0aGlzLnBlZWsoKS50eXBlID09PSAnb3AnICYmIHRoaXMucGVlaygpLnZhbHVlID09PSAnLCcpe1xuICAgICAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh0aGlzLnBhcnNlRXhwcigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV4cGVjdE9wKCcpJyk7XG4gICAgICAgIHJldHVybiBhcHBseUZ1bmN0aW9uKG5hbWUsIGFyZ3MsIHRoaXMuY3VycmVudENlbGxBZGRyKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjb21wYXJlKG9wLCBhLCBiKSB7XG4gICAgaWYgKHR5cGVvZiBhID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgc3dpdGNoKG9wKXtcbiAgICAgICAgICAgIGNhc2UgJz0nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhID09PSBiO1xuICAgICAgICAgICAgY2FzZSAnPD4nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhICE9PSBiO1xuICAgICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPCBiO1xuICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPiBiO1xuICAgICAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhIDw9IGI7XG4gICAgICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPj0gYjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB4ID0gdG9OdW0oYSksIHkgPSB0b051bShiKTtcbiAgICBzd2l0Y2gob3Ape1xuICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgIHJldHVybiB4ID09PSB5O1xuICAgICAgICBjYXNlICc8Pic6XG4gICAgICAgICAgICByZXR1cm4geCAhPT0geTtcbiAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICByZXR1cm4geCA8IHk7XG4gICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgcmV0dXJuIHggPiB5O1xuICAgICAgICBjYXNlICc8PSc6XG4gICAgICAgICAgICByZXR1cm4geCA8PSB5O1xuICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgICByZXR1cm4geCA+PSB5O1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBjb21wYXJpc29uJyk7XG59XG5mdW5jdGlvbiBhcml0aChvcCwgYSwgYikge1xuICAgIGNvbnN0IHggPSB0b051bShhKSwgeSA9IHRvTnVtKGIpO1xuICAgIHN3aXRjaChvcCl7XG4gICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgcmV0dXJuIHggKyB5O1xuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgIHJldHVybiB4IC0geTtcbiAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICByZXR1cm4geCAqIHk7XG4gICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICh5ID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ2RpdmlkZSBieSB6ZXJvJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHggLyB5O1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdeJzpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnBvdyh4LCB5KTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgb3BlcmF0b3InKTtcbn1cbmZ1bmN0aW9uIGZsYXR0ZW4oYXJncykge1xuICAgIGNvbnN0IG91dCA9IFtdO1xuICAgIGZvciAoY29uc3QgYSBvZiBhcmdzKXtcbiAgICAgICAgaWYgKGlzUmFuZ2UoYSkpIG91dC5wdXNoKC4uLmEudmFsdWVzKTtcbiAgICAgICAgZWxzZSBvdXQucHVzaChhKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cbmZ1bmN0aW9uIG51bWJlcnMoYXJncykge1xuICAgIGNvbnN0IG91dCA9IFtdO1xuICAgIGZvciAoY29uc3QgdiBvZiBmbGF0dGVuKGFyZ3MpKXtcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykgb3V0LnB1c2godik7XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIG91dC5wdXNoKHYgPyAxIDogMCk7XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJyAmJiB2LnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBOdW1iZXIodi50cmltKCkpO1xuICAgICAgICAgICAgaWYgKGlzRmluaXRlKG4pKSBvdXQucHVzaChuKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufVxuZnVuY3Rpb24gdG9OdW1TYWZlKHYpIHtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInKSByZXR1cm4gdjtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdzdHJpbmcnICYmIHYudHJpbSgpICE9PSAnJykge1xuICAgICAgICBjb25zdCBuID0gTnVtYmVyKHYudHJpbSgpKTtcbiAgICAgICAgcmV0dXJuIGlzRmluaXRlKG4pID8gbiA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbi8qKiBDb2xsYXBzZSB3aGl0ZXNwYWNlICsgdHJpbSAoRXhjZWwgVFJJTSkuICovIGZ1bmN0aW9uIGV4Y2VsVHJpbSh2KSB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gU3RyaW5nKHYgPz8gJycpLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCk7XG59XG4vKiogRXhjZWwgUFJPUEVSOiB1cHBlcmNhc2UgZmlyc3QgbGV0dGVyIG9mIGV2ZXJ5IHdvcmQsIGxvd2VyY2FzZSB0aGUgcmVzdC4gKi8gZnVuY3Rpb24gZXhjZWxQcm9wZXIodikge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCkgcmV0dXJuIFwiXCI7IC8vIEV4Y2VsOiBlbXB0eSBjZWxsIGluIHRleHQgY29udGV4dFxuICAgIHJldHVybiBTdHJpbmcodiA/PyAnJykudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8oXnxbXkEtWmEtejAtOV0pKFthLXpdKS9nLCAoXywgcCwgYyk9PnAgKyBjLnRvVXBwZXJDYXNlKCkpO1xufVxuLyoqIEV4Y2VsIHNlcmlhbCBkYXRlIC0+IHsgeSwgbSwgZCB9IGluIHRoZSAxOTAwIGRhdGUgc3lzdGVtIChpbmNsLiBmYWtlIDE5MDAtMDItMjkpLiAqLyBmdW5jdGlvbiBzZXJpYWxUb0RhdGUoc2VyaWFsKSB7XG4gICAgLy8gU2VyaWFsIDEgPSAxOTAwLTAxLTAxOyBzZXJpYWwgNjAgPSBmYWtlIDE5MDAtMDItMjk7IHNlcmlhbCA+PSA2MSBvZmZzZXQgYnkgb25lIGRheS5cbiAgICBjb25zdCBkYXlzID0gTWF0aC5mbG9vcihzZXJpYWwpICsgKHNlcmlhbCA+PSA2MCA/IC0xIDogMCk7XG4gICAgLy8gRXhjZWwgc2VyaWFsIDEgPSAxOTAwLTAxLTAxID0gYmFzZSArIDEgZGF5OyBzZXJpYWwgPj0gNjEgbG9zZXMgdGhlIGZha2VcbiAgICAvLyAxOTAwLTAyLTI5IChzZXJpYWwgNjApLCBzbyByZWFsIGVsYXBzZWQgZGF5cyA9IHNlcmlhbCAtIDEuXG4gICAgY29uc3QgbXMgPSBkYXlzICogODY0MDAwMDA7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKDE4OTksIDExLCAzMSkgKyBtcyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeTogZGF0ZS5nZXRVVENGdWxsWWVhcigpLFxuICAgICAgICBtOiBkYXRlLmdldFVUQ01vbnRoKCkgKyAxLFxuICAgICAgICBkOiBkYXRlLmdldFVUQ0RhdGUoKVxuICAgIH07XG59XG4vKiogQnVpbGQgYW4gRXhjZWwgc2VyaWFsIGRhdGUgZnJvbSB5L20vZCAoMTkwMCBzeXN0ZW0sIGluY2wuIGZha2UgMTkwMC0wMi0yOSkuICovIGZ1bmN0aW9uIGRhdGVUb1NlcmlhbCh5LCBtLCBkKSB7XG4gICAgY29uc3QgZHQgPSBuZXcgRGF0ZShEYXRlLlVUQyh5LCBtIC0gMSwgZCkpO1xuICAgIGNvbnN0IHNlcmlhbCA9IE1hdGguZmxvb3IoKGR0LmdldFRpbWUoKSAtIERhdGUuVVRDKDE4OTksIDExLCAzMSkpIC8gODY0MDAwMDApO1xuICAgIHJldHVybiBzZXJpYWwgPj0gNjAgPyBzZXJpYWwgKyAxIDogc2VyaWFsOyAvLyBvZmZzZXQgZm9yIHRoZSBmYWtlIDE5MDAtMDItMjlcbn1cbi8qKiBNaW5pbWFsIEV4Y2VsIFRFWFQgZm9ybWF0czogbnVtZXJpYyAoMCwgMC4wMCwgIywjIzAsICMsIyMwLjAwLCAwJSwgMC4wJSkgYW5kIGRhdGUgdG9rZW5zICh5eXl5IHl5IG1tbW0gbW1tIG1tIG0gZGRkZCBkZGQgZGQgZCBoaCBoIG1tIG0gc3MgcykuIFRocm93cyBvbiB1bnJlY29nbml6ZWQgZm9ybWF0cy4gKi8gZnVuY3Rpb24gZXhjZWxUZXh0Rm9ybWF0KHYsIGZvcm1hdCkge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgY29uc3QgZm10ID0gU3RyaW5nKGZvcm1hdCk7XG4gICAgY29uc3QgbnVtID0gdHlwZW9mIHYgPT09ICdudW1iZXInID8gdiA6IE51bWJlcihTdHJpbmcodiA/PyAnJykudHJpbSgpKTtcbiAgICBjb25zdCBpc0RhdGVMaWtlID0gL1t5WWREaEhtTXNTXS8udGVzdChmbXQucmVwbGFjZSgvW15hLXpBLVpdL2csICcnKSkgJiYgL3l8ZHxofHMvaS50ZXN0KGZtdCk7XG4gICAgaWYgKGlzRGF0ZUxpa2UgJiYgaXNGaW5pdGUobnVtKSkge1xuICAgICAgICBjb25zdCB7IHksIG0sIGQgfSA9IHNlcmlhbFRvRGF0ZShudW0pO1xuICAgICAgICBjb25zdCBob3VycyA9IE1hdGguZmxvb3IobnVtICUgMSAqIDI0KTtcbiAgICAgICAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IoKG51bSAlIDEgKiAyNCAtIGhvdXJzKSAqIDYwKTtcbiAgICAgICAgY29uc3Qgc2Vjb25kcyA9IE1hdGgucm91bmQoKChudW0gJSAxICogMjQgLSBob3VycykgKiA2MCAtIG1pbnV0ZXMpICogNjApO1xuICAgICAgICBjb25zdCBkYXlOYW1lcyA9IFtcbiAgICAgICAgICAgICdTdW5kYXknLFxuICAgICAgICAgICAgJ01vbmRheScsXG4gICAgICAgICAgICAnVHVlc2RheScsXG4gICAgICAgICAgICAnV2VkbmVzZGF5JyxcbiAgICAgICAgICAgICdUaHVyc2RheScsXG4gICAgICAgICAgICAnRnJpZGF5JyxcbiAgICAgICAgICAgICdTYXR1cmRheSdcbiAgICAgICAgXTtcbiAgICAgICAgY29uc3QgbW9udGhOYW1lcyA9IFtcbiAgICAgICAgICAgICdKYW51YXJ5JyxcbiAgICAgICAgICAgICdGZWJydWFyeScsXG4gICAgICAgICAgICAnTWFyY2gnLFxuICAgICAgICAgICAgJ0FwcmlsJyxcbiAgICAgICAgICAgICdNYXknLFxuICAgICAgICAgICAgJ0p1bmUnLFxuICAgICAgICAgICAgJ0p1bHknLFxuICAgICAgICAgICAgJ0F1Z3VzdCcsXG4gICAgICAgICAgICAnU2VwdGVtYmVyJyxcbiAgICAgICAgICAgICdPY3RvYmVyJyxcbiAgICAgICAgICAgICdOb3ZlbWJlcicsXG4gICAgICAgICAgICAnRGVjZW1iZXInXG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IHdkID0gbmV3IERhdGUoRGF0ZS5VVEMoeSwgbSAtIDEsIGQpKS5nZXRVVENEYXkoKTtcbiAgICAgICAgY29uc3QgcmVwID0ge1xuICAgICAgICAgICAgJ3l5eXknOiBTdHJpbmcoeSksXG4gICAgICAgICAgICAneXknOiBTdHJpbmcoeSkuc2xpY2UoLTIpLFxuICAgICAgICAgICAgJ21tbW0nOiBtb250aE5hbWVzW20gLSAxXSxcbiAgICAgICAgICAgICdtbW0nOiBtb250aE5hbWVzW20gLSAxXS5zbGljZSgwLCAzKSxcbiAgICAgICAgICAgICdtb24nOiBTdHJpbmcobSkucGFkU3RhcnQoMiwgJzAnKSxcbiAgICAgICAgICAgICdtb24xJzogU3RyaW5nKG0pLFxuICAgICAgICAgICAgJ2RkZGQnOiBkYXlOYW1lc1t3ZF0sXG4gICAgICAgICAgICAnZGRkJzogZGF5TmFtZXNbd2RdLnNsaWNlKDAsIDMpLFxuICAgICAgICAgICAgJ2RkJzogU3RyaW5nKGQpLnBhZFN0YXJ0KDIsICcwJyksXG4gICAgICAgICAgICAnZCc6IFN0cmluZyhkKSxcbiAgICAgICAgICAgICdoaCc6IFN0cmluZyhob3VycykucGFkU3RhcnQoMiwgJzAnKSxcbiAgICAgICAgICAgICdoJzogU3RyaW5nKGhvdXJzKSxcbiAgICAgICAgICAgICdtaW4nOiBTdHJpbmcobWludXRlcykucGFkU3RhcnQoMiwgJzAnKSxcbiAgICAgICAgICAgICdtaW4xJzogU3RyaW5nKG1pbnV0ZXMpLFxuICAgICAgICAgICAgJ3NzJzogU3RyaW5nKHNlY29uZHMpLnBhZFN0YXJ0KDIsICcwJyksXG4gICAgICAgICAgICAncyc6IFN0cmluZyhzZWNvbmRzKVxuICAgICAgICB9O1xuICAgICAgICAvLyBUb2tlbi1iYXNlZCByZXBsYWNlLCBsb25nZXN0IG1hdGNoZXMgZmlyc3QuIEV4Y2VsIHJ1bGU6ICdtbScvJ20nIGFyZVxuICAgICAgICAvLyBNSU5VVEVTIHdoZW4gdGhlIGZvcm1hdCBjb250YWlucyBhbiBob3VyIHRva2VuLCBvdGhlcndpc2UgTU9OVEguXG4gICAgICAgIGNvbnN0IGhhc0hvdXIgPSAvaC9pLnRlc3QoZm10KTtcbiAgICAgICAgcmV0dXJuIGZtdC5yZXBsYWNlKC95eXl5fHl5fG1tbW18bW1tfGRkZGR8ZGRkfGhofHNzfGRkfG1tfGR8bXxofHMvZ2ksICh0b2spPT57XG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0b2sudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdtbScpIHJldHVybiBoYXNIb3VyID8gcmVwWydtaW4nXSA6IHJlcFsnbW9uJ107XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnbScpIHJldHVybiBoYXNIb3VyID8gcmVwWydtaW4xJ10gOiByZXBbJ21vbjEnXTtcbiAgICAgICAgICAgIHJldHVybiByZXBba2V5XSA/PyB0b2s7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIWlzRmluaXRlKG51bSkpIHJldHVybiBTdHJpbmcodiA/PyAnJyk7XG4gICAgY29uc3QgcGN0ID0gZm10LmluY2x1ZGVzKCclJyk7XG4gICAgY29uc3QgZGVjaW1hbHMgPSAoZm10Lm1hdGNoKC8wK1xcLigwKykvKSA/PyBbXSlbMV0/Lmxlbmd0aCA/PyAwO1xuICAgIGNvbnN0IGdyb3VwaW5nID0gZm10LmluY2x1ZGVzKCcsJyk7XG4gICAgY29uc3QgdmFsdWUgPSBwY3QgPyBudW0gKiAxMDAgOiBudW07XG4gICAgbGV0IG91dCA9IHZhbHVlLnRvRml4ZWQoZGVjaW1hbHMpO1xuICAgIGlmIChncm91cGluZykge1xuICAgICAgICBjb25zdCBbaW50LCBkZWNdID0gb3V0LnNwbGl0KCcuJyk7XG4gICAgICAgIG91dCA9IGludC5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnLCcpICsgKGRlYyA/ICcuJyArIGRlYyA6ICcnKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dCArIChwY3QgPyAnJScgOiAnJyk7XG59XG4vKiogRXhjZWwgbWF0Y2ggZm9yIFZMT09LVVAvTUFUQ0g6IGV4YWN0ICgwKSBvciBhcHByb3hpbWF0ZSAoMS8tMSkuIFJldHVybnMgMS1iYXNlZCBpbmRleCBvciAtMS4gKi8gZnVuY3Rpb24gZmluZE1hdGNoKGxvb2t1cCwgYXJyLCB0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT09IDApIHtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBjb25zdCBhID0gYXJyW2ldO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBsb29rdXAgPT09ICdudW1iZXInICYmIHR5cGVvZiBhID09PSAnbnVtYmVyJyAmJiBsb29rdXAgPT09IGEpIHJldHVybiBpICsgMTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbG9va3VwID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYSA9PT0gJ3N0cmluZycgJiYgZXhjZWxUcmltKGxvb2t1cCkudG9Mb3dlckNhc2UoKSA9PT0gZXhjZWxUcmltKGEpLnRvTG93ZXJDYXNlKCkpIHJldHVybiBpICsgMTtcbiAgICAgICAgICAgIGlmIChTdHJpbmcobG9va3VwKS50b0xvd2VyQ2FzZSgpID09PSBTdHJpbmcoYSA/PyAnJykudG9Mb3dlckNhc2UoKSkgcmV0dXJuIGkgKyAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgLy8gQXBwcm94aW1hdGU6IGFzc3VtZSBhc2NlbmRpbmcgKHR5cGUgMSkgLT4gbGFyZ2VzdCA8PSBsb29rdXA7IGRlc2NlbmRpbmcgKC0xKSAtPiBzbWFsbGVzdCA+PSBsb29rdXBcbiAgICBsZXQgYmVzdCA9IC0xO1xuICAgIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgY29uc3QgYSA9IHRvTnVtU2FmZShhcnJbaV0pO1xuICAgICAgICAgICAgY29uc3QgbCA9IHRvTnVtU2FmZShsb29rdXApO1xuICAgICAgICAgICAgaWYgKGEgIT09IHVuZGVmaW5lZCAmJiBsICE9PSB1bmRlZmluZWQgJiYgYSA8PSBsKSBiZXN0ID0gaSArIDE7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IC0xKSB7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgY29uc3QgYSA9IHRvTnVtU2FmZShhcnJbaV0pO1xuICAgICAgICAgICAgY29uc3QgbCA9IHRvTnVtU2FmZShsb29rdXApO1xuICAgICAgICAgICAgaWYgKGEgIT09IHVuZGVmaW5lZCAmJiBsICE9PSB1bmRlZmluZWQgJiYgYSA+PSBsICYmIChiZXN0ID09PSAtMSB8fCBhIDw9IHRvTnVtU2FmZShhcnJbYmVzdCAtIDFdKSkpIGJlc3QgPSBpICsgMTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmVzdDtcbn1cbi8qKiBFeGNlbCBTVU1JRiBjcml0ZXJpYTogbnVtYmVyLCBwbGFpbiB0ZXh0ICh3aWxkY2FyZHMgKiA/IHN1cHBvcnRlZCksIG9yIG9wZXJhdG9yLXByZWZpeGVkIChcIjw1XCIsIFwiPj0xMDBcIiwgXCI8PjBcIikuICovIGZ1bmN0aW9uIGNyaXRlcmlhTWF0Y2hlcyh2YWx1ZSwgY3JpdGVyaWEpIHtcbiAgICBjb25zdCB2ID0gdmFsdWUgPz8gJyc7XG4gICAgaWYgKHR5cGVvZiBjcml0ZXJpYSA9PT0gJ251bWJlcicpIHJldHVybiB0eXBlb2YgdiA9PT0gJ251bWJlcicgPyB2ID09PSBjcml0ZXJpYSA6IE51bWJlcihTdHJpbmcodikpID09PSBjcml0ZXJpYTtcbiAgICBjb25zdCBjcml0ID0gZXhjZWxUcmltKGNyaXRlcmlhKTtcbiAgICBpZiAoY3JpdCA9PT0gJycpIHJldHVybiB2ID09PSAnJyB8fCB2ID09PSBudWxsIHx8IHYgPT09IHVuZGVmaW5lZDtcbiAgICBjb25zdCBtID0gY3JpdC5tYXRjaCgvXig8PXw+PXw8Pnw8fD58PSk/KC4qKSQvcyk7XG4gICAgY29uc3Qgb3AgPSBtPy5bMV0gPz8gJz0nO1xuICAgIGxldCB0YXJnZXQgPSBtPy5bMl0gPz8gJyc7XG4gICAgY29uc3QgbnVtZXJpY1RhcmdldCA9IHRvTnVtU2FmZSh0YXJnZXQpO1xuICAgIGNvbnN0IG51bWVyaWNWYWwgPSB0b051bVNhZmUodik7XG4gICAgaWYgKG9wICE9PSAnPScgJiYgbnVtZXJpY1RhcmdldCAhPT0gdW5kZWZpbmVkICYmIG51bWVyaWNWYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzd2l0Y2gob3Ape1xuICAgICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bWVyaWNWYWwgPCBudW1lcmljVGFyZ2V0O1xuICAgICAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgICAgICAgIHJldHVybiBudW1lcmljVmFsIDw9IG51bWVyaWNUYXJnZXQ7XG4gICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtZXJpY1ZhbCA+IG51bWVyaWNUYXJnZXQ7XG4gICAgICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bWVyaWNWYWwgPj0gbnVtZXJpY1RhcmdldDtcbiAgICAgICAgICAgIGNhc2UgJzw+JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtZXJpY1ZhbCAhPT0gbnVtZXJpY1RhcmdldDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBXaWxkY2FyZCBtYXRjaGluZyBmb3IgZXF1YWxpdHkgKEV4Y2VsICogYW5kID8pXG4gICAgaWYgKHRhcmdldC5pbmNsdWRlcygnKicpIHx8IHRhcmdldC5pbmNsdWRlcygnPycpKSB7XG4gICAgICAgIGNvbnN0IHJ4ID0gJ14nICsgdGFyZ2V0LnJlcGxhY2UoL1suK14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpLnJlcGxhY2UoL1xcKi9nLCAnLionKS5yZXBsYWNlKC9cXD8vZywgJy4nKSArICckJztcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAocngsICdpJykudGVzdChTdHJpbmcodiA/PyAnJykpO1xuICAgIH1cbiAgICBjb25zdCBzMSA9IFN0cmluZyh2ID8/ICcnKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICBjb25zdCBzMiA9IHRhcmdldC50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAob3AgPT09ICc8PicpIHJldHVybiBzMSAhPT0gczI7XG4gICAgcmV0dXJuIHMxID09PSBzMjtcbn1cbmZ1bmN0aW9uIGFwcGx5RnVuY3Rpb24obmFtZSwgYXJncywgdGhpc0NlbGxBZGRyKSB7XG4gICAgY29uc3QgbnVtcyA9IG51bWJlcnMoYXJncyk7XG4gICAgY29uc3Qgc3VtID0gKCk9Pm51bXMucmVkdWNlKChzLCB2KT0+cyArIHYsIDApO1xuICAgIHN3aXRjaChuYW1lKXtcbiAgICAgICAgY2FzZSAnU1VNJzpcbiAgICAgICAgICAgIHJldHVybiBzdW0oKTtcbiAgICAgICAgY2FzZSAnQVZFUkFHRSc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1zLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdBVkVSQUdFIG9mIGVtcHR5Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1bSgpIC8gbnVtcy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ01JTic6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1zLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdNSU4gb2YgZW1wdHknKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5taW4oLi4ubnVtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ01BWCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1zLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdNQVggb2YgZW1wdHknKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5tYXgoLi4ubnVtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0NPVU5UJzpcbiAgICAgICAgICAgIHJldHVybiBudW1zLmxlbmd0aDtcbiAgICAgICAgY2FzZSAnQ09VTlRBJzpcbiAgICAgICAgICAgIHJldHVybiBmbGF0dGVuKGFyZ3MpLmZpbHRlcigodik9PnYgIT09ICcnICYmIHYgIT09IHVuZGVmaW5lZCAmJiB2ICE9PSBudWxsKS5sZW5ndGg7XG4gICAgICAgIGNhc2UgJ1BST0RVQ1QnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICghbnVtcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignUFJPRFVDVCBvZiBlbXB0eScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBudW1zLnJlZHVjZSgocCwgdik9PnAgKiB2LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnQUJTJzpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyh0b051bShhcmdzWzBdKSk7XG4gICAgICAgIGNhc2UgJ0lOVCc6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC50cnVuYyh0b051bShhcmdzWzBdKSk7XG4gICAgICAgIGNhc2UgJ1NRUlQnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB0b051bShhcmdzWzBdKTtcbiAgICAgICAgICAgICAgICBpZiAodiA8IDApIHRocm93IG5ldyBFcnJvcignU1FSVCBvZiBuZWdhdGl2ZScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodik7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1JPVU5EJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdG9OdW0oYXJnc1swXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGFyZ3MubGVuZ3RoID4gMSA/IHRvTnVtKGFyZ3NbMV0pIDogMDtcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gTWF0aC5wb3coMTAsIGQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHYgKiBmKSAvIGY7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1JPVU5EVVAnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB0b051bShhcmdzWzBdKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gYXJncy5sZW5ndGggPiAxID8gdG9OdW0oYXJnc1sxXSkgOiAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IGYgPSBNYXRoLnBvdygxMCwgZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc2lnbih2KSAqIE1hdGguY2VpbChNYXRoLmFicyh2KSAqIGYpIC8gZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnUk9VTkRET1dOJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdG9OdW0oYXJnc1swXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGFyZ3MubGVuZ3RoID4gMSA/IHRvTnVtKGFyZ3NbMV0pIDogMDtcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gTWF0aC5wb3coMTAsIGQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnNpZ24odikgKiBNYXRoLmZsb29yKE1hdGguYWJzKHYpICogZikgLyBmO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdNT0QnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGEgPSB0b051bShhcmdzWzBdKSwgYiA9IHRvTnVtKGFyZ3NbMV0pO1xuICAgICAgICAgICAgICAgIGlmIChiID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ01PRCBieSB6ZXJvJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgLSBiICogTWF0aC5mbG9vcihhIC8gYik7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1BPV0VSJzpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnBvdyh0b051bShhcmdzWzBdKSwgdG9OdW0oYXJnc1sxXSkpO1xuICAgICAgICBjYXNlICdJRic6XG4gICAgICAgICAgICByZXR1cm4gdHJ1dGh5KGFyZ3NbMF0pID8gYXJnc1sxXSA6IGFyZ3NbMl07XG4gICAgICAgIGNhc2UgJ1NVQlRPVEFMJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBDb2RlIGlzIGFyZyAwIFx1MjAxNCBtdXN0IE5PVCBiZSBpbmNsdWRlZCBpbiB0aGUgc3VtIChFeGNlbCBTVUJUT1RBTCg5LHJuZykgPT0gU1VNKHJuZykpXG4gICAgICAgICAgICAgICAgY29uc3QgY29kZSA9IE1hdGguYWJzKHRvTnVtKGFyZ3NbMF0pKTtcbiAgICAgICAgICAgICAgICBpZiAoY29kZSA9PT0gOSB8fCBjb2RlID09PSAxMDkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmFuZ2VOdW1zID0gbnVtYmVycyhhcmdzLnNsaWNlKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhbmdlTnVtcy5yZWR1Y2UoKHMsIHYpPT5zICsgdiwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU1VCVE9UQUwgY29kZSAnICsgY29kZSArICcgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdBTkQnOlxuICAgICAgICAgICAgcmV0dXJuIGZsYXR0ZW4oYXJncykuZXZlcnkoKGEpPT50cnV0aHkoYSkpO1xuICAgICAgICBjYXNlICdPUic6XG4gICAgICAgICAgICByZXR1cm4gZmxhdHRlbihhcmdzKS5zb21lKChhKT0+dHJ1dGh5KGEpKTtcbiAgICAgICAgY2FzZSAnVFJJTSc6XG4gICAgICAgICAgICByZXR1cm4gZXhjZWxUcmltKGFyZ3NbMF0pO1xuICAgICAgICBjYXNlICdQUk9QRVInOlxuICAgICAgICAgICAgcmV0dXJuIGV4Y2VsUHJvcGVyKGFyZ3NbMF0pO1xuICAgICAgICBjYXNlICdDSE9PU0UnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IE1hdGguZmxvb3IodG9OdW0oYXJnc1swXSkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBmbGF0dGVuKGFyZ3Muc2xpY2UoMSkpO1xuICAgICAgICAgICAgICAgIGlmIChpZHggPCAxIHx8IGlkeCA+IGNhbmRpZGF0ZXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0NIT09TRSBpbmRleCBvdXQgb2YgcmFuZ2UnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlc1tpZHggLSAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnREFURSc6XG4gICAgICAgICAgICByZXR1cm4gZGF0ZVRvU2VyaWFsKE1hdGguZmxvb3IodG9OdW0oYXJnc1swXSkpLCBNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMV0pKSwgTWF0aC5mbG9vcih0b051bShhcmdzWzJdKSkpO1xuICAgICAgICBjYXNlICdXRUVLREFZJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZXJpYWwgPSB0b051bShhcmdzWzBdKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gYXJncy5sZW5ndGggPiAxID8gTWF0aC5mbG9vcih0b051bShhcmdzWzFdKSkgOiAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgeSwgbSwgZCB9ID0gc2VyaWFsVG9EYXRlKHNlcmlhbCk7XG4gICAgICAgICAgICAgICAgY29uc3QganNEYXkgPSBuZXcgRGF0ZShEYXRlLlVUQyh5LCBtIC0gMSwgZCkpLmdldFVUQ0RheSgpOyAvLyAwPVN1bmRheVxuICAgICAgICAgICAgICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGpzRGF5ICsgMTsgLy8gMT1TdW5kYXkgLi4gNz1TYXR1cmRheVxuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ganNEYXkgPT09IDAgPyA3IDoganNEYXk7IC8vIDE9TW9uZGF5IC4uIDc9U3VuZGF5XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBqc0RheTsgLy8gMD1Nb25kYXkgLi4gNj1TdW5kYXlcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignV0VFS0RBWSByZXR1cm5fdHlwZSAnICsgdHlwZSArICcgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnQ09MVU1OJzpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWYgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIGlmIChyZWYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXNDZWxsQWRkcikgdGhyb3cgbmV3IEVycm9yKCdDT0xVTU4gd2l0aG91dCByZWYgbmVlZHMgY2VsbCBjb250ZXh0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlY29kZWQgPSB1dGlscy5kZWNvZGVfY2VsbCh0aGlzQ2VsbEFkZHIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2RlZC5jICsgMTsgLy8gMS1iYXNlZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlZiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbSA9IHJlZi5tYXRjaCgvW0EtWmEtel17MSwzfS8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW0pIHRocm93IG5ldyBFcnJvcignYmFkIENPTFVNTiByZWYnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sU3RyID0gbVswXS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29sID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaCBvZiBjb2xTdHIpY29sID0gY29sICogMjYgKyAoY2guY2hhckNvZGVBdCgwKSAtIDY0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDT0xVTU4gb2YgcmFuZ2Ugbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdTVU1JRic6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmFuZ2VBcmcgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyaXRlcmlhID0gYXJnc1sxXTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdW1BcmcgPSBhcmdzWzJdID8/IHJhbmdlQXJnO1xuICAgICAgICAgICAgICAgIGlmICghaXNSYW5nZShyYW5nZUFyZykgfHwgIWlzUmFuZ2Uoc3VtQXJnKSkgdGhyb3cgbmV3IEVycm9yKCdTVU1JRiBuZWVkcyByYW5nZXMnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSByYW5nZUFyZy52YWx1ZXM7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VtcyA9IHN1bUFyZy52YWx1ZXM7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3V0ID0gW107XG4gICAgICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjcml0ZXJpYU1hdGNoZXModmFsdWVzW2ldLCBjcml0ZXJpYSkpIG91dC5wdXNoKHRvTnVtU2FmZShzdW1zW2ldID8/IDApID8/IDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gb3V0LnJlZHVjZSgocywgdik9PnMgKyB2LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnVkxPT0tVUCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9va3VwID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICBjb25zdCB0YWJsZSA9IGFyZ3NbMV07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sSWR4ID0gTWF0aC5mbG9vcih0b051bShhcmdzWzJdKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYXBwcm94ID0gYXJncy5sZW5ndGggPiAzID8gdHJ1dGh5KGFyZ3NbM10pIDogdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzUmFuZ2UodGFibGUpIHx8IGNvbElkeCA8IDEgfHwgY29sSWR4ID4gdGFibGUud2lkdGgpIHRocm93IG5ldyBFcnJvcignVkxPT0tVUCBiYWQgdGFibGUvY29sJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RDb2wgPSBbXTtcbiAgICAgICAgICAgICAgICBjb25zdCByb3dzID0gW107XG4gICAgICAgICAgICAgICAgZm9yKGxldCByID0gMDsgciA8IE1hdGguZmxvb3IodGFibGUudmFsdWVzLmxlbmd0aCAvIHRhYmxlLndpZHRoKTsgcisrKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gdGFibGUudmFsdWVzLnNsaWNlKHIgKiB0YWJsZS53aWR0aCwgKHIgKyAxKSAqIHRhYmxlLndpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKHJvdyk7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0Q29sLnB1c2gocm93WzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgaGl0ID0gYXBwcm94ID8gZmluZE1hdGNoKGxvb2t1cCwgZmlyc3RDb2wsIDEpIDogZmluZE1hdGNoKGxvb2t1cCwgZmlyc3RDb2wsIDApO1xuICAgICAgICAgICAgICAgIGlmIChoaXQgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ1ZMT09LVVAgbm8gbWF0Y2gnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWwgPSByb3dzW2hpdCAtIDFdW2NvbElkeCAtIDFdO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgPT09IHVuZGVmaW5lZCA/ICcnIDogdmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdNQVRDSCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9va3VwID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICBjb25zdCBhcnIgPSBhcmdzWzFdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBhcmdzLmxlbmd0aCA+IDIgPyBNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMl0pKSA6IDE7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1JhbmdlKGFycikpIHRocm93IG5ldyBFcnJvcignTUFUQ0ggbmVlZHMgYSByYW5nZScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGhpdCA9IGZpbmRNYXRjaChsb29rdXAsIGFyci52YWx1ZXMsIHR5cGUpO1xuICAgICAgICAgICAgICAgIGlmIChoaXQgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ01BVENIIG5vIG1hdGNoJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhpdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnSU5ERVgnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyciA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93SWR4ID0gTWF0aC5mbG9vcih0b051bShhcmdzWzFdKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1JhbmdlKGFycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvd0lkeCA9PT0gMSA/IGFyciA6ICgoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJTkRFWCBvdXQgb2YgcmFuZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xJZHggPSBNYXRoLmZsb29yKHRvTnVtKGFyZ3NbMl0pKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zID0gKHJvd0lkeCAtIDEpICogYXJyLndpZHRoICsgKGNvbElkeCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocG9zIDwgMCB8fCBwb3MgPj0gYXJyLnZhbHVlcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignSU5ERVggb3V0IG9mIHJhbmdlJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnIudmFsdWVzW3Bvc10gPz8gMDsgLy8gRXhjZWwgY29lcmNlcyBlbXB0eSBjZWxscyB0byAwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IHJvd0lkeCAtIDE7XG4gICAgICAgICAgICAgICAgaWYgKHBvcyA8IDAgfHwgcG9zID49IGFyci52YWx1ZXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0lOREVYIG91dCBvZiByYW5nZScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhcnIudmFsdWVzW3Bvc10gPz8gMDsgLy8gRXhjZWwgY29lcmNlcyBlbXB0eSBjZWxscyB0byAwXG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1RFWFQnOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZtdCA9IFN0cmluZyhhcmdzWzFdID8/ICcnKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNSYW5nZShhcmdzWzBdKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBcnJheSBjb250ZXh0OiBhcHBseSBURVhUIGVsZW1lbnQtd2lzZSAoZS5nLiBidWlsZGluZyBhIGxvb2t1cCBhcnJheVxuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgTUFUQ0ggYWdhaW5zdCBhIGZvcm1hdHRlZCBoZWFkZXIgcm93KS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9fcmFuZ2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGFyZ3NbMF0udmFsdWVzLm1hcCgodik9PmV4Y2VsVGV4dEZvcm1hdCh2LCBmbXQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBhcmdzWzBdLndpZHRoXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBleGNlbFRleHRGb3JtYXQoYXJnc1swXSwgZm10KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgZnVuY3Rpb246ICcgKyBuYW1lKTtcbiAgICB9XG59XG4vKipcbiAqIFJlZ2V4IGZhbGxiYWNrIGZvciBmb3JtdWxhcyB0aGUgdG9rZW5pemVyIGNhbm5vdCBwYXJzZSAoZXhvdGljIGNoYXJzKS5cbiAqIEhhbmRsZXM6IEExLCAkQSQxLCBBMTpCNSwgQTpBLCBTaGVldCFENywgJ1NoZWV0IDEnIUQ3LlxuICovIGZ1bmN0aW9uIHJlZ2V4UmVmcyhzcmMpIHtcbiAgICBjb25zdCBvdXQgPSBbXTtcbiAgICBjb25zdCByZSA9IC8oPzooPzonKFteJ10rKSd8KFtBLVphLXpfXVtBLVphLXowLTlfLl0qKSkhPyk/XFwkPyhbQS1aYS16XXsxLDN9KShcXCQ/KShcXGQqKSg/OjpcXCQ/KFtBLVphLXpdezEsM30pKFxcJD8pKFxcZCopKT8vZztcbiAgICBsZXQgbTtcbiAgICB3aGlsZSgobSA9IHJlLmV4ZWMoc3JjKSkgIT09IG51bGwpe1xuICAgICAgICBjb25zdCBbLCBzaGVldCwgc2hlZXQyLCBjb2wsICwgZGlnaXRzLCBlbmRDb2wsICwgZW5kRGlnaXRzXSA9IG07XG4gICAgICAgIGNvbnN0IG5leHRDaCA9IHNyY1ttLmluZGV4ICsgbVswXS5sZW5ndGhdO1xuICAgICAgICAvLyBDb2x1bW4tb25seSB0b2tlbiAobm8gZGlnaXRzKTogb25seSBtZWFuaW5nZnVsIGFzIGEgcmFuZ2UgcGFydCAoQTpBKS5cbiAgICAgICAgLy8gQWxzbyBza2lwcyBpZGVudGlmaWVycyBsaWtlIFwiU1VNSUZTKFwiIChtYXRjaGVkIGFzIFwiU1VNXCIgKyBcIklGUyhcIikuXG4gICAgICAgIGlmIChkaWdpdHMgPT09ICcnKSB7XG4gICAgICAgICAgICBpZiAobmV4dENoICE9PSAnOicpIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKG5leHRDaCA9PT0gJygnKSB7XG4gICAgICAgICAgICBjb250aW51ZTsgLy8gZnVuY3Rpb24gbmFtZSBlbmRpbmcgaW4gZGlnaXRzIChMT0cxMCgsIExPRzIoLCAuLi4pXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYWRkciA9IGAke2NvbH0ke2RpZ2l0c31gO1xuICAgICAgICBpZiAoZW5kQ29sICYmIGVuZERpZ2l0cyAhPT0gJycpIG91dC5wdXNoKHtcbiAgICAgICAgICAgIHNoZWV0OiBzaGVldCA/PyBzaGVldDIsXG4gICAgICAgICAgICBhZGRyLFxuICAgICAgICAgICAgZW5kOiBgJHtlbmRDb2x9JHtlbmREaWdpdHN9YFxuICAgICAgICB9KTtcbiAgICAgICAgZWxzZSBpZiAoZW5kQ29sKSBvdXQucHVzaCh7XG4gICAgICAgICAgICBzaGVldDogc2hlZXQgPz8gc2hlZXQyLFxuICAgICAgICAgICAgYWRkcixcbiAgICAgICAgICAgIGVuZDogYCR7ZW5kQ29sfWBcbiAgICAgICAgfSk7XG4gICAgICAgIGVsc2Ugb3V0LnB1c2goe1xuICAgICAgICAgICAgc2hlZXQ6IHNoZWV0ID8/IHNoZWV0MixcbiAgICAgICAgICAgIGFkZHJcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENvbGxlY3QgZXZlcnkgY2VsbC9yYW5nZSByZWZlcmVuY2UgZnJvbSBhIGZvcm11bGEgc3RyaW5nLlxuICpcbiAqIFwiPVNVTShWNDY6VjU0KVwiICAgICAtPiBbeyBhZGRyOiBcIlY0NlwiLCBlbmQ6IFwiVjU0XCIgfV1cbiAqIFwiPVBMIUQ3ICsgUEwhRDhcIiAgICAtPiBbeyBzaGVldDogXCJQTFwiLCBhZGRyOiBcIkQ3XCIgfSwgeyBzaGVldDogXCJQTFwiLCBhZGRyOiBcIkQ4XCIgfV1cbiAqIFwiPVY0NioyXCIgICAgICAgICAgICAtPiBbeyBhZGRyOiBcIlY0NlwiIH1dXG4gKlxuICogVXNlcyB0aGUgc2FtZSB0b2tlbml6ZXIgYXMgZXZhbHVhdGVGb3JtdWxhIHNvIHJlZmVyZW5jZSBkZXRlY3Rpb24gc3RheXNcbiAqIGNvbnNpc3RlbnQgd2l0aCBldmFsdWF0aW9uOyBmYWxscyBiYWNrIHRvIGEgcmVnZXggcGFzcyB3aGVuIHRoZSB0b2tlbml6ZXJcbiAqIHJlamVjdHMgdGhlIHN0cmluZyAodW5ldmFsdWFibGUgZm9ybXVsYXMgc3RpbGwgZ2V0IHRoZWlyIHJlZnMgbWFwcGVkKS5cbiAqLyBleHBvcnQgZnVuY3Rpb24gY29sbGVjdFJlZmVyZW5jZXMoc3JjKSB7XG4gICAgY29uc3QgdGV4dCA9IHNyYy5yZXBsYWNlKC9ePS8sICcnKS50cmltKCk7XG4gICAgaWYgKCF0ZXh0KSByZXR1cm4gW107XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdG9rZW5zID0gdG9rZW5pemUodGV4dCk7XG4gICAgICAgIGNvbnN0IHJlZnMgPSBbXTtcbiAgICAgICAgbGV0IHBlbmRpbmdTaGVldDtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICB3aGlsZShpIDwgdG9rZW5zLmxlbmd0aCl7XG4gICAgICAgICAgICBjb25zdCB0ID0gdG9rZW5zW2ldO1xuICAgICAgICAgICAgaWYgKHQudHlwZSA9PT0gJ3NoZWV0Jykge1xuICAgICAgICAgICAgICAgIHBlbmRpbmdTaGVldCA9IHQudmFsdWU7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHQudHlwZSA9PT0gJ3JlZicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhZGRyID0gdC52YWx1ZS5yZXBsYWNlKC9cXCQvZywgJycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG54dCA9IHRva2Vuc1tpICsgMV07XG4gICAgICAgICAgICAgICAgLy8gRnVuY3Rpb24tbmFtZSBmYWxzZSBwb3NpdGl2ZXMgKExPRzEwKCwgTE9HMigpIGFyZSB0b2tlbml6ZWQgYXMgcmVmcylcbiAgICAgICAgICAgICAgICBpZiAobnh0ICYmIG54dC50eXBlID09PSAnb3AnICYmIG54dC52YWx1ZSA9PT0gJygnKSB7XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ1NoZWV0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG54dCAmJiBueHQudHlwZSA9PT0gJ29wJyAmJiBueHQudmFsdWUgPT09ICc6Jykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmRUb2sgPSB0b2tlbnNbaSArIDJdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW5kVG9rICYmIGVuZFRvay50eXBlID09PSAncmVmJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGVldDogcGVuZGluZ1NoZWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZHIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kOiBlbmRUb2sudmFsdWUucmVwbGFjZSgvXFwkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nU2hlZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWZzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBzaGVldDogcGVuZGluZ1NoZWV0LFxuICAgICAgICAgICAgICAgICAgICBhZGRyXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHBlbmRpbmdTaGVldCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVmcztcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIHJldHVybiByZWdleFJlZnModGV4dCk7XG4gICAgfVxufVxuLyoqXG4gKiBFdmFsdWF0ZSBhbiBFeGNlbCBmb3JtdWxhIHN0cmluZyBhZ2FpbnN0IHRoZSB3b3JrYm9vay5cbiAqIFJldHVybnMgeyB2YWx1ZSB9IGZvciBmb3JtdWxhcyB3ZSBjYW4gY29tcHV0ZSwgeyB1bmV2YWx1YWJsZTogdHJ1ZSB9IG90aGVyd2lzZS5cbiAqLyBleHBvcnQgZnVuY3Rpb24gZXZhbHVhdGVGb3JtdWxhKHdiLCB3cywgZm9ybXVsYSwgZGVwdGggPSAwLCBjdXJyZW50Q2VsbEFkZHIpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzcmMgPSBmb3JtdWxhLnRyaW0oKTtcbiAgICAgICAgaWYgKCFzcmMuc3RhcnRzV2l0aCgnPScpKSByZXR1cm4ge1xuICAgICAgICAgICAgdW5ldmFsdWFibGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcih3Yiwgd3MsIHNyYy5zbGljZSgxKSwgZGVwdGgsIGN1cnJlbnRDZWxsQWRkcik7XG4gICAgICAgIGNvbnN0IHYgPSBwYXJzZXIucGFyc2VFeHByKCk7XG4gICAgICAgIGlmICghcGFyc2VyLmZpbmlzaGVkKCkpIHJldHVybiB7XG4gICAgICAgICAgICB1bmV2YWx1YWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICAvLyBFeGNlbDogYSB0b3AtbGV2ZWwgcmVmZXJlbmNlIHRvIGFuIGVtcHR5L21pc3NpbmcgY2VsbCBldmFsdWF0ZXMgdG8gMC5cbiAgICAgICAgLy8gKFJlYWwgZmFpbHVyZXMgXHUyMDE0IHVuc3VwcG9ydGVkL2Vycm9yaW5nIHJlZmVyZW5jZWQgZm9ybXVsYXMgXHUyMDE0IHRocm93IGluXG4gICAgICAgIC8vIHJlc29sdmVDZWxsIGFuZCBhcmUgY2F1Z2h0IGFib3ZlLCBzbyB0aGV5IHN0aWxsIHJldHVybiB1bmV2YWx1YWJsZS4pXG4gICAgICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCkgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgdW5ldmFsdWFibGU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicgJiYgIWlzRmluaXRlKHYpKSByZXR1cm4ge1xuICAgICAgICAgICAgdW5ldmFsdWFibGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQm9vbGVhbnMgLT4gMS8wIGZvciBudW1lcmljIEV4Y2VsIGNlbGxzXG4gICAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHYgPyAxIDogMCxcbiAgICAgICAgICAgIHVuZXZhbHVhYmxlOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHYsXG4gICAgICAgICAgICB1bmV2YWx1YWJsZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9IGNhdGNoICB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB1bmV2YWx1YWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgIH1cbn1cbiIsICIvKipcbiAqIFdvcmtib29rIFx1MjE5MiBEQi1zaGVldCBtYXBwaW5nIGhlbHBlcnMuXG4gKlxuICogVGhlIHNoZWV0IHZpZXdlciBzZXJ2ZXMgd29ya2Jvb2sgZGF0YSBhcyBKU09OIHJvd3Mga2V5ZWQgYnkgY29sdW1uIGhlYWRlclxuICogKGRlZHVwbGljYXRlZCwgZS5nLiBcIlRvdGFsXCIsIFwiVG90YWxfMlwiKSwgd2l0aCBhbiBhdXRvbWF0aWNhbGx5IGRldGVjdGVkXG4gKiBoZWFkZXIgcm93LiBUaGVzZSBoZWxwZXJzIGFyZSB0aGUgc2luZ2xlIHNvdXJjZSBvZiB0cnV0aCBmb3IgdGhhdCBtYXBwaW5nIFx1MjAxNFxuICogdGhlIHNoZWV0LWRhdGEgQVBJIHJvdXRlLCB0aGUgZm9ybXVsYS1yZWZlcmVuY2UgbWFwcGVyLCBhbmQgdGhlIGltcG9ydC10aW1lXG4gKiBmb3JtdWxhIGV4dHJhY3Rpb24gYWxsIHVzZSB0aGVtIHNvIGEgZm9ybXVsYSBjZWxsIHJlZmVyZW5jZSAoXCJWNDZcIikgbWFwcyB0b1xuICogdGhlIGV4YWN0IHNhbWUgKGNvbHVtbiBrZXksIGRhdGEtcm93IG9mZnNldCkgdGhlIGFwcGxpY2F0aW9uIGRpc3BsYXlzLlxuICovIGltcG9ydCB7IHV0aWxzIH0gZnJvbSAneGxzeCc7XG4vLyBIZWFkZXIgcm93IGRldGVjdGlvbiAobWlycm9ycyB0aGUgbG9naWMgaGlzdG9yaWNhbGx5IGR1cGxpY2F0ZWQgaW4gdGhlXG4vLyBzaGVldC1kYXRhIHJvdXRlIGFuZCB3b3JrYm9vay1hbmFseXplci50cykuXG5jb25zdCBIRUFERVJfS0VZV09SRFMgPSAvZGVzY3JpcHRpb258YW1vdW50fHRvdGFsfGRhdGV8cmV2ZW51ZXxhY2NvdW50fG5hbWV8cXR5fHByaWNlfGNvc3R8c2FsZXN8aW5jb21lfGV4cGVuc2V8YmFsYW5jZXxudW1iZXJ8cmVmfHBlcmlvZHx0cmFuc2FjdGlvbnxkZWJpdHxjcmVkaXR8dW5pdHxyYXRlfHBjdHxtYXJnaW58YmlsbHN8Y292ZXJzfGd1ZXN0c3xzdGFmZnxjb2RlfHR5cGV8Y2F0ZWdvcnl8aXRlbXxwcm9kdWN0fHNlcnZpY2V8Y2hhcmdlfGRpc2NvdW50fHRheHxzdWJ0b3RhbHxuZXR8Z3Jvc3MvaTtcbmNvbnN0IFRJVExFX0tFWVdPUkRTID0gL14ocHJvZml0XFxzKiY/XFxzKmxvc3N8YmFsYW5jZVxccypzaGVldHx0cmlhbFxccypiYWxhbmNlfGdlbmVyYWxcXHMqbGVkZ2VyfHBlcmlvZGV8cGVyaW9kfG1vbnRoXFxzKm9mfGlucHV0XFxzKmRhdGF8YXV0b1xccypjYWxjKS9pO1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRIZWFkZXJSb3cod3MpIHtcbiAgICBjb25zdCByb3dzID0gdXRpbHMuc2hlZXRfdG9fanNvbih3cywge1xuICAgICAgICBoZWFkZXI6IDFcbiAgICB9KTtcbiAgICBjb25zdCBtYXhTY2FuID0gTWF0aC5taW4ocm93cy5sZW5ndGgsIDIwKTtcbiAgICBsZXQgYmVzdFJvdyA9IDA7XG4gICAgbGV0IGJlc3RTY29yZSA9IDA7XG4gICAgbGV0IGJlc3RIZWFkZXJzID0gW107XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IG1heFNjYW47IGkrKyl7XG4gICAgICAgIGNvbnN0IHJvdyA9IHJvd3NbaV0gPz8gW107XG4gICAgICAgIGNvbnN0IG5vbkVtcHR5ID0gcm93LmZpbHRlcigoYyk9PmMgIT09ICcnICYmIGMgIT09IHVuZGVmaW5lZCAmJiBjICE9PSBudWxsKTtcbiAgICAgICAgY29uc3Qgbm9uRW1wdHlDb3VudCA9IG5vbkVtcHR5Lmxlbmd0aDtcbiAgICAgICAgaWYgKG5vbkVtcHR5Q291bnQgPT09IDApIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmaXJzdENlbGwgPSBTdHJpbmcocm93WzBdID8/ICcnKS50cmltKCk7XG4gICAgICAgIGlmIChub25FbXB0eUNvdW50IDw9IDIgJiYgVElUTEVfS0VZV09SRFMudGVzdChmaXJzdENlbGwpKSBjb250aW51ZTtcbiAgICAgICAgbGV0IGhlYWRlckxpa2VDb3VudCA9IDA7XG4gICAgICAgIGxldCBudW1lcmljQ291bnQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2Ygbm9uRW1wdHkpe1xuICAgICAgICAgICAgY29uc3Qgc3RyID0gU3RyaW5nKGNlbGwpO1xuICAgICAgICAgICAgaWYgKHN0ciA9PT0gJyNOL0EnIHx8IHN0ciA9PT0gJyNSRUYhJyB8fCBzdHIgPT09ICcjVkFMVUUhJykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIoY2VsbCk7XG4gICAgICAgICAgICBjb25zdCBpc051bWVyaWMgPSB0eXBlb2YgY2VsbCA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGNlbGwgPT09ICdzdHJpbmcnICYmIC9eW1xcZCwuLV0rJC8udGVzdChzdHIudHJpbSgpKSAmJiBpc0Zpbml0ZShudW0pO1xuICAgICAgICAgICAgaWYgKGlzTnVtZXJpYyAmJiBNYXRoLmFicyhudW0pID4gMCkgbnVtZXJpY0NvdW50Kys7XG4gICAgICAgICAgICBlbHNlIGlmIChIRUFERVJfS0VZV09SRFMudGVzdChzdHIpKSBoZWFkZXJMaWtlQ291bnQrKztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0UmF0aW8gPSBub25FbXB0eUNvdW50ID4gMCA/IChub25FbXB0eUNvdW50IC0gbnVtZXJpY0NvdW50KSAvIG5vbkVtcHR5Q291bnQgOiAwO1xuICAgICAgICBjb25zdCBzY29yZSA9IGhlYWRlckxpa2VDb3VudCAqIDMgKyB0ZXh0UmF0aW8gKiAyICsgKG5vbkVtcHR5Q291bnQgPj0gMyA/IDEgOiAwKTtcbiAgICAgICAgaWYgKHNjb3JlID4gYmVzdFNjb3JlKSB7XG4gICAgICAgICAgICBiZXN0U2NvcmUgPSBzY29yZTtcbiAgICAgICAgICAgIGJlc3RSb3cgPSBpO1xuICAgICAgICAgICAgYmVzdEhlYWRlcnMgPSByb3cubWFwKChjKT0+U3RyaW5nKGMgPz8gJycpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYmVzdFNjb3JlIDwgMiAmJiByb3dzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgZmlyc3RSb3cgPSAocm93c1swXSA/PyBbXSkubWFwKChjKT0+U3RyaW5nKGMgPz8gJycpKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhlYWRlclJvdzogMSxcbiAgICAgICAgICAgIGhlYWRlcnM6IGZpcnN0Um93XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGhlYWRlclJvdzogYmVzdFJvdyArIDEsXG4gICAgICAgIGhlYWRlcnM6IGJlc3RIZWFkZXJzXG4gICAgfTtcbn1cbi8qKlxuICogQnVpbGQgdGhlIGRlZHVwbGljYXRlZCBEQiBjb2x1bW4ga2V5cyBmb3IgYSBoZWFkZXIgcm93IChcIlRvdGFsXCIsIFwiVG90YWxfMlwiLFxuICogZW1wdHkgaGVhZGVycyBiZWNvbWUgXCJfX2hpZGRlbl88bj5cIikgXHUyMDE0IGlkZW50aWNhbCB0byB0aGUgc2hlZXQtZGF0YSBHRVQuXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ29sdW1uS2V5cyhoZWFkZXJzKSB7XG4gICAgY29uc3Qgc2VlbiA9IG5ldyBNYXAoKTtcbiAgICBsZXQgZW1wdHlDb2xJZHggPSAwO1xuICAgIHJldHVybiBoZWFkZXJzLm1hcCgoaCk9PntcbiAgICAgICAgY29uc3QgdHJpbW1lZCA9IChoIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgaWYgKCF0cmltbWVkKSByZXR1cm4gYF9faGlkZGVuXyR7ZW1wdHlDb2xJZHgrK31gO1xuICAgICAgICBjb25zdCBjb3VudCA9IHNlZW4uZ2V0KHRyaW1tZWQpID8/IDA7XG4gICAgICAgIHNlZW4uc2V0KHRyaW1tZWQsIGNvdW50ICsgMSk7XG4gICAgICAgIHJldHVybiBjb3VudCA+IDAgPyBgJHt0cmltbWVkfV8ke2NvdW50fWAgOiB0cmltbWVkO1xuICAgIH0pO1xufVxuLyoqXG4gKiBNYXAgYW4gRXhjZWwgY2VsbCBhZGRyZXNzIHRvIHRoZSBEQi1zaGVldCBjb29yZGluYXRlcy5cbiAqXG4gKiBAcGFyYW0gd3MgICAgICAgICAgdGhlIHdvcmtzaGVldCB0aGUgYWRkcmVzcyBiZWxvbmdzIHRvXG4gKiBAcGFyYW0gYWRkciAgICAgICAgQTEtc3R5bGUgYWRkcmVzcyAoXCJWNDZcIiwgXCIkQSQxXCIpXG4gKiBAcGFyYW0gaGVhZGVySW5mbyAgcHJlY29tcHV0ZWQgZmluZEhlYWRlclJvdyh3cykgcmVzdWx0IChyZWNvbXB1dGVkIHBlciBjYWxsXG4gKiAgICAgICAgICAgICAgICAgICAgaWYgb21pdHRlZCBcdTIwMTQgcGFzcyBpdCB3aGVuIG1hcHBpbmcgbWFueSBjZWxscylcbiAqLyBleHBvcnQgZnVuY3Rpb24gbWFwQ2VsbFRvRGF0YSh3cywgYWRkciwgaGVhZGVySW5mbykge1xuICAgIGNvbnN0IGNsZWFuID0gYWRkci5yZXBsYWNlKC9cXCQvZywgJycpO1xuICAgIGNvbnN0IGRlY29kZWQgPSB1dGlscy5kZWNvZGVfY2VsbChjbGVhbik7XG4gICAgY29uc3QgaW5mbyA9IGhlYWRlckluZm8gPz8gZmluZEhlYWRlclJvdyh3cyk7XG4gICAgLy8gRmlyc3QgZGF0YSByb3cgPSBoZWFkZXJSb3cgKyAxIFx1MjE5MiAxLWJhc2VkIGRhdGEgb2Zmc2V0OyByb3dzIGF0L2Fib3ZlIHRoZVxuICAgIC8vIGhlYWRlciAodGl0bGUgcm93cykgZ2V0IHJlbFJvdyA8PSAwIC8gdW5kZWZpbmVkICh0aGV5IGFyZSBub3QgZGF0YSkuXG4gICAgY29uc3QgcmVsUm93ID0gZGVjb2RlZC5yIC0gaW5mby5oZWFkZXJSb3cgKyAxO1xuICAgIGNvbnN0IGNvbHVtbktleXMgPSBidWlsZENvbHVtbktleXMoaW5mby5oZWFkZXJzKTtcbiAgICBjb25zdCByYXdIZWFkZXIgPSBpbmZvLmhlYWRlcnNbZGVjb2RlZC5jXSA/PyAnJztcbiAgICBjb25zdCBjb2xLZXkgPSByYXdIZWFkZXIudHJpbSgpID8gY29sdW1uS2V5c1tkZWNvZGVkLmNdIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbEtleSxcbiAgICAgICAgcmVsUm93OiByZWxSb3cgPj0gMSA/IHJlbFJvdyA6IHVuZGVmaW5lZCxcbiAgICAgICAgYWJzUm93OiBkZWNvZGVkLnIgKyAxLFxuICAgICAgICBhYnNDb2w6IGRlY29kZWQuYyArIDFcbiAgICB9O1xufVxuIiwgIi8qKlxuICogU2VyZGUgY29tcGxpYW5jZSBjaGVja2VyIGZvciB3b3JrZmxvdyBjdXN0b20gY2xhc3Mgc2VyaWFsaXphdGlvbi5cbiAqXG4gKiBBbmFseXplcyBzb3VyY2UgY29kZSB0byBkZXRlcm1pbmUgaWYgY2xhc3NlcyB3aXRoIFdPUktGTE9XX1NFUklBTElaRSAvXG4gKiBXT1JLRkxPV19ERVNFUklBTElaRSBhcmUgY29ycmVjdGx5IHNldCB1cCBmb3IgdGhlIHdvcmtmbG93IHNhbmRib3guXG4gKlxuICogVXNlZCBieTpcbiAqIC0gQ0xJIGB2YWxpZGF0ZWAgY29tbWFuZFxuICogLSBDTEkgYHRyYW5zZm9ybWAgY29tbWFuZCAoLS1jaGVjay1zZXJkZSlcbiAqIC0gU1dDIHBsYXlncm91bmQgc2VyZGUgYW5hbHlzaXMgcGFuZWxcbiAqIC0gQnVpbGQtdGltZSB3YXJuaW5ncyBpbiBCYXNlQnVpbGRlclxuICovXG5cbmltcG9ydCBidWlsdGluTW9kdWxlcyBmcm9tICdidWlsdGluLW1vZHVsZXMnO1xuaW1wb3J0IHR5cGUgeyBXb3JrZmxvd01hbmlmZXN0IH0gZnJvbSAnLi9hcHBseS1zd2MtdHJhbnNmb3JtLmpzJztcblxuLy8gQnVpbGQgYSByZWdleCB0aGF0IG1hdGNoZXMgTm9kZS5qcyBidWlsdC1pbiBtb2R1bGUgaW1wb3J0cyBpbiB0cmFuc2Zvcm1lZCBjb2RlLlxuLy8gSGFuZGxlcyBib3RoIEVTTSAoYGZyb20gJ2ZzJ2AsIGBmcm9tICdub2RlOmZzJ2ApIGFuZCBDSlMgKGByZXF1aXJlKCdmcycpYClcbmNvbnN0IG5vZGVCdWlsdGlucyA9IGJ1aWx0aW5Nb2R1bGVzLmpvaW4oJ3wnKTtcblxuLy8gUmVnZXggdG8gZXh0cmFjdCBzcGVjaWZpYyBtb2R1bGUgbmFtZXMgZnJvbSBpbXBvcnQvcmVxdWlyZSBzdGF0ZW1lbnRzXG5jb25zdCBub2RlSW1wb3J0RXh0cmFjdFJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgYCg/OmZyb21cXFxccytbJ1wiXSg/Om5vZGU6KT8oKD86JHtub2RlQnVpbHRpbnN9KSg/Oi9bXidcIl0qKT8pWydcIl1gICtcbiAgICBgfHJlcXVpcmVcXFxccypcXFxcKFxcXFxzKlsnXCJdKD86bm9kZTopPygoPzoke25vZGVCdWlsdGluc30pKD86L1teJ1wiXSopPylbJ1wiXVxcXFxzKlxcXFwpKWAsXG4gICdnJ1xuKTtcblxuLy8gUmVnZXggdG8gZGV0ZWN0IGNsYXNzIHJlZ2lzdHJhdGlvbiBJSUZFcyBnZW5lcmF0ZWQgYnkgdGhlIFNXQyBwbHVnaW5cbmNvbnN0IHJlZ2lzdHJhdGlvbklpZmVSZWdleCA9XG4gIC9TeW1ib2xcXC5mb3JcXHMqXFwoXFxzKltcIiddd29ya2Zsb3ctY2xhc3MtcmVnaXN0cnlbXCInXVxccypcXCkvO1xuXG4vKipcbiAqIFJlc3VsdCBvZiBjaGVja2luZyBhIHNpbmdsZSBjbGFzcyBmb3Igc2VyZGUgY29tcGxpYW5jZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJkZUNsYXNzQ2hlY2tSZXN1bHQge1xuICAvKiogVGhlIGNsYXNzIG5hbWUgYXMgZGV0ZWN0ZWQgaW4gdGhlIHNvdXJjZSAqL1xuICBjbGFzc05hbWU6IHN0cmluZztcbiAgLyoqIFRoZSBjbGFzc0lkIGFzc2lnbmVkIGJ5IHRoZSBTV0MgcGx1Z2luIChmcm9tIHRoZSBtYW5pZmVzdCkgKi9cbiAgY2xhc3NJZDogc3RyaW5nO1xuICAvKiogV2hldGhlciB0aGUgU1dDIHBsdWdpbiBkZXRlY3RlZCBzZXJkZSBzeW1ib2xzIG9uIHRoaXMgY2xhc3MgKi9cbiAgZGV0ZWN0ZWQ6IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIGEgcmVnaXN0cmF0aW9uIElJRkUgd2FzIGdlbmVyYXRlZCBpbiB0aGUgb3V0cHV0ICovXG4gIHJlZ2lzdGVyZWQ6IGJvb2xlYW47XG4gIC8qKlxuICAgKiBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBpbXBvcnRzIHJlbWFpbmluZyBpbiB0aGUgd29ya2Zsb3ctbW9kZSBvdXRwdXQuXG4gICAqIElmIG5vbi1lbXB0eSwgdGhlIGNsYXNzIGlzIE5PVCB3b3JrZmxvdy1zYW5kYm94IGNvbXBsaWFudC5cbiAgICovXG4gIG5vZGVJbXBvcnRzOiBzdHJpbmdbXTtcbiAgLyoqIFdoZXRoZXIgdGhlIGNsYXNzIHBhc3NlcyBhbGwgY29tcGxpYW5jZSBjaGVja3MgKi9cbiAgY29tcGxpYW50OiBib29sZWFuO1xuICAvKiogSHVtYW4tcmVhZGFibGUgZGVzY3JpcHRpb25zIG9mIGFueSBpc3N1ZXMgZm91bmQgKi9cbiAgaXNzdWVzOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBGdWxsIHJlc3VsdCBvZiBzZXJkZSBjb21wbGlhbmNlIGFuYWx5c2lzIGZvciBhIHNvdXJjZSBmaWxlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlcmRlQ2hlY2tSZXN1bHQge1xuICAvKiogUGVyLWNsYXNzIGFuYWx5c2lzIHJlc3VsdHMgKi9cbiAgY2xhc3NlczogU2VyZGVDbGFzc0NoZWNrUmVzdWx0W107XG4gIC8qKiBBbGwgTm9kZS5qcyBidWlsdC1pbiBpbXBvcnRzIGZvdW5kIGluIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dCAqL1xuICBnbG9iYWxOb2RlSW1wb3J0czogc3RyaW5nW107XG4gIC8qKiBXaGV0aGVyIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dCBjb250YWlucyBhbnkgc2VyZGUtcmVsYXRlZCBjbGFzc2VzICovXG4gIGhhc1NlcmRlQ2xhc3NlczogYm9vbGVhbjtcbiAgLyoqIFRoZSByYXcgd29ya2Zsb3cgbWFuaWZlc3QgZXh0cmFjdGVkIGZyb20gdGhlIFNXQyB0cmFuc2Zvcm0gKi9cbiAgbWFuaWZlc3Q6IFdvcmtmbG93TWFuaWZlc3Q7XG59XG5cbi8qKlxuICogTGlnaHR3ZWlnaHQgc2VyZGUgY29tcGxpYW5jZSBjaGVja2VyIHRoYXQgd29ya3Mgd2l0aCBwcmUtY29tcHV0ZWRcbiAqIFNXQyB0cmFuc2Zvcm0gcmVzdWx0cy4gVGhpcyBhdm9pZHMgcmUtcnVubmluZyB0aGUgU1dDIHRyYW5zZm9ybVxuICogd2hlbiB0aGUgY2FsbGVyIGFscmVhZHkgaGFzIHRoZSBvdXRwdXRzIChlLmcuLCB0aGUgcGxheWdyb3VuZCBvciBidWlsZGVyKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuYWx5emVTZXJkZUNvbXBsaWFuY2Uob3B0aW9uczoge1xuICAvKiogU291cmNlIGNvZGUgKHVzZWQgZm9yIHBhdHRlcm4gZGV0ZWN0aW9uKSAqL1xuICBzb3VyY2VDb2RlOiBzdHJpbmc7XG4gIC8qKiBXb3JrZmxvdy1tb2RlIHRyYW5zZm9ybWVkIG91dHB1dCAqL1xuICB3b3JrZmxvd0NvZGU6IHN0cmluZztcbiAgLyoqIE1hbmlmZXN0IGV4dHJhY3RlZCBmcm9tIHRoZSBTV0MgdHJhbnNmb3JtICovXG4gIG1hbmlmZXN0OiBXb3JrZmxvd01hbmlmZXN0O1xufSk6IFNlcmRlQ2hlY2tSZXN1bHQge1xuICBjb25zdCB7IHNvdXJjZUNvZGUsIHdvcmtmbG93Q29kZSwgbWFuaWZlc3QgfSA9IG9wdGlvbnM7XG5cbiAgLy8gMS4gRXh0cmFjdCBhbGwgTm9kZS5qcyBidWlsdC1pbiBpbXBvcnRzIGZyb20gdGhlIHdvcmtmbG93IG91dHB1dFxuICBjb25zdCBnbG9iYWxOb2RlSW1wb3J0cyA9IGV4dHJhY3ROb2RlSW1wb3J0cyh3b3JrZmxvd0NvZGUpO1xuXG4gIC8vIDIuIENoZWNrIGlmIHRoZSBtYW5pZmVzdCBjb250YWlucyBhbnkgc2VyZGUtcmVnaXN0ZXJlZCBjbGFzc2VzXG4gIGNvbnN0IGNsYXNzRW50cmllcyA9IGV4dHJhY3RDbGFzc0VudHJpZXMobWFuaWZlc3QpO1xuICBjb25zdCBoYXNTZXJkZUNsYXNzZXMgPSBjbGFzc0VudHJpZXMubGVuZ3RoID4gMDtcblxuICAvLyAzLiBDaGVjayBpZiB0aGUgd29ya2Zsb3cgb3V0cHV0IGNvbnRhaW5zIHJlZ2lzdHJhdGlvbiBJSUZFc1xuICBjb25zdCBoYXNSZWdpc3RyYXRpb24gPSByZWdpc3RyYXRpb25JaWZlUmVnZXgudGVzdCh3b3JrZmxvd0NvZGUpO1xuXG4gIC8vIDQuIEFuYWx5emUgZWFjaCBjbGFzc1xuICBjb25zdCBjbGFzc2VzOiBTZXJkZUNsYXNzQ2hlY2tSZXN1bHRbXSA9IGNsYXNzRW50cmllcy5tYXAoKGVudHJ5KSA9PiB7XG4gICAgY29uc3QgaXNzdWVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8gQ2hlY2sgZm9yIE5vZGUuanMgaW1wb3J0cyAodGhlc2Ugd2lsbCBmYWlsIGluIHRoZSB3b3JrZmxvdyBzYW5kYm94KVxuICAgIGlmIChnbG9iYWxOb2RlSW1wb3J0cy5sZW5ndGggPiAwKSB7XG4gICAgICBpc3N1ZXMucHVzaChcbiAgICAgICAgYFdvcmtmbG93IGJ1bmRsZSBjb250YWlucyBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHM6ICR7Z2xvYmFsTm9kZUltcG9ydHMuam9pbignLCAnKX0uIGAgK1xuICAgICAgICAgIGBUaGVzZSB3aWxsIGZhaWwgYXQgcnVudGltZSBpbiB0aGUgd29ya2Zsb3cgc2FuZGJveC4gYCArXG4gICAgICAgICAgYEFkZCBcInVzZSBzdGVwXCIgdG8gbWV0aG9kcyB0aGF0IGRlcGVuZCBvbiBOb2RlLmpzIEFQSXMgc28gdGhleSBhcmUgc3RyaXBwZWQgZnJvbSB0aGUgd29ya2Zsb3cgYnVuZGxlLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHJlZ2lzdHJhdGlvblxuICAgIGlmICghaGFzUmVnaXN0cmF0aW9uKSB7XG4gICAgICBpc3N1ZXMucHVzaChcbiAgICAgICAgYE5vIGNsYXNzIHJlZ2lzdHJhdGlvbiBJSUZFIHdhcyBnZW5lcmF0ZWQuIGAgK1xuICAgICAgICAgIGBFbnN1cmUgV09SS0ZMT1dfU0VSSUFMSVpFIGFuZCBXT1JLRkxPV19ERVNFUklBTElaRSBhcmUgZGVmaW5lZCBhcyBzdGF0aWMgbWV0aG9kcyBgICtcbiAgICAgICAgICBgaW5zaWRlIHRoZSBjbGFzcyBib2R5IHVzaW5nIGNvbXB1dGVkIHByb3BlcnR5IHN5bnRheDogc3RhdGljIFtXT1JLRkxPV19TRVJJQUxJWkVdKC4uLikgeyAuLi4gfWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNsYXNzTmFtZTogZW50cnkuY2xhc3NOYW1lLFxuICAgICAgY2xhc3NJZDogZW50cnkuY2xhc3NJZCxcbiAgICAgIGRldGVjdGVkOiB0cnVlLFxuICAgICAgcmVnaXN0ZXJlZDogaGFzUmVnaXN0cmF0aW9uLFxuICAgICAgbm9kZUltcG9ydHM6IGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgICAgY29tcGxpYW50OiBnbG9iYWxOb2RlSW1wb3J0cy5sZW5ndGggPT09IDAgJiYgaGFzUmVnaXN0cmF0aW9uLFxuICAgICAgaXNzdWVzLFxuICAgIH07XG4gIH0pO1xuXG4gIC8vIDUuIENoZWNrIGZvciBjbGFzc2VzIHRoYXQgaGF2ZSBzZXJkZSBwYXR0ZXJucyBpbiBzb3VyY2UgYnV0IHdlcmVuJ3QgZGV0ZWN0ZWQgYnkgU1dDXG4gIGNvbnN0IHNvdXJjZUhhc1NlcmRlUGF0dGVybnMgPVxuICAgIC9cXFtcXHMqV09SS0ZMT1dfKD86U0VSSUFMSVpFfERFU0VSSUFMSVpFKVxccypcXF0vLnRlc3Qoc291cmNlQ29kZSkgfHxcbiAgICAvU3ltYm9sXFwuZm9yXFxzKlxcKFxccypbJ1wiXXdvcmtmbG93LSg/OnNlcmlhbGl6ZXxkZXNlcmlhbGl6ZSlbJ1wiXVxccypcXCkvLnRlc3QoXG4gICAgICBzb3VyY2VDb2RlXG4gICAgKTtcblxuICBpZiAoc291cmNlSGFzU2VyZGVQYXR0ZXJucyAmJiBjbGFzc0VudHJpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgY2xhc3Nlcy5wdXNoKHtcbiAgICAgIGNsYXNzTmFtZTogJzx1bmtub3duPicsXG4gICAgICBjbGFzc0lkOiAnJyxcbiAgICAgIGRldGVjdGVkOiBmYWxzZSxcbiAgICAgIHJlZ2lzdGVyZWQ6IGZhbHNlLFxuICAgICAgbm9kZUltcG9ydHM6IGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgICAgY29tcGxpYW50OiBmYWxzZSxcbiAgICAgIGlzc3VlczogW1xuICAgICAgICBgU291cmNlIGNvZGUgY29udGFpbnMgV09SS0ZMT1dfU0VSSUFMSVpFL1dPUktGTE9XX0RFU0VSSUFMSVpFIHBhdHRlcm5zIGJ1dCBgICtcbiAgICAgICAgICBgdGhlIFNXQyBwbHVnaW4gZGlkIG5vdCBkZXRlY3QgYW55IHNlcmRlLWVuYWJsZWQgY2xhc3Nlcy4gYCArXG4gICAgICAgICAgYEVuc3VyZSB0aGUgc3ltYm9scyBhcmUgZGVmaW5lZCBhcyBzdGF0aWMgbWV0aG9kcyBJTlNJREUgdGhlIGNsYXNzIGJvZHksIGAgK1xuICAgICAgICAgIGBub3QgYXNzaWduZWQgZXh0ZXJuYWxseSAoZS5nLiwgKE15Q2xhc3MgYXMgYW55KVtXT1JLRkxPV19TRVJJQUxJWkVdID0gLi4uKS5gLFxuICAgICAgXSxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2xhc3NlcyxcbiAgICBnbG9iYWxOb2RlSW1wb3J0cyxcbiAgICBoYXNTZXJkZUNsYXNzZXMsXG4gICAgbWFuaWZlc3QsXG4gIH07XG59XG5cbi8qKlxuICogRXh0cmFjdCBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBuYW1lcyBmcm9tIHRyYW5zZm9ybWVkIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3ROb2RlSW1wb3J0cyhjb2RlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGltcG9ydHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgLy8gUmVzZXQgcmVnZXggc3RhdGVcbiAgbm9kZUltcG9ydEV4dHJhY3RSZWdleC5sYXN0SW5kZXggPSAwO1xuICBmb3IgKFxuICAgIGxldCBtYXRjaCA9IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXguZXhlYyhjb2RlKTtcbiAgICBtYXRjaCAhPT0gbnVsbDtcbiAgICBtYXRjaCA9IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXguZXhlYyhjb2RlKVxuICApIHtcbiAgICAvLyBtYXRjaFsxXSBpcyBmcm9tIHRoZSBFU00gcGF0dGVybiwgbWF0Y2hbMl0gaXMgZnJvbSB0aGUgQ0pTIHBhdHRlcm5cbiAgICBjb25zdCBtb2R1bGVOYW1lID0gbWF0Y2hbMV0gfHwgbWF0Y2hbMl07XG4gICAgaWYgKG1vZHVsZU5hbWUpIHtcbiAgICAgIC8vIE5vcm1hbGl6ZSB0byBiYXNlIG1vZHVsZSBuYW1lIChlLmcuLCAnZnMvcHJvbWlzZXMnIC0+ICdmcycpXG4gICAgICBpbXBvcnRzLmFkZChtb2R1bGVOYW1lLnNwbGl0KCcvJylbMF0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gWy4uLmltcG9ydHNdLnNvcnQoKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IGNsYXNzIGVudHJpZXMgZnJvbSBhIFdvcmtmbG93TWFuaWZlc3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0Q2xhc3NFbnRyaWVzKFxuICBtYW5pZmVzdDogV29ya2Zsb3dNYW5pZmVzdFxuKTogQXJyYXk8eyBjbGFzc05hbWU6IHN0cmluZzsgY2xhc3NJZDogc3RyaW5nOyBmaWxlTmFtZTogc3RyaW5nIH0+IHtcbiAgY29uc3QgZW50cmllczogQXJyYXk8e1xuICAgIGNsYXNzTmFtZTogc3RyaW5nO1xuICAgIGNsYXNzSWQ6IHN0cmluZztcbiAgICBmaWxlTmFtZTogc3RyaW5nO1xuICB9PiA9IFtdO1xuICBpZiAoIW1hbmlmZXN0LmNsYXNzZXMpIHJldHVybiBlbnRyaWVzO1xuXG4gIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjbGFzc2VzXSBvZiBPYmplY3QuZW50cmllcyhtYW5pZmVzdC5jbGFzc2VzKSkge1xuICAgIGZvciAoY29uc3QgW2NsYXNzTmFtZSwgeyBjbGFzc0lkIH1dIG9mIE9iamVjdC5lbnRyaWVzKGNsYXNzZXMpKSB7XG4gICAgICBlbnRyaWVzLnB1c2goeyBjbGFzc05hbWUsIGNsYXNzSWQsIGZpbGVOYW1lIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZW50cmllcztcbn1cbiIsICJpbXBvcnQge1xuICBDb3JydXB0ZWRFdmVudExvZ0Vycm9yLFxuICBFbnRpdHlDb25mbGljdEVycm9yLFxuICBQcmVjb25kaXRpb25GYWlsZWRFcnJvcixcbiAgUmVwbGF5RGl2ZXJnZW5jZUVycm9yLFxuICBSVU5fRVJST1JfQ09ERVMsXG4gIFJ1bkV4cGlyZWRFcnJvcixcbiAgV29ya2Zsb3dSdW50aW1lRXJyb3IsXG59IGZyb20gJ0B3b3JrZmxvdy9lcnJvcnMnO1xuaW1wb3J0IHsgc2V0V29ya2Zsb3dCYXNlUGF0aCB9IGZyb20gJ0B3b3JrZmxvdy91dGlscyc7XG5pbXBvcnQgeyBwYXJzZVdvcmtmbG93TmFtZSB9IGZyb20gJ0B3b3JrZmxvdy91dGlscy9wYXJzZS1uYW1lJztcbmltcG9ydCB7XG4gIHR5cGUgRXZlbnQsXG4gIGdldFF1ZXVlVG9waWNQcmVmaXgsXG4gIHJlc29sdmVRdWV1ZU5hbWVzcGFjZSxcbiAgU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gIFNQRUNfVkVSU0lPTl9MRUdBQ1ksXG4gIFdvcmtmbG93SW52b2tlUGF5bG9hZFNjaGVtYSxcbiAgdHlwZSBXb3JrZmxvd1J1bixcbn0gZnJvbSAnQHdvcmtmbG93L3dvcmxkJztcbmltcG9ydCB7XG4gIGNsYXNzaWZ5UnVuRXJyb3IsXG4gIGlzUmV0cnlhYmxlV29ybGRFcnJvcixcbiAgaXNXb3JsZENvbnRyYWN0RXJyb3IsXG59IGZyb20gJy4vY2xhc3NpZnktZXJyb3IuanMnO1xuaW1wb3J0IHsgaW1wb3J0S2V5IH0gZnJvbSAnLi9lbmNyeXB0aW9uLmpzJztcbmltcG9ydCB7IFdvcmtmbG93U3VzcGVuc2lvbiB9IGZyb20gJy4vZ2xvYmFsLmpzJztcbmltcG9ydCB7IHJ1bnRpbWVMb2dnZXIgfSBmcm9tICcuL2xvZ2dlci5qcyc7XG5pbXBvcnQge1xuICBNQVhfUVVFVUVfREVMSVZFUklFUyxcbiAgUkVQTEFZX0RJVkVSR0VOQ0VfTUFYX1JFVFJJRVMsXG4gIFJFUExBWV9USU1FT1VUX01BWF9SRVRSSUVTLFxuICBSRVBMQVlfVElNRU9VVF9NUyxcbn0gZnJvbSAnLi9ydW50aW1lL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQge1xuICBnZXRRdWV1ZU92ZXJoZWFkLFxuICBnZXRXb3JrZmxvd1F1ZXVlTmFtZSxcbiAgZ2V0V29ya2Zsb3dSdW5FdmVudHMsXG4gIGhhbmRsZUhlYWx0aENoZWNrTWVzc2FnZSxcbiAgdHlwZSBNdXRhYmxlRXZlbnRMb2csXG4gIHBhcnNlSGVhbHRoQ2hlY2tQYXlsb2FkLFxuICBxdWV1ZU1lc3NhZ2UsXG4gIHN0YXRlVXBkYXRlZEF0Rm9yQ3JlYXRlLFxuICB3aXRoSGVhbHRoQ2hlY2ssXG4gIHdpdGhQcmVjb25kaXRpb25SZXRyeSxcbn0gZnJvbSAnLi9ydW50aW1lL2hlbHBlcnMuanMnO1xuaW1wb3J0IHsgaGFuZGxlU3VzcGVuc2lvbiB9IGZyb20gJy4vcnVudGltZS9zdXNwZW5zaW9uLWhhbmRsZXIuanMnO1xuaW1wb3J0IHsgZ2V0V29ybGQsIGdldFdvcmxkSGFuZGxlcnMgfSBmcm9tICcuL3J1bnRpbWUvd29ybGQuanMnO1xuaW1wb3J0IHsgcmVtYXBFcnJvclN0YWNrIH0gZnJvbSAnLi9zb3VyY2UtbWFwLmpzJztcbmltcG9ydCAqIGFzIEF0dHJpYnV0ZSBmcm9tICcuL3RlbGVtZXRyeS9zZW1hbnRpYy1jb252ZW50aW9ucy5qcyc7XG5pbXBvcnQge1xuICBsaW5rVG9DdXJyZW50Q29udGV4dCxcbiAgdHJhY2UsXG4gIHdpdGhUcmFjZUNvbnRleHQsXG4gIHdpdGhXb3JrZmxvd0JhZ2dhZ2UsXG59IGZyb20gJy4vdGVsZW1ldHJ5LmpzJztcbmltcG9ydCB7IGdldEVycm9yTmFtZSwgZ2V0RXJyb3JTdGFjaywgbm9ybWFsaXplVW5rbm93bkVycm9yIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBidWlsZFdvcmtmbG93U3VzcGVuc2lvbk1lc3NhZ2UgfSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgcnVuV29ya2Zsb3cgfSBmcm9tICcuL3dvcmtmbG93LmpzJztcblxuZXhwb3J0IHR5cGUgeyBFdmVudCwgV29ya2Zsb3dSdW4gfTtcbmV4cG9ydCB7IFdvcmtmbG93U3VzcGVuc2lvbiB9IGZyb20gJy4vZ2xvYmFsLmpzJztcbmV4cG9ydCB7XG4gIHR5cGUgSGVhbHRoQ2hlY2tFbmRwb2ludCxcbiAgdHlwZSBIZWFsdGhDaGVja09wdGlvbnMsXG4gIHR5cGUgSGVhbHRoQ2hlY2tSZXN1bHQsXG4gIGhlYWx0aENoZWNrLFxufSBmcm9tICcuL3J1bnRpbWUvaGVscGVycy5qcyc7XG5leHBvcnQge1xuICBnZXRIb29rQnlUb2tlbixcbiAgcmVzdW1lSG9vayxcbiAgcmVzdW1lV2ViaG9vayxcbn0gZnJvbSAnLi9ydW50aW1lL3Jlc3VtZS1ob29rLmpzJztcbmV4cG9ydCB7XG4gIGdldFJ1bixcbiAgUnVuLFxuICB0eXBlIFdvcmtmbG93UmVhZGFibGVTdHJlYW0sXG4gIHR5cGUgV29ya2Zsb3dSZWFkYWJsZVN0cmVhbU9wdGlvbnMsXG59IGZyb20gJy4vcnVudGltZS9ydW4uanMnO1xuZXhwb3J0IHtcbiAgY2FuY2VsUnVuLFxuICBsaXN0U3RyZWFtcyxcbiAgdHlwZSBSZWFkU3RyZWFtT3B0aW9ucyxcbiAgdHlwZSBSZWNyZWF0ZVJ1bk9wdGlvbnMsXG4gIHJlYWRTdHJlYW0sXG4gIHJlY3JlYXRlUnVuRnJvbUV4aXN0aW5nLFxuICByZWVucXVldWVSdW4sXG4gIHR5cGUgU3RvcFNsZWVwT3B0aW9ucyxcbiAgdHlwZSBTdG9wU2xlZXBSZXN1bHQsXG4gIHdha2VVcFJ1bixcbn0gZnJvbSAnLi9ydW50aW1lL3J1bnMuanMnO1xuZXhwb3J0IHtcbiAgdHlwZSBTdGFydE9wdGlvbnMsXG4gIHR5cGUgU3RhcnRPcHRpb25zQmFzZSxcbiAgdHlwZSBTdGFydE9wdGlvbnNXaXRoRGVwbG95bWVudElkLFxuICB0eXBlIFN0YXJ0T3B0aW9uc1dpdGhvdXREZXBsb3ltZW50SWQsXG4gIHN0YXJ0LFxufSBmcm9tICcuL3J1bnRpbWUvc3RhcnQuanMnO1xuZXhwb3J0IHsgc3RlcEVudHJ5cG9pbnQgfSBmcm9tICcuL3J1bnRpbWUvc3RlcC1oYW5kbGVyLmpzJztcbmV4cG9ydCB7XG4gIGNyZWF0ZVdvcmxkLFxuICBnZXRXb3JsZCxcbiAgZ2V0V29ybGRIYW5kbGVycyxcbiAgc2V0V29ybGQsXG59IGZyb20gJy4vcnVudGltZS93b3JsZC5qcyc7XG5cbmZ1bmN0aW9uIGhhc1JlY29yZGVkVGVybWluYWxSdW5FdmVudChldmVudHM6IEV2ZW50W10sIHJ1bklkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgdGVybWluYWxFdmVudCA9IGV2ZW50cy5maW5kKFxuICAgIChldmVudCkgPT5cbiAgICAgIGV2ZW50LnJ1bklkID09PSBydW5JZCAmJlxuICAgICAgKGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9jb21wbGV0ZWQnIHx8XG4gICAgICAgIGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9mYWlsZWQnIHx8XG4gICAgICAgIGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9jYW5jZWxsZWQnKVxuICApO1xuXG4gIGlmICghdGVybWluYWxFdmVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAnV29ya2Zsb3cgZXZlbnQgbG9nIGFscmVhZHkgY29udGFpbnMgYSB0ZXJtaW5hbCBydW4gZXZlbnQsIHNraXBwaW5nIHJlcGxheScsXG4gICAge1xuICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICBldmVudFR5cGU6IHRlcm1pbmFsRXZlbnQuZXZlbnRUeXBlLFxuICAgICAgZXZlbnRJZDogdGVybWluYWxFdmVudC5ldmVudElkLFxuICAgIH1cbiAgKTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBjcmVhdGVzIGEgc2luZ2xlIHJvdXRlIHdoaWNoIGhhbmRsZXMgYW55IHdvcmtmbG93IGV4ZWN1dGlvblxuICogcmVxdWVzdCBhbmQgcm91dGVzIHRvIHRoZSBhcHByb3ByaWF0ZSB3b3JrZmxvdyBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gd29ya2Zsb3dDb2RlIC0gVGhlIHdvcmtmbG93IGJ1bmRsZSBjb2RlIGNvbnRhaW5pbmcgYWxsIHRoZSB3b3JrZmxvd1xuICogZnVuY3Rpb25zIGF0IHRoZSB0b3AgbGV2ZWwuXG4gKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgYXMgYSBWZXJjZWwgQVBJIHJvdXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd29ya2Zsb3dFbnRyeXBvaW50KFxuICB3b3JrZmxvd0NvZGU6IHN0cmluZyxcbiAgb3B0aW9ucz86IHsgbmFtZXNwYWNlPzogc3RyaW5nOyBiYXNlUGF0aD86IHN0cmluZyB9XG4pOiAocmVxOiBSZXF1ZXN0KSA9PiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIHNldFdvcmtmbG93QmFzZVBhdGgob3B0aW9ucz8uYmFzZVBhdGgpO1xuXG4gIGNvbnN0IG5hbWVzcGFjZSA9IHJlc29sdmVRdWV1ZU5hbWVzcGFjZShvcHRpb25zPy5uYW1lc3BhY2UpO1xuICBjb25zdCB3b3JrZmxvd1ByZWZpeCA9IGdldFF1ZXVlVG9waWNQcmVmaXgoJ3dvcmtmbG93JywgbmFtZXNwYWNlKTtcblxuICBjb25zdCB7IGNyZWF0ZVF1ZXVlSGFuZGxlciwgc3BlY1ZlcnNpb246IHdvcmxkU3BlY1ZlcnNpb24gfSA9XG4gICAgZ2V0V29ybGRIYW5kbGVycygpO1xuICBjb25zdCBoYW5kbGVyID0gY3JlYXRlUXVldWVIYW5kbGVyKFxuICAgIHdvcmtmbG93UHJlZml4LFxuICAgIGFzeW5jIChtZXNzYWdlXywgbWV0YWRhdGEpID0+IHtcbiAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYSBoZWFsdGggY2hlY2sgbWVzc2FnZVxuICAgICAgLy8gTk9URTogSGVhbHRoIGNoZWNrIG1lc3NhZ2VzIGFyZSBpbnRlbnRpb25hbGx5IHVuYXV0aGVudGljYXRlZCBmb3IgbW9uaXRvcmluZyBwdXJwb3Nlcy5cbiAgICAgIC8vIFRoZXkgb25seSB3cml0ZSBhIHNpbXBsZSBzdGF0dXMgcmVzcG9uc2UgdG8gYSBzdHJlYW0gYW5kIGRvIG5vdCBleHBvc2Ugc2Vuc2l0aXZlIGRhdGEuXG4gICAgICAvLyBUaGUgc3RyZWFtIG5hbWUgaW5jbHVkZXMgYSB1bmlxdWUgY29ycmVsYXRpb25JZCB0aGF0IG11c3QgYmUga25vd24gYnkgdGhlIGNhbGxlci5cbiAgICAgIGNvbnN0IGhlYWx0aENoZWNrID0gcGFyc2VIZWFsdGhDaGVja1BheWxvYWQobWVzc2FnZV8pO1xuICAgICAgaWYgKGhlYWx0aENoZWNrKSB7XG4gICAgICAgIGF3YWl0IGhhbmRsZUhlYWx0aENoZWNrTWVzc2FnZShcbiAgICAgICAgICBoZWFsdGhDaGVjayxcbiAgICAgICAgICAnd29ya2Zsb3cnLFxuICAgICAgICAgIHdvcmxkU3BlY1ZlcnNpb25cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7XG4gICAgICAgIHJ1bklkLFxuICAgICAgICB0cmFjZUNhcnJpZXI6IHRyYWNlQ29udGV4dCxcbiAgICAgICAgcmVxdWVzdGVkQXQsXG4gICAgICAgIHJlcGxheURpdmVyZ2VuY2UsXG4gICAgICAgIHJ1bklucHV0LFxuICAgICAgfSA9IFdvcmtmbG93SW52b2tlUGF5bG9hZFNjaGVtYS5wYXJzZShtZXNzYWdlXyk7XG4gICAgICBjb25zdCB7IHJlcXVlc3RJZCB9ID0gbWV0YWRhdGE7XG4gICAgICAvLyBFeHRyYWN0IHRoZSB3b3JrZmxvdyBuYW1lIGZyb20gdGhlIHRvcGljIG5hbWVcbiAgICAgIGNvbnN0IHdvcmtmbG93TmFtZSA9IG1ldGFkYXRhLnF1ZXVlTmFtZS5zbGljZSh3b3JrZmxvd1ByZWZpeC5sZW5ndGgpO1xuXG4gICAgICAvLyAtLS0gTWF4IGRlbGl2ZXJ5IGNoZWNrIC0tLVxuICAgICAgLy8gRW5mb3JjZSBtYXggZGVsaXZlcnkgbGltaXQgYmVmb3JlIGFueSBpbmZyYXN0cnVjdHVyZSBjYWxscy5cbiAgICAgIC8vIFRoaXMgcHJldmVudHMgcnVuYXdheSB3b3JrZmxvd3MgZnJvbSBjb25zdW1pbmcgaW5maW5pdGUgcXVldWUgZGVsaXZlcmllcy5cbiAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIHdlIHdhbnQgdG8gZG8gdGhlIG1pbmltYWwgYW1vdW50IG9mIHdvcmsgKG5vIGZldGNoaW5nXG4gICAgICAvLyBvZiB0aGUgd29ya2Zsb3cgZXZlbnRzLCBldGMuIFdlIHNpbXBseSBhdHRlbXB0IHRvIG1hcmsgdGhlIHJ1biBhcyBmYWlsZWRcbiAgICAgIC8vIGFuZCBpZiB0aGF0IGZhaWxzLCB0aGUgbWVzc2FnZSBpcyBzdGlsbCBjb25zdW1lZCBidXQgd2l0aCBhZGVxdWF0ZSBsb2dnaW5nXG4gICAgICAvLyB0aGF0IGFuIGVycm9yIG9jY3VycmVkIHByZXZlbnRpbmcgdXMgZnJvbSBmYWlsaW5nIHRoZSBydW4uXG4gICAgICBpZiAobWV0YWRhdGEuYXR0ZW1wdCA+IE1BWF9RVUVVRV9ERUxJVkVSSUVTKSB7XG4gICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgYFdvcmtmbG93IGhhbmRsZXIgZXhjZWVkZWQgbWF4IGRlbGl2ZXJpZXMgKCR7bWV0YWRhdGEuYXR0ZW1wdH0vJHtNQVhfUVVFVUVfREVMSVZFUklFU30pYCxcbiAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkLCB3b3JrZmxvd05hbWUsIGF0dGVtcHQ6IG1ldGFkYXRhLmF0dGVtcHQgfVxuICAgICAgICApO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHdvcmxkID0gZ2V0V29ybGQoKTtcbiAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgV29ya2Zsb3cgZXhjZWVkZWQgbWF4aW11bSBxdWV1ZSBkZWxpdmVyaWVzICgke21ldGFkYXRhLmF0dGVtcHR9LyR7TUFYX1FVRVVFX0RFTElWRVJJRVN9KWAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5NQVhfREVMSVZFUklFU19FWENFRURFRCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgaWYgKEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZXJyKSB8fCBSdW5FeHBpcmVkRXJyb3IuaXMoZXJyKSkge1xuICAgICAgICAgICAgLy8gUnVuIGFscmVhZHkgZmluaXNoZWQsIGNvbnN1bWUgdGhlIG1lc3NhZ2Ugc2lsZW50bHlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgIGBGYWlsZWQgdG8gbWFyayBydW4gYXMgZmFpbGVkIGFmdGVyICR7bWV0YWRhdGEuYXR0ZW1wdH0gZGVsaXZlcnkgYXR0ZW1wdHMuIGAgK1xuICAgICAgICAgICAgICBgQSBwZXJzaXN0ZW50IGVycm9yIGlzIHByZXZlbnRpbmcgdGhlIHJ1biBmcm9tIGJlaW5nIHRlcm1pbmF0ZWQuIGAgK1xuICAgICAgICAgICAgICBgVGhlIHJ1biB3aWxsIHJlbWFpbiBpbiBpdHMgY3VycmVudCBzdGF0ZSB1bnRpbCBtYW51YWxseSByZXNvbHZlZC4gYCArXG4gICAgICAgICAgICAgIGBUaGlzIGlzIG1vc3QgbGlrZWx5IGR1ZSB0byBhIHBlcnNpc3RlbnQgb3V0YWdlIG9mIHRoZSB3b3JrZmxvdyBiYWNrZW5kIGAgK1xuICAgICAgICAgICAgICBgb3IgYSBidWcgaW4gdGhlIHdvcmtmbG93IHJ1bnRpbWUgYW5kIHNob3VsZCBiZSByZXBvcnRlZCB0byB0aGUgV29ya2Zsb3cgdGVhbS5gLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgZXJyb3I6IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSxcbiAgICAgICAgICAgICAgYXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3BhbkxpbmtzID0gYXdhaXQgbGlua1RvQ3VycmVudENvbnRleHQoKTtcblxuICAgICAgLy8gLS0tIFJlcGxheSB0aW1lb3V0IGd1YXJkIC0tLVxuICAgICAgLy8gSWYgdGhlIHJlcGxheSB0YWtlcyBsb25nZXIgdGhhbiB0aGUgdGltZW91dCwgZmFpbCB0aGUgcnVuIGFuZCBleGl0LlxuICAgICAgLy8gVGhpcyBtdXN0IGJlIGxvd2VyIHRoYW4gdGhlIGZ1bmN0aW9uJ3MgbWF4RHVyYXRpb24gdG8gZW5zdXJlXG4gICAgICAvLyB0aGUgZmFpbHVyZSBpcyByZWNvcmRlZCBiZWZvcmUgdGhlIHBsYXRmb3JtIGtpbGxzIHRoZSBmdW5jdGlvbi5cbiAgICAgIGxldCByZXBsYXlUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IHVuZGVmaW5lZDtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5WRVJDRUxfVVJMICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVwbGF5VGltZW91dCA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoJ1dvcmtmbG93IHJlcGxheSBleGNlZWRlZCB0aW1lb3V0Jywge1xuICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICB0aW1lb3V0TXM6IFJFUExBWV9USU1FT1VUX01TLFxuICAgICAgICAgICAgYXR0ZW1wdDogbWV0YWRhdGEuYXR0ZW1wdCxcbiAgICAgICAgICAgIG1heFJldHJpZXM6IFJFUExBWV9USU1FT1VUX01BWF9SRVRSSUVTLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gQWxsb3cgYSBmZXcgcmV0cmllcyBiZWZvcmUgcGVybWFuZW50bHkgZmFpbGluZyB0aGUgcnVuLlxuICAgICAgICAgIC8vIE9uIGVhcmx5IGF0dGVtcHRzLCBqdXN0IGV4aXQgc28gdGhlIHF1ZXVlIHJldHJpZXMgdGhlIG1lc3NhZ2UuXG4gICAgICAgICAgaWYgKG1ldGFkYXRhLmF0dGVtcHQgPD0gUkVQTEFZX1RJTUVPVVRfTUFYX1JFVFJJRVMpIHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgd29ybGQgPSBhd2FpdCBnZXRXb3JsZCgpO1xuICAgICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fZmFpbGVkJyxcbiAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgV29ya2Zsb3cgcmVwbGF5IGV4Y2VlZGVkIG1heGltdW0gZHVyYXRpb24gKCR7UkVQTEFZX1RJTUVPVVRfTVMgLyAxMDAwfXMpIGFmdGVyICR7bWV0YWRhdGEuYXR0ZW1wdH0gYXR0ZW1wdHNgLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLlJFUExBWV9USU1FT1VULFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBCZXN0IGVmZm9ydCDigJQgcHJvY2VzcyBleGl0cyByZWdhcmRsZXNzXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIGFsc28gcHJldmVudHMgdGhlIHJ1bnRpbWUgZnJvbSBhY2tpbmcgdGhlIHF1ZXVlIG1lc3NhZ2UsXG4gICAgICAgICAgLy8gc28gdGhlIHF1ZXVlIHdpbGwgY2FsbCBiYWNrIG9uY2UsIGFmdGVyIHdoaWNoIGEgNDEwIHdpbGwgZ2V0IGl0IHRvIGV4aXQgZWFybHkuXG4gICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9LCBSRVBMQVlfVElNRU9VVF9NUyk7XG4gICAgICAgIHJlcGxheVRpbWVvdXQudW5yZWYoKTtcbiAgICAgIH1cblxuICAgICAgLy8gSW52b2tlIHVzZXIgd29ya2Zsb3cgd2l0aGluIHRoZSBwcm9wYWdhdGVkIHRyYWNlIGNvbnRleHQgYW5kIGJhZ2dhZ2VcbiAgICAgIHJldHVybiBhd2FpdCB3aXRoVHJhY2VDb250ZXh0KHRyYWNlQ29udGV4dCwgYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBTZXQgd29ya2Zsb3cgY29udGV4dCBhcyBiYWdnYWdlIGZvciBhdXRvbWF0aWMgcHJvcGFnYXRpb25cbiAgICAgICAgcmV0dXJuIGF3YWl0IHdpdGhXb3JrZmxvd0JhZ2dhZ2UoXG4gICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCwgd29ya2Zsb3dOYW1lIH0sXG4gICAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgd29ybGQgPSBnZXRXb3JsZCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRyYWNlKFxuICAgICAgICAgICAgICBgV09SS0ZMT1cgJHt3b3JrZmxvd05hbWV9YCxcbiAgICAgICAgICAgICAgeyBsaW5rczogc3BhbkxpbmtzIH0sXG4gICAgICAgICAgICAgIGFzeW5jIChzcGFuKSA9PiB7XG4gICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dOYW1lKHdvcmtmbG93TmFtZSksXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dPcGVyYXRpb24oJ2V4ZWN1dGUnKSxcbiAgICAgICAgICAgICAgICAgIC8vIFN0YW5kYXJkIE9URUwgbWVzc2FnaW5nIGNvbnZlbnRpb25zXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuTWVzc2FnaW5nU3lzdGVtKCd2ZXJjZWwtcXVldWUnKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5NZXNzYWdpbmdEZXN0aW5hdGlvbk5hbWUobWV0YWRhdGEucXVldWVOYW1lKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5NZXNzYWdpbmdNZXNzYWdlSWQobWV0YWRhdGEubWVzc2FnZUlkKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5NZXNzYWdpbmdPcGVyYXRpb25UeXBlKCdwcm9jZXNzJyksXG4gICAgICAgICAgICAgICAgICAuLi5nZXRRdWV1ZU92ZXJoZWFkKHsgcmVxdWVzdGVkQXQgfSksXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiB2YWxpZGF0ZSBgd29ya2Zsb3dOYW1lYCBleGlzdHMgYmVmb3JlIGNvbnN1bWluZyBtZXNzYWdlP1xuXG4gICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5JZChydW5JZCksXG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dUcmFjZVByb3BhZ2F0ZWQoISF0cmFjZUNvbnRleHQpLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbGV0IHdvcmtmbG93U3RhcnRlZEF0ID0gLTE7XG4gICAgICAgICAgICAgICAgbGV0IHdvcmtmbG93UnVuOiBXb3JrZmxvd1J1biB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAvLyBQcmUtbG9hZGVkIGV2ZW50cyBmcm9tIHRoZSBydW5fc3RhcnRlZCByZXNwb25zZS5cbiAgICAgICAgICAgICAgICAvLyBXaGVuIHByZXNlbnQsIHdlIHNraXAgdGhlIGV2ZW50cy5saXN0IGNhbGwuXG4gICAgICAgICAgICAgICAgbGV0IHByZWxvYWRlZEV2ZW50czogRXZlbnRbXSB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBsZXQgcHJlbG9hZGVkRXZlbnRzQ3Vyc29yOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgLy8gLS0tIEluZnJhc3RydWN0dXJlOiBwcmVwYXJlIHRoZSBydW4gc3RhdGUgLS0tXG4gICAgICAgICAgICAgICAgLy8gQWx3YXlzIGNhbGwgcnVuX3N0YXJ0ZWQgZGlyZWN0bHkg4oCUIHRoaXMgYm90aCB0cmFuc2l0aW9uc1xuICAgICAgICAgICAgICAgIC8vIHRoZSBydW4gdG8gJ3J1bm5pbmcnIEFORCByZXR1cm5zIHRoZSBydW4gZW50aXR5LCBzYXZpbmdcbiAgICAgICAgICAgICAgICAvLyBhIHNlcGFyYXRlIHJ1bnMuZ2V0IHJvdW5kLXRyaXAuXG4gICAgICAgICAgICAgICAgLy8gQ29udHJhY3Q6IGV2ZW50cy5jcmVhdGUoJ3J1bl9zdGFydGVkJykgbXVzdCBiZSBpZGVtcG90ZW50XG4gICAgICAgICAgICAgICAgLy8gZm9yIHJ1bnMgYWxyZWFkeSBpbiAncnVubmluZycgc3RhdHVzIChyZXR1cm4gdGhlIHJ1blxuICAgICAgICAgICAgICAgIC8vIHdpdGhvdXQgZXJyb3IpLCBub3QganVzdCBmb3IgcGVuZGluZyDihpIgcnVubmluZyB0cmFuc2l0aW9ucy5cbiAgICAgICAgICAgICAgICAvLyBOZXR3b3JrL3NlcnZlciBlcnJvcnMgcHJvcGFnYXRlIHRvIHRoZSBxdWV1ZSBoYW5kbGVyIGZvciByZXRyeS5cbiAgICAgICAgICAgICAgICAvLyBXb3JrZmxvd1J1bnRpbWVFcnJvciAoZGF0YSBpbnRlZ3JpdHkgaXNzdWVzKSBhcmUgZmF0YWwgYW5kXG4gICAgICAgICAgICAgICAgLy8gcHJvZHVjZSBydW5fZmFpbGVkIHNpbmNlIHJldHJ5aW5nIHdvbid0IGZpeCB0aGVtLlxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9zdGFydGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBVc2UgdGhlIHNwZWMgdmVyc2lvbiBmcm9tIHRoZSBvcmlnaW5hbCBzdGFydCgpIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAvLyB3aGVuIGF2YWlsYWJsZSwgc28gdGhlIHJlc2lsaWVudCBzdGFydCBwYXRoIGNyZWF0ZXNcbiAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgcnVuIHdpdGggdGhlIGNvcnJlY3QgdmVyc2lvbiAobm90IGFsd2F5cyBjdXJyZW50KS5cbiAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bklucHV0Py5zcGVjVmVyc2lvbiA/PyBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBQYXNzIHJ1biBpbnB1dCBmcm9tIHF1ZXVlIHNvIHRoZSBzZXJ2ZXIgY2FuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBydW4gaWYgcnVuX2NyZWF0ZWQgd2FzIG1pc3NlZC5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBVaW50OEFycmF5IHZhbHVlcyBzdXJ2aXZlIHRoZSBxdWV1ZSBuYXRpdmVseVxuICAgICAgICAgICAgICAgICAgICAgIC8vIChDQk9SIG9uIHdvcmxkLXZlcmNlbCwgSlNPTiByZXZpdmVyIG9uIHdvcmxkLWxvY2FsKS5cbiAgICAgICAgICAgICAgICAgICAgICAuLi4ocnVuSW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IHJ1bklucHV0LmlucHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95bWVudElkOiBydW5JbnB1dC5kZXBsb3ltZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd05hbWU6IHJ1bklucHV0LndvcmtmbG93TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWN1dGlvbkNvbnRleHQ6IHJ1bklucHV0LmV4ZWN1dGlvbkNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB7fSksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5ydW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgIGBFdmVudCBjcmVhdGlvbiBmb3IgJ3J1bl9zdGFydGVkJyBkaWQgbm90IHJldHVybiB0aGUgcnVuIGVudGl0eSBmb3IgcnVuIFwiJHtydW5JZH1cImBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuID0gcmVzdWx0LnJ1bjtcblxuICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJlc3BvbnNlIGluY2x1ZGVzIGV2ZW50cywgdXNlIHRoZW0gdG8gc2tpcFxuICAgICAgICAgICAgICAgICAgLy8gdGhlIGluaXRpYWwgZXZlbnRzLmxpc3QgY2FsbCBhbmQgcmVkdWNlIFRURkIuXG4gICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ldmVudHMgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmV2ZW50cy5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5oYXNNb3JlICE9PSB0cnVlXG4gICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZGVkRXZlbnRzID0gcmVzdWx0LmV2ZW50cztcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZGVkRXZlbnRzQ3Vyc29yID0gcmVzdWx0LmN1cnNvcjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYgKCF3b3JrZmxvd1J1bi5zdGFydGVkQXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgIGBXb3JrZmxvdyBydW4gXCIke3J1bklkfVwiIGhhcyBubyBcInN0YXJ0ZWRBdFwiIHRpbWVzdGFtcGBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFJ1biB3YXMgY29uY3VycmVudGx5IGNvbXBsZXRlZC9mYWlsZWQvY2FuY2VsbGVkXG4gICAgICAgICAgICAgICAgICBpZiAoRW50aXR5Q29uZmxpY3RFcnJvci5pcyhlcnIpIHx8IFJ1bkV4cGlyZWRFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEVudGl0eUNvbmZsaWN0RXJyb3I6IHJ1biB3YXMgY29uY3VycmVudGx5XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbXBsZXRlZC9mYWlsZWQvY2FuY2VsbGVkIGR1cmluZyBzZXR1cC5cbiAgICAgICAgICAgICAgICAgICAgLy8gUnVuRXhwaXJlZEVycm9yOiBydW4gYWxyZWFkeSBpbiB0ZXJtaW5hbCBzdGF0ZS5cbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gYm90aCBjYXNlcywgc2tpcCBwcm9jZXNzaW5nIHRoaXMgbWVzc2FnZS5cbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICdSdW4gYWxyZWFkeSBmaW5pc2hlZCBkdXJpbmcgc2V0dXAsIHNraXBwaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkLCBtZXNzYWdlOiBlcnIubWVzc2FnZSB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyIGluc3RhbmNlb2YgV29ya2Zsb3dSdW50aW1lRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgcnVudGltZSBlcnJvciBkdXJpbmcgd29ya2Zsb3cgc2V0dXAnLFxuICAgICAgICAgICAgICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQsIGVycm9yOiBlcnIubWVzc2FnZSB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fZmFpbGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246IFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogZXJyLnN0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuUlVOVElNRV9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZmFpbEVycikge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZmFpbEVycikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJ1bkV4cGlyZWRFcnJvci5pcyhmYWlsRXJyKVxuICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZmFpbEVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSByZWNvcmRpbmcgd29ya2Zsb3cgZmFpbHVyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxFcnIgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZhaWxFcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhmYWlsRXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZmFpbEVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzV29ybGRDb250cmFjdEVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAnRmF0YWwgd29ybGQgY29udHJhY3QgZXJyb3IgZHVyaW5nIHdvcmtmbG93IHNldHVwJyxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZmFpbEVycikge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZmFpbEVycikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJ1bkV4cGlyZWRFcnJvci5pcyhmYWlsRXJyKVxuICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZmFpbEVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSByZWNvcmRpbmcgd29ya2Zsb3cgZmFpbHVyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxFcnIgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZhaWxFcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhmYWlsRXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZmFpbEVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd29ya2Zsb3dTdGFydGVkQXQgPSArd29ya2Zsb3dSdW4uc3RhcnRlZEF0O1xuXG4gICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5TdGF0dXMod29ya2Zsb3dSdW4uc3RhdHVzKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1N0YXJ0ZWRBdCh3b3JrZmxvd1N0YXJ0ZWRBdCksXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAod29ya2Zsb3dSdW4uc3RhdHVzICE9PSAncnVubmluZycpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFdvcmtmbG93IGhhcyBhbHJlYWR5IGNvbXBsZXRlZCBvciBmYWlsZWQsIHNvIHdlIGNhbiBza2lwIGl0XG4gICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICdXb3JrZmxvdyBhbHJlYWR5IGNvbXBsZXRlZCBvciBmYWlsZWQsIHNraXBwaW5nJyxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogd29ya2Zsb3dSdW4uc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAvLyBUT0RPOiBmb3IgYGNhbmNlbGAsIHdlIGFjdHVhbGx5IHdhbnQgdG8gcHJvcGFnYXRlIGEgV29ya2Zsb3dDYW5jZWxsZWQgZXZlbnRcbiAgICAgICAgICAgICAgICAgIC8vIGluc2lkZSB0aGUgd29ya2Zsb3cgY29udGV4dCBzbyB0aGUgdXNlciBjYW4gZ3JhY2VmdWxseSBleGl0LiB0aGlzIGlzIFNJR1RFUk1cbiAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGZ1cnRoZXJtb3JlLCB0aGVyZSBzaG91bGQgYmUgYSB0aW1lb3V0IG9yIGEgd2F5IHRvIGZvcmNlIGNhbmNlbCBTSUdLSUxMXG4gICAgICAgICAgICAgICAgICAvLyBzbyB0aGF0IHdlIGFjdHVhbGx5IGV4aXQgaGVyZSB3aXRob3V0IHJlcGxheWluZyB0aGUgd29ya2Zsb3cgYXQgYWxsLCBpbiB0aGUgY2FzZVxuICAgICAgICAgICAgICAgICAgLy8gdGhlIHJlcGxheWluZyB0aGUgd29ya2Zsb3cgaXMgaXRzZWxmIGZhaWxpbmcuXG5cbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBMb2FkIGFsbCBldmVudHMgaW50byBtZW1vcnkgYmVmb3JlIHJ1bm5pbmcuXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgZ290IHByZS1sb2FkZWQgZXZlbnRzIGZyb20gdGhlIHJ1bl9zdGFydGVkIHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIC8vIHNraXAgdGhlIGV2ZW50cy5saXN0IHJvdW5kLXRyaXAgdG8gcmVkdWNlIFRURkIuXG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50czogRXZlbnRbXTtcbiAgICAgICAgICAgICAgICBsZXQgZXZlbnRzQ3Vyc29yOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBpZiAocHJlbG9hZGVkRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cyA9IHByZWxvYWRlZEV2ZW50cztcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzQ3Vyc29yID0gcHJlbG9hZGVkRXZlbnRzQ3Vyc29yO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVkRXZlbnRzID0gYXdhaXQgZ2V0V29ya2Zsb3dSdW5FdmVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWRcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzID0gbG9hZGVkRXZlbnRzLmV2ZW50cztcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzQ3Vyc29yID0gbG9hZGVkRXZlbnRzLmN1cnNvcjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChpc1dvcmxkQ29udHJhY3RFcnJvcihlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgJ0ZhdGFsIHdvcmxkIGNvbnRyYWN0IGVycm9yIHdoaWxlIGxvYWRpbmcgd29ya2Zsb3cgZXZlbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZTogUlVOX0VSUk9SX0NPREVTLldPUkxEX0NPTlRSQUNUX0VSUk9SLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9mYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlcXVlc3RJZCB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZmFpbEVycikge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZmFpbEVycikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJ1bkV4cGlyZWRFcnJvci5pcyhmYWlsRXJyKVxuICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNXb3JsZENvbnRyYWN0RXJyb3IoZmFpbEVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSByZWNvcmRpbmcgd29ya2Zsb3cgZmFpbHVyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxFcnIgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZhaWxFcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhmYWlsRXJyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZmFpbEVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVGhlIG1hdGVyaWFsaXplZCBydW4gcmV0dXJuZWQgYnkgcnVuX3N0YXJ0ZWQgY2FuIHJhY2UgYVxuICAgICAgICAgICAgICAgIC8vIHRlcm1pbmFsIGV2ZW50IGluIHRoZSBsb2FkZWQgc25hcHNob3QuIERvIG5vdCByZXBsYXkgYSBydW5cbiAgICAgICAgICAgICAgICAvLyB3aG9zZSBldmVudCBsb2cgYWxyZWFkeSBlc3RhYmxpc2hlcyBpdHMgdGVybWluYWwgb3V0Y29tZS5cbiAgICAgICAgICAgICAgICBpZiAoaGFzUmVjb3JkZWRUZXJtaW5hbFJ1bkV2ZW50KGV2ZW50cywgcnVuSWQpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGFueSBlbGFwc2VkIHdhaXRzIGFuZCBjcmVhdGUgd2FpdF9jb21wbGV0ZWQgZXZlbnRzXG4gICAgICAgICAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblxuICAgICAgICAgICAgICAgIC8vIFByZS1jb21wdXRlIGNvbXBsZXRlZCBjb3JyZWxhdGlvbiBJRHMgZm9yIE8obikgbG9va3VwIGluc3RlYWQgb2YgTyhuwrIpXG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGxldGVkV2FpdElkcyA9IG5ldyBTZXQoXG4gICAgICAgICAgICAgICAgICBldmVudHNcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZSkgPT4gZS5ldmVudFR5cGUgPT09ICd3YWl0X2NvbXBsZXRlZCcpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGUpID0+IGUuY29ycmVsYXRpb25JZClcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gQ29sbGVjdCBhbGwgd2FpdHMgdGhhdCBuZWVkIGNvbXBsZXRpb25cbiAgICAgICAgICAgICAgICBjb25zdCB3YWl0c1RvQ29tcGxldGUgPSBldmVudHNcbiAgICAgICAgICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICBlXG4gICAgICAgICAgICAgICAgICAgICk6IGUgaXMgRXh0cmFjdDxFdmVudCwgeyBldmVudFR5cGU6ICd3YWl0X2NyZWF0ZWQnIH0+ICYge1xuICAgICAgICAgICAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQ6IHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgfSA9PlxuICAgICAgICAgICAgICAgICAgICAgIGUuZXZlbnRUeXBlID09PSAnd2FpdF9jcmVhdGVkJyAmJlxuICAgICAgICAgICAgICAgICAgICAgIGUuY29ycmVsYXRpb25JZCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgIWNvbXBsZXRlZFdhaXRJZHMuaGFzKGUuY29ycmVsYXRpb25JZCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICBub3cgPj0gKGUuZXZlbnREYXRhLnJlc3VtZUF0IGFzIERhdGUpLmdldFRpbWUoKVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgLm1hcCgoZSkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiAnd2FpdF9jb21wbGV0ZWQnIGFzIGNvbnN0LFxuICAgICAgICAgICAgICAgICAgICBzcGVjVmVyc2lvbjogU1BFQ19WRVJTSU9OX0NVUlJFTlQsXG4gICAgICAgICAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQ6IGUuY29ycmVsYXRpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdW1lQXQ6IGUuZXZlbnREYXRhLnJlc3VtZUF0LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFsbCB3YWl0X2NvbXBsZXRlZCBldmVudHNcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHdhaXRFdmVudCBvZiB3YWl0c1RvQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHdhaXRMb2c6IE11dGFibGVFdmVudExvZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6IGV2ZW50c0N1cnNvciA/PyBudWxsLFxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHdpdGhQcmVjb25kaXRpb25SZXRyeShcbiAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICB3YWl0TG9nLFxuICAgICAgICAgICAgICAgICAgICAgIChzdGF0ZVVwZGF0ZWRBdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmxkLmV2ZW50cy5jcmVhdGUocnVuSWQsIHdhaXRFdmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlVXBkYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoRW50aXR5Q29uZmxpY3RFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKCdXYWl0IGFscmVhZHkgY29tcGxldGVkLCBza2lwcGluZycsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29ycmVsYXRpb25JZDogd2FpdEV2ZW50LmNvcnJlbGF0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVsb2FkcyBpbnNpZGUgdGhlIGd1YXJkIG1heSBoYXZlIGFkdmFuY2VkIHRoZSBjdXJzb3IuXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50c0N1cnNvciA9IHdhaXRMb2cuY3Vyc29yO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh3YWl0c1RvQ29tcGxldGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgLy8gVGhlIGV2ZW50IGxpc3QgYWJvdmUgbWF5IGJlIHN0YWxlIGJ5IHRoZSB0aW1lIGFuIGVsYXBzZWRcbiAgICAgICAgICAgICAgICAgIC8vIHdhaXQgaXMgY29tbWl0dGVkLiBMb2FkIG9ubHkgZXZlbnRzIGFmdGVyIHRoZSBvcmlnaW5hbFxuICAgICAgICAgICAgICAgICAgLy8gc25hcHNob3QgY3Vyc29yIHNvIGNvbmN1cnJlbnQgZHVyYWJsZSBldmVudHMsIHN1Y2ggYXNcbiAgICAgICAgICAgICAgICAgIC8vIGhvb2tfcmVjZWl2ZWQsIGtlZXAgdGhlaXIgb3JkZXJpbmcgcmVsYXRpdmUgdG9cbiAgICAgICAgICAgICAgICAgIC8vIHdhaXRfY29tcGxldGVkLiBGYWxsIGJhY2sgdG8gYSBmdWxsIHJlbG9hZCBmb3Igb2xkZXIgd29ybGRzXG4gICAgICAgICAgICAgICAgICAvLyB0aGF0IGNhbm5vdCBnaXZlIHVzIGEgc3RhYmxlIGN1cnNvci5cbiAgICAgICAgICAgICAgICAgIGlmIChldmVudHNDdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RXZlbnRzID0gYXdhaXQgZ2V0V29ya2Zsb3dSdW5FdmVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnRzQ3Vyc29yXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRlZFdhaXRJZHNBZnRlckN1cnNvciA9IG5ldyBTZXQoXG4gICAgICAgICAgICAgICAgICAgICAgbmV3RXZlbnRzLmV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZSkgPT4gZS5ldmVudFR5cGUgPT09ICd3YWl0X2NvbXBsZXRlZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKChlKSA9PiBlLmNvcnJlbGF0aW9uSWQpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhd0FsbFdhaXRDb21wbGV0aW9ucyA9IHdhaXRzVG9Db21wbGV0ZS5ldmVyeShcbiAgICAgICAgICAgICAgICAgICAgICAod2FpdEV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkV2FpdElkc0FmdGVyQ3Vyc29yLmhhcyh3YWl0RXZlbnQuY29ycmVsYXRpb25JZClcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2F3QWxsV2FpdENvbXBsZXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdJZHMgPSBuZXcgU2V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLm1hcCgoZXZlbnQpID0+IGV2ZW50LmV2ZW50SWQpXG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIG5ld0V2ZW50cy5ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RpbmdJZHMuaGFzKGV2ZW50LmV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nSWRzLmFkZChldmVudC5ldmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRFdmVudHMgPSBhd2FpdCBnZXRXb3JrZmxvd1J1bkV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuLnJ1bklkXG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudHMgPSBsb2FkZWRFdmVudHMuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRFdmVudHMgPSBhd2FpdCBnZXRXb3JrZmxvd1J1bkV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBldmVudHMgPSBsb2FkZWRFdmVudHMuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBBIGNvbmN1cnJlbnQgdGVybWluYWwgd3JpdGUgbWF5IGhhdmUgbGFuZGVkIHdoaWxlXG4gICAgICAgICAgICAgICAgICAvLyBjb21taXR0aW5nIGFuIGVsYXBzZWQgd2FpdCBhbmQgcmVmcmVzaGluZyB0aGUgc25hcHNob3QuXG4gICAgICAgICAgICAgICAgICBpZiAoaGFzUmVjb3JkZWRUZXJtaW5hbFJ1bkV2ZW50KGV2ZW50cywgcnVuSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBSZXNvbHZlIHRoZSBlbmNyeXB0aW9uIGtleSBmb3IgdGhpcyBydW4ncyBkZXBsb3ltZW50XG4gICAgICAgICAgICAgICAgY29uc3QgcmF3S2V5ID1cbiAgICAgICAgICAgICAgICAgIGF3YWl0IHdvcmxkLmdldEVuY3J5cHRpb25LZXlGb3JSdW4/Lih3b3JrZmxvd1J1bik7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5jcnlwdGlvbktleSA9IHJhd0tleVxuICAgICAgICAgICAgICAgICAgPyBhd2FpdCBpbXBvcnRLZXkocmF3S2V5KVxuICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAvLyAtLS0gVXNlciBjb2RlIGV4ZWN1dGlvbiAtLS1cbiAgICAgICAgICAgICAgICAvLyBPbmx5IGVycm9ycyBmcm9tIHJ1bldvcmtmbG93KCkgKHVzZXIgd29ya2Zsb3cgY29kZSkgc2hvdWxkXG4gICAgICAgICAgICAgICAgLy8gcHJvZHVjZSBydW5fZmFpbGVkLiBJbmZyYXN0cnVjdHVyZSBlcnJvcnMgKG5ldHdvcmssIHNlcnZlcilcbiAgICAgICAgICAgICAgICAvLyBtdXN0IHByb3BhZ2F0ZSB0byB0aGUgcXVldWUgaGFuZGxlciBmb3IgYXV0b21hdGljIHJldHJ5LlxuICAgICAgICAgICAgICAgIGxldCB3b3JrZmxvd1Jlc3VsdDogdW5rbm93bjtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSZXN1bHQgPSBhd2FpdCB0cmFjZShcbiAgICAgICAgICAgICAgICAgICAgJ3dvcmtmbG93LnJlcGxheScsXG4gICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICBhc3luYyAocmVwbGF5U3BhbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJlcGxheVNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXZlbnRzQ291bnQoZXZlbnRzLmxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHJ1bldvcmtmbG93KFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dDb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNyeXB0aW9uS2V5XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFdvcmtmbG93U3VzcGVuc2lvbiBpcyBub3JtYWwgY29udHJvbCBmbG93IOKAlCBub3QgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICAgIGlmIChXb3JrZmxvd1N1c3BlbnNpb24uaXMoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdXNwZW5zaW9uTWVzc2FnZSA9IGJ1aWxkV29ya2Zsb3dTdXNwZW5zaW9uTWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICBlcnIuc3RlcENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgIGVyci5ob29rQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgZXJyLndhaXRDb3VudFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3VzcGVuc2lvbk1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmRlYnVnKHN1c3BlbnNpb25NZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVhY2ggZXZlbnQgY3JlYXRpb24gaW5zaWRlIGhhbmRsZVN1c3BlbnNpb24gY2FycmllcyB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gbG9hZGVkIHNuYXBzaG90J3MgYHN0YXRlVXBkYXRlZEF0YDsgb24gYSBzdGFsZSAoNDEyKVxuICAgICAgICAgICAgICAgICAgICAvLyByZWplY3Rpb24gdGhlIGd1YXJkIHJlbG9hZHMgdGhpcyBsb2cgaW4gcGxhY2UgYW5kIHJldHJpZXMuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1c3BlbnNpb25Mb2c6IE11dGFibGVFdmVudExvZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiBldmVudHNDdXJzb3IgPz8gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdDogQXdhaXRlZDxSZXR1cm5UeXBlPHR5cGVvZiBoYW5kbGVTdXNwZW5zaW9uPj47XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgaGFuZGxlU3VzcGVuc2lvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdXNwZW5zaW9uOiBlcnIsXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bjogd29ya2Zsb3dSdW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRMb2c6IHN1c3BlbnNpb25Mb2csXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHN1c3BlbnNpb25FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBndWFyZCBleGhhdXN0ZWQgaXRzIHJlbG9hZHMgb24gYSBzdGFsZSBldmVudFxuICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0aW9uLiBTY2hlZHVsZSBhbiBleHBsaWNpdCBpbW1lZGlhdGUgcmUtaW52b2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgIC8vIChhIHJldGhyb3cgcmVsaWVzIG9uIHF1ZXVlIHJlZGVsaXZlcnkpIHNvIGEgZnJlc2hcbiAgICAgICAgICAgICAgICAgICAgICAvLyByZXBsYXkgb2JzZXJ2ZXMgdGhlIG5ld2VyIGV2ZW50LlxuICAgICAgICAgICAgICAgICAgICAgIGlmIChQcmVjb25kaXRpb25GYWlsZWRFcnJvci5pcyhzdXNwZW5zaW9uRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW50aW1lTG9nZ2VyLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdTdXNwZW5zaW9uIGV2ZW50IGNyZWF0aW9uIGV4aGF1c3RlZCBwcmVjb25kaXRpb24gcmV0cmllczsgcmUtaW52b2tpbmcgd2l0aCBhIGZyZXNoIHJlcGxheScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgd29ya2Zsb3dSdW5JZDogcnVuSWQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRpbWVvdXRTZWNvbmRzOiAwIH07XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHRocm93IHN1c3BlbnNpb25FcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQudGltZW91dFNlY29uZHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRpbWVvdXRTZWNvbmRzOiByZXN1bHQudGltZW91dFNlY29uZHMgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFN1c3BlbnNpb24gaGFuZGxlZCwgbm8gZnVydGhlciB3b3JrIG5lZWRlZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIFRyYW5zaWVudCBpbmZyYXN0cnVjdHVyZSBmYWlsdXJlcyB0YWxraW5nIHRvIHRoZVxuICAgICAgICAgICAgICAgICAgLy8gd29ybGQgKHdvcmtmbG93LXNlcnZlcikg4oCUIGFuIGV4aGF1c3RlZCBSZXRyeUFnZW50XG4gICAgICAgICAgICAgICAgICAvLyAoVU5EX0VSUl9SRVFfUkVUUlkgZnJvbSBhIHN1c3RhaW5lZCA0MjkvNTAzIHN0b3JtKSxcbiAgICAgICAgICAgICAgICAgIC8vIGEgZHJvcHBlZCBzb2NrZXQsIGEgY29ubmVjdC9ETlMgZmFpbHVyZSwgb3IgYSBjbGllbnRcbiAgICAgICAgICAgICAgICAgIC8vIHRpbWVvdXQg4oCUIG11c3QgTk9UIGZhaWwgdGhlIHJ1bi4gUmV0aHJvdyBzbyB0aGUgcXVldWVcbiAgICAgICAgICAgICAgICAgIC8vIHJlZGVsaXZlcnMgYW5kIGEgZnJlc2ggaW52b2NhdGlvbiByZXRyaWVzIHRoZSByZXBsYXlcbiAgICAgICAgICAgICAgICAgIC8vIG9uY2UgdGhlIGJhY2tlbmQgcmVjb3ZlcnMuIFRoZSBAdmVyY2VsL3F1ZXVlIGhhbmRsZXJcbiAgICAgICAgICAgICAgICAgIC8vIGFwcGxpZXMgYSBmYXN0ICgxc+KGkjYwcykgYmFja29mZiBieSBkZWxpdmVyeSBjb3VudCxcbiAgICAgICAgICAgICAgICAgIC8vIGF2b2lkaW5nIHRoZSB+NW1pbiBkZWZhdWx0IHZpc2liaWxpdHktdGltZW91dCByZWRyaXZlXG4gICAgICAgICAgICAgICAgICAvLyAoYW5kIG5ldmVyIGtpbGxpbmcgdGhlIHByb2Nlc3MgdmlhIHJ1bl9mYWlsZWQpLlxuICAgICAgICAgICAgICAgICAgaWYgKGlzUmV0cnlhYmxlV29ybGRFcnJvcihlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAnVHJhbnNpZW50IHdvcmxkIGVycm9yIGR1cmluZyByZXBsYXk7IHJlZGVsaXZlcmluZyB2aWEgcXVldWUgaW5zdGVhZCBvZiBmYWlsaW5nIHRoZSBydW4nLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTmFtZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubmFtZSA6ICdVbmtub3duRXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVyciksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxpdmVyeUF0dGVtcHQ6IG1ldGFkYXRhLmF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGxldCB0ZXJtaW5hbEVycm9yID0gZXJyO1xuICAgICAgICAgICAgICAgICAgaWYgKFJlcGxheURpdmVyZ2VuY2VFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpdmVyZ2VuY2VDb3VudCA9IChyZXBsYXlEaXZlcmdlbmNlPy5jb3VudCA/PyAwKSArIDE7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpdmVyZ2VuY2VDb3VudCA8PSBSRVBMQVlfRElWRVJHRU5DRV9NQVhfUkVUUklFUykge1xuICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICdXb3JrZmxvdyByZXBsYXkgZGl2ZXJnZWQ7IHF1ZXVlaW5nIGEgcmVjb3ZlcnkgcmVwbGF5IGJlZm9yZSBkZWNsYXJpbmcgdGhlIGV2ZW50IGxvZyBjb3JydXB0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlOiBSVU5fRVJST1JfQ09ERVMuUkVQTEFZX0RJVkVSR0VOQ0UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpdmVyZ2VuY2VFdmVudElkOiBlcnIuZXZlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpb3JEaXZlcmdlbmNlRXZlbnRJZDogcmVwbGF5RGl2ZXJnZW5jZT8uZXZlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGl2ZXJnZW5jZUNvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxpdmVyeUF0dGVtcHQ6IG1ldGFkYXRhLmF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1heFJlY292ZXJ5UmVwbGF5czogUkVQTEFZX0RJVkVSR0VOQ0VfTUFYX1JFVFJJRVMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBxdWV1ZU1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFdvcmtmbG93UXVldWVOYW1lKHdvcmtmbG93TmFtZSwgbmFtZXNwYWNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRyYWNlQ2FycmllcjogdHJhY2VDb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGF5RGl2ZXJnZW5jZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50SWQ6IGVyci5ldmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiBkaXZlcmdlbmNlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3ltZW50SWQ6IHdvcmtmbG93UnVuLmRlcGxveW1lbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlY1ZlcnNpb246XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW4uc3BlY1ZlcnNpb24gPz8gU1BFQ19WRVJTSU9OX0xFR0FDWSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRlcm1pbmFsRXJyb3IgPSBuZXcgQ29ycnVwdGVkRXZlbnRMb2dFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgV29ya2Zsb3cgcmVwbGF5IGRpdmVyZ2VkICR7ZGl2ZXJnZW5jZUNvdW50fSB0aW1lcyBhZnRlciAke1JFUExBWV9ESVZFUkdFTkNFX01BWF9SRVRSSUVTfSByZWNvdmVyeSByZXBsYXlzOyBsYXRlc3QgZGl2ZXJnZW50IGV2ZW50IHdhcyAke2Vyci5ldmVudElkfS4gTGFzdCBkaXZlcmdlbmNlOiAke2Vyci5tZXNzYWdlfWAsXG4gICAgICAgICAgICAgICAgICAgICAgeyBjYXVzZTogZXJyIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIHVzZXIgY29kZSBlcnJvciBvciBhIHRlcm1pbmFsXG4gICAgICAgICAgICAgICAgICAvLyBXb3JrZmxvd1J1bnRpbWVFcnJvci4gRmFpbCB0aGUgd29ya2Zsb3cgcnVuLlxuXG4gICAgICAgICAgICAgICAgICAvLyBSZWNvcmQgZXhjZXB0aW9uIGZvciBPVEVMIGVycm9yIHRyYWNraW5nXG4gICAgICAgICAgICAgICAgICBpZiAodGVybWluYWxFcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwYW4/LnJlY29yZEV4Y2VwdGlvbj8uKHRlcm1pbmFsRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBjb25zdCBub3JtYWxpemVkRXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBub3JtYWxpemVVbmtub3duRXJyb3IodGVybWluYWxFcnJvcik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck5hbWUgPVxuICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkRXJyb3IubmFtZSB8fCBnZXRFcnJvck5hbWUodGVybWluYWxFcnJvcik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBub3JtYWxpemVkRXJyb3IubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgIGxldCBlcnJvclN0YWNrID1cbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZEVycm9yLnN0YWNrIHx8IGdldEVycm9yU3RhY2sodGVybWluYWxFcnJvcik7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFJlbWFwIGVycm9yIHN0YWNrIHVzaW5nIHNvdXJjZSBtYXBzIHRvIHNob3cgb3JpZ2luYWwgc291cmNlIGxvY2F0aW9uc1xuICAgICAgICAgICAgICAgICAgaWYgKGVycm9yU3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkTmFtZSA9IHBhcnNlV29ya2Zsb3dOYW1lKHdvcmtmbG93TmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVuYW1lID1cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZWROYW1lPy5tb2R1bGVTcGVjaWZpZXIgfHwgd29ya2Zsb3dOYW1lO1xuICAgICAgICAgICAgICAgICAgICBlcnJvclN0YWNrID0gcmVtYXBFcnJvclN0YWNrKFxuICAgICAgICAgICAgICAgICAgICAgIGVycm9yU3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dDb2RlXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIENsYXNzaWZ5IHRoZSBlcnJvcjogV29ya2Zsb3dSdW50aW1lRXJyb3IgaW5kaWNhdGVzXG4gICAgICAgICAgICAgICAgICAvLyBhbiBTREsvcnVudGltZSBpc3N1ZSwgYW5kIHNlbGVjdGVkIHN1YmNsYXNzZXMgdXNlXG4gICAgICAgICAgICAgICAgICAvLyBtb3JlIHNwZWNpZmljIGNvZGVzIGZvciBiYWNrZW5kIHRyYWNraW5nLlxuICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gY2xhc3NpZnlSdW5FcnJvcih0ZXJtaW5hbEVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgcnVubmluZyB3b3JrZmxvdycsIHtcbiAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dSdW5JZDogcnVuSWQsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JOYW1lLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclN0YWNrLFxuICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgIC8vIEZhaWwgdGhlIHdvcmtmbG93IHJ1biB2aWEgZXZlbnQgKGV2ZW50LXNvdXJjZWQgYXJjaGl0ZWN0dXJlKVxuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgd29ybGQuZXZlbnRzLmNyZWF0ZShcbiAgICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6ICdydW5fZmFpbGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogZXJyb3JTdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdElkIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGZhaWxFcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgIEVudGl0eUNvbmZsaWN0RXJyb3IuaXMoZmFpbEVycikgfHxcbiAgICAgICAgICAgICAgICAgICAgICBSdW5FeHBpcmVkRXJyb3IuaXMoZmFpbEVycilcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1RyaWVkIGZhaWxpbmcgd29ya2Zsb3cgcnVuLCBidXQgcnVuIGhhcyBhbHJlYWR5IGZpbmlzaGVkLicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBmYWlsRXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yQ29kZShlcnJvckNvZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JOYW1lKGVycm9yTmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvck1lc3NhZ2UoZXJyb3JNZXNzYWdlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5FcnJvclR5cGUoZXJyb3JOYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzV29ybGRDb250cmFjdEVycm9yKGZhaWxFcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcnVudGltZUxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICdGYXRhbCB3b3JsZCBjb250cmFjdCBlcnJvciB3aGlsZSByZWNvcmRpbmcgd29ya2Zsb3cgZmFpbHVyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IHJ1bklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IFJVTl9FUlJPUl9DT0RFUy5XT1JMRF9DT05UUkFDVF9FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbEVyciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZhaWxFcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBTdHJpbmcoZmFpbEVyciksXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZmFpbEVycjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1blN0YXR1cygnZmFpbGVkJyksXG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0Vycm9yQ29kZShlcnJvckNvZGUpLFxuICAgICAgICAgICAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dFcnJvck5hbWUoZXJyb3JOYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXJyb3JNZXNzYWdlKGVycm9yTWVzc2FnZSksXG4gICAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5FcnJvclR5cGUoZXJyb3JOYW1lKSxcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIC0tLSBJbmZyYXN0cnVjdHVyZTogY29tcGxldGUgdGhlIHJ1biAtLS1cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIG91dHNpZGUgdGhlIHVzZXItY29kZSB0cnkvY2F0Y2ggc28gdGhhdCBmYWlsdXJlc1xuICAgICAgICAgICAgICAgIC8vIGhlcmUgKGUuZy4sIG5ldHdvcmsgZXJyb3JzKSBwcm9wYWdhdGUgdG8gdGhlIHF1ZXVlIGhhbmRsZXIuXG4gICAgICAgICAgICAgICAgLy8gcnVuX2NvbXBsZXRlZCBjYXJyaWVzIHRoZSBsb2FkZWQgc25hcHNob3QncyBgc3RhdGVVcGRhdGVkQXRgLFxuICAgICAgICAgICAgICAgIC8vIGJ1dCBpcyBpbnRlbnRpb25hbGx5IE5PVCByZXRyaWVkIGluIHBsYWNlIChub1xuICAgICAgICAgICAgICAgIC8vIHdpdGhQcmVjb25kaXRpb25SZXRyeSkgb24gYSBzdGFsZSAoNDEyKSByZWplY3Rpb246IGByZXN1bHRgXG4gICAgICAgICAgICAgICAgLy8gd2FzIGNvbXB1dGVkIGJ5IHRoaXMgcmVwbGF5LCBzbyBhIG5ld2VyIG91dC1vZi1iYW5kIGV2ZW50XG4gICAgICAgICAgICAgICAgLy8gbGFuZGluZyBhZnRlciB0aGUgc25hcHNob3QgbXVzdCBmb3JjZSBhICpmcmVzaCByZXBsYXkqXG4gICAgICAgICAgICAgICAgLy8gKHdoaWNoIG1heSBvYnNlcnZlIGl0IGFuZCBwcm9kdWNlIGEgZGlmZmVyZW50IHJlc3VsdCksIG5vdFxuICAgICAgICAgICAgICAgIC8vIHJlLWNvbW1pdCB0aGUgc3RhbGUgcmVzdWx0LiBPbiA0MTIgdGhlIGNhdGNoIGJlbG93IHNjaGVkdWxlc1xuICAgICAgICAgICAgICAgIC8vIGFuIGV4cGxpY2l0IGltbWVkaWF0ZSByZS1pbnZvY2F0aW9uIGluc3RlYWQuXG4gICAgICAgICAgICAgICAgLy8gKHJ1bl9mYWlsZWQgaXMgZGVsaWJlcmF0ZWx5IGxlZnQgdW5ndWFyZGVkIGFuZCBmYWlscyBvcGVuOlxuICAgICAgICAgICAgICAgIC8vIGEgc3B1cmlvdXMgcmUtcnVuIGlzIHNhZmUsIGEgc3B1cmlvdXMgY29tcGxldGlvbiBpcyBub3QsIGFuZFxuICAgICAgICAgICAgICAgIC8vIHRoZSBsb2FkZWQgZXZlbnQgbG9nIGlzIG5vdCBpbiBzY29wZSBvbiB0aGF0IGNhdGNoIHBhdGguKVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBhd2FpdCB3b3JsZC5ldmVudHMuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogJ3J1bl9jb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogd29ya2Zsb3dSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgICAgICAgICAgICBzdGF0ZVVwZGF0ZWRBdDogc3RhdGVVcGRhdGVkQXRGb3JDcmVhdGUoZXZlbnRzKSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChQcmVjb25kaXRpb25GYWlsZWRFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgICAncnVuX2NvbXBsZXRlZCByZWplY3RlZCBhcyBzdGFsZTsgcmUtaW52b2tpbmcgd2l0aCBhIGZyZXNoIHJlcGxheScsXG4gICAgICAgICAgICAgICAgICAgICAgeyB3b3JrZmxvd1J1bklkOiBydW5JZCB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRpbWVvdXRTZWNvbmRzOiAwIH07XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoRW50aXR5Q29uZmxpY3RFcnJvci5pcyhlcnIpIHx8IFJ1bkV4cGlyZWRFcnJvci5pcyhlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVMb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgICAnVHJpZWQgY29tcGxldGluZyB3b3JrZmxvdyBydW4sIGJ1dCBydW4gaGFzIGFscmVhZHkgZmluaXNoZWQuJyxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd1J1bklkOiBydW5JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93UnVuU3RhdHVzKCdjb21wbGV0ZWQnKSxcbiAgICAgICAgICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0V2ZW50c0NvdW50KGV2ZW50cy5sZW5ndGgpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApOyAvLyBFbmQgdHJhY2VcbiAgICAgICAgICB9XG4gICAgICAgICk7IC8vIEVuZCB3aXRoV29ya2Zsb3dCYWdnYWdlXG4gICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgaWYgKHJlcGxheVRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQocmVwbGF5VGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgIH0pOyAvLyBFbmQgd2l0aFRyYWNlQ29udGV4dFxuICAgIH1cbiAgKTtcblxuICByZXR1cm4gd2l0aEhlYWx0aENoZWNrKGhhbmRsZXIsIHdvcmxkU3BlY1ZlcnNpb24pO1xufVxuXG4vLyB0aGlzIGlzIGEgbm8tb3AgcGxhY2Vob2xkZXIgYXMgdGhlIGNsaWVudCBpc1xuLy8gZXhwZWN0aW5nIHRoaXMgdG8gYmUgcHJlc2VudCBidXQgd2UgYXJlbid0IGFjdHVhbGx5IHVzaW5nIGl0XG5leHBvcnQgZnVuY3Rpb24gcnVuU3RlcCgpIHt9XG4iLCAiaW1wb3J0IHtcbiAgRVJST1JfU0xVR1MsXG4gIFJlcGxheURpdmVyZ2VuY2VFcnJvcixcbiAgV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3IsXG4gIFdvcmtmbG93UnVudGltZUVycm9yLFxufSBmcm9tICdAd29ya2Zsb3cvZXJyb3JzJztcbmltcG9ydCB7IGNyZWF0ZVdvcmtmbG93QmFzZVVybCwgd2l0aFJlc29sdmVycyB9IGZyb20gJ0B3b3JrZmxvdy91dGlscyc7XG5pbXBvcnQgeyBwYXJzZVdvcmtmbG93TmFtZSB9IGZyb20gJ0B3b3JrZmxvdy91dGlscy9wYXJzZS1uYW1lJztcbmltcG9ydCB0eXBlIHsgRXZlbnQsIFdvcmtmbG93UnVuIH0gZnJvbSAnQHdvcmtmbG93L3dvcmxkJztcbmltcG9ydCAqIGFzIG5hbm9pZCBmcm9tICduYW5vaWQnO1xuaW1wb3J0IHsgbW9ub3RvbmljRmFjdG9yeSB9IGZyb20gJ3VsaWQnO1xuaW1wb3J0IHR5cGUgeyBDcnlwdG9LZXkgfSBmcm9tICcuL2VuY3J5cHRpb24uanMnO1xuaW1wb3J0IHsgRXZlbnRDb25zdW1lclJlc3VsdCwgRXZlbnRzQ29uc3VtZXIgfSBmcm9tICcuL2V2ZW50cy1jb25zdW1lci5qcyc7XG5pbXBvcnQgdHlwZSB7IFF1ZXVlSXRlbSB9IGZyb20gJy4vZ2xvYmFsLmpzJztcbmltcG9ydCB7IEVOT1RTVVAsIFdvcmtmbG93U3VzcGVuc2lvbiB9IGZyb20gJy4vZ2xvYmFsLmpzJztcbmltcG9ydCB7IHJ1bnRpbWVMb2dnZXIgfSBmcm9tICcuL2xvZ2dlci5qcyc7XG5pbXBvcnQgdHlwZSB7IFdvcmtmbG93T3JjaGVzdHJhdG9yQ29udGV4dCB9IGZyb20gJy4vcHJpdmF0ZS5qcyc7XG5pbXBvcnQgeyBnZXRQb3J0TGF6eSB9IGZyb20gJy4vcnVudGltZS9nZXQtcG9ydC1sYXp5LmpzJztcbmltcG9ydCB7XG4gIGRlaHlkcmF0ZVdvcmtmbG93UmV0dXJuVmFsdWUsXG4gIGh5ZHJhdGVXb3JrZmxvd0FyZ3VtZW50cyxcbn0gZnJvbSAnLi9zZXJpYWxpemF0aW9uLmpzJztcbmltcG9ydCB7IGNyZWF0ZVVzZVN0ZXAgfSBmcm9tICcuL3N0ZXAuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGVwSHlkcmF0aW9uQ2FjaGUgfSBmcm9tICcuL3N0ZXAtaHlkcmF0aW9uLWNhY2hlLmpzJztcbmltcG9ydCB7XG4gIEJPRFlfSU5JVF9TWU1CT0wsXG4gIFNUQUJMRV9VTElELFxuICBXT1JLRkxPV19DUkVBVEVfSE9PSyxcbiAgV09SS0ZMT1dfR0VUX1NUUkVBTV9JRCxcbiAgV09SS0ZMT1dfU0xFRVAsXG4gIFdPUktGTE9XX1VTRV9TVEVQLFxufSBmcm9tICcuL3N5bWJvbHMuanMnO1xuaW1wb3J0ICogYXMgQXR0cmlidXRlIGZyb20gJy4vdGVsZW1ldHJ5L3NlbWFudGljLWNvbnZlbnRpb25zLmpzJztcbmltcG9ydCB7IHRyYWNlIH0gZnJvbSAnLi90ZWxlbWV0cnkuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2Zsb3dSdW5TdHJlYW1JZCB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVDb250ZXh0IH0gZnJvbSAnLi92bS9pbmRleC5qcyc7XG5pbXBvcnQgeyBydW5DYWNoZWRXb3JrZmxvd1NjcmlwdCB9IGZyb20gJy4vdm0vc2NyaXB0LWNhY2hlLmpzJztcbmltcG9ydCB0eXBlIHsgV29ya2Zsb3dNZXRhZGF0YSB9IGZyb20gJy4vd29ya2Zsb3cvZ2V0LXdvcmtmbG93LW1ldGFkYXRhLmpzJztcbmltcG9ydCB7IFdPUktGTE9XX0NPTlRFWFRfU1lNQk9MIH0gZnJvbSAnLi93b3JrZmxvdy9nZXQtd29ya2Zsb3ctbWV0YWRhdGEuanMnO1xuaW1wb3J0IHsgY3JlYXRlQ3JlYXRlSG9vayB9IGZyb20gJy4vd29ya2Zsb3cvaG9vay5qcyc7XG5pbXBvcnQgeyBjcmVhdGVTbGVlcCB9IGZyb20gJy4vd29ya2Zsb3cvc2xlZXAuanMnO1xuXG4vKipcbiAqIExvZ3MgYSB3YXJuaW5nIHdoZW4gYSB3b3JrZmxvdyBydW4gY29tcGxldGVzIG9yIGZhaWxzIHdpdGggdW5jb21taXR0ZWRcbiAqIG9wZXJhdGlvbnMgc3RpbGwgaW4gdGhlIGludm9jYXRpb25zIHF1ZXVlLiBUaGlzIHR5cGljYWxseSBpbmRpY2F0ZXMgdGhlXG4gKiB1c2VyIGZvcmdvdCB0byBgYXdhaXRgIGEgc3RlcCwgaG9vaywgb3Igc2xlZXAgY2FsbC5cbiAqL1xuZnVuY3Rpb24gd2FyblBlbmRpbmdRdWV1ZUl0ZW1zKFxuICBydW5JZDogc3RyaW5nLFxuICBwZW5kaW5nUXVldWU6IE1hcDxzdHJpbmcsIFF1ZXVlSXRlbT4sXG4gIG91dGNvbWU6ICdjb21wbGV0ZWQnIHwgJ2ZhaWxlZCdcbik6IHZvaWQge1xuICAvLyBGaWx0ZXIgb3V0IGhvb2tzIHRoYXQgYXJlIGVpdGhlciBhbHJlYWR5IGNyZWF0ZWQgKGFsaXZlLCB3YWl0aW5nIGZvciBwYXlsb2FkcylcbiAgLy8gb3IgZXhwbGljaXRseSBkaXNwb3NlZCDigJQgYm90aCBhcmUgYmVuaWduIHNpbmNlIHRoZSBiYWNrZW5kIGF1dG8tZGlzcG9zZXNcbiAgLy8gYWxsIGhvb2tzIHdoZW4gYSBydW4gcmVhY2hlcyBhIHRlcm1pbmFsIHN0YXRlXG4gIGNvbnN0IGl0ZW1zID0gWy4uLnBlbmRpbmdRdWV1ZS52YWx1ZXMoKV0uZmlsdGVyKFxuICAgIChpdGVtKSA9PiAhKGl0ZW0udHlwZSA9PT0gJ2hvb2snICYmIChpdGVtLmhhc0NyZWF0ZWRFdmVudCB8fCBpdGVtLmRpc3Bvc2VkKSlcbiAgKTtcbiAgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gIGNvbnN0IGRldGFpbHMgPSBpdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICBzd2l0Y2ggKGl0ZW0udHlwZSkge1xuICAgICAgY2FzZSAnc3RlcCc6XG4gICAgICAgIHJldHVybiBgc3RlcCBcIiR7aXRlbS5zdGVwTmFtZX1cImA7XG4gICAgICBjYXNlICdob29rJzpcbiAgICAgICAgcmV0dXJuIGBob29rIFwiJHtpdGVtLnRva2VufVwiYDtcbiAgICAgIGNhc2UgJ3dhaXQnOlxuICAgICAgICByZXR1cm4gJ3NsZWVwJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBgdW5rbm93biAoJHsoaXRlbSBhcyB7IHR5cGU6IHN0cmluZyB9KS50eXBlfSlgO1xuICAgIH1cbiAgfSk7XG5cbiAgcnVudGltZUxvZ2dlci53YXJuKFxuICAgIGBXb3JrZmxvdyBydW4gJHtvdXRjb21lfSB3aXRoICR7aXRlbXMubGVuZ3RofSB1bmNvbW1pdHRlZCBvcGVyYXRpb24ocyk6ICR7ZGV0YWlscy5qb2luKCcsICcpfS4gYCArXG4gICAgICAnRGlkIHlvdSBmb3JnZXQgdG8gYGF3YWl0YCBhIHN0ZXAsIGhvb2ssIG9yIHNsZWVwIGNhbGw/JyxcbiAgICB7IHdvcmtmbG93UnVuSWQ6IHJ1bklkIH1cbiAgKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bldvcmtmbG93KFxuICB3b3JrZmxvd0NvZGU6IHN0cmluZyxcbiAgd29ya2Zsb3dSdW46IFdvcmtmbG93UnVuLFxuICBldmVudHM6IEV2ZW50W10sXG4gIGVuY3J5cHRpb25LZXk6IENyeXB0b0tleSB8IHVuZGVmaW5lZCxcbiAgLyoqXG4gICAqIE9wdGlvbmFsIHBlci1ydW4gY2FjaGUgZm9yIGh5ZHJhdGVkIHN0ZXAgcmV0dXJuIHZhbHVlcywgb3duZWQgYnkgdGhlIGlubGluZVxuICAgKiByZXBsYXkgbG9vcCBzbyBpdCBzdXJ2aXZlcyBhY3Jvc3MgdGhlIGxvb3AncyBpdGVyYXRpb25zIChlYWNoIG9mIHdoaWNoXG4gICAqIGNyZWF0ZXMgYSBmcmVzaCBjb250ZXh0KS4gTWVtb2l6ZXMgdGhlIGRlY3J5cHQgKyBkZXZhbHVlLXBhcnNlIG9mIGNvbXBsZXRlZFxuICAgKiBzdGVwIHJlc3VsdHMgdG8gdHVybiBPKE7CsikgcmVwbGF5IGh5ZHJhdGlvbiBpbnRvIE8oTikuIE9taXR0ZWQgYnkgY2FsbGVyc1xuICAgKiB0aGF0IHJlcGxheSBvbmx5IG9uY2UgKHRoZW4gdGhlcmUgaXMgbm90aGluZyB0byByZXVzZSkuXG4gICAqL1xuICBzdGVwSHlkcmF0aW9uQ2FjaGU/OiBTdGVwSHlkcmF0aW9uQ2FjaGVcbik6IFByb21pc2U8VWludDhBcnJheSB8IHVua25vd24+IHtcbiAgcmV0dXJuIHRyYWNlKGB3b3JrZmxvdy5ydW4gJHt3b3JrZmxvd1J1bi53b3JrZmxvd05hbWV9YCwgYXN5bmMgKHNwYW4pID0+IHtcbiAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd05hbWUod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKSxcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1bklkKHdvcmtmbG93UnVuLnJ1bklkKSxcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1J1blN0YXR1cyh3b3JrZmxvd1J1bi5zdGF0dXMpLFxuICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93RXZlbnRzQ291bnQoZXZlbnRzLmxlbmd0aCksXG4gICAgfSk7XG5cbiAgICBjb25zdCBzdGFydGVkQXQgPSB3b3JrZmxvd1J1bi5zdGFydGVkQXQ7XG4gICAgaWYgKCFzdGFydGVkQXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFdvcmtmbG93IHJ1biBcIiR7d29ya2Zsb3dSdW4ucnVuSWR9XCIgaGFzIG5vIFwic3RhcnRlZEF0XCIgdGltZXN0YW1wIChzaG91bGQgbm90IGhhcHBlbilgXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgcG9ydCBiZWZvcmUgY3JlYXRpbmcgVk0gY29udGV4dCB0byBhdm9pZCBhc3luYyBvcGVyYXRpb25zXG4gICAgLy8gYWZmZWN0aW5nIHRoZSBkZXRlcm1pbmlzdGljIHRpbWVzdGFtcFxuICAgIGNvbnN0IGlzVmVyY2VsID0gcHJvY2Vzcy5lbnYuVkVSQ0VMX1VSTCAhPT0gdW5kZWZpbmVkO1xuICAgIC8vIExvYWQgZ2V0UG9ydCBsYXppbHkgdG8gcHJldmVudCBUdXJib3BhY2sgZnJvbSB0cmFjaW5nIGdldC1wb3J0J3NcbiAgICAvLyBmcyBvcHMgKHJlYWRkaXIsIHJlYWRGaWxlKSBpbnRvIHRoZSBmbG93IHJvdXRlIGJ1bmRsZS4gVGhlIHJlc29sdmVkXG4gICAgLy8gcG9ydCBpcyBjYWNoZWQgcGVyIHByb2Nlc3MgKHNlZSBnZXQtcG9ydC1sYXp5LnRzKSwgc28gdGhpcyBpcyBjaGVhcFxuICAgIC8vIG9uIHJlcGxheXMgYWZ0ZXIgdGhlIGZpcnN0IOKAlCBgZ2V0UG9ydCgpYCBvdGhlcndpc2UgcmUtcnVucyBPUyBwb3J0XG4gICAgLy8gZGlzY292ZXJ5IChzcGF3bmluZyBgbHNvZmAgb24gbWFjT1MsIH42MG1zKSBvbiBldmVyeSByZXBsYXkuXG4gICAgY29uc3Qgd29ya2Zsb3dCYXNlVXJsID0gY3JlYXRlV29ya2Zsb3dCYXNlVXJsKFxuICAgICAgaXNWZXJjZWxcbiAgICAgICAgPyBgaHR0cHM6Ly8ke3Byb2Nlc3MuZW52LlZFUkNFTF9VUkx9YFxuICAgICAgICA6IGBodHRwOi8vbG9jYWxob3N0OiR7KGF3YWl0IGdldFBvcnRMYXp5KCkpID8/IDMwMDB9YFxuICAgICk7XG5cbiAgICBjb25zdCB7XG4gICAgICBjb250ZXh0LFxuICAgICAgZ2xvYmFsVGhpczogdm1HbG9iYWxUaGlzLFxuICAgICAgdXBkYXRlVGltZXN0YW1wLFxuICAgIH0gPSBjcmVhdGVDb250ZXh0KHtcbiAgICAgIHNlZWQ6IGAke3dvcmtmbG93UnVuLnJ1bklkfToke3dvcmtmbG93UnVuLndvcmtmbG93TmFtZX06JHsrc3RhcnRlZEF0fWAsXG4gICAgICBmaXhlZFRpbWVzdGFtcDogK3N0YXJ0ZWRBdCxcbiAgICB9KTtcblxuICAgIGNvbnN0IHdvcmtmbG93RGlzY29udGludWF0aW9uID0gd2l0aFJlc29sdmVyczx2b2lkPigpO1xuXG4gICAgY29uc3QgdWxpZCA9IG1vbm90b25pY0ZhY3RvcnkoKCkgPT4gdm1HbG9iYWxUaGlzLk1hdGgucmFuZG9tKCkpO1xuICAgIGNvbnN0IGdlbmVyYXRlTmFub2lkID0gbmFub2lkLmN1c3RvbVJhbmRvbShuYW5vaWQudXJsQWxwaGFiZXQsIDIxLCAoc2l6ZSkgPT5cbiAgICAgIG5ldyBVaW50OEFycmF5KHNpemUpLm1hcCgoKSA9PiAyNTYgKiB2bUdsb2JhbFRoaXMuTWF0aC5yYW5kb20oKSlcbiAgICApO1xuXG4gICAgLy8gQ3JlYXRlIGEgbXV0YWJsZSBob2xkZXIgZm9yIHRoZSBwcm9taXNlIHF1ZXVlIHNvIHRoZSBFdmVudHNDb25zdW1lclxuICAgIC8vIGNhbiBhY2Nlc3MgdGhlIGN1cnJlbnQgcXVldWUgc3RhdGUgdmlhIGEgZ2V0dGVyLiBUaGUgcXVldWUgaXMgbXV0YXRlZFxuICAgIC8vIGJ5IHN0ZXAvaG9vay9zbGVlcCBjYWxsYmFja3MgYXMgZXZlbnRzIGFyZSBwcm9jZXNzZWQuXG4gICAgY29uc3QgcHJvbWlzZVF1ZXVlSG9sZGVyID0geyBjdXJyZW50OiBQcm9taXNlLnJlc29sdmUoKSB9O1xuXG4gICAgY29uc3QgZXZlbnRzQ29uc3VtZXIgPSBuZXcgRXZlbnRzQ29uc3VtZXIoZXZlbnRzLCB7XG4gICAgICBvbkNvbnN1bWVkRXZlbnQ6IChldmVudCkgPT4ge1xuICAgICAgICB1cGRhdGVUaW1lc3RhbXAoK2V2ZW50LmNyZWF0ZWRBdCk7XG4gICAgICB9LFxuICAgICAgb25VbmNvbnN1bWVkRXZlbnQ6IChldmVudCkgPT4ge1xuICAgICAgICB3b3JrZmxvd0Rpc2NvbnRpbnVhdGlvbi5yZWplY3QoXG4gICAgICAgICAgbmV3IFJlcGxheURpdmVyZ2VuY2VFcnJvcihcbiAgICAgICAgICAgIGBSZXBsYXkgY291bGQgbm90IGNvbnN1bWUgZXZlbnQ6IGV2ZW50VHlwZT0ke2V2ZW50LmV2ZW50VHlwZX0sIGNvcnJlbGF0aW9uSWQ9JHtldmVudC5jb3JyZWxhdGlvbklkfSwgZXZlbnRJZD0ke2V2ZW50LmV2ZW50SWR9LmAsXG4gICAgICAgICAgICB7IGV2ZW50SWQ6IGV2ZW50LmV2ZW50SWQgfVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBnZXRQcm9taXNlUXVldWU6ICgpID0+IHByb21pc2VRdWV1ZUhvbGRlci5jdXJyZW50LFxuICAgIH0pO1xuXG4gICAgY29uc3Qgd29ya2Zsb3dDb250ZXh0OiBXb3JrZmxvd09yY2hlc3RyYXRvckNvbnRleHQgPSB7XG4gICAgICBydW5JZDogd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICBlbmNyeXB0aW9uS2V5LFxuICAgICAgZ2xvYmFsVGhpczogdm1HbG9iYWxUaGlzLFxuICAgICAgb25Xb3JrZmxvd0Vycm9yOiB3b3JrZmxvd0Rpc2NvbnRpbnVhdGlvbi5yZWplY3QsXG4gICAgICBldmVudHNDb25zdW1lcixcbiAgICAgIGdlbmVyYXRlVWxpZDogKCkgPT4gdWxpZCgrc3RhcnRlZEF0KSxcbiAgICAgIGdlbmVyYXRlTmFub2lkLFxuICAgICAgaW52b2NhdGlvbnNRdWV1ZTogbmV3IE1hcCgpLFxuICAgICAgLy8gVXNlIGdldHRlci9zZXR0ZXIgc28gdGhlIEV2ZW50c0NvbnN1bWVyJ3MgZ2V0UHJvbWlzZVF1ZXVlKCkgYWx3YXlzXG4gICAgICAvLyBzZWVzIHRoZSBsYXRlc3QgcXVldWUgc3RhdGUgYXMgaXQncyBtdXRhdGVkIGJ5IHN0ZXAvaG9vay9zbGVlcCBjYWxsYmFja3MuXG4gICAgICBnZXQgcHJvbWlzZVF1ZXVlKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZVF1ZXVlSG9sZGVyLmN1cnJlbnQ7XG4gICAgICB9LFxuICAgICAgc2V0IHByb21pc2VRdWV1ZSh2YWx1ZTogUHJvbWlzZTx2b2lkPikge1xuICAgICAgICBwcm9taXNlUXVldWVIb2xkZXIuY3VycmVudCA9IHZhbHVlO1xuICAgICAgfSxcbiAgICAgIHBlbmRpbmdEZWxpdmVyaWVzOiAwLFxuICAgICAgcGVuZGluZ0RlbGl2ZXJ5QmFycmllcnM6IG5ldyBNYXAoKSxcbiAgICAgIHN0ZXBIeWRyYXRpb25DYWNoZSxcbiAgICB9O1xuXG4gICAgLy8gQ29uc3VtZSBydW4gbGlmZWN5Y2xlIGV2ZW50cyAtIHRoZXNlIGFyZSBzdHJ1Y3R1cmFsIGV2ZW50cyB0aGF0IGRvbid0XG4gICAgLy8gbmVlZCBzcGVjaWFsIGhhbmRsaW5nIGluIHRoZSB3b3JrZmxvdywgYnV0IG11c3QgYmUgY29uc3VtZWQgdG8gYWR2YW5jZVxuICAgIC8vIHBhc3QgdGhlbSBpbiB0aGUgZXZlbnQgbG9nXG4gICAgd29ya2Zsb3dDb250ZXh0LmV2ZW50c0NvbnN1bWVyLnN1YnNjcmliZSgoZXZlbnQpID0+IHtcbiAgICAgIGlmICghZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIEV2ZW50Q29uc3VtZXJSZXN1bHQuTm90Q29uc3VtZWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnN1bWUgcnVuX2NyZWF0ZWQgLSBldmVyeSBydW4gaGFzIGV4YWN0bHkgb25lXG4gICAgICBpZiAoZXZlbnQuZXZlbnRUeXBlID09PSAncnVuX2NyZWF0ZWQnKSB7XG4gICAgICAgIHJldHVybiBFdmVudENvbnN1bWVyUmVzdWx0LkNvbnN1bWVkO1xuICAgICAgfVxuXG4gICAgICAvLyBDb25zdW1lIHJ1bl9zdGFydGVkIC0gZXZlcnkgcnVuIGhhcyBleGFjdGx5IG9uZVxuICAgICAgaWYgKGV2ZW50LmV2ZW50VHlwZSA9PT0gJ3J1bl9zdGFydGVkJykge1xuICAgICAgICByZXR1cm4gRXZlbnRDb25zdW1lclJlc3VsdC5Db25zdW1lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIEV2ZW50Q29uc3VtZXJSZXN1bHQuTm90Q29uc3VtZWQ7XG4gICAgfSk7XG5cbiAgICBjb25zdCB1c2VTdGVwID0gY3JlYXRlVXNlU3RlcCh3b3JrZmxvd0NvbnRleHQpO1xuICAgIGNvbnN0IGNyZWF0ZUhvb2sgPSBjcmVhdGVDcmVhdGVIb29rKHdvcmtmbG93Q29udGV4dCk7XG4gICAgY29uc3Qgc2xlZXAgPSBjcmVhdGVTbGVlcCh3b3JrZmxvd0NvbnRleHQpO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX1VTRV9TVEVQXSA9IHVzZVN0ZXA7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX0NSRUFURV9IT09LXSA9IGNyZWF0ZUhvb2s7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGBAdHlwZXMvbm9kZWAgc2F5cyBzeW1ib2wgaXMgbm90IHZhbGlkLCBidXQgaXQgZG9lcyB3b3JrXG4gICAgdm1HbG9iYWxUaGlzW1dPUktGTE9XX1NMRUVQXSA9IHNsZWVwO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tXT1JLRkxPV19HRVRfU1RSRUFNX0lEXSA9IChuYW1lc3BhY2U/OiBzdHJpbmcpID0+XG4gICAgICBnZXRXb3JrZmxvd1J1blN0cmVhbUlkKHdvcmtmbG93UnVuLnJ1bklkLCBuYW1lc3BhY2UpO1xuXG4gICAgLy8gRm9yIHRoZSB3b3JrZmxvdyBWTSwgd2Ugc3RvcmUgdGhlIGNvbnRleHQgaW4gYSBzeW1ib2wgb24gdGhlIGBnbG9iYWxUaGlzYCBvYmplY3RcbiAgICBjb25zdCBjdHg6IFdvcmtmbG93TWV0YWRhdGEgPSB7XG4gICAgICB3b3JrZmxvd05hbWU6IHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSxcbiAgICAgIHdvcmtmbG93UnVuSWQ6IHdvcmtmbG93UnVuLnJ1bklkLFxuICAgICAgd29ya2Zsb3dTdGFydGVkQXQ6IG5ldyB2bUdsb2JhbFRoaXMuRGF0ZSgrc3RhcnRlZEF0KSxcbiAgICAgIHVybDogd29ya2Zsb3dCYXNlVXJsLFxuICAgIH07XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbV09SS0ZMT1dfQ09OVEVYVF9TWU1CT0xdID0gY3R4O1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBgQHR5cGVzL25vZGVgIHNheXMgc3ltYm9sIGlzIG5vdCB2YWxpZCwgYnV0IGl0IGRvZXMgd29ya1xuICAgIHZtR2xvYmFsVGhpc1tTVEFCTEVfVUxJRF0gPSB1bGlkO1xuXG4gICAgLy8gTk9URTogV2lsbCBoYXZlIGEgY29uZmlnIG92ZXJyaWRlIHRvIHVzZSB0aGUgY3VzdG9tIGZldGNoIHN0ZXAuXG4gICAgLy8gICAgICAgRm9yIG5vdyBgZmV0Y2hgIG11c3QgYmUgZXhwbGljaXRseSBpbXBvcnRlZCBmcm9tIGB3b3JrZmxvd2AuXG4gICAgdm1HbG9iYWxUaGlzLmZldGNoID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IHZtR2xvYmFsVGhpcy5FcnJvcihcbiAgICAgICAgYEdsb2JhbCBcImZldGNoXCIgaXMgdW5hdmFpbGFibGUgaW4gd29ya2Zsb3cgZnVuY3Rpb25zLiBVc2UgdGhlIFwiZmV0Y2hcIiBzdGVwIGZ1bmN0aW9uIGZyb20gXCJ3b3JrZmxvd1wiIHRvIG1ha2UgSFRUUCByZXF1ZXN0cy5cXG5cXG5MZWFybiBtb3JlOiBodHRwczovL3VzZXdvcmtmbG93LmRldi9lcnIvJHtFUlJPUl9TTFVHUy5GRVRDSF9JTl9XT1JLRkxPV19GVU5DVElPTn1gXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyBPdmVycmlkZSB0aW1lb3V0L2ludGVydmFsIGZ1bmN0aW9ucyB0byB0aHJvdyBoZWxwZnVsIGVycm9yc1xuICAgIC8vIFRoZXNlIGFyZSBub3Qgc3VwcG9ydGVkIGluIHdvcmtmbG93IGZ1bmN0aW9ucyBiZWNhdXNlIHRoZXkgcmVseSBvblxuICAgIC8vIGFzeW5jaHJvbm91cyBzY2hlZHVsaW5nIHdoaWNoIGJyZWFrcyBkZXRlcm1pbmlzdGljIHJlcGxheVxuICAgIGNvbnN0IHRpbWVvdXRFcnJvck1lc3NhZ2UgPVxuICAgICAgJ1RpbWVvdXQgZnVuY3Rpb25zIGxpa2UgXCJzZXRUaW1lb3V0XCIgYW5kIFwic2V0SW50ZXJ2YWxcIiBhcmUgbm90IHN1cHBvcnRlZCBpbiB3b3JrZmxvdyBmdW5jdGlvbnMuIFVzZSB0aGUgXCJzbGVlcFwiIGZ1bmN0aW9uIGZyb20gXCJ3b3JrZmxvd1wiIGZvciB0aW1lLWJhc2VkIGRlbGF5cy4nO1xuXG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLnNldFRpbWVvdXQgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLnNldEludGVydmFsID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IFdvcmtmbG93UnVudGltZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuVElNRU9VVF9GVU5DVElPTlNfSU5fV09SS0ZMT1csXG4gICAgICB9KTtcbiAgICB9O1xuICAgICh2bUdsb2JhbFRoaXMgYXMgYW55KS5jbGVhclRpbWVvdXQgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLmNsZWFySW50ZXJ2YWwgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgKHZtR2xvYmFsVGhpcyBhcyBhbnkpLnNldEltbWVkaWF0ZSA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XLFxuICAgICAgfSk7XG4gICAgfTtcbiAgICAodm1HbG9iYWxUaGlzIGFzIGFueSkuY2xlYXJJbW1lZGlhdGUgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwge1xuICAgICAgICBzbHVnOiBFUlJPUl9TTFVHUy5USU1FT1VUX0ZVTkNUSU9OU19JTl9XT1JLRkxPVyxcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBgUmVxdWVzdGAgYW5kIGBSZXNwb25zZWAgYXJlIHNwZWNpYWwgYnVpbHQtaW4gY2xhc3NlcyB0aGF0IGludm9rZSBzdGVwc1xuICAgIC8vIGZvciB0aGUgYGpzb24oKWAsIGB0ZXh0KClgIGFuZCBgYXJyYXlCdWZmZXIoKWAgaW5zdGFuY2UgbWV0aG9kc1xuICAgIGNsYXNzIFJlcXVlc3QgaW1wbGVtZW50cyBnbG9iYWxUaGlzLlJlcXVlc3Qge1xuICAgICAgY2FjaGUhOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ2NhY2hlJ107XG4gICAgICBjcmVkZW50aWFscyE6IGdsb2JhbFRoaXMuUmVxdWVzdFsnY3JlZGVudGlhbHMnXTtcbiAgICAgIGRlc3RpbmF0aW9uITogZ2xvYmFsVGhpcy5SZXF1ZXN0WydkZXN0aW5hdGlvbiddO1xuICAgICAgaGVhZGVycyE6IEhlYWRlcnM7XG4gICAgICBpbnRlZ3JpdHkhOiBzdHJpbmc7XG4gICAgICBtZXRob2QhOiBzdHJpbmc7XG4gICAgICBtb2RlITogZ2xvYmFsVGhpcy5SZXF1ZXN0Wydtb2RlJ107XG4gICAgICByZWRpcmVjdCE6IGdsb2JhbFRoaXMuUmVxdWVzdFsncmVkaXJlY3QnXTtcbiAgICAgIHJlZmVycmVyITogc3RyaW5nO1xuICAgICAgcmVmZXJyZXJQb2xpY3khOiBnbG9iYWxUaGlzLlJlcXVlc3RbJ3JlZmVycmVyUG9saWN5J107XG4gICAgICB1cmwhOiBzdHJpbmc7XG4gICAgICBrZWVwYWxpdmUhOiBib29sZWFuO1xuICAgICAgc2lnbmFsITogQWJvcnRTaWduYWw7XG4gICAgICBkdXBsZXghOiAnaGFsZic7XG4gICAgICBib2R5ITogUmVhZGFibGVTdHJlYW08YW55PiB8IG51bGw7XG5cbiAgICAgIGNvbnN0cnVjdG9yKGlucHV0OiBhbnksIGluaXQ/OiBSZXF1ZXN0SW5pdCkge1xuICAgICAgICAvLyBIYW5kbGUgVVJMIGlucHV0XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnIHx8IGlucHV0IGluc3RhbmNlb2Ygdm1HbG9iYWxUaGlzLlVSTCkge1xuICAgICAgICAgIGNvbnN0IHVybFN0cmluZyA9IFN0cmluZyhpbnB1dCk7XG4gICAgICAgICAgLy8gVmFsaWRhdGUgVVJMIGZvcm1hdFxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBuZXcgdm1HbG9iYWxUaGlzLlVSTCh1cmxTdHJpbmcpO1xuICAgICAgICAgICAgdGhpcy51cmwgPSB1cmxTdHJpbmc7XG4gICAgICAgICAgfSBjYXRjaCAoY2F1c2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEZhaWxlZCB0byBwYXJzZSBVUkwgZnJvbSAke3VybFN0cmluZ31gLCB7XG4gICAgICAgICAgICAgIGNhdXNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElucHV0IGlzIGEgUmVxdWVzdCBvYmplY3QgLSBjbG9uZSBpdHMgcHJvcGVydGllc1xuICAgICAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsO1xuICAgICAgICAgIGlmICghaW5pdCkge1xuICAgICAgICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2Q7XG4gICAgICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoaW5wdXQuaGVhZGVycyk7XG4gICAgICAgICAgICB0aGlzLmJvZHkgPSBpbnB1dC5ib2R5O1xuICAgICAgICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZTtcbiAgICAgICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFscztcbiAgICAgICAgICAgIHRoaXMuY2FjaGUgPSBpbnB1dC5jYWNoZTtcbiAgICAgICAgICAgIHRoaXMucmVkaXJlY3QgPSBpbnB1dC5yZWRpcmVjdDtcbiAgICAgICAgICAgIHRoaXMucmVmZXJyZXIgPSBpbnB1dC5yZWZlcnJlcjtcbiAgICAgICAgICAgIHRoaXMucmVmZXJyZXJQb2xpY3kgPSBpbnB1dC5yZWZlcnJlclBvbGljeTtcbiAgICAgICAgICAgIHRoaXMuaW50ZWdyaXR5ID0gaW5wdXQuaW50ZWdyaXR5O1xuICAgICAgICAgICAgdGhpcy5rZWVwYWxpdmUgPSBpbnB1dC5rZWVwYWxpdmU7XG4gICAgICAgICAgICB0aGlzLnNpZ25hbCA9IGlucHV0LnNpZ25hbDtcbiAgICAgICAgICAgIHRoaXMuZHVwbGV4ID0gaW5wdXQuZHVwbGV4O1xuICAgICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IGlucHV0LmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZiBpbml0IGlzIHByb3ZpZGVkLCBtZXJnZTogdXNlIHNvdXJjZSBwcm9wZXJ0aWVzLCB0aGVuIG92ZXJyaWRlIHdpdGggaW5pdFxuICAgICAgICAgIC8vIENvcHkgYWxsIHByb3BlcnRpZXMgZnJvbSB0aGUgc291cmNlIFJlcXVlc3QgZmlyc3RcbiAgICAgICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZDtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoaW5wdXQuaGVhZGVycyk7XG4gICAgICAgICAgdGhpcy5ib2R5ID0gaW5wdXQuYm9keTtcbiAgICAgICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlO1xuICAgICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFscztcbiAgICAgICAgICB0aGlzLmNhY2hlID0gaW5wdXQuY2FjaGU7XG4gICAgICAgICAgdGhpcy5yZWRpcmVjdCA9IGlucHV0LnJlZGlyZWN0O1xuICAgICAgICAgIHRoaXMucmVmZXJyZXIgPSBpbnB1dC5yZWZlcnJlcjtcbiAgICAgICAgICB0aGlzLnJlZmVycmVyUG9saWN5ID0gaW5wdXQucmVmZXJyZXJQb2xpY3k7XG4gICAgICAgICAgdGhpcy5pbnRlZ3JpdHkgPSBpbnB1dC5pbnRlZ3JpdHk7XG4gICAgICAgICAgdGhpcy5rZWVwYWxpdmUgPSBpbnB1dC5rZWVwYWxpdmU7XG4gICAgICAgICAgdGhpcy5zaWduYWwgPSBpbnB1dC5zaWduYWw7XG4gICAgICAgICAgdGhpcy5kdXBsZXggPSBpbnB1dC5kdXBsZXg7XG4gICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IGlucHV0LmRlc3RpbmF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3ZlcnJpZGUgd2l0aCBpbml0IG9wdGlvbnMgaWYgcHJvdmlkZWRcbiAgICAgICAgLy8gU2V0IG1ldGhvZFxuICAgICAgICBpZiAoaW5pdD8ubWV0aG9kKSB7XG4gICAgICAgICAgdGhpcy5tZXRob2QgPSBpbml0Lm1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLm1ldGhvZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBGYWxsYmFjayB0byBkZWZhdWx0IGZvciBzdHJpbmcgaW5wdXQgY2FzZVxuICAgICAgICAgIHRoaXMubWV0aG9kID0gJ0dFVCc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgaGVhZGVyc1xuICAgICAgICBpZiAoaW5pdD8uaGVhZGVycykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbml0LmhlYWRlcnMpO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgICBpbnB1dCBpbnN0YW5jZW9mIHZtR2xvYmFsVGhpcy5VUkxcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gRm9yIHN0cmluZy9VUkwgaW5wdXQsIGNyZWF0ZSBlbXB0eSBoZWFkZXJzXG4gICAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgb3RoZXIgcHJvcGVydGllcyB3aXRoIGluaXQgdmFsdWVzIG9yIGRlZmF1bHRzXG4gICAgICAgIGlmIChpbml0Py5tb2RlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLm1vZGUgPSBpbml0Lm1vZGU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMubW9kZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLm1vZGUgPSAnY29ycyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8uY3JlZGVudGlhbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbml0LmNyZWRlbnRpYWxzO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNyZWRlbnRpYWxzICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSAnc2FtZS1vcmlnaW4nO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYGFueWAgY2FzdCBoZXJlIGJlY2F1c2UgQHR5cGVzL25vZGUgdjIyIGRvZXMgbm90IHlldCBoYXZlIGBjYWNoZWBcbiAgICAgICAgaWYgKChpbml0IGFzIGFueSk/LmNhY2hlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLmNhY2hlID0gKGluaXQgYXMgYW55KS5jYWNoZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5jYWNoZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmNhY2hlID0gJ2RlZmF1bHQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LnJlZGlyZWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLnJlZGlyZWN0ID0gaW5pdC5yZWRpcmVjdDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZWRpcmVjdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLnJlZGlyZWN0ID0gJ2ZvbGxvdyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5pdD8ucmVmZXJyZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMucmVmZXJyZXIgPSBpbml0LnJlZmVycmVyO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnJlZmVycmVyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMucmVmZXJyZXIgPSAnYWJvdXQ6Y2xpZW50JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5yZWZlcnJlclBvbGljeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlclBvbGljeSA9IGluaXQucmVmZXJyZXJQb2xpY3k7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucmVmZXJyZXJQb2xpY3kgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5yZWZlcnJlclBvbGljeSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LmludGVncml0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5pbnRlZ3JpdHkgPSBpbml0LmludGVncml0eTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5pbnRlZ3JpdHkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5pbnRlZ3JpdHkgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbml0Py5rZWVwYWxpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMua2VlcGFsaXZlID0gaW5pdC5rZWVwYWxpdmU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMua2VlcGFsaXZlICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICB0aGlzLmtlZXBhbGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXQ/LnNpZ25hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEFib3J0U2lnbmFsIHN0dWJcbiAgICAgICAgICB0aGlzLnNpZ25hbCA9IGluaXQuc2lnbmFsO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnNpZ25hbCkge1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBBYm9ydFNpZ25hbCBzdHViXG4gICAgICAgICAgdGhpcy5zaWduYWwgPSB7IGFib3J0ZWQ6IGZhbHNlIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZHVwbGV4KSB7XG4gICAgICAgICAgdGhpcy5kdXBsZXggPSAnaGFsZic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZGVzdGluYXRpb24pIHtcbiAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gJ2RvY3VtZW50JztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJvZHkgPSBpbml0Py5ib2R5O1xuXG4gICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgR0VUL0hFQUQgbWV0aG9kcyBkb24ndCBoYXZlIGEgYm9keVxuICAgICAgICBpZiAoXG4gICAgICAgICAgYm9keSAhPT0gbnVsbCAmJlxuICAgICAgICAgIGJvZHkgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJylcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgUmVxdWVzdCB3aXRoIEdFVC9IRUFEIG1ldGhvZCBjYW5ub3QgaGF2ZSBib2R5LmApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RvcmUgdGhlIG9yaWdpbmFsIEJvZHlJbml0IGZvciBzZXJpYWxpemF0aW9uXG4gICAgICAgIGlmIChib2R5ICE9PSBudWxsICYmIGJvZHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIENyZWF0ZSBhIFwiZmFrZVwiIFJlYWRhYmxlU3RyZWFtIHRoYXQgc3RvcmVzIHRoZSBvcmlnaW5hbCBib2R5XG4gICAgICAgICAgLy8gVGhpcyBhdm9pZHMgZG9pbmcgYXN5bmMgd29yayBkdXJpbmcgd29ya2Zsb3cgcmVwbGF5XG4gICAgICAgICAgdGhpcy5ib2R5ID0gT2JqZWN0LmNyZWF0ZSh2bUdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW0ucHJvdG90eXBlLCB7XG4gICAgICAgICAgICBbQk9EWV9JTklUX1NZTUJPTF06IHtcbiAgICAgICAgICAgICAgdmFsdWU6IGJvZHksXG4gICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5ib2R5ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjbG9uZSgpOiBSZXF1ZXN0IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXQgYm9keVVzZWQoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogaW1wbGVtZW50IHRoZXNlXG4gICAgICBibG9iITogKCkgPT4gUHJvbWlzZTxCbG9iPjtcbiAgICAgIGZvcm1EYXRhITogKCkgPT4gUHJvbWlzZTxGb3JtRGF0YT47XG5cbiAgICAgIGFycmF5QnVmZmVyITogKCkgPT4gUHJvbWlzZTxBcnJheUJ1ZmZlcj47XG4gICAgICBqc29uITogKCkgPT4gUHJvbWlzZTxhbnk+O1xuICAgICAgdGV4dCE6ICgpID0+IFByb21pc2U8c3RyaW5nPjtcblxuICAgICAgYXN5bmMgYnl0ZXMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCB0aGlzLmFycmF5QnVmZmVyKCkpO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhSZXF1ZXN0LnByb3RvdHlwZSwge1xuICAgICAgYXJyYXlCdWZmZXI6IHtcbiAgICAgICAgdmFsdWU6IHVzZVN0ZXA8W10sIEFycmF5QnVmZmVyPignX19idWlsdGluX3Jlc3BvbnNlX2FycmF5X2J1ZmZlcicpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGpzb246IHtcbiAgICAgICAgdmFsdWU6IHVzZVN0ZXA8W10sIGFueT4oJ19fYnVpbHRpbl9yZXNwb25zZV9qc29uJyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgICAgdGV4dDoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgc3RyaW5nPignX19idWlsdGluX3Jlc3BvbnNlX3RleHQnKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjbGFzcyBSZXNwb25zZSBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuUmVzcG9uc2Uge1xuICAgICAgdHlwZSE6IGdsb2JhbFRoaXMuUmVzcG9uc2VbJ3R5cGUnXTtcbiAgICAgIHVybCE6IHN0cmluZztcbiAgICAgIHN0YXR1cyE6IG51bWJlcjtcbiAgICAgIHN0YXR1c1RleHQhOiBzdHJpbmc7XG4gICAgICBib2R5ITogUmVhZGFibGVTdHJlYW08VWludDhBcnJheT4gfCBudWxsO1xuICAgICAgaGVhZGVycyE6IEhlYWRlcnM7XG4gICAgICByZWRpcmVjdGVkITogYm9vbGVhbjtcblxuICAgICAgY29uc3RydWN0b3IoYm9keT86IGFueSwgaW5pdD86IFJlc3BvbnNlSW5pdCkge1xuICAgICAgICB0aGlzLnN0YXR1cyA9IGluaXQ/LnN0YXR1cyA/PyAyMDA7XG4gICAgICAgIHRoaXMuc3RhdHVzVGV4dCA9IGluaXQ/LnN0YXR1c1RleHQgPz8gJyc7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyB2bUdsb2JhbFRoaXMuSGVhZGVycyhpbml0Py5oZWFkZXJzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnO1xuICAgICAgICB0aGlzLnVybCA9ICcnO1xuICAgICAgICB0aGlzLnJlZGlyZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IG51bGwtYm9keSBzdGF0dXMgY29kZXMgZG9uJ3QgaGF2ZSBhIGJvZHlcbiAgICAgICAgLy8gUGVyIEhUVFAgc3BlYzogMjA0IChObyBDb250ZW50KSwgMjA1IChSZXNldCBDb250ZW50KSwgYW5kIDMwNCAoTm90IE1vZGlmaWVkKVxuICAgICAgICBpZiAoXG4gICAgICAgICAgYm9keSAhPT0gbnVsbCAmJlxuICAgICAgICAgIGJvZHkgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICh0aGlzLnN0YXR1cyA9PT0gMjA0IHx8IHRoaXMuc3RhdHVzID09PSAyMDUgfHwgdGhpcy5zdGF0dXMgPT09IDMwNClcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgIGBSZXNwb25zZSBjb25zdHJ1Y3RvcjogSW52YWxpZCByZXNwb25zZSBzdGF0dXMgY29kZSAke3RoaXMuc3RhdHVzfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RvcmUgdGhlIG9yaWdpbmFsIEJvZHlJbml0IGZvciBzZXJpYWxpemF0aW9uXG4gICAgICAgIGlmIChib2R5ICE9PSBudWxsICYmIGJvZHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIENyZWF0ZSBhIFwiZmFrZVwiIFJlYWRhYmxlU3RyZWFtIHRoYXQgc3RvcmVzIHRoZSBvcmlnaW5hbCBib2R5XG4gICAgICAgICAgLy8gVGhpcyBhdm9pZHMgZG9pbmcgYXN5bmMgd29yayBkdXJpbmcgd29ya2Zsb3cgcmVwbGF5XG4gICAgICAgICAgdGhpcy5ib2R5ID0gT2JqZWN0LmNyZWF0ZSh2bUdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW0ucHJvdG90eXBlLCB7XG4gICAgICAgICAgICBbQk9EWV9JTklUX1NZTUJPTF06IHtcbiAgICAgICAgICAgICAgdmFsdWU6IGJvZHksXG4gICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5ib2R5ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBpbXBsZW1lbnQgdGhlc2VcbiAgICAgIGNsb25lITogKCkgPT4gUmVzcG9uc2U7XG4gICAgICBibG9iITogKCkgPT4gUHJvbWlzZTxnbG9iYWxUaGlzLkJsb2I+O1xuICAgICAgZm9ybURhdGEhOiAoKSA9PiBQcm9taXNlPGdsb2JhbFRoaXMuRm9ybURhdGE+O1xuXG4gICAgICBnZXQgb2soKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDA7XG4gICAgICB9XG5cbiAgICAgIGdldCBib2R5VXNlZCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBhcnJheUJ1ZmZlciE6ICgpID0+IFByb21pc2U8QXJyYXlCdWZmZXI+O1xuICAgICAganNvbiE6ICgpID0+IFByb21pc2U8YW55PjtcbiAgICAgIHRleHQhOiAoKSA9PiBQcm9taXNlPHN0cmluZz47XG5cbiAgICAgIGFzeW5jIGJ5dGVzKCkge1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgdGhpcy5hcnJheUJ1ZmZlcigpKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGpzb24oZGF0YTogYW55LCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2Uge1xuICAgICAgICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgdm1HbG9iYWxUaGlzLkhlYWRlcnMoaW5pdD8uaGVhZGVycyk7XG4gICAgICAgIGlmICghaGVhZGVycy5oYXMoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgICAgaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShib2R5LCB7IC4uLmluaXQsIGhlYWRlcnMgfSk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBlcnJvcigpOiBSZXNwb25zZSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIHJlZGlyZWN0KHVybDogc3RyaW5nIHwgVVJMLCBzdGF0dXM6IG51bWJlciA9IDMwMik6IFJlc3BvbnNlIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgc3RhdHVzIGNvZGUgLSBvbmx5IHNwZWNpZmljIHJlZGlyZWN0IGNvZGVzIGFyZSBhbGxvd2VkXG4gICAgICAgIGlmICghWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XS5pbmNsdWRlcyhzdGF0dXMpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXG4gICAgICAgICAgICBgSW52YWxpZCByZWRpcmVjdCBzdGF0dXMgY29kZTogJHtzdGF0dXN9LiBNdXN0IGJlIG9uZSBvZjogMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSByZXNwb25zZSB3aXRoIExvY2F0aW9uIGhlYWRlclxuICAgICAgICBjb25zdCBoZWFkZXJzID0gbmV3IHZtR2xvYmFsVGhpcy5IZWFkZXJzKCk7XG4gICAgICAgIGhlYWRlcnMuc2V0KCdMb2NhdGlvbicsIFN0cmluZyh1cmwpKTtcblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IE9iamVjdC5jcmVhdGUoUmVzcG9uc2UucHJvdG90eXBlKTtcbiAgICAgICAgcmVzcG9uc2Uuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICByZXNwb25zZS5zdGF0dXNUZXh0ID0gJyc7XG4gICAgICAgIHJlc3BvbnNlLmhlYWRlcnMgPSBoZWFkZXJzO1xuICAgICAgICByZXNwb25zZS5ib2R5ID0gbnVsbDtcbiAgICAgICAgcmVzcG9uc2UudHlwZSA9ICdkZWZhdWx0JztcbiAgICAgICAgcmVzcG9uc2UudXJsID0gJyc7XG4gICAgICAgIHJlc3BvbnNlLnJlZGlyZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHZtR2xvYmFsVGhpcy5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoUmVzcG9uc2UucHJvdG90eXBlLCB7XG4gICAgICBhcnJheUJ1ZmZlcjoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgQXJyYXlCdWZmZXI+KCdfX2J1aWx0aW5fcmVzcG9uc2VfYXJyYXlfYnVmZmVyJyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9LFxuICAgICAganNvbjoge1xuICAgICAgICB2YWx1ZTogdXNlU3RlcDxbXSwgYW55PignX19idWlsdGluX3Jlc3BvbnNlX2pzb24nKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICB0ZXh0OiB7XG4gICAgICAgIHZhbHVlOiB1c2VTdGVwPFtdLCBzdHJpbmc+KCdfX2J1aWx0aW5fcmVzcG9uc2VfdGV4dCcpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNsYXNzIFJlYWRhYmxlU3RyZWFtPFQ+IGltcGxlbWVudHMgZ2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbTxUPiB7XG4gICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBnZXQgbG9ja2VkKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGNhbmNlbCgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGdldFJlYWRlcigpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIHBpcGVUaHJvdWdoKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgcGlwZVRvKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgdGVlKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgdmFsdWVzKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGZyb20oKTogYW55IHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuXG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdm1HbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtID0gUmVhZGFibGVTdHJlYW07XG5cbiAgICBjbGFzcyBXcml0YWJsZVN0cmVhbTxUPiBpbXBsZW1lbnRzIGdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW08VD4ge1xuICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgZ2V0IGxvY2tlZCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBhYm9ydCgpOiBhbnkge1xuICAgICAgICBFTk9UU1VQKCk7XG4gICAgICB9XG5cbiAgICAgIGNsb3NlKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cblxuICAgICAgZ2V0V3JpdGVyKCk6IGFueSB7XG4gICAgICAgIEVOT1RTVVAoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdm1HbG9iYWxUaGlzLldyaXRhYmxlU3RyZWFtID0gV3JpdGFibGVTdHJlYW07XG5cbiAgICBjbGFzcyBUcmFuc2Zvcm1TdHJlYW08SSwgTz4gaW1wbGVtZW50cyBnbG9iYWxUaGlzLlRyYW5zZm9ybVN0cmVhbTxJLCBPPiB7XG4gICAgICByZWFkYWJsZTogZ2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbTxPPjtcbiAgICAgIHdyaXRhYmxlOiBnbG9iYWxUaGlzLldyaXRhYmxlU3RyZWFtPEk+O1xuXG4gICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgRU5PVFNVUCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB2bUdsb2JhbFRoaXMuVHJhbnNmb3JtU3RyZWFtID0gVHJhbnNmb3JtU3RyZWFtO1xuXG4gICAgLy8gRXZlbnR1YWxseSB3ZSdsbCBwcm9iYWJseSB3YW50IHRvIHByb3ZpZGUgb3VyIG93biBgY29uc29sZWAgb2JqZWN0LFxuICAgIC8vIGJ1dCBmb3Igbm93IHdlJ2xsIGp1c3QgZXhwb3NlIHRoZSBnbG9iYWwgb25lLlxuICAgIHZtR2xvYmFsVGhpcy5jb25zb2xlID0gZ2xvYmFsVGhpcy5jb25zb2xlO1xuXG4gICAgLy8gSEFDSzogcHJvcGFnYXRlIHN5bWJvbCBuZWVkZWQgZm9yIEFJIGdhdGV3YXkgdXNhZ2VcbiAgICBjb25zdCBTWU1CT0xfRk9SX1JFUV9DT05URVhUID0gU3ltYm9sLmZvcignQHZlcmNlbC9yZXF1ZXN0LWNvbnRleHQnKTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gYEB0eXBlcy9ub2RlYCBzYXlzIHN5bWJvbCBpcyBub3QgdmFsaWQsIGJ1dCBpdCBkb2VzIHdvcmtcbiAgICB2bUdsb2JhbFRoaXNbU1lNQk9MX0ZPUl9SRVFfQ09OVEVYVF0gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpW1xuICAgICAgU1lNQk9MX0ZPUl9SRVFfQ09OVEVYVFxuICAgIF07XG5cbiAgICAvLyBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIHVzZXItZGVmaW5lZCB3b3JrZmxvdyBmdW5jdGlvbi5cbiAgICAvLyBUaGUgZmlsZW5hbWUgcGFyYW1ldGVyIGVuc3VyZXMgc3RhY2sgdHJhY2VzIHNob3cgYSBtZWFuaW5nZnVsIG5hbWVcbiAgICAvLyAoZS5nLiwgXCJleGFtcGxlL3dvcmtmbG93cy85OV9lMmUudHNcIikgaW5zdGVhZCBvZiBcImV2YWxtYWNoaW5lLjxhbm9ueW1vdXM+XCIuXG4gICAgY29uc3QgcGFyc2VkTmFtZSA9IHBhcnNlV29ya2Zsb3dOYW1lKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSk7XG4gICAgY29uc3QgZmlsZW5hbWUgPSBwYXJzZWROYW1lPy5tb2R1bGVTcGVjaWZpZXIgfHwgd29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lO1xuXG4gICAgLy8gRXZhbHVhdGUgdGhlIHdvcmtmbG93IGJ1bmRsZSBhZ2FpbnN0IHRoZSBmcmVzaCBjb250ZXh0IHVzaW5nIGFcbiAgICAvLyBwcm9jZXNzLXdpZGUgY2FjaGUgb2YgdGhlIGNvbXBpbGVkIGB2bS5TY3JpcHRgLiBUaGUgYnVuZGxlIGlzIHRoZSBzYW1lXG4gICAgLy8gc3RyaW5nIGZvciBldmVyeSByZXBsYXkgYW5kIGV2ZXJ5IGludm9jYXRpb24gaW4gdGhpcyBwcm9jZXNzLCBhbmRcbiAgICAvLyBjb21waWxhdGlvbiBpcyBhIHB1cmUgZnVuY3Rpb24gb2YgYChjb2RlLCBmaWxlbmFtZSlgLCBzbyByZXVzaW5nIHRoZVxuICAgIC8vIGNvbXBpbGVkIFNjcmlwdCBhY3Jvc3MgcmVwbGF5cyBpcyBkZXRlcm1pbmlzbS1zYWZlOiBpdCBwcm9kdWNlcyB0aGUgc2FtZVxuICAgIC8vIHdvcmtmbG93IGZ1bmN0aW9uIGFuZCB0aGUgc2FtZSBgZmlsZW5hbWVgIHNvdXJjZSBhdHRyaWJ1dGlvbiBhc1xuICAgIC8vIHJlLXBhcnNpbmcgdGhlIGJ1bmRsZSBldmVyeSB0aW1lLCBidXQgc2tpcHMgdGhlIChleHBlbnNpdmUpIHJlLXBhcnNlLlxuICAgIC8vIEV2YWx1YXRpbmcgdGhlIGJ1bmRsZSByZWdpc3RlcnMgZXZlcnkgd29ya2Zsb3cgb25cbiAgICAvLyBgZ2xvYmFsVGhpcy5fX3ByaXZhdGVfd29ya2Zsb3dzYDsgdGhlIHRyYWlsaW5nIGxvb2t1cCBleHByZXNzaW9uIHRoZW5cbiAgICAvLyByZXRyaWV2ZXMgdGhlIHJlcXVlc3RlZCB3b3JrZmxvdyBmdW5jdGlvbi4gVGhlIGxvb2t1cCBpcyBldmFsdWF0ZWQgYXMgYVxuICAgIC8vIHNlcGFyYXRlIGNhY2hlZCBTY3JpcHQgdW5kZXIgdGhlIHNhbWUgYGZpbGVuYW1lYCwgc28gZXJyb3Igc3RhY2sgZnJhbWVzXG4gICAgLy8gc3RpbGwgYXR0cmlidXRlIHRvIHRoZSB3b3JrZmxvdydzIHNvdXJjZSBmaWxlIChgcmVtYXBFcnJvclN0YWNrYCBrZXlzIG9uXG4gICAgLy8gYGZpbGVuYW1lYCkuIFRoZSBvbmUgYmVoYXZpb3VyYWwgZGlmZmVyZW5jZSBmcm9tIHRoZSBwcmV2aW91c1xuICAgIC8vIHNpbmdsZS1jb21iaW5lZC1zdHJpbmcgYXBwcm9hY2ggaXMgdGhlICpsaW5lIG51bWJlciogb2YgYW4gZXJyb3IgdGhyb3duXG4gICAgLy8gYnkgdGhlIGxvb2t1cCBleHByZXNzaW9uIGl0c2VsZjogaXQgbm93IHJlcG9ydHMgbGluZSAxIG9mIHRoZSBsb29rdXBcbiAgICAvLyBTY3JpcHQgcmF0aGVyIHRoYW4gdGhlIGxpbmUganVzdCBwYXN0IHRoZSBlbmQgb2YgdGhlIGJ1bmRsZS4gVGhhdCBwYXRoXG4gICAgLy8gaXMgcmFyZSAoaXQgcmVxdWlyZXMgdGhlIGxvb2t1cCBgPy5nZXQoLi4uKWAgZXhwcmVzc2lvbiB0byB0aHJvdykgYW5kXG4gICAgLy8gZG9lcyBub3QgYWZmZWN0IHRoZSB3b3JrZmxvdyBmdW5jdGlvbiBvciByZXBsYXkgZGV0ZXJtaW5pc20uXG4gICAgcnVuQ2FjaGVkV29ya2Zsb3dTY3JpcHQod29ya2Zsb3dDb2RlLCBmaWxlbmFtZSwgY29udGV4dCk7XG4gICAgY29uc3Qgd29ya2Zsb3dGbiA9IHJ1bkNhY2hlZFdvcmtmbG93U2NyaXB0KFxuICAgICAgYGdsb2JhbFRoaXMuX19wcml2YXRlX3dvcmtmbG93cz8uZ2V0KCR7SlNPTi5zdHJpbmdpZnkod29ya2Zsb3dSdW4ud29ya2Zsb3dOYW1lKX0pYCxcbiAgICAgIGZpbGVuYW1lLFxuICAgICAgY29udGV4dFxuICAgICk7XG5cbiAgICBpZiAodHlwZW9mIHdvcmtmbG93Rm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBXb3JrZmxvd05vdFJlZ2lzdGVyZWRFcnJvcih3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpO1xuICAgIH1cblxuICAgIC8vIENoYWluIHdvcmtmbG93IGFyZ3VtZW50IGh5ZHJhdGlvbiBvbnRvIHRoZSBwcm9taXNlUXVldWUgc28gdGhhdCB0aGVcbiAgICAvLyB1bmNvbnN1bWVkIGV2ZW50IGNoZWNrICh3aGljaCB3YWl0cyBmb3IgdGhlIHF1ZXVlIHRvIGRyYWluKSBkb2Vzbid0XG4gICAgLy8gZmlyZSBkdXJpbmcgdGhlIGFzeW5jIGdhcCBiZXR3ZWVuIHJ1bl9zdGFydGVkIGNvbnN1bXB0aW9uIGFuZCB0aGVcbiAgICAvLyB3b3JrZmxvdyBmdW5jdGlvbiBzdWJzY3JpYmluZyBpdHMgZmlyc3Qgc3RlcCBjYWxsYmFja3MuXG4gICAgbGV0IGFyZ3M6IHVua25vd25bXSA9IFtdO1xuICAgIHdvcmtmbG93Q29udGV4dC5wcm9taXNlUXVldWUgPSB3b3JrZmxvd0NvbnRleHQucHJvbWlzZVF1ZXVlLnRoZW4oXG4gICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgIGFyZ3MgPSBhd2FpdCBoeWRyYXRlV29ya2Zsb3dBcmd1bWVudHMoXG4gICAgICAgICAgd29ya2Zsb3dSdW4uaW5wdXQsXG4gICAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgICAgZW5jcnlwdGlvbktleSxcbiAgICAgICAgICB2bUdsb2JhbFRoaXNcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICApO1xuICAgIGF3YWl0IHdvcmtmbG93Q29udGV4dC5wcm9taXNlUXVldWU7XG5cbiAgICBzcGFuPy5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd0FyZ3VtZW50c0NvdW50KGFyZ3MubGVuZ3RoKSxcbiAgICB9KTtcblxuICAgIC8vIEludm9rZSB1c2VyIHdvcmtmbG93XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFByb21pc2UucmFjZShbXG4gICAgICAgIHdvcmtmbG93Rm4oLi4uYXJncyksXG4gICAgICAgIHdvcmtmbG93RGlzY29udGludWF0aW9uLnByb21pc2UsXG4gICAgICBdKTtcblxuICAgICAgY29uc3QgZGVoeWRyYXRlZCA9IGF3YWl0IGRlaHlkcmF0ZVdvcmtmbG93UmV0dXJuVmFsdWUoXG4gICAgICAgIHJlc3VsdCxcbiAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgIGVuY3J5cHRpb25LZXksXG4gICAgICAgIHZtR2xvYmFsVGhpc1xuICAgICAgKTtcblxuICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgIC4uLkF0dHJpYnV0ZS5Xb3JrZmxvd1Jlc3VsdFR5cGUodHlwZW9mIHJlc3VsdCksXG4gICAgICB9KTtcblxuICAgICAgd2FyblBlbmRpbmdRdWV1ZUl0ZW1zKFxuICAgICAgICB3b3JrZmxvd1J1bi5ydW5JZCxcbiAgICAgICAgd29ya2Zsb3dDb250ZXh0Lmludm9jYXRpb25zUXVldWUsXG4gICAgICAgICdjb21wbGV0ZWQnXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gZGVoeWRyYXRlZDtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIENvbnRyb2wtZmxvdyBzaWduYWxzIGFyZSBoYW5kbGVkIGJ5IHRoZSBydW50aW1lIGFuZCBkbyBub3QgbWVhbiB0aGVcbiAgICAgIC8vIHdvcmtmbG93IGhhcyB0ZXJtaW5hbGx5IGZhaWxlZC5cbiAgICAgIGlmIChXb3JrZmxvd1N1c3BlbnNpb24uaXMoZXJyKSB8fCBSZXBsYXlEaXZlcmdlbmNlRXJyb3IuaXMoZXJyKSkge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG5cbiAgICAgIHdhcm5QZW5kaW5nUXVldWVJdGVtcyhcbiAgICAgICAgd29ya2Zsb3dSdW4ucnVuSWQsXG4gICAgICAgIHdvcmtmbG93Q29udGV4dC5pbnZvY2F0aW9uc1F1ZXVlLFxuICAgICAgICAnZmFpbGVkJ1xuICAgICAgKTtcblxuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfSk7XG59XG4iLCAiaW1wb3J0IHtcbiAgRVJST1JfU0xVR1MsXG4gIEhvb2tOb3RGb3VuZEVycm9yLFxuICBXb3JrZmxvd1J1bnRpbWVFcnJvcixcbn0gZnJvbSAnQHdvcmtmbG93L2Vycm9ycyc7XG5pbXBvcnQge1xuICB0eXBlIEhvb2ssXG4gIGlzTGVnYWN5U3BlY1ZlcnNpb24sXG4gIFNQRUNfVkVSU0lPTl9DVVJSRU5ULFxuICBTUEVDX1ZFUlNJT05fTEVHQUNZLFxuICB0eXBlIFdvcmtmbG93SW52b2tlUGF5bG9hZCxcbiAgdHlwZSBXb3JrZmxvd1J1bixcbn0gZnJvbSAnQHdvcmtmbG93L3dvcmxkJztcbmltcG9ydCB7IGdldFJ1bkNhcGFiaWxpdGllcyB9IGZyb20gJy4uL2NhcGFiaWxpdGllcy5qcyc7XG5pbXBvcnQgeyB0eXBlIENyeXB0b0tleSwgaW1wb3J0S2V5IH0gZnJvbSAnLi4vZW5jcnlwdGlvbi5qcyc7XG5pbXBvcnQgeyBydW50aW1lTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyLmpzJztcbmltcG9ydCB7XG4gIGRlaHlkcmF0ZVN0ZXBSZXR1cm5WYWx1ZSxcbiAgaHlkcmF0ZVN0ZXBBcmd1bWVudHMsXG4gIFNlcmlhbGl6YXRpb25Gb3JtYXQsXG59IGZyb20gJy4uL3NlcmlhbGl6YXRpb24uanMnO1xuaW1wb3J0IHsgV0VCSE9PS19SRVNQT05TRV9XUklUQUJMRSB9IGZyb20gJy4uL3N5bWJvbHMuanMnO1xuaW1wb3J0ICogYXMgQXR0cmlidXRlIGZyb20gJy4uL3RlbGVtZXRyeS9zZW1hbnRpYy1jb252ZW50aW9ucy5qcyc7XG5pbXBvcnQgeyBnZXRTcGFuQ29udGV4dEZvclRyYWNlQ2FycmllciwgdHJhY2UgfSBmcm9tICcuLi90ZWxlbWV0cnkuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2Zsb3dRdWV1ZU5hbWUgfSBmcm9tICcuL2hlbHBlcnMuanMnO1xuaW1wb3J0IHsgc2FmZVdhaXRVbnRpbCwgd2FpdGVkVW50aWwgfSBmcm9tICcuL3dhaXQtdW50aWwuanMnO1xuaW1wb3J0IHsgZ2V0V29ybGQgfSBmcm9tICcuL3dvcmxkLmpzJztcblxuYXN5bmMgZnVuY3Rpb24gbWF0ZXJpYWxpemVSZXNwb25zZUJvZHkocmVzcG9uc2U6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICBpZiAoIXJlc3BvbnNlLmJvZHkpIHtcbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH1cblxuICBjb25zdCBib2R5ID0gYXdhaXQgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKTtcbiAgcmV0dXJuIG5ldyBSZXNwb25zZShib2R5LCB7XG4gICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICBoZWFkZXJzOiByZXNwb25zZS5oZWFkZXJzLFxuICB9KTtcbn1cblxuLyoqXG4gKiBJbnRlcm5hbCBoZWxwZXIgdGhhdCByZXR1cm5zIHRoZSBob29rLCB0aGUgYXNzb2NpYXRlZCB3b3JrZmxvdyBydW4sXG4gKiBhbmQgdGhlIHJlc29sdmVkIGVuY3J5cHRpb24ga2V5LlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRIb29rQnlUb2tlbldpdGhLZXkodG9rZW46IHN0cmluZyk6IFByb21pc2U8e1xuICBob29rOiBIb29rO1xuICBydW46IFdvcmtmbG93UnVuO1xuICBlbmNyeXB0aW9uS2V5OiBDcnlwdG9LZXkgfCB1bmRlZmluZWQ7XG59PiB7XG4gIGNvbnN0IHdvcmxkID0gZ2V0V29ybGQoKTtcbiAgY29uc3QgaG9vayA9IGF3YWl0IHdvcmxkLmhvb2tzLmdldEJ5VG9rZW4odG9rZW4pO1xuICBjb25zdCBydW4gPSBhd2FpdCB3b3JsZC5ydW5zLmdldChob29rLnJ1bklkKTtcbiAgY29uc3QgcmF3S2V5ID0gYXdhaXQgd29ybGQuZ2V0RW5jcnlwdGlvbktleUZvclJ1bj8uKHJ1bik7XG4gIGNvbnN0IGVuY3J5cHRpb25LZXkgPSByYXdLZXkgPyBhd2FpdCBpbXBvcnRLZXkocmF3S2V5KSA6IHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBob29rLm1ldGFkYXRhICE9PSAndW5kZWZpbmVkJykge1xuICAgIGhvb2subWV0YWRhdGEgPSBhd2FpdCBoeWRyYXRlU3RlcEFyZ3VtZW50cyhcbiAgICAgIGhvb2subWV0YWRhdGEgYXMgYW55LFxuICAgICAgaG9vay5ydW5JZCxcbiAgICAgIGVuY3J5cHRpb25LZXlcbiAgICApO1xuICB9XG4gIHJldHVybiB7IGhvb2ssIHJ1biwgZW5jcnlwdGlvbktleSB9O1xufVxuXG4vKipcbiAqIEdldCB0aGUgaG9vayBieSB0b2tlbiB0byBmaW5kIHRoZSBhc3NvY2lhdGVkIHdvcmtmbG93IHJ1bixcbiAqIGFuZCBoeWRyYXRlIHRoZSBgbWV0YWRhdGFgIHByb3BlcnR5IGlmIGl0IHdhcyBzZXQgZnJvbSB3aXRoaW5cbiAqIHRoZSB3b3JrZmxvdyBydW4uXG4gKlxuICogQHBhcmFtIHRva2VuIC0gVGhlIHVuaXF1ZSB0b2tlbiBpZGVudGlmeWluZyB0aGUgaG9va1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SG9va0J5VG9rZW4odG9rZW46IHN0cmluZyk6IFByb21pc2U8SG9vaz4ge1xuICBjb25zdCB7IGhvb2sgfSA9IGF3YWl0IGdldEhvb2tCeVRva2VuV2l0aEtleSh0b2tlbik7XG4gIHJldHVybiBob29rO1xufVxuXG4vKipcbiAqIFJlc3VtZXMgYSB3b3JrZmxvdyBydW4gYnkgc2VuZGluZyBhIHBheWxvYWQgdG8gYSBob29rIGlkZW50aWZpZWQgYnkgaXRzIHRva2VuLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGV4dGVybmFsbHkgKGUuZy4sIGZyb20gYW4gQVBJIHJvdXRlIG9yIHNlcnZlciBhY3Rpb24pXG4gKiB0byBzZW5kIGRhdGEgdG8gYSBob29rIGFuZCByZXN1bWUgdGhlIGFzc29jaWF0ZWQgd29ya2Zsb3cgcnVuLlxuICpcbiAqIEBwYXJhbSB0b2tlbk9ySG9vayAtIFRoZSB1bmlxdWUgdG9rZW4gaWRlbnRpZnlpbmcgdGhlIGhvb2ssIG9yIHRoZSBob29rIG9iamVjdCBpdHNlbGZcbiAqIEBwYXJhbSBwYXlsb2FkIC0gVGhlIGRhdGEgcGF5bG9hZCB0byBzZW5kIHRvIHRoZSBob29rXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byB0aGUgaG9va1xuICogQHRocm93cyBFcnJvciBpZiB0aGUgaG9vayBpcyBub3QgZm91bmQgb3IgaWYgdGhlcmUncyBhbiBlcnJvciBkdXJpbmcgdGhlIHByb2Nlc3NcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGBgYHRzXG4gKiAvLyBJbiBhbiBBUEkgcm91dGVcbiAqIGltcG9ydCB7IHJlc3VtZUhvb2sgfSBmcm9tICdAd29ya2Zsb3cvY29yZS9ydW50aW1lJztcbiAqXG4gKiBleHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gKiAgIGNvbnN0IHsgdG9rZW4sIGRhdGEgfSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuICpcbiAqICAgdHJ5IHtcbiAqICAgICBjb25zdCBob29rID0gYXdhaXQgcmVzdW1lSG9vayh0b2tlbiwgZGF0YSk7XG4gKiAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBydW5JZDogaG9vay5ydW5JZCB9KTtcbiAqICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdIb29rIG5vdCBmb3VuZCcsIHsgc3RhdHVzOiA0MDQgfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdW1lSG9vazxUID0gYW55PihcbiAgdG9rZW5Pckhvb2s6IHN0cmluZyB8IEhvb2ssXG4gIHBheWxvYWQ6IFQsXG4gIGVuY3J5cHRpb25LZXlPdmVycmlkZT86IENyeXB0b0tleVxuKTogUHJvbWlzZTxIb29rPiB7XG4gIHJldHVybiBhd2FpdCB3YWl0ZWRVbnRpbCgoKSA9PiB7XG4gICAgcmV0dXJuIHRyYWNlKCdob29rLnJlc3VtZScsIGFzeW5jIChzcGFuKSA9PiB7XG4gICAgICBjb25zdCB3b3JsZCA9IGdldFdvcmxkKCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBob29rOiBIb29rO1xuICAgICAgICBsZXQgd29ya2Zsb3dSdW46IFdvcmtmbG93UnVuO1xuICAgICAgICBsZXQgZW5jcnlwdGlvbktleTogQ3J5cHRvS2V5IHwgdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuT3JIb29rID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldEhvb2tCeVRva2VuV2l0aEtleSh0b2tlbk9ySG9vayk7XG4gICAgICAgICAgaG9vayA9IHJlc3VsdC5ob29rO1xuICAgICAgICAgIHdvcmtmbG93UnVuID0gcmVzdWx0LnJ1bjtcbiAgICAgICAgICBlbmNyeXB0aW9uS2V5ID0gZW5jcnlwdGlvbktleU92ZXJyaWRlID8/IHJlc3VsdC5lbmNyeXB0aW9uS2V5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhvb2sgPSB0b2tlbk9ySG9vaztcbiAgICAgICAgICB3b3JrZmxvd1J1biA9IGF3YWl0IHdvcmxkLnJ1bnMuZ2V0KGhvb2sucnVuSWQpO1xuICAgICAgICAgIGlmIChlbmNyeXB0aW9uS2V5T3ZlcnJpZGUpIHtcbiAgICAgICAgICAgIGVuY3J5cHRpb25LZXkgPSBlbmNyeXB0aW9uS2V5T3ZlcnJpZGU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJhd0tleSA9IGF3YWl0IHdvcmxkLmdldEVuY3J5cHRpb25LZXlGb3JSdW4/Lih3b3JrZmxvd1J1bik7XG4gICAgICAgICAgICBlbmNyeXB0aW9uS2V5ID0gcmF3S2V5ID8gYXdhaXQgaW1wb3J0S2V5KHJhd0tleSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgLi4uQXR0cmlidXRlLkhvb2tUb2tlbihob29rLnRva2VuKSxcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuSG9va0lkKGhvb2suaG9va0lkKSxcbiAgICAgICAgICAuLi5BdHRyaWJ1dGUuV29ya2Zsb3dSdW5JZChob29rLnJ1bklkKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhlIHRhcmdldCBydW4ncyBjYXBhYmlsaXRpZXMgdG8gZW5zdXJlIHdlIGVuY29kZSB0aGVcbiAgICAgICAgLy8gcGF5bG9hZCBpbiBhIGZvcm1hdCB0aGUgcnVuJ3MgZGVwbG95bWVudCBjYW4gZGVjb2RlLiBGb3IgZXhhbXBsZSxcbiAgICAgICAgLy8gcnVucyBjcmVhdGVkIGJlZm9yZSBlbmNyeXB0aW9uIHN1cHBvcnQgd2FzIGFkZGVkIGNhbm5vdCBkZWNvZGVcbiAgICAgICAgLy8gdGhlICdlbmNyJyBzZXJpYWxpemF0aW9uIGZvcm1hdCwgYW5kIHJ1bnMgY3JlYXRlZCBiZWZvcmVcbiAgICAgICAgLy8gYnl0ZS1zdHJlYW0gZnJhbWluZyBzdXBwb3J0IGNhbm5vdCBkZWNvZGUgZnJhbWVkIGJ5dGUgc3RyZWFtcy5cbiAgICAgICAgY29uc3QgcmF3VmVyc2lvbiA9IHdvcmtmbG93UnVuLmV4ZWN1dGlvbkNvbnRleHQ/LndvcmtmbG93Q29yZVZlcnNpb247XG4gICAgICAgIGNvbnN0IGNhcGFiaWxpdGllcyA9IGdldFJ1bkNhcGFiaWxpdGllcyhcbiAgICAgICAgICB0eXBlb2YgcmF3VmVyc2lvbiA9PT0gJ3N0cmluZycgPyByYXdWZXJzaW9uIDogdW5kZWZpbmVkXG4gICAgICAgICk7XG4gICAgICAgIGlmICghY2FwYWJpbGl0aWVzLnN1cHBvcnRlZEZvcm1hdHMuaGFzKFNlcmlhbGl6YXRpb25Gb3JtYXQuRU5DUllQVEVEKSkge1xuICAgICAgICAgIGVuY3J5cHRpb25LZXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWh5ZHJhdGUgdGhlIHBheWxvYWQgZm9yIHN0b3JhZ2VcbiAgICAgICAgY29uc3Qgb3BzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuICAgICAgICBjb25zdCB2MUNvbXBhdCA9IGlzTGVnYWN5U3BlY1ZlcnNpb24oaG9vay5zcGVjVmVyc2lvbik7XG4gICAgICAgIGNvbnN0IGRlaHlkcmF0ZWRQYXlsb2FkID0gYXdhaXQgZGVoeWRyYXRlU3RlcFJldHVyblZhbHVlKFxuICAgICAgICAgIHBheWxvYWQsXG4gICAgICAgICAgaG9vay5ydW5JZCxcbiAgICAgICAgICBlbmNyeXB0aW9uS2V5LFxuICAgICAgICAgIG9wcyxcbiAgICAgICAgICBnbG9iYWxUaGlzLFxuICAgICAgICAgIHYxQ29tcGF0LFxuICAgICAgICAgIGNhcGFiaWxpdGllcy5mcmFtZWRCeXRlU3RyZWFtc1xuICAgICAgICApO1xuICAgICAgICAvLyBUaGVzZSBwYXlsb2FkLXN0cmVhbSBvcHMgYXJlIGZsdXNoZWQgaW4gdGhlIGJhY2tncm91bmQ7IHRoZVxuICAgICAgICAvLyBwcm9taXNlIGhhbmRlZCB0byB3YWl0VW50aWwgbXVzdCBuZXZlciByZWplY3QgKGFuIHVuY29uc3VtZWRcbiAgICAgICAgLy8gd2FpdFVudGlsIHJlamVjdGlvbiBjcmFzaGVzIHRoZSBwcm9jZXNzIGFzIHVuaGFuZGxlZFJlamVjdGlvbiksXG4gICAgICAgIC8vIHNvIHVuZXhwZWN0ZWQgZmFpbHVyZXMgYXJlIGxvZ2dlZCBpbnN0ZWFkLlxuICAgICAgICAvLyBOT1RFOiByZWplY3Rpb25zIHdpdGggYHVuZGVmaW5lZGAgYXJlIGFuIGV4cGVjdGVkIGFydGlmYWN0IG9mIHRoZVxuICAgICAgICAvLyB3ZWJob29rIGJ1bmRsZSBhbmQgYXJlIGlnbm9yZWQgZW50aXJlbHkuXG4gICAgICAgIHNhZmVXYWl0VW50aWwoUHJvbWlzZS5hbGwob3BzKSwgKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgIHJ1bnRpbWVMb2dnZXIud2FybignQmFja2dyb3VuZCBmbHVzaCBvZiBob29rIHBheWxvYWQgb3BzIGZhaWxlZCcsIHtcbiAgICAgICAgICAgIHdvcmtmbG93UnVuSWQ6IGhvb2sucnVuSWQsXG4gICAgICAgICAgICBob29rSWQ6IGhvb2suaG9va0lkLFxuICAgICAgICAgICAgZXJyb3I6IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgaG9va19yZWNlaXZlZCBldmVudCB3aXRoIHRoZSBwYXlsb2FkXG4gICAgICAgIGF3YWl0IHdvcmxkLmV2ZW50cy5jcmVhdGUoXG4gICAgICAgICAgaG9vay5ydW5JZCxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBldmVudFR5cGU6ICdob29rX3JlY2VpdmVkJyxcbiAgICAgICAgICAgIHNwZWNWZXJzaW9uOiBTUEVDX1ZFUlNJT05fQ1VSUkVOVCxcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQ6IGhvb2suaG9va0lkLFxuICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgIC4uLih2MUNvbXBhdCA/IHt9IDogeyB0b2tlbjogaG9vay50b2tlbiB9KSxcbiAgICAgICAgICAgICAgcGF5bG9hZDogZGVoeWRyYXRlZFBheWxvYWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgeyB2MUNvbXBhdCB9XG4gICAgICAgICk7XG5cbiAgICAgICAgc3Bhbj8uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgLi4uQXR0cmlidXRlLldvcmtmbG93TmFtZSh3b3JrZmxvd1J1bi53b3JrZmxvd05hbWUpLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB0cmFjZUNhcnJpZXIgPSB3b3JrZmxvd1J1bi5leGVjdXRpb25Db250ZXh0Py50cmFjZUNhcnJpZXI7XG5cbiAgICAgICAgaWYgKHRyYWNlQ2Fycmllcikge1xuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhd2FpdCBnZXRTcGFuQ29udGV4dEZvclRyYWNlQ2Fycmllcih0cmFjZUNhcnJpZXIpO1xuICAgICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgICBzcGFuPy5hZGRMaW5rPy4oeyBjb250ZXh0IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlLXRyaWdnZXIgdGhlIHdvcmtmbG93IGFnYWluc3QgdGhlIGRlcGxveW1lbnQgSUQgYXNzb2NpYXRlZFxuICAgICAgICAvLyB3aXRoIHRoZSB3b3JrZmxvdyBydW4gdGhhdCB0aGUgaG9vayBiZWxvbmdzIHRvXG4gICAgICAgIGF3YWl0IHdvcmxkLnF1ZXVlKFxuICAgICAgICAgIGdldFdvcmtmbG93UXVldWVOYW1lKHdvcmtmbG93UnVuLndvcmtmbG93TmFtZSksXG4gICAgICAgICAge1xuICAgICAgICAgICAgcnVuSWQ6IGhvb2sucnVuSWQsXG4gICAgICAgICAgICAvLyBhdHRhY2ggdGhlIHRyYWNlIGNhcnJpZXIgZnJvbSB0aGUgd29ya2Zsb3cgcnVuXG4gICAgICAgICAgICB0cmFjZUNhcnJpZXI6XG4gICAgICAgICAgICAgIHdvcmtmbG93UnVuLmV4ZWN1dGlvbkNvbnRleHQ/LnRyYWNlQ2FycmllciA/PyB1bmRlZmluZWQsXG4gICAgICAgICAgfSBzYXRpc2ZpZXMgV29ya2Zsb3dJbnZva2VQYXlsb2FkLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGRlcGxveW1lbnRJZDogd29ya2Zsb3dSdW4uZGVwbG95bWVudElkLFxuICAgICAgICAgICAgc3BlY1ZlcnNpb246IHdvcmtmbG93UnVuLnNwZWNWZXJzaW9uID8/IFNQRUNfVkVSU0lPTl9MRUdBQ1ksXG4gICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBob29rO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNwYW4/LnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgIC4uLkF0dHJpYnV0ZS5Ib29rVG9rZW4oXG4gICAgICAgICAgICB0eXBlb2YgdG9rZW5Pckhvb2sgPT09ICdzdHJpbmcnID8gdG9rZW5Pckhvb2sgOiB0b2tlbk9ySG9vay50b2tlblxuICAgICAgICAgICksXG4gICAgICAgICAgLi4uQXR0cmlidXRlLkhvb2tGb3VuZChmYWxzZSksXG4gICAgICAgIH0pO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJlc3VtZXMgYSB3ZWJob29rIGJ5IHNlbmRpbmcgYSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1JlcXVlc3QgfCBSZXF1ZXN0fVxuICogb2JqZWN0IHRvIGEgaG9vayBpZGVudGlmaWVkIGJ5IGl0cyB0b2tlbi5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBleHRlcm5hbGx5IChlLmcuLCBmcm9tIGFuIEFQSSByb3V0ZSBvciBzZXJ2ZXIgYWN0aW9uKVxuICogdG8gc2VuZCBhIHJlcXVlc3QgdG8gYSB3ZWJob29rIGFuZCByZXN1bWUgdGhlIGFzc29jaWF0ZWQgd29ya2Zsb3cgcnVuLlxuICpcbiAqIEBwYXJhbSB0b2tlbiAtIFRoZSB1bmlxdWUgdG9rZW4gaWRlbnRpZnlpbmcgdGhlIGhvb2tcbiAqIEBwYXJhbSByZXF1ZXN0IC0gVGhlIHJlcXVlc3QgdG8gc2VuZCB0byB0aGUgaG9va1xuICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gdGhlIHJlc3BvbnNlXG4gKiBAdGhyb3dzIEVycm9yIGlmIHRoZSBob29rIGlzIG5vdCBmb3VuZCBvciBpZiB0aGVyZSdzIGFuIGVycm9yIGR1cmluZyB0aGUgcHJvY2Vzc1xuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIC8vIEluIGFuIEFQSSByb3V0ZVxuICogaW1wb3J0IHsgcmVzdW1lV2ViaG9vayB9IGZyb20gJ0B3b3JrZmxvdy9jb3JlL3J1bnRpbWUnO1xuICpcbiAqIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IFJlcXVlc3QpIHtcbiAqICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXF1ZXN0LnVybCk7XG4gKiAgIGNvbnN0IHRva2VuID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ3Rva2VuJyk7XG4gKlxuICogICBpZiAoIXRva2VuKSB7XG4gKiAgICAgcmV0dXJuIG5ldyBSZXNwb25zZSgnTWlzc2luZyB0b2tlbicsIHsgc3RhdHVzOiA0MDAgfSk7XG4gKiAgIH1cbiAqXG4gKiAgIHRyeSB7XG4gKiAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXN1bWVXZWJob29rKHRva2VuLCByZXF1ZXN0KTtcbiAqICAgICByZXR1cm4gcmVzcG9uc2U7XG4gKiAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgICAgcmV0dXJuIG5ldyBSZXNwb25zZSgnV2ViaG9vayBub3QgZm91bmQnLCB7IHN0YXR1czogNDA0IH0pO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3VtZVdlYmhvb2soXG4gIHRva2VuOiBzdHJpbmcsXG4gIHJlcXVlc3Q6IFJlcXVlc3Rcbik6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgY29uc3QgeyBob29rLCBlbmNyeXB0aW9uS2V5IH0gPSBhd2FpdCBnZXRIb29rQnlUb2tlbldpdGhLZXkodG9rZW4pO1xuXG4gIC8vIE9ubHkgd2ViaG9va3MgY2FuIGJlIHJlc3VtZWQgdmlhIHRoZSBwdWJsaWMgZW5kcG9pbnQuXG4gIC8vIElmIHRoZSBob29rIHdhcyBjcmVhdGVkIHZpYSBjcmVhdGVIb29rKCkgKGlzV2ViaG9vayAhPT0gdHJ1ZSksXG4gIC8vIHRocm93IHRoZSBzYW1lIFwibm90IGZvdW5kXCIgZXJyb3IgdGhlIHdvcmxkIHdvdWxkIHRocm93IGZvciBhIG1pc3NpbmdcbiAgLy8gdG9rZW4uIFRoaXMgcHJldmVudHMgbGVha2luZyB0aGF0IHRoZSB0b2tlbiBpcyB2YWxpZC5cbiAgaWYgKGhvb2suaXNXZWJob29rID09PSBmYWxzZSkge1xuICAgIHRocm93IG5ldyBIb29rTm90Rm91bmRFcnJvcih0b2tlbik7XG4gIH1cblxuICBsZXQgcmVzcG9uc2U6IFJlc3BvbnNlIHwgdW5kZWZpbmVkO1xuICBsZXQgcmVzcG9uc2VSZWFkYWJsZTogUmVhZGFibGVTdHJlYW08UmVzcG9uc2U+IHwgdW5kZWZpbmVkO1xuICBpZiAoXG4gICAgaG9vay5tZXRhZGF0YSAmJlxuICAgIHR5cGVvZiBob29rLm1ldGFkYXRhID09PSAnb2JqZWN0JyAmJlxuICAgICdyZXNwb25kV2l0aCcgaW4gaG9vay5tZXRhZGF0YVxuICApIHtcbiAgICBpZiAoaG9vay5tZXRhZGF0YS5yZXNwb25kV2l0aCA9PT0gJ21hbnVhbCcpIHtcbiAgICAgIGNvbnN0IHsgcmVhZGFibGUsIHdyaXRhYmxlIH0gPSBuZXcgVHJhbnNmb3JtU3RyZWFtPFJlc3BvbnNlLCBSZXNwb25zZT4oKTtcbiAgICAgIHJlc3BvbnNlUmVhZGFibGUgPSByZWFkYWJsZTtcblxuICAgICAgLy8gVGhlIHJlcXVlc3QgaW5zdGFuY2UgaW5jbHVkZXMgdGhlIHdyaXRhYmxlIHN0cmVhbSB3aGljaCB3aWxsIGJlIHVzZWRcbiAgICAgIC8vIHRvIHdyaXRlIHRoZSByZXNwb25zZSB0byB0aGUgY2xpZW50IGZyb20gd2l0aGluIHRoZSB3b3JrZmxvdyBydW5cbiAgICAgIChyZXF1ZXN0IGFzIGFueSlbV0VCSE9PS19SRVNQT05TRV9XUklUQUJMRV0gPSB3cml0YWJsZTtcbiAgICB9IGVsc2UgaWYgKGhvb2subWV0YWRhdGEucmVzcG9uZFdpdGggaW5zdGFuY2VvZiBSZXNwb25zZSkge1xuICAgICAgcmVzcG9uc2UgPSBob29rLm1ldGFkYXRhLnJlc3BvbmRXaXRoO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgV29ya2Zsb3dSdW50aW1lRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIFxcYHJlc3BvbmRXaXRoXFxgIHZhbHVlOiAke2hvb2subWV0YWRhdGEucmVzcG9uZFdpdGh9YCxcbiAgICAgICAgeyBzbHVnOiBFUlJPUl9TTFVHUy5XRUJIT09LX0lOVkFMSURfUkVTUE9ORF9XSVRIX1ZBTFVFIH1cbiAgICAgICk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIE5vIGByZXNwb25kV2l0aGAgdmFsdWUgaW1wbGllcyB0aGUgZGVmYXVsdCBiZWhhdmlvciBvZiByZXR1cm5pbmcgYSAyMDJcbiAgICByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7IHN0YXR1czogMjAyIH0pO1xuICB9XG5cbiAgYXdhaXQgcmVzdW1lSG9vayhob29rLCByZXF1ZXN0LCBlbmNyeXB0aW9uS2V5KTtcblxuICBpZiAocmVzcG9uc2VSZWFkYWJsZSkge1xuICAgIC8vIFdhaXQgZm9yIHRoZSByZWFkYWJsZSBzdHJlYW0gdG8gZW1pdCBvbmUgY2h1bmssXG4gICAgLy8gd2hpY2ggaXMgdGhlIGBSZXNwb25zZWAgb2JqZWN0XG4gICAgY29uc3QgcmVhZGVyID0gcmVzcG9uc2VSZWFkYWJsZS5nZXRSZWFkZXIoKTtcbiAgICBjb25zdCBjaHVuayA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgaWYgKGNodW5rLnZhbHVlKSB7XG4gICAgICByZXNwb25zZSA9IGF3YWl0IG1hdGVyaWFsaXplUmVzcG9uc2VCb2R5KGNodW5rLnZhbHVlKTtcbiAgICB9XG4gICAgYXdhaXQgcmVhZGVyLmNhbmNlbCgpO1xuICB9XG5cbiAgaWYgKCFyZXNwb25zZSkge1xuICAgIHRocm93IG5ldyBXb3JrZmxvd1J1bnRpbWVFcnJvcignV29ya2Zsb3cgcnVuIGRpZCBub3Qgc2VuZCBhIHJlc3BvbnNlJywge1xuICAgICAgc2x1ZzogRVJST1JfU0xVR1MuV0VCSE9PS19SRVNQT05TRV9OT1RfU0VOVCxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbURPLFNBQVMsc0JBQXNCLE9BQU87QUFDekMsa0JBQWdCLE9BQU8sWUFBWSxNQUFNLElBQUksQ0FBQyxNQUFJO0FBQUEsSUFDMUMsRUFBRTtBQUFBLElBQ0Y7QUFBQSxFQUNKLENBQUMsQ0FBQztBQUNWO0FB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O0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKO0FBQ0EsU0FBUyxpQkFBaUI7QUFDdEIsU0FBTztBQUFBLElBQ0g7QUFBQSxJQUNBO0FBQUEsSUFDQSxJQUFJLE9BQU8sU0FBUyxZQUFZLEtBQUssR0FBRyxDQUFDLFFBQVEsSUFBSTtBQUFBLElBQ3JEO0FBQUEsRUFDSjtBQUNKO0FBUFM7QUFRVCxJQUFNLHFCQUFxQjtBQUFBLEVBQ3ZCO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQTtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsTUFDSTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FB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QUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLFlBQVk7QUFBQSxNQUNSLFlBQVk7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNOO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNILFlBQVk7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLG9CQUFvQjtBQUFBLE1BQ2hCLFlBQVk7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFDQSxZQUFZO0FBQUEsTUFDUixZQUFZO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLGdCQUFnQjtBQUFBLE1B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InJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInoiLCAieiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJGYXRhbEVycm9yIiwgInoiLCAieiIsICJwYXJzZWQiLCAid3JpdGVQcm9ncmVzc0NodW5rIiwgImNsb3NlUHJvZ3Jlc3NTdHJlYW0iLCAiQ2xpZW50IiwgIndpdGhQZ0NsaWVudCIsICJDbGllbnQiLCAicXVlcnlSb3dzIiwgInJlYWQiLCAidXRpbHMiLCAidXRpbHMiLCAidXRpbHMiLCAicG9zIiwgInV0aWxzIiwgInV0aWxzIiwgInN0YXJ0IiwgInV0aWxzIiwgImNvbHVtbktleXMiLCAicmF3SGVhZGVyIiwgIkZhdGFsRXJyb3IiLCAicmVhZCIsICJ3aXRoUGdDbGllbnQiLCAiZW1pdFByb2dyZXNzU3RlcCIsICJ3cml0ZVByb2dyZXNzQ2h1bmsiLCAiY2xvc2VQcm9ncmVzc1N0ZXAiLCAiY2xvc2VQcm9ncmVzc1N0cmVhbSIsICJxdWVyeVJvd3MiLCAiY3JlYXRlZCIsICJzZXREeW5hbWljUGFnZXMiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiUmVwbGF5RGl2ZXJnZW5jZUVycm9yIiwgIldvcmtmbG93UnVudGltZUVycm9yIiwgInBhcnNlV29ya2Zsb3dOYW1lIiwgIlNQRUNfVkVSU0lPTl9DVVJSRU5UIiwgIlNQRUNfVkVSU0lPTl9MRUdBQ1kiLCAiaW1wb3J0S2V5IiwgIldvcmtmbG93U3VzcGVuc2lvbiIsICJydW50aW1lTG9nZ2VyIiwgImdldFdvcmtmbG93UXVldWVOYW1lIiwgImdldFdvcmxkIiwgIkF0dHJpYnV0ZSIsICJ0cmFjZSIsICJXb3JrZmxvd1N1c3BlbnNpb24iLCAiRVJST1JfU0xVR1MiLCAiV29ya2Zsb3dSdW50aW1lRXJyb3IiLCAicnVudGltZUxvZ2dlciIsICJBdHRyaWJ1dGUiLCAidHJhY2UiLCAiZ2V0V29ybGQiLCAiZ2V0V29ybGRIYW5kbGVycyJdCn0K
