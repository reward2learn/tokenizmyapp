/**
 * Platform catalog USD overrides + Stripe list price sync.
 *
 * Source of truth for display amounts after platform-admin apply:
 * billing_catalog_overrides → fall back to static PLANS / CREDIT_PACKS.
 * Stripe price IDs for the factory catalog are stored alongside overrides
 * (DB-backed) so checkout / mismatch checks can resolve without fragile env edits.
 */
import type Stripe from 'stripe';
import { createRawClient } from '@/lib/db';
import { getStripe, getStripeFor, priceEnvKey } from '@/lib/billing/stripe-client';
import {
  CREDIT_PACKS,
  PLANS,
  yearlyMonthlyPrice,
  type CreditPack,
  type PlanDef,
  type PlanId,
} from '@/lib/billing/plans';
import {
  mergeCatalogFaceAmounts,
  staticCatalogFaceAmounts,
  type CatalogFaceAmounts,
} from '@/lib/billing/ai-credits-calculator';
import {
  PURCHASABLE_PLAN_IDS,
  shortKeyFor,
  stripeYearlyUnitAmount,
  type SubscriptionPriceShortKey,
} from '@/lib/billing/subscription-pricing';
import { MARKUP_FLOOR, purchasedCreditsForUsdAtMarkup } from '@/lib/billing/tenant-rate-card';

type RawDb = ReturnType<typeof createRawClient>;

const DDL = `
CREATE TABLE IF NOT EXISTS billing_catalog_overrides (
  id TEXT PRIMARY KEY DEFAULT 'global',
  plan_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  pack_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  stripe_price_ids JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  updated_by TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS billing_catalog_audit (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

let ensured = false;

export async function ensureCatalogTables(db?: RawDb): Promise<RawDb> {
  db ??= createRawClient();
  if (!ensured) {
    await db.$executeRawUnsafe(DDL);
    ensured = true;
  }
  return db;
}

export type PackPriceShortKey = 'PACK_25' | 'PACK_50' | 'PACK_100';

export type CatalogStripePriceKey = SubscriptionPriceShortKey | PackPriceShortKey;

export interface BillingCatalogRecord {
  id: string;
  catalog: CatalogFaceAmounts;
  stripePriceIds: Partial<Record<CatalogStripePriceKey, string>>;
  notes: string | null;
  updatedBy: string | null;
  updatedAt: string;
  hasOverrides: boolean;
}

function emptyStripeIds(): Partial<Record<CatalogStripePriceKey, string>> {
  return {};
}

function parsePlanPrices(raw: unknown): CatalogFaceAmounts['plans'] | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const read = (key: string) => {
    const v = o[key];
    if (!v || typeof v !== 'object') return undefined;
    const p = v as Record<string, unknown>;
    const monthly = Number(p.monthlyCents ?? p.monthly ?? p.priceMonthly);
    const yearly = Number(p.yearlyCents ?? p.yearly ?? p.priceYearly);
    if (!Number.isFinite(monthly)) return undefined;
    return {
      monthlyCents: Math.max(0, Math.round(monthly)),
      yearlyCents: Number.isFinite(yearly)
        ? Math.max(0, Math.round(yearly))
        : yearlyMonthlyPrice(Math.max(0, Math.round(monthly))),
    };
  };
  const free = read('free');
  const pro = read('pro');
  const business = read('business');
  if (!free && !pro && !business) return undefined;
  const base = staticCatalogFaceAmounts().plans;
  return {
    free: free ?? base.free,
    pro: pro ?? base.pro,
    business: business ?? base.business,
  };
}

function parsePackPrices(raw: unknown): CatalogFaceAmounts['packs'] | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const n = (k: string, fallback: number) => {
    const v = Number(o[k]);
    return Number.isFinite(v) && v > 0 ? Math.round(v) : fallback;
  };
  const base = staticCatalogFaceAmounts().packs;
  if (
    o['pack-25'] == null &&
    o['pack-50'] == null &&
    o['pack-100'] == null &&
    o.PACK_25 == null
  ) {
    return undefined;
  }
  return {
    'pack-25': n('pack-25', n('PACK_25', base['pack-25'])),
    'pack-50': n('pack-50', n('PACK_50', base['pack-50'])),
    'pack-100': n('pack-100', n('PACK_100', base['pack-100'])),
  };
}

function parseStripeIds(raw: unknown): Partial<Record<CatalogStripePriceKey, string>> {
  if (!raw || typeof raw !== 'object') return emptyStripeIds();
  const out: Partial<Record<CatalogStripePriceKey, string>> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const id = String(v ?? '').trim();
    if (id) out[k as CatalogStripePriceKey] = id;
  }
  return out;
}

export async function getBillingCatalog(db?: RawDb): Promise<BillingCatalogRecord> {
  db = await ensureCatalogTables(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM billing_catalog_overrides WHERE id = 'global' LIMIT 1;`,
  )) as Record<string, unknown>[];

  const base = staticCatalogFaceAmounts();
  if (rows.length === 0) {
    return {
      id: 'global',
      catalog: base,
      stripePriceIds: emptyStripeIds(),
      notes: null,
      updatedBy: null,
      updatedAt: new Date(0).toISOString(),
      hasOverrides: false,
    };
  }

  const row = rows[0];
  const plans = parsePlanPrices(row.plan_prices);
  const packs = parsePackPrices(row.pack_prices);
  const catalog = mergeCatalogFaceAmounts({
    plans,
    packs,
  });
  const hasOverrides = Boolean(plans || packs);

  return {
    id: 'global',
    catalog,
    stripePriceIds: parseStripeIds(row.stripe_price_ids),
    notes: row.notes == null ? null : String(row.notes),
    updatedBy: row.updated_by == null ? null : String(row.updated_by),
    updatedAt: new Date(String(row.updated_at ?? Date.now())).toISOString(),
    hasOverrides,
  };
}

/** Plans/packs with override faces applied (catalog floor markup for credit sizing). */
export async function getResolvedPlanCatalog(db?: RawDb): Promise<{
  plans: PlanDef[];
  packs: CreditPack[];
  catalog: CatalogFaceAmounts;
  record: BillingCatalogRecord;
}> {
  const record = await getBillingCatalog(db);
  const catalog = record.catalog;
  const plans = PLANS.map((p) => {
    if (p.id === 'enterprise') return { ...p };
    const faces = catalog.plans[p.id as 'free' | 'pro' | 'business'];
    if (!faces) return { ...p };
    const faceUsd = p.id === 'free' ? 20 : faces.monthlyCents / 100;
    return {
      ...p,
      priceMonthly: faces.monthlyCents,
      priceYearly: faces.yearlyCents,
      aiCreditsPerMonth: purchasedCreditsForUsdAtMarkup(faceUsd, MARKUP_FLOOR),
    };
  });
  const packs = CREDIT_PACKS.map((pack) => {
    const cents = catalog.packs[pack.id as keyof CatalogFaceAmounts['packs']] ?? pack.priceCents;
    return {
      ...pack,
      priceCents: cents,
      label: `$${(cents / 100).toFixed(0)}`,
      baseCredits: purchasedCreditsForUsdAtMarkup(cents / 100, MARKUP_FLOOR),
    };
  });
  return { plans, packs, catalog, record };
}

export interface UpsertCatalogPricesInput {
  plans?: Partial<CatalogFaceAmounts['plans']>;
  packs?: Partial<CatalogFaceAmounts['packs']>;
  notes?: string | null;
  updatedBy: string;
  /** Must be true — safety gate for catalog writes. */
  confirm: true;
}

async function writeAudit(
  db: RawDb,
  action: string,
  payload: Record<string, unknown>,
  actor: string | null,
): Promise<void> {
  await db.$executeRawUnsafe(
    `INSERT INTO billing_catalog_audit (id, action, payload, actor, created_at)
     VALUES ($1, $2, $3::jsonb, $4, CURRENT_TIMESTAMP);`,
    `bca_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    action,
    JSON.stringify(payload),
    actor,
  );
}

export async function upsertCatalogPrices(
  input: UpsertCatalogPricesInput,
  db?: RawDb,
): Promise<BillingCatalogRecord> {
  if (input.confirm !== true) {
    throw new Error('Catalog price changes require confirm: true');
  }
  db = await ensureCatalogTables(db);
  const existing = await getBillingCatalog(db);
  const next = mergeCatalogFaceAmounts({
    plans: { ...existing.catalog.plans, ...input.plans },
    packs: { ...existing.catalog.packs, ...input.packs },
  });

  await db.$executeRawUnsafe(
    `INSERT INTO billing_catalog_overrides (
       id, plan_prices, pack_prices, stripe_price_ids, notes, updated_by, updated_at
     ) VALUES ('global', $1::jsonb, $2::jsonb, $3::jsonb, $4, $5, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       plan_prices = EXCLUDED.plan_prices,
       pack_prices = EXCLUDED.pack_prices,
       notes = EXCLUDED.notes,
       updated_by = EXCLUDED.updated_by,
       updated_at = EXCLUDED.updated_at;`,
    JSON.stringify(next.plans),
    JSON.stringify(next.packs),
    JSON.stringify(existing.stripePriceIds),
    input.notes ?? existing.notes,
    input.updatedBy,
  );

  await writeAudit(
    db,
    'catalog_prices_upsert',
    { before: existing.catalog, after: next, notes: input.notes ?? null },
    input.updatedBy,
  );

  return getBillingCatalog(db);
}

async function priceMatches(
  stripe: Stripe,
  priceId: string,
  unitAmount: number,
  recurringInterval: 'month' | 'year' | null,
): Promise<boolean> {
  try {
    const price = await stripe.prices.retrieve(priceId);
    if (price.unit_amount !== unitAmount || !price.active) return false;
    if (recurringInterval == null) return !price.recurring;
    return price.recurring?.interval === recurringInterval;
  } catch {
    return false;
  }
}

export interface SyncStripeCatalogResult {
  prices: Partial<Record<CatalogStripePriceKey, string>>;
  created: CatalogStripePriceKey[];
  message: string;
}

/**
 * Create/reuse Stripe Price objects for purchasable plans + packs to match
 * the resolved catalog faces. Persists IDs on billing_catalog_overrides.
 */
export async function syncStripeCatalogPrices(opts: {
  updatedBy: string;
  confirm: true;
  dryRun?: boolean;
  db?: RawDb;
}): Promise<SyncStripeCatalogResult & { dryRun: boolean }> {
  if (opts.confirm !== true) {
    throw new Error('Stripe sync requires confirm: true');
  }
  const db = await ensureCatalogTables(opts.db);
  const record = await getBillingCatalog(db);
  const stripe = getStripe() ?? getStripeFor();
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is required to sync catalog Stripe prices.');
  }

  const out: Partial<Record<CatalogStripePriceKey, string>> = { ...record.stripePriceIds };
  const created: CatalogStripePriceKey[] = [];
  const catalog = record.catalog;

  // Seed from env when DB has no id yet
  for (const planId of PURCHASABLE_PLAN_IDS) {
    for (const interval of ['monthly', 'yearly'] as const) {
      const key = shortKeyFor(planId, interval);
      if (!out[key]) {
        const envId = process.env[priceEnvKey(planId, interval)]?.trim();
        if (envId) out[key] = envId;
      }
    }
  }
  for (const pack of CREDIT_PACKS) {
    const key = pack.id.replace('pack-', 'PACK_').toUpperCase() as PackPriceShortKey;
    if (!out[key]) {
      const envId = process.env[`STRIPE_PRICE_${key}`]?.trim();
      if (envId) out[key] = envId;
    }
  }

  if (opts.dryRun) {
    return {
      prices: out,
      created: [],
      message: 'Dry run — no Stripe prices created',
      dryRun: true,
    };
  }

  for (const planId of PURCHASABLE_PLAN_IDS) {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) continue;
    const faces = catalog.plans[planId as 'pro' | 'business'];
    if (!faces) continue;

    for (const interval of ['monthly', 'yearly'] as const) {
      const shortKey = shortKeyFor(planId, interval);
      const monthlyCents = faces.monthlyCents;
      if (!monthlyCents || monthlyCents <= 0) continue;

      const recurringInterval = interval === 'monthly' ? 'month' : 'year';
      const unitAmount =
        interval === 'monthly' ? monthlyCents : stripeYearlyUnitAmount(faces.yearlyCents);
      const lookupKey = `tma_catalog_${planId}_${interval}`.slice(0, 200);

      const existingId = out[shortKey]?.trim();
      if (existingId && (await priceMatches(stripe, existingId, unitAmount, recurringInterval))) {
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
        metadata: { planId, interval, source: 'ai-credits-calculator' },
      });
      const price = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: unitAmount,
        recurring: { interval: recurringInterval },
        lookup_key: lookupKey,
        metadata: { planId, interval },
      });
      out[shortKey] = price.id;
      created.push(shortKey);
    }
  }

  for (const pack of CREDIT_PACKS) {
    const shortKey = pack.id.replace('pack-', 'PACK_').toUpperCase() as PackPriceShortKey;
    const cents = catalog.packs[pack.id as keyof CatalogFaceAmounts['packs']];
    if (!cents || cents <= 0) continue;
    const lookupKey = `tma_catalog_${pack.id}`.slice(0, 200);
    const existingId = out[shortKey]?.trim();
    if (existingId && (await priceMatches(stripe, existingId, cents, null))) {
      continue;
    }
    const listed = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
    const byLookup = listed.data[0];
    if (byLookup && byLookup.unit_amount === cents && !byLookup.recurring && byLookup.active) {
      out[shortKey] = byLookup.id;
      continue;
    }
    const product = await stripe.products.create({
      name: `AI Credits ${pack.label}`,
      metadata: { packId: pack.id, source: 'ai-credits-calculator' },
    });
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: cents,
      lookup_key: lookupKey,
      metadata: { packId: pack.id },
    });
    out[shortKey] = price.id;
    created.push(shortKey);
  }

  await db.$executeRawUnsafe(
    `INSERT INTO billing_catalog_overrides (
       id, plan_prices, pack_prices, stripe_price_ids, notes, updated_by, updated_at
     ) VALUES ('global', $1::jsonb, $2::jsonb, $3::jsonb, $4, $5, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       stripe_price_ids = EXCLUDED.stripe_price_ids,
       updated_by = EXCLUDED.updated_by,
       updated_at = EXCLUDED.updated_at;`,
    JSON.stringify(catalog.plans),
    JSON.stringify(catalog.packs),
    JSON.stringify(out),
    record.notes,
    opts.updatedBy,
  );

  await writeAudit(
    db,
    'catalog_stripe_sync',
    { created, prices: out },
    opts.updatedBy,
  );

  const message =
    created.length > 0
      ? `Created or updated ${created.length} Stripe catalog price(s): ${created.join(', ')}`
      : 'Catalog Stripe prices are up to date';

  return { prices: out, created, message, dryRun: false };
}

/** StripeEnvConfig fragment from catalog DB (for mismatch / checkout). */
export async function catalogStripeEnvConfig(db?: RawDb): Promise<{
  prices: Record<string, string>;
  catalog: CatalogFaceAmounts;
}> {
  const record = await getBillingCatalog(db);
  const prices: Record<string, string> = {};
  for (const [k, v] of Object.entries(record.stripePriceIds)) {
    if (v) prices[k] = v;
  }
  return { prices, catalog: record.catalog };
}

export function planCatalogCents(
  planId: PlanId,
  interval: 'monthly' | 'yearly',
  catalog: CatalogFaceAmounts,
): number | null {
  if (planId === 'enterprise') return null;
  if (planId === 'free') {
    return interval === 'yearly' ? catalog.plans.free.yearlyCents : catalog.plans.free.monthlyCents;
  }
  const faces = catalog.plans[planId as 'pro' | 'business'];
  if (!faces) return null;
  return interval === 'yearly' ? faces.yearlyCents : faces.monthlyCents;
}
