/**
 * Credit analytics for tenant / platform admins — per-user top-ups and usage
 * broken down by provider and model.
 *
 * Reads the same control-plane `credit_grants` / `credit_ledger` tables as the
 * credit service. User display names come from the data-plane `user_accounts`
 * table (tenant or factory DB).
 */
import type { createBillingRawClient, createRawClient } from '@/lib/db';

type BillingDb = ReturnType<typeof createBillingRawClient>;
type DataDb = ReturnType<typeof createRawClient>;

export interface CreditUserBreakdown {
  userId: string | null;
  /** True when spend came from the shared plan pool with no attributed user. */
  sharedPool: boolean;
  email: string | null;
  name: string | null;
  purchasedRemaining: number;
  bonusRemaining: number;
  purchasedGranted: number;
  bonusGranted: number;
  spent: number;
}

export interface CreditUsageByModel {
  model: string;
  provider: string;
  credits: number;
  promptTokens: number;
  completionTokens: number;
  runs: number;
}

export interface CreditUsageByProvider {
  provider: string;
  credits: number;
  promptTokens: number;
  completionTokens: number;
  runs: number;
}

export interface CreditAdminAnalytics {
  users: CreditUserBreakdown[];
  byModel: CreditUsageByModel[];
  byProvider: CreditUsageByProvider[];
}

function inferProvider(model: string | null | undefined, explicit?: string | null): string {
  const fromMeta = explicit?.trim();
  if (fromMeta) return fromMeta;
  const m = (model ?? '').toLowerCase();
  if (!m) return 'unknown';
  if (m.startsWith('gpt-') || m.startsWith('o1') || m.startsWith('o3') || m.includes('openai')) {
    return 'openai';
  }
  if (m.startsWith('claude')) return 'anthropic';
  if (m.startsWith('gemini')) return 'google';
  if (m.includes('grok')) return 'xai';
  if (m.includes('mistral') || m.includes('mixtral')) return 'mistral';
  return 'unknown';
}

async function resolveUserLabels(
  userIds: string[],
): Promise<Map<string, { email: string | null; name: string | null }>> {
  const map = new Map<string, { email: string | null; name: string | null }>();
  const ids = [...new Set(userIds.filter(Boolean))];
  if (ids.length === 0) return map;

  try {
    const { createRawClient } = await import('@/lib/db');
    const db = createRawClient() as DataDb;
    const rows = (await db.$queryRawUnsafe(
      `SELECT id, email, name FROM user_accounts WHERE id = ANY($1::text[]);`,
      ids,
    )) as { id: string; email: string | null; name: string | null }[];
    for (const row of rows) {
      map.set(row.id, { email: row.email ?? null, name: row.name ?? null });
    }
  } catch (err) {
    console.warn(
      '[credit-analytics] user_accounts lookup failed:',
      err instanceof Error ? err.message : err,
    );
  }
  return map;
}

export async function getCreditUserBreakdown(
  orgId: string,
  db: BillingDb,
): Promise<CreditUserBreakdown[]> {
  const grantRows = (await db.$queryRawUnsafe(
    `SELECT
       owner_user_id AS user_id,
       COALESCE(SUM(CASE WHEN source IN ('addon', 'onetime') THEN remaining ELSE 0 END), 0)::int AS purchased_remaining,
       COALESCE(SUM(CASE WHEN source = 'promo' THEN remaining ELSE 0 END), 0)::int AS bonus_remaining,
       COALESCE(SUM(CASE WHEN source IN ('addon', 'onetime') THEN amount ELSE 0 END), 0)::int AS purchased_granted,
       COALESCE(SUM(CASE WHEN source = 'promo' THEN amount ELSE 0 END), 0)::int AS bonus_granted
     FROM credit_grants
     WHERE org_id = $1
       AND owner_user_id IS NOT NULL
     GROUP BY owner_user_id;`,
    orgId,
  )) as Record<string, unknown>[];

  const spendRows = (await db.$queryRawUnsafe(
    `SELECT
       COALESCE(
         g.owner_user_id,
         NULLIF(TRIM(l.metadata->>'viewerUserId'), ''),
         NULLIF(TRIM(l.metadata->>'purchaserUserId'), '')
       ) AS user_id,
       COALESCE(SUM(CASE WHEN l.delta < 0 THEN -l.delta ELSE 0 END), 0)::int AS spent
     FROM credit_ledger l
     LEFT JOIN credit_grants g ON g.id = l.grant_id
     WHERE l.org_id = $1
       AND l.reason IN ('ai_generation', 'ai_generation_exempt')
     GROUP BY 1;`,
    orgId,
  )) as Record<string, unknown>[];

  const byUser = new Map<string, CreditUserBreakdown>();

  const ensure = (userId: string | null, sharedPool: boolean): CreditUserBreakdown => {
    const key = sharedPool ? '__shared__' : (userId ?? '__unknown__');
    let row = byUser.get(key);
    if (!row) {
      row = {
        userId: sharedPool ? null : userId,
        sharedPool,
        email: null,
        name: null,
        purchasedRemaining: 0,
        bonusRemaining: 0,
        purchasedGranted: 0,
        bonusGranted: 0,
        spent: 0,
      };
      byUser.set(key, row);
    }
    return row;
  };

  for (const g of grantRows) {
    const userId = g.user_id == null ? null : String(g.user_id);
    if (!userId) continue;
    const row = ensure(userId, false);
    row.purchasedRemaining = Number(g.purchased_remaining ?? 0);
    row.bonusRemaining = Number(g.bonus_remaining ?? 0);
    row.purchasedGranted = Number(g.purchased_granted ?? 0);
    row.bonusGranted = Number(g.bonus_granted ?? 0);
  }

  for (const s of spendRows) {
    const userId = s.user_id == null ? null : String(s.user_id);
    const row = ensure(userId, userId == null);
    row.spent = Number(s.spent ?? 0);
  }

  const labels = await resolveUserLabels(
    [...byUser.values()].map((u) => u.userId).filter((id): id is string => Boolean(id)),
  );
  for (const row of byUser.values()) {
    if (!row.userId) continue;
    const label = labels.get(row.userId);
    if (label) {
      row.email = label.email;
      row.name = label.name;
    }
  }

  return [...byUser.values()].sort((a, b) => {
    if (a.sharedPool !== b.sharedPool) return a.sharedPool ? 1 : -1;
    const aTotal = a.purchasedRemaining + a.bonusRemaining + a.spent;
    const bTotal = b.purchasedRemaining + b.bonusRemaining + b.spent;
    return bTotal - aTotal;
  });
}

export async function getCreditUsageByModel(
  orgId: string,
  db: BillingDb,
): Promise<CreditUsageByModel[]> {
  const rows = (await db.$queryRawUnsafe(
    `SELECT
       COALESCE(NULLIF(TRIM(metadata->>'model'), ''), 'unknown') AS model,
       COALESCE(
         NULLIF(TRIM(metadata->>'provider'), ''),
         NULLIF(TRIM(metadata->>'providerId'), ''),
         ''
       ) AS provider,
       COALESCE(SUM(CASE WHEN delta < 0 THEN -delta ELSE 0 END), 0)::int AS credits,
       COALESCE(SUM(COALESCE((metadata->>'promptTokens')::int, (metadata->>'inputTokens')::int, 0)), 0)::int AS prompt_tokens,
       COALESCE(SUM(COALESCE((metadata->>'completionTokens')::int, (metadata->>'outputTokens')::int, 0)), 0)::int AS completion_tokens,
       COUNT(*)::int AS runs
     FROM credit_ledger
     WHERE org_id = $1
       AND reason IN ('ai_generation', 'ai_generation_exempt')
     GROUP BY 1, 2
     ORDER BY credits DESC, runs DESC;`,
    orgId,
  )) as Record<string, unknown>[];

  return rows.map((row) => {
    const model = String(row.model ?? 'unknown');
    return {
      model,
      provider: inferProvider(model, String(row.provider ?? '') || null),
      credits: Number(row.credits ?? 0),
      promptTokens: Number(row.prompt_tokens ?? 0),
      completionTokens: Number(row.completion_tokens ?? 0),
      runs: Number(row.runs ?? 0),
    };
  });
}

export async function getCreditUsageByProvider(
  orgId: string,
  db: BillingDb,
): Promise<CreditUsageByProvider[]> {
  const byModel = await getCreditUsageByModel(orgId, db);
  const map = new Map<string, CreditUsageByProvider>();
  for (const row of byModel) {
    const existing = map.get(row.provider) ?? {
      provider: row.provider,
      credits: 0,
      promptTokens: 0,
      completionTokens: 0,
      runs: 0,
    };
    existing.credits += row.credits;
    existing.promptTokens += row.promptTokens;
    existing.completionTokens += row.completionTokens;
    existing.runs += row.runs;
    map.set(row.provider, existing);
  }
  return [...map.values()].sort((a, b) => b.credits - a.credits);
}

export async function getCreditAdminAnalytics(
  orgId: string,
  db: BillingDb,
): Promise<CreditAdminAnalytics> {
  const [users, byModel] = await Promise.all([
    getCreditUserBreakdown(orgId, db),
    getCreditUsageByModel(orgId, db),
  ]);

  const providerMap = new Map<string, CreditUsageByProvider>();
  for (const row of byModel) {
    const existing = providerMap.get(row.provider) ?? {
      provider: row.provider,
      credits: 0,
      promptTokens: 0,
      completionTokens: 0,
      runs: 0,
    };
    existing.credits += row.credits;
    existing.promptTokens += row.promptTokens;
    existing.completionTokens += row.completionTokens;
    existing.runs += row.runs;
    providerMap.set(row.provider, existing);
  }

  return {
    users,
    byModel,
    byProvider: [...providerMap.values()].sort((a, b) => b.credits - a.credits),
  };
}
