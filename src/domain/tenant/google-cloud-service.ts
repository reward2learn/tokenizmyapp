/**
 * Google Cloud Automation Service
 *
 * Provisions Google Cloud OAuth 2.0 credentials for tenants automatically.
 *
 * Two strategies (tried in order):
 *   STRATEGY_A: Google REST APIs via service account (works everywhere — Vercel, CI, local)
 *   STRATEGY_B: gcloud CLI (local dev, when gcloud is authenticated)
 *   STRATEGY_C: Pre-configured env var fallback (simplest — use GOOGLE_CLIENT_* env vars)
 *
 * Prerequisites (Strategy A):
 *   - A "parent" Google Cloud project (set via GOOGLE_CLOUD_PROJECT_ID)
 *   - A service account with roles/oauthconfig.editor + roles/cloudplatform.serviceAgent
 *     stored in secrets table as key "GOOGLE_CLOUD_SERVICE_ACCOUNT" or env var
 *     GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON
 *
 * Strategy B uses your local gcloud auth (run `gcloud auth login` once).
 * Strategy C uses the existing per-platform GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET env vars.
 */
import { execSync } from 'node:child_process';
import { getSecretPlaintext } from '@/lib/secrets';

// ── Types ──────────────────────────────────────────────────────

export interface GoogleOAuthClientResult {
  clientId: string;
  clientSecret: string;
  projectId: string;
  projectName: string;
  redirectUris: string[];
  clientEmail?: string; // Tenant admin email used for consent screen
  authUri: string;
  tokenUri: string;
  /** The raw client_secret JSON (for download / store-google-oauth). */
  clientSecretJson: string;
  /** Which strategy produced the result. */
  strategy: 'rest-api' | 'gcloud-cli' | 'env-fallback' | 'pre-existing';
  /** True when the existing client's redirect URIs were updated via the Google API. */
  apiUpdated?: boolean;
}

export interface GoogleProjectResult {
  projectId: string;
  projectNumber: string;
  displayName: string;
}

export interface TenantGoogleConfig {
  slug: string;
  displayName: string;
  redirectUris: string[];
  adminEmail: string;
  logoPath?: string;
}

/**
 * An already-saved Google OAuth client (e.g. from the tenant's metadata.config.googleAuth).
 * When provided, provisioning uses this client instead of creating/falling back —
 * the redirect URIs are merged and (when API access exists) updated in GCP.
 */
export interface ExistingOAuthConfig {
  clientId: string;
  clientSecret: string;
  projectId: string;
  authUri?: string;
  tokenUri?: string;
  redirectUris?: string[];
}

// ── Config ─────────────────────────────────────────────────────

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/auth';

/**
 * Full Google OAuth provisioning — primary entry point.
 * Tries strategies in order: A → B → C
 */
export async function provisionGoogleOAuth(
  config: TenantGoogleConfig,
  existingConfig?: ExistingOAuthConfig,
): Promise<GoogleOAuthClientResult> {
  const { slug, displayName, redirectUris, adminEmail } = config;

  console.log(`[google-cloud] Provisioning OAuth for tenant "${slug}" (${displayName})`);

  // ── Strategy 0: Tenant's existing saved client ──────────
  if (existingConfig?.clientId && existingConfig?.clientSecret) {
    const mergedUris = [...new Set([...(existingConfig.redirectUris || []), ...redirectUris])];
    console.log(`[google-cloud] Using existing tenant client ${existingConfig.clientId} (project ${existingConfig.projectId}) — ${mergedUris.length} redirect URIs`);

    // Best-effort: register the merged URIs in GCP when API access exists
    let apiUpdated = false;
    if (existingConfig.projectId) {
      apiUpdated = await updateGoogleOAuthClientRedirectUris(
        existingConfig.clientId,
        existingConfig.projectId,
        mergedUris,
      );
    }

    const clientSecretJson = buildClientSecretJson(
      {
        client_id: existingConfig.clientId,
        client_secret: existingConfig.clientSecret,
        display_name: displayName,
        redirect_uris: mergedUris,
      },
      existingConfig.projectId,
    );

    return {
      clientId: existingConfig.clientId,
      clientSecret: existingConfig.clientSecret,
      projectId: existingConfig.projectId,
      projectName: displayName,
      redirectUris: mergedUris,
      clientEmail: adminEmail,
      authUri: existingConfig.authUri || OAUTH_AUTH_URL,
      tokenUri: existingConfig.tokenUri || OAUTH_TOKEN_URL,
      clientSecretJson,
      strategy: 'pre-existing',
      apiUpdated,
    };
  }

  // ── Strategy A: REST API via Service Account ─────────────
  const saResult = await tryStrategyServiceAccount(config);
  if (saResult) {
    console.log(`[google-cloud] Strategy A (REST API) succeeded for "${slug}"`);
    return saResult;
  }

  // ── Strategy B: gcloud CLI ──────────────────────────────
  const gcloudResult = tryStrategyGcloud(config);
  if (gcloudResult) {
    console.log(`[google-cloud] Strategy B (gcloud CLI) succeeded for "${slug}"`);
    return gcloudResult;
  }

  // ── Strategy C: Pre-existing env vars ──────────────────
  const envResult = envVarFallback(config);
  if (envResult) {
    console.log(`[google-cloud] Strategy C (env fallback) — returning existing GOOGLE_CLIENT_* for "${slug}"`);
    return envResult;
  }

  throw new Error(
    `[google-cloud] All OAuth provisioning strategies failed for "${slug}".\n` +
    `  To fix:\n` +
    `  1. Install gcloud CLI and run: gcloud auth login\n` +
    `  2. OR set up a service account: docs/tutorials/google-cloud-service-account.md\n` +
    `  3. OR manually create OAuth credentials in Google Cloud Console and set GOOGLE_CLIENT_* env vars.\n` +
    `  See: docs/knowledge-base/tenant-google-oauth-setup.md`,
  );
}

// ── Strategy A: REST API via Service Account ─────────────────

/**
 * Normalize a GCP project ID into an env/secret key suffix:
 * "redruby-fpa" -> "REDRUBY_FPA"
 */
function projectKeySuffix(projectId: string): string {
  return projectId.toUpperCase().replace(/[^A-Z0-9]/g, '_');
}

/**
 * Get a Google Cloud access token from a service account.
 * The service account JSON can come from (project-scoped first when a
 * projectId is given, so multiple projects can each have their own SA):
 *   1. secrets table key "GOOGLE_CLOUD_SERVICE_ACCOUNT__{PROJECT}" (e.g.
 *      GOOGLE_CLOUD_SERVICE_ACCOUNT__REDRUBY_FPA)
 *   2. env var GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON__{PROJECT}
 *   3. secrets table key "GOOGLE_CLOUD_SERVICE_ACCOUNT" (generic)
 *   4. env var GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON (generic)
 *
 * Returns null if no service account is configured.
 */
async function getServiceAccountToken(projectId?: string): Promise<{ accessToken: string; projectId: string } | null> {
  let saJson: string | null = null;
  let source = 'none';

  const suffix = projectId ? projectKeySuffix(projectId) : null;

  // 1. Project-scoped secrets table key
  if (suffix) {
    try {
      saJson = await getSecretPlaintext(`GOOGLE_CLOUD_SERVICE_ACCOUNT__${suffix}`);
      if (saJson) source = `secrets_table__${suffix}`;
    } catch {
      // Secret might not exist — fall through
    }
  }

  // 2. Project-scoped env var
  if (!saJson && suffix) {
    saJson = process.env[`GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON__${suffix}`] ?? null;
    if (saJson) source = `env_var__${suffix}`;
  }

  // 3. Generic secrets table key
  if (!saJson) {
    try {
      saJson = await getSecretPlaintext('GOOGLE_CLOUD_SERVICE_ACCOUNT');
      if (saJson) source = 'secrets_table';
    } catch {
      // Secret might not exist — fall through
    }
  }

  // 4. Generic env var
  if (!saJson) {
    saJson = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON ?? null;
    if (saJson) source = 'env_var';
  }

  if (!saJson) {
    console.warn('[google-cloud] No service account found in secrets table or env var');
    return null;
  }

  console.log(`[google-cloud] Using service account from source: ${source} (${saJson.length} chars)`);

  try {
    const sa = JSON.parse(saJson) as {
      client_email: string;
      private_key: string;
      project_id: string;
    };

    // Create JWT assertion for OAuth2 token
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: OAUTH_TOKEN_URL,
      exp: now + 3600,
      iat: now,
    };

    // Use base64 with manual url-safe conversion for compatibility
    const b64 = (obj: Record<string, unknown>): string =>
      Buffer.from(JSON.stringify(obj))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const payload = `${b64(header)}.${b64(claims)}`;

    // Sign with the service account's private key
    const crypto = await import('node:crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(payload);
    const signature = sign.sign(sa.private_key, 'base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const jwt = `${payload}.${signature}`;

    // Exchange JWT for access token
    console.log(`[google-cloud] Exchanging JWT for access token (key_length=${sa.private_key.length})...`);
    const tokenRes = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text().catch(() => '');
      console.error(`[google-cloud] Service account token exchange FAILED: ${tokenRes.status} ${errText.slice(0, 300)}`);
      return null;
    }

    const tokenText = await tokenRes.text();
    let tokenData: { access_token?: string; scope?: string; token_type?: string; expires_in?: number };
    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      console.error(`[google-cloud] Token response is not JSON: ${tokenText.slice(0, 300)}`);
      return null;
    }
    console.log(`[google-cloud] Token response: access_token=${tokenData.access_token ? '***' + tokenData.access_token.slice(-10) : 'UNDEFINED'}, type=${tokenData.token_type}, expires_in=${tokenData.expires_in}s, scope="${tokenData.scope || '(not returned)'}"`);
    if (!tokenData.access_token) {
      console.error(`[google-cloud] Full token response: ${JSON.stringify(tokenData).slice(0, 500)}`);
      return null;
    }

    // Test the token by listing projects
    try {
      const testRes = await fetch('https://cloudresourcemanager.googleapis.com/v1/projects?pageSize=1', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (testRes.ok) {
        console.log(`[google-cloud] Token VALID for Cloud Resource Manager API`);
      } else {
        const errText = await testRes.text().catch(() => '');
        console.error(`[google-cloud] Token REJECTED by Cloud Resource Manager: ${testRes.status} ${errText.slice(0, 200)}`);
      }
    } catch (testErr) {
      console.warn(`[google-cloud] Token test error: ${testErr instanceof Error ? testErr.message : String(testErr)}`);
    }

    return { accessToken: tokenData.access_token, projectId: sa.project_id };
  } catch (err) {
    console.warn('[google-cloud] Service account auth failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Try provisioning via Google Cloud REST APIs + service account.
 */
async function tryStrategyServiceAccount(
  config: TenantGoogleConfig,
): Promise<GoogleOAuthClientResult | null> {
  const auth = await getServiceAccountToken();
  if (!auth) return null;

  const { slug, displayName, redirectUris, adminEmail } = config;
  const parentProjectId = process.env.GOOGLE_CLOUD_PROJECT_ID || auth.projectId;

  console.log(`[google-cloud] Using REST API with parent project: ${parentProjectId}`);

  try {
    // 1. Create a unique project for this tenant (optional — can share parent)
    const projectId = `tenant-${slug}`.replace(/[^a-z0-9-]/g, '-').slice(0, 30);
    let tenantProjectId = parentProjectId;

    if (process.env.GOOGLE_CLOUD_CREATE_PROJECTS === 'true') {
      try {
        console.log(`[google-cloud] Creating project "${projectId}"...`);
        const project = await createProject(auth.accessToken, projectId, displayName);
        tenantProjectId = project.projectId;
        console.log(`[google-cloud] Project created: ${tenantProjectId}`);
      } catch (projErr) {
        console.warn(`[google-cloud] Project creation failed:`, projErr instanceof Error ? projErr.message : String(projErr));
        tenantProjectId = parentProjectId;
      }
    } else {
      console.log(`[google-cloud] Skipping project creation (GOOGLE_CLOUD_CREATE_PROJECTS != 'true'), using parent: ${parentProjectId}`);
    }

    // 2. Enable the OAuth 2.0 API on the project
    console.log(`[google-cloud] Enabling OAuth API on project ${tenantProjectId}...`);
    await enableOAuthApi(auth.accessToken, tenantProjectId);
    console.log(`[google-cloud] OAuth API enabled`);

    // 3. Configure OAuth consent screen
    console.log(`[google-cloud] Configuring consent screen for ${displayName}...`);
    await configureConsentScreen(auth.accessToken, tenantProjectId, {
      displayName,
      supportEmail: adminEmail,
      logoPath: config.logoPath,
    });
    console.log(`[google-cloud] Consent screen configured`);

    // 4. Create OAuth 2.0 Web client
    let client: GcpOAuthClientResponse | null = null;
    try {
      console.log(`[google-cloud] Creating OAuth client for ${slug}...`);
      client = await createOAuthClient(auth.accessToken, tenantProjectId, {
        displayName: `${displayName} (${slug})`,
        redirectUris,
      });
      console.log(`[google-cloud] OAuth client created: ${client.client_id}`);
    } catch (clientErr) {
      console.warn(`[google-cloud] OAuth client creation failed (non-fatal):`, clientErr instanceof Error ? clientErr.message : String(clientErr));
      console.warn(`[google-cloud] User must create OAuth client manually via GCP Console.`);
    }

    // 5. Build the client_secret JSON (if client was created)
    if (client) {
      const clientSecretJson = buildClientSecretJson(client, tenantProjectId);
      return {
        clientId: client.client_id,
        clientSecret: client.client_secret,
        projectId: tenantProjectId,
        projectName: displayName,
        redirectUris,
        clientEmail: adminEmail,
        authUri: OAUTH_AUTH_URL,
        tokenUri: OAUTH_TOKEN_URL,
        clientSecretJson,
        strategy: 'rest-api',
      };
    }

    // Partial success: project + consent screen configured, but OAuth client needs manual creation
    console.log(`[google-cloud] Partial success for "${slug}": project=${tenantProjectId}, consent screen configured. OAuth client needs manual creation.`);
    return null;
  } catch (err) {
    console.error('[google-cloud] REST API strategy failed at:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

// ── REST API Helpers ─────────────────────────────────────────

interface GcpOAuthClientResponse {
  client_id: string;
  client_secret: string;
  display_name: string;
  redirect_uris: string[];
}

/**
 * Create a Google Cloud project.
 */
async function createProject(
  accessToken: string,
  projectId: string,
  displayName: string,
): Promise<GoogleProjectResult> {
  const res = await fetch('https://cloudresourcemanager.googleapis.com/v1/projects', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId,
      name: displayName,
      labels: {
        managed_by: 'tokenizmyapp',
        tenant: projectId,
        created_by: 'provision-tenant',
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    // 409 means project already exists — that's fine
    if (res.status === 409) {
      return { projectId, projectNumber: '', displayName };
    }
    throw new Error(`createProject failed: ${res.status} ${errText.slice(0, 300)}`);
  }

  const data = await res.json() as { name: string; projectNumber: string };
  return { projectId, projectNumber: data.projectNumber, displayName };
}

/**
 * Enable the OAuth 2.0 API on a project.
 */
async function enableOAuthApi(accessToken: string, projectId: string): Promise<void> {
  const url = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/oauth2.googleapis.com:enable`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 409) {
    // 409 = already enabled, ignore
    const errText = await res.text().catch(() => '');
    console.warn(`[google-cloud] enableOAuthApi returned ${res.status} (non-fatal): ${errText.slice(0, 200)}`);
  }
}

/**
 * Configure the OAuth consent screen (branding).
 */
async function configureConsentScreen(
  accessToken: string,
  projectId: string,
  config: { displayName: string; supportEmail: string; logoPath?: string },
): Promise<void> {
  // This uses the OAuth 2.0 Vendor API to set up the consent screen
  const url = `https://oauth2.googleapis.com/v2/oauth-clients/${projectId}/brand`;

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationTitle: config.displayName,
        supportEmail: config.supportEmail,
        termsOfServiceUrl: `https://${projectId}.vercel.app/terms-of-service`,
        privacyPolicyUrl: `https://${projectId}.vercel.app/privacy-policy`,
      }),
    });

    if (!res.ok && res.status !== 404 && res.status !== 409) {
      const errText = await res.text().catch(() => '');
      console.warn(`[google-cloud] Consent screen config returned ${res.status}: ${errText.slice(0, 200)}`);
    }
  } catch (err) {
    // Non-fatal — consent screen can be configured manually
    console.warn('[google-cloud] Consent screen config failed (non-fatal):', err instanceof Error ? err.message : err);
  }
}

/**
 * Create an OAuth 2.0 Web client via the Google OAuth API.
 * Uses the OAuth2 Vendor API (documented in GCP Identity Platform docs).
 */
async function createOAuthClient(
  accessToken: string,
  projectId: string,
  config: { displayName: string; redirectUris: string[] },
): Promise<GcpOAuthClientResponse> {
  // The OAuth 2.0 Client API endpoint
  const url = `https://oauth2.googleapis.com/v2/oauth-clients?projectId=${projectId}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      displayName: config.displayName,
      type: 'WEB_APPLICATION',
      redirectUris: config.redirectUris,
      javascriptOrigins: config.redirectUris.map((u) => {
        try {
          const parsed = new URL(u);
          return `${parsed.protocol}//${parsed.host}`;
        } catch {
          return u;
        }
      }).filter((v, i, a) => a.indexOf(v) === i), // deduplicate
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    if (res.status === 409) {
      console.warn('[google-cloud] OAuth client already exists (409)');
      const existing = await listOAuthClients(accessToken, projectId);
      if (existing) {
        // Client exists but may have old redirect URIs — update them
        try {
          console.log('[google-cloud] Updating existing OAuth client redirect URIs...');
          const updated = await updateOAuthClientRedirectUris(accessToken, projectId, existing.client_id, config.redirectUris);
          console.log('[google-cloud] OAuth client redirect URIs updated:', updated.redirect_uris);
          return updated;
        } catch (updateErr) {
          console.warn('[google-cloud] Failed to update existing OAuth client, returning as-is:', updateErr instanceof Error ? updateErr.message : String(updateErr));
          return existing;
        }
      }
    }
    console.warn(`[google-cloud] createOAuthClient returned ${res.status} (non-fatal): ${errText.slice(0, 300)}`);
    throw new Error(`createOAuthClient failed: ${res.status}`);
  }

  const data = await res.json() as GcpOAuthClientResponse;
  return data;
}

/**
 * List OAuth clients for a project and return the first WEB_APPLICATION type.
 */
async function listOAuthClients(
  accessToken: string,
  projectId: string,
): Promise<GcpOAuthClientResponse | null> {
  const url = `https://oauth2.googleapis.com/v2/oauth-clients?projectId=${projectId}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return null;

  const data = await res.json() as { clients?: GcpOAuthClientResponse[] };
  return data.clients?.find((c) => c.redirect_uris?.length) ?? null;
}

/**
 * Update the redirect URIs on an existing OAuth 2.0 client.
 * Uses PATCH /v2/oauth-clients/{clientId} to add/modify redirect URIs.
 */
export async function updateOAuthClientRedirectUris(
  accessToken: string,
  projectId: string,
  clientId: string,
  redirectUris: string[],
): Promise<GcpOAuthClientResponse> {
  const url = `https://oauth2.googleapis.com/v2/oauth-clients/${encodeURIComponent(clientId)}?projectId=${encodeURIComponent(projectId)}`;
  
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      redirectUris,
      javascriptOrigins: redirectUris.map((u) => {
        try { const p = new URL(u); return `${p.protocol}//${p.host}`; }
        catch { return u; }
      }).filter((v, i, a) => a.indexOf(v) === i),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Failed to update OAuth client: ${res.status} ${errText.slice(0, 300)}`);
  }

  return res.json() as Promise<GcpOAuthClientResponse>;
}

/**
 * Build the client_secret JSON (same format as Google Cloud Console download).
 */
function buildClientSecretJson(
  client: GcpOAuthClientResponse,
  projectId: string,
): string {
  return JSON.stringify({
    web: {
      client_id: client.client_id,
      project_id: projectId,
      auth_uri: OAUTH_AUTH_URL,
      token_uri: OAUTH_TOKEN_URL,
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_secret: client.client_secret,
      redirect_uris: client.redirect_uris ?? [],
      javascript_origins: client.redirect_uris?.map((u) => {
        try {
          return new URL(u).origin;
        } catch {
          return u;
        }
      }) ?? [],
    },
  }, null, 2);
}

/**
 * Upload a branding logo to the OAuth consent screen.
 * The logo must be a square PNG/JPG, max 1MB, 120x120px recommended.
 */
export async function uploadOAuthLogo(
  imageBase64: string,
  mimeType: string,
): Promise<boolean> {
  const auth = await getServiceAccountToken();
  if (!auth) {
    console.warn('[google-cloud] Cannot upload logo — no service account configured');
    return false;
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || auth.projectId;
  const url = `https://oauth2.googleapis.com/v2/oauth-clients/${projectId}/brand/logo`;

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': mimeType,
      },
      body: Buffer.from(imageBase64, 'base64'),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[google-cloud] Logo upload failed: ${res.status} ${errText.slice(0, 200)}`);
      return false;
    }

    console.log('[google-cloud] Logo uploaded successfully to OAuth consent screen');
    return true;
  } catch (err) {
    console.warn('[google-cloud] Logo upload error:', err instanceof Error ? err.message : err);
    return false;
  }
}

// ── Strategy B: gcloud CLI ──────────────────────────────────

function tryStrategyGcloud(config: TenantGoogleConfig): GoogleOAuthClientResult | null {
  const { slug, displayName, redirectUris, adminEmail } = config;

  try {
    // Check if gcloud is available
    execSync('gcloud --version', { stdio: 'pipe', timeout: 5000 });
  } catch {
    return null; // gcloud not available
  }

  try {
    // Check if user is authenticated
    const account = execSync(
      'gcloud config list account --format="value(core.account)" 2>/dev/null',
      { stdio: 'pipe', timeout: 5000, encoding: 'utf8' },
    ).toString().trim();

    if (!account) {
      console.warn('[google-cloud] gcloud CLI found but not authenticated. Run: gcloud auth login');
      return null;
    }

    // Build a unique project ID
    const projectId = `tenant-${slug}`.replace(/[^a-z0-9-]/g, '-').slice(0, 30);
    console.log(`[google-cloud] gcloud strategy for "${slug}" using account: ${account}`);

    // Create project (try, fail gracefully if exists)
    try {
      execSync(
        `gcloud projects create ${projectId} --name="${displayName}" --labels=managed_by=tokenizmyapp,tenant=${projectId} --format=json`,
        { stdio: 'pipe', timeout: 30000 },
      );
      console.log(`[google-cloud] Created GCP project: ${projectId}`);
    } catch (projErr) {
      // Project may already exist or user may not have project creation permission
      console.warn('[google-cloud] Project creation (may already exist):',
        (projErr as { stderr?: Buffer }).stderr?.toString('utf8').slice(0, 200));
    }

    // Enable OAuth API
    try {
      execSync(
        `gcloud services enable oauth2.googleapis.com --project=${projectId}`,
        { stdio: 'pipe', timeout: 30000 },
      );
    } catch {
      console.warn(`[google-cloud] Could not enable OAuth API on ${projectId}`);
    }

    // Create the OAuth client
    const redirectArg = redirectUris.map((u) => `--redirect-uris="${u}"`).join(' ');
    const clientJson = execSync(
      `gcloud alpha identity oauth-client create "${displayName} (${slug})" ` +
      `--project=${projectId} ` +
      `--display-name="${displayName} (${slug})" ` +
      `--type=web ` +
      `${redirectArg} ` +
      `--support-email="${adminEmail}" ` +
      `--format=json 2>/dev/null`,
      { stdio: 'pipe', timeout: 30000, encoding: 'utf8' },
    ).toString();

    const parsed = JSON.parse(clientJson) as {
      clientId?: string;
      clientSecret?: string;
      name?: string;
    };

    if (!parsed.clientId || !parsed.clientSecret) {
      throw new Error('gcloud created OAuth client but response missing clientId/secret');
    }

    const clientSecretJson = buildClientSecretJson(
      { client_id: parsed.clientId, client_secret: parsed.clientSecret, display_name: displayName, redirect_uris: redirectUris },
      projectId,
    );

    return {
      clientId: parsed.clientId,
      clientSecret: parsed.clientSecret,
      projectId,
      projectName: displayName,
      redirectUris,
      clientEmail: adminEmail,
      authUri: OAUTH_AUTH_URL,
      tokenUri: OAUTH_TOKEN_URL,
      clientSecretJson,
      strategy: 'gcloud-cli',
    };
  } catch (err) {
    console.warn('[google-cloud] gcloud strategy failed:', (err as Error).message);
    return null;
  }
}

// ── Strategy C: Env fallback ─────────────────────────────────

function envVarFallback(config: TenantGoogleConfig): GoogleOAuthClientResult | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const projectId = process.env.GOOGLE_PROJECT_ID || 'shared-oauth-project';

  if (!clientId || !clientSecret) return null;

  const clientSecretJson = buildClientSecretJson(
    { client_id: clientId, client_secret: clientSecret, display_name: config.displayName, redirect_uris: config.redirectUris },
    projectId,
  );

  return {
    clientId,
    clientSecret,
    projectId,
    projectName: config.displayName,
    redirectUris: config.redirectUris,
    clientEmail: config.adminEmail,
    authUri: process.env.GOOGLE_AUTH_URI || OAUTH_AUTH_URL,
    tokenUri: process.env.GOOGLE_TOKEN_URI || OAUTH_TOKEN_URL,
    clientSecretJson,
    strategy: 'env-fallback',
  };
}

// ── Access token: SDK (service account) OR CLI (gcloud) ─────

export interface GoogleAccessToken {
  accessToken: string;
  projectId: string;
  source: 'service-account' | 'gcloud';
}

/**
 * Resolve a Google Cloud access token using whichever capability is available:
 *   1. Service account (secrets table "GOOGLE_CLOUD_SERVICE_ACCOUNT" or env
 *      GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON) — works everywhere (Vercel, CI, local)
 *   2. gcloud CLI (local dev, when installed + authenticated)
 * Returns null when neither is available.
 */
export async function getGoogleAccessToken(projectId?: string): Promise<GoogleAccessToken | null> {
  // 1. Service account (pure SDK path) — project-scoped when projectId given
  const sa = await getServiceAccountToken(projectId);
  if (sa) return { ...sa, source: 'service-account' };

  // 2. gcloud CLI path
  try {
    execSync('gcloud --version', { stdio: 'pipe', timeout: 5000 });
    const token = execSync('gcloud auth print-access-token', { stdio: 'pipe', timeout: 15000, encoding: 'utf8' }).toString().trim();
    if (token) {
      let projectId = 'unknown';
      try {
        projectId = execSync('gcloud config get-value project 2>/dev/null', { stdio: 'pipe', timeout: 5000, encoding: 'utf8' }).toString().trim() || 'unknown';
      } catch { /* keep default */ }
      console.log('[google-cloud] Using gcloud CLI access token');
      return { accessToken: token, projectId, source: 'gcloud' };
    }
  } catch {
    // gcloud not installed or not authenticated
  }
  return null;
}

// ── Google OAuth Client Info (REST API fetch/update) ─────────

export interface GoogleOAuthClientInfo {
  clientId: string;
  projectId: string;
  projectNumber?: string;
  displayName?: string;
  redirectUris: string[];
  source: 'google-api' | 'saved-config';
  fetchedAt: string;
}

/**
 * Fetch the CURRENT OAuth client data (redirect URIs, display name) from Google
 * via the OAuth 2.0 API:
 *   GET https://oauth2.googleapis.com/v1/projects/{projectNumber}/oauthClients/{clientId}
 * Requires a service account with roles/oauthconfig.editor on the project
 * (secrets table key "GOOGLE_CLOUD_SERVICE_ACCOUNT" or env GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON).
 * Returns null when no API access is available.
 */
export async function fetchGoogleOAuthClientInfo(
  clientId: string,
  projectId: string,
): Promise<GoogleOAuthClientInfo | null> {
  const auth = await getGoogleAccessToken(projectId);
  if (!auth) {
    console.warn(`[google-cloud] Cannot fetch client info for ${clientId}: no service account or gcloud auth available`);
    return null;
  }

  try {
    // Resolve project number (required by the oauthClients endpoint)
    const projRes = await fetch(
      `https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`,
      { headers: { Authorization: `Bearer ${auth.accessToken}` } },
    );
    if (!projRes.ok) {
      console.warn(`[google-cloud] Project lookup failed for ${projectId}: ${projRes.status}`);
      return null;
    }
    const proj = (await projRes.json()) as { projectNumber?: string; projectId?: string; name?: string };

    const res = await fetch(
      `https://oauth2.googleapis.com/v1/projects/${encodeURIComponent(proj.projectNumber || projectId)}/oauthClients/${encodeURIComponent(clientId)}`,
      { headers: { Authorization: `Bearer ${auth.accessToken}` } },
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[google-cloud] OAuth client fetch failed for ${clientId}: ${res.status} ${errText.slice(0, 200)}`);
      return null;
    }
    const client = (await res.json()) as { clientId?: string; displayName?: string; redirectUris?: string[] };

    return {
      clientId: client.clientId || clientId,
      projectId,
      projectNumber: proj.projectNumber,
      displayName: client.displayName,
      redirectUris: client.redirectUris || [],
      source: 'google-api',
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[google-cloud] Client info fetch error:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

/**
 * Best-effort update of an existing OAuth client's redirect URIs via the OAuth 2.0 API:
 *   PATCH https://oauth2.googleapis.com/v1/projects/{projectNumber}/oauthClients/{clientId}?updateMask=redirectUris
 * Requires a service account with roles/oauthconfig.editor on the project.
 * Returns true when the PATCH succeeded.
 */
export async function updateGoogleOAuthClientRedirectUris(
  clientId: string,
  projectId: string,
  redirectUris: string[],
): Promise<boolean> {
  const auth = await getGoogleAccessToken(projectId);
  if (!auth) {
    console.warn(`[google-cloud] Cannot update ${clientId}: no service account or gcloud auth available — register URIs manually in GCP Console`);
    return false;
  }

  try {
    const projRes = await fetch(
      `https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`,
      { headers: { Authorization: `Bearer ${auth.accessToken}` } },
    );
    if (!projRes.ok) return false;
    const proj = (await projRes.json()) as { projectNumber?: string };

    const res = await fetch(
      `https://oauth2.googleapis.com/v1/projects/${encodeURIComponent(proj.projectNumber || projectId)}/oauthClients/${encodeURIComponent(clientId)}?updateMask=redirectUris`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ redirectUris }),
      },
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[google-cloud] OAuth client update failed for ${clientId}: ${res.status} ${errText.slice(0, 200)}`);
      return false;
    }
    console.log(`[google-cloud] OAuth client ${clientId} redirect URIs updated via API (${redirectUris.length} URIs)`);
    return true;
  } catch (err) {
    console.warn('[google-cloud] OAuth client update error:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

// ── Formatting ────────────────────────────────────────────────

/**
 * Pretty-print the OAuth credentials for terminal output.
 */
export function formatGoogleOAuthResult(result: GoogleOAuthClientResult): string {
  return `
╔══════════════════════════════════════════════════════════════╗
║          Google Cloud OAuth — Provisioned                     ║
╚══════════════════════════════════════════════════════════════╝

  Strategy:      ${result.strategy}
  Project ID:    ${result.projectId}
  Project Name:  ${result.projectName}
  Admin Email:   ${result.clientEmail || '(not set)'}
  Redirect URIs: ${result.redirectUris.join(', ')}

  ┌─ OAuth Credentials ──────────────────────────────────┐
  │  GOOGLE_CLIENT_ID=${result.clientId}
  │  GOOGLE_CLIENT_SECRET=${result.clientSecret}
  │  GOOGLE_PROJECT_ID=${result.projectId}
  │  GOOGLE_AUTH_URI=${result.authUri}
  │  GOOGLE_TOKEN_URI=${result.tokenUri}
  └────────────────────────────────────────────────────────┘

  Client Secret JSON saved to: Google/client_secret_${result.projectId}.json
`;
}

/**
 * Save the client_secret JSON to the Google/ directory.
 */
export async function saveClientSecretJson(result: GoogleOAuthClientResult): Promise<string> {
  // Use tmpdir on Vercel, local path in development
  const { tmpdir } = await import('node:os');
  const { writeFile, mkdir } = await import('node:fs/promises');
  const { existsSync } = await import('node:fs');
  const { join } = await import('node:path');

  const isVercel = !!process.env.VERCEL;
  const baseDir = isVercel ? tmpdir() : process.cwd();
  const googleDir = join(baseDir, isVercel ? 'tenant-oauth' : 'Google');

  if (!existsSync(googleDir)) {
    await mkdir(googleDir, { recursive: true });
  }

  const filePath = join(googleDir, `client_secret_${result.projectId}.json`);
  await writeFile(filePath, result.clientSecretJson, 'utf8');
  console.log(`[google-cloud] Saved client_secret to ${filePath}`);
  return filePath;
}

/**
 * Cleanup Google OAuth credentials for a deleted tenant.
 * Idempotent stub — actual deletion of OAuth clients via Google API is complex
 * and often skipped for compliance/audit reasons (clients can be manually revoked).
 * Logs the action following project conventions.
 */
export async function deleteGoogleOAuthCredentials(
  clientId: string,
  projectId: string
): Promise<void> {
  console.log(`[google-cloud] Cleaning up OAuth credentials for client ${clientId} (project: ${projectId})`);

  try {
    // In a full implementation this would call Google OAuth API to delete the client
    // or revoke tokens. For safety, we treat this as non-destructive for now.
    console.log(`[google-cloud] OAuth credentials cleanup completed for ${projectId} (idempotent stub)`);
  } catch (err) {
    console.warn(`[google-cloud] OAuth cleanup warning for ${projectId}:`, err);
    // Do not throw — cleanup should be best-effort
  }
}

// ── Suite Mode: Per-App OAuth Provisioning ─────────────

/**
 * Provision Google OAuth for every app in a suite and persist per-app rows.
 *
 * Each app gets its own google_oauth_config row keyed by
 * "default:{appId}" so the tenant-level singleton (id='default') is not
 * polluted with the last app's credentials — critical because all apps on
 * the same deployment share the DB.
 */
export interface GoogleOAuthPerAppResult {
  appId: string;
  /** Full OAuth credentials for this app (same shape as provisionGoogleOAuth result). */
  oauth: GoogleOAuthClientResult;
  /** Per-app row ID used in google_oauth_config (e.g. "default:myapp"). */
  configId: string;
  /** Whether the DB store step succeeded. */
  stored: boolean;
}

export async function provisionGoogleOAuthPerApp(
  tenantSlug: string,
  appId: string,
  appName: string,
  redirectUris: string[],
): Promise<GoogleOAuthPerAppResult> {
  const config = {
    slug: `${tenantSlug}-${appId}`,
    displayName: appName,
    redirectUris,
    adminEmail: 'reward2learn@gmail.com', // default — configurable later
  };

  const oauth = await provisionGoogleOAuth(config);

  // Per-app row key: "default:{appId}" — avoids leaking parent tenant's OAuth client.
  const configId = `default:${appId}`;

  try {
    const { encrypt } = await import('@/lib/crypto');
    const { createClient } = await import('@/lib/db');
    const db = createClient();

    const encryptedSecret = encrypt(oauth.clientSecret);
    await (db as unknown as { googleOAuthConfig: { upsert: (args: unknown) => Promise<unknown> } }).googleOAuthConfig.upsert({
      where: { id: configId },
      create: {
        id: configId,
        clientId: oauth.clientId,
        projectId: oauth.projectId,
        authUri: oauth.authUri,
        tokenUri: oauth.tokenUri,
        encryptedSecret: encryptedSecret.encrypted,
        iv: encryptedSecret.iv,
        authTag: encryptedSecret.authTag,
      },
      update: {
        clientId: oauth.clientId,
        projectId: oauth.projectId,
        authUri: oauth.authUri,
        tokenUri: oauth.tokenUri,
        encryptedSecret: encryptedSecret.encrypted,
        iv: encryptedSecret.iv,
        authTag: encryptedSecret.authTag,
      },
    });

    return { appId, oauth, configId, stored: true };
  } catch (err) {
    console.warn(`[google-cloud] Per-app DB store failed for "${appId}":`, err instanceof Error ? err.message : String(err));
    return { appId, oauth, configId, stored: false };
  }
}
