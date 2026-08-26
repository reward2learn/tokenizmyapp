#!/usr/bin/env bun
/**
 * Push OLLAMA_TUNNEL_HOST to every tenant Vercel project (root + suite apps) and
 * the factory control-plane via the Vercel API (requires VERCEL_TOKEN).
 *
 * Studio-AI chat reads this at runtime so server-side completions hit the Mac
 * Studio tunnel directly. Pair with stream_options.include_usage in chat for
 * token metering.
 *
 * Usage:
 *   VERCEL_TOKEN=... POSTGRES_URL=... bun run scripts/push-ollama-tunnel-host.ts --confirm
 *   bun run scripts/push-ollama-tunnel-host.ts --slug=redrubybali --confirm
 *   bun run scripts/push-ollama-tunnel-host.ts --tunnel-host=https://ollama.tokenizin.com --confirm
 */
import { parseArgs } from 'node:util';
import {
  pushOllamaTunnelHostForAllTenants,
  pushOllamaTunnelHostForTenant,
} from '../src/domain/config/ollama-tunnel-host-service';
import {
  DEFAULT_OLLAMA_TUNNEL_HOST,
  resolveOllamaTunnelHost,
} from '../src/lib/ollama-tunnel-host';

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      confirm: { type: 'boolean', default: false },
      slug: { type: 'string' },
      'tunnel-host': { type: 'string' },
    },
    allowPositionals: false,
  });

  if (!values.confirm) {
    console.error(
      'Refusing to push without --confirm. Example:\n'
      + '  VERCEL_TOKEN=... POSTGRES_URL=... bun run scripts/push-ollama-tunnel-host.ts --confirm',
    );
    process.exit(1);
  }

  const connStr = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connStr) {
    console.error('POSTGRES_URL or DATABASE_URL is required');
    process.exit(1);
  }

  if (!process.env.VERCEL_TOKEN?.trim()) {
    console.error(
      'VERCEL_TOKEN is required (team PAT from https://vercel.com/account/tokens)',
    );
    process.exit(1);
  }

  const tunnelHost = values['tunnel-host']?.trim() || resolveOllamaTunnelHost();

  if (values.slug?.trim()) {
    const slug = values.slug.trim();
    console.log(`[ollama-tunnel] Pushing OLLAMA_TUNNEL_HOST for tenant "${slug}"…`);
    const result = await pushOllamaTunnelHostForTenant(slug, {
      confirm: true,
      tunnelHost,
    });
    printTenantResult(result);
    process.exit(result.errors.length > 0 ? 1 : 0);
  }

  console.log(
    `[ollama-tunnel] Pushing OLLAMA_TUNNEL_HOST=${tunnelHost} to all tenant projects…`,
  );
  const result = await pushOllamaTunnelHostForAllTenants({
    confirm: true,
    tunnelHost,
  });
  printAllResult(result);
  process.exit(result.errors.length > 0 ? 1 : 0);
}

function printTenantResult(
  result: Awaited<ReturnType<typeof pushOllamaTunnelHostForTenant>>,
): void {
  console.log(`  tunnelHost: ${result.tunnelHost}`);
  if (result.factoryOnly) {
    console.log('  note: tenant row missing — factory only');
  }
  for (const row of result.updated) {
    const tag = row.appId ? `app=${row.appId}` : 'root/factory';
    console.log(
      `  ${row.ok ? 'ok' : 'FAIL'} ${row.projectId} (${tag})${row.error ? ` — ${row.error}` : ''}`,
    );
  }
  if (result.skippedNoProject.length) {
    console.log(`  skipped (no project id): ${result.skippedNoProject.join(', ')}`);
  }
  if (result.errors.length) {
    console.error('  errors:', result.errors.join('; '));
  }
}

function printAllResult(
  result: Awaited<ReturnType<typeof pushOllamaTunnelHostForAllTenants>>,
): void {
  console.log(`  tenants: ${result.tenantSlugs.length} (${result.tenantSlugs.join(', ')})`);
  console.log(`  projects: ${result.updated.length}`);
  for (const row of result.updated) {
    console.log(
      `  ${row.ok ? 'ok' : 'FAIL'} ${row.projectId}${row.error ? ` — ${row.error}` : ''}`,
    );
  }
  if (result.skippedNoProject.length) {
    console.log(`  skipped suite apps (no project id): ${result.skippedNoProject.join(', ')}`);
  }
  const okCount = result.updated.filter((r) => r.ok).length;
  console.log(`  done: ${okCount}/${result.updated.length} project(s) updated`);
  if (result.errors.length) {
    console.error('  errors:', result.errors.join('; '));
  }
  console.log(
    '\nNote: redeploy apps (or trigger a deploy) so running functions pick up the new env var.',
  );
  console.log(
    `Default tunnel when unset: ${DEFAULT_OLLAMA_TUNNEL_HOST}`,
  );
}

main().catch((err) => {
  console.error('[ollama-tunnel] Fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
