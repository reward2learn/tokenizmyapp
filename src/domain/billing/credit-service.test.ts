import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getPlan } from '@/lib/billing/plans';

/**
 * In-memory stand-in for the two credit tables.
 *
 * Raw SQL is matched on the distinctive fragment of each statement rather than
 * parsed — enough to exercise the service's ordering and bookkeeping, which is
 * where the bugs live, without needing a live Postgres.
 */
interface FakeGrant {
  id: string;
  org_id: string;
  source: string;
  amount: number;
  remaining: number;
  granted_at: Date;
  expires_at: Date;
  plan_id: string | null;
  owner_user_id: string | null;
  metadata: unknown;
}

interface FakeLedger {
  id: string;
  org_id: string;
  grant_id: string | null;
  delta: number;
  reason: string;
  ref_type: string | null;
  ref_id: string | null;
  created_at: Date;
  metadata: unknown;
}

function makeDb() {
  const grants: FakeGrant[] = [];
  const ledger: FakeLedger[] = [];
  let seq = 0;

  const db = {
    grants,
    ledger,
    $executeRawUnsafe: vi.fn(async (sql: string, ...args: unknown[]) => {
      if (sql.includes('INSERT INTO credit_ledger')) {
        // INSERT shapes: grant_id may be bound or literal NULL (debt / write-off);
        // delta may be literal 0 on write-offs. Read the shape off the SQL.
        const grantIsNull = sql.includes(', NULL,');
        const deltaIsLiteralZero = sql.includes(', NULL, 0,');
        const hasRefColumns = sql.includes('ref_type');
        let i = 1; // args[0] is always org_id
        const grantId = grantIsNull ? null : (args[i++] as string);
        const delta = deltaIsLiteralZero ? 0 : Number(args[i++]);
        const reason = args[i++] as string;
        const refType = hasRefColumns ? ((args[i++] as string) ?? null) : null;
        const refId = hasRefColumns ? ((args[i++] as string) ?? null) : null;

        ledger.push({
          id: `l-${++seq}`,
          org_id: args[0] as string,
          grant_id: grantId,
          delta,
          reason,
          ref_type: refType,
          ref_id: refId,
          created_at: new Date(),
          metadata: args[i] ?? null,
        });
        return 1;
      }
      if (sql.includes('UPDATE credit_grants SET remaining')) {
        const take = Number(args[0]);
        const grant = grants.find((g) => g.id === args[1]);
        if (grant) grant.remaining -= take;
        return 1;
      }
      return 0;
    }),
    $queryRawUnsafe: vi.fn(async (sql: string, ...args: unknown[]) => {
      if (sql.includes('INSERT INTO credit_grants')) {
        const grant: FakeGrant = {
          id: `g-${++seq}`,
          org_id: args[0] as string,
          source: args[1] as string,
          amount: Number(args[2]),
          remaining: Number(args[2]),
          granted_at: new Date(),
          expires_at: args[3] as Date,
          plan_id: (args[4] as string) ?? null,
          owner_user_id: (args[5] as string) ?? null,
          metadata: args[6] ?? null,
        };
        grants.push(grant);
        return [grant];
      }
      if (sql.includes('SELECT * FROM credit_grants') && sql.includes('CASE WHEN owner_user_id IS NULL')) {
        const viewerId = args[1] as string;
        return grants
          .filter(
            (g) =>
              g.org_id === args[0]
              && g.remaining > 0
              && g.expires_at > new Date()
              && (g.owner_user_id === null || g.owner_user_id === viewerId),
          )
          .sort((a, b) => {
            const aBucket = a.owner_user_id === null ? 1 : 0;
            const bBucket = b.owner_user_id === null ? 1 : 0;
            return (
              aBucket - bBucket
              || a.expires_at.getTime() - b.expires_at.getTime()
              || a.granted_at.getTime() - b.granted_at.getTime()
            );
          });
      }
      if (
        sql.includes('SELECT * FROM credit_grants')
        && sql.includes('owner_user_id IS NULL')
        && sql.includes('ORDER BY expires_at ASC')
      ) {
        return grants
          .filter(
            (g) =>
              g.org_id === args[0]
              && g.remaining > 0
              && g.expires_at > new Date()
              && g.owner_user_id === null,
          )
          .sort(
            (a, b) =>
              a.expires_at.getTime() - b.expires_at.getTime()
              || a.granted_at.getTime() - b.granted_at.getTime(),
          );
      }
      if (sql.includes('SELECT * FROM credit_grants') && sql.includes('ORDER BY expires_at ASC')) {
        return grants
          .filter((g) => g.org_id === args[0] && g.remaining > 0 && g.expires_at > new Date())
          .sort(
            (a, b) =>
              a.expires_at.getTime() - b.expires_at.getTime() ||
              a.granted_at.getTime() - b.granted_at.getTime(),
          );
      }
      if (sql.includes('COALESCE(SUM(CASE WHEN owner_user_id IS NULL THEN remaining')) {
        const viewerId = args[1] as string;
        const live = grants.filter(
          (g) =>
            g.org_id === args[0]
            && g.remaining > 0
            && g.expires_at > new Date()
            && (g.owner_user_id === null || g.owner_user_id === viewerId),
        );
        const soon = new Date(Date.now() + 7 * 86_400_000);
        const shared = live
          .filter((g) => g.owner_user_id === null)
          .reduce((sum, g) => sum + g.remaining, 0);
        const personal = live
          .filter((g) => g.owner_user_id === viewerId)
          .reduce((sum, g) => sum + g.remaining, 0);
        const available = shared + personal;
        return [
          {
            shared,
            personal,
            available,
            expiring_soon: live
              .filter((g) => g.expires_at <= soon)
              .reduce((sum, g) => sum + g.remaining, 0),
          },
        ];
      }
      if (sql.includes('COALESCE(SUM(remaining), 0) AS available')) {
        const live = grants.filter(
          (g) => g.org_id === args[0] && g.remaining > 0 && g.expires_at > new Date(),
        );
        const soon = new Date(Date.now() + 7 * 86_400_000);
        return [
          {
            available: live.reduce((sum, g) => sum + g.remaining, 0),
            expiring_soon: live
              .filter((g) => g.expires_at <= soon)
              .reduce((sum, g) => sum + g.remaining, 0),
          },
        ];
      }
      // Debt lookup — must be matched BEFORE the whole-ledger sum below, which
      // it would otherwise satisfy and be answered with the wrong total.
      if (sql.includes('FROM credit_ledger') && sql.includes('grant_id IS NULL')) {
        const reasons = [args[1], args[2]];
        return [
          {
            total: ledger
              .filter(
                (l) => l.org_id === args[0] && l.grant_id === null && reasons.includes(l.reason),
              )
              .reduce((sum, l) => sum + l.delta, 0),
          },
        ];
      }
      if (sql.includes('FROM credit_ledger') && sql.includes('SUM(delta)')) {
        return [
          {
            total: ledger
              .filter((l) => l.org_id === args[0])
              .reduce((sum, l) => sum + l.delta, 0),
          },
        ];
      }
      if (sql.includes('FROM credit_grants') && sql.includes('SUM(remaining)')) {
        return [
          {
            total: grants
              .filter((g) => g.org_id === args[0])
              .reduce((sum, g) => sum + g.remaining, 0),
          },
        ];
      }
      return [];
    }),
  };

  return db as unknown as Parameters<typeof import('./credit-service').grantCredits>[2] & typeof db;
}

// The monthly allowance reads subscriptions. Defaults to `enterprise` — the one
// plan with aiCreditsPerMonth = 0 — so grantMonthlyAllowanceIfDue() short-
// circuits and these tests measure only the grant/consume bookkeeping. Any
// other plan would silently inject its allowance into every assertion below.
//
// Mutable because the debt ceiling IS the plan allowance, so testing it needs a
// plan that grants one.
const mockPlan = { id: 'enterprise' };

vi.mock('@/domain/billing/entitlement-service', () => ({
  ensureBillingTables: vi.fn(async () => {}),
  getSubscription: vi.fn(async () => ({
    planId: mockPlan.id,
    currentPeriodStart: new Date(0).toISOString(),
    currentPeriodEnd: new Date(0).toISOString(),
  })),
}));

/** Enterprise reports no allowance, so the ceiling falls back to this. */
const FALLBACK_CEILING = 50;

const ORG = 'org_test';

let service: typeof import('./credit-service');

beforeEach(async () => {
  service = await import('./credit-service');
  mockPlan.id = 'enterprise';
});

describe('redeemCreditPack', () => {
  it('grants purchased credits as an addon grant (promo bonus only when configured)', async () => {
    const db = makeDb();
    const { CREDIT_PACKS } = await import('@/lib/billing/plans');
    const pack = CREDIT_PACKS[0];

    const result = await service.redeemCreditPack(ORG, pack.id, { ownerUserId: 'user_buyer' }, db);

    expect(result.baseGrant.source).toBe('addon');
    expect(result.baseGrant.amount).toBe(pack.baseCredits);
    expect(result.baseGrant.ownerUserId).toBe('user_buyer');
    if (pack.bonusCredits > 0) {
      // Promo must stay on a separate grant so it can be clawed back without
      // touching paid-for credits.
      expect(result.bonusGrant?.source).toBe('promo');
      expect(result.bonusGrant?.amount).toBe(pack.bonusCredits);
      expect(result.bonusGrant?.ownerUserId).toBe('user_buyer');
      expect(db.grants).toHaveLength(2);
    } else {
      expect(result.bonusGrant).toBeNull();
      expect(db.grants).toHaveLength(1);
    }
  });

  it('records the price on both grants so revenue can be attributed', async () => {
    const db = makeDb();
    const { CREDIT_PACKS } = await import('@/lib/billing/plans');
    const pack = CREDIT_PACKS[0];

    await service.redeemCreditPack(ORG, pack.id, { paymentRef: 'pi_123' }, db);

    for (const grant of db.grants) {
      const metadata = JSON.parse(String(grant.metadata)) as Record<string, unknown>;
      expect(metadata.packId).toBe(pack.id);
      expect(metadata.priceCents).toBe(pack.priceCents);
      expect(metadata.paymentRef).toBe('pi_123');
    }
  });

  it('rejects an unknown pack id rather than granting nothing silently', async () => {
    const db = makeDb();
    await expect(service.redeemCreditPack(ORG, 'pack-does-not-exist', {}, db)).rejects.toThrow(
      /Unknown credit pack/,
    );
    expect(db.grants).toHaveLength(0);
  });
});

describe('consumeCredits', () => {
  it('spends the soonest-expiring grant first', async () => {
    const db = makeDb();
    const soon = new Date(Date.now() + 5 * 86_400_000);
    const later = new Date(Date.now() + 25 * 86_400_000);

    await service.grantCredits(ORG, { source: 'addon', amount: 10, expiresAt: later }, db);
    await service.grantCredits(ORG, { source: 'addon', amount: 10, expiresAt: soon }, db);

    await service.consumeCredits(ORG, { amount: 10, reason: 'ai_generation' }, db);

    // Consuming the later grant first would strand the soon-expiring one and
    // silently destroy credits the customer paid for.
    const soonGrant = db.grants.find((g) => g.expires_at === soon);
    const laterGrant = db.grants.find((g) => g.expires_at === later);
    expect(soonGrant?.remaining).toBe(0);
    expect(laterGrant?.remaining).toBe(10);
  });

  it('reports a short-fall instead of going negative', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 3 }, db);

    const result = await service.consumeCredits(ORG, { amount: 10, reason: 'ai_generation' }, db);

    expect(result.consumed).toBe(3);
    expect(result.balance).toBe(0);
    expect(db.grants.every((g) => g.remaining >= 0)).toBe(true);
  });

  it('writes one ledger entry per grant it draws from', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 4 }, db);
    await service.grantCredits(ORG, { source: 'promo', amount: 4 }, db);

    await service.consumeCredits(ORG, { amount: 6, reason: 'ai_generation' }, db);

    const debits = db.ledger.filter((l) => l.delta < 0);
    expect(debits).toHaveLength(2);
    expect(debits.reduce((sum, l) => sum + l.delta, 0)).toBe(-6);
  });

  it('spends personal grants before org-shared grants', async () => {
    const db = makeDb();
    const viewer = 'user_a';

    await service.grantCredits(ORG, { source: 'plan', amount: 5, ownerUserId: null }, db);
    await service.grantCredits(ORG, { source: 'addon', amount: 10, ownerUserId: viewer }, db);

    await service.consumeCredits(
      ORG,
      { amount: 5, reason: 'ai_generation', viewerUserId: viewer },
      db,
    );

    const shared = db.grants.find((g) => g.owner_user_id === null);
    const personal = db.grants.find((g) => g.owner_user_id === viewer);
    expect(shared?.remaining).toBe(5);
    expect(personal?.remaining).toBe(5);
  });

  it('does not spend another user personal grants', async () => {
    const db = makeDb();

    await service.grantCredits(ORG, { source: 'addon', amount: 10, ownerUserId: 'user_b' }, db);

    const result = await service.consumeCredits(
      ORG,
      { amount: 5, reason: 'ai_generation', viewerUserId: 'user_a' },
      db,
    );

    expect(result.consumed).toBe(0);
    expect(db.grants[0]?.remaining).toBe(10);
  });
});

/** Run one expensive generation against whatever balance the org has. */
async function meterExpensiveRun(db: ReturnType<typeof makeDb>) {
  return service.meterAiUsageForOrg(
    {
      orgId: ORG,
      model: 'gpt-4o',
      promptTokens: 200_000,
      completionTokens: 200_000,
      keySource: 'env',
    },
    db,
  );
}

/** Meter a gpt-4o job sized to cost approximately `credits` (input-only). */
async function meterRunCostingAbout(
  db: ReturnType<typeof makeDb>,
  credits: number,
) {
  const promptTokens = Math.ceil((credits / 0.4) * 1000);
  return service.meterAiUsageForOrg(
    {
      orgId: ORG,
      model: 'gpt-4o',
      promptTokens,
      completionTokens: 0,
      keySource: 'env',
    },
    db,
  );
}

describe('meterAiUsageForOrg', () => {
  it('records the full cost as debt when the run outruns the balance', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 1 }, db);

    // The tokens are already spent by the time metering runs. Collecting only
    // the 1 available credit and dropping the rest would hand the work over
    // free; the overage has to survive as debt.
    const result = await meterExpensiveRun(db);

    expect(result.credits).toBeGreaterThan(1);
    expect(result.consumed).toBe(1);
    // Everything uncollected, split into what is owed and what is gone.
    expect(result.shortfall).toBe(result.credits - 1);
    expect(result.debt + result.writtenOff).toBe(result.shortfall);
    // Debt is bounded by the ceiling; the balance of the cost is written off.
    expect(result.debt).toBe(FALLBACK_CEILING);
    expect(await service.getOutstandingDebt(ORG, db)).toBe(FALLBACK_CEILING);
  });

  it('keeps the books balanced while in debt', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 1 }, db);
    await meterExpensiveRun(db);

    // Debt is real credit movement with no matching grant, so reconciliation
    // has to account for it rather than reporting drift.
    const report = await service.reconcileCredits(ORG, db);
    expect(report.debt).toBeGreaterThan(0);
    expect(report.balanced).toBe(true);
  });

  it('charges tenant-stored key (db) usage the same as platform-key usage', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 100 }, db);

    const result = await service.meterAiUsageForOrg(
      {
        orgId: ORG,
        model: 'gpt-4o',
        promptTokens: 50_000,
        completionTokens: 50_000,
        keySource: 'db',
      },
      db,
    );

    expect(result.charged).toBe(true);
    expect(result.credits).toBeGreaterThan(0);
    expect(result.consumed).toBeGreaterThan(0);
    expect(db.ledger.filter((l) => l.delta < 0).length).toBeGreaterThan(0);
  });
});

describe('per-operation credit floors', () => {
  it('sizes floors to the operations they guard', () => {
    // A flat floor is wrong in both directions: these differ by ~8x at the
    // current rate card. Chat stays at 1 because blocking a ~4-credit turn is
    // worse than absorbing it; an app pack costs ~30.
    expect(service.CREDIT_FLOORS.chat).toBe(1);
    expect(service.CREDIT_FLOORS.appPack).toBeGreaterThan(service.CREDIT_FLOORS.schemaGeneration);
    expect(service.CREDIT_FLOORS.schemaGeneration).toBeGreaterThan(
      service.CREDIT_FLOORS.templateGeneration,
    );
  });

  it('blocks an operation the balance cannot cover but allows a cheaper one', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 6 }, db);

    // 6 credits: enough to start a template build (floor 5), not an app pack (30).
    expect((await service.requireCreditsForOrg(ORG, db, service.CREDIT_FLOORS.templateGeneration)).ok)
      .toBe(true);
    expect((await service.requireCreditsForOrg(ORG, db, service.CREDIT_FLOORS.appPack)).ok)
      .toBe(false);
  });

  it('explains the shortfall rather than just refusing', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 6 }, db);
    const gate = await service.requireCreditsForOrg(ORG, db, service.CREDIT_FLOORS.appPack);
    expect(gate.ok).toBe(false);
    if (!gate.ok) {
      const body = await gate.response.json() as { error: string };
      expect(body.error).toContain('6');
      expect(body.error).toContain(String(service.CREDIT_FLOORS.appPack));
    }
  });
});

describe('debt ceiling', () => {
  it('caps debt at the plan allowance', async () => {
    // Debt ceiling equals the plan's monthly AI grant so the next allowance
    // can always clear arrears. Job cost is 2×allowance + write-off headroom.
    mockPlan.id = 'free';
    const allowance = getPlan('free').aiCreditsPerMonth;
    const db = makeDb();
    const result = await meterRunCostingAbout(db, allowance * 2 + 300);

    expect(result.credits).toBeGreaterThanOrEqual(allowance * 2 + 300);
    expect(result.consumed).toBe(allowance);
    expect(result.debt).toBe(allowance);
    expect(result.writtenOff).toBe(result.credits - allowance - allowance);
    expect(result.shortfall).toBe(result.debt + result.writtenOff);
  });

  it('scales the ceiling with the plan', async () => {
    // Larger monthly grants may carry more debt — the ceiling tracks what the
    // org's own next grant can clear, not a flat platform number.
    mockPlan.id = 'pro';
    const proAllowance = getPlan('pro').aiCreditsPerMonth;
    const pro = await meterRunCostingAbout(makeDb(), proAllowance * 2 + 300);
    expect(pro.debt).toBe(proAllowance);

    mockPlan.id = 'free';
    const freeAllowance = getPlan('free').aiCreditsPerMonth;
    const free = await meterRunCostingAbout(makeDb(), freeAllowance * 2 + 300);
    expect(free.debt).toBe(freeAllowance);
    expect(pro.debt).toBeGreaterThan(free.debt);
  });

  it('falls back for a plan with no allowance', async () => {
    // Enterprise negotiates its allowance and reports 0, which would otherwise
    // mean a zero ceiling — every overage written off.
    mockPlan.id = 'enterprise';
    const db = makeDb();
    expect((await meterExpensiveRun(db)).debt).toBe(FALLBACK_CEILING);
  });

  it('records the write-off instead of swallowing it', async () => {
    // An unrecorded write-off is indistinguishable from a metering bug.
    mockPlan.id = 'free';
    const allowance = getPlan('free').aiCreditsPerMonth;
    const db = makeDb();
    await meterRunCostingAbout(db, allowance * 2 + 300);

    const entry = db.ledger.find((l) => l.reason === 'ai_generation_written_off');
    expect(entry).toBeDefined();
    expect(entry?.delta).toBe(0);
    expect(entry?.grant_id).toBeNull();
  });

  it('keeps the books balanced after a write-off', async () => {
    mockPlan.id = 'free';
    const allowance = getPlan('free').aiCreditsPerMonth;
    const db = makeDb();
    await meterRunCostingAbout(db, allowance * 2 + 300);
    const report = await service.reconcileCredits(ORG, db);
    expect(report.balanced).toBe(true);
  });

  it('bounds total debt across repeated runs, not just one', async () => {
    // The ceiling applies to TOTAL debt, so an org already in arrears has less
    // headroom. Without that, N runs could each add a full ceiling and arrears
    // would grow without limit.
    //
    // Uses enterprise so no monthly allowance is granted between runs — the
    // point here is the bound, not the settlement.
    mockPlan.id = 'enterprise';
    const db = makeDb();
    await meterExpensiveRun(db);
    await meterExpensiveRun(db);
    await meterExpensiveRun(db);
    expect(await service.getOutstandingDebt(ORG, db)).toBe(FALLBACK_CEILING);
  });

  it('lets one monthly grant clear the whole debt', async () => {
    // This is the reason the ceiling IS the plan allowance: arrears must
    // self-heal. A higher ceiling would let an org owe more than a grant can
    // clear, leaving it blocked indefinitely — which in practice means gone.
    mockPlan.id = 'free';
    const allowance = getPlan('free').aiCreditsPerMonth;
    const db = makeDb();
    const run = await meterRunCostingAbout(db, allowance * 2 + 300);
    expect(run.debt).toBe(allowance);

    // Switch off the lazy allowance so the grant under test is the only one —
    // otherwise the gate's own balance read tops the org up first.
    mockPlan.id = 'enterprise';
    expect((await service.requireCreditsForOrg(ORG, db)).ok).toBe(false);

    await service.grantCredits(ORG, { source: 'plan', amount: allowance }, db);
    expect(await service.getOutstandingDebt(ORG, db)).toBe(0);
    expect((await service.requireCreditsForOrg(ORG, db)).ok).toBe(true);
  });
});

describe('credit charging (no identity exemption)', () => {
  const PLATFORM_ADMIN = 'reward2learn@gmail.com';

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_TENANT_SLUG', 'redrubybali');
    // Legacy env flags must have no effect — exemption was removed.
    vi.stubEnv('CREDIT_EXEMPT_ENABLED', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('never exempts anyone, regardless of CREDIT_EXEMPT_ENABLED or email', () => {
    expect(service.isCreditExemptionEnabled()).toBe(false);
    expect(service.creditExemptEmails()).toEqual([]);
    expect(service.isCreditExemptEmail(PLATFORM_ADMIN)).toBe(false);
    expect(service.isCreditExemptEmail('  Reward2Learn@Gmail.com  ')).toBe(false);
    expect(service.isCreditExemptEmail('someone@else.com')).toBe(false);
    expect(service.isCreditExemptEmail(undefined)).toBe(false);
    expect(service.isCreditExemptEmail('')).toBe(false);
  });

  it('charges the platform owner on a tenant app', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 100 }, db);

    const result = await service.meterAiUsageForOrg(
      {
        orgId: ORG,
        model: 'gpt-4o',
        promptTokens: 200_000,
        completionTokens: 200_000,
        keySource: 'env',
        viewerEmail: PLATFORM_ADMIN,
        viewerUserId: 'user_admin',
        provider: 'openai',
      },
      db,
    );

    expect(result.charged).toBe(true);
    expect(result.consumed).toBe(100);
    expect(db.ledger.find((l) => l.reason === 'ai_generation_exempt')).toBeUndefined();
    expect(db.ledger.some((l) => l.reason === 'ai_generation' && l.delta < 0)).toBe(true);

    const entry = db.ledger.find((l) => l.reason === 'ai_generation' && l.delta < 0);
    const metadata =
      typeof entry?.metadata === 'string'
        ? (JSON.parse(entry.metadata) as Record<string, unknown>)
        : (entry?.metadata as Record<string, unknown> | null);
    expect(metadata).toMatchObject({
      viewerUserId: 'user_admin',
      viewerEmail: PLATFORM_ADMIN,
      provider: 'openai',
      model: 'gpt-4o',
      promptTokens: 200_000,
      completionTokens: 200_000,
      totalTokens: 400_000,
      inputTokens: 200_000,
      outputTokens: 200_000,
    });
  });

  it('gates the platform owner with a zero balance (no free pass)', async () => {
    const db = makeDb();
    const blocked = await service.requireCreditsForOrg(ORG, db);
    expect(blocked.ok).toBe(false);

    const stillBlocked = await service.requireCreditsForOrg(ORG, db, 1, PLATFORM_ADMIN);
    expect(stillBlocked.ok).toBe(false);
  });

  it('gates the platform owner on the factory with a zero balance', async () => {
    vi.stubEnv('NEXT_PUBLIC_TENANT_SLUG', 'tokenizmyapp');
    const db = makeDb();
    const blocked = await service.requireCreditsForOrg(ORG, db, 1, PLATFORM_ADMIN);
    expect(blocked.ok).toBe(false);
  });

  it('charges the platform owner on the factory', async () => {
    vi.stubEnv('NEXT_PUBLIC_TENANT_SLUG', 'tokenizmyapp');
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 100 }, db);

    const result = await service.meterAiUsageForOrg(
      {
        orgId: ORG,
        model: 'gpt-4o',
        promptTokens: 200_000,
        completionTokens: 200_000,
        keySource: 'env',
        viewerEmail: PLATFORM_ADMIN,
      },
      db,
    );

    expect(result.charged).toBe(true);
    expect(result.consumed).toBe(100);
    expect(result.credits).toBeGreaterThan(0);
    expect(db.ledger.find((l) => l.reason === 'ai_generation_exempt')).toBeUndefined();
    expect(db.ledger.some((l) => l.reason === 'ai_generation' && l.delta < 0)).toBe(true);
    expect(db.grants[0].remaining).toBe(0);
  });

  it('charges even when keySource is db (tenant-stored key)', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 100 }, db);

    const result = await service.meterAiUsageForOrg(
      {
        orgId: ORG,
        model: 'gpt-4o',
        promptTokens: 50_000,
        completionTokens: 50_000,
        keySource: 'db',
        viewerEmail: PLATFORM_ADMIN,
      },
      db,
    );

    expect(result).toMatchObject({ charged: true });
    expect(result.consumed).toBeGreaterThan(0);
    expect(result.credits).toBeGreaterThan(0);
    expect(db.ledger.filter((l) => l.delta < 0).length).toBeGreaterThan(0);
  });

  it('charges a regular tenant user normally', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 100 }, db);

    const result = await service.meterAiUsageForOrg(
      {
        orgId: ORG,
        model: 'gpt-4o',
        promptTokens: 200_000,
        completionTokens: 200_000,
        keySource: 'env',
        viewerEmail: 'someone@else.com',
      },
      db,
    );

    expect(result.charged).toBe(true);
    expect(result.consumed).toBe(100);
  });
});

describe('debt settlement', () => {
  it('blocks the next generation while the org is in arrears', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 1 }, db);
    await meterExpensiveRun(db);

    const gate = await service.requireCreditsForOrg(ORG, db);

    expect(gate.ok).toBe(false);
    if (!gate.ok) {
      expect(gate.response.status).toBe(402);
      // The message must name the debt: an org told only "no credits" would
      // top up by the wrong amount and still be blocked.
      await expect(gate.response.text()).resolves.toMatch(/owes \d+ AI credit/);
    }
  });

  it('settles automatically out of the next grant', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 1 }, db);
    const run = await meterExpensiveRun(db);
    const debt = run.debt;

    await service.grantCredits(ORG, { source: 'addon', amount: debt + 10 }, db);

    expect(await service.getOutstandingDebt(ORG, db)).toBe(0);
    const balance = await service.getCreditBalance(ORG, db);
    expect(balance.available).toBe(10);
    expect(balance.net).toBe(10);
    expect((await service.reconcileCredits(ORG, db)).balanced).toBe(true);
  });

  it('carries the remainder forward when the grant does not cover the debt', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 1 }, db);
    const run = await meterExpensiveRun(db);
    const debt = run.debt;

    await service.grantCredits(ORG, { source: 'addon', amount: 5 }, db);

    // A partial top-up must not look like it cleared the account.
    expect(await service.getOutstandingDebt(ORG, db)).toBe(debt - 5);
    expect((await service.getCreditBalance(ORG, db)).available).toBe(0);
    expect((await service.reconcileCredits(ORG, db)).balanced).toBe(true);
    expect((await service.requireCreditsForOrg(ORG, db)).ok).toBe(false);
  });

  it('unblocks generation once the debt is cleared', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 1 }, db);
    const run = await meterExpensiveRun(db);

    await service.grantCredits(ORG, { source: 'addon', amount: run.debt + 1 }, db);

    expect((await service.requireCreditsForOrg(ORG, db)).ok).toBe(true);
  });
});

describe('reconcileCredits', () => {
  it('balances after grants and consumption', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 50 }, db);
    await service.grantCredits(ORG, { source: 'promo', amount: 100 }, db);
    await service.consumeCredits(ORG, { amount: 37, reason: 'ai_generation' }, db);

    const report = await service.reconcileCredits(ORG, db);

    expect(report.ledgerTotal).toBe(113);
    expect(report.grantsRemaining).toBe(113);
    expect(report.drift).toBe(0);
    expect(report.balanced).toBe(true);
  });

  it('reports drift when a grant is written without its ledger entry', async () => {
    const db = makeDb();
    await service.grantCredits(ORG, { source: 'addon', amount: 20 }, db);
    // Simulate the bookkeeping bug this check exists to catch.
    db.ledger.length = 0;

    const report = await service.reconcileCredits(ORG, db);

    expect(report.balanced).toBe(false);
    expect(report.drift).toBe(-20);
  });
});
