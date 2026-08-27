/**
 * People helpers — billing seats vs app users stay separate.
 *
 * Billing seats = org_members on the platform DB (plan / credits access).
 * App users = tenant user_accounts (+ PIN secret + security groups).
 * Invites only provision app access (PIN viewer). They do not grant a billing seat.
 */
import { randomInt } from 'node:crypto';
import { PrismaClient } from '@/generated/prisma';
import { createRawClient, createClient, type DbClient } from '@/lib/db';
import { setSecret } from '@/lib/secrets';
import { sendResendEmail } from '@/lib/email/resend';
import { resolveDedicatedTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import { addTenantColumnsIfMissing } from '@/domain/tenant/tenant-seed-service';
import {
  getOrganization,
  listOrgMembers,
} from '@/domain/billing/organization-service';
import { buildViewerInviteEmail } from '@/domain/billing/viewer-invite-email';

export type OrgTenantRef = { slug: string; displayName: string };

export type MemberCandidate = {
  sub: string;
  email: string | null;
  name: string | null;
  tenantSlug: string;
  tier: string;
  /** True when this sub is already an org member. */
  alreadyMember: boolean;
};

type PlatformDb = ReturnType<typeof createRawClient>;

type SqlDb = {
  $queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
  $executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<unknown>;
};

async function openTenantDb(tenantSlug: string): Promise<{
  db: SqlDb;
  dedicated: boolean;
  secretDb: DbClient;
  disconnect: () => Promise<void>;
}> {
  const dbUrl = await resolveDedicatedTenantDbUrl(tenantSlug, null);
  if (dbUrl) {
    const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    await addTenantColumnsIfMissing(prisma as never);
    return {
      db: prisma as unknown as SqlDb,
      dedicated: true,
      secretDb: prisma as unknown as DbClient,
      disconnect: () => prisma.$disconnect().catch(() => {}),
    };
  }
  const raw = createRawClient();
  await addTenantColumnsIfMissing(raw as never);
  return {
    db: raw as unknown as SqlDb,
    dedicated: false,
    secretDb: createClient(),
    disconnect: async () => {},
  };
}

/** Tenants billed by this organization (platform root DB). */
export async function listOrgTenants(db: PlatformDb, orgId: string): Promise<OrgTenantRef[]> {
  const rows = (await db.$queryRawUnsafe(
    `SELECT slug, display_name
       FROM tenants
      WHERE organization_id = $1
      ORDER BY slug ASC;`,
    orgId,
  )) as { slug: string; display_name: string }[];
  return rows.map((r) => ({ slug: r.slug, displayName: r.display_name }));
}

/**
 * Users already set up on tenants owned by this org.
 * Used by Billing seats (picker) and App users (directory).
 * Walks each tenant DB (dedicated or shared) and de-dupes by sub.
 */
export async function listMemberCandidates(
  platformDb: PlatformDb,
  orgId: string,
): Promise<{ tenants: OrgTenantRef[]; candidates: MemberCandidate[] }> {
  const tenants = await listOrgTenants(platformDb, orgId);
  const members = await listOrgMembers(platformDb, orgId);
  const memberSubs = new Set(members.map((m) => m.userId));

  const bySub = new Map<string, MemberCandidate>();

  for (const tenant of tenants) {
    const { db, disconnect } = await openTenantDb(tenant.slug);
    try {
      const rows = (await db.$queryRawUnsafe(
        `SELECT sub, email, name, tier, tenant_slug
           FROM user_accounts
          WHERE is_active = true
            AND (tenant_slug = $1 OR tenant_slug IS NULL)
          ORDER BY COALESCE(name, email, sub) ASC
          LIMIT 200;`,
        tenant.slug,
      )) as {
        sub: string;
        email: string | null;
        name: string | null;
        tier: string;
        tenant_slug: string | null;
      }[];

      for (const row of rows) {
        const sub = row.sub;
        if (!sub || bySub.has(sub)) continue;
        bySub.set(sub, {
          sub,
          email: row.email,
          name: row.name,
          tenantSlug: row.tenant_slug ?? tenant.slug,
          tier: row.tier,
          alreadyMember: memberSubs.has(sub),
        });
      }
    } catch (err) {
      console.warn(
        `[org-teammate-invite] list users for ${tenant.slug} failed:`,
        err instanceof Error ? err.message : err,
      );
    } finally {
      await disconnect();
    }
  }

  return {
    tenants,
    candidates: Array.from(bySub.values()).sort((a, b) =>
      (a.name || a.email || a.sub).localeCompare(b.name || b.email || b.sub),
    ),
  };
}

/** Default 6-digit numeric PIN. */
export function generateViewerInvitePin(): string {
  return String(randomInt(100_000, 1_000_000));
}

export type InviteAppUserInput = {
  orgId: string;
  email: string;
  tenantSlug: string;
  name?: string | null;
  appBaseUrl?: string | null;
};

export type InviteAppUserResult = {
  sub: string;
  tenantSlug: string;
  emailSent: boolean;
  createdUser: boolean;
};

/** @deprecated Use InviteAppUserInput — invites are app access only. */
export type InviteTeammateInput = InviteAppUserInput;

/** @deprecated Use InviteAppUserResult. */
export type InviteTeammateResult = InviteAppUserResult;

/**
 * Invite an app user by email (tenant data plane only):
 * 1. Ensure PIN-tier user_accounts row on the tenant DB (viewer group)
 * 2. Store USER_PIN_<sub> on that same DB
 * 3. Email the one-time PIN
 *
 * Does NOT add an org billing seat — use addOrgMember / Billing seats for that.
 */
export async function inviteAppUserByEmail(
  platformDb: PlatformDb,
  input: InviteAppUserInput,
): Promise<InviteAppUserResult> {
  const email = input.email.trim().toLowerCase();
  const org = await getOrganization(platformDb, input.orgId);
  if (!org) throw new Error('Organization not found');

  const tenants = await listOrgTenants(platformDb, input.orgId);
  const tenant = tenants.find((t) => t.slug === input.tenantSlug);
  if (!tenant) throw new Error('Tenant is not part of this organization');

  const sub = email;
  const name = input.name?.trim() || email.split('@')[0] || email;
  const pin = generateViewerInvitePin();

  const { db, secretDb, disconnect } = await openTenantDb(tenant.slug);
  let createdUser = false;
  try {
    const existing = (await db.$queryRawUnsafe(
      `SELECT id FROM user_accounts WHERE sub = $1 LIMIT 1;`,
      sub,
    )) as { id: string }[];

    let userId: string;
    if (existing[0]?.id) {
      userId = existing[0].id;
      await db.$executeRawUnsafe(
        `UPDATE user_accounts
            SET email = $1,
                name = COALESCE($2, name),
                tier = 'pin',
                is_active = true,
                tenant_slug = COALESCE(tenant_slug, $3),
                updated_at = CURRENT_TIMESTAMP
          WHERE id = $4;`,
        email,
        name,
        tenant.slug,
        userId,
      );
    } else {
      createdUser = true;
      const inserted = (await db.$queryRawUnsafe(
        `INSERT INTO user_accounts
           (id, sub, email, name, tier, role_code, is_active, tenant_slug, created_at, updated_at)
         VALUES
           (gen_random_uuid()::TEXT, $1, $2, $3, 'pin', NULL, true, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id;`,
        sub,
        email,
        name,
        tenant.slug,
      )) as { id: string }[];
      userId = inserted[0]?.id;
      if (!userId) throw new Error('Failed to create user account');
    }

    // App access as viewer (read-only security group) — not an org billing role.
    await db.$executeRawUnsafe(`DELETE FROM user_groups WHERE user_id = $1;`, userId);
    await db.$executeRawUnsafe(
      `INSERT INTO user_groups (id, user_id, group_id)
       SELECT gen_random_uuid()::TEXT, $1, sg.id
         FROM security_groups sg
        WHERE sg.code = 'viewer'
       ON CONFLICT (user_id, group_id) DO NOTHING;`,
      userId,
    );

    await setSecret(`USER_PIN_${sub}`, pin, secretDb);
  } finally {
    await disconnect();
  }

  const mail = buildViewerInviteEmail({
    toEmail: email,
    inviteeName: name,
    organizationName: org.displayName,
    tenantDisplayName: tenant.displayName,
    pin,
    appBaseUrl: input.appBaseUrl ?? null,
  });

  const emailSent = await sendResendEmail({
    to: email,
    subject: mail.subject,
    text: mail.text,
  });

  return { sub, tenantSlug: tenant.slug, emailSent, createdUser };
}

/** @deprecated Use inviteAppUserByEmail. */
export async function inviteTeammateByEmail(
  platformDb: PlatformDb,
  input: InviteAppUserInput,
): Promise<InviteAppUserResult> {
  return inviteAppUserByEmail(platformDb, input);
}
