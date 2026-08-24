'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BuildIcon from '@mui/icons-material/Build';
import type { AuthTier, BlockType, PageDefinition } from '@/lib/page-catalog';
import { resolveBlockComponent } from '@/lib/block-registry';
import { parseBlockConfig } from '@/lib/schemas/block-config';
import { gridSizeProps, resolveBlockGrid } from '@/lib/schemas/block-grid';
import { AuthGate } from '@/components/auth/auth-gate';
import { CMS_ADDABLE_BLOCKS, defaultConfigForBlock } from '@/components/cms/cms-block-catalog';
import { SectionConfigEditor } from '@/components/cms/section-config-editor';
import { BlockAnimateSettings } from '@/components/cms/block-animate-settings';
import { BlockGridSettings } from '@/components/cms/block-grid-settings';
import { BlockTypeSelect } from '@/components/cms/block-type-select';
import { migrateConfigForBlockTypeChange } from '@/lib/cms-block-type-change';
import {
  useCreatePageSectionMutation,
  useDeletePageSectionsMutation,
  useGetPageSectionsQuery,
  useProvisionCatalogPageMutation,
  useUpdatePageSectionsMutation,
} from '@/store/apis/admin-api';
import { useAppDispatch } from '@/store/hooks';
import { publishPageSections, setPageEditMode } from '@/store/ui-slice';
import { contentApi } from '@/store/apis/content-api';
import { cmsPageCacheKey, getCmsTenantAppScope } from '@shared/lib/cms-scope';  
import { DrawerResizeHandle } from '@/components/shared/drawer-resize-handle';
import { useResizableDrawerWidth } from '@/hooks/use-resizable-drawer-width';

interface SectionDraft {
  id: string;
  sortOrder: number;
  blockType: string;
  config: Record<string, unknown>;
}

function BlockPreview({
  blockType,
  config,
}: {
  blockType: string;
  config: Record<string, unknown>;
}) {
  const Component = resolveBlockComponent(blockType);
  if (!Component) {
    return (
      <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Preview not available for <strong>{blockType}</strong> in this template. Settings still save.
        </Typography>
      </Box>
    );
  }
  let parsed: { minTier?: AuthTier } | undefined;
  try {
    parsed = parseBlockConfig(blockType as BlockType, config);
  } catch {
    parsed = undefined;
  }
  const minTier = parsed && 'minTier' in parsed ? (parsed.minTier as AuthTier | undefined) : undefined;
  const block = <Component config={config} />;
  if (!minTier || minTier === 'public') return block;
  return <AuthGate requiredTier={minTier} fallback={null}>{block}</AuthGate>;
}

export interface PageInlineEditorProps {
  page: PageDefinition;
}

export function PageInlineEditor({ page }: PageInlineEditorProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cmsScope = useMemo(() => getCmsTenantAppScope(), []);
  const pageCacheKey = cmsPageCacheKey(cmsScope, page.slug);
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const { width: blockSettingsWidth, isResizing: blockSettingsResizing, onPointerDown: onBlockSettingsResize } =
    useResizableDrawerWidth({
      storageKey: 'drawer-width:block-settings',
      defaultWidth: 420,
      minWidth: 320,
      maxWidth: 720,
      anchor: 'right',
      enabled: isSmUp,
    });
  const { data, isLoading, error, refetch } = useGetPageSectionsQuery({ slug: page.slug, ...cmsScope });
  const [provisionPage, { isLoading: provisioning }] = useProvisionCatalogPageMutation();
  const [updateSections, { isLoading: saving }] = useUpdatePageSectionsMutation();
  const [createSection, { isLoading: creating }] = useCreatePageSectionMutation();
  const [deleteSections, { isLoading: deleting }] = useDeletePageSectionsMutation();

  const [drafts, setDrafts] = useState<SectionDraft[]>([]);
  const [dirty, setDirty] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addBlockType, setAddBlockType] = useState<string>('faq');
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'info'; text: string } | null>(null);

  const cmsSections = data?.data?.sections;
  const contentLocked = data?.data?.contentLocked ?? false;
  const pageLoaded = data?.data !== undefined;

  useEffect(() => {
    if (!cmsSections) return;
    setDrafts(
      cmsSections.map((s) => ({
        id: s.id,
        sortOrder: s.sortOrder,
        blockType: s.blockType,
        config: s.config,
      })),
    );
    setDirty(false);
  }, [cmsSections]);

  const editingSection = useMemo(
    () => drafts.find((s) => s.id === editingId) ?? null,
    [drafts, editingId],
  );

  const previewSections = useMemo(() => {
    if (drafts.length > 0) return drafts;
    return page.sections.map((s, index) => ({
      id: s.id ?? `preview-${index}`,
      sortOrder: s.sortOrder ?? index,
      blockType: s.blockType,
      config: s.config,
    }));
  }, [drafts, page.sections]);

  const exitEditMode = useCallback(() => {
    dispatch(setPageEditMode({ enabled: false, slug: null }));
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    if (cmsSections) {
      setDrafts(
        cmsSections.map((s) => ({
          id: s.id,
          sortOrder: s.sortOrder,
          blockType: s.blockType,
          config: s.config,
        })),
      );
    }
    setDirty(false);
    setEditingId(null);
    exitEditMode();
  }, [cmsSections, exitEditMode]);

  const handleSave = useCallback(async () => {
    if (drafts.length === 0) {
      setMessage({ severity: 'info', text: 'No sections to save for this page.' });
      return;
    }
    const sectionsPayload = drafts.map((s, i) => ({
      id: s.id,
      blockType: s.blockType,
      config: s.config,
      sortOrder: i,
    }));
    try {
      await updateSections({
        slug: page.slug,
        ...cmsScope,
        sections: sectionsPayload,
      }).unwrap();

      // Publish immediately so the live view updates when edit mode is toggled off.
      dispatch(
        publishPageSections({
          slug: page.slug,
          cacheKey: pageCacheKey,
          sections: sectionsPayload.map((s) => ({
            id: s.id,
            sortOrder: s.sortOrder,
            blockType: s.blockType,
            config: s.config,
          })),
        }),
      );

      for (const s of sectionsPayload) {
        if (s.blockType === 'doc_markdown') {
          const source = s.config.source;
          if (typeof source === 'string' && source.length > 0) {
            dispatch(contentApi.util.invalidateTags([{ type: 'Document', id: source }]));
          }
        }
      }
      dispatch(contentApi.util.invalidateTags(['Document']));

      setDirty(false);
      setMessage({ severity: 'success', text: 'Page content saved and published.' });
      await refetch();
      router.refresh();
    } catch (err) {
      setMessage({
        severity: 'error',
        text: err instanceof Error ? err.message : 'Failed to save page content',
      });
    }
  }, [cmsScope, drafts, dispatch, page.slug, pageCacheKey, refetch, router, updateSections]);

  const updateDraftConfig = useCallback((id: string, config: Record<string, unknown>) => {
    setDrafts((prev) => prev.map((s) => (s.id === id ? { ...s, config } : s)));
    setDirty(true);
  }, []);

  const changeEditingBlockType = useCallback(
    (nextBlockType: string) => {
      if (!editingSection || editingSection.blockType === nextBlockType) return;
      const confirmed = window.confirm(
        `Switch this block from "${editingSection.blockType}" to "${nextBlockType}"? ` +
          'Layout and access tier are preserved; type-specific settings reset.',
      );
      if (!confirmed) return;
      setDrafts((prev) =>
        prev.map((s) =>
          s.id === editingSection.id
            ? {
                ...s,
                blockType: nextBlockType,
                config: migrateConfigForBlockTypeChange(s.blockType, nextBlockType, s.config),
              }
            : s,
        ),
      );
      setDirty(true);
    },
    [editingSection],
  );

  const moveSection = useCallback((index: number, dir: -1 | 1) => {
    const next = index + dir;
    setDrafts((prev) => {
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const tmp = copy[index];
      copy[index] = copy[next];
      copy[next] = tmp;
      return copy.map((d, i) => ({ ...d, sortOrder: i }));
    });
    setDirty(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Delete this block from the page?')) return;
      setMessage(null);
      try {
        await deleteSections({ slug: page.slug, ids: [id], ...cmsScope }).unwrap();
        setDrafts((prev) => prev.filter((s) => s.id !== id));
        if (editingId === id) setEditingId(null);
        setMessage({ severity: 'success', text: 'Block deleted.' });
        await refetch();
        router.refresh();
      } catch (err) {
        setMessage({
          severity: 'error',
          text: err instanceof Error ? err.message : 'Failed to delete block',
        });
      }
    },
    [cmsScope, deleteSections, editingId, page.slug, refetch, router],
  );

  const handleAdd = useCallback(async () => {
    setMessage(null);
    try {
      await createSection({
        slug: page.slug,
        ...cmsScope,
        blockType: addBlockType,
        config: defaultConfigForBlock(addBlockType),
      }).unwrap();
      setMessage({ severity: 'success', text: `Added ${addBlockType} block.` });
      await refetch();
      router.refresh();
    } catch (err) {
      setMessage({
        severity: 'error',
        text: err instanceof Error ? err.message : 'Failed to add block',
      });
    }
  }, [addBlockType, cmsScope, createSection, page.slug, refetch, router]);

  const handleProvision = useCallback(async () => {
    setMessage(null);
    try {
      await provisionPage({ slug: page.slug, ...cmsScope }).unwrap();
      setMessage({ severity: 'success', text: 'Page initialized for CMS editing.' });
      await refetch();
      router.refresh();
    } catch (err) {
      setMessage({
        severity: 'error',
        text: err instanceof Error ? err.message : 'Failed to initialize page for CMS',
      });
    }
  }, [cmsScope, page.slug, provisionPage, refetch, router]);

  const pageNotInCms =
    Boolean(error) &&
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status: number }).status === 404;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error || !pageLoaded) {
    return (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Alert severity="error">
          {pageNotInCms
            ? 'This page is not in the CMS database yet. Initialize it to enable inline editing.'
            : 'Could not load page sections for editing. Use Admin → Page Content for catalog-only pages.'}
        </Alert>
        {pageNotInCms ? (
          <Button
            variant="contained"
            startIcon={provisioning ? <CircularProgress size={18} color="inherit" /> : <BuildIcon />}
            onClick={handleProvision}
            disabled={provisioning}
          >
            Initialize page for CMS editing
          </Button>
        ) : null}
        {message ? <Alert severity={message.severity}>{message.text}</Alert> : null}
        <Button variant="outlined" onClick={handleCancel}>Exit edit mode</Button>
      </Stack>
    );
  }

  return (
    <Box component="main" id="pdfCapture">
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
        <Chip label="Editing page" color="primary" size="small" />
        <Typography variant="body2" sx={{ flex: 1, minWidth: 120 }}>
          {page.title}
        </Typography>
        {contentLocked ? <Chip label="CMS locked" size="small" variant="outlined" /> : null}
        {dirty ? <Chip label="Unsaved order/config" size="small" color="warning" /> : null}
        <Button size="small" startIcon={<CloseIcon />} onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
          disabled={!dirty || saving}
          onClick={() => void handleSave()}
        >
          Save & publish
        </Button>
      </Paper>

      {message ? (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mx: 2, mb: 1 }}>
          {message.text}
        </Alert>
      ) : null}

      <Box sx={{ px: 1, pb: 4 }}>
        {previewSections.length === 0 ? (
          <Alert severity="info" sx={{ mx: 1, mb: 2 }}>
            This page has no blocks yet. Add one below.
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          {previewSections.map((section, index) => (
            <Grid
              key={section.id}
              size={gridSizeProps(resolveBlockGrid(section.config.grid))}
              sx={{
                position: 'relative',
                outline: '2px dashed',
                outlineColor: editingId === section.id ? 'primary.main' : 'divider',
                outlineOffset: 4,
                borderRadius: 1,
              }}
            >
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                  p: 0.25,
                }}
              >
                <Tooltip title="Move up">
                  <span>
                    <IconButton
                      size="small"
                      aria-label="Move block up"
                      disabled={index === 0}
                      onClick={() => moveSection(index, -1)}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Move down">
                  <span>
                    <IconButton
                      size="small"
                      aria-label="Move block down"
                      disabled={index === previewSections.length - 1}
                      onClick={() => moveSection(index, 1)}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Edit block settings">
                  <IconButton
                    size="small"
                    aria-label={`Edit ${section.blockType} block`}
                    onClick={() => setEditingId(section.id)}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete block">
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Delete ${section.blockType} block`}
                      disabled={deleting}
                      onClick={() => void handleDelete(section.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <Chip
                label={section.blockType}
                size="small"
                sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}
              />
              <BlockPreview
                blockType={section.blockType}
                config={section.config}
              />
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'right', pr: 1, pb: 0.5 }}>
                #{index + 1}
              </Typography>
            </Grid>
          ))}
        </Grid>

        <Paper variant="outlined" sx={{ mx: 1, mt: 2, p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
            <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel id="inline-add-block">Add block</InputLabel>
              <Select
                labelId="inline-add-block"
                label="Add block"
                value={addBlockType}
                onChange={(e) => setAddBlockType(e.target.value)}
              >
                {CMS_ADDABLE_BLOCKS.map((bt) => (
                  <MenuItem key={bt} value={bt}>{bt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={creating ? <CircularProgress size={14} /> : <AddIcon />}
              disabled={creating}
              onClick={() => void handleAdd()}
            >
              Add block
            </Button>
          </Stack>
        </Paper>
      </Box>

      <Drawer
        anchor="right"
        open={editingSection !== null}
        onClose={() => setEditingId(null)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: blockSettingsWidth },
              p: 2,
              transition: blockSettingsResizing ? 'none' : undefined,
            },
          },
        }}
      >
        {isSmUp ? <DrawerResizeHandle anchor="right" onPointerDown={onBlockSettingsResize} /> : null}
        {editingSection ? (
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Block settings</Typography>
              <IconButton aria-label="Close block settings" onClick={() => setEditingId(null)}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <BlockTypeSelect
              value={editingSection.blockType}
              onChange={changeEditingBlockType}
            />
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <Stack spacing={2}>
                <BlockAnimateSettings
                  config={editingSection.config}
                  onChange={(config) => updateDraftConfig(editingSection.id, config)}
                />
                <BlockGridSettings
                  config={editingSection.config}
                  blockType={editingSection.blockType}
                  onChange={(config) => updateDraftConfig(editingSection.id, config)}
                />
                <SectionConfigEditor
                  blockType={editingSection.blockType}
                  config={editingSection.config}
                  pageSlug={page.slug}
                  pageTitle={page.title}
                  tenantSlug={cmsScope.tenantSlug}
                  appId={cmsScope.appId}
                  onChange={(config) => updateDraftConfig(editingSection.id, config)}
                />
              </Stack>
            </Box>
            <Button variant="contained" onClick={() => setEditingId(null)}>
              Done
            </Button>
          </Stack>
        ) : null}
      </Drawer>
    </Box>
  );
}
