'use client';

import { useCallback, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import type { MediaAsset } from '@/store/apis/media-api';

interface ImageUploaderProps {
  /** Called after each successful upload. */
  onUploaded?: (asset: MediaAsset) => void;
  /** Allow selecting multiple files at once. */
  multiple?: boolean;
  /** Optional existing assets to show alongside new uploads. */
  initialAssets?: MediaAsset[];
}

interface UploadState {
  filename: string;
  progress: number;
  error: string | null;
  previewUrl: string;
}

const IMAGE_ACCEPT = 'image/*';
const MAX_PREVIEW = 12;

export function ImageUploader({ onUploaded, multiple = true, initialAssets = [] }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not an image.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const slot: UploadState = { filename: file.name, progress: 0, error: null, previewUrl };
      setUploads((prev) => [...prev, slot]);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error ?? `Upload failed (${res.status})`);
        }

        setAssets((prev) => [json.data.asset, ...prev].slice(0, MAX_PREVIEW));
        onUploaded?.(json.data.asset);
        setUploads((prev) => prev.filter((u) => u !== slot));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setUploads((prev) =>
          prev.map((u) => (u === slot ? { ...u, error: msg, progress: 100 } : u)),
        );
      } finally {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [onUploaded],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);
      const list = Array.from(files);
      if (!multiple) {
        void uploadFile(list[0]);
        return;
      }
      for (const f of list) void uploadFile(f);
    },
    [uploadFile, multiple],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const dismissUpload = useCallback((slot: UploadState) => {
    setUploads((prev) => prev.filter((u) => u !== slot));
  }, []);

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}

      <Paper
        variant="outlined"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: dragOver ? 'primary.main' : 'divider',
          bgcolor: dragOver ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple={multiple}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Stack sx={{ alignItems: 'center', gap: 1 }}>
          <CloudUploadIcon color="action" sx={{ fontSize: 40 }} />
          <Typography variant="body2" color="text.secondary">
            Drag &amp; drop images here, or click to browse
          </Typography>
        </Stack>
      </Paper>

      {uploads.length > 0 ? (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Uploading…
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {uploads.map((u) => (
              <Box
                key={u.previewUrl}
                sx={{
                  position: 'relative',
                  width: 96,
                  height: 96,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  component="img"
                  src={u.previewUrl}
                  alt={u.filename}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
                />
                {u.error ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'error.main',
                      color: 'error.contrastText',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissUpload(u);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress size={28} />
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}

      {assets.length > 0 ? (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Uploaded ({assets.length})
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {assets.map((asset) => (
              <Box
                key={asset.id}
                sx={{
                  position: 'relative',
                  width: 96,
                  height: 96,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  component="img"
                  src={asset.thumbnailUrl ?? asset.url}
                  alt={asset.altText ?? asset.filename}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAsset(asset.id);
                  }}
                  aria-label="Remove image"
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
}
