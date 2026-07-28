/**
 * Vercel Deploy Service — creates and configures Vercel projects for new tenants.
 *
 * Token resolution order:
 *   1. VERCEL_OAUTH from secrets table (set via OAuth "Connect to Vercel" flow)
 *   2. VERCEL_TOKEN env var (legacy fallback)
 *
 * The OAuth token is auto-refreshed when expired using the stored refresh_token.
 */
import { getSecret, setSecret } from '@/lib/secrets';
import { decrypt, encrypt } from '@/lib/crypto';
const VERCEL_API = 'https://api.vercel.com';
const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_uKNaNEyjHVW7vooXeUfNJ3LW';
const CLIENT_ID = process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.VERCEL_APP_CLIENT_SECRET;
/**
 * Read the stored Vercel OAuth tokens from the secrets table.
 */
async function readStoredTokens() {
    const secret = await getSecret('VERCEL_OAUTH');
    if (!secret)
        return null;
    try {
        const decrypted = decrypt(secret.encrypted, secret.iv, secret.authTag);
        return JSON.parse(decrypted);
    }
    catch {
        return null;
    }
}
/**
 * Write Vercel OAuth tokens to the secrets table.
 */
async function writeTokens(tokens) {
    const payload = JSON.stringify(tokens);
    const encrypted = encrypt(payload);
    await setSecret('VERCEL_OAUTH', payload);
}
/**
 * Refresh the OAuth access token using the refresh token.
 * Vercel's refresh_token flow returns a new access_token + refresh_token pair.
 */
async function refreshAccessToken(refreshToken) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.warn('[vercel-deploy] Cannot refresh token: missing OAuth client config');
        return null;
    }
    try {
        const res = await fetch('https://api.vercel.com/login/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                refresh_token: refreshToken,
            }),
        });
        if (!res.ok) {
            console.error('[vercel-deploy] Token refresh failed:', res.status, await res.text());
            return null;
        }
        const data = await res.json();
        const tokens = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken, // use old refresh if not provided
            expiresAt: Date.now() + data.expires_in * 1000,
            scope: data.scope || '',
        };
        // Persist updated tokens
        await writeTokens(tokens);
        return tokens;
    }
    catch (err) {
        console.error('[vercel-deploy] Token refresh error:', err);
        return null;
    }
}
/**
 * Get a valid Bearer token for Vercel API calls.
 * Tries: stored OAuth token (with auto-refresh) → env var VERCEL_TOKEN.
 */
async function resolveBearerToken() {
    // 1. Try stored OAuth tokens
    const stored = await readStoredTokens();
    if (stored) {
        // Check if expired (with 5 min buffer)
        if (Date.now() > stored.expiresAt - 300_000) {
            // Token is expired or about to expire — try refresh
            if (stored.refreshToken) {
                console.log('[vercel-deploy] Access token expired, attempting refresh...');
                const refreshed = await refreshAccessToken(stored.refreshToken);
                if (refreshed) {
                    return refreshed.accessToken;
                }
                console.warn('[vercel-deploy] Token refresh failed, falling back to env var');
            }
            else {
                console.warn('[vercel-deploy] Token expired and no refresh_token available');
            }
        }
        else {
            return stored.accessToken;
        }
    }
    // 2. Fallback to env var legacy token
    const envToken = process.env.VERCEL_TOKEN;
    if (envToken) {
        return envToken;
    }
    throw new Error('No Vercel API token available. ' +
        'Connect your Vercel account via the admin dashboard (Connect to Vercel button), ' +
        'or set VERCEL_TOKEN environment variable.');
}
async function vercelApi(path, options = {}, includeTeamId = true) {
    const token = await resolveBearerToken();
    return vercelApiWithToken(token, path, options, includeTeamId);
}
/** Make a Vercel API call with a specific bearer token (no auto-resolution). */
async function vercelApiWithToken(token, path, options = {}, includeTeamId = true) {
    const url = new URL(`${VERCEL_API}${path}`);
    if (includeTeamId)
        url.searchParams.set('teamId', TEAM_ID);
    return fetch(url.toString(), {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
}
/** Try a Vercel API call both with and without teamId. Returns the first successful response,
 *  or the best-effort response (preferring non-404/403) if both fail. */
async function vercelApiTryBoth(path, options = {}) {
    const withTeam = await vercelApi(path, options, true);
    if (withTeam.ok)
        return withTeam;
    const withoutTeam = await vercelApi(path, options, false);
    if (withoutTeam.ok)
        return withoutTeam;
    // Return the more useful response: prefer non-404 over 404
    if (withTeam.status !== 404 && withTeam.status !== 403)
        return withTeam;
    return withoutTeam;
}
function extractConfigEnvVars(metadata) {
    const env = {};
    const config = (metadata?.config ?? {});
    const googleAuth = (config.googleAuth ?? {});
    if (googleAuth.clientId)
        env['GOOGLE_CLIENT_ID'] = googleAuth.clientId;
    if (googleAuth.clientSecret)
        env['GOOGLE_CLIENT_SECRET'] = googleAuth.clientSecret;
    if (googleAuth.projectId)
        env['GOOGLE_PROJECT_ID'] = googleAuth.projectId;
    const database = (config.database ?? {});
    if (database.postgresUrl)
        env['POSTGRES_URL'] = database.postgresUrl;
    if (database.databaseUrl)
        env['DATABASE_URL'] = database.databaseUrl;
    if (database.pgUser)
        env['PGUSER'] = database.pgUser;
    if (database.pgPassword)
        env['PGPASSWORD'] = database.pgPassword;
    const pins = (config.pins ?? []);
    for (const p of pins) {
        if (p.role && p.pin) {
            env[p.role] = p.pin;
        }
    }
    const envVars = (config.envVars ?? []);
    for (const ev of envVars) {
        if (ev.key) {
            env[ev.key] = ev.value;
        }
    }
    return env;
}
export async function ensureVercelProject(input) {
    // 1. Try to get the project directly by name (Vercel API accepts slug/name as ID)
    //    Try both with and without teamId — OAuth tokens may be scoped differently
    const getRes = await vercelApiTryBoth(`/v10/projects/${input.slug}`);
    if (getRes.ok) {
        const project = await getRes.json();
        console.log(`[vercel-deploy] Project "${input.slug}" already exists: ${project.id}`);
        return { projectId: project.id, created: false };
    }
    // 2. If not found, try searching (broader search) — also try both scopes
    const searchRes = await vercelApiTryBoth(`/v10/projects?search=${input.slug}`);
    if (searchRes.ok) {
        const data = await searchRes.json();
        const existing = data.projects?.find((p) => p.name === input.slug);
        if (existing) {
            console.log(`[vercel-deploy] Project "${input.slug}" found via search: ${existing.id}`);
            return { projectId: existing.id, created: false };
        }
    }
    // 3. Create new project (POST must be with teamId since projects live under teams)
    const createRes = await vercelApi('/v10/projects', {
        method: 'POST',
        body: JSON.stringify({
            name: input.slug,
            framework: 'nextjs',
            buildCommand: 'zenstack generate --schema zenstack/schema.zmodel && npx prisma db push --schema=zenstack/prisma/schema.prisma --skip-generate --accept-data-loss && next build',
            installCommand: 'bun install',
            outputDirectory: '.next',
        }),
    });
    // 4. If creation fails with 409, the project exists but we couldn't find it
    if (createRes.status === 409) {
        console.warn(`[vercel-deploy] Project "${input.slug}" exists (409). Attempting to use existing project.`);
        // Retry the direct lookup via tryBoth
        const retryRes = await vercelApiTryBoth(`/v10/projects/${input.slug}`);
        if (retryRes.ok) {
            const project = await retryRes.json();
            console.log(`[vercel-deploy] Using existing project: ${project.id}`);
            return { projectId: project.id, created: false };
        }
        // If still not found, try to get it with the personal token env var
        const token = process.env.VERCEL_TOKEN;
        if (token) {
            try {
                const fallbackUrl = new URL(`${VERCEL_API}/v10/projects/${input.slug}`);
                fallbackUrl.searchParams.set('teamId', TEAM_ID);
                const envRes = await fetch(fallbackUrl.toString(), {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                if (envRes.ok) {
                    const project = await envRes.json();
                    console.log(`[vercel-deploy] Found existing project via VERCEL_TOKEN: ${project.id}`);
                    return { projectId: project.id, created: false };
                }
            }
            catch { }
        }
        throw new Error(`Project "${input.slug}" already exists on Vercel but could not be found.`);
    }
    if (!createRes.ok) {
        const err = await createRes.text();
        throw new Error(`Failed to create Vercel project: ${createRes.status} ${err}`);
    }
    const project = await createRes.json();
    console.log(`[vercel-deploy] Project created: ${project.id}`);
    return { projectId: project.id, created: true };
}
/** Try fetching env vars with a given token/combo, return list or null. */
async function tryFetchEnvs(token, projectId, includeTeam) {
    try {
        const fn = token
            ? (p, o) => vercelApiWithToken(token, p, o || {}, includeTeam)
            : (p, o) => vercelApi(p, o || {}, includeTeam);
        const res = await fn(`/v10/projects/${projectId}/env?decrypt=true`);
        if (res.ok) {
            const data = await res.json();
            return data.envs || [];
        }
    }
    catch { }
    return null;
}
/** Upsert a single env var — tries all available tokens/teamId combos until one works. */
async function upsertEnvVar(projectId, key, value) {
    const requestBody = JSON.stringify({
        key,
        value,
        type: key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'encrypted',
        target: ['production', 'preview', 'development'],
    });
    const vt = process.env.VERCEL_TOKEN;
    // Try each token x teamId combos
    const combos = [
        { label: 'oauth+team', token: null, teamId: true },
        { label: 'oauth', token: null, teamId: false },
    ];
    if (vt) {
        combos.push({ label: 'vt+team', token: vt, teamId: true });
        combos.push({ label: 'vt', token: vt, teamId: false });
    }
    for (const { label, token, teamId } of combos) {
        const fn = token
            ? (p, o) => vercelApiWithToken(token, p, o || {}, teamId)
            : (p, o) => vercelApi(p, o || {}, teamId);
        // POST with ?upsert=true — Vercel creates or updates by key name
        const postRes = await fn(`/v10/projects/${projectId}/env?upsert=true`, { method: 'POST', body: requestBody });
        if (postRes.ok) {
            console.log(`[vercel-deploy] Set env ${key} via POST ?upsert=true (${label})`);
            return true;
        }
        // Fallback: fetch envs to get the ID, then PATCH by ID
        const getRes = await fn(`/v10/projects/${projectId}/env?decrypt=true`);
        if (getRes.ok) {
            const data = await getRes.json();
            const envEntry = data.envs?.find((e) => e.key === key);
            if (envEntry?.id) {
                const patchRes = await fn(`/v10/projects/${projectId}/env/${envEntry.id}`, { method: 'PATCH', body: requestBody });
                if (patchRes.ok) {
                    console.log(`[vercel-deploy] Set env ${key} via PATCH by ID (${label})`);
                    return true;
                }
            }
        }
        // Log the failure and continue trying other combos
        const errText = postRes.status === 400 ? '' : await postRes.text().catch(() => '');
        const errMsg = errText ? errText.slice(0, 100) : `POST returned ${postRes.status}`;
        console.warn(`[vercel-deploy] ${label} failed for ${key}: ${errMsg}`);
    }
    return false;
}
export async function syncEnvVars(projectId, input) {
    const appUrl = `https://${input.slug}.vercel.app`;
    const envVars = {
        NEXT_PUBLIC_TENANT_SLUG: input.slug,
        NEXT_PUBLIC_TENANT_DISPLAY_NAME: input.displayName,
        NEXT_PUBLIC_TENANT_DESCRIPTION: `${input.displayName} — Business Operations Dashboard`,
        NEXT_PUBLIC_TENANT_APP_TITLE: input.displayName,
        NEXT_PUBLIC_APP_URL: appUrl,
    };
    const SHARED_ENV_KEYS = [
        'POSTGRES_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING',
        'POSTGRES_HOST', 'POSTGRES_DATABASE', 'POSTGRES_USER', 'POSTGRES_PASSWORD',
        'ENCRYPTION_KEY', 'OPENAI_API_KEY', 'SETUP_TOKEN',
    ];
    for (const key of SHARED_ENV_KEYS) {
        const value = process.env[key];
        if (value) {
            envVars[key] = value;
        }
    }
    const configVars = extractConfigEnvVars(input.metadata);
    for (const [key, value] of Object.entries(configVars)) {
        if (value)
            envVars[key] = value;
    }
    // Upsert each env var — the function handles token/teamId fallback internally
    let envCount = 0;
    for (const [key, value] of Object.entries(envVars)) {
        try {
            const ok = await upsertEnvVar(projectId, key, value);
            if (ok)
                envCount++;
        }
        catch (err) {
            console.error(`[vercel-deploy] Failed to set env ${key}:`, err);
        }
    }
    console.log(`[vercel-deploy] Synced ${envCount}/${Object.keys(envVars).length} env vars`);
    return envCount;
}
export async function deployTenant(input) {
    const appUrl = `https://${input.slug}.vercel.app`;
    const { projectId } = await ensureVercelProject({ slug: input.slug });
    // Sync env vars — fail closed if it doesn't work
    const envCount = await syncEnvVars(projectId, input);
    if (envCount === 0) {
        throw new Error(`Failed to sync any environment variables to project "${input.slug}". Check Vercel API access.`);
    }
    const criticalKeys = ['NEXT_PUBLIC_TENANT_SLUG', 'POSTGRES_URL', 'ENCRYPTION_KEY'];
    if (envCount < criticalKeys.length) {
        console.warn(`[vercel-deploy] Only synced ${envCount} env vars — critical keys may be missing.`);
    }
    try {
        const domainRes = await vercelApi(`/v10/projects/${projectId}/domains`, {
            method: 'POST',
            body: JSON.stringify({ name: `${input.slug}.vercel.app` }),
        });
        if (domainRes.ok) {
            console.log(`[vercel-deploy] Domain ${input.slug}.vercel.app assigned`);
        }
        else {
            const domainErr = await domainRes.text();
            console.warn(`[vercel-deploy] Domain assignment response: ${domainErr.slice(0, 100)}`);
        }
    }
    catch (err) {
        console.warn(`[vercel-deploy] Domain assignment failed (may already exist):`, err);
    }
    try {
        await vercelApi(`/v1/deployments`, {
            method: 'POST',
            body: JSON.stringify({
                name: input.slug,
                projectId,
                target: 'production',
                gitSource: { type: 'github', repoId: process.env.VERCEL_GIT_REPO_ID || '' },
            }),
        });
        console.log(`[vercel-deploy] Deployment triggered for ${input.slug}`);
    }
    catch (err) {
        console.warn(`[vercel-deploy] Deployment trigger warning:`, err);
    }
    return {
        projectId,
        projectName: input.slug,
        vercelDashboardUrl: `https://vercel.com/ilishaps-projects/${input.slug}`,
        appUrl,
        envCount,
    };
}
// ── Git-based deployment ─────────────────────────────────────
const GIT_REPO = process.env.VERCEL_GIT_REPO || 'reward2learn/tokenizmyapp';
const GIT_REPO_TYPE = 'github';
/**
 * Ensure a Vercel project exists and is linked to the GitHub repo.
 * Creates the project if not found, and links it to the Git repository
 * with rootDirectory set to "website".
 */
export async function ensureVercelProjectWithGit(input) {
    // 1. Try to find existing project
    const getRes = await vercelApiTryBoth(`/v10/projects/${input.slug}`);
    if (getRes.ok) {
        const project = await getRes.json();
        // If project exists but isn't linked to Git, link it
        if (!project.gitRepository) {
            console.log(`[vercel-deploy] Linking existing project "${input.slug}" to Git repo...`);
            await vercelApi(`/v10/projects/${project.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    rootDirectory: '.',
                    gitRepository: {
                        type: GIT_REPO_TYPE,
                        repo: GIT_REPO,
                    },
                }),
            });
            console.log(`[vercel-deploy] Project "${input.slug}" linked to ${GIT_REPO}`);
        }
        return { projectId: project.id, created: false };
    }
    // 2. Create new project with Git integration
    const createRes = await vercelApi('/v10/projects', {
        method: 'POST',
        body: JSON.stringify({
            name: input.slug,
            framework: 'nextjs',
            rootDirectory: '.',
            gitRepository: {
                type: GIT_REPO_TYPE,
                repo: GIT_REPO,
            },
            buildCommand: 'zenstack generate --schema zenstack/schema.zmodel && npx prisma db push --schema=zenstack/prisma/schema.prisma --skip-generate --accept-data-loss && next build',
            installCommand: 'bun install',
            outputDirectory: '.next',
        }),
    });
    if (createRes.status === 409) {
        console.warn(`[vercel-deploy] Project "${input.slug}" exists (409). Linking Git...`);
        // Find the project ID and link Git
        const searchRes = await vercelApiTryBoth(`/v10/projects?search=${input.slug}`);
        if (searchRes.ok) {
            const data = await searchRes.json();
            const existing = data.projects?.find((p) => p.name === input.slug);
            if (existing) {
                await vercelApi(`/v10/projects/${existing.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        rootDirectory: '.',
                        gitRepository: {
                            type: GIT_REPO_TYPE,
                            repo: GIT_REPO,
                        },
                    }),
                });
                return { projectId: existing.id, created: false };
            }
        }
        throw new Error(`Project "${input.slug}" already exists but could not be found.`);
    }
    if (!createRes.ok) {
        const err = await createRes.text();
        throw new Error(`Failed to create Vercel project with Git: ${createRes.status} ${err}`);
    }
    const project = await createRes.json();
    console.log(`[vercel-deploy] Project created with Git: ${project.id}`);
    return { projectId: project.id, created: true };
}
/**
 * Deploy a tenant using Git-based deployment.
 * Creates/finds the Vercel project linked to GitHub, syncs env vars,
 * and triggers a production deployment from the main branch.
 */
export async function deployTenantWithGit(input) {
    const appUrl = `https://${input.slug}.vercel.app`;
    // Create/find project with Git integration
    const { projectId, created } = await ensureVercelProjectWithGit({ slug: input.slug });
    // Sync env vars
    const envCount = await syncEnvVars(projectId, input);
    if (envCount === 0) {
        throw new Error(`Failed to sync environment variables for "${input.slug}".`);
    }
    // Assign domain
    try {
        await vercelApi(`/v10/projects/${projectId}/domains`, {
            method: 'POST',
            body: JSON.stringify({ name: `${input.slug}.vercel.app` }),
        });
    }
    catch (err) {
        console.warn(`[vercel-deploy] Domain assignment warning:`, err);
    }
    // Trigger Git-based deployment from main branch
    try {
        await vercelApi(`/v1/deployments`, {
            method: 'POST',
            body: JSON.stringify({
                name: input.slug,
                project: projectId,
                target: 'production',
                gitSource: {
                    type: GIT_REPO_TYPE,
                    repoId: input.slug,
                    ref: 'main',
                },
            }),
        });
        console.log(`[vercel-deploy] Git deployment triggered for ${input.slug}`);
    }
    catch (err) {
        console.warn(`[vercel-deploy] Git deployment trigger warning:`, err);
    }
    return {
        projectId,
        projectName: input.slug,
        vercelDashboardUrl: `https://vercel.com/ilishaps-projects/${input.slug}`,
        appUrl,
        envCount,
    };
}
/**
 * Delete a Vercel project by ID.
 * Handles cases where the project may already be deleted or inaccessible.
 */
export async function deleteVercelProject(projectId) {
    try {
        console.log(`Attempting to delete Vercel project: ${projectId}`);
        // Try to get the project first to verify it exists
        const getRes = await vercelApiTryBoth(`/v10/projects/${projectId}`);
        if (getRes.status === 404) {
            console.log(`Vercel project ${projectId} already does not exist (404)`);
            return;
        }
        if (!getRes.ok) {
            // If we can't get the project but it's not 404, try to delete anyway
            console.warn(`Could not verify Vercel project ${projectId} existence: ${getRes.status}`);
        }
        // Attempt deletion
        const deleteRes = await vercelApi(`/v10/projects/${projectId}`, {
            method: 'DELETE',
        });
        if (deleteRes.ok) {
            console.log(`Successfully deleted Vercel project ${projectId}`);
            return;
        }
        if (deleteRes.status === 404) {
            console.log(`Vercel project ${projectId} already deleted (404)`);
            return;
        }
        throw new Error(`Vercel API returned ${deleteRes.status}: ${await deleteRes.text()}`);
    }
    catch (err) {
        // If the project is already deleted, that's fine
        if (err instanceof Error && err.message.includes('404')) {
            console.log(`Vercel project ${projectId} already deleted or not found`);
            return;
        }
        throw err;
    }
}
