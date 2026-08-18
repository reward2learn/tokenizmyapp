'use client';

import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ClearIcon from '@mui/icons-material/Clear';
import { useAppSelector } from '@/store/hooks';

interface AvatarUploadProps {
  avatarUrl: string | undefined;
  onUpload: (url: string) => Promise<void>;
  onClear: () => Promise<void>;
}

/**
 * Upload a custom avatar — either via URL or file (base64 data URI).
 *
 * The auth provider's picture is the default. This allows overriding it with a
 * custom image, which might be desirable on sign-in if the provider has no
 * picture or if the user prefers a different one.
 */
export function AvatarUpload({ avatarUrl, onUpload, onClear }: AvatarUploadProps) {
  const { user } = useAppSelector((s) => s.auth);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setError(null);

      try {
        // Convert to base64 data URI
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          await onUpload(dataUrl);
          setUrlInput('');
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setUploading(false);
      }
    },
    [onUpload],
  );

  const handleUrlUpload = useCallback(async () => {
    if (!urlInput.trim()) return;
    setUploading(true);
    setError(null);
    try {
      await onUpload(urlInput.trim());
      setUrlInput('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }, [urlInput, onUpload]);

  const handleClear = useCallback(async () => {
    setUploading(true);
    setError(null);
    try {
      await onClear();
      setUrlInput('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }, [onClear]);

  const displayUrl = avatarUrl || user?.picture;

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Avatar</Typography>

      {/* Current avatar preview */}
      {displayUrl && (
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: 2,
            backgroundImage: `url(${displayUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
          }}
        >
          {avatarUrl && (
            <Tooltip title="Remove custom avatar">
              <IconButton
                size="small"
                onClick={handleClear}
                disabled={uploading}
                sx={{
                  position: 'absolute',
                  bottom: -12,
                  right: -12,
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                  '&:hover': { bgcolor: 'error.dark' },
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {/* Upload options */}
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button variant="outlined" component="label" size="small" startIcon={<PhotoCameraIcon />}>
            {uploading ? <CircularProgress size={20} /> : 'Upload file'}
            <input type="file" hidden accept="image/*" onChange={handleFileSelect} disabled={uploading} />
          </Button>
          <Typography variant="caption" color="text.secondary">
            or paste URL / base64
          </Typography>
        </Stack>

        <TextField
          size="small"
          placeholder="https://... or data:image/png;base64,..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          disabled={uploading}
          slotProps={{
            input: {
              endAdornment: urlInput && (
                <Button size="small" onClick={handleUrlUpload} disabled={uploading}>
                  {uploading ? <CircularProgress size={20} /> : 'Upload'}
                </Button>
              ),
            },
          }}
        />
      </Stack>

      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}

      <Typography variant="caption" color="text.secondary">
        If set, your custom avatar overrides the one from your sign-in provider. Leave empty to use the provider's image.
      </Typography>
    </Stack>
  );
}
