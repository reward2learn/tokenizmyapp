#!/usr/bin/env bun
/**
 * Push VERCEL_TOKEN + VERCEL_TEAM_ID to the factory tokenizmyapp Vercel project.
 *
 * Usage (from tokenizmyapp/):
 *   bun run scripts/push-factory-vercel-token.ts --confirm
 *   VERCEL_TOKEN=vca_... bun run scripts/push-factory-vercel-token.ts --confirm
 *
 * Reads VERCEL_TOKEN from env or .env.local (via bun). Never prints the token.
 * Accepts vcp_ (personal), vca_ (app), vci_ (integration), or legacy at_ prefixes.
 */
import { parseArgs } from 'node:util';
import { upsertProjectEnvVar } from '../src/domain/tenant/vercel-deploy-service';
import { VERCEL_TEAM_ID } from '../src/lib/vercel-team';

const FACTORY_PROJECT_ID = 'prj_ia654I3nS8CWUu6uA57oSKDR01IE';

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
      'VERCEL_TOKEN is required (Tokenizin team PAT from https://vercel.com/account/tokens)',
    );
    process.exit(1);
  }

  console.log(`[vercel-token] Upserting VERCEL_TOKEN + VERCEL_TEAM_ID on ${FACTORY_PROJECT_ID}…`);
  const tokenOk = await upsertProjectEnvVar(FACTORY_PROJECT_ID, 'VERCEL_TOKEN', pat);
  const teamOk = await upsertProjectEnvVar(FACTORY_PROJECT_ID, 'VERCEL_TEAM_ID', VERCEL_TEAM_ID);

  if (!tokenOk) {
    console.error('[vercel-token] Failed to set VERCEL_TOKEN');
    process.exit(1);
  }
  console.log(`[vercel-token] VERCEL_TOKEN ok`);
  console.log(`[vercel-token] VERCEL_TEAM_ID ${teamOk ? 'ok' : 'failed'} (${VERCEL_TEAM_ID})`);
  console.log('\nRedeploy tokenizmyapp (or trigger deploy hook) so serverless functions pick up the PAT.');
}

main().catch((err) => {
  console.error('[vercel-token] Fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
