/**
 * Migrate suite tenants: clone google_oauth_config `default` → `default:{appId}`
 * for every app in metadata.config.appPack.
 *
 * Why: suite mode stores one OAuth row per app (`default:{appId}`) so apps on a
 * shared DB do not overwrite each other's credentials. Existing suites only have
 * the singleton `default` row — this script backfills per-app keys.
 *
 * Notes:
 * - Copies encrypted secret bytes as-is (no decrypt/re-encrypt).
 * - Does NOT call Google Cloud — rows share the parent client's credentials until
 *   you re-run POST .../provision with google=true (provisionGoogleOAuthPerApp).
 * - Idempotent: skips rows that already exist unless --force.
 *
 * Usage:
 *   bun run scripts/migrate-google-oauth-per-app.ts
 *   bun run scripts/migrate-google-oauth-per-app.ts -- --dry-run
 *   bun run scripts/migrate-google-oauth-per-app.ts -- --force
 *   bun run scripts/migrate-google-oauth-per-app.ts -- --slug=my-suite
 *
 * Requires: POSTGRES_URL (or DATABASE_URL)
 */
/// <reference types="node" />
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Client } from 'pg';

const SOURCE_CONFIG_ID = 'default';

const GOOGLE_OAUTH_TABLE_DDL = `
CREATE TABLE IF NOT EXISTS google_oauth_config (
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
)`;

interface SuiteAppRef {
  appId?: string;
  name?: string;
}

interface AppPackRef {
  packId?: string;
  apps?: SuiteAppRef[];
}

type OauthSourceRow = {
  id: string;
  client_id: string;
  project_id: string;
  auth_uri: string;
  token_uri: string;
  encrypted_secret: string;
  iv: string;
  auth_tag: string;
};

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArgs(): { dryRun: boolean; force: boolean; slug?: string } {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  let dryRun = false;
  let force = false;
  let slug: string | undefined;
  for (const arg of args) {
    if (arg === '--dry-run') dryRun = true;
    else if (arg === '--force') force = true;
    else if (arg.startsWith('--slug=')) slug = arg.slice('--slug='.length).trim() || undefined;
  }
  return { dryRun, force, slug };
}

function parseMetadata(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') return raw as Record<string, unknown>;
  return {};
}

function getAppPack(metadata: unknown): AppPackRef | null {
  const meta = parseMetadata(metadata);
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  const pack = cfg.appPack as AppPackRef | undefined;
  if (!pack?.apps?.length) return null;
  return pack;
}

function perAppConfigId(appId: string): string {
  return `${SOURCE_CONFIG_ID}:${appId}`;
}

async function main(): Promise<void> {
  loadEnvLocal();
  const { dryRun, force, slug } = parseArgs();

  const connectionString = process.env.POSTGRES_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error('POSTGRES_URL (or DATABASE_URL) is not set');
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(GOOGLE_OAUTH_TABLE_DDL);

    const sourceResult = await client.query<OauthSourceRow>(
      `SELECT id, client_id, project_id, auth_uri, token_uri, encrypted_secret, iv, auth_tag
       FROM google_oauth_config WHERE id = $1 LIMIT 1`,
      [SOURCE_CONFIG_ID],
    );
    const source = sourceResult.rows[0];
    if (!source) {
      throw new Error(
        `No google_oauth_config row with id='${SOURCE_CONFIG_ID}'. Seed or provision OAuth first.`,
      );
    }

    console.log('[migrate-oauth-per-app] Source client_id:', source.client_id);
    console.log('[migrate-oauth-per-app] Source project_id:', source.project_id);
    if (dryRun) console.log('[migrate-oauth-per-app] --dry-run (no writes)');
    if (force) console.log('[migrate-oauth-per-app] --force (overwrite existing per-app rows)');

    const tenantsResult = slug
      ? await client.query<{ slug: string; metadata: unknown }>(
          `SELECT slug, metadata FROM tenants WHERE slug = $1 LIMIT 1`,
          [slug],
        )
      : await client.query<{ slug: string; metadata: unknown }>(
          `SELECT slug, metadata FROM tenants
           WHERE metadata->'config'->'appPack' IS NOT NULL
           ORDER BY slug`,
        );

    const tenants = tenantsResult.rows;
    if (tenants.length === 0) {
      console.log(
        slug
          ? `[migrate-oauth-per-app] Tenant "${slug}" not found.`
          : '[migrate-oauth-per-app] No suite tenants (metadata.config.appPack) found.',
      );
      return;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let missingAppId = 0;

    for (const tenant of tenants) {
      const appPack = getAppPack(tenant.metadata);
      if (!appPack) {
        console.log(`[migrate-oauth-per-app] skip ${tenant.slug}: no appPack`);
        continue;
      }

      const apps = appPack.apps ?? [];
      console.log(
        `[migrate-oauth-per-app] ${tenant.slug}: ${apps.length} app(s) in pack "${appPack.packId ?? '?'}"`,
      );

      for (const app of apps) {
        const appId = app.appId?.trim();
        if (!appId) {
          missingAppId += 1;
          console.warn(`[migrate-oauth-per-app]   ⚠ app missing appId in ${tenant.slug}`);
          continue;
        }

        const configId = perAppConfigId(appId);
        const existing = await client.query<{ id: string }>(
          `SELECT id FROM google_oauth_config WHERE id = $1 LIMIT 1`,
          [configId],
        );
        const exists = existing.rows.length > 0;

        if (exists && !force) {
          skipped += 1;
          console.log(`[migrate-oauth-per-app]   · ${configId} already exists — skip`);
          continue;
        }

        if (dryRun) {
          console.log(
            `[migrate-oauth-per-app]   · would ${exists ? 'update' : 'create'} ${configId} (${app.name ?? appId})`,
          );
          if (exists) updated += 1;
          else created += 1;
          continue;
        }

        await client.query(
          `INSERT INTO google_oauth_config (
            id, client_id, project_id, auth_uri, token_uri,
            encrypted_secret, iv, auth_tag
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            client_id = EXCLUDED.client_id,
            project_id = EXCLUDED.project_id,
            auth_uri = EXCLUDED.auth_uri,
            token_uri = EXCLUDED.token_uri,
            encrypted_secret = EXCLUDED.encrypted_secret,
            iv = EXCLUDED.iv,
            auth_tag = EXCLUDED.auth_tag,
            updated_at = NOW()`,
          [
            configId,
            source.client_id,
            source.project_id,
            source.auth_uri,
            source.token_uri,
            source.encrypted_secret,
            source.iv,
            source.auth_tag,
          ],
        );

        if (exists) {
          updated += 1;
          console.log(`[migrate-oauth-per-app]   ✓ updated ${configId}`);
        } else {
          created += 1;
          console.log(`[migrate-oauth-per-app]   ✓ created ${configId}`);
        }
      }
    }

    console.log(
      `[migrate-oauth-per-app] Done — created=${created} updated=${updated} skipped=${skipped} missingAppId=${missingAppId}`,
    );
    console.log(
      '[migrate-oauth-per-app] Tip: re-run suite Google provision to mint unique OAuth clients per app.',
    );
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((err: unknown) => {
  console.error('[migrate-oauth-per-app] Fatal:', err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
