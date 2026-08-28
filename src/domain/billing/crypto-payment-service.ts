/**
 * Crypto payment intents — USDC credit top-ups and prepaid plan packs on Base / Sepolia.
 *
 * Mirrors the Stripe top-up shape: create intent → user pays → confirm grants
 * credits via redeemCreditPack(). On-chain verification uses viem; idempotency
 * is enforced on (chainId, txHash, logIndex) and paymentRef in credit_grants.
 */
import { randomBytes } from 'node:crypto';
import {
  createPublicClient,
  decodeEventLog,
  http,
  type Hash,
} from 'viem';
import { base, sepolia } from 'viem/chains';
import type { createRawClient } from '@/lib/db';
import { CREDIT_PACKS, isPlanId, prepaidPlanPriceCents, type CreditPack, type PlanId } from '@/lib/billing/plans';
import {
  CRYPTO_PLAN_PREPAID_MONTHS,
  type CryptoPlanPrepaidMonths,
} from '@/lib/web3/crypto-billing-config';
import {
  PAYMENT_CHAIN_ID_PRODUCTION,
  PAYMENT_CHAIN_ID_STAGING,
  cryptoPaymentsReadiness,
  resolvePaymentChainId,
  resolveRpcUrl,
  resolveTreasuryAddress,
  usdcAmountFromCents,
  usdcContractForChain,
} from '@/lib/web3/crypto-billing-config';
import { resolvePlatformCryptoConfig } from '@/lib/web3/platform-crypto-config';
import { ERC20_TRANSFER_ABI } from '@/lib/web3/erc20-abi';

type RawDb = ReturnType<typeof createRawClient>;

const INTENT_TTL_MS = 30 * 60 * 1000;

const CRYPTO_INTENTS_DDL = `
CREATE TABLE IF NOT EXISTS crypto_payment_intents (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  pack_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  amount_usdc TEXT NOT NULL,
  chain_id INT NOT NULL,
  usdc_contract TEXT NOT NULL,
  treasury_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  purchaser_user_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  confirmed_at TIMESTAMP,
  tx_hash TEXT
);`;

const CRYPTO_INTENTS_PLAN_MIGRATIONS = [
  `ALTER TABLE crypto_payment_intents ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'credit_topup';`,
  `ALTER TABLE crypto_payment_intents ADD COLUMN IF NOT EXISTS plan_id TEXT;`,
  `ALTER TABLE crypto_payment_intents ADD COLUMN IF NOT EXISTS prepaid_months INT;`,
  `ALTER TABLE crypto_payment_intents ALTER COLUMN pack_id DROP NOT NULL;`,
];

const CRYPTO_INTENTS_ORG_IDX = `
CREATE INDEX IF NOT EXISTS idx_crypto_intents_org ON crypto_payment_intents (org_id, created_at DESC);`;

const ON_CHAIN_EVENTS_DDL = `
CREATE TABLE IF NOT EXISTS on_chain_payment_events (
  id TEXT PRIMARY KEY,
  chain_id INT NOT NULL,
  tx_hash TEXT NOT NULL,
  log_index INT NOT NULL,
  intent_id TEXT,
  org_id TEXT NOT NULL,
  amount_usdc TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (chain_id, tx_hash, log_index)
);`;

export async function ensureCryptoPaymentTables(db: RawDb): Promise<void> {
  await db.$executeRawUnsafe(CRYPTO_INTENTS_DDL);
  for (const sql of CRYPTO_INTENTS_PLAN_MIGRATIONS) {
    try {
      await db.$executeRawUnsafe(sql);
    } catch {
      // Column already shaped on this database.
    }
  }
  await db.$executeRawUnsafe(CRYPTO_INTENTS_ORG_IDX);
  await db.$executeRawUnsafe(ON_CHAIN_EVENTS_DDL);
}

export interface CryptoTopUpIntentResult {
  intentId: string;
  treasury: string;
  amountUsdc: string;
  chainId: number;
  usdcContract: string;
  reference: string;
  expiresAt: string;
  pack: CreditPack;
}

export interface ConfirmCryptoTopUpResult {
  orgId: string;
  packId: string;
  intentId: string;
  txHash: string;
  alreadyGranted: boolean;
  balance: {
    available: number;
    expiringSoon: number;
    debt: number;
    net: number;
  };
  baseCredits: number;
  bonusCredits: number;
}

export interface CryptoPlanIntentResult {
  intentId: string;
  treasury: string;
  amountUsdc: string;
  chainId: number;
  usdcContract: string;
  reference: string;
  expiresAt: string;
  planId: PlanId;
  prepaidMonths: CryptoPlanPrepaidMonths;
  priceCents: number;
}

export interface ConfirmCryptoPlanResult {
  orgId: string;
  planId: PlanId;
  prepaidMonths: number;
  intentId: string;
  txHash: string;
  alreadyApplied: boolean;
  creditsGranted: number;
  periodEnd: string;
  subscription: {
    planId: string;
    status: string;
    currentPeriodEnd: string;
  };
}

type CryptoIntentKind = 'credit_topup' | 'plan_prepaid';

function chainForId(chainId: number) {
  if (chainId === PAYMENT_CHAIN_ID_PRODUCTION) return base;
  if (chainId === PAYMENT_CHAIN_ID_STAGING) return sepolia;
  throw new Error(`Unsupported payment chain ${chainId}`);
}

function getPublicClient(chainId: number) {
  const rpcUrl = resolveRpcUrl(chainId);
  if (!rpcUrl) throw new Error(`No RPC URL configured for chain ${chainId}`);
  return createPublicClient({
    chain: chainForId(chainId),
    transport: http(rpcUrl),
  });
}

type PaymentPublicClient = ReturnType<typeof getPublicClient>;

function normalizeAddress(value: string): string {
  return value.trim().toLowerCase();
}

function newTopUpIntentId(): string {
  return `cpt_${randomBytes(12).toString('hex')}`;
}

function newPlanIntentId(): string {
  return `cpp_${randomBytes(12).toString('hex')}`;
}

function isPrepaidMonths(value: number): value is CryptoPlanPrepaidMonths {
  return (CRYPTO_PLAN_PREPAID_MONTHS as readonly number[]).includes(value);
}

function mapIntentRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    kind: (row.kind ? String(row.kind) : 'credit_topup') as CryptoIntentKind,
    orgId: String(row.org_id),
    packId: row.pack_id ? String(row.pack_id) : null,
    planId: row.plan_id ? String(row.plan_id) : null,
    prepaidMonths: row.prepaid_months != null ? Number(row.prepaid_months) : null,
    walletAddress: String(row.wallet_address),
    amountUsdc: String(row.amount_usdc),
    chainId: Number(row.chain_id),
    usdcContract: String(row.usdc_contract),
    treasuryAddress: String(row.treasury_address),
    status: String(row.status),
    purchaserUserId: row.purchaser_user_id ? String(row.purchaser_user_id) : null,
    expiresAt: new Date(String(row.expires_at)),
    txHash: row.tx_hash ? String(row.tx_hash) : null,
  };
}

/**
 * Create a pending USDC payment intent for a credit pack.
 */
export async function createCryptoTopUpIntent(
  orgId: string,
  packId: string,
  walletAddress: string,
  options: { purchaserUserId?: string | null } = {},
  db?: RawDb,
): Promise<CryptoTopUpIntentResult> {
  const platform = await resolvePlatformCryptoConfig();
  const readiness = cryptoPaymentsReadiness(platform);
  if (!readiness.enabled || !readiness.usdcContract) {
    throw new Error(
      'Crypto payments are not configured. Enable Crypto Payments (treasury + flag) on the factory tenant or Vercel env.',
    );
  }

  const treasury = resolveTreasuryAddress(platform);
  if (!treasury) throw new Error('CRYPTO_TREASURY_ADDRESS is not set.');

  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) {
    throw new Error(
      `Unknown credit pack "${packId}". Available: ${CREDIT_PACKS.map((p) => p.id).join(', ')}`,
    );
  }

  const chainId = resolvePaymentChainId();
  const usdcContract = usdcContractForChain(chainId);
  if (!usdcContract) throw new Error(`No USDC contract for chain ${chainId}.`);

  const amountUsdc = usdcAmountFromCents(pack.priceCents);
  const intentId = newTopUpIntentId();
  const expiresAt = new Date(Date.now() + INTENT_TTL_MS);

  db ??= (await import('@/lib/db')).createBillingRawClient();
  await ensureCryptoPaymentTables(db);

  await db.$executeRawUnsafe(
    `INSERT INTO crypto_payment_intents
      (id, kind, org_id, pack_id, wallet_address, amount_usdc, chain_id, usdc_contract,
       treasury_address, status, purchaser_user_id, expires_at)
     VALUES ($1, 'credit_topup', $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10);`,
    intentId,
    orgId,
    pack.id,
    normalizeAddress(walletAddress),
    amountUsdc.toString(),
    chainId,
    usdcContract,
    normalizeAddress(treasury),
    options.purchaserUserId ?? null,
    expiresAt,
  );

  return {
    intentId,
    treasury,
    amountUsdc: amountUsdc.toString(),
    chainId,
    usdcContract,
    reference: intentId,
    expiresAt: expiresAt.toISOString(),
    pack,
  };
}

interface VerifiedTransfer {
  txHash: string;
  logIndex: number;
  from: string;
  to: string;
  value: bigint;
}

/**
 * Parse ERC-20 Transfer logs for a USDC payment to treasury.
 */
export async function verifyUsdcTransfer(
  chainId: number,
  txHash: string,
  expected: {
    from: string;
    to: string;
    amount: bigint;
    usdcContract: string;
  },
  client?: PaymentPublicClient,
): Promise<VerifiedTransfer> {
  const publicClient = client ?? getPublicClient(chainId);
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash as Hash });
  if (receipt.status !== 'success') {
    throw new Error(`Transaction ${txHash} did not succeed on chain.`);
  }

  const expectedFrom = normalizeAddress(expected.from);
  const expectedTo = normalizeAddress(expected.to);
  const expectedContract = normalizeAddress(expected.usdcContract);

  for (const log of receipt.logs) {
    if (normalizeAddress(log.address) !== expectedContract) continue;
    try {
      const decoded = decodeEventLog({
        abi: ERC20_TRANSFER_ABI,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName !== 'Transfer') continue;
      const from = normalizeAddress(String(decoded.args.from));
      const to = normalizeAddress(String(decoded.args.to));
      const value = decoded.args.value as bigint;
      if (from === expectedFrom && to === expectedTo && value === expected.amount) {
        return {
          txHash,
          logIndex: log.logIndex ?? 0,
          from,
          to,
          value,
        };
      }
    } catch {
      // Not a Transfer event — skip.
    }
  }

  throw new Error(
    'No matching USDC transfer to treasury found in this transaction. Check amount, wallet, and network.',
  );
}

/**
 * Confirm a crypto top-up after the client submits a USDC transfer tx.
 */
export async function confirmCryptoTopUp(
  orgId: string,
  intentId: string,
  txHash: string,
  db?: RawDb,
): Promise<ConfirmCryptoTopUpResult> {
  db ??= (await import('@/lib/db')).createBillingRawClient();
  await ensureCryptoPaymentTables(db);

  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM crypto_payment_intents WHERE id = $1 LIMIT 1;`,
    intentId,
  )) as Record<string, unknown>[];

  if (rows.length === 0) throw new Error(`Payment intent ${intentId} not found.`);
  const intent = mapIntentRow(rows[0]);

  if (intent.orgId !== orgId) {
    throw new Error('Payment intent does not belong to this organization.');
  }
  if (intent.kind !== 'credit_topup') {
    throw new Error('Payment intent is not a credit top-up.');
  }
  if (!intent.packId) {
    throw new Error('Payment intent is missing pack id.');
  }
  if (intent.status === 'confirmed') {
    const paymentRef = `crypto:${intent.txHash ?? txHash}`;
    const { redeemCreditPack } = await import('@/domain/billing/credit-service');
    const result = await redeemCreditPack(
      orgId,
      intent.packId,
      { paymentRef, ownerUserId: intent.purchaserUserId },
      db,
    );
    return {
      orgId,
      packId: intent.packId,
      intentId,
      txHash: intent.txHash ?? txHash,
      alreadyGranted: true,
      balance: result.balance,
      baseCredits: result.pack.baseCredits,
      bonusCredits: result.pack.bonusCredits,
    };
  }
  if (intent.status !== 'pending') {
    throw new Error(`Payment intent is "${intent.status}", not pending.`);
  }
  if (intent.expiresAt.getTime() < Date.now()) {
    throw new Error('Payment intent expired. Start a new top-up.');
  }

  const normalizedTx = txHash.trim().toLowerCase();
  if (!/^0x[0-9a-f]{64}$/.test(normalizedTx)) {
    throw new Error('Invalid transaction hash.');
  }

  const transfer = await verifyUsdcTransfer(intent.chainId, normalizedTx, {
    from: intent.walletAddress,
    to: intent.treasuryAddress,
    amount: BigInt(intent.amountUsdc),
    usdcContract: intent.usdcContract,
  });

  const priorEvent = (await db.$queryRawUnsafe(
    `SELECT id FROM on_chain_payment_events
      WHERE chain_id = $1 AND tx_hash = $2 AND log_index = $3
      LIMIT 1;`,
    intent.chainId,
    transfer.txHash,
    transfer.logIndex,
  )) as { id: string }[];

  const paymentRef = `crypto:${transfer.txHash}`;
  const { redeemCreditPack, ensureCreditTables } = await import(
    '@/domain/billing/credit-service'
  );
  await ensureCreditTables(db);

  const priorGrant = (await db.$queryRawUnsafe(
    `SELECT id FROM credit_grants
      WHERE org_id = $1 AND metadata->>'paymentRef' = $2
      LIMIT 1;`,
    orgId,
    paymentRef,
  )) as { id: string }[];
  const alreadyGranted = priorGrant.length > 0;

  if (priorEvent.length === 0) {
    await db.$executeRawUnsafe(
      `INSERT INTO on_chain_payment_events
        (id, chain_id, tx_hash, log_index, intent_id, org_id, amount_usdc, from_address, to_address)
       VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, $5, $6, $7, $8);`,
      intent.chainId,
      transfer.txHash,
      transfer.logIndex,
      intentId,
      orgId,
      transfer.value.toString(),
      transfer.from,
      transfer.to,
    );
  }

  await db.$executeRawUnsafe(
    `UPDATE crypto_payment_intents
        SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP, tx_hash = $2
      WHERE id = $1;`,
    intentId,
    transfer.txHash,
  );

  const result = await redeemCreditPack(
    orgId,
    intent.packId,
    { paymentRef, ownerUserId: intent.purchaserUserId },
    db,
  );

  return {
    orgId,
    packId: intent.packId,
    intentId,
    txHash: transfer.txHash,
    alreadyGranted,
    balance: result.balance,
    baseCredits: result.pack.baseCredits,
    bonusCredits: result.pack.bonusCredits,
  };
}

/**
 * Create a pending USDC payment intent for a prepaid plan pack.
 */
export async function createCryptoPlanIntent(
  orgId: string,
  planId: PlanId,
  prepaidMonths: number,
  walletAddress: string,
  db?: RawDb,
): Promise<CryptoPlanIntentResult> {
  const platform = await resolvePlatformCryptoConfig();
  const readiness = cryptoPaymentsReadiness(platform);
  if (!readiness.enabled || !readiness.usdcContract) {
    throw new Error(
      'Crypto payments are not configured. Enable Crypto Payments (treasury + flag) on the factory tenant or Vercel env.',
    );
  }
  if (!isPlanId(planId)) {
    throw new Error(`Unknown plan "${planId}".`);
  }
  if (!isPrepaidMonths(prepaidMonths)) {
    throw new Error(
      `Invalid prepaid months ${prepaidMonths}. Choose ${CRYPTO_PLAN_PREPAID_MONTHS.join(', ')}.`,
    );
  }

  const priceCents = prepaidPlanPriceCents(planId, prepaidMonths);
  if (priceCents == null) {
    throw new Error(`Plan "${planId}" is not available for crypto prepaid purchase.`);
  }

  const treasury = resolveTreasuryAddress(platform);
  if (!treasury) throw new Error('CRYPTO_TREASURY_ADDRESS is not set.');

  const chainId = resolvePaymentChainId();
  const usdcContract = usdcContractForChain(chainId);
  if (!usdcContract) throw new Error(`No USDC contract for chain ${chainId}.`);

  const amountUsdc = usdcAmountFromCents(priceCents);
  const intentId = newPlanIntentId();
  const expiresAt = new Date(Date.now() + INTENT_TTL_MS);

  db ??= (await import('@/lib/db')).createBillingRawClient();
  await ensureCryptoPaymentTables(db);

  await db.$executeRawUnsafe(
    `INSERT INTO crypto_payment_intents
      (id, kind, org_id, plan_id, prepaid_months, wallet_address, amount_usdc, chain_id,
       usdc_contract, treasury_address, status, expires_at)
     VALUES ($1, 'plan_prepaid', $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10);`,
    intentId,
    orgId,
    planId,
    prepaidMonths,
    normalizeAddress(walletAddress),
    amountUsdc.toString(),
    chainId,
    usdcContract,
    normalizeAddress(treasury),
    expiresAt,
  );

  return {
    intentId,
    treasury,
    amountUsdc: amountUsdc.toString(),
    chainId,
    usdcContract,
    reference: intentId,
    expiresAt: expiresAt.toISOString(),
    planId,
    prepaidMonths,
    priceCents,
  };
}

/**
 * Confirm a crypto prepaid plan purchase after on-chain USDC transfer.
 */
export async function confirmCryptoPlanPurchase(
  orgId: string,
  intentId: string,
  txHash: string,
  db?: RawDb,
): Promise<ConfirmCryptoPlanResult> {
  db ??= (await import('@/lib/db')).createBillingRawClient();
  await ensureCryptoPaymentTables(db);

  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM crypto_payment_intents WHERE id = $1 LIMIT 1;`,
    intentId,
  )) as Record<string, unknown>[];

  if (rows.length === 0) throw new Error(`Payment intent ${intentId} not found.`);
  const intent = mapIntentRow(rows[0]);

  if (intent.orgId !== orgId) {
    throw new Error('Payment intent does not belong to this organization.');
  }
  if (intent.kind !== 'plan_prepaid') {
    throw new Error('Payment intent is not a prepaid plan purchase.');
  }
  if (!intent.planId || !isPlanId(intent.planId) || intent.prepaidMonths == null) {
    throw new Error('Payment intent is missing plan details.');
  }

  if (intent.status === 'confirmed') {
    const paymentRef = `crypto:${intent.txHash ?? txHash}`;
    const { applyCryptoPrepaidPlan } = await import('@/domain/billing/crypto-plan-service');
    const result = await applyCryptoPrepaidPlan(
      orgId,
      { planId: intent.planId, months: intent.prepaidMonths, paymentRef },
      db,
    );
    return {
      orgId,
      planId: intent.planId,
      prepaidMonths: intent.prepaidMonths,
      intentId,
      txHash: intent.txHash ?? txHash,
      alreadyApplied: true,
      creditsGranted: result.creditsGranted,
      periodEnd: result.periodEnd,
      subscription: {
        planId: result.subscription.planId,
        status: result.subscription.status,
        currentPeriodEnd: result.subscription.currentPeriodEnd,
      },
    };
  }

  if (intent.status !== 'pending') {
    throw new Error(`Payment intent is "${intent.status}", not pending.`);
  }
  if (intent.expiresAt.getTime() < Date.now()) {
    throw new Error('Payment intent expired. Start checkout again.');
  }

  const normalizedTx = txHash.trim().toLowerCase();
  if (!/^0x[0-9a-f]{64}$/.test(normalizedTx)) {
    throw new Error('Invalid transaction hash.');
  }

  const transfer = await verifyUsdcTransfer(intent.chainId, normalizedTx, {
    from: intent.walletAddress,
    to: intent.treasuryAddress,
    amount: BigInt(intent.amountUsdc),
    usdcContract: intent.usdcContract,
  });

  const priorEvent = (await db.$queryRawUnsafe(
    `SELECT id FROM on_chain_payment_events
      WHERE chain_id = $1 AND tx_hash = $2 AND log_index = $3
      LIMIT 1;`,
    intent.chainId,
    transfer.txHash,
    transfer.logIndex,
  )) as { id: string }[];

  const paymentRef = `crypto:${transfer.txHash}`;

  if (priorEvent.length === 0) {
    await db.$executeRawUnsafe(
      `INSERT INTO on_chain_payment_events
        (id, chain_id, tx_hash, log_index, intent_id, org_id, amount_usdc, from_address, to_address)
       VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, $5, $6, $7, $8);`,
      intent.chainId,
      transfer.txHash,
      transfer.logIndex,
      intentId,
      orgId,
      transfer.value.toString(),
      transfer.from,
      transfer.to,
    );
  }

  await db.$executeRawUnsafe(
    `UPDATE crypto_payment_intents
        SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP, tx_hash = $2
      WHERE id = $1;`,
    intentId,
    transfer.txHash,
  );

  const { applyCryptoPrepaidPlan } = await import('@/domain/billing/crypto-plan-service');
  const result = await applyCryptoPrepaidPlan(
    orgId,
    { planId: intent.planId, months: intent.prepaidMonths, paymentRef },
    db,
  );

  return {
    orgId,
    planId: intent.planId,
    prepaidMonths: intent.prepaidMonths,
    intentId,
    txHash: transfer.txHash,
    alreadyApplied: result.alreadyApplied,
    creditsGranted: result.creditsGranted,
    periodEnd: result.periodEnd,
    subscription: {
      planId: result.subscription.planId,
      status: result.subscription.status,
      currentPeriodEnd: result.subscription.currentPeriodEnd,
    },
  };
}

/** @internal — tests inject a mock public client. */
export { getPublicClient };
