/**
 * Tenant Configuration — local to tokenizmyapp.
 *
 * Centralized tenant identity — reads from environment variables with
 * fallback to defaults. Used by server components, API routes, and
 * client components to create a generic, multi-tenant application.
 *
 * Environment Variables:
 *   NEXT_PUBLIC_TENANT_SLUG         — subdomain slug (e.g. "redrubybali")
 *   NEXT_PUBLIC_TENANT_DISPLAY_NAME — display name (e.g. "Red Ruby Bali")
 *   NEXT_PUBLIC_TENANT_DESCRIPTION  — app description / tagline
 *   NEXT_PUBLIC_TENANT_APP_TITLE    — HTML <title> — defaults to displayName if not explicitly set
 *   NEXT_PUBLIC_APP_URL             — canonical app URL (overrides slug-based derivation)
 *   NEXT_PUBLIC_APP_ID              — suite-mode app id (e.g. "hr", "sales") this
 *                                      specific Vercel deployment serves; unset/empty
 *                                      for single-app tenants and the tenant's own hub.
 */

/** Default values when no tenant env vars are set. */
export const DEFAULT_TENANT = {
  slug: 'tokenizmyapp' as const,
  displayName: 'Tokeniz My App' as const,
  description: 'Business operations dashboard' as const,
  appTitle: 'Tokeniz My App' as const,
};

/**
 * Resolve tenant config from environment variables.
 * Server-safe — only reads process.env, no DB calls.
 * NEXT_PUBLIC_* env vars are replaced at build time, so they are
 * available on both server and client. Do NOT use typeof window
 * guards here — 'use client' components run SSR on the server,
 * and the typeof window check produces different values between
 * the server render and client hydration, causing React #418.
 */
export function getTenantConfig(): {
  slug: string;
  displayName: string;
  description: string;
  appTitle: string;
} {
  const slug = process.env.NEXT_PUBLIC_TENANT_SLUG?.trim() || DEFAULT_TENANT.slug;
  const displayName = process.env.NEXT_PUBLIC_TENANT_DISPLAY_NAME?.trim() || DEFAULT_TENANT.displayName;
  const description = process.env.NEXT_PUBLIC_TENANT_DESCRIPTION?.trim() || `${displayName} ${DEFAULT_TENANT.description}`;
  const appTitle = process.env.NEXT_PUBLIC_TENANT_APP_TITLE?.trim() || displayName;

  return { slug, displayName, description, appTitle };
}

/**
 * Is this deployment the platform's own admin console, rather than a tenant app?
 *
 * The console runs the same codebase as every app it provisions, so a handful
 * of surfaces differ between them — the console sells the product, a tenant app
 * runs a business. Keyed on the slug because it is stamped on every deployment
 * and is the same value the platform uses to identify itself elsewhere.
 */
export function isPlatformApp(): boolean {
  const slug = process.env.NEXT_PUBLIC_TENANT_SLUG?.trim() || DEFAULT_TENANT.slug;
  return slug === DEFAULT_TENANT.slug;
}

/**
 * Resolve this deployment's own suite-mode app id, e.g. "hr" or "sales-reporting".
 * Empty string for single-app tenants and the tenant's own hub deployment —
 * the same "no app scope" sentinel used throughout the business-data tables
 * (FinancialProjection, Task, DailyZReport, etc.) and admin routes.
 */
export function getCurrentAppId(): string {
  return process.env.NEXT_PUBLIC_APP_ID?.trim() || '';
}

/**
 * Build a greeter string for AI prompts, chat, etc.
 * E.g. "Tokeniz My App AI" or "Red Ruby AI"
 */
export function getAssistantName(): string {
  const { displayName } = getTenantConfig();
  return `${displayName} AI`;
}