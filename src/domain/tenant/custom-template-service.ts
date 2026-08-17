/**
 * Custom Template Service — AI-generated templates, stored and reusable.
 *
 * The built-in catalog (template-catalog.ts) is code: 13 sector templates that
 * ship with the product. Custom templates are *data* — an admin generates one
 * from a URL or knowledge-base content via the chat assistant, it is stored
 * here, and from then on it appears alongside the built-ins wherever a tenant
 * picks a template.
 *
 * ⚠️ Placement: platform root DB, never a tenant's dedicated database. A
 * template is control-plane configuration shared across tenants — the same rule
 * that governs the billing tables. See organization-service.ts.
 *
 * ⚠️ Resolution is ASYNC. `getTemplate()` in template-catalog.ts is a synchronous
 * lookup over an in-memory record and cannot see these rows. Server code that
 * must accept a custom id calls `resolveTemplate()` below; client code reads the
 * merged list from GET /api/admin/templates. Built-in ids keep working through
 * either path, so existing call sites are unaffected until they need customs.
 */
import { createRawClient } from '@/lib/db';
import {
  TEMPLATE_CATALOG,
  getTemplate,
  listTemplates,
  type TemplateCapabilities,
  type TemplateDefinition,
} from '@/domain/tenant/template-catalog';

type RawDb = ReturnType<typeof createRawClient>;

/** How a custom template was produced — kept for provenance in the admin UI. */
export type CustomTemplateSourceKind = 'url' | 'knowledge' | 'prompt';

export interface CustomTemplateRecord {
  id: string;
  label: string;
  description: string;
  icon: string;
  templateType: 'single' | 'suite';
  /** The full TemplateDefinition payload, minus the identity fields above. */
  definition: TemplateDefinition;
  capabilities: TemplateCapabilities;
  sourceKind: CustomTemplateSourceKind;
  /** The URL scraped, or a short label for the knowledge source. */
  sourceRef: string | null;
  /** The admin's original brief — useful for regenerating later. */
  prompt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

const CUSTOM_TEMPLATES_DDL = `
CREATE TABLE IF NOT EXISTS custom_templates (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Dashboard',
  template_type TEXT NOT NULL DEFAULT 'single',
  definition JSONB NOT NULL DEFAULT '{}',
  capabilities JSONB NOT NULL DEFAULT '{}',
  source_kind TEXT NOT NULL DEFAULT 'prompt',
  source_ref TEXT,
  prompt TEXT,
  created_by TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

export async function ensureCustomTemplateTables(db: RawDb): Promise<void> {
  await db.$executeRawUnsafe(CUSTOM_TEMPLATES_DDL);
  const { ensureUpdatedAtDefaults } = await import('@/lib/db-updated-at');
  await ensureUpdatedAtDefaults(db, ['custom_templates']);
}

/**
 * Namespace prefix for generated ids.
 *
 * Guarantees a custom template can never shadow a built-in: `getTemplate()`
 * falls back to `default` for unknown ids, so an id collision would silently
 * swap one template for another at provisioning time.
 */
export const CUSTOM_TEMPLATE_PREFIX = 'custom-';

export function isCustomTemplateId(id: string): boolean {
  return id.startsWith(CUSTOM_TEMPLATE_PREFIX);
}

/** Slugify a label into a collision-free custom template id. */
export function toCustomTemplateId(label: string): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'template';
  return `${CUSTOM_TEMPLATE_PREFIX}${base}`;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'object') return value as T;
  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
}

function mapRow(row: Record<string, unknown>): CustomTemplateRecord {
  const definition = parseJson<TemplateDefinition>(row.definition, {} as TemplateDefinition);
  const capabilities = parseJson<TemplateCapabilities>(row.capabilities, {});
  return {
    id: String(row.id),
    label: String(row.label),
    description: String(row.description ?? ''),
    icon: String(row.icon ?? 'Dashboard'),
    templateType: row.template_type === 'suite' ? 'suite' : 'single',
    definition,
    capabilities,
    sourceKind: (String(row.source_kind ?? 'prompt') as CustomTemplateSourceKind),
    sourceRef: row.source_ref == null ? null : String(row.source_ref),
    prompt: row.prompt == null ? null : String(row.prompt),
    createdBy: row.created_by == null ? null : String(row.created_by),
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

/**
 * Rebuild a full TemplateDefinition from a stored row.
 *
 * The identity columns win over whatever is inside `definition` so a rename via
 * SQL cannot desync the two representations.
 */
export function toTemplateDefinition(record: CustomTemplateRecord): TemplateDefinition {
  const base = record.definition ?? ({} as TemplateDefinition);
  const fallback = TEMPLATE_CATALOG.default;
  return {
    ...fallback,
    ...base,
    id: record.id,
    label: record.label,
    description: record.description,
    icon: record.icon,
    templateType: record.templateType,
    source: 'custom',
    capabilities: record.capabilities,
    // Never let a malformed generation produce a template with no pages — a
    // tenant provisioned from it would deploy an app with nothing in it.
    defaultPages: base.defaultPages?.length ? base.defaultPages : fallback.defaultPages,
    defaultNavItems: base.defaultNavItems?.length ? base.defaultNavItems : fallback.defaultNavItems,
    defaultColors: base.defaultColors ?? fallback.defaultColors,
    schemaOrgType: base.schemaOrgType ?? fallback.schemaOrgType,
    xsdStandard: base.xsdStandard ?? fallback.xsdStandard,
  };
}

export async function listCustomTemplates(
  db: RawDb = createRawClient(),
): Promise<CustomTemplateRecord[]> {
  await ensureCustomTemplateTables(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM custom_templates ORDER BY created_at DESC;`,
  )) as Record<string, unknown>[];
  return rows.map(mapRow);
}

export async function getCustomTemplate(
  id: string,
  db: RawDb = createRawClient(),
): Promise<CustomTemplateRecord | null> {
  await ensureCustomTemplateTables(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM custom_templates WHERE id = $1 LIMIT 1;`,
    id,
  )) as Record<string, unknown>[];
  return rows.length ? mapRow(rows[0]) : null;
}

export interface SaveCustomTemplateInput {
  id?: string;
  label: string;
  description?: string;
  icon?: string;
  templateType?: 'single' | 'suite';
  definition: TemplateDefinition;
  capabilities?: TemplateCapabilities;
  sourceKind: CustomTemplateSourceKind;
  sourceRef?: string | null;
  prompt?: string | null;
  createdBy?: string | null;
}

/** Insert or update a custom template. Idempotent on id. */
export async function saveCustomTemplate(
  input: SaveCustomTemplateInput,
  db: RawDb = createRawClient(),
): Promise<CustomTemplateRecord> {
  await ensureCustomTemplateTables(db);

  const id = input.id ?? toCustomTemplateId(input.label);
  if (!isCustomTemplateId(id)) {
    throw new Error(
      `Custom template id must start with "${CUSTOM_TEMPLATE_PREFIX}" so it cannot shadow a built-in template: got "${id}"`,
    );
  }

  await db.$executeRawUnsafe(
    `INSERT INTO custom_templates
       (id, label, description, icon, template_type, definition, capabilities,
        source_kind, source_ref, prompt, created_by, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10, $11, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       label = EXCLUDED.label,
       description = EXCLUDED.description,
       icon = EXCLUDED.icon,
       template_type = EXCLUDED.template_type,
       definition = EXCLUDED.definition,
       capabilities = EXCLUDED.capabilities,
       source_kind = EXCLUDED.source_kind,
       source_ref = EXCLUDED.source_ref,
       prompt = EXCLUDED.prompt,
       updated_at = CURRENT_TIMESTAMP;`,
    id,
    input.label,
    input.description ?? '',
    input.icon ?? 'Dashboard',
    input.templateType ?? 'single',
    JSON.stringify({ ...input.definition, id }),
    JSON.stringify(input.capabilities ?? {}),
    input.sourceKind,
    input.sourceRef ?? null,
    input.prompt ?? null,
    input.createdBy ?? null,
  );

  const saved = await getCustomTemplate(id, db);
  if (!saved) throw new Error(`Custom template ${id} vanished immediately after upsert`);
  return saved;
}

export async function deleteCustomTemplate(
  id: string,
  db: RawDb = createRawClient(),
): Promise<boolean> {
  await ensureCustomTemplateTables(db);
  const deleted = await db.$executeRawUnsafe(
    `DELETE FROM custom_templates WHERE id = $1;`,
    id,
  );
  return Number(deleted ?? 0) > 0;
}

/**
 * Resolve any template id — built-in or custom.
 *
 * Use this in server code that accepts a template id from a request. Falls back
 * to the built-in `default` for unknown ids, matching getTemplate()'s contract
 * so callers do not need a new error path.
 */
export async function resolveTemplate(
  id: string,
  db: RawDb = createRawClient(),
): Promise<TemplateDefinition> {
  if (!isCustomTemplateId(id)) return getTemplate(id);
  const record = await getCustomTemplate(id, db);
  return record ? toTemplateDefinition(record) : getTemplate('default');
}

/**
 * Does this template id actually exist?
 *
 * Needed because `getTemplate()` silently falls back to the `default` template
 * for unknown ids rather than throwing — so `try { getTemplate(id) } catch` is
 * dead code and an unknown id provisions the wrong app instead of erroring.
 * Route handlers validating a caller-supplied id must use this.
 */
export async function templateExists(
  id: string,
  db: RawDb = createRawClient(),
): Promise<boolean> {
  if (!isCustomTemplateId(id)) return Object.hasOwn(TEMPLATE_CATALOG, id);
  return (await getCustomTemplate(id, db)) !== null;
}

/** Built-ins plus every stored custom template — what the pickers show. */
export async function listAllTemplates(
  db: RawDb = createRawClient(),
): Promise<TemplateDefinition[]> {
  const builtins = listTemplates().map((t) => ({ ...t, source: 'builtin' as const }));
  let customs: TemplateDefinition[] = [];
  try {
    customs = (await listCustomTemplates(db)).map(toTemplateDefinition);
  } catch {
    // A missing table or unreachable DB must not break template selection —
    // the built-ins are always available and are what most tenants use.
  }
  return [...builtins, ...customs];
}
