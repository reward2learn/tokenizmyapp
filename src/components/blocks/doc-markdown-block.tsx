'use client';

import Box from '@mui/material/Box';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { parseBlockConfig } from '@/lib/schemas/block-config';
import { MarkdownBody } from '@/components/blocks/markdown-body';
import { useGetDocumentQuery } from '@/store/apis/content-api';

export interface DocMarkdownBlockProps {
  config: Record<string, unknown>;
  /** Server-provided markdown skips RTK document query (review pages). */
  initialMarkdown?: string;
}

export function DocMarkdownBlock({ config, initialMarkdown }: DocMarkdownBlockProps) {
  const { source, title, markdown: configMarkdown } = parseBlockConfig('doc_markdown', config);
  // Inline markdown (server-provided or stored in the section config by the AI
  // workbook pipeline) takes precedence over the content API lookup.
  const inlineMarkdown = initialMarkdown ?? configMarkdown;
  const { data, isLoading, isError } = useGetDocumentQuery(source ?? '', {
    skip: !!inlineMarkdown || !source,
  });

  const body = inlineMarkdown ?? data?.markdown ?? '';

  return (
    <Box component="section" sx={{  mx: 'auto', px: 3, py: 5 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
          lineHeight: 1.8,
        }}
      >
        {title ? (
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 2,
              pb: 1.25,
              borderBottom: '2px solid rgba(235, 61, 40, 0.3)',
            }}
          >
            {title}
          </Typography>
        ) : null}
        {isLoading && !initialMarkdown ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <BrandedLoadingIndicator size={28} />
          </Box>
        ) : isError ? (
          <Typography variant="body1" color="text.secondary">
            Document content unavailable.
          </Typography>
        ) : !body ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No content available. Seed the database or generate content via the AI Content Generation tab.
          </Typography>
        ) : (
          <MarkdownBody markdown={body} />
        )}
      </Paper>
    </Box>
  );
}
