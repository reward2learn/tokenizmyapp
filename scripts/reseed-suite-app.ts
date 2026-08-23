#!/usr/bin/env bun
/**
 * Re-seed a suite app (same logic as POST /api/admin/tenants/[slug]/apps/[appId]).
 *
 * Usage:
 *   bun run scripts/reseed-suite-app.ts --tenant tokenizmyapp --app finance
 *   bun run scripts/reseed-suite-app.ts --tenant tokenizmyapp --all
 */

import { PrismaClient } from '../src/generated/prisma';
import { createRawClient } from '../src/lib/db';
import { ensureTenantsTable } from '../src/domain/tenant/tenant-service';
import {
  addTenantColumnsIfMissing,
  resolveTenantAdminEmail,
  seedTemplateSecurityGroups,
  seedTenantDefaults,
  type SeedSqlClient,
} from '../src/domain/tenant/tenant-seed-service';
import { resolveTemplate } from '../src/domain/tenant/custom-template-service';
import type { AppPackConfig } from '../src/store/apis/tenant-api';

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

async function seedOneApp(
  registryDb: SeedSqlClient,
  tenant: Record<string, unknown>,
  slug: string,
  appId: string,
): Promise<{ ok: boolean; errors: string[] }> {
  const appPack = getAppPack(tenant);
  if (!appPack) throw new Error(`Tenant "${slug}" is not in suite mode`);

  const app = appPack.apps.find((a) => a.appId === appId);
  if (!app) throw new Error(`App "${appId}" not found in suite`);

  const tenantDbUrl = tenant.db_url as string | null;
  const tpl = await resolveTemplate(app.templateId);
  const dedicatedSeedClient = tenantDbUrl
    ? new PrismaClient({ datasources: { db: { url: tenantDbUrl } } })
    : null;
  const seedDb: SeedSqlClient = (dedicatedSeedClient ?? registryDb) as SeedSqlClient;

  try {
    await addTenantColumnsIfMissing(seedDb);

    const result = await seedTenantDefaults({
      slug,
      appId,
      displayName: app.name,
      template: app.templateId,
      primaryColor: tpl.defaultColors.primary,
      secondaryColor: tpl.defaultColors.secondary,
      adminEmail: resolveTenantAdminEmail(tenant.metadata as Record<string, unknown>),
      db: seedDb,
    });
    await seedTemplateSecurityGroups(seedDb, app.templateId);

    const pageRows = (await seedDb.$queryRawUnsafe(
      `SELECT slug, app_id FROM app_pages WHERE tenant_slug = $1 AND app_id = $2 ORDER BY slug ASC;`,
      slug,
      appId,
    )) as { slug: string; app_id: string | null }[];
    const [verifiedPagesRows, verifiedNavRows] = await Promise.all([
      seedDb.$queryRawUnsafe(
        `SELECT COUNT(*) AS count FROM app_pages WHERE tenant_slug = $1 AND app_id = $2;`,
        slug,
        appId,
      ),
      seedDb.$queryRawUnsafe(
        `SELECT COUNT(*) AS count FROM navigation_items WHERE tenant_slug = $1 AND app_id = $2;`,
        slug,
        appId,
      ),
    ]);
    const verifiedPages = Number((verifiedPagesRows as { count: bigint }[])[0]?.count ?? 0);
    const verifiedNavItems = Number((verifiedNavRows as { count: bigint }[])[0]?.count ?? 0);

    console.log(`[reseed] ${slug}/${appId} (${dedicatedSeedClient ? 'dedicated' : 'root'} DB)`);
    console.log(`  pages attempted: ${result.pages}, verified: ${verifiedPages}`);
    console.log(`  nav attempted: ${result.navItems}, verified: ${verifiedNavItems}`);
    if (result.errors.length > 0) {
      console.log(`  errors: ${result.errors.join('; ')}`);
    }
    console.log('  page slugs:', pageRows.map((r) => r.slug).join(', ') || '(none)');

    const ok = result.errors.length === 0 && verifiedPages > 0;
    return { ok, errors: result.errors };
  } finally {
    if (dedicatedSeedClient) await dedicatedSeedClient.$disconnect();
  }
}

async function main(): Promise<void> {
  const slug = getArg('--tenant');
  const appId = getArg('--app');
  const all = process.argv.includes('--all');

  if (!slug) {
    console.error('Usage: bun run scripts/reseed-suite-app.ts --tenant <slug> --app <appId>');
    console.error('       bun run scripts/reseed-suite-app.ts --tenant <slug> --all');
    process.exit(1);
  }

  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    console.error('[reseed] POSTGRES_URL (or DATABASE_URL) is not set.');
    process.exit(1);
  }

  const registryDb = createRawClient() as SeedSqlClient;
  await ensureTenantsTable(registryDb);

  const rows = (await registryDb.$queryRawUnsafe(
    `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
    slug,
  )) as Record<string, unknown>[];
  if (rows.length === 0) throw new Error(`Tenant "${slug}" not found`);

  const tenant = rows[0];
  const appPack = getAppPack(tenant);
  if (!appPack) throw new Error(`Tenant "${slug}" is not in suite mode`);

  const targets = all ? appPack.apps.map((a) => a.appId) : appId ? [appId] : [];
  if (targets.length === 0) {
    console.error('Provide --app <appId> or --all');
    process.exit(1);
  }

  let hadFailure = false;
  for (const id of targets) {
    const { ok, errors } = await seedOneApp(registryDb, tenant, slug, id);
    if (!ok) {
      hadFailure = true;
      for (const err of errors) {
        console.error(`[reseed] ${slug}/${id}: ${err}`);
      }
    }
  }

  if (registryDb && '$disconnect' in registryDb && typeof registryDb.$disconnect === 'function') {
    await registryDb.$disconnect();
  }

  process.exit(hadFailure ? 1 : 0);
}

main().catch((err) => {
  console.error('[reseed] failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
