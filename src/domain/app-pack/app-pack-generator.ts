/**
 * App Pack — AI Generator
 *
 * Two-stage AI generation using the Vercel AI SDK `generateObject()`:
 *
 *   Stage 1 — DECOMPOSE: the platform admin's requirement is turned into a
 *             structured pack definition (apps per department + CEO overview).
 *   Stage 2 — GENERATE (per app): each department app gets a full definition:
 *             W3C-aligned models, use cases, pages, nav, UX workflow and
 *             knowledge snippets — grounded in the platform knowledge base and
 *             the W3C XSD standard for its template.
 *
 * `mock*` variants return deterministic results for testing without an AI key.
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  appPackDecompositionZod,
  appPackAppDefinitionZod,
  type AppPackDecomposition,
  type AppPackAppDefinition,
  type AppPackBrief,
} from './app-pack-schema';
import { meterAiUsage } from '@/domain/billing/credit-service';

// ── W3C XSD Standards + schema.org types per template ────

const W3C_STANDARDS: Record<string, string> = {
  'financial-analytics': 'FpML (Financial Products Markup Language) for derivatives and FIXML for real-time financial information exchange',
  restaurant: 'UBL (Universal Business Language) for invoices/orders and GS1 for product/SKU data',
  hotel: 'OTA (OpenTravel Alliance) for room bookings and availability',
  'ecommerce-retail': 'UBL for electronic orders and Inventory Feeds for SKU/pricing constraints',
  healthcare: 'HL7/CDA for electronic health records and claims processing validation',
  'supply-chain': 'UBL for shipping notices and B2B logistics manifest documents',
  'real-estate': 'RETS (Real Estate Transaction Standard) for property listings',
  education: 'IMS Global (LTI, QTI) for learning tools interoperability and assessment',
  'professional-services': 'UBL for billing/invoices and project management data',
  manufacturing: 'B2MML (Business To Manufacturing Markup Language) for production data',
  'spas-and-wellness': 'HL7 for appointment scheduling and client health records, ISO 19011 for wellness service quality management',
  'delivery-marketplace': 'UBL (Universal Business Language) for orders/invoices and ISO 20022 for payment messaging and escrow settlements',
};

const SCHEMA_ORG_TYPES: Record<string, string> = {
  'financial-analytics': 'FinancialService',
  restaurant: 'Restaurant',
  hotel: 'Hotel',
  'ecommerce-retail': 'Store',
  healthcare: 'MedicalOrganization',
  'supply-chain': 'DeliveryEvent',
  'real-estate': 'RealEstateAgent',
  education: 'EducationalOrganization',
  'professional-services': 'ProfessionalService',
  manufacturing: 'Manufacturer',
  'spas-and-wellness': 'HealthAndBeautyBusiness',
  'delivery-marketplace': 'WebApplication',
};

// NOTE: must stay a subset of the ZenStack BlockType enum in
// zenstack/schema.zmodel — dynamic_form is NOT a valid enum value, so model
// CRUD surfaces are expressed with ops_admin_tabs / doc_markdown instead.
const AVAILABLE_BLOCKS = [
  'hero', 'kpi_cards', 'metric_grid', 'chart_financial', 'lever_accordion',
  'action_checklist', 'doc_markdown', 'pnl_table', 'ops_admin_tabs',
  'z_report_form', 'costs_form', 'calendar_import', 'chat_panel',
  'review_blocks', 'reports_rollup', 'sheet_viewer', 'pack_table',
  'feature_grid', 'testimonials',
  'marketing_hero', 'capability_marquee', 'product_showcase', 'customer_proof',
  'faq', 'cta_banner', 'pricing_table',
];

const AUTH_TIERS = ['public', 'pin', 'google'] as const;

const MODEL = 'gpt-5.5';

// ── Stage 1: decompose the requirement into apps ─────────

function buildDecomposeSystemPrompt(_knowledgeBase?: string): string {
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
   ${Object.keys(W3C_STANDARDS).join(', ')}
   CEO Overview should use "financial-analytics" (it drives transparency,
   insight and realtime actionable items from every department).
4. **CEO Overview app**: MUST be included as the last app. Its summary must
   state that it has access to every department app's knowledge base and
   surfaces cross-department KPIs, transparency, efficiency and actionable
   insights.
5. **Coverage**: The apps must together cover the complete requirement — no
   department mentioned in the requirement may be missing.
6. **Pack ids**: kebab-case, e.g. "ops-department-pack".

## Output

Return the pack decomposition: id, name, description, per-app briefs and the
CEO overview purpose + KPIs.`;
}

export async function decomposePackFromPrompt(
  userPrompt: string,
  tenantSlug: string,
  knowledgeBase?: string,
): Promise<AppPackDecomposition> {
  const { object, usage } = await generateObject({
    model: openai(MODEL),
    schema: appPackDecompositionZod,
    system: buildDecomposeSystemPrompt(knowledgeBase),
    prompt: userPrompt,
    temperature: 0.2,
  });

  // Platform key (env) — always metered. Non-blocking: a metering failure
  // must never break generation; the pre-flight gate in the materializer is
  // the enforcement point.
  try {
    await meterAiUsage({
      tenantSlug,
      model: MODEL,
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      keySource: 'env',
      refType: 'app_pack',
      refId: 'decompose',
    });
  } catch (err) {
    console.warn('[app-pack-generator] Decompose metering failed (non-blocking):', err instanceof Error ? err.message : err);
  }

  return object;
}

// ── Stage 2: generate a full definition for one app ──────

function buildAppSystemPrompt(
  brief: AppPackBrief,
  ceoPurpose: string,
  ceoKpis: string[],
  allApps: AppPackBrief[],
  knowledgeBase?: string,
): string {
  const w3cStandard = W3C_STANDARDS[brief.templateId] ?? 'schema.org';
  const schemaOrgType = SCHEMA_ORG_TYPES[brief.templateId] ?? 'LocalBusiness';

  return `You are a W3C schema architect, ZenStack ORM expert and product designer.

Design the "${brief.name}" application (department: ${brief.department}) for a
tenant app platform. It is one app inside a pack; the pack also contains:
${allApps.map((a) => `- ${a.name} (${a.department})`).join('\n')}

The CEO Overview app exists so leadership can see into every department —
design this app so its data, pages and knowledge feed that transparency.

## Rules

1. **W3C XSD**: Use ${w3cStandard} for field types and validation constraints.
2. **schema.org mapping**: Map fields to schema.org properties (schemaOrgProperty).
3. **Base fields auto-added**: id, tenantSlug, createdAt, updatedAt are added
   automatically — never include them in the fields array.
4. **Monetary values**: decimal type with schemaOrgProperty "offers.price".
5. **Status fields**: enum with meaningful enumValues (pending, active, ...).
6. **Models**: 3-8 models depending on the department's complexity.
7. **Use cases**: UC-XXX-NN format; auth: ${AUTH_TIERS.join('/')} (public =
   customer-facing, pin = staff/ops, google = exec/leadership).
8. **Pages**: slugs prefixed with the app id (e.g. "/hr/employees"); blockTypes
   from: ${AVAILABLE_BLOCKS.join(', ')}. Use "ops_admin_tabs" for model
   CRUD/admin surfaces, "kpi_cards"/"chart_financial"/"reports_rollup" for
   reporting, "action_checklist" for actionable items, "doc_markdown" for
   policies, "sheet_viewer" for raw data.
9. **Nav**: one nav section per app with a clear label + icon hint; pages list.
10. **UX workflow**: 2-5 stages describing the end-to-end user journey inside
    the app (e.g. Onboarding → Daily Ops → Review), each with concrete actions
    (create/read/update/approve/export/notify/review) pointing at real pages.
11. **Knowledge snippets**: 3-6 snippets (key, title, content in markdown) —
    policies, step-by-step procedures, definitions and guidance specific to
    this department's app. These form the app's knowledge base.
12. **schema.org type**: primary type is "${schemaOrgType}".
13. **Table names**: snake_case plural; **field names**: camelCase.
14. **Field width**: 12 full-width, 6 half-width, 4 third-width.

## Knowledge base (platform context)

${knowledgeBase ? knowledgeBase : '(none provided — use general best practices)'}

## CEO context

The CEO Overview app purpose: ${ceoPurpose}
CEO KPIs (this app's data should support these): ${ceoKpis.join(', ')}

## Output

Return the complete app definition (models, use cases, pages, nav, UX workflow,
knowledge snippets).`;
}

export async function generateAppDefinition(
  brief: AppPackBrief,
  ceoPurpose: string,
  ceoKpis: string[],
  allApps: AppPackBrief[],
  tenantSlug: string,
  knowledgeBase?: string,
): Promise<AppPackAppDefinition> {
  const { object, usage } = await generateObject({
    model: openai(MODEL),
    schema: appPackAppDefinitionZod,
    system: buildAppSystemPrompt(brief, ceoPurpose, ceoKpis, allApps, knowledgeBase),
    prompt: `Design the "${brief.name}" application in full detail.`,
    temperature: 0.2,
  });

  // Platform key (env) — always metered. Non-blocking (see decomposePackFromPrompt).
  try {
    await meterAiUsage({
      tenantSlug,
      model: MODEL,
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      keySource: 'env',
      refType: 'app_pack',
      refId: brief.id,
    });
  } catch (err) {
    console.warn('[app-pack-generator] App definition metering failed (non-blocking):', err instanceof Error ? err.message : err);
  }

  return object;
}

// ── Mock variants (deterministic, no AI key needed) ──────

export function mockDecomposePack(): AppPackDecomposition {
  return {
    packId: 'massage-operations-pack',
    name: 'Massage Spa Operations Pack',
    description:
      'Massage spa operations app pack: Appointments & Booking, Client Records, Therapist Management, Spa Finance, and Owner Dashboard with cross-department KPIs.',
    apps: [
      { id: 'appointments-booking', name: 'Appointments & Booking', department: 'Operations', summary: 'Schedule and manage massage appointments with clients.', templateId: 'spas-and-wellness' },
      { id: 'client-records', name: 'Client Records', department: 'Operations', summary: 'Maintain client profiles, preferences, and service history.', templateId: 'spas-and-wellness' },
      { id: 'therapist-management', name: 'Therapist Management', department: 'Operations', summary: 'Manage therapist schedules, qualifications, and performance.', templateId: 'spas-and-wellness' },
      { id: 'spa-finance', name: 'Spa Finance', department: 'Finance', summary: 'Track spa revenue, expenses, and financial reports.', templateId: 'financial-analytics' },
      { id: 'owner-dashboard', name: 'Owner Dashboard', department: 'Executive Leadership', summary: 'Cross-department transparency dashboard with access to every department knowledge base and realtime actionable items.', templateId: 'financial-analytics' },
    ],
    ceoOverview: {
      purpose: 'Aggregate KPIs and knowledge from every department app into a single leadership overview with actionable items.',
      kpis: ['revenue', 'grossMargin', 'headcount', 'salesTargetAchievement', 'cashflow', 'complianceStatus'],
    },
  };
}

export function mockGenerateAppDefinition(brief: AppPackBrief): AppPackAppDefinition {
  const modelName = brief.id === 'appointments-booking' ? 'Appointment' : brief.id === 'client-records' ? 'Client' : brief.id === 'therapist-management' ? 'Therapist' : brief.id === 'spa-finance' ? 'FinancialRecord' : 'DepartmentKpi';
  const tableName = `${modelName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}s`;
  return {
    appId: brief.id,
    appName: brief.name,
    department: brief.department,
    w3cStandard: W3C_STANDARDS[brief.templateId] ?? 'schema.org',
    schemaOrgType: SCHEMA_ORG_TYPES[brief.templateId] ?? 'LocalBusiness',
    models: [
      {
        name: modelName,
        tableName,
        fields: [
          { name: 'name', type: 'string', required: true, schemaOrgProperty: 'name', label: 'Name', width: 12 },
          { name: 'status', type: 'enum', required: true, enumValues: ['pending', 'active', 'archived'], label: 'Status', width: 6 },
          { name: 'notes', type: 'text', required: false, label: 'Notes', width: 12 },
        ],
      },
    ],
    useCases: [
      { id: `UC-${brief.id.toUpperCase().slice(0, 4)}-01`, title: `Manage ${brief.name} records`, auth: 'pin', route: `/${brief.id}`, blockTypes: ['ops_admin_tabs'], models: [modelName] },
    ],
    pages: [
      { slug: `${brief.id}`, title: brief.name, authTier: 'pin', blockTypes: ['kpi_cards', 'ops_admin_tabs'], navLabel: brief.name },
    ],
    nav: { label: brief.name, icon: 'Dashboard', pages: [brief.id] },
    uxWorkflow: [
      { stage: 'Daily operations', description: 'Record and review daily entries', actions: [{ action: `Open ${brief.name}`, targetPage: `/${brief.id}`, actionType: 'navigate' }, { action: 'Add record', targetPage: `/${brief.id}`, targetModel: modelName, actionType: 'create' }] },
      { stage: 'Review', description: 'Review and approve entries', actions: [{ action: 'Approve entries', targetPage: `/${brief.id}`, actionType: 'approve' }, { action: 'Export report', targetPage: `/${brief.id}`, actionType: 'export' }] },
    ],
    knowledgeSnippets: [
      { key: `${brief.id}-overview`, title: `${brief.name} — Overview`, content: `# ${brief.name}\n\nStandard operating guidance for the ${brief.department} app: record entries daily, review weekly, escalate exceptions to the CEO Overview dashboard.` },
      { key: `${brief.id}-best-practices`, title: `${brief.name} — Best Practices`, content: `## Best Practices\n\n1. Keep records current daily.\n2. Flag anomalies immediately.\n3. Use the action checklist for follow-ups.` },
    ],
  };
}
