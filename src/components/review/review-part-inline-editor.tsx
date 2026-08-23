'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { CmsAiTextField } from '@/components/cms/cms-ai-text-field';
import { CmsEditorProvider } from '@/components/cms/cms-editor-context';
import { MarkdownBody } from '@/components/blocks/markdown-body';
import { reviewPartEditSlug } from '@/lib/page-route-slug';
import { useAppDispatch } from '@/store/hooks';
import { setPageEditMode } from '@/store/ui-slice';
import { useUpdateReviewPartMutation } from '@/store/apis/content-api';

export interface ReviewPartInlineEditorProps {
  partSlug: string;
  title: string;
  initialMarkdown: string;
}

export function ReviewPartInlineEditor({
  partSlug,
  title: initialTitle,
  initialMarkdown,
}: ReviewPartInlineEditorProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error'; text: string } | null>(null);
  const [updateReviewPart, { isLoading: saving }] = useUpdateReviewPartMutation();

  const editSlug = reviewPartEditSlug(partSlug);
  const cmsConfig = useMemo(() => ({ title, markdown }), [title, markdown]);

  const exitEditMode = useCallback(() => {
    dispatch(setPageEditMode({ enabled: false, slug: null }));
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    setTitle(initialTitle);
    setMarkdown(initialMarkdown);
    setDirty(false);
    setMessage(null);
    exitEditMode();
  }, [exitEditMode, initialMarkdown, initialTitle]);

  const handleSave = useCallback(async () => {
    setMessage(null);
    try {
      await updateReviewPart({ partSlug, markdown, title }).unwrap();
      setDirty(false);
      setMessage({ severity: 'success', text: 'Review part saved.' });
      router.refresh();
    } catch (err) {
      setMessage({
        severity: 'error',
        text: err instanceof Error ? err.message : 'Failed to save review part',
      });
    }
  }, [markdown, partSlug, router, title, updateReviewPart]);

  return (
    <CmsEditorProvider
      value={{
        pageSlug: editSlug,
        pageTitle: title,
        blockType: 'review_part',
        config: cmsConfig,
      }}
    >
    <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: 52,
          zIndex: 10,
          mx: 2,
          mt: 2,
          mb: 1,
          px: 2,
          py: 1.25,
          border: '1px solid',
          borderColor: 'primary.main',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Chip label="Editing review part" color="primary" size="small" />
        <Typography variant="body2" sx={{ flex: 1, minWidth: 120 }}>
          {title}
        </Typography>
        {dirty ? <Chip label="Unsaved changes" size="small" color="warning" /> : null}
        <Button size="small" startIcon={<CloseIcon />} onClick={handleCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving || !dirty}
        >
          Save
        </Button>
      </Paper>

      {message ? (
        <Alert severity={message.severity} sx={{ mx: 2, mb: 1 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2,
          px: 3,
          py: 2,
        }}
      >
        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Edit ({editSlug})
            </Typography>
            <CmsAiTextField
              label="title"
              fieldKey="title"
              size="small"
              fullWidth
              value={title}
              onChange={(v) => {
                setTitle(v);
                setDirty(true);
              }}
            />
            <CmsAiTextField
              label="markdown"
              fieldKey="markdown"
              fieldType="markdown"
              size="small"
              fullWidth
              multiline
              minRows={18}
              value={markdown}
              onChange={(v) => {
                setMarkdown(v);
                setDirty(true);
              }}
              helperText="Markdown body stored in business_review_parts"
            />
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
            lineHeight: 1.8,
            maxHeight: { lg: 'calc(100vh - 180px)' },
            overflow: 'auto',
          }}
        >
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
          {markdown.trim() ? (
            <MarkdownBody markdown={markdown} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Preview will appear here as you type.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
    </CmsEditorProvider>
  );
}
