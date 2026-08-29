import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  PrismaClient,
  type ActionPriority,
  type AuthTier,
  type BlockType,
  type Prisma,
  type TaskStatus,
} from '@/generated/prisma';
import { getTenantConfig, getCurrentAppId, isPlatformApp } from '@shared/lib/config/tenant';
import { resolveRegistryTenantSlug } from '@shared/lib/cms-scope';
import { toStoragePageSlug } from '@shared/lib/page-slug';
import { addTenantColumnsIfMissing } from '@/domain/tenant/tenant-seed-service';
import { getFullCatalog, REVIEW_PART_CATALOG } from '@/lib/page-catalog';
import type { DbClient } from '@/lib/db';
import { FUNCTIONAL_ROLES } from '@/domain/security/functional-roles';
import { parseBusinessReviewParts } from '@/lib/parse-business-review';
import {
  parseFinancialProjectionsFromBuffer,
  type FinancialProjectionRow,
} from '@/domain/seed/financial-excel';
import {
  getSourceDir,
  getWebsiteRoot,
  PRIVACY_HTML_PATH,
  readSourceFile,
  readSourceText,
  sourceFileExists,
  SOURCE_FILENAMES,
  TERMS_HTML_PATH,
  writeSourceFile,
  type SourceFileKey,
} from '@/domain/seed/source-files';
import { buildWorkbookCacheMeta, WORKBOOK_META_KEY } from '@/lib/workbook-cache';
import { getRedRubySeedCorpus } from '@/domain/seed/seed-knowledge-corpus';
import { buildPlatformKnowledgeSnippets } from '@/domain/knowledge/platform-knowledge-seed';
import {
  analyzeWorkbook,
  generatePagesFromAnalysis,
  generateAnalysisMarkdown,
  generateSheetMarkdown,
} from '@/domain/excel/workbook-analyzer';
import { generateLegalDocuments } from '@/domain/legal/legal-doc-generator';
import { read } from 'xlsx';
import { buildWorkbookFormulaMap } from '@/lib/workbook-formulas';
import { setDynamicPages, setDynamicReviewParts } from '@/lib/page-catalog';
import type { ReviewPartDefinition } from '@/lib/page-catalog';

export interface SeedCounts {
  financialProjections: number;
  businessReviewParts: number;
  levers: number;
  actionItems: number;
  monthlyTargets: number;
  knowledgeSnippets: number;
  appPages: number;
  pageSections: number;
  roles: number;
  tasks: number;
  taskAssignments: number;
}

export interface SeedSourceOverrides {
  /** Single or multiple workbook buffers (uploaded XLSX files). */
  excel?: Buffer | Buffer[];
  businessReview?: string;
  executiveSummary?: string;
}

export interface SeedOptions {
  dryRun?: boolean;
  /** In-memory overrides from upload (takes precedence over disk). */
  overrides?: SeedSourceOverrides;
  /** When true, persist overrides to the configured source directory. */
  persistOverrides?: boolean;
  sourceDir?: string;
  /**
   * When true, skip the deterministic financial-projection upserts.
   * Used by the AI workbook pipeline (comprehension-driven projections
   * take precedence); deterministic values remain the fallback.
   */
  skipFinancialProjections?: boolean;
  /**
   * Original Excel upload filenames (same order as `overrides.excel` buffers).
   * Stored in knowledge_snippets.workbook_meta for the Upload & Seed UI.
   */
  excelFileNames?: string[];
}

export interface SeedResult {
  counts: SeedCounts;
  filesUsed: Record<SourceFileKey, 'upload' | 'disk'>;
}

const DAILY_METRICS_DDL = `
CREATE TABLE IF NOT EXISTS daily_metrics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  guests_count INTEGER NOT NULL DEFAULT 0,
  avg_spend NUMERIC(10,2),
  staff_count INTEGER NOT NULL DEFAULT 0,
  staff_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  food_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  beverage_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  gofood_revenue NUMERIC(12,2) DEFAULT 0,
  direct_orders NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const MONTHLY_TARGETS_DDL = `
CREATE TABLE IF NOT EXISTS monthly_targets (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  target_revenue NUMERIC(12,2) NOT NULL,
  target_ebitda NUMERIC(12,2) NOT NULL,
  target_guests INTEGER NOT NULL,
  target_avg_spend NUMERIC(10,2) NOT NULL,
  target_staff_cost_pct NUMERIC(5,2) NOT NULL,
  app_id TEXT NOT NULL DEFAULT '',
  UNIQUE (month, app_id)
);`;

const CONTENT_ENUM_STATEMENTS = [
  `DO $$ BEGIN CREATE TYPE "AuthTier" AS ENUM ('public', 'pin', 'google'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "ActionPriority" AS ENUM ('P0', 'P1', 'P2'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "TaskStatus" AS ENUM ('pending', 'in_progress', 'submitted', 'completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "BlockType" AS ENUM ('hero', 'metric_grid', 'chart_financial', 'lever_accordion', 'action_checklist', 'doc_markdown', 'pnl_table', 'z_report_form', 'costs_form', 'calendar_import', 'chat_panel', 'kpi_cards', 'ops_admin_tabs', 'review_blocks', 'reports_rollup', 'sheet_viewer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
];

const BLOCK_TYPE_ALTER_STATEMENTS = [
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'ops_admin_tabs'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'review_blocks'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'reports_rollup'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'sheet_viewer'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'pack_table'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'feature_grid'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'testimonials'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'marketing_hero'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'capability_marquee'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'product_showcase'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'customer_proof'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'faq'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'cta_banner'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'pricing_table'`,
];

const CONTENT_TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS app_pages (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    auth_tier "AuthTier" NOT NULL DEFAULT 'public',
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS page_sections (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL REFERENCES app_pages(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    block_type "BlockType" NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'
  )`,
  `CREATE INDEX IF NOT EXISTS page_sections_page_id_sort_order_idx ON page_sections(page_id, sort_order)`,
  `CREATE TABLE IF NOT EXISTS business_review_parts (
    id TEXT PRIMARY KEY,
    part_key TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    auth_tier "AuthTier" NOT NULL DEFAULT 'google',
    markdown TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS levers (
    id TEXT PRIMARY KEY,
    num INTEGER NOT NULL,
    name TEXT NOT NULL,
    impact TEXT NOT NULL,
    description TEXT NOT NULL,
    app_id TEXT NOT NULL DEFAULT '',
    UNIQUE (num, app_id)
  )`,
  `CREATE TABLE IF NOT EXISTS action_items (
    id TEXT PRIMARY KEY,
    priority "ActionPriority" NOT NULL,
    label TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS knowledge_snippets (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    app_id TEXT NOT NULL DEFAULT '',
    UNIQUE (key, app_id)
  )`,
  `CREATE TABLE IF NOT EXISTS google_oauth_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    client_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    auth_uri TEXT NOT NULL,
    token_uri TEXT NOT NULL DEFAULT 'https://oauth2.googleapis.com/token',
    encrypted_secret TEXT NOT NULL,
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_platform_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority "ActionPriority" NOT NULL DEFAULT 'P0',
    status "TaskStatus" NOT NULL DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS task_assignments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (task_id, role_id)
  )`,
  `CREATE INDEX IF NOT EXISTS task_assignments_role_id_idx ON task_assignments(role_id)`,
  `CREATE TABLE IF NOT EXISTS task_user_assignments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_account_id TEXT NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    assigned BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (task_id, user_account_id)
  )`,
  `CREATE INDEX IF NOT EXISTS task_user_assignments_user_account_id_idx ON task_user_assignments(user_account_id)`,
];

function loadEnvLocal(): void {
  const envPath = resolve(getWebsiteRoot(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function readUtf8(path: string): string {
  if (!existsSync(path)) {
    throw new Error(`Missing source file: ${path}`);
  }
  return readFileSync(path, 'utf8');
}

function htmlToMarkdownish(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildKnowledgeSnippets(
  executiveSummaryMd: string,
  termsMd: string,
  privacyMd: string,
): { key: string; category: string; content: string }[] {
  const documentSnippets = [
    { key: 'executive_summary', category: 'document', content: executiveSummaryMd.trim() },
    { key: 'terms_of_service', category: 'document', content: termsMd },
    { key: 'privacy_policy', category: 'document', content: privacyMd },
  ].filter((s) => s.content.length > 0);

  if (isPlatformApp()) {
    return [...buildPlatformKnowledgeSnippets(), ...documentSnippets];
  }

  const corpus = getRedRubySeedCorpus();
  if (!corpus) {
    return documentSnippets;
  }

  const {
    LOCATION,
    SITUATION_SUMMARY,
    CURRENT_METRICS,
    TARGET_METRICS,
    FIVE_LEVERS,
    PRIORITY_ACTIONS,
    KEY_RISKS,
    STRATEGIC_PARTNERSHIPS,
    MONTHLY_TARGETS,
  } = corpus;

  const { displayName } = getTenantConfig();

  return [
    { key: 'business_name', category: 'meta', content: displayName },
    { key: 'location', category: 'meta', content: LOCATION },
    { key: 'situation_summary', category: 'overview', content: SITUATION_SUMMARY.trim() },
    {
      key: 'current_metrics',
      category: 'metrics',
      content: JSON.stringify(CURRENT_METRICS, null, 2),
    },
    {
      key: 'target_metrics',
      category: 'metrics',
      content: JSON.stringify(TARGET_METRICS, null, 2),
    },
    {
      key: 'five_levers',
      category: 'strategy',
      content: FIVE_LEVERS.map(
        (l: any) =>
          `${l.num}. ${l.name} — ${l.impact}\nTarget: ${l.target}\nActions:\n${l.actions.map((a: any) => `  - ${a}`).join('\n')}`,
      ).join('\n\n'),
    },
    {
      key: 'priority_actions_p0',
      category: 'actions',
      content: PRIORITY_ACTIONS.P0_THIS_WEEK.map((a: any) => `- ${a}`).join('\n'),
    },
    {
      key: 'priority_actions_p1',
      category: 'actions',
      content: PRIORITY_ACTIONS.P1_THIS_MONTH.map((a: any) => `- ${a}`).join('\n'),
    },
    {
      key: 'priority_actions_p2',
      category: 'actions',
      content: PRIORITY_ACTIONS.P2_THIS_QUARTER.map((a: any) => `- ${a}`).join('\n'),
    },
    {
      key: 'key_risks',
      category: 'risks',
      content: KEY_RISKS.map((r: any) => `- ${r}`).join('\n'),
    },
    {
      key: 'strategic_partnerships',
      category: 'strategy',
      content: Object.values(STRATEGIC_PARTNERSHIPS)
        .map((p: any) => `${p.name} (${p.type}): ${p.opportunity} — ${p.revenue_impact}`)
        .join('\n'),
    },
    {
      key: 'monthly_targets_table',
      category: 'metrics',
      content: MONTHLY_TARGETS.map(
        (t: any) =>
          `${t.month}: revenue ${t.revenue}, ebitda ${t.ebitda}, guests ${t.guests}/day, spend ${t.spend}, staff ${t.staffPct}%`,
      ).join('\n'),
    },
    ...documentSnippets,
  ];
}

function buildActionItems(): { priority: ActionPriority; label: string; sortOrder: number }[] {
  const corpus = getRedRubySeedCorpus();
  if (!corpus) return [];

  const items: { priority: ActionPriority; label: string; sortOrder: number }[] = [];
  let order = 0;
  for (const label of corpus.PRIORITY_ACTIONS.P0_THIS_WEEK) {
    items.push({ priority: 'P0', label, sortOrder: order++ });
  }
  for (const label of corpus.PRIORITY_ACTIONS.P1_THIS_MONTH) {
    items.push({ priority: 'P1', label, sortOrder: order++ });
  }
  for (const label of corpus.PRIORITY_ACTIONS.P2_THIS_QUARTER) {
    items.push({ priority: 'P2', label, sortOrder: order++ });
  }
  return items;
}

/**
 * Known roles for the exit-viability task tracking system.
 * Derived from FUNCTIONAL_ROLES — the role catalog.
 * Roles are a display-name catalog (code + name only): the person-to-role link
 * lives in the FUNCTIONAL_ROLES catalog.
 * `code` matches the "Name:" prefix used in PRIORITY_ACTIONS labels (with
 * secondary lowercase match in parseTaskLabel for case-insensitive lookup).
 * Preserves the original capitalized codes so existing task labels continue to work.
 */
const KNOWN_ROLES: { code: string; name: string; isPlatformAdmin?: boolean }[] =
  FUNCTIONAL_ROLES.map((fr) => ({
    code: fr.code,
    name: fr.isPlatformAdmin ? 'Platform Admin' : fr.name,
    isPlatformAdmin: fr.isPlatformAdmin ?? false,
  }));

/**
 * Legacy person / label aliases → functional role codes.
 * Older PRIORITY_ACTIONS labels may use person names or display labels.
 * Map those onto role codes so task assignments land on real roles.
 */
const OWNER_CODE_ALIASES: Record<string, string> = {
  // Functional role codes and display labels (case variants)
  finance: 'finance',
  ceo: 'ceo',
  manager: 'manager',
  operations: 'operations',
  compliance: 'compliance',
  entertainment: 'entertainment',
  'platform-admin': 'platform-admin',
  'platform admin': 'platform-admin',
  // Legacy person-name prefixes in older seeded task labels
  ama: 'finance',
  graham: 'ceo',
  james: 'entertainment',
  lukas: 'operations',
  lucas: 'operations',
  made: 'compliance',
};

/**
 * Normalize an owner token (person name, display label, or role code) to a
 * known functional role code. Returns null when unmapped (caller decides
 * whether to fall back to all individual roles).
 */
function normalizeOwnerCode(raw: string): string | null {
  const token = raw.trim();
  if (!token) return null;
  const lower = token.toLowerCase();

  const direct = KNOWN_ROLES.find((r) => r.code.toLowerCase() === lower);
  if (direct) return direct.code;

  const aliased = OWNER_CODE_ALIASES[lower];
  if (!aliased) return null;

  const role = KNOWN_ROLES.find((r) => r.code.toLowerCase() === aliased.toLowerCase());
  return role?.code ?? null;
}

/** Resolve a known role by email (case-insensitive). Used by Google sign-in. */
/**
 * Resolve a known role by email from the roles DB table.
 * Replaces the old PERSONS-registry lookup with a live DB query.
 */
export async function resolveRoleForEmail(
  email: string | undefined,
  db: { $queryRawUnsafe: (sql: string, ...params: unknown[]) => Promise<unknown[]> },
): Promise<{ code: string; name: string; isPlatformAdmin: boolean } | null> {
  if (!email) return null;
  const lowerEmail = email.toLowerCase();

  // First check user_accounts (preferred source after first sign-in)
  const accountRows = await db.$queryRawUnsafe(
    `SELECT 
       r.code, 
       COALESCE(ua.name, r.name) as name,
       COALESCE(r.is_platform_admin, false) as is_platform_admin
     FROM user_accounts ua
     LEFT JOIN roles r ON r.code = ua.role_code
     WHERE LOWER(ua.email) = $1
     LIMIT 1`,
    lowerEmail,
  ) as { code: string; name: string; is_platform_admin: boolean }[];

  if (accountRows?.[0]) {
    return { 
      code: accountRows[0].code, 
      name: accountRows[0].name, 
      isPlatformAdmin: accountRows[0].is_platform_admin ?? false 
    };
  }

  // Fallback: check app_config for dedicated admin email (seeded during tenant provisioning)
  try {
    const configRows = await db.$queryRawUnsafe(
      `SELECT 
         (data->>'adminEmail')::text as admin_email,
         (data->'googleAuth'->>'dedicatedAdminEmail')::text as dedicated_admin_email
       FROM app_config 
       WHERE id = 'main' 
       LIMIT 1`,
    ) as { admin_email?: string; dedicated_admin_email?: string }[];

    const config = configRows?.[0];
    const dedicatedEmail = (config?.dedicated_admin_email || config?.admin_email || '').toLowerCase();

    if (dedicatedEmail === lowerEmail) {
      return {
        code: 'platform-admin',
        name: 'Platform Admin',
        isPlatformAdmin: true,
      };
    }
  } catch (err) {
    console.warn('[resolveRoleForEmail] app_config check failed (non-fatal):', err);
  }

  return null;
}


/**
 * Operational identities the system knows about (PIN roles + platform admins).
 * Used to backfill user_account rows so the User Accounts list shows prior users
 * even before they re-sign-in. Platform admin uses sub 'admin'; PIN roles use
 * their lowercased code as sub (matching verify-pin).
 */
export function listKnownAccounts(): { sub: string; name: string; tier: string; roleCode?: string | null }[] {
  return FUNCTIONAL_ROLES.map((fr) => ({
    sub: fr.code,
    name: fr.isPlatformAdmin ? 'Admin' : fr.name,
    tier: fr.isPlatformAdmin ? 'pin' : 'pin',
    roleCode: fr.code,
  }));
}

/** Parse "Ama: do the thing" → { ownerCodes: ['finance'], title: 'do the thing' }. */
function parseTaskLabel(label: string): { ownerCodes: string[]; title: string } {
  const match = label.match(/^([A-Za-z][A-Za-z+& ]*?):\s*(.+)$/);
  if (!match) {
    return { ownerCodes: [], title: label.trim() };
  }
  const ownerPart = match[1].trim();
  const title = match[2].trim();
  // "All:" → empty owners → resolveOwnerCodes expands to every individual role.
  if (ownerPart.toLowerCase() === 'all') {
    return { ownerCodes: [], title };
  }
  // Split on + & , / to support "Lukas + Made", "Ama & Graham", "Finance + CEO", etc.
  // Person names and display labels are mapped through OWNER_CODE_ALIASES.
  const ownerCodes = ownerPart
    .split(/[+&,/]/)
    .map((s) => normalizeOwnerCode(s))
    .filter((c): c is string => Boolean(c));
  return { ownerCodes, title };
}

interface BuiltTask {
  title: string;
  priority: ActionPriority;
  ownerCodes: string[];
  dueOffsetDays: number;
  description: string | null;
}

/** Normalize a task title to match a TASK_PLAYBOOK key. */
function playbookKey(title: string): string {
  return title.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Build the tracked-task list from PRIORITY_ACTIONS.
 * P0 → due in 7 days, P1 → 14 days, P2 → 42 days (relative to seed run).
 */
/** Individual (non-admin) role codes that tasks can be assigned to. */
const INDIVIDUAL_ROLE_CODES = KNOWN_ROLES.filter((r) => !r.isPlatformAdmin).map((r) => r.code);

/**
 * Resolve effective owner codes for a task. A task owned by "All" (or with no
 * recognized owner) is assigned to every individual role so it appears in the
 * per-role dashboard and for each role's users.
 */
function resolveOwnerCodes(ownerCodes: string[]): string[] {
  if (ownerCodes.length === 0) return [...INDIVIDUAL_ROLE_CODES];
  return ownerCodes;
}

function buildTasks(): BuiltTask[] {
  const corpus = getRedRubySeedCorpus();
  if (!corpus) return [];

  const { PRIORITY_ACTIONS, TASK_PLAYBOOK } = corpus;
  const tasks: BuiltTask[] = [];
  const push = (labels: string[], priority: ActionPriority, dueOffsetDays: number) => {
    for (const label of labels) {
      const { ownerCodes, title } = parseTaskLabel(label);
      const play = TASK_PLAYBOOK[playbookKey(title)];
      const description = play
        ? `${play.description}\n\nSteps:\n${play.steps.map((s: any, i: any) => `${i + 1}. ${s}`).join('\n')}`
        : null;
      tasks.push({
        title,
        priority,
        ownerCodes: resolveOwnerCodes(ownerCodes),
        dueOffsetDays,
        description,
      });
    }
  };
  push(PRIORITY_ACTIONS.P0_THIS_WEEK, 'P0', 7);
  push(PRIORITY_ACTIONS.P1_THIS_MONTH, 'P1', 14);
  push(PRIORITY_ACTIONS.P2_THIS_QUARTER, 'P2', 42);
  return tasks;
}

export async function ensureLegacyTables(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(DAILY_METRICS_DDL);
  await prisma.$executeRawUnsafe(MONTHLY_TARGETS_DDL);
  // Older DBs may have monthly_targets without app_id — Prisma upserts need it.
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE monthly_targets ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT ''`,
    );
  } catch {
    // ignore — table may not exist yet / already migrated
  }
  try {
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS monthly_targets_month_app_id_key ON monthly_targets (month, app_id)`,
    );
  } catch {
    // ignore duplicate / conflict with legacy UNIQUE(month)
  }

  // financial_projections: suite seeds write app_id = NEXT_PUBLIC_APP_ID, but many
  // production DBs still have UNIQUE(period, data_type, scenario) without app_id.
  // ON CONFLICT (... app_id) then does not fire and INSERT raises 23505.
  await ensureFinancialProjectionAppScope(prisma);
}

/**
 * Ensure financial_projections is app-scoped (column + unique key) so suite
 * reseed can upsert without colliding with legacy app_id='' rows.
 */
export async function ensureFinancialProjectionAppScope(
  prisma: PrismaClient,
): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE financial_projections ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT ''`,
    );
  } catch {
    // table missing — nothing to migrate
    return;
  }

  // Drop legacy UNIQUE(period, data_type, scenario) whether it is a constraint
  // or a standalone unique index (prisma db push used both historically).
  await prisma.$executeRawUnsafe(`
    DO $$
    DECLARE
      r record;
    BEGIN
      FOR r IN
        SELECT c.conname AS name, 'constraint' AS kind
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'financial_projections'
          AND c.contype = 'u'
          AND (
            SELECT array_agg(a.attname::text ORDER BY u.ord)
            FROM unnest(c.conkey) WITH ORDINALITY AS u(attnum, ord)
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = u.attnum
          ) = ARRAY['period','data_type','scenario']::text[]
      LOOP
        EXECUTE format('ALTER TABLE financial_projections DROP CONSTRAINT IF EXISTS %I', r.name);
      END LOOP;

      FOR r IN
        SELECT i.relname AS name
        FROM pg_index x
        JOIN pg_class t ON t.oid = x.indrelid
        JOIN pg_class i ON i.oid = x.indexrelid
        WHERE t.relname = 'financial_projections'
          AND x.indisunique
          AND NOT x.indisprimary
          AND NOT EXISTS (
            SELECT 1 FROM pg_constraint c WHERE c.conindid = x.indexrelid
          )
          AND (
            SELECT array_agg(a.attname::text ORDER BY u.ord)
            FROM unnest(x.indkey) WITH ORDINALITY AS u(attnum, ord)
            JOIN pg_attribute a ON a.attrelid = x.indrelid AND a.attnum = u.attnum
          ) = ARRAY['period','data_type','scenario']::text[]
      LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I', r.name);
      END LOOP;
    END $$;
  `);

  try {
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS financial_projections_period_data_type_scenario_app_id_key
       ON financial_projections (period, data_type, scenario, app_id)`,
    );
  } catch (err) {
    console.warn(
      '[seed] Could not create app-scoped financial_projections unique index:',
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * When this deployment has a non-empty app id, adopt orphan rows left by older
 * seeds that hard-coded app_id='' so Review Data / KPIs see them immediately.
 */
export async function reclaimOrphanAppScopedRows(
  prisma: PrismaClient,
  appId: string,
): Promise<void> {
  if (!appId) return;

  await prisma.$executeRaw`
    UPDATE financial_projections AS fp
    SET app_id = ${appId}
    WHERE fp.app_id = ''
      AND NOT EXISTS (
        SELECT 1 FROM financial_projections o
        WHERE o.period = fp.period
          AND o.data_type = fp.data_type
          AND o.scenario = fp.scenario
          AND o.app_id = ${appId}
      )
  `;

  await prisma.$executeRaw`
    UPDATE monthly_targets AS mt
    SET app_id = ${appId}
    WHERE mt.app_id = ''
      AND NOT EXISTS (
        SELECT 1 FROM monthly_targets o WHERE o.month = mt.month AND o.app_id = ${appId}
      )
  `;

  await prisma.$executeRaw`
    UPDATE levers AS l
    SET app_id = ${appId}
    WHERE l.app_id = ''
      AND NOT EXISTS (
        SELECT 1 FROM levers o WHERE o.num = l.num AND o.app_id = ${appId}
      )
  `;

  await prisma.$executeRaw`
    UPDATE action_items SET app_id = ${appId} WHERE app_id = ''
  `;

  await prisma.$executeRaw`
    UPDATE tasks SET app_id = ${appId} WHERE app_id = ''
  `;

  await prisma.$executeRaw`
    UPDATE knowledge_snippets AS ks
    SET app_id = ${appId}
    WHERE ks.app_id = ''
      AND NOT EXISTS (
        SELECT 1 FROM knowledge_snippets o WHERE o.key = ks.key AND o.app_id = ${appId}
      )
  `;
}

export async function ensureContentTables(prisma: PrismaClient): Promise<void> {
  for (const sql of CONTENT_ENUM_STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
  }
  for (const sql of BLOCK_TYPE_ALTER_STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
  }
  for (const sql of CONTENT_TABLE_STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
  }
}

/**
 * Idempotent creation of the task-tracking tables (roles, tasks, task_assignments).
 * Safe to call on every request — all statements use CREATE TABLE IF NOT EXISTS.
 * Ensures the Tasks feature works even before a full reseed has run.
 * Accepts either a plain or ZenStack-enhanced Prisma client.
 */
export async function ensureTaskTables(prisma: {
  $executeRawUnsafe: (sql: string) => Promise<unknown>;
}): Promise<void> {
  for (const sql of CONTENT_ENUM_STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
  }
  for (const sql of CONTENT_TABLE_STATEMENTS.slice(-6)) {
    await prisma.$executeRawUnsafe(sql);
  }
}

/**
 * Bootstrap the task-tracking data (roles + tasks + assignments) if empty.
 * Uses the ZenStack-enhanced client so policy checks apply. Idempotent.
 */
export async function seedTaskTracking(prisma: DbClient): Promise<void> {
  // Always sync known roles (idempotent upsert) so display names/platform-admin flags stay current.
  const roleIdByCode = new Map<string, string>();
  for (const role of KNOWN_ROLES) {
    const created = await prisma.role.upsert({
      where: { code: role.code },
      create: {
        code: role.code,
        name: role.name,
        isPlatformAdmin: role.isPlatformAdmin ?? false,
      },
      update: {
        name: role.name,
        isPlatformAdmin: role.isPlatformAdmin ?? false,
      },
    });
    roleIdByCode.set(created.code, created.id);
  }

  const existingTasks = await prisma.task.findMany({
    where: { appId: getCurrentAppId() },
    take: 1,
  });
  if (existingTasks.length > 0) {
    // Tasks already exist — backfill any missing descriptions from the playbook
    // without disturbing status/progress. Then ensure assignments are intact.
    const builtAll = buildTasks();
    for (const built of builtAll) {
      const existing = await prisma.task.findFirst({
        where: { title: built.title, appId: getCurrentAppId() },
      });
      if (existing && !existing.description?.trim() && built.description) {
        await prisma.task.update({
          where: { id: existing.id },
          data: { description: built.description },
        });
      }
    }
    return;
  }

  const appId = getCurrentAppId();
  await prisma.taskAssignment.deleteMany({
    where: { task: { appId } },
  });
  await prisma.task.deleteMany({ where: { appId } });

  let taskOrder = 0;
  const now = Date.now();
  for (const built of buildTasks()) {
    const dueDate = new Date(now + built.dueOffsetDays * 24 * 60 * 60 * 1000);
    const task = await prisma.task.create({
      data: {
        title: built.title,
        description: built.description,
        priority: built.priority,
        status: 'pending',
        dueDate,
        sortOrder: taskOrder++,
        appId,
      },
    });
    const ownerCodes = built.ownerCodes.length > 0 ? built.ownerCodes : [];
    for (const code of ownerCodes) {
      const roleId = roleIdByCode.get(code);
      if (!roleId) continue;
      await prisma.taskAssignment.create({ data: { taskId: task.id, roleId, assigned: true } });
    }
  }
}

async function upsertFinancialProjectionRaw(
  prisma: PrismaClient,
  row: FinancialProjectionRow,
  appId: string,
): Promise<void> {
  const pnlJson = JSON.stringify(row.pnlLines);
  await prisma.$executeRaw`
    INSERT INTO financial_projections (period, year, month, data_type, scenario, revenue, ebitda, net_income, guests, staff_cost, pnl_lines, app_id)
    VALUES (${row.period}, ${row.year}, ${row.month}, ${row.dataType}, ${row.scenario}, ${row.revenue}, ${row.ebitda}, ${row.netIncome}, ${row.guests}, ${row.staffCost}, ${pnlJson}::jsonb, ${appId})
    ON CONFLICT (period, data_type, scenario, app_id)
    DO UPDATE SET
      year = EXCLUDED.year,
      month = EXCLUDED.month,
      revenue = EXCLUDED.revenue,
      ebitda = EXCLUDED.ebitda,
      net_income = EXCLUDED.net_income,
      guests = EXCLUDED.guests,
      staff_cost = EXCLUDED.staff_cost,
      pnl_lines = EXCLUDED.pnl_lines
  `;
}

interface ResolvedSources {
  excel?: Buffer | Buffer[];
  businessReview?: string;
  executiveSummary?: string;
  filesUsed: Record<SourceFileKey, 'upload' | 'disk'>;
}

function resolveSources(options: SeedOptions): ResolvedSources {
  const sourceDir = options.sourceDir ?? getSourceDir({ excel: !!options.overrides?.excel });
  const overrides = options.overrides ?? {};
  const filesUsed: Record<SourceFileKey, 'upload' | 'disk'> = {
    excel: 'disk',
    businessReview: 'disk',
    executiveSummary: 'disk',
  };

  // Handle each override independently — never throw if only one source is being updated.
  if (overrides.excel) {
    filesUsed.excel = 'upload';
    if (options.persistOverrides) {
      try {
        // If multiple buffers, concatenate for file storage
        const buf = Array.isArray(overrides.excel)
          ? Buffer.concat(overrides.excel)
          : overrides.excel;
        writeSourceFile('excel', buf, sourceDir);
      } catch (err) {
        console.warn('[seed] Could not persist excel to disk (read-only filesystem?):', err instanceof Error ? err.message : err);
      }
    }
  }
  if (overrides.businessReview) {
    filesUsed.businessReview = 'upload';
    if (options.persistOverrides) {
      try {
        writeSourceFile('businessReview', overrides.businessReview, sourceDir);
      } catch (err) {
        console.warn('[seed] Could not persist businessReview to disk (read-only filesystem?):', err instanceof Error ? err.message : err);
      }
    }
  }
  if (overrides.executiveSummary) {
    filesUsed.executiveSummary = 'upload';
    if (options.persistOverrides) {
      try {
        writeSourceFile('executiveSummary', overrides.executiveSummary, sourceDir);
      } catch (err) {
        console.warn('[seed] Could not persist executiveSummary to disk (read-only filesystem?):', err instanceof Error ? err.message : err);
      }
    }
  }

  // Resolve each source independently — return undefined if not provided and not on disk.
  const excel =
    overrides.excel ??
    (sourceFileExists('excel', sourceDir)
      ? readSourceFile('excel', sourceDir)
      : undefined);

  const businessReview =
    overrides.businessReview ??
    (sourceFileExists('businessReview', sourceDir)
      ? readSourceText('businessReview', sourceDir)
      : undefined);

  const executiveSummary =
    overrides.executiveSummary ??
    (sourceFileExists('executiveSummary', sourceDir)
      ? readSourceText('executiveSummary', sourceDir)
      : undefined);

  // Validate: at least one source must be provided/available.
  if (excel === undefined && businessReview === undefined && executiveSummary === undefined) {
    throw new Error(
      'No sources found — upload at least the Business Review (.md) or Executive Summary (.md). ' +
        ('To update both without changing the workbook, use just the two markdown uploads.')
    );
  }

  return { excel, businessReview, executiveSummary, filesUsed };
}

export type AiSeedTask = {
  title: string;
  priority?: 'P0' | 'P1' | 'P2' | string;
  ownerCodes?: string[];
  dueOffsetDays?: number;
  description?: string | null;
};

/**
 * Seed / replace tracked tasks from AI Content Generation output.
 * Always syncs roles. When `tasks` is non-empty, replaces the task table
 * so Home/Tasks reflect the latest AI diagnostic (unlike seedTaskTracking
 * which is a no-op when tasks already exist).
 */
export async function seedTasksFromAi(
  prisma: DbClient,
  tasks: AiSeedTask[],
): Promise<number> {
  const roleIdByCode = new Map<string, string>();
  for (const role of KNOWN_ROLES) {
    const created = await prisma.role.upsert({
      where: { code: role.code },
      create: {
        code: role.code,
        name: role.name,
        isPlatformAdmin: role.isPlatformAdmin ?? false,
      },
      update: {
        name: role.name,
        isPlatformAdmin: role.isPlatformAdmin ?? false,
      },
    });
    roleIdByCode.set(created.code, created.id);
  }

  const normalized = (tasks ?? [])
    .map((t) => ({
      title: String(t.title ?? '').trim(),
      priority: (['P0', 'P1', 'P2'].includes(String(t.priority)) ? t.priority : 'P1') as ActionPriority,
      ownerCodes: Array.isArray(t.ownerCodes)
        ? t.ownerCodes.map((c) => String(c).trim()).filter(Boolean)
        : [],
      dueOffsetDays: typeof t.dueOffsetDays === 'number' && t.dueOffsetDays > 0 ? t.dueOffsetDays : 14,
      description: t.description ? String(t.description) : null,
    }))
    .filter((t) => t.title.length > 0);

  if (normalized.length === 0) {
    await seedTaskTracking(prisma);
    return 0;
  }

  const appId = getCurrentAppId();
  await prisma.taskAssignment.deleteMany({
    where: { task: { appId } },
  });
  await prisma.task.deleteMany({ where: { appId } });

  let taskOrder = 0;
  const now = Date.now();

  for (const built of normalized) {
    const dueDate = new Date(now + built.dueOffsetDays * 24 * 60 * 60 * 1000);
    const task = await prisma.task.create({
      data: {
        title: built.title,
        description: built.description,
        priority: built.priority,
        status: 'pending',
        dueDate,
        sortOrder: taskOrder++,
        appId,
      },
    });

    // Map person names / display labels (Ama, Made, Finance, …) → functional role codes.
    // Explicit "All" (any casing) means assign to every individual role.
    const wantsAll = built.ownerCodes.some((c) => c.trim().toLowerCase() === 'all');
    const owners = wantsAll
      ? []
      : built.ownerCodes
          .map((c) => normalizeOwnerCode(c))
          .filter((c): c is string => Boolean(c));
    // Deduplicate while preserving order
    const uniqueOwners = [...new Set(owners)];

    const assignCodes = uniqueOwners.length > 0 ? uniqueOwners : resolveOwnerCodes([]);
    for (const code of assignCodes) {
      const roleId = roleIdByCode.get(code);
      if (!roleId) continue;
      await prisma.taskAssignment.create({ data: { taskId: task.id, roleId, assigned: true } });
    }
  }

  return normalized.length;
}


export async function seedFromSources(options: SeedOptions = {}): Promise<SeedResult> {
  const dryRun = options.dryRun ?? false;
  loadEnvLocal();

  const { excel, businessReview, executiveSummary, filesUsed } = resolveSources(options);

  // Normalize excel: if multiple buffers, use first for legacy operations
  const excelBuffer: Buffer | undefined = Array.isArray(excel) ? excel[0] : excel;
  const excelBuffers: Buffer[] = Array.isArray(excel) ? excel : (excel ? [excel] : []);

  // Parse projections from Excel if it's available — otherwise skip.
  // Sheet-agnostic: reads EVERY sheet (legacy fixed-row layouts kept for
  // backward compatibility; generic label/period-axis detection for any other
  // workbook, e.g. the accountant's GL/TB/PL/BS export). Never throws.
  let projections: FinancialProjectionRow[] | null = null;
  if (excelBuffer) {
    try {
      projections = parseFinancialProjectionsFromBuffer(excelBuffer);
    } catch (err) {
      console.warn('[seed] Could not parse financial projections from workbook (wrong format?):', err instanceof Error ? err.message : err);
      projections = null;
    }
  }

  // ── Workbook analysis (derive sheet metadata, dynamic pages, use cases) ──
  let workbookAnalysisMd = '';
  const sheetSnippets: { key: string; category: string; content: string }[] = [];
  const allAnalyses: import('@/domain/excel/workbook-analyzer').WorkbookAnalysis[] = [];

  // Analyze each uploaded workbook and combine results
  for (let wi = 0; wi < excelBuffers.length; wi++) {
    const buf = excelBuffers[wi];
    const label = excelBuffers.length > 1 ? `workbook ${wi + 1}` : 'uploaded workbook';
    try {
      const analysis = analyzeWorkbook(buf, filesUsed.excel === 'upload' ? label : undefined);
      allAnalyses.push(analysis);

      // Register dynamic pages for each sheet (only from the primary workbook)
      if (wi === 0) {
        const dynamicPages = generatePagesFromAnalysis(analysis);
        setDynamicPages(dynamicPages);
        console.log(`[seed] Generated ${dynamicPages.length} dynamic page(s) from workbook analysis`);
      }

      // Create per-sheet knowledge snippets
      for (const sheet of analysis.sheets) {
        if (sheet.columns.length < 2) continue;
        const snippetKey = `sheet_${sheet.slug.replace(/-/g, '_')}${wi > 0 ? `_${wi}` : ''}`;
        sheetSnippets.push({
          key: snippetKey,
          category: 'sheet',
          content: generateSheetMarkdown(sheet),
        });
      }
    } catch (err) {
      console.warn(`[seed] Workbook ${wi + 1} analysis failed (non-critical):`, err instanceof Error ? err.message : err);
    }
  }

  // Build combined workbook overview from all analyses
  if (allAnalyses.length === 1) {
    workbookAnalysisMd = generateAnalysisMarkdown(allAnalyses[0]);
  } else if (allAnalyses.length > 1) {
    // Merge analyses into a single combined overview
    const combined = {
      fileName: `${allAnalyses.length} workbooks merged`,
      company: allAnalyses[0].company,
      period: allAnalyses[0].period,
      sheetCount: allAnalyses.reduce((n, a) => n + a.sheetCount, 0),
      sheets: allAnalyses.flatMap((a) => a.sheets),
      categoriesFound: Array.from(new Set(allAnalyses.flatMap((a) => a.categoriesFound))),
      summary: allAnalyses.map((a) => a.summary).join('\n'),
    };
    workbookAnalysisMd = generateAnalysisMarkdown(combined as import('@/domain/excel/workbook-analyzer').WorkbookAnalysis);
  }

  // Create the workbook overview snippet
  if (workbookAnalysisMd) {
    sheetSnippets.push({
      key: 'workbook_summary',
      category: 'document',
      content: workbookAnalysisMd,
    });
  }

  const reviewParts = businessReview !== undefined ? parseBusinessReviewParts(businessReview) : [];

  // Register parsed parts in the catalog so listReviewParts() includes H–O
  if (reviewParts.length > 0) {
    setDynamicReviewParts(
      reviewParts.map(
        (p): ReviewPartDefinition => ({
          partSlug: p.slug,
          partKey: p.partKey,
          title: p.title,
          authTier: 'google',
        }),
      ),
    );
  }

  // Generate Terms + Privacy from tenant, template capabilities, page catalog,
  // and workbook analysis (falls back to bundled HTML only if generation fails).
  let termsMd = '';
  let privacyMd = '';
  try {
    const primaryAnalysis = allAnalyses[0] ?? null;
    const legal = generateLegalDocuments(primaryAnalysis);
    termsMd = legal.termsMarkdown;
    privacyMd = legal.privacyMarkdown;
    console.log(
      `[seed] Generated Terms + Privacy for "${legal.context.businessName}" ` +
        `(${legal.context.pages.length} catalog pages, workbook=${legal.context.workbook?.fileName ?? 'none'})`,
    );
  } catch (err) {
    console.warn(
      '[seed] Legal doc generation failed; falling back to bundled HTML:',
      err instanceof Error ? err.message : err,
    );
    try {
      termsMd = htmlToMarkdownish(readUtf8(TERMS_HTML_PATH));
      privacyMd = htmlToMarkdownish(readUtf8(PRIVACY_HTML_PATH));
    } catch (htmlErr) {
      console.warn(
        '[seed] Could not read legal HTML files (serverless deployment?):',
        htmlErr instanceof Error ? htmlErr.message : htmlErr,
      );
    }
  }
  const knowledgeSnippets = buildKnowledgeSnippets(executiveSummary ?? '', termsMd, privacyMd);

  // Append workbook analysis as a knowledge snippet
  if (workbookAnalysisMd) {
    knowledgeSnippets.push({
      key: 'workbook_analysis',
      category: 'document',
      content: workbookAnalysisMd,
    });
  }

  // Append per-sheet description snippets so the content API can
  // serve doc_markdown blocks for dynamically generated sheet pages.
  for (const s of sheetSnippets) {
    knowledgeSnippets.push(s);
  }

  // Cache each workbook as a base64 knowledge snippet so the AI Content
  // Generation endpoint and reprocess can read them on serverless runtimes
  // where the filesystem is read-only.
  const allExcelBuffers: Buffer[] = Array.isArray(excel) ? excel : (excel ? [excel] : []);
  if (allExcelBuffers.length > 0) {
    knowledgeSnippets.push({
      key: 'workbook_data',
      category: 'cache',
      content: allExcelBuffers[0]!.toString('base64'),
    });
    // Additional workbooks stored as workbook_data_1, workbook_data_2, etc.
    for (let i = 1; i < allExcelBuffers.length; i++) {
      knowledgeSnippets.push({
        key: `workbook_data_${i}`,
        category: 'cache',
        content: allExcelBuffers[i]!.toString('base64'),
      });
    }

    const names = options.excelFileNames ?? [];
    const meta = buildWorkbookCacheMeta(
      allExcelBuffers.map((buf, i) => ({
        fileName: names[i] || (i === 0 ? SOURCE_FILENAMES.excel : `workbook_${i}.xlsx`),
        sizeBytes: buf.byteLength,
      })),
    );
    knowledgeSnippets.push({
      key: WORKBOOK_META_KEY,
      category: 'cache',
      content: JSON.stringify(meta),
    });

    // Import-time formula inventory: find every formula cell in the workbook
    // and map its references to the DB-sheet coordinates (column key + data
    // row offset) the sheet viewer serves, so formulas can be computed against
    // the database-saved sheet data. Non-fatal — the workbook itself remains
    // the primary source when this parse fails.
    try {
      const formulaWb = read(allExcelBuffers[0]!, {
        type: 'buffer',
        cellFormula: true,
        cellNF: false,
        cellStyles: false,
      });
      const formulaMap = buildWorkbookFormulaMap(formulaWb);
      knowledgeSnippets.push({
        key: 'workbook_formulas',
        category: 'cache',
        content: JSON.stringify(formulaMap),
      });
    } catch (err) {
      console.warn(
        '[seed] Formula map extraction failed (workbook still cached):',
        err instanceof Error ? err.message : String(err),
      );
    }
  }
  const actionItems = buildActionItems();
  const builtTasks = buildTasks();
  const pageEntries = Object.values(getFullCatalog());
  const seedCorpus = getRedRubySeedCorpus();
  const seedLevers = seedCorpus?.FIVE_LEVERS ?? [];
  const seedMonthlyTargets = seedCorpus?.MONTHLY_TARGETS ?? [];

  const counts: SeedCounts = {
    financialProjections: projections ? projections.length : 0,
    businessReviewParts: reviewParts.length,
    levers: seedLevers.length,
    actionItems: actionItems.length,
    monthlyTargets: seedMonthlyTargets.length,
    knowledgeSnippets: knowledgeSnippets.length,
    appPages: pageEntries.length,
    pageSections: pageEntries.reduce((n, p) => n + p.sections.length, 0),
    roles: KNOWN_ROLES.length,
    tasks: builtTasks.length,
    taskAssignments: builtTasks.reduce((n, t) => n + Math.max(t.ownerCodes.length, 1), 0),
  };

  if (reviewParts.length === 0) {
    console.warn('[seed] No review parts parsed — the Business Review MD may not contain "## Part <label>: <title>" sections');
  } else {
    console.log(`[seed] Parsed ${reviewParts.length} review part(s): ${reviewParts.map((p) => p.title).join(', ')}`);
  }

  const connStr = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connStr) {
    console.log('[seed] POSTGRES_URL not set — dry-run only (parsers validated, no DB writes).');
    return { counts, filesUsed };
  }

  if (dryRun) {
    console.log('[seed] --dry-run: skipping DB writes.');
    return { counts, filesUsed };
  }

  const prisma = new PrismaClient({ datasources: { db: { url: connStr } } });
  // Suite deployments (e.g. tokenizmyapp-finance) set NEXT_PUBLIC_APP_ID —
  // seed must write the same app_id that seed-details / chart APIs filter on.
  const appId = getCurrentAppId();

  try {
    await ensureLegacyTables(prisma);
    await ensureContentTables(prisma);
    // Migrate UNIQUE keys to include app_id (same helper used for tenant provision).
    try {
      await addTenantColumnsIfMissing(prisma);
    } catch (err) {
      console.warn(
        '[seed] addTenantColumnsIfMissing warning (non-fatal):',
        err instanceof Error ? err.message : err,
      );
    }
    // Adopt prior seeds that wrote app_id='' before suite scoping was fixed.
    await reclaimOrphanAppScopedRows(prisma, appId);

    if (projections && !options.skipFinancialProjections) {
      for (const row of projections) {
        await upsertFinancialProjectionRaw(prisma, row, appId);
      }
    } else if (options.skipFinancialProjections) {
      console.log('[seed] skipFinancialProjections=true — financial projections left to the AI workbook pipeline');
    }

    for (const part of reviewParts) {
      const catalog = REVIEW_PART_CATALOG[part.slug];
      const authTier = (catalog?.authTier ?? 'google') as AuthTier;
      await prisma.businessReviewPart.upsert({
        where: { slug_appId: { slug: part.slug, appId } },
        create: {
          partKey: part.partKey,
          slug: part.slug,
          title: catalog?.title ?? part.title,
          sortOrder: part.sortOrder,
          authTier,
          markdown: part.markdown,
          appId,
        },
        update: {
          partKey: part.partKey,
          title: catalog?.title ?? part.title,
          sortOrder: part.sortOrder,
          authTier,
          markdown: part.markdown,
        },
      });
    }

    for (const lever of seedLevers) {
      const description = [
        `Target: ${lever.target}`,
        '',
        'Actions:',
        ...lever.actions.map((a: any) => `- ${a}`),
      ].join('\n');
      await prisma.lever.upsert({
        where: { num_appId: { num: lever.num, appId } },
        create: {
          num: lever.num,
          name: lever.name,
          impact: lever.impact,
          description,
          appId,
        },
        update: {
          name: lever.name,
          impact: lever.impact,
          description,
        },
      });
    }

    await prisma.actionItem.deleteMany({ where: { appId } });
    await prisma.actionItem.createMany({
      data: actionItems.map((item) => ({
        priority: item.priority,
        label: item.label,
        sortOrder: item.sortOrder,
        completed: false,
        appId,
      })),
    });

    // ── Task tracking: roles, tasks, assignments ──
    const roleIdByCode = new Map<string, string>();
    for (const role of KNOWN_ROLES) {
      const created = await prisma.role.upsert({
        where: { code: role.code },
        create: {
          code: role.code,
          name: role.name,
          isPlatformAdmin: role.isPlatformAdmin ?? false,
        },
        update: {
          name: role.name,
          isPlatformAdmin: role.isPlatformAdmin ?? false,
        },
      });
      roleIdByCode.set(role.code, created.id);
    }

    // Recreate tasks from the current priority actions (idempotent by title+sortOrder).
    await prisma.taskAssignment.deleteMany({ where: { task: { appId } } });
    await prisma.task.deleteMany({ where: { appId } });

    let taskOrder = 0;
    const now = Date.now();
    for (const built of builtTasks) {
      const dueDate = new Date(now + built.dueOffsetDays * 24 * 60 * 60 * 1000);
      const task = await prisma.task.create({
        data: {
          title: built.title,
          description: built.description,
          priority: built.priority,
          status: 'pending' as TaskStatus,
          dueDate,
          sortOrder: taskOrder++,
          appId,
        },
      });
      const ownerCodes = built.ownerCodes.length > 0 ? built.ownerCodes : [];
      for (const code of ownerCodes) {
        const roleId = roleIdByCode.get(code);
        if (!roleId) continue;
        await prisma.taskAssignment.create({
          data: { taskId: task.id, roleId, assigned: true },
        });
      }
    }

    for (const target of seedMonthlyTargets) {
      await prisma.monthlyTarget.upsert({
        where: { month_appId: { month: target.month, appId } },
        create: {
          month: target.month,
          targetRevenue: target.revenue,
          targetEbitda: target.ebitda,
          targetGuests: target.guests,
          targetAvgSpend: target.spend,
          targetStaffCostPct: target.staffPct,
          appId,
        },
        update: {
          targetRevenue: target.revenue,
          targetEbitda: target.ebitda,
          targetGuests: target.guests,
          targetAvgSpend: target.spend,
          targetStaffCostPct: target.staffPct,
        },
      });
    }

    for (const snippet of knowledgeSnippets) {
      await prisma.knowledgeSnippet.upsert({
        where: { key_appId: { key: snippet.key, appId } },
        create: { ...snippet, appId },
        update: { category: snippet.category, content: snippet.content },
      });
    }

    let pageSort = 0;
    const tenantSlugForPages =
      process.env.NEXT_PUBLIC_TENANT_SLUG?.trim() || null;
    const registryTenantSlug = tenantSlugForPages
      ? resolveRegistryTenantSlug(tenantSlugForPages, appId)
      : null;

    for (const page of pageEntries) {
      const storageSlug = appId ? toStoragePageSlug(page.slug, appId) : page.slug;
      const appPage = await prisma.appPage.upsert({
        where: { slug: storageSlug },
        create: {
          slug: storageSlug,
          title: page.title,
          authTier: page.authTier as AuthTier,
          sortOrder: pageSort++,
          navLabel: page.navLabel ?? page.title,
          showInNav: page.showInNav !== false,
          tenantSlug: registryTenantSlug,
          appId: appId || null,
        },
        update: {
          title: page.title,
          authTier: page.authTier as AuthTier,
          sortOrder: pageSort - 1,
          navLabel: page.navLabel ?? page.title,
          showInNav: page.showInNav !== false,
          tenantSlug: registryTenantSlug ?? undefined,
          appId: appId || null,
        },
      });

      await prisma.pageSection.deleteMany({ where: { pageId: appPage.id } });
      await prisma.pageSection.createMany({
        data: page.sections.map((section, index) => ({
          pageId: appPage.id,
          sortOrder: index,
          blockType: section.blockType as BlockType,
          config: section.config as Prisma.InputJsonValue,
        })),
      });
    }

    // Keep drawer nav idempotent after every reseed (collapse Excel/sheet dupes).
    try {
      const { reconcileNavigationDuplicates, syncSheetPagesIntoNavigation } = await import(
        '@/lib/navigation/db'
      );
      const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG?.trim() || null;
      await reconcileNavigationDuplicates(prisma, { tenantSlug, appId });
      await syncSheetPagesIntoNavigation(prisma, { tenantSlug, appId });
    } catch (err) {
      console.warn(
        '[seed] Navigation reconcile skipped:',
        err instanceof Error ? err.message : err,
      );
    }

    return { counts, filesUsed };
  } finally {
    await prisma.$disconnect();
  }
}
