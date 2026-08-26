'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import VideoIcon from '@mui/icons-material/PlayCircleOutlined';
import {
  useListMediaQuery,
  useDeleteMediaMutation,
  type MediaAsset,
} from '@/store/apis/media-api';

type FilterType = 'all' | 'image' | 'video';

interface MediaGalleryProps {
  /** Initial filter type. */
  defaultType?: FilterType;
  /** Called when a media asset is clicked (optional). */
  onSelect?: (asset: MediaAsset) => void;
}

export function MediaGallery({ defaultType = 'all', onSelect }: MediaGalleryProps) {
  const [type, setType] = useState<FilterType>(defaultType);
  const [tag, setTag] = useState('');
  const [preview, setPreview] = useState<MediaAsset | null>(null);

  const params = {
    type: type === 'all' ? undefined : (type as 'image' | 'video'),
    tag: tag.trim() || undefined,
  };

  const { data, isLoading, isError, refetch } = useListMediaQuery(params);
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();

  const assets = data?.success ? data.data.assets : [];

  const handleDelete = async (e: React.MouseEvent, asset: MediaAsset) => {
    e.stopPropagation();
    try {
      const result = await deleteMedia(asset.id).unwrap();
      if (!result.success) throw new Error(result.error ?? 'Delete failed');
    } catch (err) {
      console.error('[media-gallery] delete failed:', err);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <BrandedLoadingIndicator  />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            size="small"
            value={type}
            exclusive
            onChange={(_, v: FilterType | null) => v && setType(v)}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="image">Images</ToggleButton>
            <ToggleButton value="video">Videos</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            size="small"
            label="Filter by tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            sx={{ minWidth: 180 }}
          />
          <Box sx={{ flex: 1 }} />
          <Button size="small" variant="text" onClick={() => refetch()}>Refresh</Button>
        </Stack>
      </Paper>

      {isError ? <Alert severity="error">Failed to load media.</Alert> : null}
      {!isError && assets.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
          No media assets found. Upload some images or videos to get started.
        </Typography>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 1.5,
        }}
      >
        {assets.map((asset) => {
          const isImage = asset.mimeType.startsWith('image/');
          return (
            <Paper
              key={asset.id}
              variant="outlined"
              onClick={() => (onSelect ? onSelect(asset) : setPreview(asset))}
              sx={{
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '1 / 1',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              {isImage ? (
                <Box
                  component="img"
                  src={asset.thumbnailUrl ?? asset.url}
                  alt={asset.altText ?? asset.filename}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.200',
                  }}
                >
                  <VideoIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                </Box>
              )}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 0.5,
                  bgcolor: 'rgba(0,0,0,0.55)',
                  color: 'common.white',
                }}
              >
                <Typography variant="caption" noWrap sx={{ display: 'block' }}>
                  {asset.filename}
                </Typography>
              </Box>
              {isImage ? (
                <Box sx={{ position: 'absolute', top: 4, left: 4 }}>
                  <ImageIcon sx={{ fontSize: 16, color: 'common.white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }} />
                </Box>
              ) : null}
              <IconButton
                size="small"
                onClick={(e) => handleDelete(e, asset)}
                disabled={isDeleting}
                aria-label="Delete media"
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'common.white',
                  '&:hover': { bgcolor: 'error.main' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          );
        })}
      </Box>

      {assets.length > 0 ? (
        <Typography variant="caption" color="text.secondary">
          {assets.length} asset{assets.length === 1 ? '' : 's'}
        </Typography>
      ) : null}

      {/* ── Full-size preview dialog ─────────────────── */}
      <Dialog
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        maxWidth="md"
        fullWidth
      >
        {preview ? (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 6 }}>
              <Typography variant="subtitle1" component="span" noWrap>{preview.filename}</Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                {preview.mimeType.startsWith('image/') ? (
                  <Box
                    component="img"
                    src={preview.url}
                    alt={preview.altText ?? preview.filename}
                    sx={{ width: '100%', borderRadius: 1, objectFit: 'contain' }}
                  />
                ) : (
                  <Box
                    component="video"
                    src={preview.url}
                    controls
                    playsInline
                    sx={{ width: '100%', borderRadius: 1, bgcolor: 'common.black' }}
                  />
                )}
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip label={preview.mimeType} size="small" variant="outlined" />
                  <Chip label={preview.storage} size="small" variant="outlined" />
                  <Chip label={`${(preview.size / 1024).toFixed(0)} KB`} size="small" variant="outlined" />
                  {preview.tags.map((t) => (
                    <Chip key={t} label={t} size="small" color="primary" variant="outlined" />
                  ))}
                </Stack>
              </Stack>
            </DialogContent>
          </>
        ) : null}
      </Dialog>
    </Stack>
  );
}
