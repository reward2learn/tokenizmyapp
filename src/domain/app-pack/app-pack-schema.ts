/**
 * App Pack — Zod schemas for AI-generated "application pack" definitions.
 *
 * An application pack is a collection of department applications (HR,
 * Marketing/Memberships, Sales Reporting, Ecommerce Marketplace, Referrals,
 * Back Office, Legal, Finance, Compliance, CEO Overview, ...). Each app is
 * fully derived by AI from a natural-language requirement and carries:
 *
 *   1. Use cases        — UC-XXX-NN with auth tiers + routes
 *   2. W3 Schema        — models with W3C XSD field types + schema.org mappings
 *   3. ZenStack         — compiled from the models at build time (zmodel)
 *   4. Templates        — page block types (dynamic_form, kpi_cards, ...)
 *   5. Navigational Dynamic Pages — slugs, nav sections, security groups
 *   6. UX Workflow      — stages + actions (what the user does in the app)
 *   7. Knowledge Snippets — per-app knowledge base entries
 *
 * The CEO Overview app is generated with cross-app visibility: its pages and
 * knowledge reference every department app in the pack.
 */

import { z } from 'zod';
import { schemaModelZod, useCaseZod, pageZod } from '@/domain/ai/schema-generation-schema';

// ── Pack-level (decomposition) ───────────────────────────

export const appPackAppBriefZod = z.object({
  id: z.string().describe('App id in kebab-case, e.g. "hr" or "sales-reporting"'),
  name: z.string().describe('Human-readable app name, e.g. "HR Management"'),
  department: z.string().describe('Business department this app serves, e.g. "Human Resources"'),
  summary: z.string().describe('One-paragraph description of what this app does'),
  templateId: z
    .string()
    .describe(
      'Best-fit template id from: financial-analytics, restaurant, hotel, ecommerce-retail, healthcare, supply-chain, real-estate, education, professional-services, manufacturing',
    ),
});

export const appPackDecompositionZod = z.object({
  packId: z.string().describe('Pack id in kebab-case, e.g. "ops-department-pack"'),
  name: z.string().describe('Pack display name'),
  description: z.string().describe('High-level description of the whole pack'),
  apps: z.array(appPackAppBriefZod).describe('One brief per department application'),
  ceoOverview: z.object({
    purpose: z.string().describe('What the CEO Overview app does across all departments'),
    kpis: z.array(z.string()).describe('Cross-department KPIs the CEO dashboard should surface'),
  }),
});

// ── Per-app (detailed definition) ─────────────────────────

export const appUxActionZod = z.object({
  action: z.string().describe('Action label, e.g. "Create new employee"'),
  targetPage: z.string().describe('Route path this action navigates to'),
  targetModel: z.string().optional().describe('Primary model the action operates on'),
  actionType: z
    .enum(['create', 'read', 'update', 'delete', 'approve', 'export', 'notify', 'navigate', 'review'])
    .describe('Kind of action'),
});

export const appUxStageZod = z.object({
  stage: z.string().describe('Workflow stage name, e.g. "Onboarding"'),
  description: z.string().optional().describe('What this stage accomplishes'),
  actions: z.array(appUxActionZod).describe('Actions available in this stage'),
});

export const appNavZod = z.object({
  label: z.string().describe('Nav menu label for this app'),
  icon: z.string().optional().describe('MUI icon name hint (e.g. "People", "Payments")'),
  pages: z.array(z.string()).describe('Page slugs grouped under this app in the nav'),
});

export const appKnowledgeSnippetZod = z.object({
  key: z.string().describe('Snippet key in kebab-case, e.g. "hr-onboarding-steps"'),
  title: z.string().describe('Snippet title'),
  content: z.string().describe('Knowledge content (markdown) — policies, steps, guidance'),
});

export const appPackAppDefinitionZod = z.object({
  appId: z.string().describe('App id matching the decomposition brief'),
  appName: z.string(),
  department: z.string(),
  w3cStandard: z.string().describe('W3C XSD / data standard applied (e.g. "UBL for invoices")'),
  schemaOrgType: z.string().describe('Primary schema.org type'),
  models: schemaModelZod.array().describe('3-8 ZenStack models (no id/tenantSlug/createdAt/updatedAt base fields)'),
  useCases: useCaseZod.array().describe('Use cases for this app (UC-XXX-NN)'),
  pages: pageZod.array().describe('Pages for this app (auth tiers: public/pin/google)'),
  nav: appNavZod,
  uxWorkflow: z.array(appUxStageZod).describe('End-to-end UX workflow stages for this app'),
  knowledgeSnippets: z.array(appKnowledgeSnippetZod).describe('Knowledge snippets for this app'),
});

// ── Materialized run result (persisted) ───────────────────

export const appPackRunResultZod = z.object({
  packId: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
  apps: z.array(appPackAppDefinitionZod),
  ceoOverview: z.object({
    purpose: z.string(),
    kpis: z.array(z.string()),
  }),
  materialized: z.object({
    pages: z.number(),
    navItems: z.number(),
    snippets: z.number(),
    groups: z.number(),
    zmodels: z.number(),
  }),
});

export type AppPackBrief = z.infer<typeof appPackAppBriefZod>;
export type AppPackDecomposition = z.infer<typeof appPackDecompositionZod>;
export type AppUxAction = z.infer<typeof appUxActionZod>;
export type AppUxStage = z.infer<typeof appUxStageZod>;
export type AppNav = z.infer<typeof appNavZod>;
export type AppKnowledgeSnippet = z.infer<typeof appKnowledgeSnippetZod>;
export type AppPackAppDefinition = z.infer<typeof appPackAppDefinitionZod>;
export type AppPackRunResult = z.infer<typeof appPackRunResultZod>;
