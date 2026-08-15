#!/usr/bin/env node
/* global console, process, Buffer, fetch, URL, URLSearchParams */
/**
 * Google OAuth Sync — CLI (cron-able)
 *
 * Fetches the CURRENT OAuth client data from Google (pure SDK — REST via a
 * service account JSON) and writes it back into the tenant config, fixing
 * saved-config inconsistencies. Optionally PATCHes the GCP client to register
 * missing app redirect URIs (requires roles/oauthconfig.editor).
 *
 * Usage:
 *   node scripts/google-oauth-sync.mjs --slug=redrubybali [--patch] [--sa=path/to/sa.json]
 *
 * Service account resolution (first match wins):
 *   1. --sa=path/to/sa.json
 *   2. env GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON
 *   3. root DB secrets table key "GOOGLE_CLOUD_SERVICE_ACCOUNT" (--secrets)
 *
 * DB: POSTGRES_URL from .env.local or env.
 *
 * Cron example (every 6 hours — avoid "star-slash" inside the comment):
 *   0 0,6,12,18 * * * cd /Users/iliashapiro/RedRuby-FPA/tokenizmyapp && \
 *     node scripts/google-oauth-sync.mjs --slug=redrubybali --patch >> /tmp/google-oauth-sync.log 2>&1
 *
 * Exit codes: 0 = ok, 1 = error, 2 = api unavailable (no SA access)
 */
import { readFileSync, existsSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { Client } from 'pg';

// ── Args ──────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);

const slug = String(args.slug || process.env.TENANT_SLUG || 'redrubybali');
const doPatch = !!args.patch;
const useSecrets = !!args.secrets;

// ── Env (.env.local) ──────────────────────────────────────────
function loadEnvFile() {
  const p = new URL('../.env.local', import.meta.url);
  if (!existsSync(p)) return {};
  const out = {};
  const lines = readFileSync(p, 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let value = m[2];
    if (value.startsWith('"')) {
      value = value.slice(1);
      if (!value.endsWith('"')) {
        // Multi-line quoted value (e.g. service-account JSON)
        const parts = [value];
        i++;
        while (i < lines.length && !lines[i].trimEnd().endsWith('"')) {
          parts.push(lines[i]);
          i++;
        }
        if (i < lines.length) parts.push(lines[i].replace(/"$/, ''));
        value = parts.join('\n');
      } else {
        value = value.slice(0, -1);
      }
    }
    out[m[1]] = value;
  }
  return out;
}
const env = { ...loadEnvFile(), ...process.env };
const dbUrl = env.POSTGRES_URL;
if (!dbUrl) { console.error('POSTGRES_URL not found'); process.exit(1); }

// ── Service account resolution ────────────────────────────────
async function resolveServiceAccount() {
  if (typeof args.sa === 'string' && existsSync(args.sa)) {
    return JSON.parse(readFileSync(args.sa, 'utf8'));
  }
  if (env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON);
  }
  if (useSecrets) {
    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    const res = await client.query(`SELECT encrypted_value, iv, auth_tag FROM secrets WHERE key_name='GOOGLE_CLOUD_SERVICE_ACCOUNT'`);
    await client.end();
    if (res.rows.length > 0) {
      console.error('Secrets-table SA is AES-encrypted — decrypt requires ENCRYPTION_KEY; use --sa=path/to/sa.json instead.');
      return null;
    }
  }
  return null;
}

// ── Google SDK helpers (pure REST) ────────────────────────────
const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const payload = `${b64(header)}.${b64(claims)}`;
  const sign = createSign('RSA-SHA256');
  sign.update(payload);
  const signature = sign.sign(sa.private_key, 'base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${payload}.${signature}` }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(data).slice(0, 200)}`);
  return data.access_token;
}

async function fetchClientInfo(token, clientId, projectId) {
  const projRes = await fetch(`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!projRes.ok) throw new Error(`Project lookup failed (${projRes.status}) — SA has no access to project "${projectId}"`);
  const proj = await projRes.json();
  const res = await fetch(`https://oauth2.googleapis.com/v1/projects/${encodeURIComponent(proj.projectNumber || projectId)}/oauthClients/${encodeURIComponent(clientId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`OAuth client fetch failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  const client = await res.json();
  return { projectNumber: proj.projectNumber, redirectUris: client.redirectUris || [], displayName: client.displayName };
}

async function patchClient(token, clientId, projectId, projectNumber, redirectUris) {
  const res = await fetch(
    `https://oauth2.googleapis.com/v1/projects/${encodeURIComponent(projectNumber || projectId)}/oauthClients/${encodeURIComponent(clientId)}?updateMask=redirectUris`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ redirectUris }),
    },
  );
  if (!res.ok) throw new Error(`Client PATCH failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  return true;
}

// ── Main ──────────────────────────────────────────────────────
const sa = await resolveServiceAccount();
if (!sa) {
  console.error(`[oauth-sync] No service account available. Pass --sa=path/to/sa.json or set GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON.`);
  process.exit(2);
}
console.log(`[oauth-sync] SA: ${sa.client_email} (project ${sa.project_id})`);

const db = new Client({ connectionString: dbUrl });
await db.connect();

const tenantRes = await db.query(`SELECT metadata FROM tenants WHERE slug=$1`, [slug]);
if (tenantRes.rows.length === 0) { console.error(`[oauth-sync] Tenant "${slug}" not found`); process.exit(1); }
const meta = tenantRes.rows[0].metadata;

const savedGoogle = meta?.config?.googleAuth;
const clientId = savedGoogle?.clientId || env.GOOGLE_CLIENT_ID;
const projectId = savedGoogle?.projectId || env.GOOGLE_PROJECT_ID;
if (!clientId || !projectId) { console.error('[oauth-sync] No client configured'); process.exit(1); }

// Known URIs: tenant + all apps
const known = new Set(Array.isArray(savedGoogle?.redirectUris) ? savedGoogle.redirectUris : []);
for (const app of meta?.config?.appPack?.apps || []) {
  for (const u of app.config?.googleAuth?.redirectUris || []) known.add(u);
}

try {
const token = await getAccessToken(sa);
const info = await fetchClientInfo(token, clientId, projectId);
console.log(`[oauth-sync] LIVE from GCP (${info.displayName || clientId}): ${info.redirectUris.length} URIs`);

const merged = [...new Set([...info.redirectUris, ...known])];
const added = merged.filter((u) => !info.redirectUris.includes(u));

let patched = false;
if (doPatch && added.length > 0) {
  patched = await patchClient(token, clientId, projectId, info.projectNumber, merged);
  console.log(`[oauth-sync] PATCHED client: +${added.length} URIs registered in GCP`);
} else if (added.length > 0) {
  console.log(`[oauth-sync] ${added.length} URIs missing in GCP (use --patch to register):`);
  for (const u of added) console.log(`  - ${u}`);
}

// Write back to DB
meta.config.googleAuth.redirectUris = merged;
for (const app of meta.config.appPack?.apps || []) {
  if (app.config?.googleAuth) app.config.googleAuth.redirectUris = merged;
}
await db.query(`UPDATE tenants SET metadata=$1 WHERE slug=$2`, [JSON.stringify(meta), slug]);
console.log(`[oauth-sync] Wrote ${merged.length} URIs back to tenant + app configs`);

await db.end();
console.log(`[oauth-sync] DONE (source: google-api, patched: ${patched})`);
process.exit(0);
} catch (err) {
  console.error(`[oauth-sync] ERROR: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
