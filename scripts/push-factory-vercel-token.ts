#!/usr/bin/env bun
/**
 * Push VERCEL_TOKEN + VERCEL_TEAM_ID to the factory tokenizmyapp Vercel project.
 *
 * Usage (from tokenizmyapp/):
 *   bun run scripts/push-factory-vercel-token.ts --confirm
 *
 * Bun auto-loads .env.local — do NOT `source .env.local` (unquoted values break zsh).
 *
 * Tries Vercel API upsert first (uses VERCEL_TOKEN from env), then Vercel CLI
 * using your `vercel login` session (VERCEL_TOKEN stripped — scoped PATs break -S).
 */
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { upsertProjectEnvVar } from '../src/domain/tenant/vercel-deploy-service';
import { DEFAULT_VERCEL_TEAM_SLUG, VERCEL_TEAM_ID } from '../src/lib/vercel-team';

const FACTORY_PROJECT_ID = 'prj_ia654I3nS8CWUu6uA57oSKDR01IE';
/** Factory only ships Production — do not add preview/development (CLI fails if missing). */
const ENV_TARGETS = ['production'] as const;

function pushEnvViaCli(key: string, value: string): boolean {
  // CLI session auth — PAT in VERCEL_TOKEN makes `--scope tokenizin-projects` fail.
  const cliEnv = { ...process.env };
  delete cliEnv.VERCEL_TOKEN;

  for (const target of ENV_TARGETS) {
    try {
      // Vercel CLI ≥54: one environment per call (not "production preview development").
      execFileSync(
        'vercel',
        [
          'env',
          'add',
          key,
          target,
          '--scope',
          DEFAULT_VERCEL_TEAM_SLUG,
          '--force',
          '--yes',
          '--value',
          value,
        ],
        { env: cliEnv, stdio: ['ignore', 'inherit', 'inherit'] },
      );
    } catch (err) {
      console.warn(
        `[vercel-token] CLI env add failed for ${key} (${target}):`,
        err instanceof Error ? err.message : err,
      );
      return false;
    }
  }
  return true;
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: { confirm: { type: 'boolean', default: false } },
    allowPositionals: false,
  });

  if (!values.confirm) {
    console.error(
      'Refusing without --confirm. Example:\n'
      + '  bun run scripts/push-factory-vercel-token.ts --confirm',
    );
    process.exit(1);
  }

  const pat = process.env.VERCEL_TOKEN?.trim();
  if (!pat) {
    console.error(
      'VERCEL_TOKEN is required in .env.local (Tokenizin-scoped vcp_ from vercel.com/account/tokens)',
    );
    process.exit(1);
  }

  console.log(`[vercel-token] Target project ${FACTORY_PROJECT_ID} (team ${DEFAULT_VERCEL_TEAM_SLUG})`);

  let tokenOk = await upsertProjectEnvVar(FACTORY_PROJECT_ID, 'VERCEL_TOKEN', pat);
  let teamOk = await upsertProjectEnvVar(FACTORY_PROJECT_ID, 'VERCEL_TEAM_ID', VERCEL_TEAM_ID);

  if (!tokenOk || !teamOk) {
    console.log('[vercel-token] API upsert incomplete — trying Vercel CLI (vercel login session)…');
    if (!tokenOk) tokenOk = pushEnvViaCli('VERCEL_TOKEN', pat);
    if (!teamOk) teamOk = pushEnvViaCli('VERCEL_TEAM_ID', VERCEL_TEAM_ID);
  }

  if (!tokenOk) {
    console.error(
      '[vercel-token] Failed to set VERCEL_TOKEN.\n'
      + '  1. Run `vercel login` and ensure Tokenizin appears in `vercel teams ls`\n'
      + '  2. Or create a Tokenizin-scoped vcp_ token at vercel.com/account/tokens',
    );
    process.exit(1);
  }

  console.log('[vercel-token] VERCEL_TOKEN ok');
  console.log(`[vercel-token] VERCEL_TEAM_ID ${teamOk ? 'ok' : 'failed'} (${VERCEL_TEAM_ID})`);
  console.log('\nRedeploy tokenizmyapp (or trigger deploy hook) so serverless functions pick up the PAT.');
}

main().catch((err) => {
  console.error('[vercel-token] Fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
