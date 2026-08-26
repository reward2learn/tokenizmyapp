'use client';

import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  useListContentPagesQuery,
  useCreateContentPageMutation,
  useUpdateContentPageMutation,
  useDeleteContentPageMutation,
  type ContentPage,
} from '@/store/apis/content-page-api';

const SLUG_REGEX = /^[a-z0-9-]+$/;

interface EditorState {
  slug: string;
  title: string;
  body: string;
  format: 'html' | 'markdown';
  isPublished: boolean;
  isNew: boolean;
}

const EMPTY_EDITOR: EditorState = {
  slug: '',
  title: '',
  body: '',
  format: 'html',
  isPublished: true,
  isNew: true,
};

export function ContentPageEditor() {
  const { data, isLoading, isError, refetch } = useListContentPagesQuery();
  const [createPage, { isLoading: isCreating }] = useCreateContentPageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdateContentPageMutation();
  const [deletePage, { isLoading: isDeleting }] = useDeleteContentPageMutation();

  const [editor, setEditor] = useState<EditorState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (data?.success === false) {
      setError(data.error ?? 'Failed to load content pages');
    } else {
      setError(null);
    }
  }, [data]);

  const openCreate = useCallback(() => {
    setEditor({ ...EMPTY_EDITOR });
    setDeleteConfirm(false);
    setError(null);
    setSuccess(false);
  }, []);

  const openEdit = useCallback((page: ContentPage) => {
    setEditor({
      slug: page.slug,
      title: page.title,
      body: page.body,
      format: (page.format === 'markdown' ? 'markdown' : 'html'),
      isPublished: page.isPublished,
      isNew: false,
    });
    setDeleteConfirm(false);
    setError(null);
    setSuccess(false);
  }, []);

  const closeEditor = useCallback(() => {
    setEditor(null);
    setDeleteConfirm(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editor) return;
    setError(null);
    setSuccess(false);

    if (!editor.slug.trim() || !SLUG_REGEX.test(editor.slug.trim())) {
      setError('Slug must be lowercase kebab-case (a-z, 0-9, hyphens).');
      return;
    }
    if (!editor.title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      if (editor.isNew) {
        const result = await createPage({
          slug: editor.slug.trim(),
          title: editor.title.trim(),
          body: editor.body,
          format: editor.format,
          isPublished: editor.isPublished,
        }).unwrap();
        if (!result.success) throw new Error(result.error ?? 'Create failed');
      } else {
        const result = await updatePage({
          slug: editor.slug,
          data: {
            title: editor.title.trim(),
            body: editor.body,
            format: editor.format,
            isPublished: editor.isPublished,
          },
        }).unwrap();
        if (!result.success) throw new Error(result.error ?? 'Update failed');
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      closeEditor();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [editor, createPage, updatePage, closeEditor]);

  const handleDelete = useCallback(async () => {
    if (!editor || editor.isNew) return;
    setError(null);
    try {
      const result = await deletePage(editor.slug).unwrap();
      if (!result.success) throw new Error(result.error ?? 'Delete failed');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      closeEditor();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [editor, deletePage, closeEditor]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <BrandedLoadingIndicator  />
      </Box>
    );
  }

  const pages = data?.success ? data.data.pages : [];

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Legal &amp; Content Pages
          </Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate}>
            New Page
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage legal pages (Terms, Privacy) and any custom content. Pages are served publicly
          when published. The seeded &quot;terms&quot; and &quot;privacy&quot; slugs power the public
          /terms and /privacy routes.
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert> : null}
        {success ? <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>Saved.</Alert> : null}
        {isError ? <Alert severity="error" sx={{ mb: 2 }}>Failed to load content pages.</Alert> : null}

        {pages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No content pages yet. Click &quot;New Page&quot; to create one.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Slug</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pages.map((p: ContentPage) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{p.slug}</TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>
                    <Chip label={p.format} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    {p.isPublished ? (
                      <Chip label="published" size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                    ) : (
                      <Chip label="draft" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                  </TableCell>
                  <TableCell>{new Date(p.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => openEdit(p)} aria-label="Edit page">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Box sx={{ mt: 2 }}>
          <Button size="small" variant="text" onClick={() => refetch()}>Refresh</Button>
        </Box>
      </Paper>

      {/* ── Editor dialog ────────────────────────────── */}
      <Dialog open={Boolean(editor)} onClose={closeEditor} maxWidth="md" fullWidth>
        <DialogTitle>
          {editor?.isNew ? 'New Content Page' : `Edit — ${editor?.slug ?? ''}`}
        </DialogTitle>
        {editor ? (
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 0.5 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
                <TextField
                  label="Slug"
                  value={editor.slug}
                  onChange={(e) => setEditor((p) => p ? { ...p, slug: e.target.value } : p)}
                  placeholder="terms"
                  helperText={editor.isNew ? 'Lowercase kebab-case. Used in the public URL.' : 'Slug cannot be changed after creation.'}
                  disabled={!editor.isNew}
                  fullWidth
                  size="small"
                />
                <TextField
                  select
                  label="Format"
                  value={editor.format}
                  onChange={(e) => setEditor((p) => p ? { ...p, format: e.target.value as 'html' | 'markdown' } : p)}
                  size="small"
                  sx={{ minWidth: 160 }}
                  slotProps={{ select: { native: true } }}
                >
                  <option value="html">html</option>
                  <option value="markdown">markdown</option>
                </TextField>
              </Stack>

              <TextField
                label="Title"
                value={editor.title}
                onChange={(e) => setEditor((p) => p ? { ...p, title: e.target.value } : p)}
                placeholder="Terms of Service"
                fullWidth
              />

              <TextField
                label="Body"
                value={editor.body}
                onChange={(e) => setEditor((p) => p ? { ...p, body: e.target.value } : p)}
                multiline
                minRows={14}
                maxRows={24}
                fullWidth
                helperText={editor.format === 'html' ? 'Raw HTML body.' : 'Markdown body.'}
                sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={editor.isPublished}
                    onChange={(e) => setEditor((p) => p ? { ...p, isPublished: e.target.checked } : p)}
                  />
                }
                label="Published (visible publicly)"
              />
            </Stack>
          </DialogContent>
        ) : null}
        <DialogActions>
          {editor && !editor.isNew && deleteConfirm ? (
            <Button color="error" variant="contained" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? 'Deleting…' : 'Confirm delete'}
            </Button>
          ) : null}
          {editor && !editor.isNew && !deleteConfirm ? (
            <Button color="error" variant="text" startIcon={<DeleteIcon />} onClick={() => setDeleteConfirm(true)}>
              Delete
            </Button>
          ) : null}
          <Box sx={{ flex: 1 }} />
          <Button onClick={closeEditor}>Cancel</Button>
          <Button
            variant="contained"
            disabled={isCreating || isUpdating}
            onClick={handleSave}
            startIcon={isCreating || isUpdating ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          >
            {isCreating || isUpdating ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
