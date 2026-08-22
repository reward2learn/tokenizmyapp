/**
 * Sync tenant subscription tier amounts → Stripe Price objects → metadata + Vercel env.
 */
import type Stripe from 'stripe';
import type { createRawClient } from '@/lib/db';
import type { StripeEnvConfig } from '@/lib/billing/stripe-client';
import { getStripeFor } from '@/lib/billing/stripe-client';
import {
  defaultSubscriptionAmounts,
  shortKeyFor,
  PURCHASABLE_PLAN_IDS,
  stripeYearlyUnitAmount,
  SUBSCRIPTION_PRICE_SHORT_KEYS,
  type SubscriptionPriceShortKey,
} from '@/lib/billing/subscription-pricing';
import { PLANS } from '@/lib/billing/plans';

type RawDb = ReturnType<typeof createRawClient>;

export type SubscriptionCatalogSyncResult = {
  prices: Record<string, string>;
  message: string;
  created: SubscriptionPriceShortKey[];
};

function lookupKeyFor(tenantSlug: string, planId: string, interval: string): string {
  return `tma_${tenantSlug}_${planId}_${interval}`.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 200);
}

function parseAmounts(raw: Record<string, unknown> | undefined): Record<SubscriptionPriceShortKey, number> {
  const defaults = defaultSubscriptionAmounts();
  const out = { ...defaults };
  if (!raw) return out;
  for (const key of SUBSCRIPTION_PRICE_SHORT_KEYS) {
    const v = raw[key];
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
      out[key] = Math.round(v);
    } else if (typeof v === 'string' && v.trim()) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) out[key] = Math.round(n);
    }
  }
  return out;
}

function parseExistingPrices(raw: Record<string, unknown> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  for (const key of SUBSCRIPTION_PRICE_SHORT_KEYS) {
    const v = String(raw[key] ?? '').trim();
    if (v) out[key] = v;
  }
  return out;
}

async function priceMatches(
  stripe: Stripe,
  priceId: string,
  unitAmount: number,
  recurringInterval: 'month' | 'year',
): Promise<boolean> {
  try {
    const price = await stripe.prices.retrieve(priceId);
    return (
      price.unit_amount === unitAmount &&
      price.recurring?.interval === recurringInterval &&
      price.active
    );
  } catch {
    return false;
  }
}

/**
 * Create or reuse Stripe Prices for Pro/Business monthly & yearly tiers.
 * Requires a tenant Stripe secret key (metadata or Marketplace).
 */
export async function syncSubscriptionCatalogForTenant(
  tenantSlug: string,
  amounts: Record<string, number>,
  existingPrices: Record<string, string>,
  secretKey: string,
): Promise<SubscriptionCatalogSyncResult> {
  const stripe = getStripeFor({ secretKey });
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is required to sync subscription prices.');
  }

  const out: Record<string, string> = { ...existingPrices };
  const created: SubscriptionPriceShortKey[] = [];

  for (const planId of PURCHASABLE_PLAN_IDS) {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) continue;

    for (const interval of ['monthly', 'yearly'] as const) {
      const shortKey = shortKeyFor(planId, interval);
      const monthlyCents = amounts[shortKey];
      if (!monthlyCents || monthlyCents <= 0) continue;

      const recurringInterval = interval === 'monthly' ? 'month' : 'year';
      const unitAmount =
        interval === 'monthly' ? monthlyCents : stripeYearlyUnitAmount(monthlyCents);
      const lookupKey = lookupKeyFor(tenantSlug, planId, interval);

      const existingId = out[shortKey]?.trim();
      if (existingId && await priceMatches(stripe, existingId, unitAmount, recurringInterval)) {
        continue;
      }

      const listed = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
      const byLookup = listed.data[0];
      if (
        byLookup &&
        byLookup.unit_amount === unitAmount &&
        byLookup.recurring?.interval === recurringInterval &&
        byLookup.active
      ) {
        out[shortKey] = byLookup.id;
        continue;
      }

      const product = await stripe.products.create({
        name: `${plan.label} (${interval})`,
        metadata: {
          tenantSlug,
          planId,
          interval,
          source: 'tokenizmyapp-factory',
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: unitAmount,
        recurring: { interval: recurringInterval },
        lookup_key: lookupKey,
        metadata: { tenantSlug, planId, interval },
      });

      out[shortKey] = price.id;
      created.push(shortKey);
    }
  }

  const message =
    created.length > 0
      ? `Created or updated ${created.length} Stripe subscription price(s): ${created.join(', ')}`
      : 'Subscription Stripe prices are up to date';

  return { prices: out, message, created };
}

export async function persistTenantSubscriptionCatalog(
  slug: string,
  db: RawDb,
  prices: Record<string, string>,
  amounts: Record<SubscriptionPriceShortKey, number>,
): Promise<void> {
  const rows = (await db.$queryRawUnsafe(
    `SELECT metadata FROM tenants WHERE slug = $1 LIMIT 1;`,
    slug,
  )) as Record<string, unknown>[];
  if (rows.length === 0) return;

  const meta = (rows[0].metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  const stripe = (cfg.stripe ?? {}) as Record<string, unknown>;

  const nextMeta = {
    ...meta,
    config: {
      ...cfg,
      stripe: {
        ...stripe,
        prices,
        subscriptionPricing: amounts,
      },
    },
  };

  await db.$executeRawUnsafe(
    `UPDATE tenants SET metadata = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    JSON.stringify(nextMeta),
    slug,
  );
}

/** Read subscription amounts + price ids from tenant metadata. */
export function readSubscriptionCatalogFromStripeMeta(
  stripeMeta: Record<string, unknown>,
): {
  amounts: Record<SubscriptionPriceShortKey, number>;
  prices: Record<string, string>;
} {
  const subscriptionPricing = stripeMeta.subscriptionPricing as Record<string, unknown> | undefined;
  const pricesRaw = (stripeMeta.prices ?? {}) as Record<string, unknown>;
  return {
    amounts: parseAmounts(subscriptionPricing),
    prices: parseExistingPrices(pricesRaw),
  };
}

export async function syncTenantSubscriptionCatalogFromMetadata(
  slug: string,
  db: RawDb,
  stripeConfig: StripeEnvConfig | null,
): Promise<SubscriptionCatalogSyncResult | null> {
  const secretKey = stripeConfig?.secretKey?.trim();
  if (!secretKey) return null;

  const rows = (await db.$queryRawUnsafe(
    `SELECT metadata FROM tenants WHERE slug = $1 LIMIT 1;`,
    slug,
  )) as Record<string, unknown>[];
  if (rows.length === 0) return null;

  const meta = (rows[0].metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  const stripeMeta = (cfg.stripe ?? {}) as Record<string, unknown>;
  const { amounts, prices: existing } = readSubscriptionCatalogFromStripeMeta(stripeMeta);

  const hasAnyAmount = SUBSCRIPTION_PRICE_SHORT_KEYS.some((k) => amounts[k] > 0);
  if (!hasAnyAmount) return null;

  const result = await syncSubscriptionCatalogForTenant(slug, amounts, existing, secretKey);
  await persistTenantSubscriptionCatalog(slug, db, result.prices, amounts);
  return result;
}
