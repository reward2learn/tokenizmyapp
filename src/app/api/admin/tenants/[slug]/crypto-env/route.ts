/**
 * Crypto Env Push — "Save Changes" from the Crypto Payments wizard step
 *
 * POST /api/admin/tenants/[slug]/crypto-env
 *
 * 1. Reads metadata.config.cryptoPaymentsEnabled + cryptoTreasuryAddress
 * 2. Pushes CRYPTO_PAYMENTS_ENABLED, CRYPTO_TREASURY_ADDRESS, and
 *    NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED to the tenant Vercel project (+ suite apps)
 * 3. Mirrors the same fields into the tenant Neon DB app_settings.tenant_metadata
 *    so the deployed app can read seeded config at runtime
 * 4. Triggers deploy hooks when env was written (NEXT_PUBLIC_* needs rebuild)
 */
import { NextResponse } from 'next/server';
import { createClientForUrl, createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import {
  cryptoConfigForTenantMetadata,
  isValidTreasuryAddress,
  normalizeTreasuryAddress,
  readTenantCryptoConfig,
} from '@/lib/web3/crypto-tenant-config';
import type { AppPackConfig } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    const rows = (await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
      slug,
    )) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const tenant = rows[0];
    const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
    const cfg = (meta.config ?? {}) as Record<string, unknown>;
    const crypto = readTenantCryptoConfig(cfg);

    if (crypto.cryptoPaymentsEnabled && !crypto.cryptoTreasuryAddress) {
      return jsonError(
        'CRYPTO_TREASURY_ADDRESS is required when crypto payments are enabled. Save a receiving wallet address first.',
        400,
      );
    }
    if (!isValidTreasuryAddress(crypto.cryptoTreasuryAddress)) {
      return jsonError('CRYPTO_TREASURY_ADDRESS must be a valid EVM address (0x…).', 400);
    }

    const tenantProjectId = String(tenant.vercel_project_id ?? '');
    const projects: { id: string; name: string; deployHookUrl?: string }[] = [];
    if (tenantProjectId) {
      projects.push({
        id: tenantProjectId,
        name: slug,
        deployHookUrl:
          String((cfg.hooks as Record<string, unknown> | undefined)?.deployHookUrl ?? '') ||
          undefined,
      });
    }
    const appPack = getAppPack(tenant);
    for (const app of appPack?.apps ?? []) {
      if (app.vercelProjectId) {
        projects.push({
          id: app.vercelProjectId,
          name: `${slug}/${app.appId}`,
          deployHookUrl: app.deployHookUrl || undefined,
        });
      }
    }

    if (projects.length === 0) {
      return jsonError(
        'Tenant has no Vercel project yet — deploy the app first, then save Crypto Payments settings.',
        400,
      );
    }

    const { syncCryptoEnvVars } = await import('@/domain/tenant/vercel-deploy-service');
    let envCount = 0;
    const pushed: string[] = [];
    for (const project of projects) {
      const count = await syncCryptoEnvVars(project.id, {
        cryptoPaymentsEnabled: crypto.cryptoPaymentsEnabled,
        cryptoTreasuryAddress: crypto.cryptoTreasuryAddress,
      });
      envCount += count;
      pushed.push(project.name);
    }

    // Mirror into tenant Neon app_settings so the live app can read seeded config.
    let seededToDb = false;
    const tenantDbUrl =
      String(
        (cfg.database as Record<string, unknown> | undefined)?.pooledUrl ??
          (cfg.database as Record<string, unknown> | undefined)?.databaseUrl ??
          tenant.db_url ??
          '',
      ).trim() || '';
    if (tenantDbUrl && !tenantDbUrl.includes('***')) {
      try {
        const { getAppSettings, updateAppSettings } = await import(
          '@/domain/config/app-settings-service'
        );
        const tenantDb = createClientForUrl(tenantDbUrl);
        try {
          const existing = await getAppSettings(tenantDb, slug);
          const prevMeta = existing.tenantMetadata ?? {};
          const prevConfig = (prevMeta.config ?? {}) as Record<string, unknown>;
          await updateAppSettings(
            tenantDb,
            {
              tenantMetadata: {
                ...prevMeta,
                config: {
                  ...prevConfig,
                  ...cryptoConfigForTenantMetadata({
                    cryptoPaymentsEnabled: crypto.cryptoPaymentsEnabled,
                    cryptoTreasuryAddress: normalizeTreasuryAddress(
                      crypto.cryptoTreasuryAddress,
                    ),
                  }),
                  web3WalletEnabled:
                    typeof cfg.web3WalletEnabled === 'boolean'
                      ? cfg.web3WalletEnabled
                      : prevConfig.web3WalletEnabled,
                },
              },
            },
            slug,
          );
          seededToDb = true;
        } finally {
          await tenantDb.$disconnect();
        }
      } catch (err) {
        console.warn(
          `[crypto-env] Could not seed tenant DB for ${slug}:`,
          err instanceof Error ? err.message : err,
        );
      }
    }

    const redeployTriggered: string[] = [];
    if (envCount > 0) {
      for (const project of projects) {
        if (!project.deployHookUrl) continue;
        try {
          await fetch(project.deployHookUrl, { method: 'POST' });
          redeployTriggered.push(project.name);
        } catch (err) {
          console.warn(
            `[crypto-env] Deploy hook failed for ${project.name}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
    }

    return jsonOk({
      projects: projects.length,
      envCount,
      pushed,
      seededToDb,
      redeployTriggered,
      note:
        envCount > 0 && redeployTriggered.length === 0
          ? 'Env pushed — trigger a redeploy so NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED reaches the client bundle.'
          : undefined,
    });
  } catch (err) {
    return jsonError(
      'Failed to push crypto env: ' + (err instanceof Error ? err.message : String(err)),
      500,
    );
  }
}
