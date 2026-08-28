/**
 * Factory app Web3 runtime config — Reown AppKit for billing (social wallet).
 *
 * Unlike tenant apps (env written at deploy from template capabilities), the
 * factory reads NEXT_PUBLIC_* vars from its own Vercel project. Enable with
 * NEXT_PUBLIC_WEB3_WALLET_ENABLED or NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED.
 *
 * @see templates/base/src/lib/config/web3.ts — tenant runtime counterpart
 * @see src/lib/web3/reown.ts — project id resolution
 */
import {
  PAYMENT_CHAIN_ID_PRODUCTION,
  PAYMENT_CHAIN_ID_STAGING,
  SIWE_CHAIN_ID,
} from '@/lib/web3/crypto-billing-config';
import { DEFAULT_REOWN_PROJECT_ID } from '@/lib/web3/reown';

export type WalletSocialProvider = 'google' | 'apple';
export type WalletConnectMode = 'social' | 'injected' | 'both';

export interface FactoryWeb3Config {
  enabled: boolean;
  projectId: string;
  connectMode: WalletConnectMode;
  socialProviders: WalletSocialProvider[];
  emailLogin: boolean;
  /** SIWE target first, then payment chain (Sepolia + Base in prod). */
  chains: number[];
  showBalances: boolean;
}

const KNOWN_SOCIALS: WalletSocialProvider[] = ['google', 'apple'];

function parseBool(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true';
}

function parseSocials(value: string | undefined): WalletSocialProvider[] {
  const parsed = (value ?? 'google,apple')
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter((part): part is WalletSocialProvider =>
      (KNOWN_SOCIALS as string[]).includes(part),
    );
  return parsed.length ? parsed : ['google'];
}

function parseConnectMode(value: string | undefined): WalletConnectMode {
  const mode = value?.trim().toLowerCase();
  return mode === 'injected' || mode === 'both' ? mode : 'social';
}

function paymentChainForBuild(): number {
  const override = process.env.NEXT_PUBLIC_CRYPTO_PAYMENT_CHAIN_ID?.trim();
  if (override) {
    const parsed = Number.parseInt(override, 10);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return process.env.NODE_ENV === 'production'
    ? PAYMENT_CHAIN_ID_PRODUCTION
    : PAYMENT_CHAIN_ID_STAGING;
}

const DISABLED: FactoryWeb3Config = {
  enabled: false,
  projectId: '',
  connectMode: 'social',
  socialProviders: [],
  emailLogin: false,
  chains: [SIWE_CHAIN_ID],
  showBalances: false,
};

/**
 * Resolve factory wallet config. Safe on server and client (inlined env only).
 */
export function getFactoryWeb3Config(): FactoryWeb3Config {
  const explicitlyDisabled =
    process.env.NEXT_PUBLIC_WEB3_WALLET_ENABLED?.trim().toLowerCase() === 'false';

  const explicitlyEnabled =
    parseBool(process.env.NEXT_PUBLIC_WEB3_WALLET_ENABLED) ||
    parseBool(process.env.NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED);

  const projectId =
    process.env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim() || DEFAULT_REOWN_PROJECT_ID;

  if (explicitlyDisabled || !projectId) return DISABLED;

  if (!explicitlyEnabled && process.env.NODE_ENV === 'production') {
    // Production: require an explicit enable flag unless crypto payments are on.
    return DISABLED;
  }

  const connectMode = parseConnectMode(process.env.NEXT_PUBLIC_WEB3_CONNECT_MODE);
  const socialProviders = parseSocials(process.env.NEXT_PUBLIC_WEB3_SOCIALS);
  const emailLogin = process.env.NEXT_PUBLIC_WEB3_EMAIL_LOGIN?.trim()
    ? parseBool(process.env.NEXT_PUBLIC_WEB3_EMAIL_LOGIN)
    : true;

  const paymentChain = paymentChainForBuild();
  const chains = [...new Set([SIWE_CHAIN_ID, paymentChain])];

  return {
    enabled: true,
    projectId,
    connectMode,
    socialProviders,
    emailLogin,
    chains,
    showBalances: parseBool(process.env.NEXT_PUBLIC_WEB3_SHOW_BALANCES),
  };
}

export function isFactoryWeb3Enabled(): boolean {
  return getFactoryWeb3Config().enabled;
}
