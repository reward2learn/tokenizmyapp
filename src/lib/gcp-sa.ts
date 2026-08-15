/**
 * Google Cloud Service Account Resolution — Multi-Tenant
 *
 * Resolution order (first match wins):
 *   1. GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON__{SLUG_UPPER}  (project-scoped, per-tenant)
 *   2. GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON                (generic/factory SA)
 *   3. CLI --sa=path argument (runtime override)
 *
 * Usage in Next.js app:
 *   import { getTenantGoogleSa, getTenantAccessToken } from '@/lib/gcp-sa'
 *
 *   // For a specific tenant (e.g., "redrubybali")
 *   const sa = getTenantGoogleSa('redrubybali')
 *   const token = await getTenantAccessToken('redrubybali', scopes)
 *
 *   // For the default/root tenant ("tokenizmyapp")
 *   const sa = getTenantGoogleSa()  // falls back to generic SA
 */

// ── SA Resolution ──────────────────────────────────────────────
function getTenantGoogleSa(slug?: string): any {
  // 1. Project-scoped: GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON__{SLUG_UPPER}
  const suffix = (slug || 'tokenizmyapp')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
  const projectScoped = process.env[`GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON_${suffix}`]
  if (projectScoped) {
    return JSON.parse(projectScoped)
  }

  // 2. Generic/factory SA
  const generic = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON
  if (generic) {
    return JSON.parse(generic)
  }

  // 3. Fallback — no SA available
  throw new Error(
    `No Google service account found. Set GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON__{SLUG} or GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON in environment.`,
  )
}

// ── Token Generation ───────────────────────────────────────────
function b64(obj: unknown): string {
  const raw = Buffer.from(JSON.stringify(obj)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return raw
}

async function getAccessToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }
  const payload = `${b64(header)}.${b64(claims)}`
  const sign = createSign('RSA-SHA256')
  sign.update(payload)
  const signature = sign.sign(sa.private_key, 'base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${payload}.${signature}`,
    }),
  })
  const data = await res.json()
  if (!data.access_token) {
    throw new Error(`Token exchange failed: ${JSON.stringify(data).slice(0, 200)}`)
  }
  return data.access_token
}

// ── Public API ─────────────────────────────────────────────────
/**
 * Resolve the service account JSON for the given tenant slug.
 * Checks project-scoped env var first, then falls back to generic SA.
 * @param slug - Tenant slug (e.g., 'redrubybali', 'tokenizmyapp')
 *   If undefined, uses the current tenant from context or falls back to generic SA.
 */
export function getTenantSa(slug?: string): any {
  return getTenantGoogleSa(slug)
}

/**
 * Get an access token using the tenant's service account.
 * @param slug - Tenant slug. If undefined, uses the current tenant's SA.
 * @param scopes - OAuth scopes (default: cloud-platform)
 */
export async function getTenantAccessToken(
  slug?: string,
  scopes: string = 'https://www.googleapis.com/auth/cloud-platform',
): Promise<string> {
  const sa = getTenantGoogleSa(slug)
  // Override the scope if different from default
  sa._scopes = scopes
  return getAccessToken(sa)
}

/**
 * Fetch project info from GCP using the tenant's service account.
 * @param slug - Tenant slug
 * @param clientId - OAuth client ID
 * @param projectId - GCP project ID
 */
export async function fetchGcpProjectInfo(
  slug: string,
  clientId: string,
  projectId: string,
): Promise<{ projectNumber: string; redirectUris: string[]; displayName: string }> {
  const sa = getTenantGoogleSa(slug)
  const token = await getAccessToken(sa)

  // Fetch project number
  const projRes = await fetch(
    `https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!projRes.ok) {
    throw new Error(`Project lookup failed (${projRes.status}) — SA has no access to project "${projectId}"`)
  }
  const proj = await projRes.json()

  // Fetch OAuth client info
  const clientRes = await fetch(
    `https://oauth2.googleapis.com/v1/projects/${encodeURIComponent(proj.projectNumber || projectId)}/oauthClients/${encodeURIComponent(clientId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!clientRes.ok) {
    throw new Error(`OAuth client fetch failed (${clientRes.status})`)
  }
  const client = await clientRes.json()

  return {
    projectNumber: proj.projectNumber,
    redirectUris: client.redirectUris || [],
    displayName: client.displayName,
  }
}