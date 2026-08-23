'use client';

import { useMemo } from 'react';
import type { BlockType, PageDefinition } from '@/lib/page-catalog';
import { useGetPageSectionsQuery } from '@/store/apis/admin-api';
import { useAppSelector } from '@/store/hooks';

export interface LivePageSection {
  id: string;
  sortOrder: number;
  blockType: BlockType;
  config: Record<string, unknown>;
}

/**
 * Resolved sections for the live (non-edit) page view.
 * Priority: Redux publish cache → CMS API → server page prop.
 *
 * When CMS is being fetched (platform admin) and the server only sent catalog
 * sections (no Neon ids), hold rendering until CMS resolves — avoids a
 * default-hero flash and a second scroll animation.
 */
export function usePublishedPageSections(
  page: PageDefinition,
  opts?: { fetchCms?: boolean },
): {
  sections: LivePageSection[];
  publishRevision: number;
  isLoading: boolean;
  isSectionsPending: boolean;
} {
  const published = useAppSelector((s) => s.ui.publishedPageSections[page.slug]);
  const publishRevision = useAppSelector((s) => s.ui.pageSectionsRevision[page.slug] ?? 0);
  const platformAdmin = useAppSelector((s) => s.auth.platformAdmin);

  const shouldFetchCms = opts?.fetchCms ?? platformAdmin;
  const hasPublishedCache = Boolean(published && published.length > 0);
  const serverLooksLikeCatalogOnly =
    page.sections.length > 0 && page.sections.every((s) => !s.id);
  const { data: cmsData, isLoading, isFetching } = useGetPageSectionsQuery(
    { slug: page.slug },
    { skip: !shouldFetchCms },
  );

  const isSectionsPending =
    shouldFetchCms && isFetching && !hasPublishedCache && serverLooksLikeCatalogOnly;

  const sections = useMemo(() => {
    if (isSectionsPending) {
      return [];
    }

    const cms = cmsData?.data?.sections;
    const raw =
      hasPublishedCache
        ? published!
        : cms && cms.length > 0
          ? cms
          : page.sections;

    return raw.map((s, index) => ({
      id: s.id ?? `${page.slug}-section-${index}`,
      sortOrder: s.sortOrder ?? index,
      blockType: s.blockType as BlockType,
      config: (s.config ?? {}) as Record<string, unknown>,
    }));
  }, [hasPublishedCache, published, cmsData, page.sections, page.slug, isSectionsPending]);

  return {
    sections,
    publishRevision,
    isLoading: shouldFetchCms && isLoading,
    isSectionsPending,
  };
}

export function sectionRenderKey(
  section: LivePageSection,
  publishRevision: number,
): string {
  return `${section.id}-r${publishRevision}`;
}

export function sectionAnimationKey(pageSlug: string, section: LivePageSection): string {
  return `${pageSlug}:${section.sortOrder}`;
}
