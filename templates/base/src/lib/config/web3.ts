/**
 * Web3 wallet runtime configuration — Reown AppKit.
 *
 * The platform writes these env vars when it deploys an app, driven by the
 * template's `capabilities.web3Wallet` (see tokenizmyapp/src/lib/web3/reown.ts,
 * which is the only writer of these keys — keep the two in lockstep).
 *
 * Environment Variables:
 *   NEXT_PUBLIC_WEB3_WALLET_ENABLED — "true" to mount the wallet at all
 *   NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED — "true" for USDC billing UI (Crypto Payments wizard step)
 *   CRYPTO_PAYMENTS_ENABLED — server-only USDC rail flag (pushed with treasury)
 *   CRYPTO_TREASURY_ADDRESS — server-only receiving wallet for USDC
 *   NEXT_PUBLIC_REOWN_PROJECT_ID    — Reown project id (public client id)
 *   NEXT_PUBLIC_WEB3_CONNECT_MODE   — social | injected | both
 *   NEXT_PUBLIC_WEB3_SOCIALS        — comma list, e.g. "google,apple"
 *   NEXT_PUBLIC_WEB3_EMAIL_LOGIN    — "true" to offer email sign-in
 *   NEXT_PUBLIC_WEB3_CHAINS         — comma list of EVM chain ids, e.g. "8453"
 *   NEXT_PUBLIC_WEB3_SHOW_BALANCES  — "true" to show token balances
 *   NEXT_PUBLIC_WEB3_TOKEN_GATING   — "true" to allow token-gated pages
 *
 * ⚠️ Every read must go through `process.env.NEXT_PUBLIC_*` written out in
 * full. Next.js inlines these at build time by literal textual substitution, so
 * `process.env[key]` with a computed key resolves to undefined in the browser.
 */

export type WalletSocialProvider = 'google' | 'apple';
export type WalletConnectMode = 'social' | 'injected' | 'both';

export interface Web3RuntimeConfig {
  enabled: boolean;
  projectId: string;
  connectMode: WalletConnectMode;
  socialProviders: WalletSocialProvider[];
  emailLogin: boolean;
  chains: number[];
  showBalances: boolean;
  tokenGating: boolean;
}

/** Base mainnet — the default chain for social wallets (low fees, no bridging story to explain). */
const DEFAULT_CHAIN_ID = 8453;

const KNOWN_SOCIALS: WalletSocialProvider[] = ['google', 'apple'];

function parseBool(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true';
}

function parseChains(value: string | undefined): number[] {
  const ids = (value ?? '')
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((id) => Number.isInteger(id) && id > 0);
  return ids.length ? ids : [DEFAULT_CHAIN_ID];
}

function parseSocials(value: string | undefined): WalletSocialProvider[] {
  return (value ?? '')
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter((part): part is WalletSocialProvider =>
      (KNOWN_SOCIALS as string[]).includes(part),
    );
}

function parseConnectMode(value: string | undefined): WalletConnectMode {
  const mode = value?.trim().toLowerCase();
  return mode === 'injected' || mode === 'both' ? mode : 'social';
}

const DISABLED: Web3RuntimeConfig = {
  enabled: false,
  projectId: '',
  connectMode: 'social',
  socialProviders: [],
  emailLogin: false,
  chains: [DEFAULT_CHAIN_ID],
  showBalances: false,
  tokenGating: false,
};

/**
 * Resolve the wallet config for this deployment.
 *
 * Safe on both server and client — reads only inlined env vars, never the DB.
 *
 * Returns a disabled config when the project id is missing even if the enabled
 * flag is set: AppKit throws on an empty projectId, and a hard crash in a
 * provider that wraps the whole tree would take the entire app down over an
 * optional feature.
 */
function isWeb3FeatureEnabled(): boolean {
  return (
    parseBool(process.env.NEXT_PUBLIC_WEB3_WALLET_ENABLED) ||
    parseBool(process.env.NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED)
  );
}

export function getWeb3Config(): Web3RuntimeConfig {
  if (!isWeb3FeatureEnabled()) return DISABLED;

  const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim() ?? '';
  if (!projectId) {
    console.warn(
      '[web3] Wallet is enabled but NEXT_PUBLIC_REOWN_PROJECT_ID is not set — wallet disabled.',
    );
    return DISABLED;
  }

  const connectMode = parseConnectMode(process.env.NEXT_PUBLIC_WEB3_CONNECT_MODE);
  const socialProviders = parseSocials(process.env.NEXT_PUBLIC_WEB3_SOCIALS);
  const emailLogin = parseBool(process.env.NEXT_PUBLIC_WEB3_EMAIL_LOGIN);

  // A social-only wallet with no socials and no email offers the user nothing
  // to click. Treat it as misconfiguration rather than shipping a dead button.
  if (connectMode === 'social' && socialProviders.length === 0 && !emailLogin) {
    console.warn(
      '[web3] connectMode is "social" but no social providers or email login are enabled — wallet disabled.',
    );
    return DISABLED;
  }

  return {
    enabled: true,
    projectId,
    connectMode,
    socialProviders,
    emailLogin,
    chains: parseChains(process.env.NEXT_PUBLIC_WEB3_CHAINS),
    showBalances: parseBool(process.env.NEXT_PUBLIC_WEB3_SHOW_BALANCES),
    tokenGating: parseBool(process.env.NEXT_PUBLIC_WEB3_TOKEN_GATING),
  };
}

/** True when this deployment should mount the wallet provider at all. */
export function isWeb3Enabled(): boolean {
  return getWeb3Config().enabled;
}

/**
 * Server-side USDC rail config from env (written by factory crypto-env / deploy).
 * Prefer these over reading app_settings when both exist — env is authoritative after push.
 */
export function getCryptoPaymentsConfig(): {
  enabled: boolean;
  treasuryAddress: string | undefined;
} {
  const enabled =
    parseBool(process.env.CRYPTO_PAYMENTS_ENABLED) ||
    parseBool(process.env.NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED);
  const treasuryAddress = process.env.CRYPTO_TREASURY_ADDRESS?.trim() || undefined;
  return {
    enabled: enabled && Boolean(treasuryAddress),
    treasuryAddress,
  };
}
