#!/usr/bin/env bun
/**
 * Replace Red Ruby knowledge snippets with platform-scoped assistant briefs
 * on the tokenizmyapp factory database.
 *
 * Usage:
 *   bun run scripts/seed-platform-knowledge.ts
 *   bun run scripts/seed-platform-knowledge.ts --clear-all-seed
 */
import { PrismaClient } from '../src/generated/prisma';
import {
  RED_RUBY_SNIPPET_KEYS,
  seedPlatformKnowledge,
} from '../src/domain/knowledge/platform-knowledge-seed';

const SEED_TABLES = [
  'page_sections',
  'app_pages',
  'task_assignments',
  'tasks',
  'action_items',
  'levers',
  'monthly_targets',
  'daily_metrics',
  'monthly_actual_departments',
  'monthly_actual_inputs',
  'business_review_parts',
  'knowledge_snippets',
  'financial_projections',
  'navigation_items',
  'daily_z_reports',
] as const;

async function main(): Promise<void> {
  const clearAll = process.argv.includes('--clear-all-seed');
  const connStr = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connStr) {
    console.error('POSTGRES_URL or DATABASE_URL is required');
    process.exit(1);
  }

  const prisma = new PrismaClient({ datasources: { db: { url: connStr } } });

  try {
    if (clearAll) {
      console.log('[reset-platform] Clearing all seeded tables…');
      for (const table of [...SEED_TABLES].reverse()) {
        try {
          const n = await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
          console.log(`  ${table}: ${n} row(s) deleted`);
        } catch (err) {
          console.warn(`  ${table}: skipped (${err instanceof Error ? err.message : err})`);
        }
      }
    } else {
      console.log('[reset-platform] Removing Red Ruby knowledge snippet keys…');
      for (const key of RED_RUBY_SNIPPET_KEYS) {
        const n = await prisma.knowledgeSnippet.deleteMany({ where: { key } });
        if (n.count > 0) console.log(`  ${key}: ${n.count} row(s) deleted`);
      }
      const redRubyRows = await prisma.knowledgeSnippet.deleteMany({
        where: { content: { contains: 'Red Ruby Club & Terrace Bar', mode: 'insensitive' } },
      });
      if (redRubyRows.count > 0) {
        console.log(`  content match: ${redRubyRows.count} additional row(s) deleted`);
      }
    }

    const written = await seedPlatformKnowledge(prisma);
    console.log(`[reset-platform] Seeded ${written} platform knowledge snippet(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
