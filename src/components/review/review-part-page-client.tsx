'use client';

import Box from '@mui/material/Box';
import { DocMarkdownBlock } from '@/components/blocks/doc-markdown-block';
import { ReviewNav } from '@/components/review/review-nav';
import { ReviewPartInlineEditor } from '@/components/review/review-part-inline-editor';
import { reviewPartEditSlug } from '@/lib/page-route-slug';
import { useAppSelector } from '@/store/hooks';

export interface ReviewPartPageClientProps {
  partSlug: string;
  title: string;
  initialMarkdown?: string;
}

export function ReviewPartPageClient({
  partSlug,
  title,
  initialMarkdown = '',
}: ReviewPartPageClientProps) {
  const pageEditMode = useAppSelector((s) => s.ui.pageEditMode);
  const pageEditSlug = useAppSelector((s) => s.ui.pageEditSlug);
  const editSlug = reviewPartEditSlug(partSlug);
  const inlineEdit = pageEditMode && pageEditSlug === editSlug;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
        mx: 'auto',
        gap: { xs: 0, md: 2 },
      }}
    >
      <ReviewNav currentSlug={partSlug} />
      {inlineEdit ? (
        <ReviewPartInlineEditor
          partSlug={partSlug}
          title={title}
          initialMarkdown={initialMarkdown}
        />
      ) : (
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <DocMarkdownBlock
            config={{
              source: `review:${partSlug}`,
              title,
            }}
            initialMarkdown={initialMarkdown}
          />
        </Box>
      )}
    </Box>
  );
}
