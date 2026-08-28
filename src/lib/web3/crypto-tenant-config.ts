/**
 * Per-tenant crypto payment config — stored on tenants.metadata.config,
 * pushed to Vercel as CRYPTO_* / NEXT_PUBLIC_CRYPTO_*, and mirrored into the
 * tenant DB app_settings.tenant_metadata so deployed apps can read seeded data.
 */
import { isValidEvmAddress } from '@/lib/web3/evm-address';

export interface TenantCryptoPaymentConfig {
  /** Server + client crypto rail (USDC top-ups / prepaid). */
  cryptoPaymentsEnabled: boolean;
  /** Receiving wallet for USDC transfers (Base in prod). */
  cryptoTreasuryAddress: string;
}

export type TenantCryptoDeployOverride = Partial<TenantCryptoPaymentConfig>;

export const CRYPTO_PAYMENT_ENV_KEYS = [
  'CRYPTO_PAYMENTS_ENABLED',
  'CRYPTO_TREASURY_ADDRESS',
  'NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED',
] as const;

export function normalizeTreasuryAddress(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';
  return isValidEvmAddress(trimmed) ? trimmed.toLowerCase() : trimmed;
}

export function isValidTreasuryAddress(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 || isValidEvmAddress(trimmed);
}

/**
 * Resolve crypto flags from tenant metadata.config.
 * When `cryptoPaymentsEnabled` is unset, callers may fall back to wallet enabled.
 */
export function readTenantCryptoConfig(
  config: Record<string, unknown> | null | undefined,
): TenantCryptoPaymentConfig {
  const cfg = config ?? {};
  return {
    cryptoPaymentsEnabled: cfg.cryptoPaymentsEnabled === true,
    cryptoTreasuryAddress: normalizeTreasuryAddress(
      typeof cfg.cryptoTreasuryAddress === 'string' ? cfg.cryptoTreasuryAddress : '',
    ),
  };
}

/**
 * Env vars a deployed tenant (or factory) app needs for the USDC rail.
 *
 * Always writes CRYPTO_PAYMENTS_ENABLED / NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED
 * so a prior enablement cannot stick on Vercel after disable.
 * Treasury is written only when non-empty (clearing requires an explicit empty
 * push via syncCryptoEnvVars).
 */
export function buildCryptoPaymentEnvVars(
  crypto: TenantCryptoDeployOverride,
  options?: { clearTreasuryWhenDisabled?: boolean },
): Record<string, string> {
  const enabled = crypto.cryptoPaymentsEnabled === true;
  const treasury = normalizeTreasuryAddress(crypto.cryptoTreasuryAddress);
  const env: Record<string, string> = {
    CRYPTO_PAYMENTS_ENABLED: enabled ? 'true' : 'false',
    NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED: enabled ? 'true' : 'false',
  };

  if (treasury) {
    env.CRYPTO_TREASURY_ADDRESS = treasury;
  } else if (options?.clearTreasuryWhenDisabled && !enabled) {
    env.CRYPTO_TREASURY_ADDRESS = '';
  }

  return env;
}

/** Shape mirrored into app_settings.tenant_metadata for runtime seed reads. */
export function cryptoConfigForTenantMetadata(
  crypto: TenantCryptoPaymentConfig,
): Record<string, unknown> {
  return {
    cryptoPaymentsEnabled: crypto.cryptoPaymentsEnabled,
    cryptoTreasuryAddress: crypto.cryptoTreasuryAddress || undefined,
  };
}
