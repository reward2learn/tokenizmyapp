/**
 * Org billing rate card — persisted control-plane config for AI credit sizing.
 *
 * Platform-admin only for writes. Recalc is server-side from live app/user counts
 * and usage_records third-party spend; clients may preview via the pure helper
 * in tenant-rate-card.ts but never supply the charged markup.
 */
import { createRawClient } from '@/lib/db';
import { purchasedCreditsForUsd } from '@/lib/billing/plans';
import {
  computeTenantRateCard,
  defaultRateCardInputs,
  purchasedCreditsForUsdAtMarkup,
  type TenantRateCardComputed,
  type TenantRateCardInputs,
  type TenantRateCardRecord,
} from '@/lib/billing/tenant-rate-card';

type RawDb = ReturnType<typeof createRawClient>;

const DDL = `
CREATE TABLE IF NOT EXISTS org_billing_rate_cards (
  org_id TEXT PRIMARY KEY,
  markup_percent DOUBLE PRECISION NOT NULL DEFAULT 0.30,
  manual_markup_percent DOUBLE PRECISION,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  plan_credits JSONB NOT NULL DEFAULT '{}'::jsonb,
  pack_credits JSONB NOT NULL DEFAULT '{}'::jsonb,
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

let ensured = false;

export async function ensureOrgRateCardTable(db?: RawDb): Promise<RawDb> {
  db ??= createRawClient();
  if (!ensured) {
    await db.$executeRawUnsafe(DDL);
    ensured = true;
  }
  return db;
}

function mapRow(row: Record<string, unknown>): TenantRateCardRecord {
  const inputs = defaultRateCardInputs(
    (row.inputs ?? {}) as Partial<TenantRateCardInputs>,
  );
  const planCredits = (row.plan_credits ?? {}) as Partial<TenantRateCardComputed['planCredits']>;
  const packCredits = (row.pack_credits ?? {}) as Partial<TenantRateCardComputed['packCredits']>;
  const breakdown = (row.breakdown ?? {
    floor: 0.3,
    appFactor: 0,
    userFactor: 0,
    revenueFactor: 0,
    hardwareFactor: 0,
    expenseFactor: 0,
    raw: 0.3,
    clamped: 0.3,
  }) as TenantRateCardComputed['breakdown'];
  const markupPercent = Number(row.markup_percent ?? 0.3);

  return {
    inputs,
    markupPercent,
    manualMarkupPercent:
      row.manual_markup_percent == null ? null : Number(row.manual_markup_percent),
    breakdown,
    creditsPerUsd: purchasedCreditsForUsdAtMarkup(1, markupPercent),
    planCredits: {
      free: Number(planCredits.free ?? purchasedCreditsForUsd(20)),
      pro: Number(planCredits.pro ?? purchasedCreditsForUsd(99)),
      business: Number(planCredits.business ?? purchasedCreditsForUsd(199)),
    },
    packCredits: {
      'pack-25': Number(packCredits['pack-25'] ?? purchasedCreditsForUsd(25)),
      'pack-50': Number(packCredits['pack-50'] ?? purchasedCreditsForUsd(50)),
      'pack-100': Number(packCredits['pack-100'] ?? purchasedCreditsForUsd(100)),
    },
    computedAt: new Date(String(row.computed_at ?? Date.now())).toISOString(),
    updatedAt: new Date(String(row.updated_at ?? Date.now())).toISOString(),
  };
}

export async function getOrgRateCard(
  orgId: string,
  db?: RawDb,
): Promise<TenantRateCardRecord | null> {
  db = await ensureOrgRateCardTable(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM org_billing_rate_cards WHERE org_id = $1 LIMIT 1;`,
    orgId,
  )) as Record<string, unknown>[];
  if (rows.length === 0) return null;
  return mapRow(rows[0]);
}

/** Plan monthly AI credits for an org — rate card override, else catalog default. */
export async function resolvePlanAiCredits(
  orgId: string,
  planId: string,
  catalogDefault: number,
  db?: RawDb,
): Promise<number> {
  const card = await getOrgRateCard(orgId, db);
  if (!card) return catalogDefault;
  if (planId === 'free') return card.planCredits.free;
  if (planId === 'pro') return card.planCredits.pro;
  if (planId === 'business') return card.planCredits.business;
  return catalogDefault;
}

/** Top-up pack base credits for an org — rate card override, else catalog default. */
export async function resolvePackBaseCredits(
  orgId: string,
  packId: string,
  catalogDefault: number,
  db?: RawDb,
): Promise<number> {
  const card = await getOrgRateCard(orgId, db);
  if (!card) return catalogDefault;
  const key = packId as keyof TenantRateCardComputed['packCredits'];
  const override = card.packCredits[key];
  return typeof override === 'number' && override > 0 ? override : catalogDefault;
}

export interface UpsertOrgRateCardInput {
  inputs: Partial<TenantRateCardInputs>;
  /** Platform-admin manual lock; null clears the lock. */
  manualMarkupPercent?: number | null;
  /** When true, keep existing manualMarkupPercent unless explicitly set. */
  preserveManual?: boolean;
}

export async function upsertOrgRateCard(
  orgId: string,
  input: UpsertOrgRateCardInput,
  db?: RawDb,
): Promise<TenantRateCardRecord> {
  db = await ensureOrgRateCardTable(db);
  const existing = await getOrgRateCard(orgId, db);
  const inputs = defaultRateCardInputs({
    ...existing?.inputs,
    ...input.inputs,
  });

  let manual: number | null = null;
  if (input.manualMarkupPercent !== undefined) {
    manual = input.manualMarkupPercent;
  } else if (input.preserveManual) {
    manual = existing?.manualMarkupPercent ?? null;
  }

  const computed = computeTenantRateCard(inputs, manual);
  const now = new Date();

  await db.$executeRawUnsafe(
    `INSERT INTO org_billing_rate_cards (
       org_id, markup_percent, manual_markup_percent, inputs, plan_credits, pack_credits, breakdown, computed_at, updated_at
     ) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8, $8)
     ON CONFLICT (org_id) DO UPDATE SET
       markup_percent = EXCLUDED.markup_percent,
       manual_markup_percent = EXCLUDED.manual_markup_percent,
       inputs = EXCLUDED.inputs,
       plan_credits = EXCLUDED.plan_credits,
       pack_credits = EXCLUDED.pack_credits,
       breakdown = EXCLUDED.breakdown,
       computed_at = EXCLUDED.computed_at,
       updated_at = EXCLUDED.updated_at;`,
    orgId,
    computed.markupPercent,
    manual,
    JSON.stringify(inputs),
    JSON.stringify(computed.planCredits),
    JSON.stringify(computed.packCredits),
    JSON.stringify(computed.breakdown),
    now,
  );

  return {
    ...computed,
    inputs,
    manualMarkupPercent: manual,
    computedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

/** Live counts + usage spend → refresh rate card (honours manual markup lock). */
export async function recalculateOrgRateCard(
  orgId: string,
  db?: RawDb,
): Promise<TenantRateCardRecord> {
  db = await ensureOrgRateCardTable(db);
  const existing = await getOrgRateCard(orgId, db);

  const tenantRows = (await db.$queryRawUnsafe(
    `SELECT slug, metadata FROM tenants WHERE organization_id = $1;`,
    orgId,
  )) as { slug: string; metadata: unknown }[];

  let appCount = 0;
  for (const t of tenantRows) {
    const meta = (t.metadata ?? {}) as Record<string, unknown>;
    const config = (meta.config ?? {}) as Record<string, unknown>;
    const pack = config.appPack as { apps?: unknown[] } | undefined;
    if (pack?.apps && Array.isArray(pack.apps) && pack.apps.length > 0) {
      appCount += pack.apps.length;
    } else {
      appCount += 1;
    }
  }
  if (appCount === 0) appCount = existing?.inputs.appCount ?? 1;

  let userCount = existing?.inputs.userCount ?? 1;
  try {
    const memberRows = (await db.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS c FROM org_members WHERE org_id = $1;`,
      orgId,
    )) as { c: number }[];
    if (memberRows[0]?.c > 0) userCount = memberRows[0].c;
  } catch {
    // org_members may be absent in fixtures
  }

  let monthlyThirdPartyUsd = existing?.inputs.monthlyThirdPartyUsd ?? 0;
  try {
    const periodStart = new Date();
    periodStart.setUTCDate(1);
    periodStart.setUTCHours(0, 0, 0, 0);
    const spend = (await db.$queryRawUnsafe(
      `SELECT COALESCE(SUM(cost_cents), 0)::int AS cents
       FROM usage_records
       WHERE org_id = $1 AND period_start >= $2
         AND resource <> 'ai_gateway';`,
      orgId,
      periodStart,
    )) as { cents: number }[];
    if (spend[0]) monthlyThirdPartyUsd = (spend[0].cents ?? 0) / 100;
  } catch {
    // usage_records may be empty / missing
  }

  return upsertOrgRateCard(
    orgId,
    {
      inputs: {
        appCount,
        userCount,
        annualRevenueUsd: existing?.inputs.annualRevenueUsd ?? 0,
        macStudioCostUsd: existing?.inputs.macStudioCostUsd,
        monthlyThirdPartyUsd,
      },
      preserveManual: true,
    },
    db,
  );
}

/** After tenant create — seed rate card when the tenant already has an org. */
export async function ensureRateCardForTenantSlug(
  tenantSlug: string,
  seed: Partial<TenantRateCardInputs>,
  db?: RawDb,
): Promise<TenantRateCardRecord | null> {
  db = await ensureOrgRateCardTable(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT organization_id FROM tenants WHERE slug = $1 LIMIT 1;`,
    tenantSlug,
  )) as { organization_id: string | null }[];
  const orgId = rows[0]?.organization_id;
  if (!orgId) return null;

  return upsertOrgRateCard(
    orgId,
    {
      inputs: seed,
      preserveManual: true,
    },
    db,
  );
}

/**
 * Recompute plan/pack credit grants on an org rate card from resolved catalog
 * USD faces × the card's secured markup. Does not invent a second price —
 * catalog overrides + existing markup are the only inputs.
 */
export async function refreshOrgRateCardCreditsFromCatalog(
  orgId: string,
  db?: RawDb,
): Promise<TenantRateCardRecord> {
  db = await ensureOrgRateCardTable(db);
  let card = await getOrgRateCard(orgId, db);
  if (!card) {
    card = await recalculateOrgRateCard(orgId, db);
  }

  const { getBillingCatalog } = await import('@/domain/billing/catalog-price-service');
  const { catalog } = await getBillingCatalog(db);
  const markup = card.markupPercent;

  // Free trial stays a conceptual ~$20 AI allotment even when list price is $0.
  const planCredits = {
    free: purchasedCreditsForUsdAtMarkup(20, markup),
    pro: purchasedCreditsForUsdAtMarkup(catalog.plans.pro.monthlyCents / 100, markup),
    business: purchasedCreditsForUsdAtMarkup(
      catalog.plans.business.monthlyCents / 100,
      markup,
    ),
  };
  const packCredits = {
    'pack-25': purchasedCreditsForUsdAtMarkup(catalog.packs['pack-25'] / 100, markup),
    'pack-50': purchasedCreditsForUsdAtMarkup(catalog.packs['pack-50'] / 100, markup),
    'pack-100': purchasedCreditsForUsdAtMarkup(catalog.packs['pack-100'] / 100, markup),
  };

  const now = new Date();
  await db.$executeRawUnsafe(
    `UPDATE org_billing_rate_cards
     SET plan_credits = $2::jsonb,
         pack_credits = $3::jsonb,
         updated_at = $4
     WHERE org_id = $1;`,
    orgId,
    JSON.stringify(planCredits),
    JSON.stringify(packCredits),
    now,
  );

  return {
    ...card,
    planCredits,
    packCredits,
    creditsPerUsd: purchasedCreditsForUsdAtMarkup(1, markup),
    updatedAt: now.toISOString(),
  };
}
