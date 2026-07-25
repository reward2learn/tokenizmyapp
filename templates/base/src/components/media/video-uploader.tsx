'use client';

import { useCallback, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type { MediaAsset } from '@/store/apis/media-api';

interface VideoUploaderProps {
  onUploaded?: (asset: MediaAsset) => void;
}

interface ProgressState {
  filename: string;
  loaded: number;
  total: number;
  percent: number;
  error: string | null;
}

const VIDEO_ACCEPT = 'video/*';

export function VideoUploader({ onUploaded }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [altText, setAltText] = useState('');

  const uploadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('video/')) {
        setError(`"${file.name}" is not a video.`);
        return;
      }

      setError(null);
      setAsset(null);
      setProgress({ filename: file.name, loaded: 0, total: file.size, percent: 0, error: null });

      const formData = new FormData();
      formData.append('file', file);
      if (altText.trim()) formData.append('altText', altText.trim());

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/media/upload');

      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgress((p) =>
          p ? { ...p, loaded: e.loaded, total: e.total, percent } : p,
        );
      };

      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && json.success) {
            setAsset(json.data.asset);
            onUploaded?.(json.data.asset);
            setProgress(null);
          } else {
            const msg = json.error ?? `Upload failed (${xhr.status})`;
            setProgress((p) => (p ? { ...p, error: msg } : p));
          }
        } catch {
          setProgress((p) => (p ? { ...p, error: 'Invalid response from server' } : p));
        }
      };

      xhr.onerror = () => {
        setProgress((p) => (p ? { ...p, error: 'Network error during upload' } : p));
      };

      xhr.send(formData);
    },
    [altText, onUploaded],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile],
  );

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Alt text / description (optional)"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="e.g. Venue tour walkthrough"
            size="small"
            fullWidth
          />

          <Box
            onClick={() => !progress && inputRef.current?.click()}
            sx={{
              p: 4,
              textAlign: 'center',
              cursor: progress ? 'wait' : 'pointer',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept={VIDEO_ACCEPT}
              hidden
              onChange={handleFileChange}
            />
            <Stack sx={{ alignItems: 'center', gap: 1 }}>
              <CloudUploadIcon color="action" sx={{ fontSize: 36 }} />
              <Typography variant="body2" color="text.secondary">
                {progress ? `Uploading ${progress.filename}…` : 'Click to select a video file'}
              </Typography>
            </Stack>
          </Box>

          {progress ? (
            <Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5, gap: 1 }}>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {progress.filename}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {progress.percent}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress.percent}
                color={progress.error ? 'error' : 'primary'}
              />
              {progress.error ? (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {progress.error}
                </Alert>
              ) : null}
            </Box>
          ) : null}
        </Stack>
      </Paper>

      {asset ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Uploaded video
          </Typography>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              component="a"
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                wordBreak: 'break-all',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {asset.filename}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {(asset.size / (1024 * 1024)).toFixed(2)} MB · {asset.mimeType} · {asset.storage}
          </Typography>
        </Paper>
      ) : null}
    </Stack>
  );
}
