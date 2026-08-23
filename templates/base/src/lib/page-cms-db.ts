import { PrismaClient } from '@/generated/prisma';

export function getPageCmsClient(): PrismaClient {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

/** Idempotent column adds for CMS lock + optional tenant columns on older DBs. */
export async function ensurePageCmsColumns(db: {
  $executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<unknown>;
}): Promise<void> {
  const statements = [
    `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS content_locked BOOLEAN DEFAULT false`,
    `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS nav_label TEXT`,
    `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS show_in_nav BOOLEAN DEFAULT true`,
    `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS tenant_slug TEXT`,
    `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS app_id TEXT`,
  ];
  for (const sql of statements) {
    await db.$executeRawUnsafe(sql);
  }
}
