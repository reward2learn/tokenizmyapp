'use client';

import { useMemo } from 'react';
import type { BlockType, PageDefinition } from '@/lib/page-catalog';
import { useGetPageSectionsQuery } from '@/store/apis/admin-api';
import { useAppSelector } from '@/store/hooks';
import { cmsPageCacheKey, getCmsTenantAppScope } from '@shared/lib/cms-scope';

export interface LivePageSection {
  id: string;
  sortOrder: number;
  blockType: BlockType;
  config: Record<string, unknown>;
}

/**
 * Resolved sections for the live (non-edit) page view.
 * Priority: Redux publish cache → CMS API → server page prop.
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
  const cmsScope = useMemo(() => getCmsTenantAppScope(), []);
  const pageCacheKey = cmsPageCacheKey(cmsScope, page.slug);
  const published = useAppSelector((s) => s.ui.publishedPageSections[pageCacheKey]);
  const publishRevision = useAppSelector((s) => s.ui.pageSectionsRevision[pageCacheKey] ?? 0);
  const platformAdmin = useAppSelector((s) => s.auth.platformAdmin);

  const shouldFetchCms = Boolean(opts?.fetchCms ?? platformAdmin);
  const hasPublishedCache = Boolean(published && published.length > 0);
  const serverLooksLikeCatalogOnly =
    page.sections.length > 0 && page.sections.every((s) => !s.id);
  const { data: cmsData, isLoading, isFetching } = useGetPageSectionsQuery(
    { slug: page.slug, tenantSlug: cmsScope.tenantSlug, appId: cmsScope.appId },
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

/** Stable key so blocks remount when published CMS config changes. */
export function sectionRenderKey(
  section: LivePageSection,
  publishRevision: number,
): string {
  return `${section.id}-r${publishRevision}`;
}

/** Stable across catalog → CMS id changes (sort order is the slot on the page). */
export function sectionAnimationKey(pageSlug: string, section: LivePageSection): string {
  return `${pageSlug}:${section.sortOrder}`;
}
