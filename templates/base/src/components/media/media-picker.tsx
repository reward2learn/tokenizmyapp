'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VideoIcon from '@mui/icons-material/PlayCircleOutlined';
import { useListMediaQuery, type MediaAsset } from '@/store/apis/media-api';

type PickerType = 'all' | 'image' | 'video';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  /** Restrict the picker to a specific media type. */
  filterType?: 'image' | 'video';
  title?: string;
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
  filterType,
  title = 'Select Media',
}: MediaPickerProps) {
  const [type, setType] = useState<PickerType>(filterType ?? 'all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const params = {
    type: type === 'all' ? undefined : (type as 'image' | 'video'),
  };

  const { data, isLoading } = useListMediaQuery(params, { skip: !open });
  const assets = data?.success ? data.data.assets : [];

  const handleConfirm = () => {
    const selected = assets.find((a) => a.id === selectedId);
    if (selected) {
      onSelect(selected);
      setSelectedId(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedId(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {!filterType ? (
            <ToggleButtonGroup
              size="small"
              value={type}
              exclusive
              onChange={(_, v: PickerType | null) => v && setType(v)}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="image">Images</ToggleButton>
              <ToggleButton value="video">Videos</ToggleButton>
            </ToggleButtonGroup>
          ) : null}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <BrandedLoadingIndicator  />
            </Box>
          ) : assets.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
              No media assets available. Upload some first.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 1,
              }}
            >
              {assets.map((asset) => {
                const isImage = asset.mimeType.startsWith('image/');
                const isSelected = asset.id === selectedId;
                return (
                  <Paper
                    key={asset.id}
                    variant="outlined"
                    onClick={() => setSelectedId(asset.id)}
                    sx={{
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      aspectRatio: '1 / 1',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderWidth: isSelected ? 2 : 1,
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
                        <VideoIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                      </Box>
                    )}
                    {isSelected ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          color: 'primary.main',
                          bgcolor: 'common.white',
                          borderRadius: '50%',
                        }}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </Box>
                    ) : null}
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
                  </Paper>
                );
              })}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!selectedId}
          onClick={handleConfirm}
        >
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
}
