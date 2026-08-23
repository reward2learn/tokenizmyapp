/**
 * Backfill personal ownership on credit grants from Stripe purchaser metadata.
 *
 * Usage (from tokenizmyapp/):
 *   bun run scripts/backfill-topup-grant-owners.ts
 *   bun run scripts/backfill-topup-grant-owners.ts --org-id=org_abc
 *   bun run scripts/backfill-topup-grant-owners.ts --apply
 *
 * Default is dry-run. Pass --apply to write owner_user_id on matching grants.
 *
 * Requires POSTGRES_URL (or PLATFORM_POSTGRES_URL on tenant control-plane reads)
 * and the org's Stripe secret (tenant metadata or env).
 */
import { createBillingRawClient } from '../src/lib/db';
import { backfillTopUpGrantOwners } from '../src/domain/billing/backfill-topup-grant-owners';

function readArg(prefix: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`${prefix}=`));
  return hit ? hit.slice(prefix.length + 1).trim() : undefined;
}

async function main(): Promise<void> {
  if (!process.env.POSTGRES_URL && !process.env.PLATFORM_POSTGRES_URL) {
    console.error('[backfill-topup-owners] POSTGRES_URL is not set.');
    process.exit(1);
  }

  const orgId = readArg('--org-id');
  const apply = process.argv.includes('--apply');

  const db = createBillingRawClient();
  const result = await backfillTopUpGrantOwners(db, { orgId, apply });

  console.log(
    `[backfill-topup-owners] mode=${apply ? 'apply' : 'dry-run'}` +
      `${orgId ? ` org=${orgId}` : ''}`,
  );
  console.log(`  orgs scanned:        ${result.scannedOrgs}`);
  console.log(`  payment refs:        ${result.scannedPaymentRefs}`);
  console.log(`  grants ${apply ? 'tagged' : 'would tag'}: ${result.taggedGrants}`);
  console.log(`  skipped (no metadata): ${result.skippedNoMetadata}`);
  console.log(`  skipped (no Stripe):   ${result.skippedNoStripe}`);

  for (const message of result.errors) {
    console.warn(`  ⚠ ${message}`);
  }

  if (!apply && result.taggedGrants > 0) {
    console.log('\nRe-run with --apply to persist changes.');
  }
}

main().catch((err) => {
  console.error('[backfill-topup-owners] Failed:', err);
  process.exit(1);
});
