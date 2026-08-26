'use client';

import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useGetOrganizationBrandingQuery, useUpdateOrganizationBrandingMutation } from '@/store/apis/auth-api';

interface BrandingPanelProps {
  orgId: string;
}

/**
 * Organization branding — customize the tenant app's appearance.
 *
 * Allows uploading logo, background image/video, loading graphic, and custom CSS.
 */
export function BrandingPanel({ orgId }: BrandingPanelProps) {
  const { data: brandingData } = useGetOrganizationBrandingQuery(orgId);
  const [updateBranding, { isLoading: isUpdating }] = useUpdateOrganizationBrandingMutation();

  const [error, setError] = useState<string | null>(null);
  const [logoInput, setLogoInput] = useState('');
  const [bgImageInput, setBgImageInput] = useState('');
  const [bgVideoInput, setBgVideoInput] = useState('');
  const [loadingGraphicInput, setLoadingGraphicInput] = useState('');
  const [cssContent, setCssContent] = useState('');

  const branding = brandingData?.data || {};

  useEffect(() => {
    setCssContent(branding.customCss || '');
  }, [branding.customCss]);

  const handleLogoUpload = useCallback(async () => {
    if (!logoInput.trim()) return;
    setError(null);
    try {
      await updateBranding({ orgId, branding: { logoUrl: logoInput.trim() } }).unwrap();
      setLogoInput('');
    } catch (err) {
      setError((err as Error).message);
    }
  }, [logoInput, orgId, updateBranding]);

  const handleBgImageUpload = useCallback(async () => {
    if (!bgImageInput.trim()) return;
    setError(null);
    try {
      await updateBranding({ orgId, branding: { backgroundImageUrl: bgImageInput.trim() } }).unwrap();
      setBgImageInput('');
    } catch (err) {
      setError((err as Error).message);
    }
  }, [bgImageInput, orgId, updateBranding]);

  const handleBgVideoUpload = useCallback(async () => {
    if (!bgVideoInput.trim()) return;
    setError(null);
    try {
      await updateBranding({ orgId, branding: { backgroundVideoUrl: bgVideoInput.trim() } }).unwrap();
      setBgVideoInput('');
    } catch (err) {
      setError((err as Error).message);
    }
  }, [bgVideoInput, orgId, updateBranding]);

  const handleLoadingGraphicSave = useCallback(
    async (value: string | null) => {
      setError(null);
      try {
        await updateBranding({ orgId, branding: { loadingGraphicUrl: value } }).unwrap();
        setLoadingGraphicInput('');
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [orgId, updateBranding],
  );

  const handleLoadingGraphicFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
        await handleLoadingGraphicSave(dataUrl);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        e.target.value = '';
      }
    },
    [handleLoadingGraphicSave],
  );

  const handleCssSave = useCallback(async () => {
    setError(null);
    try {
      await updateBranding({ orgId, branding: { customCss: cssContent } }).unwrap();
    } catch (err) {
      setError((err as Error).message);
    }
  }, [cssContent, orgId, updateBranding]);


  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Typography variant="h6">Branding</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Logo */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Logo
        </Typography>
        {branding.logoUrl && (
          <Box
            component="img"
            src={branding.logoUrl}
            alt="Logo"
            sx={{ maxWidth: 200, maxHeight: 100, mb: 1, border: '1px solid', borderColor: 'divider', p: 1 }}
          />
        )}
        <TextField
          size="small"
          fullWidth
          placeholder="https://example.com/logo.png or data:image/png;base64,..."
          value={logoInput}
          onChange={(e) => setLogoInput(e.target.value)}
          disabled={isUpdating}
          slotProps={{
            input: {
              endAdornment: logoInput && (
                <Button size="small" onClick={handleLogoUpload} disabled={isUpdating}>
                  {isUpdating ? <CircularProgress size={20} /> : 'Upload'}
                </Button>
              ),
            },
          }}
        />
      </Box>

      <Divider />

      {/* Background Image */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Background Image
        </Typography>
        {branding.backgroundImageUrl && (
          <Box
            component="img"
            src={branding.backgroundImageUrl}
            alt="Background"
            sx={{ maxWidth: '100%', maxHeight: 150, mb: 1, border: '1px solid', borderColor: 'divider' }}
          />
        )}
        <TextField
          size="small"
          fullWidth
          placeholder="https://example.com/bg.jpg"
          value={bgImageInput}
          onChange={(e) => setBgImageInput(e.target.value)}
          disabled={isUpdating}
          slotProps={{
            input: {
              endAdornment: bgImageInput && (
                <Button size="small" onClick={handleBgImageUpload} disabled={isUpdating}>
                  {isUpdating ? <CircularProgress size={20} /> : 'Upload'}
                </Button>
              ),
            },
          }}
        />
      </Box>

      <Divider />

      {/* Background Video */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Background Video
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Autoplay, muted video URL. Example: https://example.com/bg.mp4
        </Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="https://example.com/bg.mp4"
          value={bgVideoInput}
          onChange={(e) => setBgVideoInput(e.target.value)}
          disabled={isUpdating}
          slotProps={{
            input: {
              endAdornment: bgVideoInput && (
                <Button size="small" onClick={handleBgVideoUpload} disabled={isUpdating}>
                  {isUpdating ? <CircularProgress size={20} /> : 'Upload'}
                </Button>
              ),
            },
          }}
        />
      </Box>

      <Divider />

      {/* Loading Graphic */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Loading Graphic
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Shown while pages and content load. Paste a URL or data URI, or upload a GIF or image.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            mb: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.default',
          }}
        >
          {branding.loadingGraphicUrl ? (
            <Box
              component="img"
              src={branding.loadingGraphicUrl}
              alt="Loading graphic preview"
              sx={{ width: 40, height: 40, objectFit: 'contain' }}
            />
          ) : (
            <CircularProgress size={40} />
          )}
        </Box>
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            component="label"
            size="small"
            startIcon={<PhotoCameraIcon />}
            disabled={isUpdating}
          >
            Upload file
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleLoadingGraphicFile}
              disabled={isUpdating}
            />
          </Button>
          {branding.loadingGraphicUrl ? (
            <Button
              size="small"
              color="inherit"
              onClick={() => void handleLoadingGraphicSave(null)}
              disabled={isUpdating}
            >
              Reset to default spinner
            </Button>
          ) : null}
        </Stack>
        <TextField
          size="small"
          fullWidth
          placeholder="https://example.com/spinner.gif or data:image/gif;base64,..."
          value={loadingGraphicInput}
          onChange={(e) => setLoadingGraphicInput(e.target.value)}
          disabled={isUpdating}
          slotProps={{
            input: {
              endAdornment: loadingGraphicInput && (
                <Button
                  size="small"
                  onClick={() => void handleLoadingGraphicSave(loadingGraphicInput.trim())}
                  disabled={isUpdating}
                >
                  {isUpdating ? <CircularProgress size={20} /> : 'Save'}
                </Button>
              ),
            },
          }}
        />
      </Box>

      <Divider />

      {/* Custom CSS */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Custom CSS
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={8}
          placeholder="/* Your custom CSS here */"
          value={cssContent}
          onChange={(e) => setCssContent(e.target.value)}
          disabled={isUpdating}
          sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={isUpdating ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            onClick={handleCssSave}
            disabled={isUpdating}
          >
            Save CSS
          </Button>
          {branding.customCss && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => {
                if (!branding.customCss) return;
                const blob = new Blob([branding.customCss], { type: 'text/css' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${orgId}-style.css`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              disabled={isUpdating}
            >
              Download CSS
            </Button>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
