/**
 * Agentic Commerce catalog sync — publish CREDIT_PACKS as ACS SKUs on a tenant's
 * Stripe account (tenant-keys model, no Connect platform).
 *
 * Uses Stripe v2 product catalog import APIs (preview). Isolated here so API
 * version bumps do not scatter across the billing layer.
 */
import type { createRawClient } from '@/lib/db';
import {
  agenticCreditPackSku,
  catalogSkusComplete,
  isCatalogSyncFresh,
  packIdFromAgenticSku,
  STRIPE_AGENTIC_API_VERSION,
  type AgenticCommerceConfig,
} from '@/lib/billing/agentic-commerce-types';
import { CREDIT_PACKS } from '@/lib/billing/plans';
import type { StripeEnvConfig } from '@/lib/billing/stripe-client';
import { getStripeFor } from '@/lib/billing/stripe-client';

type RawDb = ReturnType<typeof createRawClient>;

export type AgenticFeedType = 'product' | 'pricing' | 'inventory';

export { agenticCreditPackSku, packIdFromAgenticSku };

async function getDb(db?: RawDb): Promise<RawDb> {
  if (db) return db;
  const { createRawClient } = await import('@/lib/db');
  return createRawClient();
}

function parseAgenticConfig(stripeMeta: Record<string, unknown>): AgenticCommerceConfig {
  const raw = (stripeMeta.agenticCommerce ?? {}) as Record<string, unknown>;
  const skuByPackId = raw.skuByPackId as Record<string, string> | undefined;
  const connectPlatform = raw.connectPlatform as AgenticCommerceConfig['connectPlatform'];
  return {
    enabled: raw.enabled === true,
    sellerOnboarded: raw.sellerOnboarded === true,
    lastCatalogSyncAt: typeof raw.lastCatalogSyncAt === 'string' ? raw.lastCatalogSyncAt : undefined,
    skuByPackId: skuByPackId && typeof skuByPackId === 'object' ? skuByPackId : undefined,
    lastImportIds: raw.lastImportIds as AgenticCommerceConfig['lastImportIds'],
    connectPlatform,
  };
}

/** Read agenticCommerce from the tenant that owns this org. */
export async function resolveTenantAgenticCommerce(
  orgId: string,
  db?: RawDb,
): Promise<{ tenantSlug: string | null; config: AgenticCommerceConfig | null; stripe: StripeEnvConfig | null }> {
  db = await getDb(db);
  const { resolveTenantStripeConfig } = await import('@/domain/billing/organization-service');
  const stripe = await resolveTenantStripeConfig(orgId, db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT slug, metadata FROM tenants WHERE organization_id = $1 LIMIT 1;`,
    orgId,
  )) as Record<string, unknown>[];
  if (rows.length === 0) {
    return { tenantSlug: null, config: null, stripe };
  }
  const slug = String(rows[0].slug);
  const meta = (rows[0].metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  const stripeMeta = (cfg.stripe ?? {}) as Record<string, unknown>;
  const config = parseAgenticConfig(stripeMeta);
  return { tenantSlug: slug, config, stripe };
}

export function isAgenticCatalogLive(config: AgenticCommerceConfig | null | undefined): boolean {
  if (!config?.enabled) return false;
  if (!isCatalogSyncFresh(config.lastCatalogSyncAt)) return false;
  return catalogSkusComplete(config.skuByPackId, CREDIT_PACKS.map((p) => p.id));
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(headers: string[], rows: string[][]): string {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(row.map((cell) => csvEscape(cell)).join(','));
  }
  return lines.join('\n');
}

export function buildProductFeedCsv(tenantSlug: string): string {
  const headers = ['id', 'title', 'description', 'link', 'availability', 'price', 'currency', 'brand'];
  const rows = CREDIT_PACKS.map((pack) => {
    const sku = agenticCreditPackSku(tenantSlug, pack.id);
    const total = pack.baseCredits + pack.bonusCredits;
    return [
      sku,
      `AI Credits ${pack.label}`,
      `${total} AI credits for ${tenantSlug} (${pack.baseCredits} + ${pack.bonusCredits} bonus)`,
      `https://tokenizmyapp.vercel.app/settings/billing`,
      'in_stock',
      (pack.priceCents / 100).toFixed(2),
      'USD',
      'TokenizMyApp',
    ];
  });
  return toCsv(headers, rows);
}

export function buildPricingFeedCsv(tenantSlug: string): string {
  const headers = ['id', 'price', 'currency'];
  const rows = CREDIT_PACKS.map((pack) => [
    agenticCreditPackSku(tenantSlug, pack.id),
    (pack.priceCents / 100).toFixed(2),
    'USD',
  ]);
  return toCsv(headers, rows);
}

export function buildInventoryFeedCsv(tenantSlug: string): string {
  const headers = ['id', 'availability', 'quantity'];
  const rows = CREDIT_PACKS.map((pack) => [
    agenticCreditPackSku(tenantSlug, pack.id),
    'in_stock',
    '9999',
  ]);
  return toCsv(headers, rows);
}

interface CatalogImportResponse {
  id?: string;
  upload_url?: string;
  status?: string;
  error?: { message?: string; code?: string };
}

async function createCatalogImport(
  secretKey: string,
  feedType: AgenticFeedType,
): Promise<CatalogImportResponse> {
  const response = await fetch('https://api.stripe.com/v2/commerce/product_catalog/imports', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Stripe-Version': STRIPE_AGENTIC_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ feed_type: feedType, mode: 'upsert' }),
  });
  const data = (await response.json()) as CatalogImportResponse & { error?: CatalogImportResponse['error'] };
  if (!response.ok) {
    const message = data.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Catalog import (${feedType}) failed: ${message}`);
  }
  return data;
}

async function uploadCatalogCsv(uploadUrl: string, csv: string): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/csv' },
    body: csv,
  });
  if (!response.ok) {
    throw new Error(`Catalog CSV upload failed: HTTP ${response.status}`);
  }
}

async function persistAgenticCommerce(
  tenantSlug: string,
  patch: Partial<AgenticCommerceConfig>,
  db: RawDb,
): Promise<void> {
  const rows = (await db.$queryRawUnsafe(
    `SELECT metadata FROM tenants WHERE slug = $1 LIMIT 1;`,
    tenantSlug,
  )) as Record<string, unknown>[];
  if (rows.length === 0) return;

  const meta = (rows[0].metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  const stripe = (cfg.stripe ?? {}) as Record<string, unknown>;
  const current = parseAgenticConfig(stripe);

  const next: AgenticCommerceConfig = {
    ...current,
    ...patch,
    skuByPackId: { ...current.skuByPackId, ...patch.skuByPackId },
    lastImportIds: { ...current.lastImportIds, ...patch.lastImportIds },
    connectPlatform: { ...current.connectPlatform, ...patch.connectPlatform },
  };

  await db.$executeRawUnsafe(
    `UPDATE tenants
     SET metadata = jsonb_set(
       COALESCE(metadata, '{}'::jsonb),
       '{config,stripe,agenticCommerce}',
       $2::jsonb,
       true
     ),
     updated_at = CURRENT_TIMESTAMP
     WHERE slug = $1;`,
    tenantSlug,
    JSON.stringify(next),
  );
}

export interface CatalogSyncResult {
  ok: boolean;
  tenantSlug: string;
  skuByPackId: Record<string, string>;
  lastCatalogSyncAt: string;
  importIds: Partial<Record<AgenticFeedType, string>>;
  message: string;
}

/**
 * Upload product, pricing, and inventory feeds for all credit packs.
 */
export async function syncAgenticCatalogForTenant(
  tenantSlug: string,
  db?: RawDb,
  stripeConfig?: StripeEnvConfig | null,
): Promise<CatalogSyncResult> {
  db = await getDb(db);
  const { resolveTenantStripeConfig } = await import('@/domain/billing/organization-service');
  const rows = (await db.$queryRawUnsafe(
    `SELECT organization_id, metadata FROM tenants WHERE slug = $1 LIMIT 1;`,
    tenantSlug,
  )) as Record<string, unknown>[];
  if (rows.length === 0) {
    throw new Error(`Tenant "${tenantSlug}" not found.`);
  }

  const orgId = String(rows[0].organization_id ?? '');
  const config = stripeConfig ?? (orgId ? await resolveTenantStripeConfig(orgId, db) : null);
  const secretKey = config?.secretKey?.trim();
  if (!secretKey) {
    throw new Error('Tenant Stripe secret key is not configured.');
  }

  const skuByPackId: Record<string, string> = {};
  for (const pack of CREDIT_PACKS) {
    skuByPackId[pack.id] = agenticCreditPackSku(tenantSlug, pack.id);
  }

  const feeds: { type: AgenticFeedType; csv: string }[] = [
    { type: 'product', csv: buildProductFeedCsv(tenantSlug) },
    { type: 'pricing', csv: buildPricingFeedCsv(tenantSlug) },
    { type: 'inventory', csv: buildInventoryFeedCsv(tenantSlug) },
  ];

  const importIds: Partial<Record<AgenticFeedType, string>> = {};
  for (const feed of feeds) {
    const created = await createCatalogImport(secretKey, feed.type);
    if (!created.upload_url || !created.id) {
      throw new Error(`Stripe did not return an upload URL for ${feed.type} import.`);
    }
    await uploadCatalogCsv(created.upload_url, feed.csv);
    importIds[feed.type] = created.id;
  }

  const lastCatalogSyncAt = new Date().toISOString();
  await persistAgenticCommerce(
    tenantSlug,
    {
      enabled: true,
      sellerOnboarded: true,
      lastCatalogSyncAt,
      skuByPackId,
      lastImportIds: importIds,
    },
    db,
  );

  return {
    ok: true,
    tenantSlug,
    skuByPackId,
    lastCatalogSyncAt,
    importIds,
    message: `Synced ${CREDIT_PACKS.length} credit pack SKUs to Stripe Agentic catalog.`,
  };
}

export interface AgenticFlightCheckStep {
  label: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

/**
 * Flight Check rows for ACS seller onboarding + catalog freshness.
 */
export async function runAgenticCommerceFlightChecks(input: {
  tenantSlug: string;
  orgId: string;
  agenticConfig: AgenticCommerceConfig | null;
  stripeConfig: StripeEnvConfig | null;
}): Promise<AgenticFlightCheckStep[]> {
  const steps: AgenticFlightCheckStep[] = [];
  const config = input.agenticConfig;

  if (!config?.enabled) {
    steps.push({
      label: 'Agentic Commerce (ACS seller)',
      status: 'warn',
      message:
        'Not enabled — credit top-ups use PaymentElement. Enable in Organization & Billing after Stripe seller onboarding.',
    });
    steps.push({
      label: 'Stripe Connect agentic platform (future)',
      status: 'warn',
      message:
        'Connect + Trigger Agentic Purchase blueprint requires Stripe platform waitlist approval (Phase 4). Tenant-keys ACS seller path is active instead.',
    });
    return steps;
  }

  const secretKey = input.stripeConfig?.secretKey?.trim();
  if (!secretKey) {
    steps.push({
      label: 'ACS seller API access',
      status: 'fail',
      message: 'Agentic catalog is enabled but STRIPE_SECRET_KEY is missing for this tenant.',
    });
  } else {
    try {
      await createCatalogImport(secretKey, 'product');
      steps.push({
        label: 'ACS seller API access',
        status: 'pass',
        message: 'Stripe Agentic catalog import API accepted a product feed (seller onboarded).',
      });
    } catch (err) {
      steps.push({
        label: 'ACS seller API access',
        status: 'fail',
        message:
          `Agentic catalog API rejected import: ${err instanceof Error ? err.message : String(err)}. ` +
          'Complete Stripe Dashboard → Agentic commerce → onboard as seller (supported countries only).',
      });
    }
  }

  const packIds = CREDIT_PACKS.map((p) => p.id);
  const skusOk = catalogSkusComplete(config.skuByPackId, packIds);
  const fresh = isCatalogSyncFresh(config.lastCatalogSyncAt);

  if (fresh && skusOk) {
    steps.push({
      label: 'Agentic catalog sync',
      status: 'pass',
      message: `Catalog synced ${config.lastCatalogSyncAt} — all ${packIds.length} credit pack SKUs present.`,
    });
  } else if (config.lastCatalogSyncAt) {
    steps.push({
      label: 'Agentic catalog sync',
      status: 'warn',
      message:
        `Last sync ${config.lastCatalogSyncAt}${fresh ? '' : ' (older than 24h)'}` +
        `${skusOk ? '' : ' — missing SKU mappings'}. Save Organization & Billing or wait for nightly cron.`,
    });
  } else {
    steps.push({
      label: 'Agentic catalog sync',
      status: 'fail',
      message: 'No catalog sync recorded — save Stripe keys with Agentic Commerce enabled to publish SKUs.',
    });
  }

  const waitlist = config.connectPlatform?.waitlistRequested;
  steps.push({
    label: 'Stripe Connect agentic platform (future)',
    status: waitlist ? 'pass' : 'warn',
    message: waitlist
      ? 'Connect platform waitlist flagged in tenant config — migrate when Stripe approves (Phase 4).'
      : 'Optional: request Stripe Connect platform agentic waitlist when external agents (ChatGPT) are needed.',
  });

  return steps;
}

export interface AgenticCheckoutResult {
  url: string;
  sessionId: string;
  sku: string;
}

/**
 * Hosted checkout for an agentic credit pack (fulfilled via checkout.session.completed).
 */
export async function createAgenticTopUpCheckout(
  orgId: string,
  packId: string,
  successUrl: string,
  cancelUrl: string,
  db?: RawDb,
  stripeConfig?: StripeEnvConfig | null,
): Promise<AgenticCheckoutResult> {
  db = await getDb(db);
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) {
    throw new Error(`Unknown credit pack "${packId}".`);
  }

  const { tenantSlug, config, stripe: resolvedStripe } = await resolveTenantAgenticCommerce(orgId, db);
  if (!tenantSlug) {
    throw new Error('No tenant owns this organization.');
  }
  if (!isAgenticCatalogLive(config)) {
    throw new Error('Agentic catalog is not live for this tenant — sync the catalog first.');
  }

  const resolvedConfig = stripeConfig ?? resolvedStripe ?? undefined;
  const stripe = getStripeFor(resolvedConfig);
  if (!stripe) {
    throw new Error('Stripe is not configured for this tenant.');
  }

  const sku = config?.skuByPackId?.[packId] ?? agenticCreditPackSku(tenantSlug, packId);
  const { ensureStripeCustomer } = await import('@/domain/billing/stripe-service');
  const customerId = await ensureStripeCustomer(orgId, db, stripe);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: pack.priceCents,
          product_data: {
            name: `AI Credits ${pack.label}`,
            metadata: { sku, packId: pack.id },
          },
        },
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: orgId,
    metadata: {
      orgId,
      packId: pack.id,
      kind: 'credit_topup',
      sku,
      agentic: 'true',
    },
  });

  if (!session.url) {
    throw new Error('Stripe returned a checkout session with no URL.');
  }

  return { url: session.url, sessionId: session.id, sku };
}

/** Update tenant metadata when a v2 catalog import webhook succeeds. */
export async function markCatalogImportComplete(
  tenantSlug: string,
  feedType: AgenticFeedType,
  importId: string,
  db?: RawDb,
): Promise<void> {
  db = await getDb(db);
  await persistAgenticCommerce(
    tenantSlug,
    {
      lastImportIds: { [feedType]: importId },
      lastCatalogSyncAt: new Date().toISOString(),
    },
    db,
  );
}

/** Resolve pack id from checkout line item SKU or session metadata. */
export function resolvePackIdFromCheckoutMetadata(
  metadata: Record<string, string> | null | undefined,
  lineItemSkus: string[],
  skuByPackId?: Record<string, string>,
): string | null {
  const fromMeta = metadata?.packId;
  if (fromMeta && CREDIT_PACKS.some((p) => p.id === fromMeta)) {
    return fromMeta;
  }
  const metaSku = metadata?.sku;
  if (metaSku) {
    const fromSku = packIdFromAgenticSku(metaSku);
    if (fromSku) return fromSku;
  }
  for (const sku of lineItemSkus) {
    const direct = packIdFromAgenticSku(sku);
    if (direct) return direct;
    if (skuByPackId) {
      for (const [packId, mapped] of Object.entries(skuByPackId)) {
        if (mapped === sku) return packId;
      }
    }
  }
  return null;
}
