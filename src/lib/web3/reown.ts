/**
 * Reown (reown.com) wallet wiring — platform side.
 *
 * A template carries a declarative `Web3WalletConfig` (see template-catalog.ts).
 * This module is the single place that turns that config into the environment
 * variables a deployed tenant app reads at runtime, so the shape of the
 * contract between the platform and a generated app is defined once.
 *
 * The runtime half lives in templates/base/src/lib/config/web3.ts and parses
 * exactly the keys written here. The two must stay in lockstep.
 *
 * Provider model: ONE Reown project fronts every tenant app. Reown scopes usage
 * and domain allow-listing per project, so tenant apps share the platform's
 * project rather than each provisioning their own — there is no per-tenant
 * Reown account to create, and nothing tenant-specific to store.
 */
import type { Web3WalletConfig } from '@/domain/tenant/template-catalog';
import { buildCryptoPaymentEnvVars } from '@/lib/web3/crypto-tenant-config';

/**
 * Reown project id for the platform.
 *
 * NOT a secret. Reown project ids are public client identifiers — they ship in
 * the JavaScript bundle of every app that uses AppKit, which is why the env var
 * is `NEXT_PUBLIC_`. Access is restricted by the domain allow-list configured
 * on the Reown dashboard, not by keeping this string private.
 *
 * The constant is the fallback so provisioning works without extra setup;
 * setting REOWN_PROJECT_ID (or NEXT_PUBLIC_REOWN_PROJECT_ID) overrides it, which
 * is what to do when rotating the id or pointing staging at a separate project.
 */
export const DEFAULT_REOWN_PROJECT_ID = '6f45b9fac8b302233f2cfce1ca0b7979';

export function resolveReownProjectId(): string {
  return (
    process.env.REOWN_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim() ||
    DEFAULT_REOWN_PROJECT_ID
  );
}

/**
 * Wallet defaults for a template that asks for a wallet without saying how.
 *
 * Social-only with Google, Apple and email on Base: the audience for these
 * templates is small businesses and their customers, who do not hold wallets.
 * Requiring MetaMask would exclude nearly all of them, and Base keeps
 * transaction costs low enough that gas is not a conversation the tenant has to
 * have with their users.
 */
export const DEFAULT_WEB3_WALLET: Web3WalletConfig = {
  enabled: true,
  connectMode: 'social',
  socialProviders: ['google', 'apple'],
  emailLogin: true,
  chains: [8453],
  showBalances: false,
  tokenGating: false,
};

/** Env keys a deployed app reads for its wallet. Exported for tests and docs. */
export const WEB3_ENV_KEYS = [
  'NEXT_PUBLIC_WEB3_WALLET_ENABLED',
  'NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED',
  'NEXT_PUBLIC_REOWN_PROJECT_ID',
  'NEXT_PUBLIC_WEB3_CONNECT_MODE',
  'NEXT_PUBLIC_WEB3_SOCIALS',
  'NEXT_PUBLIC_WEB3_EMAIL_LOGIN',
  'NEXT_PUBLIC_WEB3_CHAINS',
  'NEXT_PUBLIC_WEB3_SHOW_BALANCES',
  'NEXT_PUBLIC_WEB3_TOKEN_GATING',
] as const;

/** Tenant metadata.config may override template wallet enablement at deploy time. */
export interface TenantWeb3DeployOverride {
  web3WalletEnabled?: boolean;
  /** When set, drives CRYPTO_* independently of wallet enablement. */
  cryptoPaymentsEnabled?: boolean;
  cryptoTreasuryAddress?: string;
}

/**
 * Merge template wallet config with an optional tenant-level override.
 * Built-in templates omit capabilities.web3Wallet — they inherit DEFAULT_WEB3_WALLET.
 */
export function resolveWeb3WalletForDeploy(
  templateWallet: Web3WalletConfig | null | undefined,
  tenantConfig?: TenantWeb3DeployOverride | null,
): Web3WalletConfig {
  const base = templateWallet ?? DEFAULT_WEB3_WALLET;
  if (typeof tenantConfig?.web3WalletEnabled === 'boolean') {
    return { ...base, enabled: tenantConfig.web3WalletEnabled };
  }
  return base;
}

/**
 * Build the wallet env vars for a deployed tenant app.
 *
 * Always returns `NEXT_PUBLIC_WEB3_WALLET_ENABLED`, including when the wallet is
 * off. Env vars on a Vercel project persist across deploys, so omitting the key
 * for a disabled wallet would leave a previously-enabled app stuck with a wallet
 * its template no longer asks for — the flag has to be written, not skipped.
 *
 * Crypto rail (`CRYPTO_*` + `NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED`) is applied
 * via {@link buildCryptoPaymentEnvVars} from tenant config when present; otherwise
 * NEXT_PUBLIC_CRYPTO follows wallet enablement (legacy default).
 */
export function buildWeb3EnvVars(
  config: Web3WalletConfig | null | undefined,
  cryptoOverride?: Pick<
    TenantWeb3DeployOverride,
    'cryptoPaymentsEnabled' | 'cryptoTreasuryAddress'
  > | null,
): Record<string, string> {
  const wallet = config ?? DEFAULT_WEB3_WALLET;

  if (!wallet.enabled) {
    const disabled: Record<string, string> = {
      NEXT_PUBLIC_WEB3_WALLET_ENABLED: 'false',
      NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED: 'false',
    };
    if (cryptoOverride && typeof cryptoOverride.cryptoPaymentsEnabled === 'boolean') {
      Object.assign(disabled, buildCryptoPaymentEnvVars(cryptoOverride));
      disabled.NEXT_PUBLIC_WEB3_WALLET_ENABLED = 'false';
    }
    return disabled;
  }

  const env: Record<string, string> = {
    NEXT_PUBLIC_WEB3_WALLET_ENABLED: 'true',
    NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED: 'true',
    NEXT_PUBLIC_REOWN_PROJECT_ID: resolveReownProjectId(),
    NEXT_PUBLIC_WEB3_CONNECT_MODE: wallet.connectMode,
    NEXT_PUBLIC_WEB3_SOCIALS: wallet.socialProviders.join(','),
    NEXT_PUBLIC_WEB3_EMAIL_LOGIN: wallet.emailLogin ? 'true' : 'false',
    NEXT_PUBLIC_WEB3_CHAINS: wallet.chains.join(','),
    NEXT_PUBLIC_WEB3_SHOW_BALANCES: wallet.showBalances ? 'true' : 'false',
    NEXT_PUBLIC_WEB3_TOKEN_GATING: wallet.tokenGating ? 'true' : 'false',
  };

  if (cryptoOverride && typeof cryptoOverride.cryptoPaymentsEnabled === 'boolean') {
    Object.assign(env, buildCryptoPaymentEnvVars(cryptoOverride));
  }

  return env;
}
