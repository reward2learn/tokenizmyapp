/**
 * Billing organization identity stamped onto tenant / suite-app deployments.
 *
 * The factory stores `tenants.organization_id` (e.g. the Pro org that paid $99).
 * Suite apps deploy with NEXT_PUBLIC_TENANT_SLUG = `${tenant}-${appId}`, which
 * does not match the tenants registry row, so they cannot resolve the payer by
 * slug alone. ORGANIZATION_ID is the stable pointer; Seed All Apps / env push
 * must propagate it (and PLATFORM_POSTGRES_URL) to every associated app.
 */

export const ORGANIZATION_ID_ENV = 'ORGANIZATION_ID';
export const PUBLIC_ORGANIZATION_ID_ENV = 'NEXT_PUBLIC_ORGANIZATION_ID';
export const PLATFORM_POSTGRES_URL_ENV = 'PLATFORM_POSTGRES_URL';

/** Server-side: org that pays for this deployment, when stamped at deploy/seed. */
export function getOrganizationIdFromEnv(): string | null {
  const id =
    process.env.ORGANIZATION_ID?.trim()
    || process.env.NEXT_PUBLIC_ORGANIZATION_ID?.trim()
    || '';
  return id || null;
}

/** Client-safe stamp (inlined at build time on tenant deployments). */
export function getPublicOrganizationIdFromEnv(): string | null {
  const id = process.env.NEXT_PUBLIC_ORGANIZATION_ID?.trim() || '';
  return id || null;
}

/** Env map fragment to push onto a Vercel project for a tenant's billing org. */
export function billingIdentityEnvVars(orgId: string): Record<string, string> {
  const trimmed = orgId.trim();
  if (!trimmed) return {};

  const vars: Record<string, string> = {
    [ORGANIZATION_ID_ENV]: trimmed,
    [PUBLIC_ORGANIZATION_ID_ENV]: trimmed,
  };

  // Factory process URL — tenant apps need the control-plane DB for plan/credits.
  const platformUrl =
    process.env.PLATFORM_POSTGRES_URL?.trim()
    || process.env.POSTGRES_URL?.trim()
    || process.env.DATABASE_URL?.trim()
    || '';
  if (platformUrl) {
    vars[PLATFORM_POSTGRES_URL_ENV] = platformUrl;
  }

  return vars;
}
