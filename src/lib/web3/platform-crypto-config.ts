/**
 * Platform (factory) crypto rail config — env first, then tenants.metadata.config
 * for the factory slug so Ops Admin → Crypto Payments works without a separate
 * Vercel dashboard visit after Save.
 */
import { createRawClient } from '@/lib/db';
import { readTenantCryptoConfig } from '@/lib/web3/crypto-tenant-config';

export interface PlatformCryptoConfig {
  enabled: boolean;
  treasuryAddress: string | undefined;
  source: 'env' | 'tenant-registry' | 'none';
}

let cache: PlatformCryptoConfig | null = null;
let loadPromise: Promise<PlatformCryptoConfig> | null = null;

function parseEnvBool(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true';
}

function fromEnv(): PlatformCryptoConfig {
  const treasuryAddress = process.env.CRYPTO_TREASURY_ADDRESS?.trim() || undefined;
  const flagged =
    parseEnvBool(process.env.CRYPTO_PAYMENTS_ENABLED) ||
    parseEnvBool(process.env.NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED);
  const enabled = flagged && Boolean(treasuryAddress);
  return {
    enabled,
    treasuryAddress,
    source: treasuryAddress && flagged ? 'env' : treasuryAddress || flagged ? 'env' : 'none',
  };
}

/**
 * Resolve platform crypto config. Env wins; otherwise read the factory tenant
 * row (`NEXT_PUBLIC_TENANT_SLUG`, default tokenizmyapp) metadata.config.
 */
export async function resolvePlatformCryptoConfig(): Promise<PlatformCryptoConfig> {
  if (cache?.enabled && cache.treasuryAddress) return cache;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const env = fromEnv();
    if (env.enabled && env.treasuryAddress) {
      cache = env;
      return env;
    }

    const slug = process.env.NEXT_PUBLIC_TENANT_SLUG?.trim() || 'tokenizmyapp';
    try {
      const db = createRawClient();
      const rows = (await db.$queryRawUnsafe(
        `SELECT metadata FROM tenants WHERE slug = $1 LIMIT 1;`,
        slug,
      )) as { metadata?: Record<string, unknown> }[];
      const meta = (rows[0]?.metadata ?? {}) as Record<string, unknown>;
      const cfg = (meta.config ?? {}) as Record<string, unknown>;
      const crypto = readTenantCryptoConfig(cfg);
      const treasuryAddress =
        env.treasuryAddress || crypto.cryptoTreasuryAddress || undefined;
      const flagged =
        parseEnvBool(process.env.CRYPTO_PAYMENTS_ENABLED) ||
        parseEnvBool(process.env.NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED) ||
        crypto.cryptoPaymentsEnabled;
      const resolved: PlatformCryptoConfig = {
        enabled: flagged && Boolean(treasuryAddress),
        treasuryAddress,
        source: crypto.cryptoTreasuryAddress || crypto.cryptoPaymentsEnabled
          ? 'tenant-registry'
          : env.source,
      };
      cache = resolved;
      return resolved;
    } catch (err) {
      console.warn(
        '[platform-crypto] Could not load tenant registry crypto config:',
        err instanceof Error ? err.message : err,
      );
      cache = env;
      return env;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/** Clear memoized config (tests + after crypto-env save). */
export function resetPlatformCryptoConfigForTests(): void {
  cache = null;
  loadPromise = null;
}

export function clearPlatformCryptoConfigCache(): void {
  cache = null;
  loadPromise = null;
}
