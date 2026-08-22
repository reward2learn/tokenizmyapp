/**
 * Vercel Marketplace Stripe — install/connect helpers on top of manual key push.
 *
 * Stripe on the Marketplace provisions STRIPE_SECRET_KEY +
 * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY onto connected Vercel projects via OAuth
 * (sandbox or imported live account). Manual key push remains as a fallback.
 *
 * Docs: https://vercel.com/docs/integrations/ecommerce/stripe
 */

import {
  getVercelClient,
  resolveBearerToken,
  VERCEL_API,
  TEAM_ID,
  withTeamId404Null,
} from '@/domain/tenant/vercel-sdk-client';

export const STRIPE_MARKETPLACE_SLUG = 'stripe';

/** Env keys the Marketplace Stripe integration provisions (names only). */
export const STRIPE_MARKETPLACE_ENV_KEYS = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
] as const;

/** Primary env key for Dashboard snapshot whsec_ (avoids Stripe Marketplace STRIPE_* collision). */
export const TOKENIZ_SNAPSHOT_WHSEC_KEY = 'TOKENIZ_SNAPSHOT_WHSEC';

/** Legacy + primary keys for snapshot destination signing secret. */
export const SNAPSHOT_WEBHOOK_SECRET_ENV_KEYS = [
  TOKENIZ_SNAPSHOT_WHSEC_KEY,
  'STRIPE_SNAPSHOT_WEBHOOK_SECRET',
] as const;

/** Extra keys we may still push manually (not always Marketplace-provisioned). */
export const STRIPE_MANUAL_ENV_KEYS = [
  'STRIPE_WEBHOOK_SECRET',
  TOKENIZ_SNAPSHOT_WHSEC_KEY,
  /** @deprecated use TOKENIZ_SNAPSHOT_WHSEC_KEY */
  'STRIPE_SNAPSHOT_WEBHOOK_SECRET',
] as const;

export type StripeMarketplaceStatus = {
  projectId: string | null;
  projectName: string | null;
  /** Open this to Install / Import Stripe on the team. */
  installUrl: string;
  /** Open this to Connect the project to an existing Stripe installation. */
  projectIntegrationsUrl: string | null;
  /** True when STRIPE_SECRET_KEY is present on the Vercel project. */
  secretKeyPresent: boolean;
  publishableKeyPresent: boolean;
  webhookSecretPresent: boolean;
  /** Best-effort: marketplace install exists on the team. */
  teamInstallationId: string | null;
  teamInstallationStatus: string | null;
  /** How keys appear to have landed on the project. */
  source: 'marketplace' | 'manual_or_mixed' | 'none' | 'unknown';
  /** Env key names present (never values). */
  envKeyNames: string[];
  note?: string;
};

function appendTeam(url: string): string {
  if (!TEAM_ID) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}teamId=${encodeURIComponent(TEAM_ID)}`;
}

/** Marketplace install / open URL (browser OAuth / sandbox claim). */
export function buildStripeMarketplaceInstallUrl(): string {
  // Official Marketplace product page — Install / Import Existing Account.
  return 'https://vercel.com/marketplace/stripe';
}

/** Deep link into the project's Integrations tab (Connect Project). */
export function buildProjectIntegrationsUrl(projectIdOrName: string): string {
  // Project settings → Integrations; user clicks Connect on Stripe.
  return `https://vercel.com/${encodeURIComponent(projectIdOrName)}/settings/integrations`;
}

async function vercelGet<T>(path: string): Promise<T> {
  const bearer = await resolveBearerToken();
  const res = await fetch(appendTeam(`${VERCEL_API}${path}`), {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Vercel GET ${path} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

type EnvRow = { key: string; id?: string; type?: string; target?: string[]; value?: string; integrationId?: string | null; updatedAt?: number };

export type WebhookSecretEnvDiagnostic = {
  entryCount: number;
  selectedPrefix: 'whsec' | 'eyJ' | 'other' | 'missing';
  duplicateKinds: Array<'whsec' | 'eyJ' | 'other'>;
  /** Env row ids (for support — not secret values). */
  entryIds: string[];
};

function classifySecretPrefix(value: string): 'whsec' | 'eyJ' | 'other' {
  const v = value.trim();
  if (v.startsWith('whsec_')) return 'whsec';
  if (isVercelEncryptedEnvEnvelope(v)) return 'whsec';
  if (v.startsWith('eyJ')) return 'eyJ';
  return 'other';
}

/**
 * Vercel `type: encrypted` env values appear in the API as base64 `{"v":"v2","c":"…"}` blobs.
 * Runtime decrypts them to the original whsec_ value — do not confuse with Marketplace JWTs.
 */
export function isVercelEncryptedEnvEnvelope(value: string): boolean {
  const v = value.trim();
  if (!v.startsWith('eyJ')) return false;
  try {
    const json = JSON.parse(Buffer.from(v, 'base64url').toString('utf8')) as { v?: string; c?: string };
    return json.v === 'v2' && typeof json.c === 'string';
  } catch {
    return false;
  }
}

/** Stripe Marketplace integration token on STRIPE_WEBHOOK_SECRET (JWT, not Vercel envelope). */
export function isStripeMarketplaceIntegrationToken(value: string): boolean {
  const v = value.trim();
  if (!v.startsWith('eyJ') || isVercelEncryptedEnvEnvelope(v)) return false;
  return v.split('.').length >= 2;
}

/**
 * When multiple STRIPE_WEBHOOK_SECRET rows exist (Marketplace JWT + manual whsec_),
 * Vercel may expose both. Prefer whsec_ for production billing verification.
 */
function pickEnvValue(envs: EnvRow[], key: string): string | null {
  const matching = envs.filter((e) => e.key === key && e.value?.trim());
  if (matching.length === 0) return null;

  if (key === 'STRIPE_WEBHOOK_SECRET') {
    const whsecRows = matching.filter((e) => e.value!.trim().startsWith('whsec_'));
    if (whsecRows.length > 0) {
      const production = whsecRows.find((e) => e.target?.includes('production'));
      return (production ?? whsecRows[0]).value!.trim();
    }
  }

  if (SNAPSHOT_WEBHOOK_SECRET_ENV_KEYS.includes(key as typeof SNAPSHOT_WEBHOOK_SECRET_ENV_KEYS[number])) {
    const whsecRows = matching.filter((e) => classifySecretPrefix(e.value!) === 'whsec');
    if (whsecRows.length > 0) {
      const production = whsecRows.find((e) => e.target?.includes('production'));
      return (production ?? whsecRows[0]).value!.trim();
    }
  }

  const production = matching.find((e) => e.target?.includes('production'));
  return (production ?? matching[0]).value!.trim();
}

/** List decrypted env rows for one key (server-only). */
export async function listProjectEnvRowsForKey(
  projectId: string,
  key: string,
): Promise<EnvRow[]> {
  const bearer = await resolveBearerToken();
  const res = await fetch(
    appendTeam(
      `${VERCEL_API}/v9/projects/${encodeURIComponent(projectId)}/env?decrypted=true`,
    ),
    { headers: { Authorization: `Bearer ${bearer}` } },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Vercel env read failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { envs?: EnvRow[] };
  return (data.envs ?? []).filter((e) => e.key === key && e.value?.trim());
}

export async function diagnoseWebhookSecretEnv(projectId: string): Promise<WebhookSecretEnvDiagnostic> {
  const rows = await listProjectEnvRowsForKey(projectId, 'STRIPE_WEBHOOK_SECRET');
  if (rows.length === 0) {
    return { entryCount: 0, selectedPrefix: 'missing', duplicateKinds: [], entryIds: [] };
  }
  const kinds = rows.map((r) => classifySecretPrefix(r.value!));
  const selected = pickEnvValue(rows, 'STRIPE_WEBHOOK_SECRET');
  return {
    entryCount: rows.length,
    selectedPrefix: selected ? classifySecretPrefix(selected) : 'missing',
    duplicateKinds: [...new Set(kinds)],
    entryIds: rows.map((r) => r.id).filter(Boolean) as string[],
  };
}

/** Remove STRIPE_WEBHOOK_SECRET rows whose value is a Marketplace JWT (eyJ…). */
export async function purgeMarketplaceWebhookSecrets(projectId: string): Promise<number> {
  const rows = await listProjectEnvRowsForKey(projectId, 'STRIPE_WEBHOOK_SECRET');
  const junk = rows.filter((r) => isStripeMarketplaceIntegrationToken(r.value!) && r.id);
  if (junk.length === 0) return 0;

  let removed = 0;
  for (const row of junk) {
    if (await deleteProjectEnvRow(projectId, row.id!)) removed += 1;
  }
  return removed;
}

export async function deleteProjectEnvRow(projectId: string, envId: string): Promise<boolean> {
  const bearer = await resolveBearerToken();
  const res = await fetch(
    appendTeam(
      `${VERCEL_API}/v9/projects/${encodeURIComponent(projectId)}/env/${encodeURIComponent(envId)}`,
    ),
    { method: 'DELETE', headers: { Authorization: `Bearer ${bearer}` } },
  );
  return res.ok;
}

/** Delete every STRIPE_WEBHOOK_SECRET row on a project (Marketplace or manual). */
export async function deleteAllWebhookSecretEnvRows(projectId: string): Promise<number> {
  const rows = await listProjectEnvRowsForKey(projectId, 'STRIPE_WEBHOOK_SECRET');
  let removed = 0;
  for (const row of rows) {
    if (row.id && (await deleteProjectEnvRow(projectId, row.id))) removed += 1;
  }
  return removed;
}

/**
 * Replace webhook signing secret on a Vercel project.
 *
 * Marketplace integrations often own STRIPE_WEBHOOK_SECRET with an eyJ… JWT that
 * cannot be overwritten. We always push whsec_ to TOKENIZ_SNAPSHOT_WHSEC
 * (app runtime prefers it) and still attempt to purge/replace STRIPE_WEBHOOK_SECRET.
 */
export async function replaceStripeWebhookSecretOnProject(
  projectId: string,
  whsec: string,
): Promise<{ deleted: number; created: boolean; verifyPrefix: 'whsec' | 'eyJ' | 'other' | 'missing' }> {
  const value = whsec.trim();
  if (!value.startsWith('whsec_')) {
    throw new Error('STRIPE_WEBHOOK_SECRET must start with whsec_.');
  }

  let deleted = 0;
  for (const key of SNAPSHOT_WEBHOOK_SECRET_ENV_KEYS) {
    const snapshotRows = await listProjectEnvRowsForKey(projectId, key);
    for (const row of snapshotRows) {
      if (row.id && (await deleteProjectEnvRow(projectId, row.id))) deleted += 1;
    }
  }
  try {
    deleted += await purgeMarketplaceWebhookSecrets(projectId);
  } catch (err) {
    console.warn('[stripe-marketplace] purge eyJ STRIPE_WEBHOOK_SECRET failed:', err);
  }

  const client = await getVercelClient();
  const requestBody = {
    key: TOKENIZ_SNAPSHOT_WHSEC_KEY,
    value,
    type: 'encrypted' as const,
    target: ['production' as const, 'preview' as const, 'development' as const],
  };

  let created = false;
  for (const teamId of [TEAM_ID, undefined]) {
    try {
      await client.projects.createProjectEnv({
        idOrName: projectId,
        teamId,
        requestBody,
      });
      created = true;
      break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('403') && teamId === TEAM_ID) continue;
      if (msg.includes('400') && teamId === TEAM_ID) continue;
      console.warn(`[stripe-marketplace] createProjectEnv ${TOKENIZ_SNAPSHOT_WHSEC_KEY} failed: ${msg}`);
    }
  }

  // Best-effort: replace STRIPE_WEBHOOK_SECRET when not integration-locked.
  const legacyDeleted = await deleteAllWebhookSecretEnvRows(projectId);
  deleted += legacyDeleted;
  for (const teamId of [TEAM_ID, undefined]) {
    try {
      await client.projects.createProjectEnv({
        idOrName: projectId,
        teamId,
        requestBody: {
          key: 'STRIPE_WEBHOOK_SECRET',
          value,
          type: 'encrypted' as const,
          target: ['production' as const, 'preview' as const, 'development' as const],
        },
      });
      break;
    } catch {
      /* Marketplace may re-inject eyJ — TOKENIZ_SNAPSHOT_WHSEC is the runtime source. */
    }
  }

  const verify = await diagnoseWebhookSigningSecretEnv(projectId);
  return { deleted, created, verifyPrefix: verify.selectedPrefix };
}

/** Prefer TOKENIZ_SNAPSHOT_WHSEC (whsec_) over Marketplace eyJ on STRIPE_WEBHOOK_SECRET. */
export async function diagnoseWebhookSigningSecretEnv(
  projectId: string,
): Promise<WebhookSecretEnvDiagnostic> {
  for (const key of SNAPSHOT_WEBHOOK_SECRET_ENV_KEYS) {
    const snapshotRows = await listProjectEnvRowsForKey(projectId, key);
    if (snapshotRows.length === 0) continue;
    const kinds = snapshotRows.map((r) => classifySecretPrefix(r.value!));
    const selected = pickEnvValue(snapshotRows, key);
    if (selected && classifySecretPrefix(selected) === 'whsec') {
      return {
        entryCount: snapshotRows.length,
        selectedPrefix: 'whsec',
        duplicateKinds: [...new Set(kinds.filter((k) => k === 'whsec'))],
        entryIds: snapshotRows.map((r) => r.id).filter(Boolean) as string[],
      };
    }
  }

  return diagnoseWebhookSecretEnv(projectId);
}

/** Read decrypted env values for specific keys (server-only — never expose to client logs). */
export async function getProjectEnvValues(
  projectId: string,
  keyNames: string[],
): Promise<Record<string, string | null>> {
  const bearer = await resolveBearerToken();
  const want = new Set(keyNames);
  const out: Record<string, string | null> = Object.fromEntries(
    keyNames.map((k) => [k, null]),
  );

  const res = await fetch(
    appendTeam(
      `${VERCEL_API}/v9/projects/${encodeURIComponent(projectId)}/env?decrypted=true`,
    ),
    { headers: { Authorization: `Bearer ${bearer}` } },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Vercel env read failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { envs?: EnvRow[] };
  for (const key of keyNames) {
    if (want.has(key)) {
      out[key] = pickEnvValue(data.envs ?? [], key);
    }
  }

  // Runtime prefers snapshot whsec when Marketplace owns STRIPE_WEBHOOK_SECRET.
  if (want.has('STRIPE_WEBHOOK_SECRET') && !out.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')) {
    for (const key of SNAPSHOT_WEBHOOK_SECRET_ENV_KEYS) {
      const snapshot = pickEnvValue(data.envs ?? [], key);
      if (snapshot?.startsWith('whsec_')) {
        out.STRIPE_WEBHOOK_SECRET = snapshot;
        break;
      }
    }
  }

  for (const key of SNAPSHOT_WEBHOOK_SECRET_ENV_KEYS) {
    if (want.has(key)) {
      const picked = pickEnvValue(data.envs ?? [], key);
      if (picked?.startsWith('whsec_')) {
        out[key] = picked;
      }
    }
  }

  return out;
}

/** Resolve a Vercel project's slug/name (used for *.vercel.app URLs). */
export async function getVercelProjectName(projectId: string): Promise<string | null> {
  try {
    const client = await getVercelClient();
    const project = await withTeamId404Null((teamId) =>
      client.projects.getProject({ idOrName: projectId, teamId }),
    );
    return project?.name?.trim() || null;
  } catch (err) {
    console.warn('[stripe-marketplace] getVercelProjectName failed:', err);
    return null;
  }
}

/** List env var *names* on a project (values are never returned to the UI). */
export async function listProjectEnvKeyNames(projectId: string): Promise<string[]> {
  const data = await vercelGet<{ envs?: EnvRow[] }>(
    `/v9/projects/${encodeURIComponent(projectId)}/env`,
  );
  const keys = new Set<string>();
  for (const env of data.envs ?? []) {
    if (env.key) keys.add(env.key);
  }
  return [...keys].sort();
}

type IntegrationConfiguration = {
  id: string;
  slug?: string;
  status?: string;
  installationType?: string;
  projects?: string[];
};

/** Find a team-level Stripe Marketplace installation, if any. */
export async function findStripeTeamInstallation(): Promise<{
  id: string;
  status: string | null;
} | null> {
  try {
    const data = await vercelGet<IntegrationConfiguration[] | { configurations?: IntegrationConfiguration[] }>(
      `/v1/integrations/configurations?view=account&installationType=marketplace&integrationIdOrSlug=${STRIPE_MARKETPLACE_SLUG}`,
    );
    const list = Array.isArray(data) ? data : (data.configurations ?? []);
    const stripe = list.find(
      (c) =>
        (c.slug ?? '').toLowerCase() === STRIPE_MARKETPLACE_SLUG
        || c.id?.includes('stripe'),
    ) ?? list[0];
    if (!stripe?.id) return null;
    return { id: stripe.id, status: stripe.status ?? null };
  } catch (err) {
    console.warn('[stripe-marketplace] Could not list installations:', err);
    return null;
  }
}

/**
 * Inspect a Vercel project for Marketplace-provisioned Stripe env + team install.
 */
export async function getStripeMarketplaceStatus(input: {
  projectId: string | null;
  projectName?: string | null;
}): Promise<StripeMarketplaceStatus> {
  const installUrl = buildStripeMarketplaceInstallUrl();
  const projectId = input.projectId?.trim() || null;
  const projectName = input.projectName?.trim() || null;

  const installation = await findStripeTeamInstallation();

  if (!projectId) {
    return {
      projectId: null,
      projectName,
      installUrl,
      projectIntegrationsUrl: null,
      secretKeyPresent: false,
      publishableKeyPresent: false,
      webhookSecretPresent: false,
      teamInstallationId: installation?.id ?? null,
      teamInstallationStatus: installation?.status ?? null,
      source: 'none',
      envKeyNames: [],
      note: 'Deploy this app to Vercel first, then Install Stripe from the Marketplace and Connect Project.',
    };
  }

  let envKeyNames: string[] = [];
  try {
    envKeyNames = await listProjectEnvKeyNames(projectId);
  } catch (err) {
    return {
      projectId,
      projectName,
      installUrl,
      projectIntegrationsUrl: buildProjectIntegrationsUrl(projectName || projectId),
      secretKeyPresent: false,
      publishableKeyPresent: false,
      webhookSecretPresent: false,
      teamInstallationId: installation?.id ?? null,
      teamInstallationStatus: installation?.status ?? null,
      source: 'unknown',
      envKeyNames: [],
      note: err instanceof Error ? err.message : 'Failed to read project env',
    };
  }

  const secretKeyPresent = envKeyNames.includes('STRIPE_SECRET_KEY');
  const publishableKeyPresent = envKeyNames.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  const webhookSecretPresent = envKeyNames.includes('STRIPE_WEBHOOK_SECRET');

  let source: StripeMarketplaceStatus['source'] = 'none';
  if (secretKeyPresent || publishableKeyPresent) {
    // Marketplace always provisions the pair; webhook-only / partial often means manual push.
    source =
      secretKeyPresent && publishableKeyPresent && installation
        ? 'marketplace'
        : 'manual_or_mixed';
  }

  return {
    projectId,
    projectName,
    installUrl,
    projectIntegrationsUrl: buildProjectIntegrationsUrl(projectName || projectId),
    secretKeyPresent,
    publishableKeyPresent,
    webhookSecretPresent,
    teamInstallationId: installation?.id ?? null,
    teamInstallationStatus: installation?.status ?? null,
    source,
    envKeyNames: envKeyNames.filter(
      (k) =>
        k.startsWith('STRIPE_')
        || k.startsWith('NEXT_PUBLIC_STRIPE_'),
    ),
    note:
      !secretKeyPresent
        ? 'Stripe is not connected on this project yet. Install from Marketplace (sandbox or import live), then Connect Project.'
        : !webhookSecretPresent
          ? 'Marketplace keys are present. Optionally push STRIPE_WEBHOOK_SECRET via key push for webhook verification.'
          : undefined,
  };
}
