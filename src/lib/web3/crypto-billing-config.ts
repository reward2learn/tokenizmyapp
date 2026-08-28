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
