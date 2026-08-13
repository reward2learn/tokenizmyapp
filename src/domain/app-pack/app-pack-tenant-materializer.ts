/**
 * App Pack Tenant Materializer — suite mode helper.
 *
 * Bridges the wizard's suite mode (multi-template selection) with the existing
 * app-pack generation pipeline. Called by the tenant POST route when
 * templateMode === 'suite'.
 *
 * Flow:
 *   1. Decompose the requirement into per-department app briefs
 *   2. Generate full definitions for each app (mock or AI)
 *   3. Build AppPackConfig with SuiteAppInstance entries
 *   4. Persist the config into the tenant's metadata.appPack
 *   5. Return the AppPackConfig for the API response
 */

import {
  decomposePackFromPrompt,
  generateAppDefinition,
  mockDecomposePack,
  mockGenerateAppDefinition,
} from './app-pack-generator';
import type {
  AppPackDecomposition,
  AppPackAppDefinition,
} from './app-pack-schema';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';

// ── Input types ────────────────────────────────────────────

export interface MaterializeAppPackInput {
  /** Tenant slug (e.g. "redruby-bali"). */
  tenantSlug: string;
  /** Display name for the pack. */
  displayName: string;
  /** Selected template IDs from the wizard (e.g. ["spas-and-wellness", "financial-analytics"]). */
  templates: string[];
  /** Business description prompt for AI generation. */
  prompt?: string;
  /** When true, uses deterministic mock pipeline (no OpenAI key needed). */
  mock?: boolean;
  /** Preset key if a preset was selected (e.g. "massage-spa"). */
  presetKey?: string;
  /** Preset app definitions (when using a preset, these override AI decomposition). */
  presetApps?: Array<{
    id: string;
    name: string;
    department: string;
    summary: string;
    templateId: string;
  }>;
}

export interface MaterializeAppPackResult {
  success: boolean;
  appPack?: AppPackConfig;
  definitions?: AppPackAppDefinition[];
  error?: string;
}

// ── Main helper ────────────────────────────────────────────

/**
 * Materialize an app pack for a tenant in suite mode.
 *
 * This function:
 * 1. Decomposes the requirement (or uses preset apps)
 * 2. Generates full definitions for each app
 * 3. Builds the AppPackConfig with SuiteAppInstance entries
 * 4. Returns the config for storage in tenant metadata
 *
 * Does NOT write to the DB directly — the caller (tenant route) handles
 * persisting the config into tenants.metadata.appPack and triggering
 * the downstream pipeline (codegen, deploy, etc.).
 */
export async function materializeAppPackForTenant(
  input: MaterializeAppPackInput,
): Promise<MaterializeAppPackResult> {
  try {
    const useMock = input.mock ?? !process.env.OPENAI_API_KEY;

    // ── 1. DECOMPOSE ──────────────────────────────────────
    let decomposition: AppPackDecomposition;

    if (input.presetApps && input.presetApps.length > 0) {
      // Preset mode: build decomposition from preset app definitions
      decomposition = {
        packId: `${input.tenantSlug}-suite`,
        name: `${input.displayName} Suite`,
        description: `Multi-app suite for ${input.displayName}`,
        apps: input.presetApps.map((app) => ({
          id: app.id,
          name: app.name,
          department: app.department,
          summary: app.summary,
          templateId: app.templateId,
        })),
        ceoOverview: {
          purpose: `Aggregate KPIs and knowledge from every department app into a single leadership overview with actionable items for ${input.displayName}.`,
          kpis: ['revenue', 'grossMargin', 'headcount', 'salesTargetAchievement', 'cashflow', 'complianceStatus'],
        },
      };
    } else if (useMock) {
      // Mock mode: use the deterministic mock decomposition
      decomposition = mockDecomposePack();
      decomposition.packId = `${input.tenantSlug}-suite`;
      decomposition.name = `${input.displayName} Suite`;
    } else {
      // AI mode: decompose from the user's prompt
      const prompt = input.prompt || `Create a multi-department application suite for ${input.displayName} covering: ${input.templates.join(', ')}`;
      decomposition = await decomposePackFromPrompt(prompt);
      decomposition.packId = `${input.tenantSlug}-suite`;
      decomposition.name = `${input.displayName} Suite`;
    }

    // ── 2. GENERATE definitions ───────────────────────────
    const definitions: AppPackAppDefinition[] = [];
    for (const brief of decomposition.apps) {
      let def: AppPackAppDefinition;
      if (useMock || (input.presetApps && input.presetApps.length > 0)) {
        def = mockGenerateAppDefinition(brief);
      } else {
        const isCeo = brief === decomposition.apps[decomposition.apps.length - 1];
        def = await generateAppDefinition(
          brief,
          isCeo ? decomposition.ceoOverview.purpose : '',
          isCeo ? decomposition.ceoOverview.kpis : [],
          decomposition.apps,
        );
      }
      definitions.push(def);
    }

    // ── 3. BUILD AppPackConfig ────────────────────────────
    const suiteApps: SuiteAppInstance[] = decomposition.apps.map((brief, i) => ({
      appId: brief.id,
      name: brief.name,
      department: brief.department,
      templateId: brief.templateId,
      status: 'pending' as const,
      appUrl: null,
      dbUrl: null,
      vercelProjectId: null,
      metadata: {
        models: definitions[i]?.models.length ?? 0,
        pages: definitions[i]?.pages.length ?? 0,
        useCases: definitions[i]?.useCases.length ?? 0,
        w3cStandard: definitions[i]?.w3cStandard ?? 'schema.org',
        schemaOrgType: definitions[i]?.schemaOrgType ?? 'LocalBusiness',
      },
    }));

    const appPack: AppPackConfig = {
      packId: decomposition.packId,
      name: decomposition.name,
      description: decomposition.description,
      apps: suiteApps,
      ceoOverview: decomposition.ceoOverview,
    };

    return { success: true, appPack, definitions };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[app-pack-tenant-materializer] Failed:', message);
    return { success: false, error: message };
  }
}

/**
 * Build a default prompt for suite mode when the user didn't provide one.
 * Uses the selected template IDs to describe the business need.
 */
export function buildSuitePrompt(
  displayName: string,
  templates: string[],
  presetKey?: string,
): string {
  if (presetKey) {
    const presetDescriptions: Record<string, string> = {
      'massage-spa': `I run ${displayName}, a massage spa. We need appointment scheduling, client records, therapist management, spa finance tracking, and an owner dashboard with cross-department KPIs.`,
      'restaurant-group': `I run ${displayName}, a restaurant group. We need menu management, table reservations, kitchen operations, finance reporting, and an owner dashboard across locations.`,
      'hotel-chain': `I run ${displayName}, a hotel chain. We need room management, booking engine, F&B outlets, events/conference, finance reporting, and a multi-property owner dashboard.`,
    };
    return presetDescriptions[presetKey] ?? `Create a multi-department suite for ${displayName}.`;
  }
  return `Create a multi-department application suite for ${displayName} covering these business areas: ${templates.join(', ')}. Include a CEO Overview dashboard that aggregates KPIs from all departments.`;
}
