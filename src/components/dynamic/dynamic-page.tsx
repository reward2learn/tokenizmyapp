'use client';

import { useLayoutEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { usePathname, useSearchParams } from 'next/navigation';
import type { AuthTier, BlockType, PageDefinition } from '@/lib/page-catalog';
import { BLOCKS_WITH_STAGGERED_CONTAINERS, getBlockComponent } from '@/lib/block-registry';
import { parseBlockConfig } from '@/lib/schemas/block-config';
import { gridSizeProps, resolveBlockGrid } from '@/lib/schemas/block-grid';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { PdfExportButton } from '@/components/ui/pdf-export-button';
import { PageInlineEditor } from '@/components/cms/page-inline-editor';
import { BlockScrollAnimate, resetBlockScrollAnimationsForRoute } from '@/components/blocks/block-scroll-animate';
import { usePublishedPageSections, sectionRenderKey, sectionAnimationKey } from '@/hooks/use-published-page-sections';
import { useAppSelector } from '@/store/hooks';

export interface DynamicPageProps {
  page: PageDefinition;
}

function DashboardSignInPrompt() {
  return <SignInPanelGate requiredTier="google" />;
}

function BlockSection({
  blockType,
  config,
  sectionKey,
  animationKey,
  animateDisabled,
}: {
  blockType: BlockType;
  config: Record<string, unknown>;
  sectionKey: string;
  animationKey: string;
  animateDisabled?: boolean;
}) {
  const Component = getBlockComponent(blockType);
  let parsed: { minTier?: AuthTier } | undefined;
  try {
    parsed = parseBlockConfig(blockType, config);
  } catch {
    parsed = undefined;
  }
  const minTier = parsed && 'minTier' in parsed ? (parsed.minTier as AuthTier | undefined) : undefined;

  const block = <Component key={sectionKey} config={config} />;
  const wrapped = (
    <BlockScrollAnimate
      animationKey={animationKey}
      animate={config.animate}
      disabled={animateDisabled}
      staggerChildren={BLOCKS_WITH_STAGGERED_CONTAINERS.has(blockType)}
    >
      {block}
    </BlockScrollAnimate>
  );

  const size = gridSizeProps(resolveBlockGrid(config.grid));

  if (!minTier || minTier === 'public') {
    return (
      <Grid key={sectionKey} size={size}>
        {wrapped}
      </Grid>
    );
  }

  return (
    <Grid key={sectionKey} size={size}>
      <AuthGate requiredTier={minTier} fallback={null}>
        {wrapped}
      </AuthGate>
    </Grid>
  );
}

export function DynamicPage({ page }: DynamicPageProps) {
  const pathname = usePathname();
  const tier = useAppSelector((s) => s.auth.tier);
  const platformAdmin = useAppSelector((s) => s.auth.platformAdmin);
  const pageEditMode = useAppSelector((s) => s.ui.pageEditMode);
  const pageEditSlug = useAppSelector((s) => s.ui.pageEditSlug);
  const searchParams = useSearchParams();
  const isPdf = searchParams.get('pdf') === '1';
  const hasGatedSection = page.sections.some((section) => {
    const configured = (section.config as { minTier?: AuthTier } | undefined)?.minTier;
    return configured === 'pin' || configured === 'google';
  });
  const showSignIn = hasGatedSection && tier === 'public';
  const inlineEdit = pageEditMode && pageEditSlug === page.slug && !isPdf;
  const { sections: liveSections, publishRevision, isSectionsPending } = usePublishedPageSections(page);

  useLayoutEffect(() => {
    if (!inlineEdit) {
      resetBlockScrollAnimationsForRoute(pathname);
    }
  }, [pathname, inlineEdit]);

  if (inlineEdit) {
    return <PageInlineEditor page={page} />;
  }

  return (
    <Box component="main" id="pdfCapture" aria-busy={isSectionsPending || undefined}>
      {!isPdf && page.pdfExport && platformAdmin ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pt: 2 }}>
          <PdfExportButton page={`/${page.slug}`} label="PDF" />
        </Box>
      ) : null}

      <Grid container spacing={0}>
        {liveSections.map((section) => (
          <BlockSection
            key={sectionRenderKey(section, publishRevision)}
            blockType={section.blockType}
            config={section.config}
            sectionKey={sectionRenderKey(section, publishRevision)}
            animationKey={sectionAnimationKey(page.slug, section)}
            animateDisabled={isPdf}
          />
        ))}
      </Grid>

      {showSignIn ? <DashboardSignInPrompt /> : null}
    </Box>
  );
}
