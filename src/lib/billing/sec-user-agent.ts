/**
 * Pure helpers for SEC EDGAR User-Agent strings (AI Credits Calculator).
 * Safe for client + server — no DB or Vercel imports.
 *
 * The contact fragment is identification for SEC fair-access, not a mailbox.
 */

/** Default display name when none is selected (factory pattern). */
export const DEFAULT_SEC_ORG_DISPLAY_NAME = 'TokenizMyApp';

export const SEC_USER_AGENT_ENV_KEY = 'SEC_USER_AGENT';

/**
 * Sanitize a name for use inside an HTTP User-Agent string.
 * Strips quotes/newlines/control chars; collapses whitespace.
 */
export function sanitizeSecUserAgentName(raw: string): string {
  return raw
    .replace(/["'`\r\n\t\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build `SEC_USER_AGENT` value for a tenant.
 * Prefers organization display name when provided; otherwise tenant display /
 * TokenizMyApp for the factory slug.
 */
export function buildSecUserAgent(opts: {
  tenantSlug: string;
  organizationName?: string | null;
  tenantDisplayName?: string | null;
}): string {
  const slug = opts.tenantSlug.trim().toLowerCase();
  const fromOrg = sanitizeSecUserAgentName(opts.organizationName ?? '');
  const fromTenant = sanitizeSecUserAgentName(opts.tenantDisplayName ?? '');
  let name = fromOrg || fromTenant;
  if (!name) {
    name = slug === 'tokenizmyapp' ? DEFAULT_SEC_ORG_DISPLAY_NAME : slug;
  }
  return `${name} AI Credits Calculator admin@${slug}.com`;
}
