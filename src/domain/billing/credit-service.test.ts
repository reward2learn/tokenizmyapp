import { describe, expect, it, vi, beforeEach } from 'vitest';

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
        // Four INSERT shapes reach here and their placeholders do NOT line up:
        // grant_id is either a bound parameter or the literal NULL (debt
        // markers), and ref_type/ref_id are present only on consumption. Read
        // the shape off the SQL rather than assuming fixed positions — that
        // assumption is what made this double silently record NaN deltas.
        const grantIsNull = sql.includes(', NULL,');
        const hasRefColumns = sql.includes('ref_type');
        let i = 1; // args[0] is always org_id
        const grantId = grantIsNull ? null : (args[i++] as string);
        const delta = Number(args[i++]);
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
          metadata: args[5] ?? null,
        };
        grants.push(grant);
        return [grant];
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

// The monthly allowance reads subscriptions. Pinned to `enterprise` — the one
// plan with aiCreditsPerMonth = 0 — so grantMonthlyAllowanceIfDue() short-
// circuits and these tests measure only the grant/consume bookkeeping. Any
// other plan would silently inject its allowance into every assertion below.
vi.mock('@/domain/billing/entitlement-service', () => ({
  ensureBillingTables: vi.fn(async () => {}),
  getSubscription: vi.fn(async () => ({
    planId: 'enterprise',
    currentPeriodStart: new Date(0).toISOString(),
    currentPeriodEnd: new Date(0).toISOString(),
  })),
}));

const ORG = 'org_test';

let service: typeof import('./credit-service');

beforeEach(async () => {
  service = await import('./credit-service');
});

describe('redeemCreditPack', () => {
  it('splits a pack into a purchased grant and a separate promo grant', async () => {
    const db = makeDb();
    const { CREDIT_PACKS } = await import('@/lib/billing/plans');
    const pack = CREDIT_PACKS[0];

    const result = await service.redeemCreditPack(ORG, pack.id, {}, db);

    // The whole point of the split: a refund or withdrawn promotion must be
    // able to claw back the bonus without touching paid-for credits.
    expect(result.baseGrant.source).toBe('addon');
    expect(result.baseGrant.amount).toBe(pack.baseCredits);
    expect(result.bonusGrant?.source).toBe('promo');
    expect(result.bonusGrant?.amount).toBe(pack.bonusCredits);
    expect(db.grants).toHaveLength(2);
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
    expect(result.shortfall).toBe(result.credits - 1);
    expect(await service.getOutstandingDebt(ORG, db)).toBe(result.credits - 1);
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

  it('charges nothing on a BYOK key', async () => {
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

    expect(result).toMatchObject({ charged: false, credits: 0, consumed: 0, shortfall: 0 });
    expect(db.ledger.filter((l) => l.delta < 0)).toHaveLength(0);
    expect(await service.getOutstandingDebt(ORG, db)).toBe(0);
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
    const debt = run.shortfall;

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
    const debt = run.shortfall;

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

    await service.grantCredits(ORG, { source: 'addon', amount: run.shortfall + 1 }, db);

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
