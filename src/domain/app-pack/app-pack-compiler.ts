/**
 * App Pack — Compiler
 *
 * Deterministic compilation of AI-generated app definitions into artifacts the
 * platform can materialize:
 *
 *   - ZenStack .zmodel source (per app, via compileToZModel)
 *   - Page catalog source (per app, via compileToPageCatalog)
 *   - DB rows for pages, nav items, knowledge snippets and security groups
 *   - UX workflow documents (JSON)
 */

import { compileToZModel, compileToPageCatalog } from '@/domain/ai/zmodel-compiler';
import type { SchemaGenerationResult } from '@/domain/ai/schema-generation-schema';
import type {
  AppPackAppDefinition,
  AppPackDecomposition,
} from './app-pack-schema';

// ── ZenStack / page catalog ──────────────────────────────

export interface CompiledAppArtifacts {
  appId: string;
  appName: string;
  department: string;
  zmodel: string;
  pageCatalog: string;
  securityGroupCode: string;
  securityGroupName: string;
}

function toSchemaGenerationResult(def: AppPackAppDefinition): SchemaGenerationResult {
  return {
    templateId: def.appId,
    schemaOrgType: def.schemaOrgType,
    models: def.models,
    useCases: def.useCases,
    pages: def.pages,
  };
}

export function compileAppArtifacts(def: AppPackAppDefinition): CompiledAppArtifacts {
  const schema = toSchemaGenerationResult(def);
  return {
    appId: def.appId,
    appName: def.appName,
    department: def.department,
    zmodel: compileToZModel(schema),
    pageCatalog: compileToPageCatalog(schema),
    securityGroupCode: `app_${def.appId}`,
    securityGroupName: `App: ${def.appName}`,
  };
}

// ── DB row builders ──────────────────────────────────────

export interface PageRow {
  id: string;
  slug: string;
  title: string;
  authTier: 'public' | 'pin' | 'google';
  navLabel: string | null;
  showInNav: boolean;
  tenantSlug: string;
  sections: { blockType: string; config: Record<string, unknown> }[];
}

export interface NavRow {
  id: string;
  title: string;
  path: string;
  icon: string;
  requiredGroups: string;
  isDynamic: boolean;
  sortOrder: number;
  tenantSlug: string;
  isDefault?: boolean;
}

export interface SnippetRow {
  id: string;
  key: string;
  content: string;
  category: string;
}

export interface UxWorkflowDoc {
  appId: string;
  appName: string;
  department: string;
  stages: AppPackAppDefinition['uxWorkflow'];
}

/** Normalize an AI-generated page slug to a single URL-safe segment. */
export function sanitizePageSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/^\/+/, '')
    .replace(/[\s.]+/g, "-")
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, 48);
}

/**
 * Pluralize a PascalCase model name for CRUD page titles / nav labels.
 * Simple English heuristic (documented, not exhaustive):
 *   - already-plural / uncountable names ending in "s" (Sales, News) → as-is
 *   - ends in s, x, z, ch, sh → append "es"  (Status → Statuses, Box → Boxes)
 *   - ends in consonant + "y" → drop "y", append "ies"  (Category → Categories)
 *   - otherwise → append "s"  (Reservation → Reservations)
 */
function pluralizeModelName(name: string): string {
  if (/s$/i.test(name) && !/(ss|us)$/i.test(name)) return name;
  if (/[sxz]$/i.test(name) || /(ch|sh)$/i.test(name)) return `${name}es`;
  if (/[^aeiou]y$/i.test(name)) return `${name.slice(0, -1)}ies`;
  return `${name}s`;
}

/**
 * Build DB rows for one app. The dynamic router is a single-level `/[slug]`
 * route, so page slugs are FLAT and prefixed with packId + appId to stay
 * globally unique (`app_pages.slug` is a global unique column). Nav clusters
 * the app's pages under one parent item; a landing page (slug `<packId>-<appId>`)
 * is always materialized so the parent nav item has a real destination.
 */
export function compileAppRows(
  def: AppPackAppDefinition,
  tenantSlug: string,
  packId: string,
): { pages: PageRow[]; nav: NavRow[]; snippets: SnippetRow[]; ux: UxWorkflowDoc } {
  const rootSlug = `${packId}-${def.appId}`;
  const root: PageRow = {
    id: `page_${packId}_${def.appId}`,
    slug: rootSlug,
    title: def.appName,
    authTier: def.pages[0]?.authTier ?? 'pin',
    navLabel: null,
    showInNav: false,
    tenantSlug,
    sections: [{ blockType: 'hero', config: { title: def.appName } }],
  };

  const aiPages: PageRow[] = def.pages.map((p) => {
    const seg = sanitizePageSlug(p.slug);
    return {
      id: `page_${packId}_${def.appId}_${seg}`,
      slug: `${packId}-${def.appId}-${seg}`,
      title: p.title,
      authTier: p.authTier,
      navLabel: p.navLabel ?? null,
      showInNav: p.navLabel != null,
      tenantSlug,
      sections: p.blockTypes.map((bt) => ({ blockType: bt, config: {} })),
    };
  });

  // Deterministic CRUD pages: one per model, appended after AI pages so every
  // model gets a runtime CRUD surface regardless of AI page choices. Slugs are
  // flat and packId+appId+tableName-prefixed to stay globally unique
  // (app_pages.slug is a global unique column).
  const modelPages: PageRow[] = def.models.map((model) => {
    const title = pluralizeModelName(model.name);
    return {
      id: `page_${packId}_${def.appId}_model_${model.tableName}`,
      slug: `${packId}-${def.appId}-${model.tableName}`,
      title,
      authTier: 'pin',
      navLabel: title,
      showInNav: true,
      tenantSlug,
      sections: [{ blockType: 'pack_table', config: { table: model.tableName, title: model.name } }],
    };
  });

  const pages: PageRow[] = [root, ...aiPages, ...modelPages];

  // Nav: one parent item for the app section + children per nav page.
  const groupCode = `app_${def.appId}`;
  const nav: NavRow[] = [];
  nav.push({
    id: `nav_${packId}_${def.appId}`,
    title: def.nav.label,
    path: `/${rootSlug}`,
    icon: def.nav.icon ?? 'Apps',
    requiredGroups: groupCode,
    isDynamic: true,
    sortOrder: 0,
    tenantSlug,
  });
  def.nav.pages.forEach((slug, i) => {
    const seg = sanitizePageSlug(slug);
    const page = pages.find((p) => p.slug === `${packId}-${def.appId}-${seg}`);
    nav.push({
      id: `nav_${packId}_${def.appId}_${seg}`,
      title: page?.navLabel ?? page?.title ?? seg,
      path: `/${packId}-${def.appId}-${seg}`,
      icon: '',
      requiredGroups: groupCode,
      isDynamic: true,
      sortOrder: i + 1,
      tenantSlug,
    });
  });
  // Model CRUD nav children — sort order continues after the AI nav pages.
  def.models.forEach((model, i) => {
    const title = pluralizeModelName(model.name);
    nav.push({
      id: `nav_${packId}_${def.appId}_model_${model.tableName}`,
      title,
      path: `/${packId}-${def.appId}-${model.tableName}`,
      icon: '',
      requiredGroups: groupCode,
      isDynamic: true,
      sortOrder: def.nav.pages.length + i + 1,
      tenantSlug,
    });
  });

  const snippets: SnippetRow[] = def.knowledgeSnippets.map((s) => ({
    id: `snip_${packId}_${def.appId}_${s.key.replace(/[^a-z0-9-]/g, '_')}`,
    key: `${packId}-${s.key}`,
    content: s.content,
    category: `app_${def.appId}`,
  }));

  return {
    pages,
    nav,
    snippets,
    ux: { appId: def.appId, appName: def.appName, department: def.department, stages: def.uxWorkflow },
  };
}

/**
 * Build the CEO Overview nav + snippet rows: the CEO app gets its own section
 * plus a knowledge category that aggregates every department app's snippets so
 * the CEO knowledge base spans the whole pack.
 */
export function compileCeoRows(
  decomposition: AppPackDecomposition,
  ceoDef: AppPackAppDefinition,
  tenantSlug: string,
  packId: string,
): { nav: NavRow[]; snippets: SnippetRow[]; ux: UxWorkflowDoc } {
  const groupCode = `app_${ceoDef.appId}`;
  const nav: NavRow[] = [
    {
      id: `nav_${packId}_${ceoDef.appId}`,
      title: ceoDef.nav.label,
      path: `/${packId}-${ceoDef.appId}`,
      icon: ceoDef.nav.icon ?? 'Insights',
      requiredGroups: groupCode,
      isDynamic: true,
      sortOrder: 100,
      tenantSlug,
    },
  ];

  const snippets: SnippetRow[] = [
    {
      id: `snip_${packId}_${ceoDef.appId}_overview`,
      key: `${packId}-${ceoDef.appId}-overview`,
      content: `# ${ceoDef.appName}\n\n${decomposition.ceoOverview.purpose}` +
        `\n\nCross-department KPIs: ${decomposition.ceoOverview.kpis.join(', ')}.`,
      category: `app_${ceoDef.appId}`,
    },
    ...decomposition.apps
      .filter((a) => a.id !== ceoDef.appId)
      .map((a) => ({
        id: `snip_${packId}_${ceoDef.appId}_xref_${a.id}`,
        key: `${packId}-${ceoDef.appId}-xref-${a.id}`,
        content: `# ${a.name} (${a.department})\n\n${a.summary}\n\nThis department app feeds the CEO Overview. ` +
          `Refer to its knowledge category "app_${a.id}" for operating details.`,
        category: `app_${ceoDef.appId}`,
      })),
  ];

  return {
    nav,
    snippets,
    ux: { appId: ceoDef.appId, appName: ceoDef.appName, department: ceoDef.department, stages: ceoDef.uxWorkflow },
  };
}
