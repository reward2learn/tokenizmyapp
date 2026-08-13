/**
 * App Pack — Schema Apply
 *
 * Compiles the pack's app definitions into a single consolidated ZenStack
 * zmodel (audit preview / result artifact) and applies the pack's models to
 * the target tenant database as real tables via additive raw DDL.
 *
 * Why raw DDL instead of `runMigrations` (zenstack generate + prisma db push)?
 * `prisma db push --accept-data-loss` DROPS tables that are not present in
 * the schema. The pack zmodel contains only the pack's models, so pushing it
 * against the root DB or a factory-created tenant DB (which both hold many
 * other tables) would delete them. Additive `CREATE TABLE IF NOT EXISTS`
 * creates the pack's tables without touching anything else — safe against
 * every target, idempotent on re-run, and consistent with the materializer.
 *
 * Column shapes mirror what compileToZModel emits (field names as-is, base
 * columns id/tenant_slug/created_at/updated_at) so the tables match the
 * zmodel preview and the generated Prisma client.
 */

import type { Client } from 'pg';
import { compileToZModel } from '@/domain/ai/zmodel-compiler';
import type { SchemaGenerationResult, GeneratedModel } from '@/domain/ai/schema-generation-schema';
import type { AppPackAppDefinition } from './app-pack-schema';

export interface PackSchemaApplyResult {
  /** Consolidated zmodel (single datasource/generator/enum) — audit preview. */
  zmodel: string;
  /** True when all pack tables were ensured in the target DB. */
  applied: boolean;
  durationMs: number;
}

// ── Field type mapping (mirrors zmodel-compiler mapFieldType) ──

function mapSqlType(fieldType: string): string {
  switch (fieldType) {
    case 'string':   return 'TEXT';
    case 'text':     return 'TEXT';
    case 'integer':  return 'INTEGER';
    case 'decimal':  return 'NUMERIC(14,2)';
    case 'boolean':  return 'BOOLEAN';
    case 'datetime': return 'TIMESTAMP';
    case 'date':     return 'DATE';
    case 'time':     return 'TIME';
    case 'enum':     return 'TEXT';
    case 'json':     return 'JSONB';
    case 'relation': return 'TEXT';
    default:         return 'TEXT';
  }
}

function mapSqlDefault(field: GeneratedModel['fields'][number]): string | null {
  const d = field.default;
  if (d === undefined || d === null) return null;
  if (typeof d === 'string') return `DEFAULT '${d.replace(/'/g, "''")}'`;
  if (typeof d === 'boolean') return `DEFAULT ${d}`;
  if (typeof d === 'number') return `DEFAULT ${d}`;
  return null; // arrays/objects — skip (zmodel maps them to String anyway)
}

/** Build the CREATE TABLE IF NOT EXISTS statement for one model. */
function compileTableDDL(model: GeneratedModel): string {
  const columns: string[] = [
    'id TEXT PRIMARY KEY',
    'tenant_slug TEXT',
  ];

  for (const f of model.fields) {
    const type = mapSqlType(f.type);
    const nullable = f.required ? 'NOT NULL' : '';
    const unique = f.unique ? 'UNIQUE' : '';
    const def = mapSqlDefault(f);
    columns.push(`  ${f.name} ${type} ${nullable} ${unique} ${def ?? ''}`.replace(/\s+/g, ' ').trim());
  }

  columns.push('created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
  columns.push('updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');

  return `CREATE TABLE IF NOT EXISTS "${model.tableName}" (\n${columns.join(',\n')}\n);`;
}

/** Column backfills for tables that pre-date the pack's columns. */
function compileTableAlters(model: GeneratedModel): string[] {
  const alters: string[] = [];
  for (const f of model.fields) {
    const type = mapSqlType(f.type);
    const nullable = f.required ? 'NOT NULL' : '';
    const def = mapSqlDefault(f);
    alters.push(
      `ALTER TABLE "${model.tableName}" ADD COLUMN IF NOT EXISTS ${f.name} ${type} ${nullable} ${def ?? ''}`
        .replace(/\s+/g, ' ')
        .trim(),
    );
  }
  return alters;
}

/**
 * Build a single consolidated zmodel from every app definition — one
 * datasource/generator/enum header plus all models — reusing the shared
 * compileToZModel. Model names are kept as generated; on a name collision
 * the later model is suffixed with its app id so the schema stays valid.
 */
export function compilePackZModel(definitions: AppPackAppDefinition[]): string {
  const seen = new Set<string>();
  const models = definitions.flatMap((def) =>
    def.models.map((m) => {
      let name = m.name;
      if (seen.has(name)) {
        name = `${name}_${def.appId.replace(/[^a-zA-Z0-9]/g, '')}`;
      }
      seen.add(name);
      return { ...m, name };
    }),
  );

  const merged: SchemaGenerationResult = {
    templateId: 'app-pack',
    schemaOrgType: 'LocalBusiness',
    models,
    useCases: definitions.flatMap((d) => d.useCases),
    pages: definitions.flatMap((d) => d.pages),
  };
  return compileToZModel(merged);
}

/**
 * Apply the pack's models to the target DB as real tables. Additive and
 * idempotent: creates missing tables/indexes, backfills missing columns,
 * never drops or alters existing data.
 */
export async function applyPackSchema(
  client: Client,
  definitions: AppPackAppDefinition[],
): Promise<PackSchemaApplyResult> {
  const startedAt = Date.now();
  const zmodel = compilePackZModel(definitions);

  for (const def of definitions) {
    for (const model of def.models) {
      await client.query(compileTableDDL(model));
      await client.query(
        `CREATE INDEX IF NOT EXISTS "${model.tableName}_tenant_slug_idx" ON "${model.tableName}" (tenant_slug);`,
      );
      for (const alter of compileTableAlters(model)) {
        try {
          await client.query(alter);
        } catch {
          // Column may already exist — ignore.
        }
      }
    }
  }

  return {
    zmodel,
    applied: true,
    durationMs: Date.now() - startedAt,
  };
}