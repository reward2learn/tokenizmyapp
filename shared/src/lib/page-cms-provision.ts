import { resolveRegistryTenantSlug } from './cms-scope';
import type { CmsSqlClient } from './page-cms-resolve';
import { toStoragePageSlug } from './page-slug';

export interface CatalogSectionInput {
  blockType: string;
  config?: Record<string, unknown>;
}

export interface CatalogPageInput {
  slug: string;
  title: string;
  authTier: string;
  navLabel?: string | null;
  showInNav?: boolean;
  sections: CatalogSectionInput[];
}

type ProvisionDb = CmsSqlClient & {
  $executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<unknown>;
};

function sectionConfigForBlock(
  blockType: string,
  config: Record<string, unknown> | undefined,
  authTier: string,
): Record<string, unknown> {
  if (blockType === 'doc_markdown') {
    return {
      source: 'executive-summary',
      ...(config ?? {}),
      minTier: (config?.minTier as string | undefined) ?? authTier,
    };
  }
  return {
    ...(config ?? {}),
    minTier: (config?.minTier as string | undefined) ?? authTier,
  };
}

/**
 * Create (or refresh sections on) an app_pages row from a code-catalog page definition.
 * Idempotent when the page row already exists and is not content_locked.
 */
export async function provisionAppPageFromCatalog(
  db: ProvisionDb,
  catalogPage: CatalogPageInput,
  options: { deploymentTenantSlug: string; appId?: string },
): Promise<{ id: string; created: boolean; sectionCount: number }> {
  const appId = options.appId?.trim() ?? '';
  const registryTenantSlug = resolveRegistryTenantSlug(options.deploymentTenantSlug, appId);
  const storageSlug = appId ? toStoragePageSlug(catalogPage.slug, appId) : catalogPage.slug;
  const pageId = storageSlug;

  const existing = await db.$queryRawUnsafe<{ id: string; contentLocked: boolean }[]>(
    `SELECT id, COALESCE(content_locked, false) AS "contentLocked"
     FROM app_pages
     WHERE slug = $1
       AND COALESCE(tenant_slug, '') = $2
       AND COALESCE(app_id, '') = $3
     LIMIT 1`,
    storageSlug,
    registryTenantSlug,
    appId,
  );

  let created = false;
  let pageRowId = existing[0]?.id;

  if (!pageRowId) {
    await db.$executeRawUnsafe(
      `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug, app_id)
       VALUES ($1, $2, $3, CAST($4 AS "AuthTier"), 0, $5, $6, $7, $8)`,
      pageId,
      storageSlug,
      catalogPage.title,
      catalogPage.authTier,
      catalogPage.navLabel ?? null,
      catalogPage.showInNav ?? true,
      registryTenantSlug,
      appId || null,
    );
    pageRowId = pageId;
    created = true;
  } else if (existing[0]?.contentLocked) {
    return { id: pageRowId, created: false, sectionCount: catalogPage.sections.length };
  }

  const sectionRows = await db.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count FROM page_sections WHERE page_id = $1`,
    pageRowId,
  );
  const hasSections = Number(sectionRows[0]?.count ?? 0) > 0;

  if (!hasSections) {
    await db.$executeRawUnsafe(`DELETE FROM page_sections WHERE page_id = $1`, pageRowId);
    for (let i = 0; i < catalogPage.sections.length; i++) {
      const section = catalogPage.sections[i];
      const config = sectionConfigForBlock(
        section.blockType,
        section.config,
        catalogPage.authTier,
      );
      const sectionId = `${storageSlug}:section:${i}`;
      await db.$executeRawUnsafe(
        `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
         VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb))`,
        sectionId,
        pageRowId,
        i,
        section.blockType,
        JSON.stringify(config),
      );
    }
  }

  return { id: pageRowId, created, sectionCount: catalogPage.sections.length };
}

/** Minimal narrative page when AI/user links to a slug not in the code catalog. */
export async function provisionMinimalDocPage(
  db: ProvisionDb,
  input: { slug: string; title: string; authTier?: string },
  options: { deploymentTenantSlug: string; appId?: string },
): Promise<{ id: string; created: boolean }> {
  const authTier = input.authTier ?? 'google';
  return provisionAppPageFromCatalog(
    db,
    {
      slug: input.slug,
      title: input.title,
      authTier,
      navLabel: input.title,
      showInNav: true,
      sections: [
        {
          blockType: 'doc_markdown',
          config: {
            title: input.title,
            markdown: `# ${input.title}\n\nAdd content for this page in Page Content or inline edit mode.`,
            minTier: authTier,
          },
        },
      ],
    },
    options,
  );
}
