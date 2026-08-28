import { DEFAULT_REOWN_PROJECT_ID } from '@/lib/web3/reown';

/**
 * Crypto billing architecture — locked design decisions.
 *
 * Payment rail: USDC via social wallet (Reown AppKit). Stripe remains the
 * default card rail. Users choose at checkout time (dual-rail UI).
 *
 * @see docs/google-oauth-appkit-setup.md — SIWE auth stack
 */

/** Sepolia — SIWE sign-in messages always target this chain (Correction D in setup doc). */
export const SIWE_CHAIN_ID = 11_155_111;

/** EIP-4361 statement — must match on nonce (server) and getMessageParams (client). */
export const SIWE_STATEMENT =
  'Sign in with your wallet to link crypto payments on TokenizMyApp.';

/** Base mainnet — production USDC payments. */
export const PAYMENT_CHAIN_ID_PRODUCTION = 8453;

/** Sepolia — staging / test USDC payments. */
export const PAYMENT_CHAIN_ID_STAGING = 11_155_111;

/** Circle USDC on Base mainnet. */
export const USDC_BASE_MAINNET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

/** Circle test USDC on Sepolia. */
export const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fcb1Fa41d66781d0590' as const;

/** Platform treasury — single address for all tenants in v1. */
export function resolveTreasuryAddress(): string | undefined {
  return process.env.CRYPTO_TREASURY_ADDRESS?.trim() || undefined;
}

/** Active payment chain — Base in production, Sepolia elsewhere unless overridden. */
export function resolvePaymentChainId(): number {
  const override = process.env.CRYPTO_PAYMENT_CHAIN_ID?.trim();
  if (override) {
    const parsed = Number.parseInt(override, 10);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
    ? PAYMENT_CHAIN_ID_PRODUCTION
    : PAYMENT_CHAIN_ID_STAGING;
}

export function usdcContractForChain(chainId: number): `0x${string}` | undefined {
  if (chainId === PAYMENT_CHAIN_ID_PRODUCTION) return USDC_BASE_MAINNET;
  if (chainId === PAYMENT_CHAIN_ID_STAGING) return USDC_SEPOLIA;
  return undefined;
}

/** Prepaid plan months purchasable via crypto (monthly recurring is Stripe-only). */
export const CRYPTO_PLAN_PREPAID_MONTHS = [1, 3, 6, 12] as const;

export type CryptoPlanPrepaidMonths = (typeof CRYPTO_PLAN_PREPAID_MONTHS)[number];

/** USDC has 6 decimals — convert pack price (USD cents) to atomic units. */
export function usdcAmountFromCents(priceCents: number): bigint {
  if (!Number.isFinite(priceCents) || priceCents <= 0) {
    throw new Error(`Invalid price cents: ${priceCents}`);
  }
  return BigInt(Math.round(priceCents)) * 10_000n;
}

function parseEnvBool(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true';
}

/** Server-side crypto rail availability (treasury + feature flag). */
export function isCryptoPaymentsEnabledServer(): boolean {
  const flagged =
    parseEnvBool(process.env.CRYPTO_PAYMENTS_ENABLED) ||
    parseEnvBool(process.env.NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED);
  if (!flagged && process.env.NODE_ENV !== 'development') return false;
  return Boolean(resolveTreasuryAddress());
}

/**
 * Client-side crypto rail toggle visibility.
 *
 * Aligned with getFactoryWeb3Config(): wallet/crypto UI is on by default when
 * a Reown project id resolves, not only when NEXT_PUBLIC_* flags are explicit.
 */
export function isCryptoPaymentsEnabledClient(): boolean {
  const explicitlyDisabled =
    process.env.NEXT_PUBLIC_WEB3_WALLET_ENABLED?.trim().toLowerCase() === 'false' ||
    process.env.NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED?.trim().toLowerCase() === 'false';
  if (explicitlyDisabled) return false;

  const projectId =
    process.env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim() || DEFAULT_REOWN_PROJECT_ID;
  return Boolean(projectId);
}

export interface CryptoPaymentsReadiness {
  enabled: boolean;
  hasTreasury: boolean;
  chainId: number;
  usdcContract: string | undefined;
  hasRpcUrl: boolean;
}

export function cryptoPaymentsReadiness(): CryptoPaymentsReadiness {
  const chainId = resolvePaymentChainId();
  const usdcContract = usdcContractForChain(chainId);
  const treasury = resolveTreasuryAddress();
  const hasRpcUrl = Boolean(resolveRpcUrl(chainId));
  const enabled = isCryptoPaymentsEnabledServer() && Boolean(treasury && usdcContract);
  return {
    enabled,
    hasTreasury: Boolean(treasury),
    chainId,
    usdcContract,
    hasRpcUrl,
  };
}

/** RPC URL for on-chain payment verification. */
export function resolveRpcUrl(chainId: number): string | undefined {
  if (chainId === PAYMENT_CHAIN_ID_PRODUCTION) {
    return (
      process.env.BASE_RPC_URL?.trim() ||
      process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim() ||
      'https://mainnet.base.org'
    );
  }
  if (chainId === PAYMENT_CHAIN_ID_STAGING) {
    return (
      process.env.SEPOLIA_RPC_URL?.trim() ||
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL?.trim() ||
      // rpc.sepolia.org returns 404 for eth_* — publicnode is the reliable default.
      'https://ethereum-sepolia-rpc.publicnode.com'
    );
  }
  return undefined;
}
