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

export function usePublishedPageSections(
  page: PageDefinition,
  opts?: { fetchCms?: boolean },
): { sections: LivePageSection[]; publishRevision: number; isLoading: boolean } {
  const published = useAppSelector((s) => s.ui.publishedPageSections[page.slug]);
  const publishRevision = useAppSelector((s) => s.ui.pageSectionsRevision[page.slug] ?? 0);
  const platformAdmin = useAppSelector((s) => s.auth.platformAdmin);

  const shouldFetchCms = opts?.fetchCms ?? platformAdmin;
  const { data: cmsData, isLoading } = useGetPageSectionsQuery(
    { slug: page.slug },
    { skip: !shouldFetchCms },
  );

  const sections = useMemo(() => {
    const cms = cmsData?.data?.sections;
    const raw =
      published && published.length > 0
        ? published
        : cms && cms.length > 0
          ? cms
          : page.sections;

    return raw.map((s, index) => ({
      id: s.id ?? `${page.slug}-section-${index}`,
      sortOrder: s.sortOrder ?? index,
      blockType: s.blockType as BlockType,
      config: (s.config ?? {}) as Record<string, unknown>,
    }));
  }, [published, cmsData, page.sections, page.slug]);

  return { sections, publishRevision, isLoading: shouldFetchCms && isLoading };
}

export function sectionRenderKey(
  section: LivePageSection,
  publishRevision: number,
): string {
  return `${section.id}-r${publishRevision}`;
}
