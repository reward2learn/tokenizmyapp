/**
 * Tenant-scoped self-serve billing — lets signed-in users on a deployed tenant
 * app purchase AI credit top-ups (not plan changes).
 *
 * Stored in tenant metadata.config.stripe.selfServeBilling and pushed to Vercel
 * as SELF_SERVE_BILLING_ENABLED / NEXT_PUBLIC_SELF_SERVE_BILLING on Save.
 */
export interface SelfServeBillingConfig {
  /** Allow non-admin tenant-app users to buy AI credit packs. */
  enabled: boolean;
}

export function parseSelfServeBillingConfig(raw: unknown): SelfServeBillingConfig {
  const obj = (raw ?? {}) as Record<string, unknown>;
  return { enabled: obj.enabled === true };
}

/** Server-side: read the flag pushed to the tenant deployment. */
export function isSelfServeBillingEnabledFromEnv(): boolean {
  return (
    process.env.SELF_SERVE_BILLING_ENABLED === 'true'
    || process.env.NEXT_PUBLIC_SELF_SERVE_BILLING === 'true'
  );
}

/** Client-safe: NEXT_PUBLIC_ is inlined at build time on tenant deployments. */
export function isSelfServeBillingEnabledOnClient(): boolean {
  return process.env.NEXT_PUBLIC_SELF_SERVE_BILLING === 'true';
}
